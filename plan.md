# JustFix Auto Electrix - System Implementation Plan

## 1. Visual Identity & Theme
- **Primary Color**: JustFix Red (#E2231A / HSL 2, 80%, 50%) - Used for calls to action, primary branding, and status alerts.
- **Secondary Color**: Deep Black (#1A1A1A / HSL 0, 0%, 15%) - Used for sidebars, text headers, and industrial accents.
- **Muted Color**: Utility Grey (#6D6E71 / HSL 225, 3%, 43%) - Used for secondary text, metadata, and borders.
- **Background**: Workshop White (#FAFAFA / HSL 0, 0%, 98%) - Clean, professional workshop aesthetic.
- **Typography**:
  - **Display**: Rajdhani (Bold/Semibold) - For a mechanical, high-tech industrial feel.
  - **Body**: Inter - For clean, readable documentation and data.
- **UI Language**: Industrial-inspired with sharp corners (2px radius), high-contrast borders, and "Mission Control" telemetry.

## 2. Screen Architecture (Completed & Planned)

### Existing Screens:
1.  **Dashboard (Mission Control)**: Real-time throughput, live diagnostics, and urgent service tickets.
2.  **Academy**: Student/Intern management, document generation, and placement tracking.
3.  **Admin Bills**: HR notes and monthly workshop operational expenses.
4.  **Client Directory**: Multi-tier management (Individual, Corporate, Insurance).
5.  **Vehicle Inventory**: List of active and historical vehicles in the shop.
6.  **Job Board**: Kanban/List view of all active work orders.

### Planned Screens (To be Created):
1.  **Digital Vehicle Inspection (DVI)**:
    - Interactive 360° vehicle checklist.
    - Photo/Video upload for client approval.
    - Green/Yellow/Red status reporting.
2.  **Document Center**:
    - Centralized hub for student certificates, testimonials, and internship contracts.
    - Automated PDF generator for "Student Placement Completion".
3.  **Insurance Portal**:
    - Specialized dashboard for claims managers.
    - Multi-vehicle status tracking for fleet/insurance partners.
4.  **Advanced Billing & Invoicing**:
    - Detailed line-item breakdown (Labor vs. Parts).
    - Insurance claim processing toggle.

## 3. Backend Logic & Schema Plan (Mocked in Frontend)

### Core Data Entities:
- **People**:
  - `Staff`: name, role, pay_rate, efficiency_score.
  - `Students`: placement_start, placement_end, supervisor_id, skills_mastered[].
  - `Interns`: department, university, contract_end_date.
- **Clients**:
  - `Source`: Direct, Insurance, Corporate Fleet.
  - `AccountType`: Individual, B2B, Partner.
- **Financials**:
  - `OperatingExpenses`: category, supplier, due_date, status.
  - `JobInvoices`: parts_total, labor_total, tax_rate, insurance_excess.
- **Academy**:
  - `Certificates`: type, issued_date, student_id, file_path.
  - `Testimonials`: content, rating, employer_name, date.

### Business Logic Workflows:
1.  **Student Graduation**: 
    - When placement_end < today -> Trigger "Generate Certificate" action.
    - Move Student from `Active` to `Placed/Alumni`.
2.  **Insurance Billing**:
    - If ClientSource === 'Insurance' -> Split Invoice into 'Excess (Client Pay)' and 'Claim (Insurance Pay)'.
3.  **HR Notification**:
    - If Note.author === 'HR Manager' -> Pin to Admin Dashboard for 24 hours.

## 4. Best Practices (2026 Standards)
- **Mobile-First Technicians**: Techs use tablets for DVIs and time-clocking.
- **Transparency-Led Approvals**: Customers receive SMS links to a branded "Repair Approval Portal" with photos.
- **Skill-Based Dispatching**: Jobs auto-assign to Technicians vs. Students based on difficulty level.
- **Zero-Paper Documentation**: All student and workshop documents are digitally signed and archived.
