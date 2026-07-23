// Procurement Quality Assurance service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth: procurement/controllers/procurement-quality.controller.ts
//   @Controller('procurement/quality')

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

export interface ProcurementInspection {
  id: string;
  companyId: string;
  poNumber?: string;
  supplierId?: string;
  supplier?: string;
  items?: string;
  quantity: number;
  priority: string;
  dueDate?: string;
  status: string;
  inspector?: string | null;
  riskLevel: string;
  templateId?: string;
  result?: string | null;
  defectsFound?: number | null;
  resultNotes?: string | null;
  rejectionReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProcurementInspectionTemplate {
  id: string;
  companyId: string;
  name: string;
  category?: string;
  checkpoints: number;
  usage: number;
  lastUsed?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProcurementNcr {
  id: string;
  companyId: string;
  ncrNumber?: string;
  inspectionId?: string;
  supplierId?: string;
  supplier?: string;
  title?: string;
  description?: string;
  severity: string;
  status: string;
  rootCause?: string;
  correctiveAction?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateInspectionPayload = Partial<
  Omit<ProcurementInspection, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>
>;
export type RecordResultsPayload = {
  result?: string;
  defectsFound?: number;
  resultNotes?: string;
  inspector?: string;
  status?: string;
};
export type RejectInspectionPayload = { rejectionReason?: string };
export type CreateTemplatePayload = Partial<
  Omit<ProcurementInspectionTemplate, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>
> & { name: string };
export type CreateNcrPayload = Partial<
  Omit<ProcurementNcr, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>
>;

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

function asArray<T>(d: any): T[] {
  return Array.isArray(d) ? d : (d?.data ?? []);
}

export const procurementQualityService = {
  // ---- inspections ----
  async getInspections(status?: string): Promise<ProcurementInspection[]> {
    const qs = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    return asArray(await request(`/procurement/quality/inspections${qs}`));
  },
  async createInspection(
    payload: CreateInspectionPayload,
  ): Promise<ProcurementInspection> {
    return request('/procurement/quality/inspections', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async recordResults(
    id: string,
    payload: RecordResultsPayload,
  ): Promise<ProcurementInspection> {
    return request(`/procurement/quality/inspections/${id}/results`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  async rejectInspection(
    id: string,
    payload: RejectInspectionPayload,
  ): Promise<ProcurementInspection> {
    return request(`/procurement/quality/inspections/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // ---- templates ----
  async getTemplates(category?: string): Promise<ProcurementInspectionTemplate[]> {
    const qs = category ? `?category=${encodeURIComponent(category)}` : '';
    return asArray(await request(`/procurement/quality/templates${qs}`));
  },
  async createTemplate(
    payload: CreateTemplatePayload,
  ): Promise<ProcurementInspectionTemplate> {
    return request('/procurement/quality/templates', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async updateTemplate(
    id: string,
    payload: Partial<CreateTemplatePayload>,
  ): Promise<ProcurementInspectionTemplate> {
    return request(`/procurement/quality/templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  async useTemplate(id: string): Promise<ProcurementInspectionTemplate> {
    return request(`/procurement/quality/templates/${id}/use`, {
      method: 'POST',
    });
  },

  // ---- NCRs ----
  async getNcrs(status?: string): Promise<ProcurementNcr[]> {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return asArray(await request(`/procurement/quality/ncrs${qs}`));
  },
  async createNcr(payload: CreateNcrPayload): Promise<ProcurementNcr> {
    return request('/procurement/quality/ncrs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
