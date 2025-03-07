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

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;



















// .env.example
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1
HOST=localhost
API_URL=http://localhost:3000
CLIENT_URL=http://localhost:3001
CORS_ORIGINS=http://localhost:3001

# Database
DATABASE_URL=mongodb://localhost:27017/pharmacy_college_ms
DB_MAX_POOL_SIZE=10
DB_CONNECT_TIMEOUT=30000
DB_SOCKET_TIMEOUT=30000

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d
SALT_ROUNDS=10
SESSION_INACTIVITY_TIMEOUT=30
MAX_CONCURRENT_SESSIONS=5

# File Upload
MAX_FILE_SIZE=5242880
MAX_FILES=5
UPLOAD_DESTINATION=src/uploads

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_DIRECTORY=src/logs

# Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM_NAME=Pharmacy College MS
EMAIL_FROM_ADDRESS=noreply@pharmacy-college-ms.example.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100