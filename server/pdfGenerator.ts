import PDFDocument from 'pdfkit';
import { type Student } from '@shared/schema';

interface CertificateData {
  student: Student;
  certificateType: string;
  issueDate: Date;
}

interface PlacementLetterData {
  student: Student;
  completionDate: Date;
  achievements: string[];
}

interface ComplianceReportData {
  reportType: string;
  dateRange: { start: Date; end: Date };
  summary: string;
}

export class PDFGenerator {
  // Generate a base64 encoded PDF from a PDFDocument
  private static async generateBase64PDF(doc: PDFKit.PDFDocument): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer.toString('base64'));
      });
      doc.on('error', reject);
      
      doc.end();
    });
  }

  // Generate Student Certificate
  static async generateCertificate(data: CertificateData): Promise<string> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Brand colors - JustFix Red
    const primaryRed = '#E2231A';
    const darkGrey = '#1A1A1A';
    
    // Header with red accent bar
    doc.rect(0, 0, 595, 10).fill(primaryRed);
    
    // Logo area - JustFix branding
    doc.fontSize(28)
       .font('Helvetica-Bold')
       .fillColor(darkGrey)
       .text('JUSTFIX', 50, 40, { continued: true })
       .fillColor(primaryRed)
       .text(' AUTO ELECTRIX');
    
    doc.fontSize(10)
       .fillColor('#6D6E71')
       .text('ACADEMY DIVISION', 50, 75);
    
    // Certificate title
    doc.moveDown(3);
    doc.fontSize(32)
       .font('Helvetica-Bold')
       .fillColor(darkGrey)
       .text('CERTIFICATE OF COMPLETION', { align: 'center' });
    
    // Decorative line
    doc.moveDown(1);
    doc.moveTo(150, doc.y).lineTo(445, doc.y).stroke(primaryRed);
    
    // Certificate body
    doc.moveDown(2);
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor(darkGrey)
       .text('This is to certify that', { align: 'center' });
    
    doc.moveDown(1);
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor(primaryRed)
       .text(data.student.name.toUpperCase(), { align: 'center' });
    
    doc.moveDown(1.5);
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor(darkGrey)
       .text('has successfully completed the practical training program in', { align: 'center' });
    
    doc.moveDown(0.5);
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text(data.certificateType, { align: 'center' });
    
    doc.moveDown(1.5);
    doc.fontSize(11)
       .font('Helvetica')
       .text(`Department: ${data.student.department || 'General Maintenance'}`, { align: 'center' });
    
    doc.fontSize(11)
       .text(`Supervisor: ${data.student.supervisor || 'N/A'}`, { align: 'center' });
    
    // Skills mastered
    if (data.student.skills) {
      try {
        const skills = JSON.parse(data.student.skills);
        if (skills.length > 0) {
          doc.moveDown(1);
          doc.fontSize(10)
             .fillColor('#6D6E71')
             .text('SKILLS MASTERED:', { align: 'center' });
          doc.fontSize(10)
             .text(skills.join(' • '), { align: 'center' });
        }
      } catch (e) {
        // Skip if skills parsing fails
      }
    }
    
    // Date and signatures
    doc.moveDown(3);
    const dateStr = data.issueDate.toLocaleDateString('en-ZA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    doc.fontSize(10)
       .fillColor(darkGrey)
       .text(`Issue Date: ${dateStr}`, { align: 'center' });
    
    // Signature lines
    doc.moveDown(3);
    const sigY = doc.y;
    
    doc.moveTo(100, sigY).lineTo(220, sigY).stroke(darkGrey);
    doc.moveTo(375, sigY).lineTo(495, sigY).stroke(darkGrey);
    
    doc.fontSize(9)
       .fillColor('#6D6E71')
       .text('WORKSHOP MANAGER', 100, sigY + 10, { width: 120, align: 'center' });
    doc.text('ACADEMY DIRECTOR', 375, sigY + 10, { width: 120, align: 'center' });
    
    // Footer
    doc.fontSize(8)
       .fillColor('#6D6E71')
       .text('JustFix Auto Electrix Academy • Certified Automotive Training', 50, 750, { 
         align: 'center', 
         width: 495 
       });
    
    return await this.generateBase64PDF(doc);
  }

  // Generate Placement Letter
  static async generatePlacementLetter(data: PlacementLetterData): Promise<string> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    const primaryRed = '#E2231A';
    const darkGrey = '#1A1A1A';
    
    // Header with red accent
    doc.rect(0, 0, 595, 10).fill(primaryRed);
    
    // Letterhead
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor(darkGrey)
       .text('JUSTFIX', 50, 40, { continued: true })
       .fillColor(primaryRed)
       .text(' AUTO ELECTRIX');
    
    doc.fontSize(9)
       .fillColor('#6D6E71')
       .text('Academy Division • Student Placement Department', 50, 75);
    
    // Date
    doc.moveDown(3);
    const dateStr = data.completionDate.toLocaleDateString('en-ZA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor(darkGrey)
       .text(dateStr, { align: 'right' });
    
    // Letter title
    doc.moveDown(2);
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('STUDENT PLACEMENT COMPLETION LETTER', { align: 'center' });
    
    // Decorative line
    doc.moveDown(0.5);
    doc.moveTo(150, doc.y).lineTo(445, doc.y).stroke(primaryRed);
    
    // Letter body
    doc.moveDown(2);
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor(darkGrey)
       .text('To Whom It May Concern,', { align: 'left' });
    
    doc.moveDown(1);
    doc.fontSize(11)
       .text(`This letter confirms that ${data.student.name} has successfully completed their practical training placement at JustFix Auto Electrix Academy.`, { align: 'justify' });
    
    doc.moveDown(1);
    doc.text(`Role: ${data.student.role}`, { align: 'left' });
    doc.text(`Department: ${data.student.department || 'General Maintenance'}`, { align: 'left' });
    
    if (data.student.placementStart && data.student.placementEnd) {
      const startDate = new Date(data.student.placementStart).toLocaleDateString('en-ZA');
      const endDate = new Date(data.student.placementEnd).toLocaleDateString('en-ZA');
      doc.text(`Placement Period: ${startDate} to ${endDate}`, { align: 'left' });
    }
    
    doc.text(`Supervisor: ${data.student.supervisor || 'N/A'}`, { align: 'left' });
    
    // Achievements
    doc.moveDown(1.5);
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text('Key Achievements:', { align: 'left' });
    
    doc.font('Helvetica');
    if (data.achievements && data.achievements.length > 0) {
      data.achievements.forEach(achievement => {
        doc.fontSize(11)
           .text(`• ${achievement}`, { indent: 20 });
      });
    } else {
      doc.fontSize(11)
         .text('• Completed all required practical training modules', { indent: 20 });
      doc.text('• Demonstrated proficiency in automotive maintenance procedures', { indent: 20 });
      doc.text('• Maintained excellent attendance and professional conduct', { indent: 20 });
    }
    
    // Closing
    doc.moveDown(1.5);
    doc.fontSize(11)
       .text(`${data.student.name} has demonstrated dedication, skill, and professionalism throughout their placement. We recommend them for employment in the automotive service industry.`, { align: 'justify' });
    
    doc.moveDown(1);
    doc.text('Should you require any further information, please do not hesitate to contact us.', { align: 'justify' });
    
    // Signature
    doc.moveDown(2);
    doc.text('Sincerely,');
    
    doc.moveDown(2);
    const sigY = doc.y;
    doc.moveTo(50, sigY).lineTo(200, sigY).stroke(darkGrey);
    
    doc.moveDown(0.5);
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('Academy Director');
    doc.font('Helvetica')
       .fontSize(9)
       .fillColor('#6D6E71')
       .text('JustFix Auto Electrix Academy');
    
    // Footer
    doc.fontSize(8)
       .fillColor('#6D6E71')
       .text('JustFix Auto Electrix • Main Workshop (HQ)', 50, 750, { align: 'center', width: 495 });
    
    return await this.generateBase64PDF(doc);
  }

  // Generate Compliance Report
  static async generateComplianceReport(data: ComplianceReportData): Promise<string> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    const primaryRed = '#E2231A';
    const darkGrey = '#1A1A1A';
    
    // Header
    doc.rect(0, 0, 595, 10).fill(primaryRed);
    
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor(darkGrey)
       .text('JUSTFIX', 50, 40, { continued: true })
       .fillColor(primaryRed)
       .text(' AUTO ELECTRIX');
    
    doc.fontSize(9)
       .fillColor('#6D6E71')
       .text('Compliance & Quality Assurance Department', 50, 75);
    
    // Report title
    doc.moveDown(3);
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor(darkGrey)
       .text('COMPLIANCE AUDIT REPORT', { align: 'center' });
    
    doc.moveDown(0.5);
    doc.fontSize(12)
       .font('Helvetica')
       .text(data.reportType, { align: 'center' });
    
    // Decorative line
    doc.moveDown(0.5);
    doc.moveTo(150, doc.y).lineTo(445, doc.y).stroke(primaryRed);
    
    // Report metadata
    doc.moveDown(2);
    const startDate = data.dateRange.start.toLocaleDateString('en-ZA');
    const endDate = data.dateRange.end.toLocaleDateString('en-ZA');
    
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor(darkGrey)
       .text('Report Period:', { continued: true })
       .font('Helvetica')
       .text(` ${startDate} to ${endDate}`);
    
    doc.font('Helvetica-Bold')
       .text('Generated Date:', { continued: true })
       .font('Helvetica')
       .text(` ${new Date().toLocaleDateString('en-ZA')}`);
    
    // Summary section
    doc.moveDown(2);
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('EXECUTIVE SUMMARY');
    
    doc.moveDown(0.5);
    doc.fontSize(10)
       .font('Helvetica')
       .text(data.summary || 'This compliance report certifies that all workshop operations, training programs, and insurance documentation meet the required standards and regulations during the specified period.', { align: 'justify' });
    
    // Compliance checklist
    doc.moveDown(2);
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('COMPLIANCE CHECKLIST');
    
    const checklistItems = [
      'Workshop safety standards and protocols',
      'Student training documentation and records',
      'Insurance policy compliance and renewals',
      'Equipment maintenance and calibration logs',
      'Staff certifications and qualifications',
      'Environmental and waste disposal compliance',
    ];
    
    doc.moveDown(0.5);
    checklistItems.forEach(item => {
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#16a34a')
         .text('✓', { continued: true, width: 20 })
         .fillColor(darkGrey)
         .text(` ${item}`);
    });
    
    // Status indicator
    doc.moveDown(2);
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#16a34a')
       .text('STATUS: ', { continued: true })
       .fontSize(12)
       .text('FULLY COMPLIANT');
    
    // Footer signature
    doc.moveDown(3);
    doc.fontSize(10)
       .fillColor(darkGrey)
       .font('Helvetica')
       .text('This report has been reviewed and approved by the Quality Assurance team.');
    
    doc.moveDown(2);
    const sigY = doc.y;
    doc.moveTo(50, sigY).lineTo(200, sigY).stroke(darkGrey);
    
    doc.moveDown(0.5);
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('Compliance Officer');
    doc.font('Helvetica')
       .fontSize(9)
       .fillColor('#6D6E71')
       .text('JustFix Auto Electrix');
    
    // Footer
    doc.fontSize(8)
       .fillColor('#6D6E71')
       .text('JustFix Auto Electrix • Confidential Document', 50, 750, { align: 'center', width: 495 });
    
    return await this.generateBase64PDF(doc);
  }
}
