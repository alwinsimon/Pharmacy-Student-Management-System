// src/api/v1/validators/document.validator.js
const Joi = require('joi');
const { status: { DOCUMENT_STATUS } } = require('../../../constants');

// Create document validation schema
const createDocumentSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'Title is required'
  }),
  description: Joi.string().optional(),
  category: Joi.string().required().messages({
    'any.required': 'Category is required'
  }),
  subcategory: Joi.string().optional(),
  metadata: Joi.object({
    department: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().messages({
      'string.pattern.base': 'Department must be a valid ObjectId'
    }),
    tags: Joi.array().items(Joi.string()).optional(),
    expiryDate: Joi.date().optional(),
    isTemplate: Joi.boolean().optional()
  }).optional(),
  accessControl: Joi.object({
    visibility: Joi.string().valid('public', 'private', 'restricted').optional(),
    allowedRoles: Joi.array().items(Joi.string()).optional(),
    allowedUsers: Joi.array().items(
      Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
        'string.pattern.base': 'User ID must be a valid ObjectId'
      })
    ).optional(),
    allowedDepartments: Joi.array().items(
      Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
        'string.pattern.base': 'Department must be a valid ObjectId'
      })
    ).optional()
  }).optional()
});

// Update document validation schema
const updateDocumentSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  category: Joi.string().optional(),
  subcategory: Joi.string().optional(),
  metadata: Joi.object({
    tags: Joi.array().items(Joi.string()).optional(),
    expiryDate: Joi.date().optional(),
    isTemplate: Joi.boolean().optional()
  }).optional(),
  accessControl: Joi.object({
    visibility: Joi.string().valid('public', 'private', 'restricted').optional(),
    allowedRoles: Joi.array().items(Joi.string()).optional(),
    allowedUsers: Joi.array().items(
      Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
        'string.pattern.base': 'User ID must be a valid ObjectId'
      })
    ).optional(),
    allowedDepartments: Joi.array().items(
      Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
        'string.pattern.base': 'Department must be a valid ObjectId'
      })
    ).optional()
  }).optional()
});

// Update file validation schema
const updateFileSchema = Joi.object({
  changeNotes: Joi.string().optional()
});

// Update status validation schema
const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(DOCUMENT_STATUS)).required().messages({
    'any.required': 'Status is required',
    'any.only': 'Status must be one of the allowed values'
  })
});

// Share document validation schema
const shareDocumentSchema = Joi.object({
  visibility: Joi.string().valid('public', 'private', 'restricted').optional(),
  userIds: Joi.array().items(
    Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
      'string.pattern.base': 'User ID must be a valid ObjectId'
    })
  ).optional(),
  roles: Joi.array().items(Joi.string()).optional(),
  departments: Joi.array().items(
    Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
      'string.pattern.base': 'Department must be a valid ObjectId'
    })
  ).optional()
}).or('visibility', 'userIds', 'roles', 'departments');

module.exports = {
  createDocumentSchema,
  updateDocumentSchema,
  updateFileSchema,
  updateStatusSchema,
  shareDocumentSchema
};