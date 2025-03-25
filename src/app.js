// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { app: appConfig, logger: loggerConfig } = require('./config');
const { logger } = require('./utils/logger.utils');
const { swaggerUi, swaggerDocs } = require('./config/swagger.config');
const { errorHandler, notFoundHandler } = require('./api/v1/middleware/error.middleware');
const routes = require('./api/v1/routes');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: appConfig.server.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: appConfig.rateLimit.windowMs,
  max: appConfig.rateLimit.max,
  message: appConfig.rateLimit.message,
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to all requests
app.use(limiter);

// Request logging
app.use(morgan(loggerConfig.http.format, {
  stream: {
    write: (message) => logger.http(message.trim())
  }
}));

// Request ID middleware
app.use((req, res, next) => {
  req.id = req.get('X-Request-ID') || require('nanoid').nanoid();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use(appConfig.server.apiPrefix, routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});

// API Docs endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }'
}));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;