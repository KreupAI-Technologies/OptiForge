import { apiClient } from './api/client';

// ==================== TypeScript Interfaces ====================

export type PricingStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Sent to Customer'
  | 'Accepted'
  | 'Declined';

export type PricingStrategy =
  | 'Cost Plus'
  | 'Value Based'
  | 'Competitive'
  | 'Market Based'
  | 'Penetration'
  | 'Premium';

export interface Pricing {
  id: string;
  companyId: string;
  pricingNumber: string;
  title: string;
  description?: string;
  costEstimateId: string;
  customerId?: string;
  customerName?: string;
  status: PricingStatus;
  pricingStrategy: PricingStrategy;
  currency: string;
  baseCost: number;
  markupPercentage: number;
  markupAmount: number;
  targetMarginPercentage: number;
  targetMarginAmount: number;
  actualMarginPercentage: number;
  actualMarginAmount: number;
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number;
  taxAmount: number;
  subtotal: number;
  totalPrice: number;
  quotationDate?: string;
  validUntil?: string;
  approvedBy?: string;
  approvedAt?: string;
  sentToCustomerAt?: string;
  customerResponseAt?: string;
  customerFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarkupRule {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isActive: boolean;
  applyTo: 'Material' | 'Labor' | 'Equipment' | 'Overhead' | 'Subcontractor' | 'All';
  markupPercentage: number;
  minAmount?: number;
  maxAmount?: number;
  priority: number;
  effectiveFrom?: string;
  effectiveUntil?: string;
  createdAt: string;
}

export interface MarginAnalysis {
  baseCost: number;
  markupAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalPrice: number;
  grossMargin: number;
  grossMarginPercentage: number;
  netMargin: number;
  netMarginPercentage: number;
  breakEvenPrice: number;
}

export interface CompetitivePricingAnalysis {
  pricing: Pricing;
  marketPosition: string;
  priceComparison: {
    competitor: string;
    price: number;
    difference: number;
    differencePercentage: number;
  }[];
  recommendation: string;
}

// ==================== Service Class ====================

class EstimationPricingService {
  private baseUrl = '/estimation/pricing';

  async create(companyId: string, data: Partial<Pricing>): Promise<Pricing> {
    const response = await apiClient.post<Pricing>(this.baseUrl, data);
    return response.data;
  }

  async findAll(
    companyId: string,
    filters?: {
      status?: PricingStatus;
      customerId?: string;
      fromDate?: string;
      toDate?: string;
    }
  ): Promise<Pricing[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.customerId) params.append('customerId', filters.customerId);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);

    const response = await apiClient.get<Pricing[]>(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  async findOne(companyId: string, id: string): Promise<Pricing> {
    const response = await apiClient.get<Pricing>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getMarginAnalysis(companyId: string, id: string): Promise<MarginAnalysis> {
    const response = await apiClient.get<MarginAnalysis>(
      `${this.baseUrl}/${id}/margin-analysis`
    );
    return response.data;
  }

  async getCompetitivePricingAnalysis(
    companyId: string,
    id: string
  ): Promise<CompetitivePricingAnalysis> {
    const response = await apiClient.get<CompetitivePricingAnalysis>(
      `${this.baseUrl}/${id}/competitive-analysis`
    );
    return response.data;
  }

  async update(companyId: string, id: string, data: Partial<Pricing>): Promise<Pricing> {
    const response = await apiClient.patch<Pricing>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async approve(
    companyId: string,
    id: string,
    approvedBy: string,
    notes?: string
  ): Promise<Pricing> {
    const response = await apiClient.post<Pricing>(`${this.baseUrl}/${id}/approve`, {
      approvedBy,
      notes,
    });
    return response.data;
  }

  async sendToCustomer(companyId: string, id: string): Promise<Pricing> {
    const response = await apiClient.post<Pricing>(`${this.baseUrl}/${id}/send-to-customer`, {});
    return response.data;
  }

  async recordCustomerResponse(
    companyId: string,
    id: string,
    accepted: boolean,
    feedback?: string
  ): Promise<Pricing> {
    const response = await apiClient.post<Pricing>(`${this.baseUrl}/${id}/customer-response`, {
      accepted,
      feedback,
    });
    return response.data;
  }

  async delete(companyId: string, id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  // Markup Rules
  async createMarkupRule(companyId: string, data: Partial<MarkupRule>): Promise<MarkupRule> {
    const response = await apiClient.post<MarkupRule>(`${this.baseUrl}/markup-rules`, data);
    return response.data;
  }

  async findAllMarkupRules(companyId: string): Promise<MarkupRule[]> {
    const response = await apiClient.get<MarkupRule[]>(`${this.baseUrl}/markup-rules/all`);
    return response.data;
  }

  async findActiveMarkupRules(companyId: string): Promise<MarkupRule[]> {
    const response = await apiClient.get<MarkupRule[]>(`${this.baseUrl}/markup-rules/active`);
    return response.data;
  }

  async updateMarkupRule(
    companyId: string,
    id: string,
    data: Partial<MarkupRule>
  ): Promise<MarkupRule> {
    const response = await apiClient.patch<MarkupRule>(
      `${this.baseUrl}/markup-rules/${id}`,
      data
    );
    return response.data;
  }

  async deleteMarkupRule(companyId: string, id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/markup-rules/${id}`);
  }
}

export const estimationPricingService = new EstimationPricingService();
