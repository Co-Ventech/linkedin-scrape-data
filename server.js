  
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
require('./services/apifySchedulerService');
require('./services/upworkSchedulerService');
// Connect to database
connectDB();

const PORT = 3001;

app.listen(PORT, () => {
  // ... existing code (require, app.use, etc.) ...

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\nServer running on port ${PORT}\n`);

// ========= Upwork Controller Endpoints =========
// console.log('========= Upwork Controller Endpoints =========');
// console.log('[POST]   /api/upwork/fetch                  => Fetch jobs from Upwork and save as raw JSON (fetchAndSaveJobs)');
// console.log('[GET]    /api/upwork/filter                 => Filter, deduplicate, and save jobs to filtered file (filterUpworkJobs)');
// console.log('[POST]   /api/upwork/score                  => Run scoring and AI remarks on filtered jobs (scoreUpworkJobs)');
// console.log('[GET]    /api/upwork/score                  => Get scored jobs as JSON (getUpworkFinalScores)');
// console.log('[POST]   /api/upwork/save-jobs              => Save jobs from file to DB for authenticated user (saveUpworkJobsFromFile, auth required)');
// console.log('[GET]    /api/upwork/jobs-by-date           => Get jobs for user by date or date range, or latest batch (getJobsByDate, auth required)');
// console.log('[PATCH]  /api/upwork/job/:jobId             => Edit a job by jobId in the latest batch (editJobById, auth required)');
// console.log('[PATCH]  /api/upwork/job/:jobId/engagement  => Update engagement for a job (updateJobEngagement, auth required)');

// // ========= LinkedIn Controller Endpoints =========
// console.log('========= LinkedIn Controller Endpoints =========');
// console.log('[GET]    /api/apify                        => Fetch jobs from Apify and save as raw JSON (fetchAndSaveJobs)');
// console.log('[GET]    /api/apify/filtered               => Return filtered jobs with only selected fields (getFilteredJobs)');
// console.log('[GET]    /api/apify/score                  => Run AIML processing and return result (scoreJobs)');
// console.log('[GET]    /api/apify/scored                 => Get scored jobs as JSON (getScoredJobs)');
// console.log('[POST]   /api/apify/save-jobs                    => Save scored jobs from file to DB for authenticated user (uploadScoredJobsFromFile, auth required)');
// console.log('[GET]    /api/apify/jobs-by-date                 => Get jobs for user by date or date range, or latest batch (getJobsByDate, auth required)');
// console.log('[PATCH]  /api/apify/job/:jobId          => Edit a job by jobId in the latest batch (editJobById, auth required)');
});
});

