'use client';

import React, { useState, useMemo } from 'react';
import { Building, Search, TrendingUp, Users, Calendar, AlertCircle, Download, BarChart3 } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { mockDepartmentLeaveSummary, DepartmentLeaveSummary } from '@/data/hr/leave-balances';
import { exportToCsv } from '@/lib/export';

export default function DepartmentLeaveBalancePage() {
  const [departments] = useState<DepartmentLeaveSummary[]>(mockDepartmentLeaveSummary);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered data
  const filteredData = useMemo(() => {
    return departments.filter(dept => {
      const matchesSearch =
        dept.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.departmentCode.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [departments, searchTerm]);

  // Calculate organization-wide stats
  const totalEmployees = departments.reduce((sum, d) => sum + d.totalEmployees, 0);
  const totalOnLeave = departments.reduce((sum, d) => sum + d.onLeave, 0);
  const totalUpcoming = departments.reduce((sum, d) => sum + d.upcomingLeave, 0);
  const totalEntitlement = departments.reduce((sum, d) => sum + d.totalEntitlement, 0);
  const totalTaken = departments.reduce((sum, d) => sum + d.totalTaken, 0);
  const totalCritical = departments.reduce((sum, d) => sum + d.criticalCount, 0);
  const avgOrgUtilization = totalEntitlement > 0 ? Math.round((totalTaken / totalEntitlement) * 100) : 0;

  // Table columns
  const columns: Column<DepartmentLeaveSummary>[] = [
    {
      id: 'department',
      header: 'Department',
      accessor: 'department',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-semibold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">
            <span className="font-mono font-medium">{row.departmentCode}</span>
            <span className="mx-1">•</span>
            <span>{row.totalEmployees} employees</span>
          </div>
        </div>
      )
    },
    {
      id: 'workforce',
      header: 'Workforce Status',
      accessor: 'activeEmployees',
      sortable: true,
      render: (_, row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-sm text-gray-700">Active: {row.activeEmployees}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {row.onLeave > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                On Leave: {row.onLeave}
              </span>
            )}
            {row.upcomingLeave > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                Upcoming: {row.upcomingLeave}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'entitlement',
      header: 'Entitlement',
      accessor: 'totalEntitlement',
      sortable: true,
      align: 'center',
      render: (value) => (
        <div>
          <div className="text-lg font-bold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">days</div>
        </div>
      )
    },
    {
      id: 'taken',
      header: 'Taken',
      accessor: 'totalTaken',
      sortable: true,
      align: 'center',
      render: (value) => (
        <div>
          <div className="text-lg font-bold text-red-700">{value}</div>
          <div className="text-xs text-gray-500">days</div>
        </div>
      )
    },
    {
      id: 'pending',
      header: 'Pending',
      accessor: 'totalPending',
      sortable: true,
      align: 'center',
      render: (value) => (
        <div>
          <div className="text-lg font-bold text-yellow-700">{value}</div>
          <div className="text-xs text-gray-500">days</div>
        </div>
      )
    },
    {
      id: 'balance',
      header: 'Balance',
      accessor: 'totalBalance',
      sortable: true,
      align: 'center',
      render: (value) => (
        <div>
          <div className="text-lg font-bold text-green-700">{value}</div>
          <div className="text-xs text-gray-500">days</div>
        </div>
      )
    },
    {
      id: 'utilization',
      header: 'Utilization',
      accessor: 'avgUtilization',
      sortable: true,
      render: (value) => {
        let colorClass = 'bg-green-500';
        let bgClass = 'bg-green-50';
        let textClass = 'text-green-700';

        if (value >= 75) {
          colorClass = 'bg-red-500';
          bgClass = 'bg-red-50';
          textClass = 'text-red-700';
        } else if (value >= 50) {
          colorClass = 'bg-yellow-500';
          bgClass = 'bg-yellow-50';
          textClass = 'text-yellow-700';
        }

        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-semibold ${textClass}`}>{value}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${colorClass} rounded-full transition-all`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      id: 'topLeave',
      header: 'Top Leave Type',
      accessor: 'topLeaveType',
      sortable: true,
      align: 'center',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 font-mono">
          {value}
        </span>
      )
    },
    {
      id: 'critical',
      header: 'Critical',
      accessor: 'criticalCount',
      sortable: true,
      align: 'center',
      render: (value) => value > 0 ? (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <AlertCircle className="w-3 h-3" />
          {value}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      align: 'right',
      render: (_, row) => (
        <button
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          onClick={(e) => {
            e.stopPropagation();
            console.log('View details:', row);
          }}
        >
          View Details →
        </button>
      )
    }
  ];

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="w-7 h-7 text-purple-600" />
            Department Leave Balance
          </h1>
          <p className="text-gray-600 mt-1">Organization-wide leave analytics and department comparison</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToCsv('department-leave-balance', filteredData)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Organization-wide Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Departments</div>
            <Building className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{departments.length}</div>
          <div className="text-xs text-gray-500 mt-1">total</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-blue-700 font-medium">Total Employees</div>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{totalEmployees}</div>
          <div className="text-xs text-blue-600 mt-1">across org</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-green-700 font-medium">Total Entitlement</div>
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{totalEntitlement}</div>
          <div className="text-xs text-green-600 mt-1">days</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-red-700 font-medium">Total Taken</div>
            <TrendingUp className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-900">{totalTaken}</div>
          <div className="text-xs text-red-600 mt-1">{avgOrgUtilization}% utilized</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-orange-700 font-medium">On Leave Today</div>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-900">{totalOnLeave}</div>
          <div className="text-xs text-orange-600 mt-1">{totalUpcoming} upcoming</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-red-700 font-medium">Critical</div>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-900">{totalCritical}</div>
          <div className="text-xs text-red-600 mt-1">low balance</div>
        </div>
      </div>

      {/* Department Comparison Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Department Leave Utilization Comparison
          </h2>
        </div>

        <div className="space-y-2">
          {departments.map((dept) => (
            <div key={dept.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900 min-w-[140px]">{dept.department}</span>
                  <span className="text-sm text-gray-500">{dept.totalEmployees} employees</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{dept.totalTaken} / {dept.totalEntitlement}</div>
                    <div className="text-xs text-gray-500">{dept.avgUtilization}% utilized</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      dept.avgUtilization >= 75 ? 'bg-red-500' :
                      dept.avgUtilization >= 50 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${dept.avgUtilization}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <DataTable
          data={filteredData}
          columns={columns}
          pagination={{
            enabled: false
          }}
          sorting={{
            enabled: true,
            defaultSort: { column: 'department', direction: 'asc' }
          }}
          emptyMessage="No departments found"
          emptyDescription="Try adjusting your search to find what you're looking for."
        />
      </div>

      {/* Information Panel */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Department Analytics Insights
        </h3>
        <ul className="text-sm text-purple-800 space-y-1 ml-7">
          <li>• Organization-wide leave utilization is {avgOrgUtilization}%</li>
          <li>• {totalCritical} employees across departments have critical low leave balance</li>
          <li>• Production department has the highest workforce ({departments.find(d => d.departmentCode === 'PROD')?.totalEmployees} employees)</li>
          <li>• Currently {totalOnLeave} employees on leave with {totalUpcoming} upcoming scheduled leaves</li>
          <li>• Monitor departments with high utilization (&gt;75%) to ensure adequate coverage</li>
        </ul>
      </div>
    </div>
  );
}
