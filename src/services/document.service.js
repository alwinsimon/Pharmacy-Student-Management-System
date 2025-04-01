// src/services/document.service.js
const path = require('path');
const fs = require('fs').promises;
const DocumentRepository = require('../repositories/document.repository');
const QRCodeService = require('./qrcode.service');
const { ApiError } = require('../errors/api.error');
const { ValidationError } = require('../errors/validation.error');
const { status: { DOCUMENT_STATUS } } = require('../constants');
const { objectId } = require('../utils/validation.utils');
const logService = require('./log.service');
const notificationService = require('./notification.service');
const { app: { upload: uploadConfig } } = require('../config');

class DocumentService {
  constructor() {
    this.documentRepository = new DocumentRepository();
  }

  /**
   * Get document by ID
   * @param {String} documentId - Document ID
   * @returns {Promise<Object>} Document data
   */
  async getDocumentById(documentId) {
    objectId(documentId);
    
    return this.documentRepository.findById(documentId, {
      populate: [
        { path: 'metadata.author', select: 'email role' },
        { path: 'metadata.department', select: 'name code' }
      ]
    });
  }

  /**
   * Get document by document number
   * @param {String} documentNumber - Document number
   * @returns {Promise<Object>} Document data
   */
  async getDocumentByNumber(documentNumber) {
    if (!documentNumber) {
      throw ValidationError.requiredField('documentNumber');
    }
    
    return this.documentRepository.findByDocumentNumber(documentNumber, {
      populate: [
        { path: 'metadata.author', select: 'email role' },
        { path: 'metadata.department', select: 'name code' }
      ]
    });
  }

  /**
   * Get document by QR code
   * @param {String} qrCode - QR code
   * @returns {Promise<Object>} Document data
   */
  async getDocumentByQRCode(qrCode) {
    if (!qrCode) {
      throw ValidationError.requiredField('qrCode');
    }
    
    return this.documentRepository.findByQRCode(qrCode, {
      populate: [
        { path: 'metadata.author', select: 'email role' },
        { path: 'metadata.department', select: 'name code' }
      ]
    });
  }

  /**
   * Create a new document
   * @param {Object} documentData - Document data
   * @param {Object} fileData - File data
   * @param {String} userId - User creating the document
   * @returns {Promise<Object>} Created document
   */
  async createDocument(documentData, fileData, userId) {
    objectId(userId);
    
    if (!fileData || !fileData.filename) {
      throw ValidationError.requiredField('file');
    }
    
    // Generate QR code for document access
    const qrCode = await QRCodeService.generateQRCode(
      `document/${documentData.documentNumber || 'new'}`,
      `Document: ${documentData.title}`
    );
    
    // Create document
    const document = await this.documentRepository.create({
      ...documentData,
      file: {
        filename: fileData.filename,
        originalFilename: fileData.originalname,
        path: fileData.path,
        contentType: fileData.mimetype,
        size: fileData.size,
        uploadedAt: new Date()
      },
      metadata: {
        ...documentData.metadata,
        author: userId,
        version: 1
      },
      qrCode: {
        code: qrCode.code,
        url: qrCode.url,
        generatedAt: new Date()
      }
    });
    
    // Log document creation
    await logService.createLog({
      user: userId,
      action: 'create',
      entity: 'document',
      entityId: document._id,
      description: 'Document created',
      details: {
        documentNumber: document.documentNumber,
        title: document.title,
        category: document.category
      }
    });
    
    return document;
  }

  /**
   * Update document
   * @param {String} documentId - Document ID
   * @param {Object} documentData - Document data
   * @param {String} userId - User updating the document
   * @returns {Promise<Object>} Updated document
   */
  async updateDocument(documentId, documentData, userId) {
    objectId(documentId);
    objectId(userId);
    
    // Get the current document data for change tracking
    const currentDocument = await this.documentRepository.findById(documentId);
    
    if (currentDocument.status === DOCUMENT_STATUS.DELETED) {
      throw ApiError.forbidden(
        'Deleted documents cannot be updated',
        'AUTH_RESOURCE_ACCESS_DENIED'
      );
    }
    
    // Prevent modifying critical fields
    delete documentData.documentNumber;
    delete documentData.file;
    delete documentData.qrCode;
    delete documentData.versions;
    delete documentData.accessLogs;
    delete documentData.isDeleted;
    delete documentData.deletedAt;
    delete documentData.deletedBy;
    
    // Update document
    const updatedDocument = await this.documentRepository.updateById(documentId, documentData);
    
    // Track changes for audit logging
    const changes = [];
    
    for (const [key, value] of Object.entries(documentData)) {
      // Skip complex objects for simplicity
      if (typeof value !== 'object') {
        if (currentDocument[key] !== value) {
          changes.push({
            field: key,
            oldValue: currentDocument[key],
            newValue: value
          });
        }
      }
    }
    
    // Log document update
    await logService.createLog({
      user: userId,
      action: 'update',
      entity: 'document',
      entityId: documentId,
      description: 'Document updated',
      details: {
        documentNumber: currentDocument.documentNumber,
        changes
      }
    });
    
    return updatedDocument;
  }

