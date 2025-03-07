const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departments.controller');
const { validate } = require('../middleware/validator.middleware');
const departmentValidator = require('../validators/department.validator');
const { authenticateJWT, authorizeRole, authorizePermission } = require('../middleware/auth.middleware');
const { PERMISSIONS } = require('../../../constants/permissions.constants');
const { ROLES } = require('../../../constants/roles.constants');
const uploadMiddleware = require('../middleware/upload.middleware');

/**
 * @route GET /api/v1/departments
 * @desc Get all departments with pagination
 * @access Private
 */
router.get(
  '/',
  authenticateJWT,
  departmentController.getDepartments
);

/**
 * @route GET /api/v1/departments/:id
 * @desc Get department by ID
 * @access Private
 */
router.get(
  '/:id',
  authenticateJWT,
  departmentController.getDepartmentById
);

/**
 * @route GET /api/v1/departments/code/:code
 * @desc Get department by code
 * @access Private
 */
router.get(
  '/code/:code',
  authenticateJWT,
  departmentController.getDepartmentByCode
);

/**
 * @route POST /api/v1/departments
 * @desc Create a new department
 * @access Private (Super Admin)
 */
router.post(
  '/',
  authenticateJWT,
  authorizeRole(ROLES.SUPER_ADMIN),
  validate(departmentValidator.createDepartmentSchema),
  departmentController.createDepartment
);

/**
 * @route PUT /api/v1/departments/:id
 * @desc Update department
 * @access Private (Super Admin, Manager)
 */
router.put(
  '/:id',
  authenticateJWT,
  authorizeRole(ROLES.MANAGER),
  validate(departmentValidator.updateDepartmentSchema),
  departmentController.updateDepartment
);

/**
 * @route PATCH /api/v1/departments/:id/status
 * @desc Update department status
 * @access Private (Super Admin)
 */
router.patch(
  '/:id/status',
  authenticateJWT,
  authorizeRole(ROLES.SUPER_ADMIN),
  validate(departmentValidator.updateStatusSchema),
  departmentController.updateDepartmentStatus
);

/**
 * @route POST /api/v1/departments/:id/head/:userId
 * @desc Assign department head
 * @access Private (Super Admin)
 */
router.post(
  '/:id/head/:userId',
  authenticateJWT,
  authorizeRole(ROLES.SUPER_ADMIN),
  departmentController.assignDepartmentHead
);

/**
 * @route DELETE /api/v1/departments/:id
 * @desc Delete department
 * @access Private (Super Admin)
 */
router.delete(
  '/:id',
  authenticateJWT,
  authorizeRole(ROLES.SUPER_ADMIN),
  departmentController.deleteDepartment
);

/**
 * @route GET /api/v1/departments/:id/sub-departments
 * @desc Get sub-departments
 * @access Private
 */
router.get(
  '/:id/sub-departments',
  authenticateJWT,
  departmentController.getSubDepartments
);

/**
 * @route POST /api/v1/departments/:id/logo
 * @desc Upload department logo
 * @access Private (Super Admin, Manager)
 */
router.post(
  '/:id/logo',
  authenticateJWT,
  authorizeRole(ROLES.MANAGER),
  uploadMiddleware.single('logo'),
  departmentController.uploadDepartmentLogo
);

module.exports = router;