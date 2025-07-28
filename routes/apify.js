
const express = require('express');
const router = express.Router();
const apifyController = require('../controllers/apifyController');
const authMiddleware = require('../middleware/authMiddleware');


// Fetch jobs from Apify and save as raw JSON
router.get('/linkedin', apifyController.fetchAndSaveJobs);

router.get('/linkedin/filtered', apifyController.getFilteredJobs);

// Run AIML processing and return result
router.get('/linkedin/score', apifyController.scoreJobs);

// Get scored jobs as JSON
router.get('/linkedin/scored', apifyController.getScoredJobs);

// Return filtered jobs with only selected fields

// save jobs to mongodb
router.post('/linkedin/save-jobs', authMiddleware, apifyController.uploadScoredJobsFromFile);

//get data from mongodb
router.get('/linkedin/jobs-by-date', authMiddleware, apifyController.getJobsByDate);

// Update job status and comments in a user's batch
router.patch('/linkedin/job/:jobId', authMiddleware, apifyController.updateJobStatusAndComment);

// ...existing code...

// Export jobs-by-date data to Excel
router.get('/linkedin/jobs-by-date/excel', authMiddleware, apifyController.exportJobsByDateToExcel);

// ... existing code ...

// Get a specific job by id for the authenticated user
router.get('/linkedin/job', authMiddleware, apifyController.getJobById);

// ... existing code ...
// ...existing code...
router.post('/linkedin/job/:jobId/generate-proposal', authMiddleware, apifyController.generateProposalForJob);

router.patch('/linkedin/job/:jobId/proposal', authMiddleware, apifyController.updateProposalText);


module.exports = router;
