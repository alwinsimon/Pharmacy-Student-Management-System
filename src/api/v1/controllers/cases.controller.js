// src/api/v1/controllers/cases.controller.js
const caseService = require('../../../services/case.service');
const { asyncHandler } = require('../../../utils/error.utils');
const { status: { HTTP_STATUS } } = require('../../../constants');
const { AuthError } = require('../../../errors/auth.error');
const { objectId } = require('../../../utils/validation.utils');
const path = require('path');
const fs = require('fs').promises;

/**
 * Get all cases with pagination
 * @route GET /api/v1/cases
 */
const getCases = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, department } = req.query;
  
  // Build filter
  const filter = {};
  
  if (status) {
    filter.status = status;
  }
  
  if (department) {
    filter.department = department;
  }
  
  // Students can only view their own cases
  if (req.user.role === 'student') {
    filter.student = req.user.id;
  }
  
  // Get cases with pagination
  const cases = await caseService.getCases(filter, {
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Cases retrieved successfully',
    data: cases
  });
});

/**
 * Get case by ID
 * @route GET /api/v1/cases/:id
 */
const getCaseById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  
  const case_ = await caseService.getCaseById(id);
  
  // Check if user has access to this case
  if (req.user.role === 'student' && case_.student.toString() !== req.user.id) {
    throw AuthError.insufficientPermissions('You do not have access to this case');
  }
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Case retrieved successfully',
    data: case_
  });
});

/**
 * Get case by case number
 * @route GET /api/v1/cases/number/:caseNumber
 */
const getCaseByNumber = asyncHandler(async (req, res) => {
  const { caseNumber } = req.params;
  
  const case_ = await caseService.getCaseByCaseNumber(caseNumber);
  
  // Check if user has access to this case
  if (req.user.role === 'student' && case_.student.toString() !== req.user.id) {
    throw AuthError.insufficientPermissions('You do not have access to this case');
  }
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Case retrieved successfully',
    data: case_
  });
});

/**
 * Create a new case
 * @route POST /api/v1/cases
 */
const createCase = asyncHandler(async (req, res) => {
  const caseData = req.body;
  
  // Students can only create cases for themselves
  const studentId = req.user.role === 'student' ? req.user.id : caseData.student;
  
  const case_ = await caseService.createCase(caseData, studentId);
  
  res.status(HTTP_STATUS.CREATED.code).json({
    success: true,
    message: 'Case created successfully',
    data: case_
  });
});

/**
 * Update case
 * @route PUT /api/v1/cases/:id
 */
const updateCase = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  const caseData = req.body;
  
  // Get the case to check permissions
  const existingCase = await caseService.getCaseById(id);
  
  // Check if user has permission to update this case
  const isStudent = req.user.role === 'student';
  const isAssignedStaff = existingCase.assignedTo && 
                        existingCase.assignedTo.toString() === req.user.id;
  
  if (isStudent && existingCase.student.toString() !== req.user.id) {
    throw AuthError.insufficientPermissions('You do not have permission to update this case');
  }
  
  if (req.user.role === 'staff' && !isAssignedStaff) {
    throw AuthError.insufficientPermissions('You are not assigned to this case');
  }
  
  const updatedCase = await caseService.updateCase(id, caseData, req.user.id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Case updated successfully',
    data: updatedCase
  });
});

/**
 * Submit case for review
 * @route POST /api/v1/cases/:id/submit
 */
const submitCase = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  
  // Only students can submit their own cases
  const studentId = req.user.id;
  
  // Check if it's the student's case
  const existingCase = await caseService.getCaseById(id);
  
  if (existingCase.student.toString() !== studentId) {
    throw AuthError.insufficientPermissions('You can only submit your own cases');
  }
  
  const submittedCase = await caseService.submitCase(id, studentId);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Case submitted for review successfully',
    data: submittedCase
  });
});

/**
 * Assign case to staff
 * @route POST /api/v1/cases/:id/assign/:staffId
 */
