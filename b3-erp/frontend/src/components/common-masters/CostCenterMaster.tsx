'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { commonMastersService } from '@/services/common-masters.service';
import {
  Coins, Plus, Search, Filter, Edit2, Trash2, MoreVertical,
  Building2, TrendingUp, Users, Calendar, DollarSign, Target,
  BarChart2, AlertTriangle, CheckCircle2, XCircle, AlertCircle,
  Calculator, FileText, PieChart, Activity, ChevronRight, ChevronDown
} from 'lucide-react';

interface CostCenter {
  id: string;
  code: string;
  name: string;
  type: 'Main' | 'Support' | 'Production' | 'Service' | 'Administrative';
  category: 'Revenue' | 'Cost' | 'Profit' | 'Investment';
  parentId?: string;
  parentName?: string;
  level: number;
  department?: string;
  branch?: string;
  manager: string;
  budget: {
    annual: number;
    quarterly: number;
    monthly: number;
    allocated: number;
    utilized: number;
    available: number;
    currency: string;
  };
  allocation: {
    method: 'Direct' | 'Step-down' | 'Reciprocal' | 'Activity-based';
    basis: string;
    rate: number;
    drivers: string[];
  };
  accounting: {
    glAccount?: string;
    profitCenter?: string;
    businessUnit?: string;
    segment?: string;
    project?: string;
  };
  expenses: {
    direct: number;
    indirect: number;
    fixed: number;
    variable: number;
    overhead: number;
  };
  performance: {
    efficiency: number;
    variance: number;
    utilizationRate: number;
    costPerUnit?: number;
    roi?: number;
  };
  controls: {
    approvalLimit: number;
    approvers: string[];
    budgetControl: boolean;
    overbudgetAction: 'Block' | 'Warn' | 'Allow';
    reviewCycle: 'Monthly' | 'Quarterly' | 'Annually';
  };
  status: 'Active' | 'Inactive' | 'Blocked' | 'Under Review';
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
  };
}

