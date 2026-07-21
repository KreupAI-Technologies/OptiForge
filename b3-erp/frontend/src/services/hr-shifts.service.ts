// HR Shifts Service
// Handles shift assignment, roster and swap API calls (NestJS domain backend).

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface ShiftAssignment {
  id: string;
  companyId: string;
  employeeId?: string;
  employeeName?: string;
  department?: string;
  shiftCode?: string;
  shiftName?: string;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  status?: string;
  assignedBy?: string;
  assignedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShiftRosterEntry {
  id: string;
  companyId: string;
  employeeId?: string;
  employeeName?: string;
  department?: string;
  weekStart?: string;
  shifts?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShiftSwap {
  id: string;
  companyId: string;
  requesterId?: string;
  requesterName?: string;
  requesterDepartment?: string;
  requesterShift?: string;
  requesterDate?: string;
  targetId?: string;
  targetName?: string;
  targetDepartment?: string;
  targetShift?: string;
  targetDate?: string;
  reason?: string;
  status?: string;
  requestDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

async function putJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

async function deleteJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

export class HrShiftsService {
  static async getShiftAssignments(companyId = 'company-1'): Promise<ShiftAssignment[]> {
    const data = await getJson<ShiftAssignment[]>(
      `/hr/shift-assignments?companyId=${encodeURIComponent(companyId)}`,
    );
    return Array.isArray(data) ? data : [];
  }

  static async getShiftRoster(companyId = 'company-1'): Promise<ShiftRosterEntry[]> {
    const data = await getJson<ShiftRosterEntry[]>(
      `/hr/shift-roster?companyId=${encodeURIComponent(companyId)}`,
    );
    return Array.isArray(data) ? data : [];
  }

  static async getShiftSwaps(companyId = 'company-1'): Promise<ShiftSwap[]> {
    const data = await getJson<ShiftSwap[]>(
      `/hr/shift-swaps?companyId=${encodeURIComponent(companyId)}`,
    );
    return Array.isArray(data) ? data : [];
  }

  static async createShiftAssignment(
    payload: Partial<ShiftAssignment> & { companyId?: string },
  ): Promise<ShiftAssignment> {
    return postJson<ShiftAssignment>('/hr/shift-assignments', {
      companyId: 'company-1',
      ...payload,
    });
  }

  static async deleteShiftAssignment(id: string): Promise<{ success: boolean }> {
    return deleteJson<{ success: boolean }>(`/hr/shift-assignments/${id}`);
  }

  static async updateShiftSwap(
    id: string,
    payload: Partial<ShiftSwap>,
  ): Promise<ShiftSwap> {
    return putJson<ShiftSwap>(`/hr/shift-swaps/${encodeURIComponent(id)}`, payload);
  }

  static async approveShiftSwap(id: string, approvedBy?: string): Promise<ShiftSwap> {
    return HrShiftsService.updateShiftSwap(id, {
      status: 'Approved',
      approvedBy,
      approvedDate: new Date().toISOString(),
    });
  }

  static async rejectShiftSwap(id: string, approvedBy?: string): Promise<ShiftSwap> {
    return HrShiftsService.updateShiftSwap(id, {
      status: 'Rejected',
      approvedBy,
      approvedDate: new Date().toISOString(),
    });
  }
}
