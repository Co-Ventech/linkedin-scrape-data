// // const mongoose = require('mongoose');

// // // Unified Company Schema for all platforms
// // const UnifiedCompanySchema = new mongoose.Schema({
// //   // LinkedIn fields
// //   linkedinUrl: String,
// //   logo: String,
// //   website: String,
// //   name: String,
// //   employeeCount: mongoose.Schema.Types.Mixed,
// //   followerCount: Number,
// //   description: String,
// //   specialities: [String],
// //   industries: [String],
// //   locations: [{
// //     city: String,
// //     state: String,
// //     country: String
// //   }],
  
// //   // Upwork fields (mapped to unified structure)
// //   companyId: String,
// //   companyIndustry: String,
// //   companySize: Number,
// //   companyContractDate: Date,
  
// //   // Unified fields
// //   platform: {
// //     type: String,
// //     enum: ['linkedin', 'upwork', 'indeed', 'glassdoor'],
// //     required: true
// //   }
// // }, { _id: false });

// // // Unified Job Schema
// // const MasterJobSchema = new mongoose.Schema({
// //   // Universal identifiers
// //   jobId: { type: String, required: true },
// //   platform: {
// //     type: String,
// //     enum: ['linkedin', 'upwork', 'indeed', 'glassdoor'],
// //     required: true
// //   },
// //   originalId: String, // Platform-specific ID
  
// //   // Basic job info (unified across platforms)
// //   title: { type: String, required: true },
// //   description: String,
// //   descriptionText: String, // Plain text version
  
// //   // Company information
// //   company: UnifiedCompanySchema,
// //   companyName: String,
  
// //   // Job details
// //   employmentType: String, // full-time, part-time, contract
// //   workplaceType: String, // remote, onsite, hybrid
// //   jobType: String, // hourly, fixed-price
// //   level: String, // entry, intermediate, expert
  
// //   // Location
// //   city: String,
// //   country: String,
// //   countryTimezone: String,
  
// //   // Dates
// //   postedDate: Date,
// //   expireAt: Date,
// //   ts_create: Date,
// //   ts_publish: Date,
  
// //   // Application info
// //   url: String,
// //   linkedinUrl: String,
// //   easyApplyUrl: String,
// //   applicants: Number,
// //   views: Number,
// //   applyMethod: String,
  
// //   // Budget/Salary (unified)
// //   budget: {
// //     type: {
// //       type: String,
// //       enum: ['hourly', 'fixed', 'salary']
// //     },
// //     min: Number,
// //     max: Number,
// //     currency: String,
// //     fixedAmount: Number
// //   },
  
// //   // Skills and requirements
// //   skills: [String],
// //   tags: [String],
// //   category: String,
// //   categoryGroup: String,
// //   occupation: String,
  
// //   // Platform-specific fields (stored as flexible object)
// //   platformSpecific: mongoose.Schema.Types.Mixed,
  
// //   // AI/KPI scores (unified)
// //   scores: {
// //     domainFit: Number,
// //     budgetAttractiveness: Number,
// //     companyReputation: Number,
// //     skillMatch: Number,
// //     locationMatch: Number,
// //     overall: Number
// //   },
  
// //   // AI analysis
// //   predictedDomain: String,
// //   aiRemark: String,
// //   tier: String,
  
// //   // Scraping metadata
// //   scrapedAt: { type: Date, default: Date.now },
// //   batchId: String,
// //   isActive: { type: Boolean, default: true },
  
// //   // Distribution tracking
// //   distributedTo: [{
// //     companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
// //     distributedAt: { type: Date, default: Date.now },
// //     status: {
// //       type: String,
// //       enum: ['pending', 'delivered', 'failed'],
// //       default: 'pending'
// //     }
// //   }]
// // }, { 
// //   timestamps: true,
// //   index: { platform: 1, jobId: 1 } // Compound index for uniqueness
// // });

// // // Ensure unique jobs per platform
// // MasterJobSchema.index({ platform: 1, jobId: 1 }, { unique: true });

// // module.exports = mongoose.model('MasterJob', MasterJobSchema);

// const mongoose = require('mongoose');

// // Unified Company Schema for all platforms
// const UnifiedCompanySchema = new mongoose.Schema({
//   // LinkedIn company fields
//   linkedinUrl: String,
//   logo: String,
//   website: String,
//   name: String,
//   employeeCount: mongoose.Schema.Types.Mixed,
//   followerCount: Number,
//   description: String,
//   specialities: [String],
//   industries: [String],
//   locations: [{
//     city: String,
//     state: String,
//     country: String,
//     parsed: {
//       city: String,
//       state: String,
//       country: String
//     }
//   }],
  
//   // Upwork company fields
//   companyId: String,
//   companyIndustry: String,
//   companySize: Number,
//   companyContractDate: Date,
//   companyIsEDCReplicated: Boolean
// }, { _id: false });

