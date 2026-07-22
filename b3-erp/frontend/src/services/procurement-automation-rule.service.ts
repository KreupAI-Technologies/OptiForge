// Procurement Automation Rules service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth: procurement/controllers/procurement-automation-rule.controller.ts
//   @Controller('procurement/automation-rules')

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

export interface ProcurementAutomationRule {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  trigger: string;
  conditions?: unknown;
  actions?: unknown;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type UpsertAutomationRulePayload = Partial<
  Omit<ProcurementAutomationRule, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>
> & { name: string; trigger: string };

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

export const procurementAutomationRuleService = {
  async getRules(filters?: {
    trigger?: string;
    isActive?: boolean;
  }): Promise<ProcurementAutomationRule[]> {
    const params = new URLSearchParams();
    if (filters?.trigger) params.append('trigger', filters.trigger);
    if (filters?.isActive !== undefined)
      params.append('isActive', String(filters.isActive));
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await request<any>(`/procurement/automation-rules${qs}`);
    return Array.isArray(data) ? data : data?.data ?? [];
  },

  async createRule(
    payload: UpsertAutomationRulePayload,
  ): Promise<ProcurementAutomationRule> {
    return request<ProcurementAutomationRule>('/procurement/automation-rules', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateRule(
    id: string,
    payload: Partial<UpsertAutomationRulePayload>,
  ): Promise<ProcurementAutomationRule> {
    return request<ProcurementAutomationRule>(
      `/procurement/automation-rules/${id}`,
      { method: 'PATCH', body: JSON.stringify(payload) },
    );
  },

  async toggleRule(id: string): Promise<ProcurementAutomationRule> {
    return request<ProcurementAutomationRule>(
      `/procurement/automation-rules/${id}/toggle`,
      { method: 'POST' },
    );
  },

  async deleteRule(id: string): Promise<void> {
    await request<void>(`/procurement/automation-rules/${id}`, {
      method: 'DELETE',
    });
  },
};
