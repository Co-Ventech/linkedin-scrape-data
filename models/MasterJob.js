// // // const mongoose = require('mongoose');

// // // // Unified Company Schema for all platforms
// // // const UnifiedCompanySchema = new mongoose.Schema({
// // //   // LinkedIn company fields
// // //   linkedinUrl: String,
// // //   logo: String,
// // //   website: String,
// // //   name: String,
// // //   employeeCount: mongoose.Schema.Types.Mixed,
// // //   followerCount: Number,
// // //   description: String,
// // //   specialities: [String],
// // //   industries: [String],
// // //   locations: [{
// // //     city: String,
// // //     state: String,
// // //     country: String,
// // //     parsed: {
// // //       city: String,
// // //       state: String,
// // //       country: String
// // //     }
// // //   }],
  
// // //   // Upwork company fields
// // //   companyId: String,
// // //   companyIndustry: String,
// // //   companySize: Number,
// // //   companyContractDate: Date,
// // //   companyIsEDCReplicated: Boolean
// // // }, { _id: false });

// // // // Unified Master Job Schema
// // // const MasterJobSchema = new mongoose.Schema({
// // //   // Universal identifiers
// // //   jobId: { type: String, required: true },
// // //   id: String, // LinkedIn id field
// // //   platform: {
// // //     type: String,
// // //     enum: ['linkedin', 'upwork', 'indeed', 'glassdoor'],
// // //     required: true,
// // //     index: true
// // //   },
  
// // //   // Basic job information
// // //   title: { type: String, required: true },
// // //   description: String,
// // //   descriptionText: String,
  
// // //   // Company information
// // //   company: UnifiedCompanySchema,
// // //   companyName: String,
  
// // //   // LinkedIn specific job fields
// // //   linkedinUrl: String,
// // //   postedDate: Date,
// // //   expireAt: Date,
// // //   employmentType: String,
// // //   workplaceType: String,
// // //   easyApplyUrl: String,
// // //   applicants: Number,
// // //   views: Number,
// // //   jobApplicationLimitReached: Boolean,
// // //   applyMethod: String,
// // //   salary: mongoose.Schema.Types.Mixed,
  
// // //   // Upwork specific job fields
// // //   isContractToHire: Boolean,
// // //   isPaymentMethodVerified: Boolean,
// // //   level: String,
// // //   contractorTier: String,
// // //   companyId: String,
// // //   companyIndustry: String,
// // //   companyContractDate: Date,
// // //   buyerScore: Number,
// // //   buyerTotalAssignments: Number,
// // //   buyerTotalJobsWithHires: Number,
// // //   buyerActiveAssignmentsCount: Number,
// // //   buyerFeedbackCount: Number,
// // //   buyerOpenJobsCount: Number,
// // //   buyerPostedJobsCount: Number,
// // //   buyerAvgHourlyRate: Number,
// // //   minHourlyRate: Number,
// // //   maxHourlyRate: Number,
// // //   hourlyType: String,
// // //   hourlyWeeks: Number,
// // //   minHoursWeek: Number,
// // //   lastBuyerActivity: String,
// // //   clientTotalHours: Number,
// // //   clientTotalSpend: Number,
// // //   clientRisingTalent: Boolean,
// // //   jobType: String,
// // //   fixedBudget: Number,
// // //   fixedDurationLabel: String,
// // //   numberOfPositionsToHire: Number,
// // //   premium: Boolean,
// // //   openJobs: [mongoose.Schema.Types.Mixed],
// // //   questions: [String],
// // //   qualificationsCountries: [String],
// // //   qualificationsLanguages: [String],
// // //   qualificationsMinJobSuccessScore: Number,
// // //   qualificationsRisingTalent: Boolean,
// // //   qualificationsLocationCheckRequired: Boolean,
  
// // //   // Common fields
// // //   tags: [String],
// // //   skills: [String],
// // //   city: String,
// // //   country: String,
// // //   countryTimezone: String,
// // //   utcOffsetMillis: Number,
// // //   category: String,
// // //   categoryGroup: String,
// // //   occupation: String,
// // //   status: String,
// // //   url: String,
  
// // //   // Timestamps
// // //   ts_create: Date,
// // //   ts_publish: Date,
// // //   ts_sourcing: Date,
  
