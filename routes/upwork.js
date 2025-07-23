const express = require('express');
const router = express.Router();
const upworkController = require('../controllers/upworkController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/upwork/fetch
router.post('/upwork', upworkController.fetchAndSaveJobs);

// GET /api/upwork/filter
router.get('/upwork/filtered', upworkController.filterUpworkJobs);

router.get('/upwork/score', upworkController.scoreUpworkJobs);

router.get('/upwork/scored', upworkController.getUpworkFinalScores);

// Save jobs (bulk insert/upsert)
router.post('/upwork/save-jobs', authMiddleware,upworkController.saveUpworkJobsBatchFromFile);

// Get jobs by date (query param: ?date=YYYY-MM-DD)
router.get('/upwork/jobs-by-date',authMiddleware, upworkController.getJobsByDate);

// Edit job by jobId
router.patch('/upwork/job/:jobId',authMiddleware, upworkController.editJobById);
// ... existing code ...

// Get a specific upwork job by id for the authenticated user
router.get('/upwork/job', authMiddleware, upworkController.getJobById);

// ... existing code ...

module.exports = router;
