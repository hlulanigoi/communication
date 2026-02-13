# HR File System Implementation Summary

## Overview
A comprehensive HR Management System has been implemented to manage company employees, leave requests, payroll, performance reviews, and employee benefits.

## Features Implemented

### 1. Employee Management
- **Location**: `/hr` route
- **Features**:
  - View all employees with search functionality
  - Employee profiles with comprehensive details
  - Filter by name, email, department, status
  - Edit employee information
  - Track hire dates, departments, roles, and efficiency scores
  - Employee directory with status tracking (Active/On Leave/Inactive)

### 2. Leave Management
- Request leave with multiple types: Vacation, Sick, Personal, Unpaid, Medical, Bereavement
- Leave request workflow:
  - Pending → Approved/Rejected
  - Track number of days for each request
  - Add reasons for leave requests
  - Emergency leave flag support
  - Approval workflow with manager/HR comments
- Filter leave requests by status
- Quick overview of pending approvals

### 3. Payroll Management
- Create and track payroll records by pay period
- Support for:
  - Base salary and hourly rates
  - Overtime calculation
  - Bonuses and deductions
  - Gross and net salary calculation
  - Multiple payment methods (Bank Transfer, Check, Cash)
  - Payment status tracking (Pending, Processed, Paid, Failed)
- Payroll history for each employee
- Track hours worked and overtime hours
- JSON support for flexible bonus/deduction structures

### 4. Performance Reviews
- Create comprehensive performance reviews
- Rating system (1-5 scale) for:
  - Technical Skills
  - Communication
  - Teamwork
  - Reliability
  - Attendance
  - Customer Service
  - Problem Solving
  - Initiative
- Overall rating calculation
- Review workflow (Draft → Completed → Discussed → Acknowledged)
- Capture strengths and improvement areas
- Goals for next review period
- Employee comments/responses
- Reviewer assignment

### 5. Employee Benefits
- Track multiple benefits per employee:
  - Health Insurance
  - Dental
  - Vision
  - 401k
  - Life Insurance
  - Gym
  - Other benefits
- Benefits tracking includes:
  - Provider information
  - Effective dates and expiry dates
  - Coverage details
  - Premium amounts (employee and employer contributions)
  - Policy numbers
  - Document references
  - Status tracking (Active/Inactive/Expired/Pending)

## Database Schema

### New Tables Created

#### 1. `leaveRequests`
```typescript
- id: UUID (primary key)
- staffId: UUID (references staff)
- staffName: Text
- leaveType: Text (enum-like)
- startDate: Timestamp
- endDate: Timestamp
- numberOfDays: Text
- reason: Text (optional)
- status: Text (Pending/Approved/Rejected/Cancelled)
- approvedBy: UUID (references staff)
- approverName: Text
- approvalDate: Timestamp
- comments: Text
- emergency: Boolean
- createdAt, updatedAt: Timestamps
```

#### 2. `payrollRecords`
```typescript
- id: UUID (primary key)
- staffId: UUID (references staff)
- staffName: Text
- payPeriodStart, payPeriodEnd: Timestamps
- baseSalary: Text (for precision)
- hoursWorked: Text
- basicPay, overtimeHours, overtimePay: Text
- bonuses, deductions: Text (JSON format)
- grossSalary, netSalary: Text
- paymentMethod: Text
- paymentStatus: Text (Pending/Processed/Paid/Failed)
- paymentDate: Timestamp
- notes: Text
- createdAt, updatedAt: Timestamps
```

#### 3. `performanceReviews`
```typescript
- id: UUID (primary key)
- staffId, reviewerId: UUID (references staff)
- staffName, reviewerName: Text
- reviewPeriodStart, reviewPeriodEnd: Timestamps
- Rating fields (1-5 scale):
  - technicalSkills, communication, teamwork, reliability
  - attendance, customerService, problemSolving, initiative
- overallRating: Text (calculated)
- strengths, improvements, goalsForNextPeriod, comments: Text
- status: Text (Draft/Completed/Discussed/Acknowledged)
- discussionDate: Timestamp
- employeeComments: Text
- createdAt, updatedAt: Timestamps
```

#### 4. `employeeBenefits`
```typescript
- id: UUID (primary key)
- staffId: UUID (references staff)
- staffName: Text
- benefitType: Text
- benefitName: Text
- provider, coverage: Text
- effectiveDate, expiryDate: Timestamps
- premium, employerContribution: Text
- status: Text (Active/Inactive/Expired/Pending)
- policyNumber: Text
- documentId: UUID (references documents)
- notes: Text
- createdAt, updatedAt: Timestamps
```

## API Endpoints

### Leave Requests
- `GET /api/leave-requests` - Get all leave requests
- `GET /api/leave-requests/:id` - Get specific leave request
- `GET /api/leave-requests/staff/:staffId` - Get leave requests for a staff member
- `GET /api/leave-requests/status/:status` - Filter by status
- `POST /api/leave-requests` - Create new leave request
- `PUT /api/leave-requests/:id` - Update leave request
- `DELETE /api/leave-requests/:id` - Delete leave request

### Payroll
- `GET /api/payroll` - Get all payroll records
- `GET /api/payroll/:id` - Get specific payroll record
- `GET /api/payroll/staff/:staffId` - Get payroll for a staff member
- `POST /api/payroll` - Create new payroll record
- `PUT /api/payroll/:id` - Update payroll record
- `DELETE /api/payroll/:id` - Delete payroll record

### Performance Reviews
- `GET /api/performance-reviews` - Get all reviews
- `GET /api/performance-reviews/:id` - Get specific review
- `GET /api/performance-reviews/staff/:staffId` - Get reviews for a staff member
- `GET /api/performance-reviews/reviewer/:reviewerId` - Get reviews created by a reviewer
- `POST /api/performance-reviews` - Create new review
- `PUT /api/performance-reviews/:id` - Update review
- `DELETE /api/performance-reviews/:id` - Delete review

