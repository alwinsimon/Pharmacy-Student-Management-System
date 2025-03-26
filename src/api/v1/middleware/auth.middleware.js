// src/api/v1/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const { AuthenticationError, AuthorizationError } = require('./error.middleware');
const { logger } = require('../../../utils/logger.utils');
const cache = require('../../../utils/cache.utils');

// Role-based access control configuration
const rolePermissions = {
  admin: ['*'],
  teacher: ['read:users', 'read:documents', 'write:documents', 'read:cases', 'write:cases'],
  student: ['read:documents', 'read:cases']
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Check if token is blacklisted
    const isBlacklisted = await cache.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new AuthenticationError('Token has been revoked');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from cache or database
    const user = await cache.get(`user:${decoded.id}`);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'));
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token expired'));
      return;
    }
    next(error);
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      next(new AuthenticationError('User not authenticated'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AuthorizationError('Insufficient permissions'));
      return;
    }

    next();
  };
};

// Permission-based authorization middleware
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      next(new AuthenticationError('User not authenticated'));
      return;
    }

    const userPermissions = rolePermissions[req.user.role];
    if (!userPermissions.includes('*') && !userPermissions.includes(permission)) {
      next(new AuthorizationError('Insufficient permissions'));
      return;
    }

    next();
  };
};

// Logout middleware
const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      // Add token to blacklist
      const decoded = jwt.decode(token);
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      await cache.set(`blacklist:${token}`, true, ttl);
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  authorize,
  checkPermission,
  logout,
  rolePermissions
};