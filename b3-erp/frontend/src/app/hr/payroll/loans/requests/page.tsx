'use client';

import { useState, useMemo, useEffect } from 'react';
import { Coins as HandCoins, Search, CheckCircle, Clock, XCircle, AlertCircle, Calendar, DollarSign, TrendingUp, FileText, Percent } from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface LoanRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  requestDate: string;
  loanType: 'personal' | 'vehicle' | 'home' | 'education' | 'medical' | 'emergency';
  loanAmount: number;
  purpose: string;
  requestedTenure: number; // months
  interestRate: number; // percentage
  emiAmount: number;
  totalRepayment: number;
  basicSalary: number;
  eligibleAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'active' | 'closed';
  approvedBy?: string;
  approvedDate?: string;
  disbursedDate?: string;
  paidEMIs?: number;
  remainingEMIs?: number;
  principalPaid?: number;
  interestPaid?: number;
  outstandingBalance?: number;
}

export default function LoanRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLoanType, setSelectedLoanType] = useState('all');

  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPayrollService.getLoans();
        // Backend loan shape is flexible; map defensively onto LoanRequest.
        const mapped: LoanRequest[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
          id: r.loanNumber ?? r.id ?? '',
          employeeId: r.employeeCode ?? r.employeeId ?? '',
          employeeName: r.employeeName ?? r.employee?.fullName ?? '—',
          designation: r.designation ?? '',
          department: r.department ?? '',
          requestDate: r.requestDate ?? r.applicationDate ?? r.createdAt ?? '',
          loanType: (r.loanType ?? 'personal') as LoanRequest['loanType'],
          loanAmount: Number(r.loanAmount ?? r.principalAmount ?? r.amount ?? 0),
          purpose: r.purpose ?? r.reason ?? '',
          requestedTenure: Number(r.tenure ?? r.requestedTenure ?? r.tenureMonths ?? 0),
          interestRate: Number(r.interestRate ?? 0),
          emiAmount: Number(r.emiAmount ?? r.emi ?? 0),
          totalRepayment: Number(r.totalRepayment ?? r.totalAmount ?? 0),
          basicSalary: Number(r.basicSalary ?? 0),
          eligibleAmount: Number(r.eligibleAmount ?? 0),
          status: (r.status ?? 'pending') as LoanRequest['status'],
          approvedBy: r.approvedBy ?? undefined,
          approvedDate: r.approvedDate ?? undefined,
          disbursedDate: r.disbursedDate ?? undefined,
          paidEMIs: r.paidEMIs ?? r.paidInstallments ?? undefined,
          remainingEMIs: r.remainingEMIs ?? undefined,
          principalPaid: r.principalPaid ?? undefined,
          interestPaid: r.interestPaid ?? undefined,
          outstandingBalance: r.outstandingBalance ?? r.outstandingAmount ?? undefined,
        }));
        if (!cancelled) setLoanRequests(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load loan requests');
          setLoanRequests([]);
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

  const mockLoanRequests: LoanRequest[] = [
    {
      id: 'LOAN-2025-001',
      employeeId: 'EMP001',
      employeeName: 'Rajesh Kumar',
      designation: 'Senior Production Manager',
      department: 'Production',
      requestDate: '2025-06-15',
      loanType: 'home',
      loanAmount: 500000,
      purpose: 'Home purchase down payment',
      requestedTenure: 60,
      interestRate: 8.5,
      emiAmount: 10253,
      totalRepayment: 615180,
      basicSalary: 30000,
      eligibleAmount: 900000, // 30x basic
      status: 'active',
      approvedBy: 'Finance Manager',
      approvedDate: '2025-06-20',
      disbursedDate: '2025-07-01',
      paidEMIs: 5,
      remainingEMIs: 55,
      principalPaid: 42635,
      interestPaid: 8630,
      outstandingBalance: 457365
    },
    {
      id: 'LOAN-2025-002',
      employeeId: 'EMP002',
      employeeName: 'Priya Sharma',
      designation: 'Quality Control Supervisor',
      department: 'Quality',
      requestDate: '2025-09-10',
      loanType: 'vehicle',
      loanAmount: 200000,
      purpose: 'Two-wheeler purchase',
      requestedTenure: 36,
      interestRate: 9.5,
      emiAmount: 6395,
      totalRepayment: 230220,
      basicSalary: 21000,
      eligibleAmount: 630000,
      status: 'active',
      approvedBy: 'Finance Manager',
      approvedDate: '2025-09-15',
      disbursedDate: '2025-09-25',
      paidEMIs: 2,
      remainingEMIs: 34,
      principalPaid: 9640,
      interestPaid: 3150,
      outstandingBalance: 190360
    },
    {
      id: 'LOAN-2025-003',
      employeeId: 'EMP003',
      employeeName: 'Amit Patel',
      designation: 'Production Operator',
      department: 'Production',
      requestDate: '2025-11-05',
      loanType: 'education',
      loanAmount: 80000,
      purpose: 'Higher education course fees for self',
      requestedTenure: 24,
      interestRate: 7.5,
      emiAmount: 3591,
      totalRepayment: 86184,
      basicSalary: 13000,
      eligibleAmount: 390000,
      status: 'pending',
      approvedBy: undefined,
      approvedDate: undefined
    },
    {
      id: 'LOAN-2025-004',
      employeeId: 'EMP004',
      employeeName: 'Neha Singh',
      designation: 'Maintenance Engineer',
      department: 'Maintenance',
      requestDate: '2025-11-10',
      loanType: 'personal',
      loanAmount: 150000,
      purpose: 'Debt consolidation and personal expenses',
      requestedTenure: 48,
      interestRate: 10.5,
      emiAmount: 3838,
      totalRepayment: 184224,
      basicSalary: 20000,
      eligibleAmount: 600000,
      status: 'approved',
      approvedBy: 'Finance Manager',
      approvedDate: '2025-11-15'
    },
    {
      id: 'LOAN-2025-005',
      employeeId: 'EMP005',
      employeeName: 'Vikram Desai',
      designation: 'Logistics Coordinator',
      department: 'Logistics',
      requestDate: '2025-10-20',
      loanType: 'medical',
      loanAmount: 100000,
      purpose: 'Medical treatment for family member',
      requestedTenure: 24,
      interestRate: 6.5,
      emiAmount: 4466,
      totalRepayment: 107184,
      basicSalary: 19000,
      eligibleAmount: 570000,
      status: 'active',
      approvedBy: 'Finance Manager',
      approvedDate: '2025-10-22',
      disbursedDate: '2025-10-28',
      paidEMIs: 1,
      remainingEMIs: 23,
      principalPaid: 3925,
      interestPaid: 541,
      outstandingBalance: 96075
    },
    {
      id: 'LOAN-2025-006',
      employeeId: 'EMP006',
      employeeName: 'Kavita Mehta',
      designation: 'HR Executive',
      department: 'HR',
      requestDate: '2025-11-18',
      loanType: 'emergency',
      loanAmount: 50000,
      purpose: 'Family emergency - urgent financial need',
      requestedTenure: 12,
      interestRate: 8.0,
      emiAmount: 4344,
      totalRepayment: 52128,
      basicSalary: 19000,
      eligibleAmount: 570000,
      status: 'rejected',
      approvedBy: 'Finance Manager',
      approvedDate: '2025-11-20'
    }
  ];

  const filteredRequests = useMemo(() => {
    return loanRequests.filter(request => {
      const matchesSearch =
        request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || request.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
      const matchesLoanType = selectedLoanType === 'all' || request.loanType === selectedLoanType;
      return matchesSearch && matchesDepartment && matchesStatus && matchesLoanType;
    });
  }, [loanRequests, searchTerm, selectedDepartment, selectedStatus, selectedLoanType]);

  const departments = ['all', 'Production', 'Quality', 'Maintenance', 'Logistics', 'HR'];
  const statuses = ['all', 'pending', 'approved', 'rejected', 'disbursed', 'active', 'closed'];
  const loanTypes = ['all', 'personal', 'vehicle', 'home', 'education', 'medical', 'emergency'];

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
    disbursed: 'bg-purple-100 text-purple-700',
    active: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700'
  };

  const statusIcons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    disbursed: DollarSign,
    active: TrendingUp,
    closed: CheckCircle
  };

  // Helper component for date display
  const DateDisplay = ({ date }: { date?: string }) => {
    if (!date) return null;
    return <>{new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</>;
  };

  const loanTypeColors = {
    personal: 'bg-blue-100 text-blue-700',
    vehicle: 'bg-purple-100 text-purple-700',
    home: 'bg-green-100 text-green-700',
    education: 'bg-cyan-100 text-cyan-700',
    medical: 'bg-pink-100 text-pink-700',
    emergency: 'bg-orange-100 text-orange-700'
  };

  const stats = {
    totalRequests: filteredRequests.length,
    pending: filteredRequests.filter(r => r.status === 'pending').length,
    approved: filteredRequests.filter(r => r.status === 'approved').length,
    active: filteredRequests.filter(r => r.status === 'active').length,
    totalLoanAmount: filteredRequests.reduce((sum, r) => sum + r.loanAmount, 0),
    outstandingBalance: filteredRequests
      .filter(r => r.status === 'active')
      .reduce((sum, r) => sum + (r.outstandingBalance || 0), 0)
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Loan Requests</h1>
        <p className="text-sm text-gray-600 mt-1">Employee loan requests and EMI management</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading loan requests…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && loanRequests.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No loan requests found.
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
              <p className="text-xs font-medium text-green-700">Active Loans</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.active}</p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-700">Total Amount</p>
              <p className="text-lg font-bold text-purple-900 mt-1">{formatCurrency(stats.totalLoanAmount)}</p>
            </div>
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg shadow-sm border border-orange-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-orange-700">Outstanding</p>
              <p className="text-lg font-bold text-orange-900 mt-1">{formatCurrency(stats.outstandingBalance)}</p>
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
            value={selectedLoanType}
            onChange={(e) => setSelectedLoanType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {loanTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Loan Types' : type.toUpperCase()}
              </option>
            ))}
          </select>
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
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${loanTypeColors[request.loanType]}`}>
                      {request.loanType.toUpperCase()}
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
                      Requested: <DateDisplay date={request.requestDate} />
                    </span>
                    {request.approvedDate && (
                      <span>Approved: <DateDisplay date={request.approvedDate} /></span>
                    )}
                    {request.disbursedDate && (
                      <span>Disbursed: <DateDisplay date={request.disbursedDate} /></span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Loan Amount</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(request.loanAmount)}</p>
                  {request.status === 'active' && request.outstandingBalance !== undefined && (
                    <>
                      <p className="text-xs text-gray-500 mt-2">Outstanding</p>
                      <p className="text-sm font-semibold text-orange-600">{formatCurrency(request.outstandingBalance)}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                <p className="text-xs font-semibold text-blue-900 mb-1">Purpose:</p>
                <p className="text-sm text-blue-800">{request.purpose}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <h4 className="text-xs font-semibold text-purple-900 mb-3">Loan Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-700">Principal Amount</span>
                      <span className="font-bold text-purple-900">{formatCurrency(request.loanAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-700">Tenure</span>
                      <span className="font-medium text-purple-800">{request.requestedTenure} months</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-700">Interest Rate</span>
                      <span className="font-medium text-purple-800">{request.interestRate}% p.a.</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <h4 className="text-xs font-semibold text-green-900 mb-3">EMI Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Monthly EMI</span>
                      <span className="font-bold text-green-900">{formatCurrency(request.emiAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Total Repayment</span>
                      <span className="font-medium text-green-800">{formatCurrency(request.totalRepayment)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Total Interest</span>
                      <span className="font-medium text-green-800">{formatCurrency(request.totalRepayment - request.loanAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h4 className="text-xs font-semibold text-blue-900 mb-3">Eligibility</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">Basic Salary</span>
                      <span className="font-bold text-blue-900">{formatCurrency(request.basicSalary)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">Max Eligible</span>
                      <span className="font-medium text-blue-800">{formatCurrency(request.eligibleAmount)}</span>
                    </div>
                    <div className="pt-2 border-t border-blue-300">
                      <p className="text-xs text-blue-700">Up to 30x of basic salary</p>
                    </div>
                  </div>
                </div>

                {request.status === 'active' && (
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <h4 className="text-xs font-semibold text-orange-900 mb-3">Repayment Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-orange-700">Paid EMIs</span>
                        <span className="font-bold text-orange-900">{request.paidEMIs}/{request.requestedTenure}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-orange-700">Principal Paid</span>
                        <span className="font-medium text-orange-800">{formatCurrency(request.principalPaid || 0)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-orange-700">Interest Paid</span>
                        <span className="font-medium text-orange-800">{formatCurrency(request.interestPaid || 0)}</span>
                      </div>
                      <div className="pt-2 border-t border-orange-300">
                        <div className="w-full bg-orange-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{
                              width: `${((request.paidEMIs || 0) / request.requestedTenure) * 100}%`
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-orange-700 mt-1 text-center">
                          {Math.round(((request.paidEMIs || 0) / request.requestedTenure) * 100)}% completed
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {request.status !== 'active' && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-900 mb-3">Status Details</h4>
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
                              <DateDisplay date={request.approvedDate} />
                            </span>
                          </div>
                        </>
                      )}
                      {request.status === 'pending' && (
                        <p className="text-xs text-gray-600">Awaiting approval from finance team</p>
                      )}
                      {request.status === 'rejected' && (
                        <p className="text-xs text-red-600">Loan request was rejected</p>
                      )}
                      {request.status === 'approved' && (
                        <p className="text-xs text-green-600">Ready for disbursement</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  View Details
                </button>
                {request.status === 'active' && (
                  <button className="px-4 py-2 text-sm border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50">
                    View EMI Schedule
                  </button>
                )}
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
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Employee Loan Policy Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="bg-white p-3 rounded">
            <h4 className="text-xs font-bold text-blue-800 mb-2">Loan Types & Interest Rates</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>Medical Emergency:</strong> 6.5% p.a. (up to 5 years)</li>
              <li>• <strong>Education:</strong> 7.5% p.a. (up to 5 years)</li>
              <li>• <strong>Home Loan:</strong> 8.5% p.a. (up to 10 years)</li>
              <li>• <strong>Vehicle Loan:</strong> 9.5% p.a. (up to 5 years)</li>
              <li>• <strong>Personal Loan:</strong> 10.5% p.a. (up to 5 years)</li>
              <li>• <strong>Emergency:</strong> 8.0% p.a. (up to 2 years)</li>
            </ul>
          </div>
          <div className="bg-white p-3 rounded">
            <h4 className="text-xs font-bold text-blue-800 mb-2">Eligibility Criteria</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Minimum 1 year of service in the company</li>
              <li>• Maximum loan: 30x of basic salary</li>
              <li>• EMI should not exceed 40% of gross salary</li>
              <li>• Good performance record (no disciplinary actions)</li>
              <li>• No existing loan defaults</li>
              <li>• Age limit: Loan should be repaid before retirement</li>
            </ul>
          </div>
        </div>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Application Process:</strong> Submit application → Document verification → Credit assessment → Approval/Rejection → Disbursement</li>
          <li>• <strong>Required Documents:</strong> Loan application form, salary slips (last 3 months), bank statements, purpose proof, guarantor details</li>
          <li>• <strong>Repayment:</strong> Equal Monthly Installments (EMI) deducted from monthly salary automatically</li>
          <li>• <strong>Prepayment:</strong> Allowed without penalty after 6 months of disbursement</li>
          <li>• <strong>Default:</strong> Failure to repay may lead to salary attachment and legal action</li>
          <li>• <strong>Insurance:</strong> Loan insurance recommended but optional (covers outstanding balance in case of death/disability)</li>
          <li>• <strong>Guarantor:</strong> Required for loans above ₹2,00,000 (must be permanent employee with minimum 3 years service)</li>
          <li>• <strong>Processing Time:</strong> 7-15 working days from application to disbursement</li>
        </ul>
      </div>
    </div>
  );
}
