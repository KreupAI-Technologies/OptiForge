'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  Truck,
  MapPin,
  Calendar,
  IndianRupee,
  Package,
  Clock,
  User,
  Phone,
  Navigation,
  AlertCircle,
  CheckCircle,
  XCircle,
  RotateCw
} from 'lucide-react';
import { salesPagesService } from '@/services/sales-pages.service';

interface ShippedOrder {
  id: string;
  orderNumber: string;
  salesOrderNumber: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  priority: 'normal' | 'high' | 'urgent';
  shippedDate: string;
  expectedDeliveryDate: string;
  estimatedDeliveryDate: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  deliveryMethod: 'standard' | 'express' | 'same_day';
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  currentLocation: string;
  deliveryStatus: 'in_transit' | 'out_for_delivery' | 'delayed' | 'attempted' | 'returning';
  delayReason?: string;
  itemsCount: number;
  weight: number;
  lastUpdate: string;
  deliveryProgress: number;
  expectedDeliveryTime?: string;
  deliveryAttempts?: number;
  signatureRequired: boolean;
  insuranceValue?: number;
}

export default function ShippedOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedDeliveryStatus, setSelectedDeliveryStatus] = useState<string>('all');
  const [selectedCarrier, setSelectedCarrier] = useState<string>('all');

  const orders: ShippedOrder[] = [
    {
      id: '1',
      orderNumber: 'SHP-2025-001',
      salesOrderNumber: 'SO-2025-078',
      customerName: 'Tata Motors Limited',
      customerPhone: '+91 98765 43210',
      totalAmount: 1245000,
      priority: 'urgent',
      shippedDate: '2025-10-18',
      expectedDeliveryDate: '2025-10-22',
      estimatedDeliveryDate: '2025-10-22',
      shippingAddress: {
        street: 'Tata Motors Plant, Sanand',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '382170'
      },
      deliveryMethod: 'express',
      carrier: 'Blue Dart Express',
      trackingNumber: 'BD123456789IN',
      trackingUrl: 'https://bluedart.com/track/BD123456789IN',
      currentLocation: 'Ahmedabad Hub - Out for Delivery',
      deliveryStatus: 'out_for_delivery',
      itemsCount: 250,
      weight: 1500,
      lastUpdate: '2025-10-20T08:30:00',
      deliveryProgress: 85,
      expectedDeliveryTime: '2:00 PM - 4:00 PM',
      signatureRequired: true,
      insuranceValue: 1245000
    },
    {
      id: '2',
      orderNumber: 'SHP-2025-002',
      salesOrderNumber: 'SO-2025-082',
      customerName: 'Larsen & Toubro',
      customerPhone: '+91 98765 43211',
      totalAmount: 856000,
      priority: 'high',
      shippedDate: '2025-10-17',
      expectedDeliveryDate: '2025-10-21',
      estimatedDeliveryDate: '2025-10-21',
      shippingAddress: {
        street: 'L&T Construction Site, GIFT City',
        city: 'Gandhinagar',
        state: 'Gujarat',
        pincode: '382355'
      },
      deliveryMethod: 'standard',
      carrier: 'DTDC Courier',
      trackingNumber: 'DTDC987654321IN',
      trackingUrl: 'https://dtdc.com/track/DTDC987654321IN',
      currentLocation: 'Gandhinagar Sorting Center',
      deliveryStatus: 'in_transit',
      itemsCount: 180,
      weight: 1200,
      lastUpdate: '2025-10-20T06:15:00',
      deliveryProgress: 65,
      signatureRequired: true,
      insuranceValue: 856000
    },
    {
      id: '3',
      orderNumber: 'SHP-2025-003',
      salesOrderNumber: 'SO-2025-075',
      customerName: 'Reliance Industries',
      customerPhone: '+91 98765 43212',
      totalAmount: 2340000,
      priority: 'urgent',
      shippedDate: '2025-10-16',
      expectedDeliveryDate: '2025-10-19',
      estimatedDeliveryDate: '2025-10-21',
      shippingAddress: {
        street: 'Reliance Refinery Complex',
        city: 'Jamnagar',
        state: 'Gujarat',
        pincode: '361280'
      },
      deliveryMethod: 'express',
      carrier: 'FedEx India',
      trackingNumber: 'FDX456789123IN',
      trackingUrl: 'https://fedex.com/track/FDX456789123IN',
      currentLocation: 'Rajkot Transit Hub',
      deliveryStatus: 'delayed',
      delayReason: 'Weather conditions - Heavy rain in transit route',
      itemsCount: 400,
      weight: 2500,
      lastUpdate: '2025-10-20T05:45:00',
      deliveryProgress: 55,
      signatureRequired: true,
      insuranceValue: 2340000
    },
    {
      id: '4',
      orderNumber: 'SHP-2025-004',
      salesOrderNumber: 'SO-2025-088',
      customerName: 'Adani Ports',
      customerPhone: '+91 98765 43213',
      totalAmount: 675000,
      priority: 'normal',
      shippedDate: '2025-10-19',
      expectedDeliveryDate: '2025-10-24',
      estimatedDeliveryDate: '2025-10-24',
      shippingAddress: {
        street: 'Mundra Port Container Terminal',
        city: 'Mundra',
        state: 'Gujarat',
        pincode: '370421'
      },
      deliveryMethod: 'standard',
      carrier: 'Delhivery',
      trackingNumber: 'DLV789456123IN',
      trackingUrl: 'https://delhivery.com/track/DLV789456123IN',
      currentLocation: 'Bhuj Distribution Center',
      deliveryStatus: 'in_transit',
      itemsCount: 120,
      weight: 800,
      lastUpdate: '2025-10-20T07:00:00',
      deliveryProgress: 40,
      signatureRequired: false
    },
    {
      id: '5',
      orderNumber: 'SHP-2025-005',
      salesOrderNumber: 'SO-2025-092',
      customerName: 'Mahindra & Mahindra',
      customerPhone: '+91 98765 43214',
      totalAmount: 445000,
      priority: 'high',
      shippedDate: '2025-10-18',
      expectedDeliveryDate: '2025-10-22',
      estimatedDeliveryDate: '2025-10-23',
      shippingAddress: {
        street: 'Mahindra Manufacturing Plant',
        city: 'Chakan',
        state: 'Maharashtra',
        pincode: '410501'
      },
      deliveryMethod: 'express',
      carrier: 'Blue Dart Express',
      trackingNumber: 'BD987654321IN',
      trackingUrl: 'https://bluedart.com/track/BD987654321IN',
      currentLocation: 'Pune Hub',
      deliveryStatus: 'in_transit',
      itemsCount: 90,
      weight: 650,
      lastUpdate: '2025-10-20T09:20:00',
      deliveryProgress: 70,
      signatureRequired: true,
      insuranceValue: 445000
    },
    {
      id: '6',
      orderNumber: 'SHP-2025-006',
      salesOrderNumber: 'SO-2025-096',
      customerName: 'Godrej Industries',
      customerPhone: '+91 98765 43215',
      totalAmount: 325000,
      priority: 'normal',
      shippedDate: '2025-10-17',
      expectedDeliveryDate: '2025-10-21',
      estimatedDeliveryDate: '2025-10-21',
      shippingAddress: {
        street: 'Godrej Complex, Vikhroli',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400079'
      },
      deliveryMethod: 'standard',
      carrier: 'India Post',
      trackingNumber: 'IP123789456IN',
      trackingUrl: 'https://indiapost.gov.in/track/IP123789456IN',
      currentLocation: 'Mumbai Central Post Office',
      deliveryStatus: 'attempted',
      delayReason: 'Delivery attempted - Recipient not available',
      itemsCount: 60,
      weight: 400,
      lastUpdate: '2025-10-20T11:30:00',
      deliveryProgress: 90,
      deliveryAttempts: 1,
      signatureRequired: true
    },
    {
      id: '7',
      orderNumber: 'SHP-2025-007',
      salesOrderNumber: 'SO-2025-099',
      customerName: 'Bharat Heavy Electricals',
      customerPhone: '+91 98765 43216',
      totalAmount: 1890000,
      priority: 'high',
      shippedDate: '2025-10-19',
      expectedDeliveryDate: '2025-10-23',
      estimatedDeliveryDate: '2025-10-23',
      shippingAddress: {
        street: 'BHEL Township',
        city: 'Bhopal',
        state: 'Madhya Pradesh',
        pincode: '462022'
      },
      deliveryMethod: 'express',
      carrier: 'DHL Express',
      trackingNumber: 'DHL456123789IN',
      trackingUrl: 'https://dhl.com/track/DHL456123789IN',
      currentLocation: 'Indore Transit Hub',
      deliveryStatus: 'in_transit',
      itemsCount: 320,
      weight: 1800,
      lastUpdate: '2025-10-20T08:00:00',
      deliveryProgress: 50,
      signatureRequired: true,
      insuranceValue: 1890000
    },
    {
      id: '8',
      orderNumber: 'SHP-2025-008',
      salesOrderNumber: 'SO-2025-085',
      customerName: 'Hindustan Zinc Limited',
      customerPhone: '+91 98765 43217',
      totalAmount: 567000,
      priority: 'normal',
      shippedDate: '2025-10-15',
      expectedDeliveryDate: '2025-10-19',
      estimatedDeliveryDate: '2025-10-22',
      shippingAddress: {
        street: 'Zinc Smelter Complex',
        city: 'Udaipur',
        state: 'Rajasthan',
        pincode: '313001'
      },
      deliveryMethod: 'standard',
      carrier: 'DTDC Courier',
      trackingNumber: 'DTDC321654987IN',
      trackingUrl: 'https://dtdc.com/track/DTDC321654987IN',
      currentLocation: 'Customer requested return - Address incorrect',
      deliveryStatus: 'returning',
      delayReason: 'Incorrect delivery address - Returning to origin',
      itemsCount: 100,
      weight: 750,
      lastUpdate: '2025-10-20T10:15:00',
      deliveryProgress: 30,
      deliveryAttempts: 2,
      signatureRequired: true,
      insuranceValue: 567000
    }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.salesOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = selectedPriority === 'all' || order.priority === selectedPriority;
    const matchesStatus = selectedDeliveryStatus === 'all' || order.deliveryStatus === selectedDeliveryStatus;
    const matchesCarrier = selectedCarrier === 'all' || order.carrier === selectedCarrier;

    return matchesSearch && matchesPriority && matchesStatus && matchesCarrier;
  });

  const inTransit = orders.filter(o => o.deliveryStatus === 'in_transit').length;
  const totalValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const outForDelivery = orders.filter(o => o.deliveryStatus === 'out_for_delivery').length;
  const delayed = orders.filter(o => o.deliveryStatus === 'delayed' || o.deliveryStatus === 'attempted' || o.deliveryStatus === 'returning').length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'out_for_delivery': return 'bg-green-100 text-green-700';
      case 'in_transit': return 'bg-blue-100 text-blue-700';
      case 'delayed': return 'bg-yellow-100 text-yellow-700';
      case 'attempted': return 'bg-orange-100 text-orange-700';
      case 'returning': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDeliveryStatusIcon = (status: string) => {
    switch (status) {
      case 'out_for_delivery': return <Truck className="w-4 h-4" />;
      case 'in_transit': return <Navigation className="w-4 h-4" />;
      case 'delayed': return <AlertCircle className="w-4 h-4" />;
      case 'attempted': return <Clock className="w-4 h-4" />;
      case 'returning': return <RotateCw className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getDeliveryStatusLabel = (status: string) => {
    switch (status) {
      case 'out_for_delivery': return 'Out for Delivery';
      case 'in_transit': return 'In Transit';
      case 'delayed': return 'Delayed';
      case 'attempted': return 'Delivery Attempted';
      case 'returning': return 'Returning to Sender';
      default: return status;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 30) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const formatLastUpdate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffHours < 1) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString('en-IN');
  };

  const carriers = Array.from(new Set(orders.map(o => o.carrier)));

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 px-3 py-2">
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
              Export Report
            </button>
            <button className="px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors">
              Track All
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors">
              Update Tracking
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">In Transit</p>
                <p className="text-3xl font-bold mt-2">{inTransit}</p>
                <p className="text-blue-100 text-xs mt-1">On the way</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Navigation className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Value</p>
                <p className="text-3xl font-bold mt-2">₹{(totalValue / 100000).toFixed(1)}L</p>
                <p className="text-purple-100 text-xs mt-1">{orders.length} shipments</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <IndianRupee className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Out for Delivery</p>
                <p className="text-3xl font-bold mt-2">{outForDelivery}</p>
                <p className="text-green-100 text-xs mt-1">Final leg</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Truck className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Issues</p>
                <p className="text-3xl font-bold mt-2">{delayed}</p>
                <p className="text-yellow-100 text-xs mt-1">Delayed/Attempted</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <AlertCircle className="w-8 h-8" />
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
                placeholder="Search orders or tracking..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
            </select>

            <select
              value={selectedDeliveryStatus}
              onChange={(e) => setSelectedDeliveryStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Delivery Status</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delayed">Delayed</option>
              <option value="attempted">Attempted</option>
              <option value="returning">Returning</option>
            </select>

            <select
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Carriers</option>
              {carriers.map(carrier => (
                <option key={carrier} value={carrier}>{carrier}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredOrders.map((order) => {
            const isDelayed = order.deliveryStatus === 'delayed' || order.deliveryStatus === 'attempted' || order.deliveryStatus === 'returning';

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
                    {isDelayed && (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>

                  {/* Delivery Status */}
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${getDeliveryStatusColor(order.deliveryStatus)}`}>
                    {getDeliveryStatusIcon(order.deliveryStatus)}
                    <span className="font-medium text-sm">{getDeliveryStatusLabel(order.deliveryStatus)}</span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Delivery Progress</span>
                      <span className="font-semibold text-gray-900">{order.deliveryProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${getProgressColor(order.deliveryProgress)}`}
                        style={{ width: `${order.deliveryProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Customer & Location */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{order.customerPhone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                        <p className="text-xs text-gray-500">{order.shippingAddress.pincode}</p>
                      </div>
                    </div>
                  </div>

                  {/* Current Location */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Navigation className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Current Location</p>
                        <p className="text-sm text-blue-700 mt-1">{order.currentLocation}</p>
                        <p className="text-xs text-blue-600 mt-1">Updated {formatLastUpdate(order.lastUpdate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Info */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-600">Carrier</p>
                      <p className="font-medium text-gray-900">{order.carrier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tracking #</p>
                      <p className="font-medium text-gray-900 text-sm">{order.trackingNumber}</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Shipped: {new Date(order.shippedDate).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={order.estimatedDeliveryDate !== order.expectedDeliveryDate ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        ETA: {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Expected Delivery Time */}
                  {order.expectedDeliveryTime && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        <strong>Expected delivery today:</strong> {order.expectedDeliveryTime}
                      </p>
                    </div>
                  )}

                  {/* Delay Reason */}
                  {order.delayReason && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                          <strong>Issue:</strong> {order.delayReason}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Delivery Attempts */}
                  {order.deliveryAttempts && order.deliveryAttempts > 0 && (
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <RotateCw className="w-4 h-4" />
                      <span>Delivery attempted {order.deliveryAttempts} {order.deliveryAttempts === 1 ? 'time' : 'times'}</span>
                    </div>
                  )}

                  {/* Order Details */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-semibold text-gray-900">₹{(order.totalAmount / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Items</p>
                      <p className="font-semibold text-gray-900">{order.itemsCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Weight</p>
                      <p className="font-semibold text-gray-900">{order.weight} kg</p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    {order.signatureRequired && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Signature Required</span>
                      </div>
                    )}
                    {order.insuranceValue && (
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />
                        <span>Insured: ₹{(order.insuranceValue / 1000).toFixed(0)}K</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors text-center"
                    >
                      Track Shipment
                    </a>
                    <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      Contact Carrier
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Truck className="w-16 h-16 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Shipments Found</h3>
            <p className="text-gray-600">No shipments match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
