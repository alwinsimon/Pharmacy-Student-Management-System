// src/constants/roles.constants.js
/**
 * User role definitions
 * Implements the four-tier hierarchical user system
 */
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  STUDENT: 'student'
};

// Role hierarchy for authorization checks
const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.STAFF, ROLES.STUDENT],
  [ROLES.MANAGER]: [ROLES.MANAGER, ROLES.STAFF, ROLES.STUDENT],
  [ROLES.STAFF]: [ROLES.STAFF, ROLES.STUDENT],
  [ROLES.STUDENT]: [ROLES.STUDENT]
};

// Role label mapping for UI display
const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.MANAGER]: 'Department Manager',
  [ROLES.STAFF]: 'Faculty Staff',
  [ROLES.STUDENT]: 'Student'
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  ROLE_LABELS
};