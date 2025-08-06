const Notification = require('../models/Notification');
const Housing = require('../models/Housing');

class NotificationService {
  // Create a new listing notification
  static async createNewListingNotification(listingId, userId) {
    try {
      const listing = await Housing.findById(listingId);
      if (!listing) return;

      // For now, we'll skip saved search notifications since that feature was removed
      // This can be re-implemented later if needed
      console.log('New listing notification skipped - saved searches feature removed');
    } catch (error) {
      console.error('Error creating new listing notification:', error);
    }
  }

  // Create a price change notification
  static async createPriceChangeNotification(listingId, oldPrice, newPrice, userId) {
    try {
      const listing = await Housing.findById(listingId);
      if (!listing) return;

      // Find users who have viewed or saved this listing
      const usersToNotify = await this.getUsersInterestedInListing(listingId);
      
      for (const userId of usersToNotify) {
        await Notification.createNotification({
          recipient: userId,
          type: 'price_change',
          title: 'Price Change Alert',
          message: `The price for ${listing.title} has changed from $${oldPrice} to $${newPrice}.`,
          data: {
            listingId: listing._id,
            url: `/housing/${listing._id}`
          },
          priority: 'medium'
        });
      }
    } catch (error) {
      console.error('Error creating price change notification:', error);
    }
  }

  // Create an availability change notification
  static async createAvailabilityChangeNotification(listingId, isAvailable, userId) {
    try {
      const listing = await Housing.findById(listingId);
      if (!listing) return;

      const usersToNotify = await this.getUsersInterestedInListing(listingId);
      
      for (const userId of usersToNotify) {
        await Notification.createNotification({
          recipient: userId,
          type: 'availability_change',
          title: isAvailable ? 'Listing Now Available!' : 'Listing No Longer Available',
          message: isAvailable 
            ? `${listing.title} is now available for rent.`
            : `${listing.title} is no longer available.`,
          data: {
            listingId: listing._id,
            url: `/housing/${listing._id}`
          },
          priority: 'high'
        });
      }
    } catch (error) {
      console.error('Error creating availability change notification:', error);
    }
  }

  // Create a system notification
  static async createSystemNotification(userId, title, message, priority = 'medium') {
    try {
      await Notification.createNotification({
        recipient: userId,
        type: 'system_alert',
        title,
        message,
        priority
      });
    } catch (error) {
      console.error('Error creating system notification:', error);
    }
  }

  // Check if a listing matches saved search criteria (deprecated - saved searches feature removed)
  static async checkListingMatch(savedSearch, listing) {
    // This method is deprecated since saved searches feature was removed
    return false;
  }

  // Get users interested in a listing (viewed or saved)
  static async getUsersInterestedInListing(listingId) {
    try {
      // This would typically query user interactions
      // For now, return an empty array
      return [];
    } catch (error) {
      console.error('Error getting users interested in listing:', error);
      return [];
    }
  }

  // Send daily digest notifications
  static async sendDailyDigest() {
    try {
      // Daily digest feature disabled since saved searches were removed
      console.log('Daily digest skipped - saved searches feature removed');
    } catch (error) {
      console.error('Error sending daily digest:', error);
    }
  }

  // Clean up expired notifications
  static async cleanupExpiredNotifications() {
    try {
      await Notification.deleteExpired();
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
    }
  }
}

module.exports = NotificationService; 