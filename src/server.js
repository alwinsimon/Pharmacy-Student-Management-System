// src/server.js
const mongoose = require('mongoose');
const app = require('./app');
const { app: appConfig, database: dbConfig } = require('./config');
const { logger } = require('./utils/logger.utils');

/**
 * Connect to MongoDB
 */
const connectToDatabase = async () => {
  try {
    await mongoose.connect(dbConfig.url, dbConfig.options);
    logger.info(`Connected to MongoDB at ${dbConfig.url.split('@').pop()}`);
  } catch (error) {
    logger.error('Failed to connect to MongoDB', { error: error.message });
    process.exit(1);
  }
};

/**
 * Start Express server
 */
const startServer = () => {
  const server = app.listen(appConfig.server.port, () => {
    logger.info(`Server running at http://${appConfig.server.host}:${appConfig.server.port}`);
    logger.info(`API available at ${appConfig.server.apiPrefix}`);
    logger.info(`Environment: ${appConfig.env}`);
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`Port ${appConfig.server.port} is already in use`);
    } else {
      logger.error('Server error', { error: error.message });
    }
    process.exit(1);
  });

  // Handle unhandled rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
      reason: reason.message || reason,
      stack: reason.stack || 'No stack trace',
      promise
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  });

  // Handle SIGTERM signal
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully');
    server.close(() => {
      logger.info('Process terminated');
      mongoose.connection.close(false, () => {
        logger.info('MongoDB connection closed');
        process.exit(0);
      });
    });
  });

  return server;
};

/**
 * Initialize application
 */
const initialize = async () => {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Start server
    return startServer();
  } catch (error) {
    logger.error('Failed to initialize application', { error: error.message });
    process.exit(1);
  }
};

// Start the application if this file is run directly
if (require.main === module) {
  initialize();
}

module.exports = { initialize };