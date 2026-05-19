# JobSnipeAI Modular n8n Workflows

Import order:

1. `01_job_config_ingestion.json`
2. `02_apify_scrape_async.json`
3. `03_normalize_filter_dedupe_track.json`
4. `04_ai_resume_coldmail.json`
5. `05_orchestrator_master.json`
6. `00_google_forms_trigger_entry.json`

Notes:

- These workflows are intentionally modular and connected with `Execute Workflow` / `Execute Workflow Trigger`.
- Configure credentials and sheet IDs after import.
- Reusable JS used in `Code` nodes is also stored in `/modules/function_nodes` for version control.
- Prompt templates are in `/prompts` and should be loaded in `Code` nodes or HTTP payload builders.
- `00_google_forms_trigger_entry.json` is the new main entrypoint for Google Form submissions and calls orchestrator `05`.
