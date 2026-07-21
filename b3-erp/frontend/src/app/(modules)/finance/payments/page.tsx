'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, CreditCard, Calendar, DollarSign, CheckCircle, XCircle, Clock, Download, ChevronLeft, ChevronRight, AlertCircle, Building, FileText, RefreshCw, Loader2 } from 'lucide-react';
import { PaymentService, Payment as ServicePayment, PaymentStatus, PaymentMethod as ServicePaymentMethod, PaymentType } from '@/services/payment.service';

interface Payment {
  id: string;
  paymentNumber: string;
  invoiceNumber: string;
  customerName: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'bank_transfer' | 'credit_card' | 'check' | 'cash' | 'wire_transfer';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  referenceNumber: string;
  transactionId: string;
  processedBy: string;
  notes: string;
}

// Map service payment status to UI status
function mapPaymentStatus(status: PaymentStatus): Payment['status'] {
  const statusMap: Record<PaymentStatus, Payment['status']> = {
    [PaymentStatus.PENDING]: 'pending',
    [PaymentStatus.PROCESSING]: 'processing',
    [PaymentStatus.COMPLETED]: 'completed',
    [PaymentStatus.FAILED]: 'failed',
    [PaymentStatus.CANCELLED]: 'failed',
    [PaymentStatus.REFUNDED]: 'refunded',
  };
  return statusMap[status] || 'pending';
}

// Map service payment method to UI payment method
function mapPaymentMethod(method: ServicePaymentMethod): Payment['paymentMethod'] {
  const methodMap: Record<ServicePaymentMethod, Payment['paymentMethod']> = {
    [ServicePaymentMethod.BANK_TRANSFER]: 'bank_transfer',
    [ServicePaymentMethod.CHECK]: 'check',
    [ServicePaymentMethod.CREDIT_CARD]: 'credit_card',
    [ServicePaymentMethod.CASH]: 'cash',
    [ServicePaymentMethod.WIRE_TRANSFER]: 'wire_transfer',
    [ServicePaymentMethod.ACH]: 'bank_transfer',
    [ServicePaymentMethod.PAYPAL]: 'credit_card',
    [ServicePaymentMethod.OTHER]: 'bank_transfer',
  };
  return methodMap[method] || 'bank_transfer';
}

// Transform service payment to UI payment
function transformPayment(pay: ServicePayment): Payment {
  const allocatedInvoice = pay.allocations.length > 0 ? pay.allocations[0].invoiceNumber : '';
  return {
    id: pay.id,
    paymentNumber: pay.paymentNumber,
    invoiceNumber: allocatedInvoice,
    customerName: pay.customerName || pay.vendorName || 'Unknown',
    paymentDate: new Date(pay.paymentDate).toISOString().split('T')[0],
    amount: pay.amount,
    paymentMethod: mapPaymentMethod(pay.method),
    status: mapPaymentStatus(pay.status),
    referenceNumber: pay.reference || '',
    transactionId: pay.transactionId || '',
    processedBy: 'Finance Team',
    notes: pay.notes || '',
  };
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-orange-100 text-orange-700',
};

const statusLabels = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  refunded: 'Refunded',
};

const methodColors = {
  bank_transfer: 'bg-blue-100 text-blue-700',
  credit_card: 'bg-purple-100 text-purple-700',
  check: 'bg-gray-100 text-gray-700',
  cash: 'bg-green-100 text-green-700',
  wire_transfer: 'bg-indigo-100 text-indigo-700',
};

const methodLabels = {
  bank_transfer: 'Bank Transfer',
  credit_card: 'Credit Card',
  check: 'Check',
  cash: 'Cash',
  wire_transfer: 'Wire Transfer',
};

