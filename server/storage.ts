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
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: string): Promise<boolean>;
  
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

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = {
      ...insertDocument,
      id,
      generatedDate: new Date(),
      createdAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
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
}

export const storage = new MemStorage();
