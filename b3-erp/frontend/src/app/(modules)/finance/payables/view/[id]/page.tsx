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
  Package,
  User,
  XCircle,
  History,
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

interface BillLineItem {
  id: string;
  productService: string;
  description: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  amount: number;
}

interface Bill {
  id: string;
  billNumber: string;
  billDate: string;
  dueDate: string;
  poReference: string;
  amount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'outstanding' | 'partially_paid' | 'overdue' | 'paid';
  agingDays: number;
}

interface PaymentScheduleItem {
  id: string;
  dueDate: string;
  amount: number;
  status: 'upcoming' | 'due_today' | 'overdue' | 'paid';
  billReference: string;
}

interface PaymentHistory {
  id: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  notes: string;
}

interface VendorContact {
  name: string;
  designation: string;
  email: string;
  phone: string;
  department: string;
}

interface Payable {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorCode: string;
  gstNumber: string;
  panNumber: string;
  vendorCategory: 'raw_material' | 'packaging' | 'services' | 'utilities' | 'contractor';

  // Financial Summary
  totalOutstanding: number;
  overdueAmount: number;
  dueThisWeek: number;
  dueThisMonth: number;
  lastPaymentAmount: number;
  lastPaymentDate: string;

  // Credit Terms
  creditPeriod: number; // days
  creditLimit: number;
  paymentTerms: string;

  // Aging Analysis
  agingBuckets: AgingBucket[];

  // Bills
  bills: Bill[];

  // Payment Schedule
  paymentSchedule: PaymentScheduleItem[];

  // Payment History
  paymentHistory: PaymentHistory[];

  // Vendor Details
  vendorContact: VendorContact;
  address: string;
  city: string;
  state: string;
  pincode: string;

  // Status
  accountStatus: 'active' | 'on_hold' | 'blocked';
  riskRating: 'low' | 'medium' | 'high';

  // Dates
  vendorSince: string;
  lastPurchaseDate: string;
}

