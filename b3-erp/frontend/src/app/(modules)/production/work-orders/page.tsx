'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, Trash2, ClipboardCheck, Factory, AlertCircle, CheckCircle, Clock, TrendingUp, Calendar, ChevronLeft, ChevronRight, Download, Users, Loader2 } from 'lucide-react';
import { ExportWorkOrdersModal } from '@/components/production/WorkOrderModals';
import { exportToCsv } from '@/lib/export';
import { workOrderService, WorkOrder as ServiceWorkOrder } from '@/services/work-order.service';

interface WorkOrder {
  id: string;
  woNumber: string;
  productName: string;
  productCode: string;
  quantity: number;
  unit: string;
  startDate: string;
  dueDate: string;
  completionDate?: string;
  status: 'draft' | 'planned' | 'released' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completionPercentage: number;
  assignedTo: string;
  workCenter: string;
  shiftSchedule: string;
  bomReference: string;
  customer: string;
  salesOrder: string;
  notes: string;
}

// Map service work order to local display format
function mapServiceWorkOrderToLocal(wo: ServiceWorkOrder): WorkOrder {
  const statusMap: Record<string, WorkOrder['status']> = {
    'Draft': 'draft',
    'Planned': 'planned',
    'Released': 'released',
    'In Progress': 'in_progress',
    'On Hold': 'on_hold',
    'Completed': 'completed',
    'Cancelled': 'cancelled',
  };

  const priorityMap: Record<string, WorkOrder['priority']> = {
    'Low': 'low',
    'Medium': 'medium',
    'High': 'high',
    'Critical': 'urgent',
  };

  const completionPercentage = wo.plannedQuantity > 0
    ? Math.round((wo.completedQuantity / wo.plannedQuantity) * 100)
    : 0;

  return {
    id: wo.id,
    woNumber: wo.workOrderNumber,
    productName: wo.productName,
    productCode: wo.productCode,
    quantity: wo.plannedQuantity,
    unit: wo.uom,
    startDate: wo.plannedStartDate,
    dueDate: wo.plannedEndDate,
    completionDate: wo.actualEndDate,
    status: statusMap[wo.status] || 'draft',
    priority: priorityMap[wo.priority] || 'medium',
    completionPercentage,
    assignedTo: 'Production Team',
    workCenter: wo.scheduledWorkCenterName || 'Not Assigned',
    shiftSchedule: 'Day Shift',
    bomReference: wo.bomCode || 'N/A',
    customer: wo.customerName || 'N/A',
    salesOrder: wo.salesOrderNumber || 'N/A',
    notes: wo.notes || '',
  };
}


const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  planned: 'bg-blue-100 text-blue-700',
  released: 'bg-purple-100 text-purple-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  on_hold: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusLabels = {
  draft: 'Draft',
  planned: 'Planned',
  released: 'Released',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
};

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export default function WorkOrdersPage() {
  const router = useRouter();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Fetch work orders from service
  useEffect(() => {
    async function fetchWorkOrders() {
      setLoading(true);
      setError(null);
      try {
        const data = await workOrderService.getAllWorkOrders();
        setWorkOrders(data.map(mapServiceWorkOrderToLocal));
      } catch (err) {
        console.error('Error fetching work orders:', err);
        setError('Failed to load work orders. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchWorkOrders();
  }, []);

  const filteredWOs = workOrders.filter((wo) => {
    const matchesSearch =
      wo.woNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || wo.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalPages = Math.ceil(filteredWOs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWOs = filteredWOs.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    totalOrders: workOrders.length,
    inProgress: workOrders.filter((wo) => wo.status === 'in_progress').length,
    completed: workOrders.filter((wo) => wo.status === 'completed').length,
    delayed: workOrders.filter((wo) => {
      const today = new Date();
      const dueDate = new Date(wo.dueDate);
      return dueDate < today && wo.status !== 'completed';
    }).length,
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this work order?')) {
      setWorkOrders(workOrders.filter((wo) => wo.id !== id));
    }
  };

  const handleExport = (format: string, options: any) => {
    exportToCsv('work-orders', filteredWOs as unknown as Record<string, unknown>[]);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="w-full h-full px-4 py-2 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-2" />
          <p className="text-gray-600">Loading work orders...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full h-full px-4 py-2 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mb-2" />
          <p className="text-gray-900 font-semibold mb-2">Error Loading Work Orders</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Stats */}
      <div className="mb-3 flex items-start gap-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalOrders}</p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.inProgress}</p>
              </div>
              <Factory className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Delayed</p>
                <p className="text-2xl font-bold text-red-900 mt-1">{stats.delayed}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/production/work-orders/add')}
          className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-fit flex-shrink-0"
        >
          <Plus className="h-5 w-5" />
          <span>Create WO</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by WO number, product, customer..."
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
          <option value="planned">Planned</option>
          <option value="released">Released</option>
          <option value="in_progress">In Progress</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">WO Details</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Completion</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedWOs.map((wo) => (
                <tr key={wo.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <ClipboardCheck className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{wo.woNumber}</div>
                        <div className="text-xs text-gray-500">{wo.salesOrder}</div>
                        <div className="text-xs text-blue-600 mt-0.5">{wo.customer}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{wo.productName}</div>
                    <div className="text-sm text-gray-500">{wo.productCode}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{wo.bomReference}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-lg font-bold text-blue-900">
                      {wo.quantity} {wo.unit}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-gray-600">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Start: {wo.startDate}</span>
                      </div>
                      <div className="flex items-center text-xs text-blue-600">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Due: {wo.dueDate}</span>
                      </div>
                      {wo.completionDate && (
                        <div className="flex items-center text-xs text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span>Done: {wo.completionDate}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="w-full">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-700">{wo.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${wo.completionPercentage === 100
                              ? 'bg-green-500'
                              : wo.completionPercentage >= 50
                                ? 'bg-blue-500'
                                : 'bg-yellow-500'
                            }`}
                          style={{ width: `${wo.completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-1 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{wo.assignedTo}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{wo.workCenter}</div>
                    <div className="text-xs text-gray-400">{wo.shiftSchedule}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${priorityColors[wo.priority]}`}>
                      {priorityLabels[wo.priority]}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[wo.status]}`}>
                      {statusLabels[wo.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => router.push(`/production/work-orders/view/${wo.id}`)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"

                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => router.push(`/production/work-orders/edit/${wo.id}`)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"

                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(wo.id)}
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
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredWOs.length)} of{' '}
            {filteredWOs.length} items
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

      {/* Export Modal */}
      <ExportWorkOrdersModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />
    </div>
  );
}
