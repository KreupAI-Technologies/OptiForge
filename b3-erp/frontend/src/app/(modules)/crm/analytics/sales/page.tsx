'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Users, Activity, Calendar, BarChart3, ArrowUpRight, ArrowDownRight, Award, Percent } from 'lucide-react';
import { crmService } from '@/services/crm.service';

interface SalesMetric {
  value: number;
  change: number;
  trend: 'up' | 'down';
}

interface SalesRep {
  id: string;
  name: string;
  avatar: string;
  dealsWon: number;
  revenue: number;
  quota: number;
  quotaAttainment: number;
  avgDealSize: number;
  winRate: number;
  activePipeline: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  deals: number;
  newCustomers: number;
}

export default function SalesAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'deals' | 'customers'>('revenue');
  const [summary, setSummary] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setError(null);
        const data = await crmService.salesAnalytics.getSummary();
        if (active) setSummary(data ?? null);
      } catch (e: any) {
        if (active) {
          setError(e?.message ?? 'Failed to load sales analytics');
          setSummary(null);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Key Sales Metrics — revenue/deals/avgDealSize/winRate derived from live
  // aggregate; change/trend and salesCycle/quotaAttainment remain indicative.
  const metrics: { [key: string]: SalesMetric } = {
    revenue: { value: Number(summary?.wonValue ?? 0), change: 15.3, trend: 'up' },
    deals: { value: Number(summary?.wonCount ?? 0), change: -8.2, trend: 'down' },
    avgDealSize: { value: Number(summary?.avgDealSize ?? 0), change: 12.7, trend: 'up' },
    winRate: { value: Number(summary?.winRate ?? 0), change: 4.8, trend: 'up' },
    salesCycle: { value: 42, change: -5.2, trend: 'up' },
    quotaAttainment: { value: 94.5, change: 8.3, trend: 'up' },
  };

  // Monthly Trend Data
  const monthlyData: MonthlyData[] = [
    { month: 'Jan', revenue: 1850000, deals: 67, newCustomers: 45 },
    { month: 'Feb', revenue: 1920000, deals: 71, newCustomers: 52 },
    { month: 'Mar', revenue: 2100000, deals: 78, newCustomers: 58 },
    { month: 'Apr', revenue: 2050000, deals: 75, newCustomers: 51 },
    { month: 'May', revenue: 2280000, deals: 83, newCustomers: 64 },
    { month: 'Jun', revenue: 2350000, deals: 87, newCustomers: 67 },
    { month: 'Jul', revenue: 2180000, deals: 79, newCustomers: 55 },
    { month: 'Aug', revenue: 2420000, deals: 91, newCustomers: 71 },
    { month: 'Sep', revenue: 2450000, deals: 89, newCustomers: 68 },
    { month: 'Oct', revenue: 2650000, deals: 96, newCustomers: 78 },
  ];

  // Sales Team Performance
  const salesTeam: SalesRep[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'SJ',
      dealsWon: 34,
      revenue: 950000,
      quota: 900000,
      quotaAttainment: 105.6,
      avgDealSize: 27941,
      winRate: 42.5,
      activePipeline: 450000,
    },
    {
      id: '2',
      name: 'Michael Chen',
      avatar: 'MC',
      dealsWon: 28,
      revenue: 780000,
      quota: 800000,
      quotaAttainment: 97.5,
      avgDealSize: 27857,
      winRate: 38.9,
      activePipeline: 380000,
    },
    {
      id: '3',
      name: 'David Park',
      avatar: 'DP',
      dealsWon: 27,
      revenue: 720000,
      quota: 750000,
      quotaAttainment: 96.0,
      avgDealSize: 26667,
      winRate: 36.5,
      activePipeline: 420000,
    },
    {
      id: '4',
      name: 'Emily Davis',
      avatar: 'ED',
      dealsWon: 22,
      revenue: 620000,
      quota: 700000,
      quotaAttainment: 88.6,
      avgDealSize: 28182,
      winRate: 33.8,
      activePipeline: 340000,
    },
    {
      id: '5',
      name: 'Robert Wilson',
      avatar: 'RW',
      dealsWon: 19,
      revenue: 540000,
      quota: 650000,
      quotaAttainment: 83.1,
      avgDealSize: 28421,
      winRate: 31.7,
      activePipeline: 290000,
    },
  ];

  // Deal Size Distribution
  const dealSizeRanges = [
    { range: '$0 - $10K', count: 28, percentage: 31.5, color: 'bg-blue-500' },
    { range: '$10K - $25K', count: 25, percentage: 28.1, color: 'bg-purple-500' },
    { range: '$25K - $50K', count: 20, percentage: 22.5, color: 'bg-yellow-500' },
    { range: '$50K - $100K', count: 12, percentage: 13.5, color: 'bg-orange-500' },
    { range: '$100K+', count: 4, percentage: 4.5, color: 'bg-green-500' },
  ];

  // Product/Service Mix
  const productMix = [
    { product: 'Enterprise License', revenue: 980000, deals: 24, avgDeal: 40833 },
    { product: 'Professional Services', revenue: 720000, deals: 36, avgDeal: 20000 },
    { product: 'Support Contracts', revenue: 450000, deals: 45, avgDeal: 10000 },
    { product: 'Training & Consulting', revenue: 300000, deals: 30, avgDeal: 10000 },
  ];

  const maxValue = Math.max(...monthlyData.map(d =>
    selectedMetric === 'revenue' ? d.revenue :
    selectedMetric === 'deals' ? d.deals * 30000 :
    d.newCustomers * 40000
  ));

  return (
    <div className="w-full h-full px-3 py-2 ">
      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="mb-8">
        <div className="flex gap-2 mb-3">
          {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Revenue</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              ${(metrics.revenue.value / 1000000).toFixed(2)}M
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              metrics.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics.revenue.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{Math.abs(metrics.revenue.change)}%</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Deals Closed</span>
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">{metrics.deals.value}</div>
            <div className={`flex items-center gap-1 text-sm ${
              metrics.deals.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics.deals.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{Math.abs(metrics.deals.change)}%</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Avg Deal Size</span>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              ${(metrics.avgDealSize.value / 1000).toFixed(0)}K
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              metrics.avgDealSize.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics.avgDealSize.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{Math.abs(metrics.avgDealSize.change)}%</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Win Rate</span>
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">{metrics.winRate.value}%</div>
            <div className={`flex items-center gap-1 text-sm ${
              metrics.winRate.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics.winRate.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{Math.abs(metrics.winRate.change)}%</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Sales Cycle</span>
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">{metrics.salesCycle.value}d</div>
            <div className={`flex items-center gap-1 text-sm ${
              metrics.salesCycle.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics.salesCycle.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{Math.abs(metrics.salesCycle.change)}%</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Quota</span>
              <Percent className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">{metrics.quotaAttainment.value}%</div>
            <div className={`flex items-center gap-1 text-sm ${
              metrics.quotaAttainment.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics.quotaAttainment.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{Math.abs(metrics.quotaAttainment.change)}%</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-8">
          {/* Monthly Trend */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Monthly Performance Trend
              </h2>
              <div className="flex gap-2">
                {(['revenue', 'deals', 'customers'] as const).map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      selectedMetric === metric
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {metric === 'revenue' ? 'Revenue' : metric === 'deals' ? 'Deals' : 'Customers'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {monthlyData.map((data, index) => {
                const value = selectedMetric === 'revenue' ? data.revenue :
                             selectedMetric === 'deals' ? data.deals :
                             data.newCustomers;
                const displayValue = selectedMetric === 'revenue'
                  ? `$${(data.revenue / 1000000).toFixed(2)}M`
                  : selectedMetric === 'deals'
                  ? `${data.deals} deals`
                  : `${data.newCustomers} customers`;

                return (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-600 w-8">{data.month}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full flex items-center justify-end pr-3 transition-all"
                        style={{ width: `${((selectedMetric === 'revenue' ? data.revenue : selectedMetric === 'deals' ? data.deals * 30000 : data.newCustomers * 40000) / maxValue) * 100}%` }}
                      >
                        <span className="text-xs font-semibold text-white">{displayValue}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deal Size Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Deal Size Distribution
            </h2>
            <div className="space-y-2">
              {dealSizeRanges.map((range, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-900">{range.range}</span>
                    <span className="text-gray-600">{range.count} deals ({range.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${range.color} h-full rounded-full`}
                      style={{ width: `${range.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sales Team Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Sales Team Performance
          </h2>
          <div className="space-y-2">
            {salesTeam.map((rep, index) => (
              <div key={rep.id} className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                      'bg-gradient-to-br from-blue-500 to-blue-700'
                    }`}>
                      {rep.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        {rep.name}
                        {index < 3 && <Award className="w-4 h-4 text-yellow-500" />}
                      </div>
                      <div className="text-sm text-gray-600">{rep.dealsWon} deals won</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-lg">${(rep.revenue / 1000).toFixed(0)}K</div>
                    <div className={`text-sm font-medium ${
                      rep.quotaAttainment >= 100 ? 'text-green-600' :
                      rep.quotaAttainment >= 90 ? 'text-blue-600' : 'text-orange-600'
                    }`}>
                      {rep.quotaAttainment.toFixed(1)}% of quota
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  <div className="bg-blue-50 rounded p-3">
                    <div className="text-xs text-blue-600 mb-1">Quota</div>
                    <div className="font-bold text-blue-900">${(rep.quota / 1000).toFixed(0)}K</div>
                  </div>
                  <div className="bg-green-50 rounded p-3">
                    <div className="text-xs text-green-600 mb-1">Revenue</div>
                    <div className="font-bold text-green-900">${(rep.revenue / 1000).toFixed(0)}K</div>
                  </div>
                  <div className="bg-purple-50 rounded p-3">
                    <div className="text-xs text-purple-600 mb-1">Avg Deal</div>
                    <div className="font-bold text-purple-900">${(rep.avgDealSize / 1000).toFixed(0)}K</div>
                  </div>
                  <div className="bg-yellow-50 rounded p-3">
                    <div className="text-xs text-yellow-600 mb-1">Win Rate</div>
                    <div className="font-bold text-yellow-900">{rep.winRate.toFixed(1)}%</div>
                  </div>
                  <div className="bg-orange-50 rounded p-3">
                    <div className="text-xs text-orange-600 mb-1">Pipeline</div>
                    <div className="font-bold text-orange-900">${(rep.activePipeline / 1000).toFixed(0)}K</div>
                  </div>
                </div>

                {/* Quota Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Quota Attainment</span>
                    <span className="font-medium">{rep.quotaAttainment.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        rep.quotaAttainment >= 100 ? 'bg-green-500' :
                        rep.quotaAttainment >= 90 ? 'bg-blue-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(rep.quotaAttainment, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Mix */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Revenue by Product/Service
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {productMix.map((product, index) => (
              <div key={index} className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-2">{product.product}</h3>
                <div className="text-2xl font-bold text-blue-900 mb-1">
                  ${(product.revenue / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-gray-600 mb-2">{product.deals} deals</div>
                <div className="text-xs text-gray-600 pt-2 border-t border-blue-200">
                  Avg: ${(product.avgDeal / 1000).toFixed(0)}K per deal
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
