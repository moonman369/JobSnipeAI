function simpleHash(input) {
  const s = String(input || "");
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return String(Math.abs(h));
}

function buildDedupeKeys(job) {
  const url = String(job.job_url || "").trim().toLowerCase();
  const composite = [
    String(job.title || "").trim().toLowerCase(),
    String(job.company_name || "").trim().toLowerCase(),
    String(job.location_text || "").trim().toLowerCase()
  ].join("|");

  return {
    job_id: String(job.job_id || "").trim(),
    linkedin_url: url,
    hash: simpleHash(composite)
  };
}

function applyProcessingFlags(job) {
  return {
    ...job,
    job_status: "NEW",
    processing_version: "v1",
    processed_for_ai: false,
    processed_for_resume: false,
    processed_for_coldmail: false,
    date_created: new Date().toISOString(),
    date_reviewed: "",
    date_applied: "",
    date_rejected: ""
  };
}

module.exports = {
  buildDedupeKeys,
  applyProcessingFlags
};
