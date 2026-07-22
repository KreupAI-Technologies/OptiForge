// Procurement Risk Assessments service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth: procurement/controllers/procurement-risk-assessment.controller.ts
//   @Controller('procurement/risk-assessments')

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

export interface ProcurementRiskAssessment {
  id: string;
  companyId: string;
  supplierId?: string;
  category: string;
  riskLevel: string;
  likelihood: number;
  impact: number;
  mitigationPlan?: string;
  status: string;
  reviewDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UpsertRiskAssessmentPayload = Partial<
  Omit<ProcurementRiskAssessment, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>
> & { category: string };

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

export const procurementRiskAssessmentService = {
  async getAssessments(filters?: {
    category?: string;
    riskLevel?: string;
    status?: string;
    supplierId?: string;
  }): Promise<ProcurementRiskAssessment[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.riskLevel) params.append('riskLevel', filters.riskLevel);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.supplierId) params.append('supplierId', filters.supplierId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await request<any>(`/procurement/risk-assessments${qs}`);
    return Array.isArray(data) ? data : data?.data ?? [];
  },

  async createAssessment(
    payload: UpsertRiskAssessmentPayload,
  ): Promise<ProcurementRiskAssessment> {
    return request<ProcurementRiskAssessment>('/procurement/risk-assessments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateAssessment(
    id: string,
    payload: Partial<UpsertRiskAssessmentPayload>,
  ): Promise<ProcurementRiskAssessment> {
    return request<ProcurementRiskAssessment>(
      `/procurement/risk-assessments/${id}`,
      { method: 'PATCH', body: JSON.stringify(payload) },
    );
  },

  async deleteAssessment(id: string): Promise<void> {
    await request<void>(`/procurement/risk-assessments/${id}`, {
      method: 'DELETE',
    });
  },
};
