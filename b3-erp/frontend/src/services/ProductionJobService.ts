// Production Jobs service (live, fetch-based).
// Hits the NestJS domain backend (b3-erp). Backs the shop-floor pages
// (laser/bending/fabrication/welding/buffing/shutter) so they fetch real job
// lists instead of hardcoded arrays.
// Endpoint source of truth: project-management/controllers/production-jobs.controller.ts
//   @Controller('api/production/jobs')  (global prefix api/v1)
// Response envelope: { success: boolean, data: T }

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'test';

export interface ProductionJob {
  id: string;
  companyId?: string;
  projectId: string;
  operationType: string;
  jobCode?: string;
  partName?: string;
  material?: string | null;
  thickness?: string | null;
  quantity?: number;
  status?: string;
  extra?: Record<string, any> | null;
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-company-id': COMPANY_ID,
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${path}`);
  }
  const json = await res.json().catch(() => null);
  // Unwrap the { success, data } envelope; tolerate bare payloads too.
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as T;
  }
  return json as T;
}

export const ProductionJobService = {
  async listJobs(
    projectId: string,
    operationType: string,
  ): Promise<ProductionJob[]> {
    const params = new URLSearchParams();
    if (projectId) params.set('projectId', projectId);
    if (operationType) params.set('operationType', operationType);
    const data = await request<ProductionJob[]>(
      `/api/production/jobs?${params.toString()}`,
    );
    return Array.isArray(data) ? data : [];
  },

  async create(data: Partial<ProductionJob>): Promise<ProductionJob> {
    return request<ProductionJob>(`/api/production/jobs`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStatus(
    id: string,
    data: Partial<ProductionJob>,
  ): Promise<ProductionJob> {
    return request<ProductionJob>(`/api/production/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

export default ProductionJobService;
