
const express = require('express');
const router = express.Router();
const apifyController = require('../controllers/apifyController');
const authMiddleware = require('../middleware/authMiddleware');


// Fetch jobs from Apify and save as raw JSON
router.get('/apify', apifyController.fetchAndSaveJobs);

router.get('/apify/filtered', apifyController.getFilteredJobs);

// Run AIML processing and return result
router.get('/apify/score', apifyController.scoreJobs);

// Get scored jobs as JSON
router.get('/apify/scored', apifyController.getScoredJobs);

// Return filtered jobs with only selected fields

// save jobs to mongodb
router.post('/save-jobs', authMiddleware, apifyController.uploadScoredJobsFromFile);

//get data from mongodb
router.get('/jobs-by-date', authMiddleware, apifyController.getJobsByDate);

// Update job status and comments in a user's batch
router.patch('/jobs/:jobId', authMiddleware, apifyController.updateJobStatusAndComment);

// ...existing code...

// Export jobs-by-date data to Excel
router.get('/jobs-by-date/excel', authMiddleware, apifyController.exportJobsByDateToExcel);

// ... existing code ...

// Get a specific job by id for the authenticated user
router.get('/apify/job', authMiddleware, apifyController.getJobById);

// ... existing code ...
// ...existing code...

module.exports = router;
