# HR File System - Quick Start Guide

## Accessing the HR System

1. **Navigate to the HR Dashboard**: Go to `http://localhost:5000/hr`
2. You'll see the HR Management System with 5 main sections

## Dashboard Overview

The HR dashboard displays quick statistics:
- **Total Employees**: Count of all employees in the system
- **Pending Leave Requests**: Number of leave requests awaiting approval
- **Pending Payroll**: Payroll records that haven't been processed
- **Active Benefits**: Number of active employee benefits

## Features by Tab

### 1. Employees Tab
**Manage your employee directory**

- **Search**: Find employees by name or email
- **View**: See all employee details in table format
- **Add New**: Click "New Employee" button to add an employee
- **Edit**: Click the edit icon to modify employee information
- **Delete**: Remove an employee record
- **Quick Stats**: See hire date, department, role, and status

**Employee Information Tracked:**
- Name and Email
- Phone and Department
- Role/Position
- Hire Date
- Pay Rate
- Efficiency Score
- Employment Status (Active/On Leave/Inactive)

### 2. Leave Tab
**Request and approve time off**

**Features:**
- Filter by status: All, Pending, Approved, Rejected
- View all leave requests with employee details
- See leave type (Vacation, Sick, Personal, etc.)
- Check dates and duration
- **Approve**: Click "Approve" to accept a leave request
- **Reject**: Click "Reject" to deny a leave request
- **Delete**: Remove processed leave requests

**Leave Types Supported:**
- Vacation
- Sick Leave
- Personal
- Unpaid Leave
- Medical
- Bereavement

### 3. Payroll Tab
**Process and track employee payments**

- View all payroll records with key information
- See gross and net salary
- Check payment status and method
- Pay period information
- Edit payroll details if needed
- Create new payroll records

**Payroll Fields:**
- Employee Name and ID
- Pay Period (Start and End dates)
- Base Salary
- Hours Worked
- Overtime Hours and Pay
- Bonuses and Deductions
- Gross Salary (before deductions)
- Net Salary (after deductions)
- Payment Method (Bank Transfer, Check, Cash)
- Payment Status (Pending, Processed, Paid, Failed)

### 4. Performance Reviews Tab
**Conduct and track performance evaluations**

- View all performance reviews
- See employee ratings and overall scores
- View reviewer information
- Check review status (Draft, Completed, Discussed, Acknowledged)
- Click "View Details" for full review information

**Rating Categories (1-5 Scale):**
- Technical Skills
- Communication
- Teamwork
- Reliability
- Attendance
- Customer Service
- Problem Solving
- Initiative

**Review Sections:**
- Strengths (what the employee does well)
- Areas for Improvement
- Goals for Next Period
- Comments
- Employee Acknowledgment/Comments

### 5. Benefits Tab
**Manage employee benefits and insurance**

- View all employee benefits
- See benefit type, provider, and status
- Check coverage and effective dates
- Filter by benefit type
- Track active, inactive, expired, and pending benefits

**Benefit Types:**
- Health Insurance
- Dental
- Vision Insurance
- 401(k)
- Life Insurance
- Gym Membership
- Other benefits

**Benefit Details Tracked:**
- Employee Name
- Benefit Type and Name
- Provider
- Effective Date and Expiry Date
- Coverage Level (self/family/etc.)
- Premium Amount
- Employer Contribution
- Policy Number

## Employee Detail Page

**Access**: Click on an employee name in the Employees tab or go to `/employee/{employeeId}`

**Sections:**
1. **Employee Information**: Full profile with contact details, department, and hire date
2. **Quick Stats**: Shows approved leaves, payroll records, and reviews count
3. **Leave History Tab**: All leave requests with dates and status
4. **Payroll Tab**: Historical payroll records with salary breakdown
5. **Performance Tab**: All reviews with ratings and feedback

## Data Entry Tips

### Creating a Leave Request
- Select the employee
- Choose leave type
- Set start and end dates (system calculates days)
- Add reason (optional)
- Submit for approval
- Manager can approve/reject with comments

