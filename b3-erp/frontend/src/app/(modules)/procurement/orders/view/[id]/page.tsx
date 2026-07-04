'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { purchaseOrderService } from '@/services/purchase-order.service';
import {
  ArrowLeft,
  Edit,
  Package,
  Send,
  Download,
  Calendar,
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckSquare,
  Clock,
  AlertCircle,
  FileText,
  Truck,
  XCircle,
  User,
  DollarSign,
  IndianRupee,
  ClipboardCheck,
  ShoppingCart,
  CheckCircle,
  Tag,
  Box,
  Percent,
  Receipt,
  Link as LinkIcon,
  Activity,
} from 'lucide-react';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  status: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'closed' | 'cancelled';
  vendorName: string;
  vendorGST: string;
  vendorPAN: string;
  vendorContact: string;
  vendorEmail: string;
  vendorPhone: string;
  poDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  requisitionRef: string;
  rfqRef: string;
  paymentTerms: string;
  incoterms: string;
  freightTerms: string;
  buyerName: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  discount: number;
  total: number;
  receivedValue: number;
  pendingAmount: number;
  notes: string;
  termsConditions: string;
}

interface POLineItem {
  id: string;
  itemCode: string;
  description: string;
  hsn: string;
  quantity: number;
  receivedQty: number;
  unit: string;
  unitPrice: number;
  taxRate: number;
  taxType: 'CGST+SGST' | 'IGST';
  discountPercent: number;
  taxAmount: number;
  total: number;
}

interface DeliverySchedule {
  id: string;
  deliveryDate: string;
  quantity: number;
  location: string;
  status: 'pending' | 'partial' | 'completed';
  deliveredQty: number;
}

interface QualitySpec {
  id: string;
  parameter: string;
  specification: string;
  testMethod: string;
  acceptanceCriteria: string;
}

