import { apiClient } from '../api/client';

// ==================== Pricing Version Control ====================

export interface CPQPricingVersion {
  id: string;
  companyId: string;
  version: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'scheduled' | 'archived' | 'superseded';
  changeType:
    | 'price_increase'
    | 'price_decrease'
    | 'new_product'
    | 'discontinued'
    | 'restructure';
  changes?: {
    productId: string;
    productName: string;
    oldPrice: number;
    newPrice: number;
    changePercent: number;
    reason?: string;
  }[];
  totalItems: number;
  avgPriceChange: number;
  notes?: string;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  activatedAt?: string;
  scheduledFor?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Approval Matrix ====================

export interface CPQApprovalMatrixRule {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  condition?: {
    type: string;
    operator: string;
    value: number | [number, number];
  };
  requiredApprovers?: { role: string; count: number }[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  autoEscalateAfterHours?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== Service Class ====================

class CPQAdvancedService {
  private pricingVersionsUrl = '/cpq/advanced/pricing-versions';
  private approvalMatrixUrl = '/cpq/advanced/approval-matrix';

  async findAllPricingVersions(): Promise<CPQPricingVersion[]> {
    const response = await apiClient.get<CPQPricingVersion[]>(this.pricingVersionsUrl);
    return Array.isArray(response.data) ? response.data : [];
  }

  async createPricingVersion(
    data: Partial<CPQPricingVersion>,
  ): Promise<CPQPricingVersion> {
    const response = await apiClient.post<CPQPricingVersion>(
      this.pricingVersionsUrl,
      data,
    );
    return response.data;
  }

  async findAllApprovalRules(): Promise<CPQApprovalMatrixRule[]> {
    const response = await apiClient.get<CPQApprovalMatrixRule[]>(this.approvalMatrixUrl);
    return Array.isArray(response.data) ? response.data : [];
  }

  async createApprovalRule(
    data: Partial<CPQApprovalMatrixRule>,
  ): Promise<CPQApprovalMatrixRule> {
    const response = await apiClient.post<CPQApprovalMatrixRule>(
      this.approvalMatrixUrl,
      data,
    );
    return response.data;
  }
}

export const cpqAdvancedService = new CPQAdvancedService();
