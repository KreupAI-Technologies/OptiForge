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
    cache: 'no-store',
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
}
