// src/models/document.model.js
const mongoose = require('mongoose');
const { status: { DOCUMENT_STATUS } } = require('../constants');
const { nanoid } = require('nanoid');

const documentSchema = new mongoose.Schema({
  documentNumber: {
    type: String,
    unique: true,
    default: () => `DOC-${nanoid(10).toUpperCase()}`
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(DOCUMENT_STATUS),
    default: DOCUMENT_STATUS.ACTIVE
  },
  // File information
  file: {
    filename: {
      type: String,
      required: true
    },
    originalFilename: String,
    path: {
      type: String,
      required: true
    },
    contentType: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  // Document metadata
  metadata: {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    tags: [String],
    version: {
      type: Number,
      default: 1
    },
    relatedDocuments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    }],
    expiryDate: Date,
    isTemplate: {
      type: Boolean,
      default: false
    }
  },
  // Access control
  accessControl: {
    visibility: {
      type: String,
      enum: ['public', 'private', 'restricted'],
      default: 'private'
    },
    allowedRoles: [{
      type: String
    }],
    allowedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    allowedDepartments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    }]
  },
  // QR code information
  qrCode: {
    code: {
      type: String,
      default: () => nanoid(16)
    },
    url: String,
    generatedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date
  },
  // Version history
  versions: [{
    version: Number,
    filename: String,
    path: String,
    size: Number,
    uploadedAt: Date,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changeNotes: String
  }],
  // Access logs
  accessLogs: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    accessedAt: Date,
    ipAddress: String,
    accessMethod: {
      type: String,
      enum: ['direct', 'qrcode', 'link', 'download']
    }
  }],
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    }
  }
});

// Generate QR code URL before saving
documentSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('qrCode.code')) {
    // This would be set from the config in a real implementation
    const baseUrl = process.env.BASE_URL || 'https://pcms.example.com';
    this.qrCode.url = `${baseUrl}/qr/${this.qrCode.code}`;
  }
  next();
});

// Index for document number
documentSchema.index({ documentNumber: 1 });

// Index for category and subcategory
documentSchema.index({ category: 1, subcategory: 1 });

// Index for metadata fields
documentSchema.index({ 'metadata.author': 1 });
documentSchema.index({ 'metadata.department': 1 });
documentSchema.index({ 'metadata.tags': 1 });
documentSchema.index({ 'metadata.version': 1 });

// Index for QR code
documentSchema.index({ 'qrCode.code': 1 });

// Index for soft delete
documentSchema.index({ isDeleted: 1 });

// Text index for search
documentSchema.index({
  title: 'text',
  description: 'text',
  'metadata.tags': 'text'
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;