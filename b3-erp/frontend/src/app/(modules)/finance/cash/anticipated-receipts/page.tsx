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
  TrendingUp,
  ArrowUpCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Send,
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

const computeDaysUntilDue = (expectedDate?: string): number => {
  if (!expectedDate) return 0;
  const due = new Date(expectedDate);
  if (isNaN(due.getTime())) return 0;
  const today = new Date();
  const diff = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

const mapReceipt = (r: any): AnticipatedReceipt => {
  const expectedAmount = Number(r?.expectedAmount) || 0;
  const receivedAmount = Number(r?.receivedAmount) || 0;
  const expectedDate = r?.expectedDate ? String(r.expectedDate).slice(0, 10) : '';
  return {
    id: String(r?.id ?? ''),
    receiptNumber: r?.receiptNumber ?? '',
    customerName: r?.customerName ?? '',
    customerId: r?.customerId ?? '',
    expectedDate,
    expectedAmount,
    receivedAmount,
    balanceAmount: expectedAmount - receivedAmount,
    status: (r?.status as AnticipatedReceipt['status']) ?? 'Pending',
    referenceType: r?.referenceType ?? 'Reference',
    referenceNumber: r?.referenceNumber ?? '',
    description: r?.description ?? '',
    confidenceLevel: Number(r?.confidenceLevel) || 0,
    paymentMethod: r?.expectedPaymentMethod ?? r?.paymentMethod ?? '',
    contactPerson: r?.contactPerson ?? '',
    contactEmail: r?.contactEmail ?? '',
    daysUntilDue: computeDaysUntilDue(expectedDate),
  };
};

export default function AnticipatedReceiptsPage() {
  const [receipts, setReceipts] = useState<AnticipatedReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReceipts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await FinanceService.getAnticipatedReceipts();
      setReceipts(Array.isArray(data) ? data.map(mapReceipt) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load anticipated receipts');
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReceipts();
  }, [loadReceipts]);

  const handleUpdateReceipt = async (id: string, data: any) => {
    try {
      await FinanceService.updateAnticipatedReceipt(id, data);
      await loadReceipts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update receipt');
    }
  };

  const handleDeleteReceipt = async (id: string) => {
    try {
      await FinanceService.deleteAnticipatedReceipt(id);
      await loadReceipts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete receipt');
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const emptyForm = {
    id: '',
    receiptNumber: '',
    customerName: '',
    customerId: '',
    expectedDate: '',
    expectedAmount: '',
    receivedAmount: '',
    status: 'Pending',
    confidenceLevel: '',
    referenceType: 'Reference',
    referenceNumber: '',
    description: '',
    paymentMethod: '',
    contactPerson: '',
    contactEmail: '',
  };
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<typeof emptyForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [viewReceipt, setViewReceipt] = useState<AnticipatedReceipt | null>(null);

  // Send Reminder (per-row)
  const [reminderReceipt, setReminderReceipt] = useState<AnticipatedReceipt | null>(null);
  const [reminderMessage, setReminderMessage] = useState('');
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderError, setReminderError] = useState<string | null>(null);
  const [reminderSentId, setReminderSentId] = useState<string | null>(null);

  const openReminderModal = (receipt: AnticipatedReceipt) => {
    setReminderReceipt(receipt);
    setReminderMessage('');
    setReminderError(null);
  };

  const handleSendReminder = async () => {
    if (!reminderReceipt) return;
    setSendingReminder(true);
    setReminderError(null);
    try {
      await FinanceService.sendReminder({
        targetType: 'receivable',
        targetId: reminderReceipt.id,
        channel: 'email',
        message:
          reminderMessage.trim() ||
          `Reminder: payment of ${formatCurrency(reminderReceipt.balanceAmount || reminderReceipt.expectedAmount)} expected on ${reminderReceipt.expectedDate}.`,
        // No customer email available on this list view — backend marks 'no_recipient'.
        subject: reminderReceipt.customerName
          ? `Payment Reminder — ${reminderReceipt.customerName}`
          : 'Payment Reminder',
      });
      const sentId = reminderReceipt.id;
      setReminderReceipt(null);
      setReminderSentId(sentId);
      setTimeout(() => setReminderSentId((cur) => (cur === sentId ? null : cur)), 4000);
    } catch (err) {
      setReminderError(err instanceof Error ? err.message : 'Failed to send reminder');
    } finally {
      setSendingReminder(false);
    }
  };

  const openCreateModal = () => {
    setFormMode('create');
    setFormData(emptyForm);
    setFormModalOpen(true);
  };

  const openEditModal = (receipt: AnticipatedReceipt) => {
    setFormMode('edit');
    setFormData({
      id: receipt.id,
      receiptNumber: receipt.receiptNumber,
      customerName: receipt.customerName,
      customerId: receipt.customerId,
      expectedDate: receipt.expectedDate,
      expectedAmount: String(receipt.expectedAmount ?? ''),
      receivedAmount: String(receipt.receivedAmount ?? ''),
      status: receipt.status,
      confidenceLevel: String(receipt.confidenceLevel ?? ''),
      referenceType: receipt.referenceType,
      referenceNumber: receipt.referenceNumber,
      description: receipt.description,
      paymentMethod: receipt.paymentMethod,
      contactPerson: receipt.contactPerson,
      contactEmail: receipt.contactEmail,
    });
    setFormModalOpen(true);
  };

  const handleSubmitForm = async () => {
    setSaving(true);
    setError(null);
    const payload: any = {
      receiptNumber: formData.receiptNumber || undefined,
      customerName: formData.customerName,
      customerId: formData.customerId || undefined,
      expectedDate: formData.expectedDate || undefined,
      expectedAmount: formData.expectedAmount ? Number(formData.expectedAmount) : 0,
      receivedAmount: formData.receivedAmount ? Number(formData.receivedAmount) : 0,
      status: formData.status,
      confidenceLevel: formData.confidenceLevel ? Number(formData.confidenceLevel) : 0,
      referenceType: formData.referenceType || undefined,
      referenceNumber: formData.referenceNumber || undefined,
      description: formData.description || undefined,
      expectedPaymentMethod: formData.paymentMethod || undefined,
      contactPerson: formData.contactPerson || undefined,
      contactEmail: formData.contactEmail || undefined,
    };
    try {
      if (formMode === 'create') {
        await FinanceService.createAnticipatedReceipt(payload);
      } else {
        await FinanceService.updateAnticipatedReceipt(formData.id, payload);
      }
      setFormModalOpen(false);
      await loadReceipts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save receipt');
    } finally {
      setSaving(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Receipt Number', 'Customer', 'Customer ID', 'Expected Date', 'Expected Amount',
      'Received Amount', 'Balance', 'Status', 'Confidence %', 'Reference Type',
      'Reference Number', 'Payment Method', 'Contact Person', 'Contact Email', 'Description',
    ];
    const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = filteredReceipts.map((r) => [
      r.receiptNumber, r.customerName, r.customerId, r.expectedDate, r.expectedAmount,
      r.receivedAmount, r.balanceAmount, r.status, r.confidenceLevel, r.referenceType,
      r.referenceNumber, r.paymentMethod, r.contactPerson, r.contactEmail, r.description,
    ].map(escape).join(','));
    const csv = [headers.map(escape).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `anticipated-receipts-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    totalExpected: receipts.reduce((sum, r) => sum + r.expectedAmount, 0),
    totalReceived: receipts.reduce((sum, r) => sum + r.receivedAmount, 0),
    totalPending: receipts.reduce((sum, r) => sum + r.balanceAmount, 0),
    overdueCount: receipts.filter((r) => r.status === 'Overdue').length,
    thisWeek: receipts.filter((r) => r.daysUntilDue >= 0 && r.daysUntilDue <= 7).length,
    avgConfidence: receipts.length
      ? receipts.reduce((sum, r) => sum + r.confidenceLevel, 0) / receipts.length
      : 0,
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
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg shadow-lg transition-all hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Add New Receipt</span>
              </button>
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
                  {(stats.totalExpected ? (stats.totalReceived / stats.totalExpected) * 100 : 0).toFixed(1)}% collected
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

          {/* Loading / Error states */}
          {loading && (
            <div className="bg-white rounded-xl shadow-lg p-4 mb-3 text-center text-gray-500">
              Loading anticipated receipts...
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
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export to CSV</span>
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
                            onClick={() => setViewReceipt(receipt)}
                            title="View details"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(receipt)}
                            title="Edit receipt"
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openReminderModal(receipt)}
                            title={reminderSentId === receipt.id ? 'Reminder sent' : 'Send reminder'}
                            className={`p-2 rounded-lg transition-colors ${
                              reminderSentId === receipt.id
                                ? 'text-green-600 bg-green-50'
                                : 'text-purple-600 hover:bg-purple-50'
                            }`}
                          >
                            {reminderSentId === receipt.id ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteReceipt(receipt.id)}
                            title="Delete receipt"
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

      {/* Create / Edit Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {formMode === 'create' ? 'Add New Receipt' : 'Edit Receipt'}
              </h3>
              <button onClick={() => setFormModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="text-gray-700">Receipt Number</span>
                <input value={formData.receiptNumber} onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Customer Name</span>
                <input value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Customer ID</span>
                <input value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Expected Date</span>
                <input type="date" value={formData.expectedDate} onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Expected Amount</span>
                <input type="number" value={formData.expectedAmount} onChange={(e) => setFormData({ ...formData, expectedAmount: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Received Amount</span>
                <input type="number" value={formData.receivedAmount} onChange={(e) => setFormData({ ...formData, receivedAmount: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Status</span>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="Pending">Pending</option>
                  <option value="Partially Received">Partially Received</option>
                  <option value="Fully Received">Fully Received</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Confidence Level (%)</span>
                <input type="number" min={0} max={100} value={formData.confidenceLevel} onChange={(e) => setFormData({ ...formData, confidenceLevel: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Payment Method</span>
                <input value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Reference Type</span>
                <input value={formData.referenceType} onChange={(e) => setFormData({ ...formData, referenceType: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Reference Number</span>
                <input value={formData.referenceNumber} onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Contact Person</span>
                <input value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Contact Email</span>
                <input type="email" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </label>
              <label className="text-sm md:col-span-2">
                <span className="text-gray-700">Description</span>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200">
              <button onClick={() => setFormModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmitForm} disabled={saving || !formData.customerName} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50">
                {saving ? 'Saving…' : formMode === 'create' ? 'Create Receipt' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{viewReceipt.receiptNumber}</h3>
              <button onClick={() => setViewReceipt(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Customer</span><span className="font-medium">{viewReceipt.customerName} ({viewReceipt.customerId})</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Contact</span><span className="font-medium">{viewReceipt.contactPerson}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium">{viewReceipt.contactEmail || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Expected Date</span><span className="font-medium">{viewReceipt.expectedDate}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Expected Amount</span><span className="font-medium">{formatCurrency(viewReceipt.expectedAmount)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Received Amount</span><span className="font-medium">{formatCurrency(viewReceipt.receivedAmount)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Balance</span><span className="font-medium">{formatCurrency(viewReceipt.balanceAmount)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-medium">{viewReceipt.status}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Confidence</span><span className="font-medium">{viewReceipt.confidenceLevel}%</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Payment Method</span><span className="font-medium">{viewReceipt.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Reference</span><span className="font-medium">{viewReceipt.referenceType}: {viewReceipt.referenceNumber}</span></div>
              <div className="pt-2 border-t border-gray-100"><span className="text-gray-500">Description</span><p className="mt-1 text-gray-800">{viewReceipt.description || '—'}</p></div>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200">
              <button onClick={() => { const r = viewReceipt; setViewReceipt(null); openEditModal(r); }} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">Edit</button>
              <button onClick={() => setViewReceipt(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Send Reminder Modal */}
      {reminderReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Send Reminder</h3>
              <button onClick={() => setReminderReceipt(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {reminderError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {reminderError}
                </div>
              )}
              <p className="text-sm text-gray-600">
                An email reminder will be sent to {reminderReceipt.customerName || 'the customer'}
                {reminderReceipt.contactEmail ? ` (${reminderReceipt.contactEmail})` : ''} regarding{' '}
                {reminderReceipt.receiptNumber}.
              </p>
              <label className="block text-sm">
                <span className="text-gray-700">Message (optional)</span>
                <textarea
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Leave blank to use the default reminder message…"
                />
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200">
              <button onClick={() => setReminderReceipt(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSendReminder}
                disabled={sendingReminder}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
              >
                {sendingReminder ? 'Sending…' : 'Send Reminder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
