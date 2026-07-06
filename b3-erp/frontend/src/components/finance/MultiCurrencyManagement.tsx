'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { FinanceService } from '@/services/finance.service';
import {
  DollarSign, Globe, ArrowRightLeft, TrendingUpIcon,
  TrendingDownIcon, ClockIcon, AlertTriangle, CheckCircleIcon,
  PlusIcon, PencilIcon, EyeIcon, SlidersHorizontal,
  Banknote, BarChart3, CogIcon, BellIcon,
  FileText, RefreshCw, Info, Calculator
} from 'lucide-react';

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  isBaseCurrency: boolean;
  isActive: boolean;
  decimalPlaces: number;
  rounding: 'up' | 'down' | 'nearest';
  exchangeRates: ExchangeRate[];
  lastUpdated: string;
  updateSource: string;
  country: string;
  region: string;
}

interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  inverseRate: number;
  date: string;
  source: 'manual' | 'api' | 'bank' | 'market';
  provider: string;
  isActive: boolean;
  volatility: number;
  bid?: number;
  ask?: number;
  spread?: number;
  lastUpdated: string;
}

interface CurrencyExposure {
  currencyCode: string;
  totalExposure: number;
  assetExposure: number;
  liabilityExposure: number;
  netExposure: number;
  percentageOfTotal: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  hedgeRatio: number;
  unrealizedGainLoss: number;
}

interface CurrencyTransaction {
  id: string;
  transactionDate: string;
  type: 'sale' | 'purchase' | 'payment' | 'receipt' | 'revaluation' | 'hedge';
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  gainLoss: number;
  status: 'pending' | 'executed' | 'settled' | 'cancelled';
  reference: string;
  description: string;
  costCenter?: string;
  department?: string;
  accountId: string;
  accountName: string;
}

interface HedgingInstrument {
  id: string;
  type: 'forward' | 'option' | 'swap' | 'future';
  underlyingCurrency: string;
  notionalAmount: number;
  maturityDate: string;
  strikeRate?: number;
  premiumPaid?: number;
  currentValue: number;
  unrealizedPnL: number;
  effectiveness: number;
  hedgeRatio: number;
  isActive: boolean;
  counterparty: string;
}

interface CurrencyAlert {
  id: string;
  type: 'rate_threshold' | 'volatility' | 'exposure_limit' | 'hedge_expiry';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  currencyCode: string;
  threshold: number;
  currentValue: number;
  isTriggered: boolean;
  isActive: boolean;
  createdDate: string;
  triggeredDate?: string;
}

interface RevaluationResult {
  id: string;
  revaluationDate: string;
  baseCurrency: string;
  accountId: string;
  accountName: string;
  foreignCurrency: string;
  originalAmount: number;
  exchangeRateUsed: number;
  revaluedAmount: number;
  gainLoss: number;
  isRealized: boolean;
  journalEntryId?: string;
  notes?: string;
}

const MultiCurrencyManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'currencies' | 'rates' | 'exposure' | 'transactions' | 'hedging' | 'revaluation'>('dashboard');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(300); // 5 minutes

  // Mock data
  const [currencies] = useState<Currency[]>([
    {
      id: '1',
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      isBaseCurrency: true,
      isActive: true,
      decimalPlaces: 2,
      rounding: 'nearest',
      exchangeRates: [],
      lastUpdated: '2024-01-18T14:30:00Z',
      updateSource: 'Federal Reserve',
      country: 'United States',
      region: 'North America'
    },
    {
      id: '2',
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      isBaseCurrency: false,
      isActive: true,
      decimalPlaces: 2,
      rounding: 'nearest',
      exchangeRates: [],
      lastUpdated: '2024-01-18T14:30:00Z',
      updateSource: 'European Central Bank',
      country: 'European Union',
      region: 'Europe'
    },
    {
      id: '3',
      code: 'GBP',
      name: 'British Pound',
      symbol: '£',
      isBaseCurrency: false,
      isActive: true,
      decimalPlaces: 2,
      rounding: 'nearest',
      exchangeRates: [],
      lastUpdated: '2024-01-18T14:30:00Z',
      updateSource: 'Bank of England',
      country: 'United Kingdom',
      region: 'Europe'
    },
    {
      id: '4',
      code: 'JPY',
      name: 'Japanese Yen',
      symbol: '¥',
      isBaseCurrency: false,
      isActive: true,
      decimalPlaces: 0,
      rounding: 'nearest',
      exchangeRates: [],
      lastUpdated: '2024-01-18T14:30:00Z',
      updateSource: 'Bank of Japan',
      country: 'Japan',
      region: 'Asia'
    },
    {
      id: '5',
      code: 'CAD',
      name: 'Canadian Dollar',
      symbol: 'C$',
      isBaseCurrency: false,
      isActive: true,
      decimalPlaces: 2,
      rounding: 'nearest',
      exchangeRates: [],
      lastUpdated: '2024-01-18T14:30:00Z',
      updateSource: 'Bank of Canada',
      country: 'Canada',
      region: 'North America'
    }
  ]);

  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadRates = async () => {
      setRatesLoading(true);
      setRatesError(null);
      try {
        const data = await FinanceService.getExchangeRates();
        const mapped: ExchangeRate[] = (Array.isArray(data) ? data : []).map((r: any) => {
          const rate = Number(r?.rate) || 0;
          const dateStr = r?.effectiveDate ? String(r.effectiveDate) : '';
          return {
            id: String(r?.id ?? ''),
            fromCurrency: r?.fromCurrency ?? '',
            toCurrency: r?.toCurrency ?? '',
            rate,
            inverseRate: rate ? 1 / rate : 0,
            date: dateStr,
            source: (r?.source as ExchangeRate['source']) ?? 'api',
            provider: r?.source ?? '',
            isActive: r?.isActive !== false,
            volatility: 0,
            bid: undefined,
            ask: undefined,
            spread: undefined,
            lastUpdated: dateStr,
          };
        });
        if (!cancelled) setExchangeRates(mapped);
      } catch (err) {
        if (!cancelled) {
          setRatesError(err instanceof Error ? err.message : 'Failed to load exchange rates');
          setExchangeRates([]);
        }
      } finally {
        if (!cancelled) setRatesLoading(false);
      }
    };
    loadRates();
    return () => { cancelled = true; };
  }, []);

  const [currencyExposures] = useState<CurrencyExposure[]>([
    {
      currencyCode: 'EUR',
      totalExposure: 2500000,
      assetExposure: 1800000,
      liabilityExposure: 700000,
      netExposure: 1100000,
      percentageOfTotal: 35.2,
      riskLevel: 'medium',
      hedgeRatio: 0.65,
      unrealizedGainLoss: 45000
    },
    {
      currencyCode: 'GBP',
      totalExposure: 1800000,
      assetExposure: 1200000,
      liabilityExposure: 600000,
      netExposure: 600000,
      percentageOfTotal: 25.3,
      riskLevel: 'medium',
      hedgeRatio: 0.70,
      unrealizedGainLoss: -18000
    },
    {
      currencyCode: 'JPY',
      totalExposure: 1200000,
      assetExposure: 800000,
      liabilityExposure: 400000,
      netExposure: 400000,
      percentageOfTotal: 16.9,
      riskLevel: 'low',
      hedgeRatio: 0.50,
      unrealizedGainLoss: 12000
    },
    {
      currencyCode: 'CAD',
      totalExposure: 900000,
      assetExposure: 600000,
      liabilityExposure: 300000,
      netExposure: 300000,
      percentageOfTotal: 12.7,
      riskLevel: 'low',
      hedgeRatio: 0.45,
      unrealizedGainLoss: 8000
    }
  ]);

  const [currencyTransactions] = useState<CurrencyTransaction[]>([
    {
      id: '1',
      transactionDate: '2024-01-18T10:30:00Z',
      type: 'sale',
      fromCurrency: 'EUR',
      toCurrency: 'USD',
      fromAmount: 100000,
      toAmount: 117070,
      exchangeRate: 1.1707,
      gainLoss: 2070,
      status: 'executed',
      reference: 'INV-EUR-001',
      description: 'Sale to European customer',
      department: 'Sales',
      accountId: '4000',
      accountName: 'Sales Revenue'
    },
    {
      id: '2',
      transactionDate: '2024-01-17T14:20:00Z',
      type: 'purchase',
      fromCurrency: 'USD',
      toCurrency: 'GBP',
      fromAmount: 50000,
      toAmount: 39475,
      exchangeRate: 0.7895,
      gainLoss: -475,
      status: 'settled',
      reference: 'PO-GBP-002',
      description: 'Purchase from UK supplier',
      department: 'Procurement',
      accountId: '5000',
      accountName: 'Cost of Goods Sold'
    },
    {
      id: '3',
      transactionDate: '2024-01-16T09:15:00Z',
      type: 'revaluation',
      fromCurrency: 'JPY',
      toCurrency: 'USD',
      fromAmount: 5000000,
      toAmount: 33966,
      exchangeRate: 0.0068,
      gainLoss: 1500,
      status: 'executed',
      reference: 'REV-JPY-001',
      description: 'Monthly revaluation adjustment',
      accountId: '1100',
      accountName: 'Accounts Receivable'
    }
  ]);

  const [hedgingInstruments] = useState<HedgingInstrument[]>([
    {
      id: '1',
      type: 'forward',
      underlyingCurrency: 'EUR',
      notionalAmount: 500000,
      maturityDate: '2024-03-15T00:00:00Z',
      strikeRate: 0.8500,
      currentValue: 427100,
      unrealizedPnL: 2100,
      effectiveness: 0.95,
      hedgeRatio: 1.0,
      isActive: true,
      counterparty: 'Deutsche Bank'
    },
    {
      id: '2',
      type: 'option',
      underlyingCurrency: 'GBP',
      notionalAmount: 300000,
      maturityDate: '2024-04-20T00:00:00Z',
      strikeRate: 0.7900,
      premiumPaid: 3000,
      currentValue: 236850,
      unrealizedPnL: -1500,
      effectiveness: 0.88,
      hedgeRatio: 0.75,
      isActive: true,
      counterparty: 'Barclays Bank'
    }
  ]);

  const [currencyAlerts] = useState<CurrencyAlert[]>([
    {
      id: '1',
      type: 'rate_threshold',
      severity: 'medium',
      title: 'EUR/USD Rate Alert',
      description: 'EUR/USD exchange rate has exceeded the threshold of 1.17',
      currencyCode: 'EUR',
      threshold: 1.17,
      currentValue: 1.1707,
      isTriggered: true,
      isActive: true,
      createdDate: '2024-01-15T09:00:00Z',
      triggeredDate: '2024-01-18T14:30:00Z'
    },
    {
      id: '2',
      type: 'volatility',
      severity: 'high',
      title: 'GBP Volatility Warning',
      description: 'GBP volatility has increased above 1.5% threshold',
      currencyCode: 'GBP',
      threshold: 0.015,
      currentValue: 0.015,
      isTriggered: true,
      isActive: true,
      createdDate: '2024-01-10T10:00:00Z',
      triggeredDate: '2024-01-18T12:00:00Z'
    }
  ]);

  // Chart data
  const exchangeRateTrends = [
    { date: '2024-01-01', EURUSD: 1.1532, GBPUSD: 0.7823, USDJPY: 144.25, USDCAD: 1.3189 },
    { date: '2024-01-08', EURUSD: 1.1598, GBPUSD: 0.7856, USDJPY: 145.80, USDCAD: 1.3215 },
    { date: '2024-01-15', EURUSD: 1.1654, GBPUSD: 0.7889, USDJPY: 146.95, USDCAD: 1.3232 },
    { date: '2024-01-18', EURUSD: 1.1707, GBPUSD: 0.7895, USDJPY: 147.25, USDCAD: 1.3245 }
  ];

  const volatilityData = [
    { currency: 'EUR', volatility: 1.2, trend: 'stable' },
    { currency: 'GBP', volatility: 1.5, trend: 'increasing' },
    { currency: 'JPY', volatility: 0.8, trend: 'decreasing' },
    { currency: 'CAD', volatility: 1.0, trend: 'stable' }
  ];

  const exposureDistribution = currencyExposures.map(exp => ({
    name: exp.currencyCode,
    value: Math.abs(exp.netExposure),
    color: exp.riskLevel === 'high' ? '#EF4444' :
      exp.riskLevel === 'medium' ? '#F59E0B' : '#10B981'
  }));

  const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
    const currency = currencies.find(c => c.code === currencyCode);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currency?.decimalPlaces || 2,
      maximumFractionDigits: currency?.decimalPlaces || 2,
    }).format(amount);
  };

  const formatRate = (rate: number, decimalPlaces: number = 4) => {
    return rate.toFixed(decimalPlaces);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon },
      executed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircleIcon },
      settled: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTrendIcon = (gainLoss: number) => {
    if (gainLoss > 0) {
      return <TrendingUpIcon className="w-4 h-4 text-green-600" />;
    } else if (gainLoss < 0) {
      return <TrendingDownIcon className="w-4 h-4 text-red-600" />;
    }
    return <div className="w-4 h-4" />;
  };

  const renderDashboard = () => (
    <div className="space-y-3">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Currencies</p>
              <p className="text-2xl font-semibold text-gray-900">
                {currencies.filter(c => c.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Exposure</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(currencyExposures.reduce((sum, exp) => sum + Math.abs(exp.netExposure), 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUpIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unrealized P&L</p>
              <p className={`text-2xl font-semibold ${currencyExposures.reduce((sum, exp) => sum + exp.unrealizedGainLoss, 0) >= 0
                  ? 'text-green-600' : 'text-red-600'
                }`}>
                {formatCurrency(currencyExposures.reduce((sum, exp) => sum + exp.unrealizedGainLoss, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BellIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {currencyAlerts.filter(a => a.isTriggered && a.isActive).length}
              </p>
              <p className="text-sm text-red-600">
                {currencyAlerts.filter(a => a.severity === 'critical' && a.isTriggered).length} critical
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Exchange Rate Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={exchangeRateTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="EURUSD" stroke="#3B82F6" strokeWidth={2} name="EUR/USD" />
              <Line type="monotone" dataKey="GBPUSD" stroke="#10B981" strokeWidth={2} name="GBP/USD" />
              <Line type="monotone" dataKey="USDCAD" stroke="#F59E0B" strokeWidth={2} name="USD/CAD" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Currency Exposure Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={exposureDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {exposureDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real-time rates and alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Live Exchange Rates</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">
                {autoRefresh ? 'Live' : 'Paused'}
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {exchangeRates.slice(0, 4).map((rate) => (
                <div key={rate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {rate.fromCurrency}/{rate.toCurrency}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Updated: {formatDateTime(rate.lastUpdated)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatRate(rate.rate)}
                    </p>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">Spread: {rate.spread?.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-3 py-2 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Currency Alerts</h3>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {currencyAlerts.filter(a => a.isTriggered && a.isActive).map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                    alert.severity === 'high' ? 'border-orange-200 bg-orange-50' :
                      alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                        'border-blue-200 bg-blue-50'
                  }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">Current: </span>
                        <span className="font-medium">{alert.currentValue}</span>
                        <span className="text-gray-600 ml-2">Threshold: </span>
                        <span className="font-medium">{alert.threshold}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                      }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrencies = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Currency Management</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg text-sm flex items-center ${autoRefresh ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
          </button>
          <button
            onClick={() => setShowCurrencyModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Currency
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Rate
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volatility
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currencies.map((currency) => {
                const rate = exchangeRates.find(r => r.toCurrency === currency.code);
                const volatility = volatilityData.find(v => v.currency === currency.code);

                return (
                  <tr key={currency.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-800">{currency.code}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {currency.name} ({currency.symbol})
                          </div>
                          <div className="text-sm text-gray-500">
                            {currency.code} • {currency.country}
                            {currency.isBaseCurrency && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Base
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {rate ? formatRate(rate.rate) : currency.isBaseCurrency ? '1.0000' : 'N/A'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {volatility ? (
                        <div className="flex items-center">
                          <span>{(volatility.volatility * 100).toFixed(1)}%</span>
                          {volatility.trend === 'increasing' && <TrendingUpIcon className="w-4 h-4 text-red-500 ml-1" />}
                          {volatility.trend === 'decreasing' && <TrendingDownIcon className="w-4 h-4 text-green-500 ml-1" />}
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(currency.lastUpdated)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currency.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {currency.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedCurrency(currency)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <PencilIcon className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">Edit</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <CogIcon className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">Settings</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderExchangeRates = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Exchange Rates</h3>
        <button
          onClick={() => setShowRateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Rate
        </button>
      </div>

      {ratesLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center text-gray-500">
          Loading exchange rates...
        </div>
      )}
      {ratesError && !ratesLoading && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {ratesError}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency Pair
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bid/Ask
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spread
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exchangeRates.map((rate) => (
                <tr key={rate.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {rate.fromCurrency}/{rate.toCurrency}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {formatRate(rate.rate)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {rate.bid && rate.ask ? `${formatRate(rate.bid)} / ${formatRate(rate.ask)}` : 'N/A'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {rate.spread ? formatRate(rate.spread, 4) : 'N/A'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{rate.provider}</div>
                      <div className="text-gray-500 capitalize">{rate.source}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(rate.lastUpdated)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <RefreshCw className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Refresh</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <PencilIcon className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Edit</span>
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
  );

  const renderExposure = () => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Currency Exposure Analysis</h3>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset Exposure
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liability Exposure
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Exposure
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hedge Ratio
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unrealized P&L
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currencyExposures.map((exposure) => (
                <tr key={exposure.currencyCode} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {exposure.currencyCode}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(exposure.assetExposure)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(exposure.liabilityExposure)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(exposure.netExposure)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(exposure.riskLevel)}`}>
                      {exposure.riskLevel.charAt(0).toUpperCase() + exposure.riskLevel.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {(exposure.hedgeRatio * 100).toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center">
                      {getTrendIcon(exposure.unrealizedGainLoss)}
                      <span className={`ml-1 ${exposure.unrealizedGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(exposure.unrealizedGainLoss)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Currency Transactions</h3>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency Pair
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gain/Loss
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currencyTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(transaction.transactionDate)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {transaction.type}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.fromCurrency}/{transaction.toCurrency}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{formatCurrency(transaction.fromAmount, transaction.fromCurrency)}</div>
                      <div className="text-gray-500">→ {formatCurrency(transaction.toAmount, transaction.toCurrency)}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {formatRate(transaction.exchangeRate)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center">
                      {getTrendIcon(transaction.gainLoss)}
                      <span className={`ml-1 ${transaction.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(transaction.gainLoss)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {getStatusBadge(transaction.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderHedging = () => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Hedging Instruments</h3>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instrument
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notional Amount
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Maturity
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strike Rate
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Value
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unrealized P&L
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Effectiveness
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hedgingInstruments.map((instrument) => (
                <tr key={instrument.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 capitalize">{instrument.type}</div>
                      <div className="text-sm text-gray-500">{instrument.counterparty}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {instrument.underlyingCurrency}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(instrument.notionalAmount)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(instrument.maturityDate)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {instrument.strikeRate ? formatRate(instrument.strikeRate) : 'N/A'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(instrument.currentValue)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center">
                      {getTrendIcon(instrument.unrealizedPnL)}
                      <span className={`ml-1 ${instrument.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(instrument.unrealizedPnL)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {(instrument.effectiveness * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRevaluation = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Currency Revaluation</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <ArrowRightLeft className="w-5 h-5 mr-2" />
          Run Revaluation
        </button>
      </div>

      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">Revaluation Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Revaluation Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              defaultValue="2024-01-18"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rate Source</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="current">Current Rates</option>
              <option value="closing">Closing Rates</option>
              <option value="average">Average Rates</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Filter</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="all">All Accounts</option>
              <option value="ar">Accounts Receivable</option>
              <option value="ap">Accounts Payable</option>
              <option value="cash">Cash Accounts</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-3 py-2 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Revaluation Preview</h4>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            {currencyExposures.map((exposure) => (
              <div key={exposure.currencyCode} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{exposure.currencyCode}</h5>
                  <p className="text-sm text-gray-600">
                    Net Exposure: {formatCurrency(exposure.netExposure)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    {getTrendIcon(exposure.unrealizedGainLoss)}
                    <span className={`ml-1 font-medium ${exposure.unrealizedGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(exposure.unrealizedGainLoss)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Revaluation Gain/Loss</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 w-full max-w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Multi-Currency Management</h1>
        <p className="text-gray-600 mt-2">Manage currencies, exchange rates, and foreign exchange risk with real-time data</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-3">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { key: 'currencies', label: 'Currencies', icon: Globe },
            { key: 'rates', label: 'Exchange Rates', icon: ArrowRightLeft },
            { key: 'exposure', label: 'Exposure', icon: DollarSign },
            { key: 'transactions', label: 'Transactions', icon: Banknote },
            { key: 'hedging', label: 'Hedging', icon: SlidersHorizontal },
            { key: 'revaluation', label: 'Revaluation', icon: Calculator }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'currencies' && renderCurrencies()}
      {activeTab === 'rates' && renderExchangeRates()}
      {activeTab === 'exposure' && renderExposure()}
      {activeTab === 'transactions' && renderTransactions()}
      {activeTab === 'hedging' && renderHedging()}
      {activeTab === 'revaluation' && renderRevaluation()}
    </div>
  );
};

export default MultiCurrencyManagement;