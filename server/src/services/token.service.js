const jwt = require('jsonwebtoken');

class TokenService {
  /**
   * Generate JWT access token
   * @param {Object} user - User object
   * @returns {String} JWT token
   */
  static generateAccessToken(user) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  /**
   * Generate JWT refresh token
   * @param {Object} user - User object
   * @returns {String} Refresh token
   */
  static generateRefreshToken(user) {
    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new Error('REFRESH_TOKEN_SECRET environment variable is required');
    }
    
    return jwt.sign(
      {
        id: user._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
  }

  /**
   * Generate both access and refresh tokens
   * @param {Object} user - User object
   * @returns {Object} Object containing accessToken and refreshToken
   */
  static generateTokens(user) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  /**
   * Verify JWT token
   * @param {String} token - JWT token to verify
   * @param {String} secret - Secret to verify against
   * @returns {Object} Decoded token payload
   */
  static verifyToken(token, secret) {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Verify access token
   * @param {String} token - Access token to verify
   * @returns {Object} Decoded token payload
   */
  static verifyAccessToken(token) {
    return this.verifyToken(token, process.env.JWT_SECRET);
  }

  /**
   * Verify refresh token
   * @param {String} token - Refresh token to verify
   * @returns {Object} Decoded token payload
   */
  static verifyRefreshToken(token) {
    return this.verifyToken(token, process.env.REFRESH_TOKEN_SECRET);
  }
}

module.exports = TokenService; 