  /**
   * Update document file (add new version)
   * @param {String} documentId - Document ID
   * @param {Object} fileData - File data
   * @param {String} userId - User updating the file
   * @param {String} changeNotes - Notes about the change
   * @returns {Promise<Object>} Updated document
   */
  async updateDocumentFile(documentId, fileData, userId, changeNotes = '') {
    objectId(documentId);
    objectId(userId);
    
    if (!fileData || !fileData.filename) {
      throw ValidationError.requiredField('file');
    }
    
    const document = await this.documentRepository.findById(documentId);
    
    if (document.status === DOCUMENT_STATUS.DELETED) {
      throw ApiError.forbidden(
        'Deleted documents cannot be updated',
        'AUTH_RESOURCE_ACCESS_DENIED'
      );
    }
    
    // Add new version
    const updatedDocument = await this.documentRepository.addVersion(documentId, {
      filename: fileData.filename,
      originalFilename: fileData.originalname,
      path: fileData.path,
      contentType: fileData.mimetype,
      size: fileData.size,
      uploadedBy: userId,
      changeNotes
    });
    
    // Log document file update
    await logService.createLog({
      user: userId,
      action: 'update_file',
      entity: 'document',
      entityId: documentId,
      description: 'Document file updated',
      details: {
        documentNumber: document.documentNumber,
        version: updatedDocument.metadata.version,
        filename: fileData.originalname,
        changeNotes
      }
    });
    
    return updatedDocument;
  }

  /**
   * Log document access
   * @param {String} documentId - Document ID
   * @param {String} userId - User accessing the document
   * @param {String} accessMethod - Access method
   * @param {String} ipAddress - IP address
   * @returns {Promise<Object>} Updated document
   */
  async logDocumentAccess(documentId, userId, accessMethod, ipAddress) {
    objectId(documentId);
    
    // Log access
    const updatedDocument = await this.documentRepository.logAccess(documentId, {
      user: userId,
      accessedAt: new Date(),
      ipAddress,
      accessMethod
    });
    
    // Log document access
    await logService.createLog({
      user: userId,
      action: 'access',
      entity: 'document',
      entityId: documentId,
      description: 'Document accessed',
      metadata: {
        ip: ipAddress,
        method: accessMethod
      }
    });
    
    return updatedDocument;
  }

  /**
   * Get document file
   * @param {String} documentId - Document ID
   * @param {String} userId - User requesting the file
   * @param {String} ipAddress - IP address
   * @returns {Promise<Object>} Document file data
   */
  async getDocumentFile(documentId, userId, ipAddress) {
    objectId(documentId);
    
    const document = await this.documentRepository.findById(documentId);
    
    if (document.status === DOCUMENT_STATUS.DELETED) {
      throw ApiError.notFound('Document not found');
    }
    
    // Log access
    await this.logDocumentAccess(documentId, userId, 'download', ipAddress);
    
    // Get file path
    const filePath = path.join(uploadConfig.destination, document.file.path);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      throw ApiError.notFound('Document file not found');
    }
    
