/**
 * Customer Portal Service
 *
 * Typed client for the customer-facing portal pages under
 * src/app/(modules)/portal/*. Talks to the NestJS domain backend
 * (port 3001, /api/v1) with the x-company-id header.
 *
 * The sales-order controller is mounted at `api/v1/sales/orders`, and the
 * app already applies a global `api/v1` prefix, so its effective path is
 * `/api/v1/api/v1/sales/orders` (double prefix). Reads are defensive and
 * always resolve to an array.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', 'x-company-id': 'test' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

function toArray<T = any>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) {
    return (raw as any).data as T[];
  }
  return [];
}

export interface PortalOrderItem {
  id: string;
  orderNumber?: string;
  orderDate?: string;
  status?: string;
  customerName?: string;
  subtotal?: number | string;
  totalAmount?: number | string;
  currency?: string;
  paymentStatus?: string;
  requestedDeliveryDate?: string;
  items?: Array<{ itemName?: string; quantity?: number }>;
  [key: string]: any;
}

export interface PortalDocumentItem {
  id: string;
  name?: string;
  docType?: string; // 'folder' | 'file'
  category?: string;
  customerId?: string;
  parentId?: string;
  sizeBytes?: number | string;
  itemCount?: number;
  downloadUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const PortalService = {
  /** Customer orders — reuses the sales-order list (double-prefixed path). */
  async getOrders(): Promise<PortalOrderItem[]> {
    return toArray<PortalOrderItem>(await getJson('/api/v1/sales/orders'));
  },

  /** Customer-portal documents (folders + files) from the additive portal module. */
  async getDocuments(): Promise<PortalDocumentItem[]> {
    return toArray<PortalDocumentItem>(await getJson('/portal/documents'));
  },
};
