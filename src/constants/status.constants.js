// src/constants/status.constants.js
/**
 * Status constants for various entities
 */
// User account statuses
const USER_STATUS = {
  PENDING: 'pending',          // Initial registration, not verified
  VERIFIED: 'verified',        // Email verified, awaiting approval
  ACTIVE: 'active',            // Approved and active
  INACTIVE: 'inactive',        // Temporarily inactive
  SUSPENDED: 'suspended',      // Suspended by admin
  DELETED: 'deleted'           // Soft deleted
};

// Clinical case statuses
const CASE_STATUS = {
  DRAFT: 'draft',              // In progress by student
  SUBMITTED: 'submitted',      // Submitted awaiting review
  ASSIGNED: 'assigned',        // Assigned to staff for review
  IN_REVIEW: 'in_review',      // Currently being reviewed
  REVISION_REQUESTED: 'revision_requested', // Changes requested
  COMPLETED: 'completed',      // Review completed
  ARCHIVED: 'archived'         // Archived case
};

// Document statuses
const DOCUMENT_STATUS = {
  ACTIVE: 'active',            // Active and available
  INACTIVE: 'inactive',        // Temporarily inactive
  ARCHIVED: 'archived',        // Archived document
  DELETED: 'deleted'           // Soft deleted
};

// Department statuses
const DEPARTMENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

// HTTP status codes with descriptions
const HTTP_STATUS = {
  OK: { code: 200, message: 'Success' },
  CREATED: { code: 201, message: 'Created successfully' },
  ACCEPTED: { code: 202, message: 'Request accepted' },
  NO_CONTENT: { code: 204, message: 'No content' },
  BAD_REQUEST: { code: 400, message: 'Bad request' },
  UNAUTHORIZED: { code: 401, message: 'Unauthorized' },
  FORBIDDEN: { code: 403, message: 'Forbidden' },
  NOT_FOUND: { code: 404, message: 'Not found' },
  METHOD_NOT_ALLOWED: { code: 405, message: 'Method not allowed' },
  CONFLICT: { code: 409, message: 'Conflict' },
  UNPROCESSABLE_ENTITY: { code: 422, message: 'Unprocessable entity' },
  INTERNAL_SERVER_ERROR: { code: 500, message: 'Internal server error' },
  SERVICE_UNAVAILABLE: { code: 503, message: 'Service unavailable' }
};

module.exports = {
  USER_STATUS,
  CASE_STATUS,
  DOCUMENT_STATUS,
  DEPARTMENT_STATUS,
  HTTP_STATUS
};