// Empty payable shell; hydrated from the backend on mount. Enum fields use
// valid defaults so config lookups never crash before data loads.
const emptyPayable: Payable = {
  id: '',
  vendorId: '',
  vendorName: '',
  vendorCode: '',
  gstNumber: '',
  panNumber: '',
  vendorCategory: 'raw_material',

  totalOutstanding: 0,
  overdueAmount: 0,
  dueThisWeek: 0,
  dueThisMonth: 0,
  lastPaymentAmount: 0,
  lastPaymentDate: '',

  creditPeriod: 0,
  creditLimit: 0,
  paymentTerms: '',

  agingBuckets: [],

  bills: [],

  paymentSchedule: [],

  paymentHistory: [],

  vendorContact: {
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

  accountStatus: 'active',
  riskRating: 'low',

  vendorSince: '',
  lastPurchaseDate: '',
};

const statusColors = {
  active: 'bg-green-100 text-green-700 border-green-200',
  on_hold: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  blocked: 'bg-red-100 text-red-700 border-red-200',
};

const billStatusColors = {
  outstanding: 'bg-blue-100 text-blue-700',
  partially_paid: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
};

const paymentStatusColors = {
  upcoming: 'bg-blue-100 text-blue-700',
  due_today: 'bg-orange-100 text-orange-700',
  overdue: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
};

export default function ViewPayablePage() {
  const router = useRouter();
  const params = useParams();
  const payableId = params.id as string;
  const [payable, setPayable] = useState<Payable>(emptyPayable);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!payableId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    setNotFound(false);
    (async () => {
      try {
        const raw = await FinanceService.getPayable(payableId);
        if (cancelled) return;
        if (!raw || (raw.id == null && raw.vendorName == null)) {
          setNotFound(true);
          return;
        }
        const m: any = raw || {};
        setPayable((prev) => ({
          ...prev,
          ...(m.id != null ? { id: String(m.id) } : {}),
          ...(m.vendorId != null ? { vendorId: String(m.vendorId) } : {}),
          ...(m.vendorName != null ? { vendorName: String(m.vendorName) } : {}),
          ...(m.vendorCode != null ? { vendorCode: String(m.vendorCode) } : {}),
          ...(m.totalOutstanding != null ? { totalOutstanding: Number(m.totalOutstanding) } : {}),
          ...(m.overdueAmount != null ? { overdueAmount: Number(m.overdueAmount) } : {}),
          ...(m.creditLimit != null ? { creditLimit: Number(m.creditLimit) } : {}),
          ...(m.paymentTerms != null ? { paymentTerms: String(m.paymentTerms) } : {}),
          ...(m.lastPaymentDate != null ? { lastPaymentDate: String(m.lastPaymentDate) } : {}),
          ...(Array.isArray(m.bills) ? { bills: m.bills } : {}),
        }));
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message || 'Failed to load payable');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [payableId, reloadKey]);

  const [activeTab, setActiveTab] = useState<'overview' | 'bills' | 'payment_schedule'>('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Building2 },
    { id: 'bills', name: 'Bills & Invoices', icon: Receipt },
    { id: 'payment_schedule', name: 'Payment Schedule', icon: Calendar },
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
          Payable not found.
        </div>
      )}
      {!isLoading && !notFound && (
      <>
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.push('/finance/payables')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Payables</span>
        </button>

        {/* Payable Header Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-4">
              <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{payable.vendorName}</h1>
                  <span className="px-3 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-600">
                    {payable.vendorCode}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <span>GST: {payable.gstNumber}</span>
                  <span>•</span>
                  <span>PAN: {payable.panNumber}</span>
                </div>
                <div className="flex items-center space-x-3 mt-2 flex-wrap gap-2">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${statusColors[payable.accountStatus]}`}>
                    {payable.accountStatus.replace('_', ' ').charAt(0).toUpperCase() + payable.accountStatus.replace('_', ' ').slice(1)}
                  </span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${payable.riskRating === 'low' ? 'bg-green-100 text-green-700' :
                      payable.riskRating === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                    {payable.riskRating.charAt(0).toUpperCase() + payable.riskRating.slice(1)} Risk
                  </span>
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-700 capitalize">
                    {payable.vendorCategory.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push(`/finance/payables/edit/${payableId}`)}
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
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Generate Report</span>
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
              <p className="text-2xl font-bold text-red-900">{formatLakhsCrores(payable.totalOutstanding)}</p>
              <p className="text-xs text-red-600 mt-1">{formatCurrency(payable.totalOutstanding)}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center space-x-2 mb-2">
                <XCircle className="h-5 w-5 text-orange-600" />
                <p className="text-xs font-medium text-orange-600 uppercase">Overdue Amount</p>
              </div>
              <p className="text-2xl font-bold text-orange-900">{formatLakhsCrores(payable.overdueAmount)}</p>
              <p className="text-xs text-orange-600 mt-1">{payable.totalOutstanding ? ((payable.overdueAmount / payable.totalOutstanding) * 100).toFixed(1) : '0.0'}% of total</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <p className="text-xs font-medium text-yellow-600 uppercase">Due This Week</p>
              </div>
              <p className="text-2xl font-bold text-yellow-900">{formatLakhsCrores(payable.dueThisWeek)}</p>
              <p className="text-xs text-yellow-600 mt-1">Requires attention</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-xs font-medium text-green-600 uppercase">Last Payment</p>
              </div>
              <p className="text-2xl font-bold text-green-900">{formatLakhsCrores(payable.lastPaymentAmount)}</p>
              <p className="text-xs text-green-600 mt-1">{payable.lastPaymentDate}</p>
            </div>
          </div>

          {/* Aging Progress Tracker */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Aging Analysis</h3>
            <div className="space-y-3">
              {/* Progress Bar */}
              <div className="flex h-8 rounded-lg overflow-hidden border-2 border-gray-300">
                {payable.agingBuckets.map((bucket, index) => (
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
                {payable.agingBuckets.map((bucket, index) => (
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
                      ? 'border-orange-600 text-orange-600'
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
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Vendor Overview</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Vendor Details */}
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-orange-600" />
                  Vendor Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Vendor Name</p>
                    <p className="text-sm font-semibold text-gray-900">{payable.vendorName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Vendor Code</p>
                    <p className="text-sm text-gray-900">{payable.vendorCode}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Vendor Category</p>
                    <p className="text-sm text-gray-900 capitalize">{payable.vendorCategory.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">GST Number</p>
                    <p className="text-sm text-gray-900">{payable.gstNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">PAN Number</p>
                    <p className="text-sm text-gray-900">{payable.panNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Vendor Since</p>
                    <p className="text-sm text-gray-900">{payable.vendorSince}</p>
                  </div>
                </div>
              </div>

              {/* Credit Terms */}
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-orange-600" />
                  Credit Terms
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Credit Period</p>
                    <p className="text-sm font-semibold text-gray-900">{payable.creditPeriod} Days</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Credit Limit</p>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(payable.creditLimit)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Payment Terms</p>
                    <p className="text-sm text-gray-900">{payable.paymentTerms}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Credit Utilization</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Outstanding:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(payable.totalOutstanding)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Credit Limit:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(payable.creditLimit)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(payable.creditLimit - payable.totalOutstanding)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${payable.creditLimit && (payable.totalOutstanding / payable.creditLimit) * 100 > 80
                              ? 'bg-red-600'
                              : payable.creditLimit && (payable.totalOutstanding / payable.creditLimit) * 100 > 60
                                ? 'bg-yellow-600'
                                : 'bg-green-600'
                            }`}
                          style={{ width: `${payable.creditLimit ? (payable.totalOutstanding / payable.creditLimit) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 text-right">
                        {payable.creditLimit ? ((payable.totalOutstanding / payable.creditLimit) * 100).toFixed(1) : '0.0'}% utilized
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <User className="h-5 w-5 mr-2 text-orange-600" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Contact Person</p>
                    <p className="text-sm font-semibold text-gray-900">{payable.vendorContact.name}</p>
                    <p className="text-xs text-gray-600">{payable.vendorContact.designation}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Department</p>
                    <p className="text-sm text-gray-900">{payable.vendorContact.department}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a href={`mailto:${payable.vendorContact.email}`} className="text-sm text-blue-600 hover:underline">
                      {payable.vendorContact.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a href={`tel:${payable.vendorContact.phone}`} className="text-sm text-blue-600 hover:underline">
                      {payable.vendorContact.phone}
                    </a>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Address</p>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-900">{payable.address}</p>
                        <p className="text-sm text-gray-900">{payable.city}, {payable.state} - {payable.pincode}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment History Summary */}
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <History className="h-5 w-5 mr-2 text-orange-600" />
                  Recent Payment History
                </h3>
                <div className="space-y-3">
                  {payable.paymentHistory.slice(0, 4).map((payment) => (
                    <div key={payment.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</span>
                        <span className="text-xs text-gray-600">{payment.paymentDate}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{payment.paymentMethod}</span>
                        <span className="font-mono">{payment.referenceNumber}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{payment.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bills & Invoices Tab */}
        {activeTab === 'bills' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">Bills & Invoices</h3>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">{payable.bills.length} bills</span>
                <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                  <Receipt className="h-4 w-4" />
                  <span>Add Bill</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill Number</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aging</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payable.bills.map((bill, index) => {
                    const agingStatus = getAgingStatus(bill.agingDays);
                    return (
                      <tr key={bill.id} className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-4 py-4 text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                          {bill.billNumber}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">{bill.billDate}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{bill.dueDate}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{bill.poReference}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-gray-900">{formatCurrency(bill.amount)}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{formatCurrency(bill.paidAmount)}</td>
                        <td className="px-4 py-4 text-sm font-bold text-gray-900">{formatCurrency(bill.balanceAmount)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${agingStatus.bgColor} ${agingStatus.color}`}>
                            {bill.agingDays} days
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${billStatusColors[bill.status]}`}>
                            {bill.status === 'paid' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {bill.status === 'overdue' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {bill.status.replace('_', ' ').charAt(0).toUpperCase() + bill.status.replace('_', ' ').slice(1)}
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

        {/* Payment Schedule Tab */}
        {activeTab === 'payment_schedule' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">Payment Schedule</h3>
              <span className="text-sm text-gray-600">{payable.paymentSchedule.length} upcoming payments</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {payable.paymentSchedule.map((payment) => (
                <div key={payment.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-gray-600">Due: {payment.dueDate}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${paymentStatusColors[payment.status]}`}>
                      {payment.status.replace('_', ' ').charAt(0).toUpperCase() + payment.status.replace('_', ' ').slice(1)}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Bill Reference</p>
                    <p className="text-sm text-gray-900">{payment.billReference}</p>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                      Record Payment
                    </button>
                    <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium">
                      View Bill
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}
