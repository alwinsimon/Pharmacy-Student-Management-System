// src/api/v1/validators/auth.validator.js
const Joi = require('joi');
const { auth: { password: passwordConfig } } = require('../../../config');

// Password validation schema
const passwordSchema = Joi.string()
  .min(passwordConfig.minLength)
  .max(72) // bcrypt limitation
  .pattern(new RegExp('[A-Z]'), 'at least one uppercase')
  .pattern(new RegExp('[a-z]'), 'at least one lowercase')
  .pattern(new RegExp('[0-9]'), 'at least one number')
  .pattern(new RegExp('[!@#$%^&*(),.?":{}|<>]'), 'at least one special character')
  .required()
  .messages({
    'string.min': `Password must be at least ${passwordConfig.minLength} characters`,
    'string.max': 'Password is too long',
    'string.pattern.base': 'Password must contain {#label}',
    'any.required': 'Password is required'
  });

// Email validation schema
const emailSchema = Joi.string()
  .email()
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  });

// Register validation schema
const registerSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: Joi.string().required().messages({
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().required().messages({
    'any.required': 'Last name is required'
  }),
  middleName: Joi.string().allow('').optional(),
  role: Joi.string().valid('student', 'staff').default('student')
});

// Login validation schema
const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

// Refresh token validation schema
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required'
  })
});

// Logout validation schema
const logoutSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required'
  })
});

// Request password reset validation schema
const requestPasswordResetSchema = Joi.object({
  email: emailSchema
});

// Reset password validation schema
const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required'
  }),
  newPassword: passwordSchema
});

// Change password validation schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  newPassword: passwordSchema
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  changePasswordSchema
};