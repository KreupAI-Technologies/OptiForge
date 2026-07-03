'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Package, Truck, MapPin, Calendar, CheckCircle, Clock, AlertTriangle, Download, User, AlertCircle } from 'lucide-react';
import { shipmentService } from '@/services/shipment.service';
import { exportToCsv } from '@/lib/export';

interface OutboundShipment {
  id: string;
  shipmentNo: string;
  soNumber: string;
  customer: string;
  carrier: string;
  origin: string;
  destination: string;
  shipDate: string;
  deliveryDate: string;
  items: number;
  totalQty: number;
  totalValue: number;
  status: 'pending' | 'packed' | 'ready' | 'dispatched' | 'in-transit' | 'delivered' | 'returned';
  trackingNumber: string;
  vehicleNo: string;
  driverName: string;
  priority: 'express' | 'standard' | 'economy';
}

export default function OutboundShippingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [outboundShipments, setOutboundShipments] = useState<OutboundShipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns the sales Shipment ORM shape; map defensively to the
        // page's OutboundShipment model.
        const { data } = await shipmentService.getAllShipments();
        const statusMap: Record<string, OutboundShipment['status']> = {
          Draft: 'pending', Pending: 'pending', Packed: 'packed', Ready: 'ready',
          Dispatched: 'dispatched', 'In Transit': 'in-transit',
          Delivered: 'delivered', Returned: 'returned', Cancelled: 'returned',
        };
        const priorityMap: Record<string, OutboundShipment['priority']> = {
          Urgent: 'express', High: 'express', Normal: 'standard', Low: 'economy',
        };
        const mapped: OutboundShipment[] = (data as any[]).map((s) => {
          const items = Array.isArray(s.items) ? s.items : [];
          return {
            id: String(s.id ?? ''),
            shipmentNo: s.shipmentNumber ?? '',
            soNumber: s.orderNumber ?? s.orderId ?? '',
            customer: s.customerName ?? '',
            carrier: s.carrierName ?? '',
            origin: '',
            destination: [s.city, s.state].filter(Boolean).join(', ') || s.deliveryAddress || '',
            shipDate: s.dispatchDate ?? s.shipmentDate ?? '',
            deliveryDate: s.actualDeliveryDate ?? s.expectedDeliveryDate ?? '',
            items: Number(s.totalItems ?? items.length ?? 0),
            totalQty: Number(s.totalItems ?? 0),
            totalValue: Number(s.shippingCost ?? 0),
            status: statusMap[s.status] ?? 'pending',
            trackingNumber: s.trackingNumber ?? '',
            vehicleNo: s.vehicleNumber ?? '',
            driverName: s.driverName ?? '',
            priority: priorityMap[s.priority] ?? 'standard',
          };
        });
        if (!cancelled) setOutboundShipments(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load outbound shipments');
          setOutboundShipments([]);
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

  const filteredShipments = outboundShipments.filter(shipment => {
    const matchesSearch = shipment.shipmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shipment.soNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shipment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || shipment.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || shipment.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-transit': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'dispatched': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ready': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'packed': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'pending': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'returned': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-3 h-3" />;
      case 'in-transit': return <Truck className="w-3 h-3" />;
      case 'dispatched': return <Truck className="w-3 h-3" />;
      case 'ready': return <Package className="w-3 h-3" />;
      case 'packed': return <Package className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'returned': return <AlertTriangle className="w-3 h-3" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'express': return 'bg-red-100 text-red-700 border-red-200';
      case 'standard': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'economy': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Outbound Shipping</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and track customer order shipments</p>
          </div>
        </div>
        <button onClick={() => exportToCsv('outbound-shipments', filteredShipments)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading outbound shipments…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && outboundShipments.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No outbound shipments found.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {outboundShipments.filter(s => s.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-6 h-6 text-gray-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Ready/Packed</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">
                {outboundShipments.filter(s => s.status === 'ready' || s.status === 'packed').length}
              </p>
            </div>
            <Package className="w-6 h-6 text-yellow-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">In Transit</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {outboundShipments.filter(s => s.status === 'in-transit' || s.status === 'dispatched').length}
              </p>
            </div>
            <Truck className="w-6 h-6 text-blue-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Delivered</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {outboundShipments.filter(s => s.status === 'delivered').length}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Value</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                Rs.{(outboundShipments.reduce((sum, s) => sum + s.totalValue, 0) / 1000).toFixed(0)}K
              </p>
            </div>
            <Package className="w-6 h-6 text-purple-700" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search shipments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="packed">Packed</option>
            <option value="ready">Ready</option>
            <option value="dispatched">Dispatched</option>
            <option value="in-transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="returned">Returned</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="express">Express</option>
            <option value="standard">Standard</option>
            <option value="economy">Economy</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shipment Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle/Driver</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Items/Qty</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ship/Delivery</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900">{shipment.shipmentNo}</div>
                    <div className="text-xs text-gray-500">SO: {shipment.soNumber}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      <span className="font-mono">{shipment.trackingNumber}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900">{shipment.customer}</div>
                    <div className="text-xs text-gray-500">{shipment.carrier}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-700">{shipment.origin}</div>
                        <div className="text-xs text-gray-400 my-1">{'->'}</div>
                        <div className="text-xs font-semibold text-gray-900">{shipment.destination}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs text-gray-700">
                      <Truck className="w-3 h-3 text-blue-500" />
                      <span className="font-mono">{shipment.vehicleNo}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <User className="w-3 h-3 text-gray-400" />
                      <span>{shipment.driverName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-sm font-semibold text-gray-900">{shipment.items} items</div>
                    <div className="text-xs text-gray-500">{shipment.totalQty.toLocaleString()} units</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm font-bold text-blue-600">
                      Rs.{shipment.totalValue.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">Ship: {shipment.shipDate}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-green-600 font-semibold">Deliver: {shipment.deliveryDate}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(shipment.priority)}`}>
                      {shipment.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(shipment.status)}`}>
                      {getStatusIcon(shipment.status)}
                      {shipment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredShipments.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-500">No outbound shipments found</p>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Outbound Shipping Process:</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li><strong>Pending:</strong> Sales order confirmed, awaiting picking and packing</li>
          <li><strong>Packed:</strong> Items picked and packed, ready for dispatch</li>
          <li><strong>Ready:</strong> Shipment loaded on vehicle, awaiting departure</li>
          <li><strong>Dispatched:</strong> Vehicle departed from warehouse</li>
          <li><strong>In Transit:</strong> Shipment en route to customer location</li>
          <li><strong>Delivered:</strong> Goods delivered and accepted by customer</li>
          <li><strong>Returned:</strong> Shipment returned due to delivery issues</li>
        </ul>
      </div>
    </div>
  );
}
