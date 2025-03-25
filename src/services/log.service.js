// src/services/log.service.js
const LogRepository = require('../repositories/log.repository');
const { objectId } = require('../utils/validation.utils');
const { logger } = require('../utils/logger.utils');

class LogService {
  constructor() {
    this.logRepository = new LogRepository();
  }

  /**
   * Create activity log
   * @param {Object} logData - Log data
   * @returns {Promise<Object>} Created log
   */
  async createLog(logData) {
    // Ensure required fields
    if (!logData.action) {
      logger.warn('Activity log missing action field', { logData });
      throw new Error('Action is required for activity log');
    }
    
    if (!logData.entity) {
      logger.warn('Activity log missing entity field', { logData });
      throw new Error('Entity is required for activity log');
    }
    
    if (!logData.description) {
      logger.warn('Activity log missing description field', { logData });
      throw new Error('Description is required for activity log');
    }
    
    try {
      return await this.logRepository.createLog(logData);
    } catch (error) {
      // Still log to system even if DB fails
      logger.error('Failed to save activity log', {
        error: error.message,
        logData
      });
      
      // Re-throw for handling
      throw error;
    }
  }

  /**
   * Get log by ID
   * @param {String} logId - Log ID
   * @returns {Promise<Object>} Log data
   */
  async getLogById(logId) {
    objectId(logId);
    
    return this.logRepository.findById(logId, {
      populate: { path: 'user', select: 'email role' }
    });
  }

  /**
   * Get logs by user
   * @param {String} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} User logs
   */
  async getLogsByUser(userId, options = {}) {
    objectId(userId);
    
    return this.logRepository.findByUser(userId, options);
  }

  /**
   * Get logs by entity
   * @param {String} entity - Entity type
   * @param {String} entityId - Entity ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Entity logs
   */
  async getLogsByEntity(entity, entityId, options = {}) {
    if (!entity) {
      throw new Error('Entity is required');
    }
    
    objectId(entityId);
    
    return this.logRepository.findByEntity(entity, entityId, options);
  }

  /**
   * Get logs by action
   * @param {String} action - Action
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Action logs
   */
  async getLogsByAction(action, options = {}) {
    if (!action) {
      throw new Error('Action is required');
    }
    
    return this.logRepository.findByAction(action, options);
  }

  /**
   * Get logs by time range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Logs in time range
   */
  async getLogsByTimeRange(startDate, endDate, options = {}) {
    if (!startDate || !endDate) {
      throw new Error('Start and end dates are required');
    }
    
    return this.logRepository.findByTimeRange(startDate, endDate, options);
  }

  /**
   * Get logs with pagination
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated logs
   */
  async getLogs(filter = {}, options = {}) {
    return this.logRepository.paginate(filter, {
      populate: { path: 'user', select: 'email role' },
      sort: { timestamp: -1 },
      ...options
    });
  }
}

module.exports = new LogService();