'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Download, Filter, X, Receipt, TrendingUp, FileText, Package, Percent, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { HSNSAC, getHSNSACStats } from '@/data/common-masters/hsn-sac';
import { commonMastersService } from '@/services/common-masters.service';
import { exportToCsv } from '@/lib/export';

const DEFAULT_COMPANY_ID = '1';

export default function HSNSACMasterPage() {
  const [hsnSacRecords, setHsnSacRecords] = useState<HSNSAC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCodeType, setFilterCodeType] = useState<string>('all');
  const [filterApplicableFor, setFilterApplicableFor] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Fetch HSN/SAC codes from the live backend, mapping the raw API shape into the page's HSNSAC model.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await commonMastersService.getAllHsnSacs(DEFAULT_COMPANY_ID)) as any[];
        const mapped: HSNSAC[] = raw.map((h) => {
          const totalGST = Number(h.totalGST ?? h.gstPercentage ?? 0);
          const igst = Number(h.igstRate ?? totalGST);
          return {
            id: String(h.id ?? ''),
            code: h.code ?? '',
            codeType: (h.codeType ?? (h.applicableFor === 'services' ? 'SAC' : 'HSN')) as HSNSAC['codeType'],
            description: h.description ?? '',
            category: h.category ?? '',
            cgstRate: Number(h.cgstRate ?? igst / 2),
            sgstRate: Number(h.sgstRate ?? igst / 2),
            igstRate: igst,
            cessRate: h.cessRate !== null && h.cessRate !== undefined ? Number(h.cessRate) : undefined,
            totalGST: totalGST || igst,
            applicableFor: (h.applicableFor ?? 'goods') as HSNSAC['applicableFor'],
            itemGroup: h.itemGroup ?? undefined,
            isExempted: h.isExempted ?? undefined,
            isNilRated: h.isNilRated ?? undefined,
            isReverseCharge: h.isReverseCharge ?? undefined,
            itemsCount: Number(h.itemsCount ?? 0),
            transactionsCount: Number(h.transactionsCount ?? 0),
            totalTaxableAmount: Number(h.totalTaxableAmount ?? 0),
            totalTaxCollected: Number(h.totalTaxCollected ?? 0),
            lastUsedDate: h.lastUsedDate ?? '',
            isActive: h.isActive ?? true,
            createdBy: h.createdBy ?? '',
            createdDate: h.createdDate ?? h.createdAt ?? '',
          };
        });
        if (!cancelled) setHsnSacRecords(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load HSN/SAC codes');
          setHsnSacRecords([]);
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

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleEditHSNSAC = (record: HSNSAC) => {
    showToast(`Editing HSN/SAC code: ${record.code}`, 'info');
  };

  const handleExport = () => {
    exportToCsv('hsn-sac-master', filteredData);
    showToast('Exporting HSN/SAC codes...', 'success');
  };

  const handleAddHSNSAC = () => {
    showToast('Opening Add HSN/SAC form...', 'info');
  };

  const filteredData = useMemo(() => {
    return hsnSacRecords.filter(record => {
      const matchesSearch =
        record.code.includes(searchTerm) ||
        record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCodeType = filterCodeType === 'all' || record.codeType === filterCodeType;
      const matchesApplicableFor = filterApplicableFor === 'all' || record.applicableFor === filterApplicableFor;

      return matchesSearch && matchesCodeType && matchesApplicableFor;
    });
  }, [hsnSacRecords, searchTerm, filterCodeType, filterApplicableFor]);

  const getCodeTypeColor = (type: string) => {
    return type === 'HSN' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800';
  };

  const getGSTRateColor = (rate: number) => {
    if (rate === 0) return 'text-gray-600';
    if (rate <= 5) return 'text-green-600';
    if (rate <= 12) return 'text-blue-600';
    if (rate <= 18) return 'text-orange-600';
    return 'text-red-600';
  };

  const columns: Column<HSNSAC>[] = [
    {
      id: 'code',
      header: 'HSN/SAC Code',
      accessor: 'code',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-mono font-semibold text-lg text-blue-600">{value}</div>
          <div className="mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCodeTypeColor(row.codeType)}`}>
              {row.codeType} Code
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'description',
      header: 'Description',
      accessor: 'description',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            <span className="font-medium">Category:</span> {row.category}
          </div>
          {row.category && (
            <div className="text-xs text-gray-400">
              <span className="font-medium">Sub:</span> {row.category}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'gst',
      header: 'GST Structure',
      accessor: 'totalGST',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className={`font-bold ${getGSTRateColor(value)}`}>
            {value}% Total GST
          </div>
          <div className="text-xs text-gray-600 mt-1 space-y-0.5">
            <div>CGST: {row.cgstRate}%</div>
            <div>SGST: {row.sgstRate}%</div>
            {row.igstRate && <div>IGST: {row.igstRate}%</div>}
            {row.cessRate && (
              <div className="text-red-600 font-medium">Cess: {row.cessRate}%</div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'applicability',
      header: 'Applicable For',
      accessor: 'applicableFor',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 capitalize flex items-center gap-1">
            {value === 'goods' && <Package className="w-4 h-4 text-blue-600" />}
            {value === 'services' && <FileText className="w-4 h-4 text-purple-600" />}
            {value === 'both' && <span className="text-gray-600">📦 + 📄</span>}
            {value}
          </div>
        </div>
      )
    },
    {
      id: 'usage',
      header: 'Usage Analytics',
      accessor: 'transactionsCount',
      sortable: true,
      render: (value, row) => (
        <div className="text-xs">
          <div className="font-medium text-gray-900">{row.itemsCount} items</div>
          <div className="text-blue-600">{value.toLocaleString('en-IN')} transactions</div>
          <div className="text-gray-500 mt-1">
            Taxable: ₹{(row.totalTaxableAmount / 1000000).toFixed(2)}M
          </div>
          <div className="text-green-600 font-medium">
            Tax: ₹{(row.totalTaxCollected / 1000000).toFixed(2)}M
          </div>
        </div>
      )
    },
    {
      id: 'exemptions',
      header: 'Special Conditions',
      accessor: 'isExempted',
      sortable: false,
      render: (value, row) => (
        <div className="text-xs space-y-1">
          {row.isExempted && (
            <div className="text-green-600 font-medium">✓ Exempted</div>
          )}
          {row.isNilRated && (
            <div className="text-blue-600 font-medium">✓ Nil Rated</div>
          )}
          {row.isReverseCharge && (
            <div className="text-orange-600 font-medium">⚠ Reverse Charge</div>
          )}
          {!row.isExempted && !row.isNilRated && !row.isReverseCharge && (
            <div className="text-gray-400">Standard</div>
          )}
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
              handleEditHSNSAC(row);
            }}
          >
            Edit
          </button>
          <button
            className="text-green-600 hover:text-green-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              showToast(`Viewing items for ${row.code}`, 'info');
            }}
          >
            Items
          </button>
          <button
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete HSN/SAC code ${row.code}?`)) {
                setHsnSacRecords(prev => prev.filter(h => h.id !== row.id));
                showToast(`Deleted HSN/SAC code: ${row.code}`, 'success');
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
    setFilterCodeType('all');
    setFilterApplicableFor('all');
  };

  const activeFilterCount = [
    filterCodeType !== 'all',
    filterApplicableFor !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  const stats = useMemo(() => getHSNSACStats(), [hsnSacRecords]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-yellow-50 to-amber-50">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white px-4 py-3 rounded-lg shadow-lg border-l-4 animate-slide-in"
             style={{ 
               borderLeftColor: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#3b82f6',
               minWidth: '300px'
             }}>
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
          {toast.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-500" />}
          <span className="text-sm text-gray-700">{toast.message}</span>
        </div>
      )}
      
      <div className="flex-none p-3 pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Receipt className="w-7 h-7 text-amber-600" />
              HSN/SAC Code Master
            </h1>
            <p className="text-gray-600 mt-1">Manage HSN and SAC codes for GST compliance and taxation</p>
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
              onClick={handleAddHSNSAC}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Code</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Total Codes</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">HSN Codes</div>
            <div className="text-2xl font-bold text-green-600">{stats.hsnCount}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">SAC Codes</div>
            <div className="text-2xl font-bold text-purple-600">{stats.sacCount}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Total Items</div>
            <div className="text-2xl font-bold text-amber-600">{stats.totalItems}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Taxable
            </div>
            <div className="text-2xl font-bold text-orange-600">₹{(stats.totalTaxableAmount / 10000000).toFixed(1)}Cr</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
              <Percent className="w-3 h-3" /> Tax Collected
            </div>
            <div className="text-2xl font-bold text-red-600">₹{(stats.totalTaxCollected / 10000000).toFixed(1)}Cr</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6">
        <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex-none p-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by HSN/SAC code, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                  showFilters ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-amber-600 rounded-full">
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
                Code Type
              </label>
              <select
                value={filterCodeType}
                onChange={(e) => setFilterCodeType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="HSN">HSN - Goods</option>
                <option value="SAC">SAC - Services</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Applicable For
              </label>
              <select
                value={filterApplicableFor}
                onChange={(e) => setFilterApplicableFor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="goods">Goods Only</option>
                <option value="services">Services Only</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        )}
          </div>

          {isLoading && (
            <div className="mx-4 mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
              Loading HSN/SAC codes…
            </div>
          )}
          {loadError && !isLoading && (
            <div className="mx-4 mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {loadError}
            </div>
          )}
          {!isLoading && !loadError && hsnSacRecords.length === 0 && (
            <div className="mx-4 mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              No HSN/SAC codes found.
            </div>
          )}

          <div className="flex-1 overflow-auto">
            <DataTable
              data={filteredData}
              columns={columns}
              pagination={{
                enabled: true,
                pageSize: 10
              }}
              sorting={{
                enabled: true,
                defaultSort: { column: 'code', direction: 'asc' }
              }}
              emptyMessage="No HSN/SAC codes found"
              emptyDescription="Try adjusting your search or filters to find what you're looking for."
            />
          </div>
        </div>
      </div>

      <div className="flex-none p-3 pt-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            HSN/SAC Code Management Guidelines
          </h3>
          <ul className="text-sm text-amber-800 space-y-1 ml-7">
            <li>✓ <strong>HSN Codes:</strong> Harmonized System of Nomenclature for goods classification (6-8 digit codes)</li>
            <li>✓ <strong>SAC Codes:</strong> Services Accounting Code for service classification (6 digit codes)</li>
            <li>✓ <strong>GST Structure:</strong> CGST + SGST for intra-state, IGST for inter-state transactions</li>
            <li>✓ <strong>Tax Slabs:</strong> 0%, 5%, 12%, 18%, 28% with additional cess on certain items</li>
            <li>✓ <strong>Special Cases:</strong> Exempted goods/services, nil-rated items, reverse charge mechanism</li>
            <li>✓ <strong>Compliance:</strong> Accurate HSN/SAC codes essential for GST filing and tax calculation</li>
            <li>✓ <strong>Analytics:</strong> Track taxable turnover and tax collected for each HSN/SAC code</li>
          </ul>
        </div>
      </div>
    </div>
  );
}