'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FinanceService } from '@/services/finance.service';
import { PaymentService } from '@/services/payment.service';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Send,
  Calendar,
  DollarSign,
  TrendingDown,
  Building,
  FileText
} from 'lucide-react';

interface Payment {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  vendorName: string;
  vendorCode: string;
  paymentMethod: 'Bank Transfer' | 'Cheque' | 'Cash' | 'Credit Card' | 'UPI';
  bankAccount: string;
  referenceNumber?: string;
  invoiceNumber?: string;
  amount: number;
  tdsDeducted: number;
  netPayment: number;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Processed' | 'Failed' | 'Cancelled';
  approvedBy?: string;
  approvedDate?: string;
  processedDate?: string;
  description: string;
  costCenter?: string;
  department?: string;
  createdBy: string;
  createdDate: string;
}

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewPayment, setViewPayment] = useState<Payment | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = await FinanceService.getPayments();
      const rows = (Array.isArray(raw) ? raw : []).filter(
        (r: any) => !r.partyType || String(r.partyType).toLowerCase() === 'vendor',
      );
      const methods = ['Bank Transfer', 'Cheque', 'Cash', 'Credit Card', 'UPI'];
      const statuses = ['Draft', 'Pending Approval', 'Approved', 'Processed', 'Failed', 'Cancelled'];
      const mapped: Payment[] = rows.map((r: any) => {
        const amount = Number(r.amount ?? 0);
        const tds = Number(r.tdsAmount ?? 0);
        const method = methods.includes(r.paymentMethod) ? r.paymentMethod : 'Bank Transfer';
        const status = statuses.includes(r.status) ? r.status : 'Draft';
        const firstAlloc = Array.isArray(r.invoiceAllocations) ? r.invoiceAllocations[0] : undefined;
        return {
          id: r.id ?? '',
          paymentNumber: r.paymentNumber ?? '',
          paymentDate: r.paymentDate ? String(r.paymentDate).slice(0, 10) : '',
          vendorName: r.partyName ?? '',
          vendorCode: r.partyId ?? '',
          paymentMethod: method as Payment['paymentMethod'],
          bankAccount: r.bankName ?? r.bankAccountId ?? '',
          referenceNumber: r.transactionReference ?? r.referenceNumber ?? undefined,
          invoiceNumber: firstAlloc?.invoiceNumber ?? undefined,
          amount,
          tdsDeducted: tds,
          netPayment: Number(r.netPayment ?? (amount - tds)),
          status: status as Payment['status'],
          approvedBy: r.approvedBy ?? undefined,
          description: r.notes ?? r.description ?? '',
          createdBy: r.createdBy ?? '',
          createdDate: r.createdAt ? String(r.createdAt).slice(0, 10) : '',
        };
      });
      setPayments(mapped);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load payments');
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // Client-side CSV export from already-fetched (filtered) payments
  const handleExport = () => {
    const headers = ['Payment #', 'Vendor', 'Vendor Code', 'Date', 'Method', 'Bank', 'Reference', 'Invoice', 'Amount', 'TDS', 'Net Payment', 'Status', 'Created By'];
    const rows = filteredPayments.map((p) => [
      p.paymentNumber, p.vendorName, p.vendorCode, p.paymentDate, p.paymentMethod,
      p.bankAccount, p.referenceNumber ?? '', p.invoiceNumber ?? '', p.amount, p.tdsDeducted,
      p.netPayment, p.status, p.createdBy,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payments_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleApprove = async (payment: Payment) => {
    setApprovingId(payment.id);
    setActionError(null);
    try {
      await PaymentService.approvePayment(payment.id);
      await loadPayments();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : `Failed to approve ${payment.paymentNumber}`);
    } finally {
      setApprovingId(null);
    }
  };


  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.vendorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.invoiceNumber && payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;

    let matchesDate = true;
    if (dateFilter === 'this-month') {
      const paymentMonth = new Date(payment.paymentDate).getMonth();
      const currentMonth = new Date().getMonth();
      matchesDate = paymentMonth === currentMonth;
    } else if (dateFilter === 'last-month') {
      const paymentMonth = new Date(payment.paymentDate).getMonth();
      const lastMonth = new Date().getMonth() - 1;
      matchesDate = paymentMonth === lastMonth;
    }

    return matchesSearch && matchesStatus && matchesMethod && matchesDate;
  });

  // Calculate statistics
  const totalPayments = payments.length;
  const totalAmount = payments.reduce((sum, pmt) => sum + pmt.amount, 0);
  const totalProcessed = payments.filter(p => p.status === 'Processed').reduce((sum, p) => sum + p.netPayment, 0);
  const pendingApproval = payments.filter(p => p.status === 'Pending Approval').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Draft: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
      'Pending Approval': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      Approved: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      Processed: 'bg-green-500/20 text-green-400 border-green-500/50',
      Failed: 'bg-red-500/20 text-red-400 border-red-500/50',
      Cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    };
    const icons = {
      Draft: Clock,
      'Pending Approval': AlertTriangle,
      Approved: CheckCircle,
      Processed: CheckCircle,
      Failed: XCircle,
      Cancelled: XCircle
    };
    const Icon = icons[status as keyof typeof icons];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      'Bank Transfer': 'bg-blue-500/20 text-blue-400',
      'Cheque': 'bg-purple-500/20 text-purple-400',
      'Cash': 'bg-green-500/20 text-green-400',
      'Credit Card': 'bg-orange-500/20 text-orange-400',
      'UPI': 'bg-cyan-500/20 text-cyan-400'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[method as keyof typeof colors]}`}>
        {method}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 p-3">
      <div className="w-full h-full px-3 space-y-3">
        {isLoading && (
          <div className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">Loading payments…</div>
        )}
        {loadError && !isLoading && (
          <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">{loadError}</div>
        )}
        {actionError && (
          <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">{actionError}</div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Payments</h1>
            <p className="text-gray-400">Manage vendor payments and disbursements</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg">
              <Plus className="w-5 h-5" />
              Make Payment
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-8 h-8 opacity-80" />
              <TrendingDown className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{totalPayments}</div>
            <div className="text-blue-100 text-sm">Total Payments</div>
            <div className="mt-2 text-xs text-blue-100">This period</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 opacity-80" />
              <TrendingDown className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(totalAmount)}</div>
            <div className="text-purple-100 text-sm">Total Amount</div>
            <div className="mt-2 text-xs text-purple-100">Gross payment value</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 opacity-80" />
              <TrendingDown className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(totalProcessed)}</div>
            <div className="text-green-100 text-sm">Processed Payments</div>
            <div className="mt-2 text-xs text-green-100">
              {payments.filter(p => p.status === 'Processed').length} transactions
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 opacity-80" />
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{pendingApproval}</div>
            <div className="text-yellow-100 text-sm">Pending Approval</div>
            <div className="mt-2 text-xs text-yellow-100">Awaiting action</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by payment number, vendor, or invoice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Processed">Processed</option>
                <option value="Failed">Failed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Methods</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="UPI">UPI</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Time</option>
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="this-quarter">This Quarter</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Payment #</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Vendor</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Date</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Method</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Amount</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">TDS</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Net Payment</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <td className="px-3 py-2">
                      <div className="font-medium text-white font-mono">{payment.paymentNumber}</div>
                      {payment.invoiceNumber && (
                        <div className="text-xs text-gray-400 mt-1">Ref: {payment.invoiceNumber}</div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-white">{payment.vendorName}</div>
                      <div className="text-xs text-gray-400 font-mono mt-1">{payment.vendorCode}</div>
                    </td>
                    <td className="px-3 py-2 text-white text-sm">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">
                      {getMethodBadge(payment.paymentMethod)}
                      <div className="text-xs text-gray-400 mt-1">{payment.bankAccount}</div>
                    </td>
                    <td className="px-3 py-2 text-right text-white font-medium">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-3 py-2 text-right text-orange-400 font-medium">
                      {payment.tdsDeducted > 0 ? formatCurrency(payment.tdsDeducted) : '-'}
                    </td>
                    <td className="px-3 py-2 text-right text-green-400 font-medium">
                      {formatCurrency(payment.netPayment)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {getStatusBadge(payment.status)}
                      {payment.processedDate && (
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(payment.processedDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewPayment(payment)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-blue-400" />
                        </button>
                        {payment.status === 'Pending Approval' && (
                          <button
                            onClick={() => handleApprove(payment)}
                            disabled={approvingId === payment.id}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                            title="Approve payment"
                          >
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-600 mb-2" />
              <p className="text-gray-400 text-lg">No payments found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredPayments.length > 0 && (
          <div className="flex items-center justify-between bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700">
            <div className="text-gray-400 text-sm">
              Showing {filteredPayments.length} of {payments.length} payments
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg">1</button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">2</button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                Next
              </button>
            </div>
          </div>
        )}

        {/* Payment Details Modal (from already-fetched row data) */}
        {viewPayment && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setViewPayment(null)}>
            <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white font-mono">{viewPayment.paymentNumber}</h2>
                    <p className="text-sm text-gray-400 mt-1">{viewPayment.vendorName}</p>
                  </div>
                  <button onClick={() => setViewPayment(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
                </div>
                <div className="mb-4">{getStatusBadge(viewPayment.status)}</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Vendor Code</p>
                    <p className="text-white font-mono">{viewPayment.vendorCode || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Payment Date</p>
                    <p className="text-white">{viewPayment.paymentDate || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Method</p>
                    <p className="text-white">{viewPayment.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Bank Account</p>
                    <p className="text-white">{viewPayment.bankAccount || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Reference</p>
                    <p className="text-white">{viewPayment.referenceNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Invoice</p>
                    <p className="text-white">{viewPayment.invoiceNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Amount</p>
                    <p className="text-white font-medium">{formatCurrency(viewPayment.amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">TDS Deducted</p>
                    <p className="text-orange-400 font-medium">{formatCurrency(viewPayment.tdsDeducted)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Net Payment</p>
                    <p className="text-green-400 font-medium">{formatCurrency(viewPayment.netPayment)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Created By</p>
                    <p className="text-white">{viewPayment.createdBy || '-'}</p>
                  </div>
                </div>
                {viewPayment.description && (
                  <div className="mt-4 pt-4 border-t border-gray-700 text-sm">
                    <p className="text-gray-400 mb-1">Description</p>
                    <p className="text-white">{viewPayment.description}</p>
                  </div>
                )}
                {viewPayment.status === 'Pending Approval' && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => { handleApprove(viewPayment); setViewPayment(null); }}
                      disabled={approvingId === viewPayment.id}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve Payment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
