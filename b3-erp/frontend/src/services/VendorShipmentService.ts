// Vendor Shipment Tracking service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth:
//   project-management/controllers/pm-vendor-shipment.controller.ts
//   @Controller('api/project-management/vendor-shipments')
// (global prefix is api/v1, so the full path is api/v1/api/project-management/vendor-shipments)

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'test';

const BASE_PATH = '/api/project-management/vendor-shipments';

export interface VendorShipment {
  id: string;
  companyId?: string;
  projectId: string;
  poId?: string;
  vendorName?: string;
  itemDescription?: string;
  status: string;
  carrier?: string;
  trackingNumber?: string;
  expectedDelivery?: string;
  lastLocation?: string;
  trackingHistory?: Array<{
    timestamp?: string;
    status?: string;
    location?: string;
    event?: string;
  }>;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVendorShipmentPayload {
  projectId: string;
  poId?: string;
  vendorName?: string;
  itemDescription?: string;
  status?: string;
  carrier?: string;
  trackingNumber?: string;
  expectedDelivery?: string;
  lastLocation?: string;
  notes?: string;
  createdBy?: string;
}

export interface UpdateTrackingPayload {
  status?: string;
  location?: string;
  lastLocation?: string;
  event?: string;
  carrier?: string;
  trackingNumber?: string;
  expectedDelivery?: string;
  notes?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-company-id': COMPANY_ID,
    },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${path}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  const body = await res.json();
  // Unwrap { success, data } envelope; tolerate bare payloads too.
  return (body?.data ?? body) as T;
}

export const vendorShipmentService = {
  async list(projectId: string): Promise<VendorShipment[]> {
    const data = await request<any>(
      `${BASE_PATH}?projectId=${encodeURIComponent(projectId)}`,
    );
    return Array.isArray(data) ? data : [];
  },

  async create(data: CreateVendorShipmentPayload): Promise<VendorShipment> {
    return request<VendorShipment>(BASE_PATH, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTracking(
    id: string,
    data: UpdateTrackingPayload,
  ): Promise<VendorShipment> {
    return request<VendorShipment>(`${BASE_PATH}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
