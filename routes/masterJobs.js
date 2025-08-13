// const express = require('express');
// const { authenticateToken, requireRole } = require('../middleware/auth');
// const {
//   uploadScoredJobsFromFile,
//   getMasterJobs,
//   getJobBatches,
//   deleteBatch
// } = require('../controllers/masterJobController');
// const { distributeJobsFromBatch, distributeAllJobs } = require('../controllers/jobDistributionController');
// const router = express.Router();




// // Distribute jobs from batch
// router.post('/jobadmin/distribute/:batchId', authenticateToken, requireRole(['super_admin']), distributeJobsFromBatch);

// // Distribute all undistributed jobs
// router.post('/jobadmin/distribute', authenticateToken, requireRole(['super_admin']), distributeAllJobs);



// // Upload scored jobs from file (Super Admin or system)
// router.post('/jobadmin/upload', authenticateToken, requireRole(['super_admin']), uploadScoredJobsFromFile);

// // Get master jobs with filtering
// router.get('/jobadmin/master-jobs', authenticateToken, requireRole(['super_admin']), getMasterJobs);

// // Get job batches
// router.get('/jobadmin/batches', authenticateToken, requireRole(['super_admin']), getJobBatches);

// // Delete batch
// router.delete('/jobadmin/batches/:batchId', authenticateToken, requireRole(['super_admin']), deleteBatch);

// module.exports = router;
// const express = require('express');
// const { authenticateToken, requireRole } = require('../middleware/auth');
// const {
//   uploadScoredJobsFromFile,
//   getMasterJobs,
//   getJobBatches,
//   deleteBatch,distributeToSpecificCompanies
// } = require('../controllers/masterJobController');

// const {
//   distributeJobsFromBatch,
//   distributeAllJobs,
//   getDistributionStats
// } = require('../controllers/jobDistributionController');

// const router = express.Router();

// // Upload scored jobs from file (Super Admin or system)
// router.post('/upload', authenticateToken, requireRole(['super_admin']), uploadScoredJobsFromFile);

// // Get master jobs with filtering
// router.get('/', authenticateToken, requireRole(['super_admin']), getMasterJobs);

// // Get job batches
// router.get('/batches', authenticateToken, requireRole(['super_admin']), getJobBatches);

// // Delete batch
// router.delete('/batches/:batchId', authenticateToken, requireRole(['super_admin']), deleteBatch);

// // Distribution routes
// router.post('/distribute/:batchId', authenticateToken, requireRole(['super_admin']), distributeJobsFromBatch);
// router.post('/distribute', authenticateToken, requireRole(['super_admin']), distributeAllJobs);

// // Distribution stats route
// router.get('/distribution-stats', authenticateToken, requireRole(['super_admin']), getDistributionStats);






const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  uploadScoredJobsFromFile,
  getMasterJobs,
  getJobBatches,
  deleteBatch,
  distributeToSpecificCompanies,
  getBatchDetails
} = require('../controllers/masterJobController');

const {
  distributeJobsFromBatch,
  distributeAllJobs,
  getDistributionStats
} = require('../controllers/jobDistributionController');

const router = express.Router();

// Upload scored jobs from file (Super Admin only) - NO AUTO-DISTRIBUTION
router.post('/upload', authenticateToken, requireRole(['super_admin']), uploadScoredJobsFromFile);

// Get master jobs with filtering
router.get('/', authenticateToken, requireRole(['super_admin']), getMasterJobs);

// Get job batches
router.get('/batches', authenticateToken, requireRole(['super_admin']), getJobBatches);

router.get('/batches/:batchId', authenticateToken, requireRole(['super_admin']), getBatchDetails);

// Delete batch
router.delete('/batches/:batchId', authenticateToken, requireRole(['super_admin']), deleteBatch);

// DISTRIBUTION ROUTES
// Distribute jobs from specific batch to all active companies
router.post('/distribute/batch/:batchId', authenticateToken, requireRole(['super_admin']), distributeJobsFromBatch);

// Distribute jobs from specific batch to specific companies
router.post('/distribute/batch/:batchId/companies', authenticateToken, requireRole(['super_admin']), distributeJobsFromBatch);

// Distribute all undistributed jobs to all active companies
router.post('/distribute/all',
   authenticateToken, requireRole(['super_admin']), distributeAllJobs);

// Distribute to specific companies (all undistributed jobs)
router.post('/distribute/companies', authenticateToken, requireRole(['super_admin']), distributeToSpecificCompanies);

// Get distribution statistics
router.get('/distribute/stats', authenticateToken, requireRole(['super_admin']), getDistributionStats);


// Distribute to selected companies - THIS WAS MISSING
router.post('/distribute-selective', authenticateToken, requireRole(['super_admin']), distributeToSpecificCompanies);
// Get job details
router.get('/jobs/:jobId/details', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await MasterJob.findById(jobId).lean();
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get distribution info
    const distributionInfo = await CompanyJob.aggregate([
      { $match: { masterJobId: mongoose.Types.ObjectId(jobId) } },
      {
        $lookup: {
          from: 'companies',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $unwind: '$company'
      },
      {
        $group: {
          _id: '$currentStatus',
          count: { $sum: 1 },
          companies: {
            $push: {
              name: '$company.name',
              status: '$currentStatus',
              distributedAt: '$distributedAt'
            }
          }
        }
      }
    ]);

    res.json({
      job,
      distributionInfo,
      totalDistributed: await CompanyJob.countDocuments({ masterJobId: jobId })
    });

  } catch (error) {
    console.error('Get job details error:', error);
    res.status(500).json({ error: 'Failed to get job details' });
  }
});

// Distribute specific batch
// router.post('/distribute/:batchId', authenticateToken, requireRole(['super_admin']), distributeBatch);
module.exports = router;
