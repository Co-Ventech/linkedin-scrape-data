
const MasterJob = require('../models/MasterJob');
const CompanyJob = require('../models/CompanyJob');
const Company = require('../models/Company');
const JobCustomization = require('../models/JobCustomization');
const JobBatch = require('../models/JobBatch');

// Distribute jobs from specific batch to companies (SHADOW VIEW)
const distributeJobsFromBatch = async (batchId, specificCompanyIds = null) => {
  try {
    console.log(`Starting SHADOW VIEW distribution for batch: ${batchId}`);

    // Get jobs from the specific batch
    const batchJobs = await MasterJob.find({ 
      batchId,
      isActive: true 
    });

    if (batchJobs.length === 0) {
      console.log(`No jobs found in batch ${batchId}`);
      return {
        companiesNotified: 0,
        jobsDistributed: 0,
        error: 'No jobs found in batch'
      };
    }

    // Get target companies
    let targetCompanies;
    if (specificCompanyIds && specificCompanyIds.length > 0) {
      targetCompanies = await Company.find({
        _id: { $in: specificCompanyIds },
        subscriptionStatus: 'active',
        isActive: true
      });
    } else {
      targetCompanies = await Company.find({
        subscriptionStatus: 'active',
        isActive: true,
        $or: [
          { subscriptionEndDate: { $exists: false } },
          { subscriptionEndDate: { $gt: new Date() } }
        ]
      });
    }

    if (targetCompanies.length === 0) {
      console.log('No active companies found for distribution');
      return {
        companiesNotified: 0,
        jobsDistributed: 0,
        error: 'No active companies found'
      };
    }

    console.log(`Found ${batchJobs.length} jobs and ${targetCompanies.length} companies`);

    let totalDistributed = 0;
    let companiesNotified = 0;

    // Distribute jobs to each company (SHADOW VIEW - NO DATA DUPLICATION)
    for (const company of targetCompanies) {
      const result = await distributeJobsToSingleCompanyShadow(company, batchJobs);
      if (result.distributed > 0) {
        totalDistributed += result.distributed;
        companiesNotified++;
      }
    }

    // Update batch distribution info
    await JobBatch.findOneAndUpdate(
      { batchId },
      {
        $set: {
          'distribution.companiesNotified': companiesNotified,
          'distribution.jobsDistributed': totalDistributed
        }
      }
    );

    return {
      companiesNotified,
      jobsDistributed: totalDistributed
    };

  } catch (error) {
    console.error('Distribution error:', error);
    throw error;
  }
};

// Distribute all undistributed jobs (FIXED LOGIC)
const distributeNewJobs = async () => {
  try {
    console.log('Starting distribution of all undistributed jobs');

    // Get all jobs that haven't been distributed yet
    const undistributedJobs = await MasterJob.find({
      isActive: true,
      distributedTo: { $size: 0 } // No distributions yet
    });

    console.log(`Found ${undistributedJobs.length} undistributed jobs`);

    if (undistributedJobs.length === 0) {
      return {
        companiesNotified: 0,
        jobsDistributed: 0,
        error: 'No undistributed jobs found'
      };
    }

    // Get all active companies
    const activeCompanies = await Company.find({
      subscriptionStatus: 'active',
      isActive: true,
      $or: [
        { subscriptionEndDate: { $exists: false } },
        { subscriptionEndDate: { $gt: new Date() } }
      ]
    });

    console.log(`Found ${activeCompanies.length} active companies`);

    if (activeCompanies.length === 0) {
      return {
        companiesNotified: 0,
        jobsDistributed: 0,
        error: 'No active companies found'
      };
    }

    let totalDistributed = 0;
    let companiesNotified = 0;

    // Distribute to all companies
    for (const company of activeCompanies) {
      const result = await distributeJobsToSingleCompanyShadow(company, undistributedJobs);
      if (result.distributed > 0) {
        totalDistributed += result.distributed;
        companiesNotified++;
      }
    }

    return {
      companiesNotified,
      jobsDistributed: totalDistributed
    };

  } catch (error) {
    console.error('Distribution error:', error);
    throw error;
  }
};

