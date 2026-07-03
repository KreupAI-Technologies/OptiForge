'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Calendar, Download, Printer, Search, Filter, FileText, BarChart3,
  ArrowUpCircle, ArrowDownCircle, Eye, TrendingUp, DollarSign,
  ChevronLeft, ChevronRight, RefreshCw, Info, Hash, BookOpen, CheckCircle
} from 'lucide-react';
import { exportToCsv, printCurrentView } from '@/lib/export';

// TypeScript Interfaces
interface LedgerTransaction {
  id: string;
  date: string;
  entryNumber: string;
  description: string;
  referenceNumber: string;
  transactionType: 'Manual' | 'System' | 'Adjustment' | 'Closing' | 'Opening' | 'Reversal';
  debitAmount: number;
  creditAmount: number;
  balance: number;
  balanceType: 'Dr' | 'Cr';
}

interface Account {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
  openingBalance: number;
  openingBalanceType: 'Dr' | 'Cr';
}

interface MonthBreakdown {
  month: string;
  openingBalance: number;
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  balanceType: 'Dr' | 'Cr';
  transactionCount: number;
}

// Mock Accounts
const mockAccounts: Account[] = [
  { code: '1000', name: 'Cash - Operating Account', type: 'Asset', openingBalance: 450000, openingBalanceType: 'Dr' },
  { code: '1100', name: 'Accounts Receivable - Trade', type: 'Asset', openingBalance: 400000, openingBalanceType: 'Dr' },
  { code: '1200', name: 'Inventory - Raw Materials', type: 'Asset', openingBalance: 350000, openingBalanceType: 'Dr' },
  { code: '2000', name: 'Accounts Payable - Trade', type: 'Liability', openingBalance: 250000, openingBalanceType: 'Cr' },
  { code: '2100', name: 'GST Payable - CGST', type: 'Liability', openingBalance: 50000, openingBalanceType: 'Cr' },
  { code: '3000', name: 'Share Capital', type: 'Equity', openingBalance: 1000000, openingBalanceType: 'Cr' },
  { code: '4000', name: 'Sales Revenue - Domestic', type: 'Income', openingBalance: 2400000, openingBalanceType: 'Cr' },
  { code: '5000', name: 'Raw Material Consumed', type: 'Expense', openingBalance: 800000, openingBalanceType: 'Dr' },
  { code: '5100', name: 'Salary - Administrative', type: 'Expense', openingBalance: 250000, openingBalanceType: 'Dr' },
];

