'use client';

import React, { useState, useEffect } from 'react';
import {
  Factory,
  Package,
  DollarSign,
  Clock,
  TrendingUp,
  Eye,
  Download,
  AlertCircle,
  CheckCircle,
  Pause,
  PlayCircle,
  Search,
  Filter,
  Calendar,
  User,
  Building2,
  Phone,
  Mail,
  Truck,
  Settings,
  BarChart3,
  Wrench
} from 'lucide-react';
import { salesPagesService } from '@/services/sales-pages.service';

interface ProductionOrder {
  id: string;
  orderNumber: string;
  productionOrderNumber: string;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  customerPhone: string;
  orderDate: string;
  productionStartDate: string;
  expectedCompletion: string;
  actualCompletion?: string;
  totalAmount: number;
  items: number;
  assignedTo: string;
  productionStatus: 'scheduled' | 'in_progress' | 'on_hold' | 'completed' | 'quality_check';
  completionPercentage: number;
  currentStage: string;
  priority: 'normal' | 'high' | 'urgent';
  qualityStatus: 'pending' | 'passed' | 'failed' | 'in_review';
  deliveryDate: string;
  notes: string;
}

export default function ProductionOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await salesPagesService.getQuotations();
        const mapped: ProductionOrder[] = raw.map((r: any) => ({
          id: String(r.id ?? ''),
          orderNumber: r.orderNumber ?? '',
          productionOrderNumber: r.productionOrderNumber ?? '',
          customerName: r.customerName ?? '',
          customerCompany: r.customerCompany ?? '',
          customerEmail: r.customerEmail ?? '',
          customerPhone: r.customerPhone ?? '',
          orderDate: r.orderDate ?? '',
          productionStartDate: r.productionStartDate ?? '',
          expectedCompletion: r.expectedCompletion ?? '',
          actualCompletion: r.actualCompletion,
          totalAmount: r.totalAmount ?? 0,
          items: r.items ?? 0,
          assignedTo: r.assignedTo ?? '',
          productionStatus: (r.productionStatus ?? 'scheduled') as ProductionOrder['productionStatus'],
          completionPercentage: r.completionPercentage ?? 0,
          currentStage: r.currentStage ?? '',
          priority: (r.priority ?? 'normal') as ProductionOrder['priority'],
          qualityStatus: (r.qualityStatus ?? 'pending') as ProductionOrder['qualityStatus'],
          deliveryDate: r.deliveryDate ?? '',
          notes: r.notes ?? '',
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
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.productionOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerCompany.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.productionStatus === statusFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = [
    {
      label: 'In Production',
      value: orders.filter(o => o.productionStatus === 'in_progress').length,
      subtitle: 'Active orders',
      icon: Factory,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Total Value',
      value: '₹' + (orders.reduce((sum, o) => sum + o.totalAmount, 0) / 10000000).toFixed(1) + 'Cr',
      subtitle: 'Production pipeline',
      icon: DollarSign,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'On Schedule',
      value: orders.filter(o => o.productionStatus === 'in_progress' && o.completionPercentage >= 50).length,
      subtitle: 'Progress tracking',
      icon: CheckCircle,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      label: 'Quality Check',
      value: orders.filter(o => o.productionStatus === 'quality_check' || o.qualityStatus === 'in_review').length,
      subtitle: 'Pending inspection',
      icon: Settings,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'on_hold': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'quality_check': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getQualityColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in_review': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Scheduled';
      case 'in_progress': return 'In Progress';
      case 'on_hold': return 'On Hold';
      case 'quality_check': return 'Quality Check';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <div className="w-full h-full px-4 py-2">
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`bg-gradient-to-br ${stat.color} rounded-xl p-3 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    <p className="text-white/70 text-xs mt-1">{stat.subtitle}</p>
                  </div>
                  <Icon className="w-12 h-12 text-white/30" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search
              </label>
              <input
                type="text"
                placeholder="Search by order, production number, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Production Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="quality_check">Quality Check</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredOrders.map((order) => {
            const progressColor = order.completionPercentage >= 75 ? 'bg-green-500' :
                                 order.completionPercentage >= 50 ? 'bg-blue-500' :
                                 order.completionPercentage >= 25 ? 'bg-yellow-500' : 'bg-orange-500';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-lg border-2 transition-all hover:shadow-lg ${
                  order.productionStatus === 'completed' ? 'border-green-200 bg-green-50/20' :
                  order.productionStatus === 'on_hold' ? 'border-yellow-300 bg-yellow-50/30' :
                  order.priority === 'urgent' ? 'border-red-300 bg-red-50/20' :
                  'border-blue-200 bg-blue-50/20'
                }`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Factory className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">{order.productionOrderNumber}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.productionStatus)}`}>
                          {getStatusLabel(order.productionStatus)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(order.priority)}`}>
                          {order.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Sales Order: {order.orderNumber}</p>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {order.customerName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{order.customerName}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {order.customerCompany}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="grid grid-cols-2 gap-3 mb-2 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{order.customerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{order.customerPhone}</span>
                    </div>
                  </div>

                  {/* Production Progress */}
                  <div className="bg-blue-50 rounded-lg p-3 mb-2 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Production Progress</p>
                        <p className="text-xs text-gray-600 mt-1">Current Stage: {order.currentStage}</p>
                      </div>
                      <span className="text-2xl font-bold text-blue-900">{order.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                      <div
                        className={`h-3 rounded-full transition-all ${progressColor}`}
                        style={{ width: `${order.completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Timeline Details */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <p className="text-xs text-gray-500">Production Start</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(order.productionStartDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Expected Completion</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(order.expectedCompletion).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Order Value</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        ₹{(order.totalAmount / 100000).toFixed(1)}L
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Items</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Package className="w-4 h-4 text-gray-400" />
                        <p className="text-lg font-bold text-gray-900">{order.items}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quality Status */}
                  {order.qualityStatus !== 'pending' && (
                    <div className="mb-2 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-gray-600">Quality Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getQualityColor(order.qualityStatus)}`}>
                          {order.qualityStatus.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Team & Delivery */}
                  <div className="space-y-2 mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Assigned to:</span>
                      <span className="font-medium text-gray-900">{order.assignedTo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Delivery Date:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(order.deliveryDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="bg-yellow-50 rounded-lg p-3 mb-2">
                      <p className="text-xs font-medium text-yellow-900 mb-1">Production Notes</p>
                      <p className="text-sm text-yellow-800">{order.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {order.productionStatus === 'in_progress' ? (
                      <>
                        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          <BarChart3 className="w-4 h-4" />
                          Track Progress
                        </button>
                        <button className="p-2 hover:bg-yellow-50 rounded-lg transition-colors">
                          <Pause className="w-4 h-4 text-yellow-600" />
                        </button>
                      </>
                    ) : order.productionStatus === 'on_hold' ? (
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                        <PlayCircle className="w-4 h-4" />
                        Resume Production
                      </button>
                    ) : order.productionStatus === 'scheduled' ? (
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        <PlayCircle className="w-4 h-4" />
                        Start Production
                      </button>
                    ) : (
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    )}
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-purple-50 rounded-lg transition-colors">
                      <Wrench className="w-4 h-4 text-purple-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Factory className="w-16 h-16 text-gray-300 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Production Orders</h3>
            <p className="text-gray-600">No orders match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
