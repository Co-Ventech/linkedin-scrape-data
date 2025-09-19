

// const User = require('../models/User'); // ✅ Changed from authModel to User
// const Company = require('../models/Company');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const express = require('express');
// const crypto = require('crypto');

// const { sendPasswordResetEmail } = require('../services/userEmail');
// const authController = require('../controllers/authController');


// const CompanyPipeline = require('../models/CompanyPipeline');

// const generateToken = (userId, role, companyId = null) => {
//   return jwt.sign(
//     { 
//       userId,
//       role,
//       companyId
//     }, 
//     process.env.JWT_SECRET || 'your-secret-key', 
//     { expiresIn: '24h' } // ✅ Changed from 365d to 24h for security
//   );
// };


// // controllers/authController.js (add/replace this function)
// exports.companySignup = async (req, res) => {
//   try {
//     const { 
//       companyName, 
//       companyDescription, 
//       adminEmail, 
//       adminUsername, 
//       adminPassword,
//       pipeline
//     } = req.body;

//     if (!companyName || !adminEmail || !adminUsername || !adminPassword) {
//       return res.status(400).json({ 
//         error: 'Company name, admin email, username, and password are required' 
//       });
//     }

//     const existingCompany = await Company.findOne({ name: companyName });
//     if (existingCompany) {
//       return res.status(400).json({ error: 'Company name already exists' });
//     }
//     const existingUser = await User.findOne({ 
//       $or: [{ email: adminEmail }, { username: adminUsername }] 
//     });
//     if (existingUser) {
//       return res.status(400).json({ error: 'Admin email or username already exists' });
//     }

//     const company = new Company({
//       name: companyName,
//       description: companyDescription || '',
//       subscriptionPlan: 'trial',
//       subscriptionStatus: 'trial',
//       jobsQuota: 50,
//       jobsUsed: 0,
//       subscriptionStartDate: new Date(),
//       subscriptionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//       isActive: true
//     });
//     await company.save();

//     const admin = new User({
//       username: adminUsername,
//       email: adminEmail,
//       password: adminPassword,
//       role: 'company_admin',
//       company: company._id,
//       isActive: true
//     });
//     await admin.save();

//     company.admin = admin._id;
//     await company.save();

//     // Create pipeline (default or custom)
//     const CompanyPipeline = require('../models/CompanyPipeline');
//     const p = pipeline || {};
//     if (p.mode === 'custom' && Array.isArray(p.stages) && p.stages.length) {
//       await CompanyPipeline.createCustomPipeline(company._id, admin._id, p.stages, p.settings);
//     } else {
//       await CompanyPipeline.createDefaultPipeline(company._id, admin._id);
//     }

//     // Issue token
//     const token = jwt.sign(
//       { userId: admin._id, role: admin.role, companyId: company._id },
//       process.env.JWT_SECRET || 'your-secret-key',
//       { expiresIn: '24h' }
//     );

//     res.status(201).json({
//       message: 'Company and admin created successfully',
//       token,
//       user: {
//         id: admin._id,
//         username: admin.username,
//         email: admin.email,
//         role: admin.role,
//         company: {
//           _id: company._id,
//           name: company.name,
//           description: company.description,
//           subscriptionPlan: company.subscriptionPlan,
//           subscriptionStatus: company.subscriptionStatus
//         }
//       }
//     });
//   } catch (err) {
//     console.error('Company signup error:', err);
//     res.status(500).json({ error: 'Company signup failed', details: err.message });
//   }
// };
// // exports.signup = async (req, res) => {
// //   try {
// //     const { username, email, password } = req.body;

// //     // ✅ Enhanced validation
// //     if (!username || !email || !password) {
// //       return res.status(400).json({ 
// //         error: "Username, email, and password are required" 
// //       });
// //     }

// //     if (password.length < 6) {
// //       return res.status(400).json({ 
// //         error: "Password must be at least 6 characters long" 
// //       });
// //     }

// //     // Check if user already exists
// //     const existingUser = await User.findOne({ 
// //       $or: [{ email }, { username }] 
// //     });
    
// //     if (existingUser) {
// //       const field = existingUser.email === email ? 'email' : 'username';
// //       return res.status(400).json({ 
// //         error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
// //       });
// //     }

// //     // Create user with company_user role by default
// //     const user = new User({
// //       username,
// //       email,
// //       password, // Will be hashed by pre-save middleware
// //       role: 'company_user',
// //       isActive: true
// //     });

// //     await user.save();

// //     // Generate token
// //     const token = generateToken(user._id, user.role, user.company);

// //     // Remove sensitive data
// //     const userResponse = {
// //       id: user._id,
// //       username: user.username,
// //       email: user.email,
// //       role: user.role,
// //       company: user.company
// //     };