const assignCase = asyncHandler(async (req, res) => {
  const { id, staffId } = req.params;
  objectId(id);
  objectId(staffId);
  
  const assignedCase = await caseService.assignCase(id, staffId, req.user.id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Case assigned successfully',
    data: assignedCase
  });
});

/**
 * Start case review
 * @route POST /api/v1/cases/:id/review/start
 */
const startReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  
  // Get case to check assignment
  const existingCase = await caseService.getCaseById(id);
  
  // Check if staff is assigned to this case
  if (!existingCase.assignedTo || existingCase.assignedTo.toString() !== req.user.id) {
    throw AuthError.insufficientPermissions('You are not assigned to review this case');
  }
  
  const reviewCase = await caseService.startReview(id, req.user.id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Case review started successfully',
    data: reviewCase
  });
});

/**
 * Request case revision
 * @route POST /api/v1/cases/:id/review/revision
 */
const requestRevision = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  const { description } = req.body;
  
  // Get case to check assignment
  const existingCase = await caseService.getCaseById(id);
  
  // Check if staff is assigned to this case
  if (!existingCase.assignedTo || existingCase.assignedTo.toString() !== req.user.id) {
    throw AuthError.insufficientPermissions('You are not assigned to review this case');
  }
  
  const revisionCase = await caseService.requestRevision(id, req.user.id, description);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Revision requested successfully',
    data: revisionCase
  });
});

/**
 * Complete case review with evaluation
 * @route POST /api/v1/cases/:id/review/complete
 */
const completeReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  const evaluationData = req.body;
  
  // Get case to check assignment
  const existingCase = await caseService.getCaseById(id);
  
  // Check if staff is assigned to this case
  if (!existingCase.assignedTo || existingCase.assignedTo.toString() !== req.user.id) {
    throw AuthError.insufficientPermissions('You are not assigned to review this case');
  }
  
  const completedCase = await caseService.completeReview(id, req.user.id, evaluationData);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Case review completed successfully',
    data: completedCase
  });
});

/**
 * Add attachment to case
 * @route POST /api/v1/cases/:id/attachments
 */
const addAttachment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  
  if (!req.file) {
    throw new Error('Attachment file is required');
  }
  
  // Get case to check permissions
  const existingCase = await caseService.getCaseById(id);
  
  // Check if user has permission to add attachments
  const isStudent = req.user.role === 'student';
  const isAssignedStaff = existingCase.assignedTo && 
                        existingCase.assignedTo.toString() === req.user.id;
  
  if (isStudent && existingCase.student.toString() !== req.user.id) {
    throw AuthError.insufficientPermissions('You can only add attachments to your own cases');
  }
  
  if (req.user.role === 'staff' && !isAssignedStaff) {
    throw AuthError.insufficientPermissions('You are not assigned to this case');
  }
  
  const attachmentData = {
    filename: req.file.filename,
    path: req.file.path,
    contentType: req.file.mimetype,
    description: req.body.description || ''
  };
  
  const updatedCase = await caseService.addAttachment(id, req.user.id, attachmentData);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Attachment added successfully',
    data: {
      attachment: updatedCase.attachments[updatedCase.attachments.length - 1]
    }
  });
});

/**
 * Get case report (PDF)
 * @route GET /api/v1/cases/:id/report
 */
const getCaseReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  
  // Get case with report info
  const case_ = await caseService.getCaseById(id);
  
  // Check if user has access to this case
  if (req.user.role === 'student' && case_.student.toString() !== req.user.id) {
    throw AuthError.insufficientPermissions('You do not have access to this report');
  }
  
  // Check if report exists
  if (!case_.report || !case_.report.path) {
    throw new Error('Report not found for this case');
  }
  
  const reportPath = path.join(process.cwd(), 'src', 'uploads', case_.report.path);
  
  try {
    // Check if file exists
    await fs.access(reportPath);
    
    // Send file
    res.download(reportPath, `Case_Report_${case_.caseNumber}.pdf`);
  } catch (error) {
    throw new Error('Report file not found');
  }
});

