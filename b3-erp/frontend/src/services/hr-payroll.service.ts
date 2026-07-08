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

async function sendRequest<T>(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: Record<string, any>,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
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

  async getBonusSchemes(status?: string): Promise<any[]> {
    return toArray(
      await request(`/hr/bonus-schemes${withCompany({ status })}`),
    );
  },

  async getLoanRecoveries(status?: string): Promise<any[]> {
    return toArray(
      await request(`/hr/loan-recoveries${withCompany({ status })}`),
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

  async updateDisbursement(id: string, data: Record<string, any>): Promise<any> {
    return sendRequest(`/hr/payroll-disbursements/${id}`, 'PUT', data);
  },

  async updateStatutoryFiling(id: string, data: Record<string, any>): Promise<any> {
    return sendRequest(`/hr/statutory-filings/${id}`, 'PUT', data);
  },

  async updateTaxRecord(id: string, data: Record<string, any>): Promise<any> {
    return sendRequest(`/hr/tax-records/${id}`, 'PUT', data);
  },

  async createTaxRecord(data: Record<string, any>): Promise<any> {
    return sendRequest(`/hr/tax-records`, 'POST', data);
  },

  async getReports(category?: string): Promise<any[]> {
    return toArray(
      await request(`/hr/payroll-reports${withCompany({ category })}`),
    );
  },

  // ---- Salary structure family --------------------------------------------
  async getSalaryStructures(): Promise<any[]> {
    // NOTE: entity has no companyId column; passing it 500s. Query bare.
    return toArray(await request(`/hr/salary-structures`));
  },
  async getSalaryTemplates(): Promise<any[]> {
    return toArray(await request(`/hr/salary-templates`));
  },
  async getSalaryComponents(): Promise<any[]> {
    return toArray(await request(`/hr/salary-components`));
  },
  async getSalaryAssignments(): Promise<any[]> {
    // Assignments live on salary-structures (employee-assigned structures).
    return toArray(await request(`/hr/salary-structures`));
  },

  // ---- Payroll processing -------------------------------------------------
  async getPayrollCalendar(): Promise<any[]> {
    return toArray(await request(`/hr/payroll-calendar`));
  },
  async getSalarySlips(extra?: Record<string, string | undefined>): Promise<any[]> {
    return toArray(await request(`/hr/salary-slips${withCompany(extra)}`));
  },
  // Employee self-service payslip feed. The salary-slip entity has NO companyId
  // column, so we query bare (companyId would generate an invalid WHERE and
  // 500). Optional filters (employeeCode/status) map to entity columns.
  async getSelfServiceSalarySlips(
    filters: Record<string, string | undefined> = {},
  ): Promise<any[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.set(k, v);
    });
    const q = params.toString();
    return toArray(await request(`/hr/salary-slips${q ? `?${q}` : ''}`));
  },

  // ---- Bonus family (discriminated by category on bonus-records) ----------
  async getBonusRecordsBy(category: string): Promise<any[]> {
    return toArray(
      await request(`/hr/bonus-records${withCompany({ category })}`),
    );
  },

  // ---- Salary revisions (discriminated by category) -----------------------
  async getSalaryRevisionsBy(category?: string): Promise<any[]> {
    return toArray(
      await request(`/hr/salary-revisions${withCompany({ category })}`),
    );
  },

  // ---- Statutory (discriminated by category on statutory-filings / tax) ---
  async getStatutoryBy(category: string): Promise<any[]> {
    return toArray(
      await request(`/hr/statutory-filings${withCompany({ category })}`),
    );
  },
  async getTaxRecordsBy(category?: string): Promise<any[]> {
    return toArray(
      await request(`/hr/tax-records${withCompany({ category })}`),
    );
  },

  // ---- Payroll reports (discriminated by category) ------------------------
  async getReportsBy(category: string): Promise<any[]> {
    return toArray(
      await request(`/hr/payroll-reports${withCompany({ category })}`),
    );
  },

  // ---- Attendance summary orphan endpoints --------------------------------
  // Backs the aggregate attendance pages under /hr/attendance/*. The raw
  // per-day /hr/attendances endpoint is left alone; these summary/rollup pages
  // read the additive discriminator table via /hr/attendance-records.
  async getAttendanceRecords(
    category?: string,
    extra: Record<string, string | undefined> = {},
  ): Promise<any[]> {
    return toArray(
      await request(
        `/hr/attendance-records${withCompany({ category, ...extra })}`,
      ),
    );
  },
};

/**
 * Attendance orphan-endpoint wiring. Thin wrapper over the shared discriminator
 * endpoint /hr/attendance-records for the summary attendance pages
 * (monthly / calendar / biometric / reports).
 */
export const HrAttendanceService = {
  async getMonthly(extra?: Record<string, string | undefined>): Promise<any[]> {
    return HrPayrollService.getAttendanceRecords('monthly', extra);
  },
  async getCalendar(extra?: Record<string, string | undefined>): Promise<any[]> {
    return HrPayrollService.getAttendanceRecords('calendar', extra);
  },
  async getBiometric(extra?: Record<string, string | undefined>): Promise<any[]> {
    return HrPayrollService.getAttendanceRecords('biometric', extra);
  },
  async getReports(extra?: Record<string, string | undefined>): Promise<any[]> {
    return HrPayrollService.getAttendanceRecords('reports', extra);
  },
};

export default HrPayrollService;
