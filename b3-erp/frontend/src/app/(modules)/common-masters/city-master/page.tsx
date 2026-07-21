'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Download, Filter, X, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { City } from '@/data/common-masters/cities';
import type { State } from '@/services/common-masters.service';
import { exportToCsv } from '@/lib/export';
import { commonMastersService } from '@/services/common-masters.service';

export default function CityMasterPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [statesList, setStatesList] = useState<State[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterMetro, setFilterMetro] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<{ name: string; stateId: string; pincode: string }>({
    name: '',
    stateId: '',
    pincode: '',
  });

  // Toast notification effect
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Reusable fetch — callable after mutations
  const fetchCities = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = await commonMastersService.getAllCities();
      const mapped: City[] = raw.map((c: any) => ({
        id: c.id,
        code: c.code ?? '',
        name: c.name,
        stateCode: c.state?.code ?? '',
        stateName: c.state?.name ?? '',
        countryCode: c.state?.country?.code ?? '',
        countryName: c.state?.country?.name ?? '',
        tier: undefined,
        isMetro: false,
        isActive: c.isActive ?? true,
        population: undefined,
        timezone: undefined,
        createdAt: c.createdAt ?? '',
        updatedAt: c.updatedAt ?? '',
      }));
      setCities(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load cities');
      setCities([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load cities + states from the backend
  useEffect(() => {
    fetchCities();
    (async () => {
      try {
        const states = await commonMastersService.getAllStates();
        setStatesList(states);
      } catch {
        setStatesList([]);
      }
    })();
  }, []);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  // Action handlers
  const openCreateModal = () => {
    setForm({ name: '', stateId: '', pincode: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleAddCity = () => {
    openCreateModal();
  };

  const handleEditCity = (city: City) => {
    // Resolve the stateId from the loaded states list by matching state name.
    const matchedState = statesList.find(s => s.name === city.stateName);
    setForm({ name: city.name, stateId: matchedState?.id ?? '', pincode: '' });
    setEditingId(city.id);
    setIsModalOpen(true);
  };

  const handleSaveCity = async () => {
    if (!form.name.trim() || !form.stateId) {
      showToast('Name and State are required', 'error');
      return;
    }
    try {
      setIsSaving(true);
      if (editingId) {
        await commonMastersService.updateCity(editingId, {
          name: form.name.trim(),
          stateId: form.stateId,
        });
      } else {
        await commonMastersService.createCity({
          name: form.name.trim(),
          stateId: form.stateId,
          pincode: form.pincode.trim() || undefined,
        });
      }
      setIsModalOpen(false);
      await fetchCities();
      showToast(editingId ? 'City updated successfully' : 'City created successfully', 'success');
    } catch (err) {
      console.error('Error saving city:', err);
      showToast('Failed to save city', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCity = async (city: City) => {
    if (!confirm(`Are you sure you want to delete ${city.name}?`)) {
      return;
    }
    try {
      await commonMastersService.deleteCity(city.id);
      await fetchCities();
      showToast(`${city.name} deleted successfully`, 'success');
    } catch (err) {
      console.error('Error deleting city:', err);
      showToast('Failed to delete city', 'error');
    }
  };

  const handleExport = () => {
    exportToCsv('city-master', filteredData as unknown as Record<string, unknown>[]);
    showToast('Exporting cities data...', 'success');
  };

  // Get unique filter options
  const countries = useMemo(() => {
    const unique = Array.from(new Set(cities.map(c => c.countryName))).sort();
    return unique;
  }, [cities]);

  const states = useMemo(() => {
    const filtered = filterCountry === 'all'
      ? cities
      : cities.filter(c => c.countryName === filterCountry);
    const unique = Array.from(new Set(filtered.map(c => c.stateName))).sort();
    return unique;
  }, [cities, filterCountry]);

  const tiers = useMemo(() => {
    const unique = Array.from(new Set(cities.map(c => c.tier).filter(Boolean))).sort();
    return unique;
  }, [cities]);

  // Filtered data
  const filteredData = useMemo(() => {
    return cities.filter(city => {
      const matchesSearch =
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.stateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.countryName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCountry = filterCountry === 'all' || city.countryName === filterCountry;
      const matchesState = filterState === 'all' || city.stateName === filterState;
      const matchesTier = filterTier === 'all' || city.tier === filterTier;
      const matchesMetro = filterMetro === 'all' ||
        (filterMetro === 'metro' && city.isMetro) ||
        (filterMetro === 'non-metro' && !city.isMetro);

      return matchesSearch && matchesCountry && matchesState && matchesTier && matchesMetro;
    });
  }, [cities, searchTerm, filterCountry, filterState, filterTier, filterMetro]);

  // Table columns
  const columns: Column<City>[] = [
    {
      id: 'code',
      header: 'Code',
      accessor: 'code',
      sortable: true,
      width: 'w-24',
      render: (value) => <span className="font-mono font-semibold text-blue-600">{value}</span>
    },
    {
      id: 'name',
      header: 'City Name',
      accessor: 'name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-xs text-gray-500">{row.stateName}, {row.countryName}</div>
          </div>
        </div>
      )
    },
    {
      id: 'state',
      header: 'State/Province',
      accessor: 'stateName',
      sortable: true,
      render: (value) => <span className="text-gray-900">{value}</span>
    },
    {
      id: 'country',
      header: 'Country',
      accessor: 'countryName',
      sortable: true,
      render: (value) => <span className="text-gray-700">{value}</span>
    },
    {
      id: 'tier',
      header: 'Tier',
      accessor: 'tier',
      sortable: true,
      render: (value) => {
        if (!value) return <span className="text-gray-400">-</span>;
        const colors = {
          'Tier 1': 'bg-green-100 text-green-800',
          'Tier 2': 'bg-blue-100 text-blue-800',
          'Tier 3': 'bg-gray-100 text-gray-800'
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[value as keyof typeof colors]}`}>
            {value}
          </span>
        );
      }
    },
    {
      id: 'metro',
      header: 'Metro',
      accessor: 'isMetro',
      sortable: true,
      align: 'center',
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          value ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {value ? 'Metro' : 'Non-Metro'}
        </span>
      )
    },
    {
      id: 'population',
      header: 'Population',
      accessor: 'population',
      sortable: true,
      align: 'right',
      render: (value) => value ? (
        <span className="text-gray-900 font-mono text-sm">
          {(value / 1000000).toFixed(2)}M
        </span>
      ) : (
        <span className="text-gray-400">-</span>
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
              handleEditCity(row);
            }}
          >
            Edit
          </button>
          <button
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCity(row);
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
    setFilterCountry('all');
    setFilterState('all');
    setFilterTier('all');
    setFilterMetro('all');
  };

  const activeFilterCount = [
    filterCountry !== 'all',
    filterState !== 'all',
    filterTier !== 'all',
    filterMetro !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-indigo-50 to-blue-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="px-3 py-2 space-y-3">
          {isLoading && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
              Loading cities…
            </div>
          )}
          {loadError && !isLoading && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {loadError}
            </div>
          )}
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
              <h1 className="text-2xl font-bold text-gray-900">City Master</h1>
              <p className="text-gray-600 mt-1">Manage city and location master data</p>
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
                onClick={handleAddCity}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add City</span>
              </button>
            </div>
          </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Total Cities</div>
          <div className="text-2xl font-bold text-gray-900">{cities.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Metro Cities</div>
          <div className="text-2xl font-bold text-purple-600">
            {cities.filter(c => c.isMetro).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Tier 1</div>
          <div className="text-2xl font-bold text-green-600">
            {cities.filter(c => c.tier === 'Tier 1').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Tier 2</div>
          <div className="text-2xl font-bold text-blue-600">
            {cities.filter(c => c.tier === 'Tier 2').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Tier 3</div>
          <div className="text-2xl font-bold text-gray-600">
            {cities.filter(c => c.tier === 'Tier 3').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Countries</div>
          <div className="text-2xl font-bold text-indigo-600">{countries.length}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by city name, code, state, or country..."
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
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={filterCountry}
                onChange={(e) => {
                  setFilterCountry(e.target.value);
                  setFilterState('all'); // Reset state filter when country changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province
              </label>
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={filterCountry === 'all'}
              >
                <option value="all">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City Tier
              </label>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Tiers</option>
                {tiers.map(tier => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metro Status
              </label>
              <select
                value={filterMetro}
                onChange={(e) => setFilterMetro(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Cities</option>
                <option value="metro">Metro Only</option>
                <option value="non-metro">Non-Metro Only</option>
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
            pageSize: 15
          }}
          sorting={{
            enabled: true,
            defaultSort: { column: 'name', direction: 'asc' }
          }}
          emptyMessage="No cities found"
          emptyDescription="Try adjusting your search or filters to find what you're looking for."
        />
      </div>
        </div>
      </div>

      {/* Add/Edit City Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit City' : 'Add City'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province
                </label>
                <select
                  value={form.stateId}
                  onChange={(e) => setForm({ ...form, stateId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a state…</option>
                  {statesList.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name}{state.country?.name ? ` (${state.country.name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                onClick={handleSaveCity}
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
