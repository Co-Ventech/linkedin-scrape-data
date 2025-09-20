

// const fs = require('fs');
// const path = require('path');
// const MasterJob = require('../models/MasterJob');
// const JobBatch = require('../models/JobBatch');
// const jobDistributionService = require('../services/jobDistributionService');
// const Company = require('../models/Company');
// const CompanyJob = require('../models/CompanyJob');

// // Fields that should be preserved (not overwritten) when updating existing jobs
// const PRESERVED_FIELDS = [
//   'currentStatus',
//   'statusHistory', 
//   'comments',
//   'ae_comment',
//   'ae_score',
//   'proposal',
//   'distributedTo'
// ];

// // Generate file path based on platform
// const getFilePath = (platform) => {
//   const dataDir = path.join(__dirname, '../data');
  
//   // Ensure data directory exists
//   if (!fs.existsSync(dataDir)) {
//     fs.mkdirSync(dataDir, { recursive: true });
//     console.log(`Created data directory: ${dataDir}`);
//   }

//   const fileMap = {
//     'linkedin': 'scored_linkedin_jobs.json',
//     'upwork': 'final_jobs_upwork.json',
//     'indeed': 'scored_indeed_jobs.json',
//     'glassdoor': 'scored_glassdoor_jobs.json'
//   };

//   const fileName = fileMap[platform];
//   return path.join(dataDir, fileName);
// };

// // Generate batch ID with timestamp and platform
// const generateBatchId = (platform) => {
//   const now = new Date();
//   const timestamp = now.toISOString().replace(/[:.]/g, '').slice(0, -5);
//   return `${platform}_${timestamp}`;
// };

// // Convert platform-specific job to master job format
// const convertToMasterJob = (job, platform, batchId) => {
//   const baseJob = {
//     platform,
//     batchId,
//     scrapedAt: new Date(),
//     isActive: true,
//     processed: true,
//     source: 'file_upload'
//   };

//   if (platform === 'linkedin') {
//     return {
//       ...baseJob,
//       // Core identifiers
//       jobId: job.id,
//       id: job.id,
      
//       // Basic job information
//       title: job.title,
//       linkedinUrl: job.linkedinUrl,
//       descriptionText: job.descriptionText,
      
//       // Job details
//       postedDate: job.postedDate ? new Date(job.postedDate) : null,
//       expireAt: job.expireAt ? new Date(job.expireAt) : null,
//       employmentType: job.employmentType,
//       workplaceType: job.workplaceType,
//       easyApplyUrl: job.easyApplyUrl,
//       applicants: job.applicants,
//       views: job.views,
//       jobApplicationLimitReached: job.jobApplicationLimitReached,
//       applyMethod: job.applyMethod,
//       salary: job.salary,
//       url: job.linkedinUrl,
      
//       // Company information (nested structure in LinkedIn)
//       'company.linkedinUrl': job['company.linkedinUrl'],
//       'company.logo': job['company.logo'],
//       'company.website': job['company.website'],
//       'company.name': job['company.name'],
//       'company.employeeCount': job['company.employeeCount'],
//       'company.followerCount': job['company.followerCount'],
//       'company.description': job['company.description'],
//       'company.specialities': job['company.specialities'] || [],
//       'company.industries': job['company.industries'] || [],
//       'company.locations': job['company.locations'] || [],
      
//       // LinkedIn KPI fields
//       kpi_jd_quality: job.kpi_jd_quality,
//       kpi_domain_fit: job.kpi_domain_fit,
//       kpi_seniority_alignment: job.kpi_seniority_alignment,
//       kpi_location_priority: job.kpi_location_priority,
//       kpi_company_specialties: job.kpi_company_specialties,
//       kpi_salary: job.kpi_salary,
//       kpi_company_size: job.kpi_company_size,
//       kpi_company_popularity: job.kpi_company_popularity,
//       kpi_industry_match: job.kpi_industry_match,
//       kpi_job_popularity: job.kpi_job_popularity,
//       kpi_job_freshness: job.kpi_job_freshness,
//       kpi_employment_type: job.kpi_employment_type,
//       kpi_contact_info: job.kpi_contact_info,
//       kpi_skills_explicitness: job.kpi_skills_explicitness,
//       kpi_experience_threshold: job.kpi_experience_threshold,
      
//       // AI Analysis fields
//       predicted_domain: job.predicted_domain,
//       final_score: job.final_score,
//       tier: job.tier,
//       proposal: job.proposal || '',
//       ai_remark: job.ai_remark
//     };
    
//   } else if (platform === 'upwork') {
//     return {
//       ...baseJob,
//       // Core identifiers
//       jobId: job.jobId,
      
//       // Basic job information
//       title: job.title,
//       description: job.description,
//       url: job.url,
      
//       // Upwork specific fields
//       isContractToHire: job.isContractToHire,
//       isPaymentMethodVerified: job.isPaymentMethodVerified,
//       level: job.level,
//       contractorTier: job.contractorTier,
//       companyId: job.companyId,
//       companyIndustry: job.companyIndustry,
//       companyContractDate: job.companyContractDate ? new Date(job.companyContractDate) : null,
//       buyerScore: job.buyerScore,
//       buyerTotalAssignments: job.buyerTotalAssignments,
//       buyerTotalJobsWithHires: job.buyerTotalJobsWithHires,
//       buyerActiveAssignmentsCount: job.buyerActiveAssignmentsCount,
//       buyerFeedbackCount: job.buyerFeedbackCount,
//       buyerOpenJobsCount: job.buyerOpenJobsCount,
//       buyerPostedJobsCount: job.buyerPostedJobsCount,
//       buyerAvgHourlyRate: job.buyerAvgHourlyRate,
//       minHourlyRate: job.minHourlyRate,
//       maxHourlyRate: job.maxHourlyRate,
//       hourlyType: job.hourlyType,
//       hourlyWeeks: job.hourlyWeeks,
//       minHoursWeek: job.minHoursWeek,
//       lastBuyerActivity: job.lastBuyerActivity,
//       clientTotalHours: job.clientTotalHours,
//       clientTotalSpend: job.clientTotalSpend,
//       clientRisingTalent: job.clientRisingTalent,
//       jobType: job.jobType,
//       fixedBudget: job.fixedBudget,
//       fixedDurationLabel: job.fixedDurationLabel,
//       numberOfPositionsToHire: job.numberOfPositionsToHire,
//       premium: job.premium,
      
//       // Arrays
//       tags: job.tags || [],
//       skills: job.skills || [],
//       openJobs: job.openJobs || [],
//       questions: job.questions || [],
//       qualificationsCountries: job.qualificationsCountries || [],
//       qualificationsLanguages: job.qualificationsLanguages || [],
//       qualificationsMinJobSuccessScore: job.qualificationsMinJobSuccessScore,
//       qualificationsRisingTalent: job.qualificationsRisingTalent,
//       qualificationsLocationCheckRequired: job.qualificationsLocationCheckRequired,
      
//       // Location
//       city: job.city,
//       country: job.country,
//       countryTimezone: job.countryTimezone,
//       utcOffsetMillis: job.utcOffsetMillis,
      
//       // Company details
//       companyName: job.companyName,
//       companySize: job.companySize,
//       companyIsEDCReplicated: job.companyIsEDCReplicated,
      
//       // Categories
//       category: job.category,
//       categoryGroup: job.categoryGroup,
//       occupation: job.occupation,
//       status: job.status,
      
//       // Timestamps
//       ts_create: job.ts_create ? new Date(job.ts_create) : null,
//       ts_publish: job.ts_publish ? new Date(job.ts_publish) : null,
//       ts_sourcing: job.ts_sourcing ? new Date(job.ts_sourcing) : null,
      
