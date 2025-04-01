// src/models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { auth: { password: passwordConfig } } = require('../config');
const { status: { USER_STATUS }, roles: { ROLES } } = require('../constants');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: true,
    minlength: passwordConfig.minLength,
    select: false
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.STUDENT,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(USER_STATUS),
    default: USER_STATUS.PENDING,
    required: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    token: String,
    expiresAt: Date
  },
  passwordResetToken: {
    token: String,
    expiresAt: Date
  },
  lastLogin: {
    date: Date,
    ip: String
  },
  failedLoginAttempts: {
    count: {
      type: Number,
      default: 0
    },
    lastAttempt: Date,
    lockedUntil: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  permissions: [{
    type: String
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.password;
      delete ret.verificationToken;
      delete ret.passwordResetToken;
      delete ret.__v;
      return ret;
    }
  }
});

// Create index for email to improve lookup performance
userSchema.index({ email: 1 });

// Index for role and department for role-based queries
userSchema.index({ role: 1, department: 1 });

// Index for status to query users by status efficiently
userSchema.index({ status: 1 });

// Password hash middleware
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified or is new
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(passwordConfig.saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password validation method
userSchema.methods.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Check if account is locked
userSchema.methods.isAccountLocked = function() {
  if (!this.failedLoginAttempts.lockedUntil) return false;
  return new Date() < this.failedLoginAttempts.lockedUntil;
};

// Method to increment failed login attempts
userSchema.methods.incrementFailedLoginAttempts = async function() {
  this.failedLoginAttempts.count += 1;
  this.failedLoginAttempts.lastAttempt = new Date();
  
  // Lock account after 5 consecutive failed attempts
  if (this.failedLoginAttempts.count >= 5) {
    // Lock for 30 minutes
    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + 30);
    this.failedLoginAttempts.lockedUntil = lockUntil;
  }
  
  await this.save();
};

// Method to reset failed login attempts
userSchema.methods.resetFailedLoginAttempts = async function() {
  this.failedLoginAttempts.count = 0;
  this.failedLoginAttempts.lastAttempt = null;
  this.failedLoginAttempts.lockedUntil = null;
  await this.save();
};

// Method to update last login
userSchema.methods.updateLastLogin = async function(ip) {
  this.lastLogin = {
    date: new Date(),
    ip: ip
  };
  await this.save();
};

// Static method to find user by email with password
userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email }).select('+password');
};

const User = mongoose.model('User', userSchema);

module.exports = User;