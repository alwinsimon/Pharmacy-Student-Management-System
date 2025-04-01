const express = require('express');
const router = express.Router();
const logController = require('../controllers/logs.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../../../constants/roles.constants');

/**
 * @route GET /api/v1/logs
 * @desc Get activity logs with pagination
 * @access Private (Super Admin, Manager)
 */
router.get(
  '/',
  authenticate,
  authorize(ROLES.MANAGER),
  logController.getLogs
);

/**
 * @route GET /api/v1/logs/:id
 * @desc Get log by ID
 * @access Private (Super Admin, Manager)
 */
router.get(
  '/:id',
  authenticate,
  authorize(ROLES.MANAGER),
  logController.getLogById
);

/**
 * @route GET /api/v1/logs/user/:userId
 * @desc Get logs by user
 * @access Private (Super Admin, Manager)
 */
router.get(
  '/user/:userId',
  authenticate,
  authorize(ROLES.MANAGER),
  logController.getLogsByUser
);

/**
 * @route GET /api/v1/logs/entity/:entity/:entityId
 * @desc Get logs by entity
 * @access Private (Super Admin, Manager)
 */
router.get(
  '/entity/:entity/:entityId',
  authenticate,
  authorize(ROLES.MANAGER),
  logController.getLogsByEntity
);

module.exports = router;