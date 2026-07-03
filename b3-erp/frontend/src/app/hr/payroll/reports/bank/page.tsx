'use client';

import { useState, useMemo, useEffect } from 'react';
import { Building, Search, Download, Calendar, Users, DollarSign, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface BankTransfer {
  id: string;
  employeeId: string;
  employeeName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  netSalary: number;
  paymentDate: string;
  monthYear: string;
  status: 'pending' | 'processed' | 'completed' | 'failed';
  transactionId?: string;
  remarks?: string;
}

export default function BankReportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('2025-11');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [bankTransfers, setBankTransfers] = useState<BankTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPayrollService.getReports('bank');
        const mapped: BankTransfer[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
          id: r.id ?? r.transferNumber ?? '',
          employeeId: r.employeeCode ?? r.employeeId ?? '',
          employeeName: r.employeeName ?? r.employee?.fullName ?? '—',
          bankName: r.bankName ?? r.details?.bankName ?? '',
          accountNumber: r.accountNumber ?? r.details?.accountNumber ?? '',
          ifscCode: r.ifscCode ?? r.details?.ifscCode ?? '',
          branch: r.branch ?? r.details?.branch ?? '',
          netSalary: Number(r.netSalary ?? r.details?.netSalary ?? r.amount ?? 0),
          paymentDate: r.paymentDate ?? r.details?.paymentDate ?? '',
          monthYear: r.monthYear ?? r.details?.monthYear ?? '',
          status: (r.status ?? 'pending') as BankTransfer['status'],
          transactionId: r.transactionId ?? r.details?.transactionId ?? undefined,
          remarks: r.remarks ?? r.details?.remarks ?? undefined,
        }));
        if (!cancelled) setBankTransfers(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load bank transfers');
          setBankTransfers([]);
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

  const mockBankTransfers: BankTransfer[] = [
    {
      id: 'BT-2025-11-001',
      employeeId: 'EMP001',
      employeeName: 'Rajesh Kumar',
      bankName: 'State Bank of India',
      accountNumber: '30012345678',
      ifscCode: 'SBIN0001234',
      branch: 'Bangalore City',
      netSalary: 45502,
      paymentDate: '2025-12-01',
      monthYear: 'November 2025',
      status: 'completed',
      transactionId: 'TXN202511001'
    },
    {
      id: 'BT-2025-11-002',
      employeeId: 'EMP002',
      employeeName: 'Priya Sharma',
      bankName: 'HDFC Bank',
      accountNumber: '50012345678',
      ifscCode: 'HDFC0001234',
      branch: 'Koramangala',
      netSalary: 33316,
      paymentDate: '2025-12-01',
      monthYear: 'November 2025',
      status: 'completed',
      transactionId: 'TXN202511002'
    },
    {
      id: 'BT-2025-11-003',
      employeeId: 'EMP003',
      employeeName: 'Amit Patel',
      bankName: 'ICICI Bank',
      accountNumber: '60012345678',
      ifscCode: 'ICIC0001234',
      branch: 'Whitefield',
      netSalary: 20454,
      paymentDate: '2025-12-01',
      monthYear: 'November 2025',
      status: 'completed',
      transactionId: 'TXN202511003'
    },
    {
      id: 'BT-2025-11-004',
      employeeId: 'EMP004',
      employeeName: 'Neha Singh',
      bankName: 'Axis Bank',
      accountNumber: '70012345678',
      ifscCode: 'UTIB0001234',
      branch: 'Electronic City',
      netSalary: 29118,
      paymentDate: '2025-12-01',
      monthYear: 'November 2025',
      status: 'completed',
      transactionId: 'TXN202511004'
    },
    {
      id: 'BT-2025-11-005',
      employeeId: 'EMP005',
      employeeName: 'Vikram Desai',
      bankName: 'State Bank of India',
      accountNumber: '30098765432',
      ifscCode: 'SBIN0005678',
      branch: 'Indiranagar',
      netSalary: 26317,
      paymentDate: '2025-12-01',
      monthYear: 'November 2025',
      status: 'completed',
      transactionId: 'TXN202511005'
    },
    {
      id: 'BT-2025-11-006',
      employeeId: 'EMP006',
      employeeName: 'Kavita Mehta',
      bankName: 'HDFC Bank',
      accountNumber: '50098765432',
      ifscCode: 'HDFC0005678',
      branch: 'MG Road',
      netSalary: 30467,
      paymentDate: '2025-12-01',
      monthYear: 'November 2025',
      status: 'completed',
      transactionId: 'TXN202511006'
    }
  ];

  void mockBankTransfers;
  const filteredTransfers = useMemo(() => {
    return bankTransfers.filter(transfer => {
      const matchesSearch =
        transfer.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.accountNumber.includes(searchTerm);
      const matchesBank = selectedBank === 'all' || transfer.bankName === selectedBank;
      const matchesStatus = selectedStatus === 'all' || transfer.status === selectedStatus;
      return matchesSearch && matchesBank && matchesStatus;
    });
  }, [bankTransfers, searchTerm, selectedBank, selectedStatus]);

  const banks = ['all', 'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'];
  const statuses = ['all', 'pending', 'processed', 'completed', 'failed'];

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    processed: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700'
  };

  const totalStats = useMemo(() => {
    const bankWise = filteredTransfers.reduce((acc, t) => {
      if (!acc[t.bankName]) {
        acc[t.bankName] = { count: 0, amount: 0 };
      }
      acc[t.bankName].count += 1;
      acc[t.bankName].amount += t.netSalary;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    const totalAmount = filteredTransfers.reduce((sum, t) => sum + t.netSalary, 0);
    const completedCount = filteredTransfers.filter(t => t.status === 'completed').length;

    return { bankWise, totalAmount, completedCount };
  }, [filteredTransfers]);

  const maskAccountNumber = (accountNumber: string) => {
    return 'XXXX' + accountNumber.slice(-4);
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Bank Transfer Report</h1>
        <p className="text-sm text-gray-600 mt-1">Generate bank file for salary transfer</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading bank transfers…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && bankTransfers.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No bank transfers found.
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-3 mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">November 2025</h2>
            <p className="text-sm text-gray-600 mt-1">Payment Date: 01-Dec-2025</p>
            <p className="text-xs text-gray-500 mt-1">Bank File Generation for Salary Transfer</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="h-4 w-4" />
              NEFT File
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download className="h-4 w-4" />
              Excel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{filteredTransfers.length}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Amount</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalAmount)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalStats.completedCount}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Banks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{Object.keys(totalStats.bankWise).length}</p>
              </div>
              <Building className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Bank-wise Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {Object.entries(totalStats.bankWise).map(([bankName, data]) => (
            <div key={bankName} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-600">{bankName}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-lg font-bold text-gray-900">{formatCurrency(data.amount)}</p>
                <p className="text-xs text-gray-500">({data.count} emp)</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by employee name, ID or account number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {banks.map(bank => (
              <option key={bank} value={bank}>
                {bank === 'all' ? 'All Banks' : bank}
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
                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filteredTransfers.map(transfer => (
          <div key={transfer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{transfer.employeeName}</h3>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                    {transfer.employeeId}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[transfer.status]}`}>
                    {transfer.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {transfer.bankName} - {transfer.branch}
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Payment Date: {new Date(transfer.paymentDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Transfer Amount</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(transfer.netSalary)}</p>
                <p className="text-xs text-gray-500 mt-1">ID: {transfer.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h4 className="text-xs font-semibold text-blue-900 mb-3">Bank Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700">Bank Name</span>
                    <span className="font-medium text-blue-900">{transfer.bankName}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700">Branch</span>
                    <span className="font-medium text-blue-900">{transfer.branch}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700">IFSC Code</span>
                    <span className="font-medium text-blue-900">{transfer.ifscCode}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700">Account Number</span>
                    <span className="font-medium text-blue-900">{maskAccountNumber(transfer.accountNumber)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <h4 className="text-xs font-semibold text-green-900 mb-3">Payment Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">Month/Year</span>
                    <span className="font-medium text-green-900">{transfer.monthYear}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">Payment Date</span>
                    <span className="font-medium text-green-900">{new Date(transfer.paymentDate).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-green-300">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-bold text-green-900">Net Amount</span>
                      <span className="font-bold text-green-900">{formatCurrency(transfer.netSalary)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <h4 className="text-xs font-semibold text-purple-900 mb-3">Transaction Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-700">Status</span>
                    <span className="font-medium text-purple-900 uppercase">{transfer.status}</span>
                  </div>
                  {transfer.transactionId && (
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-700">Transaction ID</span>
                      <span className="font-medium text-purple-900">{transfer.transactionId}</span>
                    </div>
                  )}
                  {transfer.remarks && (
                    <div className="text-xs mt-2">
                      <span className="text-purple-700">Remarks</span>
                      <p className="font-medium text-purple-900 mt-1">{transfer.remarks}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Bank File Generation Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>File Formats:</strong> NEFT/RTGS file format as per bank requirements</li>
          <li>• <strong>Validation:</strong> Verify all bank account details before file generation</li>
          <li>• <strong>Approval:</strong> Get authorized signatory approval before processing</li>
          <li>• <strong>Security:</strong> Use secure channel for file transmission to bank</li>
          <li>• <strong>Backup:</strong> Maintain copy of bank file for reconciliation</li>
          <li>• <strong>Timing:</strong> Upload bank file 1-2 days before payment date</li>
          <li>• <strong>Reconciliation:</strong> Match bank UTR/transaction ID with employee records</li>
          <li>• <strong>Failed Transactions:</strong> Retry failed transactions and notify employees</li>
        </ul>
      </div>
    </div>
  );
}
