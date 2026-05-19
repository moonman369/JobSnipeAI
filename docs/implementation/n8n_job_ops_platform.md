# JobSnipeAI n8n Platform Design

## 1) Architecture

```text
Google Form Submission
  -> WF-00 Google Forms Trigger Entry (Webhook)
  -> WF-05 Master Orchestrator
  -> WF-01 Config Ingestion (direct form config or sheet fallback)
  -> WF-02 Apify Async Run + Poll + Dataset Fetch
  -> WF-03 Normalize + Country Filter + Dedupe + Tracker Upsert
  -> WF-04 AI Scoring + Resume Tweaks + Coldmail + State Update
  -> SummarizationRuns Update
```

Future storage split:

- Current: Google Sheets as operational DB.
- Next: Postgres for canonical storage + Sheets as reporting surface.
- Later: Vector DB (Qdrant/Pinecone/Supabase pgvector) for semantic retrieval.

## 2) Workflow Inventory

- `workflows/modular/01_job_config_ingestion.json`
- `workflows/modular/02_apify_scrape_async.json`
- `workflows/modular/03_normalize_filter_dedupe_track.json`
- `workflows/modular/04_ai_resume_coldmail.json`
- `workflows/modular/05_orchestrator_master.json`
- `workflows/modular/00_google_forms_trigger_entry.json`

## 3) Node-Level Implementation

### WF-01 `01_Job_Config_Ingestion`

1. `Schedule Trigger`: periodic start.
2. `Read JobSearchConfigs`: fetch config rows from Google Sheets.
3. `Parse Enabled Rows`: parse comma-separated arrays, booleans, and max items.
4. `Build Apify Payload`: map config to actor input schema.

Output per item:

```json
{
  "search_name": "java_india_remote",
  "country_filter": "IN",
  "apify_payload": { "company": [], "jobTitles": [], "...": "..." },
  "execution_timestamp": "2026-05-18T00:00:00.000Z"
}
```

### WF-02 `02_Apify_Scrape_Async`

1. `Execute Workflow Trigger`: input from orchestration.
2. `Start Actor Run`: async actor run (`waitForFinish=0`).
3. `Extract Run Metadata`: persist `actor_run_id`, `dataset_id`.
4. `Wait 20s` + `Get Run Status`: poll loop.
5. `Run Finished?`: loop until terminal state.
6. `Was Success?`: split success vs dead-letter.
7. `Fetch Dataset Items`: retrieve dataset rows.
8. `Prepare Output`: attach context and raw jobs.
9. `Dead Letter Event`: failure payload for retries/alerts.

### WF-03 `03_Normalize_Filter_Dedupe_Track`

1. `Normalize Jobs`: flatten nested job objects to target schema.
2. `Country Filter`: keep configured country, attach `filter_stage`/`filter_reason`.
3. `Keep Accepted`: reject non-country-matching jobs.
4. `Generate Dedupe Keys`: `job_id`, URL key, and composite hash fallback.
5. `Upsert JobsMasterTracker`: insert/update tracking records.
6. `Upsert ProcessedJobs`: maintain dedupe memory table.

### WF-04 `04_AI_Resume_Coldmail`

1. `Build AI Scoring Prompt`: include JD + resume profile + scoring constraints.
2. `Call LLM Job Scoring`: strict JSON output.
3. `Parse Score JSON`: defensive parsing.
4. `Pass Threshold?`: gate by `AI_MATCH_THRESHOLD`.
5. `Build Resume+Coldmail Prompt`: targeted tweak prompt + coldmail prompt.
6. `Call LLM Resume Tweaks`: strict JSON suggestions only.
7. `Call LLM Coldmail`: plain-text outreach.
8. `Merge AI Outputs`: set state flags and cycle ID.
9. `Update JobsMasterTracker AI Fields`: persist AI outputs.

### WF-05 `05_JobSnipeAI_Master_Orchestrator`

1. `Schedule Trigger`: system entrypoint.
2. `Init Run`: generate run ID + counters.
3. `Write SummarizationRuns Start`: open run record.
4. Sequential `Execute Workflow` chain for WF-01 to WF-04.
5. `Finalize Run` + `Write SummarizationRuns End`.

## 4) Deduplication Strategy

Priority keys:

1. `job_id` from LinkedIn.
2. normalized `job_url`.
3. fallback hash of `title|company|location`.

Rules:

- If any key matches in `ProcessedJobs`, skip AI stage.
- Update `last_seen` on repeats.
- Respect `FORCE_REPROCESS=true` to bypass skip.

## 5) Error Handling Strategy

- HTTP node retries enabled with backoff (`maxTries`, `waitBetweenTries`).
- Poll loop with terminal-state check for Apify run.
- Dead-letter branch for `FAILED`/`ABORTED` states.
- JSON parse fallback in AI outputs to avoid hard crashes.
- Run-level metrics table (`SummarizationRuns`) for auditability.

Recommended next hardening:

1. Add dedicated `DeadLetter` sheet with payload snapshots.
2. Add Telegram/Slack alert node on dead-letter branch.
3. Add max poll attempts to prevent infinite waits.

## 6) Required Credentials

- Google Sheets OAuth2 credential (`googleSheetsOAuth2Api`).
- Apify token from env (`APIFY_TOKEN`).
- OpenAI key in env (`OPENAI_API_KEY`).

## 7) Docker Notes

Keep n8n and env in Docker compose (already present in repo). Add job-ops vars from:

- `docs/implementation/.env.job_snipe_ai.example`

Production recommendations:

1. Move secrets to Docker secrets or secret manager.
2. Enable queue mode and external DB (PostgreSQL).
3. Configure execution pruning and log retention.

## 8) Prompt/Logic Versioning

- Prompts:
  - `prompts/job_scoring/v1.md`
  - `prompts/resume_tweaks/v1.md`
  - `prompts/coldmail/v1.md`
- Function-node logic:
  - `modules/function_nodes/*.js`
- Schemas:
  - `schemas/*.schema.json`

This isolates AI behavior and makes migration to RAG or different LLM providers low-risk.

## 9) Performance Controls

- Batch by config/search row rather than per single HTTP call.
- Gate AI by threshold to reduce tokens.
- Avoid repeat Sheets writes; use upsert with stable keys.
- Keep raw scraped payload in object storage later (S3/GCS/MinIO) and store references in tracker.

## 10) Future Expansion Path

1. Replace Sheets tracker writes with Postgres upserts.
2. Add embeddings pipeline on accepted jobs (`description`, `title`, `company`).
3. Build recruiter intelligence layer from company/hiring metadata.
4. Add optional auto-apply branch after human approval.
5. Add resume PDF render step from LaTeX + targeted tweak set.
