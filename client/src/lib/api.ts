import type { 
  Student, 
  Document, 
  Staff, 
  Client, 
  JobInvoice, 
  OperatingExpense, 
  HRNote, 
  Testimonial, 
  Certificate,
  Vehicle,
  VehicleInspection,
  InspectionMedia
} from '@shared/schema';

const API_BASE = '/api';

// ============ STUDENTS API ============

export async function getStudents(): Promise<Student[]> {
  const res = await fetch(`${API_BASE}/students`);
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

export async function getStudent(id: string): Promise<Student> {
  const res = await fetch(`${API_BASE}/students/${id}`);
  if (!res.ok) throw new Error('Failed to fetch student');
  return res.json();
}

export async function createStudent(student: Partial<Student>): Promise<Student> {
  const res = await fetch(`${API_BASE}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  });
  if (!res.ok) throw new Error('Failed to create student');
  return res.json();
}

export async function updateStudent(id: string, student: Partial<Student>): Promise<Student> {
  const res = await fetch(`${API_BASE}/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  });
  if (!res.ok) throw new Error('Failed to update student');
  return res.json();
}

export async function deleteStudent(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/students/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete student');
}

// ============ DOCUMENTS API ============

export async function getDocuments(): Promise<Document[]> {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function getDocument(id: string): Promise<Document> {
  const res = await fetch(`${API_BASE}/documents/${id}`);
  if (!res.ok) throw new Error('Failed to fetch document');
  return res.json();
}

export async function searchDocuments(query: string): Promise<Document[]> {
  const res = await fetch(`${API_BASE}/documents/search/${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search documents');
  return res.json();
}

export interface DocumentFilters {
  type?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  studentId?: string;
  clientId?: string;
  staffId?: string;
}

export async function filterDocuments(filters: DocumentFilters): Promise<Document[]> {
  const res = await fetch(`${API_BASE}/documents/filter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters),
  });
  if (!res.ok) throw new Error('Failed to filter documents');
  return res.json();
}

export async function getDocumentsByCategory(category: string): Promise<Document[]> {
  const res = await fetch(`${API_BASE}/documents/category/${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error('Failed to fetch documents by category');
  return res.json();
}

export interface UploadDocumentRequest {
  title: string;
  type: string;
  category: string;
  fileType: string;
  fileName: string;
  fileSize: string;
  content: string;
  studentId?: string;
  clientId?: string;
  staffId?: string;
  description?: string;
  tags?: string[];
  uploadedBy?: string;
}

export async function uploadDocument(data: UploadDocumentRequest): Promise<Document> {
  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      tags: data.tags ? JSON.stringify(data.tags) : null,
    }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to upload document');
  }
  return res.json();
}

export async function updateDocument(id: string, data: Partial<Document>): Promise<Document> {
  const res = await fetch(`${API_BASE}/documents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update document');
  return res.json();
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/documents/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete document');
}

export async function bulkDeleteDocuments(ids: string[]): Promise<{ deletedCount: number; message: string }> {
  const res = await fetch(`${API_BASE}/documents/bulk-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error('Failed to bulk delete documents');
  return res.json();
}

export function getDocumentDownloadUrl(id: string): string {
  return `${API_BASE}/documents/${id}/download`;
}

// ============ DOCUMENT GENERATION API ============

export interface GenerateCertificateRequest {
  studentId: string;
  certificateType: string;
}

export async function generateCertificate(data: GenerateCertificateRequest): Promise<Document> {
  const res = await fetch(`${API_BASE}/documents/generate-certificate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to generate certificate');
  }
  return res.json();
}

export interface GeneratePlacementLetterRequest {
  studentId: string;
  achievements?: string[];
}

export async function generatePlacementLetter(data: GeneratePlacementLetterRequest): Promise<Document> {
  const res = await fetch(`${API_BASE}/documents/generate-placement-letter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to generate placement letter');
  }
  return res.json();
}

export interface GenerateComplianceReportRequest {
  reportType: string;
  dateRange?: { start: Date; end: Date };
  summary?: string;
}

export async function generateComplianceReport(data: GenerateComplianceReportRequest): Promise<Document> {
  const res = await fetch(`${API_BASE}/documents/generate-compliance-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to generate compliance report');
  }
  return res.json();
}

// ============ STAFF API ============

export async function getStaff(): Promise<Staff[]> {
  const res = await fetch(`${API_BASE}/staff`);
  if (!res.ok) throw new Error('Failed to fetch staff');
  return res.json();
}

export async function getStaffMember(id: string): Promise<Staff> {
  const res = await fetch(`${API_BASE}/staff/${id}`);
  if (!res.ok) throw new Error('Failed to fetch staff member');
  return res.json();
}

export async function createStaff(staff: Partial<Staff>): Promise<Staff> {
  const res = await fetch(`${API_BASE}/staff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(staff),
  });
  if (!res.ok) throw new Error('Failed to create staff member');
  return res.json();
}

export async function updateStaff(id: string, staff: Partial<Staff>): Promise<Staff> {
  const res = await fetch(`${API_BASE}/staff/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(staff),
  });
  if (!res.ok) throw new Error('Failed to update staff member');
  return res.json();
}

