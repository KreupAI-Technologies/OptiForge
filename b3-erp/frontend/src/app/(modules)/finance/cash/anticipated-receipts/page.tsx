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
  TrendingUp,
  ArrowUpCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
} from 'lucide-react';

interface AnticipatedReceipt {
  id: string;
  receiptNumber: string;
  customerName: string;
  customerId: string;
  expectedDate: string;
  expectedAmount: number;
  receivedAmount: number;
  balanceAmount: number;
  status: 'Pending' | 'Partially Received' | 'Fully Received' | 'Overdue';
  referenceType: string;
  referenceNumber: string;
  description: string;
  confidenceLevel: number;
  paymentMethod: string;
  contactPerson: string;
  contactEmail: string;
  daysUntilDue: number;
}

export default function AnticipatedReceiptsPage() {
  const [receipts] = useState<AnticipatedReceipt[]>([
    {
      id: '1',
      receiptNumber: 'AR-2025-001',
      customerName: 'Taj Hotels Limited',
      customerId: 'CUST-001',
      expectedDate: '2025-10-20',
      expectedAmount: 1725000,
      receivedAmount: 0,
      balanceAmount: 1725000,
      status: 'Pending',
      referenceType: 'Sales Invoice',
      referenceNumber: 'INV-2025-145',
      description: 'Payment for commercial kitchen equipment supply',
      confidenceLevel: 95,
      paymentMethod: 'Bank Transfer',
      contactPerson: 'Rajesh Kumar',
      contactEmail: 'rajesh.k@tajhotels.com',
      daysUntilDue: 2,
    },
    {
      id: '2',
      receiptNumber: 'AR-2025-002',
      customerName: 'BigBasket Pvt Ltd',
      customerId: 'CUST-002',
      expectedDate: '2025-10-22',
      expectedAmount: 1150000,
      receivedAmount: 500000,
      balanceAmount: 650000,
      status: 'Partially Received',
      referenceType: 'Sales Invoice',
      referenceNumber: 'INV-2025-156',
      description: 'Cold storage unit - Partial payment pending',
      confidenceLevel: 85,
      paymentMethod: 'NEFT',
      contactPerson: 'Priya Sharma',
      contactEmail: 'priya.s@bigbasket.com',
      daysUntilDue: 4,
    },
    {
      id: '3',
      receiptNumber: 'AR-2025-003',
      customerName: 'Larsen & Toubro Limited',
      customerId: 'CUST-003',
      expectedDate: '2025-10-18',
      expectedAmount: 3200000,
      receivedAmount: 0,
      balanceAmount: 3200000,
      status: 'Overdue',
      referenceType: 'Sales Invoice',
      referenceNumber: 'INV-2025-142',
      description: 'HT Switchgear panels - Payment overdue',
      confidenceLevel: 75,
      paymentMethod: 'RTGS',
      contactPerson: 'Amit Patel',
      contactEmail: 'amit.p@lnttechservices.com',
      daysUntilDue: -2,
    },
    {
      id: '4',
      receiptNumber: 'AR-2025-004',
      customerName: 'ITC Hotels',
      customerId: 'CUST-004',
      expectedDate: '2025-10-25',
      expectedAmount: 950000,
      receivedAmount: 0,
      balanceAmount: 950000,
      status: 'Pending',
      referenceType: 'Sales Invoice',
      referenceNumber: 'INV-2025-167',
      description: 'Kitchen renovation - Grand Chola Chennai',
      confidenceLevel: 90,
      paymentMethod: 'Cheque',
      contactPerson: 'Sunita Reddy',
      contactEmail: 'sunita.r@itchotels.in',
      daysUntilDue: 7,
    },
    {
      id: '5',
      receiptNumber: 'AR-2025-005',
      customerName: 'Godrej Appliances',
      customerId: 'CUST-005',
      expectedDate: '2025-10-28',
      expectedAmount: 1680000,
      receivedAmount: 0,
      balanceAmount: 1680000,
      status: 'Pending',
      referenceType: 'Sales Invoice',
      referenceNumber: 'INV-2025-178',
      description: 'Cold room assembly equipment',
      confidenceLevel: 88,
      paymentMethod: 'Bank Transfer',
      contactPerson: 'Vikram Singh',
      contactEmail: 'vikram.s@godrej.com',
      daysUntilDue: 10,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const stats = {
    totalExpected: receipts.reduce((sum, r) => sum + r.expectedAmount, 0),
    totalReceived: receipts.reduce((sum, r) => sum + r.receivedAmount, 0),
    totalPending: receipts.reduce((sum, r) => sum + r.balanceAmount, 0),
    overdueCount: receipts.filter((r) => r.status === 'Overdue').length,
    thisWeek: receipts.filter((r) => r.daysUntilDue >= 0 && r.daysUntilDue <= 7).length,
    avgConfidence: receipts.reduce((sum, r) => sum + r.confidenceLevel, 0) / receipts.length,
  };

  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch =
      receipt.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || receipt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReceipts = filteredReceipts.slice(startIndex, startIndex + itemsPerPage);

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
      case 'Partially Received':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Fully Received':
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
      case 'Partially Received':
        return <TrendingUp className="w-4 h-4" />;
      case 'Fully Received':
        return <CheckCircle className="w-4 h-4" />;
      case 'Overdue':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (level: number) => {
    if (level >= 90) return 'text-green-600 bg-green-100';
    if (level >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full p-3">
          {/* Header */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <ArrowUpCircle className="w-8 h-8 text-green-600" />
                  Anticipated Receipts
                </h1>
                <p className="text-gray-600 mt-1">Track and manage expected customer payments</p>
              </div>
              <Link
                href="/finance/cash/anticipated-receipts"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg shadow-lg transition-all hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Add New Receipt</span>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-3 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-100 text-sm">Total Expected</p>
                  <DollarSign className="w-8 h-8 text-blue-200" />
                </div>
                <p className="text-3xl font-bold">{formatCurrency(stats.totalExpected)}</p>
                <p className="text-sm text-blue-100 mt-2">{receipts.length} receipts</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-3 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-100 text-sm">Amount Received</p>
                  <CheckCircle className="w-8 h-8 text-green-200" />
                </div>
                <p className="text-3xl font-bold">{formatCurrency(stats.totalReceived)}</p>
                <p className="text-sm text-green-100 mt-2">
                  {((stats.totalReceived / stats.totalExpected) * 100).toFixed(1)}% collected
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-3 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-orange-100 text-sm">Pending Amount</p>
                  <Clock className="w-8 h-8 text-orange-200" />
                </div>
                <p className="text-3xl font-bold">{formatCurrency(stats.totalPending)}</p>
                <p className="text-sm text-orange-100 mt-2">{stats.thisWeek} due this week</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-3 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-red-100 text-sm">Overdue Receipts</p>
                  <AlertCircle className="w-8 h-8 text-red-200" />
                </div>
                <p className="text-3xl font-bold">{stats.overdueCount}</p>
                <p className="text-sm text-red-100 mt-2">Require immediate attention</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by receipt number, customer, or reference..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Partially Received">Partially Received</option>
                <option value="Fully Received">Fully Received</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span>Export to Excel</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                <Mail className="w-4 h-4" />
                <span>Send Reminders</span>
              </button>
            </div>
          </div>

          {/* Receipts Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Receipt Details
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Expected Date
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedReceipts.map((receipt) => (
                    <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ArrowUpCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{receipt.receiptNumber}</p>
                            <p className="text-sm text-gray-500">
                              {receipt.referenceType}: {receipt.referenceNumber}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{receipt.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <p className="font-medium text-gray-900">{receipt.customerName}</p>
                          <p className="text-sm text-gray-500">{receipt.customerId}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{receipt.contactPerson}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{receipt.expectedDate}</p>
                            <p
                              className={`text-xs ${receipt.daysUntilDue < 0
                                  ? 'text-red-600 font-semibold'
                                  : receipt.daysUntilDue <= 3
                                    ? 'text-orange-600'
                                    : 'text-gray-500'
                                }`}
                            >
                              {receipt.daysUntilDue < 0
                                ? `${Math.abs(receipt.daysUntilDue)} days overdue`
                                : `${receipt.daysUntilDue} days remaining`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <p className="font-bold text-gray-900">{formatCurrency(receipt.expectedAmount)}</p>
                          {receipt.receivedAmount > 0 && (
                            <>
                              <p className="text-sm text-green-600">Received: {formatCurrency(receipt.receivedAmount)}</p>
                              <p className="text-sm text-orange-600">
                                Balance: {formatCurrency(receipt.balanceAmount)}
                              </p>
                            </>
                          )}
                          <p className="text-xs text-gray-500 mt-1">{receipt.paymentMethod}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(
                              receipt.status
                            )}`}
                          >
                            {getStatusIcon(receipt.status)}
                            {receipt.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${receipt.confidenceLevel >= 90
                                  ? 'bg-green-500'
                                  : receipt.confidenceLevel >= 75
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                              style={{ width: `${receipt.confidenceLevel}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${getConfidenceColor(receipt.confidenceLevel)}`}>
                            {receipt.confidenceLevel}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"

                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"

                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"

                          >
                            <Mail className="w-4 h-4" />
                          </button>
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
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredReceipts.length)} of{' '}
                {filteredReceipts.length} receipts
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
