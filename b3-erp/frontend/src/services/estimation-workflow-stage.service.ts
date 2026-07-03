import { apiClient } from './api/client';

// ==================== TypeScript Interfaces ====================

export type WorkflowStageStatus = 'active' | 'inactive';

export interface WorkflowStage {
  id: string;
  companyId: string;
  stageCode: string;
  stageName: string;
  stageOrder: number;
  description?: string;
  approverRole?: string;
  approvalRequired: boolean;
  autoAdvance: boolean;
  notifyOnEntry: boolean;
  notifyOnApproval: boolean;
  maxDaysInStage: number;
  escalationEnabled: boolean;
  escalationDays: number;
  escalateTo?: string;
  allowReject: boolean;
  allowRevision: boolean;
  status: WorkflowStageStatus;
  createdAt: string;
  updatedAt: string;
}

// ==================== Mock Data ====================

const MOCK_WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 'WF-001',
    companyId: 'company-001',
    stageCode: 'DRAFT',
    stageName: 'Draft',
    stageOrder: 1,
    description: 'Initial draft stage where estimate is being prepared',
    approverRole: 'None',
    approvalRequired: false,
    autoAdvance: false,
    notifyOnEntry: false,
    notifyOnApproval: false,
    maxDaysInStage: 7,
    escalationEnabled: true,
    escalationDays: 5,
    escalateTo: 'Sales Manager',
    allowReject: false,
    allowRevision: true,
    status: 'active',
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-10-01T00:00:00Z',
  },
  {
    id: 'WF-002',
    companyId: 'company-001',
    stageCode: 'REVIEW',
    stageName: 'Technical Review',
    stageOrder: 2,
    description: 'Technical review by estimation manager',
    approverRole: 'Estimation Manager',
    approvalRequired: true,
    autoAdvance: false,
    notifyOnEntry: true,
    notifyOnApproval: true,
    maxDaysInStage: 2,
    escalationEnabled: true,
    escalationDays: 2,
    escalateTo: 'Senior Manager',
    allowReject: true,
    allowRevision: true,
    status: 'active',
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-10-01T00:00:00Z',
  },
];

// ==================== Service Class ====================

class EstimationWorkflowStageService {
  private baseUrl = '/estimation/workflow-stages';

  async create(
    companyId: string,
    data: Partial<WorkflowStage>
  ): Promise<WorkflowStage> {
    try {
      const response = await apiClient.post<WorkflowStage>(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.error('API Error creating workflow stage, using mock data:', error);
      const newStage: WorkflowStage = {
        id: `WF-${Date.now()}`,
        companyId,
        stageCode: data.stageCode || 'NEW',
        stageName: data.stageName || 'New Stage',
        stageOrder: data.stageOrder || 0,
        approvalRequired: data.approvalRequired ?? false,
        autoAdvance: data.autoAdvance ?? false,
        notifyOnEntry: data.notifyOnEntry ?? false,
        notifyOnApproval: data.notifyOnApproval ?? false,
        maxDaysInStage: data.maxDaysInStage || 0,
        escalationEnabled: data.escalationEnabled ?? false,
        escalationDays: data.escalationDays || 0,
        allowReject: data.allowReject ?? false,
        allowRevision: data.allowRevision ?? false,
        status: data.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      MOCK_WORKFLOW_STAGES.push(newStage);
      return newStage;
    }
  }

  async findAll(
    companyId: string,
    filters?: { status?: WorkflowStageStatus }
  ): Promise<WorkflowStage[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      const query = params.toString();
      const response = await apiClient.get<WorkflowStage[]>(
        query ? `${this.baseUrl}?${query}` : this.baseUrl
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching workflow stages, using mock data:', error);
      let result = MOCK_WORKFLOW_STAGES.filter((s) => s.companyId === companyId);
      if (filters?.status) {
        result = result.filter((s) => s.status === filters.status);
      }
      return result.sort((a, b) => a.stageOrder - b.stageOrder);
    }
  }

  async findOne(companyId: string, id: string): Promise<WorkflowStage> {
    try {
      const response = await apiClient.get<WorkflowStage>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching workflow stage, using mock data:', error);
      const stage = MOCK_WORKFLOW_STAGES.find((s) => s.id === id);
      if (!stage) throw new Error(`Workflow Stage with ID ${id} not found`);
      return stage;
    }
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<WorkflowStage>
  ): Promise<WorkflowStage> {
    try {
      const response = await apiClient.patch<WorkflowStage>(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('API Error updating workflow stage, using mock data:', error);
      const index = MOCK_WORKFLOW_STAGES.findIndex((s) => s.id === id);
      if (index === -1) throw new Error(`Workflow Stage with ID ${id} not found`);
      MOCK_WORKFLOW_STAGES[index] = {
        ...MOCK_WORKFLOW_STAGES[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return MOCK_WORKFLOW_STAGES[index];
    }
  }

  async delete(companyId: string, id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('API Error deleting workflow stage, using mock data:', error);
      const index = MOCK_WORKFLOW_STAGES.findIndex((s) => s.id === id);
      if (index !== -1) {
        MOCK_WORKFLOW_STAGES.splice(index, 1);
      }
    }
  }
}

export const estimationWorkflowStageService = new EstimationWorkflowStageService();
