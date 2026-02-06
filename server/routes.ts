import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { PDFGenerator } from "./pdfGenerator";
import { insertStudentSchema, insertDocumentSchema } from "@shared/schema";

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

  return httpServer;
}
