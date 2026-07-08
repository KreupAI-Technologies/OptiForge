'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { procurementRFQService } from '@/services/procurement-rfq.service';
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
  Mail,
  Phone,
  Award,
  BarChart3,
  Filter,
  ShoppingBag,
} from 'lucide-react';

// TypeScript Interfaces
interface RFQItem {
  id: string;
  itemCode: string;
  description: string;
  specifications: string;
  quantity: number;
  unit: string;
  targetPrice: number;
}

interface VendorQuote {
  id: string;
  vendorId: string;
  vendorName: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'pending' | 'submitted' | 'late';
  submittedDate: string;
  items: {
    itemId: string;
    unitPrice: number;
    total: number;
    deliveryTime: string;
    remarks: string;
  }[];
  paymentTerms: string;
  deliveryTerms: string;
  validity: string;
  totalAmount: number;
  notes: string;
}

interface RFQ {
  id: string;
  rfqNumber: string;
  status: 'draft' | 'issued' | 'quotes_received' | 'evaluated' | 'awarded' | 'cancelled';
  title: string;
  category: 'raw_materials' | 'components' | 'services' | 'equipment';
  issueDate: string;
  closingDate: string;
  validityPeriod: number;
  vendorsInvited: number;
  quotesReceived: number;
  lowestQuote: number;
  daysRemaining: number;
  linkedPR: string;
  items: RFQItem[];
  vendors: VendorQuote[];
  commercialTerms: {
    paymentTerms: string;
    deliveryTerms: string;
    incoterms: string;
    inspectionRequirements: string;
  };
  evaluationCriteria: {
    price: number;
    quality: number;
    deliveryTime: number;
    paymentTerms: number;
  };
  termsAndConditions: string;
  notesToVendors: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Maps the backend ProcurementRFQ status enum to this page's status union.
const STATUS_MAP: Record<string, RFQ['status']> = {
  Draft: 'draft',
  Sent: 'issued',
  'Responses Received': 'quotes_received',
  'Under Evaluation': 'evaluated',
  Awarded: 'awarded',
  Cancelled: 'cancelled',
  Expired: 'cancelled',
};

// Defensive transform: maps the raw API/ORM ProcurementRFQ shape to the
// page's RFQ interface. Fields the backend does not provide (category,
// evaluationCriteria, commercialTerms sub-fields) fall back to sensible
// defaults so the existing UI keeps rendering.
function transformRFQ(raw: any): RFQ {
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const invited = Array.isArray(raw?.invitedVendors) ? raw.invitedVendors : [];
  const quotes = Array.isArray(raw?.quotes) ? raw.quotes : [];

  const mappedItems: RFQItem[] = items.map((it: any, idx: number) => ({
    id: String(it?.id ?? it?.itemId ?? idx),
    itemCode: it?.itemCode ?? '',
    description: it?.itemName ?? it?.description ?? '',
    specifications: it?.specifications ?? '',
    quantity: Number(it?.quantity ?? 0),
    unit: it?.unit ?? '',
    targetPrice: Number(it?.targetPrice ?? 0),
  }));

  // Build a vendor list from quotes (submitted) merged with invited vendors.
  const quoteByVendor = new Map<string, any>();
  quotes.forEach((q: any) => {
    if (q?.vendorId) quoteByVendor.set(String(q.vendorId), q);
  });

  const mappedVendors: VendorQuote[] = invited.map((v: any, idx: number) => {
    const q = quoteByVendor.get(String(v?.vendorId));
    const qItems = Array.isArray(q?.items) ? q.items : [];
    return {
      id: String(q?.id ?? v?.vendorId ?? idx),
      vendorId: v?.vendorId ?? q?.vendorId ?? '',
      vendorName: v?.vendorName ?? q?.vendorName ?? '',
      contactPerson: v?.contactPerson ?? '',
      email: v?.email ?? '',
      phone: v?.phone ?? '',
      status: q ? 'submitted' : 'pending',
      submittedDate: q?.receivedAt ?? q?.quoteDate ?? '',
      items: qItems.map((qi: any) => ({
        itemId: String(qi?.rfqItemId ?? ''),
        unitPrice: Number(qi?.unitPrice ?? 0),
        total: Number(qi?.totalPrice ?? 0),
        deliveryTime: qi?.leadTimeDays != null ? `${qi.leadTimeDays} days` : '',
        remarks: qi?.remarks ?? '',
      })),
      paymentTerms: q?.paymentTerms ?? '',
      deliveryTerms: q?.deliveryTerms ?? '',
      validity: q?.validUntil ?? '',
      totalAmount: Number(q?.totalAmount ?? 0),
      notes: q?.evaluationNotes ?? '',
    };
  });

  const submittedQuotes = mappedVendors.filter((v) => v.status === 'submitted');
  const lowestQuote = submittedQuotes.length
    ? Math.min(...submittedQuotes.map((v) => v.totalAmount || Infinity))
    : 0;

  const closingDate = raw?.responseDeadline ?? '';
  let daysRemaining = 0;
  if (closingDate) {
    const diff = Math.ceil(
      (new Date(closingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    daysRemaining = Number.isFinite(diff) ? Math.max(diff, 0) : 0;
  }

  return {
    id: String(raw?.id ?? ''),
    rfqNumber: raw?.rfqNumber ?? '',
    status: STATUS_MAP[raw?.status] ?? 'draft',
    title: raw?.title ?? '',
    category: 'raw_materials',
    issueDate: raw?.createdDate ?? '',
    closingDate,
    validityPeriod: 0,
    vendorsInvited: invited.length,
    quotesReceived: submittedQuotes.length,
    lowestQuote: Number.isFinite(lowestQuote) ? lowestQuote : 0,
    daysRemaining,
    linkedPR: raw?.prReference ?? '',
    items: mappedItems,
    vendors: mappedVendors,
    commercialTerms: {
      paymentTerms: '',
      deliveryTerms: '',
      incoterms: '',
      inspectionRequirements: '',
    },
    evaluationCriteria: {
      price: 50,
      quality: 30,
      deliveryTime: 15,
      paymentTerms: 5,
    },
    termsAndConditions: raw?.terms ?? '',
    notesToVendors: raw?.notes ?? '',
    createdBy: raw?.requestedByName ?? '',
    createdAt: raw?.createdAt ?? '',
    updatedAt: raw?.updatedAt ?? '',
  };
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  issued: 'bg-blue-100 text-blue-700 border-blue-300',
  quotes_received: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  evaluated: 'bg-purple-100 text-purple-700 border-purple-300',
  awarded: 'bg-green-100 text-green-700 border-green-300',
  cancelled: 'bg-red-100 text-red-700 border-red-300',
};

const categoryColors = {
  raw_materials: 'bg-blue-100 text-blue-700',
  components: 'bg-purple-100 text-purple-700',
  services: 'bg-green-100 text-green-700',
  equipment: 'bg-orange-100 text-orange-700',
};

const vendorStatusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  submitted: 'bg-green-100 text-green-700',
  late: 'bg-red-100 text-red-700',
};

export default function ViewRFQPage() {
  const router = useRouter();
  const params = useParams();
  const rfqId = params.id as string;

  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await procurementRFQService.getRFQById(rfqId)) as any;
        if (!cancelled) setRfq(transformRFQ(raw));
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load RFQ');
          setRfq(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    if (rfqId) load();
    return () => {
      cancelled = true;
    };
  }, [rfqId]);

  const [activeTab, setActiveTab] = useState<'overview' | 'quotes' | 'comparison'>('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FileText },
    { id: 'quotes', name: 'Vendor Quotes', icon: ShoppingCart },
    { id: 'comparison', name: 'Comparison', icon: BarChart3 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getLowestQuoteVendor = () => {
    const vendors = rfq?.vendors ?? [];
    return vendors.reduce((lowest, vendor) =>
      vendor.totalAmount < lowest.totalAmount ? vendor : lowest
    );
  };

  const calculateScore = (vendor: VendorQuote) => {
    const lowestPrice = Math.min(...(rfq?.vendors ?? []).map(v => v.totalAmount));
    const priceScore = (lowestPrice / vendor.totalAmount) * (rfq?.evaluationCriteria.price ?? 0);

    // Simplified scoring - in real system would be more complex
    const qualityScore = 25; // Assume 25 out of 30
    const deliveryScore = 12; // Assume 12 out of 15
    const paymentScore = 4; // Assume 4 out of 5

    return (priceScore + qualityScore + deliveryScore + paymentScore).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading RFQ…
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
        <button
          onClick={() => router.push('/rfq')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to RFQs</span>
        </button>
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
        <button
          onClick={() => router.push('/rfq')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to RFQs</span>
        </button>
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          RFQ not found.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.push('/rfq')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to RFQs</span>
        </button>

        {/* RFQ Header Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-4">
              <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <FileCheck className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{rfq.rfqNumber}</h1>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColors[rfq.status]}`}>
                    {rfq.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${categoryColors[rfq.category]}`}>
                    {rfq.category.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-700 mb-2">{rfq.title}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Issue Date: {rfq.issueDate}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Closing: {rfq.closingDate}
                  </span>
                  <span className="flex items-center text-orange-600 font-semibold">
                    {rfq.daysRemaining} days remaining
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {rfq.status === 'draft' && (
                <button
                  onClick={() => router.push(`/rfq/edit/${rfqId}`)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              )}
              {rfq.status === 'draft' && (
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Send className="h-4 w-4" />
                  <span>Issue RFQ</span>
                </button>
              )}
              {rfq.status === 'quotes_received' && (
                <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <CheckCircle className="h-4 w-4" />
                  <span>Evaluate</span>
                </button>
              )}
              {rfq.status === 'evaluated' && (
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Award className="h-4 w-4" />
                  <span>Award to Vendor</span>
                </button>
              )}
              {(rfq.status === 'evaluated' || rfq.status === 'awarded') && (
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Create PO</span>
                </button>
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
                <Building2 className="h-5 w-5 text-blue-600" />
                <p className="text-xs font-medium text-blue-600 uppercase">Vendors Invited</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">{rfq.vendorsInvited}</p>
              <p className="text-xs text-blue-600 mt-1">Suppliers contacted</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-xs font-medium text-green-600 uppercase">Quotes Received</p>
              </div>
              <p className="text-2xl font-bold text-green-900">{rfq.quotesReceived}</p>
              <p className="text-xs text-green-600 mt-1">Responses received</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <p className="text-xs font-medium text-purple-600 uppercase">Lowest Quote</p>
              </div>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(rfq.lowestQuote)}</p>
              <p className="text-xs text-purple-600 mt-1">Best price received</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <p className="text-xs font-medium text-orange-600 uppercase">Closing Date</p>
              </div>
              <p className="text-2xl font-bold text-orange-900">{rfq.closingDate}</p>
              <p className="text-xs text-orange-600 mt-1">{rfq.daysRemaining} days remaining</p>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="mt-6 bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">RFQ Process</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  rfq.status !== 'draft' ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Draft</p>
                </div>
              </div>

              <div className={`flex-1 h-1 mx-2 ${rfq.status !== 'draft' ? 'bg-green-500' : 'bg-gray-300'}`}></div>

              <div className="flex items-center space-x-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  rfq.status === 'issued' || rfq.status === 'quotes_received' || rfq.status === 'evaluated' || rfq.status === 'awarded'
                    ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  <Send className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Issued</p>
                </div>
              </div>

              <div className={`flex-1 h-1 mx-2 ${
                rfq.status === 'quotes_received' || rfq.status === 'evaluated' || rfq.status === 'awarded' ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>

              <div className="flex items-center space-x-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  rfq.status === 'quotes_received' || rfq.status === 'evaluated' || rfq.status === 'awarded'
                    ? 'bg-yellow-500' : 'bg-gray-300'
                }`}>
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Quotes Received</p>
                </div>
              </div>

              <div className={`flex-1 h-1 mx-2 ${
                rfq.status === 'evaluated' || rfq.status === 'awarded' ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>

              <div className="flex items-center space-x-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  rfq.status === 'evaluated' || rfq.status === 'awarded' ? 'bg-purple-500' : 'bg-gray-300'
                }`}>
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Evaluated</p>
                </div>
              </div>

              <div className={`flex-1 h-1 mx-2 ${rfq.status === 'awarded' ? 'bg-green-500' : 'bg-gray-300'}`}></div>

              <div className="flex items-center space-x-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  rfq.status === 'awarded' ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Awarded</p>
                </div>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-3">RFQ Overview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* RFQ Details */}
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  RFQ Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">RFQ Number</p>
                    <p className="text-sm font-semibold text-gray-900">{rfq.rfqNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Title</p>
                    <p className="text-sm text-gray-900">{rfq.title}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Category</p>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${categoryColors[rfq.category]}`}>
                      {rfq.category.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Issue Date</p>
                    <p className="text-sm text-gray-900">{rfq.issueDate}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Closing Date</p>
                    <p className="text-sm font-semibold text-orange-600">{rfq.closingDate}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Validity Period</p>
                    <p className="text-sm text-gray-900">{rfq.validityPeriod} days</p>
                  </div>
                </div>
              </div>

              {/* Linked Documents */}
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <FileCheck className="h-5 w-5 mr-2 text-blue-600" />
                  Linked Documents
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Linked Purchase Requisition</p>
                    {rfq.linkedPR ? (
                      <button
                        onClick={() => router.push(`/procurement/requisitions/view/${rfq.linkedPR}`)}
                        className="text-sm text-blue-600 hover:underline font-semibold"
                      >
                        {rfq.linkedPR}
                      </button>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No linked PR</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Created By</p>
                    <p className="text-sm text-gray-900">{rfq.createdBy}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Created At</p>
                    <p className="text-sm text-gray-900">{rfq.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Last Updated</p>
                    <p className="text-sm text-gray-900">{rfq.updatedAt}</p>
                  </div>
                </div>
              </div>

              {/* Item Specifications */}
              <div className="md:col-span-2 border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-blue-600" />
                  Item Specifications ({rfq.items.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-300 bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Item Code</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Specifications</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Target Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rfq.items.map((item, index) => (
                        <tr key={item.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-4 py-3 text-sm font-medium text-blue-600">{item.itemCode}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{item.description}</td>
                          <td className="px-4 py-3 text-xs text-gray-600 max-w-xs">{item.specifications}</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(item.targetPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Commercial Terms */}
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                  Commercial Terms
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Payment Terms</p>
                    <p className="text-sm text-gray-900">{rfq.commercialTerms.paymentTerms}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Delivery Terms</p>
                    <p className="text-sm text-gray-900">{rfq.commercialTerms.deliveryTerms}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Incoterms</p>
                    <p className="text-sm font-semibold text-gray-900">{rfq.commercialTerms.incoterms}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Inspection</p>
                    <p className="text-sm text-gray-900">{rfq.commercialTerms.inspectionRequirements}</p>
                  </div>
                </div>
              </div>

              {/* Evaluation Criteria */}
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Evaluation Criteria (Weighted)
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-700">Price</p>
                      <p className="text-sm font-bold text-blue-600">{rfq.evaluationCriteria.price}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${rfq.evaluationCriteria.price}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-700">Quality</p>
                      <p className="text-sm font-bold text-green-600">{rfq.evaluationCriteria.quality}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${rfq.evaluationCriteria.quality}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-700">Delivery Time</p>
                      <p className="text-sm font-bold text-orange-600">{rfq.evaluationCriteria.deliveryTime}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${rfq.evaluationCriteria.deliveryTime}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-700">Payment Terms</p>
                      <p className="text-sm font-bold text-purple-600">{rfq.evaluationCriteria.paymentTerms}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${rfq.evaluationCriteria.paymentTerms}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vendors Invited */}
              <div className="md:col-span-2 border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Vendors Invited ({rfq.vendors.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {rfq.vendors.map((vendor) => (
                    <div key={vendor.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-bold text-gray-900">{vendor.vendorName}</h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${vendorStatusColors[vendor.status]}`}>
                          {vendor.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{vendor.contactPerson}</p>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-gray-600">
                          <Mail className="h-3 w-3 mr-1" />
                          {vendor.email}
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Phone className="h-3 w-3 mr-1" />
                          {vendor.phone}
                        </div>
                      </div>
                      {vendor.submittedDate && (
                        <p className="text-xs text-green-600 font-semibold mt-2">
                          Submitted: {vendor.submittedDate}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="md:col-span-2 border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Terms & Conditions
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{rfq.termsAndConditions}</pre>
                </div>
              </div>

              {/* Notes to Vendors */}
              <div className="md:col-span-2 border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Notes to Vendors
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{rfq.notesToVendors}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vendor Quotes Tab */}
        {activeTab === 'quotes' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">Vendor Quotes ({rfq.quotesReceived}/{rfq.vendorsInvited})</h3>
            </div>

            <div className="space-y-3">
              {rfq.vendors.filter(v => v.status === 'submitted').map((vendor) => (
                <div key={vendor.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{vendor.vendorName}</h4>
                      <p className="text-sm text-gray-600">{vendor.contactPerson} • {vendor.email} • {vendor.phone}</p>
                      <p className="text-xs text-gray-500 mt-1">Submitted: {vendor.submittedDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Quote</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(vendor.totalAmount)}</p>
                    </div>
                  </div>

                  {/* Quote Items */}
                  <div className="mb-2">
                    <h5 className="text-sm font-bold text-gray-900 mb-2">Line Items</h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-300 bg-white">
                            <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Item</th>
                            <th className="px-3 py-2 text-right text-xs font-bold text-gray-700">Unit Price</th>
                            <th className="px-3 py-2 text-right text-xs font-bold text-gray-700">Total</th>
                            <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Delivery</th>
                            <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vendor.items.map((item, index) => {
                            const rfqItem = rfq.items.find(i => i.id === item.itemId);
                            return (
                              <tr key={index} className="border-b border-gray-200">
                                <td className="px-3 py-2">{rfqItem?.itemCode} - {rfqItem?.description}</td>
                                <td className="px-3 py-2 text-right font-semibold">{formatCurrency(item.unitPrice)}</td>
                                <td className="px-3 py-2 text-right font-bold text-green-600">{formatCurrency(item.total)}</td>
                                <td className="px-3 py-2 text-xs">{item.deliveryTime}</td>
                                <td className="px-3 py-2 text-xs">{item.remarks}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Payment Terms</p>
                      <p className="text-sm text-gray-900">{vendor.paymentTerms}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Delivery Terms</p>
                      <p className="text-sm text-gray-900">{vendor.deliveryTerms}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Validity</p>
                      <p className="text-sm text-gray-900">{vendor.validity}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {vendor.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Vendor Notes:</p>
                      <p className="text-sm text-gray-700">{vendor.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comparison Tab */}
        {activeTab === 'comparison' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">Quote Comparison</h3>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Filter className="h-4 w-4" />
                <span>Export Comparison</span>
              </button>
            </div>

            {/* Side-by-side Comparison */}
            <div className="overflow-x-auto mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase sticky left-0 bg-gray-50">Item</th>
                    {rfq.vendors.filter(v => v.status === 'submitted').map((vendor) => (
                      <th key={vendor.id} className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                        {vendor.vendorName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rfq.items.map((item, index) => (
                    <tr key={item.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 sticky left-0 bg-inherit">
                        {item.itemCode}<br />
                        <span className="text-xs text-gray-600">{item.description}</span>
                      </td>
                      {rfq.vendors.filter(v => v.status === 'submitted').map((vendor) => {
                        const vendorItem = vendor.items.find(vi => vi.itemId === item.id);
                        const lowestPrice = Math.min(...rfq.vendors.filter(v => v.status === 'submitted').map(v =>
                          v.items.find(vi => vi.itemId === item.id)?.unitPrice || Infinity
                        ));
                        const isLowest = vendorItem?.unitPrice === lowestPrice;

                        return (
                          <td key={vendor.id} className={`px-4 py-3 text-center ${isLowest ? 'bg-green-50' : ''}`}>
                            <p className={`text-sm font-bold ${isLowest ? 'text-green-700' : 'text-gray-900'}`}>
                              {vendorItem ? formatCurrency(vendorItem.unitPrice) : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-600">{vendorItem?.deliveryTime || '-'}</p>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                    <td className="px-4 py-4 text-sm text-gray-900 uppercase sticky left-0 bg-gray-50">Total</td>
                    {rfq.vendors.filter(v => v.status === 'submitted').map((vendor) => {
                      const isLowest = vendor.totalAmount === getLowestQuoteVendor().totalAmount;
                      return (
                        <td key={vendor.id} className={`px-4 py-4 text-center ${isLowest ? 'bg-green-100' : ''}`}>
                          <p className={`text-lg font-bold ${isLowest ? 'text-green-700' : 'text-gray-900'}`}>
                            {formatCurrency(vendor.totalAmount)}
                          </p>
                          {isLowest && (
                            <p className="text-xs text-green-600 font-semibold mt-1">LOWEST</p>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50">Evaluation Score</td>
                    {rfq.vendors.filter(v => v.status === 'submitted').map((vendor) => (
                      <td key={vendor.id} className="px-4 py-3 text-center">
                        <p className="text-lg font-bold text-blue-600">{calculateScore(vendor)}</p>
                        <p className="text-xs text-gray-600">out of 100</p>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Winner Recommendation */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-3 mb-2">
                <Award className="h-8 w-8 text-green-600" />
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Recommended Vendor</h4>
                  <p className="text-sm text-gray-600">Based on evaluation criteria</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-700">{getLowestQuoteVendor().vendorName}</p>
                  <p className="text-sm text-gray-700 mt-1">
                    Total Quote: <span className="font-bold">{formatCurrency(getLowestQuoteVendor().totalAmount)}</span> |
                    Score: <span className="font-bold">{calculateScore(getLowestQuoteVendor())}/100</span>
                  </p>
                </div>
                <button className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
                  <Award className="h-5 w-5" />
                  <span>Award Contract</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
