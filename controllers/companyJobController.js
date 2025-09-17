
// const CompanyJob = require('../models/CompanyJob');
// const MasterJob = require('../models/MasterJob');
// const Company = require('../models/Company');
// const mongoose = require('mongoose');
// const { spawn } = require('child_process');
// const path = require('path');
// const fs = require('fs');

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

// // Helper function to clean MasterJob data for user display
// // const cleanMasterJobData = (masterJob) => {
// //   if (!masterJob) return null;
  
// //   // Remove internal/technical fields that users don't need
// //   const {
// //     _id,
// //     scrapedAt,
// //     isActive,
// //     distributedTo,
// //     source,
// //     processed,
// //     createdAt,
// //     updatedAt,
// //     __v,
// //     batchId,
// //     // Remove other internal fields
// //     ...cleanData
// //   } = masterJob.toObject();
  
// //   return cleanData;
// // };
// const cleanMasterJobData = (masterJob) => {
//   if (!masterJob) return null;
  
//   // Handle both Mongoose documents and plain objects
//   const jobObj = masterJob.toObject ? masterJob.toObject() : masterJob;
  
//   // Remove MongoDB internal fields
//   delete jobObj._id;
//   delete jobObj.__v;
//   delete jobObj.createdAt;
//   delete jobObj.updatedAt;
  
//   // Remove company-managed fields
//   delete jobObj.currentStatus;
//   delete jobObj.statusHistory;
//   delete jobObj.comments;
//   delete jobObj.distributedTo;
  
//   // Convert nested company objects to safe display format
//   if (jobObj['company.specialities']) {
//     jobObj.companySpecialities = Array.isArray(jobObj['company.specialities']) 
//       ? jobObj['company.specialities'] 
//       : [];
//     delete jobObj['company.specialities'];
//   }
  
//   if (jobObj['company.industries']) {
//     jobObj.companyIndustries = Array.isArray(jobObj['company.industries']) 
//       ? jobObj['company.industries'] 
//       : [];
//     delete jobObj['company.industries'];
//   }
  
//   if (jobObj['company.locations']) {
//     jobObj.companyLocations = Array.isArray(jobObj['company.locations']) 
//       ? jobObj['company.locations'] 
//       : [];
//     delete jobObj['company.locations'];
//   }
  
//   // Handle other company fields safely
//   if (jobObj['company.name']) {
//     jobObj.companyDisplayName = jobObj['company.name'];
//   }
  
//   if (jobObj['company.description']) {
//     jobObj.companyDescription = jobObj['company.description'];
//   }
  
//   if (jobObj['company.employeeCount']) {
//     jobObj.companyEmployeeCount = jobObj['company.employeeCount'];
//   }
  
//   if (jobObj['company.followerCount']) {
//     jobObj.companyFollowerCount = jobObj['company.followerCount'];
//   }
  
//   if (jobObj['company.linkedinUrl']) {
//     jobObj.companyLinkedinUrl = jobObj['company.linkedinUrl'];
//   }
  
//   if (jobObj['company.logo']) {
//     jobObj.companyLogo = jobObj['company.logo'];
//   }
  
//   if (jobObj['company.website']) {
//     jobObj.companyWebsite = jobObj['company.website'];
//   }
  
//   // Ensure skills and tags are arrays
//   if (jobObj.skills && !Array.isArray(jobObj.skills)) {
//     jobObj.skills = [];
//   }
  
//   if (jobObj.tags && !Array.isArray(jobObj.tags)) {
//     jobObj.tags = [];
//   }
  
//   // Handle other arrays that might be objects
//   if (jobObj.openJobs && !Array.isArray(jobObj.openJobs)) {
//     jobObj.openJobs = [];
//   }
  
//   if (jobObj.questions && !Array.isArray(jobObj.questions)) {
//     jobObj.questions = [];
//   }
  
//   if (jobObj.qualificationsCountries && !Array.isArray(jobObj.qualificationsCountries)) {
//     jobObj.qualificationsCountries = [];
//   }
  
//   if (jobObj.qualificationsLanguages && !Array.isArray(jobObj.qualificationsLanguages)) {
//     jobObj.qualificationsLanguages = [];
//   }
  
//   return jobObj;
// };

// // Get company jobs with filtering and pagination
// const getCompanyJobs = async (req, res) => {
//   try {
//     const companyId = req.user.company._id;
//     const { 
//       page = 1, 
//       limit = 10, 
//       status, 
//       platform,
//       search 
//     } = req.query;

//     const filter = { companyId };
    
//     if (status) filter.currentStatus = status;
//     if (platform) filter.platform = platform;
//     if (search) {
//       filter.$or = [
//         { title: { $regex: search, $options: 'i' } },
//         { description: { $regex: search, $options: 'i' } }
//       ];
//     }

//     const skip = (page - 1) * limit;
    
//     const jobs = await CompanyJob.find(filter)
//       .populate('masterJobId', 'title description platform company location skills tier ai_remark final_weighted_score')
//       .sort({ distributedAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await CompanyJob.countDocuments(filter);

//     // Clean the data for user display
//     const cleanJobs = jobs.map(job => {
//       const jobObj = job.toObject();
//       if (jobObj.masterJobId) {
//         jobObj.masterJobData = cleanMasterJobData(job.masterJobId);
//         delete jobObj.masterJobId;
//       }
//       return jobObj;
//     });

//     res.json({
//       jobs: cleanJobs,
//       pagination: {
//         current: parseInt(page),
//         pages: Math.ceil(total / limit),
//         total,
//         hasNext: page * limit < total,
//         hasPrev: page > 1
//       }
//     });

//   } catch (error) {
//     console.error('Get company jobs error:', error);
//     res.status(500).json({ 
//       error: 'Failed to fetch jobs',
//       details: error.message 
//     });
//   }
// };

// // Get user jobs for dashboard (simplified view)
// const getUserJobs = async (req, res) => {
//   try {
//     const companyId = req.user.company._id;
    
//     console.log('Getting user jobs for:', req.user.username, 'Company:', companyId);
    
//     // Get company jobs with master job data
//     const jobs = await CompanyJob.find({ companyId })
//       .populate('masterJobId')
//       .sort({ distributedAt: -1 });

//     console.log(`Found ${jobs.length} jobs for company ${companyId}`);

//     // Clean and merge data for user display
//     const cleanJobs = jobs.map(job => {
//       const jobObj = job.toObject();
      
//       // Get master job data
//       if (jobObj.masterJobId) {
//         const masterData = cleanMasterJobData(job.masterJobId);
//         // Merge master data with company-specific data
//         const mergedJob = {
//           ...masterData,
//           // Company-specific fields (these override master data if needed)
//           currentStatus: jobObj.currentStatus,
//           statusHistory: jobObj.statusHistory,
//           comments: jobObj.comments,
//           proposal: jobObj.proposal,
//           companyScore: jobObj.companyScore,
//           isBookmarked: jobObj.isBookmarked,
//           distributedAt: jobObj.distributedAt,
//           lastUpdated: jobObj.lastUpdated,
//           // Keep the company job ID for updates
//           _id: jobObj._id
//         };
//         return mergedJob;
//       }
      
//       return jobObj;
//     });

//     res.json({
//       jobs: cleanJobs,
//       total: cleanJobs.length
//     });

//   } catch (error) {
//     console.error('Get user jobs error:', error);
//     res.status(500).json({ 
//       error: 'Failed to fetch user jobs',
//       details: error.message 
//     });
//   }
// };
// // Get user jobs for dashboard (with proper pagination)
// // const getUserJobs = async (req, res) => {
// //   try {
// //     const companyId = req.user.company._id;
    
// //     // Extract pagination parameters
// //     const page = parseInt(req.query.page) || 1;
// //     const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 per page
// //     const skip = (page - 1) * limit;
    
