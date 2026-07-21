'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Tag, Plus, Search, Filter, Edit2, Trash2, MoreVertical,
  Users, TrendingUp, DollarSign, Percent, Calendar, Shield,
  CheckCircle2, XCircle, AlertCircle, Award, Star, Target
} from 'lucide-react';
import { commonMastersService, CustomerCategory } from '@/services/common-masters.service';

export default function CustomerCategoryMaster() {
  const [categories, setCategories] = useState<CustomerCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CustomerCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClassification, setFilterClassification] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [currentTab, setCurrentTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await commonMastersService.getAllCustomerCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load customer categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: CustomerCategory) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
    setCurrentTab('basic');
  };

  const companyId = 'MAIN_COMPANY_ID';

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This may affect customer classifications.')) return;
    try {
      await commonMastersService.deleteCustomerCategory(id);
      await loadCategories();
    } catch (error) {
      console.error('Failed to delete customer category:', error);
      alert('Failed to delete customer category.');
    }
  };

  const handleSave = async (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const code = String(fd.get('code') || '').trim();
    const name = String(fd.get('name') || '').trim();
    if (!code || !name) {
      alert('Category code and name are required.');
      return;
    }
    const payload = {
      code,
      name,
      description: String(fd.get('description') || ''),
      level: String(fd.get('level') || ''),
      classification: String(fd.get('classification') || ''),
      status: String(fd.get('status') || 'Active'),
      color: String(fd.get('color') || ''),
      icon: String(fd.get('icon') || ''),
    };
    try {
      if (selectedCategory) {
        await commonMastersService.updateCustomerCategory(selectedCategory.id, payload);
      } else {
        await commonMastersService.createCustomerCategory({ ...payload, companyId });
      }
      setIsModalOpen(false);
      await loadCategories();
    } catch (error) {
      console.error('Failed to save customer category:', error);
      alert('Failed to save customer category.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      'Inactive': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
      'Archived': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle }
    };
    const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig['Inactive'];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3" />
        {status || 'Unknown'}
      </span>
    );
  };

  const getClassificationBadge = (classification: string) => {
    const classConfig = {
      'VIP': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Award },
      'Premium': { bg: 'bg-purple-100', text: 'text-purple-800', icon: Star },
      'Standard': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Users },
      'Basic': { bg: 'bg-gray-100', text: 'text-gray-800', icon: Users }
    };
    const config = classConfig[classification as keyof typeof classConfig];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3" />
        {classification}
      </span>
    );
  };

  const getLevelBadge = (level: string) => {
    const levelConfig = {
      'Primary': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
      'Secondary': { bg: 'bg-cyan-100', text: 'text-cyan-800' },
      'Tertiary': { bg: 'bg-teal-100', text: 'text-teal-800' }
    };
    const config = levelConfig[level as keyof typeof levelConfig];
    if (!config) return null;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {level}
      </span>
    );
  };

  const getMetricCard = (label: string, value: number | string, icon: any, color: string) => {
    const Icon = icon;
    return (
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-lg font-semibold ${color}`}>{value}</p>
          </div>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
    );
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClassification = filterClassification === 'All' || category.classification === filterClassification;
      const matchesStatus = filterStatus === 'All' || category.status === filterStatus;
      return matchesSearch && matchesClassification && matchesStatus;
    });
  }, [categories, searchTerm, filterClassification, filterStatus]);

  return (
    <div className="p-6 ">
      <div className="mb-3">
        <h2 className="text-2xl font-bold mb-2">Customer Category Master</h2>
        <p className="text-gray-600">Define and manage customer classification categories</p>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {getMetricCard('Total Categories', categories.length, Tag, 'text-blue-600')}
        {getMetricCard(
          'Total Customers',
          categories.reduce((sum, c) => sum + (c.metrics?.customerCount ?? 0), 0).toLocaleString(),
          Users,
          'text-green-600'
        )}
        {getMetricCard(
          'Total Revenue',
          `₹${(categories.reduce((sum, c) => sum + (c.metrics?.totalRevenue ?? 0), 0) / 1000000).toFixed(1)}M`,
          DollarSign,
          'text-purple-600'
        )}
        {getMetricCard(
          'Avg Churn Rate',
          `${(categories.reduce((sum, c) => sum + (c.metrics?.churnRate ?? 0), 0) / (categories.length || 1)).toFixed(1)}%`,
          TrendingUp,
          'text-orange-600'
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterClassification}
                onChange={(e) => setFilterClassification(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Classifications</option>
                <option value="VIP">VIP</option>
                <option value="Premium">Premium</option>
                <option value="Standard">Standard</option>
                <option value="Basic">Basic</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setIsModalOpen(true);
                setCurrentTab('basic');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classification
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criteria
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Benefits
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metrics
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.icon || category.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        <div className="text-sm text-gray-500">{category.code}</div>
                        {category.description && (
                          <div className="text-xs text-gray-400 max-w-xs truncate">
                            {category.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      {getClassificationBadge(category.classification ?? '')}
                      {getLevelBadge(category.level ?? '')}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm space-y-1">
                      {category.criteria?.minRevenue && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-gray-400" />
                          <span>₹{(category.criteria.minRevenue / 100000).toFixed(1)}L+</span>
                        </div>
                      )}
                      {category.criteria?.minOrders && (
                        <div className="text-xs text-gray-500">
                          Min Orders: {category.criteria.minOrders}
                        </div>
                      )}
                      {category.criteria?.creditScore && (
                        <div className="text-xs text-gray-500">
                          Credit: {category.criteria.creditScore}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-1">
                        <Percent className="h-3 w-3 text-gray-400" />
                        <span>{category.benefits?.discountPercent ?? 0}% discount</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {category.benefits?.creditDays ?? 0} days credit
                      </div>
                      <div className="flex gap-1">
                        {category.benefits?.prioritySupport && (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                            Priority
                          </span>
                        )}
                        {category.benefits?.freeShipping && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                            Free Ship
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span>{category.metrics?.customerCount ?? 0} customers</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        ₹{((category.metrics?.totalRevenue ?? 0) / 1000000).toFixed(1)}M revenue
                      </div>
                      <div className="text-xs text-gray-500">
                        Churn: {category.metrics?.churnRate ?? 0}%
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {getStatusBadge(category.status)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-800"
                      >
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full  max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {selectedCategory ? 'Edit Customer Category' : 'Add New Customer Category'}
              </h3>
            </div>

            <div className="flex border-b border-gray-200">
              {['basic', 'criteria', 'benefits', 'terms', 'targets'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`px-4 py-2 font-medium capitalize ${currentTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab === 'basic' ? 'Basic Info' : tab}
                </button>
              ))}
            </div>

            <form
              id="customer-category-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave(e.currentTarget);
              }}
              className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]"
            >
              {currentTab === 'basic' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Code *
                      </label>
                      <input
                        type="text"
                        name="code"
                        defaultValue={selectedCategory?.code}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="CAT-XXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={selectedCategory?.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter category name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      defaultValue={selectedCategory?.description}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Enter category description"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Level *
                      </label>
                      <select name="level" defaultValue={selectedCategory?.level || 'Primary'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="Primary">Primary</option>
                        <option value="Secondary">Secondary</option>
                        <option value="Tertiary">Tertiary</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Classification *
                      </label>
                      <select name="classification" defaultValue={selectedCategory?.classification || 'Standard'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="VIP">VIP</option>
                        <option value="Premium">Premium</option>
                        <option value="Standard">Standard</option>
                        <option value="Basic">Basic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select name="status" defaultValue={selectedCategory?.status || 'Active'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color Theme
                      </label>
                      <input
                        type="color"
                        name="color"
                        defaultValue={selectedCategory?.color || '#3B82F6'}
                        className="w-full h-10 px-1 py-1 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Icon/Emoji
                      </label>
                      <input
                        type="text"
                        name="icon"
                        defaultValue={selectedCategory?.icon}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Optional icon or emoji"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'criteria' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Revenue (Annual)
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedCategory?.criteria?.minRevenue}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Orders (Annual)
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedCategory?.criteria?.minOrders}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Retention (Months)
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedCategory?.criteria?.minRetention}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Credit Score
                      </label>
                      <select defaultValue={selectedCategory?.criteria?.creditScore}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">No requirement</option>
                        <option value="AAA">AAA</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'benefits' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount Percentage *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={selectedCategory?.benefits?.discountPercent}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Credit Days *
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedCategory?.benefits?.creditDays}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Credit Limit *
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedCategory?.benefits?.creditLimit}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={selectedCategory?.benefits?.prioritySupport}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Priority Support</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={selectedCategory?.benefits?.freeShipping}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Free Shipping</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={selectedCategory?.benefits?.dedicatedManager}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Dedicated Account Manager</span>
                    </label>
                  </div>
                </div>
              )}

              {currentTab === 'terms' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Terms *
                      </label>
                      <select defaultValue={selectedCategory?.terms?.paymentTerms || 'Net 30'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="COD">Cash on Delivery</option>
                        <option value="Net 15">Net 15</option>
                        <option value="Net 30">Net 30</option>
                        <option value="Net 45">Net 45</option>
                        <option value="Net 60">Net 60</option>
                        <option value="Net 90">Net 90</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Priority *
                      </label>
                      <select defaultValue={selectedCategory?.terms?.deliveryPriority || 'Medium'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Return Policy
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCategory?.terms?.returnPolicy}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 30 days"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Warranty Extension (Months)
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedCategory?.terms?.warrantyExtension}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'targets' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Revenue Target (Annual)
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedCategory?.targets?.revenueTarget}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Growth Target (%)
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedCategory?.targets?.growthTarget}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Retention Target (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={selectedCategory?.targets?.retentionTarget}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}
            </form>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="customer-category-form"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {selectedCategory ? 'Update' : 'Create'} Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}