export async function deleteStaff(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/staff/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete staff member');
}

// ============ CLIENTS API ============

export async function getClients(): Promise<Client[]> {
  const res = await fetch(`${API_BASE}/clients`);
  if (!res.ok) throw new Error('Failed to fetch clients');
  return res.json();
}

export async function getClient(id: string): Promise<Client> {
  const res = await fetch(`${API_BASE}/clients/${id}`);
  if (!res.ok) throw new Error('Failed to fetch client');
  return res.json();
}

export async function getClientsBySource(source: 'Direct' | 'Insurance' | 'Corporate Fleet'): Promise<Client[]> {
  const res = await fetch(`${API_BASE}/clients/by-source/${source}`);
  if (!res.ok) throw new Error(`Failed to fetch ${source} clients`);
  return res.json();
}

export async function createClient(client: Partial<Client>): Promise<Client> {
  const res = await fetch(`${API_BASE}/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client),
  });
  if (!res.ok) throw new Error('Failed to create client');
  return res.json();
}

export async function updateClient(id: string, client: Partial<Client>): Promise<Client> {
  const res = await fetch(`${API_BASE}/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client),
  });
  if (!res.ok) throw new Error('Failed to update client');
  return res.json();
}

export async function deleteClient(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/clients/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete client');
}

// ============ INVOICES API ============

export async function getInvoices(): Promise<JobInvoice[]> {
  const res = await fetch(`${API_BASE}/invoices`);
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json();
}

export async function getInvoice(id: string): Promise<JobInvoice> {
  const res = await fetch(`${API_BASE}/invoices/${id}`);
  if (!res.ok) throw new Error('Failed to fetch invoice');
  return res.json();
}

export async function getInvoicesByClient(clientId: string): Promise<JobInvoice[]> {
  const res = await fetch(`${API_BASE}/invoices/by-client/${clientId}`);
  if (!res.ok) throw new Error('Failed to fetch client invoices');
  return res.json();
}

export async function getInvoicesByStatus(status: string): Promise<JobInvoice[]> {
  const res = await fetch(`${API_BASE}/invoices/by-status/${status}`);
  if (!res.ok) throw new Error('Failed to fetch invoices by status');
  return res.json();
}

export async function createInvoice(invoice: Partial<JobInvoice>): Promise<JobInvoice> {
  const res = await fetch(`${API_BASE}/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice),
  });
  if (!res.ok) throw new Error('Failed to create invoice');
  return res.json();
}

export async function updateInvoice(id: string, invoice: Partial<JobInvoice>): Promise<JobInvoice> {
  const res = await fetch(`${API_BASE}/invoices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice),
  });
  if (!res.ok) throw new Error('Failed to update invoice');
  return res.json();
}

