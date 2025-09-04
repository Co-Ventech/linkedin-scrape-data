
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
