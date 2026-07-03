'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { exportToCsv } from '@/lib/export';
import { procurementVendorScorecardService } from '@/services/procurement-vendor-scorecard.service';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Star,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Package,
  FileText,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Filter,
  Download,
  Upload,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  RefreshCw,
  Target,
  Zap,
  Shield,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  TrendingDown as Down,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Timer,
  ShoppingCart,
  Truck,
  FileCheck,
  XOctagon,
  MinusCircle,
  CheckSquare
} from 'lucide-react';

// TypeScript Interfaces
interface VendorPerformance {
  vendor_id: string;
  vendor_code: string;
  vendor_name: string;
  category: string;
  total_pos: number;
  total_spend: number;
  ytd_spend: number;
  on_time_delivery_rate: number;
  quality_acceptance_rate: number;
  price_competitiveness: number;
  overall_rating: number;
  grade: 'A' | 'B' | 'C' | 'D';
  status: 'active' | 'inactive' | 'blacklisted' | 'under_review';
  last_po_date: string;
  pending_pos: number;
  avg_delivery_days: number;
  rejection_rate: number;
  risk_level: 'low' | 'medium' | 'high';
  contract_expiry?: string;
}

interface VendorActivity {
  id: string;
  vendor_name: string;
  activity_type: 'po_created' | 'grn_received' | 'payment_made' | 'performance_review' | 'contract_renewed' | 'issue_reported';
  description: string;
  date: string;
  time: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface VendorMetrics {
  total_vendors: number;
  active_vendors: number;
  new_this_month: number;
  average_rating: number;
  total_spend_ytd: number;
  total_pos_this_month: number;
  vendors_under_review: number;
  blacklisted_vendors: number;
}

interface RiskVendor {
  vendor_name: string;
  risk_level: 'high' | 'medium' | 'low';
  issues: string[];
  last_delivery_delay: number;
  rejection_rate: number;
  financial_risk: boolean;
}

interface PendingAction {
  id: string;
  action_type: 'approval' | 'review' | 'contract_renewal';
  vendor_name: string;
  description: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
}

const VendorManagementDashboard = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '1m' | '3m' | '6m' | '1y'>('6m');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<VendorMetrics>({
    total_vendors: 0,
    active_vendors: 0,
    new_this_month: 0,
    average_rating: 0,
    total_spend_ytd: 0,
    total_pos_this_month: 0,
    vendors_under_review: 0,
    blacklisted_vendors: 0
  });

