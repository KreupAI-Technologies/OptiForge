import { apiClient } from './api/client';
import { USE_LIVE_API } from './api-flags';

// ============== Interfaces ==============

export interface SalesOrderItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  totalPrice: number;
  uom: string;
  deliveryDate?: string;
  notes?: string;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  quotationId?: string;
  quotationNumber?: string;
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  status: 'Draft' | 'Pending' | 'Confirmed' | 'Approved' | 'In Production' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid' | 'Refunded';
  paymentTerms: string;
  shippingAddress: string;
  billingAddress: string;
  items: SalesOrderItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;
  currency: string;
  salesPersonId?: string;
  salesPersonName?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesOrderStatistics {
  totalOrders: number;
  draftOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  inProductionOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  paidAmount: number;
  unpaidAmount: number;
  ordersByMonth: { month: string; count: number; revenue: number }[];
  topCustomers: { customerId: string; customerName: string; orderCount: number; totalValue: number }[];
  topProducts: { productId: string; productName: string; quantity: number; revenue: number }[];
}

export interface CreateSalesOrderDto {
  customerId: string;
  quotationId?: string;
  expectedDeliveryDate: string;
  paymentTerms: string;
  shippingAddress: string;
  billingAddress: string;
  items: Omit<SalesOrderItem, 'id' | 'totalPrice'>[];
  shippingCost?: number;
  notes?: string;
  internalNotes?: string;
  salesPersonId?: string;
}

export interface UpdateSalesOrderDto extends Partial<CreateSalesOrderDto> {
  status?: SalesOrder['status'];
  paymentStatus?: SalesOrder['paymentStatus'];
}

export interface PricingCalculationRequest {
  items: { productId: string; quantity: number }[];
  customerId?: string;
  discountCode?: string;
  shippingMethod?: string;
}

export interface PricingCalculationResult {
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
    totalPrice: number;
  }[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;
  currency: string;
  appliedDiscounts: string[];
}

