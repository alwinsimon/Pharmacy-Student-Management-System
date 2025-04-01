// src/models/log.model.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true
  },
  entity: {
    type: String,
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  description: {
    type: String,
    required: true
  },
  details: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    changes: [
      {
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed
      }
    ]
  },
  metadata: {
    ip: String,
    userAgent: String,
    requestId: String,
    method: String,
    path: String,
    statusCode: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for user lookups
activityLogSchema.index({ user: 1 });

// Index for entity and entityId lookups
activityLogSchema.index({ entity: 1, entityId: 1 });

// Index for timestamp for log retrieval with date filters
activityLogSchema.index({ timestamp: -1 });

// Compound index for action and entity
activityLogSchema.index({ action: 1, entity: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;