//       // Upwork KPI fields
//       kpi_budget_attractiveness: job.kpi_budget_attractiveness,
//       kpi_avg_hourly_rate: job.kpi_avg_hourly_rate,
//       kpi_hiring_rate: job.kpi_hiring_rate,
//       kpi_job_engagement: job.kpi_job_engagement,
//       kpi_job_title_relevance: job.kpi_job_title_relevance,
//       kpi_client_tenure: job.kpi_client_tenure,
//       kpi_client_hiring_history: job.kpi_client_hiring_history,
//       kpi_client_active_assignments: job.kpi_client_active_assignments,
//       kpi_client_feedback_volume: job.kpi_client_feedback_volume,
//       kpi_client_open_jobs: job.kpi_client_open_jobs,
//       kpi_skill_match: job.kpi_skill_match,
//       kpi_weekly_hour_commitment: job.kpi_weekly_hour_commitment,
//       kpi_client_rating: job.kpi_client_rating,
//       kpi_client_activity_recency: job.kpi_client_activity_recency,
//       kpi_payment_verification: job.kpi_payment_verification,
//       kpi_job_level_match: job.kpi_job_level_match,
      
//       // AI Analysis fields
//       final_weighted_score: job.final_weighted_score,
//       tier: job.tier,
//       proposal: job.proposal || '',
//       ai_remark: job.ai_remark
//     };
//   } else if (platform === 'indeed') {
//     return {
//       ...baseJob,
//       // Core identifiers
//       jobId: job.jobId || job.id,
      
//       // Basic job information
//       title: job.title,
//       description: job.description,
//       url: job.url,
      
//       // Indeed specific fields (add based on actual data structure)
//       postedDate: job.postedDate ? new Date(job.postedDate) : null,
//       employmentType: job.employmentType,
//       salary: job.salary,
//       companyName: job.companyName,
//       city: job.city,
//       country: job.country,
      
//       // AI Analysis fields
//       final_score: job.final_score,
//       tier: job.tier,
//       ai_remark: job.ai_remark
//     };
//   } else if (platform === 'glassdoor') {
//     return {
//       ...baseJob,
//       // Core identifiers
//       jobId: job.jobId || job.id,
      
//       // Basic job information
//       title: job.title,
//       description: job.description,
//       url: job.url,
      
//       // Glassdoor specific fields (add based on actual data structure)
//       postedDate: job.postedDate ? new Date(job.postedDate) : null,
//       employmentType: job.employmentType,
//       salary: job.salary,
//       companyName: job.companyName,
//       companyRating: job.companyRating,
//       city: job.city,
//       country: job.country,
      
//       // AI Analysis fields
//       final_score: job.final_score,
//       tier: job.tier,
//       ai_remark: job.ai_remark
//     };
//   }

//   return baseJob;
// };

// // Upsert master job (insert or update) - Preserves company-managed fields
// const upsertMasterJob = async (jobData) => {
//   try {
//     // Check if job already exists
//     const existingJob = await MasterJob.findOne({ 
//       platform: jobData.platform, 
//       jobId: jobData.jobId 
//     });

//     if (existingJob) {
//       // Update existing job but preserve company-managed fields
//       const updateData = { ...jobData };
      
//       // Remove preserved fields from update data
//       PRESERVED_FIELDS.forEach(field => {
//         delete updateData[field];
//       });

//       const result = await MasterJob.updateOne(
//         { 
//           platform: jobData.platform, 
//           jobId: jobData.jobId 
//         },
//         { $set: updateData },
//         { upsert: false }
//       );

//       return {
//         matched: result.matchedCount > 0,
//         upserted: false,
//         modified: result.modifiedCount > 0
//       };
//     } else {
//       // Insert new job with default values for company-managed fields
//       const newJobData = {
//         ...jobData,
//         // Initialize company-managed fields with defaults
//         currentStatus: 'not_engaged',
//         statusHistory: [],
//         comments: [],
//         ae_comment: '',
//         ae_score: [],
//         proposal: jobData.proposal || '',
//         distributedTo: []
//       };

//       const result = await MasterJob.create(newJobData);

//       return {
//         matched: false,
//         upserted: true,
//         modified: false
//       };
//     }
//   } catch (error) {
//     throw new Error(`Failed to save job ${jobData.jobId}: ${error.message}`);
//   }
// };

// // Process job batch and save to database
// const processJobBatch = async (jobs, platform, batchId, jobBatch) => {
//   let saved = 0;
//   let duplicates = 0;
//   let errors = 0;

//   console.log(`Processing ${jobs.length} jobs for batch ${batchId}`);

//   for (let i = 0; i < jobs.length; i++) {
//     try {
//       const job = jobs[i];
      
//       // Debug logging for first job
//       if (i === 0) {
//         console.log('Sample job structure:', JSON.stringify(job, null, 2));
//         console.log('Available keys in first job:', Object.keys(job));
        
//         // Check specifically for ID fields
//         const idFields = ['id', 'jobId', 'linkedinId', 'postId', '_id', 'url'];
//         idFields.forEach(field => {
//           if (job[field]) {
//             console.log(`Found ID field: ${field} = ${job[field]}`);
//           }
//         });
//       }
      
//       const masterJobData = convertToMasterJob(job, platform, batchId);
      
//       // Validate that we have a jobId
//       if (!masterJobData.jobId) {
//         console.error(`Missing jobId for job at index ${i}:`, job);
//         errors++;
//         continue;
//       }
      
//       // Try to save the job
//       const result = await upsertMasterJob(masterJobData);
      
//       if (result.upserted) {
//         saved++;
//       } else if (result.matched) {
//         duplicates++;
//       }

//       // Update progress every 100 jobs
//       if ((i + 1) % 100 === 0) {
//         console.log(`Processed ${i + 1}/${jobs.length} jobs for batch ${batchId}`);
//       }

//     } catch (error) {
//       errors++;
//       console.error(`Error processing job ${i}:`, error.message);
      
//       // Log error to batch
//       await JobBatch.findOneAndUpdate(
//         { batchId },
//         {
//           $push: {
//             errorLogs: {
//               error: error.message,
//               jobId: jobs[i]?.id || jobs[i]?.jobId || `index_${i}`,
//               timestamp: new Date()
//             }
//           }
//         }
//       );
//     }
//   }

//   console.log(`Batch processing completed: ${saved} saved, ${duplicates} duplicates, ${errors} errors`);
//   return { saved, duplicates, errors };
// };

// // Upload scored jobs from file to master database (NO AUTO-DISTRIBUTION)
// const uploadScoredJobsFromFile = async (req, res) => {
//   try {
//     const { platform } = req.body;
    
//     if (!platform) {
//       return res.status(400).json({ 
//         error: 'Platform is required' 
//       });
//     }

//     // Validate platform
//     if (!['linkedin', 'upwork', 'indeed', 'glassdoor'].includes(platform)) {
//       return res.status(400).json({ 
//         error: 'Invalid platform. Must be: linkedin, upwork, indeed, or glassdoor' 
//       });
//     }

//     // Auto-generate file path based on platform
//     const filePath = getFilePath(platform);
    
//     // Check if file exists
//     if (!fs.existsSync(filePath)) {
//       return res.status(400).json({ 
//         error: `File not found: ${filePath}`,
//         hint: `Please ensure the scored ${platform} jobs file exists in the data folder`
//       });
//     }

//     // Auto-generate batch ID with date, time, and platform
//     const batchId = generateBatchId(platform);

//     // Create job batch record
//     let jobBatch = new JobBatch({
//       batchId,
//       platform,
//       status: 'running',
//       executedBy: req.user?.username || 'api_upload',
//       parameters: {
//         filePath,
//         uploadedAt: new Date()
//       }
//     });
//     await jobBatch.save();

