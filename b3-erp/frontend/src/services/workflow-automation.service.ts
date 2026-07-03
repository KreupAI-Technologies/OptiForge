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

// ==================== Mock Data (graceful fallback) ====================

const MOCK_RULES: AutomationRuleDTO[] = [
  {
    id: 'AUTO001',
    companyId: 'company-001',
    name: 'Auto Purchase Requisition',
    description:
      'Automatically create purchase requisitions when inventory falls below minimum stock level',
    trigger: 'condition',
    triggerDetails: 'Stock Level < Minimum Stock',
    action: 'Create Purchase Requisition',
    status: 'active',
    frequency: 'Real-time',
    lastRun: '2025-10-17 09:30',
    nextRun: 'Real-time',
    executionCount: 1247,
    successRate: 98.5,
    avgExecutionTime: '1.2s',
    category: 'procurement',
    priority: 'high',
    createdByName: 'System Admin',
    createdAt: '2025-08-15',
    updatedAt: '2025-08-15',
  },
  {
    id: 'AUTO002',
    companyId: 'company-001',
    name: 'Daily Production Report',
    description:
      'Generate and email daily production summary reports to management',
    trigger: 'schedule',
    triggerDetails: 'Daily at 6:00 PM',
    action: 'Generate Report & Send Email',
    status: 'active',
    frequency: 'Daily',
    lastRun: '2025-10-16 18:00',
    nextRun: '2025-10-17 18:00',
    executionCount: 89,
    successRate: 100,
    avgExecutionTime: '4.5s',
    category: 'production',
    priority: 'medium',
    createdByName: 'Production Manager',
    createdAt: '2025-09-01',
    updatedAt: '2025-09-01',
  },
];

// ==================== Service Class ====================

class WorkflowAutomationService {
  private baseUrl = '/workflow/automation-rules';

  async findAll(
    companyId: string,
    filters?: { status?: string; category?: string },
  ): Promise<AutomationRuleDTO[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.category) params.append('category', filters.category);
      const qs = params.toString();
      const response = await apiClient.get<AutomationRuleDTO[]>(
        qs ? `${this.baseUrl}?${qs}` : this.baseUrl,
      );
      return response.data;
    } catch (error) {
      console.error(
        'API Error fetching automation rules, using mock data:',
        error,
      );
      let result = MOCK_RULES.filter((r) => r.companyId === companyId);
      if (filters?.status)
        result = result.filter((r) => r.status === filters.status);
      if (filters?.category)
        result = result.filter((r) => r.category === filters.category);
      return result;
    }
  }

  async findOne(companyId: string, id: string): Promise<AutomationRuleDTO> {
    try {
      const response = await apiClient.get<AutomationRuleDTO>(
        `${this.baseUrl}/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error(
        'API Error fetching automation rule, using mock data:',
        error,
      );
      const rule = MOCK_RULES.find((r) => r.id === id);
      if (!rule) throw new Error(`Automation rule with ID ${id} not found`);
      return rule;
    }
  }

  async create(
    companyId: string,
    data: Partial<AutomationRuleDTO>,
  ): Promise<AutomationRuleDTO> {
    try {
      const response = await apiClient.post<AutomationRuleDTO>(
        this.baseUrl,
        data,
      );
      return response.data;
    } catch (error) {
      console.error('API Error creating automation rule:', error);
      const newRule: AutomationRuleDTO = {
        id: `AUTO-${Date.now()}`,
        companyId,
        name: data.name || 'New Automation',
        status: data.status || 'active',
        executionCount: 0,
        successRate: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      MOCK_RULES.push(newRule);
      return newRule;
    }
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<AutomationRuleDTO>,
  ): Promise<AutomationRuleDTO> {
    try {
      const response = await apiClient.patch<AutomationRuleDTO>(
        `${this.baseUrl}/${id}`,
        data,
      );
      return response.data;
    } catch (error) {
      console.error('API Error updating automation rule:', error);
      const index = MOCK_RULES.findIndex((r) => r.id === id);
      if (index === -1)
        throw new Error(`Automation rule with ID ${id} not found`);
      MOCK_RULES[index] = {
        ...MOCK_RULES[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return MOCK_RULES[index];
    }
  }

  async delete(companyId: string, id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('API Error deleting automation rule:', error);
      const index = MOCK_RULES.findIndex((r) => r.id === id);
      if (index !== -1) MOCK_RULES.splice(index, 1);
    }
  }
}

export const workflowAutomationService = new WorkflowAutomationService();