// Mock Ledger Transactions
const mockLedgerTransactions: LedgerTransaction[] = [
  {
    id: 'L-001',
    date: '2025-10-01',
    entryNumber: 'JE-2025-001',
    description: 'Customer payment received from Hotel Paradise Ltd',
    referenceNumber: 'INV-2025-001',
    transactionType: 'Manual',
    debitAmount: 172500,
    creditAmount: 0,
    balance: 622500,
    balanceType: 'Dr',
  },
  {
    id: 'L-002',
    date: '2025-10-03',
    entryNumber: 'JE-2025-002',
    description: 'Payment to supplier for raw materials',
    referenceNumber: 'PO-2025-101',
    transactionType: 'Manual',
    debitAmount: 0,
    creditAmount: 125000,
    balance: 497500,
    balanceType: 'Dr',
  },
  {
    id: 'L-003',
    date: '2025-10-05',
    entryNumber: 'JE-2025-003',
    description: 'Bank charges deducted',
    referenceNumber: 'BANK-CHG-001',
    transactionType: 'System',
    debitAmount: 0,
    creditAmount: 2500,
    balance: 495000,
    balanceType: 'Dr',
  },
  {
    id: 'L-004',
    date: '2025-10-08',
    entryNumber: 'JE-2025-004',
    description: 'Cash deposit from retail sales',
    referenceNumber: 'RETAIL-001',
    transactionType: 'Manual',
    debitAmount: 85000,
    creditAmount: 0,
    balance: 580000,
    balanceType: 'Dr',
  },
  {
    id: 'L-005',
    date: '2025-10-10',
    entryNumber: 'JE-2025-005',
    description: 'Salary payment for September 2025',
    referenceNumber: 'SAL-2025-09',
    transactionType: 'Manual',
    debitAmount: 0,
    creditAmount: 180000,
    balance: 400000,
    balanceType: 'Dr',
  },
  {
    id: 'L-006',
    date: '2025-10-12',
    entryNumber: 'JE-2025-006',
    description: 'Rent payment for October 2025',
    referenceNumber: 'RENT-2025-10',
    transactionType: 'Manual',
    debitAmount: 0,
    creditAmount: 60000,
    balance: 340000,
    balanceType: 'Dr',
  },
  {
    id: 'L-007',
    date: '2025-10-14',
    entryNumber: 'JE-2025-007',
    description: 'Customer payment received',
    referenceNumber: 'INV-2025-015',
    transactionType: 'Manual',
    debitAmount: 95000,
    creditAmount: 0,
    balance: 435000,
    balanceType: 'Dr',
  },
  {
    id: 'L-008',
    date: '2025-10-16',
    entryNumber: 'JE-2025-008',
    description: 'Utilities payment - electricity',
    referenceNumber: 'UTIL-2025-10',
    transactionType: 'Manual',
    debitAmount: 0,
    creditAmount: 15000,
    balance: 420000,
    balanceType: 'Dr',
  },
  {
    id: 'L-009',
    date: '2025-10-18',
    entryNumber: 'JE-2025-009',
    description: 'Invoice payment from corporate client',
    referenceNumber: 'INV-2025-020',
    transactionType: 'Manual',
    debitAmount: 250000,
    creditAmount: 0,
    balance: 670000,
    balanceType: 'Dr',
  },
  {
    id: 'L-010',
    date: '2025-10-20',
    entryNumber: 'JE-2025-010',
    description: 'Payment to vendor for supplies',
    referenceNumber: 'PO-2025-120',
    transactionType: 'Manual',
    debitAmount: 0,
    creditAmount: 85000,
    balance: 585000,
    balanceType: 'Dr',
  },
];

// Mock Month Breakdown
const mockMonthBreakdown: MonthBreakdown[] = [
  { month: 'January 2025', openingBalance: 300000, totalDebit: 450000, totalCredit: 380000, closingBalance: 370000, balanceType: 'Dr', transactionCount: 25 },
  { month: 'February 2025', openingBalance: 370000, totalDebit: 420000, totalCredit: 360000, closingBalance: 430000, balanceType: 'Dr', transactionCount: 22 },
  { month: 'March 2025', openingBalance: 430000, totalDebit: 480000, totalCredit: 390000, closingBalance: 520000, balanceType: 'Dr', transactionCount: 28 },
  { month: 'April 2025', openingBalance: 520000, totalDebit: 390000, totalCredit: 410000, closingBalance: 500000, balanceType: 'Dr', transactionCount: 24 },
  { month: 'May 2025', openingBalance: 500000, totalDebit: 410000, totalCredit: 380000, closingBalance: 530000, balanceType: 'Dr', transactionCount: 26 },
  { month: 'June 2025', openingBalance: 530000, totalDebit: 370000, totalCredit: 420000, closingBalance: 480000, balanceType: 'Dr', transactionCount: 23 },
  { month: 'July 2025', openingBalance: 480000, totalDebit: 440000, totalCredit: 390000, closingBalance: 530000, balanceType: 'Dr', transactionCount: 27 },
  { month: 'August 2025', openingBalance: 530000, totalDebit: 400000, totalCredit: 410000, closingBalance: 520000, balanceType: 'Dr', transactionCount: 25 },
  { month: 'September 2025', openingBalance: 520000, totalDebit: 380000, totalCredit: 450000, closingBalance: 450000, balanceType: 'Dr', transactionCount: 24 },
  { month: 'October 2025', openingBalance: 450000, totalDebit: 602500, totalCredit: 467500, closingBalance: 585000, balanceType: 'Dr', transactionCount: 10 },
];

