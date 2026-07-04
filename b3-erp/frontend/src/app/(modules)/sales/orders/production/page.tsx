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

  const orders: ProductionOrder[] = [
    {
      id: 'PO-001',
      orderNumber: 'SO-2025-001',
      productionOrderNumber: 'PRO-2025-001',
      customerName: 'Rajesh Sharma',
      customerCompany: 'Tech Innovations Pvt Ltd',
      customerEmail: 'rajesh@techinnovations.com',
      customerPhone: '+91 98765 43210',
      orderDate: '2025-10-02',
      productionStartDate: '2025-10-05',
      expectedCompletion: '2025-10-20',
      totalAmount: 12500000,
      items: 8,
      assignedTo: 'Production Team A',
      productionStatus: 'in_progress',
      completionPercentage: 65,
      currentStage: 'Assembly',
      priority: 'high',
      qualityStatus: 'pending',
      deliveryDate: '2025-10-22',
      notes: 'Priority customer - maintain quality standards'
    },
    {
      id: 'PO-002',
      orderNumber: 'SO-2025-003',
      productionOrderNumber: 'PRO-2025-003',
      customerName: 'Amit Kumar',
      customerCompany: 'Industrial Automation Ltd',
      customerEmail: 'amit@indauto.com',
      customerPhone: '+91 97654 32109',
      orderDate: '2025-10-09',
      productionStartDate: '2025-10-12',
      expectedCompletion: '2025-10-26',
      totalAmount: 15300000,
      items: 15,
      assignedTo: 'Production Team B',
      productionStatus: 'in_progress',
      completionPercentage: 45,
      currentStage: 'Fabrication',
      priority: 'urgent',
      qualityStatus: 'pending',
      deliveryDate: '2025-10-28',
      notes: 'Large order - requires additional resources'
    },
    {
      id: 'PO-003',
      orderNumber: 'SO-2025-005',
      productionOrderNumber: 'PRO-2025-005',
      customerName: 'Vikram Singh',
      customerCompany: 'Engineering Works Ltd',
      customerEmail: 'vikram@engworks.com',
      customerPhone: '+91 99876 54321',
      orderDate: '2025-09-29',
      productionStartDate: '2025-10-02',
      expectedCompletion: '2025-10-18',
      actualCompletion: '2025-10-17',
      totalAmount: 9800000,
      items: 10,
      assignedTo: 'Production Team A',
      productionStatus: 'quality_check',
      completionPercentage: 100,
      currentStage: 'Quality Inspection',
      priority: 'normal',
      qualityStatus: 'in_review',
      deliveryDate: '2025-10-20',
      notes: 'Ahead of schedule - quality check in progress'
    },
    {
      id: 'PO-004',
      orderNumber: 'SO-2025-007',
      productionOrderNumber: 'PRO-2025-007',
      customerName: 'Ravi Krishnan',
      customerCompany: 'Precision Tools Ltd',
      customerEmail: 'ravi@precisiontools.com',
      customerPhone: '+91 97123 45678',
      orderDate: '2025-10-03',
      productionStartDate: '2025-10-08',
      expectedCompletion: '2025-10-23',
      totalAmount: 18200000,
      items: 18,
      assignedTo: 'Production Team C',
      productionStatus: 'in_progress',
      completionPercentage: 30,
      currentStage: 'Material Preparation',
      priority: 'urgent',
      qualityStatus: 'pending',
      deliveryDate: '2025-10-25',
      notes: 'High-value order - close monitoring required'
    },
    {
      id: 'PO-005',
      orderNumber: 'SO-2025-009',
      productionOrderNumber: 'PRO-2025-009',
      customerName: 'Priya Menon',
      customerCompany: 'Manufacturing Solutions Inc',
      customerEmail: 'priya.menon@mansol.com',
      customerPhone: '+91 98123 45678',
      orderDate: '2025-10-11',
      productionStartDate: '2025-10-15',
      expectedCompletion: '2025-10-28',
      totalAmount: 11200000,
      items: 12,
      assignedTo: 'Production Team B',
      productionStatus: 'scheduled',
      completionPercentage: 0,
      currentStage: 'Awaiting Start',
      priority: 'high',
      qualityStatus: 'pending',
      deliveryDate: '2025-10-30',
      notes: 'Materials ready - production starts tomorrow'
    },
    {
      id: 'PO-006',
      orderNumber: 'SO-2025-011',
      productionOrderNumber: 'PRO-2025-011',
      customerName: 'Sneha Patel',
      customerCompany: 'Global Machinery Corp',
      customerEmail: 'sneha.p@globalmach.com',
      customerPhone: '+91 98234 56789',
      orderDate: '2025-10-13',
      productionStartDate: '2025-10-14',
      expectedCompletion: '2025-10-30',
      totalAmount: 7500000,
      items: 9,
      assignedTo: 'Production Team A',
      productionStatus: 'on_hold',
      completionPercentage: 20,
      currentStage: 'Material Waiting',
      priority: 'normal',
      qualityStatus: 'pending',
      deliveryDate: '2025-11-01',
      notes: 'On hold - waiting for specific component delivery'
    },
    {
      id: 'PO-007',
      orderNumber: 'SO-2025-013',
      productionOrderNumber: 'PRO-2025-013',
      customerName: 'Anita Desai',
      customerCompany: 'Production Systems Inc',
      customerEmail: 'anita@prodsys.com',
      customerPhone: '+91 98765 12345',
      orderDate: '2025-10-16',
      productionStartDate: '2025-10-17',
      expectedCompletion: '2025-10-24',
      totalAmount: 5600000,
      items: 6,
      assignedTo: 'Production Team C',
      productionStatus: 'in_progress',
      completionPercentage: 80,
      currentStage: 'Finishing',
      priority: 'high',
      qualityStatus: 'pending',
      deliveryDate: '2025-10-26',
      notes: 'Fast-track order - on schedule'
    },
    {
      id: 'PO-008',
      orderNumber: 'SO-2025-002',
      productionOrderNumber: 'PRO-2025-002',
      customerName: 'Karthik Reddy',
      customerCompany: 'Heavy Industries Ltd',
      customerEmail: 'karthik@heavyind.com',
      customerPhone: '+91 98456 78901',
      orderDate: '2025-09-25',
      productionStartDate: '2025-09-28',
      expectedCompletion: '2025-10-15',
      actualCompletion: '2025-10-14',
      totalAmount: 8700000,
      items: 11,
      assignedTo: 'Production Team B',
      productionStatus: 'completed',
      completionPercentage: 100,
      currentStage: 'Completed',
      priority: 'normal',
      qualityStatus: 'passed',
      deliveryDate: '2025-10-17',
      notes: 'Production completed - ready for shipment'
    }
  ];

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
