const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger.utils');

/**
 * @route GET /health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/', (req, res) => {
  // Log request info
  const requestInfo = {
    ip: req.ip,
    method: req.method,
    path: req.path,
    userAgent: req.get('user-agent')
  };
  
  logger.info('Health check requested', requestInfo);

  // Prepare response
  const response = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    request: {
      ip: requestInfo.ip,
      method: requestInfo.method,
      path: requestInfo.path,
      userAgent: requestInfo.userAgent
    }
  };

  // Log response info
  logger.info('Health check response', { response });

  // Send single response
  return res.status(200).json(response);
});

module.exports = router; 