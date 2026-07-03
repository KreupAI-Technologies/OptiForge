'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, FileText, Send, DollarSign, AlertCircle, CheckCircle, Clock, XCircle, Download, TrendingUp, CreditCard, X, User, Calendar, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToCsv } from '@/lib/export';
import { ServiceBillingService } from '@/services/service-billing.service';

interface ServiceInvoice {
  id: string;
  invoiceNumber: string;
  invoiceType: 'Service' | 'AMC' | 'Installation' | 'Parts' | 'Warranty';
  customerId: string;
  customerName: string;
  status: 'draft' | 'sent' | 'paid' | 'partial_paid' | 'overdue' | 'void';
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  totalTax: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paymentTerms: string;
  serviceJobId?: string;
  contractId?: string;
  overdueDays?: number;
}


const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  partial_paid: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
  void: 'bg-gray-100 text-gray-700',
};

const statusIcons = {
  draft: Clock,
  sent: Send,
  paid: CheckCircle,
  partial_paid: DollarSign,
  overdue: AlertCircle,
  void: XCircle,
};

const invoiceTypeColors = {
  'Service': 'bg-blue-100 text-blue-700',
  'AMC': 'bg-purple-100 text-purple-700',
  'Installation': 'bg-orange-100 text-orange-700',
  'Parts': 'bg-cyan-100 text-cyan-700',
  'Warranty': 'bg-green-100 text-green-700',
};

