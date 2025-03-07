const Token = require('../models/token.model');
const BaseRepository = require('./base.repository');
const { DatabaseError } = require('../errors/database.error');

/**
 * Repository for Token operations
 */
class TokenRepository extends BaseRepository {
  constructor() {
    super(Token, 'Token');
  }

  /**
   * Find token by token string
   * @param {String} token - Token string
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Token document
   */
  async findByToken(token, options = {}) {
    return this.findOne({ token }, options);
  }

  /**
   * Find tokens by user
   * @param {String} userId - User ID
   * @param {String} type - Token type
   * @param {Object} options - Query options
   * @returns {Promise<Array>} User tokens
   */
  async findByUser(userId, type, options = {}) {
    const filter = { user: userId };
    
    if (type) {
      filter.type = type;
    }
    
    return this.findAll(filter, options);
  }

  /**
   * Blacklist token
   * @param {String} token - Token string
   * @returns {Promise<Object>} Updated token
   */
  async blacklistToken(token) {
    const tokenDoc = await this.findOne({ token }, { throwIfNotFound: false });
    
    if (!tokenDoc) {
      return null;
    }
    
    return this.updateById(tokenDoc._id, { blacklisted: true });
  }

  /**
   * Blacklist all tokens for user
   * @param {String} userId - User ID
   * @param {String} type - Token type
   * @returns {Promise<Object>} Update result
   */
  async blacklistAllUserTokens(userId, type = 'refresh') {
    return this.updateMany(
      { user: userId, type },
      { blacklisted: true }
    );
  }

  /**
   * Clean up expired tokens
   * @returns {Promise<Number>} Number of deleted tokens
   */
  async cleanupExpiredTokens() {
    try {
      const result = await this.model.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
      return result.deletedCount;
    } catch (error) {
      throw DatabaseError.queryError(
        `Error cleaning up expired tokens: ${error.message}`,
        { error }
      );
    }
  }
}

// Export the class instead of an instance
module.exports = TokenRepository;