'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Eye, Edit, Download, Building, Calendar, DollarSign, TrendingDown, AlertCircle, CheckCircle, Clock, ChevronLeft, ChevronRight, FileText, User, CreditCard, ArrowRight, Users, RefreshCw, Loader2 } from 'lucide-react';
import { InvoiceService, Invoice as ServiceInvoice, InvoiceStatus, InvoiceType } from '@/services/invoice.service';

interface Payable {
  id: string;
  payableNumber: string;
  vendorName: string;
  vendorId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'due_soon' | 'overdue' | 'paid' | 'partially_paid';
  paymentTerms: string;
  purchaseOrder: string;
  category: string;
  agingDays: number;
  assignedTo: string;
}

// Calculate aging days
function calculateAgingDays(dueDate: Date): number {
  const today = new Date();
  const days = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

// Determine payable status based on invoice
function determinePayableStatus(invoice: ServiceInvoice): Payable['status'] {
  const today = new Date();
  const dueDate = new Date(invoice.dueDate);
  const amountDue = invoice.amountDue;

  if (amountDue <= 0) return 'paid';
  if (invoice.amountPaid > 0 && amountDue > 0) return 'partially_paid';
  if (invoice.status === InvoiceStatus.OVERDUE || dueDate < today) return 'overdue';

  // Check if due within 7 days
  const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilDue <= 7 && daysUntilDue >= 0) return 'due_soon';

  return 'pending';
}

// Determine category based on vendor name (simplified)
function determineCategory(vendorName: string): string {
  const lowerName = vendorName.toLowerCase();
  if (lowerName.includes('steel') || lowerName.includes('material') || lowerName.includes('supply')) return 'Raw Materials';
  if (lowerName.includes('tool') || lowerName.includes('equipment')) return 'Equipment';
  if (lowerName.includes('logistics') || lowerName.includes('shipping')) return 'Freight & Shipping';
  if (lowerName.includes('power') || lowerName.includes('energy')) return 'Utilities';
  if (lowerName.includes('package') || lowerName.includes('packaging')) return 'Packaging';
  if (lowerName.includes('maintenance') || lowerName.includes('service')) return 'Maintenance';
  return 'General';
}

// Transform service invoice to payable
function transformToPayable(invoice: ServiceInvoice): Payable {
  const dueDate = new Date(invoice.dueDate);
  return {
    id: `AP-${invoice.id}`,
    payableNumber: `AP-${invoice.invoiceNumber.replace('INV-', '')}`,
    vendorName: invoice.vendorName || invoice.customerName,
    vendorId: invoice.vendorId || '',
    invoiceNumber: invoice.reference || invoice.invoiceNumber,
    invoiceDate: new Date(invoice.invoiceDate).toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    amount: invoice.subtotal,
    taxAmount: invoice.totalTax,
    totalAmount: invoice.totalAmount,
    paidAmount: invoice.amountPaid,
    status: determinePayableStatus(invoice),
    paymentTerms: invoice.paymentTerms.replace('_', ' '),
    purchaseOrder: invoice.poNumber || '',
    category: determineCategory(invoice.vendorName || invoice.customerName),
    agingDays: calculateAgingDays(dueDate),
    assignedTo: invoice.submittedBy || 'Finance Team',
  };
}

const statusColors = {
  pending: 'bg-gray-100 text-gray-700',
  due_soon: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
  partially_paid: 'bg-blue-100 text-blue-700',
};

const statusLabels = {
  pending: 'Pending',
  due_soon: 'Due Soon',
  overdue: 'Overdue',
  paid: 'Paid',
  partially_paid: 'Partially Paid',
};

