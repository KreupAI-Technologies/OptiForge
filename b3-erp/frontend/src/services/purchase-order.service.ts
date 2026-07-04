import { apiClient } from './api/client';
import { USE_LIVE_API } from './api-flags';

// ==================== TypeScript Interfaces ====================

export type POStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Sent to Vendor' | 'Partially Received' | 'Fully Received' | 'Closed' | 'Cancelled';

export interface PurchaseOrderItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  description?: string;
  quantity: number;
  receivedQuantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  deliveryDate: string;
  warehouseId?: string;
  warehouseName?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  prReference?: string;
  rfqReference?: string;
  vendorId: string;
  vendorCode: string;
  vendorName: string;
  vendorAddress?: string;
  vendorContact?: string;
  orderDate: string;
  deliveryDate: string;
  status: POStatus;
  paymentTerms: string;
  currency: string;
  exchangeRate: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  notes?: string;
  terms?: string;
  items: PurchaseOrderItem[];
  approvedBy?: string;
  approvedAt?: string;
  sentToVendorAt?: string;
  closedAt?: string;
  closedBy?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderDto {
  vendorId: string;
  deliveryDate: string;
  paymentTerms: string;
  currency: string;
  notes?: string;
  terms?: string;
  items: {
    itemId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
    deliveryDate: string;
    warehouseId?: string;
  }[];
}

export interface UpdatePurchaseOrderDto extends Partial<CreatePurchaseOrderDto> {
  status?: POStatus;
}