//     console.log(`Starting upload for ${platform} jobs from: ${filePath}`);
//     console.log(`Batch ID: ${batchId}`);

//     // Read and parse the JSON file
//     let jobs = [];
//     try {
//       const fileContent = fs.readFileSync(filePath, 'utf-8');
//       jobs = JSON.parse(fileContent);
      
//       if (!Array.isArray(jobs)) {
//         throw new Error('File must contain an array of jobs');
//       }

//       console.log(`Found ${jobs.length} jobs in the file`);
//     } catch (parseError) {
//       jobBatch.status = 'failed';
//       jobBatch.errors = jobBatch.errors || [];
//       jobBatch.errors.push({
//         error: `File parsing error: ${parseError.message}`,
//         timestamp: new Date()
//       });
//       await jobBatch.save();
      
//       return res.status(400).json({ 
//         error: 'Invalid JSON file format', 
//         details: parseError.message,
//         filePath 
//       });
//     }

//     // Process and save jobs (NO DISTRIBUTION)
//     const results = await processJobBatch(jobs, platform, batchId, jobBatch);

//     // Update batch status
//     jobBatch.status = 'completed';
//     jobBatch.endTime = new Date();
//     jobBatch.stats = jobBatch.stats || {};
//     jobBatch.stats.totalJobsScraped = jobs.length;
//     jobBatch.stats.newJobsAdded = results.saved;
//     jobBatch.stats.duplicatesSkipped = results.duplicates;
//     jobBatch.stats.errorsEncountered = results.errors;
//     await jobBatch.save();

//     console.log(`Upload completed - Saved: ${results.saved}, Duplicates: ${results.duplicates}, Errors: ${results.errors}`);

//     res.json({
//       success: true,
//       message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} jobs uploaded successfully`,
//       batchId,
//       filePath,
//       results: {
//         totalProcessed: jobs.length,
//         saved: results.saved,
//         duplicates: results.duplicates,
//         errors: results.errors,
//         platform
//       },
//       note: 'Jobs saved to MasterJob collection. Use distribution endpoints to send to companies.'
//     });

//   } catch (error) {
//     console.error('Upload error:', error);
//     res.status(500).json({ 
//       error: 'Failed to upload jobs', 
//       details: error.message 
//     });
//   }
// };

// // Get master jobs with filtering
// const getMasterJobs = async (req, res) => {
//   try {
//     const {
//       platform,
//       status,
//       search,
//       page = 1,
//       limit = 50,
//       sortBy = 'createdAt',
//       sortOrder = 'desc'
//     } = req.query;

//     // Build query
//     const query = { isActive: true };
    
//     if (platform) {
//       query.platform = platform;
//     }
    
//     if (status) {
//       query.currentStatus = status;
//     }
    
//     if (search) {
//       query.$or = [
//         { title: new RegExp(search, 'i') },
//         { companyName: new RegExp(search, 'i') },
//         { 'company.name': new RegExp(search, 'i') },
//         { jobId: new RegExp(search, 'i') }
//       ];
//     }

//     // Get jobs with pagination
//     const jobs = await MasterJob.find(query)
//       .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .lean();

//     const total = await MasterJob.countDocuments(query);

//     res.json({
//       jobs,
//       pagination: {
//         current: parseInt(page),
//         pages: Math.ceil(total / limit),
//         total,
//         hasNext: page < Math.ceil(total / limit),
//         hasPrev: page > 1
//       }
//     });

//   } catch (error) {
//     console.error('Get master jobs error:', error);
//     res.status(500).json({ 
//       error: 'Failed to fetch master jobs', 
//       details: error.message 
//     });
//   }
// };

// // Get job batches
// const getJobBatches = async (req, res) => {
//   try {
//     const { page = 1, limit = 20 } = req.query;

//     const batches = await JobBatch.find()
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .lean();

//     const total = await JobBatch.countDocuments();

//     res.json({
//       batches,
//       pagination: {
//         current: parseInt(page),
//         pages: Math.ceil(total / limit),
//         total,
//         hasNext: page < Math.ceil(total / limit),
//         hasPrev: page > 1
//       }
//     });

//   } catch (error) {
//     console.error('Get job batches error:', error);
//     res.status(500).json({ 
//       error: 'Failed to fetch job batches', 
//       details: error.message 
//     });
//   }
// };

// // Delete batch
// const deleteBatch = async (req, res) => {
//   try {
//     const { batchId } = req.params;

//     const batch = await JobBatch.findOneAndDelete({ batchId });

//     if (!batch) {
//       return res.status(404).json({ error: 'Batch not found' });
//     }

//     res.json({
//       message: 'Batch deleted successfully',
//       batchId
//     });

//   } catch (error) {
//     console.error('Delete batch error:', error);
//     res.status(500).json({ 
//       error: 'Failed to delete batch', 
//       details: error.message 
//     });
//   }
// };

// // Distribute to specific companies
// const distributeToSpecificCompanies = async (req, res) => {
//   try {
//     const { companyIds } = req.body;
    
//     if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
//       return res.status(400).json({ 
//         error: 'companyIds array is required and must not be empty' 
//       });
//     }

//     // Get selected companies
//     const companies = await Company.find({
//       _id: { $in: companyIds },
//       isActive: true
//     });

//     if (companies.length === 0) {
//       return res.status(400).json({ 
//         error: 'No active companies found with provided IDs' 
//       });
//     }

//     // Get all undistributed jobs
//     const undistributedJobs = await MasterJob.find({
//       isActive: true,
//       distributedTo: { $size: 0 }
//     });

//     if (undistributedJobs.length === 0) {
//       return res.json({
//         success: true,
//         message: 'No undistributed jobs found',
//         companiesNotified: companies.length,
//         jobsDistributed: 0
//       });
//     }

//     let totalDistributed = 0;
//     const companyResults = [];

//     for (const company of companies) {
//       try {
//         const filteredJobs = undistributedJobs; // You can add filtering logic here
        
//         // Create CompanyJob entries (shadow view)
//         const companyJobs = filteredJobs.map(job => ({
//           masterJobId: job._id,
//           companyId: company._id,
//           currentStatus: 'not_engaged',
//           distributedAt: new Date(),
//           statusHistory: [{
//             status: 'not_engaged',
//             username: 'system',
//             date: new Date(),
//             notes: 'Job distributed by admin'
//           }]
//         }));

//         await CompanyJob.insertMany(companyJobs, { ordered: false });
        
//         totalDistributed += companyJobs.length;
        
//         companyResults.push({
//           companyId: company._id,
//           companyName: company.name,
//           jobsDistributed: companyJobs.length,
//           errors: 0
//         });

//       } catch (error) {
//         console.error(`Distribution error for company ${company.name}:`, error);
//         companyResults.push({
//           companyId: company._id,
//           companyName: company.name,
//           jobsDistributed: 0,
//           errors: 1,
//           errorMessage: error.message
//         });
//       }
//     }

//     // Mark jobs as distributed if successfully distributed to at least one company
//     if (totalDistributed > 0) {
//       await MasterJob.updateMany(
//         { _id: { $in: undistributedJobs.map(j => j._id) } },
//         { 
//           $push: { 
//             distributedTo: { 
//               $each: companies.map(c => ({
//                 companyId: c._id,
//                 distributedAt: new Date(),
//                 status: 'delivered'
//               }))
//             } 
//           } 
//         }
//       );
//     }

//     res.json({
//       success: true,
//       message: 'Jobs distribution completed',
//       summary: {
//         totalJobs: undistributedJobs.length,
//         totalCompanies: companies.length,
//         totalDistributed,
//         avgJobsPerCompany: Math.round(totalDistributed / companies.length)
//       },
//       companyResults
//     });

