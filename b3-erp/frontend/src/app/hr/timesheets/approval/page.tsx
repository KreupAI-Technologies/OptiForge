'use client';

import { useState, useMemo, useEffect } from 'react';
import { CheckCircle, Clock, Check, X, Eye, AlertCircle, Search, Filter, Calendar } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { HrPagesService } from '@/services/hr-pages.service';
import { TimesheetService } from '@/services/timesheet.service';

interface TimesheetSubmission {
  id: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  week: string;
  weekPeriod: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  projectCount: number;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function TimesheetApprovalPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState<TimesheetSubmission | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [submissions, setSubmissions] = useState<TimesheetSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = (await HrPagesService.timesheets()) as any[];
      const mapped: TimesheetSubmission[] = (raw ?? []).map((r, i) => {
        const s = String(r.status ?? '').toLowerCase();
        return {
          id: String(r.id ?? `${i}`),
          employeeCode: r.employeeCode ?? String(r.employeeId ?? ''),
          employeeName: r.employeeName ?? 'Unknown',
          department: r.department ?? 'Unassigned',
          week: r.week ?? '',
          weekPeriod: r.weekPeriod ?? '',
          totalHours: Number(r.totalHours ?? 0),
          regularHours: Number(r.regularHours ?? 0),
          overtimeHours: Number(r.overtimeHours ?? 0),
          projectCount: Number(r.projectCount ?? 0),
          submittedDate: r.submittedDate ?? '',
          status: s === 'approved' ? 'approved' : s === 'rejected' ? 'rejected' : 'pending',
        };
      });
      setSubmissions(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load timesheets');
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = useMemo(() => {
    return submissions.filter(submission => {
      const matchesSearch = submission.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           submission.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || submission.department === selectedDepartment;
      return matchesSearch && matchesDepartment && submission.status === 'pending';
    });
  }, [submissions, searchTerm, selectedDepartment]);

  const stats = {
    pending: submissions.filter(s => s.status === 'pending').length,
    approvedThisWeek: submissions.filter(s => s.status === 'approved').length,
    totalHours: submissions.reduce((sum, s) => sum + s.totalHours, 0),
    totalOvertimeHours: submissions.reduce((sum, s) => sum + s.overtimeHours, 0)
  };

  const handleView = (submission: TimesheetSubmission) => {
    setSelectedTimesheet(submission);
    setShowDetailModal(true);
  };

  const handleApprove = async (submission: TimesheetSubmission) => {
    setActionError(null);
    setActioningId(submission.id);
    try {
      await TimesheetService.approveTimesheet(submission.id);
      await load();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? `Failed to approve ${submission.employeeName}: ${err.message}`
          : `Failed to approve ${submission.employeeName}`,
      );
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (submission: TimesheetSubmission) => {
    const reason = prompt('Enter rejection reason:');
    if (reason === null) return;
    setActionError(null);
    setActioningId(submission.id);
    try {
      await TimesheetService.rejectTimesheet(submission.id, reason || undefined);
      await load();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? `Failed to reject ${submission.employeeName}: ${err.message}`
          : `Failed to reject ${submission.employeeName}`,
      );
    } finally {
      setActioningId(null);
    }
  };

  const columns = [
    { key: 'employeeName', label: 'Employee', sortable: true,
      render: (v: string, row: TimesheetSubmission) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 font-semibold text-sm">{v.split(' ').map(n => n[0]).join('')}</span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{v}</div>
            <div className="text-xs text-gray-500">{row.employeeCode}</div>
          </div>
        </div>
      )
    },
    { key: 'department', label: 'Department', sortable: true,
      render: (v: string) => <div className="font-medium text-gray-900">{v}</div>
    },
    { key: 'week', label: 'Week', sortable: true,
      render: (v: string, row: TimesheetSubmission) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.weekPeriod}</div>
        </div>
      )
    },
    { key: 'totalHours', label: 'Hours', sortable: true,
      render: (v: number, row: TimesheetSubmission) => (
        <div>
          <div className="flex items-center gap-1 text-blue-700">
            <Clock className="w-4 h-4" />
            <span className="font-bold">{v} hrs</span>
          </div>
          {row.overtimeHours > 0 && (
            <div className="text-xs text-orange-600">OT: {row.overtimeHours} hrs</div>
          )}
        </div>
      )
    },
    { key: 'projectCount', label: 'Projects', sortable: true,
      render: (v: number) => (
        <div className="font-medium text-gray-900">{v} project{v > 1 ? 's' : ''}</div>
      )
    },
    { key: 'submittedDate', label: 'Submitted', sortable: true,
      render: (v: string) => (
        <div className="text-sm text-gray-600">
          {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )
    },
    { key: 'id', label: 'Actions', sortable: false,
      render: (_: unknown, row: TimesheetSubmission) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleView(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
           
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleApprove(row)}
            disabled={actioningId === row.id}
            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-40"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleReject(row)}
            disabled={actioningId === row.id}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading timesheets…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {actionError && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {actionError}
        </div>
      )}
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <CheckCircle className="h-8 w-8 text-blue-600" />
          Timesheet Approval
        </h1>
        <p className="text-gray-600 mt-2">Review and approve team timesheets</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white border-2 border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved This Week</p>
              <p className="text-2xl font-bold text-green-600">{stats.approvedThisWeek}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalHours}</p>
            </div>
            <Clock className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overtime Hours</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalOvertimeHours}</p>
            </div>
            <Calendar className="h-10 w-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Alert */}
      {stats.pending > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-900">Pending Approvals</h3>
              <p className="text-sm text-yellow-700">
                You have {stats.pending} timesheet{stats.pending > 1 ? 's' : ''} awaiting your review and approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by employee name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                <option value="Production">Production</option>
                <option value="Quality">Quality</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Logistics">Logistics</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Pending Timesheets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Pending Timesheets ({filteredData.length})</h3>
        </div>
        <DataTable data={filteredData} columns={columns} />
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedTimesheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Timesheet Details</h3>
                  <p className="text-sm text-gray-500">{selectedTimesheet.week} - {selectedTimesheet.weekPeriod}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Employee:</span>
                  <span className="font-medium text-gray-900">{selectedTimesheet.employeeName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Employee Code:</span>
                  <span className="font-medium text-gray-900">{selectedTimesheet.employeeCode}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium text-gray-900">{selectedTimesheet.department}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Total Hours:</span>
                  <span className="font-medium text-blue-700">{selectedTimesheet.totalHours} hrs</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Regular Hours:</span>
                  <span className="font-medium text-green-700">{selectedTimesheet.regularHours} hrs</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Overtime Hours:</span>
                  <span className="font-medium text-orange-700">{selectedTimesheet.overtimeHours} hrs</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Projects:</span>
                  <span className="font-medium text-gray-900">{selectedTimesheet.projectCount}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Submitted:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(selectedTimesheet.submittedDate).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    await handleApprove(selectedTimesheet);
                    setShowDetailModal(false);
                  }}
                  disabled={actioningId === selectedTimesheet.id}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
                >
                  {actioningId === selectedTimesheet.id ? 'Working…' : 'Approve'}
                </button>
                <button
                  onClick={async () => {
                    await handleReject(selectedTimesheet);
                    setShowDetailModal(false);
                  }}
                  disabled={actioningId === selectedTimesheet.id}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
                >
                  Reject
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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
