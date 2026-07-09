'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Calendar, MapPin, TrendingUp, TrendingDown, Filter, Download, Receipt, AlertCircle } from 'lucide-react';
import { HrSelfServiceService } from '@/services/hr-self-service.service';
import { EmptyState } from '@/components/ui/EmptyState';

interface Transaction {
  id: string;
  transactionId: string;
  cardNumber: string;
  cardType: 'credit' | 'debit' | 'fuel';
  cardHolder: string;
  employeeCode: string;
  department: string;
  merchantName: string;
  category: 'fuel' | 'food' | 'travel' | 'supplies' | 'accommodation' | 'other';
  amount: number;
  currency: string;
  transactionDate: string;
  transactionTime: string;
  location: string;
  status: 'approved' | 'pending' | 'rejected' | 'flagged';
  receiptUploaded: boolean;
  notes?: string;
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCardType, setSelectedCardType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [rows, setRows] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrSelfServiceService.getCardTransactions();
        const mapped: Transaction[] = raw.map((r) => ({
          id: r.id,
          transactionId: r.transactionId ?? '',
          cardNumber: r.cardNumber ?? '',
          cardType: (r.cardType as Transaction['cardType']) ?? 'credit',
          cardHolder: r.cardHolder ?? '',
          employeeCode: r.employeeCode ?? '',
          department: r.department ?? '',
          merchantName: r.merchantName ?? '',
          category: (r.category as Transaction['category']) ?? 'other',
          amount: Number(r.amount ?? 0),
          currency: r.currency ?? 'INR',
          transactionDate: r.transactionDate ?? '',
          transactionTime: r.transactionTime ?? '',
          location: r.location ?? '',
          status: (r.status as Transaction['status']) ?? 'pending',
          receiptUploaded: Boolean(r.receiptUploaded ?? false),
          notes: r.notes ?? undefined,
        }));
        if (!cancelled) setRows(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load card transactions');
          setRows([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTransactions = rows.filter(t => {
    const statusMatch = selectedStatus === 'all' || t.status === selectedStatus;
    const cardTypeMatch = selectedCardType === 'all' || t.cardType === selectedCardType;
    const categoryMatch = selectedCategory === 'all' || t.category === selectedCategory;
    return statusMatch && cardTypeMatch && categoryMatch;
  });

  const stats = {
    total: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
    count: filteredTransactions.length,
    pending: rows.filter(t => t.status === 'pending').length,
    flagged: rows.filter(t => t.status === 'flagged').length
  };

  const statusColors = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
    flagged: 'bg-orange-100 text-orange-700'
  };

  const categoryColors = {
    fuel: 'bg-blue-100 text-blue-700',
    food: 'bg-orange-100 text-orange-700',
    travel: 'bg-purple-100 text-purple-700',
    supplies: 'bg-green-100 text-green-700',
    accommodation: 'bg-pink-100 text-pink-700',
    other: 'bg-gray-100 text-gray-700'
  };

  const cardTypeColors = {
    credit: 'bg-blue-100 text-blue-700',
    debit: 'bg-green-100 text-green-700',
    fuel: 'bg-orange-100 text-orange-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Card Transactions</h1>
        <p className="text-sm text-gray-600 mt-1">View and manage corporate card transactions</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading card transactions…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Spent</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">₹{stats.total.toLocaleString('en-IN')}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Transactions</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.count}</p>
            </div>
            <Receipt className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
            </div>
            <Filter className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Flagged</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{stats.flagged}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
            <select
              value={selectedCardType}
              onChange={(e) => setSelectedCardType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
              <option value="fuel">Fuel</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="fuel">Fuel</option>
              <option value="food">Food</option>
              <option value="travel">Travel</option>
              <option value="supplies">Supplies</option>
              <option value="accommodation">Accommodation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 && !isLoading && (
        <EmptyState
          icon={Receipt}
          title={rows.length === 0 ? 'No transactions yet' : 'No matching transactions'}
          description={rows.length === 0 ? 'Card transactions will appear here once recorded.' : 'Try adjusting the status, card type, or category filters.'}
        />
      )}

      <div className="space-y-2">
        {filteredTransactions.map(transaction => (
          <div key={transaction.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{transaction.merchantName}</h3>
                    <p className="text-sm text-gray-600">Transaction ID: {transaction.transactionId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>{transaction.cardHolder} • {transaction.employeeCode}</span>
                  <span className="text-gray-400">•</span>
                  <span>{transaction.department}</span>
                  <span className="text-gray-400">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {transaction.location}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">₹{transaction.amount.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-500 mt-1">{transaction.currency}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 py-4 border-y border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Card</p>
                <p className="text-sm font-semibold text-gray-900">{transaction.cardNumber}</p>
                <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded ${cardTypeColors[transaction.cardType]}`}>
                  {transaction.cardType.charAt(0).toUpperCase() + transaction.cardType.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Category</p>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${categoryColors[transaction.category]}`}>
                  {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Date & Time</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(transaction.transactionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-gray-600">{transaction.transactionTime}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Status</p>
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${statusColors[transaction.status]}`}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </span>
                <div className="mt-1">
                  {transaction.receiptUploaded ? (
                    <span className="text-xs text-green-600 font-medium">✓ Receipt uploaded</span>
                  ) : (
                    <span className="text-xs text-red-600 font-medium">! Receipt missing</span>
                  )}
                </div>
              </div>
            </div>

            {transaction.notes && (
              <div className="bg-gray-50 rounded-lg p-3 mb-2">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Notes</p>
                <p className="text-sm text-gray-700">{transaction.notes}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                View Details
              </button>
              {transaction.status === 'pending' && (
                <>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                    Approve
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm">
                    Reject
                  </button>
                </>
              )}
              {transaction.status === 'flagged' && (
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm">
                  Review
                </button>
              )}
              {!transaction.receiptUploaded && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                  Upload Receipt
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
