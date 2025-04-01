// src/swagger/qrcodes.swagger.js

/**
 * @swagger
 * tags:
 *   name: QRCodes
 *   description: QR code generation and access
 */

/**
 * @swagger
 * /qrcodes/{code}:
 *   get:
 *     summary: Access resource via QR code
 *     tags: [QRCodes]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: QR code
 *     responses:
 *       302:
 *         description: Redirect to resource
 *       400:
 *         description: Invalid QR code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /qrcodes/{code}/info:
 *   get:
 *     summary: Get QR code information without accessing the resource
 *     tags: [QRCodes]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: QR code
 *     responses:
 *       200:
 *         description: QR code information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: QR code information retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: abc123def456
 *                     type:
 *                       type: string
 *                       enum: [document, case]
 *                       example: document
 *                     resourceId:
 *                       type: string
 *                       example: 60d725b24e2dbd3c5988e787
 *                     title:
 *                       type: string
 *                       example: Pharmacology Guidelines 2023
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-01-15T10:30:00Z
 *       400:
 *         description: Invalid QR code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: QR code not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /qrcodes/generate:
 *   post:
 *     summary: Generate QR code for a resource
 *     tags: [QRCodes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resource
 *               - label
 *             properties:
 *               resource:
 *                 type: string
 *                 example: document/60d725b24e2dbd3c5988e787
 *               label:
 *                 type: string
 *                 example: Pharmacology Guidelines 2023
 *     responses:
 *       201:
 *         description: QR code generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: QR code generated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: abc123def456
 *                     url:
 *                       type: string
 *                       example: http://localhost:3000/qr/abc123def456
 *                     path:
 *                       type: string
 *                       example: qrcodes/qr-abc123def456.png
 *                     accessCode:
 *                       type: string
 *                       example: abc123def456
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /qrcodes/resource/{resourceType}/{resourceId}:
 *   get:
 *     summary: Get QR code for a specific resource
 *     tags: [QRCodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [document, case]
 *         description: Resource type
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: QR code image
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */