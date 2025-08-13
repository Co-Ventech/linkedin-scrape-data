// // // // // // const CompanyJob = require('../models/CompanyJob');
// // // // // // const MasterJob = require('../models/MasterJob');
// // // // // // const Company = require('../models/Company');
// // // // // // const mongoose = require('mongoose');

// // // // // // // Get company jobs with filters
// // // // // // const getCompanyJobs = async (req, res) => {
// // // // // //   try {
// // // // // //     const companyId = req.user.company._id;
// // // // // //     const {
// // // // // //       status,
// // // // // //       platform,
// // // // // //       search,
// // // // // //       page = 1,
// // // // // //       limit = 20,
// // // // // //       sortBy = 'distributedAt',
// // // // // //       sortOrder = 'desc'
// // // // // //     } = req.query;

// // // // // //     // Build query
// // // // // //     const query = { companyId };
    
// // // // // //     if (status && status !== '') {
// // // // // //       query.currentStatus = status;
// // // // // //     }
    
// // // // // //     if (platform && platform !== '') {
// // // // // //       query.platform = platform;
// // // // // //     }
    
// // // // // //     if (search && search !== '') {
// // // // // //       query.$or = [
// // // // // //         { title: new RegExp(search, 'i') },
// // // // // //         { companyName: new RegExp(search, 'i') }
// // // // // //       ];
// // // // // //     }

// // // // // //     // Get jobs with pagination
// // // // // //     const jobs = await CompanyJob.find(query)
// // // // // //       .populate('masterJobId')
// // // // // //       .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
// // // // // //       .limit(limit * 1)
// // // // // //       .skip((page - 1) * limit)
// // // // // //       .lean();

// // // // // //     const total = await CompanyJob.countDocuments(query);

// // // // // //     // Format jobs for frontend
// // // // // //     const formattedJobs = jobs.map(job => ({
// // // // // //       _id: job._id,
// // // // // //       jobId: job.jobId,
// // // // // //       platform: job.platform,
// // // // // //       title: job.title,
// // // // // //       companyName: job.companyName,
// // // // // //       location: job.location,
// // // // // //       currentStatus: job.currentStatus,
// // // // // //       postedDate: job.postedDate,
// // // // // //       distributedAt: job.distributedAt,
// // // // // //       statusHistory: job.statusHistory || [],
// // // // // //       comments: job.comments || [],
// // // // // //       proposal: job.proposal || '',
// // // // // //       masterJob: job.masterJobId // Full master job details if needed
// // // // // //     }));

// // // // // //     res.json({
// // // // // //       jobs: formattedJobs,
// // // // // //       pagination: {
// // // // // //         current: parseInt(page),
// // // // // //         pages: Math.ceil(total / limit),
// // // // // //         total,
// // // // // //         hasNext: page < Math.ceil(total / limit),
// // // // // //         hasPrev: page > 1
// // // // // //       }
// // // // // //     });

// // // // // //   } catch (error) {
// // // // // //     console.error('Get company jobs error:', error);
// // // // // //     res.status(500).json({ 
// // // // // //       error: 'Failed to fetch company jobs', 
// // // // // //       details: error.message 
// // // // // //     });
// // // // // //   }
// // // // // // };

// // // // // // // Get job details with full master job data
// // // // // // const getJobDetails = async (req, res) => {
// // // // // //   try {
// // // // // //     const { jobId } = req.params;
// // // // // //     const companyId = req.user.company._id;

// // // // // //     const job = await CompanyJob.findOne({
// // // // // //       _id: jobId,
// // // // // //       companyId
// // // // // //     }).populate('masterJobId');

// // // // // //     if (!job) {
// // // // // //       return res.status(404).json({ error: 'Job not found' });
// // // // // //     }

// // // // // //     res.json({
// // // // // //       job,
// // // // // //       masterJobDetails: job.masterJobId
// // // // // //     });

// // // // // //   } catch (error) {
// // // // // //     res.status(500).json({ 
// // // // // //       error: 'Failed to fetch job details', 
// // // // // //       details: error.message 
// // // // // //     });
// // // // // //   }
// // // // // // };

// // // // // // // Update job status with history tracking
// // // // // // const updateJobStatus = async (req, res) => {
// // // // // //   try {
// // // // // //     const { jobId } = req.params;
// // // // // //     const { status, notes } = req.body;
// // // // // //     const companyId = req.user.company._id;
// // // // // //     const userId = req.user._id;
// // // // // //     const username = req.user.username;

// // // // // //     const job = await CompanyJob.findOne({
// // // // // //       _id: jobId,
// // // // // //       companyId
// // // // // //     });

// // // // // //     if (!job) {
// // // // // //       return res.status(404).json({ error: 'Job not found' });
// // // // // //     }

// // // // // //     // Update status and add to history
// // // // // //     const oldStatus = job.currentStatus;
// // // // // //     job.currentStatus = status;
    
// // // // // //     job.statusHistory.push({
// // // // // //       status,
// // // // // //       changedBy: userId,
// // // // // //       username,
// // // // // //       date: new Date(),
// // // // // //       notes: notes || ''
// // // // // //     });

// // // // // //     job.lastUpdated = new Date();
// // // // // //     await job.save();

// // // // // //     res.json({
// // // // // //       message: 'Job status updated successfully',
// // // // // //       job: {
// // // // // //         _id: job._id,
// // // // // //         currentStatus: job.currentStatus,
// // // // // //         statusHistory: job.statusHistory
// // // // // //       },
// // // // // //       oldStatus,
// // // // // //       newStatus: status
// // // // // //     });

// // // // // //   } catch (error) {
// // // // // //     console.error('Update job status error:', error);
// // // // // //     res.status(500).json({ 
// // // // // //       error: 'Failed to update job status', 
// // // // // //       details: error.message 
// // // // // //     });
// // // // // //   }
// // // // // // };

// // // // // // // Add job comment
// // // // // // const addJobComment = async (req, res) => {
// // // // // //   try {
// // // // // //     const { jobId } = req.params;
// // // // // //     const { comment, isPrivate = false } = req.body;
// // // // // //     const companyId = req.user.company._id;
// // // // // //     const userId = req.user._id;
// // // // // //     const username = req.user.username;

// // // // // //     const job = await CompanyJob.findOne({
// // // // // //       _id: jobId,
// // // // // //       companyId
// // // // // //     });

// // // // // //     if (!job) {
// // // // // //       return res.status(404).json({ error: 'Job not found' });
// // // // // //     }

// // // // // //     job.comments.push({
// // // // // //       author: userId,
// // // // // //       username,
// // // // // //       comment,
// // // // // //       isPrivate,
// // // // // //       date: new Date()
// // // // // //     });

// // // // // //     job.lastUpdated = new Date();
// // // // // //     await job.save();

// // // // // //     res.json({
// // // // // //       message: 'Comment added successfully',
// // // // // //       comment: job.comments[job.comments.length - 1]
// // // // // //     });

// // // // // //   } catch (error) {
// // // // // //     res.status(500).json({ 
// // // // // //       error: 'Failed to add comment', 
// // // // // //       details: error.message 
// // // // // //     });
// // // // // //   }
// // // // // // };

// // // // // // // Update job proposal
// // // // // // const updateJobProposal = async (req, res) => {
// // // // // //   try {
// // // // // //     const { jobId } = req.params;
// // // // // //     const { proposal } = req.body;
// // // // // //     const companyId = req.user.company._id;

// // // // // //     const job = await CompanyJob.findOneAndUpdate(
// // // // // //       { _id: jobId, companyId },
// // // // // //       { 
// // // // // //         proposal,
// // // // // //         lastUpdated: new Date()
// // // // // //       },
// // // // // //       { new: true }
// // // // // //     );

// // // // // //     if (!job) {
// // // // // //       return res.status(404).json({ error: 'Job not found' });
// // // // // //     }

// // // // // //     res.json({
// // // // // //       message: 'Proposal updated successfully',
// // // // // //       proposal: job.proposal
// // // // // //     });

// // // // // //   } catch (error) {
// // // // // //     res.status(500).json({ 
// // // // // //       error: 'Failed to update proposal', 
// // // // // //       details: error.message 
// // // // // //     });
// // // // // //   }
// // // // // // };

// // // // // // // Get company job statistics
// // // // // // // const getCompanyJobStats = async (req, res) => {
// // // // // // //   try {
// // // // // // //     const companyId = req.user.company._id;

// // // // // // //     // Get overall job stats
// // // // // // //     const totalJobs = await CompanyJob.countDocuments({ companyId });
    
// // // // // // //     // Get status breakdown
// // // // // // //     const statusStats = await CompanyJob.aggregate([
// // // // // // //       { $match: { companyId: mongoose.Types.ObjectId(companyId) } },
// // // // // // //       {
// // // // // // //         $group: {
// // // // // // //           _id: '$currentStatus',
// // // // // // //           count: { $sum: 1 }
// // // // // // //         }
// // // // // // //       }
// // // // // // //     ]);

// // // // // // //     // Get platform breakdown
// // // // // // //     const platformStats = await CompanyJob.aggregate([
// // // // // // //       { $match: { companyId: mongoose.Types.ObjectId(companyId) } },
// // // // // // //       {
// // // // // // //         $group: {
// // // // // // //           _id: '$platform',
// // // // // // //           count: { $sum: 1 }
// // // // // // //         }
// // // // // // //       }
// // // // // // //     ]);

// // // // // // //     // Get user activity stats
// // // // // // //     const userActivityStats = await CompanyJob.aggregate([
// // // // // // //       { $match: { companyId: mongoose.Types.ObjectId(companyId) } },
// // // // // // //       { $unwind: '$statusHistory' },
// // // // // // //       {
// // // // // // //         $group: {
// // // // // // //           _id: {
// // // // // // //             userId: '$statusHistory.changedBy',
// // // // // // //             username: '$statusHistory.username'
// // // // // // //           },
// // // // // // //           statusChanges: { $sum: 1 },
// // // // // // //           lastActivity: { $max: '$statusHistory.date' }
// // // // // // //         }
// // // // // // //       },
// // // // // // //       {
// // // // // // //         $project: {
// // // // // // //           userId: '$_id.userId',
// // // // // // //           username: '$_id.username',
// // // // // // //           statusChanges: 1,
// // // // // // //           lastActivity: 1,
// // // // // // //           _id: 0
// // // // // // //         }
// // // // // // //       },
// // // // // // //       { $sort: { statusChanges: -1 } }
// // // // // // //     ]);

// // // // // // //     // Get recent activity (last 30 days)
// // // // // // //     const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
// // // // // // //     const recentActivity = await CompanyJob.aggregate([
// // // // // // //       { $match: { companyId: mongoose.Types.ObjectId(companyId) } },
// // // // // // //       { $unwind: '$statusHistory' },
// // // // // // //       { $match: { 'statusHistory.date': { $gte: thirtyDaysAgo } } },
// // // // // // //       {
// // // // // // //         $group: {
// // // // // // //           _id: {
// // // // // // //             date: { $dateToString: { format: '%Y-%m-%d', date: '$statusHistory.date' } }
// // // // // // //           },
// // // // // // //           activities: { $sum: 1 }
// // // // // // //         }
// // // // // // //       },
// // // // // // //       { $sort: { '_id.date': 1 } }
// // // // // // //     ]);

