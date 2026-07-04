'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: 'Savings' | 'Current' | 'Overdraft' | 'Fixed Deposit' | 'Cash Credit';
  branch: string;
  ifscCode: string;
  swiftCode?: string;
  currency: string;
  currentBalance: number;
  availableBalance: number;
  overdraftLimit?: number;
  status: 'Active' | 'Inactive' | 'Frozen';
  isPrimary: boolean;
  lastReconciled?: string;
  openingDate: string;
  signatories: string[];
}

export default function BankAccountsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');

  // Bank accounts loaded from the cash dashboard analytics endpoint
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const dash = (await FinanceService.getCashDashboard()) as any;
        const rows: any[] = Array.isArray(dash?.bankAccounts)
          ? dash.bankAccounts
          : Array.isArray(dash?.accounts)
            ? dash.accounts
            : [];
        const mapped: BankAccount[] = rows.map((a, i) => ({
          id: a.id ?? a.accountId ?? `BA-${i}`,
          bankName: a.bankName ?? a.name ?? a.accountName ?? '-',
          accountNumber: a.accountNumber ?? a.number ?? '-',
          accountType: (a.accountType ?? 'Current') as BankAccount['accountType'],
          branch: a.branch ?? '-',
          ifscCode: a.ifscCode ?? a.ifsc ?? '-',
          swiftCode: a.swiftCode ?? undefined,
          currency: a.currency ?? 'INR',
          currentBalance: Number(a.currentBalance ?? a.balance ?? 0),
          availableBalance: Number(a.availableBalance ?? a.currentBalance ?? a.balance ?? 0),
          overdraftLimit: a.overdraftLimit !== undefined && a.overdraftLimit !== null ? Number(a.overdraftLimit) : undefined,
          status: (a.status ?? 'Active') as BankAccount['status'],
          isPrimary: Boolean(a.isPrimary),
          lastReconciled: a.lastReconciled ?? undefined,
          openingDate: a.openingDate ?? '',
          signatories: Array.isArray(a.signatories) ? a.signatories : [],
        }));
        if (!cancelled) setBankAccounts(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load bank accounts');
          setBankAccounts([]);
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

  const filteredAccounts = bankAccounts.filter(account => {
    const matchesSearch =
      account.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountNumber.includes(searchTerm) ||
      account.ifscCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
    const matchesType = accountTypeFilter === 'all' || account.accountType === accountTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate statistics
  const totalBalance = bankAccounts
    .filter(acc => acc.currency === 'INR')
    .reduce((sum, acc) => sum + acc.currentBalance, 0);

  const totalAvailable = bankAccounts
    .filter(acc => acc.currency === 'INR')
    .reduce((sum, acc) => sum + acc.availableBalance, 0);

  const activeAccounts = bankAccounts.filter(acc => acc.status === 'Active').length;
  const needsReconciliation = bankAccounts.filter(acc => {
    if (!acc.lastReconciled) return true;
    const lastReconDate = new Date(acc.lastReconciled);
    const daysAgo = Math.floor((new Date().getTime() - lastReconDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysAgo > 7;
  }).length;

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Active: 'bg-green-500/20 text-green-400 border-green-500/50',
      Inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
      Frozen: 'bg-red-500/20 text-red-400 border-red-500/50'
    };
    const icons = {
      Active: CheckCircle,
      Inactive: XCircle,
      Frozen: AlertCircle
    };
    const Icon = icons[status as keyof typeof icons];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const getAccountTypeBadge = (type: string) => {
    const colors = {
      'Current': 'bg-blue-500/20 text-blue-400',
      'Savings': 'bg-green-500/20 text-green-400',
      'Overdraft': 'bg-orange-500/20 text-orange-400',
      'Fixed Deposit': 'bg-purple-500/20 text-purple-400',
      'Cash Credit': 'bg-yellow-500/20 text-yellow-400'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type as keyof typeof colors]}`}>
        {type}
      </span>
    );
  };

  const getDaysFromLastReconciliation = (lastReconciled?: string) => {
    if (!lastReconciled) return 999;
    const lastReconDate = new Date(lastReconciled);
    return Math.floor((new Date().getTime() - lastReconDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full p-3">
          <div className="w-full space-y-3">
            {isLoading && (
              <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
                Loading bank accounts…
              </div>
            )}
            {loadError && !isLoading && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {loadError}
              </div>
            )}
            {/* Action Bar */}
            <div className="flex items-center justify-end">
              <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg">
                <Plus className="w-5 h-5" />
                Add Bank Account
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="w-8 h-8 opacity-80" />
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold mb-1">{formatCurrency(totalBalance)}</div>
                <div className="text-blue-100 text-sm">Total Balance (INR)</div>
                <div className="mt-2 text-xs text-blue-100">{bankAccounts.length} accounts</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-8 h-8 opacity-80" />
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold mb-1">{formatCurrency(totalAvailable)}</div>
                <div className="text-green-100 text-sm">Available Balance</div>
                <div className="mt-2 text-xs text-green-100">Including overdraft limits</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-8 h-8 opacity-80" />
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold mb-1">{activeAccounts}</div>
                <div className="text-purple-100 text-sm">Active Accounts</div>
                <div className="mt-2 text-xs text-purple-100">
                  Out of {bankAccounts.length} total
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="w-8 h-8 opacity-80" />
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold mb-1">{needsReconciliation}</div>
                <div className="text-orange-100 text-sm">Needs Reconciliation</div>
                <div className="mt-2 text-xs text-orange-100">Overdue by 7+ days</div>
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
                      placeholder="Search by bank name, account number, or IFSC..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Frozen">Frozen</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={accountTypeFilter}
                    onChange={(e) => setAccountTypeFilter(e.target.value)}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="Current">Current</option>
                    <option value="Savings">Savings</option>
                    <option value="Overdraft">Overdraft</option>
                    <option value="Fixed Deposit">Fixed Deposit</option>
                    <option value="Cash Credit">Cash Credit</option>
                  </select>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Bank Accounts Table */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Bank Details</th>
                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Account Info</th>
                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Type</th>
                      <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Current Balance</th>
                      <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Available Balance</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Status</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Reconciliation</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((account, index) => {
                      const daysFromReconciliation = getDaysFromLastReconciliation(account.lastReconciled);
                      const reconStatus = daysFromReconciliation > 7 ? 'overdue' : daysFromReconciliation > 5 ? 'warning' : 'ok';

                      return (
                        <tr key={account.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                          <td className="px-3 py-2">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-blue-400" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="font-medium text-white">{account.bankName}</div>
                                  {account.isPrimary && (
                                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                      Primary
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-400">{account.branch}</div>
                                <div className="text-xs text-gray-500 mt-1">IFSC: {account.ifscCode}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-white font-mono text-sm">{account.accountNumber}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              Currency: {account.currency}
                            </div>
                            {account.swiftCode && (
                              <div className="text-xs text-gray-500 mt-1">SWIFT: {account.swiftCode}</div>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {getAccountTypeBadge(account.accountType)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="font-medium text-white">
                              {formatCurrency(account.currentBalance, account.currency)}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="font-medium text-green-400">
                              {formatCurrency(account.availableBalance, account.currency)}
                            </div>
                            {account.overdraftLimit && (
                              <div className="text-xs text-gray-400 mt-1">
                                OD: {formatCurrency(account.overdraftLimit, account.currency)}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {getStatusBadge(account.status)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {account.lastReconciled ? (
                              <div>
                                <div className={`text-sm ${reconStatus === 'overdue' ? 'text-red-400' :
                                    reconStatus === 'warning' ? 'text-orange-400' :
                                      'text-green-400'
                                  }`}>
                                  {daysFromReconciliation} days ago
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(account.lastReconciled).toLocaleDateString()}
                                </div>
                              </div>
                            ) : (
                              <span className="text-red-400 text-sm">Never</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"

                              >
                                <Eye className="w-4 h-4 text-blue-400" />
                              </button>
                              <button
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"

                              >
                                <Edit className="w-4 h-4 text-green-400" />
                              </button>
                              <button
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"

                              >
                                <RefreshCw className="w-4 h-4 text-purple-400" />
                              </button>
                              <button
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"

                              >
                                <MoreVertical className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredAccounts.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-gray-600 mb-2" />
                  <p className="text-gray-400 text-lg">No bank accounts found</p>
                  <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredAccounts.length > 0 && (
              <div className="flex items-center justify-between bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700">
                <div className="text-gray-400 text-sm">
                  Showing {filteredAccounts.length} of {bankAccounts.length} accounts
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Previous
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">2</button>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
