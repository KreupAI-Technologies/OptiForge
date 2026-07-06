import { apiClient } from './api/client';

// ============== Interfaces (mirror backend sales-analytics.service.ts) ==============

export interface SalesAnalyticsDashboard {
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
  categoryData: { category: string; revenue: number; orders: number; growth: number; color: string }[];
  topProducts: { name: string; code: string; revenue: number; units: number; avgPrice: number }[];
  regionalData: { region: string; revenue: number; growth: number; orders: number; color: string }[];
}

export interface ForecastRow {
  period: string;
  predicted: number;
  actual: number;
  orders: number;
}

/**
 * Sales analytics client — talks to the NestJS `sales/analytics/*` endpoints.
 * The backend returns raw objects/arrays (not wrapped in { data }); we unwrap
 * defensively so callers get the payload either way.
 */
class SalesAnalyticsService {
  private unwrap<T>(response: { data?: T } & Record<string, unknown>): T {
    return (response?.data ?? (response as unknown as T));
  }

  async getDashboard(): Promise<SalesAnalyticsDashboard> {
    const response = await apiClient.get<SalesAnalyticsDashboard>('/sales/analytics/dashboard');
    return this.unwrap<SalesAnalyticsDashboard>(response as never);
  }

  async getForecast(): Promise<ForecastRow[]> {
    const response = await apiClient.get<ForecastRow[]>('/sales/analytics/forecast');
    const data = this.unwrap<ForecastRow[]>(response as never);
    return Array.isArray(data) ? data : [];
  }
}

export const salesAnalyticsService = new SalesAnalyticsService();
