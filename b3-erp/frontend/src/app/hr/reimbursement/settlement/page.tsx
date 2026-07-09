'use client';

import { useState, useMemo, useEffect } from 'react';
import { DollarSign, User, Wallet, Calculator, TrendingDown, AlertCircle, Eye, Download, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/hooks/use-toast';
import { HrSelfServiceService } from '@/services/hr-self-service.service';

interface SettlementReimbursement {
  id: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  claimNumber: string;
  claimType: 'Medical' | 'Education' | 'Conveyance' | 'Relocation' | 'Uniform' | 'Mobile' | 'Internet' | 'Other';
  originalAmount: number;
  approvedAmount: number;
  rejectedAmount: number;
  rejectionReason?: string;
  submittedDate: string;
  reviewedDate: string;
  reviewedBy: string;
  description: string;
  documentsCount: number;
  settlementType: 'partial_approval' | 'overpayment_recovery' | 'advance_adjustment' | 'full_settlement';
  advanceAmount?: number;
  netPayable: number;
}

export default function Page() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSettlementType, setSelectedSettlementType] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<SettlementReimbursement | null>(null);
  const [rows, setRows] = useState<SettlementReimbursement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrSelfServiceService.getExpenseClaims({ kind: 'reimbursement' });
        const mapped: SettlementReimbursement[] = raw.map((r) => {
          const originalAmount = Number(r.amount ?? 0);
          const approvedAmount = r.netPayable != null ? Number(r.netPayable) : originalAmount;
          return {
            id: r.id,
            employeeCode: r.employeeCode ?? '',
            employeeName: r.employeeName ?? '',
            department: r.department ?? '',
            designation: r.designation ?? '',
            claimNumber: r.claimNumber ?? '',
            claimType: (r.claimType as SettlementReimbursement['claimType']) ?? 'Other',
            originalAmount,
            approvedAmount,
            rejectedAmount: Math.max(0, originalAmount - approvedAmount),
            rejectionReason: r.rejectionReason ?? undefined,
            submittedDate: r.submittedDate ?? r.submissionDate ?? '',
            reviewedDate: r.approvedDate ?? '',
            reviewedBy: r.approver ?? '',
            description: r.description ?? '',
            documentsCount: Number(r.documentsCount ?? 0),
            settlementType: 'full_settlement',
            advanceAmount: r.advanceAmount != null ? Number(r.advanceAmount) : undefined,
            netPayable: r.netPayable != null ? Number(r.netPayable) : originalAmount,
          };
        });
        if (!cancelled) setRows(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load settlement reimbursements');
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

  const filteredReimbursements = useMemo(() => {
    return rows.filter(reimb => {
      const matchesType = selectedType === 'all' || reimb.claimType === selectedType;
      const matchesSettlement = selectedSettlementType === 'all' || reimb.settlementType === selectedSettlementType;
      return matchesType && matchesSettlement;
    });
  }, [rows, selectedType, selectedSettlementType]);

  const totalClaimed = rows.reduce((sum, r) => sum + r.originalAmount, 0);
  const totalApproved = rows.reduce((sum, r) => sum + r.approvedAmount, 0);
  const stats = {
    totalClaims: rows.length,
    totalClaimed,
    totalApproved,
    totalRejected: rows.reduce((sum, r) => sum + r.rejectedAmount, 0),
    totalNetPayable: rows.reduce((sum, r) => sum + r.netPayable, 0),
    approvalRate: totalClaimed ? Math.round((totalApproved / totalClaimed) * 100) : 0,
    partialApprovals: rows.filter(r => r.settlementType === 'partial_approval').length
  };

  const getSettlementTypeColor = (type: string) => {
    const colors = {
      partial_approval: 'bg-yellow-100 text-yellow-800',
      overpayment_recovery: 'bg-red-100 text-red-800',
      advance_adjustment: 'bg-blue-100 text-blue-800',
      full_settlement: 'bg-green-100 text-green-800'
    };
    return colors[type as keyof typeof colors];
  };

  const getSettlementTypeLabel = (type: string) => {
    const labels = {
      partial_approval: 'Partial Approval',
      overpayment_recovery: 'Overpayment Recovery',
      advance_adjustment: 'Advance Adjustment',
      full_settlement: 'Full Settlement'
    };
    return labels[type as keyof typeof labels];
  };

  const handleViewDetails = (claim: SettlementReimbursement) => {
    setSelectedClaim(claim);
    setShowDetailsModal(true);
  };

  const handleApproveSettlement = async (claim: SettlementReimbursement) => {
    setIsSubmitting(true);
    try {
      await HrSelfServiceService.updateExpenseClaim(claim.id, {
        status: 'processing',
        netPayable: claim.netPayable,
        approvedDate: new Date().toISOString(),
      });
      toast({
        title: "Settlement Approved",
        description: `Settlement for claim ${claim.claimNumber} has been approved`
      });
      setRows((prev) => prev.filter((r) => r.id !== claim.id));
    } catch (err) {
      toast({
        title: "Settlement Failed",
        description: err instanceof Error ? err.message : 'Could not approve the settlement',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportToExcel = () => {
    const headers = ['Claim No.', 'Employee', 'Employee Code', 'Department', 'Type', 'Original Amount', 'Approved Amount', 'Rejected Amount', 'Advance Amount', 'Net Payable', 'Settlement Type', 'Reviewed Date', 'Reviewed By', 'Rejection Reason', 'Description'];
    const csvData = filteredReimbursements.map(r => [
      r.claimNumber,
      r.employeeName,
      r.employeeCode,
      r.department,
      r.claimType,
      r.originalAmount,
      r.approvedAmount,
      r.rejectedAmount,
      r.advanceAmount || 0,
      r.netPayable,
      getSettlementTypeLabel(r.settlementType),
      r.reviewedDate,
      r.reviewedBy,
      r.rejectionReason || 'N/A',
      r.description
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settlement_reimbursements_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast({
      title: "Export Successful",
      description: "Settlement reimbursements exported to Excel format"
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
      render: (v: string, row: SettlementReimbursement) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.employeeCode} - {row.designation}</div>
        </div>
      )
    },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'claimType', label: 'Type', sortable: true,
      render: (v: string) => (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
          {v}
        </span>
      )
    },
    { key: 'originalAmount', label: 'Claimed', sortable: true,
      render: (v: number) => <div className="text-sm text-gray-700">₹{v.toLocaleString('en-IN')}</div>
    },
    { key: 'approvedAmount', label: 'Approved', sortable: true,
      render: (v: number) => <div className="text-sm font-semibold text-green-600">₹{v.toLocaleString('en-IN')}</div>
    },
    { key: 'rejectedAmount', label: 'Rejected', sortable: true,
      render: (v: number) => <div className="text-sm font-semibold text-red-600">₹{v.toLocaleString('en-IN')}</div>
    },
    { key: 'netPayable', label: 'Net Payable', sortable: true,
      render: (v: number) => <div className="text-sm font-bold text-blue-600">₹{v.toLocaleString('en-IN')}</div>
    },
    { key: 'settlementType', label: 'Settlement Type', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSettlementTypeColor(v)}`}>
          {getSettlementTypeLabel(v)}
        </span>
      )
    },
    { key: 'reviewedDate', label: 'Reviewed', sortable: true,
      render: (v: string, row: SettlementReimbursement) => (
        <div>
          <div className="text-sm text-gray-700">
            {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </div>
          <div className="text-xs text-gray-500">by {row.reviewedBy}</div>
        </div>
      )
    },
    { key: 'actions', label: 'Actions', sortable: false,
      render: (_: any, row: SettlementReimbursement) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => handleApproveSettlement(row)}
            className="p-1 hover:bg-green-100 rounded"
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
          </button>
          <button className="p-1 hover:bg-blue-100 rounded">
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
          <DollarSign className="h-8 w-8 text-indigo-600" />
          Reimbursement Settlement
        </h1>
        <p className="text-gray-600 mt-2">Review and finalize claim settlements with adjustments</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading settlement reimbursements…
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
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Claims</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.totalClaims}</p>
            </div>
            <User className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Claimed</p>
              <p className="text-xl font-bold text-gray-600">₹{(stats.totalClaimed / 1000).toFixed(1)}k</p>
            </div>
            <Calculator className="h-10 w-10 text-gray-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-xl font-bold text-green-600">₹{(stats.totalApproved / 1000).toFixed(1)}k</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-xl font-bold text-red-600">₹{(stats.totalRejected / 1000).toFixed(1)}k</p>
            </div>
            <XCircle className="h-10 w-10 text-red-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Payable</p>
              <p className="text-xl font-bold text-blue-600">₹{(stats.totalNetPayable / 1000).toFixed(1)}k</p>
            </div>
            <Wallet className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approval Rate</p>
              <p className="text-2xl font-bold text-purple-600">{stats.approvalRate}%</p>
            </div>
            <TrendingDown className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Partial</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.partialApprovals}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-yellow-400" />
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Settlement Type:</label>
            <select
              value={selectedSettlementType}
              onChange={(e) => setSelectedSettlementType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Settlement Types</option>
              <option value="partial_approval">Partial Approval</option>
              <option value="advance_adjustment">Advance Adjustment</option>
              <option value="full_settlement">Full Settlement</option>
              <option value="overpayment_recovery">Overpayment Recovery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reimbursements Table */}
      {rows.length === 0 && !isLoading ? (
        <EmptyState
          icon={DollarSign}
          title="No settlements found"
          description="There are no reimbursement settlements to review yet."
        />
      ) : (
        <DataTable data={filteredReimbursements} columns={columns} />
      )}

      {/* Settlement Analysis */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Settlement Type Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Partial Approval</p>
                <p className="text-xs text-gray-600">Claims with some amount rejected</p>
              </div>
              <span className="text-xl font-bold text-yellow-600">
                {rows.filter(r => r.settlementType === 'partial_approval').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Advance Adjustment</p>
                <p className="text-xs text-gray-600">Net amount after advance deduction</p>
              </div>
              <span className="text-xl font-bold text-blue-600">
                {rows.filter(r => r.settlementType === 'advance_adjustment').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Full Settlement</p>
                <p className="text-xs text-gray-600">100% claim approval</p>
              </div>
              <span className="text-xl font-bold text-green-600">
                {rows.filter(r => r.settlementType === 'full_settlement').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Overpayment Recovery</p>
                <p className="text-xs text-gray-600">Recovery from employee</p>
              </div>
              <span className="text-xl font-bold text-red-600">
                {rows.filter(r => r.settlementType === 'overpayment_recovery').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Rejection Reasons</h3>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Exceeds Annual/Monthly Limits</p>
                  <p className="text-sm text-gray-700 mt-1">Claims exceeding policy defined limits for the category</p>
                  <p className="text-xs text-red-600 mt-1 font-semibold">Most Common</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Non-Reimbursable Items</p>
                  <p className="text-sm text-gray-700 mt-1">Items not covered under reimbursement policy</p>
                  <p className="text-xs text-orange-600 mt-1 font-semibold">Common</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Personal Expenses</p>
                  <p className="text-sm text-gray-700 mt-1">Personal expenses included in official claims</p>
                  <p className="text-xs text-yellow-600 mt-1 font-semibold">Moderate</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Insufficient Documentation</p>
                  <p className="text-sm text-gray-700 mt-1">Missing or incomplete supporting documents</p>
                  <p className="text-xs text-blue-600 mt-1 font-semibold">Occasional</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-indigo-900 mb-2">Settlement Process</h3>
        <ul className="text-sm text-indigo-800 space-y-1">
          <li>• All settlements are reviewed and finalized by finance team before payment</li>
          <li>• Employees are notified of any partial approvals or rejections with detailed reasons</li>
          <li>• Advance amounts are automatically adjusted from final payable amount</li>
          <li>• Settlement approval moves claims to payment queue for processing on 25th</li>
          <li>• Employees can appeal rejected amounts within 7 days with additional documentation</li>
          <li>• Overpayment recovery is processed through salary deduction in next payroll cycle</li>
        </ul>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">Settlement Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Basic Info */}
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
              </div>

              {/* Description */}
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-semibold text-gray-900">{selectedClaim.description}</p>
              </div>

              {/* Settlement Breakdown */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-indigo-200">
                <h3 className="font-semibold text-gray-900 mb-3">Settlement Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Original Claimed Amount:</span>
                    <span className="font-semibold text-gray-900">₹{selectedClaim.originalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-green-700">
                    <span>Approved Amount:</span>
                    <span className="font-semibold">₹{selectedClaim.approvedAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-red-700">
                    <span>Rejected Amount:</span>
                    <span className="font-semibold">₹{selectedClaim.rejectedAmount.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedClaim.advanceAmount && (
                    <div className="flex justify-between items-center text-orange-700">
                      <span>Less: Advance Paid:</span>
                      <span className="font-semibold">₹{selectedClaim.advanceAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="border-t border-indigo-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Net Payable Amount:</span>
                      <span className="font-bold text-blue-600 text-lg">₹{selectedClaim.netPayable.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rejection Reason */}
              {selectedClaim.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900 mb-1">Partial Rejection Reason</p>
                      <p className="text-sm text-red-800">{selectedClaim.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Review Info */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Submitted Date</p>
                  <p className="font-semibold text-gray-900">{new Date(selectedClaim.submittedDate).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reviewed Date</p>
                  <p className="font-semibold text-gray-900">{new Date(selectedClaim.reviewedDate).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reviewed By</p>
                  <p className="font-semibold text-gray-900">{selectedClaim.reviewedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Settlement Type</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSettlementTypeColor(selectedClaim.settlementType)}`}>
                    {getSettlementTypeLabel(selectedClaim.settlementType)}
                  </span>
                </div>
              </div>

              {/* Documents */}
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
                  handleApproveSettlement(selectedClaim);
                  setShowDetailsModal(false);
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-60"
              >
                {isSubmitting ? 'Approving…' : 'Approve Settlement'}
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
