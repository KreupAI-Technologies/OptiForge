// Estimation Material Cost Rates service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth: estimation/controllers/material-cost-rate.controller.ts
//   @Controller('estimation/material-costs')

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

export interface MaterialCostRate {
  id: string;
  companyId: string;
  materialCode?: string;
  materialName: string;
  category?: string;
  unit: string;
  currentPrice: number;
  previousPrice: number;
  variancePercent: number;
  supplier?: string;
  lastUpdated?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UpsertMaterialCostRatePayload = Partial<
  Omit<MaterialCostRate, 'id' | 'createdAt' | 'updatedAt'>
> & { materialName: string };

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

export const estimationMaterialCostService = {
  async getRates(filters?: {
    category?: string;
    status?: string;
  }): Promise<MaterialCostRate[]> {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'all')
      params.append('category', filters.category);
    if (filters?.status && filters.status !== 'all')
      params.append('status', filters.status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await request<any>(`/estimation/material-costs${qs}`);
    return Array.isArray(data) ? data : data?.data ?? [];
  },

  async createRate(
    payload: UpsertMaterialCostRatePayload,
  ): Promise<MaterialCostRate> {
    return request<MaterialCostRate>('/estimation/material-costs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateRate(
    id: string,
    payload: Partial<UpsertMaterialCostRatePayload>,
  ): Promise<MaterialCostRate> {
    return request<MaterialCostRate>(`/estimation/material-costs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteRate(id: string): Promise<void> {
    await request<void>(`/estimation/material-costs/${id}`, {
      method: 'DELETE',
    });
  },
};
