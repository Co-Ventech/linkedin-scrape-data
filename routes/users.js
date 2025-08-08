// // const express = require('express');
// // const crypto = require('crypto');

// // const User = require('../models/User');
// // const { authenticateToken, requireRole } = require('../middleware/auth');
// // const { sendWelcomeEmail,sendPasswordResetEmail,sendInvitationEmail  } = require('../services/userEmail');
// // const router = express.Router();

// // // Get users in company (Company Admin only)
// // router.get('/', authenticateToken, requireRole(['company_admin']), async (req, res) => {
// //   try {
// //     const users = await User.find({ 
// //       company: req.user.company._id,
// //       role: 'user'
// //     }).select('-password');
    
// //     res.json(users);
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Get single user details (Company Admin only)
// // router.get('/:id', authenticateToken, requireRole(['company_admin']), async (req, res) => {
// //   try {
// //     const user = await User.findOne({
// //       _id: req.params.id,
// //       company: req.user.company._id,
// //       role: 'user'
// //     }).select('-password');

// //     if (!user) {
// //       return res.status(404).json({ error: 'User not found' });
// //     }

// //     res.json(user);
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Create user in company (Company Admin only)
// // router.post('/', authenticateToken, requireRole(['company_admin']), async (req, res) => {
// //   try {
// //     const { username, email, password } = req.body;

// //     if (!username || !email || !password) {
// //       return res.status(400).json({ error: 'Username, email, and password are required' });
// //     }

// //     const existingUser = await User.findOne({ 
// //       $or: [{ username }, { email }] 
// //     });
// //     if (existingUser) {
// //       return res.status(400).json({ error: 'Username or email already exists' });
// //     }

// //     const user = new User({
// //       username,
// //       email,
// //       password,
// //       role: 'user',
// //       company: req.user.company._id
// //     });

// //     const savedUser = await user.save();

// //     // Send welcome email (optional, don't fail if email fails)
// //     try {
// //       await sendWelcomeEmail(email, username, req.user.company.name);
// //     } catch (emailError) {
// //       console.error('Failed to send welcome email:', emailError);
// //     }

// //     res.status(201).json({
// //       message: 'User created successfully',
// //       user: {
// //         id: savedUser._id,
// //         username: savedUser.username,
// //         email: savedUser.email,
// //         role: savedUser.role,
// //         company: savedUser.company,
// //         isActive: savedUser.isActive,
// //         createdAt: savedUser.createdAt
// //       }
// //     });
// //   } catch (error) {
// //     if (error.code === 11000) {
// //       const field = Object.keys(error.keyPattern)[0];
// //       return res.status(400).json({ error: `${field} already exists` });
// //     }
    
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Update user details (Company Admin can edit users in their company)
// // router.put('/:id', authenticateToken, requireRole(['company_admin']), async (req, res) => {
// //   try {
// //     const { username, email, isActive } = req.body;
// //     const userId = req.params.id;

// //     // Verify user belongs to the company
// //     const user = await User.findOne({
// //       _id: userId,
// //       company: req.user.company._id,
// //       role: 'user'
// //     });

// //     if (!user) {
// //       return res.status(404).json({ error: 'User not found in your company' });
// //     }

// //     // Check if username/email already exists (excluding current user)
// //     if (username || email) {
// //       const query = {
// //         _id: { $ne: userId }
// //       };
      
// //       if (username && email) {
// //         query.$or = [{ username }, { email }];
// //       } else if (username) {
// //         query.username = username;
// //       } else if (email) {
// //         query.email = email;
// //       }

// //       const existingUser = await User.findOne(query);
// //       if (existingUser) {
// //         return res.status(400).json({ error: 'Username or email already exists' });
// //       }
// //     }

// //     // Update user
// //     const updateData = {};
// //     if (username) updateData.username = username;
// //     if (email) updateData.email = email;
// //     if (typeof isActive === 'boolean') updateData.isActive = isActive;

// //     const updatedUser = await User.findByIdAndUpdate(
// //       userId,
// //       updateData,
// //       { new: true, runValidators: true }
// //     ).select('-password');

// //     res.json({
// //       message: 'User updated successfully',
// //       user: updatedUser
// //     });

