// ============ MOBILE PORTAL API ROUTES ============
// These routes should be added to server/routes.ts

import type { Express } from "express";
import { storage } from "./storage";
import { randomBytes } from "crypto";
import { eq, sql, desc } from "drizzle-orm";
import { jobs, documents } from "../shared/schema";

export async function registerMobilePortalRoutes(app: Express): Promise<void> {
  // ============ QR TOKEN ROUTES ============

  // POST /api/qr-tokens - Generate new QR token (admin only)
  app.post("/api/qr-tokens", async (req, res) => {
    try {
      const { clientId, clientName, actionType, expiresInDays, createdBy } = req.body;

      if (!clientId || !actionType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Generate unique token
      const tokenString = randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 30));

      // Build access URL
      const baseUrl = process.env.VITE_APP_URL || "http://localhost:5000";
      const accessUrl = `${baseUrl}/mobile-portal?token=${tokenString}&action=${actionType}`;

      // Create QR code URL (would generate QR in client-side typically)
      // For now, just mark where it would be generated

      // Save token to database
      const token = await storage.createQRToken({
        clientId,
        clientName,
        actionType,
        tokenString,
        accessUrl,
        expiresAt,
        createdBy,
      });

      res.json({
        id: token.id,
        clientId: token.clientId,
        clientName: token.clientName,
        actionType: token.actionType,
        tokenString: token.tokenString,
        accessUrl: token.accessUrl,
        expiresAt: token.expiresAt,
        qrCodeUrl: null, // QR code generated on client-side with qrcode.react
      });
    } catch (error: any) {
      console.error("QR token creation failed:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/qr-tokens/:tokenId/validate - Validate QR token
  app.get("/api/qr-tokens/:tokenId/validate", async (req, res) => {
    try {
      const { tokenId } = req.params;

      const token = await storage.getQRToken(tokenId);

      if (!token) {
        return res.json({
          valid: false,
          reason: "not found",
        });
      }

      // Check if revoked
      if (token.revokedAt) {
        return res.json({
          valid: false,
          reason: "revoked",
        });
      }

      // Check if expired
      if (new Date() > new Date(token.expiresAt)) {
        return res.json({
          valid: false,
          reason: "expired",
        });
      }

      // Update usage count
      await storage.updateQRTokenUsage(tokenId);

      return res.json({
        valid: true,
        clientId: token.clientId,
        clientName: token.clientName,
        actionType: token.actionType,
        expiresAt: token.expiresAt,
      });
    } catch (error: any) {
      console.error("QR token validation failed:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/qr-tokens/admin - List all tokens (admin only)
  app.get("/api/qr-tokens/admin", async (_req, res) => {
    try {
      const tokens = await storage.listQRTokens();
      res.json(tokens);
    } catch (error: any) {
      console.error("Failed to list QR tokens:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // DELETE /api/qr-tokens/:tokenId - Revoke token (admin only)
  app.delete("/api/qr-tokens/:tokenId", async (req, res) => {
    try {
      const { tokenId } = req.params;
      await storage.revokeQRToken(tokenId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Failed to revoke token:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/qr-tokens/stats - Get QR token statistics
  app.get("/api/qr-tokens/stats", async (_req, res) => {
    try {
      const stats = await storage.getQRTokenStats();
      res.json(stats);
    } catch (error: any) {
      console.error("Failed to get QR stats:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ============ MOBILE DOCUMENT ROUTES ============

  // POST /api/documents/mobile - Submit document from mobile
  app.post("/api/documents/mobile", async (req, res) => {
    try {
      const { clientId, documentType, extractedData, editedFields, originalPhotos, metadata } = req.body;

      if (!clientId || !originalPhotos?.length) {
        return res.status(400).json({ message: "Missing clientId or photos" });
      }

      // Find client name
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      // Save photos (convert base64 to files if needed, or store as base64)
      // For now, store first photo as base64 content
      const fileContent = originalPhotos[0]; // Save first photo as content

      const document = await storage.createDocument({
        title: `Mobile Captured - ${new Date().toLocaleDateString()}`,
        type: documentType || "generic",
        category: "Mobile",
        fileType: "image/jpeg",
        fileName: `mobile-doc-${clientId}-${Date.now()}.jpg`,
        fileSize: fileContent.length.toString(),
        clientId,
        clientName: client.name,
        content: fileContent,
        metadata: JSON.stringify({
          ...metadata,
          editedFields,
          extractedData,
          photoCount: originalPhotos.length,
        }),
        tags: JSON.stringify(["mobile", "qr-captured", documentType]),
        uploadedBy: "mobile-portal",
      });

      // Broadcast realtime event
      // broadcastToAdmins('document:submitted', {
      //   clientId,
      //   clientName: client.name,
      //   documentType,
      //   documentId: document.id,
      // });

      res.json({
        id: document.id,
        status: "success",
        message: "Document captured successfully",
      });
    } catch (error: any) {
      console.error("Mobile document submission failed:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/documents/mobile/:documentId - Get mobile document
  app.get("/api/documents/mobile/:documentId", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error: any) {
      console.error("Failed to get mobile document:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ============ MOBILE JOB ROUTES ============

  // POST /api/jobs/mobile - Create job from mobile
  app.post("/api/jobs/mobile", async (req, res) => {
    try {
      const { clientId, vehicleId, jobType, priority, description, notes, attachedPhotos, location, voiceNote, metadata } = req.body;

      if (!clientId || !vehicleId || !jobType || !description) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Verify vehicle exists
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Find client
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      // Generate job number
      const jobNumber = `J-${Date.now()}`;

      // Create job
      const job = await storage.createJob({
        jobNumber,
        vehicleId,
        clientId,
        clientName: client.name,
        vehicleInfo: JSON.stringify({
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          plate: vehicle.licensePlate,
        }),
        type: jobType,
        priority: priority || "Medium",
        description,
        status: "Pending",
        createdBy: "mobile-portal",
        notes,
        internalNotes: `Created via mobile QR\nLocation: ${location ? `${location.latitude},${location.longitude}` : "Not captured"}\nPhotos: ${attachedPhotos?.length || 0}\nHas voice note: ${!!voiceNote}`,
      });

      // Broadcast realtime event
      // broadcastToAdmins('job:created', {
      //   clientId,
      //   clientName: client.name,
      //   jobNumber: job.jobNumber,
      //   jobId: job.id,
      //   vehicleInfo: `${vehicle.make} ${vehicle.model}`,
      // });

      res.json({
        id: job.id,
        jobId: job.id,
        jobNumber: job.jobNumber,
        status: "success",
        message: "Job created successfully",
      });
    } catch (error: any) {
      console.error("Mobile job creation failed:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/jobs/mobile/:jobId - Get mobile job
  app.get("/api/jobs/mobile/:jobId", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error: any) {
      console.error("Failed to get mobile job:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/mobile-submissions - Get recent mobile submissions (admin dashboard)
  app.get("/api/mobile-submissions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const submissions = await storage.getMobileSubmissions(limit);
      res.json(submissions);
    } catch (error: any) {
      console.error("Failed to get mobile submissions:", error);
      res.status(500).json({ message: error.message });
    }
  });
}
