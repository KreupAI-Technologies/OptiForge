// Procurement Vendor Contracts service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth: procurement/controllers/vendor-contract.controller.ts
//   @Controller('procurement/contracts') -> @Get() findAll

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${path}`);
  }
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
};
