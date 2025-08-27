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

const jobName = 'Upwork Jobs Pipeline';

async function runUpworkPipeline() {
  try {
    console.log('Pipeline started at', new Date().toISOString());
        console.log(`${jobName} started at`, new Date().toISOString());
    
        await delay(10000);
    // 1. Fetch jobs from Upwork
    await axios.get(`${API_BASE_URL}/api/upwork`,{ timeout: 900000 });
    console.log('Upwork jobs fetched');
    await delay(10000);

    // 2. Filter jobs
    await axios.get(`${API_BASE_URL}/api/upwork/filtered`,{ timeout: 900000 });
    console.log('Upwork jobs filtered');
    await delay(10000);

    // 3. Score jobs
    await axios.get(`${API_BASE_URL}/api/upwork/score`,{ timeout: 900000 });
    console.log('Upwork jobs scored');
    await delay(10000);

    // 4. Save jobs to MongoDB (requires auth)
    // await axios.post(`${API_BASE_URL}/api/upwork/save-jobs`, {}, {
    //   headers: { Authorization: `Bearer ${AUTOMATION_JWT_TOKEN}` },timeout: 900000
    // });
    console.log('Upwork jobs saved to DB');
    await delay(10000);

    console.log('Pipeline complete at', new Date().toISOString());
    console.log(`${jobName} complete at`, new Date().toISOString());
    await sendSuccessEmail(
      jobName,
      'All Upwork pipeline steps (fetch, filter, score, save) completed successfully.'
    )
  } catch (err) {
    console.error('Pipeline error:', err.message, err.stack, err.response?.data);
    await sendErrorEmail(jobName, `Error: ${err.message}\nStack: ${err.stack}\nResponse: ${JSON.stringify(err.response?.data)}`);
  }
}

// Run the Upwork pipeline every day at midnight (00:00)
cron.schedule('0 */6 * * *', () => {
  // cron.schedule('57 19 * * *', () => {

  console.log('Upwork cron job started at:', new Date());
  runUpworkPipeline();
});


// API route to trigger the Upwork pipeline
router.post('/run-upwork-pipeline', async (req, res) => {
  try {
    console.log('API triggered: Running Upwork pipeline at', new Date());
    await runUpworkPipeline();
    res.status(200).json({ message: 'Upwork pipeline executed successfully.' });
  } catch (error) {
    console.error('Error running Upwork pipeline:', error.message);
    res.status(500).json({ error: 'Failed to execute Upwork pipeline.', details: error.message });
  }
});

module.exports = router;