const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Try to find in User collection
      let identity = await User.findById(decoded.id);
      
      // If not in User, try Admin collection
      if (!identity) {
        identity = await Admin.findById(decoded.id);
      }

      if (!identity) {
        return res.status(401).json({ message: 'User or Admin not found' });
      }

      req.user = identity; // Common key for simplicity
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
