'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  FileText,
  AlertTriangle,
  DollarSign,
  Calendar,
  User,
  Package,
  Phone,
  Mail,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Download,
  Upload,
  Camera,
  Wrench,
  Shield,
  ChevronRight,
  Edit,
  AlertCircle
} from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { WarrantyService, type WarrantyClaimRecord } from '@/services/warranty.service';

interface ClaimApproval {
  id: string;
  claimNumber: string;
  warrantyNumber: string;
  warrantyType: 'Standard' | 'Extended' | 'Manufacturer' | 'Dealer';
  status: 'Pending Review' | 'Under Investigation' | 'Requires Documentation' | 'Ready for Approval' | 'Approved' | 'Rejected';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  customer: {
    name: string;
    phone: string;
    email: string;
    customerId: string;
  };
  equipment: {
    model: string;
    serialNumber: string;
    category: string;
    installationDate: string;
  };
  claimDetails: {
    issueDescription: string;
    faultCategory: string;
    reportedDate: string;
    submittedDate: string;
    claimedAmount: number;
    estimatedAmount?: number;
    partsCost?: number;
    laborCost?: number;
  };
  technician: {
    name: string;
    id: string;
    assessment: string;
    visitDate: string;
    recommendation: 'Approve' | 'Reject' | 'Investigate' | 'Request More Info';
  };
  documentation: {
    photos: number;
    videos: number;
    reports: number;
    invoices: number;
    isComplete: boolean;
    missingDocs?: string[];
  };
  approval: {
    assignedTo?: string;
    reviewStarted?: string;
    lastUpdated: string;
    notes?: string;
    escalated: boolean;
    escalationReason?: string;
  };
  warranty: {
    startDate: string;
    endDate: string;
    coverage: string;
    remainingValue: number;
    previousClaims: number;
  };
  riskFactors: string[];
  urgencyScore: number; // 1-10
}

// Map backend claim status -> approval-page display status.
const mapApprovalStatus = (status?: string): ClaimApproval['status'] => {
  switch ((status ?? '').toLowerCase()) {
    case 'submitted':
      return 'Pending Review';
    case 'under_review':
      return 'Under Investigation';
    case 'in_progress':
      return 'Ready for Approval';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Pending Review';
  }
};

const transformApproval = (r: WarrantyClaimRecord): ClaimApproval => {
  const parts = Number(r.partsCost ?? 0);
  const labor = Number(r.laborCost ?? 0);
  const total = Number(r.totalCost ?? 0) || parts + labor;
  const priority: ClaimApproval['priority'] =
    (r.faultCategory ?? '').toLowerCase().includes('safety')
      ? 'Critical'
      : total >= 20000
        ? 'High'
        : total >= 8000
          ? 'Medium'
          : 'Low';
  const urgencyScore = Math.min(
    10,
    Math.max(1, Math.round((priority === 'Critical' ? 8 : 3) + total / 5000)),
  );
  return {
    id: r.id,
    claimNumber: r.claimNumber ?? r.id,
    warrantyNumber: r.warrantyId ?? '-',
    warrantyType: 'Standard',
    status: mapApprovalStatus(r.status),
    priority,
    customer: {
      name: r.customerName ?? '-',
      phone: r.contactPhone ?? '-',
      email: '-',
      customerId: r.customerId ?? '-',
    },
    equipment: {
      model: r.equipmentId ?? '-',
      serialNumber: r.equipmentId ?? '-',
      category: r.faultCategory ?? '-',
      installationDate: '-',
    },
    claimDetails: {
      issueDescription: r.faultDescription ?? r.claimReason ?? '',
      faultCategory: r.faultCategory ?? '-',
      reportedDate: r.faultDate ? String(r.faultDate).slice(0, 10) : '',
      submittedDate: r.claimDate ? String(r.claimDate).slice(0, 10) : '',
      claimedAmount: total,
      estimatedAmount: total,
      partsCost: parts,
      laborCost: labor,
    },
    technician: {
      name: r.approvedBy ?? 'Unassigned',
      id: '-',
      assessment: r.claimReason ?? '',
      visitDate: '-',
      recommendation:
        (r.status ?? '').toLowerCase() === 'approved'
          ? 'Approve'
          : (r.status ?? '').toLowerCase() === 'rejected'
            ? 'Reject'
            : 'Investigate',
    },
    documentation: {
      photos: 0,
      videos: 0,
      reports: 0,
      invoices: 0,
      isComplete: Boolean(r.eligibilityStatus === 'eligible'),
    },
    approval: {
      assignedTo: r.approvedBy ?? undefined,
      lastUpdated: r.updatedAt ? String(r.updatedAt).slice(0, 10) : '',
      escalated: priority === 'Critical',
      escalationReason:
        priority === 'Critical' ? 'Safety-critical issue requiring senior approval' : undefined,
    },
    warranty: {
      startDate: '-',
      endDate: '-',
      coverage: '-',
      remainingValue: 0,
      previousClaims: 0,
    },
    riskFactors:
      priority === 'Critical' ? ['Safety Critical'] : [],
    urgencyScore,
  };
};

const ClaimsApprovalsPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterAmount, setFilterAmount] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ClaimApproval | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  const [claimApprovals, setClaimApprovals] = useState<ClaimApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await WarrantyService.getAllClaims();
        const list = Array.isArray(raw) ? raw : [];
        if (!cancelled) setClaimApprovals(list.map(transformApproval));
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load claims for approval');
          setClaimApprovals([]);
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


  const filteredClaims = claimApprovals.filter(claim => {
    const matchesSearch = claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.equipment.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || claim.status === filterStatus;
    const matchesPriority = !filterPriority || claim.priority === filterPriority;
    const matchesAssignee = !filterAssignee || claim.approval.assignedTo === filterAssignee;
    
    let matchesAmount = true;
    if (filterAmount) {
      const amount = claim.claimDetails.claimedAmount;
      switch (filterAmount) {
        case 'low':
          matchesAmount = amount <= 10000;
          break;
        case 'medium':
          matchesAmount = amount > 10000 && amount <= 25000;
          break;
        case 'high':
          matchesAmount = amount > 25000;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesAmount;
  });

  const stats = {
    totalPending: claimApprovals.filter(c => ['Pending Review', 'Under Investigation', 'Requires Documentation', 'Ready for Approval'].includes(c.status)).length,
    criticalPending: claimApprovals.filter(c => c.priority === 'Critical' && ['Pending Review', 'Under Investigation', 'Ready for Approval'].includes(c.status)).length,
    totalValue: claimApprovals.reduce((sum, c) => sum + c.claimDetails.claimedAmount, 0),
    avgProcessingTime: 2.3, // days
    approvalRate: claimApprovals.length ? Math.round((claimApprovals.filter(c => c.status === 'Approved').length / claimApprovals.length) * 100) : 0
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Review': return 'bg-gray-100 text-gray-700';
      case 'Under Investigation': return 'bg-yellow-100 text-yellow-700';
      case 'Requires Documentation': return 'bg-orange-100 text-orange-700';
      case 'Ready for Approval': return 'bg-blue-100 text-blue-700';
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getUrgencyColor = (score: number) => {
    if (score >= 8) return 'text-red-600';
    if (score >= 6) return 'text-orange-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleApprovalAction = (action: 'approve' | 'reject') => {
    setApprovalAction(action);
    // In real app, this would call API to approve/reject claim
    console.log(`${action} claim with notes:`, approvalNotes);
    setSelectedClaim(null);
    setApprovalAction(null);
    setApprovalNotes('');
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-7 w-7 text-blue-600" />
            Claims Approvals
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve warranty claim requests</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/after-sales-service/warranties/claims')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FileText className="h-4 w-4" />
            All Claims
          </button>
          <button
            onClick={() => exportToCsv('warranty-claim-approvals', filteredClaims as unknown as Record<string, unknown>[])}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading claims for approval…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && claimApprovals.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No claims pending approval.
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalPending}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600">{stats.criticalPending}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div className="text-xs text-gray-500 mt-1">High priority</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-purple-600">₹{(stats.totalValue / 1000).toFixed(0)}K</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
          <div className="text-xs text-gray-500 mt-1">Claims value</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Processing</p>
              <p className="text-2xl font-bold text-blue-600">{stats.avgProcessingTime}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-xs text-gray-500 mt-1">Days to resolve</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approval Rate</p>
              <p className="text-2xl font-bold text-green-600">{stats.approvalRate}%</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div className="text-xs text-gray-500 mt-1">Success rate</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by claim number, customer, or equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 pt-4 border-t border-gray-200">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Requires Documentation">Requires Documentation</option>
              <option value="Ready for Approval">Ready for Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priority</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Assignees</option>
              <option value="Priya Sharma">Priya Sharma</option>
              <option value="Vikram Singh">Vikram Singh</option>
              <option value="Anita Desai">Anita Desai</option>
              <option value="Rohit Sharma">Rohit Sharma</option>
              <option value="Sunita Verma">Sunita Verma</option>
            </select>

            <select
              value={filterAmount}
              onChange={(e) => setFilterAmount(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Amounts</option>
              <option value="low">Low (≤₹10K)</option>
              <option value="medium">Medium (₹10K-25K)</option>
              <option value="high">High ({'>'}₹25K)</option>
            </select>
          </div>
        )}
      </div>

      {/* Claims List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-3 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Claims for Approval ({filteredClaims.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredClaims.map((claim) => (
            <div key={claim.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{claim.claimNumber}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(claim.status)}`}>
                      {claim.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(claim.priority)}`}>
                      {claim.priority}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className={`h-4 w-4 ${getUrgencyColor(claim.urgencyScore)}`} />
                      <span className={`text-sm font-medium ${getUrgencyColor(claim.urgencyScore)}`}>
                        {claim.urgencyScore}/10
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Customer</h4>
                      <p className="text-sm text-gray-600">{claim.customer.name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Phone className="h-3 w-3" />
                        {claim.customer.phone}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Equipment</h4>
                      <p className="text-sm text-gray-600">{claim.equipment.model}</p>
                      <p className="text-xs text-gray-500">{claim.equipment.category}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Claim Amount</h4>
                      <p className="text-sm font-semibold text-gray-900">₹{claim.claimDetails.claimedAmount.toLocaleString()}</p>
                      {claim.claimDetails.estimatedAmount && (
                        <p className="text-xs text-green-600">Est: ₹{claim.claimDetails.estimatedAmount.toLocaleString()}</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Technician</h4>
                      <p className="text-sm text-gray-600">{claim.technician.name}</p>
                      <p className="text-xs text-gray-500">{claim.technician.recommendation}</p>
                    </div>
                  </div>

                  <div className="mb-2">
                    <h4 className="font-medium text-gray-800 mb-2">Issue Description</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {claim.claimDetails.issueDescription}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Reported: {claim.claimDetails.reportedDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>Warranty: {claim.warrantyNumber}</span>
                    </div>
                    {claim.approval.assignedTo && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>Assigned: {claim.approval.assignedTo}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Camera className="h-4 w-4" />
                      <span>{claim.documentation.photos} photos</span>
                    </div>
                  </div>

                  {claim.riskFactors.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Risk Factors:</span>
                        <div className="flex flex-wrap gap-1">
                          {claim.riskFactors.map((risk, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                              {risk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setSelectedClaim(claim)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                   
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {['Ready for Approval', 'Under Investigation'].includes(claim.status) && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedClaim(claim);
                          setApprovalAction('approve');
                        }}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md"
                       
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedClaim(claim);
                          setApprovalAction('reject');
                        }}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                       
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button
                    className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-md"
                   
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Claim Details Modal */}
      {selectedClaim && !approvalAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Claim Details - {selectedClaim.claimNumber}</h2>
              <button
                onClick={() => setSelectedClaim(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Status & Priority */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-2 text-sm font-medium rounded-full ${getStatusColor(selectedClaim.status)}`}>
                  {selectedClaim.status}
                </span>
                <span className={`px-3 py-2 text-sm font-medium rounded-full border ${getPriorityColor(selectedClaim.priority)}`}>
                  {selectedClaim.priority} Priority
                </span>
                <div className="flex items-center gap-1">
                  <Star className={`h-5 w-5 ${getUrgencyColor(selectedClaim.urgencyScore)}`} />
                  <span className={`text-sm font-medium ${getUrgencyColor(selectedClaim.urgencyScore)}`}>
                    Urgency: {selectedClaim.urgencyScore}/10
                  </span>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedClaim.customer.name}</div>
                    <div><strong>Phone:</strong> {selectedClaim.customer.phone}</div>
                    <div><strong>Email:</strong> {selectedClaim.customer.email}</div>
                    <div><strong>Customer ID:</strong> {selectedClaim.customer.customerId}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Equipment Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Model:</strong> {selectedClaim.equipment.model}</div>
                    <div><strong>Serial Number:</strong> {selectedClaim.equipment.serialNumber}</div>
                    <div><strong>Category:</strong> {selectedClaim.equipment.category}</div>
                    <div><strong>Installation:</strong> {selectedClaim.equipment.installationDate}</div>
                  </div>
                </div>
              </div>

              {/* Issue Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Issue Details</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <div><strong>Fault Category:</strong> {selectedClaim.claimDetails.faultCategory}</div>
                    <div><strong>Reported Date:</strong> {selectedClaim.claimDetails.reportedDate}</div>
                  </div>
                  <p className="text-gray-700">{selectedClaim.claimDetails.issueDescription}</p>
                </div>
              </div>

              {/* Financial Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Financial Breakdown</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">₹{selectedClaim.claimDetails.claimedAmount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Claimed Amount</div>
                    </div>
                    {selectedClaim.claimDetails.estimatedAmount && (
                      <div>
                        <div className="text-2xl font-bold text-blue-600">₹{selectedClaim.claimDetails.estimatedAmount.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Estimated Amount</div>
                      </div>
                    )}
                    {selectedClaim.claimDetails.partsCost && (
                      <div>
                        <div className="text-2xl font-bold text-green-600">₹{selectedClaim.claimDetails.partsCost.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Parts Cost</div>
                      </div>
                    )}
                    {selectedClaim.claimDetails.laborCost && (
                      <div>
                        <div className="text-2xl font-bold text-orange-600">₹{selectedClaim.claimDetails.laborCost.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Labor Cost</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Technician Assessment */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Technician Assessment</h3>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <strong>{selectedClaim.technician.name}</strong> ({selectedClaim.technician.id})
                    </div>
                    <div className="text-sm text-gray-600">Visit Date: {selectedClaim.technician.visitDate}</div>
                  </div>
                  <p className="text-gray-700 mb-2">{selectedClaim.technician.assessment}</p>
                  <div className="flex items-center gap-2">
                    <strong>Recommendation:</strong>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedClaim.technician.recommendation === 'Approve' ? 'bg-green-100 text-green-700' :
                      selectedClaim.technician.recommendation === 'Reject' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedClaim.technician.recommendation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documentation Status */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Documentation</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedClaim.documentation.photos}</div>
                    <div className="text-sm text-gray-500">Photos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedClaim.documentation.videos}</div>
                    <div className="text-sm text-gray-500">Videos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedClaim.documentation.reports}</div>
                    <div className="text-sm text-gray-500">Reports</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{selectedClaim.documentation.invoices}</div>
                    <div className="text-sm text-gray-500">Invoices</div>
                  </div>
                </div>
                {!selectedClaim.documentation.isComplete && selectedClaim.documentation.missingDocs && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Missing Documentation:</h4>
                    <ul className="list-disc list-inside text-sm text-yellow-700">
                      {selectedClaim.documentation.missingDocs.map((doc, index) => (
                        <li key={index}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Warranty Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Warranty Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <div><strong>Warranty Number:</strong> {selectedClaim.warrantyNumber}</div>
                    <div><strong>Type:</strong> {selectedClaim.warrantyType}</div>
                    <div><strong>Coverage:</strong> {selectedClaim.warranty.coverage}</div>
                  </div>
                  <div>
                    <div><strong>Start Date:</strong> {selectedClaim.warranty.startDate}</div>
                    <div><strong>End Date:</strong> {selectedClaim.warranty.endDate}</div>
                    <div><strong>Previous Claims:</strong> {selectedClaim.warranty.previousClaims}</div>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              {selectedClaim.riskFactors.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Risk Factors</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedClaim.riskFactors.map((risk, index) => (
                      <span key={index} className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-full">
                        {risk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                {['Ready for Approval', 'Under Investigation'].includes(selectedClaim.status) && (
                  <>
                    <button
                      onClick={() => setApprovalAction('approve')}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Approve Claim
                    </button>
                    <button
                      onClick={() => setApprovalAction('reject')}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Reject Claim
                    </button>
                  </>
                )}
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Action Modal */}
      {selectedClaim && approvalAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-3 py-2 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {approvalAction === 'approve' ? 'Approve Claim' : 'Reject Claim'}
              </h2>
            </div>

            <div className="p-6 space-y-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm"><strong>Claim:</strong> {selectedClaim.claimNumber}</div>
                <div className="text-sm"><strong>Customer:</strong> {selectedClaim.customer.name}</div>
                <div className="text-sm"><strong>Amount:</strong> ₹{selectedClaim.claimDetails.claimedAmount.toLocaleString()}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {approvalAction === 'approve' ? 'Approval Notes' : 'Rejection Reason'}
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder={approvalAction === 'approve' ? 'Add approval notes...' : 'Specify reason for rejection...'}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleApprovalAction(approvalAction)}
                  className={`flex-1 px-4 py-2 rounded-md text-white ${
                    approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirm {approvalAction === 'approve' ? 'Approval' : 'Rejection'}
                </button>
                <button
                  onClick={() => setApprovalAction(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimsApprovalsPage;