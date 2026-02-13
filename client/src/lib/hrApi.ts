// HR Management API functions

const API_BASE = "http://localhost:5000/api";

// ============ LEAVE REQUESTS ============
export async function getLeaveRequests() {
  const response = await fetch(`${API_BASE}/leave-requests`);
  if (!response.ok) throw new Error("Failed to fetch leave requests");
  return response.json();
}

export async function getLeaveRequestsByStaff(staffId: string) {
  const response = await fetch(`${API_BASE}/leave-requests/staff/${staffId}`);
  if (!response.ok) throw new Error("Failed to fetch leave requests");
  return response.json();
}

export async function getLeaveRequest(id: string) {
  const response = await fetch(`${API_BASE}/leave-requests/${id}`);
  if (!response.ok) throw new Error("Failed to fetch leave request");
  return response.json();
}

export async function createLeaveRequest(data: any) {
  const response = await fetch(`${API_BASE}/leave-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create leave request");
  return response.json();
}

export async function updateLeaveRequest(id: string, data: any) {
  const response = await fetch(`${API_BASE}/leave-requests/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update leave request");
  return response.json();
}

export async function deleteLeaveRequest(id: string) {
  const response = await fetch(`${API_BASE}/leave-requests/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete leave request");
  return response.json();
}

// ============ PAYROLL ============
export async function getPayrollRecords() {
  const response = await fetch(`${API_BASE}/payroll`);
  if (!response.ok) throw new Error("Failed to fetch payroll records");
  return response.json();
}

export async function getPayrollRecordsByStaff(staffId: string) {
  const response = await fetch(`${API_BASE}/payroll/staff/${staffId}`);
  if (!response.ok) throw new Error("Failed to fetch payroll records");
  return response.json();
}

export async function getPayrollRecord(id: string) {
  const response = await fetch(`${API_BASE}/payroll/${id}`);
  if (!response.ok) throw new Error("Failed to fetch payroll record");
  return response.json();
}

export async function createPayrollRecord(data: any) {
  const response = await fetch(`${API_BASE}/payroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create payroll record");
  return response.json();
}

export async function updatePayrollRecord(id: string, data: any) {
  const response = await fetch(`${API_BASE}/payroll/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update payroll record");
  return response.json();
}

export async function deletePayrollRecord(id: string) {
  const response = await fetch(`${API_BASE}/payroll/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete payroll record");
  return response.json();
}

// ============ PERFORMANCE REVIEWS ============
export async function getPerformanceReviews() {
  const response = await fetch(`${API_BASE}/performance-reviews`);
  if (!response.ok) throw new Error("Failed to fetch performance reviews");
  return response.json();
}

export async function getPerformanceReviewsByStaff(staffId: string) {
  const response = await fetch(`${API_BASE}/performance-reviews/staff/${staffId}`);
  if (!response.ok) throw new Error("Failed to fetch performance reviews");
  return response.json();
}

export async function getPerformanceReviewsForReviewer(reviewerId: string) {
  const response = await fetch(`${API_BASE}/performance-reviews/reviewer/${reviewerId}`);
  if (!response.ok) throw new Error("Failed to fetch performance reviews");
  return response.json();
}

export async function getPerformanceReview(id: string) {
  const response = await fetch(`${API_BASE}/performance-reviews/${id}`);
  if (!response.ok) throw new Error("Failed to fetch performance review");
  return response.json();
}

export async function createPerformanceReview(data: any) {
  const response = await fetch(`${API_BASE}/performance-reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create performance review");
  return response.json();
}

export async function updatePerformanceReview(id: string, data: any) {
  const response = await fetch(`${API_BASE}/performance-reviews/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update performance review");
  return response.json();
}

export async function deletePerformanceReview(id: string) {
  const response = await fetch(`${API_BASE}/performance-reviews/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete performance review");
  return response.json();
}

// ============ EMPLOYEE BENEFITS ============
export async function getEmployeeBenefits() {
  const response = await fetch(`${API_BASE}/benefits`);
  if (!response.ok) throw new Error("Failed to fetch benefits");
  return response.json();
}

export async function getEmployeeBenefitsByStaff(staffId: string) {
  const response = await fetch(`${API_BASE}/benefits/staff/${staffId}`);
  if (!response.ok) throw new Error("Failed to fetch benefits");
  return response.json();
}

export async function getEmployeeBenefit(id: string) {
  const response = await fetch(`${API_BASE}/benefits/${id}`);
  if (!response.ok) throw new Error("Failed to fetch benefit");
  return response.json();
}

export async function createEmployeeBenefit(data: any) {
  const response = await fetch(`${API_BASE}/benefits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create benefit");
  return response.json();
}

export async function updateEmployeeBenefit(id: string, data: any) {
  const response = await fetch(`${API_BASE}/benefits/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update benefit");
  return response.json();
}

export async function deleteEmployeeBenefit(id: string) {
  const response = await fetch(`${API_BASE}/benefits/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete benefit");
  return response.json();
}
