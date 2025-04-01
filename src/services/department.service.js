// src/services/department.service.js
const DepartmentRepository = require('../repositories/department.repository');
const { ApiError } = require('../errors/api.error');
const { ValidationError } = require('../errors/validation.error');
const { status: { DEPARTMENT_STATUS } } = require('../constants');
const { objectId } = require('../utils/validation.utils');
const logService = require('./log.service');

class DepartmentService {
  constructor() {
    this.departmentRepository = new DepartmentRepository();
  }

  /**
   * Get department by ID
   * @param {String} departmentId - Department ID
   * @returns {Promise<Object>} Department data
   */
  async getDepartmentById(departmentId) {
    objectId(departmentId);
    
    return this.departmentRepository.findById(departmentId, {
      populate: [
        { path: 'head', select: 'email role' },
        { path: 'parentDepartment', select: 'name code' }
      ]
    });
  }

  /**
   * Get department by code
   * @param {String} code - Department code
   * @returns {Promise<Object>} Department data
   */
  async getDepartmentByCode(code) {
    if (!code) {
      throw ValidationError.requiredField('code');
    }
    
    return this.departmentRepository.findOne({ code }, {
      populate: [
        { path: 'head', select: 'email role' },
        { path: 'parentDepartment', select: 'name code' }
      ]
    });
  }

  /**
   * Create a new department
   * @param {Object} departmentData - Department data
   * @param {String} createdById - ID of user creating the department
   * @returns {Promise<Object>} Created department
   */
  async createDepartment(departmentData, createdById) {
    objectId(createdById);
    
    // Check if code already exists
    const existingDepartment = await this.departmentRepository.findOne(
      { code: departmentData.code },
      { throwIfNotFound: false }
    );
    
    if (existingDepartment) {
      throw ApiError.conflict(
        'Department code already exists',
        'CONFLICT_RESOURCE_EXISTS'
      );
    }
    
    // Create department
    const department = await this.departmentRepository.create({
      ...departmentData,
      status: DEPARTMENT_STATUS.ACTIVE
    });
    
    // Log department creation
    await logService.createLog({
      user: createdById,
      action: 'create',
      entity: 'department',
      entityId: department._id,
      description: 'Department created',
      details: {
        name: department.name,
        code: department.code
      }
    });
    
    return department;
  }

  /**
   * Update department
   * @param {String} departmentId - Department ID
   * @param {Object} departmentData - Department data
   * @param {String} updatedById - ID of user updating the department
   * @returns {Promise<Object>} Updated department
   */
  async updateDepartment(departmentId, departmentData, updatedById) {
    objectId(departmentId);
    objectId(updatedById);
    
    // Get the current department data for change tracking
    const currentDepartment = await this.departmentRepository.findById(departmentId);
    
    // Check if trying to update code and if it already exists
    if (departmentData.code && departmentData.code !== currentDepartment.code) {
      const existingDepartment = await this.departmentRepository.findOne(
        { code: departmentData.code },
        { throwIfNotFound: false }
      );
      
      if (existingDepartment) {
        throw ApiError.conflict(
          'Department code already exists',
          'CONFLICT_RESOURCE_EXISTS'
        );
      }
    }
    
    // Update department
    const updatedDepartment = await this.departmentRepository.updateById(departmentId, departmentData);
    
    // Track changes for audit logging
    const changes = [];
    
    for (const [key, value] of Object.entries(departmentData)) {
      // Skip complex objects for simplicity
      if (typeof value !== 'object') {
        if (currentDepartment[key] !== value) {
          changes.push({
            field: key,
            oldValue: currentDepartment[key],
            newValue: value
          });
        }
      }
    }
    
    // Log department update
    await logService.createLog({
      user: updatedById,
      action: 'update',
      entity: 'department',
      entityId: departmentId,
      description: 'Department updated',
      details: {
        name: currentDepartment.name,
        code: currentDepartment.code,
        changes
      }
    });
    
    return updatedDepartment;
  }

  /**
   * Update department status
   * @param {String} departmentId - Department ID
   * @param {String} status - New status
   * @param {String} updatedById - ID of user updating the status
   * @returns {Promise<Object>} Updated department
   */
  async updateDepartmentStatus(departmentId, status, updatedById) {
    objectId(departmentId);
    objectId(updatedById);
    
    if (!Object.values(DEPARTMENT_STATUS).includes(status)) {
      throw ValidationError.invalidInput(`Invalid status: ${status}`);
    }
    
    // Get current status for change tracking
    const currentDepartment = await this.departmentRepository.findById(departmentId);
    const oldStatus = currentDepartment.status;
    
    // Update status
    const updatedDepartment = await this.departmentRepository.updateById(departmentId, { status });
    
    // Log status change
    await logService.createLog({
      user: updatedById,
      action: 'update_status',
      entity: 'department',
      entityId: departmentId,
      description: `Department status changed from ${oldStatus} to ${status}`,
      details: {
        name: currentDepartment.name,
        code: currentDepartment.code,
        changes: [
          {
            field: 'status',
            oldValue: oldStatus,
            newValue: status
          }
        ]
      }
    });
    
    return updatedDepartment;
  }

  /**
   * Assign department head
   * @param {String} departmentId - Department ID
   * @param {String} headId - Head user ID
   * @param {String} assignedById - ID of user assigning the head
   * @returns {Promise<Object>} Updated department
   */
  async assignDepartmentHead(departmentId, headId, assignedById) {
    objectId(departmentId);
    objectId(headId);
    objectId(assignedById);
    
    // Get current head for change tracking
    const currentDepartment = await this.departmentRepository.findById(departmentId);
    const oldHead = currentDepartment.head;
    
    // Update department head
    const updatedDepartment = await this.departmentRepository.updateById(departmentId, { head: headId });
    
    // Log head assignment
    await logService.createLog({
      user: assignedById,
      action: 'assign_head',
      entity: 'department',
      entityId: departmentId,
      description: 'Department head assigned',
      details: {
        name: currentDepartment.name,
        code: currentDepartment.code,
        changes: [
          {
            field: 'head',
            oldValue: oldHead,
            newValue: headId
          }
        ]
      }
    });
    
    return updatedDepartment;
  }

  /**
   * Delete department
   * @param {String} departmentId - Department ID
   * @param {String} deletedById - ID of user performing the delete
   * @returns {Promise<Boolean>} Delete success
   */
  async deleteDepartment(departmentId, deletedById) {
    objectId(departmentId);
    objectId(deletedById);
    
    // Get department details for logging
    const department = await this.departmentRepository.findById(departmentId);
    
    // Delete department
    await this.departmentRepository.deleteById(departmentId);
    
    // Log department deletion
    await logService.createLog({
      user: deletedById,
      action: 'delete',
      entity: 'department',
      entityId: departmentId,
      description: 'Department deleted',
      details: {
        name: department.name,
        code: department.code
      }
    });
    
    return true;
  }

  /**
   * Get departments with pagination
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated departments
   */
  async getDepartments(filter = {}, options = {}) {
    return this.departmentRepository.paginate(filter, {
      populate: [
        { path: 'head', select: 'email role' },
        { path: 'parentDepartment', select: 'name code' }
      ],
      ...options
    });
  }

  /**
   * Get sub-departments
   * @param {String} parentId - Parent department ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Sub-departments
   */
  async getSubDepartments(parentId, options = {}) {
    objectId(parentId);
    
    return this.departmentRepository.findAll(
      { parentDepartment: parentId },
      {
        populate: { path: 'head', select: 'email role' },
        ...options
      }
    );
  }
}

module.exports = new DepartmentService();