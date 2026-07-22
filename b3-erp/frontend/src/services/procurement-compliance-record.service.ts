// Procurement Compliance Records service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth: procurement/controllers/procurement-compliance-record.controller.ts
//   @Controller('procurement/compliance-records')

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

export interface ProcurementComplianceRecord {
  id: string;
  companyId: string;
  supplierId?: string;
  requirement: string;
  status: string;
  evidence?: string;
  dueDate?: string;
  completedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UpsertComplianceRecordPayload = Partial<
  Omit<ProcurementComplianceRecord, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>
> & { requirement: string };

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
  return res.json() as Promise<T>;
}

export const procurementComplianceRecordService = {
  async getRecords(filters?: {
    status?: string;
    supplierId?: string;
  }): Promise<ProcurementComplianceRecord[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.supplierId) params.append('supplierId', filters.supplierId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await request<any>(`/procurement/compliance-records${qs}`);
    return Array.isArray(data) ? data : data?.data ?? [];
  },

  async createRecord(
    payload: UpsertComplianceRecordPayload,
  ): Promise<ProcurementComplianceRecord> {
    return request<ProcurementComplianceRecord>(
      '/procurement/compliance-records',
      { method: 'POST', body: JSON.stringify(payload) },
    );
  },

  async updateRecord(
    id: string,
    payload: Partial<UpsertComplianceRecordPayload>,
  ): Promise<ProcurementComplianceRecord> {
    return request<ProcurementComplianceRecord>(
      `/procurement/compliance-records/${id}`,
      { method: 'PATCH', body: JSON.stringify(payload) },
    );
  },

  async deleteRecord(id: string): Promise<void> {
    await request<void>(`/procurement/compliance-records/${id}`, {
      method: 'DELETE',
    });
  },
};
