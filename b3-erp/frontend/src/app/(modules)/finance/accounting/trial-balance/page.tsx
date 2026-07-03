'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar, Download, Printer, Filter, ChevronDown, ChevronRight,
  CheckCircle, AlertCircle, BarChart3, Building, CreditCard, TrendingUp,
  DollarSign, ShoppingBag, ArrowUpCircle, ArrowDownCircle, FileText,
  Eye, XCircle, RefreshCw
} from 'lucide-react';
import { exportToCsv, printCurrentView } from '@/lib/export';

// TypeScript Interfaces
interface TrialBalance {
  accountCode: string;
  accountName: string;
  accountType: 'Assets' | 'Liabilities' | 'Equity' | 'Income' | 'Expenses';
  openingBalance: number;
  openingBalanceType: 'Dr' | 'Cr';
  debitMovement: number;
  creditMovement: number;
  closingBalance: number;
  closingBalanceType: 'Dr' | 'Cr';
  level: number;
  parentCode?: string;
  hasChildren: boolean;
}

// Mock Trial Balance Data
const mockTrialBalance: TrialBalance[] = [
  // Assets
  { accountCode: '1000', accountName: 'Current Assets', accountType: 'Assets', openingBalance: 1400000, openingBalanceType: 'Dr', debitMovement: 672500, creditMovement: 572500, closingBalance: 1500000, closingBalanceType: 'Dr', level: 0, hasChildren: true },
  { accountCode: '1010', accountName: 'Cash and Cash Equivalents', accountType: 'Assets', parentCode: '1000', openingBalance: 450000, openingBalanceType: 'Dr', debitMovement: 172500, creditMovement: 122500, closingBalance: 500000, closingBalanceType: 'Dr', level: 1, hasChildren: false },
  { accountCode: '1020', accountName: 'Accounts Receivable', accountType: 'Assets', parentCode: '1000', openingBalance: 400000, openingBalanceType: 'Dr', debitMovement: 350000, creditMovement: 300000, closingBalance: 450000, closingBalanceType: 'Dr', level: 1, hasChildren: false },
  { accountCode: '1030', accountName: 'Inventory', accountType: 'Assets', parentCode: '1000', openingBalance: 550000, openingBalanceType: 'Dr', debitMovement: 150000, creditMovement: 150000, closingBalance: 550000, closingBalanceType: 'Dr', level: 1, hasChildren: false },

  { accountCode: '1500', accountName: 'Fixed Assets', accountType: 'Assets', openingBalance: 2800000, openingBalanceType: 'Dr', debitMovement: 0, creditMovement: 50000, closingBalance: 2750000, closingBalanceType: 'Dr', level: 0, hasChildren: true },
  { accountCode: '1510', accountName: 'Property, Plant & Equipment', accountType: 'Assets', parentCode: '1500', openingBalance: 2800000, openingBalanceType: 'Dr', debitMovement: 0, creditMovement: 50000, closingBalance: 2750000, closingBalanceType: 'Dr', level: 1, hasChildren: false },

  // Liabilities
  { accountCode: '2000', accountName: 'Current Liabilities', accountType: 'Liabilities', openingBalance: 750000, openingBalanceType: 'Cr', debitMovement: 125000, creditMovement: 200000, closingBalance: 825000, closingBalanceType: 'Cr', level: 0, hasChildren: true },
  { accountCode: '2010', accountName: 'Accounts Payable', accountType: 'Liabilities', parentCode: '2000', openingBalance: 400000, openingBalanceType: 'Cr', debitMovement: 50000, creditMovement: 100000, closingBalance: 450000, closingBalanceType: 'Cr', level: 1, hasChildren: false },
  { accountCode: '2020', accountName: 'Statutory Liabilities', accountType: 'Liabilities', parentCode: '2000', openingBalance: 150000, openingBalanceType: 'Cr', debitMovement: 25000, creditMovement: 50000, closingBalance: 175000, closingBalanceType: 'Cr', level: 1, hasChildren: false },
  { accountCode: '2030', accountName: 'Accrued Expenses', accountType: 'Liabilities', parentCode: '2000', openingBalance: 200000, openingBalanceType: 'Cr', debitMovement: 50000, creditMovement: 50000, closingBalance: 200000, closingBalanceType: 'Cr', level: 1, hasChildren: false },

  { accountCode: '2500', accountName: 'Long-term Liabilities', accountType: 'Liabilities', openingBalance: 1500000, openingBalanceType: 'Cr', debitMovement: 0, creditMovement: 0, closingBalance: 1500000, closingBalanceType: 'Cr', level: 0, hasChildren: true },
  { accountCode: '2510', accountName: 'Term Loans', accountType: 'Liabilities', parentCode: '2500', openingBalance: 1200000, openingBalanceType: 'Cr', debitMovement: 0, creditMovement: 0, closingBalance: 1200000, closingBalanceType: 'Cr', level: 1, hasChildren: false },
  { accountCode: '2520', accountName: 'Debentures', accountType: 'Liabilities', parentCode: '2500', openingBalance: 300000, openingBalanceType: 'Cr', debitMovement: 0, creditMovement: 0, closingBalance: 300000, closingBalanceType: 'Cr', level: 1, hasChildren: false },

  // Equity
  { accountCode: '3000', accountName: 'Owner\'s Equity', accountType: 'Equity', openingBalance: 2000000, openingBalanceType: 'Cr', debitMovement: 0, creditMovement: 0, closingBalance: 2000000, closingBalanceType: 'Cr', level: 0, hasChildren: true },
  { accountCode: '3010', accountName: 'Share Capital', accountType: 'Equity', parentCode: '3000', openingBalance: 1000000, openingBalanceType: 'Cr', debitMovement: 0, creditMovement: 0, closingBalance: 1000000, closingBalanceType: 'Cr', level: 1, hasChildren: false },
  { accountCode: '3020', accountName: 'Reserves and Surplus', accountType: 'Equity', parentCode: '3000', openingBalance: 1000000, openingBalanceType: 'Cr', debitMovement: 0, creditMovement: 0, closingBalance: 1000000, closingBalanceType: 'Cr', level: 1, hasChildren: false },

  // Income
  { accountCode: '4000', accountName: 'Revenue', accountType: 'Income', openingBalance: 3200000, openingBalanceType: 'Cr', debitMovement: 0, creditMovement: 300000, closingBalance: 3500000, closingBalanceType: 'Cr', level: 0, hasChildren: true },
  { accountCode: '4010', accountName: 'Sales Revenue', accountType: 'Income', parentCode: '4000', openingBalance: 3000000, openingBalanceType: 'Cr', debitMovement: 0, creditMovement: 200000, closingBalance: 3200000, closingBalanceType: 'Cr', level: 1, hasChildren: false },
  { accountCode: '4020', accountName: 'Other Income', accountType: 'Income', parentCode: '4000', openingBalance: 200000, openingBalanceType: 'Cr', debitMovement: 0, creditMovement: 100000, closingBalance: 300000, closingBalanceType: 'Cr', level: 1, hasChildren: false },

  // Expenses
  { accountCode: '5000', accountName: 'Operating Expenses', accountType: 'Expenses', openingBalance: 1950000, openingBalanceType: 'Dr', debitMovement: 150000, creditMovement: 0, closingBalance: 2100000, closingBalanceType: 'Dr', level: 0, hasChildren: true },
  { accountCode: '5010', accountName: 'Cost of Goods Sold', accountType: 'Expenses', parentCode: '5000', openingBalance: 1150000, openingBalanceType: 'Dr', debitMovement: 50000, creditMovement: 0, closingBalance: 1200000, closingBalanceType: 'Dr', level: 1, hasChildren: false },
  { accountCode: '5020', accountName: 'Administrative Expenses', accountType: 'Expenses', parentCode: '5000', openingBalance: 380000, openingBalanceType: 'Dr', debitMovement: 20000, creditMovement: 0, closingBalance: 400000, closingBalanceType: 'Dr', level: 1, hasChildren: false },
  { accountCode: '5030', accountName: 'Selling and Distribution Expenses', accountType: 'Expenses', parentCode: '5000', openingBalance: 270000, openingBalanceType: 'Dr', debitMovement: 30000, creditMovement: 0, closingBalance: 300000, closingBalanceType: 'Dr', level: 1, hasChildren: false },
  { accountCode: '5040', accountName: 'Financial Expenses', accountType: 'Expenses', parentCode: '5000', openingBalance: 150000, openingBalanceType: 'Dr', debitMovement: 50000, creditMovement: 0, closingBalance: 200000, closingBalanceType: 'Dr', level: 1, hasChildren: false },
];

