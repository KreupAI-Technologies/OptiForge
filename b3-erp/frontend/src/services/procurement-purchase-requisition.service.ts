// Procurement Purchase Requisition service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth: procurement/controllers/purchase-requisition.controller.ts
//   POST /procurement/purchase-requisitions/:id/submit
//   POST /procurement/purchase-requisitions/:id/convert-to-po

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // send the HttpOnly auth cookie (matches core/api-client)
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${path}`);
  }
  return res.json() as Promise<T>;
}

export const procurementPurchaseRequisitionService = {
  // POST /procurement/purchase-requisitions/:id/submit
  async submitRequisition(id: string): Promise<any> {
    return request<any>(`/procurement/purchase-requisitions/${id}/submit`, {
      method: 'POST',
    });
  },

  // POST /procurement/purchase-requisitions/:id/convert-to-po
  async convertToPO(id: string, poData: Record<string, unknown>): Promise<any> {
    return request<any>(`/procurement/purchase-requisitions/${id}/convert-to-po`, {
      method: 'POST',
      body: JSON.stringify(poData),
    });
  },
};
