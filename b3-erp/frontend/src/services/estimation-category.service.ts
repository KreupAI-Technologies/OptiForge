// Estimation Categories service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth: estimation/controllers/estimation-category.controller.ts
//   @Controller('estimation/categories')

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

export interface EstimationCategory {
  id: string;
  companyId: string;
  code?: string;
  name: string;
  description?: string;
  parentCategory?: string;
  type: string;
  defaultMarkup: number;
  itemCount: number;
  sortOrder: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UpsertEstimationCategoryPayload = Partial<
  Omit<EstimationCategory, 'id' | 'createdAt' | 'updatedAt'>
> & { name: string };

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

export const estimationCategoryService = {
  async getCategories(filters?: {
    type?: string;
    status?: string;
  }): Promise<EstimationCategory[]> {
    const params = new URLSearchParams();
    if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters?.status && filters.status !== 'all')
      params.append('status', filters.status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await request<any>(`/estimation/categories${qs}`);
    return Array.isArray(data) ? data : data?.data ?? [];
  },

  async createCategory(
    payload: UpsertEstimationCategoryPayload,
  ): Promise<EstimationCategory> {
    return request<EstimationCategory>('/estimation/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateCategory(
    id: string,
    payload: Partial<UpsertEstimationCategoryPayload>,
  ): Promise<EstimationCategory> {
    return request<EstimationCategory>(`/estimation/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteCategory(id: string): Promise<void> {
    await request<void>(`/estimation/categories/${id}`, { method: 'DELETE' });
  },
};
