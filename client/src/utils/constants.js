/**
 * Application constants
 */

// Basic application details
export const APP_BASICS = {
  SHORT_NAME: 'JKKN PharmaEHR',
  DOMAIN: 'pharmehr.jkkn.edu.in',
  ORGANIZATION: 'JKKN Pharmacy College',
  CURRENT_YEAR: new Date().getFullYear(),
};

// Application Information
export const APP_INFO = {
  NAME: APP_BASICS.SHORT_NAME,
  FULL_NAME: 'Pharmacy Student Management System',
  VERSION: '1.0.0',
  COPYRIGHT: `© ${APP_BASICS.CURRENT_YEAR} ${APP_BASICS.ORGANIZATION}. All rights reserved.`,
  SUPPORT_EMAIL: `support@${APP_BASICS.DOMAIN}`,
  WEBSITE: `https://www.${APP_BASICS.DOMAIN}`,
  DESCRIPTION: 'A comprehensive platform for pharmacy student clinical education management',
  LOGO_PATH: '/logo.png',
  TAGLINE: 'Streamlining Clinical Education',
  HERO_TAGLINE: 'Transforming Pharmacy Education',
  HERO_DESCRIPTION: 'An integrated platform for managing clinical cases, assessments, and student progression.',
  FEATURES: [
    {
      id: 'case-management',
      name: 'Case Management',
      description: 'Document and manage clinical cases',
      icon: 'Assignment',
      color: '#4caf50'
    },
    {
      id: 'clinical-queries',
      name: 'Clinical Queries',
      description: 'Ask and respond to clinical questions',
      icon: 'QuestionAnswer',
      color: '#2196f3'
    },
    {
      id: 'assessments',
      name: 'Assessments',
      description: 'Create and take tests to evaluate knowledge',
      icon: 'Quiz',
      color: '#ff9800'
    },
    {
      id: 'performance-tracking',
      name: 'Performance Tracking',
      description: 'Track progress and performance metrics',
      icon: 'BarChart',
      color: '#9c27b0'
    }
  ],
  BENEFITS: [
    'Streamlined workflow for clinical documentation',
    'Personalized feedback from instructors',
    'Comprehensive assessment capabilities',
    'Real-time tracking of student progress',
    'Secure and HIPAA-compliant platform',
    'Mobile-friendly responsive design'
  ],
  TESTIMONIALS: [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Professor of Clinical Pharmacy',
      text: 'This platform has transformed how we teach clinical skills. Students are more engaged and faculty can provide better feedback.',
      avatar: '/avatars/sarah.jpg'
    },
    {
      name: 'Michael Chen',
      role: 'Pharmacy Student',
      text: 'The case management system helps me organize my clinical experiences. I can track my progress and get feedback quickly.',
      avatar: '/avatars/michael.jpg'
    },
    {
      name: 'Dr. Robert Williams',
      role: 'Dean of Pharmacy',
      text: 'We\'ve seen significant improvements in clinical knowledge retention since implementing this platform.',
      avatar: '/avatars/robert.jpg'
    }
  ]
};

// User roles
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
};

// API endpoints
export const API_ENDPOINTS = {
  BASE: '/api',
  AUTH: {
    BASE: '/api/auth',
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh-token',
    LOGOUT: '/api/auth/logout',
  },
  USERS: {
    BASE: '/api/users',
    ME: '/api/users/me',
    LIST: '/api/users',
    DETAIL: (id) => `/api/users/${id}`,
  },
  CASES: {
    BASE: '/api/cases',
    LIST: '/api/cases',
    DETAIL: (id) => `/api/cases/${id}`,
    SUBMIT: (id) => `/api/cases/${id}/submit`,
    EVALUATE: (id) => `/api/cases/${id}/evaluate`,
    COMMENTS: (id) => `/api/cases/${id}/comments`,
    ATTACHMENTS: (id) => `/api/cases/${id}/attachments`,
    PDF: (id) => `/api/cases/${id}/pdf`,
  },
  QUERIES: {
    BASE: '/api/queries',
    LIST: '/api/queries',
    DETAIL: (id) => `/api/queries/${id}`,
    ASSIGN: (id) => `/api/queries/${id}/assign`,
    RESPOND: (id) => `/api/queries/${id}/respond`,
    EVALUATE: (id) => `/api/queries/${id}/evaluate`,
    PDF: (id) => `/api/queries/${id}/pdf`,
  },
  TESTS: {
    BASE: '/api/tests',
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
  PREFIX: APP_BASICS.SHORT_NAME.toLowerCase().replace(/\s+/g, '_'),
  get TOKEN() { return `${this.PREFIX}_token`; },
  get REFRESH_TOKEN() { return `${this.PREFIX}_refresh_token`; },
  get USER() { return `${this.PREFIX}_user`; },
  get THEME() { return `${this.PREFIX}_theme`; },
  get LANGUAGE() { return `${this.PREFIX}_language`; }
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

// Theme options
export const THEME_SETTINGS = {
  LIGHT: {
    name: 'light',
    label: 'Light Mode',
    icon: 'LightMode'
  },
  DARK: {
    name: 'dark',
    label: 'Dark Mode',
    icon: 'DarkMode'
  },
  SYSTEM: {
    name: 'system',
    label: 'System Default',
    icon: 'SettingsBrightness'
  }
};

// Navigation menu
export const NAVIGATION = {
  MAIN: [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'Dashboard', roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT] },
    { id: 'cases', label: 'Clinical Cases', path: '/cases', icon: 'Assignment', roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT] },
    { id: 'queries', label: 'Queries', path: '/queries', icon: 'QuestionAnswer', roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT] },
    { id: 'tests', label: 'Tests', path: '/tests', icon: 'Quiz', roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT] },
    { id: 'admin', label: 'Admin Panel', path: '/admin', icon: 'AdminPanelSettings', roles: [USER_ROLES.ADMIN] }
  ],
  USER: [
    { id: 'profile', label: 'Profile', path: '/profile', icon: 'Person', roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT] },
    { id: 'settings', label: 'Settings', path: '/settings', icon: 'Settings', roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT] },
    { id: 'help', label: 'Help Center', path: '/help', icon: 'Help', roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT] }
  ]
};

// Color palette for UI elements
export const UI_COLORS = {
  GRADIENT: {
    PRIMARY: 'linear-gradient(120deg, #3f51b5 0%, #5c6bc0 100%)',
    SECONDARY: 'linear-gradient(120deg, #f50057 0%, #ff4081 100%)',
    DARK: 'linear-gradient(120deg, #1a1a1a 0%, #2c2c2c 100%)',
    LIGHT: 'linear-gradient(120deg, #f5f7fa 0%, #e4e9f2 100%)'
  },
  FEATURES: {
    CASE: '#4caf50',
    QUERY: '#2196f3',
    TEST: '#ff9800',
    PROGRESS: '#9c27b0'
  }
}; 