'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Search, DollarSign, TrendingUp, CheckCircle, Clock, XCircle, Calendar, User, Building2, Download, Send, Eye, Edit, Copy, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/ui';
import { crmService } from '@/services/crm.service';

interface Quote {
  id: string;
  quoteNumber: string;
  title: string;
  customer: string;
  contact: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  amount: number;
  discount: number;
  finalAmount: number;
  validUntil: string;
  createdDate: string;
  sentDate?: string;
  acceptedDate?: string;
  owner: string;
  products: number;
  probability: number;
}

export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend (NestJS CrmQuote) uses different field names than the page's
        // Quote model; map defensively and coerce numeric amounts.
        const raw = (await crmService.quotes.getAll()) as any[];
        const mapped: Quote[] = (raw || []).map((q) => ({
          id: String(q.id),
          quoteNumber: q.quoteNumber ?? '',
          title: q.title ?? '',
          customer: q.customerName ?? '',
          contact: q.contactName ?? '',
          status: (q.status ?? 'draft') as Quote['status'],
          amount: Number(q.subtotal ?? q.amount ?? 0),
          discount: Number(q.discountAmount ?? q.discount ?? 0),
          finalAmount: Number(q.totalAmount ?? q.finalAmount ?? 0),
          validUntil: q.validUntil ?? '',
          createdDate: q.createdAt ?? q.createdDate ?? '',
          sentDate: q.sentDate ?? undefined,
          acceptedDate: q.acceptedDate ?? undefined,
          owner: q.preparedByName ?? q.owner ?? '',
          products: Array.isArray(q.items) ? q.items.length : Number(q.products ?? 0),
          probability: Number(q.probability ?? 0),
        }));
        if (!cancelled) setQuotes(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load quotes');
          setQuotes([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'probability'>('date');
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const filteredQuotes = quotes
    .filter(quote => {
      const matchesSearch = quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quote.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || quote.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
        case 'amount':
          return b.finalAmount - a.finalAmount;
        case 'probability':
          return b.probability - a.probability;
        default:
          return 0;
      }
    });

  const stats = {
    totalQuotes: quotes.length,
    totalValue: quotes.reduce((sum, q) => sum + q.finalAmount, 0),
    sent: quotes.filter(q => ['sent', 'viewed', 'accepted'].includes(q.status)).length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    acceptanceRate: quotes.filter(q => ['sent', 'viewed', 'accepted', 'rejected'].includes(q.status)).length > 0
      ? (quotes.filter(q => q.status === 'accepted').length / quotes.filter(q => ['sent', 'viewed', 'accepted', 'rejected'].includes(q.status)).length) * 100
      : 0,
    avgDealSize: quotes.length > 0 ? quotes.reduce((sum, q) => sum + q.finalAmount, 0) / quotes.length : 0,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'sent':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'viewed':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'accepted':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'expired':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'sent':
        return <Send className="w-4 h-4" />;
      case 'viewed':
        return <Eye className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'expired':
        return <Clock className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const isExpiringSoon = (validUntil: string) => {
    const daysUntilExpiry = Math.ceil((new Date(validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const handleViewQuote = (quote: Quote) => {
    router.push(`/crm/quotes/view/${quote.id}`);
  };

  const handleDownloadQuote = (quote: Quote) => {
    // Simulate PDF download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${quote.quoteNumber}.pdf`;
    // In a real app, this would download the actual PDF
  };

  const handleEditQuote = (quote: Quote) => {
    router.push(`/crm/quotes/edit/${quote.id}`);
  };

  const handleCopyQuote = (quote: Quote) => {
    const newQuote = {
      ...quote,
      id: Date.now().toString(),
      quoteNumber: `QT-${new Date().getFullYear()}-${(quotes.length + 1).toString().padStart(3, '0')}`,
      status: 'draft' as const,
      createdDate: new Date().toISOString().split('T')[0],
      sentDate: undefined,
      acceptedDate: undefined,
    };
    setQuotes([...quotes, newQuote]);
  };

  const handleSendQuote = (quote: Quote) => {
    setQuotes(quotes.map(q =>
      q.id === quote.id ? { ...q, status: 'sent', sentDate: new Date().toISOString().split('T')[0] } : q
    ));
  };

  const handleDeleteQuote = (quote: Quote) => {
    setQuoteToDelete(quote);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (quoteToDelete) {
      setQuotes(quotes.filter(q => q.id !== quoteToDelete.id));
      setShowDeleteDialog(false);
      setQuoteToDelete(null);
    }
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading quotes…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && quotes.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No quotes found.
        </div>
      )}
      <div className="mb-8">
        <div className="flex justify-end mb-3">
          <Link href="/crm/quotes/create">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Create Quote
            </button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalQuotes}</div>
            <div className="text-blue-100">Total Quotes</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">${(stats.totalValue / 1000000).toFixed(2)}M</div>
            <div className="text-green-100">Total Value</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Send className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.sent}</div>
            <div className="text-purple-100">Sent</div>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.accepted}</div>
            <div className="text-teal-100">Accepted</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.acceptanceRate.toFixed(0)}%</div>
            <div className="text-orange-100">Acceptance Rate</div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">${(stats.avgDealSize / 1000).toFixed(0)}K</div>
            <div className="text-pink-100">Avg Deal Size</div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          <Link href="/crm/quotes/templates">
            <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <Copy className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Quote Templates</h3>
                  <p className="text-sm text-gray-600">Manage quote templates</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/crm/quotes/pricing">
            <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Pricing Rules</h3>
                  <p className="text-sm text-gray-600">Configure pricing & discounts</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/crm/proposals">
            <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Proposals</h3>
                  <p className="text-sm text-gray-600">Detailed sales proposals</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search quotes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="probability">Sort by Probability</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Quotes List */}
      <div className="space-y-2">
        {filteredQuotes.map((quote) => (
          <div
            key={quote.id}
            className={`bg-white rounded-lg border-2 p-3 hover:shadow-lg transition-shadow ${
              isExpiringSoon(quote.validUntil) && quote.status === 'sent' ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{quote.title}</h3>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(quote.status)}`}>
                    {getStatusIcon(quote.status)}
                    {quote.status}
                  </span>
                  {isExpiringSoon(quote.validUntil) && quote.status === 'sent' && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                      Expiring Soon
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span className="font-medium text-gray-900">{quote.quoteNumber}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {quote.customer}
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {quote.contact}
                  </div>
                </div>

                {/* Pricing Details */}
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-xs text-blue-600 mb-1">Original Amount</div>
                    <div className="text-lg font-bold text-blue-900">${(quote.amount / 1000).toFixed(0)}K</div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-xs text-orange-600 mb-1">Discount</div>
                    <div className="text-lg font-bold text-orange-900">
                      {quote.discount > 0 ? `$${(quote.discount / 1000).toFixed(0)}K (${((quote.discount / quote.amount) * 100).toFixed(0)}%)` : 'None'}
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-xs text-green-600 mb-1">Final Amount</div>
                    <div className="text-lg font-bold text-green-900">${(quote.finalAmount / 1000).toFixed(0)}K</div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-xs text-purple-600 mb-1">Win Probability</div>
                    <div className="text-lg font-bold text-purple-900">{quote.probability}%</div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="flex items-center gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Products: </span>
                    <span className="font-medium text-gray-900">{quote.products}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Owner: </span>
                    <span className="font-medium text-gray-900">{quote.owner}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600">Valid until: </span>
                    <span className={`font-medium ${isExpiringSoon(quote.validUntil) ? 'text-orange-600' : 'text-gray-900'}`}>
                      {new Date(quote.validUntil).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600">
                  <div className="flex gap-2">
                    <span>Created: {new Date(quote.createdDate).toLocaleDateString()}</span>
                    {quote.sentDate && <span>• Sent: {new Date(quote.sentDate).toLocaleDateString()}</span>}
                    {quote.acceptedDate && <span>• Accepted: {new Date(quote.acceptedDate).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleViewQuote(quote)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">View</span>
                </button>
                <button
                  onClick={() => handleDownloadQuote(quote)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  <Download className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">Download</span>
                </button>
                <button
                  onClick={() => handleEditQuote(quote)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">Edit</span>
                </button>
                <button
                  onClick={() => handleCopyQuote(quote)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-blue-300 rounded-lg hover:bg-blue-50 text-sm"
                >
                  <Copy className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-600">Copy</span>
                </button>
                {quote.status === 'draft' && (
                  <button
                    onClick={() => handleSendQuote(quote)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 rounded-lg hover:bg-green-50 text-sm"
                  >
                    <Send className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Send</span>
                  </button>
                )}
                <button
                  onClick={() => handleDeleteQuote(quote)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span className="text-red-600">Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredQuotes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {quoteToDelete && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setQuoteToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Quote"
          message={`Are you sure you want to delete ${quoteToDelete.quoteNumber} - "${quoteToDelete.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
        />
      )}
    </div>
  );
}
