
const User = require('../models/User');
const Company = require('../models/Company');
const crypto = require('crypto');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/userEmail');

// Get all users for company - accessible by company admins and super admins
const getCompanyUsers = async (req, res) => {
  try {
    console.log('GET /users - User role:', req.user.role, 'Company ID:', req.user.company?._id);

    let query = { isActive: true };
    
    if (req.user.role === 'company_admin') {
      // Only show company_user role, exclude admin from team list
      query.company = req.user.company._id;
      query.role = 'company_user'; // Only company users, not admins
      query._id = { $ne: req.user._id }; // Exclude current admin user
    } else if (req.user.role === 'super_admin') {
      if (req.query.companyId) {
        query.company = req.query.companyId;
        query.role = { $in: ['company_user', 'company_admin'] };
      }
    }

    console.log('User query:', JSON.stringify(query));

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .populate('company', 'name description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    console.log(`Found ${users.length} users out of ${total} total`);

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
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users', 
      details: error.message 
    });
  }
};

// Create user - only company_admin can create users in their company
const createUser = async (req, res) => {
  try {
    console.log('Creating user - Request body:', req.body);
    console.log('Creating user - Admin company:', req.user.company?._id);

    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Only company_admin can create users
    if (req.user.role !== 'company_admin') {
      return res.status(403).json({ 
        error: 'Only company admins can create users' 
      });
    }

    // Get company from authenticated user
    const companyId = req.user.company?._id || req.user.company;
    if (!companyId) {
      return res.status(400).json({ 
        error: 'Company information missing' 
      });
    }

    // Verify company exists and is active
    const company = await Company.findById(companyId);
    if (!company || !company.isActive) {
      return res.status(400).json({ 
        error: 'Invalid or inactive company' 
      });
    }

    // Check for existing user with same email or username
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(400).json({ 
        error: `User with this ${field} already exists` 
      });
    }

    // Create new user with company_user role
    const userData = {
      username,
      email,
      password,
      role: 'company_user', // Always create as company_user
      company: companyId,
      isActive: true
    };

    console.log('Creating user with data:', { ...userData, password: '[HIDDEN]' });

    const user = new User(userData);
    const savedUser = await user.save();

    console.log('User created successfully:', savedUser._id);

    // Send welcome email (optional, don't fail if email fails)
    try {
      await sendWelcomeEmail(email, username, company.name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Remove sensitive data from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    delete userResponse.resetPasswordToken;
    delete userResponse.resetPasswordExpires;

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
      });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create user', 
      details: error.message 
    });
  }
};

// Update user - company_admin can update users in their company
// const updateUser = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const { username, email, isActive } = req.body;

//     // Permission check
//     if (req.user.role === 'company_user') {
//       // Users can only update their own profile (excluding isActive)
//       if (req.user._id.toString() !== userId) {
//         return res.status(403).json({ 
//           error: 'You can only update your own profile' 
//         });
//       }
//       if (typeof isActive !== 'undefined') {
//         return res.status(403).json({ 
//           error: 'You cannot change your activation status' 
//         });
//       }
//     } else if (req.user.role === 'company_admin') {
//       // Company admin can update users in their company
//       const userToUpdate = await User.findById(userId);
//       if (!userToUpdate) {
//         return res.status(404).json({ error: 'User not found' });
//       }
//       if (userToUpdate.company.toString() !== req.user.company._id.toString()) {
//         return res.status(403).json({ 
//           error: 'You can only update users in your company' 
//         });
//       }
//     } else if (req.user.role !== 'super_admin') {
//       return res.status(403).json({ error: 'Insufficient permissions' });
//     }

//     // Check for duplicate username/email (excluding current user)
//     if (username || email) {
//       const duplicateQuery = { _id: { $ne: userId } };
//       if (username && email) {
//         duplicateQuery.$or = [{ username }, { email }];
//       } else if (username) {
//         duplicateQuery.username = username;
//       } else if (email) {
//         duplicateQuery.email = email;
//       }
      
//       const existingUser = await User.findOne(duplicateQuery);
//       if (existingUser) {
//         const field = existingUser.username === username ? 'username' : 'email';
//         return res.status(400).json({ 
//           error: `${field.charAt(0).toUpperCase() + field.slice(1)} already in use` 
//         });
//       }
//     }

//     // Build update data
//     const updateData = {};
//     if (username) updateData.username = username;
//     if (email) updateData.email = email;
//     if (typeof isActive === 'boolean') updateData.isActive = isActive;

//     const updatedUser = await User.findByIdAndUpdate(
//       userId, 
//       updateData, 
//       { new: true, runValidators: true }
//     ).select('-password -resetPasswordToken -resetPasswordExpires')
//      .populate('company', 'name');

//     if (!updatedUser) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     res.json({
//       message: 'User updated successfully',
//       user: updatedUser
//     });

