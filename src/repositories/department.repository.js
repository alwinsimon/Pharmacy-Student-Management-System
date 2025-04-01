const Department = require('../models/department.model');
const BaseRepository = require('./base.repository');
const { DatabaseError } = require('../errors/database.error');

/**
 * Repository for Department operations
 */
class DepartmentRepository extends BaseRepository {
  constructor() {
    super(Department, 'Department');
  }

  /**
   * Find department by code
   * @param {String} code - Department code
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Department document
   */
  async findByCode(code, options = {}) {
    return this.findOne({ code }, options);
  }

  /**
   * Find departments by parent department
   * @param {String} parentId - Parent department ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Sub-departments
   */
  async findByParent(parentId, options = {}) {
    return this.findAll({ parentDepartment: parentId }, options);
  }

  /**
   * Find departments by head
   * @param {String} headId - Department head user ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Departments
   */
  async findByHead(headId, options = {}) {
    return this.findAll({ head: headId }, options);
  }

  /**
   * Find active departments
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Active departments
   */
  async findActive(options = {}) {
    return this.findAll({ status: 'active' }, options);
  }

  /**
   * Get department hierarchy
   * @param {String} departmentId - Department ID
   * @returns {Promise<Object>} Department hierarchy
   */
  async getHierarchy(departmentId) {
    try {
      // Get the department
      const department = await this.findById(departmentId, {
        populate: { path: 'parentDepartment', select: 'name code' }
      });
      
      // Get sub-departments
      const subDepartments = await this.findByParent(departmentId, {
        select: 'name code status'
      });
      
      return {
        department,
        subDepartments
      };
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      throw DatabaseError.queryError(
        `Error getting department hierarchy: ${error.message}`,
        { error, departmentId }
      );
    }
  }

  /**
   * Get department with staff and student counts
   * @param {String} departmentId - Department ID
   * @returns {Promise<Object>} Department with counts
   */
  async getDepartmentWithCounts(departmentId) {
    try {
      const department = await this.model.findById(departmentId)
        .populate('head', 'email role')
        .populate('staffCount')
        .populate('studentCount');
      
      if (!department) {
        throw DatabaseError.notFound('Department', departmentId);
      }
      
      return department;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      throw DatabaseError.queryError(
        `Error getting department with counts: ${error.message}`,
        { error, departmentId }
      );
    }
  }
}

// Export the class
module.exports = DepartmentRepository;