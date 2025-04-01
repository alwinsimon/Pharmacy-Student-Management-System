// src/constants/error.constants.js
/**
 * Error constants for the application
 */
const ERROR_TYPES = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  CONFLICT: 'CONFLICT_ERROR',
  DATABASE: 'DATABASE_ERROR',
  SERVICE: 'SERVICE_ERROR',
  EXTERNAL: 'EXTERNAL_SERVICE_ERROR',
  FILE: 'FILE_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Error codes with default messages
// Format: ERROR_DOMAIN_SPECIFIC_ERROR
const ERROR_CODES = {
  // Validation errors
  VALIDATION_INVALID_INPUT: {
    code: 'VALIDATION_INVALID_INPUT',
    message: 'Invalid input data provided',
    type: ERROR_TYPES.VALIDATION
  },
  VALIDATION_REQUIRED_FIELD: {
    code: 'VALIDATION_REQUIRED_FIELD',
    message: 'Required field is missing',
    type: ERROR_TYPES.VALIDATION
  },
  VALIDATION_INVALID_FORMAT: {
    code: 'VALIDATION_INVALID_FORMAT',
    message: 'Field format is invalid',
    type: ERROR_TYPES.VALIDATION
  },
  
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: {
    code: 'AUTH_INVALID_CREDENTIALS',
    message: 'Invalid email or password',
    type: ERROR_TYPES.AUTHENTICATION
  },
  AUTH_ACCOUNT_LOCKED: {
    code: 'AUTH_ACCOUNT_LOCKED',
    message: 'Account is locked due to multiple failed attempts',
    type: ERROR_TYPES.AUTHENTICATION
  },
  AUTH_TOKEN_EXPIRED: {
    code: 'AUTH_TOKEN_EXPIRED',
    message: 'Authentication token has expired',
    type: ERROR_TYPES.AUTHENTICATION
  },
  AUTH_TOKEN_INVALID: {
    code: 'AUTH_TOKEN_INVALID',
    message: 'Authentication token is invalid',
    type: ERROR_TYPES.AUTHENTICATION
  },
  AUTH_USER_NOT_VERIFIED: {
    code: 'AUTH_USER_NOT_VERIFIED',
    message: 'User account is not verified',
    type: ERROR_TYPES.AUTHENTICATION
  },
  AUTH_USER_NOT_APPROVED: {
    code: 'AUTH_USER_NOT_APPROVED',
    message: 'User account is pending approval',
    type: ERROR_TYPES.AUTHENTICATION
  },
  
  // Authorization errors
  AUTH_INSUFFICIENT_PERMISSIONS: {
    code: 'AUTH_INSUFFICIENT_PERMISSIONS',
    message: 'User does not have sufficient permissions',
    type: ERROR_TYPES.AUTHORIZATION
  },
  AUTH_RESOURCE_ACCESS_DENIED: {
    code: 'AUTH_RESOURCE_ACCESS_DENIED',
    message: 'Access to the requested resource is denied',
    type: ERROR_TYPES.AUTHORIZATION
  },
  
  // Not found errors
  NOT_FOUND_RESOURCE: {
    code: 'NOT_FOUND_RESOURCE',
    message: 'The requested resource was not found',
    type: ERROR_TYPES.NOT_FOUND
  },
  NOT_FOUND_USER: {
    code: 'NOT_FOUND_USER',
    message: 'User not found',
    type: ERROR_TYPES.NOT_FOUND
  },
  NOT_FOUND_CASE: {
    code: 'NOT_FOUND_CASE',
    message: 'Clinical case not found',
    type: ERROR_TYPES.NOT_FOUND
  },
  NOT_FOUND_DOCUMENT: {
    code: 'NOT_FOUND_DOCUMENT',
    message: 'Document not found',
    type: ERROR_TYPES.NOT_FOUND
  },
  
  // Conflict errors
  CONFLICT_EMAIL_EXISTS: {
    code: 'CONFLICT_EMAIL_EXISTS',
    message: 'Email is already registered',
    type: ERROR_TYPES.CONFLICT
  },
  CONFLICT_USERNAME_EXISTS: {
    code: 'CONFLICT_USERNAME_EXISTS',
    message: 'Username is already taken',
    type: ERROR_TYPES.CONFLICT
  },
  CONFLICT_RESOURCE_EXISTS: {
    code: 'CONFLICT_RESOURCE_EXISTS',
    message: 'Resource already exists',
    type: ERROR_TYPES.CONFLICT
  },
  
  // Database errors
  DATABASE_CONNECTION_ERROR: {
    code: 'DATABASE_CONNECTION_ERROR',
    message: 'Error connecting to database',
    type: ERROR_TYPES.DATABASE
  },
  DATABASE_QUERY_ERROR: {
    code: 'DATABASE_QUERY_ERROR',
    message: 'Database query failed',
    type: ERROR_TYPES.DATABASE
  },
  DATABASE_TRANSACTION_ERROR: {
    code: 'DATABASE_TRANSACTION_ERROR',
    message: 'Database transaction failed',
    type: ERROR_TYPES.DATABASE
  },
  
  // File errors
  FILE_UPLOAD_ERROR: {
    code: 'FILE_UPLOAD_ERROR',
    message: 'File upload failed',
    type: ERROR_TYPES.FILE
  },
  FILE_SIZE_EXCEEDED: {
    code: 'FILE_SIZE_EXCEEDED',
    message: 'File size exceeded the maximum limit',
    type: ERROR_TYPES.FILE
  },
  FILE_TYPE_NOT_ALLOWED: {
    code: 'FILE_TYPE_NOT_ALLOWED',
    message: 'File type is not allowed',
    type: ERROR_TYPES.FILE
  },
  
  // External service errors
  EXTERNAL_SERVICE_ERROR: {
    code: 'EXTERNAL_SERVICE_ERROR',
    message: 'External service error',
    type: ERROR_TYPES.EXTERNAL
  },
  EMAIL_SERVICE_ERROR: {
    code: 'EMAIL_SERVICE_ERROR',
    message: 'Email service error',
    type: ERROR_TYPES.EXTERNAL
  },
  
  // Unknown errors
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
    type: ERROR_TYPES.UNKNOWN
  }
};

module.exports = {
  ERROR_TYPES,
  ERROR_CODES
};