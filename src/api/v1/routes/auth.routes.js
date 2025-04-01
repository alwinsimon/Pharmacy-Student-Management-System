// src/api/v1/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validator.middleware');
const authValidator = require('../validators/auth.validator');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  validate(authValidator.registerSchema),
  authController.register
);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user
 * @access Public
 */
router.post(
  '/login',
  validate(authValidator.loginSchema),
  authController.login
);

/**
 * @route POST /api/v1/auth/refresh-token
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post(
  '/refresh-token',
  validate(authValidator.refreshTokenSchema),
  authController.refreshToken
);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post(
  '/logout',
  authenticate,
  validate(authValidator.logoutSchema),
  authController.logout
);

/**
 * @route GET /api/v1/auth/verify-email/:token
 * @desc Verify user email address
 * @access Public
 */
router.get(
  '/verify-email/:token',
  authController.verifyEmail
);

/**
 * @route POST /api/v1/auth/request-password-reset
 * @desc Request password reset
 * @access Public
 */
router.post(
  '/request-password-reset',
  validate(authValidator.requestPasswordResetSchema),
  authController.requestPasswordReset
);

/**
 * @route POST /api/v1/auth/reset-password
 * @desc Reset password using token
 * @access Public
 */
router.post(
  '/reset-password',
  validate(authValidator.resetPasswordSchema),
  authController.resetPassword
);

/**
 * @route POST /api/v1/auth/change-password
 * @desc Change password (authenticated user)
 * @access Private
 */
router.post(
  '/change-password',
  authenticate,
  validate(authValidator.changePasswordSchema),
  authController.changePassword
);

module.exports = router;