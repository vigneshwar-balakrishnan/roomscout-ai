const mongoose = require('mongoose');

const housingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  rentType: {
    type: String,
    enum: ['monthly', 'semester', 'yearly'],
    default: 'monthly'
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true,
      default: 'Boston'
    },
    state: {
      type: String,
      required: true,
      default: 'MA'
    },
    zipCode: {
      type: String,
      required: true
    },
    neighborhood: {
      type: String,
      enum: [
        'Fenway', 'Roxbury', 'Dorchester', 'Jamaica Plain', 'Allston', 
        'Brighton', 'Cambridge', 'Somerville', 'Medford', 'Brookline',
        'Back Bay', 'South End', 'North End', 'Beacon Hill', 'Charlestown'
      ],
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    distanceToNEU: Number, // in miles
    walkTimeToNEU: Number, // in minutes
    transitTimeToNEU: Number // in minutes
  },
  propertyType: {
    type: String,
    enum: ['apartment', 'house', 'condo', 'studio', 'dorm', 'townhouse'],
    required: true
  },
  roomType: {
    type: String,
    enum: ['single', 'double', 'triple', 'studio', '1BR', '2BR', '3BR+'],
    required: true
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 0
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 0
  },
  squareFootage: {
    type: Number,
    min: 0
  },
  amenities: [{
    type: String,
    enum: [
      'wifi', 'laundry', 'kitchen', 'parking', 'gym', 'ac', 'heating',
      'dishwasher', 'balcony', 'elevator', 'doorman', 'furnished',
      'utilities_included', 'pet_friendly', 'smoke_free', 'study_room',
      'bike_storage', 'rooftop_access', 'security_system', 'pool',
      'tennis_court', 'basketball_court', 'game_room', 'movie_room'
    ]
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  availability: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    isAvailable: {
      type: Boolean,
      default: true
    },
    immediateMoveIn: {
      type: Boolean,
      default: false
    }
  },
  leaseTerms: {
    minLease: {
      type: Number,
      default: 1
    },
    maxLease: Number,
    deposit: Number,
    applicationFee: Number,
    petDeposit: Number,
    utilitiesIncluded: {
      type: Boolean,
      default: false
    }
  },
  contactInfo: {
    phone: String,
    email: String,
    preferredContact: {
      type: String,
      enum: ['phone', 'email', 'both'],
      default: 'email'
    },
    responseTime: {
      type: String,
      enum: ['within_hour', 'within_day', 'within_week'],
      default: 'within_day'
    }
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'rented', 'inactive'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [String],
  // Northeastern specific fields
  northeasternFeatures: {
    shuttleAccess: {
      type: Boolean,
      default: false
    },
    bikeFriendly: {
      type: Boolean,
      default: false
    },
    studySpaces: {
      type: Boolean,
      default: false
    },
    quietHours: {
      type: Boolean,
      default: false
    },
    studentDiscount: {
      type: Boolean,
      default: false
    }
  },
  // Roommate matching
  roommatePreferences: {
    gender: {
      type: String,
      enum: ['any', 'male', 'female'],
      default: 'any'
    },
    ageRange: {
      min: { type: Number, min: 18, max: 30 },
      max: { type: Number, min: 18, max: 30 }
    },
    lifestyle: {
      quietness: { type: Number, min: 1, max: 5 },
      cleanliness: { type: Number, min: 1, max: 5 },
      socialness: { type: Number, min: 1, max: 5 }
    },
    major: [String],
    graduationYear: [Number]
  },
  // Reviews and ratings
  reviews: [{
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: {
      type: String,
      maxlength: 500
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  
  // LangChain extraction data (from Assignment 6-7)
  extractedData: {
    rent_price: { type: String },
    location: { type: String },
    room_type: { type: String },
    availability_date: { type: String },
    contact_info: { type: String },
    gender_preference: { type: String },
    additional_notes: { type: String },
    is_housing_related: { type: Boolean, required: true }
  },
  
  // LangChain processing metadata
  processingMetadata: {
    originalMessage: { type: String, required: true },
    extractionConfidence: { type: Number, min: 0, max: 1 },
    classificationScore: { type: Number, min: 0, max: 1 },
    qualityScore: { type: Number, min: 0, max: 1 },
    processingTime: { type: Number },
    langchainVersion: { type: String, default: '2.1' },
    extractionMethod: { type: String, enum: ['few_shot', 'chain_of_thought', 'hybrid'] },
    validationErrors: [{ type: String }],
    needsReview: { type: Boolean, default: false }
  },
  
  classification: { 
    type: String, 
    enum: ['HOUSING', 'SPAM', 'OTHER'], 
    required: true,
    index: true
  },
  
  // Vector embeddings for future RAG
  vectorEmbedding: [{ type: Number }],
  
  uploadSession: { type: String },
  chatSessionId: { type: String }
}, {
  timestamps: true
});

// Index for search queries
housingSchema.index({ 
  'location.neighborhood': 1, 
  price: 1, 
  propertyType: 1, 
  roomType: 1,
  status: 1 
});

// Index for location-based queries
housingSchema.index({ 
  'location.coordinates': '2dsphere' 
});

// Index for Northeastern features
housingSchema.index({
  'northeasternFeatures.shuttleAccess': 1,
  'northeasternFeatures.bikeFriendly': 1
});

// Index for extraction confidence
housingSchema.index({ 'processingMetadata.extractionConfidence': 1 });

// Index for needs review
housingSchema.index({ 'processingMetadata.needsReview': 1 });

// Virtual for full address
housingSchema.virtual('fullAddress').get(function() {
  return `${this.location.address}, ${this.location.city}, ${this.location.state} ${this.location.zipCode}`;
});

// Virtual for price per bedroom
housingSchema.virtual('pricePerBedroom').get(function() {
  return this.bedrooms > 0 ? Math.round(this.price / this.bedrooms) : this.price;
});

// Method to increment views
housingSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to toggle favorite
housingSchema.methods.toggleFavorite = function(userId) {
  const index = this.favorites.indexOf(userId);
  if (index > -1) {
    this.favorites.splice(index, 1);
  } else {
    this.favorites.push(userId);
  }
  return this.save();
};

// Method to add review
housingSchema.methods.addReview = function(reviewerId, rating, comment) {
  this.reviews.push({
    reviewer: reviewerId,
    rating,
    comment,
    date: new Date()
  });
  
  // Update average rating
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.averageRating = totalRating / this.reviews.length;
  this.reviewCount = this.reviews.length;
  
  return this.save();
};

// Method to update LangChain extraction data
housingSchema.methods.updateExtractionData = function(extractedData, processingMetadata) {
  this.extractedData = { ...this.extractedData, ...extractedData };
  this.processingMetadata = { ...this.processingMetadata, ...processingMetadata };
  return this.save();
};

// Method to set classification
housingSchema.methods.setClassification = function(classification, confidence) {
  this.classification = classification;
  this.processingMetadata.classificationScore = confidence;
  return this.save();
};

// Method to mark for review
housingSchema.methods.markForReview = function(reason) {
  this.processingMetadata.needsReview = true;
  if (reason) {
    this.processingMetadata.validationErrors.push(reason);
  }
  return this.save();
};

// Static method to search listings
housingSchema.statics.search = function(filters) {
  const query = { status: 'active' };
  
  if (filters.neighborhood) {
    query['location.neighborhood'] = filters.neighborhood;
  }
  
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = filters.minPrice;
    if (filters.maxPrice) query.price.$lte = filters.maxPrice;
  }
  
  if (filters.propertyType) {
    query.propertyType = filters.propertyType;
  }
  
  if (filters.roomType) {
    query.roomType = filters.roomType;
  }
  
  if (filters.amenities && filters.amenities.length > 0) {
    query.amenities = { $all: filters.amenities };
  }
  
  if (filters.northeasternFeatures) {
    Object.keys(filters.northeasternFeatures).forEach(key => {
      if (filters.northeasternFeatures[key]) {
        query[`northeasternFeatures.${key}`] = true;
      }
    });
  }
  
  // LangChain classification filter
  if (filters.classification) {
    query.classification = filters.classification;
  }
  
  // Quality filter
  if (filters.minConfidence) {
    query['processingMetadata.extractionConfidence'] = { $gte: filters.minConfidence };
  }
  
  return this.find(query).populate('owner', 'firstName lastName email');
};

// Static method to get listings needing review
housingSchema.statics.getListingsNeedingReview = function(limit = 20) {
  return this.find({
    'processingMetadata.needsReview': true,
    status: 'active'
  })
  .populate('owner', 'firstName lastName email')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get high-confidence extractions
housingSchema.statics.getHighConfidenceListings = function(minConfidence = 0.8, limit = 20) {
  return this.find({
    'processingMetadata.extractionConfidence': { $gte: minConfidence },
    classification: 'HOUSING',
    status: 'active'
  })
  .populate('owner', 'firstName lastName email')
  .sort({ 'processingMetadata.extractionConfidence': -1 })
  .limit(limit);
};

module.exports = mongoose.model('Housing', housingSchema); 