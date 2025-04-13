import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import logo from '../assets/logo.png'; // You'll need to add a logo image to your assets

export const generateCasePDF = (caseData) => {
  const doc = new jsPDF();
  
  // Add header with logo
  doc.addImage(logo, 'PNG', 15, 10, 30, 30);
  doc.setFontSize(20);
  doc.setTextColor(0, 51, 102);
  doc.text('PharmClinical', 50, 25);
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Case Documentation Report', 50, 32);
  
  // Add case title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`Case: ${caseData.title}`, 15, 50);
  
  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 58);
  
  // Add student name
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Student: ${caseData.studentName || 'N/A'}`, 15, 65);
  
  // Add patient information
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text('Patient Information', 15, 80);
  
  const patientInfo = [
    { name: 'Age', value: caseData.patientInfo?.age || 'N/A' },
    { name: 'Gender', value: caseData.patientInfo?.gender || 'N/A' },
    { name: 'Weight', value: caseData.patientInfo?.weight ? `${caseData.patientInfo.weight} kg` : 'N/A' },
    { name: 'Height', value: caseData.patientInfo?.height ? `${caseData.patientInfo.height} cm` : 'N/A' },
    { name: 'BMI', value: caseData.patientInfo?.weight && caseData.patientInfo?.height ? 
      (caseData.patientInfo.weight / Math.pow(caseData.patientInfo.height / 100, 2)).toFixed(1) : 'N/A' },
  ];
  
  doc.autoTable({
    startY: 85,
    head: [['Parameter', 'Value']],
    body: patientInfo.map(item => [item.name, item.value]),
    theme: 'striped',
    headStyles: { fillColor: [0, 51, 102] }
  });
  
  // Add chief complaint
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text('Chief Complaint', 15, doc.autoTable.previous.finalY + 15);
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  const complaintText = caseData.patientInfo?.chiefComplaint || 'No chief complaint provided';
  const complaintLines = doc.splitTextToSize(complaintText, 180);
  doc.text(complaintLines, 15, doc.autoTable.previous.finalY + 25);
  
  // Add assessment and plan sections
  let yPosition = doc.autoTable.previous.finalY + 25 + (complaintLines.length * 7);
  
  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text('Assessment', 15, yPosition);
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  const assessmentText = caseData.assessment?.diagnosis || 'No assessment provided';
  const assessmentLines = doc.splitTextToSize(assessmentText, 180);
  doc.text(assessmentLines, 15, yPosition + 10);
  
  yPosition += 10 + (assessmentLines.length * 7) + 15;
  
  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text('Plan', 15, yPosition);
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  const planText = caseData.plan?.medications || 'No plan provided';
  const planLines = doc.splitTextToSize(planText, 180);
  doc.text(planLines, 15, yPosition + 10);
  
  // Add evaluation if available
  if (caseData.evaluation) {
    yPosition += 10 + (planLines.length * 7) + 15;
    
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text('Evaluation', 15, yPosition);
    
    const evaluationInfo = [
      ['Evaluator', caseData.evaluation.evaluatorName || 'N/A'],
      ['Score', `${caseData.evaluation.score}/10` || 'N/A'],
      ['Date', new Date(caseData.evaluation.date).toLocaleDateString() || 'N/A'],
    ];
    
    doc.autoTable({
      startY: yPosition + 5,
      body: evaluationInfo,
      theme: 'plain',
    });
    
    yPosition = doc.autoTable.previous.finalY + 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Feedback:', 15, yPosition);
    
    const feedbackText = caseData.evaluation.feedback || 'No feedback provided';
    const feedbackLines = doc.splitTextToSize(feedbackText, 180);
    doc.text(feedbackLines, 15, yPosition + 7);
  }
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, 100, 285, { align: 'center' });
    doc.text('PharmClinical - Pharmacy Student Management System', 100, 292, { align: 'center' });
  }
  
  return doc;
};

export const generateQueryPDF = (queryData) => {
  // Similar implementation for query PDF
  const doc = new jsPDF();
  
  // Add header with logo
  doc.addImage(logo, 'PNG', 15, 10, 30, 30);
  doc.setFontSize(20);
  doc.setTextColor(0, 51, 102);
  doc.text('PharmClinical', 50, 25);
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Drug Information Query Report', 50, 32);
  
  // Add query title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`Query: ${queryData.title}`, 15, 50);
  
  // Add additional content similar to the case PDF
  
  return doc;
};

export const generateTestPDF = (testData) => {
  // Similar implementation for test PDF
  const doc = new jsPDF();
  
  // Add header with logo
  doc.addImage(logo, 'PNG', 15, 10, 30, 30);
  doc.setFontSize(20);
  doc.setTextColor(0, 51, 102);
  doc.text('PharmClinical', 50, 25);
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Test Results Report', 50, 32);
  
  // Add test title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`Test: ${testData.title}`, 15, 50);
  
  // Add additional content similar to the case PDF
  
  return doc;
}; 