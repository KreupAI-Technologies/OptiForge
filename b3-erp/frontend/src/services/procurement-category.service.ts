// Procurement Categories service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth: procurement/controllers/procurement-category.controller.ts
//   @Controller('procurement/categories')

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

export interface ProcurementCategory {
  id: string;
  companyId: string;
  code?: string;
  name: string;
  description?: string;
  budget: number;
  spent: number;
  suppliers: number;
  items: number;
  manager?: string;
  priority: string;
  savingsTarget: number;
  actualSavings: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UpsertProcurementCategoryPayload = Partial<
  Omit<ProcurementCategory, 'id' | 'createdAt' | 'updatedAt'>
> & { name: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
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

export const procurementCategoryService = {
  async getCategories(filters?: {
    priority?: string;
    status?: string;
  }): Promise<ProcurementCategory[]> {
    const params = new URLSearchParams();
    if (filters?.priority && filters.priority !== 'all')
      params.append('priority', filters.priority);
    if (filters?.status && filters.status !== 'all')
      params.append('status', filters.status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await request<any>(`/procurement/categories${qs}`);
    return Array.isArray(data) ? data : data?.data ?? [];
  },

  async createCategory(
    payload: UpsertProcurementCategoryPayload,
  ): Promise<ProcurementCategory> {
    return request<ProcurementCategory>('/procurement/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateCategory(
    id: string,
    payload: Partial<UpsertProcurementCategoryPayload>,
  ): Promise<ProcurementCategory> {
    return request<ProcurementCategory>(`/procurement/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteCategory(id: string): Promise<void> {
    await request<void>(`/procurement/categories/${id}`, { method: 'DELETE' });
  },
};
