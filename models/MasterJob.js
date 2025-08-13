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
  companyIndustry: String,
  companySize: Number,
  companyContractDate: Date,
  companyIsEDCReplicated: Boolean
}, { _id: false });

// Unified Master Job Schema
const MasterJobSchema = new mongoose.Schema({
  // Universal identifiers
  jobId: { type: String, required: true },
  id: String, // LinkedIn id field
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
  
  // Status and comments fields (from both batch files)
  currentStatus: {
    type: String,
    enum: ['not_engaged', 'applied', 'engaged', 'interview', 'offer', 'rejected', 'onboard'],
    default: 'not_engaged'
  },
  statusHistory: {
    type: [
      {
        status: {
          type: String,
          enum: ['not_engaged', 'applied', 'engaged', 'interview', 'offer', 'rejected', 'onboard']
        },
        username: String,
        date: { type: Date, default: Date.now }
      }
    ],
    default: []
  },
  comments: {
    type: [
      {
        username: String,
        comment: String,
        date: { type: Date, default: Date.now }
      }
    ],
    default: []
  },
  ae_comment: {
    type: String,
    default: ''
  },
  
  // Proposal and AE scoring fields (from both batch files)
  proposal: { type: String, default: "" },
  ae_score: {
    type: [
      {
        value: Number,
        username: String,
        date: { type: Date, default: Date.now }
      }
    ],
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
MasterJobSchema.index({ platform: 1, id: 1 });
MasterJobSchema.index({ platform: 1, postedDate: -1 });
MasterJobSchema.index({ platform: 1, tier: 1 });
MasterJobSchema.index({ platform: 1, final_score: -1 });
MasterJobSchema.index({ skills: 1 });
MasterJobSchema.index({ country: 1 });
MasterJobSchema.index({ batchId: 1 });
MasterJobSchema.index({ distributedTo: 1 });

module.exports = mongoose.model('MasterJob', MasterJobSchema);