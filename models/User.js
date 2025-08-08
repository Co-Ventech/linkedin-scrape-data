// // const mongoose = require('mongoose');
// // const bcrypt = require('bcryptjs');

// // const userSchema = new mongoose.Schema({
// //   username: { 
// //     type: String, 
// //     required: true, 
// //     unique: true 
// //   },
// //   email: { 
// //     type: String, 
// //     required: true, 
// //     unique: true 
// //   },
// //   password: { 
// //     type: String, 
// //     required: true 
// //   },
// //   role: { 
// //     type: String, 
// //     enum: ['super_admin', 'company_admin', 'user'], 
// //     required: true 
// //   },
// //   company: { 
// //     type: mongoose.Schema.Types.ObjectId, 
// //     ref: 'Company'
// //   },
// //   isActive: { 
// //     type: Boolean, 
// //     default: true 
// //   },
// //   // Password reset fields
// //   resetPasswordToken: String,
// //   resetPasswordExpires: Date
// // }, {
// //   timestamps: true
// // });

// // userSchema.pre('save', async function(next) {
// //   if (!this.isModified('password')) return next();
// //   this.password = await bcrypt.hash(this.password, 12);
// //   next();
// // });

// // userSchema.methods.comparePassword = async function(password) {
// //   return bcrypt.compare(password, this.password);
// // };

// // module.exports = mongoose.model('User', userSchema);
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   username: { 
//     type: String, 
//     required: true, 
//     unique: true 
//   },
//   email: { 
//     type: String, 
//     required: true, 
//     unique: true 
//   },
//   password: { 
//     type: String, 
//     required: true 
//   },
//   role: { 
//     type: String, 
//     enum: ['super_admin', 'company_admin', 'company_user'], // ✅ Fixed: Changed 'user' to 'company_user'
//     required: true,
//     default: 'company_user' // ✅ Added default role
//   },
//   company: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Company',
//     required: function() {
//       return this.role !== 'super_admin'; // ✅ Company required for non-super-admin users
//     }
//   },
//   isActive: { 
//     type: Boolean, 
//     default: true 
//   },
//   // Password reset fields
//   resetPasswordToken: String,
//   resetPasswordExpires: Date,
  
//   // ✅ Additional useful fields for user management
//   lastLogin: Date,
//   loginCount: {
//     type: Number,
//     default: 0
//   }
// }, {
//   timestamps: true
// });

// // Hash password before saving
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// // Compare password method
// userSchema.methods.comparePassword = async function(password) {
//   return bcrypt.compare(password, this.password);
// };

// // ✅ Method to update login statistics
// userSchema.methods.updateLoginStats = async function() {
//   this.lastLogin = new Date();
//   this.loginCount += 1;
//   return this.save();
// };

// // ✅ Virtual to get user's display name
// userSchema.virtual('displayName').get(function() {
//   return this.username || this.email.split('@')[0];
// });

// // ✅ Method to check if user can access company resources
// userSchema.methods.canAccessCompany = function(companyId) {
//   if (this.role === 'super_admin') return true;
//   return this.company && this.company.toString() === companyId.toString();
// };

// // ✅ Index for better query performance
// userSchema.index({ email: 1 });
// userSchema.index({ company: 1, role: 1 });
// userSchema.index({ isActive: 1 });

// module.exports = mongoose.model('User', userSchema);
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
  }
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
