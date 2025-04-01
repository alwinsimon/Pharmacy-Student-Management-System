// src/errors/validation.error.js
const ApiError = require('./api.error');
const { status: { HTTP_STATUS } } = require('../constants');

/**
 * Validation error class
 */
class ValidationError extends ApiError {
  constructor(message, errorCode = 'VALIDATION_INVALID_INPUT', details = {}) {
    super(
      errorCode,
      message || 'Validation error',
      HTTP_STATUS.UNPROCESSABLE_ENTITY.code,
      details
    );
  }
  
  static invalidInput(message, details = {}) {
    return new ValidationError(
      message || 'Invalid input data',
      'VALIDATION_INVALID_INPUT',
      details
    );
  }
  
  static requiredField(field, message, details = {}) {
    return new ValidationError(
      message || `${field} is required`,
      'VALIDATION_REQUIRED_FIELD',
      { ...details, field }
    );
  }
  
  static invalidFormat(field, message, details = {}) {
    return new ValidationError(
      message || `${field} format is invalid`,
      'VALIDATION_INVALID_FORMAT',
      { ...details, field }
    );
  }
  
  static fromJoi(joiError) {
    const details = joiError.details.map(detail => ({
      field: detail.path.join('.'),
      type: detail.type,
      message: detail.message
    }));
    
    return new ValidationError(
      'Validation failed',
      'VALIDATION_INVALID_INPUT',
      { fields: details }
    );
  }
}

module.exports = ValidationError;