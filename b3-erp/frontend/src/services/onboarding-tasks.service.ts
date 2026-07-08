// Onboarding & Offboarding Tasks Service
// Wires the previously mock-only pages under /hr/onboarding and /hr/offboarding
// to the NestJS domain backend. Two shared endpoints keyed by a `feature`
// discriminator; feature-specific scalar fields live in `data`, nested lists
// in `items`.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface OnboardingTaskRecord {
  id: string;
  companyId?: string;
  feature: string;
  employeeCode?: string;
  employeeName?: string;
  designation?: string;
  department?: string;
  joiningDate?: string;
  status: string;
  data?: Record<string, any> | null;
  items?: any[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface OffboardingTaskRecord {
  id: string;
  companyId?: string;
  feature: string;
  employeeCode?: string;
  employeeName?: string;
  designation?: string;
  department?: string;
  status: string;
  data?: Record<string, any> | null;
  items?: any[] | null;
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

async function sendJson<T>(
  path: string,
  method: 'POST' | 'PUT' | 'DELETE',
  body?: Record<string, any>,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

function buildQuery(feature: string, companyId?: string): string {
  const q = new URLSearchParams();
  q.set('companyId', companyId || 'company-1');
  q.set('feature', feature);
  return q.toString();
}

export class OnboardingTasksService {
  static async list(
    feature: string,
    companyId?: string,
  ): Promise<OnboardingTaskRecord[]> {
    const data = await getJson<OnboardingTaskRecord[]>(
      `/hr/onboarding-tasks?${buildQuery(feature, companyId)}`,
    );
    return Array.isArray(data) ? data : [];
  }

  static async create(
    body: Partial<OnboardingTaskRecord> & { feature: string; companyId?: string },
  ): Promise<OnboardingTaskRecord> {
    return sendJson<OnboardingTaskRecord>('/hr/onboarding-tasks', 'POST', {
      companyId: 'company-1',
      ...body,
    });
  }

  static async update(
    id: string,
    body: Partial<OnboardingTaskRecord>,
  ): Promise<OnboardingTaskRecord> {
    return sendJson<OnboardingTaskRecord>(`/hr/onboarding-tasks/${id}`, 'PUT', body);
  }

  static async remove(id: string): Promise<{ success: boolean }> {
    return sendJson<{ success: boolean }>(`/hr/onboarding-tasks/${id}`, 'DELETE');
  }
}

export class OffboardingTasksService {
  static async list(
    feature: string,
    companyId?: string,
  ): Promise<OffboardingTaskRecord[]> {
    const data = await getJson<OffboardingTaskRecord[]>(
      `/hr/offboarding-tasks?${buildQuery(feature, companyId)}`,
    );
    return Array.isArray(data) ? data : [];
  }

  static async create(
    body: Partial<OffboardingTaskRecord> & { feature: string; companyId?: string },
  ): Promise<OffboardingTaskRecord> {
    return sendJson<OffboardingTaskRecord>('/hr/offboarding-tasks', 'POST', {
      companyId: 'company-1',
      ...body,
    });
  }

  static async update(
    id: string,
    body: Partial<OffboardingTaskRecord>,
  ): Promise<OffboardingTaskRecord> {
    return sendJson<OffboardingTaskRecord>(`/hr/offboarding-tasks/${id}`, 'PUT', body);
  }

  static async remove(id: string): Promise<{ success: boolean }> {
    return sendJson<{ success: boolean }>(`/hr/offboarding-tasks/${id}`, 'DELETE');
  }
}
