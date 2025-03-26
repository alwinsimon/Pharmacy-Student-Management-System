// src/api/v1/routes/documents.routes.js
const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documents.controller');
const { validate } = require('../middleware/validator.middleware');
const documentValidator = require('../validators/document.validator');
const { authenticate, authorize, checkPermission } = require('../middleware/auth.middleware');
const { PERMISSIONS } = require('../../../constants/permissions.constants');
const { ROLES } = require('../../../constants/roles.constants');
const uploadMiddleware = require('../middleware/upload.middleware');

/**
 * @route GET /api/v1/documents
 * @desc Get all documents with pagination
 * @access Private
 */
router.get(
  '/',
  authenticate,
  documentController.getDocuments
);

/**
 * @route GET /api/v1/documents/:id
 * @desc Get document by ID
 * @access Private
 */
router.get(
  '/:id',
  authenticate,
  documentController.getDocumentById
);

/**
 * @route GET /api/v1/documents/number/:documentNumber
 * @desc Get document by document number
 * @access Private
 */
router.get(
  '/number/:documentNumber',
  authenticate,
  documentController.getDocumentByNumber
);

/**
 * @route POST /api/v1/documents
 * @desc Create a new document
 * @access Private (Staff)
 */
router.post(
  '/',
  authenticate,
  authorize(ROLES.STAFF),
  checkPermission(PERMISSIONS.DOCUMENT_CREATE),
  validate(documentValidator.createDocumentSchema),
  documentController.createDocument
);

/**
 * @route PUT /api/v1/documents/:id
 * @desc Update document
 * @access Private (Staff)
 */
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.STAFF),
  checkPermission(PERMISSIONS.DOCUMENT_UPDATE),
  validate(documentValidator.updateDocumentSchema),
  documentController.updateDocument
);

/**
 * @route POST /api/v1/documents/:id/file
 * @desc Update document file (add new version)
 * @access Private
 */
router.post(
  '/:id/file',
  authenticate,
  uploadMiddleware.single('document'),
  validate(documentValidator.updateFileSchema),
  documentController.updateDocumentFile
);

/**
 * @route GET /api/v1/documents/:id/file
 * @desc Get document file
 * @access Private
 */
router.get(
  '/:id/file',
  authenticate,
  documentController.getDocumentFile
);

/**
 * @route GET /api/v1/documents/:id/file/:version
 * @desc Get document file by version
 * @access Private
 */
router.get(
  '/:id/file/:version',
  authenticate,
  documentController.getDocumentFileByVersion
);

/**
 * @route PATCH /api/v1/documents/:id/status
 * @desc Update document status
 * @access Private (Staff, Manager, Super Admin)
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize(ROLES.STAFF),
  validate(documentValidator.updateStatusSchema),
  documentController.updateDocumentStatus
);

/**
 * @route DELETE /api/v1/documents/:id
 * @desc Delete document
 * @access Private (Staff)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.STAFF),
  checkPermission(PERMISSIONS.DOCUMENT_DELETE),
  documentController.deleteDocument
);

/**
 * @route GET /api/v1/documents/category/:category
 * @desc Get documents by category
 * @access Private
 */
router.get(
  '/category/:category',
  authenticate,
  documentController.getDocumentsByCategory
);

/**
 * @route GET /api/v1/documents/author/:authorId
 * @desc Get documents by author
 * @access Private
 */
router.get(
  '/author/:authorId',
  authenticate,
  documentController.getDocumentsByAuthor
);

/**
 * @route GET /api/v1/documents/department/:departmentId
 * @desc Get documents by department
 * @access Private
 */
router.get(
  '/department/:departmentId',
  authenticate,
  documentController.getDocumentsByDepartment
);

/**
 * @route GET /api/v1/documents/search
 * @desc Search documents
 * @access Private
 */
router.get(
  '/search',
  authenticate,
  documentController.searchDocuments
);

/**
 * @route POST /api/v1/documents/:id/share
 * @desc Share document with users
 * @access Private
 */
router.post(
  '/:id/share',
  authenticate,
  validate(documentValidator.shareDocumentSchema),
  documentController.shareDocument
);

module.exports = router;