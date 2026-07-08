'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Edit, Trash2, ChevronDown, ChevronRight, DollarSign,
  Building, CreditCard, TrendingUp, ShoppingBag, Briefcase, AlertCircle,
  CheckCircle, Eye, Filter, Download, XCircle, Power, PowerOff, FileText,
  Copy, Archive, BarChart3, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import {
  AddAccountModal,
  ViewAccountDetailsModal,
  EditAccountModal,
  ToggleAccountStatusModal,
  BulkImportAccountsModal
} from '@/components/finance/accounting/ChartOfAccountsModals';
import { FinanceService } from '@/services/finance.service';
import { exportToCsv } from '@/lib/export';
import {
  ExportChartModal,
  AccountHierarchyModal
} from '@/components/finance/accounting/ChartOfAccountsModals2';

// TypeScript Interfaces
interface Account {
  id: string;
  code: string;
  name: string;
  type: 'Assets' | 'Liabilities' | 'Equity' | 'Income' | 'Expenses';
  parentCode?: string;
  parentId?: string;
  balance: number;
  debitBalance: number;
  creditBalance: number;
  isActive: boolean;
  description?: string;
  children?: Account[];
  level: number;
  hasChildren: boolean;
}

// Map the page's display type back to the backend AccountType enum.
const PAGE_TYPE_TO_ENUM: Record<Account['type'], string> = {
  Assets: 'ASSET',
  Liabilities: 'LIABILITY',
  Equity: 'EQUITY',
  Income: 'REVENUE',
  Expenses: 'EXPENSE',
};