    return {
      path: filePath,
      filename: document.file.originalFilename || document.file.filename,
      contentType: document.file.contentType
    };
  }

  /**
   * Get document file by version
   * @param {String} documentId - Document ID
   * @param {Number} version - Version number
   * @param {String} userId - User requesting the file
   * @param {String} ipAddress - IP address
   * @returns {Promise<Object>} Document file data
   */
  async getDocumentFileByVersion(documentId, version, userId, ipAddress) {
    objectId(documentId);
    
    const document = await this.documentRepository.findById(documentId);
    
    if (document.status === DOCUMENT_STATUS.DELETED) {
      throw ApiError.notFound('Document not found');
    }
    
    // Log access
    await this.logDocumentAccess(documentId, userId, 'download', ipAddress);
    
    // Find requested version
    const versionDoc = document.versions.find(v => v.version === parseInt(version));
    
    if (!versionDoc) {
      throw ApiError.notFound(`Document version ${version} not found`);
    }
    
    // Get file path
    const filePath = path.join(uploadConfig.destination, versionDoc.path);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      throw ApiError.notFound('Document file not found');
    }
    
    return {
      path: filePath,
      filename: versionDoc.filename,
      contentType: document.file.contentType // Assuming content type is the same
    };
  }

  /**
   * Update document status
   * @param {String} documentId - Document ID
   * @param {String} status - New status
   * @param {String} userId - User updating the status
   * @returns {Promise<Object>} Updated document
   */
  async updateDocumentStatus(documentId, status, userId) {
    objectId(documentId);
    objectId(userId);
    
    if (!Object.values(DOCUMENT_STATUS).includes(status)) {
      throw ValidationError.invalidInput(`Invalid status: ${status}`);
    }
    
    // Get current status for change tracking
    const currentDocument = await this.documentRepository.findById(documentId);
    const oldStatus = currentDocument.status;
    
    // Update status
    const updatedDocument = await this.documentRepository.updateById(documentId, { status });
    
    // Log status change
    await logService.createLog({
      user: userId,
      action: 'update_status',
      entity: 'document',
      entityId: documentId,
      description: `Document status changed from ${oldStatus} to ${status}`,
      details: {
        documentNumber: currentDocument.documentNumber,
        changes: [
          {
            field: 'status',
            oldValue: oldStatus,
            newValue: status
          }
        ]
      }
    });
    
    return updatedDocument;
  }

  /**
   * Delete document
   * @param {String} documentId - Document ID
   * @param {String} deletedById - ID of user performing the delete
   * @returns {Promise<Boolean>} Delete success
   */
  async deleteDocument(documentId, deletedById) {
    objectId(documentId);
    objectId(deletedById);
    
    // Soft delete document
    await this.documentRepository.deleteById(documentId, {
      softDelete: true,
      deletedBy: deletedById
    });
    
    // Log document deletion
    await logService.createLog({
      user: deletedById,
      action: 'delete',
      entity: 'document',
      entityId: documentId,
      description: 'Document deleted'
    });
    
    return true;
  }

  /**
   * Get documents by category
   * @param {String} category - Category
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Documents in category
   */
  async getDocumentsByCategory(category, options = {}) {
    if (!category) {
      throw ValidationError.requiredField('category');
    }
    
    return this.documentRepository.findByCategory(category, {
      populate: [
        { path: 'metadata.author', select: 'email role' },
        { path: 'metadata.department', select: 'name code' }
      ],
      ...options
    });
  }

  /**
   * Get documents by author
   * @param {String} authorId - Author ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Documents by author
   */
  async getDocumentsByAuthor(authorId, options = {}) {
    objectId(authorId);
    
    return this.documentRepository.findByAuthor(authorId, {
      populate: [
        { path: 'metadata.department', select: 'name code' }
      ],
      ...options
    });
  }

  /**
   * Get documents by department
   * @param {String} departmentId - Department ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Documents in department
   */
  async getDocumentsByDepartment(departmentId, options = {}) {
    objectId(departmentId);
    
    return this.documentRepository.findByDepartment(departmentId, {
      populate: [
        { path: 'metadata.author', select: 'email role' }
      ],
      ...options
    });
  }

  /**
   * Get documents with pagination
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated documents
   */
  async getDocuments(filter = {}, options = {}) {
    // Exclude deleted documents by default
    const combinedFilter = {
      isDeleted: { $ne: true },
      ...filter
    };
    
    return this.documentRepository.paginate(combinedFilter, {
      populate: [
        { path: 'metadata.author', select: 'email role' },
        { path: 'metadata.department', select: 'name code' }
      ],
      ...options
    });
  }

  /**
   * Search documents
   * @param {String} query - Search query
   * @param {Object} filter - Additional filter
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async searchDocuments(query, filter = {}, options = {}) {
    if (!query || query.trim().length < 2) {
      throw ValidationError.invalidInput('Search query must be at least 2 characters');
    }
    
    return this.documentRepository.search(query, filter, {
      populate: [
        { path: 'metadata.author', select: 'email role' },
        { path: 'metadata.department', select: 'name code' }
      ],
      ...options
    });
  }
}

module.exports = new DocumentService();