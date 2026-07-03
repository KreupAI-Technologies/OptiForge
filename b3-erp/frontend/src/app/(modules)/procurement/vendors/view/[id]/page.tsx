'use client';

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { vendorService } from '@/services/VendorService';
import {
  ArrowLeft,
  Building2,
  Star,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  Download,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Award,
  CreditCard,
  User,
  Briefcase,
  Flag,
  Calendar,
  FileCheck,
  BarChart3,
  Activity,
  Shield,
  Send,
  FileSpreadsheet,
  ExternalLink,
  PauseCircle,
  RefreshCw,
  IndianRupee,
  Building,
  Landmark,
  BadgeCheck,
  Factory,
  Truck,
  Target,
  Timer,
  ThumbsUp,
  ThumbsDown,
  CircleDollarSign,
  Percent,
  Users,
  Hash,
  Eye,
} from 'lucide-react';

interface ContactPerson {
  id: string;
  name: string;
  designation: string;
  mobile: string;
  email: string;
  department: string;
  isPrimary: boolean;
}

interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  accountType: string;
}

interface Address {
  type: 'registered' | 'factory' | 'warehouse' | 'office';
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  url: string;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  date: string;
  amount: number;
  status: 'draft' | 'sent' | 'acknowledged' | 'in_progress' | 'delivered' | 'completed' | 'cancelled';
  items: number;
  deliveryDate: string;
}

interface Payment {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  status: 'pending' | 'processing' | 'paid' | 'overdue';
  dueDate: string;
  paidDate?: string;
}

interface QualityIssue {
  id: string;
  date: string;
  poNumber: string;
  issueType: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  rejectedQty: number;
  rejectedValue: number;
}

