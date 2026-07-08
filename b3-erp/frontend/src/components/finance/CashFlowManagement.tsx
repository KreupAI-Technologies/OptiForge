'use client';

import React, { useState, useEffect } from 'react';
import { FinanceService } from '@/services/finance.service';
import {
  TrendingUp, TrendingDown, Calendar, DollarSign, Activity, AlertCircle,
  Download, Filter, RefreshCw, Plus, Minus, Eye, Settings, Bell,
  ArrowUpRight, ArrowDownRight, PieChart, BarChart3, LineChart,
  Wallet, CreditCard, Building, Target, Zap, Users, FileText,
  CheckCircle, Clock, Info, Search, Edit, Trash2, MoreHorizontal
} from 'lucide-react';
import {
  LineChart as RechartsLineChart, AreaChart, BarChart, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, Bar, Line, Cell, PieChart as RechartsPieChart
} from 'recharts';

interface CashFlowEntry {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'inflow' | 'outflow';
  amount: number;
  status: 'actual' | 'projected' | 'pending';
  probability: number;
  source?: string;
  reference?: string;
}

interface CashFlowForecast {
  period: string;
  beginningBalance: number;
  totalInflows: number;
  totalOutflows: number;
  netCashFlow: number;
  endingBalance: number;
  confidence: number;
}

