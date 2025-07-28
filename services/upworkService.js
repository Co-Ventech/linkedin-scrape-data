const axios = require('axios');
const fs = require('fs');
const path = require('path');

const defaultInput = {
    age: 24,
    category: [
        "qa-testing",
        "ai-machine-learning",
        "web-development",
        "mobile-development",
        "other-software-development",
        "desktop-application-development",
        "ecommerce-development",
        "web-mobile-software-dev"
    ],
    contract_to_hire: false,
    dev_dataset_clear: true,
    dev_no_strip: false,
    fixed: true,
    hourly: true,
    "includes.attachments": false,
    "includes.history": false,
    limit: 100,
    location: [
        "United States",
        "United Kingdom",
        "Saudia Arabia",
        "United Arab Emirates",
        "Europe"
    ],
    no_hires: false,
    payment_verified: false,
    previous_clients: false,
    sort: "newest",
    tier: ["2", "3", "1"]
};

exports.fetchUpworkJobs = async (input) => {
    const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
    const url = `https://api.apify.com/v2/acts/jupri~upwork/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;

    try {
        // POST input to Apify API
        const response = await axios.post(url, input, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // The response data is the array of items
        const items = response.data;

        // Save to file
        const filePath = path.join(__dirname, '../data/upwork_jobs_raw.json');
        fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf-8');

        return { items, count: items.length };
    } catch (error) {
        console.error('Error fetching or saving jobs:', error.message);
        throw error;
    }
};



// Allowed and European countries
const ALLOWED_COUNTRIES = [
  "United States",
  "United Kingdom",
  "Saudia Arabia",
  "United Arab Emirates",
  "Europe",
  "USA", // United States
  "GBR", // United Kingdom
  "SAU", // Saudia Arabia
  "ARE", // United Arab Emirates
  // "Europe" is a region, not a code
];

const EUROPEAN_COUNTRIES = [
  "Albania", "Andorra", "Armenia", "Austria", "Azerbaijan", "Belarus", "Belgium", "Bosnia and Herzegovina",
  "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Georgia",
  "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Kazakhstan", "Kosovo", "Latvia", "Liechtenstein",
  "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia","Macedonia",
  "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain",
  "Sweden", "Switzerland", "Turkey", "Ukraine", "United Kingdom", "Vatican City","ALB", "AND", "ARM", "AUT", "AZE", "BLR", "BEL", "BIH",
  "BGR", "HRV", "CYP", "CZE", "DNK", "EST", "FIN", "FRA", "GEO",
  "DEU", "GRC", "HUN", "ISL", "IRL", "ITA", "KAZ", "XKX", "LVA", "LIE",
  "LTU", "LUX", "MLT", "MDA", "MCO", "MNE", "NLD", "MKD",
  "NOR", "POL", "PRT", "ROU", "RUS", "SMR", "SRB", "SVK", "SVN", "ESP",
  "SWE", "CHE", "TUR", "UKR", "VAT"
];

// Helper to check allowed country
function isAllowedCountry(country) {
    // If country is missing or empty, KEEP the job
    if (!country) return true;
    const normalized = country.trim().toUpperCase();
    // Check in allowed countries (names and codes)
    if (ALLOWED_COUNTRIES.map(c => c.toUpperCase()).includes(normalized)) return true;
    // If "Europe" is allowed, check in European countries (names and codes)
    if (ALLOWED_COUNTRIES.map(c => c.toUpperCase()).includes("EUROPE")) {
      if (EUROPEAN_COUNTRIES.map(c => c.toUpperCase()).includes(normalized)) return true;
    }
    return false;
  }
// Normalization function
function normalizeJob(job) {
  return {
    jobId: job.id,
    title: job.title,
    description: job.description,
    isContractToHire: job.isContractToHire,
    isPaymentMethodVerified: job.isPaymentMethodVerified,
    level: job.level,
    contractorTier: job.contractorTier,
    companyId: job.buyer?.company?.companyId || null,
    companyIndustry: job.buyer?.company?.profile?.industry || null,
    companyContractDate: job.buyer?.company?.contractDate || null,
    buyerScore: job.buyer?.stats?.score ?? null,
    buyerTotalAssignments: job.buyer?.stats?.totalAssignments ?? null,
    buyerTotalJobsWithHires: job.buyer?.stats?.totalJobsWithHires ?? null,
    buyerActiveAssignmentsCount: job.buyer?.stats?.activeAssignmentsCount ?? null,
    buyerFeedbackCount: job.buyer?.stats?.feedbackCount ?? null,
    buyerOpenJobsCount: job.buyer?.jobs?.openCount ?? null,
    buyerPostedJobsCount: job.buyer?.jobs?.postedCount ?? null,
    buyerAvgHourlyRate: job.buyer?.avgHourlyJobsRate?.amount ?? null,
    minHourlyRate: job.hourly?.min ?? null,
    maxHourlyRate: job.hourly?.max ?? null,
    hourlyType: job.hourly?.type ?? null,
    hourlyWeeks: job.hourly?.duration?.weeks ?? null,
    tags: Array.isArray(job.tags) ? job.tags : [],
    skills: Array.isArray(job.skills) ? job.skills.map(s => s.name) : [],
    minHoursWeek: job.qualifications?.minHoursWeek ?? null,
    lastBuyerActivity: job.clientActivity?.lastBuyerActivity ?? null,

    // Additional fields for business value
    city: job.buyer?.location?.city || null,
    country: job.buyer?.location?.country || null,
    countryTimezone: job.buyer?.location?.countryTimezone || null,
    utcOffsetMillis: job.buyer?.location?.offsetFromUtcMillis ?? null,
    companyName: job.buyer?.company?.name || null,
    companySize: job.buyer?.company?.profile?.size ?? null,
    companyIsEDCReplicated: job.buyer?.company?.isEDCReplicated ?? null,
    clientTotalHours: job.buyer?.stats?.hoursCount ?? null,
    clientTotalSpend: job.buyer?.stats?.totalCharges?.amount ?? null,
    clientRisingTalent: job.buyer?.stats?.risingTalent ?? null,
    category: job.category?.name || null,
    categoryGroup: job.categoryGroup?.name || null,
    occupation: job.occupation?.prefLabel || null,
    jobType: job.type || null,
    fixedBudget: job.fixed?.budget?.amount ?? null,
    fixedDurationLabel: job.fixed?.duration?.label || null,
    numberOfPositionsToHire: job.numberOfPositionsToHire ?? null,
    premium: job.premium ?? null,
    openJobs: job.openJobs ?? [],
    questions: job.questions ?? [],
    status: job.status || null,
    url: job.url || null,
    qualificationsCountries: job.qualifications?.countries ?? null,
    qualificationsLanguages: job.qualifications?.languages ?? null,
    qualificationsMinJobSuccessScore: job.qualifications?.minJobSuccessScore ?? null,
    qualificationsRisingTalent: job.qualifications?.risingTalent ?? null,
    qualificationsLocationCheckRequired: job.qualifications?.locationCheckRequired ?? null,
    ts_create: job.ts_create || null,
    ts_publish: job.ts_publish || null,
    ts_sourcing: job.ts_sourcing || null
  };
}

exports.filterAndDeduplicateUpworkJobs = () => {
  const inputPath = path.join(__dirname, '../data/upwork_jobs_raw.json');
  const outputPath = path.join(__dirname, '../data/filtered_upwork.json');

  // Read raw jobs
  const jobs = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  // Normalize
  const normalized = jobs.map(normalizeJob);

  // Deduplicate by jobId
  const seen = new Set();
  const deduped = [];
  const duplicateIds = [];
  normalized.forEach(job => {
    if (seen.has(job.jobId)) {
      duplicateIds.push(job.jobId);
    } else {
      seen.add(job.jobId);
      deduped.push(job);
    }
  });

  // Country filtering
  const filtered = deduped.filter(job => isAllowedCountry(job.country));
  const excludedByCountry = deduped.filter(job => !isAllowedCountry(job.country));

  // Save filtered jobs
  fs.writeFileSync(outputPath, JSON.stringify(filtered, null, 2), 'utf-8');

  return {
    message: "Filtered jobs saved to data/filtered_upwork.json",
    total_raw: jobs.length,
    total_unique: deduped.length,
    duplicates_removed: duplicateIds.length,
    duplicate_ids: duplicateIds,
    excluded_by_country: excludedByCountry.length,
    excluded_by_country_ids: excludedByCountry.map(j => j.jobId),
    total_saved: filtered.length
  };
};