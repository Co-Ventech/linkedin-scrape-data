

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
const { spawn } = require('child_process');
const router = express.Router();
const path = require('path');
// ✅ SPECIFIC ROUTES FIRST (before any parameter routes)

// Get user jobs for dashboard (company_user role) - uses controller function
router.get('/user-jobs', authenticateToken, requireRole(['company_user']), getUserJobs);

// ✅ Get company-wide job statistics for all users (company_admin only) - uses controller function
router.get('/company-stats', authenticateToken, requireRole(['company_admin']), getCompanyWideStats);


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

// Get company jobs (with filtering and pagination) - both roles
router.get('/', authenticateToken, requireRole(['company_admin', 'company_user']), getCompanyJobs);

// ✅ PARAMETER ROUTES COME LAST

// Get single job details
router.get('/:jobId', authenticateToken, requireRole(['company_admin', 'company_user']), getJobDetails);

// Update job status
// router.put('/:jobId/status', authenticateToken, requireRole(['company_user', 'company_admin']), updateJobStatus);
// Update job status with complete job details response
router.put('/:jobId/status', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
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
    }).populate('masterJobId'); // Populate master job data

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

    // Prepare complete response with master job data
    const completeJobData = {
      // Company job fields
      _id: job._id,
      companyId: job.companyId,
      currentStatus: job.currentStatus,
      statusHistory: job.statusHistory,
      comments: job.comments,
      proposal: job.proposal,
      companyScore: job.companyScore,
      isBookmarked: job.isBookmarked,
      distributedAt: job.distributedAt,
      lastUpdated: job.lastUpdated,
      
      // Master job data (complete job details)
      ...job.masterJobId.toObject(),
      
      // Override with company-specific data where applicable
      currentStatus: job.currentStatus,
      statusHistory: job.statusHistory,
      comments: job.comments,
      proposal: job.proposal
    };

    res.json({
      message: 'Job status updated successfully',
      job: completeJobData
    });

  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({ 
      error: 'Failed to update job status',
      details: error.message 
    });
  }
});

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

// // AE Score API
// router.post('/:jobId/ae-score', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
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

//     const job = await CompanyJob.findOne({
//       _id: jobId,
//       companyId
//     }).populate('masterJobId');

//     if (!job) {
//       return res.status(404).json({ error: 'Job not found' });
//     }

//     // Add AE score to master job
//     if (!Array.isArray(job.masterJobId.ae_score)) {
//       job.masterJobId.ae_score = [];
//     }

//     job.masterJobId.ae_score.push({
//       value: ae_score,
//       username,
//       date: new Date()
//     });

//     await job.masterJobId.save();
//     job.lastUpdated = new Date();
//     await job.save();

//     res.json({
//       message: 'AE score added successfully',
//       ae_score: job.masterJobId.ae_score
//     });

//   } catch (error) {
//     console.error('Add AE score error:', error);
//     res.status(500).json({ 
//       error: 'Failed to add AE score',
//       details: error.message 
//     });
//   }
// });

// // AE Pitched API
// router.put('/:jobId/ae-pitched', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { ae_pitched } = req.body;
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

//     // Update AE pitched status in master job
//     job.masterJobId.ae_pitched = ae_pitched;
//     await job.masterJobId.save();
    
//     job.lastUpdated = new Date();
//     await job.save();

//     res.json({
//       message: 'AE pitched status updated successfully',
//       ae_pitched: job.masterJobId.ae_pitched
//     });

//   } catch (error) {
//     console.error('Update AE pitched error:', error);
//     res.status(500).json({ 
//       error: 'Failed to update AE pitched status',
//       details: error.message 
//     });
//   }
// });

// // AE Remark API
// router.put('/:jobId/ae-remark', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { ae_comment } = req.body;
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

//     // Update AE comment/remark in master job
//     job.masterJobId.ae_comment = ae_comment;
//     await job.masterJobId.save();
    
//     job.lastUpdated = new Date();
//     await job.save();

//     res.json({
//       message: 'AE remark updated successfully',
//       ae_comment: job.masterJobId.ae_comment
//     });

//   } catch (error) {
//     console.error('Update AE remark error:', error);
//     res.status(500).json({ 
//       error: 'Failed to update AE remark',
//       details: error.message 
//     });
//   }
// });

// // Estimated Budget API
// router.put('/:jobId/estimated-budget', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
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

//     const job = await CompanyJob.findOne({
//       _id: jobId,
//       companyId
//     }).populate('masterJobId');

//     if (!job) {
//       return res.status(404).json({ error: 'Job not found' });
//     }

//     // Update estimated budget in master job
//     job.masterJobId.estimated_budget = estimated_budget;
//     await job.masterJobId.save();
    
//     job.lastUpdated = new Date();
//     await job.save();

//     res.json({
//       message: 'Estimated budget updated successfully',
//       estimated_budget: job.masterJobId.estimated_budget
//     });

