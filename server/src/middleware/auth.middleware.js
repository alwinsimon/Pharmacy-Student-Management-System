const passport = require('passport');
const jwt = require('jsonwebtoken');

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
          message: 'Forbidden: You do not have permission to access this resource',
        });
      }
      next();
    },
  ];
};

/**
 * Generate JWT token
 * @param {Object} user - User object
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

/**
 * Generate refresh token
 * @param {Object} user - User object
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = {
  authenticate,
  authorize,
  generateToken,
  generateRefreshToken,
}; 