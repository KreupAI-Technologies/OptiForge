'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  FileText, PlusIcon, PencilIcon, EyeIcon, Search,
  CalendarIcon, DollarSign, CheckCircleIcon, ClockIcon,
  AlertTriangle, ArrowUpIcon, ArrowDownIcon, Filter,
  FileDown, FileUp, Banknote,
  BarChart3, SlidersHorizontal, Info
} from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

interface ChartOfAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  category: string;
  parentAccountId?: string;
  level: number;
  isActive: boolean;
  normalBalance: 'debit' | 'credit';
  currentBalance: number;
  description?: string;
  tags: string[];
  createdDate: string;
  lastModified: string;
}

interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  reference: string;
  description: string;
  status: 'draft' | 'posted' | 'reversed';
  type: 'manual' | 'automatic' | 'adjustment' | 'closing';
  source: string;
  totalDebit: number;
  totalCredit: number;
  lineItems: JournalLineItem[];
  attachments: EntryAttachment[];
  createdBy: string;
  createdDate: string;
  postedBy?: string;
  postedDate?: string;
  reversedBy?: string;
  reversedDate?: string;
  notes?: string;
}

interface JournalLineItem {
  id: string;
  lineNumber: number;
  accountId: string;
  accountNumber: string;
  accountName: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  reference?: string;
  costCenter?: string;
  project?: string;
  department?: string;
}

interface EntryAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: string;
  uploadDate: string;
}

interface TrialBalance {
  accountId: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  debitBalance: number;
  creditBalance: number;
  netBalance: number;
}

interface GeneralLedgerAccount {
  accountId: string;
  accountNumber: string;
  accountName: string;
  entries: GeneralLedgerEntry[];
  runningBalance: number;
}

interface GeneralLedgerEntry {
  date: string;
  entryNumber: string;
  description: string;
  reference: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
}

