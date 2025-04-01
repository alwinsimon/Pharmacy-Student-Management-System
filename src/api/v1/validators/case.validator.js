// src/api/v1/validators/case.validator.js
const Joi = require('joi');
const { status: { CASE_STATUS } } = require('../../../constants');

// Create case validation schema
const createCaseSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'Title is required'
  }),
  department: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().messages({
    'string.pattern.base': 'Department must be a valid ObjectId'
  }),
  // Student is optional in schema as it will be set from auth token for student users
  student: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().messages({
    'string.pattern.base': 'Student must be a valid ObjectId'
  }),
  // Clinical case specific fields
  patientInfo: Joi.object({
    age: Joi.number().integer().min(0).max(120).optional(),
    gender: Joi.string().valid('male', 'female', 'other', 'unknown').optional(),
    weight: Joi.number().min(0).optional(),
    height: Joi.number().min(0).optional(),
    anonymizedId: Joi.string().optional(),
    chiefComplaint: Joi.string().optional(),
    presentingSymptoms: Joi.array().items(Joi.string()).optional(),
    diagnosisCode: Joi.string().optional()
  }).optional(),
  medicalHistory: Joi.object({
    pastMedicalHistory: Joi.string().optional(),
    allergies: Joi.array().items(Joi.string()).optional(),
    medications: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        dosage: Joi.string().optional(),
        frequency: Joi.string().optional(),
        duration: Joi.string().optional(),
        purpose: Joi.string().optional()
      })
    ).optional()
  }).optional(),
  caseDetails: Joi.object({
    assessment: Joi.string().optional(),
    diagnosis: Joi.array().items(Joi.string()).optional(),
    treatmentPlan: Joi.string().optional(),
    interventions: Joi.array().items(
      Joi.object({
        type: Joi.string().required(),
        description: Joi.string().required(),
        outcome: Joi.string().optional(),
        date: Joi.date().optional()
      })
    ).optional(),
    notes: Joi.string().optional(),
    references: Joi.array().items(
      Joi.object({
        citation: Joi.string().required(),
        link: Joi.string().optional()
      })
    ).optional()
  }).optional(),
  // SOAP note structure
  soapNote: Joi.object({
    subjective: Joi.string().optional(),
    objective: Joi.string().optional(),
    assessment: Joi.string().optional(),
    plan: Joi.string().optional()
  }).optional()
});

// Update case validation schema
const updateCaseSchema = Joi.object({
  title: Joi.string().optional(),
  // Clinical case specific fields - similar to create schema but all fields optional
  patientInfo: Joi.object({
    age: Joi.number().integer().min(0).max(120).optional(),
    gender: Joi.string().valid('male', 'female', 'other', 'unknown').optional(),
    weight: Joi.number().min(0).optional(),
    height: Joi.number().min(0).optional(),
    anonymizedId: Joi.string().optional(),
    chiefComplaint: Joi.string().optional(),
    presentingSymptoms: Joi.array().items(Joi.string()).optional(),
    diagnosisCode: Joi.string().optional()
  }).optional(),
  medicalHistory: Joi.object({
    pastMedicalHistory: Joi.string().optional(),
    allergies: Joi.array().items(Joi.string()).optional(),
    medications: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        dosage: Joi.string().optional(),
        frequency: Joi.string().optional(),
        duration: Joi.string().optional(),
        purpose: Joi.string().optional()
      })
    ).optional()
  }).optional(),
  caseDetails: Joi.object({
    assessment: Joi.string().optional(),
    diagnosis: Joi.array().items(Joi.string()).optional(),
    treatmentPlan: Joi.string().optional(),
    interventions: Joi.array().items(
      Joi.object({
        type: Joi.string().required(),
        description: Joi.string().required(),
        outcome: Joi.string().optional(),
        date: Joi.date().optional()
      })
    ).optional(),
    notes: Joi.string().optional(),
    references: Joi.array().items(
      Joi.object({
        citation: Joi.string().required(),
        link: Joi.string().optional()
      })
    ).optional()
  }).optional(),
  // SOAP note structure
  soapNote: Joi.object({
    subjective: Joi.string().optional(),
    objective: Joi.string().optional(),
    assessment: Joi.string().optional(),
    plan: Joi.string().optional()
  }).optional()
});

// Revision request validation schema
const revisionRequestSchema = Joi.object({
  description: Joi.string().required().messages({
    'any.required': 'Revision description is required'
  })
});

// Evaluation validation schema
const evaluationSchema = Joi.object({
  score: Joi.number().required().min(0).messages({
    'any.required': 'Score is required',
    'number.min': 'Score must be a positive number'
  }),
  maxScore: Joi.number().min(0).default(100).messages({
    'number.min': 'Max score must be a positive number'
  }),
  feedback: Joi.string().optional(),
  rubricItems: Joi.array().items(
    Joi.object({
      criterion: Joi.string().required(),
      score: Joi.number().required().min(0),
      maxScore: Joi.number().required().min(0),
      comments: Joi.string().optional()
    })
  ).optional()
});

// Update status validation schema
const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(CASE_STATUS)).required().messages({
    'any.required': 'Status is required',
    'string.valid': 'Invalid status value'
  })
});

module.exports = {
  createCaseSchema,
  updateCaseSchema,
  revisionRequestSchema,
  evaluationSchema,
  updateStatusSchema
};