const Joi = require('joi');
const { ValidationError } = require('./error.middleware');
const { logger } = require('../../../utils/logger.utils');

// Validation schemas
const schemas = {
  // User schemas
  createUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    role: Joi.string().valid('admin', 'teacher', 'student').required()
  }),

  updateUser: Joi.object({
    email: Joi.string().email(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    role: Joi.string().valid('admin', 'teacher', 'student')
  }),

  // Auth schemas
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Document schemas
  createDocument: Joi.object({
    title: Joi.string().required(),
    description: Joi.string(),
    type: Joi.string().valid('assignment', 'study_material', 'notice').required(),
    department: Joi.string().required(),
    file: Joi.object({
      name: Joi.string().required(),
      type: Joi.string().required(),
      size: Joi.number().max(5 * 1024 * 1024).required() // 5MB max
    })
  }),

  // Case schemas
  createCase: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    type: Joi.string().valid('academic', 'disciplinary', 'financial').required(),
    priority: Joi.string().valid('low', 'medium', 'high').required(),
    assignedTo: Joi.string().required()
  })
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('Validation failed:', {
        errors,
        path: req.path,
        method: req.method
      });

      next(new ValidationError('Validation failed', errors));
      return;
    }

    next();
  };
};

// Export validation middleware for each schema
module.exports = {
  validate,
  schemas,
  validateCreateUser: validate(schemas.createUser),
  validateUpdateUser: validate(schemas.updateUser),
  validateLogin: validate(schemas.login),
  validateCreateDocument: validate(schemas.createDocument),
  validateCreateCase: validate(schemas.createCase)
}; 