// // //   // LinkedIn KPI fields
// // //   kpi_jd_quality: mongoose.Schema.Types.Mixed,
// // //   kpi_domain_fit: mongoose.Schema.Types.Mixed,
// // //   kpi_seniority_alignment: mongoose.Schema.Types.Mixed,
// // //   kpi_location_priority: mongoose.Schema.Types.Mixed,
// // //   kpi_company_specialties: mongoose.Schema.Types.Mixed,
// // //   kpi_salary: mongoose.Schema.Types.Mixed,
// // //   kpi_company_size: mongoose.Schema.Types.Mixed,
// // //   kpi_company_popularity: mongoose.Schema.Types.Mixed,
// // //   kpi_industry_match: mongoose.Schema.Types.Mixed,
// // //   kpi_job_popularity: mongoose.Schema.Types.Mixed,
// // //   kpi_job_freshness: mongoose.Schema.Types.Mixed,
// // //   kpi_employment_type: mongoose.Schema.Types.Mixed,
// // //   kpi_contact_info: mongoose.Schema.Types.Mixed,
// // //   kpi_skills_explicitness: mongoose.Schema.Types.Mixed,
// // //   kpi_experience_threshold: mongoose.Schema.Types.Mixed,
  
// // //   // Upwork KPI fields
// // //   kpi_budget_attractiveness: mongoose.Schema.Types.Mixed,
// // //   kpi_avg_hourly_rate: mongoose.Schema.Types.Mixed,
// // //   kpi_contract_to_hire: mongoose.Schema.Types.Mixed,
// // //   kpi_enterprise_heuristic: mongoose.Schema.Types.Mixed,
// // //   kpi_hiring_rate: mongoose.Schema.Types.Mixed,
// // //   kpi_job_engagement: mongoose.Schema.Types.Mixed,
// // //   kpi_job_title_relevance: mongoose.Schema.Types.Mixed,
// // //   kpi_client_tenure: mongoose.Schema.Types.Mixed,
// // //   kpi_client_hiring_history: mongoose.Schema.Types.Mixed,
// // //   kpi_client_active_assignments: mongoose.Schema.Types.Mixed,
// // //   kpi_client_feedback_volume: mongoose.Schema.Types.Mixed,
// // //   kpi_client_open_jobs: mongoose.Schema.Types.Mixed,
// // //   kpi_skill_match: mongoose.Schema.Types.Mixed,
// // //   kpi_weekly_hour_commitment: mongoose.Schema.Types.Mixed,
// // //   kpi_client_rating: mongoose.Schema.Types.Mixed,
// // //   kpi_client_activity_recency: mongoose.Schema.Types.Mixed,
// // //   kpi_payment_verification: mongoose.Schema.Types.Mixed,
// // //   kpi_job_level_match: mongoose.Schema.Types.Mixed,
  
// // //   // AI Analysis fields
// // //   predicted_domain: String,
// // //   ai_remark: String,
// // //   final_score: mongoose.Schema.Types.Mixed,
// // //   final_weighted_score: mongoose.Schema.Types.Mixed,
// // //   tier: String,
// // //   estimated_budget: Number,
// // //   ae_pitched: String,
  
// // //   // Status and comments fields (from both batch files)
// // //   currentStatus: {
// // //     type: String,
// // //     enum: ['not_engaged', 'applied', 'engaged', 'interview', 'offer', 'rejected', 'onboard'],
// // //     default: 'not_engaged'
// // //   },
// // //   statusHistory: {
// // //     type: [
// // //       {
// // //         status: {
// // //           type: String,
// // //           enum: ['not_engaged', 'applied', 'engaged', 'interview', 'offer', 'rejected', 'onboard']
// // //         },
// // //         username: String,
// // //         date: { type: Date, default: Date.now }
// // //       }
// // //     ],
// // //     default: []
// // //   },
// // //   comments: {
// // //     type: [
// // //       {
// // //         username: String,
// // //         comment: String,
// // //         date: { type: Date, default: Date.now }
// // //       }
// // //     ],
// // //     default: []
// // //   },
// // //   ae_comment: {
// // //     type: String,
// // //     default: ''
// // //   },
  
// // //   // Proposal and AE scoring fields (from both batch files)
// // //   proposal: { type: String, default: "" },
// // //   ae_score: {
// // //     type: [
// // //       {
// // //         value: Number,
// // //         username: String,
// // //         date: { type: Date, default: Date.now }
// // //       }
// // //     ],
// // //     default: []
// // //   },
  
// // //   // Batch information
// // //   batchId: String,
// // //   scrapedAt: { type: Date, default: Date.now },
// // //   isActive: { type: Boolean, default: true },
  
// // //   // Distribution tracking
// // //   distributedTo: [{
// // //     companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
// // //     distributedAt: { type: Date, default: Date.now },
// // //     status: {
// // //       type: String,
// // //       enum: ['pending', 'delivered', 'failed'],
// // //       default: 'pending'
// // //     }
// // //   }],
  
// // //   // Metadata
// // //   source: String,
// // //   processed: { type: Boolean, default: false },
// // //   processingNotes: String
// // // }, {
// // //   timestamps: true
// // // });

