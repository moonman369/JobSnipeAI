function parseBool(v, d = false) {
  if (v === undefined || v === null || v === "") return d;
  if (typeof v === "boolean") return v;
  return String(v).trim().toLowerCase() === "true";
}

function parseIntSafe(v, d = 25) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
}

function parseCsv(v) {
  if (!v) return [];
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildPayload(row) {
  return {
    company: parseCsv(row.company_list),
    easyApply: parseBool(row.easy_apply, false),
    employmentType: parseCsv(row.employment_type),
    experienceLevel: parseCsv(row.experience_levels),
    industryIds: parseCsv(row.industry_ids),
    jobTitles: parseCsv(row.job_titles),
    locations: parseCsv(row.locations),
    maxItems: parseIntSafe(row.max_items, 25),
    under10Applicants: parseBool(row.under_10_applicants, false),
    workplaceType: parseCsv(row.workplace_types)
  };
}

module.exports = {
  parseBool,
  parseIntSafe,
  parseCsv,
  buildPayload
};
