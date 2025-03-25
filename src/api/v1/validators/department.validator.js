const Joi = require('joi');
const { status: { DEPARTMENT_STATUS } } = require('../../../constants');

// Create department validation schema
const createDepartmentSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Department name is required'
  }),
  code: Joi.string().required().messages({
    'any.required': 'Department code is required'
  }),
  description: Joi.string().optional(),
  parentDepartment: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().messages({
    'string.pattern.base': 'Parent department must be a valid ObjectId'
  }),
  head: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().messages({
    'string.pattern.base': 'Department head must be a valid ObjectId'
  }),
  contact: Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional()
  }).optional()
});

// Update department validation schema
const updateDepartmentSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  parentDepartment: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().messages({
    'string.pattern.base': 'Parent department must be a valid ObjectId'
  }),
  head: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().messages({
    'string.pattern.base': 'Department head must be a valid ObjectId'
  }),
  contact: Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional()
  }).optional(),
  metadata: Joi.object().optional()
});

// Update status validation schema
const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(DEPARTMENT_STATUS)).required().messages({
    'any.required': 'Status is required',
    'any.only': 'Status must be one of the allowed values'
  })
});

module.exports = {
  createDepartmentSchema,
  updateDepartmentSchema,
  updateStatusSchema
};