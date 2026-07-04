// CPQ live-data service (fetch-based).
//
// The existing cpq-analytics.service.ts uses the shared `apiClient`, which
// assumes a { success, data } envelope and does NOT send the `x-company-id`
// header. The NestJS CPQ dashboard/list endpoints return BARE JSON and read
// the tenant from `x-company-id`. This module talks to those endpoints
// directly so the analytics/dashboard pages get real data.
//
// Endpoint source of truth (b3-erp NestJS, port 3001, /api/v1):
//   GET /cpq/quotes                          -> CPQ quote rows
//   GET /cpq/quote-versions-list             -> quote version rows
//   GET /cpq/analytics/dashboards/products   -> ProductsDashboardLive
//   GET /cpq/analytics/dashboards/discounts  -> DiscountsDashboardLive
//   GET /cpq/analytics/dashboards/sales-cycle-> SalesCycleDashboardLive
//   GET /cpq/analytics/dashboards/pricing    -> PricingDashboardLive

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-company-id': COMPANY_ID,
    },
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${path}`);
  }
  return res.json() as Promise<T>;
}

// ==================== Quote rows (list) ====================

export interface CPQQuoteRow {
  id: string;
  quoteNumber: string;
  customerName?: string | null;
  status?: string;
  totalAmount?: number | string;
  quoteDate?: string;
  createdAt?: string;
  items?: unknown[] | null;
  discountPercentage?: number | string;
  validityDays?: number;
  [key: string]: unknown;
}

export interface CPQQuoteVersionRow {
  id: string;
  quoteNumber?: string | null;
  version?: string | null;
  customerName?: string | null;
  value?: number | string;
  changes?: string[] | null;
  changeType?: string;
  createdBy?: string | null;
  createdDate?: string | null;
  status?: string;
  [key: string]: unknown;
}

// ==================== Dashboard shapes ====================

export interface ProductsDashboardLive {
  metrics: { totalLineItems: number; distinctProducts: number; totalRevenue: number };
  topProducts: {
    productId: string;
    name?: string;
    timesQuoted: number;
    totalRevenue: number;
    avgSellingPrice: number;
  }[];
}

export interface DiscountsDashboardLive {
  metrics: {
    avgDiscountPercentage: number;
    totalDiscountAmount: number;
    quotesWithDiscount: number;
  };
  discountTrend: { month: string; avgDiscount: number }[];
  discountDistribution: { range: string; count: number; percentage: number }[];
  marginImpact: { month: string; avgMargin: number }[];
}

export interface SalesCycleDashboardLive {
  metrics: {
    avgCycleDays: number;
    avgApprovalDays: number;
    conversionRate: number;
    totalDeals: number;
  };
  cycleTrend: { month: string; avgDays: number }[];
  conversionFunnel: { stage: string; count: number }[];
  cycleBySize: { range: string; avgDays: number }[];
}

export interface PricingDashboardLive {
  metrics: {
    avgDiscountPercentage: number;
    avgMarginPercentage: number;
    totalRevenue: number;
    wonRevenue: number;
  };
  discountTrend: { month: string; avgDiscount: number }[];
  marginTrend: { month: string; avgMargin: number }[];
  discountVsDealSize: { range: string; avgDiscount: number; count: number }[];
}

// ==================== Service ====================

export const cpqAnalyticsLiveService = {
  async getQuotes(): Promise<CPQQuoteRow[]> {
    const data = await getJson<CPQQuoteRow[] | { data?: CPQQuoteRow[] }>('/cpq/quotes');
    return Array.isArray(data) ? data : data?.data ?? [];
  },

  async getQuoteVersions(): Promise<CPQQuoteVersionRow[]> {
    const data = await getJson<CPQQuoteVersionRow[] | { data?: CPQQuoteVersionRow[] }>(
      '/cpq/quote-versions-list',
    );
    return Array.isArray(data) ? data : data?.data ?? [];
  },

  getProductsDashboard(): Promise<ProductsDashboardLive> {
    return getJson<ProductsDashboardLive>('/cpq/analytics/dashboards/products');
  },

  getDiscountsDashboard(): Promise<DiscountsDashboardLive> {
    return getJson<DiscountsDashboardLive>('/cpq/analytics/dashboards/discounts');
  },

  getSalesCycleDashboard(): Promise<SalesCycleDashboardLive> {
    return getJson<SalesCycleDashboardLive>('/cpq/analytics/dashboards/sales-cycle');
  },

  getPricingDashboard(): Promise<PricingDashboardLive> {
    return getJson<PricingDashboardLive>('/cpq/analytics/dashboards/pricing');
  },
};
