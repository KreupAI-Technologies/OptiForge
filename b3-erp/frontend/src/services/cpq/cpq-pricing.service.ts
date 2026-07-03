import { apiClient } from '../api/client';

// ==================== TypeScript Interfaces ====================

export interface PricingRule {
  id: string;
  companyId: string;
  ruleName: string;
  ruleType: 'base_price' | 'discount' | 'markup' | 'volume' | 'customer_specific' | 'promotional';
  priority: number;
  conditions: {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: unknown;
  }[];
  adjustmentType: 'percentage' | 'fixed' | 'formula';
  adjustmentValue: number;
  formulaExpression?: string;
  applicableProducts?: string[];
  applicableCategories?: string[];
  applicableCustomerTiers?: string[];
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VolumeDiscount {
  id: string;
  companyId: string;
  name: string;
  productId?: string;
  categoryId?: string;
  tiers: {
    minQuantity: number;
    maxQuantity?: number;
    discountPercentage: number;
  }[];
  isStackable: boolean;
  isActive: boolean;
  validFrom?: string;
  validTo?: string;
}

export interface CustomerPricing {
  id: string;
  companyId: string;
  customerId: string;
  customerName?: string;
  pricingType: 'discount' | 'special_price' | 'tier';
  discountPercentage?: number;
  specialPrices?: { productId: string; price: number }[];
  pricingTier?: string;
  contractReference?: string;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
}

export interface ContractPricing {
  id: string;
  companyId: string;
  contractId: string;
  contractNumber: string;
  customerId: string;
  customerName?: string;
  discountPercentage: number;
  priceList?: { productId: string; contractPrice: number }[];
  minimumOrderValue?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

export interface PromotionalPricing {
  id: string;
  companyId: string;
  promotionName: string;
  promotionCode?: string;
  promotionType: 'percentage_off' | 'fixed_amount_off' | 'buy_x_get_y' | 'bundle_discount';
  discountValue: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  minimumPurchase?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

export interface PriceCalculationResult {
  productId: string;
  basePrice: number;
  quantity: number;
  appliedRules: { ruleId: string; ruleName: string; adjustment: number }[];
  volumeDiscount: number;
  customerDiscount: number;
  promotionalDiscount: number;
  contractPrice?: number;
  subtotal: number;
  totalDiscount: number;
  finalPrice: number;
  currency: string;
}

// ==================== Mock Data ====================

const MOCK_PRICING_RULES: PricingRule[] = [
  {
    id: 'rule-001',
    companyId: 'company-001',
    ruleName: 'Premium Customer Discount',
    ruleType: 'discount',
    priority: 1,
    conditions: [{ field: 'customerTier', operator: 'equals', value: 'premium' }],
    adjustmentType: 'percentage',
    adjustmentValue: 10,
    applicableCustomerTiers: ['premium'],
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'rule-002',
    companyId: 'company-001',
    ruleName: 'High Volume Bonus',
    ruleType: 'volume',
    priority: 2,
    conditions: [{ field: 'quantity', operator: 'greater_than', value: 5 }],
    adjustmentType: 'percentage',
    adjustmentValue: 5,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

const MOCK_VOLUME_DISCOUNTS: VolumeDiscount[] = [
  {
    id: 'vol-001',
    companyId: 'company-001',
    name: 'Standard Volume Tiers',
    tiers: [
      { minQuantity: 1, maxQuantity: 2, discountPercentage: 0 },
      { minQuantity: 3, maxQuantity: 5, discountPercentage: 5 },
      { minQuantity: 6, maxQuantity: 10, discountPercentage: 10 },
      { minQuantity: 11, discountPercentage: 15 },
    ],
    isStackable: false,
    isActive: true,
    validFrom: '2025-01-01',
  },
];

const MOCK_CUSTOMER_PRICING: CustomerPricing[] = [
  {
    id: 'cp-001',
    companyId: 'company-001',
    customerId: 'cust-001',
    customerName: 'Acme Manufacturing',
    pricingType: 'tier',
    pricingTier: 'platinum',
    discountPercentage: 12,
    isActive: true,
    validFrom: '2025-01-01',
  },
  {
    id: 'cp-002',
    companyId: 'company-001',
    customerId: 'cust-002',
    customerName: 'Global Industries',
    pricingType: 'discount',
    discountPercentage: 8,
    isActive: true,
    validFrom: '2025-01-01',
  },
];

const MOCK_PROMOTIONS: PromotionalPricing[] = [
  {
    id: 'promo-001',
    companyId: 'company-001',
    promotionName: 'Q1 2025 Sale',
    promotionCode: 'Q1SALE25',
    promotionType: 'percentage_off',
    discountValue: 10,
    minimumPurchase: 50000,
    maximumDiscount: 25000,
    usageLimit: 100,
    usageCount: 23,
    validFrom: '2025-01-01',
    validTo: '2025-03-31',
    isActive: true,
  },
];

// ==================== Service Class ====================

class CPQPricingService {
  private baseUrl = '/cpq/pricing';

  // Pricing Rules
  async findAllRules(filters?: { ruleType?: string; isActive?: boolean }): Promise<PricingRule[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.ruleType) params.append('ruleType', filters.ruleType);
      if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
      const response = await apiClient.get<PricingRule[]>(`${this.baseUrl}/rules?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching rules, using mock data:', error);
      let result = [...MOCK_PRICING_RULES];
      if (filters?.ruleType) result = result.filter((r) => r.ruleType === filters.ruleType);
      if (filters?.isActive !== undefined) result = result.filter((r) => r.isActive === filters.isActive);
      return result;
    }
  }

  async createRule(data: Partial<PricingRule>): Promise<PricingRule> {
    try {
      const response = await apiClient.post<PricingRule>(`${this.baseUrl}/rules`, data);
      return response.data;
    } catch (error) {
      console.error('API Error creating rule, using mock data:', error);
      const newRule: PricingRule = {
        id: `rule-${Date.now()}`,
        companyId: 'company-001',
        ruleName: data.ruleName || 'New Rule',
        ruleType: data.ruleType || 'discount',
        priority: data.priority || 1,
        conditions: data.conditions || [],
        adjustmentType: data.adjustmentType || 'percentage',
        adjustmentValue: data.adjustmentValue || 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      } as PricingRule;
      MOCK_PRICING_RULES.push(newRule);
      return newRule;
    }
  }

  async updateRule(id: string, data: Partial<PricingRule>): Promise<PricingRule> {
    try {
      const response = await apiClient.patch<PricingRule>(`${this.baseUrl}/rules/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('API Error updating rule, using mock data:', error);
      const index = MOCK_PRICING_RULES.findIndex((r) => r.id === id);
      if (index === -1) throw new Error(`Rule with ID ${id} not found`);
      MOCK_PRICING_RULES[index] = { ...MOCK_PRICING_RULES[index], ...data, updatedAt: new Date().toISOString() };
      return MOCK_PRICING_RULES[index];
    }
  }

  async deleteRule(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/rules/${id}`);
    } catch (error) {
      console.error('API Error deleting rule, using mock data:', error);
      const index = MOCK_PRICING_RULES.findIndex((r) => r.id === id);
      if (index !== -1) MOCK_PRICING_RULES.splice(index, 1);
    }
  }

  // Volume Discounts
  async findAllVolumeDiscounts(filters?: { productId?: string; isActive?: boolean }): Promise<VolumeDiscount[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.productId) params.append('productId', filters.productId);
      if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
      const response = await apiClient.get<VolumeDiscount[]>(`${this.baseUrl}/volume-discounts?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching volume discounts, using mock data:', error);
      return [...MOCK_VOLUME_DISCOUNTS];
    }
  }

  async createVolumeDiscount(data: Partial<VolumeDiscount>): Promise<VolumeDiscount> {
    try {
      const response = await apiClient.post<VolumeDiscount>(`${this.baseUrl}/volume-discounts`, data);
      return response.data;
    } catch (error) {
      console.error('API Error creating volume discount, using mock data:', error);
      const newDiscount: VolumeDiscount = {
        id: `vol-${Date.now()}`,
        companyId: 'company-001',
        name: data.name || 'New Volume Discount',
        tiers: data.tiers || [],
        isStackable: data.isStackable || false,
        isActive: true,
        ...data,
      } as VolumeDiscount;
      MOCK_VOLUME_DISCOUNTS.push(newDiscount);
      return newDiscount;
    }
  }

  // Customer Pricing
  async findAllCustomerPricing(filters?: { customerId?: string; isActive?: boolean }): Promise<CustomerPricing[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.customerId) params.append('customerId', filters.customerId);
      if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
      const response = await apiClient.get<CustomerPricing[]>(`${this.baseUrl}/customer-pricing?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching customer pricing, using mock data:', error);
      let result = [...MOCK_CUSTOMER_PRICING];
      if (filters?.customerId) result = result.filter((cp) => cp.customerId === filters.customerId);
      if (filters?.isActive !== undefined) result = result.filter((cp) => cp.isActive === filters.isActive);
      return result;
    }
  }

  async getCustomerPricing(customerId: string): Promise<CustomerPricing | null> {
    try {
      const response = await apiClient.get<CustomerPricing>(`${this.baseUrl}/customer-pricing/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching customer pricing, using mock data:', error);
      return MOCK_CUSTOMER_PRICING.find((cp) => cp.customerId === customerId) || null;
    }
  }

