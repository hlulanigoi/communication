DIAGNOSTIC_SYSTEM_IMPLEMENTATION.md

# Vehicle Diagnostic System - Complete Implementation

## Overview

A complete diagnostic system has been implemented to help receptionists quickly document vehicle problems during customer visits. The system includes:
- **Problem Library**: A searchable database of common vehicle problems organized by part/component and severity
- **Quick Diagnostics**: Fast, simple interface to record findings during inspections
- **Manual Problem Entry**: Ability to add new/custom problems that automatically become searchable library entries
- **Tracking & History**: Complete tracking of all diagnostic findings with status workflow

## Architecture

### Database Schema (Shared)

**Table: `vehicle_problems`** - Master library of vehicle problems
- `id`: Primary key (UUID)
- `partCategory`: Component category (e.g., "Engine", "Transmission", "Brakes")
- `problemName`: Name of the problem (e.g., "Engine Knock", "Hard Shifting")
- `symptoms`: JSON array of symptoms
- `description`: Detailed description
- `severity`: "Minor", "Moderate", or "Critical"
- `commonCauses`: JSON array of likely causes
- `estimatedRepairCost`: Average estimated cost
- `estimatedRepairTime`: Average repair time
- `frequencyCount`: Tracks how often this problem is diagnosed (for business intelligence)
- `createdBy`: Who added this problem
- `createdAt, updatedAt`: Timestamps

**Table: `vehicle_diagnostics`** - Specific diagnostic findings for vehicle inspections
- `id`: Primary key (UUID)
- `vehicleInspectionId`: Links to the inspection (FK)
- `vehicleId`: Links to the vehicle (FK)
- `problemId`: Links to library problem (FK, nullable for custom problems)
- `problemName`: Stored name (for persistence if problem deleted)
- `partCategory`: Stored category (for searching)
- `severity`: Specific severity for this vehicle
- `notes`: Notes specific to this finding
- `photos`: JSON array of photo URLs
- `recommendedAction`: What should be done
- `estimatedCost`: Cost estimate for THIS vehicle specifically
- `estimatedRepairTime`: Time estimate for THIS vehicle specifically
- `status`: "Identified" → "Quoted" → "Approved" → "In Progress" → "Repaired"/"Deferred"
- `jobCreated`: Boolean flag for job creation
- `jobId`: Links to job if one was created (FK)
- `diagnosedBy`: Staff member who recorded it (FK)
- `diagnosedByName`: Stored name of staff member
- `createdAt, updatedAt`: Timestamps

### Storage Layer (Server)

**Location**: `server/storage.ts`

**Interface Methods** (13 total):
```typescript
// Problem Library Operations
getVehicleProblems(): Promise<VehicleProblem[]>
getVehicleProblem(id: string): Promise<VehicleProblem | undefined>
getProblemsByCategory(category: string): Promise<VehicleProblem[]>
searchProblems(query: string): Promise<VehicleProblem[]>
createVehicleProblem(problem: InsertVehicleProblem): Promise<VehicleProblem>
updateVehicleProblem(id: string, problem: Partial<InsertVehicleProblem>): Promise<VehicleProblem | undefined>
deleteVehicleProblem(id: string): Promise<boolean>

// Diagnostic Findings Operations
createVehicleDiagnostic(diagnostic: InsertVehicleDiagnostic): Promise<VehicleDiagnostic>
getVehicleDiagnostic(id: string): Promise<VehicleDiagnostic | undefined>
getDiagnosticsByInspection(inspectionId: string): Promise<VehicleDiagnostic[]>
getDiagnosticsByVehicle(vehicleId: string): Promise<VehicleDiagnostic[]>
updateVehicleDiagnostic(id: string, diagnostic: Partial<InsertVehicleDiagnostic>): Promise<VehicleDiagnostic | undefined>
deleteVehicleDiagnostic(id: string): Promise<boolean>
```

**Implementations**:
- **MemStorage**: In-memory Map-based storage (fallback, no database required)
- **DatabaseStorage**: PostgreSQL with Drizzle ORM (production)

### API Endpoints (Server)

**Location**: `server/diagnosticRoutes.ts`

Registered in `server/index.ts` via: `await registerDiagnosticRoutes(app);`

#### Problem Library Endpoints