### Employee Benefits
- `GET /api/benefits` - Get all benefits
- `GET /api/benefits/:id` - Get specific benefit
- `GET /api/benefits/staff/:staffId` - Get benefits for a staff member
- `POST /api/benefits` - Create new benefit
- `PUT /api/benefits/:id` - Update benefit
- `DELETE /api/benefits/:id` - Delete benefit

## UI Pages

### 1. HR Management Dashboard (`/hr`)
Main hub for all HR operations with:
- **Quick Stats Cards**:
  - Total number of employees
  - Pending leave requests count
  - Pending payroll count
  - Active benefits count

- **Tabbed Interface**:
  1. **Employees Tab**: Directory with search, add new, edit, delete operations
  2. **Leave Tab**: Request management with approval/rejection workflow
  3. **Payroll Tab**: Payroll records with status tracking
  4. **Performance Reviews Tab**: Review cards with employee details
  5. **Benefits Tab**: Benefit cards with provider and coverage info

### 2. Employee Detail Page (`/employee/:id`)
Comprehensive employee profile showing:
- Basic employee information (name, email, phone, department, hire date, pay rate)
- Quick statistics (leaves approved, payroll records, reviews)
- Three tabs for:
  - **Leave History**: All leave requests with status
  - **Payroll**: Historical payroll records with gross/net salary
  - **Performance**: Past performance reviews with ratings

## Storage Implementation

All data is stored using in-memory Maps with the following CRUD methods per entity:
- `get[Entity]()` - Get all records
- `get[Entity](id)` - Get single record
- `create[Entity](data)` - Create new record
- `update[Entity](id, data)` - Update record
- `delete[Entity](id)` - Delete record

Additional filtering methods:
- `getLeaveRequestsByStaff(staffId)`
- `getLeaveRequestsByStatus(status)`
- `getPayrollRecordsByStaff(staffId)`
- `getPayrollRecordsByPeriod(startDate, endDate)`
- `getPerformanceReviewsByStaff(staffId)`
- `getPerformanceReviewsForReviewer(reviewerId)`
- `getEmployeeBenefitsByStaff(staffId)`

## Client Library

A comprehensive HR API client library is available at `/client/src/lib/hrApi.ts` with functions for:
- Leave request management
- Payroll management
- Performance review management
- Employee benefits management

## Usage Examples

### Creating a Leave Request
```typescript
import { createLeaveRequest } from "@/lib/hrApi";

await createLeaveRequest({
  staffId: "emp-123",
  staffName: "John Doe",
  leaveType: "Vacation",
  startDate: new Date("2024-03-01"),
  endDate: new Date("2024-03-05"),
  numberOfDays: "5",
  reason: "Family vacation",
  status: "Pending"
});
```

### Creating a Payroll Record
```typescript
import { createPayrollRecord } from "@/lib/hrApi";

await createPayrollRecord({
  staffId: "emp-123",
  staffName: "John Doe",
  payPeriodStart: new Date("2024-02-01"),
  payPeriodEnd: new Date("2024-02-29"),
  baseSalary: "5000",
  hoursWorked: "160",
  basicPay: "5000",
  overtimeHours: "10",
  overtimePay: "250",
  bonuses: "{}",
  deductions: "{}",
  grossSalary: "5250",
  netSalary: "4500",
  paymentMethod: "Bank Transfer",
  paymentStatus: "Pending"
});
```

### Creating a Performance Review
```typescript
import { createPerformanceReview } from "@/lib/hrApi";

await createPerformanceReview({
  staffId: "emp-123",
  staffName: "John Doe",
  reviewerId: "mgr-456",
  reviewerName: "Jane Manager",
  reviewPeriodStart: new Date("2024-01-01"),
  reviewPeriodEnd: new Date("2024-02-29"),
  technicalSkills: "4",
  communication: "5",
  teamwork: "4",
  reliability: "5",
  attendance: "5",
  customerService: "4",
  problemSolving: "4",
  initiative: "3",
  overallRating: "4.25",
  strengths: "Strong technical skills and communication",
  improvements: "Could show more initiative in team projects",
  goalsForNextPeriod: "Lead one team project",
  status: "Draft"
});
```

## Navigation

Users can access the HR system through:
1. Direct URL: `http://localhost:5000/hr`
2. Navigation menu integration (if added to Layout component)
3. Employee profile links from dashboards

## Next Steps / Enhancements

Future enhancements could include:
1. **Role-based access control** - HR Admin, Manager, and Employee view levels
2. **PDF export** - Generate payslips, leave summaries, performance reports
3. **Email notifications** - Approve leave, payroll processing notifications
4. **Attendance integration** - Automatic attendance tracking
5. **Tax calculations** - Automated tax computation
6. **File uploads** - Document attachment for benefits and reviews
7. **Dashboard charts** - Analytics and visualization
8. **Bulk operations** - Process multiple payroll records at once
9. **Approval workflows** - Multi-level approvals for sensitive operations
10. **Audit logs** - Track all changes to HR records

## Files Modified/Created

### New Files
- `/client/src/pages/HRManagement.tsx` - Main HR management dashboard
- `/client/src/pages/EmployeeDetail.tsx` - Employee profile page
- `/client/src/lib/hrApi.ts` - HR API client functions

### Modified Files
- `/shared/schema.ts` - Added HR database tables and schemas
- `/server/storage.ts` - Added HR storage methods and Maps
- `/server/routes.ts` - Added HR API endpoints
- `/client/src/App.tsx` - Added HR routes