// //     // Extract filter parameters
// //     const { status, platform, search, tier, score_min, score_max } = req.query;
    
// //     console.log(`Getting user jobs - Page: ${page}, Limit: ${limit}, Company: ${companyId}`);
    
// //     // Build filter query
// //     const matchQuery = { companyId };
    
// //     // Add filters if provided
// //     if (status) matchQuery.currentStatus = status;
// //     if (platform) matchQuery.platform = platform;
    
// //     // Get jobs with proper pagination using aggregation pipeline
// //     const pipeline = [
// //       // Match company jobs
// //       { $match: matchQuery },
      
// //       // Lookup master job data
// //       {
// //         $lookup: {
// //           from: 'masterjobs',
// //           localField: 'masterJobId',
// //           foreignField: '_id',
// //           as: 'masterJobData'
// //         }
// //       },
      
// //       // Unwind master job data
// //       { $unwind: '$masterJobData' },
      
// //       // Add search filter if provided
// //       ...(search ? [{
// //         $match: {
// //           $or: [
// //             { 'masterJobData.title': { $regex: search, $options: 'i' } },
// //             { 'masterJobData.description': { $regex: search, $options: 'i' } },
// //             { 'masterJobData.companyName': { $regex: search, $options: 'i' } }
// //           ]
// //         }
// //       }] : []),
      
// //       // Add tier filter if provided
// //       ...(tier ? [{ $match: { 'masterJobData.tier': tier } }] : []),
      
// //       // Add score filter if provided
// //       ...(score_min || score_max ? [{
// //         $match: {
// //           ...(score_min && { 'masterJobData.final_weighted_score': { $gte: parseFloat(score_min) } }),
// //           ...(score_max && { 'masterJobData.final_weighted_score': { $lte: parseFloat(score_max) } })
// //         }
// //       }] : []),
      
// //       // Sort by distribution date (newest first)
// //       { $sort: { distributedAt: -1 } },
      
// //       // Get total count
// //       {
// //         $facet: {
// //           data: [
// //             { $skip: skip },
// //             { $limit: limit },
// //             {
// //               $project: {
// //                 // Company job fields
// //                 _id: 1,
// //                 currentStatus: 1,
// //                 statusHistory: 1,
// //                 comments: 1,
// //                 proposal: 1,
// //                 companyScore: 1,
// //                 isBookmarked: 1,
// //                 distributedAt: 1,
// //                 lastUpdated: 1,
                
// //                 // Master job fields (merged)
// //                 jobId: '$masterJobData.jobId',
// //                 title: '$masterJobData.title',
// //                 description: '$masterJobData.description',
// //                 descriptionText: '$masterJobData.descriptionText',
// //                 platform: '$masterJobData.platform',
// //                 companyName: '$masterJobData.companyName',
// //                 skills: '$masterJobData.skills',
// //                 tier: '$masterJobData.tier',
// //                 final_score: '$masterJobData.final_score',
// //                 final_weighted_score: '$masterJobData.final_weighted_score',
// //                 ai_remark: '$masterJobData.ai_remark',
// //                 predicted_domain: '$masterJobData.predicted_domain',
// //                 postedDate: '$masterJobData.postedDate',
// //                 salary: '$masterJobData.salary',
// //                 location: '$masterJobData.city',
// //                 country: '$masterJobData.country',
// //                 url: '$masterJobData.url',
// //                 linkedinUrl: '$masterJobData.linkedinUrl',
                
// //                 // AE fields
// //                 ae_comment: '$masterJobData.ae_comment',
// //                 ae_score: '$masterJobData.ae_score',
// //                 ae_pitched: '$masterJobData.ae_pitched',
// //                 estimated_budget: '$masterJobData.estimated_budget'
// //               }
// //             }
// //           ],
// //           totalCount: [
// //             { $count: "count" }
// //           ]
// //         }
// //       }
// //     ];
    
// //     const result = await CompanyJob.aggregate(pipeline);
    
// //     const jobs = result[0].data;
// //     const total = result[0].totalCount[0]?.count || 0;
    
// //     console.log(`Found ${jobs.length} jobs out of ${total} total for company ${companyId}`);

// //     res.json({
// //       jobs,
// //       pagination: {
// //         page,
// //         limit,
// //         total,
// //         pages: Math.ceil(total / limit),
// //         hasNext: page < Math.ceil(total / limit),
// //         hasPrev: page > 1
// //       },
// //       filters: {
// //         status,
// //         platform,
// //         search,
// //         tier,
// //         score_min,
// //         score_max
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Get user jobs error:', error);
// //     res.status(500).json({ 
// //       error: 'Failed to fetch user jobs',
// //       details: error.message 
// //     });
// //   }
// // };

// // Get single job details with complete master data
// // const getJobDetails = async (req, res) => {
// //   try {
// //     const { jobId } = req.params;
// //     const companyId = req.user.company._id;

// //     if (!mongoose.Types.ObjectId.isValid(jobId)) {
// //       return res.status(400).json({ error: 'Invalid job ID format' });
// //     }

// //     const job = await CompanyJob.findOne({
// //       _id: jobId,
// //       companyId
// //     }).populate('masterJobId');

// //     if (!job) {
// //       return res.status(404).json({ error: 'Job not found' });
// //     }

// //     // Merge master data with company data
// //     const jobObj = job.toObject();
// //     if (jobObj.masterJobId) {
// //       const masterData = cleanMasterJobData(job.masterJobId);
// //       const mergedJob = {
// //         ...masterData,
// //         currentStatus: jobObj.currentStatus,
// //         statusHistory: jobObj.statusHistory,
// //         comments: jobObj.comments,
// //         proposal: jobObj.proposal,
// //         companyScore: jobObj.companyScore,
// //         isBookmarked: jobObj.isBookmarked,
// //         distributedAt: jobObj.distributedAt,
// //         lastUpdated: jobObj.lastUpdated,
// //         _id: jobObj._id
// //       };
      
// //       res.json({ job: mergedJob });
// //     } else {
// //       res.json({ job: jobObj });
// //     }

// //   } catch (error) {
// //     console.error('Get job details error:', error);
// //     res.status(500).json({ 
// //       error: 'Failed to get job details',
// //       details: error.message 
// //     });
// //   }
// // };
// // Get single job details with complete master data


// const getJobDetails = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const companyId = req.user.company._id;

//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ error: 'Invalid job ID format' });
//     }

//     const job = await CompanyJob.findOne({
//       _id: jobId,
//       companyId
//     }).populate('masterJobId');

//     if (!job) {
//       return res.status(404).json({ error: 'Job not found' });
//     }

//     // Merge master data with company data for complete job details
//     const completeJobData = {
//       // Company job fields
//       _id: job._id,
//       companyId: job.companyId,
//       currentStatus: job.currentStatus,
//       statusHistory: job.statusHistory,
//       comments: job.comments,
//       proposal: job.proposal,
//       companyScore: job.companyScore,
//       isBookmarked: job.isBookmarked,
//       distributedAt: job.distributedAt,
//       lastUpdated: job.lastUpdated,
      
//       // Master job data (all fields)
//       ...job.masterJobId.toObject(),
      
//       // Override with company-specific data
//       currentStatus: job.currentStatus,
//       statusHistory: job.statusHistory,
//       comments: job.comments,
//       proposal: job.proposal
//     };
    
//     res.json({ job: completeJobData });

//   } catch (error) {
//     console.error('Get job details error:', error);
//     res.status(500).json({ 
//       error: 'Failed to get job details',
//       details: error.message 
//     });
//   }
// };
// // const getJobDetails = async (req, res) => {
// //   try {
// //     const { jobId } = req.params;
// //     const companyId = req.user.company._id;
    
