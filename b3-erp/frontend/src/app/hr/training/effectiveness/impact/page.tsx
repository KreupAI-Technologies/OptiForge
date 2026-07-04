'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  DollarSign,
  Briefcase,
  Users,
  ArrowUpRight,
  Target,
  BarChart2,
  AlertCircle
} from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  LineChart,
  Line,
  Legend
} from 'recharts';

// Mock Data
const performanceCorrelation = [
  { trainingHours: 10, performanceScore: 65, employee: 'Employee A' },
  { trainingHours: 20, performanceScore: 72, employee: 'Employee B' },
  { trainingHours: 35, performanceScore: 85, employee: 'Employee C' },
  { trainingHours: 45, performanceScore: 92, employee: 'Employee D' },
  { trainingHours: 15, performanceScore: 68, employee: 'Employee E' },
  { trainingHours: 50, performanceScore: 96, employee: 'Employee F' },
  { trainingHours: 25, performanceScore: 78, employee: 'Employee G' },
  { trainingHours: 60, performanceScore: 98, employee: 'Employee H' },
  { trainingHours: 5, performanceScore: 60, employee: 'Employee I' },
  { trainingHours: 30, performanceScore: 82, employee: 'Employee J' },
];

const keyMetrics = [
  { title: 'Training ROI', value: '245%', change: '+12%', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
  { title: 'Productivity Lift', value: '+18%', change: '+3%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
  { title: 'Retention Rate', value: '94%', change: '+5%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  { title: 'Promotion Rate', value: '12%', change: '+2%', icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-100' },
];

interface RoiRecord {
  month: string;
  cost: number;
  value: number;
}

export default function ImpactPage() {
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [roiData, setRoiData] = useState<RoiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.trainingPrograms()) as any[];
        const mapped: RoiRecord[] = (Array.isArray(raw) ? raw : []).map((r) => ({
          month: r.month ?? r.period ?? r.name ?? '',
          cost: Number(r.cost ?? r.budget ?? 0),
          value: Number(r.value ?? r.valueGenerated ?? 0),
        }));
        if (!cancelled) setRoiData(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load impact data');
          setRoiData([]);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            Impact Analysis
          </h1>
          <p className="text-gray-500 mt-1">Measure the business impact and ROI of training programs</p>
        </div>
        <div className="flex gap-3">
          <select
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2.5"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option>All Departments</option>
            <option>Sales</option>
            <option>Engineering</option>
            <option>Support</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading impact data…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {keyMetrics.map((metric, index) => (
          <div key={index} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2 relative z-10">
              <div className={`p-2 rounded-lg ${metric.bg}`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-50 text-green-700">
                {metric.change} vs LY
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium relative z-10">{metric.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1 relative z-10">{metric.value}</p>
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 ${metric.bg.replace('bg-', 'bg-')}`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* ROI Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gray-400" />
            Value vs. Investment
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  formatter={(value: any) => [`$${value}`, '']}
                />
                <Legend />
                <Bar dataKey="cost" name="Training Cost" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="value" name="Value Generated" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
            <p className="text-sm text-green-800">
              <strong>Keep it up!</strong> Q4 Value Generated exceeded costs by 200%, largely driven by the Sales Mastery program.
            </p>
          </div>
        </div>

        {/* Correlation Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-400" />
            Impact on Performance
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  dataKey="trainingHours"
                  name="Training Hours"
                  unit=" hrs"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6b7280' }}
                  label={{ value: 'Training Hours', position: 'insideBottom', offset: -10, fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  dataKey="performanceScore"
                  name="Performance Score"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6b7280' }}
                  domain={[50, 100]}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Scatter name="Employees" data={performanceCorrelation} fill="#8b5cf6" shape="circle" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-sm text-purple-800">
              <strong>Strong Correlation:</strong> Data indicates a positive correlation between training hours and performance ratings (r=0.85).
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Department Breakdown</h2>
          <button className="text-sm text-purple-600 font-medium hover:text-purple-800 flex items-center">
            View Full Report <ArrowUpRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-3 py-2">Department</th>
                <th className="px-3 py-2">Total Training Hours</th>
                <th className="px-3 py-2">Avg Performance Score</th>
                <th className="px-3 py-2">Productivity Change</th>
                <th className="px-3 py-2">Retention Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 font-semibold text-gray-900">Sales</td>
                <td className="px-3 py-2">1,240 hrs</td>
                <td className="px-3 py-2">88/100</td>
                <td className="px-3 py-2 text-green-600 font-medium">+15%</td>
                <td className="px-3 py-2">92%</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 font-semibold text-gray-900">Engineering</td>
                <td className="px-3 py-2">2,100 hrs</td>
                <td className="px-3 py-2">92/100</td>
                <td className="px-3 py-2 text-green-600 font-medium">+8%</td>
                <td className="px-3 py-2">96%</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 font-semibold text-gray-900">Customer Support</td>
                <td className="px-3 py-2">850 hrs</td>
                <td className="px-3 py-2">85/100</td>
                <td className="px-3 py-2 text-green-600 font-medium">+12%</td>
                <td className="px-3 py-2">89%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
