// src/models/notification.model.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'system', 
      'case_update', 
      'document_update', 
      'user_update', 
      'approval_request',
      'approval_result',
      'assignment',
      'reminder'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  relatedEntity: {
    type: String,
    enum: ['user', 'case', 'document', 'department']
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  // For email notifications
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for recipient for quick notification retrieval
notificationSchema.index({ recipient: 1, createdAt: -1 });

// Index for read status
notificationSchema.index({ recipient: 1, isRead: 1 });

// Index for related entity
notificationSchema.index({ relatedEntity: 1, relatedEntityId: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;