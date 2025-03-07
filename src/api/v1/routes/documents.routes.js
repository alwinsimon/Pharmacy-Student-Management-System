// src/api/v1/routes/documents.routes.js
const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documents.controller');
const { validate } = require('../middleware/validator.middleware');
const documentValidator = require('../validators/document.validator');
const { authenticateJWT, authorizeRole, authorizePermission } = require('../middleware/auth.middleware');
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
  authenticateJWT,
  documentController.getDocuments
);

/**
 * @route GET /api/v1/documents/:id
 * @desc Get document by ID
 * @access Private
 */
router.get(
  '/:id',
  authenticateJWT,
  documentController.getDocumentById
);

/**
 * @route GET /api/v1/documents/number/:documentNumber
 * @desc Get document by document number
 * @access Private
 */
router.get(
  '/number/:documentNumber',
  authenticateJWT,
  documentController.getDocumentByNumber
);

/**
 * @route POST /api/v1/documents
 * @desc Create a new document
 * @access Private (Staff, Manager, Super Admin)
 */
router.post(
  '/',
  authenticateJWT,
  authorizePermission(PERMISSIONS.DOCUMENT_CREATE),
  uploadMiddleware.single('document'),
  validate(documentValidator.createDocumentSchema),
  documentController.createDocument
);

/**
 * @route PUT /api/v1/documents/:id
 * @desc Update document
 * @access Private
 */
router.put(
  '/:id',
  authenticateJWT,
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
  authenticateJWT,
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
  authenticateJWT,
  documentController.getDocumentFile
);

/**
 * @route GET /api/v1/documents/:id/file/:version
 * @desc Get document file by version
 * @access Private
 */
router.get(
  '/:id/file/:version',
  authenticateJWT,
  documentController.getDocumentFileByVersion
);

/**
 * @route PATCH /api/v1/documents/:id/status
 * @desc Update document status
 * @access Private (Staff, Manager, Super Admin)
 */
router.patch(
  '/:id/status',
  authenticateJWT,
  authorizeRole(ROLES.STAFF),
  validate(documentValidator.updateStatusSchema),
  documentController.updateDocumentStatus
);

/**
 * @route DELETE /api/v1/documents/:id
 * @desc Delete document
 * @access Private
 */
router.delete(
  '/:id',
  authenticateJWT,
  documentController.deleteDocument
);

/**
 * @route GET /api/v1/documents/category/:category
 * @desc Get documents by category
 * @access Private
 */
router.get(
  '/category/:category',
  authenticateJWT,
  documentController.getDocumentsByCategory
);

/**
 * @route GET /api/v1/documents/author/:authorId
 * @desc Get documents by author
 * @access Private
 */
router.get(
  '/author/:authorId',
  authenticateJWT,
  documentController.getDocumentsByAuthor
);

/**
 * @route GET /api/v1/documents/department/:departmentId
 * @desc Get documents by department
 * @access Private
 */
router.get(
  '/department/:departmentId',
  authenticateJWT,
  documentController.getDocumentsByDepartment
);

/**
 * @route GET /api/v1/documents/search
 * @desc Search documents
 * @access Private
 */
router.get(
  '/search',
  authenticateJWT,
  documentController.searchDocuments
);

/**
 * @route POST /api/v1/documents/:id/share
 * @desc Share document with users
 * @access Private
 */
router.post(
  '/:id/share',
  authenticateJWT,
  validate(documentValidator.shareDocumentSchema),
  documentController.shareDocument
);

module.exports = router;