// Loading skeleton for payables table
function PayablesTableSkeleton() {
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

export default function PayablesPage() {
  const router = useRouter();
  const [payables, setPayables] = useState<Payable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch payables from invoice service (purchase invoices)
  useEffect(() => {
    async function fetchPayables() {
      try {
        setLoading(true);
        setError(null);
        const response = await InvoiceService.getAllInvoices({
          type: InvoiceType.PURCHASE,
          limit: 100,
        });
        // Transform purchase invoices to payables
        const payableInvoices = response.data.map(transformToPayable);
        setPayables(payableInvoices);
      } catch (err) {
        console.error('Failed to fetch payables:', err);
        setError('Failed to load payables. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchPayables();
  }, []);

  // Refresh function
  const refreshPayables = async () => {
    try {
      setLoading(true);
      const response = await InvoiceService.getAllInvoices({
        type: InvoiceType.PURCHASE,
        limit: 100,
      });
      const payableInvoices = response.data.map(transformToPayable);
      setPayables(payableInvoices);
    } catch (err) {
      console.error('Failed to refresh payables:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayables = payables.filter((payable) => {
    const matchesSearch =
      payable.payableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payable.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payable.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payable.purchaseOrder.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payable.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || payable.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filteredPayables.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayables = filteredPayables.slice(startIndex, startIndex + itemsPerPage);

  // Client-side CSV export from already-fetched (filtered) payables
  const handleExport = () => {
    const headers = ['Payable', 'Vendor', 'Vendor ID', 'Invoice', 'Invoice Date', 'Due Date', 'PO', 'Category', 'Total', 'Paid', 'Balance', 'Status', 'Aging Days', 'Assigned To'];
    const rows = filteredPayables.map((p) => [
      p.payableNumber,
      p.vendorName,
      p.vendorId,
      p.invoiceNumber,
      p.invoiceDate,
      p.dueDate,
      p.purchaseOrder,
      p.category,
      p.totalAmount,
      p.paidAmount,
      p.totalAmount - p.paidAmount,
      statusLabels[p.status],
      p.agingDays,
      p.assignedTo,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payables_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stats = {
    totalPayables: payables.reduce((sum, p) => sum + (p.totalAmount - p.paidAmount), 0),
    dueThisWeek: payables
      .filter((p) => {
        const daysUntilDue = Math.ceil((new Date(p.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilDue <= 7 && daysUntilDue >= 0 && p.paidAmount < p.totalAmount;
      })
      .reduce((sum, p) => sum + (p.totalAmount - p.paidAmount), 0),
    overdue: payables.filter((p) => p.status === 'overdue').reduce((sum, p) => sum + (p.totalAmount - p.paidAmount), 0),
    paidThisMonth: payables
      .filter((p) => {
        const paymentDate = new Date(p.invoiceDate);
        const currentMonth = new Date().getMonth();
        return paymentDate.getMonth() === currentMonth && p.status === 'paid';
      })
      .reduce((sum, p) => sum + p.paidAmount, 0),
  };

  // Show loading skeleton
  if (loading && payables.length === 0) {
    return (
      <div className="w-full h-full px-3 py-2">
        <PayablesTableSkeleton />
      </div>
    );
  }

  // Show error state
  if (error && payables.length === 0) {
    return (
      <div className="w-full h-full px-3 py-2">
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Payables</h2>
          <p className="text-gray-600 mb-2">{error}</p>
          <button
            onClick={refreshPayables}
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
    <div className="w-full h-full px-3 py-2">
      {/* Stats */}
      <div className="mb-3 flex items-start gap-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Payables</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">${(stats.totalPayables / 1000).toFixed(0)}K</p>
              </div>
              <TrendingDown className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Paid This Month</p>
                <p className="text-2xl font-bold text-green-900 mt-1">${(stats.paidThisMonth / 1000).toFixed(0)}K</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Due This Week</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">${(stats.dueThisWeek / 1000).toFixed(0)}K</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Overdue</p>
                <p className="text-2xl font-bold text-red-900 mt-1">${(stats.overdue / 1000).toFixed(0)}K</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/finance/payables/add')}
          className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-fit flex-shrink-0"
        >
          <Plus className="h-5 w-5" />
          <span>Add Payable</span>
        </button>
      </div>

      {/* Quick Access - Payables Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <Link
          href="/finance/payables/aging"
          className="group flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">Aging Report</h4>
            <p className="text-xs text-gray-500">AP aging analysis</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/finance/payables/vendor-management"
          className="group flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 group-hover:text-purple-600">Vendor Management</h4>
            <p className="text-xs text-gray-500">Payment terms & vendors</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/finance/payables/bills"
          className="group flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200"
        >
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
            <FileText className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 group-hover:text-green-600">Vendor Bills</h4>
            <p className="text-xs text-gray-500">Manage vendor invoices</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/finance/payables/payments"
          className="group flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200"
        >
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
            <CreditCard className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">Payments</h4>
            <p className="text-xs text-gray-500">Process vendor payments</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by payable number, vendor, invoice, or PO..."
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
          <option value="pending">Pending</option>
          <option value="due_soon">Due Soon</option>
          <option value="overdue">Overdue</option>
          <option value="paid">Paid</option>
          <option value="partially_paid">Partially Paid</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="Raw Materials">Raw Materials</option>
          <option value="Equipment">Equipment</option>
          <option value="Freight & Shipping">Freight & Shipping</option>
          <option value="Utilities">Utilities</option>
          <option value="Packaging">Packaging</option>
          <option value="Maintenance">Maintenance</option>
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payable</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedPayables.map((payable) => {
                const balance = payable.totalAmount - payable.paidAmount;
                const isOverdue = new Date(payable.dueDate) < new Date() && balance > 0;

                return (
                  <tr key={payable.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="flex items-start space-x-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <TrendingDown className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{payable.payableNumber}</div>
                          <div className="text-xs text-gray-500">{payable.purchaseOrder}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{payable.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{payable.vendorName}</div>
                          <div className="text-sm text-gray-500">{payable.vendorId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-blue-600">{payable.invoiceNumber}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{payable.paymentTerms}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-gray-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Invoice: {payable.invoiceDate}</span>
                        </div>
                        <div className={`flex items-center text-xs ${isOverdue ? 'text-red-600 font-semibold' : 'text-blue-600'}`}>
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Due: {payable.dueDate}</span>
                        </div>
                        <div className="text-xs text-gray-500">Aging: {payable.agingDays} days</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-bold text-gray-900">${payable.totalAmount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Base: ${payable.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Tax: ${payable.taxAmount.toLocaleString()}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-semibold text-green-700">${payable.paidAmount.toLocaleString()}</div>
                      {payable.paidAmount > 0 && (
                        <div className="text-xs text-gray-500">
                          {((payable.paidAmount / payable.totalAmount) * 100).toFixed(0)}% paid
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className={`font-bold ${balance > 0 ? 'text-orange-700' : 'text-green-700'}`}>
                        ${balance.toLocaleString()}
                      </div>
                      {balance > 0 && isOverdue && (
                        <div className="text-xs text-red-600 font-semibold">Payment Overdue</div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[payable.status]}`}>
                        {statusLabels[payable.status]}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        <User className="h-3 w-3 inline mr-1" />
                        {payable.assignedTo}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => router.push(`/finance/payables/view/${payable.id}`)}
                          className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"

                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => router.push(`/finance/payables/edit/${payable.id}`)}
                          className="flex items-center space-x-1 px-3 py-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"

                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
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
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPayables.length)} of{' '}
            {filteredPayables.length} items
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
