// src/api/v1/routes/index.js
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./users.routes');
const caseRoutes = require('./cases.routes');
const documentRoutes = require('./documents.routes');
const qrcodeRoutes = require('./qrcodes.routes');
const logRoutes = require('./logs.routes');
const dashboardRoutes = require('./dashboard.routes');
const departmentRoutes = require('./departments.routes');
const notificationRoutes = require('./notifications.routes');

// Register routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cases', caseRoutes);
router.use('/documents', documentRoutes);
router.use('/qrcodes', qrcodeRoutes);
router.use('/logs', logRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/departments', departmentRoutes);
router.use('/notifications', notificationRoutes);

// API Documentation route
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Pharmacy College Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      users: '/users',
      cases: '/cases',
      documents: '/documents',
      qrcodes: '/qrcodes',
      logs: '/logs',
      dashboard: '/dashboard',
      departments: '/departments',
      notifications: '/notifications'
    }
  });
});

module.exports = router;