export default function ServiceBillingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState<ServiceInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await ServiceBillingService.getAllInvoices();
        const mapped: ServiceInvoice[] = (Array.isArray(raw) ? raw : []).map((i: any) => {
          const total = Number(i.totalAmount ?? i.total_amount ?? 0);
          const paid = Number(i.paidAmount ?? i.paid_amount ?? 0);
          const balance = Number(i.balanceAmount ?? i.balance_amount ?? (total - paid));
          const paymentStatus: ServiceInvoice['paymentStatus'] =
            paid <= 0 ? 'unpaid' : balance > 0 ? 'partial' : 'paid';
          return {
            id: String(i.id ?? ''),
            invoiceNumber: i.invoiceNumber ?? i.invoice_number ?? '',
            invoiceType: (i.invoiceType ?? i.invoice_type ?? 'Service') as ServiceInvoice['invoiceType'],
            customerId: String(i.customerId ?? i.customer_id ?? ''),
            customerName: i.customerName ?? i.customer_name ?? '',
            status: (i.status ?? 'draft') as ServiceInvoice['status'],
            invoiceDate: i.invoiceDate ?? i.invoice_date ?? i.createdAt ?? '',
            dueDate: i.dueDate ?? i.due_date ?? '',
            subtotal: Number(i.subtotal ?? 0),
            totalTax: Number(i.totalTax ?? i.total_tax ?? 0),
            totalAmount: total,
            paidAmount: paid,
            balanceAmount: balance,
            paymentStatus: (i.paymentStatus as ServiceInvoice['paymentStatus']) ?? paymentStatus,
            paymentTerms: i.paymentTerms ?? i.payment_terms ?? '',
            serviceJobId: i.serviceJobId ?? i.service_job_id ?? undefined,
            contractId: i.contractId ?? i.contract_id ?? undefined,
            overdueDays: i.overdueDays != null ? Number(i.overdueDays) : undefined,
          };
        });
        if (!cancelled) setInvoices(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load invoices');
          setInvoices([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ServiceInvoice | null>(null);
  const itemsPerPage = 10;

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesType = typeFilter === 'all' || invoice.invoiceType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate statistics
  const stats = {
    totalInvoices: invoices.length,
    draftInvoices: invoices.filter(i => i.status === 'draft').length,
    sentInvoices: invoices.filter(i => i.status === 'sent').length,
    paidInvoices: invoices.filter(i => i.status === 'paid').length,
    overdueInvoices: invoices.filter(i => i.status === 'overdue').length,
    totalInvoiced: invoices.reduce((sum, i) => sum + i.totalAmount, 0),
    totalCollected: invoices.reduce((sum, i) => sum + i.paidAmount, 0),
    totalOutstanding: invoices.reduce((sum, i) => sum + i.balanceAmount, 0),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleViewDetails = (invoice: ServiceInvoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  const handleSendInvoice = (invoice: ServiceInvoice) => {
    setSelectedInvoice(invoice);
    setShowSendModal(true);
  };

  const handleConfirmSend = () => {
    toast({
      title: "Invoice Sent",
      description: `Invoice ${selectedInvoice?.invoiceNumber} has been sent to the customer.`,
    });
    setShowSendModal(false);
    setSelectedInvoice(null);
  };

  const handleExport = () => {
    exportToCsv('service-billing-invoices', filteredInvoices as unknown as Record<string, unknown>[]);
    toast({
      title: "Report Exported",
      description: "Invoice report has been exported successfully.",
    });
  };

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Billing</h1>
        <p className="text-gray-600">Manage invoices and payment tracking</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading invoices…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && invoices.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No invoices found.
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-2 mb-3">
        <button onClick={() => setStatusFilter('all')} className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-blue-500 transition-all text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
              <p className="text-xs text-blue-600 mt-1">Click to view all</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </button>

        <button onClick={() => setStatusFilter('draft')} className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-gray-500 transition-all text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-600">{stats.draftInvoices}</p>
              <p className="text-xs text-gray-600 mt-1">Click to filter</p>
            </div>
            <Clock className="h-8 w-8 text-gray-600" />
          </div>
        </button>

        <button onClick={() => setStatusFilter('sent')} className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-blue-500 transition-all text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-blue-600">{stats.sentInvoices}</p>
              <p className="text-xs text-blue-600 mt-1">Click to filter</p>
            </div>
            <Send className="h-8 w-8 text-blue-600" />
          </div>
        </button>

        <button onClick={() => setStatusFilter('paid')} className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-green-500 transition-all text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-green-600">{stats.paidInvoices}</p>
              <p className="text-xs text-green-600 mt-1">Click to filter</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </button>

        <button onClick={() => setStatusFilter('overdue')} className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-red-500 transition-all text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdueInvoices}</p>
              <p className="text-xs text-red-600 mt-1">Click to filter</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-3 col-span-1 lg:col-span-3">
          <div className="grid grid-cols-3 gap-2 h-full">
            <div className="flex flex-col justify-center">
              <p className="text-xs text-gray-600">Invoiced</p>
              <p className="text-lg font-bold text-purple-600">{formatCurrency(stats.totalInvoiced)}</p>
            </div>
            <div className="flex flex-col justify-center border-l border-gray-200 pl-4">
              <p className="text-xs text-gray-600">Collected</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(stats.totalCollected)}</p>
            </div>
            <div className="flex flex-col justify-center border-l border-gray-200 pl-4">
              <p className="text-xs text-gray-600">Outstanding</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(stats.totalOutstanding)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center justify-between">
          <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by invoice number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="partial_paid">Partial Paid</option>
              <option value="overdue">Overdue</option>
              <option value="void">Void</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Types</option>
              <option value="Service">Service</option>
              <option value="AMC">AMC</option>
              <option value="Installation">Installation</option>
              <option value="Parts">Parts</option>
              <option value="Warranty">Warranty</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push('/after-sales-service/billing/payments')}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Payments
            </button>
            <button onClick={handleExport} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => router.push('/after-sales-service/billing/create')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Details
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedInvoices.map((invoice) => {
                const StatusIcon = statusIcons[invoice.status];
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</span>
                        <span className="text-sm text-gray-600">{invoice.customerName}</span>
                        {invoice.serviceJobId && (
                          <span className="text-xs text-blue-600 mt-1">Job: {invoice.serviceJobId}</span>
                        )}
                        {invoice.contractId && (
                          <span className="text-xs text-purple-600 mt-1">Contract: {invoice.contractId}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${invoiceTypeColors[invoice.invoiceType]}`}>
                        {invoice.invoiceType}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit ${statusColors[invoice.status]}`}>
                          <StatusIcon className="h-3 w-3" />
                          {invoice.status.replace('_', ' ').charAt(0).toUpperCase() + invoice.status.slice(1).replace('_', ' ')}
                        </span>
                        {invoice.overdueDays && invoice.overdueDays > 0 && (
                          <span className="text-xs text-red-600 font-medium">
                            {invoice.overdueDays} days overdue
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col text-sm">
                        <span className="text-gray-600 text-xs">Issued:</span>
                        <span className="text-gray-900">
                          {new Date(invoice.invoiceDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="text-gray-600 text-xs mt-1">Due:</span>
                        <span className={invoice.status === 'overdue' ? 'text-red-600' : 'text-gray-900'}>
                          {new Date(invoice.dueDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(invoice.totalAmount)}</span>
                        <span className="text-xs text-gray-500">Tax: {formatCurrency(invoice.totalTax)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {invoice.paidAmount > 0 ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-green-600">{formatCurrency(invoice.paidAmount)}</span>
                          <span className="text-xs text-gray-500">{invoice.paymentStatus === 'paid' ? 'Fully Paid' : 'Partial'}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No payment</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {invoice.balanceAmount > 0 ? (
                        <span className="text-sm font-medium text-red-600">{formatCurrency(invoice.balanceAmount)}</span>
                      ) : (
                        <span className="text-sm text-green-600">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(invoice)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {invoice.status === 'draft' && (
                          <button
                            onClick={() => router.push(`/after-sales-service/billing/edit/${invoice.id}`)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit Invoice"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {(invoice.status === 'draft' || invoice.status === 'sent') && (
                          <button
                            onClick={() => handleSendInvoice(invoice)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Send Invoice"
                          >
                            <Send className="h-4 w-4" />
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
        {totalPages > 1 && (
          <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} invoices
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {showDetailsModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{selectedInvoice.invoiceNumber}</h2>
                <p className="text-blue-100 text-sm">Invoice Details & Summary</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3">
              {/* Status Banner */}
              <div className={`rounded-lg p-3 border-2 ${selectedInvoice.status === 'paid' ? 'bg-green-50 border-green-200' :
                  selectedInvoice.status === 'overdue' ? 'bg-red-50 border-red-200' :
                    selectedInvoice.status === 'sent' ? 'bg-blue-50 border-blue-200' :
                      selectedInvoice.status === 'partial_paid' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-gray-50 border-gray-200'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedInvoice.status === 'paid' && <CheckCircle className="h-8 w-8 text-green-600" />}
                    {selectedInvoice.status === 'overdue' && <AlertCircle className="h-8 w-8 text-red-600" />}
                    {selectedInvoice.status === 'sent' && <Send className="h-8 w-8 text-blue-600" />}
                    {selectedInvoice.status === 'partial_paid' && <DollarSign className="h-8 w-8 text-yellow-600" />}
                    {selectedInvoice.status === 'draft' && <Clock className="h-8 w-8 text-gray-600" />}
                    <div>
                      <h3 className={`text-lg font-bold ${selectedInvoice.status === 'paid' ? 'text-green-900' :
                          selectedInvoice.status === 'overdue' ? 'text-red-900' :
                            selectedInvoice.status === 'sent' ? 'text-blue-900' :
                              selectedInvoice.status === 'partial_paid' ? 'text-yellow-900' :
                                'text-gray-900'
                        }`}>
                        {selectedInvoice.status === 'paid' ? 'Fully Paid' :
                          selectedInvoice.status === 'overdue' ? `Overdue (${selectedInvoice.overdueDays} days)` :
                            selectedInvoice.status === 'sent' ? 'Sent to Customer' :
                              selectedInvoice.status === 'partial_paid' ? 'Partially Paid' :
                                'Draft Invoice'}
                      </h3>
                      <p className={`text-sm ${selectedInvoice.status === 'paid' ? 'text-green-700' :
                          selectedInvoice.status === 'overdue' ? 'text-red-700' :
                            selectedInvoice.status === 'sent' ? 'text-blue-700' :
                              selectedInvoice.status === 'partial_paid' ? 'text-yellow-700' :
                                'text-gray-700'
                        }`}>
                        {selectedInvoice.paymentTerms}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${invoiceTypeColors[selectedInvoice.invoiceType]}`}>
                      {selectedInvoice.invoiceType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer & Date Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-purple-700 font-medium">Customer Name</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedInvoice.customerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-700 font-medium">Customer ID</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedInvoice.customerId}</p>
                    </div>
                    {selectedInvoice.serviceJobId && (
                      <div>
                        <p className="text-xs text-purple-700 font-medium">Service Job</p>
                        <p className="text-sm text-blue-600 font-semibold">{selectedInvoice.serviceJobId}</p>
                      </div>
                    )}
                    {selectedInvoice.contractId && (
                      <div>
                        <p className="text-xs text-purple-700 font-medium">Contract</p>
                        <p className="text-sm text-purple-600 font-semibold">{selectedInvoice.contractId}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Date Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-blue-700 font-medium">Invoice Date</p>
                      <p className="text-sm text-gray-900 font-semibold">
                        {new Date(selectedInvoice.invoiceDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 font-medium">Due Date</p>
                      <p className={`text-sm font-semibold ${selectedInvoice.status === 'overdue' ? 'text-red-600' : 'text-gray-900'}`}>
                        {new Date(selectedInvoice.dueDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 font-medium">Payment Terms</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedInvoice.paymentTerms}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-5 border border-emerald-200">
                <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Amount Breakdown
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-emerald-200">
                    <span className="text-sm text-gray-700 font-medium">Subtotal</span>
                    <span className="text-lg font-semibold text-gray-900">{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-emerald-200">
                    <span className="text-sm text-gray-700 font-medium">Total Tax (18% GST)</span>
                    <span className="text-lg font-semibold text-gray-900">{formatCurrency(selectedInvoice.totalTax)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b-2 border-emerald-400">
                    <span className="text-base text-gray-900 font-bold">Total Amount</span>
                    <span className="text-2xl font-bold text-emerald-600">{formatCurrency(selectedInvoice.totalAmount)}</span>
                  </div>
                  {selectedInvoice.paidAmount > 0 && (
                    <div className="flex justify-between items-center pb-2 border-b border-emerald-200">
                      <span className="text-sm text-gray-700 font-medium">Paid Amount</span>
                      <span className="text-lg font-semibold text-green-600">{formatCurrency(selectedInvoice.paidAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-base text-gray-900 font-bold">Balance Due</span>
                    <span className={`text-2xl font-bold ${selectedInvoice.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedInvoice.balanceAmount > 0 ? formatCurrency(selectedInvoice.balanceAmount) : 'Fully Paid'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <h4 className="font-bold text-orange-900 mb-3">Payment Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">Payment Progress</span>
                    <span className="font-bold text-orange-600">
                      {((selectedInvoice.paidAmount / selectedInvoice.totalAmount) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${selectedInvoice.paymentStatus === 'paid' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          selectedInvoice.paymentStatus === 'partial' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gray-300'
                        }`}
                      style={{ width: `${(selectedInvoice.paidAmount / selectedInvoice.totalAmount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-3 py-2 flex justify-end gap-3 border-t">
              <button onClick={() => setShowDetailsModal(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                Close
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Invoice Modal */}
      {showSendModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-2 rounded-t-lg">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Send className="h-6 w-6" />
                Send Invoice
              </h2>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to send invoice <strong>{selectedInvoice.invoiceNumber}</strong> to <strong>{selectedInvoice.customerName}</strong>?
              </p>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-sm text-blue-900 mb-2"><strong>Invoice Details:</strong></p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Amount: {formatCurrency(selectedInvoice.totalAmount)}</li>
                  <li>• Type: {selectedInvoice.invoiceType}</li>
                  <li>• Due Date: {new Date(selectedInvoice.dueDate).toLocaleDateString('en-IN')}</li>
                </ul>
              </div>
              <p className="text-xs text-gray-600 mt-4">
                The invoice will be sent via email to the customer's registered email address.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-3 py-2 flex justify-end gap-3 border-t rounded-b-lg">
              <button
                onClick={() => {
                  setShowSendModal(false);
                  setSelectedInvoice(null);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSend}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
