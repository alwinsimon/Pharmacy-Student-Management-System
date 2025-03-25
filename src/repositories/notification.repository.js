const Notification = require('../models/notification.model');
const BaseRepository = require('./base.repository');

/**
 * Repository for Notification operations
 */
class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification, 'Notification');
  }

  /**
   * Find notifications by recipient
   * @param {String} recipientId - Recipient ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Recipient notifications
   */
  async findByRecipient(recipientId, options = {}) {
    return this.findAll({ recipient: recipientId }, options);
  }

  /**
   * Find notifications by type
   * @param {String} type - Notification type
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Type notifications
   */
  async findByType(type, options = {}) {
    return this.findAll({ type }, options);
  }

  /**
   * Find unread notifications by recipient
   * @param {String} recipientId - Recipient ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Unread notifications
   */
  async findUnreadByRecipient(recipientId, options = {}) {
    return this.findAll({ 
      recipient: recipientId,
      isRead: false
    }, options);
  }

  /**
   * Count unread notifications
   * @param {String} recipientId - Recipient ID
   * @returns {Promise<Number>} Unread count
   */
  async countUnread(recipientId) {
    return this.count({
      recipient: recipientId,
      isRead: false
    });
  }

  /**
   * Mark notification as read
   * @param {String} notificationId - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId) {
    return this.updateById(notificationId, {
      isRead: true,
      readAt: new Date()
    });
  }

  /**
   * Mark all notifications as read for recipient
   * @param {String} recipientId - Recipient ID
   * @returns {Promise<Object>} Update result
   */
  async markAllAsRead(recipientId) {
    return this.updateMany(
      {
        recipient: recipientId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );
  }
}

// Export the class
module.exports = NotificationRepository;