// //     // Pagination parameters
// //     const page = parseInt(req.query.page) || 1;
// //     const limit = parseInt(req.query.limit) || 20;
// //     const skip = (page - 1) * limit;
    
// //     // Lazy loading parameters
// //     const includeStatusHistory = req.query.includeStatusHistory === 'true';
// //     const includeComments = req.query.includeComments === 'true';
// //     const includeCompanyScores = req.query.includeCompanyScores === 'true';

// //     if (!mongoose.Types.ObjectId.isValid(jobId)) {
// //       return res.status(400).json({ error: 'Invalid job ID format' });
// //     }

// //     // Build population options based on lazy loading requirements
// //     const populateOptions = {
// //       path: 'masterJobId',
// //       select: 'title description platform companyName skills tier final_score ai_remark'
// //     };

// //     // Base job query
// //     let jobQuery = CompanyJob.findOne({
// //       _id: jobId,
// //       companyId
// //     }).populate(populateOptions);

// //     const job = await jobQuery;

// //     if (!job) {
// //       return res.status(404).json({ error: 'Job not found' });
// //     }

// //     // Prepare base response
// //     const completeJobData = {
// //       // Company job fields (always included)
// //       _id: job._id,
// //       companyId: job.companyId,
// //       currentStatus: job.currentStatus,
// //       isBookmarked: job.isBookmarked,
// //       distributedAt: job.distributedAt,
// //       lastUpdated: job.lastUpdated,
// //       proposal: job.proposal,
      
// //       // Master job data (always included)
// //       ...job.masterJobId.toObject()
// //     };

// //     // Lazy load status history with pagination
// //     if (includeStatusHistory) {
// //       const statusHistory = job.statusHistory
// //         .sort((a, b) => new Date(b.date) - new Date(a.date))
// //         .slice(skip, skip + limit);
      
// //       completeJobData.statusHistory = statusHistory;
// //       completeJobData.statusHistoryPagination = {
// //         page,
// //         limit,
// //         total: job.statusHistory.length,
// //         hasMore: (skip + limit) < job.statusHistory.length
// //       };
// //     }

// //     // Lazy load comments with pagination
// //     if (includeComments) {
// //       const comments = job.comments
// //         .sort((a, b) => new Date(b.date) - new Date(a.date))
// //         .slice(skip, skip + limit);
      
// //       completeJobData.comments = comments;
// //       completeJobData.commentsPagination = {
// //         page,
// //         limit,
// //         total: job.comments.length,
// //         hasMore: (skip + limit) < job.comments.length
// //       };
// //     }

// //     // Lazy load company scores with pagination
// //     if (includeCompanyScores) {
// //       const companyScores = job.companyScore
// //         .sort((a, b) => new Date(b.date) - new Date(a.date))
// //         .slice(skip, skip + limit);
      
// //       completeJobData.companyScore = companyScores;
// //       completeJobData.companyScoresPagination = {
// //         page,
// //         limit,
// //         total: job.companyScore.length,
// //         hasMore: (skip + limit) < job.companyScore.length
// //       };
// //     }

// //     res.json({ 
// //       job: completeJobData,
// //       lazyLoadingOptions: {
// //         includeStatusHistory,
// //         includeComments,
// //         includeCompanyScores
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Get job details error:', error);
// //     res.status(500).json({ 
// //       error: 'Failed to get job details',
// //       details: error.message 
// //     });
// //   }
// // };

// // Update job status
// const updateJobStatus = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { status, comment } = req.body;
//     const companyId = req.user.company._id;
//     const username = req.user.username;

//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ error: 'Invalid job ID format' });
//     }

//     const job = await CompanyJob.findOne({
//       _id: jobId,
//       companyId
//     });

//     if (!job) {
//       return res.status(404).json({ error: 'Job not found' });
//     }

//     // Update job status
//     job.currentStatus = status;
//     job.lastUpdated = new Date();

//     // Add to status history
//     job.statusHistory.push({
//       status,
//       username,
//       changedBy: req.user._id,
//       date: new Date(),
//       notes: comment || `Status changed to ${status.replace('_', ' ')}`,
//       type: 'status_change'
//     });

//     await job.save();

//     res.json({
//       message: 'Job status updated successfully',
//       job
//     });

//   } catch (error) {
//     console.error('Update job status error:', error);
//     res.status(500).json({ 
//       error: 'Failed to update job status',
//       details: error.message 
//     });
//   }
// };

// // Add comment to job
// const addJobComment = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { comment, username } = req.body;
//     const companyId = req.user.company._id;
//     const currentUsername = req.user.username;

//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ error: 'Invalid job ID format' });
//     }

//     const job = await CompanyJob.findOne({
//       _id: jobId,
//       companyId
//     });

//     if (!job) {
//       return res.status(404).json({ error: 'Job not found' });
//     }

//     // Add comment
//     job.comments.push({
//       comment,
//       username: username || currentUsername,
//       date: new Date()
//     });

//     job.lastUpdated = new Date();
//     await job.save();

//     res.json({
//       message: 'Comment added successfully',
//       job
//     });

//   } catch (error) {
//     console.error('Add comment error:', error);
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
//     const companyId = req.user.company._id;

//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ error: 'Invalid job ID format' });
//     }

//     const job = await CompanyJob.findOne({
//       _id: jobId,
//       companyId
//     });

//     if (!job) {
//       return res.status(404).json({ error: 'Job not found' });
//     }

//     job.proposal = proposal;
//     job.lastUpdated = new Date();
//     await job.save();

//     res.json({
//       message: 'Proposal updated successfully',
//       job
//     });

//   } catch (error) {
//     console.error('Update proposal error:', error);
//     res.status(500).json({ 
//       error: 'Failed to update proposal',
//       details: error.message 
//     });
//   }
// };

// // Rate/score job
// const rateJob = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { score, comment } = req.body;
//     const companyId = req.user.company._id;
//     const username = req.user.username;

//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ error: 'Invalid job ID format' });
//     }

//     const job = await CompanyJob.findOne({
//       _id: jobId,
//       companyId
//     });

//     if (!job) {
//       return res.status(404).json({ error: 'Job not found' });
//     }

//     // Add company score
//     job.companyScore.push({
//       score,
//       comment,
//       username,
//       date: new Date()
//     });

//     job.lastUpdated = new Date();
//     await job.save();

//     res.json({
//       message: 'Job rated successfully',
//       job
//     });

//   } catch (error) {
//     console.error('Rate job error:', error);
//     res.status(500).json({ 
//       error: 'Failed to rate job',
//       details: error.message 
//     });
//   }
// };

// // Get company-wide job statistics (NEW)
// const getCompanyWideStats = async (req, res) => {
//   try {
//     const companyId = req.user.company._id;
//     console.log('Getting company stats for companyId:', companyId);

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

//     console.log('Aggregation results:', stats);

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

//     console.log('Formatted stats:', formattedStats);
//     res.json(formattedStats);

//   } catch (error) {
//     console.error('Error fetching company-wide job stats:', error);
//     res.status(500).json({ 
//       error: 'Failed to fetch company job statistics', 
//       details: error.message 
//     });
//   }
// };

// // Get company job statistics (existing)
// const getCompanyJobStats = async (req, res) => {
//   try {
//     const companyId = req.user.company._id;

//     // Get status breakdown
//     const statusBreakdown = await CompanyJob.aggregate([
//       { $match: { companyId } },
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

//     // Get platform breakdown
//     const platformBreakdown = await CompanyJob.aggregate([
//       { $match: { companyId } },
//       {
//         $group: {
//           _id: '$platform',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     res.json({
//       statusBreakdown: statusBreakdownObj,
//       platformBreakdown,
//       totalJobs: await CompanyJob.countDocuments({ companyId })
//     });

