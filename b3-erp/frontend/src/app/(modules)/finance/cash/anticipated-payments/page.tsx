'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  DollarSign,
  User,
  FileText,
  TrendingDown,
  ArrowDownCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Target,
  Check,
  X,
} from 'lucide-react';

interface AnticipatedPayment {
  id: string;
  paymentNumber: string;
  vendorName: string;
  vendorId: string;
  expectedDate: string;
  expectedAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'Pending' | 'Scheduled' | 'Partially Paid' | 'Fully Paid' | 'Overdue';
  priority: number;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  referenceType: string;
  referenceNumber: string;
  description: string;
  paymentMethod: string;
  requiresApproval: boolean;
  isApproved: boolean;
  approvedBy?: string;
  contactPerson: string;
  daysUntilDue: number;
}

export default function AnticipatedPaymentsPage() {
  const [payments] = useState<AnticipatedPayment[]>([
    {
      id: '1',
      paymentNumber: 'AP-2025-001',
      vendorName: 'Stainless Steel Suppliers Ltd',
      vendorId: 'VEND-001',
      expectedDate: '2025-10-20',
      expectedAmount: 850000,
      paidAmount: 0,
      balanceAmount: 850000,
      status: 'Pending',
      priority: 2,
      urgency: 'High',
      referenceType: 'Purchase Invoice',
      referenceNumber: 'PINV-2025-234',
      description: 'Raw material purchase for manufacturing',
      paymentMethod: 'RTGS',
      requiresApproval: true,
      isApproved: true,
      approvedBy: 'CFO - Finance',
      contactPerson: 'Rakesh Mehta',
      daysUntilDue: 2,
    },
    {
      id: '2',
      paymentNumber: 'AP-2025-002',
      vendorName: 'Industrial Components Corp',
      vendorId: 'VEND-002',
      expectedDate: '2025-10-22',
      expectedAmount: 520000,
      paidAmount: 200000,
      balanceAmount: 320000,
      status: 'Partially Paid',
      priority: 5,
      urgency: 'Medium',
      referenceType: 'Purchase Invoice',
      referenceNumber: 'PINV-2025-245',
      description: 'Equipment parts - Balance payment',
      paymentMethod: 'NEFT',
      requiresApproval: true,
      isApproved: true,
      approvedBy: 'Manager - Procurement',
      contactPerson: 'Sanjay Gupta',
      daysUntilDue: 4,
    },
    {
      id: '3',
      paymentNumber: 'AP-2025-003',
      vendorName: 'Electricity Board',
      vendorId: 'VEND-003',
      expectedDate: '2025-10-18',
      expectedAmount: 180000,
      paidAmount: 0,
      balanceAmount: 180000,
      status: 'Overdue',
      priority: 1,
      urgency: 'Critical',
      referenceType: 'Utility Bill',
      referenceNumber: 'EBILL-SEP-2025',
      description: 'Monthly electricity charges - September',
      paymentMethod: 'Online',
      requiresApproval: false,
      isApproved: true,
      contactPerson: 'Service Center',
      daysUntilDue: 0,
    },
    {
      id: '4',
      paymentNumber: 'AP-2025-004',
      vendorName: 'ABC Engineering Services',
      vendorId: 'VEND-004',
      expectedDate: '2025-10-25',
      expectedAmount: 450000,
      paidAmount: 0,
      balanceAmount: 450000,
      status: 'Pending',
      priority: 6,
      urgency: 'Low',
      referenceType: 'Service Invoice',
      referenceNumber: 'SINV-2025-089',
      description: 'Maintenance services - Quarterly',
      paymentMethod: 'Cheque',
      requiresApproval: true,
      isApproved: false,
      contactPerson: 'Ravi Kumar',
      daysUntilDue: 7,
    },
    {
      id: '5',
      paymentNumber: 'AP-2025-005',
      vendorName: 'Transport Solutions Pvt Ltd',
      vendorId: 'VEND-005',
      expectedDate: '2025-10-21',
      expectedAmount: 280000,
      paidAmount: 0,
      balanceAmount: 280000,
      status: 'Scheduled',
      priority: 4,
      urgency: 'Medium',
      referenceType: 'Freight Invoice',
      referenceNumber: 'FINV-2025-156',
      description: 'Logistics and freight charges',
      paymentMethod: 'Bank Transfer',
      requiresApproval: true,
      isApproved: true,
      approvedBy: 'Manager - Logistics',
      contactPerson: 'Pradeep Sharma',
      daysUntilDue: 3,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const stats = {
    totalExpected: payments.reduce((sum, p) => sum + p.expectedAmount, 0),
    totalPaid: payments.reduce((sum, p) => sum + p.paidAmount, 0),
    totalPending: payments.reduce((sum, p) => sum + p.balanceAmount, 0),
    overdueCount: payments.filter((p) => p.status === 'Overdue').length,
    thisWeek: payments.filter((p) => p.daysUntilDue >= 0 && p.daysUntilDue <= 7).length,
    requiresApproval: payments.filter((p) => p.requiresApproval && !p.isApproved).length,
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.paymentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || payment.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'All' || payment.urgency === urgencyFilter;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Scheduled':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Partially Paid':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Fully Paid':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Overdue':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'Partially Paid':
        return <TrendingDown className="w-4 h-4" />;
      case 'Fully Paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'Overdue':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-red-500 text-white';
      case 'High':
        return 'bg-orange-500 text-white';
      case 'Medium':
        return 'bg-yellow-500 text-white';
      case 'Low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPriorityBadge = (priority: number) => {
    const badges = ['🔴', '🟠', '🟡', '🟢', '🔵', '⚪', '⚪', '⚪', '⚪', '⚪'];
    return badges[priority - 1] || '⚪';
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-orange-50 to-red-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full p-3">
          {/* Header */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <ArrowDownCircle className="w-8 h-8 text-orange-600" />
                  Anticipated Payments
                </h1>
                <p className="text-gray-600 mt-1">Schedule and track upcoming vendor payments</p>
              </div>
              <Link
                href="/finance/cash/anticipated-payments"
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg shadow-lg transition-all hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Add New Payment</span>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-3 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-orange-100 text-sm">Total Expected</p>
                  <DollarSign className="w-8 h-8 text-orange-200" />
                </div>
                <p className="text-3xl font-bold">{formatCurrency(stats.totalExpected)}</p>
                <p className="text-sm text-orange-100 mt-2">{payments.length} payments</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-3 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-100 text-sm">Amount Paid</p>
                  <CheckCircle className="w-8 h-8 text-green-200" />
                </div>
                <p className="text-3xl font-bold">{formatCurrency(stats.totalPaid)}</p>
                <p className="text-sm text-green-100 mt-2">
                  {((stats.totalPaid / stats.totalExpected) * 100).toFixed(1)}% completed
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-3 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-100 text-sm">Pending Amount</p>
                  <Clock className="w-8 h-8 text-blue-200" />
                </div>
                <p className="text-3xl font-bold">{formatCurrency(stats.totalPending)}</p>
                <p className="text-sm text-blue-100 mt-2">{stats.thisWeek} due this week</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-3 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-red-100 text-sm">Urgent Payments</p>
                  <AlertTriangle className="w-8 h-8 text-red-200" />
                </div>
                <p className="text-3xl font-bold">{stats.overdueCount}</p>
                <p className="text-sm text-red-100 mt-2">{stats.requiresApproval} need approval</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by payment number, vendor, or reference..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Fully Paid">Fully Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="All">All Urgency</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span>Export to Excel</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                <Target className="w-4 h-4" />
                <span>Bulk Approval</span>
              </button>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Payment Details
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Approval
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ArrowDownCircle className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{payment.paymentNumber}</p>
                            <p className="text-sm text-gray-500">
                              {payment.referenceType}: {payment.referenceNumber}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{payment.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <p className="font-medium text-gray-900">{payment.vendorName}</p>
                          <p className="text-sm text-gray-500">{payment.vendorId}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{payment.contactPerson}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{payment.expectedDate}</p>
                            <p
                              className={`text-xs font-semibold ${payment.daysUntilDue < 0
                                  ? 'text-red-600'
                                  : payment.daysUntilDue <= 3
                                    ? 'text-orange-600'
                                    : 'text-gray-500'
                                }`}
                            >
                              {payment.daysUntilDue < 0
                                ? `${Math.abs(payment.daysUntilDue)} days overdue!`
                                : payment.daysUntilDue === 0
                                  ? 'Due today!'
                                  : `${payment.daysUntilDue} days remaining`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <p className="font-bold text-gray-900">{formatCurrency(payment.expectedAmount)}</p>
                          {payment.paidAmount > 0 && (
                            <>
                              <p className="text-sm text-green-600">Paid: {formatCurrency(payment.paidAmount)}</p>
                              <p className="text-sm text-orange-600">
                                Balance: {formatCurrency(payment.balanceAmount)}
                              </p>
                            </>
                          )}
                          <p className="text-xs text-gray-500 mt-1">{payment.paymentMethod}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${getUrgencyColor(payment.urgency)}`}>
                            {payment.urgency}
                          </span>
                          <span className="text-lg">{getPriorityBadge(payment.priority)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {getStatusIcon(payment.status)}
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {payment.requiresApproval ? (
                          payment.isApproved ? (
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-600" />
                              <div>
                                <p className="text-xs font-semibold text-green-600">Approved</p>
                                <p className="text-xs text-gray-500">{payment.approvedBy}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <X className="w-4 h-4 text-red-600" />
                              <p className="text-xs font-semibold text-red-600">Pending</p>
                            </div>
                          )
                        ) : (
                          <span className="text-xs text-gray-500">Not required</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"

                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"

                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {payment.requiresApproval && !payment.isApproved && (
                            <button
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"

                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPayments.length)} of{' '}
                {filteredPayments.length} payments
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
