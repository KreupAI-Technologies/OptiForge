'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, Target, Award, Clock, CheckCircle, BarChart3 } from 'lucide-react';
import crmService from '@/services/crm.service';

interface BackendMember {
  member: string;
  totalLeads: number;
  won: number;
  lost: number;
  open: number;
  winRate: number;
  pipelineValue: number;
  wonValue: number;
}

interface TeamAnalytics {
  teamSize: number;
  totalLeads: number;
  totalWon: number;
  totalWonValue: number;
  members: BackendMember[];
}

// Derived member shape used for rendering the cards below.
interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  dealsWon: number;
  revenue: number;
  pipelineValue: number;
  avgDealSize: number;
  winRate: number;
  activePipeline: number;
  totalLeads: number;
  lost: number;
}

function initialsOf(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function TeamAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [sortBy, setSortBy] = useState<'revenue' | 'winRate' | 'leads'>('revenue');

  const [analytics, setAnalytics] = useState<TeamAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const result = await crmService.analyticsViews.getTeam();
        if (cancelled) return;
        setAnalytics(result ?? null);
      } catch (err) {
        if (cancelled) return;
        setAnalytics(null);
        setLoadError(
          err instanceof Error ? err.message : 'Failed to load team analytics.'
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const backendMembers: BackendMember[] = analytics?.members ?? [];

  // Map backend members into the shape the cards render.
  const teamMembers: TeamMember[] = backendMembers.map((m, idx) => {
    const won = m.won ?? 0;
    const wonValue = m.wonValue ?? 0;
    return {
      id: String(idx),
      name: m.member ?? 'Unknown',
      avatar: initialsOf(m.member ?? ''),
      role: 'Sales Representative',
      dealsWon: won,
      revenue: wonValue,
      pipelineValue: m.pipelineValue ?? 0,
      avgDealSize: won > 0 ? Math.round(wonValue / won) : 0,
      winRate: m.winRate ?? 0,
      activePipeline: m.open ?? 0,
      totalLeads: m.totalLeads ?? 0,
      lost: m.lost ?? 0,
    };
  });

  // Team Performance Overview (aggregates from the backend where provided).
  const totalRevenue = analytics?.totalWonValue ?? teamMembers.reduce((sum, m) => sum + m.revenue, 0);
  const totalPipelineValue = teamMembers.reduce((sum, m) => sum + m.pipelineValue, 0);
  const totalActivePipeline = teamMembers.reduce((sum, m) => sum + m.activePipeline, 0);
  const teamStats = {
    teamSize: analytics?.teamSize ?? teamMembers.length,
    totalLeads: analytics?.totalLeads ?? teamMembers.reduce((sum, m) => sum + m.totalLeads, 0),
    totalRevenue,
    totalDealsWon: analytics?.totalWon ?? teamMembers.reduce((sum, m) => sum + m.dealsWon, 0),
    avgWinRate:
      teamMembers.length > 0
        ? Math.round((teamMembers.reduce((sum, m) => sum + m.winRate, 0) / teamMembers.length) * 10) / 10
        : 0,
    activePipeline: totalActivePipeline,
    pipelineValue: totalPipelineValue,
  };

  const sortedMembers = [...teamMembers].sort((a, b) => {
    switch (sortBy) {
      case 'revenue':
        return b.revenue - a.revenue;
      case 'leads':
        return b.totalLeads - a.totalLeads;
      case 'winRate':
        return b.winRate - a.winRate;
      default:
        return 0;
    }
  });

  return (
    <div className="w-full h-full px-3 py-2 ">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Loading analytics…
        </div>
      )}
      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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

        {/* Team Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
            <Users className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{teamStats.teamSize}</div>
            <div className="text-green-100">Team Members</div>
            <div className="text-sm mt-2 opacity-90">
              ${(teamStats.totalRevenue / 1000000).toFixed(2)}M total won value
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
            <Target className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{teamStats.totalLeads}</div>
            <div className="text-blue-100">Total Leads</div>
            <div className="text-sm mt-2 opacity-90">
              {teamStats.totalDealsWon} won
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
            <Award className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{teamStats.avgWinRate}%</div>
            <div className="text-purple-100">Avg Win Rate</div>
            <div className="text-sm mt-2 opacity-90">
              {teamStats.totalDealsWon} deals won
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white">
            <TrendingUp className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">${(teamStats.pipelineValue / 1000000).toFixed(2)}M</div>
            <div className="text-orange-100">Active Pipeline</div>
            <div className="text-sm mt-2 opacity-90">
              {teamStats.activePipeline} deals in pipeline
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('revenue')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  sortBy === 'revenue' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setSortBy('leads')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  sortBy === 'leads' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Total Leads
              </button>
              <button
                onClick={() => setSortBy('winRate')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  sortBy === 'winRate' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Win Rate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Performance */}
      <div className="space-y-3">
        {!isLoading && !loadError && sortedMembers.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-sm text-gray-500">
            No team members found.
          </div>
        )}
        {sortedMembers.map((member, index) => (
          <div key={member.id} className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                  index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                  index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                  index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                  'bg-gradient-to-br from-blue-500 to-blue-700'
                }`}>
                  {member.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                    {index < 3 && <Award className="w-5 h-5 text-yellow-500" />}
                  </div>
                  <div className="text-sm text-gray-600">{member.role}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">${(member.revenue / 1000).toFixed(0)}K</div>
                <div className="text-sm text-gray-600">{member.dealsWon} deals won</div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-6 gap-2 mb-3">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                <div className="flex items-center gap-1 text-green-700 mb-1">
                  <Users className="w-3 h-3" />
                  <span className="text-xs font-medium">Total Leads</span>
                </div>
                <div className="text-xl font-bold text-green-900">
                  {member.totalLeads}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                <div className="flex items-center gap-1 text-blue-700 mb-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs font-medium">Pipeline</span>
                </div>
                <div className="text-xl font-bold text-blue-900">
                  {member.activePipeline}
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  ${(member.pipelineValue / 1000).toFixed(0)}K value
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                <div className="flex items-center gap-1 text-purple-700 mb-1">
                  <BarChart3 className="w-3 h-3" />
                  <span className="text-xs font-medium">Avg Deal</span>
                </div>
                <div className="text-xl font-bold text-purple-900">
                  ${(member.avgDealSize / 1000).toFixed(0)}K
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3">
                <div className="flex items-center gap-1 text-yellow-700 mb-1">
                  <Award className="w-3 h-3" />
                  <span className="text-xs font-medium">Win Rate</span>
                </div>
                <div className="text-xl font-bold text-yellow-900">
                  {member.winRate.toFixed(1)}%
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
                <div className="flex items-center gap-1 text-orange-700 mb-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs font-medium">Lost</span>
                </div>
                <div className="text-xl font-bold text-orange-900">
                  {member.lost}
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3">
                <div className="flex items-center gap-1 text-teal-700 mb-1">
                  <CheckCircle className="w-3 h-3" />
                  <span className="text-xs font-medium">Deals Won</span>
                </div>
                <div className="text-xl font-bold text-teal-900">
                  {member.dealsWon}
                </div>
              </div>
            </div>

            {/* Win Rate Progress Bar */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Win Rate</span>
                <span className="font-semibold text-gray-900">{member.winRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    member.winRate >= 50 ? 'bg-green-500' :
                    member.winRate >= 30 ? 'bg-blue-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(member.winRate, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
