// src/api/v1/middleware/upload.middleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { nanoid } = require('nanoid');
const { app: { upload: uploadConfig } } = require('../../../config');
const { files: { ALLOWED_MIME_TYPES, FILE_SIZE_LIMITS, FILE_TYPES, UPLOAD_PATHS } } = require('../../../constants');
const { ApiError } = require('../../../errors/api.error');

// Ensure upload directories exist
Object.values(UPLOAD_PATHS).forEach(uploadPath => {
  const fullPath = path.join(uploadConfig.destination, uploadPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = UPLOAD_PATHS.TEMPORARY;
    
    // Determine path based on field name
    if (file.fieldname === 'profilePicture') {
      uploadPath = UPLOAD_PATHS.PROFILE_PICTURES;
    } else if (file.fieldname === 'document') {
      uploadPath = UPLOAD_PATHS.DOCUMENTS;
    } else if (file.fieldname === 'attachment') {
      uploadPath = UPLOAD_PATHS.CASE_ATTACHMENTS;
    }
    
    const fullPath = path.join(uploadConfig.destination, uploadPath);
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with original extension
    const fileExt = path.extname(file.originalname);
    const fileName = `${nanoid()}-${Date.now()}${fileExt}`;
    cb(null, fileName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  let allowedTypes = [];
  let maxSize = 0;
  
  // Determine allowed types and size based on field name
  if (file.fieldname === 'profilePicture') {
    allowedTypes = ALLOWED_MIME_TYPES[FILE_TYPES.IMAGE];
    maxSize = FILE_SIZE_LIMITS[FILE_TYPES.IMAGE];
  } else if (file.fieldname === 'document') {
    allowedTypes = [
      ...ALLOWED_MIME_TYPES[FILE_TYPES.DOCUMENT],
      ...ALLOWED_MIME_TYPES[FILE_TYPES.PDF],
      ...ALLOWED_MIME_TYPES[FILE_TYPES.CSV],
      ...ALLOWED_MIME_TYPES[FILE_TYPES.EXCEL]
    ];
    maxSize = FILE_SIZE_LIMITS[FILE_TYPES.DOCUMENT];
  } else if (file.fieldname === 'attachment') {
    allowedTypes = [
      ...ALLOWED_MIME_TYPES[FILE_TYPES.DOCUMENT],
      ...ALLOWED_MIME_TYPES[FILE_TYPES.PDF],
      ...ALLOWED_MIME_TYPES[FILE_TYPES.IMAGE]
    ];
    maxSize = FILE_SIZE_LIMITS[FILE_TYPES.DOCUMENT];
  } else {
    // Default to document types
    allowedTypes = ALLOWED_MIME_TYPES[FILE_TYPES.DOCUMENT];
    maxSize = FILE_SIZE_LIMITS[FILE_TYPES.DOCUMENT];
  }
  
  // Check if file type is allowed
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(ApiError.badRequest(
      'File type not allowed',
      'FILE_TYPE_NOT_ALLOWED',
      { allowedTypes }
    ), false);
  }
  
  // Check file size (multer will handle this in limits, but we store the value)
  req.maxFileSize = maxSize;
  
  cb(null, true);
};

// Configure upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSize,
    files: uploadConfig.maxFiles
  }
});

module.exports = upload;