// // Unified Master Job Schema
// const MasterJobSchema = new mongoose.Schema({
//   // Universal identifiers
//   jobId: { type: String, required: true },
//   platform: {
//     type: String,
//     enum: ['linkedin', 'upwork', 'indeed', 'glassdoor'],
//     required: true,
//     index: true
//   },
  
//   // Basic job information
//   title: { type: String, required: true },
//   description: String,
//   descriptionText: String,
  
//   // Company information
//   company: UnifiedCompanySchema,
//   companyName: String,
  
//   // LinkedIn specific job fields
//   linkedinUrl: String,
//   postedDate: Date,
//   expireAt: Date,
//   employmentType: String, // full-time, part-time, contract, etc.
//   workplaceType: String, // remote, onsite, hybrid
//   easyApplyUrl: String,
//   applicants: Number,
//   views: Number,
//   jobApplicationLimitReached: Boolean,
//   applyMethod: String,
//   salary: mongoose.Schema.Types.Mixed,
  
//   // Upwork specific job fields
//   isContractToHire: Boolean,
//   isPaymentMethodVerified: Boolean,
//   level: String, // entry, intermediate, expert
//   contractorTier: String,
//   buyerScore: Number,
//   buyerTotalAssignments: Number,
//   buyerTotalJobsWithHires: Number,
//   buyerActiveAssignmentsCount: Number,
//   buyerFeedbackCount: Number,
//   buyerOpenJobsCount: Number,
//   buyerPostedJobsCount: Number,
//   buyerAvgHourlyRate: Number,
//   minHourlyRate: Number,
//   maxHourlyRate: Number,
//   hourlyType: String,
//   hourlyWeeks: Number,
//   minHoursWeek: Number,
//   lastBuyerActivity: String,
//   clientTotalHours: Number,
//   clientTotalSpend: Number,
//   clientRisingTalent: Boolean,
//   jobType: String, // hourly, fixed-price
//   fixedBudget: Number,
//   fixedDurationLabel: String,
//   numberOfPositionsToHire: Number,
//   premium: Boolean,
//   openJobs: [mongoose.Schema.Types.Mixed],
//   questions: [String],
//   qualificationsCountries: [String],
//   qualificationsLanguages: [String],
//   qualificationsMinJobSuccessScore: Number,
//   qualificationsRisingTalent: Boolean,
//   qualificationsLocationCheckRequired: Boolean,
  
//   // Common fields
//   tags: [String],
//   skills: [String],
//   city: String,
//   country: String,
//   countryTimezone: String,
//   utcOffsetMillis: Number,
//   category: String,
//   categoryGroup: String,
//   occupation: String,
//   status: String, // job status from platform
//   url: String,
  
//   // Timestamps
//   ts_create: Date,
//   ts_publish: Date,
//   ts_sourcing: Date,
  
//   // LinkedIn KPI fields
//   kpi_jd_quality: mongoose.Schema.Types.Mixed,
//   kpi_domain_fit: mongoose.Schema.Types.Mixed,
//   kpi_seniority_alignment: mongoose.Schema.Types.Mixed,
//   kpi_location_priority: mongoose.Schema.Types.Mixed,
//   kpi_company_specialties: mongoose.Schema.Types.Mixed,
//   kpi_salary: mongoose.Schema.Types.Mixed,
//   kpi_company_size: mongoose.Schema.Types.Mixed,
//   kpi_company_popularity: mongoose.Schema.Types.Mixed,
//   kpi_industry_match: mongoose.Schema.Types.Mixed,
//   kpi_job_popularity: mongoose.Schema.Types.Mixed,
//   kpi_job_freshness: mongoose.Schema.Types.Mixed,
//   kpi_employment_type: mongoose.Schema.Types.Mixed,
//   kpi_contact_info: mongoose.Schema.Types.Mixed,
//   kpi_skills_explicitness: mongoose.Schema.Types.Mixed,
//   kpi_experience_threshold: mongoose.Schema.Types.Mixed,
  
