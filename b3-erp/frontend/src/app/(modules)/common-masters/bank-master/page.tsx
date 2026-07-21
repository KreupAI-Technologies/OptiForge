'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Download, Filter, X, Building2, CreditCard, TrendingUp, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Bank } from '@/data/common-masters/banks';
import { commonMastersService } from '@/services/common-masters.service';
import { exportToCsv } from '@/lib/export';

const DEFAULT_COMPANY_ID = '1';

export default function BankMasterPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPurpose, setFilterPurpose] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    bankName: '',
    branchName: '',
    accountNumber: '',
    accountType: 'current' as Bank['accountType'],
    accountHolderName: '',
    ifscCode: '',
    accountPurpose: 'operations' as Bank['accountPurpose'],
    isActive: true,
  });

  // Fetch bank accounts from the live backend, mapping the raw API shape into the page's Bank model.
  const fetchBanks = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = (await commonMastersService.getAllBankAccounts(DEFAULT_COMPANY_ID)) as any[];
      const mapped: Bank[] = raw.map((b) => ({
          id: String(b.id ?? ''),
          bankCode: b.bankCode ?? '',
          bankName: b.bankName ?? '',
          branchName: b.branchName ?? '',
          branchCode: b.branchCode ?? '',
          accountNumber: b.accountNumber ?? '',
          accountType: (b.accountType ?? 'current') as Bank['accountType'],
          accountHolderName: b.accountHolderName ?? '',
          accountCurrency: b.accountCurrency ?? b.currency ?? 'INR',
          ifscCode: b.ifscCode ?? '',
          micrCode: b.micrCode ?? undefined,
          swiftCode: b.swiftCode ?? undefined,
          ibanNumber: b.ibanNumber ?? undefined,
          address: b.address ?? b.contactDetails?.address ?? '',
          city: b.city ?? '',
          state: b.state ?? '',
          pincode: b.pincode ?? '',
          country: b.country ?? '',
          phone: b.phone ?? '',
          email: b.email ?? '',
          contactPerson: b.contactPerson ?? undefined,
          currentBalance: Number(b.currentBalance ?? b.bankingDetails?.currentBalance ?? 0),
          openingBalance: Number(b.openingBalance ?? 0),
          availableBalance: Number(b.availableBalance ?? 0),
          overdraftLimit: b.overdraftLimit !== null && b.overdraftLimit !== undefined ? Number(b.overdraftLimit) : undefined,
          minimumBalance: Number(b.minimumBalance ?? 0),
          dailyTransactionLimit: b.dailyTransactionLimit !== null && b.dailyTransactionLimit !== undefined ? Number(b.dailyTransactionLimit) : undefined,
          singleTransactionLimit: b.singleTransactionLimit !== null && b.singleTransactionLimit !== undefined ? Number(b.singleTransactionLimit) : undefined,
          monthlyTransactionLimit: b.monthlyTransactionLimit !== null && b.monthlyTransactionLimit !== undefined ? Number(b.monthlyTransactionLimit) : undefined,
          isPrimaryAccount: b.isPrimary ?? b.isPrimaryAccount ?? false,
          accountPurpose: (b.accountPurpose ?? 'operations') as Bank['accountPurpose'],
          allowedTransactionTypes: Array.isArray(b.allowedTransactionTypes) ? b.allowedTransactionTypes : [],
          internetBankingEnabled: b.internetBankingEnabled ?? b.onlineAccess?.enabled ?? false,
          internetBankingId: b.internetBankingId ?? undefined,
          lastLoginDate: b.lastLoginDate ?? undefined,
          bankIntegrationEnabled: b.bankIntegrationEnabled ?? false,
          apiEndpoint: b.apiEndpoint ?? undefined,
          lastSyncDate: b.lastSyncDate ?? undefined,
          autoReconciliation: b.autoReconciliation ?? false,
          totalDeposits: Number(b.totalDeposits ?? 0),
          totalWithdrawals: Number(b.totalWithdrawals ?? 0),
          transactionCount: Number(b.transactionCount ?? 0),
          lastTransactionDate: b.lastTransactionDate ?? '',
          taxDeductionAccount: b.taxDeductionAccount ?? false,
          gstRegistered: b.gstRegistered ?? false,
          gstNumber: b.gstNumber ?? undefined,
          isActive: b.isActive ?? (b.status ? b.status === 'active' : true),
          createdBy: b.createdBy ?? '',
          createdDate: b.createdDate ?? b.createdAt ?? '',
          modifiedBy: b.modifiedBy ?? '',
          modifiedDate: b.modifiedDate ?? b.updatedAt ?? '',
      }));
      setBanks(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load bank accounts');
      setBanks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const openCreateModal = () => {
    setForm({
      bankName: '',
      branchName: '',
      accountNumber: '',
      accountType: 'current',
      accountHolderName: '',
      ifscCode: '',
      accountPurpose: 'operations',
      isActive: true,
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleAddBank = () => openCreateModal();
  const handleViewBank = (bank: Bank) => showToast(`Viewing bank: ${bank.bankName}`, 'info');

  const handleEditBank = (bank: Bank) => {
    setForm({
      bankName: bank.bankName,
      branchName: bank.branchName,
      accountNumber: bank.accountNumber,
      accountType: bank.accountType,
      accountHolderName: bank.accountHolderName,
      ifscCode: bank.ifscCode,
      accountPurpose: bank.accountPurpose,
      isActive: bank.isActive,
    });
    setEditingId(bank.id);
    setIsModalOpen(true);
  };

  const handleSaveBank = async () => {
    if (!form.bankName.trim() || !form.accountNumber.trim() || !form.ifscCode.trim() || !form.accountHolderName.trim()) {
      showToast('Bank Name, Account Number, IFSC Code and Account Holder Name are required', 'error');
      return;
    }
    try {
      setIsSaving(true);
      const payload = {
        bankName: form.bankName,
        branchName: form.branchName,
        accountNumber: form.accountNumber,
        accountType: form.accountType,
        accountHolderName: form.accountHolderName,
        ifscCode: form.ifscCode,
        accountPurpose: form.accountPurpose,
        isActive: form.isActive,
        companyId: DEFAULT_COMPANY_ID,
      };
      if (editingId) {
        await commonMastersService.updateBankAccount(editingId, payload);
      } else {
        await commonMastersService.createBankAccount(payload);
      }
      setIsModalOpen(false);
      await fetchBanks();
      showToast(editingId ? 'Bank account updated successfully' : 'Bank account created successfully', 'success');
    } catch (error) {
      console.error('Error saving bank account:', error);
      showToast('Failed to save bank account', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBank = async (bank: Bank) => {
    if (!confirm(`Delete bank account "${bank.bankName}"?`)) {
      return;
    }
    try {
      await commonMastersService.deleteBankAccount(bank.id);
      await fetchBanks();
      showToast('Bank account deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting bank account:', error);
      showToast('Failed to delete bank account', 'error');
    }
  };
  const handleExport = () => {
    exportToCsv('bank-master', filteredData);
    showToast('Exporting banks data...', 'success');
  };
  const handleSync = () => showToast('Syncing bank data...', 'success');

  const filteredData = useMemo(() => {
    return banks.filter(bank => {
      const matchesSearch =
        bank.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.accountNumber.includes(searchTerm) ||
        bank.ifscCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || bank.accountType === filterType;
      const matchesPurpose = filterPurpose === 'all' || bank.accountPurpose === filterPurpose;

      return matchesSearch && matchesType && matchesPurpose;
    });
  }, [banks, searchTerm, filterType, filterPurpose]);

  const getAccountTypeColor = (type: string) => {
    const colors = {
      'savings': 'bg-blue-100 text-blue-800',
      'current': 'bg-green-100 text-green-800',
      'cash_credit': 'bg-purple-100 text-purple-800',
      'overdraft': 'bg-orange-100 text-orange-800',
      'fixed_deposit': 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const columns: Column<Bank>[] = [
    {
      id: 'bank',
      header: 'Bank Details',
      accessor: 'bankName',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 flex items-center gap-2">
            {row.isPrimaryAccount && <Building2 className="w-4 h-4 text-blue-600" />}
            {value}
          </div>
          <div className="text-xs text-gray-500">{row.branchName}</div>
          <div className="text-xs">
            <span className="font-mono text-blue-600">{row.ifscCode}</span>
          </div>
        </div>
      )
    },
    {
      id: 'account',
      header: 'Account',
      accessor: 'accountNumber',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-mono font-medium text-gray-900">{value}</div>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize mt-1 ${getAccountTypeColor(row.accountType)}`}>
            {row.accountType.replace('_', ' ')}
          </span>
        </div>
      )
    },
    {
      id: 'balance',
      header: 'Balance',
      accessor: 'currentBalance',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-semibold text-gray-900">₹{(value / 1000000).toFixed(2)}M</div>
          <div className="text-xs text-green-600">Available: ₹{(row.availableBalance / 1000000).toFixed(2)}M</div>
          {row.overdraftLimit && (
            <div className="text-xs text-purple-600">OD: ₹{(row.overdraftLimit / 1000000).toFixed(2)}M</div>
          )}
        </div>
      )
    },
    {
      id: 'purpose',
      header: 'Purpose',
      accessor: 'accountPurpose',
      sortable: true,
      render: (value) => (
        <div className="text-xs capitalize">
          {value.replace('_', ' ')}
        </div>
      )
    },
    {
      id: 'transactions',
      header: 'Transactions',
      accessor: 'transactionCount',
      sortable: true,
      render: (value, row) => (
        <div className="text-xs">
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-green-600">In: ₹{(row.totalDeposits / 1000000).toFixed(1)}M</div>
          <div className="text-red-600">Out: ₹{(row.totalWithdrawals / 1000000).toFixed(1)}M</div>
        </div>
      )
    },
    {
      id: 'integration',
      header: 'Integration',
      accessor: 'bankIntegrationEnabled',
      sortable: true,
      render: (value, row) => (
        <div className="text-xs">
          {value ? (
            <>
              <div className="text-green-600 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Enabled
              </div>
              {row.autoReconciliation && <div className="text-blue-600">✓ Auto Recon</div>}
              {row.lastSyncDate && <div className="text-gray-500">Sync: {new Date(row.lastSyncDate).toLocaleDateString()}</div>}
            </>
          ) : (
            <div className="text-gray-400">Manual</div>
          )}
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'isActive',
      sortable: true,
      render: (value) => (
        <StatusBadge status={value ? 'active' : 'inactive'} text={value ? 'Active' : 'Inactive'} />
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" onClick={(e) => { e.stopPropagation(); handleViewBank(row); }}>
            View
          </button>
          <button className="text-green-600 hover:text-green-800 text-sm font-medium" onClick={(e) => { e.stopPropagation(); handleEditBank(row); }}>
            Edit
          </button>
          <button className="text-red-600 hover:text-red-800 text-sm font-medium" onClick={(e) => { e.stopPropagation(); handleDeleteBank(row); }}>
            Delete
          </button>
        </div>
      )
    }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterPurpose('all');
  };

  const activeFilterCount = [filterType !== 'all', filterPurpose !== 'all', searchTerm !== ''].filter(Boolean).length;
  const stats = useMemo(() => {
    const activeBanks = banks.filter((b) => b.isActive);
    return {
      total: banks.length,
      active: activeBanks.length,
      totalBalance: activeBanks.reduce((sum, b) => sum + b.currentBalance, 0),
      totalAvailableBalance: activeBanks.reduce((sum, b) => sum + b.availableBalance, 0),
      totalDeposits: activeBanks.reduce((sum, b) => sum + b.totalDeposits, 0),
      totalWithdrawals: activeBanks.reduce((sum, b) => sum + b.totalWithdrawals, 0),
      withIntegration: activeBanks.filter((b) => b.bankIntegrationEnabled).length,
    };
  }, [banks]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="px-3 py-2 space-y-3">
          {toast && (
            <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5">
              <div className={`rounded-lg px-4 py-3 shadow-lg flex items-center gap-3 ${
                toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                {toast.type === 'error' && <XCircle className="w-5 h-5" />}
                {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
                <span className="font-medium">{toast.message}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-7 h-7 text-blue-600" />
                Bank Master
              </h1>
              <p className="text-gray-600 mt-1">Manage bank accounts and payment processing</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleSync} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
            <span>Sync</span>
          </button>
          <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button onClick={handleAddBank} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            <span>Add Bank</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Total Banks</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <CreditCard className="w-3 h-3" /> Total Balance
          </div>
          <div className="text-2xl font-bold text-green-600">₹{(stats.totalBalance / 10000000).toFixed(1)}Cr</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Available</div>
          <div className="text-2xl font-bold text-blue-600">₹{(stats.totalAvailableBalance / 10000000).toFixed(1)}Cr</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Deposits
          </div>
          <div className="text-2xl font-bold text-purple-600">₹{(stats.totalDeposits / 10000000).toFixed(1)}Cr</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Withdrawals</div>
          <div className="text-2xl font-bold text-orange-600">₹{(stats.totalWithdrawals / 10000000).toFixed(1)}Cr</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Integrated
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.withIntegration}/{stats.active}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search by bank name, account number, or IFSC..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}>
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">{activeFilterCount}</span>}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900">
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="all">All Types</option>
                <option value="current">Current</option>
                <option value="savings">Savings</option>
                <option value="cash_credit">Cash Credit</option>
                <option value="overdraft">Overdraft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
              <select value={filterPurpose} onChange={(e) => setFilterPurpose(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="all">All Purposes</option>
                <option value="operations">Operations</option>
                <option value="payroll">Payroll</option>
                <option value="tax">Tax</option>
                <option value="vendor_payments">Vendor Payments</option>
                <option value="customer_receipts">Customer Receipts</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading bank accounts…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && banks.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No bank accounts found.
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <DataTable data={filteredData} columns={columns} pagination={{ enabled: true, pageSize: 10 }} sorting={{ enabled: true, defaultSort: { column: 'bank', direction: 'asc' } }} emptyMessage="No banks found" />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Bank Account Management
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>✓ Multiple bank accounts with purpose-based segregation (operations, payroll, tax, etc.)</li>
          <li>✓ Real-time balance tracking with overdraft limit monitoring</li>
          <li>✓ Bank integration for automatic transaction sync and reconciliation</li>
          <li>✓ Transaction limits (daily, single, monthly) for risk management</li>
          <li>✓ Internet banking integration with API endpoints for automated processing</li>
          <li>✓ GST registration and TDS account designation for tax compliance</li>
        </ul>
      </div>
        </div>
      </div>

      {/* Add/Edit Bank Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Bank Account' : 'Add Bank Account'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                <input
                  type="text"
                  value={form.branchName}
                  onChange={(e) => setForm({ ...form, branchName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <input
                  type="text"
                  value={form.accountNumber}
                  onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                <select
                  value={form.accountType}
                  onChange={(e) => setForm({ ...form, accountType: e.target.value as Bank['accountType'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="savings">Savings</option>
                  <option value="current">Current</option>
                  <option value="cash_credit">Cash Credit</option>
                  <option value="overdraft">Overdraft</option>
                  <option value="fixed_deposit">Fixed Deposit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                <input
                  type="text"
                  value={form.accountHolderName}
                  onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                <input
                  type="text"
                  value={form.ifscCode}
                  onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Purpose</label>
                <select
                  value={form.accountPurpose}
                  onChange={(e) => setForm({ ...form, accountPurpose: e.target.value as Bank['accountPurpose'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="operations">Operations</option>
                  <option value="payroll">Payroll</option>
                  <option value="tax">Tax</option>
                  <option value="vendor_payments">Vendor Payments</option>
                  <option value="customer_receipts">Customer Receipts</option>
                  <option value="multi_purpose">Multi Purpose</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-8">
                <input
                  id="bank-active"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="bank-active" className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBank}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
