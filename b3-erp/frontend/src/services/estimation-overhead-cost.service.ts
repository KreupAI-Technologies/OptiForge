// Estimation Overhead Costs service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth: estimation/controllers/overhead-cost.controller.ts
//   @Controller('estimation/overhead-costs')

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

export interface OverheadCost {
  id: string;
  companyId: string;
  name: string;
  category?: string;
  costType: string;
  monthlyAmount: number;
  annualAmount: number;
  allocationMethod: string;
  allocationRate: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UpsertOverheadCostPayload = Partial<
  Omit<OverheadCost, 'id' | 'createdAt' | 'updatedAt'>
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

export const estimationOverheadCostService = {
  async getCosts(filters?: {
    category?: string;
    status?: string;
  }): Promise<OverheadCost[]> {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'all')
      params.append('category', filters.category);
    if (filters?.status && filters.status !== 'all')
      params.append('status', filters.status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await request<any>(`/estimation/overhead-costs${qs}`);
    return Array.isArray(data) ? data : data?.data ?? [];
  },

  async createCost(payload: UpsertOverheadCostPayload): Promise<OverheadCost> {
    return request<OverheadCost>('/estimation/overhead-costs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateCost(
    id: string,
    payload: Partial<UpsertOverheadCostPayload>,
  ): Promise<OverheadCost> {
    return request<OverheadCost>(`/estimation/overhead-costs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteCost(id: string): Promise<void> {
    await request<void>(`/estimation/overhead-costs/${id}`, {
      method: 'DELETE',
    });
  },
};