export interface SalesOrderFilters {
  search?: string;
  status?: SalesOrder['status'];
  paymentStatus?: SalesOrder['paymentStatus'];
  customerId?: string;
  salesPersonId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============== Mock Data ==============

const USE_MOCK_DATA = !USE_LIVE_API;

export const MOCK_SALES_ORDERS: SalesOrder[] = [
  {
    id: 'so-001',
    orderNumber: 'SO-2024-0001',
    customerId: 'cust-001',
    customerName: 'Acme Manufacturing Corp',
    customerEmail: 'orders@acmemfg.com',
    customerPhone: '+1-555-0101',
    quotationId: 'qt-001',
    quotationNumber: 'QT-2024-0001',
    orderDate: '2024-01-15',
    expectedDeliveryDate: '2024-02-15',
    status: 'Confirmed',
    paymentStatus: 'Partial',
    paymentTerms: 'Net 30',
    shippingAddress: '123 Industrial Park, Detroit, MI 48201',
    billingAddress: '123 Industrial Park, Detroit, MI 48201',
    items: [
      { id: 'item-1', productId: 'prod-001', productCode: 'CNC-PART-001', productName: 'CNC Machined Bracket', quantity: 500, unitPrice: 25.00, discount: 5, tax: 8, totalPrice: 12000.00, uom: 'pcs' },
      { id: 'item-2', productId: 'prod-002', productCode: 'CAST-PART-001', productName: 'Aluminum Casting', quantity: 200, unitPrice: 75.00, discount: 0, tax: 8, totalPrice: 16200.00, uom: 'pcs' },
    ],
    subtotal: 27500.00,
    taxAmount: 2200.00,
    discountAmount: 625.00,
    shippingCost: 350.00,
    totalAmount: 29425.00,
    currency: 'USD',
    salesPersonId: 'user-001',
    salesPersonName: 'John Smith',
    approvedBy: 'manager-001',
    approvedAt: '2024-01-16T10:30:00Z',
    notes: 'Rush order - priority handling required',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-16T10:30:00Z',
  },
  {
    id: 'so-002',
    orderNumber: 'SO-2024-0002',
    customerId: 'cust-002',
    customerName: 'Global Auto Parts Inc',
    customerEmail: 'procurement@globalauto.com',
    customerPhone: '+1-555-0102',
    orderDate: '2024-01-18',
    expectedDeliveryDate: '2024-02-28',
    status: 'In Production',
    paymentStatus: 'Unpaid',
    paymentTerms: 'Net 45',
    shippingAddress: '456 Automotive Way, Toledo, OH 43604',
    billingAddress: '456 Automotive Way, Toledo, OH 43604',
    items: [
      { id: 'item-3', productId: 'prod-003', productCode: 'STAMP-001', productName: 'Stamped Steel Panel', quantity: 1000, unitPrice: 15.00, discount: 10, tax: 7.5, totalPrice: 14512.50, uom: 'pcs' },
    ],
    subtotal: 15000.00,
    taxAmount: 1012.50,
    discountAmount: 1500.00,
    shippingCost: 500.00,
    totalAmount: 15012.50,
    currency: 'USD',
    salesPersonId: 'user-002',
    salesPersonName: 'Sarah Johnson',
    createdAt: '2024-01-18T14:00:00Z',
    updatedAt: '2024-01-20T09:15:00Z',
  },
  {
    id: 'so-003',
    orderNumber: 'SO-2024-0003',
    customerId: 'cust-003',
    customerName: 'Precision Tools Ltd',
    customerEmail: 'orders@precisiontools.com',
    customerPhone: '+1-555-0103',
    orderDate: '2024-01-20',
    expectedDeliveryDate: '2024-03-01',
    status: 'Pending',
    paymentStatus: 'Unpaid',
    paymentTerms: 'Net 30',
    shippingAddress: '789 Tool Street, Cleveland, OH 44113',
    billingAddress: '789 Tool Street, Cleveland, OH 44113',
    items: [
      { id: 'item-4', productId: 'prod-004', productCode: 'TOOL-DIE-001', productName: 'Tool Steel Die', quantity: 10, unitPrice: 2500.00, discount: 0, tax: 8, totalPrice: 27000.00, uom: 'pcs' },
    ],
    subtotal: 25000.00,
    taxAmount: 2000.00,
    discountAmount: 0,
    shippingCost: 200.00,
    totalAmount: 27200.00,
    currency: 'USD',
    salesPersonId: 'user-001',
    salesPersonName: 'John Smith',
    notes: 'Requires quality certification documents',
    createdAt: '2024-01-20T11:30:00Z',
    updatedAt: '2024-01-20T11:30:00Z',
  },
  {
    id: 'so-004',
    orderNumber: 'SO-2024-0004',
    customerId: 'cust-004',
    customerName: 'Heavy Machinery Co',
    customerEmail: 'purchasing@heavymachinery.com',
    customerPhone: '+1-555-0104',
    orderDate: '2024-01-22',
    expectedDeliveryDate: '2024-03-15',
    actualDeliveryDate: '2024-03-12',
    status: 'Delivered',
    paymentStatus: 'Paid',
    paymentTerms: 'Net 60',
    shippingAddress: '321 Heavy Industrial Blvd, Pittsburgh, PA 15219',
    billingAddress: '321 Heavy Industrial Blvd, Pittsburgh, PA 15219',
    items: [
      { id: 'item-5', productId: 'prod-005', productCode: 'GEAR-001', productName: 'Heavy Duty Gear Assembly', quantity: 50, unitPrice: 450.00, discount: 5, tax: 6, totalPrice: 22657.50, uom: 'sets' },
      { id: 'item-6', productId: 'prod-006', productCode: 'SHAFT-001', productName: 'Drive Shaft', quantity: 50, unitPrice: 320.00, discount: 5, tax: 6, totalPrice: 16112.00, uom: 'pcs' },
    ],
    subtotal: 38500.00,
    taxAmount: 2310.00,
    discountAmount: 1925.00,
    shippingCost: 650.00,
    totalAmount: 39535.00,
    currency: 'USD',
    salesPersonId: 'user-003',
    salesPersonName: 'Mike Davis',
    approvedBy: 'manager-001',
    approvedAt: '2024-01-23T09:00:00Z',
    createdAt: '2024-01-22T16:00:00Z',
    updatedAt: '2024-03-12T14:20:00Z',
  },
  {
    id: 'so-005',
    orderNumber: 'SO-2024-0005',
    customerId: 'cust-005',
    customerName: 'Aerospace Components Inc',
    customerEmail: 'supply@aerospacecomp.com',
    customerPhone: '+1-555-0105',
    orderDate: '2024-01-25',
    expectedDeliveryDate: '2024-04-01',
    status: 'Approved',
    paymentStatus: 'Partial',
    paymentTerms: 'Net 30 - 50% Advance',
    shippingAddress: '555 Aerospace Park, Phoenix, AZ 85034',
    billingAddress: '555 Aerospace Park, Phoenix, AZ 85034',
    items: [
      { id: 'item-7', productId: 'prod-007', productCode: 'AERO-BRKT-001', productName: 'Aerospace Bracket - Titanium', quantity: 100, unitPrice: 850.00, discount: 3, tax: 5.5, totalPrice: 87017.50, uom: 'pcs' },
    ],
    subtotal: 85000.00,
    taxAmount: 4632.50,
    discountAmount: 2550.00,
    shippingCost: 1200.00,
    totalAmount: 88282.50,
    currency: 'USD',
    salesPersonId: 'user-002',
    salesPersonName: 'Sarah Johnson',
    approvedBy: 'manager-002',
    approvedAt: '2024-01-26T11:00:00Z',
    notes: 'AS9100 certification required',
    internalNotes: 'High-value customer - ensure premium service',
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-26T11:00:00Z',
  },
  {
    id: 'so-006',
    orderNumber: 'SO-2024-0006',
    customerId: 'cust-006',
    customerName: 'Electric Motors Ltd',
    customerEmail: 'orders@electricmotors.com',
    customerPhone: '+1-555-0106',
    orderDate: '2024-01-28',
    expectedDeliveryDate: '2024-02-20',
    status: 'Shipped',
    paymentStatus: 'Paid',
    paymentTerms: 'Net 15',
    shippingAddress: '888 Motor Drive, Milwaukee, WI 53202',
    billingAddress: '888 Motor Drive, Milwaukee, WI 53202',
    items: [
      { id: 'item-8', productId: 'prod-008', productCode: 'ROTOR-001', productName: 'Motor Rotor Assembly', quantity: 200, unitPrice: 125.00, discount: 0, tax: 5, totalPrice: 26250.00, uom: 'pcs' },
      { id: 'item-9', productId: 'prod-009', productCode: 'STATOR-001', productName: 'Stator Core', quantity: 200, unitPrice: 95.00, discount: 0, tax: 5, totalPrice: 19950.00, uom: 'pcs' },
    ],
    subtotal: 44000.00,
    taxAmount: 2200.00,
    discountAmount: 0,
    shippingCost: 400.00,
    totalAmount: 46600.00,
    currency: 'USD',
    salesPersonId: 'user-001',
    salesPersonName: 'John Smith',
    approvedBy: 'manager-001',
    approvedAt: '2024-01-29T08:30:00Z',
    createdAt: '2024-01-28T13:00:00Z',
    updatedAt: '2024-02-15T16:45:00Z',
  },
  {
    id: 'so-007',
    orderNumber: 'SO-2024-0007',
    customerId: 'cust-007',
    customerName: 'Marine Equipment Corp',
    customerEmail: 'procurement@marineequip.com',
    customerPhone: '+1-555-0107',
    orderDate: '2024-01-30',
    expectedDeliveryDate: '2024-03-30',
    status: 'Draft',
    paymentStatus: 'Unpaid',
    paymentTerms: 'Net 45',
    shippingAddress: '222 Harbor Way, Seattle, WA 98101',
    billingAddress: '222 Harbor Way, Seattle, WA 98101',
    items: [
      { id: 'item-10', productId: 'prod-010', productCode: 'MARINE-001', productName: 'Marine Grade Propeller', quantity: 20, unitPrice: 3500.00, discount: 8, tax: 9.5, totalPrice: 70490.00, uom: 'pcs' },
    ],
    subtotal: 70000.00,
    taxAmount: 6090.00,
    discountAmount: 5600.00,
    shippingCost: 1500.00,
    totalAmount: 71990.00,
    currency: 'USD',
    salesPersonId: 'user-003',
    salesPersonName: 'Mike Davis',
    notes: 'Waiting for customer confirmation on specs',
    createdAt: '2024-01-30T09:00:00Z',
    updatedAt: '2024-01-30T09:00:00Z',
  },
  {
    id: 'so-008',
    orderNumber: 'SO-2024-0008',
    customerId: 'cust-008',
    customerName: 'Medical Devices Inc',
    customerEmail: 'supply@meddevices.com',
    customerPhone: '+1-555-0108',
    orderDate: '2024-02-01',
    expectedDeliveryDate: '2024-02-28',
    status: 'Cancelled',
    paymentStatus: 'Refunded',
    paymentTerms: 'Net 30',
    shippingAddress: '444 Medical Center Dr, Boston, MA 02118',
    billingAddress: '444 Medical Center Dr, Boston, MA 02118',
    items: [
      { id: 'item-11', productId: 'prod-011', productCode: 'MED-COMP-001', productName: 'Surgical Instrument Component', quantity: 500, unitPrice: 45.00, discount: 0, tax: 0, totalPrice: 22500.00, uom: 'pcs' },
    ],
    subtotal: 22500.00,
    taxAmount: 0,
    discountAmount: 0,
    shippingCost: 250.00,
    totalAmount: 22750.00,
    currency: 'USD',
    salesPersonId: 'user-002',
    salesPersonName: 'Sarah Johnson',
    notes: 'Cancelled due to change in customer requirements',
    createdAt: '2024-02-01T11:00:00Z',
    updatedAt: '2024-02-05T14:30:00Z',
  },
  {
    id: 'so-009',
    orderNumber: 'SO-2024-0009',
    customerId: 'cust-009',
    customerName: 'Rail Systems LLC',
    customerEmail: 'purchasing@railsystems.com',
    customerPhone: '+1-555-0109',
    orderDate: '2024-02-05',
    expectedDeliveryDate: '2024-04-15',
    status: 'Confirmed',
    paymentStatus: 'Unpaid',
    paymentTerms: 'Net 60',
    shippingAddress: '666 Railway Ave, Chicago, IL 60607',
    billingAddress: '666 Railway Ave, Chicago, IL 60607',
    items: [
      { id: 'item-12', productId: 'prod-012', productCode: 'RAIL-WHEEL-001', productName: 'Railway Wheel Set', quantity: 40, unitPrice: 8500.00, discount: 5, tax: 6.25, totalPrice: 342937.50, uom: 'sets' },
    ],
    subtotal: 340000.00,
    taxAmount: 19937.50,
    discountAmount: 17000.00,
    shippingCost: 3500.00,
    totalAmount: 346437.50,
    currency: 'USD',
    salesPersonId: 'user-003',
    salesPersonName: 'Mike Davis',
    approvedBy: 'manager-002',
    approvedAt: '2024-02-06T10:00:00Z',
    notes: 'Long-term contract order - Year 1 of 3',
    internalNotes: 'Strategic customer - quarterly reviews scheduled',
    createdAt: '2024-02-05T08:30:00Z',
    updatedAt: '2024-02-06T10:00:00Z',
  },
  {
    id: 'so-010',
    orderNumber: 'SO-2024-0010',
    customerId: 'cust-010',
    customerName: 'Construction Equipment Co',
    customerEmail: 'orders@constructequip.com',
    customerPhone: '+1-555-0110',
    orderDate: '2024-02-08',
    expectedDeliveryDate: '2024-03-20',
    status: 'In Production',
    paymentStatus: 'Partial',
    paymentTerms: 'Net 30 - 30% Advance',
    shippingAddress: '999 Construction Blvd, Houston, TX 77001',
    billingAddress: '999 Construction Blvd, Houston, TX 77001',
    items: [
      { id: 'item-13', productId: 'prod-013', productCode: 'BUCKET-001', productName: 'Excavator Bucket', quantity: 15, unitPrice: 4200.00, discount: 0, tax: 8.25, totalPrice: 68197.50, uom: 'pcs' },
      { id: 'item-14', productId: 'prod-014', productCode: 'TEETH-001', productName: 'Bucket Teeth Set', quantity: 30, unitPrice: 850.00, discount: 10, tax: 8.25, totalPrice: 24862.50, uom: 'sets' },
    ],
    subtotal: 88500.00,
    taxAmount: 7001.25,
    discountAmount: 2550.00,
    shippingCost: 950.00,
    totalAmount: 93901.25,
    currency: 'USD',
    salesPersonId: 'user-001',
    salesPersonName: 'John Smith',
    approvedBy: 'manager-001',
    approvedAt: '2024-02-09T09:15:00Z',
    createdAt: '2024-02-08T15:00:00Z',
    updatedAt: '2024-02-10T11:30:00Z',
  },
];

const MOCK_STATISTICS: SalesOrderStatistics = {
  totalOrders: 10,
  draftOrders: 1,
  pendingOrders: 1,
  confirmedOrders: 2,
  inProductionOrders: 2,
  shippedOrders: 1,
  deliveredOrders: 1,
  cancelledOrders: 1,
  totalRevenue: 881394.25,
  averageOrderValue: 88139.43,
  paidAmount: 86135.00,
  unpaidAmount: 795259.25,
  ordersByMonth: [
    { month: '2024-01', count: 7, revenue: 313054.50 },
    { month: '2024-02', count: 3, revenue: 463088.75 },
  ],
  topCustomers: [
    { customerId: 'cust-009', customerName: 'Rail Systems LLC', orderCount: 1, totalValue: 346437.50 },
    { customerId: 'cust-010', customerName: 'Construction Equipment Co', orderCount: 1, totalValue: 93901.25 },
    { customerId: 'cust-005', customerName: 'Aerospace Components Inc', orderCount: 1, totalValue: 88282.50 },
  ],
  topProducts: [
    { productId: 'prod-012', productName: 'Railway Wheel Set', quantity: 40, revenue: 342937.50 },
    { productId: 'prod-007', productName: 'Aerospace Bracket - Titanium', quantity: 100, revenue: 87017.50 },
    { productId: 'prod-010', productName: 'Marine Grade Propeller', quantity: 20, revenue: 70490.00 },
  ],
};

// ============== Service Class ==============

class SalesOrderService {
  private buildQueryParams(filters?: SalesOrderFilters): string {
    if (!filters) return '';
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
    if (filters.customerId) params.append('customerId', filters.customerId);
    if (filters.salesPersonId) params.append('salesPersonId', filters.salesPersonId);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    return params.toString();
  }

