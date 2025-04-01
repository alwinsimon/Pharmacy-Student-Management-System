// src/utils/validation.utils.js
const { ValidationError } = require('../errors/validation.error');
const mongoose = require('mongoose');

/**
 * Validate MongoDB ObjectId
 * @param {String} id - ID to validate
 * @param {String} name - Field name for error message
 * @throws {ValidationError} If ID is invalid
 */
const objectId = (id, name = 'id') => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw ValidationError.invalidFormat(name, `Invalid ${name} format`);
  }
};

/**
 * Validate email format
 * @param {String} email - Email to validate
 * @throws {ValidationError} If email is invalid
 */
const email = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    throw ValidationError.invalidFormat('email', 'Invalid email format');
  }
};

/**
 * Validate password strength
 * @param {String} password - Password to validate
 * @throws {ValidationError} If password is too weak
 */
const passwordStrength = (password) => {
  if (!password || password.length < 8) {
    throw ValidationError.invalidFormat('password', 'Password must be at least 8 characters');
  }
  
  // Check for uppercase, lowercase, number, and special char
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    throw ValidationError.invalidFormat(
      'password',
      'Password must contain uppercase, lowercase, number, and special character'
    );
  }
};

/**
 * Validate date format
 * @param {String} dateStr - Date string to validate
 * @param {String} name - Field name for error message
 * @throws {ValidationError} If date is invalid
 */
const date = (dateStr, name = 'date') => {
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) {
    throw ValidationError.invalidFormat(name, `Invalid ${name} format`);
  }
};

module.exports = {
  objectId,
  email,
  passwordStrength,
  date
};