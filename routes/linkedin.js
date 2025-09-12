
const express = require('express');
const router = express.Router();
const linkedinController = require('../controllers/linkedinController');
// const authMiddleware = require('../middleware/authMiddleware');


// Fetch jobs from Apify and save as raw JSON
router.get('/linkedin', linkedinController.fetchAndSaveJobs);

router.get('/linkedin/filtered', linkedinController.getFilteredJobs);

// Run AIML processing and return result
router.get('/linkedin/score', linkedinController.scoreJobs);

// Get scored jobs as JSON
router.get('/linkedin/scored', linkedinController.getScoredJobs);

// Return filtered jobs with only selected fields

// // save jobs to mongodb
// router.post('/linkedin/save-jobs', authMiddleware, linkedinController.uploadScoredJobsFromFile);

// //get data from mongodb
// router.get('/linkedin/jobs-by-date', authMiddleware, linkedinController.getJobsByDate);

// // Update job status and comments in a user's batch
// router.patch('/linkedin/job/:jobId', authMiddleware, linkedinController.updateJobStatusAndComment);

// // ...existing code...

// // Export jobs-by-date data to Excel
// router.get('/linkedin/jobs-by-date/excel', authMiddleware, linkedinController.exportJobsByDateToExcel);

// // ... existing code ...

// // Get a specific job by id for the authenticated user
// router.get('/linkedin/job', authMiddleware, linkedinController.getJobById);

// // ... existing code ...
// // ...existing code...
// router.post('/linkedin/job/:jobId/generate-proposal', authMiddleware, linkedinController.generateProposalForJob);

// router.patch('/linkedin/job/:jobId/proposal', authMiddleware, linkedinController.updateProposalText);


module.exports = router;
