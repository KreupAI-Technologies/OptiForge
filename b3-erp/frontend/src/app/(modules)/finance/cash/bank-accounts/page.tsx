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

// Normalize a backend account-type value onto the page's view-model enum.
const mapAccountType = (raw: any): BankAccount['accountType'] => {
  const v = String(raw ?? '').toLowerCase();
  if (v === 'savings') return 'Savings';
  if (v === 'overdraft') return 'Overdraft';
  if (v === 'fixed-deposit' || v === 'fixed deposit') return 'Fixed Deposit';
  if (v === 'cash-credit' || v === 'cash credit' || v === 'credit-card') return 'Cash Credit';
  return 'Current';
};

// Reverse mapping: view-model enum → backend enum value.
const toBackendAccountType = (t: BankAccount['accountType']): string => {
  switch (t) {
    case 'Savings': return 'savings';
    case 'Fixed Deposit': return 'fixed-deposit';
    case 'Cash Credit': return 'credit-card';
    case 'Overdraft': return 'current';
    default: return 'current';
  }
};

const mapStatus = (raw: any): BankAccount['status'] => {
  const v = String(raw ?? '').toLowerCase();
  if (v === 'inactive' || v === 'closed') return 'Inactive';
  if (v === 'frozen') return 'Frozen';
  return 'Active';
};

const toBackendStatus = (s: BankAccount['status']): string => {
  if (s === 'Inactive') return 'inactive';
  if (s === 'Frozen') return 'inactive';
  return 'active';
};

// Map a raw backend bank-account record onto the page's BankAccount view-model.
const mapBankAccount = (a: any, i: number): BankAccount => ({
  id: a.id ?? a.accountId ?? `BA-${i}`,
  bankName: a.bankName ?? a.name ?? '-',
  accountNumber: a.accountNumber ?? a.number ?? '-',
  accountType: mapAccountType(a.accountType),
  branch: a.branch ?? '-',
  ifscCode: a.ifscCode ?? a.ifsc ?? '-',
  swiftCode: a.swiftCode ?? undefined,
  currency: a.currency ?? 'INR',
  currentBalance: Number(a.currentBalance ?? a.balance ?? 0),
  availableBalance: Number(a.availableBalance ?? a.currentBalance ?? a.balance ?? 0),
  overdraftLimit: a.overdraftLimit !== undefined && a.overdraftLimit !== null ? Number(a.overdraftLimit) : undefined,
  status: mapStatus(a.status),
  isPrimary: Boolean(a.isPrimary),
  lastReconciled: a.lastReconciled ?? undefined,
  openingDate: a.openingDate ? String(a.openingDate).split('T')[0] : '',
  signatories: Array.isArray(a.signatories) ? a.signatories : [],
});

// Editable form shape used by the create/edit modals.
interface BankAccountForm {
  bankName: string;
  accountName: string;
  accountNumber: string;
  accountType: BankAccount['accountType'];
  branch: string;
  ifscCode: string;
  swiftCode: string;
  currency: string;
  currentBalance: string;
  openingBalance: string;
  openingDate: string;
  status: BankAccount['status'];
}

const emptyForm: BankAccountForm = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  accountType: 'Current',
  branch: '',
  ifscCode: '',
  swiftCode: '',
  currency: 'INR',
  currentBalance: '0',
  openingBalance: '0',
  openingDate: new Date().toISOString().split('T')[0],
  status: 'Active',
};

