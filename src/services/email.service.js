// src/services/email.service.js
const nodemailer = require('nodemailer');
const { email: emailConfig } = require('../config');
const { logger } = require('../utils/logger.utils');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass
      }
    });
  }

  /**
   * Send an email
   * @param {Object} options - Email options
   * @returns {Promise<Object>} Send result
   */
  async sendEmail(options) {
    try {
      const mailOptions = {
        from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      };
      
      // Add CC if provided
      if (options.cc) {
        mailOptions.cc = options.cc;
      }
      
      // Add BCC if provided
      if (options.bcc) {
        mailOptions.bcc = options.bcc;
      }
      
      // Add attachments if provided
      if (options.attachments) {
        mailOptions.attachments = options.attachments;
      }
      
      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info('Email sent successfully', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject
      });
      
      return info;
    } catch (error) {
      logger.error('Failed to send email', {
        error: error.message,
        to: options.to,
        subject: options.subject
      });
      
      // Re-throw for handling
      throw error;
    }
  }

  /**
   * Send verification email
   * @param {String} email - Recipient email
   * @param {String} name - Recipient name
   * @param {String} verificationToken - Verification token
   * @returns {Promise<Object>} Send result
   */
  async sendVerificationEmail(email, name, verificationToken) {
    const verificationUrl = `${emailConfig.clientUrl}/verify-email?token=${verificationToken}`;
    
    const subject = emailConfig.subjects.verification;
    
    const text = `
      Hello ${name},
      
      Thank you for registering with the Pharmacy College Management System. Please verify your email address by clicking the link below:
      
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you did not register for an account, please ignore this email.
      
      Best regards,
      Pharmacy College Management System Team
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering with the Pharmacy College Management System. Please verify your email address by clicking the button below:</p>
        <p style="text-align: center;">
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not register for an account, please ignore this email.</p>
        <p>Best regards,<br>Pharmacy College Management System Team</p>
      </div>
    `;
    
    return this.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  }

  /**
   * Send password reset email
   * @param {String} email - Recipient email
   * @param {String} name - Recipient name
   * @param {String} resetToken - Reset token
   * @returns {Promise<Object>} Send result
   */
  async sendPasswordResetEmail(email, name, resetToken) {
    const resetUrl = `${emailConfig.clientUrl}/reset-password?token=${resetToken}`;
    
    const subject = emailConfig.subjects.passwordReset;
    
    const text = `
      Hello ${name},
      
      You requested a password reset for your Pharmacy College Management System account. Please click the link below to reset your password:
      
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you did not request a password reset, please ignore this email.
      
      Best regards,
      Pharmacy College Management System Team
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>Hello ${name},</p>
        <p>You requested a password reset for your Pharmacy College Management System account. Please click the button below to reset your password:</p>
        <p style="text-align: center;">
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Best regards,<br>Pharmacy College Management System Team</p>
      </div>
    `;
    
    return this.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  }

  /**
   * Send welcome email
   * @param {String} email - Recipient email
   * @param {String} name - Recipient name
   * @param {String} tempPassword - Temporary password
   * @returns {Promise<Object>} Send result
   */
  async sendWelcomeEmail(email, name, tempPassword) {
    const loginUrl = `${emailConfig.clientUrl}/login`;
    
    const subject = emailConfig.subjects.welcome;
    
    const text = `
      Hello ${name},
      
      Welcome to the Pharmacy College Management System! Your account has been created by an administrator.
      
      Here are your login details:
      Email: ${email}
      Temporary Password: ${tempPassword}
      
      Please login at ${loginUrl} and change your password immediately for security reasons.
      
      Best regards,
      Pharmacy College Management System Team
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Pharmacy College Management System</h2>
        <p>Hello ${name},</p>
        <p>Welcome to the Pharmacy College Management System! Your account has been created by an administrator.</p>
        <p>Here are your login details:</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 4px;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        </div>
        <p>Please <a href="${loginUrl}">login here</a> and change your password immediately for security reasons.</p>
        <p>Best regards,<br>Pharmacy College Management System Team</p>
      </div>
    `;
    
    return this.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  }

  /**
   * Send account approved email
   * @param {String} email - Recipient email
   * @param {String} name - Recipient name
   * @returns {Promise<Object>} Send result
   */
  async sendAccountApprovedEmail(email, name) {
    const loginUrl = `${emailConfig.clientUrl}/login`;
    
    const subject = 'Your Account Has Been Approved';
    
    const text = `
      Hello ${name},
      
      Great news! Your Pharmacy College Management System account has been approved.
      
      You can now login at ${loginUrl} and start using the system.
      
      Best regards,
      Pharmacy College Management System Team
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Account Approved</h2>
        <p>Hello ${name},</p>
        <p>Great news! Your Pharmacy College Management System account has been approved.</p>
        <p>You can now <a href="${loginUrl}">login here</a> and start using the system.</p>
        <p>Best regards,<br>Pharmacy College Management System Team</p>
      </div>
    `;
    
    return this.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  }

  /**
   * Send account rejected email
   * @param {String} email - Recipient email
   * @param {String} name - Recipient name
   * @param {String} reason - Rejection reason
   * @returns {Promise<Object>} Send result
   */
  async sendAccountRejectedEmail(email, name, reason) {
    const subject = 'Account Registration Status';
    
    const text = `
      Hello ${name},
      
      We regret to inform you that your registration for the Pharmacy College Management System has not been approved.
      
      Reason: ${reason || 'No specific reason provided.'}
      
      If you believe this was a mistake or would like to discuss this further, please contact your department administrator.
      
      Best regards,
      Pharmacy College Management System Team
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Account Registration Status</h2>
        <p>Hello ${name},</p>
        <p>We regret to inform you that your registration for the Pharmacy College Management System has not been approved.</p>
        <p><strong>Reason:</strong> ${reason || 'No specific reason provided.'}</p>
        <p>If you believe this was a mistake or would like to discuss this further, please contact your department administrator.</p>
        <p>Best regards,<br>Pharmacy College Management System Team</p>
      </div>
    `;
    
    return this.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  }
}

module.exports = new EmailService();