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
}
