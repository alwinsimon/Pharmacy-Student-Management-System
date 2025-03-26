// src/tests/setup.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { logger } = require('../utils/logger.utils');

let mongoServer;

// Connect to the in-memory database
const connectDB = async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    logger.info('Connected to in-memory test database');
  } catch (error) {
    logger.error('Error connecting to test database:', error);
    throw error;
  }
};

// Drop database, close the connection and stop mongod
const closeDB = async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    logger.info('Test database connection closed');
  } catch (error) {
    logger.error('Error closing test database:', error);
    throw error;
  }
};

// Clear all data in the database
const clearDB = async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
    logger.info('Test database cleared');
  } catch (error) {
    logger.error('Error clearing test database:', error);
    throw error;
  }
};

// Test utilities
const testUtils = {
  // Create test user
  createTestUser: async (User, userData = {}) => {
    const defaultUser = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'student',
      ...userData
    };

    return await User.create(defaultUser);
  },

  // Create test token
  createTestToken: (userId, role) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { id: userId, role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },

  // Mock request
  mockRequest: (data = {}) => {
    return {
      body: {},
      query: {},
      params: {},
      headers: {},
      ...data
    };
  },

  // Mock response
  mockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  },

  // Mock next function
  mockNext: () => jest.fn()
};

module.exports = {
  connectDB,
  closeDB,
  clearDB,
  testUtils
}; 