export default function BankAccountsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');

  // Bank accounts loaded from the accounts module (/api/accounts/banks)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // View-details modal, populated from already-fetched account data
  const [viewAccount, setViewAccount] = useState<BankAccount | null>(null);

  // Create/edit modal state. `editId` null => create mode.
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BankAccountForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const rows = await FinanceService.getBankAccounts();
      const mapped: BankAccount[] = (Array.isArray(rows) ? rows : []).map(mapBankAccount);
      setBankAccounts(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load bank accounts');
      setBankAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (account: BankAccount) => {
    setEditId(account.id);
    setForm({
      bankName: account.bankName === '-' ? '' : account.bankName,
      accountName: account.bankName === '-' ? '' : account.bankName,
      accountNumber: account.accountNumber === '-' ? '' : account.accountNumber,
      accountType: account.accountType,
      branch: account.branch === '-' ? '' : account.branch,
      ifscCode: account.ifscCode === '-' ? '' : account.ifscCode,
      swiftCode: account.swiftCode ?? '',
      currency: account.currency,
      currentBalance: String(account.currentBalance ?? 0),
      openingBalance: String(account.currentBalance ?? 0),
      openingDate: account.openingDate || new Date().toISOString().split('T')[0],
      status: account.status,
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setFormError(null);
    try {
      const payload: any = {
        bankName: form.bankName.trim(),
        accountName: (form.accountName.trim() || form.bankName.trim()),
        accountNumber: form.accountNumber.trim(),
        accountType: toBackendAccountType(form.accountType),
        branch: form.branch.trim(),
        ifscCode: form.ifscCode.trim() || undefined,
        swiftCode: form.swiftCode.trim() || undefined,
        currency: form.currency.trim() || 'INR',
        currentBalance: Number(form.currentBalance) || 0,
        openingBalance: Number(form.openingBalance) || Number(form.currentBalance) || 0,
        openingDate: form.openingDate,
        status: toBackendStatus(form.status),
      };
      if (editId) {
        await FinanceService.updateBankAccount(editId, payload);
      } else {
        await FinanceService.createBankAccount(payload);
      }
      setFormOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save bank account');
    } finally {
      setSaving(false);
    }
  };


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

  // Client-side CSV export of the currently-filtered accounts (already fetched).
  const handleExport = () => {
    const headers = [
      'Bank Name', 'Account Number', 'Type', 'Branch', 'IFSC', 'SWIFT',
      'Currency', 'Current Balance', 'Available Balance', 'Overdraft Limit',
      'Status', 'Primary', 'Last Reconciled', 'Opening Date',
    ];
    const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = filteredAccounts.map((a) => [
      a.bankName, a.accountNumber, a.accountType, a.branch, a.ifscCode, a.swiftCode ?? '',
      a.currency, a.currentBalance, a.availableBalance, a.overdraftLimit ?? '',
      a.status, a.isPrimary ? 'Yes' : 'No', a.lastReconciled ?? '', a.openingDate,
    ].map(escape).join(','));
    const csv = [headers.map(escape).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bank-accounts-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg"
              >
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

                <button
                  onClick={handleExport}
                  disabled={filteredAccounts.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
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
                                onClick={() => setViewAccount(account)}
                                title="View details"
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4 text-blue-400" />
                              </button>
                              <button
                                onClick={() => openEdit(account)}
                                title="Edit account"
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

      {/* View Details Modal (from already-fetched account data) */}
      {viewAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-gray-700 bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-700 px-5 py-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">{viewAccount.bankName}</h3>
              </div>
              <button
                onClick={() => setViewAccount(null)}
                className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 px-5 py-4 text-sm">
              <div>
                <div className="text-gray-500">Account Number</div>
                <div className="text-white font-mono">{viewAccount.accountNumber}</div>
              </div>
              <div>
                <div className="text-gray-500">Type</div>
                <div className="text-white">{viewAccount.accountType}</div>
              </div>
              <div>
                <div className="text-gray-500">Branch</div>
                <div className="text-white">{viewAccount.branch}</div>
              </div>
              <div>
                <div className="text-gray-500">IFSC</div>
                <div className="text-white">{viewAccount.ifscCode}</div>
              </div>
              {viewAccount.swiftCode && (
                <div>
                  <div className="text-gray-500">SWIFT</div>
                  <div className="text-white">{viewAccount.swiftCode}</div>
                </div>
              )}
              <div>
                <div className="text-gray-500">Currency</div>
                <div className="text-white">{viewAccount.currency}</div>
              </div>
              <div>
                <div className="text-gray-500">Current Balance</div>
                <div className="text-white">{formatCurrency(viewAccount.currentBalance, viewAccount.currency)}</div>
              </div>
              <div>
                <div className="text-gray-500">Available Balance</div>
                <div className="text-green-400">{formatCurrency(viewAccount.availableBalance, viewAccount.currency)}</div>
              </div>
              {viewAccount.overdraftLimit !== undefined && (
                <div>
                  <div className="text-gray-500">Overdraft Limit</div>
                  <div className="text-white">{formatCurrency(viewAccount.overdraftLimit, viewAccount.currency)}</div>
                </div>
              )}
              <div>
                <div className="text-gray-500">Status</div>
                <div>{getStatusBadge(viewAccount.status)}</div>
              </div>
              <div>
                <div className="text-gray-500">Opening Date</div>
                <div className="text-white">{viewAccount.openingDate ? new Date(viewAccount.openingDate).toLocaleDateString() : '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">Last Reconciled</div>
                <div className="text-white">{viewAccount.lastReconciled ? new Date(viewAccount.lastReconciled).toLocaleDateString() : 'Never'}</div>
              </div>
              {viewAccount.signatories.length > 0 && (
                <div className="col-span-2">
                  <div className="text-gray-500">Signatories</div>
                  <div className="text-white">{viewAccount.signatories.join(', ')}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-gray-700 bg-gray-900 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-700 px-5 py-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">
                  {editId ? 'Edit Bank Account' : 'Add Bank Account'}
                </h3>
              </div>
              <button
                onClick={() => setFormOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-5 py-4 text-sm">
                <div>
                  <label className="block text-gray-400 mb-1">Bank Name *</label>
                  <input
                    required
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Account Name</label>
                  <input
                    value={form.accountName}
                    onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                    placeholder="Defaults to bank name"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Account Number *</label>
                  <input
                    required
                    value={form.accountNumber}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Account Type</label>
                  <select
                    value={form.accountType}
                    onChange={(e) => setForm({ ...form, accountType: e.target.value as BankAccount['accountType'] })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Current">Current</option>
                    <option value="Savings">Savings</option>
                    <option value="Overdraft">Overdraft</option>
                    <option value="Fixed Deposit">Fixed Deposit</option>
                    <option value="Cash Credit">Cash Credit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Branch</label>
                  <input
                    value={form.branch}
                    onChange={(e) => setForm({ ...form, branch: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">IFSC Code</label>
                  <input
                    value={form.ifscCode}
                    onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">SWIFT Code</label>
                  <input
                    value={form.swiftCode}
                    onChange={(e) => setForm({ ...form, swiftCode: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Currency</label>
                  <input
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Current Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.currentBalance}
                    onChange={(e) => setForm({ ...form, currentBalance: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Opening Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.openingBalance}
                    onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Opening Date</label>
                  <input
                    type="date"
                    value={form.openingDate}
                    onChange={(e) => setForm({ ...form, openingDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as BankAccount['status'] })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Frozen">Frozen</option>
                  </select>
                </div>
              </div>

              {formError && (
                <div className="mx-5 mb-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-gray-700 px-5 py-3">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
