'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Download, Filter, X, DollarSign, TrendingUp, RefreshCw, Clock, AlertTriangle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { commonMastersService } from '@/services/common-masters.service';
import { ExchangeRate, getExchangeRateStats } from '@/data/common-masters/exchange-rates';
import { exportToCsv } from '@/lib/export';

export default function ExchangeRateMasterPage() {
  const [exchangeRates, setExchangeRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExchangeRates();
  }, []);

  const loadExchangeRates = async () => {
    try {
      setLoading(true);
      const data = await commonMastersService.getAllExchangeRates();
      setExchangeRates(data);
    } catch (error) {
      console.error('Failed to load exchange rates:', error);
    } finally {
      setLoading(false);
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterCurrency, setFilterCurrency] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null);
  const [rateValue, setRateValue] = useState('');
  const [savingRate, setSavingRate] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleViewRate = (rate: ExchangeRate) => {
    showToast(`Viewing rate: ${rate.fromCurrencyCode} to ${rate.toCurrencyCode}`, 'info');
  };

  const openEditRate = (rate: ExchangeRate) => {
    setEditingRate(rate);
    setRateValue(String(rate.exchangeRate ?? ''));
  };

  const handleSaveRate = async () => {
    if (!editingRate) return;
    const parsed = Number(rateValue);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      showToast('Please enter a valid exchange rate.', 'error');
      return;
    }
    const isNew = !editingRate.id;
    if (isNew && (!editingRate.fromCurrencyCode || !editingRate.toCurrencyCode)) {
      showToast('From and To currency codes are required.', 'error');
      return;
    }
    try {
      setSavingRate(true);
      if (isNew) {
        await commonMastersService.createExchangeRate({
          fromCurrencyId: editingRate.fromCurrencyCode,
          toCurrencyId: editingRate.toCurrencyCode,
          rate: parsed,
          effectiveDate: new Date().toISOString(),
          companyId: 'default-company-id',
        });
      } else {
        await commonMastersService.updateExchangeRate(editingRate.id, {
          rate: parsed,
          effectiveDate: new Date().toISOString(),
        });
      }
      setEditingRate(null);
      await loadExchangeRates();
      showToast(isNew ? 'Exchange rate created.' : 'Exchange rate updated.', 'success');
    } catch (error) {
      console.error('Failed to save exchange rate:', error);
      showToast('Failed to save exchange rate.', 'error');
    } finally {
      setSavingRate(false);
    }
  };

  const handleRefreshRate = async (rate: ExchangeRate) => {
    try {
      await loadExchangeRates();
      showToast(`Refreshed rate for ${rate.fromCurrencyCode}/${rate.toCurrencyCode}.`, 'success');
    } catch (error) {
      console.error('Failed to refresh exchange rate:', error);
      showToast('Failed to refresh exchange rate.', 'error');
    }
  };

  const handleRefreshAll = async () => {
    try {
      await loadExchangeRates();
      showToast('Exchange rates refreshed.', 'success');
    } catch (error) {
      console.error('Failed to refresh exchange rates:', error);
      showToast('Failed to refresh exchange rates.', 'error');
    }
  };

  const handleExport = () => {
    exportToCsv('exchange-rate-master', filteredData);
    showToast('Exporting exchange rates...', 'success');
  };

  const handleAddRate = () => {
    setEditingRate({
      id: '',
      fromCurrency: '',
      fromCurrencyCode: '',
      fromCurrencySymbol: '',
      toCurrency: '',
      toCurrencyCode: '',
      toCurrencySymbol: '',
      exchangeRate: 0,
      inverseRate: 0,
      effectiveFrom: new Date().toISOString(),
      effectiveTo: null,
      source: 'manual',
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: '',
      autoUpdate: false,
      transactionsCount: 0,
      totalAmountConverted: 0,
      lastUsedDate: new Date().toISOString(),
      isActive: true,
      isPrimary: false,
      createdBy: '',
      createdDate: new Date().toISOString(),
      modifiedBy: '',
      modifiedDate: new Date().toISOString(),
    } as ExchangeRate);
    setRateValue('');
  };

  // Filtered data
  const filteredData = useMemo(() => {
    return exchangeRates.filter(rate => {
      const matchesSearch =
        rate.fromCurrency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.fromCurrencyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.toCurrency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.toCurrencyCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSource = filterSource === 'all' || rate.source === filterSource;
      const matchesCurrency = filterCurrency === 'all' ||
        rate.fromCurrencyCode === filterCurrency ||
        rate.toCurrencyCode === filterCurrency;

      return matchesSearch && matchesSource && matchesCurrency;
    });
  }, [exchangeRates, searchTerm, filterSource, filterCurrency]);

  const getSourceColor = (source: string) => {
    const colors = {
      'manual': 'bg-gray-100 text-gray-800',
      'rbi': 'bg-blue-100 text-blue-800',
      'forex_api': 'bg-green-100 text-green-800',
      'bank': 'bg-purple-100 text-purple-800',
      'system': 'bg-orange-100 text-orange-800'
    };
    return colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getUpdateFrequencyColor = (frequency: string) => {
    const colors = {
      'realtime': 'bg-green-100 text-green-800',
      'hourly': 'bg-blue-100 text-blue-800',
      'daily': 'bg-yellow-100 text-yellow-800',
      'weekly': 'bg-orange-100 text-orange-800',
      'monthly': 'bg-gray-100 text-gray-800'
    };
    return colors[frequency as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRateVariance = (rate: ExchangeRate) => {
    if (!rate.buyRate || !rate.sellRate) return null;
    return ((rate.sellRate - rate.buyRate) / rate.midRate! * 100).toFixed(2);
  };

  const getTimeSinceUpdate = (lastUpdated: string) => {
    const now = new Date().getTime();
    const updated = new Date(lastUpdated).getTime();
    const diffMinutes = Math.floor((now - updated) / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const isStaleRate = (lastUpdated: string, updateFrequency?: string) => {
    if (!updateFrequency) return false;

    const now = new Date().getTime();
    const updated = new Date(lastUpdated).getTime();
    const diffHours = (now - updated) / (1000 * 60 * 60);

    const thresholds = {
      'realtime': 0.25,
      'hourly': 2,
      'daily': 26,
      'weekly': 168,
      'monthly': 720
    };

    return diffHours > thresholds[updateFrequency as keyof typeof thresholds];
  };

  // Table columns
  const columns: Column<ExchangeRate>[] = [
    {
      id: 'pair',
      header: 'Currency Pair',
      accessor: 'fromCurrency',
      sortable: true,
      render: (_, row) => (
        <div>
          <div className="font-medium text-gray-900 flex items-center gap-2">
            <span className="font-mono font-semibold text-blue-600">{row.fromCurrencyCode}</span>
            <span className="text-gray-400">→</span>
            <span className="font-mono font-semibold text-green-600">{row.toCurrencyCode}</span>
          </div>
          <div className="text-xs text-gray-500">
            {row.fromCurrency} to {row.toCurrency}
          </div>
          {row.isPrimary && <div className="text-xs text-blue-600 font-medium">Primary Rate</div>}
        </div>
      )
    },
    {
      id: 'rate',
      header: 'Exchange Rate',
      accessor: 'exchangeRate',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-semibold text-gray-900 font-mono">
            {row.fromCurrencySymbol}1 = {row.toCurrencySymbol}{value.toFixed(4)}
          </div>
          <div className="text-xs text-gray-500">
            Inverse: {row.toCurrencySymbol}1 = {row.fromCurrencySymbol}{row.inverseRate.toFixed(6)}
          </div>
        </div>
      )
    },
    {
      id: 'spread',
      header: 'Buy/Sell/Mid',
      accessor: 'buyRate',
      sortable: false,
      render: (_, row) => {
        if (!row.buyRate || !row.sellRate || !row.midRate) {
          return <div className="text-xs text-gray-400">N/A</div>;
        }
        const variance = getRateVariance(row);
        return (
          <div className="text-xs">
            <div className="text-green-600">Buy: {row.toCurrencySymbol}{row.buyRate.toFixed(4)}</div>
            <div className="text-red-600">Sell: {row.toCurrencySymbol}{row.sellRate.toFixed(4)}</div>
            <div className="text-blue-600">Mid: {row.toCurrencySymbol}{row.midRate.toFixed(4)}</div>
            {row.spreadPercentage && (
              <div className="text-gray-500">Spread: {row.spreadPercentage.toFixed(2)}%</div>
            )}
          </div>
        );
      }
    },
    {
      id: 'source',
      header: 'Source',
      accessor: 'source',
      sortable: true,
      render: (value, row) => (
        <div className="space-y-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${getSourceColor(value)}`}>
            {value.replace('_', ' ')}
          </span>
          {row.autoUpdate && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <RefreshCw className="w-3 h-3" />
              Auto
            </div>
          )}
        </div>
      )
    },
    {
      id: 'update',
      header: 'Last Update',
      accessor: 'lastUpdated',
      sortable: true,
      render: (value, row) => {
        const isStale = isStaleRate(value, row.updateFrequency);
        return (
          <div className="text-xs">
            <div className={`flex items-center gap-1 ${isStale ? 'text-red-600' : 'text-gray-900'}`}>
              <Clock className="w-3 h-3" />
              {getTimeSinceUpdate(value)}
              {isStale && <AlertTriangle className="w-3 h-3" />}
            </div>
            <div className="text-gray-500">{new Date(value).toLocaleDateString()}</div>
            {row.updateFrequency && (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium capitalize mt-1 ${getUpdateFrequencyColor(row.updateFrequency)}`}>
                {row.updateFrequency}
              </span>
            )}
          </div>
        );
      }
    },
    {
      id: 'effective',
      header: 'Effective Period',
      accessor: 'effectiveFrom',
      sortable: true,
      render: (value, row) => (
        <div className="text-xs">
          <div className="text-gray-900">From: {new Date(value).toLocaleDateString()}</div>
          <div className={row.effectiveTo ? 'text-red-600' : 'text-green-600'}>
            {row.effectiveTo ? `To: ${new Date(row.effectiveTo).toLocaleDateString()}` : 'Current'}
          </div>
        </div>
      )
    },
    {
      id: 'usage',
      header: 'Usage',
      accessor: 'transactionsCount',
      sortable: true,
      render: (value, row) => (
        <div className="text-xs">
          <div className="font-medium text-gray-900">{value} transactions</div>
          <div className="text-gray-500">₹{(row.totalAmountConverted / 1000000).toFixed(2)}M</div>
          <div className="text-gray-400">Last: {new Date(row.lastUsedDate).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      id: 'validation',
      header: 'Limits',
      accessor: 'minRate',
      sortable: false,
      render: (_, row) => {
        if (!row.minRate || !row.maxRate) {
          return <div className="text-xs text-gray-400">Not set</div>;
        }
        const withinLimits = row.exchangeRate >= row.minRate && row.exchangeRate <= row.maxRate;
        return (
          <div className="text-xs">
            <div className={withinLimits ? 'text-green-600' : 'text-red-600'}>
              {withinLimits ? '✓ Within' : '✗ Outside'}
            </div>
            <div className="text-gray-500">
              Min: {row.toCurrencySymbol}{row.minRate.toFixed(2)}
            </div>
            <div className="text-gray-500">
              Max: {row.toCurrencySymbol}{row.maxRate.toFixed(2)}
            </div>
            {row.tolerancePercentage && (
              <div className="text-blue-600">±{row.tolerancePercentage}%</div>
            )}
          </div>
        );
      }
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
              handleViewRate(row);
            }}
          >
            View
          </button>
          <button
            className="text-green-600 hover:text-green-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              openEditRate(row);
            }}
          >
            Edit
          </button>
          {row.autoUpdate && (
            <button
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              onClick={(e) => {
                e.stopPropagation();
                handleRefreshRate(row);
              }}
            >
              Refresh
            </button>
          )}
        </div>
      )
    }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setFilterSource('all');
    setFilterCurrency('all');
  };

  const activeFilterCount = [
    filterSource !== 'all',
    filterCurrency !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  // Statistics
  const stats = useMemo(() => getExchangeRateStats(), [exchangeRates]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white px-4 py-3 rounded-lg shadow-lg border-l-4 animate-slide-in"
          style={{
            borderLeftColor: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#3b82f6',
            minWidth: '300px'
          }}>
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
          {toast.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-500" />}
          <span className="text-sm text-gray-700">{toast.message}</span>
        </div>
      )}

      {/* Add / Edit Rate Modal */}
      {editingRate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingRate.id ? 'Edit Exchange Rate' : 'Add Exchange Rate'}
              </h2>
            </div>
            <div className="px-4 py-3 space-y-3">
              {editingRate.id ? (
                <div className="text-sm text-gray-600">
                  <span className="font-mono font-semibold text-blue-600">{editingRate.fromCurrencyCode}</span>
                  {' → '}
                  <span className="font-mono font-semibold text-green-600">{editingRate.toCurrencyCode}</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Currency Code</label>
                    <input
                      type="text"
                      value={editingRate.fromCurrencyCode}
                      onChange={(e) => setEditingRate({ ...editingRate, fromCurrencyCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent uppercase"
                      placeholder="USD"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Currency Code</label>
                    <input
                      type="text"
                      value={editingRate.toCurrencyCode}
                      onChange={(e) => setEditingRate({ ...editingRate, toCurrencyCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent uppercase"
                      placeholder="INR"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exchange Rate</label>
                <input
                  type="number"
                  step="0.0001"
                  value={rateValue}
                  onChange={(e) => setRateValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="0.0000"
                />
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setEditingRate(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={savingRate}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRate}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                disabled={savingRate}
              >
                {savingRate ? 'Saving...' : editingRate.id ? 'Update Rate' : 'Create Rate'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-none p-3 pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-7 h-7 text-emerald-600" />
              Exchange Rate Master
            </h1>
            <p className="text-gray-600 mt-1">Manage currency exchange rates and conversions</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefreshAll}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh All</span>
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleAddRate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Rate</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Total Rates</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Active Rates</div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Currency Pairs</div>
            <div className="text-2xl font-bold text-blue-600">{stats.currencyPairs}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Auto Update
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.autoUpdate}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Total Transactions</div>
            <div className="text-2xl font-bold text-orange-600">{stats.totalTransactions}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Amount Converted
            </div>
            <div className="text-2xl font-bold text-emerald-600">₹{(stats.totalAmountConverted / 1000000).toFixed(1)}M</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6">
        <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex-none p-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by currency name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${showFilters ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-emerald-600 rounded-full">
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
                    Source
                  </label>
                  <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="all">All Sources</option>
                    <option value="rbi">RBI</option>
                    <option value="forex_api">Forex API</option>
                    <option value="bank">Bank</option>
                    <option value="manual">Manual</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={filterCurrency}
                    onChange={(e) => setFilterCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="all">All Currencies</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="SGD">SGD - Singapore Dollar</option>
                    <option value="AED">AED - UAE Dirham</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="CNY">CNY - Chinese Yuan</option>
                    <option value="INR">INR - Indian Rupee</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto">
            <DataTable
              data={filteredData}
              columns={columns}
              pagination={{
                enabled: true,
                pageSize: 10
              }}
              sorting={{
                enabled: true,
                defaultSort: { column: 'pair', direction: 'asc' }
              }}
              emptyMessage="No exchange rates found"
              emptyDescription="Try adjusting your search or filters to find what you're looking for."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
