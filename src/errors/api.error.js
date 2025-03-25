// src/errors/api.error.js
const BaseError = require('./base.error');
const { errors: { ERROR_TYPES, ERROR_CODES }, status: { HTTP_STATUS } } = require('../constants');

/**
 * API Error class for handling HTTP-specific errors
 */
class ApiError extends BaseError {
  constructor(
    errorCode = ERROR_CODES.UNKNOWN_ERROR.code,
    message = ERROR_CODES.UNKNOWN_ERROR.message,
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR.code,
    details = {}
  ) {
    const errorInfo = ERROR_CODES[errorCode] || ERROR_CODES.UNKNOWN_ERROR;
    const errorType = errorInfo.type || ERROR_TYPES.UNKNOWN;
    
    super(
      message || errorInfo.message,
      errorCode || errorInfo.code,
      errorType,
      statusCode,
      details
    );
  }
  
  static badRequest(message, errorCode = 'VALIDATION_INVALID_INPUT', details = {}) {
    return new ApiError(
      errorCode,
      message || ERROR_CODES[errorCode]?.message || 'Bad request',
      HTTP_STATUS.BAD_REQUEST.code,
      details
    );
  }
  
  static unauthorized(message, errorCode = 'AUTH_INVALID_CREDENTIALS', details = {}) {
    return new ApiError(
      errorCode,
      message || ERROR_CODES[errorCode]?.message || 'Unauthorized',
      HTTP_STATUS.UNAUTHORIZED.code,
      details
    );
  }
  
  static forbidden(message, errorCode = 'AUTH_INSUFFICIENT_PERMISSIONS', details = {}) {
    return new ApiError(
      errorCode,
      message || ERROR_CODES[errorCode]?.message || 'Forbidden',
      HTTP_STATUS.FORBIDDEN.code,
      details
    );
  }
  
  static notFound(message, errorCode = 'NOT_FOUND_RESOURCE', details = {}) {
    return new ApiError(
      errorCode,
      message || ERROR_CODES[errorCode]?.message || 'Resource not found',
      HTTP_STATUS.NOT_FOUND.code,
      details
    );
  }
  
  static conflict(message, errorCode = 'CONFLICT_RESOURCE_EXISTS', details = {}) {
    return new ApiError(
      errorCode,
      message || ERROR_CODES[errorCode]?.message || 'Resource conflict',
      HTTP_STATUS.CONFLICT.code,
      details
    );
  }
  
  static validation(message, details = {}) {
    return new ApiError(
      'VALIDATION_INVALID_INPUT',
      message || 'Validation error',
      HTTP_STATUS.UNPROCESSABLE_ENTITY.code,
      details
    );
  }
  
  static internal(message, errorCode = 'UNKNOWN_ERROR', details = {}) {
    return new ApiError(
      errorCode,
      message || ERROR_CODES[errorCode]?.message || 'Internal server error',
      HTTP_STATUS.INTERNAL_SERVER_ERROR.code,
      details
    );
  }
}

module.exports = ApiError;