export default function CostCenterMaster() {
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // ... (keeping other states)
  const [selectedCostCenter, setSelectedCostCenter] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [currentTab, setCurrentTab] = useState('basic');
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('list');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCostCenters();
  }, []);

  const loadCostCenters = async () => {
    try {
      setLoading(true);
      const data = await commonMastersService.getAllCostCenters();
      setCostCenters(data);
    } catch (error) {
      console.error('Failed to load cost centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (costCenter: CostCenter) => {
    setSelectedCostCenter(costCenter);
    setIsModalOpen(true);
    setCurrentTab('basic');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cost center?')) return;
    try {
      await commonMastersService.deleteCostCenter(id);
      await loadCostCenters();
    } catch (error) {
      console.error('Failed to delete cost center:', error);
      alert('Failed to delete cost center.');
    }
  };

  const handleSave = async () => {
    const codeInput = document.querySelector<HTMLInputElement>('input[data-field="cost-center-code"]');
    const nameInput = document.querySelector<HTMLInputElement>('input[data-field="cost-center-name"]');
    const code = codeInput?.value?.trim() || '';
    const name = nameInput?.value?.trim() || '';
    if (!code || !name) {
      alert('Cost Center Code and Name are required.');
      return;
    }
    try {
      if (selectedCostCenter?.id) {
        await commonMastersService.updateCostCenter(selectedCostCenter.id, { code, name });
      } else {
        await commonMastersService.createCostCenter({ code, name, companyId: 'default-company-id' });
      }
      setIsModalOpen(false);
      await loadCostCenters();
    } catch (error) {
      console.error('Failed to save cost center:', error);
      alert('Failed to save cost center.');
    }
  };

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      'Inactive': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
      'Blocked': { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle },
      'Under Review': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'Main': { bg: 'bg-purple-100', text: 'text-purple-800' },
      'Support': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'Production': { bg: 'bg-green-100', text: 'text-green-800' },
      'Service': { bg: 'bg-orange-100', text: 'text-orange-800' },
      'Administrative': { bg: 'bg-gray-100', text: 'text-gray-800' }
    };
    const config = typeConfig[type as keyof typeof typeConfig];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {type}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      'Revenue': { bg: 'bg-green-100', text: 'text-green-800', icon: TrendingUp },
      'Cost': { bg: 'bg-red-100', text: 'text-red-800', icon: DollarSign },
      'Profit': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Target },
      'Investment': { bg: 'bg-purple-100', text: 'text-purple-800', icon: Activity }
    };
    const config = categoryConfig[category as keyof typeof categoryConfig];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3" />
        {category}
      </span>
    );
  };

  const getBudgetUtilization = (budget: any) => {
    const utilization = (budget.utilized / budget.allocated) * 100;
    const color = utilization > 90 ? 'bg-red-500' : utilization > 75 ? 'bg-yellow-500' : 'bg-green-500';
    return (
      <div className="w-full">
        <div className="flex justify-between text-xs mb-1">
          <span>Utilized: ${(budget.utilized / 1000000).toFixed(1)}M</span>
          <span>{utilization.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className={`${color} h-2 rounded-full`} style={{ width: `${utilization}%` }} />
        </div>
      </div>
    );
  };

  const buildCostCenterTree = (centers: CostCenter[]) => {
    const tree: any[] = [];
    const map: { [key: string]: any } = {};

    centers.forEach(center => {
      map[center.id] = { ...center, children: [] };
    });

    centers.forEach(center => {
      if (center.parentId && map[center.parentId]) {
        map[center.parentId].children.push(map[center.id]);
      } else {
        tree.push(map[center.id]);
      }
    });

    return tree;
  };

  const renderTreeNode = (node: any, level: number = 0) => (
    <div key={node.id} className="border rounded-lg mb-2">
      <div className={`flex items-center justify-between p-3 hover:bg-gray-50`}
        style={{ paddingLeft: `${level * 2 + 1}rem` }}>
        <div className="flex items-center gap-3 flex-1">
          {node.children && node.children.length > 0 && (
            <button onClick={() => toggleNode(node.id)} className="p-1">
              {expandedNodes.has(node.id) ?
                <ChevronDown className="h-4 w-4" /> :
                <ChevronRight className="h-4 w-4" />
              }
            </button>
          )}
          <Coins className="h-4 w-4 text-gray-400" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{node.name}</span>
              <span className="text-sm text-gray-500">({node.code})</span>
              {getTypeBadge(node.type)}
              {getCategoryBadge(node.category)}
              {getStatusBadge(node.status)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Manager: {node.manager} | Budget: ${(node.budget.annual / 1000000).toFixed(1)}M
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleEdit(node)}
            className="p-1 hover:bg-gray-100 rounded">
            <Edit2 className="h-4 w-4 text-gray-600" />
          </button>
          <button onClick={() => handleDelete(node.id)}
            className="p-1 hover:bg-red-100 rounded">
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </div>
      {node.children && node.children.length > 0 && expandedNodes.has(node.id) && (
        <div className="border-l-2 border-gray-200 ml-6">
          {node.children.map((child: any) => renderTreeNode(child, level + 1))}
        </div>
      )}
    </div>
  );

  const filteredCostCenters = useMemo(() => {
    return costCenters.filter(cc => {
      const matchesSearch = cc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cc.manager.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All' || cc.type === filterType;
      const matchesCategory = filterCategory === 'All' || cc.category === filterCategory;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [costCenters, searchTerm, filterType, filterCategory]);

  const costCenterTree = buildCostCenterTree(filteredCostCenters);

  return (
    <div className="p-6 ">
      <div className="mb-3">
        <h2 className="text-2xl font-bold mb-2">Cost Center Master</h2>
        <p className="text-gray-600">Manage cost allocation centers and budgets</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cost centers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Types</option>
                <option value="Main">Main</option>
                <option value="Support">Support</option>
                <option value="Production">Production</option>
                <option value="Service">Service</option>
                <option value="Administrative">Administrative</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Categories</option>
                <option value="Revenue">Revenue</option>
                <option value="Cost">Cost</option>
                <option value="Profit">Profit</option>
                <option value="Investment">Investment</option>
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('tree')}
                  className={`px-3 py-1 rounded ${viewMode === 'tree' ? 'bg-white shadow' : ''}`}
                >
                  Tree
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                >
                  List
                </button>
              </div>
              <button
                onClick={() => {
                  setSelectedCostCenter(null);
                  setIsModalOpen(true);
                  setCurrentTab('basic');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Cost Center
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {viewMode === 'tree' ? (
            <div>
              {costCenterTree.map(node => renderTreeNode(node))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost Center
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Category
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Manager & Dept
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
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
                  {filteredCostCenters.map((cc) => (
                    <tr key={cc.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{cc.name}</div>
                          <div className="text-sm text-gray-500">{cc.code}</div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="space-y-1">
                          {getTypeBadge(cc.type)}
                          {getCategoryBadge(cc.category)}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-gray-400" />
                            <span>{cc.manager}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {cc.department} - {cc.branch}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="w-48">
                          <div className="text-sm font-medium mb-1">
                            ${(cc.budget.annual / 1000000).toFixed(1)}M Annual
                          </div>
                          {getBudgetUtilization(cc.budget)}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3 text-gray-400" />
                            <span>Efficiency: {cc.performance.efficiency}%</span>
                          </div>
                          <div className={`text-xs ${cc.performance.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            Variance: {cc.performance.variance > 0 ? '+' : ''}{cc.performance.variance}%
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {getStatusBadge(cc.status)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(cc)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cc.id)}
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
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full  max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {selectedCostCenter ? 'Edit Cost Center' : 'Add New Cost Center'}
              </h3>
            </div>

            <div className="flex border-b border-gray-200">
              {['basic', 'budget', 'allocation', 'accounting', 'controls', 'performance'].map((tab) => (
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

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {currentTab === 'basic' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cost Center Code *
                      </label>
                      <input
                        type="text"
                        data-field="cost-center-code"
                        defaultValue={selectedCostCenter?.code}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="CC-XXX-000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cost Center Name *
                      </label>
                      <input
                        type="text"
                        data-field="cost-center-name"
                        defaultValue={selectedCostCenter?.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter cost center name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type *
                      </label>
                      <select defaultValue={selectedCostCenter?.type || 'Main'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="Main">Main</option>
                        <option value="Support">Support</option>
                        <option value="Production">Production</option>
                        <option value="Service">Service</option>
                        <option value="Administrative">Administrative</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select defaultValue={selectedCostCenter?.category || 'Cost'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="Revenue">Revenue</option>
                        <option value="Cost">Cost</option>
                        <option value="Profit">Profit</option>
                        <option value="Investment">Investment</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Cost Center
                      </label>
                      <select defaultValue={selectedCostCenter?.parentId}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">None (Top Level)</option>
                        {costCenters.map(cc => (
                          <option key={cc.id} value={cc.id}>{cc.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Manager *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCostCenter?.manager}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter manager name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCostCenter?.department}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCostCenter?.branch}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select defaultValue={selectedCostCenter?.status || 'Active'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Blocked">Blocked</option>
                      <option value="Under Review">Under Review</option>
                    </select>
                  </div>
                </div>
              )}

              {currentTab === 'budget' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Annual Budget *
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedCostCenter?.budget.annual}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency *
                      </label>
                      <select defaultValue={selectedCostCenter?.budget.currency || 'USD'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quarterly Budget
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedCostCenter?.budget.quarterly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Budget
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedCostCenter?.budget.monthly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Allocated
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedCostCenter?.budget.allocated}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Utilized
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedCostCenter?.budget.utilized}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Available
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedCostCenter?.budget.available}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Expense Breakdown</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Direct Expenses
                        </label>
                        <input
                          type="number"
                          defaultValue={selectedCostCenter?.expenses?.direct}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Indirect Expenses
                        </label>
                        <input
                          type="number"
                          defaultValue={selectedCostCenter?.expenses?.indirect}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fixed Costs
                        </label>
                        <input
                          type="number"
                          defaultValue={selectedCostCenter?.expenses?.fixed}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Variable Costs
                        </label>
                        <input
                          type="number"
                          defaultValue={selectedCostCenter?.expenses?.variable}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'allocation' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Allocation Method *
                      </label>
                      <select defaultValue={selectedCostCenter?.allocation?.method || 'Direct'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="Direct">Direct</option>
                        <option value="Step-down">Step-down</option>
                        <option value="Reciprocal">Reciprocal</option>
                        <option value="Activity-based">Activity-based</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Allocation Basis
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCostCenter?.allocation?.basis}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Machine Hours, Headcount"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allocation Rate
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={selectedCostCenter?.allocation?.rate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost Drivers
                    </label>
                    <textarea
                      defaultValue={selectedCostCenter?.allocation?.drivers?.join(', ')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Enter cost drivers (comma-separated)"
                    />
                  </div>
                </div>
              )}

              {currentTab === 'accounting' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GL Account
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCostCenter?.accounting?.glAccount}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profit Center
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCostCenter?.accounting?.profitCenter}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Unit
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCostCenter?.accounting?.businessUnit}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Segment
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCostCenter?.accounting?.segment}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedCostCenter?.accounting?.project}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {currentTab === 'controls' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Approval Limit
                    </label>
                    <input
                      type="number"
                      defaultValue={selectedCostCenter?.controls?.approvalLimit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Approvers
                    </label>
                    <textarea
                      defaultValue={selectedCostCenter?.controls?.approvers?.join(', ')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Enter approver roles (comma-separated)"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={selectedCostCenter?.controls?.budgetControl}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Enable Budget Control
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Over-budget Action
                      </label>
                      <select defaultValue={selectedCostCenter?.controls?.overbudgetAction || 'Warn'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="Block">Block</option>
                        <option value="Warn">Warn</option>
                        <option value="Allow">Allow</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Review Cycle
                      </label>
                      <select defaultValue={selectedCostCenter?.controls?.reviewCycle || 'Monthly'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Annually">Annually</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'performance' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Efficiency (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={selectedCostCenter?.performance?.efficiency}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Variance (%)
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedCostCenter?.performance?.variance}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Utilization Rate (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={selectedCostCenter?.performance?.utilizationRate}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cost Per Unit
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={selectedCostCenter?.performance?.costPerUnit}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ROI (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      defaultValue={selectedCostCenter?.performance?.roi}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {selectedCostCenter ? 'Update' : 'Create'} Cost Center
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}