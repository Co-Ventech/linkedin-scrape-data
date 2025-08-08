const CompanyJob = require('../models/CompanyJob');
const MasterJob = require('../models/MasterJob');
const Company = require('../models/Company');
const mongoose = require('mongoose');

// Get company jobs with filters
const getCompanyJobs = async (req, res) => {
  try {
    const companyId = req.user.company._id;
    const {
      status,
      platform,
      search,
      page = 1,
      limit = 20,
      sortBy = 'distributedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { companyId };
    
    if (status && status !== '') {
      query.currentStatus = status;
    }
    
    if (platform && platform !== '') {
      query.platform = platform;
    }
    
    if (search && search !== '') {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { companyName: new RegExp(search, 'i') }
      ];
    }

    // Get jobs with pagination
    const jobs = await CompanyJob.find(query)
      .populate('masterJobId')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await CompanyJob.countDocuments(query);

    // Format jobs for frontend
    const formattedJobs = jobs.map(job => ({
      _id: job._id,
      jobId: job.jobId,
      platform: job.platform,
      title: job.title,
      companyName: job.companyName,
      location: job.location,
      currentStatus: job.currentStatus,
      postedDate: job.postedDate,
      distributedAt: job.distributedAt,
      statusHistory: job.statusHistory || [],
      comments: job.comments || [],
      proposal: job.proposal || '',
      masterJob: job.masterJobId // Full master job details if needed
    }));

    res.json({
      jobs: formattedJobs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get company jobs error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch company jobs', 
      details: error.message 
    });
  }
};

// Get job details with full master job data
const getJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    const companyId = req.user.company._id;

    const job = await CompanyJob.findOne({
      _id: jobId,
      companyId
    }).populate('masterJobId');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      job,
      masterJobDetails: job.masterJobId
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch job details', 
      details: error.message 
    });
  }
};

// Update job status with history tracking
const updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, notes } = req.body;
    const companyId = req.user.company._id;
    const userId = req.user._id;
    const username = req.user.username;

    const job = await CompanyJob.findOne({
      _id: jobId,
      companyId
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Update status and add to history
    const oldStatus = job.currentStatus;
    job.currentStatus = status;
    
    job.statusHistory.push({
      status,
      changedBy: userId,
      username,
      date: new Date(),
      notes: notes || ''
    });

    job.lastUpdated = new Date();
    await job.save();

    res.json({
      message: 'Job status updated successfully',
      job: {
        _id: job._id,
        currentStatus: job.currentStatus,
        statusHistory: job.statusHistory
      },
      oldStatus,
      newStatus: status
    });

  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({ 
      error: 'Failed to update job status', 
      details: error.message 
    });
  }
};

// Add job comment
const addJobComment = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { comment, isPrivate = false } = req.body;
    const companyId = req.user.company._id;
    const userId = req.user._id;
    const username = req.user.username;

    const job = await CompanyJob.findOne({
      _id: jobId,
      companyId
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    job.comments.push({
      author: userId,
      username,
      comment,
      isPrivate,
      date: new Date()
    });

    job.lastUpdated = new Date();
    await job.save();

    res.json({
      message: 'Comment added successfully',
      comment: job.comments[job.comments.length - 1]
    });

  } catch (error) {
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

    const job = await CompanyJob.findOneAndUpdate(
      { _id: jobId, companyId },
      { 
        proposal,
        lastUpdated: new Date()
      },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      message: 'Proposal updated successfully',
      proposal: job.proposal
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to update proposal', 
      details: error.message 
    });
  }
};

// Get company job statistics
// const getCompanyJobStats = async (req, res) => {
//   try {
//     const companyId = req.user.company._id;

//     // Get overall job stats
//     const totalJobs = await CompanyJob.countDocuments({ companyId });
    
