// src/api/v1/routes/cases.routes.js
const express = require('express');
const router = express.Router();
const caseController = require('../controllers/cases.controller');
const { validate } = require('../middleware/validator.middleware');
const caseValidator = require('../validators/case.validator');
const { authenticateJWT, authorizeRole, authorizePermission } = require('../middleware/auth.middleware');
const { PERMISSIONS } = require('../../../constants/permissions.constants');
const { ROLES } = require('../../../constants/roles.constants');
const uploadMiddleware = require('../middleware/upload.middleware');

/**
 * @route GET /api/v1/cases
 * @desc Get all cases with pagination
 * @access Private (Staff, Manager, Super Admin)
 */
router.get(
  '/',
  authenticateJWT,
  authorizeRole(ROLES.STAFF),
  caseController.getCases
);

/**
 * @route GET /api/v1/cases/:id
 * @desc Get case by ID
 * @access Private
 */
router.get(
  '/:id',
  authenticateJWT,
  caseController.getCaseById
);

/**
 * @route GET /api/v1/cases/number/:caseNumber
 * @desc Get case by case number
 * @access Private
 */
router.get(
  '/number/:caseNumber',
  authenticateJWT,
  caseController.getCaseByNumber
);

/**
 * @route POST /api/v1/cases
 * @desc Create a new case
 * @access Private (Student)
 */
router.post(
  '/',
  authenticateJWT,
  authorizePermission(PERMISSIONS.CASE_CREATE),
  validate(caseValidator.createCaseSchema),
  caseController.createCase
);

/**
 * @route PUT /api/v1/cases/:id
 * @desc Update case
 * @access Private
 */
router.put(
  '/:id',
  authenticateJWT,
  validate(caseValidator.updateCaseSchema),
  caseController.updateCase
);

/**
 * @route POST /api/v1/cases/:id/submit
 * @desc Submit case for review
 * @access Private (Student)
 */
router.post(
  '/:id/submit',
  authenticateJWT,
  authorizePermission(PERMISSIONS.CASE_SUBMIT),
  caseController.submitCase
);

/**
 * @route POST /api/v1/cases/:id/assign/:staffId
 * @desc Assign case to staff
 * @access Private (Manager)
 */
router.post(
  '/:id/assign/:staffId',
  authenticateJWT,
  authorizeRole(ROLES.MANAGER),
  authorizePermission(PERMISSIONS.CASE_ASSIGN),
  caseController.assignCase
);

/**
 * @route POST /api/v1/cases/:id/review/start
 * @desc Start case review
 * @access Private (Staff)
 */
router.post(
  '/:id/review/start',
  authenticateJWT,
  authorizeRole(ROLES.STAFF),
  authorizePermission(PERMISSIONS.CASE_REVIEW),
  caseController.startReview
);

/**
 * @route POST /api/v1/cases/:id/review/revision
 * @desc Request case revision
 * @access Private (Staff)
 */
router.post(
  '/:id/review/revision',
  authenticateJWT,
  authorizeRole(ROLES.STAFF),
  authorizePermission(PERMISSIONS.CASE_REVIEW),
  validate(caseValidator.revisionRequestSchema),
  caseController.requestRevision
);

/**
 * @route POST /api/v1/cases/:id/review/complete
 * @desc Complete case review with evaluation
 * @access Private (Staff)
 */
router.post(
  '/:id/review/complete',
  authenticateJWT,
  authorizeRole(ROLES.STAFF),
  authorizePermission(PERMISSIONS.CASE_REVIEW),
  validate(caseValidator.evaluationSchema),
  caseController.completeReview
);

/**
 * @route POST /api/v1/cases/:id/attachments
 * @desc Add attachment to case
 * @access Private
 */
router.post(
  '/:id/attachments',
  authenticateJWT,
  uploadMiddleware.single('attachment'),
  caseController.addAttachment
);

/**
 * @route GET /api/v1/cases/:id/report
 * @desc Get case report (PDF)
 * @access Private
 */
router.get(
  '/:id/report',
  authenticateJWT,
  caseController.getCaseReport
);

/**
 * @route DELETE /api/v1/cases/:id
 * @desc Delete case
 * @access Private
 */
router.delete(
  '/:id',
  authenticateJWT,
  caseController.deleteCase
);

/**
 * @route GET /api/v1/cases/student/:studentId
 * @desc Get cases by student
 * @access Private (Staff, Manager, Super Admin)
 */
router.get(
  '/student/:studentId',
  authenticateJWT,
  authorizeRole(ROLES.STAFF),
  caseController.getCasesByStudent
);

/**
 * @route GET /api/v1/cases/staff/:staffId
 * @desc Get cases assigned to staff
 * @access Private (Staff, Manager, Super Admin)
 */
router.get(
  '/staff/:staffId',
  authenticateJWT,
  authorizeRole(ROLES.STAFF),
  caseController.getCasesByStaff
);

/**
 * @route GET /api/v1/cases/department/:departmentId
 * @desc Get cases by department
 * @access Private (Manager, Super Admin)
 */
router.get(
  '/department/:departmentId',
  authenticateJWT,
  authorizeRole(ROLES.MANAGER),
  caseController.getCasesByDepartment
);

/**
 * @route GET /api/v1/cases/status/:status
 * @desc Get cases by status
 * @access Private (Staff, Manager, Super Admin)
 */
router.get(
  '/status/:status',
  authenticateJWT,
  authorizeRole(ROLES.STAFF),
  caseController.getCasesByStatus
);

/**
 * @route GET /api/v1/cases/search
 * @desc Search cases
 * @access Private (Staff, Manager, Super Admin)
 */
router.get(
  '/search',
  authenticateJWT,
  authorizeRole(ROLES.STAFF),
  caseController.searchCases
);

module.exports = router;