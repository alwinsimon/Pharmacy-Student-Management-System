// src/api/v1/middleware/validator.middleware.js
const { ValidationError } = require('../../../errors/validation.error');

/**
 * Middleware to validate request data against a Joi schema
 * @param {Object} schema - Joi validation schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      throw ValidationError.invalidInput(
        'Validation failed',
        { fields: details }
      );
    }
    
    next();
  };
};

module.exports = {
  validate
};