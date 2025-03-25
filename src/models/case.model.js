// src/models/case.model.js
const mongoose = require('mongoose');
const { status: { CASE_STATUS } } = require('../constants');
const { nanoid } = require('nanoid');

const caseSchema = new mongoose.Schema({
  caseNumber: {
    type: String,
    unique: true,
    default: () => `CASE-${nanoid(10).toUpperCase()}`
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: Object.values(CASE_STATUS),
    default: CASE_STATUS.DRAFT
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  // Clinical case specific fields
  patientInfo: {
    age: Number,
    gender: String,
    weight: Number,
    height: Number,
    anonymizedId: String, // For privacy
    chiefComplaint: String,
    presentingSymptoms: [String],
    diagnosisCode: String // ICD code
  },
  medicalHistory: {
    pastMedicalHistory: String,
    allergies: [String],
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      purpose: String
    }]
  },
  caseDetails: {
    assessment: String,
    diagnosis: [String],
    treatmentPlan: String,
    interventions: [{
      type: String,
      description: String,
      outcome: String,
      date: Date
    }],
    notes: String,
    references: [{
      citation: String,
      link: String
    }]
  },
  // SOAP note structure
  soapNote: {
    subjective: String,
    objective: String,
    assessment: String,
    plan: String
  },
  // Attachments
  attachments: [{
    filename: String,
    path: String,
    contentType: String,
    uploadedAt: Date,
    description: String
  }],
  // Review and evaluation
  evaluation: {
    score: Number,
    maxScore: Number,
    feedback: String,
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    evaluatedAt: Date,
    rubricItems: [{
      criterion: String,
      score: Number,
      maxScore: Number,
      comments: String
    }]
  },
  // Revision history
  revisionRequests: [{
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: Date,
    description: String,
    resolvedAt: Date
  }],
  // Workflow tracking
  workflowHistory: [{
    status: {
      type: String,
      enum: Object.values(CASE_STATUS)
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    comments: String
  }],
  // PDF report
  report: {
    generated: Boolean,
    generatedAt: Date,
    path: String,
    qrCode: String,
    accessCode: String
  },
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  // Soft delete flag
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

// Add workflowHistory entry when status changes
caseSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.workflowHistory.push({
      status: this.status,
      changedAt: new Date(),
      changedBy: this.modifiedBy // This should be set before saving
    });
  }
  next();
});

// Indexes for efficient queries
caseSchema.index({ caseNumber: 1 });
caseSchema.index({ student: 1 });
caseSchema.index({ assignedTo: 1 });
caseSchema.index({ status: 1 });
caseSchema.index({ department: 1 });
caseSchema.index({ isDeleted: 1 });
caseSchema.index({ 'evaluation.evaluatedBy': 1 });

// Text index for search
caseSchema.index({ 
  title: 'text', 
  'caseDetails.assessment': 'text', 
  'caseDetails.diagnosis': 'text',
  'soapNote.assessment': 'text'
});

const Case = mongoose.model('Case', caseSchema);

module.exports = Case;