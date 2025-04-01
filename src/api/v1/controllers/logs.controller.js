const logService = require('../../../services/log.service');
const { asyncHandler } = require('../../../utils/error.utils');
const { status: { HTTP_STATUS } } = require('../../../constants');
const { objectId } = require('../../../utils/validation.utils');

/**
 * Get activity logs with pagination
 * @route GET /api/v1/logs
 */
const getLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, action, entity } = req.query;
  
  // Build filter
  const filter = {};
  
  if (action) {
    filter.action = action;
  }
  
  if (entity) {
    filter.entity = entity;
  }
  
  const logs = await logService.getLogs(filter, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { timestamp: -1 }
  });
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Logs retrieved successfully',
    data: logs
  });
});

/**
 * Get log by ID
 * @route GET /api/v1/logs/:id
 */
const getLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  
  const log = await logService.getLogById(id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Log retrieved successfully',
    data: log
  });
});

/**
 * Get logs by user
 * @route GET /api/v1/logs/user/:userId
 */
const getLogsByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  objectId(userId);
  const { page = 1, limit = 20 } = req.query;
  
  const logs = await logService.getLogsByUser(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { timestamp: -1 }
  });
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Logs retrieved successfully',
    data: logs
  });
});

/**
 * Get logs by entity
 * @route GET /api/v1/logs/entity/:entity/:entityId
 */
const getLogsByEntity = asyncHandler(async (req, res) => {
  const { entity, entityId } = req.params;
  objectId(entityId);
  const { page = 1, limit = 20 } = req.query;
  
  const logs = await logService.getLogsByEntity(entity, entityId, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { timestamp: -1 }
  });
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Logs retrieved successfully',
    data: logs
  });
});

module.exports = {
  getLogs,
  getLogById,
  getLogsByUser,
  getLogsByEntity
};