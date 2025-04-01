// src/api/v1/routes/dashboard.routes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../../../constants/roles.constants');

/**
 * @route GET /api/v1/dashboard/system
 * @desc Get system-wide statistics
 * @access Private (Super Admin)
 */
router.get(
  '/system',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  dashboardController.getSystemStats
);

/**
 * @route GET /api/v1/dashboard/department/:departmentId
 * @desc Get department statistics
 * @access Private (Manager, Super Admin)
 */
router.get(
  '/department/:departmentId',
  authenticate,
  authorize(ROLES.MANAGER),
  dashboardController.getDepartmentStats
);

/**
 * @route GET /api/v1/dashboard/staff
 * @desc Get staff dashboard statistics
 * @access Private (Staff)
 */
router.get(
  '/staff',
  authenticate,
  authorize(ROLES.STAFF),
  dashboardController.getStaffStats
);

/**
 * @route GET /api/v1/dashboard/student
 * @desc Get student dashboard statistics
 * @access Private (Student)
 */
router.get(
  '/student',
  authenticate,
  authorize(ROLES.STUDENT),
  dashboardController.getStudentStats
);

/**
 * @route GET /api/v1/dashboard/analytics/case-completion
 * @desc Get case completion statistics
 * @access Private (Staff, Manager, Super Admin)
 */
router.get(
  '/analytics/case-completion',
  authenticate,
  authorize(ROLES.STAFF),
  dashboardController.getCaseCompletionStats
);

/**
 * @route GET /api/v1/dashboard/analytics/document-usage
 * @desc Get document usage statistics
 * @access Private (Staff, Manager, Super Admin)
 */
router.get(
  '/analytics/document-usage',
  authenticate,
  authorize(ROLES.STAFF),
  dashboardController.getDocumentUsageStats
);

module.exports = router;