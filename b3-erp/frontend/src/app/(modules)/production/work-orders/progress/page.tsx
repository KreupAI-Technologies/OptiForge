'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import {
  ArrowLeft,
  Search,
  Activity,
  AlertCircle,
  Calendar,
  Package,
  User,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  Pause,
  CheckCircle2,
  Users,
  Settings
} from 'lucide-react';
import { UpdateProgressModal } from '@/components/production/UpdateProgressModal';

interface InProgressWorkOrder {
  id: string;
  workOrderNumber: string;
  productCode: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  produced: number;
  rejected: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  salesOrderNumber: string;
  customerName: string;
  startDate: string;
  dueDate: string;
  daysRemaining: number;
  currentStation: string;
  completionPercentage: number;
  plannedDuration: number;
  actualDaysElapsed: number;
  assignedTeam: string;
  shift: string;
  status: 'on-track' | 'at-risk' | 'delayed';
  issues: string[];
  nextMilestone: string;
}

export default function InProgressWorkOrdersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<InProgressWorkOrder | null>(null);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  const [inProgressOrders, setInProgressOrders] = useState<InProgressWorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const raw = (await ProductionOrphanService.getWorkOrders()) as any[];
        const mapped: InProgressWorkOrder[] = (raw || []).map((r: any) => ({
          id: String(r.id ?? ''),
          workOrderNumber: r.workOrderNumber ?? '',
          productCode: r.productCode ?? '',
          productName: r.productName ?? '',
          category: r.category ?? '',
          quantity: Number(r.quantity ?? 0),
          unit: r.unit ?? '',
          produced: Number(r.produced ?? 0),
          rejected: Number(r.rejected ?? 0),
          priority: (r.priority ?? 'medium') as InProgressWorkOrder['priority'],
          salesOrderNumber: r.salesOrderNumber ?? '',
          customerName: r.customerName ?? '',
          startDate: r.startDate ?? '',
          dueDate: r.dueDate ?? '',
          daysRemaining: Number(r.daysRemaining ?? 0),
          currentStation: r.currentStation ?? '',
          completionPercentage: Number(r.completionPercentage ?? 0),
          plannedDuration: Number(r.plannedDuration ?? 0),
          actualDaysElapsed: Number(r.actualDaysElapsed ?? 0),
          assignedTeam: r.assignedTeam ?? '',
          shift: r.shift ?? '',
          status: (r.status ?? 'on-track') as InProgressWorkOrder['status'],
          issues: Array.isArray(r.issues) ? r.issues.map((i: any) => String(i)) : [],
          nextMilestone: r.nextMilestone ?? '',
        }));
        if (!cancelled) setInProgressOrders(mapped);
      } catch (err) {
        if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setInProgressOrders([]); }
      } finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const priorities = ['all', 'urgent', 'high', 'medium', 'low'];
  const statuses = ['all', 'on-track', 'at-risk', 'delayed'];

  const filteredOrders = inProgressOrders.filter(order => {
    const matchesSearch =
      order.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.currentStation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = filterPriority === 'all' || order.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      'on-track': { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'On Track' },
      'at-risk': { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'At Risk' },
      'delayed': { color: 'bg-red-100 text-red-800', icon: TrendingDown, label: 'Delayed' }
    };
    return badges[status as keyof typeof badges] || badges['on-track'];
  };

  // Summary stats
  const totalInProgress = inProgressOrders.length;
  const onTrack = inProgressOrders.filter(o => o.status === 'on-track').length;
  const atRisk = inProgressOrders.filter(o => o.status === 'at-risk').length;
  const delayed = inProgressOrders.filter(o => o.status === 'delayed').length;

  const handleViewDetails = (workOrderId: string) => {
    router.push(`/production/work-orders/view/${workOrderId}`);
  };

  const handlePause = (order: InProgressWorkOrder) => {
    if (confirm(`Pause production for Work Order ${order.workOrderNumber}?\n\nProduct: ${order.productName}\nCurrent Progress: ${order.completionPercentage}%`)) {
      console.log('Pausing work order:', order);
      alert(`Work Order ${order.workOrderNumber} has been paused.\n\nStatus: On Hold\nCurrent Progress: ${order.completionPercentage}%\nProduced: ${order.produced} ${order.unit}`);
    }
  };

  const handleUpdateProgress = (order: InProgressWorkOrder) => {
    setSelectedWorkOrder(order);
    setIsProgressModalOpen(true);
  };

  const handleProgressUpdate = (updateData: any) => {
    console.log('Progress updated:', updateData);
    alert(`Progress updated successfully for ${selectedWorkOrder?.workOrderNumber}!\n\nProduced: ${updateData.produced} ${selectedWorkOrder?.unit}\nRejected: ${updateData.rejected}\nCompletion: ${updateData.completionPercentage}%\nCurrent Station: ${updateData.currentStation}`);
  };

  return (
    <div className="w-full px-3 py-2">
      {isLoading && (<div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700"><div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />Loading…</div>)}
      {loadError && !isLoading && (<div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>)}
      {/* Inline Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Work Orders In Progress</h1>
            <p className="text-sm text-gray-600">Currently active production work orders</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">In Progress</span>
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{totalInProgress}</div>
          <div className="text-xs text-blue-700 mt-1">Active work orders</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900">On Track</span>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{onTrack}</div>
          <div className="text-xs text-green-700 mt-1">Meeting schedule</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-yellow-900">At Risk</span>
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-900">{atRisk}</div>
          <div className="text-xs text-yellow-700 mt-1">Need attention</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-900">Delayed</span>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-900">{delayed}</div>
          <div className="text-xs text-red-700 mt-1">Behind schedule</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search work orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {priorities.map(pri => (
              <option key={pri} value={pri}>
                {pri === 'all' ? 'All Priorities' : pri.charAt(0).toUpperCase() + pri.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="space-y-2">
        {filteredOrders.map((order) => {
          const statusInfo = getStatusBadge(order.status);
          const StatusIcon = statusInfo.icon;
          const completedQty = order.produced + order.rejected;
          const successRate = order.produced > 0 ? ((order.produced / completedQty) * 100).toFixed(1) : '0.0';

          return (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{order.workOrderNumber}</h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {order.customerName}
                      </span>
                      <span>SO: {order.salesOrderNumber}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{order.daysRemaining} days remaining</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 justify-end mt-1">
                      <Calendar className="h-3 w-3" />
                      Due: {order.dueDate}
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="bg-blue-50 rounded-lg p-3 mb-2">
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{order.productName}</h4>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <span>{order.productCode}</span>
                        <span>•</span>
                        <span className="font-medium">Target: {order.quantity} {order.unit}</span>
                        <span>•</span>
                        <span>{order.category}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  {/* Completion Progress */}
                  <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                      <span className="text-2xl font-bold text-blue-900">{order.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div
                        className={`h-3 rounded-full ${
                          order.status === 'on-track' ? 'bg-green-600' :
                          order.status === 'at-risk' ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${order.completionPercentage}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <div className="text-gray-600">Produced</div>
                        <div className="font-semibold text-green-900">{order.produced} {order.unit}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Rejected</div>
                        <div className="font-semibold text-red-900">{order.rejected} {order.unit}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Success Rate</div>
                        <div className="font-semibold text-blue-900">{successRate}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Current Status */}
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Settings className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Current Station</span>
                    </div>
                    <div className="font-semibold text-gray-900 mb-3">{order.currentStation}</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-3 w-3" />
                        {order.assignedTeam}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-3 w-3" />
                        {order.shift}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-gray-50 rounded-lg p-3 mb-2">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-gray-600">Started</div>
                      <div className="font-medium text-gray-900">{order.startDate}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Duration</div>
                      <div className="font-medium text-gray-900">{order.actualDaysElapsed} of {order.plannedDuration} days</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Next Milestone</div>
                      <div className="font-medium text-gray-900">{order.nextMilestone}</div>
                    </div>
                  </div>
                </div>

                {/* Issues */}
                {order.issues.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-red-900 mb-1">Issues ({order.issues.length})</div>
                        <ul className="space-y-1">
                          {order.issues.map((issue, idx) => (
                            <li key={idx} className="text-xs text-red-700">• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleViewDetails(order.id)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => handlePause(order)}
                    className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm flex items-center gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    Pause
                  </button>
                  <button
                    onClick={() => handleUpdateProgress(order)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Update Progress
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-sm text-gray-600">
        Showing {filteredOrders.length} of {totalInProgress} work orders in progress
      </div>

      {/* Update Progress Modal */}
      <UpdateProgressModal
        isOpen={isProgressModalOpen}
        onClose={() => {
          setIsProgressModalOpen(false);
          setSelectedWorkOrder(null);
        }}
        workOrder={selectedWorkOrder}
        onUpdate={handleProgressUpdate}
      />
    </div>
  );
}
