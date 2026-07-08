'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle, Search, Filter, X, AlertCircle, DollarSign, Clock, User, ArrowRight } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { HrPagesService } from '@/services/hr-pages.service';
import { LeaveService } from '@/services/leave.service';

interface EncashmentApproval {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  requestDate: string;
  leaveType: string;
  leaveTypeCode: string;
  availableBalance: number;
  requestedDays: number;
  perDayRate: number;
  totalAmount: number;
  status: 'pending_approval' | 'approved' | 'rejected';
  submittedOn: string;
  approvedBy?: string;
  approvedOn?: string;
  rejectionReason?: string;
  paymentMode?: 'salary' | 'cheque' | 'bank_transfer';
  financialYear: string;
  remarks?: string;
  eligibility: {
    isEligible: boolean;
    maxAllowed: number;
    minRetention: number;
    issues?: string[];
  };
}

const departments = ['All Departments', 'Production', 'Quality', 'Maintenance', 'HR', 'Stores'];

export default function EncashmentApprovalPage() {
  const [approvalQueue, setApprovalQueue] = useState<EncashmentApproval[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('All Departments');
  const [filterStatus, setFilterStatus] = useState<string>('pending_approval');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<EncashmentApproval | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.leaveEncashments()) as any[];
        const statusMap: Record<string, EncashmentApproval['status']> = {
          pending: 'pending_approval',
          processed: 'approved',
          approved: 'approved',
          cancelled: 'rejected',
          rejected: 'rejected',
        };
        const mapped: EncashmentApproval[] = (raw ?? []).map((r, i) => {
          const requestedDays = Number(r.encashedDays ?? r.requestedDays ?? 0);
          const perDayRate = Number(r.perDayRate ?? 0);
          const status = statusMap[String(r.status ?? '').toLowerCase()] ?? 'pending_approval';
          return {
            id: String(r.id ?? `ECR${i}`),
            employeeId: String(r.employeeId ?? ''),
            employeeName: r.employeeName ?? 'Unknown',
            employeeCode: r.employeeCode ?? String(r.employeeId ?? ''),
            department: r.department ?? 'Unassigned',
            designation: r.designation ?? '',
            requestDate: r.requestDate ?? r.submittedOn ?? '',
            leaveType: r.leaveType ?? 'Leave',
            leaveTypeCode: r.leaveTypeCode ?? '',
            availableBalance: Number(r.availableBalance ?? 0),
            requestedDays,
            perDayRate,
            totalAmount: Number(r.grossAmount ?? r.totalAmount ?? requestedDays * perDayRate),
            status,
            submittedOn: r.submittedOn ?? r.requestDate ?? '',
            approvedBy: r.approvedBy ?? undefined,
            approvedOn: r.approvedOn ?? undefined,
            rejectionReason: r.rejectionReason ?? r.remarks ?? undefined,
            paymentMode: r.paymentMode ?? undefined,
            financialYear: r.financialYear ?? '',
            remarks: r.remarks ?? undefined,
            eligibility: {
              isEligible: true,
              maxAllowed: Number(r.availableBalance ?? 0),
              minRetention: 0,
            },
          };
        });
        if (!cancelled) setApprovalQueue(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load encashment requests');
          setApprovalQueue([]);
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

  const filteredData = useMemo(() => {
    return approvalQueue.filter(req => {
      const matchesSearch = req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || req.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) || req.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = filterDepartment === 'All Departments' || req.department === filterDepartment;
      const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [approvalQueue, searchTerm, filterDepartment, filterStatus]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { status: string; text: string }> = {
      'pending_approval': { status: 'warning', text: 'Pending Approval' },
      'approved': { status: 'success', text: 'Approved' },
      'rejected': { status: 'error', text: 'Rejected' }
    };
    const config = statusMap[status] || { status: 'default', text: status };
    return <StatusBadge status={config.status as any} text={config.text} />;
  };

  const columns: Column<EncashmentApproval>[] = [
    {
      id: 'employee',
      header: 'Employee',
      accessor: 'employeeName',
      sortable: true,
      render: (v, row) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.employeeCode} • {row.department}</div>
          <div className="text-xs text-gray-500">{row.designation}</div>
        </div>
      )
    },
    {
      id: 'request',
      header: 'Request Details',
      accessor: 'id',
      sortable: true,
      render: (v, row) => (
        <div>
          <div className="font-mono text-sm font-semibold text-blue-600">{v}</div>
          <div className="text-xs text-gray-500">{new Date(row.submittedOn).toLocaleDateString()}</div>
          <div className="text-xs">
            <span className="font-medium text-gray-700">{row.leaveTypeCode}</span>
            <span className="text-gray-500 ml-1">• {row.requestedDays} days</span>
          </div>
        </div>
      )
    },
    {
      id: 'balance',
      header: 'Balance & Eligibility',
      accessor: 'availableBalance',
      sortable: true,
      render: (v, row) => (
        <div className="text-xs">
          <div className="font-medium text-gray-900">Available: {v} days</div>
          <div className="text-blue-600">Requested: {row.requestedDays} days</div>
          {row.eligibility.isEligible ? (
            <div className="text-green-600">✓ Eligible (Max: {row.eligibility.maxAllowed})</div>
          ) : (
            <div className="text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Not Eligible
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
          {row.approvedOn && <div className="text-xs text-gray-500 mt-1">{new Date(row.approvedOn).toLocaleDateString()}</div>}
          {row.rejectionReason && <div className="text-xs text-red-600 mt-1">{row.rejectionReason}</div>}
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
          {row.status === 'pending_approval' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRequest(row);
                  setApprovalAction('approve');
                }}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Approve
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRequest(row);
                  setApprovalAction('reject');
                }}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Reject
              </button>
            </>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRequest(row);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View
          </button>
        </div>
      )
    }
  ];

  const stats = useMemo(() => {
    const pending = approvalQueue.filter(r => r.status === 'pending_approval').length;
    const approved = approvalQueue.filter(r => r.status === 'approved').length;
    const rejected = approvalQueue.filter(r => r.status === 'rejected').length;
    const pendingAmount = approvalQueue.filter(r => r.status === 'pending_approval').reduce((sum, r) => sum + r.totalAmount, 0);
    const approvedAmount = approvalQueue.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.totalAmount, 0);
    const eligibilityIssues = approvalQueue.filter(r => r.status === 'pending_approval' && !r.eligibility.isEligible).length;
    return { pending, approved, rejected, pendingAmount, approvedAmount, eligibilityIssues };
  }, [approvalQueue]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDepartment('All Departments');
    setFilterStatus('pending_approval');
  };

  const activeFilterCount = [filterDepartment !== 'All Departments', filterStatus !== 'pending_approval', searchTerm !== ''].filter(Boolean).length;

  return (
    <div className="p-6 space-y-3">
      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading encashment requests…
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
            <CheckCircle className="w-7 h-7 text-green-600" />
            Encashment Approval
          </h1>
          <p className="text-gray-600 mt-1">Review and approve employee leave encashment requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <Clock className="w-4 h-4" /> Pending
          </div>
          <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
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
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Eligibility Issues
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.eligibilityIssues}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Pending Amount</div>
          <div className="text-2xl font-bold text-blue-600">₹{(stats.pendingAmount / 1000).toFixed(0)}K</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Approved Amount</div>
          <div className="text-2xl font-bold text-purple-600">₹{(stats.approvedAmount / 1000).toFixed(0)}K</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search by employee name, code, or request ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="all">All Status</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <DataTable data={filteredData} columns={columns} pagination={{ enabled: true, pageSize: 10 }} sorting={{ enabled: true, defaultSort: { column: 'request', direction: 'desc' } }} emptyMessage="No encashment requests pending approval" />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Approval Guidelines
        </h3>
        <ul className="text-sm text-yellow-800 space-y-1 ml-7">
          <li>✓ Verify employee has sufficient leave balance before approval</li>
          <li>✓ Check maximum encashment limit: 50% of available balance per financial year</li>
          <li>✓ Ensure minimum retention of 5 days in leave balance after encashment</li>
          <li>✓ Validate per-day rate matches employee's current basic salary</li>
          <li>✓ Review upcoming planned leaves to avoid balance shortage</li>
          <li>✓ Check if employee has pending/rejected encashment requests in current FY</li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2">
          <CheckCircle className="w-5 h-5 inline mr-2" />
          Approval Process
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>✓ Review request details: employee info, leave type, days, and amount</li>
          <li>✓ Verify eligibility criteria and system-flagged issues</li>
          <li>✓ Approve eligible requests or reject with clear reason</li>
          <li>✓ Approved requests forwarded to Finance for processing</li>
          <li>✓ Rejection notifications sent to employee with explanation</li>
        </ul>
      </div>

      {/* Approval/Rejection Modal */}
      {selectedRequest && approvalAction && (
        <ApprovalActionModal
          request={selectedRequest}
          action={approvalAction}
          onClose={() => {
            setSelectedRequest(null);
            setApprovalAction(null);
          }}
          onConfirm={async (comments, paymentMode) => {
            const nextStatus = approvalAction === 'approve' ? 'approved' : 'rejected';
            await LeaveService.updateEncashment(selectedRequest.id, {
              status: nextStatus,
              approvedOn: new Date().toISOString(),
              ...(approvalAction === 'reject' ? { rejectionReason: comments, remarks: comments } : {}),
              ...(approvalAction === 'approve' ? { paymentMode, remarks: comments || undefined } : {}),
            });
            setApprovalQueue(approvalQueue.map(req =>
              req.id === selectedRequest.id
                ? {
                    ...req,
                    status: nextStatus,
                    approvedBy: 'Current User',
                    approvedOn: new Date().toISOString(),
                    rejectionReason: approvalAction === 'reject' ? comments : undefined,
                    paymentMode: approvalAction === 'approve' ? paymentMode : undefined
                  }
                : req
            ));
            setSelectedRequest(null);
            setApprovalAction(null);
          }}
        />
      )}
    </div>
  );
}

