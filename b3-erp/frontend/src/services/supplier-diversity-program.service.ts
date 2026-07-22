// Supplier Diversity Programs service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth: procurement/controllers/supplier-diversity-program.controller.ts
//   @Controller('procurement/diversity-programs')

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

export interface SupplierDiversityProgram {
  id: string;
  companyId: string;
  supplierId?: string;
  category: string;
  certificationType?: string;
  status: string;
  spendAmount?: number;
  goalPercent?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type UpsertDiversityProgramPayload = Partial<
  Omit<SupplierDiversityProgram, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>
> & { category: string };

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

export const supplierDiversityProgramService = {
  async getPrograms(filters?: {
    category?: string;
    status?: string;
    supplierId?: string;
  }): Promise<SupplierDiversityProgram[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.supplierId) params.append('supplierId', filters.supplierId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await request<any>(`/procurement/diversity-programs${qs}`);
    return Array.isArray(data) ? data : data?.data ?? [];
  },

  async createProgram(
    payload: UpsertDiversityProgramPayload,
  ): Promise<SupplierDiversityProgram> {
    return request<SupplierDiversityProgram>(
      '/procurement/diversity-programs',
      { method: 'POST', body: JSON.stringify(payload) },
    );
  },

  async updateProgram(
    id: string,
    payload: Partial<UpsertDiversityProgramPayload>,
  ): Promise<SupplierDiversityProgram> {
    return request<SupplierDiversityProgram>(
      `/procurement/diversity-programs/${id}`,
      { method: 'PATCH', body: JSON.stringify(payload) },
    );
  },

  async deleteProgram(id: string): Promise<void> {
    await request<void>(`/procurement/diversity-programs/${id}`, {
      method: 'DELETE',
    });
  },
};
