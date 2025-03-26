// src/services/case.service.js
const CaseRepository = require('../repositories/case.repository');
const UserService = require('./user.service');
const QRCodeService = require('./qrcode.service');
const PDFService = require('./pdf.service');
const { ApiError } = require('../errors/api.error');
const { ValidationError } = require('../errors/validation.error');
const { status: { CASE_STATUS } } = require('../constants');
const { objectId } = require('../utils/validation.utils');
const logService = require('./log.service');
const notificationService = require('./notification.service');

class CaseService {
  constructor() {
    this.caseRepository = new CaseRepository();
  }

  /**
   * Get case by ID
   * @param {String} caseId - Case ID
   * @returns {Promise<Object>} Case data
   */
  async getCaseById(caseId) {
    objectId(caseId);
    
    return this.caseRepository.findById(caseId, {
      populate: [
        { path: 'student', select: 'email role' },
        { path: 'assignedTo', select: 'email role' },
        { path: 'department', select: 'name code' },
        { path: 'evaluation.evaluatedBy', select: 'email role' },
        { path: 'workflowHistory.changedBy', select: 'email role' },
        { path: 'revisionRequests.requestedBy', select: 'email role' }
      ]
    });
  }

  /**
   * Get case by case number
   * @param {String} caseNumber - Case number
   * @returns {Promise<Object>} Case data
   */
  async getCaseByCaseNumber(caseNumber) {
    if (!caseNumber) {
      throw ValidationError.requiredField('caseNumber');
    }
    
    return this.caseRepository.findByCaseNumber(caseNumber, {
      populate: [
        { path: 'student', select: 'email role' },
        { path: 'assignedTo', select: 'email role' },
        { path: 'department', select: 'name code' }
      ]
    });
  }

  /**
   * Create a new case
   * @param {Object} caseData - Case data
   * @param {String} studentId - Student ID
   * @returns {Promise<Object>} Created case
   */
  async createCase(caseData, studentId) {
    objectId(studentId);
    
    // Verify student exists
    const student = await UserService.getUserById(studentId, false);
    
    // Create case
    const case_ = await this.caseRepository.create({
      ...caseData,
      student: studentId,
      status: CASE_STATUS.DRAFT
    });
    
    // Log case creation
    await logService.createLog({
      user: studentId,
      action: 'create',
      entity: 'case',
      entityId: case_._id,
      description: 'Clinical case created'
    });
    
    return case_;
  }

  /**
   * Update case
   * @param {String} caseId - Case ID
   * @param {Object} caseData - Case data
   * @param {String} userId - User ID updating the case
   * @returns {Promise<Object>} Updated case
   */
  async updateCase(caseId, caseData, userId) {
    objectId(caseId);
    objectId(userId);
    
    // Get the current case data for change tracking
    const currentCase = await this.caseRepository.findById(caseId);
    
    // Check if the case is in a state that can be updated
    const allowedStatusForUpdate = [
      CASE_STATUS.DRAFT,
      CASE_STATUS.REVISION_REQUESTED
    ];
    
    const isStudent = currentCase.student.toString() === userId;
    const isAssignedStaff = currentCase.assignedTo && 
                           currentCase.assignedTo.toString() === userId;
    
    // Students can only update in draft or revision requested state
    if (isStudent && !allowedStatusForUpdate.includes(currentCase.status)) {
      throw ApiError.forbidden(
        'Case cannot be updated in its current state',
        'AUTH_RESOURCE_ACCESS_DENIED'
      );
    }
    
    // Prevent modifying critical fields
    delete caseData.student;
    delete caseData.caseNumber;
    delete caseData.status;
    delete caseData.workflowHistory;
    delete caseData.evaluation;
    delete caseData.report;
    
    // Set the modifiedBy for workflow history tracking
    currentCase.modifiedBy = userId;
    
    // Update case
    const updatedCase = await this.caseRepository.updateById(caseId, caseData);
    
    // Track changes for audit logging
    const changes = [];
    
    for (const [key, value] of Object.entries(caseData)) {
      // Skip complex objects for simplicity
      if (typeof value !== 'object') {
        if (currentCase[key] !== value) {
          changes.push({
            field: key,
            oldValue: currentCase[key],
            newValue: value
          });
        }
      }
    }
    
    // Log case update
    await logService.createLog({
      user: userId,
      action: 'update',
      entity: 'case',
      entityId: caseId,
      description: 'Clinical case updated',
      details: {
        changes
      }
    });
    
    return updatedCase;
  }