// // // // // // //     res.json({
// // // // // // //       totalJobs,
// // // // // // //       statusBreakdown: statusStats.reduce((acc, stat) => {
// // // // // // //         acc[stat._id] = stat.count;
// // // // // // //         return acc;
// // // // // // //       }, {}),
// // // // // // //       platformBreakdown: platformStats.reduce((acc, stat) => {
// // // // // // //         acc[stat._id] = stat.count;
// // // // // // //         return acc;
// // // // // // //       }, {}),
// // // // // // //       userActivity: userActivityStats,
// // // // // // //       recentActivity: recentActivity.map(item => ({
// // // // // // //         date: item._id.date,
// // // // // // //         activities: item.activities
// // // // // // //       }))
// // // // // // //     });

// // // // // // //   } catch (error) {
// // // // // // //     console.error('Get company job stats error:', error);
// // // // // // //     res.status(500).json({ 
// // // // // // //       error: 'Failed to fetch company job statistics', 
// // // // // // //       details: error.message 
// // // // // // //     });
// // // // // // //   }
// // // // // // // };
// // // // // // // Helper function to safely convert to ObjectId
// // // // // // const toObjectId = (val) => {
// // // // // //   if (!val) return null;
// // // // // //   if (val instanceof mongoose.Types.ObjectId) return val;
// // // // // //   try { 
// // // // // //     return new mongoose.Types.ObjectId(val.toString()); 
// // // // // //   } catch (error) { 
// // // // // //     return null; 
// // // // // //   }
// // // // // // };
// // // // // // const getCompanyJobStats = async (req, res) => {
// // // // // //   try {
// // // // // //     console.log('Getting company job stats for user:', req.user.role);
    
// // // // // //     let companyFilter = {};
    
// // // // // //     if (req.user.role === 'company_admin') {
// // // // // //       const companyId = req.user.company?._id || req.user.company;
// // // // // //       const companyObjId = toObjectId(companyId);
      
// // // // // //       if (companyObjId) {
// // // // // //         companyFilter.companyId = companyObjId; // ✅ Use the converted ObjectId
// // // // // //       }
// // // // // //     }

// // // // // //     console.log('Company filter:', companyFilter);

// // // // // //     // Get status breakdown
// // // // // //     const statusBreakdown = await CompanyJob.aggregate([
// // // // // //       { $match: companyFilter },
// // // // // //       {
// // // // // //         $group: {
// // // // // //           _id: '$currentStatus',
// // // // // //           count: { $sum: 1 }
// // // // // //         }
// // // // // //       }
// // // // // //     ]);

// // // // // //     // Convert to object
// // // // // //     const statusBreakdownObj = {};
// // // // // //     statusBreakdown.forEach(item => {
// // // // // //       statusBreakdownObj[item._id || 'unknown'] = item.count;
// // // // // //     });

// // // // // //     // Get user activity stats
// // // // // //     const userActivity = await CompanyJob.aggregate([
// // // // // //       { $match: companyFilter },
// // // // // //       { $unwind: { path: '$statusHistory', preserveNullAndEmptyArrays: true } },
// // // // // //       {
// // // // // //         $group: {
// // // // // //           _id: '$statusHistory.username',
// // // // // //           statusChanges: { $sum: 1 },
// // // // // //           lastActivity: { $max: '$statusHistory.date' }
// // // // // //         }
// // // // // //       },
// // // // // //       {
// // // // // //         $project: {
// // // // // //           userId: '$_id',
// // // // // //           username: '$_id',
// // // // // //           statusChanges: 1,
// // // // // //           lastActivity: 1
// // // // // //         }
// // // // // //       }
// // // // // //     ]);

// // // // // //     console.log('Stats result:', { statusBreakdownObj, userActivity });

// // // // // //     res.json({
// // // // // //       statusBreakdown: statusBreakdownObj,
// // // // // //       userActivity: userActivity || []
// // // // // //     });

// // // // // //   } catch (error) {
// // // // // //     console.error('Get company job stats error:', error);
// // // // // //     res.status(500).json({ 
// // // // // //       error: 'Failed to get statistics', 
// // // // // //       details: error.message 
// // // // // //     });
// // // // // //   }
// // // // // // };

// // // // // // module.exports = {
// // // // // //   getCompanyJobs,
// // // // // //   getJobDetails,
// // // // // //   updateJobStatus,
// // // // // //     addJobComment,
// // // // // //   updateJobProposal,
// // // // // //   getCompanyJobStats
// // // // // // };
// // // // // const companyJobService = require('../services/companyJobService');

// // // // // // Get jobs for company
// // // // // const getCompanyJobs = async (req, res) => {
// // // // //   try {
// // // // //     const companyId = req.user.companyId; // From auth middleware
// // // // //     const filters = {
// // // // //       status: req.query.status,
// // // // //       platform: req.query.platform,
// // // // //       page: parseInt(req.query.page) || 1,
// // // // //       limit: parseInt(req.query.limit) || 50
// // // // //     };

// // // // //     const result = await companyJobService.getCompanyJobs(companyId, filters);

// // // // //     res.json({
// // // // //       success: true,
// // // // //       ...result
// // // // //     });

// // // // //   } catch (error) {
// // // // //     res.status(400).json({
// // // // //       error: error.message
// // // // //     });
// // // // //   }
// // // // // };

// // // // // // Get single job for company
// // // // // const getCompanyJob = async (req, res) => {
// // // // //   try {
// // // // //     const companyId = req.user.companyId;
// // // // //     const { jobId } = req.params;

// // // // //     const job = await companyJobService.getCompanyJob(companyId, jobId);

// // // // //     res.json({
// // // // //       success: true,
// // // // //       job
// // // // //     });

// // // // //   } catch (error) {
// // // // //     res.status(400).json({
// // // // //       error: error.message
// // // // //     });
// // // // //   }
// // // // // };

// // // // // // Update company job
// // // // // const updateCompanyJob = async (req, res) => {
// // // // //   try {
// // // // //     const companyId = req.user.companyId;
// // // // //     const { jobId } = req.params;
// // // // //     const updateData = {
// // // // //       ...req.body,
// // // // //       username: req.user.username
// // // // //     };

// // // // //     const updatedJob = await companyJobService.updateCompanyJob(companyId, jobId, updateData);

// // // // //     res.json({
// // // // //       success: true,
// // // // //       job: updatedJob
// // // // //     });

// // // // //   } catch (error) {
// // // // //     res.status(400).json({
// // // // //       error: error.message
// // // // //     });
// // // // //   }
// // // // // };

// // // // // // Add comment to job
// // // // // const addJobComment = async (req, res) => {
// // // // //   try {
// // // // //     const companyId = req.user.companyId;
// // // // //     const { jobId } = req.params;
// // // // //     const commentData = {
// // // // //       ...req.body,
// // // // //       username: req.user.username
// // // // //     };

// // // // //     const job = await companyJobService.addJobComment(companyId, jobId, commentData);

// // // // //     res.json({
// // // // //       success: true,
// // // // //       job
// // // // //     });

// // // // //   } catch (error) {
// // // // //     res.status(400).json({
// // // // //       error: error.message
// // // // //     });
// // // // //   }
// // // // // };

// // // // // // Rate job
// // // // // const rateJob = async (req, res) => {
// // // // //   try {
// // // // //     const companyId = req.user.companyId;
// // // // //     const { jobId } = req.params;
// // // // //     const ratingData = {
// // // // //       ...req.body,
// // // // //       username: req.user.username
// // // // //     };

// // // // //     const job = await companyJobService.rateJob(companyId, jobId, ratingData);

// // // // //     res.json({
// // // // //       success: true,
// // // // //       job
// // // // //     });

// // // // //   } catch (error) {
// // // // //     res.status(400).json({
// // // // //       error: error.message
// // // // //     });
// // // // //   }
// // // // // };

// // // // // // Get company job statistics
// // // // // const getCompanyJobStats = async (req, res) => {
// // // // //   try {
// // // // //     const companyId = req.user.companyId;

// // // // //     const stats = await companyJobService.getCompanyJobStats(companyId);

// // // // //     res.json({
// // // // //       success: true,
// // // // //       stats
// // // // //     });

// // // // //   } catch (error) {
// // // // //     res.status(400).json({
// // // // //       error: error.message
// // // // //     });
// // // // //   }
// // // // // };

// // // // // module.exports = {
// // // // //   getCompanyJobs,
// // // // //   getCompanyJob,
// // // // //   updateCompanyJob,
// // // // //   addJobComment,
// // // // //   rateJob,
// // // // //   getCompanyJobStats
// // // // // };


// // // // const CompanyJob = require('../models/CompanyJob');
// // // // const MasterJob = require('../models/MasterJob');
// // // // const Company = require('../models/Company');
// // // // const mongoose = require('mongoose');

// // // // // Helper function to safely convert to ObjectId
// // // // const toObjectId = (val) => {
// // // //   if (!val) return null;
// // // //   if (val instanceof mongoose.Types.ObjectId) return val;
// // // //   try { 
// // // //     return new mongoose.Types.ObjectId(val.toString()); 
// // // //   } catch (error) { 
// // // //     return null; 
// // // //   }
// // // // };

// // // // // Get company jobs with filters
// // // // const getCompanyJobs = async (req, res) => {
// // // //   try {
// // // //     // Get company ID from user's company
// // // //     const companyId = req.user.company?._id || req.user.company;
    
// // // //     if (!companyId) {
// // // //       return res.status(400).json({ error: 'Company information not found' });
// // // //     }

// // // //     const {
// // // //       status,
// // // //       platform,
// // // //       search,
// // // //       page = 1,
// // // //       limit = 20,
// // // //       sortBy = 'distributedAt',
// // // //       sortOrder = 'desc'
// // // //     } = req.query;

// // // //     // Build query
// // // //     const query = { companyId };
    
// // // //     if (status && status !== '') {
// // // //       query.currentStatus = status;
// // // //     }
    
// // // //     if (platform && platform !== '') {
// // // //       query.platform = platform;
// // // //     }
    
// // // //     if (search && search !== '') {
// // // //       query.$or = [
// // // //         { title: new RegExp(search, 'i') },
// // // //         { companyName: new RegExp(search, 'i') }
// // // //       ];
// // // //     }

// // // //     console.log('Company jobs query:', JSON.stringify(query));

// // // //     // Get jobs with pagination
// // // //     const jobs = await CompanyJob.find(query)
// // // //       .populate('masterJobId', 'title description companyName location postedDate platform skills tier final_score ai_remark predicted_domain')
// // // //       .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
// // // //       .limit(limit * 1)
// // // //       .skip((page - 1) * limit)
// // // //       .lean();

// // // //     const total = await CompanyJob.countDocuments(query);

// // // //     console.log(`Found ${jobs.length} jobs out of ${total} total for company ${companyId}`);

