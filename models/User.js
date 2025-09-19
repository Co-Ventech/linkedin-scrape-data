
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
    // ✅ Removed: index: true (since unique already creates an index)
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['super_admin', 'company_admin', 'company_user'],
    required: true,
    default: 'company_user'
  },
  company: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company',
    required: function() {
      return this.role !== 'super_admin';
    }
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  },
  phone: { type: String, default: '' },
  location: { type: String, default: '' }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// ✅ REMOVED: Duplicate index declaration
// userSchema.index({ email: 1 }); // This was causing the duplicate warning

// ✅ Keep only necessary indexes (avoid duplicates with unique fields)
userSchema.index({ company: 1, role: 1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', userSchema);
