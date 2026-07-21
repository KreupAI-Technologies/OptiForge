'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FinanceService } from '@/services/finance.service';
import {
  ArrowLeft,
  Edit,
  Building2,
  DollarSign,
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Receipt,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Download,
  Send,
  IndianRupee,
  User,
  XCircle,
  Target,
  PhoneCall,
  MessageSquare,
  Activity,
  TrendingDown,
} from 'lucide-react';

// TypeScript Interfaces
interface AgingBucket {
  label: string;
  days: string;
  amount: number;
  percentage: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  soReference: string;
  amount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'outstanding' | 'partially_paid' | 'overdue' | 'paid';
  agingDays: number;
}

interface CollectionActivity {
  id: string;
  activityType: 'call' | 'email' | 'meeting' | 'follow_up' | 'promise_to_pay';
  date: string;
  time: string;
  performedBy: string;
  contactPerson: string;
  outcome: string;
  notes: string;
  nextFollowUp?: string;
  promiseAmount?: number;
  promiseDate?: string;
}

interface PaymentHistory {
  id: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  notes: string;
}

interface CustomerContact {
  name: string;
  designation: string;
  email: string;
  phone: string;
  department: string;
}

interface Receivable {
  id: string;
  customerId: string;
  customerName: string;
  customerCode: string;
  gstNumber: string;
  panNumber: string;
  customerCategory: 'wholesale' | 'retail' | 'distributor' | 'oem';

  // Financial Summary
  totalOutstanding: number;
  overdueAmount: number;
  dueThisWeek: number;
  dueThisMonth: number;
  lastCollectionAmount: number;
  lastCollectionDate: string;

  // Credit Management
  creditLimit: number;
  creditUsed: number;
  availableCredit: number;
  creditStatus: 'approved' | 'on_hold' | 'suspended';
  paymentTerms: string;

  // DSO (Days Sales Outstanding)
  dso: number;
  averageDaysDelayed: number;

  // Aging Analysis
  agingBuckets: AgingBucket[];

  // Invoices
  invoices: Invoice[];

  // Collection Activities
  collectionActivities: CollectionActivity[];

  // Payment History
  paymentHistory: PaymentHistory[];

  // Customer Details
  customerContact: CustomerContact;
  address: string;
  city: string;
  state: string;
  pincode: string;

  // Collection Info
  collectionAgent: string;
  collectionPriority: 'low' | 'medium' | 'high';

  // Status
  accountStatus: 'active' | 'on_hold' | 'blocked';
  riskRating: 'low' | 'medium' | 'high';

  // Dates
  customerSince: string;
  lastSaleDate: string;
}

// Empty receivable shell; hydrated from the backend on mount. Enum fields use
// valid defaults so config lookups never crash before data loads.
const emptyReceivable: Receivable = {
  id: '',
  customerId: '',
  customerName: '',
  customerCode: '',
  gstNumber: '',
  panNumber: '',
  customerCategory: 'wholesale',

  totalOutstanding: 0,
  overdueAmount: 0,
  dueThisWeek: 0,
  dueThisMonth: 0,
  lastCollectionAmount: 0,
  lastCollectionDate: '',

  creditLimit: 0,
  creditUsed: 0,
  availableCredit: 0,
  creditStatus: 'approved',
  paymentTerms: '',

  dso: 0,
  averageDaysDelayed: 0,

  agingBuckets: [],

  invoices: [],

  collectionActivities: [],

  paymentHistory: [],

  customerContact: {
    name: '',
    designation: '',
    email: '',
    phone: '',
    department: '',
  },
  address: '',
  city: '',
  state: '',
  pincode: '',

  collectionAgent: '',
  collectionPriority: 'medium',

  accountStatus: 'active',
  riskRating: 'medium',

  customerSince: '',
  lastSaleDate: '',
};

const statusColors = {
  active: 'bg-green-100 text-green-700 border-green-200',
  on_hold: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  blocked: 'bg-red-100 text-red-700 border-red-200',
};

const invoiceStatusColors = {
  outstanding: 'bg-blue-100 text-blue-700',
  partially_paid: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
};

const activityTypeColors = {
  call: 'bg-blue-100 text-blue-600 border-blue-200',
  email: 'bg-purple-100 text-purple-600 border-purple-200',
  meeting: 'bg-green-100 text-green-600 border-green-200',
  follow_up: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  promise_to_pay: 'bg-orange-100 text-orange-600 border-orange-200',
};

const activityIcons = {
  call: PhoneCall,
  email: Mail,
  meeting: User,
  follow_up: Clock,
  promise_to_pay: CheckCircle,
};

