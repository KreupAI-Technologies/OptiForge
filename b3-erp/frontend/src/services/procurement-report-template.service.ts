// Procurement Report Templates service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth: procurement/controllers/procurement-report-template.controller.ts
//   @Controller('procurement/report-templates')

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

export interface ProcurementReportTemplate {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  reportType: string;
  config?: unknown;
  schedule?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UpsertReportTemplatePayload = Partial<
  Omit<ProcurementReportTemplate, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>
> & { name: string; reportType: string };

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

export const procurementReportTemplateService = {
  async getTemplates(reportType?: string): Promise<ProcurementReportTemplate[]> {
    const qs = reportType ? `?reportType=${encodeURIComponent(reportType)}` : '';
    const data = await request<any>(`/procurement/report-templates${qs}`);
    return Array.isArray(data) ? data : data?.data ?? [];
  },

  async createTemplate(
    payload: UpsertReportTemplatePayload,
  ): Promise<ProcurementReportTemplate> {
    return request<ProcurementReportTemplate>('/procurement/report-templates', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateTemplate(
    id: string,
    payload: Partial<UpsertReportTemplatePayload>,
  ): Promise<ProcurementReportTemplate> {
    return request<ProcurementReportTemplate>(
      `/procurement/report-templates/${id}`,
      { method: 'PATCH', body: JSON.stringify(payload) },
    );
  },

  async deleteTemplate(id: string): Promise<void> {
    await request<void>(`/procurement/report-templates/${id}`, {
      method: 'DELETE',
    });
  },
};
