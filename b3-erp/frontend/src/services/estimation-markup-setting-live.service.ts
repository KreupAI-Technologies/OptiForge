// Estimation Markup Settings service (live, fetch-based).
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL and sends the
// required x-company-id header. Backend returns bare JSON arrays (no envelope).
// Endpoint source of truth: estimation/controllers/markup-setting.controller.ts
//   @Controller('estimation/markup-settings')

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

export interface MarkupSettingRecord {
  id: string;
  companyId: string;
  category: string;
  subcategory?: string;
  defaultMarkup?: number;
  minMarkup?: number;
  maxMarkup?: number;
  costBasis?: string;
  approvalRequired?: boolean;
  approvalThreshold?: number;
  updatedBy?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

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

export const estimationMarkupSettingLiveService = {
  async getSettings(filters?: {
    category?: string;
    status?: string;
  }): Promise<MarkupSettingRecord[]> {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'all')
      params.append('category', filters.category);
    if (filters?.status && filters.status !== 'all')
      params.append('status', filters.status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await request<any>(`/estimation/markup-settings${qs}`);
    return Array.isArray(data) ? data : data?.data ?? [];
  },
};