// // // //     // Format jobs for frontend
// // // //     const formattedJobs = jobs.map(job => ({
// // // //       _id: job._id,
// // // //       jobId: job.jobId,
// // // //       platform: job.platform,
// // // //       title: job.title,
// // // //       companyName: job.companyName,
// // // //       location: job.location,
// // // //       currentStatus: job.currentStatus,
// // // //       postedDate: job.postedDate,
// // // //       distributedAt: job.distributedAt,
// // // //       statusHistory: job.statusHistory || [],
// // // //       comments: job.comments || [],
// // // //       proposal: job.proposal || '',
// // // //       masterJob: job.masterJobId // Full master job details
// // // //     }));

// // // //     res.json({
// // // //       jobs: formattedJobs,
// // // //       pagination: {
// // // //         current: parseInt(page),
// // // //         pages: Math.ceil(total / limit),
// // // //         total,
// // // //         hasNext: page < Math.ceil(total / limit),
// // // //         hasPrev: page > 1
// // // //       }
// // // //     });

// // // //   } catch (error) {
// // // //     console.error('Get company jobs error:', error);
// // // //     res.status(500).json({ 
// // // //       error: 'Failed to fetch company jobs', 
// // // //       details: error.message 
// // // //     });
// // // //   }
// // // // };

// // // // // Get job details with full master job data
// // // // const getJobDetails = async (req, res) => {
// // // //   try {
// // // //     const { jobId } = req.params;
// // // //     const companyId = req.user.company?._id || req.user.company;

// // // //     if (!companyId) {
// // // //       return res.status(400).json({ error: 'Company information not found' });
// // // //     }

// // // //     const job = await CompanyJob.findOne({
// // // //       _id: jobId,
// // // //       companyId
// // // //     }).populate('masterJobId');

// // // //     if (!job) {
// // // //       return res.status(404).json({ error: 'Job not found' });
// // // //     }

// // // //     res.json({
// // // //       job,
// // // //       masterJobDetails: job.masterJobId
// // // //     });

// // // //   } catch (error) {
// // // //     console.error('Get job details error:', error);
// // // //     res.status(500).json({ 
// // // //       error: 'Failed to fetch job details', 
// // // //       details: error.message 
// // // //     });
// // // //   }
// // // // };

// // // // // Update job status with history tracking
// // // // const updateJobStatus = async (req, res) => {
// // // //   try {
// // // //     const { jobId } = req.params;
// // // //     const { status, notes } = req.body;
// // // //     const companyId = req.user.company?._id || req.user.company;
// // // //     const userId = req.user._id;
// // // //     const username = req.user.username;

// // // //     if (!companyId) {
// // // //       return res.status(400).json({ error: 'Company information not found' });
// // // //     }

// // // //     const job = await CompanyJob.findOne({
// // // //       _id: jobId,
// // // //       companyId
// // // //     });

// // // //     if (!job) {
// // // //       return res.status(404).json({ error: 'Job not found' });
// // // //     }

// // // //     // Update status and add to history
// // // //     const oldStatus = job.currentStatus;
// // // //     job.currentStatus = status;
    
// // // //     job.statusHistory.push({
// // // //       status,
// // // //       changedBy: userId,
// // // //       username,
// // // //       date: new Date(),
// // // //       notes: notes || ''
// // // //     });

// // // //     job.lastUpdated = new Date();
// // // //     await job.save();

// // // //     res.json({
// // // //       message: 'Job status updated successfully',
// // // //       job: {
// // // //         _id: job._id,
// // // //         currentStatus: job.currentStatus,
// // // //         statusHistory: job.statusHistory
// // // //       },
// // // //       oldStatus,
// // // //       newStatus: status
// // // //     });

// // // //   } catch (error) {
// // // //     console.error('Update job status error:', error);
// // // //     res.status(500).json({ 
// // // //       error: 'Failed to update job status', 
// // // //       details: error.message 
// // // //     });
// // // //   }
// // // // };

// // // // // Add job comment
// // // // const addJobComment = async (req, res) => {
// // // //   try {
// // // //     const { jobId } = req.params;
// // // //     const { comment, isPrivate = false } = req.body;
// // // //     const companyId = req.user.company?._id || req.user.company;
// // // //     const userId = req.user._id;
// // // //     const username = req.user.username;

// // // //     if (!companyId) {
// // // //       return res.status(400).json({ error: 'Company information not found' });
// // // //     }

// // // //     const job = await CompanyJob.findOne({
// // // //       _id: jobId,
// // // //       companyId
// // // //     });

// // // //     if (!job) {
// // // //       return res.status(404).json({ error: 'Job not found' });
// // // //     }

// // // //     job.comments.push({
// // // //       author: userId,
// // // //       username,
// // // //       comment,
// // // //       isPrivate,
// // // //       date: new Date()
// // // //     });

// // // //     job.lastUpdated = new Date();
// // // //     await job.save();

// // // //     res.json({
// // // //       message: 'Comment added successfully',
// // // //       comment: job.comments[job.comments.length - 1]
// // // //     });

// // // //   } catch (error) {
// // // //     console.error('Add job comment error:', error);
// // // //     res.status(500).json({ 
// // // //       error: 'Failed to add comment', 
// // // //       details: error.message 
// // // //     });
// // // //   }
// // // // };

// // // // // Update job proposal
// // // // const updateJobProposal = async (req, res) => {
// // // //   try {
// // // //     const { jobId } = req.params;
// // // //     const { proposal } = req.body;
// // // //     const companyId = req.user.company?._id || req.user.company;

// // // //     if (!companyId) {
// // // //       return res.status(400).json({ error: 'Company information not found' });
// // // //     }

// // // //     const job = await CompanyJob.findOneAndUpdate(
// // // //       { _id: jobId, companyId },
// // // //       { 
// // // //         proposal,
// // // //         lastUpdated: new Date()
// // // //       },
// // // //       { new: true }
// // // //     );

// // // //     if (!job) {
// // // //       return res.status(404).json({ error: 'Job not found' });
// // // //     }

// // // //     res.json({
// // // //       message: 'Proposal updated successfully',
// // // //       proposal: job.proposal
// // // //     });

// // // //   } catch (error) {
// // // //     console.error('Update job proposal error:', error);
// // // //     res.status(500).json({ 
// // // //       error: 'Failed to update proposal', 
// // // //       details: error.message 
// // // //     });
// // // //   }
// // // // };

// // // // // Rate/score a job
// // // // const rateJob = async (req, res) => {
// // // //   try {
// // // //     const { jobId } = req.params;
// // // //     const { value, notes } = req.body;
// // // //     const companyId = req.user.company?._id || req.user.company;
// // // //     const userId = req.user._id;
// // // //     const username = req.user.username;

// // // //     if (!companyId) {
// // // //       return res.status(400).json({ error: 'Company information not found' });
// // // //     }

// // // //     const job = await CompanyJob.findOne({
// // // //       _id: jobId,
// // // //       companyId
// // // //     });

// // // //     if (!job) {
// // // //       return res.status(404).json({ error: 'Job not found' });
// // // //     }

// // // //     job.companyScore.push({
// // // //       value,
// // // //       scoredBy: userId,
// // // //       username,
// // // //       date: new Date(),
// // // //       notes: notes || ''
// // // //     });

// // // //     job.lastUpdated = new Date();
// // // //     await job.save();

// // // //     res.json({
// // // //       message: 'Job rated successfully',
// // // //       rating: job.companyScore[job.companyScore.length - 1]
// // // //     });

// // // //   } catch (error) {
// // // //     console.error('Rate job error:', error);
// // // //     res.status(500).json({ 
// // // //       error: 'Failed to rate job', 
// // // //       details: error.message 
// // // //     });
// // // //   }
// // // // };

// // // // // Get company job statistics
// // // // const getCompanyJobStats = async (req, res) => {
// // // //   try {
// // // //     console.log('Getting company job stats for user:', req.user.role);
    
// // // //     let companyFilter = {};
    
// // // //     if (req.user.role === 'company_admin' || req.user.role === 'company_user') {
// // // //       const companyId = req.user.company?._id || req.user.company;
// // // //       const companyObjId = toObjectId(companyId);
      
// // // //       if (companyObjId) {
// // // //         companyFilter.companyId = companyObjId;
// // // //       }
// // // //     }

// // // //     console.log('Company filter:', companyFilter);

// // // //     // Get status breakdown
// // // //     const statusBreakdown = await CompanyJob.aggregate([
// // // //       { $match: companyFilter },
// // // //       {
// // // //         $group: {
// // // //           _id: '$currentStatus',
// // // //           count: { $sum: 1 }
// // // //         }
// // // //       }
// // // //     ]);

// // // //     // Convert to object
// // // //     const statusBreakdownObj = {};
// // // //     statusBreakdown.forEach(item => {
// // // //       statusBreakdownObj[item._id || 'unknown'] = item.count;
// // // //     });

// // // //     // Get platform breakdown
// // // //     const platformBreakdown = await CompanyJob.aggregate([
// // // //       { $match: companyFilter },
// // // //       {
// // // //         $group: {
// // // //           _id: '$platform',
// // // //           count: { $sum: 1 }
// // // //         }
// // // //       }
// // // //     ]);

// // // //     // Get user activity stats
// // // //     const userActivity = await CompanyJob.aggregate([
// // // //       { $match: companyFilter },
// // // //       { $unwind: { path: '$statusHistory', preserveNullAndEmptyArrays: true } },
// // // //       {
// // // //         $group: {
// // // //           _id: '$statusHistory.username',
// // // //           statusChanges: { $sum: 1 },
// // // //           lastActivity: { $max: '$statusHistory.date' }
// // // //         }
// // // //       },
// // // //       {
// // // //         $project: {
// // // //           userId: '$_id',
// // // //           username: '$_id',
// // // //           statusChanges: 1,
// // // //           lastActivity: 1
// // // //         }
// // // //       }
// // // //     ]);

// // // //     // Get total jobs count
// // // //     const totalJobs = await CompanyJob.countDocuments(companyFilter);

// // // //     console.log('Stats result:', { statusBreakdownObj, userActivity, totalJobs });

// // // //     res.json({
// // // //       totalJobs,
// // // //       statusBreakdown: statusBreakdownObj,
// // // //       platformBreakdown: platformBreakdown.reduce((acc, stat) => {
// // // //         acc[stat._id] = stat.count;
// // // //         return acc;
// // // //       }, {}),
// // // //       userActivity: userActivity || []
// // // //     });

// // // //   } catch (error) {
// // // //     console.error('Get company job stats error:', error);
// // // //     res.status(500).json({ 
// // // //       error: 'Failed to get statistics', 
// // // //       details: error.message 
// // // //     });
// // // //   }
// // // // };

// // // // // Get jobs for user dashboard (simplified version)
// // // // const getUserJobs = async (req, res) => {
// // // //   try {
// // // //     console.log('Getting user jobs for:', req.user.username, 'Company:', req.user.company?._id);
    
// // // //     const companyId = req.user.company?._id || req.user.company;
    
