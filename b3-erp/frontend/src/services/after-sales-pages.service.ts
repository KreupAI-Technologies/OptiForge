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

export class AfterSalesPagesService {
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
}
