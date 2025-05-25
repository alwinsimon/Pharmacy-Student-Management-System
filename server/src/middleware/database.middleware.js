const mongoose = require('mongoose');

/**
 * Middleware to check if database is connected
 * Returns appropriate error if database operations are attempted without connection
 */
const requireDatabase = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database not available. Please check your MongoDB connection.',
      error: 'SERVICE_UNAVAILABLE'
    });
  }
  next();
};

/**
 * Middleware to handle database operations gracefully
 * Allows endpoints to work even without database in development
 */
const optionalDatabase = (req, res, next) => {
  req.dbAvailable = mongoose.connection.readyState === 1;
  next();
};

module.exports = {
  requireDatabase,
  optionalDatabase,
}; 