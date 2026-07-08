'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Clock, Search, Filter, X, Calendar, CheckCircle, XCircle, AlertCircle, FileText, Download, Trash2 } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LeaveTransaction } from '@/data/hr/leave-balances';
import { LeaveService } from '@/services/leave.service';

const STATUS_MAP: Record<string, LeaveTransaction['status']> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  WITHDRAWN: 'withdrawn',
};

export default function LeaveStatusPage() {
  const [transactions, setTransactions] = useState<LeaveTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await LeaveService.getAllLeaveApplicationsRaw()) as any[];
        const mapped: LeaveTransaction[] = raw.map((r) => ({
          id: r.id,
          employeeId: r.employeeId ?? '',
          employeeName: r.employeeName ?? r.employee?.fullName,
          leaveTypeCode: r.leaveTypeCode ?? r.leaveType?.code ?? '',
          leaveTypeName: r.leaveTypeName ?? r.leaveType?.name ?? '',
          leaveTypeIcon: r.leaveType?.color ? undefined : undefined,
          fromDate: r.startDate ?? r.fromDate ?? '',
          toDate: r.endDate ?? r.toDate ?? '',
          days: Number(r.totalDays ?? r.days ?? 0),
          durationType: 'full-day',
          reason: r.reason ?? '',
          status: STATUS_MAP[r.status] ?? 'pending',
          appliedOn: r.appliedAt ?? r.createdAt ?? '',
          approvedBy: r.approverName ?? r.approvedBy,
          approvedOn: r.approvedAt,
          rejectedBy: r.status === 'REJECTED' ? r.approverName ?? r.approvedBy : undefined,
          rejectedOn: r.status === 'REJECTED' ? r.approvedAt : undefined,
          rejectionReason: r.rejectionReason,
          hasAttachment: !!r.attachmentUrl,
        }));
        if (!cancelled) setTransactions(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load leave applications');
          setTransactions([]);
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLeaveType, setFilterLeaveType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<LeaveTransaction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const reload = async () => {
    try {
      const raw = (await LeaveService.getAllLeaveApplicationsRaw()) as any[];
      const mapped: LeaveTransaction[] = raw.map((r) => ({
        id: r.id,
        employeeId: r.employeeId ?? '',
        employeeName: r.employeeName ?? r.employee?.fullName,
        leaveTypeCode: r.leaveTypeCode ?? r.leaveType?.code ?? '',
        leaveTypeName: r.leaveTypeName ?? r.leaveType?.name ?? '',
        leaveTypeIcon: undefined,
        fromDate: r.startDate ?? r.fromDate ?? '',
        toDate: r.endDate ?? r.toDate ?? '',
        days: Number(r.totalDays ?? r.days ?? 0),
        durationType: 'full-day',
        reason: r.reason ?? '',
        status: STATUS_MAP[r.status] ?? 'pending',
        appliedOn: r.appliedAt ?? r.createdAt ?? '',
        approvedBy: r.approverName ?? r.approvedBy,
        approvedOn: r.approvedAt,
        rejectedBy: r.status === 'REJECTED' ? r.approverName ?? r.approvedBy : undefined,
        rejectedOn: r.status === 'REJECTED' ? r.approvedAt : undefined,
        rejectionReason: r.rejectionReason,
        hasAttachment: !!r.attachmentUrl,
      }));
      setTransactions(mapped);
    } catch {
      /* keep existing rows on refresh failure */
    }
  };

  // Get unique leave types
  const leaveTypes = useMemo(() => {
    const unique = Array.from(new Set(transactions.map(t => t.leaveTypeCode))).sort();
    return unique;
  }, [transactions]);

  // Filtered data
  const filteredData = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch =
        transaction.leaveTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
      const matchesLeaveType = filterLeaveType === 'all' || transaction.leaveTypeCode === filterLeaveType;

      return matchesSearch && matchesStatus && matchesLeaveType;
    });
  }, [transactions, searchTerm, filterStatus, filterLeaveType]);

  // Calculate stats
  const totalApplications = transactions.length;
  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const approvedCount = transactions.filter(t => t.status === 'approved').length;
  const rejectedCount = transactions.filter(t => t.status === 'rejected').length;
  const withdrawnCount = transactions.filter(t => t.status === 'withdrawn').length;

  // Table columns
  const columns: Column<LeaveTransaction>[] = [
    {
      id: 'applicationId',
      header: 'Application ID',
      accessor: 'id',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-xs font-semibold text-blue-600">{value}</span>
      )
    },
    {
      id: 'leaveType',
      header: 'Leave Type',
      accessor: 'leaveTypeName',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span className="text-xl">{row.leaveTypeIcon}</span>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 font-mono">{row.leaveTypeCode}</div>
          </div>
        </div>
      )
    },
    {
      id: 'period',
      header: 'Leave Period',
      accessor: 'fromDate',
      sortable: true,
      render: (_, row) => (
        <div>
          <div className="text-sm text-gray-900">
            {new Date(row.fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            {row.fromDate !== row.toDate && (
              <>
                <br />
                to {new Date(row.toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </>
            )}
          </div>
          {row.durationType && row.durationType !== 'full-day' && (
            <div className="text-xs text-gray-500 mt-1">
              {row.durationType === 'half-day-first' ? 'Half Day (Morning)' : 'Half Day (Afternoon)'}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'days',
      header: 'Days',
      accessor: 'days',
      sortable: true,
      align: 'center',
      render: (value) => (
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
          {value}
        </span>
      )
    },
    {
      id: 'appliedOn',
      header: 'Applied On',
      accessor: 'appliedOn',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          <br />
          <span className="text-xs text-gray-500">
            {new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      sortable: true,
      align: 'center',
      render: (value) => <StatusBadge status={value} />
    },
    {
      id: 'approver',
      header: 'Approver/Action',
      accessor: 'approvedBy',
      sortable: false,
      render: (_, row) => {
        if (row.status === 'approved' && row.approvedBy) {
          return (
            <div className="text-sm">
              <div className="text-gray-900 font-medium">{row.approvedBy}</div>
              <div className="text-xs text-gray-500">
                {row.approvedOn && new Date(row.approvedOn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </div>
            </div>
          );
        } else if (row.status === 'rejected' && row.rejectedBy) {
          return (
            <div className="text-sm">
              <div className="text-red-900 font-medium">{row.rejectedBy}</div>
              <div className="text-xs text-red-600">
                {row.rejectedOn && new Date(row.rejectedOn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </div>
            </div>
          );
        } else if (row.status === 'pending') {
          return <span className="text-xs text-yellow-600 font-medium">Awaiting approval</span>;
        } else if (row.status === 'withdrawn') {
          return <span className="text-xs text-gray-600 font-medium">Self withdrawn</span>;
        }
        return <span className="text-gray-400">-</span>;
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
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTransaction(row);
              setShowDetailsModal(true);
            }}
          >
            View Details
          </button>
          {row.status === 'pending' && (
            <button
              className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
              disabled={withdrawingId === row.id}
              onClick={(e) => {
                e.stopPropagation();
                handleWithdraw(row.id);
              }}
            >
              {withdrawingId === row.id ? 'Withdrawing…' : 'Withdraw'}
            </button>
          )}
        </div>
      )
    }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterLeaveType('all');
  };

  const activeFilterCount = [
    filterStatus !== 'all',
    filterLeaveType !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  const handleWithdraw = async (id: string) => {
    if (withdrawingId) return;
    setWithdrawingId(id);
    setActionError(null);
    try {
      await LeaveService.withdrawLeave(id);
      await reload();
    } catch {
      setActionError(`Failed to withdraw application ${id}. Please try again.`);
    } finally {
      setWithdrawingId(null);
    }
  };

  const handleDownloadReport = () => {
    const header = ['Application ID', 'Leave Type', 'From', 'To', 'Days', 'Status', 'Applied On'];
    const rows = filteredData.map((t) => [
      t.id,
      t.leaveTypeName,
      t.fromDate,
      t.toDate,
      String(t.days),
      t.status,
      t.appliedOn,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-7 h-7 text-purple-600" />
            Leave Application Status
          </h1>
          <p className="text-gray-600 mt-1">Track and manage your leave application status</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* Loading / Error Banners */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-2 text-sm">
          Loading leave applications…
        </div>
      )}
      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-2 text-sm">
          {loadError}
        </div>
      )}
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-2 text-sm">
          {actionError}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Total Applications</div>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalApplications}</div>
          <div className="text-xs text-gray-500 mt-1">all time</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-yellow-700 font-medium">Pending</div>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-900">{pendingCount}</div>
          <div className="text-xs text-yellow-600 mt-1">awaiting approval</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-green-700 font-medium">Approved</div>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{approvedCount}</div>
          <div className="text-xs text-green-600 mt-1">confirmed</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-red-700 font-medium">Rejected</div>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-900">{rejectedCount}</div>
          <div className="text-xs text-red-600 mt-1">declined</div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-700 font-medium">Withdrawn</div>
            <Trash2 className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{withdrawnCount}</div>
          <div className="text-xs text-gray-600 mt-1">cancelled</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by application ID, leave type, or reason..."
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
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-2">
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type
              </label>
              <select
                value={filterLeaveType}
                onChange={(e) => setFilterLeaveType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Leave Types</option>
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
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
            defaultSort: { column: 'appliedOn', direction: 'desc' }
          }}
          emptyMessage="No leave applications found"
          emptyDescription="Try adjusting your search or filters to find what you're looking for."
        />
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-600" />
                Leave Application Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Application Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Application Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Application ID</div>
                    <div className="font-mono text-sm font-semibold text-blue-600">{selectedTransaction.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Status</div>
                    <StatusBadge status={selectedTransaction.status} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Leave Type</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{selectedTransaction.leaveTypeIcon}</span>
                      <span className="text-sm font-medium">{selectedTransaction.leaveTypeName}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Duration</div>
                    <div className="text-sm font-semibold">{selectedTransaction.days} day{selectedTransaction.days !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>

              {/* Leave Period */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Leave Period</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-blue-600 mb-1">From</div>
                      <div className="text-sm font-semibold text-blue-900">
                        {new Date(selectedTransaction.fromDate).toLocaleDateString('en-GB', {
                          weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </div>
                    </div>
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-xs text-blue-600 mb-1">To</div>
                      <div className="text-sm font-semibold text-blue-900">
                        {new Date(selectedTransaction.toDate).toLocaleDateString('en-GB', {
                          weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  {selectedTransaction.durationType && selectedTransaction.durationType !== 'full-day' && (
                    <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-blue-700">
                      {selectedTransaction.durationType === 'half-day-first' ? 'Half Day - First Half (9 AM - 1 PM)' : 'Half Day - Second Half (2 PM - 6 PM)'}
                    </div>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Reason</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{selectedTransaction.reason}</p>
                </div>
              </div>

              {/* Emergency Contact */}
              {selectedTransaction.emergencyContact && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Emergency Contact</h3>
                  <div className="text-sm text-gray-900 font-mono">{selectedTransaction.emergencyContact}</div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Application Submitted</div>
                      <div className="text-xs text-gray-500">
                        {new Date(selectedTransaction.appliedOn).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  {selectedTransaction.status === 'approved' && selectedTransaction.approvedOn && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-600 mt-1.5"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-green-900">Approved by {selectedTransaction.approvedBy}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(selectedTransaction.approvedOn).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTransaction.status === 'rejected' && selectedTransaction.rejectedOn && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-600 mt-1.5"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-red-900">Rejected by {selectedTransaction.rejectedBy}</div>
                        <div className="text-xs text-gray-500 mb-2">
                          {new Date(selectedTransaction.rejectedOn).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                        {selectedTransaction.rejectionReason && (
                          <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
                            <strong>Reason:</strong> {selectedTransaction.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedTransaction.status === 'withdrawn' && selectedTransaction.cancelledOn && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-gray-600 mt-1.5"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Application Withdrawn</div>
                        <div className="text-xs text-gray-500">
                          {new Date(selectedTransaction.cancelledOn).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Attachment */}
              {selectedTransaction.hasAttachment && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Attachments</h3>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Medical Certificate.pdf</div>
                      <div className="text-xs text-gray-500">245 KB</div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              {selectedTransaction.status === 'pending' && (
                <button
                  disabled={withdrawingId === selectedTransaction.id}
                  onClick={async () => {
                    await handleWithdraw(selectedTransaction.id);
                    setShowDetailsModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {withdrawingId === selectedTransaction.id ? 'Withdrawing…' : 'Withdraw Application'}
                </button>
              )}
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Information Panel */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Application Status Information
        </h3>
        <ul className="text-sm text-purple-800 space-y-1 ml-7">
          <li>• You currently have {pendingCount} pending application{pendingCount !== 1 ? 's' : ''} awaiting approval</li>
          <li>• Pending applications can be withdrawn before approval/rejection</li>
          <li>• Approved leaves will be reflected in your leave balance immediately</li>
          <li>• For urgent changes to approved leaves, contact your supervisor directly</li>
          <li>• Application timeline shows complete approval/rejection history</li>
        </ul>
      </div>
    </div>
  );
}
