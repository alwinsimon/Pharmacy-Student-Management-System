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

// src/api/v1/controllers/dashboard.controller.js
const dashboardService = require('../../../services/dashboard.service');
const { asyncHandler } = require('../../../utils/error.utils');
const { status: { HTTP_STATUS } } = require('../../../constants');
const { objectId } = require('../../../utils/validation.utils');

/**
 * Get system-wide statistics
 * @route GET /api/v1/dashboard/system
 */
const getSystemStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getSystemStats();
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'System statistics retrieved successfully',
    data: stats
  });
});

/**
 * Get department statistics
 * @route GET /api/v1/dashboard/department/:departmentId
 */
const getDepartmentStats = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;
  objectId(departmentId);
  
  const stats = await dashboardService.getDepartmentStats(departmentId);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Department statistics retrieved successfully',
    data: stats
  });
});

/**
 * Get staff dashboard statistics
 * @route GET /api/v1/dashboard/staff
 */
const getStaffStats = asyncHandler(async (req, res) => {
  const staffId = req.user.id;
  
  const stats = await dashboardService.getStaffStats(staffId);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Staff statistics retrieved successfully',
    data: stats
  });
});

/**
 * Get student dashboard statistics
 * @route GET /api/v1/dashboard/student
 */
const getStudentStats = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  
  const stats = await dashboardService.getStudentStats(studentId);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Student statistics retrieved successfully',
    data: stats
  });
});

/**
 * Get case completion statistics
 * @route GET /api/v1/dashboard/analytics/case-completion
 */
const getCaseCompletionStats = asyncHandler(async (req, res) => {
  const { departmentId } = req.query;
  
  // If department ID is provided, validate it
  if (departmentId) {
    objectId(departmentId);
  }
  
  const stats = await dashboardService.getCaseCompletionStats(departmentId);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Case completion statistics retrieved successfully',
    data: stats
  });
});

/**
 * Get document usage statistics
 * @route GET /api/v1/dashboard/analytics/document-usage
 */
const getDocumentUsageStats = asyncHandler(async (req, res) => {
  const { departmentId } = req.query;
  
  // If department ID is provided, validate it
  if (departmentId) {
    objectId(departmentId);
  }
  
  const stats = await dashboardService.getDocumentUsageStats(departmentId);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Document usage statistics retrieved successfully',
    data: stats
  });
});

module.exports = {
  getSystemStats,
  getDepartmentStats,
  getStaffStats,
  getStudentStats,
  getCaseCompletionStats,
  getDocumentUsageStats
};