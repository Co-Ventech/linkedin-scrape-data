// services/googleJobService.js
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const CONFIG = {
  API_KEY: process.env.SCRAPING_DOG_API_KEY,
  BASE_URL: 'https://api.scrapingdog.com/google_jobs',
  OUTPUT_FILE: path.join(__dirname, '..', 'data', 'scraped_jobs.json'),
  COUNTRY: 'us',
  CHIPS: '',
  LRAD: '',
  UDS: '',
  LTYPE: '',
  MIN_TOKEN_LENGTH: 10,
  REQUEST_TIMEOUT: 90000,
  RETRY_DELAY: 5000,
  MAX_RETRIES: 3,
  RATE_LIMIT_DELAY: 3000,
  MAX_PAGES_PER_QUERY: 5,
  RANDOM_DELAY_MIN: 1000,
  RANDOM_DELAY_MAX: 2000
};

const JOB_QUERIES = [
  'sqa remote since yesterday',
  'mern remote since yesterday', 
  'react remote since yesterday', 
  'ai ml remote since yesterday',
  'ai/ml remote since yesterday',
  'native remote since yesterday',
  'automation engineer remote since yesterday',
  'Automation Testing remote since yesterday',
  'Software Testing remote since yesterday',
  'manual testing remote since yesterday'
];
// Find the first relative time like "15 hours ago", "2 days ago", "30 minutes ago", "30+ days ago"
function findRelativeTimeText(job, extractedPostedTime) {
  if (extractedPostedTime) return extractedPostedTime;
  const exts = Array.isArray(job.extensions) ? job.extensions : [];
  const rel = exts.find(e => typeof e === 'string' && /\b(minute|hour|day|week|month|year)s?\s+ago\b/i.test(e));
  return rel || null;
}
// put near other utils
function normalizeText(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[\u2012-\u2015]/g, '-')   // figure/en dash/em dash → '-'
    .replace(/\s+/g, ' ')               // collapse spaces
    .trim();
}
function parseRelativeToMs(text) {
  if (!text || typeof text !== 'string') return null;
  const s = text.toLowerCase();
  // Normalize e.g., "30+ days ago" -> "30 days ago"
  const cleaned = s.replace(/\+/, '');
  const m = cleaned.match(/(\d+)\s*(minute|hour|day|week|month|year)s?\s+ago/);
  if (!m) return null;
  const value = parseInt(m[1], 10);
  const unit = m[2];
  const unitToMs = {
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000, // approximation
    year: 365 * 24 * 60 * 60 * 1000  // approximation
  };
  return value * (unitToMs[unit] || 0);
}

function computePostedAtExact(scrapedAtISO, relativeText) {
  try {
    if (!scrapedAtISO) return null;
    const delta = parseRelativeToMs(relativeText);
    if (delta == null) return null;
    const scraped = new Date(scrapedAtISO).getTime();
    if (Number.isNaN(scraped)) return null;
    const posted = new Date(scraped - delta);
    return posted.toISOString();
  } catch {
    return null;
  }
}
const delay = (ms) => new Promise(r => setTimeout(r, ms));
const randomDelay = () => Math.floor(Math.random() * (CONFIG.RANDOM_DELAY_MAX - CONFIG.RANDOM_DELAY_MIN + 1)) + CONFIG.RANDOM_DELAY_MIN;

const isValidNextToken = (token) => !!(token && typeof token === 'string' && token.length > CONFIG.MIN_TOKEN_LENGTH && token !== 'e30=');
const isValidJob = (job) => job && typeof job === 'object' && (job.title || job.company_name);
const generateJobHash = (job) => {
  const identifier = [
    job.title?.toLowerCase().trim(),
    job.company_name?.toLowerCase().trim(),
    job.location?.toLowerCase().trim(),
    job.description?.substring(0, 100)?.toLowerCase().trim()
  ].filter(Boolean).join('|');
  return crypto.createHash('md5').update(identifier).digest('hex');
};
const generateJobHashAlternative = (job) => {
  const identifier = [
    job.title?.toLowerCase().replace(/[^\w\s]/g, '').trim(),
    job.company_name?.toLowerCase().trim()
  ].filter(Boolean).join('|');
  return crypto.createHash('md5').update(identifier).digest('hex');
};
const areJobsSimilar = (a, b) =>
  a?.title?.toLowerCase() === b?.title?.toLowerCase() &&
  a?.company_name?.toLowerCase() === b?.company_name?.toLowerCase();

