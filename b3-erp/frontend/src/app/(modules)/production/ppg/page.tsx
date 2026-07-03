'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, Trash2, Factory, Calendar, Package, TrendingUp, Activity, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { PlanModal, ViewPlanModal, ExportModal } from '@/components/production/PPGModals';
import { productionPlanService } from '@/services/production-plan.service';

interface ProductionPlan {
  id: string;
  planNumber: string;
  planName: string;
  productLine: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  totalCapacity: number;
  usedCapacity: number;
  capacityUnit: string;
  materialsReady: number;
  materialsRequired: number;
  workOrdersTotal: number;
  workOrdersCompleted: number;
  onSchedulePercentage: number;
  shiftPlan: string;
  planner: string;
  notes: string;
}

// Maps the backend ProductionPlanStatus (Draft/Submitted/Approved/Released/
// In Progress/Completed/Cancelled) to this page's status vocabulary.
const mapPlanStatus = (raw: string): ProductionPlan['status'] => {
  switch (raw) {
    case 'In Progress':
    case 'Released':
      return 'in_progress';
    case 'Approved':
    case 'Submitted':
      return 'scheduled';
    case 'Completed':
      return 'completed';
    case 'Cancelled':
      return 'cancelled';
    case 'Draft':
    default:
      return 'draft';
  }
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusLabels = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function PPGPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await productionPlanService.getAllPlans()) as any[];
        const mapped: ProductionPlan[] = (raw ?? []).map((p) => {
          const items = Array.isArray(p.items) ? p.items : [];
          const woTotal = items.length;
          const woCompleted = items.filter(
            (i: any) => i?.status === 'Completed',
          ).length;
          const totalCapacity = Number(
            (Array.isArray(p.capacitySummary) ? p.capacitySummary : []).reduce(
              (s: number, c: any) => s + Number(c?.availableCapacity ?? 0),
              0,
            ),
          );
          const usedCapacity = Number(
            (Array.isArray(p.capacitySummary) ? p.capacitySummary : []).reduce(
              (s: number, c: any) => s + Number(c?.plannedCapacity ?? 0),
              0,
            ),
          );
          return {
            id: String(p.id ?? p.planNumber ?? ''),
            planNumber: p.planNumber ?? '',
            planName: p.planName ?? '',
            productLine: p.plantName ?? p.planType ?? '',
            startDate: p.startDate ?? '',
            endDate: p.endDate ?? '',
            status: mapPlanStatus(String(p.status ?? 'Draft')),
            totalCapacity,
            usedCapacity,
            capacityUnit: 'hours',
            materialsReady: Array.isArray(p.materialRequirements)
              ? p.materialRequirements.filter(
                  (m: any) => Number(m?.shortageQuantity ?? 0) <= 0,
                ).length
              : 0,
            materialsRequired: Array.isArray(p.materialRequirements)
              ? p.materialRequirements.length
              : 0,
            workOrdersTotal: woTotal,
            workOrdersCompleted: woCompleted,
            onSchedulePercentage:
              woTotal > 0 ? Math.round((woCompleted / woTotal) * 100) : 0,
            shiftPlan: '',
            planner: p.createdBy ?? '',
            notes: p.notes ?? '',
          };
        });
        if (!cancelled) setPlans(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : 'Failed to load production plans',
          );
          setPlans([]);
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

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ProductionPlan | null>(null);

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.planNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.productLine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPlans = filteredPlans.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    activePlans: plans.filter((p) => p.status === 'scheduled' || p.status === 'in_progress').length,
    avgCapacityUsed: plans.length
      ? Math.round(
          plans.reduce(
            (sum, p) => sum + (p.totalCapacity ? (p.usedCapacity / p.totalCapacity) * 100 : 0),
            0,
          ) / plans.length,
        )
      : 0,
    materialsReady: plans.filter((p) => p.materialsReady === p.materialsRequired).length,
    onSchedule: plans.filter((p) => p.onSchedulePercentage >= 90).length,
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this production plan?')) {
      setPlans(plans.filter((p) => p.id !== id));
    }
  };

  const handleCreatePlan = (planData: Partial<ProductionPlan>) => {
    const newPlan: ProductionPlan = {
      id: `PPG-${String(plans.length + 1).padStart(3, '0')}`,
      planNumber: planData.planNumber || '',
      planName: planData.planName || '',
      productLine: planData.productLine || '',
      startDate: planData.startDate || '',
      endDate: planData.endDate || '',
      status: planData.status as any || 'draft',
      totalCapacity: planData.totalCapacity || 0,
      usedCapacity: planData.usedCapacity || 0,
      capacityUnit: planData.capacityUnit || 'hours',
      materialsReady: 0,
      materialsRequired: 100,
      workOrdersTotal: 0,
      workOrdersCompleted: 0,
      onSchedulePercentage: 100,
      shiftPlan: planData.shiftPlan || '',
      planner: planData.planner || '',
      notes: planData.notes || '',
    };
    setPlans([...plans, newPlan]);
  };

  const handleEditPlan = (planData: Partial<ProductionPlan>) => {
    if (!selectedPlan) return;
    setPlans(
      plans.map((p) =>
        p.id === selectedPlan.id ? { ...p, ...planData } : p
      )
    );
  };

  const handleViewPlan = (plan: ProductionPlan) => {
    setSelectedPlan(plan);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (plan: ProductionPlan) => {
    setSelectedPlan(plan);
    setIsEditModalOpen(true);
  };

  const handleExport = (format: string, filters: any) => {
    console.log('Exporting as:', format, 'with filters:', filters);
    // Implement actual export logic here
    alert(`Exporting production plans as ${format.toUpperCase()}`);
  };

  return (
    <div className="w-full h-full px-4 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading production plans…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && plans.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No production plans found.
        </div>
      )}
      {/* Stats */}
      <div className="mb-3 flex items-start gap-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Plans</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.activePlans}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Capacity Used</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{stats.avgCapacityUsed}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Materials Ready</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.materialsReady}</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">On Schedule</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.onSchedule}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-fit flex-shrink-0"
        >
          <Plus className="h-5 w-5" />
          <span>Create Plan</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search production plans..."
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
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Plan Details</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product Line</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Materials</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Work Orders</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Factory className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{plan.planNumber}</div>
                        <div className="text-sm text-gray-600">{plan.planName}</div>
                        <div className="text-xs text-gray-500 mt-0.5">By {plan.planner}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{plan.productLine}</div>
                    <div className="text-sm text-gray-500">{plan.shiftPlan}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-gray-600">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Start: {plan.startDate}</span>
                      </div>
                      <div className="flex items-center text-xs text-blue-600">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>End: {plan.endDate}</span>
                      </div>
                      <div className="flex items-center text-xs text-green-600">
                        <Activity className="h-3 w-3 mr-1" />
                        <span>On Track: {plan.onSchedulePercentage}%</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="w-full">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-700">
                          {plan.usedCapacity}/{plan.totalCapacity} {plan.capacityUnit}
                        </span>
                        <span className="font-bold text-blue-600">
                          {Math.round((plan.usedCapacity / plan.totalCapacity) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${(plan.usedCapacity / plan.totalCapacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-1">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">
                        {plan.materialsReady}/{plan.materialsRequired}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {Math.round((plan.materialsReady / plan.materialsRequired) * 100)}% Ready
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm font-bold text-blue-900">
                      {plan.workOrdersCompleted}/{plan.workOrdersTotal}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round((plan.workOrdersCompleted / plan.workOrdersTotal) * 100)}% Complete
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[plan.status]}`}>
                      {statusLabels[plan.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPlan(plan);
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(plan);
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(plan.id);
                        }}
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
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPlans.length)} of{' '}
            {filteredPlans.length} items
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

      {/* Modals */}
      <PlanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreatePlan}
      />

      <PlanModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        onSave={handleEditPlan}
      />

      <ViewPlanModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />
    </div>
  );
}
