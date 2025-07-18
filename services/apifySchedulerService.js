// const axios = require('axios');

// let nextRunTimeout = null;
// let nextRun = null;
// const API_BASE_URL = process.env.API_BASE_URL;

// console.log(API_BASE_URL);

// async function runApifyJobAndScheduleNext() {
//   try {
//     // Call your own endpoint (adjust port if needed)
//     await axios.get(`${API_BASE_URL}/api/apify`);
//     console.log('Apify job run at', new Date().toISOString());
//   } catch (err) {
//     console.error('Failed to run Apify job:', err.message);
//   }
//   // Schedule next run 24 hours from now
//   // nextRun = new Date(Date.now() + 24 * 60 * 60 * 1000);
//   nextRun = new Date(Date.now() + 1 * 60 * 1000); // 1 minute
//   scheduleNextRun();
// }

// function scheduleNextRun() {
//   if (nextRunTimeout) clearTimeout(nextRunTimeout);
//   const msUntilNext = nextRun - new Date();
//   nextRunTimeout = setTimeout(runApifyJobAndScheduleNext, msUntilNext);
// }

// function startApifyScheduler() {
//   // nextRun = new Date(Date.now() + 24 * 60 * 60 * 1000);
//   nextRun = new Date(Date.now() + 1 * 60 * 1000); // 1 minute
//   scheduleNextRun();
//   // Optionally, run immediately on server start:
//   // runApifyJobAndScheduleNext();
// }

// function getNextRunInfo() {
//   if (!nextRun) {
//     return { nextRun: null, secondsRemaining: null };
//   }
//   const now = new Date();
//   const secondsRemaining = Math.max(0, Math.floor((nextRun - now) / 1000));
//   return { nextRun, secondsRemaining };
// }

// module.exports = {
//   startApifyScheduler,
//   getNextRunInfo,
// };

// const axios = require('axios');

// const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
// const AUTOMATION_JWT_TOKEN = process.env.AUTOMATION_JWT_TOKEN;

// let nextRunTimeout = null;
// let nextRun = null;

// async function runFullPipeline() {
//   try {
//     // 1. Fetch jobs from Apify
//     console.log('Step 1: Fetching jobs from Apify...');
//     await axios.get(`${API_BASE_URL}/api/apify`);
//     console.log('Step 1 done.');

//     // 2. Filter jobs
//     console.log('Step 2: Filtering jobs...');
//     await axios.get(`${API_BASE_URL}/api/apify/filtered`);
//     console.log('Step 2 done.');

//     // 3. Score jobs
//     console.log('Step 3: Scoring jobs...');
//     await axios.get(`${API_BASE_URL}/api/apify/score`);
//     console.log('Step 3 done.');

//     // 4. Save jobs to MongoDB (requires auth)
//     console.log('Step 4: Saving jobs to MongoDB...');
//     await axios.post(`${API_BASE_URL}/api/save-jobs`, {}, {
//       headers: { Authorization: `Bearer ${AUTOMATION_JWT_TOKEN}` }
//     });
//     console.log('Step 4 done. Pipeline complete!');
//   } catch (err) {
//     console.error('Pipeline error:', err.message);
//   }
//   // Schedule next run in 1 minute (for testing)
//   // nextRun = new Date(Date.now() + 1 * 60 * 1000);
//     nextRun = new Date(Date.now() + 24 * 60 * 60 * 1000);

//   scheduleNextRun();
// }

// function scheduleNextRun() {
//   if (nextRunTimeout) clearTimeout(nextRunTimeout);
//   const msUntilNext = nextRun - new Date();
//   nextRunTimeout = setTimeout(runFullPipeline, msUntilNext);
// }

// function startApifyScheduler() {
//   // nextRun = new Date(Date.now() + 1 * 60 * 1000); // 1 minute for testing
//     nextRun = new Date(Date.now() + 24 * 60 * 60 * 1000);

//   scheduleNextRun();
//   // Optionally, run immediately on server start:
//   // runFullPipeline();
// }

// function getNextRunInfo() {
//   if (!nextRun) {
//     return { nextRun: null, secondsRemaining: null };
//   }
//   const now = new Date();
//   const secondsRemaining = Math.max(0, Math.floor((nextRun - now) / 1000));
//   return { nextRun, secondsRemaining };
// }

// module.exports = {
//   startApifyScheduler,
//   getNextRunInfo,
// };
const cron = require('node-cron');
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const AUTOMATION_JWT_TOKEN = process.env.AUTOMATION_JWT_TOKEN;
console.log(API_BASE_URL);

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runFullPipeline() {
  try {
    console.log('Pipeline started at', new Date().toISOString());
    await axios.get(`${API_BASE_URL}/api/apify`);
    await delay(10000);

    await axios.get(`${API_BASE_URL}/api/apify/filtered`);
    await delay(10000);

    await axios.get(`${API_BASE_URL}/api/apify/score`);
    await delay(10000);

    await axios.post(`${API_BASE_URL}/api/save-jobs`, {}, {
      headers: { Authorization: `Bearer ${AUTOMATION_JWT_TOKEN}` }
    });
    await delay(10000);

    console.log('Pipeline complete at', new Date().toISOString());
  } catch (err) {
    console.error('Pipeline error:', err.message);
  }
}

// Schedule to run every day at 17:07 (5:07 PM) server time
cron.schedule('* 2 * * *', runFullPipeline);
