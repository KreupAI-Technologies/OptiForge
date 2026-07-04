'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  CheckCircle,
  MapPin,
  Calendar,
  IndianRupee,
  Package,
  Clock,
  User,
  Phone,
  Star,
  FileText,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Download,
  Truck
} from 'lucide-react';
import { salesPagesService } from '@/services/sales-pages.service';

interface DeliveredOrder {
  id: string;
  orderNumber: string;
  salesOrderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalAmount: number;
  priority: 'normal' | 'high' | 'urgent';
  shippedDate: string;
  deliveredDate: string;
  deliveryTime: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  deliveryMethod: 'standard' | 'express' | 'same_day' | 'customer_pickup';
  carrier: string;
  trackingNumber: string;
  itemsCount: number;
  weight: number;
  deliveryStatus: 'delivered' | 'partially_delivered' | 'damaged' | 'returned';
  signedBy: string;
  signatureAvailable: boolean;
  proofOfDelivery: boolean;
  customerRating?: number;
  customerFeedback?: string;
  deliveryIssues?: string;
  transitDays: number;
  onTimeDelivery: boolean;
  invoiceGenerated: boolean;
  paymentReceived: boolean;
  warrantyActivated: boolean;
}

export default function DeliveredOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedDeliveryStatus, setSelectedDeliveryStatus] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');

  const orders: DeliveredOrder[] = [
    {
      id: '1',
      orderNumber: 'DLV-2025-001',
      salesOrderNumber: 'SO-2025-056',
      customerName: 'Tata Motors Limited',
      customerPhone: '+91 98765 43210',
      customerEmail: 'procurement@tatamotors.com',
      totalAmount: 1245000,
      priority: 'urgent',
      shippedDate: '2025-10-15',
      deliveredDate: '2025-10-18',
      deliveryTime: '2:30 PM',
      shippingAddress: {
        street: 'Tata Motors Plant, Sanand',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '382170'
      },
      deliveryMethod: 'express',
      carrier: 'Blue Dart Express',
      trackingNumber: 'BD123456789IN',
      itemsCount: 250,
      weight: 1500,
      deliveryStatus: 'delivered',
      signedBy: 'Rajesh Kumar (Procurement Manager)',
      signatureAvailable: true,
      proofOfDelivery: true,
      customerRating: 5,
      customerFeedback: 'Excellent service! Items delivered on time and in perfect condition.',
      transitDays: 3,
      onTimeDelivery: true,
      invoiceGenerated: true,
      paymentReceived: true,
      warrantyActivated: true
    },
    {
      id: '2',
      orderNumber: 'DLV-2025-002',
      salesOrderNumber: 'SO-2025-062',
      customerName: 'Larsen & Toubro',
      customerPhone: '+91 98765 43211',
      customerEmail: 'orders@lnt.com',
      totalAmount: 856000,
      priority: 'high',
      shippedDate: '2025-10-14',
      deliveredDate: '2025-10-19',
      deliveryTime: '11:15 AM',
      shippingAddress: {
        street: 'L&T Construction Site, GIFT City',
        city: 'Gandhinagar',
        state: 'Gujarat',
        pincode: '382355'
      },
      deliveryMethod: 'standard',
      carrier: 'DTDC Courier',
      trackingNumber: 'DTDC987654321IN',
      itemsCount: 180,
      weight: 1200,
      deliveryStatus: 'delivered',
      signedBy: 'Amit Patel (Site Engineer)',
      signatureAvailable: true,
      proofOfDelivery: true,
      customerRating: 4,
      customerFeedback: 'Good delivery. One day delay but items were intact.',
      transitDays: 5,
      onTimeDelivery: false,
      invoiceGenerated: true,
      paymentReceived: true,
      warrantyActivated: false
    },
    {
      id: '3',
      orderNumber: 'DLV-2025-003',
      salesOrderNumber: 'SO-2025-058',
      customerName: 'Reliance Industries',
      customerPhone: '+91 98765 43212',
      customerEmail: 'procurement@ril.com',
      totalAmount: 2340000,
      priority: 'urgent',
      shippedDate: '2025-10-13',
      deliveredDate: '2025-10-17',
      deliveryTime: '9:45 AM',
      shippingAddress: {
        street: 'Reliance Refinery Complex',
        city: 'Jamnagar',
        state: 'Gujarat',
        pincode: '361280'
      },
      deliveryMethod: 'express',
      carrier: 'FedEx India',
      trackingNumber: 'FDX456789123IN',
      itemsCount: 400,
      weight: 2500,
      deliveryStatus: 'delivered',
      signedBy: 'Vikram Shah (Operations Head)',
      signatureAvailable: true,
      proofOfDelivery: true,
      customerRating: 5,
      customerFeedback: 'Outstanding delivery service. Very professional team.',
      transitDays: 4,
      onTimeDelivery: true,
      invoiceGenerated: true,
      paymentReceived: true,
      warrantyActivated: true
    },
    {
      id: '4',
      orderNumber: 'DLV-2025-004',
      salesOrderNumber: 'SO-2025-064',
      customerName: 'Adani Ports',
      customerPhone: '+91 98765 43213',
      customerEmail: 'logistics@adaniports.com',
      totalAmount: 675000,
      priority: 'normal',
      shippedDate: '2025-10-12',
      deliveredDate: '2025-10-18',
      deliveryTime: '4:20 PM',
      shippingAddress: {
        street: 'Mundra Port Container Terminal',
        city: 'Mundra',
        state: 'Gujarat',
        pincode: '370421'
      },
      deliveryMethod: 'standard',
      carrier: 'Delhivery',
      trackingNumber: 'DLV789456123IN',
      itemsCount: 120,
      weight: 800,
      deliveryStatus: 'partially_delivered',
      signedBy: 'Suresh Menon (Warehouse Manager)',
      signatureAvailable: true,
      proofOfDelivery: true,
      customerRating: 3,
      customerFeedback: 'Partial delivery - 10 items missing. Awaiting second shipment.',
      deliveryIssues: '10 items short - Follow-up delivery scheduled',
      transitDays: 6,
      onTimeDelivery: false,
      invoiceGenerated: true,
      paymentReceived: false,
      warrantyActivated: false
    },
    {
      id: '5',
      orderNumber: 'DLV-2025-005',
      salesOrderNumber: 'SO-2025-067',
      customerName: 'Mahindra & Mahindra',
      customerPhone: '+91 98765 43214',
      customerEmail: 'purchase@mahindra.com',
      totalAmount: 445000,
      priority: 'high',
      shippedDate: '2025-10-16',
      deliveredDate: '2025-10-19',
      deliveryTime: '1:10 PM',
      shippingAddress: {
        street: 'Mahindra Manufacturing Plant',
        city: 'Chakan',
        state: 'Maharashtra',
        pincode: '410501'
      },
      deliveryMethod: 'express',
      carrier: 'Blue Dart Express',
      trackingNumber: 'BD987654321IN',
      itemsCount: 90,
      weight: 650,
      deliveryStatus: 'delivered',
      signedBy: 'Priya Sharma (Quality Manager)',
      signatureAvailable: true,
      proofOfDelivery: true,
      customerRating: 5,
      transitDays: 3,
      onTimeDelivery: true,
      invoiceGenerated: true,
      paymentReceived: true,
      warrantyActivated: true
    },
    {
      id: '6',
      orderNumber: 'DLV-2025-006',
      salesOrderNumber: 'SO-2025-070',
      customerName: 'Godrej Industries',
      customerPhone: '+91 98765 43215',
      customerEmail: 'orders@godrej.com',
      totalAmount: 325000,
      priority: 'normal',
      shippedDate: '2025-10-11',
      deliveredDate: '2025-10-17',
      deliveryTime: '10:30 AM',
      shippingAddress: {
        street: 'Godrej Complex, Vikhroli',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400079'
      },
      deliveryMethod: 'standard',
      carrier: 'India Post',
      trackingNumber: 'IP123789456IN',
      itemsCount: 60,
      weight: 400,
      deliveryStatus: 'damaged',
      signedBy: 'Neha Desai (Receiving Clerk)',
      signatureAvailable: true,
      proofOfDelivery: true,
      customerRating: 2,
      customerFeedback: 'Multiple items damaged during transit. Poor packaging.',
      deliveryIssues: '5 items damaged - Replacement requested',
      transitDays: 6,
      onTimeDelivery: true,
      invoiceGenerated: true,
      paymentReceived: false,
      warrantyActivated: false
    },
    {
      id: '7',
      orderNumber: 'DLV-2025-007',
      salesOrderNumber: 'SO-2025-073',
      customerName: 'Bharat Heavy Electricals',
      customerPhone: '+91 98765 43216',
      customerEmail: 'procurement@bhel.in',
      totalAmount: 1890000,
      priority: 'high',
      shippedDate: '2025-10-14',
      deliveredDate: '2025-10-18',
      deliveryTime: '3:45 PM',
      shippingAddress: {
        street: 'BHEL Township',
        city: 'Bhopal',
        state: 'Madhya Pradesh',
        pincode: '462022'
      },
      deliveryMethod: 'express',
      carrier: 'DHL Express',
      trackingNumber: 'DHL456123789IN',
      itemsCount: 320,
      weight: 1800,
      deliveryStatus: 'delivered',
      signedBy: 'Arun Verma (Stores Superintendent)',
      signatureAvailable: true,
      proofOfDelivery: true,
      customerRating: 4,
      customerFeedback: 'Satisfactory delivery. Good handling of heavy items.',
      transitDays: 4,
      onTimeDelivery: true,
      invoiceGenerated: true,
      paymentReceived: true,
      warrantyActivated: true
    },
    {
      id: '8',
      orderNumber: 'DLV-2025-008',
      salesOrderNumber: 'SO-2025-069',
      customerName: 'Hindustan Zinc Limited',
      customerPhone: '+91 98765 43217',
      customerEmail: 'purchase@hzl.com',
      totalAmount: 567000,
      priority: 'normal',
      shippedDate: '2025-10-10',
      deliveredDate: '2025-10-15',
      deliveryTime: '11:50 AM',
      shippingAddress: {
        street: 'Zinc Smelter Complex',
        city: 'Udaipur',
        state: 'Rajasthan',
        pincode: '313001'
      },
      deliveryMethod: 'customer_pickup',
      carrier: 'Self Pickup',
      trackingNumber: 'N/A',
      itemsCount: 100,
      weight: 750,
      deliveryStatus: 'delivered',
      signedBy: 'Karan Singh (Transport Coordinator)',
      signatureAvailable: true,
      proofOfDelivery: true,
      customerRating: 5,
      customerFeedback: 'Smooth pickup process. Everything ready on time.',
      transitDays: 0,
      onTimeDelivery: true,
      invoiceGenerated: true,
      paymentReceived: true,
      warrantyActivated: false
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
    const matchesRating = selectedRating === 'all' ||
      (selectedRating === '5' && order.customerRating === 5) ||
      (selectedRating === '4' && order.customerRating === 4) ||
      (selectedRating === '3' && order.customerRating && order.customerRating <= 3);

    return matchesSearch && matchesPriority && matchesStatus && matchesRating;
  });

  const totalDelivered = orders.filter(o => o.deliveryStatus === 'delivered').length;
  const totalValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const onTimeDeliveries = orders.filter(o => o.onTimeDelivery).length;
  const avgRating = orders.filter(o => o.customerRating).reduce((sum, o) => sum + (o.customerRating || 0), 0) / orders.filter(o => o.customerRating).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'partially_delivered': return 'bg-yellow-100 text-yellow-700';
      case 'damaged': return 'bg-red-100 text-red-700';
      case 'returned': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDeliveryStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'partially_delivered': return 'Partially Delivered';
      case 'damaged': return 'Damaged Items';
      case 'returned': return 'Returned';
      default: return status;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 px-3 py-2">
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
              Customer Feedback
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors">
              Generate Analytics
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Delivered</p>
                <p className="text-3xl font-bold mt-2">{totalDelivered}</p>
                <p className="text-green-100 text-xs mt-1">Successfully completed</p>
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
                <p className="text-blue-100 text-xs mt-1">{orders.length} orders</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <IndianRupee className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">On-Time Delivery</p>
                <p className="text-3xl font-bold mt-2">{onTimeDeliveries}</p>
                <p className="text-purple-100 text-xs mt-1">{((onTimeDeliveries/orders.length)*100).toFixed(0)}% success rate</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Clock className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Avg Rating</p>
                <p className="text-3xl font-bold mt-2">{avgRating.toFixed(1)}</p>
                <p className="text-yellow-100 text-xs mt-1">Customer satisfaction</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Star className="w-8 h-8" />
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
            </select>

            <select
              value={selectedDeliveryStatus}
              onChange={(e) => setSelectedDeliveryStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Delivery Status</option>
              <option value="delivered">Delivered</option>
              <option value="partially_delivered">Partially Delivered</option>
              <option value="damaged">Damaged</option>
              <option value="returned">Returned</option>
            </select>

            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars or Below</option>
            </select>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredOrders.map((order) => {
            const hasIssues = order.deliveryStatus !== 'delivered' || !order.onTimeDelivery;
            const needsAction = order.deliveryStatus === 'damaged' || order.deliveryStatus === 'partially_delivered';

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
                    <CheckCircle className={`w-6 h-6 ${order.deliveryStatus === 'delivered' ? 'text-green-500' : 'text-yellow-500'}`} />
                  </div>

                  {/* Delivery Status */}
                  <div className={`flex items-center justify-between p-3 rounded-lg ${getDeliveryStatusColor(order.deliveryStatus)}`}>
                    <span className="font-medium text-sm">{getDeliveryStatusLabel(order.deliveryStatus)}</span>
                    {order.onTimeDelivery ? (
                      <div className="flex items-center gap-1 text-xs">
                        <ThumbsUp className="w-3 h-3" />
                        <span>On Time</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs">
                        <ThumbsDown className="w-3 h-3" />
                        <span>Delayed</span>
                      </div>
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
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                        <p className="text-xs text-gray-500">{order.shippingAddress.pincode}</p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Delivered Successfully</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-green-700">
                      <p><strong>Date:</strong> {new Date(order.deliveredDate).toLocaleDateString('en-IN')} at {order.deliveryTime}</p>
                      <p><strong>Signed by:</strong> {order.signedBy}</p>
                      {order.transitDays > 0 && (
                        <p><strong>Transit time:</strong> {order.transitDays} days</p>
                      )}
                    </div>
                  </div>

                  {/* Customer Rating & Feedback */}
                  {order.customerRating && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-yellow-900">Customer Rating</span>
                        {renderStars(order.customerRating)}
                      </div>
                      {order.customerFeedback && (
                        <p className="text-sm text-yellow-800 italic">"{order.customerFeedback}"</p>
                      )}
                    </div>
                  )}

                  {/* Delivery Issues */}
                  {order.deliveryIssues && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-900">Delivery Issue</p>
                          <p className="text-sm text-red-700 mt-1">{order.deliveryIssues}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Details */}
                  <div className="grid grid-cols-3 gap-2">
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

                  {/* Tracking Info */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Carrier</p>
                      <p className="font-medium text-gray-900">{order.carrier}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Method</p>
                      <p className="font-medium text-gray-900 capitalize">{order.deliveryMethod.replace('_', ' ')}</p>
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {order.invoiceGenerated && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        <FileText className="w-3 h-3" />
                        <span>Invoice Generated</span>
                      </div>
                    )}
                    {order.paymentReceived && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        <span>Payment Received</span>
                      </div>
                    )}
                    {order.warrantyActivated && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        <span>Warranty Active</span>
                      </div>
                    )}
                    {order.proofOfDelivery && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        <Download className="w-3 h-3" />
                        <span>POD Available</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    {needsAction ? (
                      <>
                        <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                          Resolve Issue
                        </button>
                        <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                          Contact Customer
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors">
                          View Details
                        </button>
                        <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                          Download POD
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Delivered Orders Found</h3>
            <p className="text-gray-600">No orders match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
