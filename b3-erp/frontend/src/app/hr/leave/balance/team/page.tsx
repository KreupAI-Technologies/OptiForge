'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, Filter, X, Download, Calendar, AlertCircle, TrendingUp, UserCheck } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { TeamMemberLeaveSummary } from '@/data/hr/leave-balances';
import { exportToCsv } from '@/lib/export';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function TeamLeaveBalancePage() {
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMemberLeaveSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDesignation, setFilterDesignation] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMemberLeaveSummary | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Fix hydration issues with date formatting
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch team leave balances from backend
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/hr/leave-balances?companyId=default-company-id`);
        if (!res.ok) {
          if (!cancelled) setTeamMembers([]);
          return;
        }
        const json = await res.json();
        const rows = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
        if (!Array.isArray(rows) || rows.length === 0) {
          if (!cancelled) setTeamMembers([]);
          return;
        }
        // Map raw leave-balance rows defensively into TeamMemberLeaveSummary shape.
        const mapped = rows.map((r: any) => {
          const totalEntitlement = Number(r?.totalEntitlement ?? r?.entitlement ?? r?.allocated ?? 0) || 0;
          const totalTaken = Number(r?.totalTaken ?? r?.taken ?? r?.used ?? 0) || 0;
          const totalPending = Number(r?.totalPending ?? r?.pending ?? 0) || 0;
          const totalBalance = Number(r?.totalBalance ?? r?.balance ?? r?.available ?? (totalEntitlement - totalTaken)) || 0;
          return {
            id: String(r?.id ?? r?._id ?? r?.employeeId ?? ''),
            employeeId: String(r?.employeeId ?? r?.id ?? ''),
            employeeName: String(r?.employeeName ?? r?.name ?? ''),
            employeeCode: String(r?.employeeCode ?? r?.code ?? ''),
            designation: String(r?.designation ?? ''),
            department: String(r?.department ?? ''),
            shift: r?.shift ?? '',
            totalEntitlement,
            totalTaken,
            totalPending,
            totalBalance,
            status: String(r?.status ?? 'active'),
            lastLeaveDate: r?.lastLeaveDate ?? null,
            upcomingLeave: r?.upcomingLeave ?? null,
          };
        }) as TeamMemberLeaveSummary[];
        if (!cancelled) setTeamMembers(mapped);
      } catch {
        if (!cancelled) setTeamMembers([]);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Consistent date formatter
  const formatDate = (dateString: string, includeYear = false) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return includeYear ? `${day} ${month} ${year}` : `${day} ${month}`;
  };

  // Get unique filter options
  const shifts = useMemo(() => {
    const unique = Array.from(new Set(teamMembers.map(m => m.shift).filter(Boolean))).sort();
    return unique;
  }, [teamMembers]);

  const designations = useMemo(() => {
    const unique = Array.from(new Set(teamMembers.map(m => m.designation))).sort();
    return unique;
  }, [teamMembers]);

  // Filtered data
  const filteredData = useMemo(() => {
    return teamMembers.filter(member => {
      const matchesSearch =
        member.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.designation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesShift = filterShift === 'all' || member.shift === filterShift;
      const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
      const matchesDesignation = filterDesignation === 'all' || member.designation === filterDesignation;

      return matchesSearch && matchesShift && matchesStatus && matchesDesignation;
    });
  }, [teamMembers, searchTerm, filterShift, filterStatus, filterDesignation]);

  // Calculate team stats
  const totalEntitlement = teamMembers.reduce((sum, m) => sum + m.totalEntitlement, 0);
  const totalTaken = teamMembers.reduce((sum, m) => sum + m.totalTaken, 0);
  const totalPending = teamMembers.reduce((sum, m) => sum + m.totalPending, 0);
  const totalBalance = teamMembers.reduce((sum, m) => sum + m.totalBalance, 0);
  const avgUtilization = teamMembers.length > 0
    ? Math.round((totalTaken / totalEntitlement) * 100)
    : 0;

  const onLeaveCount = teamMembers.filter(m => m.status === 'on-leave').length;
  const upcomingLeaveCount = teamMembers.filter(m => m.status === 'upcoming-leave').length;

  // Table columns
  const columns: Column<TeamMemberLeaveSummary>[] = [
    {
      id: 'employee',
      header: 'Employee',
      accessor: 'employeeName',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span className="font-mono">{row.employeeCode}</span>
            {row.shift && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                Shift {row.shift}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'designation',
      header: 'Designation',
      accessor: 'designation',
      sortable: true,
      render: (value) => <span className="text-sm text-gray-700">{value}</span>
    },
    {
      id: 'entitlement',
      header: 'Entitlement',
      accessor: 'totalEntitlement',
      sortable: true,
      align: 'center',
      render: (value) => (
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-semibold">
          {value}
        </span>
      )
    },
    {
      id: 'taken',
      header: 'Taken',
      accessor: 'totalTaken',
      sortable: true,
      align: 'center',
      render: (value) => (
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-700 font-semibold">
          {value}
        </span>
      )
    },
    {
      id: 'pending',
      header: 'Pending',
      accessor: 'totalPending',
      sortable: true,
      align: 'center',
      render: (value) => (
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
          {value || '-'}
        </span>
      )
    },
    {
      id: 'balance',
      header: 'Balance',
      accessor: 'totalBalance',
      sortable: true,
      align: 'center',
      render: (value) => (
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-700 font-semibold">
          {value}
        </span>
      )
    },
    {
      id: 'utilization',
      header: 'Utilization',
      accessor: 'totalEntitlement',
      sortable: true,
      render: (_, row) => {
        const percentage = row.totalEntitlement > 0
          ? Math.round((row.totalTaken / row.totalEntitlement) * 100)
          : 0;

        let colorClass = 'bg-green-500';
        if (percentage >= 75) colorClass = 'bg-red-500';
        else if (percentage >= 50) colorClass = 'bg-yellow-500';

        return (
          <div className="w-full">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">{percentage}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${colorClass} rounded-full transition-all`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      id: 'lastLeave',
      header: 'Last Leave',
      accessor: 'lastLeaveDate',
      sortable: true,
      render: (value) => value ? (
        <span className="text-sm text-gray-600">
          {formatDate(value, true)}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
    {
      id: 'upcoming',
      header: 'Upcoming Leave',
      accessor: 'upcomingLeave',
      sortable: false,
      render: (value) => value ? (
        <div className="text-xs">
          <div className="font-medium text-gray-900">
            {formatDate(value.fromDate)}
            {value.fromDate !== value.toDate && (
              <> - {formatDate(value.toDate)}</>
            )}
          </div>
          <div className="text-gray-500 flex items-center gap-1">
            <span className="font-mono font-semibold">{value.leaveType}</span>
            <span>•</span>
            <span>{value.days}d</span>
          </div>
        </div>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (value) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          'active': { text: 'Active', color: 'bg-green-100 text-green-800' },
          'on-leave': { text: 'On Leave', color: 'bg-red-100 text-red-800' },
          'upcoming-leave': { text: 'Upcoming', color: 'bg-yellow-100 text-yellow-800' }
        };
        const config = statusMap[value] || statusMap.active;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {config.text}
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMember(row);
            }}
          >
            View Details
          </button>
        </div>
      )
    }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setFilterShift('all');
    setFilterStatus('all');
    setFilterDesignation('all');
  };

  const activeFilterCount = [
    filterShift !== 'all',
    filterStatus !== 'all',
    filterDesignation !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Team Leave Balance
          </h1>
          <p className="text-gray-600 mt-1">Monitor and manage your team's leave balances and availability</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToCsv('team-leave-balance', filteredData)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Team Size</div>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{teamMembers.length}</div>
          <div className="text-xs text-gray-500 mt-1">members</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-blue-700 font-medium">Total Entitlement</div>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{totalEntitlement}</div>
          <div className="text-xs text-blue-600 mt-1">days</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-red-700 font-medium">Taken</div>
            <TrendingUp className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-900">{totalTaken}</div>
          <div className="text-xs text-red-600 mt-1">{avgUtilization}% utilized</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-green-700 font-medium">Available</div>
            <UserCheck className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{totalBalance}</div>
          <div className="text-xs text-green-600 mt-1">days remaining</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-orange-700 font-medium">On Leave</div>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-900">{onLeaveCount}</div>
          <div className="text-xs text-orange-600 mt-1">currently away</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-yellow-700 font-medium">Upcoming</div>
            <Calendar className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-900">{upcomingLeaveCount}</div>
          <div className="text-xs text-yellow-600 mt-1">scheduled</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee name, code, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shift
              </label>
              <select
                value={filterShift}
                onChange={(e) => setFilterShift(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Shifts</option>
                {shifts.map(shift => (
                  <option key={shift} value={shift}>Shift {shift}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="on-leave">On Leave</option>
                <option value="upcoming-leave">Upcoming Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation
              </label>
              <select
                value={filterDesignation}
                onChange={(e) => setFilterDesignation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Designations</option>
                {designations.map(designation => (
                  <option key={designation} value={designation}>{designation}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <DataTable
          data={filteredData}
          columns={columns}
          pagination={{
            enabled: true,
            pageSize: 10
          }}
          sorting={{
            enabled: true,
            defaultSort: { column: 'employeeName', direction: 'asc' }
          }}
          emptyMessage="No team members found"
          emptyDescription="Try adjusting your search or filters to find what you're looking for."
        />
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Team Leave Management Tips
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>• Monitor team availability to ensure adequate shift coverage</li>
          <li>• Plan for upcoming leaves to redistribute workload in advance</li>
          <li>• Currently {onLeaveCount} team member{onLeaveCount !== 1 ? 's are' : ' is'} on leave</li>
          <li>• {upcomingLeaveCount} team member{upcomingLeaveCount !== 1 ? 's have' : ' has'} scheduled upcoming leave</li>
          <li>• Average leave utilization for the team is {avgUtilization}%</li>
        </ul>
      </div>

      {/* Team Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-t-lg flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedMember.employeeName}</h2>
                <p className="text-blue-100 mt-1">
                  {selectedMember.employeeCode} • {selectedMember.designation}
                </p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-3">
              {/* Employee Information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Department</div>
                  <div className="font-semibold text-gray-900">{selectedMember.department}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Designation</div>
                  <div className="font-semibold text-gray-900">{selectedMember.designation}</div>
                </div>
                {selectedMember.shift && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Shift</div>
                    <div className="font-semibold text-gray-900">Shift {selectedMember.shift}</div>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Status</div>
                  <div className="font-semibold text-gray-900 capitalize">
                    {selectedMember.status.replace('-', ' ')}
                  </div>
                </div>
              </div>

              {/* Leave Summary Stats */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Leave Balance Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-3">
                    <div className="text-sm text-blue-700 font-medium mb-2">Total Entitlement</div>
                    <div className="text-3xl font-bold text-blue-900">{selectedMember.totalEntitlement}</div>
                    <div className="text-xs text-blue-600 mt-1">days per year</div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-3">
                    <div className="text-sm text-red-700 font-medium mb-2">Taken</div>
                    <div className="text-3xl font-bold text-red-900">{selectedMember.totalTaken}</div>
                    <div className="text-xs text-red-600 mt-1">days used</div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 p-3">
                    <div className="text-sm text-yellow-700 font-medium mb-2">Pending</div>
                    <div className="text-3xl font-bold text-yellow-900">{selectedMember.totalPending}</div>
                    <div className="text-xs text-yellow-600 mt-1">awaiting approval</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-3">
                    <div className="text-sm text-green-700 font-medium mb-2">Available</div>
                    <div className="text-3xl font-bold text-green-900">{selectedMember.totalBalance}</div>
                    <div className="text-xs text-green-600 mt-1">days remaining</div>
                  </div>
                </div>
              </div>

              {/* Utilization Chart */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Leave Utilization</h4>
                <div className="relative">
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                      style={{
                        width: `${selectedMember.totalEntitlement > 0
                          ? Math.round((selectedMember.totalTaken / selectedMember.totalEntitlement) * 100)
                          : 0}%`
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                    <span>
                      {selectedMember.totalEntitlement > 0
                        ? Math.round((selectedMember.totalTaken / selectedMember.totalEntitlement) * 100)
                        : 0}% utilized
                    </span>
                    <span>{selectedMember.totalTaken} / {selectedMember.totalEntitlement} days</span>
                  </div>
                </div>
              </div>

              {/* Leave History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Leave Information</h3>
                <div className="space-y-3">
                  {selectedMember.lastLeaveDate && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Last Leave Date</div>
                          <div className="text-xs text-gray-600">Most recent leave taken</div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatDate(selectedMember.lastLeaveDate, true)}
                      </div>
                    </div>
                  )}

                  {selectedMember.upcomingLeave && (
                    <div className="flex items-start justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-amber-900">Upcoming Leave</div>
                          <div className="text-xs text-amber-700 mt-1">
                            {formatDate(selectedMember.upcomingLeave.fromDate)}
                            {selectedMember.upcomingLeave.fromDate !== selectedMember.upcomingLeave.toDate && (
                              <> - {formatDate(selectedMember.upcomingLeave.toDate, true)}</>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-amber-900">
                          {selectedMember.upcomingLeave.days} day{selectedMember.upcomingLeave.days !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-amber-700 font-mono">
                          {selectedMember.upcomingLeave.leaveType}
                        </div>
                      </div>
                    </div>
                  )}

                  {!selectedMember.lastLeaveDate && !selectedMember.upcomingLeave && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-sm">No recent leave history</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedMember(null);
                    // Navigate to employee profile or detailed leave view
                    router.push(`/hr/employees/${selectedMember.employeeId}`);
                  }}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  View Employee Profile
                </button>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
