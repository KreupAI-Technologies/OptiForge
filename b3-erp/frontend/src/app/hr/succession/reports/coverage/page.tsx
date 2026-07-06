'use client';

import { useState, useEffect } from 'react';
import { PieChart, Target, Users, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { HrTalentService } from '@/services/hr-talent.service';

interface CoverageData {
  department: string;
  totalPositions: number;
  criticalPositions: number;
  coveredPositions: number;
  uncoveredPositions: number;
  coverageRatio: number;
  avgSuccessorsPerPosition: number;
  readyNow: number;
  inDevelopment: number;
}

export default function Page() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const [rows, setRows] = useState<CoverageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getSuccession<CoverageData>('coverage');
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) { setRows([]); setLoadError(err instanceof Error ? err.message : 'Failed to load data'); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredData = selectedDepartment === 'all'
    ? rows
    : rows.filter(d => d.department === selectedDepartment);

  const getCoverageColor = (ratio: number) => {
    if (ratio >= 90) return 'text-green-600';
    if (ratio >= 75) return 'text-teal-600';
    if (ratio >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCoverageBgColor = (ratio: number) => {
    if (ratio >= 90) return 'bg-green-500';
    if (ratio >= 75) return 'bg-teal-500';
    if (ratio >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const totalCritical = rows.reduce((sum, d) => sum + d.criticalPositions, 0);
  const totalCovered = rows.reduce((sum, d) => sum + d.coveredPositions, 0);
  const totalUncovered = rows.reduce((sum, d) => sum + d.uncoveredPositions, 0);
  const overallCoverage = totalCritical ? Math.round((totalCovered / totalCritical) * 100) : 0;
  const avgSuccessors = (rows.length ? rows.reduce((sum, d) => sum + d.avgSuccessorsPerPosition, 0) / rows.length : 0).toFixed(1);
  const totalReadyNow = rows.reduce((sum, d) => sum + d.readyNow, 0);

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <PieChart className="h-6 w-6 text-teal-600" />
          Succession Coverage
        </h1>
        <p className="text-sm text-gray-600 mt-1">Succession planning coverage and readiness metrics</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Critical Positions</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{totalCritical}</p>
              <p className="text-xs text-purple-700 mt-1">Total critical</p>
            </div>
            <Target className="h-10 w-10 text-purple-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Covered</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{totalCovered}</p>
              <p className="text-xs text-green-700 mt-1">{overallCoverage}% coverage</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm border border-red-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Uncovered</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{totalUncovered}</p>
              <p className="text-xs text-red-700 mt-1">Need attention</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg shadow-sm border border-teal-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Ready Now</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">{totalReadyNow}</p>
              <p className="text-xs text-teal-700 mt-1">Immediate successors</p>
            </div>
            <Users className="h-10 w-10 text-teal-600 opacity-60" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Overall Coverage</h3>
          <div className="flex items-center justify-center mb-2">
            <div className="relative">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle cx="64" cy="64" r="56" stroke="#E5E7EB" strokeWidth="12" fill="none" />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#14B8A6"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(overallCoverage / 100) * 352} 352`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-teal-600">{overallCoverage}%</p>
                  <p className="text-xs text-gray-600">Coverage</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Avg. Successors/Position:</span>
              <span className="font-bold text-gray-900">{avgSuccessors}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Positions:</span>
              <span className="font-bold text-gray-900">{totalCritical}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Covered:</span>
              <span className="font-bold text-green-600">{totalCovered}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Gaps:</span>
              <span className="font-bold text-red-600">{totalUncovered}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Coverage by Department</h3>
          <div className="space-y-3">
            {rows.map((dept, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{dept.department}</span>
                  <span className={`text-sm font-bold ${getCoverageColor(dept.coverageRatio)}`}>{dept.coverageRatio}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div className={`${getCoverageBgColor(dept.coverageRatio)} rounded-full h-2 transition-all`} style={{ width: `${dept.coverageRatio}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Department</label>
        <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="all">All Departments</option>
          {rows.map(dept => (
            <option key={dept.department} value={dept.department}>{dept.department}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Detailed Coverage Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Department</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Total Positions</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Critical</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Covered</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Gaps</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Coverage %</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Avg. Successors</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Ready Now</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">In Dev.</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((dept, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold text-gray-900">{dept.department}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{dept.totalPositions}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{dept.criticalPositions}</td>
                  <td className="py-3 px-4 text-center font-semibold text-green-600">{dept.coveredPositions}</td>
                  <td className="py-3 px-4 text-center font-semibold text-red-600">{dept.uncoveredPositions}</td>
                  <td className={`py-3 px-4 text-center font-bold ${getCoverageColor(dept.coverageRatio)}`}>{dept.coverageRatio}%</td>
                  <td className="py-3 px-4 text-center text-gray-700">{dept.avgSuccessorsPerPosition.toFixed(1)}</td>
                  <td className="py-3 px-4 text-center font-semibold text-teal-600">{dept.readyNow}</td>
                  <td className="py-3 px-4 text-center font-semibold text-blue-600">{dept.inDevelopment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
