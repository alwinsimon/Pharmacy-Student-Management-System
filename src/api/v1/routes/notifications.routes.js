// src/api/v1/routes/notifications.routes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notifications.controller');
const { validate } = require('../middleware/validator.middleware');
const notificationValidator = require('../validators/notification.validator');
const { authenticateJWT } = require('../middleware/auth.middleware');

/**
 * @route GET /api/v1/notifications
 * @desc Get user notifications
 * @access Private
 */
router.get(
  '/',
  authenticateJWT,
  notificationController.getUserNotifications
);

/**
 * @route GET /api/v1/notifications/unread-count
 * @desc Get unread notification count
 * @access Private
 */
router.get(
  '/unread-count',
  authenticateJWT,
  notificationController.getUnreadCount
);

/**
 * @route PATCH /api/v1/notifications/:id/read
 * @desc Mark notification as read
 * @access Private
 */
router.patch(
  '/:id/read',
  authenticateJWT,
  notificationController.markAsRead
);

/**
 * @route PATCH /api/v1/notifications/read-all
 * @desc Mark all notifications as read
 * @access Private
 */
router.patch(
  '/read-all',
  authenticateJWT,
  notificationController.markAllAsRead
);

module.exports = router;