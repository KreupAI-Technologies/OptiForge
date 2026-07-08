'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  FileText,
  Calendar,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  CreditCard,
  Package,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Receipt,
  Banknote,
  Calculator,
  BookOpen,
  Settings,
  ArrowRight,
  Zap,
  Target,
  Activity,
  Award,
  Bell,
  Download,
  Filter,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Star,
  MapPin,
  Globe,
  LineChart,
  Monitor,
  Smartphone,
  Tablet,
  Search
} from 'lucide-react';
import { KPICard, CardSkeleton } from '@/components/ui';
import {
  LineChart as RechartsLineChart,
  AreaChart,
  BarChart,
  ComposedChart,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  Bar,
  Line
} from 'recharts';
import {
  ViewCashPositionModal,
  ViewReceivablesModal,
  ViewPayablesModal,
  ViewProfitModal,
  SearchTransactionsModal,
  RecentActivitiesModal
} from '@/components/finance/FinanceMainModals';
import {
  QuickJournalEntryModal,
  QuickPaymentModal,
  QuickReceiptModal
} from '@/components/finance/FinanceDashboardModals';
import { FinanceService, FinanceDashboardStats } from '@/services/finance.service';
import { toast } from '@/hooks/use-toast';

// Dashboard skeleton loader component
function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-3 h-32">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-3 h-64">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Transform API stats to dashboard data format
interface DashboardData {
  cashPosition: {
    totalCash: number;
    bankBalance: number;
    cashInHand: number;
    change: number;
    trend: string;
  };
  accountsReceivable: {
    total: number;
    current: number;
    overdue: number;
    overduePercentage: number;
  };
  accountsPayable: {
    total: number;
    current: number;
    overdue: number;
    overduePercentage: number;
  };
  monthlyRevenue: {
    current: number;
    previous: number;
    change: number;
  };
  monthlyExpense: {
    current: number;
    previous: number;
    change: number;
  };
  netProfit: {
    amount: number;
    margin: number;
    change: number;
  };
  anticipatedReceipts: {
    thisWeek: number;
    thisMonth: number;
    count: number;
  };
  anticipatedPayments: {
    thisWeek: number;
    thisMonth: number;
    count: number;
  };
  budgetUtilization: {
    utilized: number;
    remaining: number;
    status: string;
  };
  recentTransactions: Array<{
    id: number;
    type: string;
    number: string;
    date: string;
    amount: number;
    status: string;
  }>;
}

function transformStatsToData(stats: FinanceDashboardStats): DashboardData {
  // Calculate revenue growth for change percentage
  const revenueGrowth = stats.revenueGrowth || 0;
  const expenseGrowth = stats.expenseGrowth || 0;

  // Calculate anticipated receipts/payments from pending invoices
  const anticipatedReceiptsTotal = stats.accountsReceivable || 0;
  const anticipatedPaymentsTotal = stats.accountsPayable || 0;

  return {
    cashPosition: {
      totalCash: stats.cashBalance || 0,
      bankBalance: (stats.cashBalance || 0) * 0.95, // Assume 95% in bank
      cashInHand: (stats.cashBalance || 0) * 0.05, // 5% as petty cash
      change: revenueGrowth,
      trend: revenueGrowth >= 0 ? 'up' : 'down',
    },
    accountsReceivable: {
      total: stats.accountsReceivable || 0,
      current: (stats.accountsReceivable || 0) - ((stats.accountsReceivable || 0) * 0.3),
      overdue: (stats.accountsReceivable || 0) * 0.3,
      overduePercentage: 30.3,
    },
    accountsPayable: {
      total: stats.accountsPayable || 0,
      current: (stats.accountsPayable || 0) * 0.73,
      overdue: (stats.accountsPayable || 0) * 0.27,
      overduePercentage: 26.8,
    },
    monthlyRevenue: {
      current: stats.totalRevenue || 0,
      previous: (stats.totalRevenue || 0) / (1 + revenueGrowth / 100),
      change: revenueGrowth,
    },
    monthlyExpense: {
      current: stats.totalExpenses || 0,
      previous: (stats.totalExpenses || 0) / (1 + expenseGrowth / 100),
      change: expenseGrowth,
    },
    netProfit: {
      amount: stats.netIncome || 0,
      margin: stats.totalRevenue > 0 ? ((stats.netIncome || 0) / stats.totalRevenue) * 100 : 0,
      change: revenueGrowth - expenseGrowth,
    },
    anticipatedReceipts: {
      thisWeek: anticipatedReceiptsTotal * 0.35,
      thisMonth: anticipatedReceiptsTotal,
      count: stats.pendingInvoices || 0,
    },
    anticipatedPayments: {
      thisWeek: anticipatedPaymentsTotal * 0.38,
      thisMonth: anticipatedPaymentsTotal,
      count: stats.pendingPayments || 0,
    },
    budgetUtilization: {
      utilized: 62.5,
      remaining: 37.5,
      status: 'on-track',
    },
    recentTransactions: (stats.recentTransactions || []).map((txn, index) => ({
      id: index + 1,
      type: txn.type === 'credit' ? 'Receipt' : 'Payment',
      number: txn.id,
      date: new Date(txn.date).toISOString().split('T')[0],
      amount: txn.type === 'credit' ? txn.amount : -txn.amount,
      status: 'Posted',
    })),
  };
}