// const extractJobInfo = (job) => {
//   if (!isValidJob(job)) return null;
//   const extensions = job.extensions || [];
//   const detected = job.detected_extensions || {};
//   const info = {
//     title: job.title || 'N/A',
//     company: job.company_name || 'N/A',
//     location: job.location || 'Remote',
//     via: job.via || 'N/A',
//     posted_time: null,
//     hourly_rate: null,
//     salary_range: null,
//     job_type: null,
//     work_arrangement: null,
//     benefits: [],
//     country: null,
//     experience_level: null,
//     contract_type: null,
//     job_id: job.job_id,
//     share_link: job.share_link,
//     apply_options: job.apply_options || [],
//     description_preview: job.description ? job.description.substring(0, 200) + '...' : 'N/A',
//     primary_hash: generateJobHash(job),
//     secondary_hash: generateJobHashAlternative(job)
//   };

//   extensions.forEach((ext) => {
//     const s = String(ext).toLowerCase();
//     if ((s.includes('hour') || s.includes('day') || s.includes('minute')) && s.includes('ago')) info.posted_time = ext;
//     else if (s.includes('hour') && (s.includes('$') || /\d/.test(s))) info.hourly_rate = ext;
//     else if (s.includes('salary') || s.includes('year') || (s.includes('k') && /\d/.test(s))) info.salary_range = ext;
//     else if (/^\$?\d+[k-]?\$?\d*/.test(s) && !s.includes('hour')) info.salary_range = ext;
//     else if (s.includes('remote') || s.includes('work from home')) info.work_arrangement = 'Remote';
//     else if (s.includes('on-site') || s.includes('office')) info.work_arrangement = 'On-site';
//     else if (s.includes('hybrid')) info.work_arrangement = 'Hybrid';
//     else if (s.includes('full-time')) info.job_type = 'Full-time';
//     else if (s.includes('part-time')) info.job_type = 'Part-time';
//     else if (s.includes('contract')) info.contract_type = 'Contract';
//     else if (s.includes('freelance')) info.contract_type = 'Freelance';
//     else if (s.includes('internship')) info.contract_type = 'Internship';
//     else if (s.includes('senior')) info.experience_level = 'Senior';
//     else if (s.includes('junior')) info.experience_level = 'Junior';
//     else if (s.includes('lead') || s.includes('principal')) info.experience_level = 'Lead/Principal';
//     else if (s.includes('entry') || s.includes('graduate')) info.experience_level = 'Entry Level';
//   });

//   if (detected.health_insurance) info.benefits.push('Health Insurance');
//   if (detected.paid_time_off) info.benefits.push('Paid Time Off');
//   if (detected.dental_coverage) info.benefits.push('Dental Coverage');
//   if (detected.retirement_plan) info.benefits.push('Retirement Plan');
//   if (detected.vision_coverage) info.benefits.push('Vision Coverage');
//   if (detected.flexible_hours) info.benefits.push('Flexible Hours');

//   if (info.location) {
//     const loc = info.location.toLowerCase();
//     if (loc.includes('usa') || loc.includes('united states') || loc.includes('us')) info.country = 'United States';
//     else if (loc.includes('canada') || loc.includes('ca')) info.country = 'Canada';
//     else if (loc.includes('uk') || loc.includes('united kingdom') || loc.includes('britain')) info.country = 'United Kingdom';
//     else if (loc.includes('australia') || loc.includes('au')) info.country = 'Australia';
//     else if (loc.includes('germany') || loc.includes('deutschland')) info.country = 'Germany';
//     else if (loc.includes('india') || loc.includes('in')) info.country = 'India';
//   }
//   return info;
// };

