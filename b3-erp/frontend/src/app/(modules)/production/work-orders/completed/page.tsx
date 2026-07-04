'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { exportToCsv } from '@/lib/export';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  Calendar,
  Package,
  User,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  Award,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface CompletedWorkOrder {
  id: string;
  workOrderNumber: string;
  productCode: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  produced: number;
  rejected: number;
  successRate: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  salesOrderNumber: string;
  customerName: string;
  startDate: string;
  completionDate: string;
  dueDate: string;
  plannedDuration: number;
  actualDuration: number;
  varianceDays: number;
  plannedCost: number;
  actualCost: number;
  costVariance: number;
  assignedTeam: string;
  completedBy: string;
  deliveryStatus: 'delivered' | 'ready-for-shipment' | 'in-transit' | 'pending-qc';
  qualityRating: number;
  remarks: string;
}

export default function CompletedWorkOrdersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDelivery, setFilterDelivery] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('last-30-days');

  const [completedOrders, setCompletedOrders] = useState<CompletedWorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const raw = (await ProductionOrphanService.getWorkOrders()) as any[];
        const mapped: CompletedWorkOrder[] = (raw || []).map((r: any) => ({
          id: String(r.id ?? ''),
          workOrderNumber: r.workOrderNumber ?? '',
          productCode: r.productCode ?? '',
          productName: r.productName ?? '',
          category: r.category ?? '',
          quantity: Number(r.quantity ?? 0),
          unit: r.unit ?? '',
          produced: Number(r.produced ?? 0),
          rejected: Number(r.rejected ?? 0),
          successRate: Number(r.successRate ?? 0),
          priority: (r.priority ?? 'medium') as CompletedWorkOrder['priority'],
          salesOrderNumber: r.salesOrderNumber ?? '',
          customerName: r.customerName ?? '',
          startDate: r.startDate ?? '',
          completionDate: r.completionDate ?? '',
          dueDate: r.dueDate ?? '',
          plannedDuration: Number(r.plannedDuration ?? 0),
          actualDuration: Number(r.actualDuration ?? 0),
          varianceDays: Number(r.varianceDays ?? 0),
          plannedCost: Number(r.plannedCost ?? 0),
          actualCost: Number(r.actualCost ?? 0),
          costVariance: Number(r.costVariance ?? 0),
          assignedTeam: r.assignedTeam ?? '',
          completedBy: r.completedBy ?? '',
          deliveryStatus: (r.deliveryStatus ?? 'pending-qc') as CompletedWorkOrder['deliveryStatus'],
          qualityRating: Number(r.qualityRating ?? 0),
          remarks: r.remarks ?? '',
        }));
        if (!cancelled) setCompletedOrders(mapped);
      } catch (err) {
        if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setCompletedOrders([]); }
      } finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const deliveryStatuses = ['all', 'delivered', 'in-transit', 'ready-for-shipment', 'pending-qc'];
  const periods = ['last-7-days', 'last-30-days', 'last-90-days', 'this-year'];

  const filteredOrders = completedOrders.filter(order => {
    const matchesSearch =
      order.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDelivery = filterDelivery === 'all' || order.deliveryStatus === filterDelivery;

    return matchesSearch && matchesDelivery;
  });

  const getDeliveryBadge = (status: string) => {
    const badges = {
      'delivered': { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Delivered' },
      'in-transit': { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'In Transit' },
      'ready-for-shipment': { color: 'bg-purple-100 text-purple-800', icon: Package, label: 'Ready for Shipment' },
      'pending-qc': { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, label: 'Pending QC' }
    };
    return badges[status as keyof typeof badges] || badges['delivered'];
  };

  // Summary stats
  const totalCompleted = completedOrders.length;
  const avgSuccessRate = completedOrders.reduce((sum, o) => sum + o.successRate, 0) / totalCompleted;
  const onTimeDelivery = completedOrders.filter(o => o.varianceDays <= 0).length;
  const underBudget = completedOrders.filter(o => o.costVariance <= 0).length;

  const handleExportReport = () => {
    exportToCsv('completed-work-orders', filteredOrders as unknown as Record<string, unknown>[]);
  };

  const handleViewDetails = (workOrderId: string) => {
    router.push(`/production/work-orders/view/${workOrderId}`);
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
            <h1 className="text-2xl font-bold text-gray-900">Completed Work Orders</h1>
            <p className="text-sm text-gray-600">Successfully finished production work orders</p>
          </div>
        </div>
        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900">Completed</span>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{totalCompleted}</div>
          <div className="text-xs text-green-700 mt-1">Last 30 days</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Avg Success Rate</span>
            <Award className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{avgSuccessRate.toFixed(1)}%</div>
          <div className="text-xs text-blue-700 mt-1">Quality metric</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">On-Time Delivery</span>
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">{onTimeDelivery}</div>
          <div className="text-xs text-purple-700 mt-1">{((onTimeDelivery / totalCompleted) * 100).toFixed(0)}% of orders</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-900">Under Budget</span>
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-900">{underBudget}</div>
          <div className="text-xs text-orange-700 mt-1">{((underBudget / totalCompleted) * 100).toFixed(0)}% of orders</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search completed orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterDelivery}
            onChange={(e) => setFilterDelivery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {deliveryStatuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Delivery Status' : status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {periods.map(period => (
              <option key={period} value={period}>
                {period.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Output
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Variance
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const deliveryInfo = getDeliveryBadge(order.deliveryStatus);
                const DeliveryIcon = deliveryInfo.icon;
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.workOrderNumber}</div>
                        <div className="text-xs text-gray-500">{order.customerName}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.productName}</div>
                        <div className="text-xs text-gray-500">{order.productCode}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-green-900">{order.produced} {order.unit}</div>
                        <div className="text-xs text-gray-500">{order.quantity} ordered</div>
                        {order.rejected > 0 && (
                          <div className="text-xs text-red-600">{order.rejected} rejected</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className={`text-sm font-medium ${
                        order.successRate >= 95 ? 'text-green-900' :
                        order.successRate >= 90 ? 'text-blue-900' :
                        'text-orange-900'
                      }`}>
                        {order.successRate.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{order.actualDuration} days</div>
                        <div className={`text-xs flex items-center gap-1 ${
                          order.varianceDays < 0 ? 'text-green-600' :
                          order.varianceDays === 0 ? 'text-gray-600' :
                          'text-red-600'
                        }`}>
                          {order.varianceDays < 0 ? <TrendingUp className="h-3 w-3" /> :
                           order.varianceDays > 0 ? <TrendingDown className="h-3 w-3" /> : null}
                          {order.varianceDays === 0 ? 'On time' :
                           order.varianceDays < 0 ? `${Math.abs(order.varianceDays)}d early` :
                           `${order.varianceDays}d late`}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className={`text-sm font-medium ${order.costVariance <= 0 ? 'text-green-900' : 'text-red-900'}`}>
                        {order.costVariance <= 0 ? '-' : '+'}₹{Math.abs(order.costVariance).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((Math.abs(order.costVariance) / order.plannedCost) * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Award className={`h-4 w-4 ${
                          order.qualityRating >= 4.8 ? 'text-yellow-500' :
                          order.qualityRating >= 4.5 ? 'text-blue-500' :
                          'text-gray-400'
                        }`} />
                        <span className="text-sm font-medium text-gray-900">{order.qualityRating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${deliveryInfo.color}`}>
                        <DeliveryIcon className="h-3 w-3" />
                        {deliveryInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleViewDetails(order.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredOrders.length} of {totalCompleted} completed work orders
      </div>
    </div>
  );
}
