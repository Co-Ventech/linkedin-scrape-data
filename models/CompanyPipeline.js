// models/CompanyPipeline.js
const mongoose = require('mongoose');

const StatusStageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true
  },
  description: String,
  color: {
    type: String,
    default: '#007bff' // hex color code
  },
  sortOrder: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Define which statuses can transition to this one
  allowedTransitionsFrom: [{
    type: String // status names
  }],
  // Define which statuses this can transition to
  allowedTransitionsTo: [{
    type: String // status names
  }],
  // Automation rules (optional)
  autoActions: {
    emailNotification: Boolean,
    slackNotification: Boolean,
    webhookUrl: String
  }
}, { _id: false });

const CompanyPipelineSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    unique: true
  },
  
  name: {
    type: String,
    default: 'Default Pipeline'
  },
  
  description: String,
  
  // Custom status stages
  statusStages: [StatusStageSchema],
  
  // Pipeline settings
  settings: {
    allowSkipStages: { type: Boolean, default: true },
    requireCommentOnStatusChange: { type: Boolean, default: false },
    enableAutoProgressions: { type: Boolean, default: false },
    defaultInitialStatus: { type: String, default: 'not_engaged' }
  },
  
  // Fallback to system default if custom is disabled
  useCustomPipeline: {
    type: Boolean,
    default: false
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Default pipeline creation
CompanyPipelineSchema.statics.createDefaultPipeline = function(companyId, createdBy) {
  const defaultStages = [
    {
      name: 'not_engaged',
      displayName: 'Not Engaged',
      description: 'Job has been distributed but no action taken',
      color: '#6c757d',
      sortOrder: 1,
      allowedTransitionsTo: ['applied', 'rejected', 'archived']
    },
    {
      name: 'applied',
      displayName: 'Applied',
      description: 'Application has been submitted',
      color: '#007bff',
      sortOrder: 2,
      allowedTransitionsFrom: ['not_engaged'],
      allowedTransitionsTo: ['engaged', 'rejected']
    },
    {
      name: 'engaged',
      displayName: 'Engaged',
      description: 'Initial contact/response received',
      color: '#17a2b8',
      sortOrder: 3,
      allowedTransitionsFrom: ['applied'],
      allowedTransitionsTo: ['interview', 'rejected']
    },
    {
      name: 'interview',
      displayName: 'Interview',
      description: 'Interview scheduled or completed',
      color: '#ffc107',
      sortOrder: 4,
      allowedTransitionsFrom: ['engaged'],
      allowedTransitionsTo: ['offer', 'rejected']
    },
    {
      name: 'offer',
      displayName: 'Offer',
      description: 'Job offer received',
      color: '#28a745',
      sortOrder: 5,
      allowedTransitionsFrom: ['interview'],
      allowedTransitionsTo: ['onboard', 'rejected']
    },
    {
      name: 'onboard',
      displayName: 'Onboarded',
      description: 'Successfully onboarded',
      color: '#20c997',
      sortOrder: 6,
      allowedTransitionsFrom: ['offer']
    },
    {
      name: 'rejected',
      displayName: 'Rejected',
      description: 'Application rejected',
      color: '#dc3545',
      sortOrder: 7,
      allowedTransitionsFrom: ['not_engaged', 'applied', 'engaged', 'interview', 'offer']
    },
    {
      name: 'archived',
      displayName: 'Archived',
      description: 'Job archived/no longer relevant',
      color: '#868e96',
      sortOrder: 8,
      allowedTransitionsFrom: ['not_engaged', 'rejected']
    }
  ];

  return this.create({
    companyId,
    name: 'Default Pipeline',
    description: 'Standard job application pipeline',
    statusStages: defaultStages,
    useCustomPipeline: false,
    createdBy
  });
};
CompanyPipelineSchema.statics.createCustomPipeline = function(companyId, createdBy, stages, settings = {}) {
    const sorted = (stages || []).slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return this.create({
      companyId,
      name: 'Custom Pipeline',
      description: 'Company-specific pipeline',
      statusStages: sorted.map((s, i) => ({
        name: s.name,
        displayName: s.displayName || s.name,
        description: s.description || '',
        color: s.color || '#007bff',
        sortOrder: s.sortOrder ?? (i + 1),
        allowedTransitionsFrom: s.allowedTransitionsFrom || [],
        allowedTransitionsTo: s.allowedTransitionsTo || [],
        autoActions: s.autoActions || {}
      })),
      settings: {
        allowSkipStages: settings.allowSkipStages ?? true,
        requireCommentOnStatusChange: settings.requireCommentOnStatusChange ?? false,
        enableAutoProgressions: settings.enableAutoProgressions ?? false,
        defaultInitialStatus: settings.defaultInitialStatus || 'not_engaged'
      },
      useCustomPipeline: true,
      createdBy
    });
  };
module.exports = mongoose.model('CompanyPipeline', CompanyPipelineSchema);
