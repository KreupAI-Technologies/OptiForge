import { apiClient } from '../api/client';

// ==================== TypeScript Interfaces ====================

export type QuoteStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'sent'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'converted'
  | 'cancelled';

export interface Quote {
  id: string;
  companyId: string;
  quoteNumber: string;
  version: number;
  parentQuoteId?: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  contactPerson?: string;
  opportunityId?: string;
  salesRepId: string;
  salesRepName?: string;
  status: QuoteStatus;
  title: string;
  description?: string;
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  currency: string;
  validityDays: number;
  expiresAt: string;
  marginPercentage: number;
  paymentTerms?: string;
  deliveryTerms?: string;
  notes?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  acceptedAt?: string;
  convertedAt?: string;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  productId: string;
  productName: string;
  productSku: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  discountAmount: number;
  lineTotal: number;
  costPrice: number;
  marginPercentage: number;
  configuration?: Record<string, unknown>;
  notes?: string;
  displayOrder: number;
}

export interface QuoteTemplate {
  id: string;
  companyId: string;
  // Backend entity column is `name`; kept aligned so create/update round-trips.
  name: string;
  description?: string;
  category?: string;
  defaultValidityDays: number;
  defaultPaymentTerms?: string;
  defaultDeliveryTerms?: string;
  headerContent?: string;
  footerContent?: string;
  termsAndConditions?: string;
  isActive: boolean;
  createdAt: string;
}

export interface QuoteVersion {
  id: string;
  companyId: string;
  quoteId: string;
  versionNumber: number;
  changeDescription?: string;
  snapshot: Record<string, unknown>;
  itemsSnapshot: Record<string, unknown>[];
  previousTotal: number;
  createdBy: string;
  createdAt: string;
}

export interface QuoteComparison {
  quotes: Quote[];
  comparison: {
    field: string;
    values: { quoteId: string; value: unknown }[];
  }[];
}

// ==================== Mock Data ====================

const MOCK_QUOTES: Quote[] = [
  {
    id: 'quote-001',
    companyId: 'company-001',
    quoteNumber: 'QT-2025-0001',
    version: 1,
    customerId: 'cust-001',
    customerName: 'Acme Manufacturing',
    customerEmail: 'procurement@acme.com',
    contactPerson: 'John Smith',
    salesRepId: 'sales-001',
    salesRepName: 'Sarah Johnson',
    status: 'sent',
    title: '5-Axis CNC Machining Center Package',
    description: 'Complete machining center with tooling and training',
    subtotal: 285000,
    discountPercentage: 5,
    discountAmount: 14250,
    taxPercentage: 8.25,
    taxAmount: 22346.88,
    shippingCost: 5000,
    totalAmount: 298096.88,
    currency: 'USD',
    validityDays: 30,
    expiresAt: '2025-03-15T00:00:00Z',
    marginPercentage: 28,
    paymentTerms: 'Net 30',
    deliveryTerms: 'FOB Destination',
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2025-02-05T14:00:00Z',
    sentAt: '2025-02-05T14:00:00Z',
  },
  {
    id: 'quote-002',
    companyId: 'company-001',
    quoteNumber: 'QT-2025-0002',
    version: 1,
    customerId: 'cust-002',
    customerName: 'Global Industries',
    customerEmail: 'buyers@global.com',
    salesRepId: 'sales-001',
    salesRepName: 'Sarah Johnson',
    status: 'pending_approval',
    title: 'Robotic Welding Cell',
    subtotal: 425000,
    discountPercentage: 12,
    discountAmount: 51000,
    taxPercentage: 8.25,
    taxAmount: 30855,
    shippingCost: 8500,
    totalAmount: 413355,
    currency: 'USD',
    validityDays: 45,
    expiresAt: '2025-03-20T00:00:00Z',
    marginPercentage: 22,
    paymentTerms: 'Net 60',
    createdAt: '2025-02-03T09:00:00Z',
    updatedAt: '2025-02-06T11:00:00Z',
  },
  {
    id: 'quote-003',
    companyId: 'company-001',
    quoteNumber: 'QT-2025-0003',
    version: 2,
    parentQuoteId: 'quote-003-v1',
    customerId: 'cust-003',
    customerName: 'Precision Parts Co',
    salesRepId: 'sales-002',
    salesRepName: 'Mike Wilson',
    status: 'accepted',
    title: 'CNC Lathe Package',
    subtotal: 95000,
    discountPercentage: 8,
    discountAmount: 7600,
    taxPercentage: 7.5,
    taxAmount: 6555,
    shippingCost: 2500,
    totalAmount: 96455,
    currency: 'USD',
    validityDays: 30,
    expiresAt: '2025-02-28T00:00:00Z',
    marginPercentage: 25,
    createdAt: '2025-01-20T08:00:00Z',
    updatedAt: '2025-02-01T10:00:00Z',
    acceptedAt: '2025-02-01T10:00:00Z',
  },
];

