'use client';

import React, { useState, useEffect } from 'react';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface SLAPerformance {
  month: string;
  responseTimeSLA: number; // percentage
  resolutionTimeSLA: number; // percentage
  avgResponseTime: number; // hours
  avgResolutionTime: number; // hours
}

interface ContractRenewal {
  status: 'Expiring Soon' | 'Renewal In Progress' | 'Renewed' | 'Not Renewed';
  count: number;
  value: number;
}

interface EngineerPerformance {
  engineerId: string;
  engineerName: string;
  completedJobs: number;
  avgResolutionTime: number; // hours
  customerRating: number; // 1-5
  slaCompliance: number; // percentage
}

interface ServiceTypeBreakdown {
  type: string;
  count: number;
  percentage: number;
  revenue: number;
}

interface CustomerSatisfaction {
  month: string;
  npsScore: number; // -100 to 100
  csatScore: number; // 1-5
  responseRate: number; // percentage
}

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('Last 6 Months');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Mock Data
  const slaPerformanceData: SLAPerformance[] = [
    { month: 'Sep', responseTimeSLA: 92, resolutionTimeSLA: 88, avgResponseTime: 3.2, avgResolutionTime: 18.5 },
    { month: 'Oct', responseTimeSLA: 89, resolutionTimeSLA: 85, avgResponseTime: 3.8, avgResolutionTime: 21.2 },
    { month: 'Nov', responseTimeSLA: 94, resolutionTimeSLA: 91, avgResponseTime: 2.9, avgResolutionTime: 16.8 },
    { month: 'Dec', responseTimeSLA: 91, resolutionTimeSLA: 87, avgResponseTime: 3.5, avgResolutionTime: 19.3 },
    { month: 'Jan', responseTimeSLA: 95, resolutionTimeSLA: 93, avgResponseTime: 2.7, avgResolutionTime: 15.4 },
    { month: 'Feb', responseTimeSLA: 96, resolutionTimeSLA: 94, avgResponseTime: 2.5, avgResolutionTime: 14.2 },
  ];

  const contractRenewalData: ContractRenewal[] = [
    { status: 'Expiring Soon', count: 8, value: 1850000 },
    { status: 'Renewal In Progress', count: 5, value: 1200000 },
    { status: 'Renewed', count: 12, value: 3450000 },
    { status: 'Not Renewed', count: 3, value: 680000 },
  ];

  // Engineer performance table loaded from the after-sales analytics endpoint.
  const [engineerPerformanceData, setEngineerPerformanceData] = useState<EngineerPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await AfterSalesPagesService.technicians()) as any[];
        const mapped: EngineerPerformance[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
          engineerId: String(r?.employeeId ?? r?.id ?? ''),
          engineerName: r?.name ?? '',
          completedJobs: Number(r?.totalServices ?? r?.completedJobs ?? 0) || 0,
          avgResolutionTime: Number(r?.avgResolutionTime ?? 0) || 0,
          customerRating: Number(r?.rating ?? r?.customerRating ?? 0) || 0,
          slaCompliance: Number(r?.completionRate ?? r?.slaCompliance ?? 0) || 0,
        }));
        if (!cancelled) setEngineerPerformanceData(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load engineer performance');
          setEngineerPerformanceData([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const serviceTypeData: ServiceTypeBreakdown[] = [
    { type: 'Installation', count: 45, percentage: 22.5, revenue: 2850000 },
    { type: 'Repair', count: 78, percentage: 39.0, revenue: 1950000 },
    { type: 'Maintenance', count: 52, percentage: 26.0, revenue: 3200000 },
    { type: 'Inspection', count: 25, percentage: 12.5, revenue: 650000 },
  ];

  const customerSatisfactionData: CustomerSatisfaction[] = [
    { month: 'Sep', npsScore: 42, csatScore: 4.2, responseRate: 68 },
    { month: 'Oct', npsScore: 38, csatScore: 4.1, responseRate: 65 },
    { month: 'Nov', npsScore: 45, csatScore: 4.4, responseRate: 72 },
    { month: 'Dec', npsScore: 48, csatScore: 4.5, responseRate: 75 },
    { month: 'Jan', npsScore: 52, csatScore: 4.6, responseRate: 78 },
    { month: 'Feb', npsScore: 55, csatScore: 4.7, responseRate: 82 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTrend = (data: number[]) => {
    if (data.length < 2) return 0;
    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    return ((latest - previous) / previous) * 100;
  };

  const responseTrend = calculateTrend(slaPerformanceData.map(d => d.responseTimeSLA));
  const resolutionTrend = calculateTrend(slaPerformanceData.map(d => d.resolutionTimeSLA));
  const npsTrend = calculateTrend(customerSatisfactionData.map(d => d.npsScore));

  const maxSLA = 100;
  const maxRevenue = Math.max(...serviceTypeData.map(d => d.revenue));

  return (
    <div className="p-6 space-y-3 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Performance insights and business intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Last 3 Months</option>
              <option>Last 6 Months</option>
              <option>Last 12 Months</option>
              <option>This Year</option>
              <option>Custom Range</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Response SLA</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {slaPerformanceData[slaPerformanceData.length - 1].responseTimeSLA}%
          </div>
          <div className="flex items-center gap-1 mt-1">
            {responseTrend >= 0 ? (
              <TrendingUp className="w-3 h-3 text-green-600" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-600" />
            )}
            <span className={`text-xs ${responseTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(responseTrend).toFixed(1)}% from last month
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Resolution SLA</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {slaPerformanceData[slaPerformanceData.length - 1].resolutionTimeSLA}%
          </div>
          <div className="flex items-center gap-1 mt-1">
            {resolutionTrend >= 0 ? (
              <TrendingUp className="w-3 h-3 text-green-600" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-600" />
            )}
            <span className={`text-xs ${resolutionTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(resolutionTrend).toFixed(1)}% from last month
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">NPS Score</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {customerSatisfactionData[customerSatisfactionData.length - 1].npsScore}
          </div>
          <div className="flex items-center gap-1 mt-1">
            {npsTrend >= 0 ? (
              <TrendingUp className="w-3 h-3 text-green-600" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-600" />
            )}
            <span className={`text-xs ${npsTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(npsTrend).toFixed(1)}% from last month
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Response Time</span>
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {slaPerformanceData[slaPerformanceData.length - 1].avgResponseTime.toFixed(1)}h
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Target: 4h or less
          </div>
        </div>
      </div>

      {/* SLA Performance Trend */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">SLA Performance Trend</h2>
            <p className="text-sm text-gray-500 mt-1">Response and resolution time compliance over time</p>
          </div>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>

        <div className="space-y-3">
          {/* Response Time SLA Chart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Response Time SLA Compliance</span>
              <span className="text-sm text-gray-500">Target: 90%+</span>
            </div>
            <div className="h-40 flex items-end justify-between gap-3">
              {slaPerformanceData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gray-100 rounded relative group">
                    <div
                      className="w-full bg-blue-500 rounded transition-all duration-500 hover:bg-blue-600"
                      style={{ height: `${(data.responseTimeSLA / maxSLA) * 140}px` }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {data.responseTimeSLA}%
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{data.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resolution Time SLA Chart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Resolution Time SLA Compliance</span>
              <span className="text-sm text-gray-500">Target: 85%+</span>
            </div>
            <div className="h-40 flex items-end justify-between gap-3">
              {slaPerformanceData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gray-100 rounded relative group">
                    <div
                      className="w-full bg-green-500 rounded transition-all duration-500 hover:bg-green-600"
                      style={{ height: `${(data.resolutionTimeSLA / maxSLA) * 140}px` }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {data.resolutionTimeSLA}%
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contract Renewal Pipeline & Service Type Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Contract Renewal Pipeline */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Contract Renewal Pipeline</h2>
              <p className="text-sm text-gray-500 mt-1">Current renewal status overview</p>
            </div>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-2">
            {contractRenewalData.map((item, index) => {
              const totalContracts = contractRenewalData.reduce((sum, d) => sum + d.count, 0);
              const percentage = (item.count / totalContracts) * 100;
              const colors = {
                'Expiring Soon': 'bg-orange-500',
                'Renewal In Progress': 'bg-yellow-500',
                'Renewed': 'bg-green-500',
                'Not Renewed': 'bg-red-500',
              };
              const bgColors = {
                'Expiring Soon': 'bg-orange-50',
                'Renewal In Progress': 'bg-yellow-50',
                'Renewed': 'bg-green-50',
                'Not Renewed': 'bg-red-50',
              };

              return (
                <div key={index} className={`p-4 rounded-lg ${bgColors[item.status]}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{item.status}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.count} contracts</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${colors[item.status]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{percentage.toFixed(1)}% of total</span>
                    <span className="text-xs font-medium text-gray-900">{formatCurrency(item.value)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total Pipeline Value</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(contractRenewalData.reduce((sum, d) => sum + d.value, 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Service Type Breakdown */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Service Type Breakdown</h2>
              <p className="text-sm text-gray-500 mt-1">Distribution by service category</p>
            </div>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>

          {/* Visual Pie Chart Representation */}
          <div className="flex items-center justify-center mb-3">
            <div className="relative w-48 h-48">
              {serviceTypeData.map((item, index) => {
                const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
                const total = serviceTypeData.reduce((sum, d) => sum + d.count, 0);
                const startAngle = serviceTypeData
                  .slice(0, index)
                  .reduce((sum, d) => sum + (d.count / total) * 360, 0);
                const sweepAngle = (item.count / total) * 360;

                return (
                  <div
                    key={index}
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(from ${startAngle}deg, ${colors[index]} 0deg, ${colors[index]} ${sweepAngle}deg, transparent ${sweepAngle}deg)`,
                    }}
                  />
                );
              })}
              <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {serviceTypeData.reduce((sum, d) => sum + d.count, 0)}
                  </div>
                  <div className="text-xs text-gray-500">Total Jobs</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {serviceTypeData.map((item, index) => {
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors[index]}`} />
                    <span className="text-sm text-gray-700">{item.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{item.count} ({item.percentage}%)</span>
                    <span className="text-sm text-gray-600">{formatCurrency(item.revenue)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total Revenue</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(serviceTypeData.reduce((sum, d) => sum + d.revenue, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Engineer Performance Leaderboard */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Engineer Performance Leaderboard</h2>
            <p className="text-sm text-gray-500 mt-1">Top performers based on jobs completed and customer ratings</p>
          </div>
          <Users className="w-5 h-5 text-gray-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engineer</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Jobs Completed</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Avg Resolution Time</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Customer Rating</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">SLA Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {engineerPerformanceData
                .sort((a, b) => b.completedJobs - a.completedJobs)
                .map((engineer, index) => (
                  <tr key={engineer.engineerId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {index === 0 && <span className="text-xl">🥇</span>}
                        {index === 1 && <span className="text-xl">🥈</span>}
                        {index === 2 && <span className="text-xl">🥉</span>}
                        {index > 2 && <span className="text-sm font-medium text-gray-600">{index + 1}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{engineer.engineerName}</div>
                        <div className="text-xs text-gray-500">{engineer.engineerId}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-semibold text-gray-900">{engineer.completedJobs}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-gray-600">{engineer.avgResolutionTime.toFixed(1)}h</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-sm font-medium text-gray-900">{engineer.customerRating.toFixed(1)}</span>
                        <span className="text-yellow-500">⭐</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${engineer.slaCompliance >= 95 ? 'bg-green-500' :
                                engineer.slaCompliance >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                            style={{ width: `${engineer.slaCompliance}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{engineer.slaCompliance}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Satisfaction Trends */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Customer Satisfaction Trends</h2>
            <p className="text-sm text-gray-500 mt-1">NPS and CSAT scores over time</p>
          </div>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* NPS Score Trend */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Net Promoter Score (NPS)</h3>
            <div className="h-48 flex items-end justify-between gap-2">
              {customerSatisfactionData.map((data, index) => {
                const maxNPS = 100;
                const normalizedScore = ((data.npsScore + 100) / 200) * 100; // Convert -100 to 100 scale to 0-100%
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-100 rounded relative group">
                      <div
                        className="w-full bg-purple-500 rounded transition-all duration-500 hover:bg-purple-600"
                        style={{ height: `${(normalizedScore / 100) * 160}px` }}
                      >
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {data.npsScore}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">{data.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs text-gray-500">Scale: -100 to +100</span>
            </div>
          </div>

          {/* CSAT Score Trend */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Customer Satisfaction (CSAT)</h3>
            <div className="h-48 flex items-end justify-between gap-2">
              {customerSatisfactionData.map((data, index) => {
                const maxCSAT = 5;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-100 rounded relative group">
                      <div
                        className="w-full bg-indigo-500 rounded transition-all duration-500 hover:bg-indigo-600"
                        style={{ height: `${(data.csatScore / maxCSAT) * 160}px` }}
                      >
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {data.csatScore.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">{data.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs text-gray-500">Scale: 1 to 5</span>
            </div>
          </div>

          {/* Response Rate Trend */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Survey Response Rate</h3>
            <div className="h-48 flex items-end justify-between gap-2">
              {customerSatisfactionData.map((data, index) => {
                const maxRate = 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-100 rounded relative group">
                      <div
                        className="w-full bg-teal-500 rounded transition-all duration-500 hover:bg-teal-600"
                        style={{ height: `${(data.responseRate / maxRate) * 160}px` }}
                      >
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {data.responseRate}%
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">{data.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs text-gray-500">Target: 80%+</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-6 pt-6 border-t border-gray-200">
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Current NPS</div>
            <div className="text-2xl font-bold text-purple-600">
              {customerSatisfactionData[customerSatisfactionData.length - 1].npsScore}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {customerSatisfactionData[customerSatisfactionData.length - 1].npsScore >= 50 ? 'Excellent' :
                customerSatisfactionData[customerSatisfactionData.length - 1].npsScore >= 30 ? 'Good' :
                  customerSatisfactionData[customerSatisfactionData.length - 1].npsScore >= 0 ? 'Needs Improvement' : 'Critical'}
            </div>
          </div>
          <div className="bg-indigo-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Current CSAT</div>
            <div className="text-2xl font-bold text-indigo-600">
              {customerSatisfactionData[customerSatisfactionData.length - 1].csatScore.toFixed(1)} / 5.0
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round((customerSatisfactionData[customerSatisfactionData.length - 1].csatScore / 5) * 100)}% satisfaction
            </div>
          </div>
          <div className="bg-teal-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Response Rate</div>
            <div className="text-2xl font-bold text-teal-600">
              {customerSatisfactionData[customerSatisfactionData.length - 1].responseRate}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {customerSatisfactionData[customerSatisfactionData.length - 1].responseRate >= 80 ? 'Above target' : 'Below target'}
            </div>
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Insights & Recommendations</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span><strong>Excellent Performance:</strong> Response time SLA improved by {Math.abs(responseTrend).toFixed(1)}% - Continue current practices and recognize top performers.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">⚠</span>
                <span><strong>Renewal Pipeline:</strong> {contractRenewalData[0].count} contracts expiring soon worth {formatCurrency(contractRenewalData[0].value)} - Initiate proactive renewal campaigns.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">ℹ</span>
                <span><strong>Service Mix:</strong> Repair services dominate at {serviceTypeData[1].percentage}% - Consider upselling preventive maintenance contracts to reduce repair incidents.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span><strong>Customer Satisfaction:</strong> NPS trending upward to {customerSatisfactionData[customerSatisfactionData.length - 1].npsScore} - Customer experience initiatives showing positive results.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">★</span>
                <span><strong>Top Performer:</strong> {engineerPerformanceData[0].engineerName} leads with {engineerPerformanceData[0].completedJobs} jobs and {engineerPerformanceData[0].slaCompliance}% SLA compliance - Ideal for mentoring junior engineers.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
