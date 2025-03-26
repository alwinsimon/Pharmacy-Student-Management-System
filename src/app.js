// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const { logger, stream, httpLogger } = require('./utils/logger.utils');
const { rateLimitMiddleware } = require('./api/v1/middleware/rate-limit.middleware');
const { errorHandler, notFoundHandler } = require('./api/v1/middleware/error.middleware');
const { authenticate } = require('./api/v1/middleware/auth.middleware');
const routes = require('./api/v1/routes');
const { healthCheck } = require('./controllers/health.controller');

// Create Express app
const app = express();

// Basic middleware for all routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request ID middleware
app.use((req, res, next) => {
  req.id = req.get('X-Request-ID') || require('nanoid').nanoid();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Response time middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}ms`);
  });
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  // Log detailed request information
  const requestInfo = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    params: req.params,
    headers: req.headers,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    body: req.body,
    cookies: req.cookies,
    protocol: req.protocol,
    host: req.get('host'),
    originalUrl: req.originalUrl,
    secure: req.secure,
    xhr: req.xhr,
    contentType: req.get('content-type'),
    accept: req.get('accept'),
    referer: req.get('referer'),
    requestId: req.id
  };

  // Log request details
  httpLogger.info('Incoming Request', requestInfo);

  // Log response on finish
  res.on('finish', () => {
    const responseInfo = {
      timestamp: new Date().toISOString(),
      requestId: req.id,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      responseTime: res.getHeader('X-Response-Time'),
      contentLength: res.getHeader('content-length'),
      contentType: res.getHeader('content-type'),
      ip: req.ip
    };

    httpLogger.info('Outgoing Response', responseInfo);
  });

  next();
});

// Morgan logging
app.use(morgan('combined', { stream }));

// Health check route (before security middleware)
app.get('/health', healthCheck);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin']
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Request-ID'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Compression middleware
app.use(compression({
  level: 6,
  threshold: 100 * 1000 // Only compress responses larger than 100kb
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Rate limiting
app.use(rateLimitMiddleware);

// API routes
app.use('/api/v1', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Don't exit the process for uncaught exceptions
  // This allows the application to continue running
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process for unhandled rejections
  // This allows the application to continue running
});

module.exports = app;