'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, DollarSign, Target, Calendar, Repeat, Award, PieChart, ShoppingCart } from 'lucide-react';
import crmService from '@/services/crm.service';

const SEGMENT_COLORS = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-green-500 to-green-600',
  'from-orange-500 to-orange-600',
  'from-teal-500 to-teal-600',
];

const BAR_COLORS = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-teal-500'];

const LIFECYCLE_COLORS = [
  'from-blue-500 to-blue-600',
  'from-green-500 to-green-600',
  'from-yellow-500 to-yellow-600',
  'from-orange-500 to-orange-600',
  'from-red-500 to-red-600',
];

export default function CustomerAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const result = await crmService.analyticsViews.getCustomers();
        if (!cancelled) {
          setAnalytics(result);
        }
      } catch (err: any) {
        if (!cancelled) {
          setAnalytics(null);
          setLoadError(err?.message || 'Failed to load customer analytics.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Top-level metrics from backend
  const totalCustomers: number = analytics?.totalCustomers ?? 0;
  const activeCustomers: number = analytics?.activeCustomers ?? 0;
  const totalRevenue: number = analytics?.totalRevenue ?? 0;
  const avgLifetimeValue: number = analytics?.avgLifetimeValue ?? 0;
  const totalOrders: number = analytics?.totalOrders ?? 0;
  const avgRevPerCustomer: number = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;

  // Customer segments derived from bySegment
  const bySegment: Array<{ segment: string; count: number; revenue: number }> = analytics?.bySegment ?? [];
  const segmentTotalCount = bySegment.reduce((sum, s) => sum + (s.count ?? 0), 0);
  const customerSegments = bySegment.map((s, index) => ({
    segment: s.segment,
    count: s.count ?? 0,
    percentage: segmentTotalCount > 0 ? ((s.count ?? 0) / segmentTotalCount) * 100 : 0,
    revenue: s.revenue ?? 0,
    avgLifetimeValue: (s.count ?? 0) > 0 ? (s.revenue ?? 0) / (s.count ?? 1) : 0,
    color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
  }));

  // By-industry breakdown (replaces acquisition channels panel)
  const byIndustry: Array<{ industry: string; count: number; revenue: number }> = analytics?.byIndustry ?? [];
  const industryTotalCount = byIndustry.reduce((sum, i) => sum + (i.count ?? 0), 0);
  const industryBreakdown = byIndustry.map((i, index) => ({
    label: i.industry,
    count: i.count ?? 0,
    revenue: i.revenue ?? 0,
    percentage: industryTotalCount > 0 ? ((i.count ?? 0) / industryTotalCount) * 100 : 0,
    color: BAR_COLORS[index % BAR_COLORS.length],
  }));

  // By-region breakdown (replaces health distribution panel)
  const byRegion: Array<{ region: string; count: number; revenue: number }> = analytics?.byRegion ?? [];
  const regionTotalCount = byRegion.reduce((sum, r) => sum + (r.count ?? 0), 0);
  const regionBreakdown = byRegion.map((r, index) => ({
    label: r.region,
    count: r.count ?? 0,
    revenue: r.revenue ?? 0,
    percentage: regionTotalCount > 0 ? ((r.count ?? 0) / regionTotalCount) * 100 : 0,
    color: BAR_COLORS[index % BAR_COLORS.length],
  }));

  // Lifecycle stages from byLifecycleStage
  const byLifecycleStage: Array<{ stage: string; count: number }> = analytics?.byLifecycleStage ?? [];
  const lifecycleStages = byLifecycleStage.map((l, index) => ({
    stage: l.stage,
    count: l.count ?? 0,
    color: LIFECYCLE_COLORS[index % LIFECYCLE_COLORS.length],
  }));

  // Top customers from topCustomers
  const topCustomers: Array<{ id: string; name: string; segment: string; industry: string; lifetimeValue: number; totalOrders: number }> =
    analytics?.topCustomers ?? [];

  return (
    <div className="w-full h-full px-3 py-2 ">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading analytics…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
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
              <span className="text-sm font-medium text-gray-600">Total Customers</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalCustomers.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Active Customers</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{activeCustomers.toLocaleString()}</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${(totalRevenue / 1000000).toFixed(2)}M
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Avg LTV</span>
              <DollarSign className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${(avgLifetimeValue / 1000).toFixed(0)}K
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Orders</span>
              <ShoppingCart className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalOrders.toLocaleString()}</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Avg Revenue</span>
              <Repeat className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${(avgRevPerCustomer / 1000).toFixed(1)}K
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-8">
          {/* Customers by Industry */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Customers by Industry
            </h2>
            <div className="space-y-3">
              {industryBreakdown.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-900">{item.label}</span>
                    <div className="text-right">
                      <span className="text-gray-900">{item.count} customers</span>
                      <span className="text-gray-600 ml-2">({item.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${item.color} h-full rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 w-20 text-right">${(item.revenue / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customers by Region */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Customers by Region
            </h2>
            <div className="space-y-2">
              {regionBreakdown.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-900">{item.label}</span>
                    <div className="text-right">
                      <span className="text-gray-900">{item.count} customers</span>
                      <span className="text-gray-600 ml-2">({item.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${item.color} h-full rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 w-20 text-right">${(item.revenue / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Segments */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Customer Segments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {customerSegments.map((segment, index) => (
              <div key={index} className={`bg-gradient-to-br ${segment.color} rounded-lg p-3 text-white`}>
                <h3 className="text-xl font-bold mb-2">{segment.segment}</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm opacity-90">Customers</div>
                    <div className="text-2xl font-bold">{segment.count} ({segment.percentage.toFixed(1)}%)</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Revenue</div>
                    <div className="text-xl font-bold">${(segment.revenue / 1000000).toFixed(2)}M</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Avg LTV</div>
                    <div className="text-xl font-bold">${(segment.avgLifetimeValue / 1000).toFixed(0)}K</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers & Lifecycle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-8">
          {/* Top Customers */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Top Customers by Lifetime Value
            </h2>
            <div className="space-y-3">
              {topCustomers.map((customer, index) => (
                <div key={customer.id ?? index} className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-400' : 'bg-blue-500'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{customer.name}</div>
                        <div className="text-xs text-gray-600">
                          {customer.segment}{customer.industry ? ` · ${customer.industry}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">${((customer.lifetimeValue ?? 0) / 1000).toFixed(0)}K</div>
                      <span className="text-xs text-gray-600">{customer.totalOrders ?? 0} orders</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lifecycle Stages */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Lifecycle Stages
            </h2>
            <div className="space-y-3">
              {lifecycleStages.map((stage, index) => (
                <div key={index} className={`bg-gradient-to-r ${stage.color} rounded-lg p-3 text-white`}>
                  <div className="flex justify-between items-center">
                    <div className="font-semibold">{stage.stage}</div>
                    <div className="text-2xl font-bold">{stage.count}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
