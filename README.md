# JobSnipeAI

Unified n8n workflow for LinkedIn job scraping + AI enrichment.

This repo now uses a single importable workflow:

- `workflows/job_snipe_ai_master_unified.json`

No sub-workflow IDs are required.

## What It Does

- Receives Google Form submission via webhook
- Builds Apify LinkedIn job payload from form fields
- Runs Apify actor asynchronously and polls for completion
- Normalizes returned jobs into a flat schema
- Filters jobs by country
- Deduplicates and tracks jobs in Google Sheets
- Scores jobs with OpenAI (`Message a model` nodes)
- Generates resume tweak suggestions and referral coldmail
- Writes run summary metrics to `SummarizationRuns`

## Architecture

```text
Google Form -> Webhook
  -> Run Init + SummarizationRuns(start)
  -> Apify Run + Poll
  -> Normalize + Filter + Dedupe
  -> JobsMasterTracker + ProcessedJobs upserts
  -> OpenAI scoring/tweaks/coldmail
  -> SummarizationRuns(end)
```

## Prerequisites

- Docker + Docker Compose
- n8n + PostgreSQL running from `docker-compose.yml`
- Google Sheets OAuth2 credential in n8n
- OpenAI credential in n8n
- Apify account/token + actor ID

## One-Time Setup

1. Configure [`.env`](.env) with real values.
2. Ensure `n8n` service loads env vars:
   - `env_file: - .env`
3. Ensure env access from expressions is allowed:
   - `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`
4. Recreate n8n after env/compose changes:
   - `docker compose up -d --force-recreate n8n`

## Import and Configure in n8n

1. Import:
   - `workflows/job_snipe_ai_master_unified.json`
2. Open each Google Sheets node and assign Google credential.
3. Open each `Message a model - ...` node and assign OpenAI credential.
4. Select `modelId` in each OpenAI node.
5. Activate the unified workflow.

## Google Sheets Required Tabs

Create one spreadsheet (or separate ones if desired) with tabs:

- `JobsMasterTracker`
- `ProcessedJobs`
- `SummarizationRuns`

Schema reference:

- [docs/implementation/google_sheets_schema.md](docs/implementation/google_sheets_schema.md)

## Critical n8n UI Fix (Append or Update nodes)

For every Google Sheets node using `Append or Update`, set **Column to Match On**:

- `Write SummarizationRuns Start` -> `run_id`
- `Write SummarizationRuns End` -> `run_id`
- `Upsert JobsMasterTracker` -> `job_id`
- `Update JobsMasterTracker AI Fields` -> `job_id`
- `Update Low Match Status` -> `job_id`
- `Upsert ProcessedJobs` -> `hash`

If you skip this, you will get:

- `The 'Column to Match On' parameter is required`

## Webhook Endpoint

- `POST /webhook/jobsnipe/google-form-submit`

If testing locally, expose n8n publicly (cloud tunnel/ngrok) so Google Apps Script can call webhook.

Google Forms setup guide:

- [docs/implementation/google_forms_trigger_setup.md](docs/implementation/google_forms_trigger_setup.md)

## Environment Variables Used

- `GSHEET_TRACKER_ID`
- `APIFY_TOKEN`
- `APIFY_ACTOR_ID`
- `AI_MATCH_THRESHOLD`
- `COUNTRY_FILTER_DEFAULT`
- `COLDMAIL_SALUTATION`
- `RESUME_MASTER_PROFILE`
- `RESUME_LATEX_FULL`

Template:

- [docs/implementation/.env.job_snipe_ai.example](docs/implementation/.env.job_snipe_ai.example)

## Troubleshooting

### `No Respond to Webhook node found in the workflow`

In Webhook node:

- Set `Respond` to `Immediately`, or
- Keep `Using Respond to Webhook node` and ensure `Respond to Webhook` node is connected in the same execution path.

### `access to env vars denied`

Set container env:

- `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`

Then recreate n8n container.

### Google Sheets ID/expression not resolving

1. Verify env exists inside container:
   - `docker exec -it n8n env | grep -E "GSHEET_TRACKER_ID|APIFY_TOKEN"`
2. In node fields use expressions:
   - `{{$env.GSHEET_TRACKER_ID}}`

### OpenAI nodes fail

- Ensure OpenAI credential is attached.
- Ensure `modelId` is selected in each `Message a model` node.

## Security

- `.env` is gitignored; do not commit secrets.
- Rotate keys if exposed.
