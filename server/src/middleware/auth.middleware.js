const passport = require('passport');

/**
 * Authenticate user using JWT
 */
const authenticate = passport.authenticate('jwt', { session: false });

/**
 * Check if user has required role
 * @param {Array} roles - Array of allowed roles
 */
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    authenticate,
    (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to access this resource',
        });
      }
      next();
    },
  ];
};

module.exports = {
  authenticate,
  authorize,
}; 