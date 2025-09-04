
const fs = require('fs');
const path = require('path');
const MasterJob = require('../models/MasterJob');
const JobBatch = require('../models/JobBatch');
const jobDistributionService = require('../services/jobDistributionService');
const Company = require('../models/Company');
const CompanyJob = require('../models/CompanyJob');

// Generate file path based on platform
const getFilePath = (platform) => {
  const dataDir = path.join(__dirname, '../data');
  
  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`Created data directory: ${dataDir}`);
  }

  const fileMap = {
    'linkedin': 'scored_linkedin_jobs.json',
    'upwork': 'final_jobs_upwork.json',
    'indeed': 'scored_indeed_jobs.json',
    'glassdoor': 'scored_glassdoor_jobs.json'
  };

  const fileName = fileMap[platform];
  return path.join(dataDir, fileName);
};

// Generate batch ID with timestamp and platform
const generateBatchId = (platform) => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '').slice(0, -5);
  return `${platform}_${timestamp}`;
};

// Fields that should be preserved (not overwritten) when updating existing jobs
const PRESERVED_FIELDS = [
  'currentStatus',
  'statusHistory', 
  'comments',
  'ae_comment',
  'ae_score',
  'proposal',
  'distributedTo'
];

// Convert platform-specific job to master job format
const convertToMasterJob = (job, platform, batchId) => {
  const baseJob = {
    platform,
    batchId,
    scrapedAt: new Date(),
    isActive: true,
    processed: true,
    source: 'file_upload'
  };

  if (platform === 'linkedin') {
    return {
      ...baseJob,
      // Core identifiers
      jobId: job.id,
      id: job.id,
      
      // Basic job information
      title: job.title,
      description: job.description,
      descriptionText: job.descriptionText,
      
      // Company information
      company: job.company,
      companyName: job.company?.name,
      
      // LinkedIn specific fields
      linkedinUrl: job.linkedinUrl,
      postedDate: job.postedDate ? new Date(job.postedDate) : null,
      expireAt: job.expireAt ? new Date(job.expireAt) : null,
      employmentType: job.employmentType,
      workplaceType: job.workplaceType,
      easyApplyUrl: job.easyApplyUrl,
      applicants: job.applicants,
      views: job.views,
      jobApplicationLimitReached: job.jobApplicationLimitReached,
      applyMethod: job.applyMethod,
      salary: job.salary,
      
      // Common fields
      tags: job.tags || [],
      skills: job.skills || [],
      city: job.city,
      country: job.country,
      countryTimezone: job.countryTimezone,
      utcOffsetMillis: job.utcOffsetMillis,
      category: job.category,
      categoryGroup: job.categoryGroup,
      occupation: job.occupation,
      status: job.status,
      url: job.linkedinUrl,
      
      // Timestamps
      ts_create: job.ts_create ? new Date(job.ts_create) : null,
      ts_publish: job.ts_publish ? new Date(job.ts_publish) : null,
      ts_sourcing: job.ts_sourcing ? new Date(job.ts_sourcing) : null,
      
      // LinkedIn KPI fields
      kpi_jd_quality: job.kpi_jd_quality,
      kpi_domain_fit: job.kpi_domain_fit,
      kpi_seniority_alignment: job.kpi_seniority_alignment,
      kpi_location_priority: job.kpi_location_priority,
      kpi_company_specialties: job.kpi_company_specialties,
      kpi_salary: job.kpi_salary,
      kpi_company_size: job.kpi_company_size,
      kpi_company_popularity: job.kpi_company_popularity,
      kpi_industry_match: job.kpi_industry_match,
      kpi_job_popularity: job.kpi_job_popularity,
      kpi_job_freshness: job.kpi_job_freshness,
      kpi_employment_type: job.kpi_employment_type,
      kpi_contact_info: job.kpi_contact_info,
      kpi_skills_explicitness: job.kpi_skills_explicitness,
      kpi_experience_threshold: job.kpi_experience_threshold,
      
      // AI Analysis fields
      predicted_domain: job.predicted_domain,
      ai_remark: job.ai_remark,
      final_score: job.final_score,
      final_weighted_score: job.final_weighted_score,
      tier: job.tier,
      estimated_budget: job.estimated_budget,
      ae_pitched: job.ae_pitched
    };
    
  } else if (platform === 'upwork') {
    return {
      ...baseJob,
      // Core identifiers
      jobId: job.jobId,
      
      // Basic job information
      title: job.title,
      description: job.description,
      descriptionText: job.descriptionText,
      
      // Company information
      companyName: job.companyName,
      
      // Upwork specific fields
      isContractToHire: job.isContractToHire,
      isPaymentMethodVerified: job.isPaymentMethodVerified,
      level: job.level,
      contractorTier: job.contractorTier,
      companyId: job.companyId,
      companyIndustry: job.companyIndustry,
      companyContractDate: job.companyContractDate ? new Date(job.companyContractDate) : null,
      buyerScore: job.buyerScore,
      buyerTotalAssignments: job.buyerTotalAssignments,
      buyerTotalJobsWithHires: job.buyerTotalJobsWithHires,
      buyerActiveAssignmentsCount: job.buyerActiveAssignmentsCount,
      buyerFeedbackCount: job.buyerFeedbackCount,
      buyerOpenJobsCount: job.buyerOpenJobsCount,
      buyerPostedJobsCount: job.buyerPostedJobsCount,
      buyerAvgHourlyRate: job.buyerAvgHourlyRate,
      minHourlyRate: job.minHourlyRate,
      maxHourlyRate: job.maxHourlyRate,
      hourlyType: job.hourlyType,
      hourlyWeeks: job.hourlyWeeks,
      minHoursWeek: job.minHoursWeek,
      lastBuyerActivity: job.lastBuyerActivity,
      clientTotalHours: job.clientTotalHours,
      clientTotalSpend: job.clientTotalSpend,
      clientRisingTalent: job.clientRisingTalent,
      jobType: job.jobType,
      fixedBudget: job.fixedBudget,
      fixedDurationLabel: job.fixedDurationLabel,
      numberOfPositionsToHire: job.numberOfPositionsToHire,
      premium: job.premium,
      openJobs: job.openJobs || [],
      questions: job.questions || [],
      qualificationsCountries: job.qualificationsCountries || [],
      qualificationsLanguages: job.qualificationsLanguages || [],
      qualificationsMinJobSuccessScore: job.qualificationsMinJobSuccessScore,
      qualificationsRisingTalent: job.qualificationsRisingTalent,
      qualificationsLocationCheckRequired: job.qualificationsLocationCheckRequired,
      
      // Common fields
      tags: job.tags || [],
      skills: job.skills || [],
      city: job.city,
      country: job.country,
      countryTimezone: job.countryTimezone,
      utcOffsetMillis: job.utcOffsetMillis,
      category: job.category,
      categoryGroup: job.categoryGroup,
      occupation: job.occupation,
      status: job.status,
      url: job.url,
      
      // Timestamps
      ts_create: job.ts_create ? new Date(job.ts_create) : null,
      ts_publish: job.ts_publish ? new Date(job.ts_publish) : null,
      ts_sourcing: job.ts_sourcing ? new Date(job.ts_sourcing) : null,
      
      // Upwork KPI fields
      kpi_budget_attractiveness: job.kpi_budget_attractiveness,
      kpi_avg_hourly_rate: job.kpi_avg_hourly_rate,
      kpi_contract_to_hire: job.kpi_contract_to_hire,
      kpi_enterprise_heuristic: job.kpi_enterprise_heuristic,
      kpi_hiring_rate: job.kpi_hiring_rate,
      kpi_job_engagement: job.kpi_job_engagement,
      kpi_job_title_relevance: job.kpi_job_title_relevance,
      kpi_client_tenure: job.kpi_client_tenure,
      kpi_client_hiring_history: job.kpi_client_hiring_history,
      kpi_client_active_assignments: job.kpi_client_active_assignments,
      kpi_client_feedback_volume: job.kpi_client_feedback_volume,
      kpi_client_open_jobs: job.kpi_client_open_jobs,
      kpi_skill_match: job.kpi_skill_match,
      kpi_weekly_hour_commitment: job.kpi_weekly_hour_commitment,
      kpi_client_rating: job.kpi_client_rating,
      kpi_client_activity_recency: job.kpi_client_activity_recency,
      kpi_payment_verification: job.kpi_payment_verification,
      kpi_job_level_match: job.kpi_job_level_match,
      
      // AI Analysis fields
      predicted_domain: job.predicted_domain,
      ai_remark: job.ai_remark,
      final_score: job.final_score,
      final_weighted_score: job.final_weighted_score,
      tier: job.tier,
      estimated_budget: job.estimated_budget,
      ae_pitched: job.ae_pitched
    };
  }

  return baseJob;
};

