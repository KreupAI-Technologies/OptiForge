'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Download, Filter, X, ArrowRightLeft, Calculator, Scale, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { UOMConversion, getCategoryDisplayName } from '@/data/common-masters/uom-conversions';
import { commonMastersService } from '@/services/common-masters.service';

const DEFAULT_COMPANY_ID = '1';

interface UomOption {
  id: string;
  code: string;
  name: string;
}

export default function UomconversionmasterPage() {
  const [conversions, setConversions] = useState<UOMConversion[]>([]);
  const [uoms, setUoms] = useState<UomOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedConversion, setSelectedConversion] = useState<UOMConversion | null>(null);
  const [calcFromValue, setCalcFromValue] = useState<number>(1);
  const [calcToValue, setCalcToValue] = useState<number>(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [savingRow, setSavingRow] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ fromUomId: string; toUomId: string; conversionFactor: string }>({
    fromUomId: '',
    toUomId: '',
    conversionFactor: '',
  });

  const mapConversion = (u: any): UOMConversion => {
    const fromUOM = u.fromUom?.code ?? u.fromUom?.name ?? u.fromUOM ?? '';
    const toUOM = u.toUom?.code ?? u.toUom?.name ?? u.toUOM ?? '';
    const factor = Number(u.factor ?? u.conversionFactor ?? 0);
    return {
      id: String(u.id ?? ''),
      conversionCode: u.conversionCode ?? (fromUOM && toUOM ? `${fromUOM}-${toUOM}` : ''),
      fromUOM,
      toUOM,
      conversionFactor: factor,
      category: (u.category ?? 'quantity') as UOMConversion['category'],
      isReversible: u.isReversible ?? true,
      formula: u.formula ?? (fromUOM && toUOM ? `1 ${fromUOM} = ${factor} ${toUOM}` : ''),
      description: u.description ?? '',
      examples: u.examples ?? '',
      isActive: u.isActive ?? true,
      lastUpdated: u.lastUpdated ?? u.updatedAt ?? '',
      usageCount: Number(u.usageCount ?? 0),
    };
  };

  // Fetch UOM conversions (and UOMs for the add form) from the live backend.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [raw, rawUoms] = await Promise.all([
          commonMastersService.getAllUomConversions(DEFAULT_COMPANY_ID) as Promise<any[]>,
          commonMastersService.getAllUoms(DEFAULT_COMPANY_ID) as Promise<any[]>,
        ]);
        if (cancelled) return;
        setConversions((raw ?? []).map(mapConversion));
        setUoms((rawUoms ?? []).map((u) => ({ id: String(u.id ?? ''), code: u.code ?? '', name: u.name ?? '' })));
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load UOM conversions');
          setConversions([]);
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

  const reload = async () => {
    try {
      const raw = (await commonMastersService.getAllUomConversions(DEFAULT_COMPANY_ID)) as any[];
      setConversions((raw ?? []).map(mapConversion));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reload UOM conversions');
    }
  };

  const handleDelete = async (row: UOMConversion) => {
    if (!confirm(`Delete conversion ${row.fromUOM} to ${row.toUOM}?`)) return;
    setActionError(null);
    try {
      await commonMastersService.deleteUomConversion(row.id);
      setConversions((prev) => prev.filter((c) => c.id !== row.id));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete conversion');
    }
  };

  const handleEdit = (row: UOMConversion) => {
    setActionError(null);
    // Resolve UOM ids from the displayed code/name so the selects pre-populate.
    const fromMatch = uoms.find((u) => u.code === row.fromUOM || u.name === row.fromUOM);
    const toMatch = uoms.find((u) => u.code === row.toUOM || u.name === row.toUOM);
    setEditingId(row.id);
    setForm({
      fromUomId: fromMatch?.id ?? '',
      toUomId: toMatch?.id ?? '',
      conversionFactor: String(row.conversionFactor ?? ''),
    });
    setShowAddForm(true);
  };

  const handleSave = async () => {
    setActionError(null);
    const factor = parseFloat(form.conversionFactor);
    if (!form.fromUomId || !form.toUomId || !Number.isFinite(factor)) {
      setActionError('Select both UOMs and enter a valid factor.');
      return;
    }
    setSavingRow(true);
    try {
      if (editingId) {
        await commonMastersService.updateUomConversion(editingId, {
          fromUomId: form.fromUomId,
          toUomId: form.toUomId,
          conversionFactor: factor,
        });
      } else {
        await commonMastersService.createUomConversion({
          fromUomId: form.fromUomId,
          toUomId: form.toUomId,
          conversionFactor: factor,
          companyId: DEFAULT_COMPANY_ID,
        });
      }
      setForm({ fromUomId: '', toUomId: '', conversionFactor: '' });
      setEditingId(null);
      setShowAddForm(false);
      await reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to save conversion');
    } finally {
      setSavingRow(false);
    }
  };

  const filteredData = useMemo(() => {
    return conversions.filter(conversion => {
      const matchesSearch =
        conversion.fromUOM.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversion.toUOM.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversion.conversionCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || conversion.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [conversions, searchTerm, filterCategory]);

  const getCategoryColor = (category: string) => {
    const colors = {
      'weight': 'bg-blue-100 text-blue-800',
      'length': 'bg-green-100 text-green-800',
      'volume': 'bg-purple-100 text-purple-800',
      'area': 'bg-yellow-100 text-yellow-800',
      'quantity': 'bg-orange-100 text-orange-800',
      'time': 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleCalculate = (conversion: UOMConversion, fromValue: number) => {
    if (conversion.category === 'temperature' && conversion.fromUOM.includes('Celsius')) {
      return (fromValue * conversion.conversionFactor) + 32;
    }
    return fromValue * conversion.conversionFactor;
  };

  const columns: Column<UOMConversion>[] = [
    {
      id: 'conversion',
      header: 'Conversion',
      accessor: 'conversionCode',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 flex items-center gap-2">
            <span>{row.fromUOM}</span>
            <ArrowRightLeft className="w-4 h-4 text-gray-400" />
            <span>{row.toUOM}</span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            <span className="font-mono font-semibold text-blue-600">{value}</span>
          </div>
        </div>
      )
    },
    {
      id: 'category',
      header: 'Category',
      accessor: 'category',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getCategoryColor(value)}`}>
          {getCategoryDisplayName(value)}
        </span>
      )
    },
    {
      id: 'formula',
      header: 'Formula',
      accessor: 'formula',
      sortable: false,
      render: (value) => (
        <div className="font-mono text-sm font-medium text-gray-900">{value}</div>
      )
    },
    {
      id: 'factor',
      header: 'Factor',
      accessor: 'conversionFactor',
      sortable: true,
      align: 'right',
      render: (value, row) => (
        <div className="text-right">
          <div className="font-mono font-bold text-lg text-blue-600">{value.toLocaleString('en-IN', { maximumFractionDigits: 6 })}</div>
          {row.isReversible && <div className="text-xs text-green-600">↔️ Reversible</div>}
        </div>
      )
    },
    {
      id: 'usage',
      header: 'Usage',
      accessor: 'usageCount',
      sortable: true,
      align: 'right',
      render: (value) => (
        <div className="text-right">
          <div className="font-medium text-gray-900">{value.toLocaleString('en-IN')}</div>
          <div className="text-xs text-gray-500">transactions</div>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'isActive',
      sortable: true,
      render: (value) => (
        <StatusBadge status={value ? 'active' : 'inactive'} text={value ? 'Active' : 'Inactive'} />
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
            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedConversion(row);
              setCalcFromValue(1);
              setCalcToValue(handleCalculate(row, 1));
            }}
          >
            Calculate
          </button>
          <button
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
          >
            Edit
          </button>
          <button
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const stats = useMemo(() => ({
    total: conversions.length,
    weight: conversions.filter((c) => c.category === 'weight').length,
    length: conversions.filter((c) => c.category === 'length').length,
    volume: conversions.filter((c) => c.category === 'volume').length,
    area: conversions.filter((c) => c.category === 'area').length,
    quantity: conversions.filter((c) => c.category === 'quantity').length,
    reversible: conversions.filter((c) => c.isReversible).length,
    active: conversions.filter((c) => c.isActive).length,
    totalUsage: conversions.reduce((sum, c) => sum + c.usageCount, 0),
  }), [conversions]);

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ArrowRightLeft className="w-7 h-7 text-blue-600" />
            UOM Conversion Master
          </h1>
          <p className="text-gray-600 mt-1">Manage unit of measurement conversion factors and calculations</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => {
              setShowAddForm((v) => !v);
              setEditingId(null);
              setForm({ fromUomId: '', toUomId: '', conversionFactor: '' });
              setActionError(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Conversion</span>
          </button>
        </div>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {actionError}
        </div>
      )}

      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            {editingId ? 'Edit UOM Conversion' : 'Add UOM Conversion'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From UOM</label>
              <select
                value={form.fromUomId}
                onChange={(e) => setForm((f) => ({ ...f, fromUomId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select…</option>
                {uoms.map((u) => (
                  <option key={u.id} value={u.id}>{u.code} — {u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To UOM</label>
              <select
                value={form.toUomId}
                onChange={(e) => setForm((f) => ({ ...f, toUomId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select…</option>
                {uoms.map((u) => (
                  <option key={u.id} value={u.id}>{u.code} — {u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Factor</label>
              <input
                type="number"
                step="any"
                value={form.conversionFactor}
                onChange={(e) => setForm((f) => ({ ...f, conversionFactor: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
                placeholder="e.g. 1000"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={savingRow}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {savingRow ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                  setForm({ fromUomId: '', toUomId: '', conversionFactor: '' });
                  setActionError(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Total Conversions</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">⚖️ Weight</div>
          <div className="text-2xl font-bold text-blue-600">{stats.weight}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">📏 Length</div>
          <div className="text-2xl font-bold text-green-600">{stats.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">🧪 Volume</div>
          <div className="text-2xl font-bold text-purple-600">{stats.volume}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Reversible</div>
          <div className="text-2xl font-bold text-orange-600">{stats.reversible}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Total Usage</div>
          <div className="text-2xl font-bold text-teal-600">{stats.totalUsage.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {selectedConversion && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Quick Conversion Calculator
            </h3>
            <button onClick={() => setSelectedConversion(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">{selectedConversion.fromUOM}</label>
              <input
                type="number"
                value={calcFromValue}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setCalcFromValue(val);
                  setCalcToValue(handleCalculate(selectedConversion, val));
                }}
                className="w-full px-4 py-3 text-lg font-mono font-bold border-2 border-blue-300 rounded-lg"
                step="any"
              />
            </div>
            <ArrowRightLeft className="w-6 h-6 text-blue-600" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">{selectedConversion.toUOM}</label>
              <input
                type="number"
                value={calcToValue.toFixed(6)}
                readOnly
                className="w-full px-4 py-3 text-lg font-mono font-bold border-2 border-purple-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>
          <div className="mt-4 text-sm text-blue-800">
            <strong>Formula:</strong> {selectedConversion.formula}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by UOM, code, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Categories</option>
                <option value="weight">Weight</option>
                <option value="length">Length</option>
                <option value="volume">Volume</option>
                <option value="area">Area</option>
                <option value="quantity">Quantity</option>
                <option value="time">Time</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading UOM conversions…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && conversions.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No UOM conversions found.
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <DataTable
          data={filteredData}
          columns={columns}
          pagination={{ enabled: true, pageSize: 10 }}
          sorting={{ enabled: true, defaultSort: { column: 'conversion', direction: 'asc' } }}
          emptyMessage="No UOM conversions found"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Scale className="w-5 h-5" />
          UOM Conversion Guidelines
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>✓ <strong>Reversible Conversions:</strong> Can convert in both directions (e.g., kg ↔ g)</li>
          <li>✓ <strong>One-way Conversions:</strong> Fixed unit counts (e.g., Dozen → Pieces = 12)</li>
          <li>✓ <strong>Precision:</strong> Maintain up to 6 decimal places for accurate calculations</li>
          <li>✓ <strong>Usage Tracking:</strong> System tracks conversion usage for analytics</li>
          <li>✓ <strong>Auto-conversion:</strong> Quantities automatically converted in transactions</li>
        </ul>
      </div>
    </div>
  );
}