// // // // Compound indexes for performance
// // // MasterJobSchema.index({ platform: 1, jobId: 1 }, { unique: true });
// // // MasterJobSchema.index({ platform: 1, id: 1 });
// // // MasterJobSchema.index({ platform: 1, postedDate: -1 });
// // // MasterJobSchema.index({ platform: 1, tier: 1 });
// // // MasterJobSchema.index({ platform: 1, final_score: -1 });
// // // MasterJobSchema.index({ skills: 1 });
// // // MasterJobSchema.index({ country: 1 });
// // // MasterJobSchema.index({ batchId: 1 });
// // // MasterJobSchema.index({ distributedTo: 1 });

// // // module.exports = mongoose.model('MasterJob', MasterJobSchema);
// // const mongoose = require('mongoose');

// // // Unified Company Schema for all platforms
// // const UnifiedCompanySchema = new mongoose.Schema({
// //   // LinkedIn company fields
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
// //     country: String,
// //     parsed: {
// //       city: String,
// //       state: String,
// //       country: String
// //     }
// //   }],
  
// //   // Upwork company fields
// //   companyId: String,
// //   companyIndustry: String,
// //   companySize: Number,
// //   companyContractDate: Date,
// //   companyIsEDCReplicated: Boolean,
  
// //   // ADDITIONAL MISSING COMPANY FIELDS
// //   companyBusinessType: String, // Business type of the company
// //   companyHeadquarters: String, // Company headquarters location
// //   companyFoundedYear: Number, // Year company was founded
// //   companyRevenue: String, // Company revenue range
// //   companyType: String, // Public/Private/Startup etc.
// //   companyTagline: String, // Company tagline/slogan
// //   companyPhone: String, // Company contact phone
// //   companyEmail: String // Company contact email
// // }, { _id: false });

// // // Unified Master Job Schema
// // const MasterJobSchema = new mongoose.Schema({
// //   // Universal identifiers
// //   jobId: { type: String, required: true },
// //   id: String, // LinkedIn id field
// //   platform: {
// //     type: String,
// //     enum: ['linkedin', 'upwork', 'indeed', 'glassdoor'],
// //     required: true,
// //     index: true
// //   },
  
// //   // Basic job information
// //   title: { type: String, required: true },
// //   description: String,
// //   descriptionText: String,
  
// //   // Company information
// //   company: UnifiedCompanySchema,
// //   companyName: String,
  
// //   // LinkedIn specific job fields
// //   linkedinUrl: String,
// //   postedDate: Date,
// //   expireAt: Date,
// //   employmentType: String,
// //   workplaceType: String,
// //   easyApplyUrl: String,
// //   applicants: Number,
// //   views: Number,
// //   jobApplicationLimitReached: Boolean,
// //   applyMethod: String,
// //   salary: mongoose.Schema.Types.Mixed,
  
// //   // Upwork specific job fields
// //   isContractToHire: Boolean,
// //   isPaymentMethodVerified: Boolean,
// //   level: String,
// //   contractorTier: String,
// //   companyId: String,
// //   companyIndustry: String,
// //   companyContractDate: Date,
// //   buyerScore: Number,
// //   buyerTotalAssignments: Number,
// //   buyerTotalJobsWithHires: Number,
// //   buyerActiveAssignmentsCount: Number,
// //   buyerFeedbackCount: Number,
// //   buyerOpenJobsCount: Number,
// //   buyerPostedJobsCount: Number,
// //   buyerAvgHourlyRate: Number,
// //   minHourlyRate: Number,
// //   maxHourlyRate: Number,
// //   hourlyType: String,
// //   hourlyWeeks: Number,
// //   minHoursWeek: Number,
// //   lastBuyerActivity: String,
// //   clientTotalHours: Number,
// //   clientTotalSpend: Number,
// //   clientRisingTalent: Boolean,
// //   jobType: String,
// //   fixedBudget: Number,
// //   fixedDurationLabel: String,
// //   numberOfPositionsToHire: Number,
// //   premium: Boolean,
// //   openJobs: [mongoose.Schema.Types.Mixed],
// //   questions: [String],
// //   qualificationsCountries: [String],
// //   qualificationsLanguages: [String],
// //   qualificationsMinJobSuccessScore: Number,
// //   qualificationsRisingTalent: Boolean,
// //   qualificationsLocationCheckRequired: Boolean,
  
// //   // Common fields
// //   tags: [String],
// //   skills: [String],
// //   city: String,
// //   country: String,
// //   countryTimezone: String,
// //   utcOffsetMillis: Number,
// //   category: String,
// //   categoryGroup: String,
// //   occupation: String,
// //   status: String,
// //   url: String,
  
// //   // Timestamps
// //   ts_create: Date,
// //   ts_publish: Date,
// //   ts_sourcing: Date,
  
