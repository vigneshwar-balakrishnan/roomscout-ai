const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token. User not found.' 
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        error: 'Account not verified. Please verify your email first.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired.' 
      });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Internal server error.' 
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    req.user = user;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

const requireEduEmail = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required.' 
    });
  }

  if (!req.user.isEduEmail) {
    return res.status(403).json({ 
      error: 'This feature requires a .edu email address.' 
    });
  }

  next();
};

const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required.' 
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({ 
      error: 'Please verify your email address to access this feature.' 
    });
  }

  next();
};

module.exports = {
  auth,
  optionalAuth,
  requireEduEmail,
  requireVerified
}; 