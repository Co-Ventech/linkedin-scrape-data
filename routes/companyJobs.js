// // // // const express = require('express');
// // // // const { authenticateToken, requireRole } = require('../middleware/auth');
// // // // const {
// // // //   getCompanyJobs,
// // // //   getJobDetails,
// // // //   updateJobStatus,
// // // //   addJobComment,
// // // //   updateJobProposal,
// // // //   getCompanyJobStats, 
// // // // } = require('../controllers/companyJobController');
// // // // const CompanyJob = require('../models/CompanyJob');

// // // // const router = express.Router();
// // // // router.get('/', authenticateToken, requireRole(['company_admin', 'company_user']), getCompanyJobs);
// // // // // router.put('/:jobId/status', authenticateToken, requireRole(['company_admin', 'company_user']), updateJobStatus);
// // // // // router.post('/:jobId/comments', authenticateToken, requireRole(['company_admin', 'company_user']), addJobComment);
// // // // // router.put('/:jobId/proposal', authenticateToken, requireRole(['company_admin', 'company_user']), updateJobProposal);
// // // // // Get company job statistics (for admins)
// // // // // router.get('/stats/overview', authenticateToken, requireRole(['company_admin']), getCompanyJobStats);
// // // // // router.get('/stats/overview', authenticateToken, requireRole(['company_admin', 'super_admin']), async (req, res) => {
// // // // //   try {
// // // // //     let companyFilter = {};
    
// // // // //     if (req.user.role === 'company_admin') {
// // // // //       companyFilter.companyId = req.user.company._id;
// // // // //     }

// // // // //     // Get status breakdown
// // // // //     const statusBreakdown = await CompanyJob.aggregate([
// // // // //       { $match: companyFilter },
// // // // //       {
// // // // //         $group: {
// // // // //           _id: '$currentStatus',
// // // // //           count: { $sum: 1 }
// // // // //         }
// // // // //       }
// // // // //     ]);

// // // // //     // Convert to object
// // // // //     const statusBreakdownObj = {};
// // // // //     statusBreakdown.forEach(item => {
// // // // //       statusBreakdownObj[item._id] = item.count;
// // // // //     });

// // // // //     // Get user activity stats
// // // // //     const userActivity = await CompanyJob.aggregate([
// // // // //       { $match: companyFilter },
// // // // //       { $unwind: '$statusHistory' },
// // // // //       {
// // // // //         $group: {
// // // // //           _id: '$statusHistory.username',
// // // // //           statusChanges: { $sum: 1 },
// // // // //           lastActivity: { $max: '$statusHistory.date' }
// // // // //         }
// // // // //       },
// // // // //       {
// // // // //         $project: {
// // // // //           userId: '$_id',
// // // // //           username: '$_id',
// // // // //           statusChanges: 1,
// // // // //           lastActivity: 1
// // // // //         }
// // // // //       }
// // // // //     ]);

// // // // //     res.json({
// // // // //       statusBreakdown: statusBreakdownObj,
// // // // //       userActivity: userActivity
// // // // //     });

// // // // //   } catch (error) {
// // // // //     console.error('Get company jobs stats error:', error);
// // // // //     res.status(500).json({ 
// // // // //       error: 'Failed to get statistics', 
// // // // //       details: error.message 
// // // // //     });
// // // // //   }
// // // // // });


// // // // // router.get('/user-jobs', authenticateToken, requireRole(['company_user']), async (req, res) => {
// // // // //   try {
// // // // //     const userId = req.user._id;
// // // // //     const companyId = req.user.company._id;
    
// // // // //     const jobs = await CompanyJob.find({
// // // // //       companyId: companyId,
// // // // //       assignedTo: userId // If you have assignment feature, otherwise get all company jobs
// // // // //     }).sort({ distributedAt: -1 });
    
// // // // //     res.json({
// // // // //       jobs,
// // // // //       total: jobs.length
// // // // //     });
    
// // // // //   } catch (error) {
// // // // //     console.error('Get user jobs error:', error);
// // // // //     res.status(500).json({ error: 'Failed to fetch jobs' });
// // // // //   }
// // // // // });