//   } catch (error) {
//     console.error('Get company jobs stats error:', error);
//     res.status(500).json({ 
//       error: 'Failed to get statistics',
//       details: error.message 
//     });
//   }
// };

// // Get company user performance (per-user metrics within a company)
// const getCompanyUserPerformance = async (req, res) => {
//   try {
//     const { companyId } = req.params;

//     // Permissions: super_admin can view any; company_admin only their own company
//     if (req.user.role === 'company_admin' && req.user.company._id.toString() !== companyId) {
//       return res.status(403).json({ error: 'Access denied' });
//     }

//     if (!mongoose.Types.ObjectId.isValid(companyId)) {
//       return res.status(400).json({ error: 'Invalid company ID' });
//     }
//     const companyObjId = new mongoose.Types.ObjectId(companyId);

//     // Aggregations
//     const [statusAgg, commentsAgg, ratingsAgg] = await Promise.all([
//       CompanyJob.aggregate([
//         { $match: { companyId: companyObjId } },
//         { $unwind: '$statusHistory' },
//         { $match: { 'statusHistory.username': { $ne: null } } },
//         {
//           $group: {
//             _id: '$statusHistory.username',
//             statusChanges: { $sum: 1 },
//             lastActivity: { $max: '$statusHistory.date' }
//           }
//         }
//       ]),
//       CompanyJob.aggregate([
//         { $match: { companyId: companyObjId } },
//         { $unwind: '$comments' },
//         { $match: { 'comments.username': { $ne: null } } },
//         {
//           $group: {
//             _id: '$comments.username',
//             comments: { $sum: 1 },
//             lastCommentAt: { $max: '$comments.date' }
//           }
//         }
//       ]),
//       CompanyJob.aggregate([
//         { $match: { companyId: companyObjId } },
//         { $unwind: '$companyScore' },
//         { $match: { 'companyScore.username': { $ne: null } } },
//         {
//           $group: {
//             _id: '$companyScore.username',
//             ratings: { $sum: 1 },
//             lastRatedAt: { $max: '$companyScore.date' }
//           }
//         }
//       ])
//     ]);

//     // Merge results by username
//     const map = {};
//     for (const s of statusAgg) {
//       map[s._id] = {
//         username: s._id,
//         statusChanges: s.statusChanges || 0,
//         lastActivity: s.lastActivity || null,
//         comments: 0,
//         ratings: 0
//       };
//     }
//     for (const c of commentsAgg) {
//       const m = map[c._id] || { username: c._id, statusChanges: 0, lastActivity: null, comments: 0, ratings: 0 };
//       m.comments = c.comments || 0;
//       m.lastActivity = new Date(Math.max(m.lastActivity ? new Date(m.lastActivity).getTime() : 0, c.lastCommentAt ? new Date(c.lastCommentAt).getTime() : 0));
//       map[c._id] = m;
//     }
//     for (const r of ratingsAgg) {
//       const m = map[r._id] || { username: r._id, statusChanges: 0, lastActivity: null, comments: 0, ratings: 0 };
//       m.ratings = r.ratings || 0;
//       m.lastActivity = new Date(Math.max(m.lastActivity ? new Date(m.lastActivity).getTime() : 0, r.lastRatedAt ? new Date(r.lastRatedAt).getTime() : 0));
//       map[r._id] = m;
//     }

//     const users = Object.values(map)
//       .map(u => ({ ...u, lastActivity: u.lastActivity || null }))
//       .sort((a, b) => {
//         const ta = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
//         const tb = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
//         return tb - ta;
//       });

//     res.json({
//       companyId,
//       users
//     });
//   } catch (error) {
//     console.error('Get company user performance error:', error);
//     res.status(500).json({ error: 'Failed to get user performance', details: error.message });
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
//   getCompanyJobStats,
//   getCompanyWideStats, // ✅ Add this export
//   getCompanyUserPerformance
// };
// controllers/companyJobController.js
const mongoose = require('mongoose');
const path = require('path');
const { spawn } = require('child_process');

const CompanyJob = require('../models/CompanyJob');
const MasterJob = require('../models/MasterJob');
const User = require('../models/User');

// Helpers
const cleanMasterJobData = (masterJob) => {
  if (!masterJob) return null;
  const jobObj = masterJob.toObject ? masterJob.toObject() : masterJob;
  delete jobObj._id;
  delete jobObj.__v;
  delete jobObj.createdAt;
  delete jobObj.updatedAt;
  delete jobObj.currentStatus;
  delete jobObj.statusHistory;
  delete jobObj.comments;
  delete jobObj.distributedTo;
  return jobObj;
};

// // GET /api/company-jobs
// const getCompanyJobs = async (req, res) => {
//   try {
//     const companyId = req.user.company._id;
//     const page = Math.max(parseInt(req.query.page) || 1, 1);
//     const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
//     const skip = (page - 1) * limit;

//     const { status, platform, search } = req.query;
//     const filter = { companyId };
//     if (status) filter.currentStatus = status;
//     if (platform) filter.platform = platform;
//     if (search) {
//       filter.$or = [
//         { title: { $regex: search, $options: 'i' } },
//         { description: { $regex: search, $options: 'i' } }
//       ];
//     }

//     const [jobs, total] = await Promise.all([
//       CompanyJob.find(filter)
//         .populate('masterJobId', 'title description platform company location skills tier ai_remark final_weighted_score')
//         .sort({ distributedAt: -1 })
//         .skip(skip)
//         .limit(limit),
//       CompanyJob.countDocuments(filter)
//     ]);

//     const cleanJobs = jobs.map(job => {
//       const jobObj = job.toObject();
//       if (jobObj.masterJobId) {
//         jobObj.masterJobData = cleanMasterJobData(job.masterJobId);
//         delete jobObj.masterJobId;
//       }
//       return jobObj;
//     });

//     res.json({
//       jobs: cleanJobs,
//       pagination: {
//         current: page,
//         pages: Math.ceil(total / limit),
//         total,
//         hasNext: page * limit < total,
//         hasPrev: page > 1
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch jobs', details: error.message });
//   }
// };

// // GET /api/company-jobs/user-jobs (pagination + lazy)
// // const getUserJobs = async (req, res) => {
// //   try {
// //     const companyId = req.user.company._id;

// //     const page = Math.max(parseInt(req.query.page) || 1, 1);
// //     const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
// //     const skip = (page - 1) * limit;

// //     const { status, platform, search, tier, score_min, score_max } = req.query;
// //     const includeStatusHistory = req.query.includeStatusHistory === 'true';
// //     const includeComments = req.query.includeComments === 'true';
// //     const includeCompanyScores = req.query.includeCompanyScores === 'true';

// //     const matchQuery = { companyId };
// //     if (status) matchQuery.currentStatus = status;
// //     if (platform) matchQuery.platform = platform;

