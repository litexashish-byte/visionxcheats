const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Optional auth - attaches user if token exists, but doesn't block
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (req.isDemoMode) {
      const user = req.demoDB.findUserById(decoded.id);
      if (user && !user.isBanned) {
        req.user = user;
        req.user._id = user._id;
      }
      return next();
    }

    const user = await User.findById(decoded.id);
    if (user && !user.isBanned) {
      req.user = user;
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = optionalAuth;