// // // // router.get('/user-jobs', authenticateToken, requireRole(['company_user']), async (req, res) => {
// // // //   try {
// // // //     console.log('Getting user jobs for:', req.user.username, 'Company:', req.user.company._id);
    
// // // //     const userId = req.user._id;
// // // //     const companyId = req.user.company._id;
    
// // // //     // Get all jobs for the user's company
// // // //     const jobs = await CompanyJob.find({
// // // //       companyId: companyId
// // // //     }).sort({ distributedAt: -1 });
    
// // // //     console.log(`Found ${jobs.length} jobs for company ${companyId}`);
    
// // // //     res.json({
// // // //       jobs,
// // // //       total: jobs.length
// // // //     });
    
// // // //   } catch (error) {
// // // //     console.error('Get user jobs error:', error);
// // // //     res.status(500).json({ 
// // // //       error: 'Failed to fetch user jobs',
// // // //       details: error.message 
// // // //     });
// // // //   }
// // // // });
// // // // router.get('/stats/overview', 
// // // //   authenticateToken, 
// // // //   requireRole(['company_admin', 'super_admin']), 
// // // //   getCompanyJobStats
// // // // );

// // // // // Get jobs assigned to the current user

// // // // router.get('/:jobId', authenticateToken, requireRole(['company_admin', 'company_user']), getJobDetails);

// // // // // Update job status (User can update their assigned jobs)
// // // // router.put('/:jobId/status', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
// // // //   try {
// // // //     const { jobId } = req.params;
// // // //     const { status, comment } = req.body;
// // // //     const username = req.user.username;
    
// // // //     const job = await CompanyJob.findOne({
// // // //       _id: jobId,
// // // //       companyId: req.user.company._id
// // // //     });
    
// // // //     if (!job) {
// // // //       return res.status(404).json({ error: 'Job not found' });
// // // //     }
    
// // // //     // Update job status
// // // //     job.currentStatus = status;
    
// // // //     // Add to status history
// // // //     job.statusHistory.push({
// // // //       status,
// // // //       changedBy: req.user._id,
// // // //       username,
// // // //       date: new Date(),
// // // //       notes: comment || `Status changed to ${status.replace('_', ' ')}`
// // // //     });
    
// // // //     await job.save();
    
// // // //     res.json({
// // // //       message: 'Job status updated successfully',
// // // //       job
// // // //     });
    
// // // //   } catch (error) {
// // // //     console.error('Update job status error:', error);
// // // //     res.status(500).json({ error: 'Failed to update job status' });
// // // //   }
// // // // });

// // // // // Add comment to job
// // // // router.post('/:jobId/comments', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
// // // //   try {
// // // //     const { jobId } = req.params;
// // // //     const { comment } = req.body;
// // // //     const username = req.user.username;
    
// // // //     const job = await CompanyJob.findOne({
// // // //       _id: jobId,
// // // //       companyId: req.user.company._id
// // // //     });
    
// // // //     if (!job) {
// // // //       return res.status(404).json({ error: 'Job not found' });
// // // //     }
    
// // // //     // Add comment to status history
// // // //     job.statusHistory.push({
// // // //       status: job.currentStatus,
// // // //       changedBy: req.user._id,
// // // //       username,
// // // //       date: new Date(),
// // // //       notes: comment,
// // // //       type: 'comment'
// // // //     });
    
// // // //     await job.save();
    
// // // //     res.json({
// // // //       message: 'Comment added successfully',
// // // //       job
// // // //     });
    
// // // //   } catch (error) {
// // // //     console.error('Add comment error:', error);
// // // //     res.status(500).json({ error: 'Failed to add comment' });
// // // //   }
// // // // });

// // // // // Generate proposal for job
// // // // router.post('/:jobId/proposals', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
// // // //   try {
// // // //     const { jobId } = req.params;
// // // //     const { proposal } = req.body;
// // // //     const username = req.user.username;
    
// // // //     const job = await CompanyJob.findOne({
// // // //       _id: jobId,
// // // //       companyId: req.user.company._id
// // // //     });
    
// // // //     if (!job) {
// // // //       return res.status(404).json({ error: 'Job not found' });
// // // //     }
    
// // // //     // Store proposal (you might want a separate Proposal model)
// // // //     job.proposal = {
// // // //       content: proposal,
// // // //       createdBy: req.user._id,
// // // //       username,
// // // //       createdAt: new Date()
// // // //     };
    
