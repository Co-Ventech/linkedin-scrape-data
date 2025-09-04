
const mongoose = require('mongoose');

const CompanyJobSchema = new mongoose.Schema({
  // Reference to master job (NO DATA DUPLICATION)
  masterJobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterJob',
    required: true
  },
  
  // Company reference
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // Company-specific fields ONLY (no job data duplication)
  currentStatus: {
    type: String,
    enum: ['not_engaged', 'applied', 'engaged', 'interview', 'offer', 'rejected', 'onboard', 'archived'],
    default: 'not_engaged'
  },
  
  statusHistory: [{
    status: {
      type: String,
      enum: ['not_engaged', 'applied', 'engaged', 'interview', 'offer', 'rejected', 'onboard', 'archived']
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    date: { type: Date, default: Date.now },
    notes: String
  }],
  
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    comment: String,
    date: { type: Date, default: Date.now },
    isPrivate: { type: Boolean, default: false }
  }],
  
  // Company-specific tracking
  proposal: { type: String, default: "" },
  applicationDate: Date,
  responseDate: Date,
  
  companyScore: [{
    value: Number,
    scoredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    date: { type: Date, default: Date.now },
    notes: String
  }],
  
  // Custom fields per company
  customFields: mongoose.Schema.Types.Mixed,
  
  // Tracking
  viewedBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    viewedAt: { type: Date, default: Date.now }
  }],
  
  isBookmarked: { type: Boolean, default: false },
  bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Distribution metadata
  distributedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for performance
CompanyJobSchema.index({ companyId: 1, currentStatus: 1 });
CompanyJobSchema.index({ companyId: 1, platform: 1 });
CompanyJobSchema.index({ masterJobId: 1, companyId: 1 }, { unique: true });

module.exports = mongoose.model('CompanyJob', CompanyJobSchema);