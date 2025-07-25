// const mongoose = require('mongoose');

// const UpworkJobSchema = new mongoose.Schema({
//   jobId: { type: String, required: true, unique: true },
//   title: String,
//   description: String,
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
//   tags: [String],
//   skills: [String],
//   minHoursWeek: Number,
//   lastBuyerActivity: String,

//   // Additional fields
//   city: String,
//   country: String,
//   countryTimezone: String,
//   utcOffsetMillis: Number,
//   companyName: String,
//   companySize: Number,
//   companyIsEDCReplicated: Boolean,
//   clientTotalHours: Number,
//   clientTotalSpend: Number,
//   clientRisingTalent: Boolean,
//   category: String,
//   categoryGroup: String,
//   occupation: String,
//   jobType: String,
//   fixedBudget: Number,
//   fixedDurationLabel: String,
//   numberOfPositionsToHire: Number,
//   premium: Boolean,
//   openJobs: [mongoose.Schema.Types.Mixed], // Array of objects
//   questions: [String],
//   status: String,
//   url: String,
//   qualificationsCountries: [String],
//   qualificationsLanguages: [String],
//   qualificationsMinJobSuccessScore: Number,
//   qualificationsRisingTalent: Boolean,
//   qualificationsLocationCheckRequired: Boolean,
//   ts_create: Date,
//   ts_publish: Date,
//   ts_sourcing: Date
// }, { timestamps: true });

// module.exports = mongoose.model('UpworkJob', UpworkJobSchema);

// models/upworkJobBatch.js
const mongoose = require('mongoose');

const UpworkJobSchema = new mongoose.Schema({
  jobId: String,
  title: String,
  description: String,
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
  tags: [String],
  skills: [String],
  minHoursWeek: Number,
  lastBuyerActivity: String,
  city: String,
  country: String,
  countryTimezone: String,
  utcOffsetMillis: Number,
  companyName: String,
  companySize: Number,
  companyIsEDCReplicated: Boolean,
  clientTotalHours: Number,
  clientTotalSpend: Number,
  clientRisingTalent: Boolean,
  category: String,
  categoryGroup: String,
  occupation: String,
  jobType: String,
  fixedBudget: Number,
  fixedDurationLabel: String,
  numberOfPositionsToHire: Number,
  premium: Boolean,
  openJobs: [mongoose.Schema.Types.Mixed],
  questions: [String],
  status: String,
  url: String,
  qualificationsCountries: [String],
  qualificationsLanguages: [String],
  qualificationsMinJobSuccessScore: Number,
  qualificationsRisingTalent: Boolean,
  qualificationsLocationCheckRequired: Boolean,
  ts_create: Date,
  ts_publish: Date,
  ts_sourcing: Date,

  //comment and status

  currentStatus: {
    type: String,
    enum: ['not_engaged', 'applied', 'engaged', 'interview', 'offer', 'rejected', 'archived'],
    default: 'not_engaged'
  },
  statusHistory: {
    type: [
      {
        status: {
          type: String,
          enum: ['not_engaged', 'applied', 'engaged', 'interview', 'offer', 'rejected', 'archived']
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
  
  // KPI and AI fields
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
  proposal: { type: String, default: "" },
  ae_score: { type: Number, default: 0 },

  final_weighted_score: mongoose.Schema.Types.Mixed,
  tier: String,
  ai_remark: String
}, { _id: false });

const BatchSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  jobs: [UpworkJobSchema]
}, { _id: false });

const UpworkUserJobBatchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  batches: [BatchSchema]
});

module.exports = mongoose.model('UpworkUserJobBatch', UpworkUserJobBatchSchema);