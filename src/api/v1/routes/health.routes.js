// src/api/v1/routes/health.routes.js
const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');

/**
 * @route GET /health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/', healthController.healthCheck);

module.exports = router; 