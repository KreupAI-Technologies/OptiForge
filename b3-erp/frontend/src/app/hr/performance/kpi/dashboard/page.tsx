'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Target, ArrowUp, ArrowDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HrPagesService } from '@/services/hr-pages.service';

interface TopPerformer {
  name: string;
  role: string;
  score: number;
}

export default function KPIDashboardPage() {
  const data = [
    { name: 'Jan', value: 65 },
    { name: 'Feb', value: 72 },
    { name: 'Mar', value: 85 },
    { name: 'Apr', value: 82 },
    { name: 'May', value: 90 },
    { name: 'Jun', value: 88 },
  ];

  const departmentPerformance = [
    { name: 'Sales', score: 92, trend: 'up' },
    { name: 'Engineering', score: 88, trend: 'up' },
    { name: 'Marketing', score: 76, trend: 'down' },
    { name: 'Product', score: 85, trend: 'up' },
    { name: 'HR', score: 81, trend: 'down' },
  ];

  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.performanceGoals('kpi')) as any[];
        const mapped: TopPerformer[] = (Array.isArray(raw) ? raw : []).map((r) => ({
          name: r.name ?? r.employeeName ?? r.title ?? '',
          role: r.role ?? r.department ?? r.category ?? '',
          score: Number(r.score ?? r.progress ?? r.value ?? 0),
        }));
        if (!cancelled) setTopPerformers(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load KPI performers');
          setTopPerformers([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            KPI Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Analytics and insights on organizational performance.</p>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading KPIs…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg KPI Score</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-3xl font-bold text-gray-900">86%</p>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" /> 2.4%
                </span>
              </div>
            </div>
            <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Goals Completed</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-3xl font-bold text-gray-900">124</p>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" /> 12%
                </span>
              </div>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">On Track</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-3xl font-bold text-gray-900">92%</p>
              </div>
            </div>
            <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">At Risk</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-3xl font-bold text-gray-900">8%</p>
              </div>
            </div>
            <div className="h-12 w-12 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Performance Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#9333ea" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Top Performers</h3>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {topPerformers.map((person, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
                  {person.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-gray-900">{person.name}</span>
                    <span className="font-bold text-gray-900">{person.score}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{person.role}</span>
                    <span>Score</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: `${person.score}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm text-purple-600 font-medium hover:bg-purple-50 rounded-lg transition-colors">
            View All Employees
          </button>
        </div>
      </div>

      {/* Department Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Department Performance</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {departmentPerformance.map((dept) => (
            <div key={dept.name} className="p-6 text-center">
              <p className="text-gray-500 font-medium text-sm mb-2">{dept.name}</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{dept.score}%</p>
              <span className={`inline-flex items-center text-xs font-medium ${dept.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                {dept.trend === 'up' ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                {dept.trend === 'up' ? 'Improving' : 'Declining'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Missing icons import fix
import { CheckCircle, AlertCircle } from 'lucide-react';