// const extractJobInfo = (job) => {
//   if (!isValidJob(job)) return null;
//   const extensions = job.extensions || [];
//   const detected = job.detected_extensions || {};

//   const info = {
//     title: job.title || 'N/A',
//     company: job.company_name || 'N/A',
//     location: job.location || 'Remote',
//     via: job.via || 'N/A',

//     posted_time: null,
//     hourly_rate: null,
//     salary_range: null,
//     job_type: null,
//     work_arrangement: null,
//     benefits: [],
//     country: null,
//     experience_level: null,
//     contract_type: null,

//     job_id: job.job_id,
//     share_link: job.share_link,
//     apply_options: job.apply_options || [],
//     description_preview: job.description ? job.description.substring(0, 200) + '...' : 'N/A',

//     primary_hash: generateJobHash(job),
//     secondary_hash: generateJobHashAlternative(job)
//   };

//   // Parse extensions
//   extensions.forEach((ext) => {
//     const s = String(ext).toLowerCase();
//     if ((s.includes('hour') || s.includes('day') || s.includes('minute')) && s.includes('ago')) info.posted_time = ext;
//     else if (s.includes('hour') && (s.includes('$') || /\d/.test(s))) info.hourly_rate = ext;
//     else if (s.includes('salary') || s.includes('year') || (s.includes('k') && /\d/.test(s))) info.salary_range = ext;
//     else if (/^\$?\d+[k-]?\$?\d*/.test(s) && !s.includes('hour')) info.salary_range = ext;
//     else if (s.includes('remote') || s.includes('work from home')) info.work_arrangement = 'Remote';
//     else if (s.includes('on-site') || s.includes('office')) info.work_arrangement = 'On-site';
//     else if (s.includes('hybrid')) info.work_arrangement = 'Hybrid';
//     else if (s.includes('full-time')) info.job_type = 'Full-time';
//     else if (s.includes('part-time')) info.job_type = 'Part-time';
//     else if (s.includes('contract')) info.contract_type = 'Contract';
//     else if (s.includes('freelance')) info.contract_type = 'Freelance';
//     else if (s.includes('internship')) info.contract_type = 'Internship';
//     else if (s.includes('senior')) info.experience_level = 'Senior';
//     else if (s.includes('junior')) info.experience_level = 'Junior';
//     else if (s.includes('lead') || s.includes('principal')) info.experience_level = 'Lead/Principal';
//     else if (s.includes('entry') || s.includes('graduate')) info.experience_level = 'Entry Level';
//   });

//   // Benefits from detected_extensions
//   if (detected.health_insurance) info.benefits.push('Health Insurance');
//   if (detected.paid_time_off) info.benefits.push('Paid Time Off');
//   if (detected.dental_coverage) info.benefits.push('Dental Coverage');
//   if (detected.retirement_plan) info.benefits.push('Retirement Plan');
//   if (detected.vision_coverage) info.benefits.push('Vision Coverage');
//   if (detected.flexible_hours) info.benefits.push('Flexible Hours');

//   // Country detection
//   if (info.location) {
//     const loc = info.location.toLowerCase();
//     if (loc.includes('usa') || loc.includes('united states') || loc.includes('us')) info.country = 'United States';
//     else if (loc.includes('canada') || loc.includes('ca')) info.country = 'Canada';
//     else if (loc.includes('uk') || loc.includes('united kingdom') || loc.includes('britain')) info.country = 'United Kingdom';
//     else if (loc.includes('australia') || loc.includes('au')) info.country = 'Australia';
//     else if (loc.includes('germany') || loc.includes('deutschland')) info.country = 'Germany';
//     else if (loc.includes('india') || loc.includes('in')) info.country = 'India';
//   }

