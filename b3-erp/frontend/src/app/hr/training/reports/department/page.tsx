'use client';

import React, { useState, useEffect } from 'react';
import {
  Building,
  Search,
  Filter,
  Download,
  Users,
  Target,
  Award,
  TrendingUp,
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
  Legend,
  ComposedChart,
  Line,
  Cell
} from 'recharts';

const DEPT_COLORS = ['#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6', '#10b981'];

interface DepartmentRecord {
  name: string;
  employees: number;
  trained: number;
  completionRate: number;
  avgScore: number;
  budget: number;
  spend: number;
  fill: string;
}

export default function DepartmentReportsPage() {
  const [departmentData, setDepartmentData] = useState<DepartmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.trainingEnrollments()) as any[];
        const mapped: DepartmentRecord[] = (Array.isArray(raw) ? raw : []).map((r, i) => ({
          name: r.name ?? r.department ?? r.departmentName ?? '',
          employees: Number(r.employees ?? 0),
          trained: Number(r.trained ?? 0),
          completionRate: Number(r.completionRate ?? 0),
          avgScore: Number(r.avgScore ?? 0),
          budget: Number(r.budget ?? 0),
          spend: Number(r.spend ?? 0),
          fill: r.fill ?? DEPT_COLORS[i % DEPT_COLORS.length],
        }));
        if (!cancelled) setDepartmentData(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load department data');
          setDepartmentData([]);
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="h-8 w-8 text-purple-600" />
            Department Training Reports
          </h1>
          <p className="text-gray-500 mt-1">Comparative analysis across departments</p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading department data…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Completion Rate Comparison */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Training Completion Rate (%)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px' }} formatter={(val: number) => [`${val}%`, 'Completion']} />
                <Bar dataKey="completionRate" radius={[0, 4, 4, 0]} barSize={24}>
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Utilization Comparison */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Budget Utilization</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={departmentData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="name" scale="band" />
                <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="budget" barSize={20} fill="#e5e7eb" name="Allocated Budget" />
                <Bar dataKey="spend" barSize={20} fill="#8b5cf6" name="Actual Spend" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Department Performance Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-3 py-2">Department</th>
                <th className="px-3 py-2 text-center">Employees Trained</th>
                <th className="px-3 py-2 text-center">Avg. Assessment Score</th>
                <th className="px-3 py-2 text-center">Completion Rate</th>
                <th className="px-3 py-2 text-right">Total Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {departmentData.map((dept, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 font-medium text-gray-900 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.fill }}></div>
                    {dept.name}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className="font-medium text-gray-900">{dept.trained}</span>
                    <span className="text-gray-400"> / {dept.employees}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dept.avgScore >= 85 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {dept.avgScore}%
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm font-medium">{dept.completionRate}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${dept.completionRate}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-gray-900">{formatCurrency(dept.spend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
