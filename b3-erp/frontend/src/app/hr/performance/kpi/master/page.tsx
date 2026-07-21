'use client';

import { useState, useMemo, useEffect } from 'react';
import { Target, Plus, Search, Filter, Edit, Trash2, TrendingUp } from 'lucide-react';
import DataTable from '@/components/DataTable';
import StatusBadge, { BadgeStatus } from '@/components/StatusBadge';
import { PerformanceManagementService } from '@/services/performance-management.service';

interface KPI {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'production' | 'quality' | 'safety' | 'efficiency' | 'customer' | 'financial';
  measurementType: 'percentage' | 'count' | 'time' | 'currency' | 'ratio';
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  targetValue: number;
  calculationFormula?: string;
  department: string;
  status: 'active' | 'inactive';
}

/** Map a NestJS KPIMaster row onto the local KPI view-model. */
function mapKpi(r: any): KPI {
  return {
    id: r.id ?? '',
    code: r.kpiCode ?? '',
    name: r.kpiName ?? '',
    description: r.description ?? '',
    category: (r.category ?? 'production') as KPI['category'],
    measurementType: (r.measurementUnit ?? 'count') as KPI['measurementType'],
    unit: r.measurementUnit ?? '',
    frequency: (r.measurementFrequency ?? 'monthly') as KPI['frequency'],
    targetValue: Number(r.defaultTarget ?? 0),
    calculationFormula: r.calculationFormula ?? '',
    department: Array.isArray(r.applicableDepartments) ? (r.applicableDepartments[0] ?? '') : (r.department ?? ''),
    status: r.isActive === false ? 'inactive' : 'active',
  };
}

const emptyKpiForm = {
  kpiName: '',
  description: '',
  category: 'production',
  measurementUnit: 'number',
  measurementFrequency: 'monthly',
  defaultTarget: '',
  department: '',
};

