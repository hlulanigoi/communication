# Testing Guide for JustFix Auto Electrix Backend

## Starting the Application

### Option 1: Using npm (Recommended)
```bash
npm run dev
```

This will start the development server on `http://localhost:5000` with Vite for hot-reloading.

### Option 2: Direct TypeScript Execution
```bash
npx tsx server/index.ts
```

## API Endpoints Overview

### Core Entities

#### Students
- `GET /api/students` - List all students
- `GET /api/students/:id` - Get specific student
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

#### Staff
- `GET /api/staff` - List all staff members
- `GET /api/staff/:id` - Get specific staff member
- `POST /api/staff` - Create new staff member
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff

#### Clients
- `GET /api/clients` - List all clients
- `GET /api/clients/by-source/:source` - Filter by source (Direct, Insurance, Corporate Fleet)
- `GET /api/clients/:id` - Get specific client
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

#### Operating Expenses
- `GET /api/expenses` - List all expenses
- `GET /api/expenses/by-status/:status` - Filter by status (Pending, Paid, Overdue)
- `GET /api/expenses/:id` - Get specific expense
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

#### Job Invoices
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/by-client/:clientId` - Get invoices for specific client
- `GET /api/invoices/by-status/:status` - Filter by payment status
- `GET /api/invoices/:id` - Get specific invoice
- `POST /api/invoices` - Create invoice (with automatic insurance split)
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

#### Testimonials
- `GET /api/testimonials` - List all testimonials
- `GET /api/testimonials/by-student/:studentId` - Get student testimonials
- `GET /api/testimonials/:id` - Get specific testimonial
- `POST /api/testimonials` - Submit testimonial
- `PUT /api/testimonials/:id` - Update testimonial
- `DELETE /api/testimonials/:id` - Delete testimonial

#### HR Notes
- `GET /api/hr-notes` - List all HR notes
- `GET /api/hr-notes/pinned` - Get pinned notifications (auto-expiry after 24h)
- `GET /api/hr-notes/:id` - Get specific HR note
- `POST /api/hr-notes` - Create note (auto-pinned if from HR staff)
- `PUT /api/hr-notes/:id` - Update note
- `DELETE /api/hr-notes/:id` - Delete note

#### Certificates
- `GET /api/certificates` - List all certificates
- `GET /api/certificates/by-student/:studentId` - Get student certificates
- `GET /api/certificates/:id` - Get specific certificate
- `POST /api/certificates` - Issue certificate
- `PUT /api/certificates/:id` - Update certificate
- `DELETE /api/certificates/:id` - Delete certificate

### Business Logic Endpoints

#### Scheduled Tasks
- `POST /api/business-logic/run-scheduled-tasks` - Execute all scheduled workflows

#### Invoice Splitting
- `POST /api/business-logic/calculate-invoice-split` - Calculate insurance/customer split

#### Expiring Notifications
- `GET /api/business-logic/expiring-hr-notes` - Get HR notes expiring in next 2 hours

#### Student Graduations
- `POST /api/business-logic/process-graduations` - Manually process graduations

## Testing Features

### 1. View All Students
```bash
curl http://localhost:5000/api/students
```

### 2. View All Staff
```bash
curl http://localhost:5000/api/staff
```

### 3. View All Clients
```bash
curl http://localhost:5000/api/clients
```

### 4. Filter Clients by Source
```bash
curl http://localhost:5000/api/clients/by-source/Insurance
```

### 5. Create a New Student
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@academy.com",
    "role": "Junior Tech",
    "type": "Student",
    "department": "General Maintenance",
    "placementStart": "2024-08-01",
    "status": "Active"
  }'
```

### 6. Create a New Client
```bash
curl -X POST http://localhost:5000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ABC Repair Shop",
    "email": "contact@abcrepair.com",
    "phone": "+1-555-1234",
    "source": "Direct",
    "accountType": "B2B",
    "status": "Active"
  }'
```

