// Procurement BOM Receipts service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth: procurement/controllers/bom-receipt.controller.ts
//   @Controller('procurement/bom-receipts')

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

export interface BomReceipt {
  id: string;
  companyId: string;
  bomCode: string;
  productName: string;
  submittedBy?: string;
  submittedDate?: string;
  status: string;
  itemsCount: number;
  totalValue: number;
  accessoriesCount: number;
  fittingsCount: number;
  materialsCount: number;
  prNumber?: string;
  poNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UpsertBomReceiptPayload = Partial<
  Omit<BomReceipt, 'id' | 'createdAt' | 'updatedAt'>
> & { bomCode: string; productName: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-company-id': COMPANY_ID,
    },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${path}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export const procurementBomReceiptService = {
  async getReceipts(status?: string): Promise<BomReceipt[]> {
    const qs =
      status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    const data = await request<any>(`/procurement/bom-receipts${qs}`);
    return Array.isArray(data) ? data : data?.data ?? [];
  },

  async createReceipt(payload: UpsertBomReceiptPayload): Promise<BomReceipt> {
    return request<BomReceipt>('/procurement/bom-receipts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateReceipt(
    id: string,
    payload: Partial<UpsertBomReceiptPayload>,
  ): Promise<BomReceipt> {
    return request<BomReceipt>(`/procurement/bom-receipts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteReceipt(id: string): Promise<void> {
    await request<void>(`/procurement/bom-receipts/${id}`, { method: 'DELETE' });
  },
};
