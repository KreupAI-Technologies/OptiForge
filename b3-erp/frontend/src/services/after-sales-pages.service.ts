/**
 * After-Sales Pages Service
 * Thin fetch wrapper backing the remaining after-sales-service mock-only
 * pages (feedback, parts, analytics, troubleshooting, field-service,
 * contracts, warranties, installations, service-requests, dashboard,
 * self-service).
 *
 * All endpoints live on the NestJS domain backend under /api/v1 and return
 * raw JSON arrays (no { data } envelope). Tenant scoping via the
 * `x-company-id` header + a `companyId` query param.
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
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-company-id': companyId,
      ...options?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`After-sales API error ${response.status}: ${response.statusText}`);
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : []) as T;
}

export interface AfterSalesOverviewStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  avgResolutionTime: number;
  customerSatisfaction: number;
  activeServiceCalls: number;
  warrantyClaimsThisMonth: number;
  technicianUtilization: number;
  pendingParts: number;
  scheduledVisits: number;
}

export interface AfterSalesOverviewTicket {
  id: string;
  customer: string;
  product: string;
  issue: string;
  status: string;
  priority: string;
  assignedTo: string;
  createdDate: string;
  estimatedResolution: string;
  satisfaction: number | null;
  slaStatus: string;
  responseDeadline: string;
  resolutionDeadline: string;
}

export interface AfterSalesOverview {
  stats: AfterSalesOverviewStats;
  recentTickets: AfterSalesOverviewTicket[];
}

export interface AfterSalesSlaTicket {
  id: string;
  ticketNumber: string;
  customer: string;
  priority: string;
  status: string;
  responseDeadline: string;
  resolutionDeadline: string;
  timeRemaining: number;
  assignedTo: string;
  issueType: string;
}

export interface AfterSalesSlaLive {
  tickets: AfterSalesSlaTicket[];
  stats: {
    compliance: number;
    metSLA: number;
    atRisk: number;
    breached: number;
    avgResponse: number;
  };
}

export class AfterSalesPagesService {
  // ---- Overview (landing + advanced-features) ----------------------------
  static overview(): Promise<AfterSalesOverview> {
    return request<AfterSalesOverview>('/after-sales/overview');
  }
  static slaLive(): Promise<AfterSalesSlaLive> {
    return request<AfterSalesSlaLive>('/after-sales/overview/sla-live');
  }

  // ---- Feedback ----------------------------------------------------------
  static complaints<T = any[]>(): Promise<T> {
    return request<T>('/after-sales/feedback/complaints');
  }
  static ratings<T = any[]>(): Promise<T> {
    return request<T>('/after-sales/feedback/ratings');
  }
  static nps<T = any[]>(): Promise<T> {
    return request<T>('/after-sales/feedback/nps');
  }
  static surveys<T = any[]>(): Promise<T> {
    return request<T>('/after-sales/feedback/surveys');
  }

  // ---- Parts -------------------------------------------------------------
  static partsRequisitions<T = any[]>(): Promise<T> {
    return request<T>('/after-sales/parts/requisitions');
  }
  static partsConsumption<T = any[]>(): Promise<T> {
    return request<T>('/after-sales/parts/consumption');
  }
  static partsReturns<T = any[]>(): Promise<T> {
    return request<T>('/after-sales/parts/returns');
  }

  // ---- Analytics ---------------------------------------------------------
  static technicians<T = any[]>(): Promise<T> {
    return request<T>('/after-sales/analytics/technicians');
  }
  static ftf<T = any[]>(): Promise<T> {
    return request<T>('/after-sales/analytics/ftf');
  }
  static reports<T = any[]>(): Promise<T> {
    return request<T>('/after-sales/analytics/reports');
  }

  // ---- Troubleshooting ---------------------------------------------------
  static troubleshooting<T = any[]>(): Promise<T> {
    return request<T>('/after-sales/troubleshooting');
  }

  // ---- Existing domain endpoints (reused by remaining pages) -------------
  static fieldJobs<T = any[]>(): Promise<T> {
    return request<T>('/after-sales/field-service/jobs');
  }
  static engineersSchedule<T = any[]>(): Promise<T> {
    return request<T>('/after-sales/field-service/engineers/schedule');
  }
  static serviceRequests<T = any[]>(): Promise<T> {
    return request<T>('/after-sales/service-requests');
  }
  static serviceRequest<T = any>(id: string): Promise<T> {
    return request<T>(`/after-sales/service-requests/${encodeURIComponent(id)}`);
  }
  static installations<T = any[]>(): Promise<T> {
    return request<T>('/after-sales/installations');
  }
  static contracts<T = any[]>(): Promise<T> {
    return request<T>('/after-sales/contracts');
  }
  static contract<T = any>(id: string): Promise<T> {
    return request<T>(`/after-sales/contracts/${encodeURIComponent(id)}`);
  }
  static invoices<T = any[]>(): Promise<T> {
    return request<T>('/after-sales/billing/invoices');
  }
  static warrantyClaims<T = any[]>(warrantyId?: string): Promise<T> {
    return request<T>(
      warrantyId
        ? `/after-sales/warranties/claims?warrantyId=${encodeURIComponent(warrantyId)}`
        : '/after-sales/warranties/claims',
    );
  }

  // ---- Detail (by-id) reads ----------------------------------------------
  static installation<T = any>(id: string): Promise<T> {
    return request<T>(`/after-sales/installations/${encodeURIComponent(id)}`);
  }
  static fieldJob<T = any>(id: string): Promise<T> {
    return request<T>(
      `/after-sales/field-service/jobs/${encodeURIComponent(id)}`,
    );
  }
  static invoice<T = any>(id: string): Promise<T> {
    return request<T>(
      `/after-sales/billing/invoices/${encodeURIComponent(id)}`,
    );
  }
  static warranty<T = any>(id: string): Promise<T> {
    return request<T>(`/after-sales/warranties/${encodeURIComponent(id)}`);
  }
  static knowledgeArticles<T = any[]>(): Promise<T> {
    return request<T>('/after-sales/knowledge');
  }
  static knowledgeArticle<T = any>(id: string): Promise<T> {
    return request<T>(`/after-sales/knowledge/${encodeURIComponent(id)}`);
  }

  // ---- Creates -----------------------------------------------------------
  static createServiceRequest<T = any>(body: any): Promise<T> {
    return request<T>('/after-sales/service-requests', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
  static createInstallation<T = any>(body: any): Promise<T> {
    return request<T>('/after-sales/installations', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
  static createWarranty<T = any>(body: any): Promise<T> {
    return request<T>('/after-sales/warranties', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
  static createContract<T = any>(body: any): Promise<T> {
    return request<T>('/after-sales/contracts', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
  static createInvoice<T = any>(body: any): Promise<T> {
    return request<T>('/after-sales/billing/invoices', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
  static renewContract<T = any>(id: string, body: any): Promise<T> {
    return request<T>(
      `/after-sales/contracts/${encodeURIComponent(id)}/renew`,
      { method: 'POST', body: JSON.stringify(body) },
    );
  }

  // ---- Updates -----------------------------------------------------------
  static updateInvoice<T = any>(id: string, body: any): Promise<T> {
    return request<T>(
      `/after-sales/billing/invoices/${encodeURIComponent(id)}`,
      { method: 'PUT', body: JSON.stringify(body) },
    );
  }
  static extendWarranty<T = any>(id: string, body: any): Promise<T> {
    return request<T>(
      `/after-sales/warranties/${encodeURIComponent(id)}`,
      { method: 'PUT', body: JSON.stringify(body) },
    );
  }

  // ---- Parts detail reads (backend exposes list routes only; resolve the
  //      single record from the list by id — no dedicated by-id route) ------
  static async partsRequisition<T = any>(id: string): Promise<T | undefined> {
    const list = await this.partsRequisitions<any[]>();
    return (Array.isArray(list) ? list : []).find(
      (r) => String(r?.id) === String(id) || String(r?.requisitionNumber) === String(id),
    ) as T | undefined;
  }
  static async partsConsumptionItem<T = any>(id: string): Promise<T | undefined> {
    const list = await this.partsConsumption<any[]>();
    return (Array.isArray(list) ? list : []).find(
      (r) => String(r?.id) === String(id) || String(r?.consumptionId) === String(id),
    ) as T | undefined;
  }
  static async partsReturn<T = any>(id: string): Promise<T | undefined> {
    const list = await this.partsReturns<any[]>();
    return (Array.isArray(list) ? list : []).find(
      (r) => String(r?.id) === String(id) || String(r?.returnId) === String(id),
    ) as T | undefined;
  }
  static updatePartsRequisition<T = any>(id: string, body: any): Promise<T> {
    return request<T>(
      `/after-sales/parts/requisitions/${encodeURIComponent(id)}`,
      { method: 'PUT', body: JSON.stringify(body) },
    );
  }
  static updatePartsConsumption<T = any>(id: string, body: any): Promise<T> {
    return request<T>(
      `/after-sales/parts/consumption/${encodeURIComponent(id)}`,
      { method: 'PUT', body: JSON.stringify(body) },
    );
  }
  static updatePartsReturn<T = any>(id: string, body: any): Promise<T> {
    return request<T>(
      `/after-sales/parts/returns/${encodeURIComponent(id)}`,
      { method: 'PUT', body: JSON.stringify(body) },
    );
  }
}
