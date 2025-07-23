
// models/jobBatchSchema.js
const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
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
    country: String
  }]
}, { _id: false });

const JobSchema = new mongoose.Schema({
  id: String,
  title: String,
  linkedinUrl: String,
  postedDate: Date,
  expireAt: Date,
  descriptionText: String,
  employmentType: String,
  workplaceType: String,
  easyApplyUrl: String,
  applicants: Number,
  views: Number,
  jobApplicationLimitReached: Boolean,
  applyMethod: String,
  salary: mongoose.Schema.Types.Mixed,
  company: CompanySchema,

  // Status and comments fields
  status: {
    type: String,
    enum: ['not_engaged', 'applied', 'engaged', 'interview', 'offer', 'rejected', 'archived'],
    default: 'not_engaged'
  },
  // comments: {
  //   type: [String],
  //   default: []
  // },
  // comments: {
  //   type: [
  //     {
  //       username: String,
  //       comment: String,
  //       date: { type: Date, default: Date.now }
  //     }
  //   ],
  //   default: []
  // },
// ... existing code ...
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
// ... existing code ...
  // KPI fields
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

  // AI Prediction for domain and remarks by AI
  predicted_domain: String,
  ai_remark: String,
  final_score: mongoose.Schema.Types.Mixed,
  tier: String
}, { _id: false });

const BatchSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  jobs: [JobSchema]
}, { _id: false });

const UserJobBatchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  batches: [BatchSchema]
});

module.exports = mongoose.model('UserLinkedinJobBatch', UserJobBatchSchema);