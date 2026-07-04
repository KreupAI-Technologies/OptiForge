'use client';

import React, { useState, useEffect } from 'react';
import { FinanceService } from '@/services/finance.service';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Send,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Printer,
  Mail,
  Copy,
  Calendar,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import {
  CreateInvoiceModal,
  ViewInvoiceModal,
  SendInvoiceModal
} from '@/components/finance/ar/InvoicesModals';
import {
  RecordPaymentModal,
  VoidInvoiceModal,
  DuplicateInvoiceModal,
  InvoiceAdjustmentModal,
  PrintInvoiceOptionsModal,
  PaymentReminderModal,
  InvoiceHistoryModal
} from '@/components/finance/ar/InvoicesModals2';

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerName: string;
  customerCode: string;
  gstin: string;
  billToAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'Draft' | 'Sent' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled';
  paymentTerms: string;
  notes?: string;
  createdBy: string;
  createdDate: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  hsnCode: string;
}

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await FinanceService.getInvoices({ invoiceType: 'Sales Invoice' });
        const statuses = ['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'];
        const mapped: Invoice[] = (Array.isArray(raw) ? raw : []).map((r: any) => {
          const tax = Number(r.taxAmount ?? 0);
          const rawStatus = String(r.status ?? 'Draft');
          const status = statuses.includes(rawStatus) ? rawStatus : 'Draft';
          const items: InvoiceItem[] = Array.isArray(r.lineItems)
            ? r.lineItems.map((li: any) => ({
                description: li.description ?? li.productName ?? '',
                quantity: Number(li.quantity ?? 0),
                rate: Number(li.unitPrice ?? 0),
                amount: Number(li.totalAmount ?? li.amount ?? 0),
                hsnCode: li.productCode ?? '',
              }))
            : [];
          return {
            id: r.id ?? '',
            invoiceNumber: r.invoiceNumber ?? '',
            invoiceDate: r.invoiceDate ? String(r.invoiceDate).slice(0, 10) : '',
            dueDate: r.dueDate ? String(r.dueDate).slice(0, 10) : '',
            customerName: r.partyName ?? '',
            customerCode: r.partyId ?? '',
            gstin: r.gstin ?? '',
            billToAddress: r.billingAddress ?? '',
            items,
            subtotal: Number(r.subtotal ?? 0),
            cgst: Number(r.cgst ?? tax / 2),
            sgst: Number(r.sgst ?? tax / 2),
            igst: Number(r.igst ?? 0),
            totalAmount: Number(r.totalAmount ?? 0),
            paidAmount: Number(r.paidAmount ?? 0),
            balanceAmount: Number(r.balanceAmount ?? (Number(r.totalAmount ?? 0) - Number(r.paidAmount ?? 0))),
            status: status as Invoice['status'],
            paymentTerms: r.paymentTerms ?? '',
            notes: r.notes ?? undefined,
            createdBy: r.createdBy ?? '',
            createdDate: r.createdAt ? String(r.createdAt).slice(0, 10) : '',
          };
        });
        if (!cancelled) setInvoices(mapped);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load invoices');
          setInvoices([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);


  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

    let matchesDate = true;
    if (dateFilter === 'this-month') {
      const invoiceMonth = new Date(invoice.invoiceDate).getMonth();
      const currentMonth = new Date().getMonth();
      matchesDate = invoiceMonth === currentMonth;
    } else if (dateFilter === 'last-month') {
      const invoiceMonth = new Date(invoice.invoiceDate).getMonth();
      const lastMonth = new Date().getMonth() - 1;
      matchesDate = invoiceMonth === lastMonth;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate statistics
  const totalInvoices = invoices.length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);
  const overdueCount = invoices.filter(inv => inv.status === 'Overdue').length;

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
      Sent: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      'Partially Paid': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      Paid: 'bg-green-500/20 text-green-400 border-green-500/50',
      Overdue: 'bg-red-500/20 text-red-400 border-red-500/50',
      Cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    };
    const icons = {
      Draft: Clock,
      Sent: Send,
      'Partially Paid': AlertTriangle,
      Paid: CheckCircle,
      Overdue: XCircle,
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

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 p-3">
      <div className="space-y-3">
        {isLoading && (
          <div className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">Loading invoices…</div>
        )}
        {loadError && !isLoading && (
          <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">{loadError}</div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Sales Invoices</h1>
            <p className="text-gray-400">Manage customer invoices and receivables</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                console.log('Create Invoice button clicked');
                setIsCreateModalOpen(true);
                console.log('Modal state set to true');
              }}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Invoice
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{totalInvoices}</div>
            <div className="text-blue-100 text-sm">Total Invoices</div>
            <div className="mt-2 text-xs text-blue-100">This period</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(totalRevenue)}</div>
            <div className="text-green-100 text-sm">Total Revenue</div>
            <div className="mt-2 text-xs text-green-100">Invoiced amount</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 opacity-80" />
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(totalOutstanding)}</div>
            <div className="text-orange-100 text-sm">Outstanding Amount</div>
            <div className="mt-2 text-xs text-orange-100">
              {((totalOutstanding / totalRevenue) * 100).toFixed(0)}% of revenue
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-8 h-8 opacity-80" />
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{overdueCount}</div>
            <div className="text-red-100 text-sm">Overdue Invoices</div>
            <div className="mt-2 text-xs text-red-100">Requires follow-up</div>
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
                  placeholder="Search by invoice number or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Time</option>
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="this-quarter">This Quarter</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Invoice #</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Customer</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Date</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Due Date</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Amount</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Paid</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Balance</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => {
                  const daysUntilDue = getDaysUntilDue(invoice.dueDate);
                  const isDueColor = daysUntilDue < 0 ? 'text-red-400' : daysUntilDue <= 7 ? 'text-orange-400' : 'text-gray-400';

                  return (
                    <tr key={invoice.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                      <td className="px-3 py-2">
                        <div className="font-medium text-white font-mono">{invoice.invoiceNumber}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {invoice.items.length} item{invoice.items.length > 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-white">{invoice.customerName}</div>
                        <div className="text-xs text-gray-400 font-mono mt-1">{invoice.customerCode}</div>
                      </td>
                      <td className="px-3 py-2 text-white text-sm">
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2">
                        <div className={`text-sm ${isDueColor}`}>
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </div>
                        <div className={`text-xs mt-1 ${isDueColor}`}>
                          {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
                           daysUntilDue === 0 ? 'Due today' :
                           `${daysUntilDue} days left`}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right text-white font-medium">
                        {formatCurrency(invoice.totalAmount)}
                      </td>
                      <td className="px-3 py-2 text-right text-green-400 font-medium">
                        {formatCurrency(invoice.paidAmount)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className={`font-medium ${invoice.balanceAmount > 0 ? 'text-orange-400' : 'text-gray-600'}`}>
                          {formatCurrency(invoice.balanceAmount)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setIsViewModalOpen(true);
                            }}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Invoice"
                          >
                            <Eye className="w-4 h-4 text-blue-400" />
                          </button>
                          {invoice.status === 'Draft' && (
                            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors" title="Edit Invoice">
                              <Edit className="w-4 h-4 text-green-400" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setIsPrintModalOpen(true);
                            }}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Print Invoice"
                          >
                            <Printer className="w-4 h-4 text-purple-400" />
                          </button>
                          {invoice.status !== 'Sent' && invoice.status !== 'Paid' && (
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setIsSendModalOpen(true);
                              }}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title="Send Invoice"
                            >
                              <Send className="w-4 h-4 text-cyan-400" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setIsDuplicateModalOpen(true);
                            }}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Duplicate Invoice"
                          >
                            <Copy className="w-4 h-4 text-yellow-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-600 mb-2" />
              <p className="text-gray-400 text-lg">No invoices found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredInvoices.length > 0 && (
          <div className="flex items-center justify-between bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700">
            <div className="text-gray-400 text-sm">
              Showing {filteredInvoices.length} of {invoices.length} invoices
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg">1</button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">2</button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <ViewInvoiceModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        invoiceId={selectedInvoice?.id}
      />

      <SendInvoiceModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        invoiceNumber={selectedInvoice?.invoiceNumber}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentModalOpen}
        onClose={() => setIsRecordPaymentModalOpen(false)}
        invoice={selectedInvoice}
      />

      <VoidInvoiceModal
        isOpen={isVoidModalOpen}
        onClose={() => setIsVoidModalOpen(false)}
        invoice={selectedInvoice}
      />

      <DuplicateInvoiceModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        invoice={selectedInvoice}
      />

      <PrintInvoiceOptionsModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        invoice={selectedInvoice}
      />

      <InvoiceHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
}