// // // //     // Add to status history
// // // //     job.statusHistory.push({
// // // //       status: job.currentStatus,
// // // //       changedBy: req.user._id,
// // // //       username,
// // // //       date: new Date(),
// // // //       notes: 'Proposal generated',
// // // //       type: 'proposal'
// // // //     });
    
// // // //     await job.save();
    
// // // //     res.json({
// // // //       message: 'Proposal generated successfully',
// // // //       job
// // // //     });
    
// // // //   } catch (error) {
// // // //     console.error('Generate proposal error:', error);
// // // //     res.status(500).json({ error: 'Failed to generate proposal' });
// // // //   }
// // // // });



// // // // // ✅ Add other user-specific job management routes
// // // // router.put('/:jobId/status', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
// // // //   try {
// // // //     const { jobId } = req.params;
// // // //     const { status, comment } = req.body;
// // // //     const username = req.user.username;
    
// // // //     // Validate ObjectId
// // // //     if (!mongoose.Types.ObjectId.isValid(jobId)) {
// // // //       return res.status(400).json({ error: 'Invalid job ID format' });
// // // //     }
    
// // // //     const job = await CompanyJob.findOne({
// // // //       _id: jobId,
// // // //       companyId: req.user.company._id
// // // //     });
    
// // // //     if (!job) {
// // // //       return res.status(404).json({ error: 'Job not found' });
// // // //     }
    
// // // //     // Update job status
// // // //     job.currentStatus = status;
    
// // // //     // Add to status history
// // // //     job.statusHistory.push({
// // // //       status,
// // // //       changedBy: req.user._id,
// // // //       username,
// // // //       date: new Date(),
// // // //       notes: comment || `Status changed to ${status.replace('_', ' ')}`,
// // // //       type: 'status_change'
// // // //     });
    
// // // //     await job.save();
    
// // // //     res.json({
// // // //       message: 'Job status updated successfully',
// // // //       job
// // // //     });
    
// // // //   } catch (error) {
// // // //     console.error('Update job status error:', error);
// // // //     res.status(500).json({ error: 'Failed to update job status' });
// // // //   }
// // // // });

// // // // router.post('/:jobId/comments', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
// // // //   try {
// // // //     const { jobId } = req.params;
// // // //     const { comment } = req.body;
// // // //     const username = req.user.username;
    
// // // //     // Validate ObjectId
// // // //     if (!mongoose.Types.ObjectId.isValid(jobId)) {
// // // //       return res.status(400).json({ error: 'Invalid job ID format' });
// // // //     }
    
// // // //     const job = await CompanyJob.findOne({
// // // //       _id: jobId,
// // // //       companyId: req.user.company._id
// // // //     });
    
// // // //     if (!job) {
// // // //       return res.status(404).json({ error: 'Job not found' });
// // // //     }
    
// // // //     // Add comment to status history
// // // //     job.statusHistory.push({
// // // //       status: job.currentStatus,
// // // //       changedBy: req.user._id,
// // // //       username,
// // // //       date: new Date(),
// // // //       notes: comment,
// // // //       type: 'comment'
// // // //     });
    
// // // //     await job.save();
    
// // // //     res.json({
// // // //       message: 'Comment added successfully',
// // // //       job
// // // //     });
    
// // // //   } catch (error) {
// // // //     console.error('Add comment error:', error);
// // // //     res.status(500).json({ error: 'Failed to add comment' });
// // // //   }
// // // // });

// // // // router.post('/:jobId/proposals', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
// // // //   try {
// // // //     const { jobId } = req.params;
// // // //     const { proposal } = req.body;
// // // //     const username = req.user.username;
    
// // // //     // Validate ObjectId
// // // //     if (!mongoose.Types.ObjectId.isValid(jobId)) {
// // // //       return res.status(400).json({ error: 'Invalid job ID format' });
// // // //     }
    
// // // //     const job = await CompanyJob.findOne({
// // // //       _id: jobId,
// // // //       companyId: req.user.company._id
// // // //     });
    
// // // //     if (!job) {
// // // //       return res.status(404).json({ error: 'Job not found' });
// // // //     }
    
