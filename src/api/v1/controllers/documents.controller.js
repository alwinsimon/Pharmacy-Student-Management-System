// src/api/v1/controllers/documents.controller.js
const documentService = require('../../../services/document.service');
const notificationService = require('../../../services/notification.service');
const { asyncHandler } = require('../../../utils/error.utils');
const { status: { HTTP_STATUS } } = require('../../../constants');
const { AuthError } = require('../../../errors/auth.error');
const { objectId } = require('../../../utils/validation.utils');

/**
 * Get all documents with pagination
 * @route GET /api/v1/documents
 */
const getDocuments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, status, department } = req.query;
  
  // Build filter
  const filter = {};
  
  if (category) {
    filter.category = category;
  }
  
  if (status) {
    filter.status = status;
  }
  
  if (department) {
    filter['metadata.department'] = department;
  }
  
  // Students can only view documents shared with them or public
  if (req.user.role === 'student') {
    filter['accessControl.visibility'] = { $in: ['public', 'restricted'] };
    
    // Add conditions for restricted documents
    filter.$or = [
      { 'accessControl.visibility': 'public' },
      { 'accessControl.allowedUsers': req.user.id },
      { 'accessControl.allowedRoles': req.user.role }
    ];
    
    if (req.user.department) {
      filter.$or.push({ 'accessControl.allowedDepartments': req.user.department });
    }
  }
  
  const documents = await documentService.getDocuments(filter, {
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Documents retrieved successfully',
    data: documents
  });
});

/**
 * Get document by ID
 * @route GET /api/v1/documents/:id
 */
const getDocumentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  
  const document = await documentService.getDocumentById(id);
  
  // Check if user has access to this document
  checkDocumentAccess(document, req.user);
  
  // Log document access
  await documentService.logDocumentAccess(id, req.user.id, 'direct', req.ip);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Document retrieved successfully',
    data: document
  });
});

/**
 * Get document by document number
 * @route GET /api/v1/documents/number/:documentNumber
 */
const getDocumentByNumber = asyncHandler(async (req, res) => {
  const { documentNumber } = req.params;
  
  const document = await documentService.getDocumentByNumber(documentNumber);
  
  // Check if user has access to this document
  checkDocumentAccess(document, req.user);
  
  // Log document access
  await documentService.logDocumentAccess(document._id, req.user.id, 'direct', req.ip);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Document retrieved successfully',
    data: document
  });
});

/**
 * Create a new document
 * @route POST /api/v1/documents
 */
const createDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new Error('Document file is required');
  }
  
  const documentData = req.body;
  
  // Set up metadata
  documentData.metadata = documentData.metadata || {};
  documentData.metadata.author = req.user.id;
  
  // Set department from user if not provided
  if (!documentData.metadata.department && req.user.department) {
    documentData.metadata.department = req.user.department;
  }
  
  // Set up access control if not provided
  documentData.accessControl = documentData.accessControl || {};
  documentData.accessControl.visibility = documentData.accessControl.visibility || 'private';
  
  // Set file data
  const fileData = {
    filename: req.file.filename,
    originalname: req.file.originalname,
    path: req.file.path.replace(`${process.cwd()}/src/uploads/`, ''),
    mimetype: req.file.mimetype,
    size: req.file.size
  };
  
  const document = await documentService.createDocument(documentData, fileData, req.user.id);
  
  res.status(HTTP_STATUS.CREATED.code).json({
    success: true,
    message: 'Document created successfully',
    data: document
  });
});

/**
 * Update document
 * @route PUT /api/v1/documents/:id
 */
const updateDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  const documentData = req.body;
  
  // Get document to check permissions
  const existingDocument = await documentService.getDocumentById(id);
  
  // Check if user has permission to update
  checkDocumentEditPermission(existingDocument, req.user);
  
  const updatedDocument = await documentService.updateDocument(id, documentData, req.user.id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Document updated successfully',
    data: updatedDocument
  });
});

