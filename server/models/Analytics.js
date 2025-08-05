const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    enum: [
      'page_view',
      'listing_view',
      'listing_save',
      'listing_contact',
      'search_performed',
      'filter_applied',
      'chat_message_sent',
      'file_uploaded',
      'roommate_search',
      'match_requested',
      'match_accepted',
      'match_rejected',
      'registration_completed',
      'login',
      'logout',
      'profile_updated',
      'preferences_updated',
      'notification_clicked',
      'error_occurred'
    ],
    required: true
  },
  eventData: {
    page: String,
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Housing'
    },
    searchQuery: String,
    filters: mongoose.Schema.Types.Mixed,
    messageLength: Number,
    fileType: String,
    fileSize: Number,
    errorMessage: String,
    responseTime: Number,
    userAgent: String,
    ipAddress: String,
    location: {
      lat: Number,
      lng: Number,
      city: String,
      state: String
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    source: String,
    campaign: String,
    referrer: String,
    deviceType: String,
    browser: String,
    os: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ eventType: 1, timestamp: -1 });
analyticsSchema.index({ sessionId: 1 });
analyticsSchema.index({ 'eventData.listingId': 1 });

// Static method to track event
analyticsSchema.statics.trackEvent = function(data) {
  return this.create({
    userId: data.userId,
    sessionId: data.sessionId,
    eventType: data.eventType,
    eventData: data.eventData || {},
    metadata: data.metadata || {}
  });
};

// Static method to get user analytics
analyticsSchema.statics.getUserAnalytics = function(userId, startDate, endDate) {
  const query = { userId };
  
  if (startDate && endDate) {
    query.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.find(query)
    .populate('eventData.listingId', 'title price location')
    .sort({ timestamp: -1 });
};

// Static method to get event counts by type
analyticsSchema.statics.getEventCounts = function(startDate, endDate) {
  const query = {};
  
  if (startDate && endDate) {
    query.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method to get popular listings
analyticsSchema.statics.getPopularListings = function(limit = 10, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        eventType: { $in: ['listing_view', 'listing_save', 'listing_contact'] },
        timestamp: { $gte: startDate },
        'eventData.listingId': { $exists: true }
      }
    },
    {
      $group: {
        _id: '$eventData.listingId',
        views: {
          $sum: {
            $cond: [{ $eq: ['$eventType', 'listing_view'] }, 1, 0]
          }
        },
        saves: {
          $sum: {
            $cond: [{ $eq: ['$eventType', 'listing_save'] }, 1, 0]
          }
        },
        contacts: {
          $sum: {
            $cond: [{ $eq: ['$eventType', 'listing_contact'] }, 1, 0]
          }
        },
        totalInteractions: { $sum: 1 }
      }
    },
    { $sort: { totalInteractions: -1 } },
    { $limit: limit }
  ]);
};

// Static method to get search analytics
analyticsSchema.statics.getSearchAnalytics = function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        eventType: 'search_performed',
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$eventData.searchQuery',
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$eventData.responseTime' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);
};

// Static method to get user engagement metrics
analyticsSchema.statics.getUserEngagement = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        lastActivity: { $max: '$timestamp' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method to clean old analytics data
analyticsSchema.statics.cleanOldData = function(daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  return this.deleteMany({
    timestamp: { $lt: cutoffDate }
  });
};

module.exports = mongoose.model('Analytics', analyticsSchema); 