export default function CashFlowManagement() {
  const [selectedPeriod, setSelectedPeriod] = useState('3-months');
  const [selectedView, setSelectedView] = useState('forecast');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showNewEntry, setShowNewEntry] = useState(false);

  // Advanced features state
  const [showRealTimeMonitoring, setShowRealTimeMonitoring] = useState(true);
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Mock data for cash flow management
  const currentCashPosition = {
    totalCash: 12500000,
    availableCash: 11200000,
    restrictedCash: 1300000,
    shortTermInvestments: 2800000,
    creditLineAvailable: 5000000,
    creditLineUsed: 1200000
  };

  const [cashFlowForecast, setCashFlowForecast] = useState<CashFlowForecast[]>([]);
  const [cashFlowEntries, setCashFlowEntries] = useState<CashFlowEntry[]>([]);

  const loadCashFlow = async (signal?: { cancelled: boolean }) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = (await FinanceService.getCashFlowReport({})) as any;
      const rows: any[] = Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.forecast)
        ? raw.forecast
        : [];

      const forecast: CashFlowForecast[] = rows.map((r: any) => ({
        period: r?.period ?? r?.month ?? r?.label ?? '',
        beginningBalance: r?.beginningBalance ?? r?.openingBalance ?? 0,
        totalInflows: r?.totalInflows ?? r?.inflows ?? r?.inflow ?? 0,
        totalOutflows: r?.totalOutflows ?? r?.outflows ?? r?.outflow ?? 0,
        netCashFlow: r?.netCashFlow ?? r?.net ?? 0,
        endingBalance: r?.endingBalance ?? r?.closingBalance ?? 0,
        confidence: r?.confidence ?? 0,
      }));

      const entrySource: any[] = Array.isArray(raw?.entries)
        ? raw.entries
        : Array.isArray(raw?.transactions)
        ? raw.transactions
        : [];
      const entries: CashFlowEntry[] = entrySource.map((e: any, idx: number) => ({
        id: String(e?.id ?? idx),
        date: e?.date ?? '',
        description: e?.description ?? '',
        category: e?.category ?? '',
        type: (e?.type === 'outflow' ? 'outflow' : 'inflow') as CashFlowEntry['type'],
        amount: e?.amount ?? 0,
        status: (e?.status ?? 'projected') as CashFlowEntry['status'],
        probability: e?.probability ?? 0,
        source: e?.source ?? '',
        reference: e?.reference ?? '',
      }));

      if (!signal?.cancelled) {
        setCashFlowForecast(forecast);
        setCashFlowEntries(entries);
        setLastUpdated(new Date());
      }
    } catch (err) {
      if (!signal?.cancelled) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load');
      }
    } finally {
      if (!signal?.cancelled) setIsLoading(false);
    }
  };

  useEffect(() => {
    const signal = { cancelled: false };
    loadCashFlow(signal);
    return () => {
      signal.cancelled = true;
    };
  }, []);

  const cashFlowByCategory = [
    { name: 'Customer Payments', inflow: 18500000, outflow: 0, net: 18500000, color: '#10B981' },
    { name: 'Vendor Payments', inflow: 0, outflow: 12800000, net: -12800000, color: '#EF4444' },
    { name: 'Payroll', inflow: 0, outflow: 5600000, net: -5600000, color: '#F59E0B' },
    { name: 'Operating Expenses', inflow: 0, outflow: 3200000, net: -3200000, color: '#8B5CF6' },
    { name: 'Investment Income', inflow: 750000, outflow: 0, net: 750000, color: '#06B6D4' },
    { name: 'Loan Payments', inflow: 0, outflow: 450000, net: -450000, color: '#EC4899' }
  ];

  const scenarioAnalysis = [
    {
      scenario: 'Best Case',
      probability: 20,
      endingBalance: 16500000,
      netCashFlow: 4000000,
      assumptions: ['All receivables collected on time', '10% cost reduction', 'New contract signed']
    },
    {
      scenario: 'Most Likely',
      probability: 60,
      endingBalance: 15000000,
      netCashFlow: 2500000,
      assumptions: ['95% collection efficiency', 'Normal operating costs', 'Current growth rate']
    },
    {
      scenario: 'Worst Case',
      probability: 20,
      endingBalance: 13200000,
      netCashFlow: 700000,
      assumptions: ['30% collection delays', 'Unexpected expenses', 'Major customer lost']
    }
  ];

  const cashFlowMetrics = {
    averageDailyBalance: 12850000,
    operatingCashFlowRatio: 1.8,
    cashConversionCycle: 45,
    daysOfCashOnHand: 28,
    cashFlowToDebtRatio: 0.65,
    freeCashFlow: 3200000,
    cashFlowVariability: 12.5
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'actual': return 'bg-green-100 text-green-800';
      case 'projected': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const refreshData = async () => {
    await loadCashFlow();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load cash flow data from the server: {loadError}. Showing available data only.
        </div>
      )}
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <RefreshCw className="h-4 w-4 animate-spin" /> Loading cash flow data…
        </div>
      )}
      {!isLoading && !loadError && cashFlowForecast.length === 0 && cashFlowEntries.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
          No cash flow data available.
        </div>
      )}
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cash Flow Management</h1>
            <p className="text-gray-600">
              Advanced cash flow forecasting and liquidity management
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1-month">1 Month</option>
              <option value="3-months">3 Months</option>
              <option value="6-months">6 Months</option>
              <option value="12-months">12 Months</option>
            </select>
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowNewEntry(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'forecast', label: 'Forecast', icon: TrendingUp },
              { id: 'actual', label: 'Actual vs Projected', icon: BarChart3 },
              { id: 'scenarios', label: 'Scenario Analysis', icon: Target },
              { id: 'metrics', label: 'Cash Metrics', icon: Activity }
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

      {/* Real-Time Cash Flow Monitoring */}
      {showRealTimeMonitoring && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg p-3 border border-indigo-200 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-6 h-6 text-indigo-600" />
                Real-Time Cash Flow Monitor
              </h2>
              <p className="text-sm text-gray-600 mt-1">Live tracking of cash position and liquidity metrics</p>
            </div>
            <div className="flex items-center gap-3">
              {autoRefresh && (
                <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Live
                </span>
              )}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  autoRefresh ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
              </button>
              <button
                onClick={() => setShowRealTimeMonitoring(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
            <div className="bg-white rounded-lg p-3 border border-indigo-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Cash In Today</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-2xl font-bold text-green-600">$847K</div>
              <div className="text-xs text-gray-500 mt-1">18 transactions processed</div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-indigo-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Cash Out Today</span>
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-red-600">$623K</div>
              <div className="text-xs text-gray-500 mt-1">12 payments made</div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-indigo-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Net Position</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-600">+$224K</div>
              <div className="text-xs text-green-600 mt-1">↑ 12% vs yesterday</div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-indigo-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Liquidity Ratio</span>
                <CheckCircle className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-blue-600">2.8</div>
              <div className="text-xs text-blue-600 mt-1">Healthy (target: 2.0+)</div>
            </div>
          </div>

          {/* Live Transaction Feed */}
          <div className="bg-white rounded-lg p-3 border border-indigo-100">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              Recent Cash Movements
            </h3>
            <div className="space-y-2">
              {[
                { type: 'inflow', desc: 'Customer payment received', amount: '$285K', source: 'Acme Corp', time: '5 min ago', color: 'green' },
                { type: 'outflow', desc: 'Supplier payment processed', amount: '$147K', source: 'Tech Supply Ltd', time: '12 min ago', color: 'red' },
                { type: 'inflow', desc: 'Invoice collection', amount: '$92K', source: 'Global Industries', time: '28 min ago', color: 'green' },
                { type: 'outflow', desc: 'Payroll disbursement', amount: '$420K', source: 'Payroll System', time: '45 min ago', color: 'red' }
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                  <div className="flex items-center gap-3 flex-1">
                    <span className={`w-2 h-2 rounded-full bg-${activity.color}-500`}></span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{activity.desc}</div>
                      <div className="text-xs text-gray-500">{activity.source}</div>
                    </div>
                    <span className={`font-semibold text-${activity.color}-600`}>{activity.amount}</span>
                  </div>
                  <span className="text-xs text-gray-400 ml-4">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI-Powered Cash Flow Intelligence */}
      {showAIInsights && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-3 border border-purple-200 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-6 h-6 text-purple-600" />
                AI-Powered Cash Flow Intelligence
              </h2>
              <p className="text-sm text-gray-600 mt-1">Predictive insights and liquidity optimization</p>
            </div>
            <button
              onClick={() => setShowAIInsights(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <AlertCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-900">30-Day Forecast</span>
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-1">$13.8M</div>
              <p className="text-xs text-gray-600">Projected ending balance</p>
              <div className="mt-2 text-xs text-gray-500">
                <span className="font-medium">Confidence:</span> High (92%)
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-gray-900">Shortfall Risk</span>
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-1">Low</div>
              <p className="text-xs text-gray-600">Week 3 shows tightest period</p>
              <div className="mt-2 text-xs text-orange-600">
                Min balance: $10.2M (Week 3)
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-900">Optimization</span>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">$340K</div>
              <p className="text-xs text-gray-600">Potential savings identified</p>
              <div className="mt-2 text-xs text-gray-500">
                4 opportunities detected
              </div>
            </div>
          </div>

          {/* Smart Recommendations */}
          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Smart Cash Management Recommendations
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Optimize Collection Timing</p>
                  <p className="text-xs text-gray-600 mt-1">Accelerate $420K in collections from 5 high-value customers to improve Week 3 position</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">High Impact</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Deploy Excess Cash</p>
                  <p className="text-xs text-gray-600 mt-1">$2.4M excess cash detected - move to short-term investments for 4.5% yield</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">$108K/year</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Delay Non-Critical Payments</p>
                  <p className="text-xs text-gray-600 mt-1">Shift 8 non-urgent payments by 5-7 days to smooth cash flow without penalties</p>
                </div>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Quick Win</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Cash Position Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <Wallet className="h-8 w-8 text-blue-200" />
            <ArrowUpRight className="h-6 w-6 text-blue-200" />
          </div>
          <p className="text-blue-100 text-sm mb-1">Total Cash</p>
          <p className="text-3xl font-bold mb-2">{formatCurrency(currentCashPosition.totalCash)}</p>
          <p className="text-blue-200 text-sm">Available: {formatCurrency(currentCashPosition.availableCash)}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-green-200" />
            <ArrowUpRight className="h-6 w-6 text-green-200" />
          </div>
          <p className="text-green-100 text-sm mb-1">Free Cash Flow</p>
          <p className="text-3xl font-bold mb-2">{formatCurrency(cashFlowMetrics.freeCashFlow)}</p>
          <p className="text-green-200 text-sm">Monthly average</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="h-8 w-8 text-purple-200" />
            <Info className="h-6 w-6 text-purple-200" />
          </div>
          <p className="text-purple-100 text-sm mb-1">Credit Available</p>
          <p className="text-3xl font-bold mb-2">{formatCurrency(currentCashPosition.creditLineAvailable - currentCashPosition.creditLineUsed)}</p>
          <p className="text-purple-200 text-sm">Of {formatCurrency(currentCashPosition.creditLineAvailable)} total</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-8 w-8 text-orange-200" />
            <Clock className="h-6 w-6 text-orange-200" />
          </div>
          <p className="text-orange-100 text-sm mb-1">Days Cash on Hand</p>
          <p className="text-3xl font-bold mb-2">{cashFlowMetrics.daysOfCashOnHand}</p>
          <p className="text-orange-200 text-sm">Based on burn rate</p>
        </div>
      </div>

      {/* Main Content Based on Selected View */}
      {selectedView === 'forecast' && (
        <div className="space-y-3">
          {/* Cash Flow Forecast Chart */}
          <div className="bg-white rounded-xl shadow-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-gray-900">Cash Flow Forecast</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Confidence Range:</span>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs">90%+</span>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full ml-2"></div>
                  <span className="text-xs">80-90%</span>
                  <div className="w-3 h-3 bg-red-500 rounded-full ml-2"></div>
                  <span className="text-xs">&lt;80%</span>
                </div>
              </div>
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={cashFlowForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'confidence' ? `${value}%` : formatCurrency(Number(value)),
                      name
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="totalInflows" fill="#10B981" name="Inflows" />
                  <Bar dataKey="totalOutflows" fill="#EF4444" name="Outflows" />
                  <Line
                    type="monotone"
                    dataKey="endingBalance"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    name="Ending Balance"
                    yAxisId="right"
                  />
                  <Line
                    type="monotone"
                    dataKey="confidence"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Confidence %"
                    yAxisId="right"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Forecast Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Detailed Forecast</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beginning Balance</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inflows</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outflows</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Cash Flow</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ending Balance</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cashFlowForecast.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.period}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{formatCurrency(item.beginningBalance)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-green-600 font-medium">+{formatCurrency(item.totalInflows)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-red-600 font-medium">-{formatCurrency(item.totalOutflows)}</td>
                      <td className={`px-3 py-2 whitespace-nowrap text-sm font-medium ${item.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.netCashFlow >= 0 ? '+' : ''}{formatCurrency(item.netCashFlow)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(item.endingBalance)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(item.confidence)}`}>
                          {formatPercentage(item.confidence)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'scenarios' && (
        <div className="space-y-3">
          {/* Scenario Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-3">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Scenario Analysis</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {scenarioAnalysis.map((scenario, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-lg p-3 ${
                    scenario.scenario === 'Most Likely'
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{scenario.scenario}</h4>
                    <span className="text-sm text-gray-600">{formatPercentage(scenario.probability)} probability</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Ending Balance</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(scenario.endingBalance)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Net Cash Flow</p>
                      <p className={`text-lg font-semibold ${scenario.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {scenario.netCashFlow >= 0 ? '+' : ''}{formatCurrency(scenario.netCashFlow)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Key Assumptions:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {scenario.assumptions.map((assumption, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            {assumption}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cash Flow by Category */}
          <div className="bg-white rounded-xl shadow-lg p-3">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Cash Flow by Category</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlowByCategory} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} />
                    <Legend />
                    <Bar dataKey="inflow" fill="#10B981" name="Inflows" />
                    <Bar dataKey="outflow" fill="#EF4444" name="Outflows" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {cashFlowByCategory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: category.color }}></div>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${category.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {category.net >= 0 ? '+' : ''}{formatCurrency(category.net)}
                      </p>
                      <p className="text-xs text-gray-500">Net flow</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'metrics' && (
        <div className="space-y-3">
          {/* Cash Flow Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-8 w-8 text-blue-500" />
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Ratio</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Operating Cash Flow Ratio</p>
              <p className="text-3xl font-bold text-gray-900">{cashFlowMetrics.operatingCashFlowRatio}</p>
              <p className="text-xs text-gray-500 mt-2">Current liabilities coverage</p>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-8 w-8 text-green-500" />
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Days</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Cash Conversion Cycle</p>
              <p className="text-3xl font-bold text-gray-900">{cashFlowMetrics.cashConversionCycle}</p>
              <p className="text-xs text-gray-500 mt-2">Days to convert investment to cash</p>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="h-8 w-8 text-purple-500" />
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Ratio</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Cash Flow to Debt</p>
              <p className="text-3xl font-bold text-gray-900">{cashFlowMetrics.cashFlowToDebtRatio}</p>
              <p className="text-xs text-gray-500 mt-2">Debt servicing capability</p>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-orange-500" />
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">%</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Cash Flow Variability</p>
              <p className="text-3xl font-bold text-gray-900">{formatPercentage(cashFlowMetrics.cashFlowVariability)}</p>
              <p className="text-xs text-gray-500 mt-2">Monthly variance</p>
            </div>
          </div>

          {/* Cash Flow Entries */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Cash Flow Entries</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="customer-payments">Customer Payments</option>
                  <option value="vendor-payments">Vendor Payments</option>
                  <option value="payroll">Payroll</option>
                  <option value="operating-expenses">Operating Expenses</option>
                </select>
                <button className="text-gray-400 hover:text-gray-600">
                  <Filter className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cashFlowEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{entry.description}</p>
                          {entry.reference && (
                            <p className="text-xs text-gray-500">Ref: {entry.reference}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{entry.category}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entry.type === 'inflow' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {entry.type === 'inflow' ? 'Inflow' : 'Outflow'}
                        </span>
                      </td>
                      <td className={`px-3 py-2 whitespace-nowrap text-sm font-medium ${
                        entry.type === 'inflow' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {entry.type === 'inflow' ? '+' : '-'}{formatCurrency(entry.amount)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                        {formatPercentage(entry.probability)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                            <Eye className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-700">View</span>
                          </button>
                          <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                            <Edit className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-700">Edit</span>
                          </button>
                          <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm">
                            <Trash2 className="h-4 w-4 text-red-600" />
                            <span className="text-red-600">Delete</span>
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