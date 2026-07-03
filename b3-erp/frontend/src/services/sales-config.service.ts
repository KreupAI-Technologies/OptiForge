// Sales module config/analytics service.
// Talks directly to the NestJS domain backend (port 3001, prefix /api/v1).

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}): ${path}`);
  }
  return res.json() as Promise<T>;
}

// ============== Shipping Methods ==============

export interface ShippingMethodDto {
  id: string;
  companyId?: string;
  name: string;
  carrier?: string;
  type: string;
  deliveryDays?: string;
  baseRate: number;
  perKgRate: number;
  minWeight: number;
  maxWeight: number;
  freeShippingThreshold?: number;
  zones: string[];
  applicableProducts: string[];
  insuranceIncluded: boolean;
  trackingAvailable: boolean;
  status: string;
  usageCount: number;
}

export const salesConfigService = {
  // Shipping
  getShippingMethods: (companyId?: string) =>
    request<ShippingMethodDto[]>(
      `/sales/settings/shipping${companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''}`,
    ),
  createShippingMethod: (data: Partial<ShippingMethodDto>) =>
    request<ShippingMethodDto>('/sales/settings/shipping', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateShippingMethod: (id: string, data: Partial<ShippingMethodDto>) =>
    request<ShippingMethodDto>(`/sales/settings/shipping/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteShippingMethod: (id: string) =>
    request<{ deleted: boolean }>(`/sales/settings/shipping/${id}`, {
      method: 'DELETE',
    }),

  // Tax
  getTaxRates: (companyId?: string) =>
    request<TaxRateDto[]>(
      `/sales/settings/tax${companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''}`,
    ),
  createTaxRate: (data: Partial<TaxRateDto>) =>
    request<TaxRateDto>('/sales/settings/tax', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTaxRate: (id: string, data: Partial<TaxRateDto>) =>
    request<TaxRateDto>(`/sales/settings/tax/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTaxRate: (id: string) =>
    request<{ deleted: boolean }>(`/sales/settings/tax/${id}`, {
      method: 'DELETE',
    }),

  // Discounts
  getDiscounts: (companyId?: string) =>
    request<DiscountDto[]>(
      `/sales/pricing/discounts${companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''}`,
    ),
  createDiscount: (data: Partial<DiscountDto>) =>
    request<DiscountDto>('/sales/pricing/discounts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateDiscount: (id: string, data: Partial<DiscountDto>) =>
    request<DiscountDto>(`/sales/pricing/discounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteDiscount: (id: string) =>
    request<{ deleted: boolean }>(`/sales/pricing/discounts/${id}`, {
      method: 'DELETE',
    }),

  // Analytics dashboard (aggregated)
  getAnalyticsDashboard: () =>
    request<SalesAnalyticsDashboardDto>('/sales/analytics/dashboard'),

  // Analytics: products / customers / forecast (aggregated, no table)
  getProductAnalytics: () =>
    request<ProductAnalyticsDto[]>('/sales/analytics/products'),
  getCustomerAnalytics: () =>
    request<CustomerAnalyticsDto[]>('/sales/analytics/customers'),
  getForecast: () => request<ForecastDto[]>('/sales/analytics/forecast'),

  // Terms & conditions templates (settings/terms)
  getTermsTemplates: (companyId?: string) =>
    request<TermsTemplateDto[]>(
      `/sales/settings/terms${companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''}`,
    ),
  createTermsTemplate: (data: Partial<TermsTemplateDto>) =>
    request<TermsTemplateDto>('/sales/settings/terms', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTermsTemplate: (id: string, data: Partial<TermsTemplateDto>) =>
    request<TermsTemplateDto>(`/sales/settings/terms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTermsTemplate: (id: string) =>
    request<{ deleted: boolean }>(`/sales/settings/terms/${id}`, {
      method: 'DELETE',
    }),

  // Promotions (pricing/promotions)
  getPromotions: (companyId?: string) =>
    request<PromotionDto[]>(
      `/sales/pricing/promotions${companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''}`,
    ),
  createPromotion: (data: Partial<PromotionDto>) =>
    request<PromotionDto>('/sales/pricing/promotions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePromotion: (id: string, data: Partial<PromotionDto>) =>
    request<PromotionDto>(`/sales/pricing/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePromotion: (id: string) =>
    request<{ deleted: boolean }>(`/sales/pricing/promotions/${id}`, {
      method: 'DELETE',
    }),

  // Special / contract prices (pricing/special)
  getSpecialPrices: (companyId?: string) =>
    request<SpecialPriceDto[]>(
      `/sales/pricing/special${companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''}`,
    ),
  createSpecialPrice: (data: Partial<SpecialPriceDto>) =>
    request<SpecialPriceDto>('/sales/pricing/special', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSpecialPrice: (id: string, data: Partial<SpecialPriceDto>) =>
    request<SpecialPriceDto>(`/sales/pricing/special/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteSpecialPrice: (id: string) =>
    request<{ deleted: boolean }>(`/sales/pricing/special/${id}`, {
      method: 'DELETE',
    }),

  // Price list items (pricing/lists)
  getPriceListItems: (companyId?: string) =>
    request<PriceListItemDto[]>(
      `/sales/pricing/lists${companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''}`,
    ),
  createPriceListItem: (data: Partial<PriceListItemDto>) =>
    request<PriceListItemDto>('/sales/pricing/lists', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePriceListItem: (id: string, data: Partial<PriceListItemDto>) =>
    request<PriceListItemDto>(`/sales/pricing/lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePriceListItem: (id: string) =>
    request<{ deleted: boolean }>(`/sales/pricing/lists/${id}`, {
      method: 'DELETE',
    }),

  // Sales targets (analytics/targets)
  getSalesTargets: (companyId?: string) =>
    request<SalesTargetDto[]>(
      `/sales/analytics/targets${companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''}`,
    ),
  createSalesTarget: (data: Partial<SalesTargetDto>) =>
    request<SalesTargetDto>('/sales/analytics/targets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSalesTarget: (id: string, data: Partial<SalesTargetDto>) =>
    request<SalesTargetDto>(`/sales/analytics/targets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteSalesTarget: (id: string) =>
    request<{ deleted: boolean }>(`/sales/analytics/targets/${id}`, {
      method: 'DELETE',
    }),

  // Sales reports (analytics/reports)
  getSalesReports: (companyId?: string) =>
    request<SalesReportDto[]>(
      `/sales/analytics/reports${companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''}`,
    ),
  createSalesReport: (data: Partial<SalesReportDto>) =>
    request<SalesReportDto>('/sales/analytics/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSalesReport: (id: string, data: Partial<SalesReportDto>) =>
    request<SalesReportDto>(`/sales/analytics/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteSalesReport: (id: string) =>
    request<{ deleted: boolean }>(`/sales/analytics/reports/${id}`, {
      method: 'DELETE',
    }),
};

export interface PriceListItemDto {
  id: string;
  companyId?: string;
  productCode?: string;
  productName: string;
  category?: string;
  basePrice: number;
  currentPrice: number;
  unit: string;
  effectiveFrom?: string;
  priceChange: number;
  priceChangePercent: number;
  moq: number;
  stock: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesTargetDto {
  id: string;
  companyId?: string;
  name: string;
  type: string;
  period?: string;
  target: number;
  achieved: number;
  progress: number;
  status: string;
  assignedTo?: string;
  category?: string;
  region?: string;
  startDate?: string;
  endDate?: string;
  daysRemaining: number;
}

export interface SalesReportDto {
  id: string;
  companyId?: string;
  name: string;
  type: string;
  description?: string;
  period?: string;
  generatedDate?: string;
  generatedBy?: string;
  fileSize?: string;
  format: string;
  keyMetrics: { label: string; value: string }[];
  status: string;
}

export interface ProductAnalyticsDto {
  code: string;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  avgPrice: number;
  stockLevel: number;
  reorderPoint: number;
  margin: number;
  rating: number;
  reviews: number;
  returns: number;
  returnRate: number;
  trend: number;
  topRegion: string;
  topCustomerType: string;
}

export interface CustomerAnalyticsDto {
  code: string;
  name: string;
  type: string;
  region: string;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  lastOrderDate: string;
  status: string;
  trend: number;
}

export interface ForecastDto {
  period: string;
  predicted: number;
  actual: number;
  orders: number;
}

export interface TermsTemplateDto {
  id: string;
  companyId?: string;
  name: string;
  type: string;
  category?: string;
  content?: string;
  status: string;
  applicableTo: string[];
  usageCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromotionDto {
  id: string;
  companyId?: string;
  name: string;
  code?: string;
  type: string;
  description?: string;
  category?: string;
  applicableProducts: string[];
  discountType: string;
  discountValue: number;
  startDate?: string;
  endDate?: string;
  status: string;
  targetAudience?: string;
  minPurchase: number;
  maxDiscount?: number;
  claimedCount: number;
  targetCount: number;
  revenue: number;
  bannerImage?: string;
}

export interface SpecialPriceDto {
  id: string;
  companyId?: string;
  customerName: string;
  customerType: string;
  productCode?: string;
  productName?: string;
  category?: string;
  standardPrice: number;
  specialPrice: number;
  discountPercent: number;
  minOrderQty: number;
  validFrom?: string;
  validTo?: string;
  status: string;
  approvedBy?: string;
  contractRef?: string;
  orderCount: number;
  totalRevenue: number;
}

export interface TaxRateDto {
  id: string;
  companyId?: string;
  name: string;
  taxType: string;
  rate: number;
  cgstRate?: number;
  sgstRate?: number;
  igstRate?: number;
  hsnCode?: string;
  sacCode?: string;
  category?: string;
  applicableProducts: string[];
  description?: string;
  status: string;
  effectiveDate?: string;
  usageCount: number;
}

export interface DiscountDto {
  id: string;
  companyId?: string;
  code?: string;
  name: string;
  type: string;
  category?: string;
  value: number;
  minQuantity: number;
  minOrderValue: number;
  maxDiscount?: number;
  applicableProducts: string[];
  validFrom?: string;
  validTo?: string;
  status: string;
  usageCount: number;
  usageLimit?: number;
}

export interface SalesAnalyticsDashboardDto {
  currentStats: {
    revenue: number;
    revenueGrowth: number;
    orders: number;
    ordersGrowth: number;
    avgOrderValue: number;
    avgOrderGrowth: number;
    customers: number;
    customersGrowth: number;
    conversionRate: number;
    conversionGrowth: number;
  };
  monthlySales: { month: string; revenue: number; orders: number; avgOrder: number }[];
  categoryData: {
    category: string;
    revenue: number;
    orders: number;
    growth: number;
    color: string;
  }[];
  topProducts: { name: string; code: string; revenue: number; units: number; avgPrice: number }[];
  regionalData: { region: string; revenue: number; growth: number; orders: number; color: string }[];
}
