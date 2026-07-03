'use client';

import { useState, useEffect } from 'react';
import { crmService } from '@/services/crm.service';
import { BarChart3, TrendingUp, TrendingDown, Activity, Phone, Mail, Users, MessageSquare, Calendar, Clock, Target, Award, AlertCircle, PieChart } from 'lucide-react';

interface AnalyticsData {
  period: string;
  calls: number;
  emails: number;
  meetings: number;
  notes: number;
  totalInteractions: number;
  responseRate: number;
  avgResponseTime: number;
}

interface TopPerformer {
  name: string;
  interactions: number;
  conversions: number;
  avgResponseTime: number;
  satisfactionScore: number;
}

interface InteractionMetrics {
  type: string;
  count: number;
  trend: number;
  avgDuration?: number;
  successRate: number;
}

export default function InteractionsAnalysisPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [interactionMetrics, setInteractionMetrics] = useState<InteractionMetrics[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await crmService.crmAnalytics.getInteractionAnalysis();
        if (!mounted) return;
        const byType = Array.isArray(data?.byType) ? data.byType : [];
        const byOutcome = Array.isArray(data?.byOutcome) ? data.byOutcome : [];
        const byPerformer = Array.isArray(data?.byPerformer) ? data.byPerformer : [];

        const metrics: InteractionMetrics[] = byType.map((t: any) => ({
          type: t?.type ?? '',
          count: Number(t?.count ?? 0),
          trend: 0,
          successRate: 0,
        }));

        const performers: TopPerformer[] = byPerformer.map((p: any) => ({
          name: p?.performer ?? '',
          interactions: Number(p?.count ?? 0),
          conversions: 0,
          avgResponseTime: 0,
          satisfactionScore: 0,
        }));

        const analytics: AnalyticsData[] = byOutcome.map((o: any) => ({
          period: o?.outcome ?? '',
          calls: 0,
          emails: 0,
          meetings: 0,
          notes: 0,
          totalInteractions: Number(o?.count ?? 0),
          responseRate: 0,
          avgResponseTime: 0,
        }));

        setError(null);
        setInteractionMetrics(metrics);
        setTopPerformers(performers);
        setAnalyticsData(analytics);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to load interaction analysis data');
        setInteractionMetrics([]);
        setTopPerformers([]);
        setAnalyticsData([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const currentPeriod = analyticsData[analyticsData.length - 1];
  const previousPeriod = analyticsData[analyticsData.length - 2];

  const calculateTrend = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const totalInteractionsTrend = calculateTrend(currentPeriod?.totalInteractions ?? 0, previousPeriod?.totalInteractions ?? 0);
  const responseRateTrend = calculateTrend(currentPeriod?.responseRate ?? 0, previousPeriod?.responseRate ?? 0);
  const avgResponseTimeTrend = calculateTrend(currentPeriod?.avgResponseTime ?? 0, previousPeriod?.avgResponseTime ?? 0);

  const interactionsByType = {
    calls: analyticsData.reduce((sum, d) => sum + d.calls, 0),
    emails: analyticsData.reduce((sum, d) => sum + d.emails, 0),
    meetings: analyticsData.reduce((sum, d) => sum + d.meetings, 0),
    notes: analyticsData.reduce((sum, d) => sum + d.notes, 0),
  };

  const totalInteractions = Object.values(interactionsByType).reduce((sum, count) => sum + count, 0);

  const getPercentage = (count: number) => (totalInteractions ? (count / totalInteractions) * 100 : 0).toFixed(1);

  return (
    <div className="w-full h-full px-3 py-2 ">
      {error && (<div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>)}
      <div className="mb-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${totalInteractionsTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalInteractionsTrend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(totalInteractionsTrend).toFixed(1)}%
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{currentPeriod?.totalInteractions ?? 0}</div>
            <div className="text-sm text-gray-600">Total Interactions</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${responseRateTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {responseRateTrend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(responseRateTrend).toFixed(1)}%
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{currentPeriod?.responseRate ?? 0}%</div>
            <div className="text-sm text-gray-600">Response Rate</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${avgResponseTimeTrend <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {avgResponseTimeTrend <= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(avgResponseTimeTrend).toFixed(1)}%
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{currentPeriod?.avgResponseTime ?? 0}h</div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {(interactionMetrics.length ? interactionMetrics.reduce((sum, m) => sum + m.successRate, 0) / interactionMetrics.length : 0).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Avg Success Rate</div>
          </div>
        </div>

        {/* Interaction Trends Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Interaction Trends</h2>
            <div className="space-y-2">
              {/* Simplified bar chart visualization */}
              {analyticsData.slice(-6).map((data, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{data.period}</span>
                    <span className="text-sm font-bold text-gray-900">{data.totalInteractions} interactions</span>
                  </div>
                  <div className="relative w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div className="absolute inset-y-0 left-0 flex">
                      <div
                        className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${data.totalInteractions ? (data.calls / data.totalInteractions) * 100 : 0}%` }}
                      >
                        {data.calls > 0 && data.calls}
                      </div>
                      <div
                        className="bg-orange-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${data.totalInteractions ? (data.emails / data.totalInteractions) * 100 : 0}%` }}
                      >
                        {data.emails > 0 && data.emails}
                      </div>
                      <div
                        className="bg-purple-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${data.totalInteractions ? (data.meetings / data.totalInteractions) * 100 : 0}%` }}
                      >
                        {data.meetings > 0 && data.meetings}
                      </div>
                      <div
                        className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${data.totalInteractions ? (data.notes / data.totalInteractions) * 100 : 0}%` }}
                      >
                        {data.notes > 0 && data.notes}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-3 mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Calls</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span className="text-sm text-gray-600">Emails</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-sm text-gray-600">Meetings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Notes</span>
              </div>
            </div>
          </div>

          {/* Interaction Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Distribution by Type</h2>
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Calls</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{getPercentage(interactionsByType.calls)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${getPercentage(interactionsByType.calls)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 mt-1">{interactionsByType.calls.toLocaleString()} total</div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">Emails</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{getPercentage(interactionsByType.emails)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: `${getPercentage(interactionsByType.emails)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 mt-1">{interactionsByType.emails.toLocaleString()} total</div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Meetings</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{getPercentage(interactionsByType.meetings)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${getPercentage(interactionsByType.meetings)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 mt-1">{interactionsByType.meetings.toLocaleString()} total</div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Notes</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{getPercentage(interactionsByType.notes)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${getPercentage(interactionsByType.notes)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 mt-1">{interactionsByType.notes.toLocaleString()} total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Interaction Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
          {interactionMetrics.map((metric) => (
            <div key={metric.type} className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{metric.type}</h3>
                <div className={`flex items-center gap-1 text-sm font-medium ${metric.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(metric.trend).toFixed(1)}%
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Count</div>
                  <div className="text-2xl font-bold text-gray-900">{metric.count.toLocaleString()}</div>
                </div>

                {metric.avgDuration && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Avg Duration</div>
                    <div className="text-xl font-bold text-gray-900">{metric.avgDuration} min</div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-gray-600 mb-1">Success Rate</div>
                  <div className="flex items-center gap-2">
                    <div className="text-xl font-bold text-green-600">{metric.successRate.toFixed(1)}%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${metric.successRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Top Performers</h2>
          <div className="space-y-2">
            {topPerformers.map((performer, index) => (
              <div key={performer.name} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                  #{index + 1}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{performer.name}</h3>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Interactions: </span>
                      <span className="font-bold text-gray-900">{performer.interactions}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Conversions: </span>
                      <span className="font-bold text-green-600">{performer.conversions}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Response: </span>
                      <span className="font-bold text-blue-600">{performer.avgResponseTime}h</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Satisfaction: </span>
                      <span className="font-bold text-purple-600">{performer.satisfactionScore}/10</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-600 mb-1">Conversion Rate</div>
                  <div className="text-lg font-bold text-green-600">
                    {(performer.interactions ? (performer.conversions / performer.interactions) * 100 : 0).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
