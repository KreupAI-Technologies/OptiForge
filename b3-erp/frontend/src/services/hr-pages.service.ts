/**
 * HR Pages Service
 * Thin fetch wrapper backing the remaining HR mock-only pages
 * (employees, leave, training, expenses, compliance, shifts, timesheets).
 *
 * All endpoints live on the NestJS domain backend under /api/v1 and return
 * raw JSON arrays (no { data } envelope). Tenant scoping via the
 * `x-company-id` header + a `companyId` query param (backend accepts either).
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
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-company-id': companyId,
      ...options?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`HR API error ${response.status}: ${response.statusText}`);
  }
  // Some list endpoints may 204 or return empty body defensively.
  const text = await response.text();
  return (text ? JSON.parse(text) : []) as T;
}

export class HrPagesService {
  // ---- Employees ---------------------------------------------------------
  static employees<T = any[]>(): Promise<T> {
    return request<T>('/hr/employees');
  }
  static createEmployee<T = any>(payload: Record<string, unknown>): Promise<T> {
    return request<T>('/hr/employees', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
  static departments<T = any[]>(): Promise<T> {
    return request<T>('/hr/departments');
  }
  static designations<T = any[]>(): Promise<T> {
    return request<T>('/hr/designations');
  }
  static teams<T = any[]>(): Promise<T> {
    return request<T>('/hr/teams');
  }
  static createDepartment<T = any>(payload: Record<string, unknown>): Promise<T> {
    return request<T>('/hr/departments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
  static updateDepartment<T = any>(id: string, payload: Record<string, unknown>): Promise<T> {
    return request<T>(`/hr/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }
  static deleteDepartment<T = any>(id: string): Promise<T> {
    return request<T>(`/hr/departments/${id}`, { method: 'DELETE' });
  }
  static createDesignation<T = any>(payload: Record<string, unknown>): Promise<T> {
    return request<T>('/hr/designations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
  static updateDesignation<T = any>(id: string, payload: Record<string, unknown>): Promise<T> {
    return request<T>(`/hr/designations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }
  static deleteDesignation<T = any>(id: string): Promise<T> {
    return request<T>(`/hr/designations/${id}`, { method: 'DELETE' });
  }
  static createTeam<T = any>(payload: Record<string, unknown>): Promise<T> {
    return request<T>('/hr/teams', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ---- Leave -------------------------------------------------------------
  static leaveApplications<T = any[]>(): Promise<T> {
    return request<T>('/hr/leave-applications');
  }
  static leaveTypes<T = any[]>(): Promise<T> {
    return request<T>('/hr/leave-types');
  }
  static leaveEncashments<T = any[]>(): Promise<T> {
    return request<T>('/hr/leave-encashments');
  }

  // ---- Training ----------------------------------------------------------
  static trainingPrograms<T = any[]>(): Promise<T> {
    return request<T>('/hr/training-programs');
  }
  static trainingEnrollments<T = any[]>(): Promise<T> {
    return request<T>('/hr/training-enrollments');
  }
  static elearningCourses<T = any[]>(): Promise<T> {
    return request<T>('/hr/elearning-courses');
  }
  static skillAssessments<T = any[]>(): Promise<T> {
    return request<T>('/hr/skill-assessments');
  }
  static skills<T = any[]>(): Promise<T> {
    return request<T>('/hr/skills');
  }
  static userSkills<T = any[]>(): Promise<T> {
    return request<T>('/hr/user-skills');
  }

  // ---- Performance -------------------------------------------------------
  static performanceGoals<T = any[]>(recordType?: string): Promise<T> {
    return request<T>(
      recordType
        ? `/hr/performance-goals?recordType=${encodeURIComponent(recordType)}`
        : '/hr/performance-goals',
    );
  }
  static performanceReviews<T = any[]>(): Promise<T> {
    return request<T>('/hr/performance-reviews');
  }

  // ---- Travel ------------------------------------------------------------
  static travelRequests<T = any[]>(): Promise<T> {
    return request<T>('/hr/travel-requests');
  }
  static travelAdvances<T = any[]>(): Promise<T> {
    return request<T>('/hr/travel-advances');
  }

  // ---- Expenses ----------------------------------------------------------
  static expenseClaims<T = any[]>(): Promise<T> {
    return request<T>('/hr/expense-claims');
  }
  static perDiemRates<T = any[]>(): Promise<T> {
    return request<T>('/hr/per-diem-rates');
  }
  static expenseBudgets<T = any[]>(): Promise<T> {
    return request<T>('/hr/expense-budgets');
  }

  // ---- Compliance --------------------------------------------------------
  static complianceReturns<T = any[]>(): Promise<T> {
    return request<T>('/hr/compliance-returns');
  }
  static policyAcknowledgments<T = any[]>(): Promise<T> {
    return request<T>('/hr/policy-acknowledgments');
  }

  // ---- Shifts ------------------------------------------------------------
  static shifts<T = any[]>(): Promise<T> {
    return request<T>('/hr/shifts');
  }
  static createShift<T = any>(payload: Record<string, unknown>): Promise<T> {
    return request<T>('/hr/shifts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ---- Timesheets --------------------------------------------------------
  static timesheets<T = any[]>(): Promise<T> {
    return request<T>('/hr/timesheets');
  }
  static createAttendanceRecord<T = any>(payload: Record<string, unknown>): Promise<T> {
    return request<T>('/hr/attendance-records', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ---- Per-diem rates (CRUD) ---------------------------------------------
  static createPerDiemRate<T = any>(payload: Record<string, unknown>): Promise<T> {
    return request<T>('/hr/per-diem-rates', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
  static updatePerDiemRate<T = any>(id: string, payload: Record<string, unknown>): Promise<T> {
    return request<T>(`/hr/per-diem-rates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }
  static deletePerDiemRate<T = any>(id: string): Promise<T> {
    return request<T>(`/hr/per-diem-rates/${id}`, {
      method: 'DELETE',
    });
  }

  // ---- Training mutations (create/update) --------------------------------
  static createTrainingProgram<T = any>(payload: Record<string, unknown>): Promise<T> {
    return request<T>('/hr/training-programs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
  static createTrainingEnrollment<T = any>(payload: Record<string, unknown>): Promise<T> {
    return request<T>('/hr/training-enrollments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
  static updateTrainingEnrollment<T = any>(id: string, payload: Record<string, unknown>): Promise<T> {
    return request<T>(`/hr/training-enrollments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }
  static createSkillAssessment<T = any>(payload: Record<string, unknown>): Promise<T> {
    return request<T>('/hr/skill-assessments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /** Generic escape hatch for one-off endpoints. */
  static get<T = any[]>(path: string): Promise<T> {
    return request<T>(path.startsWith('/') ? path : `/${path}`);
  }

  // ---- Performance review mutations (create) -----------------------------
  static createPerformanceReview<T = any>(payload: Record<string, unknown>): Promise<T> {
    return request<T>('/hr/performance-reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}
