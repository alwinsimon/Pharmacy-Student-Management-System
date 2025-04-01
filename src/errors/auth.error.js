// src/errors/auth.error.js
const ApiError = require('./api.error');
const { status: { HTTP_STATUS } } = require('../constants');

/**
 * Authentication and authorization error class
 */
class AuthError extends ApiError {
  constructor(errorCode, message, details = {}) {
    super(errorCode, message, HTTP_STATUS.UNAUTHORIZED.code, details);
  }
  
  static invalidCredentials(message, details = {}) {
    return new AuthError(
      'AUTH_INVALID_CREDENTIALS',
      message || 'Invalid credentials',
      details
    );
  }
  
  static accountLocked(message, details = {}) {
    return new AuthError(
      'AUTH_ACCOUNT_LOCKED',
      message || 'Account locked due to multiple failed attempts',
      details
    );
  }
  
  static tokenExpired(message, details = {}) {
    return new AuthError(
      'AUTH_TOKEN_EXPIRED',
      message || 'Authentication token has expired',
      details
    );
  }
  
  static tokenInvalid(message, details = {}) {
    return new AuthError(
      'AUTH_TOKEN_INVALID',
      message || 'Invalid authentication token',
      details
    );
  }
  
  static notVerified(message, details = {}) {
    return new AuthError(
      'AUTH_USER_NOT_VERIFIED',
      message || 'User account is not verified',
      details
    );
  }
  
  static notApproved(message, details = {}) {
    return new AuthError(
      'AUTH_USER_NOT_APPROVED',
      message || 'User account is pending approval',
      details
    );
  }
  
  static insufficientPermissions(message, details = {}) {
    return new ApiError(
      'AUTH_INSUFFICIENT_PERMISSIONS',
      message || 'Insufficient permissions',
      HTTP_STATUS.FORBIDDEN.code,
      details
    );
  }
}

module.exports = AuthError;