  /**
   * Submit case for review
   * @param {String} caseId - Case ID
   * @param {String} studentId - Student ID
   * @returns {Promise<Object>} Submitted case
   */
  async submitCase(caseId, studentId) {
    objectId(caseId);
    objectId(studentId);
    
    // Get the current case
    const case_ = await this.caseRepository.findById(caseId);
    
    // Check if user is the owner of the case
    if (case_.student.toString() !== studentId) {
      throw ApiError.forbidden(
        'Only the case owner can submit it for review',
        'AUTH_RESOURCE_ACCESS_DENIED'
      );
    }
    
    // Check if the case is in draft or revision requested state
    if (![CASE_STATUS.DRAFT, CASE_STATUS.REVISION_REQUESTED].includes(case_.status)) {
      throw ApiError.badRequest(
        'Case can only be submitted from draft or revision requested state',
        'VALIDATION_INVALID_STATUS'
      );
    }
    
    // Update case status
    const updatedCase = await this.caseRepository.updateStatus(
      caseId, 
      CASE_STATUS.SUBMITTED, 
      studentId, 
      'Case submitted for review'
    );
    
    // Send notification to department managers
    await notificationService.sendCaseSubmittedNotification(updatedCase);
    
    // Log case submission
    await logService.createLog({
      user: studentId,
      action: 'submit',
      entity: 'case',
      entityId: caseId,
      description: 'Clinical case submitted for review'
    });
    
    return updatedCase;
  }

  /**
   * Assign case to staff
   * @param {String} caseId - Case ID
   * @param {String} staffId - Staff ID
   * @param {String} assignedById - ID of user assigning the case
   * @returns {Promise<Object>} Assigned case
   */
  async assignCase(caseId, staffId, assignedById) {
    objectId(caseId);
    objectId(staffId);
    objectId(assignedById);
    
    // Get the current case
    const case_ = await this.caseRepository.findById(caseId);
    
    // Check if the case is in submitted state
    if (case_.status !== CASE_STATUS.SUBMITTED) {
      throw ApiError.badRequest(
        'Case can only be assigned from submitted state',
        'VALIDATION_INVALID_STATUS'
      );
    }
    
    // Verify staff exists and has staff role
    const staff = await UserService.getUserById(staffId, false);
    
    if (staff.role !== 'staff') {
      throw ApiError.badRequest(
        'Case can only be assigned to staff members',
        'VALIDATION_INVALID_INPUT'
      );
    }
    
    // Update case with assignment and status
    await this.caseRepository.assignToStaff(caseId, staffId);
    
    const updatedCase = await this.caseRepository.updateStatus(
      caseId, 
      CASE_STATUS.ASSIGNED, 
      assignedById, 
      `Case assigned to ${staff.email}`
    );
    
    // Send assignment notification to staff
    await notificationService.sendCaseAssignedNotification(updatedCase, staff);
    
    // Log case assignment
    await logService.createLog({
      user: assignedById,
      action: 'assign',
      entity: 'case',
      entityId: caseId,
      description: `Clinical case assigned to staff ${staffId}`,
      details: {
        assignedTo: staffId
      }
    });
    
    return updatedCase;
  }

  /**
   * Start case review
   * @param {String} caseId - Case ID
   * @param {String} staffId - Staff ID
   * @returns {Promise<Object>} Case in review
   */
  async startReview(caseId, staffId) {
    objectId(caseId);
    objectId(staffId);
    
    // Get the current case
    const case_ = await this.caseRepository.findById(caseId);
    
    // Check if user is assigned to the case
    if (!case_.assignedTo || case_.assignedTo.toString() !== staffId) {
      throw ApiError.forbidden(
        'Only the assigned staff can review the case',
        'AUTH_RESOURCE_ACCESS_DENIED'
      );
    }
    
    // Check if the case is in assigned state
    if (case_.status !== CASE_STATUS.ASSIGNED) {
      throw ApiError.badRequest(
        'Case can only be reviewed from assigned state',
        'VALIDATION_INVALID_STATUS'
      );
    }
    
    // Update case status
    const updatedCase = await this.caseRepository.updateStatus(
      caseId, 
      CASE_STATUS.IN_REVIEW, 
      staffId, 
      'Case review started'
    );
    
    // Notify student that review has started
    await notificationService.sendCaseReviewStartedNotification(updatedCase);
    
    // Log review start
    await logService.createLog({
      user: staffId,
      action: 'start_review',
      entity: 'case',
      entityId: caseId,
      description: 'Clinical case review started'
    });
    
    return updatedCase;
  }

