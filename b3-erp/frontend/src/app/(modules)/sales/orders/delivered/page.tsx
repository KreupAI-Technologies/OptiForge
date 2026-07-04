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

  const [orders, setOrders] = useState<DeliveredOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await salesPagesService.getQuotations();
        const mapped: DeliveredOrder[] = raw.map((r: any) => ({
          id: String(r.id ?? ''),
          orderNumber: r.orderNumber ?? '',
          salesOrderNumber: r.salesOrderNumber ?? '',
          customerName: r.customerName ?? '',
          customerPhone: r.customerPhone ?? '',
          customerEmail: r.customerEmail ?? '',
          totalAmount: r.totalAmount ?? 0,
          priority: (r.priority ?? 'normal') as DeliveredOrder['priority'],
          shippedDate: r.shippedDate ?? '',
          deliveredDate: r.deliveredDate ?? '',
          deliveryTime: r.deliveryTime ?? '',
          shippingAddress: {
            street: r.shippingAddress?.street ?? '',
            city: r.shippingAddress?.city ?? '',
            state: r.shippingAddress?.state ?? '',
            pincode: r.shippingAddress?.pincode ?? '',
          },
          deliveryMethod: (r.deliveryMethod ?? 'standard') as DeliveredOrder['deliveryMethod'],
          carrier: r.carrier ?? '',
          trackingNumber: r.trackingNumber ?? '',
          itemsCount: r.itemsCount ?? 0,
          weight: r.weight ?? 0,
          deliveryStatus: (r.deliveryStatus ?? 'delivered') as DeliveredOrder['deliveryStatus'],
          signedBy: r.signedBy ?? '',
          signatureAvailable: r.signatureAvailable ?? false,
          proofOfDelivery: r.proofOfDelivery ?? false,
          customerRating: r.customerRating,
          customerFeedback: r.customerFeedback,
          deliveryIssues: r.deliveryIssues,
          transitDays: r.transitDays ?? 0,
          onTimeDelivery: r.onTimeDelivery ?? false,
          invoiceGenerated: r.invoiceGenerated ?? false,
          paymentReceived: r.paymentReceived ?? false,
          warrantyActivated: r.warrantyActivated ?? false,
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
        {isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading orders…
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
