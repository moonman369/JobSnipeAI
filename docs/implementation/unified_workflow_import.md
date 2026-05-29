# Unified Workflow Import

Use this file for one-shot import:

- `workflows/job_snipe_ai_master_unified.json`

## Required post-import setup

1. Set Google Sheets credential on all Google Sheets nodes.
2. Set OpenAI credential on all `Message a model - ...` nodes.
3. Pick model in each OpenAI node (`modelId` is blank by design).
4. Ensure env vars are loaded in n8n container:
   - `GSHEET_TRACKER_ID`
   - `APIFY_TOKEN`
   - `APIFY_ACTOR_ID`
   - `AI_MATCH_THRESHOLD`
   - `COUNTRY_FILTER_DEFAULT`
   - `RESUME_MASTER_PROFILE`
   - `RESUME_LATEX_FULL`
   - `COLDMAIL_SALUTATION`
5. Activate workflow.

## Webhook endpoint

- `POST /webhook/jobsnipe/google-form-submit`

This unified workflow removes all sub-workflow `Execute Workflow` dependencies.
