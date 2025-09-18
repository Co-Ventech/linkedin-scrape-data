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
// const authenticateToken = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) {
//       return res.status(401).json({ error: 'Access token required' });
//     }

//     // ✅ Verify token with updated structure
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
//     // ✅ Handle both old and new token structures
//     const userId = decoded.userId || decoded.id;
    
//     const user = await User.findById(userId)
//       .populate('company', 'name description isActive subscriptionPlan subscriptionStatus jobsQuota jobsUsed');

//     if (!user) {
//       return res.status(401).json({ error: 'User not found' });
//     }

//     if (!user.isActive) {
//       return res.status(401).json({ error: 'Account is deactivated' });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     console.error('Auth middleware error:', error);
    
//     if (error.name === 'JsonWebTokenError') {
//       return res.status(401).json({ error: 'Invalid token' });
//     } else if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({ error: 'Token expired' });
//     }
    
//     res.status(500).json({ error: 'Authentication failed' });
//   }
// };


// const authenticateToken = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) {
//       return res.status(401).json({ error: 'Access token required' });
//     }

//     // Add validation for malformed tokens
//     if (token.split('.').length !== 3) {
//       return res.status(401).json({ error: 'Malformed token' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
//     const userId = decoded.userId || decoded.id;
    
//     const user = await User.findById(userId)
//       .populate('company', 'name description isActive subscriptionPlan subscriptionStatus jobsQuota jobsUsed');

//     if (!user) {
//       return res.status(401).json({ error: 'User not found' });
//     }

//     if (!user.isActive) {
//       return res.status(401).json({ error: 'Account is deactivated' });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     console.error('Auth middleware error:', error);
    
//     if (error.name === 'JsonWebTokenError') {
//       return res.status(401).json({ error: 'Invalid token format' });
//     } else if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({ error: 'Token expired' });
//     }
    
//     res.status(500).json({ error: 'Authentication failed' });
//   }
// };
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // console.log('Auth header:', authHeader); // Debug line
    
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // console.log('Token received:', token.substring(0, 20) + '...'); // Debug line

    // Check if token has proper JWT structure (3 parts separated by dots)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.log('Invalid token structure - parts:', tokenParts.length);
      return res.status(401).json({ error: 'Malformed token structure' });
    }

    // Use consistent secret
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    // console.log('Using JWT_SECRET:', JWT_SECRET); // Debug line - remove in production

    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log('Token decoded successfully:', decoded); // Debug line
    
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
    console.error('Auth middleware error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.name === 'JsonWebTokenError') {
      if (error.message.includes('invalid signature')) {
        return res.status(401).json({ error: 'Token signature verification failed - check JWT_SECRET' });
      }
      return res.status(401).json({ error: 'Invalid token format' });
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
