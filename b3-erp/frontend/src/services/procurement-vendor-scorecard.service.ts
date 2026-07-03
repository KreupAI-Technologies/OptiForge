// Procurement Vendor Scorecards service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth: procurement/controllers/vendor-scorecard.controller.ts
//   @Controller('procurement/vendor-scorecards')

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

export interface VendorScorecard {
  id: string;
  companyId: string;
  vendorCode?: string;
  vendorName: string;
  category?: string;
  overallScore: number;
  qualityScore: number;
  deliveryScore: number;
  costScore: number;
  serviceScore: number;
  tier?: string;
  riskScore: number;
  riskLevel: string;
  totalSpend: number;
  totalOrders: number;
  lastEvaluated?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UpsertVendorScorecardPayload = Partial<
  Omit<VendorScorecard, 'id' | 'createdAt' | 'updatedAt'>
> & { vendorName: string };

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

export const procurementVendorScorecardService = {
  async getScorecards(filters?: {
    category?: string;
    tier?: string;
    status?: string;
  }): Promise<VendorScorecard[]> {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'all')
      params.append('category', filters.category);
    if (filters?.tier && filters.tier !== 'all')
      params.append('tier', filters.tier);
    if (filters?.status && filters.status !== 'all')
      params.append('status', filters.status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await request<any>(`/procurement/vendor-scorecards${qs}`);
    return Array.isArray(data) ? data : data?.data ?? [];
  },

  async createScorecard(
    payload: UpsertVendorScorecardPayload,
  ): Promise<VendorScorecard> {
    return request<VendorScorecard>('/procurement/vendor-scorecards', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateScorecard(
    id: string,
    payload: Partial<UpsertVendorScorecardPayload>,
  ): Promise<VendorScorecard> {
    return request<VendorScorecard>(`/procurement/vendor-scorecards/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteScorecard(id: string): Promise<void> {
    await request<void>(`/procurement/vendor-scorecards/${id}`, {
      method: 'DELETE',
    });
  },
};
