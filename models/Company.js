const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  description: String,
  admin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  // ✅ Fixed subscription fields - allow any string values
  subscriptionPlan: { 
    type: String, // ✅ Removed enum restriction
    default: 'trial'
  },
  subscriptionStatus: { 
    type: String, 
    enum: ["active", "inactive", "trial", "expired", "cancelled"], 
    default: "trial" 
  },
  subscriptionStartDate: {
    type: Date,
    default: Date.now
  },
  subscriptionEndDate: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days trial
    }
  },
  jobsQuota: {
    type: Number,
    default: 50
  },
  jobsUsed: {
    type: Number,
    default: 0
  },
  lastJobSync: Date,
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  phone: { type: String, default: '' },
  location: { type: String, default: '' }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("Company", companySchema);
