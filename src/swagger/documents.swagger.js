// src/swagger/documents.swagger.js

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document management
 */

/**
 * @swagger
 * /documents:
 *   get:
 *     summary: Get all documents with pagination
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, archived, deleted]
 *         description: Filter by status
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
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
 *                   example: Documents retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Document'
 *                     meta:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                           example: 100
 *                         itemCount:
 *                           type: integer
 *                           example: 10
 *                         itemsPerPage:
 *                           type: integer
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           example: 10
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 *   post:
 *     summary: Create a new document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - document
 *             properties:
 *               title:
 *                 type: string
 *                 example: Pharmacology Guidelines 2023
 *               description:
 *                 type: string
 *                 example: Official guidelines for pharmacology practices
 *               category:
 *                 type: string
 *                 example: Guidelines
 *               subcategory:
 *                 type: string
 *                 example: Pharmacology
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Document file
 *               metadata:
 *                 type: object
 *                 properties:
 *                   department:
 *                     type: string
 *                     example: 60d725b24e2dbd3c5988e785
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["guidelines", "pharmacology", "reference"]
 *                   isTemplate:
 *                     type: boolean
 *                     example: false
 *               accessControl:
 *                 type: object
 *                 properties:
 *                   visibility:
 *                     type: string
 *                     enum: [public, private, restricted]
 *                     example: restricted
 *                   allowedRoles:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["staff", "student"]
 *                   allowedDepartments:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["60d725b24e2dbd3c5988e785"]
 *     responses:
 *       201:
 *         description: Document created successfully
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
 *                   example: Document created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 *       400:
 *         description: Validation error or file required
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
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /documents/{id}/file:
 *   get:
 *     summary: Get document file
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: File stream
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Document or file not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 *   post:
 *     summary: Update document file (add new version)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - document
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Document file
 *               changeNotes:
 *                 type: string
 *                 example: Updated guidelines with new regulations
 *     responses:
 *       200:
 *         description: Document file updated successfully
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
 *                   example: Document file updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     version:
 *                       type: number
 *                       example: 2
 *                     file:
 *                       type: object
 *                       properties:
 *                         filename:
 *                           type: string
 *                           example: abc123-1234567890.pdf
 *                         path:
 *                           type: string
 *                           example: documents/abc123-1234567890.pdf
 *                         contentType:
 *                           type: string
 *                           example: application/pdf
 *                         size:
 *                           type: number
 *                           example: 1048576
 *       400:
 *         description: Document file is required
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
 *       403:
 *         description: You do not have permission to edit this document
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /documents/{id}/share:
 *   post:
 *     summary: Share document with users
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               visibility:
 *                 type: string
 *                 enum: [public, private, restricted]
 *                 example: restricted
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60d725b24e2dbd3c5988e784", "60d725b24e2dbd3c5988e786"]
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["staff", "student"]
 *               departments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60d725b24e2dbd3c5988e785"]
 *     responses:
 *       200:
 *         description: Document shared successfully
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
 *                   example: Document shared successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessControl:
 *                       type: object
 *                       properties:
 *                         visibility:
 *                           type: string
 *                           example: restricted
 *                         allowedRoles:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["staff", "student"]
 *                         allowedUsers:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["60d725b24e2dbd3c5988e784", "60d725b24e2dbd3c5988e786"]
 *                         allowedDepartments:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["60d725b24e2dbd3c5988e785"]
 *       400:
 *         description: At least one sharing option must be provided
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
 *       403:
 *         description: You do not have permission to share this document
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /documents/search:
 *   get:
 *     summary: Search documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Search results
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
 *                   example: Search results
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 *       400:
 *         description: Search query must be at least 2 characters
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
 */