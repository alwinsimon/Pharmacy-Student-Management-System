// src/config/database.config.js
/**
 * Database configuration
 */
module.exports = {
  url: process.env.DATABASE_URL || 'mongodb://localhost:27017/pharmacy_college_ms',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10', 10),
    connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT || '30000', 10),
    socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT || '30000', 10)
  },
  collections: {
    users: 'users',
    profiles: 'profiles',
    departments: 'departments',
    cases: 'cases',
    documents: 'documents',
    logs: 'activity_logs',
    notifications: 'notifications',
    tokens: 'tokens'
  }
};