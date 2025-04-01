// src/config/email.config.js
/**
 * Email service configuration
 */
module.exports = {
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Pharmacy College MS',
    email: process.env.EMAIL_FROM_ADDRESS || 'noreply@pharmacy-college-ms.example.com'
  },
  templateDir: 'src/templates/emails',
  subjects: {
    welcome: 'Welcome to Pharmacy College Management System',
    verification: 'Please verify your email address',
    passwordReset: 'Password Reset Request',
    notification: 'New Notification from Pharmacy College MS'
  }
};