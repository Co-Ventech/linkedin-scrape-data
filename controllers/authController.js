// const User = require('../models/authModel');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '365d' });
// };

// exports.signup = async (req, res) => {
//   const { username, email, password } = req.body;
//   try {
//     const exist = await User.findOne({ email });
//     if (exist) return res.status(400).json({ message: "Email already in use" });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({ username, email, password: hashedPassword });

//     const token = generateToken(user._id);
//     res.status(201).json({ token });
//   } catch (err) {
//     res.status(500).json({ message: "Signup failed", error: err.message });
//   }
// };

// exports.login = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

//     const token = generateToken(user._id);
//     res.status(200).json({ token });
//   } catch (err) {
//     res.status(500).json({ message: "Login failed", error: err.message });
//   }
// };

// exports.dashboard = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");
//     res.status(200).json({ message: "Welcome to dashboard", user });
//   } catch (err) {
//     res.status(500).json({ message: "Access failed", error: err.message });
//   }
// };

const User = require('../models/User'); // ✅ Changed from authModel to User
const Company = require('../models/Company');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (userId, role, companyId = null) => {
  return jwt.sign(
    { 
      userId,
      role,
      companyId
    }, 
    process.env.JWT_SECRET || 'your-secret-key', 
    { expiresIn: '24h' } // ✅ Changed from 365d to 24h for security
  );
};

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // ✅ Enhanced validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: "Username, email, and password are required" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: "Password must be at least 6 characters long" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(400).json({ 
        error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
      });
    }

    // Create user with company_user role by default
    const user = new User({
      username,
      email,
      password, // Will be hashed by pre-save middleware
      role: 'company_user',
      isActive: true
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role, user.company);

    // Remove sensitive data
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      company: user.company
    };

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: userResponse
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ 
      error: "Signup failed", 
      details: err.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Login request body:', req.body); // Debug log

    // ✅ Handle both emailOrUsername and email fields
    const { emailOrUsername, email, username, password } = req.body;
    
    // Use the appropriate field
    const loginValue = emailOrUsername || email || username;

    if (!loginValue || !password) {
      return res.status(400).json({ 
        error: 'Email/username and password are required',
        received: { 
          emailOrUsername: !!emailOrUsername, 
          email: !!email, 
          username: !!username, 
          password: !!password 
        }
      });
    }

    // Find user by email or username and populate company
    let user;
    if (loginValue.includes('@')) {
      user = await User.findOne({ email: loginValue })
        .populate('company', 'name description isActive subscriptionPlan subscriptionStatus jobsQuota jobsUsed subscriptionStartDate subscriptionEndDate');
    } else {
      user = await User.findOne({ username: loginValue })
        .populate('company', 'name description isActive subscriptionPlan subscriptionStatus jobsQuota jobsUsed subscriptionStartDate subscriptionEndDate');
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Check if company is active (for non-super-admin users)
    if (user.role !== 'super_admin' && user.company && !user.company.isActive) {
      return res.status(401).json({ error: 'Company account is deactivated' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update login statistics if the method exists
    if (typeof user.updateLoginStats === 'function') {
      await user.updateLoginStats();
    }

    // Generate JWT token
    const token = generateToken(
      user._id, 
      user.role, 
      user.company?._id
    );

    // Prepare user response
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      company: user.company ? {
        _id: user.company._id,
        name: user.company.name,
        description: user.company.description,
        isActive: user.company.isActive,
        subscriptionPlan: user.company.subscriptionPlan,
        subscriptionStatus: user.company.subscriptionStatus,
        jobsQuota: user.company.jobsQuota,
        jobsUsed: user.company.jobsUsed,
        subscriptionStartDate: user.company.subscriptionStartDate,
        subscriptionEndDate: user.company.subscriptionEndDate
      } : null
    };

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      error: "Login failed", 
      details: err.message 
    });
  }
};

exports.dashboard = async (req, res) => {
  try {
    // ✅ Use userId from JWT payload instead of id
    const userId = req.user.userId || req.user.id;
    
    const user = await User.findById(userId)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .populate('company', 'name description isActive subscriptionPlan subscriptionStatus jobsQuota jobsUsed');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: "Account is deactivated" });
    }

    res.status(200).json({ 
      message: "Welcome to dashboard", 
      user,
      role: user.role,
      company: user.company
    });

  } catch (err) {
    console.error('Dashboard access error:', err);
    res.status(500).json({ 
      error: "Access failed", 
      details: err.message 
    });
  }
};

// ✅ Additional method for company signup (from previous conversation)
exports.companySignup = async (req, res) => {
  try {
    const { 
      companyName, 
      companyDescription, 
      adminEmail, 
      adminUsername, 
      adminPassword 
    } = req.body;

    // Validation
    if (!companyName || !adminEmail || !adminUsername || !adminPassword) {
      return res.status(400).json({ 
        error: 'Company name, admin email, username, and password are required' 
      });
    }

    // Check if company or admin already exists
    const existingCompany = await Company.findOne({ name: companyName });
    if (existingCompany) {
      return res.status(400).json({ error: 'Company name already exists' });
    }

    const existingUser = await User.findOne({ 
      $or: [{ email: adminEmail }, { username: adminUsername }] 
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Admin email or username already exists' });
    }

    // Create company
    const company = new Company({
      name: companyName,
      description: companyDescription || '',
      subscriptionPlan: 'trial',
      subscriptionStatus: 'trial',
      jobsQuota: 50,
      jobsUsed: 0,
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
      isActive: true
    });

    await company.save();

    // Create admin user
    const admin = new User({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword,
      role: 'company_admin',
      company: company._id,
      isActive: true
    });

    await admin.save();

    // Update company with admin reference
    company.admin = admin._id;
    await company.save();

    // Generate token
    const token = generateToken(admin._id, admin.role, company._id);

    // Response
    const userResponse = {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      company: {
        _id: company._id,
        name: company.name,
        description: company.description,
        subscriptionPlan: company.subscriptionPlan,
        subscriptionStatus: company.subscriptionStatus
      }
    };

    res.status(201).json({
      message: 'Company and admin created successfully',
      token,
      user: userResponse
    });

  } catch (err) {
    console.error('Company signup error:', err);
    res.status(500).json({ 
      error: "Company signup failed", 
      details: err.message 
    });
  }
};
