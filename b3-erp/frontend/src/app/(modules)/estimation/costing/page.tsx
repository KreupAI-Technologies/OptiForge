'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, Trash2, FileText, Calendar, DollarSign, User, TrendingUp, Download, Filter, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { costEstimateService } from '@/services/estimation-cost-estimate.service';

interface CostEstimation {
  id: string;
  projectName: string;
  customerName: string;
  boqReference: string;
  estimationDate: string;
  deliveryDate: string;
  totalCost: number;
  margin: number;
  finalPrice: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'expired';
  createdBy: string;
  currency: string;
}

// Default company scope; the backend cost-estimate endpoints are company-scoped.
const COMPANY_ID = 'company-001';

// Map the backend CostEstimateStatus to this page's lowercase status enum.
const STATUS_MAP: Record<string, CostEstimation['status']> = {
  Draft: 'draft',
  'Pending Approval': 'pending_approval',
  Approved: 'approved',
  Rejected: 'rejected',
  'Converted to Order': 'approved',
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  pending_approval: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-orange-100 text-orange-700',
};

const statusLabels = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  expired: 'Expired',
};

export default function CostingPage() {
  const router = useRouter();
  const [estimations, setEstimations] = useState<CostEstimation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns the CostEstimate ORM shape (estimateNumber/title/
        // customerName/totalCost/status PascalCase); map defensively to this
        // page's CostEstimation model.
        const raw = (await costEstimateService.findAll(COMPANY_ID)) as any[];
        const mapped: CostEstimation[] = (raw ?? []).map((e) => {
          const totalCost = Number(e.totalCost ?? e.directCost ?? 0);
          const finalPrice = Number(e.finalPrice ?? e.totalPrice ?? totalCost);
          return {
            id: String(e.id ?? e.estimateNumber ?? ''),
            projectName: e.title ?? e.projectName ?? e.estimateNumber ?? '',
            customerName: e.customerName ?? e.customer_name ?? '',
            boqReference: e.boqId ?? e.boqReference ?? e.boq_id ?? '',
            estimationDate: (e.estimateDate ?? e.createdAt ?? '').toString().split('T')[0] ?? '',
            deliveryDate: (e.validUntil ?? '').toString().split('T')[0] ?? '',
            totalCost,
            margin: Number(e.margin ?? Math.max(finalPrice - totalCost, 0)),
            finalPrice,
            status: STATUS_MAP[e.status] ?? 'draft',
            createdBy: e.submittedBy ?? e.createdBy ?? '',
            currency: e.currency ?? 'USD',
          };
        });
        if (!cancelled) setEstimations(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load cost estimates');
          setEstimations([]);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredEstimations = estimations.filter((est) => {
    const matchesSearch =
      est.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      est.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      est.boqReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      est.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || est.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredEstimations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEstimations = filteredEstimations.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: estimations.length,
    approved: estimations.filter((e) => e.status === 'approved').length,
    pending: estimations.filter((e) => e.status === 'pending_approval').length,
    totalValue: estimations.reduce((sum, e) => sum + e.finalPrice, 0),
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this estimation?')) {
      setEstimations(estimations.filter((e) => e.id !== id));
    }
  };

  return (
    <div className="w-full h-full px-4 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading cost estimates…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && estimations.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No cost estimates found.
        </div>
      )}
      {/* Stats */}
      <div className="mb-3 flex items-start gap-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Estimations</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Approved</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.approved}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Value</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  ${(stats.totalValue / 1000).toFixed(0)}K
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/estimation/costing/add')}
          className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-fit flex-shrink-0"
        >
          <Plus className="h-5 w-5" />
          <span>New Estimation</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search estimations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">BOQ Ref</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Final Price</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedEstimations.map((est) => (
              <tr key={est.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium text-gray-900">{est.id}</td>
                <td className="px-3 py-2">
                  <div className="font-medium text-gray-900">{est.projectName}</div>
                  <div className="text-sm text-gray-500">By {est.createdBy}</div>
                </td>
                <td className="px-3 py-2">{est.customerName}</td>
                <td className="px-3 py-2 text-sm text-gray-600">{est.boqReference}</td>
                <td className="px-3 py-2 text-sm">{est.estimationDate}</td>
                <td className="px-3 py-2">
                  <div className="font-bold text-blue-900">${est.finalPrice.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Margin: ${est.margin.toLocaleString()}</div>
                </td>
                <td className="px-3 py-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[est.status]}`}>
                    {statusLabels[est.status]}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => router.push(`/estimation/costing/view/${est.id}`)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                     
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => router.push(`/estimation/costing/edit/${est.id}`)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"
                     
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(est.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                     
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredEstimations.length)} of{' '}
            {filteredEstimations.length} items
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                })
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && <span className="px-2 text-gray-400">...</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
