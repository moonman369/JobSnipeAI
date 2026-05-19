function newRunSummary(executionId) {
  const now = new Date();
  return {
    run_id: `run_${now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}_${executionId}`,
    started_at: now.toISOString(),
    completed_at: "",
    jobs_scraped: 0,
    jobs_filtered: 0,
    jobs_added: 0,
    jobs_rejected: 0,
    ai_processed: 0,
    failures: 0,
    notes: "started"
  };
}

function finalizeRun(summary, patch = {}) {
  return {
    ...summary,
    ...patch,
    completed_at: new Date().toISOString()
  };
}

module.exports = { newRunSummary, finalizeRun };
