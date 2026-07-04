'use client';

import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, Search, Filter, X, Calendar, AlertCircle, User, FileText, Clock } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { mockPendingLeaveApprovals, LeaveTransaction } from '@/data/hr/leave-balances';
import { LeaveService } from '@/services/leave.service';

export default function LeaveApprovalsPage() {
  const [applications, setApplications] = useState<LeaveTransaction[]>(mockPendingLeaveApprovals);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLeaveType, setFilterLeaveType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<LeaveTransaction | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());

  // Get unique leave types
  const leaveTypes = useMemo(() => {
    const unique = Array.from(new Set(applications.map(a => a.leaveTypeCode))).sort();
    return unique;
  }, [applications]);

  // Filtered data
  const filteredData = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch =
        app.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.leaveTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLeaveType = filterLeaveType === 'all' || app.leaveTypeCode === filterLeaveType;

      return matchesSearch && matchesLeaveType;
    });
  }, [applications, searchTerm, filterLeaveType]);

  // Calculate stats
  const pendingCount = applications.length;
  const urgentCount = applications.filter(a => {
    const fromDate = new Date(a.fromDate);
    const today = new Date();
    const daysUntil = Math.ceil((fromDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 2;
  }).length;

  const totalDays = applications.reduce((sum, a) => sum + a.days, 0);

  // Check if application is urgent
  const isUrgent = (fromDate: string) => {
    const date = new Date(fromDate);
    const today = new Date();
    const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 2 && daysUntil >= 0;
  };

  // Table columns
  const columns: Column<LeaveTransaction>[] = [
    {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          checked={selectedApplications.size === filteredData.length && filteredData.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedApplications(new Set(filteredData.map(a => a.id)));
            } else {
              setSelectedApplications(new Set());
            }
          }}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
      ),
      accessor: 'id',
      sortable: false,
      render: (value) => (
        <input
          type="checkbox"
          checked={selectedApplications.has(value)}
          onChange={(e) => {
            const newSet = new Set(selectedApplications);
            if (e.target.checked) {
              newSet.add(value);
            } else {
              newSet.delete(value);
            }
            setSelectedApplications(newSet);
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
      )
    },
    {
      id: 'priority',
      header: '',
      accessor: 'fromDate',
      sortable: false,
      render: (value) => isUrgent(value) ? (
        <div className="flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
      ) : null
    },
    {
      id: 'employee',
      header: 'Employee',
      accessor: 'employeeName',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 font-mono">{row.employeeId}</div>
          </div>
        </div>
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
      render: (value) => {
        const date = new Date(value);
        const hoursAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
        return (
          <div className="text-sm">
            <div className="text-gray-900">
              {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
            </div>
            <div className="text-xs text-gray-500">
              {hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`}
            </div>
          </div>
        );
      }
    },
    {
      id: 'reason',
      header: 'Reason',
      accessor: 'reason',
      sortable: false,
      render: (value) => (
        <div className="text-sm text-gray-700 max-w-xs truncate" title={value}>
          {value}
        </div>
      )
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
              setSelectedApplication(row);
              setShowApprovalModal(true);
              setApprovalAction('approve');
            }}
          >
            View Details
          </button>
          <button
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleApprove(row.id);
            }}
          >
            <CheckCircle className="w-4 h-4" />
            Approve
          </button>
          <button
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedApplication(row);
              setApprovalAction('reject');
              setShowApprovalModal(true);
            }}
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        </div>
      )
    }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setFilterLeaveType('all');
  };

  const activeFilterCount = [
    filterLeaveType !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  const handleApprove = async (id: string) => {
    try {
      await LeaveService.approveLeave(id);
      setApplications(prev => prev.filter(app => app.id !== id));
      alert(`Application ${id} has been approved successfully.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve application.');
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await LeaveService.rejectLeave(id, reason);
      setApplications(prev => prev.filter(app => app.id !== id));
      alert(`Application ${id} has been rejected.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject application.');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedApplications.size === 0) {
      alert('Please select applications to approve');
      return;
    }
    const ids = Array.from(selectedApplications);
    try {
      await Promise.all(ids.map(id => LeaveService.approveLeave(id)));
      setApplications(prev => prev.filter(app => !selectedApplications.has(app.id)));
      setSelectedApplications(new Set());
      alert(`${ids.length} applications approved successfully.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve some applications.');
    }
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-7 h-7 text-green-600" />
            Leave Approvals
          </h1>
          <p className="text-gray-600 mt-1">Review and approve pending leave applications from your team</p>
        </div>
        {selectedApplications.size > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{selectedApplications.size} selected</span>
            <button
              onClick={handleBulkApprove}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Approve Selected
            </button>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-yellow-700 font-medium">Pending Approval</div>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold text-yellow-900">{pendingCount}</div>
          <div className="text-xs text-yellow-600 mt-1">applications</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-red-700 font-medium">Urgent</div>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-900">{urgentCount}</div>
          <div className="text-xs text-red-600 mt-1">starting ≤ 2 days</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-blue-700 font-medium">Total Days</div>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-900">{totalDays}</div>
          <div className="text-xs text-blue-600 mt-1">if all approved</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-purple-700 font-medium">Team Members</div>
            <User className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-900">
            {new Set(applications.map(a => a.employeeId)).size}
          </div>
          <div className="text-xs text-purple-600 mt-1">requesting</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee name, application ID, or reason..."
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
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type
              </label>
              <select
                value={filterLeaveType}
                onChange={(e) => setFilterLeaveType(e.target.value)}
                className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            defaultSort: { column: 'appliedOn', direction: 'asc' }
          }}
          emptyMessage="No pending leave applications"
          emptyDescription="All leave requests have been processed. Great job!"
        />
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                {approvalAction === 'approve' ? 'Approve Leave Application' : 'Reject Leave Application'}
              </h2>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setRejectionReason('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Employee Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-blue-900">{selectedApplication.employeeName}</div>
                    <div className="text-sm text-blue-700">ID: {selectedApplication.employeeId}</div>
                  </div>
                </div>
              </div>

              {/* Leave Details */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Leave Type</div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedApplication.leaveTypeIcon}</span>
                    <span className="font-medium">{selectedApplication.leaveTypeName}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Duration</div>
                  <div className="font-semibold text-lg">{selectedApplication.days} day{selectedApplication.days !== 1 ? 's' : ''}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">From</div>
                  <div className="font-medium">
                    {new Date(selectedApplication.fromDate).toLocaleDateString('en-GB', {
                      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">To</div>
                  <div className="font-medium">
                    {new Date(selectedApplication.toDate).toLocaleDateString('en-GB', {
                      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Reason</div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{selectedApplication.reason}</p>
                </div>
              </div>

              {/* Emergency Contact */}
              {selectedApplication.emergencyContact && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</div>
                  <div className="text-sm font-mono text-gray-900">{selectedApplication.emergencyContact}</div>
                </div>
              )}

              {/* Rejection Reason (if rejecting) */}
              {approvalAction === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Please provide a clear reason for rejection..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This reason will be shared with the employee
                  </p>
                </div>
              )}

              {/* Urgent Warning */}
              {isUrgent(selectedApplication.fromDate) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <strong>Urgent:</strong> This leave starts within the next 2 days. Please process promptly.
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              {approvalAction === 'approve' ? (
                <button
                  onClick={() => {
                    handleApprove(selectedApplication.id);
                    setShowApprovalModal(false);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Leave
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (!rejectionReason.trim()) {
                      alert('Please provide a rejection reason');
                      return;
                    }
                    handleReject(selectedApplication.id, rejectionReason);
                    setShowApprovalModal(false);
                    setRejectionReason('');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Leave
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Information Panel */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Approval Guidelines
        </h3>
        <ul className="text-sm text-green-800 space-y-1 ml-7">
          <li>• Review applications marked with <AlertCircle className="w-4 h-4 inline text-red-500" /> as urgent priority</li>
          <li>• Check team coverage and shift schedules before approving multiple leaves on same dates</li>
          <li>• Medical certificates required for sick leave exceeding 3 consecutive days</li>
          <li>• Festival leaves should be distributed fairly among team members</li>
          <li>• Use bulk approval for pre-approved leave requests to save time</li>
          <li>• Always provide clear rejection reasons to help employees understand decisions</li>
        </ul>
      </div>
    </div>
  );
}
