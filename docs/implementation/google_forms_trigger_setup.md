# Google Forms -> n8n Trigger Setup

This replaces schedule-based triggering.

## 1) Import and wire workflows

1. Import `workflows/modular/05_orchestrator_master.json` and `workflows/modular/00_google_forms_trigger_entry.json`.
2. In `00_Google_Forms_Trigger_Entry`, set `Execute 05 Orchestrator.workflowId` to the real workflow ID of `05_JobSnipeAI_Master_Orchestrator`.
3. In `05_JobSnipeAI_Master_Orchestrator`, set:
   - `Execute 01 Ingestion.workflowId`
   - `Execute 02 Apify.workflowId`
   - `Execute 03 Normalize+Track.workflowId`
   - `Execute 04 AI.workflowId`

## 2) Google Form expected fields

Use these exact field names in the form (recommended):

- `search_name`
- `company_list`
- `job_titles`
- `locations`
- `industry_ids`
- `employment_type`
- `experience_levels`
- `workplace_types`
- `easy_apply`
- `under_10_applicants`
- `max_items`
- `country_filter`

Comma-separated fields:

- `company_list`, `job_titles`, `locations`, `industry_ids`, `employment_type`, `experience_levels`, `workplace_types`

## 3) Connect Google Form to n8n webhook

Google Forms does not natively POST webhook payloads, so use Apps Script.

1. Open the Form-linked response spreadsheet.
2. Extensions -> Apps Script.
3. Add script below and set `WEBHOOK_URL`.
4. Create trigger:
   - Function: `onFormSubmit`
   - Event source: `From spreadsheet`
   - Event type: `On form submit`

```javascript
const WEBHOOK_URL = "https://<your-n8n-domain>/webhook/jobsnipe/google-form-submit";

function onFormSubmit(e) {
  const row = e.namedValues || {};

  const payload = {
    search_name: first(row["search_name"]),
    company_list: first(row["company_list"]),
    job_titles: first(row["job_titles"]),
    locations: first(row["locations"]),
    industry_ids: first(row["industry_ids"]),
    employment_type: first(row["employment_type"]),
    experience_levels: first(row["experience_levels"]),
    workplace_types: first(row["workplace_types"]),
    easy_apply: first(row["easy_apply"]),
    under_10_applicants: first(row["under_10_applicants"]),
    max_items: first(row["max_items"]),
    country_filter: first(row["country_filter"])
  };

  UrlFetchApp.fetch(WEBHOOK_URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}

function first(v) {
  if (!v) return "";
  if (Array.isArray(v)) return v[0] || "";
  return String(v);
}
```

## 4) Test flow

1. Activate both workflows:
   - `00_Google_Forms_Trigger_Entry`
   - `05_JobSnipeAI_Master_Orchestrator`
2. Submit one test form response.
3. Verify:
   - webhook execution in `00`
   - run record in `SummarizationRuns`
   - job outputs in `JobsMasterTracker`
