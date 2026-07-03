import { apiClient } from './api/client';

// ==================== TypeScript Interfaces ====================

export interface PendingApprovalDTO {
  id: string;
  companyId: string;
  referenceNo?: string;
  title: string;
  description?: string;
  module?: string;
  moduleUrl?: string;
  requestedBy?: string;
  requestedAt?: string;
  amount?: number;
  priority?: string;
  dueDate?: string;
  slaStatus?: string;
  step?: string;
  totalSteps: number;
  currentStep: number;
  status: string;
  payload?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ==================== Mock Data (graceful fallback) ====================

const MOCK_APPROVALS: PendingApprovalDTO[] = [
  {
    id: '1',
    companyId: 'company-001',
    referenceNo: 'PO-2024-0892',
    title: 'Purchase Order - Raw Materials',
    description:
      'Steel plates and aluminum sheets from ABC Suppliers for production batch',
    module: 'Procurement',
    moduleUrl: '/procurement/purchase-orders/PO-2024-0892',
    requestedBy: 'John Smith',
    requestedAt: '2024-01-22 09:30',
    amount: 45000,
    priority: 'high',
    dueDate: '2024-01-23',
    slaStatus: 'warning',
    step: 'Manager Approval',
    totalSteps: 3,
    currentStep: 2,
    status: 'pending',
    createdAt: '2024-01-22T09:30:00Z',
    updatedAt: '2024-01-22T09:30:00Z',
  },
  {
    id: '2',
    companyId: 'company-001',
    referenceNo: 'QUO-2024-1234',
    title: 'Sales Quotation - Tech Industries',
    description: 'Annual contract renewal with special pricing terms',
    module: 'Sales',
    moduleUrl: '/crm/quotations/QUO-2024-1234',
    requestedBy: 'Sarah Johnson',
    requestedAt: '2024-01-22 08:15',
    amount: 125000,
    priority: 'critical',
    dueDate: '2024-01-22',
    slaStatus: 'overdue',
    step: 'Director Approval',
    totalSteps: 2,
    currentStep: 2,
    status: 'pending',
    createdAt: '2024-01-22T08:15:00Z',
    updatedAt: '2024-01-22T08:15:00Z',
  },
];

// ==================== Service Class ====================

class WorkflowPendingApprovalService {
  private baseUrl = '/workflow/pending-approvals';

  async findAll(
    companyId: string,
    filters?: { status?: string; priority?: string },
  ): Promise<PendingApprovalDTO[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      const qs = params.toString();
      const response = await apiClient.get<PendingApprovalDTO[]>(
        qs ? `${this.baseUrl}?${qs}` : this.baseUrl,
      );
      return response.data;
    } catch (error) {
      console.error(
        'API Error fetching pending approvals, using mock data:',
        error,
      );
      let result = MOCK_APPROVALS.filter((a) => a.companyId === companyId);
      if (filters?.status)
        result = result.filter((a) => a.status === filters.status);
      if (filters?.priority)
        result = result.filter((a) => a.priority === filters.priority);
      return result;
    }
  }

  async findOne(companyId: string, id: string): Promise<PendingApprovalDTO> {
    try {
      const response = await apiClient.get<PendingApprovalDTO>(
        `${this.baseUrl}/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error(
        'API Error fetching pending approval, using mock data:',
        error,
      );
      const item = MOCK_APPROVALS.find((a) => a.id === id);
      if (!item) throw new Error(`Pending approval with ID ${id} not found`);
      return item;
    }
  }

  async create(
    companyId: string,
    data: Partial<PendingApprovalDTO>,
  ): Promise<PendingApprovalDTO> {
    try {
      const response = await apiClient.post<PendingApprovalDTO>(
        this.baseUrl,
        data,
      );
      return response.data;
    } catch (error) {
      console.error('API Error creating pending approval:', error);
      const newItem: PendingApprovalDTO = {
        id: `PA-${Date.now()}`,
        companyId,
        title: data.title || 'New Approval',
        totalSteps: data.totalSteps ?? 1,
        currentStep: data.currentStep ?? 1,
        status: data.status || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      MOCK_APPROVALS.push(newItem);
      return newItem;
    }
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<PendingApprovalDTO>,
  ): Promise<PendingApprovalDTO> {
    try {
      const response = await apiClient.patch<PendingApprovalDTO>(
        `${this.baseUrl}/${id}`,
        data,
      );
      return response.data;
    } catch (error) {
      console.error('API Error updating pending approval:', error);
      const index = MOCK_APPROVALS.findIndex((a) => a.id === id);
      if (index === -1)
        throw new Error(`Pending approval with ID ${id} not found`);
      MOCK_APPROVALS[index] = {
        ...MOCK_APPROVALS[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return MOCK_APPROVALS[index];
    }
  }

  async delete(companyId: string, id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('API Error deleting pending approval:', error);
      const index = MOCK_APPROVALS.findIndex((a) => a.id === id);
      if (index !== -1) MOCK_APPROVALS.splice(index, 1);
    }
  }
}

export const workflowPendingApprovalService =
  new WorkflowPendingApprovalService();
