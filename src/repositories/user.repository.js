// src/repositories/user.repository.js
const User = require('../models/user.model');
const Profile = require('../models/profile.model');
const BaseRepository = require('./base.repository');
const { DatabaseError } = require('../errors/database.error');

/**
 * Repository for User and Profile operations
 */
class UserRepository extends BaseRepository {
  constructor() {
    super(User, 'User');
    this.profileModel = Profile;
  }

  /**
   * Find user by email
   * @param {String} email - User email
   * @param {Object} options - Query options
   * @returns {Promise<Object>} User document
   */
  async findByEmail(email, options = {}) {
    return this.findOne({ email }, options);
  }

  /**
   * Find user by email with password (for authentication)
   * @param {String} email - User email
   * @returns {Promise<Object>} User document with password
   */
  async findByEmailWithPassword(email) {
    try {
      return await User.findByEmailWithPassword(email);
    } catch (error) {
      throw DatabaseError.queryError(
        `Error finding user by email with password: ${error.message}`,
        { error, email }
      );
    }
  }

  /**
   * Create user with profile
   * @param {Object} userData - User data
   * @param {Object} profileData - Profile data
   * @returns {Promise<Object>} Created user with profile
   */
  async createUserWithProfile(userData, profileData) {
    const session = await this.model.startSession();
    
    try {
      session.startTransaction();
      
      // Create user
      const user = await this.model.create([userData], { session });
      
      // Create profile with user reference
      const profile = await this.profileModel.create([{
        ...profileData,
        user: user[0]._id
      }], { session });
      
      await session.commitTransaction();
      
      // Combine user and profile
      const result = user[0].toObject();
      result.profile = profile[0].toObject();
      
      return result;
    } catch (error) {
      await session.abortTransaction();
      
      throw DatabaseError.transactionError(
        `Error creating user with profile: ${error.message}`,
        { error, userData, profileData }
      );
    } finally {
      session.endSession();
    }
  }

  /**
   * Find user with profile
   * @param {Object} filter - User filter
   * @param {Object} options - Query options
   * @returns {Promise<Object>} User with profile
   */
  async findUserWithProfile(filter, options = {}) {
    try {
      const user = await this.findOne(filter, options);
      
      if (!user) {
        return null;
      }
      
      const profile = await this.profileModel.findOne({ user: user._id });
      
      const result = user.toObject();
      if (profile) {
        result.profile = profile.toObject();
      }
      
      return result;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      throw DatabaseError.queryError(
        `Error finding user with profile: ${error.message}`,
        { error, filter }
      );
    }
  }

  /**
   * Update user with profile
   * @param {String|ObjectId} userId - User ID
   * @param {Object} userData - User data
   * @param {Object} profileData - Profile data
   * @returns {Promise<Object>} Updated user with profile
   */
  async updateUserWithProfile(userId, userData, profileData) {
    const session = await this.model.startSession();
    
    try {
      session.startTransaction();
      
      // Update user if userData is provided
      let user;
      if (userData && Object.keys(userData).length > 0) {
        user = await this.model.findByIdAndUpdate(
          userId,
          userData,
          { new: true, runValidators: true, session }
        );
        
        if (!user) {
          throw DatabaseError.notFound('User', userId);
        }
      } else {
        user = await this.model.findById(userId, null, { session });
        
        if (!user) {
          throw DatabaseError.notFound('User', userId);
        }
      }
      
      // Update profile if profileData is provided
      let profile;
      if (profileData && Object.keys(profileData).length > 0) {
        profile = await this.profileModel.findOneAndUpdate(
          { user: userId },
          profileData,
          { new: true, runValidators: true, upsert: true, session }
        );
      } else {
        profile = await this.profileModel.findOne(
          { user: userId },
          null,
          { session }
        );
      }
      
      await session.commitTransaction();
      
      // Combine user and profile
      const result = user.toObject();
      if (profile) {
        result.profile = profile.toObject();
      }
      
      return result;
    } catch (error) {
      await session.abortTransaction();
      
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      throw DatabaseError.transactionError(
        `Error updating user with profile: ${error.message}`,
        { error, userId, userData, profileData }
      );
    } finally {
      session.endSession();
    }
  }

  /**
   * Find users by role
   * @param {String} role - User role
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Users with the specified role
   */
  async findByRole(role, options = {}) {
    return this.findAll({ role }, options);
  }

  /**
   * Find users by department
   * @param {String|ObjectId} departmentId - Department ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Users in the specified department
   */
  async findByDepartment(departmentId, options = {}) {
    return this.findAll({ department: departmentId }, options);
  }

  /**
   * Find users by role and department
   * @param {String} role - User role
   * @param {String|ObjectId} departmentId - Department ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Users with the specified role in the department
   */
  async findByRoleAndDepartment(role, departmentId, options = {}) {
    return this.findAll({ role, department: departmentId }, options);
  }

  /**
   * Update user status
   * @param {String|ObjectId} userId - User ID
   * @param {String} status - New status
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Updated user
   */
  async updateStatus(userId, status, options = {}) {
    return this.updateById(userId, { status }, options);
  }

  /**
   * Update user permissions
   * @param {String|ObjectId} userId - User ID
   * @param {Array} permissions - New permissions
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Updated user
   */
  async updatePermissions(userId, permissions, options = {}) {
    return this.updateById(userId, { permissions }, options);
  }

  /**
   * Search users
   * @param {String} query - Search query
   * @param {Object} filter - Additional filter criteria
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async search(query, filter = {}, options = {}) {
    try {
      // Get profile matches by name
      const profileMatches = await this.profileModel.find({
        $or: [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { middleName: { $regex: query, $options: 'i' } },
          { 'studentDetails.enrollmentId': { $regex: query, $options: 'i' } },
          { 'staffDetails.employeeId': { $regex: query, $options: 'i' } }
        ]
      }).select('user');
      
      const userIds = profileMatches.map(profile => profile.user);
      
      // Combine with user matches
      const combinedFilter = {
        $or: [
          { _id: { $in: userIds } },
          { email: { $regex: query, $options: 'i' } }
        ],
        ...filter
      };
      
      return this.findAll(combinedFilter, options);
    } catch (error) {
      throw DatabaseError.queryError(
        `Error searching users: ${error.message}`,
        { error, query, filter }
      );
    }
  }
}

module.exports = UserRepository;