// // // //     if (!companyId) {
// // // //       return res.status(400).json({ error: 'Company information not found' });
// // // //     }
    
// // // //     // Get all jobs for the user's company
// // // //     const jobs = await CompanyJob.find({
// // // //       companyId: companyId
// // // //     })
// // // //     .populate('masterJobId', 'title description companyName location postedDate platform skills tier final_score ai_remark predicted_domain')
// // // //     .sort({ distributedAt: -1 })
// // // //     .lean();
    
// // // //     console.log(`Found ${jobs.length} jobs for company ${companyId}`);
    
// // // //     // Format jobs for frontend
// // // //     const formattedJobs = jobs.map(job => ({
// // // //       _id: job._id,
// // // //       jobId: job.jobId,
// // // //       platform: job.platform,
// // // //       title: job.title,
// // // //       companyName: job.companyName,
// // // //       location: job.location,
// // // //       currentStatus: job.currentStatus,
// // // //       postedDate: job.postedDate,
// // // //       distributedAt: job.distributedAt,
// // // //       statusHistory: job.statusHistory || [],
// // // //       comments: job.comments || [],
// // // //       proposal: job.proposal || '',
// // // //       masterJob: job.masterJobId
// // // //     }));
    
// // // //     res.json({
// // // //       jobs: formattedJobs,
// // // //       total: jobs.length
// // // //     });
    
// // // //   } catch (error) {
// // // //     console.error('Get user jobs error:', error);
// // // //     res.status(500).json({ 
// // // //       error: 'Failed to fetch user jobs',
// // // //       details: error.message 
// // // //     });
// // // //   }
// // // // };

// // // // module.exports = {
// // // //   getCompanyJobs,
// // // //   getJobDetails,
// // // //   updateJobStatus,
// // // //   addJobComment,
// // // //   updateJobProposal,
// // // //   rateJob,
// // // //   getCompanyJobStats,
// // // //   getUserJobs
// // // // };

// // // const CompanyJob = require('../models/CompanyJob');
// // // const MasterJob = require('../models/MasterJob');
// // // const Company = require('../models/Company');
// // // const mongoose = require('mongoose');

// // // const getUserJobs = async (req, res) => {
// // //   try {
// // //     console.log('Getting user jobs for:', req.user.username, 'Company:', req.user.company?._id);
    
// // //     const companyId = req.user.company?._id || req.user.company;
    
// // //     if (!companyId) {
// // //       return res.status(400).json({ error: 'Company information not found' });
// // //     }
    
// // //     // Get all jobs for the user's company
// // //     const jobs = await CompanyJob.find({
// // //       companyId: companyId
// // //     })
// // //     .populate('masterJobId', 'title description companyName location postedDate platform skills tier final_score ai_remark predicted_domain')
// // //     .sort({ distributedAt: -1 })
// // //     .lean();
    
// // //     console.log(`Found ${jobs.length} jobs for company ${companyId}`);
    
// // //     // Format jobs for frontend
// // //     const formattedJobs = jobs.map(job => ({
// // //       _id: job._id,
// // //       jobId: job.jobId,
// // //       platform: job.platform,
// // //       title: job.title,
// // //       companyName: job.companyName,
// // //       location: job.location,
// // //       currentStatus: job.currentStatus,
// // //       postedDate: job.postedDate,
// // //       distributedAt: job.distributedAt,
// // //       statusHistory: job.statusHistory || [],
// // //       comments: job.comments || [],
// // //       proposal: job.proposal || '',
// // //       masterJob: job.masterJobId
// // //     }));
    
// // //     res.json({
// // //       jobs: formattedJobs,
// // //       total: jobs.length
// // //     });
    
// // //   } catch (error) {
// // //     console.error('Get user jobs error:', error);
// // //     res.status(500).json({ 
// // //       error: 'Failed to fetch user jobs',
// // //       details: error.message 
// // //     });
// // //   }
// // // };

// // // // Get company jobs with SHADOW VIEW (combines MasterJob + CompanyJob)
// // // const getCompanyJobs = async (req, res) => {
// // //   try {
// // //     const companyId = req.user.company?._id || req.user.company;
    
// // //     if (!companyId) {
// // //       return res.status(400).json({ error: 'Company information not found' });
// // //     }

// // //     const {
// // //       status,
// // //       platform,
// // //       search,
// // //       page = 1,
// // //       limit = 20,
// // //       sortBy = 'distributedAt',
// // //       sortOrder = 'desc'
// // //     } = req.query;

// // //     // Build query for CompanyJob (shadow entries)
// // //     const query = { companyId };
    
// // //     if (status && status !== '') {
// // //       query.currentStatus = status;
// // //     }

// // //     console.log('Company jobs query:', JSON.stringify(query));

// // //     // Get shadow entries with pagination
// // //     const shadowJobs = await CompanyJob.find(query)
// // //       .populate('masterJobId') // This gets the FULL MasterJob data
// // //       .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
// // //       .limit(limit * 1)
// // //       .skip((page - 1) * limit)
// // //       .lean();

// // //     const total = await CompanyJob.countDocuments(query);

// // //     console.log(`Found ${shadowJobs.length} shadow jobs out of ${total} total for company ${companyId}`);

// // //     // Format jobs combining MasterJob + CompanyJob data
// // //     const formattedJobs = shadowJobs.map(shadowJob => {
// // //       const masterJob = shadowJob.masterJobId;
      
// // //       return {
// // //         // Company-specific data
// // //         _id: shadowJob._id,
// // //         currentStatus: shadowJob.currentStatus,
// // //         statusHistory: shadowJob.statusHistory || [],
// // //         comments: shadowJob.comments || [],
// // //         proposal: shadowJob.proposal || '',
// // //         companyScore: shadowJob.companyScore || [],
// // //         isBookmarked: shadowJob.isBookmarked || false,
// // //         distributedAt: shadowJob.distributedAt,
// // //         lastUpdated: shadowJob.lastUpdated,
        
// // //         // MasterJob data (full job details)
// // //         jobId: masterJob.jobId,
// // //         platform: masterJob.platform,
// // //         title: masterJob.title,
// // //         description: masterJob.description,
// // //         descriptionText: masterJob.descriptionText,
// // //         companyName: masterJob.companyName,
// // //         company: masterJob.company,
// // //         location: `${masterJob.city || ''}, ${masterJob.country || ''}`.trim().replace(/^,\s*/, ''),
// // //         postedDate: masterJob.postedDate,
// // //         salary: masterJob.salary,
// // //         skills: masterJob.skills || [],
// // //         tags: masterJob.tags || [],
// // //         tier: masterJob.tier,
// // //         final_score: masterJob.final_score,
// // //         ai_remark: masterJob.ai_remark,
// // //         predicted_domain: masterJob.predicted_domain,
        
// // //         // All other MasterJob fields are available
// // //         ...masterJob
// // //       };
// // //     });

// // //     res.json({
// // //       jobs: formattedJobs,
// // //       pagination: {
// // //         current: parseInt(page),
// // //         pages: Math.ceil(total / limit),
// // //         total,
// // //         hasNext: page < Math.ceil(total / limit),
// // //         hasPrev: page > 1
// // //       }
// // //     });

// // //   } catch (error) {
// // //     console.error('Get company jobs error:', error);
// // //     res.status(500).json({ 
// // //       error: 'Failed to fetch company jobs', 
// // //       details: error.message 
// // //     });
// // //   }
// // // };

// // // // Get single job with SHADOW VIEW
// // // const getJobDetails = async (req, res) => {
// // //   try {
// // //     const { jobId } = req.params;
// // //     const companyId = req.user.company?._id || req.user.company;

// // //     if (!companyId) {
// // //       return res.status(400).json({ error: 'Company information not found' });
// // //     }

// // //     // Get shadow entry with full MasterJob data
// // //     const shadowJob = await CompanyJob.findOne({
// // //       _id: jobId,
// // //       companyId
// // //     }).populate('masterJobId');

// // //     if (!shadowJob) {
// // //       return res.status(404).json({ error: 'Job not found' });
// // //     }

// // //     const masterJob = shadowJob.masterJobId;

// // //     // Combine MasterJob + CompanyJob data
// // //     const combinedJob = {
// // //       // Company-specific data
// // //       _id: shadowJob._id,
// // //       currentStatus: shadowJob.currentStatus,
// // //       statusHistory: shadowJob.statusHistory || [],
// // //       comments: shadowJob.comments || [],
// // //       proposal: shadowJob.proposal || '',
// // //       companyScore: shadowJob.companyScore || [],
// // //       isBookmarked: shadowJob.isBookmarked || false,
// // //       distributedAt: shadowJob.distributedAt,
// // //       lastUpdated: shadowJob.lastUpdated,
      
// // //       // Full MasterJob data
// // //       ...masterJob.toObject()
// // //     };

// // //     res.json({
// // //       job: combinedJob
// // //     });

// // //   } catch (error) {
// // //     console.error('Get job details error:', error);
// // //     res.status(500).json({ 
// // //       error: 'Failed to fetch job details', 
// // //       details: error.message 
// // //     });
// // //   }
// // // };

// // // // Update company-specific job data (only CompanyJob fields)
// // // const updateJobStatus = async (req, res) => {
// // //   try {
// // //     const { jobId } = req.params;
// // //     const { status, notes } = req.body;
// // //     const companyId = req.user.company?._id || req.user.company;
// // //     const userId = req.user._id;
// // //     const username = req.user.username;

// // //     if (!companyId) {
// // //       return res.status(400).json({ error: 'Company information not found' });
// // //     }

// // //     const shadowJob = await CompanyJob.findOne({
// // //       _id: jobId,
// // //       companyId
// // //     });

// // //     if (!shadowJob) {
// // //       return res.status(404).json({ error: 'Job not found' });
// // //     }

// // //     // Update only CompanyJob fields
// // //     const oldStatus = shadowJob.currentStatus;
// // //     shadowJob.currentStatus = status;
    
// // //     shadowJob.statusHistory.push({
// // //       status,
// // //       changedBy: userId,
// // //       username,
// // //       date: new Date(),
// // //       notes: notes || ''
// // //     });

// // //     shadowJob.lastUpdated = new Date();
// // //     await shadowJob.save();

// // //     res.json({
// // //       message: 'Job status updated successfully',
// // //       job: {
// // //         _id: shadowJob._id,
// // //         currentStatus: shadowJob.currentStatus,
// // //         statusHistory: shadowJob.statusHistory
// // //       },
// // //       oldStatus,
// // //       newStatus: status
// // //     });

// // //   } catch (error) {
// // //     console.error('Update job status error:', error);
// // //     res.status(500).json({ 
// // //       error: 'Failed to update job status', 
// // //       details: error.message 
// // //     });
// // //   }
// // // };

// // // // Add comment (only to CompanyJob)
// // // const addJobComment = async (req, res) => {
// // //   try {
// // //     const { jobId } = req.params;
// // //     const { comment, isPrivate = false } = req.body;
// // //     const companyId = req.user.company?._id || req.user.company;
// // //     const userId = req.user._id;
// // //     const username = req.user.username;

// // //     if (!companyId) {
// // //       return res.status(400).json({ error: 'Company information not found' });
// // //     }

// // //     const shadowJob = await CompanyJob.findOne({
// // //       _id: jobId,
// // //       companyId
// // //     });

// // //     if (!shadowJob) {
// // //       return res.status(404).json({ error: 'Job not found' });
// // //     }

// // //     shadowJob.comments.push({
// // //       author: userId,
// // //       username,
// // //       comment,
// // //       isPrivate,
// // //       date: new Date()
// // //     });

// // //     shadowJob.lastUpdated = new Date();
// // //     await shadowJob.save();

// // //     res.json({
// // //       message: 'Comment added successfully',
// // //       comment: shadowJob.comments[shadowJob.comments.length - 1]
// // //     });

// // //   } catch (error) {
// // //     console.error('Add job comment error:', error);
// // //     res.status(500).json({ 
// // //       error: 'Failed to add comment', 
// // //       details: error.message 
// // //     });
// // //   }
// // // };

// // // // Get company job statistics
// // // const getCompanyJobStats = async (req, res) => {
// // //   try {
// // //     const companyId = req.user.company?._id || req.user.company;
    
// // //     if (!companyId) {
// // //       return res.status(400).json({ error: 'Company information not found' });
// // //     }

// // //     // Get status breakdown from shadow entries
// // //     const statusBreakdown = await CompanyJob.aggregate([
// // //       { $match: { companyId } },
// // //       {
// // //         $group: {
// // //           _id: '$currentStatus',
// // //           count: { $sum: 1 }
// // //         }
// // //       }
// // //     ]);

// // //     // Get platform breakdown by joining with MasterJob
// // //     const platformBreakdown = await CompanyJob.aggregate([
// // //       { $match: { companyId } },
// // //       {
// // //         $lookup: {
// // //           from: 'masterjobs',
// // //           localField: 'masterJobId',
// // //           foreignField: '_id',
// // //           as: 'masterJob'
// // //         }
// // //       },
// // //       { $unwind: '$masterJob' },
// // //       {
// // //         $group: {
// // //           _id: '$masterJob.platform',
// // //           count: { $sum: 1 }
// // //         }
// // //       }
// // //     ]);

// // //     const totalJobs = await CompanyJob.countDocuments({ companyId });

// // //     res.json({
// // //       totalJobs,
// // //       statusBreakdown: statusBreakdown.reduce((acc, stat) => {
// // //         acc[stat._id] = stat.count;
// // //         return acc;
// // //       }, {}),
// // //       platformBreakdown: platformBreakdown.reduce((acc, stat) => {
// // //         acc[stat._id] = stat.count;
// // //         return acc;
// // //       }, {})
// // //     });

// // //   } catch (error) {
// // //     console.error('Get company job stats error:', error);
// // //     res.status(500).json({ 
// // //       error: 'Failed to get statistics', 
// // //       details: error.message 
// // //     });
// // //   }
// // // };

// // // module.exports = {
// // //   getCompanyJobs,
// // //   getJobDetails,
// // //   updateJobStatus,
// // //   addJobComment,
// // //   getCompanyJobStats,
// // //   getUserJobs
// // // };

// // // //   getCompanyJobs,
// // // //   getJobDetails,
// // // //   updateJobStatus,
// // // //   addJobComment,
// // // //   updateJobProposal,
// // // //   rateJob,
// // // //   getCompanyJobStats,
// // // //   getUserJobs
// // const CompanyJob = require('../models/CompanyJob');
// // const MasterJob = require('../models/MasterJob');
// // const Company = require('../models/Company');
// // const mongoose = require('mongoose');

// // // Helper function to safely convert to ObjectId
// // const toObjectId = (val) => {
// //   if (!val) return null;
// //   if (val instanceof mongoose.Types.ObjectId) return val;
// //   try { 
// //     return new mongoose.Types.ObjectId(val.toString()); 
// //   } catch (error) { 
// //     return null; 
// //   }
// // };

// // // Get company jobs with SHADOW VIEW (combines MasterJob + CompanyJob)
// // const getCompanyJobs = async (req, res) => {
// //   try {
// //     const companyId = req.user.company?._id || req.user.company;
    
// //     if (!companyId) {
// //       return res.status(400).json({ error: 'Company information not found' });
// //     }

// //     const {
// //       status,
// //       platform,
// //       search,
// //       page = 1,
// //       limit = 20,
// //       sortBy = 'distributedAt',
// //       sortOrder = 'desc'
// //     } = req.query;

// //     // Build query for CompanyJob (shadow entries)
// //     const query = { companyId };
    
// //     if (status && status !== '') {
// //       query.currentStatus = status;
// //     }

// //     console.log('Company jobs query:', JSON.stringify(query));

// //     // Get shadow entries with pagination
// //     const shadowJobs = await CompanyJob.find(query)
// //       .populate('masterJobId') // This gets the FULL MasterJob data
// //       .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
// //       .limit(limit * 1)
// //       .skip((page - 1) * limit)
// //       .lean();

// //     const total = await CompanyJob.countDocuments(query);

// //     console.log(`Found ${shadowJobs.length} shadow jobs out of ${total} total for company ${companyId}`);

// //     // Format jobs combining MasterJob + CompanyJob data
// //     const formattedJobs = shadowJobs.map(shadowJob => {
// //       const masterJob = shadowJob.masterJobId;
      
// //       return {
// //         // Company-specific data
// //         _id: shadowJob._id,
// //         currentStatus: shadowJob.currentStatus,
// //         statusHistory: shadowJob.statusHistory || [],
// //         comments: shadowJob.comments || [],
// //         proposal: shadowJob.proposal || '',
// //         companyScore: shadowJob.companyScore || [],
// //         isBookmarked: shadowJob.isBookmarked || false,
// //         distributedAt: shadowJob.distributedAt,
// //         lastUpdated: shadowJob.lastUpdated,
        
// //         // MasterJob data (full job details)
// //         jobId: masterJob.jobId,
// //         platform: masterJob.platform,
// //         title: masterJob.title,
// //         description: masterJob.description,
// //         descriptionText: masterJob.descriptionText,
// //         companyName: masterJob.companyName,
// //         company: masterJob.company,
// //         location: `${masterJob.city || ''}, ${masterJob.country || ''}`.trim().replace(/^,\s*/, ''),
// //         postedDate: masterJob.postedDate,
// //         salary: masterJob.salary,
// //         skills: masterJob.skills || [],
// //         tags: masterJob.tags || [],
// //         tier: masterJob.tier,
// //         final_score: masterJob.final_score,
// //         ai_remark: masterJob.ai_remark,
// //         predicted_domain: masterJob.predicted_domain,
        
// //         // All other MasterJob fields are available
// //         ...masterJob
// //       };
// //     });

// //     res.json({
// //       jobs: formattedJobs,
// //       pagination: {
// //         current: parseInt(page),
// //         pages: Math.ceil(total / limit),
// //         total,
// //         hasNext: page < Math.ceil(total / limit),
// //         hasPrev: page > 1
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Get company jobs error:', error);
// //     res.status(500).json({ 
// //       error: 'Failed to fetch company jobs', 
// //       details: error.message 
// //     });
// //   }
// // };

// // // Get user jobs for dashboard (simplified)
// // const getUserJobs = async (req, res) => {
// //   try {
// //     console.log('Getting user jobs for:', req.user.username, 'Company:', req.user.company?._id);
    
// //     const companyId = req.user.company?._id || req.user.company;
    
// //     if (!companyId) {
// //       return res.status(400).json({ error: 'Company information not found' });
// //     }
    
// //     // Get all jobs for the user's company
// //     const shadowJobs = await CompanyJob.find({
// //       companyId: companyId
// //     })
// //     .populate('masterJobId', 'title description companyName location postedDate platform skills tier final_score ai_remark predicted_domain jobId city country')
// //     .sort({ distributedAt: -1 })
// //     .lean();
    
// //     console.log(`Found ${shadowJobs.length} shadow jobs for company ${companyId}`);
    
// //     // Format jobs combining MasterJob + CompanyJob data
// //     const formattedJobs = shadowJobs.map(shadowJob => {
// //       const masterJob = shadowJob.masterJobId;
      
// //       return {
// //         // Company-specific data
// //         _id: shadowJob._id,
// //         currentStatus: shadowJob.currentStatus,
// //         statusHistory: shadowJob.statusHistory || [],
// //         comments: shadowJob.comments || [],
// //         proposal: shadowJob.proposal || '',
// //         companyScore: shadowJob.companyScore || [],
// //         isBookmarked: shadowJob.isBookmarked || false,
// //         distributedAt: shadowJob.distributedAt,
// //         lastUpdated: shadowJob.lastUpdated,
        
// //         // MasterJob data
// //         jobId: masterJob.jobId,
// //         platform: masterJob.platform,
// //         title: masterJob.title,
// //         description: masterJob.description,
// //         descriptionText: masterJob.descriptionText,
// //         companyName: masterJob.companyName,
// //         company: masterJob.company,
// //         location: `${masterJob.city || ''}, ${masterJob.country || ''}`.trim().replace(/^,\s*/, ''),
// //         postedDate: masterJob.postedDate,
// //         salary: masterJob.salary,
// //         skills: masterJob.skills || [],
// //         tags: masterJob.tags || [],
// //         tier: masterJob.tier,
// //         final_score: masterJob.final_score,
// //         ai_remark: masterJob.ai_remark,
// //         predicted_domain: masterJob.predicted_domain,
        
// //         // All other MasterJob fields
// //         ...masterJob
// //       };
// //     });
    
// //     res.json({
// //       jobs: formattedJobs,
// //       total: shadowJobs.length
// //     });
    
// //   } catch (error) {
// //     console.error('Get user jobs error:', error);
// //     res.status(500).json({ 
// //       error: 'Failed to fetch user jobs',
// //       details: error.message 
// //     });
// //   }
// // };

// // // Get single job with SHADOW VIEW
// // const getJobDetails = async (req, res) => {
// //   try {
// //     const { jobId } = req.params;
// //     const companyId = req.user.company?._id || req.user.company;

// //     if (!companyId) {
// //       return res.status(400).json({ error: 'Company information not found' });
// //     }

// //     // Validate ObjectId
// //     if (!mongoose.Types.ObjectId.isValid(jobId)) {
// //       return res.status(400).json({ error: 'Invalid job ID format' });
// //     }

// //     // Get shadow entry with full MasterJob data
// //     const shadowJob = await CompanyJob.findOne({
// //       _id: jobId,
// //       companyId
// //     }).populate('masterJobId');

// //     if (!shadowJob) {
// //       return res.status(404).json({ error: 'Job not found' });
// //     }

// //     const masterJob = shadowJob.masterJobId;