// Upsert master job (insert or update) - Preserves company-managed fields
const upsertMasterJob = async (jobData) => {
  try {
    // Check if job already exists
    const existingJob = await MasterJob.findOne({ 
      platform: jobData.platform, 
      jobId: jobData.jobId 
    });

    if (existingJob) {
      // Update existing job but preserve company-managed fields
      const updateData = { ...jobData };
      
      // Remove preserved fields from update data
      PRESERVED_FIELDS.forEach(field => {
        delete updateData[field];
      });

      const result = await MasterJob.updateOne(
        { 
          platform: jobData.platform, 
          jobId: jobData.jobId 
        },
        { $set: updateData },
        { upsert: false }
      );

      return {
        matched: result.matchedCount > 0,
        upserted: false,
        modified: result.modifiedCount > 0
      };
    } else {
      // Insert new job with default values for company-managed fields
      const newJobData = {
        ...jobData,
        // Initialize company-managed fields with defaults
        currentStatus: 'not_engaged',
        statusHistory: [],
        comments: [],
        ae_comment: '',
        ae_score: [],
        proposal: '',
        distributedTo: []
      };

      const result = await MasterJob.create(newJobData);

      return {
        matched: false,
        upserted: true,
        modified: false
      };
    }
  } catch (error) {
    throw new Error(`Failed to save job ${jobData.jobId}: ${error.message}`);
  }
};

