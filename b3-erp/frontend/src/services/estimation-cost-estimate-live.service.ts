// Estimation Cost Estimates service (live, fetch-based).
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL and sends the
// required x-company-id header. Backend returns bare JSON arrays (no envelope).
// Endpoint source of truth: estimation/controllers/cost-estimate.controller.ts
//   @Controller('estimation/cost-estimates')

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

export interface CostEstimateRecord {
  id: string;
  companyId: string;
  estimateNumber: string;
  title: string;
  description?: string;
  boqId?: string;
  projectId?: string;
  customerId?: string;
  customerName?: string;
  estimateType?: string;
  status: string;
  version?: number;
  currency?: string;
  materialCost?: number;
  laborCost?: number;
  overheadCost?: number;
  equipmentCost?: number;
  subcontractorCost?: number;
  directCost?: number;
  indirectCost?: number;
  contingency?: number;
  contingencyPercentage?: number;
  totalCost?: number;
  estimateDate?: string;
  validUntil?: string;
  submittedBy?: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  approvalNotes?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  // itemCount / items may or may not be present depending on serializer
  itemCount?: number;
  items?: unknown[];
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

export const estimationCostEstimateLiveService = {
  async getEstimates(filters?: {
    status?: string;
    customerId?: string;
  }): Promise<CostEstimateRecord[]> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all')
      params.append('status', filters.status);
    if (filters?.customerId) params.append('customerId', filters.customerId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await request<any>(`/estimation/cost-estimates${qs}`);
    return Array.isArray(data) ? data : data?.data ?? [];
  },
};
