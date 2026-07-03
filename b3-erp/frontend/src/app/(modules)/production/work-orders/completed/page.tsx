'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { exportToCsv } from '@/lib/export';
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  Calendar,
  Package,
  User,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  Award,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface CompletedWorkOrder {
  id: string;
  workOrderNumber: string;
  productCode: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  produced: number;
  rejected: number;
  successRate: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  salesOrderNumber: string;
  customerName: string;
  startDate: string;
  completionDate: string;
  dueDate: string;
  plannedDuration: number;
  actualDuration: number;
  varianceDays: number;
  plannedCost: number;
  actualCost: number;
  costVariance: number;
  assignedTeam: string;
  completedBy: string;
  deliveryStatus: 'delivered' | 'ready-for-shipment' | 'in-transit' | 'pending-qc';
  qualityRating: number;
  remarks: string;
}

export default function CompletedWorkOrdersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDelivery, setFilterDelivery] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('last-30-days');

  const completedOrders: CompletedWorkOrder[] = [
    {
      id: '1',
      workOrderNumber: 'WO-2025-1120',
      productCode: 'KIT-SINK-001',
      productName: 'Premium SS304 Kitchen Sink - Double Bowl',
      category: 'Kitchen Sinks',
      quantity: 40,
      unit: 'PC',
      produced: 38,
      rejected: 2,
      successRate: 95.0,
      priority: 'high',
      salesOrderNumber: 'SO-2025-0825',
      customerName: 'Metro Homes Ltd',
      startDate: '2025-09-28',
      completionDate: '2025-10-08',
      dueDate: '2025-10-10',
      plannedDuration: 12,
      actualDuration: 10,
      varianceDays: -2,
      plannedCost: 450000,
      actualCost: 432500,
      costVariance: -17500,
      assignedTeam: 'Team A - Sinks',
      completedBy: 'Rajesh Kumar',
      deliveryStatus: 'delivered',
      qualityRating: 4.8,
      remarks: 'Completed ahead of schedule with excellent quality'
    },
    {
      id: '2',
      workOrderNumber: 'WO-2025-1122',
      productCode: 'KIT-APPL-001',
      productName: 'Auto-Clean Kitchen Chimney - 90cm',
      category: 'Kitchen Appliances',
      quantity: 25,
      unit: 'PC',
      produced: 23,
      rejected: 2,
      successRate: 92.0,
      priority: 'urgent',
      salesOrderNumber: 'SO-2025-0828',
      customerName: "Builder's Choice",
      startDate: '2025-09-25',
      completionDate: '2025-10-10',
      dueDate: '2025-10-08',
      plannedDuration: 13,
      actualDuration: 15,
      varianceDays: 2,
      plannedCost: 920000,
      actualCost: 965000,
      costVariance: 45000,
      assignedTeam: 'Team C - Appliances',
      completedBy: 'Priya Sharma',
      deliveryStatus: 'in-transit',
      qualityRating: 4.5,
      remarks: 'Slight delay due to motor sourcing issues, quality maintained'
    },
    {
      id: '3',
      workOrderNumber: 'WO-2025-1125',
      productCode: 'KIT-CAB-001',
      productName: 'Modular Base Cabinet - 3 Drawer',
      category: 'Kitchen Cabinets',
      quantity: 50,
      unit: 'PC',
      produced: 50,
      rejected: 0,
      successRate: 100.0,
      priority: 'medium',
      salesOrderNumber: 'SO-2025-0831',
      customerName: 'Royal Apartments',
      startDate: '2025-09-20',
      completionDate: '2025-10-12',
      dueDate: '2025-10-15',
      plannedDuration: 22,
      actualDuration: 22,
      varianceDays: 0,
      plannedCost: 1075000,
      actualCost: 1068000,
      costVariance: -7000,
      assignedTeam: 'Team B - Cabinets',
      completedBy: 'Amit Patel',
      deliveryStatus: 'ready-for-shipment',
      qualityRating: 5.0,
      remarks: 'Perfect execution - zero defects, on time, under budget'
    },
    {
      id: '4',
      workOrderNumber: 'WO-2025-1127',
      productCode: 'KIT-FAUC-001',
      productName: 'Chrome Finish Kitchen Faucet - Single Lever',
      category: 'Kitchen Faucets',
      quantity: 80,
      unit: 'PC',
      produced: 75,
      rejected: 5,
      successRate: 93.8,
      priority: 'medium',
      salesOrderNumber: 'SO-2025-0834',
      customerName: 'Kitchen Paradise',
      startDate: '2025-09-30',
      completionDate: '2025-10-13',
      dueDate: '2025-10-14',
      plannedDuration: 14,
      actualDuration: 13,
      varianceDays: -1,
      plannedCost: 361600,
      actualCost: 374200,
      costVariance: 12600,
      assignedTeam: 'Team D - Faucets',
      completedBy: 'Suresh Reddy',
      deliveryStatus: 'delivered',
      qualityRating: 4.6,
      remarks: 'Chrome plating quality excellent, minor rejections acceptable'
    },
    {
      id: '5',
      workOrderNumber: 'WO-2025-1128',
      productCode: 'KIT-COOK-001',
      productName: 'Professional Cookware Set - 7 Piece',
      category: 'Cookware',
      quantity: 60,
      unit: 'SET',
      produced: 58,
      rejected: 2,
      successRate: 96.7,
      priority: 'low',
      salesOrderNumber: 'SO-2025-0836',
      customerName: 'Home Essentials',
      startDate: '2025-09-26',
      completionDate: '2025-10-14',
      dueDate: '2025-10-18',
      plannedDuration: 18,
      actualDuration: 18,
      varianceDays: 0,
      plannedCost: 532800,
      actualCost: 528400,
      costVariance: -4400,
      assignedTeam: 'Team E - Cookware',
      completedBy: 'Vikram Singh',
      deliveryStatus: 'pending-qc',
      qualityRating: 4.9,
      remarks: 'High quality non-stick coating, awaiting final QC clearance'
    },
    {
      id: '6',
      workOrderNumber: 'WO-2025-1130',
      productCode: 'KIT-COUNT-001',
      productName: 'Granite Countertop - Premium Black Galaxy',
      category: 'Countertops',
      quantity: 15,
      unit: 'PC',
      produced: 14,
      rejected: 1,
      successRate: 93.3,
      priority: 'high',
      salesOrderNumber: 'SO-2025-0838',
      customerName: 'Luxury Interiors',
      startDate: '2025-09-22',
      completionDate: '2025-10-15',
      dueDate: '2025-10-12',
      plannedDuration: 18,
      actualDuration: 23,
      varianceDays: 5,
      plannedCost: 371520,
      actualCost: 412800,
      costVariance: 41280,
      assignedTeam: 'Team F - Stone Work',
      completedBy: 'Neha Gupta',
      deliveryStatus: 'ready-for-shipment',
      qualityRating: 4.3,
      remarks: 'Granite slab defects caused delay, final quality acceptable'
    },
    {
      id: '7',
      workOrderNumber: 'WO-2025-1131',
      productCode: 'KIT-ACC-001',
      productName: 'Modular Kitchen Organizer Set - Premium',
      category: 'Kitchen Accessories',
      quantity: 100,
      unit: 'SET',
      produced: 98,
      rejected: 2,
      successRate: 98.0,
      priority: 'low',
      salesOrderNumber: 'SO-2025-0839',
      customerName: 'Urban Living',
      startDate: '2025-09-29',
      completionDate: '2025-10-16',
      dueDate: '2025-10-20',
      plannedDuration: 17,
      actualDuration: 17,
      varianceDays: 0,
      plannedCost: 493000,
      actualCost: 486200,
      costVariance: -6800,
      assignedTeam: 'Team G - Accessories',
      completedBy: 'Arun Kumar',
      deliveryStatus: 'delivered',
      qualityRating: 4.9,
      remarks: 'Excellent quality, customer very satisfied'
    },
    {
      id: '8',
      workOrderNumber: 'WO-2025-1132',
      productCode: 'KIT-SINK-003',
      productName: 'Undermount SS Sink - Single Bowl Large',
      category: 'Kitchen Sinks',
      quantity: 35,
      unit: 'PC',
      produced: 32,
      rejected: 3,
      successRate: 91.4,
      priority: 'high',
      salesOrderNumber: 'SO-2025-0840',
      customerName: 'Premium Kitchens',
      startDate: '2025-09-24',
      completionDate: '2025-10-17',
      dueDate: '2025-10-16',
      plannedDuration: 16,
      actualDuration: 23,
      varianceDays: 7,
      plannedCost: 395200,
      actualCost: 438900,
      costVariance: 43700,
      assignedTeam: 'Team A - Sinks',
      completedBy: 'Rajesh Kumar',
      deliveryStatus: 'in-transit',
      qualityRating: 4.2,
      remarks: 'Welding quality issues caused rework and delay'
    },
    {
      id: '9',
      workOrderNumber: 'WO-2025-1133',
      productCode: 'KIT-APPL-002',
      productName: 'Built-in Microwave Oven - 30L',
      category: 'Kitchen Appliances',
      quantity: 18,
      unit: 'PC',
      produced: 18,
      rejected: 0,
      successRate: 100.0,
      priority: 'medium',
      salesOrderNumber: 'SO-2025-0841',
      customerName: 'Smart Homes Co',
      startDate: '2025-10-01',
      completionDate: '2025-10-18',
      dueDate: '2025-10-19',
      plannedDuration: 17,
      actualDuration: 17,
      varianceDays: 0,
      plannedCost: 442800,
      actualCost: 439200,
      costVariance: -3600,
      assignedTeam: 'Team C - Appliances',
      completedBy: 'Priya Sharma',
      deliveryStatus: 'ready-for-shipment',
      qualityRating: 5.0,
      remarks: 'Flawless execution - premium quality appliances'
    },
    {
      id: '10',
      workOrderNumber: 'WO-2025-1129',
      productCode: 'KIT-SINK-002',
      productName: 'Granite Composite Sink - Single Bowl',
      category: 'Kitchen Sinks',
      quantity: 22,
      unit: 'PC',
      produced: 21,
      rejected: 1,
      successRate: 95.5,
      priority: 'medium',
      salesOrderNumber: 'SO-2025-0837',
      customerName: 'Designer Homes',
      startDate: '2025-09-27',
      completionDate: '2025-10-19',
      dueDate: '2025-10-21',
      plannedDuration: 20,
      actualDuration: 22,
      varianceDays: 2,
      plannedCost: 347600,
      actualCost: 358400,
      costVariance: 10800,
      assignedTeam: 'Team A - Sinks',
      completedBy: 'Meera Iyer',
      deliveryStatus: 'delivered',
      qualityRating: 4.7,
      remarks: 'Slight delay in composite curing, overall good quality'
    }
  ];

  const deliveryStatuses = ['all', 'delivered', 'in-transit', 'ready-for-shipment', 'pending-qc'];
  const periods = ['last-7-days', 'last-30-days', 'last-90-days', 'this-year'];

  const filteredOrders = completedOrders.filter(order => {
    const matchesSearch =
      order.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDelivery = filterDelivery === 'all' || order.deliveryStatus === filterDelivery;

    return matchesSearch && matchesDelivery;
  });

  const getDeliveryBadge = (status: string) => {
    const badges = {
      'delivered': { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Delivered' },
      'in-transit': { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'In Transit' },
      'ready-for-shipment': { color: 'bg-purple-100 text-purple-800', icon: Package, label: 'Ready for Shipment' },
      'pending-qc': { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, label: 'Pending QC' }
    };
    return badges[status as keyof typeof badges] || badges['delivered'];
  };

  // Summary stats
  const totalCompleted = completedOrders.length;
  const avgSuccessRate = completedOrders.reduce((sum, o) => sum + o.successRate, 0) / totalCompleted;
  const onTimeDelivery = completedOrders.filter(o => o.varianceDays <= 0).length;
  const underBudget = completedOrders.filter(o => o.costVariance <= 0).length;

  const handleExportReport = () => {
    exportToCsv('completed-work-orders', filteredOrders as unknown as Record<string, unknown>[]);
  };

  const handleViewDetails = (workOrderId: string) => {
    router.push(`/production/work-orders/view/${workOrderId}`);
  };

  return (
    <div className="w-full px-3 py-2">
      {/* Inline Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Completed Work Orders</h1>
            <p className="text-sm text-gray-600">Successfully finished production work orders</p>
          </div>
        </div>
        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900">Completed</span>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{totalCompleted}</div>
          <div className="text-xs text-green-700 mt-1">Last 30 days</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Avg Success Rate</span>
            <Award className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{avgSuccessRate.toFixed(1)}%</div>
          <div className="text-xs text-blue-700 mt-1">Quality metric</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">On-Time Delivery</span>
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">{onTimeDelivery}</div>
          <div className="text-xs text-purple-700 mt-1">{((onTimeDelivery / totalCompleted) * 100).toFixed(0)}% of orders</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-900">Under Budget</span>
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-900">{underBudget}</div>
          <div className="text-xs text-orange-700 mt-1">{((underBudget / totalCompleted) * 100).toFixed(0)}% of orders</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search completed orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterDelivery}
            onChange={(e) => setFilterDelivery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {deliveryStatuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Delivery Status' : status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {periods.map(period => (
              <option key={period} value={period}>
                {period.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Output
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Variance
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const deliveryInfo = getDeliveryBadge(order.deliveryStatus);
                const DeliveryIcon = deliveryInfo.icon;
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.workOrderNumber}</div>
                        <div className="text-xs text-gray-500">{order.customerName}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.productName}</div>
                        <div className="text-xs text-gray-500">{order.productCode}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-green-900">{order.produced} {order.unit}</div>
                        <div className="text-xs text-gray-500">{order.quantity} ordered</div>
                        {order.rejected > 0 && (
                          <div className="text-xs text-red-600">{order.rejected} rejected</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className={`text-sm font-medium ${
                        order.successRate >= 95 ? 'text-green-900' :
                        order.successRate >= 90 ? 'text-blue-900' :
                        'text-orange-900'
                      }`}>
                        {order.successRate.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{order.actualDuration} days</div>
                        <div className={`text-xs flex items-center gap-1 ${
                          order.varianceDays < 0 ? 'text-green-600' :
                          order.varianceDays === 0 ? 'text-gray-600' :
                          'text-red-600'
                        }`}>
                          {order.varianceDays < 0 ? <TrendingUp className="h-3 w-3" /> :
                           order.varianceDays > 0 ? <TrendingDown className="h-3 w-3" /> : null}
                          {order.varianceDays === 0 ? 'On time' :
                           order.varianceDays < 0 ? `${Math.abs(order.varianceDays)}d early` :
                           `${order.varianceDays}d late`}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className={`text-sm font-medium ${order.costVariance <= 0 ? 'text-green-900' : 'text-red-900'}`}>
                        {order.costVariance <= 0 ? '-' : '+'}₹{Math.abs(order.costVariance).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((Math.abs(order.costVariance) / order.plannedCost) * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Award className={`h-4 w-4 ${
                          order.qualityRating >= 4.8 ? 'text-yellow-500' :
                          order.qualityRating >= 4.5 ? 'text-blue-500' :
                          'text-gray-400'
                        }`} />
                        <span className="text-sm font-medium text-gray-900">{order.qualityRating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${deliveryInfo.color}`}>
                        <DeliveryIcon className="h-3 w-3" />
                        {deliveryInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleViewDetails(order.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredOrders.length} of {totalCompleted} completed work orders
      </div>
    </div>
  );
}