export default function ViewReceivablePage() {
  const router = useRouter();
  const params = useParams();
  const receivableId = params.id as string;
  const [receivable, setReceivable] = useState<Receivable>(emptyReceivable);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!receivableId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    setNotFound(false);
    (async () => {
      try {
        const raw = await FinanceService.getReceivable(receivableId);
        if (cancelled) return;
        const m: any = raw || {};
        if (!raw || (m.id == null && m.customerName == null)) {
          setNotFound(true);
          return;
        }
        setReceivable((prev) => ({
          ...prev,
          ...(m.id != null ? { id: String(m.id) } : {}),
          ...(m.customerId != null ? { customerId: String(m.customerId) } : {}),
          ...(m.customerName != null ? { customerName: String(m.customerName) } : {}),
          ...(m.customerCode != null ? { customerCode: String(m.customerCode) } : {}),
          ...(m.totalOutstanding != null ? { totalOutstanding: Number(m.totalOutstanding) } : {}),
          ...(m.overdueAmount != null ? { overdueAmount: Number(m.overdueAmount) } : {}),
          ...(m.creditLimit != null ? { creditLimit: Number(m.creditLimit) } : {}),
          ...(m.paymentTerms != null ? { paymentTerms: String(m.paymentTerms) } : {}),
          ...(m.lastCollectionDate != null ? { lastCollectionDate: String(m.lastCollectionDate) } : {}),
          ...(Array.isArray(m.invoices) ? { invoices: m.invoices } : {}),
        }));
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message || 'Failed to load receivable');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [receivableId, reloadKey]);

  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'collection_activities'>('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Building2 },
    { id: 'invoices', name: 'Invoices', icon: Receipt },
    { id: 'collection_activities', name: 'Collection Activities', icon: Activity },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatLakhsCrores = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return formatCurrency(amount);
    }
  };

  const handleGenerateSOA = () => {
    const headers = ['Invoice Number', 'Invoice Date', 'Due Date', 'SO Reference', 'Amount', 'Paid', 'Balance', 'Aging Days', 'Status'];
    const rows = receivable.invoices.map((inv) => [
      inv.invoiceNumber,
      inv.invoiceDate,
      inv.dueDate,
      inv.soReference,
      inv.amount,
      inv.paidAmount,
      inv.balanceAmount,
      inv.agingDays,
      inv.status,
    ]);
    const summary = [
      ['Statement of Account'],
      ['Customer', receivable.customerName],
      ['Customer Code', receivable.customerCode],
      ['Total Outstanding', receivable.totalOutstanding],
      ['Overdue Amount', receivable.overdueAmount],
      [],
    ];
    const csvContent = [...summary, headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOA_${receivable.customerCode || receivableId}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getAgingStatus = (days: number) => {
    if (days <= 30) return { label: 'Current', color: 'text-green-700', bgColor: 'bg-green-100' };
    if (days <= 60) return { label: '31-60 Days', color: 'text-blue-700', bgColor: 'bg-blue-100' };
    if (days <= 90) return { label: '61-90 Days', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
    return { label: '90+ Days', color: 'text-red-700', bgColor: 'bg-red-100' };
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
      {isLoading && (
        <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm text-blue-700">
          Loading…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700 flex items-center justify-between">
          <span className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {loadError}
          </span>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="ml-3 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}
      {notFound && !isLoading && (
        <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-sm text-yellow-700">
          Receivable not found.
        </div>
      )}
      {!isLoading && !notFound && (
      <>
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.push('/finance/receivables')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Receivables</span>
        </button>

        {/* Receivable Header Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-4">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{receivable.customerName}</h1>
                  <span className="px-3 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-600">
                    {receivable.customerCode}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <span>GST: {receivable.gstNumber}</span>
                  <span>•</span>
                  <span>PAN: {receivable.panNumber}</span>
                </div>
                <div className="flex items-center space-x-3 mt-2 flex-wrap gap-2">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${statusColors[receivable.accountStatus]}`}>
                    {receivable.accountStatus.replace('_', ' ').charAt(0).toUpperCase() + receivable.accountStatus.replace('_', ' ').slice(1)}
                  </span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${receivable.riskRating === 'low' ? 'bg-green-100 text-green-700' :
                      receivable.riskRating === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                    {receivable.riskRating.charAt(0).toUpperCase() + receivable.riskRating.slice(1)} Risk
                  </span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${receivable.collectionPriority === 'high' ? 'bg-red-100 text-red-700' :
                      receivable.collectionPriority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                    }`}>
                    {receivable.collectionPriority.charAt(0).toUpperCase() + receivable.collectionPriority.slice(1)} Priority
                  </span>
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-700 capitalize">
                    {receivable.customerCategory}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push(`/finance/receivables/edit/${receivableId}`)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <CreditCard className="h-4 w-4" />
                <span>Record Payment</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Send className="h-4 w-4" />
                <span>Send Reminder</span>
              </button>
              <button
                onClick={handleGenerateSOA}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Generate SOA</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-xs font-medium text-red-600 uppercase">Total Outstanding</p>
              </div>
              <p className="text-2xl font-bold text-red-900">{formatLakhsCrores(receivable.totalOutstanding)}</p>
              <p className="text-xs text-red-600 mt-1">{formatCurrency(receivable.totalOutstanding)}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center space-x-2 mb-2">
                <XCircle className="h-5 w-5 text-orange-600" />
                <p className="text-xs font-medium text-orange-600 uppercase">Overdue Amount</p>
              </div>
              <p className="text-2xl font-bold text-orange-900">{formatLakhsCrores(receivable.overdueAmount)}</p>
              <p className="text-xs text-orange-600 mt-1">{receivable.totalOutstanding ? ((receivable.overdueAmount / receivable.totalOutstanding) * 100).toFixed(1) : '0.0'}% of total</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <p className="text-xs font-medium text-yellow-600 uppercase">Due This Week</p>
              </div>
              <p className="text-2xl font-bold text-yellow-900">{formatLakhsCrores(receivable.dueThisWeek)}</p>
              <p className="text-xs text-yellow-600 mt-1">Requires attention</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-xs font-medium text-green-600 uppercase">Last Collection</p>
              </div>
              <p className="text-2xl font-bold text-green-900">{formatLakhsCrores(receivable.lastCollectionAmount)}</p>
              <p className="text-xs text-green-600 mt-1">{receivable.lastCollectionDate}</p>
            </div>
          </div>

          {/* Aging Progress Tracker */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Aging Analysis</h3>
            <div className="space-y-3">
              {/* Progress Bar */}
              <div className="flex h-8 rounded-lg overflow-hidden border-2 border-gray-300">
                {receivable.agingBuckets.map((bucket, index) => (
                  <div
                    key={index}
                    className={`${bucket.bgColor} flex items-center justify-center text-xs font-bold ${bucket.color}`}
                    style={{ width: `${bucket.percentage}%` }}
                  >
                    {bucket.percentage > 10 && `${bucket.percentage.toFixed(0)}%`}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {receivable.agingBuckets.map((bucket, index) => (
                  <div key={index} className={`${bucket.bgColor} rounded-lg p-3 border ${bucket.borderColor}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-xs font-medium ${bucket.color} uppercase`}>{bucket.days} Days</p>
                      <span className={`text-xs font-bold ${bucket.color}`}>{bucket.percentage.toFixed(1)}%</span>
                    </div>
                    <p className={`text-lg font-bold ${bucket.color}`}>{formatLakhsCrores(bucket.amount)}</p>
                    <p className={`text-xs ${bucket.color} mt-0.5`}>{formatCurrency(bucket.amount)}</p>
                  </div>
                ))}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Customer Overview</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Customer Details */}
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Customer Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Customer Name</p>
                    <p className="text-sm font-semibold text-gray-900">{receivable.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Customer Code</p>
                    <p className="text-sm text-gray-900">{receivable.customerCode}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Customer Category</p>
                    <p className="text-sm text-gray-900 capitalize">{receivable.customerCategory}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">GST Number</p>
                    <p className="text-sm text-gray-900">{receivable.gstNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">PAN Number</p>
                    <p className="text-sm text-gray-900">{receivable.panNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Customer Since</p>
                    <p className="text-sm text-gray-900">{receivable.customerSince}</p>
                  </div>
                </div>
              </div>

              {/* Credit Limit & DSO */}
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                  Credit Limit & Performance
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Credit Limit</p>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(receivable.creditLimit)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Available Credit</p>
                    <p className="text-sm font-semibold text-green-600">{formatCurrency(receivable.availableCredit)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Credit Utilization</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${receivable.creditLimit && (receivable.creditUsed / receivable.creditLimit) * 100 > 80
                            ? 'bg-red-600'
                            : receivable.creditLimit && (receivable.creditUsed / receivable.creditLimit) * 100 > 60
                              ? 'bg-yellow-600'
                              : 'bg-green-600'
                          }`}
                        style={{ width: `${receivable.creditLimit ? (receivable.creditUsed / receivable.creditLimit) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 text-right mt-1">
                      {receivable.creditLimit ? ((receivable.creditUsed / receivable.creditLimit) * 100).toFixed(1) : '0.0'}% utilized
                    </p>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded p-2">
                        <p className="text-xs font-medium text-blue-600 uppercase mb-1">DSO</p>
                        <p className="text-lg font-bold text-blue-900">{receivable.dso} Days</p>
                      </div>
                      <div className="bg-orange-50 rounded p-2">
                        <p className="text-xs font-medium text-orange-600 uppercase mb-1">Avg Delay</p>
                        <p className="text-lg font-bold text-orange-900">{receivable.averageDaysDelayed} Days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Contact Person</p>
                    <p className="text-sm font-semibold text-gray-900">{receivable.customerContact.name}</p>
                    <p className="text-xs text-gray-600">{receivable.customerContact.designation}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Department</p>
                    <p className="text-sm text-gray-900">{receivable.customerContact.department}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a href={`mailto:${receivable.customerContact.email}`} className="text-sm text-blue-600 hover:underline">
                      {receivable.customerContact.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a href={`tel:${receivable.customerContact.phone}`} className="text-sm text-blue-600 hover:underline">
                      {receivable.customerContact.phone}
                    </a>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Address</p>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-900">{receivable.address}</p>
                        <p className="text-sm text-gray-900">{receivable.city}, {receivable.state} - {receivable.pincode}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collection Info */}
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Collection Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Collection Agent</p>
                    <p className="text-sm font-semibold text-gray-900">{receivable.collectionAgent}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Collection Priority</p>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${receivable.collectionPriority === 'high' ? 'bg-red-100 text-red-700' :
                        receivable.collectionPriority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                      }`}>
                      {receivable.collectionPriority.charAt(0).toUpperCase() + receivable.collectionPriority.slice(1)} Priority
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Payment Terms</p>
                    <p className="text-sm text-gray-900">{receivable.paymentTerms}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Recent Payment History</p>
                    {receivable.paymentHistory.slice(0, 3).map((payment) => (
                      <div key={payment.id} className="bg-gray-50 rounded p-2 mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</span>
                          <span className="text-xs text-gray-600">{payment.paymentDate}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{payment.paymentMethod}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">Outstanding Invoices</h3>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">{receivable.invoices.length} invoices</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Number</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SO Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aging</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {receivable.invoices.map((invoice, index) => {
                    const agingStatus = getAgingStatus(invoice.agingDays);
                    return (
                      <tr key={invoice.id} className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-4 py-4 text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">{invoice.invoiceDate}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{invoice.dueDate}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{invoice.soReference}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-gray-900">{formatCurrency(invoice.amount)}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{formatCurrency(invoice.paidAmount)}</td>
                        <td className="px-4 py-4 text-sm font-bold text-gray-900">{formatCurrency(invoice.balanceAmount)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${agingStatus.bgColor} ${agingStatus.color}`}>
                            {invoice.agingDays} days
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${invoiceStatusColors[invoice.status]}`}>
                            {invoice.status === 'paid' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {invoice.status === 'overdue' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {invoice.status.replace('_', ' ').charAt(0).toUpperCase() + invoice.status.replace('_', ' ').slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Collection Activities Tab */}
        {activeTab === 'collection_activities' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">Collection Activity Timeline</h3>
              <div className="flex flex-wrap gap-2">
                <button className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium">
                  <PhoneCall className="h-4 w-4" />
                  <span>Log Call</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg text-sm font-medium">
                  <Mail className="h-4 w-4" />
                  <span>Send Email</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-medium">
                  <User className="h-4 w-4" />
                  <span>Schedule Meeting</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {receivable.collectionActivities.map((activity, index) => {
                const ActivityIcon = activityIcons[activity.activityType];
                const isLast = index === receivable.collectionActivities.length - 1;

                return (
                  <div key={activity.id} className="relative">
                    {!isLast && (
                      <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-300"></div>
                    )}

                    <div className="flex items-start space-x-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${activityTypeColors[activity.activityType]}`}>
                        <ActivityIcon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-base font-bold text-gray-900 capitalize">{activity.activityType.replace('_', ' ')}</h4>
                              <span className={`text-xs font-semibold px-2 py-1 rounded ${activityTypeColors[activity.activityType]}`}>
                                {activity.outcome}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {activity.date} at {activity.time} • by {activity.performedBy}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Contact: <span className="font-medium">{activity.contactPerson}</span>
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-2">{activity.notes}</p>

                        {activity.promiseAmount && (
                          <div className="bg-orange-50 border border-orange-200 rounded p-2 mb-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-orange-900">Promise to Pay:</span>
                              <span className="text-sm font-bold text-orange-900">{formatCurrency(activity.promiseAmount)}</span>
                            </div>
                            <p className="text-xs text-orange-700 mt-1">Expected Date: {activity.promiseDate}</p>
                          </div>
                        )}

                        {activity.nextFollowUp && (
                          <div className="flex items-center space-x-2 text-sm text-blue-600">
                            <Clock className="h-4 w-4" />
                            <span>Next Follow-up: {activity.nextFollowUp}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}
