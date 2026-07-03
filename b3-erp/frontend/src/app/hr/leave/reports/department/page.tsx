'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Building, Users, TrendingUp, Calendar, Download, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { HrPagesService } from '@/services/hr-pages.service';

interface DepartmentLeaveData {
  departmentId: string;
  departmentName: string;
  totalEmployees: number;
  totalLeaveDays: number;
  avgLeavesPerEmployee: number;
  utilizationRate: number;
  pendingApplications: number;
  topLeaveType: string;
  teamAvailability: number;
  color: string;
}

interface DepartmentLeaveType {
  department: string;
  EL: number;
  CL: number;
  SL: number;
  PL: number;
  ML: number;
  CO: number;
}

const DEPT_COLORS = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500'];

/** Map a leave type name to one of the tracked breakdown buckets. */
function leaveTypeBucket(name: string): keyof Omit<DepartmentLeaveType, 'department'> {
  const n = (name || '').toLowerCase();
  if (n.includes('casual')) return 'CL';
  if (n.includes('sick')) return 'SL';
  if (n.includes('privilege')) return 'PL';
  if (n.includes('matern')) return 'ML';
  if (n.includes('comp')) return 'CO';
  return 'EL';
}

export default function DepartmentReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('current_fy');
  const [sortBy, setSortBy] = useState<'name' | 'employees' | 'leaves' | 'utilization'>('name');
  const [departmentData, setDepartmentData] = useState<DepartmentLeaveData[]>([]);
  const [leaveTypeBreakdown, setLeaveTypeBreakdown] = useState<DepartmentLeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.leaveApplications()) as any[];
        // Group applications by department.
        const groups = new Map<string, any[]>();
        (raw ?? []).forEach((r) => {
          const dept = r.department ?? 'Unassigned';
          if (!groups.has(dept)) groups.set(dept, []);
          groups.get(dept)!.push(r);
        });

        const deptData: DepartmentLeaveData[] = [];
        const breakdown: DepartmentLeaveType[] = [];
        let colorIdx = 0;

        groups.forEach((apps, deptName) => {
          const employees = new Set(apps.map((a) => a.employeeId ?? a.employeeName)).size;
          const totalLeaveDays = apps.reduce((s, a) => s + Number(a.numberOfDays ?? 0), 0);
          const pending = apps.filter((a) => String(a.status ?? '').toLowerCase() === 'pending').length;

          const buckets: DepartmentLeaveType = { department: deptName, EL: 0, CL: 0, SL: 0, PL: 0, ML: 0, CO: 0 };
          apps.forEach((a) => {
            const bucket = leaveTypeBucket(a.leaveTypeName ?? a.leaveType ?? '');
            buckets[bucket] += Number(a.numberOfDays ?? 0);
          });

          // Determine the most-used leave-type code for this department.
          const topLeaveType = (['EL', 'CL', 'SL', 'PL', 'ML', 'CO'] as const).reduce(
            (top, code) => (buckets[code] > buckets[top] ? code : top),
            'EL' as keyof Omit<DepartmentLeaveType, 'department'>,
          );

          deptData.push({
            departmentId: deptName.slice(0, 5).toUpperCase(),
            departmentName: deptName,
            totalEmployees: employees,
            totalLeaveDays,
            avgLeavesPerEmployee: employees > 0 ? Math.round(totalLeaveDays / employees) : 0,
            utilizationRate: employees > 0 ? Math.min(100, Math.round((totalLeaveDays / (employees * 24)) * 100)) : 0,
            pendingApplications: pending,
            topLeaveType,
            teamAvailability: 100,
            color: DEPT_COLORS[colorIdx % DEPT_COLORS.length],
          });
          breakdown.push(buckets);
          colorIdx += 1;
        });

        if (!cancelled) {
          setDepartmentData(deptData);
          setLeaveTypeBreakdown(breakdown);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load department report');
          setDepartmentData([]);
          setLeaveTypeBreakdown([]);
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

  const columns: Column<DepartmentLeaveData>[] = [
    {
      id: 'department',
      header: 'Department',
      accessor: 'departmentName',
      sortable: true,
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded ${row.color}`}></div>
          <div>
            <div className="font-medium text-gray-900">{v}</div>
            <div className="text-xs text-gray-500">{row.departmentId}</div>
          </div>
        </div>
      )
    },
    {
      id: 'employees',
      header: 'Employees',
      accessor: 'totalEmployees',
      sortable: true,
      render: (v) => (
        <div className="text-sm">
          <div className="font-semibold text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">members</div>
        </div>
      )
    },
    {
      id: 'leaves',
      header: 'Total Leaves',
      accessor: 'totalLeaveDays',
      sortable: true,
      render: (v, row) => (
        <div className="text-sm">
          <div className="font-semibold text-blue-600">{v} days</div>
          <div className="text-xs text-gray-500">Avg: {row.avgLeavesPerEmployee}/emp</div>
        </div>
      )
    },
    {
      id: 'utilization',
      header: 'Utilization',
      accessor: 'utilizationRate',
      sortable: true,
      render: (v) => (
        <div className="text-sm">
          <div className={`font-semibold ${v >= 75 ? 'text-red-600' : v >= 60 ? 'text-orange-600' : 'text-green-600'}`}>
            {v}%
          </div>
          <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
            <div className={`${v >= 75 ? 'bg-red-500' : v >= 60 ? 'bg-orange-500' : 'bg-green-500'} h-1.5 rounded-full`} style={{ width: `${v}%` }}></div>
          </div>
        </div>
      )
    },
    {
      id: 'availability',
      header: 'Team Availability',
      accessor: 'teamAvailability',
      sortable: true,
      render: (v) => (
        <div className="text-sm">
          <div className="font-semibold text-green-600">{v}%</div>
          <div className="text-xs text-gray-500">available</div>
        </div>
      )
    },
    {
      id: 'pending',
      header: 'Pending',
      accessor: 'pendingApplications',
      sortable: true,
      render: (v) => (
        <div className="text-sm">
          <div className={`font-semibold ${v > 5 ? 'text-orange-600' : 'text-gray-900'}`}>{v}</div>
          <div className="text-xs text-gray-500">applications</div>
        </div>
      )
    },
    {
      id: 'topType',
      header: 'Most Used',
      accessor: 'topLeaveType',
      sortable: false,
      render: (v) => (
        <div className="text-sm">
          <div className="font-mono font-medium text-blue-600">{v}</div>
        </div>
      )
    }
  ];

  const overallStats = useMemo(() => {
    const totalEmployees = departmentData.reduce((sum, d) => sum + d.totalEmployees, 0);
    const totalLeaves = departmentData.reduce((sum, d) => sum + d.totalLeaveDays, 0);
    const totalPending = departmentData.reduce((sum, d) => sum + d.pendingApplications, 0);
    const avgUtilization = departmentData.length > 0
      ? departmentData.reduce((sum, d) => sum + d.utilizationRate, 0) / departmentData.length
      : 0;
    return { totalEmployees, totalLeaves, totalPending, avgUtilization };
  }, [departmentData]);

  return (
    <div className="p-6 space-y-3">
      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading department report…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="w-7 h-7 text-purple-600" />
            Department-wise Leave Report
          </h1>
          <p className="text-gray-600 mt-1">Analyze leave patterns and utilization across departments</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="current_fy">Current FY (2025-26)</option>
            <option value="last_fy">Last FY (2024-25)</option>
            <option value="ytd">Year to Date</option>
            <option value="last_quarter">Last Quarter</option>
          </select>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <Users className="w-4 h-4" /> Total Employees
          </div>
          <div className="text-2xl font-bold text-gray-900">{overallStats.totalEmployees}</div>
          <div className="text-xs text-gray-500 mt-1">across {departmentData.length} departments</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <Calendar className="w-4 h-4" /> Total Leaves
          </div>
          <div className="text-2xl font-bold text-blue-600">{overallStats.totalLeaves.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">days taken</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Avg Utilization</div>
          <div className="text-2xl font-bold text-orange-600">{overallStats.avgUtilization.toFixed(1)}%</div>
          <div className="text-xs text-gray-500 mt-1">across all depts</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> Pending
          </div>
          <div className="text-2xl font-bold text-purple-600">{overallStats.totalPending}</div>
          <div className="text-xs text-gray-500 mt-1">applications</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Department Summary</h2>
        </div>
        <DataTable data={departmentData} columns={columns} pagination={{ enabled: false }} sorting={{ enabled: true, defaultSort: { column: 'department', direction: 'asc' } }} emptyMessage="No department data found" />
      </div>

      <div className="bg-white rounded-lg border p-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Leave Type Distribution by Department</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Department</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-blue-600">EL</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-green-600">CL</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-red-600">SL</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-purple-600">PL</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-pink-600">ML</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-orange-600">CO</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {leaveTypeBreakdown.map(dept => (
                <tr key={dept.department} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{dept.department}</td>
                  <td className="text-right py-3 px-4 text-blue-600">{dept.EL}</td>
                  <td className="text-right py-3 px-4 text-green-600">{dept.CL}</td>
                  <td className="text-right py-3 px-4 text-red-600">{dept.SL}</td>
                  <td className="text-right py-3 px-4 text-purple-600">{dept.PL}</td>
                  <td className="text-right py-3 px-4 text-pink-600">{dept.ML}</td>
                  <td className="text-right py-3 px-4 text-orange-600">{dept.CO}</td>
                  <td className="text-right py-3 px-4 font-semibold text-gray-900">
                    {dept.EL + dept.CL + dept.SL + dept.PL + dept.ML + dept.CO}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td className="py-3 px-4 text-gray-900">Total</td>
                <td className="text-right py-3 px-4 text-blue-600">{leaveTypeBreakdown.reduce((s, d) => s + d.EL, 0)}</td>
                <td className="text-right py-3 px-4 text-green-600">{leaveTypeBreakdown.reduce((s, d) => s + d.CL, 0)}</td>
                <td className="text-right py-3 px-4 text-red-600">{leaveTypeBreakdown.reduce((s, d) => s + d.SL, 0)}</td>
                <td className="text-right py-3 px-4 text-purple-600">{leaveTypeBreakdown.reduce((s, d) => s + d.PL, 0)}</td>
                <td className="text-right py-3 px-4 text-pink-600">{leaveTypeBreakdown.reduce((s, d) => s + d.ML, 0)}</td>
                <td className="text-right py-3 px-4 text-orange-600">{leaveTypeBreakdown.reduce((s, d) => s + d.CO, 0)}</td>
                <td className="text-right py-3 px-4 text-gray-900">
                  {leaveTypeBreakdown.reduce((s, d) => s + d.EL + d.CL + d.SL + d.PL + d.ML + d.CO, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg border p-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">High Utilization Departments</h2>
          <div className="space-y-3">
            {departmentData.filter(d => d.utilizationRate >= 70).sort((a, b) => b.utilizationRate - a.utilizationRate).map(dept => (
              <div key={dept.departmentId} className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded ${dept.color}`}></div>
                    <div className="font-medium text-gray-900">{dept.departmentName}</div>
                  </div>
                  <div className="text-red-600 font-semibold">{dept.utilizationRate}%</div>
                </div>
                <div className="mt-2 text-xs text-gray-600 ml-4">
                  {dept.totalLeaveDays} days used • Team availability: {dept.teamAvailability}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Departments Requiring Attention</h2>
          <div className="space-y-3">
            {departmentData.filter(d => d.pendingApplications > 3 || d.teamAvailability < 90).map(dept => (
              <div key={dept.departmentId} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <div className="font-medium text-gray-900">{dept.departmentName}</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-yellow-800 ml-6 space-y-1">
                  {dept.pendingApplications > 3 && <div>• {dept.pendingApplications} pending applications (needs attention)</div>}
                  {dept.teamAvailability < 90 && <div>• Team availability at {dept.teamAvailability}% (below threshold)</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2">
          <Building className="w-5 h-5 inline mr-2" />
          Department Report Insights
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>✓ Department-wise leave consumption, utilization rate, and team availability metrics</li>
          <li>✓ Leave type distribution showing EL, CL, SL, PL, ML, and CO usage by department</li>
          <li>✓ Identification of high-utilization departments requiring resource planning</li>
          <li>✓ Pending applications tracking for timely approval workflow management</li>
          <li>✓ Average leaves per employee for inter-department comparison and benchmarking</li>
        </ul>
      </div>
    </div>
  );
}
