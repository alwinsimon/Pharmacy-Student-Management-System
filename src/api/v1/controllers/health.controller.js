const HealthService = require('../../../services/health.service');
const { asyncHandler } = require('../../../utils/error.utils');

/**
 * Health check endpoint
 * @route GET /health
 */
const healthCheck = asyncHandler(async (req, res) => {
  // Extract request information
  const requestInfo = {
    ip: req.ip,
    method: req.method,
    path: req.path,
    userAgent: req.get('user-agent')
  };

  // Log the request
  HealthService.logHealthCheck(requestInfo);

  // Get health check information
  const response = HealthService.getHealthInfo(requestInfo);

  // Log the response
  HealthService.logHealthCheckResponse(response);

  // Send response
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify(response));
});

module.exports = {
  healthCheck
}; 