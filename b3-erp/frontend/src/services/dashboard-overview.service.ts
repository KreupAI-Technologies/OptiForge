/**
 * Dashboard Overview Service
 * Thin fetch wrapper backing the root landing page (`/`) and the
 * command-center page (`/dashboard`) KPI tiles.
 *
 * Endpoint lives on the NestJS domain backend under /api/v1 and returns
 * raw JSON (no { data } envelope). Tenant scoping via the `x-company-id`
 * header + a `companyId` query param.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_DOMAIN_API_URL ||
  'http://localhost:3001/api/v1';

/** Resolve the active company id (falls back to the seeded demo tenant). */
function getCompanyId(): string {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.companyId) return String(u.companyId);
      }
    } catch {
      /* ignore */
    }
  }
  return process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID || 'test';
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const companyId = getCompanyId();
  const sep = path.includes('?') ? '&' : '?';
  const url = `${API_BASE_URL}${path}${sep}companyId=${encodeURIComponent(companyId)}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-company-id': companyId,
      ...options?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`Dashboard API error ${response.status}: ${response.statusText}`);
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : {}) as T;
}

export interface DashboardOverviewMetrics {
  totalOrders: number;
  totalInvoices: number;
  inventoryItems: number;
  production: number;
  employees: number;
  customers: number;
  openTickets: number;
}

export interface DashboardOverviewTile {
  key: string;
  label: string;
  value: number;
}

export interface DashboardOverviewResponse {
  generatedAt: string;
  metrics: DashboardOverviewMetrics;
  tiles: DashboardOverviewTile[];
}

const EMPTY_METRICS: DashboardOverviewMetrics = {
  totalOrders: 0,
  totalInvoices: 0,
  inventoryItems: 0,
  production: 0,
  employees: 0,
  customers: 0,
  openTickets: 0,
};

export const dashboardOverviewService = {
  /**
   * Fetch cross-module KPI counts. Always resolves to a fully-populated,
   * render-safe object; on error it returns zeroed metrics so callers can
   * render tiles without a null guard.
   */
  async getOverview(): Promise<DashboardOverviewResponse> {
    try {
      const res = await request<Partial<DashboardOverviewResponse>>('/dashboard/overview');
      const metrics = { ...EMPTY_METRICS, ...(res?.metrics ?? {}) };
      return {
        generatedAt: res?.generatedAt ?? new Date().toISOString(),
        metrics,
        tiles: Array.isArray(res?.tiles) && res!.tiles!.length > 0
          ? res!.tiles!
          : [
              { key: 'totalOrders', label: 'Total Orders', value: metrics.totalOrders },
              { key: 'totalInvoices', label: 'Invoices', value: metrics.totalInvoices },
              { key: 'production', label: 'Production', value: metrics.production },
              { key: 'inventoryItems', label: 'Inventory Items', value: metrics.inventoryItems },
            ],
      };
    } catch {
      return {
        generatedAt: new Date().toISOString(),
        metrics: { ...EMPTY_METRICS },
        tiles: [
          { key: 'totalOrders', label: 'Total Orders', value: 0 },
          { key: 'totalInvoices', label: 'Invoices', value: 0 },
          { key: 'production', label: 'Production', value: 0 },
          { key: 'inventoryItems', label: 'Inventory Items', value: 0 },
        ],
      };
    }
  },
};
