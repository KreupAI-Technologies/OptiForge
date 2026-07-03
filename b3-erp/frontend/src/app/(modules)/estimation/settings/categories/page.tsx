'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Search,
  Edit2,
  Save,
  X,
  Folder,
  FolderOpen,
  TrendingUp,
  Package,
  IndianRupee,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { estimationCategoryService } from '@/services/estimation-category.service';

interface EstimationCategory {
  id: string;
  categoryCode: string;
  categoryName: string;
  parentCategory: string;
  level: number;
  description: string;
  defaultMarkup: number;
  minimumOrderValue: number;
  standardLeadTime: number;
  costAllocationMethod: 'direct' | 'proportional' | 'weighted';
  allowSubcategories: boolean;
  requiresApproval: boolean;
  approvalThreshold: number;
  estimateCount: number;
  totalValue: number;
  avgEstimateValue: number;
  lastUsed: string;
  createdBy: string;
  createdDate: string;
  status: 'active' | 'inactive';
}

export default function EstimationCategoriesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<EstimationCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns raw ORM shape; map it onto the page's
        // EstimationCategory model. Fields the page needs but the backend
        // does not provide are defaulted (0 / '' / false).
        const raw = (await estimationCategoryService.getCategories()) as any[];
        // Resolve parentCategory (a code reference) to the parent's display name.
        const codeToName = new Map(
          raw.filter((c) => c.code).map((c) => [c.code, c.name]),
        );
        const mapped: EstimationCategory[] = raw.map((c) => {
          const parentRef = c.parentCategory ?? '';
          const isChild = parentRef && parentRef !== '-';
          return {
            id: String(c.id),
            categoryCode: c.code ?? '',
            categoryName: c.name ?? '',
            parentCategory: isChild ? (codeToName.get(parentRef) ?? parentRef) : '-',
            level: isChild ? 2 : 1,
            description: c.description ?? '',
            defaultMarkup: Number(c.defaultMarkup ?? 0),
            minimumOrderValue: 0,
            standardLeadTime: 0,
            costAllocationMethod: 'direct',
            allowSubcategories: false,
            requiresApproval: false,
            approvalThreshold: 0,
            estimateCount: Number(c.itemCount ?? 0),
            totalValue: 0,
            avgEstimateValue: 0,
            lastUsed: '',
            createdBy: '',
            createdDate: c.createdAt ?? '',
            status: c.status === 'inactive' ? 'inactive' : 'active',
          };
        });
        if (!cancelled) setCategories(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load categories');
          setCategories([]);
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

  const filteredCategories = categories.filter(category => {
    const matchesSearch =
      category.categoryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || category.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSave = () => {
    setEditingId(null);
    // Save logic would go here
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const getCostAllocationBadge = (method: string) => {
    const colors = {
      direct: 'bg-blue-100 text-blue-800',
      proportional: 'bg-purple-100 text-purple-800',
      weighted: 'bg-orange-100 text-orange-800'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getLevelIcon = (level: number) => {
    return level === 1 ? <Folder className="h-4 w-4" /> : <FolderOpen className="h-4 w-4" />;
  };

  // Summary stats
  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => c.status === 'active').length;
  const totalEstimates = categories.reduce((sum, c) => sum + c.estimateCount, 0);
  const totalValue = categories.reduce((sum, c) => sum + c.totalValue, 0);

  return (
    <div className="w-full px-3 py-2">
      {/* Inline Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Estimation Categories</h1>
            <p className="text-sm text-gray-600">Configure product categories and estimation rules</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          New Category
        </button>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading categories…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Total Categories</span>
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{totalCategories}</div>
          <div className="text-xs text-blue-700 mt-1">{activeCategories} active</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900">Total Estimates</span>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{totalEstimates.toLocaleString()}</div>
          <div className="text-xs text-green-700 mt-1">All categories</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">Total Value</span>
            <IndianRupee className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">₹{(totalValue / 10000000).toFixed(1)}Cr</div>
          <div className="text-xs text-purple-700 mt-1">Cumulative</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-900">Avg Estimate</span>
            <Calendar className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-900">₹{(totalEstimates > 0 ? totalValue / totalEstimates / 1000 : 0).toFixed(0)}K</div>
          <div className="text-xs text-orange-700 mt-1">Per estimate</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Markup
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approval
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className={category.level === 1 ? 'text-gray-700' : 'text-gray-500 ml-6'}>
                        {getLevelIcon(category.level)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{category.categoryName}</div>
                        <div className="text-xs text-gray-500">{category.categoryCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-900">{category.parentCategory}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{category.defaultMarkup.toFixed(1)}%</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">₹{category.minimumOrderValue.toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{category.standardLeadTime} days</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCostAllocationBadge(category.costAllocationMethod)}`}>
                      {category.costAllocationMethod}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {category.requiresApproval ? (
                      <div>
                        <div className="flex items-center gap-1 text-xs text-orange-700">
                          <CheckCircle2 className="h-3 w-3" />
                          Required
                        </div>
                        <div className="text-xs text-gray-500">&gt;₹{(category.approvalThreshold / 1000).toFixed(0)}K</div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <XCircle className="h-3 w-3" />
                        Not required
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{category.estimateCount}</div>
                      <div className="text-xs text-gray-500">₹{(category.totalValue / 100000).toFixed(1)}L</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      category.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {category.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {editingId === category.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSave}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 rounded-lg hover:bg-green-50 text-sm"
                        >
                          <Save className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">Save</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          <X className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">Cancel</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(category.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredCategories.length} of {totalCategories} categories
      </div>
    </div>
  );
}
