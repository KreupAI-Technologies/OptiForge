import { apiClient } from './api/client';
import { USE_LIVE_API } from './api-flags';

// ---- NestJS domain backend (b3-erp) for net-new RFQ bid + template endpoints ----
// Endpoint source of truth:
//   procurement/controllers/rfq-bid.controller.ts     (@Controller('procurement/rfq'))
//   procurement/controllers/rfq-template.controller.ts (@Controller('procurement/rfq/templates'))
const DOMAIN_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const RFQ_COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

async function domainRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${DOMAIN_API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-company-id': RFQ_COMPANY_ID,
    },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${path}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export interface RFQBid {
  id: string;
  companyId: string;
  rfqId: string;
  supplierId?: string;
  supplierName: string;
  amount: number;
  status: 'submitted' | 'shortlisted' | 'rejected' | 'awarded';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RFQTemplate {
  id: string;
  companyId: string;
  name: string;
  category?: string;
  type: string;
  description?: string;
  content?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== TypeScript Interfaces ====================

export type RFQStatus = 'Draft' | 'Sent' | 'Responses Received' | 'Under Evaluation' | 'Awarded' | 'Cancelled' | 'Expired';
export type QuoteStatus = 'Pending' | 'Received' | 'Evaluated' | 'Selected' | 'Rejected';

export interface RFQItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  description?: string;
  quantity: number;
  unit: string;
  specifications?: string;
  targetPrice?: number;
  requiredDate: string;
}

export interface VendorQuoteItem {
  rfqItemId: string;
  itemCode: string;
  itemName: string;
  quotedQuantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  leadTimeDays: number;
  remarks?: string;
}

export interface VendorQuote {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorCode: string;
  vendorName: string;
  quoteNumber?: string;
  quoteDate?: string;
  validUntil?: string;
  status: QuoteStatus;
  currency: string;
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  paymentTerms?: string;
  deliveryTerms?: string;
  warrantyTerms?: string;
  items: VendorQuoteItem[];
  attachments?: {
    id: string;
    fileName: string;
    fileUrl: string;
  }[];
  evaluationScore?: number;
  evaluationNotes?: string;
  receivedAt?: string;
  evaluatedAt?: string;
  evaluatedBy?: string;
}

export interface ProcurementRFQ {
  id: string;
  rfqNumber: string;
  title: string;
  description?: string;
  status: RFQStatus;
  prReference?: string;
  projectId?: string;
  projectName?: string;
  department: string;
  requestedBy: string;
  requestedByName: string;
  createdDate: string;
  responseDeadline: string;
  requiredDeliveryDate: string;
  currency: string;
  estimatedBudget?: number;
  items: RFQItem[];
  invitedVendors: {
    vendorId: string;
    vendorCode: string;
    vendorName: string;
    email: string;
    sentAt?: string;
    viewedAt?: string;
  }[];
  quotes: VendorQuote[];
  awardedVendorId?: string;
  awardedVendorName?: string;
  awardedQuoteId?: string;
  awardedAt?: string;
  awardedBy?: string;
  awardedByName?: string;
  convertedToPOId?: string;
  convertedToPONumber?: string;
  notes?: string;
  terms?: string;
  attachments?: {
    id: string;
    fileName: string;
    fileType: string;
    fileUrl: string;
    uploadedAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRFQDto {
  title: string;
  description?: string;
  prReference?: string;
  projectId?: string;
  department: string;
  responseDeadline: string;
  requiredDeliveryDate: string;
  currency: string;
  estimatedBudget?: number;
  notes?: string;
  terms?: string;
  items: {
    itemId: string;
    quantity: number;
    specifications?: string;
    targetPrice?: number;
    requiredDate: string;
  }[];
  vendorIds: string[];
}

export interface UpdateRFQDto extends Partial<CreateRFQDto> {
  status?: RFQStatus;
}

export interface QuoteComparisonResult {
  rfqId: string;
  rfqNumber: string;
  items: {
    itemId: string;
    itemCode: string;
    itemName: string;
    quantity: number;
    unit: string;
    vendorQuotes: {
      vendorId: string;
      vendorName: string;
      unitPrice: number;
      totalPrice: number;
      leadTimeDays: number;
      isLowest: boolean;
      isFastest: boolean;
    }[];
    lowestPrice: number;
    averagePrice: number;
    highestPrice: number;
  }[];
  vendorSummary: {
    vendorId: string;
    vendorName: string;
    totalAmount: number;
    averageLeadTime: number;
    discountPercentage: number;
    overallScore?: number;
    recommendation?: string;
  }[];
  recommendedVendorId?: string;
  recommendedVendorName?: string;
}

export interface RFQFilters {
  status?: RFQStatus;
  department?: string;
  vendorId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ==================== Mock Data Toggle ====================

const USE_MOCK_DATA = !USE_LIVE_API;

const MOCK_RFQS: ProcurementRFQ[] = [
  {
    id: 'rfq-001',
    rfqNumber: 'RFQ-2026-001',
    title: 'Steel Materials for Q1 Production',
    description: 'Request for quotation for steel materials needed for Q1 2026 production schedule',
    status: 'Awarded',
    prReference: 'PR-2026-001',
    projectId: 'proj-001',
    projectName: 'Production Line A - Q1 2026',
    department: 'Production',
    requestedBy: 'user-001',
    requestedByName: 'James Wilson',
    createdDate: '2026-01-05',
    responseDeadline: '2026-01-12',
    requiredDeliveryDate: '2026-02-01',
    currency: 'USD',
    estimatedBudget: 130000,
    items: [
      {
        id: 'rfqi-001-1',
        itemId: 'item-001',
        itemCode: 'STL-001',
        itemName: 'Steel Plates 10mm',
        description: 'High-grade carbon steel plates',
        quantity: 500,
        unit: 'KG',
        specifications: 'Carbon steel, 10mm thickness, grade S355',
        targetPrice: 150,
        requiredDate: '2026-02-01'
      },
      {
        id: 'rfqi-001-2',
        itemId: 'item-002',
        itemCode: 'STL-002',
        itemName: 'Steel Rods 20mm',
        quantity: 250,
        unit: 'KG',
        specifications: 'Carbon steel rods, 20mm diameter',
        targetPrice: 200,
        requiredDate: '2026-02-01'
      }
    ],
    invitedVendors: [
      {
        vendorId: 'vendor-001',
        vendorCode: 'V-001',
        vendorName: 'Steel Dynamics Inc.',
        email: 'sales@steeldynamics.com',
        sentAt: '2026-01-05T10:00:00Z',
        viewedAt: '2026-01-05T14:30:00Z'
      },
      {
        vendorId: 'vendor-010',
        vendorCode: 'V-010',
        vendorName: 'MetalWorks Corp.',
        email: 'quotes@metalworks.com',
        sentAt: '2026-01-05T10:00:00Z',
        viewedAt: '2026-01-06T09:00:00Z'
      },
      {
        vendorId: 'vendor-011',
        vendorCode: 'V-011',
        vendorName: 'Global Steel Suppliers',
        email: 'rfq@globalsteel.com',
        sentAt: '2026-01-05T10:00:00Z',
        viewedAt: '2026-01-05T16:00:00Z'
      }
    ],
    quotes: [
      {
        id: 'quote-001-1',
        rfqId: 'rfq-001',
        vendorId: 'vendor-001',
        vendorCode: 'V-001',
        vendorName: 'Steel Dynamics Inc.',
        quoteNumber: 'QT-SD-2026-0125',
        quoteDate: '2026-01-08',
        validUntil: '2026-02-08',
        status: 'Selected',
        currency: 'USD',
        subtotal: 125000,
        discountPercentage: 5,
        discountAmount: 6250,
        taxAmount: 10687.5,
        shippingCost: 2500,
        totalAmount: 131937.5,
        paymentTerms: 'Net 30',
        deliveryTerms: 'FOB Destination',
        warrantyTerms: '1 year material defect warranty',
        items: [
          {
            rfqItemId: 'rfqi-001-1',
            itemCode: 'STL-001',
            itemName: 'Steel Plates 10mm',
            quotedQuantity: 500,
            unit: 'KG',
            unitPrice: 150,
            totalPrice: 75000,
            leadTimeDays: 14,
            remarks: 'In stock, ready for immediate dispatch'
          },
          {
            rfqItemId: 'rfqi-001-2',
            itemCode: 'STL-002',
            itemName: 'Steel Rods 20mm',
            quotedQuantity: 250,
            unit: 'KG',
            unitPrice: 200,
            totalPrice: 50000,
            leadTimeDays: 14
          }
        ],
        evaluationScore: 92,
        evaluationNotes: 'Best price, reliable supplier, good lead time',
        receivedAt: '2026-01-08T16:00:00Z',
        evaluatedAt: '2026-01-10T14:00:00Z',
        evaluatedBy: 'Michael Johnson'
      },
      {
        id: 'quote-001-2',
        rfqId: 'rfq-001',
        vendorId: 'vendor-010',
        vendorCode: 'V-010',
        vendorName: 'MetalWorks Corp.',
        quoteNumber: 'MW-Q-2026-089',
        quoteDate: '2026-01-09',
        validUntil: '2026-02-09',
        status: 'Rejected',
        currency: 'USD',
        subtotal: 135000,
        discountPercentage: 3,
        discountAmount: 4050,
        taxAmount: 11785.5,
        shippingCost: 3000,
        totalAmount: 145735.5,
        paymentTerms: 'Net 45',
        deliveryTerms: 'Ex Works',
        items: [
          {
            rfqItemId: 'rfqi-001-1',
            itemCode: 'STL-001',
            itemName: 'Steel Plates 10mm',
            quotedQuantity: 500,
            unit: 'KG',
            unitPrice: 165,
            totalPrice: 82500,
            leadTimeDays: 21
          },
          {
            rfqItemId: 'rfqi-001-2',
            itemCode: 'STL-002',
            itemName: 'Steel Rods 20mm',
            quotedQuantity: 250,
            unit: 'KG',
            unitPrice: 210,
            totalPrice: 52500,
            leadTimeDays: 21
          }
        ],
        evaluationScore: 75,
        evaluationNotes: 'Higher price, longer lead time',
        receivedAt: '2026-01-09T11:00:00Z',
        evaluatedAt: '2026-01-10T14:00:00Z',
        evaluatedBy: 'Michael Johnson'
      },
      {
        id: 'quote-001-3',
        rfqId: 'rfq-001',
        vendorId: 'vendor-011',
        vendorCode: 'V-011',
        vendorName: 'Global Steel Suppliers',
        quoteNumber: 'GSS-2026-Q-0034',
        quoteDate: '2026-01-10',
        validUntil: '2026-01-25',
        status: 'Rejected',
        currency: 'USD',
        subtotal: 128000,
        discountPercentage: 2,
        discountAmount: 2560,
        taxAmount: 11289.6,
        shippingCost: 4500,
        totalAmount: 141229.6,
        paymentTerms: 'Net 30',
        deliveryTerms: 'CIF',
        items: [
          {
            rfqItemId: 'rfqi-001-1',
            itemCode: 'STL-001',
            itemName: 'Steel Plates 10mm',
            quotedQuantity: 500,
            unit: 'KG',
            unitPrice: 155,
            totalPrice: 77500,
            leadTimeDays: 10
          },
          {
            rfqItemId: 'rfqi-001-2',
            itemCode: 'STL-002',
            itemName: 'Steel Rods 20mm',
            quotedQuantity: 250,
            unit: 'KG',
            unitPrice: 202,
            totalPrice: 50500,
            leadTimeDays: 10
          }
        ],
        evaluationScore: 82,
        evaluationNotes: 'Fastest delivery but shorter quote validity',
        receivedAt: '2026-01-10T09:00:00Z',
        evaluatedAt: '2026-01-10T14:00:00Z',
        evaluatedBy: 'Michael Johnson'
      }
    ],
    awardedVendorId: 'vendor-001',
    awardedVendorName: 'Steel Dynamics Inc.',
    awardedQuoteId: 'quote-001-1',
    awardedAt: '2026-01-12T10:00:00Z',
    awardedBy: 'user-005',
    awardedByName: 'Michael Johnson',
    convertedToPOId: 'po-001',
    convertedToPONumber: 'PO-2026-001',
    notes: 'Urgent requirement for Q1 production',
    terms: 'Standard procurement terms apply',
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-01-15T09:00:00Z'
  },
  {
    id: 'rfq-002',
    rfqNumber: 'RFQ-2026-002',
    title: 'Industrial Bearings and Gears',
    description: 'Precision parts for CNC machine maintenance',
    status: 'Under Evaluation',
    department: 'Maintenance',
    requestedBy: 'user-002',
    requestedByName: 'Robert Chen',
    createdDate: '2026-01-18',
    responseDeadline: '2026-01-25',
    requiredDeliveryDate: '2026-02-28',
    currency: 'USD',
    estimatedBudget: 85000,
    items: [
      {
        id: 'rfqi-002-1',
        itemId: 'item-003',
        itemCode: 'BEAR-001',
        itemName: 'Industrial Bearings',
        description: 'Heavy-duty ball bearings for CNC spindles',
        quantity: 1000,
        unit: 'PCS',
        specifications: 'SKF equivalent, deep groove ball bearing 6205-2RS',
        targetPrice: 45,
        requiredDate: '2026-02-28'
      },
      {
        id: 'rfqi-002-2',
        itemId: 'item-004',
        itemCode: 'GEAR-001',
        itemName: 'Precision Gears',
        quantity: 500,
        unit: 'PCS',
        specifications: 'Module 2, 20 teeth, steel alloy',
        targetPrice: 65,
        requiredDate: '2026-02-28'
      }
    ],
    invitedVendors: [
      {
        vendorId: 'vendor-002',
        vendorCode: 'V-002',
        vendorName: 'Precision Parts Ltd.',
        email: 'sales@precisionparts.com',
        sentAt: '2026-01-18T14:00:00Z',
        viewedAt: '2026-01-18T16:00:00Z'
      },
      {
        vendorId: 'vendor-012',
        vendorCode: 'V-012',
        vendorName: 'BearingMaster Inc.',
        email: 'quotes@bearingmaster.com',
        sentAt: '2026-01-18T14:00:00Z',
        viewedAt: '2026-01-19T09:00:00Z'
      }
    ],
    quotes: [
      {
        id: 'quote-002-1',
        rfqId: 'rfq-002',
        vendorId: 'vendor-002',
        vendorCode: 'V-002',
        vendorName: 'Precision Parts Ltd.',
        quoteNumber: 'PP-Q-2026-0234',
        quoteDate: '2026-01-22',
        validUntil: '2026-02-22',
        status: 'Evaluated',
        currency: 'USD',
        subtotal: 78500,
        discountPercentage: 5,
        discountAmount: 3925,
        taxAmount: 6711.75,
        shippingCost: 1500,
        totalAmount: 82786.75,
        paymentTerms: 'Net 45',
        deliveryTerms: 'FOB Destination',
        items: [
          {
            rfqItemId: 'rfqi-002-1',
            itemCode: 'BEAR-001',
            itemName: 'Industrial Bearings',
            quotedQuantity: 1000,
            unit: 'PCS',
            unitPrice: 45,
            totalPrice: 45000,
            leadTimeDays: 21,
            remarks: 'SKF original parts'
          },
          {
            rfqItemId: 'rfqi-002-2',
            itemCode: 'GEAR-001',
            itemName: 'Precision Gears',
            quotedQuantity: 500,
            unit: 'PCS',
            unitPrice: 67,
            totalPrice: 33500,
            leadTimeDays: 28,
            remarks: 'Custom manufacturing required'
          }
        ],
        evaluationScore: 88,
        evaluationNotes: 'Good quality, competitive pricing',
        receivedAt: '2026-01-22T15:00:00Z',
        evaluatedAt: '2026-01-24T10:00:00Z',
        evaluatedBy: 'Lisa Anderson'
      },
      {
        id: 'quote-002-2',
        rfqId: 'rfq-002',
        vendorId: 'vendor-012',
        vendorCode: 'V-012',
        vendorName: 'BearingMaster Inc.',
        quoteNumber: 'BM-2026-Q-567',
        quoteDate: '2026-01-23',
        validUntil: '2026-02-23',
        status: 'Evaluated',
        currency: 'USD',
        subtotal: 82000,
        discountPercentage: 7,
        discountAmount: 5740,
        taxAmount: 6863.4,
        shippingCost: 1200,
        totalAmount: 84323.4,
        paymentTerms: 'Net 30',
        deliveryTerms: 'DDP',
        items: [
          {
            rfqItemId: 'rfqi-002-1',
            itemCode: 'BEAR-001',
            itemName: 'Industrial Bearings',
            quotedQuantity: 1000,
            unit: 'PCS',
            unitPrice: 42,
            totalPrice: 42000,
            leadTimeDays: 14,
            remarks: 'In stock, immediate availability'
          },
          {
            rfqItemId: 'rfqi-002-2',
            itemCode: 'GEAR-001',
            itemName: 'Precision Gears',
            quotedQuantity: 500,
            unit: 'PCS',
            unitPrice: 80,
            totalPrice: 40000,
            leadTimeDays: 35,
            remarks: 'Subcontracted manufacturing'
          }
        ],
        evaluationScore: 85,
        evaluationNotes: 'Lower bearing price but higher gear price and longer lead time',
        receivedAt: '2026-01-23T11:00:00Z',
        evaluatedAt: '2026-01-24T10:00:00Z',
        evaluatedBy: 'Lisa Anderson'
      }
    ],
    notes: 'Required for scheduled CNC maintenance in Q1',
    createdAt: '2026-01-18T11:00:00Z',
    updatedAt: '2026-01-24T10:00:00Z'
  },
  {
    id: 'rfq-003',
    rfqNumber: 'RFQ-2026-003',
    title: 'Packaging Materials Q1 2026',
    description: 'Bulk order for packaging materials',
    status: 'Sent',
    department: 'Logistics',
    requestedBy: 'user-008',
    requestedByName: 'Kevin Brown',
    createdDate: '2026-01-20',
    responseDeadline: '2026-01-28',
    requiredDeliveryDate: '2026-02-15',
    currency: 'USD',
    estimatedBudget: 40000,
    items: [
      {
        id: 'rfqi-003-1',
        itemId: 'item-012',
        itemCode: 'PACK-001',
        itemName: 'Corrugated Boxes Large',
        quantity: 3000,
        unit: 'PCS',
        specifications: '600x400x400mm, double wall corrugated',
        targetPrice: 8,
        requiredDate: '2026-02-15'
      },
      {
        id: 'rfqi-003-2',
        itemId: 'item-013',
        itemCode: 'PACK-002',
        itemName: 'Pallet Wrap',
        quantity: 150,
        unit: 'ROLL',
        specifications: '500mm width, 23 micron, stretch film',
        targetPrice: 150,
        requiredDate: '2026-02-15'
      }
    ],
    invitedVendors: [
      {
        vendorId: 'vendor-006',
        vendorCode: 'V-006',
        vendorName: 'PackPro Materials',
        email: 'sales@packpro.com',
        sentAt: '2026-01-20T15:00:00Z',
        viewedAt: '2026-01-21T09:00:00Z'
      },
      {
        vendorId: 'vendor-013',
        vendorCode: 'V-013',
        vendorName: 'BoxWorld Industries',
        email: 'rfq@boxworld.com',
        sentAt: '2026-01-20T15:00:00Z'
      },
      {
        vendorId: 'vendor-014',
        vendorCode: 'V-014',
        vendorName: 'EcoPack Solutions',
        email: 'quotes@ecopack.com',
        sentAt: '2026-01-20T15:00:00Z',
        viewedAt: '2026-01-20T17:30:00Z'
      }
    ],
    quotes: [],
    notes: 'Prefer eco-friendly materials if competitively priced',
    terms: 'Delivery in batches acceptable',
    createdAt: '2026-01-20T14:00:00Z',
    updatedAt: '2026-01-20T15:00:00Z'
  },
  {
    id: 'rfq-004',
    rfqNumber: 'RFQ-2026-004',
    title: 'Hydraulic System Components',
    description: 'Replacement parts for hydraulic press maintenance',
    status: 'Cancelled',
    prReference: 'PR-2026-010',
    department: 'Maintenance',
    requestedBy: 'user-002',
    requestedByName: 'Robert Chen',
    createdDate: '2026-01-08',
    responseDeadline: '2026-01-15',
    requiredDeliveryDate: '2026-02-12',
    currency: 'USD',
    estimatedBudget: 120000,
    items: [
      {
        id: 'rfqi-004-1',
        itemId: 'item-021',
        itemCode: 'HYD-001',
        itemName: 'Hydraulic Cylinders',
        quantity: 40,
        unit: 'PCS',
        specifications: 'Bore 100mm, Stroke 500mm, 250 bar rated',
        targetPrice: 1800,
        requiredDate: '2026-02-12'
      },
      {
        id: 'rfqi-004-2',
        itemId: 'item-022',
        itemCode: 'HYD-002',
        itemName: 'Hydraulic Hoses',
        quantity: 200,
        unit: 'MTR',
        specifications: 'SAE 100R2AT, 3/4 inch, 350 bar',
        targetPrice: 220,
        requiredDate: '2026-02-12'
      }
    ],
    invitedVendors: [
      {
        vendorId: 'vendor-009',
        vendorCode: 'V-009',
        vendorName: 'HydraulicPro Systems',
        email: 'sales@hydraulicpro.com',
        sentAt: '2026-01-08T16:00:00Z',
        viewedAt: '2026-01-09T10:00:00Z'
      }
    ],
    quotes: [
      {
        id: 'quote-004-1',
        rfqId: 'rfq-004',
        vendorId: 'vendor-009',
        vendorCode: 'V-009',
        vendorName: 'HydraulicPro Systems',
        quoteNumber: 'HP-Q-2026-0089',
        quoteDate: '2026-01-12',
        validUntil: '2026-02-12',
        status: 'Rejected',
        currency: 'USD',
        subtotal: 116000,
        discountPercentage: 10,
        discountAmount: 11600,
        taxAmount: 9396,
        shippingCost: 2500,
        totalAmount: 116296,
        paymentTerms: 'Net 45',
        deliveryTerms: 'FOB Origin',
        items: [
          {
            rfqItemId: 'rfqi-004-1',
            itemCode: 'HYD-001',
            itemName: 'Hydraulic Cylinders',
            quotedQuantity: 40,
            unit: 'PCS',
            unitPrice: 1850,
            totalPrice: 74000,
            leadTimeDays: 28
          },
          {
            rfqItemId: 'rfqi-004-2',
            itemCode: 'HYD-002',
            itemName: 'Hydraulic Hoses',
            quotedQuantity: 200,
            unit: 'MTR',
            unitPrice: 210,
            totalPrice: 42000,
            leadTimeDays: 14
          }
        ],
        receivedAt: '2026-01-12T14:00:00Z'
      }
    ],
    notes: 'Cancelled due to project scope change',
    createdAt: '2026-01-08T15:00:00Z',
    updatedAt: '2026-01-18T10:00:00Z'
  },
  {
    id: 'rfq-005',
    rfqNumber: 'RFQ-2026-005',
    title: 'Safety Equipment Annual Order',
    description: 'Annual replenishment of PPE and safety equipment',
    status: 'Responses Received',
    department: 'Safety',
    requestedBy: 'user-007',
    requestedByName: 'Tom Garcia',
    createdDate: '2026-01-15',
    responseDeadline: '2026-01-22',
    requiredDeliveryDate: '2026-02-28',
    currency: 'USD',
    estimatedBudget: 50000,
    items: [
      {
        id: 'rfqi-005-1',
        itemId: 'item-018',
        itemCode: 'SAFE-001',
        itemName: 'Safety Helmets',
        quantity: 500,
        unit: 'PCS',
        specifications: 'ANSI Z89.1 Type I Class E rated',
        targetPrice: 30,
        requiredDate: '2026-02-28'
      },
      {
        id: 'rfqi-005-2',
        itemId: 'item-019',
        itemCode: 'SAFE-002',
        itemName: 'Safety Goggles',
        quantity: 600,
        unit: 'PCS',
        specifications: 'ANSI Z87.1+ rated, anti-fog coating',
        targetPrice: 20,
        requiredDate: '2026-02-28'
      },
      {
        id: 'rfqi-005-3',
        itemId: 'item-020',
        itemCode: 'SAFE-003',
        itemName: 'Work Gloves',
        quantity: 1000,
        unit: 'PAIR',
        specifications: 'Cut resistant level A4, nitrile coated',
        targetPrice: 15,
        requiredDate: '2026-02-28'
      }
    ],
    invitedVendors: [
      {
        vendorId: 'vendor-008',
        vendorCode: 'V-008',
        vendorName: 'SafetyFirst Equipment',
        email: 'quotes@safetyfirst.com',
        sentAt: '2026-01-15T10:00:00Z',
        viewedAt: '2026-01-15T14:00:00Z'
      },
      {
        vendorId: 'vendor-015',
        vendorCode: 'V-015',
        vendorName: 'PPE Direct',
        email: 'sales@ppedirect.com',
        sentAt: '2026-01-15T10:00:00Z',
        viewedAt: '2026-01-15T11:00:00Z'
      }
    ],
    quotes: [
      {
        id: 'quote-005-1',
        rfqId: 'rfq-005',
        vendorId: 'vendor-008',
        vendorCode: 'V-008',
        vendorName: 'SafetyFirst Equipment',
        quoteNumber: 'SF-Q-2026-0178',
        quoteDate: '2026-01-20',
        validUntil: '2026-02-20',
        status: 'Received',
        currency: 'USD',
        subtotal: 42000,
        discountPercentage: 8,
        discountAmount: 3360,
        taxAmount: 3477.6,
        shippingCost: 800,
        totalAmount: 42917.6,
        paymentTerms: 'Net 15',
        deliveryTerms: 'DDP',
        items: [
          {
            rfqItemId: 'rfqi-005-1',
            itemCode: 'SAFE-001',
            itemName: 'Safety Helmets',
            quotedQuantity: 500,
            unit: 'PCS',
            unitPrice: 28,
            totalPrice: 14000,
            leadTimeDays: 7
          },
          {
            rfqItemId: 'rfqi-005-2',
            itemCode: 'SAFE-002',
            itemName: 'Safety Goggles',
            quotedQuantity: 600,
            unit: 'PCS',
            unitPrice: 18,
            totalPrice: 10800,
            leadTimeDays: 7
          },
          {
            rfqItemId: 'rfqi-005-3',
            itemCode: 'SAFE-003',
            itemName: 'Work Gloves',
            quotedQuantity: 1000,
            unit: 'PAIR',
            unitPrice: 17.2,
            totalPrice: 17200,
            leadTimeDays: 10
          }
        ],
        receivedAt: '2026-01-20T16:00:00Z'
      },
      {
        id: 'quote-005-2',
        rfqId: 'rfq-005',
        vendorId: 'vendor-015',
        vendorCode: 'V-015',
        vendorName: 'PPE Direct',
        quoteNumber: 'PPED-2026-Q-234',
        quoteDate: '2026-01-21',
        validUntil: '2026-02-21',
        status: 'Received',
        currency: 'USD',
        subtotal: 44500,
        discountPercentage: 10,
        discountAmount: 4450,
        taxAmount: 3604.5,
        shippingCost: 0,
        totalAmount: 43654.5,
        paymentTerms: 'Net 30',
        deliveryTerms: 'Free shipping over $40,000',
        items: [
          {
            rfqItemId: 'rfqi-005-1',
            itemCode: 'SAFE-001',
            itemName: 'Safety Helmets',
            quotedQuantity: 500,
            unit: 'PCS',
            unitPrice: 32,
            totalPrice: 16000,
            leadTimeDays: 5,
            remarks: 'Premium brand available'
          },
          {
            rfqItemId: 'rfqi-005-2',
            itemCode: 'SAFE-002',
            itemName: 'Safety Goggles',
            quotedQuantity: 600,
            unit: 'PCS',
            unitPrice: 22,
            totalPrice: 13200,
            leadTimeDays: 5
          },
          {
            rfqItemId: 'rfqi-005-3',
            itemCode: 'SAFE-003',
            itemName: 'Work Gloves',
            quotedQuantity: 1000,
            unit: 'PAIR',
            unitPrice: 15.3,
            totalPrice: 15300,
            leadTimeDays: 7
          }
        ],
        receivedAt: '2026-01-21T10:00:00Z'
      }
    ],
    notes: 'Must meet all ANSI safety standards',
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-01-21T10:00:00Z'
  },
  {
    id: 'rfq-006',
    rfqNumber: 'RFQ-2026-006',
    title: 'CNC Tooling for New Project',
    description: 'Specialized tooling for aerospace component manufacturing',
    status: 'Draft',
    prReference: 'PR-2026-007',
    projectId: 'proj-005',
    projectName: 'Aerospace Components - Phase 1',
    department: 'Production',
    requestedBy: 'user-001',
    requestedByName: 'James Wilson',
    createdDate: '2026-01-24',
    responseDeadline: '2026-02-05',
    requiredDeliveryDate: '2026-03-01',
    currency: 'USD',
    estimatedBudget: 100000,
    items: [
      {
        id: 'rfqi-006-1',
        itemId: 'item-014',
        itemCode: 'TOOL-001',
        itemName: 'CNC End Mills Set',
        description: 'Premium carbide end mills for titanium machining',
        quantity: 40,
        unit: 'SET',
        specifications: 'AlTiN coated, 4-flute, various sizes 6-20mm',
        targetPrice: 1600,
        requiredDate: '2026-03-01'
      },
      {
        id: 'rfqi-006-2',
        itemId: 'item-025',
        itemCode: 'TOOL-003',
        itemName: 'Custom Fixture Set',
        quantity: 8,
        unit: 'SET',
        specifications: 'Custom fixtures for aerospace brackets per drawing AE-2026-001',
        targetPrice: 8000,
        requiredDate: '2026-03-01'
      }
    ],
    invitedVendors: [],
    quotes: [],
    notes: 'Pending budget approval before sending to vendors',
    createdAt: '2026-01-24T16:00:00Z',
    updatedAt: '2026-01-24T16:00:00Z'
  },
  {
    id: 'rfq-007',
    rfqNumber: 'RFQ-2026-007',
    title: 'Electrical Components for Panel Upgrade',
    description: 'Components for control panel modernization project',
    status: 'Expired',
    department: 'Maintenance',
    requestedBy: 'user-002',
    requestedByName: 'Robert Chen',
    createdDate: '2025-12-15',
    responseDeadline: '2025-12-22',
    requiredDeliveryDate: '2026-01-15',
    currency: 'USD',
    estimatedBudget: 75000,
    items: [
      {
        id: 'rfqi-007-1',
        itemId: 'item-007',
        itemCode: 'ELEC-001',
        itemName: 'Industrial Motors 5HP',
        quantity: 25,
        unit: 'PCS',
        specifications: 'NEMA Premium efficiency, 1800 RPM, TEFC',
        targetPrice: 1100,
        requiredDate: '2026-01-15'
      },
      {
        id: 'rfqi-007-2',
        itemId: 'item-008',
        itemCode: 'ELEC-002',
        itemName: 'Control Panels',
        quantity: 15,
        unit: 'PCS',
        specifications: 'NEMA 4X enclosure, pre-wired with VFD',
        targetPrice: 3000,
        requiredDate: '2026-01-15'
      }
    ],
    invitedVendors: [
      {
        vendorId: 'vendor-004',
        vendorCode: 'V-004',
        vendorName: 'ElectroTech Industries',
        email: 'sales@electrotech.com',
        sentAt: '2025-12-15T14:00:00Z',
        viewedAt: '2025-12-16T09:00:00Z'
      }
    ],
    quotes: [],
    notes: 'No responses received before deadline - needs to be reissued',
    createdAt: '2025-12-15T13:00:00Z',
    updatedAt: '2025-12-23T00:00:00Z'
  }
];

// ==================== Service Class ====================

class ProcurementRFQService {
  private async simulateDelay(ms: number = 300): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAllRFQs(filters?: RFQFilters): Promise<{ data: ProcurementRFQ[]; total: number }> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();

      let filteredData = [...MOCK_RFQS];

      if (filters) {
        if (filters.status) {
          filteredData = filteredData.filter(rfq => rfq.status === filters.status);
        }
        if (filters.department) {
          filteredData = filteredData.filter(rfq => rfq.department === filters.department);
        }
        if (filters.vendorId) {
          filteredData = filteredData.filter(rfq =>
            rfq.invitedVendors.some(v => v.vendorId === filters.vendorId)
          );
        }
        if (filters.fromDate) {
          filteredData = filteredData.filter(rfq => rfq.createdDate >= filters.fromDate!);
        }
        if (filters.toDate) {
          filteredData = filteredData.filter(rfq => rfq.createdDate <= filters.toDate!);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredData = filteredData.filter(rfq =>
            rfq.rfqNumber.toLowerCase().includes(searchLower) ||
            rfq.title.toLowerCase().includes(searchLower) ||
            rfq.department.toLowerCase().includes(searchLower) ||
            rfq.requestedByName.toLowerCase().includes(searchLower)
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

    const response = await apiClient.get<{ data: ProcurementRFQ[]; total: number }>(
      `/procurement/rfqs?${params.toString()}`
    );
    return response.data;
  }

  async getRFQById(id: string): Promise<ProcurementRFQ> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      const rfq = MOCK_RFQS.find(r => r.id === id);
      if (!rfq) {
        throw new Error('RFQ not found');
      }
      return rfq;
    }

    const response = await apiClient.get<ProcurementRFQ>(`/procurement/rfqs/${id}`);
    return response.data;
  }

  async createRFQ(data: CreateRFQDto): Promise<ProcurementRFQ> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(500);
      const newRFQ: ProcurementRFQ = {
        id: `rfq-${Date.now()}`,
        rfqNumber: `RFQ-2026-${String(MOCK_RFQS.length + 1).padStart(3, '0')}`,
        title: data.title,
        description: data.description,
        status: 'Draft',
        prReference: data.prReference,
        projectId: data.projectId,
        department: data.department,
        requestedBy: 'user-current',
        requestedByName: 'Current User',
        createdDate: new Date().toISOString().split('T')[0],
        responseDeadline: data.responseDeadline,
        requiredDeliveryDate: data.requiredDeliveryDate,
        currency: data.currency,
        estimatedBudget: data.estimatedBudget,
        items: [],
        invitedVendors: [],
        quotes: [],
        notes: data.notes,
        terms: data.terms,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      MOCK_RFQS.push(newRFQ);
      return newRFQ;
    }

    const response = await apiClient.post<ProcurementRFQ>('/procurement/rfqs', data);
    return response.data;
  }

  async updateRFQ(id: string, data: UpdateRFQDto): Promise<ProcurementRFQ> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(500);
      const index = MOCK_RFQS.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error('RFQ not found');
      }
      MOCK_RFQS[index] = {
        ...MOCK_RFQS[index],
        ...data,
        updatedAt: new Date().toISOString()
      } as ProcurementRFQ;
      return MOCK_RFQS[index];
    }

    const response = await apiClient.put<ProcurementRFQ>(`/procurement/rfqs/${id}`, data);
    return response.data;
  }

  async sendRFQ(id: string): Promise<ProcurementRFQ> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(600);
      const index = MOCK_RFQS.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error('RFQ not found');
      }

      if (MOCK_RFQS[index].invitedVendors.length === 0) {
        throw new Error('No vendors selected for this RFQ');
      }

      // Update vendor sent timestamps
      const updatedVendors = MOCK_RFQS[index].invitedVendors.map(v => ({
        ...v,
        sentAt: new Date().toISOString()
      }));

      MOCK_RFQS[index] = {
        ...MOCK_RFQS[index],
        status: 'Sent',
        invitedVendors: updatedVendors,
        updatedAt: new Date().toISOString()
      };

      return MOCK_RFQS[index];
    }

    const response = await apiClient.post<ProcurementRFQ>(`/procurement/rfqs/${id}/send`, {});
    return response.data;
  }

  async compareQuotes(id: string): Promise<QuoteComparisonResult> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(500);
      const rfq = MOCK_RFQS.find(r => r.id === id);
      if (!rfq) {
        throw new Error('RFQ not found');
      }

      if (rfq.quotes.length === 0) {
        throw new Error('No quotes available for comparison');
      }

      // Build comparison data
      const itemComparisons = rfq.items.map(item => {
        const vendorQuotes = rfq.quotes
          .filter(q => q.status !== 'Rejected')
          .map(quote => {
            const quoteItem = quote.items.find(qi => qi.rfqItemId === item.id);
            return {
              vendorId: quote.vendorId,
              vendorName: quote.vendorName,
              unitPrice: quoteItem?.unitPrice || 0,
              totalPrice: quoteItem?.totalPrice || 0,
              leadTimeDays: quoteItem?.leadTimeDays || 0,
              isLowest: false,
              isFastest: false
            };
          });

        // Mark lowest price and fastest delivery
        if (vendorQuotes.length > 0) {
          const lowestPrice = Math.min(...vendorQuotes.map(vq => vq.unitPrice));
          const fastestDelivery = Math.min(...vendorQuotes.map(vq => vq.leadTimeDays));
          vendorQuotes.forEach(vq => {
            vq.isLowest = vq.unitPrice === lowestPrice;
            vq.isFastest = vq.leadTimeDays === fastestDelivery;
          });
        }

        const prices = vendorQuotes.map(vq => vq.unitPrice);

        return {
          itemId: item.id,
          itemCode: item.itemCode,
          itemName: item.itemName,
          quantity: item.quantity,
          unit: item.unit,
          vendorQuotes,
          lowestPrice: Math.min(...prices),
          averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length,
          highestPrice: Math.max(...prices)
        };
      });

      const vendorSummary = rfq.quotes
        .filter(q => q.status !== 'Rejected')
        .map(quote => ({
          vendorId: quote.vendorId,
          vendorName: quote.vendorName,
          totalAmount: quote.totalAmount,
          averageLeadTime: quote.items.reduce((sum, item) => sum + item.leadTimeDays, 0) / quote.items.length,
          discountPercentage: quote.discountPercentage,
          overallScore: quote.evaluationScore,
          recommendation: quote.evaluationScore && quote.evaluationScore >= 85 ? 'Recommended' : undefined
        }));

      // Find recommended vendor (highest score)
      const recommendedVendor = vendorSummary.reduce((prev, curr) =>
        (curr.overallScore || 0) > (prev.overallScore || 0) ? curr : prev
        , vendorSummary[0]);

      return {
        rfqId: rfq.id,
        rfqNumber: rfq.rfqNumber,
        items: itemComparisons,
        vendorSummary,
        recommendedVendorId: recommendedVendor?.vendorId,
        recommendedVendorName: recommendedVendor?.vendorName
      };
    }

    const response = await apiClient.get<QuoteComparisonResult>(`/procurement/rfqs/${id}/compare`);
    return response.data;
  }

  async awardRFQ(id: string, vendorId: string): Promise<ProcurementRFQ> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(600);
      const index = MOCK_RFQS.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error('RFQ not found');
      }

      const selectedQuote = MOCK_RFQS[index].quotes.find(q => q.vendorId === vendorId);
      if (!selectedQuote) {
        throw new Error('Quote not found for selected vendor');
      }

      // Update quote statuses
      const updatedQuotes = MOCK_RFQS[index].quotes.map(q => ({
        ...q,
        status: q.vendorId === vendorId ? 'Selected' as QuoteStatus : 'Rejected' as QuoteStatus
      }));

      const vendor = MOCK_RFQS[index].invitedVendors.find(v => v.vendorId === vendorId);

      MOCK_RFQS[index] = {
        ...MOCK_RFQS[index],
        status: 'Awarded',
        quotes: updatedQuotes,
        awardedVendorId: vendorId,
        awardedVendorName: vendor?.vendorName || selectedQuote.vendorName,
        awardedQuoteId: selectedQuote.id,
        awardedAt: new Date().toISOString(),
        awardedBy: 'user-current',
        awardedByName: 'Current User',
        updatedAt: new Date().toISOString()
      };

      return MOCK_RFQS[index];
    }

    const response = await apiClient.post<ProcurementRFQ>(`/procurement/rfqs/${id}/award`, { vendorId });
    return response.data;
  }

  async cancelRFQ(id: string, reason: string): Promise<ProcurementRFQ> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(500);
      const index = MOCK_RFQS.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error('RFQ not found');
      }

      MOCK_RFQS[index] = {
        ...MOCK_RFQS[index],
        status: 'Cancelled',
        notes: `${MOCK_RFQS[index].notes || ''}\nCancellation reason: ${reason}`.trim(),
        updatedAt: new Date().toISOString()
      };

      return MOCK_RFQS[index];
    }

    const response = await apiClient.post<ProcurementRFQ>(`/procurement/rfqs/${id}/cancel`, { reason });
    return response.data;
  }

  async addVendorToRFQ(id: string, vendorId: string, vendorCode: string, vendorName: string, email: string): Promise<ProcurementRFQ> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(300);
      const index = MOCK_RFQS.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error('RFQ not found');
      }

      if (MOCK_RFQS[index].invitedVendors.some(v => v.vendorId === vendorId)) {
        throw new Error('Vendor already added to this RFQ');
      }

      MOCK_RFQS[index].invitedVendors.push({
        vendorId,
        vendorCode,
        vendorName,
        email
      });

      MOCK_RFQS[index].updatedAt = new Date().toISOString();

      return MOCK_RFQS[index];
    }

    const response = await apiClient.post<ProcurementRFQ>(`/procurement/rfqs/${id}/vendors`, {
      vendorId,
      vendorCode,
      vendorName,
      email
    });
    return response.data;
  }

  async removeVendorFromRFQ(id: string, vendorId: string): Promise<ProcurementRFQ> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(300);
      const index = MOCK_RFQS.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error('RFQ not found');
      }

      MOCK_RFQS[index].invitedVendors = MOCK_RFQS[index].invitedVendors.filter(
        v => v.vendorId !== vendorId
      );

      MOCK_RFQS[index].updatedAt = new Date().toISOString();

      return MOCK_RFQS[index];
    }

    const response = await apiClient.delete<ProcurementRFQ>(`/procurement/rfqs/${id}/vendors/${vendorId}`);
    return response.data;
  }

  async convertToPO(id: string): Promise<{ rfq: ProcurementRFQ; poId: string; poNumber: string }> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(800);
      const index = MOCK_RFQS.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error('RFQ not found');
      }

      if (MOCK_RFQS[index].status !== 'Awarded') {
        throw new Error('RFQ must be awarded before converting to PO');
      }

      const poId = `po-${Date.now()}`;
      const poNumber = `PO-2026-${String(Date.now()).slice(-3)}`;

      MOCK_RFQS[index] = {
        ...MOCK_RFQS[index],
        convertedToPOId: poId,
        convertedToPONumber: poNumber,
        updatedAt: new Date().toISOString()
      };

      return {
        rfq: MOCK_RFQS[index],
        poId,
        poNumber
      };
    }

    const response = await apiClient.post<{ rfq: ProcurementRFQ; poId: string; poNumber: string }>(
      `/procurement/rfqs/${id}/convert-to-po`,
      {}
    );
    return response.data;
  }

  async getRFQStats(): Promise<{
    totalRFQs: number;
    draftCount: number;
    sentCount: number;
    underEvaluationCount: number;
    awardedCount: number;
    totalEstimatedValue: number;
  }> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      return {
        totalRFQs: MOCK_RFQS.length,
        draftCount: MOCK_RFQS.filter(rfq => rfq.status === 'Draft').length,
        sentCount: MOCK_RFQS.filter(rfq => rfq.status === 'Sent').length,
        underEvaluationCount: MOCK_RFQS.filter(rfq =>
          ['Responses Received', 'Under Evaluation'].includes(rfq.status)
        ).length,
        awardedCount: MOCK_RFQS.filter(rfq => rfq.status === 'Awarded').length,
        totalEstimatedValue: MOCK_RFQS.reduce((sum, rfq) => sum + (rfq.estimatedBudget || 0), 0)
      };
    }

    const response = await apiClient.get<{
      totalRFQs: number;
      draftCount: number;
      sentCount: number;
      underEvaluationCount: number;
      awardedCount: number;
      totalEstimatedValue: number;
    }>('/procurement/rfqs/stats');
    return response.data;
  }

  // ==================== Bids (NestJS domain backend) ====================

  async getBids(rfqId: string): Promise<RFQBid[]> {
    return domainRequest<RFQBid[]>(`/procurement/rfq/${rfqId}/bids`);
  }

  async createBid(rfqId: string, data: Partial<RFQBid>): Promise<RFQBid> {
    return domainRequest<RFQBid>(`/procurement/rfq/${rfqId}/bids`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async shortlistBid(bidId: string, notes?: string): Promise<RFQBid> {
    return domainRequest<RFQBid>(`/procurement/rfq/bids/${bidId}/shortlist`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async rejectBid(bidId: string, notes?: string): Promise<RFQBid> {
    return domainRequest<RFQBid>(`/procurement/rfq/bids/${bidId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async awardBid(bidId: string, notes?: string): Promise<RFQBid> {
    return domainRequest<RFQBid>(`/procurement/rfq/bids/${bidId}/award`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  // ==================== Templates (NestJS domain backend) ====================

  async getTemplates(): Promise<RFQTemplate[]> {
    return domainRequest<RFQTemplate[]>('/procurement/rfq/templates');
  }

  async createTemplate(data: Partial<RFQTemplate>): Promise<RFQTemplate> {
    return domainRequest<RFQTemplate>('/procurement/rfq/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteTemplate(id: string): Promise<void> {
    return domainRequest<void>(`/procurement/rfq/templates/${id}`, {
      method: 'DELETE',
    });
  }
}

export const procurementRFQService = new ProcurementRFQService();
