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

  const orders: OrderTracking[] = [
    {
      id: '1',
      orderNumber: 'TRK-2025-001',
      salesOrderNumber: 'SO-2025-112',
      customerName: 'Tata Motors Limited',
      customerPhone: '+91 98765 43210',
      customerEmail: 'procurement@tatamotors.com',
      shippingAddress: {
        street: 'Tata Motors Plant, Sanand',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '382170'
      },
      orderDate: '2025-10-15',
      expectedDeliveryDate: '2025-10-22',
      currentStatus: 'out_for_delivery',
      currentLocation: 'Ahmedabad Hub - Out for Delivery',
      carrier: 'Blue Dart Express',
      trackingNumber: 'BD123456789IN',
      itemsCount: 250,
      totalAmount: 1245000,
      estimatedDelivery: '2025-10-20 by 4:00 PM',
      deliveryProgress: 90,
      lastUpdated: '2025-10-20T08:30:00',
      trackingEvents: [
        {
          status: 'Order Placed',
          location: 'Manufacturing Facility - Surat',
          timestamp: '2025-10-15T10:00:00',
          description: 'Order received and confirmed',
          completed: true
        },
        {
          status: 'Production Started',
          location: 'Manufacturing Facility - Surat',
          timestamp: '2025-10-16T09:00:00',
          description: 'Production process initiated',
          completed: true
        },
        {
          status: 'Quality Check',
          location: 'Quality Control Dept - Surat',
          timestamp: '2025-10-17T14:30:00',
          description: 'Quality inspection completed - All items passed',
          completed: true
        },
        {
          status: 'Packed & Ready',
          location: 'Warehouse - Surat',
          timestamp: '2025-10-18T11:00:00',
          description: 'Items packed and ready for shipment',
          completed: true
        },
        {
          status: 'Picked Up',
          location: 'Surat Hub',
          timestamp: '2025-10-18T16:45:00',
          description: 'Package picked up by Blue Dart Express',
          completed: true
        },
        {
          status: 'In Transit',
          location: 'Ahmedabad Sorting Center',
          timestamp: '2025-10-19T22:15:00',
          description: 'Package arrived at sorting facility',
          completed: true
        },
        {
          status: 'Out for Delivery',
          location: 'Ahmedabad Hub',
          timestamp: '2025-10-20T08:30:00',
          description: 'Out for delivery - Expected by 4:00 PM',
          completed: false
        },
        {
          status: 'Delivered',
          location: 'Customer Location',
          timestamp: '',
          description: 'Package will be delivered',
          completed: false
        }
      ]
    },
    {
      id: '2',
      orderNumber: 'TRK-2025-002',
      salesOrderNumber: 'SO-2025-115',
      customerName: 'Larsen & Toubro',
      customerPhone: '+91 98765 43211',
      customerEmail: 'orders@lnt.com',
      shippingAddress: {
        street: 'L&T Construction Site, GIFT City',
        city: 'Gandhinagar',
        state: 'Gujarat',
        pincode: '382355'
      },
      orderDate: '2025-10-17',
      expectedDeliveryDate: '2025-10-24',
      currentStatus: 'in_transit',
      currentLocation: 'Gandhinagar Sorting Center',
      carrier: 'DTDC Courier',
      trackingNumber: 'DTDC987654321IN',
      itemsCount: 180,
      totalAmount: 856000,
      estimatedDelivery: '2025-10-23 by 5:00 PM',
      deliveryProgress: 65,
      lastUpdated: '2025-10-20T06:15:00',
      trackingEvents: [
        {
          status: 'Order Placed',
          location: 'Manufacturing Facility - Surat',
          timestamp: '2025-10-17T11:30:00',
          description: 'Order received and confirmed',
          completed: true
        },
        {
          status: 'Production Started',
          location: 'Manufacturing Facility - Surat',
          timestamp: '2025-10-18T08:00:00',
          description: 'Production process initiated',
          completed: true
        },
        {
          status: 'Quality Check',
          location: 'Quality Control Dept - Surat',
          timestamp: '2025-10-19T15:00:00',
          description: 'Quality inspection in progress',
          completed: true
        },
        {
          status: 'Packed & Ready',
          location: 'Warehouse - Surat',
          timestamp: '2025-10-19T18:30:00',
          description: 'Items packed and ready for shipment',
          completed: true
        },
        {
          status: 'In Transit',
          location: 'Gandhinagar Sorting Center',
          timestamp: '2025-10-20T06:15:00',
          description: 'Package in transit to delivery location',
          completed: false
        },
        {
          status: 'Out for Delivery',
          location: 'Gandhinagar Hub',
          timestamp: '',
          description: 'Will be out for delivery soon',
          completed: false
        },
        {
          status: 'Delivered',
          location: 'Customer Location',
          timestamp: '',
          description: 'Package will be delivered',
          completed: false
        }
      ]
    },
    {
      id: '3',
      orderNumber: 'TRK-2025-003',
      salesOrderNumber: 'SO-2025-118',
      customerName: 'Reliance Industries',
      customerPhone: '+91 98765 43212',
      customerEmail: 'procurement@ril.com',
      shippingAddress: {
        street: 'Reliance Refinery Complex',
        city: 'Jamnagar',
        state: 'Gujarat',
        pincode: '361280'
      },
      orderDate: '2025-10-18',
      expectedDeliveryDate: '2025-10-25',
      currentStatus: 'quality_check',
      currentLocation: 'Quality Control Department - Surat',
      itemsCount: 400,
      totalAmount: 2340000,
      estimatedDelivery: '2025-10-25 by 6:00 PM',
      deliveryProgress: 40,
      lastUpdated: '2025-10-20T10:00:00',
      trackingEvents: [
        {
          status: 'Order Placed',
          location: 'Manufacturing Facility - Surat',
          timestamp: '2025-10-18T09:15:00',
          description: 'Order received and confirmed',
          completed: true
        },
        {
          status: 'Production Started',
          location: 'Manufacturing Facility - Surat',
          timestamp: '2025-10-19T07:30:00',
          description: 'Production process initiated',
          completed: true
        },
        {
          status: 'Quality Check',
          location: 'Quality Control Dept - Surat',
          timestamp: '2025-10-20T10:00:00',
          description: 'Quality inspection in progress',
          completed: false
        },
        {
          status: 'Packed & Ready',
          location: 'Warehouse - Surat',
          timestamp: '',
          description: 'Awaiting quality clearance',
          completed: false
        },
        {
          status: 'Shipped',
          location: 'Carrier Pickup',
          timestamp: '',
          description: 'Will be shipped after packing',
          completed: false
        },
        {
          status: 'Delivered',
          location: 'Customer Location',
          timestamp: '',
          description: 'Package will be delivered',
          completed: false
        }
      ]
    },
    {
      id: '4',
      orderNumber: 'TRK-2025-004',
      salesOrderNumber: 'SO-2025-120',
      customerName: 'Mahindra & Mahindra',
      customerPhone: '+91 98765 43214',
      customerEmail: 'purchase@mahindra.com',
      shippingAddress: {
        street: 'Mahindra Manufacturing Plant',
        city: 'Chakan',
        state: 'Maharashtra',
        pincode: '410501'
      },
      orderDate: '2025-10-19',
      expectedDeliveryDate: '2025-10-26',
      currentStatus: 'production',
      currentLocation: 'Manufacturing Facility - Surat',
      itemsCount: 90,
      totalAmount: 445000,
      estimatedDelivery: '2025-10-26 by 5:00 PM',
      deliveryProgress: 25,
      lastUpdated: '2025-10-20T09:00:00',
      trackingEvents: [
        {
          status: 'Order Placed',
          location: 'Manufacturing Facility - Surat',
          timestamp: '2025-10-19T14:00:00',
          description: 'Order received and confirmed',
          completed: true
        },
        {
          status: 'Production Started',
          location: 'Manufacturing Facility - Surat',
          timestamp: '2025-10-20T09:00:00',
          description: 'Production process initiated - 30% complete',
          completed: false
        },
        {
          status: 'Quality Check',
          location: 'Quality Control Dept - Surat',
          timestamp: '',
          description: 'Pending production completion',
          completed: false
        },
        {
          status: 'Packed & Ready',
          location: 'Warehouse - Surat',
          timestamp: '',
          description: 'Awaiting quality clearance',
          completed: false
        },
        {
          status: 'Shipped',
          location: 'Carrier Pickup',
          timestamp: '',
          description: 'Will be shipped after packing',
          completed: false
        },
        {
          status: 'Delivered',
          location: 'Customer Location',
          timestamp: '',
          description: 'Package will be delivered',
          completed: false
        }
      ]
    },
    {
      id: '5',
      orderNumber: 'TRK-2025-005',
      salesOrderNumber: 'SO-2025-122',
      customerName: 'Adani Ports',
      customerPhone: '+91 98765 43213',
      customerEmail: 'logistics@adaniports.com',
      shippingAddress: {
        street: 'Mundra Port Container Terminal',
        city: 'Mundra',
        state: 'Gujarat',
        pincode: '370421'
      },
      orderDate: '2025-10-20',
      expectedDeliveryDate: '2025-10-27',
      currentStatus: 'order_placed',
      currentLocation: 'Order Processing - Surat',
      itemsCount: 120,
      totalAmount: 675000,
      estimatedDelivery: '2025-10-27 by 6:00 PM',
      deliveryProgress: 10,
      lastUpdated: '2025-10-20T11:00:00',
      trackingEvents: [
        {
          status: 'Order Placed',
          location: 'Manufacturing Facility - Surat',
          timestamp: '2025-10-20T11:00:00',
          description: 'Order received and confirmed',
          completed: false
        },
        {
          status: 'Production Started',
          location: 'Manufacturing Facility - Surat',
          timestamp: '',
          description: 'Production will start soon',
          completed: false
        },
        {
          status: 'Quality Check',
          location: 'Quality Control Dept - Surat',
          timestamp: '',
          description: 'Pending production completion',
          completed: false
        },
        {
          status: 'Packed & Ready',
          location: 'Warehouse - Surat',
          timestamp: '',
          description: 'Awaiting quality clearance',
          completed: false
        },
        {
          status: 'Shipped',
          location: 'Carrier Pickup',
          timestamp: '',
          description: 'Will be shipped after packing',
          completed: false
        },
        {
          status: 'Delivered',
          location: 'Customer Location',
          timestamp: '',
          description: 'Package will be delivered',
          completed: false
        }
      ]
    }
  ];

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