// //     res.status(201).json({
// //       message: 'User created successfully',
// //       token,
// //       user: userResponse
// //     });

// //   } catch (err) {
// //     console.error('Signup error:', err);
// //     res.status(500).json({ 
// //       error: "Signup failed", 
// //       details: err.message 
// //     });
// //   }
// // };

// // exports.login = async (req, res) => {
// //   try {
// //     console.log('Login request body:', req.body); // Debug log

// //     // ✅ Handle both emailOrUsername and email fields
// //     const { emailOrUsername, email, username, password } = req.body;
    
// //     // Use the appropriate field
// //     const loginValue = emailOrUsername || email || username;

// //     if (!loginValue || !password) {
// //       return res.status(400).json({ 
// //         error: 'Email/username and password are required',
// //         received: { 
// //           emailOrUsername: !!emailOrUsername, 
// //           email: !!email, 
// //           username: !!username, 
// //           password: !!password 
// //         }
// //       });
// //     }

// //     // Find user by email or username and populate company
// //     let user;
// //     if (loginValue.includes('@')) {
// //       user = await User.findOne({ email: loginValue })
// //         .populate('company', 'name description isActive subscriptionPlan subscriptionStatus jobsQuota jobsUsed subscriptionStartDate subscriptionEndDate');
// //     } else {
// //       user = await User.findOne({ username: loginValue })
// //         .populate('company', 'name description isActive subscriptionPlan subscriptionStatus jobsQuota jobsUsed subscriptionStartDate subscriptionEndDate');
// //     }

// //     if (!user) {
// //       return res.status(401).json({ error: 'Invalid credentials' });
// //     }

// //     // Check if user is active
// //     if (!user.isActive) {
// //       return res.status(401).json({ error: 'Account is deactivated' });
// //     }

// //     // Check if company is active (for non-super-admin users)
// //     if (user.role !== 'super_admin' && user.company && !user.company.isActive) {
// //       return res.status(401).json({ error: 'Company account is deactivated' });
// //     }

// //     // Verify password
// //     const isPasswordValid = await user.comparePassword(password);
// //     if (!isPasswordValid) {
// //       return res.status(401).json({ error: 'Invalid credentials' });
// //     }

// //     // Update login statistics if the method exists
// //     if (typeof user.updateLoginStats === 'function') {
// //       await user.updateLoginStats();
// //     }

// //     // Generate JWT token
// //     const token = generateToken(
// //       user._id, 
// //       user.role, 
// //       user.company?._id
// //     );

// //     // Prepare user response
// //     const userResponse = {
// //       id: user._id,
// //       username: user.username,
// //       email: user.email,
// //       role: user.role,
// //       company: user.company ? {
// //         _id: user.company._id,
// //         name: user.company.name,
// //         description: user.company.description,
// //         isActive: user.company.isActive,
// //         subscriptionPlan: user.company.subscriptionPlan,
// //         subscriptionStatus: user.company.subscriptionStatus,
// //         jobsQuota: user.company.jobsQuota,
// //         jobsUsed: user.company.jobsUsed,
// //         subscriptionStartDate: user.company.subscriptionStartDate,
// //         subscriptionEndDate: user.company.subscriptionEndDate
// //       } : null
// //     };

// //     res.status(200).json({
// //       message: 'Login successful',
// //       token,
// //       user: userResponse
// //     });

// //   } catch (err) {
// //     console.error('Login error:', err);
// //     res.status(500).json({ 
// //       error: "Login failed", 
// //       details: err.message 
// //     });
// //   }
// // };

// // exports.dashboard = async (req, res) => {
// //   try {
// //     // ✅ Use userId from JWT payload instead of id
// //     const userId = req.user.userId || req.user.id;
    
// //     const user = await User.findById(userId)
// //       .select("-password -resetPasswordToken -resetPasswordExpires")
// //       .populate('company', 'name description isActive subscriptionPlan subscriptionStatus jobsQuota jobsUsed');

// //     if (!user) {
// //       return res.status(404).json({ error: "User not found" });
// //     }

// //     if (!user.isActive) {
// //       return res.status(401).json({ error: "Account is deactivated" });
// //     }

// //     res.status(200).json({ 
// //       message: "Welcome to dashboard", 
// //       user,
// //       role: user.role,
// //       company: user.company
// //     });

// //   } catch (err) {
// //     console.error('Dashboard access error:', err);
// //     res.status(500).json({ 
// //       error: "Access failed", 
// //       details: err.message 
// //     });
// //   }
// // };

