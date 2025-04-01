// src/api/v1/controllers/users.controller.js
const userService = require('../../../services/user.service');
const { asyncHandler } = require('../../../utils/error.utils');
const { status: { HTTP_STATUS } } = require('../../../constants');
const { AuthError } = require('../../../errors/auth.error');

/**
 * Get all users with pagination
 * @route GET /api/v1/users
 */
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, status, department } = req.query;
  
  // Build filter
  const filter = {};
  
  if (role) {
    filter.role = role;
  }
  
  if (status) {
    filter.status = status;
  }
  
  if (department) {
    filter.department = department;
  }
  
  // Get users with pagination
  const users = await userService.getUsers(filter, {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: [
      { path: 'department', select: 'name code' },
      { path: 'approvedBy', select: 'email' }
    ]
  });
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Users retrieved successfully',
    data: users
  });
});

/**
 * Get user by ID
 * @route GET /api/v1/users/:id
 */
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Users can only access their own profile unless they are admin or manager
  if (id !== req.user.id && !['super_admin', 'manager'].includes(req.user.role)) {
    throw AuthError.insufficientPermissions(
      'You can only access your own profile'
    );
  }
  
  const user = await userService.getUserById(id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'User retrieved successfully',
    data: user
  });
});

/**
 * Create a new user
 * @route POST /api/v1/users
 */
const createUser = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, middleName, role, department, ...otherUserData } = req.body;
  
  // Separate user data and profile data
  const userData = {
    email,
    password,
    role,
    department,
    ...otherUserData
  };
  
  const profileData = {
    firstName,
    lastName,
    middleName: middleName || ''
  };
  
  // Generate temporary password if not provided
  if (!userData.password) {
    userData.password = Math.random().toString(36).slice(-10) + Math.random().toString(36).toUpperCase().slice(-2) + '!1';
    userData.tempPassword = userData.password;
  }
  
  const user = await userService.createUser(userData, profileData, req.user.id);
  
  res.status(HTTP_STATUS.CREATED.code).json({
    success: true,
    message: 'User created successfully',
    data: user
  });
});

/**
 * Update user
 * @route PUT /api/v1/users/:id
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, middleName, role, department, ...otherUserData } = req.body;
  
  // Users can only update their own profile unless they are admin or manager
  const isAdminOrManager = ['super_admin', 'manager'].includes(req.user.role);
  
  if (id !== req.user.id && !isAdminOrManager) {
    throw AuthError.insufficientPermissions(
      'You can only update your own profile'
    );
  }
  
  // Only admin/manager can update role and department
  let userData = { ...otherUserData };
  
  if (isAdminOrManager) {
    if (role) userData.role = role;
    if (department) userData.department = department;
  }
  
  // Profile data
  const profileData = {};
  if (firstName) profileData.firstName = firstName;
  if (lastName) profileData.lastName = lastName;
  if (middleName !== undefined) profileData.middleName = middleName;
  
  const user = await userService.updateUser(id, userData, profileData, req.user.id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
});

/**
 * Update user status
 * @route PATCH /api/v1/users/:id/status
 */
const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const user = await userService.updateUserStatus(id, status, req.user.id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'User status updated successfully',
    data: user
  });
});

/**
 * Update user permissions
 * @route PATCH /api/v1/users/:id/permissions
 */
const updatePermissions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body;
  
  const user = await userService.updateUserPermissions(id, permissions, req.user.id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'User permissions updated successfully',
    data: user
  });
});

/**
 * Delete user
 * @route DELETE /api/v1/users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  await userService.deleteUser(id, req.user.id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'User deleted successfully'
  });
});

/**
 * Get users by role
 * @route GET /api/v1/users/role/:role
 */
const getUsersByRole = asyncHandler(async (req, res) => {
  const { role } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  const users = await userService.getUsersByRole(role, {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: { path: 'department', select: 'name code' }
  });
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Users retrieved successfully',
    data: users
  });
});

/**
 * Get users by department
 * @route GET /api/v1/users/department/:departmentId
 */
const getUsersByDepartment = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;
  const { role, page = 1, limit = 10 } = req.query;
  
  let users;
  
  if (role) {
    users = await userService.getUsersByRoleAndDepartment(role, departmentId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } else {
    users = await userService.getUsersByDepartment(departmentId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });
  }
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Users retrieved successfully',
    data: users
  });
});

/**
 * Approve user registration
 * @route POST /api/v1/users/:id/approve
 */
const approveUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = await userService.approveUser(id, req.user.id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'User approved successfully',
    data: user
  });
});

/**
 * Reject user registration
 * @route POST /api/v1/users/:id/reject
 */
const rejectUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  await userService.rejectUser(id, req.user.id, reason);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'User rejected successfully'
  });
});

/**
 * Upload profile picture
 * @route POST /api/v1/users/:id/profile-picture
 */
const uploadProfilePicture = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Users can only update their own profile picture unless they are admin
  if (id !== req.user.id && req.user.role !== 'super_admin') {
    throw AuthError.insufficientPermissions(
      'You can only update your own profile picture'
    );
  }
  
  if (!req.file) {
    throw new Error('Profile picture is required');
  }
  
  const profileData = {
    profilePicture: {
      filename: req.file.filename,
      path: req.file.path,
      contentType: req.file.mimetype,
      uploadedAt: new Date()
    }
  };
  
  const user = await userService.updateUser(id, {}, profileData, req.user.id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Profile picture uploaded successfully',
    data: {
      profilePicture: user.profile.profilePicture
    }
  });
});

/**
 * Search users
 * @route GET /api/v1/users/search
 */
const searchUsers = asyncHandler(async (req, res) => {
  const { q, role, department, page = 1, limit = 10 } = req.query;
  
  if (!q) {
    throw new Error('Search query is required');
  }
  
  // Build filter
  const filter = {};
  
  if (role) {
    filter.role = role;
  }
  
  if (department) {
    filter.department = department;
  }
  
  const users = await userService.searchUsers(q, filter, {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: { path: 'department', select: 'name code' }
  });
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Search results',
    data: users
  });
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateStatus,
  updatePermissions,
  deleteUser,
  getUsersByRole,
  getUsersByDepartment,
  approveUser,
  rejectUser,
  uploadProfilePicture,
  searchUsers
};