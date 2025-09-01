// // middleware/authMiddleware.js
// const jwt = require('jsonwebtoken');
// const User = require('../models/authModel'); // or your user model

// // module.exports = async (req, res, next) => {

// //   const authHeader = req.headers.authorization;
// //   if (!authHeader || !authHeader.startsWith('Bearer ')) {
// //     return res.status(401).json({ message: 'No token provided' });
// //   }
// //   const token = authHeader.split(' ')[1];
// //   try {
// //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //     console.log(decoded)
// //     // Optionally fetch user from DB if you want more info
// //     // const user = await User.findById(decoded.id);
// //     // req.user = user;
// //     req.user = { _id: decoded?.id || decoded?.userId }; // or whatever your payload uses
// //     next();
// //   } catch (err) {
// //     return res.status(401).json({ message: 'Invalid token' });
// //   }
// // };

// // module.exports = async (req, res, next) => {
// //   try {
// //     const token = req.headers.authorization.split(' ')[1];
// //     const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

// //     // Attach user details to the request
// //     req.user = {
// //       userId: decodedToken.userId,
// //       role: decodedToken.role,
// //       company: decodedToken.company || null // Ensure company is included if available
// //     };

// //     next();
// //   } catch (error) {
// //     console.error('Authentication error:', error);
// //     res.status(401).json({ message: 'Authentication failed.' });
// //   }
// // };


// module.exports = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization.split(' ')[1];
//     const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

//     // Attach user details to the request
//     req.user = {
//       userId: decodedToken.userId,
//       role: decodedToken.role,
//       company: decodedToken.company || null, // Already handles object or null
//       username: decodedToken.username // Add this
//     };

//     next();
//   } catch (error) {
//     console.error('Authentication error:', error);
//     res.status(401).json({ message: 'Authentication failed.' });
//   }
// };
// authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Use the correct User model (from attached_file:13)

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch full user from DB and populate company
    const user = await User.findById(decodedToken.userId)
      .populate('company', 'name description isActive subscriptionPlan subscriptionStatus jobsQuota jobsUsed subscriptionStartDate subscriptionEndDate');

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated.' });
    }

    // Attach full user to req.user
    req.user = user;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed.' });
  }
};