// Distribute jobs to single company (SHADOW VIEW)
const distributeJobsToSingleCompanyShadow = async (company, availableJobs) => {
  try {
    console.log(`Distributing jobs to company: ${company.name}`);

    // Get company customization/preferences
    const customization = await JobCustomization.findOne({ companyId: company._id });

    // Filter jobs based on company preferences
    const filteredJobs = filterJobsForCompany(availableJobs, customization);

    // Check quota limits
    const remainingQuota = Math.max(0, (company.jobsQuota || 100) - (company.jobsUsed || 0));
    const jobsToDistribute = filteredJobs.slice(0, remainingQuota);

    console.log(`Company ${company.name}: ${filteredJobs.length} filtered, ${jobsToDistribute.length} to distribute (quota remaining: ${remainingQuota})`);

    let distributed = 0;

    // Create SHADOW VIEW entries (ONLY REFERENCES + COMPANY DATA)
    for (const masterJob of jobsToDistribute) {
      try {
        const companyJob = await createShadowJobEntry(company._id, masterJob);
        if (companyJob) {
          distributed++;

          // Update master job distribution tracking
          await MasterJob.findByIdAndUpdate(masterJob._id, {
            $push: {
              distributedTo: {
                companyId: company._id,
                distributedAt: new Date(),
                status: 'delivered'
              }
            }
          });
        }
      } catch (error) {
        console.error(`Error distributing job ${masterJob.jobId} to ${company.name}:`, error.message);
      }
    }

    // Update company job usage
    if (distributed > 0) {
      await Company.findByIdAndUpdate(company._id, {
        $inc: { jobsUsed: distributed },
        lastJobSync: new Date()
      });
    }

    return {
      distributed,
      available: availableJobs.length,
      filtered: filteredJobs.length,
      quotaRemaining: remainingQuota - distributed
    };

  } catch (error) {
    console.error(`Error distributing jobs to company ${company.name}:`, error);
    return { distributed: 0 };
  }
};

// Create SHADOW VIEW entry (MINIMAL DATA)
const createShadowJobEntry = async (companyId, masterJob) => {
  try {
    // Check if already exists
    const existingJob = await CompanyJob.findOne({
      masterJobId: masterJob._id,
      companyId
    });

    if (existingJob) {
      return null; // Already distributed
    }

    // Create SHADOW VIEW entry (ONLY REFERENCES + COMPANY DATA)
    const companyJob = new CompanyJob({
      masterJobId: masterJob._id, // Reference to MasterJob
      companyId, // Reference to Company
      currentStatus: 'not_engaged',
      statusHistory: [{
        status: 'not_engaged',
        username: 'system',
        date: new Date(),
        notes: 'Job distributed via shadow view'
      }],
      distributedAt: new Date()
    });

    await companyJob.save();
    return companyJob;
  } catch (error) {
    console.error(`Error creating shadow job entry:`, error);
    return null;
  }
};

// Filter jobs based on company preferences
const filterJobsForCompany = (jobs, customization) => {
  if (!customization || !customization.filters) {
    return jobs;
  }

  const filters = customization.filters;

  return jobs.filter(job => {
    // Platform filter
    if (customization.enabledPlatforms && customization.enabledPlatforms.length > 0) {
      const enabledPlatforms = customization.enabledPlatforms
        .filter(p => p.isEnabled)
        .map(p => p.platform);
      
      if (!enabledPlatforms.includes(job.platform)) {
        return false;
      }
    }

    // Skills filter
    if (filters.requiredSkills && filters.requiredSkills.length > 0) {
      const hasRequiredSkill = filters.requiredSkills.some(skill => 
        job.skills && job.skills.some(jobSkill => 
          jobSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (!hasRequiredSkill) return false;
    }

    // Budget/Salary filter
    if (filters.budgetRange && filters.budgetRange.min) {
      let jobBudget = 0;
      if (job.salary && job.salary.min) {
        jobBudget = job.salary.min;
      } else if (job.minHourlyRate) {
        jobBudget = job.minHourlyRate;
      } else if (job.fixedBudget) {
        jobBudget = job.fixedBudget;
      }
      
      if (jobBudget < filters.budgetRange.min) {
        return false;
      }
    }

    // Minimum scores filter
    if (filters.minimumScores) {
      if (filters.minimumScores.overall) {
        const jobScore = job.final_score || job.final_weighted_score || 0;
        if (jobScore < filters.minimumScores.overall) {
          return false;
        }
      }
    }

    return true;
  });
};

module.exports = {
  distributeJobsFromBatch,
  distributeNewJobs
};