// // // //     // Store proposal
// // // //     job.proposal = {
// // // //       content: proposal,
// // // //       createdBy: req.user._id,
// // // //       username,
// // // //       createdAt: new Date()
// // // //     };
    
// // // //     // Add to status history
// // // //     job.statusHistory.push({
// // // //       status: job.currentStatus,
// // // //       changedBy: req.user._id,
// // // //       username,
// // // //       date: new Date(),
// // // //       notes: 'Proposal generated',
// // // //       type: 'proposal'
// // // //     });
    
// // // //     await job.save();
    
// // // //     res.json({
// // // //       message: 'Proposal generated successfully',
// // // //       job
// // // //     });
    
// // // //   } catch (error) {
// // // //     console.error('Generate proposal error:', error);
// // // //     res.status(500).json({ error: 'Failed to generate proposal' });
// // // //   }
// // // // });

// // // // // ✅ Make sure any /:id routes come AFTER specific routes
// // // // router.get('/:id', authenticateToken, async (req, res) => {
// // // //   try {
// // // //     const { id } = req.params;
    
// // // //     // Validate ObjectId
// // // //     if (!mongoose.Types.ObjectId.isValid(id)) {
// // // //       return res.status(400).json({ error: 'Invalid job ID format' });
// // // //     }
    
// // // //     const job = await CompanyJob.findOne({
// // // //       _id: id,
// // // //       companyId: req.user.company._id
// // // //     });
    
// // // //     if (!job) {
// // // //       return res.status(404).json({ error: 'Job not found' });
// // // //     }
    
// // // //     res.json({ job });
    
// // // //   } catch (error) {
// // // //     console.error('Get job details error:', error);
// // // //     res.status(500).json({ error: 'Failed to get job details' });
// // // //   }
// // // // });
// // // // module.exports = router;
// // // const express = require('express');
// // // const { authenticateToken, requireRole } = require('../middleware/auth');
// // // const {
// // //   getCompanyJobs,
// // //   getCompanyJob,
// // //   updateCompanyJob,
// // //   addJobComment,
// // //   rateJob,
// // //   getCompanyJobStats
// // // } = require('../controllers/companyJobController');

// // // const router = express.Router();

// // // // All routes require company authentication
// // // router.use(authenticateToken);
// // // router.use(requireRole(['company_admin', 'company_user']));

// // // // Get company jobs (with filtering and pagination)
// // // router.get('/', getCompanyJobs);

// // // // Get single job details
// // // router.get('/:jobId', getCompanyJob);

// // // // Update job (status, proposal, etc.)
// // // router.put('/:jobId', updateCompanyJob);

// // // // Add comment to job
// // // router.post('/:jobId/comments', addJobComment);

// // // // Rate/score job
// // // router.post('/:jobId/rate', rateJob);

// // // // Get company job statistics
// // // router.get('/stats/overview', getCompanyJobStats);

// // // module.exports = router;

// // const express = require('express');
// // const { authenticateToken, requireRole } = require('../middleware/auth');
// // const {
// //   getCompanyJobs,
// //   getJobDetails,
// //   updateJobStatus,
// //   addJobComment,
// //   updateJobProposal,
// //   rateJob,
// //   getCompanyJobStats,
// //   getUserJobs
// // } = require('../controllers/companyJobController');

// // const router = express.Router();

// // // All routes require company authentication
// // router.use(authenticateToken);
// // router.use(requireRole(['company_admin', 'company_user']));

// // // Get company jobs (with filtering and pagination)
// // router.get('/', getCompanyJobs);

// // // Get user jobs for dashboard (simplified)
// // router.get('/user-jobs', getUserJobs);

// // // Get single job details
// // router.get('/:jobId', getJobDetails);

// // // Update job status
// // router.put('/:jobId/status', updateJobStatus);

// // // Add comment to job
// // router.post('/:jobId/comments', addJobComment);

// // // Update job proposal
// // // router.put('/:jobId/proposal', updateJobProposal);

// // // Rate/score job
// // // router.post('/:jobId/rate', rateJob);

// // // Get company job statistics
// // router.get('/stats/overview', getCompanyJobStats);

// // module.exports = router;

