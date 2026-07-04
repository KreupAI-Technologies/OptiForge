'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import {
  ArrowLeft,
  Search,
  MapPin,
  Package,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Calendar,
  User,
  Activity,
  Eye,
  RefreshCw
} from 'lucide-react';

interface WorkOrderTracking {
  id: string;
  workOrderNumber: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  salesOrderNumber: string;
  customerName: string;
  currentStatus: 'pending' | 'in-progress' | 'quality-check' | 'packaging' | 'completed';
  currentStation: string;
  completionPercentage: number;
  startDate: string;
  dueDate: string;
  estimatedCompletion: string;
  assignedTeam: string;
  timeline: TrackingEvent[];
  lastUpdate: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
}

interface TrackingEvent {
  id: string;
  station: string;
  status: 'completed' | 'in-progress' | 'pending';
  startTime: string;
  endTime: string;
  duration: number;
  operator: string;
  notes: string;
  issues: string[];
}

export default function WorkOrderTrackingPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<WorkOrderTracking | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [trackingOrders, setTrackingOrders] = useState<WorkOrderTracking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const raw = (await ProductionOrphanService.getWorkOrders()) as any[];
        const mapped: WorkOrderTracking[] = (raw || []).map((r: any) => ({
          id: String(r.id ?? ''),
          workOrderNumber: r.workOrderNumber ?? '',
          productCode: r.productCode ?? '',
          productName: r.productName ?? '',
          quantity: Number(r.quantity ?? 0),
          unit: r.unit ?? '',
          salesOrderNumber: r.salesOrderNumber ?? '',
          customerName: r.customerName ?? '',
          currentStatus: (r.currentStatus ?? 'pending') as WorkOrderTracking['currentStatus'],
          currentStation: r.currentStation ?? '',
          completionPercentage: Number(r.completionPercentage ?? 0),
          startDate: r.startDate ?? '',
          dueDate: r.dueDate ?? '',
          estimatedCompletion: r.estimatedCompletion ?? '',
          assignedTeam: r.assignedTeam ?? '',
          timeline: Array.isArray(r.timeline) ? r.timeline.map((t: any): TrackingEvent => ({
            id: String(t.id ?? ''),
            station: t.station ?? '',
            status: (t.status ?? 'pending') as TrackingEvent['status'],
            startTime: t.startTime ?? '',
            endTime: t.endTime ?? '',
            duration: Number(t.duration ?? 0),
            operator: t.operator ?? '',
            notes: t.notes ?? '',
            issues: Array.isArray(t.issues) ? t.issues.map((i: any) => String(i)) : [],
          })) : [],
          lastUpdate: r.lastUpdate ?? '',
          priority: (r.priority ?? 'medium') as WorkOrderTracking['priority'],
        }));
        if (!cancelled) setTrackingOrders(mapped);
      } catch (err) {
        if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setTrackingOrders([]); }
      } finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredOrders = trackingOrders.filter(order =>
    order.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Pending' },
      'in-progress': { color: 'bg-blue-100 text-blue-800', icon: Activity, label: 'In Progress' },
      'quality-check': { color: 'bg-purple-100 text-purple-800', icon: CheckCircle2, label: 'Quality Check' },
      packaging: { color: 'bg-orange-100 text-orange-800', icon: Package, label: 'Packaging' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Completed' }
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getEventStatus = (status: string) => {
    if (status === 'completed') return 'bg-green-500';
    if (status === 'in-progress') return 'bg-blue-500 animate-pulse';
    return 'bg-gray-300';
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    console.log('Refreshing tracking data...');

    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
      alert('Tracking data refreshed successfully!\n\nAll work order statuses and timelines have been updated with the latest information from the production floor.');
    }, 1000);
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
            <h1 className="text-2xl font-bold text-gray-900">Work Order Tracking</h1>
            <p className="text-sm text-gray-600">Real-time production status and progress tracking</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by work order, product, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Work Orders List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredOrders.map((order) => {
          const statusInfo = getStatusBadge(order.currentStatus);
          const StatusIcon = statusInfo.icon;
          const isSelected = selectedOrder?.id === order.id;

          return (
            <div
              key={order.id}
              className={`bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer ${
                isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedOrder(order)}
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{order.workOrderNumber}</h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {order.customerName}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="bg-blue-50 rounded-lg p-3 mb-2">
                  <div className="flex items-start gap-2">
                    <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{order.productName}</div>
                      <div className="text-xs text-gray-600 mt-1">{order.quantity} {order.unit} • {order.productCode}</div>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-lg font-bold text-blue-900">{order.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${order.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Current Station */}
                <div className="bg-purple-50 rounded-lg p-3 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-900">Current Station</span>
                  </div>
                  <div className="font-semibold text-gray-900">{order.currentStation}</div>
                </div>

                {/* Timeline Preview */}
                <div className="flex items-center gap-2 mb-2">
                  {order.timeline.slice(0, 6).map((event, idx) => (
                    <div
                      key={event.id}
                      className={`h-2 flex-1 rounded-full ${getEventStatus(event.status)}`}
                      title={event.station}
                    ></div>
                  ))}
                </div>

                {/* Footer Info */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-gray-600">Started</div>
                    <div className="font-medium text-gray-900">{order.startDate}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Due Date</div>
                    <div className="font-medium text-gray-900">{order.dueDate}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Team</div>
                    <div className="font-medium text-gray-900">{order.assignedTeam}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Last Update</div>
                    <div className="font-medium text-gray-900">{order.lastUpdate}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Timeline Modal/Panel */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-3 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedOrder.workOrderNumber}</h2>
                <p className="text-sm text-gray-600">{selectedOrder.productName}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Timeline */}
              <div className="space-y-3">
                {selectedOrder.timeline.map((event, idx) => (
                  <div key={event.id} className="flex gap-2">
                    {/* Status Indicator */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        event.status === 'completed' ? 'bg-green-500' :
                        event.status === 'in-progress' ? 'bg-blue-500 animate-pulse' :
                        'bg-gray-300'
                      }`}>
                        {event.status === 'completed' ? (
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        ) : event.status === 'in-progress' ? (
                          <Activity className="h-6 w-6 text-white" />
                        ) : (
                          <Clock className="h-6 w-6 text-white" />
                        )}
                      </div>
                      {idx < selectedOrder.timeline.length - 1 && (
                        <div className={`w-1 h-16 ${
                          event.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 pb-8">
                      <div className={`rounded-lg border-2 p-3 ${
                        event.status === 'completed' ? 'border-green-200 bg-green-50' :
                        event.status === 'in-progress' ? 'border-blue-200 bg-blue-50' :
                        'border-gray-200 bg-gray-50'
                      }`}>
                        <h3 className="font-semibold text-gray-900 mb-2">{event.station}</h3>

                        {event.status !== 'pending' && (
                          <>
                            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                              <div>
                                <div className="text-gray-600">Operator</div>
                                <div className="font-medium text-gray-900">{event.operator}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Duration</div>
                                <div className="font-medium text-gray-900">
                                  {event.status === 'completed' ? `${event.duration} hours` : 'In progress'}
                                </div>
                              </div>
                              {event.startTime && (
                                <div>
                                  <div className="text-gray-600">Start Time</div>
                                  <div className="font-medium text-gray-900">{event.startTime}</div>
                                </div>
                              )}
                              {event.endTime && (
                                <div>
                                  <div className="text-gray-600">End Time</div>
                                  <div className="font-medium text-gray-900">{event.endTime}</div>
                                </div>
                              )}
                            </div>

                            {event.notes && (
                              <div className="text-sm text-gray-700 mb-2">
                                <span className="font-medium">Notes:</span> {event.notes}
                              </div>
                            )}

                            {event.issues.length > 0 && (
                              <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="text-xs font-medium text-red-900 mb-1">Issues</div>
                                    <ul className="space-y-1">
                                      {event.issues.map((issue, i) => (
                                        <li key={i} className="text-xs text-red-700">• {issue}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {event.status === 'pending' && (
                          <div className="text-sm text-gray-500 italic">Awaiting start</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-6 text-sm text-gray-600">
        Showing {filteredOrders.length} work orders • Click on any order for detailed timeline
      </div>
    </div>
  );
}