// //     // Combine MasterJob + CompanyJob data
// //     const combinedJob = {
// //       // Company-specific data
// //       _id: shadowJob._id,
// //       currentStatus: shadowJob.currentStatus,
// //       statusHistory: shadowJob.statusHistory || [],
// //       comments: shadowJob.comments || [],
// //       proposal: shadowJob.proposal || '',
// //       companyScore: shadowJob.companyScore || [],
// //       isBookmarked: shadowJob.isBookmarked || false,
// //       distributedAt: shadowJob.distributedAt,
// //       lastUpdated: shadowJob.lastUpdated,
      
// //       // Full MasterJob data
// //       ...masterJob.toObject()
// //     };

// //     res.json({
// //       job: combinedJob
// //     });

// //   } catch (error) {
// //     console.error('Get job details error:', error);
// //     res.status(500).json({ 
// //       error: 'Failed to fetch job details', 
// //       details: error.message 
// //     });
// //   }
// // };

// // // Update company-specific job data (only CompanyJob fields)
// // const updateJobStatus = async (req, res) => {
// //   try {
// //     const { jobId } = req.params;
// //     const { status, notes } = req.body;
// //     const companyId = req.user.company?._id || req.user.company;
// //     const userId = req.user._id;
// //     const username = req.user.username;

// //     if (!companyId) {
// //       return res.status(400).json({ error: 'Company information not found' });
// //     }

// //     // Validate ObjectId
// //     if (!mongoose.Types.ObjectId.isValid(jobId)) {
// //       return res.status(400).json({ error: 'Invalid job ID format' });
// //     }

// //     const shadowJob = await CompanyJob.findOne({
// //       _id: jobId,
// //       companyId
// //     });

// //     if (!shadowJob) {
// //       return res.status(404).json({ error: 'Job not found' });
// //     }

// //     // Update only CompanyJob fields
// //     const oldStatus = shadowJob.currentStatus;
// //     shadowJob.currentStatus = status;
    
// //     shadowJob.statusHistory.push({
// //       status,
// //       changedBy: userId,
// //       username,
// //       date: new Date(),
// //       notes: notes || ''
// //     });

// //     shadowJob.lastUpdated = new Date();
// //     await shadowJob.save();

// //     res.json({
// //       message: 'Job status updated successfully',
// //       job: {
// //         _id: shadowJob._id,
// //         currentStatus: shadowJob.currentStatus,
// //         statusHistory: shadowJob.statusHistory
// //       },
// //       oldStatus,
// //       newStatus: status
// //     });

// //   } catch (error) {
// //     console.error('Update job status error:', error);
// //     res.status(500).json({ 
// //       error: 'Failed to update job status', 
// //       details: error.message 
// //     });
// //   }
// // };

// // // Add comment (only to CompanyJob)
// // const addJobComment = async (req, res) => {
// //   try {
// //     const { jobId } = req.params;
// //     const { comment, isPrivate = false } = req.body;
// //     const companyId = req.user.company?._id || req.user.company;
// //     const userId = req.user._id;
// //     const username = req.user.username;

// //     if (!companyId) {
// //       return res.status(400).json({ error: 'Company information not found' });
// //     }

// //     // Validate ObjectId
// //     if (!mongoose.Types.ObjectId.isValid(jobId)) {
// //       return res.status(400).json({ error: 'Invalid job ID format' });
// //     }

// //     const shadowJob = await CompanyJob.findOne({
// //       _id: jobId,
// //       companyId
// //     });

// //     if (!shadowJob) {
// //       return res.status(404).json({ error: 'Job not found' });
// //     }

// //     shadowJob.comments.push({
// //       author: userId,
// //       username,
// //       comment,
// //       isPrivate,
// //       date: new Date()
// //     });

// //     shadowJob.lastUpdated = new Date();
// //     await shadowJob.save();

// //     res.json({
// //       message: 'Comment added successfully',
// //       comment: shadowJob.comments[shadowJob.comments.length - 1]
// //     });

// //   } catch (error) {
// //     console.error('Add job comment error:', error);
// //     res.status(500).json({ 
// //       error: 'Failed to add comment', 
// //       details: error.message 
// //     });
// //   }
// // };

// // // Update job proposal
// // const updateJobProposal = async (req, res) => {
// //   try {
// //     const { jobId } = req.params;
// //     const { proposal } = req.body;
// //     const companyId = req.user.company?._id || req.user.company;

// //     if (!companyId) {
// //       return res.status(400).json({ error: 'Company information not found' });
// //     }

// //     // Validate ObjectId
// //     if (!mongoose.Types.ObjectId.isValid(jobId)) {
// //       return res.status(400).json({ error: 'Invalid job ID format' });
// //     }

// //     const shadowJob = await CompanyJob.findOneAndUpdate(
// //       { _id: jobId, companyId },
// //       { 
// //         proposal,
// //         lastUpdated: new Date()
// //       },
// //       { new: true }
// //     );

// //     if (!shadowJob) {
// //       return res.status(404).json({ error: 'Job not found' });
// //     }

// //     res.json({
// //       message: 'Proposal updated successfully',
// //       proposal: shadowJob.proposal
// //     });

// //   } catch (error) {
// //     console.error('Update job proposal error:', error);
// //     res.status(500).json({ 
// //       error: 'Failed to update proposal', 
// //       details: error.message 
// //     });
// //   }
// // };

// // // Rate/score a job
// // const rateJob = async (req, res) => {
// //   try {
// //     const { jobId } = req.params;
// //     const { value, notes } = req.body;
// //     const companyId = req.user.company?._id || req.user.company;
// //     const userId = req.user._id;
// //     const username = req.user.username;

// //     if (!companyId) {
// //       return res.status(400).json({ error: 'Company information not found' });
// //     }

// //     // Validate ObjectId
// //     if (!mongoose.Types.ObjectId.isValid(jobId)) {
// //       return res.status(400).json({ error: 'Invalid job ID format' });
// //     }

// //     const shadowJob = await CompanyJob.findOne({
// //       _id: jobId,
// //       companyId
// //     });

// //     if (!shadowJob) {
// //       return res.status(404).json({ error: 'Job not found' });
// //     }

// //     shadowJob.companyScore.push({
// //       value,
// //       scoredBy: userId,
// //       username,
// //       date: new Date(),
// //       notes: notes || ''
// //     });

// //     shadowJob.lastUpdated = new Date();
// //     await shadowJob.save();

// //     res.json({
// //       message: 'Job rated successfully',
// //       rating: shadowJob.companyScore[shadowJob.companyScore.length - 1]
// //     });

// //   } catch (error) {
// //     console.error('Rate job error:', error);
// //     res.status(500).json({ 
// //       error: 'Failed to rate job', 
// //       details: error.message 
// //     });
// //   }
// // };

// // // Get company job statistics
// // const getCompanyJobStats = async (req, res) => {
// //   try {
// //     const companyId = req.user.company?._id || req.user.company;
    
// //     if (!companyId) {
// //       return res.status(400).json({ error: 'Company information not found' });
// //     }

// //     // Get status breakdown from shadow entries
// //     const statusBreakdown = await CompanyJob.aggregate([
// //       { $match: { companyId } },
// //       {
// //         $group: {
// //           _id: '$currentStatus',
// //           count: { $sum: 1 }
// //         }
// //       }
// //     ]);

// //     // Get platform breakdown by joining with MasterJob
// //     const platformBreakdown = await CompanyJob.aggregate([
// //       { $match: { companyId } },
// //       {
// //         $lookup: {
// //           from: 'masterjobs',
// //           localField: 'masterJobId',
// //           foreignField: '_id',
// //           as: 'masterJob'
// //         }
// //       },
// //       { $unwind: '$masterJob' },
// //       {
// //         $group: {
// //           _id: '$masterJob.platform',
// //           count: { $sum: 1 }
// //         }
// //       }
// //     ]);

// //     const totalJobs = await CompanyJob.countDocuments({ companyId });

// //     res.json({
// //       totalJobs,
// //       statusBreakdown: statusBreakdown.reduce((acc, stat) => {
// //         acc[stat._id] = stat.count;
// //         return acc;
// //       }, {}),
// //       platformBreakdown: platformBreakdown.reduce((acc, stat) => {
// //         acc[stat._id] = stat.count;
// //         return acc;
// //       }, {})
// //     });

// //   } catch (error) {
// //     console.error('Get company job stats error:', error);
// //     res.status(500).json({ 
// //       error: 'Failed to get statistics', 
// //       details: error.message 
// //     });
// //   }
// // };

// // module.exports = {
// //   getCompanyJobs,
// //   getUserJobs,
// //   getJobDetails,
// //   updateJobStatus,
// //   addJobComment,
// //   updateJobProposal,
// //   rateJob,
// //   getCompanyJobStats
// // };

// const CompanyJob = require('../models/CompanyJob');
// const MasterJob = require('../models/MasterJob');
// const Company = require('../models/Company');
// const mongoose = require('mongoose');

// // Helper function to safely convert to ObjectId
// const toObjectId = (val) => {
//   if (!val) return null;
//   if (val instanceof mongoose.Types.ObjectId) return val;
//   try { 
//     return new mongoose.Types.ObjectId(val.toString()); 
//   } catch (error) { 
//     return null; 
//   }
// };

// // Get company jobs with COMPLETE SHADOW VIEW (all MasterJob fields)
// const getCompanyJobs = async (req, res) => {
//   try {
//     const companyId = req.user.company?._id || req.user.company;
    
//     if (!companyId) {
//       return res.status(400).json({ error: 'Company information not found' });
//     }

//     const {
//       status,
//       platform,
//       search,
//       page = 1,
//       limit = 20,
//       sortBy = 'distributedAt',
//       sortOrder = 'desc'
//     } = req.query;

//     // Build query for CompanyJob (shadow entries)
//     const query = { companyId };
    
//     if (status && status !== '') {
//       query.currentStatus = status;
//     }

//     console.log('Company jobs query:', JSON.stringify(query));

//     // Get shadow entries with pagination
//     const shadowJobs = await CompanyJob.find(query)
//       .populate('masterJobId') // This gets the COMPLETE MasterJob data
//       .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .lean();

//     const total = await CompanyJob.countDocuments(query);

//     console.log(`Found ${shadowJobs.length} shadow jobs out of ${total} total for company ${companyId}`);

//     // Format jobs combining MasterJob + CompanyJob data (COMPLETE DATA)
//     const formattedJobs = shadowJobs.map(shadowJob => {
//       const masterJob = shadowJob.masterJobId;
      
//       // Return COMPLETE job data
//       return {
//         // Company-specific data (from CompanyJob)
//         _id: shadowJob._id,
//         currentStatus: shadowJob.currentStatus,
//         statusHistory: shadowJob.statusHistory || [],
//         comments: shadowJob.comments || [],
//         proposal: shadowJob.proposal || '',
//         companyScore: shadowJob.companyScore || [],
//         isBookmarked: shadowJob.isBookmarked || false,
//         distributedAt: shadowJob.distributedAt,
//         lastUpdated: shadowJob.lastUpdated,
        
//         // COMPLETE MasterJob data (all fields)
//         ...masterJob, // This spreads ALL MasterJob fields
        
