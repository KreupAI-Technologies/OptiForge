// Estimation Labor Cost Rates service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth: estimation/controllers/labor-cost-rate.controller.ts
//   @Controller('estimation/labor-costs')

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

export interface LaborCostRate {
  id: string;
  companyId: string;
  skill: string;
  department?: string;
  level?: string;
  standardRate: number;
  overtimeRate: number;
  unit: string;
  efficiency: number;
  utilization: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UpsertLaborCostRatePayload = Partial<
  Omit<LaborCostRate, 'id' | 'createdAt' | 'updatedAt'>
> & { skill: string };

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

export const estimationLaborCostService = {
  async getRates(filters?: {
    department?: string;
    status?: string;
  }): Promise<LaborCostRate[]> {
    const params = new URLSearchParams();
    if (filters?.department && filters.department !== 'all')
      params.append('department', filters.department);
    if (filters?.status && filters.status !== 'all')
      params.append('status', filters.status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await request<any>(`/estimation/labor-costs${qs}`);
    return Array.isArray(data) ? data : data?.data ?? [];
  },

  async createRate(payload: UpsertLaborCostRatePayload): Promise<LaborCostRate> {
    return request<LaborCostRate>('/estimation/labor-costs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateRate(
    id: string,
    payload: Partial<UpsertLaborCostRatePayload>,
  ): Promise<LaborCostRate> {
    return request<LaborCostRate>(`/estimation/labor-costs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteRate(id: string): Promise<void> {
    await request<void>(`/estimation/labor-costs/${id}`, { method: 'DELETE' });
  },
};
