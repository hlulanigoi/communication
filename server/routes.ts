import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { PDFGenerator } from "./pdfGenerator";
import BusinessLogic from "./businessLogic";
import { 
  insertStudentSchema, 
  insertDocumentSchema,
  insertStaffSchema,
  insertLeaveRequestSchema,
  insertPayrollRecordSchema,
  insertPerformanceReviewSchema,
  insertEmployeeBenefitSchema,
  insertClientSchema,
  insertOperatingExpenseSchema,
  insertJobInvoiceSchema,
  insertTestimonialSchema,
  insertHRNoteSchema,
  insertCertificateSchema,
  insertJobSchema,
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ============ STUDENT ROUTES ============
  
  // Get all students
  app.get("/api/students", async (_req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single student
  app.get("/api/students/:id", async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create student
  app.post("/api/students", async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update student
  app.put("/api/students/:id", async (req, res) => {
    try {
      const student = await storage.updateStudent(req.params.id, req.body);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete student
  app.delete("/api/students/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteStudent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json({ message: "Student deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ DOCUMENT ROUTES ============
  
  // Get all documents
  app.get("/api/documents", async (_req, res) => {
    try {
      const documents = await storage.getDocuments();
      // Sort by date, newest first
      documents.sort((a, b) => {
        const dateA = a.generatedDate ? new Date(a.generatedDate).getTime() : 0;
        const dateB = b.generatedDate ? new Date(b.generatedDate).getTime() : 0;
        return dateB - dateA;
      });
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single document
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Download document as PDF
  app.get("/api/documents/:id/download", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      if (!document.content) {
        return res.status(404).json({ message: "Document content not found" });
      }

      // Convert base64 to buffer
      const pdfBuffer = Buffer.from(document.content, 'base64');
      
      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${document.title}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Search documents
  app.get("/api/documents/search/:query", async (req, res) => {
    try {
      const documents = await storage.searchDocuments(req.params.query);
      // Sort by date, newest first
      documents.sort((a, b) => {
        const dateA = a.generatedDate ? new Date(a.generatedDate).getTime() : 0;
        const dateB = b.generatedDate ? new Date(b.generatedDate).getTime() : 0;
        return dateB - dateA;
      });
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Filter documents
  app.post("/api/documents/filter", async (req, res) => {
    try {
      const filters = req.body;
      const documents = await storage.filterDocuments(filters);
      // Sort by date, newest first
      documents.sort((a, b) => {
        const dateA = a.generatedDate ? new Date(a.generatedDate).getTime() : 0;
        const dateB = b.generatedDate ? new Date(b.generatedDate).getTime() : 0;
        return dateB - dateA;
      });
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get documents by category
  app.get("/api/documents/category/:category", async (req, res) => {
    try {
      const documents = await storage.getDocumentsByCategory(req.params.category);
      documents.sort((a, b) => {
        const dateA = a.generatedDate ? new Date(a.generatedDate).getTime() : 0;
        const dateB = b.generatedDate ? new Date(b.generatedDate).getTime() : 0;
        return dateB - dateA;
      });
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Upload document
  app.post("/api/documents/upload", async (req, res) => {
    try {
      const { 
        title, 
        type, 
        category, 
        fileType, 
        fileName, 
        fileSize, 
        content, 
        studentId, 
        clientId, 
        staffId,
        description,
        tags,
        uploadedBy
      } = req.body;

      if (!title || !content) {
        return res.status(400).json({ message: "Title and content are required" });
      }

      // Get related names for denormalization
      let studentName, clientName, staffName;
      
      if (studentId) {
        const student = await storage.getStudent(studentId);
        studentName = student?.name;
      }
      
      if (clientId) {
        const client = await storage.getClient(clientId);
        clientName = client?.name;
      }
      
      if (staffId) {
        const staff = await storage.getStaffMember(staffId);
        staffName = staff?.name;
      }

      const document = await storage.createDocument({
        title,
        type: type || 'Custom',
        category: category || 'General',
        fileType: fileType || 'application/pdf',
        fileName: fileName || title,
        fileSize: fileSize || '0',
        content,
        studentId: studentId || null,
        clientId: clientId || null,
        staffId: staffId || null,
        studentName: studentName || null,
        clientName: clientName || null,
        staffName: staffName || null,
        description: description || null,
        tags: tags || null,
        metadata: JSON.stringify({ uploadedAt: new Date() }),
        uploadedBy: uploadedBy || 'System',
        version: "1.0",
      });

      res.status(201).json(document);
    } catch (error: any) {
      console.error("Document upload error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Update document
  app.put("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.updateDocument(req.params.id, req.body);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDocument(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json({ message: "Document deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Bulk delete documents
  app.post("/api/documents/bulk-delete", async (req, res) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Document IDs array is required" });
      }
      const deletedCount = await storage.bulkDeleteDocuments(ids);
      res.json({ 
        message: `${deletedCount} document(s) deleted successfully`,
        deletedCount 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ DOCUMENT GENERATION ROUTES ============

  // Generate Certificate
  app.post("/api/documents/generate-certificate", async (req, res) => {
    try {
      const { studentId, certificateType } = req.body;
      
      if (!studentId || !certificateType) {
        return res.status(400).json({ 
          message: "studentId and certificateType are required" 
        });
      }

      const student = await storage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Generate PDF
      const pdfBase64 = await PDFGenerator.generateCertificate({
        student,
        certificateType,
        issueDate: new Date(),
      });

      // Save document with enhanced schema
      const document = await storage.createDocument({
        title: `${certificateType} - ${student.name}`,
        type: "Certificate",
        category: "Student",
        fileType: "application/pdf",
        fileName: `${certificateType.replace(/\s+/g, '_')}_${student.name.replace(/\s+/g, '_')}.pdf`,
        fileSize: Math.ceil(pdfBase64.length * 0.75).toString(), // Approximate size
        studentId: student.id,
        studentName: student.name,
        clientId: null,
        staffId: null,
        clientName: null,
        staffName: null,
        content: pdfBase64,
        metadata: JSON.stringify({ certificateType }),
        tags: JSON.stringify(['certificate', 'student', certificateType.toLowerCase()]),
        description: `Certificate of ${certificateType} for ${student.name}`,
        uploadedBy: "System",
        version: "1.0",
      });

      res.status(201).json(document);
    } catch (error: any) {
      console.error("Certificate generation error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Generate Placement Letter
  app.post("/api/documents/generate-placement-letter", async (req, res) => {
    try {
      const { studentId, achievements } = req.body;
      
      if (!studentId) {
        return res.status(400).json({ message: "studentId is required" });
      }

      const student = await storage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Generate PDF
      const pdfBase64 = await PDFGenerator.generatePlacementLetter({
        student,
        completionDate: new Date(),
        achievements: achievements || [],
      });

      // Save document with enhanced schema
      const document = await storage.createDocument({
        title: `Placement Completion Letter - ${student.name}`,
        type: "Placement Letter",
        category: "Student",
        fileType: "application/pdf",
        fileName: `Placement_Letter_${student.name.replace(/\s+/g, '_')}.pdf`,
        fileSize: Math.ceil(pdfBase64.length * 0.75).toString(),
        studentId: student.id,
        studentName: student.name,
        clientId: null,
        staffId: null,
        clientName: null,
        staffName: null,
        content: pdfBase64,
        metadata: JSON.stringify({ achievements }),
        tags: JSON.stringify(['placement', 'letter', 'student']),
        description: `Placement completion letter for ${student.name}`,
        uploadedBy: "System",
        version: "1.0",
      });

      res.status(201).json(document);
    } catch (error: any) {
      console.error("Placement letter generation error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Generate Compliance Report
  app.post("/api/documents/generate-compliance-report", async (req, res) => {
    try {
      const { reportType, dateRange, summary } = req.body;
      
      if (!reportType) {
        return res.status(400).json({ message: "reportType is required" });
      }

      const defaultDateRange = {
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        end: new Date(),
      };

      // Generate PDF
      const pdfBase64 = await PDFGenerator.generateComplianceReport({
        reportType,
        dateRange: dateRange || defaultDateRange,
        summary: summary || "",
      });

      // Save document with enhanced schema
      const document = await storage.createDocument({
        title: `Compliance Report - ${reportType}`,
        type: "Compliance",
        category: "General",
        fileType: "application/pdf",
        fileName: `Compliance_Report_${reportType.replace(/\s+/g, '_')}.pdf`,
        fileSize: Math.ceil(pdfBase64.length * 0.75).toString(),
        studentId: null,
        clientId: null,
        staffId: null,
        studentName: null,
        clientName: null,
        staffName: null,
        content: pdfBase64,
        metadata: JSON.stringify({ reportType, dateRange: dateRange || defaultDateRange }),
        tags: JSON.stringify(['compliance', 'report', 'audit']),
        description: `Compliance audit report: ${reportType}`,
        uploadedBy: "System",
        version: "1.0",
      });

      res.status(201).json(document);
    } catch (error: any) {
      console.error("Compliance report generation error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ============ STAFF ROUTES ============
  
  app.get("/api/staff", async (_req, res) => {
    try {
      const staff = await storage.getStaff();
      res.json(staff);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/staff/:id", async (req, res) => {
    try {
      const staff = await storage.getStaffMember(req.params.id);
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      res.json(staff);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/staff", async (req, res) => {
    try {
      const staff = await storage.createStaff(req.body);
      res.status(201).json(staff);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/staff/:id", async (req, res) => {
    try {
      const staff = await storage.updateStaff(req.params.id, req.body);
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      res.json(staff);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/staff/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteStaff(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      res.json({ message: "Staff member deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ LEAVE REQUEST ROUTES ============
  
  app.get("/api/leave-requests", async (_req, res) => {
    try {
      const requests = await storage.getLeaveRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/leave-requests/staff/:staffId", async (req, res) => {
    try {
      const requests = await storage.getLeaveRequestsByStaff(req.params.staffId);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/leave-requests/status/:status", async (req, res) => {
    try {
      const requests = await storage.getLeaveRequestsByStatus(req.params.status);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/leave-requests/:id", async (req, res) => {
    try {
      const request = await storage.getLeaveRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Leave request not found" });
      }
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/leave-requests", async (req, res) => {
    try {
      const validatedData = insertLeaveRequestSchema.parse(req.body);
      const request = await storage.createLeaveRequest(validatedData);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/leave-requests/:id", async (req, res) => {
    try {
      const request = await storage.updateLeaveRequest(req.params.id, req.body);
      if (!request) {
        return res.status(404).json({ message: "Leave request not found" });
      }
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/leave-requests/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteLeaveRequest(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Leave request not found" });
      }
      res.json({ message: "Leave request deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ PAYROLL ROUTES ============
  
  app.get("/api/payroll", async (_req, res) => {
    try {
      const records = await storage.getPayrollRecords();
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/payroll/staff/:staffId", async (req, res) => {
    try {
      const records = await storage.getPayrollRecordsByStaff(req.params.staffId);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/payroll/:id", async (req, res) => {
    try {
      const record = await storage.getPayrollRecord(req.params.id);
      if (!record) {
        return res.status(404).json({ message: "Payroll record not found" });
      }
      res.json(record);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/payroll", async (req, res) => {
    try {
      const validatedData = insertPayrollRecordSchema.parse(req.body);
      const record = await storage.createPayrollRecord(validatedData);
      res.status(201).json(record);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/payroll/:id", async (req, res) => {
    try {
      const record = await storage.updatePayrollRecord(req.params.id, req.body);
      if (!record) {
        return res.status(404).json({ message: "Payroll record not found" });
      }
      res.json(record);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/payroll/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePayrollRecord(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Payroll record not found" });
      }
      res.json({ message: "Payroll record deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ PERFORMANCE REVIEW ROUTES ============
  
  app.get("/api/performance-reviews", async (_req, res) => {
    try {
      const reviews = await storage.getPerformanceReviews();
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/performance-reviews/staff/:staffId", async (req, res) => {
    try {
      const reviews = await storage.getPerformanceReviewsByStaff(req.params.staffId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/performance-reviews/reviewer/:reviewerId", async (req, res) => {
    try {
      const reviews = await storage.getPerformanceReviewsForReviewer(req.params.reviewerId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/performance-reviews/:id", async (req, res) => {
    try {
      const review = await storage.getPerformanceReview(req.params.id);
      if (!review) {
        return res.status(404).json({ message: "Performance review not found" });
      }
      res.json(review);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/performance-reviews", async (req, res) => {
    try {
      const validatedData = insertPerformanceReviewSchema.parse(req.body);
      const review = await storage.createPerformanceReview(validatedData);
      res.status(201).json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/performance-reviews/:id", async (req, res) => {
    try {
      const review = await storage.updatePerformanceReview(req.params.id, req.body);
      if (!review) {
        return res.status(404).json({ message: "Performance review not found" });
      }
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/performance-reviews/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePerformanceReview(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Performance review not found" });
      }
      res.json({ message: "Performance review deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ EMPLOYEE BENEFITS ROUTES ============
  
  app.get("/api/benefits", async (_req, res) => {
    try {
      const benefits = await storage.getEmployeeBenefits();
      res.json(benefits);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/benefits/staff/:staffId", async (req, res) => {
    try {
      const benefits = await storage.getEmployeeBenefitsByStaff(req.params.staffId);
      res.json(benefits);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/benefits/:id", async (req, res) => {
    try {
      const benefit = await storage.getEmployeeBenefit(req.params.id);
      if (!benefit) {
        return res.status(404).json({ message: "Benefit not found" });
      }
      res.json(benefit);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/benefits", async (req, res) => {
    try {
      const validatedData = insertEmployeeBenefitSchema.parse(req.body);
      const benefit = await storage.createEmployeeBenefit(validatedData);
      res.status(201).json(benefit);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/benefits/:id", async (req, res) => {
    try {
      const benefit = await storage.updateEmployeeBenefit(req.params.id, req.body);
      if (!benefit) {
        return res.status(404).json({ message: "Benefit not found" });
      }
      res.json(benefit);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/benefits/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEmployeeBenefit(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Benefit not found" });
      }
      res.json({ message: "Benefit deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ CLIENT ROUTES ============
  
  app.get("/api/clients", async (_req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/clients/by-source/:source", async (req, res) => {
    try {
      const clients = await storage.getClientsBySource(req.params.source);
      res.json(clients);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const client = await storage.createClient(req.body);
      res.status(201).json(client);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.updateClient(req.params.id, req.body);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteClient(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json({ message: "Client deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ OPERATING EXPENSES ROUTES ============
  
  app.get("/api/expenses", async (_req, res) => {
    try {
      const expenses = await storage.getOperatingExpenses();
      res.json(expenses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/expenses/by-status/:status", async (req, res) => {
    try {
      const expenses = await storage.getExpensesByStatus(req.params.status);
      res.json(expenses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/expenses/:id", async (req, res) => {
    try {
      const expense = await storage.getOperatingExpense(req.params.id);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const expense = await storage.createOperatingExpense(req.body);
      res.status(201).json(expense);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const expense = await storage.updateOperatingExpense(req.params.id, req.body);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteOperatingExpense(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json({ message: "Expense deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ JOB INVOICES ROUTES ============
  
  app.get("/api/invoices", async (_req, res) => {
    try {
      const invoices = await storage.getJobInvoices();
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/invoices/by-client/:clientId", async (req, res) => {
    try {
      const invoices = await storage.getInvoicesByClient(req.params.clientId);
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/invoices/by-status/:status", async (req, res) => {
    try {
      const invoices = await storage.getInvoicesByPaymentStatus(req.params.status);
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.getJobInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      // Apply insurance billing logic if client is insurance
      const insuranceSplit = await BusinessLogic.calculateInsuranceBilling({
        clientId: req.body.clientId,
        partsTotal: req.body.partsTotal,
        laborTotal: req.body.laborTotal,
        taxRate: req.body.taxRate,
      });

      // Enhance invoice with calculated insurance amounts
      const enhancedData = {
        ...req.body,
        insuranceExcess: insuranceSplit.insuranceExcess,
        insuranceClaimAmount: insuranceSplit.insuranceClaimAmount,
        clientSource: req.body.clientSource || (insuranceSplit.isInsuranceJob ? "Insurance" : "Direct"),
      };

      const invoice = await storage.createJobInvoice(enhancedData);
      res.status(201).json(invoice);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.updateJobInvoice(req.params.id, req.body);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteJobInvoice(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json({ message: "Invoice deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ TESTIMONIALS ROUTES ============
  
  app.get("/api/testimonials", async (_req, res) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/testimonials/by-student/:studentId", async (req, res) => {
    try {
      const testimonials = await storage.getTestimonialsByStudent(req.params.studentId);
      res.json(testimonials);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/testimonials/:id", async (req, res) => {
    try {
      const testimonial = await storage.getTestimonial(req.params.id);
      if (!testimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      res.json(testimonial);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/testimonials", async (req, res) => {
    try {
      const testimonial = await storage.createTestimonial(req.body);
      res.status(201).json(testimonial);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/testimonials/:id", async (req, res) => {
    try {
      const testimonial = await storage.updateTestimonial(req.params.id, req.body);
      if (!testimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      res.json(testimonial);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/testimonials/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTestimonial(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      res.json({ message: "Testimonial deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ HR NOTES ROUTES ============
  
  app.get("/api/hr-notes", async (_req, res) => {
    try {
      const notes = await storage.getHRNotes();
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/hr-notes/pinned", async (_req, res) => {
    try {
      const notes = await storage.getPinnedHRNotes();
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/hr-notes/:id", async (req, res) => {
    try {
      const note = await storage.getHRNote(req.params.id);
      if (!note) {
        return res.status(404).json({ message: "HR note not found" });
      }
      res.json(note);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/hr-notes", async (req, res) => {
    try {
      // Apply HR notification logic to auto-pin HR staff notes
      const pinResult = await BusinessLogic.createHRNotification({
        authorId: req.body.authorId,
        authorName: req.body.authorName,
        content: req.body.content,
        targetAudience: req.body.targetAudience,
        priority: req.body.priority,
        category: req.body.category,
      });

      const note = await storage.createHRNote({
        ...req.body,
        isPinned: pinResult.isPinned ? 'true' : 'false',
      });

      res.status(201).json({
        ...note,
        _businessLogicApplied: {
          autoPinned: pinResult.isPinned,
          pinnedDurationHours: pinResult.pinnedDurationHours,
        },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/hr-notes/:id", async (req, res) => {
    try {
      const note = await storage.updateHRNote(req.params.id, req.body);
      if (!note) {
        return res.status(404).json({ message: "HR note not found" });
      }
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/hr-notes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteHRNote(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "HR note not found" });
      }
      res.json({ message: "HR note deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ CERTIFICATES ROUTES ============
  
  app.get("/api/certificates", async (_req, res) => {
    try {
      const certificates = await storage.getCertificates();
      res.json(certificates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/certificates/by-student/:studentId", async (req, res) => {
    try {
      const certificates = await storage.getCertificatesByStudent(req.params.studentId);
      res.json(certificates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/certificates/:id", async (req, res) => {
    try {
      const certificate = await storage.getCertificate(req.params.id);
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      res.json(certificate);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/certificates", async (req, res) => {
    try {
      const certificate = await storage.createCertificate(req.body);
      res.status(201).json(certificate);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/certificates/:id", async (req, res) => {
    try {
      const certificate = await storage.updateCertificate(req.params.id, req.body);
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      res.json(certificate);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/certificates/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCertificate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      res.json({ message: "Certificate deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ BUSINESS LOGIC ROUTES ============

  // Run scheduled business logic tasks
  app.post("/api/business-logic/run-scheduled-tasks", async (_req, res) => {
    try {
      await BusinessLogic.runScheduledTasks();
      res.json({ 
        status: "success",
        message: "Scheduled tasks executed successfully",
        timestamp: new Date(),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get invoice split details for insurance jobs
  app.post("/api/business-logic/calculate-invoice-split", async (req, res) => {
    try {
      const { totalAmount, insuranceExcess, insuranceClaimAmount } = req.body;
      
      if (!totalAmount || !insuranceExcess || !insuranceClaimAmount) {
        return res.status(400).json({ 
          message: "totalAmount, insuranceExcess, and insuranceClaimAmount are required" 
        });
      }

      const splitDetails = BusinessLogic.getInvoiceSplitDetails(
        totalAmount,
        insuranceExcess,
        insuranceClaimAmount
      );

      res.json(splitDetails);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get expiring pinned HR notes
  app.get("/api/business-logic/expiring-hr-notes", async (_req, res) => {
    try {
      const expiringNotes = await BusinessLogic.getExpiringPinnedNotes();
      res.json({
        count: expiringNotes.length,
        notes: expiringNotes,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Process student graduations manually
  app.post("/api/business-logic/process-graduations", async (_req, res) => {
    try {
      await BusinessLogic.processStudentGraduations();
      res.json({ 
        status: "success",
        message: "Student graduation workflow processed",
        timestamp: new Date(),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ VEHICLES ROUTES ============

  app.get("/api/vehicles", async (_req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/vehicles/by-client/:clientId", async (req, res) => {
    try {
      const vehicles = await storage.getVehiclesByClient(req.params.clientId);
      res.json(vehicles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Vehicle lookup by registration/license plate (for OCR data)
  app.get("/api/vehicles/by-registration/:plate", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      const found = vehicles.filter((v) =>
        v.licensePlate?.toUpperCase().includes(req.params.plate.toUpperCase())
      );
      res.json(found);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Vehicle lookup by VIN (for OCR data)
  app.get("/api/vehicles/by-vin/:vin", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      const found = vehicles.filter((v) =>
        v.vin?.toUpperCase().startsWith(req.params.vin.toUpperCase().substring(0, 8))
      );
      res.json(found);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const vehicle = await storage.createVehicle(req.body);
      res.status(201).json(vehicle);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.updateVehicle(req.params.id, req.body);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteVehicle(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json({ message: "Vehicle deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ VEHICLE INSPECTIONS ROUTES ============

  app.get("/api/inspections", async (_req, res) => {
    try {
      const inspections = await storage.getVehicleInspections();
      res.json(inspections);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/inspections/:id", async (req, res) => {
    try {
      const inspection = await storage.getVehicleInspection(req.params.id);
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      res.json(inspection);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/inspections/by-vehicle/:vehicleId", async (req, res) => {
    try {
      const inspections = await storage.getInspectionsByVehicle(req.params.vehicleId);
      res.json(inspections);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/inspections/by-inspector/:inspectorId", async (req, res) => {
    try {
      const inspections = await storage.getInspectionsByInspector(req.params.inspectorId);
      res.json(inspections);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/inspections/by-status/:status", async (req, res) => {
    try {
      const inspections = await storage.getInspectionsByStatus(req.params.status);
      res.json(inspections);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/inspections", async (req, res) => {
    try {
      const inspection = await storage.createVehicleInspection(req.body);
      res.status(201).json(inspection);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/inspections/:id", async (req, res) => {
    try {
      const inspection = await storage.updateVehicleInspection(req.params.id, req.body);
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      res.json(inspection);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/inspections/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteVehicleInspection(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      res.json({ message: "Inspection deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ INSPECTION MEDIA ROUTES ============

  app.get("/api/inspections/:inspectionId/media", async (req, res) => {
    try {
      const media = await storage.getInspectionMedia(req.params.inspectionId);
      res.json(media);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/inspections/:inspectionId/media", async (req, res) => {
    try {
      const media = await storage.createInspectionMedia({
        ...req.body,
        inspectionId: req.params.inspectionId,
      });
      res.status(201).json(media);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/inspections/media/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteInspectionMedia(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Media not found" });
      }
      res.json({ message: "Media deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Send inspection to client
  app.post("/api/inspections/:id/send-to-client", async (req, res) => {
    try {
      const inspection = await storage.getVehicleInspection(req.params.id);
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }

      // Update inspection status
      await storage.updateVehicleInspection(req.params.id, {
        sentToClient: 'true',
        sentToClientDate: new Date(),
        overallStatus: 'Sent to Client',
      });

      // In a real implementation, you would send an email/SMS here
      // For now, we'll just simulate success
      res.json({
        success: true,
        message: `Inspection report sent to ${inspection.clientEmail || inspection.clientPhone || 'client'}`,
        sentDate: new Date(),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ JOBS ROUTES ============

  app.get("/api/jobs", async (_req, res) => {
    try {
      const jobs = await storage.getJobs();
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/jobs/by-status/:status", async (req, res) => {
    try {
      const jobs = await storage.getJobsByStatus(req.params.status);
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/jobs/by-vehicle/:vehicleId", async (req, res) => {
    try {
      const jobs = await storage.getJobsByVehicle(req.params.vehicleId);
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/jobs/by-client/:clientId", async (req, res) => {
    try {
      const jobs = await storage.getJobsByClient(req.params.clientId);
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/jobs/by-assignee/:assignedToId", async (req, res) => {
    try {
      const jobs = await storage.getJobsByAssignee(req.params.assignedToId);
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const job = await storage.createJob(req.body);
      try {
        // notify realtime clients
        const { broadcast } = await import("./realtime");
        broadcast("job.created", job);
      } catch (e) {
        console.warn("Realtime broadcast failed:", e);
      }
      res.status(201).json(job);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.updateJob(req.params.id, req.body);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      try {
        const { broadcast } = await import("./realtime");
        broadcast("job.updated", job);
      } catch (e) {
        console.warn("Realtime broadcast failed:", e);
      }
      res.json(job);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteJob(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json({ message: "Job deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ SUPPLIERS ROUTES ============

  app.get("/api/suppliers", async (_req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.getSupplier(req.params.id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/suppliers/by-status/:status", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliersByStatus(req.params.status);
      res.json(suppliers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const supplier = await storage.createSupplier(req.body);
      res.status(201).json(supplier);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.updateSupplier(req.params.id, req.body);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSupplier(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json({ message: "Supplier deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ INVENTORY ITEMS ROUTES ============

  app.get("/api/inventory", async (_req, res) => {
    try {
      const items = await storage.getInventoryItems();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/inventory/low-stock", async (_req, res) => {
    try {
      const items = await storage.getLowStockItems();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/inventory/search/:query", async (req, res) => {
    try {
      const items = await storage.searchInventoryItems(req.params.query);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/inventory/category/:category", async (req, res) => {
    try {
      const items = await storage.getInventoryItemsByCategory(req.params.category);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/inventory/supplier/:supplierId", async (req, res) => {
    try {
      const items = await storage.getInventoryItemsBySupplier(req.params.supplierId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/inventory/:id", async (req, res) => {
    try {
      const item = await storage.getInventoryItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const item = await storage.createInventoryItem(req.body);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/inventory/:id", async (req, res) => {
    try {
      const item = await storage.updateInventoryItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/inventory/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteInventoryItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.json({ message: "Inventory item deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update stock (add or subtract)
  app.post("/api/inventory/:id/stock", async (req, res) => {
    try {
      const { quantity, type, performedBy, reason, notes } = req.body;
      
      if (!quantity || !type || !performedBy) {
        return res.status(400).json({ 
          message: "quantity, type, and performedBy are required" 
        });
      }

      const item = await storage.getInventoryItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }

      const quantityBefore = item.stock;
      const updatedItem = await storage.updateItemStock(req.params.id, quantity, type);
      
      if (!updatedItem) {
        return res.status(500).json({ message: "Failed to update stock" });
      }

      // Create transaction record
      await storage.createInventoryTransaction({
        itemId: item.id,
        itemName: item.name,
        itemSku: item.sku,
        type: type === 'add' ? 'purchase' : 'adjustment',
        quantity: type === 'add' ? quantity : `-${quantity}`,
        quantityBefore,
        quantityAfter: updatedItem.stock,
        unitCost: item.costPrice,
        totalCost: (parseFloat(item.costPrice) * parseFloat(quantity)).toString(),
        referenceType: 'manual',
        referenceId: null,
        jobId: null,
        purchaseOrderId: null,
        performedBy,
        transactionDate: new Date(),
        reason: reason || null,
        notes: notes || null,
      });

      res.json(updatedItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ PURCHASE ORDERS ROUTES ============

  app.get("/api/purchase-orders", async (_req, res) => {
    try {
      const pos = await storage.getPurchaseOrders();
      res.json(pos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/purchase-orders/next-number", async (_req, res) => {
    try {
      const nextNumber = await storage.getNextPONumber();
      res.json({ poNumber: nextNumber });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/purchase-orders/:id", async (req, res) => {
    try {
      const po = await storage.getPurchaseOrder(req.params.id);
      if (!po) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      res.json(po);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/purchase-orders/supplier/:supplierId", async (req, res) => {
    try {
      const pos = await storage.getPurchaseOrdersBySupplier(req.params.supplierId);
      res.json(pos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/purchase-orders/status/:status", async (req, res) => {
    try {
      const pos = await storage.getPurchaseOrdersByStatus(req.params.status);
      res.json(pos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/purchase-orders", async (req, res) => {
    try {
      const po = await storage.createPurchaseOrder(req.body);
      res.status(201).json(po);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/purchase-orders/:id", async (req, res) => {
    try {
      const po = await storage.updatePurchaseOrder(req.params.id, req.body);
      if (!po) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      res.json(po);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/purchase-orders/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePurchaseOrder(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      res.json({ message: "Purchase order deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Receive purchase order (updates stock)
  app.post("/api/purchase-orders/:id/receive", async (req, res) => {
    try {
      const { receivedBy, receivedItems } = req.body;
      
      if (!receivedBy || !receivedItems || !Array.isArray(receivedItems)) {
        return res.status(400).json({ 
          message: "receivedBy and receivedItems array are required" 
        });
      }

      const po = await storage.getPurchaseOrder(req.params.id);
      if (!po) {
        return res.status(404).json({ message: "Purchase order not found" });
      }

      // Update stock for each item
      for (const receivedItem of receivedItems) {
        const { itemId, quantityReceived } = receivedItem;
        const item = await storage.getInventoryItem(itemId);
        
        if (item) {
          const quantityBefore = item.stock;
          await storage.updateItemStock(itemId, quantityReceived, 'add');
          
          // Create transaction
          await storage.createInventoryTransaction({
            itemId,
            itemName: item.name,
            itemSku: item.sku,
            type: 'purchase',
            quantity: quantityReceived,
            quantityBefore,
            quantityAfter: (parseFloat(quantityBefore) + parseFloat(quantityReceived)).toString(),
            unitCost: item.costPrice,
            totalCost: (parseFloat(item.costPrice) * parseFloat(quantityReceived)).toString(),
            referenceType: 'purchase_order',
            referenceId: po.id,
            jobId: null,
            purchaseOrderId: po.id,
            performedBy: receivedBy,
            transactionDate: new Date(),
            reason: `Received from PO ${po.poNumber}`,
            notes: null,
          });
        }
      }

      // Update PO status
      const updatedPO = await storage.updatePurchaseOrder(req.params.id, {
        status: 'Received',
        receivedBy,
        actualDeliveryDate: new Date(),
      });

      res.json({ 
        message: "Purchase order received successfully",
        purchaseOrder: updatedPO 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ INVENTORY TRANSACTIONS ROUTES ============

  app.get("/api/inventory-transactions", async (_req, res) => {
    try {
      const transactions = await storage.getInventoryTransactions();
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/inventory-transactions/item/:itemId", async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByItem(req.params.itemId);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/inventory-transactions/job/:jobId", async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByJob(req.params.jobId);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/inventory-transactions/type/:type", async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByType(req.params.type);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ PARTS USAGE ROUTES ============

  app.get("/api/parts-usage", async (_req, res) => {
    try {
      const usage = await storage.getPartsUsage();
      res.json(usage);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/parts-usage/job/:jobId", async (req, res) => {
    try {
      const usage = await storage.getPartsUsageByJob(req.params.jobId);
      res.json(usage);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/parts-usage/item/:itemId", async (req, res) => {
    try {
      const usage = await storage.getPartsUsageByItem(req.params.itemId);
      res.json(usage);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/parts-usage", async (req, res) => {
    try {
      const usage = await storage.createPartsUsage(req.body);
      
      // Deduct from inventory
      const item = await storage.getInventoryItem(req.body.itemId);
      if (item) {
        const quantityBefore = item.stock;
        await storage.updateItemStock(req.body.itemId, req.body.quantity, 'subtract');
        
        // Create transaction
        await storage.createInventoryTransaction({
          itemId: req.body.itemId,
          itemName: req.body.itemName,
          itemSku: req.body.itemSku,
          type: 'usage',
          quantity: `-${req.body.quantity}`,
          quantityBefore,
          quantityAfter: (parseFloat(quantityBefore) - parseFloat(req.body.quantity)).toString(),
          unitCost: req.body.unitCost,
          totalCost: req.body.totalCost,
          referenceType: 'job',
          referenceId: req.body.jobId,
          jobId: req.body.jobId,
          purchaseOrderId: null,
          performedBy: req.body.usedBy || 'System',
          transactionDate: new Date(),
          reason: `Used in job ${req.body.jobNumber}`,
          notes: req.body.notes || null,
        });
      }
      
      res.status(201).json(usage);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/parts-usage/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePartsUsage(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Parts usage record not found" });
      }
      res.json({ message: "Parts usage deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ ANALYTICS ROUTES ============

  app.get("/api/analytics/overview", async (_req, res) => {
    try {
      const [
        students,
        staff,
        clients,
        vehicles,
        jobs,
        invoices,
        expenses,
        inventory,
      ] = await Promise.all([
        storage.getStudents(),
        storage.getStaff(),
        storage.getClients(),
        storage.getVehicles(),
        storage.getJobs(),
        storage.getJobInvoices(),
        storage.getOperatingExpenses(),
        storage.getInventoryItems(),
      ]);

      const totalRevenue = invoices.reduce((sum, inv) => 
        sum + parseFloat(inv.totalAmount || "0"), 0
      );
      
      const totalExpenses = expenses.reduce((sum, exp) => 
        sum + parseFloat(exp.amount || "0"), 0
      );
      
      const inventoryValue = inventory.reduce((sum, item) => 
        sum + (parseFloat(item.stock) * parseFloat(item.costPrice)), 0
      );

      res.json({
        students: {
          total: students.length,
          active: students.filter(s => s.status === 'Active').length,
          completed: students.filter(s => s.status === 'Completed').length,
        },
        staff: {
          total: staff.length,
          active: staff.filter(s => s.status === 'Active').length,
        },
        clients: {
          total: clients.length,
          active: clients.filter(c => c.status === 'Active').length,
          bySource: {
            direct: clients.filter(c => c.source === 'Direct').length,
            insurance: clients.filter(c => c.source.includes('Insurance')).length,
            corporate: clients.filter(c => c.source.includes('Fleet') || c.source.includes('Corporate')).length,
          },
        },
        vehicles: {
          total: vehicles.length,
          inService: vehicles.filter(v => v.status === 'In Service').length,
        },
        jobs: {
          total: jobs.length,
          pending: jobs.filter(j => j.status === 'Pending').length,
          inProgress: jobs.filter(j => j.status === 'In Progress').length,
          completed: jobs.filter(j => j.status === 'Completed').length,
        },
        financials: {
          totalRevenue,
          totalExpenses,
          netProfit: totalRevenue - totalExpenses,
          inventoryValue,
        },
        inventory: {
          totalItems: inventory.length,
          lowStock: inventory.filter(i => i.isLowStock === 'true').length,
          outOfStock: inventory.filter(i => parseFloat(i.stock) === 0).length,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/analytics/revenue", async (_req, res) => {
    try {
      const invoices = await storage.getJobInvoices();
      const jobs = await storage.getJobs();
      
      // Revenue by month (last 6 months)
      const monthlyRevenue = new Map<string, number>();
      const today = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyRevenue.set(key, 0);
      }
      
      invoices.forEach(inv => {
        if (inv.invoiceDate) {
          const date = new Date(inv.invoiceDate);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (monthlyRevenue.has(key)) {
            monthlyRevenue.set(key, monthlyRevenue.get(key)! + parseFloat(inv.totalAmount || "0"));
          }
        }
      });
      
      const revenueByMonth = Array.from(monthlyRevenue.entries()).map(([month, revenue]) => ({
        month,
        revenue: parseFloat(revenue.toFixed(2)),
      }));

      // Revenue by job type
      const revenueByJobType = new Map<string, number>();
      jobs.forEach(job => {
        const type = job.type || 'Other';
        const cost = parseFloat(job.actualCost || "0");
        revenueByJobType.set(type, (revenueByJobType.get(type) || 0) + cost);
      });
      
      const revenueByType = Array.from(revenueByJobType.entries()).map(([type, revenue]) => ({
        type,
        revenue: parseFloat(revenue.toFixed(2)),
      }));

      res.json({
        revenueByMonth,
        revenueByType,
        totalRevenue: invoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || "0"), 0),
        paidInvoices: invoices.filter(i => i.paymentStatus === 'Paid').length,
        pendingInvoices: invoices.filter(i => i.paymentStatus === 'Unpaid').length,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/analytics/inventory", async (_req, res) => {
    try {
      const [inventory, transactions, partsUsage] = await Promise.all([
        storage.getInventoryItems(),
        storage.getInventoryTransactions(),
        storage.getPartsUsage(),
      ]);

      // Total inventory value
      const totalValue = inventory.reduce((sum, item) => 
        sum + (parseFloat(item.stock) * parseFloat(item.costPrice)), 0
      );

      // Stock by category
      const stockByCategory = new Map<string, { count: number; value: number }>();
      inventory.forEach(item => {
        const category = item.category;
        const current = stockByCategory.get(category) || { count: 0, value: 0 };
        stockByCategory.set(category, {
          count: current.count + 1,
          value: current.value + (parseFloat(item.stock) * parseFloat(item.costPrice)),
        });
      });

      // Top used parts
      const usageByItem = new Map<string, { name: string; sku: string; quantity: number; profit: number }>();
      partsUsage.forEach(pu => {
        const current = usageByItem.get(pu.itemId) || { 
          name: pu.itemName, 
          sku: pu.itemSku, 
          quantity: 0, 
          profit: 0 
        };
        usageByItem.set(pu.itemId, {
          ...current,
          quantity: current.quantity + parseFloat(pu.quantity),
          profit: current.profit + parseFloat(pu.profit),
        });
      });

      const topUsedParts = Array.from(usageByItem.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      // Inventory turnover (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentUsage = partsUsage.filter(pu => 
        pu.usedDate && new Date(pu.usedDate) > thirtyDaysAgo
      );

      res.json({
        totalValue: parseFloat(totalValue.toFixed(2)),
        totalItems: inventory.length,
        lowStockItems: inventory.filter(i => i.isLowStock === 'true').length,
        outOfStockItems: inventory.filter(i => parseFloat(i.stock) === 0).length,
        stockByCategory: Array.from(stockByCategory.entries()).map(([category, data]) => ({
          category,
          itemCount: data.count,
          value: parseFloat(data.value.toFixed(2)),
        })),
        topUsedParts,
        recentTransactions: transactions.slice(-20).reverse(),
        turnoverRate: {
          period: '30 days',
          partsUsed: recentUsage.length,
          revenue: recentUsage.reduce((sum, pu) => sum + parseFloat(pu.totalPrice), 0),
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/analytics/staff", async (_req, res) => {
    try {
      const [staff, jobs, students] = await Promise.all([
        storage.getStaff(),
        storage.getJobs(),
        storage.getStudents(),
      ]);

      // Jobs by staff member
      const jobsByStaff = new Map<string, { name: string; jobCount: number; completed: number }>();
      jobs.forEach(job => {
        if (job.assignedToId && job.assignedToName) {
          const current = jobsByStaff.get(job.assignedToId) || { 
            name: job.assignedToName, 
            jobCount: 0, 
            completed: 0 
          };
          jobsByStaff.set(job.assignedToId, {
            name: current.name,
            jobCount: current.jobCount + 1,
            completed: current.completed + (job.status === 'Completed' ? 1 : 0),
          });
        }
      });

      const staffPerformance = Array.from(jobsByStaff.entries()).map(([id, data]) => ({
        staffId: id,
        staffName: data.name,
        totalJobs: data.jobCount,
        completedJobs: data.completed,
        completionRate: data.jobCount > 0 ? ((data.completed / data.jobCount) * 100).toFixed(1) : '0',
      }));

      res.json({
        totalStaff: staff.length,
        activeStaff: staff.filter(s => s.status === 'Active').length,
        staffPerformance,
        totalStudents: students.length,
        activeStudents: students.filter(s => s.status === 'Active').length,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/analytics/jobs", async (_req, res) => {
    try {
      const jobs = await storage.getJobs();

      // Jobs by status
      const jobsByStatus = {
        pending: jobs.filter(j => j.status === 'Pending').length,
        inProgress: jobs.filter(j => j.status === 'In Progress').length,
        completed: jobs.filter(j => j.status === 'Completed').length,
        cancelled: jobs.filter(j => j.status === 'Cancelled').length,
      };

      // Jobs by type
      const jobsByType = new Map<string, number>();
      jobs.forEach(job => {
        const type = job.type || 'Other';
        jobsByType.set(type, (jobsByType.get(type) || 0) + 1);
      });

      // Average completion time for completed jobs
      const completedJobs = jobs.filter(j => j.completedDate && j.startedDate);
      const avgCompletionTime = completedJobs.length > 0
        ? completedJobs.reduce((sum, job) => {
            const completed = new Date(job.completedDate!).getTime();
            const started = new Date(job.startedDate!).getTime();
            return sum + (completed - started);
          }, 0) / completedJobs.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0;

      res.json({
        totalJobs: jobs.length,
        jobsByStatus,
        jobsByType: Array.from(jobsByType.entries()).map(([type, count]) => ({ type, count })),
        avgCompletionTimeDays: parseFloat(avgCompletionTime.toFixed(1)),
        completedJobs: completedJobs.length,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ GLOBAL SEARCH ROUTES ============

  // Global search across all entities
  app.get("/api/search/global/:query", async (req, res) => {
    try {
      const query = decodeURIComponent(req.params.query).toLowerCase();
      const results: any[] = [];

      // Search students
      const students = await storage.getStudents();
      students.forEach(student => {
        if (
          student.name.toLowerCase().includes(query) ||
          student.email?.toLowerCase().includes(query) ||
          student.department?.toLowerCase().includes(query)
        ) {
          results.push({
            id: student.id,
            type: 'student',
            title: student.name,
            description: `${student.role} - ${student.email}`,
            relevance: student.name.toLowerCase().includes(query) ? 1 : 0.8,
          });
        }
      });

      // Search documents
      const documents = await storage.getDocuments();
      documents.forEach(doc => {
        if (
          doc.title.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query) ||
          doc.studentName?.toLowerCase().includes(query) ||
          doc.clientName?.toLowerCase().includes(query)
        ) {
          results.push({
            id: doc.id,
            type: 'document',
            title: doc.title,
            description: `${doc.type} - ${doc.studentName || doc.clientName || 'N/A'}`,
            relevance: doc.title.toLowerCase().includes(query) ? 1 : 0.8,
          });
        }
      });

      // Search vehicles
      const vehicles = await storage.getVehicles();
      vehicles.forEach(vehicle => {
        if (
          vehicle.licensePlate?.toLowerCase().includes(query) ||
          vehicle.vin?.toLowerCase().includes(query) ||
          vehicle.clientName?.toLowerCase().includes(query) ||
          vehicle.make?.toLowerCase().includes(query) ||
          vehicle.model?.toLowerCase().includes(query)
        ) {
          results.push({
            id: vehicle.id,
            type: 'vehicle',
            title: `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`,
            description: `VIN: ${vehicle.vin} - ${vehicle.clientName}`,
            relevance: vehicle.licensePlate?.toLowerCase().includes(query) ? 1 : 0.7,
          });
        }
      });

      // Search clients
      const clients = await storage.getClients();
      clients.forEach(client => {
        if (
          client.name.toLowerCase().includes(query) ||
          client.email?.toLowerCase().includes(query) ||
          client.companyName?.toLowerCase().includes(query)
        ) {
          results.push({
            id: client.id,
            type: 'client',
            title: client.name,
            description: `${client.accountType} - ${client.email}`,
            relevance: client.name.toLowerCase().includes(query) ? 1 : 0.8,
          });
        }
      });

      // Search jobs
      const jobs = await storage.getJobs();
      jobs.forEach(job => {
        if (
          job.jobNumber.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query)
        ) {
          results.push({
            id: job.id,
            type: 'job',
            title: `Job ${job.jobNumber}`,
            description: job.description || 'No description',
            relevance: job.jobNumber.toLowerCase().includes(query) ? 1 : 0.8,
          });
        }
      });

      // Sort by relevance
      results.sort((a, b) => b.relevance - a.relevance);

      res.json(results.slice(0, 20));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Autocomplete suggestions
  app.get("/api/search/autocomplete/:query", async (req, res) => {
    try {
      const query = decodeURIComponent(req.params.query).toLowerCase();
      const results: any[] = [];

      // Autocomplete from documents (most frequently searched)
      const documents = await storage.getDocuments();
      documents.forEach(doc => {
        if (doc.title.toLowerCase().includes(query)) {
          results.push({
            id: doc.id,
            type: 'document',
            title: doc.title,
            description: `Document - ${doc.type}`,
            relevance: 1,
          });
        }
      });

      // Autocomplete from vehicles
      const vehicles = await storage.getVehicles();
      vehicles.forEach(vehicle => {
        if (
          vehicle.licensePlate?.toLowerCase().includes(query) ||
          vehicle.vin?.toLowerCase().includes(query)
        ) {
          results.push({
            id: vehicle.id,
            type: 'vehicle',
            title: `${vehicle.licensePlate || vehicle.vin}`,
            description: `${vehicle.make} ${vehicle.model}`,
            relevance: vehicle.licensePlate?.toLowerCase().includes(query) ? 1 : 0.9,
          });
        }
      });

      // Autocomplete from clients
      const clients = await storage.getClients();
      clients.forEach(client => {
        if (client.name.toLowerCase().startsWith(query) || client.name.toLowerCase().includes(query)) {
          results.push({
            id: client.id,
            type: 'client',
            title: client.name,
            description: client.accountType,
            relevance: client.name.toLowerCase().startsWith(query) ? 1 : 0.8,
          });
        }
      });

      // Sort by relevance and limit
      results.sort((a, b) => b.relevance - a.relevance);

      res.json(results.slice(0, 8));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;

}
