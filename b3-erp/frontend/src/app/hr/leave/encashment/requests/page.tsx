'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { DollarSign, Plus, Search, Filter, X, AlertCircle, Calendar, TrendingUp } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LeaveService } from '@/services/leave.service';

interface EncashmentRequest {
  id: string;
  requestDate: string;
  leaveType: string;
  leaveTypeCode: string;
  availableBalance: number;
  requestedDays: number;
  perDayRate: number;
  totalAmount: number;
  status: 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'processed';
  submittedOn?: string;
  approvedBy?: string;
  approvedOn?: string;
  processedOn?: string;
  paymentMode?: 'salary' | 'cheque' | 'bank_transfer';
  rejectionReason?: string;
  financialYear: string;
}

const mockEncashmentRequests: EncashmentRequest[] = [
  { id: 'ECR001', requestDate: '2025-10-20', leaveType: 'Earned Leave', leaveTypeCode: 'EL', availableBalance: 15, requestedDays: 10, perDayRate: 1200, totalAmount: 12000, status: 'submitted', submittedOn: '2025-10-20', financialYear: '2025-26' },
  { id: 'ECR002', requestDate: '2025-09-15', leaveType: 'Earned Leave', leaveTypeCode: 'EL', availableBalance: 12, requestedDays: 8, perDayRate: 1200, totalAmount: 9600, status: 'approved', submittedOn: '2025-09-15', approvedBy: 'Rajesh Kumar', approvedOn: '2025-09-18', paymentMode: 'salary', financialYear: '2025-26' },
  { id: 'ECR003', requestDate: '2025-08-10', leaveType: 'Privilege Leave', leaveTypeCode: 'PL', availableBalance: 10, requestedDays: 5, perDayRate: 1200, totalAmount: 6000, status: 'processed', submittedOn: '2025-08-10', approvedBy: 'Rajesh Kumar', approvedOn: '2025-08-12', processedOn: '2025-08-31', paymentMode: 'bank_transfer', financialYear: '2025-26' },
  { id: 'ECR004', requestDate: '2025-07-05', leaveType: 'Earned Leave', leaveTypeCode: 'EL', availableBalance: 18, requestedDays: 12, perDayRate: 1200, totalAmount: 14400, status: 'rejected', submittedOn: '2025-07-05', approvedBy: 'Rajesh Kumar', approvedOn: '2025-07-07', rejectionReason: 'Insufficient balance after upcoming planned leave', financialYear: '2025-26' },
  { id: 'ECR005', requestDate: '2025-06-20', leaveType: 'Comp Off', leaveTypeCode: 'CO', availableBalance: 3, requestedDays: 2, perDayRate: 1200, totalAmount: 2400, status: 'processed', submittedOn: '2025-06-20', approvedBy: 'Rajesh Kumar', approvedOn: '2025-06-21', processedOn: '2025-06-30', paymentMode: 'salary', financialYear: '2025-26' },
  { id: 'ECR006', requestDate: '2025-10-22', leaveType: 'Earned Leave', leaveTypeCode: 'EL', availableBalance: 15, requestedDays: 5, perDayRate: 1200, totalAmount: 6000, status: 'draft', financialYear: '2025-26' }
];

const leaveTypesForEncashment = [
  { code: 'ALL', name: 'All Types' },
  { code: 'EL', name: 'Earned Leave' },
  { code: 'PL', name: 'Privilege Leave' },
  { code: 'CO', name: 'Comp Off' }
];

