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