'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Download, Filter, X, Hash, AlertCircle, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ModalWrapper } from '@/components/ui/ModalWrapper';
import { systemMastersService, NumberSeries } from '@/services/system-masters.service';
import { exportToCsv } from '@/lib/export';

export default function NumberSeriesMasterPage() {
  const [numberSeries, setNumberSeries] = useState<NumberSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const COMPANY_ID = '123e4567-e89b-12d3-a456-426614174000';

  const fetchSeries = async () => {
    setIsLoading(true);
    try {
      const data = await systemMastersService.getAllNumberSeries(COMPANY_ID);
      setNumberSeries(data);
    } catch (error) {
      showToast('Failed to fetch number series', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeries();
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

  const [viewSeries, setViewSeries] = useState<NumberSeries | null>(null);

  // Add/Edit form modal state
  const emptyForm = {
    seriesCode: '',
    seriesName: '',
    documentType: '',
    module: 'sales',
    prefix: '',
    suffix: '',
    separator: '-',
    paddingLength: 4,
    startingNumber: 1,
    endingNumber: 999999,
    currentNumber: 1,
    incrementBy: 1,
    resetFrequency: 'never',
    allowManualEntry: false,
    validateSequence: true,
    defaultSeries: false,
    isActive: true,
  };
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [isSaving, setIsSaving] = useState(false);

  const handleViewSeries = (row: NumberSeries) => {
    // Open a details modal with the row data (real UX, no fake toast).
    setViewSeries(row);
  };

  const handleEditSeries = (row: NumberSeries) => {
    setFormMode('edit');
    setEditingId(row.id);
    setFormData({
      seriesCode: row.seriesCode,
      seriesName: row.seriesName,
      documentType: row.documentType,
      module: row.module,
      prefix: row.prefix || '',
      suffix: row.suffix || '',
      separator: row.separator || '-',
      paddingLength: row.paddingLength,
      startingNumber: row.startingNumber,
      endingNumber: row.endingNumber,
      currentNumber: row.currentNumber,
      incrementBy: row.incrementBy,
      resetFrequency: row.resetFrequency,
      allowManualEntry: row.allowManualEntry,
      validateSequence: row.validateSequence,
      defaultSeries: row.defaultSeries,
      isActive: row.isActive,
    });
    setIsFormOpen(true);
  };

  const handleExport = () => {
    exportToCsv('number-series-master', filteredData);
    showToast('Exporting number series data...', 'success');
  };

  const handleAddSeries = () => {
    setFormMode('create');
    setEditingId(null);
    setFormData({ ...emptyForm });
    setIsFormOpen(true);
  };

  const handleSaveSeries = async () => {
    if (!formData.seriesName.trim()) {
      showToast('Series name is required', 'error');
      return;
    }
    if (formMode === 'create' && !formData.seriesCode.trim()) {
      showToast('Series code is required', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        seriesName: formData.seriesName,
        documentType: formData.documentType,
        module: formData.module,
        prefix: formData.prefix,
        suffix: formData.suffix,
        separator: formData.separator,
        paddingLength: Number(formData.paddingLength),
        startingNumber: Number(formData.startingNumber),
        endingNumber: Number(formData.endingNumber),
        currentNumber: Number(formData.currentNumber),
        incrementBy: Number(formData.incrementBy),
        resetFrequency: formData.resetFrequency,
        allowManualEntry: formData.allowManualEntry,
        validateSequence: formData.validateSequence,
        defaultSeries: formData.defaultSeries,
        isActive: formData.isActive,
      };
      if (formMode === 'edit' && editingId) {
        await systemMastersService.updateNumberSeries(editingId, payload);
        showToast('Number series updated', 'success');
      } else {
        await systemMastersService.createNumberSeries({
          ...payload,
          seriesCode: formData.seriesCode,
          companyId: COMPANY_ID,
        });
        showToast('Number series created', 'success');
      }
      setIsFormOpen(false);
      await fetchSeries();
    } catch (error) {
      showToast(formMode === 'edit' ? 'Failed to update number series' : 'Failed to create number series', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered data
  const filteredData = useMemo(() => {
    return numberSeries.filter(series => {
      const matchesSearch =
        series.seriesName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        series.seriesCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        series.documentType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesModule = filterModule === 'all' || series.module === filterModule;

      return matchesSearch && matchesModule;
    });
  }, [numberSeries, searchTerm, filterModule]);

  const getModuleColor = (module: string) => {
    const colors = {
      'sales': 'bg-blue-100 text-blue-800',
      'purchase': 'bg-green-100 text-green-800',
      'inventory': 'bg-purple-100 text-purple-800',
      'finance': 'bg-yellow-100 text-yellow-800',
      'hr': 'bg-pink-100 text-pink-800',
      'production': 'bg-orange-100 text-orange-800',
      'quality': 'bg-indigo-100 text-indigo-800'
    };
    return colors[module as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getUsagePercentage = (series: NumberSeries) => {
    const total = series.endingNumber - series.startingNumber;
    if (total === 0) return 0;
    return Math.round(((series.currentNumber - series.startingNumber) / total) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Construct current format sample
  const getFormatSample = (row: NumberSeries) => {
    const num = row.currentNumber.toString().padStart(row.paddingLength, '0');
    return `${row.prefix || ''}${row.separator || ''}${num}${row.suffix || ''}`;
  };

  // Table columns
  const columns: Column<NumberSeries>[] = [
    {
      id: 'series',
      header: 'Series',
      accessor: 'seriesName',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{String(value)}</div>
          <div className="text-xs text-gray-500">
            <span className="font-mono font-semibold text-blue-600">{row.seriesCode}</span>
          </div>
          <div className="text-xs text-gray-500">{row.documentType}</div>
        </div>
      )
    },
    {
      id: 'module',
      header: 'Module',
      accessor: 'module',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getModuleColor(String(value))}`}>
          {String(value)}
        </span>
      )
    },
    {
      id: 'format',
      header: 'Format Sample',
      accessor: 'id',
      sortable: false,
      render: (_, row) => (
        <div className="text-sm">
          <div className="font-mono font-medium text-gray-900">{getFormatSample(row)}</div>
          <div className="text-xs text-gray-500">
            Reset: {row.resetFrequency}
          </div>
        </div>
      )
    },
    {
      id: 'current',
      header: 'Current Number',
      accessor: 'currentNumber',
      sortable: true,
      render: (value, row) => {
        const usage = getUsagePercentage(row);
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900">{String(value)}</div>
            <div className={`text-xs font-medium ${getUsageColor(usage)}`}>
              {usage}% used
              {usage >= 80 && <AlertCircle className="inline w-3 h-3 ml-1" />}
            </div>
          </div>
        );
      }
    },
    {
      id: 'range',
      header: 'Range',
      accessor: 'startingNumber',
      sortable: false,
      render: (value, row) => (
        <div className="text-sm text-gray-600">
          {String(value)} - {row.endingNumber}
        </div>
      )
    },
    {
      id: 'settings',
      header: 'Settings',
      accessor: 'allowManualEntry',
      sortable: false,
      render: (value, row) => (
        <div className="text-xs space-y-0.5">
          {row.defaultSeries && <div className="text-blue-600">✓ Default</div>}
          {value && <div className="text-green-600">✓ Manual Entry</div>}
          {row.validateSequence && <div className="text-purple-600">✓ Validate</div>}
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
              handleViewSeries(row);
            }}
          >
            View
          </button>
          <button
            className="text-green-600 hover:text-green-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleEditSeries(row);
            }}
          >
            Edit
          </button>
        </div>
      )
    }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setFilterModule('all');
  };

  const activeFilterCount = [
    filterModule !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  // Simple stats
  const stats = useMemo(() => ({
    total: numberSeries.length,
    active: numberSeries.filter(s => s.isActive).length,
    nearingLimit: numberSeries.filter(s => getUsagePercentage(s) >= 90).length,
    production: numberSeries.filter(s => s.module === 'production').length,
    sales: numberSeries.filter(s => s.module === 'sales').length,
    totalGenerated: numberSeries.reduce((acc, s) => acc + (s.currentNumber - s.startingNumber), 0)
  }), [numberSeries]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-indigo-50 to-violet-50">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
          <div className={`rounded-lg shadow-lg p-3 ${toast.type === 'success' ? 'bg-green-50 border border-green-200' :
            toast.type === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
            <div className="flex items-start gap-3">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
              {toast.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />}
              <p className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-800' :
                toast.type === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}>{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-none p-3 pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Hash className="w-7 h-7 text-indigo-600" />
              Number Series Master
            </h1>
            <p className="text-gray-600 mt-1">Manage document numbering sequences across modules</p>
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
              onClick={handleAddSeries}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Series</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Total Series</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-orange-600" /> Near Limit
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.nearingLimit}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Production</div>
            <div className="text-2xl font-bold text-orange-600">{stats.production}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Sales</div>
            <div className="text-2xl font-bold text-indigo-600">{stats.sales}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Total Docs
            </div>
            <div className="text-2xl font-bold text-purple-600">{(stats.totalGenerated / 1000).toFixed(1)}K</div>
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
                  placeholder="Search by series name, code, or document type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-600 rounded-full">
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

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-1 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Module
                  </label>
                  <select
                    value={filterModule}
                    onChange={(e) => setFilterModule(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All Modules</option>
                    <option value="sales">Sales</option>
                    <option value="purchase">Purchase</option>
                    <option value="inventory">Inventory</option>
                    <option value="finance">Finance</option>
                    <option value="hr">HR</option>
                    <option value="production">Production</option>
                    <option value="quality">Quality</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Data Table */}
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
                defaultSort: { column: 'series', direction: 'asc' }
              }}
              emptyMessage="No number series found"
              emptyDescription="Try adjusting your search or filters to find what you're looking for."
            />
          </div>
        </div>
      </div>

      {/* Series details modal */}
      <ModalWrapper
        isOpen={!!viewSeries}
        onClose={() => setViewSeries(null)}
        title={viewSeries ? `Series: ${viewSeries.seriesName}` : 'Number Series'}
        size="md"
      >
        {viewSeries && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-500">Code</div>
                <div className="font-mono font-medium text-gray-900">{viewSeries.seriesCode}</div>
              </div>
              <div>
                <div className="text-gray-500">Module</div>
                <div className="font-medium capitalize text-gray-900">{viewSeries.module}</div>
              </div>
              <div>
                <div className="text-gray-500">Document Type</div>
                <div className="font-medium text-gray-900">{viewSeries.documentType}</div>
              </div>
              <div>
                <div className="text-gray-500">Current Format</div>
                <div className="font-mono font-medium text-gray-900">{getFormatSample(viewSeries)}</div>
              </div>
              <div>
                <div className="text-gray-500">Current Number</div>
                <div className="font-medium text-gray-900">{viewSeries.currentNumber}</div>
              </div>
              <div>
                <div className="text-gray-500">Range</div>
                <div className="font-medium text-gray-900">{viewSeries.startingNumber} - {viewSeries.endingNumber}</div>
              </div>
              <div>
                <div className="text-gray-500">Increment By</div>
                <div className="font-medium text-gray-900">{viewSeries.incrementBy}</div>
              </div>
              <div>
                <div className="text-gray-500">Reset Frequency</div>
                <div className="font-medium capitalize text-gray-900">{viewSeries.resetFrequency}</div>
              </div>
              <div>
                <div className="text-gray-500">Prefix / Suffix</div>
                <div className="font-medium text-gray-900">{viewSeries.prefix || '-'} / {viewSeries.suffix || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">Status</div>
                <div className="font-medium text-gray-900">{viewSeries.isActive ? 'Active' : 'Inactive'}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              {viewSeries.defaultSeries && <span className="text-blue-600">✓ Default</span>}
              {viewSeries.allowManualEntry && <span className="text-green-600">✓ Manual Entry</span>}
              {viewSeries.validateSequence && <span className="text-purple-600">✓ Validate Sequence</span>}
              {viewSeries.allowDuplicates && <span className="text-orange-600">✓ Allow Duplicates</span>}
            </div>
          </div>
        )}
      </ModalWrapper>

      {/* Add / Edit number series form modal */}
      <ModalWrapper
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={formMode === 'edit' ? 'Edit Number Series' : 'Add Number Series'}
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveSeries();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Series Code</label>
              <input
                type="text"
                value={formData.seriesCode}
                onChange={(e) => setFormData({ ...formData, seriesCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                required={formMode === 'create'}
                disabled={formMode === 'edit'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Series Name</label>
              <input
                type="text"
                value={formData.seriesName}
                onChange={(e) => setFormData({ ...formData, seriesName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <input
                type="text"
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
              <select
                value={formData.module}
                onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent capitalize"
              >
                {['sales', 'purchase', 'inventory', 'finance', 'hr', 'production', 'quality'].map((m) => (
                  <option key={m} value={m} className="capitalize">{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prefix</label>
              <input
                type="text"
                value={formData.prefix}
                onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Suffix</label>
              <input
                type="text"
                value={formData.suffix}
                onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Separator</label>
              <input
                type="text"
                value={formData.separator}
                onChange={(e) => setFormData({ ...formData, separator: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Padding Length</label>
              <input
                type="number"
                value={formData.paddingLength}
                onChange={(e) => setFormData({ ...formData, paddingLength: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Starting Number</label>
              <input
                type="number"
                value={formData.startingNumber}
                onChange={(e) => setFormData({ ...formData, startingNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ending Number</label>
              <input
                type="number"
                value={formData.endingNumber}
                onChange={(e) => setFormData({ ...formData, endingNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Number</label>
              <input
                type="number"
                value={formData.currentNumber}
                onChange={(e) => setFormData({ ...formData, currentNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Increment By</label>
              <input
                type="number"
                value={formData.incrementBy}
                onChange={(e) => setFormData({ ...formData, incrementBy: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reset Frequency</label>
              <select
                value={formData.resetFrequency}
                onChange={(e) => setFormData({ ...formData, resetFrequency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent capitalize"
              >
                {['never', 'daily', 'monthly', 'yearly'].map((f) => (
                  <option key={f} value={f} className="capitalize">{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formData.defaultSeries}
                onChange={(e) => setFormData({ ...formData, defaultSeries: e.target.checked })}
                className="w-4 h-4"
              />
              Default Series
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formData.allowManualEntry}
                onChange={(e) => setFormData({ ...formData, allowManualEntry: e.target.checked })}
                className="w-4 h-4"
              />
              Manual Entry
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formData.validateSequence}
                onChange={(e) => setFormData({ ...formData, validateSequence: e.target.checked })}
                className="w-4 h-4"
              />
              Validate Sequence
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : formMode === 'edit' ? 'Save Changes' : 'Create Series'}
            </button>
          </div>
        </form>
      </ModalWrapper>
    </div>
  );
}