// //   } catch (error) {
// //     if (error.code === 11000) {
// //       const field = Object.keys(error.keyPattern)[0];
// //       return res.status(400).json({ error: `${field} already exists` });
// //     }
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Delete user (Company Admin only)
// // router.delete('/:id', authenticateToken, requireRole(['company_admin']), async (req, res) => {
// //   try {
// //     const userId = req.params.id;

// //     const user = await User.findOne({
// //       _id: userId,
// //       company: req.user.company._id,
// //       role: 'user'
// //     });

// //     if (!user) {
// //       return res.status(404).json({ error: 'User not found in your company' });
// //     }

// //     await User.findByIdAndDelete(userId);

// //     res.json({ message: 'User deleted successfully' });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });
// // // Change password (for logged-in users)
// // router.post('/change-password', authenticateToken, async (req, res) => {
// //   try {
// //     const { currentPassword, newPassword } = req.body;

// //     if (!currentPassword || !newPassword) {
// //       return res.status(400).json({ error: 'Current password and new password are required' });
// //     }

// //     if (newPassword.length < 6) {
// //       return res.status(400).json({ error: 'New password must be at least 6 characters long' });
// //     }

// //     const user = await User.findById(req.user._id);
// //     if (!user) {
// //       return res.status(404).json({ error: 'User not found' });
// //     }

// //     // Verify current password
// //     const isCurrentPasswordValid = await user.comparePassword(currentPassword);
// //     if (!isCurrentPasswordValid) {
// //       return res.status(400).json({ error: 'Current password is incorrect' });
// //     }

// //     // Update password
// //     user.password = newPassword; // Will be hashed by pre-save hook
// //     await user.save();

// //     res.json({ message: 'Password updated successfully' });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Company Admin change user password
// // router.post('/:id/change-password', authenticateToken, requireRole(['company_admin']), async (req, res) => {
// //   try {
// //     const { newPassword } = req.body;
// //     const userId = req.params.id;

// //     if (!newPassword || newPassword.length < 6) {
// //       return res.status(400).json({ error: 'Password must be at least 6 characters long' });
// //     }

// //     const user = await User.findOne({
// //       _id: userId,
// //       company: req.user.company._id,
// //       role: 'user'
// //     });

// //     if (!user) {
// //       return res.status(404).json({ error: 'User not found in your company' });
// //     }

// //     user.password = newPassword; // Will be hashed by pre-save hook
// //     await user.save();

// //     res.json({ message: 'User password updated successfully' });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });
// // // Company Admin hard reset user password (generates random password and sends email)
// // router.post('/:id/hard-reset-password', authenticateToken, requireRole(['company_admin']), async (req, res) => {
// //   try {
// //     const userId = req.params.id;

// //     const user = await User.findOne({
// //       _id: userId,
// //       company: req.user.company._id,
// //       role: 'user'
// //     });

// //     if (!user) {
// //       return res.status(404).json({ error: 'User not found in your company' });
// //     }

// //     // Generate random password
// //     const newPassword = crypto.randomBytes(8).toString('hex');
    
// //     // Update user password
// //     user.password = newPassword; // Will be hashed by pre-save hook
// //     await user.save();

// //     // Send email with new password
// //     try {
// //       const loginLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
// //       await sendPasswordResetEmail(user.email, user.username, null, newPassword, loginLink);
// //     } catch (emailError) {
// //       console.error('Failed to send password reset email:', emailError);
// //       return res.status(500).json({ 
// //         error: 'Password was reset but failed to send email notification' 
// //       });
// //     }

// //     res.json({ 
// //       message: 'Password reset successfully and sent to user email',
// //       newPassword: newPassword // Only for testing, remove in production
// //     });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Change password (for logged-in users)
// // router.post('/change-password', authenticateToken, async (req, res) => {
// //   try {
// //     const { currentPassword, newPassword } = req.body;

// //     if (!currentPassword || !newPassword) {
// //       return res.status(400).json({ error: 'Current password and new password are required' });
// //     }

// //     if (newPassword.length < 6) {
// //       return res.status(400).json({ error: 'New password must be at least 6 characters long' });
// //     }

// //     const user = await User.findById(req.user._id);
// //     if (!user) {
// //       return res.status(404).json({ error: 'User not found' });
// //     }