//   // Upwork KPI fields
//   kpi_budget_attractiveness: mongoose.Schema.Types.Mixed,
//   kpi_avg_hourly_rate: mongoose.Schema.Types.Mixed,
//   kpi_contract_to_hire: mongoose.Schema.Types.Mixed,
//   kpi_enterprise_heuristic: mongoose.Schema.Types.Mixed,
//   kpi_hiring_rate: mongoose.Schema.Types.Mixed,
//   kpi_job_engagement: mongoose.Schema.Types.Mixed,
//   kpi_job_title_relevance: mongoose.Schema.Types.Mixed,
//   kpi_client_tenure: mongoose.Schema.Types.Mixed,
//   kpi_client_hiring_history: mongoose.Schema.Types.Mixed,
//   kpi_client_active_assignments: mongoose.Schema.Types.Mixed,
//   kpi_client_feedback_volume: mongoose.Schema.Types.Mixed,
//   kpi_client_open_jobs: mongoose.Schema.Types.Mixed,
//   kpi_skill_match: mongoose.Schema.Types.Mixed,
//   kpi_weekly_hour_commitment: mongoose.Schema.Types.Mixed,
//   kpi_client_rating: mongoose.Schema.Types.Mixed,
//   kpi_client_activity_recency: mongoose.Schema.Types.Mixed,
//   kpi_payment_verification: mongoose.Schema.Types.Mixed,
//   kpi_job_level_match: mongoose.Schema.Types.Mixed,
  
//   // AI Analysis fields
//   predicted_domain: String,
//   ai_remark: String,
//   final_score: mongoose.Schema.Types.Mixed,
//   final_weighted_score: mongoose.Schema.Types.Mixed,
//   tier: String,
//   estimated_budget: Number,
//   ae_pitched: String,
  
//   // Batch information
//   batchId: String,
//   scrapedAt: { type: Date, default: Date.now },
//   isActive: { type: Boolean, default: true },
  
//   // Distribution tracking
//   distributedTo: [{
//     companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
//     distributedAt: { type: Date, default: Date.now },
//     status: {
//       type: String,
//       enum: ['pending', 'delivered', 'failed'],
//       default: 'pending'
//     }
//   }],
  
//   // Metadata
//   source: String, // apify, direct, manual, etc.
//   processed: { type: Boolean, default: false },
//   processingNotes: String
// }, {
//   timestamps: true
// });

// // Compound indexes for performance
// MasterJobSchema.index({ platform: 1, jobId: 1 }, { unique: true });
// MasterJobSchema.index({ platform: 1, postedDate: -1 });
// MasterJobSchema.index({ platform: 1, tier: 1 });
// MasterJobSchema.index({ platform: 1, final_score: -1 });
// MasterJobSchema.index({ skills: 1 });
// MasterJobSchema.index({ country: 1 });
// MasterJobSchema.index({ batchId: 1 });
// MasterJobSchema.index({ distributedTo: 1 });

// module.exports = mongoose.model('MasterJob', MasterJobSchema);

const mongoose = require('mongoose');

// Unified Company Schema for all platforms
const UnifiedCompanySchema = new mongoose.Schema({
  // LinkedIn company fields
  linkedinUrl: String,
  logo: String,
  website: String,
  name: String,
  employeeCount: mongoose.Schema.Types.Mixed,
  followerCount: Number,
  description: String,
  specialities: [String],
  industries: [String],
  locations: [{
    city: String,
    state: String,
    country: String,
    parsed: {
      city: String,
      state: String,
      country: String
    }
  }],
  
  // Upwork company fields
  companyId: String,
  companyIndustry: String, // ✅ Added missing field
  companySize: Number,
  companyContractDate: Date, // ✅ Added missing field
  companyIsEDCReplicated: Boolean
}, { _id: false });

