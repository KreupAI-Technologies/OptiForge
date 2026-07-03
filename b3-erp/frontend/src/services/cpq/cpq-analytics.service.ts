import { apiClient } from '../api/client';

// ==================== TypeScript Interfaces ====================

export interface CPQDashboardSummary {
  quoteMetrics: {
    total: number;
    draft: number;
    pending: number;
    approved: number;
    sent: number;
    won: number;
    lost: number;
  };
  valueMetrics: {
    totalPipelineValue: number;
    wonValue: number;
    avgDealSize: number;
  };
  performanceMetrics: {
    winRate: number;
    avgCycleDays: number;
    avgDiscountPercentage: number;
  };
}

export interface QuoteAnalyticsSummary {
  totalQuotes: number;
  wonQuotes: number;
  lostQuotes: number;
  winRate: number;
  avgCycleDays: number;
  avgDiscountPercentage: number;
  avgMarginPercentage: number;
  totalValue: number;
  wonValue: number;
}

export interface WinLossAnalysis {
  totalDeals: number;
  wins: number;
  losses: number;
  winRate: number;
  avgWonValue: number;
  avgLostValue: number;
  topLossReasons: { reason: string; count: number; percentage: number }[];
  competitorAnalysis: { competitor: string; lossCount: number; avgPriceDifference: number }[];
}

export interface PricingAnalyticsSummary {
  avgListPrice: number;
  avgSoldPrice: number;
  avgDiscountPercentage: number;
  priceVariance: number;
  avgMarginPercentage: number;
  totalRevenue: number;
}

export interface SalesCycleAnalysis {
  avgCycleDays: number;
  avgQuoteCreationDays: number;
  avgApprovalDays: number;
  avgCustomerDecisionDays: number;
  conversionRate: number;
  stageMetrics: { stage: string; avgDays: number; dropOffRate: number }[];
}

export interface DiscountAnalysis {
  avgDiscountPercentage: number;
  totalDiscountAmount: number;
  discountDistribution: { range: string; count: number; percentage: number }[];
  revenueImpact: number;
  marginImpact: number;
}

export interface ProductPerformanceSummary {
  products: {
    productId: string;
    productName: string;
    timesQuoted: number;
    timesWon: number;
    winRate: number;
    totalRevenue: number;
    avgSellingPrice: number;
  }[];
  topPerformers: string[];
  underPerformers: string[];
}

// ==================== Mock Data ====================

const MOCK_DASHBOARD: CPQDashboardSummary = {
  quoteMetrics: {
    total: 156,
    draft: 23,
    pending: 18,
    approved: 12,
    sent: 45,
    won: 42,
    lost: 16,
  },
  valueMetrics: {
    totalPipelineValue: 12500000,
    wonValue: 4850000,
    avgDealSize: 185000,
  },
  performanceMetrics: {
    winRate: 72.4,
    avgCycleDays: 21,
    avgDiscountPercentage: 8.5,
  },
};

const MOCK_QUOTE_ANALYTICS: QuoteAnalyticsSummary = {
  totalQuotes: 156,
  wonQuotes: 42,
  lostQuotes: 16,
  winRate: 72.4,
  avgCycleDays: 21,
  avgDiscountPercentage: 8.5,
  avgMarginPercentage: 26.3,
  totalValue: 12500000,
  wonValue: 4850000,
};

const MOCK_WIN_LOSS: WinLossAnalysis = {
  totalDeals: 58,
  wins: 42,
  losses: 16,
  winRate: 72.4,
  avgWonValue: 115476,
  avgLostValue: 89500,
  topLossReasons: [
    { reason: 'Price too high', count: 6, percentage: 37.5 },
    { reason: 'Competitor won', count: 4, percentage: 25 },
    { reason: 'Project cancelled', count: 3, percentage: 18.75 },
    { reason: 'Requirements changed', count: 2, percentage: 12.5 },
    { reason: 'Budget constraints', count: 1, percentage: 6.25 },
  ],
  competitorAnalysis: [
    { competitor: 'Competitor A', lossCount: 3, avgPriceDifference: -12 },
    { competitor: 'Competitor B', lossCount: 1, avgPriceDifference: -8 },
  ],
};

