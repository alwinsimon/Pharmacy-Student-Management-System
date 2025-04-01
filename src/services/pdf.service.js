// src/services/pdf.service.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { app: { upload: { destination } } } = require('../config');

class PDFService {
  /**
   * Generate a PDF report for a clinical case
   * @param {Object} caseData - Case data
   * @param {Object} qrCodeData - QR code data
   * @returns {Promise<String>} Path to generated PDF
   */
  async generateCaseReport(caseData, qrCodeData) {
    return new Promise((resolve, reject) => {
      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Case Report - ${caseData.caseNumber}`,
          Author: 'Pharmacy College Management System',
          Subject: caseData.title,
          Keywords: 'pharmacy, case, report'
        }
      });
      
      // Set up the report directory
      const reportsDir = path.join(destination, 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      // Set up the file path
      const fileName = `case-report-${caseData.caseNumber}.pdf`;
      const filePath = path.join(reportsDir, fileName);
      const writeStream = fs.createWriteStream(filePath);
      
      // Handle errors
      writeStream.on('error', (error) => {
        reject(error);
      });
      
      // When the document is finished, resolve with the file path
      writeStream.on('finish', () => {
        resolve(`reports/${fileName}`);
      });
      
      // Pipe the PDF to the write stream
      doc.pipe(writeStream);
      
      // Add header with logo placeholder
      this._addHeader(doc, 'Case Report');
      
      // Add title and case number
      doc.fontSize(18).text(caseData.title, { align: 'center' });
      doc.fontSize(12).text(`Case Number: ${caseData.caseNumber}`, { align: 'center' });
      doc.moveDown(2);
      
      // Add case information
      this._addSectionTitle(doc, 'Case Information');
      
      doc.fontSize(10);
      doc.text(`Status: ${caseData.status.toUpperCase()}`);
      doc.text(`Created: ${moment(caseData.createdAt).format('MMMM D, YYYY, h:mm A')}`);
      
      if (caseData.evaluation && caseData.evaluation.evaluatedAt) {
        doc.text(`Evaluated: ${moment(caseData.evaluation.evaluatedAt).format('MMMM D, YYYY, h:mm A')}`);
      }
      
      doc.moveDown();
      
      // Add patient information
      this._addSectionTitle(doc, 'Patient Information');
      doc.fontSize(10);
      
      if (caseData.patientInfo) {
        const { patientInfo } = caseData;
        
        doc.text(`Age: ${patientInfo.age || 'Not specified'}`);
        doc.text(`Gender: ${patientInfo.gender || 'Not specified'}`);
        
        if (patientInfo.weight && patientInfo.height) {
          doc.text(`Weight: ${patientInfo.weight} kg`);
          doc.text(`Height: ${patientInfo.height} cm`);
        }
        
        doc.text(`Chief Complaint: ${patientInfo.chiefComplaint || 'Not specified'}`);
        
        if (patientInfo.presentingSymptoms && patientInfo.presentingSymptoms.length > 0) {
          doc.text(`Presenting Symptoms: ${patientInfo.presentingSymptoms.join(', ')}`);
        }
      } else {
        doc.text('No patient information provided');
      }
      
      doc.moveDown();
      
      // Add medical history
      if (caseData.medicalHistory) {
        this._addSectionTitle(doc, 'Medical History');
        doc.fontSize(10);
        
        const { medicalHistory } = caseData;
        
        doc.text(`Past Medical History: ${medicalHistory.pastMedicalHistory || 'Not specified'}`);
        
        if (medicalHistory.allergies && medicalHistory.allergies.length > 0) {
          doc.text(`Allergies: ${medicalHistory.allergies.join(', ')}`);
        }
        
        if (medicalHistory.medications && medicalHistory.medications.length > 0) {
          doc.moveDown(0.5);
          doc.text('Current Medications:');
          
          medicalHistory.medications.forEach(med => {
            doc.moveDown(0.3);
            doc.text(`• ${med.name} ${med.dosage} ${med.frequency}`, { indent: 20 });
            if (med.purpose) {
              doc.text(`  Purpose: ${med.purpose}`, { indent: 25 });
            }
          });
        }
        
        doc.moveDown();
      }
      
      // Add SOAP note
      if (caseData.soapNote) {
        this._addSectionTitle(doc, 'SOAP Note');
        doc.fontSize(10);
        
        const { soapNote } = caseData;
        
        doc.font('Helvetica-Bold').text('Subjective:', { continued: true }).font('Helvetica');
        doc.text(` ${soapNote.subjective || 'Not provided'}`);
        doc.moveDown(0.5);
        
        doc.font('Helvetica-Bold').text('Objective:', { continued: true }).font('Helvetica');
        doc.text(` ${soapNote.objective || 'Not provided'}`);
        doc.moveDown(0.5);
        
        doc.font('Helvetica-Bold').text('Assessment:', { continued: true }).font('Helvetica');
        doc.text(` ${soapNote.assessment || 'Not provided'}`);
        doc.moveDown(0.5);
        
        doc.font('Helvetica-Bold').text('Plan:', { continued: true }).font('Helvetica');
        doc.text(` ${soapNote.plan || 'Not provided'}`);
        
        doc.moveDown();
      }
      
      // Add case details
      if (caseData.caseDetails) {
        this._addSectionTitle(doc, 'Case Details');
        doc.fontSize(10);
        
        const { caseDetails } = caseData;
        
        if (caseDetails.diagnosis && caseDetails.diagnosis.length > 0) {
          doc.text(`Diagnosis: ${caseDetails.diagnosis.join(', ')}`);
        }
        
        if (caseDetails.assessment) {
          doc.text(`Assessment: ${caseDetails.assessment}`);
        }
        
        if (caseDetails.treatmentPlan) {
          doc.text(`Treatment Plan: ${caseDetails.treatmentPlan}`);
        }
        
        if (caseDetails.interventions && caseDetails.interventions.length > 0) {
          doc.moveDown(0.5);
          doc.text('Interventions:');
          
          caseDetails.interventions.forEach(intervention => {
            doc.moveDown(0.3);
            doc.text(`• ${intervention.type}: ${intervention.description}`, { indent: 20 });
            if (intervention.outcome) {
              doc.text(`  Outcome: ${intervention.outcome}`, { indent: 25 });
            }
          });
        }
        
        doc.moveDown();
      }
      
      // Add evaluation if available
      if (caseData.evaluation && caseData.evaluation.score !== undefined) {
        this._addSectionTitle(doc, 'Evaluation');
        doc.fontSize(10);
        
        const { evaluation } = caseData;
        
        doc.text(`Score: ${evaluation.score}/${evaluation.maxScore || 100} (${(evaluation.score / (evaluation.maxScore || 100) * 100).toFixed(1)}%)`);
        
        if (evaluation.feedback) {
          doc.moveDown(0.5);
          doc.text('Feedback:');
          doc.text(evaluation.feedback, { indent: 20 });
        }
        
        if (evaluation.rubricItems && evaluation.rubricItems.length > 0) {
          doc.moveDown(0.5);
          doc.text('Evaluation Criteria:');
          
          evaluation.rubricItems.forEach(item => {
            doc.moveDown(0.3);
            doc.text(`• ${item.criterion}: ${item.score}/${item.maxScore}`, { indent: 20 });
            if (item.comments) {
              doc.text(`  Comments: ${item.comments}`, { indent: 25 });
            }
          });
        }
        
        doc.moveDown();
      }
      
      // Add QR code for verification
      if (qrCodeData && qrCodeData.path) {
        this._addSectionTitle(doc, 'Verification');
        doc.fontSize(10);
        
        doc.text('Scan the QR code below to verify this report:', { align: 'center' });
        doc.moveDown(0.5);
        
        // Add QR code image
        const qrCodePath = path.join(destination, qrCodeData.path);
        if (fs.existsSync(qrCodePath)) {
          doc.image(qrCodePath, {
            fit: [150, 150],
            align: 'center'
          });
        }
        
        doc.moveDown(0.5);
        doc.text(`Access Code: ${qrCodeData.accessCode}`, { align: 'center' });
        doc.moveDown();
      }
      
      // Add footer with page numbers
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        
        // Footer
        const footerTop = doc.page.height - 50;
        doc.fontSize(8).text(
          `Generated on ${moment().format('MMMM D, YYYY, h:mm A')} | Page ${i + 1} of ${pages.count}`,
          50, footerTop, { align: 'center' }
        );
      }
      
      // Finalize the document
      doc.end();
    });
  }

  /**
   * Add a header to the PDF
   * @param {PDFDocument} doc - PDF document
   * @param {String} title - Header title
   * @private
   */
  _addHeader(doc, title) {
    // Add a placeholder for logo
    // doc.image('path/to/logo.png', 50, 45, { width: 50 });
    
    // Add a line for header
    doc.moveTo(50, 70)
       .lineTo(doc.page.width - 50, 70)
       .stroke();
    
    // Add title
    doc.fontSize(10).text(
      'Pharmacy College Management System',
      50, 45,
      { align: 'right', width: doc.page.width - 100 }
    );
    
    doc.fontSize(16).text(
      title,
      50, 80,
      { align: 'center' }
    );
    
    doc.moveDown(2);
  }

  /**
   * Add a section title to the PDF
   * @param {PDFDocument} doc - PDF document
   * @param {String} title - Section title
   * @private
   */
  _addSectionTitle(doc, title) {
    doc.fontSize(12)
       .fillColor('#0066cc')
       .text(title)
       .moveDown(0.5);
    
    doc.moveTo(doc.x, doc.y)
       .lineTo(doc.x + 150, doc.y)
       .stroke();
    
    doc.fillColor('black')
       .moveDown(0.5);
  }
}

module.exports = new PDFService();