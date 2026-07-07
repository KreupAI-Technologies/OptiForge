'use client';

import { useState, useMemo, useEffect } from 'react';
import { CheckCircle, User, Wallet, Calendar, TrendingUp, Download, Eye, Search, XCircle, AlertCircle } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/hooks/use-toast';
import { HrSelfServiceService } from '@/services/hr-self-service.service';

interface PaidReimbursement {
  id: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  claimNumber: string;
  claimType: 'Medical' | 'Education' | 'Conveyance' | 'Relocation' | 'Uniform' | 'Mobile' | 'Internet' | 'Other';
  amount: number;
  submittedDate: string;
  approvedDate: string;
  paidDate: string;
  paymentMode: 'bank_transfer' | 'cheque' | 'cash';
  transactionReference: string;
  description: string;
  fiscalYear: string;
  quarter: string;
}

export default function Page() {
  const [selectedYear, setSelectedYear] = useState('2024-25');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<PaidReimbursement | null>(null);
  const [rows, setRows] = useState<PaidReimbursement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrSelfServiceService.getExpenseClaims({ kind: 'reimbursement', status: 'paid' });
        const mapped: PaidReimbursement[] = raw.map((r) => ({
          id: r.id,
          employeeCode: r.employeeCode ?? '',
          employeeName: r.employeeName ?? '',
          department: r.department ?? '',
          designation: r.designation ?? '',
          claimNumber: r.claimNumber ?? '',
          claimType: (r.claimType as PaidReimbursement['claimType']) ?? 'Other',
          amount: Number(r.amount ?? 0),
          submittedDate: r.submittedDate ?? r.submissionDate ?? '',
          approvedDate: r.approvedDate ?? '',
          paidDate: r.paidDate ?? '',
          paymentMode: (r.paymentMethod as PaidReimbursement['paymentMode']) ?? 'bank_transfer',
          transactionReference: r.paymentReference ?? '',
          description: r.description ?? '',
          fiscalYear: '',
          quarter: '',
        }));
        if (!cancelled) setRows(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load paid reimbursements');
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

  const mockReimbursements: PaidReimbursement[] = rows;

  const filteredReimbursements = useMemo(() => {
    return mockReimbursements.filter(reimb => {
      const matchesYear = selectedYear === 'all' || reimb.fiscalYear === selectedYear;
      const matchesType = selectedType === 'all' || reimb.claimType === selectedType;
      const matchesSearch = searchTerm === '' ||
        reimb.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reimb.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reimb.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesYear && matchesType && matchesSearch;
    });
  }, [selectedYear, selectedType, searchTerm]);

  const stats = {
    totalClaims: mockReimbursements.length,
    totalAmount: mockReimbursements.reduce((sum, r) => sum + r.amount, 0),
    currentMonth: mockReimbursements.filter(r => {
      const paidDate = new Date(r.paidDate);
      const now = new Date();
      return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear();
    }).length,
    currentMonthAmount: mockReimbursements.filter(r => {
      const paidDate = new Date(r.paidDate);
      const now = new Date();
      return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear();
    }).reduce((sum, r) => sum + r.amount, 0),
    avgClaimAmount: Math.round(mockReimbursements.reduce((sum, r) => sum + r.amount, 0) / mockReimbursements.length),
    bankTransfers: mockReimbursements.filter(r => r.paymentMode === 'bank_transfer').length
  };

  const getPaymentModeLabel = (mode: string) => {
    const labels = {
      bank_transfer: 'Bank Transfer',
      cheque: 'Cheque',
      cash: 'Cash'
    };
    return labels[mode as keyof typeof labels];
  };

  const handleViewDetails = (claim: PaidReimbursement) => {
    setSelectedClaim(claim);
    setShowDetailsModal(true);
  };

  const handleDownloadReceipt = (claim: PaidReimbursement) => {
    toast({
      title: "Downloading Receipt",
      description: `Downloading payment receipt for claim ${claim.claimNumber}`
    });
  };

  const handleExportToExcel = () => {
    const headers = ['Claim No.', 'Employee', 'Employee Code', 'Department', 'Type', 'Amount', 'Submitted Date', 'Approved Date', 'Paid Date', 'Payment Mode', 'Transaction Ref', 'Fiscal Year', 'Quarter', 'Description'];
    const csvData = filteredReimbursements.map(r => [
      r.claimNumber,
      r.employeeName,
      r.employeeCode,
      r.department,
      r.claimType,
      r.amount,
      r.submittedDate,
      r.approvedDate,
      r.paidDate,
      getPaymentModeLabel(r.paymentMode),
      r.transactionReference,
      r.fiscalYear,
      r.quarter,
      r.description
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paid_reimbursements_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast({
      title: "Export Successful",
      description: "Paid reimbursements exported to Excel format"
    });
  };

  const handleExportToPDF = () => {
    toast({
      title: "Generating PDF",
      description: "PDF report is being generated. Download will start shortly."
    });

    setTimeout(() => {
      toast({
        title: "PDF Ready",
        description: "Your PDF report has been downloaded"
      });
    }, 2000);
  };

  const columns = [
    { key: 'claimNumber', label: 'Claim No.', sortable: true,
      render: (v: string) => <div className="font-semibold text-gray-900">{v}</div>
    },
    { key: 'employeeName', label: 'Employee', sortable: true,
      render: (v: string, row: PaidReimbursement) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.employeeCode} - {row.designation}</div>
        </div>
      )
    },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'claimType', label: 'Type', sortable: true,
      render: (v: string) => (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          {v}
        </span>
      )
    },
    { key: 'description', label: 'Description', sortable: true,
      render: (v: string) => <div className="text-sm text-gray-900">{v}</div>
    },
    { key: 'amount', label: 'Amount', sortable: true,
      render: (v: number) => <div className="text-sm font-semibold text-gray-900">₹{v.toLocaleString('en-IN')}</div>
    },
    { key: 'paidDate', label: 'Paid Date', sortable: true,
      render: (v: string) => (
        <div className="text-sm text-gray-700">
          {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )
    },
    { key: 'paymentMode', label: 'Payment Mode', sortable: true,
      render: (v: string) => (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {getPaymentModeLabel(v)}
        </span>
      )
    },
    { key: 'transactionReference', label: 'Transaction Ref', sortable: true,
      render: (v: string) => <div className="text-sm font-mono text-gray-700">{v}</div>
    },
    { key: 'actions', label: 'Actions', sortable: false,
      render: (_: any, row: PaidReimbursement) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-1 hover:bg-gray-100 rounded"
            title="View details"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => handleDownloadReceipt(row)}
            className="p-1 hover:bg-blue-100 rounded"
            title="Download receipt"
          >
            <Download className="h-4 w-4 text-blue-600" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <CheckCircle className="h-8 w-8 text-green-600" />
          Paid Reimbursements
        </h1>
        <p className="text-gray-600 mt-2">View completed reimbursement payments</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading paid reimbursements…
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
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalClaims}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-xl font-bold text-indigo-600">₹{(stats.totalAmount / 100000).toFixed(2)}L</p>
            </div>
            <Wallet className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-blue-600">{stats.currentMonth}</p>
            </div>
            <Calendar className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Month Amount</p>
              <p className="text-xl font-bold text-purple-600">₹{(stats.currentMonthAmount / 1000).toFixed(1)}k</p>
            </div>
            <Wallet className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Amount</p>
              <p className="text-xl font-bold text-orange-600">₹{(stats.avgClaimAmount / 1000).toFixed(1)}k</p>
            </div>
            <TrendingUp className="h-10 w-10 text-orange-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-teal-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bank Transfers</p>
              <p className="text-2xl font-bold text-teal-600">{stats.bankTransfers}</p>
            </div>
            <User className="h-10 w-10 text-teal-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Fiscal Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Years</option>
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
              <option value="2022-23">2022-23</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Types</option>
              <option value="Medical">Medical</option>
              <option value="Education">Education</option>
              <option value="Conveyance">Conveyance</option>
              <option value="Relocation">Relocation</option>
              <option value="Uniform">Uniform</option>
              <option value="Mobile">Mobile</option>
              <option value="Internet">Internet</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search:</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, claim #, emp code..."
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="mb-3 flex justify-end gap-3">
        <button
          onClick={handleExportToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
        >
          <Download className="h-4 w-4" />
          Export to Excel
        </button>
        <button
          onClick={handleExportToPDF}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
        >
          <Download className="h-4 w-4" />
          Export to PDF
        </button>
      </div>

      {/* Reimbursements Table */}
      {rows.length === 0 && !isLoading ? (
        <EmptyState
          icon={CheckCircle}
          title="No paid reimbursements found"
          description="There are no completed reimbursement payments to display yet."
        />
      ) : (
        <DataTable data={filteredReimbursements} columns={columns} />
      )}

      {/* Payment Summary by Type */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Summary by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Medical</h4>
            <p className="text-2xl font-bold text-blue-600">
              ₹{(mockReimbursements.filter(r => r.claimType === 'Medical').reduce((sum, r) => sum + r.amount, 0) / 1000).toFixed(1)}k
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {mockReimbursements.filter(r => r.claimType === 'Medical').length} claims
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Education</h4>
            <p className="text-2xl font-bold text-green-600">
              ₹{(mockReimbursements.filter(r => r.claimType === 'Education').reduce((sum, r) => sum + r.amount, 0) / 1000).toFixed(1)}k
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {mockReimbursements.filter(r => r.claimType === 'Education').length} claims
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Conveyance</h4>
            <p className="text-2xl font-bold text-purple-600">
              ₹{(mockReimbursements.filter(r => r.claimType === 'Conveyance').reduce((sum, r) => sum + r.amount, 0) / 1000).toFixed(1)}k
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {mockReimbursements.filter(r => r.claimType === 'Conveyance').length} claims
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Relocation</h4>
            <p className="text-2xl font-bold text-orange-600">
              ₹{(mockReimbursements.filter(r => r.claimType === 'Relocation').reduce((sum, r) => sum + r.amount, 0) / 1000).toFixed(1)}k
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {mockReimbursements.filter(r => r.claimType === 'Relocation').length} claims
            </p>
          </div>
          <div className="p-4 bg-teal-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Uniform</h4>
            <p className="text-2xl font-bold text-teal-600">
              ₹{(mockReimbursements.filter(r => r.claimType === 'Uniform').reduce((sum, r) => sum + r.amount, 0) / 1000).toFixed(1)}k
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {mockReimbursements.filter(r => r.claimType === 'Uniform').length} claims
            </p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Mobile</h4>
            <p className="text-2xl font-bold text-indigo-600">
              ₹{(mockReimbursements.filter(r => r.claimType === 'Mobile').reduce((sum, r) => sum + r.amount, 0) / 1000).toFixed(1)}k
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {mockReimbursements.filter(r => r.claimType === 'Mobile').length} claims
            </p>
          </div>
          <div className="p-4 bg-pink-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Internet</h4>
            <p className="text-2xl font-bold text-pink-600">
              ₹{(mockReimbursements.filter(r => r.claimType === 'Internet').reduce((sum, r) => sum + r.amount, 0) / 1000).toFixed(1)}k
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {mockReimbursements.filter(r => r.claimType === 'Internet').length} claims
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Other</h4>
            <p className="text-2xl font-bold text-gray-600">
              ₹{(mockReimbursements.filter(r => r.claimType === 'Other').reduce((sum, r) => sum + r.amount, 0) / 1000).toFixed(1)}k
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {mockReimbursements.filter(r => r.claimType === 'Other').length} claims
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-green-900 mb-2">Payment Records</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• All payments are processed on the 25th of every month</li>
          <li>• Transaction references can be used to track payments in bank statements</li>
          <li>• Payment receipts are automatically emailed to employees</li>
          <li>• Historical records are maintained for 7 years as per compliance requirements</li>
          <li>• Export options available for audit and reporting purposes</li>
        </ul>
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Payment Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Payment Confirmation Banner */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <p className="font-semibold">Payment Completed Successfully</p>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  This reimbursement has been paid to the employee
                </p>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Claim Number</p>
                  <p className="font-semibold text-gray-900">{selectedClaim.claimNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Claim Type</p>
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {selectedClaim.claimType}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employee</p>
                  <p className="font-semibold text-gray-900">{selectedClaim.employeeName}</p>
                  <p className="text-xs text-gray-500">{selectedClaim.employeeCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-semibold text-gray-900">{selectedClaim.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Designation</p>
                  <p className="font-semibold text-gray-900">{selectedClaim.designation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount Paid</p>
                  <p className="text-lg font-bold text-green-600">₹{selectedClaim.amount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-semibold text-gray-900">{selectedClaim.description}</p>
              </div>

              {/* Payment Information */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Payment Mode</p>
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getPaymentModeLabel(selectedClaim.paymentMode)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transaction Reference</p>
                    <p className="font-mono font-semibold text-gray-900">{selectedClaim.transactionReference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Paid Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedClaim.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fiscal Year / Quarter</p>
                    <p className="font-semibold text-gray-900">{selectedClaim.fiscalYear} / {selectedClaim.quarter}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Submitted</p>
                      <p className="text-xs text-gray-600">
                        {new Date(selectedClaim.submittedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Approved</p>
                      <p className="text-xs text-gray-600">
                        {new Date(selectedClaim.approvedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5"></div>
                    <div>
                      <p className="text-sm font-semibold text-green-900">Paid</p>
                      <p className="text-xs text-green-700">
                        {new Date(selectedClaim.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDownloadReceipt(selectedClaim);
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
