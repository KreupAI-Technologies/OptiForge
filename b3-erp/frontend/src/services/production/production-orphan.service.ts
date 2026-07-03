// Production module — orphan-page wiring service.
// Talks directly to the NestJS domain backend (raw ORM array responses),
// so it uses a plain fetch helper rather than the {success,data}-wrapping apiClient.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function request<T = any>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Each method returns the raw backend array (typed as any[]). Pages apply a
 * defensive transform from the raw ORM shape into their local interface.
 */
export const ProductionOrphanService = {
  // GET production/shortage-records
  getShortageRecords: () => request<any[]>('/production/shortage-records'),

  // GET production/material-requirements
  getMaterialRequirements: () => request<any[]>('/production/material-requirements'),

  // GET production/planned-orders
  getPlannedOrders: () => request<any[]>('/production/planned-orders'),

  // GET production/downtime-records
  getDowntimeRecords: () => request<any[]>('/production/downtime-records'),

  // GET production/maintenance-logs
  getMaintenanceLogs: () => request<any[]>('/production/maintenance-logs'),
};
