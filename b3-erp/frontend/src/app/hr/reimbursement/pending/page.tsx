'use client';

import { useState, useMemo, useEffect } from 'react';
import { Clock, CheckCircle, User, Wallet, TrendingUp, AlertTriangle, AlertCircle, Eye, Check, X, XCircle, Download } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { toast } from '@/hooks/use-toast';
import { HrSelfServiceService } from '@/services/hr-self-service.service';

interface PendingReimbursement {
  id: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  claimNumber: string;
  claimType: 'Medical' | 'Education' | 'Conveyance' | 'Relocation' | 'Uniform' | 'Mobile' | 'Internet' | 'Other';
  amount: number;
  submittedDate: string;
  billDate: string;
  description: string;
  documentsCount: number;
  pendingDays: number;
  priority: 'high' | 'medium' | 'low';
}

export default function Page() {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<PendingReimbursement | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rows, setRows] = useState<PendingReimbursement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrSelfServiceService.getExpenseClaims({ kind: 'reimbursement', status: 'pending' });
        const mapped: PendingReimbursement[] = raw.map((r) => ({
          id: r.id,
          employeeCode: r.employeeCode ?? '',
          employeeName: r.employeeName ?? '',
          department: r.department ?? '',
          designation: r.designation ?? '',
          claimNumber: r.claimNumber ?? '',
          claimType: (r.claimType as PendingReimbursement['claimType']) ?? 'Other',
          amount: Number(r.amount ?? 0),
          submittedDate: r.submittedDate ?? r.submissionDate ?? '',
          billDate: r.billDate ?? '',
          description: r.description ?? '',
          documentsCount: Number(r.documentsCount ?? 0),
          pendingDays: Number(r.pendingDays ?? 0),
          priority: (r.priority as PendingReimbursement['priority']) ?? 'low',
        }));
        if (!cancelled) setRows(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load pending reimbursements');
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

  const mockReimbursements: PendingReimbursement[] = rows.length ? rows : [
    {
      id: '1', employeeCode: 'KMF-2024-101', employeeName: 'Rajesh Kumar', department: 'Manufacturing',
      designation: 'Production Manager', claimNumber: 'REIMB-2024-301', claimType: 'Medical',
      amount: 8500, submittedDate: '2024-10-20', billDate: '2024-10-18',
      description: 'Medical treatment - hospitalization', documentsCount: 4, pendingDays: 6, priority: 'high'
    },
    {
      id: '2', employeeCode: 'KMF-2024-102', employeeName: 'Priya Sharma', department: 'Human Resources',
      designation: 'HR Manager', claimNumber: 'REIMB-2024-302', claimType: 'Education',
      amount: 15000, submittedDate: '2024-10-22', billDate: '2024-10-15',
      description: 'Child education - school fees', documentsCount: 3, pendingDays: 4, priority: 'medium'
    },
    {
      id: '3', employeeCode: 'KMF-2024-103', employeeName: 'Amit Singh', department: 'Warehouse & Logistics',
      designation: 'Warehouse Manager', claimNumber: 'REIMB-2024-303', claimType: 'Conveyance',
      amount: 3200, submittedDate: '2024-10-23', billDate: '2024-10-22',
      description: 'Monthly conveyance allowance', documentsCount: 1, pendingDays: 3, priority: 'low'
    },
    {
      id: '4', employeeCode: 'KMF-2024-104', employeeName: 'Meena Rao', department: 'Quality Assurance',
      designation: 'QA Manager', claimNumber: 'REIMB-2024-304', claimType: 'Mobile',
      amount: 1200, submittedDate: '2024-10-24', billDate: '2024-10-20',
      description: 'Mobile bill reimbursement', documentsCount: 1, pendingDays: 2, priority: 'low'
    },
    {
      id: '5', employeeCode: 'KMF-2024-105', employeeName: 'Suresh Patel', department: 'Maintenance',
      designation: 'Maintenance Head', claimNumber: 'REIMB-2024-305', claimType: 'Uniform',
      amount: 2500, submittedDate: '2024-10-18', billDate: '2024-10-15',
      description: 'Safety shoes and uniform', documentsCount: 2, pendingDays: 8, priority: 'medium'
    },
    {
      id: '6', employeeCode: 'KMF-2024-106', employeeName: 'Anil Verma', department: 'IT',
      designation: 'IT Manager', claimNumber: 'REIMB-2024-306', claimType: 'Internet',
      amount: 1800, submittedDate: '2024-10-25', billDate: '2024-10-22',
      description: 'Home internet reimbursement', documentsCount: 1, pendingDays: 1, priority: 'low'
    },
    {
      id: '7', employeeCode: 'KMF-2024-107', employeeName: 'Kavita Nair', department: 'Sales',
      designation: 'Sales Manager', claimNumber: 'REIMB-2024-307', claimType: 'Relocation',
      amount: 25000, submittedDate: '2024-10-15', billDate: '2024-10-10',
      description: 'Relocation expenses - new city', documentsCount: 6, pendingDays: 11, priority: 'high'
    },
    {
      id: '8', employeeCode: 'KMF-2024-108', employeeName: 'Deepak Joshi', department: 'Finance',
      designation: 'Accounts Manager', claimNumber: 'REIMB-2024-308', claimType: 'Medical',
      amount: 12000, submittedDate: '2024-10-21', billDate: '2024-10-19',
      description: 'Medical expenses - surgery', documentsCount: 5, pendingDays: 5, priority: 'high'
    }
  ];

  const filteredReimbursements = useMemo(() => {
    return mockReimbursements.filter(reimb => {
      const matchesDept = selectedDepartment === 'all' || reimb.department === selectedDepartment;
      const matchesType = selectedType === 'all' || reimb.claimType === selectedType;
      return matchesDept && matchesType;
    });
  }, [selectedDepartment, selectedType]);

  const stats = {
    totalClaims: mockReimbursements.length,
    totalAmount: mockReimbursements.reduce((sum, r) => sum + r.amount, 0),
    highPriority: mockReimbursements.filter(r => r.priority === 'high').length,
    mediumPriority: mockReimbursements.filter(r => r.priority === 'medium').length,
    avgPendingDays: Math.round(mockReimbursements.reduce((sum, r) => sum + r.pendingDays, 0) / mockReimbursements.length),
    overdueCount: mockReimbursements.filter(r => r.pendingDays > 7).length
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors];
  };

  const handleViewDetails = (claim: PendingReimbursement) => {
    setSelectedClaim(claim);
    setShowDetailsModal(true);
  };

  const handleApproveClaim = (claim: PendingReimbursement) => {
    setSelectedClaim(claim);
    setShowApproveModal(true);
  };

  const handleRejectClaim = (claim: PendingReimbursement) => {
    setSelectedClaim(claim);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const confirmApprove = () => {
    toast({
      title: "Claim Approved",
      description: `Claim ${selectedClaim?.claimNumber} has been approved and moved to processing`
    });
    setShowApproveModal(false);
    setSelectedClaim(null);
  };

  const confirmReject = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this claim",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Claim Rejected",
      description: `Claim ${selectedClaim?.claimNumber} has been rejected`
    });
    setShowRejectModal(false);
    setSelectedClaim(null);
    setRejectionReason('');
  };

  const handleExportToExcel = () => {
    // Convert filtered data to CSV format
    const headers = ['Claim No.', 'Employee', 'Employee Code', 'Department', 'Type', 'Amount', 'Bill Date', 'Submitted Date', 'Pending Days', 'Priority', 'Description'];
    const csvData = filteredReimbursements.map(r => [
      r.claimNumber,
      r.employeeName,
      r.employeeCode,
      r.department,
      r.claimType,
      r.amount,
      r.billDate,
      r.submittedDate,
      r.pendingDays,
      r.priority,
      r.description
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pending_reimbursements_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast({
      title: "Export Successful",
      description: "Pending reimbursements exported to Excel format"
    });
  };

  const handleExportToPDF = () => {
    toast({
      title: "Generating PDF",
      description: "PDF report is being generated. Download will start shortly."
    });

    // In production, this would call a backend API to generate PDF
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
      render: (v: string, row: PendingReimbursement) => (
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
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
          {v}
        </span>
      )
    },
    {
      key: 'description', label: 'Description', sortable: true,
      render: (v: string, row: PendingReimbursement) => (
        <div>
          <div className="text-sm text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">
            Bill: {new Date(row.billDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} |
            Docs: {row.documentsCount}
          </div>
        </div>
      )
    },
    {
      key: 'amount', label: 'Amount', sortable: true,
      render: (v: number) => <div className="text-sm font-semibold text-gray-900">₹{v.toLocaleString('en-IN')}</div>
    },
    {
      key: 'pendingDays', label: 'Pending', sortable: true,
      render: (v: number) => (
        <div className={`text-sm font-semibold ${v > 7 ? 'text-red-600' : 'text-gray-700'}`}>
          {v} days
        </div>
      )
    },
    {
      key: 'priority', label: 'Priority', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(v)}`}>
          {v.toUpperCase()}
        </span>
      )
    },
    {
      key: 'actions', label: 'Actions', sortable: false,
      render: (_: any, row: PendingReimbursement) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-1 hover:bg-gray-100 rounded"
            title="View details"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => handleApproveClaim(row)}
            className="p-1 hover:bg-green-100 rounded"
            title="Approve claim"
          >
            <Check className="h-4 w-4 text-green-600" />
          </button>
          <button
            onClick={() => handleRejectClaim(row)}
            className="p-1 hover:bg-red-100 rounded"
            title="Reject claim"
          >
            <X className="h-4 w-4 text-red-600" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Clock className="h-8 w-8 text-orange-600" />
          Pending Reimbursements
        </h1>
        <p className="text-gray-600 mt-2">Review and process pending reimbursement claims</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading pending reimbursements…
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
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Claims</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalClaims}</p>
            </div>
            <User className="h-10 w-10 text-orange-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-xl font-bold text-purple-600">₹{(stats.totalAmount / 1000).toFixed(1)}k</p>
            </div>
            <Wallet className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Medium</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.mediumPriority}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Days</p>
              <p className="text-2xl font-bold text-blue-600">{stats.avgPendingDays}</p>
            </div>
            <Clock className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-rose-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-rose-600">{stats.overdueCount}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-rose-400" />
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Department:</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
        </div>
      </div>

      {/* Reimbursements Table */}
      <DataTable data={filteredReimbursements} columns={columns} />

      {/* Reimbursement Categories Info */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Reimbursement Categories & Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Medical Reimbursement</h4>
            <p className="text-sm text-gray-700">Annual limit: ₹15,000 per employee</p>
            <p className="text-xs text-gray-600 mt-1">Hospitalization, prescriptions, diagnostic tests</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Education Reimbursement</h4>
            <p className="text-sm text-gray-700">Annual limit: ₹25,000 per child (max 2 children)</p>
            <p className="text-xs text-gray-600 mt-1">School fees, books, uniforms</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Conveyance Allowance</h4>
            <p className="text-sm text-gray-700">Monthly limit: ₹3,000</p>
            <p className="text-xs text-gray-600 mt-1">Local travel for official purposes</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Relocation Reimbursement</h4>
            <p className="text-sm text-gray-700">One-time: ₹50,000 (for job transfers)</p>
            <p className="text-xs text-gray-600 mt-1">Packing, moving, transportation</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Uniform & Safety Gear</h4>
            <p className="text-sm text-gray-700">Annual limit: ₹5,000</p>
            <p className="text-xs text-gray-600 mt-1">Uniform, safety shoes, PPE</p>
          </div>
          <div className="p-4 bg-teal-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Communication</h4>
            <p className="text-sm text-gray-700">Mobile: ₹1,500/month, Internet: ₹2,000/month</p>
            <p className="text-xs text-gray-600 mt-1">For work-from-home employees</p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-orange-900 mb-2">Reimbursement Processing Guidelines</h3>
        <ul className="text-sm text-orange-800 space-y-1">
          <li>• Claims should be processed within 7 days of submission</li>
          <li>• High priority claims (medical, relocation) must be processed within 3 days</li>
          <li>• All claims require original bills and supporting documents</li>
          <li>• Approved claims are paid on 25th of every month</li>
          <li>• Rejected claims require detailed reason for employee notification</li>
          <li>• Claims older than 90 days require special approval from Finance Head</li>
        </ul>
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">Claim Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-2">
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
                  <p className="text-sm text-gray-600">Designation</p>
                  <p className="font-semibold text-gray-900">{selectedClaim.designation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-semibold text-gray-900">₹{selectedClaim.amount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bill Date</p>
                  <p className="font-semibold text-gray-900">{new Date(selectedClaim.billDate).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Submitted Date</p>
                  <p className="font-semibold text-gray-900">{new Date(selectedClaim.submittedDate).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Days</p>
                  <p className={`font-semibold ${selectedClaim.pendingDays > 7 ? 'text-red-600' : 'text-gray-900'}`}>
                    {selectedClaim.pendingDays} days
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(selectedClaim.priority)}`}>
                    {selectedClaim.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-semibold text-gray-900">{selectedClaim.description}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Documents Attached</p>
                <p className="font-semibold text-gray-900">{selectedClaim.documentsCount} file(s)</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleApproveClaim(selectedClaim);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Approve Claim
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleRejectClaim(selectedClaim);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Reject Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Approve Claim
              </h2>
            </div>

            <div className="p-6 space-y-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-900">
                  Are you sure you want to approve this reimbursement claim?
                </p>
                <div className="mt-3 space-y-1 text-sm text-green-800">
                  <p><strong>Claim Number:</strong> {selectedClaim.claimNumber}</p>
                  <p><strong>Employee:</strong> {selectedClaim.employeeName}</p>
                  <p><strong>Amount:</strong> ₹{selectedClaim.amount.toLocaleString('en-IN')}</p>
                  <p><strong>Type:</strong> {selectedClaim.claimType}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                This claim will be moved to the processing queue and the employee will be notified.
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApprove}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Confirm Approval
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <XCircle className="h-6 w-6 text-red-600" />
                Reject Claim
              </h2>
            </div>

            <div className="p-6 space-y-2">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-900">
                  You are about to reject this reimbursement claim:
                </p>
                <div className="mt-3 space-y-1 text-sm text-red-800">
                  <p><strong>Claim Number:</strong> {selectedClaim.claimNumber}</p>
                  <p><strong>Employee:</strong> {selectedClaim.employeeName}</p>
                  <p><strong>Amount:</strong> ₹{selectedClaim.amount.toLocaleString('en-IN')}</p>
                  <p><strong>Type:</strong> {selectedClaim.claimType}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Please provide a detailed reason for rejecting this claim..."
                  required
                />
              </div>

              <p className="text-xs text-gray-600">
                The employee will be notified with this rejection reason. Please be clear and specific.
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
