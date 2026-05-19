function pick(...values) {
  return values.find((v) => v !== undefined && v !== null && v !== "");
}

function toArray(v) {
  return Array.isArray(v) ? v : [];
}

function stringArray(v) {
  return toArray(v)
    .map((x) => (typeof x === "string" ? x : JSON.stringify(x)))
    .filter(Boolean);
}

function normalizeJob(j, context = {}) {
  const linkedinUrl = pick(j.jobUrl, j.link, j.url, "");
  const jobIdFromUrl = (linkedinUrl.match(/currentJobId=(\d+)/) || [])[1];
  const parsed = j.locationParsed || j.parsed || {};

  return {
    job_id: pick(j.jobId, j.id, jobIdFromUrl, ""),
    title: pick(j.title, j.jobTitle, ""),
    company_name: pick(j.companyName, j.company?.name, ""),
    company_linkedin: pick(j.companyUrl, j.company?.linkedinUrl, ""),
    company_website: pick(j.companyWebsite, j.company?.website, ""),
    location_text: pick(j.location, j.formattedLocation, ""),
    country: pick(j.countryCode, parsed.countryCode, parsed.country, ""),
    state: pick(parsed.state, parsed.region, ""),
    city: pick(parsed.city, ""),
    workplace_type: pick(j.workplaceType, ""),
    employment_type: pick(j.employmentType, ""),
    experience_level: pick(j.experienceLevel, ""),
    posted_date: pick(j.postedDate, j.postedAt, ""),
    expiry_date: pick(j.expireAt, j.expiryDate, ""),
    applicant_count: pick(j.applicantCount, j.applicationsCount, ""),
    job_url: linkedinUrl,
    easy_apply_url: pick(j.applyUrl, j.easyApplyUrl, ""),
    description: pick(j.description, j.descriptionText, ""),
    salary_text: pick(j.salary, j.salaryText, ""),
    industries: stringArray(j.industries),
    job_functions: stringArray(j.jobFunctions),
    company_size: pick(j.company?.size, j.companySize, ""),
    company_followers: pick(j.company?.followers, j.companyFollowers, ""),
    apply_method_type: pick(j.applyMethodType, ""),
    ats_system: pick(j.ats, j.atsSystem, ""),
    scraped_at: new Date().toISOString(),
    actor_run_id: context.actor_run_id || "",
    dataset_id: context.dataset_id || "",
    search_name: context.search_name || "",
    raw_json: j
  };
}

module.exports = { normalizeJob };
