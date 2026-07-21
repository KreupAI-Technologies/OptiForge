'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Download, Filter, X, Package, ChevronRight, ChevronDown, Layers, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ItemGroup, getItemGroupStats, getChildGroups } from '@/data/common-masters/item-groups';
import { commonMastersService } from '@/services/common-masters.service';
import { exportToCsv } from '@/lib/export';

export default function ItemGroupMasterPage() {
  const [itemGroups, setItemGroups] = useState<ItemGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load item groups from API
  useEffect(() => {
    let cancelled = false;

    const loadItemGroups = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await commonMastersService.getAllItemGroups();
        if (cancelled) return;

        const mapped: ItemGroup[] = rows.map((row) => ({
          id: row.id,
          groupCode: row.id ? row.id.slice(0, 8).toUpperCase() : '',
          groupName: row.name,
          parentGroupId: null,
          parentGroupName: undefined,
          level: 0,
          category: (row.category?.name ?? 'raw_material') as ItemGroup['category'],
          description: '',
          defaultPurchaseAccount: undefined,
          defaultSalesAccount: undefined,
          defaultInventoryAccount: undefined,
          isAsset: false,
          isStockItem: false,
          allowNegativeStock: false,
          valuationMethod: 'FIFO' as ItemGroup['valuationMethod'],
          hasSerialNo: false,
          hasBatchNo: false,
          hasExpiryDate: false,
          shelfLife: undefined,
          isManufactured: false,
          isPurchased: false,
          isSold: false,
          requiresQualityInspection: false,
          inspectionCriteria: undefined,
          defaultTaxCategory: '',
          hsnCode: undefined,
          totalItems: 0,
          activeItems: 0,
          isActive: row.isActive,
          createdAt: '',
          updatedAt: '',
          createdBy: '',
        }));

        setItemGroups(mapped);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load item groups');
        setItemGroups([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadItemGroups();

    return () => {
      cancelled = true;
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  // Reload item groups from the API (used after create/update/delete)
  const reloadItemGroups = async () => {
    try {
      const rows = await commonMastersService.getAllItemGroups();
      const mapped: ItemGroup[] = rows.map((row) => ({
        id: row.id,
        groupCode: row.id ? row.id.slice(0, 8).toUpperCase() : '',
        groupName: row.name,
        parentGroupId: null,
        parentGroupName: undefined,
        level: 0,
        category: (row.category?.name ?? 'raw_material') as ItemGroup['category'],
        description: '',
        defaultPurchaseAccount: undefined,
        defaultSalesAccount: undefined,
        defaultInventoryAccount: undefined,
        isAsset: false,
        isStockItem: false,
        allowNegativeStock: false,
        valuationMethod: 'FIFO' as ItemGroup['valuationMethod'],
        hasSerialNo: false,
        hasBatchNo: false,
        hasExpiryDate: false,
        shelfLife: undefined,
        isManufactured: false,
        isPurchased: false,
        isSold: false,
        requiresQualityInspection: false,
        inspectionCriteria: undefined,
        defaultTaxCategory: '',
        hsnCode: undefined,
        totalItems: 0,
        activeItems: 0,
        isActive: row.isActive,
        createdAt: '',
        updatedAt: '',
        createdBy: '',
      }));
      setItemGroups(mapped);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to reload item groups', 'error');
    }
  };

  const companyId = 'MAIN_COMPANY_ID';

  const handleEditGroup = async (group: ItemGroup) => {
    const newName = window.prompt('Update item group name', group.groupName);
    if (newName === null) return;
    const trimmed = newName.trim();
    if (!trimmed) {
      showToast('Group name is required', 'error');
      return;
    }
    try {
      await commonMastersService.updateItemGroup(group.id, { name: trimmed });
      await reloadItemGroups();
      showToast('Item group updated', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update item group', 'error');
    }
  };

  const handleAddSubGroup = async (group: ItemGroup) => {
    const name = window.prompt(`Add sub-group under "${group.groupName}"`, '');
    if (name === null) return;
    const trimmed = name.trim();
    if (!trimmed) {
      showToast('Group name is required', 'error');
      return;
    }
    try {
      await commonMastersService.createItemGroup({ name: trimmed, categoryId: group.id, companyId });
      await reloadItemGroups();
      showToast('Sub-group created', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create sub-group', 'error');
    }
  };

  const handleExport = () => {
    exportToCsv('item-group-master', filteredData as unknown as Record<string, unknown>[]);
    showToast('Exporting item groups data...', 'success');
  };

  const handleAddItemGroup = async () => {
    const name = window.prompt('New item group name', '');
    if (name === null) return;
    const trimmed = name.trim();
    if (!trimmed) {
      showToast('Group name is required', 'error');
      return;
    }
    const categoryId = window.prompt('Category ID for this group', '');
    if (categoryId === null) return;
    try {
      await commonMastersService.createItemGroup({ name: trimmed, categoryId: categoryId.trim(), companyId });
      await reloadItemGroups();
      showToast('Item group created', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create item group', 'error');
    }
  };

  const handleDeleteGroup = async (group: ItemGroup) => {
    if (!confirm(`Delete ${group.groupName}? This will affect ${group.totalItems} items.`)) return;
    try {
      await commonMastersService.deleteItemGroup(group.id);
      await reloadItemGroups();
      showToast(`Deleted group: ${group.groupName}`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete item group', 'error');
    }
  };

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Filtered data
  const filteredData = useMemo(() => {
    return itemGroups.filter(group => {
      const matchesSearch =
        group.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.groupCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filterCategory === 'all' || group.category === filterCategory;
      const matchesLevel = filterLevel === 'all' || group.level.toString() === filterLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [itemGroups, searchTerm, filterCategory, filterLevel]);

  const getCategoryColor = (category: string) => {
    const colors = {
      'raw_material': 'bg-blue-100 text-blue-800',
      'semi_finished': 'bg-yellow-100 text-yellow-800',
      'finished_goods': 'bg-green-100 text-green-800',
      'consumables': 'bg-purple-100 text-purple-800',
      'tools': 'bg-orange-100 text-orange-800',
      'spare_parts': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getValuationColor = (method: string) => {
    const colors = {
      'FIFO': 'bg-blue-50 text-blue-700',
      'LIFO': 'bg-purple-50 text-purple-700',
      'Weighted Average': 'bg-green-50 text-green-700',
      'Standard Cost': 'bg-orange-50 text-orange-700'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-50 text-gray-700';
  };

  // Hierarchical display helper
  const renderGroupName = (group: ItemGroup) => {
    const hasChildren = getChildGroups(group.id).length > 0;
    const isExpanded = expandedGroups.has(group.id);
    const indent = group.level * 24;

    return (
      <div className="flex items-center" style={{ paddingLeft: `${indent}px` }}>
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleGroup(group.id);
            }}
            className="mr-2 text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
        {!hasChildren && <span className="w-6 mr-2" />}
        <div>
          <div className="font-medium text-gray-900 flex items-center gap-2">
            {group.level === 0 && <Layers className="w-4 h-4 text-blue-600" />}
            {group.groupName}
          </div>
          <div className="text-xs text-gray-500">
            <span className="font-mono font-semibold text-blue-600">{group.groupCode}</span>
            {group.parentGroupName && <span className="text-gray-400"> • {group.parentGroupName}</span>}
          </div>
        </div>
      </div>
    );
  };

  // Table columns
  const columns: Column<ItemGroup>[] = [
    {
      id: 'group',
      header: 'Group Name',
      accessor: 'groupName',
      sortable: true,
      render: (_, row) => renderGroupName(row)
    },
    {
      id: 'category',
      header: 'Category',
      accessor: 'category',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getCategoryColor(value)}`}>
          {value.replace('_', ' ')}
        </span>
      )
    },
    {
      id: 'valuation',
      header: 'Valuation Method',
      accessor: 'valuationMethod',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getValuationColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      id: 'properties',
      header: 'Properties',
      accessor: 'isStockItem',
      sortable: false,
      render: (_, row) => (
        <div className="text-xs space-y-0.5">
          {row.hasSerialNo && <div className="text-blue-600">📱 Serial No.</div>}
          {row.hasBatchNo && <div className="text-green-600">📦 Batch No.</div>}
          {row.hasExpiryDate && <div className="text-orange-600">⏰ Expiry Date</div>}
          {row.requiresQualityInspection && <div className="text-purple-600">✓ QC Required</div>}
        </div>
      )
    },
    {
      id: 'usage',
      header: 'Usage',
      accessor: 'isPurchased',
      sortable: false,
      render: (_, row) => (
        <div className="text-xs space-y-0.5">
          {row.isPurchased && <div className="text-blue-600">← Purchased</div>}
          {row.isManufactured && <div className="text-green-600">⚙ Manufactured</div>}
          {row.isSold && <div className="text-purple-600">→ Sold</div>}
        </div>
      )
    },
    {
      id: 'items',
      header: 'Items',
      accessor: 'totalItems',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{row.activeItems} active</div>
        </div>
      )
    },
    {
      id: 'hsn',
      header: 'HSN/Tax',
      accessor: 'hsnCode',
      sortable: false,
      render: (value, row) => (
        <div className="text-xs">
          {value && <div className="font-mono text-gray-900">{value}</div>}
          <div className="text-gray-500">{row.defaultTaxCategory}</div>
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
              handleEditGroup(row);
            }}
          >
            Edit
          </button>
          <button
            className="text-green-600 hover:text-green-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleAddSubGroup(row);
            }}
          >
            Add Sub
          </button>
          <button
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteGroup(row);
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
    setFilterCategory('all');
    setFilterLevel('all');
  };

  const activeFilterCount = [
    filterCategory !== 'all',
    filterLevel !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  // Statistics
  const stats = useMemo(() => getItemGroupStats(), [itemGroups]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-amber-50 to-orange-50">
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2 space-y-3">
          {isLoading && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
              Loading item groups…
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

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-7 h-7 text-blue-600" />
                Item Group Master
              </h1>
              <p className="text-gray-600 mt-1">Manage hierarchical inventory classification and grouping</p>
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
            onClick={handleAddItemGroup}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Group</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Total Groups</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Raw Materials</div>
          <div className="text-2xl font-bold text-blue-600">{stats.rawMaterial}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Semi-Finished</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.semiFinished}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Finished Goods</div>
          <div className="text-2xl font-bold text-green-600">{stats.finishedGoods}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Consumables</div>
          <div className="text-2xl font-bold text-purple-600">{stats.consumables}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Total Items</div>
          <div className="text-2xl font-bold text-orange-600">{stats.totalItems}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by group name, code, or description..."
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
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="raw_material">Raw Materials</option>
                <option value="semi_finished">Semi-Finished Goods</option>
                <option value="finished_goods">Finished Goods</option>
                <option value="consumables">Consumables</option>
                <option value="tools">Tools</option>
                <option value="spare_parts">Spare Parts</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hierarchy Level
              </label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="0">Level 0 (Root)</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
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
            defaultSort: { column: 'group', direction: 'asc' }
          }}
          emptyMessage="No item groups found"
          emptyDescription="Try adjusting your search or filters to find what you're looking for."
        />
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Layers className="w-5 h-5" />
          Item Group Hierarchy & Classification
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>✓ 3-level hierarchical structure: Root Groups → Sub-Groups → Detail Categories</li>
          <li>✓ Separate valuation methods for different item types (FIFO, LIFO, Weighted Average, Standard Cost)</li>
          <li>✓ Quality inspection requirements configured at group level</li>
          <li>✓ Default accounting entries (Purchase, Sales, Inventory accounts) auto-applied to items</li>
          <li>✓ Serial/Batch tracking and expiry management based on group configuration</li>
          <li>✓ HSN codes and tax categories inherited from parent groups</li>
        </ul>
      </div>
        </div>
      </div>
    </div>
  );
}
