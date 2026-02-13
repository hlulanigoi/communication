// ============ VEHICLE DIAGNOSTIC ROUTES ============
// Routes for vehicle problem diagnosis, problem library management, and diagnostic findings

import type { Express } from "express";
import { storage } from "./storage";

export async function registerDiagnosticRoutes(app: Express): Promise<void> {
  // ============ VEHICLE PROBLEMS (Library) ROUTES ============

  // GET /api/problems - Get all problems in library
  app.get("/api/problems", async (req, res) => {
    try {
      const problems = await storage.getVehicleProblems();
      res.json(problems);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/problems/search - Search problems by keyword
  app.get("/api/problems/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ message: "Search query required" });
      }
      const problems = await storage.searchProblems(String(q));
      res.json(problems);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/problems/category/:category - Get problems by part category
  app.get("/api/problems/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const problems = await storage.getProblemsByCategory(category);
      res.json(problems);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/problems/:id - Get specific problem
  app.get("/api/problems/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const problem = await storage.getVehicleProblem(id);
      if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
      }
      res.json(problem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // POST /api/problems - Create new problem in library
  app.post("/api/problems", async (req, res) => {
    try {
      const {
        partCategory,
        problemName,
        symptoms,
        description,
        severity,
        commonCauses,
        estimatedRepairCost,
        estimatedRepairTime,
        createdBy,
      } = req.body;

      if (!partCategory || !problemName) {
        return res.status(400).json({ message: "partCategory and problemName required" });
      }

      const newProblem = await storage.createVehicleProblem({
        partCategory,
        problemName,
        symptoms: symptoms ? JSON.stringify(symptoms) : undefined,
        description,
        severity: severity || "Moderate",
        commonCauses: commonCauses ? JSON.stringify(commonCauses) : undefined,
        estimatedRepairCost,
        estimatedRepairTime,
        createdBy,
      });

      res.status(201).json(newProblem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // PUT /api/problems/:id - Update problem in library
  app.put("/api/problems/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updated = await storage.updateVehicleProblem(id, updateData);
      if (!updated) {
        return res.status(404).json({ message: "Problem not found" });
      }

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // DELETE /api/problems/:id - Delete problem from library
  app.delete("/api/problems/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteVehicleProblem(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ VEHICLE DIAGNOSTICS (Findings) ROUTES ============

  // POST /api/diagnostics - Create new diagnostic finding
  app.post("/api/diagnostics", async (req, res) => {
    try {
      const {
        vehicleInspectionId,
        vehicleId,
        problemId,
        problemName,
        partCategory,
        severity,
        notes,
        photos,
        recommendedAction,
        estimatedCost,
        estimatedRepairTime,
        diagnosedBy,
        diagnosedByName,
      } = req.body;

      if (!vehicleInspectionId || !vehicleId || !problemName || !partCategory) {
        return res.status(400).json({
          message: "vehicleInspectionId, vehicleId, problemName, and partCategory required",
        });
      }

      const diagnosticFinding = await storage.createVehicleDiagnostic({
        vehicleInspectionId,
        vehicleId,
        problemId,
        problemName,
        partCategory,
        severity: severity || "Moderate",
        notes,
        photos: photos ? JSON.stringify(photos) : undefined,
        recommendedAction,
        estimatedCost,
        estimatedRepairTime,
        status: "Identified",
        diagnosedBy,
        diagnosedByName,
      });

      res.status(201).json(diagnosticFinding);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/diagnostics/:id - Get specific diagnostic finding
  app.get("/api/diagnostics/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const diagnostic = await storage.getVehicleDiagnostic(id);
      if (!diagnostic) {
        return res.status(404).json({ message: "Diagnostic finding not found" });
      }
      res.json(diagnostic);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/diagnostics/inspection/:inspectionId - Get all findings for an inspection
  app.get("/api/diagnostics/inspection/:inspectionId", async (req, res) => {
    try {
      const { inspectionId } = req.params;
      const findings = await storage.getDiagnosticsByInspection(inspectionId);
      res.json(findings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/diagnostics/vehicle/:vehicleId - Get all diagnoses for a vehicle (history)
  app.get("/api/diagnostics/vehicle/:vehicleId", async (req, res) => {
    try {
      const { vehicleId } = req.params;
      const findings = await storage.getDiagnosticsByVehicle(vehicleId);
      res.json(findings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // PUT /api/diagnostics/:id - Update diagnostic finding (status, notes, etc)
  app.put("/api/diagnostics/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updated = await storage.updateVehicleDiagnostic(id, updateData);
      if (!updated) {
        return res.status(404).json({ message: "Diagnostic finding not found" });
      }

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // PATCH /api/diagnostics/:id/status - Update only the status
  app.patch("/api/diagnostics/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "status required" });
      }

      const updated = await storage.updateVehicleDiagnostic(id, { status });
      if (!updated) {
        return res.status(404).json({ message: "Diagnostic finding not found" });
      }

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // DELETE /api/diagnostics/:id - Delete diagnostic finding
  app.delete("/api/diagnostics/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteVehicleDiagnostic(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}
