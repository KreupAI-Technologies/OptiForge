// Typed client for net-new procurement endpoints (notifications, budgets,
// vendor-performance analytics) served by the NestJS backend.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface ProcurementNotification {
  id: string;
  companyId: string;
  type: string;
  priority: string;
  title: string;
  message?: string;
  read: boolean;
  action?: string;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcurementBudget {
  id: string;
  companyId: string;
  fiscalYear?: string;
  name: string;
  budgetType: string;
  budget: number;
  spent: number;
  committed: number;
  available: number;
  createdAt: string;
  updatedAt: string;
}

export interface VendorPerformanceMetric {
  vendorId: string;
  vendorName: string;
  vendorCode: string;
  category: string;
  overallScore: number;
  qualityScore: number;
  deliveryScore: number;
  priceScore: number;
  serviceScore: number;
  complianceScore: number;
  onTimeDeliveryRate: number;
  defectRate: number;
  orderVolume: number;
  totalSpend: number;
  riskLevel: 'low' | 'medium' | 'high';
  trend: 'improving' | 'stable' | 'declining';
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

class ProcurementOperationsService {
  async getNotifications(
    companyId = 'default',
  ): Promise<ProcurementNotification[]> {
    const data = await getJson<ProcurementNotification[]>(
      `${API_BASE_URL}/procurement/notifications?companyId=${encodeURIComponent(companyId)}`,
    );
    return Array.isArray(data) ? data : [];
  }

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/procurement/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async getBudgets(
    companyId = 'default',
    budgetType?: string,
  ): Promise<ProcurementBudget[]> {
    const params = new URLSearchParams({ companyId });
    if (budgetType) params.append('budgetType', budgetType);
    const data = await getJson<ProcurementBudget[]>(
      `${API_BASE_URL}/procurement/budgets?${params.toString()}`,
    );
    return Array.isArray(data) ? data : [];
  }

  async getVendorPerformanceMetrics(
    category?: string,
  ): Promise<VendorPerformanceMetric[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    const data = await getJson<VendorPerformanceMetric[]>(
      `${API_BASE_URL}/procurement/vendor-performance/metrics?${params.toString()}`,
    );
    return Array.isArray(data) ? data : [];
  }
}

export const procurementOperationsService = new ProcurementOperationsService();
