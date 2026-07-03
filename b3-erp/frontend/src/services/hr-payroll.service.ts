/**
 * HR Payroll Service (orphan-endpoint wiring)
 *
 * Typed client for the payroll pages under src/app/hr/payroll/*. Talks to the
 * NestJS domain backend (port 3001, /api/v1). Existing endpoints (loans,
 * advances, payrolls) are reused; the rest map to the additive orphan
 * endpoints (statutory-filings, tax-records, bonus-records, salary-revisions,
 * payroll-disbursements, payroll-reports).
 *
 * Every list call is defensive: it accepts either a raw array or a paginated
 * `{ data: [] }` envelope and always resolves to an array.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// The domain backend scopes reads by companyId. A single default keeps the
// mock-only pages working without threading tenant context through every page.
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

/** Coerce any list-ish backend response into a plain array. */
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

export const HrPayrollService = {
  // ---- Reused existing endpoints ------------------------------------------
  async getLoans(): Promise<any[]> {
    return toArray(await request(`/hr/loans${withCompany()}`));
  },

  async getAdvances(): Promise<any[]> {
    return toArray(await request(`/hr/advances${withCompany()}`));
  },

  async getPayrollRuns(): Promise<any[]> {
    return toArray(await request(`/hr/payrolls${withCompany()}`));
  },

  // ---- Additive orphan endpoints ------------------------------------------
  async getStatutoryFilings(category?: string): Promise<any[]> {
    return toArray(
      await request(`/hr/statutory-filings${withCompany({ category })}`),
    );
  },

  async getTaxRecords(category?: string): Promise<any[]> {
    return toArray(
      await request(`/hr/tax-records${withCompany({ category })}`),
    );
  },

  async getBonusRecords(category?: string): Promise<any[]> {
    return toArray(
      await request(`/hr/bonus-records${withCompany({ category })}`),
    );
  },

  async getSalaryRevisions(category?: string): Promise<any[]> {
    return toArray(
      await request(`/hr/salary-revisions${withCompany({ category })}`),
    );
  },

  async getDisbursements(category?: string): Promise<any[]> {
    return toArray(
      await request(`/hr/payroll-disbursements${withCompany({ category })}`),
    );
  },

  async getReports(category?: string): Promise<any[]> {
    return toArray(
      await request(`/hr/payroll-reports${withCompany({ category })}`),
    );
  },
};

export default HrPayrollService;