interface ActivityLog {
  id: string;
  date: string;
  action: string;
  description: string;
  performedBy: string;
  icon: any;
  color: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

// Mock data with Indian vendors
const mockPurchaseOrder: PurchaseOrder = {
  id: 'PO-001',
  poNumber: 'PO-2025-00142',
  status: 'partially_received',
  vendorName: 'JSW Steel Limited',
  vendorGST: '27AABCJ8578D1ZS',
  vendorPAN: 'AABCJ8578D',
  vendorContact: 'Rajesh Kumar',
  vendorEmail: 'sales@jswsteel.in',
  vendorPhone: '+91 836 2513333',
  poDate: '2025-10-01',
  expectedDelivery: '2025-10-30',
  actualDelivery: '2025-10-28',
  requisitionRef: 'PR-2025-00089',
  rfqRef: 'RFQ-2025-00056',
  paymentTerms: 'Net 45',
  incoterms: 'Ex-Works',
  freightTerms: 'Vendor Paid',
  buyerName: 'Amit Sharma',
  subtotal: 8500000,
  cgst: 382500,
  sgst: 382500,
  igst: 0,
  discount: 170000,
  total: 9095000,
  receivedValue: 4500000,
  pendingAmount: 4595000,
  notes: 'Urgent requirement for production line. Please ensure timely delivery with proper packaging.',
  termsConditions: '1. Material to be delivered as per delivery schedule\n2. Quality inspection at vendor premises before dispatch\n3. Payment within 45 days from GRN date\n4. Prices are firm and fixed for the PO duration\n5. Penalty for delayed delivery as per contract terms',
};

const vendorAddress: Address = {
  street: 'JSW Centre, Bandra Kurla Complex',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400051',
  country: 'India',
};

const billingAddress: Address = {
  street: 'Plot No. 45, MIDC Industrial Area',
  city: 'Pune',
  state: 'Maharashtra',
  pincode: '411019',
  country: 'India',
};

const deliveryAddress: Address = {
  street: 'Manufacturing Unit 2, Talegaon Industrial Park',
  city: 'Pune',
  state: 'Maharashtra',
  pincode: '410507',
  country: 'India',
};

const mockLineItems: POLineItem[] = [
  {
    id: '1',
    itemCode: 'STL-HR-12MM-001',
    description: 'Hot Rolled Steel Coils - Grade IS 2062 E250, Thickness 12mm',
    hsn: '7208',
    quantity: 500,
    receivedQty: 300,
    unit: 'MT',
    unitPrice: 52000,
    taxRate: 18,
    taxType: 'CGST+SGST',
    discountPercent: 2,
    taxAmount: 4587600,
    total: 29974800,
  },
  {
    id: '2',
    itemCode: 'STL-CR-08MM-002',
    description: 'Cold Rolled Steel Sheets - Grade IS 513 CR4, Thickness 8mm',
    hsn: '7209',
    quantity: 250,
    receivedQty: 150,
    unit: 'MT',
    unitPrice: 58000,
    taxRate: 18,
    taxType: 'CGST+SGST',
    discountPercent: 2,
    taxAmount: 2545200,
    total: 16619800,
  },
  {
    id: '3',
    itemCode: 'STL-TMT-16MM-003',
    description: 'TMT Steel Bars - Fe 500D Grade, Diameter 16mm, Length 12m',
    hsn: '7214',
    quantity: 100,
    receivedQty: 50,
    unit: 'MT',
    unitPrice: 48000,
    taxRate: 18,
    taxType: 'CGST+SGST',
    discountPercent: 2,
    taxAmount: 846720,
    total: 5530080,
  },
];

const mockDeliverySchedule: DeliverySchedule[] = [
  {
    id: '1',
    deliveryDate: '2025-10-15',
    quantity: 350,
    location: 'Pune Manufacturing Unit 2',
    status: 'completed',
    deliveredQty: 350,
  },
  {
    id: '2',
    deliveryDate: '2025-10-28',
    quantity: 250,
    location: 'Pune Manufacturing Unit 2',
    status: 'partial',
    deliveredQty: 150,
  },
  {
    id: '3',
    deliveryDate: '2025-11-10',
    quantity: 250,
    location: 'Pune Manufacturing Unit 2',
    status: 'pending',
    deliveredQty: 0,
  },
];

const mockQualitySpecs: QualitySpec[] = [
  {
    id: '1',
    parameter: 'Yield Strength',
    specification: 'Min 250 MPa',
    testMethod: 'IS 1608',
    acceptanceCriteria: 'As per IS 2062 standards',
  },
  {
    id: '2',
    parameter: 'Tensile Strength',
    specification: '410-540 MPa',
    testMethod: 'IS 1608',
    acceptanceCriteria: 'Within specified range',
  },
  {
    id: '3',
    parameter: 'Elongation',
    specification: 'Min 23%',
    testMethod: 'IS 1608',
    acceptanceCriteria: 'As per IS 2062 standards',
  },
  {
    id: '4',
    parameter: 'Chemical Composition',
    specification: 'C: 0.23%, Mn: 1.5%, S: 0.045%, P: 0.045%',
    testMethod: 'Spectro Analysis',
    acceptanceCriteria: 'As per IS 2062 Grade E250',
  },
  {
    id: '5',
    parameter: 'Surface Finish',
    specification: 'Free from defects, rust, and scale',
    testMethod: 'Visual Inspection',
    acceptanceCriteria: 'No visible defects',
  },
  {
    id: '6',
    parameter: 'Dimensional Tolerance',
    specification: '+/- 0.5mm',
    testMethod: 'Vernier Caliper',
    acceptanceCriteria: 'Within tolerance limits',
  },
];

const mockActivityLog: ActivityLog[] = [
  {
    id: '1',
    date: '2025-10-28',
    action: 'Partial Delivery',
    description: 'GRN-2025-00234 created for 150 MT material received',
    performedBy: 'Warehouse Team',
    icon: Package,
    color: 'blue',
  },
  {
    id: '2',
    date: '2025-10-25',
    action: 'Quality Inspection',
    description: 'Quality inspection passed for upcoming delivery',
    performedBy: 'QC Team',
    icon: ClipboardCheck,
    color: 'green',
  },
  {
    id: '3',
    date: '2025-10-15',
    action: 'First Delivery',
    description: 'GRN-2025-00198 created for 350 MT material received',
    performedBy: 'Warehouse Team',
    icon: Package,
    color: 'blue',
  },
  {
    id: '4',
    date: '2025-10-10',
    action: 'Vendor Acknowledged',
    description: 'Vendor confirmed the PO with delivery schedule',
    performedBy: 'Rajesh Kumar',
    icon: CheckCircle,
    color: 'green',
  },
  {
    id: '5',
    date: '2025-10-05',
    action: 'PO Sent',
    description: 'Purchase order sent to vendor via email',
    performedBy: 'Amit Sharma',
    icon: Send,
    color: 'purple',
  },
  {
    id: '6',
    date: '2025-10-03',
    action: 'PO Approved',
    description: 'Purchase order approved by procurement manager',
    performedBy: 'Priya Desai',
    icon: CheckSquare,
    color: 'green',
  },
  {
    id: '7',
    date: '2025-10-01',
    action: 'PO Created',
    description: 'Purchase order created from RFQ-2025-00056',
    performedBy: 'Amit Sharma',
    icon: FileText,
    color: 'gray',
  },
];

const statusConfig = {
  draft: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: FileText, label: 'Draft' },
  sent: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Send, label: 'Sent to Vendor' },
  confirmed: { color: 'bg-purple-100 text-purple-700 border-purple-300', icon: CheckSquare, label: 'Confirmed' },
  partially_received: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock, label: 'Partially Received' },
  received: { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle, label: 'Fully Received' },
  closed: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: CheckCircle, label: 'Closed' },
  cancelled: { color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle, label: 'Cancelled' },
};

