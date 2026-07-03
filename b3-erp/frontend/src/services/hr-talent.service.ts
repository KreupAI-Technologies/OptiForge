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
}
