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

  async findAll(
    companyId: string,
    filters?: { status?: string; category?: string },
  ): Promise<AutomationRuleDTO[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    const qs = params.toString();
    const response = await apiClient.get<AutomationRuleDTO[]>(
      qs ? `${this.baseUrl}?${qs}` : this.baseUrl,
    );
    return response.data;
  }

  async findOne(companyId: string, id: string): Promise<AutomationRuleDTO> {
    const response = await apiClient.get<AutomationRuleDTO>(
      `${this.baseUrl}/${id}`,
    );
    return response.data;
  }

  async create(
    companyId: string,
    data: Partial<AutomationRuleDTO>,
  ): Promise<AutomationRuleDTO> {
    const response = await apiClient.post<AutomationRuleDTO>(this.baseUrl, data);
    return response.data;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<AutomationRuleDTO>,
  ): Promise<AutomationRuleDTO> {
    const response = await apiClient.patch<AutomationRuleDTO>(
      `${this.baseUrl}/${id}`,
      data,
    );
    return response.data;
  }

  async delete(companyId: string, id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Trigger a rule run now. The backend records the execution (bumps
   * executionCount + lastRun) and returns the updated rule plus a run summary.
   */
  async run(
    companyId: string,
    id: string,
  ): Promise<{
    rule: AutomationRuleDTO;
    run: { status: string; executedAt: string; executionCount: number };
  }> {
    const response = await apiClient.post<{
      rule: AutomationRuleDTO;
      run: { status: string; executedAt: string; executionCount: number };
    }>(`${this.baseUrl}/${id}/run`, {});
    return response.data;
  }
}

export const workflowAutomationService = new WorkflowAutomationService();