### Processing Payroll
- Select employee
- Input pay period dates
- Enter hours worked
- System calculates pay based on hourly rate or salary
- Add overtime hours if applicable
- Include bonuses and deductions if any
- Review gross and net salary
- Set payment method and process

### Creating Performance Reviews
- Select employee and reviewer
- Set review period
- Rate employee on 8 key categories (1-5 scale)
- Add comments on strengths and improvement areas
- Set goals for next period
- Allow employee to add their comments
- Change status through workflow

### Adding Benefits
- Select employee
- Choose benefit type
- Fill in provider and coverage details
- Set effective and expiry dates
- Note premium amounts
- Can reference a document/file
- Track status changes

## API Integration

If you want to integrate with external systems, use the provided API endpoints:

**Base URL**: `http://localhost:5000/api`

**Leave Endpoints**:
```
GET    /api/leave-requests
GET    /api/leave-requests/:id
GET    /api/leave-requests/staff/:staffId
GET    /api/leave-requests/status/:status
POST   /api/leave-requests
PUT    /api/leave-requests/:id
DELETE /api/leave-requests/:id
```

**Payroll Endpoints**:
```
GET    /api/payroll
GET    /api/payroll/:id
GET    /api/payroll/staff/:staffId
POST   /api/payroll
PUT    /api/payroll/:id
DELETE /api/payroll/:id
```

**Performance Review Endpoints**:
```
GET    /api/performance-reviews
GET    /api/performance-reviews/:id
GET    /api/performance-reviews/staff/:staffId
GET    /api/performance-reviews/reviewer/:reviewerId
POST   /api/performance-reviews
PUT    /api/performance-reviews/:id
DELETE /api/performance-reviews/:id
```

**Benefits Endpoints**:
```
GET    /api/benefits
GET    /api/benefits/:id
GET    /api/benefits/staff/:staffId
POST   /api/benefits
PUT    /api/benefits/:id
DELETE /api/benefits/:id
```

## Sample Data Creation

To test the HR system, create sample employees first:

1. Go to `/hr` → Employees Tab
2. Click "New Employee"
3. Fill in employee details
4. Create a few employees
5. Then create leave requests, payroll, and reviews for testing

## Common Workflows

### Workflow 1: Employee Take Leave
1. Employee submits leave request (or manager submits for them)
2. HR/Manager sees it in Leave tab with "Pending" status
3. HR/Manager clicks "Approve" with optional comments
4. Status changes to "Approved" and becomes visible in employee's leave history
5. HR can track total leaves with "Leaves Approved" counter

### Workflow 2: Process Monthly Payroll
1. Go to Payroll tab
2. Click "Create Payroll"
3. For each employee, enter hours worked for the month
4. Review base salary + overtime pay calculation
5. Add any bonuses or deductions
6. Set payment method
7. Update status to "Processed" or "Paid"
8. Track payment date

### Workflow 3: Conduct Performance Review
1. Go to Performance Reviews tab
2. Click "Create Review"
3. Select employee and yourself as reviewer
4. Set review period (e.g., last 3 months)
5. Rate employee on all 8 criteria
6. Add comments about strengths and improvements
7. Set goals for next period
8. Status: Draft → Employee reviews → Acknowledged

## Troubleshooting

**No employees showing?**
- Create employees first in the Employees tab
- Refresh the page (F5)

**Can't approve leave?**
- Ensure leave status is "Pending"
- Check that approver is a valid manager/HR staff

**Payroll numbers seem off?**
- Verify base salary and hourly rate are set correctly
- Check that all deductions are properly configured

**Data not saving?**
- Ensure backend server is running
- Check browser console for error messages
- Try refreshing and checking again

## Next Steps

After familiarizing yourself with the HR system:
1. Connect to your actual employee database
2. Set up recurring payroll schedules
3. Configure benefit plans and rates
4. Establish performance review calendar
5. Create custom leave policies
6. Integrate with email for notifications
7. Generate payslips and reports

For detailed technical information, see [HR_IMPLEMENTATION_SUMMARY.md](HR_IMPLEMENTATION_SUMMARY.md)
