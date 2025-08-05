const mongoose = require('mongoose');

const uploadSessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sessionId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  fileSize: { 
    type: Number 
  },
  fileType: { 
    type: String, 
    enum: ['whatsapp_txt', 'csv', 'text'], 
    required: true 
  },
  
  processing: {
    status: { 
      type: String, 
      enum: ['uploaded', 'parsing', 'classifying', 'extracting', 'completed', 'error'], 
      default: 'uploaded' 
    },
    progress: { 
      type: Number, 
      min: 0, 
      max: 100, 
      default: 0 
    },
    startTime: { 
      type: Date, 
      default: Date.now 
    },
    endTime: { 
      type: Date 
    },
    errorMessage: { 
      type: String 
    },
    retryCount: {
      type: Number,
      default: 0
    },
    lastError: {
      message: String,
      timestamp: Date,
      stack: String
    }
  },
  
  parseResults: {
    totalMessages: { 
      type: Number 
    },
    participants: [{ 
      type: String 
    }],
    dateRange: {
      start: { 
        type: Date 
      },
      end: { 
        type: Date 
      }
    },
    messageTypes: {
      housing: { type: Number, default: 0 },
      spam: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    processingTime: {
      type: Number // in milliseconds
    }
  },
  
  classificationResults: {
    housingMessages: { 
      type: Number, 
      default: 0 
    },
    spamMessages: { 
      type: Number, 
      default: 0 
    },
    otherMessages: { 
      type: Number, 
      default: 0 
    },
    confidenceScores: {
      housing: { type: Number, min: 0, max: 1 },
      spam: { type: Number, min: 0, max: 1 },
      other: { type: Number, min: 0, max: 1 }
    },
    processingTime: {
      type: Number // in milliseconds
    }
  },
  
  extractionResults: {
    successfulExtractions: { 
      type: Number, 
      default: 0 
    },
    failedExtractions: { 
      type: Number, 
      default: 0 
    },
    averageConfidence: { 
      type: Number, 
      min: 0, 
      max: 1 
    },
    extractedListings: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Housing' 
    }],
    extractionDetails: [{
      messageIndex: Number,
      originalText: String,
      extractedData: {
        rent_price: String,
        location: String,
        room_type: String,
        availability_date: String,
        contact_info: String,
        gender_preference: String,
        additional_notes: String
      },
      confidence: Number,
      status: {
        type: String,
        enum: ['success', 'failed', 'needs_review'],
        default: 'needs_review'
      },
      errorMessage: String,
      processingTime: Number
    }],
    processingTime: {
      type: Number // in milliseconds
    }
  },
  
  // File metadata
  fileMetadata: {
    originalPath: String,
    storedPath: String,
    checksum: String,
    encoding: String,
    lineCount: Number,
    wordCount: Number
  },
  
  // Processing metadata
  processingMetadata: {
    langchainVersion: {
      type: String,
      default: '2.1'
    },
    modelUsed: {
      type: String,
      default: 'gpt-4'
    },
    extractionMethod: {
      type: String,
      enum: ['few_shot', 'chain_of_thought', 'hybrid'],
      default: 'hybrid'
    },
    totalTokens: {
      input: Number,
      output: Number,
      total: Number
    },
    totalCost: {
      type: Number,
      default: 0
    },
    apiCalls: {
      classification: Number,
      extraction: Number,
      total: Number
    }
  },
  
  // Quality metrics
  qualityMetrics: {
    overallQuality: {
      type: Number,
      min: 0,
      max: 1
    },
    dataCompleteness: {
      type: Number,
      min: 0,
      max: 1
    },
    accuracyScore: {
      type: Number,
      min: 0,
      max: 1
    },
    consistencyScore: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  
  // Review and validation
  review: {
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
    manualCorrections: [{
      extractionIndex: Number,
      fieldName: String,
      originalValue: String,
      correctedValue: String,
      reason: String
    }]
  }
}, { 
  timestamps: true 
});

// Indexes for efficient queries
uploadSessionSchema.index({ userId: 1, createdAt: -1 });
uploadSessionSchema.index({ 'processing.status': 1 });
uploadSessionSchema.index({ fileType: 1 });
uploadSessionSchema.index({ 'processing.startTime': 1 });
uploadSessionSchema.index({ 'extractionResults.averageConfidence': 1 });

// Method to update processing status
uploadSessionSchema.methods.updateProcessingStatus = function(status, progress = null, errorMessage = null) {
  this.processing.status = status;
  
  if (progress !== null) {
    this.processing.progress = progress;
  }
  
  if (status === 'completed') {
    this.processing.endTime = new Date();
  }
  
  if (errorMessage) {
    this.processing.errorMessage = errorMessage;
    this.processing.lastError = {
      message: errorMessage,
      timestamp: new Date()
    };
  }
  
  return this.save();
};