```
GET    /api/problems
       Returns all problems in the library

GET    /api/problems/search?q=query
       Search problems by keyword (searches name, symptoms, category)

GET    /api/problems/category/:category
       Get all problems for a specific part category

GET    /api/problems/:id
       Get a specific problem details

POST   /api/problems
       Create a new problem in the library
       Body: {
         partCategory: string,
         problemName: string,
         symptoms?: any[],
         description?: string,
         severity?: "Minor" | "Moderate" | "Critical",
         commonCauses?: any[],
         estimatedRepairCost?: string,
         estimatedRepairTime?: string,
         createdBy?: string
       }

PUT    /api/problems/:id
       Update a problem in the library

DELETE /api/problems/:id
       Remove a problem from the library
```

#### Diagnostic Findings Endpoints

```
POST   /api/diagnostics
       Record a new diagnostic finding
       Body: {
         vehicleInspectionId: string,
         vehicleId: string,
         problemId?: string (optional, null for custom problems),
         problemName: string,
         partCategory: string,
         severity?: "Minor" | "Moderate" | "Critical",
         notes?: string,
         photos?: string[],
         recommendedAction?: string,
         estimatedCost?: string,
         estimatedRepairTime?: string,
         diagnosedBy?: string,
         diagnosedByName?: string
       }

GET    /api/diagnostics/:id
       Get a specific diagnostic finding

GET    /api/diagnostics/inspection/:inspectionId
       Get all findings for an inspection

GET    /api/diagnostics/vehicle/:vehicleId
       Get all findings for a vehicle (inspection history)

PUT    /api/diagnostics/:id
       Update a diagnostic finding (notes, status, costs, etc.)

PATCH  /api/diagnostics/:id/status
       Update just the status of a finding
       Body: { status: string }

DELETE /api/diagnostics/:id
       Remove a diagnostic finding
```

### Frontend UI Component

**Location**: `client/src/pages/DiagnosticFinder.tsx`

**Route**: `/diagnostics/:vehicleId/:inspectionId`

**Features**:
- **Problem Library Tab**:
  - Search bar for finding problems by name/symptom/category
  - Part category filter dropdown
  - Grid of problem cards with quick-select functionality
  - Add custom problem dialog with form
  - Click on problem card to instantly add to findings

- **Findings Tab**:
  - List of all problems recorded for this inspection
  - Shows severity, part category, and status
  - Edit or remove findings
  - Shows count badge on tab

**Integration Points**:
- Can be accessed directly via route: `/diagnostics/[vehicleId]/[inspectionId]`
- Can be embedded in vehicle inspection workflow
- Automatically links findings to the current inspection

## How It Works (Workflow)

### Scenario 1: Using Existing Problem from Library

1. Receptionist opens diagnostic finder for vehicle/inspection
2. Searches for problem (e.g., "engine knock") or filters by part category (e.g., "Engine")
3. Clicks on problem card in "Problem Library" tab
4. Problem instantly appears in "Findings" tab
5. Can view/edit all findings for the inspection

### Scenario 2: Adding Custom/Manual Problem

1. Receptionist finds an issue not in the library
2. Clicks "Add Custom Problem" button
3. Fills form with:
   - Problem name (required)
   - Part/Component (required)
   - Severity (default: Moderate)
   - Optional description
4. Clicks "Save & Record Problem"
5. New problem:
   - Added to the library (for future diagnostics)
   - Immediately recorded as a finding for this inspection
6. Problem now appears in all future searches

### Scenario 3: Viewing Vehicle History

1. Use `/api/diagnostics/vehicle/:vehicleId` endpoint
2. Get list of all problems ever found on this vehicle
3. Can see patterns (frequent issues) and recommend preventive maintenance

## Database Exports

All types are exported from `shared/schema.ts`:

```typescript
// Types for problems
type VehicleProblem = typeof vehicleProblems.$inferSelect
type InsertVehicleProblem = z.infer<typeof insertVehicleProblemSchema>

// Types for diagnostics  
type VehicleDiagnostic = typeof vehicleDiagnostics.$inferSelect
type InsertVehicleDiagnostic = z.infer<typeof insertVehicleDiagnosticSchema>
```

## Environment & Configuration

**Required Environment Variables**:
- `DATABASE_URL`: PostgreSQL connection string (if using DatabaseStorage)
- If not set, system falls back to MemStorage (in-memory, data not persisted)

**Node.js Version**: 20.x or higher

**Port Configuration**:
- Backend/API: Port 3000 (Express)
- Frontend: Port 5001 (Vite dev server)

## Type Safety

All endpoints are fully type-safe across the stack:
- Zod schemas validate input at route handlers
- TypeScript types prevent misuse in frontend
- Storage layer enforces interface contract

## Data Flow

