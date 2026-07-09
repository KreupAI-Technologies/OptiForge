import { apiClient } from './api/client';

// ==================== TypeScript Interfaces ====================

export interface AutomationRuleDTO {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  trigger?: string;
  triggerDetails?: string;
  action?: string;
  status: string;
  frequency?: string;
  lastRun?: string;
  nextRun?: string;
  executionCount: number;
  successRate: number;
  avgExecutionTime?: string;
  category?: string;
  priority?: string;
  createdByName?: string;
  conditions?: Record<string, unknown>[];
  actions?: Record<string, unknown>[];
  createdAt: string;
  updatedAt: string;
}

// ==================== Service Class ====================

class WorkflowAutomationService {
  private baseUrl = '/workflow/automation-rules';

  // The backend automation-rules controller reads the tenant from the
  // `x-company-id` header on every endpoint, so send it consistently.
  private companyHeader(companyId: string): Record<string, string> {
    return { 'x-company-id': companyId };
  }

  async findAll(
    companyId: string,
    filters?: { status?: string; category?: string },
  ): Promise<AutomationRuleDTO[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    const qs = params.toString();
    const response = await apiClient.request<AutomationRuleDTO[]>({
      url: qs ? `${this.baseUrl}?${qs}` : this.baseUrl,
      method: 'GET',
      headers: this.companyHeader(companyId),
    });
    return response.data;
  }

  async findOne(companyId: string, id: string): Promise<AutomationRuleDTO> {
    const response = await apiClient.request<AutomationRuleDTO>({
      url: `${this.baseUrl}/${id}`,
      method: 'GET',
      headers: this.companyHeader(companyId),
    });
    return response.data;
  }

  async create(
    companyId: string,
    data: Partial<AutomationRuleDTO>,
  ): Promise<AutomationRuleDTO> {
    const response = await apiClient.request<AutomationRuleDTO>({
      url: this.baseUrl,
      method: 'POST',
      data,
      headers: this.companyHeader(companyId),
    });
    return response.data;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<AutomationRuleDTO>,
  ): Promise<AutomationRuleDTO> {
    const response = await apiClient.request<AutomationRuleDTO>({
      url: `${this.baseUrl}/${id}`,
      method: 'PATCH',
      data,
      headers: this.companyHeader(companyId),
    });
    return response.data;
  }

  async delete(companyId: string, id: string): Promise<void> {
    await apiClient.request<void>({
      url: `${this.baseUrl}/${id}`,
      method: 'DELETE',
      headers: this.companyHeader(companyId),
    });
  }

  /**
   * Trigger a rule run now. The backend records the execution (bumps
   * executionCount + lastRun) and returns the updated rule plus a run summary.
   * Requires the `x-company-id` header for tenant resolution.
   */
  async run(
    companyId: string,
    id: string,
  ): Promise<{
    rule: AutomationRuleDTO;
    run: { status: string; executedAt: string; executionCount: number };
  }> {
    const response = await apiClient.request<{
      rule: AutomationRuleDTO;
      run: { status: string; executedAt: string; executionCount: number };
    }>({
      url: `${this.baseUrl}/${id}/run`,
      method: 'POST',
      data: {},
      headers: this.companyHeader(companyId),
    });
    return response.data;
  }
}

export const workflowAutomationService = new WorkflowAutomationService();