export default function FinanceDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedView, setSelectedView] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [alerts, setAlerts] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    cashFlow: true,
    receivables: true,
    payables: true,
    profitability: true
  });
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Fetch dashboard stats from service
  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        setIsLoading(true);
        setError(null);
        const stats = await FinanceService.getDashboardStats();
        const transformedData = transformStatsToData(stats);
        setDashboardData(transformedData);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

  // Refresh data function
  const refreshData = async () => {
    try {
      setIsLoading(true);
      const stats = await FinanceService.getDashboardStats();
      const transformedData = transformStatsToData(stats);
      setDashboardData(transformedData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to refresh dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Modal states
  const [modals, setModals] = useState({
    viewCashPosition: false,
    viewReceivables: false,
    viewPayables: false,
    viewProfit: false,
    searchTransactions: false,
    recentActivities: false,
    quickJournal: false,
    quickPayment: false,
    quickReceipt: false
  });

  const openModal = (modalName: string) => {
    setModals({ ...modals, [modalName]: true });
  };

  const closeModal = (modalName: string) => {
    setModals({ ...modals, [modalName]: false });
  };

  const [submitting, setSubmitting] = useState(false);

  const closeAllModals = () => {
    setModals({
      viewCashPosition: false,
      viewReceivables: false,
      viewPayables: false,
      viewProfit: false,
      searchTransactions: false,
      recentActivities: false,
      quickJournal: false,
      quickPayment: false,
      quickReceipt: false,
    });
  };

  // Wire quick-create modal submits to the real finance services, then refresh the dashboard.
  const handleModalAction = async (action: string, data: Record<string, unknown>) => {
    if (submitting) return;
    // Search is a read-only filter action; nothing to persist.
    if (action === 'search') {
      closeModal('searchTransactions');
      return;
    }

    try {
      setSubmitting(true);
      switch (action) {
        case 'createJournal':
          await FinanceService.createJournalEntry(data);
          toast({ title: 'Journal entry created', variant: 'success' });
          break;
        case 'createPayment':
          await FinanceService.createPayment({ ...data, direction: (data as any)?.direction ?? 'Outgoing' });
          toast({ title: 'Payment recorded', variant: 'success' });
          break;
        case 'createReceipt':
          await FinanceService.createPayment({ ...data, direction: (data as any)?.direction ?? 'Incoming' });
          toast({ title: 'Receipt recorded', variant: 'success' });
          break;
        default:
          break;
      }
      closeAllModals();
      await refreshData();
    } catch (err) {
      console.error(`Action ${action} failed:`, err);
      toast({
        title: 'Action failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const quickActions = [
    { icon: FileText, label: 'Create Journal Entry', href: '/finance/journal-entries/create', color: 'blue' },
    { icon: Receipt, label: 'Record Payment', href: '/finance/payments/add', color: 'green' },
    { icon: Banknote, label: 'Create Invoice', href: '/finance/invoices/add', color: 'purple' },
    { icon: Calculator, label: 'Bank Reconciliation', href: '/finance/bank-reconciliation', color: 'orange' },
  ];

  const financialReports = [
    { name: 'Profit & Loss', description: 'Income statement for the period', href: '/finance/reports/profit-loss', icon: TrendingUp },
    { name: 'Balance Sheet', description: 'Financial position statement', href: '/finance/reports/balance-sheet', icon: BarChart3 },
    { name: 'Cash Flow', description: 'Cash movement analysis', href: '/finance/reports/cash-flow', icon: Wallet },
    { name: 'Trial Balance', description: 'Account balances verification', href: '/finance/accounting/trial-balance', icon: BookOpen },
  ];

  // Recent transactions come from live dashboard data; empty array renders the empty state.
  const recentTransactions = dashboardData?.recentTransactions ?? [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Show loading skeleton
  if (isLoading && !dashboardData) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-3 py-2 w-full">
            <DashboardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !dashboardData) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-2" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h2>
            <p className="text-gray-600 mb-2">{error}</p>
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Use default values if dashboardData is still null
  const data = dashboardData || {
    cashPosition: { totalCash: 0, bankBalance: 0, cashInHand: 0, change: 0, trend: 'up' },
    accountsReceivable: { total: 0, current: 0, overdue: 0, overduePercentage: 0 },
    accountsPayable: { total: 0, current: 0, overdue: 0, overduePercentage: 0 },
    monthlyRevenue: { current: 0, previous: 0, change: 0 },
    monthlyExpense: { current: 0, previous: 0, change: 0 },
    netProfit: { amount: 0, margin: 0, change: 0 },
    anticipatedReceipts: { thisWeek: 0, thisMonth: 0, count: 0 },
    anticipatedPayments: { thisWeek: 0, thisMonth: 0, count: 0 },
    budgetUtilization: { utilized: 0, remaining: 100, status: 'on-track' },
    recentTransactions: [],
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full px-3 py-2 w-full">
          {/* Header Actions */}
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => openModal('quickJournal')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>Journal Entry</span>
              </button>
              <button
                onClick={() => openModal('quickPayment')}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>Record Payment</span>
              </button>
              <button
                onClick={() => openModal('quickReceipt')}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>Record Receipt</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => openModal('searchTransactions')}
                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-300"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
              <button
                onClick={() => openModal('recentActivities')}
                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-300"
              >
                <Clock className="w-5 h-5" />
                <span>Activities</span>
              </button>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>October 2025</span>
                </div>
              </div>
              <Link
                href="/finance"
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
            </div>
          </div>

          {/* Key Metrics - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            {isLoading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              <>
                <div className="relative group">
                  <KPICard
                    value={formatCurrency(data.cashPosition.totalCash)}
                    icon={Wallet}
                    color="blue"
                    trend={{
                      value: data.cashPosition.change,
                      isPositive: data.cashPosition.change > 0,
                      label: 'vs last month'
                    }}
                  />
                  <button
                    onClick={() => openModal('viewCashPosition')}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium shadow-md flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
                <div className="relative group">
                  <KPICard
                    value={formatCurrency(data.accountsReceivable.total)}
                    icon={TrendingUp}
                    color="green"
                    description={`Current: ${formatCurrency(data.accountsReceivable.current)}`}
                  />
                  <button
                    onClick={() => openModal('viewReceivables')}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-green-600 px-3 py-1.5 rounded-lg text-sm font-medium shadow-md flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
                <div className="relative group">
                  <KPICard
                    value={formatCurrency(data.accountsPayable.total)}
                    icon={TrendingDown}
                    color="red"
                    description={`Current: ${formatCurrency(data.accountsPayable.current)}`}
                  />
                  <button
                    onClick={() => openModal('viewPayables')}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium shadow-md flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
                <div className="relative group">
                  <KPICard
                    value={formatCurrency(data.netProfit.amount)}
                    icon={PieChart}
                    color="purple"
                    trend={{
                      value: data.netProfit.change,
                      isPositive: true
                    }}
                    description={`${data.netProfit.margin}% Margin`}
                  />
                  <button
                    onClick={() => openModal('viewProfit')}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-purple-600 px-3 py-1.5 rounded-lg text-sm font-medium shadow-md flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-blue-600" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {quickActions.map((action) => {
                const colorMap: any = {
                  blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
                  green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
                  purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
                  orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
                };
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={`bg-gradient-to-r ${colorMap[action.color]} text-white p-3 rounded-lg shadow-md transition-all hover:shadow-xl flex items-center gap-3`}
                  >
                    <action.icon className="w-8 h-8" />
                    <span className="font-semibold">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Middle Row - Revenue/Expense & Cash Flow */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
            {/* Revenue vs Expense */}
            <div className="bg-white rounded-xl shadow-lg p-3">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Monthly Revenue vs Expense</h2>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Revenue</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(data.monthlyRevenue.current)}
                      </span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        +{data.monthlyRevenue.change}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Expense</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-red-600">
                        {formatCurrency(data.monthlyExpense.current)}
                      </span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        {data.monthlyExpense.change}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-red-500 h-3 rounded-full" style={{ width: '48%' }}></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Net Profit</span>
                    <span className="text-xl font-bold text-purple-600">
                      {formatCurrency(data.monthlyRevenue.current - data.monthlyExpense.current)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Anticipated Cash Flow */}
            <div className="bg-white rounded-xl shadow-lg p-3">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Anticipated Cash Flow</h2>
              <div className="space-y-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-900">Expected Receipts</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {data.anticipatedReceipts.count} items
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">This Week</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(data.anticipatedReceipts.thisWeek)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">This Month</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(data.anticipatedReceipts.thisMonth)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ArrowDownRight className="w-5 h-5 text-orange-600" />
                      <span className="font-semibold text-gray-900">Expected Payments</span>
                    </div>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                      {data.anticipatedPayments.count} items
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">This Week</p>
                      <p className="text-xl font-bold text-orange-600">
                        {formatCurrency(data.anticipatedPayments.thisWeek)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">This Month</p>
                      <p className="text-xl font-bold text-orange-600">
                        {formatCurrency(data.anticipatedPayments.thisMonth)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Net Cash Flow (This Month)</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(
                        data.anticipatedReceipts.thisMonth - data.anticipatedPayments.thisMonth
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row - Recent Transactions & Financial Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                <Link href="/finance/general-ledger" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {recentTransactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No recent transactions to display.
                  </div>
                )}
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                          }`}
                      >
                        {transaction.amount > 0 ? (
                          <ArrowUpRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{transaction.number}</p>
                        <p className="text-sm text-gray-500">
                          {transaction.type} • {transaction.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {transaction.amount > 0 ? '+' : ''}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </p>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{transaction.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Reports */}
            <div className="bg-white rounded-xl shadow-lg p-3">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Financial Reports</h2>
              <div className="grid grid-cols-2 gap-2">
                {financialReports.map((report) => (
                  <Link
                    key={report.name}
                    href={report.href}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 border border-gray-200 hover:border-blue-300 rounded-lg p-3 transition-all hover:shadow-md group"
                  >
                    <report.icon className="w-8 h-8 text-gray-600 group-hover:text-blue-600 mb-2 transition-colors" />
                    <h3 className="font-semibold text-gray-900 mb-1">{report.name}</h3>
                    <p className="text-xs text-gray-600">{report.description}</p>
                  </Link>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  href="/finance/reports"
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-semibold">View All Reports</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Components */}
      <ViewCashPositionModal
        isOpen={modals.viewCashPosition}
        onClose={() => closeModal('viewCashPosition')}
      />
      <ViewReceivablesModal
        isOpen={modals.viewReceivables}
        onClose={() => closeModal('viewReceivables')}
      />
      <ViewPayablesModal
        isOpen={modals.viewPayables}
        onClose={() => closeModal('viewPayables')}
      />
      <ViewProfitModal
        isOpen={modals.viewProfit}
        onClose={() => closeModal('viewProfit')}
      />
      <SearchTransactionsModal
        isOpen={modals.searchTransactions}
        onClose={() => closeModal('searchTransactions')}
        onSearch={(criteria: Record<string, unknown>) => handleModalAction('search', criteria)}
      />
      <RecentActivitiesModal
        isOpen={modals.recentActivities}
        onClose={() => closeModal('recentActivities')}
      />
      <QuickJournalEntryModal
        isOpen={modals.quickJournal}
        onClose={() => closeModal('quickJournal')}
        onCreate={(data: Record<string, unknown>) => handleModalAction('createJournal', data)}
      />
      <QuickPaymentModal
        isOpen={modals.quickPayment}
        onClose={() => closeModal('quickPayment')}
        onCreate={(data: Record<string, unknown>) => handleModalAction('createPayment', data)}
      />
      <QuickReceiptModal
        isOpen={modals.quickReceipt}
        onClose={() => closeModal('quickReceipt')}
        onCreate={(data: Record<string, unknown>) => handleModalAction('createReceipt', data)}
      />
    </div>
  );
}
