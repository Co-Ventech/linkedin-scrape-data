// import { ApifyClient } from 'apify-client';

// // Initialize the ApifyClient with your Apify API token
// // Replace the '<YOUR_API_TOKEN>' with your token
// const client = new ApifyClient({
//     token: process.env.APIFY_API_TOKEN,
// });

// // Prepare Actor input
// // Run the Actor and wait for it to finish
// const run = await client.actor("jupri/upwork").call(input);

// // Fetch and print Actor results from the run's dataset (if any)
// console.log('Results from dataset');
// console.log(`💾 Check your data here: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`);
// const { items } = await client.dataset(run.defaultDatasetId).listItems();
// items.forEach((item) => {
//     console.dir(item);
// });
// exports.fetchAndSaveJobs = async (req, res) => {
//     try {
//       const input = {
      
//         "age": 24,
//         "category": [
//             "qa-testing",
//             "ai-machine-learning",
//             "web-development",
//             "mobile-development",
//             "other-software-development",
//             "desktop-application-development",
//             "ecommerce-development",
//             "web-mobile-software-dev"
//         ],
//         "contract_to_hire": false,
//         "dev_dataset_clear": true,
//         "dev_no_strip": false,
//         "fixed": false,
//         "hourly": true,
//         "includes.attachments": false,
//         "includes.history": false,
//         "limit": 100,
//         "location": [
//             "United States",
//             "United Kingdom",
//             "Saudia Arabia",
//             "United Arab Emirates",
//             "Europe"
//         ],
//         "no_hires": false,
//         "payment_verified": false,
//         "previous_clients": false,
//         "sort": "newest",
//         "tier": [
//             "2",
//             "3",
//             "1"
//         ]

//       };
//       const jobs = await fetchJobsFromApify(input);
//       const filePath = path.join(__dirname, '../data/upwork_jobs_raw.json');
//       fs.writeFileSync(filePath, JSON.stringify(jobs, null, 2), 'utf-8');
//       res.json({ message: 'Jobs fetched and saved to JSON file', count: jobs.length });
//     } catch (error) {
//       console.error('Error fetching or saving jobs:', error);
//       res.status(500).json({ message: 'Error fetching or saving jobs', error: error.message });
//     }
//   };
  
// // 📚 Want to learn more 📖? Go to → https://docs.apify.com/api/client/js/docs