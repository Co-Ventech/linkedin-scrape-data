
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


cron.schedule('40 15 * * *', () => {
  console.log('Cron job is running at:', new Date());
  runFullPipeline();
});