//         // Ensure these fields are properly formatted
//         location: masterJob.city && masterJob.country 
//           ? `${masterJob.city}, ${masterJob.country}`.trim()
//           : masterJob.city || masterJob.country || '',
        
//         // Add any computed fields if needed
//         fullDescription: masterJob.description || masterJob.descriptionText || '',
//         displaySalary: masterJob.salary || masterJob.fixedBudget || masterJob.minHourlyRate || 'Not specified'
//       };
//     });

//     res.json({
//       jobs: formattedJobs,
//       pagination: {
//         current: parseInt(page),
//         pages: Math.ceil(total / limit),
//         total,
//         hasNext: page < Math.ceil(total / limit),
//         hasPrev: page > 1
//       }
//     });

//   } catch (error) {
//     console.error('Get company jobs error:', error);
//     res.status(500).json({ 
//       error: 'Failed to fetch company jobs', 
//       details: error.message 
//     });
//   }
// };

// // Get user jobs for dashboard (COMPLETE SHADOW VIEW)
// const getUserJobs = async (req, res) => {
//   try {
//     console.log('Getting user jobs for:', req.user.username, 'Company:', req.user.company?._id);
    
//     const companyId = req.user.company?._id || req.user.company;
    
//     if (!companyId) {
//       return res.status(400).json({ error: 'Company information not found' });
//     }
    
//     // Get all jobs for the user's company with COMPLETE MasterJob data
//     const shadowJobs = await CompanyJob.find({
//       companyId: companyId
//     })
//     .populate('masterJobId') // Get ALL MasterJob fields
//     .sort({ distributedAt: -1 })
//     .lean();
    
//     console.log(`Found ${shadowJobs.length} shadow jobs for company ${companyId}`);
    
//     // Format jobs with COMPLETE MasterJob data
//     const formattedJobs = shadowJobs.map(shadowJob => {
//       const masterJob = shadowJob.masterJobId;
      
//       // Return COMPLETE job data
//       return {
//         // Company-specific data (from CompanyJob)
//         _id: shadowJob._id,
//         currentStatus: shadowJob.currentStatus,
//         statusHistory: shadowJob.statusHistory || [],
//         comments: shadowJob.comments || [],
//         proposal: shadowJob.proposal || '',
//         companyScore: shadowJob.companyScore || [],
//         isBookmarked: shadowJob.isBookmarked || false,
//         distributedAt: shadowJob.distributedAt,
//         lastUpdated: shadowJob.lastUpdated,
        
//         // COMPLETE MasterJob data (all fields)
//         ...masterJob, // This spreads ALL MasterJob fields
        
//         // Ensure these fields are properly formatted
//         location: masterJob.city && masterJob.country 
//           ? `${masterJob.city}, ${masterJob.country}`.trim()
//           : masterJob.city || masterJob.country || '',
        
//         // Add any computed fields if needed
//         fullDescription: masterJob.description || masterJob.descriptionText || '',
//         displaySalary: masterJob.salary || masterJob.fixedBudget || masterJob.minHourlyRate || 'Not specified'
//       };
//     });
    
//     res.json({
//       jobs: formattedJobs,
//       total: shadowJobs.length
//     });
    
//   } catch (error) {
//     console.error('Get user jobs error:', error);
//     res.status(500).json({ 
//       error: 'Failed to fetch user jobs',
//       details: error.message 
//     });
//   }
// };

// // Get single job with COMPLETE SHADOW VIEW
// const getJobDetails = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const companyId = req.user.company?._id || req.user.company;

//     if (!companyId) {
//       return res.status(400).json({ error: 'Company information not found' });
//     }

//     // Validate ObjectId
//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ error: 'Invalid job ID format' });
//     }

//     // Get shadow entry with COMPLETE MasterJob data
//     const shadowJob = await CompanyJob.findOne({
//       _id: jobId,
//       companyId
//     }).populate('masterJobId');

//     if (!shadowJob) {
//       return res.status(404).json({ error: 'Job not found' });
//     }

//     const masterJob = shadowJob.masterJobId;

//     // Combine MasterJob + CompanyJob data (COMPLETE DATA)
//     const combinedJob = {
//       // Company-specific data (from CompanyJob)
//       _id: shadowJob._id,
//       currentStatus: shadowJob.currentStatus,
//       statusHistory: shadowJob.statusHistory || [],
//       comments: shadowJob.comments || [],
//       proposal: shadowJob.proposal || '',
//       companyScore: shadowJob.companyScore || [],
//       isBookmarked: shadowJob.isBookmarked || false,
//       distributedAt: shadowJob.distributedAt,
//       lastUpdated: shadowJob.lastUpdated,
      
//       // COMPLETE MasterJob data (all fields)
//       ...masterJob.toObject(), // This spreads ALL MasterJob fields
      
//       // Ensure these fields are properly formatted
//       location: masterJob.city && masterJob.country 
//         ? `${masterJob.city}, ${masterJob.country}`.trim()
//         : masterJob.city || masterJob.country || '',
      
//       // Add any computed fields if needed
//       fullDescription: masterJob.description || masterJob.descriptionText || '',
//       displaySalary: masterJob.salary || masterJob.fixedBudget || masterJob.minHourlyRate || 'Not specified'
//     };

//     res.json({
//       job: combinedJob
//     });

//   } catch (error) {
//     console.error('Get job details error:', error);
//     res.status(500).json({ 
//       error: 'Failed to fetch job details', 
//       details: error.message 
//     });
//   }
// };

// // Update company-specific job data (only CompanyJob fields)
// const updateJobStatus = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { status, notes } = req.body;
//     const companyId = req.user.company?._id || req.user.company;
//     const userId = req.user._id;
//     const username = req.user.username;

//     if (!companyId) {
//       return res.status(400).json({ error: 'Company information not found' });
//     }

//     // Validate ObjectId
//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ error: 'Invalid job ID format' });
//     }

//     const shadowJob = await CompanyJob.findOne({
//       _id: jobId,
//       companyId
//     });

//     if (!shadowJob) {
//       return res.status(404).json({ error: 'Job not found' });
//     }

//     // Update only CompanyJob fields
//     const oldStatus = shadowJob.currentStatus;
//     shadowJob.currentStatus = status;
    
//     shadowJob.statusHistory.push({
//       status,
//       changedBy: userId,
//       username,
//       date: new Date(),
//       notes: notes || ''
//     });

//     shadowJob.lastUpdated = new Date();
//     await shadowJob.save();

//     res.json({
//       message: 'Job status updated successfully',
//       job: {
//         _id: shadowJob._id,
//         currentStatus: shadowJob.currentStatus,
//         statusHistory: shadowJob.statusHistory
//       },
//       oldStatus,
//       newStatus: status
//     });

//   } catch (error) {
//     console.error('Update job status error:', error);
//     res.status(500).json({ 
//       error: 'Failed to update job status', 
//       details: error.message 
//     });
//   }
// };

// // Add comment (only to CompanyJob)
// const addJobComment = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { comment, isPrivate = false } = req.body;
//     const companyId = req.user.company?._id || req.user.company;
//     const userId = req.user._id;
//     const username = req.user.username;

//     if (!companyId) {
//       return res.status(400).json({ error: 'Company information not found' });
//     }

//     // Validate ObjectId
//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ error: 'Invalid job ID format' });
//     }

//     const shadowJob = await CompanyJob.findOne({
//       _id: jobId,
//       companyId
//     });

//     if (!shadowJob) {
//       return res.status(404).json({ error: 'Job not found' });
//     }

//     shadowJob.comments.push({
//       author: userId,
//       username,
//       comment,
//       isPrivate,
//       date: new Date()
//     });

//     shadowJob.lastUpdated = new Date();
//     await shadowJob.save();

//     res.json({
//       message: 'Comment added successfully',
//       comment: shadowJob.comments[shadowJob.comments.length - 1]
//     });

//   } catch (error) {
//     console.error('Add job comment error:', error);
//     res.status(500).json({ 
//       error: 'Failed to add comment', 
//       details: error.message 
//     });
//   }
// };

// // Update job proposal
// const updateJobProposal = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { proposal } = req.body;
//     const companyId = req.user.company?._id || req.user.company;

//     if (!companyId) {
//       return res.status(400).json({ error: 'Company information not found' });
//     }

//     // Validate ObjectId
//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ error: 'Invalid job ID format' });
//     }

//     const shadowJob = await CompanyJob.findOneAndUpdate(
//       { _id: jobId, companyId },
//       { 
//         proposal,
//         lastUpdated: new Date()
//       },
//       { new: true }
//     );

//     if (!shadowJob) {
//       return res.status(404).json({ error: 'Job not found' });
//     }

//     res.json({
//       message: 'Proposal updated successfully',
//       proposal: shadowJob.proposal
//     });

//   } catch (error) {
//     console.error('Update job proposal error:', error);
//     res.status(500).json({ 
//       error: 'Failed to update proposal', 
//       details: error.message 
//     });
//   }
// };

// // Rate/score a job
// const rateJob = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { value, notes } = req.body;
//     const companyId = req.user.company?._id || req.user.company;
//     const userId = req.user._id;
//     const username = req.user.username;

//     if (!companyId) {
//       return res.status(400).json({ error: 'Company information not found' });
//     }

//     // Validate ObjectId
//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ error: 'Invalid job ID format' });
//     }

//     const shadowJob = await CompanyJob.findOne({
//       _id: jobId,
//       companyId
//     });

//     if (!shadowJob) {
//       return res.status(404).json({ error: 'Job not found' });
//     }

//     shadowJob.companyScore.push({
//       value,
//       scoredBy: userId,
//       username,
//       date: new Date(),
//       notes: notes || ''
//     });

//     shadowJob.lastUpdated = new Date();
//     await shadowJob.save();

//     res.json({
//       message: 'Job rated successfully',
//       rating: shadowJob.companyScore[shadowJob.companyScore.length - 1]
//     });

//   } catch (error) {
//     console.error('Rate job error:', error);
//     res.status(500).json({ 
//       error: 'Failed to rate job', 
//       details: error.message 
//     });
//   }
// };

// // Get company job statistics
// const getCompanyJobStats = async (req, res) => {
//   try {
//     const companyId = req.user.company?._id || req.user.company;
    
//     if (!companyId) {
//       return res.status(400).json({ error: 'Company information not found' });
//     }

//     // Get status breakdown from shadow entries
//     const statusBreakdown = await CompanyJob.aggregate([
//       { $match: { companyId } },
//       {
//         $group: {
//           _id: '$currentStatus',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // Get platform breakdown by joining with MasterJob
//     const platformBreakdown = await CompanyJob.aggregate([
//       { $match: { companyId } },
//       {
//         $lookup: {
//           from: 'masterjobs',
//           localField: 'masterJobId',
//           foreignField: '_id',
//           as: 'masterJob'
//         }
//       },
//       { $unwind: '$masterJob' },
//       {
//         $group: {
//           _id: '$masterJob.platform',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     const totalJobs = await CompanyJob.countDocuments({ companyId });

