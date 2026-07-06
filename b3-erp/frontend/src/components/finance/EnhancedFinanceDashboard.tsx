'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FinanceService } from '@/services/finance.service';
import {
  DollarSign, TrendingUp, TrendingDown, Wallet, FileText, Calendar,
  PieChart, BarChart3, ArrowUpRight, ArrowDownRight, Building, CreditCard,
  Package, Users, AlertCircle, CheckCircle, Clock, Receipt, Banknote,
  Calculator, BookOpen, Settings, ArrowRight, Zap, Target, Activity,
  Award, Bell, Download, Filter, RefreshCw, Eye, ChevronDown, ChevronUp,
  Plus, Minus, Star, MapPin, Globe, LineChart, Monitor, Smartphone,
  Tablet, ExternalLink, MoreHorizontal, Search, Info
} from 'lucide-react';
import {
  LineChart as RechartsLineChart, AreaChart, BarChart, ComposedChart,
  PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, Bar, Line, Pie
} from 'recharts';
import {
  QuickJournalEntryModal,
  QuickPaymentModal,
  QuickReceiptModal,
  FilterDashboardModal,
  CustomizeWidgetsModal,
  ExportDashboardModal,
  ViewAlertsModal,
  RefreshDataModal,
  PeriodSelectorModal,
  ViewTransactionDetailsModal
} from './FinanceDashboardModals';

export default function EnhancedFinanceDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedView, setSelectedView] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [expandedSections, setExpandedSections] = useState({
    cashFlow: true,
    receivables: true,
    payables: true,
    profitability: true
  });

  // Modal states
  const [modals, setModals] = useState({
    quickJournal: false,
    quickPayment: false,
    quickReceipt: false,
    filterDashboard: false,
    customizeWidgets: false,
    exportDashboard: false,
    viewAlerts: false,
    refreshData: false,
    periodSelector: false,
    viewTransaction: false
  });

  const openModal = (modalName: string) => {
    setModals({ ...modals, [modalName]: true });
  };

  const closeModal = (modalName: string) => {
    setModals({ ...modals, [modalName]: false });
  };

  const handleModalAction = (action: string, data: unknown) => {
    console.log(`Action: ${action}`, data);
    // Close all modals after action
    Object.keys(modals).forEach(key => {
      if (modals[key as keyof typeof modals]) {
        closeModal(key);
      }
    });
  };

  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Enhanced mock data with time series and analytics
  const initialDashboardData = {
    overview: {
      totalRevenue: 45600000,
      totalExpenses: 31200000,
      netProfit: 14400000,
      profitMargin: 31.6,
      totalAssets: 125000000,
      totalLiabilities: 68000000,
      equity: 57000000,
      workingCapital: 18500000,
      currentRatio: 2.1,
      quickRatio: 1.6,
      debtToEquity: 1.19,
      returnOnAssets: 11.52,
      returnOnEquity: 25.26
    },
    cashPosition: {
      totalCash: 12500000,
      bankBalance: 11800000,
      cashInHand: 700000,
      change: 8.5,
      trend: 'up',
      forecast: {
        nextWeek: 13200000,
        nextMonth: 15800000,
        confidence: 85
      },
      accounts: [
        { name: 'Primary Checking', bank: 'First National Bank', balance: 5800000, type: 'checking' },
        { name: 'Business Savings', bank: 'First National Bank', balance: 4200000, type: 'savings' },
        { name: 'Payroll Account', bank: 'Regional Bank', balance: 1800000, type: 'checking' },
        { name: 'Petty Cash', bank: 'On-site', balance: 700000, type: 'cash' }
      ]
    },
    accountsReceivable: {
      total: 8900000,
      current: 6200000,
      overdue30: 1800000,
      overdue60: 600000,
      overdue90: 300000,
      overduePercentage: 30.3,
      averageDaysOutstanding: 32,
      collections: {
        thisWeek: 1200000,
        thisMonth: 4500000,
        efficiency: 87.5
      },
      aging: [
        { period: 'Current', amount: 6200000, percentage: 69.7 },
        { period: '1-30 days', amount: 1800000, percentage: 20.2 },
        { period: '31-60 days', amount: 600000, percentage: 6.7 },
        { period: '61-90 days', amount: 200000, percentage: 2.2 },
        { period: '90+ days', amount: 100000, percentage: 1.1 }
      ]
    },
    accountsPayable: {
      total: 5600000,
      current: 4100000,
      overdue: 1500000,
      overduePercentage: 26.8,
      averageDaysPayable: 28,
      discounts: {
        available: 125000,
        taken: 89000,
        percentage: 71.2
      },
      aging: [
        { period: 'Current', amount: 4100000, percentage: 73.2 },
        { period: '1-30 days', amount: 900000, percentage: 16.1 },
        { period: '31-60 days', amount: 400000, percentage: 7.1 },
        { period: '61-90 days', amount: 150000, percentage: 2.7 },
        { period: '90+ days', amount: 50000, percentage: 0.9 }
      ]
    },
    profitability: {
      grossProfit: 28400000,
      grossMargin: 62.3,
      operatingProfit: 18200000,
      operatingMargin: 39.9,
      netProfit: 14400000,
      netMargin: 31.6,
      ebitda: 19800000,
      ebitdaMargin: 43.4,
      trends: {
        revenueGrowth: 12.5,
        expenseGrowth: 8.2,
        profitGrowth: 18.7
      }
    },
    cashFlowData: [
      { month: 'Jan', operating: 2800000, investing: -850000, financing: -450000, net: 1500000 },
      { month: 'Feb', operating: 3200000, investing: -1200000, financing: -300000, net: 1700000 },
      { month: 'Mar', operating: 2900000, investing: -600000, financing: 800000, net: 3100000 },
      { month: 'Apr', operating: 3400000, investing: -900000, financing: -200000, net: 2300000 },
      { month: 'May', operating: 3100000, investing: -750000, financing: -150000, net: 2200000 },
      { month: 'Jun', operating: 3600000, investing: -1100000, financing: -250000, net: 2250000 },
      { month: 'Jul', operating: 3300000, investing: -800000, financing: -300000, net: 2200000 },
      { month: 'Aug', operating: 3500000, investing: -950000, financing: -180000, net: 2370000 },
      { month: 'Sep', operating: 3800000, investing: -1050000, financing: -220000, net: 2530000 },
      { month: 'Oct', operating: 3900000, investing: -1200000, financing: -300000, net: 2400000 }
    ],
    revenueByCategory: [
      { name: 'Product Sales', value: 28600000, percentage: 62.7, color: '#3B82F6' },
      { name: 'Services', value: 12400000, percentage: 27.2, color: '#10B981' },
      { name: 'Licensing', value: 3200000, percentage: 7.0, color: '#F59E0B' },
      { name: 'Other', value: 1400000, percentage: 3.1, color: '#EF4444' }
    ],
    expenseByCategory: [
      { name: 'Cost of Goods', value: 17200000, percentage: 55.1, color: '#DC2626' },
      { name: 'Personnel', value: 8900000, percentage: 28.5, color: '#7C3AED' },
      { name: 'Operations', value: 3200000, percentage: 10.3, color: '#059669' },
      { name: 'Marketing', value: 1900000, percentage: 6.1, color: '#DB2777' }
    ],
    kpiTrends: [
      { month: 'Jan', revenue: 4100000, profit: 1230000, margin: 30.0, cashFlow: 1500000 },
      { month: 'Feb', revenue: 4350000, profit: 1370000, margin: 31.5, cashFlow: 1700000 },
      { month: 'Mar', revenue: 4200000, profit: 1310000, margin: 31.2, cashFlow: 3100000 },
      { month: 'Apr', revenue: 4500000, profit: 1420000, margin: 31.6, cashFlow: 2300000 },
      { month: 'May', revenue: 4650000, profit: 1485000, margin: 31.9, cashFlow: 2200000 },
      { month: 'Jun', revenue: 4800000, profit: 1536000, margin: 32.0, cashFlow: 2250000 },
      { month: 'Jul', revenue: 4600000, profit: 1472000, margin: 32.0, cashFlow: 2200000 },
      { month: 'Aug', revenue: 4750000, profit: 1520000, margin: 32.0, cashFlow: 2370000 },
      { month: 'Sep', revenue: 4900000, profit: 1568000, margin: 32.0, cashFlow: 2530000 },
      { month: 'Oct', revenue: 5100000, profit: 1632000, margin: 32.0, cashFlow: 2400000 }
    ]
  };

  const [dashboardData, setDashboardData] = useState(initialDashboardData);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoadingStats(true);
      setLoadError(null);
      try {
        const stats = (await FinanceService.getDashboardStats()) as any;
        if (!cancelled && stats) {
          const monthlyRevenue: any[] = Array.isArray(stats.monthlyRevenue) ? stats.monthlyRevenue : [];
          const kpiTrends = monthlyRevenue.length > 0
            ? monthlyRevenue.map((m: any) => ({
                month: m?.month ?? '',
                revenue: m?.amount ?? 0,
                profit: 0,
                margin: 0,
                cashFlow: 0,
              }))
            : initialDashboardData.kpiTrends;

          setDashboardData(prev => ({
            ...prev,
            overview: {
              ...prev.overview,
              totalRevenue: stats.totalRevenue ?? prev.overview.totalRevenue,
              totalExpenses: stats.totalExpenses ?? prev.overview.totalExpenses,
              netProfit: stats.netIncome ?? prev.overview.netProfit,
            },
            cashPosition: {
              ...prev.cashPosition,
              totalCash: stats.cashBalance ?? prev.cashPosition.totalCash,
            },
            accountsReceivable: {
              ...prev.accountsReceivable,
              total: stats.accountsReceivable ?? prev.accountsReceivable.total,
            },
            accountsPayable: {
              ...prev.accountsPayable,
              total: stats.accountsPayable ?? prev.accountsPayable.total,
            },
            kpiTrends,
          }));
          setLastUpdated(new Date());
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load');
        }
      } finally {
        if (!cancelled) setIsLoadingStats(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'High Receivables',
      message: 'Accounts receivable aging shows 30.3% overdue. Review collection procedures.',
      priority: 'high',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 2,
      type: 'success',
      title: 'Payment Received',
      message: 'Large payment of $2.5M received from TechCorp Industries.',
      priority: 'low',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      id: 3,
      type: 'info',
      title: 'Monthly Close',
      message: 'October month-end closing process scheduled for Nov 2.',
      priority: 'medium',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
    }
  ];

  const quickActions = [
    { icon: FileText, label: 'Journal Entry', href: '/finance/accounting/journal-entries/add', color: 'blue', description: 'Create accounting entries' },
    { icon: Receipt, label: 'Record Payment', href: '/finance/payments/add', color: 'green', description: 'Process receipts' },
    { icon: Banknote, label: 'Create Invoice', href: '/finance/invoices/add', color: 'purple', description: 'Generate customer invoices' },
    { icon: Calculator, label: 'Reconciliation', href: '/finance/bank-reconciliation', color: 'orange', description: 'Match bank statements' },
    { icon: BarChart3, label: 'Financial Reports', href: '/finance/reports', color: 'indigo', description: 'Generate reports' },
    { icon: Settings, label: 'Period Close', href: '/finance/period-operations/close', color: 'gray', description: 'Close accounting period' }
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

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? ArrowUpRight : ArrowDownRight;
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section as keyof typeof prev]: !prev[section as keyof typeof prev]
    }));
  };

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      refreshData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Finance Dashboard</h1>
            <p className="text-gray-600">
              Last updated: {lastUpdated.toLocaleTimeString()} |
              Period: {selectedPeriod.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => openModal('periodSelector')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {selectedPeriod.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </button>
            <button
              onClick={() => openModal('filterDashboard')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button
              onClick={() => openModal('refreshData')}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => openModal('customizeWidgets')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <Settings className="h-4 w-4 mr-2" />
              Customize
            </button>
            <button
              onClick={() => openModal('exportDashboard')}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-blue-600" />
                Recent Alerts ({alerts.length})
              </h3>
              <button
                onClick={() => openModal('viewAlerts')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </button>
            </div>
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center p-3 rounded-lg ${alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      alert.type === 'success' ? 'bg-green-50 border-green-200' :
                        'bg-blue-50 border-blue-200'
                    } border`}
                >
                  <div className={`p-1 rounded-full mr-3 ${alert.type === 'warning' ? 'bg-yellow-100' :
                      alert.type === 'success' ? 'bg-green-100' :
                        'bg-blue-100'
                    }`}>
                    {alert.type === 'warning' ? (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    ) : alert.type === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Info className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{alert.title}</p>
                    <p className="text-xs text-gray-600">{alert.message}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {alert.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {/* Total Cash */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-6 h-6 text-blue-200" />
          </div>
          <p className="text-blue-100 text-sm mb-1">Total Cash Position</p>
          <p className="text-3xl font-bold mb-2">{formatCurrency(dashboardData.cashPosition.totalCash)}</p>
          <div className="flex items-center justify-between">
            <span className="text-blue-100 text-sm">+{dashboardData.cashPosition.change}% this month</span>
            <button
              onClick={() => openModal('quickPayment')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Record</span>
            </button>
          </div>
        </div>

        {/* Accounts Receivable */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-6 h-6 text-green-200" />
          </div>
          <p className="text-green-100 text-sm mb-1">Accounts Receivable</p>
          <p className="text-3xl font-bold mb-2">{formatCurrency(dashboardData.accountsReceivable.total)}</p>
          <div className="flex items-center justify-between">
            <span className="text-green-100 text-sm">{formatPercentage(dashboardData.accountsReceivable.overduePercentage)} overdue</span>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 text-sm">
              <Eye className="h-4 w-4" />
              <span>View</span>
            </button>
          </div>
        </div>

        {/* Accounts Payable */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <ArrowDownRight className="w-6 h-6 text-orange-200" />
          </div>
          <p className="text-orange-100 text-sm mb-1">Accounts Payable</p>
          <p className="text-3xl font-bold mb-2">{formatCurrency(dashboardData.accountsPayable.total)}</p>
          <div className="flex items-center justify-between">
            <span className="text-orange-100 text-sm">{formatPercentage(dashboardData.accountsPayable.overduePercentage)} overdue</span>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 text-sm">
              <Eye className="h-4 w-4" />
              <span>View</span>
            </button>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-6 h-6 text-purple-200" />
          </div>
          <p className="text-purple-100 text-sm mb-1">Net Profit (Month)</p>
          <p className="text-3xl font-bold mb-2">{formatCurrency(dashboardData.overview.netProfit)}</p>
          <div className="flex items-center justify-between">
            <span className="text-purple-100 text-sm">{formatPercentage(dashboardData.overview.profitMargin)} margin</span>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 text-sm">
              <Eye className="h-4 w-4" />
              <span>View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 mb-8">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Current Ratio</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.currentRatio}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Quick Ratio</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.quickRatio}</p>
            </div>
            <Zap className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Debt/Equity</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.debtToEquity}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">ROA</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(dashboardData.overview.returnOnAssets)}</p>
            </div>
            <Target className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">ROE</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(dashboardData.overview.returnOnEquity)}</p>
            </div>
            <Award className="h-8 w-8 text-indigo-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Working Capital</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(dashboardData.overview.workingCapital)}</p>
            </div>
            <Building className="h-8 w-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-8">
        {/* Cash Flow Trend */}
        <div className="bg-white rounded-xl shadow-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold text-gray-900">Cash Flow Trend</h3>
            <button
              onClick={() => toggleSection('cashFlow')}
              className="text-gray-400 hover:text-gray-600"
            >
              {expandedSections.cashFlow ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
          {expandedSections.cashFlow && (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dashboardData.cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), '']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="operating" fill="#3B82F6" name="Operating" />
                  <Bar dataKey="investing" fill="#EF4444" name="Investing" />
                  <Bar dataKey="financing" fill="#F59E0B" name="Financing" />
                  <Line type="monotone" dataKey="net" stroke="#10B981" strokeWidth={3} name="Net Cash Flow" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Revenue vs Expense Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold text-gray-900">Revenue vs Expense</h3>
            <button
              onClick={() => toggleSection('profitability')}
              className="text-gray-400 hover:text-gray-600"
            >
              {expandedSections.profitability ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
          {expandedSections.profitability && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">Revenue Breakdown</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} />
                      <Pie
                        data={dashboardData.revenueByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {dashboardData.revenueByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">Expense Breakdown</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} />
                      <Pie
                        data={dashboardData.expenseByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {dashboardData.expenseByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-3 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
          <Zap className="h-6 w-6 mr-2 text-blue-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
          <button
            onClick={() => openModal('quickJournal')}
            className="group p-3 rounded-lg border-2 border-transparent hover:border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all duration-200 text-center"
          >
            <FileText className="h-8 w-8 mb-2 text-blue-600 group-hover:text-blue-700" />
            <p className="font-medium text-blue-900 text-sm mb-1">Journal Entry</p>
            <p className="text-xs text-blue-600">Create accounting entries</p>
          </button>
          <button
            onClick={() => openModal('quickPayment')}
            className="group p-3 rounded-lg border-2 border-transparent hover:border-green-200 bg-green-50 hover:bg-green-100 transition-all duration-200 text-center"
          >
            <Receipt className="h-8 w-8 mb-2 text-green-600 group-hover:text-green-700" />
            <p className="font-medium text-green-900 text-sm mb-1">Record Payment</p>
            <p className="text-xs text-green-600">Process receipts</p>
          </button>
          <button
            onClick={() => openModal('quickReceipt')}
            className="group p-3 rounded-lg border-2 border-transparent hover:border-purple-200 bg-purple-50 hover:bg-purple-100 transition-all duration-200 text-center"
          >
            <Banknote className="h-8 w-8 mb-2 text-purple-600 group-hover:text-purple-700" />
            <p className="font-medium text-purple-900 text-sm mb-1">Create Invoice</p>
            <p className="text-xs text-purple-600">Generate customer invoices</p>
          </button>
          {quickActions.slice(3).map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group p-3 rounded-lg border-2 border-transparent hover:border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all duration-200 text-center"
            >
              <action.icon className="h-8 w-8 mb-2 text-gray-600 group-hover:text-gray-700" />
              <p className="font-medium text-gray-900 text-sm mb-1">{action.label}</p>
              <p className="text-xs text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-white rounded-xl shadow-lg p-3 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900">Key Performance Trends</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg">Revenue</button>
            <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg">Profit</button>
            <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg">Margin</button>
            <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg">Cash Flow</button>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dashboardData.kpiTrends}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), '']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorProfit)"
                name="Profit"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid - Receivables and Payables Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Accounts Receivable Details */}
        <div className="bg-white rounded-xl shadow-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold text-gray-900">Accounts Receivable Aging</h3>
            <button
              onClick={() => toggleSection('receivables')}
              className="text-gray-400 hover:text-gray-600"
            >
              {expandedSections.receivables ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
          {expandedSections.receivables && (
            <div className="space-y-2">
              {dashboardData.accountsReceivable.aging.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{item.period}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${index === 0 ? 'bg-green-500' :
                            index === 1 ? 'bg-yellow-500' :
                              index === 2 ? 'bg-orange-500' :
                                'bg-red-500'
                          }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                      {formatCurrency(item.amount)}
                    </span>
                    <span className="text-xs text-gray-500 w-12 text-right">
                      {formatPercentage(item.percentage)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Average Days Outstanding:</span>
                  <span className="font-semibold">{dashboardData.accountsReceivable.averageDaysOutstanding} days</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accounts Payable Details */}
        <div className="bg-white rounded-xl shadow-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold text-gray-900">Accounts Payable Aging</h3>
            <button
              onClick={() => toggleSection('payables')}
              className="text-gray-400 hover:text-gray-600"
            >
              {expandedSections.payables ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
          {expandedSections.payables && (
            <div className="space-y-2">
              {dashboardData.accountsPayable.aging.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{item.period}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-yellow-500' :
                              index === 2 ? 'bg-orange-500' :
                                'bg-red-500'
                          }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                      {formatCurrency(item.amount)}
                    </span>
                    <span className="text-xs text-gray-500 w-12 text-right">
                      {formatPercentage(item.percentage)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Average Days Payable:</span>
                  <span className="font-semibold">{dashboardData.accountsPayable.averageDaysPayable} days</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">Discounts Available:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(dashboardData.accountsPayable.discounts.available)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Components */}
      <QuickJournalEntryModal
        isOpen={modals.quickJournal}
        onClose={() => closeModal('quickJournal')}
        onCreate={(data: unknown) => handleModalAction('createJournal', data)}
      />
      <QuickPaymentModal
        isOpen={modals.quickPayment}
        onClose={() => closeModal('quickPayment')}
        onCreate={(data: unknown) => handleModalAction('createPayment', data)}
      />
      <QuickReceiptModal
        isOpen={modals.quickReceipt}
        onClose={() => closeModal('quickReceipt')}
        onCreate={(data: unknown) => handleModalAction('createReceipt', data)}
      />
      <FilterDashboardModal
        isOpen={modals.filterDashboard}
        onClose={() => closeModal('filterDashboard')}
        onApply={(filters: unknown) => handleModalAction('applyFilters', filters)}
      />
      <CustomizeWidgetsModal
        isOpen={modals.customizeWidgets}
        onClose={() => closeModal('customizeWidgets')}
        onSave={(widgets: unknown) => handleModalAction('saveWidgets', widgets)}
      />
      <ExportDashboardModal
        isOpen={modals.exportDashboard}
        onClose={() => closeModal('exportDashboard')}
        onExport={(settings: unknown) => handleModalAction('export', settings)}
      />
      <ViewAlertsModal
        isOpen={modals.viewAlerts}
        onClose={() => closeModal('viewAlerts')}
      />
      <RefreshDataModal
        isOpen={modals.refreshData}
        onClose={() => closeModal('refreshData')}
        onRefresh={() => {
          refreshData();
          closeModal('refreshData');
        }}
      />
      <PeriodSelectorModal
        isOpen={modals.periodSelector}
        onClose={() => closeModal('periodSelector')}
        onSelect={(period: { type: string }) => {
          setSelectedPeriod(period.type === 'custom' ? 'custom' : period.type);
          handleModalAction('selectPeriod', period);
        }}
      />
      <ViewTransactionDetailsModal
        isOpen={modals.viewTransaction}
        onClose={() => closeModal('viewTransaction')}
        transaction={null}
      />
    </div>
  );
}