export default function ChartOfAccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAccounts = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      // Backend returns raw ORM shape (accountCode/accountName/accountType/
      // parentAccountId); map it to the page's Account model.
      const raw = (await FinanceService.getChartOfAccounts()) as any[];
      const idToCode = new Map(raw.map((a) => [a.id, a.accountCode]));
      const typeMap: Record<string, Account['type']> = {
        Asset: 'Assets', Assets: 'Assets', ASSET: 'Assets',
        Liability: 'Liabilities', Liabilities: 'Liabilities', LIABILITY: 'Liabilities',
        Equity: 'Equity', EQUITY: 'Equity',
        Income: 'Income', Revenue: 'Income', REVENUE: 'Income',
        Expense: 'Expenses', Expenses: 'Expenses', EXPENSE: 'Expenses',
      };
      const parents = new Set(
        raw.filter((a) => a.parentAccountId ?? a.parentId).map((a) => idToCode.get(a.parentAccountId ?? a.parentId)),
      );
      const mapped: Account[] = raw.map((a) => {
        const parentRef = a.parentAccountId ?? a.parentId;
        return {
          id: String(a.id ?? ''),
          code: a.accountCode ?? a.code,
          name: a.accountName ?? a.name,
          type: typeMap[a.accountType ?? a.type] ?? 'Assets',
          parentCode: parentRef ? idToCode.get(parentRef) : undefined,
          parentId: parentRef ? String(parentRef) : undefined,
          balance: Number(a.currentBalance ?? a.balance ?? 0),
          debitBalance: Number(a.debitBalance ?? 0),
          creditBalance: Number(a.creditBalance ?? 0),
          isActive: (a.isActive ?? (a.status ? a.status === 'ACTIVE' : true)),
          description: a.description ?? undefined,
          level: a.level ?? 0,
          hasChildren: parents.has(a.accountCode ?? a.code),
        };
      });
      setAccounts(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load chart of accounts');
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1000', '2000', '3000', '4000', '5000']));

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // ----- Write handlers (wired to FinanceService) -----
  const handleCreateAccount = async (data: any) => {
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      const parent = accounts.find((a) => a.code === data.parentAccount);
      await FinanceService.createAccount({
        code: String(data.code),
        name: String(data.name),
        type: (PAGE_TYPE_TO_ENUM[data.type as Account['type']] ?? 'ASSET') as any,
        parentId: parent?.id || undefined,
        description: data.description || undefined,
        currency: data.currency || undefined,
        isReconcilable: data.reconciliationEnabled ?? undefined,
      });
      setIsAddModalOpen(false);
      setActionMessage({ type: 'success', text: `Account ${data.code} created.` });
      await loadAccounts();
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to create account.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAccount = async (data: any) => {
    if (!selectedAccount?.id) {
      setActionMessage({ type: 'error', text: 'Cannot update: missing account id.' });
      return;
    }
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await FinanceService.updateAccount(selectedAccount.id, {
        name: data.name,
        description: data.description,
        status: data.isActive === false ? ('INACTIVE' as any) : ('ACTIVE' as any),
      });
      setIsEditModalOpen(false);
      setActionMessage({ type: 'success', text: `Account ${selectedAccount.code} updated.` });
      await loadAccounts();
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update account.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedAccount?.id) {
      setActionMessage({ type: 'error', text: 'Cannot update status: missing account id.' });
      return;
    }
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await FinanceService.updateAccount(selectedAccount.id, {
        status: (selectedAccount.isActive ? 'INACTIVE' : 'ACTIVE') as any,
      });
      setIsToggleStatusModalOpen(false);
      setActionMessage({
        type: 'success',
        text: `Account ${selectedAccount.code} ${selectedAccount.isActive ? 'deactivated' : 'activated'}.`,
      });
      await loadAccounts();
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to change status.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount?.id) {
      setActionMessage({ type: 'error', text: 'Cannot delete: missing account id.' });
      return;
    }
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await FinanceService.deleteAccount(selectedAccount.id);
      setIsDeleteModalOpen(false);
      setActionMessage({ type: 'success', text: `Account ${selectedAccount.code} deleted.` });
      await loadAccounts();
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to delete account.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build tree structure
  const buildTree = (accounts: Account[]): Account[] => {
    const accountMap = new Map<string, Account>();
    const tree: Account[] = [];

    // Create map
    accounts.forEach((account) => {
      accountMap.set(account.code, { ...account, children: [] });
    });

    // Build tree
    accountMap.forEach((account) => {
      if (account.parentCode) {
        const parent = accountMap.get(account.parentCode);
        if (parent) {
          parent.children!.push(account);
        }
      } else {
        tree.push(account);
      }
    });

    return tree;
  };

  // Filter accounts
  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || account.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? account.isActive : !account.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  const accountTree = buildTree(filteredAccounts);

  // Statistics
  const stats = {
    totalAccounts: accounts.length,
    assetsAccounts: accounts.filter((a) => a.type === 'Assets' && a.level === 0).length,
    liabilitiesAccounts: accounts.filter((a) => a.type === 'Liabilities' && a.level === 0).length,
    activeAccounts: accounts.filter((a) => a.isActive).length,
  };

  const typeConfig = {
    Assets: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Building },
    Liabilities: { color: 'bg-red-100 text-red-700 border-red-300', icon: CreditCard },
    Equity: { color: 'bg-purple-100 text-purple-700 border-purple-300', icon: TrendingUp },
    Income: { color: 'bg-green-100 text-green-700 border-green-300', icon: DollarSign },
    Expenses: { color: 'bg-orange-100 text-orange-700 border-orange-300', icon: ShoppingBag },
  };

  const toggleNode = (code: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedNodes(newExpanded);
  };

  const renderAccount = (account: Account) => {
    const isExpanded = expandedNodes.has(account.code);
    const TypeIcon = typeConfig[account.type].icon;
    const indentLevel = account.level * 2;

    return (
      <div key={account.code}>
        <div
          className={`flex items-center py-3 px-4 hover:bg-gray-50 transition-colors border-b border-gray-100 ${account.level === 0 ? 'bg-gray-50 font-semibold' : ''
            }`}
          style={{ paddingLeft: `${indentLevel + 1}rem` }}
        >
          <div className="flex items-center flex-1 space-x-3">
            {account.hasChildren ? (
              <button
                onClick={() => toggleNode(account.code)}
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

            <TypeIcon className={`h-5 w-5 ${typeConfig[account.type].color.split(' ')[1]}`} />

            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-semibold text-blue-600">{account.code}</span>
                <span className={`text-sm ${account.level === 0 ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                  {account.name}
                </span>
                {account.description && account.level === 0 && (
                  <span className="text-xs text-gray-500">- {account.description}</span>
                )}
              </div>
            </div>

            <span className={`px-2 py-1 text-xs font-semibold rounded border ${typeConfig[account.type].color}`}>
              {account.type}
            </span>

            <div className="text-right min-w-[150px]">
              <div className="font-bold text-gray-900">₹{account.balance.toLocaleString()}</div>
              {account.level > 0 && (
                <div className="text-xs text-gray-500 flex items-center justify-end space-x-2">
                  {account.debitBalance > 0 && (
                    <span className="text-orange-600">Dr: ₹{account.debitBalance.toLocaleString()}</span>
                  )}
                  {account.creditBalance > 0 && (
                    <span className="text-green-600">Cr: ₹{account.creditBalance.toLocaleString()}</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {account.isActive ? (
                <span className="flex items-center text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </span>
              ) : (
                <span className="flex items-center text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactive
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  setSelectedAccount(account);
                  setIsViewModalOpen(true);
                }}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="View Account Details"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedAccount(account);
                  setIsEditModalOpen(true);
                }}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Edit Account"
              >
                <Edit className="h-4 w-4" />
              </button>
              {account.level > 0 && (
                <button
                  onClick={() => {
                    setSelectedAccount(account);
                    setIsToggleStatusModalOpen(true);
                  }}
                  className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                  title={account.isActive ? 'Deactivate Account' : 'Activate Account'}
                >
                  {account.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedAccount(account);
                  setIsDeleteModalOpen(true);
                }}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete Account"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {isExpanded && account.children && account.children.length > 0 && (
          <div>
            {account.children.map((child) => renderAccount(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full px-3 py-2">
          {isLoading && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
              Loading chart of accounts…
            </div>
          )}
          {loadError && !isLoading && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {loadError}
            </div>
          )}
          {!isLoading && !loadError && accounts.length === 0 && (
            <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              No accounts found.
            </div>
          )}
          {actionMessage && (
            <div
              className={`mb-3 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
                actionMessage.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {actionMessage.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {actionMessage.text}
            </div>
          )}
          {/* Action Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-end mb-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Add New Account</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Accounts</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalAccounts}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Assets Accounts</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">{stats.assetsAccounts}</p>
                  </div>
                  <Building className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Liabilities Accounts</p>
                    <p className="text-2xl font-bold text-red-900 mt-1">{stats.liabilitiesAccounts}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-red-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Active Accounts</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">{stats.activeAccounts}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
            <div className="flex items-center space-x-2 mb-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Account code or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="Assets">Assets</option>
                  <option value="Liabilities">Liabilities</option>
                  <option value="Equity">Equity</option>
                  <option value="Income">Income</option>
                  <option value="Expenses">Expenses</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setStatusFilter('all');
                }}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <XCircle className="h-4 w-4" />
                <span>Clear Filters</span>
              </button>
              <button
                onClick={() => setExpandedNodes(new Set(accounts.filter(a => a.level === 0).map(a => a.code)))}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronDown className="h-4 w-4" />
                <span>Expand All</span>
              </button>
              <button
                onClick={() => setExpandedNodes(new Set())}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
                <span>Collapse All</span>
              </button>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Account Tree */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Account Hierarchy</h2>
                <div className="text-sm text-gray-600">
                  Showing {filteredAccounts.length} of {accounts.length} accounts
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {accountTree.map((account) => renderAccount(account))}
            </div>

            {filteredAccounts.length === 0 && (
              <div className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mb-2" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Accounts Found</h3>
                <p className="text-gray-600">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreate={handleCreateAccount}
      />

      <ViewAccountDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        account={selectedAccount}
      />

      <EditAccountModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        account={selectedAccount}
        onSave={handleUpdateAccount}
      />

      <ToggleAccountStatusModal
        isOpen={isToggleStatusModalOpen}
        onClose={() => setIsToggleStatusModalOpen(false)}
        account={selectedAccount}
        currentStatus={selectedAccount?.isActive ? 'active' : 'inactive'}
        onConfirm={handleToggleStatus}
      />

      <BulkImportAccountsModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        onImport={(data: any) => {
          console.log('Importing accounts:', data);
          setIsBulkImportModalOpen(false);
        }}
      />

      <ExportChartModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={() => {
          exportToCsv('chart-of-accounts', filteredAccounts as unknown as Record<string, unknown>[]);
          setIsExportModalOpen(false);
        }}
      />

      {/* Delete Account Confirmation */}
      {isDeleteModalOpen && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-3 py-2 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Delete Account</h2>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-white hover:text-gray-200">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Delete this account?</p>
                  <p className="text-sm text-red-700 mt-1">
                    Account: <strong>{selectedAccount.code} - {selectedAccount.name}</strong>
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                This action cannot be undone. Accounts with posted transactions may be rejected by the server.
              </p>
            </div>
            <div className="bg-gray-50 px-3 py-2 flex justify-end space-x-3 border-t">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
