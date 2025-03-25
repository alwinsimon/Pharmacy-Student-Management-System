// src/models/department.model.js
const mongoose = require('mongoose');
const { status: { DEPARTMENT_STATUS } } = require('../constants');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(DEPARTMENT_STATUS),
    default: DEPARTMENT_STATUS.ACTIVE
  },
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  parentDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  logo: {
    filename: String,
    path: String,
    contentType: String
  },
  contact: {
    email: String,
    phone: String,
    address: String
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
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

// Virtual for staff count
departmentSchema.virtual('staffCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'department',
  count: true,
  match: { role: 'staff' }
});

// Virtual for student count
departmentSchema.virtual('studentCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'department',
  count: true,
  match: { role: 'student' }
});

// Index for code and name
departmentSchema.index({ code: 1 });
departmentSchema.index({ name: 1 });

// Index for hierarchical queries
departmentSchema.index({ parentDepartment: 1 });

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;