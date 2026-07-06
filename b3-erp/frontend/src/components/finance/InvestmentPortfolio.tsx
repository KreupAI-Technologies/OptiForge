'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity, AlertTriangle, Target, Calendar, BarChart3, Shield, Clock, ArrowUpRight, ArrowDownRight, Plus, X, Filter, Download, ChevronUp, ChevronDown, Info, Star, Briefcase, Globe, Building2, Check } from 'lucide-react';
import { FinanceService } from '@/services/finance.service';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Treemap } from 'recharts';

interface Investment {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'bond' | 'mutual-fund' | 'etf' | 'commodity' | 'real-estate' | 'crypto' | 'alternative';
  sector: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  marketValue: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  dividendYield?: number;
  rating?: string;
  maturityDate?: string;
  couponRate?: number;
}

interface Portfolio {
  id: string;
  name: string;
  type: 'conservative' | 'moderate' | 'aggressive' | 'custom';
  totalValue: number;
  totalCost: number;
  totalReturn: number;
  totalReturnPercent: number;
  investments: string[];
  benchmark: string;
  riskScore: number;
  lastRebalanced: string;
}

interface Transaction {
  id: string;
  portfolioId: string;
  investmentId: string;
  type: 'buy' | 'sell' | 'dividend' | 'interest' | 'fee';
  quantity: number;
  price: number;
  totalAmount: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
}

interface PerformanceMetric {
  date: string;
  portfolioValue: number;
  benchmarkValue: number;
  dailyReturn: number;
  cumulativeReturn: number;
}

interface RiskMetric {
  metric: string;
  value: number;
  status: 'low' | 'medium' | 'high';
  benchmark: number;
}

interface AssetAllocation {
  category: string;
  currentPercent: number;
  targetPercent: number;
  difference: number;
  value: number;
}