export default function TrialBalancePage() {
  const router = useRouter();
  const [trialBalance] = useState<TrialBalance[]>(mockTrialBalance);
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2025-10-31');
  const [groupByType, setGroupByType] = useState(true);
  const [showMovements, setShowMovements] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Assets', 'Liabilities', 'Equity', 'Income', 'Expenses']));
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());

  // Group accounts by type
  const groupedAccounts = trialBalance.reduce((acc, account) => {
    if (!acc[account.accountType]) {
      acc[account.accountType] = [];
    }
    acc[account.accountType].push(account);
    return acc;
  }, {} as Record<string, TrialBalance[]>);

  // Calculate totals
  const calculateTotals = () => {
    let totalOpeningDebit = 0;
    let totalOpeningCredit = 0;
    let totalDebitMovement = 0;
    let totalCreditMovement = 0;
    let totalClosingDebit = 0;
    let totalClosingCredit = 0;

    trialBalance.forEach((account) => {
      if (account.level === 0) {
        // Opening Balance
        if (account.openingBalanceType === 'Dr') {
          totalOpeningDebit += account.openingBalance;
        } else {
          totalOpeningCredit += account.openingBalance;
        }

        // Movements
        totalDebitMovement += account.debitMovement;
        totalCreditMovement += account.creditMovement;

        // Closing Balance
        if (account.closingBalanceType === 'Dr') {
          totalClosingDebit += account.closingBalance;
        } else {
          totalClosingCredit += account.closingBalance;
        }
      }
    });

    return {
      totalOpeningDebit,
      totalOpeningCredit,
      totalDebitMovement,
      totalCreditMovement,
      totalClosingDebit,
      totalClosingCredit,
      openingDifference: totalOpeningDebit - totalOpeningCredit,
      movementDifference: totalDebitMovement - totalCreditMovement,
      closingDifference: totalClosingDebit - totalClosingCredit,
    };
  };

  const totals = calculateTotals();
  const isBalanced = Math.abs(totals.closingDifference) < 0.01;

  const typeConfig = {
    Assets: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Building },
    Liabilities: { color: 'bg-red-100 text-red-700 border-red-300', icon: CreditCard },
    Equity: { color: 'bg-purple-100 text-purple-700 border-purple-300', icon: TrendingUp },
    Income: { color: 'bg-green-100 text-green-700 border-green-300', icon: DollarSign },
    Expenses: { color: 'bg-orange-100 text-orange-700 border-orange-300', icon: ShoppingBag },
  };

  const toggleGroup = (type: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleAccount = (code: string) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedAccounts(newExpanded);
  };

  const handlePrint = () => {
    printCurrentView();
  };

  const handleExport = (_format: 'excel' | 'pdf') => {
    exportToCsv('trial-balance', trialBalance as unknown as Record<string, unknown>[]);
  };

  const renderAccount = (account: TrialBalance) => {
    const isExpanded = expandedAccounts.has(account.accountCode);
    const indentLevel = account.level * 2;
    const children = trialBalance.filter((a) => a.parentCode === account.accountCode);

    return (
      <div key={account.accountCode}>
        <tr className={`hover:bg-gray-50 ${account.level === 0 ? 'bg-gray-50 font-semibold' : ''}`}>
          <td className="px-3 py-2" style={{ paddingLeft: `${indentLevel + 1.5}rem` }}>
            <div className="flex items-center space-x-2">
              {account.hasChildren ? (
                <button
                  onClick={() => toggleAccount(account.accountCode)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              ) : (
                <div className="w-6" />
              )}
              <div>
                <div className="font-mono text-sm text-blue-600">{account.accountCode}</div>
                <div className={`text-sm ${account.level === 0 ? 'font-semibold' : ''}`}>{account.accountName}</div>
              </div>
            </div>
          </td>
          <td className="px-3 py-2 text-right">
            {account.openingBalanceType === 'Dr' ? (
              <span className="font-semibold text-orange-700">₹{account.openingBalance.toLocaleString()}</span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </td>
          <td className="px-3 py-2 text-right">
            {account.openingBalanceType === 'Cr' ? (
              <span className="font-semibold text-green-700">₹{account.openingBalance.toLocaleString()}</span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </td>
          {showMovements && (
            <>
              <td className="px-3 py-2 text-right">
                {account.debitMovement > 0 ? (
                  <span className="font-semibold text-orange-600">₹{account.debitMovement.toLocaleString()}</span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-3 py-2 text-right">
                {account.creditMovement > 0 ? (
                  <span className="font-semibold text-green-600">₹{account.creditMovement.toLocaleString()}</span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
            </>
          )}
          <td className="px-3 py-2 text-right">
            {account.closingBalanceType === 'Dr' ? (
              <span className="font-bold text-orange-700">₹{account.closingBalance.toLocaleString()}</span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </td>
          <td className="px-3 py-2 text-right">
            {account.closingBalanceType === 'Cr' ? (
              <span className="font-bold text-green-700">₹{account.closingBalance.toLocaleString()}</span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </td>
          <td className="px-3 py-2 text-center">
            <button
              onClick={() => router.push(`/finance/accounting/ledger-report?account=${account.accountCode}`)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"

            >
              <Eye className="h-4 w-4" />
            </button>
          </td>
        </tr>

        {isExpanded && children.map((child) => renderAccount(child))}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full px-3 py-2">
          {/* Action Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-end mb-2">
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

            {/* Balance Status */}
            {isBalanced ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-green-900">Trial Balance is Balanced</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Total Debits (₹{totals.totalClosingDebit.toLocaleString()}) = Total Credits (₹{totals.totalClosingCredit.toLocaleString()})
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-900">Trial Balance Not Balanced</h3>
                  <p className="text-sm text-red-700 mt-1">
                    Difference: ₹{Math.abs(totals.closingDifference).toLocaleString()} ({totals.closingDifference > 0 ? 'Debit' : 'Credit'} excess)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Total Debits</p>
                  <p className="text-2xl font-bold text-orange-900 mt-1">₹{(totals.totalClosingDebit / 1000).toFixed(0)}K</p>
                </div>
                <ArrowUpCircle className="h-8 w-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Credits</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">₹{(totals.totalClosingCredit / 1000).toFixed(0)}K</p>
                </div>
                <ArrowDownCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className={`bg-gradient-to-br rounded-lg p-3 border ${isBalanced
                ? 'from-blue-50 to-blue-100 border-blue-200'
                : 'from-red-50 to-red-100 border-red-200'
              }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isBalanced ? 'text-blue-600' : 'text-red-600'}`}>Difference</p>
                  <p className={`text-2xl font-bold mt-1 ${isBalanced ? 'text-blue-900' : 'text-red-900'}`}>
                    ₹{Math.abs(totals.closingDifference).toLocaleString()}
                  </p>
                </div>
                {isBalanced ? (
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-600" />
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Accounts Count</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">{trialBalance.filter(a => a.level === 0).length}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
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

              <div className="flex items-end">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={groupByType}
                    onChange={(e) => setGroupByType(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Group by Account Type</span>
                </label>
              </div>

              <div className="flex items-end">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMovements}
                    onChange={(e) => setShowMovements(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Movements</span>
                </label>
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

          {/* Trial Balance Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Account</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 uppercase" colSpan={2}>Opening Balance</th>
                    {showMovements && (
                      <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 uppercase" colSpan={2}>Movements</th>
                    )}
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 uppercase" colSpan={2}>Closing Balance</th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
                  </tr>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"></th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                    {showMovements && (
                      <>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                      </>
                    )}
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {groupByType ? (
                    Object.entries(groupedAccounts).map(([type, accounts]) => {
                      const isExpanded = expandedGroups.has(type);
                      const TypeIcon = typeConfig[type as keyof typeof typeConfig].icon;

                      return (
                        <React.Fragment key={type}>
                          <tr className="bg-gray-100 hover:bg-gray-150 cursor-pointer" onClick={() => toggleGroup(type)}>
                            <td className="px-3 py-2 font-bold text-gray-900" colSpan={showMovements ? 8 : 6}>
                              <div className="flex items-center space-x-2">
                                {isExpanded ? (
                                  <ChevronDown className="h-5 w-5 text-gray-600" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-gray-600" />
                                )}
                                <TypeIcon className="h-5 w-5 text-gray-700" />
                                <span>{type}</span>
                                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${typeConfig[type as keyof typeof typeConfig].color}`}>
                                  {accounts.length} accounts
                                </span>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && accounts.filter(a => a.level === 0).map((account) => renderAccount(account))}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    trialBalance.filter(a => a.level === 0).map((account) => renderAccount(account))
                  )}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr className="font-bold">
                    <td className="px-3 py-2 text-gray-900">TOTAL</td>
                    <td className="px-3 py-2 text-right text-orange-700">₹{totals.totalOpeningDebit.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-green-700">₹{totals.totalOpeningCredit.toLocaleString()}</td>
                    {showMovements && (
                      <>
                        <td className="px-3 py-2 text-right text-orange-600">₹{totals.totalDebitMovement.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-green-600">₹{totals.totalCreditMovement.toLocaleString()}</td>
                      </>
                    )}
                    <td className="px-3 py-2 text-right text-orange-700 text-lg">₹{totals.totalClosingDebit.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-green-700 text-lg">₹{totals.totalClosingCredit.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center">
                      {isBalanced ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
