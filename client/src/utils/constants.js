/**
 * Application constants
 */

// User roles
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh-token',
    LOGOUT: '/api/auth/logout',
  },
  USERS: {
    ME: '/api/users/me',
    LIST: '/api/users',
    DETAIL: (id) => `/api/users/${id}`,
  },
  CASES: {
    LIST: '/api/cases',
    DETAIL: (id) => `/api/cases/${id}`,
    SUBMIT: (id) => `/api/cases/${id}/submit`,
    EVALUATE: (id) => `/api/cases/${id}/evaluate`,
    COMMENTS: (id) => `/api/cases/${id}/comments`,
    ATTACHMENTS: (id) => `/api/cases/${id}/attachments`,
    PDF: (id) => `/api/cases/${id}/pdf`,
  },
  QUERIES: {
    LIST: '/api/queries',
    DETAIL: (id) => `/api/queries/${id}`,
    ASSIGN: (id) => `/api/queries/${id}/assign`,
    RESPOND: (id) => `/api/queries/${id}/respond`,
    EVALUATE: (id) => `/api/queries/${id}/evaluate`,
    PDF: (id) => `/api/queries/${id}/pdf`,
  },
  TESTS: {
    LIST: '/api/tests',
    DETAIL: (id) => `/api/tests/${id}`,
    QUESTIONS: (id) => `/api/tests/${id}/questions`,
    START: (id) => `/api/tests/${id}/start`,
    SUBMIT: (id) => `/api/tests/${id}/submit`,
    RESULTS: (id) => `/api/tests/${id}/results`,
    CLASS_RESULTS: (id) => `/api/tests/${id}/class-results`,
    PDF: (id) => `/api/tests/${id}/pdf`,
  },
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Status values
export const STATUS = {
  CASE: {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    IN_REVIEW: 'in review',
    REVISIONS_NEEDED: 'revisions needed',
    COMPLETED: 'completed',
  },
  QUERY: {
    DRAFT: 'draft',
    ASSIGNED: 'assigned',
    RESPONDED: 'responded',
    EVALUATED: 'evaluated',
  },
  TEST: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ACTIVE: 'active',
    COMPLETED: 'completed',
  },
};

// File upload configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_FILE_TYPES: {
    'application/pdf': ['.pdf'],
    'image/*': ['.jpeg', '.jpg', '.png'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  },
}; 