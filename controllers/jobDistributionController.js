// const MasterJob = require('../models/MasterJob');
// const CompanyJob = require('../models/CompanyJob');
// const Company = require('../models/Company');
// const JobCustomization = require('../models/JobCustomization');
// const JobBatch = require('../models/JobBatch');

// // Distribute jobs from specific batch to companies
// const distributeJobsFromBatch = async (req, res) => {
//   try {
//     const { batchId } = req.params;
//     const { companyIds } = req.body; // Optional: specific companies

//     console.log(`Starting distribution for batch: ${batchId}`);

//     // Get jobs from the specific batch
//     const batchJobs = await MasterJob.find({ 
//       batchId,
//       isActive: true 
//     });

//     if (batchJobs.length === 0) {
//       return res.status(404).json({
//         error: 'No jobs found in the specified batch',
//         batchId
//       });
//     }

//     // Get target companies (specific or all active)
//     let targetCompanies;
//     if (companyIds && companyIds.length > 0) {
//       targetCompanies = await Company.find({
//         _id: { $in: companyIds },
//         subscriptionStatus: 'active',
//         isActive: true
//       });
//     } else {
//       targetCompanies = await Company.find({
//         subscriptionStatus: 'active',
//         isActive: true,
//         subscriptionEndDate: { $gt: new Date() }
//       });
//     }

//     if (targetCompanies.length === 0) {
//       return res.status(404).json({
//         error: 'No active companies found for distribution'
//       });
//     }

//     console.log(`Found ${batchJobs.length} jobs and ${targetCompanies.length} companies`);

//     // Distribute jobs to each company
//     const distributionResults = [];
//     for (const company of targetCompanies) {
//       const result = await distributeJobsToSingleCompany(company, batchJobs);
//       distributionResults.push({
//         companyId: company._id,
//         companyName: company.name,
//         ...result
//       });
//     }

//     // Calculate totals
//     const totalDistributed = distributionResults.reduce((sum, result) => sum + result.distributed, 0);
//     const totalCompanies = distributionResults.length;

//     // Update batch distribution info
//     await JobBatch.findOneAndUpdate(
//       { batchId },
//       {
//         $set: {
//           'distribution.companiesNotified': totalCompanies,
//           'distribution.jobsDistributed': totalDistributed,
//           'distribution.distributionErrors': distributionResults.filter(r => r.errors > 0).length
//         }
//       }
//     );

//     res.json({
//       success: true,
//       message: 'Job distribution completed',
//       batchId,
//       summary: {
//         totalJobs: batchJobs.length,
//         totalCompanies,
//         totalDistributed,
//         avgJobsPerCompany: Math.round(totalDistributed / totalCompanies)
//       },
//       companyResults: distributionResults
//     });

//   } catch (error) {
//     console.error('Distribution error:', error);
//     res.status(500).json({ 
//       error: 'Distribution failed', 
//       details: error.message 
//     });
//   }
// };

// // Distribute all undistributed jobs
// const distributeAllJobs = async (req, res) => {
//   try {
//     console.log('Starting distribution of all undistributed jobs');

//     // Get all jobs that haven't been distributed yet
//     const undistributedJobs = await MasterJob.find({
//       isActive: true,
//       distributedTo: { $size: 0 } // No distributions yet
//     });

//     if (undistributedJobs.length === 0) {
//       return res.json({
//         message: 'No undistributed jobs found',
//         totalDistributed: 0
//       });
//     }

//     // Get all active companies
//     const activeCompanies = await Company.find({
//       subscriptionStatus: 'active',
//       isActive: true,
//       subscriptionEndDate: { $gt: new Date() }
//     });

//     if (activeCompanies.length === 0) {
//       return res.status(404).json({
//         error: 'No active companies found for distribution'
//       });
//     }

//     console.log(`Found ${undistributedJobs.length} undistributed jobs and ${activeCompanies.length} companies`);

//     // Distribute to all companies
//     const distributionResults = [];
//     for (const company of activeCompanies) {
//       const result = await distributeJobsToSingleCompany(company, undistributedJobs);
//       distributionResults.push({
//         companyId: company._id,
//         companyName: company.name,
//         ...result
//       });
//     }

//     // Calculate totals
//     const totalDistributed = distributionResults.reduce((sum, result) => sum + result.distributed, 0);

//     res.json({
//       success: true,
//       message: 'All jobs distribution completed',
//       summary: {
//         totalJobs: undistributedJobs.length,
//         totalCompanies: activeCompanies.length,
//         totalDistributed,
//         avgJobsPerCompany: Math.round(totalDistributed / activeCompanies.length)
//       },
//       companyResults: distributionResults
//     });

