// HR Movements Service
// Handles employee transfers & promotions API calls (NestJS domain backend).

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface EmployeeMovement {
  id: string;
  companyId?: string;
  employeeCode: string;
  name: string;
  type: 'promotion' | 'transfer' | 'both';
  fromDesignation: string;
  toDesignation: string;
  fromDepartment: string;
  toDepartment: string;
  fromLocation: string;
  toLocation: string;
  effectiveDate: string;
  requestDate: string;
  requestedBy: string;
  approvedBy?: string;
  reason: string;
  salaryIncrement?: number;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
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

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

export class HrMovementsService {
  static async getTransfersPromotions(params?: {
    companyId?: string;
    type?: string;
    status?: string;
    search?: string;
  }): Promise<EmployeeMovement[]> {
    const query = new URLSearchParams();
    query.set('companyId', params?.companyId || 'company-1');
    if (params?.type && params.type !== 'all') query.set('type', params.type);
    if (params?.status && params.status !== 'all')
      query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const data = await getJson<EmployeeMovement[]>(
      `/hr/transfers-promotions?${query.toString()}`,
    );
    return Array.isArray(data) ? data : [];
  }

  static async createTransferPromotion(
    payload: Partial<EmployeeMovement> & { companyId?: string },
  ): Promise<EmployeeMovement> {
    return postJson<EmployeeMovement>('/hr/transfers-promotions', {
      companyId: payload.companyId || 'company-1',
      status: 'pending',
      ...payload,
    });
  }
}
