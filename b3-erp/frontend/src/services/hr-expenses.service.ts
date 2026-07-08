/**
 * HR Expenses & Travel Service (orphan-endpoint wiring)
 *
 * Typed client for the expense-management and travel pages under
 * src/app/(modules)/hr/expenses/*. Talks to the NestJS domain backend
 * (port 3001, /api/v1). Reuses existing endpoints:
 *   - /hr/expense-claims (status/kind discriminated)
 *   - /hr/travel-requests, /hr/travel-advances
 *   - /hr/corporate-cards, /hr/card-transactions
 *
 * Every list call is defensive: it accepts either a raw array or a paginated
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

export const HrExpensesService = {
  // ---- Create expense claim (POST) ----------------------------------------
  async createExpenseClaim(payload: Record<string, any>): Promise<any> {
    const body = {
      companyId: DEFAULT_COMPANY_ID,
      ...payload,
    };
    const res = await fetch(`${API_BASE_URL}/hr/expense-claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }
    return res.json();
  },

  // ---- Expense claims (status-discriminated) ------------------------------
  async getExpenseClaims(status?: string): Promise<any[]> {
    return toArray(await request(`/hr/expense-claims${withCompany({ status })}`));
  },
  async getMyExpenses(): Promise<any[]> {
    return toArray(await request(`/hr/expense-claims${withCompany({ kind: 'my' })}`));
  },
  async getPendingApprovals(): Promise<any[]> {
    return toArray(
      await request(`/hr/expense-claims${withCompany({ status: 'pending' })}`),
    );
  },
  async getApproved(): Promise<any[]> {
    return toArray(
      await request(`/hr/expense-claims${withCompany({ status: 'approved' })}`),
    );
  },
  async getRejected(): Promise<any[]> {
    return toArray(
      await request(`/hr/expense-claims${withCompany({ status: 'rejected' })}`),
    );
  },

  // ---- Travel -------------------------------------------------------------
  async getTravelRequests(): Promise<any[]> {
    return toArray(await request(`/hr/travel-requests${withCompany()}`));
  },
  async getTravelAdvances(): Promise<any[]> {
    return toArray(await request(`/hr/travel-advances${withCompany()}`));
  },
  async getTravelExpenses(): Promise<any[]> {
    return toArray(
      await request(`/hr/expense-claims${withCompany({ kind: 'travel' })}`),
    );
  },

  // ---- Corporate cards / bookings -----------------------------------------
  async getCorporateCards(): Promise<any[]> {
    return toArray(await request(`/hr/corporate-cards${withCompany()}`));
  },
  async getCardTransactions(category?: string): Promise<any[]> {
    return toArray(
      await request(`/hr/card-transactions${withCompany({ category })}`),
    );
  },
  // Travel bookings (hotel/flight/cab) are card transactions discriminated by
  // category; falls back to an empty list where the backend is stale.
  async getBookings(category: string): Promise<any[]> {
    return toArray(
      await request(`/hr/card-transactions${withCompany({ category })}`),
    );
  },

  // ---- Update expense claim (PUT) -----------------------------------------
  // The expense-claim controller has no dedicated approve/reject routes;
  // status transitions (approve/reject/pay) are applied via PUT.
  async updateExpenseClaim(id: string, body: Record<string, any>): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/hr/expense-claims/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }
    return res.json();
  },

  // ---- Delete expense claim (DELETE) --------------------------------------
  async deleteExpenseClaim(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE_URL}/hr/expense-claims/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }
    return res.json();
  },
};

export default HrExpensesService;