//     // Get status breakdown
//     const statusStats = await CompanyJob.aggregate([
//       { $match: { companyId: mongoose.Types.ObjectId(companyId) } },
//       {
//         $group: {
//           _id: '$currentStatus',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // Get platform breakdown
//     const platformStats = await CompanyJob.aggregate([
//       { $match: { companyId: mongoose.Types.ObjectId(companyId) } },
//       {
//         $group: {
//           _id: '$platform',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // Get user activity stats
//     const userActivityStats = await CompanyJob.aggregate([
//       { $match: { companyId: mongoose.Types.ObjectId(companyId) } },
//       { $unwind: '$statusHistory' },
//       {
//         $group: {
//           _id: {
//             userId: '$statusHistory.changedBy',
//             username: '$statusHistory.username'
//           },
//           statusChanges: { $sum: 1 },
//           lastActivity: { $max: '$statusHistory.date' }
//         }
//       },
//       {
//         $project: {
//           userId: '$_id.userId',
//           username: '$_id.username',
//           statusChanges: 1,
//           lastActivity: 1,
//           _id: 0
//         }
//       },
//       { $sort: { statusChanges: -1 } }
//     ]);

//     // Get recent activity (last 30 days)
//     const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
//     const recentActivity = await CompanyJob.aggregate([
//       { $match: { companyId: mongoose.Types.ObjectId(companyId) } },
//       { $unwind: '$statusHistory' },
//       { $match: { 'statusHistory.date': { $gte: thirtyDaysAgo } } },
//       {
//         $group: {
//           _id: {
//             date: { $dateToString: { format: '%Y-%m-%d', date: '$statusHistory.date' } }
//           },
//           activities: { $sum: 1 }
//         }
//       },
//       { $sort: { '_id.date': 1 } }
//     ]);

//     res.json({
//       totalJobs,
//       statusBreakdown: statusStats.reduce((acc, stat) => {
//         acc[stat._id] = stat.count;
//         return acc;
//       }, {}),
//       platformBreakdown: platformStats.reduce((acc, stat) => {
//         acc[stat._id] = stat.count;
//         return acc;
//       }, {}),
//       userActivity: userActivityStats,
//       recentActivity: recentActivity.map(item => ({
//         date: item._id.date,
//         activities: item.activities
//       }))
//     });

//   } catch (error) {
//     console.error('Get company job stats error:', error);
//     res.status(500).json({ 
//       error: 'Failed to fetch company job statistics', 
//       details: error.message 
//     });
//   }
// };
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
const getCompanyJobStats = async (req, res) => {
  try {
    console.log('Getting company job stats for user:', req.user.role);
    
    let companyFilter = {};
    
    if (req.user.role === 'company_admin') {
      const companyId = req.user.company?._id || req.user.company;
      const companyObjId = toObjectId(companyId);
      
      if (companyObjId) {
        companyFilter.companyId = companyObjId; // ✅ Use the converted ObjectId
      }
    }

    console.log('Company filter:', companyFilter);

    // Get status breakdown
    const statusBreakdown = await CompanyJob.aggregate([
      { $match: companyFilter },
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
      statusBreakdownObj[item._id || 'unknown'] = item.count;
    });

    // Get user activity stats
    const userActivity = await CompanyJob.aggregate([
      { $match: companyFilter },
      { $unwind: { path: '$statusHistory', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$statusHistory.username',
          statusChanges: { $sum: 1 },
          lastActivity: { $max: '$statusHistory.date' }
        }
      },
      {
        $project: {
          userId: '$_id',
          username: '$_id',
          statusChanges: 1,
          lastActivity: 1
        }
      }
    ]);

    console.log('Stats result:', { statusBreakdownObj, userActivity });

    res.json({
      statusBreakdown: statusBreakdownObj,
      userActivity: userActivity || []
    });

  } catch (error) {
    console.error('Get company job stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get statistics', 
      details: error.message 
    });
  }
};

module.exports = {
  getCompanyJobs,
  getJobDetails,
  updateJobStatus,
    addJobComment,
  updateJobProposal,
  getCompanyJobStats
};
