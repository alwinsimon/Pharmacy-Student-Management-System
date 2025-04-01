// src/models/token.model.js
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['refresh', 'access', 'verification', 'passwordReset'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  blacklisted: {
    type: Boolean,
    default: false
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    lastUsed: Date
  }
}, {
  timestamps: true
});

// Index for token
tokenSchema.index({ token: 1 });

// Index for user and type
tokenSchema.index({ user: 1, type: 1 });

// Index for expiration
tokenSchema.index({ expiresAt: 1 });

// Index for blacklisted tokens
tokenSchema.index({ blacklisted: 1 });

// TTL index to automatically remove expired tokens
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;