// src/api/v1/routes/qrcodes.routes.js
const express = require('express');
const router = express.Router();
const qrcodeController = require('../controllers/qrcodes.controller');
const { validate } = require('../middleware/validator.middleware');
const qrcodeValidator = require('../validators/qrcode.validator');
const { authenticateJWT } = require('../middleware/auth.middleware');

/**
 * @route GET /api/v1/qrcodes/:code
 * @desc Access resource via QR code
 * @access Public
 */
router.get(
  '/:code',
  qrcodeController.accessViaQRCode
);

/**
 * @route GET /api/v1/qrcodes/:code/info
 * @desc Get QR code information without accessing the resource
 * @access Public
 */
router.get(
  '/:code/info',
  qrcodeController.getQRCodeInfo
);

/**
 * @route POST /api/v1/qrcodes/generate
 * @desc Generate QR code for a resource
 * @access Private
 */
router.post(
  '/generate',
  authenticateJWT,
  validate(qrcodeValidator.generateQRCodeSchema),
  qrcodeController.generateQRCode
);

/**
 * @route GET /api/v1/qrcodes/resource/:resourceType/:resourceId
 * @desc Get QR code for a specific resource
 * @access Private
 */
router.get(
  '/resource/:resourceType/:resourceId',
  authenticateJWT,
  qrcodeController.getResourceQRCode
);

module.exports = router;