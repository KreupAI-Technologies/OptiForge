// Sales pages service — hits NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'x-company-id': COMPANY_ID },
    ...init,
  });
  if (!res.ok) throw new Error(`Request failed (${res.status}) for ${path}`);
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}
function asArray<T>(d: any): T[] { return Array.isArray(d) ? d : (d?.data ?? []); }

export const salesPagesService = {
  async getQuotations(): Promise<any[]> { return asArray(await request('/sales/quotations')); },
  async getHandovers(): Promise<any[]> { return asArray(await request('/sales/handovers')); },
  async getPaymentTerms(): Promise<any[]> { return asArray(await request('/sales/settings/terms')); },
};
