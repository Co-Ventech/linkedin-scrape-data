const jwt = require('jsonwebtoken');
const User = require('../models/User');

// const authenticateToken = async (req, res, next) => {
//   try {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) {
//       return res.status(401).json({ error: 'Access token required' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
//     const user = await User.findById(decoded.userId).populate('company');
    
//     if (!user || !user.isActive) {
//       return res.status(401).json({ error: 'Invalid or inactive user' });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     if (error.name === 'JsonWebTokenError') {
//       return res.status(403).json({ error: 'Invalid token' });
//     }
//     if (error.name === 'TokenExpiredError') {
//       return res.status(403).json({ error: 'Token expired' });
//     }
//     return res.status(403).json({ error: 'Token verification failed' });
//   }
// };

// const requireRole = (roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ error: 'Insufficient permissions' });
//     }
//     next();
//   };
// };
// const requireRole = (allowedRoles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ error: 'Authentication required' });
//     }

//     // ✅ Allow both company_admin and company_user to access company jobs
//     const userRole = req.user.role;
//     const allowedWithCompanyAccess = [...allowedRoles];
    
//     if (allowedRoles.includes('company_admin')) {
//       allowedWithCompanyAccess.push('company_user'); // ✅ Add company_user access
//     }

//     if (!allowedWithCompanyAccess.includes(userRole)) {
//       return res.status(403).json({ 
//         error: 'Insufficient permissions',
//         required: allowedRoles,
//         current: userRole
//       });
//     }

//     next();
//   };
// };



const requireSameCompanyOrAdmin = (req, res, next) => {
  if (req.user.role === 'super_admin') {
    return next();
  }
  
  if (req.user.role === 'company_admin' && req.body.company === req.user.company._id.toString()) {
    return next();
  }
  
  return res.status(403).json({ error: 'Access denied' });
};
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // ✅ Verify token with updated structure
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // ✅ Handle both old and new token structures
    const userId = decoded.userId || decoded.id;
    
    const user = await User.findById(userId)
      .populate('company', 'name description isActive subscriptionPlan subscriptionStatus jobsQuota jobsUsed');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requireSameCompanyOrAdmin
};
