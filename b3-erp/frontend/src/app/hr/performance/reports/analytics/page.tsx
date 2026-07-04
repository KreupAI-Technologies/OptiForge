'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Target, Activity, PieChart as PieChartIcon, Calendar, AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { HrPagesService } from '@/services/hr-pages.service';

interface DepartmentScore {
  name: string;
  score: number;
  lastYear: number;
}

export default function PerformanceAnalyticsPage() {
  const [timePeriod, setTimePeriod] = useState('YTD');
  const [department, setDepartment] = useState('All');
  const [departmentScores, setDepartmentScores] = useState<DepartmentScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.performanceReviews()) as any[];
        const mapped: DepartmentScore[] = (Array.isArray(raw) ? raw : []).map((r) => ({
          name: r.name ?? r.department ?? r.departmentName ?? '',
          score: Number(r.score ?? r.currentScore ?? r.rating ?? 0),
          lastYear: Number(r.lastYear ?? r.previousScore ?? r.prevScore ?? 0),
        }));
        if (!cancelled) setDepartmentScores(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load analytics');
          setDepartmentScores([]);
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

  // Mock Data
  const performanceTrend = [
    { month: 'Jan', score: 78, industry: 75 },
    { month: 'Feb', score: 81, industry: 75 },
    { month: 'Mar', score: 80, industry: 76 },
    { month: 'Apr', score: 85, industry: 76 },
    { month: 'May', score: 88, industry: 77 },
    { month: 'Jun', score: 87, industry: 77 },
  ];

  const ratingDistribution = [
    { rating: 'Needs Improvement', count: 12 },
    { rating: 'Below Expectations', count: 28 },
    { rating: 'Meets Expectations', count: 145 },
    { rating: 'Exceeds Expectations', count: 65 },
    { rating: 'Outstanding', count: 24 },
  ];

  const departmentScores = [
    { name: 'Engineering', score: 88, lastYear: 82 },
    { name: 'Sales', score: 92, lastYear: 85 },
    { name: 'Marketing', score: 84, lastYear: 80 },
    { name: 'Product', score: 89, lastYear: 84 },
    { name: 'HR', score: 85, lastYear: 83 },
    { name: 'Finance', score: 86, lastYear: 85 },
  ];

  const competencies = [
    { subject: 'Communication', A: 85, B: 75, fullMark: 100 },
    { subject: 'Leadership', A: 78, B: 65, fullMark: 100 },
    { subject: 'Technical', A: 92, B: 85, fullMark: 100 },
    { subject: 'Innovation', A: 88, B: 70, fullMark: 100 },
    { subject: 'Teamwork', A: 90, B: 80, fullMark: 100 },
  ];

  return (
    <div className="p-6 space-y-3">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            Performance Analytics
          </h1>
          <p className="text-gray-500 mt-1">Deep dive into organization-wide performance metrics.</p>
        </div>
        <div className="flex gap-3">
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
          >
            <option value="Q1">Q1 2024</option>
            <option value="Q2">Q2 2024</option>
            <option value="YTD">Year to Date</option>
            <option value="LastYear">Last Year</option>
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Performance Score</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">87.5</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 flex items-center font-medium">
              <TrendingUp className="h-4 w-4 mr-1" />
              +2.4%
            </span>
            <span className="text-gray-400 mx-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Review Completion</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">94%</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">
              1,240 / 1,320 completed
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Employee Engagement</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">4.2<span className="text-lg text-gray-400">/5</span></h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 flex items-center font-medium">
              <TrendingUp className="h-4 w-4 mr-1" />
              +0.3
            </span>
            <span className="text-gray-400 mx-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Active PIPs</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">12</h3>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-600 font-medium">
              1.2% of workforce
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Performance Trend */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance Trend vs Industry</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceTrend}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <Tooltip />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="score" name="Company Score" stroke="#9333ea" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                <Area type="monotone" dataKey="industry" name="Industry Avg" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Rating Bell Curve</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="rating" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} interval={0} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Comparison */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Department Performance Comparison (YoY)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentScores} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Legend iconType="circle" />
                <Bar dataKey="score" name="Current Year" fill="#9333ea" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lastYear" name="Last Year" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
