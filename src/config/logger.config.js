// src/config/logger.config.js
/**
 * Logging configuration
 */
module.exports = {
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.LOG_FORMAT || 'json',
  directory: process.env.LOG_DIRECTORY || 'src/logs',
  
  // Log file names
  files: {
    error: 'error.log',
    combined: 'combined.log',
    access: 'access.log'
  },
  
  // Log rotation configuration
  rotation: {
    maxSize: '20m', // Rotate when file reaches 20MB
    maxFiles: '14d' // Keep logs for 14 days
  },
  
  // HTTP logging configuration
  http: {
    format: ':remote-addr [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms'
  }
};