  async setCustomerPricing(customerId: string, data: Partial<CustomerPricing>): Promise<CustomerPricing> {
    try {
      const response = await apiClient.post<CustomerPricing>(`${this.baseUrl}/customer-pricing/${customerId}`, data);
      return response.data;
    } catch (error) {
      console.error('API Error setting customer pricing, using mock data:', error);
      const existing = MOCK_CUSTOMER_PRICING.find((cp) => cp.customerId === customerId);
      if (existing) {
        Object.assign(existing, data);
        return existing;
      }
      const newPricing: CustomerPricing = {
        id: `cp-${Date.now()}`,
        companyId: 'company-001',
        customerId,
        pricingType: data.pricingType || 'discount',
        isActive: true,
        ...data,
      } as CustomerPricing;
      MOCK_CUSTOMER_PRICING.push(newPricing);
      return newPricing;
    }
  }

  // Contract Pricing
  async findAllContractPricing(filters?: {
    customerId?: string;
    contractId?: string;
    isActive?: boolean;
  }): Promise<ContractPricing[]> {
    const params = new URLSearchParams();
    if (filters?.customerId) params.append('customerId', filters.customerId);
    if (filters?.contractId) params.append('contractId', filters.contractId);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    const response = await apiClient.get<ContractPricing[]>(
      `${this.baseUrl}/contract-pricing?${params.toString()}`,
    );
    return response.data;
  }

