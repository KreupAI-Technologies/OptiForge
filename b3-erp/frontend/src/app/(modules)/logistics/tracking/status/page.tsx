'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Package, Truck, CheckCircle, Clock, AlertTriangle, XCircle, Filter, TrendingUp, AlertCircle } from 'lucide-react';
import { shipmentService } from '@/services/shipment.service';

interface ShipmentStatus {
  id: string;
  shipmentNo: string;
  trackingNumber: string;
  orderNo: string;
  customer: string;
  origin: string;
  destination: string;
  status: 'pending' | 'picked-up' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'delayed' | 'failed' | 'returned';
  priority: 'express' | 'standard' | 'economy';
  shipmentDate: string;
  expectedDelivery: string;
  actualDelivery: string;
  items: number;
  weight: number;
  carrier: string;
  lastUpdate: string;
  currentLocation: string;
}

export default function TrackingStatusPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const [shipments, setShipments] = useState<ShipmentStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns the sales Shipment ORM shape; map defensively to the
        // page's ShipmentStatus model.
        const { data } = await shipmentService.getAllShipments();
        const statusMap: Record<string, ShipmentStatus['status']> = {
          Draft: 'pending', Pending: 'pending', Dispatched: 'picked-up',
          'In Transit': 'in-transit', 'Out for Delivery': 'out-for-delivery',
          Delivered: 'delivered', Cancelled: 'failed', Returned: 'returned',
        };
        const priorityMap: Record<string, ShipmentStatus['priority']> = {
          Urgent: 'express', High: 'express', Normal: 'standard', Low: 'economy',
        };
        const mapped: ShipmentStatus[] = (data as any[]).map((s) => ({
          id: String(s.id ?? ''),
          shipmentNo: s.shipmentNumber ?? '',
          trackingNumber: s.trackingNumber ?? '',
          orderNo: s.orderNumber ?? s.orderId ?? '',
          customer: s.customerName ?? '',
          origin: '',
          destination: [s.city, s.state].filter(Boolean).join(', ') || s.deliveryAddress || '',
          status: statusMap[s.status] ?? 'pending',
          priority: priorityMap[s.priority] ?? 'standard',
          shipmentDate: s.shipmentDate ?? '',
          expectedDelivery: s.expectedDeliveryDate ?? '',
          actualDelivery: s.actualDeliveryDate ?? '',
          items: Number(s.totalItems ?? 0),
          weight: Number(s.totalWeight ?? 0),
          carrier: s.carrierName ?? '',
          lastUpdate: s.updatedAt ?? '',
          currentLocation: s.currentLocation ?? '',
        }));
        if (!cancelled) setShipments(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load shipment statuses');
          setShipments([]);
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


  const statusStats = {
    total: shipments.length,
    pending: shipments.filter(s => s.status === 'pending').length,
    pickedUp: shipments.filter(s => s.status === 'picked-up').length,
    inTransit: shipments.filter(s => s.status === 'in-transit').length,
    outForDelivery: shipments.filter(s => s.status === 'out-for-delivery').length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
    delayed: shipments.filter(s => s.status === 'delayed').length,
    failed: shipments.filter(s => s.status === 'failed').length,
    returned: shipments.filter(s => s.status === 'returned').length
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch =
      shipment.shipmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.orderNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || shipment.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-transit': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'out-for-delivery': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'picked-up': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'delayed': return 'bg-red-100 text-red-700 border-red-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'returned': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'express': return 'bg-red-50 text-red-700 border-red-200';
      case 'standard': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'economy': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-5 h-5" />;
      case 'in-transit': return <Truck className="w-5 h-5" />;
      case 'out-for-delivery': return <TrendingUp className="w-5 h-5" />;
      case 'picked-up': return <Package className="w-5 h-5" />;
      case 'delayed': return <AlertTriangle className="w-5 h-5" />;
      case 'failed': return <XCircle className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'returned': return <ArrowLeft className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipment Status Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor all shipment statuses in real-time</p>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading shipment statuses…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && shipments.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No shipments found.
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{statusStats.total}</span>
          </div>
          <p className="text-sm font-medium opacity-90">Total Shipments</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{statusStats.delivered}</span>
          </div>
          <p className="text-sm font-medium opacity-90">Delivered</p>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Truck className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{statusStats.inTransit}</span>
          </div>
          <p className="text-sm font-medium opacity-90">In Transit</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{statusStats.outForDelivery}</span>
          </div>
          <p className="text-sm font-medium opacity-90">Out for Delivery</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{statusStats.delayed + statusStats.failed}</span>
          </div>
          <p className="text-sm font-medium opacity-90">Issues</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by shipment no, tracking number, customer, or order no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="picked-up">Picked Up</option>
              <option value="in-transit">In Transit</option>
              <option value="out-for-delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="delayed">Delayed</option>
              <option value="failed">Failed</option>
              <option value="returned">Returned</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="express">Express</option>
              <option value="standard">Standard</option>
              <option value="economy">Economy</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Filter className="w-4 h-4" />
          <span>Showing {filteredShipments.length} of {statusStats.total} shipments</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Shipment Details</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Route</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Delivery Timeline</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Current Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{shipment.shipmentNo}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{shipment.trackingNumber}</p>
                      <p className="text-xs text-blue-600 mt-0.5">{shipment.orderNo}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{shipment.customer}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Package className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{shipment.items} items " {shipment.weight}kg</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-xs">
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">From:</span> {shipment.origin}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">To:</span> {shipment.destination}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(shipment.status)}`}>
                      {getStatusIcon(shipment.status)}
                      {shipment.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(shipment.priority)}`}>
                      {shipment.priority}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-xs">
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Shipped:</span> {shipment.shipmentDate}
                      </p>
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Expected:</span> {shipment.expectedDelivery}
                      </p>
                      {shipment.actualDelivery && (
                        <p className="text-green-600 font-medium">
                          <span>Delivered:</span> {shipment.actualDelivery}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-xs text-gray-900 font-medium mb-1">{shipment.currentLocation}</p>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Carrier:</span> {shipment.carrier}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Updated: {shipment.lastUpdate}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredShipments.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mb-2" />
            <p className="text-gray-500 text-lg mb-2">No shipments found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Status Definitions:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
          <div className="flex items-start gap-2">
            <span className="font-medium">Pending:</span>
            <span>Shipment created, awaiting pickup from warehouse</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">Picked Up:</span>
            <span>Collected by carrier, in initial processing</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">In Transit:</span>
            <span>En route to destination through transit hubs</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">Out for Delivery:</span>
            <span>On delivery vehicle, arriving today</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">Delivered:</span>
            <span>Successfully delivered to customer</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">Delayed:</span>
            <span>Behind schedule due to unforeseen circumstances</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">Failed:</span>
            <span>Delivery attempt unsuccessful, retry scheduled</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">Returned:</span>
            <span>Returned to origin due to rejection or failure</span>
          </div>
        </div>
      </div>
    </div>
  );
}