//   } catch (error) {
//     console.error('Distribute to specific companies error:', error);
//     res.status(500).json({
//       error: 'Distribution failed',
//       details: error.message
//     });
//   }
// };

// // Get batch details
// const getBatchDetails = async (req, res) => {
//   try {
//     const { batchId } = req.params;

//     // Find batch by ID
//     const batch = await JobBatch.findById(batchId);

//     if (!batch) {
//       return res.status(404).json({ error: 'Batch not found' });
//     }

//     // Get jobs in this batch
//     const batchJobs = await MasterJob.find({ 
//       batchId: batch.batchId,
//       isActive: true 
//     }).select('jobId title companyName company.name platform tier final_score final_weighted_score currentStatus');

//     // Get distribution stats for this batch
//     const distributionStats = await MasterJob.aggregate([
//       { $match: { batchId: batch.batchId } },
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

//     res.json({
//       batch,
//       jobs: {
//         total: batchJobs.length,
//         list: batchJobs
//       },
//       distribution: {
//         totalDistributed: distributionStats.length,
//         companies: distributionStats
//       }
//     });

//   } catch (error) {
//     console.error('Get batch details error:', error);
//     res.status(500).json({ 
//       error: 'Failed to get batch details', 
//       details: error.message 
//     });
//   }
// };

// module.exports = {
//   uploadScoredJobsFromFile,
//   getMasterJobs,
//   getJobBatches,
//   deleteBatch,
//   getBatchDetails,
//   distributeToSpecificCompanies
// };
// controllers/masterJobController.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const MasterJob = require('../models/MasterJob');
const JobBatch = require('../models/JobBatch');
const Company = require('../models/Company');
const CompanyJob = require('../models/CompanyJob');
const crypto = require('crypto');
const PRESERVED_FIELDS = ['currentStatus','statusHistory','comments','ae_comment','ae_score','proposal','distributedTo'];

const getFilePath = (platform) => {
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const fileMap = {
    linkedin: 'scored_linkedin_jobs.json',
    upwork: 'final_jobs_upwork.json',
    indeed: 'scored_indeed_jobs.json',
    glassdoor: 'scored_glassdoor_jobs.json',
    google: 'scraped_jobs.json'
  };
  return path.join(dataDir, fileMap[platform]);
};


// Top-level config in masterJobController.js
const COMPANY_MANAGED_FIELDS = [
  'ae_comment',
  'ae_score',
  'proposal',
  'ae_pitched',
  'estimated_budget',
];
const generateBatchId = (platform) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, -5);
  return `${platform}_${timestamp}`;
};

// const convertToMasterJob = (job, platform, batchId) => {
//   const baseJob = { platform, batchId, scrapedAt: new Date(), isActive: true, processed: true, source: 'file_upload' };
//   if (platform === 'linkedin') {
//     return {
//       ...baseJob,
//       jobId: job.id,
//       id: job.id,
//       title: job.title,
//       linkedinUrl: job.linkedinUrl,
//       descriptionText: job.descriptionText,
//       postedDate: job.postedDate ? new Date(job.postedDate) : null,
//       expireAt: job.expireAt ? new Date(job.expireAt) : null,
//       employmentType: job.employmentType,
//       workplaceType: job.workplaceType,
//       easyApplyUrl: job.easyApplyUrl,
//       applicants: job.applicants,
//       views: job.views,
//       jobApplicationLimitReached: job.jobApplicationLimitReached,
//       applyMethod: job.applyMethod,
//       salary: job.salary,
//       url: job.linkedinUrl,
//       'company.linkedinUrl': job['company.linkedinUrl'],
//       'company.logo': job['company.logo'],
//       'company.website': job['company.website'],
//       'company.name': job['company.name'],
//       'company.employeeCount': job['company.employeeCount'],
//       'company.followerCount': job['company.followerCount'],
//       'company.description': job['company.description'],
//       'company.specialities': job['company.specialities'] || [],
//       'company.industries': job['company.industries'] || [],
//       'company.locations': job['company.locations'] || [],
//       kpi_jd_quality: job.kpi_jd_quality,
//       kpi_domain_fit: job.kpi_domain_fit,
//       kpi_seniority_alignment: job.kpi_seniority_alignment,
//       kpi_location_priority: job.kpi_location_priority,
//       kpi_company_specialties: job.kpi_company_specialties,
//       kpi_salary: job.kpi_salary,
//       kpi_company_size: job.kpi_company_size,
//       kpi_company_popularity: job.kpi_company_popularity,
//       kpi_industry_match: job.kpi_industry_match,
//       kpi_job_popularity: job.kpi_job_popularity,
//       kpi_job_freshness: job.kpi_job_freshness,
//       kpi_employment_type: job.kpi_employment_type,
//       kpi_contact_info: job.kpi_contact_info,
//       kpi_skills_explicitness: job.kpi_skills_explicitness,
//       kpi_experience_threshold: job.kpi_experience_threshold,
//       predicted_domain: job.predicted_domain,
//       final_score: job.final_score,
//       tier: job.tier,
//       proposal: job.proposal || '',
//       ai_remark: job.ai_remark
//     };
//   }
//   if (platform === 'upwork') {
//     return {
//       ...baseJob,
//       jobId: job.jobId,
//       title: job.title,
//       description: job.description,
//       url: job.url,
//       isContractToHire: job.isContractToHire,
//       isPaymentMethodVerified: job.isPaymentMethodVerified,
//       level: job.level,
//       contractorTier: job.contractorTier,
//       companyId: job.companyId,
//       companyIndustry: job.companyIndustry,
//       companyContractDate: job.companyContractDate ? new Date(job.companyContractDate) : null,
//       buyerScore: job.buyerScore,
//       buyerTotalAssignments: job.buyerTotalAssignments,
//       buyerTotalJobsWithHires: job.buyerTotalJobsWithHires,
//       buyerActiveAssignmentsCount: job.buyerActiveAssignmentsCount,
//       buyerFeedbackCount: job.buyerFeedbackCount,
//       buyerOpenJobsCount: job.buyerOpenJobsCount,
//       buyerPostedJobsCount: job.buyerPostedJobsCount,
//       buyerAvgHourlyRate: job.buyerAvgHourlyRate,
//       minHourlyRate: job.minHourlyRate,
//       maxHourlyRate: job.maxHourlyRate,
//       hourlyType: job.hourlyType,
//       hourlyWeeks: job.hourlyWeeks,
//       minHoursWeek: job.minHoursWeek,
//       lastBuyerActivity: job.lastBuyerActivity,
//       clientTotalHours: job.clientTotalHours,
//       clientTotalSpend: job.clientTotalSpend,
//       clientRisingTalent: job.clientRisingTalent,
//       jobType: job.jobType,
//       fixedBudget: job.fixedBudget,
//       fixedDurationLabel: job.fixedDurationLabel,
//       numberOfPositionsToHire: job.numberOfPositionsToHire,
//       premium: job.premium,
//       tags: job.tags || [],
//       skills: job.skills || [],
//       openJobs: job.openJobs || [],
//       questions: job.questions || [],
//       qualificationsCountries: job.qualificationsCountries || [],
//       qualificationsLanguages: job.qualificationsLanguages || [],
//       qualificationsMinJobSuccessScore: job.qualificationsMinJobSuccessScore,
//       qualificationsRisingTalent: job.qualificationsRisingTalent,
//       qualificationsLocationCheckRequired: job.qualificationsLocationCheckRequired,
//       city: job.city,
//       country: job.country,
//       countryTimezone: job.countryTimezone,
//       utcOffsetMillis: job.utcOffsetMillis,
//       companyName: job.companyName,
//       companySize: job.companySize,
//       companyIsEDCReplicated: job.companyIsEDCReplicated,
//       category: job.category,
//       categoryGroup: job.categoryGroup,
//       occupation: job.occupation,
//       status: job.status,
//       ts_create: job.ts_create ? new Date(job.ts_create) : null,
//       ts_publish: job.ts_publish ? new Date(job.ts_publish) : null,
//       ts_sourcing: job.ts_sourcing ? new Date(job.ts_sourcing) : null,
//       kpi_budget_attractiveness: job.kpi_budget_attractiveness,
//       kpi_avg_hourly_rate: job.kpi_avg_hourly_rate,
//       kpi_hiring_rate: job.kpi_hiring_rate,
//       kpi_job_engagement: job.kpi_job_engagement,
//       kpi_job_title_relevance: job.kpi_job_title_relevance,
//       kpi_client_tenure: job.kpi_client_tenure,
//       kpi_client_hiring_history: job.kpi_client_hiring_history,
//       kpi_client_active_assignments: job.kpi_client_active_assignments,
//       kpi_client_feedback_volume: job.kpi_client_feedback_volume,
//       kpi_client_open_jobs: job.kpi_client_open_jobs,
//       kpi_skill_match: job.kpi_skill_match,
//       kpi_weekly_hour_commitment: job.kpi_weekly_hour_commitment,
//       kpi_client_rating: job.kpi_client_rating,
//       kpi_client_activity_recency: job.kpi_client_activity_recency,
//       kpi_payment_verification: job.kpi_payment_verification,
//       kpi_job_level_match: job.kpi_job_level_match,
//       final_weighted_score: job.final_weighted_score,
//       tier: job.tier,
//       proposal: job.proposal || '',
//       ai_remark: job.ai_remark
//     };
//   }
//   // indeed/glassdoor fall back omitted here for brevity (already present in your file)
//   return baseJob;
// };

