const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');
const { logger } = require('../../../utils/logger.utils');

// Create Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

// Default rate limit configuration
const defaultConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: {
    // Custom store implementation
    incr: async (key) => {
      const multi = redis.multi();
      multi.incr(key);
      multi.expire(key, 15 * 60); // 15 minutes
      const results = await multi.exec();
      return results[0][1];
    },
    decr: async (key) => {
      return redis.decr(key);
    },
    resetKey: async (key) => {
      return redis.del(key);
    }
  }
};

// Rate limit configurations for different routes
const routeLimits = {
  // Auth routes
  '/api/v1/auth/login': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: 'Too many login attempts, please try again later.'
  },
  '/api/v1/auth/register': {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: 'Too many registration attempts, please try again later.'
  },
  '/api/v1/auth/forgot-password': {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: 'Too many password reset attempts, please try again later.'
  },
  
  // API routes
  '/api/v1/users': {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    message: 'Too many user requests, please try again later.'
  },
  '/api/v1/documents': {
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute
    message: 'Too many document requests, please try again later.'
  },
  '/api/v1/cases': {
    windowMs: 60 * 1000, // 1 minute
    max: 15, // 15 requests per minute
    message: 'Too many case requests, please try again later.'
  }
};

// Create rate limiters for each route
const limiters = Object.entries(routeLimits).reduce((acc, [route, config]) => {
  acc[route] = rateLimit({
    ...defaultConfig,
    ...config,
    keyGenerator: (req) => {
      return `${route}:${req.ip}`;
    }
  });
  return acc;
}, {});

// Middleware to apply rate limiting based on route
const rateLimitMiddleware = (req, res, next) => {
  const route = req.path;
  const limiter = limiters[route];
  
  if (limiter) {
    return limiter(req, res, next);
  }
  
  // Apply default rate limit for unmatched routes
  return rateLimit(defaultConfig)(req, res, next);
};

module.exports = {
  rateLimitMiddleware,
  limiters
}; 