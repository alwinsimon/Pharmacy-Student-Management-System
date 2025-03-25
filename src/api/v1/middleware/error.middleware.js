// src/api/v1/middleware/error.middleware.js
const { app: { isProduction } } = require('../../../config');
const { logger } = require('../../../utils/logger.utils');
const { status: { HTTP_STATUS } } = require('../../../constants');
const ApiError = require('../../../errors/api.error');

/**
 * Error format normalization
 * Converts different error types to a consistent API error format
 */
const normalizeError = (err) => {
  // If already an ApiError, return as is
  if (err instanceof ApiError) {
    return err;
  }
  
  // Handle Mongoose validation errors
  if (err.name === 'ValidationError' && err.errors) {
    const details = Object.keys(err.errors).map(field => ({
      field,
      message: err.errors[field].message,
      value: err.errors[field].value
    }));
    
    return ApiError.validation(
      'Validation failed',
      { fields: details }
    );
  }
  
  // Handle Joi validation errors
  if (err.name === 'ValidationError' && err.details) {
    const details = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      type: detail.type
    }));
    
    return ApiError.validation(
      'Validation failed',
      { fields: details }
    );
  }
  
  // Handle MongoDB duplicate key errors
  if (err.name === 'MongoError' && err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    
    return ApiError.conflict(
      `${field} with value '${value}' already exists`,
      'CONFLICT_RESOURCE_EXISTS',
      { field, value }
    );
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiError.unauthorized(
      'Invalid token',
      'AUTH_TOKEN_INVALID'
    );
  }
  
  if (err.name === 'TokenExpiredError') {
    return ApiError.unauthorized(
      'Token expired',
      'AUTH_TOKEN_EXPIRED'
    );
  }
  
  // Handle file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return ApiError.badRequest(
      'File size limit exceeded',
      'FILE_SIZE_EXCEEDED'
    );
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return ApiError.badRequest(
      'Unexpected file upload field',
      'FILE_UPLOAD_ERROR'
    );
  }
  
  // Default to internal server error for unhandled errors
  return ApiError.internal(
    isProduction ? 'An unexpected error occurred' : err.message
  );
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Normalize the error to ensure consistent format
  const normalizedError = normalizeError(err);
  
  // Log the error
  logger.error('API Error', {
    error: {
      message: normalizedError.message,
      code: normalizedError.code,
      type: normalizedError.type,
      stack: isProduction ? undefined : err.stack,
      details: normalizedError.details
    },
    request: {
      id: req.id,
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
      user: req.user ? { id: req.user.id, role: req.user.role } : undefined
    }
  });
  
  // Send the error response
  res.status(normalizedError.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR.code)
    .json(normalizedError.toJSON());
};

/**
 * Not found handler for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.path}`));
};

module.exports = {
  errorHandler,
  notFoundHandler
};