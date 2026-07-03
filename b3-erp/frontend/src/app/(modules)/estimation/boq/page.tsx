'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, Trash2, ClipboardList, Calendar, User, Package, DollarSign, CheckCircle, Clock, Download, ChevronLeft, ChevronRight, FileText, Hash, AlertCircle } from 'lucide-react';
import { estimationBOQService } from '@/services/estimation-boq.service';

interface BOQ {
  id: string;
  boqNumber: string;
  projectName: string;
  customerName: string;
  customerId: string;
  createdDate: string;
  revisionNumber: number;
  status: 'draft' | 'under_review' | 'approved' | 'rejected' | 'in_costing' | 'completed';
  totalItems: number;
  totalQuantity: number;
  estimatedValue: number;
  assignedTo: string;
  linkedEstimation: string | null;
  description: string;
}

// Map the backend BOQStatus (PascalCase) to this page's lowercase status enum.
const STATUS_MAP: Record<string, BOQ['status']> = {
  Draft: 'draft',
  'Under Review': 'under_review',
  Approved: 'approved',
  Rejected: 'rejected',
  'In Costing': 'in_costing',
  Completed: 'completed',
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  under_review: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  in_costing: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-purple-100 text-purple-700',
};

const statusLabels = {
  draft: 'Draft',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  in_costing: 'In Costing',
  completed: 'Completed',
};

export default function BOQPage() {
  const router = useRouter();
  const [boqs, setBOQs] = useState<BOQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns its own BOQ ORM shape (boqNumber/projectName/
        // clientName/estimatedValue/status PascalCase); map it to this
        // page's BOQ model defensively.
        const raw = (await estimationBOQService.findAll()) as any[];
        const mapped: BOQ[] = (raw ?? []).map((b) => ({
          id: String(b.id ?? b.boqNumber ?? ''),
          boqNumber: b.boqNumber ?? b.boq_number ?? '',
          projectName: b.projectName ?? b.project_name ?? '',
          customerName: b.clientName ?? b.customerName ?? b.client_name ?? '',
          customerId: String(b.customerId ?? b.clientId ?? b.customer_id ?? ''),
          createdDate: (b.createdAt ?? b.created_at ?? '').toString().split('T')[0] ?? '',
          revisionNumber: Number(b.revisionNumber ?? b.revision ?? 1),
          status: STATUS_MAP[b.status] ?? 'draft',
          totalItems: Number(b.totalItems ?? b.itemCount ?? 0),
          totalQuantity: Number(b.totalQuantity ?? 0),
          estimatedValue: Number(b.estimatedValue ?? 0),
          assignedTo: b.assignedTo ?? b.assigned_to ?? '',
          linkedEstimation: b.linkedEstimation ?? b.costEstimateId ?? null,
          description: b.description ?? b.notes ?? '',
        }));
        if (!cancelled) setBOQs(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load BOQs');
          setBOQs([]);
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

  const filteredBOQs = boqs.filter((boq) => {
    const matchesSearch =
      boq.boqNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      boq.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      boq.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || boq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBOQs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBOQs = filteredBOQs.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    totalBOQs: boqs.length,
    approved: boqs.filter((b) => b.status === 'approved').length,
    underReview: boqs.filter((b) => b.status === 'under_review').length,
    totalValue: boqs.reduce((sum, b) => sum + b.estimatedValue, 0),
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this BOQ?')) {
      setBOQs(boqs.filter((b) => b.id !== id));
    }
  };

  return (
    <div className="w-full h-full px-4 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading BOQs…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && boqs.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No BOQs found.
        </div>
      )}
      {/* Stats */}
      <div className="mb-3 flex items-start gap-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total BOQs</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalBOQs}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Approved</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Under Review</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.underReview}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
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
          onClick={() => router.push('/estimation/boq/add')}
          className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-fit flex-shrink-0"
        >
          <Plus className="h-5 w-5" />
          <span>Create BOQ</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by BOQ number, project, or customer..."
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
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="in_costing">In Costing</option>
          <option value="completed">Completed</option>
        </select>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">BOQ Details</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Items/Qty</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Est. Value</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estimation</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedBOQs.map((boq) => (
                <tr key={boq.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{boq.boqNumber}</div>
                        <div className="text-xs text-gray-500 flex items-center space-x-2">
                          <span>Rev. {boq.revisionNumber}</span>
                          <span>•</span>
                          <span>{boq.createdDate}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900 max-w-xs">{boq.projectName}</div>
                    <div className="text-xs text-gray-500 mt-1">{boq.description}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{boq.customerName}</div>
                    <div className="text-sm text-gray-500">{boq.customerId}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-1 mb-1">
                      <Hash className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold text-gray-900">{boq.totalItems} items</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{boq.totalQuantity} units</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-bold text-blue-900">${boq.estimatedValue.toLocaleString()}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{boq.assignedTo}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[boq.status]}`}>
                      {statusLabels[boq.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {boq.linkedEstimation ? (
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">{boq.linkedEstimation}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Not linked</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => router.push(`/estimation/boq/view/${boq.id}`)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"

                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => router.push(`/estimation/boq/edit/${boq.id}`)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"

                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(boq.id)}
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
        </div>

        {/* Pagination */}
        <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredBOQs.length)} of{' '}
            {filteredBOQs.length} items
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
                      className={`px-3 py-1 rounded-lg ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'
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
