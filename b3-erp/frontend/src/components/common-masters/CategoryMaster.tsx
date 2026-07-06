'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Folder, FolderTree, Package, DollarSign, TrendingUp, Download, Upload, Grid, List, ChevronRight, ChevronDown } from 'lucide-react';
import { commonMastersService } from '@/services/common-masters.service';

interface Category {
  id: string;
  categoryCode: string;
  categoryName: string;
  parentId?: string;
  level: number;
  status: 'active' | 'inactive';
  description: string;
  categoryType: 'product' | 'item' | 'service' | 'general';
  attributes: {
    hasSubcategories: boolean;
    allowItems: boolean;
    requiresApproval: boolean;
  };
  businessRules: {
    minMargin: number;
    maxDiscount: number;
    taxCategory: string;
    accountingCode: string;
  };
  statistics: {
    itemCount: number;
    totalValue: number;
    averagePrice: number;
    lastModified: string;
  };
  displaySettings: {
    icon?: string;
    color?: string;
    sortOrder: number;
    showInCatalog: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

const categoryTypes = ['product', 'item', 'service', 'general'];
const taxCategories = ['Standard', 'Exempt', 'Reduced', 'Zero-rated'];
const icons = ['cabinet', 'base-cabinet', 'wall-cabinet', 'hardware', 'hinge', 'handle', 'slide'];

export default function CategoryMaster() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '4']));
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await commonMastersService.getAllItemCategories();
      const mapped: Category[] = data.map((c) => ({
        id: c.id,
        categoryCode: '',
        categoryName: c.name,
        level: 1,
        status: c.isActive ? 'active' : 'inactive',
        description: '',
        categoryType: 'product',
        attributes: {
          hasSubcategories: false,
          allowItems: true,
          requiresApproval: false,
        },
        businessRules: {
          minMargin: 0,
          maxDiscount: 0,
          taxCategory: 'Standard',
          accountingCode: '',
        },
        statistics: {
          itemCount: 0,
          totalValue: 0,
          averagePrice: 0,
          lastModified: '',
        },
        displaySettings: {
          icon: 'cabinet',
          color: '#3B82F6',
          sortOrder: 1,
          showInCatalog: true,
        },
        createdAt: '',
        updatedAt: '',
      }));
      setCategories(mapped);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.categoryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || category.categoryType === filterType;
    const matchesStatus = filterStatus === 'all' || category.status === filterStatus;
    const matchesLevel = filterLevel === 'all' || category.level.toString() === filterLevel;

    return matchesSearch && matchesType && matchesStatus && matchesLevel;
  });

  const buildCategoryTree = (categories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category[]>();
    const rootCategories: Category[] = [];

    categories.forEach(category => {
      if (category.parentId) {
        if (!categoryMap.has(category.parentId)) {
          categoryMap.set(category.parentId, []);
        }
        categoryMap.get(category.parentId)!.push(category);
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories.sort((a, b) => a.displaySettings.sortOrder - b.displaySettings.sortOrder);
  };

  const getChildCategories = (parentId: string): Category[] => {
    return categories
      .filter(cat => cat.parentId === parentId)
      .sort((a, b) => a.displaySettings.sortOrder - b.displaySettings.sortOrder);
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleAddCategory = (parentId?: string) => {
    const parentCategory = parentId ? categories.find(c => c.id === parentId) : null;
    setEditingCategory({
      id: '',
      categoryCode: '',
      categoryName: '',
      parentId: parentId,
      level: parentCategory ? parentCategory.level + 1 : 1,
      status: 'active',
      description: '',
      categoryType: 'product',
      attributes: {
        hasSubcategories: false,
        allowItems: true,
        requiresApproval: false
      },
      businessRules: {
        minMargin: 25,
        maxDiscount: 15,
        taxCategory: 'Standard',
        accountingCode: ''
      },
      statistics: {
        itemCount: 0,
        totalValue: 0,
        averagePrice: 0,
        lastModified: new Date().toISOString().split('T')[0]
      },
      displaySettings: {
        icon: 'cabinet',
        color: '#3B82F6',
        sortOrder: 1,
        showInCatalog: true
      },
      createdAt: '',
      updatedAt: ''
    } as Category);
    setShowModal(true);
    setActiveTab('basic');
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowModal(true);
    setActiveTab('basic');
  };

  const handleDeleteCategory = async (id: string) => {
    const hasChildren = categories.some(cat => cat.parentId === id);
    if (hasChildren) {
      alert('Cannot delete category with subcategories. Please delete subcategories first.');
      return;
    }
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await commonMastersService.deleteItemCategory(id);
        await loadCategories();
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const handleSaveCategory = async (categoryData: any) => {
    try {
      if (editingCategory?.id) {
        await commonMastersService.updateItemCategory(editingCategory.id, {
          name: categoryData.categoryName,
          isActive: categoryData.status !== 'inactive',
        });
      } else {
        await commonMastersService.createItemCategory({
          name: categoryData.categoryName,
          companyId: 'default-company-id',
        });
      }
      await loadCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
    setShowModal(false);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`;
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      product: 'bg-blue-100 text-blue-800',
      item: 'bg-green-100 text-green-800',
      service: 'bg-purple-100 text-purple-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[type as keyof typeof colors]}`;
  };

  const renderTreeNode = (category: Category, depth = 0): React.ReactNode => {
    const children = getChildCategories(category.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(category.id);
    const paddingLeft = depth * 24;

    return (
      <div key={category.id}>
        <div
          className="flex items-center py-2 px-4 hover:bg-gray-50 border-b border-gray-100"
          style={{ paddingLeft: `${paddingLeft + 16}px` }}
        >
          <div className="flex items-center flex-1 min-w-0">
            {hasChildren ? (
              <button
                onClick={() => toggleExpanded(category.id)}
                className="mr-2 p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
            ) : (
              <div className="w-6 mr-2" />
            )}

            <Folder
              className="w-5 h-5 mr-3 text-gray-400"
              style={{ color: category.displaySettings.color }}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 truncate">{category.categoryName}</span>
                <span className="text-sm text-gray-500">({category.categoryCode})</span>
                <span className={getStatusBadge(category.status)}>
                  {category.status}
                </span>
                <span className={getTypeBadge(category.categoryType)}>
                  {category.categoryType}
                </span>
              </div>
              <div className="text-sm text-gray-500 truncate">{category.description}</div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <div className="text-sm text-gray-600">
                {category.statistics.itemCount} items
              </div>
              <div className="text-sm text-gray-600">
                ${category.statistics.totalValue.toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddCategory(category.id)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Add Subcategory"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditCategory(category)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FolderTree className="w-8 h-8 text-blue-600" />
              Category Master
            </h1>
            <p className="text-gray-600">Manage product and item categories in hierarchical structure</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => handleAddCategory()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            {categoryTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
          </select>
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-2 ${viewMode === 'tree' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FolderTree className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'tree' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200 px-3 py-2 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Category Hierarchy</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setExpandedNodes(new Set(categories.map(c => c.id)))}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Expand All
                </button>
                <button
                  onClick={() => setExpandedNodes(new Set())}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Collapse All
                </button>
              </div>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {buildCategoryTree(filteredCategories).map(category => renderTreeNode(category))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Level</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Rules</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statistics</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{category.categoryName}</div>
                        <div className="text-sm text-gray-500">{category.categoryCode}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{category.description}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={getTypeBadge(category.categoryType)}>
                          {category.categoryType}
                        </span>
                        <div className="text-sm text-gray-500">Level {category.level}</div>
                        {category.parentId && (
                          <div className="text-xs text-gray-400">
                            Parent: {categories.find(c => c.id === category.parentId)?.categoryName}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Min Margin: {category.businessRules.minMargin}%
                      </div>
                      <div className="text-sm text-gray-500">
                        Max Discount: {category.businessRules.maxDiscount}%
                      </div>
                      <div className="text-sm text-gray-500">
                        Tax: {category.businessRules.taxCategory}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{category.statistics.itemCount} items</div>
                      <div className="text-sm text-gray-500">${category.statistics.totalValue.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Avg: ${category.statistics.averagePrice}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={getStatusBadge(category.status)}>
                        {category.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddCategory(category.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Add Subcategory"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">Edit</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <Eye className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">View</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                        >
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
        </div>
      )}

      {showModal && (
        <CategoryModal
          category={editingCategory}
          categories={categories}
          onSave={handleSaveCategory}
          onClose={() => setShowModal(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
}

interface CategoryModalProps {
  category: Category | null;
  categories: Category[];
  onSave: (category: any) => void;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

function CategoryModal({ category, categories, onSave, onClose, activeTab, setActiveTab }: CategoryModalProps) {
  const [formData, setFormData] = useState({
    categoryCode: category?.categoryCode || '',
    categoryName: category?.categoryName || '',
    parentId: category?.parentId || '',
    level: category?.level || 1,
    status: category?.status || 'active',
    description: category?.description || '',
    categoryType: category?.categoryType || 'product',
    attributes: category?.attributes || {
      hasSubcategories: false,
      allowItems: true,
      requiresApproval: false
    },
    businessRules: category?.businessRules || {
      minMargin: 25,
      maxDiscount: 15,
      taxCategory: 'Standard',
      accountingCode: ''
    },
    displaySettings: category?.displaySettings || {
      icon: 'cabinet',
      color: '#3B82F6',
      sortOrder: 1,
      showInCatalog: true
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Folder },
    { id: 'rules', label: 'Business Rules', icon: DollarSign },
    { id: 'display', label: 'Display Settings', icon: Eye }
  ];

  const availableParents = categories.filter(cat =>
    cat.id !== category?.id &&
    cat.level < 3 &&
    cat.attributes.hasSubcategories
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {category?.id ? 'Edit Category' : 'Add New Category'}
          </h2>
        </div>

        <div className="flex border-b border-gray-200">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-96">
          <div className="px-3 py-2">
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Code</label>
                  <input
                    type="text"
                    value={formData.categoryCode}
                    onChange={(e) => setFormData({...formData, categoryCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={formData.categoryName}
                    onChange={(e) => setFormData({...formData, categoryName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData({...formData, parentId: e.target.value, level: e.target.value ? 2 : 1})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">None (Root Level)</option>
                    {availableParents.map(parent => (
                      <option key={parent.id} value={parent.id}>
                        {parent.categoryName} ({parent.categoryCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Type</label>
                  <select
                    value={formData.categoryType}
                    onChange={(e) => setFormData({...formData, categoryType: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categoryTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category Attributes</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.attributes.hasSubcategories}
                        onChange={(e) => setFormData({...formData, attributes: {...formData.attributes, hasSubcategories: e.target.checked}})}
                        className="mr-2"
                      />
                      Has Subcategories
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.attributes.allowItems}
                        onChange={(e) => setFormData({...formData, attributes: {...formData.attributes, allowItems: e.target.checked}})}
                        className="mr-2"
                      />
                      Allow Items
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.attributes.requiresApproval}
                        onChange={(e) => setFormData({...formData, attributes: {...formData.attributes, requiresApproval: e.target.checked}})}
                        className="mr-2"
                      />
                      Requires Approval
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Margin (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.businessRules.minMargin}
                    onChange={(e) => setFormData({...formData, businessRules: {...formData.businessRules, minMargin: Number(e.target.value)}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.businessRules.maxDiscount}
                    onChange={(e) => setFormData({...formData, businessRules: {...formData.businessRules, maxDiscount: Number(e.target.value)}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Category</label>
                  <select
                    value={formData.businessRules.taxCategory}
                    onChange={(e) => setFormData({...formData, businessRules: {...formData.businessRules, taxCategory: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {taxCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accounting Code</label>
                  <input
                    type="text"
                    value={formData.businessRules.accountingCode}
                    onChange={(e) => setFormData({...formData, businessRules: {...formData.businessRules, accountingCode: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'display' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Color</label>
                  <input
                    type="color"
                    value={formData.displaySettings.color}
                    onChange={(e) => setFormData({...formData, displaySettings: {...formData.displaySettings, color: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.displaySettings.sortOrder}
                    onChange={(e) => setFormData({...formData, displaySettings: {...formData.displaySettings, sortOrder: Number(e.target.value)}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.displaySettings.showInCatalog}
                      onChange={(e) => setFormData({...formData, displaySettings: {...formData.displaySettings, showInCatalog: e.target.checked}})}
                      className="mr-2"
                    />
                    Show in Catalog
                  </label>
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="px-3 py-2 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {category?.id ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </div>
    </div>
  );
}