export async function deleteInvoice(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/invoices/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete invoice');
}

// ============ EXPENSES API ============

export async function getExpenses(): Promise<OperatingExpense[]> {
  const res = await fetch(`${API_BASE}/expenses`);
  if (!res.ok) throw new Error('Failed to fetch expenses');
  return res.json();
}

export async function getExpense(id: string): Promise<OperatingExpense> {
  const res = await fetch(`${API_BASE}/expenses/${id}`);
  if (!res.ok) throw new Error('Failed to fetch expense');
  return res.json();
}

export async function getExpensesByStatus(status: string): Promise<OperatingExpense[]> {
  const res = await fetch(`${API_BASE}/expenses/by-status/${status}`);
  if (!res.ok) throw new Error('Failed to fetch expenses by status');
  return res.json();
}

export async function createExpense(expense: Partial<OperatingExpense>): Promise<OperatingExpense> {
  const res = await fetch(`${API_BASE}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  });
  if (!res.ok) throw new Error('Failed to create expense');
  return res.json();
}

export async function updateExpense(id: string, expense: Partial<OperatingExpense>): Promise<OperatingExpense> {
  const res = await fetch(`${API_BASE}/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  });
  if (!res.ok) throw new Error('Failed to update expense');
  return res.json();
}

export async function deleteExpense(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/expenses/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete expense');
}

// ============ HR NOTES API ============

export async function getHRNotes(): Promise<HRNote[]> {
  const res = await fetch(`${API_BASE}/hr-notes`);
  if (!res.ok) throw new Error('Failed to fetch HR notes');
  return res.json();
}

export async function getHRNote(id: string): Promise<HRNote> {
  const res = await fetch(`${API_BASE}/hr-notes/${id}`);
  if (!res.ok) throw new Error('Failed to fetch HR note');
  return res.json();
}

export async function getPinnedHRNotes(): Promise<HRNote[]> {
  const res = await fetch(`${API_BASE}/hr-notes/pinned`);
  if (!res.ok) throw new Error('Failed to fetch pinned HR notes');
  return res.json();
}

export async function createHRNote(note: Partial<HRNote>): Promise<HRNote> {
  const res = await fetch(`${API_BASE}/hr-notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error('Failed to create HR note');
  return res.json();
}

export async function updateHRNote(id: string, note: Partial<HRNote>): Promise<HRNote> {
  const res = await fetch(`${API_BASE}/hr-notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error('Failed to update HR note');
  return res.json();
}

export async function deleteHRNote(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/hr-notes/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete HR note');
}

// ============ TESTIMONIALS API ============

export async function getTestimonials(): Promise<Testimonial[]> {
  const res = await fetch(`${API_BASE}/testimonials`);
  if (!res.ok) throw new Error('Failed to fetch testimonials');
  return res.json();
}

export async function getTestimonial(id: string): Promise<Testimonial> {
  const res = await fetch(`${API_BASE}/testimonials/${id}`);
  if (!res.ok) throw new Error('Failed to fetch testimonial');
  return res.json();
}

export async function getTestimonialsByStudent(studentId: string): Promise<Testimonial[]> {
  const res = await fetch(`${API_BASE}/testimonials/by-student/${studentId}`);
  if (!res.ok) throw new Error('Failed to fetch student testimonials');
  return res.json();
}

export async function createTestimonial(testimonial: Partial<Testimonial>): Promise<Testimonial> {
  const res = await fetch(`${API_BASE}/testimonials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testimonial),
  });
  if (!res.ok) throw new Error('Failed to create testimonial');
  return res.json();
}

export async function updateTestimonial(id: string, testimonial: Partial<Testimonial>): Promise<Testimonial> {
  const res = await fetch(`${API_BASE}/testimonials/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testimonial),
  });
  if (!res.ok) throw new Error('Failed to update testimonial');
  return res.json();
}

