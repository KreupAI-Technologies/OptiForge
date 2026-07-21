'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FinanceService } from '@/services/finance.service';
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

const computeDaysUntilDue = (expectedDate?: string): number => {
  if (!expectedDate) return 0;
  const due = new Date(expectedDate);
  if (isNaN(due.getTime())) return 0;
  const today = new Date();
  return Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const mapPayment = (p: any): AnticipatedPayment => {
  const expectedAmount = Number(p?.expectedAmount) || 0;
  const paidAmount = Number(p?.paidAmount) || 0;
  const expectedDate = p?.expectedDate ? String(p.expectedDate).slice(0, 10) : '';
  return {
    id: String(p?.id ?? ''),
    paymentNumber: p?.paymentNumber ?? '',
    vendorName: p?.vendorName ?? '',
    vendorId: p?.vendorId ?? '',
    expectedDate,
    expectedAmount,
    paidAmount,
    balanceAmount: expectedAmount - paidAmount,
    status: (p?.status as AnticipatedPayment['status']) ?? 'Pending',
    priority: Number(p?.priority) || 5,
    urgency: (p?.urgency as AnticipatedPayment['urgency']) ?? 'Medium',
    referenceType: p?.referenceType ?? 'Reference',
    referenceNumber: p?.referenceNumber ?? '',
    description: p?.description ?? '',
    paymentMethod: p?.plannedPaymentMethod ?? p?.paymentMethod ?? '',
    requiresApproval: Boolean(p?.requiresApproval),
    isApproved: Boolean(p?.isApproved),
    approvedBy: p?.approvedBy,
    contactPerson: p?.contactPerson ?? '',
    daysUntilDue: computeDaysUntilDue(expectedDate),
  };
};

export default function AnticipatedPaymentsPage() {
  const [payments, setPayments] = useState<AnticipatedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await FinanceService.getAnticipatedPayments();
      setPayments(Array.isArray(data) ? data.map(mapPayment) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load anticipated payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleUpdatePayment = async (id: string, data: any) => {
    try {
      await FinanceService.updateAnticipatedPayment(id, data);
      await loadPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment');
    }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      await FinanceService.deleteAnticipatedPayment(id);
      await loadPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment');
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const emptyForm = {
    id: '',
    paymentNumber: '',
    vendorName: '',
    vendorId: '',
    expectedDate: '',
    expectedAmount: '',
    paidAmount: '',
    status: 'Pending',
    urgency: 'Medium',
    priority: '5',
    referenceType: 'Reference',
    referenceNumber: '',
    description: '',
    paymentMethod: '',
    contactPerson: '',
  };
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<typeof emptyForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [viewPayment, setViewPayment] = useState<AnticipatedPayment | null>(null);

  const openCreateModal = () => {
    setFormMode('create');
    setFormData(emptyForm);
    setFormModalOpen(true);
  };

  const openEditModal = (payment: AnticipatedPayment) => {
    setFormMode('edit');
    setFormData({
      id: payment.id,
      paymentNumber: payment.paymentNumber,
      vendorName: payment.vendorName,
      vendorId: payment.vendorId,
      expectedDate: payment.expectedDate,
      expectedAmount: String(payment.expectedAmount ?? ''),
      paidAmount: String(payment.paidAmount ?? ''),
      status: payment.status,
      urgency: payment.urgency,
      priority: String(payment.priority ?? '5'),
      referenceType: payment.referenceType,
      referenceNumber: payment.referenceNumber,
      description: payment.description,
      paymentMethod: payment.paymentMethod,
      contactPerson: payment.contactPerson,
    });
    setFormModalOpen(true);
  };

  const handleSubmitForm = async () => {
    setSaving(true);
    setError(null);
    const payload: any = {
      paymentNumber: formData.paymentNumber || undefined,
      vendorName: formData.vendorName,
      vendorId: formData.vendorId || undefined,
      expectedDate: formData.expectedDate || undefined,
      expectedAmount: formData.expectedAmount ? Number(formData.expectedAmount) : 0,
      paidAmount: formData.paidAmount ? Number(formData.paidAmount) : 0,
      status: formData.status,
      urgency: formData.urgency,
      priority: formData.priority ? Number(formData.priority) : 5,
      referenceType: formData.referenceType || undefined,
      referenceNumber: formData.referenceNumber || undefined,
      description: formData.description || undefined,
      plannedPaymentMethod: formData.paymentMethod || undefined,
      contactPerson: formData.contactPerson || undefined,
    };
    try {
      if (formMode === 'create') {
        await FinanceService.createAnticipatedPayment(payload);
      } else {
        await FinanceService.updateAnticipatedPayment(formData.id, payload);
      }
      setFormModalOpen(false);
      await loadPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save payment');
    } finally {
      setSaving(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Payment Number', 'Vendor', 'Vendor ID', 'Expected Date', 'Expected Amount',
      'Paid Amount', 'Balance', 'Status', 'Urgency', 'Priority', 'Reference Type',
      'Reference Number', 'Payment Method', 'Contact Person', 'Description',
    ];
    const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = filteredPayments.map((p) => [
      p.paymentNumber, p.vendorName, p.vendorId, p.expectedDate, p.expectedAmount,
      p.paidAmount, p.balanceAmount, p.status, p.urgency, p.priority, p.referenceType,
      p.referenceNumber, p.paymentMethod, p.contactPerson, p.description,
    ].map(escape).join(','));
    const csv = [headers.map(escape).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `anticipated-payments-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg shadow-lg transition-all hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Add New Payment</span>
              </button>
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
                  {(stats.totalExpected ? (stats.totalPaid / stats.totalExpected) * 100 : 0).toFixed(1)}% completed
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

          {/* Loading / Error states */}
          {loading && (
            <div className="bg-white rounded-xl shadow-lg p-4 mb-3 text-center text-gray-500">
              Loading anticipated payments...
            </div>
          )}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-lg p-4 mb-3">
              {error}
            </div>
          )}

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
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export to CSV</span>
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
                            onClick={() => setViewPayment(payment)}
                            title="View details"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(payment)}
                            title="Edit payment"
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {payment.requiresApproval && !payment.isApproved && (
                            <button
                              onClick={() => handleUpdatePayment(payment.id, { isApproved: true })}
                              title="Approve payment"
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePayment(payment.id)}
                            title="Delete payment"
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
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

      {/* Create / Edit Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {formMode === 'create' ? 'Add New Payment' : 'Edit Payment'}
              </h3>
              <button onClick={() => setFormModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="text-gray-700">Payment Number</span>
                <input value={formData.paymentNumber} onChange={(e) => setFormData({ ...formData, paymentNumber: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Vendor Name</span>
                <input value={formData.vendorName} onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Vendor ID</span>
                <input value={formData.vendorId} onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Expected Date</span>
                <input type="date" value={formData.expectedDate} onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Expected Amount</span>
                <input type="number" value={formData.expectedAmount} onChange={(e) => setFormData({ ...formData, expectedAmount: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Paid Amount</span>
                <input type="number" value={formData.paidAmount} onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Status</span>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="Pending">Pending</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Fully Paid">Fully Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Urgency</span>
                <select value={formData.urgency} onChange={(e) => setFormData({ ...formData, urgency: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Priority (1-10)</span>
                <input type="number" min={1} max={10} value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Payment Method</span>
                <input value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Reference Type</span>
                <input value={formData.referenceType} onChange={(e) => setFormData({ ...formData, referenceType: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Reference Number</span>
                <input value={formData.referenceNumber} onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Contact Person</span>
                <input value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </label>
              <label className="text-sm md:col-span-2">
                <span className="text-gray-700">Description</span>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200">
              <button onClick={() => setFormModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmitForm} disabled={saving || !formData.vendorName} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50">
                {saving ? 'Saving…' : formMode === 'create' ? 'Create Payment' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{viewPayment.paymentNumber}</h3>
              <button onClick={() => setViewPayment(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Vendor</span><span className="font-medium">{viewPayment.vendorName} ({viewPayment.vendorId})</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Contact</span><span className="font-medium">{viewPayment.contactPerson}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Expected Date</span><span className="font-medium">{viewPayment.expectedDate}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Expected Amount</span><span className="font-medium">{formatCurrency(viewPayment.expectedAmount)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Paid Amount</span><span className="font-medium">{formatCurrency(viewPayment.paidAmount)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Balance</span><span className="font-medium">{formatCurrency(viewPayment.balanceAmount)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-medium">{viewPayment.status}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Urgency</span><span className="font-medium">{viewPayment.urgency}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Priority</span><span className="font-medium">{viewPayment.priority}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Payment Method</span><span className="font-medium">{viewPayment.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Reference</span><span className="font-medium">{viewPayment.referenceType}: {viewPayment.referenceNumber}</span></div>
              <div className="pt-2 border-t border-gray-100"><span className="text-gray-500">Description</span><p className="mt-1 text-gray-800">{viewPayment.description || '—'}</p></div>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200">
              <button onClick={() => { const p = viewPayment; setViewPayment(null); openEditModal(p); }} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg">Edit</button>
              <button onClick={() => setViewPayment(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