// //     const pipeline = [
// //       { $match: matchQuery },
// //       {
// //         $lookup: {
// //           from: 'masterjobs',
// //           localField: 'masterJobId',
// //           foreignField: '_id',
// //           as: 'masterJob'
// //         }
// //       },
// //       { $unwind: '$masterJob' },
// //       ...(search ? [{
// //         $match: {
// //           $or: [
// //             { 'masterJob.title': { $regex: search, $options: 'i' } },
// //             { 'masterJob.description': { $regex: search, $options: 'i' } },
// //             { 'masterJob.companyName': { $regex: search, $options: 'i' } }
// //           ]
// //         }
// //       }] : []),
// //       ...(tier ? [{ $match: { 'masterJob.tier': tier } }] : []),
// //       ...((score_min || score_max) ? [{
// //         $match: {
// //           ...(score_min && { 'masterJob.final_weighted_score': { $gte: parseFloat(score_min) } }),
// //           ...(score_max && { 'masterJob.final_weighted_score': { $lte: parseFloat(score_max) } })
// //         }
// //       }] : []),
// //       { $sort: { distributedAt: -1 } },
// //       {
// //         $facet: {
// //           data: [
// //             { $skip: skip },
// //             { $limit: limit },
// //             {
// //               $project: {
// //                 _id: 1,
// //                 currentStatus: 1,
// //                 distributedAt: 1,
// //                 lastUpdated: 1,
// //                 isBookmarked: 1,
// //                 proposal: 1,
// //                 ...(includeStatusHistory ? { statusHistory: 1 } : { statusHistory: { $slice: ['$statusHistory', -0] } }),
// //                 ...(includeComments ? { comments: 1 } : { comments: { $slice: ['$comments', -0] } }),
// //                 ...(includeCompanyScores ? { companyScore: 1 } : { companyScore: { $slice: ['$companyScore', -0] } }),
// //                 'masterJob.title': 1,
// //                 'masterJob.description': 1,
// //                 'masterJob.platform': 1,
// //                 'masterJob.companyName': 1,
// //                 'masterJob.skills': 1,
// //                 'masterJob.tier': 1,
// //                 'masterJob.final_weighted_score': 1,
// //                 'masterJob.ai_remark': 1,
// //                 'masterJob.linkedinUrl': 1,
// //                 'masterJob.postedDate': 1,
// //                 'masterJob.salary': 1,
// //                 'masterJob.city': 1,
// //                 'masterJob.country': 1
// //               }
// //             }
// //           ],
// //           totalCount: [{ $count: 'count' }]
// //         }
// //       }
// //     ];

// //     const result = await CompanyJob.aggregate(pipeline);
// //     const data = result[0]?.data || [];
// //     const total = (result[0]?.totalCount[0] && result[0].totalCount[0].count) || 0;

// //     res.json({
// //       jobs: data.map(doc => ({
// //         _id: doc._id,
// //         currentStatus: doc.currentStatus,
// //         isBookmarked: doc.isBookmarked,
// //         distributedAt: doc.distributedAt,
// //         lastUpdated: doc.lastUpdated,
// //         proposal: doc.proposal,
// //         ...(includeStatusHistory ? { statusHistory: doc.statusHistory } : {}),
// //         ...(includeComments ? { comments: doc.comments } : {}),
// //         ...(includeCompanyScores ? { companyScore: doc.companyScore } : {}),
// //         masterJob: {
// //           title: doc.masterJob?.title,
// //           description: doc.masterJob?.description,
// //           platform: doc.masterJob?.platform,
// //           companyName: doc.masterJob?.companyName,
// //           skills: doc.masterJob?.skills || [],
// //           tier: doc.masterJob?.tier,
// //           final_weighted_score: doc.masterJob?.final_weighted_score,
// //           ai_remark: doc.masterJob?.ai_remark,
// //           linkedinUrl: doc.masterJob?.linkedinUrl,
// //           postedDate: doc.masterJob?.postedDate,
// //           salary: doc.masterJob?.salary,
// //           city: doc.masterJob?.city,
// //           country: doc.masterJob?.country
// //         }
// //       })),
// //       pagination: {
// //         page,
// //         limit,
// //         total,
// //         pages: Math.ceil(total / limit),
// //         hasNext: page * limit < total,
// //         hasPrev: page > 1
// //       }
// //     });
// //   } catch (error) {
// //     res.status(500).json({ error: 'Failed to fetch user jobs', details: error.message });
// //   }
// // };
// const getUserJobs = async (req, res) => {
//   try {
//     const companyId = req.user.company._id;
    
//     console.log('Getting user jobs for:', req.user.username, 'Company:', companyId);
    
//     // Get company jobs with master job data
//     const jobs = await CompanyJob.find({ companyId })
//       .populate('masterJobId')
//       .sort({ distributedAt: -1 });

//     console.log(`Found ${jobs.length} jobs for company ${companyId}`);

//     // Clean and merge data for user display
//     const cleanJobs = jobs.map(job => {
//       const jobObj = job.toObject();
      
//       // Get master job data
//       if (jobObj.masterJobId) {
//         const masterData = cleanMasterJobData(job.masterJobId);
//         // Merge master data with company-specific data
//         const mergedJob = {
//           ...masterData,
//           // Company-specific fields (these override master data if needed)
//           currentStatus: jobObj.currentStatus,
//           statusHistory: jobObj.statusHistory,
//           comments: jobObj.comments,
//           proposal: jobObj.proposal,
//           companyScore: jobObj.companyScore,
//           isBookmarked: jobObj.isBookmarked,
//           distributedAt: jobObj.distributedAt,
//           lastUpdated: jobObj.lastUpdated,
//           // Keep the company job ID for updates
//           _id: jobObj._id
//         };
//         return mergedJob;
//       }
      
//       return jobObj;
//     });

//     res.json({
//       jobs: cleanJobs,
//       total: cleanJobs.length
//     });

//   } catch (error) {
//     console.error('Get user jobs error:', error);
//     res.status(500).json({ 
//       error: 'Failed to fetch user jobs',
//       details: error.message 
//     });
//   }
// };

// controllers/companyJobController.js

// GET /api/company-jobs  (paginated, complete master job data, filters)
const getCompanyJobs = async (req, res) => {
  try {
    const companyId = req.user.company._id;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 250);
    const skip = (page - 1) * limit;

    const { status, platform, search } = req.query;

    // We need platform/search on master job → use aggregation
    const matchCompany = { companyId };
    if (status) matchCompany.currentStatus = status;

    const pipeline = [
      { $match: matchCompany },
      {
        $lookup: {
          from: 'masterjobs',
          localField: 'masterJobId',
          foreignField: '_id',
          as: 'masterJob'
        }
      },
      { $unwind: '$masterJob' },
      ...(platform ? [{ $match: { 'masterJob.platform': platform } }] : []),
      ...(search ? [{
        $match: {
          $or: [
            { 'masterJob.title': { $regex: search, $options: 'i' } },
            { 'masterJob.description': { $regex: search, $options: 'i' } },
            { 'masterJob.companyName': { $regex: search, $options: 'i' } }
          ]
        }
      }] : []),
      { $sort: { distributedAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              // Keep masterJob as full object; we’ll merge in JS
              $project: {
                _id: 1,
                companyId: 1,
                currentStatus: 1,
                statusHistory: 1,
                comments: 1,
                proposal: 1,
                companyScore: 1,
                isBookmarked: 1,
                distributedAt: 1,
                lastUpdated: 1,
                masterJob: 1
              }
            }
          ],
          totalCount: [{ $count: 'count' }]
        }
      }
    ];

    const result = await CompanyJob.aggregate(pipeline);
    const rows = result[0]?.data || [];
    const total = (result[0]?.totalCount[0] && result[0].totalCount[0].count) || 0;

    // Merge full master job data like your old controller
    const merged = rows.map(doc => ({
      ...doc.masterJob,               // complete master job fields
      // Company-specific overrides
      _id: doc._id,                   // keep company job _id for updates
      companyId: doc.companyId,
      currentStatus: doc.currentStatus,
      statusHistory: doc.statusHistory,
      comments: doc.comments,
      proposal: doc.proposal,
      companyScore: doc.companyScore,
      isBookmarked: doc.isBookmarked,
      distributedAt: doc.distributedAt,
      lastUpdated: doc.lastUpdated
    }));

    res.json({
      jobs: merged,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs', details: error.message });
  }
};