// //     // Verify current password
// //     const isCurrentPasswordValid = await user.comparePassword(currentPassword);
// //     if (!isCurrentPasswordValid) {
// //       return res.status(400).json({ error: 'Current password is incorrect' });
// //     }

// //     // Update password
// //     user.password = newPassword;
// //     await user.save();

// //     res.json({ message: 'Password updated successfully' });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // module.exports = router;
// const express = require('express');
// const { authenticateToken, requireRole } = require('../middleware/auth');
// const {
//   getCompanyUsers,
//   createUser,
//   updateUser,
//   deleteUser,
//   changePassword,
//   hardResetPassword
// } = require('../controllers/userController');
// const User = require('../models/User');

// const router = express.Router();

// // Get company users (Company Admin and Super Admin)
// // router.get('/', 
// //   authenticateToken, 
// //   requireRole(['company_admin', 'super_admin']), 
// //   getCompanyUsers
// // );

// // Create user (Company Admin only)
// // router.post('/', 
// //   authenticateToken, 
// //   requireRole(['company_admin']), 
// //   createUser
// // );
// // Create user in company (Company Admin only)
// router.post('/', authenticateToken, requireRole(['company_admin']), async (req, res) => {
//   try {
//     console.log('Creating user - Request body:', req.body); // Debug log
//     console.log('Creating user - Admin company:', req.user.company?._id); // Debug log

//     const { username, email, password } = req.body;

//     // Validation
//     if (!username || !email || !password) {
//       return res.status(400).json({ 
//         error: 'Username, email, and password are required' 
//       });
//     }

//     if (password.length < 6) {
//       return res.status(400).json({ 
//         error: 'Password must be at least 6 characters long' 
//       });
//     }

//     // Check for existing user
//     const existingUser = await User.findOne({ 
//       $or: [{ username }, { email }] 
//     });
    
//     if (existingUser) {
//       const field = existingUser.email === email ? 'email' : 'username';
//       return res.status(400).json({ 
//         error: `User with this ${field} already exists` 
//       });
//     }

//     // Verify company exists and is active
//     const company = await Company.findById(req.user.company._id);
//     if (!company || !company.isActive) {
//       return res.status(400).json({ 
//         error: 'Invalid or inactive company' 
//       });
//     }

//     // ✅ Create user with company_user role
//     const userData = {
//       username,
//       email,
//       password,
//       role: 'company_user', // ✅ Ensure correct role
//       company: req.user.company._id,
//       isActive: true
//     };

//     console.log('Creating user with data:', { ...userData, password: '[HIDDEN]' }); // Debug log

//     const user = new User(userData);
//     const savedUser = await user.save();

//     console.log('User created successfully:', savedUser._id); // Debug log

//     // Remove sensitive data from response
//     const userResponse = savedUser.toObject();
//     delete userResponse.password;
//     delete userResponse.resetPasswordToken;
//     delete userResponse.resetPasswordExpires;

//     res.status(201).json({
//       message: 'User created successfully',
//       user: userResponse
//     });

