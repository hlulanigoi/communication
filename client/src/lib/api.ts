import type { Student, Document } from '@shared/schema';

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

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/documents/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete document');
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
