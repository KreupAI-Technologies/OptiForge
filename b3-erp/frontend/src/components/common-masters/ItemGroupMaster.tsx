'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes, Plus, Search, Filter, Edit3, Eye, Trash2, Upload,
  Download, Save, X, MoreVertical, CheckCircle, XCircle,
  AlertCircle, Grid, List, Tag, Package, TrendingUp, DollarSign
} from 'lucide-react';
import { commonMastersService } from '@/services/common-masters.service';
import { pickAndParseCsv } from '@/lib/import';


interface ItemGroup {
  id: string;
  groupCode: string;
  groupName: string;
  description: string;
  category?: string;
  status: 'active' | 'inactive';

  // Configuration
  attributes: {
    allowDiscounts: boolean;
    allowPriceOverride: boolean;
    requireApproval: boolean;
    trackMargins: boolean;
  };

  // Pricing
  pricingRules: {
    defaultMarkup?: number;
    minMargin?: number;
    maxDiscount?: number;
    priceListAssociation?: string[];
  };

  // Business Rules
  businessRules: {
    taxable: boolean;
    defaultTaxRate?: number;
    defaultTaxType?: string;
    allowBackorders: boolean;
    returnPolicy?: string;
  };

  // Reporting
  reportingGroup?: string;
  profitCenter?: string;

  // Statistics
  statistics: {
    itemCount: number;
    activeItemsCount: number;
    totalRevenue?: number;
    averageMargin?: number;
  };

