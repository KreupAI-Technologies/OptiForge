'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Download, Filter, X, Truck, Star, Shield, TrendingUp, Package, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { VendorCategory, getVendorCategoryStats } from '@/data/common-masters/vendor-categories';
import { commonMastersService } from '@/services/common-masters.service';
import { exportToCsv } from '@/lib/export';

const DEFAULT_COMPANY_ID = '1';

export default function VendorCategoryMasterPage() {
  const [categories, setCategories] = useState<VendorCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Fetch vendor categories from the live backend, mapping the raw API shape into the page's model.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await commonMastersService.getAllVendorCategories(DEFAULT_COMPANY_ID)) as any[];
        const mapped: VendorCategory[] = raw.map((c) => ({
          id: String(c.id ?? ''),
          categoryCode: c.code ?? c.categoryCode ?? '',
          categoryName: c.name ?? c.categoryName ?? '',
          description: c.description ?? '',
          defaultPaymentTerms: c.defaultPaymentTerms ?? '',
          defaultDeliveryTerms: c.defaultDeliveryTerms ?? undefined,
          creditPeriod: Number(c.creditPeriod ?? 0),
          paymentDays: c.paymentDays !== null && c.paymentDays !== undefined ? Number(c.paymentDays) : undefined,
          advancePaymentPercentage: c.advancePaymentPercentage !== null && c.advancePaymentPercentage !== undefined ? Number(c.advancePaymentPercentage) : undefined,
          advancePaymentRequired: c.advancePaymentRequired ?? undefined,
          advancePercentage: c.advancePercentage !== null && c.advancePercentage !== undefined ? Number(c.advancePercentage) : undefined,
          materialType: (c.materialType ?? 'others') as VendorCategory['materialType'],
          vendorType: c.vendorType ?? undefined,
          isPreferred: c.isPreferred ?? undefined,
          qualityRating: (c.qualityRating ?? 'B') as VendorCategory['qualityRating'],
          minOrderValue: Number(c.minOrderValue ?? 0),
          leadTimeDays: Number(c.leadTimeDays ?? 0),
          onTimeDeliveryRate: c.onTimeDeliveryRate !== null && c.onTimeDeliveryRate !== undefined ? Number(c.onTimeDeliveryRate) : undefined,
          evaluationRequired: c.evaluationRequired ?? false,
          inspectionRequired: c.inspectionRequired ?? false,
          requiresQualityInspection: c.requiresQualityInspection ?? undefined,
          certificationRequired: c.certificationRequired ?? false,
          certifications: Array.isArray(c.certifications) ? c.certifications : undefined,
          defectRate: c.defectRate !== null && c.defectRate !== undefined ? Number(c.defectRate) : undefined,
          complianceScore: c.complianceScore !== null && c.complianceScore !== undefined ? Number(c.complianceScore) : undefined,
          vendorsCount: Number(c.vendorsCount ?? 0),
          totalPurchases: Number(c.totalPurchases ?? 0),
          avgOrderValue: Number(c.avgOrderValue ?? 0),
          averagePOValue: c.averagePOValue !== null && c.averagePOValue !== undefined ? Number(c.averagePOValue) : undefined,
          outstandingAmount: Number(c.outstandingAmount ?? 0),
          pendingPayments: c.pendingPayments !== null && c.pendingPayments !== undefined ? Number(c.pendingPayments) : undefined,
          isActive: c.isActive ?? true,
          createdBy: c.createdBy ?? '',
          createdDate: c.createdDate ?? c.createdAt ?? '',
        }));
        if (!cancelled) setCategories(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load vendor categories');
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

  const handleEditCategory = (category: VendorCategory) => {
    showToast(`Editing category: ${category.categoryName}`, 'info');
  };

  const handleViewVendors = (category: VendorCategory) => {
    showToast(`Viewing ${category.vendorsCount} vendors in: ${category.categoryName}`, 'info');
  };

  const handleExport = () => {
    exportToCsv('vendor-category-master', filteredData);
    showToast('Exporting vendor categories data...', 'success');
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

      const matchesType = filterType === 'all' || category.vendorType === filterType;

      return matchesSearch && matchesType;
    });
  }, [categories, searchTerm, filterType]);

  const getVendorTypeColor = (type: string) => {
    const colors = {
      'raw_material': 'bg-blue-100 text-blue-800',
      'finished_goods': 'bg-green-100 text-green-800',
      'services': 'bg-purple-100 text-purple-800',
      'equipment': 'bg-orange-100 text-orange-800',
      'consumables': 'bg-yellow-100 text-yellow-800',
      'spare_parts': 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const columns: Column<VendorCategory>[] = [
    {
      id: 'category',
      header: 'Category',
      accessor: 'categoryName',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 flex items-center gap-2">
            {row.isPreferred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
            {value}
          </div>
          <div className="text-xs text-gray-500">
            <span className="font-mono font-semibold text-blue-600">{row.categoryCode}</span>
            {row.isPreferred && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Preferred
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'type',
      header: 'Vendor Type',
      accessor: 'vendorType',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getVendorTypeColor(value)}`}>
          {value?.replace('_', ' ') ?? ''}
        </span>
      )
    },
    {
      id: 'terms',
      header: 'Payment Terms',
      accessor: 'defaultPaymentTerms',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{value}</div>
          {row.paymentDays && (
            <div className="text-xs text-gray-500">{row.paymentDays} days</div>
          )}
          {row.advancePaymentRequired && (
            <div className="text-xs text-orange-600">Advance: {row.advancePercentage}%</div>
          )}
        </div>
      )
    },
    {
      id: 'delivery',
      header: 'Delivery',
      accessor: 'defaultDeliveryTerms',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{value}</div>
          {row.leadTimeDays && (
            <div className="text-xs text-gray-500">Lead: {row.leadTimeDays} days</div>
          )}
        </div>
      )
    },
    {
      id: 'quality',
      header: 'Quality Standards',
      accessor: 'qualityRating',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className={`font-medium flex items-center gap-1 ${getRatingColor(value)}`}>
            <Star className="w-3 h-3 fill-current" />
            {value.toFixed(1)} / 5.0
          </div>
          {row.requiresQualityInspection && (
            <div className="text-xs text-blue-600 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              QC Required
            </div>
          )}
          {row.certifications && row.certifications.length > 0 && (
            <div className="text-xs text-green-600">
              {row.certifications.length} cert{row.certifications.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'performance',
      header: 'Performance',
      accessor: 'onTimeDeliveryRate',
      sortable: true,
      render: (value, row) => (
        <div className="text-xs">
          <div className={`font-medium ${value >= 90 ? 'text-green-600' : value >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
            On-time: {value}%
          </div>
          <div className={`${row.defectRate ?? 0 <= 2 ? 'text-green-600' : 'text-red-600'}`}>
            Defects: {row.defectRate ?? 0}%
          </div>
          {row.complianceScore && (
            <div className="text-blue-600">
              Compliance: {row.complianceScore}%
            </div>
          )}
        </div>
      )
    },
    {
      id: 'usage',
      header: 'Vendor Analytics',
      accessor: 'vendorsCount',
      sortable: true,
      render: (value, row) => (
        <div className="text-xs">
          <div className="font-medium text-gray-900 flex items-center gap-1">
            <Truck className="w-3 h-3" />
            {value} vendors
          </div>
          <div className="text-green-600">Purchases: ₹{(row.totalPurchases / 1000000).toFixed(1)}M</div>
          <div className="text-orange-600">Pending: ₹{((row.pendingPayments || 0) / 1000000).toFixed(1)}M</div>
          <div className="text-gray-500">Avg PO: ₹{((row.averagePOValue || 0) / 1000).toFixed(0)}K</div>
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
              handleViewVendors(row);
            }}
          >
            Vendors
          </button>
          <button
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete ${row.categoryName}? This affects ${row.vendorsCount} vendors.`)) {
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
    setFilterType('all');
  };

  const activeFilterCount = [
    filterType !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  const stats = useMemo(() => getVendorCategoryStats(), [categories]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-violet-50 to-purple-50">
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
                <Truck className="w-7 h-7 text-blue-600" />
                Vendor Category Master
              </h1>
              <p className="text-gray-600 mt-1">Manage vendor categories, quality standards, and performance metrics</p>
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
          <div className="text-sm text-gray-600 mb-1">Total Vendors</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalVendors}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Total Purchases
          </div>
          <div className="text-2xl font-bold text-green-600">₹{(stats.totalPurchases / 10000000).toFixed(1)}Cr</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Pending Payments</div>
          <div className="text-2xl font-bold text-orange-600">₹{(stats.totalPending / 1000000).toFixed(1)}M</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Avg Quality</div>
          <div className="text-2xl font-bold text-purple-600">{stats.avgQuality.toFixed(1)}/5</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">On-time Delivery</div>
          <div className="text-2xl font-bold text-teal-600">{stats.avgOnTime}%</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendor categories by name, code, or description..."
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
                Vendor Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="raw_material">Raw Material</option>
                <option value="finished_goods">Finished Goods</option>
                <option value="services">Services</option>
                <option value="equipment">Equipment</option>
                <option value="consumables">Consumables</option>
                <option value="spare_parts">Spare Parts</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading vendor categories…
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
          No vendor categories found.
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
          emptyMessage="No vendor categories found"
          emptyDescription="Try adjusting your search or filters to find what you're looking for."
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Vendor Category Guidelines
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>✓ <strong>Quality Management:</strong> Category-wise quality ratings, inspection requirements, and certification tracking</li>
          <li>✓ <strong>Payment Terms:</strong> Default payment terms (Net 30, Net 60) and advance payment configurations</li>
          <li>✓ <strong>Delivery Standards:</strong> Lead time expectations and on-time delivery performance tracking</li>
          <li>✓ <strong>Performance Metrics:</strong> Monitor quality ratings, defect rates, and compliance scores</li>
          <li>✓ <strong>Preferred Vendors:</strong> Mark high-performing categories for priority sourcing</li>
          <li>✓ <strong>Purchase Analytics:</strong> Track purchases, pending payments, and average PO values by category</li>
        </ul>
      </div>
        </div>
      </div>
    </div>
  );
}
