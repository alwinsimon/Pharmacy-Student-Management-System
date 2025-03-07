// src/api/v1/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validator.middleware');
const authValidator = require('../validators/auth.validator');
const { authenticateJWT } = require('../middleware/auth.middleware');

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
  authenticateJWT,
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
  authenticateJWT,
  validate(authValidator.changePasswordSchema),
  authController.changePassword
);

module.exports = router;






// src/api/v1/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const { auth: authConfig } = require('../../../config');
const { AuthError } = require('../../../errors/auth.error');
const { asyncHandler } = require('../../../utils/error.utils');
const authService = require('../../../services/auth.service');

/**
 * Middleware to authenticate JWT
 */
const authenticateJWT = asyncHandler(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw AuthError.tokenInvalid('Authorization token is required');
  }
  
  // Extract token
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, authConfig.jwt.secret);
    
    // Attach user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw AuthError.tokenExpired();
    }
    throw AuthError.tokenInvalid();
  }
});

/**
 * Middleware to authorize by role
 * @param {String} role - Required role
 */
const authorizeRole = (role) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw AuthError.tokenInvalid('User not authenticated');
    }
    
    if (!authService.hasRole(req.user.role, role)) {
      throw AuthError.insufficientPermissions(
        `Requires ${role} role or higher`
      );
    }
    
    next();
  });
};

/**
 * Middleware to authorize by permission
 * @param {String|Array} permissions - Required permissions
 */
const authorizePermission = (permissions) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw AuthError.tokenInvalid('User not authenticated');
    }
    
    const hasPermission = await authService.hasPermission(
      req.user.id,
      permissions
    );
    
    if (!hasPermission) {
      throw AuthError.insufficientPermissions(
        'Insufficient permissions'
      );
    }
    
    next();
  });
};

module.exports = {
  authenticateJWT,
  authorizeRole,
  authorizePermission
};

// src/api/v1/middleware/validator.middleware.js
const { ValidationError } = require('../../../errors/validation.error');

/**
 * Middleware to validate request data against a Joi schema
 * @param {Object} schema - Joi validation schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      throw ValidationError.invalidInput(
        'Validation failed',
        { fields: details }
      );
    }
    
    next();
  };
};

module.exports = {
  validate
};