export interface PurchaseOrderFilters {
  status?: POStatus;
  vendorId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ==================== Mock Data Toggle ====================

const USE_MOCK_DATA = !USE_LIVE_API;

const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-001',
    poNumber: 'PO-2026-001',
    prReference: 'PR-2026-001',
    vendorId: 'vendor-001',
    vendorCode: 'V-001',
    vendorName: 'Steel Dynamics Inc.',
    vendorAddress: '123 Industrial Ave, Chicago, IL 60601',
    vendorContact: 'John Smith - john@steeldynamics.com',
    orderDate: '2026-01-15',
    deliveryDate: '2026-02-15',
    status: 'Approved',
    paymentTerms: 'Net 30',
    currency: 'USD',
    exchangeRate: 1.0,
    subtotal: 125000,
    discountAmount: 6250,
    taxAmount: 10687.5,
    shippingCost: 2500,
    totalAmount: 131937.5,
    notes: 'Urgent order for production line',
    items: [
      {
        id: 'poi-001-1',
        itemId: 'item-001',
        itemCode: 'STL-001',
        itemName: 'Steel Plates 10mm',
        description: 'High-grade steel plates',
        quantity: 500,
        receivedQuantity: 0,
        unit: 'KG',
        unitPrice: 150,
        discount: 5,
        taxRate: 9,
        taxAmount: 6412.5,
        totalAmount: 77662.5,
        deliveryDate: '2026-02-15',
        warehouseId: 'wh-001',
        warehouseName: 'Main Warehouse'
      },
      {
        id: 'poi-001-2',
        itemId: 'item-002',
        itemCode: 'STL-002',
        itemName: 'Steel Rods 20mm',
        quantity: 200,
        receivedQuantity: 0,
        unit: 'KG',
        unitPrice: 200,
        discount: 5,
        taxRate: 9,
        taxAmount: 3420,
        totalAmount: 41420,
        deliveryDate: '2026-02-15',
        warehouseId: 'wh-001',
        warehouseName: 'Main Warehouse'
      }
    ],
    approvedBy: 'Michael Johnson',
    approvedAt: '2026-01-16T10:30:00Z',
    createdBy: 'Sarah Davis',
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-01-16T10:30:00Z'
  },
  {
    id: 'po-002',
    poNumber: 'PO-2026-002',
    rfqReference: 'RFQ-2026-005',
    vendorId: 'vendor-002',
    vendorCode: 'V-002',
    vendorName: 'Precision Parts Ltd.',
    vendorAddress: '456 Manufacturing Blvd, Detroit, MI 48201',
    vendorContact: 'Emily Chen - emily@precisionparts.com',
    orderDate: '2026-01-18',
    deliveryDate: '2026-02-28',
    status: 'Sent to Vendor',
    paymentTerms: 'Net 45',
    currency: 'USD',
    exchangeRate: 1.0,
    subtotal: 78500,
    discountAmount: 3925,
    taxAmount: 6711.75,
    shippingCost: 1500,
    totalAmount: 82786.75,
    items: [
      {
        id: 'poi-002-1',
        itemId: 'item-003',
        itemCode: 'BEAR-001',
        itemName: 'Industrial Bearings',
        quantity: 1000,
        receivedQuantity: 0,
        unit: 'PCS',
        unitPrice: 45,
        discount: 5,
        taxRate: 9,
        taxAmount: 3847.5,
        totalAmount: 46597.5,
        deliveryDate: '2026-02-28',
        warehouseId: 'wh-002',
        warehouseName: 'Parts Warehouse'
      },
      {
        id: 'poi-002-2',
        itemId: 'item-004',
        itemCode: 'GEAR-001',
        itemName: 'Precision Gears',
        quantity: 500,
        receivedQuantity: 0,
        unit: 'PCS',
        unitPrice: 62,
        discount: 5,
        taxRate: 9,
        taxAmount: 2651.7,
        totalAmount: 32118.2,
        deliveryDate: '2026-02-28',
        warehouseId: 'wh-002',
        warehouseName: 'Parts Warehouse'
      }
    ],
    approvedBy: 'Michael Johnson',
    approvedAt: '2026-01-19T14:00:00Z',
    sentToVendorAt: '2026-01-20T09:00:00Z',
    createdBy: 'Robert Wilson',
    createdAt: '2026-01-18T11:00:00Z',
    updatedAt: '2026-01-20T09:00:00Z'
  },
  {
    id: 'po-003',
    poNumber: 'PO-2026-003',
    prReference: 'PR-2026-003',
    vendorId: 'vendor-003',
    vendorCode: 'V-003',
    vendorName: 'Chemical Solutions Corp.',
    vendorAddress: '789 Chemical Way, Houston, TX 77001',
    vendorContact: 'David Brown - david@chemsolutions.com',
    orderDate: '2026-01-10',
    deliveryDate: '2026-01-25',
    status: 'Partially Received',
    paymentTerms: 'Net 30',
    currency: 'USD',
    exchangeRate: 1.0,
    subtotal: 45000,
    discountAmount: 0,
    taxAmount: 4050,
    shippingCost: 800,
    totalAmount: 49850,
    items: [
      {
        id: 'poi-003-1',
        itemId: 'item-005',
        itemCode: 'CHEM-001',
        itemName: 'Industrial Lubricant',
        quantity: 200,
        receivedQuantity: 150,
        unit: 'LTR',
        unitPrice: 125,
        discount: 0,
        taxRate: 9,
        taxAmount: 2250,
        totalAmount: 27250,
        deliveryDate: '2026-01-25',
        warehouseId: 'wh-003',
        warehouseName: 'Chemical Storage'
      },
      {
        id: 'poi-003-2',
        itemId: 'item-006',
        itemCode: 'CHEM-002',
        itemName: 'Coolant Fluid',
        quantity: 100,
        receivedQuantity: 100,
        unit: 'LTR',
        unitPrice: 200,
        discount: 0,
        taxRate: 9,
        taxAmount: 1800,
        totalAmount: 21800,
        deliveryDate: '2026-01-25',
        warehouseId: 'wh-003',
        warehouseName: 'Chemical Storage'
      }
    ],
    approvedBy: 'Lisa Anderson',
    approvedAt: '2026-01-11T08:00:00Z',
    sentToVendorAt: '2026-01-11T10:00:00Z',
    createdBy: 'Sarah Davis',
    createdAt: '2026-01-10T15:00:00Z',
    updatedAt: '2026-01-22T16:00:00Z'
  },
  {
    id: 'po-004',
    poNumber: 'PO-2026-004',
    vendorId: 'vendor-004',
    vendorCode: 'V-004',
    vendorName: 'ElectroTech Industries',
    vendorAddress: '321 Tech Park, San Jose, CA 95110',
    vendorContact: 'Anna Lee - anna@electrotech.com',
    orderDate: '2026-01-20',
    deliveryDate: '2026-03-01',
    status: 'Draft',
    paymentTerms: 'Net 60',
    currency: 'USD',
    exchangeRate: 1.0,
    subtotal: 156000,
    discountAmount: 15600,
    taxAmount: 12636,
    shippingCost: 3500,
    totalAmount: 156536,
    items: [
      {
        id: 'poi-004-1',
        itemId: 'item-007',
        itemCode: 'ELEC-001',
        itemName: 'Industrial Motors 5HP',
        quantity: 50,
        receivedQuantity: 0,
        unit: 'PCS',
        unitPrice: 1200,
        discount: 10,
        taxRate: 9,
        taxAmount: 4860,
        totalAmount: 58860,
        deliveryDate: '2026-03-01',
        warehouseId: 'wh-004',
        warehouseName: 'Equipment Warehouse'
      },
      {
        id: 'poi-004-2',
        itemId: 'item-008',
        itemCode: 'ELEC-002',
        itemName: 'Control Panels',
        quantity: 30,
        receivedQuantity: 0,
        unit: 'PCS',
        unitPrice: 3200,
        discount: 10,
        taxRate: 9,
        taxAmount: 7776,
        totalAmount: 94176,
        deliveryDate: '2026-03-01',
        warehouseId: 'wh-004',
        warehouseName: 'Equipment Warehouse'
      }
    ],
    createdBy: 'Robert Wilson',
    createdAt: '2026-01-20T14:00:00Z',
    updatedAt: '2026-01-20T14:00:00Z'
  },
  {
    id: 'po-005',
    poNumber: 'PO-2026-005',
    prReference: 'PR-2026-005',
    vendorId: 'vendor-005',
    vendorCode: 'V-005',
    vendorName: 'FastenerWorld LLC',
    vendorAddress: '555 Hardware St, Cleveland, OH 44101',
    vendorContact: 'Mark Thompson - mark@fastenerworld.com',
    orderDate: '2026-01-05',
    deliveryDate: '2026-01-20',
    status: 'Fully Received',
    paymentTerms: 'Net 15',
    currency: 'USD',
    exchangeRate: 1.0,
    subtotal: 18500,
    discountAmount: 925,
    taxAmount: 1581.75,
    shippingCost: 350,
    totalAmount: 19506.75,
    items: [
      {
        id: 'poi-005-1',
        itemId: 'item-009',
        itemCode: 'FAST-001',
        itemName: 'Hex Bolts M10',
        quantity: 5000,
        receivedQuantity: 5000,
        unit: 'PCS',
        unitPrice: 1.5,
        discount: 5,
        taxRate: 9,
        taxAmount: 641.25,
        totalAmount: 7766.25,
        deliveryDate: '2026-01-20',
        warehouseId: 'wh-002',
        warehouseName: 'Parts Warehouse'
      },
      {
        id: 'poi-005-2',
        itemId: 'item-010',
        itemCode: 'FAST-002',
        itemName: 'Hex Nuts M10',
        quantity: 5000,
        receivedQuantity: 5000,
        unit: 'PCS',
        unitPrice: 0.8,
        discount: 5,
        taxRate: 9,
        taxAmount: 342,
        totalAmount: 4142,
        deliveryDate: '2026-01-20',
        warehouseId: 'wh-002',
        warehouseName: 'Parts Warehouse'
      },
      {
        id: 'poi-005-3',
        itemId: 'item-011',
        itemCode: 'FAST-003',
        itemName: 'Washers M10',
        quantity: 10000,
        receivedQuantity: 10000,
        unit: 'PCS',
        unitPrice: 0.35,
        discount: 5,
        taxRate: 9,
        taxAmount: 299.25,
        totalAmount: 3624.25,
        deliveryDate: '2026-01-20',
        warehouseId: 'wh-002',
        warehouseName: 'Parts Warehouse'
      }
    ],
    approvedBy: 'Michael Johnson',
    approvedAt: '2026-01-06T09:00:00Z',
    sentToVendorAt: '2026-01-06T11:00:00Z',
    createdBy: 'Sarah Davis',
    createdAt: '2026-01-05T10:00:00Z',
    updatedAt: '2026-01-20T17:00:00Z'
  },
  {
    id: 'po-006',
    poNumber: 'PO-2026-006',
    vendorId: 'vendor-006',
    vendorCode: 'V-006',
    vendorName: 'PackPro Materials',
    vendorAddress: '888 Packaging Ln, Atlanta, GA 30301',
    vendorContact: 'Jennifer White - jen@packpro.com',
    orderDate: '2026-01-22',
    deliveryDate: '2026-02-10',
    status: 'Pending Approval',
    paymentTerms: 'Net 30',
    currency: 'USD',
    exchangeRate: 1.0,
    subtotal: 32000,
    discountAmount: 1600,
    taxAmount: 2736,
    shippingCost: 600,
    totalAmount: 33736,
    items: [
      {
        id: 'poi-006-1',
        itemId: 'item-012',
        itemCode: 'PACK-001',
        itemName: 'Corrugated Boxes Large',
        quantity: 2000,
        receivedQuantity: 0,
        unit: 'PCS',
        unitPrice: 8,
        discount: 5,
        taxRate: 9,
        taxAmount: 1368,
        totalAmount: 16568,
        deliveryDate: '2026-02-10',
        warehouseId: 'wh-005',
        warehouseName: 'Packaging Warehouse'
      },
      {
        id: 'poi-006-2',
        itemId: 'item-013',
        itemCode: 'PACK-002',
        itemName: 'Pallet Wrap',
        quantity: 100,
        receivedQuantity: 0,
        unit: 'ROLL',
        unitPrice: 160,
        discount: 5,
        taxRate: 9,
        taxAmount: 1368,
        totalAmount: 16568,
        deliveryDate: '2026-02-10',
        warehouseId: 'wh-005',
        warehouseName: 'Packaging Warehouse'
      }
    ],
    createdBy: 'Robert Wilson',
    createdAt: '2026-01-22T09:00:00Z',
    updatedAt: '2026-01-22T09:00:00Z'
  },
  {
    id: 'po-007',
    poNumber: 'PO-2026-007',
    rfqReference: 'RFQ-2026-008',
    vendorId: 'vendor-007',
    vendorCode: 'V-007',
    vendorName: 'ToolMaster Co.',
    vendorAddress: '999 Tool Ave, Pittsburgh, PA 15201',
    vendorContact: 'Chris Martinez - chris@toolmaster.com',
    orderDate: '2026-01-08',
    deliveryDate: '2026-01-30',
    status: 'Closed',
    paymentTerms: 'Net 30',
    currency: 'USD',
    exchangeRate: 1.0,
    subtotal: 67500,
    discountAmount: 3375,
    taxAmount: 5771.25,
    shippingCost: 1200,
    totalAmount: 71096.25,
    items: [
      {
        id: 'poi-007-1',
        itemId: 'item-014',
        itemCode: 'TOOL-001',
        itemName: 'CNC End Mills Set',
        quantity: 25,
        receivedQuantity: 25,
        unit: 'SET',
        unitPrice: 1500,
        discount: 5,
        taxRate: 9,
        taxAmount: 3206.25,
        totalAmount: 38831.25,
        deliveryDate: '2026-01-30',
        warehouseId: 'wh-006',
        warehouseName: 'Tool Crib'
      },
      {
        id: 'poi-007-2',
        itemId: 'item-015',
        itemCode: 'TOOL-002',
        itemName: 'Drill Bits Industrial',
        quantity: 50,
        receivedQuantity: 50,
        unit: 'SET',
        unitPrice: 600,
        discount: 5,
        taxRate: 9,
        taxAmount: 2565,
        totalAmount: 31065,
        deliveryDate: '2026-01-30',
        warehouseId: 'wh-006',
        warehouseName: 'Tool Crib'
      }
    ],
    approvedBy: 'Lisa Anderson',
    approvedAt: '2026-01-09T10:00:00Z',
    sentToVendorAt: '2026-01-09T14:00:00Z',
    closedAt: '2026-01-31T16:00:00Z',
    closedBy: 'Sarah Davis',
    createdBy: 'Robert Wilson',
    createdAt: '2026-01-08T11:00:00Z',
    updatedAt: '2026-01-31T16:00:00Z'
  },
  {
    id: 'po-008',
    poNumber: 'PO-2026-008',
    prReference: 'PR-2026-008',
    vendorId: 'vendor-001',
    vendorCode: 'V-001',
    vendorName: 'Steel Dynamics Inc.',
    vendorAddress: '123 Industrial Ave, Chicago, IL 60601',
    vendorContact: 'John Smith - john@steeldynamics.com',
    orderDate: '2026-01-23',
    deliveryDate: '2026-02-20',
    status: 'Approved',
    paymentTerms: 'Net 30',
    currency: 'USD',
    exchangeRate: 1.0,
    subtotal: 89000,
    discountAmount: 4450,
    taxAmount: 7609.5,
    shippingCost: 1800,
    totalAmount: 93959.5,
    items: [
      {
        id: 'poi-008-1',
        itemId: 'item-016',
        itemCode: 'STL-003',
        itemName: 'Stainless Steel Sheets',
        quantity: 300,
        receivedQuantity: 0,
        unit: 'KG',
        unitPrice: 220,
        discount: 5,
        taxRate: 9,
        taxAmount: 5643,
        totalAmount: 68343,
        deliveryDate: '2026-02-20',
        warehouseId: 'wh-001',
        warehouseName: 'Main Warehouse'
      },
      {
        id: 'poi-008-2',
        itemId: 'item-017',
        itemCode: 'STL-004',
        itemName: 'Aluminum Bars',
        quantity: 100,
        receivedQuantity: 0,
        unit: 'KG',
        unitPrice: 230,
        discount: 5,
        taxRate: 9,
        taxAmount: 1966.5,
        totalAmount: 23816.5,
        deliveryDate: '2026-02-20',
        warehouseId: 'wh-001',
        warehouseName: 'Main Warehouse'
      }
    ],
    approvedBy: 'Michael Johnson',
    approvedAt: '2026-01-24T11:00:00Z',
    createdBy: 'Sarah Davis',
    createdAt: '2026-01-23T09:00:00Z',
    updatedAt: '2026-01-24T11:00:00Z'
  },
  {
    id: 'po-009',
    poNumber: 'PO-2026-009',
    vendorId: 'vendor-008',
    vendorCode: 'V-008',
    vendorName: 'SafetyFirst Equipment',
    vendorAddress: '444 Safety Blvd, Indianapolis, IN 46201',
    vendorContact: 'Tom Garcia - tom@safetyfirst.com',
    orderDate: '2026-01-25',
    deliveryDate: '2026-02-05',
    status: 'Sent to Vendor',
    paymentTerms: 'Net 15',
    currency: 'USD',
    exchangeRate: 1.0,
    subtotal: 24500,
    discountAmount: 0,
    taxAmount: 2205,
    shippingCost: 400,
    totalAmount: 27105,
    items: [
      {
        id: 'poi-009-1',
        itemId: 'item-018',
        itemCode: 'SAFE-001',
        itemName: 'Safety Helmets',
        quantity: 200,
        receivedQuantity: 0,
        unit: 'PCS',
        unitPrice: 35,
        discount: 0,
        taxRate: 9,
        taxAmount: 630,
        totalAmount: 7630,
        deliveryDate: '2026-02-05',
        warehouseId: 'wh-007',
        warehouseName: 'Safety Stock'
      },
      {
        id: 'poi-009-2',
        itemId: 'item-019',
        itemCode: 'SAFE-002',
        itemName: 'Safety Goggles',
        quantity: 300,
        receivedQuantity: 0,
        unit: 'PCS',
        unitPrice: 25,
        discount: 0,
        taxRate: 9,
        taxAmount: 675,
        totalAmount: 8175,
        deliveryDate: '2026-02-05',
        warehouseId: 'wh-007',
        warehouseName: 'Safety Stock'
      },
      {
        id: 'poi-009-3',
        itemId: 'item-020',
        itemCode: 'SAFE-003',
        itemName: 'Work Gloves',
        quantity: 500,
        receivedQuantity: 0,
        unit: 'PAIR',
        unitPrice: 18,
        discount: 0,
        taxRate: 9,
        taxAmount: 810,
        totalAmount: 9810,
        deliveryDate: '2026-02-05',
        warehouseId: 'wh-007',
        warehouseName: 'Safety Stock'
      }
    ],
    approvedBy: 'Lisa Anderson',
    approvedAt: '2026-01-25T14:00:00Z',
    sentToVendorAt: '2026-01-25T16:00:00Z',
    createdBy: 'Robert Wilson',
    createdAt: '2026-01-25T10:00:00Z',
    updatedAt: '2026-01-25T16:00:00Z'
  },
  {
    id: 'po-010',
    poNumber: 'PO-2026-010',
    prReference: 'PR-2026-010',
    rfqReference: 'RFQ-2026-010',
    vendorId: 'vendor-009',
    vendorCode: 'V-009',
    vendorName: 'HydraulicPro Systems',
    vendorAddress: '666 Fluid Dr, Milwaukee, WI 53201',
    vendorContact: 'Kevin Taylor - kevin@hydraulicpro.com',
    orderDate: '2026-01-12',
    deliveryDate: '2026-02-12',
    status: 'Cancelled',
    paymentTerms: 'Net 45',
    currency: 'USD',
    exchangeRate: 1.0,
    subtotal: 112000,
    discountAmount: 11200,
    taxAmount: 9072,
    shippingCost: 2500,
    totalAmount: 112372,
    notes: 'Cancelled due to project scope change',
    items: [
      {
        id: 'poi-010-1',
        itemId: 'item-021',
        itemCode: 'HYD-001',
        itemName: 'Hydraulic Cylinders',
        quantity: 40,
        receivedQuantity: 0,
        unit: 'PCS',
        unitPrice: 1800,
        discount: 10,
        taxRate: 9,
        taxAmount: 5832,
        totalAmount: 70632,
        deliveryDate: '2026-02-12',
        warehouseId: 'wh-004',
        warehouseName: 'Equipment Warehouse'
      },
      {
        id: 'poi-010-2',
        itemId: 'item-022',
        itemCode: 'HYD-002',
        itemName: 'Hydraulic Hoses',
        quantity: 200,
        receivedQuantity: 0,
        unit: 'MTR',
        unitPrice: 220,
        discount: 10,
        taxRate: 9,
        taxAmount: 3564,
        totalAmount: 43164,
        deliveryDate: '2026-02-12',
        warehouseId: 'wh-004',
        warehouseName: 'Equipment Warehouse'
      }
    ],
    approvedBy: 'Michael Johnson',
    approvedAt: '2026-01-13T09:00:00Z',
    createdBy: 'Sarah Davis',
    createdAt: '2026-01-12T15:00:00Z',
    updatedAt: '2026-01-18T10:00:00Z'
  }
];