// //   // LinkedIn KPI fields
// //   kpi_jd_quality: mongoose.Schema.Types.Mixed,
// //   kpi_domain_fit: mongoose.Schema.Types.Mixed,
// //   kpi_seniority_alignment: mongoose.Schema.Types.Mixed,
// //   kpi_location_priority: mongoose.Schema.Types.Mixed,
// //   kpi_company_specialties: mongoose.Schema.Types.Mixed,
// //   kpi_salary: mongoose.Schema.Types.Mixed,
// //   kpi_company_size: mongoose.Schema.Types.Mixed,
// //   kpi_company_popularity: mongoose.Schema.Types.Mixed,
// //   kpi_industry_match: mongoose.Schema.Types.Mixed,
// //   kpi_job_popularity: mongoose.Schema.Types.Mixed,
// //   kpi_job_freshness: mongoose.Schema.Types.Mixed,
// //   kpi_employment_type: mongoose.Schema.Types.Mixed,
// //   kpi_contact_info: mongoose.Schema.Types.Mixed,
// //   kpi_skills_explicitness: mongoose.Schema.Types.Mixed,
// //   kpi_experience_threshold: mongoose.Schema.Types.Mixed,
  
// //   // Upwork KPI fields
// //   kpi_budget_attractiveness: mongoose.Schema.Types.Mixed,
// //   kpi_avg_hourly_rate: mongoose.Schema.Types.Mixed,
// //   kpi_contract_to_hire: mongoose.Schema.Types.Mixed,
// //   kpi_enterprise_heuristic: mongoose.Schema.Types.Mixed,
// //   kpi_hiring_rate: mongoose.Schema.Types.Mixed,
// //   kpi_job_engagement: mongoose.Schema.Types.Mixed,
// //   kpi_job_title_relevance: mongoose.Schema.Types.Mixed,
// //   kpi_client_tenure: mongoose.Schema.Types.Mixed,
// //   kpi_client_hiring_history: mongoose.Schema.Types.Mixed,
// //   kpi_client_active_assignments: mongoose.Schema.Types.Mixed,
// //   kpi_client_feedback_volume: mongoose.Schema.Types.Mixed,
// //   kpi_client_open_jobs: mongoose.Schema.Types.Mixed,
// //   kpi_skill_match: mongoose.Schema.Types.Mixed,
// //   kpi_weekly_hour_commitment: mongoose.Schema.Types.Mixed,
// //   kpi_client_rating: mongoose.Schema.Types.Mixed,
// //   kpi_client_activity_recency: mongoose.Schema.Types.Mixed,
// //   kpi_payment_verification: mongoose.Schema.Types.Mixed,
// //   kpi_job_level_match: mongoose.Schema.Types.Mixed,
  
// //   // AI Analysis fields
// //   predicted_domain: String,
// //   ai_remark: String,
// //   final_score: mongoose.Schema.Types.Mixed,
// //   final_weighted_score: mongoose.Schema.Types.Mixed,
// //   tier: String,
// //   estimated_budget: Number,
// //   ae_pitched: String,
  
// //   // Status and comments fields (from both batch files)
// //   currentStatus: {
// //     type: String,
// //     enum: ['not_engaged', 'applied', 'engaged', 'interview', 'offer', 'rejected', 'onboard'],
// //     default: 'not_engaged'
// //   },
// //   statusHistory: {
// //     type: [
// //       {
// //         status: {
// //           type: String,
// //           enum: ['not_engaged', 'applied', 'engaged', 'interview', 'offer', 'rejected', 'onboard']
// //         },
// //         username: String,
// //         date: { type: Date, default: Date.now },
// //         // ADDITIONAL FIELDS FOR STATUS HISTORY
// //         notes: String, // Additional notes for status change
// //         changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Who changed the status
// //       }
// //     ],
// //     default: []
// //   },
// //   comments: {
// //     type: [
// //       {
// //         username: String,
// //         comment: String,
// //         date: { type: Date, default: Date.now },
// //         // ADDITIONAL COMMENT FIELDS
// //         text: String, // Alternative to comment field
// //         userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// //         isPrivate: { type: Boolean, default: false },
// //         type: { type: String, enum: ['general', 'status', 'follow_up'], default: 'general' }
// //       }
// //     ],
// //     default: []
// //   },
// //   ae_comment: {
// //     type: String,
// //     default: ''
// //   },
  
// //   // Proposal and AE scoring fields (from both batch files)
// //   proposal: { type: String, default: "" },
// //   ae_score: {
// //     type: [
// //       {
// //         value: Number,
// //         username: String,
// //         date: { type: Date, default: Date.now }
// //       }
// //     ],
// //     default: []
// //   },
  
