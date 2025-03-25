// src/repositories/base.repository.js
const { DatabaseError } = require('../errors/database.error');

/**
 * Base Repository class for common database operations
 * Implements the repository pattern for data access abstraction
 */
class BaseRepository {
  /**
   * Create a new repository instance
   * @param {mongoose.Model} model - Mongoose model
   * @param {String} entityName - Name of the entity for error messages
   */
  constructor(model, entityName) {
    this.model = model;
    this.entityName = entityName || model.modelName;
  }

  /**
   * Create a new document
   * @param {Object} data - Document data
   * @returns {Promise<Object>} Created document
   */
  async create(data) {
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error) {
      throw DatabaseError.queryError(
        `Error creating ${this.entityName}: ${error.message}`,
        { error, data }
      );
    }
  }

  /**
   * Find document by ID
   * @param {String|ObjectId} id - Document ID
   * @param {Object} options - Query options
   * @param {Boolean} options.throwIfNotFound - Throw error if not found
   * @param {String|Object} options.populate - Population options
   * @param {Object} options.select - Fields to select
   * @returns {Promise<Object>} Found document
   */
  async findById(id, options = {}) {
    try {
      const { throwIfNotFound = true, populate, select } = options;
      
      let query = this.model.findById(id);
      
      if (populate) {
        query = query.populate(populate);
      }
      
      if (select) {
        query = query.select(select);
      }
      
      const document = await query.exec();
      
      if (!document && throwIfNotFound) {
        throw DatabaseError.notFound(this.entityName, id);
      }
      
      return document;
    } catch (error) {
      if (error.name === 'CastError') {
        throw DatabaseError.notFound(this.entityName, id);
      }
      
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      throw DatabaseError.queryError(
        `Error finding ${this.entityName} by ID: ${error.message}`,
        { error, id }
      );
    }
  }

  /**
   * Find all documents matching filter criteria
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options
   * @param {Object} options.sort - Sort criteria
   * @param {Number} options.limit - Limit results
   * @param {Number} options.skip - Skip results
   * @param {String|Object} options.populate - Population options
   * @param {Object} options.select - Fields to select
   * @returns {Promise<Array>} Found documents
   */
  async findAll(filter = {}, options = {}) {
    try {
      const { sort, limit, skip, populate, select } = options;
      
      let query = this.model.find(filter);
      
      if (sort) {
        query = query.sort(sort);
      }
      
      if (skip) {
        query = query.skip(skip);
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      if (populate) {
        query = query.populate(populate);
      }
      
      if (select) {
        query = query.select(select);
      }
      
      return await query.exec();
    } catch (error) {
      throw DatabaseError.queryError(
        `Error finding ${this.entityName} documents: ${error.message}`,
        { error, filter, options }
      );
    }
  }

  /**
   * Find one document matching filter criteria
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options
   * @param {Boolean} options.throwIfNotFound - Throw error if not found
   * @param {String|Object} options.populate - Population options
   * @param {Object} options.select - Fields to select
   * @returns {Promise<Object>} Found document
   */
  async findOne(filter, options = {}) {
    try {
      const { throwIfNotFound = true, populate, select } = options;
      
      let query = this.model.findOne(filter);
      
      if (populate) {
        query = query.populate(populate);
      }
      
      if (select) {
        query = query.select(select);
      }
      
      const document = await query.exec();
      
      if (!document && throwIfNotFound) {
        throw DatabaseError.notFound(this.entityName, JSON.stringify(filter));
      }
      
      return document;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      throw DatabaseError.queryError(
        `Error finding ${this.entityName} document: ${error.message}`,
        { error, filter }
      );
    }
  }

  /**
   * Update document by ID
   * @param {String|ObjectId} id - Document ID
   * @param {Object} data - Update data
   * @param {Object} options - Update options
   * @param {Boolean} options.throwIfNotFound - Throw error if not found
   * @param {Boolean} options.returnOriginal - Return the original document
   * @param {String|Object} options.populate - Population options
   * @returns {Promise<Object>} Updated document
   */
  async updateById(id, data, options = {}) {
    try {
      const { 
        throwIfNotFound = true, 
        returnOriginal = false,
        populate 
      } = options;
      
      let query = this.model.findByIdAndUpdate(
        id,
        data,
        { 
          new: !returnOriginal, 
          runValidators: true 
        }
      );
      
      if (populate) {
        query = query.populate(populate);
      }
      
      const document = await query.exec();
      
      if (!document && throwIfNotFound) {
        throw DatabaseError.notFound(this.entityName, id);
      }
      
      return document;
    } catch (error) {
      if (error.name === 'CastError') {
        throw DatabaseError.notFound(this.entityName, id);
      }
      
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      throw DatabaseError.queryError(
        `Error updating ${this.entityName}: ${error.message}`,
        { error, id, data }
      );
    }
  }

  /**
   * Update documents matching filter
   * @param {Object} filter - Filter criteria
   * @param {Object} data - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Update result
   */
  async updateMany(filter, data, options = {}) {
    try {
      return await this.model.updateMany(filter, data, {
        runValidators: true,
        ...options
      });
    } catch (error) {
      throw DatabaseError.queryError(
        `Error updating multiple ${this.entityName} documents: ${error.message}`,
        { error, filter, data }
      );
    }
  }

  /**
   * Delete document by ID
   * @param {String|ObjectId} id - Document ID
   * @param {Object} options - Delete options
   * @param {Boolean} options.throwIfNotFound - Throw error if not found
   * @param {Boolean} options.softDelete - Use soft delete if available
   * @param {Object} options.deletedBy - User who deleted the document
   * @returns {Promise<Object>} Deleted document
   */
  async deleteById(id, options = {}) {
    try {
      const { 
        throwIfNotFound = true, 
        softDelete = true,
        deletedBy = null
      } = options;
      
      // Check if the model has isDeleted field for soft delete
      const hasIsDeletedField = this.model.schema.path('isDeleted') !== undefined;
      
      if (softDelete && hasIsDeletedField) {
        // Soft delete
        const data = {
          isDeleted: true,
          deletedAt: new Date()
        };
        
        if (deletedBy) {
          data.deletedBy = deletedBy;
        }
        
        return await this.updateById(id, data, { throwIfNotFound });
      } else {
        // Hard delete
        const document = await this.model.findByIdAndDelete(id);
        
        if (!document && throwIfNotFound) {
          throw DatabaseError.notFound(this.entityName, id);
        }
        
        return document;
      }
    } catch (error) {
      if (error.name === 'CastError') {
        throw DatabaseError.notFound(this.entityName, id);
      }
      
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      throw DatabaseError.queryError(
        `Error deleting ${this.entityName}: ${error.message}`,
        { error, id }
      );
    }
  }

  /**
   * Delete documents matching filter
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Delete options
   * @param {Boolean} options.softDelete - Use soft delete if available
   * @param {Object} options.deletedBy - User who deleted the document
   * @returns {Promise<Object>} Delete result
   */
  async deleteMany(filter, options = {}) {
    try {
      const { 
        softDelete = true,
        deletedBy = null
      } = options;
      
      // Check if the model has isDeleted field for soft delete
      const hasIsDeletedField = this.model.schema.path('isDeleted') !== undefined;
      
      if (softDelete && hasIsDeletedField) {
        // Soft delete
        const data = {
          isDeleted: true,
          deletedAt: new Date()
        };
        
        if (deletedBy) {
          data.deletedBy = deletedBy;
        }
        
        return await this.updateMany(filter, data);
      } else {
        // Hard delete
        return await this.model.deleteMany(filter);
      }
    } catch (error) {
      throw DatabaseError.queryError(
        `Error deleting multiple ${this.entityName} documents: ${error.message}`,
        { error, filter }
      );
    }
  }

  /**
   * Count documents matching filter
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Number>} Document count
   */
  async count(filter = {}) {
    try {
      return await this.model.countDocuments(filter);
    } catch (error) {
      throw DatabaseError.queryError(
        `Error counting ${this.entityName} documents: ${error.message}`,
        { error, filter }
      );
    }
  }

  /**
   * Check if document exists
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Boolean>} True if document exists
   */
  async exists(filter) {
    try {
      return await this.model.exists(filter) !== null;
    } catch (error) {
      throw DatabaseError.queryError(
        `Error checking if ${this.entityName} exists: ${error.message}`,
        { error, filter }
      );
    }
  }

  /**
   * Paginate documents
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Pagination options
   * @param {Number} options.page - Page number (1-based)
   * @param {Number} options.limit - Items per page
   * @param {Object} options.sort - Sort criteria
   * @param {String|Object} options.populate - Population options
   * @param {Object} options.select - Fields to select
   * @returns {Promise<Object>} Pagination result
   */
  async paginate(filter = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sort = { createdAt: -1 },
        populate,
        select
      } = options;
      
      const skip = (page - 1) * limit;
      
      const [items, totalItems] = await Promise.all([
        this.findAll(filter, { sort, limit, skip, populate, select }),
        this.count(filter)
      ]);
      
      const totalPages = Math.ceil(totalItems / limit);
      
      return {
        items,
        meta: {
          totalItems,
          itemCount: items.length,
          itemsPerPage: limit,
          totalPages,
          currentPage: page
        }
      };
    } catch (error) {
      throw DatabaseError.queryError(
        `Error paginating ${this.entityName} documents: ${error.message}`,
        { error, filter, options }
      );
    }
  }
}

module.exports = BaseRepository;