// const upsertMasterJob = async (jobData) => {
//   const existingJob = await MasterJob.findOne({ platform: jobData.platform, jobId: jobData.jobId });
//   if (existingJob) {
//     const updateData = { ...jobData };
//     PRESERVED_FIELDS.forEach(f => delete updateData[f]);
//     const result = await MasterJob.updateOne(
//       { platform: jobData.platform, jobId: jobData.jobId },
//       { $set: updateData },
//       { upsert: false }
//     );
//     return { matched: result.matchedCount > 0, upserted: false, modified: result.modifiedCount > 0 };
//   } else {
//     const newJobData = {
//       ...jobData,
//       currentStatus: 'not_engaged',
//       statusHistory: [],
//       comments: [],
//       ae_comment: '',
//       ae_score: [],
//       proposal: jobData.proposal || '',
//       distributedTo: []
//     };
//     await MasterJob.create(newJobData);
//     return { matched: false, upserted: true, modified: false };
//   }
// };


// Updates existing record (preserving company-managed fields) or inserts new




const convertToMasterJob = (job, platform, batchId) => {
  const baseJob = { platform, batchId, scrapedAt: new Date(), isActive: true, processed: true, source: 'file_upload' };

  if (platform === 'linkedin') {
    return {
      ...baseJob,
      jobId: job.id,
      id: job.id,
      title: job.title,
      linkedinUrl: job.linkedinUrl,
      descriptionText: job.descriptionText,
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
      url: job.linkedinUrl,
      'company.linkedinUrl': job['company.linkedinUrl'],
      'company.logo': job['company.logo'],
      'company.website': job['company.website'],
      'company.name': job['company.name'],
      'company.employeeCount': job['company.employeeCount'],
      'company.followerCount': job['company.followerCount'],
      'company.description': job['company.description'],
      // 'company.specialities': job['company.specialities'] || [],
      // 'company.industries': job['company.industries'] || [],
      // 'company.locations': job['company.locations'] || [],
      
      // FIXED: Transform company.specialities to array of strings
'company.specialities': Array.isArray(job['company.specialities']) 
? job['company.specialities'].map(specialty => 
    typeof specialty === 'string' ? specialty : String(specialty)
  ) 
: [],

// FIXED: Transform company.industries from objects to strings  
'company.industries': Array.isArray(job['company.industries']) 
? job['company.industries'].map(industry => 
    typeof industry === 'string' ? industry : (industry.name || String(industry))
  ) 
: [],

// FIXED: Ensure proper nested object structure for locations
'company.locations': Array.isArray(job['company.locations']) 
? job['company.locations'].map(location => {
    if (typeof location === 'object' && location !== null) {
      return {
        city: location.city || undefined,
        state: location.state || undefined, 
        country: location.country || undefined
      };
    }
    return { city: String(location) };
  })
: [],

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
      predicted_domain: job.predicted_domain,
      final_score: job.final_score,
      tier: job.tier,
      proposal: job.proposal || '',
      ai_remark: job.ai_remark
    };
  }

  if (platform === 'upwork') {
    return {
      ...baseJob,
      jobId: job.jobId,
      title: job.title,
      description: job.description,
      url: job.url,
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
      tags: job.tags || [],
      skills: job.skills || [],
      openJobs: job.openJobs || [],
      questions: job.questions || [],
      qualificationsCountries: job.qualificationsCountries || [],
      qualificationsLanguages: job.qualificationsLanguages || [],
      qualificationsMinJobSuccessScore: job.qualificationsMinJobSuccessScore,
      qualificationsRisingTalent: job.qualificationsRisingTalent,
      qualificationsLocationCheckRequired: job.qualificationsLocationCheckRequired,
      city: job.city,
      country: job.country,
      countryTimezone: job.countryTimezone,
      utcOffsetMillis: job.utcOffsetMillis,
      companyName: job.companyName,
      companySize: job.companySize,
      companyIsEDCReplicated: job.companyIsEDCReplicated,
      category: job.category,
      categoryGroup: job.categoryGroup,
      occupation: job.occupation,
      status: job.status,
      ts_create: job.ts_create ? new Date(job.ts_create) : null,
      ts_publish: job.ts_publish ? new Date(job.ts_publish) : null,
      ts_sourcing: job.ts_sourcing ? new Date(job.ts_sourcing) : null,
      kpi_budget_attractiveness: job.kpi_budget_attractiveness,
      kpi_avg_hourly_rate: job.kpi_avg_hourly_rate,
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
      final_weighted_score: job.final_weighted_score,
      tier: job.tier,
      proposal: job.proposal || '',
      ai_remark: job.ai_remark
    };
  }

  if (platform === 'google') {
    const jobId =
      job.primary_hash ||
      job.job_id ||
      crypto.createHash('md5').update(`${job.title || ''}|${job.company || job.company_name || ''}|${job.share_link || ''}`).digest('hex');

    return {
      ...baseJob,

      jobId,
      title: job.title || '',
      descriptionText: job.description_preview || '',
      url: job.share_link || '',

      companyName: job.company || job.company_name || '',
      'company.name': job.company || job.company_name || '',
      'company.specialities': Array.isArray(job['company.specialities']) ? job['company.specialities'] : [],
      'company.industries': Array.isArray(job['company.industries']) ? job['company.industries'] : [],
      'company.locations': Array.isArray(job['company.locations']) ? job['company.locations'] : [],

      city: job.location || undefined,
      country: job.country || null,
      via: job.via || undefined,
      sourceUrl: job.share_link || '',
      jobBoard: 'google_jobs',

      employmentType: job.job_type || null,
      workplaceType: job.work_arrangement || null,
      experienceLevel: job.experience_level || null,
      contractType: job.contract_type || null,

      salary: job.salary_range || job.hourly_rate || null,    // Mixed
      hourlyRateRange: job.hourly_rate || undefined,          // Mixed (optional)

      postedText: job.posted_time || null,
      postedDate: job.posted_at_exact ? new Date(job.posted_at_exact) : null,

      benefits: Array.isArray(job.benefits) ? job.benefits : [],
      detected_extensions: job.detected_extensions || undefined,
      extensions: Array.isArray(job.extensions) ? job.extensions : undefined,
      job_highlights: Array.isArray(job.job_highlights) ? job.job_highlights : undefined,
      apply_options: Array.isArray(job.apply_options) ? job.apply_options : undefined,
      thumbnail: job.thumbnail || undefined,
      description_preview: job.description_preview || undefined,

      source_query: job.source_query || undefined,
      primary_hash: job.primary_hash || undefined,
      secondary_hash: job.secondary_hash || undefined,

      scrapedAt: job.scraped_at ? new Date(job.scraped_at) : baseJob.scrapedAt
    };
  }

  return baseJob;
};
const upsertMasterJob = async (jobData) => {
  const existingJob = await MasterJob.findOne({
    platform: jobData.platform,
    jobId: jobData.jobId
  });

  // if (existingJob) {
  //   const updateData = { ...jobData };
  //   // never overwrite company-managed fields
  //   PRESERVED_FIELDS.forEach(field => {
  //     delete updateData[field];
  //   });

  //   const result = await MasterJob.updateOne(
  //     { platform: jobData.platform, jobId: jobData.jobId },
  //     { $set: updateData },
  //     { upsert: false }
  //   );

  //   return {
  //     matched: true,
  //     updated: result.modifiedCount > 0,   // was duplicate, now updated if any change
  //     upserted: false
  //   };
  // } else {
  //   const newJobData = {
  //     ...jobData,
  //     currentStatus: 'not_engaged',
  //     statusHistory: [],
  //     comments: [],
  //     ae_comment: '',
  //     ae_score: [],
  //     proposal: jobData.proposal || '',
  //     distributedTo: []
  //   };

  //   await MasterJob.create(newJobData);
  //   return {
  //     matched: false,
  //     updated: false,
  //     upserted: true
  //   };
  // }
   // never write company-managed fields to MasterJob
   const updateData = { ...jobData };
   COMPANY_MANAGED_FIELDS.forEach(f => delete updateData[f]);
 
   // purge these fields from old docs too
   const unsetMap = {};
   COMPANY_MANAGED_FIELDS.forEach(f => unsetMap[f] = "");
 
   if (existingJob) {
     const result = await MasterJob.updateOne(
       { platform: jobData.platform, jobId: jobData.jobId },
       { $set: updateData, $unset: unsetMap },
       { upsert: false }
     );
     return { matched: true, updated: result.modifiedCount > 0, upserted: false };
   } else {
     const newJobData = {
       ...updateData,
       currentStatus: 'not_engaged',
       statusHistory: [],
       comments: [],
       ae_comment: '',
       ae_score: [],
       proposal: updateData.proposal || '',
       distributedTo: []
     };
     await MasterJob.create(newJobData);
     return { matched: false, updated: false, upserted: true };
   }
};