  /**
   * Request case revision
   * @param {String} caseId - Case ID
   * @param {String} staffId - Staff ID
   * @param {String} description - Revision description
   * @returns {Promise<Object>} Case with revision request
   */
  async requestRevision(caseId, staffId, description) {
    objectId(caseId);
    objectId(staffId);
    
    if (!description) {
      throw ValidationError.requiredField('description');
    }
    
    // Get the current case
    const case_ = await this.caseRepository.findById(caseId);
    
    // Check if user is assigned to the case
    if (!case_.assignedTo || case_.assignedTo.toString() !== staffId) {
      throw ApiError.forbidden(
        'Only the assigned staff can request revisions',
        'AUTH_RESOURCE_ACCESS_DENIED'
      );
    }
    
    // Check if the case is in review state
    if (case_.status !== CASE_STATUS.IN_REVIEW) {
      throw ApiError.badRequest(
        'Revisions can only be requested for cases in review',
        'VALIDATION_INVALID_STATUS'
      );
    }
    
    // Add revision request
    await this.caseRepository.addRevisionRequest(caseId, {
      requestedBy: staffId,
      description
    });
    
    // Update case status
    const updatedCase = await this.caseRepository.updateStatus(
      caseId, 
      CASE_STATUS.REVISION_REQUESTED, 
      staffId, 
      `Revision requested: ${description}`
    );
    
    // Notify student about revision request
    await notificationService.sendRevisionRequestedNotification(updatedCase, description);
    
    // Log revision request
    await logService.createLog({
      user: staffId,
      action: 'request_revision',
      entity: 'case',
      entityId: caseId,
      description: 'Revision requested for clinical case',
      details: { revisionDescription: description }
    });
    
    return updatedCase;
  }

  /**
   * Complete case review with evaluation
   * @param {String} caseId - Case ID
   * @param {String} staffId - Staff ID
   * @param {Object} evaluationData - Evaluation data
   * @returns {Promise<Object>} Completed case
   */
  async completeReview(caseId, staffId, evaluationData) {
    objectId(caseId);
    objectId(staffId);
    
    if (!evaluationData || !evaluationData.score) {
      throw ValidationError.requiredField('evaluation.score');
    }
    
    // Get the current case
    const case_ = await this.caseRepository.findById(caseId);
    
    // Check if user is assigned to the case
    if (!case_.assignedTo || case_.assignedTo.toString() !== staffId) {
      throw ApiError.forbidden(
        'Only the assigned staff can complete the review',
        'AUTH_RESOURCE_ACCESS_DENIED'
      );
    }
    
    // Check if the case is in review state
    if (case_.status !== CASE_STATUS.IN_REVIEW) {
      throw ApiError.badRequest(
        'Reviews can only be completed for cases in review',
        'VALIDATION_INVALID_STATUS'
      );
    }
    
    // Add evaluation
    await this.caseRepository.addEvaluation(caseId, {
      ...evaluationData,
      evaluatedBy: staffId
    });
    
    // Update case status
    const updatedCase = await this.caseRepository.updateStatus(
      caseId, 
      CASE_STATUS.COMPLETED, 
      staffId, 
      `Review completed with score ${evaluationData.score}/${evaluationData.maxScore || 100}`
    );
    
    // Generate QR code for the report
    const qrCode = await QRCodeService.generateQRCode(
      `case-report/${case_.caseNumber}`,
      `Case Report: ${case_.title}`
    );
    
    // Generate PDF report
    const pdfPath = await PDFService.generateCaseReport(updatedCase, qrCode);
    
    // Update case with report info
    await this.caseRepository.updateReport(caseId, {
      path: pdfPath,
      qrCode: qrCode.code,
      accessCode: qrCode.accessCode
    });
    
    // Notify student about completed review
    await notificationService.sendReviewCompletedNotification(updatedCase);
    
    // Log review completion
    await logService.createLog({
      user: staffId,
      action: 'complete_review',
      entity: 'case',
      entityId: caseId,
      description: 'Clinical case review completed',
      details: { 
        score: evaluationData.score,
        maxScore: evaluationData.maxScore || 100
      }
    });
    
    return updatedCase;
  }

  /**
   * Get cases by student
   * @param {String} studentId - Student ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Student cases
   */
  async getCasesByStudent(studentId, options = {}) {
    objectId(studentId);
    
    return this.caseRepository.findByStudent(studentId, {
      populate: [
        { path: 'assignedTo', select: 'email role' },
        { path: 'department', select: 'name code' }
      ],
      ...options
    });
  }

  /**
   * Get cases assigned to staff
   * @param {String} staffId - Staff ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Assigned cases
   */
  async getCasesByStaff(staffId, options = {}) {
    objectId(staffId);
    
    return this.caseRepository.findByAssignedStaff(staffId, {
      populate: [
        { path: 'student', select: 'email role' },
        { path: 'department', select: 'name code' }
      ],
      ...options
    });
  }

  /**
   * Get cases by department
   * @param {String} departmentId - Department ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Department cases
   */
  async getCasesByDepartment(departmentId, options = {}) {
    objectId(departmentId);
    
    return this.caseRepository.findByDepartment(departmentId, {
      populate: [
        { path: 'student', select: 'email role' },
        { path: 'assignedTo', select: 'email role' }
      ],
      ...options
    });
  }

