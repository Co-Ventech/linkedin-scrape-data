
// const jobDistributionService = require('../services/jobDistributionService');
// const MasterJob = require('../models/MasterJob');
// const CompanyJob = require('../models/CompanyJob');
// const Company = require('../models/Company');

// // Distribute jobs from specific batch to companies
// const distributeJobsFromBatch = async (req, res) => {
//   try {
//     const { batchId } = req.params;
//     const { companyIds, perCompanyLimit } = req.body || {};

//     console.log(`Distribution request for batch: ${batchId}`);

//     const result = await jobDistributionService.distributeJobsFromBatch(batchId, companyIds, perCompanyLimit);

//     res.json({
//       success: true,
//       message: 'Job distribution completed',
//       batchId,
//       ...result
//     });

//   } catch (error) {
//     console.error('Distribution controller error:', error);
//     res.status(500).json({ 
//       error: 'Distribution failed', 
//       details: error.message 
//     });
//   }
// };

// // Distribute all undistributed jobs (FIXED)
// const distributeAllJobs = async (req, res) => {
//   try {
//     console.log('Starting distribution of all undistributed jobs');
    
//     const result = await jobDistributionService.distributeNewJobs(perCompanyLimit);

//     res.json({
//       success: true,
//       message: 'All jobs distribution completed',
//       ...result
//     });

//   } catch (error) {
//     console.error('Distribution controller error:', error);
//     res.status(500).json({ 
//       error: 'Distribution failed', 
//       details: error.message 
//     });
//   }
// };

// // Get distribution statistics
// const getDistributionStats = async (req, res) => {
//   try {
//     const { batchId, companyId, platform } = req.query;

//     // Build query
//     const query = {};
//     if (batchId) query.batchId = batchId;
//     if (platform) query.platform = platform;

//     // Get total jobs in master
//     const totalMasterJobs = await MasterJob.countDocuments(query);

//     // Get distribution stats
//     const distributedJobs = await MasterJob.aggregate([
//       { $match: query },
//       { $unwind: '$distributedTo' },
//       {
//         $group: {
//           _id: '$distributedTo.companyId',
//           jobCount: { $sum: 1 },
//           lastDistribution: { $max: '$distributedTo.distributedAt' }
//         }
//       },
//       {
//         $lookup: {
//           from: 'companies',
//           localField: '_id',
//           foreignField: '_id',
//           as: 'company'
//         }
//       },
//       { $unwind: '$company' },
//       {
//         $project: {
//           companyId: '$_id',
//           companyName: '$company.name',
//           jobCount: 1,
//           lastDistribution: 1
//         }
//       }
//     ]);

//     // Get company job stats if specific company requested
//     let companyStats = null;
//     if (companyId) {
//       companyStats = await CompanyJob.aggregate([
//         { $match: { companyId: companyId } },
//         {
//           $group: {
//             _id: '$currentStatus',
//             count: { $sum: 1 }
//           }
//         }
//       ]);
//     }

//     res.json({
//       totalMasterJobs,
//       distributionStats: distributedJobs,
//       companyStats,
//       filters: { batchId, companyId, platform }
//     });

//   } catch (error) {
//     res.status(500).json({ 
//       error: 'Failed to get distribution stats', 
//       details: error.message 
//     });
//   }
// };

// module.exports = {
//   distributeJobsFromBatch,
//   distributeAllJobs,
//   getDistributionStats
// };
const jobDistributionService = require('../services/jobDistributionService');
const MasterJob = require('../models/MasterJob');
const CompanyJob = require('../models/CompanyJob');
const Company = require('../models/Company');

// Distribute jobs from specific batch to companies
const distributeJobsFromBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { companyIds, perCompanyLimit } = req.body || {};

    console.log(`Distribution request for batch: ${batchId}`);

    const result = await jobDistributionService.distributeJobsFromBatch(batchId, companyIds, perCompanyLimit);

    res.json({
      success: true,
      message: 'Job distribution completed',
      batchId,
      ...result
    });

  } catch (error) {
    console.error('Distribution controller error:', error);
    res.status(500).json({ 
      error: 'Distribution failed', 
      details: error.message 
    });
  }
};

// Distribute all undistributed jobs (FIXED)
const distributeAllJobs = async (req, res) => {
  try {
    console.log('Starting distribution of all undistributed jobs');
    
    const { perCompanyLimit } = req.body || {};
    const result = await jobDistributionService.distributeNewJobs(perCompanyLimit);

    res.json({
      success: true,
      message: 'All jobs distribution completed',
      ...result
    });

  } catch (error) {
    console.error('Distribution controller error:', error);
    res.status(500).json({ 
      error: 'Distribution failed', 
      details: error.message 
    });
  }
};

// Get distribution statistics
const getDistributionStats = async (req, res) => {
  try {
    const { batchId, companyId, platform } = req.query;

    // Build query
    const query = {};
    if (batchId) query.batchId = batchId;
    if (platform) query.platform = platform;

    // Get total jobs in master
    const totalMasterJobs = await MasterJob.countDocuments(query);

    // Get distribution stats
    const distributedJobs = await MasterJob.aggregate([
      { $match: query },
      { $unwind: '$distributedTo' },
      {
        $group: {
          _id: '$distributedTo.companyId',
          jobCount: { $sum: 1 },
          lastDistribution: { $max: '$distributedTo.distributedAt' }
        }
      },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $project: {
          companyId: '$_id',
          companyName: '$company.name',
          jobCount: 1,
          lastDistribution: 1
        }
      }
    ]);

    // Get company job stats if specific company requested
    let companyStats = null;
    if (companyId) {
      companyStats = await CompanyJob.aggregate([
        { $match: { companyId: companyId } },
        {
          $group: {
            _id: '$currentStatus',
            count: { $sum: 1 }
          }
        }
      ]);
    }

    res.json({
      totalMasterJobs,
      distributionStats: distributedJobs,
      companyStats,
      filters: { batchId, companyId, platform }
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get distribution stats', 
      details: error.message 
    });
  }
};

module.exports = {
  distributeJobsFromBatch,
  distributeAllJobs,
  getDistributionStats
};