interface PerformanceMetrics {
  onTimeDelivery: {
    current: number;
    trend: 'up' | 'down' | 'stable';
    monthlyData: { month: string; percentage: number }[];
  };
  qualityAcceptance: {
    accepted: number;
    rejected: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  averageDelay: {
    days: number;
    trend: 'up' | 'down' | 'stable';
  };
  priceCompetitiveness: {
    score: number;
    rank: string;
  };
  responsiveness: {
    rating: number;
    avgResponseTime: string;
  };
  overallGrade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D';
  vendorScore: number;
  rejectionAnalysis: {
    reason: string;
    count: number;
    percentage: number;
  }[];
}

interface Vendor {
  id: string;
  vendorCode: string;
  legalName: string;
  tradeName: string;
  gstNumber: string;
  panNumber: string;
  cinNumber: string;
  msmeRegistration: string;
  rating: number;
  status: 'active' | 'inactive' | 'blacklisted' | 'on_hold';
  contactPersons: ContactPerson[];
  addresses: Address[];
  bankDetails: BankDetails;
  paymentTerms: {
    netDays: number;
    discountTerms: string;
    paymentMethod: string;
  };
  categories: string[];
  specificMaterials: string[];
  certifications: {
    iso9001: boolean;
    iso14001: boolean;
    ohsas18001: boolean;
    other: string[];
  };
  documents: Document[];
  totalPOs: number;
  totalSpendYTD: number;
  registeredDate: string;
  lastOrderDate: string;
  notes: string;
  performanceMetrics: PerformanceMetrics;
  purchaseOrders: PurchaseOrder[];
  payments: Payment[];
  qualityIssues: QualityIssue[];
  riskIndicators: {
    paymentDisputes: number;
    qualityIssues: number;
    deliveryDelays: number;
  };
}

// Mock vendor data
const mockVendor: Vendor = {
  id: 'V-001',
  vendorCode: 'VEN-2025-0123',
  legalName: 'JSW Steel Limited',
  tradeName: 'JSW Steel',
  gstNumber: '27AAACJ0308G1Z4',
  panNumber: 'AAACJ0308G',
  cinNumber: 'L27101MH1994PLC152925',
  msmeRegistration: 'MSME-2024-12345',
  rating: 4.8,
  status: 'active',
  contactPersons: [
    {
      id: '1',
      name: 'Rajesh Kumar',
      designation: 'Sales Manager',
      mobile: '+91 98765 43210',
      email: 'rajesh.kumar@jswsteel.in',
      department: 'Sales',
      isPrimary: true,
    },
    {
      id: '2',
      name: 'Priya Sharma',
      designation: 'Account Manager',
      mobile: '+91 98765 43211',
      email: 'priya.sharma@jswsteel.in',
      department: 'Accounts',
      isPrimary: false,
    },
    {
      id: '3',
      name: 'Amit Patel',
      designation: 'Technical Support',
      mobile: '+91 98765 43212',
      email: 'amit.patel@jswsteel.in',
      department: 'Technical',
      isPrimary: false,
    },
  ],
  addresses: [
    {
      type: 'registered',
      addressLine1: 'JSW Centre, Bandra Kurla Complex',
      addressLine2: 'Bandra East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400051',
      country: 'India',
    },
    {
      type: 'factory',
      addressLine1: 'JSW Steel Plant, Toranagallu',
      addressLine2: 'Vidyanagar',
      city: 'Ballari',
      state: 'Karnataka',
      pinCode: '583123',
      country: 'India',
    },
    {
      type: 'warehouse',
      addressLine1: 'Plot No. 45, MIDC Industrial Area',
      addressLine2: 'Phase II',
      city: 'Pune',
      state: 'Maharashtra',
      pinCode: '411019',
      country: 'India',
    },
  ],
  bankDetails: {
    bankName: 'HDFC Bank',
    accountNumber: '50200012345678',
    ifscCode: 'HDFC0001234',
    branch: 'Bandra Kurla Complex, Mumbai',
    accountType: 'Current Account',
  },
  paymentTerms: {
    netDays: 45,
    discountTerms: '2/10 Net 45',
    paymentMethod: 'NEFT/RTGS',
  },
  categories: ['Raw Materials', 'Steel Products', 'Metal Components'],
  specificMaterials: ['HR Coils', 'CR Coils', 'TMT Bars', 'Structural Steel', 'Galvanized Sheets', 'Steel Plates'],
  certifications: {
    iso9001: true,
    iso14001: true,
    ohsas18001: true,
    other: ['BIS Certification', 'CRS Certification', 'NABL Accredited Labs'],
  },
  documents: [
    {
      id: '1',
      name: 'GST Certificate',
      type: 'GST',
      uploadDate: '2024-01-15',
      size: '245 KB',
      url: '#',
    },
    {
      id: '2',
      name: 'PAN Card',
      type: 'PAN',
      uploadDate: '2024-01-15',
      size: '128 KB',
      url: '#',
    },
    {
      id: '3',
      name: 'Cancelled Cheque',
      type: 'Bank',
      uploadDate: '2024-01-15',
      size: '156 KB',
      url: '#',
    },
    {
      id: '4',
      name: 'MSME Certificate',
      type: 'MSME',
      uploadDate: '2024-01-15',
      size: '189 KB',
      url: '#',
    },
    {
      id: '5',
      name: 'ISO 9001 Certificate',
      type: 'Certification',
      uploadDate: '2024-02-10',
      size: '312 KB',
      url: '#',
    },
    {
      id: '6',
      name: 'ISO 14001 Certificate',
      type: 'Certification',
      uploadDate: '2024-02-10',
      size: '298 KB',
      url: '#',
    },
  ],
  totalPOs: 248,
  totalSpendYTD: 185600000,
  registeredDate: '2023-03-15',
  lastOrderDate: '2025-10-10',
  notes: 'Premium vendor with excellent track record. Preferred supplier for all steel requirements.',
  performanceMetrics: {
    onTimeDelivery: {
      current: 96.5,
      trend: 'up',
      monthlyData: [
        { month: 'Apr', percentage: 92 },
        { month: 'May', percentage: 94 },
        { month: 'Jun', percentage: 93 },
        { month: 'Jul', percentage: 95 },
        { month: 'Aug', percentage: 96 },
        { month: 'Sep', percentage: 97 },
        { month: 'Oct', percentage: 96.5 },
      ],
    },
    qualityAcceptance: {
      accepted: 9845,
      rejected: 155,
      percentage: 98.45,
      trend: 'stable',
    },
    averageDelay: {
      days: 1.2,
      trend: 'down',
    },
    priceCompetitiveness: {
      score: 8.7,
      rank: 'Excellent',
    },
    responsiveness: {
      rating: 4.9,
      avgResponseTime: '2.3 hours',
    },
    overallGrade: 'A+',
    vendorScore: 94.5,
    rejectionAnalysis: [
      { reason: 'Dimensional Defects', count: 68, percentage: 43.9 },
      { reason: 'Surface Defects', count: 45, percentage: 29.0 },
      { reason: 'Material Grade Mismatch', count: 25, percentage: 16.1 },
      { reason: 'Packaging Issues', count: 17, percentage: 11.0 },
    ],
  },
  purchaseOrders: [
    {
      id: '1',
      poNumber: 'PO-2025-10-0123',
      date: '2025-10-10',
      amount: 4580000,
      status: 'in_progress',
      items: 12,
      deliveryDate: '2025-10-25',
    },
    {
      id: '2',
      poNumber: 'PO-2025-09-0456',
      date: '2025-09-28',
      amount: 6750000,
      status: 'completed',
      items: 18,
      deliveryDate: '2025-10-12',
    },
    {
      id: '3',
      poNumber: 'PO-2025-09-0234',
      date: '2025-09-15',
      amount: 3200000,
      status: 'completed',
      items: 8,
      deliveryDate: '2025-09-30',
    },
    {
      id: '4',
      poNumber: 'PO-2025-08-0789',
      date: '2025-08-22',
      amount: 5890000,
      status: 'completed',
      items: 15,
      deliveryDate: '2025-09-05',
    },
    {
      id: '5',
      poNumber: 'PO-2025-08-0567',
      date: '2025-08-10',
      amount: 4120000,
      status: 'completed',
      items: 10,
      deliveryDate: '2025-08-25',
    },
  ],
  payments: [
    {
      id: '1',
      invoiceNumber: 'INV-2025-0234',
      date: '2025-10-05',
      amount: 6750000,
      status: 'processing',
      dueDate: '2025-11-19',
    },
    {
      id: '2',
      invoiceNumber: 'INV-2025-0198',
      date: '2025-09-20',
      amount: 3200000,
      status: 'paid',
      dueDate: '2025-11-04',
      paidDate: '2025-10-15',
    },
    {
      id: '3',
      invoiceNumber: 'INV-2025-0156',
      date: '2025-09-01',
      amount: 5890000,
      status: 'paid',
      dueDate: '2025-10-16',
      paidDate: '2025-10-10',
    },
    {
      id: '4',
      invoiceNumber: 'INV-2025-0123',
      date: '2025-08-15',
      amount: 4120000,
      status: 'paid',
      dueDate: '2025-09-29',
      paidDate: '2025-09-25',
    },
  ],
  qualityIssues: [
    {
      id: '1',
      date: '2025-09-18',
      poNumber: 'PO-2025-09-0234',
      issueType: 'Dimensional Defects',
      description: 'HR Coil thickness variation beyond tolerance (±0.15mm found, ±0.05mm required)',
      severity: 'medium',
      status: 'resolved',
      rejectedQty: 2500,
      rejectedValue: 125000,
    },
    {
      id: '2',
      date: '2025-08-25',
      poNumber: 'PO-2025-08-0456',
      issueType: 'Surface Defects',
      description: 'Surface rust spots found on galvanized sheets',
      severity: 'low',
      status: 'closed',
      rejectedQty: 850,
      rejectedValue: 68000,
    },
    {
      id: '3',
      date: '2025-07-12',
      poNumber: 'PO-2025-07-0189',
      issueType: 'Material Grade Mismatch',
      description: 'Material certified as Grade 250 but tested as Grade 240',
      severity: 'high',
      status: 'closed',
      rejectedQty: 5000,
      rejectedValue: 450000,
    },
  ],
  riskIndicators: {
    paymentDisputes: 0,
    qualityIssues: 3,
    deliveryDelays: 5,
  },
};

export default function VendorViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'transactions'>('overview');
  const [vendor, setVendor] = useState<Vendor>(mockVendor);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await vendorService.getVendorById(id)) as any;
        if (!cancelled && raw) {
          setVendor((prev) => ({
            ...prev,
            id: raw.id ?? prev.id,
            vendorCode: raw.vendorCode ?? prev.vendorCode,
            legalName: raw.legalName ?? prev.legalName,
            tradeName: raw.tradeName ?? prev.tradeName,
            gstNumber: raw.gstNumber ?? prev.gstNumber,
            panNumber: raw.panNumber ?? prev.panNumber,
            cinNumber: raw.cinNumber ?? prev.cinNumber,
            msmeRegistration: raw.msmeRegistration ?? prev.msmeRegistration,
            rating: raw.rating != null ? Number(raw.rating) : prev.rating,
            status: (raw.status as Vendor['status']) ?? prev.status,
            contactPersons: raw.contactPersons ?? prev.contactPersons,
            addresses: raw.addresses ?? prev.addresses,
            bankDetails: raw.bankDetails ?? prev.bankDetails,
            paymentTerms: raw.paymentTerms ?? prev.paymentTerms,
            categories: raw.categories ?? prev.categories,
            specificMaterials: raw.specificMaterials ?? prev.specificMaterials,
            certifications: raw.certifications ?? prev.certifications,
            documents: raw.documents ?? prev.documents,
            totalPOs: raw.totalPOs != null ? Number(raw.totalPOs) : prev.totalPOs,
            totalSpendYTD: raw.totalSpendYTD != null ? Number(raw.totalSpendYTD) : prev.totalSpendYTD,
            registeredDate: raw.registeredDate ? String(raw.registeredDate).slice(0, 10) : prev.registeredDate,
            lastOrderDate: raw.lastOrderDate ? String(raw.lastOrderDate).slice(0, 10) : prev.lastOrderDate,
            notes: raw.notes ?? prev.notes,
          }));
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load vendor');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  const statusColors = {
    active: 'bg-green-100 text-green-700 border-green-200',
    inactive: 'bg-gray-100 text-gray-700 border-gray-200',
    blacklisted: 'bg-red-100 text-red-700 border-red-200',
    on_hold: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  const statusIcons = {
    active: CheckCircle,
    inactive: XCircle,
    blacklisted: Ban,
    on_hold: PauseCircle,
  };

  const poStatusColors = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    acknowledged: 'bg-cyan-100 text-cyan-700',
    in_progress: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const paymentStatusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
  };

  const severityColors = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  };

  const issueStatusColors = {
    open: 'bg-red-100 text-red-700',
    investigating: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700',
  };

  const gradeColors = {
    'A+': 'bg-green-600',
    A: 'bg-green-500',
    'B+': 'bg-blue-600',
    B: 'bg-blue-500',
    'C+': 'bg-yellow-600',
    C: 'bg-yellow-500',
    D: 'bg-red-500',
  };

  const StatusIcon = statusIcons[vendor.status];

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const primaryContact = vendor.contactPersons.find((c) => c.isPrimary) || vendor.contactPersons[0];
  const registeredAddress = vendor.addresses.find((a) => a.type === 'registered') || vendor.addresses[0];

  return (
    <div className="w-full h-full px-3 py-2 overflow-auto">
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.push('/procurement/vendors')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Vendors</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{vendor.tradeName}</h1>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full border flex items-center space-x-1 ${statusColors[vendor.status]}`}
                >
                  <StatusIcon className="h-4 w-4" />
                  <span className="capitalize">{vendor.status.replace('_', ' ')}</span>
                </span>
              </div>
              <p className="text-gray-600 mb-2">{vendor.legalName}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <Hash className="h-4 w-4" />
                  <span>{vendor.vendorCode}</span>
                </span>
                <span>|</span>
                <div className="flex items-center space-x-2">
                  {renderStars(vendor.rating)}
                  <span className="font-semibold text-gray-900">{vendor.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push(`/procurement/vendors/edit/${id}`)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Send className="h-4 w-4" />
              <span>Send Email</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Package className="h-4 w-4" />
              <span>Create PO</span>
            </button>
            {vendor.status === 'active' ? (
              <button className="flex items-center space-x-2 px-4 py-2 border border-yellow-300 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100">
                <PauseCircle className="h-4 w-4" />
                <span>Put On Hold</span>
              </button>
            ) : (
              <button className="flex items-center space-x-2 px-4 py-2 border border-green-300 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                <CheckCircle className="h-4 w-4" />
                <span>Activate</span>
              </button>
            )}
            <button className="flex items-center space-x-2 px-4 py-2 border border-red-300 bg-red-50 text-red-700 rounded-lg hover:bg-red-100">
              <Ban className="h-4 w-4" />
              <span>Blacklist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-600">Total POs</span>
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">{vendor.totalPOs}</p>
          <p className="text-xs text-blue-600 mt-1">Last: {vendor.lastOrderDate}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-600">Total Spend (YTD)</span>
            <IndianRupee className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(vendor.totalSpendYTD)}</p>
          <p className="text-xs text-green-600 mt-1">Financial Year 2025-26</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-600">On-Time Delivery</span>
            <Truck className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-purple-900">
              {vendor.performanceMetrics.onTimeDelivery.current}%
            </p>
            {getTrendIcon(vendor.performanceMetrics.onTimeDelivery.trend)}
          </div>
          <p className="text-xs text-purple-600 mt-1">Last 6 months average</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-600">Quality Rating</span>
            <Award className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-orange-900">
              {vendor.performanceMetrics.qualityAcceptance.percentage}%
            </p>
            {getTrendIcon(vendor.performanceMetrics.qualityAcceptance.trend)}
          </div>
          <p className="text-xs text-orange-600 mt-1">Acceptance rate</p>
        </div>
      </div>

      {/* Risk Indicators */}
      {(vendor.riskIndicators.paymentDisputes > 0 ||
        vendor.riskIndicators.qualityIssues > 3 ||
        vendor.riskIndicators.deliveryDelays > 5) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">Risk Indicators</h3>
              <div className="grid grid-cols-3 gap-2 text-sm">
                {vendor.riskIndicators.paymentDisputes > 0 && (
                  <div className="flex items-center space-x-2">
                    <CircleDollarSign className="h-4 w-4 text-red-600" />
                    <span className="text-red-700">
                      {vendor.riskIndicators.paymentDisputes} Payment Disputes
                    </span>
                  </div>
                )}
                {vendor.riskIndicators.qualityIssues > 0 && (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-red-600" />
                    <span className="text-red-700">{vendor.riskIndicators.qualityIssues} Quality Issues</span>
                  </div>
                )}
                {vendor.riskIndicators.deliveryDelays > 0 && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-red-600" />
                    <span className="text-red-700">{vendor.riskIndicators.deliveryDelays} Delivery Delays</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-3">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'performance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Performance Metrics
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'transactions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Transaction History
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* Company Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span>Company Details</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">Legal Name</p>
                <p className="font-medium text-gray-900">{vendor.legalName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Trade Name</p>
                <p className="font-medium text-gray-900">{vendor.tradeName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Vendor Code</p>
                <p className="font-medium text-gray-900">{vendor.vendorCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">GST Number</p>
                <p className="font-medium text-gray-900 font-mono">{vendor.gstNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">PAN Number</p>
                <p className="font-medium text-gray-900 font-mono">{vendor.panNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">CIN Number</p>
                <p className="font-medium text-gray-900 font-mono">{vendor.cinNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">MSME Registration</p>
                <p className="font-medium text-gray-900 font-mono">{vendor.msmeRegistration}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Registered Date</p>
                <p className="font-medium text-gray-900">{vendor.registeredDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[vendor.status]}`}
                >
                  {vendor.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span>Contact Information</span>
            </h3>
            <div className="space-y-2">
              {vendor.addresses.map((address, index) => (
                <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center space-x-2 mb-2">
                    {address.type === 'registered' && <Building className="h-4 w-4 text-blue-600" />}
                    {address.type === 'factory' && <Factory className="h-4 w-4 text-purple-600" />}
                    {address.type === 'warehouse' && <Package className="h-4 w-4 text-green-600" />}
                    {address.type === 'office' && <Building2 className="h-4 w-4 text-orange-600" />}
                    <span className="font-semibold text-gray-900 capitalize">{address.type} Address</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="col-span-2">
                      <p className="text-gray-500 text-xs mb-0.5">Address</p>
                      <p className="text-gray-900">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">City</p>
                      <p className="text-gray-900">{address.city}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">State</p>
                      <p className="text-gray-900">{address.state}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">PIN Code</p>
                      <p className="text-gray-900 font-mono">{address.pinCode}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">Country</p>
                      <p className="text-gray-900">{address.country}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Contact Person */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Contact Persons</span>
            </h3>
            <div className="space-y-3">
              {vendor.contactPersons.map((contact) => (
                <div
                  key={contact.id}
                  className={`p-4 rounded-lg border ${
                    contact.isPrimary
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-900">{contact.name}</p>
                          {contact.isPrimary && (
                            <span className="px-2 py-0.5 text-xs font-semibold bg-blue-600 text-white rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{contact.designation}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{contact.mobile}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{contact.email}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Briefcase className="h-3.5 w-3.5" />
                            <span>{contact.department}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Banking Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <Landmark className="h-5 w-5 text-blue-600" />
              <span>Banking Details</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">Bank Name</p>
                <p className="font-medium text-gray-900">{vendor.bankDetails.bankName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Account Number</p>
                <p className="font-medium text-gray-900 font-mono">{vendor.bankDetails.accountNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">IFSC Code</p>
                <p className="font-medium text-gray-900 font-mono">{vendor.bankDetails.ifscCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Branch</p>
                <p className="font-medium text-gray-900">{vendor.bankDetails.branch}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Account Type</p>
                <p className="font-medium text-gray-900">{vendor.bankDetails.accountType}</p>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span>Payment Terms</span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">Credit Period</p>
                <p className="font-medium text-gray-900">{vendor.paymentTerms.netDays} Days (Net {vendor.paymentTerms.netDays})</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Discount Terms</p>
                <p className="font-medium text-gray-900">{vendor.paymentTerms.discountTerms}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                <p className="font-medium text-gray-900">{vendor.paymentTerms.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Categories & Materials */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span>Categories & Materials Supplied</span>
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {vendor.categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Specific Materials</p>
                <div className="flex flex-wrap gap-2">
                  {vendor.specificMaterials.map((material, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <BadgeCheck className="h-5 w-5 text-blue-600" />
              <span>Certifications</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div
                className={`p-3 rounded-lg border ${
                  vendor.certifications.iso9001
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {vendor.certifications.iso9001 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                  <span className={vendor.certifications.iso9001 ? 'text-green-900 font-medium' : 'text-gray-500'}>
                    ISO 9001
                  </span>
                </div>
              </div>
              <div
                className={`p-3 rounded-lg border ${
                  vendor.certifications.iso14001
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {vendor.certifications.iso14001 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                  <span className={vendor.certifications.iso14001 ? 'text-green-900 font-medium' : 'text-gray-500'}>
                    ISO 14001
                  </span>
                </div>
              </div>
              <div
                className={`p-3 rounded-lg border ${
                  vendor.certifications.ohsas18001
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {vendor.certifications.ohsas18001 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                  <span className={vendor.certifications.ohsas18001 ? 'text-green-900 font-medium' : 'text-gray-500'}>
                    OHSAS 18001
                  </span>
                </div>
              </div>
              {vendor.certifications.other.map((cert, index) => (
                <div key={index} className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-900 font-medium">{cert}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Documents</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {vendor.documents.map((doc) => (
                <div key={doc.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FileCheck className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.type}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span>{doc.uploadDate}</span>
                    <span>{doc.size}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700">
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </button>
                    <button className="flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {vendor.notes && (
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Notes & Remarks</span>
              </h3>
              <p className="text-gray-700">{vendor.notes}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-3">
          {/* Overall Score Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Overall Vendor Score</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-5xl font-bold">{vendor.performanceMetrics.vendorScore}</div>
                  <div>
                    <div
                      className={`text-2xl font-bold px-4 py-2 rounded-lg ${
                        gradeColors[vendor.performanceMetrics.overallGrade]
                      }`}
                    >
                      {vendor.performanceMetrics.overallGrade}
                    </div>
                    <p className="text-sm text-blue-100 mt-1">Grade</p>
                  </div>
                </div>
              </div>
              <Award className="h-24 w-24 text-blue-300 opacity-50" />
            </div>
          </div>

          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {/* On-Time Delivery */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">On-Time Delivery</h4>
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-3xl font-bold text-gray-900">
                  {vendor.performanceMetrics.onTimeDelivery.current}%
                </p>
                {getTrendIcon(vendor.performanceMetrics.onTimeDelivery.trend)}
              </div>
              <div className="h-2 bg-gray-200 rounded-full mb-2">
                <div
                  className="h-2 bg-blue-600 rounded-full"
                  style={{ width: `${vendor.performanceMetrics.onTimeDelivery.current}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">Last 6 months average</p>
            </div>

            {/* Quality Acceptance */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Quality Acceptance</h4>
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-3xl font-bold text-gray-900">
                  {vendor.performanceMetrics.qualityAcceptance.percentage}%
                </p>
                {getTrendIcon(vendor.performanceMetrics.qualityAcceptance.trend)}
              </div>
              <div className="h-2 bg-gray-200 rounded-full mb-2">
                <div
                  className="h-2 bg-green-600 rounded-full"
                  style={{ width: `${vendor.performanceMetrics.qualityAcceptance.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                {vendor.performanceMetrics.qualityAcceptance.accepted} accepted /{' '}
                {vendor.performanceMetrics.qualityAcceptance.rejected} rejected
              </p>
            </div>

            {/* Average Delay */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Average Delivery Delay</h4>
                <Timer className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-3xl font-bold text-gray-900">
                  {vendor.performanceMetrics.averageDelay.days}
                </p>
                <span className="text-gray-600">days</span>
                {getTrendIcon(vendor.performanceMetrics.averageDelay.trend)}
              </div>
              <p className="text-xs text-gray-500">When delivery is delayed</p>
            </div>

            {/* Price Competitiveness */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Price Competitiveness</h4>
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-3xl font-bold text-gray-900">
                  {vendor.performanceMetrics.priceCompetitiveness.score}/10
                </p>
              </div>
              <div className="h-2 bg-gray-200 rounded-full mb-2">
                <div
                  className="h-2 bg-purple-600 rounded-full"
                  style={{ width: `${vendor.performanceMetrics.priceCompetitiveness.score * 10}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">{vendor.performanceMetrics.priceCompetitiveness.rank}</p>
            </div>

            {/* Responsiveness */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Responsiveness</h4>
                <Activity className="h-5 w-5 text-cyan-600" />
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-3xl font-bold text-gray-900">
                  {vendor.performanceMetrics.responsiveness.rating}/5
                </p>
                <div className="flex">{renderStars(vendor.performanceMetrics.responsiveness.rating)}</div>
              </div>
              <p className="text-xs text-gray-500">
                Avg response: {vendor.performanceMetrics.responsiveness.avgResponseTime}
              </p>
            </div>
          </div>

          {/* Monthly Performance Trend */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>On-Time Delivery Trend (Last 7 Months)</span>
            </h3>
            <div className="h-64">
              <div className="flex items-end justify-between h-full space-x-2">
                {vendor.performanceMetrics.onTimeDelivery.monthlyData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="flex-1 flex items-end w-full">
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg relative group"
                        style={{ height: `${data.percentage}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {data.percentage}%
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-600 mt-2">{data.month}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rejection Analysis */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <ThumbsDown className="h-5 w-5 text-red-600" />
              <span>Rejection Analysis by Reason</span>
            </h3>
            <div className="space-y-3">
              {vendor.performanceMetrics.rejectionAnalysis.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.reason}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{item.count} rejections</span>
                      <span className="text-sm font-semibold text-gray-900">{item.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-red-500 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-3">
          {/* Purchase Orders */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span>Purchase Orders</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vendor.purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{po.poNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{po.date}</td>
                      <td className="px-4 py-3 font-semibold text-green-700">{formatCurrency(po.amount)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{po.items} items</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{po.deliveryDate}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${poStatusColors[po.status]}`}>
                          {po.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span>Payment History</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Invoice Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vendor.payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{payment.invoiceNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{payment.date}</td>
                      <td className="px-4 py-3 font-semibold text-green-700">{formatCurrency(payment.amount)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{payment.dueDate}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {payment.paidDate || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            paymentStatusColors[payment.status]
                          }`}
                        >
                          {payment.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quality Issues/Returns */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Quality Issues & Returns</span>
            </h3>
            <div className="space-y-2">
              {vendor.qualityIssues.map((issue) => (
                <div key={issue.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${severityColors[issue.severity]}`}>
                          {issue.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${issueStatusColors[issue.status]}`}>
                          {issue.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{issue.issueType}</h4>
                      <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{issue.date}</span>
                        </span>
                        <span>PO: {issue.poNumber}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Rejected Qty</p>
                      <p className="font-semibold text-gray-900">{issue.rejectedQty.toLocaleString()} units</p>
                      <p className="text-sm font-semibold text-red-600 mt-1">{formatCurrency(issue.rejectedValue)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
