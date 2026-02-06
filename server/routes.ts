import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { PDFGenerator } from "./pdfGenerator";
import BusinessLogic from "./businessLogic";
import { 
  insertStudentSchema, 
  insertDocumentSchema,
  insertStaffSchema,
  insertClientSchema,
  insertOperatingExpenseSchema,
  insertJobInvoiceSchema,
  insertTestimonialSchema,
  insertHRNoteSchema,
  insertCertificateSchema,
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

      // Save document
      const document = await storage.createDocument({
        title: `${certificateType} - ${student.name}`,
        type: "Certificate",
        studentId: student.id,
        studentName: student.name,
        content: pdfBase64,
        metadata: JSON.stringify({ certificateType }),
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

      // Save document
      const document = await storage.createDocument({
        title: `Placement Completion Letter - ${student.name}`,
        type: "Placement Letter",
        studentId: student.id,
        studentName: student.name,
        content: pdfBase64,
        metadata: JSON.stringify({ achievements }),
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

      // Save document
      const document = await storage.createDocument({
        title: `Compliance Report - ${reportType}`,
        type: "Compliance",
        studentId: null,
        studentName: "Admin",
        content: pdfBase64,
        metadata: JSON.stringify({ reportType, dateRange: dateRange || defaultDateRange }),
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

  return httpServer;
}