// Approval Action Modal Component
function ApprovalActionModal({
  request,
  action,
  onClose,
  onConfirm
}: {
  request: EncashmentApproval;
  action: 'approve' | 'reject';
  onClose: () => void;
  onConfirm: (comments: string, paymentMode?: 'salary' | 'cheque' | 'bank_transfer') => void | Promise<void>;
}) {
  const [comments, setComments] = useState('');
  const [paymentMode, setPaymentMode] = useState<'salary' | 'cheque' | 'bank_transfer'>('salary');
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApprove = action === 'approve';

  const handleConfirm = async () => {
    if (action === 'reject' && !comments.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onConfirm(comments, isApprove ? paymentMode : undefined);
    } catch {
      setError('Failed to submit decision. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className={`sticky top-0 p-3 rounded-t-lg flex items-center justify-between ${
          isApprove ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-red-600 to-rose-600'
        } text-white`}>
          <div>
            <h2 className="text-2xl font-bold">
              {isApprove ? 'Approve' : 'Reject'} Encashment Request
            </h2>
            <p className={`mt-1 ${isApprove ? 'text-green-100' : 'text-red-100'}`}>
              Request ID: {request.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-3">
          {/* Workflow Progress */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-blue-900">Approval Workflow</h3>
              <span className="text-xs text-blue-700">Step {currentStep} of 3</span>
            </div>
            <div className="flex items-center gap-2">
              {['Manager', 'HR', 'Finance'].map((step, index) => (
                <React.Fragment key={step}>
                  <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg ${
                    index + 1 === currentStep
                      ? 'bg-blue-600 text-white'
                      : index + 1 < currentStep
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1 < currentStep && <CheckCircle className="w-4 h-4" />}
                    <span className="text-xs font-medium">{step}</span>
                  </div>
                  {index < 2 && <ArrowRight className="w-4 h-4 text-gray-400" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Employee & Request Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Employee Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{request.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Code:</span>
                  <span className="font-medium text-gray-900">{request.employeeCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium text-gray-900">{request.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Designation:</span>
                  <span className="font-medium text-gray-900">{request.designation}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Request Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Leave Type:</span>
                  <span className="font-medium text-gray-900">{request.leaveType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available:</span>
                  <span className="font-medium text-gray-900">{request.availableBalance} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Requested:</span>
                  <span className="font-medium text-blue-600">{request.requestedDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-green-600 text-lg">₹{request.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Eligibility Check */}
          <div className={`rounded-lg p-3 border-2 ${
            request.eligibility.isEligible
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
              request.eligibility.isEligible ? 'text-green-900' : 'text-red-900'
            }`}>
              {request.eligibility.isEligible ? (
                <><CheckCircle className="w-5 h-5" /> Eligibility: Passed</>
              ) : (
                <><AlertCircle className="w-5 h-5" /> Eligibility: Failed</>
              )}
            </h4>
            {request.eligibility.issues && request.eligibility.issues.length > 0 && (
              <ul className={`text-sm space-y-1 ml-7 ${request.eligibility.isEligible ? 'text-green-800' : 'text-red-800'}`}>
                {request.eligibility.issues.map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            )}
            {request.eligibility.isEligible && (
              <p className="text-sm text-green-800 ml-7">
                Max allowed: {request.eligibility.maxAllowed} days | Min retention: {request.eligibility.minRetention} days
              </p>
            )}
          </div>

          {/* Payment Mode (for approval) */}
          {isApprove && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Mode <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="salary">With Salary</option>
                <option value="bank_transfer">Direct Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          )}

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isApprove ? 'Comments (Optional)' : 'Rejection Reason'} {!isApprove && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={isApprove ? 'Add any notes or instructions...' : 'Provide a clear reason for rejection...'}
              required={!isApprove}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60 ${
                isApprove
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {submitting ? 'Submitting…' : isApprove ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
