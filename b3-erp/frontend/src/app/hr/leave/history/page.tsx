'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { History, Search, Filter, Download, X, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LeaveService } from '@/services/leave.service';

interface LeaveRecord {
  id: string;
  leaveType: string;
  leaveTypeCode: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: 'approved' | 'rejected' | 'cancelled';
  appliedOn: string;
  approvedBy?: string;
  approvedOn?: string;
  rejectionReason?: string;
}

export default function LeaveHistoryPage() {
  const [leaveHistory, setLeaveHistory] = useState<LeaveRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // History = decided (non-pending) applications.
        const raw = (await LeaveService.getLeaveApplications()) as any[];
        const mapped: LeaveRecord[] = raw
          .filter((a) => {
            const s = String(a.status ?? '').toLowerCase();
            return s !== 'pending' && s !== 'draft';
          })
          .map((a) => ({
            id: a.id,
            leaveType: a.leaveTypeName ?? a.leaveType?.name ?? a.leaveType ?? '',
            leaveTypeCode: a.leaveTypeCode ?? a.leaveType?.code ?? '',
            fromDate: a.startDate ?? a.fromDate ?? '',
            toDate: a.endDate ?? a.toDate ?? '',
            days: Number(a.numberOfDays ?? a.days ?? a.totalDays ?? 0),
            reason: a.reason ?? '',
            status: (String(a.status ?? '').toLowerCase() as LeaveRecord['status']) || 'approved',
            appliedOn: a.appliedDate ?? a.appliedOn ?? a.createdAt ?? '',
            approvedBy: a.approvedByName ?? a.approvedBy ?? undefined,
            approvedOn: a.approvedDate ?? a.approvedOn ?? undefined,
            rejectionReason: a.rejectionReason ?? undefined,
          }));
        if (!cancelled) setLeaveHistory(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load leave history');
          setLeaveHistory([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredData = useMemo(() => {
    return leaveHistory.filter(leave => {
      const matchesSearch = leave.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) || leave.reason.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || leave.status === filterStatus;
      const matchesType = filterType === 'all' || leave.leaveTypeCode === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [leaveHistory, searchTerm, filterStatus, filterType]);

  const getStatusBadge = (status: string) => {
    if (status === 'approved') return <StatusBadge status="success" text="Approved" />;
    if (status === 'rejected') return <StatusBadge status="error" text="Rejected" />;
    return <StatusBadge status="warning" text="Cancelled" />;
  };

  const columns: Column<LeaveRecord>[] = [
    {
      id: 'leaveType',
      header: 'Leave Type',
      accessor: 'leaveType',
      sortable: true,
      render: (v, row) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.leaveTypeCode}</div>
        </div>
      )
    },
    {
      id: 'period',
      header: 'Period',
      accessor: 'fromDate',
      sortable: true,
      render: (v, row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {new Date(v).toLocaleDateString()} - {new Date(row.toDate).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500">{row.days} {row.days === 1 ? 'day' : 'days'}</div>
        </div>
      )
    },
    {
      id: 'reason',
      header: 'Reason',
      accessor: 'reason',
      sortable: false,
      render: (v) => <div className="text-sm text-gray-700 max-w-xs truncate" title={v}>{v}</div>
    },
    {
      id: 'appliedOn',
      header: 'Applied On',
      accessor: 'appliedOn',
      sortable: true,
      render: (v) => <div className="text-sm text-gray-600">{new Date(v).toLocaleDateString()}</div>
    },
    {
      id: 'approver',
      header: 'Approver',
      accessor: 'approvedBy',
      sortable: false,
      render: (v, row) => (
        <div className="text-xs">
          {v && <div className="text-gray-900">{v}</div>}
          {row.approvedOn && <div className="text-gray-500">{new Date(row.approvedOn).toLocaleDateString()}</div>}
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (v, row) => (
        <div>
          {getStatusBadge(v)}
          {row.rejectionReason && <div className="text-xs text-red-600 mt-1">{row.rejectionReason}</div>}
        </div>
      )
    }
  ];

  const stats = useMemo(() => {
    const approved = leaveHistory.filter(l => l.status === 'approved').length;
    const rejected = leaveHistory.filter(l => l.status === 'rejected').length;
    const totalDays = leaveHistory.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.days, 0);
    return { total: leaveHistory.length, approved, rejected, totalDays };
  }, [leaveHistory]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterType('all');
  };

  const activeFilterCount = [filterStatus !== 'all', filterType !== 'all', searchTerm !== ''].filter(Boolean).length;

  return (
    <div className="p-6 space-y-3">
      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading leave history…
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
            <History className="w-7 h-7 text-blue-600" />
            Leave History
          </h1>
          <p className="text-gray-600 mt-1">View your complete leave records and history</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Total Applications</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Approved</div>
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Rejected</div>
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Total Days Taken</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalDays}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by leave type or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900">
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="all">All Types</option>
                <option value="EL">Earned Leave</option>
                <option value="CL">Casual Leave</option>
                <option value="SL">Sick Leave</option>
                <option value="PL">Privilege Leave</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <DataTable
          data={filteredData}
          columns={columns}
          pagination={{ enabled: true, pageSize: 10 }}
          sorting={{ enabled: true, defaultSort: { column: 'appliedOn', direction: 'desc' } }}
          emptyMessage="No leave history found"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2">
          <History className="w-5 h-5 inline mr-2" />
          Leave History Tracking
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>✓ Complete chronological history of all leave applications and their status</li>
          <li>✓ Approval workflow tracking with approver details and timestamps</li>
          <li>✓ Rejection reasons displayed for transparency and learning</li>
          <li>✓ Export functionality for personal records and compliance</li>
        </ul>
      </div>
    </div>
  );
}
