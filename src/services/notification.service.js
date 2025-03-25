// src/services/notification.service.js
const NotificationRepository = require('../repositories/notification.repository');
const UserRepository = require('../repositories/user.repository');
const { objectId } = require('../utils/validation.utils');
const emailService = require('./email.service');

class NotificationService {
  constructor() {
    this.notificationRepository = new NotificationRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Create notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification
   */
  async createNotification(notificationData) {
    if (!notificationData.recipient) {
      throw new Error('Recipient is required for notification');
    }
    
    if (!notificationData.type) {
      throw new Error('Type is required for notification');
    }
    
    if (!notificationData.title) {
      throw new Error('Title is required for notification');
    }
    
    if (!notificationData.message) {
      throw new Error('Message is required for notification');
    }
    
    const notification = await this.notificationRepository.create(notificationData);
    
    // Send email notification if user has email notifications enabled
    try {
      const user = await this.userRepository.findUserWithProfile({ _id: notificationData.recipient });
      
      if (user && 
          user.profile && 
          user.profile.preferences && 
          user.profile.preferences.notifications && 
          user.profile.preferences.notifications.email) {
        
        await emailService.sendEmail({
          to: user.email,
          subject: notificationData.title,
          text: notificationData.message,
          html: `<div style="font-family: Arial, sans-serif;">${notificationData.message}</div>`
        });
        
        // Update notification with email sent status
        await this.notificationRepository.updateById(notification._id, {
          emailSent: true,
          emailSentAt: new Date()
        });
      }
    } catch (error) {
      // Log error but don't fail if email fails
      console.error('Failed to send email notification', error);
    }
    
    return notification;
  }

  /**
   * Mark notification as read
   * @param {String} notificationId - Notification ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId, userId) {
    objectId(notificationId);
    objectId(userId);
    
    const notification = await this.notificationRepository.findById(notificationId);
    
    // Verify user is the recipient
    if (notification.recipient.toString() !== userId) {
      throw new Error('User is not the recipient of this notification');
    }
    
    // Update notification
    return this.notificationRepository.updateById(notificationId, {
      isRead: true,
      readAt: new Date()
    });
  }

  /**
   * Get notifications for user
   * @param {String} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} User notifications
   */
  async getUserNotifications(userId, options = {}) {
    objectId(userId);
    
    return this.notificationRepository.findAll(
      { recipient: userId },
      {
        sort: { createdAt: -1 },
        ...options
      }
    );
  }

  /**
   * Get unread count for user
   * @param {String} userId - User ID
   * @returns {Promise<Number>} Unread count
   */
  async getUnreadCount(userId) {
    objectId(userId);
    
    return this.notificationRepository.count({
      recipient: userId,
      isRead: false
    });
  }

  /**
   * Mark all notifications as read for user
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Update result
   */
  async markAllAsRead(userId) {
    objectId(userId);
    
    return this.notificationRepository.updateMany(
      {
        recipient: userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );
  }

  /**
   * Send case submitted notification
   * @param {Object} caseData - Case data
   * @returns {Promise<Array>} Created notifications
   */
  async sendCaseSubmittedNotification(caseData) {
    // Get department managers
    const managers = await this.userRepository.findAll({
      role: 'manager',
      department: caseData.department,
      status: 'active'
    });
    
    const notifications = [];
    
    // Notify each manager
    for (const manager of managers) {
      const notification = await this.createNotification({
        recipient: manager._id,
        sender: caseData.student,
        type: 'case_update',
        title: 'New Case Submission',
        message: `A new clinical case "${caseData.title}" has been submitted and requires review. Case number: ${caseData.caseNumber}`,
        relatedEntity: 'case',
        relatedEntityId: caseData._id
      });
      
      notifications.push(notification);
    }
    
    return notifications;
  }

  /**
   * Send case assigned notification
   * @param {Object} caseData - Case data
   * @param {Object} staffData - Staff data
   * @returns {Promise<Object>} Created notification
   */
  async sendCaseAssignedNotification(caseData, staffData) {
    return this.createNotification({
      recipient: staffData._id,
      sender: caseData.student,
      type: 'assignment',
      title: 'Case Assigned for Review',
      message: `You have been assigned to review the clinical case "${caseData.title}". Case number: ${caseData.caseNumber}`,
      relatedEntity: 'case',
      relatedEntityId: caseData._id
    });
  }

  /**
   * Send case review started notification
   * @param {Object} caseData - Case data
   * @returns {Promise<Object>} Created notification
   */
  async sendCaseReviewStartedNotification(caseData) {
    return this.createNotification({
      recipient: caseData.student,
      sender: caseData.assignedTo,
      type: 'case_update',
      title: 'Case Review Started',
      message: `The review of your clinical case "${caseData.title}" has been started. Case number: ${caseData.caseNumber}`,
      relatedEntity: 'case',
      relatedEntityId: caseData._id
    });
  }

  /**
   * Send revision requested notification
   * @param {Object} caseData - Case data
   * @param {String} revisionDescription - Revision description
   * @returns {Promise<Object>} Created notification
   */
  async sendRevisionRequestedNotification(caseData, revisionDescription) {
    return this.createNotification({
      recipient: caseData.student,
      sender: caseData.assignedTo,
      type: 'case_update',
      title: 'Revision Required for Your Case',
      message: `Your clinical case "${caseData.title}" requires revisions. Details: ${revisionDescription}`,
      relatedEntity: 'case',
      relatedEntityId: caseData._id
    });
  }

  /**
   * Send review completed notification
   * @param {Object} caseData - Case data
   * @returns {Promise<Object>} Created notification
   */
  async sendReviewCompletedNotification(caseData) {
    let scoreMessage = '';
    
    if (caseData.evaluation && caseData.evaluation.score !== undefined) {
      scoreMessage = ` Your score is ${caseData.evaluation.score}/${caseData.evaluation.maxScore || 100}.`;
    }
    
    return this.createNotification({
      recipient: caseData.student,
      sender: caseData.assignedTo,
      type: 'case_update',
      title: 'Case Review Completed',
      message: `The review of your clinical case "${caseData.title}" has been completed.${scoreMessage} You can now view the full evaluation.`,
      relatedEntity: 'case',
      relatedEntityId: caseData._id
    });
  }

  /**
   * Send document shared notification
   * @param {Object} documentData - Document data
   * @param {Array} recipientIds - Recipient IDs
   * @param {String} senderId - Sender ID
   * @returns {Promise<Array>} Created notifications
   */
  async sendDocumentSharedNotification(documentData, recipientIds, senderId) {
    const notifications = [];
    
    for (const recipientId of recipientIds) {
      const notification = await this.createNotification({
        recipient: recipientId,
        sender: senderId,
        type: 'document_update',
        title: 'Document Shared With You',
        message: `A document "${documentData.title}" has been shared with you.`,
        relatedEntity: 'document',
        relatedEntityId: documentData._id
      });
      
      notifications.push(notification);
    }
    
    return notifications;
  }
}

module.exports = new NotificationService();