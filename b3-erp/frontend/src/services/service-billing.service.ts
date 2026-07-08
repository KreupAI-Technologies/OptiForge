/**
 * Service Billing Service
 * Handles after-sales service billing (invoices, payments, revenue) API operations.
 * Backend: NestJS @Controller('after-sales/billing')
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface ServiceInvoiceFilters {
  status?: string;
  invoiceType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class ServiceBillingService {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all service invoices. Returns the raw ORM shape; callers should map
   * defensively into their own view models.
   */
  static async getAllInvoices(filters?: ServiceInvoiceFilters): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.invoiceType) params.append('invoiceType', filters.invoiceType);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    const qs = params.toString();
    const data = await this.request<any>(`/after-sales/billing/invoices${qs ? `?${qs}` : ''}`);
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  }

  /** Get overdue service invoices. */
  static async getOverdueInvoices(): Promise<any[]> {
    const data = await this.request<any>('/after-sales/billing/invoices/overdue');
    return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  }

  /** Get recorded payments. */
  static async getPayments(): Promise<any[]> {
    const data = await this.request<any>('/after-sales/billing/payments');
    return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  }

  /** Send an invoice to the customer (POST invoices/:id/send). */
  static async sendInvoice(id: string, sentBy = 'system'): Promise<any> {
    return this.request<any>(`/after-sales/billing/invoices/${id}/send`, {
      method: 'POST',
      body: JSON.stringify({ sentBy }),
    });
  }

  /** Record a payment against an invoice (POST invoices/:id/record-payment). */
  static async recordPayment(
    id: string,
    payment: {
      amount: number;
      paymentMethod: string;
      paymentReference?: string;
      paymentDate?: string;
      notes?: string;
      recordedBy?: string;
    },
  ): Promise<any> {
    return this.request<any>(`/after-sales/billing/invoices/${id}/record-payment`, {
      method: 'POST',
      body: JSON.stringify({
        recordedBy: 'system',
        paymentDate: new Date().toISOString(),
        ...payment,
      }),
    });
  }
}
