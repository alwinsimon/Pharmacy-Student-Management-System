// src/constants/file.constants.js
/**
 * File handling constants
 */
const FILE_TYPES = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  PDF: 'pdf',
  CSV: 'csv',
  EXCEL: 'excel'
};

// Allowed MIME types for each file type
const ALLOWED_MIME_TYPES = {
  [FILE_TYPES.IMAGE]: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ],
  [FILE_TYPES.DOCUMENT]: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf'
  ],
  [FILE_TYPES.PDF]: [
    'application/pdf'
  ],
  [FILE_TYPES.CSV]: [
    'text/csv',
    'application/csv'
  ],
  [FILE_TYPES.EXCEL]: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
};

// File size limits in bytes
const FILE_SIZE_LIMITS = {
  [FILE_TYPES.IMAGE]: 2 * 1024 * 1024,     // 2MB
  [FILE_TYPES.DOCUMENT]: 5 * 1024 * 1024,  // 5MB
  [FILE_TYPES.PDF]: 10 * 1024 * 1024,      // 10MB
  [FILE_TYPES.CSV]: 5 * 1024 * 1024,       // 5MB
  [FILE_TYPES.EXCEL]: 5 * 1024 * 1024      // 5MB
};

// Upload destination paths
const UPLOAD_PATHS = {
  PROFILE_PICTURES: 'profiles',
  DOCUMENTS: 'documents',
  CASE_ATTACHMENTS: 'cases/attachments',
  TEMPORARY: 'temp'
};

module.exports = {
  FILE_TYPES,
  ALLOWED_MIME_TYPES,
  FILE_SIZE_LIMITS,
  UPLOAD_PATHS
};