//   } catch (error) {
//     console.error('Update estimated budget error:', error);
//     res.status(500).json({ 
//       error: 'Failed to update estimated budget',
//       details: error.message 
//     });
//   }
// });

// // Generate Proposal API (Enhanced from older implementation)
// router.post('/:jobId/generate-proposal', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { selectedCategory, isProduct } = req.body;
//     const companyId = req.user.company._id;
//     const username = req.user.username;

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

//     console.log('--- Proposal Generation Started ---');
//     console.log('User:', username, 'Job ID:', jobId, 'Category:', selectedCategory, 'isProduct:', isProduct);

//     // Prepare job data for proposal generation (combining master job + company job data)
//     const jobData = {
//       ...job.masterJobId.toObject(),
//       // Company-specific overrides
//       currentStatus: job.currentStatus,
//       statusHistory: job.statusHistory,
//       comments: job.comments
//     };

//     // Prepare arguments for Python script
//     const jobDataString = JSON.stringify(jobData);
//     const scriptPath = path.join(__dirname, '../python/proposal_generator.py');
    
//     // Determine platform type from master job
//     const platformType = job.masterJobId.platform || 'linkedin'; // Default to linkedin
    
//     const args = [
//       scriptPath,
//       '--type', platformType,
//       '--job', jobDataString,
//       '--category', selectedCategory,
//     ];
    
//     if (isProduct) args.push('--is_product');

//     console.log('Spawning Python process...');
//     const py = spawn('python', args);

//     let stdout = '';
//     let stderr = '';

//     py.stdout.on('data', (data) => {
//       stdout += data.toString();
//       console.log('PYTHON STDOUT:', data.toString());
//     });

//     py.stderr.on('data', (data) => {
//       stderr += data.toString();
//       console.error('PYTHON STDERR:', data.toString());
//     });

//     py.on('close', async (code) => {
//       if (code === 0) {
//         try {
//           const result = JSON.parse(stdout);
//           const proposal = result.proposal;
          
//           // Save proposal to company job
//           job.proposal = proposal;
//           job.lastUpdated = new Date();
//           await job.save();
          
//           console.log('Proposal saved to DB.');
//           res.json({ 
//             message: 'Proposal generated successfully',
//             proposal, 
//             job: jobData 
//           });
//         } catch (err) {
//           console.error('Error parsing Python output:', err);
//           res.status(500).json({ message: 'Error parsing proposal output.' });
//         }
//       } else {
//         console.error('Python script exited with code', code, stderr);
//         res.status(500).json({ message: 'Proposal generation failed.', error: stderr });
//       }
//     });
    
//   } catch (err) {
//     console.error('Server error:', err);
//     res.status(500).json({ message: 'Server error.' });
//   }
// });

router.post('/:jobId/ae-score', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { ae_score, username } = req.body;
    const companyId = req.user.company._id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    if (ae_score === undefined || !username) {
      return res.status(400).json({ error: 'AE score and username are required' });
    }

    const job = await CompanyJob.findOne({
      _id: jobId,
      companyId
    }).populate('masterJobId');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Update AE score in master job
    const masterJob = job.masterJobId;
    
    // Initialize ae_score as array if it doesn't exist
    if (!masterJob.ae_score) {
      masterJob.ae_score = [];
    }

    // If ae_score is not an array, convert it
    if (!Array.isArray(masterJob.ae_score)) {
      masterJob.ae_score = [];
    }

    // Add new score entry
    masterJob.ae_score.push({
      value: ae_score,
      username,
      date: new Date()
    });

    await masterJob.save();
    
    // Update company job timestamp
    job.lastUpdated = new Date();
    await job.save();

    res.json({
      message: 'AE score added successfully',
      ae_score: masterJob.ae_score,
      job: {
        ...job.toObject(),
        ...masterJob.toObject(),
        // Override with company-specific data
        _id: job._id,
        currentStatus: job.currentStatus,
        statusHistory: job.statusHistory,
        comments: job.comments,
        proposal: job.proposal
      }
    });

  } catch (error) {
    console.error('Add AE score error:', error);
    res.status(500).json({ 
      error: 'Failed to add AE score',
      details: error.message 
    });
  }
});

// AE Pitched API
router.put('/:jobId/ae-pitched', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { ae_pitched } = req.body;
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

    // Update AE pitched in master job
    const masterJob = job.masterJobId;
    masterJob.ae_pitched = ae_pitched;
    await masterJob.save();
    
    // Update company job timestamp
    job.lastUpdated = new Date();
    await job.save();

    res.json({
      message: 'AE pitched status updated successfully',
      ae_pitched: masterJob.ae_pitched,
      job: {
        ...job.toObject(),
        ...masterJob.toObject(),
        // Override with company-specific data
        _id: job._id,
        currentStatus: job.currentStatus,
        statusHistory: job.statusHistory,
        comments: job.comments,
        proposal: job.proposal
      }
    });

  } catch (error) {
    console.error('Update AE pitched error:', error);
    res.status(500).json({ 
      error: 'Failed to update AE pitched status',
      details: error.message 
    });
  }
});

