/**
 * Health check endpoint
 * @route GET /health
 */
const healthCheck = (req, res) => {
  // Calculate response time
  const start = Date.now();
  const duration = Date.now() - start;
  res.setHeader('X-Response-Time', `${duration}ms`);

  // Prepare response
  const response = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    request: {
      ip: req.ip,
      method: req.method,
      path: req.path,
      userAgent: req.get('user-agent')
    }
  };

  // Send response
  res.status(200).json(response);
};

module.exports = {
  healthCheck
}; 