// //   // ADDITIONAL MISSING FIELDS FROM OLD SCHEMAS
  
// //   // Contact and Recruiter Information
// //   contactEmail: String,
// //   contactPhone: String,
// //   contactName: String,
// //   recruiterName: String,
// //   recruiterProfile: String,
// //   recruiterLinkedinUrl: String,
// //   hiringManagerName: String,
  
// //   // Additional Job Details
// //   experienceLevel: String, // Entry, Mid, Senior
// //   seniorityLevel: String,
// //   jobFunction: String,
// //   department: String,
// //   reportingTo: String,
// //   teamSize: String,
// //   remotePolicy: String, // Remote, Hybrid, On-site
// //   travelRequired: String,
  
// //   // Salary and Benefits
// //   salaryRange: {
// //     min: Number,
// //     max: Number,
// //     currency: String,
// //     period: String // hourly, monthly, annually
// //   },
// //   benefits: [String],
// //   equity: Boolean,
// //   bonusStructure: String,
  
// //   // Application Details
// //   applicationDeadline: Date,
// //   numberOfOpenings: Number,
// //   urgentHiring: Boolean,
// //   sponsorshipAvailable: Boolean,
// //   securityClearanceRequired: Boolean,
  
// //   // Location Details (Enhanced)
// //   workLocation: {
// //     type: String,
// //     enum: ['remote', 'onsite', 'hybrid']
// //   },
// //   officeLocations: [{
// //     address: String,
// //     city: String,
// //     state: String,
// //     country: String,
// //     zipCode: String,
// //     isPrimary: Boolean
// //   }],
// //   timeZonePreference: String,
  
// //   // Job Requirements
// //   requiredSkills: [String],
// //   preferredSkills: [String],
// //   requiredEducation: String,
// //   preferredEducation: String,
// //   certifications: [String],
// //   languagesRequired: [String],
// //   minExperienceYears: Number,
// //   maxExperienceYears: Number,
  
// //   // Industry and Domain
// //   industryType: String,
// //   domainExpertise: [String],
// //   projectType: String,
// //   clientType: String, // B2B, B2C, Government
  
// //   // Application Process
// //   applicationProcess: String,
// //   interviewProcess: [String],
// //   assessmentRequired: Boolean,
// //   portfolioRequired: Boolean,
// //   codeTestRequired: Boolean,
// //   backgroundCheckRequired: Boolean,
  
// //   // Job Source and Tracking
// //   sourceUrl: String,
// //   originalPostDate: Date,
// //   lastUpdatedDate: Date,
// //   jobBoard: String, // Source job board
// //   internalJobId: String,
// //   externalJobId: String,
  
// //   // Performance and Analytics
// //   clickCount: Number,
// //   viewCount: Number,
// //   applicationCount: Number,
// //   bookmarkCount: Number,
// //   shareCount: Number,
  
// //   // Quality and Flags
// //   isVerified: Boolean,
// //   isFeatured: Boolean,
// //   isPremium: Boolean,
// //   isSponsored: Boolean,
// //   qualityScore: Number,
// //   completenessScore: Number,
  
// //   // Custom Fields for Flexibility
// //   customFields: {
// //     type: Map,
// //     of: mongoose.Schema.Types.Mixed
// //   },
  
// //   // Batch information
// //   batchId: String,
// //   scrapedAt: { type: Date, default: Date.now },
// //   isActive: { type: Boolean, default: true },
  
// //   // Distribution tracking
// //   distributedTo: [{
// //     companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
// //     distributedAt: { type: Date, default: Date.now },
// //     status: {
// //       type: String,
// //       enum: ['pending', 'delivered', 'failed'],
// //       default: 'pending'
// //     },
// //     // ADDITIONAL DISTRIBUTION FIELDS
// //     distributedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// //     deliveredAt: Date,
// //     viewedAt: Date,
// //     notes: String
// //   }],
  
// //   // Metadata
// //   source: String,
// //   processed: { type: Boolean, default: false },
// //   processingNotes: String,
  
// //   // ADDITIONAL METADATA
// //   dataVersion: { type: String, default: '1.0' },
// //   migrationStatus: String,
// //   validationErrors: [String],
// //   processingHistory: [{
// //     action: String,
// //     timestamp: { type: Date, default: Date.now },
// //     performedBy: String,
// //     notes: String
// //   }]
// // }, {
// //   timestamps: true
// // });

// // // Compound indexes for performance
// // MasterJobSchema.index({ platform: 1, jobId: 1 }, { unique: true });
// // MasterJobSchema.index({ platform: 1, id: 1 });
// // MasterJobSchema.index({ platform: 1, postedDate: -1 });
// // MasterJobSchema.index({ platform: 1, tier: 1 });
// // MasterJobSchema.index({ platform: 1, final_score: -1 });
// // MasterJobSchema.index({ skills: 1 });
// // MasterJobSchema.index({ country: 1 });
// // MasterJobSchema.index({ batchId: 1 });
// // MasterJobSchema.index({ distributedTo: 1 });