export default function LedgerReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedAccount, setSelectedAccount] = useState<string>('1000');
  const [dateFrom, setDateFrom] = useState('2025-10-01');
  const [dateTo, setDateTo] = useState('2025-10-31');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('all');
  const [transactions, setTransactions] = useState<LedgerTransaction[]>(mockLedgerTransactions);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMonthBreakdown, setShowMonthBreakdown] = useState(false);
  const itemsPerPage = 15;

  // Get account from URL params
  useEffect(() => {
    const accountParam = searchParams.get('account');
    if (accountParam) {
      setSelectedAccount(accountParam);
    }
  }, [searchParams]);

  // Get selected account details
  const account = mockAccounts.find((a) => a.code === selectedAccount) || mockAccounts[0];

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = transactionTypeFilter === 'all' || transaction.transactionType === transactionTypeFilter;
    const matchesDateFrom = !dateFrom || transaction.date >= dateFrom;
    const matchesDateTo = !dateTo || transaction.date <= dateTo;
    return matchesType && matchesDateFrom && matchesDateTo;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Calculate totals
  const totalDebit = filteredTransactions.reduce((sum, t) => sum + t.debitAmount, 0);
  const totalCredit = filteredTransactions.reduce((sum, t) => sum + t.creditAmount, 0);
  const closingBalance = filteredTransactions.length > 0
    ? filteredTransactions[filteredTransactions.length - 1].balance
    : account.openingBalance;

  const transactionTypeConfig = {
    Manual: { color: 'bg-blue-100 text-blue-700' },
    System: { color: 'bg-purple-100 text-purple-700' },
    Adjustment: { color: 'bg-orange-100 text-orange-700' },
    Closing: { color: 'bg-red-100 text-red-700' },
    Opening: { color: 'bg-green-100 text-green-700' },
    Reversal: { color: 'bg-pink-100 text-pink-700' },
  };

  const handlePrint = () => {
    printCurrentView();
  };

  const handleExport = (_format: 'excel' | 'pdf') => {
    exportToCsv('ledger-report', filteredTransactions as unknown as Record<string, unknown>[]);
  };

  return (
    <div className="w-full h-full px-3 py-2">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span>Ledger Report</span>
            </h1>
            <p className="text-gray-600 mt-1">Account-wise transaction details with running balance</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
            <div className="relative group">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-t-lg"
                >
                  Export as Excel
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-b-lg"
                >
                  Export as PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Selection & Info */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-100 border border-blue-200 rounded-lg p-3 mb-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Account</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                >
                  {mockAccounts.map((acc) => (
                    <option key={acc.code} value={acc.code}>
                      {acc.code} - {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Account Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Account Code:</span>
                  <span className="text-sm font-semibold text-blue-600 font-mono">{account.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Account Name:</span>
                  <span className="text-sm font-semibold text-gray-900">{account.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Account Type:</span>
                  <span className="text-sm font-semibold text-purple-700">{account.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Opening Balance:</span>
                  <span className={`text-sm font-bold ${account.openingBalanceType === 'Dr' ? 'text-orange-700' : 'text-green-700'}`}>
                    ₹{account.openingBalance.toLocaleString()} {account.openingBalanceType}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Opening Balance</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">₹{(account.openingBalance / 1000).toFixed(0)}K</p>
                <p className="text-xs text-purple-600 mt-1">{account.openingBalanceType}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Total Debits</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">₹{(totalDebit / 1000).toFixed(0)}K</p>
              </div>
              <ArrowUpCircle className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Credits</p>
                <p className="text-2xl font-bold text-green-900 mt-1">₹{(totalCredit / 1000).toFixed(0)}K</p>
              </div>
              <ArrowDownCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Closing Balance</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">₹{(closingBalance / 1000).toFixed(0)}K</p>
                <p className="text-xs text-blue-600 mt-1">Dr</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
        <div className="flex items-center space-x-2 mb-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters & Options</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
            <select
              value={transactionTypeFilter}
              onChange={(e) => setTransactionTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="Manual">Manual</option>
              <option value="System">System</option>
              <option value="Adjustment">Adjustment</option>
              <option value="Closing">Closing</option>
              <option value="Opening">Opening</option>
              <option value="Reversal">Reversal</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowMonthBreakdown(!showMonthBreakdown)}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${showMonthBreakdown
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'border border-gray-300 hover:bg-gray-50'
                }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Month Breakdown</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <button
            onClick={() => alert('Refresh data')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Month Breakdown */}
      {showMonthBreakdown && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-3">
          <div className="bg-gray-50 border-b border-gray-200 px-3 py-2">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Month-wise Breakdown
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Opening Balance</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total Debit</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total Credit</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Closing Balance</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Transactions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockMonthBreakdown.map((month) => (
                  <tr key={month.month} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-semibold text-gray-900">{month.month}</td>
                    <td className="px-3 py-2 text-right font-semibold text-gray-700">
                      ₹{month.openingBalance.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-orange-700">
                      ₹{month.totalDebit.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-green-700">
                      ₹{month.totalCredit.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-blue-700">
                      ₹{month.closingBalance.toLocaleString()} {month.balanceType}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {month.transactionCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Transaction Details
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-300">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Entry No.</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Debit (₹)</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Credit (₹)</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Balance (₹)</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Opening Balance Row */}
              <tr className="bg-blue-50 font-semibold">
                <td className="px-3 py-2" colSpan={4}>
                  <div className="flex items-center space-x-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-900">Opening Balance</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-right text-gray-400">-</td>
                <td className="px-3 py-2 text-right text-gray-400">-</td>
                <td className="px-3 py-2 text-right">
                  <span className={`font-bold ${account.openingBalanceType === 'Dr' ? 'text-orange-700' : 'text-green-700'}`}>
                    ₹{account.openingBalance.toLocaleString()} {account.openingBalanceType}
                  </span>
                </td>
                <td className="px-3 py-2"></td>
              </tr>

              {/* Transaction Rows */}
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm text-gray-900">{transaction.date}</td>
                  <td className="px-3 py-2">
                    <div className="font-mono text-sm font-semibold text-blue-600">{transaction.entryNumber}</div>
                    <div className="text-xs text-gray-500">{transaction.referenceNumber}</div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">{transaction.description}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${transactionTypeConfig[transaction.transactionType].color}`}>
                      {transaction.transactionType}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {transaction.debitAmount > 0 ? (
                      <span className="font-semibold text-orange-700">
                        {transaction.debitAmount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {transaction.creditAmount > 0 ? (
                      <span className="font-semibold text-green-700">
                        {transaction.creditAmount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className={`font-bold ${transaction.balanceType === 'Dr' ? 'text-orange-700' : 'text-green-700'}`}>
                      {transaction.balance.toLocaleString()} {transaction.balanceType}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => router.push(`/finance/accounting/view/${transaction.entryNumber}`)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"

                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Closing Balance Row */}
              <tr className="bg-blue-50 font-bold border-t-2 border-gray-300">
                <td className="px-3 py-2" colSpan={4}>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-900">Closing Balance</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-right text-orange-700">₹{totalDebit.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-green-700">₹{totalCredit.toLocaleString()}</td>
                <td className="px-3 py-2 text-right">
                  <span className="font-bold text-blue-900 text-lg">
                    ₹{closingBalance.toLocaleString()} Dr
                  </span>
                </td>
                <td className="px-3 py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of{' '}
            {filteredTransactions.length} transactions
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
