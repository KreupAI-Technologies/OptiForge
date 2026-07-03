'use client';

import React, { useState, useEffect } from 'react';
import {
  Package, Plus, Search, Filter, Edit3, Eye, Trash2, Upload,
  Download, Copy, MoreVertical, Barcode, DollarSign, Ruler,
  Tag, Star, ShoppingCart, Factory, Warehouse, Camera,
  FileText, CheckCircle, XCircle, AlertCircle, Save, X,
  Grid, List, Package2, Layers, Boxes, Calendar
} from 'lucide-react';
import { CoreService } from '@/services/core.service';


interface Item {
  id: string;
  itemCode: string;
  itemName: string;
  shortName: string;
  description: string;
  category: string;
  subCategory?: string;
  brand?: string;
  type: 'raw_material' | 'finished_good' | 'semi_finished' | 'service' | 'asset';
  status: 'active' | 'inactive' | 'discontinued' | 'blocked';

  // Classification
  hsn_sac_code?: string;
  barcode?: string;
  internalCode?: string;
  manufacturer?: string;
  model?: string;

  // Units & Measurements
  primaryUOM: string;
  secondaryUOM?: string;
  conversionFactor?: number;
  weight?: number;
  weightUOM?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit: string;
  };

  // Inventory
  inventoryManaged: boolean;
  serialized: boolean;
  batchTracked: boolean;
  expiryTracked: boolean;
  shelfLife?: number;

  // Stock Levels
  minStock?: number;
  maxStock?: number;
  reorderLevel?: number;
  safetyStock?: number;

  // Pricing
  standardCost?: number;
  averageCost?: number;
  lastPurchasePrice?: number;
  standardSellingPrice?: number;

  // Quality & Specifications
  qualityInspectionRequired: boolean;
  specifications?: string;
  grade?: string;
  tolerance?: string;

  // Kitchen Manufacturing Specific
  materialType?: 'wood' | 'metal' | 'plastic' | 'glass' | 'stone' | 'fabric' | 'hardware';
  finish?: string;
  color?: string;
  size?: string;

  // System Fields
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  images?: string[];
}

