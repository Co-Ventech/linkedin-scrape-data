// routes/google.js
const express = require('express');
const router = express.Router();
const googleController = require('../controllers/googleController');
// Optionally add auth here if needed

router.get('/scrape-jobs', googleController.scrapeJobs);
router.get('/scrape-jobs-clean', googleController.scrapeJobsClean);
router.get('/scrape-stats', googleController.scrapeStats);
router.get('/test-query/:query', googleController.testSingleQuery);
router.get('/health', googleController.health);
router.get('/file-jobs', googleController.getJobsFromFile);
module.exports = router;