```
┌─────────────────┐
│   Frontend UI   │
│  Diagnostic     │
│   Finder        │
└────────┬────────┘
         │ fetch()
         ▼
┌──────────────────────┐
│   API Routes         │
│  /api/problems       │
│  /api/diagnostics    │
└────────┬─────────────┘
         │ Zod validation
         ▼
┌──────────────────────┐
│  Storage Interface   │
│  (IStorage impl)     │
└────────┬─────────────┘
         │
    ┌────┴─────┐
    ▼          ▼
┌────────┐  ┌──────────────┐
│MemStor │  │ DatabaseStor │
│   e    │  │     age      │
└────────┘  └──────┬───────┘
                   │ Drizzle ORM
                   ▼
            ┌─────────────┐
            │ PostgreSQL  │
            │  Database   │
            └─────────────┘
```

## Testing the System

### Using curl:

```bash
# Get all problems
curl http://localhost:3000/api/problems

# Search for problems
curl "http://localhost:3000/api/problems/search?q=engine"

# Get problems by category
curl http://localhost:3000/api/problems/category/Engine

# Create a new problem
curl -X POST http://localhost:3000/api/problems \
  -H "Content-Type: application/json" \
  -d '{
    "partCategory": "Engine",
    "problemName": "Engine Overheat",
    "severity": "Critical",
    "createdBy": "Receptionist"
  }'

# Record a diagnostic finding
curl -X POST http://localhost:3000/api/diagnostics \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleInspectionId": "insp-123",
    "vehicleId": "veh-456",
    "problemName": "Engine Knock",
    "partCategory": "Engine",
    "severity": "Moderate",
    "diagnosedByName": "Receptionist"
  }'

# View findings for an inspection
curl "http://localhost:3000/api/diagnostics/inspection/insp-123"
```

### Via Frontend:

Navigate to: `http://localhost:5001/diagnostics/[vehicleId]/[inspectionId]`

## Business Intelligence Features

**Frequency Tracking**: Each problem has a `frequencyCount` field that tracks how often problems are diagnosed. This enables:
- Identifying most common issues
- Predictive maintenance recommendations
- Vehicle reliability insights
- Parts supply planning

**Status Workflow**: Track problems through their lifecycle:
- "Identified": Just found it
- "Quoted": Parts & labor costs determined
- "Approved": Customer approved the repair
- "In Progress": Currently being repaired
- "Repaired": Work completed
- "Deferred": Customer chose not to fix now

**Cost Estimation**: Two-level cost estimation:
- Library level: Average cost/time for the problem type
- Instance level: Specific cost/time for THIS vehicle's situation

## Integration with Existing Systems

- **Vehicle Inspections**: Diagnostics link to existing `vehicleInspections` table
- **Jobs**: Diagnostics can be converted to jobs (via `jobId` FK)
- **Staff**: Tracks which staff member recorded each finding
- **Vehicles**: Maintains complete diagnostic history per vehicle

## Future Enhancements

1. **Photo Documentation**: Store photos of problem areas (currently supports JSON array)
2. **Cost Estimates to Jobs**: Auto-create job from diagnostic with estimated costs
3. **Client Reporting**: Generate diagnostic reports for customer communication
4. **Analytics Dashboard**: Visualize problem patterns, most repaired parts, etc.
5. **AI Problem Matching**: Suggest similar problems from library based on symptoms
6. **Mobile Photo Capture**: Integrate with mobile portal for QR-based photo capture
7. **Recurring Issue Alerts**: Flag problems that keep happening on same vehicle

## Files Modified/Created

**Created**:
- `server/diagnosticRoutes.ts` - API route handlers
- `client/src/pages/DiagnosticFinder.tsx` - Frontend UI component

**Modified**:
- `shared/schema.ts` - Added vehicleProblems and vehicleDiagnostics tables
- `server/storage.ts` - Added 13 storage methods to both MemStorage and DatabaseStorage
- `server/index.ts` - Imported and registered diagnosticRoutes
- `client/src/App.tsx` - Added import and route for DiagnosticFinder

## Activation Checklist

- [x] Database schema created (vehicleProblems, vehicleDiagnostics tables)
- [x] Type definitions and Zod schemas
- [x] IStorage interface extended
- [x] MemStorage implementations (in-memory)
- [x] DatabaseStorage implementations (Drizzle ORM)
- [x] API routes implemented
- [x] Frontend UI component created
- [x] Routes registered in server and client
- [ ] Database migrations run (for production PostgreSQL deployment)
- [ ] Seed data added to problem library (optional)
- [ ] Staff testing in mobile portal
- [ ] Production deployment
