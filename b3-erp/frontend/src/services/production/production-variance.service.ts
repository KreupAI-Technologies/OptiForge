import { apiClient } from '../api/client';

// ============================================================================
// TYPES — Production Variance (backs /production/analytics/variance)
// ============================================================================

export type VarianceCategory = 'cost' | 'schedule' | 'quantity' | 'quality';
export type VarianceStatus =
  | 'favorable'
  | 'unfavorable'
  | 'critical'
  | 'on-time'
  | 'delayed'
  | 'early'
  | 'acceptable'
  | 'warning';

export interface ProductionVariance {
  id: string;
  companyId: string;
  category: VarianceCategory;
  workOrder?: string;
  product?: string;
  subCategory?: string;
  plannedValue: number;
  actualValue: number;
  variance: number;
  variancePercent: number;
  impactCost: number;
  status: VarianceStatus;
  reason?: string;
  action?: string;
  metrics?: Record<string, any>;
  recordDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionVarianceSummary {
  totalVariances: number;
  favorableVariances: number;
  unfavorableVariances: number;
  totalVarianceAmount: number;
  costVariance: number;
  scheduleVariance: number;
  quantityVariance: number;
  qualityVariance: number;
}

// ============================================================================
// SERVICE
// ============================================================================

class ProductionVarianceService {
  private baseUrl = '/production/analytics/variances';

  async getVariances(filters?: {
    companyId?: string;
    category?: VarianceCategory;
    status?: string;
  }): Promise<ProductionVariance[]> {
    const params = new URLSearchParams();
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    const response = await apiClient.get<ProductionVariance[]>(
      `${this.baseUrl}?${params.toString()}`,
    );
    return (response.data ?? (response as unknown as ProductionVariance[])) ?? [];
  }

  async getSummary(companyId: string): Promise<ProductionVarianceSummary> {
    const response = await apiClient.get<ProductionVarianceSummary>(
      `${this.baseUrl}/summary?companyId=${companyId}`,
    );
    return (response.data ??
      (response as unknown as ProductionVarianceSummary)) as ProductionVarianceSummary;
  }

  async getVarianceById(id: string): Promise<ProductionVariance> {
    const response = await apiClient.get<ProductionVariance>(`${this.baseUrl}/${id}`);
    return (response.data ?? (response as unknown as ProductionVariance));
  }
}

export const productionVarianceService = new ProductionVarianceService();
