'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Calculator, TrendingUp, DollarSign, BookOpen, ChevronRight, ChevronDown, Building, Download, Upload, Grid, List } from 'lucide-react';
import { commonMastersService, Account } from '@/services/common-masters.service';

const accountTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];
const accountSubTypes = {
  asset: ['Current Assets', 'Fixed Assets', 'Intangible Assets', 'Investments'],
  liability: ['Current Liabilities', 'Long-term Liabilities', 'Deferred Liabilities'],
  equity: ['Share Capital', 'Retained Earnings', 'Other Equity'],
  revenue: ['Operating Revenue', 'Non-operating Revenue', 'Other Income'],
  expense: ['Operating Expenses', 'Administrative Expenses', 'Financial Expenses', 'Other Expenses']
};
const currencies = ['USD', 'EUR', 'GBP', 'CAD'];
const taxCategories = ['Standard Rate', 'Reduced Rate', 'Zero Rate', 'Exempt', 'Non-taxable'];

export default function ChartOfAccountsMaster() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await commonMastersService.getAllAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '2', '5']));
  const [activeTab, setActiveTab] = useState('basic');

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || account.accountType === filterType;
    const matchesStatus = filterStatus === 'all' || account.status === filterStatus;
    const matchesLevel = filterLevel === 'all' || account.level.toString() === filterLevel;

    return matchesSearch && matchesType && matchesStatus && matchesLevel;
  });

  const buildAccountTree = (accounts: Account[]): Account[] => {
    return accounts.filter(acc => !acc.parentId).sort((a, b) => a.accountCode.localeCompare(b.accountCode));
  };

  const getChildAccounts = (parentId: string): Account[] => {
    return accounts
      .filter(acc => acc.parentId === parentId)
      .sort((a, b) => a.accountCode.localeCompare(b.accountCode));
  };

  const toggleExpanded = (accountId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleAddAccount = (parentId?: string) => {
    const parentAccount = parentId ? accounts.find(a => a.id === parentId) : null;
    setEditingAccount({
      id: '',
      accountCode: '',
      accountName: '',
      parentId: parentId,
      level: parentAccount ? parentAccount.level + 1 : 1,
      accountType: parentAccount?.accountType || 'asset',
      accountSubType: '',
      status: 'active',
      description: '',
      isControlAccount: false,
      allowPosting: true,
      currency: 'USD',
      taxConfiguration: {
        taxable: false,
        taxCategory: 'Non-taxable'
      },
      reportingSettings: {
        includeInBalanceSheet: true,
        includeInPL: false,
        includeInCashFlow: false,
        reportingGroup: ''
      },
      balanceInfo: {
        openingBalance: 0,
        currentBalance: 0,
        debitBalance: 0,
        creditBalance: 0,
        lastActivity: new Date().toISOString().split('T')[0]
      },
      restrictions: {},
      integration: {},
      createdAt: '',
      updatedAt: ''
    } as Account);
    setShowModal(true);
    setActiveTab('basic');
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setShowModal(true);
    setActiveTab('basic');
  };

  const handleDeleteAccount = (id: string) => {
    const hasChildren = accounts.some(acc => acc.parentId === id);
    if (hasChildren) {
      alert('Cannot delete account with sub-accounts. Please delete sub-accounts first.');
      return;
    }
    if (confirm('Are you sure you want to delete this account?')) {
      setAccounts(accounts.filter(account => account.id !== id));
    }
  };

  const handleSaveAccount = (accountData: any) => {
    if (editingAccount?.id) {
      setAccounts(accounts.map(account =>
        account.id === editingAccount.id
          ? { ...account, ...accountData, updatedAt: new Date().toISOString().split('T')[0] }
          : account
      ));
    } else {
      const newAccount: Account = {
        id: Date.now().toString(),
        ...accountData,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setAccounts([...accounts, newAccount]);
    }
    setShowModal(false);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`;
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      asset: 'bg-blue-100 text-blue-800',
      liability: 'bg-red-100 text-red-800',
      equity: 'bg-purple-100 text-purple-800',
      revenue: 'bg-green-100 text-green-800',
      expense: 'bg-orange-100 text-orange-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[type as keyof typeof colors]}`;
  };

  const formatBalance = (balance: number | undefined) => {
    if (balance === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(balance);
  };

  const renderTreeNode = (account: Account, depth = 0): React.ReactNode => {
    const children = getChildAccounts(account.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(account.id);
    const paddingLeft = depth * 24;

    return (
      <div key={account.id}>
        <div
          className="flex items-center py-2 px-4 hover:bg-gray-50 border-b border-gray-100"
          style={{ paddingLeft: `${paddingLeft + 16}px` }}
        >
          <div className="flex items-center flex-1 min-w-0">
            {hasChildren ? (
              <button
                onClick={() => toggleExpanded(account.id)}
                className="mr-2 p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
            ) : (
              <div className="w-6 mr-2" />
            )}

            <Calculator className="w-5 h-5 mr-3 text-gray-400" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{account.accountCode}</span>
                <span className="text-gray-900 truncate">{account.accountName}</span>
                <span className={getStatusBadge(account.status)}>
                  {account.status}
                </span>
                <span className={getTypeBadge(account.accountType)}>
                  {account.accountType}
                </span>
                {account.isControlAccount && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Control
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 truncate">{account.description}</div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <div className="text-sm text-gray-600">
                {formatBalance(account.balanceInfo.currentBalance)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddAccount(account.id)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Add Sub-account"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditAccount(account)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteAccount(account.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              Chart of Accounts Master
            </h1>
            <p className="text-gray-600">Manage financial accounts and hierarchical structure</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => handleAddAccount()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Account
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-4 py-2 ${viewMode === 'tree' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Tree View
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-2">
                <List className="w-4 h-4" />
                List View
              </div>
            </button>
          </div>
        </div>

        {viewMode === 'list' && (
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {accountTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
            </select>
          </div>
        )}
      </div>

      {viewMode === 'tree' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200 px-3 py-2 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Account Hierarchy</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setExpandedNodes(new Set(accounts.map(a => a.id)))}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Expand All
                </button>
                <button
                  onClick={() => setExpandedNodes(new Set())}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Collapse All
                </button>
              </div>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {buildAccountTree(filteredAccounts).map(account => renderTreeNode(account))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Level</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Settings</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{account.accountCode}</div>
                        <div className="text-sm text-gray-900">{account.accountName}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{account.description}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={getTypeBadge(account.accountType)}>
                          {account.accountType}
                        </span>
                        <div className="text-sm text-gray-500">Level {account.level}</div>
                        <div className="text-sm text-gray-500">{account.accountSubType}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="space-y-1">
                        {account.isControlAccount && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Control</span>
                        )}
                        {account.allowPosting && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Posting</span>
                        )}
                        {account.taxConfiguration.taxable && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Taxable</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatBalance(account.balanceInfo.currentBalance)}</div>
                      <div className="text-sm text-gray-500">
                        Dr: {formatBalance(account.balanceInfo.debitBalance)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Cr: {formatBalance(account.balanceInfo.creditBalance)}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={getStatusBadge(account.status)}>
                        {account.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddAccount(account.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Add Sub-account"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditAccount(account)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">Edit</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <Eye className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">View</span>
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                          <span className="text-red-600">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <AccountModal
          account={editingAccount}
          accounts={accounts}
          onSave={handleSaveAccount}
          onClose={() => setShowModal(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
}

interface AccountModalProps {
  account: Account | null;
  accounts: Account[];
  onSave: (account: any) => void;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

function AccountModal({ account, accounts, onSave, onClose, activeTab, setActiveTab }: AccountModalProps) {
  const [formData, setFormData] = useState<Partial<Account>>({
    accountCode: account?.accountCode || '',
    accountName: account?.accountName || '',
    parentId: account?.parentId || '',
    level: account?.level || 1,
    accountType: account?.accountType || 'asset',
    accountSubType: account?.accountSubType || '',
    status: account?.status || 'active',
    description: account?.description || '',
    isControlAccount: account?.isControlAccount || false,
    allowPosting: account?.allowPosting !== undefined ? account.allowPosting : true,
    currency: account?.currency || 'USD',
    taxConfiguration: account?.taxConfiguration || {
      taxable: false,
      defaultTaxCode: '',
      taxCategory: 'Non-taxable'
    },
    reportingSettings: account?.reportingSettings || {
      includeInBalanceSheet: true,
      includeInPL: false,
      includeInCashFlow: false,
      reportingGroup: ''
    },
    balanceInfo: account?.balanceInfo || {
      openingBalance: 0,
      currentBalance: 0,
      debitBalance: 0,
      creditBalance: 0,
      lastActivity: new Date().toISOString().split('T')[0]
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Calculator },
    { id: 'tax', label: 'Tax Settings', icon: DollarSign },
    { id: 'reporting', label: 'Reporting', icon: TrendingUp },
    { id: 'balance', label: 'Balance Info', icon: Building }
  ];

  const availableParents = accounts.filter(acc =>
    acc.id !== account?.id &&
    acc.level < 4 &&
    acc.isControlAccount
  );

  const getAvailableSubTypes = () => {
    return accountSubTypes[formData.accountType as keyof typeof accountSubTypes] || [];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {account?.id ? 'Edit Account' : 'Add New Account'}
          </h2>
        </div>

        <div className="flex border-b border-gray-200">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-96">
          <div className="px-3 py-2">
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Code</label>
                  <input
                    type="text"
                    value={formData.accountCode}
                    onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                  <input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Account</label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value, level: e.target.value ? 2 : 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">None (Root Level)</option>
                    {availableParents.map(parent => (
                      <option key={parent.id} value={parent.id}>
                        {parent.accountCode} - {parent.accountName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                  <select
                    value={formData.accountType}
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any, accountSubType: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {accountTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Sub-Type</label>
                  <select
                    value={formData.accountSubType}
                    onChange={(e) => setFormData({ ...formData, accountSubType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Sub-Type</option>
                    {getAvailableSubTypes().map(subType => (
                      <option key={subType} value={subType}>{subType}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {currencies.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Properties</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isControlAccount}
                        onChange={(e) => setFormData({ ...formData, isControlAccount: e.target.checked })}
                        className="mr-2"
                      />
                      Control Account
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.allowPosting}
                        onChange={(e) => setFormData({ ...formData, allowPosting: e.target.checked })}
                        className="mr-2"
                      />
                      Allow Posting
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tax' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="md:col-span-2">
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={formData.taxConfiguration?.taxable}
                      onChange={(e) => setFormData({ ...formData, taxConfiguration: { ...formData.taxConfiguration, taxable: e.target.checked } })}
                      className="mr-2"
                    />
                    Taxable Account
                  </label>
                </div>
                {formData.taxConfiguration?.taxable && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Default Tax Code</label>
                      <input
                        type="text"
                        value={formData.taxConfiguration?.defaultTaxCode}
                        onChange={(e) => setFormData({ ...formData, taxConfiguration: { ...formData.taxConfiguration, defaultTaxCode: e.target.value } })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tax Category</label>
                      <select
                        value={formData.taxConfiguration?.taxCategory}
                        onChange={(e) => setFormData({ ...formData, taxConfiguration: { ...formData.taxConfiguration, taxCategory: e.target.value } })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {taxCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'reporting' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Group</label>
                  <input
                    type="text"
                    value={formData.reportingSettings?.reportingGroup}
                    onChange={(e) => setFormData({ ...formData, reportingSettings: { ...formData.reportingSettings, reportingGroup: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Include in Reports</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.reportingSettings?.includeInBalanceSheet}
                        onChange={(e) => setFormData({ ...formData, reportingSettings: { ...formData.reportingSettings, includeInBalanceSheet: e.target.checked } })}
                        className="mr-2"
                      />
                      Balance Sheet
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.reportingSettings?.includeInPL}
                        onChange={(e) => setFormData({ ...formData, reportingSettings: { ...formData.reportingSettings, includeInPL: e.target.checked } })}
                        className="mr-2"
                      />
                      Profit & Loss
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.reportingSettings?.includeInCashFlow}
                        onChange={(e) => setFormData({ ...formData, reportingSettings: { ...formData.reportingSettings, includeInCashFlow: e.target.checked } })}
                        className="mr-2"
                      />
                      Cash Flow Statement
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'balance' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balanceInfo?.openingBalance}
                    onChange={(e) => setFormData({ ...formData, balanceInfo: { ...formData.balanceInfo, openingBalance: Number(e.target.value) } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balanceInfo?.currentBalance}
                    onChange={(e) => setFormData({ ...formData, balanceInfo: { ...formData.balanceInfo, currentBalance: Number(e.target.value) } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Debit Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balanceInfo?.debitBalance}
                    onChange={(e) => setFormData({ ...formData, balanceInfo: { ...formData.balanceInfo, debitBalance: Number(e.target.value) } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credit Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balanceInfo?.creditBalance}
                    onChange={(e) => setFormData({ ...formData, balanceInfo: { ...formData.balanceInfo, creditBalance: Number(e.target.value) } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="px-3 py-2 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {account?.id ? 'Update Account' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}