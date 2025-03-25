// src/services/user.service.js
const UserRepository = require('../repositories/user.repository');
const AuthService = require('./auth.service');
const { ApiError } = require('../errors/api.error');
const { ValidationError } = require('../errors/validation.error');
const { status: { USER_STATUS }, roles: { ROLES, ROLE_HIERARCHY }, permissions: { ROLE_PERMISSIONS } } = require('../constants');
const { objectId } = require('../utils/validation.utils');
const logService = require('./log.service');
const emailService = require('./email.service');

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Get user by ID
   * @param {String} userId - User ID
   * @param {Boolean} includeProfile - Include profile data
   * @returns {Promise<Object>} User data
   */
  async getUserById(userId, includeProfile = true) {
    objectId(userId);
    
    if (includeProfile) {
      return this.userRepository.findUserWithProfile({ _id: userId });
    }
    
    return this.userRepository.findById(userId);
  }

  /**
   * Get user by email
   * @param {String} email - User email
   * @param {Boolean} includeProfile - Include profile data
   * @returns {Promise<Object>} User data
   */
  async getUserByEmail(email, includeProfile = true) {
    if (!email) {
      throw ValidationError.requiredField('email');
    }
    
    if (includeProfile) {
      return this.userRepository.findUserWithProfile({ email });
    }
    
    return this.userRepository.findByEmail(email);
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {Object} profileData - Profile data
   * @param {String} createdById - ID of user creating the account
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData, profileData, createdById) {
    // Default to student role if not specified
    if (!userData.role) {
      userData.role = ROLES.STUDENT;
    }
    
    // Verify email is not already registered
    const existingUser = await this.userRepository.findByEmail(
      userData.email, 
      { throwIfNotFound: false }
    );
    
    if (existingUser) {
      throw ApiError.conflict(
        'Email is already registered', 
        'CONFLICT_EMAIL_EXISTS'
      );
    }
    
    // Add default permissions based on role
    userData.permissions = ROLE_PERMISSIONS[userData.role] || [];
    
    // If created by admin, set as active and verified
    if (createdById) {
      userData.status = USER_STATUS.ACTIVE;
      userData.isEmailVerified = true;
      userData.approvedBy = createdById;
      userData.approvedAt = new Date();
    }
    
    // Create user with profile
    const user = await this.userRepository.createUserWithProfile(userData, profileData);
    
    // If created by admin, send welcome email with temporary password
    if (createdById) {
      await emailService.sendWelcomeEmail(
        user.email,
        profileData.firstName,
        userData.tempPassword || 'Your temporary password'
      );
      
      // Log user creation
      await logService.createLog({
        user: createdById,
        action: 'create',
        entity: 'user',
        entityId: user._id,
        description: `User created by admin with role ${userData.role}`
      });
    }
    
    return {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
      profile: user.profile
    };
  }

  /**
   * Update user
   * @param {String} userId - User ID
   * @param {Object} userData - User data
   * @param {Object} profileData - Profile data
   * @param {String} updatedById - ID of user performing the update
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, userData = {}, profileData = {}, updatedById) {
    objectId(userId);
    
    // Get the current user data for change tracking
    const currentUser = await this.userRepository.findUserWithProfile({ _id: userId });
    
    // Update user and profile
    const updatedUser = await this.userRepository.updateUserWithProfile(
      userId,
      userData,
      profileData
    );
    
    // Track changes for audit logging
    const changes = [];
    
    // Track user changes
    if (userData && Object.keys(userData).length > 0) {
      for (const [key, value] of Object.entries(userData)) {
        if (currentUser[key] !== value) {
          changes.push({
            field: key,
            oldValue: currentUser[key],
            newValue: value
          });
        }
      }
    }
    
    // Track profile changes
    if (profileData && Object.keys(profileData).length > 0 && currentUser.profile) {
      for (const [key, value] of Object.entries(profileData)) {
        if (currentUser.profile[key] !== value) {
          changes.push({
            field: `profile.${key}`,
            oldValue: currentUser.profile[key],
            newValue: value
          });
        }
      }
    }
    
    // Log user update if changes were made
    if (changes.length > 0) {
      await logService.createLog({
        user: updatedById || userId,
        action: 'update',
        entity: 'user',
        entityId: userId,
        description: 'User updated',
        details: {
          changes
        }
      });
    }
    
    return updatedUser;
  }

  /**
   * Update user status
   * @param {String} userId - User ID
   * @param {String} status - New status
   * @param {String} updatedById - ID of user performing the update
   * @returns {Promise<Object>} Updated user
   */
  async updateUserStatus(userId, status, updatedById) {
    objectId(userId);
    
    if (!Object.values(USER_STATUS).includes(status)) {
      throw ValidationError.invalidInput(`Invalid status: ${status}`);
    }
    
    // Get current status for change tracking
    const currentUser = await this.userRepository.findById(userId);
    const oldStatus = currentUser.status;
    
    // Update status
    const updatedUser = await this.userRepository.updateStatus(userId, status);
    
    // If status changed to ACTIVE, set approval info
    if (status === USER_STATUS.ACTIVE && oldStatus !== USER_STATUS.ACTIVE) {
      await this.userRepository.updateById(userId, {
        approvedBy: updatedById,
        approvedAt: new Date()
      });
      
      // Send approval notification
      await emailService.sendAccountApprovedEmail(
        updatedUser.email,
        updatedUser.profile ? updatedUser.profile.firstName : 'User'
      );
    }
    
    // Log status change
    await logService.createLog({
      user: updatedById,
      action: 'update_status',
      entity: 'user',
      entityId: userId,
      description: `User status changed from ${oldStatus} to ${status}`,
      details: {
        changes: [
          {
            field: 'status',
            oldValue: oldStatus,
            newValue: status
          }
        ]
      }
    });
    
    return updatedUser;
  }

  /**
   * Update user permissions
   * @param {String} userId - User ID
   * @param {Array} permissions - New permissions
   * @param {String} updatedById - ID of user performing the update
   * @returns {Promise<Object>} Updated user
   */
  async updateUserPermissions(userId, permissions, updatedById) {
    objectId(userId);
    
    if (!Array.isArray(permissions)) {
      throw ValidationError.invalidInput('Permissions must be an array');
    }
    
    // Get current permissions for change tracking
    const currentUser = await this.userRepository.findById(userId);
    const oldPermissions = currentUser.permissions || [];
    
    // Update permissions
    const updatedUser = await this.userRepository.updatePermissions(userId, permissions);
    
    // Log permissions change
    await logService.createLog({
      user: updatedById,
      action: 'update_permissions',
      entity: 'user',
      entityId: userId,
      description: 'User permissions updated',
      details: {
        changes: [
          {
            field: 'permissions',
            oldValue: oldPermissions,
            newValue: permissions
          }
        ]
      }
    });
    
    return updatedUser;
  }

  /**
   * Delete user
   * @param {String} userId - User ID
   * @param {String} deletedById - ID of user performing the delete
   * @returns {Promise<Boolean>} Delete success
   */
  async deleteUser(userId, deletedById) {
    objectId(userId);
    
    // Soft delete user
    await this.userRepository.deleteById(userId, {
      softDelete: true,
      deletedBy: deletedById
    });
    
    // Log user deletion
    await logService.createLog({
      user: deletedById,
      action: 'delete',
      entity: 'user',
      entityId: userId,
      description: 'User deleted'
    });
    
    return true;
  }

  /**
   * Get users with pagination
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated users
   */
  async getUsers(filter = {}, options = {}) {
    return this.userRepository.paginate(filter, options);
  }

  /**
   * Get users by role
   * @param {String} role - User role
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Users with role
   */
  async getUsersByRole(role, options = {}) {
    if (!Object.values(ROLES).includes(role)) {
      throw ValidationError.invalidInput(`Invalid role: ${role}`);
    }
    
    return this.userRepository.findByRole(role, options);
  }

  /**
   * Get users by department
   * @param {String} departmentId - Department ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Users in department
   */
  async getUsersByDepartment(departmentId, options = {}) {
    objectId(departmentId);
    
    return this.userRepository.findByDepartment(departmentId, options);
  }

  /**
   * Get users by role and department
   * @param {String} role - User role
   * @param {String} departmentId - Department ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Users with role in department
   */
  async getUsersByRoleAndDepartment(role, departmentId, options = {}) {
    if (!Object.values(ROLES).includes(role)) {
      throw ValidationError.invalidInput(`Invalid role: ${role}`);
    }
    
    objectId(departmentId);
    
    return this.userRepository.findByRoleAndDepartment(role, departmentId, options);
  }

  /**
   * Search users
   * @param {String} query - Search query
   * @param {Object} filter - Additional filter
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async searchUsers(query, filter = {}, options = {}) {
    if (!query || query.trim().length < 2) {
      throw ValidationError.invalidInput('Search query must be at least 2 characters');
    }
    
    return this.userRepository.search(query, filter, options);
  }

  /**
   * Approve user registration
   * @param {String} userId - User ID
   * @param {String} approvedById - ID of user approving
   * @returns {Promise<Object>} Approved user
   */
  async approveUser(userId, approvedById) {
    objectId(userId);
    objectId(approvedById);
    
    // Get current user status
    const currentUser = await this.userRepository.findById(userId);
    
    if (currentUser.status !== USER_STATUS.VERIFIED) {
      throw ApiError.badRequest(
        'User is not in verification state',
        'VALIDATION_INVALID_STATUS'
      );
    }
    
    // Update user status
    const updatedUser = await this.userRepository.updateById(userId, {
      status: USER_STATUS.ACTIVE,
      approvedBy: approvedById,
      approvedAt: new Date()
    });
    
    // Send approval notification
    await emailService.sendAccountApprovedEmail(
      updatedUser.email,
      updatedUser.profile ? updatedUser.profile.firstName : 'User'
    );
    
    // Log user approval
    await logService.createLog({
      user: approvedById,
      action: 'approve',
      entity: 'user',
      entityId: userId,
      description: 'User approved'
    });
    
    return updatedUser;
  }

  /**
   * Reject user registration
   * @param {String} userId - User ID
   * @param {String} rejectedById - ID of user rejecting
   * @param {String} reason - Rejection reason
   * @returns {Promise<Boolean>} Rejection success
   */
  async rejectUser(userId, rejectedById, reason) {
    objectId(userId);
    objectId(rejectedById);
    
    // Get current user status
    const currentUser = await this.userRepository.findUserWithProfile({ _id: userId });
    
    if (currentUser.status !== USER_STATUS.VERIFIED) {
      throw ApiError.badRequest(
        'User is not in verification state',
        'VALIDATION_INVALID_STATUS'
      );
    }
    
    // Update user status
    await this.userRepository.deleteById(userId, {
      softDelete: true,
      deletedBy: rejectedById
    });
    
    // Send rejection notification
    await emailService.sendAccountRejectedEmail(
      currentUser.email,
      currentUser.profile ? currentUser.profile.firstName : 'User',
      reason
    );
    
    // Log user rejection
    await logService.createLog({
      user: rejectedById,
      action: 'reject',
      entity: 'user',
      entityId: userId,
      description: 'User registration rejected',
      details: { reason }
    });
    
    return true;
  }
}

module.exports = new UserService();