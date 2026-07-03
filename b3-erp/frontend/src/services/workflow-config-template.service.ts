import { apiClient } from './api/client';

// ==================== TypeScript Interfaces ====================

export interface WorkflowConfigTemplateDTO {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  category?: string;
  triggerType?: string;
  steps: number;
  activeInstances: number;
  status: string;
  stepDetails?: Record<string, unknown>[];
  createdAt: string;
  updatedAt: string;
}

// ==================== Mock Data (graceful fallback) ====================

const MOCK_TEMPLATES: WorkflowConfigTemplateDTO[] = [
  {
    id: '1',
    companyId: 'company-001',
    name: 'Purchase Requisition Approval',
    description: 'Multi-level approval workflow for purchase requisitions',
    category: 'Procurement',
    triggerType: 'Manual',
    steps: 4,
    activeInstances: 23,
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    companyId: 'company-001',
    name: 'Sales Order Processing',
    description: 'Automated order confirmation and fulfillment workflow',
    category: 'Sales',
    triggerType: 'Automatic',
    steps: 6,
    activeInstances: 45,
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    companyId: 'company-001',
    name: 'Employee Onboarding',
    description: 'Complete onboarding process for new hires',
    category: 'HR',
    triggerType: 'Manual',
    steps: 8,
    activeInstances: 5,
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

// ==================== Service Class ====================

class WorkflowConfigTemplateService {
  private baseUrl = '/workflow/config-templates';

  async findAll(
    companyId: string,
    filters?: { status?: string; category?: string },
  ): Promise<WorkflowConfigTemplateDTO[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.category) params.append('category', filters.category);
      const qs = params.toString();
      const response = await apiClient.get<WorkflowConfigTemplateDTO[]>(
        qs ? `${this.baseUrl}?${qs}` : this.baseUrl,
      );
      return response.data;
    } catch (error) {
      console.error(
        'API Error fetching workflow config templates, using mock data:',
        error,
      );
      let result = MOCK_TEMPLATES.filter((t) => t.companyId === companyId);
      if (filters?.status)
        result = result.filter((t) => t.status === filters.status);
      if (filters?.category)
        result = result.filter((t) => t.category === filters.category);
      return result;
    }
  }

  async findOne(
    companyId: string,
    id: string,
  ): Promise<WorkflowConfigTemplateDTO> {
    try {
      const response = await apiClient.get<WorkflowConfigTemplateDTO>(
        `${this.baseUrl}/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error(
        'API Error fetching workflow config template, using mock data:',
        error,
      );
      const template = MOCK_TEMPLATES.find((t) => t.id === id);
      if (!template)
        throw new Error(`Workflow config template with ID ${id} not found`);
      return template;
    }
  }

  async create(
    companyId: string,
    data: Partial<WorkflowConfigTemplateDTO>,
  ): Promise<WorkflowConfigTemplateDTO> {
    try {
      const response = await apiClient.post<WorkflowConfigTemplateDTO>(
        this.baseUrl,
        data,
      );
      return response.data;
    } catch (error) {
      console.error('API Error creating workflow config template:', error);
      const newTemplate: WorkflowConfigTemplateDTO = {
        id: `WCT-${Date.now()}`,
        companyId,
        name: data.name || 'New Template',
        steps: data.steps ?? 0,
        activeInstances: data.activeInstances ?? 0,
        status: data.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      MOCK_TEMPLATES.push(newTemplate);
      return newTemplate;
    }
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<WorkflowConfigTemplateDTO>,
  ): Promise<WorkflowConfigTemplateDTO> {
    try {
      const response = await apiClient.patch<WorkflowConfigTemplateDTO>(
        `${this.baseUrl}/${id}`,
        data,
      );
      return response.data;
    } catch (error) {
      console.error('API Error updating workflow config template:', error);
      const index = MOCK_TEMPLATES.findIndex((t) => t.id === id);
      if (index === -1)
        throw new Error(`Workflow config template with ID ${id} not found`);
      MOCK_TEMPLATES[index] = {
        ...MOCK_TEMPLATES[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return MOCK_TEMPLATES[index];
    }
  }

  async delete(companyId: string, id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('API Error deleting workflow config template:', error);
      const index = MOCK_TEMPLATES.findIndex((t) => t.id === id);
      if (index !== -1) MOCK_TEMPLATES.splice(index, 1);
    }
  }
}

export const workflowConfigTemplateService =
  new WorkflowConfigTemplateService();
