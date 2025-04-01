const notificationService = require('../../../services/notification.service');
const { asyncHandler } = require('../../../utils/error.utils');
const { status: { HTTP_STATUS } } = require('../../../constants');
const { objectId } = require('../../../utils/validation.utils');

/**
 * Get user notifications
 * @route GET /api/v1/notifications
 */
const getUserNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  
  // Build filter
  const filter = { recipient: req.user.id };
  
  if (unreadOnly === 'true') {
    filter.isRead = false;
  }
  
  const notifications = await notificationService.getUserNotifications(req.user.id, {
    filter,
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 }
  });
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Notifications retrieved successfully',
    data: notifications
  });
});

/**
 * Get unread notification count
 * @route GET /api/v1/notifications/unread-count
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Unread count retrieved successfully',
    data: { count }
  });
});

/**
 * Mark notification as read
 * @route PATCH /api/v1/notifications/:id/read
 */
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  
  const notification = await notificationService.markAsRead(id, req.user.id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Notification marked as read',
    data: notification
  });
});

/**
 * Mark all notifications as read
 * @route PATCH /api/v1/notifications/read-all
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};