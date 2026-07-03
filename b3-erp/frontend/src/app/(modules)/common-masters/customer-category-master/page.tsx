'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Download, Filter, X, Users, TrendingUp, Award, CreditCard, Package, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CustomerCategory, getCustomerCategoryStats } from '@/data/common-masters/customer-categories';
import { commonMastersService } from '@/services/common-masters.service';
import { exportToCsv } from '@/lib/export';

const DEFAULT_COMPANY_ID = '1';

export default function CustomerCategoryMasterPage() {
  const [categories, setCategories] = useState<CustomerCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBusinessType, setFilterBusinessType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Fetch customer categories from the live backend, mapping the raw API shape into the page's model.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await commonMastersService.getAllCustomerCategories(DEFAULT_COMPANY_ID)) as any[];
        const mapped: CustomerCategory[] = raw.map((c) => ({
          id: String(c.id ?? ''),
          categoryCode: c.code ?? c.categoryCode ?? '',
          categoryName: c.name ?? c.categoryName ?? '',
          description: c.description ?? '',
          defaultDiscount: Number(c.criteria?.defaultDiscount ?? c.defaultDiscount ?? 0),
          maxDiscountAllowed: Number(c.criteria?.maxDiscountAllowed ?? c.maxDiscountAllowed ?? 0),
          priceListId: c.priceListId ?? '',
          priceListName: c.priceListName ?? '',
          defaultPriceList: c.defaultPriceList ?? undefined,
          defaultCreditLimit: Number(c.terms?.defaultCreditLimit ?? c.defaultCreditLimit ?? 0),
          defaultPaymentTerms: c.terms?.defaultPaymentTerms ?? c.defaultPaymentTerms ?? '',
          creditPeriod: Number(c.terms?.creditPeriod ?? c.creditPeriod ?? 0),
          requiresApproval: c.requiresApproval ?? false,
          businessType: (c.classification ?? c.businessType ?? 'end_user') as CustomerCategory['businessType'],
          priority: (c.priority ?? 'medium') as CustomerCategory['priority'],
          tier: (c.level ?? c.tier) as CustomerCategory['tier'],
          volumeDiscountApplicable: c.volumeDiscountApplicable ?? undefined,
          creditDays: c.creditDays !== null && c.creditDays !== undefined ? Number(c.creditDays) : undefined,
          specialPricingApplicable: c.specialPricingApplicable ?? undefined,
          defaultTerritory: c.defaultTerritory ?? undefined,
          shippingChargesApply: c.shippingChargesApply ?? false,
          customersCount: Number(c.metrics?.customersCount ?? c.customersCount ?? 0),
          totalSales: Number(c.metrics?.totalSales ?? c.totalSales ?? 0),
          avgOrderValue: Number(c.metrics?.avgOrderValue ?? c.avgOrderValue ?? 0),
          outstandingAmount: Number(c.metrics?.outstandingAmount ?? c.outstandingAmount ?? 0),
          isActive: c.isActive ?? (c.status ? c.status === 'active' : true),
          createdBy: c.createdBy ?? '',
          createdDate: c.createdDate ?? c.createdAt ?? '',
        }));
        if (!cancelled) setCategories(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load customer categories');
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

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleEditCategory = (category: CustomerCategory) => {
    showToast(`Editing category: ${category.categoryName}`, 'info');
  };

  const handleViewCustomers = (category: CustomerCategory) => {
    showToast(`Viewing ${category.customersCount} customers in: ${category.categoryName}`, 'info');
  };

  const handleExport = () => {
    exportToCsv('customer-category-master', filteredData);
    showToast('Exporting customer categories data...', 'success');
  };

  const handleAddCategory = () => {
    showToast('Opening add category form...', 'info');
  };

  const filteredData = useMemo(() => {
    return categories.filter(category => {
      const matchesSearch =
        category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.categoryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBusinessType = filterBusinessType === 'all' || category.businessType === filterBusinessType;

      return matchesSearch && matchesBusinessType;
    });
  }, [categories, searchTerm, filterBusinessType]);

  const getBusinessTypeColor = (type: string) => {
    const colors = {
      'b2b': 'bg-blue-100 text-blue-800',
      'b2c': 'bg-green-100 text-green-800',
      'wholesale': 'bg-purple-100 text-purple-800',
      'retail': 'bg-orange-100 text-orange-800',
      'corporate': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTierColor = (tier: string) => {
    const colors = {
      'platinum': 'bg-purple-100 text-purple-800',
      'gold': 'bg-yellow-100 text-yellow-800',
      'silver': 'bg-gray-100 text-gray-800',
      'bronze': 'bg-orange-100 text-orange-800',
      'standard': 'bg-blue-100 text-blue-800'
    };
    return colors[tier as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const columns: Column<CustomerCategory>[] = [
    {
      id: 'category',
      header: 'Category',
      accessor: 'categoryName',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 flex items-center gap-2">
            {row.tier === 'platinum' && <Award className="w-4 h-4 text-purple-600" />}
            {row.tier === 'gold' && <Award className="w-4 h-4 text-yellow-600" />}
            {value}
          </div>
          <div className="text-xs text-gray-500">
            <span className="font-mono font-semibold text-blue-600">{row.categoryCode}</span>
            {row.tier && (
              <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getTierColor(row.tier)}`}>
                {row.tier}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'business',
      header: 'Business Type',
      accessor: 'businessType',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${getBusinessTypeColor(value)}`}>
          {value.replace('_', ' ')}
        </span>
      )
    },
    {
      id: 'discount',
      header: 'Discount %',
      accessor: 'defaultDiscount',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium text-green-600">{value}% default</div>
          <div className="text-xs text-gray-500">Max: {row.maxDiscountAllowed}%</div>
          {row.volumeDiscountApplicable && (
            <div className="text-xs text-blue-600">+ Volume discount</div>
          )}
        </div>
      )
    },
    {
      id: 'credit',
      header: 'Credit Terms',
      accessor: 'defaultCreditLimit',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            ₹{(value / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-gray-500">{row.defaultPaymentTerms}</div>
          {row.creditDays && (
            <div className="text-xs text-blue-600">{row.creditDays} days</div>
          )}
        </div>
      )
    },
    {
      id: 'pricing',
      header: 'Price List',
      accessor: 'defaultPriceList',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{value}</div>
          {row.specialPricingApplicable && (
            <div className="text-xs text-purple-600">Special pricing</div>
          )}
        </div>
      )
    },
    {
      id: 'usage',
      header: 'Customer Analytics',
      accessor: 'customersCount',
      sortable: true,
      render: (value, row) => (
        <div className="text-xs">
          <div className="font-medium text-gray-900 flex items-center gap-1">
            <Users className="w-3 h-3" />
            {value} customers
          </div>
          <div className="text-green-600">Sales: ₹{(row.totalSales / 1000000).toFixed(1)}M</div>
          <div className="text-orange-600">Outstanding: ₹{(row.outstandingAmount / 1000000).toFixed(1)}M</div>
          <div className="text-gray-500">Avg Order: ₹{(row.avgOrderValue / 1000).toFixed(0)}K</div>
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
              handleEditCategory(row);
            }}
          >
            Edit
          </button>
          <button
            className="text-green-600 hover:text-green-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleViewCustomers(row);
            }}
          >
            Customers
          </button>
          <button
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete ${row.categoryName}? This affects ${row.customersCount} customers.`)) {
                setCategories(prev => prev.filter(c => c.id !== row.id));
                showToast(`Deleted category: ${row.categoryName}`, 'success');
              }
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
    setFilterBusinessType('all');
  };

  const activeFilterCount = [
    filterBusinessType !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  const stats = useMemo(() => getCustomerCategoryStats(), [categories]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-rose-50 to-pink-50">
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2 space-y-3">
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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-7 h-7 text-blue-600" />
                Customer Category Master
              </h1>
              <p className="text-gray-600 mt-1">Manage customer categories, pricing tiers, and credit terms</p>
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
            onClick={handleAddCategory}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Total Categories</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Total Customers</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalCustomers}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Total Sales
          </div>
          <div className="text-2xl font-bold text-green-600">₹{(stats.totalSales / 10000000).toFixed(1)}Cr</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Outstanding</div>
          <div className="text-2xl font-bold text-orange-600">₹{(stats.totalOutstanding / 1000000).toFixed(1)}M</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Avg Discount</div>
          <div className="text-2xl font-bold text-purple-600">{stats.avgDiscount}%</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Avg Order Value</div>
          <div className="text-2xl font-bold text-teal-600">₹{(stats.avgOrderValue / 1000).toFixed(0)}K</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customer categories by name, code, or description..."
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

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type
              </label>
              <select
                value={filterBusinessType}
                onChange={(e) => setFilterBusinessType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="b2b">B2B - Business to Business</option>
                <option value="b2c">B2C - Business to Consumer</option>
                <option value="wholesale">Wholesale</option>
                <option value="retail">Retail</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading customer categories…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && categories.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No customer categories found.
        </div>
      )}

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
            defaultSort: { column: 'category', direction: 'asc' }
          }}
          emptyMessage="No customer categories found"
          emptyDescription="Try adjusting your search or filters to find what you're looking for."
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Customer Category Guidelines
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>✓ <strong>Tiered Pricing:</strong> Platinum, Gold, Silver, Bronze tiers with progressive discount structures</li>
          <li>✓ <strong>Credit Management:</strong> Category-wise credit limits and payment terms (Net 30, Net 45, Net 60)</li>
          <li>✓ <strong>Price List Assignment:</strong> Default price lists auto-applied based on customer category</li>
          <li>✓ <strong>Volume Discounts:</strong> Additional discounts for bulk purchases based on category eligibility</li>
          <li>✓ <strong>Special Pricing:</strong> Contract-based special pricing for VIP and corporate categories</li>
          <li>✓ <strong>Sales Analytics:</strong> Track sales, outstanding amounts, and average order values by category</li>
        </ul>
      </div>
        </div>
      </div>
    </div>
  );
}