const ItemMaster: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data
  const mockItems: Item[] = [
    {
      id: 'ITEM001',
      itemCode: 'WOOD-OAK-001',
      itemName: 'Oak Wood Panel - Premium Grade',
      shortName: 'Oak Panel Premium',
      description: 'High-quality oak wood panel suitable for kitchen cabinet doors and frames',
      category: 'Raw Materials',
      subCategory: 'Wood Panels',
      brand: 'Premium Woods Inc',
      type: 'raw_material',
      status: 'active',
      hsn_sac_code: '4412.31',
      barcode: '1234567890123',
      internalCode: 'OAK-P-001',
      manufacturer: 'Premium Woods Inc',
      model: 'OAK-PREMIUM-18MM',
      primaryUOM: 'SQM',
      secondaryUOM: 'PCS',
      conversionFactor: 2.88,
      weight: 12.5,
      weightUOM: 'KG',
      dimensions: {
        length: 2440,
        width: 1220,
        height: 18,
        unit: 'MM'
      },
      inventoryManaged: true,
      serialized: false,
      batchTracked: true,
      expiryTracked: false,
      minStock: 50,
      maxStock: 500,
      reorderLevel: 100,
      safetyStock: 25,
      standardCost: 85.50,
      averageCost: 82.30,
      lastPurchasePrice: 80.00,
      standardSellingPrice: 120.00,
      qualityInspectionRequired: true,
      specifications: '18mm thick, Grade A oak veneer, moisture content <12%',
      grade: 'Grade A',
      tolerance: '±0.5mm',
      materialType: 'wood',
      finish: 'Natural',
      color: 'Natural Oak',
      size: '2440x1220x18mm',
      createdBy: 'admin',
      createdAt: '2024-01-15T10:00:00Z',
      images: ['/images/oak-panel-001.jpg']
    },
    {
      id: 'ITEM002',
      itemCode: 'HARD-HNG-001',
      itemName: 'Soft Close Cabinet Hinge',
      shortName: 'Soft Close Hinge',
      description: 'European style soft close cabinet hinge with 35mm bore',
      category: 'Hardware',
      subCategory: 'Hinges',
      brand: 'Blum',
      type: 'raw_material',
      status: 'active',
      hsn_sac_code: '8302.41',
      barcode: '9876543210987',
      internalCode: 'HNG-SC-001',
      manufacturer: 'Blum GmbH',
      model: 'BLUMOTION-35',
      primaryUOM: 'PCS',
      weight: 0.15,
      weightUOM: 'KG',
      dimensions: {
        length: 95,
        width: 35,
        height: 12,
        unit: 'MM'
      },
      inventoryManaged: true,
      serialized: true,
      batchTracked: false,
      expiryTracked: false,
      minStock: 100,
      maxStock: 1000,
      reorderLevel: 200,
      safetyStock: 50,
      standardCost: 12.50,
      averageCost: 11.80,
      lastPurchasePrice: 11.25,
      standardSellingPrice: 18.00,
      qualityInspectionRequired: true,
      specifications: '35mm bore, 110° opening angle, soft close mechanism',
      grade: 'Premium',
      materialType: 'metal',
      finish: 'Nickel Plated',
      color: 'Silver',
      createdBy: 'admin',
      createdAt: '2024-02-10T10:00:00Z'
    },
    {
      id: 'ITEM003',
      itemCode: 'FG-KIT-001',
      itemName: 'Premium Kitchen Cabinet Set',
      shortName: 'Premium Cabinet Set',
      description: 'Complete kitchen cabinet set with soft close doors and drawers',
      category: 'Finished Goods',
      subCategory: 'Kitchen Sets',
      brand: 'ManufacturingOS',
      type: 'finished_good',
      status: 'active',
      hsn_sac_code: '9403.40',
      internalCode: 'KIT-PREM-001',
      primaryUOM: 'SET',
      weight: 250,
      weightUOM: 'KG',
      inventoryManaged: true,
      serialized: true,
      batchTracked: false,
      expiryTracked: false,
      minStock: 5,
      maxStock: 25,
      reorderLevel: 10,
      safetyStock: 3,
      standardCost: 2500.00,
      standardSellingPrice: 4500.00,
      qualityInspectionRequired: true,
      specifications: 'Modular design, soft close, premium finish',
      grade: 'Premium',
      materialType: 'wood',
      finish: 'High Gloss',
      color: 'White',
      createdBy: 'admin',
      createdAt: '2024-03-05T10:00:00Z'
    }
  ];

  useEffect(() => {
    loadItems();
  }, [searchTerm, filterCategory, filterType, filterStatus]);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const filters: any = {
        search: searchTerm,
        itemType: filterType !== 'all' ? filterType : undefined,
        categoryId: filterCategory !== 'all' ? filterCategory : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined
      };
      const data = await CoreService.getAllItems(filters);
      // Map API data if needed
      const mappedData: any[] = data.map(i => ({
        ...i,
        itemCode: i.code,
        itemName: i.name,
        category: i.category?.name || 'Uncategorized',
        primaryUOM: i.uom?.code || 'PCS',
        status: i.status === 'ACTIVE' ? 'active' : 'inactive',
        type: i.itemType ? i.itemType.toLowerCase() : 'raw_material'
      }));
      setItems(mappedData);
      setFilteredItems(mappedData);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, filterCategory, filterType, filterStatus]);

  const handleCreateItem = () => {
    setSelectedItem(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setSelectedItem(item);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewItem = (item: Item) => {
    setSelectedItem(item);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'discontinued': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'raw_material': return 'bg-blue-100 text-blue-800';
      case 'finished_good': return 'bg-green-100 text-green-800';
      case 'semi_finished': return 'bg-yellow-100 text-yellow-800';
      case 'service': return 'bg-purple-100 text-purple-800';
      case 'asset': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTypeLabel = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const ItemModal = () => {
    const [formData, setFormData] = useState<Partial<Item>>(
      selectedItem || {
        itemCode: '',
        itemName: '',
        shortName: '',
        description: '',
        category: '',
        type: 'raw_material',
        status: 'active',
        primaryUOM: '',
        inventoryManaged: true,
        serialized: false,
        batchTracked: false,
        expiryTracked: false,
        qualityInspectionRequired: false
      }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Submitting:', formData);
      setIsModalOpen(false);
    };

    const isViewMode = modalMode === 'view';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full  max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-3 border-b">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              {modalMode === 'create' ? 'Create Item' : modalMode === 'edit' ? 'Edit Item' : 'Item Details'}
            </h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-3">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Item Code *</label>
                <input
                  type="text"
                  value={formData.itemCode || ''}
                  onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="AUTO-GENERATED"
                  disabled={isViewMode}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Item Type *</label>
                <select
                  value={formData.type || ''}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Item['type'] })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isViewMode}
                  required
                >
                  <option value="raw_material">Raw Material</option>
                  <option value="finished_good">Finished Good</option>
                  <option value="semi_finished">Semi Finished</option>
                  <option value="service">Service</option>
                  <option value="asset">Asset</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Item['status'] })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isViewMode}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="discontinued">Discontinued</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Item Name *</label>
                <input
                  type="text"
                  value={formData.itemName || ''}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Full item name"
                  disabled={isViewMode}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Short Name</label>
                <input
                  type="text"
                  value={formData.shortName || ''}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Short display name"
                  disabled={isViewMode}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Detailed description"
                disabled={isViewMode}
              />
            </div>

            {/* Classification */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-3">Classification</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sub Category</label>
                  <input
                    type="text"
                    value={formData.subCategory || ''}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Brand</label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">HSN/SAC Code</label>
                  <input
                    type="text"
                    value={formData.hsn_sac_code || ''}
                    onChange={(e) => setFormData({ ...formData, hsn_sac_code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </div>

            {/* Units & Measurements */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-3">Units & Measurements</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Primary UOM *</label>
                  <select
                    value={formData.primaryUOM || ''}
                    onChange={(e) => setFormData({ ...formData, primaryUOM: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode}
                    required
                  >
                    <option value="">Select UOM</option>
                    <option value="PCS">Pieces</option>
                    <option value="KG">Kilograms</option>
                    <option value="M">Meters</option>
                    <option value="SQM">Square Meters</option>
                    <option value="SET">Set</option>
                    <option value="LTR">Liters</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Secondary UOM</label>
                  <select
                    value={formData.secondaryUOM || ''}
                    onChange={(e) => setFormData({ ...formData, secondaryUOM: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode}
                  >
                    <option value="">Select UOM</option>
                    <option value="PCS">Pieces</option>
                    <option value="KG">Kilograms</option>
                    <option value="M">Meters</option>
                    <option value="SQM">Square Meters</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Conversion Factor</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.conversionFactor || ''}
                    onChange={(e) => setFormData({ ...formData, conversionFactor: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </div>

            {/* Inventory Settings */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-3">Inventory Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.inventoryManaged || false}
                      onChange={(e) => setFormData({ ...formData, inventoryManaged: e.target.checked })}
                      disabled={isViewMode}
                      className="rounded"
                    />
                    <span className="text-sm">Inventory Managed</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.serialized || false}
                      onChange={(e) => setFormData({ ...formData, serialized: e.target.checked })}
                      disabled={isViewMode}
                      className="rounded"
                    />
                    <span className="text-sm">Serialized</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.batchTracked || false}
                      onChange={(e) => setFormData({ ...formData, batchTracked: e.target.checked })}
                      disabled={isViewMode}
                      className="rounded"
                    />
                    <span className="text-sm">Batch Tracked</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.expiryTracked || false}
                      onChange={(e) => setFormData({ ...formData, expiryTracked: e.target.checked })}
                      disabled={isViewMode}
                      className="rounded"
                    />
                    <span className="text-sm">Expiry Tracked</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.qualityInspectionRequired || false}
                      onChange={(e) => setFormData({ ...formData, qualityInspectionRequired: e.target.checked })}
                      disabled={isViewMode}
                      className="rounded"
                    />
                    <span className="text-sm">Quality Inspection Required</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {isViewMode ? 'Close' : 'Cancel'}
              </button>
              {!isViewMode && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {modalMode === 'create' ? 'Create Item' : 'Update Item'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Package className="h-6 w-6" />
              Item Master
            </h2>
            <p className="text-gray-600">Manage product catalog and inventory items</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button
              onClick={handleCreateItem}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3 mb-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center border rounded-lg px-3 py-2 flex-1 min-w-64">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search items..."
              className="outline-none flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border rounded-lg"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Raw Materials">Raw Materials</option>
            <option value="Hardware">Hardware</option>
            <option value="Finished Goods">Finished Goods</option>
          </select>
          <select
            className="px-3 py-2 border rounded-lg"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="raw_material">Raw Material</option>
            <option value="finished_good">Finished Good</option>
            <option value="semi_finished">Semi Finished</option>
            <option value="service">Service</option>
            <option value="asset">Asset</option>
          </select>
          <select
            className="px-3 py-2 border rounded-lg"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="discontinued">Discontinued</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Items Display */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-gray-500">Loading items...</p>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.shortName || item.itemName}</h3>
                      <p className="text-sm text-gray-600">{item.itemCode}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(item.type)}`}>
                      {formatTypeLabel(item.type)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-2">
                  <p className="text-sm text-gray-700 line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{item.category}</span>
                    <span>•</span>
                    <span>{item.primaryUOM}</span>
                  </div>
                  {item.standardSellingPrice && (
                    <div className="flex items-center gap-1 text-sm">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">${item.standardSellingPrice}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewItem(item)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditItem(item)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                      title="Edit Item"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded" title="Delete Item">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <button className="p-2 text-gray-600 hover:text-gray-800 rounded">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Item Code</th>
                  <th className="text-left py-3 px-4">Item Name</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">UOM</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{item.itemCode}</td>
                    <td className="py-3 px-4">{item.itemName}</td>
                    <td className="py-3 px-4">{item.category}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(item.type)}`}>
                        {formatTypeLabel(item.type)}
                      </span>
                    </td>
                    <td className="py-3 px-4">{item.primaryUOM}</td>
                    <td className="py-3 px-4">
                      {item.standardSellingPrice && `$${item.standardSellingPrice}`}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewItem(item)}
                          className="p-1 text-gray-600 hover:text-blue-600"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-1 text-gray-600 hover:text-green-600"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-600 hover:text-red-600" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredItems.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <Package className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500 mb-2">
              {searchTerm || filterCategory !== 'all' || filterType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first item'
              }
            </p>
            {!searchTerm && filterCategory === 'all' && filterType === 'all' && filterStatus === 'all' && (
              <button
                onClick={handleCreateItem}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && <ItemModal />}
    </div>
  );
};

export default ItemMaster;