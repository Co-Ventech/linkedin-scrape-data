const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Company = require('../models/Company');
const { sendPasswordResetEmail } = require('../services/userEmail');
const router = express.Router();

// Login with email or username
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await User.findOne({ 
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
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
});

// Company self-registration (removed company username)
router.post('/company-signup', async (req, res) => {
  try {
    const { companyName, companyDescription, adminUsername, adminEmail, adminPassword } = req.body;

    if (!companyName || !adminUsername || !adminEmail || !adminPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if company exists
    const existingCompany = await Company.findOne({ name: companyName });
    if (existingCompany) {
      return res.status(400).json({ error: 'Company name already exists' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ username: adminUsername }, { email: adminEmail }] 
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Create company first
    const company = new Company({
      name: companyName,
      description: companyDescription || ''
    });

    const savedCompany = await company.save();

    // Create company admin
    const companyAdmin = new User({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword,
      role: 'company_admin',
      company: savedCompany._id
    });

    const savedAdmin = await companyAdmin.save();
    
    // Update company with admin reference
    savedCompany.admin = savedAdmin._id;
    await savedCompany.save();

    res.status(201).json({
      message: 'Company registered successfully',
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
});

// Forgot password - send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email }).populate('company');
    if (!user) {
      return res.json({ message: 'If the email exists, a password reset link has been sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Send reset email
    try {
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      await sendPasswordResetEmail(email, user.username, resetLink);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ error: 'Failed to send reset email' });
    }

    res.json({ message: 'If the email exists, a password reset link has been sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
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
});
// Add better error handling and validation
router.post('/forgot-password', async (req, res) => {
  try {
    console.log('Forgot password request:', req.body); // Debug log
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email }).populate('company');
    if (!user || !user.isActive) {
      // Return success even if user not found (security)
      return res.json({ message: 'If the email exists, a password reset link has been sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Send reset email
    try {
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      await sendPasswordResetEmail(email, user.username, resetLink);
      
      res.json({ message: 'Password reset link sent to your email' });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      // Clean up the token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ error: 'Failed to send reset email' });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