const MOCK_PRICING_ANALYTICS: PricingAnalyticsSummary = {
  avgListPrice: 175000,
  avgSoldPrice: 159250,
  avgDiscountPercentage: 9,
  priceVariance: 15750,
  avgMarginPercentage: 26.3,
  totalRevenue: 4850000,
};

const MOCK_SALES_CYCLE: SalesCycleAnalysis = {
  avgCycleDays: 21,
  avgQuoteCreationDays: 3,
  avgApprovalDays: 2,
  avgCustomerDecisionDays: 12,
  conversionRate: 72.4,
  stageMetrics: [
    { stage: 'Quote Creation', avgDays: 3, dropOffRate: 5 },
    { stage: 'Internal Approval', avgDays: 2, dropOffRate: 8 },
    { stage: 'Customer Review', avgDays: 8, dropOffRate: 12 },
    { stage: 'Negotiation', avgDays: 5, dropOffRate: 15 },
    { stage: 'Final Decision', avgDays: 3, dropOffRate: 20 },
  ],
};

const MOCK_DISCOUNT_ANALYSIS: DiscountAnalysis = {
  avgDiscountPercentage: 8.5,
  totalDiscountAmount: 450000,
  discountDistribution: [
    { range: '0-5%', count: 45, percentage: 38.5 },
    { range: '5-10%', count: 52, percentage: 44.4 },
    { range: '10-15%', count: 15, percentage: 12.8 },
    { range: '15-20%', count: 4, percentage: 3.4 },
    { range: '>20%', count: 1, percentage: 0.9 },
  ],
  revenueImpact: -450000,
  marginImpact: -2.3,
};

const MOCK_PRODUCT_PERFORMANCE: ProductPerformanceSummary = {
  products: [
    { productId: 'prod-001', productName: '5-Axis CNC Milling Machine', timesQuoted: 45, timesWon: 28, winRate: 62.2, totalRevenue: 7280000, avgSellingPrice: 260000 },
    { productId: 'prod-002', productName: 'CNC Lathe Professional', timesQuoted: 38, timesWon: 32, winRate: 84.2, totalRevenue: 2720000, avgSellingPrice: 85000 },
    { productId: 'prod-003', productName: '6-DOF Industrial Welding Robot', timesQuoted: 22, timesWon: 15, winRate: 68.2, totalRevenue: 2625000, avgSellingPrice: 175000 },
  ],
  topPerformers: ['prod-002', 'prod-003'],
  underPerformers: [],
};

// ==================== Service Class ====================

class CPQAnalyticsService {
  private baseUrl = '/cpq/analytics';

