// src/config/auth.config.js
/**
 * Authentication and authorization configuration
 */
module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || 'jwt_super_secret_for_development',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'jwt_refresh_super_secret_for_development',
    accessTokenExpiration: process.env.JWT_EXPIRATION || '1h',
    refreshTokenExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    algorithm: 'HS256',
    issuer: 'pharmacy-college-ms'
  },
  
  password: {
    saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10),
    minLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    requireLowercase: true,
    maxRepeatedChars: 3
  },
  
  verification: {
    emailTokenExpiration: '24h',
    passwordResetExpiration: '1h'
  },
  
  session: {
    maxInactivityTime: parseInt(process.env.SESSION_INACTIVITY_TIMEOUT || '30', 10) * 60 * 1000, // 30 minutes by default
    maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS || '5', 10)
  }
};