// const express = require('express');
// const { authenticateToken, requireRole } = require('../middleware/auth');
// const {
//   getCompanyJobs,
//   getUserJobs,
//   getJobDetails,
//   updateJobStatus,
//   addJobComment,
//   updateJobProposal,
//   rateJob,
//   getCompanyJobStats,
//   getCompanyUserPerformance
// } = require('../controllers/companyJobController');

// const router = express.Router();

// // All routes require company authentication
// router.use(authenticateToken);
// router.use(requireRole(['company_admin', 'company_user']));

// // ✅ FIXED ROUTE ORDER - Specific routes BEFORE parameter routes

// // Get company job statistics (specific route)


// module.exports = router;
// // Get user jobs for dashboard (specific route)
// router.get('/user-jobs', getUserJobs);

// router.get('/company-stats', authenticateToken, requireRole(['company_admin']), async (req, res) => {
//   try {
//     const companyId = req.user.company._id;

//     const stats = await CompanyJob.aggregate([
//       // Filter for jobs belonging to the admin's company
//       { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
//       // Group by the current status and count them
//       {
//         $group: {
//           _id: '$currentStatus',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // Format the stats into a more usable object
//     const formattedStats = {
//       total: 0,
//       not_engaged: 0,
//       applied: 0,
//       interview: 0,
//       offer: 0,
//       rejected: 0,
//     };

//     stats.forEach(stat => {
//       if (formattedStats.hasOwnProperty(stat._id)) {
//         formattedStats[stat._id] = stat.count;
//       }
//       formattedStats.total += stat.count;
//     });

//     res.json(formattedStats);

//   } catch (error) {
//     console.error('Error fetching company-wide job stats:', error);
//     res.status(500).json({ error: 'Failed to fetch company job statistics' });
//   }
// });
// // Get company jobs (with filtering and pagination)
// router.get('/', getCompanyJobs);

// // ✅ PARAMETER ROUTES COME LAST
// // Get company-wide job statistics for all users

// // Get single job details
// router.get('/:jobId', getJobDetails);

// // Update job status
// router.put('/:jobId/status', updateJobStatus);

// // Add comment to job
// router.post('/:jobId/comments', addJobComment);

// // Update job proposal
// router.put('/:jobId/proposal', updateJobProposal);

// // Rate/score job
// router.post('/:jobId/rate', rateJob);

// module.exports = router;

const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getCompanyJobs,
  getUserJobs,
  getJobDetails,
  updateJobStatus,
  addJobComment,
  updateJobProposal,
  rateJob,
  getCompanyJobStats,
  getCompanyWideStats, // ✅ Import the new function
  getCompanyUserPerformance
} = require('../controllers/companyJobController');
const CompanyJob = require('../models/CompanyJob');
const User = require('../models/User');
const { default: mongoose } = require('mongoose');

const router = express.Router();

// ✅ SPECIFIC ROUTES FIRST (before any parameter routes)

// Get user jobs for dashboard (company_user role) - uses controller function
router.get('/user-jobs', authenticateToken, requireRole(['company_user']), getUserJobs);

// ✅ Get company-wide job statistics for all users (company_admin only) - uses controller function
router.get('/company-stats', authenticateToken, requireRole(['company_admin']), getCompanyWideStats);

// const userActivityStats = await CompanyJob.aggregate([
//   { $unwind: { path: '$statusHistory', preserveNullAndEmptyArrays: true } },
//   {
//     $group: {
//       _id: { companyId: '$companyId', username: '$statusHistory.username', status: '$statusHistory.status' },
//       statusChanges: { $sum: 1 },
//       lastActivity: { $max: '$statusHistory.date' }
//     }
//   },
//   {
//     $group: {
//       _id: '$_id.companyId',
//       userActivity: {
//         $push: {
//           username: '$_id.username',
//           status: '$_id.status',
//           statusChanges: '$statusChanges',
//           lastActivity: '$lastActivity'
//         }
//       }
//     }
//   }
// ]);

// const allUsers = await User.aggregate([
//   {
//     $group: {
//       _id: '$companyId',
//       totalUsers: { $sum: 1 },
//       users: { $push: { username: '$username', email: '$email' } }
//     }
//   }
// ]);

