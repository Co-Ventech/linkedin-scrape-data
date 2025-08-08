const mongoose = require('mongoose');

const jobBatchSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    unique: true // ✅ This creates an index automatically
    // ✅ Removed: index: true (to avoid duplicate)
  },
  platform: {
    type: String,
    enum: ['linkedin', 'upwork', 'indeed', 'glassdoor'],
    required: true
  },
  status: {
    type: String,
    enum: ['running', 'completed', 'failed'],
    default: 'running'
  },
  executedBy: String,
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  stats: {
    totalJobsScraped: { type: Number, default: 0 },
    newJobsAdded: { type: Number, default: 0 },
    duplicatesSkipped: { type: Number, default: 0 },
    errorsEncountered: { type: Number, default: 0 }
  },
  distribution: {
    companiesNotified: { type: Number, default: 0 },
    jobsDistributed: { type: Number, default: 0 },
    distributionErrors: { type: Number, default: 0 }
  },
  parameters: mongoose.Schema.Types.Mixed,
  errorLogs: [{
    error: String,
    jobId: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  processingNotes: String
}, {
  timestamps: true
});

// ✅ Remove duplicate index declaration
// jobBatchSchema.index({ batchId: 1 }); // This was causing the duplicate warning

// ✅ Keep only necessary compound indexes
jobBatchSchema.index({ platform: 1, status: 1 });
jobBatchSchema.index({ createdAt: -1 });

module.exports = mongoose.model('JobBatch', jobBatchSchema);
