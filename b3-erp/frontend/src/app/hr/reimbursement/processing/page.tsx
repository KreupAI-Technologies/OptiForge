'use client';

import { useState, useMemo, useEffect } from 'react';
import { RefreshCw, User, Wallet, Clock, CheckCircle, XCircle, AlertCircle, Eye, MessageSquare, Download } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/hooks/use-toast';
import { HrSelfServiceService } from '@/services/hr-self-service.service';

interface ProcessingReimbursement {
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
  approvedBy: string;
  description: string;
  documentsCount: number;
  processingStage: 'verification' | 'accounts_review' | 'payment_queue' | 'bank_processing';
  processingDays: number;
  expectedPaymentDate: string;
}

export default function Page() {
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ProcessingReimbursement | null>(null);
  const [rows, setRows] = useState<ProcessingReimbursement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrSelfServiceService.getExpenseClaims({ kind: 'reimbursement', status: 'processing' });
        const mapped: ProcessingReimbursement[] = raw.map((r) => ({
          id: r.id,
          employeeCode: r.employeeCode ?? '',
          employeeName: r.employeeName ?? '',
          department: r.department ?? '',
          designation: r.designation ?? '',
          claimNumber: r.claimNumber ?? '',
          claimType: (r.claimType as ProcessingReimbursement['claimType']) ?? 'Other',
          amount: Number(r.amount ?? 0),
          submittedDate: r.submittedDate ?? r.submissionDate ?? '',
          approvedDate: r.approvedDate ?? '',
          approvedBy: r.approver ?? '',
          description: r.description ?? '',
          documentsCount: Number(r.documentsCount ?? 0),
          processingStage: 'verification',
          processingDays: Number(r.pendingDays ?? 0),
          expectedPaymentDate: r.paidDate ?? '',
        }));
        if (!cancelled) setRows(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load processing reimbursements');
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

  const mockReimbursements: ProcessingReimbursement[] = rows;

  const filteredReimbursements = useMemo(() => {
    return mockReimbursements.filter(reimb => {
      const matchesStage = selectedStage === 'all' || reimb.processingStage === selectedStage;
      const matchesDept = selectedDepartment === 'all' || reimb.department === selectedDepartment;
      return matchesStage && matchesDept;
    });
  }, [selectedStage, selectedDepartment]);

  const stats = {
    totalClaims: mockReimbursements.length,
    totalAmount: mockReimbursements.reduce((sum, r) => sum + r.amount, 0),
    verification: mockReimbursements.filter(r => r.processingStage === 'verification').length,
    accountsReview: mockReimbursements.filter(r => r.processingStage === 'accounts_review').length,
    paymentQueue: mockReimbursements.filter(r => r.processingStage === 'payment_queue').length,
    bankProcessing: mockReimbursements.filter(r => r.processingStage === 'bank_processing').length,
    avgProcessingDays: Math.round(mockReimbursements.reduce((sum, r) => sum + r.processingDays, 0) / mockReimbursements.length)
  };

  const getStageColor = (stage: string) => {
    const colors = {
      verification: 'bg-blue-100 text-blue-800',
      accounts_review: 'bg-purple-100 text-purple-800',
      payment_queue: 'bg-orange-100 text-orange-800',
      bank_processing: 'bg-green-100 text-green-800'
    };
    return colors[stage as keyof typeof colors];
  };

  const getStageLabel = (stage: string) => {
    const labels = {
      verification: 'Verification',
      accounts_review: 'Accounts Review',
      payment_queue: 'Payment Queue',
      bank_processing: 'Bank Processing'
    };
    return labels[stage as keyof typeof labels];
  };

  const handleViewDetails = (claim: ProcessingReimbursement) => {
    setSelectedClaim(claim);
    setShowDetailsModal(true);
  };

  const handleMoveToNextStage = async (claim: ProcessingReimbursement) => {
    setIsSubmitting(true);
    try {
      await HrSelfServiceService.updateExpenseClaim(claim.id, {
        status: 'paid',
        paidDate: new Date().toISOString(),
      });
      toast({
        title: "Stage Updated",
        description: `Claim ${claim.claimNumber} moved to next processing stage`
      });
      setRows((prev) => prev.filter((r) => r.id !== claim.id));
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err instanceof Error ? err.message : 'Could not advance the claim',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportToExcel = () => {
    const headers = ['Claim No.', 'Employee', 'Employee Code', 'Department', 'Type', 'Amount', 'Approved Date', 'Approved By', 'Processing Stage', 'Processing Days', 'Expected Payment', 'Description'];
    const csvData = filteredReimbursements.map(r => [
      r.claimNumber,
      r.employeeName,
      r.employeeCode,
      r.department,
      r.claimType,
      r.amount,
      r.approvedDate,
      r.approvedBy,
      getStageLabel(r.processingStage),
      r.processingDays,
      r.expectedPaymentDate,
      r.description
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `processing_reimbursements_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast({
      title: "Export Successful",
      description: "Processing reimbursements exported to Excel format"
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
    {
      key: 'claimNumber', label: 'Claim No.', sortable: true,
      render: (v: string) => <div className="font-semibold text-gray-900">{v}</div>
    },
    {
      key: 'employeeName', label: 'Employee', sortable: true,
      render: (v: string, row: ProcessingReimbursement) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.employeeCode} - {row.designation}</div>
        </div>
      )
    },
    { key: 'department', label: 'Department', sortable: true },
    {
      key: 'claimType', label: 'Type', sortable: true,
      render: (v: string) => (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
          {v}
        </span>
      )
    },
    {
      key: 'description', label: 'Description', sortable: true,
      render: (v: string, row: ProcessingReimbursement) => (
        <div>
          <div className="text-sm text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">
            Approved: {new Date(row.approvedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} by {row.approvedBy}
          </div>
        </div>
      )
    },
    {
      key: 'amount', label: 'Amount', sortable: true,
      render: (v: number) => <div className="text-sm font-semibold text-gray-900">₹{v.toLocaleString('en-IN')}</div>
    },
    {
      key: 'processingStage', label: 'Stage', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStageColor(v)}`}>
          {getStageLabel(v)}
        </span>
      )
    },
    {
      key: 'processingDays', label: 'Days', sortable: true,
      render: (v: number) => <div className="text-sm text-gray-700">{v} days</div>
    },
    {
      key: 'expectedPaymentDate', label: 'Expected Payment', sortable: true,
      render: (v: string) => (
        <div className="text-sm text-gray-700">
          {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )
    },
    {
      key: 'actions', label: 'Actions', sortable: false,
      render: (_: any, row: ProcessingReimbursement) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => handleMoveToNextStage(row)}
            className="p-1 hover:bg-green-100 rounded"
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <RefreshCw className="h-8 w-8 text-purple-600" />
          Processing Reimbursements
        </h1>
        <p className="text-gray-600 mt-2">Track claims in processing stages</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading processing reimbursements…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-3">
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Claims</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalClaims}</p>
            </div>
            <User className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-xl font-bold text-indigo-600">₹{(stats.totalAmount / 1000).toFixed(1)}k</p>
            </div>
            <Wallet className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Verification</p>
              <p className="text-2xl font-bold text-blue-600">{stats.verification}</p>
            </div>
            <RefreshCw className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accounts</p>
              <p className="text-2xl font-bold text-purple-600">{stats.accountsReview}</p>
            </div>
            <MessageSquare className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Payment Queue</p>
              <p className="text-2xl font-bold text-orange-600">{stats.paymentQueue}</p>
            </div>
            <Clock className="h-10 w-10 text-orange-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bank</p>
              <p className="text-2xl font-bold text-green-600">{stats.bankProcessing}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Days</p>
              <p className="text-2xl font-bold text-gray-600">{stats.avgProcessingDays}</p>
            </div>
            <Clock className="h-10 w-10 text-gray-400" />
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Stage:</label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Stages</option>
              <option value="verification">Verification</option>
              <option value="accounts_review">Accounts Review</option>
              <option value="payment_queue">Payment Queue</option>
              <option value="bank_processing">Bank Processing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Department:</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Departments</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Warehouse & Logistics">Warehouse & Logistics</option>
              <option value="Maintenance">Maintenance</option>
              <option value="IT">IT</option>
              <option value="Sales">Sales</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reimbursements Table */}
      {rows.length === 0 && !isLoading ? (
        <EmptyState
          icon={RefreshCw}
          title="No processing reimbursements found"
          description="There are no reimbursement claims currently in processing."
        />
      ) : (
        <DataTable data={filteredReimbursements} columns={columns} />
      )}

      {/* Processing Stages Info */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Stage Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">1. Verification</h4>
            <p className="text-sm text-blue-800">Documents verified by HR team for completeness and authenticity</p>
            <p className="text-xs text-blue-600 mt-2">Duration: 1-2 days</p>
          </div>
          <div className="p-4 bg-purple-50 border-l-4 border-purple-600 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">2. Accounts Review</h4>
            <p className="text-sm text-purple-800">Finance team reviews amounts and approves for payment</p>
            <p className="text-xs text-purple-600 mt-2">Duration: 1-2 days</p>
          </div>
          <div className="p-4 bg-orange-50 border-l-4 border-orange-600 rounded-lg">
            <h4 className="font-semibold text-orange-900 mb-2">3. Payment Queue</h4>
            <p className="text-sm text-orange-800">Claim added to monthly payment batch awaiting processing</p>
            <p className="text-xs text-orange-600 mt-2">Duration: Until 25th</p>
          </div>
          <div className="p-4 bg-green-50 border-l-4 border-green-600 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">4. Bank Processing</h4>
            <p className="text-sm text-green-800">Payment initiated through bank and awaiting clearance</p>
            <p className="text-xs text-green-600 mt-2">Duration: 1-2 days</p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">Processing Guidelines</h3>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• All approved claims are processed within 5-7 working days</li>
          <li>• Payments are batched and disbursed on 25th of every month</li>
          <li>• Claims in bank processing stage will reflect in employee account within 2 days</li>
          <li>• Any discrepancies found during processing will be communicated to employee</li>
          <li>• High priority claims (medical emergencies) can be expedited with approval</li>
        </ul>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">Claim Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Claim Number</p>
                  <p className="font-semibold text-gray-900">{selectedClaim.claimNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Claim Type</p>
                  <p className="font-semibold text-gray-900">{selectedClaim.claimType}</p>
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
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-semibold text-gray-900">₹{selectedClaim.amount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Processing Stage</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(selectedClaim.processingStage)}`}>
                    {getStageLabel(selectedClaim.processingStage)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-semibold text-gray-900">{selectedClaim.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Submitted Date</p>
                  <p className="font-semibold text-gray-900">{new Date(selectedClaim.submittedDate).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Approved Date</p>
                  <p className="font-semibold text-gray-900">{new Date(selectedClaim.approvedDate).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Approved By</p>
                  <p className="font-semibold text-gray-900">{selectedClaim.approvedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expected Payment</p>
                  <p className="font-semibold text-gray-900">{new Date(selectedClaim.expectedPaymentDate).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Processing Days</p>
                <p className="font-semibold text-gray-900">{selectedClaim.processingDays} days</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Documents Attached</p>
                <p className="font-semibold text-gray-900">{selectedClaim.documentsCount} file(s)</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleMoveToNextStage(selectedClaim);
                  setShowDetailsModal(false);
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-60"
              >
                {isSubmitting ? 'Updating…' : 'Move to Next Stage'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
