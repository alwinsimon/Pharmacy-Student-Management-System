// src/errors/database.error.js
const ApiError = require('./api.error');
const { status: { HTTP_STATUS } } = require('../constants');

/**
 * Database operation error class
 */
class DatabaseError extends ApiError {
  constructor(message, errorCode = 'DATABASE_QUERY_ERROR', details = {}) {
    super(
      errorCode,
      message || 'Database operation failed',
      HTTP_STATUS.INTERNAL_SERVER_ERROR.code,
      details
    );
  }
  
  static connectionError(message, details = {}) {
    return new DatabaseError(
      message || 'Database connection error',
      'DATABASE_CONNECTION_ERROR',
      details
    );
  }
  
  static queryError(message, details = {}) {
    return new DatabaseError(
      message || 'Database query failed',
      'DATABASE_QUERY_ERROR',
      details
    );
  }
  
  static transactionError(message, details = {}) {
    return new DatabaseError(
      message || 'Database transaction failed',
      'DATABASE_TRANSACTION_ERROR',
      details
    );
  }
  
  static notFound(entity, id, details = {}) {
    return ApiError.notFound(
      `${entity} with id ${id} not found`,
      `NOT_FOUND_${entity.toUpperCase()}`,
      details
    );
  }
}

module.exports = DatabaseError;