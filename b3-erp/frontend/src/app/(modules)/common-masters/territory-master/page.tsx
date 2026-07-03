'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Download, Filter, X, MapPin, TrendingUp, Users, Target, ChevronRight, ChevronDown, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { mockTerritories, Territory, getTerritoryStats, getChildTerritories } from '@/data/common-masters/territories';
import { exportToCsv } from '@/lib/export';

export default function TerritoryMasterPage() {
  const [territories, setTerritories] = useState<Territory[]>(mockTerritories);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTerritories, setExpandedTerritories] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleAddTerritory = () => showToast('Add territory functionality will be implemented', 'info');
  const handleViewTerritory = (territory: Territory) => showToast(`Viewing territory: ${territory.territoryName}`, 'info');
  const handleEditTerritory = (territory: Territory) => showToast(`Editing territory: ${territory.territoryName}`, 'info');
  const handleExport = () => {
    exportToCsv('territory-master', filteredData);
    showToast('Exporting territories data...', 'success');
  };

  // Toggle territory expansion
  const toggleTerritory = (territoryId: string) => {
    const newExpanded = new Set(expandedTerritories);
    if (newExpanded.has(territoryId)) {
      newExpanded.delete(territoryId);
    } else {
      newExpanded.add(territoryId);
    }
    setExpandedTerritories(newExpanded);
  };

  // Filtered data
  const filteredData = useMemo(() => {
    return territories.filter(territory => {
      const matchesSearch =
        territory.territoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        territory.territoryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        territory.salesManager.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || territory.territoryType === filterType;
      const matchesRegion = filterRegion === 'all' || territory.region === filterRegion;

      return matchesSearch && matchesType && matchesRegion;
    });
  }, [territories, searchTerm, filterType, filterRegion]);

  const getTypeColor = (type: string) => {
    const colors = {
      'country': 'bg-purple-100 text-purple-800',
      'region': 'bg-blue-100 text-blue-800',
      'state': 'bg-green-100 text-green-800',
      'zone': 'bg-orange-100 text-orange-800',
      'city': 'bg-pink-100 text-pink-800',
      'area': 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getMarketPotentialColor = (potential: string) => {
    const colors = {
      'very_high': 'bg-green-100 text-green-800',
      'high': 'bg-blue-100 text-blue-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-gray-100 text-gray-800'
    };
    return colors[potential as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getAchievementColor = (achievement: number) => {
    if (achievement >= 95) return 'text-green-600';
    if (achievement >= 85) return 'text-blue-600';
    if (achievement >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Hierarchical display helper
  const renderTerritoryName = (territory: Territory) => {
    const hasChildren = getChildTerritories(territory.id).length > 0;
    const isExpanded = expandedTerritories.has(territory.id);
    const indent = territory.level * 24;

    return (
      <div className="flex items-center" style={{ paddingLeft: `${indent}px` }}>
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTerritory(territory.id);
            }}
            className="mr-2 text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
        {!hasChildren && <span className="w-6 mr-2" />}
        <div>
          <div className="font-medium text-gray-900 flex items-center gap-2">
            {territory.level === 0 && <MapPin className="w-4 h-4 text-purple-600" />}
            {territory.territoryName}
          </div>
          <div className="text-xs text-gray-500">
            <span className="font-mono font-semibold text-blue-600">{territory.territoryCode}</span>
            {territory.parentTerritoryName && <span className="text-gray-400"> • {territory.parentTerritoryName}</span>}
          </div>
        </div>
      </div>
    );
  };

  // Table columns
  const columns: Column<Territory>[] = [
    {
      id: 'territory',
      header: 'Territory',
      accessor: 'territoryName',
      sortable: true,
      render: (_, row) => renderTerritoryName(row)
    },
    {
      id: 'type',
      header: 'Type',
      accessor: 'territoryType',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getTypeColor(value)}`}>
          {value.replace('_', ' ')}
        </span>
      )
    },
    {
      id: 'manager',
      header: 'Sales Manager',
      accessor: 'salesManager',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">Team: {row.salesTeam.length} members</div>
        </div>
      )
    },
    {
      id: 'customers',
      header: 'Customers',
      accessor: 'totalCustomers',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-gray-400" />
            <span className="font-medium text-gray-900">{value}</span>
          </div>
          <div className="text-xs text-green-600">{row.activeCustomers} active</div>
        </div>
      )
    },
    {
      id: 'sales',
      header: 'Sales Performance',
      accessor: 'currentYearSales',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">₹{(value / 1000000).toFixed(1)}M</div>
          <div className="text-xs text-gray-500">Target: ₹{(row.salesTarget / 1000000).toFixed(1)}M</div>
        </div>
      )
    },
    {
      id: 'achievement',
      header: 'Achievement',
      accessor: 'targetAchievement',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className={`font-semibold flex items-center gap-1 ${getAchievementColor(value)}`}>
            <Target className="w-3 h-3" />
            {value.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {row.growthRate > 0 ? '+' : ''}{row.growthRate.toFixed(1)}% YoY
          </div>
        </div>
      )
    },
    {
      id: 'potential',
      header: 'Market',
      accessor: 'marketPotential',
      sortable: true,
      render: (value, row) => (
        <div className="text-xs space-y-0.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${getMarketPotentialColor(value)}`}>
            {value.replace('_', ' ')}
          </span>
          <div className="text-gray-500">Competition: {row.competitionLevel}</div>
        </div>
      )
    },
    {
      id: 'logistics',
      header: 'Logistics',
      accessor: 'avgDeliveryDays',
      sortable: true,
      render: (value, row) => (
        <div className="text-xs">
          <div className="text-gray-900">{value} days avg.</div>
          <div className="text-gray-500">₹{row.transportCost}/km</div>
          {row.warehouseLocation && <div className="text-blue-600">{row.warehouseLocation}</div>}
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
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleViewTerritory(row);
            }}
          >
            View
          </button>
          <button
            className="text-green-600 hover:text-green-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleEditTerritory(row);
            }}
          >
            Edit
          </button>
        </div>
      )
    }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterRegion('all');
  };

  const activeFilterCount = [
    filterType !== 'all',
    filterRegion !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  // Statistics
  const stats = useMemo(() => getTerritoryStats(), [territories]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-teal-50 to-emerald-50">
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

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-7 h-7 text-blue-600" />
                Territory Master
              </h1>
              <p className="text-gray-600 mt-1">Manage sales territories and regional performance</p>
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
            onClick={handleAddTerritory}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Territory</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Total Territories</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Total Customers</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalCustomers}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Active Customers</div>
          <div className="text-2xl font-bold text-green-600">{stats.activeCustomers}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Total Sales
          </div>
          <div className="text-2xl font-bold text-purple-600">₹{(stats.totalSales / 10000000).toFixed(1)}Cr</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <Target className="w-3 h-3" /> Avg Achievement
          </div>
          <div className={`text-2xl font-bold ${getAchievementColor(stats.avgTargetAchievement)}`}>
            {stats.avgTargetAchievement}%
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Regions/States</div>
          <div className="text-2xl font-bold text-orange-600">{stats.regions}/{stats.states}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by territory name, code, or sales manager..."
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
                Territory Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="country">Country</option>
                <option value="region">Region</option>
                <option value="state">State</option>
                <option value="zone">Zone</option>
                <option value="city">City</option>
                <option value="area">Area</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Regions</option>
                <option value="North">North India</option>
                <option value="South">South India</option>
                <option value="East">East India</option>
                <option value="West">West India</option>
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
            defaultSort: { column: 'territory', direction: 'asc' }
          }}
          emptyMessage="No territories found"
          emptyDescription="Try adjusting your search or filters to find what you're looking for."
        />
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Territory Management & Sales Performance
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>✓ Hierarchical structure: Country → Region → State → Zone → City → Area</li>
          <li>✓ Real-time sales performance tracking with target achievement monitoring</li>
          <li>✓ Customer distribution and market potential analysis across territories</li>
          <li>✓ Sales team assignment and regional manager responsibilities</li>
          <li>✓ Logistics planning with warehouse locations and delivery time tracking</li>
          <li>✓ Competition analysis and growth rate monitoring for strategic decisions</li>
        </ul>
      </div>
        </div>
      </div>
    </div>
  );
}