export async function deleteTestimonial(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/testimonials/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete testimonial');
}

// ============ CERTIFICATES API ============

export async function getCertificates(): Promise<Certificate[]> {
  const res = await fetch(`${API_BASE}/certificates`);
  if (!res.ok) throw new Error('Failed to fetch certificates');
  return res.json();
}

export async function getCertificate(id: string): Promise<Certificate> {
  const res = await fetch(`${API_BASE}/certificates/${id}`);
  if (!res.ok) throw new Error('Failed to fetch certificate');
  return res.json();
}

export async function getCertificatesByStudent(studentId: string): Promise<Certificate[]> {
  const res = await fetch(`${API_BASE}/certificates/by-student/${studentId}`);
  if (!res.ok) throw new Error('Failed to fetch student certificates');
  return res.json();
}

export async function createCertificate(certificate: Partial<Certificate>): Promise<Certificate> {
  const res = await fetch(`${API_BASE}/certificates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(certificate),
  });
  if (!res.ok) throw new Error('Failed to create certificate');
  return res.json();
}

export async function updateCertificate(id: string, certificate: Partial<Certificate>): Promise<Certificate> {
  const res = await fetch(`${API_BASE}/certificates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(certificate),
  });
  if (!res.ok) throw new Error('Failed to update certificate');
  return res.json();
}

export async function deleteCertificate(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/certificates/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete certificate');
}

// ============ BUSINESS LOGIC API ============

export interface InvoiceSplitRequest {
  clientSource: 'Direct' | 'Insurance' | 'Corporate Fleet';
  laborTotal: string;
  partsTotal: string;
  taxRate: string;
}

export async function calculateInvoiceSplit(data: InvoiceSplitRequest): Promise<{
  insuranceExcess: string;
  insuranceClaimAmount: string;
  isInsuranceJob: boolean;
}> {
  const res = await fetch(`${API_BASE}/business-logic/calculate-invoice-split`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to calculate invoice split');
  return res.json();
}

export async function processGraduations(): Promise<{ processed: number; message: string }> {
  const res = await fetch(`${API_BASE}/business-logic/process-graduations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to process graduations');
  return res.json();
}

export async function runScheduledTasks(): Promise<{ tasksRun: number; message: string }> {
  const res = await fetch(`${API_BASE}/business-logic/run-scheduled-tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to run scheduled tasks');
  return res.json();
}

// ============ VEHICLES API ============

export async function getVehicles(): Promise<Vehicle[]> {
  const res = await fetch(`${API_BASE}/vehicles`);
  if (!res.ok) throw new Error('Failed to fetch vehicles');
  return res.json();
}

export async function getVehicle(id: string): Promise<Vehicle> {
  const res = await fetch(`${API_BASE}/vehicles/${id}`);
  if (!res.ok) throw new Error('Failed to fetch vehicle');
  return res.json();
}

export async function getVehiclesByClient(clientId: string): Promise<Vehicle[]> {
  const res = await fetch(`${API_BASE}/vehicles/by-client/${clientId}`);
  if (!res.ok) throw new Error('Failed to fetch client vehicles');
  return res.json();
}

export async function createVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle> {
  const res = await fetch(`${API_BASE}/vehicles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vehicle),
  });
  if (!res.ok) throw new Error('Failed to create vehicle');
  return res.json();
}

export async function updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
  const res = await fetch(`${API_BASE}/vehicles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vehicle),
  });
  if (!res.ok) throw new Error('Failed to update vehicle');
  return res.json();
}

export async function deleteVehicle(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/vehicles/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete vehicle');
}

// ============ VEHICLE INSPECTIONS API ============

export async function getVehicleInspections(): Promise<VehicleInspection[]> {
  const res = await fetch(`${API_BASE}/inspections`);
  if (!res.ok) throw new Error('Failed to fetch inspections');
  return res.json();
}

