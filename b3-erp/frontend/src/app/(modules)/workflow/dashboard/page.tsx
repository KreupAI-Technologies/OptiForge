'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Factory,
  ClipboardCheck,
  DollarSign,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  Eye,
  Bell,
} from 'lucide-react';
import { WorkflowService } from '@/services/workflow.service';

// Order status types matching backend
type OrderTrackingStatus =
  | 'order_placed'
  | 'order_confirmed'
  | 'production_planning'
  | 'material_procurement'
  | 'in_production'
  | 'quality_check'
  | 'ready_for_dispatch'
  | 'dispatched'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'on_hold';

interface OrderTracking {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  status: OrderTrackingStatus;
  totalAmount: number;
  itemCount: number;
  expectedDeliveryDate: string;
  progress: number;
  events: Array<{
    status: string;
    timestamp: string;
    description: string;
  }>;
  workOrders: Array<{
    workOrderNumber: string;
    itemName: string;
    quantity: number;
    status: string;
  }>;
}

interface WorkflowMetrics {
  totalOrders: number;
  inProduction: number;
  pendingQC: number;
  readyToShip: number;
  overdue: number;
  completedToday: number;
}

// Status configuration
const statusConfig: Record<OrderTrackingStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  order_placed: { label: 'Order Placed', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Clock },
  order_confirmed: { label: 'Confirmed', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: CheckCircle },
  production_planning: { label: 'Planning', color: 'text-indigo-600', bgColor: 'bg-indigo-100', icon: ClipboardCheck },
  material_procurement: { label: 'Procurement', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Package },
  in_production: { label: 'In Production', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Factory },
  quality_check: { label: 'Quality Check', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: ClipboardCheck },
  ready_for_dispatch: { label: 'Ready to Ship', color: 'text-teal-600', bgColor: 'bg-teal-100', icon: Package },
  dispatched: { label: 'Dispatched', color: 'text-cyan-600', bgColor: 'bg-cyan-100', icon: Truck },
  in_transit: { label: 'In Transit', color: 'text-sky-600', bgColor: 'bg-sky-100', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
  completed: { label: 'Completed', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertTriangle },
  on_hold: { label: 'On Hold', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: Clock },
};

