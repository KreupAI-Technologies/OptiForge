'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  Package,
  Truck,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Navigation,
  AlertCircle,
  Phone,
  Mail,
  User,
  Box,
  Factory,
  PackageCheck,
  Ship,
  Home,
  RefreshCw
} from 'lucide-react';
import { salesPagesService } from '@/services/sales-pages.service';

interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  description: string;
  completed: boolean;
}

interface OrderTracking {
  id: string;
  orderNumber: string;
  salesOrderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  orderDate: string;
  expectedDeliveryDate: string;
  currentStatus: 'order_placed' | 'production' | 'quality_check' | 'packed' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered';
  currentLocation: string;
  carrier?: string;
  trackingNumber?: string;
  itemsCount: number;
  totalAmount: number;
  trackingEvents: TrackingEvent[];
  estimatedDelivery: string;
  deliveryProgress: number;
  lastUpdated: string;
}

export default function OrderTrackingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderTracking | null>(null);

  const [orders, setOrders] = useState<OrderTracking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await salesPagesService.getQuotations();
        const mapped: OrderTracking[] = raw.map((r: any) => ({
          id: String(r.id ?? ''),
          orderNumber: r.orderNumber ?? '',
          salesOrderNumber: r.salesOrderNumber ?? '',
          customerName: r.customerName ?? '',
          customerPhone: r.customerPhone ?? '',
          customerEmail: r.customerEmail ?? '',
          shippingAddress: {
            street: r.shippingAddress?.street ?? '',
            city: r.shippingAddress?.city ?? '',
            state: r.shippingAddress?.state ?? '',
            pincode: r.shippingAddress?.pincode ?? '',
          },
          orderDate: r.orderDate ?? '',
          expectedDeliveryDate: r.expectedDeliveryDate ?? '',
          currentStatus: (r.currentStatus ?? 'order_placed') as OrderTracking['currentStatus'],
          currentLocation: r.currentLocation ?? '',
          carrier: r.carrier,
          trackingNumber: r.trackingNumber,
          itemsCount: r.itemsCount ?? 0,
          totalAmount: r.totalAmount ?? 0,
          trackingEvents: (r.trackingEvents ?? []).map((e: any) => ({
            status: e.status ?? '',
            location: e.location ?? '',
            timestamp: e.timestamp ?? '',
            description: e.description ?? '',
            completed: e.completed ?? false,
          })),
          estimatedDelivery: r.estimatedDelivery ?? '',
          deliveryProgress: r.deliveryProgress ?? 0,
          lastUpdated: r.lastUpdated ?? '',
        }));
        if (!cancelled) setOrders(mapped);
      } catch (e) {
        if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setOrders([]); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.salesOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.trackingNumber && order.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500';
      case 'out_for_delivery': return 'bg-blue-500';
      case 'in_transit': return 'bg-cyan-500';
      case 'shipped': return 'bg-indigo-500';
      case 'packed': return 'bg-purple-500';
      case 'quality_check': return 'bg-yellow-500';
      case 'production': return 'bg-orange-500';
      case 'order_placed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'order_placed': return 'Order Placed';
      case 'production': return 'In Production';
      case 'quality_check': return 'Quality Check';
      case 'packed': return 'Packed & Ready';
      case 'shipped': return 'Shipped';
      case 'in_transit': return 'In Transit';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'order_placed': return <FileText className="w-5 h-5" />;
      case 'production': return <Factory className="w-5 h-5" />;
      case 'quality_check': return <PackageCheck className="w-5 h-5" />;
      case 'packed': return <Package className="w-5 h-5" />;
      case 'shipped': return <Ship className="w-5 h-5" />;
      case 'in_transit': return <Navigation className="w-5 h-5" />;
      case 'out_for_delivery': return <Truck className="w-5 h-5" />;
      case 'delivered': return <Home className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 px-3 py-2">
      <div className="space-y-3">
        {isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {loadError}
          </div>
        )}
        {/* Inline Header */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <button className="px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors">
              Export Tracking Data
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-colors flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh All
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order number, tracking number, or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Left Side - Order Cards */}
          <div className="space-y-2">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`bg-white rounded-xl shadow-sm border-2 p-5 cursor-pointer transition-all hover:shadow-md ${
                  selectedOrder?.id === order.id ? 'border-cyan-500 ring-2 ring-cyan-200' : 'border-gray-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                      <p className="text-sm text-gray-600 mt-0.5">SO: {order.salesOrderNumber}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-white text-xs font-medium ${getStatusColor(order.currentStatus)}`}>
                      {getStatusLabel(order.currentStatus)}
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{order.customerName}</span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-gray-900">{order.deliveryProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getStatusColor(order.currentStatus)}`}
                        style={{ width: `${order.deliveryProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Current Status */}
                  <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-cyan-900">{order.currentLocation}</p>
                        <p className="text-cyan-700 text-xs mt-0.5">
                          Updated {formatTimestamp(order.lastUpdated)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Number */}
                  {order.trackingNumber && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tracking:</span>
                      <span className="font-mono font-medium text-gray-900">{order.trackingNumber}</span>
                    </div>
                  )}

                  {/* Expected Delivery */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Expected: {order.estimatedDelivery}</span>
                  </div>
                </div>
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mb-2" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
                <p className="text-gray-600">Try searching with a different term.</p>
              </div>
            )}
          </div>

          {/* Right Side - Detailed Tracking */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            {selectedOrder ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                <div className="space-y-3">
                  {/* Order Header */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedOrder.orderNumber}</h2>
                    <p className="text-gray-600 mt-1">Sales Order: {selectedOrder.salesOrderNumber}</p>
                  </div>

                  {/* Customer Details */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedOrder.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedOrder.customerEmail}</span>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900">Delivery Address</p>
                      <p className="mt-1">{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                      <p>{selectedOrder.shippingAddress.pincode}</p>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-medium text-gray-900">{new Date(selectedOrder.orderDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Expected Delivery</p>
                      <p className="font-medium text-gray-900">{new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Items</p>
                      <p className="font-medium text-gray-900">{selectedOrder.itemsCount} units</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-medium text-gray-900">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tracking Timeline</h3>
                    <div className="space-y-2">
                      {selectedOrder.trackingEvents.map((event, index) => (
                        <div key={index} className="flex gap-2">
                          {/* Timeline Line */}
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              event.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                            }`}>
                              {event.completed ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                <Circle className="w-5 h-5" />
                              )}
                            </div>
                            {index < selectedOrder.trackingEvents.length - 1 && (
                              <div className={`w-0.5 flex-1 min-h-[40px] ${
                                event.completed ? 'bg-green-500' : 'bg-gray-200'
                              }`} />
                            )}
                          </div>

                          {/* Event Details */}
                          <div className={`flex-1 pb-6 ${!event.completed && 'opacity-50'}`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900">{event.status}</h4>
                                <p className="text-sm text-gray-600 mt-0.5">{event.location}</p>
                                <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                              </div>
                            </div>
                            {event.timestamp && (
                              <p className="text-xs text-gray-500 mt-2">
                                {formatTimestamp(event.timestamp)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Carrier Info */}
                  {selectedOrder.carrier && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Carrier Information</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        <strong>Carrier:</strong> {selectedOrder.carrier}
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        <strong>Tracking #:</strong> {selectedOrder.trackingNumber}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-colors">
                      Share Tracking
                    </button>
                    <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      Contact Customer
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Navigation className="w-16 h-16 text-gray-400 mb-2" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an Order</h3>
                <p className="text-gray-600">Click on an order from the list to view detailed tracking information.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing import
import { FileText } from 'lucide-react';
