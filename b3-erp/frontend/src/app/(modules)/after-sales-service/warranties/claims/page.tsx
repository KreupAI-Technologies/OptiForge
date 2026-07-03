'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Download,
  AlertCircle
} from 'lucide-react';
import { WarrantyService, type WarrantyClaimRecord } from '@/services/warranty.service';

interface WarrantyClaim {
  id: string;
  claimNumber: string;
  warrantyNumber: string;
  customerName: string;
  productName: string;
  dateRaised: string;
  issueDescription: string;
  claimAmount: number;
  approvedAmount?: number;
  status: 'Pending Review' | 'Under Investigation' | 'Approved' | 'Rejected' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  assignedTo: string;
}

// Map backend claim status -> the page's display status.
const mapStatus = (status?: string): WarrantyClaim['status'] => {
  switch ((status ?? '').toLowerCase()) {
    case 'submitted':
      return 'Pending Review';
    case 'under_review':
    case 'in_progress':
      return 'Under Investigation';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'completed':
    case 'closed':
      return 'Completed';
    default:
      return 'Pending Review';
  }
};

const transformClaim = (r: WarrantyClaimRecord): WarrantyClaim => {
  const total = Number(r.totalCost ?? 0) ||
    (Number(r.partsCost ?? 0) + Number(r.laborCost ?? 0));
  const isResolved = ['approved', 'completed', 'closed'].includes(
    (r.status ?? '').toLowerCase()
  );
  return {
    id: r.id,
    claimNumber: r.claimNumber ?? r.id,
    warrantyNumber: r.warrantyId ?? '-',
    customerName: r.customerName ?? '-',
    productName: r.equipmentId ?? r.faultCategory ?? '-',
    dateRaised: r.claimDate ? String(r.claimDate).slice(0, 10) : '',
    issueDescription: r.faultDescription ?? r.claimReason ?? '',
    claimAmount: total,
    approvedAmount: isResolved ? total : undefined,
    status: mapStatus(r.status),
    priority: total >= 20000 ? 'High' : total >= 8000 ? 'Medium' : 'Low',
    assignedTo: r.approvedBy ?? 'Unassigned',
  };
};

export default function WarrantyClaimsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [allClaims, setAllClaims] = useState<WarrantyClaim[]>([]);
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
        if (!cancelled) setAllClaims(list.map(transformClaim));
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load warranty claims');
          setAllClaims([]);
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

  // Filter claims
  const filteredClaims = allClaims.filter(claim => {
    const matchesSearch =
      claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.warrantyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.productName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || claim.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || claim.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination
  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClaims = filteredClaims.slice(startIndex, startIndex + itemsPerPage);

  // Statistics
  const stats = {
    total: allClaims.length,
    pending: allClaims.filter(c => c.status === 'Pending Review').length,
    approved: allClaims.filter(c => c.status === 'Approved' || c.status === 'Completed').length,
    rejected: allClaims.filter(c => c.status === 'Rejected').length,
    totalAmount: allClaims.reduce((sum, c) => sum + c.claimAmount, 0),
    approvedAmount: allClaims.reduce((sum, c) => sum + (c.approvedAmount || 0), 0)
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: WarrantyClaim['status']) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Approved': return 'bg-blue-100 text-blue-700';
      case 'Pending Review': return 'bg-yellow-100 text-yellow-700';
      case 'Under Investigation': return 'bg-orange-100 text-orange-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: WarrantyClaim['priority']) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warranty Claims</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track warranty claim requests</p>
        </div>
        <button
          onClick={() => router.push('/after-sales-service/warranties/claims/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          File New Claim
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading warranty claims…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Claims</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">{stats.pending} pending review</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.approved}</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.total ? ((stats.approved / stats.total) * 100).toFixed(0) : 0}% approval rate
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Claim Value</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</div>
          <div className="text-xs text-gray-500 mt-1">
            {formatCurrency(stats.approvedAmount)} approved
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Rejected</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.rejected}</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.total ? ((stats.rejected / stats.total) * 100).toFixed(0) : 0}% rejection rate
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by claim #, warranty #, customer, or product..."
              />
            </div>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Claim #</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Warranty #</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date Raised</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Claim Amount</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                    {claim.claimNumber}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">{claim.warrantyNumber}</td>
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-900">{claim.customerName}</div>
                    <div className="text-xs text-gray-500">Assigned to: {claim.assignedTo}</div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600 max-w-xs truncate">{claim.productName}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{formatDate(claim.dateRaised)}</td>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(claim.claimAmount)}
                    {claim.approvedAmount && claim.approvedAmount !== claim.claimAmount && (
                      <div className="text-xs text-green-600">
                        Approved: {formatCurrency(claim.approvedAmount)}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(claim.priority)}`}>
                      {claim.priority}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => router.push(`/after-sales-service/warranties/claims/${claim.id}`)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                       
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                       
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredClaims.length)} of {filteredClaims.length} claims
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {filteredClaims.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500">No claims found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
