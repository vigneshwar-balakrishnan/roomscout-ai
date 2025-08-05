const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'location', 'system'],
    default: 'text'
  },
  attachments: [{
    url: String,
    filename: String,
    fileType: String,
    fileSize: Number
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  conversationId: {
    type: String,
    required: true
  },
  metadata: {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Housing'
    },
    roommateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roommate'
    },
    location: {
      lat: Number,
      lng: Number,
      address: String
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });
messageSchema.index({ createdAt: 1 });

// Method to mark as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark as delivered
messageSchema.methods.markAsDelivered = function() {
  this.isDelivered = true;
  this.deliveredAt = new Date();
  return this.save();
};

// Static method to create conversation ID
messageSchema.statics.createConversationId = function(userId1, userId2) {
  const sortedIds = [userId1.toString(), userId2.toString()].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = function(userId1, userId2, limit = 50, skip = 0) {
  const conversationId = this.createConversationId(userId1, userId2);
  
  return this.find({ conversationId })
    .populate('sender', 'firstName lastName profilePicture')
    .populate('recipient', 'firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get unread messages for user
messageSchema.statics.getUnreadMessages = function(userId) {
  return this.find({
    recipient: userId,
    isRead: false
  })
  .populate('sender', 'firstName lastName profilePicture')
  .sort({ createdAt: -1 });
};

// Static method to mark conversation as read
messageSchema.statics.markConversationAsRead = function(userId, conversationId) {
  return this.updateMany(
    {
      conversationId,
      recipient: userId,
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );
};

// Static method to get recent conversations for user
messageSchema.statics.getRecentConversations = function(userId, limit = 20) {
  return this.aggregate([
    {
      $match: {
        $or: [
          { sender: mongoose.Types.ObjectId(userId) },
          { recipient: mongoose.Types.ObjectId(userId) }
        ]
      }
    },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        messageCount: { $sum: 1 },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$recipient', mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$isRead', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    },
    {
      $limit: limit
    }
  ]);
};

module.exports = mongoose.model('Message', messageSchema); 