export default function WorkflowDashboardPage() {
  const router = useRouter();
  const emptyMetrics: WorkflowMetrics = {
    totalOrders: 0,
    inProduction: 0,
    pendingQC: 0,
    readyToShip: 0,
    overdue: 0,
    completedToday: 0,
  };
  const [orders, setOrders] = useState<OrderTracking[]>([]);
  const [metrics, setMetrics] = useState<WorkflowMetrics>(emptyMetrics);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      // Backend returns raw order_tracking rows; map defensively to the
      // page's OrderTracking model.
      const raw = (await WorkflowService.getOrderTracking()) as any[];
      const mapped: OrderTracking[] = (raw ?? []).map((o) => {
        const events = Array.isArray(o.events) ? o.events : [];
        const workOrders = Array.isArray(o.workOrders) ? o.workOrders : [];
        return {
          id: String(o.id ?? o.orderId ?? ''),
          orderId: o.orderId ?? o.id ?? '',
          orderNumber: o.orderNumber ?? '',
          customerName: o.customerName ?? '',
          status: (o.status ?? 'order_placed') as OrderTrackingStatus,
          totalAmount: Number(o.totalAmount ?? 0),
          itemCount: Number(o.itemCount ?? 0),
          expectedDeliveryDate: o.expectedDeliveryDate ?? '',
          progress: Number(o.progress ?? 0),
          events: events.map((e: any) => ({
            status: e.status ?? '',
            timestamp: e.timestamp ?? '',
            description: e.description ?? '',
          })),
          workOrders: workOrders.map((w: any) => ({
            workOrderNumber: w.workOrderNumber ?? '',
            itemName: w.itemName ?? '',
            quantity: Number(w.quantity ?? 0),
            status: w.status ?? '',
          })),
        };
      });

      const today = new Date().toDateString();
      const derived: WorkflowMetrics = {
        totalOrders: mapped.length,
        inProduction: mapped.filter((o) => o.status === 'in_production').length,
        pendingQC: mapped.filter((o) => o.status === 'quality_check').length,
        readyToShip: mapped.filter((o) => o.status === 'ready_for_dispatch').length,
        overdue: mapped.filter(
          (o) =>
            o.expectedDeliveryDate &&
            new Date(o.expectedDeliveryDate) < new Date() &&
            o.status !== 'completed' &&
            o.status !== 'delivered' &&
            o.status !== 'cancelled',
        ).length,
        completedToday: mapped.filter(
          (o) =>
            (o.status === 'completed' || o.status === 'delivered') &&
            o.events.some(
              (e) => e.timestamp && new Date(e.timestamp).toDateString() === today,
            ),
        ).length,
      };

      setOrders(mapped);
      setMetrics(derived);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load order tracking');
      setOrders([]);
      setMetrics(emptyMetrics);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = async () => {
    await loadOrders();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-3 py-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workflow Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Real-time visibility into order processing and workflow status
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-3 py-2">
        {isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading order tracking…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4" />
            {loadError}
          </div>
        )}
        {!isLoading && !loadError && orders.length === 0 && (
          <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            No orders found.
          </div>
        )}
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 mb-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalOrders}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Production</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.inProduction}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Factory className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending QC</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.pendingQC}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClipboardCheck className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ready to Ship</p>
                <p className="text-2xl font-bold text-teal-600">{metrics.readyToShip}</p>
              </div>
              <div className="p-2 bg-teal-100 rounded-lg">
                <Package className="h-5 w-5 text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{metrics.overdue}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed Today</p>
                <p className="text-2xl font-bold text-green-600">{metrics.completedToday}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Pipeline Visualization */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Workflow Pipeline</h2>
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {[
              { status: 'order_confirmed', count: 5 },
              { status: 'production_planning', count: 3 },
              { status: 'in_production', count: 12 },
              { status: 'quality_check', count: 5 },
              { status: 'ready_for_dispatch', count: 8 },
              { status: 'dispatched', count: 4 },
              { status: 'delivered', count: 8 },
            ].map((stage, index, arr) => {
              const config = statusConfig[stage.status as OrderTrackingStatus];
              const Icon = config.icon;
              return (
                <React.Fragment key={stage.status}>
                  <div className="flex flex-col items-center min-w-[100px]">
                    <div className={`p-3 rounded-full ${config.bgColor} mb-2`}>
                      <Icon className={`h-6 w-6 ${config.color}`} />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{stage.count}</p>
                    <p className="text-xs text-gray-500 text-center">{config.label}</p>
                  </div>
                  {index < arr.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-gray-300 mx-2 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Active Orders</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => {
              const config = statusConfig[order.status];
              const Icon = config.icon;
              return (
                <div
                  key={order.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/workflow/orders/${order.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${config.bgColor}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{order.orderNumber}</p>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${config.bgColor} ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{order.customerName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount)}</p>
                        <p className="text-xs text-gray-500">{order.itemCount} items</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-900">Due: {formatDate(order.expectedDeliveryDate)}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${order.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{order.progress}%</span>
                        </div>
                      </div>

                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Eye className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Work Orders */}
                  {order.workOrders.length > 0 && (
                    <div className="mt-3 pl-14">
                      <div className="flex items-center gap-2 flex-wrap">
                        {order.workOrders.map((wo) => (
                          <span
                            key={wo.workOrderNumber}
                            className={`px-2 py-1 text-xs rounded ${wo.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : wo.status === 'in_progress'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-700'
                              }`}
                          >
                            {wo.workOrderNumber}: {wo.itemName} ({wo.quantity})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="p-8 text-center">
                <Package className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">No orders found</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-400" />
            Recent Workflow Events
          </h2>
          <div className="space-y-3">
            {[
              { time: '2 mins ago', message: 'Work Order WO-001 started production for Kitchen Cabinet A', type: 'info' },
              { time: '15 mins ago', message: 'Order SO-2024-002 passed quality check', type: 'success' },
              { time: '1 hour ago', message: 'Low stock alert: Plywood Sheet 18mm below reorder level', type: 'warning' },
              { time: '2 hours ago', message: 'Order SO-2024-004 dispatched to Elite Kitchens', type: 'info' },
              { time: '3 hours ago', message: 'New order SO-2024-005 confirmed from Modern Living', type: 'success' },
            ].map((event, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`mt-0.5 p-1 rounded-full ${event.type === 'success' ? 'bg-green-100' :
                  event.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                  {event.type === 'success' ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : event.type === 'warning' ? (
                    <AlertTriangle className="h-3 w-3 text-yellow-600" />
                  ) : (
                    <Activity className="h-3 w-3 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{event.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