/**
 * Update document file (add new version)
 * @route POST /api/v1/documents/:id/file
 */
const updateDocumentFile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  
  if (!req.file) {
    throw new Error('Document file is required');
  }
  
  // Get document to check permissions
  const existingDocument = await documentService.getDocumentById(id);
  
  // Check if user has permission to update
  checkDocumentEditPermission(existingDocument, req.user);
  
  // Set file data
  const fileData = {
    filename: req.file.filename,
    originalname: req.file.originalname,
    path: req.file.path.replace(`${process.cwd()}/src/uploads/`, ''),
    mimetype: req.file.mimetype,
    size: req.file.size
  };
  
  const changeNotes = req.body.changeNotes || '';
  
  const updatedDocument = await documentService.updateDocumentFile(id, fileData, req.user.id, changeNotes);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Document file updated successfully',
    data: {
      version: updatedDocument.metadata.version,
      file: updatedDocument.file
    }
  });
});

/**
 * Get document file
 * @route GET /api/v1/documents/:id/file
 */
const getDocumentFile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  
  const document = await documentService.getDocumentById(id);
  
  // Check if user has access to this document
  checkDocumentAccess(document, req.user);
  
  const fileData = await documentService.getDocumentFile(id, req.user.id, req.ip);
  
  res.download(fileData.path, fileData.filename, {
    headers: {
      'Content-Type': fileData.contentType
    }
  });
});

/**
 * Get document file by version
 * @route GET /api/v1/documents/:id/file/:version
 */
const getDocumentFileByVersion = asyncHandler(async (req, res) => {
  const { id, version } = req.params;
  objectId(id);
  
  if (!version || isNaN(parseInt(version))) {
    throw new Error('Valid version number is required');
  }
  
  const document = await documentService.getDocumentById(id);
  
  // Check if user has access to this document
  checkDocumentAccess(document, req.user);
  
  const fileData = await documentService.getDocumentFileByVersion(id, parseInt(version), req.user.id, req.ip);
  
  res.download(fileData.path, fileData.filename, {
    headers: {
      'Content-Type': fileData.contentType
    }
  });
});

/**
 * Update document status
 * @route PATCH /api/v1/documents/:id/status
 */
const updateDocumentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  const { status } = req.body;
  
  // Get document to check permissions
  const existingDocument = await documentService.getDocumentById(id);
  
  // Check if user has permission to update status
  // Authors, managers, and super admins can change status
  const isAuthor = existingDocument.metadata.author && 
                existingDocument.metadata.author.toString() === req.user.id;
  
  if (!isAuthor && !['super_admin', 'manager'].includes(req.user.role)) {
    throw AuthError.insufficientPermissions('You do not have permission to update this document status');
  }
  
  const updatedDocument = await documentService.updateDocumentStatus(id, status, req.user.id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Document status updated successfully',
    data: updatedDocument
  });
});

/**
 * Delete document
 * @route DELETE /api/v1/documents/:id
 */
const deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  
  // Get document to check permissions
  const existingDocument = await documentService.getDocumentById(id);
  
  // Check if user has permission to delete
  // Only author, managers, and super admins can delete
  const isAuthor = existingDocument.metadata.author && 
                existingDocument.metadata.author.toString() === req.user.id;
  
  if (!isAuthor && !['super_admin', 'manager'].includes(req.user.role)) {
    throw AuthError.insufficientPermissions('You do not have permission to delete this document');
  }
  
  await documentService.deleteDocument(id, req.user.id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Document deleted successfully'
  });
});

/**
 * Get documents by category
 * @route GET /api/v1/documents/category/:category
 */
const getDocumentsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  // Build filter
  const filter = { category };
  
  // Students can only view documents shared with them or public
  if (req.user.role === 'student') {
    filter['accessControl.visibility'] = { $in: ['public', 'restricted'] };
    
    // Add conditions for restricted documents
    filter.$or = [
      { 'accessControl.visibility': 'public' },
      { 'accessControl.allowedUsers': req.user.id },
      { 'accessControl.allowedRoles': req.user.role }
    ];
    
    if (req.user.department) {
      filter.$or.push({ 'accessControl.allowedDepartments': req.user.department });
    }
  }
  
  const documents = await documentService.getDocuments(filter, {
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Documents retrieved successfully',
    data: documents
  });
});

/**
 * Get documents by author
 * @route GET /api/v1/documents/author/:authorId
 */
const getDocumentsByAuthor = asyncHandler(async (req, res) => {
  const { authorId } = req.params;
  objectId(authorId);
  const { page = 1, limit = 10, category } = req.query;
  
  // Build filter
  const filter = { 'metadata.author': authorId };
  
  if (category) {
    filter.category = category;
  }
  
  // Students can only view their own documents or documents shared with them
  if (req.user.role === 'student' && authorId !== req.user.id) {
    filter['accessControl.visibility'] = { $in: ['public', 'restricted'] };
    
    // Add conditions for restricted documents
    filter.$or = [
      { 'accessControl.visibility': 'public' },
      { 'accessControl.allowedUsers': req.user.id },
      { 'accessControl.allowedRoles': req.user.role }
    ];
    
    if (req.user.department) {
      filter.$or.push({ 'accessControl.allowedDepartments': req.user.department });
    }
  }
  
  const documents = await documentService.getDocuments(filter, {
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Documents retrieved successfully',
    data: documents
  });
});

/**
 * Get documents by department
 * @route GET /api/v1/documents/department/:departmentId
 */
const getDocumentsByDepartment = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;
  objectId(departmentId);
  const { page = 1, limit = 10, category } = req.query;
  
  // Build filter
  const filter = { 'metadata.department': departmentId };
  
  if (category) {
    filter.category = category;
  }
  
  // Students can only view documents shared with them or public
  if (req.user.role === 'student') {
    filter['accessControl.visibility'] = { $in: ['public', 'restricted'] };
    
    // Add conditions for restricted documents
    filter.$or = [
      { 'accessControl.visibility': 'public' },
      { 'accessControl.allowedUsers': req.user.id },
      { 'accessControl.allowedRoles': req.user.role }
    ];
    
    if (req.user.department) {
      filter.$or.push({ 'accessControl.allowedDepartments': req.user.department });
    }
  }
  
  const documents = await documentService.getDocuments(filter, {
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Documents retrieved successfully',
    data: documents
  });
});

/**
 * Search documents
 * @route GET /api/v1/documents/search
 */
const searchDocuments = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 10, category, department } = req.query;
  
  if (!q) {
    throw new Error('Search query is required');
  }
  
  // Build filter
  const filter = {};
  
  if (category) {
    filter.category = category;
  }
  
  if (department) {
    filter['metadata.department'] = department;
  }
  
  // Students can only search documents shared with them or public
  if (req.user.role === 'student') {
    filter['accessControl.visibility'] = { $in: ['public', 'restricted'] };
    
    // Add conditions for restricted documents
    filter.$or = [
      { 'accessControl.visibility': 'public' },
      { 'accessControl.allowedUsers': req.user.id },
      { 'accessControl.allowedRoles': req.user.role }
    ];
    
    if (req.user.department) {
      filter.$or.push({ 'accessControl.allowedDepartments': req.user.department });
    }
  }
  
  const documents = await documentService.searchDocuments(q, filter, {
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Search results',
    data: documents
  });
});

/**
 * Share document with users
 * @route POST /api/v1/documents/:id/share
 */
const shareDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  const { userIds, visibility, roles, departments } = req.body;
  
  // Get document to check permissions
  const existingDocument = await documentService.getDocumentById(id);
  
  // Check if user has permission to share
  // Only author, managers, and super admins can share
  const isAuthor = existingDocument.metadata.author && 
                existingDocument.metadata.author.toString() === req.user.id;
  
  if (!isAuthor && !['super_admin', 'manager'].includes(req.user.role)) {
    throw AuthError.insufficientPermissions('You do not have permission to share this document');
  }
  
  // Update access control
  const updateData = {
    accessControl: {
      ...existingDocument.accessControl
    }
  };
  
  if (visibility) {
    updateData.accessControl.visibility = visibility;
  }
  
  if (roles && Array.isArray(roles)) {
    updateData.accessControl.allowedRoles = roles;
  }
  
  if (departments && Array.isArray(departments)) {
    updateData.accessControl.allowedDepartments = departments;
  }
  
  if (userIds && Array.isArray(userIds)) {
    updateData.accessControl.allowedUsers = userIds;
  }
  
  const updatedDocument = await documentService.updateDocument(id, updateData, req.user.id);
  
  // Send notifications to users
  if (userIds && userIds.length > 0) {
    await notificationService.sendDocumentSharedNotification(
      updatedDocument,
      userIds,
      req.user.id
    );
  }
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Document shared successfully',
    data: {
      accessControl: updatedDocument.accessControl
    }
  });
});

/**
 * Check if user has access to a document
 * @param {Object} document - Document object
 * @param {Object} user - User object
 * @throws {AuthError} If user does not have access
 */
const checkDocumentAccess = (document, user) => {
  // Super admins and managers have access to all documents
  if (['super_admin', 'manager'].includes(user.role)) {
    return true;
  }
  
  // Document author has access
  if (document.metadata.author && document.metadata.author.toString() === user.id) {
    return true;
  }
  
  // Check visibility
  if (document.accessControl) {
    // Public documents are accessible to everyone
    if (document.accessControl.visibility === 'public') {
      return true;
    }
    
    // Restricted documents require role, user, or department check
    if (document.accessControl.visibility === 'restricted') {
      // Check if user is in allowed users
      if (document.accessControl.allowedUsers && 
          document.accessControl.allowedUsers.some(id => id.toString() === user.id)) {
        return true;
      }
      
      // Check if user's role is in allowed roles
      if (document.accessControl.allowedRoles && 
          document.accessControl.allowedRoles.includes(user.role)) {
        return true;
      }
      
      // Check if user's department is in allowed departments
      if (document.accessControl.allowedDepartments && 
          user.department &&
          document.accessControl.allowedDepartments.some(id => id.toString() === user.department.toString())) {
        return true;
      }
    }
  }
  
  // If we get here, user does not have access
  throw AuthError.insufficientPermissions('You do not have access to this document');
};

/**
 * Check if user has permission to edit a document
 * @param {Object} document - Document object
 * @param {Object} user - User object
 * @throws {AuthError} If user does not have permission
 */
const checkDocumentEditPermission = (document, user) => {
  // Super admins and managers can edit all documents
  if (['super_admin', 'manager'].includes(user.role)) {
    return true;
  }
  
  // Document author can edit
  if (document.metadata.author && document.metadata.author.toString() === user.id) {
    return true;
  }
  
  // Staff can edit documents in their department
  if (user.role === 'staff' && 
      document.metadata.department && 
      user.department &&
      document.metadata.department.toString() === user.department.toString()) {
    return true;
  }
  
  // If we get here, user does not have permission to edit
  throw AuthError.insufficientPermissions('You do not have permission to edit this document');
};

module.exports = {
  getDocuments,
  getDocumentById,
  getDocumentByNumber,
  createDocument,
  updateDocument,
  updateDocumentFile,
  getDocumentFile,
  getDocumentFileByVersion,
  updateDocumentStatus,
  deleteDocument,
  getDocumentsByCategory,
  getDocumentsByAuthor,
  getDocumentsByDepartment,
  searchDocuments,
  shareDocument
};