const GeneralLedger: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'journal' | 'ledger' | 'trial-balance'>('dashboard');
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-12-31' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await FinanceService.getChartOfAccounts()) as any[];
        const typeMap: Record<string, ChartOfAccount['accountType']> = {
          ASSET: 'asset',
          LIABILITY: 'liability',
          EQUITY: 'equity',
          REVENUE: 'revenue',
          EXPENSE: 'expense',
        };
        const mapped: ChartOfAccount[] = (raw || []).map((row) => {
          const rawType = String(row.accountType ?? row.type ?? '').toUpperCase();
          const accountType = typeMap[rawType] ?? ((row.accountType ?? row.type ?? 'asset') as ChartOfAccount['accountType']);
          const isCreditNormal = accountType === 'liability' || accountType === 'equity' || accountType === 'revenue';
          return {
            id: String(row.id ?? row.code ?? row.accountNumber ?? ''),
            accountNumber: String(row.accountNumber ?? row.code ?? ''),
            accountName: row.accountName ?? row.name ?? '',
            accountType,
            category: row.category ?? '',
            parentAccountId: row.parentAccountId ?? row.parentId ?? undefined,
            level: Number(row.level ?? 1),
            isActive: row.isActive ?? (row.status ? String(row.status).toUpperCase() === 'ACTIVE' : true),
            normalBalance: (row.normalBalance ?? (isCreditNormal ? 'credit' : 'debit')) as ChartOfAccount['normalBalance'],
            currentBalance: Number(row.currentBalance ?? row.balance ?? 0),
            description: row.description ?? undefined,
            tags: Array.isArray(row.tags) ? row.tags : [],
            createdDate: row.createdDate ?? row.createdAt ?? '',
            lastModified: row.lastModified ?? row.updatedAt ?? '',
          };
        });
        if (!cancelled) setChartOfAccounts(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load');
          setChartOfAccounts([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Mock Journal Entries
  const [journalEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      entryNumber: 'JE-2024-001',
      date: '2024-01-15T00:00:00Z',
      reference: 'INV-2024-001',
      description: 'Sales transaction for customer ABC Corp',
      status: 'posted',
      type: 'automatic',
      source: 'Sales Module',
      totalDebit: 115000,
      totalCredit: 115000,
      lineItems: [
        {
          id: '1',
          lineNumber: 1,
          accountId: '1100',
          accountNumber: '1100',
          accountName: 'Accounts Receivable',
          description: 'Sales to ABC Corp',
          debitAmount: 115000,
          creditAmount: 0,
          reference: 'INV-2024-001',
          department: 'Sales'
        },
        {
          id: '2',
          lineNumber: 2,
          accountId: '4000',
          accountNumber: '4000',
          accountName: 'Sales Revenue',
          description: 'Sales revenue recognition',
          debitAmount: 0,
          creditAmount: 100000,
          reference: 'INV-2024-001',
          department: 'Sales'
        },
        {
          id: '3',
          lineNumber: 3,
          accountId: '2300',
          accountNumber: '2300',
          accountName: 'Sales Tax Payable',
          description: 'Sales tax collected',
          debitAmount: 0,
          creditAmount: 15000,
          reference: 'INV-2024-001',
          department: 'Sales'
        }
      ],
      attachments: [
        {
          id: '1',
          name: 'invoice-abc-corp.pdf',
          type: 'invoice',
          url: '/documents/invoice-abc-corp.pdf',
          size: '156 KB',
          uploadDate: '2024-01-15T10:30:00Z'
        }
      ],
      createdBy: 'System',
      createdDate: '2024-01-15T10:30:00Z',
      postedBy: 'John Smith',
      postedDate: '2024-01-15T14:00:00Z'
    },
    {
      id: '2',
      entryNumber: 'JE-2024-002',
      date: '2024-01-16T00:00:00Z',
      reference: 'PAYROLL-2024-001',
      description: 'Monthly payroll expenses',
      status: 'posted',
      type: 'automatic',
      source: 'Payroll Module',
      totalDebit: 85000,
      totalCredit: 85000,
      lineItems: [
        {
          id: '4',
          lineNumber: 1,
          accountId: '6100',
          accountNumber: '6100',
          accountName: 'Salaries and Wages',
          description: 'Employee salaries',
          debitAmount: 65000,
          creditAmount: 0,
          department: 'HR'
        },
        {
          id: '5',
          lineNumber: 2,
          accountId: '6200',
          accountNumber: '6200',
          accountName: 'Payroll Taxes',
          description: 'Employer payroll taxes',
          debitAmount: 20000,
          creditAmount: 0,
          department: 'HR'
        },
        {
          id: '6',
          lineNumber: 3,
          accountId: '1000',
          accountNumber: '1000',
          accountName: 'Cash and Cash Equivalents',
          description: 'Payroll payment',
          debitAmount: 0,
          creditAmount: 85000,
          department: 'HR'
        }
      ],
      attachments: [],
      createdBy: 'System',
      createdDate: '2024-01-16T10:00:00Z',
      postedBy: 'Jane Doe',
      postedDate: '2024-01-16T15:30:00Z'
    },
    {
      id: '3',
      entryNumber: 'JE-2024-003',
      date: '2024-01-18T00:00:00Z',
      reference: 'ADJ-2024-001',
      description: 'Monthly depreciation adjustment',
      status: 'draft',
      type: 'adjustment',
      source: 'Manual Entry',
      totalDebit: 25000,
      totalCredit: 25000,
      lineItems: [
        {
          id: '7',
          lineNumber: 1,
          accountId: '6300',
          accountNumber: '6300',
          accountName: 'Depreciation Expense',
          description: 'Monthly depreciation on PPE',
          debitAmount: 25000,
          creditAmount: 0
        },
        {
          id: '8',
          lineNumber: 2,
          accountId: '1510',
          accountNumber: '1510',
          accountName: 'Accumulated Depreciation',
          description: 'Accumulated depreciation adjustment',
          debitAmount: 0,
          creditAmount: 25000
        }
      ],
      attachments: [],
      createdBy: 'Sarah Johnson',
      createdDate: '2024-01-18T09:15:00Z',
      notes: 'Monthly depreciation calculated using straight-line method'
    }
  ]);

  // Mock Trial Balance
  const generateTrialBalance = (): TrialBalance[] => {
    return chartOfAccounts.map(account => {
      const debitBalance = account.normalBalance === 'debit' && account.currentBalance > 0 ? account.currentBalance : 0;
      const creditBalance = account.normalBalance === 'credit' && account.currentBalance > 0 ? account.currentBalance : 0;

      return {
        accountId: account.id,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        accountType: account.accountType,
        debitBalance,
        creditBalance,
        netBalance: account.currentBalance
      };
    });
  };

  // Chart data
  const accountTypeDistribution = [
    {
      name: 'Assets',
      value: chartOfAccounts.filter(a => a.accountType === 'asset').reduce((sum, a) => sum + a.currentBalance, 0),
      color: '#3B82F6'
    },
    {
      name: 'Liabilities',
      value: chartOfAccounts.filter(a => a.accountType === 'liability').reduce((sum, a) => sum + a.currentBalance, 0),
      color: '#EF4444'
    },
    {
      name: 'Equity',
      value: chartOfAccounts.filter(a => a.accountType === 'equity').reduce((sum, a) => sum + a.currentBalance, 0),
      color: '#10B981'
    },
    {
      name: 'Revenue',
      value: chartOfAccounts.filter(a => a.accountType === 'revenue').reduce((sum, a) => sum + a.currentBalance, 0),
      color: '#F59E0B'
    },
    {
      name: 'Expenses',
      value: chartOfAccounts.filter(a => a.accountType === 'expense').reduce((sum, a) => sum + a.currentBalance, 0),
      color: '#8B5CF6'
    }
  ];

  const journalEntryTrends = [
    { month: 'Jan', entries: 45, amount: 1250000 },
    { month: 'Feb', entries: 52, amount: 1380000 },
    { month: 'Mar', entries: 48, amount: 1290000 },
    { month: 'Apr', entries: 58, amount: 1520000 },
    { month: 'May', entries: 55, amount: 1450000 },
    { month: 'Jun', entries: 62, amount: 1680000 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon },
      posted: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
      reversed: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getAccountTypeColor = (accountType: string) => {
    const colors = {
      asset: 'text-blue-600 bg-blue-100',
      liability: 'text-red-600 bg-red-100',
      equity: 'text-green-600 bg-green-100',
      revenue: 'text-orange-600 bg-orange-100',
      expense: 'text-purple-600 bg-purple-100'
    };
    return colors[accountType as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const filteredJournalEntries = journalEntries.filter(entry => {
    const matchesSearch = entry.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderDashboard = () => (
    <div className="space-y-3">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chart of Accounts</p>
              <p className="text-2xl font-semibold text-gray-900">{chartOfAccounts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Banknote className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Journal Entries</p>
              <p className="text-2xl font-semibold text-gray-900">{journalEntries.length}</p>
              <p className="text-sm text-green-600">
                {journalEntries.filter(e => e.status === 'posted').length} posted
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(chartOfAccounts.filter(a => a.accountType === 'asset').reduce((sum, a) => sum + a.currentBalance, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Trial Balance</p>
              <p className="text-2xl font-semibold text-gray-900">Balanced</p>
              <p className="text-sm text-green-600">Last updated today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={accountTypeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {accountTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Journal Entry Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={journalEntryTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="entries" fill="#3B82F6" name="Number of Entries" />
              <Line yAxisId="right" dataKey="amount" stroke="#F59E0B" strokeWidth={2} name="Total Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Journal Entries</h3>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            {journalEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{entry.entryNumber}</h4>
                  <p className="text-sm text-gray-600">{entry.description}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(entry.date)} • {entry.source} • {formatCurrency(entry.totalDebit)}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(entry.status)}
                  <button
                    onClick={() => setSelectedEntry(entry)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderChartOfAccounts = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Chart of Accounts</h3>
        <button
          onClick={() => setShowAccountModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Account
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chartOfAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {account.accountNumber} - {account.accountName}
                      </div>
                      {account.description && (
                        <div className="text-sm text-gray-500">{account.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccountTypeColor(account.accountType)}`}>
                      {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {account.category}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(account.currentBalance)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      account.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {account.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedAccount(account)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <PencilIcon className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderJournalEntries = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Journal Entries</h3>
        <button
          onClick={() => setShowJournalModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Entry
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search entries..."
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="posted">Posted</option>
              <option value="reversed">Reversed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Journal Entries Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entry Number
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJournalEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">
                    {entry.entryNumber}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(entry.date)}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    <div className="max-w-xs truncate">{entry.description}</div>
                    <div className="text-xs text-gray-500">{entry.source}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {entry.reference}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(entry.totalDebit)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {getStatusBadge(entry.status)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <PencilIcon className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Edit</span>
                      </button>
                      {entry.status === 'posted' && (
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <FileDown className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">Download</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTrialBalance = () => {
    const trialBalance = generateTrialBalance();
    const totalDebits = trialBalance.reduce((sum, item) => sum + item.debitBalance, 0);
    const totalCredits = trialBalance.reduce((sum, item) => sum + item.creditBalance, 0);

    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Trial Balance</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">As of {formatDate(new Date().toISOString())}</span>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <FileDown className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Balance Check */}
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Debits</p>
              <p className="text-2xl font-semibold text-blue-600">{formatCurrency(totalDebits)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Credits</p>
              <p className="text-2xl font-semibold text-green-600">{formatCurrency(totalCredits)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Difference</p>
              <p className={`text-2xl font-semibold ${totalDebits === totalCredits ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(totalDebits - totalCredits))}
              </p>
              {totalDebits === totalCredits && (
                <p className="text-sm text-green-600 flex items-center justify-center mt-1">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Balanced
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Trial Balance Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Type
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Debit Balance
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit Balance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trialBalance.map((item) => (
                  <tr key={item.accountId} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.accountNumber} - {item.accountName}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccountTypeColor(item.accountType)}`}>
                        {item.accountType.charAt(0).toUpperCase() + item.accountType.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {item.debitBalance > 0 ? formatCurrency(item.debitBalance) : '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {item.creditBalance > 0 ? formatCurrency(item.creditBalance) : '-'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-medium">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-900" colSpan={2}>
                    TOTALS
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                    {formatCurrency(totalDebits)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                    {formatCurrency(totalCredits)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Journal Entry Detail Modal
  const JournalEntryModal = () => {
    if (!selectedEntry) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-3 w-full  max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Journal Entry: {selectedEntry.entryNumber}
            </h3>
            <button
              onClick={() => setSelectedEntry(null)}
              className="text-gray-600 hover:text-gray-800"
            >
              ×
            </button>
          </div>

          {/* Entry Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-medium text-gray-900">{formatDate(selectedEntry.date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Reference</p>
              <p className="font-medium text-gray-900">{selectedEntry.reference}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Source</p>
              <p className="font-medium text-gray-900">{selectedEntry.source}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              {getStatusBadge(selectedEntry.status)}
            </div>
          </div>

          <div className="mb-3">
            <p className="text-sm text-gray-600">Description</p>
            <p className="font-medium text-gray-900">{selectedEntry.description}</p>
          </div>

          {/* Line Items */}
          <div className="mb-3">
            <h4 className="font-medium text-gray-900 mb-3">Line Items</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedEntry.lineItems.map((line) => (
                    <tr key={line.id}>
                      <td className="px-4 py-2 text-sm">
                        <div className="font-medium text-gray-900">{line.accountNumber}</div>
                        <div className="text-gray-600">{line.accountName}</div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{line.description}</td>
                      <td className="px-4 py-2 text-sm text-right font-medium text-gray-900">
                        {line.debitAmount > 0 ? formatCurrency(line.debitAmount) : '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-right font-medium text-gray-900">
                        {line.creditAmount > 0 ? formatCurrency(line.creditAmount) : '-'}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-medium">
                    <td className="px-4 py-2 text-sm font-semibold" colSpan={2}>TOTALS</td>
                    <td className="px-4 py-2 text-sm text-right font-semibold">{formatCurrency(selectedEntry.totalDebit)}</td>
                    <td className="px-4 py-2 text-sm text-right font-semibold">{formatCurrency(selectedEntry.totalCredit)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Entry Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600">Created by: {selectedEntry.createdBy}</p>
              <p className="text-gray-600">Created: {formatDate(selectedEntry.createdDate)}</p>
              {selectedEntry.postedBy && (
                <>
                  <p className="text-gray-600">Posted by: {selectedEntry.postedBy}</p>
                  <p className="text-gray-600">Posted: {formatDate(selectedEntry.postedDate!)}</p>
                </>
              )}
            </div>
            <div>
              {selectedEntry.notes && (
                <>
                  <p className="text-gray-600 font-medium">Notes:</p>
                  <p className="text-gray-900">{selectedEntry.notes}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 ">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">General Ledger</h1>
        <p className="text-gray-600 mt-2">Manage chart of accounts, journal entries, and trial balance</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-3">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { key: 'accounts', label: 'Chart of Accounts', icon: FileText },
            { key: 'journal', label: 'Journal Entries', icon: Banknote },
            { key: 'trial-balance', label: 'Trial Balance', icon: DollarSign }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'accounts' && renderChartOfAccounts()}
      {activeTab === 'journal' && renderJournalEntries()}
      {activeTab === 'trial-balance' && renderTrialBalance()}

      {/* Modals */}
      {selectedEntry && <JournalEntryModal />}
    </div>
  );
};

export default GeneralLedger;