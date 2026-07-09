'use client';

import { useState, useMemo, useEffect } from 'react';
import { Wallet, Search, CheckCircle, Clock, XCircle, AlertCircle, Calendar, DollarSign, User, FileText } from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface AdvanceRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  requestDate: string;
  advanceAmount: number;
  reason: string;
  requestedMonth: string;
  monthlyDeduction: number;
  numberOfInstallments: number;
  basicSalary: number;
  eligibleAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'recovered';
  approvedBy?: string;
  approvedDate?: string;
  disbursedDate?: string;
  recoveredAmount?: number;
  remainingAmount?: number;
}

export default function AdvanceRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [advanceRequests, setAdvanceRequests] = useState<AdvanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPayrollService.getAdvances();
        const mapped: AdvanceRequest[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
          id: r.advanceNumber ?? r.id ?? r.details?.advanceNumber ?? '',
          employeeId: r.employeeCode ?? r.employeeId ?? r.details?.employeeId ?? '',
          employeeName: r.employeeName ?? r.employee?.fullName ?? r.details?.employeeName ?? '',
          designation: r.designation ?? r.details?.designation ?? '',
          department: r.department ?? r.details?.department ?? '',
          requestDate: r.requestDate ?? r.applicationDate ?? r.createdAt ?? r.details?.requestDate ?? '',
          advanceAmount: Number(r.advanceAmount ?? r.amount ?? r.details?.advanceAmount ?? 0),
          reason: r.reason ?? r.purpose ?? r.details?.reason ?? '',
          requestedMonth: r.requestedMonth ?? r.details?.requestedMonth ?? '',
          monthlyDeduction: Number(r.monthlyDeduction ?? r.details?.monthlyDeduction ?? 0),
          numberOfInstallments: Number(r.numberOfInstallments ?? r.installments ?? r.details?.numberOfInstallments ?? 0),
          basicSalary: Number(r.basicSalary ?? r.details?.basicSalary ?? 0),
          eligibleAmount: Number(r.eligibleAmount ?? r.details?.eligibleAmount ?? 0),
          status: (r.status ?? 'pending') as AdvanceRequest['status'],
          approvedBy: r.approvedBy ?? r.details?.approvedBy ?? undefined,
          approvedDate: r.approvedDate ?? r.details?.approvedDate ?? undefined,
          disbursedDate: r.disbursedDate ?? r.details?.disbursedDate ?? undefined,
          recoveredAmount: r.recoveredAmount ?? r.details?.recoveredAmount ?? undefined,
          remainingAmount: r.remainingAmount ?? r.outstandingAmount ?? r.details?.remainingAmount ?? undefined,
        }));
        if (!cancelled) setAdvanceRequests(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load advance requests');
          setAdvanceRequests([]);
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

  const filteredRequests = useMemo(() => {
    return advanceRequests.filter(request => {
      const matchesSearch =
        request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || request.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [advanceRequests, searchTerm, selectedDepartment, selectedStatus]);

  const departments = ['all', 'Production', 'Quality', 'Maintenance', 'Logistics', 'HR'];
  const statuses = ['all', 'pending', 'approved', 'rejected', 'disbursed', 'recovered'];

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
    disbursed: 'bg-green-100 text-green-700',
    recovered: 'bg-gray-100 text-gray-700'
  };

  const statusIcons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    disbursed: Wallet,
    recovered: CheckCircle
  };

  const stats = {
    totalRequests: filteredRequests.length,
    pending: filteredRequests.filter(r => r.status === 'pending').length,
    approved: filteredRequests.filter(r => r.status === 'approved').length,
    disbursed: filteredRequests.filter(r => r.status === 'disbursed').length,
    totalAmount: filteredRequests.reduce((sum, r) => sum + r.advanceAmount, 0),
    outstandingAmount: filteredRequests
      .filter(r => r.status === 'disbursed')
      .reduce((sum, r) => sum + (r.remainingAmount || 0), 0)
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Advance Requests</h1>
        <p className="text-sm text-gray-600 mt-1">Salary advance requests and recoveries</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading advance requests…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && advanceRequests.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No advance requests found.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-700">Total Requests</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalRequests}</p>
            </div>
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-sm border border-yellow-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-yellow-700">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
            </div>
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg shadow-sm border border-cyan-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-cyan-700">Approved</p>
              <p className="text-2xl font-bold text-cyan-900 mt-1">{stats.approved}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-cyan-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-700">Disbursed</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.disbursed}</p>
            </div>
            <Wallet className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-700">Total Amount</p>
              <p className="text-lg font-bold text-purple-900 mt-1">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg shadow-sm border border-orange-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-orange-700">Outstanding</p>
              <p className="text-lg font-bold text-orange-900 mt-1">{formatCurrency(stats.outstandingAmount)}</p>
            </div>
            <AlertCircle className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by employee name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {filteredRequests.map(request => {
          const StatusIcon = statusIcons[request.status];

          return (
            <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{request.employeeName}</h3>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                      {request.employeeId}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${statusColors[request.status]}`}>
                      <StatusIcon className="h-3 w-3" />
                      {request.status.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                      {request.id}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {request.designation} • {request.department}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Requested: {new Date(request.requestDate).toLocaleDateString('en-IN')}
                    </span>
                    {request.approvedDate && (
                      <span>Approved: {new Date(request.approvedDate).toLocaleDateString('en-IN')}</span>
                    )}
                    {request.disbursedDate && (
                      <span>Disbursed: {new Date(request.disbursedDate).toLocaleDateString('en-IN')}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Advance Amount</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(request.advanceAmount)}</p>
                  {request.status === 'disbursed' && request.remainingAmount !== undefined && (
                    <>
                      <p className="text-xs text-gray-500 mt-2">Remaining</p>
                      <p className="text-sm font-semibold text-orange-600">{formatCurrency(request.remainingAmount)}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                <p className="text-xs font-semibold text-yellow-900 mb-1">Reason for Advance:</p>
                <p className="text-sm text-yellow-800">{request.reason}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h4 className="text-xs font-semibold text-blue-900 mb-3">Employee Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">Basic Salary</span>
                      <span className="font-bold text-blue-900">{formatCurrency(request.basicSalary)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">Eligible Amount</span>
                      <span className="font-medium text-blue-800">{formatCurrency(request.eligibleAmount)}</span>
                    </div>
                    <div className="pt-2 border-t border-blue-300">
                      <p className="text-xs text-blue-700">Max 1.5x of basic salary</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <h4 className="text-xs font-semibold text-purple-900 mb-3">Advance Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-700">Requested Amount</span>
                      <span className="font-bold text-purple-900">{formatCurrency(request.advanceAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-700">Requested Month</span>
                      <span className="font-medium text-purple-800">{request.requestedMonth}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <h4 className="text-xs font-semibold text-green-900 mb-3">Recovery Plan</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Installments</span>
                      <span className="font-bold text-green-900">{request.numberOfInstallments} months</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Monthly Deduction</span>
                      <span className="font-medium text-green-800">{formatCurrency(request.monthlyDeduction)}</span>
                    </div>
                  </div>
                </div>

                {request.status === 'disbursed' && (
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <h4 className="text-xs font-semibold text-orange-900 mb-3">Recovery Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-orange-700">Recovered</span>
                        <span className="font-bold text-orange-900">{formatCurrency(request.recoveredAmount || 0)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-orange-700">Remaining</span>
                        <span className="font-medium text-orange-800">{formatCurrency(request.remainingAmount || 0)}</span>
                      </div>
                      <div className="pt-2 border-t border-orange-300">
                        <div className="w-full bg-orange-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{
                              width: `${((request.recoveredAmount || 0) / request.advanceAmount) * 100}%`
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-orange-700 mt-1 text-center">
                          {Math.round(((request.recoveredAmount || 0) / request.advanceAmount) * 100)}% recovered
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {request.status !== 'disbursed' && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-900 mb-3">Approval Details</h4>
                    <div className="space-y-2">
                      {request.approvedBy && (
                        <>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-700">Approved By</span>
                            <span className="font-medium text-gray-900">{request.approvedBy}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-700">Date</span>
                            <span className="font-medium text-gray-800">
                              {request.approvedDate ? new Date(request.approvedDate).toLocaleDateString('en-IN') : '-'}
                            </span>
                          </div>
                        </>
                      )}
                      {request.status === 'pending' && (
                        <p className="text-xs text-gray-600">Awaiting approval</p>
                      )}
                      {request.status === 'rejected' && (
                        <p className="text-xs text-red-600">Request was rejected</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  View Details
                </button>
                {request.status === 'pending' && (
                  <>
                    <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Approve
                    </button>
                    <button className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                      Reject
                    </button>
                  </>
                )}
                {request.status === 'approved' && (
                  <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Disburse
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Salary Advance Policy Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Eligibility:</strong> Employees who have completed probation period (minimum 6 months of service)</li>
          <li>• <strong>Maximum Amount:</strong> Up to 1.5 times of basic salary or as per company policy</li>
          <li>• <strong>Valid Reasons:</strong> Medical emergency, education expenses, family functions, home repair, or other genuine emergencies</li>
          <li>• <strong>Approval Process:</strong> Request → Department Head approval → HR verification → Finance approval</li>
          <li>• <strong>Recovery:</strong> Advance amount to be recovered in equal monthly installments (typically 3-6 months)</li>
          <li>• <strong>Deduction:</strong> Monthly deduction starts from the next salary cycle after disbursement</li>
          <li>• <strong>Limitation:</strong> Only one active advance allowed per employee at a time</li>
          <li>• <strong>Interest:</strong> Generally interest-free for employees (as per company policy)</li>
          <li>• <strong>Early Recovery:</strong> Employees can request early/full settlement at any time</li>
          <li>• <strong>Resignation:</strong> Full outstanding amount to be recovered from final settlement if employee resigns</li>
        </ul>
      </div>
    </div>
  );
}
