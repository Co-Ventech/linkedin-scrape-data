// controllers/companyController.js
const crypto = require('crypto');
const Company = require('../models/Company');
const User = require('../models/User');
const CompanyPipeline = require('../models/CompanyPipeline');
const { sendInvitationEmail } = require('../services/userEmail');

// GET /api/companies (super_admin)
exports.listCompanies = async (req, res) => {
  try {
    const companies = await Company.find().populate('admin', 'username email');
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/companies/:id (super_admin or same company_admin)
exports.getCompanyDetails = async (req, res) => {
  try {
    const companyId = req.params.id;

    if (req.user.role === 'super_admin') {
      const company = await Company.findById(companyId).populate('admin', 'username email');
      if (!company) return res.status(404).json({ error: 'Company not found' });
      return res.json(company);
    } else if (req.user.role === 'company_admin' && req.user.company._id.toString() === companyId) {
      const company = await Company.findById(companyId).populate('admin', 'username email');
      return res.json(company);
    }

    return res.status(403).json({ error: 'Access denied' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/companies (super_admin) - create company + admin + pipeline (default/custom)
exports.createCompanyWithAdmin = async (req, res) => {
  try {
    const { companyName, companyDescription, adminEmail, pipeline } = req.body;

    if (!companyName || !adminEmail) {
      return res.status(400).json({ error: 'Company name and admin email are required' });
    }

    const existingCompany = await Company.findOne({ name: companyName });
    if (existingCompany) {
      return res.status(400).json({ error: 'Company name already exists' });
    }

    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const temporaryPassword = crypto.randomBytes(8).toString('hex');
    const adminUsername = adminEmail.split('@')[0] + '_admin';

    const company = new Company({
      name: companyName,
      description: companyDescription || '',
      phone: req.body.phone || '',
      location: req.body.location || ''
    });
    const savedCompany = await company.save();

    const companyAdmin = new User({
      username: adminUsername,
      email: adminEmail,
      password: temporaryPassword,
      role: 'company_admin',
      company: savedCompany._id,
      phone: req.body.phone || '',
      location: req.body.location || ''
    });
    const savedAdmin = await companyAdmin.save();

    savedCompany.admin = savedAdmin._id;
    await savedCompany.save();

    try {
      const loginLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
      await sendInvitationEmail(adminEmail, companyName, temporaryPassword, loginLink);
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
    }

    const p = pipeline || {};
    if (p.mode === 'custom' && Array.isArray(p.stages) && p.stages.length) {
      await CompanyPipeline.createCustomPipeline(
        savedCompany._id,
        savedAdmin._id,
        p.stages,
        p.settings
      );
    } else {
      await CompanyPipeline.createDefaultPipeline(savedCompany._id, savedAdmin._id);
    }

    res.status(201).json({
      message: 'Company created and invitation sent successfully',
      company: {
        id: savedCompany._id,
        name: savedCompany.name,
        description: savedCompany.description
      },
      admin: {
        id: savedAdmin._id,
        email: savedAdmin.email,
        username: savedAdmin.username
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

// PUT /api/companies/:id (super_admin or same company_admin)
exports.updateCompany = async (req, res) => {
  try {
    const { name, description } = req.body;
    const companyId = req.params.id;

    if (req.user.role === 'company_admin' && req.user.company._id.toString() !== companyId) {
      return res.status(403).json({ error: 'You can only update your own company' });
    }

    if (req.user.role !== 'super_admin' && req.user.role !== 'company_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (name) {
      const existingCompany = await Company.findOne({ 
        name,
        _id: { $ne: companyId }
      });
      if (existingCompany) {
        return res.status(400).json({ error: 'Company name already exists' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (typeof req.body.phone !== 'undefined') updateData.phone = req.body.phone;
    if (typeof req.body.location !== 'undefined') updateData.location = req.body.location;

    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      updateData,
      { new: true, runValidators: true }
    ).populate('admin', 'username email');

    if (!updatedCompany) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({
      message: 'Company updated successfully',
      company: updatedCompany
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    res.status(500).json({ error: error.message });
  }
};

// GET /api/companies/:id/subscription (super_admin or same company_admin)
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const companyId = req.params.id;

    if (req.user.role !== 'super_admin' && req.user.company._id.toString() !== companyId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const company = await Company.findById(companyId).select(
      'subscriptionPlan subscriptionStatus subscriptionStartDate subscriptionEndDate jobsQuota jobsUsed lastJobSync'
    );

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({
      subscription: {
        plan: company.subscriptionPlan,
        status: company.subscriptionStatus,
        startDate: company.subscriptionStartDate,
        endDate: company.subscriptionEndDate,
        jobsQuota: company.jobsQuota,
        jobsUsed: company.jobsUsed,
        lastJobSync: company.lastJobSync,
        remainingJobs: company.jobsQuota - company.jobsUsed
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/companies/:id/users (super_admin)
exports.getCompanyUsers = async (req, res) => {
  try {
    const companyId = req.params.id;

    const company = await Company.findById(companyId).populate('admin', 'username email');
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const users = await User.find({
      company: companyId,
      isActive: true
    })
    .select('-password -resetPasswordToken -resetPasswordExpires')
    .sort({ createdAt: -1 });

    res.json({
      company,
      users,
      totalUsers: users.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};