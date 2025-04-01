// src/services/auth.service.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { nanoid } = require('nanoid');
const UserRepository = require('../repositories/user.repository');
const TokenRepository = require('../repositories/token.repository');
const { AuthError } = require('../errors/auth.error');
const { ApiError } = require('../errors/api.error');
const { roles: { ROLES, ROLE_HIERARCHY }, status: { USER_STATUS } } = require('../constants');
const { auth: authConfig } = require('../config');
const { generatePasswordHash } = require('../utils/auth.utils');
const logService = require('./log.service');
const emailService = require('./email.service');

class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
    this.tokenRepository = new TokenRepository();
  }

  /**
   * Login user with email and password
   * @param {String} email - User email
   * @param {String} password - User password
   * @param {String} ip - IP address
   * @param {String} userAgent - User agent
   * @returns {Promise<Object>} Authentication data
   */
  async login(email, password, ip, userAgent) {
    // Find user by email with password
    const user = await this.userRepository.findByEmailWithPassword(email);
    
    // Check if user exists
    if (!user) {
      throw AuthError.invalidCredentials();
    }
    
    // Check if account is locked
    if (user.isAccountLocked()) {
      throw AuthError.accountLocked('Account is locked due to multiple failed login attempts');
    }
    
    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      await user.incrementFailedLoginAttempts();
      throw AuthError.invalidCredentials();
    }
    
    // Check account status
    if (user.status === USER_STATUS.PENDING) {
      throw AuthError.notVerified();
    }
    
    if (user.status === USER_STATUS.VERIFIED) {
      throw AuthError.notApproved('Your account is waiting for approval');
    }
    
    if (user.status !== USER_STATUS.ACTIVE) {
      throw AuthError.invalidCredentials('Your account is not active');
    }
    
    // Reset failed login attempts
    await user.resetFailedLoginAttempts();
    
    // Update last login
    await user.updateLastLogin(ip);
    
    // Generate tokens
    const authTokens = await this._generateAuthTokens(user, ip, userAgent);
    
    // Log successful login
    await logService.createLog({
      user: user._id,
      action: 'login',
      entity: 'user',
      entityId: user._id,
      description: 'User logged in',
      metadata: {
        ip,
        userAgent
      }
    });
    
    return {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status
      },
      ...authTokens
    };
  }

  /**
   * Register a new user
   * @param {Object} userData - User data
   * @param {Object} profileData - Profile data
   * @returns {Promise<Object>} Created user
   */
  async register(userData, profileData) {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(userData.email, { throwIfNotFound: false });
    
    if (existingUser) {
      throw ApiError.conflict('Email is already registered', 'CONFLICT_EMAIL_EXISTS');
    }
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = new Date();
    tokenExpiration.setHours(tokenExpiration.getHours() + 24); // 24 hours
    
    // Create user with verification token
    const user = await this.userRepository.createUserWithProfile({
      ...userData,
      verificationToken: {
        token: verificationToken,
        expiresAt: tokenExpiration
      }
    }, profileData);
    
    // Send verification email
    await emailService.sendVerificationEmail(user.email, user.profile.firstName, verificationToken);
    
    // Log user registration
    await logService.createLog({
      user: user._id,
      action: 'register',
      entity: 'user',
      entityId: user._id,
      description: 'User registered'
    });
    
    return {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status
    };
  }

  /**
   * Verify user email
   * @param {String} token - Verification token
   * @returns {Promise<Object>} Updated user
   */
  async verifyEmail(token) {
    // Find user by verification token
    const user = await this.userRepository.findOne({
      'verificationToken.token': token,
      'verificationToken.expiresAt': { $gt: new Date() }
    }, { throwIfNotFound: false });
    
    if (!user) {
      throw AuthError.tokenInvalid('Verification token is invalid or expired');
    }
    
    // Update user status and verification flag
    const updatedUser = await this.userRepository.updateById(user._id, {
      isEmailVerified: true,
      status: USER_STATUS.VERIFIED,
      verificationToken: null
    });
    
    // Log email verification
    await logService.createLog({
      user: user._id,
      action: 'verify_email',
      entity: 'user',
      entityId: user._id,
      description: 'User email verified'
    });
    
    return {
      id: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status
    };
  }

  /**
   * Refresh access token
   * @param {String} refreshToken - Refresh token
   * @param {String} ip - IP address
   * @param {String} userAgent - User agent
   * @returns {Promise<Object>} New authentication tokens
   */
  async refreshToken(refreshToken, ip, userAgent) {
    try {
      // Verify refresh token
      const payload = jwt.verify(refreshToken, authConfig.jwt.refreshSecret);
      
      // Check if token is blacklisted
      const tokenDoc = await this.tokenRepository.findOne({
        token: refreshToken,
        user: payload.userId,
        type: 'refresh'
      }, { throwIfNotFound: false });
      
      if (!tokenDoc || tokenDoc.blacklisted) {
        throw AuthError.tokenInvalid('Refresh token is invalid or expired');
      }
      
      // Get user
      const user = await this.userRepository.findById(payload.userId);
      
      // Check if user is active
      if (user.status !== USER_STATUS.ACTIVE) {
        throw AuthError.invalidCredentials('Your account is not active');
      }
      
      // Blacklist current refresh token
      await this.tokenRepository.updateById(tokenDoc._id, { blacklisted: true });
      
      // Generate new tokens
      const authTokens = await this._generateAuthTokens(user, ip, userAgent);
      
      return {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          status: user.status
        },
        ...authTokens
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw AuthError.tokenInvalid('Refresh token is invalid or expired');
      }
      throw error;
    }
  }

  /**
   * Logout user
   * @param {String} refreshToken - Refresh token
   * @param {String} userId - User ID
   * @returns {Promise<Boolean>} Logout success
   */
  async logout(refreshToken, userId) {
    // Blacklist refresh token
    if (refreshToken) {
      const tokenDoc = await this.tokenRepository.findOne({
        token: refreshToken,
        user: userId,
        type: 'refresh'
      }, { throwIfNotFound: false });
      
      if (tokenDoc) {
        await this.tokenRepository.updateById(tokenDoc._id, { blacklisted: true });
      }
    }
    
    // Log logout
    await logService.createLog({
      user: userId,
      action: 'logout',
      entity: 'user',
      entityId: userId,
      description: 'User logged out'
    });
    
    return true;
  }

  /**
   * Request password reset
   * @param {String} email - User email
   * @returns {Promise<Boolean>} Request success
   */
  async requestPasswordReset(email) {
    // Find user by email
    const user = await this.userRepository.findByEmail(email, { throwIfNotFound: false });
    
    if (!user) {
      // Don't expose if email exists or not for security
      return true;
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = new Date();
    tokenExpiration.setHours(tokenExpiration.getHours() + 1); // 1 hour
    
    // Update user with reset token
    await this.userRepository.updateById(user._id, {
      passwordResetToken: {
        token: resetToken,
        expiresAt: tokenExpiration
      }
    });
    
    // Send password reset email
    await emailService.sendPasswordResetEmail(
      user.email,
      user.profile ? user.profile.firstName : 'User',
      resetToken
    );
    
    // Log password reset request
    await logService.createLog({
      user: user._id,
      action: 'request_password_reset',
      entity: 'user',
      entityId: user._id,
      description: 'User requested password reset'
    });
    
    return true;
  }

  /**
   * Reset password
   * @param {String} token - Reset token
   * @param {String} newPassword - New password
   * @returns {Promise<Boolean>} Reset success
   */
  async resetPassword(token, newPassword) {
    // Find user by reset token
    const user = await this.userRepository.findOne({
      'passwordResetToken.token': token,
      'passwordResetToken.expiresAt': { $gt: new Date() }
    }, { throwIfNotFound: false });
    
    if (!user) {
      throw AuthError.tokenInvalid('Reset token is invalid or expired');
    }
    
    // Update user password
    await this.userRepository.updateById(user._id, {
      password: newPassword,
      passwordResetToken: null
    });
    
    // Blacklist all refresh tokens for user
    await this.tokenRepository.updateMany(
      { user: user._id, type: 'refresh' },
      { blacklisted: true }
    );
    
    // Log password reset
    await logService.createLog({
      user: user._id,
      action: 'reset_password',
      entity: 'user',
      entityId: user._id,
      description: 'User reset password'
    });
    
    return true;
  }

  /**
   * Change password
   * @param {String} userId - User ID
   * @param {String} currentPassword - Current password
   * @param {String} newPassword - New password
   * @returns {Promise<Boolean>} Change success
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Find user by ID with password
    const user = await this.userRepository.findById(userId, { select: '+password' });
    
    // Validate current password
    const isPasswordValid = await user.validatePassword(currentPassword);
    
    if (!isPasswordValid) {
      throw AuthError.invalidCredentials('Current password is incorrect');
    }
    
    // Update user password
    await this.userRepository.updateById(userId, { password: newPassword });
    
    // Blacklist all refresh tokens for user except current
    await this.tokenRepository.updateMany(
      { user: userId, type: 'refresh' },
      { blacklisted: true }
    );
    
    // Log password change
    await logService.createLog({
      user: userId,
      action: 'change_password',
      entity: 'user',
      entityId: userId,
      description: 'User changed password'
    });
    
    return true;
  }

  /**
   * Check if user has required role
   * @param {String} userRole - User role
   * @param {String} requiredRole - Required role
   * @returns {Boolean} Has required role
   */
  hasRole(userRole, requiredRole) {
    const allowedRoles = ROLE_HIERARCHY[requiredRole] || [];
    return allowedRoles.includes(userRole);
  }

  /**
   * Check if user has required permission
   * @param {String} userId - User ID
   * @param {String|Array} requiredPermissions - Required permissions
   * @returns {Promise<Boolean>} Has required permission
   */
  async hasPermission(userId, requiredPermissions) {
    const user = await this.userRepository.findById(userId);
    
    // Convert to array if single permission
    const permissions = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];
    
    // Check if user has any of the required permissions
    for (const permission of permissions) {
      if (user.permissions.includes(permission)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Generate authentication tokens (access and refresh)
   * @param {Object} user - User object
   * @param {String} ip - IP address
   * @param {String} userAgent - User agent
   * @returns {Promise<Object>} Authentication tokens
   * @private
   */
  async _generateAuthTokens(user, ip, userAgent) {
    // Generate access token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      authConfig.jwt.secret,
      {
        expiresIn: authConfig.jwt.accessTokenExpiration,
        algorithm: authConfig.jwt.algorithm,
        issuer: authConfig.jwt.issuer
      }
    );
    
    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        userId: user._id,
        tokenId: nanoid()
      },
      authConfig.jwt.refreshSecret,
      {
        expiresIn: authConfig.jwt.refreshTokenExpiration,
        algorithm: authConfig.jwt.algorithm,
        issuer: authConfig.jwt.issuer
      }
    );
    
    // Calculate expiration times
    const accessTokenExpiry = new Date();
    const refreshTokenExpiry = new Date();
    
    // Parse the expiration string (e.g., '1h', '7d')
    const accessExpiryMatch = authConfig.jwt.accessTokenExpiration.match(/(\d+)([smhdw])/);
    const refreshExpiryMatch = authConfig.jwt.refreshTokenExpiration.match(/(\d+)([smhdw])/);
    
    if (accessExpiryMatch) {
      const [, value, unit] = accessExpiryMatch;
      const multiplier = unit === 's' ? 1 : 
                        unit === 'm' ? 60 : 
                        unit === 'h' ? 3600 : 
                        unit === 'd' ? 86400 : 604800; // 'w' for week
      
      accessTokenExpiry.setSeconds(accessTokenExpiry.getSeconds() + (parseInt(value) * multiplier));
    }
    
    if (refreshExpiryMatch) {
      const [, value, unit] = refreshExpiryMatch;
      const multiplier = unit === 's' ? 1 : 
                        unit === 'm' ? 60 : 
                        unit === 'h' ? 3600 : 
                        unit === 'd' ? 86400 : 604800; // 'w' for week
      
      refreshTokenExpiry.setSeconds(refreshTokenExpiry.getSeconds() + (parseInt(value) * multiplier));
    }
    
    // Store refresh token in database
    await this.tokenRepository.create({
      token: refreshToken,
      user: user._id,
      type: 'refresh',
      expiresAt: refreshTokenExpiry,
      metadata: {
        ipAddress: ip,
        userAgent,
        lastUsed: new Date()
      }
    });
    
    return {
      accessToken,
      refreshToken,
      expiresIn: Math.floor((accessTokenExpiry - new Date()) / 1000)
    };
  }
}

module.exports = new AuthService();