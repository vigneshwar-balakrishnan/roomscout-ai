const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'new_listing',
      'listing_viewed',
      'listing_saved',
      'new_message',
      'roommate_match',
      'match_request',
      'match_accepted',
      'match_rejected',
      'price_change',
      'availability_change',
      'review_received',
      'system_alert',
      'email_verification',
      'password_reset'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  data: {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Housing'
    },
    roommateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roommate'
    },
    chatSessionId: String,
    url: String,
    actionRequired: {
      type: Boolean,
      default: false
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveryChannels: [{
    type: String,
    enum: ['email', 'push', 'sms', 'in_app'],
    default: ['in_app']
  }],
  scheduledFor: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  metadata: {
    source: String,
    category: String,
    tags: [String]
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Method to mark as delivered
notificationSchema.methods.markAsDelivered = function(channel) {
  if (channel) {
    if (!this.deliveryChannels.includes(channel)) {
      this.deliveryChannels.push(channel);
    }
  }
  this.isDelivered = true;
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = function(data) {
  return this.create({
    recipient: data.recipient,
    sender: data.sender,
    type: data.type,
    title: data.title,
    message: data.message,
    data: data.data || {},
    priority: data.priority || 'medium',
    deliveryChannels: data.deliveryChannels || ['in_app'],
    scheduledFor: data.scheduledFor,
    expiresAt: data.expiresAt,
    metadata: data.metadata || {}
  });
};

// Static method to get unread notifications for user
notificationSchema.statics.getUnreadNotifications = function(userId, limit = 20) {
  return this.find({
    recipient: userId,
    isRead: false
  })
  .populate('sender', 'firstName lastName profilePicture')
  .populate('data.listingId', 'title images')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get notifications by type
notificationSchema.statics.getNotificationsByType = function(userId, type, limit = 20) {
  return this.find({
    recipient: userId,
    type: type
  })
  .populate('sender', 'firstName lastName profilePicture')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to mark all notifications as read
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
};

// Static method to delete expired notifications
notificationSchema.statics.deleteExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

module.exports = mongoose.model('Notification', notificationSchema); 