// src/api/v1/controllers/auth.controller.js
const authService = require('../../../services/auth.service');
const { asyncHandler } = require('../../../utils/error.utils');
const { status: { HTTP_STATUS } } = require('../../../constants');

/**
 * Register a new user
 * @route POST /api/v1/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, middleName, ...otherUserData } = req.body;
  
  // Separate user data and profile data
  const userData = {
    email,
    password,
    ...otherUserData
  };
  
  const profileData = {
    firstName,
    lastName,
    middleName: middleName || ''
  };
  
  const user = await authService.register(userData, profileData);
  
  res.status(HTTP_STATUS.CREATED.code).json({
    success: true,
    message: 'User registered successfully. Please check your email for verification.',
    data: user
  });
});

/**
 * Login user
 * @route POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip;
  const userAgent = req.get('User-Agent');
  
  const authData = await authService.login(email, password, ip, userAgent);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Login successful',
    data: authData
  });
});

/**
 * Refresh access token
 * @route POST /api/v1/auth/refresh-token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const ip = req.ip;
  const userAgent = req.get('User-Agent');
  
  const authData = await authService.refreshToken(refreshToken, ip, userAgent);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Token refreshed successfully',
    data: authData
  });
});

/**
 * Logout user
 * @route POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const userId = req.user.id;
  
  await authService.logout(refreshToken, userId);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * Verify email
 * @route GET /api/v1/auth/verify-email/:token
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  
  const user = await authService.verifyEmail(token);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Email verified successfully',
    data: user
  });
});

/**
 * Request password reset
 * @route POST /api/v1/auth/request-password-reset
 */
const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  await authService.requestPasswordReset(email);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'If the email is registered, a password reset link has been sent'
  });
});

/**
 * Reset password
 * @route POST /api/v1/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  
  await authService.resetPassword(token, newPassword);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Password reset successful'
  });
});

/**
 * Change password
 * @route POST /api/v1/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;
  
  await authService.changePassword(userId, currentPassword, newPassword);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Password changed successfully'
  });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  changePassword
};