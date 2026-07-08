// HR Talent Service
// Backs the previously mock-only pages under /hr/succession, /hr/probation and
// /hr/performance against the NestJS domain backend (port 3001, /api/v1).
//
// Backend uses three flexible tables keyed by a `recordType` discriminator with
// a jsonb `data` column that mirrors each page's row shape. Each GET returns
// records for a given recordType; the frontend reads `record.data` (falling
// back to the record itself) to obtain the row it renders.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface HrTalentRecord<T = Record<string, any>> {
  id: string;
  companyId: string;
  recordType: string;
  title?: string;
  status?: string;
  employeeCode?: string;
  data?: T;
  createdAt?: string;
  updatedAt?: string;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

/**
 * Fetch records of a given recordType and unwrap the jsonb `data` payload
 * (which mirrors the page's row model). Records without `data` are returned
 * as-is so callers still get a usable object.
 */
async function getRows<T = Record<string, any>>(
  base: string,
  recordType: string,
  companyId: string,
): Promise<T[]> {
  const raw = await getJson<HrTalentRecord<T>[]>(
    `${base}?companyId=${encodeURIComponent(companyId)}&recordType=${encodeURIComponent(recordType)}`,
  );
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => ({
    id: r.id,
    ...(r.data ?? {}),
  })) as unknown as T[];
}

export class HrTalentService {
  // --- Succession (/hr/succession/*) ---
  static getSuccession<T = Record<string, any>>(
    recordType: string,
    companyId = 'company-1',
  ): Promise<T[]> {
    return getRows<T>('/hr/succession-plans', recordType, companyId);
  }

  // --- Probation (/hr/probation/*) ---
  static getProbation<T = Record<string, any>>(
    recordType: string,
    companyId = 'company-1',
  ): Promise<T[]> {
    return getRows<T>('/hr/probation-reviews', recordType, companyId);
  }

  // --- Performance goals / KPI / feedback (/hr/performance/*) ---
  static getPerformance<T = Record<string, any>>(
    recordType: string,
    companyId = 'company-1',
  ): Promise<T[]> {
    return getRows<T>('/hr/performance-goals', recordType, companyId);
  }

  // --- Succession create (POST /hr/succession-plans) ---
  // The backend stores each row as { companyId, recordType, title, status, data }
  // where `data` is the full page row shape. Callers pass the row model in `data`.
  static async createSuccession<T = Record<string, any>>(
    data: T,
    opts: { recordType?: string; companyId?: string; title?: string; status?: string } = {},
  ): Promise<HrTalentRecord<T>> {
    const res = await fetch(`${API_BASE_URL}/hr/succession-plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: opts.companyId ?? 'company-1',
        recordType: opts.recordType ?? 'plan',
        title: opts.title,
        status: opts.status,
        data,
      }),
    });
    if (!res.ok) {
      throw new Error(`Request failed (${res.status})`);
    }
    return res.json();
  }

  // --- Probation create/update (POST/PUT /hr/probation-reviews[/:id]) ---
  // Rows are stored as { companyId, recordType, employeeCode, status, data }
  // where `data` mirrors the page row model. `getProbation` returns { id, ...data },
  // so the row's `id` is the DB row id used for updates.
  static async createProbation<T = Record<string, any>>(
    data: T,
    opts: { recordType?: string; companyId?: string; employeeCode?: string; status?: string } = {},
  ): Promise<HrTalentRecord<T>> {
    const res = await fetch(`${API_BASE_URL}/hr/probation-reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: opts.companyId ?? 'company-1',
        recordType: opts.recordType ?? 'tracking',
        employeeCode: opts.employeeCode,
        status: opts.status,
        data,
      }),
    });
    if (!res.ok) {
      throw new Error(`Request failed (${res.status})`);
    }
    return res.json();
  }

  static async updateProbation<T = Record<string, any>>(
    id: string,
    payload: { data?: Partial<T>; status?: string; employeeCode?: string },
  ): Promise<HrTalentRecord<T>> {
    const res = await fetch(`${API_BASE_URL}/hr/probation-reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`Request failed (${res.status})`);
    }
    return res.json();
  }

  // --- Performance goals create/update (POST/PUT /hr/performance-goals[/:id]) ---
  static async createPerformance<T = Record<string, any>>(
    data: T,
    opts: { recordType?: string; companyId?: string; employeeCode?: string; status?: string } = {},
  ): Promise<HrTalentRecord<T>> {
    const res = await fetch(`${API_BASE_URL}/hr/performance-goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: opts.companyId ?? 'company-1',
        recordType: opts.recordType ?? 'my-goal',
        employeeCode: opts.employeeCode,
        status: opts.status,
        data,
      }),
    });
    if (!res.ok) {
      throw new Error(`Request failed (${res.status})`);
    }
    return res.json();
  }

  static async updatePerformance<T = Record<string, any>>(
    id: string,
    payload: { data?: Partial<T>; status?: string; employeeCode?: string },
  ): Promise<HrTalentRecord<T>> {
    const res = await fetch(`${API_BASE_URL}/hr/performance-goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`Request failed (${res.status})`);
    }
    return res.json();
  }
}