/**
 * Delete case
 * @route DELETE /api/v1/cases/:id
 */
const deleteCase = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  
  // Get case to check permissions
  const existingCase = await caseService.getCaseById(id);
  
  // Only students can delete their own draft cases
  // Managers and super admins can delete any case
  if (req.user.role === 'student') {
    if (existingCase.student.toString() !== req.user.id) {
      throw AuthError.insufficientPermissions('You can only delete your own cases');
    }
    
    if (existingCase.status !== 'draft') {
      throw AuthError.insufficientPermissions('You can only delete draft cases');
    }
  }
  
  await caseService.deleteCase(id, req.user.id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Case deleted successfully'
  });
});

/**
 * Get cases by student
 * @route GET /api/v1/cases/student/:studentId
 */
const getCasesByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  objectId(studentId);
  const { page = 1, limit = 10, status } = req.query;
  
  // Students can only view their own cases
  if (req.user.role === 'student' && studentId !== req.user.id) {
    throw AuthError.insufficientPermissions('You can only view your own cases');
  }
  
  // Build filter
  const filter = { student: studentId };
  
  if (status) {
    filter.status = status;
  }
  
  const cases = await caseService.getCases(filter, {
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Cases retrieved successfully',
    data: cases
  });
});

/**
 * Get cases assigned to staff
 * @route GET /api/v1/cases/staff/:staffId
 */
const getCasesByStaff = asyncHandler(async (req, res) => {
  const { staffId } = req.params;
  objectId(staffId);
  const { page = 1, limit = 10, status } = req.query;
  
  // Staff can only view their own assigned cases
  if (req.user.role === 'staff' && staffId !== req.user.id) {
    throw AuthError.insufficientPermissions('You can only view your own assigned cases');
  }
  
  // Build filter
  const filter = { assignedTo: staffId };
  
  if (status) {
    filter.status = status;
  }
  
  const cases = await caseService.getCases(filter, {
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Cases retrieved successfully',
    data: cases
  });
});

/**
 * Get cases by department
 * @route GET /api/v1/cases/department/:departmentId
 */
const getCasesByDepartment = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;
  objectId(departmentId);
  const { page = 1, limit = 10, status } = req.query;
  
  // Build filter
  const filter = { department: departmentId };
  
  if (status) {
    filter.status = status;
  }
  
  const cases = await caseService.getCases(filter, {
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Cases retrieved successfully',
    data: cases
  });
});

/**
 * Get cases by status
 * @route GET /api/v1/cases/status/:status
 */
const getCasesByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;
  const { page = 1, limit = 10, department } = req.query;
  
  // Build filter
  const filter = { status };
  
  if (department) {
    filter.department = department;
  }
  
  // Students can only view their own cases
  if (req.user.role === 'student') {
    filter.student = req.user.id;
  }
  
  const cases = await caseService.getCases(filter, {
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Cases retrieved successfully',
    data: cases
  });
});

/**
 * Search cases
 * @route GET /api/v1/cases/search
 */
const searchCases = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 10, department, status } = req.query;
  
  if (!q) {
    throw new Error('Search query is required');
  }
  
  // Build filter
  const filter = {};
  
  if (department) {
    filter.department = department;
  }
  
  if (status) {
    filter.status = status;
  }
  
  // Students can only search their own cases
  if (req.user.role === 'student') {
    filter.student = req.user.id;
  }
  
  const cases = await caseService.searchCases(q, filter, {
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Search results',
    data: cases
  });
});

module.exports = {
  getCases,
  getCaseById,
  getCaseByNumber,
  createCase,
  updateCase,
  submitCase,
  assignCase,
  startReview,
  requestRevision,
  completeReview,
  addAttachment,
  getCaseReport,
  deleteCase,
  getCasesByStudent,
  getCasesByStaff,
  getCasesByDepartment,
  getCasesByStatus,
  searchCases
};