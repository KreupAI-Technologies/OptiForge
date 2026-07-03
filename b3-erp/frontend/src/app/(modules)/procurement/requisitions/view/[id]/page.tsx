'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { purchaseRequisitionService } from '@/services/purchase-requisition.service';
import {
  ArrowLeft,
  Edit,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ShoppingCart,
  Package,
  User,
  Calendar,
  DollarSign,
  Send,
  Ban,
  FileCheck,
  Building2,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  FileSignature,
  ShoppingBag,
  Truck,
  ClipboardList,
} from 'lucide-react';

// TypeScript Interfaces
interface RequisitionItem {
  id: string;
  itemCode: string;
  description: string;
  specifications: string;
  quantity: number;
  unit: string;
  estimatedUnitPrice: number;
  estimatedTotal: number;
  preferredVendor: string;
  category: 'raw_materials' | 'spare_parts' | 'consumables' | 'capital_goods' | 'services';
}

interface ApprovalHistoryItem {
  id: string;
  level: 'L1' | 'L2' | 'L3';
  approver: string;
  approverTitle: string;
  action: 'submitted' | 'approved' | 'rejected' | 'pending';
  comments: string;
  date: string;
  timestamp: string;
}

interface Requisition {
  id: string;
  prNumber: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'converted_to_po' | 'cancelled';
  requestedBy: string;
  requesterEmail: string;
  requesterDepartment: string;
  requestDate: string;
  requiredByDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  purpose: string;
  justification: string;
  totalItems: number;
  totalValue: number;
  daysPending: number;
  budgetCode: string;
  costCenter: string;
  approverName: string;
  approverTitle: string;
  approvalDate: string;
  items: RequisitionItem[];
  approvalHistory: ApprovalHistoryItem[];
  linkedRFQ: string;
  linkedPO: string;
  notes: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

// Mock Data - OptiForge India Manufacturing Context
const mockRequisition: Requisition = {
  id: '1',
  prNumber: 'PR-2025-0142',
  status: 'pending_approval',
  requestedBy: 'Anil Kumar Sharma',
  requesterEmail: 'anil.sharma@b3macbis.com',
  requesterDepartment: 'Production',
  requestDate: '2025-10-15',
  requiredByDate: '2025-10-30',
  priority: 'high',
  purpose: 'Replacement of worn-out machinery parts and critical raw materials for ongoing production',
  justification: 'Current machinery parts are showing significant wear and tear affecting production efficiency by 15%. Immediate replacement required to maintain production targets for Q4 2025. Raw materials stock has reached reorder level.',
  totalItems: 8,
  totalValue: 485000,
  daysPending: 2,
  budgetCode: 'PROD-2025-Q4',
  costCenter: 'PROD-001',
  approverName: 'Rajesh Patel',
  approverTitle: 'Production Manager',
  approvalDate: '',
  linkedRFQ: '',
  linkedPO: '',
  notes: 'Urgent requirement for production line 3. Please expedite approval process.',
  attachments: ['technical_specs.pdf', 'machinery_inspection_report.pdf', 'vendor_quotes.pdf'],
  createdAt: '2025-10-15 09:30 AM',
  updatedAt: '2025-10-15 02:45 PM',
  items: [
    {
      id: '1',
      itemCode: 'SP-CNC-2045',
      description: 'CNC Router Spindle Bearing Assembly',
      specifications: 'High-precision bearing, SKF/NSK brand, 60mm bore, 110mm OD, sealed type',
      quantity: 2,
      unit: 'Nos',
      estimatedUnitPrice: 12500,
      estimatedTotal: 25000,
      preferredVendor: 'SKF India Ltd',
      category: 'spare_parts',
    },
    {
      id: '2',
      itemCode: 'SP-HYD-1234',
      description: 'Hydraulic Cylinder Seal Kit',
      specifications: 'Complete seal kit for 100mm bore hydraulic cylinder, Viton material, pressure rating 250 bar',
      quantity: 5,
      unit: 'Sets',
      estimatedUnitPrice: 3500,
      estimatedTotal: 17500,
      preferredVendor: 'Parker Hannifin India',
      category: 'spare_parts',
    },
    {
      id: '3',
      itemCode: 'RM-PLY-001',
      description: 'Commercial Grade Plywood 19mm',
      specifications: 'BWP grade, 8x4 ft, ISI marked, moisture resistant, smooth finish both sides',
      quantity: 150,
      unit: 'Sheets',
      estimatedUnitPrice: 1850,
      estimatedTotal: 277500,
      preferredVendor: 'Greenply Industries',
      category: 'raw_materials',
    },
    {
      id: '4',
      itemCode: 'RM-HW-2567',
      description: 'Stainless Steel Cabinet Hinges',
      specifications: 'Soft-close hinges, 165-degree opening, Hettich/Hafele brand, nickel finish',
      quantity: 500,
      unit: 'Nos',
      estimatedUnitPrice: 180,
      estimatedTotal: 90000,
      preferredVendor: 'Hettich India',
      category: 'raw_materials',
    },
    {
      id: '5',
      itemCode: 'CONS-ADH-789',
      description: 'Industrial Wood Adhesive',
      specifications: 'Polyvinyl acetate (PVA) adhesive, water-resistant, 30 kg drums',
      quantity: 20,
      unit: 'Drums',
      estimatedUnitPrice: 2500,
      estimatedTotal: 50000,
      preferredVendor: 'Pidilite Industries',
      category: 'consumables',
    },
    {
      id: '6',
      itemCode: 'CONS-SAND-456',
      description: 'Abrasive Sanding Sheets',
      specifications: 'Aluminum oxide, 230x280mm, mixed grit (80, 120, 180, 240), 100 sheets/pack',
      quantity: 10,
      unit: 'Packs',
      estimatedUnitPrice: 850,
      estimatedTotal: 8500,
      preferredVendor: 'Saint-Gobain Abrasives',
      category: 'consumables',
    },
    {
      id: '7',
      itemCode: 'SP-ELC-3344',
      description: 'Servo Motor Drive Module',
      specifications: 'AC servo drive, 3kW, 220V input, compatible with Siemens/Delta systems',
      quantity: 1,
      unit: 'Nos',
      estimatedUnitPrice: 45000,
      estimatedTotal: 45000,
      preferredVendor: 'Siemens India',
      category: 'spare_parts',
    },
    {
      id: '8',
      itemCode: 'CONS-PAINT-667',
      description: 'PU Paint for Cabinet Finishing',
      specifications: 'Polyurethane paint, high gloss, white color, 20 liter drums',
      quantity: 15,
      unit: 'Drums',
      estimatedUnitPrice: 4500,
      estimatedTotal: 67500,
      preferredVendor: 'Asian Paints',
      category: 'consumables',
    },
  ],
  approvalHistory: [
    {
      id: '1',
      level: 'L1',
      approver: 'Suresh Kumar',
      approverTitle: 'Production Supervisor',
      action: 'submitted',
      comments: 'Requisition submitted for approval. All items verified for production requirements.',
      date: '2025-10-15',
      timestamp: '2025-10-15 09:30 AM',
    },
    {
      id: '2',
      level: 'L1',
      approver: 'Rajesh Patel',
      approverTitle: 'Production Manager',
      action: 'approved',
      comments: 'Approved. Items are critical for maintaining production schedule. Budget allocation verified.',
      date: '2025-10-15',
      timestamp: '2025-10-15 02:45 PM',
    },
    {
      id: '3',
      level: 'L2',
      approver: 'Priya Sharma',
      approverTitle: 'Finance Manager',
      action: 'pending',
      comments: '',
      date: '',
      timestamp: '',
    },
    {
      id: '4',
      level: 'L3',
      approver: 'Vijay Deshmukh',
      approverTitle: 'Director - Operations',
      action: 'pending',
      comments: '',
      date: '',
      timestamp: '',
    },
  ],
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  pending_approval: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  approved: 'bg-green-100 text-green-700 border-green-300',
  rejected: 'bg-red-100 text-red-700 border-red-300',
  converted_to_po: 'bg-blue-100 text-blue-700 border-blue-300',
  cancelled: 'bg-gray-100 text-gray-700 border-gray-300',
};

const priorityColors = {
  low: 'bg-green-100 text-green-700 border-green-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  urgent: 'bg-red-100 text-red-700 border-red-300',
};

const categoryColors = {
  raw_materials: 'bg-blue-100 text-blue-700',
  spare_parts: 'bg-purple-100 text-purple-700',
  consumables: 'bg-green-100 text-green-700',
  capital_goods: 'bg-orange-100 text-orange-700',
  services: 'bg-pink-100 text-pink-700',
};

const actionColors = {
  submitted: 'bg-blue-100 text-blue-700 border-blue-300',
  approved: 'bg-green-100 text-green-700 border-green-300',
  rejected: 'bg-red-100 text-red-700 border-red-300',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
};

export default function ViewRequisitionPage() {
  const router = useRouter();
  const params = useParams();
  const requisitionId = params.id as string;

  const [requisition, setRequisition] = useState<Requisition>(mockRequisition);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const prStatusMap: Record<string, Requisition['status']> = {
      Draft: 'draft', 'Pending Approval': 'pending_approval', Approved: 'approved',
      Rejected: 'rejected', 'Converted to PO': 'converted_to_po', Cancelled: 'cancelled',
    };
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await purchaseRequisitionService.getRequisitionById(requisitionId)) as any;
        if (!cancelled && raw) {
          const mappedItems: RequisitionItem[] | undefined = Array.isArray(raw.items) && raw.items.length
            ? raw.items.map((it: any, idx: number) => ({
                id: it.id ?? String(idx),
                itemCode: it.itemCode ?? '',
                description: it.itemName ?? it.description ?? '',
                specifications: it.notes ?? '',
                quantity: Number(it.quantity ?? 0),
                unit: it.unit ?? '',
                estimatedUnitPrice: Number(it.estimatedUnitPrice ?? 0),
                estimatedTotal: Number(it.estimatedTotalPrice ?? 0),
                preferredVendor: it.suggestedVendorName ?? '',
                category: 'raw_materials' as RequisitionItem['category'],
              }))
            : undefined;
          setRequisition((prev) => ({
            ...prev,
            id: raw.id ?? prev.id,
            prNumber: raw.prNumber ?? prev.prNumber,
            status: prStatusMap[raw.status] ?? prev.status,
            requestedBy: raw.requestedByName ?? raw.requestedBy ?? prev.requestedBy,
            requesterDepartment: raw.department ?? prev.requesterDepartment,
            requestDate: raw.requestDate ?? prev.requestDate,
            requiredByDate: raw.requiredDate ?? prev.requiredByDate,
            priority: (String(raw.priority ?? '').toLowerCase() as Requisition['priority']) || prev.priority,
            purpose: raw.title ?? prev.purpose,
            justification: raw.justification ?? prev.justification,
            totalValue: raw.estimatedTotal != null ? Number(raw.estimatedTotal) : prev.totalValue,
            budgetCode: raw.budgetCode ?? prev.budgetCode,
            approverName: raw.approvedByName ?? prev.approverName,
            approvalDate: raw.approvedAt ?? prev.approvalDate,
            linkedPO: raw.convertedToPONumber ?? prev.linkedPO,
            notes: raw.description ?? prev.notes,
            items: mappedItems ?? prev.items,
            totalItems: mappedItems ? mappedItems.length : prev.totalItems,
          }));
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load requisition');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [requisitionId]);

  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'approvals'>('overview');
  const [approvalComment, setApprovalComment] = useState('');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FileText },
    { id: 'items', name: 'Line Items', icon: ClipboardList },
    { id: 'approvals', name: 'Approval History', icon: FileSignature },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressPercentage = () => {
    const approvedCount = requisition.approvalHistory.filter(h => h.action === 'approved').length;
    const totalLevels = requisition.approvalHistory.length;
    return (approvedCount / totalLevels) * 100;
  };