// AE Remark API
router.put('/:jobId/ae-remark', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { ae_comment } = req.body;
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

    // Update AE comment in master job
    const masterJob = job.masterJobId;
    masterJob.ae_comment = ae_comment;
    await masterJob.save();
    
    // Update company job timestamp
    job.lastUpdated = new Date();
    await job.save();

    res.json({
      message: 'AE remark updated successfully',
      ae_comment: masterJob.ae_comment,
      job: {
        ...job.toObject(),
        ...masterJob.toObject(),
        // Override with company-specific data
        _id: job._id,
        currentStatus: job.currentStatus,
        statusHistory: job.statusHistory,
        comments: job.comments,
        proposal: job.proposal
      }
    });

  } catch (error) {
    console.error('Update AE remark error:', error);
    res.status(500).json({ 
      error: 'Failed to update AE remark',
      details: error.message 
    });
  }
});

// Estimated Budget API
router.put('/:jobId/estimated-budget', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { estimated_budget } = req.body;
    const companyId = req.user.company._id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    if (estimated_budget === undefined) {
      return res.status(400).json({ error: 'Estimated budget is required' });
    }

    const job = await CompanyJob.findOne({
      _id: jobId,
      companyId
    }).populate('masterJobId');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Update estimated budget in master job
    const masterJob = job.masterJobId;
    masterJob.estimated_budget = estimated_budget;
    await masterJob.save();
    
    // Update company job timestamp
    job.lastUpdated = new Date();
    await job.save();

    res.json({
      message: 'Estimated budget updated successfully',
      estimated_budget: masterJob.estimated_budget,
      job: {
        ...job.toObject(),
        ...masterJob.toObject(),
        // Override with company-specific data
        _id: job._id,
        currentStatus: job.currentStatus,
        statusHistory: job.statusHistory,
        comments: job.comments,
        proposal: job.proposal
      }
    });

  } catch (error) {
    console.error('Update estimated budget error:', error);
    res.status(500).json({ 
      error: 'Failed to update estimated budget',
      details: error.message 
    });
  }
});

// Generate Proposal API
router.post('/:jobId/generate-proposal', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { selectedCategory, isProduct } = req.body;
    const companyId = req.user.company._id;
    const username = req.user.username;

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

    console.log('--- Proposal Generation Started ---');
    console.log('User:', username, 'Job ID:', jobId, 'Category:', selectedCategory, 'isProduct:', isProduct);

    // Prepare complete job data
    const completeJobData = {
      // Master job data
      ...job.masterJobId.toObject(),
      // Company job overrides
      _id: job._id,
      currentStatus: job.currentStatus,
      statusHistory: job.statusHistory,
      comments: job.comments,
      proposal: job.proposal
    };

    // Call Python script for proposal generation
    const jobDataString = JSON.stringify(completeJobData);
    const scriptPath = path.join(__dirname, '../python/proposal_generator.py');
    
    // Determine platform type
    const platformType = job.masterJobId.platform || 'linkedin';
    
    const args = [
      scriptPath,
      '--type', platformType,
      '--job', jobDataString,
      '--category', selectedCategory,
    ];
    
    if (isProduct) args.push('--is_product');

    console.log('Spawning Python process...');
    const py = spawn('python', args);

    let stdout = '';
    let stderr = '';

    py.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log('PYTHON STDOUT:', data.toString());
    });

    py.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error('PYTHON STDERR:', data.toString());
    });

    py.on('close', async (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          const proposal = result.proposal;
          
          // Save proposal to company job
          job.proposal = proposal;
          job.lastUpdated = new Date();
          await job.save();
          
          console.log('Proposal saved to DB.');
          res.json({ 
            message: 'Proposal generated successfully',
            proposal,
            job: completeJobData
          });
        } catch (err) {
          console.error('Error parsing Python output:', err);
          res.status(500).json({ message: 'Error parsing proposal output.' });
        }
      } else {
        console.error('Python script exited with code', code, stderr);
        res.status(500).json({ message: 'Proposal generation failed.', error: stderr });
      }
    });
    
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update Proposal API
router.patch('/:jobId/proposal', authenticateToken, requireRole(['company_user', 'company_admin']), async (req, res) => {
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

    const job = await CompanyJob.findOne({
      _id: jobId,
      companyId
    }).populate('masterJobId');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Update proposal in company job
    job.proposal = proposal.trim();
    job.lastUpdated = new Date();
    await job.save();

    res.json({
      message: 'Proposal updated successfully',
      proposal: job.proposal,
      job: {
        ...job.toObject(),
        ...job.masterJobId.toObject(),
        // Override with company-specific data
        _id: job._id,
        currentStatus: job.currentStatus,
        statusHistory: job.statusHistory,
        comments: job.comments,
        proposal: job.proposal
      }
    });

  } catch (error) {
    console.error('Update proposal error:', error);
    res.status(500).json({ 
      error: 'Failed to update proposal',
      details: error.message 
    });
  }
});

module.exports = router;
