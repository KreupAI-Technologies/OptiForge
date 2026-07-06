// Procurement Purchase Invoices service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth: procurement/controllers/purchase-invoice.controller.ts
//   @Controller('procurement/purchase-invoices') -> @Get() findAll

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

// Raw ORM shape is loosely typed; the page transforms it into its view model.
export const procurementPurchaseInvoiceService = {
  // GET /procurement/purchase-invoices -> PurchaseInvoice[]
  async getInvoices(): Promise<any[]> {
    const data = await request<any>('/procurement/purchase-invoices');
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  // GET /procurement/purchase-invoices/:id -> PurchaseInvoice
  async getInvoiceById(id: string): Promise<any> {
    return request<any>(`/procurement/purchase-invoices/${encodeURIComponent(id)}`);
  },
};
