'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Download, Filter, X, DollarSign, Star, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Currency } from '@/data/common-masters/currencies';
import { commonMastersService } from '@/services/common-masters.service';
import { exportToCsv } from '@/lib/export';

export default function CurrencyMasterPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDecimalDigits, setFilterDecimalDigits] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Fetch currencies from the live backend, mapping the raw API shape to the page's Currency model.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await commonMastersService.getAllCurrencies()) as any[];
        const mapped: Currency[] = raw.map((c) => ({
          id: String(c.id ?? ''),
          code: c.code ?? '',
          name: c.name ?? '',
          symbol: c.symbol ?? '',
          symbolNative: c.symbolNative ?? c.symbol ?? '',
          decimalDigits: Number(c.decimalDigits ?? 2),
          rounding: Number(c.rounding ?? 0),
          namePlural: c.namePlural ?? c.name ?? '',
          isActive: c.isActive ?? true,
          isBaseCurrency: c.isBaseCurrency ?? false,
          countries: Array.isArray(c.countries) ? c.countries : [],
          createdAt: c.createdAt ?? '',
          updatedAt: c.updatedAt ?? '',
        }));
        if (!cancelled) setCurrencies(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load currencies');
          setCurrencies([]);
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

  // Toast notification effect
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  // Action handlers
  const handleAddCurrency = () => {
    showToast('Add currency functionality will be implemented', 'info');
    // TODO: Open add currency modal/form
  };

  const handleEditCurrency = (currency: Currency) => {
    showToast(`Editing currency: ${currency.name}`, 'info');
    // TODO: Open edit currency modal/form
  };

  const handleDeleteCurrency = (currency: Currency) => {
    if (currency.isBaseCurrency) {
      showToast('Cannot delete base currency', 'error');
      return;
    }
    if (confirm(`Are you sure you want to delete ${currency.name}?`)) {
      setCurrencies(prev => prev.filter(c => c.id !== currency.id));
      showToast(`${currency.name} deleted successfully`, 'success');
    }
  };

  const handleExport = () => {
    exportToCsv('currency-master', filteredData);
    showToast('Exporting currencies data...', 'success');
  };

  // Get unique decimal digits
  const decimalDigitsOptions = useMemo(() => {
    const unique = Array.from(new Set(currencies.map(c => c.decimalDigits))).sort((a, b) => a - b);
    return unique;
  }, [currencies]);

  // Filtered data
  const filteredData = useMemo(() => {
    return currencies.filter(currency => {
      const matchesSearch =
        currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.symbol.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'active' && currency.isActive) ||
        (filterStatus === 'inactive' && !currency.isActive);

      const matchesDecimalDigits = filterDecimalDigits === 'all' ||
        currency.decimalDigits === parseInt(filterDecimalDigits);

      return matchesSearch && matchesStatus && matchesDecimalDigits;
    });
  }, [currencies, searchTerm, filterStatus, filterDecimalDigits]);

  // Table columns
  const columns: Column<Currency>[] = [
    {
      id: 'code',
      header: 'Code',
      accessor: 'code',
      sortable: true,
      width: 'w-24',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-blue-600">{value}</span>
          {row.isBaseCurrency && (
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          )}
        </div>
      )
    },
    {
      id: 'symbol',
      header: 'Symbol',
      accessor: 'symbol',
      sortable: false,
      width: 'w-20',
      align: 'center',
      render: (value, row) => (
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl">{row.symbolNative}</span>
          <span className="text-xs text-gray-500 font-mono">{value}</span>
        </div>
      )
    },
    {
      id: 'name',
      header: 'Currency Name',
      accessor: 'name',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-gray-500">{row.namePlural}</div>
        </div>
      )
    },
    {
      id: 'countries',
      header: 'Countries',
      accessor: 'countries',
      sortable: false,
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((country, idx) => (
            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
              {country}
            </span>
          ))}
          {value.length > 2 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
              +{value.length - 2}
            </span>
          )}
        </div>
      )
    },
    {
      id: 'decimalDigits',
      header: 'Decimals',
      accessor: 'decimalDigits',
      sortable: true,
      align: 'center',
      render: (value) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold">
          {value}
        </span>
      )
    },
    {
      id: 'rounding',
      header: 'Rounding',
      accessor: 'rounding',
      sortable: true,
      align: 'center',
      render: (value) => (
        <span className="text-gray-700 font-mono text-sm">
          {value === 0 ? 'None' : value}
        </span>
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
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleEditCurrency(row);
            }}
          >
            Edit
          </button>
          {!row.isBaseCurrency && (
            <button
              className="text-red-600 hover:text-red-800 text-sm font-medium"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCurrency(row);
              }}
            >
              Delete
            </button>
          )}
        </div>
      )
    }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterDecimalDigits('all');
  };

  const activeFilterCount = [
    filterStatus !== 'all',
    filterDecimalDigits !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  const baseCurrency = currencies.find(c => c.isBaseCurrency);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-green-50 to-blue-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="px-3 py-2 space-y-3">
          {/* Toast Notification */}
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

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Currency Master</h1>
              <p className="text-gray-600 mt-1">Manage currency master data and exchange rates</p>
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
                onClick={handleAddCurrency}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Currency</span>
              </button>
            </div>
          </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Total Currencies</div>
          <div className="text-2xl font-bold text-gray-900">{currencies.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {currencies.filter(c => c.isActive).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Base Currency</div>
          <div className="text-xl font-bold text-yellow-600 flex items-center gap-2">
            <Star className="w-5 h-5 fill-yellow-500" />
            {baseCurrency?.code || '-'}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">With Decimals</div>
          <div className="text-2xl font-bold text-blue-600">
            {currencies.filter(c => c.decimalDigits > 0).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Without Decimals</div>
          <div className="text-2xl font-bold text-purple-600">
            {currencies.filter(c => c.decimalDigits === 0).length}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by currency name, code, or symbol..."
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

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-2">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decimal Digits
              </label>
              <select
                value={filterDecimalDigits}
                onChange={(e) => setFilterDecimalDigits(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                {decimalDigitsOptions.map(digits => (
                  <option key={digits} value={digits.toString()}>
                    {digits === 0 ? 'No Decimals' : `${digits} Decimal${digits > 1 ? 's' : ''}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading currencies…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && currencies.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No currencies found.
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <DataTable
          data={filteredData}
          columns={columns}
          pagination={{
            enabled: true,
            pageSize: 15
          }}
          sorting={{
            enabled: true,
            defaultSort: { column: 'name', direction: 'asc' }
          }}
          emptyMessage="No currencies found"
          emptyDescription="Try adjusting your search or filters to find what you're looking for."
        />
      </div>
        </div>
      </div>
    </div>
  );
}
