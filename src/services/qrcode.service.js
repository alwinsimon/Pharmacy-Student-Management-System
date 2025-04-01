// src/services/qrcode.service.js
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;
const { nanoid } = require('nanoid');
const { app: { server: { url: baseUrl } } } = require('../config');

class QRCodeService {
  /**
   * Generate a QR code for a resource
   * @param {String} resource - Resource path
   * @param {String} label - Resource label
   * @returns {Promise<Object>} QR code data
   */
  async generateQRCode(resource, label) {
    // Generate a unique access code
    const accessCode = nanoid(12);
    
    // Create QR code URL
    const qrCodeUrl = `${baseUrl}/qr/${accessCode}`;
    
    // Create directory for QR codes if it doesn't exist
    const qrCodeDir = path.join(process.cwd(), 'src/uploads/qrcodes');
    await fs.mkdir(qrCodeDir, { recursive: true });
    
    // Generate QR code image
    const qrCodeFilename = `qr-${accessCode}.png`;
    const qrCodePath = path.join(qrCodeDir, qrCodeFilename);
    
    await qrcode.toFile(qrCodePath, qrCodeUrl, {
      errorCorrectionLevel: 'M',
      type: 'png',
      width: 300,
      margin: 4,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    return {
      code: accessCode,
      url: qrCodeUrl,
      path: `qrcodes/${qrCodeFilename}`,
      accessCode
    };
  }

  /**
   * Validate a QR code access
   * @param {String} accessCode - Access code
   * @param {String} resourceType - Resource type
   * @returns {Promise<Object>} Resource information
   */
  async validateQRCodeAccess(accessCode, resourceType) {
    // Different services would be used based on resource type
    switch (resourceType) {
      case 'document':
        // This would use DocumentService to get document by QR code
        return { type: 'document', accessCode };
      case 'case':
        // This would use CaseService to get case by QR code
        return { type: 'case', accessCode };
      default:
        throw new Error(`Invalid resource type: ${resourceType}`);
    }
  }

  /**
   * Generate a QR code for a URL
   * @param {String} url - URL to encode
   * @returns {Promise<String>} Base64 encoded QR code
   */
  async generateQRCodeForUrl(url) {
    return qrcode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      width: 300,
      margin: 4
    });
  }
}

module.exports = new QRCodeService();