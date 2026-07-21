'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, Download, FileText, Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, ChevronLeft, ChevronRight, Send, RefreshCw, Loader2 } from 'lucide-react';
import { InvoiceService, Invoice as ServiceInvoice, InvoiceStatus, InvoiceType } from '@/services/invoice.service';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerId: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  paymentTerms: string;
  salesOrder: string;
  createdBy: string;
  paymentMethod?: string;
}

// Map service invoice status to UI status
function mapInvoiceStatus(status: InvoiceStatus): Invoice['status'] {
  const statusMap: Record<InvoiceStatus, Invoice['status']> = {
    [InvoiceStatus.DRAFT]: 'draft',
    [InvoiceStatus.PENDING_APPROVAL]: 'draft',
    [InvoiceStatus.APPROVED]: 'sent',
    [InvoiceStatus.POSTED]: 'sent',
    [InvoiceStatus.PARTIALLY_PAID]: 'partially_paid',
    [InvoiceStatus.PAID]: 'paid',
    [InvoiceStatus.OVERDUE]: 'overdue',
    [InvoiceStatus.CANCELLED]: 'cancelled',
    [InvoiceStatus.VOID]: 'cancelled',
  };
  return statusMap[status] || 'draft';
}

// Transform service invoice to UI invoice
function transformInvoice(inv: ServiceInvoice): Invoice {
  return {
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    customerName: inv.customerName,
    customerId: inv.customerId || '',
    invoiceDate: new Date(inv.invoiceDate).toISOString().split('T')[0],
    dueDate: new Date(inv.dueDate).toISOString().split('T')[0],
    amount: inv.subtotal,
    taxAmount: inv.totalTax,
    totalAmount: inv.totalAmount,
    paidAmount: inv.amountPaid,
    status: mapInvoiceStatus(inv.status),
    paymentTerms: inv.paymentTerms.replace('_', ' '),
    salesOrder: inv.poNumber || '',
    createdBy: inv.submittedBy || 'Finance Team',
    paymentMethod: inv.status === InvoiceStatus.PAID ? 'Bank Transfer' : undefined,
  };
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  partially_paid: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-orange-100 text-orange-700',
};

