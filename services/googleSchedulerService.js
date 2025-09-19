const cron = require('node-cron');
const axios = require('axios');

const express = require('express');
const router = express.Router();
const { sendSuccessEmail, sendErrorEmail } = require('./emailService');
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const AUTOMATION_JWT_TOKEN = process.env.AUTOMATION_JWT_TOKEN;
console.log(API_BASE_URL);

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const jobName = 'Google Jobs Pipeline';

async function runGooglePipeline() {
  try {
    console.log('Pipeline started at', new Date().toISOString());
    console.log(`${jobName} started at`, new Date().toISOString());

    await delay(5000);
    // 1) Fetch Google jobs (writes data/scraped_jobs.json)
    await axios.get(`${API_BASE_URL}/api/google/scrape-jobs`, { timeout: 900000 });
    console.log('Google jobs fetched');
    await delay(5000);

    // 2) Upload to DB (platform: google)
    // await axios.post(`${API_BASE_URL}/api/jobadmin/upload`, { platform: 'google' }, {
    //   headers: { Authorization: `Bearer ${AUTOMATION_JWT_TOKEN}` },
    //   timeout: 900000
    // });
    console.log('Google jobs Fetched and not uploaded to DB');
    await delay(5000);

    console.log('Pipeline complete at', new Date().toISOString());
    console.log(`${jobName} complete at`, new Date().toISOString());
    await sendSuccessEmail(jobName, 'Google jobs fetched and uploaded successfully.');
  } catch (err) {
    console.error('Pipeline error:', err.message, err.stack, err.response?.data);
    await sendErrorEmail(jobName, `Error: ${err.message}\nStack: ${err.stack}\nResponse: ${JSON.stringify(err.response?.data)}`);
  }
}

// Run every 6 hours (adjust as needed)
cron.schedule('6 6 * * *', () => {
  console.log('Google cron job started at:', new Date());
  runGooglePipeline();
});

// API route to trigger the Google pipeline
router.post('/run-google-pipeline', async (req, res) => {
  try {
    console.log('API triggered: Running Google pipeline at', new Date());
    await runGooglePipeline();
    res.status(200).json({ message: 'Google pipeline executed successfully.' });
  } catch (error) {
    console.error('Error running Google pipeline:', error.message);
    res.status(500).json({ error: 'Failed to execute Google pipeline.', details: error.message });
  }
});

module.exports = router;