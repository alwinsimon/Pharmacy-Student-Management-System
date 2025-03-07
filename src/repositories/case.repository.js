// src/repositories/case.repository.js
const Case = require('../models/case.model');
const BaseRepository = require('./base.repository');
const { DatabaseError } = require('../errors/database.error');

/**
 * Repository for Case operations
 */
class CaseRepository extends BaseRepository {
  constructor() {
    super(Case, 'Case');
  }

  /**
   * Find case by case number
   * @param {String} caseNumber - Case number
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Case document
   */
  async findByCaseNumber(caseNumber, options = {}) {
    return this.findOne({ caseNumber }, options);
  }

  /**
   * Find cases by student
   * @param {String|ObjectId} studentId - Student ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Cases by student
   */
  async findByStudent(studentId, options = {}) {
    return this.findAll({ 
      student: studentId,
      isDeleted: { $ne: true }
    }, options);
  }

  /**
   * Find cases assigned to staff
   * @param {String|ObjectId} staffId - Staff ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Cases assigned to staff
   */
  async findByAssignedStaff(staffId, options = {}) {
    return this.findAll({ 
      assignedTo: staffId,
      isDeleted: { $ne: true }
    }, options);
  }

  /**
   * Find cases by department
   * @param {String|ObjectId} departmentId - Department ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Cases in department
   */
  async findByDepartment(departmentId, options = {}) {
    return this.findAll({ 
      department: departmentId,
      isDeleted: { $ne: true }
    }, options);
  }

  /**
   * Find cases by status
   * @param {String|Array} status - Status or array of statuses
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Cases with specified status
   */
  async findByStatus(status, options = {}) {
    const statusFilter = Array.isArray(status) 
      ? { $in: status } 
      : status;
      
    return this.findAll({ 
      status: statusFilter,
      isDeleted: { $ne: true }
    }, options);
  }

  /**
   * Assign case to staff
   * @param {String|ObjectId} caseId - Case ID
   * @param {String|ObjectId} staffId - Staff ID
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Updated case
   */
  async assignToStaff(caseId, staffId, options = {}) {
    return this.updateById(caseId, { assignedTo: staffId }, options);
  }

  /**
   * Update case status
   * @param {String|ObjectId} caseId - Case ID
   * @param {String} status - New status
   * @param {String|ObjectId} userId - User making the change
   * @param {String} comments - Optional comments
   * @returns {Promise<Object>} Updated case
   */
  async updateStatus(caseId, status, userId, comments = '') {
    try {
      const case_ = await this.findById(caseId);
      
      // Set the modifiedBy field for workflowHistory tracking
      case_.modifiedBy = userId;
      
      // Update the status
      case_.status = status;
      
      // If comments provided, add them to workflow history
      if (comments) {
        case_.workflowHistory.push({
          status,
          changedBy: userId,
          changedAt: new Date(),
          comments
        });
      }
      
      return await case_.save();
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      throw DatabaseError.queryError(
        `Error updating case status: ${error.message}`,
        { error, caseId, status, userId }
      );
    }
  }

  /**
   * Add evaluation to case
   * @param {String|ObjectId} caseId - Case ID
   * @param {Object} evaluationData - Evaluation data
   * @returns {Promise<Object>} Updated case
   */
  async addEvaluation(caseId, evaluationData) {
    return this.updateById(caseId, { 
      evaluation: { ...evaluationData, evaluatedAt: new Date() } 
    });
  }

  /**
   * Add revision request to case
   * @param {String|ObjectId} caseId - Case ID
   * @param {Object} revisionData - Revision request data
   * @returns {Promise<Object>} Updated case
   */
  async addRevisionRequest(caseId, revisionData) {
    try {
      const case_ = await this.findById(caseId);
      
      case_.revisionRequests.push({
        ...revisionData,
        requestedAt: new Date()
      });
      
      return await case_.save();
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      throw DatabaseError.queryError(
        `Error adding revision request: ${error.message}`,
        { error, caseId, revisionData }
      );
    }
  }

  /**
   * Mark revision request as resolved
   * @param {String|ObjectId} caseId - Case ID
   * @param {Number} revisionIndex - Index of revision request
   * @returns {Promise<Object>} Updated case
   */
  async resolveRevisionRequest(caseId, revisionIndex) {
    try {
      const case_ = await this.findById(caseId);
      
      if (!case_.revisionRequests[revisionIndex]) {
        throw DatabaseError.notFound('Revision request', revisionIndex);
      }
      
      case_.revisionRequests[revisionIndex].resolvedAt = new Date();
      
      return await case_.save();
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      throw DatabaseError.queryError(
        `Error resolving revision request: ${error.message}`,
        { error, caseId, revisionIndex }
      );
    }
  }

  /**
   * Add attachment to case
   * @param {String|ObjectId} caseId - Case ID
   * @param {Object} attachmentData - Attachment data
   * @returns {Promise<Object>} Updated case
   */
  async addAttachment(caseId, attachmentData) {
    try {
      const case_ = await this.findById(caseId);
      
      case_.attachments.push({
        ...attachmentData,
        uploadedAt: new Date()
      });
      
      return await case_.save();
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      throw DatabaseError.queryError(
        `Error adding attachment: ${error.message}`,
        { error, caseId, attachmentData }
      );
    }
  }

  /**
   * Update case report information
   * @param {String|ObjectId} caseId - Case ID
   * @param {Object} reportData - Report data
   * @returns {Promise<Object>} Updated case
   */
  async updateReport(caseId, reportData) {
    return this.updateById(caseId, { 
      report: { 
        ...reportData, 
        generated: true,
        generatedAt: new Date() 
      } 
    });
  }

  /**
   * Search cases
   * @param {String} query - Search query
   * @param {Object} filter - Additional filter criteria
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async search(query, filter = {}, options = {}) {
    try {
      const searchFilter = {
        $or: [
          { caseNumber: { $regex: query, $options: 'i' } },
          { title: { $regex: query, $options: 'i' } }
        ],
        isDeleted: { $ne: true },
        ...filter
      };
      
      // If the query looks like a case number
      if (/^CASE-[A-Z0-9]+$/i.test(query)) {
        searchFilter.$or.unshift({ caseNumber: query.toUpperCase() });
      }
      
      // Text search for longer queries
      if (query.length > 3) {
        const textSearchResults = await this.model.find(
          { 
            $text: { $search: query },
            isDeleted: { $ne: true },
            ...filter
          },
          { score: { $meta: 'textScore' } }
        )
        .sort({ score: { $meta: 'textScore' } })
        .limit(10);
        
        const textSearchIds = textSearchResults.map(result => result._id);
        
        if (textSearchIds.length > 0) {
          searchFilter.$or.push({ _id: { $in: textSearchIds } });
        }
      }
      
      return this.findAll(searchFilter, options);
    } catch (error) {
      throw DatabaseError.queryError(
        `Error searching cases: ${error.message}`,
        { error, query, filter }
      );
    }
  }
}

module.exports = CaseRepository;