//   } catch (error) {
//     console.error('Create user error:', error); // ✅ Critical debug log
    
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       return res.status(400).json({ 
//         error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
//       });
//     }
    
//     if (error.name === 'ValidationError') {
//       const validationErrors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ 
//         error: 'Validation failed', 
//         details: validationErrors 
//       });
//     }
    
//     res.status(500).json({ 
//       error: 'Failed to create user', 
//       details: error.message 
//     });
//   }
// });
// const handleCreateUser = async (e) => {
//   e.preventDefault();
//   setLoading(true);
//   setMessage('');

//   try {
//     console.log('Creating user with data:', userFormData); // Debug log

//     const userData = {
//       username: userFormData.username,
//       email: userFormData.email,
//       password: userFormData.password
//       // ✅ Don't send role - backend will set it automatically
//     };

//     const response = await userAPI.createUser(userData);
//     console.log('User creation response:', response.data); // Debug log
    
//     setMessage('User created successfully!');
//     setUserFormData({ username: '', email: '', password: '' });
//     setShowCreateForm(false);
    
//     // ✅ Add delay before reloading users to ensure database consistency
//     setTimeout(async () => {
//       try {
//         await loadUsers(); // Reload users after creation
//       } catch (loadError) {
//         console.error('Failed to reload users after creation:', loadError);
//         setMessage('User created but failed to refresh user list. Please refresh the page.');
//       }
//     }, 500);
    
//     setTimeout(() => setMessage(''), 3000);
//   } catch (error) {
//     console.error('User creation error:', error); // Debug log
//     const errorMsg = error.response?.data?.error || error.response?.data?.details || 'Failed to create user';
//     setMessage(errorMsg);
//     setTimeout(() => setMessage(''), 5000);
//   } finally {
//     setLoading(false);
//   }
// };


// // Update user (Company Admin, Super Admin, or self)
// // router.put('/:id', 
// //   authenticateToken, 
// //   requireRole(['company_admin', 'super_admin', 'company_user']), 
// //   updateUser
// // );
// // Update user details (Company Admin can edit users in their company)
// router.put('/:id', authenticateToken, requireRole(['company_admin', 'super_admin', 'company_user']), async (req, res) => {
//   try {
//     const { username, email, isActive } = req.body;
//     const userId = req.params.id;

//     // Permission checks
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
//     res.status(500).json({ error: error.message });
//   }
// });

// // Delete user (Soft delete - set isActive = false)
// router.delete('/:id', authenticateToken, requireRole(['company_admin', 'super_admin']), async (req, res) => {
//   try {
//     const userId = req.params.id;

//     // Permission check for company admin
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

//     // Soft delete instead of hard delete
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
//     res.status(500).json({ error: error.message });
//   }
// });

// // Hard reset user password (Admin only)
// router.post('/:id/hard-reset-password', authenticateToken, requireRole(['company_admin', 'super_admin']), async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const { newPassword } = req.body;

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
//         newPassword: resetPassword // Only for testing
//       });
//     }

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Delete user (Company Admin and Super Admin)
// router.delete('/:id', 
//   authenticateToken, 
//   requireRole(['company_admin', 'super_admin']), 
//   deleteUser
// );

// // Change own password (All authenticated users)
// router.post('/change-password', 
//   authenticateToken, 
//   changePassword
// );

// // Hard reset password (Admin only)
// // router.post('/:id/hard-reset-password', 
// //   authenticateToken, 
// //   requireRole(['company_admin', 'super_admin']), 
// //   hardResetPassword
// // );
// // Get users in company (exclude company admin)
// // router.get('/', authenticateToken, requireRole(['company_admin', 'super_admin']), async (req, res) => {
// //   try {
// //     let query = { isActive: true };
    
// //     if (req.user.role === 'company_admin') {
// //       // ✅ Exclude the admin from the user list
// //       query.company = req.user.company._id;
// //       query.role = 'company_user'; // Only show company users, not admins
// //       query._id = { $ne: req.user._id }; // Exclude current admin user
// //     } else if (req.user.role === 'super_admin') {
// //       if (req.query.companyId) {
// //         query.company = req.query.companyId;
// //         query.role = { $in: ['company_user', 'company_admin'] }; // Super admin can see all
// //       }
// //     }

// //     const page = parseInt(req.query.page) || 1;
// //     const limit = parseInt(req.query.limit) || 20;
// //     const skip = (page - 1) * limit;

// //     const users = await User.find(query)
// //       .select('-password -resetPasswordToken -resetPasswordExpires')
// //       .populate('company', 'name description')
// //       .sort({ createdAt: -1 })
// //       .skip(skip)
// //       .limit(limit)
// //       .lean();

// //     const total = await User.countDocuments(query);

// //     res.json({
// //       users,
// //       pagination: {
// //         current: page,
// //         limit,
// //         total,
// //         pages: Math.ceil(total / limit)
// //       }
// //     });
// //   } catch (error) {
// //     console.error('Get users error:', error);
// //     res.status(500).json({ error: error.message });
// //   }
// // });
// // Get users in company (exclude company admin from list)
// router.get('/', authenticateToken, requireRole(['company_admin', 'super_admin']), async (req, res) => {
//   try {
//     console.log('GET /users - User role:', req.user.role, 'Company ID:', req.user.company?._id); // Debug log

//     let query = { isActive: true };
    
//     if (req.user.role === 'company_admin') {
//       // ✅ Only show company_user role, exclude admin from team list
//       query.company = req.user.company._id;
//       query.role = 'company_user'; // Only company users, not admins
//       query._id = { $ne: req.user._id }; // Exclude current admin user
//     } else if (req.user.role === 'super_admin') {
//       if (req.query.companyId) {
//         query.company = req.query.companyId;
//         query.role = { $in: ['company_user', 'company_admin'] };
//       }
//     }

//     console.log('User query:', JSON.stringify(query)); // Debug log

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 20;
//     const skip = (page - 1) * limit;

//     const users = await User.find(query)
//       .select('-password -resetPasswordToken -resetPasswordExpires')
//       .populate('company', 'name description')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const total = await User.countDocuments(query);

//     console.log(`Found ${users.length} users out of ${total} total`); // Debug log

//     res.json({
//       users,
//       pagination: {
//         current: page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit),
//         hasNext: page < Math.ceil(total / limit),
//         hasPrev: page > 1
//       }
//     });

//   } catch (error) {
//     console.error('Get users error:', error); // ✅ Critical debug log
//     res.status(500).json({ 
//       error: 'Failed to fetch users',
//       details: error.message 
//     });
//   }
// });

// // Hard reset user password (Admin only) - FIXED
// // router.post('/:id/hard-reset-password', authenticateToken, requireRole(['company_admin', 'super_admin']), async (req, res) => {
// //   try {
// //     const userId = req.params.id;
// //     const { newPassword } = req.body; // Optional custom password

// //     let query = { _id: userId, isActive: true };
    
// //     if (req.user.role === 'company_admin') {
// //       query.company = req.user.company._id;
// //       query.role = 'company_user';
// //     }

// //     const user = await User.findOne(query);
// //     if (!user) {
// //       return res.status(404).json({ error: 'User not found in your company' });
// //     }

// //     // Generate new password or use provided one
// //     const resetPassword = newPassword && newPassword.length >= 6 
// //       ? newPassword 
// //       : crypto.randomBytes(8).toString('hex');
    
// //     user.password = resetPassword; // Will be hashed by pre-save middleware
// //     await user.save();

// //     // Send email with new password
// //     try {
// //       const loginLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
// //       await sendPasswordResetEmail(user.email, user.username, null, resetPassword, loginLink);
      
// //       res.json({ 
// //         message: 'Password reset successfully and sent to user email'
// //       });
// //     } catch (emailError) {
// //       console.error('Failed to send password reset email:', emailError);
// //       res.json({ 
// //         message: 'Password reset successfully but email notification failed',
// //         newPassword: resetPassword // For testing only
// //       });
// //     }

// //   } catch (error) {
// //     console.error('Hard reset password error:', error);
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // Delete user (Soft delete) - FIXED
// // router.delete('/:id', authenticateToken, requireRole(['company_admin', 'super_admin']), async (req, res) => {
// //   try {
// //     const userId = req.params.id;

// //     let query = { _id: userId };
    
// //     if (req.user.role === 'company_admin') {
// //       query.company = req.user.company._id;
// //       query.role = 'company_user';
// //     }

// //     const userToDelete = await User.findOne(query);
// //     if (!userToDelete) {
// //       return res.status(404).json({ error: 'User not found in your company' });
// //     }

// //     // Soft delete - set isActive to false
// //     userToDelete.isActive = false;
// //     await userToDelete.save();

// //     res.json({ 
// //       message: 'User deactivated successfully',
// //       user: {
// //         id: userToDelete._id,
// //         username: userToDelete.username,
// //         isActive: false
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Delete user error:', error);
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// module.exports = router;
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
  requireRole(['company_admin']), 
  createUser
);

// // Update user (Company Admin, Super Admin, or self)
// router.put('/:id', 
//   authenticateToken, 
//   requireRole(['company_admin', 'super_admin', 'company_user']), 
//   updateUser
// );

// // Delete user (Company Admin and Super Admin)
// router.delete('/:id', 
//   authenticateToken, 
//   requireRole(['company_admin', 'super_admin']), 
//   deleteUser
// );

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

// // Hard reset password (Admin only)
// router.post('/:id/hard-reset-password', 
//   authenticateToken, 
//   requireRole(['company_admin', 'super_admin']), 
//   hardResetPassword
// );
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
