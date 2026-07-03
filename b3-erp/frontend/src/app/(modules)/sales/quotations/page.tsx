'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, FileText, Calendar, DollarSign, TrendingUp, Send, CheckCircle, Clock, Download, ChevronLeft, ChevronRight, User, Percent, Loader2, AlertCircle } from 'lucide-react';
import { quotationService, Quotation as ServiceQuotation } from '@/services/quotation.service';
import { exportToCsv } from '@/lib/export';

interface Quotation {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerId: string;
  quoteDate: string;
  validityDate: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  totalAmount: number;
  currency: string;
  marginStatus: 'Healthy' | 'Warning' | 'Critical';
  items: number;
  assignedTo: string;
  discount: number;
  notes: string;
  convertedToOrder: string | null;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-orange-100 text-orange-700',
  converted: 'bg-purple-100 text-purple-700',
};

const marginColors = {
  Healthy: 'text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200',
  Warning: 'text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200',
  Critical: 'text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200',
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
};

export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadQuotations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await quotationService.getAllQuotations();

        const mappedQuotations: Quotation[] = response.data.map((quote: ServiceQuotation) => {
          let pageStatus: Quotation['status'] = 'draft';
          const statusLower = quote.status.toLowerCase();
          if (statusLower === 'draft') pageStatus = 'draft';
          else if (statusLower === 'sent') pageStatus = 'sent';
          else if (statusLower === 'accepted') pageStatus = 'accepted';
          else if (statusLower === 'rejected') pageStatus = 'rejected';
          else if (statusLower === 'expired') pageStatus = 'expired';
          else if (statusLower === 'converted') pageStatus = 'converted';
          else if (statusLower === 'under review') pageStatus = 'sent';

          const discountPercent = quote.subtotal > 0
            ? Math.round((quote.discountAmount / quote.subtotal) * 100)
            : 0;

          return {
            id: quote.id,
            quoteNumber: quote.quotationNumber,
            customerName: quote.customerName,
            customerId: quote.customerId,
            quoteDate: quote.quotationDate,
            validityDate: quote.validUntil,
            status: pageStatus,
            marginStatus: quote.marginStatus || 'Healthy',
            currency: quote.currency || 'INR',
            totalAmount: quote.totalAmount,
            items: quote.items.length,
            assignedTo: quote.salesPersonName || 'Unassigned',
            discount: discountPercent,
            notes: quote.notes || '',
            convertedToOrder: quote.convertedToOrderNumber || null,
          };
        });

        setQuotations(mappedQuotations);
      } catch (err) {
        console.error('Error loading quotations:', err);
        setError('Failed to load quotations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadQuotations();
  }, []);

  const filteredQuotations = quotations.filter((quote) => {
    const matchesSearch =
      quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customerId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuotations = filteredQuotations.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    totalQuotes: quotations.length,
    sent: quotations.filter((q) => q.status === 'sent').length,
    accepted: quotations.filter((q) => q.status === 'accepted').length,
    conversionRate: quotations.length > 0
      ? Math.round((quotations.filter((q) => q.status === 'converted' || q.status === 'accepted').length / quotations.length) * 100)
      : 0,
  };

  const handleExport = () => {
    exportToCsv('quotations', filteredQuotations as unknown as Record<string, unknown>[]);
  };

  const handleSendQuote = (id: string) => {
    console.log(`Sending quotation ${id}...`);
  };

  if (loading) {
    return (
      <div className="w-full h-full px-4 py-2 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600 text-sm">Loading quotations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full px-4 py-2 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Stats */}
      <div className="mb-4 flex items-start gap-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Quotes</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{stats.totalQuotes}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sent</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{stats.sent}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Send className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Accepted</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{stats.accepted}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Conv. Rate</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{stats.conversionRate}%</p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/sales/quotations/create')}
          className="flex items-center gap-2 px-5 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 font-bold flex-shrink-0"
        >
          <Plus className="h-5 w-5" />
          <span>New Quote</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by quote number, customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium bg-white"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
          <option value="converted">Converted</option>
        </select>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium transition-all"
        >
          <Download className="h-4 w-4 text-gray-500" />
          <span>Export</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quotation</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount & Margin</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dates</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedQuotations.map((quote) => {
                const isExpired = new Date(quote.validityDate) < new Date() && quote.status === 'sent';
                const currencySymbol = CURRENCY_SYMBOLS[quote.currency] || quote.currency;

                return (
                  <tr key={quote.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{quote.quoteNumber}</div>
                          <div className="text-[10px] text-gray-400 font-medium px-1.5 py-0.5 bg-gray-100 rounded inline-block mt-1">
                            {quote.items} ITEMS
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-gray-900 text-sm">{quote.customerName}</div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <User className="h-3 w-3" /> {quote.assignedTo}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-black text-gray-900 text-base">
                        {currencySymbol}{quote.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase ${marginColors[quote.marginStatus]}`}>
                          {quote.marginStatus} Margin
                        </span>
                        {quote.discount > 0 && (
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                            -{quote.discount}% DISC
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${statusColors[quote.status]}`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center text-[10px] text-gray-500 font-medium">
                          <Calendar className="h-3 w-3 mr-1.5 text-gray-400" />
                          {new Date(quote.quoteDate).toLocaleDateString()}
                        </div>
                        <div className={`flex items-center text-[10px] font-bold ${isExpired ? 'text-red-500' : 'text-blue-500'}`}>
                          <Clock className="h-3 w-3 mr-1.5" />
                          EXP: {new Date(quote.validityDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => router.push(`/sales/quotations/view/${quote.id}`)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/sales/quotations/edit/${quote.id}`)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Edit Quotation"
                        >
                          <Edit className="h-4 w-4" />
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
        <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Displaying {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredQuotations.length)} of {filteredQuotations.length}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1.5 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 text-[11px] font-bold rounded-lg transition-all ${currentPage === page
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                      : 'text-gray-500 hover:bg-white border border-transparent hover:border-gray-200'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