const MOCK_QUOTE_ITEMS: QuoteItem[] = [
  {
    id: 'qi-001',
    quoteId: 'quote-001',
    productId: 'prod-001',
    productName: '5-Axis CNC Milling Machine',
    productSku: 'CNC-MILL-5X',
    quantity: 1,
    unitPrice: 265000,
    discountPercentage: 0,
    discountAmount: 0,
    lineTotal: 265000,
    costPrice: 185000,
    marginPercentage: 30.19,
    displayOrder: 1,
  },
  {
    id: 'qi-002',
    quoteId: 'quote-001',
    productId: 'tool-001',
    productName: 'Tooling Package - Standard',
    productSku: 'TOOL-PKG-STD',
    quantity: 1,
    unitPrice: 15000,
    discountPercentage: 0,
    discountAmount: 0,
    lineTotal: 15000,
    costPrice: 10000,
    marginPercentage: 33.33,
    displayOrder: 2,
  },
  {
    id: 'qi-003',
    quoteId: 'quote-001',
    productId: 'train-001',
    productName: 'Operator Training (3 days)',
    productSku: 'TRAIN-3DAY',
    quantity: 1,
    unitPrice: 5000,
    discountPercentage: 0,
    discountAmount: 0,
    lineTotal: 5000,
    costPrice: 2500,
    marginPercentage: 50,
    displayOrder: 3,
  },
];

// ==================== Service Class ====================

class CPQQuoteService {
  private baseUrl = '/cpq/quotes';