// // // ADDITIONAL INDEXES FOR NEW FIELDS
// // MasterJobSchema.index({ companyName: 1 });
// // MasterJobSchema.index({ experienceLevel: 1 });
// // MasterJobSchema.index({ workLocation: 1 });
// // MasterJobSchema.index({ salaryRange: 1 });
// // MasterJobSchema.index({ applicationDeadline: 1 });
// // MasterJobSchema.index({ isActive: 1, processed: 1 });

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
//   companyIsEDCReplicated: Boolean,
  
//   // ADDITIONAL MISSING COMPANY FIELDS
//   companyBusinessType: String, // Business type of the company
//   companyHeadquarters: String, // Company headquarters location
//   companyFoundedYear: Number, // Year company was founded
//   companyRevenue: String, // Company revenue range
//   companyType: String, // Public/Private/Startup etc.
//   companyTagline: String, // Company tagline/slogan
//   companyPhone: String, // Company contact phone
//   companyEmail: String // Company contact email
// }, { _id: false });

// // Unified Master Job Schema
// const MasterJobSchema = new mongoose.Schema({
//   // Universal identifiers
//   jobId: { type: String, required: true },
//   id: String, // LinkedIn id field
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
//   employmentType: String,
//   workplaceType: String,
//   easyApplyUrl: String,
//   applicants: Number,
//   views: Number,
//   jobApplicationLimitReached: Boolean,
//   applyMethod: String,
//   salary: mongoose.Schema.Types.Mixed,
  
//   // Upwork specific job fields
//   isContractToHire: Boolean,
//   isPaymentMethodVerified: Boolean,
//   level: String,
//   contractorTier: String,
//   companyId: String,
//   companyIndustry: String,
//   companyContractDate: Date,
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
//   jobType: String,
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
//   status: String,
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
  
//   // Status and comments fields (from both batch files)
//   currentStatus: {
//     type: String,
//     enum: ['not_engaged', 'applied', 'engaged', 'interview', 'offer', 'rejected', 'onboard'],
//     default: 'not_engaged'
//   },
//   statusHistory: {
//     type: [
//       {
//         status: {
//           type: String,
//           enum: ['not_engaged', 'applied', 'engaged', 'interview', 'offer', 'rejected', 'onboard']
//         },
//         username: String,
//         date: { type: Date, default: Date.now },
//         // ADDITIONAL FIELDS FOR STATUS HISTORY
//         notes: String, // Additional notes for status change
//         changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Who changed the status
//       }
//     ],
//     default: []
//   },
//   comments: {
//     type: [
//       {
//         username: String,
//         comment: String,
//         date: { type: Date, default: Date.now },
//         // ADDITIONAL COMMENT FIELDS
//         text: String, // Alternative to comment field
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//         isPrivate: { type: Boolean, default: false },
//         type: { type: String, enum: ['general', 'status', 'follow_up'], default: 'general' }
//       }
//     ],
//     default: []
//   },
//   ae_comment: {
//     type: String,
//     default: ''
//   },
  
//   // Proposal and AE scoring fields (from both batch files)
//   proposal: { type: String, default: "" },
//   ae_score: {
//     type: [
//       {
//         value: Number,
//         username: String,
//         date: { type: Date, default: Date.now }
//       }
//     ],
//     default: []
//   },
  
//   // ADDITIONAL MISSING FIELDS FROM OLD SCHEMAS
  
//   // Contact and Recruiter Information
//   contactEmail: String,
//   contactPhone: String,
//   contactName: String,
//   recruiterName: String,
//   recruiterProfile: String,
//   recruiterLinkedinUrl: String,
//   hiringManagerName: String,
  
//   // Additional Job Details
//   experienceLevel: String, // Entry, Mid, Senior
//   seniorityLevel: String,
//   jobFunction: String,
//   department: String,
//   reportingTo: String,
//   teamSize: String,
//   remotePolicy: String, // Remote, Hybrid, On-site
//   travelRequired: String,
  
//   // Salary and Benefits
//   salaryRange: {
//     min: Number,
//     max: Number,
//     currency: String,
//     period: String // hourly, monthly, annually
//   },
//   benefits: [String],
//   equity: Boolean,
//   bonusStructure: String,
  
//   // Application Details
//   applicationDeadline: Date,
//   numberOfOpenings: Number,
//   urgentHiring: Boolean,
//   sponsorshipAvailable: Boolean,
//   securityClearanceRequired: Boolean,
  