// GET /api/company-jobs/user-jobs (paginated + lazy, COMPLETE master job data)
const getUserJobs = async (req, res) => {
  try {
    const companyId = req.user.company._id;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 250);
    const skip = (page - 1) * limit;

    const { status, platform, search, tier, score_min, score_max } = req.query;
    const includeStatusHistory = req.query.includeStatusHistory === 'true';
    const includeComments = req.query.includeComments === 'true';
    const includeCompanyScores = req.query.includeCompanyScores === 'true';

    const matchQuery = { companyId };
    if (status) matchQuery.currentStatus = status;

    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'masterjobs',
          localField: 'masterJobId',
          foreignField: '_id',
          as: 'masterJob'
        }
      },
      { $unwind: '$masterJob' },
      ...(platform ? [{ $match: { 'masterJob.platform': platform } }] : []),
      ...(search ? [{
        $match: {
          $or: [
            { 'masterJob.title': { $regex: search, $options: 'i' } },
            { 'masterJob.description': { $regex: search, $options: 'i' } },
            { 'masterJob.companyName': { $regex: search, $options: 'i' } }
          ]
        }
      }] : []),
      ...(tier ? [{ $match: { 'masterJob.tier': tier } }] : []),
      ...((score_min || score_max) ? [{
        $match: {
          ...(score_min && { 'masterJob.final_weighted_score': { $gte: parseFloat(score_min) } }),
          ...(score_max && { 'masterJob.final_weighted_score': { $lte: parseFloat(score_max) } })
        }
      }] : []),
      { $sort: { distributedAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              // Don’t trim masterJob; keep full doc
              $project: {
                _id: 1,
                companyId: 1,
                currentStatus: 1,
                distributedAt: 1,
                lastUpdated: 1,
                isBookmarked: 1,
                proposal: 1,
                statusHistory: includeStatusHistory ? 1 : { $slice: ['$statusHistory', -0] },
                comments: includeComments ? 1 : { $slice: ['$comments', -0] },
                companyScore: includeCompanyScores ? 1 : { $slice: ['$companyScore', -0] },
                masterJob: 1
              }
            }
          ],
          totalCount: [{ $count: 'count' }]
        }
      }
    ];

    const result = await CompanyJob.aggregate(pipeline);
    const data = result[0]?.data || [];
    const total = (result[0]?.totalCount[0] && result[0].totalCount[0].count) || 0;

    // Merge full master job data (complete)
    const merged = data.map(doc => ({
      ...doc.masterJob,               // complete master job fields
      // Company-specific overrides
      _id: doc._id,
      companyId: doc.companyId,
      currentStatus: doc.currentStatus,
      ...(includeStatusHistory ? { statusHistory: doc.statusHistory } : {}),
      ...(includeComments ? { comments: doc.comments } : {}),
      ...(includeCompanyScores ? { companyScore: doc.companyScore } : {}),
      proposal: doc.proposal,
      isBookmarked: doc.isBookmarked,
      distributedAt: doc.distributedAt,
      lastUpdated: doc.lastUpdated
    }));

    res.json({
      jobs: merged,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user jobs', details: error.message });
  }
};
// GET /api/company-jobs/:jobId
// const getJobDetails = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const companyId = req.user.company._id;

//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ error: 'Invalid job ID format' });
//     }

//     const job = await CompanyJob.findOne({ _id: jobId, companyId }).populate('masterJobId');
//     if (!job) return res.status(404).json({ error: 'Job not found' });

//     const completeJobData = {
//       // _id: job._id,
//       // companyId: job.companyId,
//       // currentStatus: job.currentStatus,
//       // statusHistory: job.statusHistory,
//       // comments: job.comments,
//       // proposal: job.proposal,
//       // companyScore: job.companyScore,
//       // isBookmarked: job.isBookmarked,
//       // distributedAt: job.distributedAt,
//       // lastUpdated: job.lastUpdated,
//       _id: job._id,
//       companyId: job.companyId,
//       currentStatus: job.currentStatus,
//       statusHistory: job.statusHistory,
//       comments: job.comments,
//       proposal: job.proposal,
//       companyScore: job.companyScore,
//       ae_comment: job.ae_comment,
//       ae_pitched: job.ae_pitched,
//       estimated_budget: job.estimated_budget,
//       ...job.masterJobId.toObject(),
//       currentStatus: job.currentStatus,
//       statusHistory: job.statusHistory,
//       comments: job.comments,
//       proposal: job.proposal
//     };

//     res.json({ job: completeJobData });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to get job details', details: error.message });
//   }
// };
const getJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    const companyId = req.user.company._id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    // Fetch without any field restrictions
    const job = await CompanyJob.findOne({ 
      _id: jobId, 
      companyId 
    }).populate('masterJobId').lean(); // Use .lean() for better performance

    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Separate the masterJob data
    const masterJobData = { ...job.masterJobId };
    delete job.masterJobId; // Remove nested reference

    // Merge with company job taking precedence
    const completeJobData = {
      ...masterJobData,
      ...job // This should include ae_comment, ae_pitched, estimated_budget
    };

    res.json({ job: completeJobData });
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ error: 'Failed to get job details', details: error.message });
  }
};

// PUT /api/company-jobs/:jobId/status
const updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, comment } = req.body;
    const companyId = req.user.company._id;
    const username = req.user.username;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    const job = await CompanyJob.findOne({ _id: jobId, companyId });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    job.currentStatus = status;
    job.lastUpdated = new Date();
    job.statusHistory.push({
      status,
      username,
      changedBy: req.user._id,
      date: new Date(),
      notes: comment || `Status changed to ${status.replace('_', ' ')}`,
      type: 'status_change'
    });

    await job.save();
    res.json({ message: 'Job status updated successfully', job });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update job status', details: error.message });
  }
};

// POST /api/company-jobs/:jobId/comments
const addJobComment = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { comment, username } = req.body;
    const companyId = req.user.company._id;
    const currentUsername = req.user.username;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    const job = await CompanyJob.findOne({ _id: jobId, companyId });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    job.comments.push({
      comment,
      username: username || currentUsername,
      date: new Date()
    });

    job.lastUpdated = new Date();
    await job.save();

    res.json({ message: 'Comment added successfully', job });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment', details: error.message });
  }
};

// PUT /api/company-jobs/:jobId/proposal
const updateJobProposal = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { proposal } = req.body;
    const companyId = req.user.company._id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    const job = await CompanyJob.findOne({ _id: jobId, companyId });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    job.proposal = proposal;
    job.lastUpdated = new Date();
    await job.save();

    res.json({ message: 'Proposal updated successfully', job });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update proposal', details: error.message });
  }
};

// POST /api/company-jobs/:jobId/rate
const rateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { score, comment } = req.body;
    const companyId = req.user.company._id;
    const username = req.user.username;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    const job = await CompanyJob.findOne({ _id: jobId, companyId });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    job.companyScore.push({
      score,
      comment,
      username,
      date: new Date()
    });

    job.lastUpdated = new Date();
    await job.save();

    res.json({ message: 'Job rated successfully', job });
  } catch (error) {
    res.status(500).json({ error: 'Failed to rate job', details: error.message });
  }
};

// // POST /api/company-jobs/:jobId/ae-score
// const addAeScore = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { ae_score, username } = req.body;
//     const companyId = req.user.company._id;

//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ error: 'Invalid job ID format' });
//     }
//     if (ae_score === undefined || !username) {
//       return res.status(400).json({ error: 'AE score and username are required' });
//     }

//     const job = await CompanyJob.findOne({ _id: jobId, companyId }).populate('masterJobId');
//     if (!job) return res.status(404).json({ error: 'Job not found' });

//     const masterJob = job.masterJobId;
//     if (!masterJob.ae_score) masterJob.ae_score = [];
//     if (!Array.isArray(masterJob.ae_score)) masterJob.ae_score = [];
//     masterJob.ae_score.push({ value: ae_score, username, date: new Date() });
//     await masterJob.save();

//     job.lastUpdated = new Date();
//     await job.save();

