'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Download, Filter, X, MapPin, TrendingUp, Users, Target, ChevronRight, ChevronDown, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Territory, getChildTerritories } from '@/data/common-masters/territories';
import { commonMastersService } from '@/services/common-masters.service';
import { exportToCsv } from '@/lib/export';

export default function TerritoryMasterPage() {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTerritories, setExpandedTerritories] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ code: '', name: '' });

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchTerritories = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const rows = await commonMastersService.getAllTerritories('1');

      const mapped: Territory[] = rows.map((row) => ({
        id: row.id,
        territoryCode: row.code,
        territoryName: row.name,
        territoryType: 'area' as any,
        parentTerritoryId: null,
        parentTerritoryName: null,
        level: 0,
        country: '',
        cities: [],
        pincodes: [],
        coverageArea: '',
        salesManager: '',
        salesTeam: [],
        totalCustomers: 0,
        activeCustomers: 0,
        currentMonthSales: 0,
        currentYearSales: 0,
        lastYearSales: 0,
        salesTarget: 0,
        targetAchievement: 0,
        marketPotential: 'medium' as any,
        competitionLevel: 'moderate' as any,
        growthRate: 0,
        avgDeliveryDays: 0,
        transportCost: 0,
        currency: '',
        taxRegion: '',
        allowCreditSales: false,
        defaultPaymentTerms: '',
        isActive: row.isActive,
        createdBy: '',
        createdDate: '',
        modifiedBy: '',
        modifiedDate: '',
      }));

      setTerritories(mapped);
    } catch (err) {
      setLoadError('Failed to load territories. Please try again.');
      setTerritories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTerritories();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleViewTerritory = (territory: Territory) => showToast(`Viewing territory: ${territory.territoryName}`, 'info');

  const openCreateModal = () => {
    setForm({ code: '', name: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleAddTerritory = () => openCreateModal();

  const handleEditTerritory = (territory: Territory) => {
    setForm({ code: territory.territoryCode, name: territory.territoryName });
    setEditingId(territory.id);
    setIsModalOpen(true);
  };

  const handleSaveTerritory = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      showToast('Code and Name are required', 'error');
      return;
    }
    try {
      setIsSaving(true);
      if (editingId) {
        await commonMastersService.updateTerritory(editingId, { code: form.code, name: form.name });
      } else {
        await commonMastersService.createTerritory({ code: form.code, name: form.name, companyId: '1' });
      }
      setIsModalOpen(false);
      await fetchTerritories();
      showToast(editingId ? 'Territory updated successfully' : 'Territory created successfully', 'success');
    } catch (error) {
      showToast('Failed to save territory', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTerritory = async (territory: Territory) => {
    if (!confirm(`Delete territory "${territory.territoryName}"?`)) {
      return;
    }
    try {
      await commonMastersService.deleteTerritory(territory.id);
      await fetchTerritories();
      showToast('Territory deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete territory', 'error');
    }
  };
  const handleExport = () => {
    exportToCsv('territory-master', filteredData as unknown as Record<string, unknown>[]);
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
          <button
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTerritory(row);
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
    setFilterType('all');
    setFilterRegion('all');
  };

  const activeFilterCount = [
    filterType !== 'all',
    filterRegion !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  // Statistics computed from the fetched list
  const stats = useMemo(() => {
    const total = territories.length;
    return {
      total,
      totalCustomers: territories.reduce((sum, t) => sum + t.totalCustomers, 0),
      activeCustomers: territories.reduce((sum, t) => sum + t.activeCustomers, 0),
      totalSales: territories.reduce((sum, t) => sum + t.currentYearSales, 0),
      avgTargetAchievement: total
        ? Math.round(territories.reduce((sum, t) => sum + t.targetAchievement, 0) / total)
        : 0,
      regions: territories.filter(t => t.territoryType === 'region').length,
      states: territories.filter(t => t.territoryType === 'state').length,
    };
  }, [territories]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-teal-50 to-emerald-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="px-3 py-2 space-y-3">
          {isLoading && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
              Loading territories…
            </div>
          )}
          {loadError && !isLoading && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {loadError}
            </div>
          )}
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

      {/* Add/Edit Territory Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Territory' : 'Add Territory'}
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
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                onClick={handleSaveTerritory}
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
