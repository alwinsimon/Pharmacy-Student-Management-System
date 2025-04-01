// src/config/app.config.js

require('dotenv').config();

const environments = {
  development: 'development',
  test: 'test',
  production: 'production'
};

const nodeEnv = process.env.NODE_ENV || environments.development;

/**
 * Application configuration
 */
const config = {
  env: nodeEnv,
  isDevelopment: nodeEnv === environments.development,
  isTest: nodeEnv === environments.test,
  isProduction: nodeEnv === environments.production,
  
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    apiPrefix: process.env.API_PREFIX || '/api/v1',
    host: process.env.HOST || 'localhost',
    url: process.env.API_URL || 'http://localhost:3000',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3001',
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3001']
  },
  
  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  
  // Upload configuration
  upload: {
    maxFileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB default
    maxFiles: process.env.MAX_FILES || 5, // 5 files at once
    destination: process.env.UPLOAD_DESTINATION || 'src/uploads'
  }
};

// Validate critical configuration
const validateConfig = () => {
  const requiredVars = [
    'PORT',
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];
  
  const missingVars = requiredVars.filter(
    varName => process.env[varName] === undefined
  );
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

// Only validate in production to ease development
if (config.isProduction) {
  validateConfig();
}

module.exports = config;