// Loading skeleton for payments table
function PaymentsTableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-3 flex items-start gap-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-3 h-24">
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="h-10 bg-gray-100 rounded"></div>
        </div>
        <div className="divide-y divide-gray-200">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-2">
              <div className="h-10 w-10 bg-gray-100 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/3"></div>
              </div>
              <div className="h-8 w-20 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch payments from service
  useEffect(() => {
    async function fetchPayments() {
      try {
        setLoading(true);
        setError(null);
        const response = await PaymentService.getAllPayments({
          type: PaymentType.RECEIVED, // Get received payments
          limit: 100,
        });
        const transformedPayments = response.data.map(transformPayment);
        setPayments(transformedPayments);
      } catch (err) {
        console.error('Failed to fetch payments:', err);
        setError('Failed to load payments. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, []);

  // Refresh function
  const refreshPayments = async () => {
    try {
      setLoading(true);
      const response = await PaymentService.getAllPayments({
        type: PaymentType.RECEIVED,
        limit: 100,
      });
      const transformedPayments = response.data.map(transformPayment);
      setPayments(transformedPayments);
    } catch (err) {
      console.error('Failed to refresh payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.paymentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    totalPayments: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    completed: payments.filter((p) => p.status === 'completed').length,
    pending: payments.filter((p) => p.status === 'pending').length,
    failed: payments.filter((p) => p.status === 'failed').length,
  };

  // Client-side CSV export of the currently-filtered payments.
  const handleExport = () => {
    const headers = [
      'Payment Number',
      'Invoice',
      'Customer',
      'Date',
      'Amount',
      'Method',
      'Transaction ID',
      'Status',
      'Reference',
    ];
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = filteredPayments.map((p) =>
      [
        p.paymentNumber,
        p.invoiceNumber,
        p.customerName,
        p.paymentDate,
        p.amount,
        methodLabels[p.paymentMethod],
        p.transactionId,
        statusLabels[p.status],
        p.referenceNumber,
      ]
        .map((c) => escape(String(c ?? '')))
        .join(',')
    );
    const csv = [headers.map(escape).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Show loading skeleton
  if (loading && payments.length === 0) {
    return (
      <div className="w-full h-full px-3 py-2 ">
        <PaymentsTableSkeleton />
      </div>
    );
  }

  // Show error state
  if (error && payments.length === 0) {
    return (
      <div className="w-full h-full px-3 py-2 ">
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Payments</h2>
          <p className="text-gray-600 mb-2">{error}</p>
          <button
            onClick={refreshPayments}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full px-3 py-2 ">
      {/* Stats */}
      <div className="mb-3 flex items-start gap-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Payments</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalPayments}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</p>
                <p className="text-xs text-green-600 mt-1">${(stats.totalAmount / 1000).toFixed(0)}K total</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Failed</p>
                <p className="text-2xl font-bold text-red-900 mt-1">{stats.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/finance/payments/add')}
          className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-fit flex-shrink-0"
        >
          <Plus className="h-5 w-5" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by payment number, invoice, customer, or transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Methods</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="credit_card">Credit Card</option>
          <option value="check">Check</option>
          <option value="cash">Cash</option>
          <option value="wire_transfer">Wire Transfer</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <button
          onClick={handleExport}
          disabled={filteredPayments.length === 0}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{payment.paymentNumber}</div>
                        <div className="text-xs text-gray-500">{payment.referenceNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-blue-600">{payment.invoiceNumber}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{payment.customerName}</div>
                    <div className="text-sm text-gray-500">By {payment.processedBy}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {payment.paymentDate}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-bold text-green-700">${payment.amount.toLocaleString()}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${methodColors[payment.paymentMethod]}`}>
                      {methodLabels[payment.paymentMethod]}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-mono text-xs text-gray-600">{payment.transactionId}</div>
                    <div className="text-xs text-gray-400 mt-1">{payment.notes}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[payment.status]}`}>
                      {statusLabels[payment.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => router.push(`/finance/payments/view/${payment.id}`)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                       
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      {payment.status === 'failed' && (
                        <button
                          className="flex items-center space-x-1 px-3 py-1.5 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-sm font-medium"
                         
                        >
                          <AlertCircle className="h-4 w-4" />
                          <span>Retry</span>
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
        <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPayments.length)} of{' '}
            {filteredPayments.length} items
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                })
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && <span className="px-2 text-gray-400">...</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
