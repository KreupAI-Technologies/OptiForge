'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Save,
  X,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { inventoryService, type AdjustmentReason } from '@/services/InventoryService';

interface ReasonCode {
  id: string;
  code: string;
  description: string;
  category: 'quantity' | 'value' | 'write-off';
  requiresApproval: boolean;
  requiresDocument: boolean;
  active: boolean;
  usageCount: number;
  createdBy: string;
  createdDate: string;
  lastUsed?: string;
}

// Derive the page's UI category from the backend reason code/name, since the
// backend models reasonType (Positive/Negative/Both) rather than the page's
// quantity/value/write-off buckets.
const deriveCategory = (r: AdjustmentReason): ReasonCode['category'] => {
  const text = `${r.code ?? ''} ${r.name ?? ''}`.toLowerCase();
  if (/(price|value|cost|currency|market|valuation|revaluation)/.test(text)) {
    return 'value';
  }
  if (/(damage|obsolete|expire|expired|lost|theft|scrap|write.?off|shrink)/.test(text)) {
    return 'write-off';
  }
  return 'quantity';
};

export default function AdjustmentReasonsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [isAddingReason, setIsAddingReason] = useState(false);
  const [editingReasonId, setEditingReasonId] = useState<string | null>(null);

  const [reasonCodes, setReasonCodes] = useState<ReasonCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await inventoryService.getAdjustmentReasons();
        const list = Array.isArray(raw) ? raw : [];
        const mapped: ReasonCode[] = list.map((r) => ({
          id: String(r.id),
          code: r.code ?? '',
          description: r.name ?? r.description ?? '',
          category: deriveCategory(r),
          requiresApproval: Boolean(r.requiresApproval),
          // Backend has no "requires document" flag; approximate from approval need.
          requiresDocument: Boolean(r.requiresApproval),
          active: (r.status ?? 'Active') === 'Active',
          usageCount: 0,
          createdBy: r.createdBy ?? 'System',
          createdDate: r.createdAt ? String(r.createdAt).slice(0, 10) : '',
          lastUsed: r.updatedAt ? String(r.updatedAt).slice(0, 10) : undefined,
        }));
        if (!cancelled) setReasonCodes(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load adjustment reasons');
          setReasonCodes([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'quantity':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'value':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'write-off':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const toggleReasonStatus = (id: string) => {
    setReasonCodes(reasonCodes.map(reason =>
      reason.id === id ? { ...reason, active: !reason.active } : reason
    ));
  };

  const deleteReason = (id: string) => {
    if (confirm('Are you sure you want to delete this reason code?')) {
      setReasonCodes(reasonCodes.filter(reason => reason.id !== id));
    }
  };

  const totalReasons = reasonCodes.filter(r => r.active).length;
  const quantityReasons = reasonCodes.filter(r => r.category === 'quantity' && r.active).length;
  const valueReasons = reasonCodes.filter(r => r.category === 'value' && r.active).length;
  const writeOffReasons = reasonCodes.filter(r => r.category === 'write-off' && r.active).length;

  const filteredReasons = reasonCodes.filter(reason => {
    const matchesSearch = reason.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reason.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || reason.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && reason.active) ||
                         (selectedStatus === 'inactive' && !reason.active);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <span>Adjustment Reason Codes</span>
          </h1>
          <p className="text-gray-600 mt-1">Manage reason codes for inventory adjustments</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddingReason(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reason Code</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading adjustment reasons…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && reasonCodes.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No adjustment reason codes found.
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{totalReasons}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Active Reasons</div>
          <div className="text-xs text-blue-600 mt-1">Total Active</div>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-3 border border-cyan-200">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-cyan-600" />
            <span className="text-2xl font-bold text-cyan-900">{quantityReasons}</span>
          </div>
          <div className="text-sm font-medium text-cyan-700">Quantity Reasons</div>
          <div className="text-xs text-cyan-600 mt-1">Active Codes</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{valueReasons}</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Value Reasons</div>
          <div className="text-xs text-purple-600 mt-1">Active Codes</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-red-900">{writeOffReasons}</span>
          </div>
          <div className="text-sm font-medium text-red-700">Write-Off Reasons</div>
          <div className="text-xs text-red-600 mt-1">Active Codes</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reason codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="quantity">Quantity</option>
            <option value="value">Value</option>
            <option value="write-off">Write-Off</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="all">All Status</option>
          </select>
        </div>
      </div>

      {/* Reason Codes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requires Approval</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requires Document</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage Count</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReasons.map((reason) => (
                <tr key={reason.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                    {reason.code}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    {reason.description}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(reason.category)}`}>
                      {reason.category.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {reason.requiresApproval ? (
                      <span className="text-yellow-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {reason.requiresDocument ? (
                      <span className="text-blue-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{reason.usageCount}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                    {reason.lastUsed || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <button
                      onClick={() => toggleReasonStatus(reason.id)}
                      className="flex items-center space-x-1"
                    >
                      {reason.active ? (
                        <>
                          <ToggleRight className="w-8 h-8 text-green-600" />
                          <span className="text-xs font-medium text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-8 h-8 text-gray-400" />
                          <span className="text-xs font-medium text-gray-500">Inactive</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingReasonId(reason.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteReason(reason.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReasons.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500">No reason codes found matching your filters</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal (simplified for now) */}
      {isAddingReason && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Add New Reason Code</h3>
              <button onClick={() => setIsAddingReason(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  type="text"
                  placeholder="REASON_CODE"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Description of the reason"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="quantity">Quantity</option>
                  <option value="value">Value</option>
                  <option value="write-off">Write-Off</option>
                </select>
              </div>
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-700">Requires Approval</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-700">Requires Document</span>
                </label>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsAddingReason(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Save Reason Code</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
