const cron = require('node-cron');
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const AUTOMATION_JWT_TOKEN = process.env.AUTOMATION_JWT_TOKEN;
console.log(API_BASE_URL);

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function runUpworkPipeline() {
  try {
    console.log('Pipeline started at', new Date().toISOString());
        await delay(10000);

    // 1. Fetch jobs from Upwork
    await axios.get(`${API_BASE_URL}/api/upwork`);
    console.log('Upwork jobs fetched');
    await delay(10000);

    // 2. Filter jobs
    await axios.get(`${API_BASE_URL}/api/upwork/filtered`);
    console.log('Upwork jobs filtered');
    await delay(10000);

    // 3. Score jobs
    await axios.get(`${API_BASE_URL}/api/upwork/score`);
    console.log('Upwork jobs scored');
    await delay(10000);

    // 4. Save jobs to MongoDB (requires auth)
    await axios.post(`${API_BASE_URL}/api/upwork/save-jobs`, {}, {
      headers: { Authorization: `Bearer ${AUTOMATION_JWT_TOKEN}` }
    });
    console.log('Upwork jobs saved to DB');
    await delay(10000);

    console.log('Pipeline complete at', new Date().toISOString());
  } catch (err) {
    console.error('Upwork pipeline error:', err.message);
  }
}

// Run the Upwork pipeline every day at midnight (00:00)
cron.schedule('0 */6 * * *', () => {
  console.log('Upwork cron job started at:', new Date());
  runUpworkPipeline();
});
