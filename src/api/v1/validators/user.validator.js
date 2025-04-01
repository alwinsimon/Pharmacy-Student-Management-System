// src/api/v1/validators/user.validator.js
const Joi = require('joi');
const { auth: { password: passwordConfig } } = require('../../../config');
const { roles: { ROLES }, status: { USER_STATUS } } = require('../../../constants');

// Email validation schema
const emailSchema = Joi.string()
  .email()
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  });

// Password validation schema - Optional for user creation (temp password generation)
const passwordSchema = Joi.string()
  .min(passwordConfig.minLength)
  .max(72) // bcrypt limitation
  .pattern(new RegExp('[A-Z]'), 'at least one uppercase')
  .pattern(new RegExp('[a-z]'), 'at least one lowercase')
  .pattern(new RegExp('[0-9]'), 'at least one number')
  .pattern(new RegExp('[!@#$%^&*(),.?":{}|<>]'), 'at least one special character')
  .messages({
    'string.min': `Password must be at least ${passwordConfig.minLength} characters`,
    'string.max': 'Password is too long',
    'string.pattern.base': 'Password must contain {#label}'
  });

// Create user validation schema
const createUserSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema.optional(),
  firstName: Joi.string().required().messages({
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().required().messages({
    'any.required': 'Last name is required'
  }),
  middleName: Joi.string().allow('').optional(),
  role: Joi.string().valid(...Object.values(ROLES)).default(ROLES.STUDENT),
  department: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().messages({
    'string.pattern.base': 'Department must be a valid ObjectId'
  }),
  // Staff-specific fields
  staffDetails: Joi.object({
    employeeId: Joi.string().optional(),
    designation: Joi.string().optional(),
    joiningDate: Joi.date().optional(),
    qualifications: Joi.array().items(
      Joi.object({
        degree: Joi.string().required(),
        institution: Joi.string().required(),
        year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
        specialization: Joi.string().optional()
      })
    ).optional(),
    specializations: Joi.array().items(Joi.string()).optional()
  }).optional(),
  // Student-specific fields
  studentDetails: Joi.object({
    enrollmentId: Joi.string().optional(),
    enrollmentYear: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
    currentSemester: Joi.number().integer().min(1).max(12).optional(),
    academicStatus: Joi.string().valid('active', 'on_leave', 'graduated', 'dropped').default('active')
  }).optional()
});

// Update user validation schema
const updateUserSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  middleName: Joi.string().allow('').optional(),
  role: Joi.string().valid(...Object.values(ROLES)).optional(),
  department: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().messages({
    'string.pattern.base': 'Department must be a valid ObjectId'
  }),
  // Staff-specific fields
  staffDetails: Joi.object({
    employeeId: Joi.string().optional(),
    designation: Joi.string().optional(),
    joiningDate: Joi.date().optional(),
    qualifications: Joi.array().items(
      Joi.object({
        degree: Joi.string().required(),
        institution: Joi.string().required(),
        year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
        specialization: Joi.string().optional()
      })
    ).optional(),
    specializations: Joi.array().items(Joi.string()).optional()
  }).optional(),
  // Student-specific fields
  studentDetails: Joi.object({
    enrollmentId: Joi.string().optional(),
    enrollmentYear: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
    currentSemester: Joi.number().integer().min(1).max(12).optional(),
    academicStatus: Joi.string().valid('active', 'on_leave', 'graduated', 'dropped').optional()
  }).optional(),
  // Preferences
  preferences: Joi.object({
    language: Joi.string().optional(),
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      system: Joi.boolean().optional()
    }).optional(),
    theme: Joi.string().optional()
  }).optional()
});

// Update status validation schema
const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(USER_STATUS)).required().messages({
    'any.required': 'Status is required',
    'any.only': 'Status must be one of the allowed values'
  })
});

// Update permissions validation schema
const updatePermissionsSchema = Joi.object({
  permissions: Joi.array().items(Joi.string()).required().messages({
    'any.required': 'Permissions array is required'
  })
});

// Reject user validation schema
const rejectUserSchema = Joi.object({
  reason: Joi.string().required().messages({
    'any.required': 'Rejection reason is required'
  })
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  updateStatusSchema,
  updatePermissionsSchema,
  rejectUserSchema
};