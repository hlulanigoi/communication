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

// Documents table - Enhanced for comprehensive document management
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  type: text("type").notNull(), // "Certificate", "Placement Letter", "Compliance", "Custom"
  category: text("category").notNull().default('General'), // "Student", "Vehicle", "Client", "Job", "Staff", "Insurance", "General"
  fileType: text("file_type").notNull().default('application/pdf'), // MIME type
  fileName: text("file_name"), // Original filename
  fileSize: text("file_size"), // File size in bytes
  
  // Reference IDs for linking
  studentId: varchar("student_id").references(() => students.id, { onDelete: 'cascade' }),
  clientId: varchar("client_id").references(() => clients.id, { onDelete: 'set null' }),
  staffId: varchar("staff_id").references(() => staff.id, { onDelete: 'set null' }),
  
  // Denormalized names for easy access
  studentName: text("student_name"),
  clientName: text("client_name"),
  staffName: text("staff_name"),
  
  content: text("content"), // Base64 encoded file content
  metadata: text("metadata"), // JSON string for additional info
  tags: text("tags"), // JSON array of tags for better search
  description: text("description"), // Optional description
  version: text("version").default("1.0"), // Document version
  
  uploadedBy: text("uploaded_by"), // Who uploaded/generated
  generatedDate: timestamp("generated_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  generatedDate: true,
  createdAt: true,
  updatedAt: true,
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

// ============ VEHICLE INSPECTIONS TABLES ============

// Vehicles table
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vin: text("vin"),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: text("year").notNull(),
  licensePlate: text("license_plate"),
  color: text("color"),
  mileage: text("mileage"),
  clientId: varchar("client_id").references(() => clients.id, { onDelete: 'set null' }),
  clientName: text("client_name"),
  status: text("status").notNull().default('Active'), // Active, Inactive, In Service
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

// Vehicle Inspections table
export const vehicleInspections = pgTable("vehicle_inspections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: 'set null' }),
  vehicleInfo: text("vehicle_info"), // JSON string with make, model, year, license
  jobId: text("job_id"), // Optional job reference
  jobNumber: text("job_number"), // Job number for display
  inspectorId: varchar("inspector_id").references(() => staff.id, { onDelete: 'set null' }),
  inspectorName: text("inspector_name").notNull(),
  clientId: varchar("client_id").references(() => clients.id, { onDelete: 'set null' }),
  clientName: text("client_name"),
  clientPhone: text("client_phone"),
  clientEmail: text("client_email"),
  inspectionData: text("inspection_data").notNull(), // JSON with all inspection items and statuses
  overallStatus: text("overall_status").notNull().default('In Progress'), // In Progress, Completed, Sent to Client
  criticalIssuesCount: text("critical_issues_count").default("0"),
  attentionIssuesCount: text("attention_issues_count").default("0"),
  passedItemsCount: text("passed_items_count").default("0"),
  mediaUrls: text("media_urls"), // JSON array of media file paths/URLs
  inspectorNotes: text("inspector_notes"),
  inspectorSignature: text("inspector_signature"), // Base64 signature or signature data
  sentToClient: text("sent_to_client").default('false'),
  sentToClientDate: timestamp("sent_to_client_date"),
  clientApproved: text("client_approved").default('false'),
  clientApprovedDate: timestamp("client_approved_date"),
  pdfReportUrl: text("pdf_report_url"),
  inspectionDate: timestamp("inspection_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVehicleInspectionSchema = createInsertSchema(vehicleInspections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVehicleInspection = z.infer<typeof insertVehicleInspectionSchema>;
export type VehicleInspection = typeof vehicleInspections.$inferSelect;

// Inspection Media table (for storing individual media files)
export const inspectionMedia = pgTable("inspection_media", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inspectionId: varchar("inspection_id").notNull().references(() => vehicleInspections.id, { onDelete: 'cascade' }),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // image/jpeg, image/png, video/mp4, etc.
  fileSize: text("file_size"),
  fileData: text("file_data"), // Base64 encoded file data
  fileUrl: text("file_url"), // Alternative: URL to stored file
  category: text("category"), // Which inspection section this belongs to
  uploadedBy: text("uploaded_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInspectionMediaSchema = createInsertSchema(inspectionMedia).omit({
  id: true,
  createdAt: true,
});

export type InsertInspectionMedia = z.infer<typeof insertInspectionMediaSchema>;
export type InspectionMedia = typeof inspectionMedia.$inferSelect;

// ============ JOBS TABLE ============
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobNumber: text("job_number").notNull().unique(), // e.g., "J-2024-001"
  
  // Links to other entities
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: 'set null' }),
  clientId: varchar("client_id").references(() => clients.id, { onDelete: 'set null' }),
  assignedToId: varchar("assigned_to_id").references(() => staff.id, { onDelete: 'set null' }),
  inspectionId: varchar("inspection_id").references(() => vehicleInspections.id, { onDelete: 'set null' }),
  
  // Denormalized for quick access
  vehicleInfo: text("vehicle_info"), // JSON: {make, model, year, plate}
  clientName: text("client_name"),
  assignedToName: text("assigned_to_name"),
  
  // Job details
  type: text("type").notNull(), // "Maintenance", "Repair", "Inspection", "Detailing", "Diagnostic"
  description: text("description").notNull(),
  status: text("status").notNull().default('Pending'), // "Pending", "In Progress", "Waiting Parts", "Completed", "Cancelled"
  priority: text("priority").notNull().default('Medium'), // "Low", "Medium", "High", "Urgent"
  
  // Timeline
  createdDate: timestamp("created_date").defaultNow(),
  scheduledDate: timestamp("scheduled_date"),
  startedDate: timestamp("started_date"),
  completedDate: timestamp("completed_date"),
  estimatedCompletionDate: timestamp("estimated_completion_date"),
  
  // Financial
  estimatedCost: text("estimated_cost").default("0"), // Stored as string for precision
  actualCost: text("actual_cost").default("0"),
  laborHours: text("labor_hours").default("0"),
  
  // Additional details
  partsNeeded: text("parts_needed"), // JSON array of parts
  notes: text("notes"), // Customer-facing notes
  internalNotes: text("internal_notes"), // Internal staff notes
  
  // Metadata
  invoiceId: varchar("invoice_id").references(() => jobInvoices.id, { onDelete: 'set null' }),
  createdBy: text("created_by"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdDate: true,
  updatedAt: true,
});

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

