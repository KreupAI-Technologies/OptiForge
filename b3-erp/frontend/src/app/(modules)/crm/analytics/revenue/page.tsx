'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Target, BarChart3, Activity, PieChart } from 'lucide-react';
import crmService from '@/services/crm.service';

export default function RevenueAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedView, setSelectedView] = useState<'stacked' | 'trend'>('stacked');
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    crmService.analyticsViews
      .getRevenue()
      .then((result) => {
        if (cancelled) return;
        setAnalytics(result);
      })
      .catch(() => {
        if (cancelled) return;
        setAnalytics(null);
        setLoadError('Failed to load revenue analytics. Please try again.');
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Backend-derived values (safe fallbacks) ----
  const realizedRevenue: number = analytics?.realizedRevenue ?? 0;
  const wonRevenue: number = analytics?.wonRevenue ?? 0;
  const pipelineValue: number = analytics?.pipelineValue ?? 0;
  const weightedPipeline: number = analytics?.weightedPipeline ?? 0;
  const wonCount: number = analytics?.wonCount ?? 0;
  const openCount: number = analytics?.openCount ?? 0;
  const avgWonValue: number = wonCount > 0 ? wonRevenue / wonCount : 0;

  const byMonthRaw: Array<{ month: string; revenue: number }> = analytics?.byMonth ?? [];
  const bySegmentRaw: Array<{ segment: string; revenue: number }> = analytics?.bySegment ?? [];

  // Monthly revenue driven by backend byMonth (single revenue value per month)
  const monthlyRevenue = byMonthRaw.map((m) => ({
    month: m?.month ?? '',
    total: m?.revenue ?? 0,
  }));

  // Revenue by segment driven by backend bySegment
  const segmentTotal = bySegmentRaw.reduce((sum, s) => sum + (s?.revenue ?? 0), 0);
  const segmentColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-teal-500'];
  const revenueBySegment = bySegmentRaw.map((s, i) => {
    const revenue = s?.revenue ?? 0;
    return {
      segment: s?.segment ?? '',
      revenue,
      percentage: segmentTotal > 0 ? (revenue / segmentTotal) * 100 : 0,
      color: segmentColors[i % segmentColors.length],
    };
  });

  const maxRevenue = monthlyRevenue.length ? Math.max(...monthlyRevenue.map((m) => m.total)) : 0;

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
              <span className="text-sm font-medium text-gray-600">Realized Revenue</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              ${(realizedRevenue / 1000000).toFixed(2)}M
            </div>
            <div className="text-xs text-gray-500">Recognized to date</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Won Revenue</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              ${(wonRevenue / 1000000).toFixed(2)}M
            </div>
            <div className="text-xs text-gray-500">{wonCount} deals won</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Pipeline Value</span>
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              ${(pipelineValue / 1000000).toFixed(2)}M
            </div>
            <div className="text-xs text-gray-500">{openCount} open deals</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Weighted Pipeline</span>
              <Target className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              ${(weightedPipeline / 1000000).toFixed(2)}M
            </div>
            <div className="text-xs text-gray-500">Probability-adjusted</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Open Deals</span>
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {openCount}
            </div>
            <div className="text-xs text-gray-500">In pipeline</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Avg Won Value</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              ${(avgWonValue / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-gray-500">Per won deal</div>
          </div>
        </div>

        {/* Revenue Breakdown Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Monthly Revenue Breakdown
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedView('stacked')}
                className={`px-3 py-1 rounded text-xs font-medium ${
                  selectedView === 'stacked' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Stacked
              </button>
              <button
                onClick={() => setSelectedView('trend')}
                className={`px-3 py-1 rounded text-xs font-medium ${
                  selectedView === 'trend' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Trend
              </button>
            </div>
          </div>

          {monthlyRevenue.length === 0 ? (
            <div className="text-sm text-gray-500 py-8 text-center">No monthly revenue data available.</div>
          ) : selectedView === 'stacked' ? (
            <div className="space-y-3">
              {monthlyRevenue.map((data, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-900">{data.month}</span>
                    <span className="font-semibold text-gray-900">${(data.total / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex w-full bg-gray-100 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-end pr-3 text-xs text-white font-semibold"
                      style={{ width: `${maxRevenue > 0 ? (data.total / maxRevenue) * 100 : 0}%` }}
                      title={`Revenue: $${(data.total / 1000).toFixed(0)}K`}
                    >
                      ${(data.total / 1000).toFixed(0)}K
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {monthlyRevenue.map((data, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-600 w-8">{data.month}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full flex items-center justify-end pr-3"
                      style={{ width: `${maxRevenue > 0 ? (data.total / maxRevenue) * 100 : 0}%` }}
                    >
                      <span className="text-xs font-semibold text-white">
                        ${(data.total / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue by Segment & Pipeline Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-8">
          {/* Revenue by Customer Segment */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Revenue by Segment
            </h2>
            {revenueBySegment.length === 0 ? (
              <div className="text-sm text-gray-500 py-8 text-center">No segment data available.</div>
            ) : (
              <div className="space-y-2">
                {revenueBySegment.map((segment, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-900">{segment.segment}</span>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">${(segment.revenue / 1000).toFixed(0)}K</span>
                        <span className="text-gray-600 ml-2">({segment.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`${segment.color} h-full rounded-full`}
                        style={{ width: `${segment.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pipeline Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Pipeline Summary
            </h2>
            <div className="space-y-2">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Pipeline Value</span>
                <span className="font-bold text-gray-900">${(pipelineValue / 1000000).toFixed(2)}M</span>
              </div>
              <div className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Weighted Pipeline</span>
                <span className="font-bold text-gray-900">${(weightedPipeline / 1000000).toFixed(2)}M</span>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Won Revenue</span>
                <span className="font-bold text-gray-900">${(wonRevenue / 1000000).toFixed(2)}M</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Deals (Won / Open)</span>
                <span className="font-bold text-gray-900">{wonCount} / {openCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
