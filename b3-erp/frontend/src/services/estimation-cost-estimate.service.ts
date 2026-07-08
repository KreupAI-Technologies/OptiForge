import { apiClient } from './api/client';

// ==================== TypeScript Interfaces ====================

export type CostEstimateStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Converted to Order';

export type CostEstimateType = 'Preliminary' | 'Detailed' | 'Final' | 'Revised';

export interface CostEstimate {
  id: string;
  companyId: string;
  estimateNumber: string;
  title: string;
  description?: string;
  boqId?: string;
  projectId?: string;
  customerId?: string;
  customerName?: string;
  estimateType: CostEstimateType;
  status: CostEstimateStatus;
  version: number;
  currency: string;
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  equipmentCost: number;
  subcontractorCost: number;
  directCost: number;
  indirectCost: number;
  contingency: number;
  contingencyPercentage: number;
  totalCost: number;
  estimateDate?: string;
  validUntil?: string;
  submittedBy?: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  approvalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CostEstimateItem {
  id: string;
  costEstimateId: string;
  itemNumber: string;
  description: string;
  category: string;
  costType: 'Material' | 'Labor' | 'Equipment' | 'Overhead' | 'Subcontractor';
  unit: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  notes?: string;
}

export interface CostBreakdown {
  materialCost: number;
  laborCost: number;
  equipmentCost: number;
  overheadCost: number;
  subcontractorCost: number;
  directCost: number;
  indirectCost: number;
  contingency: number;
  totalCost: number;
  breakdown: { category: string; amount: number; percentage: number }[];
}

// ==================== Service Class ====================

class CostEstimateService {
  private baseUrl = '/estimation/cost-estimates';

  async create(
    companyId: string,
    data: Partial<CostEstimate>,
    items?: Partial<CostEstimateItem>[]
  ): Promise<CostEstimate> {
    const response = await apiClient.post<CostEstimate>(this.baseUrl, {
      estimate: data,
      items,
    });
    return response.data;
  }

  async findAll(
    companyId: string,
    filters?: {
      status?: CostEstimateStatus;
      customerId?: string;
      fromDate?: string;
      toDate?: string;
    }
  ): Promise<CostEstimate[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.customerId) params.append('customerId', filters.customerId);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);

    const response = await apiClient.get<CostEstimate[]>(
      `${this.baseUrl}?${params.toString()}`
    );
    return response.data;
  }

  async findOne(companyId: string, id: string): Promise<CostEstimate> {
    const response = await apiClient.get<CostEstimate>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getCostBreakdown(companyId: string, id: string): Promise<CostBreakdown> {
    const response = await apiClient.get<CostBreakdown>(
      `${this.baseUrl}/${id}/cost-breakdown`
    );
    return response.data;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<CostEstimate>
  ): Promise<CostEstimate> {
    const response = await apiClient.patch<CostEstimate>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async submitForApproval(
    companyId: string,
    id: string,
    submittedBy: string
  ): Promise<CostEstimate> {
    const response = await apiClient.post<CostEstimate>(`${this.baseUrl}/${id}/submit`, {
      submittedBy,
    });
    return response.data;
  }

  async approve(
    companyId: string,
    id: string,
    approvedBy: string,
    notes?: string
  ): Promise<CostEstimate> {
    const response = await apiClient.post<CostEstimate>(`${this.baseUrl}/${id}/approve`, {
      approvedBy,
      notes,
    });
    return response.data;
  }

  async reject(
    companyId: string,
    id: string,
    rejectedBy: string,
    notes?: string
  ): Promise<CostEstimate> {
    const response = await apiClient.post<CostEstimate>(`${this.baseUrl}/${id}/reject`, {
      rejectedBy,
      notes,
    });
    return response.data;
  }

  async createVersion(
    companyId: string,
    id: string,
    createdBy: string
  ): Promise<CostEstimate> {
    const response = await apiClient.post<CostEstimate>(
      `${this.baseUrl}/${id}/create-version`,
      { createdBy }
    );
    return response.data;
  }

  async delete(companyId: string, id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  // Record that an estimate was sent to a customer (email/whatsapp). Persists a
  // delivery record on the backend; no real email provider is integrated.
  async sendToCustomer(
    companyId: string,
    estimateId: string,
    data: {
      channel: 'email' | 'whatsapp';
      recipient?: string;
      subject?: string;
      message?: string;
      includeTerms?: boolean;
      includePaymentSchedule?: boolean;
      validityDays?: number;
      sentBy?: string;
    }
  ): Promise<EstimateSendRecord> {
    const response = await apiClient.post<EstimateSendRecord>(
      `/estimation/workflow/send/${estimateId}`,
      data
    );
    return response.data;
  }
}

export interface EstimateSendRecord {
  id: string;
  companyId: string;
  estimateId: string;
  channel: string;
  recipient?: string;
  subject?: string;
  message?: string;
  includeTerms: boolean;
  includePaymentSchedule: boolean;
  validityDays?: number;
  status: string;
  sentAt?: string;
  sentBy?: string;
  createdAt: string;
}

export const costEstimateService = new CostEstimateService();
