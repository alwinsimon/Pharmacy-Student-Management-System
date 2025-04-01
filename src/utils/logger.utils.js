// src/utils/logger.utils.js
const winston = require('winston');
const path = require('path');
const { format } = winston;

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Add colors to winston
winston.addColors(colors);

// Create the format for logs
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  format.colorize({ all: true }),
  format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format: logFormat,
  transports: [
    // Write all logs to console
    new winston.transports.Console(),
    // Write all logs error (and above) to error.log
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Create a stream object for Morgan
const stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Create a custom format for HTTP requests
const httpFormat = format.combine(
  format.timestamp(),
  format.json()
);

// Create a separate logger for HTTP requests
const httpLogger = winston.createLogger({
  level: 'http',
  format: httpFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/http.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

module.exports = {
  logger,
  stream,
  httpLogger
};