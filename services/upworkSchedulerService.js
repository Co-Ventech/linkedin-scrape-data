const cron = require('node-cron');
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const AUTOMATION_JWT_TOKEN = process.env.AUTOMATION_JWT_TOKEN;

async function runUpworkPipeline() {
  try {
    console.log('Pipeline started at', new Date().toISOString());
    

    // 1. Fetch jobs from Upwork
    await axios.post(`${API_BASE_URL}/api/upwork`);
    console.log('Upwork jobs fetched');

    // 2. Filter jobs
    await axios.get(`${API_BASE_URL}/api/upwork/filtered`);
    console.log('Upwork jobs filtered');

    // 3. Score jobs
    await axios.get(`${API_BASE_URL}/api/upwork/score`);
    console.log('Upwork jobs scored');

    // 4. Save jobs to MongoDB (requires auth)
    await axios.post(`${API_BASE_URL}/api/upwork/save-jobs`, {}, {
      headers: { Authorization: `Bearer ${AUTOMATION_JWT_TOKEN}` }
   

    });
    console.log('Pipeline complete at', new Date().toISOString());
    console.log('Upwork jobs saved to DB');
  } catch (err) {
    console.error('Upwork pipeline error:', err.message);
  }
}

// Run the Upwork pipeline every day at midnight (00:00)
cron.schedule('45 6 * * *', () => {
  console.log('Upwork cron job started at:', new Date());
  runUpworkPipeline();
});
