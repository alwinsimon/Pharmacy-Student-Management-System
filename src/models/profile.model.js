// src/models/profile.model.js
const mongoose = require('mongoose');
const { status: { USER_STATUS } } = require('../constants');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  middleName: {
    type: String,
    trim: true
  },
  displayName: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  contactNumber: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  profilePicture: {
    filename: String,
    path: String,
    contentType: String,
    uploadedAt: Date
  },
  // Staff-specific fields
  staffDetails: {
    employeeId: {
      type: String,
      trim: true
    },
    designation: {
      type: String,
      trim: true
    },
    joiningDate: {
      type: Date
    },
    qualifications: [{
      degree: String,
      institution: String,
      year: Number,
      specialization: String
    }],
    specializations: [String]
  },
  // Student-specific fields
  studentDetails: {
    enrollmentId: {
      type: String,
      trim: true
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch'
    },
    enrollmentYear: {
      type: Number
    },
    currentSemester: {
      type: Number
    },
    academicStatus: {
      type: String,
      enum: ['active', 'on_leave', 'graduated', 'dropped']
    }
  },
  // Common fields for preferences
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      system: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      default: 'light'
    }
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

// Virtual for full name
profileSchema.virtual('fullName').get(function() {
  if (this.middleName) {
    return `${this.firstName} ${this.middleName} ${this.lastName}`;
  }
  return `${this.firstName} ${this.lastName}`;
});

// Index for user reference
profileSchema.index({ user: 1 });

// Compound index for student queries
profileSchema.index({ 'studentDetails.batch': 1, 'studentDetails.enrollmentYear': 1 });

// Compound index for staff queries
profileSchema.index({ 'staffDetails.designation': 1, 'staffDetails.joiningDate': 1 });

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;