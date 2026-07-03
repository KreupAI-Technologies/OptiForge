'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, Target, Activity, BarChart3, PieChart } from 'lucide-react';
import crmService from '@/services/crm.service';

interface MetricData {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
}

interface ChartDataPoint {
  month: string;
  value: number;
}

interface LeadStatusBucket {
  status: string;
  count: number;
}

interface CRMAnalyticsOverview {
  totalLeads: number;
  openLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
  totalCustomers: number;
  activeCustomers: number;
  pipelineValue: number;
  wonValue: number;
  customerRevenue: number;
  leadsByStatus: LeadStatusBucket[];
}

// Cosmetic palette applied to lead-status buckets in the status chart.
const STATUS_COLORS = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-yellow-500 to-yellow-600',
  'from-orange-500 to-orange-600',
  'from-green-500 to-green-600',
  'from-teal-500 to-teal-600',
  'from-pink-500 to-pink-600',
];

export default function CRMAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [analytics, setAnalytics] = useState<CRMAnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadAnalytics = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const result = await crmService.analyticsViews.getOverview();
        if (!cancelled) {
          setAnalytics(result as CRMAnalyticsOverview);
        }
      } catch (err) {
        if (!cancelled) {
          setAnalytics(null);
          setLoadError('Failed to load CRM analytics. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  // Derived lead-status data for the status chart, sourced from the backend.
  const leadsByStatus: LeadStatusBucket[] = analytics?.leadsByStatus ?? [];
  const maxStatusCount = Math.max(1, ...leadsByStatus.map((s) => s.count));

  // Customer Acquisition
  const customerAcquisition = [
    { source: 'Website', count: 345, percentage: 38.2, color: 'bg-blue-500' },
    { source: 'Referrals', count: 287, percentage: 31.8, color: 'bg-green-500' },
    { source: 'Social Media', count: 156, percentage: 17.3, color: 'bg-purple-500' },
    { source: 'Email Campaign', count: 89, percentage: 9.9, color: 'bg-yellow-500' },
    { source: 'Other', count: 26, percentage: 2.8, color: 'bg-gray-500' },
  ];

  // Top Performers
  const topPerformers = [
    { name: 'Sarah Johnson', deals: 34, revenue: 850000, winRate: 72 },
    { name: 'Michael Chen', deals: 28, revenue: 720000, winRate: 68 },
    { name: 'David Park', deals: 25, revenue: 650000, winRate: 64 },
    { name: 'Emily Davis', deals: 22, revenue: 580000, winRate: 61 },
  ];

  // Activity Metrics
  const activityMetrics = [
    { type: 'Calls', count: 1247, target: 1200, percentage: 103.9 },
    { type: 'Meetings', count: 234, target: 250, percentage: 93.6 },
    { type: 'Emails', count: 3456, target: 3000, percentage: 115.2 },
    { type: 'Tasks', count: 567, target: 600, percentage: 94.5 },
  ];

  // Customer Segments
  const customerSegments = [
    { segment: 'Enterprise', count: 156, revenue: 1250000, avgDeal: 8013 },
    { segment: 'Mid-Market', count: 342, revenue: 890000, avgDeal: 2602 },
    { segment: 'Small Business', count: 749, revenue: 310000, avgDeal: 414 },
  ];

  return (
    <div className="w-full h-full px-3 py-2 ">
      {isLoading && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span>Loading analytics…</span>
        </div>
      )}
      {loadError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Customer Revenue</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              ${((analytics?.customerRevenue ?? 0) / 1000000).toFixed(2)}M
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span>Won value: ${((analytics?.wonValue ?? 0) / 1000000).toFixed(2)}M</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Customers</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {(analytics?.totalCustomers ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span>{(analytics?.activeCustomers ?? 0).toLocaleString()} active</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Won Leads</span>
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {(analytics?.wonLeads ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span>{(analytics?.totalLeads ?? 0).toLocaleString()} total leads</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Conversion Rate</span>
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {(analytics?.conversionRate ?? 0).toFixed(1)}%
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span>{(analytics?.openLeads ?? 0).toLocaleString()} open · {(analytics?.lostLeads ?? 0).toLocaleString()} lost</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-8">
          {/* Pipeline Value Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Pipeline &amp; Revenue
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                <div className="text-xs text-gray-600 mb-1">Open Pipeline Value</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${((analytics?.pipelineValue ?? 0) / 1000000).toFixed(2)}M
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-100">
                <div className="text-xs text-gray-600 mb-1">Won Value</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${((analytics?.wonValue ?? 0) / 1000000).toFixed(2)}M
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-100">
                <div className="text-xs text-gray-600 mb-1">Customer Revenue</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${((analytics?.customerRevenue ?? 0) / 1000000).toFixed(2)}M
                </div>
              </div>
            </div>
          </div>

          {/* Leads by Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Leads by Status
            </h2>
            <div className="space-y-2">
              {leadsByStatus.length === 0 ? (
                <p className="text-sm text-gray-500">No lead data available.</p>
              ) : (
                leadsByStatus.map((bucket, index) => (
                  <div key={bucket.status ?? index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-900">{bucket.status}</span>
                      <span className="text-gray-600">{bucket.count} leads</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${STATUS_COLORS[index % STATUS_COLORS.length]} h-full rounded-full`}
                        style={{ width: `${(bucket.count / maxStatusCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Customer Acquisition & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-8">
          {/* Customer Acquisition Sources */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Customer Acquisition Sources
            </h2>
            <div className="space-y-2">
              {customerAcquisition.map((source, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-900">{source.source}</span>
                    <span className="text-gray-600">{source.count} ({source.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${source.color} h-full rounded-full`}
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Metrics
            </h2>
            <div className="space-y-2">
              {activityMetrics.map((metric, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-900">{metric.type}</span>
                    <span className={`font-semibold ${
                      metric.percentage >= 100 ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {metric.count} / {metric.target} ({metric.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        metric.percentage >= 100 ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(metric.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers & Customer Segments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Top Performers */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Performers
            </h2>
            <div className="space-y-2">
              {topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-400' : 'bg-blue-500'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{performer.name}</div>
                      <div className="text-sm text-gray-600">{performer.deals} deals closed</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">${(performer.revenue / 1000).toFixed(0)}K</div>
                    <div className="text-sm text-green-600">{performer.winRate}% win rate</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Segments */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Customer Segments
            </h2>
            <div className="space-y-2">
              {customerSegments.map((segment, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{segment.segment}</h3>
                      <p className="text-sm text-gray-600">{segment.count} customers</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">${(segment.revenue / 1000).toFixed(0)}K</div>
                      <div className="text-xs text-gray-600">total revenue</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-blue-100">
                    <span className="text-sm text-gray-600">Avg Deal Size</span>
                    <span className="font-semibold text-gray-900">${segment.avgDeal.toLocaleString()}</span>
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