const InvestmentPortfolio = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPortfolio, setSelectedPortfolio] = useState('P001');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1Y');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showRebalanceModal, setShowRebalanceModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);

  // Mock data
  const portfolios: Portfolio[] = [
    {
      id: 'P001',
      name: 'Growth Portfolio',
      type: 'aggressive',
      totalValue: 2500000,
      totalCost: 2000000,
      totalReturn: 500000,
      totalReturnPercent: 25,
      investments: ['INV001', 'INV002', 'INV003', 'INV004', 'INV005'],
      benchmark: 'S&P 500',
      riskScore: 7.5,
      lastRebalanced: '2024-01-15'
    },
    {
      id: 'P002',
      name: 'Income Portfolio',
      type: 'conservative',
      totalValue: 1800000,
      totalCost: 1700000,
      totalReturn: 100000,
      totalReturnPercent: 5.88,
      investments: ['INV006', 'INV007', 'INV008', 'INV009'],
      benchmark: 'AGG Bond Index',
      riskScore: 3.2,
      lastRebalanced: '2024-02-01'
    },
    {
      id: 'P003',
      name: 'Balanced Portfolio',
      type: 'moderate',
      totalValue: 3200000,
      totalCost: 2800000,
      totalReturn: 400000,
      totalReturnPercent: 14.29,
      investments: ['INV010', 'INV011', 'INV012', 'INV013', 'INV014'],
      benchmark: '60/40 Portfolio',
      riskScore: 5.0,
      lastRebalanced: '2024-01-20'
    }
  ];

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [investmentsLoading, setInvestmentsLoading] = useState(true);
  const [investmentsError, setInvestmentsError] = useState<string | null>(null);

  const mapInvestment = (inv: any): Investment => {
    const principalAmount = Number(inv?.principalAmount) || 0;
    const currentValue = Number(inv?.currentValue) || 0;
    const gainLoss = currentValue - principalAmount;
    const gainLossPercent = principalAmount ? (gainLoss / principalAmount) * 100 : 0;
    const rawType = String(inv?.investmentType ?? '').toLowerCase();
    const allowedTypes = ['stock', 'bond', 'mutual-fund', 'etf', 'commodity', 'real-estate', 'crypto', 'alternative'];
    const type = (allowedTypes.includes(rawType) ? rawType : 'alternative') as Investment['type'];
    return {
      id: String(inv?.id ?? ''),
      symbol: inv?.name ? String(inv.name).slice(0, 6).toUpperCase() : '—',
      name: inv?.name ?? '',
      type,
      sector: inv?.institution ?? '—',
      quantity: 1,
      purchasePrice: principalAmount,
      currentPrice: currentValue,
      purchaseDate: inv?.startDate ? String(inv.startDate).slice(0, 10) : '',
      marketValue: currentValue,
      unrealizedGainLoss: gainLoss,
      unrealizedGainLossPercent: gainLossPercent,
      dividendYield: Number(inv?.interestRate) || 0,
      rating: inv?.status ?? undefined,
      maturityDate: inv?.maturityDate ? String(inv.maturityDate).slice(0, 10) : undefined,
      couponRate: Number(inv?.interestRate) || undefined,
    };
  };

  const loadInvestments = useCallback(async () => {
    setInvestmentsLoading(true);
    setInvestmentsError(null);
    try {
      const data = await FinanceService.getInvestments();
      setInvestments(Array.isArray(data) ? data.map(mapInvestment) : []);
    } catch (err) {
      setInvestmentsError(err instanceof Error ? err.message : 'Failed to load investments');
      setInvestments([]);
    } finally {
      setInvestmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvestments();
  }, [loadInvestments]);

  const handleCreateInvestment = async (data: any) => {
    try {
      await FinanceService.createInvestment(data);
      await loadInvestments();
    } catch (err) {
      setInvestmentsError(err instanceof Error ? err.message : 'Failed to create investment');
    }
  };

  const handleUpdateInvestment = async (id: string, data: any) => {
    try {
      await FinanceService.updateInvestment(id, data);
      await loadInvestments();
    } catch (err) {
      setInvestmentsError(err instanceof Error ? err.message : 'Failed to update investment');
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    try {
      await FinanceService.deleteInvestment(id);
      await loadInvestments();
    } catch (err) {
      setInvestmentsError(err instanceof Error ? err.message : 'Failed to delete investment');
    }
  };

  const transactions: Transaction[] = [
    { id: 'T001', portfolioId: 'P001', investmentId: 'INV001', type: 'buy', quantity: 100, price: 180, totalAmount: 18000, date: '2024-03-01', status: 'completed' },
    { id: 'T002', portfolioId: 'P001', investmentId: 'INV002', type: 'sell', quantity: 50, price: 375, totalAmount: 18750, date: '2024-03-05', status: 'completed' },
    { id: 'T003', portfolioId: 'P001', investmentId: 'INV001', type: 'dividend', quantity: 0, price: 0, totalAmount: 500, date: '2024-03-15', status: 'completed' },
    { id: 'T004', portfolioId: 'P002', investmentId: 'INV006', type: 'interest', quantity: 0, price: 0, totalAmount: 3500, date: '2024-03-20', status: 'completed' },
    { id: 'T005', portfolioId: 'P001', investmentId: 'INV003', type: 'buy', quantity: 25, price: 415, totalAmount: 10375, date: '2024-03-25', status: 'pending' }
  ];

  const performanceData: PerformanceMetric[] = [
    { date: '2023-01', portfolioValue: 2000000, benchmarkValue: 2000000, dailyReturn: 0, cumulativeReturn: 0 },
    { date: '2023-02', portfolioValue: 2050000, benchmarkValue: 2030000, dailyReturn: 2.5, cumulativeReturn: 2.5 },
    { date: '2023-03', portfolioValue: 2100000, benchmarkValue: 2080000, dailyReturn: 2.44, cumulativeReturn: 5 },
    { date: '2023-04', portfolioValue: 2180000, benchmarkValue: 2150000, dailyReturn: 3.81, cumulativeReturn: 9 },
    { date: '2023-05', portfolioValue: 2250000, benchmarkValue: 2200000, dailyReturn: 3.21, cumulativeReturn: 12.5 },
    { date: '2023-06', portfolioValue: 2320000, benchmarkValue: 2250000, dailyReturn: 3.11, cumulativeReturn: 16 },
    { date: '2023-07', portfolioValue: 2400000, benchmarkValue: 2320000, dailyReturn: 3.45, cumulativeReturn: 20 },
    { date: '2023-08', portfolioValue: 2380000, benchmarkValue: 2300000, dailyReturn: -0.83, cumulativeReturn: 19 },
    { date: '2023-09', portfolioValue: 2420000, benchmarkValue: 2350000, dailyReturn: 1.68, cumulativeReturn: 21 },
    { date: '2023-10', portfolioValue: 2450000, benchmarkValue: 2380000, dailyReturn: 1.24, cumulativeReturn: 22.5 },
    { date: '2023-11', portfolioValue: 2480000, benchmarkValue: 2420000, dailyReturn: 1.22, cumulativeReturn: 24 },
    { date: '2023-12', portfolioValue: 2500000, benchmarkValue: 2450000, dailyReturn: 0.81, cumulativeReturn: 25 }
  ];

  const riskMetrics: RiskMetric[] = [
    { metric: 'Volatility', value: 15.2, status: 'medium', benchmark: 12.5 },
    { metric: 'Sharpe Ratio', value: 1.8, status: 'low', benchmark: 1.5 },
    { metric: 'Beta', value: 1.2, status: 'medium', benchmark: 1.0 },
    { metric: 'Value at Risk (95%)', value: -45000, status: 'medium', benchmark: -40000 },
    { metric: 'Max Drawdown', value: -8.5, status: 'low', benchmark: -10 }
  ];

  const assetAllocation: AssetAllocation[] = [
    { category: 'Stocks', currentPercent: 45, targetPercent: 40, difference: 5, value: 1125000 },
    { category: 'Bonds', currentPercent: 25, targetPercent: 30, difference: -5, value: 625000 },
    { category: 'ETFs', currentPercent: 15, targetPercent: 15, difference: 0, value: 375000 },
    { category: 'Real Estate', currentPercent: 10, targetPercent: 10, difference: 0, value: 250000 },
    { category: 'Cash', currentPercent: 5, targetPercent: 5, difference: 0, value: 125000 }
  ];

  const sectorAllocation = [
    { sector: 'Technology', value: 35, holdings: 4 },
    { sector: 'Healthcare', value: 15, holdings: 2 },
    { sector: 'Financial', value: 12, holdings: 3 },
    { sector: 'Consumer', value: 10, holdings: 2 },
    { sector: 'Industrial', value: 8, holdings: 2 },
    { sector: 'Energy', value: 7, holdings: 1 },
    { sector: 'Real Estate', value: 10, holdings: 2 },
    { sector: 'Other', value: 3, holdings: 1 }
  ];

  const currentPortfolio = portfolios.find(p => p.id === selectedPortfolio);

  const renderDashboardTab = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${new Intl.NumberFormat('en-US').format(currentPortfolio?.totalValue || 0)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className={`rounded-lg p-3 ${currentPortfolio && currentPortfolio.totalReturn >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Return</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentPortfolio?.totalReturnPercent.toFixed(2)}%
              </p>
              <p className="text-sm text-gray-500">
                ${new Intl.NumberFormat('en-US').format(currentPortfolio?.totalReturn || 0)}
              </p>
            </div>
            {currentPortfolio && currentPortfolio.totalReturn >= 0 ?
              <TrendingUp className="h-8 w-8 text-green-500" /> :
              <TrendingDown className="h-8 w-8 text-red-500" />
            }
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Risk Score</p>
              <p className="text-2xl font-bold text-gray-900">{currentPortfolio?.riskScore}/10</p>
              <p className="text-sm text-gray-500 capitalize">{currentPortfolio?.type}</p>
            </div>
            <Shield className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Last Rebalanced</p>
              <p className="text-lg font-bold text-gray-900">
                {currentPortfolio && new Date(currentPortfolio.lastRebalanced).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                {currentPortfolio && Math.floor((new Date().getTime() - new Date(currentPortfolio.lastRebalanced).getTime()) / (1000 * 60 * 60 * 24))} days ago
              </p>
            </div>
            <Activity className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Portfolio Performance</h3>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="1M">1 Month</option>
              <option value="3M">3 Months</option>
              <option value="6M">6 Months</option>
              <option value="1Y">1 Year</option>
              <option value="ALL">All Time</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value, name) => {
                if (name === 'Portfolio' || name === 'Benchmark') {
                  return `$${new Intl.NumberFormat('en-US').format(Number(value))}`;
                }
                return `${Number(value).toFixed(2)}%`;
              }} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="portfolioValue" stroke="#3B82F6" name="Portfolio" strokeWidth={2} />
              <Line yAxisId="left" type="monotone" dataKey="benchmarkValue" stroke="#10B981" name="Benchmark" strokeWidth={2} strokeDasharray="5 5" />
              <Line yAxisId="right" type="monotone" dataKey="cumulativeReturn" stroke="#F59E0B" name="Return %" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Asset Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={assetAllocation}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, currentPercent }) => `${category} ${currentPercent}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="currentPercent"
              >
                {assetAllocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Risk Metrics</h3>
          <div className="space-y-3">
            {riskMetrics.map(metric => (
              <div key={metric.metric} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{metric.metric}</p>
                  <p className="text-sm text-gray-500">Benchmark: {metric.benchmark}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {metric.metric.includes('%') || metric.metric === 'Value at Risk (95%)' ?
                      `$${new Intl.NumberFormat('en-US').format(metric.value)}` :
                      metric.value
                    }
                  </p>
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    metric.status === 'low' ? 'bg-green-100 text-green-800' :
                    metric.status === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {metric.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Recent Transactions</h3>
          <div className="space-y-2">
            {transactions.slice(0, 5).map(transaction => {
              const investment = investments.find(inv => inv.id === transaction.investmentId);
              return (
                <div key={transaction.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{investment?.symbol}</p>
                    <p className="text-xs text-gray-500">{transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${
                      transaction.type === 'buy' ? 'text-red-600' :
                      transaction.type === 'sell' ? 'text-green-600' :
                      'text-blue-600'
                    }`}>
                      {transaction.type === 'buy' ? '-' : '+'}
                      ${new Intl.NumberFormat('en-US').format(transaction.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Top Performers</h3>
          <div className="space-y-2">
            {investments
              .sort((a, b) => b.unrealizedGainLossPercent - a.unrealizedGainLossPercent)
              .slice(0, 5)
              .map(investment => (
                <div key={investment.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{investment.symbol}</p>
                    <p className="text-xs text-gray-500">{investment.name}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${
                      investment.unrealizedGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {investment.unrealizedGainLossPercent >= 0 ? '+' : ''}
                      {investment.unrealizedGainLossPercent.toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      ${new Intl.NumberFormat('en-US').format(investment.unrealizedGainLoss)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderHoldingsTab = () => (
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Investment Holdings</h3>
          <div className="flex space-x-2">
            <button className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button
              onClick={() => { handleCreateInvestment({}); setShowTransactionModal(true); }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Transaction
            </button>
          </div>
        </div>

        {investmentsLoading && (
          <p className="text-center text-gray-500 py-4">Loading investments...</p>
        )}
        {investmentsError && !investmentsLoading && (
          <p className="text-center text-red-600 py-4">{investmentsError}</p>
        )}
        {!investmentsLoading && !investmentsError && investments.length === 0 && (
          <p className="text-center text-gray-500 py-4">No investments found.</p>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Symbol</th>
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Type</th>
                <th className="text-right py-2">Quantity</th>
                <th className="text-right py-2">Purchase Price</th>
                <th className="text-right py-2">Current Price</th>
                <th className="text-right py-2">Market Value</th>
                <th className="text-right py-2">Gain/Loss</th>
                <th className="text-right py-2">Return %</th>
                <th className="text-center py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {investments.map(investment => (
                <tr key={investment.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-mono font-semibold">{investment.symbol}</td>
                  <td className="py-2">{investment.name}</td>
                  <td className="py-2">
                    <span className="capitalize">{investment.type}</span>
                  </td>
                  <td className="text-right py-2">{investment.quantity.toLocaleString()}</td>
                  <td className="text-right py-2">${investment.purchasePrice}</td>
                  <td className="text-right py-2">${investment.currentPrice}</td>
                  <td className="text-right py-2 font-semibold">
                    ${new Intl.NumberFormat('en-US').format(investment.marketValue)}
                  </td>
                  <td className={`text-right py-2 font-semibold ${
                    investment.unrealizedGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {investment.unrealizedGainLoss >= 0 ? '+' : ''}
                    ${new Intl.NumberFormat('en-US').format(investment.unrealizedGainLoss)}
                  </td>
                  <td className={`text-right py-2 font-semibold ${
                    investment.unrealizedGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {investment.unrealizedGainLossPercent >= 0 ? '+' : ''}
                    {investment.unrealizedGainLossPercent.toFixed(2)}%
                  </td>
                  <td className="text-center py-2">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedInvestment(investment)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateInvestment(investment.id, { status: investment.rating })}
                        className="text-gray-600 hover:text-gray-800"
                        title="Update"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvestment(investment.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td colSpan={6} className="py-2">Total</td>
                <td className="text-right py-2">
                  ${new Intl.NumberFormat('en-US').format(
                    investments.reduce((sum, inv) => sum + inv.marketValue, 0)
                  )}
                </td>
                <td className="text-right py-2 text-green-600">
                  +${new Intl.NumberFormat('en-US').format(
                    investments.reduce((sum, inv) => sum + inv.unrealizedGainLoss, 0)
                  )}
                </td>
                <td className="text-right py-2 text-green-600">
                  +{(() => {
                    const cost = investments.reduce((sum, inv) => sum + (inv.purchasePrice * inv.quantity), 0);
                    const gain = investments.reduce((sum, inv) => sum + inv.unrealizedGainLoss, 0);
                    return (cost ? (gain / cost) * 100 : 0).toFixed(2);
                  })()}%
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {selectedInvestment && (
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">{selectedInvestment.symbol} - {selectedInvestment.name}</h3>
            <button onClick={() => setSelectedInvestment(null)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <p className="text-sm text-gray-600">Sector</p>
              <p className="font-semibold">{selectedInvestment.sector}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Purchase Date</p>
              <p className="font-semibold">{selectedInvestment.purchaseDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Dividend Yield</p>
              <p className="font-semibold">{selectedInvestment.dividendYield || 0}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rating</p>
              <p className="font-semibold">{selectedInvestment.rating || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Cost Basis</p>
              <p className="font-semibold">
                ${new Intl.NumberFormat('en-US').format(selectedInvestment.purchasePrice * selectedInvestment.quantity)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Daily Change</p>
              <p className={`font-semibold ${Math.random() > 0.5 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 1000).toFixed(2)} ({(Math.random() * 5).toFixed(2)}%)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalysisTab = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Sector Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <Treemap
              data={sectorAllocation}
              dataKey="value"
              aspectRatio={4/3}
              stroke="#fff"
              fill="#3B82F6"
            >
              <Tooltip formatter={(value) => `${value}%`} />
            </Treemap>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Risk-Return Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="risk" name="Risk" unit="%" />
              <YAxis dataKey="return" name="Return" unit="%" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter
                name="Investments"
                data={investments.map(inv => ({
                  name: inv.symbol,
                  risk: Math.random() * 30,
                  return: inv.unrealizedGainLossPercent,
                  size: inv.marketValue
                }))}
                fill="#3B82F6"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold mb-2">Allocation vs Target</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={assetAllocation}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <Bar dataKey="currentPercent" fill="#3B82F6" name="Current %" />
            <Bar dataKey="targetPercent" fill="#10B981" name="Target %" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {assetAllocation.map(allocation => (
            <div key={allocation.category} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center">
                <span className="font-medium">{allocation.category}</span>
                {allocation.difference !== 0 && (
                  <span className={`ml-2 text-sm ${
                    allocation.difference > 0 ? 'text-yellow-600' : 'text-blue-600'
                  }`}>
                    ({allocation.difference > 0 ? '+' : ''}{allocation.difference}% {allocation.difference > 0 ? 'Overweight' : 'Underweight'})
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-600">
                ${new Intl.NumberFormat('en-US').format(allocation.value)}
              </span>
            </div>
          ))}
          <button
            onClick={() => setShowRebalanceModal(true)}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mt-4"
          >
            Rebalance Portfolio
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Performance Attribution</h3>
          <div className="space-y-3">
            {[
              { factor: 'Stock Selection', impact: 3.2, positive: true },
              { factor: 'Sector Allocation', impact: 1.8, positive: true },
              { factor: 'Market Timing', impact: -0.5, positive: false },
              { factor: 'Currency Effect', impact: 0.3, positive: true },
              { factor: 'Fees & Expenses', impact: -0.8, positive: false }
            ].map(factor => (
              <div key={factor.factor} className="flex items-center justify-between">
                <span className="text-sm">{factor.factor}</span>
                <div className="flex items-center">
                  {factor.positive ?
                    <ChevronUp className="h-4 w-4 text-green-500 mr-1" /> :
                    <ChevronDown className="h-4 w-4 text-red-500 mr-1" />
                  }
                  <span className={`font-semibold ${factor.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {factor.positive ? '+' : ''}{factor.impact}%
                  </span>
                </div>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Attribution</span>
                <span className="font-bold text-green-600">+4.0%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Correlation Matrix</h3>
          <div className="text-xs">
            <table className="w-full">
              <thead>
                <tr>
                  <th></th>
                  <th>Stocks</th>
                  <th>Bonds</th>
                  <th>RE</th>
                  <th>Comm</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-semibold">Stocks</td>
                  <td className="text-center bg-blue-100">1.00</td>
                  <td className="text-center bg-red-50">-0.15</td>
                  <td className="text-center bg-blue-50">0.65</td>
                  <td className="text-center bg-blue-50">0.45</td>
                </tr>
                <tr>
                  <td className="font-semibold">Bonds</td>
                  <td className="text-center bg-red-50">-0.15</td>
                  <td className="text-center bg-blue-100">1.00</td>
                  <td className="text-center bg-gray-50">0.10</td>
                  <td className="text-center bg-red-50">-0.20</td>
                </tr>
                <tr>
                  <td className="font-semibold">RE</td>
                  <td className="text-center bg-blue-50">0.65</td>
                  <td className="text-center bg-gray-50">0.10</td>
                  <td className="text-center bg-blue-100">1.00</td>
                  <td className="text-center bg-blue-50">0.35</td>
                </tr>
                <tr>
                  <td className="font-semibold">Comm</td>
                  <td className="text-center bg-blue-50">0.45</td>
                  <td className="text-center bg-red-50">-0.20</td>
                  <td className="text-center bg-blue-50">0.35</td>
                  <td className="text-center bg-blue-100">1.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Income Analysis</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Dividends (Annual)</span>
              <span className="font-semibold">$28,500</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Interest Income</span>
              <span className="font-semibold">$15,200</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Capital Gains</span>
              <span className="font-semibold">$85,300</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Fees & Expenses</span>
              <span className="font-semibold text-red-600">-$8,500</span>
            </div>
            <div className="pt-2 mt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Income</span>
                <span className="font-bold text-green-600">$120,500</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-500">Yield</span>
                <span className="font-semibold">4.82%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTransactionsTab = () => (
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Transaction History</h3>
          <div className="flex space-x-2">
            <select className="border rounded px-3 py-2">
              <option>All Types</option>
              <option>Buy</option>
              <option>Sell</option>
              <option>Dividend</option>
              <option>Interest</option>
            </select>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Investment</th>
                <th className="text-right py-2">Quantity</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">Amount</th>
                <th className="text-center py-2">Status</th>
                <th className="text-center py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => {
                const investment = investments.find(inv => inv.id === transaction.investmentId);
                return (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{transaction.date}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs capitalize ${
                        transaction.type === 'buy' ? 'bg-red-100 text-red-800' :
                        transaction.type === 'sell' ? 'bg-green-100 text-green-800' :
                        transaction.type === 'dividend' ? 'bg-blue-100 text-blue-800' :
                        transaction.type === 'interest' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-2">
                      <div>
                        <p className="font-semibold">{investment?.symbol}</p>
                        <p className="text-xs text-gray-500">{investment?.name}</p>
                      </div>
                    </td>
                    <td className="text-right py-2">
                      {transaction.quantity > 0 ? transaction.quantity.toLocaleString() : '-'}
                    </td>
                    <td className="text-right py-2">
                      {transaction.price > 0 ? `$${transaction.price}` : '-'}
                    </td>
                    <td className={`text-right py-2 font-semibold ${
                      transaction.type === 'buy' ? 'text-red-600' :
                      'text-green-600'
                    }`}>
                      {transaction.type === 'buy' ? '-' : '+'}
                      ${new Intl.NumberFormat('en-US').format(transaction.totalAmount)}
                    </td>
                    <td className="text-center py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="text-center py-2">
                      {transaction.status === 'pending' && (
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm">
                          <X className="h-4 w-4 text-red-600" />
                          <span className="text-red-600">Cancel</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Transaction Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Buys</span>
              <span className="font-semibold text-red-600">-$46,375</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Sells</span>
              <span className="font-semibold text-green-600">+$18,750</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Dividends Received</span>
              <span className="font-semibold text-blue-600">+$500</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Interest Earned</span>
              <span className="font-semibold text-purple-600">+$3,500</span>
            </div>
            <div className="pt-2 mt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Net Cash Flow</span>
                <span className="font-bold text-red-600">-$23,625</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Tax Summary (YTD)</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Short-term Gains</span>
              <span className="font-semibold">$12,500</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Long-term Gains</span>
              <span className="font-semibold">$35,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Dividend Income</span>
              <span className="font-semibold">$8,500</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Interest Income</span>
              <span className="font-semibold">$4,200</span>
            </div>
            <div className="pt-2 mt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Est. Tax Liability</span>
                <span className="font-bold text-red-600">$15,050</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Pending Transactions</h3>
          <div className="space-y-2">
            {transactions.filter(t => t.status === 'pending').map(transaction => {
              const investment = investments.find(inv => inv.id === transaction.investmentId);
              return (
                <div key={transaction.id} className="p-3 bg-yellow-50 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{investment?.symbol}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.type} • {transaction.quantity} shares
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${new Intl.NumberFormat('en-US').format(transaction.totalAmount)}
                      </p>
                      <div className="flex space-x-1 mt-1">
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 rounded-lg hover:bg-green-50 text-sm">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">Approve</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm">
                          <X className="h-4 w-4 text-red-600" />
                          <span className="text-red-600">Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 ">
      <div className="mb-3">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Investment Portfolio</h2>
        <p className="text-gray-600">Track and manage investment portfolios with comprehensive analytics</p>
      </div>

      <div className="mb-3">
        <select
          value={selectedPortfolio}
          onChange={(e) => setSelectedPortfolio(e.target.value)}
          className="border rounded px-4 py-2"
        >
          {portfolios.map(portfolio => (
            <option key={portfolio.id} value={portfolio.id}>
              {portfolio.name} - ${new Intl.NumberFormat('en-US').format(portfolio.totalValue)}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow mb-3">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['dashboard', 'holdings', 'analysis', 'transactions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-6 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div>
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'holdings' && renderHoldingsTab()}
        {activeTab === 'analysis' && renderAnalysisTab()}
        {activeTab === 'transactions' && renderTransactionsTab()}
      </div>

      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full max-w-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">New Transaction</h3>
              <button onClick={() => setShowTransactionModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">Transaction Type</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>Buy</option>
                  <option>Sell</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Investment</label>
                <select className="w-full border rounded px-3 py-2">
                  {investments.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.symbol} - {inv.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input type="number" className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price per Share</label>
                <input type="number" step="0.01" className="w-full border rounded px-3 py-2" />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Execute Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRebalanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Rebalance Portfolio</h3>
              <button onClick={() => setShowRebalanceModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Review the recommended trades to rebalance your portfolio to target allocation:
              </p>
              <div className="max-h-64 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Asset Class</th>
                      <th className="text-right py-2">Current %</th>
                      <th className="text-right py-2">Target %</th>
                      <th className="text-right py-2">Action</th>
                      <th className="text-right py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetAllocation.map(allocation => (
                      <tr key={allocation.category} className="border-b">
                        <td className="py-2">{allocation.category}</td>
                        <td className="text-right py-2">{allocation.currentPercent}%</td>
                        <td className="text-right py-2">{allocation.targetPercent}%</td>
                        <td className="text-right py-2">
                          {allocation.difference > 0 ? (
                            <span className="text-red-600">Sell</span>
                          ) : allocation.difference < 0 ? (
                            <span className="text-green-600">Buy</span>
                          ) : (
                            <span className="text-gray-500">Hold</span>
                          )}
                        </td>
                        <td className="text-right py-2">
                          {allocation.difference !== 0 && (
                            <span className={allocation.difference > 0 ? 'text-red-600' : 'text-green-600'}>
                              ${new Intl.NumberFormat('en-US').format(Math.abs(allocation.difference * 25000))}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-yellow-50 p-3 rounded">
                <p className="text-sm">
                  <AlertTriangle className="h-4 w-4 inline mr-1 text-yellow-600" />
                  Estimated transaction costs: $250 • Tax implications should be reviewed
                </p>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowRebalanceModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Execute Rebalance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentPortfolio;