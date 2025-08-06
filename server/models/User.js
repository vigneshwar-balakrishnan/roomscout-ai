const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  firstName: { 
    type: String, 
    required: true,
    trim: true
  },
  lastName: { 
    type: String, 
    required: true,
    trim: true
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  preferences: {
    budgetMin: { 
      type: Number, 
      default: 0,
      min: 0
    },
    budgetMax: { 
      type: Number, 
      default: 5000,
      min: 0
    },
    preferredBedrooms: { 
      type: Number, 
      default: 1,
      min: 0,
      max: 5
    },
    preferredBathrooms: { 
      type: Number, 
      default: 1,
      min: 0,
      max: 5
    },
    preferredLocations: [{ 
      type: String
    }],
    requiredAmenities: [{ 
      type: String
    }],
    moveInDate: { 
      type: Date 
    },
    genderPreference: { 
      type: String, 
      enum: ['any', 'male', 'female'],
      default: 'any'
    }
  },
  interactions: [{
    listingId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Housing' 
    },
    interactionType: { 
      type: String, 
      enum: ['view', 'save', 'contact', 'like', 'dislike'] 
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    }
  }],
  lastLogin: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  savedListings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Housing'
  }],
  notificationPreferences: {
    email: { 
      type: Boolean, 
      default: true 
    },
    push: { 
      type: Boolean, 
      default: true 
    },
    sms: { 
      type: Boolean, 
      default: false 
    },
    inApp: { 
      type: Boolean, 
      default: true 
    },
    frequency: { 
      type: String, 
      enum: ['immediate', 'daily', 'weekly'],
      default: 'daily'
    }
  }
}, {
  timestamps: true
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    if (!this.password) {
      console.error('No password hash found for user');
      return false;
    }
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Method to get user profile (without password)
userSchema.methods.getProfile = function() {
  try {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpires;
    return userObject;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return {
      _id: this._id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      isVerified: this.isVerified,
      lastLogin: this.lastLogin,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
};

// Method to add interaction
userSchema.methods.addInteraction = function(listingId, interactionType) {
  this.interactions.push({
    listingId,
    interactionType,
    timestamp: new Date()
  });
  return this.save();
};

// Method to get recent interactions
userSchema.methods.getRecentInteractions = function(limit = 10) {
  return this.interactions
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

// Indexes for efficient queries
userSchema.index({ 'preferences.preferredLocations': 1 });
userSchema.index({ 'preferences.budgetMin': 1, 'preferences.budgetMax': 1 });

module.exports = mongoose.model('User', userSchema); 