// // // ✅ Additional method for company signup (from previous conversation)
// // exports.companySignup = async (req, res) => {
// //   try {
// //     const { 
// //       companyName, 
// //       companyDescription, 
// //       adminEmail, 
// //       adminUsername, 
// //       adminPassword 
// //     } = req.body;

// //     // Validation
// //     if (!companyName || !adminEmail || !adminUsername || !adminPassword) {
// //       return res.status(400).json({ 
// //         error: 'Company name, admin email, username, and password are required' 
// //       });
// //     }

// //     // Check if company or admin already exists
// //     const existingCompany = await Company.findOne({ name: companyName });
// //     if (existingCompany) {
// //       return res.status(400).json({ error: 'Company name already exists' });
// //     }

// //     const existingUser = await User.findOne({ 
// //       $or: [{ email: adminEmail }, { username: adminUsername }] 
// //     });
// //     if (existingUser) {
// //       return res.status(400).json({ error: 'Admin email or username already exists' });
// //     }

// //     // Create company
// //     const company = new Company({
// //       name: companyName,
// //       description: companyDescription || '',
// //       subscriptionPlan: 'trial',
// //       subscriptionStatus: 'trial',
// //       jobsQuota: 50,
// //       jobsUsed: 0,
// //       subscriptionStartDate: new Date(),
// //       subscriptionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
// //       isActive: true
// //     });

// //     await company.save();

// //     // Create admin user
// //     const admin = new User({
// //       username: adminUsername,
// //       email: adminEmail,
// //       password: adminPassword,
// //       role: 'company_admin',
// //       company: company._id,
// //       isActive: true
// //     });

// //     await admin.save();

// //     // Update company with admin reference
// //     company.admin = admin._id;
// //     await company.save();

// //     // Generate token
// //     const token = generateToken(admin._id, admin.role, company._id);

// //     // Response
// //     const userResponse = {
// //       id: admin._id,
// //       username: admin.username,
// //       email: admin.email,
// //       role: admin.role,
// //       company: {
// //         _id: company._id,
// //         name: company.name,
// //         description: company.description,
// //         subscriptionPlan: company.subscriptionPlan,
// //         subscriptionStatus: company.subscriptionStatus
// //       }
// //     };

// //     res.status(201).json({
// //       message: 'Company and admin created successfully',
// //       token,
// //       user: userResponse
// //     });

// //   } catch (err) {
// //     console.error('Company signup error:', err);
// //     res.status(500).json({ 
// //       error: "Company signup failed", 
// //       details: err.message 
// //     });
// //   }
// // };


// controllers/authController.js (add these, keep your existing exports.login)
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Company = require('../models/Company');
const CompanyPipeline = require('../models/CompanyPipeline');
const { sendPasswordResetEmail } = require('../services/userEmail');



exports.login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    const user = await User.findOne({ 
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    }).populate('company');

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        company: user.company
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.companySignup = async (req, res) => {
  try {
    const { 
      companyName, 
      companyDescription, 
      adminUsername, 
      adminEmail, 
      adminPassword,
      pipeline
    } = req.body;

    if (!companyName || !adminUsername || !adminEmail || !adminPassword) {
      return res.status(400).json({ error: 'Company name, admin username, admin email and password are required' });
    }

    const existingCompany = await Company.findOne({ name: companyName });
    if (existingCompany) {
      return res.status(400).json({ error: 'Company name already exists' });
    }

    const existingUser = await User.findOne({ 
      $or: [{ username: adminUsername }, { email: adminEmail }] 
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const company = new Company({
      name: companyName,
      description: companyDescription || ''
    });
    const savedCompany = await company.save();

    const admin = new User({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword,
      role: 'company_admin',
      company: savedCompany._id
    });
    const savedAdmin = await admin.save();

    savedCompany.admin = savedAdmin._id;
    await savedCompany.save();

    const p = pipeline || {};
    if (p.mode === 'custom' && Array.isArray(p.stages) && p.stages.length) {
      await CompanyPipeline.createCustomPipeline(savedCompany._id, savedAdmin._id, p.stages, p.settings);
    } else {
      await CompanyPipeline.createDefaultPipeline(savedCompany._id, savedAdmin._id);
    }

    const token = jwt.sign(
      { userId: savedAdmin._id, role: savedAdmin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Company registered successfully',
      token,
      company: {
        id: savedCompany._id,
        name: savedCompany.name,
        description: savedCompany.description
      },
      admin: {
        id: savedAdmin._id,
        username: savedAdmin.username,
        email: savedAdmin.email
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email }).populate('company');
    if (!user || !user.isActive) {
      return res.json({ message: 'If the email exists, a password reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(email, user.username, resetLink);

    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};