  const getCurrentStage = () => {
    if (requisition.status === 'draft') return 'Draft';
    if (requisition.status === 'pending_approval') {
      const pendingLevel = requisition.approvalHistory.find(h => h.action === 'pending');
      return pendingLevel ? `Pending ${pendingLevel.level} Approval` : 'Pending Approval';
    }
    if (requisition.status === 'approved') return 'Approved';
    if (requisition.status === 'rejected') return 'Rejected';
    if (requisition.status === 'converted_to_po') return 'PO Created';
    return 'Cancelled';
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
      {isLoading && (<div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">Loading requisition...</div>)}
      {loadError && !isLoading && (<div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</div>)}
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.push('/procurement/requisitions')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Requisitions</span>
        </button>

        {/* Requisition Header Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-4">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{requisition.prNumber}</h1>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColors[requisition.status]}`}>
                    {requisition.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${priorityColors[requisition.priority]}`}>
                    {requisition.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Requested by {requisition.requestedBy} - {requisition.requesterDepartment} Department</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Request Date: {requisition.requestDate}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Required By: {requisition.requiredByDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {requisition.status === 'draft' && (
                <button
                  onClick={() => router.push(`/procurement/requisitions/edit/${requisitionId}`)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              )}
              {requisition.status === 'draft' && (
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Send className="h-4 w-4" />
                  <span>Submit for Approval</span>
                </button>
              )}
              {requisition.status === 'pending_approval' && (
                <>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <ThumbsUp className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    <ThumbsDown className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </>
              )}
              {requisition.status === 'approved' && (
                <>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <FileCheck className="h-4 w-4" />
                    <span>Create RFQ</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <ShoppingBag className="h-4 w-4" />
                    <span>Create PO</span>
                  </button>
                </>
              )}
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                <Ban className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="h-5 w-5 text-blue-600" />
                <p className="text-xs font-medium text-blue-600 uppercase">Total Items</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">{requisition.totalItems}</p>
              <p className="text-xs text-blue-600 mt-1">Items requested</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <p className="text-xs font-medium text-green-600 uppercase">Total Value</p>
              </div>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(requisition.totalValue)}</p>
              <p className="text-xs text-green-600 mt-1">Estimated cost</p>
            </div>

            <div className={`bg-gradient-to-br rounded-lg p-3 border ${requisition.priority === 'urgent' ? 'from-red-50 to-red-100 border-red-200' :
                requisition.priority === 'high' ? 'from-orange-50 to-orange-100 border-orange-200' :
                  requisition.priority === 'medium' ? 'from-yellow-50 to-yellow-100 border-yellow-200' :
                    'from-green-50 to-green-100 border-green-200'
              }`}>
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className={`h-5 w-5 ${requisition.priority === 'urgent' ? 'text-red-600' :
                    requisition.priority === 'high' ? 'text-orange-600' :
                      requisition.priority === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                  }`} />
                <p className={`text-xs font-medium uppercase ${requisition.priority === 'urgent' ? 'text-red-600' :
                    requisition.priority === 'high' ? 'text-orange-600' :
                      requisition.priority === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                  }`}>Priority Level</p>
              </div>
              <p className={`text-2xl font-bold ${requisition.priority === 'urgent' ? 'text-red-900' :
                  requisition.priority === 'high' ? 'text-orange-900' :
                    requisition.priority === 'medium' ? 'text-yellow-900' :
                      'text-green-900'
                }`}>{requisition.priority.toUpperCase()}</p>
              <p className={`text-xs mt-1 ${requisition.priority === 'urgent' ? 'text-red-600' :
                  requisition.priority === 'high' ? 'text-orange-600' :
                    requisition.priority === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                }`}>Priority level</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <p className="text-xs font-medium text-purple-600 uppercase">Days Pending</p>
              </div>
              <p className="text-2xl font-bold text-purple-900">{requisition.daysPending}</p>
              <p className="text-xs text-purple-600 mt-1">Days in approval</p>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="mt-6 bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Approval Progress</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${requisition.status !== 'draft' ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Draft</p>
                  <p className="text-xs text-gray-500">Created</p>
                </div>
              </div>

              <div className={`flex-1 h-1 mx-2 ${requisition.status !== 'draft' ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>

              <div className="flex items-center space-x-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${requisition.status === 'pending_approval' || requisition.status === 'approved' || requisition.status === 'converted_to_po'
                    ? 'bg-yellow-500' : 'bg-gray-300'
                  }`}>
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Pending Approval</p>
                  <p className="text-xs text-gray-500">In review</p>
                </div>
              </div>

              <div className={`flex-1 h-1 mx-2 ${requisition.status === 'approved' || requisition.status === 'converted_to_po' ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>

              <div className="flex items-center space-x-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${requisition.status === 'approved' || requisition.status === 'converted_to_po' ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Approved</p>
                  <p className="text-xs text-gray-500">Ready for PO/RFQ</p>
                </div>
              </div>

              <div className={`flex-1 h-1 mx-2 ${requisition.status === 'converted_to_po' ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>

              <div className="flex items-center space-x-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${requisition.status === 'converted_to_po' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}>
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">RFQ/PO Created</p>
                  <p className="text-xs text-gray-500">Procurement</p>
                </div>
              </div>

              <div className={`flex-1 h-1 mx-2 ${requisition.status === 'converted_to_po' ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>

              <div className="flex items-center space-x-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${requisition.status === 'converted_to_po' ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Closed</p>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">Progress: {getProgressPercentage().toFixed(0)}%</span>
                <span className="text-xs text-gray-600">{getCurrentStage()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
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
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
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
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Requisition Overview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Requester Information */}
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Requester Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Requested By</p>
                    <p className="text-sm font-semibold text-gray-900">{requisition.requestedBy}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Email</p>
                    <p className="text-sm text-gray-900">{requisition.requesterEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Department</p>
                    <p className="text-sm text-gray-900">{requisition.requesterDepartment}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Request Date</p>
                    <p className="text-sm text-gray-900">{requisition.requestDate}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Required By Date</p>
                    <p className="text-sm font-semibold text-orange-600">{requisition.requiredByDate}</p>
                  </div>
                </div>
              </div>

              {/* Budget & Cost Center */}
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                  Budget & Cost Center
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Budget Code</p>
                    <p className="text-sm font-semibold text-gray-900">{requisition.budgetCode}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Cost Center</p>
                    <p className="text-sm text-gray-900">{requisition.costCenter}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Priority</p>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${priorityColors[requisition.priority]}`}>
                      {requisition.priority.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Status</p>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${statusColors[requisition.status]}`}>
                      {requisition.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Purpose & Justification */}
              <div className="md:col-span-2 border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Purpose & Justification
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Purpose</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-gray-700">{requisition.purpose}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Justification</p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-gray-700">{requisition.justification}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Approver Details */}
              {requisition.approverName && (
                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                    <FileSignature className="h-5 w-5 mr-2 text-blue-600" />
                    Approver Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Approver Name</p>
                      <p className="text-sm font-semibold text-gray-900">{requisition.approverName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Title</p>
                      <p className="text-sm text-gray-900">{requisition.approverTitle}</p>
                    </div>
                    {requisition.approvalDate && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Approval Date</p>
                        <p className="text-sm text-gray-900">{requisition.approvalDate}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Linked Documents */}
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <FileCheck className="h-5 w-5 mr-2 text-blue-600" />
                  Linked Documents
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Linked RFQ</p>
                    {requisition.linkedRFQ ? (
                      <button
                        onClick={() => alert(`View linked RFQ ${requisition.linkedRFQ} - Feature coming soon`)}
                        className="text-sm text-blue-600 hover:underline font-semibold"
                      >
                        {requisition.linkedRFQ}
                      </button>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Not yet created</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Linked PO</p>
                    {requisition.linkedPO ? (
                      <button
                        onClick={() => alert(`View linked PO ${requisition.linkedPO} - Feature coming soon`)}
                        className="text-sm text-blue-600 hover:underline font-semibold"
                      >
                        {requisition.linkedPO}
                      </button>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Not yet created</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {requisition.notes && (
                <div className="md:col-span-2 border border-gray-200 rounded-lg p-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                    Notes
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{requisition.notes}</p>
                  </div>
                </div>
              )}

              {/* Attachments */}
              {requisition.attachments.length > 0 && (
                <div className="md:col-span-2 border border-gray-200 rounded-lg p-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Attachments ({requisition.attachments.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {requisition.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 cursor-pointer">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="text-sm text-gray-900">{attachment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Line Items Tab */}
        {activeTab === 'items' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">Line Items ({requisition.items.length})</h3>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(requisition.totalValue)}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Item Code</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Specifications</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Unit Price</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Preferred Vendor</th>
                  </tr>
                </thead>
                <tbody>
                  {requisition.items.map((item, index) => (
                    <tr key={item.id} className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-4 text-sm font-medium text-blue-600">{item.itemCode}</td>
                      <td className="px-4 py-4 text-sm text-gray-900 font-semibold">{item.description}</td>
                      <td className="px-4 py-4 text-xs text-gray-600 max-w-xs">{item.specifications}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColors[item.category]}`}>
                          {item.category.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-right font-semibold text-gray-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-4 py-4 text-sm text-right text-gray-900">{formatCurrency(item.estimatedUnitPrice)}</td>
                      <td className="px-4 py-4 text-sm text-right font-bold text-green-600">{formatCurrency(item.estimatedTotal)}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{item.preferredVendor}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-50">
                    <td colSpan={6} className="px-4 py-4 text-right text-sm font-bold text-gray-900 uppercase">
                      Grand Total:
                    </td>
                    <td className="px-4 py-4 text-right text-lg font-bold text-green-600">
                      {formatCurrency(requisition.totalValue)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Approval History Tab */}
        {activeTab === 'approvals' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">Approval History</h3>
              <span className="text-sm text-gray-600">Multi-level approval workflow</span>
            </div>

            <div className="space-y-2">
              {requisition.approvalHistory.map((history, index) => {
                const isLast = index === requisition.approvalHistory.length - 1;

                return (
                  <div key={history.id} className="relative">
                    {!isLast && (
                      <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-300"></div>
                    )}

                    <div className="flex items-start space-x-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${history.action === 'approved' ? 'bg-green-100 text-green-700 border-green-300' :
                          history.action === 'rejected' ? 'bg-red-100 text-red-700 border-red-300' :
                            history.action === 'submitted' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                              'bg-yellow-100 text-yellow-700 border-yellow-300'
                        }`}>
                        {history.action === 'approved' && <ThumbsUp className="h-5 w-5" />}
                        {history.action === 'rejected' && <ThumbsDown className="h-5 w-5" />}
                        {history.action === 'submitted' && <Send className="h-5 w-5" />}
                        {history.action === 'pending' && <Clock className="h-5 w-5" />}
                      </div>

                      <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`px-2 py-1 text-xs font-bold rounded ${actionColors[history.action]}`}>
                                {history.level}
                              </span>
                              <h4 className="text-base font-bold text-gray-900">{history.approver}</h4>
                            </div>
                            <p className="text-sm text-gray-600">{history.approverTitle}</p>
                            {history.timestamp && (
                              <p className="text-xs text-gray-500 mt-1">{history.timestamp}</p>
                            )}
                          </div>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${actionColors[history.action]}`}>
                            {history.action.toUpperCase()}
                          </span>
                        </div>
                        {history.comments && (
                          <div className="mt-3 bg-white border border-gray-200 rounded p-3">
                            <p className="text-sm text-gray-700">{history.comments}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Approval Action Panel */}
            {requisition.status === 'pending_approval' && (
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Approval Action</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comments (Optional)
                    </label>
                    <textarea
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your comments..."
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
                      <ThumbsUp className="h-5 w-5" />
                      <span>Approve</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
                      <ThumbsDown className="h-5 w-5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