//   // Location Details (Enhanced)
//   workLocation: {
//     type: String,
//     enum: ['remote', 'onsite', 'hybrid']
//   },
//   officeLocations: [{
//     address: String,
//     city: String,
//     state: String,
//     country: String,
//     zipCode: String,
//     isPrimary: Boolean
//   }],
//   timeZonePreference: String,
  
//   // Job Requirements
//   requiredSkills: [String],
//   preferredSkills: [String],
//   requiredEducation: String,
//   preferredEducation: String,
//   certifications: [String],
//   languagesRequired: [String],
//   minExperienceYears: Number,
//   maxExperienceYears: Number,
  
//   // Industry and Domain
//   industryType: String,
//   domainExpertise: [String],
//   projectType: String,
//   clientType: String, // B2B, B2C, Government
  
//   // Application Process
//   applicationProcess: String,
//   interviewProcess: [String],
//   assessmentRequired: Boolean,
//   portfolioRequired: Boolean,
//   codeTestRequired: Boolean,
//   backgroundCheckRequired: Boolean,
  
//   // Job Source and Tracking
//   sourceUrl: String,
//   originalPostDate: Date,
//   lastUpdatedDate: Date,
//   jobBoard: String, // Source job board
//   internalJobId: String,
//   externalJobId: String,
  
//   // Performance and Analytics
//   clickCount: Number,
//   viewCount: Number,
//   applicationCount: Number,
//   bookmarkCount: Number,
//   shareCount: Number,
  
//   // Quality and Flags
//   isVerified: Boolean,
//   isFeatured: Boolean,
//   isPremium: Boolean,
//   isSponsored: Boolean,
//   qualityScore: Number,
//   completenessScore: Number,
  
//   // Custom Fields for Flexibility
//   customFields: {
//     type: Map,
//     of: mongoose.Schema.Types.Mixed
//   },
  
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
//     },
//     // ADDITIONAL DISTRIBUTION FIELDS
//     distributedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     deliveredAt: Date,
//     viewedAt: Date,
//     notes: String
//   }],
  
//   // Metadata
//   source: String,
//   processed: { type: Boolean, default: false },
//   processingNotes: String,
  
//   // ADDITIONAL METADATA
//   dataVersion: { type: String, default: '1.0' },
//   migrationStatus: String,
//   validationErrors: [String],
//   processingHistory: [{
//     action: String,
//     timestamp: { type: Date, default: Date.now },
//     performedBy: String,
//     notes: String
//   }]
// }, {
//   timestamps: true
// });

// // Compound indexes for performance
// MasterJobSchema.index({ platform: 1, jobId: 1 }, { unique: true });
// MasterJobSchema.index({ platform: 1, id: 1 });
// MasterJobSchema.index({ platform: 1, postedDate: -1 });
// MasterJobSchema.index({ platform: 1, tier: 1 });
// MasterJobSchema.index({ platform: 1, final_score: -1 });
// MasterJobSchema.index({ skills: 1 });
// MasterJobSchema.index({ country: 1 });
// MasterJobSchema.index({ batchId: 1 });
// MasterJobSchema.index({ distributedTo: 1 });

// // ADDITIONAL INDEXES FOR NEW FIELDS
// MasterJobSchema.index({ companyName: 1 });
// MasterJobSchema.index({ experienceLevel: 1 });
// MasterJobSchema.index({ workLocation: 1 });
// MasterJobSchema.index({ salaryRange: 1 });
// MasterJobSchema.index({ applicationDeadline: 1 });
// MasterJobSchema.index({ isActive: 1, processed: 1 });

// module.exports = mongoose.model('MasterJob', MasterJobSchema);
const mongoose = require('mongoose');

