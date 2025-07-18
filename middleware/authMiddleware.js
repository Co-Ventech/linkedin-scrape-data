// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/authModel'); // or your user model

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Optionally fetch user from DB if you want more info
    // const user = await User.findById(decoded.id);
    // req.user = user;
    req.user = { _id: decoded.id }; // or whatever your payload uses
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};