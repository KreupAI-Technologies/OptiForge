'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import {
  ArrowLeft,
  Search,
  Clock,
  AlertTriangle,
  Calendar,
  Package,
  User,
  CheckCircle2,
  Play,
  XCircle,
  Eye,
  FileText,
  TrendingUp
} from 'lucide-react';

interface PendingWorkOrder {
  id: string;
  workOrderNumber: string;
  productCode: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  salesOrderNumber: string;
  customerName: string;
  requiredDate: string;
  daysUntilDue: number;
  materialAvailability: number;
  laborAvailable: boolean;
  equipmentReady: boolean;
  estimatedDuration: number;
  estimatedCost: number;
  createdDate: string;
  createdBy: string;
  blockers: string[];
  status: 'awaiting-materials' | 'awaiting-approval' | 'ready-to-start' | 'on-hold';
}

export default function PendingWorkOrdersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [pendingOrders, setPendingOrders] = useState<PendingWorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const raw = (await ProductionOrphanService.getWorkOrders()) as any[];
        const mapped: PendingWorkOrder[] = (raw || []).map((r: any) => ({
          id: String(r.id ?? ''),
          workOrderNumber: r.workOrderNumber ?? '',
          productCode: r.productCode ?? '',
          productName: r.productName ?? '',
          category: r.category ?? '',
          quantity: Number(r.quantity ?? 0),
          unit: r.unit ?? '',
          priority: (r.priority ?? 'medium') as PendingWorkOrder['priority'],
          salesOrderNumber: r.salesOrderNumber ?? '',
          customerName: r.customerName ?? '',
          requiredDate: r.requiredDate ?? '',
          daysUntilDue: Number(r.daysUntilDue ?? 0),
          materialAvailability: Number(r.materialAvailability ?? 0),
          laborAvailable: Boolean(r.laborAvailable ?? false),
          equipmentReady: Boolean(r.equipmentReady ?? false),
          estimatedDuration: Number(r.estimatedDuration ?? 0),
          estimatedCost: Number(r.estimatedCost ?? 0),
          createdDate: r.createdDate ?? '',
          createdBy: r.createdBy ?? '',
          blockers: Array.isArray(r.blockers) ? r.blockers.map((b: any) => String(b)) : [],
          status: (r.status ?? 'awaiting-materials') as PendingWorkOrder['status'],
        }));
        if (!cancelled) setPendingOrders(mapped);
      } catch (err) {
        if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setPendingOrders([]); }
      } finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const priorities = ['all', 'urgent', 'high', 'medium', 'low'];
  const statuses = ['all', 'ready-to-start', 'awaiting-materials', 'awaiting-approval', 'on-hold'];

  const filteredOrders = pendingOrders.filter(order => {
    const matchesSearch =
      order.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.salesOrderNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = filterPriority === 'all' || order.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getPriorityBadge = (priority: string) => {
    const badges = {
      urgent: { color: 'bg-red-100 text-red-800 border-red-300', icon: AlertTriangle },
      high: { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: TrendingUp },
      medium: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Clock },
      low: { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: Clock }
    };
    return badges[priority as keyof typeof badges] || badges.medium;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'ready-to-start': { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Ready to Start' },
      'awaiting-materials': { color: 'bg-yellow-100 text-yellow-800', icon: Package, label: 'Awaiting Materials' },
      'awaiting-approval': { color: 'bg-purple-100 text-purple-800', icon: FileText, label: 'Awaiting Approval' },
      'on-hold': { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'On Hold' }
    };
    return badges[status as keyof typeof badges] || badges['awaiting-materials'];
  };

  // Summary stats
  const totalPending = pendingOrders.length;
  const readyToStart = pendingOrders.filter(o => o.status === 'ready-to-start').length;
  const urgentOrders = pendingOrders.filter(o => o.priority === 'urgent').length;
  const totalValue = pendingOrders.reduce((sum, o) => sum + o.estimatedCost, 0);

  const handleViewDetails = (workOrderId: string) => {
    router.push(`/production/work-orders/view/${workOrderId}`);
  };

  const handleStartProduction = (order: PendingWorkOrder) => {
    if (confirm(`Start production for Work Order ${order.workOrderNumber}?\n\nProduct: ${order.productName}\nQuantity: ${order.quantity} ${order.unit}\nEstimated Duration: ${order.estimatedDuration} days`)) {
      console.log('Starting production for:', order);
      alert(`Production started for ${order.workOrderNumber}!\n\nWork order has been moved to "In Progress" status.\nYou can track progress in the In Progress section.`);
      router.push('/production/work-orders/progress');
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Pending Work Orders</h1>
            <p className="text-sm text-gray-600">Work orders awaiting production start</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Total Pending</span>
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{totalPending}</div>
          <div className="text-xs text-blue-700 mt-1">Work orders</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900">Ready to Start</span>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{readyToStart}</div>
          <div className="text-xs text-green-700 mt-1">Can begin now</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-900">Urgent Orders</span>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-900">{urgentOrders}</div>
          <div className="text-xs text-red-700 mt-1">Need immediate attention</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">Total Value</span>
            <Package className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">₹{(totalValue / 100000).toFixed(1)}L</div>
          <div className="text-xs text-purple-700 mt-1">Pending production</div>
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
          const priorityInfo = getPriorityBadge(order.priority);
          const statusInfo = getStatusBadge(order.status);
          const PriorityIcon = priorityInfo.icon;
          const StatusIcon = statusInfo.icon;
          const isOverdue = order.daysUntilDue < 0;
          const isDueSoon = order.daysUntilDue >= 0 && order.daysUntilDue <= 7;

          return (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{order.workOrderNumber}</h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityInfo.color}`}>
                        <PriorityIcon className="h-3 w-3" />
                        {order.priority.toUpperCase()}
                      </span>
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
                    <div className={`text-sm font-medium ${
                      isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-gray-900'
                    }`}>
                      {isOverdue ? `${Math.abs(order.daysUntilDue)} days overdue` : `${order.daysUntilDue} days until due`}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 justify-end mt-1">
                      <Calendar className="h-3 w-3" />
                      Due: {order.requiredDate}
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
                        <span className="font-medium">Qty: {order.quantity} {order.unit}</span>
                        <span>•</span>
                        <span>{order.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Est. Cost</div>
                      <div className="text-lg font-bold text-blue-900">₹{order.estimatedCost.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Readiness Indicators */}
                <div className="grid grid-cols-4 gap-3 mb-2">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Materials</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${order.materialAvailability === 100 ? 'bg-green-600' : order.materialAvailability >= 75 ? 'bg-blue-600' : 'bg-orange-600'}`}
                          style={{ width: `${order.materialAvailability}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{order.materialAvailability}%</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Labor</div>
                    <div className={`text-sm font-medium ${order.laborAvailable ? 'text-green-900' : 'text-red-900'}`}>
                      {order.laborAvailable ? '✓ Available' : '✗ Not Available'}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Equipment</div>
                    <div className={`text-sm font-medium ${order.equipmentReady ? 'text-green-900' : 'text-red-900'}`}>
                      {order.equipmentReady ? '✓ Ready' : '✗ Not Ready'}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Duration</div>
                    <div className="text-sm font-medium text-gray-900">{order.estimatedDuration} days</div>
                  </div>
                </div>

                {/* Blockers */}
                {order.blockers.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-red-900 mb-1">Blockers ({order.blockers.length})</div>
                        <ul className="space-y-1">
                          {order.blockers.map((blocker, idx) => (
                            <li key={idx} className="text-xs text-red-700">• {blocker}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Created {order.createdDate} by {order.createdBy}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDetails(order.id)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                    {order.status === 'ready-to-start' && (
                      <button
                        onClick={() => handleStartProduction(order)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Start Production
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-sm text-gray-600">
        Showing {filteredOrders.length} of {totalPending} pending work orders
      </div>
    </div>
  );
}