  async getAllOrders(filters?: SalesOrderFilters): Promise<{ data: SalesOrder[]; total: number }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredOrders = [...MOCK_SALES_ORDERS];

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredOrders = filteredOrders.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(searchLower) ||
            o.customerName.toLowerCase().includes(searchLower)
        );
      }
      if (filters?.status) {
        filteredOrders = filteredOrders.filter((o) => o.status === filters.status);
      }
      if (filters?.paymentStatus) {
        filteredOrders = filteredOrders.filter((o) => o.paymentStatus === filters.paymentStatus);
      }
      if (filters?.customerId) {
        filteredOrders = filteredOrders.filter((o) => o.customerId === filters.customerId);
      }
      if (filters?.salesPersonId) {
        filteredOrders = filteredOrders.filter((o) => o.salesPersonId === filters.salesPersonId);
      }

      return { data: filteredOrders, total: filteredOrders.length };
    }

    const queryString = this.buildQueryParams(filters);
    const response = await apiClient.get<{ data: SalesOrder[]; total: number }>(
      `/sales-masters/orders-v2${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  }

  async getOrderById(id: string): Promise<SalesOrder> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const order = MOCK_SALES_ORDERS.find((o) => o.id === id);
      if (!order) throw new Error('Sales order not found');
      return order;
    }

    const response = await apiClient.get<SalesOrder>(`/sales-masters/orders-v2/${id}`);
    return response.data;
  }

  async getOrderStatistics(): Promise<SalesOrderStatistics> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return MOCK_STATISTICS;
    }

    const response = await apiClient.get<SalesOrderStatistics>('/sales-masters/orders-v2/statistics');
    return response.data;
  }

  async createOrder(data: CreateSalesOrderDto): Promise<SalesOrder> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const orderNumber = `SO-2024-${String(MOCK_SALES_ORDERS.length + 1).padStart(4, '0')}`;
      const newOrder: SalesOrder = {
        id: `so-${Date.now()}`,
        orderNumber,
        customerId: data.customerId,
        customerName: 'New Customer',
        quotationId: data.quotationId,
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: data.expectedDeliveryDate,
        status: 'Draft',
        paymentStatus: 'Unpaid',
        paymentTerms: data.paymentTerms,
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        items: data.items.map((item, index) => ({
          ...item,
          id: `item-${Date.now()}-${index}`,
          totalPrice: item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100) * (1 + (item.tax || 0) / 100),
        })) as SalesOrderItem[],
        subtotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        shippingCost: data.shippingCost || 0,
        totalAmount: 0,
        currency: 'USD',
        salesPersonId: data.salesPersonId,
        notes: data.notes,
        internalNotes: data.internalNotes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_SALES_ORDERS.push(newOrder);
      return newOrder;
    }

    const response = await apiClient.post<SalesOrder>('/sales-masters/orders-v2', data);
    return response.data;
  }

  /**
   * Create a sales order against the Prisma-backed NestJS endpoint using the
   * backend-native payload shape (`items` with camelCase line fields) plus the
   * required x-company-id header. Returns the created order (raw backend shape).
   * Used by /sales/orders/create-enhanced.
   */
  async createOrderEnhanced(payload: {
    companyId: string;
    customerId?: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    requestedDeliveryDate?: string;
    paymentTerms?: string;
    deliveryTerms?: string;
    shippingMethod?: string;
    priority?: string;
    notes?: string;
    termsAndConditions?: string;
    status?: string;
    items: {
      itemName: string;
      itemCode?: string;
      quantity: number;
      uom?: string;
      unitPrice: number;
      discountPercent?: number;
      taxRate?: number;
    }[];
  }): Promise<Record<string, unknown>> {
    const { companyId, ...body } = payload;
    const response = await apiClient.request<Record<string, unknown>>({
      url: '/sales-masters/orders-v2',
      method: 'POST',
      data: { ...body, companyId },
      headers: { 'x-company-id': companyId },
    });
    // NestJS returns the created entity directly (not wrapped); fall back safely.
    const wrapped = response as unknown as { data?: Record<string, unknown> } & Record<string, unknown>;
    return wrapped?.data ?? wrapped;
  }

  async updateOrder(id: string, data: UpdateSalesOrderDto): Promise<SalesOrder> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_SALES_ORDERS.findIndex((o) => o.id === id);
      if (index === -1) throw new Error('Sales order not found');

      MOCK_SALES_ORDERS[index] = {
        ...MOCK_SALES_ORDERS[index],
        ...data,
        updatedAt: new Date().toISOString(),
      } as SalesOrder;
      return MOCK_SALES_ORDERS[index];
    }

    const response = await apiClient.put<SalesOrder>(`/sales-masters/orders-v2/${id}`, data);
    return response.data;
  }

  async confirmOrder(id: string): Promise<SalesOrder> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_SALES_ORDERS.findIndex((o) => o.id === id);
      if (index === -1) throw new Error('Sales order not found');

      MOCK_SALES_ORDERS[index] = {
        ...MOCK_SALES_ORDERS[index],
        status: 'Confirmed',
        updatedAt: new Date().toISOString(),
      };
      return MOCK_SALES_ORDERS[index];
    }

    const response = await apiClient.post<SalesOrder>(`/sales-masters/orders-v2/${id}/confirm`, {});
    return response.data;
  }

  async approveOrder(id: string): Promise<SalesOrder> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_SALES_ORDERS.findIndex((o) => o.id === id);
      if (index === -1) throw new Error('Sales order not found');

      MOCK_SALES_ORDERS[index] = {
        ...MOCK_SALES_ORDERS[index],
        status: 'Approved',
        approvedAt: new Date().toISOString(),
        approvedBy: 'current-user',
        updatedAt: new Date().toISOString(),
      };
      return MOCK_SALES_ORDERS[index];
    }

    const response = await apiClient.post<SalesOrder>(`/sales-masters/orders-v2/${id}/approve`, {});
    return response.data;
  }

  async calculatePricing(data: PricingCalculationRequest): Promise<PricingCalculationResult> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const items = data.items.map((item) => ({
        productId: item.productId,
        productName: `Product ${item.productId}`,
        quantity: item.quantity,
        unitPrice: 100.00,
        discount: data.discountCode ? 10 : 0,
        tax: 8,
        totalPrice: item.quantity * 100 * (data.discountCode ? 0.9 : 1) * 1.08,
      }));

      const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const discountAmount = data.discountCode ? subtotal * 0.1 : 0;
      const taxAmount = (subtotal - discountAmount) * 0.08;
      const shippingCost = data.shippingMethod === 'express' ? 50 : 25;

      return {
        items,
        subtotal,
        taxAmount,
        discountAmount,
        shippingCost,
        totalAmount: subtotal - discountAmount + taxAmount + shippingCost,
        currency: 'USD',
        appliedDiscounts: data.discountCode ? [data.discountCode] : [],
      };
    }

    const response = await apiClient.post<PricingCalculationResult>(
      '/sales-masters/orders-v2/pricing/calculate',
      data
    );
    return response.data;
  }
}

export const salesOrderService = new SalesOrderService();