export async function getVehicleInspection(id: string): Promise<VehicleInspection> {
  const res = await fetch(`${API_BASE}/inspections/${id}`);
  if (!res.ok) throw new Error('Failed to fetch inspection');
  return res.json();
}

export async function getInspectionsByVehicle(vehicleId: string): Promise<VehicleInspection[]> {
  const res = await fetch(`${API_BASE}/inspections/by-vehicle/${vehicleId}`);
  if (!res.ok) throw new Error('Failed to fetch vehicle inspections');
  return res.json();
}

export async function getInspectionsByStatus(status: string): Promise<VehicleInspection[]> {
  const res = await fetch(`${API_BASE}/inspections/by-status/${status}`);
  if (!res.ok) throw new Error('Failed to fetch inspections by status');
  return res.json();
}

export async function createVehicleInspection(inspection: Partial<VehicleInspection>): Promise<VehicleInspection> {
  const res = await fetch(`${API_BASE}/inspections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inspection),
  });
  if (!res.ok) throw new Error('Failed to create inspection');
  return res.json();
}

export async function updateVehicleInspection(id: string, inspection: Partial<VehicleInspection>): Promise<VehicleInspection> {
  const res = await fetch(`${API_BASE}/inspections/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inspection),
  });
  if (!res.ok) throw new Error('Failed to update inspection');
  return res.json();
}

export async function deleteVehicleInspection(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/inspections/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete inspection');
}

export async function sendInspectionToClient(id: string): Promise<{ success: boolean; message: string; sentDate: Date }> {
  const res = await fetch(`${API_BASE}/inspections/${id}/send-to-client`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to send inspection to client');
  return res.json();
}

// ============ INSPECTION MEDIA API ============

export async function getInspectionMedia(inspectionId: string): Promise<InspectionMedia[]> {
  const res = await fetch(`${API_BASE}/inspections/${inspectionId}/media`);
  if (!res.ok) throw new Error('Failed to fetch inspection media');
  return res.json();
}

export async function createInspectionMedia(inspectionId: string, media: Partial<InspectionMedia>): Promise<InspectionMedia> {
  const res = await fetch(`${API_BASE}/inspections/${inspectionId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(media),
  });
  if (!res.ok) throw new Error('Failed to upload inspection media');
  return res.json();
}

export async function deleteInspectionMedia(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/inspections/media/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete inspection media');
}
// ============ GLOBAL SEARCH API ============

export interface GlobalSearchResult {
  id: string;
  type: 'document' | 'vehicle' | 'client' | 'job' | 'inventory' | 'invoice' | 'staff';
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  relevance: number;
}

export async function globalSearch(query: string): Promise<GlobalSearchResult[]> {
  const res = await fetch(`${API_BASE}/search/global/${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to perform global search');
  return res.json();
}

export async function autocompleteSearch(query: string): Promise<GlobalSearchResult[]> {
  const res = await fetch(`${API_BASE}/search/autocomplete/${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to get search suggestions');
  return res.json();
}

// Search History Management (Client-side localStorage)
const SEARCH_HISTORY_KEY = 'justfix_search_history';
const MAX_SEARCH_HISTORY = 10;

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultCount?: number;
}

export function getSearchHistory(): SearchHistoryItem[] {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

export function addToSearchHistory(query: string, resultCount?: number): void {
  try {
    if (!query.trim()) return;
    
    const history = getSearchHistory();
    // Remove duplicate if exists
    const filtered = history.filter(item => item.query.toLowerCase() !== query.toLowerCase());
    
    // Add new item at beginning
    const newHistory = [
      { query, timestamp: Date.now(), resultCount },
      ...filtered
    ].slice(0, MAX_SEARCH_HISTORY);
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  } catch {
    console.error('Failed to save search history');
  }
}

export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch {
    console.error('Failed to clear search history');
  }
}

export function removeFromSearchHistory(query: string): void {
  try {
    const history = getSearchHistory().filter(item => item.query !== query);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch {
    console.error('Failed to remove from search history');
  }
}