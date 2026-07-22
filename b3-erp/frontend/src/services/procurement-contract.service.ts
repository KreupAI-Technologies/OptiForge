// Procurement Vendor Contracts service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth: procurement/controllers/vendor-contract.controller.ts
//   @Controller('procurement/contracts') -> @Get() findAll

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${path}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// Raw ORM shape returned by the backend is loosely typed; pages transform it
// defensively into their own view models.
export const procurementContractService = {
  // GET /procurement/contracts -> VendorContract[]
  async getContracts(): Promise<any[]> {
    const data = await request<any>('/procurement/contracts');
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  // POST /procurement/contracts
  async createContract(payload: Record<string, unknown>): Promise<any> {
    return request<any>('/procurement/contracts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // PUT /procurement/contracts/:id
  async updateContract(id: string, payload: Record<string, unknown>): Promise<any> {
    return request<any>(`/procurement/contracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // DELETE /procurement/contracts/:id (hard delete)
  async deleteContract(id: string): Promise<void> {
    await request<void>(`/procurement/contracts/${id}`, { method: 'DELETE' });
  },

  // POST /procurement/contracts/:id/submit
  async submitContract(id: string): Promise<any> {
    return request<any>(`/procurement/contracts/${id}/submit`, { method: 'POST' });
  },

  // POST /procurement/contracts/:id/approve
  async approveContract(id: string): Promise<any> {
    return request<any>(`/procurement/contracts/${id}/approve`, { method: 'POST' });
  },

  // POST /procurement/contracts/:id/terminate
  async terminateContract(id: string, payload: Record<string, unknown> = {}): Promise<any> {
    return request<any>(`/procurement/contracts/${id}/terminate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // POST /procurement/contracts/:id/renew
  async renewContract(id: string, payload: Record<string, unknown> = {}): Promise<any> {
    return request<any>(`/procurement/contracts/${id}/renew`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
