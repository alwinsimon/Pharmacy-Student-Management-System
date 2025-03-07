// src/api/v1/routes/dashboard.routes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticateJWT, authorizeRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../../../constants/roles.constants');

/**
 * @route GET /api/v1/dashboard/system
 * @desc Get system-wide statistics
 * @access Private (Super Admin)
 */
router.get(
  '/system',
  authenticateJWT,
  authorizeRole(ROLES.SUPER_ADMIN),
  dashboardController.getSystemStats
);

/**
 * @route GET /api/v1/dashboard/department/:departmentId
 * @desc Get department statistics
 * @access Private (Manager, Super Admin)
 */
router.get(
  '/department/:departmentId',
  authenticateJWT,
  authorizeRole(ROLES.MANAGER),
  dashboardController.getDepartmentStats
);

/**
 * @route GET /api/v1/dashboard/staff
 * @desc Get staff dashboard statistics
 * @access Private (Staff)
 */
router.get(
  '/staff',
  authenticateJWT,
  authorizeRole(ROLES.STAFF),
  dashboardController.getStaffStats
);

/**
 * @route GET /api/v1/dashboard/student
 * @desc Get student dashboard statistics
 * @access Private (Student)
 */
router.get(
  '/student',
  authenticateJWT,
  authorizeRole(ROLES.STUDENT),
  dashboardController.getStudentStats
);

/**
 * @route GET /api/v1/dashboard/analytics/case-completion
 * @desc Get case completion statistics
 * @access Private (Staff, Manager, Super Admin)
 */
router.get(
  '/analytics/case-completion',
  authenticateJWT,
  authorizeRole(ROLES.STAFF),
  dashboardController.getCaseCompletionStats
);

/**
 * @route GET /api/v1/dashboard/analytics/document-usage
 * @desc Get document usage statistics
 * @access Private (Staff, Manager, Super Admin)
 */
router.get(
  '/analytics/document-usage',
  authenticateJWT,
  authorizeRole(ROLES.STAFF),
  dashboardController.getDocumentUsageStats
);

module.exports = router;