//   // Compute exact posted timestamp from relative text and scraped time
//   const relText = info.posted_time || findRelativeTimeText(job, info.posted_time);
//   info.posted_at_exact = computePostedAtExact(job.scraped_at, relText);

//   return info;
// };
const extractJobInfo = (job) => {
  if (!isValidJob(job)) return null;
  const extensions = Array.isArray(job.extensions) ? job.extensions : [];
  const detected = job.detected_extensions || {};

  const info = {
    title: job.title || 'N/A',
    company: job.company_name || 'N/A',
    location: job.location || 'Remote',
    via: job.via || 'N/A',

    posted_time: null,
    hourly_rate: null,
    salary_range: null,
    job_type: null,
    work_arrangement: null,
    benefits: [],
    country: null,
    experience_level: null,
    contract_type: null,

    job_id: job.job_id,
    share_link: job.share_link,
    apply_options: job.apply_options || [],
    description_preview: job.description ? job.description.substring(0, 200) + '...' : (job.description_preview || 'N/A'),

    primary_hash: generateJobHash(job),
    secondary_hash: generateJobHashAlternative(job)
  };

  extensions.forEach((ext) => {
    const s = normalizeText(ext);
    if ((/\b(minute|hour|day|week|month|year)s?\s+ago\b/.test(s))) info.posted_time = ext;
    else if (s.includes('hour') && (s.includes('$') || /\d/.test(s))) info.hourly_rate = ext;
    else if (s.includes('salary') || s.includes('year') || (s.includes('k') && /\d/.test(s))) info.salary_range = ext;
    else if (/^\$?\d+[k-]?\$?\d*/.test(s) && !s.includes('hour')) info.salary_range = ext;
    else if (s.includes('remote') || s.includes('work from home')) info.work_arrangement = 'Remote';
    else if (s.includes('on-site') || s.includes('office')) info.work_arrangement = 'On-site';
    else if (s.includes('hybrid')) info.work_arrangement = 'Hybrid';
    else if (s.includes('full-time')) info.job_type = 'Full-time';
    else if (s.includes('part-time')) info.job_type = 'Part-time';
    else if (s.includes('contract')) info.contract_type = 'Contract';
    else if (s.includes('freelance')) info.contract_type = 'Freelance';
    else if (s.includes('internship')) info.contract_type = 'Internship';
    else if (s.includes('senior')) info.experience_level = 'Senior';
    else if (s.includes('junior')) info.experience_level = 'Junior';
    else if (s.includes('lead') || s.includes('principal')) info.experience_level = 'Lead/Principal';
    else if (s.includes('entry') || s.includes('graduate')) info.experience_level = 'Entry Level';
  });

  if (detected.health_insurance) info.benefits.push('Health Insurance');
  if (detected.paid_time_off) info.benefits.push('Paid Time Off');
  if (detected.dental_coverage) info.benefits.push('Dental Coverage');
  if (detected.retirement_plan) info.benefits.push('Retirement Plan');
  if (detected.vision_coverage) info.benefits.push('Vision Coverage');
  if (detected.flexible_hours) info.benefits.push('Flexible Hours');

  if (info.location) {
    const loc = normalizeText(info.location);
    if (loc.includes('united states') || /\b(us|usa)\b/.test(loc)) info.country = 'United States';
    else if (loc.includes('canada') || /\bca\b/.test(loc)) info.country = 'Canada';
    else if (loc.includes('united kingdom') || loc.includes('britain') || /\buk\b/.test(loc)) info.country = 'United Kingdom';
    else if (loc.includes('australia') || /\bau\b/.test(loc)) info.country = 'Australia';
    else if (loc.includes('germany') || loc.includes('deutschland')) info.country = 'Germany';
    else if (loc.includes('india') || /\bin\b/.test(loc)) info.country = 'India';
  }

  const relText = info.posted_time || findRelativeTimeText(job, info.posted_time);
  info.posted_at_exact = computePostedAtExact(job.scraped_at, relText);

  return info;
};
// const extractJobInfo = (job) => {
//   if (!isValidJob(job)) return null;
//   const extensions = job.extensions || [];
//   const detected = job.detected_extensions || {};