const statusLabels = {
  draft: 'Draft',
  sent: 'Sent',
  partially_paid: 'Partially Paid',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

// Loading skeleton for invoices table
function InvoicesTableSkeleton() {
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

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 10;

  // Fetch invoices from service
  useEffect(() => {
    async function fetchInvoices() {
      try {
        setLoading(true);
        setError(null);
        const response = await InvoiceService.getAllInvoices({
          type: InvoiceType.SALES,
          limit: 100, // Get all for client-side filtering
        });
        const transformedInvoices = response.data.map(transformInvoice);
        setInvoices(transformedInvoices);
        setTotalRecords(response.total);
      } catch (err) {
        console.error('Failed to fetch invoices:', err);
        setError('Failed to load invoices. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, []);

  // Refresh function
  const refreshInvoices = async () => {
    try {
      setLoading(true);
      const response = await InvoiceService.getAllInvoices({
        type: InvoiceType.SALES,
        limit: 100,
      });
      const transformedInvoices = response.data.map(transformInvoice);
      setInvoices(transformedInvoices);
      setTotalRecords(response.total);
    } catch (err) {
      console.error('Failed to refresh invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const [actionId, setActionId] = useState<string | null>(null);

  // Submit (Send) a draft invoice, then reload
  const handleSend = async (id: string) => {
    try {
      setActionId(id);
      await InvoiceService.submitInvoice(id);
      await refreshInvoices();
    } catch (err) {
      console.error('Failed to send invoice:', err);
      setError('Failed to send invoice. Please try again.');
    } finally {
      setActionId(null);
    }
  };

  // Client-side CSV export of the currently filtered invoices
  const handleExport = () => {
    const headers = ['Invoice Number', 'Customer', 'Customer ID', 'Invoice Date', 'Due Date', 'Amount', 'Tax', 'Total', 'Paid', 'Balance', 'Status'];
    const rows = filteredInvoices.map((inv) => [
      inv.invoiceNumber,
      inv.customerName,
      inv.customerId,
      inv.invoiceDate,
      inv.dueDate,
      inv.amount,
      inv.taxAmount,
      inv.totalAmount,
      inv.paidAmount,
      inv.totalAmount - inv.paidAmount,
      statusLabels[inv.status],
    ]);
    const escape = (v: string | number) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers, ...rows].map((r) => r.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.salesOrder.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    totalInvoices: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    paidAmount: invoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
    pendingAmount: invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0),
    overdueCount: invoices.filter((inv) => inv.status === 'overdue').length,
  };

  // Show loading skeleton
  if (loading && invoices.length === 0) {
    return (
      <div className="w-full h-full px-3 py-2 w-full max-w-full">
        <InvoicesTableSkeleton />
      </div>
    );
  }

  // Show error state
  if (error && invoices.length === 0) {
    return (
      <div className="w-full h-full px-3 py-2 w-full max-w-full">
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Invoices</h2>
          <p className="text-gray-600 mb-2">{error}</p>
          <button
            onClick={refreshInvoices}
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
    <div className="w-full h-full px-3 py-2 w-full max-w-full">
      {/* Stats */}
      <div className="mb-3 flex items-start gap-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Invoices</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalInvoices}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Paid</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  ${(stats.paidAmount / 1000).toFixed(0)}K
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">
                  ${(stats.pendingAmount / 1000).toFixed(0)}K
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Overdue</p>
                <p className="text-2xl font-bold text-red-900 mt-1">{stats.overdueCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/finance/invoices/add')}
          className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-fit flex-shrink-0"
        >
          <Plus className="h-5 w-5" />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by invoice number, customer, or sales order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedInvoices.map((inv) => {
                const balance = inv.totalAmount - inv.paidAmount;
                const isOverdue = new Date(inv.dueDate) < new Date() && balance > 0;

                return (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="flex items-start space-x-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{inv.invoiceNumber}</div>
                          <div className="text-xs text-gray-500">{inv.salesOrder}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{inv.paymentTerms}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900">{inv.customerName}</div>
                      <div className="text-sm text-gray-500">{inv.customerId}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-gray-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Invoice: {inv.invoiceDate}</span>
                        </div>
                        <div className={`flex items-center text-xs ${isOverdue ? 'text-red-600 font-semibold' : 'text-blue-600'}`}>
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Due: {inv.dueDate}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-bold text-gray-900">${inv.totalAmount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Base: ${inv.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Tax: ${inv.taxAmount.toLocaleString()}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-semibold text-green-700">${inv.paidAmount.toLocaleString()}</div>
                      {inv.paymentMethod && (
                        <div className="text-xs text-gray-500">{inv.paymentMethod}</div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className={`font-bold ${balance > 0 ? 'text-orange-700' : 'text-green-700'}`}>
                        ${balance.toLocaleString()}
                      </div>
                      {balance > 0 && (
                        <div className="text-xs text-gray-500">
                          {((inv.paidAmount / inv.totalAmount) * 100).toFixed(0)}% paid
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[inv.status]}`}>
                        {statusLabels[inv.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => router.push(`/finance/invoices/view/${inv.id}`)}
                          className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"

                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => router.push(`/finance/invoices/edit/${inv.id}`)}
                          className="flex items-center space-x-1 px-3 py-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"

                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        {inv.status === 'draft' && (
                          <button
                            onClick={() => handleSend(inv.id)}
                            disabled={actionId === inv.id}
                            className="flex items-center space-x-1 px-3 py-1.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            {actionId === inv.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            <span>Send</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredInvoices.length)} of{' '}
            {filteredInvoices.length} items
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
                      className={`px-3 py-1 rounded-lg ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'
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