  // Promotions
  async findAllPromotions(filters?: { isActive?: boolean }): Promise<PromotionalPricing[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
      const response = await apiClient.get<PromotionalPricing[]>(`${this.baseUrl}/promotions?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching promotions, using mock data:', error);
      let result = [...MOCK_PROMOTIONS];
      if (filters?.isActive !== undefined) result = result.filter((p) => p.isActive === filters.isActive);
      return result;
    }
  }

  async validatePromoCode(code: string): Promise<{ isValid: boolean; promotion?: PromotionalPricing; message?: string }> {
    try {
      const response = await apiClient.post<{ isValid: boolean; promotion?: PromotionalPricing; message?: string }>(
        `${this.baseUrl}/promotions/validate`,
        { code }
      );
      return response.data;
    } catch (error) {
      console.error('API Error validating promo code, using mock data:', error);
      const promo = MOCK_PROMOTIONS.find((p) => p.promotionCode === code && p.isActive);
      if (promo) {
        return { isValid: true, promotion: promo };
      }
      return { isValid: false, message: 'Invalid promotion code' };
    }
  }

  // Price Calculation
  async calculatePrice(params: {
    productId: string;
    quantity: number;
    customerId?: string;
    promoCode?: string;
    selectedOptions?: Record<string, unknown>;
  }): Promise<PriceCalculationResult> {
    try {
      const response = await apiClient.post<PriceCalculationResult>(`${this.baseUrl}/calculate`, params);
      return response.data;
    } catch (error) {
      console.error('API Error calculating price, using mock data:', error);
      // Simple mock calculation
      const basePrice = 100000;
      const quantity = params.quantity || 1;
      const subtotal = basePrice * quantity;
      let volumeDiscount = 0;
      if (quantity >= 6) volumeDiscount = subtotal * 0.1;
      else if (quantity >= 3) volumeDiscount = subtotal * 0.05;

      let customerDiscount = 0;
      if (params.customerId) {
        const cp = MOCK_CUSTOMER_PRICING.find((c) => c.customerId === params.customerId);
        if (cp?.discountPercentage) customerDiscount = subtotal * (cp.discountPercentage / 100);
      }

      const totalDiscount = volumeDiscount + customerDiscount;
      return {
        productId: params.productId,
        basePrice,
        quantity,
        appliedRules: [],
        volumeDiscount,
        customerDiscount,
        promotionalDiscount: 0,
        subtotal,
        totalDiscount,
        finalPrice: subtotal - totalDiscount,
        currency: 'USD',
      };
    }
  }
}

export const cpqPricingService = new CPQPricingService();
