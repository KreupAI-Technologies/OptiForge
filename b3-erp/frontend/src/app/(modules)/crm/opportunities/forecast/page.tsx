'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { crmService } from '@/services/crm.service';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  Users,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Percent,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';

interface ForecastPeriod {
  month: string;
  committed: number;
  bestCase: number;
  pipeline: number;
  closed: number;
  target: number;
  opportunities: number;
}

interface TeamMember {
  name: string;
  committed: number;
  bestCase: number;
  pipeline: number;
  quota: number;
  opportunities: number;
  winRate: number;
}

export default function SalesForecastPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('quarter');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [forecastData, setForecastData] = useState<ForecastPeriod[]>([]);
  const [teamForecast, setTeamForecast] = useState<TeamMember[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await crmService.crmAnalytics.getForecast();
        if (!mounted) return;
        const byMonth = Array.isArray(data?.byMonth) ? data.byMonth : [];
        const mapped: ForecastPeriod[] = byMonth.map((m: any) => ({
          month: m?.month ?? '',
          committed: Number(m?.weighted ?? 0),
          bestCase: Number(m?.value ?? 0),
          pipeline: Number(m?.value ?? 0),
          closed: 0,
          target: 0,
          opportunities: Number(m?.count ?? 0),
        }));
        setError(null);
        setForecastData(mapped);
        setTeamForecast([]);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to load forecast data');
        setForecastData([]);
        setTeamForecast([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Calculate quarterly totals
  const quarterlyStats = {
    committed: forecastData.slice(0, 3).reduce((sum, period) => sum + period.committed, 0),
    bestCase: forecastData.slice(0, 3).reduce((sum, period) => sum + period.bestCase, 0),
    pipeline: forecastData.slice(0, 3).reduce((sum, period) => sum + period.pipeline, 0),
    closed: forecastData.slice(0, 3).reduce((sum, period) => sum + period.closed, 0),
    target: forecastData.slice(0, 3).reduce((sum, period) => sum + period.target, 0),
  };

  // Calculate team totals
  const teamStats = {
    totalCommitted: teamForecast.reduce((sum, member) => sum + member.committed, 0),
    totalBestCase: teamForecast.reduce((sum, member) => sum + member.bestCase, 0),
    totalPipeline: teamForecast.reduce((sum, member) => sum + member.pipeline, 0),
    totalQuota: teamForecast.reduce((sum, member) => sum + member.quota, 0),
    avgWinRate: teamForecast.length
      ? teamForecast.reduce((sum, member) => sum + member.winRate, 0) / teamForecast.length
      : 0,
  };

  // Attainment calculations
  const committedAttainment = quarterlyStats.target ? (quarterlyStats.committed / quarterlyStats.target) * 100 : 0;
  const bestCaseAttainment = quarterlyStats.target ? (quarterlyStats.bestCase / quarterlyStats.target) * 100 : 0;
  const currentAttainment = quarterlyStats.target ? (quarterlyStats.closed / quarterlyStats.target) * 100 : 0;

  const getAttainmentColor = (attainment: number) => {
    if (attainment >= 100) return 'text-green-600';
    if (attainment >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttainmentBgColor = (attainment: number) => {
    if (attainment >= 100) return 'bg-green-500';
    if (attainment >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      {error && (<div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>)}
      {/* Period Selector */}
      <div className="mb-3 bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Forecast Period:</span>
          <div className="flex space-x-2">
            {['month', 'quarter', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          <span className="ml-auto text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-600">Committed</p>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">
            ${(quarterlyStats.committed / 1000).toFixed(0)}K
          </p>
          <div className="mt-2 flex items-center">
            <div
              className={`text-sm font-semibold ${getAttainmentColor(committedAttainment)}`}
            >
              {committedAttainment.toFixed(0)}% of target
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-600">Best Case</p>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">
            ${(quarterlyStats.bestCase / 1000).toFixed(0)}K
          </p>
          <div className="mt-2 flex items-center">
            <div className={`text-sm font-semibold ${getAttainmentColor(bestCaseAttainment)}`}>
              {bestCaseAttainment.toFixed(0)}% of target
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-purple-600">Total Pipeline</p>
            <Target className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-900">
            ${(quarterlyStats.pipeline / 1000).toFixed(0)}K
          </p>
          <div className="mt-2 text-sm text-purple-700">
            {(quarterlyStats.target ? (quarterlyStats.pipeline / quarterlyStats.target) * 100 : 0).toFixed(0)}% of target
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-indigo-600">Target</p>
            <Award className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-900">
            ${(quarterlyStats.target / 1000).toFixed(0)}K
          </p>
          <div className="mt-2 text-sm text-indigo-700">Q4 2025 Goal</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-emerald-600">Closed</p>
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-900">
            ${(quarterlyStats.closed / 1000).toFixed(0)}K
          </p>
          <div className="mt-2 flex items-center">
            <div className={`text-sm font-semibold ${getAttainmentColor(currentAttainment)}`}>
              {currentAttainment.toFixed(0)}% achieved
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Confidence Indicator */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Forecast Accuracy</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Committed (75%+ prob)</span>
              <span className="text-sm font-bold text-green-700">
                ${(quarterlyStats.committed / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-3 bg-green-500 rounded-full"
                style={{
                  width: `${Math.min(quarterlyStats.target ? (quarterlyStats.committed / quarterlyStats.target) * 100 : 0, 100)}%`,
                }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Best Case (40%+ prob)</span>
              <span className="text-sm font-bold text-blue-700">
                ${(quarterlyStats.bestCase / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-3 bg-blue-500 rounded-full"
                style={{
                  width: `${Math.min(quarterlyStats.target ? (quarterlyStats.bestCase / quarterlyStats.target) * 100 : 0, 100)}%`,
                }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Pipeline (All)</span>
              <span className="text-sm font-bold text-purple-700">
                ${(quarterlyStats.pipeline / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-3 bg-purple-500 rounded-full"
                style={{
                  width: `${Math.min(quarterlyStats.target ? (quarterlyStats.pipeline / quarterlyStats.target) * 100 : 0, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 mb-3 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Monthly Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Month
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Target
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Closed
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Committed
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Best Case
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Pipeline
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Opportunities
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Attainment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {forecastData.map((period, index) => {
                const attainment = period.target ? ((period.committed + period.closed) / period.target) * 100 : 0;
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-semibold text-gray-900">{period.month}</td>
                    <td className="px-3 py-2 text-gray-700">${(period.target / 1000).toFixed(0)}K</td>
                    <td className="px-3 py-2">
                      <span className="font-semibold text-green-700">
                        ${(period.closed / 1000).toFixed(0)}K
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-semibold text-green-600">
                        ${(period.committed / 1000).toFixed(0)}K
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-semibold text-blue-600">
                        ${(period.bestCase / 1000).toFixed(0)}K
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-semibold text-purple-600">
                        ${(period.pipeline / 1000).toFixed(0)}K
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {period.opportunities}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                          <div
                            className={`h-2 rounded-full ${getAttainmentBgColor(attainment)}`}
                            style={{ width: `${Math.min(attainment, 100)}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-bold ${getAttainmentColor(attainment)}`}>
                          {attainment.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Forecast */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Team Forecast</h2>
            <p className="text-sm text-gray-600 mt-1">Individual rep performance and projections</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Team Avg Win Rate</p>
            <p className="text-2xl font-bold text-blue-900">{teamStats.avgWinRate.toFixed(0)}%</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Sales Rep
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Quota
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Committed
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Best Case
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Pipeline
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Opportunities
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Win Rate
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Quota Attainment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teamForecast.map((member, index) => {
                const attainment = member.quota ? (member.committed / member.quota) * 100 : 0;
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-3">
                          {member.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="font-semibold text-gray-900">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-700">${(member.quota / 1000).toFixed(0)}K</td>
                    <td className="px-3 py-2">
                      <span className="font-semibold text-green-600">
                        ${(member.committed / 1000).toFixed(0)}K
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-semibold text-blue-600">
                        ${(member.bestCase / 1000).toFixed(0)}K
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-semibold text-purple-600">
                        ${(member.pipeline / 1000).toFixed(0)}K
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {member.opportunities}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-semibold text-gray-900">{member.winRate}%</span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                          <div
                            className={`h-2 rounded-full ${getAttainmentBgColor(attainment)}`}
                            style={{ width: `${Math.min(attainment, 100)}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-bold ${getAttainmentColor(attainment)}`}>
                          {attainment.toFixed(0)}%
                        </span>
                        {attainment >= 100 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                        )}
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
}