// const processJobBatch = async (jobs, platform, batchId, jobBatch) => {
//   let saved = 0, duplicates = 0, errors = 0;
//   for (let i = 0; i < jobs.length; i++) {
//     try {
//       const job = jobs[i];
//       const masterJobData = convertToMasterJob(job, platform, batchId);
//       if (!masterJobData.jobId) { errors++; continue; }
//       const result = await upsertMasterJob(masterJobData);
//       if (result.upserted) saved++; else if (result.matched) duplicates++;
//     } catch (error) {
//       errors++;
//       await JobBatch.findOneAndUpdate(
//         { batchId },
//         { $push: { errorLogs: { error: error.message, jobId: jobs[i]?.id || jobs[i]?.jobId || `index_${i}`, timestamp: new Date() } } }
//       );
//     }
//   }
//   return { saved, duplicates, errors };
// };
// Replace your processJobBatch with this version
// Replace your processJobBatch with this version
const processJobBatch = async (jobs, platform, batchId, jobBatch) => {
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (let i = 0; i < jobs.length; i++) {
    try {
      const job = jobs[i];
      const masterJobData = convertToMasterJob(job, platform, batchId);
      if (!masterJobData.jobId) {
        errors++;
        continue;
      }

      const result = await upsertMasterJob(masterJobData);
      if (result.upserted) inserted++;
      else if (result.modified || result.matched) updated++; // count updates

      if ((i + 1) % 100 === 0) {
        console.log(`Processed ${i + 1}/${jobs.length} jobs for batch ${batchId}`);
      }
    } catch (error) {
      errors++;
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

  return { inserted, updated, errors };
};
// const uploadScoredJobsFromFile = async (req, res) => {
//   try {
//     const { platform } = req.body;
//     if (!platform) return res.status(400).json({ error: 'Platform is required' });
// // 1) Extend allowed platforms check:
// if (!['linkedin', 'upwork', 'indeed', 'glassdoor', 'google'].includes(platform)) {
//   return res.status(400).json({ error: 'Invalid platform. Must be: linkedin, upwork, indeed, glassdoor, or google' });
// }
//     const filePath = getFilePath(platform);
//     if (!fs.existsSync(filePath)) return res.status(400).json({ error: `File not found: ${filePath}` });

//     const batchId = generateBatchId(platform);
//     const jobBatch = await JobBatch.create({
//       batchId, platform, status: 'running',
//       executedBy: req.user?.username || 'api_upload',
//       parameters: { filePath, uploadedAt: new Date() }
//     });

//     const fileContent = fs.readFileSync(filePath, 'utf-8');
//     const jobs = JSON.parse(fileContent);
//     if (!Array.isArray(jobs)) return res.status(400).json({ error: 'File must contain an array of jobs' });

//     const results = await processJobBatch(jobs, platform, batchId, jobBatch);

//     // jobBatch.status = 'completed';
//     // jobBatch.endTime = new Date();
//     // jobBatch.stats = {
//     //   totalJobsScraped: jobs.length,
//     //   newJobsAdded: results.saved,
//     //   duplicatesSkipped: results.duplicates,
//     //   errorsEncountered: results.errors
//     // };
//     // await jobBatch.save();

//     // res.json({
//     //   success: true,
//     //   message: `${platform} jobs uploaded successfully`,
//     //   batchId,
//     //   filePath,
//     //   results: {
//     //     totalProcessed: jobs.length,
//     //     saved: results.saved,
//     //     duplicates: results.duplicates,
//     //     errors: results.errors,
//     //     platform
//     //   },
//     //   note: 'Jobs saved to MasterJob. Use distribution endpoints to send to companies.'
//     // });
//     // After: const results = await processJobBatch(...)
// jobBatch.status = 'completed';
// jobBatch.endTime = new Date();
// jobBatch.stats = {
//   totalJobsScraped: jobs.length,
//   newJobsAdded: results.inserted,
//   updatedExisting: results.updated,
//   errorsEncountered: results.errors
// };
// await jobBatch.save();

// res.json({
//   success: true,
//   message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} jobs uploaded successfully`,
//   batchId,
//   filePath,
//   results: {
//     totalProcessed: jobs.length,
//     inserted: results.inserted,
//     updated: results.updated,
//     errors: results.errors,
//     platform
//   },
//   note: 'Existing jobs are updated with the latest data; company-managed fields remain intact.'
// });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to upload jobs', details: error.message });
//   }
// };
// const uploadScoredJobsFromFile = async (req, res) => {
//   try {
//     const { platform } = req.body;
//     if (!platform) return res.status(400).json({ error: 'Platform is required' });
//     if (!['linkedin', 'upwork', 'indeed', 'glassdoor'].includes(platform)) {
//       return res.status(400).json({ error: 'Invalid platform. Must be: linkedin, upwork, indeed, or glassdoor' });
//     }
//     const filePath = getFilePath(platform);
//     if (!fs.existsSync(filePath)) return res.status(400).json({ error: `File not found: ${filePath}` });

//     const batchId = generateBatchId(platform);
//     const jobBatch = await JobBatch.create({
//       batchId, platform, status: 'running',
//       executedBy: req.user?.username || 'api_upload',
//       parameters: { filePath, uploadedAt: new Date() }
//     });

//     const fileContent = fs.readFileSync(filePath, 'utf-8');
//     const jobs = JSON.parse(fileContent);
//     if (!Array.isArray(jobs)) return res.status(400).json({ error: 'File must contain an array of jobs' });

//     const results = await processJobBatch(jobs, platform, batchId, jobBatch);

//     // jobBatch.status = 'completed';
//     // jobBatch.endTime = new Date();
//     // jobBatch.stats = {
//     //   totalJobsScraped: jobs.length,
//     //   newJobsAdded: results.saved,
//     //   duplicatesSkipped: results.duplicates,
//     //   errorsEncountered: results.errors
//     // };
//     // await jobBatch.save();

//     // res.json({
//     //   success: true,
//     //   message: `${platform} jobs uploaded successfully`,
//     //   batchId,
//     //   filePath,
//     //   results: {
//     //     totalProcessed: jobs.length,
//     //     saved: results.saved,
//     //     duplicates: results.duplicates,
//     //     errors: results.errors,
//     //     platform
//     //   },
//     //   note: 'Jobs saved to MasterJob. Use distribution endpoints to send to companies.'
//     // });
//     // After: const results = await processJobBatch(...)
// // After: const results = await processJobBatch(...)
// jobBatch.status = 'completed';
// jobBatch.endTime = new Date();
// jobBatch.stats = {
//   totalJobsScraped: jobs.length,
//   newJobsAdded: results.inserted,
//   updatedExisting: results.updated,
//   errorsEncountered: results.errors
// };
// await jobBatch.save();

// res.json({
//   success: true,
//   message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} jobs uploaded successfully`,
//   batchId,
//   filePath,
//   results: {
//     totalProcessed: jobs.length,
//     inserted: results.inserted,
//     updated: results.updated,
//     errors: results.errors,
//     platform
//   },
//   note: 'Existing jobs are updated with the latest data; company-managed fields remain intact.'
// });


// const uploadScoredJobsFromFile = async (req, res) => {
//   try {
//     const { platform } = req.body;
//     if (!platform) return res.status(400).json({ error: 'Platform is required' });
//     if (!['linkedin', 'upwork', 'indeed', 'glassdoor', 'google'].includes(platform)) {
//       return res.status(400).json({ error: 'Invalid platform. Must be: linkedin, upwork, indeed, glassdoor, or google' });
//     }

//     const filePath = getFilePath(platform);
//     if (!filePath) return res.status(400).json({ error: 'Unsupported platform' });
//     if (!fs.existsSync(filePath)) return res.status(400).json({ error: `File not found: ${filePath}` });

//     const batchId = generateBatchId(platform);
//     let jobBatch;
// try {
//   jobBatch = await JobBatch.create({
//     batchId, platform, status: 'running',
//     executedBy: req.user?.username || 'api_upload',
//     parameters: { filePath, uploadedAt: new Date() }
//   });
// } catch (e) {
//   if (e?.code === 11000 && String(e?.errmsg || '').includes('batchId')) {
//     // regenerate a unique batchId and retry once
//     batchId = `${batchId}-${Math.random().toString(36).slice(2, 6)}`;
//     jobBatch = await JobBatch.create({
//       batchId, platform, status: 'running',
//       executedBy: req.user?.username || 'api_upload',
//       parameters: { filePath, uploadedAt: new Date(), retry: true }
//     });
//   } else {
//     throw e;
//   }
// }
//     // const jobBatch = await JobBatch.create({
//     //   batchId,
//     //   platform,
//     //   status: 'running',
//     //   executedBy: req.user?.username || 'api_upload',
//     //   parameters: { filePath, uploadedAt: new Date() }
//     // });

//     const fileContent = fs.readFileSync(filePath, 'utf-8');
//     const raw = JSON.parse(fileContent);

//     // Normalize the input into a jobs array
//     let jobs;
//     if (platform === 'google') {
//       // Prefer enriched unique_raw_jobs (contains raw fields + derived fields)
//       jobs = Array.isArray(raw.unique_raw_jobs)
//         ? raw.unique_raw_jobs
//         : (Array.isArray(raw.extracted_unique_jobs) ? raw.extracted_unique_jobs : []);
//     } else {
//       jobs = Array.isArray(raw) ? raw : [];
//     }
//     if (!Array.isArray(jobs)) return res.status(400).json({ error: 'File must contain an array of jobs' });
//     const results = await processJobBatch(jobs, platform, batchId, jobBatch);

//     jobBatch.status = 'completed';
//     jobBatch.endTime = new Date();
//     jobBatch.stats = {
//       totalJobsScraped: jobs.length,
//       newJobsAdded: results.inserted,
//       updatedExisting: results.updated,
//       errorsEncountered: results.errors
//     };
//     await jobBatch.save();

//     res.json({
//       success: true,
//       message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} jobs uploaded successfully`,
//       batchId,
//       filePath,
//       results: {
//         totalProcessed: jobs.length,
//         inserted: results.inserted,
//         updated: results.updated,
//         errors: results.errors,
//         platform
//       },
//       note: 'Existing jobs are updated with the latest data; company-managed fields remain intact.'
//     });
//   } catch (error) {
//     console.error('Upload error:', error);
//     res.status(500).json({ error: 'Failed to upload jobs', details: error.message });
//   }
// };
const uploadScoredJobsFromFile = async (req, res) => {
  try {
    const { platform } = req.body;
    if (!platform) return res.status(400).json({ error: 'Platform is required' });
    if (!['linkedin', 'upwork', 'indeed', 'glassdoor', 'google'].includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform. Must be: linkedin, upwork, indeed, glassdoor, or google' });
    }

    const filePath = getFilePath(platform);
    if (!filePath) return res.status(400).json({ error: 'Unsupported platform' });
    if (!fs.existsSync(filePath)) return res.status(400).json({ error: `File not found: ${filePath}` });

    // unique-ish batchId with retry on duplicate
    let batchId = `${platform}_${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`;
    let jobBatch;
    try {
      jobBatch = await JobBatch.create({
        batchId, platform, status: 'running',
        executedBy: req.user?.username || 'api_upload',
        parameters: { filePath, uploadedAt: new Date() }
      });
    } catch (e) {
      if (e?.code === 11000) {
        batchId = `${batchId}-${Math.random().toString(36).slice(2, 6)}`;
        jobBatch = await JobBatch.create({
          batchId, platform, status: 'running',
          executedBy: req.user?.username || 'api_upload',
          parameters: { filePath, uploadedAt: new Date(), retry: true }
        });
      } else {
        throw e;
      }
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(fileContent);

    let jobs;
    if (platform === 'google') {
      // prefer enriched unique_raw_jobs
      jobs = Array.isArray(parsed.unique_raw_jobs)
        ? parsed.unique_raw_jobs
        : (Array.isArray(parsed.extracted_unique_jobs) ? parsed.extracted_unique_jobs : []);
    } else {
      jobs = Array.isArray(parsed) ? parsed : [];
    }
    if (!Array.isArray(jobs)) return res.status(400).json({ error: 'File must contain an array of jobs' });

    const results = await processJobBatch(jobs, platform, batchId);

    jobBatch.status = 'completed';
    jobBatch.endTime = new Date();
    jobBatch.stats = {
      totalJobsScraped: jobs.length,
      newJobsAdded: results.inserted,
      updatedExisting: results.updated,
      errorsEncountered: results.errors
    };
    await jobBatch.save();

    res.json({
      success: true,
      message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} jobs uploaded successfully`,
      batchId,
      filePath,
      results: {
        totalProcessed: jobs.length,
        inserted: results.inserted,
        updated: results.updated,
        errors: results.errors,
        platform
      },
      note: 'Company-managed fields are never stored on MasterJob.'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload jobs', details: error.message });
  }
};

const getMasterJobs = async (req, res) => {
  try {
    const { platform, status, search, page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = { isActive: true };
    if (platform) query.platform = platform;
    if (status) query.currentStatus = status;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { companyName: new RegExp(search, 'i') },
        { 'company.name': new RegExp(search, 'i') },
        { jobId: new RegExp(search, 'i') }
      ];
    }
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
    res.status(500).json({ error: 'Failed to fetch master jobs', details: error.message });
  }
};

const getJobBatches = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const batches = await JobBatch.find().sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit).lean();
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
    res.status(500).json({ error: 'Failed to fetch job batches', details: error.message });
  }
};

const deleteBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await JobBatch.findOneAndDelete({ batchId });
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    res.json({ message: 'Batch deleted successfully', batchId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete batch', details: error.message });
  }
};

// const distributeToSpecificCompanies = async (req, res) => {
//   try {
//     const { companyIds } = req.body;
//     if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
//       return res.status(400).json({ error: 'companyIds array is required and must not be empty' });
//     }
//     const companies = await Company.find({ _id: { $in: companyIds }, isActive: true });
//     if (companies.length === 0) return res.status(400).json({ error: 'No active companies found with provided IDs' });

//     const undistributedJobs = await MasterJob.find({ isActive: true, distributedTo: { $size: 0 } });
//     if (undistributedJobs.length === 0) {
//       return res.json({ success: true, message: 'No undistributed jobs found', companiesNotified: companies.length, jobsDistributed: 0 });
//     }

//     let totalDistributed = 0;
//     const companyResults = [];
//     for (const company of companies) {
//       try {
//         const companyJobs = undistributedJobs.map(job => ({
//           masterJobId: job._id,
//           companyId: company._id,
//           currentStatus: 'not_engaged',
//           distributedAt: new Date(),
//           statusHistory: [{ status: 'not_engaged', username: 'system', date: new Date(), notes: 'Job distributed by admin' }]
//         }));
//         await CompanyJob.insertMany(companyJobs, { ordered: false });
//         totalDistributed += companyJobs.length;
//         companyResults.push({ companyId: company._id, companyName: company.name, jobsDistributed: companyJobs.length, errors: 0 });
//       } catch (error) {
//         companyResults.push({ companyId: company._id, companyName: company.name, jobsDistributed: 0, errors: 1, errorMessage: error.message });
//       }
//     }

//     if (totalDistributed > 0) {
//       await MasterJob.updateMany(
//         { _id: { $in: undistributedJobs.map(j => j._id) } },
//         {
//           $push: {
//             distributedTo: {
//               $each: companies.map(c => ({ companyId: c._id, distributedAt: new Date(), status: 'delivered' }))
//             }
//           }
//         }
//       );
//     }

//     res.json({
//       success: true,
//       message: 'Jobs distribution completed',
//       summary: {
//         totalJobs: undistributedJobs.length,
//         totalCompanies: companies.length,
//         totalDistributed,
//         avgJobsPerCompany: Math.round(totalDistributed / companies.length)
//       },
//       companyResults
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Distribution failed', details: error.message });
//   }
// };

const distributeToSpecificCompanies = async (req, res) => {
  try {
    const { companyIds } = req.body;
    if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
      return res.status(400).json({ error: 'companyIds array is required and must not be empty' });
    }

    const companies = await Company.find({ 
      _id: { $in: companyIds }, 
      isActive: true,
      subscriptionStatus: { $in: ['active', 'trial'] }
    });

    if (companies.length === 0) {
      return res.status(400).json({ error: 'No active companies found with provided IDs' });
    }

    let totalDistributed = 0;
    const companyResults = [];

    for (const company of companies) {
      try {
        // Find jobs this company hasn't received yet (FIXED LOGIC)
        const jobsNotSentToCompany = await MasterJob.find({
          isActive: true,
          $or: [
            { distributedTo: { $exists: false } },
            { distributedTo: { $size: 0 } },
            { distributedTo: { $not: { $elemMatch: { companyId: company._id } } } }
          ]
        });

        if (jobsNotSentToCompany.length === 0) {
          companyResults.push({ 
            companyId: company._id, 
            companyName: company.name, 
            jobsDistributed: 0, 
            message: 'No new jobs available for this company' 
          });
          continue;
        }

        // Create company jobs
        const companyJobs = jobsNotSentToCompany.map(job => ({
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

        // Update master job to track distribution
        await MasterJob.updateMany(
          { _id: { $in: jobsNotSentToCompany.map(j => j._id) } },
          {
            $push: {
              distributedTo: {
                $each: [{
                  companyId: company._id,
                  distributedAt: new Date(),
                  status: 'delivered'
                }]
              }
            }
          }
        );

        companyResults.push({ 
          companyId: company._id, 
          companyName: company.name, 
          jobsDistributed: companyJobs.length 
        });

      } catch (error) {
        console.error(`Error distributing to company ${company.name}:`, error);
        companyResults.push({ 
          companyId: company._id, 
          companyName: company.name, 
          jobsDistributed: 0, 
          error: error.message 
        });
      }
    }

    res.json({
      success: true,
      message: 'Jobs distribution completed',
      summary: {
        companiesProcessed: companies.length,
        jobsDistributed: totalDistributed,
        companyResults
      }
    });

  } catch (error) {
    console.error('Distribution error:', error);
    res.status(500).json({ error: 'Failed to distribute jobs' });
  }
};

// NEW: moved from route inline
const getMasterJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await MasterJob.findById(jobId).lean();
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const distributionInfo = await CompanyJob.aggregate([
      { $match: { masterJobId: new mongoose.Types.ObjectId(jobId) } },
      { $lookup: { from: 'companies', localField: 'companyId', foreignField: '_id', as: 'company' } },
      { $unwind: '$company' },
      {
        $group: {
          _id: '$currentStatus',
          count: { $sum: 1 },
          companies: { $push: { name: '$company.name', status: '$currentStatus', distributedAt: '$distributedAt' } }
        }
      }
    ]);

    const totalDistributed = await CompanyJob.countDocuments({ masterJobId: jobId });

    res.json({ job, distributionInfo, totalDistributed });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get job details' });
  }
};
// controllers/masterJobController.js (add this function anywhere above module.exports)
const getBatchDetails = async (req, res) => {
  try {
    const { batchId } = req.params;

    // Find batch by ID document _id or by batchId string (support both)
    const batch = await JobBatch.findById(batchId).lean()
      || await JobBatch.findOne({ batchId }).lean();

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Jobs in this batch
    const batchJobs = await MasterJob.find({
      batchId: batch.batchId,
      isActive: true
    }).select('jobId title companyName company.name platform tier final_score final_weighted_score currentStatus').lean();

    // Distribution stats for this batch
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
        totalDistributed: distributionStats.reduce((s, x) => s + x.jobCount, 0),
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
  distributeToSpecificCompanies,
  getMasterJobDetails
};