// Get company job statistics (existing route for admin overview)
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
//       { $unwind: { path: '$statusHistory', preserveNullAndEmptyArrays: true } },
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
//       userActivity: userActivity || []
//     });

//   } catch (error) {
//     console.error('Get company jobs stats error:', error);
//     res.status(500).json({
//       error: 'Failed to get statistics',
//       details: error.message
//     });
//   }
// });

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
//       { $unwind: { path: '$statusHistory', preserveNullAndEmptyArrays: true } },
//       {
//         $group: {
//           _id: { username: '$statusHistory.username', date: { $dateToString: { format: '%Y-%m-%d', date: '$statusHistory.date' } } },
//           status: { $first: '$statusHistory.status' },
//           count: { $sum: 1 }
//         }
//       },
//       {
//         $group: {
//           _id: '$_id.username',
//           dailyTotals: {
//             $push: {
//               date: '$_id.date',
//               status: '$status',
//               count: '$count'
//             }
//           },
//           totalEngagement: { $sum: '$count' }
//         }
//       },
//       {
//         $project: {
//           username: '$_id',
//           dailyTotals: 1,
//           totalEngagement: 1
//         }
//       }
//     ]);

//     // Calculate grand totals
//     const grandTotal = await CompanyJob.aggregate([
//       { $match: companyFilter },
//       { $unwind: { path: '$statusHistory', preserveNullAndEmptyArrays: true } },
//       {
//         $group: {
//           _id: '$statusHistory.status',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     const grandTotalObj = {
//       total_engagement: 0,
//       not_engaged: 0,
//       applied: 0,
//       engaged: 0,
//       interview: 0,
//       offer: 0,
//       rejected: 0,
//       archived: 0
//     };

//     grandTotal.forEach(item => {
//       if (grandTotalObj.hasOwnProperty(item._id)) {
//         grandTotalObj[item._id] = item.count;
//         grandTotalObj.total_engagement += item.count;
//       }
//     });

//     res.json({
//       users: userActivity || [],
//       dailyTotals: userActivity.map(user => user.dailyTotals) || [],
//       grandTotal: grandTotalObj
//     });
//   } catch (error) {
//     console.error('Get company jobs stats error:', error);
//     res.status(500).json({
//       error: 'Failed to get statistics',
//       details: error.message
//     });
//   }
// });