// Process job batch and save to database
const processJobBatch = async (jobs, platform, batchId, jobBatch) => {
  let saved = 0;
  let duplicates = 0;
  let errors = 0;

  console.log(`Processing ${jobs.length} jobs for batch ${batchId}`);

  for (let i = 0; i < jobs.length; i++) {
    try {
      const job = jobs[i];
      const masterJobData = convertToMasterJob(job, platform, batchId);
      
      // Try to save the job
      const result = await upsertMasterJob(masterJobData);
      
      if (result.upserted) {
        saved++;
      } else if (result.matched) {
        duplicates++;
      }

      // Update progress every 100 jobs
      if ((i + 1) % 100 === 0) {
        console.log(`Processed ${i + 1}/${jobs.length} jobs for batch ${batchId}`);
      }

    } catch (error) {
      errors++;
      console.error(`Error processing job ${i}:`, error.message);
      
      // Log error to batch
      await JobBatch.findOneAndUpdate(
        { batchId },
        {
          $push: {
            errorLogs: {
              error: error.message,
              jobId: jobs[i]?.id || jobs[i]?.jobId || `index_${i}`,
              timestamp: new Date()
            }
          }
        }
      );
    }
  }

  console.log(`Batch processing completed: ${saved} saved, ${duplicates} duplicates, ${errors} errors`);
  return { saved, duplicates, errors };
};