// ============ INVENTORY MANAGEMENT TABLES ============

// Suppliers table
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  website: text("website"),
  paymentTerms: text("payment_terms"), // e.g., "Net 30", "COD"
  rating: text("rating"), // Supplier performance rating
  notes: text("notes"),
  status: text("status").notNull().default('Active'), // Active, Inactive
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

// Inventory Items table
export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // "Brakes", "Filters", "Fluids", "Ignition", "Body Parts", etc.
  subcategory: text("subcategory"),
  
  // Stock management
  stock: text("stock").notNull().default("0"), // Current stock quantity
  minStock: text("min_stock").notNull().default("5"), // Minimum stock level
  maxStock: text("max_stock").notNull().default("100"), // Maximum stock level
  reorderPoint: text("reorder_point").notNull().default("10"), // When to reorder
  reorderQuantity: text("reorder_quantity").notNull().default("20"), // How much to reorder
  
  // Pricing
  unitPrice: text("unit_price").notNull().default("0"), // Selling price
  costPrice: text("cost_price").notNull().default("0"), // Purchase cost
  markup: text("markup").default("0"), // Markup percentage
  
  // Supplier information
  supplierId: varchar("supplier_id").references(() => suppliers.id, { onDelete: 'set null' }),
  supplierName: text("supplier_name"),
  supplierSku: text("supplier_sku"), // Supplier's SKU for this item
  
  // Physical details
  location: text("location"), // Warehouse location (e.g., "A-12-3")
  barcode: text("barcode"),
  unit: text("unit").notNull().default("piece"), // "piece", "liter", "kg", "box", etc.
  weight: text("weight"), // For shipping calculations
  
  // Tracking
  lastRestocked: timestamp("last_restocked"),
  lastUsed: timestamp("last_used"),
  totalUsage: text("total_usage").default("0"), // Lifetime usage count
  
  // Status and metadata
  status: text("status").notNull().default('Active'), // Active, Discontinued, Out of Stock
  isLowStock: text("is_low_stock").default('false'), // Computed flag
  tags: text("tags"), // JSON array for flexible categorization
  images: text("images"), // JSON array of image URLs
  warranty: text("warranty"), // Warranty information
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;

