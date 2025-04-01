// src/constants/roles.constants.js
/**
 * User role definitions
 * Implements the three-tier hierarchical user system
 */
const ROLES = {
  ADMIN: 'admin',           // System administrator
  TEACHER: 'teacher',       // Faculty member
  STUDENT: 'student'        // Student user
};

// Role hierarchy for authorization checks
const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT],
  [ROLES.TEACHER]: [ROLES.TEACHER, ROLES.STUDENT],
  [ROLES.STUDENT]: [ROLES.STUDENT]
};

// Role label mapping for UI display
const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.STUDENT]: 'Student'
};

// Role permissions mapping
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    'manage_users',
    'manage_cases',
    'manage_documents',
    'manage_departments',
    'view_dashboard',
    'view_logs',
    'manage_notifications'
  ],
  [ROLES.TEACHER]: [
    'manage_cases',
    'manage_documents',
    'view_dashboard',
    'view_notifications'
  ],
  [ROLES.STUDENT]: [
    'view_cases',
    'view_documents',
    'view_notifications'
  ]
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  ROLE_LABELS,
  ROLE_PERMISSIONS
};