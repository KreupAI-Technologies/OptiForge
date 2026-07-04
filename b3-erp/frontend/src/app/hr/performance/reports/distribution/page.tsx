'use client';

import { useState, useEffect } from 'react';
import { PieChart, Info, Scale, Users, TrendingUp, AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Line
} from 'recharts';
import { HrPagesService } from '@/services/hr-pages.service';

interface RoleDistribution {
  role: string;
  avgScore: number;
  employees: number;
}

export default function PerformanceDistributionPage() {
  const bellCurveData = [
    { rating: '1 - Unsatisfactory', count: 5, fill: '#ef4444' },
    { rating: '2 - Needs Improvement', count: 12, fill: '#f97316' },
    { rating: '3 - Meets Expectations', count: 65, fill: '#8b5cf6' },
    { rating: '4 - Exceeds Expectations', count: 28, fill: '#10b981' },
    { rating: '5 - Outstanding', count: 10, fill: '#3b82f6' },
  ];

  const deptDistribution = [
    { name: 'Engineering', low: 5, mid: 45, high: 20 },
    { name: 'Sales', low: 8, mid: 35, high: 30 },
    { name: 'Marketing', low: 4, mid: 25, high: 15 },
    { name: 'Product', low: 3, mid: 30, high: 18 },
    { name: 'HR', low: 2, mid: 15, high: 8 },
  ];

  const [roleDistribution, setRoleDistribution] = useState<RoleDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.performanceReviews()) as any[];
        const mapped: RoleDistribution[] = (Array.isArray(raw) ? raw : []).map((r) => ({
          role: r.role ?? r.roleLevel ?? r.designation ?? '',
          avgScore: Number(r.avgScore ?? r.averageScore ?? r.rating ?? 0),
          employees: Number(r.employees ?? r.employeeCount ?? r.count ?? 0),
        }));
        if (!cancelled) setRoleDistribution(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load distribution');
          setRoleDistribution([]);
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
            <PieChart className="h-8 w-8 text-purple-600" />
            Rating Distribution
          </h1>
          <p className="text-gray-500 mt-1">Analyze performance spread and ensure grading fairness.</p>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading distribution…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Bell Curve Section */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Organization Bell Curve</h3>
            <p className="text-sm text-gray-500">Distribution of employee ratings across the standard 5-point scale</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
            <Info className="h-4 w-4" />
            <span>Normal Distribution Target: 10% - 20% - 40% - 20% - 10%</span>
          </div>
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={bellCurveData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="rating" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={60} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Department Breakdown */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-500" />
            Distribution by Department
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} width={100} />
                <Tooltip />
                <Legend iconType="circle" />
                <Bar dataKey="low" name="Low (1-2)" stackId="a" fill="#fca5a5" />
                <Bar dataKey="mid" name="Mid (3)" stackId="a" fill="#d8b4fe" />
                <Bar dataKey="high" name="High (4-5)" stackId="a" fill="#86efac" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Role Analysis */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Scale className="h-5 w-5 text-gray-500" />
            Average Score by Role Level
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
                  <th className="pb-3 font-medium">Role Level</th>
                  <th className="pb-3 font-medium">Employees</th>
                  <th className="pb-3 font-medium">Avg Score</th>
                  <th className="pb-3 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {roleDistribution.map((role) => (
                  <tr key={role.role} className="text-sm">
                    <td className="py-3 font-medium text-gray-900">{role.role}</td>
                    <td className="py-3 text-gray-600">{role.employees}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${role.avgScore >= 4 ? 'bg-green-500' :
                                role.avgScore >= 3.5 ? 'bg-purple-500' : 'bg-orange-500'
                              }`}
                            style={{ width: `${(role.avgScore / 5) * 100}%` }}
                          />
                        </div>
                        <span className="font-medium text-gray-700">{role.avgScore}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
