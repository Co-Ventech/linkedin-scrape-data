
const cron = require('node-cron');
const axios = require('axios');
const { sendSuccessEmail, sendErrorEmail } = require('./emailService');


const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const AUTOMATION_JWT_TOKEN = process.env.AUTOMATION_JWT_TOKEN;
console.log(API_BASE_URL);

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
const jobName = 'LinkedIn Jobs Pipeline';


async function runlinkedinPipeline() {
  try {
    console.log(`${jobName} started at`, new Date().toISOString());
    console.log('Pipeline started at', new Date().toISOString());
        await delay(10000);

    // // 1. Fetch jobs from Upwork
    // await axios.get(`${API_BASE_URL}/api/linkedin`,{ timeout: 900000 });
    // console.log('linkedin jobs fetched');
    // await delay(10000);

    // 2. Filter jobs
    await axios.get(`${API_BASE_URL}/api/linkedin/filtered`,{ timeout: 900000 });
    console.log('linkedin jobs filtered');
    await delay(10000);

    // 3. Score jobs
    await axios.get(`${API_BASE_URL}/api/linkedin/score`,{ timeout: 900000 });
    console.log('linkedin jobs scored');
    await delay(10000);

    // 4. Save jobs to MongoDB (requires auth)
    await axios.post(`${API_BASE_URL}/api/linkedin/save-jobs`, {}, {
      headers: { Authorization: `Bearer ${AUTOMATION_JWT_TOKEN}` }, timeout: 900000 
    });
    console.log('linkedin jobs saved to DB');
    await delay(10000);
    console.log(`${jobName} complete at`, new Date().toISOString());
    console.log('Pipeline complete at', new Date().toISOString());
    await sendSuccessEmail(
      jobName,
      'All LinkedIn pipeline steps (fetch, filter, score, save) completed successfully.'
    );
  } catch (err) {
    console.error('Pipeline error:', err.message, err.stack, err.response?.data);
    await sendErrorEmail(jobName, `Error: ${err.message}\nStack: ${err.stack}\nResponse: ${JSON.stringify(err.response?.data)}`);
  }
}

// Run the linkedin pipeline every day at midnight (00:00)
// cron.schedule('1 5 * * *', () => {
  cron.schedule('20 15 * * *', () => {

  console.log('linkedin cron job started at:', new Date());
  runlinkedinPipeline();
});