//   const info = {
//     title: job.title || 'N/A',
//     company: job.company_name || 'N/A',
//     location: job.location || 'Remote',
//     via: job.via || 'N/A',
//     posted_time: null,
//     hourly_rate: null,
//     salary_range: null,
//     job_type: null,
//     work_arrangement: null,
//     benefits: [],
//     country: null,
//     experience_level: null,
//     contract_type: null,
//     job_id: job.job_id,
//     share_link: job.share_link,
//     apply_options: job.apply_options || [],
//     description_preview: job.description ? job.description.substring(0, 200) + '...' : 'N/A',
//     primary_hash: generateJobHash(job),
//     secondary_hash: generateJobHashAlternative(job)
//   };

//   extensions.forEach((ext) => {
//     const s = String(ext).toLowerCase();
//     if ((s.includes('hour') || s.includes('day') || s.includes('minute')) && s.includes('ago')) info.posted_time = ext;
//     else if (s.includes('hour') && (s.includes('$') || /\d/.test(s))) info.hourly_rate = ext;
//     else if (s.includes('salary') || s.includes('year') || (s.includes('k') && /\d/.test(s))) info.salary_range = ext;
//     else if (/^\$?\d+[k-]?\$?\d*/.test(s) && !s.includes('hour')) info.salary_range = ext;
//     else if (s.includes('remote') || s.includes('work from home')) info.work_arrangement = 'Remote';
//     else if (s.includes('on-site') || s.includes('office')) info.work_arrangement = 'On-site';
//     else if (s.includes('hybrid')) info.work_arrangement = 'Hybrid';
//     else if (s.includes('full-time')) info.job_type = 'Full-time';
//     else if (s.includes('part-time')) info.job_type = 'Part-time';
//     else if (s.includes('contract')) info.contract_type = 'Contract';
//     else if (s.includes('freelance')) info.contract_type = 'Freelance';
//     else if (s.includes('internship')) info.contract_type = 'Internship';
//     else if (s.includes('senior')) info.experience_level = 'Senior';
//     else if (s.includes('junior')) info.experience_level = 'Junior';
//     else if (s.includes('lead') || s.includes('principal')) info.experience_level = 'Lead/Principal';
//     else if (s.includes('entry') || s.includes('graduate')) info.experience_level = 'Entry Level';
//   });

//   if (detected.health_insurance) info.benefits.push('Health Insurance');
//   if (detected.paid_time_off) info.benefits.push('Paid Time Off');
//   if (detected.dental_coverage) info.benefits.push('Dental Coverage');
//   if (detected.retirement_plan) info.benefits.push('Retirement Plan');
//   if (detected.vision_coverage) info.benefits.push('Vision Coverage');
//   if (detected.flexible_hours) info.benefits.push('Flexible Hours');

//   if (info.location) {
//     const loc = info.location.toLowerCase();
//     if (loc.includes('usa') || loc.includes('united states') || loc.includes('us')) info.country = 'United States';
//     else if (loc.includes('canada') || loc.includes('ca')) info.country = 'Canada';
//     else if (loc.includes('uk') || loc.includes('united kingdom') || loc.includes('britain')) info.country = 'United Kingdom';
//     else if (loc.includes('australia') || loc.includes('au')) info.country = 'Australia';
//     else if (loc.includes('germany') || loc.includes('deutschland')) info.country = 'Germany';
//     else if (loc.includes('india') || loc.includes('in')) info.country = 'India';
//   }

//   // posted_at_exact from relative text and scraped time
//   const relText = info.posted_time || findRelativeTimeText(job, info.posted_time);
//   info.posted_at_exact = computePostedAtExact(job.scraped_at, relText);