// Method to update parse results
uploadSessionSchema.methods.updateParseResults = function(parseData) {
  this.parseResults = { ...this.parseResults, ...parseData };
  return this.save();
};

// Method to update classification results
uploadSessionSchema.methods.updateClassificationResults = function(classificationData) {
  this.classificationResults = { ...this.classificationResults, ...classificationData };
  return this.save();
};

// Method to add extraction result
uploadSessionSchema.methods.addExtractionResult = function(extractionData) {
  this.extractionResults.extractionDetails.push(extractionData);
  
  if (extractionData.status === 'success') {
    this.extractionResults.successfulExtractions += 1;
  } else {
    this.extractionResults.failedExtractions += 1;
  }
  
  // Update average confidence
  const totalConfidence = this.extractionResults.extractionDetails.reduce((sum, detail) => {
    return sum + (detail.confidence || 0);
  }, 0);
  
  this.extractionResults.averageConfidence = totalConfidence / this.extractionResults.extractionDetails.length;
  
  return this.save();
};

// Method to link extracted listing
uploadSessionSchema.methods.linkExtractedListing = function(listingId) {
  this.extractionResults.extractedListings.push(listingId);
  return this.save();
};

// Method to complete review
uploadSessionSchema.methods.completeReview = function(reviewData) {
  this.review.isReviewed = true;
  this.review.reviewedBy = reviewData.reviewedBy;
  this.review.reviewDate = new Date();
  this.review.reviewNotes = reviewData.notes;
  this.review.manualCorrections = reviewData.corrections || [];
  return this.save();
};

// Method to retry processing
uploadSessionSchema.methods.retryProcessing = function() {
  this.processing.retryCount += 1;
  this.processing.status = 'uploaded';
  this.processing.progress = 0;
  this.processing.errorMessage = null;
  this.processing.startTime = new Date();
  this.processing.endTime = null;
  return this.save();
};

// Static method to create upload session
uploadSessionSchema.statics.createSession = function(data) {
  const sessionId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return this.create({
    sessionId,
    userId: data.userId,
    fileName: data.fileName,
    fileSize: data.fileSize,
    fileType: data.fileType,
    fileMetadata: {
      originalPath: data.originalPath,
      storedPath: data.storedPath,
      checksum: data.checksum,
      encoding: data.encoding
    }
  });
};

// Static method to get sessions by status
uploadSessionSchema.statics.getSessionsByStatus = function(status, limit = 20) {
  return this.find({ 'processing.status': status })
    .populate('userId', 'firstName lastName email')
    .populate('extractionResults.extractedListings', 'title price location')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get sessions needing review
uploadSessionSchema.statics.getSessionsNeedingReview = function(limit = 20) {
  return this.find({
    'review.isReviewed': false,
    'processing.status': 'completed'
  })
  .populate('userId', 'firstName lastName email')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get high-quality extractions
uploadSessionSchema.statics.getHighQualitySessions = function(minConfidence = 0.8, limit = 20) {
  return this.find({
    'extractionResults.averageConfidence': { $gte: minConfidence },
    'processing.status': 'completed'
  })
  .populate('userId', 'firstName lastName email')
  .populate('extractionResults.extractedListings', 'title price location')
  .sort({ 'extractionResults.averageConfidence': -1 })
  .limit(limit);
};

// Static method to get processing statistics
uploadSessionSchema.statics.getProcessingStats = function(days = 30) {
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
        _id: '$processing.status',
        count: { $sum: 1 },
        avgProgress: { $avg: '$processing.progress' },
        avgConfidence: { $avg: '$extractionResults.averageConfidence' },
        totalExtractions: { $sum: '$extractionResults.successfulExtractions' },
        totalErrors: { $sum: '$extractionResults.failedExtractions' }
      }
    }
  ]);
};

// Static method to get file type statistics
uploadSessionSchema.statics.getFileTypeStats = function(days = 30) {
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
        _id: '$fileType',
        count: { $sum: 1 },
        avgFileSize: { $avg: '$fileSize' },
        avgProcessingTime: { $avg: { $subtract: ['$processing.endTime', '$processing.startTime'] } },
        successRate: {
          $avg: {
            $cond: [
              { $eq: ['$processing.status', 'completed'] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
};

// Static method to clean old sessions
uploadSessionSchema.statics.cleanOldSessions = function(daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    'processing.status': { $in: ['completed', 'error'] }
  });
};

module.exports = mongoose.model('UploadSession', uploadSessionSchema); 