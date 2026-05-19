const COUNTRY_MAP = {
  INDIA: "IN",
  IN: "IN",
  USA: "US",
  "UNITED STATES": "US",
  US: "US"
};

const INDIA_LOCATION_REGEX =
  /\b(india|bengaluru|bangalore|hyderabad|pune|gurgaon|noida|mumbai|delhi|chennai|kolkata)\b/i;

function normalizeCountry(rawCountry, locationText) {
  const code = COUNTRY_MAP[String(rawCountry || "").trim().toUpperCase()] || String(rawCountry || "").trim().toUpperCase();
  if (!code && INDIA_LOCATION_REGEX.test(String(locationText || ""))) return "IN";
  return code;
}

function applyCountryFilter(job, targetCountry = "IN") {
  const effectiveCountry = normalizeCountry(job.country, job.location_text);
  const accepted = effectiveCountry === String(targetCountry || "IN").toUpperCase();

  return {
    ...job,
    country: effectiveCountry,
    is_rejected: !accepted,
    filter_stage: "country_filter",
    filter_reason: accepted ? "accepted" : `country_mismatch:${effectiveCountry || "unknown"}`
  };
}

module.exports = {
  applyCountryFilter,
  normalizeCountry
};