  /**
   * Get cases by status
   * @param {String|Array} status - Status or array of statuses
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Cases with status
   */
  async getCasesByStatus(status, options = {}) {
    // Validate status
    const validateStatus = (s) => {
      if (!Object.values(CASE_STATUS).includes(s)) {
        throw ValidationError.invalidInput(`Invalid status: ${s}`);
      }
    };
    
    if (Array.isArray(status)) {
      status.forEach(validateStatus);
    } else {
      validateStatus(status);
    }
    
    return this.caseRepository.findByStatus(status, {
      populate: [
        { path: 'student', select: 'email role' },
        { path: 'assignedTo', select: 'email role' },
        { path: 'department', select: 'name code' }
      ],
      ...options
    });
  }

  /**
   * Get cases with pagination
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated cases
   */
  async getCases(filter = {}, options = {}) {
    // Exclude deleted cases by default
    const combinedFilter = {
      isDeleted: { $ne: true },
      ...filter
    };
    
    return this.caseRepository.paginate(combinedFilter, {
      populate: [
        { path: 'student', select: 'email role' },
        { path: 'assignedTo', select: 'email role' },
        { path: 'department', select: 'name code' }
      ],
      ...options
    });
  }

  /**
   * Search cases
   * @param {String} query - Search query
   * @param {Object} filter - Additional filter
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async searchCases(query, filter = {}, options = {}) {
    if (!query || query.trim().length < 2) {
      throw ValidationError.invalidInput('Search query must be at least 2 characters');
    }
    
    return this.caseRepository.search(query, filter, {
      populate: [
        { path: 'student', select: 'email role' },
        { path: 'assignedTo', select: 'email role' },
        { path: 'department', select: 'name code' }
      ],
      ...options
    });
  }

  /**
   * Delete case
   * @param {String} caseId - Case ID
   * @param {String} deletedById - ID of user performing the delete
   * @returns {Promise<Boolean>} Delete success
   */
  async deleteCase(caseId, deletedById) {
    objectId(caseId);
    objectId(deletedById);
    
    // Get the case to check permissions
    const case_ = await this.caseRepository.findById(caseId);
    
    // Only allow deletion of draft cases by the owner
    if (case_.status !== CASE_STATUS.DRAFT && case_.student.toString() === deletedById) {
      throw ApiError.forbidden(
        'Only draft cases can be deleted by students',
        'AUTH_RESOURCE_ACCESS_DENIED'
      );
    }
    
    // Soft delete case
    await this.caseRepository.deleteById(caseId, {
      softDelete: true,
      deletedBy: deletedById
    });
    
    // Log case deletion
    await logService.createLog({
      user: deletedById,
      action: 'delete',
      entity: 'case',
      entityId: caseId,
      description: 'Clinical case deleted'
    });
    
    return true;
  }

  /**
   * Update case status
   * @param {String} caseId - Case ID
   * @param {String} status - New status
   * @param {String} userId - User ID updating the status
   * @returns {Promise<Object>} Updated case
   */
  async updateCaseStatus(caseId, status, userId) {
    objectId(caseId);
    objectId(userId);
    
    // Validate status
    if (!Object.values(CASE_STATUS).includes(status)) {
      throw ValidationError.invalidValue('status', status);
    }
    
    // Get the current case
    const case_ = await this.caseRepository.findById(caseId);
    
    // Check if the status transition is allowed
    const allowedTransitions = {
      [CASE_STATUS.DRAFT]: [CASE_STATUS.SUBMITTED],
      [CASE_STATUS.SUBMITTED]: [CASE_STATUS.IN_REVIEW, CASE_STATUS.REJECTED],
      [CASE_STATUS.IN_REVIEW]: [CASE_STATUS.REVISION_REQUESTED, CASE_STATUS.COMPLETED],
      [CASE_STATUS.REVISION_REQUESTED]: [CASE_STATUS.SUBMITTED],
      [CASE_STATUS.COMPLETED]: [],
      [CASE_STATUS.REJECTED]: []
    };
    
    if (!allowedTransitions[case_.status].includes(status)) {
      throw ApiError.badRequest(
        `Cannot transition from ${case_.status} to ${status}`,
        'VALIDATION_INVALID_STATUS_TRANSITION'
      );
    }
    
    // Update case status
    const updatedCase = await this.caseRepository.updateStatus(
      caseId,
      status,
      userId,
      `Case status updated to ${status}`
    );
    
    // Log status update
    await logService.createLog({
      user: userId,
      action: 'update_status',
      entity: 'case',
      entityId: caseId,
      description: `Case status updated to ${status}`,
      details: {
        oldStatus: case_.status,
        newStatus: status
      }
    });
    
    return updatedCase;
  }
}

module.exports = new CaseService();