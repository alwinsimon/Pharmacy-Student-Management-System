// src/repositories/log.repository.js
const ActivityLog = require('../models/log.model');
const BaseRepository = require('./base.repository');

/**
 * Repository for ActivityLog operations
 */
class LogRepository extends BaseRepository {
  constructor() {
    super(ActivityLog, 'ActivityLog');
  }

  /**
   * Find logs by user
   * @param {String|ObjectId} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} User logs
   */
  async findByUser(userId, options = {}) {
    return this.findAll({ user: userId }, options);
  }

  /**
   * Find logs by entity
   * @param {String} entity - Entity type
   * @param {String|ObjectId} entityId - Entity ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Entity logs
   */
  async findByEntity(entity, entityId, options = {}) {
    return this.findAll({ entity, entityId }, options);
  }

  /**
   * Find logs by action
   * @param {String} action - Action
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Action logs
   */
  async findByAction(action, options = {}) {
    return this.findAll({ action }, options);
  }

  /**
   * Find logs by time range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Logs in time range
   */
  async findByTimeRange(startDate, endDate, options = {}) {
    return this.findAll({
      timestamp: {
        $gte: startDate,
        $lte: endDate
      }
    }, options);
  }

  /**
   * Create activity log entry
   * @param {Object} logData - Log data
   * @returns {Promise<Object>} Created log
   */
  async createLog(logData) {
    return this.create({
      ...logData,
      timestamp: new Date()
    });
  }
}

module.exports = LogRepository;