//     res.json({
//       message: 'AE score added successfully',
//       ae_score: masterJob.ae_score,
//       job: {
//         ...job.toObject(),
//         ...masterJob.toObject(),
//         _id: job._id,
//         currentStatus: job.currentStatus,
//         statusHistory: job.statusHistory,
//         comments: job.comments,
//         proposal: job.proposal
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to add AE score', details: error.message });
//   }
// };

// // PUT /api/company-jobs/:jobId/ae-pitched
// const updateAePitched = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { ae_pitched } = req.body;
//     const companyId = req.user.company._id;

//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ error: 'Invalid job ID format' });
//     }

//     const job = await CompanyJob.findOne({ _id: jobId, companyId }).populate('masterJobId');
//     if (!job) return res.status(404).json({ error: 'Job not found' });

//     const masterJob = job.masterJobId;
//     masterJob.ae_pitched = ae_pitched;
//     await masterJob.save();

//     job.lastUpdated = new Date();
//     await job.save();

//     res.json({
//       message: 'AE pitched status updated successfully',
//       ae_pitched: masterJob.ae_pitched,
//       job: {
//         ...job.toObject(),
//         ...masterJob.toObject(),
//         _id: job._id,
//         currentStatus: job.currentStatus,
//         statusHistory: job.statusHistory,
//         comments: job.comments,
//         proposal: job.proposal
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to update AE pitched status', details: error.message });
//   }
// };

// // PUT /api/company-jobs/:jobId/ae-remark
// const updateAeRemark = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { ae_comment } = req.body;
//     const companyId = req.user.company._id;

//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ error: 'Invalid job ID format' });
//     }

//     const job = await CompanyJob.findOne({ _id: jobId, companyId }).populate('masterJobId');
//     if (!job) return res.status(404).json({ error: 'Job not found' });

//     const masterJob = job.masterJobId;
//     masterJob.ae_comment = ae_comment;
//     await masterJob.save();

//     job.lastUpdated = new Date();
//     await job.save();

//     res.json({
//       message: 'AE remark updated successfully',
//       ae_comment: masterJob.ae_comment,
//       job: {
//         ...job.toObject(),
//         ...masterJob.toObject(),
//         _id: job._id,
//         currentStatus: job.currentStatus,
//         statusHistory: job.statusHistory,
//         comments: job.comments,
//         proposal: job.proposal
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to update AE remark', details: error.message });
//   }
// };

// // PUT /api/company-jobs/:jobId/estimated-budget
// const updateEstimatedBudget = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { estimated_budget } = req.body;
//     const companyId = req.user.company._id;

//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ error: 'Invalid job ID format' });
//     }
//     if (estimated_budget === undefined) {
//       return res.status(400).json({ error: 'Estimated budget is required' });
//     }

//     const job = await CompanyJob.findOne({ _id: jobId, companyId }).populate('masterJobId');
//     if (!job) return res.status(404).json({ error: 'Job not found' });

//     const masterJob = job.masterJobId;
//     masterJob.estimated_budget = estimated_budget;
//     await masterJob.save();

//     job.lastUpdated = new Date();
//     await job.save();

//     res.json({
//       message: 'Estimated budget updated successfully',
//       estimated_budget: masterJob.estimated_budget,
//       job: {
//         ...job.toObject(),
//         ...masterJob.toObject(),
//         _id: job._id,
//         currentStatus: job.currentStatus,
//         statusHistory: job.statusHistory,
//         comments: job.comments,
//         proposal: job.proposal
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to update estimated budget', details: error.message });
//   }
// };

// AE: add score to CompanyJob.companyScore (NOT MasterJob)
const addAeScore = async (req, res) => {
  try {
    const { jobId } = req.params; // CompanyJob _id
    const { ae_score, username } = req.body;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }
    const updated = await CompanyJob.findByIdAndUpdate(
      jobId,
      { $push: { companyScore: { ae_score, username, date: new Date() } }, $set: { lastUpdated: new Date() } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Company job not found' });
    return res.json({ success: true, job: updated });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to update AE score', error: e.message });
  }
};

// AE: pitched flag/value (CompanyJob)
const updateAePitched = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { ae_pitched } = req.body;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }
    const updated = await CompanyJob.findByIdAndUpdate(
      jobId,
      { $set: { ae_pitched, lastUpdated: new Date() } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Company job not found' });
    return res.json({ success: true, job: updated });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to update AE pitched', error: e.message });
  }
};

// AE: remark (CompanyJob)
const updateAeRemark = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { ae_comment } = req.body;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }
    const updated = await CompanyJob.findByIdAndUpdate(
      jobId,
      { $set: { ae_comment, lastUpdated: new Date() } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Company job not found' });
    return res.json({ success: true, job: updated });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to update AE remark', error: e.message });
  }
};

