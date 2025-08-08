const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getCompanyJobs,
  getJobDetails,
  updateJobStatus,
  addJobComment,
  updateJobProposal,
  getCompanyJobStats, 
} = require('../controllers/companyJobController');

const router = express.Router();
router.get('/', authenticateToken, requireRole(['company_admin', 'company_user']), getCompanyJobs);
router.get('/:jobId', authenticateToken, requireRole(['company_admin', 'company_user']), getJobDetails);
// router.put('/:jobId/status', authenticateToken, requireRole(['company_admin', 'company_user']), updateJobStatus);
// router.post('/:jobId/comments', authenticateToken, requireRole(['company_admin', 'company_user']), addJobComment);
// router.put('/:jobId/proposal', authenticateToken, requireRole(['company_admin', 'company_user']), updateJobProposal);
// Get company job statistics (for admins)
// router.get('/stats/overview', authenticateToken, requireRole(['company_admin']), getCompanyJobStats);
// router.get('/stats/overview', authenticateToken, requireRole(['company_admin', 'super_admin']), async (req, res) => {
//   try {
//     let companyFilter = {};
    
//     if (req.user.role === 'company_admin') {
//       companyFilter.companyId = req.user.company._id;
//     }

//     // Get status breakdown
//     const statusBreakdown = await CompanyJob.aggregate([
//       { $match: companyFilter },
//       {
//         $group: {
//           _id: '$currentStatus',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // Convert to object
//     const statusBreakdownObj = {};
//     statusBreakdown.forEach(item => {
//       statusBreakdownObj[item._id] = item.count;
//     });

//     // Get user activity stats
//     const userActivity = await CompanyJob.aggregate([
//       { $match: companyFilter },
//       { $unwind: '$statusHistory' },
//       {
//         $group: {
//           _id: '$statusHistory.username',
//           statusChanges: { $sum: 1 },
//           lastActivity: { $max: '$statusHistory.date' }
//         }
//       },
//       {
//         $project: {
//           userId: '$_id',
//           username: '$_id',
//           statusChanges: 1,
//           lastActivity: 1
//         }
//       }
//     ]);

//     res.json({
//       statusBreakdown: statusBreakdownObj,
//       userActivity: userActivity
//     });

//   } catch (error) {
//     console.error('Get company jobs stats error:', error);
//     res.status(500).json({ 
//       error: 'Failed to get statistics', 
//       details: error.message 
//     });
//   }
// });

router.get('/stats/overview', 
  authenticateToken, 
  requireRole(['company_admin', 'super_admin']), 
  getCompanyJobStats
);

