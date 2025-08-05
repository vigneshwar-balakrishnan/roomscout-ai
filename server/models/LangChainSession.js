const mongoose = require('mongoose');

const langChainSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chatSessionId: {
    type: String
  },
  uploadSession: {
    type: String
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed', 'review_needed'],
    default: 'processing'
  },
  // Input data
  inputData: {
    originalText: {
      type: String,
      required: true
    },
    source: {
      type: String,
      enum: ['chat_message', 'file_upload', 'manual_entry'],
      required: true
    },
    fileInfo: {
      fileName: String,
      fileSize: Number,
      fileType: String
    },
    messageContext: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  // LangChain processing results
  processingResults: {
    classification: {
      type: String,
      enum: ['HOUSING', 'SPAM', 'OTHER'],
      required: true
    },
    classificationConfidence: {
      type: Number,
      min: 0,
      max: 1
    },
    extractionResults: {
      rent_price: String,
      location: String,
      room_type: String,
      availability_date: String,
      contact_info: String,
      gender_preference: String,
      additional_notes: String,
      is_housing_related: Boolean
    },
    extractionConfidence: {
      type: Number,
      min: 0,
      max: 1
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 1
    },
    extractedFields: [{
      fieldName: String,
      extractedValue: String,
      confidence: Number,
      validationStatus: {
        type: String,
        enum: ['valid', 'invalid', 'needs_review'],
        default: 'needs_review'
      }
    }]
  },
  // Processing metadata
  processingMetadata: {
    langchainVersion: {
      type: String,
      default: '2.1'
    },
    extractionMethod: {
      type: String,
      enum: ['few_shot', 'chain_of_thought', 'hybrid'],
      default: 'hybrid'
    },
    modelUsed: {
      type: String,
      default: 'gpt-4'
    },
    processingTime: {
      type: Number // in milliseconds
    },
    tokensUsed: {
      input: Number,
      output: Number,
      total: Number
    },
    cost: {
      type: Number,
      default: 0
    },
    errorMessages: [String],
    warnings: [String]
  },
  // Validation and review
  validation: {
    isReviewed: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewDate: Date,
    reviewNotes: String,
    manualCorrections: mongoose.Schema.Types.Mixed,
    finalClassification: {
      type: String,
      enum: ['HOUSING', 'SPAM', 'OTHER']
    }
  },
  // Generated housing listing
  generatedListing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Housing'
  },
  // Vector embeddings
  embeddings: {
    inputEmbedding: [Number],
    extractedEmbedding: [Number],
    similarityScore: Number
  },
  // Performance metrics
  performanceMetrics: {
    accuracy: Number,
    precision: Number,
    recall: Number,
    f1Score: Number,
    processingEfficiency: Number
  }
}, {
  timestamps: true
});

// Index for efficient queries
langChainSessionSchema.index({ sessionId: 1 });
langChainSessionSchema.index({ userId: 1, createdAt: -1 });
langChainSessionSchema.index({ status: 1 });
langChainSessionSchema.index({ 'processingResults.classification': 1 });
langChainSessionSchema.index({ 'processingResults.extractionConfidence': 1 });
langChainSessionSchema.index({ 'validation.isReviewed': 1 });

// Method to update processing status
langChainSessionSchema.methods.updateStatus = function(status, metadata = {}) {
  this.status = status;
  if (metadata.processingTime) {
    this.processingMetadata.processingTime = metadata.processingTime;
  }
  if (metadata.tokensUsed) {
    this.processingMetadata.tokensUsed = metadata.tokensUsed;
  }
  if (metadata.cost) {
    this.processingMetadata.cost = metadata.cost;
  }
  return this.save();
};

// Method to set processing results
langChainSessionSchema.methods.setProcessingResults = function(results) {
  this.processingResults = { ...this.processingResults, ...results };
  this.status = 'completed';
  return this.save();
};

// Method to mark for review
langChainSessionSchema.methods.markForReview = function(reason) {
  this.status = 'review_needed';
  if (reason) {
    this.processingMetadata.warnings.push(reason);
  }
  return this.save();
};

// Method to complete review
langChainSessionSchema.methods.completeReview = function(reviewData) {
  this.validation.isReviewed = true;
  this.validation.reviewedBy = reviewData.reviewedBy;
  this.validation.reviewDate = new Date();
  this.validation.reviewNotes = reviewData.notes;
  this.validation.manualCorrections = reviewData.corrections;
  this.validation.finalClassification = reviewData.finalClassification;
  this.status = 'completed';
  return this.save();
};

// Method to link generated listing
langChainSessionSchema.methods.linkListing = function(listingId) {
  this.generatedListing = listingId;
  return this.save();
};

// Static method to create session
langChainSessionSchema.statics.createSession = function(data) {
  const sessionId = `langchain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return this.create({
    sessionId,
    userId: data.userId,
    chatSessionId: data.chatSessionId,
    uploadSession: data.uploadSession,
    inputData: {
      originalText: data.originalText,
      source: data.source,
      fileInfo: data.fileInfo,
      messageContext: data.messageContext
    },
    processingResults: {
      classification: 'OTHER', // Default classification
      extractionResults: {},
      extractedFields: []
    }
  });
};

// Static method to get sessions by status
langChainSessionSchema.statics.getSessionsByStatus = function(status, limit = 20) {
  return this.find({ status })
    .populate('userId', 'firstName lastName email')
    .populate('generatedListing', 'title price location')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get sessions needing review
langChainSessionSchema.statics.getSessionsNeedingReview = function(limit = 20) {
  return this.find({
    status: 'review_needed'
  })
  .populate('userId', 'firstName lastName email')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get high-confidence extractions
langChainSessionSchema.statics.getHighConfidenceSessions = function(minConfidence = 0.8, limit = 20) {
  return this.find({
    'processingResults.extractionConfidence': { $gte: minConfidence },
    'processingResults.classification': 'HOUSING',
    status: 'completed'
  })
  .populate('userId', 'firstName lastName email')
  .populate('generatedListing', 'title price location')
  .sort({ 'processingResults.extractionConfidence': -1 })
  .limit(limit);
};

// Static method to get processing statistics
langChainSessionSchema.statics.getProcessingStats = function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$processingResults.extractionConfidence' },
        avgProcessingTime: { $avg: '$processingMetadata.processingTime' }
      }
    }
  ]);
};

module.exports = mongoose.model('LangChainSession', langChainSessionSchema); 