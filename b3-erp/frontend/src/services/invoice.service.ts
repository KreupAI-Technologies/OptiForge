/**
 * Invoice Service
 * Handles invoice management, aging reports, and workflow operations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Type Definitions
// ============================================================================

export enum InvoiceType {
  SALES = 'SALES',
  PURCHASE = 'PURCHASE',
  CREDIT_NOTE = 'CREDIT_NOTE',
  DEBIT_NOTE = 'DEBIT_NOTE',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  POSTED = 'POSTED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  VOID = 'VOID',
}

export enum PaymentTerms {
  NET_15 = 'NET_15',
  NET_30 = 'NET_30',
  NET_45 = 'NET_45',
  NET_60 = 'NET_60',
  NET_90 = 'NET_90',
  DUE_ON_RECEIPT = 'DUE_ON_RECEIPT',
  CUSTOM = 'CUSTOM',
}

export interface InvoiceLineItem {
  id: string;
  productId?: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
  accountId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerAddress?: string;
  vendorId?: string;
  vendorName?: string;
  invoiceDate: Date;
  dueDate: Date;
  paymentTerms: PaymentTerms;
  currency: string;
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  lineItems: InvoiceLineItem[];
  notes?: string;
  terms?: string;
  reference?: string;
  poNumber?: string;
  submittedAt?: Date;
  submittedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
  postedAt?: Date;
  postedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceFilters {
  type?: InvoiceType;
  status?: InvoiceStatus;
  customerId?: string;
  vendorId?: string;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AgingBucket {
  label: string;
  range: string;
  count: number;
  totalAmount: number;
  invoices: Invoice[];
}

export interface AgingReport {
  asOfDate: Date;
  totalReceivables: number;
  totalOverdue: number;
  buckets: AgingBucket[];
  byCustomer: CustomerAgingSummary[];
}

export interface CustomerAgingSummary {
  customerId: string;
  customerName: string;
  current: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  over90: number;
  total: number;
}

export interface CreateInvoiceDto {
  type: InvoiceType;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerAddress?: string;
  vendorId?: string;
  vendorName?: string;
  invoiceDate: Date;
  dueDate?: Date;
  paymentTerms: PaymentTerms;
  currency?: string;
  lineItems: Omit<InvoiceLineItem, 'id' | 'taxAmount' | 'lineTotal'>[];
  notes?: string;
  terms?: string;
  reference?: string;
  poNumber?: string;
}

export interface UpdateInvoiceDto {
  customerName?: string;
  customerEmail?: string;
  customerAddress?: string;
  invoiceDate?: Date;
  dueDate?: Date;
  paymentTerms?: PaymentTerms;
  lineItems?: Omit<InvoiceLineItem, 'id' | 'taxAmount' | 'lineTotal'>[];
  notes?: string;
  terms?: string;
  reference?: string;
  poNumber?: string;
}

// ============================================================================
// Mock Data - 10 Invoices
// ============================================================================

const generateLineItems = (items: { name: string; qty: number; price: number; tax: number }[]): InvoiceLineItem[] => {
  return items.map((item, index) => {
    const lineTotal = item.qty * item.price;
    const taxAmount = lineTotal * (item.tax / 100);
    return {
      id: `li-${index + 1}`,
      productName: item.name,
      quantity: item.qty,
      unitPrice: item.price,
      discount: 0,
      taxRate: item.tax,
      taxAmount,
      lineTotal: lineTotal + taxAmount,
    };
  });
};

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2024-0001',
    type: InvoiceType.SALES,
    status: InvoiceStatus.PAID,
    customerId: 'cust-1',
    customerName: 'ABC Manufacturing Co.',
    customerEmail: 'accounts@abcmfg.com',
    customerAddress: '123 Industrial Blvd, Chicago, IL 60601',
    invoiceDate: new Date('2024-01-05'),
    dueDate: new Date('2024-02-04'),
    paymentTerms: PaymentTerms.NET_30,
    currency: 'USD',
    subtotal: 45000,
    totalDiscount: 0,
    totalTax: 3825,
    totalAmount: 48825,
    amountPaid: 48825,
    amountDue: 0,
    lineItems: generateLineItems([
      { name: 'CNC Machined Parts - Batch A', qty: 500, price: 50, tax: 8.5 },
      { name: 'Assembly Components', qty: 200, price: 100, tax: 8.5 },
    ]),
    notes: 'Thank you for your business!',
    terms: 'Payment due within 30 days',
    poNumber: 'PO-ABC-2024-001',
    submittedAt: new Date('2024-01-05'),
    approvedAt: new Date('2024-01-05'),
    postedAt: new Date('2024-01-06'),
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-02-02'),
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2024-0002',
    type: InvoiceType.SALES,
    status: InvoiceStatus.OVERDUE,
    customerId: 'cust-2',
    customerName: 'XYZ Industries Ltd.',
    customerEmail: 'billing@xyzind.com',
    customerAddress: '456 Factory Lane, Detroit, MI 48201',
    invoiceDate: new Date('2023-12-01'),
    dueDate: new Date('2023-12-31'),
    paymentTerms: PaymentTerms.NET_30,
    currency: 'USD',
    subtotal: 78500,
    totalDiscount: 2000,
    totalTax: 6502.50,
    totalAmount: 83002.50,
    amountPaid: 25000,
    amountDue: 58002.50,
    lineItems: generateLineItems([
      { name: 'Industrial Gears Set', qty: 100, price: 350, tax: 8.5 },
      { name: 'Custom Brackets', qty: 500, price: 87, tax: 8.5 },
    ]),
    notes: 'Partial payment received',
    terms: 'Late payment subject to 1.5% monthly interest',
    poNumber: 'PO-XYZ-2023-089',
    submittedAt: new Date('2023-12-01'),
    approvedAt: new Date('2023-12-01'),
    postedAt: new Date('2023-12-02'),
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2024-0003',
    type: InvoiceType.SALES,
    status: InvoiceStatus.POSTED,
    customerId: 'cust-3',
    customerName: 'Global Tech Solutions',
    customerEmail: 'ap@globaltech.com',
    customerAddress: '789 Tech Park, Austin, TX 78701',
    invoiceDate: new Date('2024-01-10'),
    dueDate: new Date('2024-02-24'),
    paymentTerms: PaymentTerms.NET_45,
    currency: 'USD',
    subtotal: 125000,
    totalDiscount: 5000,
    totalTax: 10200,
    totalAmount: 130200,
    amountPaid: 0,
    amountDue: 130200,
    lineItems: generateLineItems([
      { name: 'Precision Components', qty: 1000, price: 75, tax: 8.5 },
      { name: 'Control Units', qty: 50, price: 1000, tax: 8.5 },
    ]),
    notes: 'Rush order - expedited shipping included',
    terms: 'Payment due within 45 days',
    reference: 'Contract #GT-2024-Q1',
    poNumber: 'PO-GT-2024-015',
    submittedAt: new Date('2024-01-10'),
    approvedAt: new Date('2024-01-10'),
    postedAt: new Date('2024-01-11'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-11'),
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2024-0004',
    type: InvoiceType.SALES,
    status: InvoiceStatus.PENDING_APPROVAL,
    customerId: 'cust-4',
    customerName: 'Precision Engineering Inc.',
    customerEmail: 'finance@precisioneng.com',
    customerAddress: '321 Engineering Way, Cleveland, OH 44101',
    invoiceDate: new Date('2024-01-15'),
    dueDate: new Date('2024-02-14'),
    paymentTerms: PaymentTerms.NET_30,
    currency: 'USD',
    subtotal: 34750,
    totalDiscount: 0,
    totalTax: 2953.75,
    totalAmount: 37703.75,
    amountPaid: 0,
    amountDue: 37703.75,
    lineItems: generateLineItems([
      { name: 'Hydraulic Cylinders', qty: 25, price: 890, tax: 8.5 },
      { name: 'Valve Assemblies', qty: 50, price: 251, tax: 8.5 },
    ]),
    notes: 'Awaiting approval from finance manager',
    terms: 'Standard payment terms apply',
    poNumber: 'PO-PE-2024-007',
    submittedAt: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-2024-0005',
    type: InvoiceType.SALES,
    status: InvoiceStatus.DRAFT,
    customerId: 'cust-5',
    customerName: 'Summit Manufacturing',
    customerEmail: 'orders@summitmfg.com',
    customerAddress: '555 Summit Drive, Denver, CO 80201',
    invoiceDate: new Date('2024-01-16'),
    dueDate: new Date('2024-02-15'),
    paymentTerms: PaymentTerms.NET_30,
    currency: 'USD',
    subtotal: 22400,
    totalDiscount: 0,
    totalTax: 1904,
    totalAmount: 24304,
    amountPaid: 0,
    amountDue: 24304,
    lineItems: generateLineItems([
      { name: 'Sheet Metal Parts', qty: 800, price: 18, tax: 8.5 },
      { name: 'Fasteners Kit', qty: 100, price: 80, tax: 8.5 },
    ]),
    notes: 'Draft - pending line item verification',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: 'inv-6',
    invoiceNumber: 'INV-2024-0006',
    type: InvoiceType.SALES,
    status: InvoiceStatus.PARTIALLY_PAID,
    customerId: 'cust-6',
    customerName: 'Midwest Components Corp.',
    customerEmail: 'ap@midwestcomp.com',
    customerAddress: '888 Commerce St, Indianapolis, IN 46201',
    invoiceDate: new Date('2024-01-08'),
    dueDate: new Date('2024-02-07'),
    paymentTerms: PaymentTerms.NET_30,
    currency: 'USD',
    subtotal: 67800,
    totalDiscount: 1500,
    totalTax: 5635.50,
    totalAmount: 71935.50,
    amountPaid: 35000,
    amountDue: 36935.50,
    lineItems: generateLineItems([
      { name: 'Motor Housings', qty: 150, price: 280, tax: 8.5 },
      { name: 'Bearing Assemblies', qty: 300, price: 86, tax: 8.5 },
    ]),
    notes: 'First payment received, balance due on schedule',
    terms: 'Installment payment approved',
    poNumber: 'PO-MWC-2024-022',
    submittedAt: new Date('2024-01-08'),
    approvedAt: new Date('2024-01-08'),
    postedAt: new Date('2024-01-09'),
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'inv-7',
    invoiceNumber: 'INV-2024-0007',
    type: InvoiceType.PURCHASE,
    status: InvoiceStatus.APPROVED,
    vendorId: 'vend-1',
    vendorName: 'Steel Supply Co.',
    customerName: 'ManufacturingOS Inc.',
    invoiceDate: new Date('2024-01-12'),
    dueDate: new Date('2024-02-26'),
    paymentTerms: PaymentTerms.NET_45,
    currency: 'USD',
    subtotal: 89500,
    totalDiscount: 2500,
    totalTax: 7395,
    totalAmount: 94395,
    amountPaid: 0,
    amountDue: 94395,
    lineItems: generateLineItems([
      { name: 'Steel Sheets - Grade A', qty: 500, price: 125, tax: 8.5 },
      { name: 'Steel Rods - 10mm', qty: 1000, price: 27, tax: 8.5 },
    ]),
    notes: 'Vendor invoice for raw materials',
    reference: 'Vendor Inv# SS-2024-1045',
    poNumber: 'PO-INT-2024-033',
    submittedAt: new Date('2024-01-12'),
    approvedAt: new Date('2024-01-13'),
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-13'),
  },
  {
    id: 'inv-8',
    invoiceNumber: 'INV-2024-0008',
    type: InvoiceType.SALES,
    status: InvoiceStatus.OVERDUE,
    customerId: 'cust-7',
    customerName: 'Atlantic Industries',
    customerEmail: 'finance@atlanticind.com',
    customerAddress: '200 Harbor Blvd, Boston, MA 02101',
    invoiceDate: new Date('2023-11-15'),
    dueDate: new Date('2023-12-15'),
    paymentTerms: PaymentTerms.NET_30,
    currency: 'USD',
    subtotal: 156000,
    totalDiscount: 0,
    totalTax: 13260,
    totalAmount: 169260,
    amountPaid: 0,
    amountDue: 169260,
    lineItems: generateLineItems([
      { name: 'Custom Machinery Parts', qty: 200, price: 450, tax: 8.5 },
      { name: 'Installation Components', qty: 400, price: 165, tax: 8.5 },
    ]),
    notes: 'URGENT: 60+ days overdue - escalate to collections',
    terms: 'Immediate payment required',
    poNumber: 'PO-ATL-2023-156',
    submittedAt: new Date('2023-11-15'),
    approvedAt: new Date('2023-11-15'),
    postedAt: new Date('2023-11-16'),
    createdAt: new Date('2023-11-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'inv-9',
    invoiceNumber: 'INV-2024-0009',
    type: InvoiceType.CREDIT_NOTE,
    status: InvoiceStatus.POSTED,
    customerId: 'cust-1',
    customerName: 'ABC Manufacturing Co.',
    customerEmail: 'accounts@abcmfg.com',
    customerAddress: '123 Industrial Blvd, Chicago, IL 60601',
    invoiceDate: new Date('2024-01-18'),
    dueDate: new Date('2024-01-18'),
    paymentTerms: PaymentTerms.DUE_ON_RECEIPT,
    currency: 'USD',
    subtotal: -5000,
    totalDiscount: 0,
    totalTax: -425,
    totalAmount: -5425,
    amountPaid: 0,
    amountDue: -5425,
    lineItems: generateLineItems([
      { name: 'Return - Defective Parts', qty: 100, price: -50, tax: 8.5 },
    ]),
    notes: 'Credit note for returned defective items from INV-2024-0001',
    reference: 'Related to INV-2024-0001',
    submittedAt: new Date('2024-01-18'),
    approvedAt: new Date('2024-01-18'),
    postedAt: new Date('2024-01-18'),
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: 'inv-10',
    invoiceNumber: 'INV-2024-0010',
    type: InvoiceType.SALES,
    status: InvoiceStatus.POSTED,
    customerId: 'cust-8',
    customerName: 'Pacific Automation Ltd.',
    customerEmail: 'invoices@pacificauto.com',
    customerAddress: '1500 Pacific Way, Seattle, WA 98101',
    invoiceDate: new Date('2024-01-14'),
    dueDate: new Date('2024-03-14'),
    paymentTerms: PaymentTerms.NET_60,
    currency: 'USD',
    subtotal: 245000,
    totalDiscount: 10000,
    totalTax: 19975,
    totalAmount: 254975,
    amountPaid: 0,
    amountDue: 254975,
    lineItems: generateLineItems([
      { name: 'Robotic Arm Components', qty: 10, price: 8500, tax: 8.5 },
      { name: 'Sensor Arrays', qty: 50, price: 1200, tax: 8.5 },
      { name: 'Control Modules', qty: 100, price: 950, tax: 8.5 },
    ]),
    notes: 'Large order - NET 60 terms approved by sales director',
    terms: 'Extended payment terms per contract',
    reference: 'Master Agreement #PA-2024',
    poNumber: 'PO-PAC-2024-001',
    submittedAt: new Date('2024-01-14'),
    approvedAt: new Date('2024-01-14'),
    postedAt: new Date('2024-01-15'),
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-15'),
  },
];

// ============================================================================
// Invoice Service
// ============================================================================

export class InvoiceService {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
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

  // Get All Invoices with Filters
  static async getAllInvoices(filters?: InvoiceFilters): Promise<{
    data: Invoice[];
    total: number;
    page: number;
    limit: number;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredInvoices = [...MOCK_INVOICES];

      if (filters?.type) {
        filteredInvoices = filteredInvoices.filter((i) => i.type === filters.type);
      }
      if (filters?.status) {
        filteredInvoices = filteredInvoices.filter((i) => i.status === filters.status);
      }
      if (filters?.customerId) {
        filteredInvoices = filteredInvoices.filter((i) => i.customerId === filters.customerId);
      }
      if (filters?.vendorId) {
        filteredInvoices = filteredInvoices.filter((i) => i.vendorId === filters.vendorId);
      }
      if (filters?.fromDate) {
        filteredInvoices = filteredInvoices.filter(
          (i) => new Date(i.invoiceDate) >= new Date(filters.fromDate!)
        );
      }
      if (filters?.toDate) {
        filteredInvoices = filteredInvoices.filter(
          (i) => new Date(i.invoiceDate) <= new Date(filters.toDate!)
        );
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredInvoices = filteredInvoices.filter(
          (i) =>
            i.invoiceNumber.toLowerCase().includes(searchLower) ||
            i.customerName.toLowerCase().includes(searchLower) ||
            i.vendorName?.toLowerCase().includes(searchLower)
        );
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const start = (page - 1) * limit;
      const paginatedInvoices = filteredInvoices.slice(start, start + limit);

      return {
        data: paginatedInvoices,
        total: filteredInvoices.length,
        page,
        limit,
      };
    }

    const queryParams = new URLSearchParams();
    if (filters?.type) queryParams.set('type', filters.type);
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.customerId) queryParams.set('customerId', filters.customerId);
    if (filters?.vendorId) queryParams.set('vendorId', filters.vendorId);
    if (filters?.fromDate) queryParams.set('fromDate', filters.fromDate.toISOString());
    if (filters?.toDate) queryParams.set('toDate', filters.toDate.toISOString());
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.page) queryParams.set('page', filters.page.toString());
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());

    return this.request(`/sales-masters/invoices?${queryParams.toString()}`);
  }

  // Get Invoice by ID
  static async getInvoiceById(id: string): Promise<Invoice> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const invoice = MOCK_INVOICES.find((i) => i.id === id);
      if (!invoice) throw new Error('Invoice not found');
      return invoice;
    }
    return this.request<Invoice>(`/sales-masters/invoices/${id}`);
  }

  // Get Overdue Invoices
  static async getOverdueInvoices(): Promise<Invoice[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return MOCK_INVOICES.filter((i) => i.status === InvoiceStatus.OVERDUE);
    }
    return this.request<Invoice[]>('/sales-masters/invoices/overdue');
  }

  // Get Aging Report
  static async getAgingReport(asOfDate?: Date): Promise<AgingReport> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const reportDate = asOfDate || new Date();

      // Filter receivable invoices (sales invoices with outstanding amounts)
      const receivables = MOCK_INVOICES.filter(
        (i) =>
          i.type === InvoiceType.SALES &&
          i.amountDue > 0 &&
          [InvoiceStatus.POSTED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE].includes(i.status)
      );

      // Calculate aging buckets
      const buckets: AgingBucket[] = [
        { label: 'Current', range: '0-30 days', count: 0, totalAmount: 0, invoices: [] },
        { label: '31-60 Days', range: '31-60 days', count: 0, totalAmount: 0, invoices: [] },
        { label: '61-90 Days', range: '61-90 days', count: 0, totalAmount: 0, invoices: [] },
        { label: 'Over 90 Days', range: '90+ days', count: 0, totalAmount: 0, invoices: [] },
      ];

      receivables.forEach((invoice) => {
        const daysOverdue = Math.floor(
          (reportDate.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        let bucketIndex = 0;
        if (daysOverdue > 90) bucketIndex = 3;
        else if (daysOverdue > 60) bucketIndex = 2;
        else if (daysOverdue > 30) bucketIndex = 1;

        buckets[bucketIndex].count++;
        buckets[bucketIndex].totalAmount += invoice.amountDue;
        buckets[bucketIndex].invoices.push(invoice);
      });

      // Calculate by customer
      const customerMap = new Map<string, CustomerAgingSummary>();
      receivables.forEach((invoice) => {
        const customerId = invoice.customerId || 'unknown';
        const daysOverdue = Math.floor(
          (reportDate.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            customerId,
            customerName: invoice.customerName,
            current: 0,
            days1to30: 0,
            days31to60: 0,
            days61to90: 0,
            over90: 0,
            total: 0,
          });
        }

        const summary = customerMap.get(customerId)!;
        summary.total += invoice.amountDue;

        if (daysOverdue <= 0) summary.current += invoice.amountDue;
        else if (daysOverdue <= 30) summary.days1to30 += invoice.amountDue;
        else if (daysOverdue <= 60) summary.days31to60 += invoice.amountDue;
        else if (daysOverdue <= 90) summary.days61to90 += invoice.amountDue;
        else summary.over90 += invoice.amountDue;
      });

      return {
        asOfDate: reportDate,
        totalReceivables: receivables.reduce((sum, i) => sum + i.amountDue, 0),
        totalOverdue: receivables
          .filter((i) => new Date(i.dueDate) < reportDate)
          .reduce((sum, i) => sum + i.amountDue, 0),
        buckets,
        byCustomer: Array.from(customerMap.values()),
      };
    }

    const queryParams = new URLSearchParams();
    if (asOfDate) queryParams.set('asOfDate', asOfDate.toISOString());
    return this.request<AgingReport>(`/sales-masters/invoices/aging-report?${queryParams.toString()}`);
  }

  // Create Invoice
  static async createInvoice(data: CreateInvoiceDto): Promise<Invoice> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Calculate line items
      const lineItems: InvoiceLineItem[] = data.lineItems.map((item, index) => {
        const lineTotal = item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100);
        const taxAmount = lineTotal * (item.taxRate / 100);
        return {
          id: `li-${Date.now()}-${index}`,
          ...item,
          discount: item.discount || 0,
          taxAmount,
          lineTotal: lineTotal + taxAmount,
        };
      });

      const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const totalDiscount = lineItems.reduce(
        (sum, item) => sum + (item.quantity * item.unitPrice * item.discount) / 100,
        0
      );
      const totalTax = lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
      const totalAmount = subtotal - totalDiscount + totalTax;

      // Calculate due date based on payment terms
      const invoiceDate = new Date(data.invoiceDate);
      let dueDate = data.dueDate ? new Date(data.dueDate) : new Date(invoiceDate);

      if (!data.dueDate) {
        switch (data.paymentTerms) {
          case PaymentTerms.NET_15:
            dueDate.setDate(dueDate.getDate() + 15);
            break;
          case PaymentTerms.NET_30:
            dueDate.setDate(dueDate.getDate() + 30);
            break;
          case PaymentTerms.NET_45:
            dueDate.setDate(dueDate.getDate() + 45);
            break;
          case PaymentTerms.NET_60:
            dueDate.setDate(dueDate.getDate() + 60);
            break;
          case PaymentTerms.NET_90:
            dueDate.setDate(dueDate.getDate() + 90);
            break;
          default:
            // DUE_ON_RECEIPT or CUSTOM - keep same date
            break;
        }
      }

      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: `INV-2024-${String(MOCK_INVOICES.length + 1).padStart(4, '0')}`,
        type: data.type,
        status: InvoiceStatus.DRAFT,
        customerId: data.customerId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerAddress: data.customerAddress,
        vendorId: data.vendorId,
        vendorName: data.vendorName,
        invoiceDate,
        dueDate,
        paymentTerms: data.paymentTerms,
        currency: data.currency || 'USD',
        subtotal,
        totalDiscount,
        totalTax,
        totalAmount,
        amountPaid: 0,
        amountDue: totalAmount,
        lineItems,
        notes: data.notes,
        terms: data.terms,
        reference: data.reference,
        poNumber: data.poNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      MOCK_INVOICES.push(newInvoice);
      return newInvoice;
    }

    return this.request<Invoice>('/sales-masters/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Create a sales invoice directly against the Prisma-backed NestJS endpoint.
   * Sends the backend-native payload shape (`items`, camelCase line fields)
   * plus the required x-company-id header. Used by /sales/invoices/create.
   */
  static async createSalesInvoice(payload: {
    companyId: string;
    customerName: string;
    customerEmail?: string;
    customerAddress?: string;
    invoiceDate: string;
    dueDate: string;
    paymentTerms: string;
    notes?: string;
    items: {
      productName: string;
      quantity: number;
      unitPrice: number;
      discountPercent?: number;
      taxRate?: number;
    }[];
  }): Promise<Invoice> {
    const { companyId, ...body } = payload;
    return this.request<Invoice>('/sales-masters/invoices', {
      method: 'POST',
      headers: { 'x-company-id': companyId },
      body: JSON.stringify({ ...body, companyId }),
    });
  }

  // Update Invoice
  static async updateInvoice(id: string, data: UpdateInvoiceDto): Promise<Invoice> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_INVOICES.findIndex((i) => i.id === id);
      if (index === -1) throw new Error('Invoice not found');

      const invoice = MOCK_INVOICES[index];
      if (invoice.status !== InvoiceStatus.DRAFT) {
        throw new Error('Only draft invoices can be updated');
      }

      // Recalculate if line items changed
      if (data.lineItems) {
        const lineItems: InvoiceLineItem[] = data.lineItems.map((item, idx) => {
          const lineTotal = item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100);
          const taxAmount = lineTotal * (item.taxRate / 100);
          return {
            id: `li-${Date.now()}-${idx}`,
            ...item,
            discount: item.discount || 0,
            taxAmount,
            lineTotal: lineTotal + taxAmount,
          };
        });

        const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        const totalDiscount = lineItems.reduce(
          (sum, item) => sum + (item.quantity * item.unitPrice * item.discount) / 100,
          0
        );
        const totalTax = lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
        const totalAmount = subtotal - totalDiscount + totalTax;

        MOCK_INVOICES[index] = {
          ...invoice,
          ...data,
          lineItems,
          subtotal,
          totalDiscount,
          totalTax,
          totalAmount,
          amountDue: totalAmount - invoice.amountPaid,
          updatedAt: new Date(),
        } as Invoice;
      } else {
        MOCK_INVOICES[index] = {
          ...invoice,
          ...data,
          updatedAt: new Date(),
        } as Invoice;
      }

      return MOCK_INVOICES[index];
    }

    return this.request<Invoice>(`/sales-masters/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Submit Invoice for Approval
  static async submitInvoice(id: string): Promise<Invoice> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_INVOICES.findIndex((i) => i.id === id);
      if (index === -1) throw new Error('Invoice not found');

      if (MOCK_INVOICES[index].status !== InvoiceStatus.DRAFT) {
        throw new Error('Only draft invoices can be submitted');
      }

      MOCK_INVOICES[index] = {
        ...MOCK_INVOICES[index],
        status: InvoiceStatus.PENDING_APPROVAL,
        submittedAt: new Date(),
        submittedBy: 'current-user',
        updatedAt: new Date(),
      };

      return MOCK_INVOICES[index];
    }

    return this.request<Invoice>(`/sales-masters/invoices/${id}/submit`, {
      method: 'POST',
    });
  }

  // Approve Invoice
  static async approveInvoice(id: string): Promise<Invoice> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_INVOICES.findIndex((i) => i.id === id);
      if (index === -1) throw new Error('Invoice not found');

      if (MOCK_INVOICES[index].status !== InvoiceStatus.PENDING_APPROVAL) {
        throw new Error('Only pending invoices can be approved');
      }

      MOCK_INVOICES[index] = {
        ...MOCK_INVOICES[index],
        status: InvoiceStatus.APPROVED,
        approvedAt: new Date(),
        approvedBy: 'approver-user',
        updatedAt: new Date(),
      };

      return MOCK_INVOICES[index];
    }

    return this.request<Invoice>(`/sales-masters/invoices/${id}/approve`, {
      method: 'POST',
    });
  }

  // Post Invoice
  static async postInvoice(id: string): Promise<Invoice> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_INVOICES.findIndex((i) => i.id === id);
      if (index === -1) throw new Error('Invoice not found');

      if (MOCK_INVOICES[index].status !== InvoiceStatus.APPROVED) {
        throw new Error('Only approved invoices can be posted');
      }

      MOCK_INVOICES[index] = {
        ...MOCK_INVOICES[index],
        status: InvoiceStatus.POSTED,
        postedAt: new Date(),
        postedBy: 'accountant-user',
        updatedAt: new Date(),
      };

      return MOCK_INVOICES[index];
    }

    return this.request<Invoice>(`/sales-masters/invoices/${id}/post`, {
      method: 'POST',
    });
  }

  // Cancel Invoice
  static async cancelInvoice(id: string, reason?: string): Promise<Invoice> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_INVOICES.findIndex((i) => i.id === id);
      if (index === -1) throw new Error('Invoice not found');

      const allowedStatuses = [
        InvoiceStatus.DRAFT,
        InvoiceStatus.PENDING_APPROVAL,
        InvoiceStatus.APPROVED,
      ];
      if (!allowedStatuses.includes(MOCK_INVOICES[index].status)) {
        throw new Error('Invoice cannot be cancelled in current status');
      }

      MOCK_INVOICES[index] = {
        ...MOCK_INVOICES[index],
        status: InvoiceStatus.CANCELLED,
        notes: reason ? `${MOCK_INVOICES[index].notes}\nCancellation reason: ${reason}` : MOCK_INVOICES[index].notes,
        updatedAt: new Date(),
      };

      return MOCK_INVOICES[index];
    }

    return this.request<Invoice>(`/sales-masters/invoices/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Void Invoice
  static async voidInvoice(id: string, reason: string): Promise<Invoice> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_INVOICES.findIndex((i) => i.id === id);
      if (index === -1) throw new Error('Invoice not found');

      if (MOCK_INVOICES[index].status !== InvoiceStatus.POSTED) {
        throw new Error('Only posted invoices can be voided');
      }

      MOCK_INVOICES[index] = {
        ...MOCK_INVOICES[index],
        status: InvoiceStatus.VOID,
        notes: `${MOCK_INVOICES[index].notes}\nVoid reason: ${reason}`,
        updatedAt: new Date(),
      };

      return MOCK_INVOICES[index];
    }

    return this.request<Invoice>(`/sales-masters/invoices/${id}/void`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Delete Invoice (only drafts)
  static async deleteInvoice(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_INVOICES.findIndex((i) => i.id === id);
      if (index === -1) throw new Error('Invoice not found');

      if (MOCK_INVOICES[index].status !== InvoiceStatus.DRAFT) {
        throw new Error('Only draft invoices can be deleted');
      }

      MOCK_INVOICES.splice(index, 1);
      return;
    }

    await this.request<void>(`/sales-masters/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  // Get Invoice Statistics
  static async getInvoiceStatistics(): Promise<{
    totalInvoices: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const byStatus: Record<string, number> = {};
      const byType: Record<string, number> = {};

      MOCK_INVOICES.forEach((invoice) => {
        byStatus[invoice.status] = (byStatus[invoice.status] || 0) + 1;
        byType[invoice.type] = (byType[invoice.type] || 0) + 1;
      });

      const salesInvoices = MOCK_INVOICES.filter((i) => i.type === InvoiceType.SALES);

      return {
        totalInvoices: salesInvoices.length,
        totalAmount: salesInvoices.reduce((sum, i) => sum + i.totalAmount, 0),
        paidAmount: salesInvoices.reduce((sum, i) => sum + i.amountPaid, 0),
        pendingAmount: salesInvoices
          .filter((i) => [InvoiceStatus.POSTED, InvoiceStatus.PARTIALLY_PAID].includes(i.status))
          .reduce((sum, i) => sum + i.amountDue, 0),
        overdueAmount: salesInvoices
          .filter((i) => i.status === InvoiceStatus.OVERDUE)
          .reduce((sum, i) => sum + i.amountDue, 0),
        byStatus,
        byType,
      };
    }

    return this.request('/sales-masters/invoices/statistics');
  }
}

// Export singleton instance
export const invoiceService = InvoiceService;
