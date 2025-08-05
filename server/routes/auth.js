const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, requireVerified } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  try {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  } catch (error) {
    console.error('Error generating access token:', error);
    throw error;
  }
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  try {
    return jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw error;
  }
};

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name is required')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Test endpoint to verify auth routes are working
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Auth routes are working',
    timestamp: new Date().toISOString(),
    jwtSecret: process.env.JWT_SECRET ? 'Configured' : 'Missing',
    mongoUri: process.env.MONGODB_URI ? 'Configured' : 'Using default'
  });
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      isVerified: true // Auto-verify all users
    });

    try {
      await user.save();
      console.log('User created successfully:', user._id);
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      return res.status(500).json({ 
        error: 'Failed to create user account' 
      });
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      refreshToken,
      user: user.getProfile()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed' 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
  try {
    console.log('Login attempt for email:', req.body.email);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    console.log('Searching for user with email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    console.log('User found:', user._id);

    // Check password
    try {
      console.log('Comparing password for user:', user._id);
      const isPasswordValid = await user.comparePassword(password);
      console.log('Password comparison result:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('Invalid password for user:', user._id);
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }
    } catch (passwordError) {
      console.error('Password comparison error:', passwordError);
      return res.status(500).json({ 
        error: 'Authentication error' 
      });
    }

    // Update last login
    try {
      user.lastLogin = new Date();
      await user.save();
      console.log('Updated last login for user:', user._id);
    } catch (saveError) {
      console.error('Error updating last login:', saveError);
      // Continue with login even if last login update fails
    }

    // Generate tokens
    try {
      console.log('Generating tokens for user:', user._id);
      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      console.log('Tokens generated successfully');

      const userProfile = user.getProfile();
      console.log('User profile retrieved');

      res.json({
        message: 'Login successful',
        token,
        refreshToken,
        user: userProfile
      });
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return res.status(500).json({ 
        error: 'Failed to generate authentication tokens' 
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed' 
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ 
        error: 'Invalid refresh token' 
      });
    }

    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found' 
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ 
      error: 'Invalid refresh token' 
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', forgotPasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        message: 'If an account with this email exists, a password reset link has been sent'
      });
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { userId: user._id, type: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token in user document (you might want to add this field to User model)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // TODO: Send email with reset link
    // For now, just return success
    console.log('Password reset token:', resetToken);

    res.json({
      message: 'If an account with this email exists, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      error: 'Failed to process password reset request' 
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', resetPasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { token, newPassword } = req.body;

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'reset') {
      return res.status(401).json({ 
        error: 'Invalid reset token' 
      });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid reset token' 
      });
    }

    // Check if token is expired
    if (user.resetPasswordExpires < new Date()) {
      return res.status(401).json({ 
        error: 'Reset token has expired' 
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(401).json({ 
      error: 'Invalid or expired reset token' 
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: req.user.getProfile()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Failed to get profile' 
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('preferences').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { firstName, lastName, preferences } = req.body;
    const updates = {};

    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (preferences) updates.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: user.getProfile()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile' 
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email address
// @access  Private
router.post('/verify-email', auth, async (req, res) => {
  try {
    if (req.user.isVerified) {
      return res.status(400).json({ 
        error: 'Email is already verified' 
      });
    }

    // Auto-verify all users for now
    req.user.isVerified = true;
    await req.user.save();
    
    res.json({
      message: 'Email verified successfully',
      user: req.user.getProfile()
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      error: 'Email verification failed' 
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Logout failed' 
    });
  }
});

module.exports = router; 