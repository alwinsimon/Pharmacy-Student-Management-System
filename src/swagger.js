// src/swagger.js - Main Swagger definition file

const swaggerJsDoc = require('swagger-jsdoc');

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pharmacy College Management System API',
      version: '1.0.0',
      description: 'API documentation for Pharmacy College Management System',
      contact: {
        name: 'API Support',
        email: 'support@pcms.example.com'
      }
    },
    servers: [
      {
        url: '{protocol}://{hostname}:{port}/api/v1',
        variables: {
          protocol: {
            enum: ['http', 'https'],
            default: 'http'
          },
          hostname: {
            default: 'localhost'
          },
          port: {
            default: '3000'
          }
        }
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        // Response schemas
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                type: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'object' },
                timestamp: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        },
        
        // Auth schemas
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['super_admin', 'manager', 'staff', 'student'] },
            status: { type: 'string', enum: ['pending', 'verified', 'active', 'inactive', 'suspended', 'deleted'] },
            department: { type: 'string' },
            profile: {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                middleName: { type: 'string' }
              }
            }
          }
        },
        
        // Case schemas
        Case: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            caseNumber: { type: 'string' },
            title: { type: 'string' },
            student: { type: 'string' },
            assignedTo: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'submitted', 'assigned', 'in_review', 'revision_requested', 'completed', 'archived'] },
            department: { type: 'string' },
            patientInfo: {
              type: 'object',
              properties: {
                age: { type: 'integer' },
                gender: { type: 'string' },
                weight: { type: 'number' },
                height: { type: 'number' },
                chiefComplaint: { type: 'string' }
              }
            },
            soapNote: {
              type: 'object',
              properties: {
                subjective: { type: 'string' },
                objective: { type: 'string' },
                assessment: { type: 'string' },
                plan: { type: 'string' }
              }
            }
          }
        },
        
        // Document schemas
        Document: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            documentNumber: { type: 'string' },
            title: { type: 'string' },
            category: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string' },
            file: {
              type: 'object',
              properties: {
                filename: { type: 'string' },
                path: { type: 'string' },
                contentType: { type: 'string' },
                size: { type: 'number' }
              }
            },
            metadata: {
              type: 'object',
              properties: {
                author: { type: 'string' },
                department: { type: 'string' },
                version: { type: 'number' }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'API for user authentication'
      },
      {
        name: 'Users',
        description: 'API for user management'
      },
      {
        name: 'Cases',
        description: 'API for clinical case management'
      },
      {
        name: 'Documents',
        description: 'API for document management'
      },
      {
        name: 'QR Codes',
        description: 'API for QR code generation and access'
      },
      {
        name: 'Dashboard',
        description: 'API for dashboard analytics'
      }
    ]
  },
  apis: [
    './src/api/v1/routes/*.js',
    './src/swagger/*.js'  // Additional swagger documentation files
  ]
};

module.exports = swaggerJsDoc(swaggerOptions);