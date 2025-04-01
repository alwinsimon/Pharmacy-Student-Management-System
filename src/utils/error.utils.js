// src/utils/error.utils.js
const { logger } = require('./logger.utils');

/**
 * Async handler for route handlers to catch errors
 * Eliminates the need for try/catch blocks in controllers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Create a controlled error with additional details for debugging
 */
const createError = (message, originalError, context = {}) => {
  const error = new Error(message);
  error.originalError = originalError;
  error.context = context;
  
  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, createError);
  }
  
  return error;
};

/**
 * Log an error with context
 */
const logError = (error, context = {}) => {
  logger.error(error.message, {
    stack: error.stack,
    originalError: error.originalError,
    context: { ...error.context, ...context }
  });
};

module.exports = {
  asyncHandler,
  createError,
  logError
};