router.get('/stats/overview', authenticateToken, requireRole(['company_admin', 'super_admin']), async (req, res) => {
  try {
    let companyFilter = {};

    if (req.user.role === 'company_admin') {
      companyFilter.companyId = req.user.company._id;
    }

    // Get user statuses
    const userStatuses = await CompanyJob.aggregate([
      { $match: companyFilter },
      { $unwind: { path: '$statusHistory', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { username: '$statusHistory.username', status: '$statusHistory.status' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.username',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          }
        }
      },
      {
        $project: {
          username: '$_id',
          statuses: {
            $arrayToObject: {
              $map: {
                input: '$statuses',
                as: 'status',
                in: { k: '$$status.status', v: '$$status.count' }
              }
            }
          }
        }
      }
    ]);

    // Get daily totals
    const dailyTotals = await CompanyJob.aggregate([
      { $match: companyFilter },
      { $unwind: { path: '$statusHistory', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$statusHistory.date' } }, status: '$statusHistory.status' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          },
          total_engagement: { $sum: '$count' }
        }
      },
      {
        $project: {
          date: '$_id',
          total_engagement: 1,
          statuses: {
            $arrayToObject: {
              $map: {
                input: '$statuses',
                as: 'status',
                in: { k: '$$status.status', v: '$$status.count' }
              }
            }
          }
        }
      }
    ]);

    // Format daily totals
    const formattedDailyTotals = dailyTotals.map(day => ({
      date: day.date,
      total_engagement: day.total_engagement,
      not_engaged: day.statuses.not_engaged || 0,
      applied: day.statuses.applied || 0,
      engaged: day.statuses.engaged || 0,
      interview: day.statuses.interview || 0,
      offer: day.statuses.offer || 0,
      rejected: day.statuses.rejected || 0,
      onboard: day.statuses.onboard || 0
    }));

    // Get grand totals
    const grandTotal = await CompanyJob.aggregate([
      { $match: companyFilter },
      { $unwind: { path: '$statusHistory', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$statusHistory.status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format grand totals
    const grandTotalObj = {
      total_engagement: 0,
      not_engaged: 0,
      applied: 0,
      engaged: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      onboard: 0
    };

    grandTotal.forEach(item => {
      if (grandTotalObj.hasOwnProperty(item._id)) {
        grandTotalObj[item._id] = item.count;
        grandTotalObj.total_engagement += item.count;
      }
    });

    res.json({
      users: userStatuses || [],
      dailyTotals: formattedDailyTotals || [],
      grandTotal: grandTotalObj
    });
  } catch (error) {
    console.error('Get company jobs stats error:', error);
    res.status(500).json({
      error: 'Failed to get statistics',
      details: error.message
    });
  }
});

router.get('/stats/all-companies', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  console.log('Request received at /stats/all-companies');
  try {
    // Aggregate job stats for all companies
    const allCompaniesStats = await CompanyJob.aggregate([
      {
        $group: {
          _id: '$companyId',
          totalJobs: { $sum: 1 },
          leadsQualified: { $sum: { $cond: [{ $eq: ['$currentStatus', 'onboard'] }, 1, 0] } }, // Count jobs with 'onboard' status
          statusBreakdown: {
            $push: {
              status: '$currentStatus',
              count: { $sum: 1 }
            }
          }
        }
      }
    ]);

    // Aggregate user stats for all companies
    const allUsers = await User.aggregate([
      {
        $group: {
          _id: '$companyId',
          totalUsers: { $sum: 1 },
          users: { $push: { username: '$username', email: '$email' } }
        }
      }
    ]);

    // Aggregate user activity stats for all companies
   const userActivityStats = await CompanyJob.aggregate([
  { $unwind: { path: '$statusHistory', preserveNullAndEmptyArrays: true } },
  {
    $group: {
      _id: { companyId: '$companyId', username: '$statusHistory.username', status: '$statusHistory.status' },
      statusChanges: { $sum: 1 },
      lastActivity: { $max: '$statusHistory.date' }
    }
  },
  {
    $group: {
      _id: '$_id.companyId',
      userActivity: {
        $push: {
          username: '$_id.username',
          status: '$_id.status',
          statusChanges: '$statusChanges',
          lastActivity: '$lastActivity'
        }
      }
    }
  }
]);

    // Combine stats into a single response
    const combinedData = allCompaniesStats.map(companyStat => {
      const userData = allUsers.find(user => user._id && user._id.toString() === companyStat._id.toString());
      const userActivity = userActivityStats.find(activity => activity._id && activity._id.toString() === companyStat._id.toString());

      return {
        companyId: companyStat._id,
        totalJobs: companyStat.totalJobs,
        leadsQualified: companyStat.leadsQualified,
        statusBreakdown: companyStat.statusBreakdown.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + item.count;
          return acc;
        }, {}),
        totalUsers: userData ? userData.totalUsers : 0,
        users: userData ? userData.users : [],
        userActivity: userActivity ? userActivity.userActivity : []
      };
    });

    res.json({
      companies: combinedData
    });
  } catch (error) {
    console.error('Error fetching all companies stats:', error);
    res.status(500).json({
      error: 'Failed to fetch all companies statistics',
      details: error.message
    });
  }
});

// ✅ GENERAL ROUTES (before parameter routes)

// Get company jobs (with filtering and pagination) - both roles
router.get('/', authenticateToken, requireRole(['company_admin', 'company_user']), getCompanyJobs);

// ✅ PARAMETER ROUTES COME LAST

// Get single job details
router.get('/:jobId', authenticateToken, requireRole(['company_admin', 'company_user']), getJobDetails);

// Update job status
router.put('/:jobId/status', authenticateToken, requireRole(['company_user', 'company_admin']), updateJobStatus);

// Add comment to job
router.post('/:jobId/comments', authenticateToken, requireRole(['company_user', 'company_admin']), addJobComment);

// Generate proposal for job
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

// Update job proposal
router.put('/:jobId/proposal', authenticateToken, requireRole(['company_user', 'company_admin']), updateJobProposal);

// Rate/score job
router.post('/:jobId/rate', authenticateToken, requireRole(['company_user', 'company_admin']), rateJob);

module.exports = router;
