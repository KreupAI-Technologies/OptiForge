// Procurement Savings Initiatives service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth: procurement/controllers/savings-initiative.controller.ts
//   @Controller('procurement/savings-initiatives')

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

export interface SavingsInitiative {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  category?: string;
  type?: string;
  targetSavings: number;
  actualSavings: number;
  owner?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UpsertSavingsInitiativePayload = Partial<
  Omit<SavingsInitiative, 'id' | 'createdAt' | 'updatedAt'>
> & { title: string };

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

export const procurementSavingsService = {
  async getInitiatives(filters?: {
    category?: string;
    type?: string;
    status?: string;
  }): Promise<SavingsInitiative[]> {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'all')
      params.append('category', filters.category);
    if (filters?.type && filters.type !== 'all')
      params.append('type', filters.type);
    if (filters?.status && filters.status !== 'all')
      params.append('status', filters.status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await request<any>(`/procurement/savings-initiatives${qs}`);
    return Array.isArray(data) ? data : data?.data ?? [];
  },

  async createInitiative(
    payload: UpsertSavingsInitiativePayload,
  ): Promise<SavingsInitiative> {
    return request<SavingsInitiative>('/procurement/savings-initiatives', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateInitiative(
    id: string,
    payload: Partial<UpsertSavingsInitiativePayload>,
  ): Promise<SavingsInitiative> {
    return request<SavingsInitiative>(
      `/procurement/savings-initiatives/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    );
  },

  async deleteInitiative(id: string): Promise<void> {
    await request<void>(`/procurement/savings-initiatives/${id}`, {
      method: 'DELETE',
    });
  },

  // POST /procurement/savings-initiatives/:id/calculate
  // Recomputes realized/projected savings from the initiative's fields and
  // persists the result. Returns the updated initiative.
  async calculateInitiative(id: string): Promise<SavingsInitiative> {
    return request<SavingsInitiative>(
      `/procurement/savings-initiatives/${id}/calculate`,
      { method: 'POST' },
    );
  },
};
