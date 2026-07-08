'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, DollarSign, Calendar, Clock, AlertTriangle, CheckCircle,
  TrendingUp, TrendingDown, Mail, Phone, FileText, Download, Upload,
  Filter, Search, RefreshCw, Plus, Eye, Edit, MoreHorizontal,
  CreditCard, Building, Target, Activity, Bell, Settings, Star,
  ArrowRight, ArrowUpRight, ArrowDownRight, PieChart, BarChart3
} from 'lucide-react';
import {
  LineChart, AreaChart, BarChart, PieChart as RechartsPieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, Bar, Line, Cell
} from 'recharts';
import { FinanceService } from '@/services/finance.service';

interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  creditLimit: number;
  currentBalance: number;
  overdueAmount: number;
  daysSalesOutstanding: number;
  creditRating: 'A' | 'B' | 'C' | 'D';
  paymentHistory: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  lastPaymentDate: string;
  riskScore: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'draft' | 'sent' | 'overdue' | 'paid' | 'partially_paid' | 'disputed';
  daysOverdue: number;
  paymentTerms: string;
  salesRep: string;
}

interface CollectionActivity {
  id: string;
  customerId: string;
  customerName: string;
  activityType: 'email' | 'call' | 'letter' | 'meeting' | 'payment_plan';
  description: string;
  date: string;
  assignedTo: string;
  nextAction: string;
  nextActionDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  outcome: 'pending' | 'successful' | 'no_response' | 'dispute';
}

