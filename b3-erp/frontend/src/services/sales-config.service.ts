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
};

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