  // Quotes CRUD
  async create(data: { quote: Partial<Quote>; items?: Partial<QuoteItem>[] }): Promise<Quote> {
    try {
      const response = await apiClient.post<Quote>(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.error('API Error creating quote, using mock data:', error);
      const newQuote: Quote = {
        id: `quote-${Date.now()}`,
        companyId: 'company-001',
        quoteNumber: `QT-2025-${String(MOCK_QUOTES.length + 1).padStart(4, '0')}`,
        version: 1,
        customerId: data.quote.customerId || '',
        customerName: data.quote.customerName || 'Customer',
        salesRepId: data.quote.salesRepId || 'sales-001',
        status: 'draft',
        title: data.quote.title || 'New Quote',
        subtotal: 0,
        discountPercentage: 0,
        discountAmount: 0,
        taxPercentage: 0,
        taxAmount: 0,
        shippingCost: 0,
        totalAmount: 0,
        currency: 'USD',
        validityDays: 30,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        marginPercentage: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data.quote,
      } as Quote;
      MOCK_QUOTES.push(newQuote);
      return newQuote;
    }
  }

  async findAll(filters?: {
    status?: QuoteStatus;
    customerId?: string;
    salesRepId?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<Quote[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.customerId) params.append('customerId', filters.customerId);
      if (filters?.salesRepId) params.append('salesRepId', filters.salesRepId);
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);
      const response = await apiClient.get<Quote[]>(`${this.baseUrl}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching quotes, using mock data:', error);
      let result = [...MOCK_QUOTES];
      if (filters?.status) result = result.filter((q) => q.status === filters.status);
      if (filters?.customerId) result = result.filter((q) => q.customerId === filters.customerId);
      if (filters?.salesRepId) result = result.filter((q) => q.salesRepId === filters.salesRepId);
      return result;
    }
  }

  async findOne(id: string): Promise<Quote> {
    try {
      const response = await apiClient.get<Quote>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching quote, using mock data:', error);
      const quote = MOCK_QUOTES.find((q) => q.id === id);
      if (!quote) throw new Error(`Quote with ID ${id} not found`);
      return quote;
    }
  }

  async findItems(quoteId: string): Promise<QuoteItem[]> {
    try {
      const response = await apiClient.get<QuoteItem[]>(`${this.baseUrl}/${quoteId}/items`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching quote items, using mock data:', error);
      return MOCK_QUOTE_ITEMS.filter((i) => i.quoteId === quoteId);
    }
  }

  async update(id: string, data: Partial<Quote>): Promise<Quote> {
    try {
      const response = await apiClient.patch<Quote>(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('API Error updating quote, using mock data:', error);
      const index = MOCK_QUOTES.findIndex((q) => q.id === id);
      if (index === -1) throw new Error(`Quote with ID ${id} not found`);
      MOCK_QUOTES[index] = { ...MOCK_QUOTES[index], ...data, updatedAt: new Date().toISOString() };
      return MOCK_QUOTES[index];
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('API Error deleting quote, using mock data:', error);
      const index = MOCK_QUOTES.findIndex((q) => q.id === id);
      if (index !== -1) MOCK_QUOTES.splice(index, 1);
    }
  }

  // Items Management
  async addItem(quoteId: string, data: Partial<QuoteItem>): Promise<QuoteItem> {
    try {
      const response = await apiClient.post<QuoteItem>(`${this.baseUrl}/${quoteId}/items`, data);
      return response.data;
    } catch (error) {
      console.error('API Error adding item, using mock data:', error);
      const newItem: QuoteItem = {
        id: `qi-${Date.now()}`,
        quoteId,
        productId: data.productId || '',
        productName: data.productName || 'Product',
        productSku: data.productSku || 'SKU',
        quantity: data.quantity || 1,
        unitPrice: data.unitPrice || 0,
        discountPercentage: data.discountPercentage || 0,
        discountAmount: data.discountAmount || 0,
        lineTotal: (data.quantity || 1) * (data.unitPrice || 0),
        costPrice: data.costPrice || 0,
        marginPercentage: data.marginPercentage || 0,
        displayOrder: MOCK_QUOTE_ITEMS.filter((i) => i.quoteId === quoteId).length + 1,
        ...data,
      } as QuoteItem;
      MOCK_QUOTE_ITEMS.push(newItem);
      return newItem;
    }
  }

  async updateItem(quoteId: string, itemId: string, data: Partial<QuoteItem>): Promise<QuoteItem> {
    try {
      const response = await apiClient.patch<QuoteItem>(`${this.baseUrl}/${quoteId}/items/${itemId}`, data);
      return response.data;
    } catch (error) {
      console.error('API Error updating item, using mock data:', error);
      const index = MOCK_QUOTE_ITEMS.findIndex((i) => i.id === itemId);
      if (index === -1) throw new Error(`Item with ID ${itemId} not found`);
      MOCK_QUOTE_ITEMS[index] = { ...MOCK_QUOTE_ITEMS[index], ...data };
      return MOCK_QUOTE_ITEMS[index];
    }
  }

  async removeItem(quoteId: string, itemId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${quoteId}/items/${itemId}`);
    } catch (error) {
      console.error('API Error removing item, using mock data:', error);
      const index = MOCK_QUOTE_ITEMS.findIndex((i) => i.id === itemId);
      if (index !== -1) MOCK_QUOTE_ITEMS.splice(index, 1);
    }
  }

  // Quote Workflow
  async submitForApproval(id: string): Promise<Quote> {
    try {
      const response = await apiClient.post<Quote>(`${this.baseUrl}/${id}/submit`, {});
      return response.data;
    } catch (error) {
      console.error('API Error submitting quote:', error);
      return this.update(id, { status: 'pending_approval' });
    }
  }

  async approve(id: string, approvedBy: string): Promise<Quote> {
    try {
      const response = await apiClient.post<Quote>(`${this.baseUrl}/${id}/approve`, { approvedBy });
      return response.data;
    } catch (error) {
      console.error('API Error approving quote:', error);
      return this.update(id, { status: 'approved' });
    }
  }

  async reject(id: string, rejectedBy: string, reason?: string): Promise<Quote> {
    try {
      const response = await apiClient.post<Quote>(`${this.baseUrl}/${id}/reject`, { rejectedBy, reason });
      return response.data;
    } catch (error) {
      console.error('API Error rejecting quote:', error);
      return this.update(id, { status: 'rejected' });
    }
  }