// Upload scored jobs from file to master database (NO AUTO-DISTRIBUTION)
const uploadScoredJobsFromFile = async (req, res) => {
  try {
    const { platform } = req.body;
    
    if (!platform) {
      return res.status(400).json({ 
        error: 'Platform is required' 
      });
    }

    // Validate platform
    if (!['linkedin', 'upwork', 'indeed', 'glassdoor'].includes(platform)) {
      return res.status(400).json({ 
        error: 'Invalid platform. Must be: linkedin, upwork, indeed, or glassdoor' 
      });
    }

    // Auto-generate file path based on platform
    const filePath = getFilePath(platform);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ 
        error: `File not found: ${filePath}`,
        hint: `Please ensure the scored ${platform} jobs file exists in the data folder`
      });
    }

    // Auto-generate batch ID with date, time, and platform
    const batchId = generateBatchId(platform);

    // Create job batch record
    let jobBatch = new JobBatch({
      batchId,
      platform,
      status: 'running',
      executedBy: req.user?.username || 'api_upload',
      parameters: {
        filePath,
        uploadedAt: new Date()
      }
    });
    await jobBatch.save();

    console.log(`Starting upload for ${platform} jobs from: ${filePath}`);
    console.log(`Batch ID: ${batchId}`);

    // Read and parse the JSON file
    let jobs = [];
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      jobs = JSON.parse(fileContent);
      
      if (!Array.isArray(jobs)) {
        throw new Error('File must contain an array of jobs');
      }

      console.log(`Found ${jobs.length} jobs in the file`);
    } catch (parseError) {
      jobBatch.status = 'failed';
      jobBatch.errors.push({
        error: `File parsing error: ${parseError.message}`,
        timestamp: new Date()
      });
      await jobBatch.save();
      
      return res.status(400).json({ 
        error: 'Invalid JSON file format', 
        details: parseError.message,
        filePath 
      });
    }

    // Process and save jobs (NO DISTRIBUTION)
    const results = await processJobBatch(jobs, platform, batchId, jobBatch);

    // Update batch status
    jobBatch.status = 'completed';
    jobBatch.endTime = new Date();
    jobBatch.stats.totalJobsScraped = jobs.length;
    jobBatch.stats.newJobsAdded = results.saved;
    jobBatch.stats.duplicatesSkipped = results.duplicates;
    jobBatch.stats.errorsEncountered = results.errors;
    await jobBatch.save();

    console.log(`Upload completed - Saved: ${results.saved}, Duplicates: ${results.duplicates}, Errors: ${results.errors}`);

    res.json({
      success: true,
      message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} jobs uploaded successfully`,
      batchId,
      filePath,
      results: {
        totalProcessed: jobs.length,
        saved: results.saved,
        duplicates: results.duplicates,
        errors: results.errors,
        platform
      },
      note: 'Jobs saved to MasterJob collection. Use distribution endpoints to send to companies.'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload jobs', 
      details: error.message 
    });
  }
};

// Get master jobs with filtering
const getMasterJobs = async (req, res) => {
  try {
    const {
      platform,
      status,
      search,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (platform) {
      query.platform = platform;
    }
    
    if (status) {
      query.currentStatus = status;
    }
    
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { companyName: new RegExp(search, 'i') },
        { jobId: new RegExp(search, 'i') }
      ];
    }

    // Get jobs with pagination
    const jobs = await MasterJob.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await MasterJob.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get master jobs error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch master jobs', 
      details: error.message 
    });
  }
};

// Get job batches
const getJobBatches = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const batches = await JobBatch.find()
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await JobBatch.countDocuments();

    res.json({
      batches,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get job batches error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch job batches', 
      details: error.message 
    });
  }
};

// Delete batch
const deleteBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await JobBatch.findOneAndDelete({ batchId });

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    res.json({
      message: 'Batch deleted successfully',
      batchId
    });

  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({ 
      error: 'Failed to delete batch', 
      details: error.message 
    });
  }
};

// Distribute to specific companies
const distributeToSpecificCompanies = async (req, res) => {
  try {
    const { companyIds } = req.body;
    
    if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
      return res.status(400).json({ 
        error: 'companyIds array is required and must not be empty' 
      });
    }

    // Get selected companies
    const companies = await Company.find({
      _id: { $in: companyIds },
      isActive: true
    });

    if (companies.length === 0) {
      return res.status(400).json({ 
        error: 'No active companies found with provided IDs' 
      });
    }

    // Get all undistributed jobs
    const undistributedJobs = await MasterJob.find({
      isActive: true,
      distributedTo: { $size: 0 }
    });

    if (undistributedJobs.length === 0) {
      return res.json({
        success: true,
        message: 'No undistributed jobs found',
        companiesNotified: companies.length,
        jobsDistributed: 0
      });
    }

    let totalDistributed = 0;
    const companyResults = [];

    for (const company of companies) {
      try {
        const filteredJobs = undistributedJobs; // You can add filtering logic here
        
        // Create CompanyJob entries (shadow view)
        const companyJobs = filteredJobs.map(job => ({
          masterJobId: job._id,
          companyId: company._id,
          currentStatus: 'not_engaged',
          distributedAt: new Date(),
          statusHistory: [{
            status: 'not_engaged',
            username: 'system',
            date: new Date(),
            notes: 'Job distributed by admin'
          }]
        }));

        await CompanyJob.insertMany(companyJobs, { ordered: false });
        
        totalDistributed += companyJobs.length;
        
        companyResults.push({
          companyId: company._id,
          companyName: company.name,
          jobsDistributed: companyJobs.length,
          errors: 0
        });

      } catch (error) {
        console.error(`Distribution error for company ${company.name}:`, error);
        companyResults.push({
          companyId: company._id,
          companyName: company.name,
          jobsDistributed: 0,
          errors: 1,
          errorMessage: error.message
        });
      }
    }

    // Mark jobs as distributed if successfully distributed to at least one company
    if (totalDistributed > 0) {
      await MasterJob.updateMany(
        { _id: { $in: undistributedJobs.map(j => j._id) } },
        { 
          $push: { 
            distributedTo: { 
              $each: companies.map(c => ({
                companyId: c._id,
                distributedAt: new Date(),
                status: 'delivered'
              }))
            } 
          } 
        }
      );
    }

    res.json({
      success: true,
      message: 'Jobs distribution completed',
      summary: {
        totalJobs: undistributedJobs.length,
        totalCompanies: companies.length,
        totalDistributed,
        avgJobsPerCompany: Math.round(totalDistributed / companies.length)
      },
      companyResults
    });

  } catch (error) {
    console.error('Distribute to specific companies error:', error);
    res.status(500).json({
      error: 'Distribution failed',
      details: error.message
    });
  }
};
const getBatchDetails = async (req, res) => {
  try {
    const { batchId } = req.params;

    // Find batch by ID
    const batch = await JobBatch.findById(batchId);

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Get jobs in this batch
    const batchJobs = await MasterJob.find({ 
      batchId: batch.batchId,
      isActive: true 
    }).select('jobId title companyName platform tier final_score currentStatus');

    // Get distribution stats for this batch
    const distributionStats = await MasterJob.aggregate([
      { $match: { batchId: batch.batchId } },
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

    res.json({
      batch,
      jobs: {
        total: batchJobs.length,
        list: batchJobs
      },
      distribution: {
        totalDistributed: distributionStats.length,
        companies: distributionStats
      }
    });

  } catch (error) {
    console.error('Get batch details error:', error);
    res.status(500).json({ 
      error: 'Failed to get batch details', 
      details: error.message 
    });
  }
};

module.exports = {
  uploadScoredJobsFromFile,
  getMasterJobs,
  getJobBatches,
  deleteBatch,
  getBatchDetails,
  distributeToSpecificCompanies
};