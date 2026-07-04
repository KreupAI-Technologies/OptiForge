'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderTree, Plus, Search, Filter, Edit3, Eye, Trash2, Upload,
  Download, Save, X, MoreVertical, CheckCircle, XCircle,
  AlertCircle, Tag, Layers, Box, Grid, List, ChevronRight,
  ChevronDown, Move, Copy, Archive, RefreshCw, Settings
} from 'lucide-react';
import { commonMastersService } from '@/services/common-masters.service';
import { pickAndParseCsv } from '@/lib/import';


interface ItemCategory {
  id: string;
  categoryCode: string;
  categoryName: string;
  parentCategory?: string;
  level: number;
  description: string;
  type: 'product' | 'service' | 'asset' | 'expense';
  status: 'active' | 'inactive' | 'archived';

  // Classification
  isLeafCategory: boolean;
  allowItems: boolean;
  hsn_sac_prefix?: string;

  // Attributes & Controls
  attributes: {
    requireSerialNumber: boolean;
    requireBatchNumber: boolean;
    requireExpiryDate: boolean;
    requireWarranty: boolean;
    requireCertification: boolean;
    requireQualityInspection: boolean;
  };

  // Inventory Settings
  inventorySettings: {
    tracked: boolean;
    negativeStockAllowed: boolean;
    defaultUOM?: string;
    valuationMethod?: 'FIFO' | 'LIFO' | 'Average' | 'Standard';
  };

  // Financial
  accountingSettings: {
    inventoryAccount?: string;
    cogsAccount?: string;
    revenueAccount?: string;
    expenseAccount?: string;
  };

  // Procurement
  procurementSettings: {
    defaultLeadTime?: number;
    requirePOApproval: boolean;
    minOrderQuantity?: number;
    preferredVendors?: string[];
  };

  // Metadata
  imagePath?: string;
  icon?: string;
  color?: string;
  sortOrder: number;

  // Statistics
  statistics: {
    totalItems: number;
    activeItems: number;
    subcategoriesCount: number;
    totalValue?: number;
  };

  // System Fields
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  isSystem: boolean;
}

