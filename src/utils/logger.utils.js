// src/utils/logger.utils.js
const winston = require('winston');
const path = require('path');
const fs = require('fs');
const { logger: loggerConfig } = require('../config');

// Ensure log directory exists
const logDir = loggerConfig.directory;
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  loggerConfig.format === 'json'
    ? winston.format.json()
    : winston.format.printf(({ level, message, timestamp, ...meta }) => {
        const metaString = Object.keys(meta).length
          ? `\n${JSON.stringify(meta, null, 2)}`
          : '';
        return `${timestamp} [${level.toUpperCase()}]: ${message}${metaString}`;
      })
);

// Create logger
const logger = winston.createLogger({
  level: loggerConfig.level,
  format: logFormat,
  defaultMeta: { service: 'pharmacy-college-ms' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    
    // Error log file
    new winston.transports.File({
      filename: path.join(logDir, loggerConfig.files.error),
      level: 'error',
      maxsize: loggerConfig.rotation.maxSize,
      maxFiles: loggerConfig.rotation.maxFiles
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join(logDir, loggerConfig.files.combined),
      maxsize: loggerConfig.rotation.maxSize,
      maxFiles: loggerConfig.rotation.maxFiles
    }),
    
    // Access log file
    new winston.transports.File({
      filename: path.join(logDir, loggerConfig.files.access),
      level: 'http',
      maxsize: loggerConfig.rotation.maxSize,
      maxFiles: loggerConfig.rotation.maxFiles
    })
  ]
});

module.exports = { logger };