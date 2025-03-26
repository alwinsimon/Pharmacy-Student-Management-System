const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departments.controller');
const { validate } = require('../middleware/validator.middleware');
const departmentValidator = require('../validators/department.validator');
const { authenticate, authorize, checkPermission } = require('../middleware/auth.middleware');
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
  authenticate,
  departmentController.getDepartments
);

/**
 * @route GET /api/v1/departments/:id
 * @desc Get department by ID
 * @access Private
 */
router.get(
  '/:id',
  authenticate,
  departmentController.getDepartmentById
);

/**
 * @route GET /api/v1/departments/code/:code
 * @desc Get department by code
 * @access Private
 */
router.get(
  '/code/:code',
  authenticate,
  departmentController.getDepartmentByCode
);

/**
 * @route POST /api/v1/departments
 * @desc Create a new department
 * @access Private (Manager)
 */
router.post(
  '/',
  authenticate,
  authorize(ROLES.MANAGER),
  checkPermission(PERMISSIONS.DEPARTMENT_CREATE),
  validate(departmentValidator.createDepartmentSchema),
  departmentController.createDepartment
);

/**
 * @route PUT /api/v1/departments/:id
 * @desc Update department
 * @access Private (Manager)
 */
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.MANAGER),
  checkPermission(PERMISSIONS.DEPARTMENT_UPDATE),
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
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
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
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  departmentController.assignDepartmentHead
);

/**
 * @route DELETE /api/v1/departments/:id
 * @desc Delete department
 * @access Private (Manager)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.MANAGER),
  checkPermission(PERMISSIONS.DEPARTMENT_DELETE),
  departmentController.deleteDepartment
);

/**
 * @route GET /api/v1/departments/:id/sub-departments
 * @desc Get sub-departments
 * @access Private
 */
router.get(
  '/:id/sub-departments',
  authenticate,
  departmentController.getSubDepartments
);

/**
 * @route POST /api/v1/departments/:id/logo
 * @desc Upload department logo
 * @access Private (Super Admin, Manager)
 */
router.post(
  '/:id/logo',
  authenticate,
  authorize(ROLES.MANAGER),
  uploadMiddleware.single('logo'),
  departmentController.uploadDepartmentLogo
);

module.exports = router;