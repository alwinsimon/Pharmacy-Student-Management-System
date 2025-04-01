// src/api/v1/validators/qrcode.validator.js
const Joi = require('joi');

// Generate QR code validation schema
const generateQRCodeSchema = Joi.object({
  resource: Joi.string().required().messages({
    'any.required': 'Resource path is required'
  }),
  label: Joi.string().required().messages({
    'any.required': 'Resource label is required'
  })
});

module.exports = {
  generateQRCodeSchema
};