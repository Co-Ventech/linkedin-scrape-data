
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
    
    console.log('Getting user jobs for:', req.user.username, 'Company:', companyId);
    
    // Get company jobs with master job data
    const jobs = await CompanyJob.find({ companyId })
      .populate('masterJobId')
      .sort({ distributedAt: -1 });

    console.log(`Found ${jobs.length} jobs for company ${companyId}`);

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
      error: 'Failed to fetch user jobs',
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
      changedBy: req.user._id,
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

// ✅ Get company-wide job statistics (NEW)
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

// Get company job statistics (existing)
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
  getCompanyWideStats, // ✅ Add this export
  getCompanyUserPerformance
};