const deliveryStatusConfig = {
  pending: { color: 'bg-gray-100 text-gray-700', label: 'Pending' },
  partial: { color: 'bg-yellow-100 text-yellow-700', label: 'Partial' },
  completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
};

const getProgressStages = (status: PurchaseOrder['status']) => {
  const stageOrder = ['draft', 'sent', 'confirmed', 'partially_received', 'received', 'closed'];
  const currentIndex = stageOrder.indexOf(status);

  return [
    { id: 'draft', name: 'Draft', completed: currentIndex > 0, current: status === 'draft' },
    { id: 'sent', name: 'Sent', completed: currentIndex > 1, current: status === 'sent' },
    { id: 'confirmed', name: 'Confirmed', completed: currentIndex > 2, current: status === 'confirmed' },
    { id: 'partially_received', name: 'Partially Received', completed: currentIndex > 3, current: status === 'partially_received' },
    { id: 'received', name: 'Received', completed: currentIndex > 4, current: status === 'received' },
    { id: 'closed', name: 'Closed', completed: status === 'closed', current: status === 'closed' },
  ];
};

export default function ViewPurchaseOrderPage() {
  const router = useRouter();
  const params = useParams();
  const poId = params.id as string;

  const [po, setPo] = useState<PurchaseOrder>(mockPurchaseOrder);
  const [lineItems, setLineItems] = useState<POLineItem[]>(mockLineItems);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const poStatusMap: Record<string, PurchaseOrder['status']> = {
      Draft: 'draft', 'Pending Approval': 'sent', Approved: 'confirmed', 'Sent to Vendor': 'sent',
      'Partially Received': 'partially_received', 'Fully Received': 'received', Closed: 'closed', Cancelled: 'cancelled',
    };
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await purchaseOrderService.getPurchaseOrderById(poId)) as any;
        if (!cancelled && raw) {
          setPo((prev) => ({
            ...prev,
            id: raw.id ?? prev.id,
            poNumber: raw.poNumber ?? prev.poNumber,
            status: poStatusMap[raw.status] ?? prev.status,
            vendorName: raw.vendorName ?? prev.vendorName,
            vendorContact: raw.vendorContact ?? prev.vendorContact,
            poDate: raw.orderDate ?? raw.poDate ?? prev.poDate,
            expectedDelivery: raw.deliveryDate ?? prev.expectedDelivery,
            requisitionRef: raw.prReference ?? prev.requisitionRef,
            rfqRef: raw.rfqReference ?? prev.rfqRef,
            paymentTerms: raw.paymentTerms ?? prev.paymentTerms,
            subtotal: raw.subtotal != null ? Number(raw.subtotal) : prev.subtotal,
            discount: raw.discountAmount != null ? Number(raw.discountAmount) : prev.discount,
            total: raw.totalAmount != null ? Number(raw.totalAmount) : prev.total,
            notes: raw.notes ?? prev.notes,
            termsConditions: raw.terms ?? prev.termsConditions,
          }));
          if (Array.isArray(raw.items) && raw.items.length) {
            setLineItems(raw.items.map((it: any, idx: number) => ({
              id: it.id ?? String(idx),
              itemCode: it.itemCode ?? '',
              description: it.itemName ?? it.description ?? '',
              hsn: it.hsn ?? '',
              quantity: Number(it.quantity ?? 0),
              receivedQty: Number(it.receivedQuantity ?? 0),
              unit: it.unit ?? '',
              unitPrice: Number(it.unitPrice ?? 0),
              taxRate: Number(it.taxRate ?? 0),
              taxType: 'CGST+SGST' as const,
              discountPercent: Number(it.discount ?? 0),
              taxAmount: Number(it.taxAmount ?? 0),
              total: Number(it.totalAmount ?? 0),
            })));
          }
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load purchase order');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [poId]);

  const [activeTab, setActiveTab] = useState<'overview' | 'line_items' | 'delivery_qc'>('overview');

  const statusInfo = statusConfig[po.status];
  const StatusIcon = statusInfo.icon;
  const progressStages = getProgressStages(po.status);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FileText },
    { id: 'line_items', name: 'Line Items', icon: Package },
    { id: 'delivery_qc', name: 'Delivery & QC', icon: Truck },
  ];

  const deliveryStatus =
    po.receivedValue === 0 ? 'Not Started' :
    po.receivedValue >= po.total ? 'Completed' :
    'In Progress';

  const deliveryStatusColor =
    deliveryStatus === 'Not Started' ? 'text-gray-600' :
    deliveryStatus === 'Completed' ? 'text-green-600' :
    'text-yellow-600';

  return (
    <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
      {isLoading && (<div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">Loading purchase order...</div>)}
      {loadError && !isLoading && (<div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</div>)}
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.push('/procurement/purchase-orders')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Purchase Orders</span>
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          {/* PO Header Info */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-4 flex-1">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{po.poNumber}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-lg text-gray-600">{po.vendorName}</span>
                  </div>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${statusInfo.color}`}>
                    <StatusIcon className="h-4 w-4 inline mr-1" />
                    {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-500">GST: {po.vendorGST}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-500">PAN: {po.vendorPAN}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-500">Buyer: {po.buyerName}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {po.status === 'draft' && (
                <button
                  onClick={() => router.push(`/procurement/orders/edit/${poId}`)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              )}
              <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Send className="h-4 w-4" />
                <span>Send to Vendor</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <CheckSquare className="h-4 w-4" />
                <span>Confirm</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                <Package className="h-4 w-4" />
                <span>Create GRN</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <XCircle className="h-4 w-4" />
                <span>Cancel PO</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <p className="text-xs font-medium text-blue-600 uppercase mb-1">PO Amount</p>
              <p className="text-2xl font-bold text-blue-900">₹{po.total.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <p className="text-xs font-medium text-green-600 uppercase mb-1">Received Value</p>
              <p className="text-2xl font-bold text-green-900">₹{po.receivedValue.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <p className="text-xs font-medium text-orange-600 uppercase mb-1">Pending Amount</p>
              <p className="text-2xl font-bold text-orange-900">₹{po.pendingAmount.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <p className="text-xs font-medium text-purple-600 uppercase mb-1">Delivery Status</p>
              <p className={`text-lg font-semibold ${deliveryStatusColor}`}>{deliveryStatus}</p>
              <p className="text-xs text-purple-600 mt-1">{((po.receivedValue / po.total) * 100).toFixed(1)}% completed</p>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Purchase Order Progress</h3>
            <div className="relative">
              <div className="flex items-center justify-between">
                {progressStages.map((stage, index) => {
                  const isLast = index === progressStages.length - 1;

                  return (
                    <div key={stage.id} className="flex items-center flex-1">
                      <div className="flex flex-col items-center relative z-10">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all ${
                          stage.completed
                            ? 'bg-green-500 border-green-600'
                            : stage.current
                            ? 'bg-blue-500 border-blue-600 ring-4 ring-blue-200'
                            : 'bg-gray-200 border-gray-300'
                        }`}>
                          {stage.completed ? (
                            <CheckCircle className="h-6 w-6 text-white" />
                          ) : stage.current ? (
                            <Clock className="h-6 w-6 text-white" />
                          ) : (
                            <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
                          )}
                        </div>
                        <div className="mt-2 text-center">
                          <p className={`text-xs font-semibold ${
                            stage.current ? 'text-blue-900' : 'text-gray-700'
                          }`}>
                            {stage.name}
                          </p>
                        </div>
                      </div>

                      {!isLast && (
                        <div className={`flex-1 h-1 mx-2 rounded ${
                          stage.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3">
        <div className="border-b border-gray-200 bg-white rounded-t-lg">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <TabIcon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-3">
            {/* Vendor and PO Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Vendor Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Vendor Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Vendor Name</p>
                    <p className="text-sm font-semibold text-gray-900">{po.vendorName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">GST Number</p>
                      <p className="text-sm text-gray-900">{po.vendorGST}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">PAN Number</p>
                      <p className="text-sm text-gray-900">{po.vendorPAN}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Contact Person</p>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">{po.vendorContact}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Email</p>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">{po.vendorEmail}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Phone</p>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">{po.vendorPhone}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Vendor Address</p>
                    <div className="flex items-start space-x-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="text-sm text-gray-900">
                        <p>{vendorAddress.street}</p>
                        <p>{vendorAddress.city}, {vendorAddress.state} {vendorAddress.pincode}</p>
                        <p>{vendorAddress.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PO Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Purchase Order Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">PO Number</p>
                    <p className="text-sm font-semibold text-gray-900">{po.poNumber}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">PO Date</p>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-900">{po.poDate}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Expected Delivery</p>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-900">{po.expectedDelivery}</p>
                      </div>
                    </div>
                  </div>
                  {po.actualDelivery && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Actual Delivery</p>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <p className="text-sm text-green-700 font-semibold">{po.actualDelivery}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Buyer Name</p>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">{po.buyerName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Payment Terms</p>
                      <p className="text-sm text-gray-900">{po.paymentTerms}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Incoterms</p>
                      <p className="text-sm text-gray-900">{po.incoterms}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Freight Terms</p>
                    <p className="text-sm text-gray-900">{po.freightTerms}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Linked Documents */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <LinkIcon className="h-5 w-5 mr-2 text-blue-600" />
                Linked Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <button
                  onClick={() => router.push(`/procurement/requisitions/view/${po.requisitionRef}`)}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Requisition</p>
                      <p className="text-sm font-semibold text-gray-900">{po.requisitionRef}</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => router.push(`/procurement/rfq/view/${po.rfqRef}`)}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">RFQ Reference</p>
                      <p className="text-sm font-semibold text-gray-900">{po.rfqRef}</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => router.push(`/procurement/grn?po=${po.poNumber}`)}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">GRN Records</p>
                      <p className="text-sm font-semibold text-gray-900">2 GRNs</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Billing Address */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Billing Address
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900">{billingAddress.street}</p>
                  <p className="text-sm text-gray-900 mt-1">{billingAddress.city}, {billingAddress.state}</p>
                  <p className="text-sm text-gray-900 mt-1">{billingAddress.pincode}</p>
                  <p className="text-sm text-gray-900 mt-1">{billingAddress.country}</p>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-blue-600" />
                  Delivery Address
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900">{deliveryAddress.street}</p>
                  <p className="text-sm text-gray-900 mt-1">{deliveryAddress.city}, {deliveryAddress.state}</p>
                  <p className="text-sm text-gray-900 mt-1">{deliveryAddress.pincode}</p>
                  <p className="text-sm text-gray-900 mt-1">{deliveryAddress.country}</p>
                </div>
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="space-y-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Special Instructions
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900 whitespace-pre-line">{po.notes}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Terms & Conditions
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900 whitespace-pre-line">{po.termsConditions}</p>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Activity Timeline
              </h3>
              <div className="space-y-3">
                {mockActivityLog.map((activity, index) => {
                  const ActivityIcon = activity.icon;
                  const isLast = index === mockActivityLog.length - 1;

                  return (
                    <div key={activity.id} className="relative">
                      {!isLast && (
                        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-300"></div>
                      )}

                      <div className="flex items-start space-x-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 bg-${activity.color}-100 text-${activity.color}-600 border-${activity.color}-200`}>
                          <ActivityIcon className="h-5 w-5" />
                        </div>

                        <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-gray-900">{activity.action}</h4>
                              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-xs text-gray-500">{activity.date}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">By {activity.performedBy}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Line Items Tab */}
        {activeTab === 'line_items' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Purchase Order Line Items</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Item Details</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">HSN Code</th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase">Ordered Qty</th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase">Received Qty</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Unit</th>
                      <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 uppercase">Unit Price</th>
                      <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 uppercase">Discount</th>
                      <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 uppercase">GST</th>
                      <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lineItems.map((item) => {
                      const receivedPercent = (item.receivedQty / item.quantity) * 100;
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{item.itemCode}</p>
                              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">{item.hsn}</td>
                          <td className="px-3 py-2 text-center">
                            <p className="text-sm font-semibold text-gray-900">{item.quantity}</p>
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-center">
                              <p className="text-sm font-semibold text-gray-900">{item.receivedQty}</p>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    receivedPercent === 100 ? 'bg-green-500' :
                                    receivedPercent > 0 ? 'bg-yellow-500' : 'bg-gray-300'
                                  }`}
                                  style={{ width: `${receivedPercent}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">{receivedPercent.toFixed(0)}%</p>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">{item.unit}</td>
                          <td className="px-3 py-2 text-sm text-gray-900 text-right">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                          <td className="px-3 py-2 text-sm text-gray-900 text-right">{item.discountPercent}%</td>
                          <td className="px-3 py-2 text-sm text-gray-900 text-right">
                            {item.taxRate}%
                            <span className="block text-xs text-gray-500">{item.taxType}</span>
                          </td>
                          <td className="px-3 py-2 text-sm font-bold text-gray-900 text-right">₹{item.total.toLocaleString('en-IN')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="bg-gray-50 p-3 border-t border-gray-200">
                <div className="max-w-md ml-auto space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold text-gray-900">₹{po.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {po.cgst > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">CGST (9%):</span>
                        <span className="font-semibold text-gray-900">₹{po.cgst.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">SGST (9%):</span>
                        <span className="font-semibold text-gray-900">₹{po.sgst.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                  {po.igst > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IGST (18%):</span>
                      <span className="font-semibold text-gray-900">₹{po.igst.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {po.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-semibold text-red-600">-₹{po.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-base font-bold text-gray-900">Total Amount:</span>
                      <span className="text-xl font-bold text-blue-900">₹{po.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-sm text-gray-600">Received Value:</span>
                    <span className="text-sm font-semibold text-green-700">₹{po.receivedValue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pending Amount:</span>
                    <span className="text-sm font-semibold text-orange-700">₹{po.pendingAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delivery & QC Tab */}
        {activeTab === 'delivery_qc' && (
          <div className="space-y-3">
            {/* Delivery Schedule */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                <Truck className="h-5 w-5 mr-2 text-blue-600" />
                Delivery Schedule
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Delivery Date</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Quantity</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Delivered Qty</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Location</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockDeliverySchedule.map((delivery) => {
                      const statusInfo = deliveryStatusConfig[delivery.status];
                      return (
                        <tr key={delivery.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{delivery.deliveryDate}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-sm font-semibold text-gray-900">{delivery.quantity} MT</td>
                          <td className="px-3 py-2 text-sm font-semibold text-gray-900">{delivery.deliveredQty} MT</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{delivery.location}</td>
                          <td className="px-3 py-2">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quality Specifications */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                <ClipboardCheck className="h-5 w-5 mr-2 text-blue-600" />
                Quality Specifications & Inspection Requirements
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-50 to-green-100 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Parameter</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Specification</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Test Method</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Acceptance Criteria</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockQualitySpecs.map((spec) => (
                      <tr key={spec.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-semibold text-gray-900">{spec.parameter}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{spec.specification}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{spec.testMethod}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{spec.acceptanceCriteria}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Delivery Instructions */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Delivery & Inspection Instructions
              </h3>
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-3 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">Packaging Requirements</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start space-x-2">
                        <CheckSquare className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Materials must be properly bundled and secured</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckSquare className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Weather-proof packaging required for outdoor storage</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckSquare className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Clear labeling with item code, quantity, and heat number</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">Inspection Process</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start space-x-2">
                        <CheckSquare className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Pre-dispatch inspection at vendor facility mandatory</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckSquare className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Test certificates (TC) to accompany each delivery</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckSquare className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>QC team inspection within 24 hours of delivery</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Delivery Location Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">Delivery Address</h4>
                  <div className="text-sm text-gray-900 space-y-1">
                    <p>{deliveryAddress.street}</p>
                    <p>{deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.pincode}</p>
                    <p>{deliveryAddress.country}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">Site Contact</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">Suresh Patel (Site Supervisor)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">+91 98765 43210</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">Working Hours: 8:00 AM - 6:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