//   } catch (error) {
//     console.error('Update user error:', error);
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       return res.status(400).json({ 
//         error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
//       });
//     }
//     res.status(500).json({ 
//       error: 'Failed to update user', 
//       details: error.message 
//     });
//   }
// };

// Delete user - soft delete by setting isActive = false
// const deleteUser = async (req, res) => {
//   try {
//     const userId = req.params.id;

//     // Only company_admin and super_admin can delete users
//     if (!['company_admin', 'super_admin'].includes(req.user.role)) {
//       return res.status(403).json({ error: 'Insufficient permissions' });
//     }

//     // Company admin can only delete users in their company
//     if (req.user.role === 'company_admin') {
//       const userToDelete = await User.findById(userId);
//       if (!userToDelete) {
//         return res.status(404).json({ error: 'User not found' });
//       }
//       if (userToDelete.company.toString() !== req.user.company._id.toString()) {
//         return res.status(403).json({ 
//           error: 'You can only delete users in your company' 
//         });
//       }
//     }

//     // Soft delete - set isActive to false
//     const deletedUser = await User.findByIdAndUpdate(
//       userId, 
//       { isActive: false }, 
//       { new: true }
//     ).select('-password');

//     if (!deletedUser) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     res.json({
//       message: 'User deactivated successfully',
//       user: deletedUser
//     });

//   } catch (error) {
//     console.error('Delete user error:', error);
//     res.status(500).json({ 
//       error: 'Failed to deactivate user', 
//       details: error.message 
//     });
//   }
// };

// Change own password
const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'New password must be at least 6 characters long' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ 
        error: 'Current password is incorrect' 
      });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      error: 'Failed to change password', 
      details: error.message 
    });
  }
};

// Hard reset user password (admin only)
// const hardResetPassword = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const { newPassword } = req.body;

//     // Only company_admin and super_admin can reset passwords
//     if (!['company_admin', 'super_admin'].includes(req.user.role)) {
//       return res.status(403).json({ error: 'Insufficient permissions' });
//     }

//     let query = { _id: userId };
    
//     if (req.user.role === 'company_admin') {
//       query.company = req.user.company._id;
//       query.role = 'company_user';
//     }

//     const user = await User.findOne(query);
//     if (!user) {
//       return res.status(404).json({ 
//         error: 'User not found in your company' 
//       });
//     }

//     // Use provided password or generate random one
//     const resetPassword = newPassword && newPassword.length >= 6 
//       ? newPassword 
//       : crypto.randomBytes(8).toString('hex');

//     // Update password (will be hashed by pre-save middleware)
//     user.password = resetPassword;
//     await user.save();

//     // Send email with new password
//     try {
//       const loginLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
//       await sendPasswordResetEmail(user.email, user.username, null, resetPassword, loginLink);
      
//       res.json({ 
//         message: 'Password reset successfully and sent to user email'
//       });
//     } catch (emailError) {
//       console.error('Failed to send password reset email:', emailError);
//       res.json({ 
//         message: 'Password reset successfully but email notification failed',
//         newPassword: resetPassword // Only for testing, remove in production
//       });
//     }

//   } catch (error) {
//     console.error('Hard reset password error:', error);
//     res.status(500).json({ 
//       error: 'Failed to reset password', 
//       details: error.message 
//     });
//   }
// };

// Update user - company_admin can update users in their company
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, isActive } = req.body;

    console.log('Update request - Admin company:', req.user.company._id, 'Target user:', userId);

    // Permission checks
    if (req.user.role === 'company_user') {
      // Users can only update their own profile
      if (req.user._id.toString() !== userId) {
        return res.status(403).json({ 
          error: 'You can only update your own profile' 
        });
      }
      if (typeof isActive !== 'undefined') {
        return res.status(403).json({ 
          error: 'You cannot change your activation status' 
        });
      }
    } else if (req.user.role === 'company_admin') {
      // ✅ Company admin can update users in their company
      const userToUpdate = await User.findById(userId);
      if (!userToUpdate) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // ✅ Check if user belongs to admin's company
      if (userToUpdate.company.toString() !== req.user.company._id.toString()) {
        return res.status(403).json({ 
          error: 'You can only update users in your company' 
        });
      }
      
      console.log('Permission granted - User belongs to admin company');
    }

    // Build update data
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires')
     .populate('company', 'name');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      error: 'Failed to update user', 
      details: error.message 
    });
  }
};

// Delete user - soft delete by setting isActive = false
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    console.log('Delete request - Admin:', req.user._id, 'Target user:', userId);

    // Only company_admin and super_admin can delete users
    if (!['company_admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // ✅ Company admin can only delete users in their company
    if (req.user.role === 'company_admin') {
      const userToDelete = await User.findById(userId);
      if (!userToDelete) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // ✅ Verify user belongs to admin's company
      if (userToDelete.company.toString() !== req.user.company._id.toString()) {
        return res.status(403).json({ 
          error: 'You can only delete users in your company' 
        });
      }
    }

    // ✅ Soft delete - set isActive to false
    const deletedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User deactivated successfully',
      user: deletedUser
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      error: 'Failed to deactivate user', 
      details: error.message 
    });
  }
};

// Hard reset user password (admin only)
const hardResetPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { newPassword } = req.body;

    console.log('Password reset request - Admin:', req.user._id, 'Target user:', userId);

    // Only company_admin and super_admin can reset passwords
    if (!['company_admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    let query = { _id: userId };
    
    if (req.user.role === 'company_admin') {
      // ✅ Add company filter for company admin
      query.company = req.user.company._id;
      query.role = 'company_user';
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found in your company' 
      });
    }

    // Use provided password or generate random one
    const resetPassword = newPassword && newPassword.length >= 6 
      ? newPassword 
      : crypto.randomBytes(8).toString('hex');

    // Update password
    user.password = resetPassword;
    await user.save();

    // Send email notification
    try {
      const loginLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
      await sendPasswordResetEmail(user.email, user.username, null, resetPassword, loginLink);
      
      res.json({ 
        message: 'Password reset successfully and sent to user email'
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      res.json({ 
        message: 'Password reset successfully but email notification failed',
        newPassword: resetPassword // Only for testing
      });
    }

  } catch (error) {
    console.error('Hard reset password error:', error);
    res.status(500).json({ 
      error: 'Failed to reset password', 
      details: error.message 
    });
  }
};



module.exports = {
  getCompanyUsers,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  hardResetPassword
};