  // System Fields
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

const ItemGroupMaster: React.FC = () => {
  const [groups, setGroups] = useState<ItemGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<ItemGroup[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ItemGroup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data
  const mockGroups: ItemGroup[] = [
    {
      id: 'GRP001',
      groupCode: 'PREMIUM-KIT',
      groupName: 'Premium Kitchen Solutions',
      description: 'High-end modular kitchen products',
      category: 'Finished Goods',
      status: 'active',
      attributes: {
        allowDiscounts: true,
        allowPriceOverride: false,
        requireApproval: true,
        trackMargins: true
      },
      pricingRules: {
        defaultMarkup: 45,
        minMargin: 30,
        maxDiscount: 15
      },
      businessRules: {
        taxable: true,
        defaultTaxRate: 18,
        defaultTaxType: 'GST',
        allowBackorders: true,
        returnPolicy: '30 days'
      },
      reportingGroup: 'Kitchen Products',
      profitCenter: 'Manufacturing',
      statistics: {
        itemCount: 45,
        activeItemsCount: 42,
        totalRevenue: 2500000,
        averageMargin: 38.5
      },
      createdBy: 'admin',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'GRP002',
      groupCode: 'ECO-KIT',
      groupName: 'Economy Kitchen Range',
      description: 'Budget-friendly kitchen solutions',
      category: 'Finished Goods',
      status: 'active',
      attributes: {
        allowDiscounts: true,
        allowPriceOverride: true,
        requireApproval: false,
        trackMargins: true
      },
      pricingRules: {
        defaultMarkup: 25,
        minMargin: 15,
        maxDiscount: 20
      },
      businessRules: {
        taxable: true,
        defaultTaxRate: 18,
        defaultTaxType: 'GST',
        allowBackorders: false
      },
      reportingGroup: 'Kitchen Products',
      profitCenter: 'Manufacturing',
      statistics: {
        itemCount: 67,
        activeItemsCount: 65,
        totalRevenue: 1800000,
        averageMargin: 22.3
      },
      createdBy: 'admin',
      createdAt: '2024-01-20T10:00:00Z'
    },
    {
      id: 'GRP003',
      groupCode: 'RAW-WOOD',
      groupName: 'Timber & Wood Materials',
      description: 'All wood-based raw materials',
      category: 'Raw Materials',
      status: 'active',
      attributes: {
        allowDiscounts: false,
        allowPriceOverride: true,
        requireApproval: true,
        trackMargins: false
      },
      pricingRules: {
        defaultMarkup: 0,
        maxDiscount: 5
      },
      businessRules: {
        taxable: true,
        defaultTaxRate: 12,
        defaultTaxType: 'GST',
        allowBackorders: true
      },
      reportingGroup: 'Raw Materials',
      profitCenter: 'Procurement',
      statistics: {
        itemCount: 125,
        activeItemsCount: 118,
        totalRevenue: 0
      },
      createdBy: 'admin',
      createdAt: '2024-01-10T10:00:00Z'
    }
  ];

  useEffect(() => {
    loadItemGroups();
  }, [searchTerm, filterStatus]);

  const loadItemGroups = async () => {
    try {
      const data = await commonMastersService.getAllItemGroups();
      // Map API data to component interface
      const mappedData: any[] = data.map(g => ({
        ...g,
        groupCode: g.id.substring(0, 8).toUpperCase(),
        groupName: g.name,
        categoryId: g.categoryId,
        category: g.category?.name || 'Uncategorized',
        status: g.isActive ? 'active' : 'inactive',
        statistics: { itemCount: 0, activeItemsCount: 0 }
      }));
      setGroups(mappedData);
      setFilteredGroups(mappedData);
    } catch (error) {
      console.error('Failed to load item groups:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await commonMastersService.getAllItemCategories();
      setCategories(data.map(c => ({ id: c.id, name: c.name })));
    } catch (error) {
      console.error('Failed to load item categories:', error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const companyId = 'MAIN_COMPANY_ID';

  const handleAddGroup = () => {
    setSelectedGroup(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditGroup = (group: ItemGroup) => {
    setSelectedGroup(group);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item group?')) return;
    try {
      await commonMastersService.deleteItemGroup(id);
      await loadItemGroups();
    } catch (error) {
      console.error('Failed to delete item group:', error);
      alert('Failed to delete item group.');
    }
  };

  const handleSaveGroup = async (form: { name: string; categoryId: string; isActive: boolean }) => {
    if (!form.name.trim()) {
      alert('Group name is required.');
      return;
    }
    if (!form.categoryId) {
      alert('Category is required.');
      return;
    }
    try {
      if (modalMode === 'edit' && selectedGroup) {
        await commonMastersService.updateItemGroup(selectedGroup.id, {
          name: form.name,
          categoryId: form.categoryId,
          isActive: form.isActive,
        });
      } else {
        await commonMastersService.createItemGroup({
          name: form.name,
          categoryId: form.categoryId,
          companyId,
        });
      }
      setIsModalOpen(false);
      await loadItemGroups();
    } catch (error) {
      console.error('Failed to save item group:', error);
      alert('Failed to save item group.');
    }
  };

  const handleImport = async () => {
    try {
      const rows = await pickAndParseCsv();
      if (!rows) return;
      if (rows.length === 0) { alert('The selected CSV file has no data rows.'); return; }
      const result = await commonMastersService.bulkCreate('item-groups', rows, companyId);
      await loadItemGroups();
      alert(`Import complete: ${result.created} created, ${result.skipped} skipped (of ${result.total} rows).`);
    } catch (error) {
      console.error('Error importing item groups:', error);
      alert('Import failed. Please check the CSV format and try again.');
    }
  };


  useEffect(() => {
    let filtered = groups;
    if (searchTerm) {
      filtered = filtered.filter(g =>
        g.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.groupCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(g => g.status === filterStatus);
    }
    setFilteredGroups(filtered);
  }, [groups, searchTerm, filterStatus]);

  const getStatusColor = (status: string) =>
    status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Boxes className="w-8 h-8 text-blue-600" />
                Item Group Master
              </h1>
              <p className="text-gray-600 mt-2">Manage item groups for pricing and reporting</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleImport} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button onClick={handleAddGroup} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Group
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Groups</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{groups.length}</p>
              </div>
              <Boxes className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Groups</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {groups.filter(g => g.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {groups.reduce((sum, g) => sum + g.statistics.itemCount, 0)}
                </p>
              </div>
              <Package className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${(groups.reduce((sum, g) => sum + (g.statistics.totalRevenue || 0), 0) / 1000000).toFixed(1)}M
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Groups List/Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredGroups.map(group => (
              <div key={group.id} className="bg-white rounded-lg shadow-sm p-3 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Boxes className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
                    {group.status}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{group.groupName}</h3>
                <p className="text-xs text-gray-500 mb-2">{group.groupCode}</p>
                <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{group.statistics.itemCount}</span>
                  </div>
                  {group.pricingRules.defaultMarkup && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Markup:</span>
                      <span className="font-medium">{group.pricingRules.defaultMarkup}%</span>
                    </div>
                  )}
                  {group.statistics.averageMargin && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Margin:</span>
                      <span className="font-medium text-green-600">{group.statistics.averageMargin}%</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button onClick={() => handleEditGroup(group)} className="flex-1 px-3 py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50 flex items-center justify-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button onClick={() => handleDeleteGroup(group.id)} className="flex-1 px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Markup</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGroups.map(group => (
                  <tr key={group.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div>
                        <div className="font-medium text-gray-900">{group.groupName}</div>
                        <div className="text-sm text-gray-500">{group.groupCode}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-600">{group.category}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{group.statistics.itemCount}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {group.pricingRules.defaultMarkup ? `${group.pricingRules.defaultMarkup}%` : '-'}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
                        {group.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button onClick={() => handleEditGroup(group)} className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <Edit3 className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">Edit</span>
                        </button>
                        <button onClick={() => handleDeleteGroup(group.id)} className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm">
                          <Trash2 className="w-4 h-4 text-red-600" />
                          <span className="text-red-600">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ItemGroupModal
          group={selectedGroup}
          categories={categories}
          onSave={handleSaveGroup}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

interface ItemGroupModalProps {
  group: ItemGroup | null;
  categories: { id: string; name: string }[];
  onSave: (form: { name: string; categoryId: string; isActive: boolean }) => void;
  onClose: () => void;
}

function ItemGroupModal({ group, categories, onSave, onClose }: ItemGroupModalProps) {
  const [formData, setFormData] = useState({
    name: group?.groupName || '',
    categoryId: (group as any)?.categoryId || '',
    status: group?.status || 'active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      categoryId: formData.categoryId,
      isActive: formData.status === 'active',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {group ? 'Edit Item Group' : 'Add Item Group'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-4 py-3 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {group ? 'Update Group' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ItemGroupMaster;
