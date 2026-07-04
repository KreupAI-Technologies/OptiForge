// Estimation Pricing service (live, fetch-based).
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL and sends the
// required x-company-id header. Backend returns bare JSON arrays (no envelope).
// Endpoint source of truth: estimation/controllers/pricing.controller.ts
//   @Controller('estimation/pricing')

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

export interface PricingRecord {
  id: string;
  companyId: string;
  pricingNumber: string;
  title: string;
  description?: string;
  costEstimateId?: string;
  customerId?: string;
  customerName?: string;
  status?: string;
  pricingStrategy?: string;
  currency?: string;
  baseCost?: number;
  markupPercentage?: number;
  markupAmount?: number;
  targetMarginPercentage?: number;
  targetMarginAmount?: number;
  actualMarginPercentage?: number;
  actualMarginAmount?: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxPercentage?: number;
  taxAmount?: number;
  subtotal?: number;
  totalPrice?: number;
  category?: string;
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

export const estimationPricingLiveService = {
  async getPricing(filters?: {
    status?: string;
    customerId?: string;
  }): Promise<PricingRecord[]> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all')
      params.append('status', filters.status);
    if (filters?.customerId) params.append('customerId', filters.customerId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await request<any>(`/estimation/pricing${qs}`);
    return Array.isArray(data) ? data : data?.data ?? [];
  },
};