// AE: estimated budget (CompanyJob)
const updateEstimatedBudget = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { estimated_budget } = req.body;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }
    const updated = await CompanyJob.findByIdAndUpdate(
      jobId,
      { $set: { estimated_budget, lastUpdated: new Date() } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Company job not found' });
    return res.json({ success: true, job: updated });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to update estimated budget', error: e.message });
  }
};
// POST /api/company-jobs/:jobId/generate-proposal
const generateProposal = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { selectedCategory, isProduct } = req.body;
    const companyId = req.user.company._id;
    const username = req.user.username;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    const job = await CompanyJob.findOne({ _id: jobId, companyId }).populate('masterJobId');
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const completeJobData = {
      ...job.masterJobId.toObject(),
      _id: job._id,
      currentStatus: job.currentStatus,
      statusHistory: job.statusHistory,
      comments: job.comments,
      proposal: job.proposal
    };

    const jobDataString = JSON.stringify(completeJobData);
    const scriptPath = path.join(__dirname, '../python/proposal_generator.py');
    const platformType = job.masterJobId.platform || 'linkedin';

    const args = [
      scriptPath,
      '--type', platformType,
      '--job', jobDataString,
      '--category', selectedCategory
    ];
    if (isProduct) args.push('--is_product');

    const py = spawn('python', args);
    let stdout = '';
    let stderr = '';

    py.stdout.on('data', (data) => { stdout += data.toString(); });
    py.stderr.on('data', (data) => { stderr += data.toString(); });

    py.on('close', async (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          const proposal = result.proposal;
          job.proposal = proposal;
          job.lastUpdated = new Date();
          await job.save();

          res.json({ message: 'Proposal generated successfully', proposal, job: completeJobData });
        } catch (err) {
          res.status(500).json({ message: 'Error parsing proposal output.' });
        }
      } else {
        res.status(500).json({ message: 'Proposal generation failed.', error: stderr });
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// PATCH /api/company-jobs/:jobId/proposal (already have updateJobProposal, but keep patch too if needed)
const patchProposal = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { proposal } = req.body;
    const companyId = req.user.company._id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }
    if (!proposal || !proposal.trim()) {
      return res.status(400).json({ error: 'Proposal text is required' });
    }

    const job = await CompanyJob.findOne({ _id: jobId, companyId }).populate('masterJobId');
    if (!job) return res.status(404).json({ error: 'Job not found' });

    job.proposal = proposal.trim();
    job.lastUpdated = new Date();
    await job.save();

    res.json({
      message: 'Proposal updated successfully',
      proposal: job.proposal,
      job: {
        ...job.toObject(),
        ...job.masterJobId.toObject(),
        _id: job._id,
        currentStatus: job.currentStatus,
        statusHistory: job.statusHistory,
        comments: job.comments,
        proposal: job.proposal
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update proposal', details: error.message });
  }
};

// GET /api/company-jobs/stats/overview
const getStatsOverview = async (req, res) => {
  try {
    const companyFilter = (req.user.role === 'company_admin')
      ? { companyId: req.user.company._id }
      : {};

    const userStatuses = await CompanyJob.aggregate([
      { $match: companyFilter },
      { $unwind: { path: '$statusHistory', preserveNullAndEmptyArrays: true } },
      { $group: { _id: { username: '$statusHistory.username', status: '$statusHistory.status' }, count: { $sum: 1 } } },
      { $group: { _id: '$_id.username', statuses: { $push: { status: '$_id.status', count: '$count' } } } },
      { $project: { username: '$_id', statuses: { $arrayToObject: { $map: { input: '$statuses', as: 's', in: { k: '$$s.status', v: '$$s.count' } } } } } }
    ]);

    const dailyTotals = await CompanyJob.aggregate([
      { $match: companyFilter },
      { $unwind: { path: '$statusHistory', preserveNullAndEmptyArrays: true } },
      { $group: { _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$statusHistory.date' } }, status: '$statusHistory.status' }, count: { $sum: 1 } } },
      { $group: { _id: '$_id.date', statuses: { $push: { status: '$_id.status', count: '$count' } }, total_engagement: { $sum: '$count' } } },
      { $project: { date: '$_id', total_engagement: 1, statuses: { $arrayToObject: { $map: { input: '$statuses', as: 's', in: { k: '$$s.status', v: '$$s.count' } } } } } }
    ]);

    const formattedDailyTotals = dailyTotals.map(d => ({
      date: d.date,
      total_engagement: d.total_engagement,
      not_engaged: d.statuses.not_engaged || 0,
      applied: d.statuses.applied || 0,
      engaged: d.statuses.engaged || 0,
      interview: d.statuses.interview || 0,
      offer: d.statuses.offer || 0,
      rejected: d.statuses.rejected || 0,
      onboard: d.statuses.onboard || 0
    }));

    const grandTotal = await CompanyJob.aggregate([
      { $match: companyFilter },
      { $unwind: { path: '$statusHistory', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$statusHistory.status', count: { $sum: 1 } } }
    ]);

    const grandTotalObj = {
      total_engagement: grandTotal.reduce((s, x) => s + x.count, 0),
      not_engaged: grandTotal.find(x => x._id === 'not_engaged')?.count || 0,
      applied: grandTotal.find(x => x._id === 'applied')?.count || 0,
      engaged: grandTotal.find(x => x._id === 'engaged')?.count || 0,
      interview: grandTotal.find(x => x._id === 'interview')?.count || 0,
      offer: grandTotal.find(x => x._id === 'offer')?.count || 0,
      rejected: grandTotal.find(x => x._id === 'rejected')?.count || 0,
      onboard: grandTotal.find(x => x._id === 'onboard')?.count || 0
    };

    res.json({ users: userStatuses || [], dailyTotals: formattedDailyTotals || [], grandTotal: grandTotalObj });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get statistics', details: error.message });
  }
};

// GET /api/company-jobs/stats/all-companies (super_admin)
const getAllCompaniesStats = async (req, res) => {
  try {
    const allCompaniesStats = await CompanyJob.aggregate([
      { $group: { _id: '$companyId', totalJobs: { $sum: 1 }, statusBreakdown: { $push: { status: '$currentStatus', count: { $sum: 1 } } } } }
    ]);

    const allUsers = await User.aggregate([
      { $group: { _id: '$companyId', totalUsers: { $sum: 1 }, users: { $push: { username: '$username', email: '$email' } } } }
    ]);

    const userActivityStats = await CompanyJob.aggregate([
      { $unwind: { path: '$statusHistory', preserveNullAndEmptyArrays: true } },
      { $group: { _id: { companyId: '$companyId', username: '$statusHistory.username', status: '$statusHistory.status' }, statusChanges: { $sum: 1 }, lastActivity: { $max: '$statusHistory.date' } } },
      { $group: { _id: '$_id.companyId', userActivity: { $push: { username: '$_id.username', status: '$_id.status', statusChanges: '$statusChanges', lastActivity: '$lastActivity' } } } }
    ]);

    const combinedData = allCompaniesStats.map(companyStat => {
      const userData = allUsers.find(u => u._id && u._id.toString() === companyStat._id.toString());
      const userActivity = userActivityStats.find(a => a._id && a._id.toString() === companyStat._id.toString());
      return {
        companyId: companyStat._id,
        totalJobs: companyStat.totalJobs,
        statusBreakdown: companyStat.statusBreakdown.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + item.count;
          return acc;
        }, {}),
        totalUsers: userData ? userData.totalUsers : 0,
        users: userData ? userData.users : [],
        userActivity: userActivity ? userActivity.userActivity : []
      };
    });

    res.json({ companies: combinedData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all companies statistics', details: error.message });
  }
};

const getCompanyUserPerformance= async (req, res) => {
  try {
    const { companyId } = req.params;
    if (req.user.role === 'company_admin' && req.user.company._id.toString() !== companyId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ error: 'Invalid company ID' });
    }
    const companyObjId = new mongoose.Types.ObjectId(companyId);
    const [statusAgg, commentsAgg, ratingsAgg] = await Promise.all([
      CompanyJob.aggregate([
        { $match: { companyId: companyObjId } },
        { $unwind: '$statusHistory' },
        { $match: { 'statusHistory.username': { $ne: null } } },
        { $group: { _id: '$statusHistory.username', statusChanges: { $sum: 1 }, lastActivity: { $max: '$statusHistory.date' } } }
      ]),
      CompanyJob.aggregate([
        { $match: { companyId: companyObjId } },
        { $unwind: '$comments' },
        { $match: { 'comments.username': { $ne: null } } },
        { $group: { _id: '$comments.username', comments: { $sum: 1 }, lastCommentAt: { $max: '$comments.date' } } }
      ]),
      CompanyJob.aggregate([
        { $match: { companyId: companyObjId } },
        { $unwind: '$companyScore' },
        { $match: { 'companyScore.username': { $ne: null } } },
        { $group: { _id: '$companyScore.username', ratings: { $sum: 1 }, lastRatedAt: { $max: '$companyScore.date' } } }
      ])
    ]);

    const map = {};
    for (const s of statusAgg) map[s._id] = { username: s._id, statusChanges: s.statusChanges || 0, lastActivity: s.lastActivity || null, comments: 0, ratings: 0 };
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

    res.json({ companyId, users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user performance', details: error.message });
  }
}

// Get company-wide job statistics (NEW)
const getCompanyWideStats = async (req, res) => {
  try {
    const companyId = req.user.company._id;
    console.log('Getting company stats for companyId:', companyId);

    const stats = await CompanyJob.aggregate([
      // Filter for jobs belonging to the admin's company
      { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
      // Group by the current status and count them
      {
        $group: {
          _id: '$currentStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('Aggregation results:', stats);

    // Format the stats into a more usable object
    const formattedStats = {
      total: 0,
      not_engaged: 0,
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    };

    stats.forEach(stat => {
      if (formattedStats.hasOwnProperty(stat._id)) {
        formattedStats[stat._id] = stat.count;
      }
      formattedStats.total += stat.count;
    });

    console.log('Formatted stats:', formattedStats);
    res.json(formattedStats);

  } catch (error) {
    console.error('Error fetching company-wide job stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch company job statistics', 
      details: error.message 
    });
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
  addAeScore,             // POST /:jobId/ae-score
  updateAePitched,        // PUT /:jobId/ae-pitched
  updateAeRemark,         // PUT /:jobId/ae-remark
  updateEstimatedBudget,  // PUT /:jobId/estimated-budget
  generateProposal,       // POST /:jobId/generate-proposal
  patchProposal,          // PATCH /:jobId/proposal
  getStatsOverview,       // GET /stats/overview
  getCompanyWideStats,    // GET /company-stats
  getAllCompaniesStats,   // GET /stats/all-companies
  getCompanyUserPerformance
};