  const [vendors, setVendors] = useState<VendorPerformance[]>([]);
  const [activities, setActivities] = useState<VendorActivity[]>([]);
  const [riskVendors, setRiskVendors] = useState<RiskVendor[]>([]);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Simulate API call
      setTimeout(async () => {
        // Mock Metrics
        setMetrics({
          total_vendors: 147,
          active_vendors: 132,
          new_this_month: 8,
          average_rating: 4.2,
          total_spend_ytd: 125750000,
          total_pos_this_month: 89,
          vendors_under_review: 5,
          blacklisted_vendors: 3
        });

        // Vendor Performance Data — real fetch from the vendor scorecards
        // service (NestJS domain backend). Backend returns raw ORM shape; map
        // it onto the page's VendorPerformance model by best-fit. Wrapped in its
        // own try/catch so the secondary mock widgets below still populate even
        // if this fetch fails or the table is unseeded (returns []).
        try {
          const raw = (await procurementVendorScorecardService.getScorecards()) as any[];
          const toGrade = (score: number): VendorPerformance['grade'] => {
            if (score >= 90) return 'A';
            if (score >= 80) return 'B';
            if (score >= 70) return 'C';
            return 'D';
          };
          const toStatus = (s: string): VendorPerformance['status'] => {
            switch (s) {
              case 'active':
              case 'inactive':
              case 'blacklisted':
              case 'under_review':
                return s;
              default:
                return 'active';
            }
          };
          const toRisk = (r: string): VendorPerformance['risk_level'] => {
            switch (r) {
              case 'low':
              case 'medium':
              case 'high':
                return r;
              default:
                return 'low';
            }
          };
          const mappedVendors: VendorPerformance[] = raw.map((v) => {
            const overall = Number(v.overallScore ?? 0);
            const spend = Number(v.totalSpend ?? 0);
            return {
              vendor_id: v.id,
              vendor_code: v.vendorCode ?? '',
              vendor_name: v.vendorName ?? '',
              category: v.category ?? '',
              total_pos: Number(v.totalOrders ?? 0),
              total_spend: spend,
              ytd_spend: spend,
              on_time_delivery_rate: Number(v.deliveryScore ?? 0),
              quality_acceptance_rate: Number(v.qualityScore ?? 0),
              price_competitiveness: Number(v.costScore ?? 0),
              overall_rating: overall,
              grade: toGrade(overall),
              status: toStatus(v.status),
              last_po_date: v.lastEvaluated ?? '',
              pending_pos: 0,
              avg_delivery_days: 0,
              rejection_rate: 0,
              risk_level: toRisk(v.riskLevel),
            };
          });
          setVendors(mappedVendors);
        } catch {
          setVendors([]);
        }

        // Mock Activities
        const mockActivities: VendorActivity[] = [
          {
            id: 'A001',
            vendor_name: 'Tata Steel Limited',
            activity_type: 'grn_received',
            description: 'GRN-2025-00123 received for PO-2025-00089',
            date: '2025-01-15',
            time: '10:30 AM',
            status: 'success'
          },
          {
            id: 'A002',
            vendor_name: 'Bosch India',
            activity_type: 'po_created',
            description: 'New PO created: PO-2025-00090 for INR 2.5L',
            date: '2025-01-14',
            time: '03:45 PM',
            status: 'info'
          },
          {
            id: 'A003',
            vendor_name: 'ABC Chemicals Ltd',
            activity_type: 'issue_reported',
            description: 'Quality issue reported - Rejection rate exceeds 10%',
            date: '2025-01-14',
            time: '11:20 AM',
            status: 'error'
          },
          {
            id: 'A004',
            vendor_name: 'JSW Steel',
            activity_type: 'payment_made',
            description: 'Payment of INR 5.2L processed for Invoice INV-2025-00345',
            date: '2025-01-13',
            time: '02:15 PM',
            status: 'success'
          },
          {
            id: 'A005',
            vendor_name: 'Essar Steel',
            activity_type: 'performance_review',
            description: 'Quarterly performance review completed - Rating: 3.8/5',
            date: '2025-01-12',
            time: '04:00 PM',
            status: 'warning'
          },
          {
            id: 'A006',
            vendor_name: 'SKF Bearings',
            activity_type: 'contract_renewed',
            description: 'Annual contract renewed for 1 year',
            date: '2025-01-10',
            time: '10:00 AM',
            status: 'success'
          }
        ];

        setActivities(mockActivities);

        // Mock Risk Vendors
        const mockRiskVendors: RiskVendor[] = [
          {
            vendor_name: 'ABC Chemicals Ltd',
            risk_level: 'high',
            issues: ['High rejection rate (11.5%)', 'Late deliveries', 'Contract expiring soon'],
            last_delivery_delay: 8,
            rejection_rate: 11.5,
            financial_risk: true
          },
          {
            vendor_name: 'XYZ Trading Co',
            risk_level: 'medium',
            issues: ['Moderate rejection rate (7.2%)', 'Inconsistent delivery times'],
            last_delivery_delay: 5,
            rejection_rate: 7.2,
            financial_risk: false
          },
          {
            vendor_name: 'Essar Steel',
            risk_level: 'medium',
            issues: ['Below average OTD (78.5%)', 'Contract expiring in 2 months'],
            last_delivery_delay: 6,
            rejection_rate: 8.8,
            financial_risk: false
          }
        ];

        setRiskVendors(mockRiskVendors);

        // Mock Pending Actions
        const mockPendingActions: PendingAction[] = [
          {
            id: 'PA001',
            action_type: 'approval',
            vendor_name: 'New Vendor: Tech Solutions India',
            description: 'Vendor registration pending approval',
            due_date: '2025-01-18',
            priority: 'high'
          },
          {
            id: 'PA002',
            action_type: 'review',
            vendor_name: 'ABC Chemicals Ltd',
            description: 'Performance review due - Multiple quality issues',
            due_date: '2025-01-20',
            priority: 'high'
          },
          {
            id: 'PA003',
            action_type: 'contract_renewal',
            vendor_name: 'Essar Steel',
            description: 'Contract expires on 31-Mar-2025',
            due_date: '2025-03-31',
            priority: 'medium'
          },
          {
            id: 'PA004',
            action_type: 'review',
            vendor_name: 'XYZ Trading Co',
            description: 'Quarterly performance review pending',
            due_date: '2025-01-25',
            priority: 'medium'
          },
          {
            id: 'PA005',
            action_type: 'approval',
            vendor_name: 'New Vendor: Global Imports Ltd',
            description: 'Vendor registration pending approval',
            due_date: '2025-01-22',
            priority: 'low'
          }
        ];

        setPendingActions(mockPendingActions);

        setLoading(false);
      }, 1200);
    };

    fetchData();
  }, [dateRange, categoryFilter, ratingFilter, statusFilter]);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-700 border-green-300';
      case 'B': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'C': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'D': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'blacklisted': return 'bg-red-100 text-red-700';
      case 'under_review': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'po_created': return <ShoppingCart className="w-4 h-4" />;
      case 'grn_received': return <Package className="w-4 h-4" />;
      case 'payment_made': return <DollarSign className="w-4 h-4" />;
      case 'performance_review': return <BarChart3 className="w-4 h-4" />;
      case 'contract_renewed': return <FileCheck className="w-4 h-4" />;
      case 'issue_reported': return <AlertCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.vendor_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || vendor.category === categoryFilter;
    const matchesRating = ratingFilter === 'all' || vendor.grade === ratingFilter;
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    return matchesSearch && matchesCategory && matchesRating && matchesStatus;
  });

  const topVendorsBySpend = [...vendors]
    .sort((a, b) => b.ytd_spend - a.ytd_spend)
    .slice(0, 10);

  const vendorsByGrade = {
    A: vendors.filter(v => v.grade === 'A').length,
    B: vendors.filter(v => v.grade === 'B').length,
    C: vendors.filter(v => v.grade === 'C').length,
    D: vendors.filter(v => v.grade === 'D').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-gray-600">Loading vendor management dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="w-full">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
              <p className="text-sm text-gray-600 mt-1">Comprehensive vendor analytics and performance tracking</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => exportToCsv('vendor-management', filteredVendors as unknown as Record<string, unknown>[])}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => router.push('/procurement/vendors/add')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Vendor
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="grid grid-cols-5 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="1m">Last Month</option>
                  <option value="3m">Last 3 Months</option>
                  <option value="6m">Last 6 Months</option>
                  <option value="1y">Last Year</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Components">Components</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Chemicals">Chemicals</option>
                  <option value="MRO Supplies">MRO Supplies</option>
                  <option value="Services">Services</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rating</label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Ratings</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                  <option value="D">Grade D</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="under_review">Under Review</option>
                  <option value="blacklisted">Blacklisted</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search vendors..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                +5.2%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{metrics.active_vendors}</h3>
            <p className="text-sm text-gray-600 mt-1">Active Vendors</p>
            <p className="text-xs text-gray-500 mt-2">Out of {metrics.total_vendors} total</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                New
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{metrics.new_this_month}</h3>
            <p className="text-sm text-gray-600 mt-1">New This Month</p>
            <p className="text-xs text-gray-500 mt-2">Vendors onboarded</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                +0.3
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{metrics.average_rating.toFixed(1)}</h3>
            <p className="text-sm text-gray-600 mt-1">Avg Rating</p>
            <div className="flex mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${star <= metrics.average_rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                +12.8%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {(metrics.total_spend_ytd / 10000000).toFixed(1)}Cr
            </h3>
            <p className="text-sm text-gray-600 mt-1">Total Spend (YTD)</p>
            <p className="text-xs text-gray-500 mt-2">Across {metrics.total_pos_this_month} POs</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Top 10 Vendors by Spend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Top 10 Vendors by Spend (YTD)
            </h3>
            <div className="space-y-3">
              {topVendorsBySpend.map((vendor, index) => {
                const maxSpend = topVendorsBySpend[0].ytd_spend;
                const percentage = (vendor.ytd_spend / maxSpend) * 100;
                return (
                  <div key={vendor.vendor_id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                          {vendor.vendor_name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {(vendor.ytd_spend / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vendor Rating Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-green-600" />
              Vendor Rating Distribution
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    A
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Grade A</p>
                    <p className="text-xs text-gray-500">Excellent Performance</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{vendorsByGrade.A}</p>
                  <p className="text-xs text-gray-500">
                    {((vendorsByGrade.A / vendors.length) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    B
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Grade B</p>
                    <p className="text-xs text-gray-500">Good Performance</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{vendorsByGrade.B}</p>
                  <p className="text-xs text-gray-500">
                    {((vendorsByGrade.B / vendors.length) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    C
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Grade C</p>
                    <p className="text-xs text-gray-500">Needs Improvement</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{vendorsByGrade.C}</p>
                  <p className="text-xs text-gray-500">
                    {((vendorsByGrade.C / vendors.length) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    D
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Grade D</p>
                    <p className="text-xs text-gray-500">Poor Performance</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{vendorsByGrade.D}</p>
                  <p className="text-xs text-gray-500">
                    {vendorsByGrade.D > 0 ? ((vendorsByGrade.D / vendors.length) * 100).toFixed(0) : '0'}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Trends & Risk Matrix */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {/* Vendor Risk Matrix */}
          <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Vendor Risk Matrix
            </h3>
            <div className="space-y-3">
              {riskVendors.map((vendor, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${vendor.risk_level === 'high' ? 'bg-red-50 border-red-200' :
                      vendor.risk_level === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-green-50 border-green-200'
                    }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{vendor.vendor_name}</h4>
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${getRiskColor(vendor.risk_level)}`}>
                        {vendor.risk_level.toUpperCase()} RISK
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Rejection Rate</p>
                      <p className="text-lg font-bold text-red-600">{vendor.rejection_rate}%</p>
                    </div>
                  </div>
                  <div className="space-y-1 mb-2">
                    {vendor.issues.map((issue, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                        <AlertCircle className="w-3 h-3 text-gray-500" />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>Last delay: {vendor.last_delivery_delay} days</span>
                    {vendor.financial_risk && (
                      <span className="flex items-center gap-1 text-red-600">
                        <XOctagon className="w-3 h-3" />
                        Financial risk
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Recent Activities
            </h3>
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.status)}`}>
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.vendor_name}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.date} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Pending Actions ({pendingActions.length})
          </h3>
          <div className="space-y-2">
            {pendingActions.map((action) => (
              <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${action.priority === 'high' ? 'bg-red-100' :
                      action.priority === 'medium' ? 'bg-yellow-100' :
                        'bg-blue-100'
                    }`}>
                    {action.action_type === 'approval' && <CheckSquare className="w-4 h-4 text-red-600" />}
                    {action.action_type === 'review' && <Target className="w-4 h-4 text-yellow-600" />}
                    {action.action_type === 'contract_renewal' && <FileCheck className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{action.vendor_name}</p>
                    <p className="text-xs text-gray-600">{action.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Due Date</p>
                    <p className="text-sm font-medium text-gray-900">{action.due_date}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${action.priority === 'high' ? 'bg-red-100 text-red-700' :
                      action.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                    {action.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vendor Scorecard Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Vendor Scorecard ({filteredVendors.length} vendors)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-700 p-3 border-b">Vendor</th>
                  <th className="text-left text-xs font-semibold text-gray-700 p-3 border-b">Category</th>
                  <th className="text-center text-xs font-semibold text-gray-700 p-3 border-b">Grade</th>
                  <th className="text-right text-xs font-semibold text-gray-700 p-3 border-b">YTD Spend</th>
                  <th className="text-right text-xs font-semibold text-gray-700 p-3 border-b">OTD %</th>
                  <th className="text-right text-xs font-semibold text-gray-700 p-3 border-b">Quality %</th>
                  <th className="text-right text-xs font-semibold text-gray-700 p-3 border-b">Price</th>
                  <th className="text-center text-xs font-semibold text-gray-700 p-3 border-b">Rating</th>
                  <th className="text-center text-xs font-semibold text-gray-700 p-3 border-b">Status</th>
                  <th className="text-center text-xs font-semibold text-gray-700 p-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor, index) => (
                  <tr key={vendor.vendor_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 border-b">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{vendor.vendor_name}</p>
                        <p className="text-xs text-gray-500">{vendor.vendor_code}</p>
                      </div>
                    </td>
                    <td className="p-3 border-b text-sm text-gray-700">{vendor.category}</td>
                    <td className="p-3 border-b text-center">
                      <span className={`inline-block px-3 py-1 text-sm font-bold rounded-full border ${getGradeColor(vendor.grade)}`}>
                        {vendor.grade}
                      </span>
                    </td>
                    <td className="p-3 border-b text-right text-sm font-medium text-gray-900">
                      {(vendor.ytd_spend / 1000000).toFixed(1)}M
                    </td>
                    <td className="p-3 border-b text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className={`text-sm font-medium ${vendor.on_time_delivery_rate >= 95 ? 'text-green-600' :
                            vendor.on_time_delivery_rate >= 85 ? 'text-yellow-600' :
                              'text-red-600'
                          }`}>
                          {vendor.on_time_delivery_rate}%
                        </span>
                        {vendor.on_time_delivery_rate >= 95 ? (
                          <ThumbsUp className="w-3 h-3 text-green-600" />
                        ) : vendor.on_time_delivery_rate < 80 ? (
                          <ThumbsDown className="w-3 h-3 text-red-600" />
                        ) : null}
                      </div>
                    </td>
                    <td className="p-3 border-b text-right">
                      <span className={`text-sm font-medium ${vendor.quality_acceptance_rate >= 98 ? 'text-green-600' :
                          vendor.quality_acceptance_rate >= 95 ? 'text-yellow-600' :
                            'text-red-600'
                        }`}>
                        {vendor.quality_acceptance_rate}%
                      </span>
                    </td>
                    <td className="p-3 border-b text-right">
                      <span className={`text-sm font-medium ${vendor.price_competitiveness >= 90 ? 'text-green-600' :
                          vendor.price_competitiveness >= 85 ? 'text-yellow-600' :
                            'text-red-600'
                        }`}>
                        {vendor.price_competitiveness}%
                      </span>
                    </td>
                    <td className="p-3 border-b text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className={`w-4 h-4 ${vendor.overall_rating >= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        <span className="text-sm font-medium text-gray-900">{vendor.overall_rating}</span>
                      </div>
                    </td>
                    <td className="p-3 border-b text-center">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vendor.status)}`}>
                        {vendor.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 border-b text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => router.push(`/procurement/vendors/view/${vendor.vendor_id}`)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"

                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/procurement/vendors/edit/${vendor.vendor_id}`)}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded"

                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorManagementDashboard;