//     res.json({
//       totalJobs,
//       statusBreakdown: statusBreakdown.reduce((acc, stat) => {
//         acc[stat._id] = stat.count;
//         return acc;
//       }, {}),
//       platformBreakdown: platformBreakdown.reduce((acc, stat) => {
//         acc[stat._id] = stat.count;
//         return acc;
//       }, {})
//     });

//   } catch (error) {
//     console.error('Get company job stats error:', error);
//     res.status(500).json({ 
//       error: 'Failed to get statistics', 
//       details: error.message 
//     });
//   }
// };

// module.exports = {
//   getCompanyJobs,
//   getUserJobs,
//   getJobDetails,
//   updateJobStatus,
//   addJobComment,
//   updateJobProposal,
//   rateJob,
//   getCompanyJobStats
// };

const CompanyJob = require('../models/CompanyJob');
const MasterJob = require('../models/MasterJob');
const Company = require('../models/Company');
const mongoose = require('mongoose');

// Helper function to safely convert to ObjectId
const toObjectId = (val) => {
  if (!val) return null;
  if (val instanceof mongoose.Types.ObjectId) return val;
  try { 
    return new mongoose.Types.ObjectId(val.toString()); 
  } catch (error) { 
    return null; 
  }
};

// Helper function to clean MasterJob data for user display
const cleanMasterJobData = (masterJob) => {
  if (!masterJob) return null;
  
  // Remove internal/technical fields that users don't need
  const {
    _id,
    scrapedAt,
    isActive,
    distributedTo,
    source,
    processed,
    createdAt,
    updatedAt,
    __v,
    batchId,
    // Remove other internal fields
    ...cleanData
  } = masterJob.toObject();
  
  return cleanData;
};

// Get company jobs with filtering and pagination
const getCompanyJobs = async (req, res) => {
  try {
    const companyId = req.user.company._id;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      platform,
      search 
    } = req.query;

    const filter = { companyId };
    
    if (status) filter.currentStatus = status;
    if (platform) filter.platform = platform;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const jobs = await CompanyJob.find(filter)
      .populate('masterJobId', 'title description platform company location skills tier ai_remark final_weighted_score')
      .sort({ distributedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CompanyJob.countDocuments(filter);

    // Clean the data for user display
    const cleanJobs = jobs.map(job => {
      const jobObj = job.toObject();
      if (jobObj.masterJobId) {
        jobObj.masterJobData = cleanMasterJobData(job.masterJobId);
        delete jobObj.masterJobId;
      }
      return jobObj;
    });

    res.json({
      jobs: cleanJobs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get company jobs error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch jobs',
      details: error.message 
    });
  }
};

// Get user jobs for dashboard (simplified view)
const getUserJobs = async (req, res) => {
  try {
    const companyId = req.user.company._id;
    
    // Get company jobs with master job data
    const jobs = await CompanyJob.find({ companyId })
      .populate('masterJobId')
      .sort({ distributedAt: -1 });

    // Clean and merge data for user display
    const cleanJobs = jobs.map(job => {
      const jobObj = job.toObject();
      
      // Get master job data
      if (jobObj.masterJobId) {
        const masterData = cleanMasterJobData(job.masterJobId);
        // Merge master data with company-specific data
        const mergedJob = {
          ...masterData,
          // Company-specific fields (these override master data if needed)
          currentStatus: jobObj.currentStatus,
          statusHistory: jobObj.statusHistory,
          comments: jobObj.comments,
          proposal: jobObj.proposal,
          companyScore: jobObj.companyScore,
          isBookmarked: jobObj.isBookmarked,
          distributedAt: jobObj.distributedAt,
          lastUpdated: jobObj.lastUpdated,
          // Keep the company job ID for updates
          _id: jobObj._id
        };
        return mergedJob;
      }
      
      return jobObj;
    });

    res.json({
      jobs: cleanJobs,
      total: cleanJobs.length
    });

  } catch (error) {
    console.error('Get user jobs error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch job details',
      details: error.message 
    });
  }
};

// Get single job details with complete master data
const getJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    const companyId = req.user.company._id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    const job = await CompanyJob.findOne({
      _id: jobId,
      companyId
    }).populate('masterJobId');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Merge master data with company data
    const jobObj = job.toObject();
    if (jobObj.masterJobId) {
      const masterData = cleanMasterJobData(job.masterJobId);
      const mergedJob = {
        ...masterData,
        currentStatus: jobObj.currentStatus,
        statusHistory: jobObj.statusHistory,
        comments: jobObj.comments,
        proposal: jobObj.proposal,
        companyScore: jobObj.companyScore,
        isBookmarked: jobObj.isBookmarked,
        distributedAt: jobObj.distributedAt,
        lastUpdated: jobObj.lastUpdated,
        _id: jobObj._id
      };
      
      res.json({ job: mergedJob });
    } else {
      res.json({ job: jobObj });
    }

  } catch (error) {
    console.error('Get job details error:', error);
    res.status(500).json({ 
      error: 'Failed to get job details',
      details: error.message 
    });
  }
};

// Update job status
const updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, comment } = req.body;
    const companyId = req.user.company._id;
    const username = req.user.username;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    const job = await CompanyJob.findOne({
      _id: jobId,
      companyId
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Update job status
    job.currentStatus = status;
    job.lastUpdated = new Date();

    // Add to status history
    job.statusHistory.push({
      status,
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
    res.status(500).json({ 
      error: 'Failed to update job status',
      details: error.message 
    });
  }
};

// Add comment to job
const addJobComment = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { comment, username } = req.body;
    const companyId = req.user.company._id;
    const currentUsername = req.user.username;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    const job = await CompanyJob.findOne({
      _id: jobId,
      companyId
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Add comment
    job.comments.push({
      comment,
      username: username || currentUsername,
      date: new Date()
    });

    job.lastUpdated = new Date();
    await job.save();

    res.json({
      message: 'Comment added successfully',
      job
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ 
      error: 'Failed to add comment',
      details: error.message 
    });
  }
};

// Update job proposal
const updateJobProposal = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { proposal } = req.body;
    const companyId = req.user.company._id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    const job = await CompanyJob.findOne({
      _id: jobId,
      companyId
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    job.proposal = proposal;
    job.lastUpdated = new Date();
    await job.save();

    res.json({
      message: 'Proposal updated successfully',
      job
    });

  } catch (error) {
    console.error('Update proposal error:', error);
    res.status(500).json({ 
      error: 'Failed to update proposal',
      details: error.message 
    });
  }
};

// Rate/score job
const rateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { score, comment } = req.body;
    const companyId = req.user.company._id;
    const username = req.user.username;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    const job = await CompanyJob.findOne({
      _id: jobId,
      companyId
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Add company score
    job.companyScore.push({
      score,
      comment,
      username,
      date: new Date()
    });

    job.lastUpdated = new Date();
    await job.save();

    res.json({
      message: 'Job rated successfully',
      job
    });

  } catch (error) {
    console.error('Rate job error:', error);
    res.status(500).json({ 
      error: 'Failed to rate job',
      details: error.message 
    });
  }
};

// Get company job statistics
const getCompanyJobStats = async (req, res) => {
  try {
    const companyId = req.user.company._id;

    // Get status breakdown
    const statusBreakdown = await CompanyJob.aggregate([
      { $match: { companyId } },
      {
        $group: {
          _id: '$currentStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object
    const statusBreakdownObj = {};
    statusBreakdown.forEach(item => {
      statusBreakdownObj[item._id] = item.count;
    });

    // Get platform breakdown
    const platformBreakdown = await CompanyJob.aggregate([
      { $match: { companyId } },
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      statusBreakdown: statusBreakdownObj,
      platformBreakdown,
      totalJobs: await CompanyJob.countDocuments({ companyId })
    });

  } catch (error) {
    console.error('Get company jobs stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get statistics',
      details: error.message 
    });
  }
};
// Get company user performance (per-user metrics within a company)
const getCompanyUserPerformance = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Permissions: super_admin can view any; company_admin only their own company
    if (req.user.role === 'company_admin' && req.user.company._id.toString() !== companyId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ error: 'Invalid company ID' });
    }
    const companyObjId = new mongoose.Types.ObjectId(companyId);

    // Aggregations
    const [statusAgg, commentsAgg, ratingsAgg] = await Promise.all([
      CompanyJob.aggregate([
        { $match: { companyId: companyObjId } },
        { $unwind: '$statusHistory' },
        { $match: { 'statusHistory.username': { $ne: null } } },
        {
          $group: {
            _id: '$statusHistory.username',
            statusChanges: { $sum: 1 },
            lastActivity: { $max: '$statusHistory.date' }
          }
        }
      ]),
      CompanyJob.aggregate([
        { $match: { companyId: companyObjId } },
        { $unwind: '$comments' },
        { $match: { 'comments.username': { $ne: null } } },
        {
          $group: {
            _id: '$comments.username',
            comments: { $sum: 1 },
            lastCommentAt: { $max: '$comments.date' }
          }
        }
      ]),
      CompanyJob.aggregate([
        { $match: { companyId: companyObjId } },
        { $unwind: '$companyScore' },
        { $match: { 'companyScore.username': { $ne: null } } },
        {
          $group: {
            _id: '$companyScore.username',
            ratings: { $sum: 1 },
            lastRatedAt: { $max: '$companyScore.date' }
          }
        }
      ])
    ]);

    // Merge results by username
    const map = {};
    for (const s of statusAgg) {
      map[s._id] = {
        username: s._id,
        statusChanges: s.statusChanges || 0,
        lastActivity: s.lastActivity || null,
        comments: 0,
        ratings: 0
      };
    }
    for (const c of commentsAgg) {
      const m = map[c._id] || { username: c._id, statusChanges: 0, lastActivity: null, comments: 0, ratings: 0 };
      m.comments = c.comments || 0;
      m.lastActivity = new Date(Math.max(m.lastActivity ? new Date(m.lastActivity).getTime() : 0, c.lastCommentAt ? new Date(c.lastCommentAt).getTime() : 0));
      map[c._id] = m;
    }
    for (const r of ratingsAgg) {
      const m = map[r._id] || { username: r._id, statusChanges: 0, lastActivity: null, comments: 0, ratings: 0 };
      m.ratings = r.ratings || 0;
      m.lastActivity = new Date(Math.max(m.lastActivity ? new Date(m.lastActivity).getTime() : 0, r.lastRatedAt ? new Date(r.lastRatedAt).getTime() : 0));
      map[r._id] = m;
    }

    const users = Object.values(map)
      .map(u => ({ ...u, lastActivity: u.lastActivity || null }))
      .sort((a, b) => {
        const ta = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
        const tb = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
        return tb - ta;
      });

    res.json({
      companyId,
      users
    });
  } catch (error) {
    console.error('Get company user performance error:', error);
    res.status(500).json({ error: 'Failed to get user performance', details: error.message });
  }
};

module.exports = {
  getCompanyJobs,
  getUserJobs,
  getJobDetails,
  updateJobStatus,
  addJobComment,
  updateJobProposal,
  rateJob,
  getCompanyJobStats,
  getCompanyUserPerformance
};