  // Dashboard
  async getDashboardSummary(filters?: { fromDate?: Date; toDate?: Date }): Promise<CPQDashboardSummary> {
    try {
      const params = new URLSearchParams();
      if (filters?.fromDate) params.append('fromDate', filters.fromDate.toISOString());
      if (filters?.toDate) params.append('toDate', filters.toDate.toISOString());
      const response = await apiClient.get<CPQDashboardSummary>(`${this.baseUrl}/dashboard?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching dashboard, using mock data:', error);
      return { ...MOCK_DASHBOARD };
    }
  }

  // Quote Analytics
  async getQuoteAnalyticsSummary(filters?: {
    fromDate?: Date;
    toDate?: Date;
    salesRepId?: string;
  }): Promise<QuoteAnalyticsSummary> {
    try {
      const params = new URLSearchParams();
      if (filters?.fromDate) params.append('fromDate', filters.fromDate.toISOString());
      if (filters?.toDate) params.append('toDate', filters.toDate.toISOString());
      if (filters?.salesRepId) params.append('salesRepId', filters.salesRepId);
      const response = await apiClient.get<QuoteAnalyticsSummary>(`${this.baseUrl}/quotes/summary?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching quote analytics, using mock data:', error);
      return { ...MOCK_QUOTE_ANALYTICS };
    }
  }

  // Win/Loss Analysis
  async getWinLossAnalysis(filters?: {
    fromDate?: Date;
    toDate?: Date;
    industry?: string;
    productCategory?: string;
    salesRepId?: string;
  }): Promise<WinLossAnalysis> {
    try {
      const params = new URLSearchParams();
      if (filters?.fromDate) params.append('fromDate', filters.fromDate.toISOString());
      if (filters?.toDate) params.append('toDate', filters.toDate.toISOString());
      if (filters?.industry) params.append('industry', filters.industry);
      if (filters?.productCategory) params.append('productCategory', filters.productCategory);
      if (filters?.salesRepId) params.append('salesRepId', filters.salesRepId);
      const response = await apiClient.get<WinLossAnalysis>(`${this.baseUrl}/win-loss?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching win/loss analysis, using mock data:', error);
      return { ...MOCK_WIN_LOSS };
    }
  }

  // Pricing Analytics
  async getPricingAnalyticsSummary(filters?: {
    productId?: string;
    productCategory?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<PricingAnalyticsSummary> {
    try {
      const params = new URLSearchParams();
      if (filters?.productId) params.append('productId', filters.productId);
      if (filters?.productCategory) params.append('productCategory', filters.productCategory);
      if (filters?.fromDate) params.append('fromDate', filters.fromDate.toISOString());
      if (filters?.toDate) params.append('toDate', filters.toDate.toISOString());
      const response = await apiClient.get<PricingAnalyticsSummary>(`${this.baseUrl}/pricing/summary?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching pricing analytics, using mock data:', error);
      return { ...MOCK_PRICING_ANALYTICS };
    }
  }

  // Sales Cycle Analysis
  async getSalesCycleAnalysis(filters?: {
    fromDate?: Date;
    toDate?: Date;
    salesRepId?: string;
    region?: string;
  }): Promise<SalesCycleAnalysis> {
    try {
      const params = new URLSearchParams();
      if (filters?.fromDate) params.append('fromDate', filters.fromDate.toISOString());
      if (filters?.toDate) params.append('toDate', filters.toDate.toISOString());
      if (filters?.salesRepId) params.append('salesRepId', filters.salesRepId);
      if (filters?.region) params.append('region', filters.region);
      const response = await apiClient.get<SalesCycleAnalysis>(`${this.baseUrl}/sales-cycle?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching sales cycle analysis, using mock data:', error);
      return { ...MOCK_SALES_CYCLE };
    }
  }

  // Discount Analysis
  async getDiscountAnalysis(filters?: {
    fromDate?: Date;
    toDate?: Date;
    salesRepId?: string;
  }): Promise<DiscountAnalysis> {
    try {
      const params = new URLSearchParams();
      if (filters?.fromDate) params.append('fromDate', filters.fromDate.toISOString());
      if (filters?.toDate) params.append('toDate', filters.toDate.toISOString());
      if (filters?.salesRepId) params.append('salesRepId', filters.salesRepId);
      const response = await apiClient.get<DiscountAnalysis>(`${this.baseUrl}/discounts?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching discount analysis, using mock data:', error);
      return { ...MOCK_DISCOUNT_ANALYSIS };
    }
  }

  // Product Performance
  async getProductPerformanceSummary(filters?: {
    productId?: string;
    productCategory?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<ProductPerformanceSummary> {
    try {
      const params = new URLSearchParams();
      if (filters?.productId) params.append('productId', filters.productId);
      if (filters?.productCategory) params.append('productCategory', filters.productCategory);
      if (filters?.fromDate) params.append('fromDate', filters.fromDate.toISOString());
      if (filters?.toDate) params.append('toDate', filters.toDate.toISOString());
      const response = await apiClient.get<ProductPerformanceSummary>(`${this.baseUrl}/products/summary?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching product performance, using mock data:', error);
      return { ...MOCK_PRODUCT_PERFORMANCE };
    }
  }

  // Record Analytics Events
  async recordQuoteAnalytics(quoteId: string, data: Record<string, unknown>): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/quotes`, { quoteId, data });
    } catch (error) {
      console.error('API Error recording quote analytics:', error);
    }
  }

  async recordWinLoss(data: Record<string, unknown>): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/win-loss`, data);
    } catch (error) {
      console.error('API Error recording win/loss:', error);
    }
  }

  // ==================== Aggregated Dashboards ====================
  // These aggregate the cpq_quotes / cpq_quote_items tables on the backend.

  async getWinRateDashboard(): Promise<WinRateDashboard> {
    const response = await apiClient.get<WinRateDashboard>(
      `${this.baseUrl}/dashboards/win-rate`,
    );
    return response.data;
  }

  async getQuotesDashboard(): Promise<QuotesDashboard> {
    const response = await apiClient.get<QuotesDashboard>(
      `${this.baseUrl}/dashboards/quotes`,
    );
    return response.data;
  }

  async getDiscountsDashboard(): Promise<DiscountsDashboard> {
    const response = await apiClient.get<DiscountsDashboard>(
      `${this.baseUrl}/dashboards/discounts`,
    );
    return response.data;
  }

  async getSalesCycleDashboard(): Promise<SalesCycleDashboard> {
    const response = await apiClient.get<SalesCycleDashboard>(
      `${this.baseUrl}/dashboards/sales-cycle`,
    );
    return response.data;
  }

  async getPricingDashboard(): Promise<PricingDashboard> {
    const response = await apiClient.get<PricingDashboard>(
      `${this.baseUrl}/dashboards/pricing`,
    );
    return response.data;
  }

  async getProductsDashboard(): Promise<ProductsDashboard> {
    const response = await apiClient.get<ProductsDashboard>(
      `${this.baseUrl}/dashboards/products`,
    );
    return response.data;
  }
}

// ==================== Dashboard Interfaces ====================

export interface WinRateDashboard {
  metrics: {
    overallWinRate: number;
    dealsWon: number;
    dealsLost: number;
    avgWonDealSize: number;
    avgLostDealSize: number;
  };
  winLossTrend: { month: string; won: number; lost: number; winRate: number }[];
  lossReasons: { reason: string; count: number; percentage: number }[];
  dealSizeWinRate: { range: string; won: number; lost: number; winRate: number }[];
  regionWinRate: { region: string; won: number; lost: number; winRate: number; deals: number }[];
}

export interface QuotesDashboard {
  metrics: {
    totalQuotes: number;
    totalValue: number;
    avgQuoteValue: number;
    conversionRate: number;
  };
  volumeTrend: { month: string; count: number; value: number }[];
  statusDistribution: { status: string; count: number }[];
  avgQuoteValue: { month: string; value: number }[];
}

export interface DiscountsDashboard {
  metrics: {
    avgDiscountPercentage: number;
    totalDiscountAmount: number;
    quotesWithDiscount: number;
  };
  discountTrend: { month: string; avgDiscount: number }[];
  discountDistribution: { range: string; count: number; percentage: number }[];
  marginImpact: { month: string; avgMargin: number }[];
}

export interface SalesCycleDashboard {
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

export interface PricingDashboard {
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

export interface ProductsDashboard {
  metrics: {
    totalLineItems: number;
    distinctProducts: number;
    totalRevenue: number;
  };
  topProducts: {
    productId: string;
    name: string;
    timesQuoted: number;
    totalRevenue: number;
    avgSellingPrice: number;
  }[];
}

export const cpqAnalyticsService = new CPQAnalyticsService();
