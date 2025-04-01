// src/repositories/document.repository.js
const Document = require('../models/document.model');
const BaseRepository = require('./base.repository');
const { DatabaseError } = require('../errors/database.error');

/**
 * Repository for Document operations
 */
class DocumentRepository extends BaseRepository {
  constructor() {
    super(Document, 'Document');
  }

  /**
   * Find document by document number
   * @param {String} documentNumber - Document number
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Document
   */
  async findByDocumentNumber(documentNumber, options = {}) {
    return this.findOne({ documentNumber }, options);
  }

  /**
   * Find document by QR code
   * @param {String} qrCode - QR code
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Document
   */
  async findByQRCode(qrCode, options = {}) {
    return this.findOne({ 'qrCode.code': qrCode }, options);
  }

  /**
   * Find documents by category
   * @param {String} category - Category
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Documents
   */
  async findByCategory(category, options = {}) {
    return this.findAll({ 
      category,
      isDeleted: { $ne: true }
    }, options);
  }

  /**
   * Find documents by author
   * @param {String|ObjectId} authorId - Author ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Documents
   */
  async findByAuthor(authorId, options = {}) {
    return this.findAll({ 
      'metadata.author': authorId,
      isDeleted: { $ne: true }
    }, options);
  }

  /**
   * Find documents by department
   * @param {String|ObjectId} departmentId - Department ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Documents
   */
  async findByDepartment(departmentId, options = {}) {
    return this.findAll({ 
      'metadata.department': departmentId,
      isDeleted: { $ne: true }
    }, options);
  }

  /**
   * Find documents by tags
   * @param {Array|String} tags - Tag or tags array
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Documents
   */
  async findByTags(tags, options = {}) {
    const tagsArray = Array.isArray(tags) ? tags : [tags];
    
    return this.findAll({ 
      'metadata.tags': { $in: tagsArray },
      isDeleted: { $ne: true }
    }, options);
  }

  /**
   * Log document access
   * @param {String|ObjectId} documentId - Document ID
   * @param {Object} accessData - Access log data
   * @returns {Promise<Object>} Updated document
   */
  async logAccess(documentId, accessData) {
    try {
      const document = await this.findById(documentId);
      
      document.accessLogs.push({
        ...accessData,
        accessedAt: new Date()
      });
      
      return await document.save();
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      throw DatabaseError.queryError(
        `Error logging document access: ${error.message}`,
        { error, documentId, accessData }
      );
    }
  }

  /**
   * Add a new version of the document
   * @param {String|ObjectId} documentId - Document ID
   * @param {Object} versionData - Version data
   * @returns {Promise<Object>} Updated document
   */
  async addVersion(documentId, versionData) {
    try {
      const document = await this.findById(documentId);
      
      // Get the next version number
      const currentVersion = document.metadata.version || 1;
      const nextVersion = currentVersion + 1;
      
      // Update current file as the latest version
      const currentVersionData = {
        version: currentVersion,
        filename: document.file.filename,
        path: document.file.path,
        size: document.file.size,
        uploadedAt: document.file.uploadedAt,
        uploadedBy: versionData.uploadedBy,
        changeNotes: versionData.changeNotes || 'Version update'
      };
      
      // Add current version to versions array
      document.versions.push(currentVersionData);
      
      // Update file with new version data
      document.file = {
        filename: versionData.filename,
        originalFilename: versionData.originalFilename || versionData.filename,
        path: versionData.path,
        contentType: versionData.contentType,
        size: versionData.size,
        uploadedAt: new Date()
      };
      
      // Update version number in metadata
      document.metadata.version = nextVersion;
      
      return await document.save();
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      throw DatabaseError.queryError(
        `Error adding document version: ${error.message}`,
        { error, documentId, versionData }
      );
    }
  }

  /**
   * Search documents
   * @param {String} query - Search query
   * @param {Object} filter - Additional filter criteria
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async search(query, filter = {}, options = {}) {
    try {
      const searchFilter = {
        $or: [
          { documentNumber: { $regex: query, $options: 'i' } },
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { 'metadata.tags': { $regex: query, $options: 'i' } }
        ],
        isDeleted: { $ne: true },
        ...filter
      };
      
      // If the query looks like a document number
      if (/^DOC-[A-Z0-9]+$/i.test(query)) {
        searchFilter.$or.unshift({ documentNumber: query.toUpperCase() });
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
        `Error searching documents: ${error.message}`,
        { error, query, filter }
      );
    }
  }
}

module.exports = DocumentRepository;