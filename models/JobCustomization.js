const mongoose = require('mongoose');

const JobCustomizationSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    unique: true
  },
  
  // Platform preferences
  enabledPlatforms: [{
    platform: {
      type: String,
      enum: ['linkedin', 'upwork', 'indeed', 'glassdoor']
    },
    isEnabled: { type: Boolean, default: true },
    priority: { type: Number, default: 1 } // 1-10 priority
  }],
  
  // Filtering preferences
  filters: {
    // Skills filter
    requiredSkills: [String],
    excludedSkills: [String],
    
    // Location filter
    preferredLocations: [String],
    excludedLocations: [String],
    remoteOnly: { type: Boolean, default: false },
    
    // Budget/Salary filter
    budgetRange: {
      min: Number,
      max: Number,
      currency: String
    },
    
    // Experience level
    experienceLevels: [String], // entry, intermediate, expert
    
    // Employment type
    employmentTypes: [String], // full-time, part-time, contract
    
    // Company size preference
    companySizeRange: {
      min: Number,
      max: Number
    },
    
    // Keywords
    includeKeywords: [String],
    excludeKeywords: [String],
    
    // Minimum scores
    minimumScores: {
      domainFit: Number,
      budgetAttractiveness: Number,
      companyReputation: Number,
      skillMatch: Number,
      overall: Number
    }
  },
  
  // Auto-actions
  autoActions: {
    autoArchiveAfterDays: Number,
    autoApplyToHighScored: { type: Boolean, default: false },
    autoApplyScoreThreshold: Number,
    autoRejectLowScored: { type: Boolean, default: false },
    autoRejectScoreThreshold: Number
  },
  
  // Notification preferences
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    newJobsDaily: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: true },
    highPriorityJobs: { type: Boolean, default: true }
  },
  
  // Custom statuses (in addition to default ones)
  customStatuses: [{
    name: String,
    color: String,
    description: String,
    isActive: { type: Boolean, default: true }
  }],
  
  // Custom fields for jobs
  customFields: [{
    name: String,
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'boolean', 'select']
    },
    options: [String], // for select type
    isRequired: { type: Boolean, default: false },
    defaultValue: mongoose.Schema.Types.Mixed
  }],
  
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('JobCustomization', JobCustomizationSchema);
