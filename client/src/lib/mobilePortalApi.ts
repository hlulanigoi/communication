// ============ QR TOKEN ENDPOINTS ============

export async function validateQRToken(token: string) {
  const response = await fetch(`/api/qr-tokens/${token}/validate`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Token validation failed");
  }
  return response.json();
}

export async function generateQRToken(payload: {
  clientId: string;
  clientName: string;
  actionType: "document" | "job";
  expiresInDays: number;
  createdBy: string;
}) {
  const response = await fetch("/api/qr-tokens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to generate QR token");
  }
  return response.json();
}

export async function listQRTokens() {
  const response = await fetch("/api/qr-tokens/admin");
  if (!response.ok) {
    throw new Error("Failed to load QR tokens");
  }
  return response.json();
}

export async function revokeQRToken(tokenId: string) {
  const response = await fetch(`/api/qr-tokens/${tokenId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to revoke token");
  }
  return response.json();
}

export async function deleteQRToken(tokenId: string) {
  const response = await fetch(`/api/qr-tokens/${tokenId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete token");
  }
  return response.json();
}

// ============ MOBILE SUBMISSION ENDPOINTS ============

export async function createDocumentMobile(payload: {
  clientId: string;
  documentType: string;
  extractedData: any;
  editedFields: Record<string, any>;
  originalPhotos: string[];
  metadata: any;
}) {
  const response = await fetch("/api/documents/mobile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to submit document");
  }
  return response.json();
}

export async function createJobMobile(payload: {
  clientId: string;
  vehicleId: string;
  jobType: string;
  priority: string;
  description: string;
  notes?: string;
  attachedPhotos: string[];
  location?: { latitude: number; longitude: number; accuracy: number };
  voiceNote?: string;
  metadata: any;
}) {
  const response = await fetch("/api/jobs/mobile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create job");
  }
  return response.json();
}

// ============ HELPER ENDPOINTS ============

export async function getClients() {
  const response = await fetch("/api/clients");
  if (!response.ok) {
    throw new Error("Failed to load clients");
  }
  return response.json();
}

export async function getVehicles() {
  const response = await fetch("/api/vehicles");
  if (!response.ok) {
    throw new Error("Failed to load vehicles");
  }
  return response.json();
}

export async function searchVehicleByRegistration(plate: string) {
  const response = await fetch(`/api/vehicles/by-registration/${plate}`);
  if (!response.ok) {
    throw new Error("Vehicle not found");
  }
  return response.json();
}

export async function searchVehicleByVin(vin: string) {
  const response = await fetch(`/api/vehicles/by-vin/${vin}`);
  if (!response.ok) {
    throw new Error("Vehicle not found");
  }
  return response.json();
}

// ============ MOBILE-SPECIFIC ENDPOINTS ============

export async function getQRStats() {
  const response = await fetch("/api/qr-tokens/stats");
  if (!response.ok) {
    throw new Error("Failed to load QR statistics");
  }
  return response.json();
}

export async function getMobileSubmissions(limit: number = 10) {
  const response = await fetch(`/api/mobile-submissions?limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to load mobile submissions");
  }
  return response.json();
}

export async function getDocumentMobile(documentId: string) {
  const response = await fetch(`/api/documents/mobile/${documentId}`);
  if (!response.ok) {
    throw new Error("Failed to load document");
  }
  return response.json();
}

export async function getJobMobile(jobId: string) {
  const response = await fetch(`/api/jobs/mobile/${jobId}`);
  if (!response.ok) {
    throw new Error("Failed to load job");
  }
  return response.json();
}
