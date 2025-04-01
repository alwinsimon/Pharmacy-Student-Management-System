// src/errors/base.error.js
/**
 * Base application error class
 * All custom errors should extend this class
 */
class BaseError extends Error {
  constructor(message, code, type, statusCode, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // Preserves stack trace in modern engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  toJSON() {
    return {
      error: {
        code: this.code,
        type: this.type,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp
      }
    };
  }
}

module.exports = BaseError;
