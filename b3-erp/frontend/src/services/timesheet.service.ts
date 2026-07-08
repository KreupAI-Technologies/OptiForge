/**
 * Timesheet Service (orphan-endpoint wiring)
 *
 * Typed client for the timesheet pages under
 * src/app/(modules)/hr/timesheets/*. Talks to the NestJS domain backend
 * (port 3001, /api/v1). Reuses the existing endpoint:
 *   - /hr/timesheets
 *
 * The list call is defensive: it accepts either a raw array or a paginated
 * `{ data: [] }` envelope and always resolves to an array.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const DEFAULT_COMPANY_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID || 'company-1';

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`API Error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

function toArray<T = any>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) {
    return (raw as any).data as T[];
  }
  return [];
}

function withCompany(query: Record<string, string | undefined> = {}): string {
  const params = new URLSearchParams();
  params.set('companyId', DEFAULT_COMPANY_ID);
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, v);
  });
  return `?${params.toString()}`;
}

async function send<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`API Error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const TimesheetService = {
  // ---- Timesheets ---------------------------------------------------------
  async getTimesheets(
    extra: Record<string, string | undefined> = {},
  ): Promise<any[]> {
    return toArray(await request(`/hr/timesheets${withCompany(extra)}`));
  },

  // Create a timesheet row (used by bulk-punch). Defaults companyId.
  async createTimesheet(data: Record<string, any>): Promise<any> {
    return send('/hr/timesheets', 'POST', {
      companyId: DEFAULT_COMPANY_ID,
      ...data,
    });
  },

  // Update a timesheet (status + fields). Used by approve/reject.
  async updateTimesheet(id: string, data: Record<string, any>): Promise<any> {
    return send(`/hr/timesheets/${id}`, 'PUT', data);
  },

  async approveTimesheet(id: string): Promise<any> {
    return send(`/hr/timesheets/${id}`, 'PUT', { status: 'approved' });
  },

  async rejectTimesheet(id: string, reason?: string): Promise<any> {
    return send(`/hr/timesheets/${id}`, 'PUT', {
      status: 'rejected',
      ...(reason ? { rejectionReason: reason } : {}),
    });
  },
};

export default TimesheetService;
