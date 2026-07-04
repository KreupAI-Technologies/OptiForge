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
  IndianRupee,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Phone,
  Mail
} from 'lucide-react';
import { salesPagesService } from '@/services/sales-pages.service';

interface ReadyOrder {
  id: string;
  orderNumber: string;
  salesOrderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  priority: 'normal' | 'high' | 'urgent';
  paymentStatus: 'paid' | 'partially_paid' | 'pending' | 'cod';
  readyDate: string;
  expectedDeliveryDate: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  deliveryMethod: 'standard' | 'express' | 'same_day' | 'customer_pickup';
  packagingStatus: 'pending' | 'in_progress' | 'completed';
  itemsCount: number;
  weight: number;
  dimensions: string;
  shippingCharges: number;
  trackingReady: boolean;
  notes?: string;
}

export default function ReadyOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [selectedPackagingStatus, setSelectedPackagingStatus] = useState<string>('all');

  const orders: ReadyOrder[] = [
    {
      id: '1',
      orderNumber: 'RDY-2025-001',
      salesOrderNumber: 'SO-2025-089',
      customerName: 'Tata Motors Limited',
      customerEmail: 'procurement@tatamotors.com',
      customerPhone: '+91 98765 43210',
      totalAmount: 1245000,
      priority: 'urgent',
      paymentStatus: 'paid',
      readyDate: '2025-10-18',
      expectedDeliveryDate: '2025-10-22',
      shippingAddress: {
        street: 'Tata Motors Plant, Sanand',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '382170'
      },
      deliveryMethod: 'express',
      packagingStatus: 'completed',
      itemsCount: 250,
      weight: 1500,
      dimensions: '120x80x100 cm',
      shippingCharges: 15000,
      trackingReady: true,
      notes: 'Fragile items - Handle with care'
    },
    {
      id: '2',
      orderNumber: 'RDY-2025-002',
      salesOrderNumber: 'SO-2025-091',
      customerName: 'Larsen & Toubro',
      customerEmail: 'orders@lnt.com',
      customerPhone: '+91 98765 43211',
      totalAmount: 856000,
      priority: 'high',
      paymentStatus: 'paid',
      readyDate: '2025-10-19',
      expectedDeliveryDate: '2025-10-23',
      shippingAddress: {
        street: 'L&T Construction Site, GIFT City',
        city: 'Gandhinagar',
        state: 'Gujarat',
        pincode: '382355'
      },
      deliveryMethod: 'standard',
      packagingStatus: 'completed',
      itemsCount: 180,
      weight: 1200,
      dimensions: '100x70x90 cm',
      shippingCharges: 12000,
      trackingReady: true
    },
    {
      id: '3',
      orderNumber: 'RDY-2025-003',
      salesOrderNumber: 'SO-2025-095',
      customerName: 'Reliance Industries',
      customerEmail: 'procurement@ril.com',
      customerPhone: '+91 98765 43212',
      totalAmount: 2340000,
      priority: 'urgent',
      paymentStatus: 'paid',
      readyDate: '2025-10-20',
      expectedDeliveryDate: '2025-10-21',
      shippingAddress: {
        street: 'Reliance Refinery Complex',
        city: 'Jamnagar',
        state: 'Gujarat',
        pincode: '361280'
      },
      deliveryMethod: 'same_day',
      packagingStatus: 'in_progress',
      itemsCount: 400,
      weight: 2500,
      dimensions: '150x100x120 cm',
      shippingCharges: 25000,
      trackingReady: false,
      notes: 'Rush delivery required'
    },
    {
      id: '4',
      orderNumber: 'RDY-2025-004',
      salesOrderNumber: 'SO-2025-098',
      customerName: 'Adani Ports',
      customerEmail: 'logistics@adaniports.com',
      customerPhone: '+91 98765 43213',
      totalAmount: 675000,
      priority: 'normal',
      paymentStatus: 'cod',
      readyDate: '2025-10-20',
      expectedDeliveryDate: '2025-10-25',
      shippingAddress: {
        street: 'Mundra Port Container Terminal',
        city: 'Mundra',
        state: 'Gujarat',
        pincode: '370421'
      },
      deliveryMethod: 'standard',
      packagingStatus: 'completed',
      itemsCount: 120,
      weight: 800,
      dimensions: '90x60x70 cm',
      shippingCharges: 10000,
      trackingReady: true,
      notes: 'COD - Collect ₹6,75,000'
    },
    {
      id: '5',
      orderNumber: 'RDY-2025-005',
      salesOrderNumber: 'SO-2025-102',
      customerName: 'Mahindra & Mahindra',
      customerEmail: 'purchase@mahindra.com',
      customerPhone: '+91 98765 43214',
      totalAmount: 445000,
      priority: 'high',
      paymentStatus: 'paid',
      readyDate: '2025-10-20',
      expectedDeliveryDate: '2025-10-24',
      shippingAddress: {
        street: 'Mahindra Manufacturing Plant',
        city: 'Chakan',
        state: 'Maharashtra',
        pincode: '410501'
      },
      deliveryMethod: 'express',
      packagingStatus: 'completed',
      itemsCount: 90,
      weight: 650,
      dimensions: '80x60x70 cm',
      shippingCharges: 8500,
      trackingReady: true
    },
    {
      id: '6',
      orderNumber: 'RDY-2025-006',
      salesOrderNumber: 'SO-2025-104',
      customerName: 'Godrej Industries',
      customerEmail: 'orders@godrej.com',
      customerPhone: '+91 98765 43215',
      totalAmount: 325000,
      priority: 'normal',
      paymentStatus: 'partially_paid',
      readyDate: '2025-10-21',
      expectedDeliveryDate: '2025-10-26',
      shippingAddress: {
        street: 'Godrej Complex, Vikhroli',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400079'
      },
      deliveryMethod: 'customer_pickup',
      packagingStatus: 'pending',
      itemsCount: 60,
      weight: 400,
      dimensions: '70x50x60 cm',
      shippingCharges: 0,
      trackingReady: false,
      notes: 'Customer pickup scheduled for 2025-10-26'
    },
    {
      id: '7',
      orderNumber: 'RDY-2025-007',
      salesOrderNumber: 'SO-2025-107',
      customerName: 'Bharat Heavy Electricals',
      customerEmail: 'procurement@bhel.in',
      customerPhone: '+91 98765 43216',
      totalAmount: 1890000,
      priority: 'high',
      paymentStatus: 'paid',
      readyDate: '2025-10-21',
      expectedDeliveryDate: '2025-10-24',
      shippingAddress: {
        street: 'BHEL Township',
        city: 'Bhopal',
        state: 'Madhya Pradesh',
        pincode: '462022'
      },
      deliveryMethod: 'express',
      packagingStatus: 'in_progress',
      itemsCount: 320,
      weight: 1800,
      dimensions: '130x90x110 cm',
      shippingCharges: 18000,
      trackingReady: false
    },
    {
      id: '8',
      orderNumber: 'RDY-2025-008',
      salesOrderNumber: 'SO-2025-110',
      customerName: 'Hindustan Zinc Limited',
      customerEmail: 'purchase@hzl.com',
      customerPhone: '+91 98765 43217',
      totalAmount: 567000,
      priority: 'normal',
      paymentStatus: 'pending',
      readyDate: '2025-10-22',
      expectedDeliveryDate: '2025-10-27',
      shippingAddress: {
        street: 'Zinc Smelter Complex',
        city: 'Udaipur',
        state: 'Rajasthan',
        pincode: '313001'
      },
      deliveryMethod: 'standard',
      packagingStatus: 'pending',
      itemsCount: 100,
      weight: 750,
      dimensions: '85x65x75 cm',
      shippingCharges: 9500,
      trackingReady: false,
      notes: 'Payment pending - Hold delivery until payment received'
    }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.salesOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = selectedPriority === 'all' || order.priority === selectedPriority;
    const matchesPayment = selectedPaymentStatus === 'all' || order.paymentStatus === selectedPaymentStatus;
    const matchesPackaging = selectedPackagingStatus === 'all' || order.packagingStatus === selectedPackagingStatus;

    return matchesSearch && matchesPriority && matchesPayment && matchesPackaging;
  });

  const readyForDispatch = orders.filter(o => o.packagingStatus === 'completed' && o.trackingReady).length;
  const totalValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const urgentOrders = orders.filter(o => o.priority === 'urgent').length;
  const packagingPending = orders.filter(o => o.packagingStatus === 'pending' || o.packagingStatus === 'in_progress').length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'partially_paid': return 'bg-yellow-100 text-yellow-700';
      case 'pending': return 'bg-red-100 text-red-700';
      case 'cod': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPackagingStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDeliveryMethodLabel = (method: string) => {
    switch (method) {
      case 'same_day': return 'Same Day';
      case 'express': return 'Express';
      case 'standard': return 'Standard';
      case 'customer_pickup': return 'Customer Pickup';
      default: return method;
    }
  };

  const getDaysUntilDelivery = (deliveryDate: string) => {
    const today = new Date();
    const delivery = new Date(deliveryDate);
    const diffTime = delivery.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-3 py-2">
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
              Export List
            </button>
            <button className="px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors">
              Print Labels
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors">
              Generate Invoices
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Ready for Dispatch</p>
                <p className="text-3xl font-bold mt-2">{readyForDispatch}</p>
                <p className="text-green-100 text-xs mt-1">Fully packaged & ready</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Value</p>
                <p className="text-3xl font-bold mt-2">₹{(totalValue / 100000).toFixed(1)}L</p>
                <p className="text-blue-100 text-xs mt-1">{orders.length} orders ready</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <IndianRupee className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Urgent Orders</p>
                <p className="text-3xl font-bold mt-2">{urgentOrders}</p>
                <p className="text-red-100 text-xs mt-1">Requires immediate dispatch</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <AlertCircle className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Packaging Pending</p>
                <p className="text-3xl font-bold mt-2">{packagingPending}</p>
                <p className="text-yellow-100 text-xs mt-1">In progress or pending</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Package className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders or customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
            </select>

            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Payment Status</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="pending">Pending</option>
              <option value="cod">COD</option>
            </select>

            <select
              value={selectedPackagingStatus}
              onChange={(e) => setSelectedPackagingStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Packaging Status</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredOrders.map((order) => {
            const daysUntilDelivery = getDaysUntilDelivery(order.expectedDeliveryDate);
            const isUrgentDelivery = daysUntilDelivery <= 2;

            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                          {order.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">SO: {order.salesOrderNumber}</p>
                    </div>
                    {order.trackingReady && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{order.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{order.customerEmail}</span>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-600">
                      <p>{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="text-lg font-semibold text-gray-900">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Items</p>
                      <p className="text-lg font-semibold text-gray-900">{order.itemsCount} units</p>
                    </div>
                  </div>

                  {/* Package Details */}
                  <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium text-gray-900">{order.weight} kg</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Dimensions:</span>
                      <span className="font-medium text-gray-900">{order.dimensions}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="font-medium text-gray-900">
                        {order.shippingCharges > 0 ? `₹${order.shippingCharges.toLocaleString('en-IN')}` : 'Free'}
                      </span>
                    </div>
                  </div>

                  {/* Status Row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPackagingStatusColor(order.packagingStatus)}`}>
                      Packaging: {order.packagingStatus.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      {getDeliveryMethodLabel(order.deliveryMethod)}
                    </span>
                  </div>

                  {/* Delivery Timeline */}
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Ready: {new Date(order.readyDate).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={isUrgentDelivery ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        Delivery: {new Date(order.expectedDeliveryDate).toLocaleDateString('en-IN')}
                        {isUrgentDelivery && ' ⚠️'}
                      </span>
                    </div>
                  </div>

                  {daysUntilDelivery > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Days until delivery</span>
                        <span className={`font-semibold ${isUrgentDelivery ? 'text-red-600' : 'text-gray-900'}`}>
                          {daysUntilDelivery} {daysUntilDelivery === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {order.notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> {order.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    {order.packagingStatus === 'completed' && order.trackingReady ? (
                      <>
                        <button className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors">
                          Dispatch Order
                        </button>
                        <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                          Print Label
                        </button>
                      </>
                    ) : order.packagingStatus === 'in_progress' ? (
                      <>
                        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Check Packaging
                        </button>
                        <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                          View Details
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                          Start Packaging
                        </button>
                        <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                          View Details
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600">No orders match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
