
const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const Company = require('../models/Company');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sendWelcomeEmail, sendPasswordResetEmail, sendInvitationEmail } = require('../services/userEmail');
const {
  getCompanyUsers,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  hardResetPassword
} = require('../controllers/userController');

const router = express.Router();

// Get company users (Company Admin and Super Admin)
router.get('/', 
  authenticateToken, 
  requireRole(['company_admin', 'super_admin']), 
  getCompanyUsers
);

// Get single user details (Company Admin and Super Admin)
router.get('/:id', authenticateToken, requireRole(['company_admin', 'super_admin']), async (req, res) => {
  try {
    let query = { _id: req.params.id, isActive: true };
    
    if (req.user.role === 'company_admin') {
      query.company = req.user.company._id;
      query.role = 'company_user';
    }

    const user = await User.findOne(query)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .populate('company', 'name description');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user (Company Admin only)
router.post('/', 
  authenticateToken, 
  requireRole(['company_admin', 'super_admin']), 
  createUser
);
router.get('/company/:companyId', 
  authenticateToken, 
  requireRole(['super_admin']), 
  async (req, res) => {
    try {
      const { companyId } = req.params;
      
      // Pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const users = await User.find({ 
        company: companyId, 
        isActive: true 
      })
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .populate('company', 'name description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

      const total = await User.countDocuments({ 
        company: companyId, 
        isActive: true 
      });

      res.json({
        users,
        pagination: {
          current: page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);



// Change own password (All authenticated users)
router.post('/change-password', 
  authenticateToken, 
  changePassword
);

// Company Admin change user password
router.post('/:id/change-password', authenticateToken, requireRole(['company_admin', 'super_admin']), async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.params.id;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    let query = { _id: userId };
    
    if (req.user.role === 'company_admin') {
      query.company = req.user.company._id;
      query.role = 'company_user';
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found in your company' 
      });
    }

    user.password = newPassword; // Will be hashed by pre-save middleware
    await user.save();

    res.json({ message: 'User password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Update user (Company Admin, Super Admin, or self)
router.put('/:id', 
  authenticateToken, 
  requireRole(['company_admin', 'super_admin', 'company_user']), 
  updateUser
);

// Delete user (Company Admin and Super Admin)
router.delete('/:id', 
  authenticateToken, 
  requireRole(['company_admin', 'super_admin']), 
  deleteUser
);

// Hard reset password (Admin only)
router.post('/:id/hard-reset-password', 
  authenticateToken, 
  requireRole(['company_admin', 'super_admin']), 
  hardResetPassword
);

module.exports = router;
