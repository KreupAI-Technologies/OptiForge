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

// ==================== Mock Data ====================

const MOCK_PRICING: Pricing[] = [
  {
    id: 'prc-001',
    companyId: 'company-001',
    pricingNumber: 'PRC-2025-00001',
    title: 'Office Building Pricing',
    costEstimateId: 'est-001',
    customerId: 'cust-001',
    customerName: 'ABC Corporation',
    status: 'Accepted',
    pricingStrategy: 'Cost Plus',
    currency: 'USD',
    baseCost: 2483250,
    markupPercentage: 15,
    markupAmount: 372487.5,
    targetMarginPercentage: 15,
    targetMarginAmount: 372487.5,
    actualMarginPercentage: 13,
    actualMarginAmount: 322822.5,
    discountPercentage: 2,
    discountAmount: 57114.75,
    taxPercentage: 8,
    taxAmount: 224049.82,
    subtotal: 2798622.75,
    totalPrice: 3022672.57,
    quotationDate: '2025-01-22',
    validUntil: '2025-03-22',
    approvedBy: 'user-003',
    approvedAt: '2025-01-25T10:00:00Z',
    sentToCustomerAt: '2025-01-26T09:00:00Z',
    customerResponseAt: '2025-01-30T15:00:00Z',
    createdAt: '2025-01-21T08:00:00Z',
    updatedAt: '2025-01-30T15:00:00Z',
  },
  {
    id: 'prc-002',
    companyId: 'company-001',
    pricingNumber: 'PRC-2025-00002',
    title: 'Warehouse Renovation Pricing',
    costEstimateId: 'est-002',
    customerId: 'cust-002',
    customerName: 'XYZ Logistics',
    status: 'Sent to Customer',
    pricingStrategy: 'Competitive',
    currency: 'USD',
    baseCost: 856000,
    markupPercentage: 12,
    markupAmount: 102720,
    targetMarginPercentage: 12,
    targetMarginAmount: 102720,
    actualMarginPercentage: 12,
    actualMarginAmount: 102720,
    discountPercentage: 0,
    discountAmount: 0,
    taxPercentage: 8,
    taxAmount: 76697.6,
    subtotal: 958720,
    totalPrice: 1035417.6,
    quotationDate: '2025-02-01',
    validUntil: '2025-04-01',
    approvedBy: 'user-003',
    approvedAt: '2025-02-03T11:00:00Z',
    sentToCustomerAt: '2025-02-04T09:00:00Z',
    createdAt: '2025-01-31T10:00:00Z',
    updatedAt: '2025-02-04T09:00:00Z',
  },
];

const MOCK_MARKUP_RULES: MarkupRule[] = [
  {
    id: 'rule-001',
    companyId: 'company-001',
    name: 'Standard Material Markup',
    description: 'Default markup for material costs',
    isActive: true,
    applyTo: 'Material',
    markupPercentage: 15,
    priority: 1,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'rule-002',
    companyId: 'company-001',
    name: 'Standard Labor Markup',
    description: 'Default markup for labor costs',
    isActive: true,
    applyTo: 'Labor',
    markupPercentage: 25,
    priority: 2,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'rule-003',
    companyId: 'company-001',
    name: 'Equipment Markup',
    description: 'Markup for equipment rental/usage',
    isActive: true,
    applyTo: 'Equipment',
    markupPercentage: 10,
    priority: 3,
    createdAt: '2025-01-01T00:00:00Z',
  },
];

// ==================== Service Class ====================

class EstimationPricingService {
  private baseUrl = '/estimation/pricing';

