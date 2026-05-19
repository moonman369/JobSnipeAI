# Google Sheets Schema

Use one spreadsheet (`GSHEET_TRACKER_ID`) with these tabs.

## `JobSearchConfigs`

| column | type | notes |
|---|---|---|
| enabled | boolean/string | `true` rows are executed |
| search_name | string | logical search key |
| company_list | string | comma-separated |
| job_titles | string | comma-separated |
| locations | string | comma-separated |
| industry_ids | string | comma-separated LinkedIn industry IDs |
| employment_type | string | comma-separated (`full-time`, etc.) |
| experience_levels | string | comma-separated |
| workplace_types | string | comma-separated (`remote`, `hybrid`, `office`) |
| easy_apply | boolean/string | maps to scraper input |
| under_10_applicants | boolean/string | maps to scraper input |
| max_items | number | max scrape items |
| country_filter | string | default `IN` |
| created_at | datetime | source audit |
| updated_at | datetime | source audit |

## `JobsMasterTracker`

| column | type |
|---|---|
| job_id | string |
| title | string |
| company | string |
| location | string |
| country | string |
| workplace_type | string |
| experience_level | string |
| posted_date | string |
| job_url | string |
| job_status | enum (`NEW`,`REVIEWED`,`APPLIED`,`REJECTED`,`INTERVIEW`,`OFFER`,`ARCHIVED`) |
| date_created | datetime |
| date_reviewed | datetime |
| date_applied | datetime |
| date_rejected | datetime |
| interview_stage | string |
| followup_required | boolean |
| referral_requested | boolean |
| referral_response | string |
| ai_match_score | number |
| ai_match_reason | string/json |
| ai_resume_tweaks | string/json |
| ai_coldmail | string |
| processing_version | string |
| processed_for_ai | boolean |
| processed_for_resume | boolean |
| processed_for_coldmail | boolean |
| summarization_cycle_id | string |

## `ProcessedJobs`

| column | type |
|---|---|
| job_id | string |
| linkedin_url | string |
| hash | string |
| first_seen | datetime |
| last_seen | datetime |
| processing_status | string |

## `SummarizationRuns`

| column | type |
|---|---|
| run_id | string |
| started_at | datetime |
| completed_at | datetime |
| jobs_scraped | number |
| jobs_filtered | number |
| jobs_added | number |
| jobs_rejected | number |
| ai_processed | number |
| failures | number |
| notes | string |
