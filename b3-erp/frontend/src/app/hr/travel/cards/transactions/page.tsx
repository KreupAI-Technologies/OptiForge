'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CreditCard, Calendar, MapPin, CheckCircle, XCircle, AlertTriangle, Download, Link as LinkIcon, Search } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { toast } from '@/hooks/use-toast';
import { HrExpensesService } from '@/services/hr-expenses.service';

interface CardTransaction {
  id: string;
  transactionId: string;
  cardNumber: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  transactionDate: string;
  merchant: string;
  merchantCategory: 'hotel' | 'restaurant' | 'fuel' | 'transport' | 'retail' | 'online' | 'other';
  location: string;
  amount: number;
  currency: string;
  description: string;
  status: 'captured' | 'linked' | 'unmatched' | 'disputed' | 'personal';
  linkedExpenseId?: string;
  linkedTravelRequest?: string;
  billingCycle: string;
  gstAmount?: number;
  gstNumber?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface CardTransactionRow {
  id?: string;
  transactionId?: string;
  cardNumber?: string;
  cardType?: string;
  cardHolder?: string;
  employeeCode?: string;
  department?: string;
  merchantName?: string;
  category?: string;
  amount?: number | string;
  currency?: string;
  transactionDate?: string;
  transactionTime?: string;
  location?: string;
  status?: string;
  notes?: string;
}

function mapTransaction(row: CardTransactionRow): CardTransaction {
  return {
    id: row.id ?? row.transactionId ?? '',
    transactionId: row.transactionId ?? '',
    cardNumber: row.cardNumber ?? '',
    employeeName: row.cardHolder ?? '',
    employeeCode: row.employeeCode ?? '',
    department: row.department ?? '',
    transactionDate: row.transactionDate ?? '',
    merchant: row.merchantName ?? '',
    merchantCategory: (row.category ?? 'other') as CardTransaction['merchantCategory'],
    location: row.location ?? '',
    amount: Number(row.amount) || 0,
    currency: row.currency ?? '',
    description: row.notes ?? '',
    status: (row.status ?? 'captured') as CardTransaction['status'],
    linkedExpenseId: undefined,
    linkedTravelRequest: undefined,
    billingCycle: '',
    gstAmount: undefined,
    gstNumber: undefined,
  };
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('2025-11');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<CardTransaction[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadTransactions = async () => {
    setLoadError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/hr/card-transactions?companyId=default-company-id`);
      if (!res.ok) {
        throw new Error(`API Error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setTransactions(rows.map(mapTransaction));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load transactions');
      setTransactions([]);
    }
  };

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Safe Date Display Component
  const DateDisplay = ({ date, type = 'date' }: { date: string, type?: 'date' | 'time' }) => {
    const [mounted, setMounted] = useState(false);
    React.useEffect(() => setMounted(true), []);

    if (!mounted) return <span>{date}</span>;

    if (type === 'time') {
      return <span>{new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>;
    }
    return <span>{new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>;
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      const matchesStatus = selectedStatus === 'all' || txn.status === selectedStatus;
      const matchesMonth = txn.transactionDate.startsWith(selectedMonth);
      const matchesEmployee = selectedEmployee === 'all' || txn.employeeCode === selectedEmployee;
      const matchesSearch = searchTerm === '' ||
        txn.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.transactionId.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesMonth && matchesEmployee && matchesSearch;
    });
  }, [transactions, selectedStatus, selectedMonth, selectedEmployee, searchTerm]);

  const stats = {
    totalTransactions: transactions.length,
    totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
    linked: transactions.filter(t => t.status === 'linked').length,
    unmatched: transactions.filter(t => t.status === 'unmatched').length,
    personal: transactions.filter(t => t.status === 'personal').length,
    disputed: transactions.filter(t => t.status === 'disputed').length,
    linkedAmount: transactions.filter(t => t.status === 'linked').reduce((sum, t) => sum + t.amount, 0)
  };