// Purchase Orders table
export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poNumber: text("po_number").notNull().unique(), // e.g., "PO-2024-001"
  supplierId: varchar("supplier_id").notNull().references(() => suppliers.id, { onDelete: 'restrict' }),
  supplierName: text("supplier_name").notNull(), // Denormalized
  
  // Order details
  items: text("items").notNull(), // JSON array of {itemId, itemName, sku, quantity, unitPrice, total}
  subtotal: text("subtotal").notNull().default("0"),
  taxRate: text("tax_rate").default("0"),
  taxAmount: text("tax_amount").default("0"),
  shippingCost: text("shipping_cost").default("0"),
  totalAmount: text("total_amount").notNull(),
  
  // Status and dates
  status: text("status").notNull().default('Draft'), // Draft, Sent, Confirmed, Partially Received, Received, Cancelled
  orderDate: timestamp("order_date").defaultNow(),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  
  // Additional info
  orderedBy: text("ordered_by"), // Staff member who created the order
  receivedBy: text("received_by"), // Staff member who received the order
  paymentStatus: text("payment_status").default('Pending'), // Pending, Paid, Partial
  paymentMethod: text("payment_method"),
  notes: text("notes"),
  attachments: text("attachments"), // JSON array of file URLs
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

// Inventory Transactions table - tracks all stock movements
export const inventoryTransactions = pgTable("inventory_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: varchar("item_id").notNull().references(() => inventoryItems.id, { onDelete: 'cascade' }),
  itemName: text("item_name").notNull(), // Denormalized
  itemSku: text("item_sku").notNull(), // Denormalized
  
  // Transaction details
  type: text("type").notNull(), // "purchase", "usage", "adjustment", "return", "transfer", "damaged"
  quantity: text("quantity").notNull(), // Positive for additions, negative for reductions
  quantityBefore: text("quantity_before").notNull(), // Stock before transaction
  quantityAfter: text("quantity_after").notNull(), // Stock after transaction
  
  // Cost tracking
  unitCost: text("unit_cost").default("0"),
  totalCost: text("total_cost").default("0"),
  
  // Reference to related entities
  referenceType: text("reference_type"), // "job", "purchase_order", "adjustment", "manual"
  referenceId: text("reference_id"), // ID of the related entity
  jobId: varchar("job_id").references(() => jobs.id, { onDelete: 'set null' }),
  purchaseOrderId: varchar("purchase_order_id").references(() => purchaseOrders.id, { onDelete: 'set null' }),
  
  // Who and when
  performedBy: text("performed_by").notNull(), // Staff member who performed the transaction
  transactionDate: timestamp("transaction_date").defaultNow(),
  
  // Additional info
  reason: text("reason"), // Reason for adjustment, damage, etc.
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({
  id: true,
  createdAt: true,
});

export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;

// Parts Usage table - links parts to jobs
export const partsUsage = pgTable("parts_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  jobNumber: text("job_number"), // Denormalized
  
  itemId: varchar("item_id").notNull().references(() => inventoryItems.id, { onDelete: 'restrict' }),
  itemName: text("item_name").notNull(), // Denormalized
  itemSku: text("item_sku").notNull(), // Denormalized
  
  quantity: text("quantity").notNull(),
  unitPrice: text("unit_price").notNull(), // Price charged to customer
  unitCost: text("unit_cost").notNull(), // Cost to business
  totalPrice: text("total_price").notNull(), // Total charged to customer
  totalCost: text("total_cost").notNull(), // Total cost to business
  profit: text("profit").notNull(), // totalPrice - totalCost
  
  usedBy: text("used_by"), // Staff member who used the part
  usedDate: timestamp("used_date").defaultNow(),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPartsUsageSchema = createInsertSchema(partsUsage).omit({
  id: true,
  createdAt: true,
});

export type InsertPartsUsage = z.infer<typeof insertPartsUsageSchema>;
export type PartsUsage = typeof partsUsage.$inferSelect;
