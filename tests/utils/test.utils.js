const jwt = require("jsonwebtoken");
const { ROLES } = require("../../src/constants/roles.constants");
const User = require("../../src/models/user.model");
const { generatePasswordHash } = require("../../src/utils/auth.utils");

/**
 * Create a test user
 * @param {Object} userData - User data
 * @returns {Promise<User>} Created user
 */
const createTestUser = async (userData = {}) => {
  const defaultData = {
    email: "test@example.com",
    password: await generatePasswordHash("Test@123"),
    role: ROLES.STUDENT,
    status: "active",
    isEmailVerified: true,
  };

  const user = new User({ ...defaultData, ...userData });
  return await user.save();
};

/**
 * Generate test JWT token
 * @param {Object} payload - Token payload
 * @returns {String} JWT token
 */
const generateTestToken = (payload = {}) => {
  const defaultPayload = {
    id: "test-user-id",
    email: "test@example.com",
    role: ROLES.STUDENT,
  };

  return jwt.sign({ ...defaultPayload, ...payload }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

/**
 * Create test request object
 * @param {Object} data - Request data
 * @returns {Object} Request object
 */
const createTestRequest = (data = {}) => {
  return {
    body: {},
    query: {},
    params: {},
    headers: {},
    user: null,
    ...data,
  };
};

/**
 * Create test response object
 * @returns {Object} Response object
 */
const createTestResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return res;
};

/**
 * Create test next function
 * @returns {Function} Next function
 */
const createTestNext = () => {
  return jest.fn();
};

module.exports = {
  createTestUser,
  generateTestToken,
  createTestRequest,
  createTestResponse,
  createTestNext,
};
