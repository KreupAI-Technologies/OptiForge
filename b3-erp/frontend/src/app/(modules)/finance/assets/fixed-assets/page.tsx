'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  TrendingDown,
  Calendar,
  Wrench,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { FinanceService } from '@/services/finance.service';

interface FixedAsset {
  id: string;
  assetCode: string;
  assetName: string;
  category: 'Land & Building' | 'Plant & Machinery' | 'Furniture & Fixtures' | 'Vehicles' | 'Computers' | 'Office Equipment';
  location: string;
  purchaseDate: string;
  purchaseValue: number;
  salvageValue: number;
  usefulLife: number;
  depreciationMethod: 'Straight Line' | 'Written Down Value' | 'Double Declining' | 'Units of Production' | 'Sum of Years Digits';
  accumulatedDepreciation: number;
  netBookValue: number;
  status: 'Active' | 'Disposed' | 'Under Maintenance' | 'Idle';
  lastDepreciationDate: string;
  nextDepreciationDate: string;
  maintenanceSchedule?: string;
  warrantyExpiry?: string;
  insuranceExpiry?: string;
}

export default function FixedAssetsPage() {
  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewAsset, setViewAsset] = useState<FixedAsset | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [formAsset, setFormAsset] = useState<FixedAsset | null>(null);
  const [saving, setSaving] = useState(false);
  const [depreciatingId, setDepreciatingId] = useState<string | null>(null);

  const emptyForm: FixedAsset = {
    id: '',
    assetCode: '',
    assetName: '',
    category: 'Office Equipment',
    location: '',
    purchaseDate: '',
    purchaseValue: 0,
    salvageValue: 0,
    usefulLife: 0,
    depreciationMethod: 'Straight Line',
    accumulatedDepreciation: 0,
    netBookValue: 0,
    status: 'Active',
    lastDepreciationDate: '',
    nextDepreciationDate: '',
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend already returns most fields with matching names; coerce
        // numerics and cast union-typed strings to satisfy the interface.
        const raw = (await FinanceService.getFixedAssets()) as any[];
        const mapped: FixedAsset[] = raw.map((a) => ({
          id: String(a.id ?? ''),
          assetCode: a.assetCode ?? '',
          assetName: a.assetName ?? '',
          category: (a.category ?? 'Office Equipment') as FixedAsset['category'],
          location: a.location ?? '',
          purchaseDate: a.purchaseDate ?? '',
          purchaseValue: Number(a.purchaseValue ?? 0),
          salvageValue: Number(a.salvageValue ?? 0),
          usefulLife: Number(a.usefulLife ?? 0),
          depreciationMethod: (a.depreciationMethod ?? 'Straight Line') as FixedAsset['depreciationMethod'],
          accumulatedDepreciation: Number(a.accumulatedDepreciation ?? 0),
          netBookValue: Number(a.netBookValue ?? 0),
          status: (a.status ?? 'Active') as FixedAsset['status'],
          lastDepreciationDate: a.lastDepreciationDate ?? '',
          nextDepreciationDate: a.nextDepreciationDate ?? '',
          warrantyExpiry: a.warrantyExpiry ?? undefined,
          insuranceExpiry: a.insuranceExpiry ?? undefined,
        }));
        if (!cancelled) setFixedAssets(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load fixed assets');
          setFixedAssets([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // Toast notification handler
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Action handlers
  const handleAddAsset = () => {
    setFormMode('add');
    setFormAsset({ ...emptyForm });
  };

  const handleViewAsset = (asset: FixedAsset) => {
    setViewAsset(asset);
  };

  const handleEditAsset = (asset: FixedAsset) => {
    setFormMode('edit');
    setFormAsset({ ...asset });
  };

  const handleSaveAsset = async () => {
    if (!formAsset) return;
    if (!formAsset.assetName.trim()) {
      showToast('Asset name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        assetCode: formAsset.assetCode,
        assetName: formAsset.assetName,
        category: formAsset.category,
        location: formAsset.location,
        purchaseDate: formAsset.purchaseDate || undefined,
        purchaseValue: Number(formAsset.purchaseValue),
        salvageValue: Number(formAsset.salvageValue),
        usefulLife: Number(formAsset.usefulLife),
        depreciationMethod: formAsset.depreciationMethod,
        status: formAsset.status,
      };
      if (formMode === 'edit') {
        await FinanceService.updateFixedAsset(formAsset.id, payload);
        showToast(`Asset "${formAsset.assetName}" updated`, 'success');
      } else {
        await FinanceService.createFixedAsset(payload);
        showToast(`Asset "${formAsset.assetName}" created`, 'success');
      }
      setFormMode(null);
      setFormAsset(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save asset', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDepreciation = async (asset: FixedAsset) => {
    // Compute this period's straight-line-equivalent monthly charge from the
    // asset's own already-fetched fields, then post it as a manual entry.
    const depreciableBase = Math.max(0, asset.purchaseValue - asset.salvageValue);
    const monthly = asset.usefulLife > 0 ? depreciableBase / asset.usefulLife / 12 : 0;
    if (!(monthly > 0)) {
      showToast('Cannot compute depreciation: missing useful life or value', 'error');
      return;
    }
    const confirmed = confirm(
      `Post monthly depreciation of ${formatCurrency(monthly)} for ${asset.assetName}?`,
    );
    if (!confirmed) return;
    setDepreciatingId(asset.id);
    try {
      await FinanceService.manualDepreciationEntry(asset.assetCode, Math.round(monthly));
      showToast(`Depreciation of ${formatCurrency(monthly)} posted for ${asset.assetName}`, 'success');
      setRefreshKey((k) => k + 1);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to post depreciation', 'error');
    } finally {
      setDepreciatingId(null);
    }
  };

  const handleExport = () => {
    exportToCsv('fixed-assets', filteredAssets as unknown as Record<string, unknown>[]);
  };

  const filteredAssets = fixedAssets.filter(asset => {
    const matchesSearch =
      asset.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate statistics
  const totalGrossValue = fixedAssets
    .filter(a => a.status !== 'Disposed')
    .reduce((sum, asset) => sum + asset.purchaseValue, 0);

  const totalDepreciation = fixedAssets
    .filter(a => a.status !== 'Disposed')
    .reduce((sum, asset) => sum + asset.accumulatedDepreciation, 0);

  const totalNetValue = fixedAssets
    .filter(a => a.status !== 'Disposed')
    .reduce((sum, asset) => sum + asset.netBookValue, 0);

  const maintenanceCount = fixedAssets.filter(a => a.status === 'Under Maintenance').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Active: 'bg-green-500/20 text-green-400 border-green-500/50',
      Disposed: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
      'Under Maintenance': 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      Idle: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
    };
    const icons = {
      Active: CheckCircle,
      Disposed: XCircle,
      'Under Maintenance': Wrench,
      Idle: AlertCircle
    };
    const Icon = icons[status as keyof typeof icons];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Land & Building': 'bg-purple-500/20 text-purple-400',
      'Plant & Machinery': 'bg-blue-500/20 text-blue-400',
      'Furniture & Fixtures': 'bg-green-500/20 text-green-400',
      'Vehicles': 'bg-orange-500/20 text-orange-400',
      'Computers': 'bg-cyan-500/20 text-cyan-400',
      'Office Equipment': 'bg-pink-500/20 text-pink-400'
    };
    return colors[category as keyof typeof colors];
  };

  const getDepreciationPercentage = (accumulated: number, purchase: number) => {
    return ((accumulated / purchase) * 100).toFixed(1);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full p-3">
          <div className="w-full space-y-3">
            {/* Toast Notification */}
            {toast && (
              <div className={`fixed top-4 right-4 z-50 px-3 py-2 rounded-lg shadow-lg border-l-4 animate-slide-in ${toast.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
                  toast.type === 'error' ? 'bg-red-50 border-red-500 text-red-800' :
                    'bg-blue-50 border-blue-500 text-blue-800'
                }`}>
                <div className="flex items-center gap-3">
                  {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
                  {toast.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600" />}
                  <span className="font-medium">{toast.message}</span>
                </div>
              </div>
            )}

            {/* Loading / Error Banners */}
            {isLoading && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                Loading fixed assets…
              </div>
            )}
            {loadError && !isLoading && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" />
                {loadError}
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Fixed Assets Register</h1>
                <p className="text-gray-600">Track and manage fixed assets and depreciation</p>
              </div>
              <button
                onClick={handleAddAsset}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-colors shadow-lg">
                <Plus className="w-5 h-5" />
                Add Asset
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-8 h-8 opacity-80" />
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold mb-1">{formatCurrency(totalGrossValue)}</div>
                <div className="text-blue-100 text-sm">Total Gross Value</div>
                <div className="mt-2 text-xs text-blue-100">{fixedAssets.filter(a => a.status !== 'Disposed').length} active assets</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <TrendingDown className="w-8 h-8 opacity-80" />
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold mb-1">{formatCurrency(totalDepreciation)}</div>
                <div className="text-orange-100 text-sm">Accumulated Depreciation</div>
                <div className="mt-2 text-xs text-orange-100">
                  {((totalDepreciation / totalGrossValue) * 100).toFixed(1)}% of gross value
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-8 h-8 opacity-80" />
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold mb-1">{formatCurrency(totalNetValue)}</div>
                <div className="text-green-100 text-sm">Net Book Value</div>
                <div className="mt-2 text-xs text-green-100">Current asset value</div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Wrench className="w-8 h-8 opacity-80" />
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold mb-1">{maintenanceCount}</div>
                <div className="text-red-100 text-sm">Under Maintenance</div>
                <div className="mt-2 text-xs text-red-100">Requires attention</div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by asset name, code, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="Land & Building">Land & Building</option>
                    <option value="Plant & Machinery">Plant & Machinery</option>
                    <option value="Furniture & Fixtures">Furniture & Fixtures</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Computers">Computers</option>
                    <option value="Office Equipment">Office Equipment</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Disposed">Disposed</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Idle">Idle</option>
                  </select>
                </div>

                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors shadow-sm">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Fixed Assets Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Asset Details</th>
                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Category</th>
                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Location</th>
                      <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Purchase Value</th>
                      <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Depreciation</th>
                      <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Net Book Value</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map((asset, index) => (
                      <tr key={asset.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2">
                          <div>
                            <div className="font-medium text-gray-900">{asset.assetName}</div>
                            <div className="text-sm text-gray-600 font-mono">{asset.assetCode}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Purchased: {new Date(asset.purchaseDate).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(asset.category)}`}>
                            {asset.category}
                          </span>
                          <div className="text-xs text-gray-600 mt-1">{asset.depreciationMethod}</div>
                        </td>
                        <td className="px-3 py-2 text-gray-700 text-sm">{asset.location}</td>
                        <td className="px-3 py-2 text-right">
                          <div className="text-gray-900 font-medium">{formatCurrency(asset.purchaseValue)}</div>
                          <div className="text-xs text-gray-600 mt-1">Life: {asset.usefulLife} years</div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="text-orange-600 font-medium">{formatCurrency(asset.accumulatedDepreciation)}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {getDepreciationPercentage(asset.accumulatedDepreciation, asset.purchaseValue)}%
                          </div>
                          <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-orange-500 h-1.5 rounded-full"
                              style={{
                                width: `${getDepreciationPercentage(asset.accumulatedDepreciation, asset.purchaseValue)}%`
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="text-green-600 font-medium">{formatCurrency(asset.netBookValue)}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            Salvage: {formatCurrency(asset.salvageValue)}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center">
                          {getStatusBadge(asset.status)}
                          {asset.warrantyExpiry && (
                            <div className="text-xs text-gray-600 mt-1">
                              Warranty: {new Date(asset.warrantyExpiry).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewAsset(asset)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleEditAsset(asset)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit Asset"
                            >
                              <Edit className="w-4 h-4 text-green-600" />
                            </button>
                            <button
                              onClick={() => handleDepreciation(asset)}
                              disabled={depreciatingId === asset.id || asset.status === 'Disposed'}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Run Depreciation"
                            >
                              <TrendingDown className="w-4 h-4 text-orange-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAssets.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mb-2" />
                  <p className="text-gray-600 text-lg">No fixed assets found</p>
                  <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredAssets.length > 0 && (
              <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                <div className="text-gray-600 text-sm">
                  Showing {filteredAssets.length} of {fixedAssets.length} assets
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Previous
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
                  <button className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Asset Modal (from already-fetched data) */}
      {viewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">{viewAsset.assetName}</h2>
              <button onClick={() => setViewAsset(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 text-sm">
              {[
                ['Asset Code', viewAsset.assetCode],
                ['Category', viewAsset.category],
                ['Location', viewAsset.location],
                ['Status', viewAsset.status],
                ['Purchase Date', viewAsset.purchaseDate ? new Date(viewAsset.purchaseDate).toLocaleDateString() : '-'],
                ['Purchase Value', formatCurrency(viewAsset.purchaseValue)],
                ['Salvage Value', formatCurrency(viewAsset.salvageValue)],
                ['Useful Life', `${viewAsset.usefulLife} years`],
                ['Depreciation Method', viewAsset.depreciationMethod],
                ['Accumulated Depreciation', formatCurrency(viewAsset.accumulatedDepreciation)],
                ['Net Book Value', formatCurrency(viewAsset.netBookValue)],
                ['Last Depreciation', viewAsset.lastDepreciationDate ? new Date(viewAsset.lastDepreciationDate).toLocaleDateString() : '-'],
                ['Next Depreciation', viewAsset.nextDepreciationDate ? new Date(viewAsset.nextDepreciationDate).toLocaleDateString() : '-'],
                ['Warranty Expiry', viewAsset.warrantyExpiry ? new Date(viewAsset.warrantyExpiry).toLocaleDateString() : '-'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-gray-500">{label}</div>
                  <div className="font-medium text-gray-900">{value}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end px-4 py-3 border-t border-gray-200">
              <button onClick={() => setViewAsset(null)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Asset Modal */}
      {formMode && formAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {formMode === 'edit' ? 'Edit Asset' : 'Add Asset'}
              </h2>
              <button onClick={() => { setFormMode(null); setFormAsset(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="text-gray-700">Asset Code</span>
                <input value={formAsset.assetCode} onChange={(e) => setFormAsset({ ...formAsset, assetCode: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Asset Name *</span>
                <input value={formAsset.assetName} onChange={(e) => setFormAsset({ ...formAsset, assetName: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Category</span>
                <select value={formAsset.category} onChange={(e) => setFormAsset({ ...formAsset, category: e.target.value as FixedAsset['category'] })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {['Land & Building', 'Plant & Machinery', 'Furniture & Fixtures', 'Vehicles', 'Computers', 'Office Equipment'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Location</span>
                <input value={formAsset.location} onChange={(e) => setFormAsset({ ...formAsset, location: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Purchase Date</span>
                <input type="date" value={formAsset.purchaseDate?.slice(0, 10) ?? ''} onChange={(e) => setFormAsset({ ...formAsset, purchaseDate: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Depreciation Method</span>
                <select value={formAsset.depreciationMethod} onChange={(e) => setFormAsset({ ...formAsset, depreciationMethod: e.target.value as FixedAsset['depreciationMethod'] })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {['Straight Line', 'Written Down Value', 'Double Declining', 'Units of Production', 'Sum of Years Digits'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Purchase Value</span>
                <input type="number" value={formAsset.purchaseValue} onChange={(e) => setFormAsset({ ...formAsset, purchaseValue: Number(e.target.value) })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Salvage Value</span>
                <input type="number" value={formAsset.salvageValue} onChange={(e) => setFormAsset({ ...formAsset, salvageValue: Number(e.target.value) })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Useful Life (years)</span>
                <input type="number" value={formAsset.usefulLife} onChange={(e) => setFormAsset({ ...formAsset, usefulLife: Number(e.target.value) })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="text-sm">
                <span className="text-gray-700">Status</span>
                <select value={formAsset.status} onChange={(e) => setFormAsset({ ...formAsset, status: e.target.value as FixedAsset['status'] })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {['Active', 'Disposed', 'Under Maintenance', 'Idle'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200">
              <button onClick={() => { setFormMode(null); setFormAsset(null); }}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg">
                Cancel
              </button>
              <button onClick={handleSaveAsset} disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">
                {saving ? 'Saving…' : formMode === 'edit' ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
