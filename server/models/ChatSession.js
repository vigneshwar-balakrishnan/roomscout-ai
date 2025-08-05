const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'image', 'system'],
    default: 'text'
  },
  metadata: {
    fileName: String,
    fileSize: Number,
    fileType: String,
    uploadId: String
  }
});

// Enhanced message schema for LangChain integration
const enhancedMessageSchema = new mongoose.Schema({
  role: { 
    type: String, 
    enum: ['user', 'assistant', 'system'] 
  },
  content: { 
    type: String, 
    required: true 
  },
  messageType: { 
    type: String, 
    enum: ['text', 'file_upload', 'housing_result', 'error'], 
    default: 'text' 
  },
  
  metadata: {
    query_intent: { 
      type: String, 
      enum: ['housing_search', 'information_request', 'file_upload', 'casual_chat'] 
    },
    extracted_params: {
      price_range: { 
        min: Number, 
        max: Number 
      },
      location: { 
        type: String 
      },
      bedrooms: { 
        type: Number 
      },
      amenities: [{ 
        type: String 
      }],
      room_type: {
        type: String,
        enum: ['single', 'double', 'triple', 'studio', '1BR', '2BR', '3BR+']
      },
      move_in_date: {
        type: Date
      },
      lease_length: {
        type: Number,
        min: 1,
        max: 12
      }
    },
    langchain_response: {
      processing_time: { 
        type: Number 
      },
      confidence_score: { 
        type: Number,
        min: 0,
        max: 1
      },
      extraction_method: { 
        type: String,
        enum: ['few_shot', 'chain_of_thought', 'hybrid']
      },
      tokens_used: {
        input: Number,
        output: Number,
        total: Number
      },
      model_used: {
        type: String,
        default: 'gpt-4'
      },
      cost: {
        type: Number,
        default: 0
      }
    },
    housing_results: [{ 
      listingId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Housing' 
      },
      relevanceScore: { 
        type: Number,
        min: 0,
        max: 1
      },
      matchReason: String,
      extractedData: {
        rent_price: String,
        location: String,
        room_type: String,
        availability_date: String,
        contact_info: String,
        gender_preference: String,
        additional_notes: String
      }
    }],
    file_processing: {
      fileName: String,
      fileSize: Number,
      fileType: String,
      uploadSessionId: String,
      processingStatus: {
        type: String,
        enum: ['uploaded', 'processing', 'completed', 'error'],
        default: 'uploaded'
      },
      extractionResults: {
        totalMessages: Number,
        housingMessagesFound: Number,
        extractedListings: [{ 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Housing' 
        }]
      }
    },
    error_details: {
      errorType: String,
      errorMessage: String,
      stackTrace: String,
      retryCount: {
        type: Number,
        default: 0
      }
    }
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [messageSchema], // Keep original for backward compatibility
  enhancedMessages: [enhancedMessageSchema], // New enhanced messages
  context: {
    uploadedFiles: [{
      fileName: String,
      fileType: String,
      uploadDate: Date,
      content: String,
      processed: {
        type: Boolean,
        default: false
      }
    }],
    userPreferences: {
      budget: {
        min: Number,
        max: Number
      },
      location: String,
      roomType: String,
      amenities: [String]
    },
    conversationSummary: String,
    lastQuery: String
  },
  
  // Enhanced conversation context for LangChain
  conversationContext: {
    uploadedFiles: [{
      fileName: { 
        type: String 
      },
      fileType: {
        type: String,
        enum: ['whatsapp_txt', 'csv', 'text']
      },
      uploadSessionId: String,
      processingResults: {
        totalMessages: { 
          type: Number 
        },
        housingMessagesFound: { 
          type: Number 
        },
        extractedListings: [{ 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Housing' 
        }],
        processingStatus: {
          type: String,
          enum: ['uploaded', 'processing', 'completed', 'error'],
          default: 'uploaded'
        },
        confidenceScore: {
          type: Number,
          min: 0,
          max: 1
        }
      }
    }],
    conversationSummary: String,
    userIntent: {
      type: String,
      enum: ['housing_search', 'information_request', 'file_upload', 'casual_chat'],
      default: 'casual_chat'
    },
    extractedPreferences: {
      budget: {
        min: Number,
        max: Number
      },
      location: String,
      roomType: String,
      amenities: [String],
      moveInDate: Date,
      leaseLength: Number
    },
    lastQuery: String,
    conversationHistory: [{
      query: String,
      response: String,
      timestamp: Date,
      confidence: Number
    }]
  },
  
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    deviceType: String
  },
  analytics: {
    messageCount: {
      type: Number,
      default: 0
    },
    sessionDuration: Number, // in minutes
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  
  // LangChain processing metadata
  langchainMetadata: {
    processingEnabled: {
      type: Boolean,
      default: true
    },
    modelUsed: {
      type: String,
      default: 'gpt-4'
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
    processingTime: {
      type: Number // in milliseconds
    },
    extractionCount: {
      type: Number,
      default: 0
    },
    averageConfidence: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  
  // Quality metrics
  qualityMetrics: {
    conversationQuality: {
      type: Number,
      min: 0,
      max: 1
    },
    userSatisfaction: {
      type: Number,
      min: 1,
      max: 5
    },
    responseRelevance: {
      type: Number,
      min: 0,
      max: 1
    },
    extractionAccuracy: {
      type: Number,
      min: 0,
      max: 1
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatSessionSchema.index({ userId: 1, createdAt: -1 });
chatSessionSchema.index({ 'conversationContext.userIntent': 1 });
chatSessionSchema.index({ 'langchainMetadata.processingEnabled': 1 });
chatSessionSchema.index({ 'qualityMetrics.conversationQuality': 1 });

// Method to add message (backward compatibility)
chatSessionSchema.methods.addMessage = function(sender, content, messageType = 'text', metadata = {}) {
  const message = {
    sender,
    content,
    messageType,
    metadata,
    timestamp: new Date()
  };
  
  this.messages.push(message);
  this.analytics.messageCount = this.messages.length;
  this.analytics.lastActivity = new Date();
  
  return this.save();
};

// Method to add enhanced message
chatSessionSchema.methods.addEnhancedMessage = function(messageData) {
  const enhancedMessage = {
    role: messageData.role,
    content: messageData.content,
    messageType: messageData.messageType || 'text',
    metadata: messageData.metadata || {},
    timestamp: new Date()
  };
  
  this.enhancedMessages.push(enhancedMessage);
  this.analytics.messageCount = this.enhancedMessages.length;
  this.analytics.lastActivity = new Date();
  
  // Update LangChain metadata
  if (messageData.metadata?.langchain_response) {
    const response = messageData.metadata.langchain_response;
    this.langchainMetadata.totalTokens.input += response.tokens_used?.input || 0;
    this.langchainMetadata.totalTokens.output += response.tokens_used?.output || 0;
    this.langchainMetadata.totalTokens.total += response.tokens_used?.total || 0;
    this.langchainMetadata.totalCost += response.cost || 0;
    this.langchainMetadata.processingTime += response.processing_time || 0;
    
    if (response.confidence_score) {
      this.langchainMetadata.extractionCount += 1;
      // Update average confidence
      const totalConfidence = this.langchainMetadata.averageConfidence * (this.langchainMetadata.extractionCount - 1) + response.confidence_score;
      this.langchainMetadata.averageConfidence = totalConfidence / this.langchainMetadata.extractionCount;
    }
  }
  
  return this.save();
};

// Method to get recent messages
chatSessionSchema.methods.getRecentMessages = function(limit = 50) {
  return this.messages.slice(-limit);
};

// Method to get recent enhanced messages
chatSessionSchema.methods.getRecentEnhancedMessages = function(limit = 50) {
  return this.enhancedMessages.slice(-limit);
};

// Method to update context
chatSessionSchema.methods.updateContext = function(updates) {
  this.context = { ...this.context, ...updates };
  return this.save();
};

// Method to update conversation context
chatSessionSchema.methods.updateConversationContext = function(updates) {
  this.conversationContext = { ...this.conversationContext, ...updates };
  return this.save();
};

// Method to add uploaded file
chatSessionSchema.methods.addUploadedFile = function(fileInfo) {
  this.context.uploadedFiles.push({
    fileName: fileInfo.fileName,
    fileType: fileInfo.fileType,
    uploadDate: new Date(),
    content: fileInfo.content,
    processed: false
  });
  return this.save();
};

// Method to add enhanced uploaded file
chatSessionSchema.methods.addEnhancedUploadedFile = function(fileInfo) {
  this.conversationContext.uploadedFiles.push({
    fileName: fileInfo.fileName,
    fileType: fileInfo.fileType,
    uploadSessionId: fileInfo.uploadSessionId,
    processingResults: {
      totalMessages: fileInfo.totalMessages || 0,
      housingMessagesFound: fileInfo.housingMessagesFound || 0,
      extractedListings: fileInfo.extractedListings || [],
      processingStatus: fileInfo.processingStatus || 'uploaded',
      confidenceScore: fileInfo.confidenceScore || 0
    }
  });
  return this.save();
};

// Method to update file processing results
chatSessionSchema.methods.updateFileProcessingResults = function(fileName, processingResults) {
  const fileIndex = this.conversationContext.uploadedFiles.findIndex(file => file.fileName === fileName);
  if (fileIndex !== -1) {
    this.conversationContext.uploadedFiles[fileIndex].processingResults = {
      ...this.conversationContext.uploadedFiles[fileIndex].processingResults,
      ...processingResults
    };
  }
  return this.save();
};

// Method to add conversation history
chatSessionSchema.methods.addConversationHistory = function(query, response, confidence) {
  this.conversationContext.conversationHistory.push({
    query,
    response,
    timestamp: new Date(),
    confidence: confidence || 0
  });
  return this.save();
};

// Method to update quality metrics
chatSessionSchema.methods.updateQualityMetrics = function(metrics) {
  this.qualityMetrics = { ...this.qualityMetrics, ...metrics };
  return this.save();
};

// Static method to create new session
chatSessionSchema.statics.createSession = function(userId, sessionId) {
  return this.create({
    userId,
    sessionId,
    title: 'New Chat',
    messages: [],
    enhancedMessages: [],
    context: {
      uploadedFiles: [],
      userPreferences: {},
      conversationSummary: '',
      lastQuery: ''
    },
    conversationContext: {
      uploadedFiles: [],
      conversationSummary: '',
      userIntent: 'casual_chat',
      extractedPreferences: {},
      lastQuery: '',
      conversationHistory: []
    },
    langchainMetadata: {
      processingEnabled: true,
      modelUsed: 'gpt-4',
      totalTokens: { input: 0, output: 0, total: 0 },
      totalCost: 0,
      processingTime: 0,
      extractionCount: 0,
      averageConfidence: 0
    },
    qualityMetrics: {
      conversationQuality: 0,
      userSatisfaction: 0,
      responseRelevance: 0,
      extractionAccuracy: 0
    }
  });
};

// Static method to get user sessions
chatSessionSchema.statics.getUserSessions = function(userId, limit = 20) {
  return this.find({ 
    userId, 
    status: { $ne: 'deleted' } 
  })
  .sort({ updatedAt: -1 })
  .limit(limit)
  .select('sessionId title createdAt updatedAt analytics.messageCount');
};

// Static method to get sessions with LangChain processing
chatSessionSchema.statics.getSessionsWithLangChain = function(userId, limit = 20) {
  return this.find({ 
    userId, 
    status: { $ne: 'deleted' },
    'langchainMetadata.processingEnabled': true
  })
  .populate('conversationContext.uploadedFiles.processingResults.extractedListings', 'title price location')
  .sort({ updatedAt: -1 })
  .limit(limit);
};

// Static method to get sessions by intent
chatSessionSchema.statics.getSessionsByIntent = function(userId, intent, limit = 20) {
  return this.find({ 
    userId, 
    status: { $ne: 'deleted' },
    'conversationContext.userIntent': intent
  })
  .sort({ updatedAt: -1 })
  .limit(limit);
};

// Static method to get high-quality sessions
chatSessionSchema.statics.getHighQualitySessions = function(minQuality = 0.7, limit = 20) {
  return this.find({ 
    'qualityMetrics.conversationQuality': { $gte: minQuality },
    status: { $ne: 'deleted' }
  })
  .sort({ 'qualityMetrics.conversationQuality': -1 })
  .limit(limit);
};

module.exports = mongoose.model('ChatSession', chatSessionSchema); 