export default function KPIMasterPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const [rows, setRows] = useState<KPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Add / Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyKpiForm });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await PerformanceManagementService.getKPIMasters();
      setRows(Array.isArray(data) ? data.map(mapKpi) : []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load data');
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyKpiForm });
    setSubmitError(null);
    setShowModal(true);
  };

  const openEdit = (kpi: KPI) => {
    setEditingId(kpi.id);
    setForm({
      kpiName: kpi.name,
      description: kpi.description,
      category: kpi.category,
      measurementUnit: kpi.unit || 'number',
      measurementFrequency: kpi.frequency,
      defaultTarget: String(kpi.targetValue ?? ''),
      department: kpi.department,
    });
    setSubmitError(null);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.kpiName.trim()) {
      setSubmitError('KPI name is required.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload: any = {
        kpiName: form.kpiName,
        description: form.description,
        category: form.category,
        kpiType: 'quantitative',
        measurementUnit: form.measurementUnit,
        measurementFrequency: form.measurementFrequency,
        defaultTarget: form.defaultTarget ? Number(form.defaultTarget) : undefined,
        applicableDepartments: form.department ? [form.department] : [],
      };
      if (editingId) {
        await PerformanceManagementService.updateKPIMaster(editingId, payload);
      } else {
        await PerformanceManagementService.createKPIMaster(payload);
      }
      setShowModal(false);
      await load();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save KPI.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (kpi: KPI) => {
    if (!window.confirm(`Delete KPI "${kpi.name}"? This cannot be undone.`)) return;
    setDeletingId(kpi.id);
    try {
      await PerformanceManagementService.deleteKPIMaster(kpi.id);
      await load();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to delete KPI.');
    } finally {
      setDeletingId(null);
    }
  };

  const departments = ['all', ...Array.from(new Set(rows.map(k => k.department)))];

  const filteredKPIs = useMemo(() => {
    return rows.filter(kpi => {
      const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           kpi.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || kpi.category === selectedCategory;
      const matchesDepartment = selectedDepartment === 'all' || kpi.department === selectedDepartment;
      return matchesSearch && matchesCategory && matchesDepartment;
    });
  }, [searchTerm, selectedCategory, selectedDepartment, rows]);

  const stats = {
    total: rows.length,
    production: rows.filter(k => k.category === 'production').length,
    quality: rows.filter(k => k.category === 'quality').length,
    safety: rows.filter(k => k.category === 'safety').length,
    efficiency: rows.filter(k => k.category === 'efficiency').length,
    active: rows.filter(k => k.status === 'active').length
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      production: 'bg-blue-100 text-blue-800',
      quality: 'bg-green-100 text-green-800',
      safety: 'bg-red-100 text-red-800',
      efficiency: 'bg-purple-100 text-purple-800',
      customer: 'bg-orange-100 text-orange-800',
      financial: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category as keyof typeof colors];
  };

  const getFrequencyColor = (frequency: string) => {
    const colors = {
      daily: 'bg-indigo-100 text-indigo-800',
      weekly: 'bg-cyan-100 text-cyan-800',
      monthly: 'bg-teal-100 text-teal-800',
      quarterly: 'bg-emerald-100 text-emerald-800',
      yearly: 'bg-lime-100 text-lime-800'
    };
    return colors[frequency as keyof typeof colors];
  };

  const columns = [
    { key: 'code', label: 'KPI Code', sortable: true,
      render: (v: string) => <div className="font-semibold text-gray-900">{v}</div>
    },
    { key: 'name', label: 'KPI Name', sortable: true,
      render: (v: string, row: KPI) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.description}</div>
        </div>
      )
    },
    { key: 'category', label: 'Category', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(v)}`}>
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </span>
      )
    },
    { key: 'targetValue', label: 'Target', sortable: true,
      render: (v: number, row: KPI) => (
        <div className="text-sm font-semibold text-gray-900">{v} {row.unit}</div>
      )
    },
    { key: 'frequency', label: 'Frequency', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getFrequencyColor(v)}`}>
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </span>
      )
    },
    { key: 'department', label: 'Department', sortable: true,
      render: (v: string) => <div className="text-sm text-gray-700">{v}</div>
    },
    { key: 'status', label: 'Status', sortable: true,
      render: (v: string) => <StatusBadge status={v as BadgeStatus} />
    },
    { key: 'id', label: 'Actions', sortable: false,
      render: (_v: string, row: KPI) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEdit(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit KPI"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            disabled={deletingId === row.id}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            title="Delete KPI"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Target className="h-8 w-8 text-emerald-600" />
          KPI Master
        </h1>
        <p className="text-gray-600 mt-2">Define and manage key performance indicators</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-white border-2 border-emerald-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total KPIs</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.total}</p>
            </div>
            <Target className="h-10 w-10 text-emerald-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Production</p>
              <p className="text-2xl font-bold text-blue-600">{stats.production}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quality</p>
              <p className="text-2xl font-bold text-green-600">{stats.quality}</p>
            </div>
            <Target className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Safety</p>
              <p className="text-2xl font-bold text-red-600">{stats.safety}</p>
            </div>
            <Target className="h-10 w-10 text-red-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Efficiency</p>
              <p className="text-2xl font-bold text-purple-600">{stats.efficiency}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.active}</p>
            </div>
            <Target className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search KPIs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Add KPI
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Categories</option>
                <option value="production">Production</option>
                <option value="quality">Quality</option>
                <option value="safety">Safety</option>
                <option value="efficiency">Efficiency</option>
                <option value="customer">Customer</option>
                <option value="financial">Financial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* KPI Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Key Performance Indicators</h3>
        </div>
        <DataTable data={filteredKPIs} columns={columns} />
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-emerald-900 mb-2">KPI Categories</h3>
        <ul className="text-sm text-emerald-800 space-y-1">
          <li>• <strong>Production:</strong> Metrics related to manufacturing output and cycle times</li>
          <li>• <strong>Quality:</strong> Measures of product quality, defects, and customer satisfaction</li>
          <li>• <strong>Safety:</strong> Safety incidents, compliance, and workplace hazard tracking</li>
          <li>• <strong>Efficiency:</strong> Equipment effectiveness, downtime, and resource utilization</li>
          <li>• <strong>Customer:</strong> Delivery performance, complaints, and service levels</li>
          <li>• <strong>Financial:</strong> Cost metrics, profitability, and budget performance</li>
        </ul>
      </div>

      {/* Add / Edit KPI Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit KPI' : 'Add KPI'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            {submitError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">KPI Name</label>
                <input type="text" value={form.kpiName} onChange={(e) => setForm({ ...form, kpiName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                    <option value="production">Production</option>
                    <option value="quality">Quality</option>
                    <option value="safety">Safety</option>
                    <option value="efficiency">Efficiency</option>
                    <option value="customer">Customer</option>
                    <option value="financial">Financial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Measurement Unit</label>
                  <select value={form.measurementUnit} onChange={(e) => setForm({ ...form, measurementUnit: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                    <option value="number">Number</option>
                    <option value="percentage">Percentage</option>
                    <option value="currency">Currency</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select value={form.measurementFrequency} onChange={(e) => setForm({ ...form, measurementFrequency: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                  <input type="number" value={form.defaultTarget} onChange={(e) => setForm({ ...form, defaultTarget: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} disabled={submitting} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 bg-emerald-600 rounded-lg text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">{submitting ? 'Saving…' : editingId ? 'Save Changes' : 'Add KPI'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
