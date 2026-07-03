'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Download, Filter, X, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { mockCities, City } from '@/data/common-masters/cities';
import { exportToCsv } from '@/lib/export';

export default function CityMasterPage() {
  const [cities, setCities] = useState<City[]>(mockCities);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterMetro, setFilterMetro] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

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
  const handleAddCity = () => {
    showToast('Add city functionality will be implemented', 'info');
  };

  const handleEditCity = (city: City) => {
    showToast(`Editing city: ${city.name}`, 'info');
  };

  const handleDeleteCity = (city: City) => {
    if (confirm(`Are you sure you want to delete ${city.name}?`)) {
      setCities(prev => prev.filter(c => c.id !== city.id));
      showToast(`${city.name} deleted successfully`, 'success');
    }
  };

  const handleExport = () => {
    exportToCsv('city-master', filteredData);
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
    </div>
  );
}