  async sendToCustomer(id: string, sentBy: string): Promise<Quote> {
    try {
      const response = await apiClient.post<Quote>(`${this.baseUrl}/${id}/send`, { sentBy });
      return response.data;
    } catch (error) {
      console.error('API Error sending quote:', error);
      return this.update(id, { status: 'sent', sentAt: new Date().toISOString() });
    }
  }

  async recordCustomerResponse(id: string, accepted: boolean, feedback?: string): Promise<Quote> {
    try {
      const response = await apiClient.post<Quote>(`${this.baseUrl}/${id}/response`, { accepted, feedback });
      return response.data;
    } catch (error) {
      console.error('API Error recording response:', error);
      return this.update(id, {
        status: accepted ? 'accepted' : 'declined',
        acceptedAt: accepted ? new Date().toISOString() : undefined,
      });
    }
  }

  async convertToOrder(id: string): Promise<{ quote: Quote; orderId: string }> {
    try {
      const response = await apiClient.post<{ quote: Quote; orderId: string }>(`${this.baseUrl}/${id}/convert`, {});
      return response.data;
    } catch (error) {
      console.error('API Error converting quote:', error);
      const quote = await this.update(id, { status: 'converted', convertedAt: new Date().toISOString() });
      return { quote, orderId: `order-${Date.now()}` };
    }
  }

  // Versioning
  async createVersion(id: string, createdBy: string, changeDescription?: string): Promise<Quote> {
    try {
      const response = await apiClient.post<Quote>(`${this.baseUrl}/${id}/version`, { createdBy, changeDescription });
      return response.data;
    } catch (error) {
      console.error('API Error creating version:', error);
      const original = MOCK_QUOTES.find((q) => q.id === id);
      if (!original) throw new Error(`Quote with ID ${id} not found`);
      const newQuote: Quote = {
        ...original,
        id: `quote-${Date.now()}`,
        version: original.version + 1,
        parentQuoteId: id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_QUOTES.push(newQuote);
      return newQuote;
    }
  }

  async findVersions(quoteId: string): Promise<QuoteVersion[]> {
    try {
      const response = await apiClient.get<QuoteVersion[]>(`${this.baseUrl}/${quoteId}/versions`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching versions, using mock data:', error);
      return [];
    }
  }

  async compareQuotes(quoteIds: string[]): Promise<QuoteComparison> {
    try {
      const response = await apiClient.post<QuoteComparison>(`${this.baseUrl}/compare`, { quoteIds });
      return response.data;
    } catch (error) {
      console.error('API Error comparing quotes, using mock data:', error);
      const quotes = MOCK_QUOTES.filter((q) => quoteIds.includes(q.id));
      return {
        quotes,
        comparison: [
          { field: 'totalAmount', values: quotes.map((q) => ({ quoteId: q.id, value: q.totalAmount })) },
          { field: 'discountPercentage', values: quotes.map((q) => ({ quoteId: q.id, value: q.discountPercentage })) },
        ],
      };
    }
  }

  // Templates — served by QuoteController at /cpq/quotes/templates.
  private templatesUrl = '/cpq/quotes/templates';

  async findAllTemplates(filters?: { category?: string; isActive?: boolean }): Promise<QuoteTemplate[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    const qs = params.toString();
    const response = await apiClient.get<QuoteTemplate[]>(
      qs ? `${this.templatesUrl}?${qs}` : this.templatesUrl,
    );
    return Array.isArray(response.data) ? response.data : [];
  }

  async createTemplate(data: Partial<QuoteTemplate>): Promise<QuoteTemplate> {
    const response = await apiClient.post<QuoteTemplate>(this.templatesUrl, data);
    return response.data;
  }

  async updateTemplate(id: string, data: Partial<QuoteTemplate>): Promise<QuoteTemplate> {
    const response = await apiClient.patch<QuoteTemplate>(`${this.templatesUrl}/${id}`, data);
    return response.data;
  }

  async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`${this.templatesUrl}/${id}`);
  }

  async createFromTemplate(templateId: string, data: Partial<Quote>): Promise<Quote> {
    const response = await apiClient.post<Quote>(
      `${this.templatesUrl}/${templateId}/create-quote`,
      data,
    );
    return response.data;
  }
}

export const cpqQuoteService = new CPQQuoteService();
