// Procurement pages service — hits NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
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

export const procurementPagesService = {
  async getPurchaseOrders(): Promise<any[]> { return asArray(await request('/procurement/purchase-orders')); },
  async getVendors(): Promise<any[]> { return asArray(await request('/procurement/vendors')); },
  async getRfqs(): Promise<any[]> { return asArray(await request('/procurement/rfqs')); },
  async getPurchaseInvoices(): Promise<any[]> { return asArray(await request('/procurement/purchase-invoices')); },

  // ---- Vendor lifecycle actions (procurement/vendors/:id/*) ----
  async approveVendor(id: string): Promise<any> {
    return request(`/procurement/vendors/${id}/approve`, { method: 'POST' });
  },
  async updateVendor(id: string, data: Record<string, any>): Promise<any> {
    return request(`/procurement/vendors/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  async requestVendorDocuments(
    id: string,
    payload: { documents?: string[]; message?: string; dueDate?: string; requestedBy?: string } = {},
  ): Promise<any> {
    return request(`/procurement/vendors/${id}/request-documents`, { method: 'POST', body: JSON.stringify(payload) });
  },
  async completeVendorOnboarding(
    id: string,
    payload: { completedBy?: string; notes?: string } = {},
  ): Promise<any> {
    return request(`/procurement/vendors/${id}/complete-onboarding`, { method: 'POST', body: JSON.stringify(payload) });
  },

  // ---- Strategic Sourcing strategies (procurement/sourcing-strategies) ----
  async getSourcingStrategies(): Promise<any[]> { return asArray(await request('/procurement/sourcing-strategies')); },
  async createSourcingStrategy(data: Record<string, any>): Promise<any> {
    return request('/procurement/sourcing-strategies', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateSourcingStrategy(id: string, data: Record<string, any>): Promise<any> {
    return request(`/procurement/sourcing-strategies/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  // ---- E-Marketplace: place order -> creates a Purchase Requisition ----
  async placeMarketplaceOrder(cartItems: any[], meta: { purpose?: string; requesterId?: string; requesterName?: string; department?: string } = {}): Promise<any> {
    const today = new Date();
    const requiredBy = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const items = cartItems.map((item, idx) => {
      const qty = Number(item.quantity ?? item.minOrder ?? 1);
      const unitPrice = Number(item.price ?? item.unitPrice ?? 0);
      return {
        lineNumber: idx + 1,
        itemId: String(item.id ?? item.sku ?? `item-${idx + 1}`),
        itemCode: String(item.sku ?? item.id ?? `SKU-${idx + 1}`),
        itemName: String(item.name ?? 'Marketplace Item'),
        description: String(item.description ?? item.name ?? ''),
        uom: String(item.unit ?? 'EA'),
        quantity: qty,
        estimatedUnitPrice: unitPrice,
        estimatedTotal: Number((qty * unitPrice).toFixed(2)),
        requiredDate: requiredBy.toISOString().split('T')[0],
      };
    });
    const payload = {
      prDate: today.toISOString().split('T')[0],
      requiredByDate: requiredBy.toISOString().split('T')[0],
      priority: 'Medium',
      prType: 'Standard',
      requesterId: meta.requesterId ?? 'marketplace-user',
      requesterName: meta.requesterName ?? 'E-Marketplace Buyer',
      department: meta.department ?? 'Procurement',
      items,
      purpose: meta.purpose ?? 'E-Marketplace cart checkout',
    };
    return request('/procurement/purchase-requisitions', { method: 'POST', body: JSON.stringify(payload) });
  },

  // ---- PO approval actions (procurement/purchase-orders/:id/*) ----
  async delegatePurchaseOrder(id: string, payload: { delegatedTo: string; delegatedBy?: string; notes?: string }): Promise<any> {
    return request(`/procurement/purchase-orders/${id}/delegate`, { method: 'POST', body: JSON.stringify(payload) });
  },
  async requestInfoPurchaseOrder(id: string, payload: { message: string; requestedBy?: string }): Promise<any> {
    return request(`/procurement/purchase-orders/${id}/request-info`, { method: 'POST', body: JSON.stringify(payload) });
  },
  async bulkImportPurchaseOrder(rows: any[], meta?: Record<string, any>): Promise<any> {
    return request('/procurement/purchase-orders/bulk-import', { method: 'POST', body: JSON.stringify({ rows, meta }) });
  },

  // ---- PR approval actions (procurement/purchase-requisitions/:id/*) ----
  async requestInfoPurchaseRequisition(id: string, payload: { message: string; requestedBy?: string }): Promise<any> {
    return request(`/procurement/purchase-requisitions/${id}/request-info`, { method: 'POST', body: JSON.stringify(payload) });
  },

  // ---- GRN invoice matching (procurement/goods-receipts/:id/match-invoice) ----
  async matchGrnInvoice(id: string, payload: { invoiceId?: string; invoiceNumber?: string; matchedBy?: string; notes?: string }): Promise<any> {
    return request(`/procurement/goods-receipts/${id}/match-invoice`, { method: 'POST', body: JSON.stringify(payload) });
  },

  // ---- Dashboard insights (procurement/insights/*) ----
  async getAnalyticsInsights(): Promise<any> { return request('/procurement/insights/analytics'); },
  async getAutomationInsights(): Promise<any> { return request('/procurement/insights/automation'); },
  async getComplianceInsights(): Promise<any> { return request('/procurement/insights/compliance'); },
  async getRiskInsights(): Promise<any> { return request('/procurement/insights/risk'); },
  async getDiversityInsights(): Promise<any> { return request('/procurement/insights/diversity'); },
  async getQualityAssuranceInsights(): Promise<any> { return request('/procurement/insights/quality-assurance'); },
  async getStrategicSourcingInsights(): Promise<any> { return request('/procurement/insights/strategic-sourcing'); },
  async getMarketplaceInsights(): Promise<any> { return request('/procurement/insights/marketplace'); },
  async getBudgetInsights(): Promise<any> { return request('/procurement/insights/budget'); },
  async getSavingsInsights(): Promise<any> { return request('/procurement/insights/savings'); },

  // ---- Supplier Portal (procurement/supplier-portal/*) ----
  async getSupplierPortalSuppliers(): Promise<any[]> { return asArray(await request('/procurement/supplier-portal/suppliers')); },
  async getSupplierPortalMessages(supplierId?: string): Promise<any[]> {
    const qs = supplierId ? `?supplierId=${encodeURIComponent(supplierId)}` : '';
    return asArray(await request(`/procurement/supplier-portal/messages${qs}`));
  },
  async createSupplierPortalMessage(data: Record<string, any>): Promise<any> {
    return request('/procurement/supplier-portal/messages', { method: 'POST', body: JSON.stringify(data) });
  },
  async getSupplierPortalDocuments(supplierId?: string): Promise<any[]> {
    const qs = supplierId ? `?supplierId=${encodeURIComponent(supplierId)}` : '';
    return asArray(await request(`/procurement/supplier-portal/documents${qs}`));
  },
  async createSupplierPortalDocument(data: Record<string, any>): Promise<any> {
    return request('/procurement/supplier-portal/documents', { method: 'POST', body: JSON.stringify(data) });
  },
  // Real PO rows for a supplier (procurement/supplier-portal/purchase-orders).
  async getSupplierPortalPurchaseOrders(supplierId: string): Promise<any[]> {
    return asArray(await request(`/procurement/supplier-portal/purchase-orders?supplierId=${encodeURIComponent(supplierId)}`));
  },
  // Supplier-facing invoice submission (procurement/supplier-portal/invoices).
  async getSupplierInvoices(supplierId?: string): Promise<any[]> {
    const qs = supplierId ? `?supplierId=${encodeURIComponent(supplierId)}` : '';
    return asArray(await request(`/procurement/supplier-portal/invoices${qs}`));
  },
  async createSupplierInvoice(data: Record<string, any>): Promise<any> {
    return request('/procurement/supplier-portal/invoices', { method: 'POST', body: JSON.stringify(data) });
  },
  // Supplier-facing quote submission (procurement/supplier-portal/quotes).
  async getSupplierQuotes(supplierId?: string): Promise<any[]> {
    const qs = supplierId ? `?supplierId=${encodeURIComponent(supplierId)}` : '';
    return asArray(await request(`/procurement/supplier-portal/quotes${qs}`));
  },
  async createSupplierQuote(data: Record<string, any>): Promise<any> {
    return request('/procurement/supplier-portal/quotes', { method: 'POST', body: JSON.stringify(data) });
  },
  // Supplier catalog upsert (procurement/supplier-portal/catalog).
  async getSupplierCatalog(supplierId?: string): Promise<any[]> {
    const qs = supplierId ? `?supplierId=${encodeURIComponent(supplierId)}` : '';
    return asArray(await request(`/procurement/supplier-portal/catalog${qs}`));
  },
  async upsertSupplierCatalogItem(data: Record<string, any>): Promise<any> {
    return request('/procurement/supplier-portal/catalog', { method: 'POST', body: JSON.stringify(data) });
  },

  // ---- Vendor Quotations (procurement/vendor-quotations) — supplier-facing quote submission ----
  async createVendorQuotation(data: Record<string, any>): Promise<any> {
    return request('/procurement/vendor-quotations', { method: 'POST', body: JSON.stringify(data) });
  },

  // ---- Purchase Invoices (procurement/purchase-invoices) — supplier-facing invoice creation ----
  async createPurchaseInvoice(data: Record<string, any>): Promise<any> {
    return request('/procurement/purchase-invoices', { method: 'POST', body: JSON.stringify(data) });
  },
  async getCollaborationInsights(): Promise<any> { return request('/procurement/insights/collaboration'); },
  async getOnboardingInsights(): Promise<any> { return request('/procurement/insights/onboarding'); },
  async getVendorActivities(): Promise<any[]> { return asArray(await request('/procurement/insights/vendor-activities')); },
  async getVendorRisk(): Promise<any[]> { return asArray(await request('/procurement/insights/vendor-risk')); },
  async getPendingActions(): Promise<any[]> { return asArray(await request('/procurement/insights/pending-actions')); },
  async getComplianceViolations(): Promise<any[]> { return asArray(await request('/procurement/insights/compliance-violations')); },

  // ---- Spend analysis (procurement/spend-analysis/*) ----
  async getSpendOverview(): Promise<any> { return request('/procurement/spend-analysis/overview'); },
  async getSpendVendorAnalysis(): Promise<any[]> { return asArray(await request('/procurement/spend-analysis/vendors')); },
  async getSpendCategoryAnalysis(): Promise<any[]> { return asArray(await request('/procurement/spend-analysis/categories')); },
  async getSpendMaverick(): Promise<any> { return request('/procurement/spend-analysis/maverick'); },
  async getSpendSavings(): Promise<any[]> { return asArray(await request('/procurement/spend-analysis/savings')); },
  async getSpendAbc(dimension: 'vendor' | 'category' | 'item' = 'vendor'): Promise<any[]> { return asArray(await request(`/procurement/spend-analysis/abc?dimension=${dimension}`)); },
  async getSpendTrend(): Promise<any[]> { return asArray(await request('/procurement/spend-analysis/trend')); },
  async getSpendByDepartment(): Promise<any[]> { return asArray(await request('/procurement/spend-analysis/departments')); },
};
