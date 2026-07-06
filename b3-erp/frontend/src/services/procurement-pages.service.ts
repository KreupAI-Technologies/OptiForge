// Procurement pages service — hits NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', 'x-company-id': COMPANY_ID },
    ...init,
  });
  if (!res.ok) throw new Error(`Request failed (${res.status}) for ${path}`);
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}
function asArray<T>(d: any): T[] { return Array.isArray(d) ? d : (d?.data ?? []); }

export const procurementPagesService = {
  async getPurchaseOrders(): Promise<any[]> { return asArray(await request('/procurement/purchase-orders')); },
  async getVendors(): Promise<any[]> { return asArray(await request('/procurement/vendors')); },

  // ---- Dashboard insights (procurement/insights/*) ----
  async getAnalyticsInsights(): Promise<any> { return request('/procurement/insights/analytics'); },
  async getAutomationInsights(): Promise<any> { return request('/procurement/insights/automation'); },
  async getComplianceInsights(): Promise<any> { return request('/procurement/insights/compliance'); },
  async getRiskInsights(): Promise<any> { return request('/procurement/insights/risk'); },
  async getDiversityInsights(): Promise<any> { return request('/procurement/insights/diversity'); },
  async getQualityAssuranceInsights(): Promise<any> { return request('/procurement/insights/quality-assurance'); },
  async getStrategicSourcingInsights(): Promise<any> { return request('/procurement/insights/strategic-sourcing'); },
  async getMarketplaceInsights(): Promise<any> { return request('/procurement/insights/marketplace'); },
  async getCollaborationInsights(): Promise<any> { return request('/procurement/insights/collaboration'); },
  async getOnboardingInsights(): Promise<any> { return request('/procurement/insights/onboarding'); },
  async getVendorActivities(): Promise<any[]> { return asArray(await request('/procurement/insights/vendor-activities')); },
  async getVendorRisk(): Promise<any[]> { return asArray(await request('/procurement/insights/vendor-risk')); },
  async getPendingActions(): Promise<any[]> { return asArray(await request('/procurement/insights/pending-actions')); },

  // ---- Spend analysis (procurement/spend-analysis/*) ----
  async getSpendOverview(): Promise<any> { return request('/procurement/spend-analysis/overview'); },
  async getSpendVendorAnalysis(): Promise<any[]> { return asArray(await request('/procurement/spend-analysis/vendors')); },
  async getSpendCategoryAnalysis(): Promise<any[]> { return asArray(await request('/procurement/spend-analysis/categories')); },
  async getSpendMaverick(): Promise<any> { return request('/procurement/spend-analysis/maverick'); },
  async getSpendSavings(): Promise<any[]> { return asArray(await request('/procurement/spend-analysis/savings')); },
  async getSpendAbc(dimension: 'vendor' | 'category' | 'item' = 'vendor'): Promise<any[]> { return asArray(await request(`/procurement/spend-analysis/abc?dimension=${dimension}`)); },
  async getSpendTrend(): Promise<any[]> { return asArray(await request('/procurement/spend-analysis/trend')); },
  async getSpendByDepartment(): Promise<any[]> { return asArray(await request('/procurement/spend-analysis/departments')); },
};
