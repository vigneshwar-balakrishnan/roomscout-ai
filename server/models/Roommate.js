const mongoose = require('mongoose');

const roommateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isLookingForRoommate: {
    type: Boolean,
    default: true
  },
  isLookingForRoom: {
    type: Boolean,
    default: true
  },
  preferences: {
    budgetMin: {
      type: Number,
      required: true,
      min: 0
    },
    budgetMax: {
      type: Number,
      required: true,
      min: 0
    },
    preferredBedrooms: {
      type: Number,
      default: 1,
      min: 1,
      max: 5
    },
    preferredBathrooms: {
      type: Number,
      default: 1,
      min: 1,
      max: 5
    },
    preferredLocations: [{
      type: String,
      enum: [
        'Fenway', 'Roxbury', 'Dorchester', 'Jamaica Plain', 'Allston', 
        'Brighton', 'Cambridge', 'Somerville', 'Medford', 'Brookline',
        'Back Bay', 'South End', 'North End', 'Beacon Hill', 'Charlestown'
      ]
    }],
    requiredAmenities: [{
      type: String,
      enum: [
        'wifi', 'laundry', 'kitchen', 'parking', 'gym', 'ac', 'heating',
        'dishwasher', 'balcony', 'elevator', 'doorman', 'furnished',
        'utilities_included', 'pet_friendly', 'smoke_free', 'study_room',
        'bike_storage', 'rooftop_access', 'security_system'
      ]
    }],
    lifestylePreferences: {
      quietness: {
        type: Number,
        min: 1,
        max: 5,
        required: true
      },
      cleanliness: {
        type: Number,
        min: 1,
        max: 5,
        required: true
      },
      socialness: {
        type: Number,
        min: 1,
        max: 5,
        required: true
      },
      studyHabits: {
        type: Number,
        min: 1,
        max: 5,
        required: true
      },
      sleepSchedule: {
        type: Number,
        min: 1,
        max: 5,
        required: true
      }
    },
    moveInDate: {
      type: Date,
      required: true
    },
    leaseLength: {
      type: Number,
      min: 1,
      max: 12,
      required: true
    },
    genderPreference: {
      type: String,
      enum: ['any', 'male', 'female'],
      default: 'any'
    },
    ageRange: {
      min: { type: Number, min: 18, max: 30 },
      max: { type: Number, min: 18, max: 30 }
    },
    majorPreference: [String],
    graduationYearPreference: [Number],
    petFriendly: {
      type: Boolean,
      default: false
    },
    smoking: {
      type: String,
      enum: ['no', 'yes', 'outside_only'],
      default: 'no'
    }
  },
  bio: {
    type: String,
    maxlength: 500
  },
  photos: [{
    url: String,
    caption: String
  }],
  compatibilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  matches: [{
    roommate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roommate'
    },
    compatibilityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    matchDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending'
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'matched'],
    default: 'active'
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
roommateSchema.index({ 'preferences.preferredLocations': 1 });
roommateSchema.index({ 'preferences.budgetMin': 1, 'preferences.budgetMax': 1 });
roommateSchema.index({ 'preferences.lifestylePreferences.quietness': 1 });
roommateSchema.index({ 'preferences.lifestylePreferences.cleanliness': 1 });
roommateSchema.index({ 'preferences.lifestylePreferences.socialness': 1 });
roommateSchema.index({ status: 1, lastActive: 1 });

// Method to calculate compatibility with another roommate
roommateSchema.methods.calculateCompatibility = function(otherRoommate) {
  let score = 0;
  const maxScore = 100;
  
  // Budget compatibility (25 points)
  const budgetOverlap = Math.min(this.preferences.budgetMax, otherRoommate.preferences.budgetMax) - 
                       Math.max(this.preferences.budgetMin, otherRoommate.preferences.budgetMin);
  if (budgetOverlap > 0) {
    score += 25;
  }
  
  // Location compatibility (20 points)
  const locationOverlap = this.preferences.preferredLocations.filter(loc => 
    otherRoommate.preferences.preferredLocations.includes(loc)
  ).length;
  if (locationOverlap > 0) {
    score += 20;
  }
  
  // Lifestyle compatibility (30 points)
  const lifestyleDiff = Math.abs(this.preferences.lifestylePreferences.quietness - otherRoommate.preferences.lifestylePreferences.quietness) +
                       Math.abs(this.preferences.lifestylePreferences.cleanliness - otherRoommate.preferences.lifestylePreferences.cleanliness) +
                       Math.abs(this.preferences.lifestylePreferences.socialness - otherRoommate.preferences.lifestylePreferences.socialness);
  score += Math.max(0, 30 - lifestyleDiff * 2);
  
  // Move-in date compatibility (15 points)
  const dateDiff = Math.abs(this.preferences.moveInDate - otherRoommate.preferences.moveInDate);
  if (dateDiff <= 30 * 24 * 60 * 60 * 1000) { // Within 30 days
    score += 15;
  }
  
  // Lease length compatibility (10 points)
  if (this.preferences.leaseLength === otherRoommate.preferences.leaseLength) {
    score += 10;
  }
  
  return Math.min(maxScore, score);
};

// Method to find potential matches
roommateSchema.methods.findMatches = function(limit = 10) {
  const query = {
    _id: { $ne: this._id },
    status: 'active',
    'preferences.budgetMin': { $lte: this.preferences.budgetMax },
    'preferences.budgetMax': { $gte: this.preferences.budgetMin },
    'preferences.moveInDate': {
      $gte: new Date(this.preferences.moveInDate.getTime() - 30 * 24 * 60 * 60 * 1000),
      $lte: new Date(this.preferences.moveInDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    }
  };
  
  return this.model('Roommate').find(query)
    .populate('user', 'firstName lastName major graduationYear profilePicture')
    .limit(limit);
};

module.exports = mongoose.model('Roommate', roommateSchema); 