  async create(companyId: string, data: Partial<Pricing>): Promise<Pricing> {
    try {
      const response = await apiClient.post<Pricing>(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.error('API Error creating pricing, using mock data:', error);
      const newPricing: Pricing = {
        id: `prc-${Date.now()}`,
        companyId,
        pricingNumber: `PRC-2025-${String(MOCK_PRICING.length + 1).padStart(5, '0')}`,
        title: data.title || 'New Pricing',
        costEstimateId: data.costEstimateId || '',
        status: 'Draft',
        pricingStrategy: data.pricingStrategy || 'Cost Plus',
        currency: data.currency || 'USD',
        baseCost: data.baseCost || 0,
        markupPercentage: data.markupPercentage || 0,
        markupAmount: 0,
        targetMarginPercentage: data.targetMarginPercentage || 0,
        targetMarginAmount: 0,
        actualMarginPercentage: 0,
        actualMarginAmount: 0,
        discountPercentage: 0,
        discountAmount: 0,
        taxPercentage: data.taxPercentage || 8,
        taxAmount: 0,
        subtotal: 0,
        totalPrice: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      MOCK_PRICING.push(newPricing);
      return newPricing;
    }
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
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.customerId) params.append('customerId', filters.customerId);
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);

      const response = await apiClient.get<Pricing[]>(`${this.baseUrl}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching pricing, using mock data:', error);
      let result = MOCK_PRICING.filter((p) => p.companyId === companyId);
      if (filters?.status) {
        result = result.filter((p) => p.status === filters.status);
      }
      if (filters?.customerId) {
        result = result.filter((p) => p.customerId === filters.customerId);
      }
      return result;
    }
  }

  async findOne(companyId: string, id: string): Promise<Pricing> {
    try {
      const response = await apiClient.get<Pricing>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching pricing, using mock data:', error);
      const pricing = MOCK_PRICING.find((p) => p.id === id);
      if (!pricing) throw new Error(`Pricing with ID ${id} not found`);
      return pricing;
    }
  }

  async getMarginAnalysis(companyId: string, id: string): Promise<MarginAnalysis> {
    try {
      const response = await apiClient.get<MarginAnalysis>(
        `${this.baseUrl}/${id}/margin-analysis`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching margin analysis, using mock data:', error);
      const pricing = MOCK_PRICING.find((p) => p.id === id);
      if (!pricing) throw new Error(`Pricing with ID ${id} not found`);

      return {
        baseCost: pricing.baseCost,
        markupAmount: pricing.markupAmount,
        discountAmount: pricing.discountAmount,
        taxAmount: pricing.taxAmount,
        totalPrice: pricing.totalPrice,
        grossMargin: pricing.markupAmount - pricing.discountAmount,
        grossMarginPercentage:
          pricing.baseCost > 0
            ? ((pricing.markupAmount - pricing.discountAmount) / pricing.baseCost) * 100
            : 0,
        netMargin: pricing.totalPrice - pricing.baseCost - pricing.taxAmount,
        netMarginPercentage:
          pricing.baseCost > 0
            ? ((pricing.totalPrice - pricing.baseCost - pricing.taxAmount) / pricing.baseCost) *
              100
            : 0,
        breakEvenPrice: pricing.baseCost,
      };
    }
  }

  async getCompetitivePricingAnalysis(
    companyId: string,
    id: string
  ): Promise<CompetitivePricingAnalysis> {
    try {
      const response = await apiClient.get<CompetitivePricingAnalysis>(
        `${this.baseUrl}/${id}/competitive-analysis`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching competitive analysis, using mock data:', error);
      const pricing = MOCK_PRICING.find((p) => p.id === id);
      if (!pricing) throw new Error(`Pricing with ID ${id} not found`);

      return {
        pricing,
        marketPosition: 'On Par',
        priceComparison: [
          {
            competitor: 'Competitor A',
            price: pricing.totalPrice * 1.05,
            difference: pricing.totalPrice * -0.05,
            differencePercentage: -5,
          },
          {
            competitor: 'Competitor B',
            price: pricing.totalPrice * 0.95,
            difference: pricing.totalPrice * 0.05,
            differencePercentage: 5,
          },
        ],
        recommendation: 'Current pricing is competitive.',
      };
    }
  }

  async update(companyId: string, id: string, data: Partial<Pricing>): Promise<Pricing> {
    try {
      const response = await apiClient.patch<Pricing>(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('API Error updating pricing, using mock data:', error);
      const index = MOCK_PRICING.findIndex((p) => p.id === id);
      if (index === -1) throw new Error(`Pricing with ID ${id} not found`);
      MOCK_PRICING[index] = {
        ...MOCK_PRICING[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return MOCK_PRICING[index];
    }
  }

  async approve(
    companyId: string,
    id: string,
    approvedBy: string,
    notes?: string
  ): Promise<Pricing> {
    try {
      const response = await apiClient.post<Pricing>(`${this.baseUrl}/${id}/approve`, {
        approvedBy,
        notes,
      });
      return response.data;
    } catch (error) {
      console.error('API Error approving pricing:', error);
      return this.update(companyId, id, {
        status: 'Approved',
        approvedBy,
        approvedAt: new Date().toISOString(),
      });
    }
  }

  async sendToCustomer(companyId: string, id: string): Promise<Pricing> {
    try {
      const response = await apiClient.post<Pricing>(`${this.baseUrl}/${id}/send-to-customer`, {});
      return response.data;
    } catch (error) {
      console.error('API Error sending pricing to customer:', error);
      return this.update(companyId, id, {
        status: 'Sent to Customer',
        sentToCustomerAt: new Date().toISOString(),
      });
    }
  }

  async recordCustomerResponse(
    companyId: string,
    id: string,
    accepted: boolean,
    feedback?: string
  ): Promise<Pricing> {
    try {
      const response = await apiClient.post<Pricing>(`${this.baseUrl}/${id}/customer-response`, {
        accepted,
        feedback,
      });
      return response.data;
    } catch (error) {
      console.error('API Error recording customer response:', error);
      return this.update(companyId, id, {
        status: accepted ? 'Accepted' : 'Declined',
        customerResponseAt: new Date().toISOString(),
        customerFeedback: feedback,
      });
    }
  }

  async delete(companyId: string, id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('API Error deleting pricing, using mock data:', error);
      const index = MOCK_PRICING.findIndex((p) => p.id === id);
      if (index !== -1) {
        MOCK_PRICING.splice(index, 1);
      }
    }
  }

  // Markup Rules
  async createMarkupRule(companyId: string, data: Partial<MarkupRule>): Promise<MarkupRule> {
    try {
      const response = await apiClient.post<MarkupRule>(`${this.baseUrl}/markup-rules`, data);
      return response.data;
    } catch (error) {
      console.error('API Error creating markup rule, using mock data:', error);
      const newRule: MarkupRule = {
        id: `rule-${Date.now()}`,
        companyId,
        name: data.name || 'New Rule',
        isActive: data.isActive ?? true,
        applyTo: data.applyTo || 'All',
        markupPercentage: data.markupPercentage || 0,
        priority: data.priority || 0,
        createdAt: new Date().toISOString(),
        ...data,
      };
      MOCK_MARKUP_RULES.push(newRule);
      return newRule;
    }
  }

  async findAllMarkupRules(companyId: string): Promise<MarkupRule[]> {
    try {
      const response = await apiClient.get<MarkupRule[]>(`${this.baseUrl}/markup-rules/all`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching markup rules, using mock data:', error);
      return MOCK_MARKUP_RULES.filter((r) => r.companyId === companyId);
    }
  }

  async findActiveMarkupRules(companyId: string): Promise<MarkupRule[]> {
    try {
      const response = await apiClient.get<MarkupRule[]>(`${this.baseUrl}/markup-rules/active`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching active markup rules, using mock data:', error);
      return MOCK_MARKUP_RULES.filter((r) => r.companyId === companyId && r.isActive);
    }
  }

  async updateMarkupRule(
    companyId: string,
    id: string,
    data: Partial<MarkupRule>
  ): Promise<MarkupRule> {
    try {
      const response = await apiClient.patch<MarkupRule>(
        `${this.baseUrl}/markup-rules/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('API Error updating markup rule, using mock data:', error);
      const index = MOCK_MARKUP_RULES.findIndex((r) => r.id === id);
      if (index === -1) throw new Error(`Markup Rule with ID ${id} not found`);
      MOCK_MARKUP_RULES[index] = { ...MOCK_MARKUP_RULES[index], ...data };
      return MOCK_MARKUP_RULES[index];
    }
  }

  async deleteMarkupRule(companyId: string, id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/markup-rules/${id}`);
    } catch (error) {
      console.error('API Error deleting markup rule, using mock data:', error);
      const index = MOCK_MARKUP_RULES.findIndex((r) => r.id === id);
      if (index !== -1) {
        MOCK_MARKUP_RULES.splice(index, 1);
      }
    }
  }
}

export const estimationPricingService = new EstimationPricingService();
