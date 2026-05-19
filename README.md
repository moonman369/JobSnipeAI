# JobSnipeAI

Production-style, modular n8n automation for LinkedIn job discovery and AI-assisted application ops.

Core capabilities:

- Config-driven job search (Google Sheets or Google Form submission)
- Apify LinkedIn Jobs scraping (async run + polling + dataset fetch)
- Normalization, country filtering, and deduplication
- Google Sheets tracking system (`JobsMasterTracker`, `ProcessedJobs`, `SummarizationRuns`)
- OpenAI-powered job scoring, resume tweak suggestions, and referral coldmail generation

## Architecture

```text
Google Form submit
  -> WF-00 Trigger Entry (webhook)
  -> WF-05 Master Orchestrator
  -> WF-01 Config Ingestion (form config or sheet fallback)
  -> WF-02 Apify Async Scrape
  -> WF-03 Normalize + Filter + Dedupe + Tracking
  -> WF-04 AI Enrichment (OpenAI Message a model nodes)
  -> SummarizationRuns update
```

## Repository Layout

```text
workflows/modular/         # Importable n8n modular workflow JSONs
modules/function_nodes/    # Version-controlled JS logic references
prompts/                   # Versioned AI prompt templates
schemas/                   # JSON schemas for normalized and AI outputs
docs/implementation/       # Setup docs, env example, sheet schemas
```

## Workflows

- `00_google_forms_trigger_entry.json`: Webhook entry for Google Form submissions.
- `01_job_config_ingestion.json`: Builds Apify payload from form data or `JobSearchConfigs`.
- `02_apify_scrape_async.json`: Starts actor run, polls status, fetches dataset items.
- `03_normalize_filter_dedupe_track.json`: Flattens job data, filters by country, upserts tracking sheets.
- `04_ai_resume_coldmail.json`: Uses OpenAI router nodes (`@n8n/n8n-nodes-langchain.openAi`) for scoring/tweaks/coldmail.
- `05_orchestrator_master.json`: Orchestrates WF-01 -> WF-04 and run summaries.

## Prerequisites

- Docker + Docker Compose
- Running n8n + PostgreSQL via `docker-compose.yml`
- Google OAuth credentials in n8n for Google Sheets
- Apify token + actor ID
- OpenAI credential configured in n8n (for Message a model nodes)

## Quick Start

1. Configure env values in [`.env`](.env).
2. Ensure `docker-compose.yml` `n8n` service loads env (`env_file: .env`).
3. Start services:
   - `docker compose up -d`
4. Import modular workflows in n8n:
   1. `01_job_config_ingestion.json`
   2. `02_apify_scrape_async.json`
   3. `03_normalize_filter_dedupe_track.json`
   4. `04_ai_resume_coldmail.json`
   5. `05_orchestrator_master.json`
   6. `00_google_forms_trigger_entry.json`
5. Replace workflow IDs in:
   - `05` (`Execute 01/02/03/04 ...`)
   - `00` (`Execute 05 Orchestrator`)
6. Attach credentials:
   - Google Sheets OAuth2 nodes
   - OpenAI credentials on all `Message a model` nodes
7. Pick model manually in each OpenAI node (`modelId` is intentionally blank in JSON for UI selection).
8. Activate workflows (`00` and `05` at minimum for form-triggered runs).

## Google Sheets Setup

Create these tabs before first run:

- `JobSearchConfigs`
- `JobsMasterTracker`
- `ProcessedJobs`
- `SummarizationRuns`

Schema details:

- [google_sheets_schema.md](docs/implementation/google_sheets_schema.md)

## Google Forms Trigger Setup

Google Forms does not directly call webhooks, so use Apps Script in the response sheet to POST to:

- `/webhook/jobsnipe/google-form-submit`

Step-by-step + script:

- [google_forms_trigger_setup.md](docs/implementation/google_forms_trigger_setup.md)

## Environment Variables

Primary variables used by workflows:

- `GSHEET_JOB_CONFIGS_ID`
- `GSHEET_TRACKER_ID`
- `APIFY_TOKEN`
- `APIFY_ACTOR_ID`
- `AI_MATCH_THRESHOLD`
- `COUNTRY_FILTER_DEFAULT`
- `FORCE_REPROCESS`
- `COLDMAIL_SALUTATION`
- `RESUME_MASTER_PROFILE`
- `RESUME_LATEX_FULL`

Reference template:

- [.env.job_snipe_ai.example](docs/implementation/.env.job_snipe_ai.example)

## OpenAI Usage

The active modular AI workflow uses dedicated OpenAI router nodes:

- Node type: `@n8n/n8n-nodes-langchain.openAi`
- Node label pattern: `Message a model - ...`

No raw HTTP LLM calls are used in `workflows/modular/04_ai_resume_coldmail.json`.

## Operational Notes

- One form submit triggers one orchestration run (subject to webhook retries/replays).
- Dedup priority: `job_id` -> normalized `job_url` -> composite hash.
- AI stage is gated by `AI_MATCH_THRESHOLD`.
- Tracker updates are upsert-style to preserve status progression.

## Troubleshooting

### Error: `access to env vars denied`

Set in n8n container env:

- `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`

Then recreate n8n container.

### Workflows execute but AI nodes fail

- Open each OpenAI node and confirm:
  - OpenAI credential selected
  - model selected in `modelId`

### Google Form submits but no n8n run

- Verify Apps Script trigger is `On form submit`
- Verify webhook URL is reachable from Google (use public URL/tunnel for local n8n)
- Confirm workflow `00_Google_Forms_Trigger_Entry` is active

## Security

- Never commit live secrets; `.env` is gitignored.
- Rotate any API keys that were ever exposed in logs/chats/screenshots.
- Prefer secret managers for production.

## Extended Documentation

- [n8n_job_ops_platform.md](docs/implementation/n8n_job_ops_platform.md)
- [workflows/modular/README.md](workflows/modular/README.md)
