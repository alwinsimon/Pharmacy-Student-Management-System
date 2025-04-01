// src/api/v1/routes/users.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const { validate } = require('../middleware/validator.middleware');
const userValidator = require('../validators/user.validator');
const { authenticate, authorize, checkPermission } = require('../middleware/auth.middleware');
const { PERMISSIONS } = require('../../../constants/permissions.constants');
const { ROLES } = require('../../../constants/roles.constants');
const uploadMiddleware = require('../middleware/upload.middleware');

/**
 * @route GET /api/v1/users
 * @desc Get all users with pagination
 * @access Private (Super Admin, Manager)
 */
router.get(
  '/',
  authenticate,
  authorize(ROLES.MANAGER),
  userController.getUsers
);

/**
 * @route GET /api/v1/users/:id
 * @desc Get user by ID
 * @access Private
 */
router.get(
  '/:id',
  authenticate,
  userController.getUserById
);

/**
 * @route POST /api/v1/users
 * @desc Create a new user
 * @access Private (Super Admin, Manager)
 */
router.post(
  '/',
  authenticate,
  authorize(ROLES.MANAGER),
  checkPermission(PERMISSIONS.USER_CREATE),
  validate(userValidator.createUserSchema),
  userController.createUser
);

/**
 * @route PUT /api/v1/users/:id
 * @desc Update user
 * @access Private
 */
router.put(
  '/:id',
  authenticate,
  validate(userValidator.updateUserSchema),
  userController.updateUser
);

/**
 * @route PATCH /api/v1/users/:id/status
 * @desc Update user status
 * @access Private (Super Admin, Manager)
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize(ROLES.MANAGER),
  checkPermission(PERMISSIONS.USER_UPDATE),
  validate(userValidator.updateStatusSchema),
  userController.updateStatus
);

/**
 * @route PATCH /api/v1/users/:id/permissions
 * @desc Update user permissions
 * @access Private (Super Admin)
 */
router.patch(
  '/:id/permissions',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  validate(userValidator.updatePermissionsSchema),
  userController.updatePermissions
);

/**
 * @route DELETE /api/v1/users/:id
 * @desc Delete user
 * @access Private (Super Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  checkPermission(PERMISSIONS.USER_DELETE),
  userController.deleteUser
);

/**
 * @route GET /api/v1/users/role/:role
 * @desc Get users by role
 * @access Private (Super Admin, Manager)
 */
router.get(
  '/role/:role',
  authenticate,
  authorize(ROLES.MANAGER),
  userController.getUsersByRole
);

/**
 * @route GET /api/v1/users/department/:departmentId
 * @desc Get users by department
 * @access Private (Super Admin, Manager)
 */
router.get(
  '/department/:departmentId',
  authenticate,
  authorize(ROLES.MANAGER),
  userController.getUsersByDepartment
);

/**
 * @route POST /api/v1/users/:id/approve
 * @desc Approve user registration
 * @access Private (Super Admin, Manager)
 */
router.post(
  '/:id/approve',
  authenticate,
  authorize(ROLES.MANAGER),
  checkPermission(PERMISSIONS.USER_APPROVE),
  userController.approveUser
);

/**
 * @route POST /api/v1/users/:id/reject
 * @desc Reject user registration
 * @access Private (Super Admin, Manager)
 */
router.post(
  '/:id/reject',
  authenticate,
  authorize(ROLES.MANAGER),
  checkPermission(PERMISSIONS.USER_APPROVE),
  validate(userValidator.rejectUserSchema),
  userController.rejectUser
);

/**
 * @route POST /api/v1/users/:id/profile-picture
 * @desc Upload profile picture
 * @access Private
 */
router.post(
  '/:id/profile-picture',
  authenticate,
  uploadMiddleware.single('profilePicture'),
  userController.uploadProfilePicture
);

/**
 * @route GET /api/v1/users/search
 * @desc Search users
 * @access Private (Super Admin, Manager)
 */
router.get(
  '/search',
  authenticate,
  authorize(ROLES.MANAGER),
  userController.searchUsers
);

module.exports = router;