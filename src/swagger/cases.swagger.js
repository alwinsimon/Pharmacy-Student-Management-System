// src/swagger/cases.swagger.js

/**
 * @swagger
 * tags:
 *   name: Cases
 *   description: Clinical case management
 */

/**
 * @swagger
 * /cases:
 *   get:
 *     summary: Get all cases with pagination
 *     tags: [Cases]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, submitted, assigned, in_review, revision_requested, completed, archived]
 *         description: Filter by status
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *     responses:
 *       200:
 *         description: Cases retrieved successfully
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
 *                   example: Cases retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Case'
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
 *     summary: Create a new case
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Hypertension Management
 *               department:
 *                 type: string
 *                 example: 60d725b24e2dbd3c5988e785
 *               patientInfo:
 *                 type: object
 *                 properties:
 *                   age:
 *                     type: integer
 *                     example: 65
 *                   gender:
 *                     type: string
 *                     enum: [male, female, other, unknown]
 *                     example: male
 *                   weight:
 *                     type: number
 *                     example: 85.5
 *                   height:
 *                     type: number
 *                     example: 175
 *                   anonymizedId:
 *                     type: string
 *                     example: PT-2023-001
 *                   chiefComplaint:
 *                     type: string
 *                     example: Persistent headache and elevated blood pressure
 *                   presentingSymptoms:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["Headache", "Dizziness", "Blurred vision"]
 *               medicalHistory:
 *                 type: object
 *                 properties:
 *                   pastMedicalHistory:
 *                     type: string
 *                     example: Type 2 diabetes diagnosed 10 years ago
 *                   allergies:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["Penicillin", "Sulfa drugs"]
 *                   medications:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: Metformin
 *                         dosage:
 *                           type: string
 *                           example: 500mg
 *                         frequency:
 *                           type: string
 *                           example: twice daily
 *                         duration:
 *                           type: string
 *                           example: Since 2013
 *                         purpose:
 *                           type: string
 *                           example: Diabetes management
 *               soapNote:
 *                 type: object
 *                 properties:
 *                   subjective:
 *                     type: string
 *                     example: Patient reports persistent headache and occasional dizziness for the past month.
 *                   objective:
 *                     type: string
 *                     example: BP 160/95, HR 88, RR 16, Temp 37.1°C
 *                   assessment:
 *                     type: string
 *                     example: Uncontrolled hypertension with inadequate medication regimen
 *                   plan:
 *                     type: string
 *                     example: Start amlodipine 5mg daily, lifestyle modifications, follow up in 2 weeks
 *     responses:
 *       201:
 *         description: Case created successfully
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
 *                   example: Case created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Case'
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
 * /cases/{id}:
 *   get:
 *     summary: Get case by ID
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Case ID
 *     responses:
 *       200:
 *         description: Case retrieved successfully
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
 *                   example: Case retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Case'
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
 *         description: Case not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 *   put:
 *     summary: Update case
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Case ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Hypertension Management - Updated
 *               patientInfo:
 *                 type: object
 *                 properties:
 *                   age:
 *                     type: integer
 *                     example: 65
 *                   gender:
 *                     type: string
 *                     enum: [male, female, other, unknown]
 *                     example: male
 *                   weight:
 *                     type: number
 *                     example: 85.5
 *                   height:
 *                     type: number
 *                     example: 175
 *                   chiefComplaint:
 *                     type: string
 *                     example: Persistent headache and elevated blood pressure
 *                   presentingSymptoms:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["Headache", "Dizziness", "Blurred vision"]
 *               medicalHistory:
 *                 type: object
 *                 properties:
 *                   pastMedicalHistory:
 *                     type: string
 *                     example: Type 2 diabetes diagnosed 10 years ago
 *                   allergies:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["Penicillin", "Sulfa drugs"]
 *                   medications:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: Metformin
 *                         dosage:
 *                           type: string
 *                           example: 500mg
 *                         frequency:
 *                           type: string
 *                           example: twice daily
 *                         duration:
 *                           type: string
 *                           example: Since 2013
 *                         purpose:
 *                           type: string
 *                           example: Diabetes management
 *               soapNote:
 *                 type: object
 *                 properties:
 *                   subjective:
 *                     type: string
 *                     example: Patient reports persistent headache and occasional dizziness for the past month.
 *                   objective:
 *                     type: string
 *                     example: BP 160/95, HR 88, RR 16, Temp 37.1°C
 *                   assessment:
 *                     type: string
 *                     example: Uncontrolled hypertension with inadequate medication regimen
 *                   plan:
 *                     type: string
 *                     example: Start amlodipine 5mg daily, lifestyle modifications, follow up in 2 weeks
 *     responses:
 *       200:
 *         description: Case updated successfully
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
 *                   example: Case updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Case'
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
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Case not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 *   delete:
 *     summary: Delete case
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Case ID
 *     responses:
 *       200:
 *         description: Case deleted successfully
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
 *                   example: Case deleted successfully
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
 *         description: Case not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /cases/{id}/submit:
 *   post:
 *     summary: Submit case for review
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Case ID
 *     responses:
 *       200:
 *         description: Case submitted successfully
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
 *                   example: Case submitted for review successfully
 *                 data:
 *                   $ref: '#/components/schemas/Case'
 *       400:
 *         description: Case can only be submitted from draft or revision requested state
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
 *         description: Only the case owner can submit it for review
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Case not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /cases/{id}/assign/{staffId}:
 *   post:
 *     summary: Assign case to staff
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Case ID
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Case assigned successfully
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
 *                   example: Case assigned successfully
 *                 data:
 *                   $ref: '#/components/schemas/Case'
 *       400:
 *         description: Case can only be assigned from submitted state
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
 *       404:
 *         description: Case or staff not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /cases/{id}/review/start:
 *   post:
 *     summary: Start case review
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Case ID
 *     responses:
 *       200:
 *         description: Case review started successfully
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
 *                   example: Case review started successfully
 *                 data:
 *                   $ref: '#/components/schemas/Case'
 *       400:
 *         description: Case can only be reviewed from assigned state
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
 *         description: Only the assigned staff can review the case
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Case not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /cases/{id}/review/revision:
 *   post:
 *     summary: Request case revision
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Case ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               description:
 *                 type: string
 *                 example: Please add more details about the patient's medical history and current blood pressure readings.
 *     responses:
 *       200:
 *         description: Revision requested successfully
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
 *                   example: Revision requested successfully
 *                 data:
 *                   $ref: '#/components/schemas/Case'
 *       400:
 *         description: Revisions can only be requested for cases in review
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
 *         description: Only the assigned staff can request revisions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Case not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /cases/{id}/review/complete:
 *   post:
 *     summary: Complete case review with evaluation
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Case ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *             properties:
 *               score:
 *                 type: number
 *                 example: 85
 *               maxScore:
 *                 type: number
 *                 default: 100
 *                 example: 100
 *               feedback:
 *                 type: string
 *                 example: Good analysis of the case. Treatment plan is appropriate for the patient's condition.
 *               rubricItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     criterion:
 *                       type: string
 *                       example: Patient Assessment
 *                     score:
 *                       type: number
 *                       example: 18
 *                     maxScore:
 *                       type: number
 *                       example: 20
 *                     comments:
 *                       type: string
 *                       example: Good assessment but missing details on family history.
 *     responses:
 *       200:
 *         description: Case review completed successfully
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
 *                   example: Case review completed successfully
 *                 data:
 *                   $ref: '#/components/schemas/Case'
 *       400:
 *         description: Reviews can only be completed for cases in review
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
 *         description: Only the assigned staff can complete the review
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Case not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */