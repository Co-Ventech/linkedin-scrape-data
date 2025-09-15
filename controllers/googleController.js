// controllers/googleController.js
const googleJobService = require('../services/googleJobService');
const fs = require('fs');
const path = require('path');
// controllers/googleController.js
exports.scrapeJobs = async (req, res) => {
    try {
      const result = await googleJobService.scrapeAll(); // this also overwrites data/scraped_jobs.json
  
      const meta = result?.scraping_metadata || {};
      return res.json({
        success: true,
        message: 'Google job scraping completed',
        timestamp: new Date().toISOString(),
        file: 'data/scraped_jobs.json',
        summary: {
          total_unique_jobs: meta.total_unique_jobs,
          total_extracted_jobs: meta.total_extracted_jobs,
          total_duplicates_removed: meta.total_duplicates_removed,
          queries_processed: meta.queries_processed,
          processing_time_ms: meta.processing_time_ms
        }
      });
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Error during job scraping', error: e.message });
    }
  };

exports.scrapeJobsClean = async (req, res) => {
  try {
    const result = await googleJobService.scrapeClean();
    res.json({ success: true, message: 'Clean unique jobs generated', timestamp: new Date().toISOString(), ...result });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error during clean scrape', error: e.message });
  }
};

exports.scrapeStats = async (req, res) => {
  try {
    const stats = await googleJobService.scrapeStats();
    res.json({ success: true, message: 'Statistics generated', timestamp: new Date().toISOString(), statistics: stats });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error during stats generation', error: e.message });
  }
};

exports.testSingleQuery = async (req, res) => {
  try {
    const query = decodeURIComponent(req.params.query);
    const data = await googleJobService.testQuery(query);
    res.json({ success: true, message: `Test query completed for: "${query}"`, timestamp: new Date().toISOString(), ...data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error during test query', query: req.params.query, error: e.message });
  }
};


// exports.getJobsFromFile = async (req, res) => {
//   try {
//     const filePath = path.join(__dirname, '..', 'data', 'scraped_jobs.json');
//     if (!fs.existsSync(filePath)) {
//       return res.status(404).json({ success: false, message: 'scraped_jobs.json not found' });
//     }

//     const content = await fs.promises.readFile(filePath, 'utf8');
//     const data = JSON.parse(content || '{}');

//     const metadata = data.scraping_metadata || {};
//     const jobs = Array.isArray(data.extracted_unique_jobs) ? data.extracted_unique_jobs : [];

//     return res.json({
//       success: true,
//       timestamp: new Date().toISOString(),
//       metadata,
//       jobs
//     });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: 'Failed to read jobs from file', error: err.message });
//   }
// };
// exports.getJobsFromFile = async (req, res) => {
//     try {
//       const filePath = path.join(__dirname, '..', 'data', 'scraped_jobs.json');
//       if (!fs.existsSync(filePath)) {
//         return res.status(404).json({ success: false, message: 'scraped_jobs.json not found' });
//       }
  
//       const content = await fs.promises.readFile(filePath, 'utf8');
//       const data = JSON.parse(content || '{}');
  
//       const uniqueRaw = Array.isArray(data.unique_raw_jobs)
//         ? data.unique_raw_jobs.map(j => {
//             const { description, ...rest } = j || {};
//             return rest;
//           })
//         : [];
  
//       return res.json({
//         success: true,
//         timestamp: new Date().toISOString(),
//         scraping_metadata: data.scraping_metadata || {},
//         unique_raw_jobs: uniqueRaw,                 // description removed
//         extracted_unique_jobs: data.extracted_unique_jobs || [],
//         duplicate_jobs: data.duplicate_jobs || []
//       });
//     } catch (err) {
//       return res.status(500).json({ success: false, message: 'Failed to read jobs from file', error: err.message });
//     }
//   };


// controllers/googleController.js
// exports.getJobsFromFile = async (req, res) => {
//   try {
//     const filePath = path.join(__dirname, '..', 'data', 'scraped_jobs.json');
//     if (!fs.existsSync(filePath)) {
//       return res.status(404).json({ success: false, message: 'scraped_jobs.json not found' });
//     }

//     const content = await fs.promises.readFile(filePath, 'utf8');
//     const data = JSON.parse(content || '{}');

//     const metadata = data.scraping_metadata || {};
//     const jobs = Array.isArray(data.unique_raw_jobs) ? data.unique_raw_jobs.map(({ description, ...rest }) => rest) : [];

//     return res.json({
//       success: true,
//       timestamp: new Date().toISOString(),
//       metadata,
//       jobs
//     });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: 'Failed to read jobs from file', error: err.message });
//   }
// };

// controllers/googleController.js
exports.getJobsFromFile = async (req, res) => {
    try {
      const filePath = path.join(__dirname, '..', 'data', 'scraped_jobs.json');
      if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'scraped_jobs.json not found' });
  
      const content = await fs.promises.readFile(filePath, 'utf8');
      const data = JSON.parse(content || '{}');
  
      const metadata = data.scraping_metadata || {};
      const jobs = Array.isArray(data.unique_raw_jobs)
        ? data.unique_raw_jobs.map(({ description, ...rest }) => rest)
        : [];
  
      return res.json({ success: true, timestamp: new Date().toISOString(), metadata, jobs });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to read jobs from file', error: err.message });
    }
  };
exports.health = (req, res) => {
  const { CONFIG } = googleJobService;
  res.json({
    status: 'OK',
    message: 'Google Job Scraper (MVC)',
    version: '2.0.0',
    features: [
      'Multi-level deduplication',
      'Information extraction',
      'Enhanced error handling',
      'Pagination support',
      'Rate limiting and random delays',
      'Detailed logging and statistics'
    ],
    configuration: {
      total_queries: CONFIG?.JOB_QUERIES?.length || 10,
      max_pages_per_query: CONFIG.MAX_PAGES_PER_QUERY,
      request_timeout: `${CONFIG.REQUEST_TIMEOUT/1000}s`,
      max_retries: CONFIG.MAX_RETRIES,
      rate_limit_delay: `${CONFIG.RATE_LIMIT_DELAY}ms`
    },
    timestamp: new Date().toISOString()
  });
};