// Get jobs assigned to the current user
router.get('/user-jobs', authenticateToken, requireRole(['company_user']), async (req, res) => {
  try {
    const userId = req.user._id;
    const companyId = req.user.company._id;
    
    const jobs = await CompanyJob.find({
      companyId: companyId,
      assignedTo: userId // If you have assignment feature, otherwise get all company jobs
    }).sort({ distributedAt: -1 });
    
    res.json({
      jobs,
      total: jobs.length
    });
    
  } catch (error) {
    console.error('Get user jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Update job status (User can update their assigned jobs)
router.put('/:jobId/status', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, comment } = req.body;
    const username = req.user.username;
    
    const job = await CompanyJob.findOne({
      _id: jobId,
      companyId: req.user.company._id
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Update job status
    job.currentStatus = status;
    
    // Add to status history
    job.statusHistory.push({
      status,
      changedBy: req.user._id,
      username,
      date: new Date(),
      notes: comment || `Status changed to ${status.replace('_', ' ')}`
    });
    
    await job.save();
    
    res.json({
      message: 'Job status updated successfully',
      job
    });
    
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({ error: 'Failed to update job status' });
  }
});

// Add comment to job
router.post('/:jobId/comments', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { comment } = req.body;
    const username = req.user.username;
    
    const job = await CompanyJob.findOne({
      _id: jobId,
      companyId: req.user.company._id
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Add comment to status history
    job.statusHistory.push({
      status: job.currentStatus,
      changedBy: req.user._id,
      username,
      date: new Date(),
      notes: comment,
      type: 'comment'
    });
    
    await job.save();
    
    res.json({
      message: 'Comment added successfully',
      job
    });
    
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Generate proposal for job
router.post('/:jobId/proposals', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { proposal } = req.body;
    const username = req.user.username;
    
    const job = await CompanyJob.findOne({
      _id: jobId,
      companyId: req.user.company._id
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Store proposal (you might want a separate Proposal model)
    job.proposal = {
      content: proposal,
      createdBy: req.user._id,
      username,
      createdAt: new Date()
    };
    
    // Add to status history
    job.statusHistory.push({
      status: job.currentStatus,
      changedBy: req.user._id,
      username,
      date: new Date(),
      notes: 'Proposal generated',
      type: 'proposal'
    });
    
    await job.save();
    
    res.json({
      message: 'Proposal generated successfully',
      job
    });
    
  } catch (error) {
    console.error('Generate proposal error:', error);
    res.status(500).json({ error: 'Failed to generate proposal' });
  }
});

router.get('/user-jobs', authenticateToken, requireRole(['company_user']), async (req, res) => {
  try {
    console.log('Getting user jobs for:', req.user.username, 'Company:', req.user.company._id);
    
    const userId = req.user._id;
    const companyId = req.user.company._id;
    
    // Get all jobs for the user's company
    const jobs = await CompanyJob.find({
      companyId: companyId
    }).sort({ distributedAt: -1 });
    
    console.log(`Found ${jobs.length} jobs for company ${companyId}`);
    
    res.json({
      jobs,
      total: jobs.length
    });
    
  } catch (error) {
    console.error('Get user jobs error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user jobs',
      details: error.message 
    });
  }
});

// ✅ Add other user-specific job management routes
router.put('/:jobId/status', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, comment } = req.body;
    const username = req.user.username;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }
    
    const job = await CompanyJob.findOne({
      _id: jobId,
      companyId: req.user.company._id
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Update job status
    job.currentStatus = status;
    
    // Add to status history
    job.statusHistory.push({
      status,
      changedBy: req.user._id,
      username,
      date: new Date(),
      notes: comment || `Status changed to ${status.replace('_', ' ')}`,
      type: 'status_change'
    });
    
    await job.save();
    
    res.json({
      message: 'Job status updated successfully',
      job
    });
    
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({ error: 'Failed to update job status' });
  }
});

router.post('/:jobId/comments', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { comment } = req.body;
    const username = req.user.username;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }
    
    const job = await CompanyJob.findOne({
      _id: jobId,
      companyId: req.user.company._id
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Add comment to status history
    job.statusHistory.push({
      status: job.currentStatus,
      changedBy: req.user._id,
      username,
      date: new Date(),
      notes: comment,
      type: 'comment'
    });
    
    await job.save();
    
    res.json({
      message: 'Comment added successfully',
      job
    });
    
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

router.post('/:jobId/proposals', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { proposal } = req.body;
    const username = req.user.username;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }
    
    const job = await CompanyJob.findOne({
      _id: jobId,
      companyId: req.user.company._id
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Store proposal
    job.proposal = {
      content: proposal,
      createdBy: req.user._id,
      username,
      createdAt: new Date()
    };
    
    // Add to status history
    job.statusHistory.push({
      status: job.currentStatus,
      changedBy: req.user._id,
      username,
      date: new Date(),
      notes: 'Proposal generated',
      type: 'proposal'
    });
    
    await job.save();
    
    res.json({
      message: 'Proposal generated successfully',
      job
    });
    
  } catch (error) {
    console.error('Generate proposal error:', error);
    res.status(500).json({ error: 'Failed to generate proposal' });
  }
});

// ✅ Make sure any /:id routes come AFTER specific routes
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }
    
    const job = await CompanyJob.findOne({
      _id: id,
      companyId: req.user.company._id
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({ job });
    
  } catch (error) {
    console.error('Get job details error:', error);
    res.status(500).json({ error: 'Failed to get job details' });
  }
});
module.exports = router;