function mapEncashment(r: any): EncashmentRequest {
  const days = Number(r.encashedDays ?? r.requestedDays ?? 0);
  const amount = Number(r.grossAmount ?? r.totalAmount ?? 0);
  return {
    id: r.id,
    requestDate: r.requestDate || (r.createdAt ? String(r.createdAt).slice(0, 10) : ''),
    leaveType: r.leaveType || '',
    leaveTypeCode: r.leaveTypeCode || '',
    availableBalance: Number(r.availableBalance ?? 0),
    requestedDays: days,
    perDayRate: Number(r.perDayRate ?? 0),
    totalAmount: amount,
    status: (r.status || 'submitted') as EncashmentRequest['status'],
    submittedOn: r.submittedOn || undefined,
    approvedBy: r.approvedBy || undefined,
    approvedOn: r.approvedOn || undefined,
    processedOn: r.processedOn || undefined,
    paymentMode: r.paymentMode || undefined,
    rejectionReason: r.rejectionReason || undefined,
    financialYear: r.financialYear || '',
  };
}

export default function EncashmentRequestsPage() {
  const [requests, setRequests] = useState<EncashmentRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLeaveType, setFilterLeaveType] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);

  const loadRequests = () => {
    LeaveService.getEncashments()
      .then((rows) => setRequests(Array.isArray(rows) ? rows.map(mapEncashment) : []))
      .catch(() => setRequests([]));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Consistent date formatter to avoid hydration errors
  const formatDate = (dateString: string, includeYear = false) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return includeYear ? `${day} ${month} ${year}` : `${day}/${month.substring(0, 3).toUpperCase()}/${year}`;
  };

  const filteredData = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch = req.id.toLowerCase().includes(searchTerm.toLowerCase()) || req.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
      const matchesType = filterLeaveType === 'ALL' || req.leaveTypeCode === filterLeaveType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [requests, searchTerm, filterStatus, filterLeaveType]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { status: string; text: string }> = {
      'draft': { status: 'draft', text: 'Draft' },
      'submitted': { status: 'pending', text: 'Submitted' },
      'pending_approval': { status: 'warning', text: 'Pending Approval' },
      'approved': { status: 'approved', text: 'Approved' },
      'rejected': { status: 'rejected', text: 'Rejected' },
      'processed': { status: 'completed', text: 'Processed' }
    };
    const config = statusMap[status] || { status: 'draft', text: status };
    return <StatusBadge status={config.status as any} text={config.text} />;
  };

  const columns: Column<EncashmentRequest>[] = [
    {
      id: 'requestId',
      header: 'Request ID',
      accessor: 'id',
      sortable: true,
      render: (v, row) => (
        <div>
          <div className="font-mono font-semibold text-blue-600">{v}</div>
          <div className="text-xs text-gray-500">{formatDate(row.requestDate, true)}</div>
        </div>
      )
    },
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
      id: 'balance',
      header: 'Balance',
      accessor: 'availableBalance',
      sortable: true,
      render: (v, row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{v} days</div>
          <div className="text-xs text-blue-600">Req: {row.requestedDays} days</div>
          {row.requestedDays > v && (
            <div className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Exceeds balance
            </div>
          )}
        </div>
      )
    },
    {
      id: 'amount',
      header: 'Amount',
      accessor: 'totalAmount',
      sortable: true,
      render: (v, row) => (
        <div className="text-sm">
          <div className="font-semibold text-green-600">₹{v.toLocaleString()}</div>
          <div className="text-xs text-gray-500">@₹{row.perDayRate}/day</div>
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
          {row.submittedOn && <div className="text-xs text-gray-500 mt-1">Submitted: {formatDate(row.submittedOn, true)}</div>}
          {row.rejectionReason && <div className="text-xs text-red-600 mt-1">{row.rejectionReason}</div>}
        </div>
      )
    },
    {
      id: 'approval',
      header: 'Approval',
      accessor: 'approvedBy',
      sortable: false,
      render: (v, row) => (
        <div className="text-xs">
          {v && (
            <>
              <div className="text-gray-900">{v}</div>
              {row.approvedOn && <div className="text-gray-500">{formatDate(row.approvedOn, true)}</div>}
            </>
          )}
          {row.processedOn && <div className="text-green-600 mt-1">Processed: {formatDate(row.processedOn, true)}</div>}
          {row.paymentMode && <div className="text-blue-600 capitalize">{row.paymentMode.replace('_', ' ')}</div>}
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
          {row.status === 'draft' && (
            <>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
              <button className="text-green-600 hover:text-green-800 text-sm font-medium">Submit</button>
            </>
          )}
          {row.status !== 'draft' && (
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
          )}
        </div>
      )
    }
  ];

  const stats = useMemo(() => {
    const totalRequested = requests.reduce((sum, r) => sum + r.totalAmount, 0);
    const approved = requests.filter(r => r.status === 'approved' || r.status === 'processed').length;
    const pending = requests.filter(r => r.status === 'submitted' || r.status === 'pending_approval').length;
    const processed = requests.filter(r => r.status === 'processed').reduce((sum, r) => sum + r.totalAmount, 0);
    return { total: requests.length, approved, pending, totalRequested, processed };
  }, [requests]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterLeaveType('ALL');
  };

  const activeFilterCount = [filterStatus !== 'all', filterLeaveType !== 'ALL', searchTerm !== ''].filter(Boolean).length;

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-green-600" />
            Encashment Requests
          </h1>
          <p className="text-gray-600 mt-1">Apply for leave encashment and track your requests</p>
        </div>
        <button onClick={() => setShowNewRequestModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Total Requests</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Approved</div>
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Pending</div>
          <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Total Requested
          </div>
          <div className="text-2xl font-bold text-blue-600">₹{(stats.totalRequested / 1000).toFixed(0)}K</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Processed</div>
          <div className="text-2xl font-bold text-purple-600">₹{(stats.processed / 1000).toFixed(0)}K</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search by request ID or leave type..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}>
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">{activeFilterCount}</span>}
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
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="processed">Processed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
              <select value={filterLeaveType} onChange={(e) => setFilterLeaveType(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                {leaveTypesForEncashment.map(type => <option key={type.code} value={type.code}>{type.name}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <DataTable data={filteredData} columns={columns} pagination={{ enabled: true, pageSize: 10 }} sorting={{ enabled: true, defaultSort: { column: 'requestId', direction: 'desc' } }} emptyMessage="No encashment requests found" />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Encashment Eligibility & Rules
        </h3>
        <ul className="text-sm text-yellow-800 space-y-1 ml-7">
          <li>✓ Only Earned Leave (EL), Privilege Leave (PL), and Comp Off (CO) are eligible for encashment</li>
          <li>✓ Maximum 50% of available balance can be encashed in a financial year</li>
          <li>✓ Minimum 5 days must be retained in your leave balance after encashment</li>
          <li>✓ Encashment amount is calculated based on your basic salary per day rate</li>
          <li>✓ Approved encashment is processed with the next salary cycle or via bank transfer</li>
          <li>✓ Tax deductions (TDS) apply as per Income Tax Act on encashment amount</li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2">
          <DollarSign className="w-5 h-5 inline mr-2" />
          Leave Encashment Process
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>✓ Submit encashment request with desired number of days from available balance</li>
          <li>✓ Manager approval required for all encashment requests</li>
          <li>✓ HR verification of balance and eligibility criteria</li>
          <li>✓ Finance processing with salary or separate bank transfer</li>
          <li>✓ Real-time tracking of request status and payment processing</li>
        </ul>
      </div>

      {/* New Encashment Request Modal */}
      {showNewRequestModal && <NewEncashmentRequestModal onClose={() => setShowNewRequestModal(false)} onSuccess={loadRequests} />}
    </div>
  );
}

// New Encashment Request Modal Component
function NewEncashmentRequestModal({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  const [isHRMode, setIsHRMode] = useState(false); // Toggle between HR and self-service mode
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [requestedDays, setRequestedDays] = useState('');
  const [remarks, setRemarks] = useState('');
  const [searchEmployee, setSearchEmployee] = useState('');

  // Mock current user - in real app, get from auth context
  const currentUser = {
    id: 'EMP001',
    code: 'EMP001',
    name: 'Rajesh Kumar',
    designation: 'Production Supervisor',
    department: 'Production',
    isHR: true // Set to true if user is HR, false for regular employee
  };

  // Mock employee list for HR selection - in real app, fetch from API
  const allEmployees = [
    { id: 'EMP001', code: 'EMP001', name: 'Rajesh Kumar', designation: 'Production Supervisor', department: 'Production' },
    { id: 'EMP002', code: 'EMP002', name: 'Priya Sharma', designation: 'Assembly Line Operator', department: 'Production' },
    { id: 'EMP003', code: 'EMP003', name: 'Amit Patel', designation: 'Quality Inspector', department: 'Quality Control' },
    { id: 'EMP004', code: 'EMP004', name: 'Sunita Devi', designation: 'Machine Operator', department: 'Production' },
    { id: 'EMP005', code: 'EMP005', name: 'Ramesh Singh', designation: 'Assembly Line Operator', department: 'Production' }
  ];

  // Filter employees based on search
  const filteredEmployees = allEmployees.filter(emp =>
    emp.name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
    emp.code.toLowerCase().includes(searchEmployee.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchEmployee.toLowerCase())
  );

  // Mock leave balance data - in real app, fetch from API based on selected employee
  const availableLeaveBalances = [
    { code: 'EL', name: 'Earned Leave', balance: 15, encashable: 7, perDayRate: 1200 },
    { code: 'PL', name: 'Privilege Leave', balance: 10, encashable: 5, perDayRate: 1200 },
    { code: 'CO', name: 'Comp Off', balance: 3, encashable: 3, perDayRate: 1200 }
  ];

  // Set default employee for self-service mode
  React.useEffect(() => {
    if (!isHRMode) {
      setSelectedEmployee(currentUser.id);
    } else {
      setSelectedEmployee('');
    }
  }, [isHRMode]);

  const selectedEmployeeData = allEmployees.find(emp => emp.id === selectedEmployee);

  const selectedLeave = availableLeaveBalances.find(l => l.code === selectedLeaveType);
  const daysNum = parseInt(requestedDays) || 0;
  const calculatedAmount = selectedLeave ? daysNum * selectedLeave.perDayRate : 0;
  const exceedsBalance = selectedLeave ? daysNum > selectedLeave.encashable : false;
  const canSubmit = selectedEmployee && selectedLeaveType && daysNum > 0 && !exceedsBalance;

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    try {
      await LeaveService.createEncashment({
        employeeId: selectedEmployee,
        employeeName: selectedEmployeeData?.name,
        leaveType: selectedLeave?.name,
        leaveTypeCode: selectedLeaveType,
        encashedDays: daysNum,
        perDayRate: selectedLeave?.perDayRate,
        grossAmount: calculatedAmount,
        netAmount: calculatedAmount,
        requestDate: new Date().toISOString().slice(0, 10),
        submittedOn: new Date().toISOString().slice(0, 10),
        remarks,
        status: 'submitted',
      });
      onSuccess?.();
      onClose();
    } catch {
      alert('Failed to submit encashment request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-3 rounded-t-lg flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">New Encashment Request</h2>
            <p className="text-green-100 mt-1">Submit a request to encash your leave balance</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {/* Mode Toggle (Only show if user is HR) */}
          {currentUser.isHR && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-blue-900">Request Mode</h3>
                  <p className="text-xs text-blue-700 mt-1">
                    {isHRMode ? 'HR Mode: Select employee for encashment' : 'Self Service: Request for yourself'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHRMode(!isHRMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isHRMode ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isHRMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee <span className="text-red-500">*</span>
            </label>

            {!isHRMode ? (
              // Self-service mode: Show current user (read-only)
              <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{currentUser.name}</div>
                    <div className="text-sm text-gray-600">{currentUser.code} • {currentUser.designation}</div>
                    <div className="text-xs text-gray-500">{currentUser.department}</div>
                  </div>
                </div>
              </div>
            ) : (
              // HR mode: Employee search and selection
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, code, or department..."
                    value={searchEmployee}
                    onChange={(e) => setSearchEmployee(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {searchEmployee && (
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((emp) => (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => {
                            setSelectedEmployee(emp.id);
                            setSearchEmployee('');
                          }}
                          className="w-full p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-left transition-colors"
                        >
                          <div className="font-medium text-gray-900">{emp.name}</div>
                          <div className="text-sm text-gray-600">{emp.code} • {emp.designation}</div>
                          <div className="text-xs text-gray-500">{emp.department}</div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No employees found
                      </div>
                    )}
                  </div>
                )}

                {selectedEmployeeData && !searchEmployee && (
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg">
                          {selectedEmployeeData.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{selectedEmployeeData.name}</div>
                          <div className="text-sm text-gray-600">{selectedEmployeeData.code} • {selectedEmployeeData.designation}</div>
                          <div className="text-xs text-gray-500">{selectedEmployeeData.department}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedEmployee('')}
                        className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-green-700" />
                      </button>
                    </div>
                  </div>
                )}

                {!selectedEmployeeData && !searchEmployee && (
                  <div className="text-sm text-gray-500 text-center py-2">
                    Click the search box above to find and select an employee
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Available Leave Balances */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Available Leave Balances for Encashment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {availableLeaveBalances.map((leave) => (
                <div
                  key={leave.code}
                  onClick={() => setSelectedLeaveType(leave.code)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedLeaveType === leave.code
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">{leave.name}</div>
                  <div className="text-2xl font-bold text-gray-900">{leave.encashable}</div>
                  <div className="text-xs text-gray-600">of {leave.balance} days</div>
                  <div className="text-xs text-green-600 mt-2">₹{leave.perDayRate}/day</div>
                </div>
              ))}
            </div>
          </div>

          {/* Leave Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedLeaveType}
              onChange={(e) => setSelectedLeaveType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">Select Leave Type</option>
              {availableLeaveBalances.map((leave) => (
                <option key={leave.code} value={leave.code}>
                  {leave.name} ({leave.code}) - {leave.encashable} days available
                </option>
              ))}
            </select>
          </div>

          {/* Number of Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Days to Encash <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max={selectedLeave?.encashable || 0}
              value={requestedDays}
              onChange={(e) => setRequestedDays(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter number of days"
              required
            />
            {selectedLeave && (
              <p className="text-xs text-gray-500 mt-1">
                Maximum encashable: {selectedLeave.encashable} days
              </p>
            )}
            {exceedsBalance && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Exceeds available encashable balance
              </p>
            )}
          </div>

          {/* Amount Calculation */}
          {daysNum > 0 && selectedLeave && (
            <div className={`p-4 rounded-lg border-2 ${exceedsBalance ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${exceedsBalance ? 'text-red-700' : 'text-green-700'}`}>
                  Encashment Amount
                </span>
                <DollarSign className={`w-5 h-5 ${exceedsBalance ? 'text-red-600' : 'text-green-600'}`} />
              </div>
              <div className={`text-3xl font-bold ${exceedsBalance ? 'text-red-900' : 'text-green-900'}`}>
                ₹{calculatedAmount.toLocaleString()}
              </div>
              <div className={`text-xs mt-2 ${exceedsBalance ? 'text-red-700' : 'text-green-700'}`}>
                {daysNum} day{daysNum !== 1 ? 's' : ''} × ₹{selectedLeave.perDayRate}
              </div>
              {!exceedsBalance && (
                <div className="text-xs text-green-600 mt-1">
                  ✓ Remaining encashable balance: {selectedLeave.encashable - daysNum} days
                </div>
              )}
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks (Optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Add any additional notes or comments..."
            />
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Important Notice
            </h4>
            <ul className="text-xs text-amber-800 space-y-1 ml-5">
              <li>• Encashment is subject to manager and HR approval</li>
              <li>• Amount will be processed in next salary cycle or via bank transfer</li>
              <li>• Tax deductions (TDS) will apply as per Income Tax Act</li>
              <li>• Encashed days will be deducted from your leave balance immediately upon approval</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                canSubmit
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Request
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
