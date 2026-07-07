'use client';

import { useState, useMemo, useEffect } from 'react';
import { Clock, Plus, Search, Filter, Calendar, AlertCircle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import DataTable from '@/components/DataTable';
import StatusBadge, { BadgeStatus } from '@/components/StatusBadge';
import { NewOvertimeRequestModal } from '@/components/hr/NewOvertimeRequestModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { HrSelfServiceService } from '@/services/hr-self-service.service';

interface OvertimeRequest {
  id: string;
  requestId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  date: string;
  shiftType: string;
  regularHours: number;
  overtimeHours: number;
  reason: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvedDate?: string;
  calculatedAmount?: number;
}

export default function OvertimeRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [rows, setRows] = useState<OvertimeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrSelfServiceService.getOvertimeRequests();
        const mapped: OvertimeRequest[] = raw.map((r) => ({
          id: r.id,
          requestId: r.requestId ?? '',
          employeeCode: r.employeeCode ?? '',
          employeeName: r.employeeName ?? '',
          department: r.department ?? '',
          designation: r.designation ?? '',
          date: r.date ?? '',
          shiftType: r.shiftType ?? '',
          regularHours: Number(r.regularHours ?? 0),
          overtimeHours: Number(r.overtimeHours ?? 0),
          reason: r.reason ?? '',
          requestDate: r.requestDate ?? '',
          status: (r.status as OvertimeRequest['status']) ?? 'pending',
          approvedBy: r.approvedBy ?? undefined,
          approvedDate: r.approvedDate ?? undefined,
          calculatedAmount: r.calculatedAmount != null ? Number(r.calculatedAmount) : undefined,
        }));
        if (!cancelled) setRows(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load overtime requests');
          setRows([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mockRequests: OvertimeRequest[] = rows;

  const filteredData = useMemo(() => {
    return mockRequests.filter(request => {
      const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.requestId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
      const matchesDepartment = selectedDepartment === 'all' || request.department === selectedDepartment;
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [searchTerm, selectedStatus, selectedDepartment, rows]);

  const stats = {
    total: mockRequests.length,
    pending: mockRequests.filter(r => r.status === 'pending').length,
    approved: mockRequests.filter(r => r.status === 'approved').length,
    rejected: mockRequests.filter(r => r.status === 'rejected').length,
    totalHours: mockRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.overtimeHours, 0),
    totalAmount: mockRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + (r.calculatedAmount || 0), 0)
  };

  const columns = [
    { key: 'requestId', label: 'Request ID', sortable: true,
      render: (v: string, row: OvertimeRequest) => (
        <div>
          <div className="font-semibold text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">
            {new Date(row.requestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </div>
        </div>
      )
    },
    { key: 'employeeName', label: 'Employee', sortable: true,
      render: (v: string, row: OvertimeRequest) => (
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
      render: (v: string, row: OvertimeRequest) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.designation}</div>
        </div>
      )
    },
    { key: 'date', label: 'OT Date', sortable: true,
      render: (v: string, row: OvertimeRequest) => (
        <div>
          <div className="font-medium text-gray-900">
            {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div className="text-xs text-gray-500">{row.shiftType}</div>
        </div>
      )
    },
    { key: 'overtimeHours', label: 'Hours', sortable: true,
      render: (v: number, row: OvertimeRequest) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 text-blue-700">
            <Clock className="w-4 h-4" />
            <span className="font-bold">{v} hrs</span>
          </div>
          <div className="text-xs text-gray-500">Regular: {row.regularHours} hrs</div>
        </div>
      )
    },
    { key: 'calculatedAmount', label: 'Amount', sortable: true,
      render: (v: number | undefined) => (
        v ? (
          <div className="font-semibold text-green-700">₹{v.toLocaleString('en-IN')}</div>
        ) : (
          <span className="text-xs text-gray-400">N/A</span>
        )
      )
    },
    { key: 'reason', label: 'Reason', sortable: false,
      render: (v: string) => (
        <div className="text-sm text-gray-700 max-w-xs truncate">{v}</div>
      )
    },
    { key: 'status', label: 'Status', sortable: true,
      render: (v: string) => <StatusBadge status={v as BadgeStatus} />
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Clock className="h-8 w-8 text-blue-600" />
          Overtime Requests
        </h1>
        <p className="text-gray-600 mt-2">Manage and track overtime work requests</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading overtime requests…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <Clock className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="h-10 w-10 text-red-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.totalHours}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-xl font-bold text-green-600">₹{stats.totalAmount.toLocaleString('en-IN')}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-400" />
          </div>
        </div>
      </div>

      {/* Pending Alert */}
      {stats.pending > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-900">Pending Approval</h3>
              <p className="text-sm text-yellow-700">{stats.pending} overtime request{stats.pending > 1 ? 's' : ''} awaiting approval.</p>
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
              placeholder="Search by employee, code, or request ID..."
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
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Request
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                <option value="Production">Production</option>
                <option value="Quality">Quality</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Logistics">Logistics</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Requests Table */}
      {rows.length === 0 && !isLoading ? (
        <EmptyState
          icon={Clock}
          title="No overtime requests yet"
          description="No overtime requests have been recorded. Create a new request to get started."
          action={{ label: 'New Request', icon: Plus, onClick: () => setShowRequestModal(true) }}
        />
      ) : (
        <DataTable data={filteredData} columns={columns} />
      )}

      {/* New Overtime Request Modal */}
      <NewOvertimeRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={async (data) => {
          try {
            const saved = await HrSelfServiceService.createOvertimeRequest({
              employeeCode: data.employeeCode,
              employeeName: data.employeeName,
              department: data.department,
              designation: data.designation,
              date: data.otDate ?? data.date,
              shiftType: data.shiftType,
              regularHours: Number(data.regularHours ?? 0),
              overtimeHours: Number(data.overtimeHours ?? 0),
              reason: data.reason,
              requestDate: data.requestDate,
              calculatedAmount: data.calculatedAmount != null ? Number(data.calculatedAmount) : undefined,
              status: 'pending',
            });
            setRows((prev) => [
              {
                id: saved.id,
                requestId: saved.requestId ?? '',
                employeeCode: saved.employeeCode ?? data.employeeCode ?? '',
                employeeName: saved.employeeName ?? data.employeeName ?? '',
                department: saved.department ?? data.department ?? '',
                designation: saved.designation ?? data.designation ?? '',
                date: saved.date ?? data.otDate ?? '',
                shiftType: saved.shiftType ?? data.shiftType ?? '',
                regularHours: Number(saved.regularHours ?? data.regularHours ?? 0),
                overtimeHours: Number(saved.overtimeHours ?? data.overtimeHours ?? 0),
                reason: saved.reason ?? data.reason ?? '',
                requestDate: saved.requestDate ?? data.requestDate ?? '',
                status: (saved.status as OvertimeRequest['status']) ?? 'pending',
                approvedBy: saved.approvedBy ?? undefined,
                approvedDate: saved.approvedDate ?? undefined,
                calculatedAmount: saved.calculatedAmount != null ? Number(saved.calculatedAmount) : undefined,
              },
              ...prev,
            ]);
            setShowRequestModal(false);
          } catch (err) {
            setLoadError(err instanceof Error ? err.message : 'Failed to submit overtime request');
          }
        }}
      />
    </div>
  );
}