//   return info;
// };
async function fetchJobsFromAPI(query, nextPageToken = '', retryCount = 0) {
  try {
    await delay(randomDelay());
    const params = {
      api_key: CONFIG.API_KEY,
      query,
      country: CONFIG.COUNTRY,
      chips: CONFIG.CHIPS,
      lrad: CONFIG.LRAD,
      uds: CONFIG.UDS,
      ltype: CONFIG.LTYPE,
      next_page_token: nextPageToken
    };
    const response = await axios.get(CONFIG.BASE_URL, {
      params,
      timeout: CONFIG.REQUEST_TIMEOUT,
      validateStatus: (s) => s >= 200 && s < 600
    });

    if (response.status === 429) throw Object.assign(new Error('Rate Limited'), { response });
    if (response.status >= 500) throw Object.assign(new Error('Server Error'), { response });
    if (response.status !== 200 || !response.data) return { jobs: [], nextToken: null };

    if (typeof response.data === 'string') return { jobs: [], nextToken: null };
    const jobs = (response.data.jobs_results || []).filter(isValidJob);
    const nextToken = response.data.scrapingdog_pagination?.next_page_token || null;
    return { jobs, nextToken };
  } catch (err) {
    if (retryCount < CONFIG.MAX_RETRIES) {
      let wait = CONFIG.RETRY_DELAY;
      if (err?.response?.status === 429) wait *= Math.pow(2, retryCount);
      else if (err?.response?.status >= 500) wait *= 2;
      await delay(wait);
      return fetchJobsFromAPI(query, nextPageToken, retryCount + 1);
    }
    return { jobs: [], nextToken: null };
  }
}

async function fetchAllPagesForQuery(query, nextPageToken = '', acc = [], page = 0) {
  if (page >= CONFIG.MAX_PAGES_PER_QUERY) return acc;
  const { jobs, nextToken } = await fetchJobsFromAPI(query, nextPageToken);
  const all = [...acc, ...(jobs || [])];
  if (isValidNextToken(nextToken) && jobs.length) {
    await delay(CONFIG.RATE_LIMIT_DELAY);
    return fetchAllPagesForQuery(query, nextToken, all, page + 1);
  }
  return all;
}

