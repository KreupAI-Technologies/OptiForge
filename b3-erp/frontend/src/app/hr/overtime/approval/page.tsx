'use client';

import { useState, useMemo, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Check, X, AlertCircle, Search, Filter, Calendar } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { HrSelfServiceService } from '@/services/hr-self-service.service';

interface OvertimeApproval {
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
  calculatedAmount: number;
  status: 'pending' | 'approved' | 'rejected';
}

export default function OTApprovalPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<OvertimeApproval | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [rows, setRows] = useState<OvertimeApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrSelfServiceService.getOvertimeRequests('pending');
        const mapped: OvertimeApproval[] = raw.map((r) => ({
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
          calculatedAmount: Number(r.calculatedAmount ?? 0),
          status: (r.status as OvertimeApproval['status']) ?? 'pending',
        }));
        if (!cancelled) setRows(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load overtime approvals');
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

  const mockApprovals: OvertimeApproval[] = rows.length ? rows : [
    {
      id: '1', requestId: 'OT001', employeeCode: 'KMF2020001', employeeName: 'Rajesh Kumar',
      department: 'Production', designation: 'Manager', date: '2024-11-20',
      shiftType: 'General Day Shift', regularHours: 8, overtimeHours: 3,
      reason: 'Urgent production target completion', requestDate: '2024-11-19',
      calculatedAmount: 750, status: 'pending'
    },
    {
      id: '2', requestId: 'OT003', employeeCode: 'KMF2021003', employeeName: 'Arun Patel',
      department: 'IT', designation: 'Sr. Engineer', date: '2024-11-21',
      shiftType: 'Flexible Shift', regularHours: 9, overtimeHours: 4,
      reason: 'Server maintenance and upgrade', requestDate: '2024-11-20',
      calculatedAmount: 1200, status: 'pending'
    },
    {
      id: '3', requestId: 'OT006', employeeCode: 'KMF2018006', employeeName: 'Suresh Babu',
      department: 'Logistics', designation: 'Manager', date: '2024-11-22',
      shiftType: 'Evening Shift', regularHours: 8, overtimeHours: 3,
      reason: 'Critical shipment coordination', requestDate: '2024-11-21',
      calculatedAmount: 900, status: 'pending'
    },
    {
      id: '4', requestId: 'OT008', employeeCode: 'KMF2021008', employeeName: 'Kavita Desai',
      department: 'HR', designation: 'Executive', date: '2024-11-23',
      shiftType: 'General Day Shift', regularHours: 8, overtimeHours: 2,
      reason: 'Recruitment drive support', requestDate: '2024-11-22',
      calculatedAmount: 500, status: 'pending'
    },
    {
      id: '5', requestId: 'OT009', employeeCode: 'KMF2019008', employeeName: 'Deepak Sharma',
      department: 'Production', designation: 'Supervisor', date: '2024-11-24',
      shiftType: 'Night Shift', regularHours: 8, overtimeHours: 2.5,
      reason: 'Equipment installation supervision', requestDate: '2024-11-23',
      calculatedAmount: 875, status: 'pending'
    },
    {
      id: '6', requestId: 'OT010', employeeCode: 'KMF2020009', employeeName: 'Lakshmi Iyer',
      department: 'Quality', designation: 'Inspector', date: '2024-11-24',
      shiftType: 'Morning Shift', regularHours: 8, overtimeHours: 1.5,
      reason: 'Final product quality check', requestDate: '2024-11-23',
      calculatedAmount: 450, status: 'pending'
    },
    {
      id: '7', requestId: 'OT011', employeeCode: 'KMF2022010', employeeName: 'Amit Verma',
      department: 'Finance', designation: 'Sr. Accountant', date: '2024-11-25',
      shiftType: 'General Day Shift', regularHours: 8, overtimeHours: 3,
      reason: 'Audit preparation', requestDate: '2024-11-24',
      calculatedAmount: 900, status: 'pending'
    }
  ];

  const filteredData = useMemo(() => {
    return mockApprovals.filter(request => {
      const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.requestId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || request.department === selectedDepartment;
      return matchesSearch && matchesDepartment;
    });
  }, [searchTerm, selectedDepartment, rows]);

  const stats = {
    pending: mockApprovals.filter(r => r.status === 'pending').length,
    approvedToday: 12,
    rejectedToday: 3,
    totalHours: mockApprovals.reduce((sum, r) => sum + r.overtimeHours, 0),
    totalAmount: mockApprovals.reduce((sum, r) => sum + r.calculatedAmount, 0)
  };

  const handleApprovalAction = (request: OvertimeApproval, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const columns = [
    { key: 'requestId', label: 'Request ID', sortable: true,
      render: (v: string, row: OvertimeApproval) => (
        <div>
          <div className="font-semibold text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">
            {new Date(row.requestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </div>
        </div>
      )
    },
    { key: 'employeeName', label: 'Employee', sortable: true,
      render: (v: string, row: OvertimeApproval) => (
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
      render: (v: string, row: OvertimeApproval) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.designation}</div>
        </div>
      )
    },
    { key: 'date', label: 'OT Date', sortable: true,
      render: (v: string, row: OvertimeApproval) => (
        <div>
          <div className="font-medium text-gray-900">
            {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div className="text-xs text-gray-500">{row.shiftType}</div>
        </div>
      )
    },
    { key: 'overtimeHours', label: 'Hours', sortable: true,
      render: (v: number) => (
        <div className="flex items-center gap-1 text-blue-700">
          <Clock className="w-4 h-4" />
          <span className="font-bold">{v} hrs</span>
        </div>
      )
    },
    { key: 'calculatedAmount', label: 'Amount', sortable: true,
      render: (v: number) => (
        <div className="font-semibold text-green-700">₹{v.toLocaleString('en-IN')}</div>
      )
    },
    { key: 'reason', label: 'Reason', sortable: false,
      render: (v: string) => (
        <div className="text-sm text-gray-700 max-w-xs truncate">{v}</div>
      )
    },
    { key: 'id', label: 'Actions', sortable: false,
      render: (_: unknown, row: OvertimeApproval) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleApprovalAction(row, 'approve')}
            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
           
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleApprovalAction(row, 'reject')}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
           
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <CheckCircle className="h-8 w-8 text-blue-600" />
          Overtime Approval
        </h1>
        <p className="text-gray-600 mt-2">Review and approve overtime requests</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading overtime approvals…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
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
              <p className="text-sm text-gray-600">Approved Today</p>
              <p className="text-2xl font-bold text-green-600">{stats.approvedToday}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected Today</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejectedToday}</p>
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
            <Clock className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-xl font-bold text-green-600">₹{stats.totalAmount.toLocaleString('en-IN')}</p>
            </div>
            <Calendar className="h-10 w-10 text-green-400" />
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
                You have {stats.pending} overtime request{stats.pending > 1 ? 's' : ''} awaiting your approval.
                Please review and take action.
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
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Pending Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Pending Requests ({filteredData.length})</h3>
        </div>
        <DataTable data={filteredData} columns={columns} />
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                {approvalAction === 'approve' ? (
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {approvalAction === 'approve' ? 'Approve Request' : 'Reject Request'}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedRequest.requestId}</p>
                </div>
              </div>

              <div className="space-y-3 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Employee:</span>
                  <span className="font-medium text-gray-900">{selectedRequest.employeeName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium text-gray-900">{selectedRequest.department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">OT Hours:</span>
                  <span className="font-medium text-gray-900">{selectedRequest.overtimeHours} hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-green-700">₹{selectedRequest.calculatedAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reason:</span>
                  <span className="font-medium text-gray-900">{selectedRequest.reason}</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {approvalAction === 'approve' ? 'Approval Comments (Optional)' : 'Rejection Reason'}
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={approvalAction === 'approve' ? 'Add any comments...' : 'Provide rejection reason...'}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg text-white ${
                    approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {approvalAction === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