export default function AccountsReceivableManagement() {
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('overdueAmount');
  const [showFilters, setShowFilters] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [topCustomers, setTopCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await FinanceService.getReceivables()) as any[];
        const mapped: Customer[] = (raw || []).map((row) => ({
          id: String(row.id ?? row.customerId ?? row.partyId ?? ''),
          name: row.name ?? row.customerName ?? row.partyName ?? '',
          contactPerson: row.contactPerson ?? row.contact ?? '',
          email: row.email ?? '',
          phone: row.phone ?? '',
          creditLimit: Number(row.creditLimit ?? 0),
          currentBalance: Number(row.currentBalance ?? row.balance ?? row.outstandingAmount ?? 0),
          overdueAmount: Number(row.overdueAmount ?? row.overdue ?? 0),
          daysSalesOutstanding: Number(row.daysSalesOutstanding ?? row.dso ?? 0),
          creditRating: (row.creditRating ?? 'B') as Customer['creditRating'],
          paymentHistory: (row.paymentHistory ?? 'Good') as Customer['paymentHistory'],
          lastPaymentDate: row.lastPaymentDate ?? '',
          riskScore: Number(row.riskScore ?? 0),
        }));
        if (!cancelled) setTopCustomers(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load');
          setTopCustomers([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Mock data for AR management
  const arSummary = {
    totalReceivables: 8900000,
    currentReceivables: 6200000,
    overdueReceivables: 2700000,
    overduePercentage: 30.3,
    averageDaysOutstanding: 32,
    collectionsThisMonth: 4500000,
    collectionEfficiency: 87.5,
    badDebtProvision: 125000,
    creditExposure: 15600000,
    activeCustomers: 247,
    newCustomers: 12,
    atRiskCustomers: 18
  };

  const agingBuckets = [
    { period: 'Current (0-30)', amount: 6200000, percentage: 69.7, count: 156, color: '#10B981' },
    { period: '31-60 days', amount: 1800000, percentage: 20.2, count: 45, color: '#F59E0B' },
    { period: '61-90 days', amount: 600000, percentage: 6.7, count: 28, color: '#EF4444' },
    { period: '91-120 days', amount: 200000, percentage: 2.2, count: 12, color: '#7C2D12' },
    { period: 'Over 120 days', amount: 100000, percentage: 1.1, count: 6, color: '#450A0A' }
  ];

  const overdueInvoices: Invoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2024-0234',
      customerId: '1',
      customerName: 'TechCorp Industries',
      issueDate: '2024-08-15',
      dueDate: '2024-09-14',
      amount: 450000,
      paidAmount: 0,
      balanceAmount: 450000,
      status: 'overdue',
      daysOverdue: 35,
      paymentTerms: 'Net 30',
      salesRep: 'Tom Anderson'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-0198',
      customerId: '2',
      customerName: 'Global Manufacturing Ltd',
      issueDate: '2024-08-22',
      dueDate: '2024-09-21',
      amount: 320000,
      paidAmount: 0,
      balanceAmount: 320000,
      status: 'overdue',
      daysOverdue: 28,
      paymentTerms: 'Net 30',
      salesRep: 'Jennifer Lee'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-0245',
      customerId: '4',
      customerName: 'Construction Partners Inc',
      issueDate: '2024-07-30',
      dueDate: '2024-08-29',
      amount: 180000,
      paidAmount: 0,
      balanceAmount: 180000,
      status: 'overdue',
      daysOverdue: 51,
      paymentTerms: 'Net 30',
      salesRep: 'Robert Chen'
    }
  ];

  const collectionActivities: CollectionActivity[] = [
    {
      id: '1',
      customerId: '1',
      customerName: 'TechCorp Industries',
      activityType: 'email',
      description: 'Sent payment reminder for overdue invoices',
      date: '2024-10-18',
      assignedTo: 'Sarah Collins',
      nextAction: 'Follow-up call if no response',
      nextActionDate: '2024-10-21',
      priority: 'high',
      outcome: 'pending'
    },
    {
      id: '2',
      customerId: '2',
      customerName: 'Global Manufacturing Ltd',
      activityType: 'call',
      description: 'Discussed payment schedule for outstanding amount',
      date: '2024-10-17',
      assignedTo: 'Mike Thompson',
      nextAction: 'Receive signed payment plan',
      nextActionDate: '2024-10-20',
      priority: 'medium',
      outcome: 'successful'
    },
    {
      id: '3',
      customerId: '4',
      customerName: 'Construction Partners Inc',
      activityType: 'meeting',
      description: 'In-person meeting to resolve payment disputes',
      date: '2024-10-16',
      assignedTo: 'David Wilson',
      nextAction: 'Legal notice if no payment',
      nextActionDate: '2024-10-23',
      priority: 'urgent',
      outcome: 'dispute'
    }
  ];

  const arTrends = [
    { month: 'Jan', total: 7800000, current: 5460000, overdue: 2340000, dso: 28 },
    { month: 'Feb', total: 8100000, current: 5670000, overdue: 2430000, dso: 30 },
    { month: 'Mar', total: 8350000, current: 5845000, overdue: 2505000, dso: 31 },
    { month: 'Apr', total: 8200000, current: 5740000, overdue: 2460000, dso: 29 },
    { month: 'May', total: 8450000, current: 5915000, overdue: 2535000, dso: 32 },
    { month: 'Jun', total: 8600000, current: 6020000, overdue: 2580000, dso: 33 },
    { month: 'Jul', total: 8750000, current: 6125000, overdue: 2625000, dso: 34 },
    { month: 'Aug', total: 8650000, current: 6055000, overdue: 2595000, dso: 33 },
    { month: 'Sep', total: 8800000, current: 6160000, overdue: 2640000, dso: 35 },
    { month: 'Oct', total: 8900000, current: 6200000, overdue: 2700000, dso: 32 }
  ];

  const paymentChannels = [
    { name: 'Bank Transfer', amount: 3200000, percentage: 52.5, color: '#3B82F6' },
    { name: 'Check', amount: 1800000, percentage: 29.5, color: '#10B981' },
    { name: 'Credit Card', amount: 720000, percentage: 11.8, color: '#F59E0B' },
    { name: 'ACH', amount: 380000, percentage: 6.2, color: '#8B5CF6' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getCreditRatingColor = (rating: string) => {
    switch (rating) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-yellow-100 text-yellow-800';
      case 'C': return 'bg-orange-100 text-orange-800';
      case 'D': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'partially_paid': return 'bg-yellow-100 text-yellow-800';
      case 'disputed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load receivables from the server: {loadError}. Showing available data only.
        </div>
      )}
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <RefreshCw className="h-4 w-4 animate-spin" /> Loading receivables…
        </div>
      )}
      {!isLoading && !loadError && topCustomers.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
          No receivable customers found.
        </div>
      )}
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Accounts Receivable</h1>
            <p className="text-gray-600">
              Comprehensive receivables management and collections tracking
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'aging', label: 'Aging Analysis', icon: Calendar },
              { id: 'customers', label: 'Customer Management', icon: Users },
              { id: 'collections', label: 'Collections', icon: Target },
              { id: 'reports', label: 'Reports', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  selectedView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 text-blue-200" />
            <ArrowUpRight className="h-6 w-6 text-blue-200" />
          </div>
          <p className="text-blue-100 text-sm mb-1">Total Receivables</p>
          <p className="text-3xl font-bold mb-2">{formatCurrency(arSummary.totalReceivables)}</p>
          <p className="text-blue-200 text-sm">
            {formatPercentage(arSummary.overduePercentage)} overdue
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-8 w-8 text-green-200" />
            <TrendingUp className="h-6 w-6 text-green-200" />
          </div>
          <p className="text-green-100 text-sm mb-1">Collection Efficiency</p>
          <p className="text-3xl font-bold mb-2">{formatPercentage(arSummary.collectionEfficiency)}</p>
          <p className="text-green-200 text-sm">
            {formatCurrency(arSummary.collectionsThisMonth)} this month
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-8 w-8 text-orange-200" />
            <Activity className="h-6 w-6 text-orange-200" />
          </div>
          <p className="text-orange-100 text-sm mb-1">Avg Days Outstanding</p>
          <p className="text-3xl font-bold mb-2">{arSummary.averageDaysOutstanding}</p>
          <p className="text-orange-200 text-sm">Days sales outstanding</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-8 w-8 text-red-200" />
            <Bell className="h-6 w-6 text-red-200" />
          </div>
          <p className="text-red-100 text-sm mb-1">At Risk Customers</p>
          <p className="text-3xl font-bold mb-2">{arSummary.atRiskCustomers}</p>
          <p className="text-red-200 text-sm">Require immediate attention</p>
        </div>
      </div>

      {/* Main Content Based on Selected View */}
      {selectedView === 'overview' && (
        <div className="space-y-3">
          {/* AR Trends Chart */}
          <div className="bg-white rounded-xl shadow-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-gray-900">Accounts Receivable Trends</h3>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="current">Current Year</option>
                <option value="last-year">Last Year</option>
                <option value="quarter">Current Quarter</option>
              </select>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={arTrends}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorOverdue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [formatCurrency(Number(value)), name]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                    name="Total Receivables"
                  />
                  <Area
                    type="monotone"
                    dataKey="overdue"
                    stroke="#EF4444"
                    fillOpacity={1}
                    fill="url(#colorOverdue)"
                    name="Overdue Amount"
                  />
                  <Line
                    type="monotone"
                    dataKey="dso"
                    stroke="#10B981"
                    strokeWidth={3}
                    name="DSO (Days)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Aging Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-3">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Aging Breakdown</h4>
              <div className="space-y-3">
                {agingBuckets.slice(0, 3).map((bucket, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: bucket.color }}></div>
                      <span className="text-sm text-gray-600">{bucket.period}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(bucket.amount)}</p>
                      <p className="text-xs text-gray-500">{formatPercentage(bucket.percentage)}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <button className="text-sm text-blue-600 hover:text-blue-800">View detailed aging →</button>
                </div>
              </div>
            </div>

            {/* Top Overdue Customers */}
            <div className="bg-white rounded-xl shadow-lg p-3">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Top Overdue Customers</h4>
              <div className="space-y-3">
                {topCustomers.slice(0, 3).map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                      <p className="text-xs text-gray-500">{customer.daysSalesOutstanding} days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">{formatCurrency(customer.overdueAmount)}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCreditRatingColor(customer.creditRating)}`}>
                        {customer.creditRating}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <button className="text-sm text-blue-600 hover:text-blue-800">View all customers →</button>
                </div>
              </div>
            </div>

            {/* Recent Collection Activities */}
            <div className="bg-white rounded-xl shadow-lg p-3">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Recent Activities</h4>
              <div className="space-y-3">
                {collectionActivities.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="border-l-4 border-blue-200 pl-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">{activity.customerName}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                        {activity.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <button className="text-sm text-blue-600 hover:text-blue-800">View all activities →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'aging' && (
        <div className="space-y-3">
          {/* Aging Analysis Chart */}
          <div className="bg-white rounded-xl shadow-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-gray-900">Receivables Aging Analysis</h3>
              <div className="flex items-center space-x-3">
                <button className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg">Amount</button>
                <button className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-lg">Count</button>
                <button className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-lg">Percentage</button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Tooltip
                      formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
                    />
                    <Legend />
                    <Pie data={agingBuckets} dataKey="amount" nameKey="period" cx="50%" cy="50%" outerRadius={100}>
                      {agingBuckets.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {agingBuckets.map((bucket, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: bucket.color }}></div>
                      <div>
                        <p className="font-medium text-gray-900">{bucket.period}</p>
                        <p className="text-sm text-gray-600">{bucket.count} invoices</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(bucket.amount)}</p>
                      <p className="text-sm text-gray-600">{formatPercentage(bucket.percentage)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Aging Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Overdue Invoices</h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Overdue</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {overdueInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                          <p className="text-xs text-gray-500">Issued: {new Date(invoice.issueDate).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{invoice.customerName}</p>
                          <p className="text-xs text-gray-500">Sales Rep: {invoice.salesRep}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.balanceAmount)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.daysOverdue > 60 ? 'bg-red-100 text-red-800' :
                          invoice.daysOverdue > 30 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {invoice.daysOverdue} days
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                            <Mail className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-700">Email</span>
                          </button>
                          <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                            <Phone className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-700">Call</span>
                          </button>
                          <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                            <Eye className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-700">View</span>
                          </button>
                          <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                            <MoreHorizontal className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-700">More</span>
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
      )}
    </div>
  );
}