//   } catch (error) {
//     console.error('Distribution error:', error);
//     res.status(500).json({ 
//       error: 'Distribution failed', 
//       details: error.message 
//     });
//   }
// };

// // Helper function to distribute jobs to a single company
// const distributeJobsToSingleCompany = async (company, availableJobs) => {
//   try {
//     console.log(`Distributing jobs to company: ${company.name}`);

//     // Get company customization/preferences
//     const customization = await JobCustomization.findOne({ companyId: company._id });

//     // Filter jobs based on company preferences
//     const filteredJobs = filterJobsForCompany(availableJobs, customization, company);

//     // Check quota limits
//     const remainingQuota = Math.max(0, company.jobsQuota - company.jobsUsed);
//     const jobsToDistribute = filteredJobs.slice(0, remainingQuota);

//     console.log(`Company ${company.name}: ${filteredJobs.length} filtered, ${jobsToDistribute.length} to distribute (quota remaining: ${remainingQuota})`);

//     let distributed = 0;
//     let errors = 0;
//     const distributedJobIds = [];

//     // Create CompanyJob entries
//     for (const masterJob of jobsToDistribute) {
//       try {
//         const companyJob = await createCompanyJobEntry(company._id, masterJob);
//         if (companyJob) {
//           distributed++;
//           distributedJobIds.push(masterJob._id);

//           // Update master job distribution tracking
//           await MasterJob.findByIdAndUpdate(masterJob._id, {
//             $push: {
//               distributedTo: {
//                 companyId: company._id,
//                 distributedAt: new Date(),
//                 status: 'delivered'
//               }
//             }
//           });
//         }
//       } catch (error) {
//         errors++;
//         console.error(`Error distributing job ${masterJob.jobId} to ${company.name}:`, error.message);
//       }
//     }

//     // Update company job usage
//     if (distributed > 0) {
//       await Company.findByIdAndUpdate(company._id, {
//         $inc: { jobsUsed: distributed },
//         lastJobSync: new Date()
//       });
//     }

//     return {
//       available: availableJobs.length,
//       filtered: filteredJobs.length,
//       distributed,
//       errors,
//       quotaRemaining: remainingQuota - distributed,
//       distributedJobIds
//     };

//   } catch (error) {
//     console.error(`Error distributing jobs to company ${company.name}:`, error);
//     return {
//       available: availableJobs.length,
//       filtered: 0,
//       distributed: 0,
//       errors: 1,
//       quotaRemaining: 0,
//       error: error.message
//     };
//   }
// };

// // Filter jobs based on company preferences
// const filterJobsForCompany = (jobs, customization, company) => {
//   if (!customization || !customization.filters) {
//     // If no customization, return all jobs (basic filtering)
//     return jobs;
//   }

//   const filters = customization.filters;

//   return jobs.filter(job => {
//     // Platform filter
//     if (customization.enabledPlatforms && customization.enabledPlatforms.length > 0) {
//       const enabledPlatforms = customization.enabledPlatforms
//         .filter(p => p.isEnabled)
//         .map(p => p.platform);
      
//       if (!enabledPlatforms.includes(job.platform)) {
//         return false;
//       }
//     }

//     // Skills filter
//     if (filters.requiredSkills && filters.requiredSkills.length > 0) {
//       const hasRequiredSkill = filters.requiredSkills.some(skill => 
//         job.skills && job.skills.some(jobSkill => 
//           jobSkill.toLowerCase().includes(skill.toLowerCase())
//         )
//       );
//       if (!hasRequiredSkill) return false;
//     }

//     // Exclude skills
//     if (filters.excludedSkills && filters.excludedSkills.length > 0) {
//       const hasExcludedSkill = filters.excludedSkills.some(skill => 
//         job.skills && job.skills.some(jobSkill => 
//           jobSkill.toLowerCase().includes(skill.toLowerCase())
//         )
//       );
//       if (hasExcludedSkill) return false;
//     }

//     // Location filter
//     if (filters.preferredLocations && filters.preferredLocations.length > 0) {
//       const matchesLocation = filters.preferredLocations.some(location => 
//         (job.country && job.country.toLowerCase().includes(location.toLowerCase())) ||
//         (job.city && job.city.toLowerCase().includes(location.toLowerCase()))
//       );
//       if (!matchesLocation && !filters.remoteOnly) return false;
//     }

