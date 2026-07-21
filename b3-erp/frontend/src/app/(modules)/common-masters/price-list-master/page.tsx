'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, Search, Download, Filter, X, DollarSign, Calendar, Tag, TrendingUp, Copy, CheckCircle, XCircle, AlertCircle, Eye, BarChart3, Users, Package } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriceList } from '@/data/common-masters/price-lists';
import { commonMastersService } from '@/services/common-masters.service';
import { exportToCsv } from '@/lib/export';

const DEFAULT_COMPANY_ID = '1';

export default function PriceListMasterPage() {
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCurrency, setFilterCurrency] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedPriceList, setSelectedPriceList] = useState<PriceList | null>(null);

  // Create/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    priceListCode: '',
    priceListName: '',
    description: '',
    priceListType: 'standard',
    currency: 'INR',
    effectiveFrom: '',
    effectiveTo: '',
    isActive: true,
  });

  const pricingMethodMap: Record<string, PriceList['pricingMethod']> = {
    fixed: 'fixed', markup: 'markup',
    discount_from_mrp: 'discount_from_mrp', discount: 'discount_from_mrp',
  };

  // Fetch price lists from the live backend, mapping the raw API shape into the page's model.
  const fetchPriceLists = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = (await commonMastersService.getAllPriceLists(DEFAULT_COMPANY_ID)) as any[];
      const mapped: PriceList[] = raw.map((p) => {
        const effectiveFrom = p.effectiveFrom ?? '';
        const effectiveTo = p.effectiveTo ?? null;
        return {
          id: String(p.id ?? ''),
          priceListCode: p.priceListCode ?? '',
          priceListName: p.priceListName ?? '',
          description: p.description ?? '',
          pricingMethod: pricingMethodMap[p.pricingMethod] ?? 'fixed',
          basePrice: (p.basePrice ?? 'cost') as PriceList['basePrice'],
          priceListType: p.priceListType ?? 'standard',
          markupPercentage: p.markupPercentage !== null && p.markupPercentage !== undefined ? Number(p.markupPercentage) : undefined,
          discountPercentage: p.discountPercentage !== null && p.discountPercentage !== undefined ? Number(p.discountPercentage) : undefined,
          applicableFor: (p.applicableFor === 'purchase' ? 'purchase' : 'sales') as PriceList['applicableFor'],
          customerCategory: p.customerCategory ?? undefined,
          currency: p.currency ?? 'INR',
          effectiveFrom,
          validFrom: effectiveFrom,
          effectiveTo,
          validTo: effectiveTo,
          autoUpdate: p.autoUpdate ?? false,
          itemsCount: Number(p.itemsCount ?? (Array.isArray(p.items) ? p.items.length : 0)),
          minPrice: Number(p.minPrice ?? 0),
          maxPrice: Number(p.maxPrice ?? 0),
          avgPrice: Number(p.avgPrice ?? 0),
          customersUsing: Number(p.customersUsing ?? 0),
          transactionsCount: Number(p.transactionsCount ?? 0),
          totalAmount: Number(p.totalAmount ?? 0),
          lastUsedDate: p.lastUsedDate ?? '',
          isDefault: p.isDefault ?? false,
          isActive: p.isActive ?? (p.status ? p.status === 'active' : true),
          createdBy: p.createdBy ?? '',
          createdDate: p.createdDate ?? p.createdAt ?? '',
        };
      });
      setPriceLists(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load price lists');
      setPriceLists([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPriceLists();
  }, [fetchPriceLists]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleClonePriceList = (priceList: PriceList) => {
    showToast(`Cloning price list: ${priceList.priceListName}`, 'info');
  };

  const openCreateModal = () => {
    setForm({
      priceListCode: '',
      priceListName: '',
      description: '',
      priceListType: 'standard',
      currency: 'INR',
      effectiveFrom: '',
      effectiveTo: '',
      isActive: true,
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEditPriceList = (priceList: PriceList) => {
    setForm({
      priceListCode: priceList.priceListCode,
      priceListName: priceList.priceListName,
      description: priceList.description || '',
      priceListType: priceList.priceListType || 'standard',
      currency: priceList.currency || 'INR',
      effectiveFrom: (priceList.effectiveFrom || '').slice(0, 10),
      effectiveTo: (priceList.effectiveTo || '').slice(0, 10),
      isActive: priceList.isActive,
    });
    setEditingId(priceList.id);
    setIsModalOpen(true);
  };

  const handleSavePriceList = async () => {
    if (!form.priceListCode.trim() || !form.priceListName.trim()) {
      showToast('Code and Name are required', 'error');
      return;
    }
    if (!form.effectiveFrom) {
      showToast('Effective From date is required', 'error');
      return;
    }
    try {
      setIsSaving(true);
      const payload = {
        priceListCode: form.priceListCode.trim(),
        priceListName: form.priceListName.trim(),
        description: form.description,
        priceListType: form.priceListType,
        currency: form.currency,
        effectiveFrom: form.effectiveFrom,
        effectiveTo: form.effectiveTo || undefined,
        status: form.isActive ? 'active' : 'inactive',
        companyId: DEFAULT_COMPANY_ID,
      };
      if (editingId) {
        await commonMastersService.updatePriceList(editingId, payload);
      } else {
        await commonMastersService.createPriceList(payload);
      }
      setIsModalOpen(false);
      await fetchPriceLists();
      showToast(editingId ? 'Price list updated successfully' : 'Price list created successfully', 'success');
    } catch (error) {
      console.error('Error saving price list:', error);
      showToast('Failed to save price list', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePriceList = async (priceList: PriceList) => {
    if (!confirm(`Delete ${priceList.priceListName}?`)) {
      return;
    }
    try {
      await commonMastersService.deletePriceList(priceList.id);
      await fetchPriceLists();
      showToast(`Deleted ${priceList.priceListName}`, 'success');
    } catch (error) {
      console.error('Error deleting price list:', error);
      showToast('Failed to delete price list', 'error');
    }
  };

  const handleExport = () => {
    exportToCsv('price-list-master', filteredData);
    showToast('Exporting price lists data...', 'success');
  };

  const handleAddPriceList = () => {
    openCreateModal();
  };

  const handleViewDetails = (priceList: PriceList) => {
    setSelectedPriceList(priceList);
    setShowDetailsModal(true);
  };

  const handleViewAnalytics = (priceList: PriceList) => {
    setSelectedPriceList(priceList);
    setShowAnalyticsModal(true);
  };

  const filteredData = useMemo(() => {
    return priceLists.filter(priceList => {
      const matchesSearch =
        priceList.priceListName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        priceList.priceListCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        priceList.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCurrency = filterCurrency === 'all' || priceList.currency === filterCurrency;

      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'active' && priceList.isActive) ||
        (filterStatus === 'inactive' && !priceList.isActive);

      return matchesSearch && matchesCurrency && matchesStatus;
    });
  }, [priceLists, searchTerm, filterCurrency, filterStatus]);

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'AED': 'د.إ'
    };
    return symbols[currency] || currency;
  };

  const getPriceListTypeColor = (type: string) => {
    const colors = {
      'standard': 'bg-blue-100 text-blue-800',
      'promotional': 'bg-green-100 text-green-800',
      'seasonal': 'bg-yellow-100 text-yellow-800',
      'contract': 'bg-purple-100 text-purple-800',
      'wholesale': 'bg-orange-100 text-orange-800',
      'retail': 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const isCurrentlyValid = (validFrom: string | null | undefined, validTo?: string | null) => {
    if (!validFrom) return false;
    const now = new Date();
    const from = new Date(validFrom);
    const to = validTo ? new Date(validTo) : null;

    return now >= from && (!to || now <= to);
  };

  const columns: Column<PriceList>[] = [
    {
      id: 'priceList',
      header: 'Price List',
      accessor: 'priceListName',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 flex items-center gap-2">
            {row.isDefault && <Tag className="w-4 h-4 text-blue-600" />}
            {value}
          </div>
          <div className="text-xs text-gray-500">
            <span className="font-mono font-semibold text-blue-600">{row.priceListCode}</span>
            {row.isDefault && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Default
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'type',
      header: 'Type',
      accessor: 'priceListType',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPriceListTypeColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      id: 'currency',
      header: 'Currency',
      accessor: 'currency',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {getCurrencySymbol(value)} {value}
          </div>
          {row.exchangeRateApplied && (
            <div className="text-xs text-blue-600">Auto-convert</div>
          )}
        </div>
      )
    },
    {
      id: 'validity',
      header: 'Validity Period',
      accessor: 'validFrom',
      sortable: true,
      render: (value, row) => {
        const isCurrent = isCurrentlyValid(value, row.validTo);
        return (
          <div className="text-xs">
            <div className="font-medium text-gray-900 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              From: {new Date(value).toLocaleDateString('en-IN')}
            </div>
            <div className={row.validTo ? 'text-gray-500' : 'text-green-600'}>
              {row.validTo ? `To: ${new Date(row.validTo).toLocaleDateString('en-IN')}` : 'No expiry'}
            </div>
            <div className={`font-medium ${isCurrent ? 'text-green-600' : 'text-red-600'}`}>
              {isCurrent ? '✓ Current' : '✗ Expired'}
            </div>
          </div>
        );
      }
    },
    {
      id: 'pricing',
      header: 'Pricing Details',
      accessor: 'itemsCount',
      sortable: true,
      render: (value, row) => (
        <div className="text-xs">
          <div className="font-medium text-gray-900">{value} items</div>
          {row.markupPercentage && (
            <div className="text-green-600">Markup: +{row.markupPercentage}%</div>
          )}
          {row.discountPercentage && (
            <div className="text-orange-600">Discount: -{row.discountPercentage}%</div>
          )}
          {row.roundingRule && (
            <div className="text-gray-500">Round: {row.roundingRule}</div>
          )}
        </div>
      )
    },
    {
      id: 'categories',
      header: 'Applicable To',
      accessor: 'applicableCustomerCategories',
      sortable: false,
      render: (value, row) => {
        const categories = value || [];
        return (
          <div className="text-xs">
            {categories.length > 0 ? (
              <>
                <div className="font-medium text-gray-900">
                  {categories.length} categor{categories.length > 1 ? 'ies' : 'y'}
                </div>
                <div className="text-gray-500">
                  {categories.slice(0, 2).join(', ')}
                  {categories.length > 2 && ` +${categories.length - 2}`}
                </div>
              </>
            ) : (
              <div className="text-gray-400">All customers</div>
            )}
            {row.territoryRestrictions && row.territoryRestrictions.length > 0 && (
              <div className="text-blue-600">
                {row.territoryRestrictions.length} territor{row.territoryRestrictions.length > 1 ? 'ies' : 'y'}
              </div>
            )}
          </div>
        );
      }
    },
    {
      id: 'usage',
      header: 'Usage Stats',
      accessor: 'transactionsCount',
      sortable: true,
      render: (value, row) => (
        <div className="text-xs">
          <div className="font-medium text-gray-900">{value} transactions</div>
          <div className="text-green-600">Revenue: {getCurrencySymbol(row.currency)}{((row.totalRevenue || 0) / 1000000).toFixed(2)}M</div>
          {row.lastUsedDate && (
            <div className="text-gray-500">
              Last: {new Date(row.lastUsedDate).toLocaleDateString('en-IN')}
            </div>
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
        <StatusBadge
          status={value ? 'active' : 'inactive'}
          text={value ? 'Active' : 'Inactive'}
        />
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
          <button
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(row);
            }}
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleViewAnalytics(row);
            }}
            title="View Analytics"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleClonePriceList(row);
            }}
          >
            Clone
          </button>
          <button
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleEditPriceList(row);
            }}
          >
            Edit
          </button>
          <button
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePriceList(row);
            }}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCurrency('all');
    setFilterStatus('all');
  };

  const activeFilterCount = [
    filterCurrency !== 'all',
    filterStatus !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  const stats = useMemo(() => {
    const total = priceLists.length;
    const active = priceLists.filter(p => p.isActive).length;
    const totalItems = priceLists.reduce((sum, p) => sum + (p.itemsCount || 0), 0);
    const totalTransactions = priceLists.reduce((sum, p) => sum + (p.transactionsCount || 0), 0);
    const totalRevenue = priceLists.reduce((sum, p) => sum + (p.totalRevenue || p.totalAmount || 0), 0);
    const markupLists = priceLists.filter(p => p.markupPercentage);
    const avgMarkup = markupLists.length > 0
      ? Math.round(markupLists.reduce((sum, p) => sum + (p.markupPercentage || 0), 0) / markupLists.length)
      : 0;
    return { total, active, totalItems, totalTransactions, totalRevenue, avgMarkup };
  }, [priceLists]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-lime-50 to-green-50">
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2 space-y-3">
          {/* Toast Notification */}
          {toast && (
            <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5" />}
              {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
              <span className="font-medium">{toast.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-7 h-7 text-blue-600" />
                Price List Master
              </h1>
              <p className="text-gray-600 mt-1">Manage pricing strategies, customer segments, and promotional campaigns</p>
            </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={handleAddPriceList}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Price List</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <button
          onClick={() => clearFilters()}
          className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-gray-400 hover:shadow-lg transition-all text-left"
        >
          <div className="text-sm text-gray-600 mb-1">Total Price Lists</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">Click to view all</div>
        </button>
        <button
          onClick={() => setFilterStatus('active')}
          className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-green-500 hover:shadow-lg transition-all text-left"
        >
          <div className="text-sm text-gray-600 mb-1">Active Lists</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-xs text-green-600 mt-1">Click to filter</div>
        </button>
        <button
          onClick={() => showToast('Viewing all items across price lists', 'info')}
          className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-blue-500 hover:shadow-lg transition-all text-left"
        >
          <div className="text-sm text-gray-600 mb-1">Total Items</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
          <div className="text-xs text-blue-600 mt-1">Click for details</div>
        </button>
        <button
          onClick={() => showToast('Viewing transaction analytics', 'info')}
          className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-purple-500 hover:shadow-lg transition-all text-left"
        >
          <div className="text-sm text-gray-600 mb-1">Transactions</div>
          <div className="text-2xl font-bold text-purple-600">{stats.totalTransactions}</div>
          <div className="text-xs text-purple-600 mt-1">Click for breakdown</div>
        </button>
        <button
          onClick={() => showToast('Viewing revenue analytics', 'info')}
          className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-green-500 hover:shadow-lg transition-all text-left"
        >
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Total Revenue
          </div>
          <div className="text-2xl font-bold text-green-600">₹{(stats.totalRevenue / 10000000).toFixed(1)}Cr</div>
          <div className="text-xs text-green-600 mt-1">Click for trends</div>
        </button>
        <button
          onClick={() => showToast('Viewing markup analytics', 'info')}
          className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-orange-500 hover:shadow-lg transition-all text-left"
        >
          <div className="text-sm text-gray-600 mb-1">Avg Markup</div>
          <div className="text-2xl font-bold text-orange-600">{stats.avgMarkup}%</div>
          <div className="text-xs text-orange-600 mt-1">Click for details</div>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search price lists by name, code, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={filterCurrency}
                onChange={(e) => setFilterCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Currencies</option>
                <option value="INR">INR - Indian Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="AED">AED - UAE Dirham</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading price lists…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && priceLists.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No price lists found.
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <DataTable
          data={filteredData}
          columns={columns}
          pagination={{
            enabled: true,
            pageSize: 10
          }}
          sorting={{
            enabled: true,
            defaultSort: { column: 'priceList', direction: 'asc' }
          }}
          emptyMessage="No price lists found"
          emptyDescription="Try adjusting your search or filters to find what you're looking for."
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Price List Management Guidelines
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>✓ <strong>Multiple Pricing Strategies:</strong> Standard, promotional, seasonal, contract, wholesale, and retail price lists</li>
          <li>✓ <strong>Customer Segmentation:</strong> Assign price lists to specific customer categories and territories</li>
          <li>✓ <strong>Multi-Currency Support:</strong> Manage prices in multiple currencies with automatic exchange rate conversion</li>
          <li>✓ <strong>Time-Based Validity:</strong> Configure validity periods for seasonal and promotional pricing</li>
          <li>✓ <strong>Markup & Discount:</strong> Apply base markup and discount percentages at price list level</li>
          <li>✓ <strong>Revenue Analytics:</strong> Track transactions and revenue generated from each price list</li>
        </ul>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedPriceList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className={`px-3 py-2 border-b sticky top-0 z-10 ${
              selectedPriceList.isActive
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className={`w-6 h-6 ${selectedPriceList.isActive ? 'text-green-600' : 'text-gray-500'}`} />
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedPriceList.priceListName}
                    </h2>
                    {selectedPriceList.isDefault && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Tag className="w-3 h-3 mr-1" />
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-mono font-semibold text-blue-600">{selectedPriceList.priceListCode}</span>
                    {selectedPriceList.priceListType && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPriceListTypeColor(selectedPriceList.priceListType)}`}>
                        {selectedPriceList.priceListType}
                      </span>
                    )}
                    <StatusBadge
                      status={selectedPriceList.isActive ? 'active' : 'inactive'}
                      text={selectedPriceList.isActive ? 'Active' : 'Inactive'}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Basic Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-sm text-blue-600 font-medium mb-1">Description</div>
                    <div className="text-gray-900">{selectedPriceList.description}</div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-600 font-medium mb-1">Currency</div>
                    <div className="text-gray-900 font-semibold">
                      {getCurrencySymbol(selectedPriceList.currency)} {selectedPriceList.currency}
                      {selectedPriceList.exchangeRateApplied && (
                        <span className="ml-2 text-xs text-blue-600">(Auto-convert)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Validity Period */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Validity Period
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-sm text-purple-600 font-medium mb-1">Valid From</div>
                    <div className="text-gray-900 font-semibold">
                      {selectedPriceList.validFrom ? new Date(selectedPriceList.validFrom).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-purple-600 font-medium mb-1">Valid To</div>
                    <div className="text-gray-900 font-semibold">
                      {selectedPriceList.validTo
                        ? new Date(selectedPriceList.validTo).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        : <span className="text-green-600">No Expiry</span>
                      }
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                      isCurrentlyValid(selectedPriceList.validFrom, selectedPriceList.validTo)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isCurrentlyValid(selectedPriceList.validFrom, selectedPriceList.validTo)
                        ? '✓ Currently Valid'
                        : '✗ Expired or Not Yet Active'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Configuration */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Pricing Configuration
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-sm text-green-600 font-medium mb-1">Total Items</div>
                    <div className="text-2xl font-bold text-gray-900">{selectedPriceList.itemsCount}</div>
                  </div>
                  {selectedPriceList.markupPercentage && (
                    <div>
                      <div className="text-sm text-green-600 font-medium mb-1">Base Markup</div>
                      <div className="text-2xl font-bold text-green-600">+{selectedPriceList.markupPercentage}%</div>
                    </div>
                  )}
                  {selectedPriceList.discountPercentage && (
                    <div>
                      <div className="text-sm text-green-600 font-medium mb-1">Base Discount</div>
                      <div className="text-2xl font-bold text-orange-600">-{selectedPriceList.discountPercentage}%</div>
                    </div>
                  )}
                  {selectedPriceList.roundingRule && (
                    <div>
                      <div className="text-sm text-green-600 font-medium mb-1">Rounding Rule</div>
                      <div className="text-lg font-semibold text-gray-900 capitalize">{selectedPriceList.roundingRule}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Applicable To */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-5 border border-orange-200">
                <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Applicable To
                </h3>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-orange-600 font-medium mb-2">Customer Categories</div>
                    {selectedPriceList.applicableCustomerCategories && selectedPriceList.applicableCustomerCategories.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedPriceList.applicableCustomerCategories.map((category, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {category}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-600 italic">All customer categories</div>
                    )}
                  </div>
                  {selectedPriceList.territoryRestrictions && selectedPriceList.territoryRestrictions.length > 0 && (
                    <div>
                      <div className="text-sm text-orange-600 font-medium mb-2">Territory Restrictions</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedPriceList.territoryRestrictions.map((territory, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {territory}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-5 border border-teal-200">
                <h3 className="font-semibold text-teal-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Usage Statistics
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-sm text-teal-600 font-medium mb-1">Total Transactions</div>
                    <div className="text-2xl font-bold text-gray-900">{selectedPriceList.transactionsCount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-teal-600 font-medium mb-1">Total Revenue</div>
                    <div className="text-2xl font-bold text-green-600">
                      {getCurrencySymbol(selectedPriceList.currency)}{((selectedPriceList.totalRevenue || 0) / 1000000).toFixed(2)}M
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-teal-600 font-medium mb-1">Last Used</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPriceList.lastUsedDate
                        ? new Date(selectedPriceList.lastUsedDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        : 'Never used'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction History Preview */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Recent Activity
                </h3>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span>Created on:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedPriceList.validFrom ? new Date(selectedPriceList.validFrom).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </div>
                  {selectedPriceList.lastUsedDate && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span>Last transaction:</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(selectedPriceList.lastUsedDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2">
                    <span>Status:</span>
                    <span className={`font-semibold ${selectedPriceList.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedPriceList.isActive ? 'Active & In Use' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-3 py-2 bg-gray-50 border-t flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  handleEditPriceList(selectedPriceList);
                  setShowDetailsModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Price List
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedPriceList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-3 py-2 border-b border-blue-200 sticky top-0 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">Analytics Dashboard</h2>
                  </div>
                  <div className="text-sm text-gray-600">
                    Performance metrics for <span className="font-semibold text-blue-600">{selectedPriceList.priceListName}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border-2 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-green-700">Total Revenue</div>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {getCurrencySymbol(selectedPriceList.currency)}{((selectedPriceList.totalRevenue || 0) / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    From {selectedPriceList.transactionsCount} transactions
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-blue-700">Avg Transaction</div>
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {getCurrencySymbol(selectedPriceList.currency)}
                    {selectedPriceList.transactionsCount > 0
                      ? ((selectedPriceList.totalRevenue || 0) / selectedPriceList.transactionsCount / 1000).toFixed(1)
                      : 0
                    }K
                  </div>
                  <div className="text-xs text-blue-600 mt-1">Per transaction</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-purple-700">Active Items</div>
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-900">{selectedPriceList.itemsCount}</div>
                  <div className="text-xs text-purple-600 mt-1">SKUs in price list</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 border-2 border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-orange-700">Markup Rate</div>
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-900">
                    {selectedPriceList.markupPercentage ? `+${selectedPriceList.markupPercentage}` : '0'}%
                  </div>
                  <div className="text-xs text-orange-600 mt-1">Base markup</div>
                </div>
              </div>

              {/* Revenue Trend Visualization */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Revenue Trend Analysis
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-blue-700 font-medium">Q1 Revenue</span>
                      <span className="font-semibold text-blue-900">
                        {getCurrencySymbol(selectedPriceList.currency)}{((selectedPriceList.totalRevenue || 0) * 0.28 / 1000000).toFixed(2)}M
                      </span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-blue-700 font-medium">Q2 Revenue</span>
                      <span className="font-semibold text-blue-900">
                        {getCurrencySymbol(selectedPriceList.currency)}{((selectedPriceList.totalRevenue || 0) * 0.25 / 1000000).toFixed(2)}M
                      </span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-blue-700 font-medium">Q3 Revenue</span>
                      <span className="font-semibold text-blue-900">
                        {getCurrencySymbol(selectedPriceList.currency)}{((selectedPriceList.totalRevenue || 0) * 0.22 / 1000000).toFixed(2)}M
                      </span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '22%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-blue-700 font-medium">Q4 Revenue</span>
                      <span className="font-semibold text-blue-900">
                        {getCurrencySymbol(selectedPriceList.currency)}{((selectedPriceList.totalRevenue || 0) * 0.25 / 1000000).toFixed(2)}M
                      </span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Category Breakdown */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Customer Category Performance
                </h3>
                {selectedPriceList.applicableCustomerCategories && selectedPriceList.applicableCustomerCategories.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPriceList.applicableCustomerCategories.map((category, index) => {
                      const percentage = Math.max(20, Math.random() * 40 + index * 15);
                      const revenue = (selectedPriceList.totalRevenue || 0) * (percentage / 100);
                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-purple-700 font-medium">{category}</span>
                            <span className="font-semibold text-purple-900">
                              {getCurrencySymbol(selectedPriceList.currency)}{(revenue / 1000000).toFixed(2)}M ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full bg-purple-100 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-purple-700 bg-purple-100 rounded-lg p-3">
                    This price list is applicable to all customer categories. Enable category-specific tracking for detailed analytics.
                  </div>
                )}
              </div>

              {/* Transaction Analysis */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Transaction Analysis
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-sm text-green-700 font-medium mb-2">Transaction Volume</div>
                    <div className="text-3xl font-bold text-green-900 mb-1">{selectedPriceList.transactionsCount}</div>
                    <div className="text-xs text-green-600">Total orders processed</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-sm text-green-700 font-medium mb-2">Success Rate</div>
                    <div className="text-3xl font-bold text-green-900 mb-1">98.5%</div>
                    <div className="text-xs text-green-600">Order fulfillment rate</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-sm text-green-700 font-medium mb-2">Items per Transaction</div>
                    <div className="text-3xl font-bold text-green-900 mb-1">
                      {selectedPriceList.transactionsCount > 0
                        ? (selectedPriceList.itemsCount / selectedPriceList.transactionsCount * 10).toFixed(1)
                        : 0
                      }
                    </div>
                    <div className="text-xs text-green-600">Average line items</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-sm text-green-700 font-medium mb-2">Profit Margin</div>
                    <div className="text-3xl font-bold text-green-900 mb-1">
                      {selectedPriceList.markupPercentage ? (selectedPriceList.markupPercentage * 0.7).toFixed(1) : '0'}%
                    </div>
                    <div className="text-xs text-green-600">Estimated margin</div>
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Analytics
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => showToast(`Exporting detailed analytics for ${selectedPriceList.priceListName}`, 'success')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Export to Excel
                  </button>
                  <button
                    onClick={() => showToast(`Generating PDF report for ${selectedPriceList.priceListName}`, 'success')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Generate PDF Report
                  </button>
                  <button
                    onClick={() => showToast(`Sending analytics via email`, 'info')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    Email Report
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-3 py-2 bg-gray-50 border-t flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowAnalyticsModal(false);
                  setShowDetailsModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Price List Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Price List' : 'Add Price List'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code
                </label>
                <input
                  type="text"
                  value={form.priceListCode}
                  onChange={(e) => setForm({ ...form, priceListCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={form.priceListName}
                  onChange={(e) => setForm({ ...form, priceListName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={form.priceListType}
                  onChange={(e) => setForm({ ...form, priceListType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="standard">Standard</option>
                  <option value="promotional">Promotional</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="contract">Contract</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="retail">Retail</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="AED">AED - UAE Dirham</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective From
                </label>
                <input
                  type="date"
                  value={form.effectiveFrom}
                  onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective To
                </label>
                <input
                  type="date"
                  value={form.effectiveTo}
                  onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  Active
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePriceList}
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
      </div>
    </div>
  );
}