async function processAllJobQueries() {
  const start = Date.now();
  const results = [];
  for (let i = 0; i < JOB_QUERIES.length; i++) {
    const q = JOB_QUERIES[i];
    const t0 = Date.now();
    const jobs = await fetchAllPagesForQuery(q);
    results.push({ query: q, jobs, count: jobs.length, duration: Date.now() - t0 });
    if (i < JOB_QUERIES.length - 1) await delay(CONFIG.RATE_LIMIT_DELAY);
  }

  // Dedup
  const seenP = new Set();
  const seenS = new Set();
  const unique = [];
  const dups = [];
  const dupStats = { total_raw_jobs: 0, primary_duplicates: 0, secondary_duplicates: 0, manual_duplicates: 0, unique_jobs: 0, duplicate_examples: [] };

  results.forEach(r => {
    dupStats.total_raw_jobs += r.jobs.length;
    r.jobs.forEach(j => {
      const ph = generateJobHash(j);
      const sh = generateJobHashAlternative(j);
      const scrapedAtNow = new Date().toISOString();
      const derived = extractJobInfo({ ...j, scraped_at: scrapedAtNow }) || {};
    
      let duplicateType = '';
      if (seenP.has(ph)) duplicateType = 'primary';
      else if (seenS.has(sh)) duplicateType = 'secondary';
      else if (unique.some(u => areJobsSimilar(u, j))) duplicateType = 'manual';

      if (duplicateType) {
        dupStats[`${duplicateType}_duplicates`]++;
        if (dupStats.duplicate_examples.length < 10) {
          dupStats.duplicate_examples.push({ type: duplicateType, title: j.title, company: j.company_name, query: r.query });
        }
        dups.push({ ...j, duplicate_type: duplicateType, source_query: r.query });
      } else {
        seenP.add(ph); seenS.add(sh);
        // unique.push({ ...j, source_query: r.query, scraped_at: new Date().toISOString(), primary_hash: ph, secondary_hash: sh });
        unique.push({
          ...j,
          source_query: r.query,
          scraped_at: scrapedAtNow,
          primary_hash: ph,
          secondary_hash: sh,
      
          posted_time: derived.posted_time ?? null,
          posted_at_exact: derived.posted_at_exact ?? null,
          hourly_rate: derived.hourly_rate ?? null,
          salary_range: derived.salary_range ?? null,
          job_type: derived.job_type ?? null,
          work_arrangement: derived.work_arrangement ?? null,
          benefits: Array.isArray(derived.benefits) ? derived.benefits : [],
          country: derived.country ?? null,
          experience_level: derived.experience_level ?? null,
          contract_type: derived.contract_type ?? null,
          description_preview: derived.description_preview ?? null
        })
      }
    });
  });
  dupStats.unique_jobs = unique.length;

  // Extract
  const extracted = [];
  const xStats = { successful_extractions: 0, failed_extractions: 0, jobs_with_salary: 0, jobs_with_benefits: 0, remote_jobs: 0, onsite_jobs: 0, hybrid_jobs: 0 };
  unique.forEach(j => {
    const info = extractJobInfo(j);
    if (!info) return xStats.failed_extractions++;
    xStats.successful_extractions++;
    if (info.salary_range || info.hourly_rate) xStats.jobs_with_salary++;
    if ((info.benefits || []).length) xStats.jobs_with_benefits++;
    if (info.work_arrangement === 'Remote') xStats.remote_jobs++;
    else if (info.work_arrangement === 'On-site') xStats.onsite_jobs++;
    else if (info.work_arrangement === 'Hybrid') xStats.hybrid_jobs++;
    extracted.push({ ...info, source_query: j.source_query, scraped_at: j.scraped_at });
  });

  const processingTime = Date.now() - start;
  const finalResult = {
    scraping_metadata: {
      total_unique_jobs: unique.length,
      total_extracted_jobs: extracted.length,
      total_duplicates_removed: dupStats.primary_duplicates + dupStats.secondary_duplicates + dupStats.manual_duplicates,
      queries_processed: JOB_QUERIES.length,
      scraped_at: new Date().toISOString(),
      processing_time_ms: processingTime,
      processing_time_formatted: `${Math.floor(processingTime/60000)}m ${Math.floor((processingTime%60000)/1000)}s`,
      deduplication_stats: dupStats,
      extraction_stats: xStats,
      queries_breakdown: results.map(r => ({ query: r.query, raw_jobs_found: r.count, processing_time_ms: r.duration })),
      configuration: {
        max_pages_per_query: CONFIG.MAX_PAGES_PER_QUERY,
        rate_limit_delay: CONFIG.RATE_LIMIT_DELAY,
        request_timeout: CONFIG.REQUEST_TIMEOUT,
        max_retries: CONFIG.MAX_RETRIES
      },
      queries: JOB_QUERIES
    },
    unique_raw_jobs: unique,
    extracted_unique_jobs: extracted,
    duplicate_jobs: dups
  };

  await fs.writeFile(CONFIG.OUTPUT_FILE, JSON.stringify(finalResult, null, 2), 'utf8');
  return finalResult;
}

async function scrapeAll() { return processAllJobQueries(); }
async function scrapeClean() { const res = await processAllJobQueries(); return { metadata: res.scraping_metadata, jobs: res.extracted_unique_jobs }; }
async function scrapeStats() { const res = await processAllJobQueries(); return { scraping_metadata: res.scraping_metadata, query_performance: res.scraping_metadata.queries_breakdown, deduplication_summary: res.scraping_metadata.deduplication_stats, extraction_summary: res.scraping_metadata.extraction_stats }; }
async function testQuery(q) { const jobs = await fetchAllPagesForQuery(q); return { query: q, jobs_found: jobs.length, jobs }; }

module.exports = {
  scrapeAll,
  scrapeClean,
  scrapeStats,
  testQuery,
  CONFIG
};