const ItemCategoryMaster: React.FC = () => {
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ItemCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'tree' | 'list' | 'grid'>('tree');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Mock data with hierarchical structure
  const mockCategories: ItemCategory[] = [
    {
      id: 'CAT001',
      categoryCode: 'RM',
      categoryName: 'Raw Materials',
      level: 1,
      description: 'All raw materials used in manufacturing',
      type: 'product',
      status: 'active',
      isLeafCategory: false,
      allowItems: false,
      attributes: {
        requireSerialNumber: false,
        requireBatchNumber: true,
        requireExpiryDate: false,
        requireWarranty: false,
        requireCertification: true,
        requireQualityInspection: true
      },
      inventorySettings: {
        tracked: true,
        negativeStockAllowed: false,
        valuationMethod: 'Average'
      },
      accountingSettings: {
        inventoryAccount: '1400',
        cogsAccount: '5000'
      },
      procurementSettings: {
        defaultLeadTime: 15,
        requirePOApproval: true,
        minOrderQuantity: 10
      },
      sortOrder: 1,
      statistics: {
        totalItems: 456,
        activeItems: 423,
        subcategoriesCount: 5,
        totalValue: 2500000
      },
      createdBy: 'admin',
      createdAt: '2024-01-01T10:00:00Z',
      isSystem: false
    },
    {
      id: 'CAT001-01',
      categoryCode: 'RM-WOOD',
      categoryName: 'Wood & Timber',
      parentCategory: 'CAT001',
      level: 2,
      description: 'All types of wood and timber materials',
      type: 'product',
      status: 'active',
      isLeafCategory: false,
      allowItems: true,
      hsn_sac_prefix: '4407',
      attributes: {
        requireSerialNumber: false,
        requireBatchNumber: true,
        requireExpiryDate: false,
        requireWarranty: false,
        requireCertification: true,
        requireQualityInspection: true
      },
      inventorySettings: {
        tracked: true,
        negativeStockAllowed: false,
        defaultUOM: 'CFT',
        valuationMethod: 'FIFO'
      },
      accountingSettings: {
        inventoryAccount: '1410',
        cogsAccount: '5010'
      },
      procurementSettings: {
        defaultLeadTime: 20,
        requirePOApproval: true,
        minOrderQuantity: 100
      },
      color: '#8B4513',
      sortOrder: 1,
      statistics: {
        totalItems: 125,
        activeItems: 118,
        subcategoriesCount: 3,
        totalValue: 850000
      },
      createdBy: 'admin',
      createdAt: '2024-01-01T10:00:00Z',
      isSystem: false
    },
    {
      id: 'CAT001-02',
      categoryCode: 'RM-METAL',
      categoryName: 'Metals & Alloys',
      parentCategory: 'CAT001',
      level: 2,
      description: 'Metal materials including steel, aluminum, brass',
      type: 'product',
      status: 'active',
      isLeafCategory: true,
      allowItems: true,
      hsn_sac_prefix: '7308',
      attributes: {
        requireSerialNumber: false,
        requireBatchNumber: true,
        requireExpiryDate: false,
        requireWarranty: false,
        requireCertification: true,
        requireQualityInspection: true
      },
      inventorySettings: {
        tracked: true,
        negativeStockAllowed: false,
        defaultUOM: 'KG',
        valuationMethod: 'Average'
      },
      accountingSettings: {
        inventoryAccount: '1411',
        cogsAccount: '5011'
      },
      procurementSettings: {
        defaultLeadTime: 25,
        requirePOApproval: true,
        minOrderQuantity: 500
      },
      color: '#A9A9A9',
      sortOrder: 2,
      statistics: {
        totalItems: 89,
        activeItems: 85,
        subcategoriesCount: 0,
        totalValue: 650000
      },
      createdBy: 'admin',
      createdAt: '2024-01-01T10:00:00Z',
      isSystem: false
    },
    {
      id: 'CAT002',
      categoryCode: 'FG',
      categoryName: 'Finished Goods',
      level: 1,
      description: 'Completed products ready for sale',
      type: 'product',
      status: 'active',
      isLeafCategory: false,
      allowItems: false,
      attributes: {
        requireSerialNumber: true,
        requireBatchNumber: false,
        requireExpiryDate: false,
        requireWarranty: true,
        requireCertification: false,
        requireQualityInspection: true
      },
      inventorySettings: {
        tracked: true,
        negativeStockAllowed: false,
        valuationMethod: 'Standard'
      },
      accountingSettings: {
        inventoryAccount: '1500',
        cogsAccount: '5100',
        revenueAccount: '4000'
      },
      procurementSettings: {
        requirePOApproval: false
      },
      sortOrder: 2,
      statistics: {
        totalItems: 234,
        activeItems: 215,
        subcategoriesCount: 4,
        totalValue: 8500000
      },
      createdBy: 'admin',
      createdAt: '2024-01-01T10:00:00Z',
      isSystem: false
    },
    {
      id: 'CAT002-01',
      categoryCode: 'FG-KITCHEN',
      categoryName: 'Kitchen Cabinets',
      parentCategory: 'CAT002',
      level: 2,
      description: 'Modular and customized kitchen cabinet solutions',
      type: 'product',
      status: 'active',
      isLeafCategory: true,
      allowItems: true,
      hsn_sac_prefix: '9403',
      attributes: {
        requireSerialNumber: true,
        requireBatchNumber: false,
        requireExpiryDate: false,
        requireWarranty: true,
        requireCertification: false,
        requireQualityInspection: true
      },
      inventorySettings: {
        tracked: true,
        negativeStockAllowed: false,
        defaultUOM: 'SET',
        valuationMethod: 'Standard'
      },
      accountingSettings: {
        inventoryAccount: '1510',
        cogsAccount: '5110',
        revenueAccount: '4010'
      },
      procurementSettings: {
        requirePOApproval: false
      },
      color: '#4A5568',
      sortOrder: 1,
      statistics: {
        totalItems: 78,
        activeItems: 72,
        subcategoriesCount: 0,
        totalValue: 4200000
      },
      createdBy: 'admin',
      createdAt: '2024-01-01T10:00:00Z',
      isSystem: false
    },
    {
      id: 'CAT003',
      categoryCode: 'SVC',
      categoryName: 'Services',
      level: 1,
      description: 'Service items and labor',
      type: 'service',
      status: 'active',
      isLeafCategory: false,
      allowItems: true,
      attributes: {
        requireSerialNumber: false,
        requireBatchNumber: false,
        requireExpiryDate: false,
        requireWarranty: true,
        requireCertification: true,
        requireQualityInspection: false
      },
      inventorySettings: {
        tracked: false,
        negativeStockAllowed: true
      },
      accountingSettings: {
        revenueAccount: '4500',
        expenseAccount: '6000'
      },
      procurementSettings: {
        requirePOApproval: false
      },
      sortOrder: 3,
      statistics: {
        totalItems: 45,
        activeItems: 42,
        subcategoriesCount: 2,
        totalValue: 0
      },
      createdBy: 'admin',
      createdAt: '2024-01-01T10:00:00Z',
      isSystem: false
    }
  ];

  useEffect(() => {
    loadCategories();
  }, [searchTerm, filterType, filterStatus]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await commonMastersService.getAllItemCategories();
      // Map API data to component interface
      const mappedData: any[] = data.map(c => ({
        ...c,
        categoryCode: c.id.substring(0, 8).toUpperCase(),
        categoryName: c.name,
        status: c.isActive ? 'active' : 'inactive',
        type: 'product',
        statistics: { totalItems: 0, activeItems: 0, subcategoriesCount: 0 }
      }));
      setCategories(mappedData);
      setFilteredCategories(mappedData);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const companyId = 'MAIN_COMPANY_ID';

  const handleImport = async () => {
    try {
      const rows = await pickAndParseCsv();
      if (!rows) return;
      if (rows.length === 0) { alert('The selected CSV file has no data rows.'); return; }
      const result = await commonMastersService.bulkCreate('item-categories', rows, companyId);
      await loadCategories();
      alert(`Import complete: ${result.created} created, ${result.skipped} skipped (of ${result.total} rows).`);
    } catch (error) {
      console.error('Error importing item categories:', error);
      alert('Import failed. Please check the CSV format and try again.');
    }
  };


  useEffect(() => {
    let filtered = categories;

    if (searchTerm) {
      filtered = filtered.filter(cat =>
        cat.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.categoryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(cat => cat.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(cat => cat.status === filterStatus);
    }

    setFilteredCategories(filtered);
  }, [categories, searchTerm, filterType, filterStatus]);

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'product': return 'bg-blue-100 text-blue-800';
      case 'service': return 'bg-purple-100 text-purple-800';
      case 'asset': return 'bg-green-100 text-green-800';
      case 'expense': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTreeNode = (category: ItemCategory, depth: number = 0) => {
    const hasChildren = filteredCategories.some(c => c.parentCategory === category.id);
    const isExpanded = expandedNodes.has(category.id);

    return (
      <div key={category.id} className="mb-1">
        <div
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-200 bg-white transition-all ${selectedCategory?.id === category.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
          style={{ marginLeft: `${depth * 24}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleNode(category.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}

          <div
            className="w-8 h-8 rounded flex items-center justify-center"
            style={{ backgroundColor: category.color || '#E5E7EB' }}
          >
            <FolderTree className="w-4 h-4 text-white" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{category.categoryName}</span>
              <span className="text-xs text-gray-500">({category.categoryCode})</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(category.type)}`}>
                {category.type}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(category.status)}`}>
                {category.status}
              </span>
              {category.isLeafCategory && (
                <span title="Leaf Category">
                  <Tag className="w-4 h-4 text-green-600" />
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 mt-1">{category.description}</div>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <span>Items: {category.statistics.totalItems}</span>
              <span>Active: {category.statistics.activeItems}</span>
              {category.statistics.totalValue && (
                <span>Value: ${category.statistics.totalValue.toLocaleString()}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewCategory(category)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEditCategory(category)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
              title="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {filteredCategories
              .filter(c => c.parentCategory === category.id)
              .map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: ItemCategory) => {
    setSelectedCategory(category);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewCategory = (category: ItemCategory) => {
    setSelectedCategory(category);
    setModalMode('view');
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FolderTree className="w-8 h-8 text-blue-600" />
                Item Category Master
              </h1>
              <p className="text-gray-600 mt-2">Manage product and service categorization hierarchy</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleImport} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={handleCreateCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="product">Product</option>
              <option value="service">Service</option>
              <option value="asset">Asset</option>
              <option value="expense">Expense</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('tree')}
                className={`p-2 rounded ${viewMode === 'tree' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {filteredCategories.length}
                </p>
              </div>
              <FolderTree className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Categories</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {filteredCategories.filter(c => c.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {filteredCategories.reduce((sum, cat) => sum + cat.statistics.totalItems, 0)}
                </p>
              </div>
              <Box className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${(filteredCategories.reduce((sum, cat) => sum + (cat.statistics.totalValue || 0), 0) / 1000000).toFixed(1)}M
                </p>
              </div>
              <Tag className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Category Tree/List/Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            {viewMode === 'tree' && (
              <div className="space-y-2">
                {filteredCategories
                  .filter(cat => !cat.parentCategory)
                  .map(cat => renderTreeNode(cat))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-2">
                {filteredCategories.map(category => (
                  <div
                    key={category.id}
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 border border-gray-200"
                  >
                    <div
                      className="w-10 h-10 rounded flex items-center justify-center"
                      style={{ backgroundColor: category.color || '#E5E7EB' }}
                    >
                      <FolderTree className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{category.categoryName}</span>
                        <span className="text-xs text-gray-500">({category.categoryCode})</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(category.type)}`}>
                          {category.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(category.status)}`}>
                          {category.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewCategory(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredCategories.map(category => (
                  <div
                    key={category.id}
                    className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-lg transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: category.color || '#E5E7EB' }}
                      >
                        <FolderTree className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleViewCategory(category)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{category.categoryName}</h3>
                    <p className="text-xs text-gray-500 mb-2">{category.categoryCode}</p>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(category.type)}`}>
                        {category.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(category.status)}`}>
                        {category.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>Items: {category.statistics.totalItems}</div>
                      <div>Active: {category.statistics.activeItems}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCategoryMaster;
