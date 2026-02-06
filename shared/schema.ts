import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Students table for document generation
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(), // e.g., "Junior Tech", "Intern"
  type: text("type").notNull(), // "Student" or "Intern"
  placementStart: timestamp("placement_start"),
  placementEnd: timestamp("placement_end"),
  supervisor: text("supervisor"),
  department: text("department"),
  skills: text("skills"), // JSON string of skills mastered
  status: text("status").notNull().default('Active'), // Active, Completed, Alumni
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

// Documents table
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  type: text("type").notNull(), // "Certificate", "Placement Letter", "Compliance", "Custom"
  studentId: varchar("student_id").references(() => students.id, { onDelete: 'cascade' }),
  studentName: text("student_name"), // Denormalized for easy access
  content: text("content"), // Base64 encoded PDF or file content
  metadata: text("metadata"), // JSON string for additional info
  generatedDate: timestamp("generated_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  generatedDate: true,
  createdAt: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// ============ STAFF TABLE ============
export const staff = pgTable("staff", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(), // "Technician", "Manager", "Instructor", "HR"
  email: text("email").notNull(),
  phone: text("phone"),
  payRate: text("pay_rate"), // JSON for flexible pay structures
  efficiencyScore: text("efficiency_score").default("0"), // Tracked metric
  department: text("department"), // e.g., "General Maintenance", "Diagnostics"
  hireDate: timestamp("hire_date"),
  status: text("status").notNull().default('Active'), // Active, On Leave, Inactive
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
});

export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staff.$inferSelect;

// ============ CLIENTS TABLE ============
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  source: text("source").notNull(), // "Direct", "Insurance", "Corporate Fleet"
  accountType: text("account_type").notNull(), // "Individual", "B2B", "Partner"
  companyName: text("company_name"),
  insuranceProvider: text("insurance_provider"),
  insurancePolicyNumber: text("insurance_policy_number"),
  notes: text("notes"),
  status: text("status").notNull().default('Active'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

// ============ OPERATING EXPENSES TABLE ============
export const operatingExpenses = pgTable("operating_expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(), // "Rent", "Utilities", "Supplies", "Equipment", "Maintenance"
  description: text("description"),
  amount: text("amount").notNull(), // Stored as string to preserve precision
  supplier: text("supplier"),
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
  status: text("status").notNull().default('Pending'), // "Pending", "Paid", "Overdue"
  receiptUrl: text("receipt_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOperatingExpenseSchema = createInsertSchema(operatingExpenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOperatingExpense = z.infer<typeof insertOperatingExpenseSchema>;
export type OperatingExpense = typeof operatingExpenses.$inferSelect;

// ============ JOB INVOICES TABLE ============
export const jobInvoices = pgTable("job_invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id"), // Reference to job/work order
  clientId: varchar("client_id").notNull().references(() => clients.id, { onDelete: 'restrict' }),
  clientSource: text("client_source").notNull(), // Denormalized from clients table
  description: text("description"),
  partsTotal: text("parts_total").notNull().default("0"), // Stored as string
  laborTotal: text("labor_total").notNull().default("0"), // Stored as string
  taxRate: text("tax_rate").notNull().default("0"), // As percentage (e.g., "8.5")
  totalAmount: text("total_amount").notNull(), // partsTotal + laborTotal + tax
  insuranceExcess: text("insurance_excess"), // Amount client pays for insurance jobs
  insuranceClaimAmount: text("insurance_claim_amount"), // Amount insurance covers
  paymentStatus: text("payment_status").notNull().default('Unpaid'), // "Unpaid", "Partial", "Paid"
  invoiceDate: timestamp("invoice_date").defaultNow(),
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertJobInvoiceSchema = createInsertSchema(jobInvoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertJobInvoice = z.infer<typeof insertJobInvoiceSchema>;
export type JobInvoice = typeof jobInvoices.$inferSelect;

// ============ TESTIMONIALS TABLE ============
export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id, { onDelete: 'cascade' }),
  studentName: text("student_name").notNull(),
  employerName: text("employer_name").notNull(),
  employerRole: text("employer_role"),
  content: text("content").notNull(),
  rating: text("rating"), // Out of 5
  verified: text("verified").notNull().default('false'), // Whether verified by admin
  submittedDate: timestamp("submitted_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  submittedDate: true,
  createdAt: true,
});

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

// ============ HR NOTES/NOTIFICATIONS TABLE ============
export const hrNotes = pgTable("hr_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => staff.id, { onDelete: 'restrict' }),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  targetAudience: text("target_audience"), // "All", "Management", "Finance", specific staff IDs
  isPinned: text("is_pinned").notNull().default('false'),
  pinnedUntil: timestamp("pinned_until"), // Auto-unpin after 24 hours
  priority: text("priority").notNull().default('Normal'), // "Low", "Normal", "High", "Urgent"
  category: text("category"), // "Announcement", "Alert", "Reminder", "Policy"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertHRNoteSchema = createInsertSchema(hrNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertHRNote = z.infer<typeof insertHRNoteSchema>;
export type HRNote = typeof hrNotes.$inferSelect;

// ============ CERTIFICATES TABLE ============
export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id, { onDelete: 'cascade' }),
  studentName: text("student_name").notNull(),
  type: text("type").notNull(), // "Completion", "Achievement", "Skill", "Safety"
  title: text("title").notNull(),
  issuerName: text("issuer_name"), // Name of person issuing
  issuerRole: text("issuer_role"),
  issuedDate: timestamp("issued_date").defaultNow(),
  validUntil: timestamp("valid_until"),
  documentId: varchar("document_id").references(() => documents.id, { onDelete: 'set null' }),
  verified: text("verified").notNull().default('true'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  issuedDate: true,
  createdAt: true,
});

export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;
