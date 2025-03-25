// src/utils/auth.utils.js
const bcrypt = require('bcrypt');
const { auth: { password: passwordConfig } } = require('../config');

/**
 * Generate password hash
 * @param {String} password - Plain text password
 * @returns {Promise<String>} Hashed password
 */
const generatePasswordHash = async (password) => {
  const salt = await bcrypt.genSalt(passwordConfig.saltRounds);
  return bcrypt.hash(password, salt);
};

/**
 * Validate password against hash
 * @param {String} password - Plain text password
 * @param {String} hash - Hashed password
 * @returns {Promise<Boolean>} Is password valid
 */
const validatePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate a random token
 * @param {Number} length - Token length
 * @returns {String} Random token
 */
const generateToken = (length = 32) => {
  return require('crypto').randomBytes(length).toString('hex');
};

module.exports = {
  generatePasswordHash,
  validatePassword,
  generateToken
};