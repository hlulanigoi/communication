import { 
  type User, type InsertUser, 
  type Student, type InsertStudent, 
  type Document, type InsertDocument,
  type Staff, type InsertStaff,
  type Client, type InsertClient,
  type OperatingExpense, type InsertOperatingExpense,
  type JobInvoice, type InsertJobInvoice,
  type Testimonial, type InsertTestimonial,
  type HRNote, type InsertHRNote,
  type Certificate, type InsertCertificate,
  type Vehicle, type InsertVehicle,
  type VehicleInspection, type InsertVehicleInspection,
  type InspectionMedia, type InsertInspectionMedia,
  type Job, type InsertJob,
  type Supplier, type InsertSupplier,
  type InventoryItem, type InsertInventoryItem,
  type PurchaseOrder, type InsertPurchaseOrder,
  type InventoryTransaction, type InsertInventoryTransaction,
  type PartsUsage, type InsertPartsUsage,
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Students
  getStudents(): Promise<Student[]>;
  getStudent(id: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: string): Promise<boolean>;
  
  // Documents
  getDocuments(): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  searchDocuments(query: string): Promise<Document[]>;
  filterDocuments(filters: {
    type?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
    studentId?: string;
    clientId?: string;
    staffId?: string;
  }): Promise<Document[]>;
  getDocumentsByCategory(category: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;
  bulkDeleteDocuments(ids: string[]): Promise<number>;
  
  // Staff
  getStaff(): Promise<Staff[]>;
  getStaffMember(id: string): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: string, staff: Partial<InsertStaff>): Promise<Staff | undefined>;
  deleteStaff(id: string): Promise<boolean>;
  
  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  getClientsBySource(source: string): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;
  
  // Operating Expenses
  getOperatingExpenses(): Promise<OperatingExpense[]>;
  getOperatingExpense(id: string): Promise<OperatingExpense | undefined>;
  getExpensesByStatus(status: string): Promise<OperatingExpense[]>;
  createOperatingExpense(expense: InsertOperatingExpense): Promise<OperatingExpense>;
  updateOperatingExpense(id: string, expense: Partial<InsertOperatingExpense>): Promise<OperatingExpense | undefined>;
  deleteOperatingExpense(id: string): Promise<boolean>;
  
  // Job Invoices
  getJobInvoices(): Promise<JobInvoice[]>;
  getJobInvoice(id: string): Promise<JobInvoice | undefined>;
  getInvoicesByClient(clientId: string): Promise<JobInvoice[]>;
  getInvoicesByPaymentStatus(status: string): Promise<JobInvoice[]>;
  createJobInvoice(invoice: InsertJobInvoice): Promise<JobInvoice>;
  updateJobInvoice(id: string, invoice: Partial<InsertJobInvoice>): Promise<JobInvoice | undefined>;
  deleteJobInvoice(id: string): Promise<boolean>;
  
  // Testimonials
  getTestimonials(): Promise<Testimonial[]>;
  getTestimonial(id: string): Promise<Testimonial | undefined>;
  getTestimonialsByStudent(studentId: string): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: string, testimonial: Partial<InsertTestimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: string): Promise<boolean>;
  
  // HR Notes
  getHRNotes(): Promise<HRNote[]>;
  getHRNote(id: string): Promise<HRNote | undefined>;
  getPinnedHRNotes(): Promise<HRNote[]>;
  createHRNote(note: InsertHRNote): Promise<HRNote>;
  updateHRNote(id: string, note: Partial<InsertHRNote>): Promise<HRNote | undefined>;
  deleteHRNote(id: string): Promise<boolean>;
  
  // Certificates
  getCertificates(): Promise<Certificate[]>;
  getCertificate(id: string): Promise<Certificate | undefined>;
  getCertificatesByStudent(studentId: string): Promise<Certificate[]>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  updateCertificate(id: string, certificate: Partial<InsertCertificate>): Promise<Certificate | undefined>;
  deleteCertificate(id: string): Promise<boolean>;
  
  // Vehicles
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  getVehiclesByClient(clientId: string): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;
  
  // Vehicle Inspections
  getVehicleInspections(): Promise<VehicleInspection[]>;
  getVehicleInspection(id: string): Promise<VehicleInspection | undefined>;
  getInspectionsByVehicle(vehicleId: string): Promise<VehicleInspection[]>;
  getInspectionsByInspector(inspectorId: string): Promise<VehicleInspection[]>;
  getInspectionsByStatus(status: string): Promise<VehicleInspection[]>;
  createVehicleInspection(inspection: InsertVehicleInspection): Promise<VehicleInspection>;
  updateVehicleInspection(id: string, inspection: Partial<InsertVehicleInspection>): Promise<VehicleInspection | undefined>;
  deleteVehicleInspection(id: string): Promise<boolean>;
  
  // Inspection Media
  getInspectionMedia(inspectionId: string): Promise<InspectionMedia[]>;
  getMediaItem(id: string): Promise<InspectionMedia | undefined>;
  createInspectionMedia(media: InsertInspectionMedia): Promise<InspectionMedia>;
  deleteInspectionMedia(id: string): Promise<boolean>;
  
  // Jobs
  getJobs(): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  getJobsByStatus(status: string): Promise<Job[]>;
  getJobsByVehicle(vehicleId: string): Promise<Job[]>;
  getJobsByClient(clientId: string): Promise<Job[]>;
  getJobsByAssignee(assignedToId: string): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<InsertJob>): Promise<Job | undefined>;
  deleteJob(id: string): Promise<boolean>;
  getNextJobNumber(): Promise<string>;
  
  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  getSuppliersByStatus(status: string): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string): Promise<boolean>;
  
  // Inventory Items
  getInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItem(id: string): Promise<InventoryItem | undefined>;
  getInventoryItemsByCategory(category: string): Promise<InventoryItem[]>;
  getInventoryItemsBySupplier(supplierId: string): Promise<InventoryItem[]>;
  getLowStockItems(): Promise<InventoryItem[]>;
  searchInventoryItems(query: string): Promise<InventoryItem[]>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: string, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: string): Promise<boolean>;
  updateItemStock(id: string, quantity: string, type: 'add' | 'subtract'): Promise<InventoryItem | undefined>;
  
  // Purchase Orders
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined>;
  getPurchaseOrdersBySupplier(supplierId: string): Promise<PurchaseOrder[]>;
  getPurchaseOrdersByStatus(status: string): Promise<PurchaseOrder[]>;
  createPurchaseOrder(po: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: string, po: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined>;
  deletePurchaseOrder(id: string): Promise<boolean>;
  getNextPONumber(): Promise<string>;
  
  // Inventory Transactions
  getInventoryTransactions(): Promise<InventoryTransaction[]>;
  getInventoryTransaction(id: string): Promise<InventoryTransaction | undefined>;
  getTransactionsByItem(itemId: string): Promise<InventoryTransaction[]>;
  getTransactionsByJob(jobId: string): Promise<InventoryTransaction[]>;
  getTransactionsByType(type: string): Promise<InventoryTransaction[]>;
  createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction>;
  
  // Parts Usage
  getPartsUsage(): Promise<PartsUsage[]>;
  getPartsUsageByJob(jobId: string): Promise<PartsUsage[]>;
  getPartsUsageByItem(itemId: string): Promise<PartsUsage[]>;
  createPartsUsage(usage: InsertPartsUsage): Promise<PartsUsage>;
  deletePartsUsage(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private students: Map<string, Student>;
  private documents: Map<string, Document>;
  private staff: Map<string, Staff>;
  private clients: Map<string, Client>;
  private operatingExpenses: Map<string, OperatingExpense>;
  private jobInvoices: Map<string, JobInvoice>;
  private testimonials: Map<string, Testimonial>;
  private hrNotes: Map<string, HRNote>;
  private certificates: Map<string, Certificate>;
  private vehicles: Map<string, Vehicle>;
  private vehicleInspections: Map<string, VehicleInspection>;
  private inspectionMedia: Map<string, InspectionMedia>;
  private jobs: Map<string, Job>;
  private suppliers: Map<string, Supplier>;
  private inventoryItems: Map<string, InventoryItem>;
  private purchaseOrders: Map<string, PurchaseOrder>;
  private inventoryTransactions: Map<string, InventoryTransaction>;
  private partsUsage: Map<string, PartsUsage>;

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.documents = new Map();
    this.staff = new Map();
    this.clients = new Map();
    this.operatingExpenses = new Map();
    this.jobInvoices = new Map();
    this.testimonials = new Map();
    this.hrNotes = new Map();
    this.certificates = new Map();
    this.vehicles = new Map();
    this.vehicleInspections = new Map();
    this.inspectionMedia = new Map();
    this.jobs = new Map();
    this.suppliers = new Map();
    this.inventoryItems = new Map();
    this.purchaseOrders = new Map();
    this.inventoryTransactions = new Map();
    this.partsUsage = new Map();
    
    // Seed some initial data for testing
    this.seedData();
  }

  private seedData() {
    const sampleStudents: Student[] = [
      {
        id: randomUUID(),
        name: "Jordan Lee",
        email: "jordan.lee@academy.com",
        role: "Junior Tech",
        type: "Student",
        placementStart: new Date("2023-08-01"),
        placementEnd: new Date("2024-02-01"),
        supervisor: "Alex Miller",
        department: "Front-end Shop",
        skills: JSON.stringify(["Brake Systems", "Electrical Diagnostics", "Oil Changes"]),
        status: "Active",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Taylor Reed",
        email: "taylor.reed@academy.com",
        role: "Intern",
        type: "Intern",
        placementStart: new Date("2023-09-01"),
        placementEnd: new Date("2024-03-01"),
        supervisor: "Sam Knight",
        department: "Diagnostics",
        skills: JSON.stringify(["Engine Diagnostics", "Electrical Systems"]),
        status: "Active",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Chris Morgan",
        email: "chris.morgan@academy.com",
        role: "Senior Student",
        type: "Student",
        placementStart: new Date("2023-06-01"),
        placementEnd: new Date("2024-01-15"),
        supervisor: "Alex Miller",
        department: "General Maintenance",
        skills: JSON.stringify(["Tire Service", "Brake Systems", "Fluid Changes", "Inspections"]),
        status: "Completed",
        createdAt: new Date(),
      },
    ];

    sampleStudents.forEach(student => {
      this.students.set(student.id, student);
    });

    // Seed staff data
    const sampleStaff: Staff[] = [
      {
        id: randomUUID(),
        name: "Alex Miller",
        email: "alex.miller@justfix.com",
        phone: "+1-555-0101",
        role: "Technician",
        payRate: JSON.stringify({ hourly: 35, performance_bonus: true }),
        efficiencyScore: "92",
        department: "General Maintenance",
        hireDate: new Date("2021-01-15"),
        status: "Active",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Sam Knight",
        email: "sam.knight@justfix.com",
        phone: "+1-555-0102",
        role: "Instructor",
        payRate: JSON.stringify({ salary: 60000, annual: true }),
        efficiencyScore: "88",
        department: "Academy",
        hireDate: new Date("2020-06-01"),
        status: "Active",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Morgan Davis",
        email: "morgan.davis@justfix.com",
        phone: "+1-555-0103",
        role: "Manager",
        payRate: JSON.stringify({ salary: 75000, annual: true }),
        efficiencyScore: "95",
        department: "Management",
        hireDate: new Date("2020-01-01"),
        status: "Active",
        createdAt: new Date(),
      },
    ];

    sampleStaff.forEach(staff => {
      this.staff.set(staff.id, staff);
    });

    // Seed client data
    const sampleClients: Client[] = [
      {
        id: randomUUID(),
        name: "John Smith",
        email: "john@email.com",
        phone: "+1-555-0201",
        source: "Direct",
        accountType: "Individual",
        companyName: null,
        insuranceProvider: null,
        insurancePolicyNumber: null,
        notes: "Regular customer",
        status: "Active",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "ABC Fleet Services",
        email: "fleet@abcservices.com",
        phone: "+1-555-0202",
        source: "Corporate Fleet",
        accountType: "B2B",
        companyName: "ABC Fleet Services Inc.",
        insuranceProvider: null,
        insurancePolicyNumber: null,
        notes: "10-vehicle fleet account",
        status: "Active",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "SafeGuard Insurance",
        email: "claims@safeguard.com",
        phone: "+1-555-0203",
        source: "Insurance",
        accountType: "Partner",
        companyName: "SafeGuard Insurance Co.",
        insuranceProvider: "Own Insurance",
        insurancePolicyNumber: "SG-12345",
        notes: "Primary insurance partner",
        status: "Active",
        createdAt: new Date(),
      },
    ];

    sampleClients.forEach(client => {
      this.clients.set(client.id, client);
    });

    // Seed operating expenses
    const sampleExpenses: OperatingExpense[] = [
      {
        id: randomUUID(),
        category: "Rent",
        description: "Monthly workshop rent",
        amount: "5000",
        supplier: "Property Management LLC",
        dueDate: new Date("2026-03-01"),
        paidDate: new Date("2026-02-20"),
        status: "Paid",
        receiptUrl: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        category: "Utilities",
        description: "Electricity and water",
        amount: "800",
        supplier: "City Utilities",
        dueDate: new Date("2026-03-15"),
        paidDate: null,
        status: "Pending",
        receiptUrl: null,
        notes: "Bill pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    sampleExpenses.forEach(expense => {
      this.operatingExpenses.set(expense.id, expense);
    });

    // Get client IDs for vehicle seeding
    const clientIds = Array.from(this.clients.values()).map(c => c.id);
    const staffIds = Array.from(this.staff.values()).map(s => s.id);

    // Seed vehicle data
    const sampleVehicles: Vehicle[] = [
      {
        id: randomUUID(),
        vin: "1HGBH41JXMN109186",
        make: "Honda",
        model: "Civic",
        year: "2021",
        licensePlate: "ABC-1234",
        color: "Silver",
        mileage: "45000",
        clientId: clientIds[0] || null,
        clientName: "John Smith",
        status: "Active",
        notes: "Regular maintenance customer",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        vin: "5FNRL5H40JB123456",
        make: "Toyota",
        model: "Camry",
        year: "2020",
        licensePlate: "XYZ-5678",
        color: "Blue",
        mileage: "62000",
        clientId: clientIds[1] || null,
        clientName: "ABC Fleet Services",
        status: "In Service",
        notes: "Fleet vehicle - regular inspections",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        vin: "2T1BURHE0JC987654",
        make: "Ford",
        model: "F-150",
        year: "2019",
        licensePlate: "TRK-9999",
        color: "Red",
        mileage: "78000",
        clientId: clientIds[0] || null,
        clientName: "John Smith",
        status: "Active",
        notes: "Work truck - heavy use",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    sampleVehicles.forEach(vehicle => {
      this.vehicles.set(vehicle.id, vehicle);
    });

    // Seed job data (using staffIds and clientIds already declared above)
    const vehicleIds = Array.from(this.vehicles.keys());
    
    if (staffIds.length > 0 && vehicleIds.length > 0 && clientIds.length > 0) {
      const sampleJobs: Job[] = [
        {
          id: randomUUID(),
          jobNumber: "J-2024-001",
          vehicleId: vehicleIds[0],
          clientId: clientIds[0],
          assignedToId: staffIds[0],
          vehicleInfo: JSON.stringify({make: "Audi", model: "RS6 Avant", year: "2023", plate: "GH-928-KL"}),
          clientName: "Marcus Webb",
          assignedToName: "Alex Miller",
          type: "Maintenance",
          description: "30k Service + Brake Inspection",
          status: "In Progress",
          priority: "High",
          estimatedCost: "850",
          actualCost: "0",
          laborHours: "0",
          notes: "Customer requested full synthetic oil",
          internalNotes: "Check brake fluid level",
          partsNeeded: JSON.stringify(["Oil filter", "Air filter", "Brake pads"]),
          createdDate: new Date("2024-02-14"),
          scheduledDate: new Date("2024-02-14"),
          startedDate: new Date("2024-02-14"),
          completedDate: null,
          estimatedCompletionDate: new Date("2024-02-15"),
          inspectionId: null,
          invoiceId: null,
          createdBy: "System",
          updatedAt: new Date(),
        },
        {
          id: randomUUID(),
          jobNumber: "J-2024-002",
          vehicleId: vehicleIds[1] || vehicleIds[0],
          clientId: clientIds[1] || clientIds[0],
          assignedToId: staffIds[1] || staffIds[0],
          vehicleInfo: JSON.stringify({make: "Land Rover", model: "Defender 110", year: "2024", plate: "LR-442-XM"}),
          clientName: "TechCorp Fleet",
          assignedToName: "Sam Knight",
          type: "Repair",
          description: "Coolant Leak Diagnostic",
          status: "Waiting Parts",
          priority: "Medium",
          estimatedCost: "450",
          actualCost: "0",
          laborHours: "2",
          notes: "Parts ordered, arriving tomorrow",
          internalNotes: "Replace radiator hose",
          partsNeeded: JSON.stringify(["Radiator hose", "Coolant"]),
          createdDate: new Date("2024-02-13"),
          scheduledDate: new Date("2024-02-13"),
          startedDate: new Date("2024-02-13"),
          completedDate: null,
          estimatedCompletionDate: new Date("2024-02-16"),
          inspectionId: null,
          invoiceId: null,
          createdBy: "System",
          updatedAt: new Date(),
        },
        {
          id: randomUUID(),
          jobNumber: "J-2024-003",
          vehicleId: vehicleIds[2] || vehicleIds[0],
          clientId: clientIds[2] || clientIds[0],
          assignedToId: null,
          vehicleInfo: JSON.stringify({make: "Porsche", model: "911 GT3", year: "2022", plate: "PO-911-RS"}),
          clientName: "Sarah Jenkins",
          assignedToName: null,
          type: "Detailing",
          description: "Ceramic Coating Refresh",
          status: "Completed",
          priority: "Low",
          estimatedCost: "1200",
          actualCost: "1200",
          laborHours: "6",
          notes: "Ready for pickup - customer notified",
          internalNotes: "Excellent results, customer will be pleased",
          partsNeeded: JSON.stringify(["Ceramic coating", "Polish"]),
          createdDate: new Date("2024-02-12"),
          scheduledDate: new Date("2024-02-12"),
          startedDate: new Date("2024-02-12"),
          completedDate: new Date("2024-02-14"),
          estimatedCompletionDate: new Date("2024-02-14"),
          inspectionId: null,
          invoiceId: null,
          createdBy: "System",
          updatedAt: new Date(),
        },
        {
          id: randomUUID(),
          jobNumber: "J-2024-004",
          vehicleId: vehicleIds[3] || vehicleIds[0],
          clientId: clientIds[3] || clientIds[0],
          assignedToId: staffIds[0],
          vehicleInfo: JSON.stringify({make: "Mercedes", model: "G63 AMG", year: "2021", plate: "MB-630-AG"}),
          clientName: "Elena Voight",
          assignedToName: "Alex Miller",
          type: "Inspection",
          description: "Pre-purchase Inspection",
          status: "In Progress",
          priority: "High",
          estimatedCost: "350",
          actualCost: "0",
          laborHours: "1.5",
          notes: "Comprehensive inspection for potential buyer",
          internalNotes: "Check suspension and engine mounts carefully",
          partsNeeded: null,
          createdDate: new Date("2024-02-14"),
          scheduledDate: new Date("2024-02-14"),
          startedDate: new Date("2024-02-14"),
          completedDate: null,
          estimatedCompletionDate: new Date("2024-02-14"),
          inspectionId: null,
          invoiceId: null,
          createdBy: "System",
          updatedAt: new Date(),
        },
        {
          id: randomUUID(),
          jobNumber: "J-2024-005",
          vehicleId: vehicleIds[0],
          clientId: clientIds[0],
          assignedToId: null,
          vehicleInfo: JSON.stringify({make: "BMW", model: "M4 Competition", year: "2023", plate: "BM-440-MP"}),
          clientName: "James Chen",
          assignedToName: null,
          type: "Diagnostic",
          description: "Check Engine Light - Code P0420",
          status: "Pending",
          priority: "Medium",
          estimatedCost: "0",
          actualCost: "0",
          laborHours: "0",
          notes: "Initial diagnostic scheduled",
          internalNotes: "Likely catalytic converter issue",
          partsNeeded: null,
          createdDate: new Date("2024-02-15"),
          scheduledDate: new Date("2024-02-16"),
          startedDate: null,
          completedDate: null,
          estimatedCompletionDate: new Date("2024-02-16"),
          inspectionId: null,
          invoiceId: null,
          createdBy: "System",
          updatedAt: new Date(),
        },
      ];

      sampleJobs.forEach(job => {
        this.jobs.set(job.id, job);
      });
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Student methods
  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const student: Student = {
      ...insertStudent,
      id,
      createdAt: new Date(),
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: string, updates: Partial<InsertStudent>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    
    const updatedStudent = { ...student, ...updates };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: string): Promise<boolean> {
    return this.students.delete(id);
  }

  // Document methods
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async searchDocuments(query: string): Promise<Document[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.documents.values()).filter(doc => 
      doc.title.toLowerCase().includes(lowerQuery) ||
      (doc.description && doc.description.toLowerCase().includes(lowerQuery)) ||
      (doc.studentName && doc.studentName.toLowerCase().includes(lowerQuery)) ||
      (doc.clientName && doc.clientName.toLowerCase().includes(lowerQuery)) ||
      (doc.staffName && doc.staffName.toLowerCase().includes(lowerQuery)) ||
      (doc.tags && doc.tags.toLowerCase().includes(lowerQuery))
    );
  }

  async filterDocuments(filters: {
    type?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
    studentId?: string;
    clientId?: string;
    staffId?: string;
  }): Promise<Document[]> {
    let docs = Array.from(this.documents.values());

    if (filters.type) {
      docs = docs.filter(doc => doc.type === filters.type);
    }

    if (filters.category) {
      docs = docs.filter(doc => doc.category === filters.category);
    }

    if (filters.studentId) {
      docs = docs.filter(doc => doc.studentId === filters.studentId);
    }

    if (filters.clientId) {
      docs = docs.filter(doc => doc.clientId === filters.clientId);
    }

    if (filters.staffId) {
      docs = docs.filter(doc => doc.staffId === filters.staffId);
    }

    if (filters.startDate) {
      docs = docs.filter(doc => {
        const docDate = doc.generatedDate ? new Date(doc.generatedDate) : null;
        return docDate && docDate >= filters.startDate!;
      });
    }

    if (filters.endDate) {
      docs = docs.filter(doc => {
        const docDate = doc.generatedDate ? new Date(doc.generatedDate) : null;
        return docDate && docDate <= filters.endDate!;
      });
    }

    return docs;
  }

  async getDocumentsByCategory(category: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.category === category);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = {
      ...insertDocument,
      id,
      generatedDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: string, updateData: Partial<InsertDocument>): Promise<Document | undefined> {
    const existing = this.documents.get(id);
    if (!existing) return undefined;

    const updated: Document = {
      ...existing,
      ...updateData,
      id, // Preserve ID
      updatedAt: new Date(),
    };
    this.documents.set(id, updated);
    return updated;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  async bulkDeleteDocuments(ids: string[]): Promise<number> {
    let deleted = 0;
    for (const id of ids) {
      if (this.documents.delete(id)) {
        deleted++;
      }
    }
    return deleted;
  }

  // ============ STAFF METHODS ============
  async getStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values());
  }

  async getStaffMember(id: string): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const id = randomUUID();
    const staff: Staff = {
      ...insertStaff,
      id,
      createdAt: new Date(),
    };
    this.staff.set(id, staff);
    return staff;
  }

  async updateStaff(id: string, updates: Partial<InsertStaff>): Promise<Staff | undefined> {
    const staff = this.staff.get(id);
    if (!staff) return undefined;
    
    const updatedStaff = { ...staff, ...updates };
    this.staff.set(id, updatedStaff);
    return updatedStaff;
  }

  async deleteStaff(id: string): Promise<boolean> {
    return this.staff.delete(id);
  }

  // ============ CLIENT METHODS ============
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientsBySource(source: string): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(c => c.source === source);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = randomUUID();
    const client: Client = {
      ...insertClient,
      id,
      createdAt: new Date(),
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: string, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    
    const updatedClient = { ...client, ...updates };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: string): Promise<boolean> {
    return this.clients.delete(id);
  }

  // ============ OPERATING EXPENSE METHODS ============
  async getOperatingExpenses(): Promise<OperatingExpense[]> {
    return Array.from(this.operatingExpenses.values());
  }

  async getOperatingExpense(id: string): Promise<OperatingExpense | undefined> {
    return this.operatingExpenses.get(id);
  }

  async getExpensesByStatus(status: string): Promise<OperatingExpense[]> {
    return Array.from(this.operatingExpenses.values()).filter(e => e.status === status);
  }

  async createOperatingExpense(insertExpense: InsertOperatingExpense): Promise<OperatingExpense> {
    const id = randomUUID();
    const expense: OperatingExpense = {
      ...insertExpense,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.operatingExpenses.set(id, expense);
    return expense;
  }

  async updateOperatingExpense(id: string, updates: Partial<InsertOperatingExpense>): Promise<OperatingExpense | undefined> {
    const expense = this.operatingExpenses.get(id);
    if (!expense) return undefined;
    
    const updatedExpense = { ...expense, ...updates, updatedAt: new Date() };
    this.operatingExpenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteOperatingExpense(id: string): Promise<boolean> {
    return this.operatingExpenses.delete(id);
  }

  // ============ JOB INVOICE METHODS ============
  async getJobInvoices(): Promise<JobInvoice[]> {
    return Array.from(this.jobInvoices.values());
  }

  async getJobInvoice(id: string): Promise<JobInvoice | undefined> {
    return this.jobInvoices.get(id);
  }

  async getInvoicesByClient(clientId: string): Promise<JobInvoice[]> {
    return Array.from(this.jobInvoices.values()).filter(i => i.clientId === clientId);
  }

  async getInvoicesByPaymentStatus(status: string): Promise<JobInvoice[]> {
    return Array.from(this.jobInvoices.values()).filter(i => i.paymentStatus === status);
  }

  async createJobInvoice(insertInvoice: InsertJobInvoice): Promise<JobInvoice> {
    const id = randomUUID();
    const invoice: JobInvoice = {
      ...insertInvoice,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.jobInvoices.set(id, invoice);
    return invoice;
  }

  async updateJobInvoice(id: string, updates: Partial<InsertJobInvoice>): Promise<JobInvoice | undefined> {
    const invoice = this.jobInvoices.get(id);
    if (!invoice) return undefined;
    
    const updatedInvoice = { ...invoice, ...updates, updatedAt: new Date() };
    this.jobInvoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async deleteJobInvoice(id: string): Promise<boolean> {
    return this.jobInvoices.delete(id);
  }

  // ============ TESTIMONIAL METHODS ============
  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }

  async getTestimonial(id: string): Promise<Testimonial | undefined> {
    return this.testimonials.get(id);
  }

  async getTestimonialsByStudent(studentId: string): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values()).filter(t => t.studentId === studentId);
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = randomUUID();
    const testimonial: Testimonial = {
      ...insertTestimonial,
      id,
      submittedDate: new Date(),
      createdAt: new Date(),
    };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }

  async updateTestimonial(id: string, updates: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const testimonial = this.testimonials.get(id);
    if (!testimonial) return undefined;
    
    const updatedTestimonial = { ...testimonial, ...updates };
    this.testimonials.set(id, updatedTestimonial);
    return updatedTestimonial;
  }

  async deleteTestimonial(id: string): Promise<boolean> {
    return this.testimonials.delete(id);
  }

  // ============ HR NOTE METHODS ============
  async getHRNotes(): Promise<HRNote[]> {
    return Array.from(this.hrNotes.values());
  }

  async getHRNote(id: string): Promise<HRNote | undefined> {
    return this.hrNotes.get(id);
  }

  async getPinnedHRNotes(): Promise<HRNote[]> {
    const now = new Date();
    return Array.from(this.hrNotes.values()).filter(note => {
      if (note.isPinned === 'false') return false;
      if (note.pinnedUntil && new Date(note.pinnedUntil) < now) {
        // Auto-unpin if expired
        note.isPinned = 'false';
        return false;
      }
      return true;
    });
  }

  async createHRNote(insertNote: InsertHRNote): Promise<HRNote> {
    const id = randomUUID();
    // If pinning, set pinnedUntil to 24 hours from now
    let pinnedUntil = insertNote.pinnedUntil;
    if (insertNote.isPinned === 'true' && !pinnedUntil) {
      pinnedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    
    const note: HRNote = {
      ...insertNote,
      pinnedUntil,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.hrNotes.set(id, note);
    return note;
  }

  async updateHRNote(id: string, updates: Partial<InsertHRNote>): Promise<HRNote | undefined> {
    const note = this.hrNotes.get(id);
    if (!note) return undefined;
    
    const updatedNote = { ...note, ...updates, updatedAt: new Date() };
    this.hrNotes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteHRNote(id: string): Promise<boolean> {
    return this.hrNotes.delete(id);
  }

  // ============ CERTIFICATE METHODS ============
  async getCertificates(): Promise<Certificate[]> {
    return Array.from(this.certificates.values());
  }

  async getCertificate(id: string): Promise<Certificate | undefined> {
    return this.certificates.get(id);
  }

  async getCertificatesByStudent(studentId: string): Promise<Certificate[]> {
    return Array.from(this.certificates.values()).filter(c => c.studentId === studentId);
  }

  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const id = randomUUID();
    const certificate: Certificate = {
      ...insertCertificate,
      id,
      issuedDate: insertCertificate.issuedDate || new Date(),
      createdAt: new Date(),
    };
    this.certificates.set(id, certificate);
    return certificate;
  }

  async updateCertificate(id: string, updates: Partial<InsertCertificate>): Promise<Certificate | undefined> {
    const certificate = this.certificates.get(id);
    if (!certificate) return undefined;
    
    const updatedCertificate = { ...certificate, ...updates };
    this.certificates.set(id, updatedCertificate);
    return updatedCertificate;
  }

  async deleteCertificate(id: string): Promise<boolean> {
    return this.certificates.delete(id);
  }

  // ============ VEHICLES METHODS ============
  
  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async getVehiclesByClient(clientId: string): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values())
      .filter(v => v.clientId === clientId);
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const newVehicle: Vehicle = {
      id: randomUUID(),
      ...vehicle,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.vehicles.set(newVehicle.id, newVehicle);
    return newVehicle;
  }

  async updateVehicle(id: string, updates: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    
    const updatedVehicle = { 
      ...vehicle, 
      ...updates,
      updatedAt: new Date(),
    };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    return this.vehicles.delete(id);
  }

  // ============ VEHICLE INSPECTIONS METHODS ============
  
  async getVehicleInspections(): Promise<VehicleInspection[]> {
    return Array.from(this.vehicleInspections.values())
      .sort((a, b) => {
        const dateA = a.inspectionDate ? new Date(a.inspectionDate).getTime() : 0;
        const dateB = b.inspectionDate ? new Date(b.inspectionDate).getTime() : 0;
        return dateB - dateA; // Most recent first
      });
  }

  async getVehicleInspection(id: string): Promise<VehicleInspection | undefined> {
    return this.vehicleInspections.get(id);
  }

  async getInspectionsByVehicle(vehicleId: string): Promise<VehicleInspection[]> {
    return Array.from(this.vehicleInspections.values())
      .filter(i => i.vehicleId === vehicleId)
      .sort((a, b) => {
        const dateA = a.inspectionDate ? new Date(a.inspectionDate).getTime() : 0;
        const dateB = b.inspectionDate ? new Date(b.inspectionDate).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getInspectionsByInspector(inspectorId: string): Promise<VehicleInspection[]> {
    return Array.from(this.vehicleInspections.values())
      .filter(i => i.inspectorId === inspectorId)
      .sort((a, b) => {
        const dateA = a.inspectionDate ? new Date(a.inspectionDate).getTime() : 0;
        const dateB = b.inspectionDate ? new Date(b.inspectionDate).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getInspectionsByStatus(status: string): Promise<VehicleInspection[]> {
    return Array.from(this.vehicleInspections.values())
      .filter(i => i.overallStatus === status);
  }

  async createVehicleInspection(inspection: InsertVehicleInspection): Promise<VehicleInspection> {
    const newInspection: VehicleInspection = {
      id: randomUUID(),
      ...inspection,
      inspectionDate: inspection.inspectionDate || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.vehicleInspections.set(newInspection.id, newInspection);
    return newInspection;
  }

  async updateVehicleInspection(id: string, updates: Partial<InsertVehicleInspection>): Promise<VehicleInspection | undefined> {
    const inspection = this.vehicleInspections.get(id);
    if (!inspection) return undefined;
    
    const updatedInspection = { 
      ...inspection, 
      ...updates,
      updatedAt: new Date(),
    };
    this.vehicleInspections.set(id, updatedInspection);
    return updatedInspection;
  }

  async deleteVehicleInspection(id: string): Promise<boolean> {
    return this.vehicleInspections.delete(id);
  }

  // ============ INSPECTION MEDIA METHODS ============
  
  async getInspectionMedia(inspectionId: string): Promise<InspectionMedia[]> {
    return Array.from(this.inspectionMedia.values())
      .filter(m => m.inspectionId === inspectionId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getMediaItem(id: string): Promise<InspectionMedia | undefined> {
    return this.inspectionMedia.get(id);
  }

  async createInspectionMedia(media: InsertInspectionMedia): Promise<InspectionMedia> {
    const newMedia: InspectionMedia = {
      id: randomUUID(),
      ...media,
      createdAt: new Date(),
    };
    this.inspectionMedia.set(newMedia.id, newMedia);
    return newMedia;
  }

  async deleteInspectionMedia(id: string): Promise<boolean> {
    return this.inspectionMedia.delete(id);
  }

  // ============ JOBS METHODS ============

  async getJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values()).sort((a, b) => {
      const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
      const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
      return dateB - dateA; // Newest first
    });
  }

  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getJobsByStatus(status: string): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .filter(job => job.status === status)
      .sort((a, b) => {
        const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
        const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getJobsByVehicle(vehicleId: string): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .filter(job => job.vehicleId === vehicleId)
      .sort((a, b) => {
        const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
        const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getJobsByClient(clientId: string): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .filter(job => job.clientId === clientId)
      .sort((a, b) => {
        const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
        const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getJobsByAssignee(assignedToId: string): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .filter(job => job.assignedToId === assignedToId)
      .sort((a, b) => {
        const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
        const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getNextJobNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const jobs = Array.from(this.jobs.values());
    const yearJobs = jobs.filter(job => 
      job.jobNumber.startsWith(`J-${currentYear}`)
    );
    
    let maxNumber = 0;
    yearJobs.forEach(job => {
      const match = job.jobNumber.match(/J-\d{4}-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    });
    
    const nextNumber = (maxNumber + 1).toString().padStart(3, '0');
    return `J-${currentYear}-${nextNumber}`;
  }

  async createJob(jobData: InsertJob): Promise<Job> {
    const jobNumber = await this.getNextJobNumber();
    
    // Get vehicle info if vehicleId provided
    let vehicleInfo = null;
    if (jobData.vehicleId) {
      const vehicle = await this.getVehicle(jobData.vehicleId);
      if (vehicle) {
        vehicleInfo = JSON.stringify({
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          plate: vehicle.licensePlate
        });
      }
    }
    
    // Get client name if clientId provided
    let clientName = null;
    if (jobData.clientId) {
      const client = await this.getClient(jobData.clientId);
      clientName = client?.name || null;
    }
    
    // Get assigned staff name if assignedToId provided
    let assignedToName = null;
    if (jobData.assignedToId) {
      const staffMember = await this.getStaffMember(jobData.assignedToId);
      assignedToName = staffMember?.name || null;
    }
    
    const newJob: Job = {
      id: randomUUID(),
      jobNumber,
      vehicleInfo,
      clientName,
      assignedToName,
      ...jobData,
      createdDate: new Date(),
      updatedAt: new Date(),
    };
    
    this.jobs.set(newJob.id, newJob);
    return newJob;
  }

  async updateJob(id: string, jobData: Partial<InsertJob>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    // Update denormalized fields if IDs changed
    let vehicleInfo = job.vehicleInfo;
    let clientName = job.clientName;
    let assignedToName = job.assignedToName;
    
    if (jobData.vehicleId && jobData.vehicleId !== job.vehicleId) {
      const vehicle = await this.getVehicle(jobData.vehicleId);
      if (vehicle) {
        vehicleInfo = JSON.stringify({
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          plate: vehicle.licensePlate
        });
      }
    }
    
    if (jobData.clientId && jobData.clientId !== job.clientId) {
      const client = await this.getClient(jobData.clientId);
      clientName = client?.name || null;
    }
    
    if (jobData.assignedToId && jobData.assignedToId !== job.assignedToId) {
      const staffMember = await this.getStaffMember(jobData.assignedToId);
      assignedToName = staffMember?.name || null;
    }
    
    const updatedJob: Job = {
      ...job,
      ...jobData,
      vehicleInfo,
      clientName,
      assignedToName,
      updatedAt: new Date(),
    };
    
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  async deleteJob(id: string): Promise<boolean> {
    return this.jobs.delete(id);
  }

  // ============ SUPPLIERS METHODS ============
  
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async getSuppliersByStatus(status: string): Promise<Supplier[]> {
    return Array.from(this.suppliers.values()).filter(s => s.status === status);
  }

  async createSupplier(data: InsertSupplier): Promise<Supplier> {
    const supplier: Supplier = {
      id: randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.suppliers.set(supplier.id, supplier);
    return supplier;
  }

  async updateSupplier(id: string, data: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return undefined;

    const updated: Supplier = {
      ...supplier,
      ...data,
      updatedAt: new Date(),
    };
    this.suppliers.set(id, updated);
    return updated;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    return this.suppliers.delete(id);
  }

  // ============ INVENTORY ITEMS METHODS ============

  async getInventoryItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values());
  }

  async getInventoryItem(id: string): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async getInventoryItemsByCategory(category: string): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(item => item.category === category);
  }

  async getInventoryItemsBySupplier(supplierId: string): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(item => item.supplierId === supplierId);
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(item => {
      const stock = parseFloat(item.stock);
      const minStock = parseFloat(item.minStock);
      return stock <= minStock;
    });
  }

  async searchInventoryItems(query: string): Promise<InventoryItem[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.inventoryItems.values()).filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.sku.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery) ||
      (item.description && item.description.toLowerCase().includes(lowerQuery)) ||
      (item.location && item.location.toLowerCase().includes(lowerQuery))
    );
  }

  async createInventoryItem(data: InsertInventoryItem): Promise<InventoryItem> {
    const stock = parseFloat(data.stock || "0");
    const minStock = parseFloat(data.minStock || "5");
    
    const item: InventoryItem = {
      id: randomUUID(),
      ...data,
      isLowStock: stock <= minStock ? 'true' : 'false',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.inventoryItems.set(item.id, item);
    return item;
  }

  async updateInventoryItem(id: string, data: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const item = this.inventoryItems.get(id);
    if (!item) return undefined;

    const updated: InventoryItem = {
      ...item,
      ...data,
      updatedAt: new Date(),
    };

    // Update low stock flag
    const stock = parseFloat(updated.stock);
    const minStock = parseFloat(updated.minStock);
    updated.isLowStock = stock <= minStock ? 'true' : 'false';

    this.inventoryItems.set(id, updated);
    return updated;
  }

  async deleteInventoryItem(id: string): Promise<boolean> {
    return this.inventoryItems.delete(id);
  }

  async updateItemStock(id: string, quantity: string, type: 'add' | 'subtract'): Promise<InventoryItem | undefined> {
    const item = this.inventoryItems.get(id);
    if (!item) return undefined;

    const currentStock = parseFloat(item.stock);
    const quantityChange = parseFloat(quantity);
    const newStock = type === 'add' ? currentStock + quantityChange : currentStock - quantityChange;

    return this.updateInventoryItem(id, { 
      stock: newStock.toString(),
      lastRestocked: type === 'add' ? new Date() : item.lastRestocked,
      lastUsed: type === 'subtract' ? new Date() : item.lastUsed,
    });
  }

  // ============ PURCHASE ORDERS METHODS ============

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return Array.from(this.purchaseOrders.values());
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
    return this.purchaseOrders.get(id);
  }

  async getPurchaseOrdersBySupplier(supplierId: string): Promise<PurchaseOrder[]> {
    return Array.from(this.purchaseOrders.values()).filter(po => po.supplierId === supplierId);
  }

  async getPurchaseOrdersByStatus(status: string): Promise<PurchaseOrder[]> {
    return Array.from(this.purchaseOrders.values()).filter(po => po.status === status);
  }

  async createPurchaseOrder(data: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const po: PurchaseOrder = {
      id: randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.purchaseOrders.set(po.id, po);
    return po;
  }

  async updatePurchaseOrder(id: string, data: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const po = this.purchaseOrders.get(id);
    if (!po) return undefined;

    const updated: PurchaseOrder = {
      ...po,
      ...data,
      updatedAt: new Date(),
    };
    this.purchaseOrders.set(id, updated);
    return updated;
  }

  async deletePurchaseOrder(id: string): Promise<boolean> {
    return this.purchaseOrders.delete(id);
  }

  async getNextPONumber(): Promise<string> {
    const pos = await this.getPurchaseOrders();
    const year = new Date().getFullYear();
    const maxNum = pos
      .filter(po => po.poNumber.startsWith(`PO-${year}-`))
      .map(po => parseInt(po.poNumber.split('-')[2]))
      .reduce((max, num) => Math.max(max, num), 0);
    return `PO-${year}-${String(maxNum + 1).padStart(3, '0')}`;
  }

  // ============ INVENTORY TRANSACTIONS METHODS ============

  async getInventoryTransactions(): Promise<InventoryTransaction[]> {
    return Array.from(this.inventoryTransactions.values());
  }

  async getInventoryTransaction(id: string): Promise<InventoryTransaction | undefined> {
    return this.inventoryTransactions.get(id);
  }

  async getTransactionsByItem(itemId: string): Promise<InventoryTransaction[]> {
    return Array.from(this.inventoryTransactions.values()).filter(t => t.itemId === itemId);
  }

  async getTransactionsByJob(jobId: string): Promise<InventoryTransaction[]> {
    return Array.from(this.inventoryTransactions.values()).filter(t => t.jobId === jobId);
  }

  async getTransactionsByType(type: string): Promise<InventoryTransaction[]> {
    return Array.from(this.inventoryTransactions.values()).filter(t => t.type === type);
  }

  async createInventoryTransaction(data: InsertInventoryTransaction): Promise<InventoryTransaction> {
    const transaction: InventoryTransaction = {
      id: randomUUID(),
      ...data,
      createdAt: new Date(),
    };
    this.inventoryTransactions.set(transaction.id, transaction);
    return transaction;
  }

  // ============ PARTS USAGE METHODS ============

  async getPartsUsage(): Promise<PartsUsage[]> {
    return Array.from(this.partsUsage.values());
  }

  async getPartsUsageByJob(jobId: string): Promise<PartsUsage[]> {
    return Array.from(this.partsUsage.values()).filter(pu => pu.jobId === jobId);
  }

  async getPartsUsageByItem(itemId: string): Promise<PartsUsage[]> {
    return Array.from(this.partsUsage.values()).filter(pu => pu.itemId === itemId);
  }

  async createPartsUsage(data: InsertPartsUsage): Promise<PartsUsage> {
    const usage: PartsUsage = {
      id: randomUUID(),
      ...data,
      createdAt: new Date(),
    };
    this.partsUsage.set(usage.id, usage);
    return usage;
  }

  async deletePartsUsage(id: string): Promise<boolean> {
    return this.partsUsage.delete(id);
  }
}

export const storage = new MemStorage();
