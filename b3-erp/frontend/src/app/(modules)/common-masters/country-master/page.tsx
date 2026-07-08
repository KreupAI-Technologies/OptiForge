'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Download, Upload, Filter, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Country } from '@/data/common-masters/countries';
import { commonMastersService } from '@/services/common-masters.service';
import { exportToCsv } from '@/lib/export';

export default function CountryMasterPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterContinent, setFilterContinent] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [form, setForm] = useState<{ code: string; name: string; dialCode: string; currency: string }>({
    code: '', name: '', dialCode: '', currency: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch countries from the live backend, mapping the raw API shape to the page's Country model.
  const loadCountries = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = (await commonMastersService.getAllCountries()) as any[];
      const mapped: Country[] = raw.map((c) => ({
        id: String(c.id ?? ''),
        code: c.code ?? '',
        name: c.name ?? '',
        dialCode: c.dialCode ?? c.phoneCode ?? '',
        currency: c.currency ?? '',
        currencySymbol: c.currencySymbol ?? '',
        flag: c.flag ?? '',
        continent: c.continent ?? '',
        isActive: c.isActive ?? true,
        createdAt: c.createdAt ?? '',
        updatedAt: c.updatedAt ?? '',
      }));
      setCountries(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load countries');
      setCountries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCountries();
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

  // Get unique continents for filter
  const continents = useMemo(() => {
    const unique = Array.from(new Set(countries.map(c => c.continent))).sort();
    return unique;
  }, [countries]);

  // Filtered data
  const filteredData = useMemo(() => {
    return countries.filter(country => {
      const matchesSearch =
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.currency.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesContinent = filterContinent === 'all' || country.continent === filterContinent;
      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'active' && country.isActive) ||
        (filterStatus === 'inactive' && !country.isActive);

      return matchesSearch && matchesContinent && matchesStatus;
    });
  }, [countries, searchTerm, filterContinent, filterStatus]);

  // Table columns
  const columns: Column<Country>[] = [
    {
      id: 'flag',
      header: 'Flag',
      accessor: 'flag',
      sortable: false,
      width: 'w-16',
      align: 'center',
      render: (value) => <span className="text-2xl">{value}</span>
    },
    {
      id: 'code',
      header: 'Code',
      accessor: 'code',
      sortable: true,
      render: (value) => <span className="font-mono font-semibold text-blue-600">{value}</span>
    },
    {
      id: 'name',
      header: 'Country Name',
      accessor: 'name',
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      id: 'dialCode',
      header: 'Dial Code',
      accessor: 'dialCode',
      sortable: true,
      render: (value) => <span className="font-mono text-gray-600">{value}</span>
    },
    {
      id: 'currency',
      header: 'Currency',
      accessor: 'currency',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{value}</span>
          <span className="text-gray-500">{row.currencySymbol}</span>
        </div>
      )
    },
    {
      id: 'continent',
      header: 'Continent',
      accessor: 'continent',
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {value}
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
              handleEdit(row);
            }}
          >
            Edit
          </button>
          <button
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const handleEdit = (country: Country) => {
    setEditingCountry(country);
    setForm({
      code: country.code,
      name: country.name,
      dialCode: country.dialCode ?? '',
      currency: country.currency ?? '',
    });
    setShowAddModal(true);
  };

  const handleSaveCountry = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      showToast('Country code and name are required.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      if (editingCountry) {
        await commonMastersService.updateCountry(editingCountry.id, {
          code: form.code,
          name: form.name,
          phoneCode: form.dialCode || undefined,
        } as any);
        showToast(`${form.name} updated successfully`, 'success');
      } else {
        await commonMastersService.createCountry({
          code: form.code,
          name: form.name,
          phoneCode: form.dialCode || undefined,
          currency: form.currency || undefined,
        });
        showToast(`${form.name} created successfully`, 'success');
      }
      setShowAddModal(false);
      await loadCountries();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save country', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const country = countries.find(c => c.id === id);
    if (confirm(`Are you sure you want to delete ${country?.name}?`)) {
      const previous = countries;
      setCountries(prev => prev.filter(c => c.id !== id));
      try {
        await commonMastersService.deleteCountry(id);
        showToast(`${country?.name} deleted successfully`, 'success');
        await loadCountries();
      } catch (err) {
        setCountries(previous);
        showToast(err instanceof Error ? err.message : `Failed to delete ${country?.name}`, 'error');
      }
    }
  };

  const handleExport = () => {
    exportToCsv('country-master', filteredData);
    showToast('Exporting countries data...', 'success');
  };

  const handleAddCountry = () => {
    setEditingCountry(null);
    setForm({ code: '', name: '', dialCode: '', currency: '' });
    setShowAddModal(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterContinent('all');
    setFilterStatus('all');
  };

  const activeFilterCount = [
    filterContinent !== 'all',
    filterStatus !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
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

          {isLoading && (
            <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
              Loading countries…
            </div>
          )}
          {loadError && !isLoading && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {loadError}
            </div>
          )}
          {!isLoading && !loadError && countries.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              No countries found.
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Country Master</h1>
              <p className="text-gray-600 mt-1">Manage country master data and configurations</p>
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
                onClick={handleAddCountry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Country</span>
              </button>
            </div>
          </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Total Countries</div>
          <div className="text-2xl font-bold text-gray-900">{countries.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {countries.filter(c => c.isActive).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Continents</div>
          <div className="text-2xl font-bold text-purple-600">{continents.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Currencies</div>
          <div className="text-2xl font-bold text-blue-600">
            {new Set(countries.map(c => c.currency)).size}
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
              placeholder="Search by country name, code, or currency..."
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
                Continent
              </label>
              <select
                value={filterContinent}
                onChange={(e) => setFilterContinent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Continents</option>
                {continents.map(continent => (
                  <option key={continent} value={continent}>{continent}</option>
                ))}
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

      {/* Data Table */}
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
            defaultSort: { column: 'name', direction: 'asc' }
          }}
          emptyMessage="No countries found"
          emptyDescription="Try adjusting your search or filters to find what you're looking for."
        />
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingCountry ? 'Edit Country' : 'Add New Country'}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country Code *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. IN"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. India"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dial Code</label>
                <input
                  type="text"
                  value={form.dialCode}
                  onChange={(e) => setForm({ ...form, dialCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. +91"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input
                  type="text"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. INR"
                  disabled={!!editingCountry}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCountry}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {isSaving ? 'Saving…' : editingCountry ? 'Update Country' : 'Create Country'}
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
