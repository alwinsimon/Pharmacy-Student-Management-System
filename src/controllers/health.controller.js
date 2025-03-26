/**
 * Health check endpoint
 * @route GET /health
 */
const healthCheck = (req, res) => {
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

  return res.status(200).json(response);
};

module.exports = {
  healthCheck
}; 