### 7. Test Insurance Billing (Create Invoice for Insurance Client)
```bash
# First get an insurance client
curl http://localhost:5000/api/clients/by-source/Insurance

# Then create an invoice for that client
curl -X POST http://localhost:5000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "<CLIENT_ID_HERE>",
    "clientSource": "Insurance",
    "description": "Brake System Repair - Insurance Job",
    "partsTotal": "1500.00",
    "laborTotal": "800.00",
    "taxRate": "8.5",
    "totalAmount": "2500.00"
  }'
```

**Expected Result:** The system will automatically:
- Calculate insurance excess (typically 10% of labor)
- Split the amount between customer pay and insurance claim
- Store both amounts in the database

### 8. Test HR Auto-Pinning (Create HR Note from HR Staff)
```bash
# Create note as HR staff member
curl -X POST http://localhost:5000/api/hr-notes \
  -H "Content-Type: application/json" \
  -d '{
    "authorId": "<STAFF_ID>",
    "authorName": "Sarah Manager",
    "content": "Important: All staff meeting at 3pm today",
    "priority": "High",
    "category": "Announcement",
    "targetAudience": "All"
  }'
```

**Expected Result:** The note will be automatically pinned for 24 hours because it's from HR.

### 9. View Pinned Notifications
```bash
curl http://localhost:5000/api/hr-notes/pinned
```

### 10. Test Student Graduation Workflow
```bash
# Create student with past end date
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Williams",
    "email": "bob@academy.com",
    "role": "Senior Technician",
    "type": "Student",
    "placementStart": "2023-08-01",
    "placementEnd": "2024-01-15",
    "supervisor": "John Doe",
    "department": "General Maintenance",
    "skills": "[\"Brake Systems\", \"Electrical\"]",
    "status": "Active"
  }'

# Then process graduations
curl -X POST http://localhost:5000/api/business-logic/process-graduations
```

**Expected Result:** 
- Student status changes to "Alumni"
- Certificate is automatically generated
- Certificate document is saved

## Expected Test Results

### Seed Data Available
The application comes pre-populated with:
- **3 Students**: Jordan Lee, Taylor Reed, Chris Morgan (various statuses)
- **3 Staff Members**: Alex Miller (Technician), Sam Knight (Instructor), Morgan Davis (Manager)
- **3 Clients**: John Smith (Individual), ABC Fleet Services (Corporate), SafeGuard Insurance (Insurance Partner)
- **2 Operating Expenses**: Rent, Utilities

### Key Features to Test

1. **Data Retrieval** ✅
   - All CRUD endpoints should return data
   - Filtering should work (by-source, by-status, by-student, etc.)

2. **Insurance Billing Logic** ✅
   - Creating invoice for insurance client auto-calculates split
   - Client pays excess (~10% of subtotal)
   - Insurance covers remaining amount

3. **HR Auto-Pinning** ✅
   - Notes from HR staff are auto-pinned
   - Other staff notes are not pinned
   - Pinned notes appear in /pinned endpoint

4. **Student Graduation** ✅
   - Students with past placement_end dates are marked as Alumni
   - Certificates are auto-generated
   - Placement completion is recorded

## Troubleshooting

### Port Already in Use
If port 5000 is already in use:
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Dependencies Not Installed
```bash
npm install
```

### TypeScript Errors
```bash
npm run check
```

### Clear and Rebuild
```bash
# Clean node_modules and reinstall
rm -r node_modules package-lock.json
npm install

# Then run dev
npm run dev
```

## Using the Test Script

A test script is available to automatically test all features:
```bash
npm run test-features
```

This will:
- Test all CRUD operations
- Verify business logic workflows
- Display summary of test results
- Report any errors encountered

## Summary

The JustFix Auto Electrix backend is fully functional with:
- ✅ Complete CRUD operations for 10 entity types
- ✅ Advanced filtering and querying
- ✅ Automatic insurance billing calculations
- ✅ HR notification auto-pinning
- ✅ Student graduation workflow automation
- ✅ Comprehensive error handling
- ✅ RESTful API design
- ✅ TypeScript type safety

All endpoints are ready for frontend integration and can be tested via the curl commands above or using the integrated test script.