//     // Remote only filter
//     if (filters.remoteOnly && job.workplaceType && job.workplaceType.toLowerCase() !== 'remote') {
//       return false;
//     }

//     // Budget/Salary filter
//     if (filters.budgetRange && filters.budgetRange.min) {
//       let jobBudget = 0;
//       if (job.salary && job.salary.min) {
//         jobBudget = job.salary.min;
//       } else if (job.minHourlyRate) {
//         jobBudget = job.minHourlyRate;
//       } else if (job.fixedBudget) {
//         jobBudget = job.fixedBudget;
//       }
      
//       if (jobBudget < filters.budgetRange.min) {
//         return false;
//       }
//     }

//     // Experience level filter
//     if (filters.experienceLevels && filters.experienceLevels.length > 0) {
//       if (job.level && !filters.experienceLevels.includes(job.level)) {
//         return false;
//       }
//     }

//     // Employment type filter
//     if (filters.employmentTypes && filters.employmentTypes.length > 0) {
//       if (job.employmentType && !filters.employmentTypes.includes(job.employmentType)) {
//         return false;
//       }
//     }

//     // Minimum scores filter
//     if (filters.minimumScores) {
//       if (filters.minimumScores.overall) {
//         const jobScore = job.final_score || job.final_weighted_score || 0;
//         if (jobScore < filters.minimumScores.overall) {
//           return false;
//         }
//       }

//       if (filters.minimumScores.domainFit && job.kpi_domain_fit) {
//         if (job.kpi_domain_fit < filters.minimumScores.domainFit) {
//           return false;
//         }
//       }
//     }

//     // Keywords filter
//     if (filters.includeKeywords && filters.includeKeywords.length > 0) {
//       const jobText = `${job.title} ${job.description}`.toLowerCase();
//       const hasKeyword = filters.includeKeywords.some(keyword => 
//         jobText.includes(keyword.toLowerCase())
//       );
//       if (!hasKeyword) return false;
//     }

//     // Exclude keywords
//     if (filters.excludeKeywords && filters.excludeKeywords.length > 0) {
//       const jobText = `${job.title} ${job.description}`.toLowerCase();
//       const hasExcludedKeyword = filters.excludeKeywords.some(keyword => 
//         jobText.includes(keyword.toLowerCase())
//       );
//       if (hasExcludedKeyword) return false;
//     }

//     return true;
//   });
// };

// // Create CompanyJob entry
// const createCompanyJobEntry = async (companyId, masterJob) => {
//   try {
//     // Check if already exists
//     const existingJob = await CompanyJob.findOne({
//       masterJobId: masterJob._id,
//       companyId
//     });

//     if (existingJob) {
//       return null; // Already distributed
//     }

//     const companyJob = new CompanyJob({
//       masterJobId: masterJob._id,
//       companyId,
//       jobId: masterJob.jobId,
//       platform: masterJob.platform,
//       title: masterJob.title,
//       companyName: masterJob.companyName,
//       location: `${masterJob.city || ''}, ${masterJob.country || ''}`.trim().replace(/^,\s*/, ''),
//       postedDate: masterJob.postedDate || masterJob.ts_publish,
//       distributedAt: new Date(),
//       currentStatus: 'not_engaged',
//       statusHistory: [{
//         status: 'not_engaged',
//         date: new Date(),
//         username: 'system'
//       }]
//     });

//     await companyJob.save();
//     return companyJob;
//   } catch (error) {
//     console.error(`Error creating company job entry:`, error);
//     return null;
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
//       {
//         $project: {
//           companyId: '$_id',
//           companyName: { $arrayElemAt: ['$company.name', 0] },
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
    const { companyIds } = req.body || {}; // Fix: Handle undefined req.body

    console.log(`Distribution request for batch: ${batchId}`);

    const result = await jobDistributionService.distributeJobsFromBatch(batchId, companyIds);

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

// Distribute all undistributed jobs
const distributeAllJobs = async (req, res) => {
  try {
    const result = await jobDistributionService.distributeNewJobs();

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

    // Build query for master jobs
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
      {
        $project: {
          companyId: '$_id',
          companyName: { $arrayElemAt: ['$company.name', 0] },
          jobCount: 1,
          lastDistribution: 1
        }
      }
    ]);

    // Get company job stats if specific company requested
    let companyStats = null;
    if (companyId) {
      companyStats = await CompanyJob.aggregate([
        { $match: { companyId: mongoose.Types.ObjectId(companyId) } },
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
