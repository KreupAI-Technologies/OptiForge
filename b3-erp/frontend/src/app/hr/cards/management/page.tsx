'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Users, CheckCircle, AlertTriangle, XCircle, Calendar, IndianRupee, AlertCircle } from 'lucide-react';
import { HrSelfServiceService } from '@/services/hr-self-service.service';
import { EmptyState } from '@/components/ui/EmptyState';

interface Card {
  id: string;
  cardNumber: string;
  cardType: 'credit' | 'debit' | 'fuel';
  assignedTo: string;
  employeeCode: string;
  department: string;
  designation: string;
  issueDate: string;
  expiryDate: string;
  limit: number;
  spent: number;
  available: number;
  status: 'active' | 'blocked' | 'expired' | 'lost';
  cardProvider: string;
  lastUsedDate?: string;
}

export default function Page() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [rows, setRows] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrSelfServiceService.getCorporateCards();
        const mapped: Card[] = raw.map((r) => ({
          id: r.id,
          cardNumber: r.cardNumber ?? '',
          cardType: (r.cardType as Card['cardType']) ?? 'credit',
          assignedTo: r.cardholderName ?? '',
          employeeCode: r.employeeCode ?? '',
          department: r.department ?? '',
          designation: r.designation ?? '',
          issueDate: r.issueDate ?? '',
          expiryDate: r.expiryDate ?? '',
          limit: Number(r.creditLimit ?? 0),
          spent: Number(r.monthlySpend ?? 0),
          available: Number(r.availableLimit ?? 0),
          status: (r.status as Card['status']) ?? 'active',
          cardProvider: r.cardProvider ?? '',
          lastUsedDate: r.lastTransactionDate ?? undefined,
        }));
        if (!cancelled) setRows(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load cards');
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

  const mockCards: Card[] = rows;

  const filteredCards = mockCards.filter(c => {
    const matchesType = selectedType === 'all' || c.cardType === selectedType;
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    return matchesType && matchesStatus;
  });

  const stats = {
    total: mockCards.length,
    active: mockCards.filter(c => c.status === 'active').length,
    blocked: mockCards.filter(c => c.status === 'blocked').length,
    totalLimit: mockCards.reduce((sum, c) => sum + c.limit, 0),
    totalSpent: mockCards.reduce((sum, c) => sum + c.spent, 0)
  };

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    blocked: 'bg-red-100 text-red-700',
    expired: 'bg-orange-100 text-orange-700',
    lost: 'bg-gray-100 text-gray-700'
  };

  const cardTypeColors = {
    credit: 'bg-blue-100 text-blue-700',
    debit: 'bg-purple-100 text-purple-700',
    fuel: 'bg-green-100 text-green-700'
  };

  const getUtilization = (spent: number, limit: number) => {
    return Math.round((spent / limit) * 100);
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Corporate Card Management</h1>
        <p className="text-sm text-gray-600 mt-1">Manage and monitor corporate cards</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading cards…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Cards</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.active}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Blocked</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.blocked}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Limit</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">₹{(stats.totalLimit / 100000).toFixed(1)}L</p>
            </div>
            <IndianRupee className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Total Spent</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">₹{(stats.totalSpent / 100000).toFixed(1)}L</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex gap-2">
          <div className="flex gap-2">
            <span className="text-sm font-medium text-gray-700">Type:</span>
            {['all', 'credit', 'debit', 'fuel'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  selectedType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            {['all', 'active', 'blocked', 'expired'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredCards.length === 0 && !isLoading && (
        <EmptyState
          icon={CreditCard}
          title={mockCards.length === 0 ? 'No cards found' : 'No matching cards'}
          description={mockCards.length === 0 ? 'Corporate cards will appear here once issued.' : 'Try adjusting the type or status filters.'}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredCards.map(card => (
          <div key={card.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="h-6 w-6 text-gray-400" />
                  <h3 className="text-lg font-bold text-gray-900">{card.cardNumber}</h3>
                </div>
                <div className="flex gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${statusColors[card.status]}`}>
                    {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${cardTypeColors[card.cardType]}`}>
                    {card.cardType.charAt(0).toUpperCase() + card.cardType.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-2">
              <p className="text-xs text-gray-500 uppercase font-medium mb-2">Card Holder</p>
              <p className="text-sm font-semibold text-gray-900">{card.assignedTo}</p>
              <p className="text-xs text-gray-600">{card.designation} • {card.department}</p>
              <p className="text-xs text-gray-500">{card.employeeCode}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Card Limit</p>
                <p className="text-lg font-bold text-gray-900">₹{card.limit.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Available</p>
                <p className="text-lg font-bold text-green-600">₹{card.available.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Utilization: {getUtilization(card.spent, card.limit)}%</span>
                <span>₹{card.spent.toLocaleString('en-IN')} spent</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    getUtilization(card.spent, card.limit) >= 90 ? 'bg-red-600' :
                    getUtilization(card.spent, card.limit) >= 70 ? 'bg-orange-600' :
                    'bg-green-600'
                  }`}
                  style={{ width: `${getUtilization(card.spent, card.limit)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-xs text-gray-600">
              <div>
                <p>Provider: {card.cardProvider}</p>
                <p>Expires: {card.expiryDate}</p>
              </div>
              {card.lastUsedDate && <p>Last used: {card.lastUsedDate}</p>}
            </div>

            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
                View Transactions
              </button>
              {card.status === 'active' && (
                <button className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                  Block Card
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