  const getStatusColor = (status: string) => {
    const colors = {
      captured: 'bg-blue-100 text-blue-800',
      linked: 'bg-green-100 text-green-800',
      unmatched: 'bg-yellow-100 text-yellow-800',
      disputed: 'bg-red-100 text-red-800',
      personal: 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors];
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      hotel: 'bg-blue-100 text-blue-800',
      restaurant: 'bg-green-100 text-green-800',
      fuel: 'bg-orange-100 text-orange-800',
      transport: 'bg-purple-100 text-purple-800',
      retail: 'bg-pink-100 text-pink-800',
      online: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors];
  };

  const handleLinkTransaction = async (txn: CardTransaction) => {
    setActionId(txn.id);
    try {
      await HrExpensesService.updateCardTransaction(txn.id, { status: 'linked' });
      toast({ title: 'Transaction Linked', description: `Transaction ${txn.transactionId} linked to expense report` });
      await loadTransactions();
    } catch (err) {
      toast({
        title: 'Failed to link transaction',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setActionId(null);
    }
  };

  const handleMarkPersonal = async (txn: CardTransaction) => {
    setActionId(txn.id);
    try {
      await HrExpensesService.updateCardTransaction(txn.id, { status: 'personal' });
      toast({ title: 'Marked as Personal', description: `Transaction ${txn.transactionId} marked as personal expense` });
      await loadTransactions();
    } catch (err) {
      toast({
        title: 'Failed to update transaction',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setActionId(null);
    }
  };

  const columns = [
    {
      key: 'transactionDate', label: 'Date', sortable: true,
      render: (v: string) => (
        <div className="text-sm">
          <div className="font-semibold text-gray-900">
            <DateDisplay date={v} type="date" />
          </div>
          <div className="text-xs text-gray-500">
            <DateDisplay date={v} type="time" />
          </div>
        </div>
      )
    },
    {
      key: 'transactionId', label: 'Transaction ID', sortable: true,
      render: (v: string) => <div className="font-mono text-xs text-gray-700">{v}</div>
    },
    {
      key: 'employeeName', label: 'Employee', sortable: true,
      render: (v: string, row: CardTransaction) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">Card: {row.cardNumber}</div>
        </div>
      )
    },
    {
      key: 'merchant', label: 'Merchant', sortable: true,
      render: (v: string, row: CardTransaction) => (
        <div>
          <div className="text-sm font-semibold text-gray-900">{v}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getCategoryColor(row.merchantCategory)}`}>
              {row.merchantCategory}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'location', label: 'Location', sortable: true,
      render: (v: string) => (
        <div className="flex items-center gap-1 text-sm text-gray-700">
          <MapPin className="h-3 w-3 text-gray-400" />
          {v}
        </div>
      )
    },
    {
      key: 'amount', label: 'Amount', sortable: true,
      render: (v: number, row: CardTransaction) => (
        <div>
          <div className="text-sm font-bold text-gray-900">₹{v.toLocaleString('en-IN')}</div>
          {row.gstAmount && (
            <div className="text-xs text-gray-500">GST: ₹{row.gstAmount}</div>
          )}
        </div>
      )
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (v: string, row: CardTransaction) => (
        <div>
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(v)}`}>
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </span>
          {row.linkedExpenseId && (
            <div className="text-xs text-green-600 mt-1 font-mono">{row.linkedExpenseId}</div>
          )}
        </div>
      )
    },
    {
      key: 'actions', label: 'Actions', sortable: false,
      render: (_: any, row: CardTransaction) => (
        <div className="flex gap-2">
          {row.status === 'captured' && (
            <button
              onClick={() => handleLinkTransaction(row)}
              disabled={actionId === row.id}
              className="p-1 hover:bg-green-100 rounded disabled:opacity-40"
              title="Link to expense"
            >
              <LinkIcon className="h-4 w-4 text-green-600" />
            </button>
          )}
          {row.status === 'unmatched' && (
            <>
              <button
                onClick={() => handleLinkTransaction(row)}
                disabled={actionId === row.id}
                className="p-1 hover:bg-green-100 rounded disabled:opacity-40"
                title="Link to expense"
              >
                <LinkIcon className="h-4 w-4 text-green-600" />
              </button>
              <button
                onClick={() => handleMarkPersonal(row)}
                disabled={actionId === row.id}
                className="p-1 hover:bg-purple-100 rounded disabled:opacity-40"
                title="Mark as personal"
              >
                <XCircle className="h-4 w-4 text-purple-600" />
              </button>
            </>
          )}
          <button className="p-1 hover:bg-blue-100 rounded">
            <Download className="h-4 w-4 text-blue-600" />
          </button>
        </div>
      )
    }
  ];

  const transactionTabs = [
    { id: 'all', label: 'All Transactions' },
    { id: 'captured', label: 'Captured' },
    { id: 'linked', label: 'Linked' },
    { id: 'unmatched', label: 'Unmatched' },
    { id: 'disputed', label: 'Disputed' },
    { id: 'personal', label: 'Personal' }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-blue-600" />
          Card Transactions
        </h1>
        <p className="text-gray-600 mt-2">Auto-captured corporate credit card transactions</p>
      </div>

      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{loadError}</span>
          <button onClick={loadTransactions} className="underline font-medium">Retry</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-3">
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Txns</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalTransactions}</p>
            </div>
            <CreditCard className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-xl font-bold text-indigo-600">₹{(stats.totalAmount / 1000).toFixed(1)}k</p>
            </div>
            <Calendar className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Linked</p>
              <p className="text-2xl font-bold text-green-600">{stats.linked}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unmatched</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.unmatched}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Personal</p>
              <p className="text-2xl font-bold text-purple-600">{stats.personal}</p>
            </div>
            <XCircle className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Disputed</p>
              <p className="text-2xl font-bold text-red-600">{stats.disputed}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-teal-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Linked Amt</p>
              <p className="text-xl font-bold text-teal-600">₹{(stats.linkedAmount / 1000).toFixed(1)}k</p>
            </div>
            <CheckCircle className="h-10 w-10 text-teal-400" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar & Tabs */}
        <div className="border-b border-gray-200">
          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search merchant, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Employees</option>
                <option value="EMP456">Rajesh Kumar</option>
                <option value="EMP789">Priya Sharma</option>
                <option value="EMP234">Amit Singh</option>
                <option value="EMP890">Suresh Patel</option>
              </select>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm gap-2">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          <div className="px-4 flex overflow-x-auto hide-scrollbar gap-1">
            {transactionTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${selectedStatus === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <DataTable data={filteredTransactions} columns={columns} />
      </div>

      {/* Transaction Status Info */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Transaction Status Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div className="p-3 bg-blue-50 border-l-4 border-blue-600 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-1">Captured</h4>
            <p className="text-xs text-blue-800">Transaction synced from bank, pending action</p>
          </div>
          <div className="p-3 bg-green-50 border-l-4 border-green-600 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-1">Linked</h4>
            <p className="text-xs text-green-800">Matched with expense report & travel request</p>
          </div>
          <div className="p-3 bg-yellow-50 border-l-4 border-yellow-600 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-1">Unmatched</h4>
            <p className="text-xs text-yellow-800">No matching expense found, requires attention</p>
          </div>
          <div className="p-3 bg-red-50 border-l-4 border-red-600 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-1">Disputed</h4>
            <p className="text-xs text-red-800">Transaction disputed by cardholder</p>
          </div>
          <div className="p-3 bg-purple-50 border-l-4 border-purple-600 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-1">Personal</h4>
            <p className="text-xs text-purple-800">Personal expense, pending reimbursement</p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Auto-Capture System</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Transactions are automatically synced from bank within 24 hours</li>
          <li>• System attempts auto-matching with submitted expense reports</li>
          <li>• Unmatched transactions require manual linking or classification</li>
          <li>• Personal expenses must be reimbursed to company within 7 days</li>
          <li>• GST details are automatically extracted when available</li>
          <li>• Monthly reconciliation report generated on 1st of every month</li>
        </ul>
      </div>
    </div>
  );
}