// Unified Master Job Schema
const MasterJobSchema = new mongoose.Schema({
  // Universal identifiers
  jobId: { type: String, required: true },
  id: String, // ✅ Added missing LinkedIn id field
  platform: {
    type: String,
    enum: ['linkedin', 'upwork', 'indeed', 'glassdoor'],
    required: true,
    index: true
  },
  
  // Basic job information
  title: { type: String, required: true },
  description: String,
  descriptionText: String,
  
  // Company information
  company: UnifiedCompanySchema,
  companyName: String,
  
  // LinkedIn specific job fields
  linkedinUrl: String,
  postedDate: Date,
  expireAt: Date,
  employmentType: String,
  workplaceType: String,
  easyApplyUrl: String,
  applicants: Number,
  views: Number,
  jobApplicationLimitReached: Boolean,
  applyMethod: String,
  salary: mongoose.Schema.Types.Mixed,
  
  // Upwork specific job fields
  isContractToHire: Boolean,
  isPaymentMethodVerified: Boolean,
  level: String,
  contractorTier: String,
  companyId: String,
  companyIndustry: String, // ✅ Added missing field
  companyContractDate: Date, // ✅ Added missing field
  buyerScore: Number,
  buyerTotalAssignments: Number,
  buyerTotalJobsWithHires: Number,
  buyerActiveAssignmentsCount: Number,
  buyerFeedbackCount: Number,
  buyerOpenJobsCount: Number,
  buyerPostedJobsCount: Number,
  buyerAvgHourlyRate: Number,
  minHourlyRate: Number,
  maxHourlyRate: Number,
  hourlyType: String,
  hourlyWeeks: Number,
  minHoursWeek: Number,
  lastBuyerActivity: String,
  clientTotalHours: Number,
  clientTotalSpend: Number,
  clientRisingTalent: Boolean,
  jobType: String,
  fixedBudget: Number,
  fixedDurationLabel: String,
  numberOfPositionsToHire: Number,
  premium: Boolean,
  openJobs: [mongoose.Schema.Types.Mixed],
  questions: [String],
  qualificationsCountries: [String],
  qualificationsLanguages: [String],
  qualificationsMinJobSuccessScore: Number,
  qualificationsRisingTalent: Boolean,
  qualificationsLocationCheckRequired: Boolean,
  
  // Common fields
  tags: [String],
  skills: [String],
  city: String,
  country: String,
  countryTimezone: String,
  utcOffsetMillis: Number,
  category: String,
  categoryGroup: String,
  occupation: String,
  status: String,
  url: String,
  
  // Timestamps
  ts_create: Date,
  ts_publish: Date,
  ts_sourcing: Date,
  
  // LinkedIn KPI fields
  kpi_jd_quality: mongoose.Schema.Types.Mixed,
  kpi_domain_fit: mongoose.Schema.Types.Mixed,
  kpi_seniority_alignment: mongoose.Schema.Types.Mixed,
  kpi_location_priority: mongoose.Schema.Types.Mixed,
  kpi_company_specialties: mongoose.Schema.Types.Mixed,
  kpi_salary: mongoose.Schema.Types.Mixed,
  kpi_company_size: mongoose.Schema.Types.Mixed,
  kpi_company_popularity: mongoose.Schema.Types.Mixed,
  kpi_industry_match: mongoose.Schema.Types.Mixed,
  kpi_job_popularity: mongoose.Schema.Types.Mixed,
  kpi_job_freshness: mongoose.Schema.Types.Mixed,
  kpi_employment_type: mongoose.Schema.Types.Mixed,
  kpi_contact_info: mongoose.Schema.Types.Mixed,
  kpi_skills_explicitness: mongoose.Schema.Types.Mixed,
  kpi_experience_threshold: mongoose.Schema.Types.Mixed,
  
  // Upwork KPI fields
  kpi_budget_attractiveness: mongoose.Schema.Types.Mixed,
  kpi_avg_hourly_rate: mongoose.Schema.Types.Mixed,
  kpi_contract_to_hire: mongoose.Schema.Types.Mixed,
  kpi_enterprise_heuristic: mongoose.Schema.Types.Mixed,
  kpi_hiring_rate: mongoose.Schema.Types.Mixed,
  kpi_job_engagement: mongoose.Schema.Types.Mixed,
  kpi_job_title_relevance: mongoose.Schema.Types.Mixed,
  kpi_client_tenure: mongoose.Schema.Types.Mixed,
  kpi_client_hiring_history: mongoose.Schema.Types.Mixed,
  kpi_client_active_assignments: mongoose.Schema.Types.Mixed,
  kpi_client_feedback_volume: mongoose.Schema.Types.Mixed,
  kpi_client_open_jobs: mongoose.Schema.Types.Mixed,
  kpi_skill_match: mongoose.Schema.Types.Mixed,
  kpi_weekly_hour_commitment: mongoose.Schema.Types.Mixed,
  kpi_client_rating: mongoose.Schema.Types.Mixed,
  kpi_client_activity_recency: mongoose.Schema.Types.Mixed,
  kpi_payment_verification: mongoose.Schema.Types.Mixed,
  kpi_job_level_match: mongoose.Schema.Types.Mixed,
  
  // AI Analysis fields
  predicted_domain: String,
  ai_remark: String,
  final_score: mongoose.Schema.Types.Mixed,
  final_weighted_score: mongoose.Schema.Types.Mixed,
  tier: String,
  estimated_budget: Number,
  ae_pitched: String,
  
  // Batch information
  batchId: String,
  scrapedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  
  // Distribution tracking
  distributedTo: [{
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    distributedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'delivered', 'failed'],
      default: 'pending'
    }
  }],
  
  // Metadata
  source: String,
  processed: { type: Boolean, default: false },
  processingNotes: String
}, {
  timestamps: true
});

// Compound indexes for performance
MasterJobSchema.index({ platform: 1, jobId: 1 }, { unique: true });
MasterJobSchema.index({ platform: 1, id: 1 }); // ✅ Added index for LinkedIn id
MasterJobSchema.index({ platform: 1, postedDate: -1 });
MasterJobSchema.index({ platform: 1, tier: 1 });
MasterJobSchema.index({ platform: 1, final_score: -1 });
MasterJobSchema.index({ skills: 1 });
MasterJobSchema.index({ country: 1 });
MasterJobSchema.index({ batchId: 1 });

module.exports = mongoose.model('MasterJob', MasterJobSchema);

