const { logger } = require('../utils/logger.utils');

class HealthService {
  /**
   * Get health check information
   * @param {Object} requestInfo - Information about the request
   * @returns {Object} Health check information
   */
  static getHealthInfo(requestInfo) {
    // Only include non-sensitive information
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      request: {
        ip: requestInfo.ip,
        method: requestInfo.method,
        path: requestInfo.path,
        userAgent: requestInfo.userAgent
      }
    };
  }

  /**
   * Log health check request
   * @param {Object} requestInfo - Information about the request
   */
  static logHealthCheck(requestInfo) {
    logger.info('Health check requested', {
      path: requestInfo.path,
      method: requestInfo.method,
      ip: requestInfo.ip,
      userAgent: requestInfo.userAgent
    });
  }

  /**
   * Log health check response
   * @param {Object} response - Health check response
   */
  static logHealthCheckResponse(response) {
    logger.info('Health check response', { response });
  }
}

module.exports = HealthService; 