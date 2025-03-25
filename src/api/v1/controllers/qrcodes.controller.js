// src/api/v1/controllers/qrcodes.controller.js
const qrcodeService = require('../../../services/qrcode.service');
const documentService = require('../../../services/document.service');
const caseService = require('../../../services/case.service');
const { asyncHandler } = require('../../../utils/error.utils');
const { status: { HTTP_STATUS } } = require('../../../constants');
const { objectId } = require('../../../utils/validation.utils');
const path = require('path');
const fs = require('fs').promises;

/**
 * Access resource via QR code
 * @route GET /api/v1/qrcodes/:code
 */
const accessViaQRCode = asyncHandler(async (req, res) => {
  const { code } = req.params;
  
  // First, get information about the QR code
  const qrInfo = await qrcodeService.validateQRCodeAccess(code);
  
  // Based on resource type, redirect to the appropriate route
  switch (qrInfo.type) {
    case 'document':
      // For documents, redirect to document view
      res.redirect(`/documents/view/${qrInfo.resourceId}`);
      break;
    case 'case':
      // For cases, redirect to case report
      res.redirect(`/cases/report/${qrInfo.resourceId}`);
      break;
    default:
      throw new Error(`Unsupported resource type: ${qrInfo.type}`);
  }
});

/**
 * Get QR code information without accessing the resource
 * @route GET /api/v1/qrcodes/:code/info
 */
const getQRCodeInfo = asyncHandler(async (req, res) => {
  const { code } = req.params;
  
  const qrInfo = await qrcodeService.validateQRCodeAccess(code);
  
  // Return basic information without actual resource content
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'QR code information retrieved successfully',
    data: {
      code: code,
      type: qrInfo.type,
      resourceId: qrInfo.resourceId,
      title: qrInfo.title,
      createdAt: qrInfo.createdAt
    }
  });
});

/**
 * Generate QR code for a resource
 * @route POST /api/v1/qrcodes/generate
 */
const generateQRCode = asyncHandler(async (req, res) => {
  const { resource, label } = req.body;
  
  const qrCode = await qrcodeService.generateQRCode(resource, label);
  
  res.status(HTTP_STATUS.CREATED.code).json({
    success: true,
    message: 'QR code generated successfully',
    data: qrCode
  });
});

/**
 * Get QR code for a specific resource
 * @route GET /api/v1/qrcodes/resource/:resourceType/:resourceId
 */
const getResourceQRCode = asyncHandler(async (req, res) => {
  const { resourceType, resourceId } = req.params;
  objectId(resourceId);
  
  let resource;
  let label;
  
  // Validate resource type and get resource details
  switch (resourceType) {
    case 'document':
      resource = await documentService.getDocumentById(resourceId);
      label = `Document: ${resource.title}`;
      break;
    case 'case':
      resource = await caseService.getCaseById(resourceId);
      label = `Case: ${resource.title}`;
      break;
    default:
      throw new Error(`Unsupported resource type: ${resourceType}`);
  }
  
  // Check if QR code already exists for this resource
  let qrCode;
  
  if (resourceType === 'document' && resource.qrCode && resource.qrCode.code) {
    qrCode = {
      code: resource.qrCode.code,
      url: resource.qrCode.url,
      path: resource.qrCode.path
    };
  } else if (resourceType === 'case' && resource.report && resource.report.qrCode) {
    qrCode = {
      code: resource.report.qrCode,
      url: `${process.env.API_URL}/qr/${resource.report.qrCode}`,
      path: null // We don't store the path for case QR codes
    };
  } else {
    // Generate new QR code
    qrCode = await qrcodeService.generateQRCode(
      `${resourceType}/${resourceId}`,
      label
    );
    
    // Update resource with QR code info
    if (resourceType === 'document') {
      await documentService.updateDocument(resourceId, {
        qrCode: {
          code: qrCode.code,
          url: qrCode.url,
          generatedAt: new Date()
        }
      }, req.user.id);
    }
    // For cases, QR codes are handled during report generation
  }
  
  // If path exists, return the QR code image
  if (qrCode.path) {
    const qrCodePath = path.join(process.cwd(), 'src', 'uploads', qrCode.path);
    
    try {
      await fs.access(qrCodePath);
      
      // Set content type for image
      res.setHeader('Content-Type', 'image/png');
      // Send the file
      res.sendFile(qrCodePath);
    } catch (error) {
      // If file doesn't exist, return QR code data
      res.status(HTTP_STATUS.OK.code).json({
        success: true,
        message: 'QR code information retrieved successfully',
        data: qrCode
      });
    }
  } else {
    // If no path, return QR code data
    res.status(HTTP_STATUS.OK.code).json({
      success: true,
      message: 'QR code information retrieved successfully',
      data: qrCode
    });
  }
});

module.exports = {
  accessViaQRCode,
  getQRCodeInfo,
  generateQRCode,
  getResourceQRCode
};