// ==================== Service Class ====================

class PurchaseOrderService {
  private async simulateDelay(ms: number = 300): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAllPurchaseOrders(filters?: PurchaseOrderFilters): Promise<{ data: PurchaseOrder[]; total: number }> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();

      let filteredData = [...MOCK_PURCHASE_ORDERS];

      if (filters) {
        if (filters.status) {
          filteredData = filteredData.filter(po => po.status === filters.status);
        }
        if (filters.vendorId) {
          filteredData = filteredData.filter(po => po.vendorId === filters.vendorId);
        }
        if (filters.fromDate) {
          filteredData = filteredData.filter(po => po.orderDate >= filters.fromDate!);
        }
        if (filters.toDate) {
          filteredData = filteredData.filter(po => po.orderDate <= filters.toDate!);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredData = filteredData.filter(po =>
            po.poNumber.toLowerCase().includes(searchLower) ||
            po.vendorName.toLowerCase().includes(searchLower) ||
            po.prReference?.toLowerCase().includes(searchLower) ||
            po.rfqReference?.toLowerCase().includes(searchLower)
          );
        }
      }

      return { data: filteredData, total: filteredData.length };
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }

    const response = await apiClient.get<{ data: PurchaseOrder[]; total: number }>(
      `/procurement/purchase-orders?${params.toString()}`
    );
    return response.data;
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      const po = MOCK_PURCHASE_ORDERS.find(p => p.id === id);
      if (!po) {
        throw new Error('Purchase Order not found');
      }
      return po;
    }

    const response = await apiClient.get<PurchaseOrder>(`/procurement/purchase-orders/${id}`);
    return response.data;
  }

  async getOutstandingOrders(): Promise<PurchaseOrder[]> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      return MOCK_PURCHASE_ORDERS.filter(po =>
        ['Approved', 'Sent to Vendor', 'Partially Received'].includes(po.status)
      );
    }

    const response = await apiClient.get<PurchaseOrder[]>('/procurement/purchase-orders/outstanding');
    return response.data;
  }

  async createPurchaseOrder(data: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(500);
      const newPO: PurchaseOrder = {
        id: `po-${Date.now()}`,
        poNumber: `PO-2026-${String(MOCK_PURCHASE_ORDERS.length + 1).padStart(3, '0')}`,
        vendorId: data.vendorId,
        vendorCode: 'V-NEW',
        vendorName: 'New Vendor',
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: data.deliveryDate,
        status: 'Draft',
        paymentTerms: data.paymentTerms,
        currency: data.currency,
        exchangeRate: 1.0,
        subtotal: 0,
        discountAmount: 0,
        taxAmount: 0,
        shippingCost: 0,
        totalAmount: 0,
        notes: data.notes,
        terms: data.terms,
        items: [],
        createdBy: 'Current User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      MOCK_PURCHASE_ORDERS.push(newPO);
      return newPO;
    }

    const response = await apiClient.post<PurchaseOrder>('/procurement/purchase-orders', data);
    return response.data;
  }

  async updatePurchaseOrder(id: string, data: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(500);
      const index = MOCK_PURCHASE_ORDERS.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Purchase Order not found');
      }
      MOCK_PURCHASE_ORDERS[index] = {
        ...MOCK_PURCHASE_ORDERS[index],
        ...data,
        updatedAt: new Date().toISOString()
      } as PurchaseOrder;
      return MOCK_PURCHASE_ORDERS[index];
    }

    const response = await apiClient.put<PurchaseOrder>(`/procurement/purchase-orders/${id}`, data);
    return response.data;
  }

  async submitPurchaseOrder(id: string): Promise<PurchaseOrder> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(500);
      const index = MOCK_PURCHASE_ORDERS.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Purchase Order not found');
      }
      MOCK_PURCHASE_ORDERS[index] = {
        ...MOCK_PURCHASE_ORDERS[index],
        status: 'Pending Approval',
        updatedAt: new Date().toISOString()
      };
      return MOCK_PURCHASE_ORDERS[index];
    }

    const response = await apiClient.post<PurchaseOrder>(`/procurement/purchase-orders/${id}/submit`, {});
    return response.data;
  }

  async approvePurchaseOrder(id: string): Promise<PurchaseOrder> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(500);
      const index = MOCK_PURCHASE_ORDERS.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Purchase Order not found');
      }
      MOCK_PURCHASE_ORDERS[index] = {
        ...MOCK_PURCHASE_ORDERS[index],
        status: 'Approved',
        approvedBy: 'Current User',
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return MOCK_PURCHASE_ORDERS[index];
    }

    const response = await apiClient.post<PurchaseOrder>(`/procurement/purchase-orders/${id}/approve`, {});
    return response.data;
  }

  async rejectPurchaseOrder(id: string, reason?: string): Promise<PurchaseOrder> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(500);
      const index = MOCK_PURCHASE_ORDERS.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Purchase Order not found');
      }
      MOCK_PURCHASE_ORDERS[index] = {
        ...MOCK_PURCHASE_ORDERS[index],
        status: 'Cancelled',
        notes: reason ?? MOCK_PURCHASE_ORDERS[index].notes,
        updatedAt: new Date().toISOString()
      };
      return MOCK_PURCHASE_ORDERS[index];
    }

    const response = await apiClient.post<PurchaseOrder>(`/procurement/purchase-orders/${id}/reject`, { reason });
    return response.data;
  }

  async closePurchaseOrder(id: string): Promise<PurchaseOrder> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(500);
      const index = MOCK_PURCHASE_ORDERS.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Purchase Order not found');
      }
      MOCK_PURCHASE_ORDERS[index] = {
        ...MOCK_PURCHASE_ORDERS[index],
        status: 'Closed',
        closedBy: 'Current User',
        closedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return MOCK_PURCHASE_ORDERS[index];
    }

    const response = await apiClient.post<PurchaseOrder>(`/procurement/purchase-orders/${id}/close`, {});
    return response.data;
  }
}

export const purchaseOrderService = new PurchaseOrderService();