// Unified Master Job Schema
const MasterJobSchema = new mongoose.Schema({
  // Universal identifiers
  jobId: { type: String, required: true },
  id: String, // LinkedIn id field
  platform: {
    type: String,
    enum: ['linkedin', 'upwork', 'indeed', 'glassdoor','google'],
    required: true,
    index: true
  },
  
  // Basic job information
  title: { type: String, required: true },
  description: String,
  descriptionText: String,
  url: String,
  
  // LinkedIn specific job fields
  linkedinUrl: String,
  postedDate: Date,
  postedText: String,     // <-- add here

  expireAt: Date,
  employmentType: String,
  workplaceType: String,
  easyApplyUrl: String,
  applicants: Number,
  views: Number,
  jobApplicationLimitReached: Boolean,
  applyMethod: String,
  salary: mongoose.Schema.Types.Mixed,
  
  // LinkedIn company fields (nested structure as in your data)
  'company.linkedinUrl': String,
  'company.logo': String,
  'company.website': String,
  'company.name': String,
  'company.employeeCount': mongoose.Schema.Types.Mixed,
  'company.followerCount': Number,
  'company.description': String,
  'company.specialities': [String],
  'company.industries': [String],
  'company.locations': [{
    city: String,
    state: String,
    country: String
  }],
  
  // Upwork specific job fields
  isContractToHire: Boolean,
  isPaymentMethodVerified: Boolean,
  level: String,
  contractorTier: String,
  companyId: String,
  companyIndustry: String,
  companyContractDate: Date,
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
  fixedBudget: String, // Changed to String as per your data
  fixedDurationLabel: String,
  numberOfPositionsToHire: Number,
  premium: Boolean,
  openJobs: [mongoose.Schema.Types.Mixed],
  questions: [mongoose.Schema.Types.Mixed], // Changed to Mixed as it can be objects
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
  companyName: String, // For Upwork and other platforms
  companySize: Number,
  companyIsEDCReplicated: Boolean,
  category: String,
  categoryGroup: String,
  occupation: String,
  status: String,
  // Google extracted fields
experienceLevel: String, // <-- add
contractType: String,    // <-- add
benefits: [String],      // <-- add
jobBoard: String,        // <-- add

via: String,
thumbnail: String,
detected_extensions: mongoose.Schema.Types.Mixed,
extensions: [mongoose.Schema.Types.Mixed],
job_highlights: [mongoose.Schema.Types.Mixed],
apply_options: [mongoose.Schema.Types.Mixed],
source_query: String,
primary_hash: String,
secondary_hash: String,
hourlyRateRange: mongoose.Schema.Types.Mixed,
description_preview: String,
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
  

// // Google extracted fields
// experienceLevel: String,       // e.g., 'Junior', 'Senior', 'Lead/Principal'
// contractType: String,          // e.g., 'Contract', 'Freelance', 'Internship'
// benefits: [String],            // e.g., ['Health Insurance', 'Paid Time Off']
// jobBoard: String,               // e.g., 'google_jobs'
  // AI Analysis fields
  predicted_domain: String,
  ai_remark: String,
  final_score: mongoose.Schema.Types.Mixed, // LinkedIn uses this
  final_weighted_score: mongoose.Schema.Types.Mixed, // Upwork uses this
  tier: String,
  estimated_budget: Number,
  ae_pitched: String,
  
  // Status and comments fields (managed by companies)
  currentStatus: {
    type: String,
    enum: ['not_engaged', 'applied', 'engaged', 'interview', 'offer', 'rejected', 'onboard'],
    default: 'not_engaged'
  },
  statusHistory: {
    type: [{
      status: {
        type: String,
        enum: ['not_engaged', 'applied', 'engaged', 'interview', 'offer', 'rejected', 'onboard']
      },
      username: String,
      date: { type: Date, default: Date.now },
      notes: String,
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    default: []
  },
  comments: {
    type: [{
      username: String,
      comment: String,
      text: String,
      date: { type: Date, default: Date.now },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      isPrivate: { type: Boolean, default: false },
      type: { type: String, enum: ['general', 'status', 'follow_up'], default: 'general' }
    }],
    default: []
  },
  ae_comment: {
    type: String,
    default: ''
  },
  
  // Proposal and AE scoring fields
  proposal: { type: String, default: "" },
  ae_score: {
    type: [{
      value: Number,
      username: String,
      date: { type: Date, default: Date.now }
    }],
    default: []
  },
  
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
    },
    distributedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deliveredAt: Date,
    viewedAt: Date,
    notes: String
  }],
  
  // Metadata
  source: String,
  processed: { type: Boolean, default: false },
  processingNotes: String,
  dataVersion: { type: String, default: '1.0' },
  migrationStatus: String,
  validationErrors: [String],
  processingHistory: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
    performedBy: String,
    notes: String
  }]
}, {
  timestamps: true
});

// Compound indexes for performance
MasterJobSchema.index({ platform: 1, jobId: 1 }, { unique: true });
MasterJobSchema.index({ platform: 1, id: 1 });
MasterJobSchema.index({ platform: 1, postedDate: -1 });
MasterJobSchema.index({ platform: 1, tier: 1 });
MasterJobSchema.index({ platform: 1, final_score: -1 });
MasterJobSchema.index({ platform: 1, final_weighted_score: -1 });
MasterJobSchema.index({ skills: 1 });
MasterJobSchema.index({ country: 1 });
MasterJobSchema.index({ batchId: 1 });
MasterJobSchema.index({ distributedTo: 1 });
MasterJobSchema.index({ companyName: 1 });
MasterJobSchema.index({ 'company.name': 1 });
MasterJobSchema.index({ isActive: 1, processed: 1 });
MasterJobSchema.index({ currentStatus: 1 });
MasterJobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('MasterJob', MasterJobSchema);
