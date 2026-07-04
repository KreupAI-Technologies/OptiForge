'use client';

import { useState, useMemo, useEffect } from 'react';
import { DollarSign, Plus, Search, Filter, Edit, Trash2, AlertCircle } from 'lucide-react';
import DataTable from '@/components/DataTable';
import StatusBadge, { BadgeStatus } from '@/components/StatusBadge';
import { PayrollService } from '@/services/payroll.service';

interface SalaryComponent {
  id: string;
  code: string;
  name: string;
  type: 'earning' | 'deduction';
  category: 'fixed' | 'variable' | 'statutory';
  calculationType: 'flat' | 'percentage' | 'formula';
  taxable: boolean;
  pfApplicable: boolean;
  esiApplicable: boolean;
  displayOrder: number;
  status: 'active' | 'inactive';
}

export default function ComponentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState<SalaryComponent | null>(null);

  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await PayrollService.getSalaryComponents()) as any[];
        const mapped: SalaryComponent[] = raw.map((r) => ({
          id: String(r.id),
          code: r.code ?? '',
          name: r.name ?? '',
          type: (r.type ?? 'earning') as SalaryComponent['type'],
          category: (r.category ?? 'fixed') as SalaryComponent['category'],
          calculationType: (r.calculationType ?? 'flat') as SalaryComponent['calculationType'],
          taxable: !!r.taxable,
          pfApplicable: !!r.pfApplicable,
          esiApplicable: !!r.esiApplicable,
          displayOrder: Number(r.displayOrder ?? 0),
          status: (r.status ?? 'active') as SalaryComponent['status'],
        }));
        if (!cancelled) setComponents(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load salary components');
          setComponents([]);
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

  const handleAdd = () => {
    setEditingComponent(null);
    setShowModal(true);
  };

  const handleEdit = (component: SalaryComponent) => {
    setEditingComponent(component);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this component?')) {
      setComponents(components.filter(c => c.id !== id));
    }
  };

  const handleSave = (component: SalaryComponent) => {
    if (editingComponent) {
      // Update existing
      setComponents(components.map(c => c.id === component.id ? component : c));
    } else {
      // Add new
      const newComponent = { ...component, id: String(components.length + 1) };
      setComponents([...components, newComponent]);
    }
    setShowModal(false);
    setEditingComponent(null);
  };

  const filteredData = useMemo(() => {
    return components.filter(component => {
      const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           component.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || component.type === selectedType;
      const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [searchTerm, selectedType, selectedCategory]);

  const stats = {
    total: components.length,
    earnings: components.filter(c => c.type === 'earning').length,
    deductions: components.filter(c => c.type === 'deduction').length,
    statutory: components.filter(c => c.category === 'statutory').length
  };

  const getTypeColor = (type: string) => {
    return type === 'earning' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      fixed: 'bg-blue-100 text-blue-800',
      variable: 'bg-purple-100 text-purple-800',
      statutory: 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors];
  };

  const columns = [
    { key: 'code', label: 'Code', sortable: true,
      render: (v: string) => <div className="font-semibold text-gray-900">{v}</div>
    },
    { key: 'name', label: 'Component Name', sortable: true,
      render: (v: string) => <div className="font-medium text-gray-900">{v}</div>
    },
    { key: 'type', label: 'Type', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(v)}`}>
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </span>
      )
    },
    { key: 'category', label: 'Category', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(v)}`}>
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </span>
      )
    },
    { key: 'calculationType', label: 'Calculation', sortable: true,
      render: (v: string) => (
        <div className="text-sm text-gray-700 capitalize">{v}</div>
      )
    },
    { key: 'taxable', label: 'Taxable', sortable: true,
      render: (v: boolean) => (
        <div className="text-sm text-gray-700">{v ? 'Yes' : 'No'}</div>
      )
    },
    { key: 'pfApplicable', label: 'PF', sortable: true,
      render: (v: boolean) => (
        <div className={`text-sm ${v ? 'text-green-700' : 'text-gray-400'}`}>
          {v ? '✓' : '—'}
        </div>
      )
    },
    { key: 'esiApplicable', label: 'ESI', sortable: true,
      render: (v: boolean) => (
        <div className={`text-sm ${v ? 'text-green-700' : 'text-gray-400'}`}>
          {v ? '✓' : '—'}
        </div>
      )
    },
    { key: 'status', label: 'Status', sortable: true,
      render: (v: string) => <StatusBadge status={v as BadgeStatus} />
    },
    { key: 'id', label: 'Actions', sortable: false,
      render: (_: any, row: SalaryComponent) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit Component"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete Component"
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
          <DollarSign className="h-8 w-8 text-yellow-600" />
          Salary Components Master
        </h1>
        <p className="text-gray-600 mt-2">Configure salary components for payroll processing</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading salary components…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Components</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <DollarSign className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Earnings</p>
              <p className="text-2xl font-bold text-green-600">{stats.earnings}</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Deductions</p>
              <p className="text-2xl font-bold text-red-600">{stats.deductions}</p>
            </div>
            <DollarSign className="h-10 w-10 text-red-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Statutory</p>
              <p className="text-2xl font-bold text-orange-600">{stats.statutory}</p>
            </div>
            <DollarSign className="h-10 w-10 text-orange-400" />
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
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Component
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="earning">Earnings</option>
                <option value="deduction">Deductions</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="fixed">Fixed</option>
                <option value="variable">Variable</option>
                <option value="statutory">Statutory</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Components Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Salary Components</h3>
        </div>
        <DataTable data={filteredData} columns={columns} />
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Component Types</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Fixed:</strong> Standard components with consistent values (Basic, HRA, DA)</li>
          <li>• <strong>Variable:</strong> Components that vary each month (Bonus, OT, Incentives)</li>
          <li>• <strong>Statutory:</strong> Mandatory deductions as per law (PF, ESI, PT, TDS)</li>
          <li>• <strong>Calculation Types:</strong> Flat (fixed amount), Percentage (% of base), Formula (custom calculation)</li>
        </ul>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <ComponentModal
          component={editingComponent}
          onClose={() => {
            setShowModal(false);
            setEditingComponent(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// Component Modal
function ComponentModal({
  component,
  onClose,
  onSave
}: {
  component: SalaryComponent | null;
  onClose: () => void;
  onSave: (component: SalaryComponent) => void;
}) {
  const [formData, setFormData] = useState<SalaryComponent>(
    component || {
      id: '',
      code: '',
      name: '',
      type: 'earning',
      category: 'fixed',
      calculationType: 'flat',
      taxable: true,
      pfApplicable: false,
      esiApplicable: false,
      displayOrder: 1,
      status: 'active'
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof SalaryComponent, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-t-lg">
          <h2 className="text-2xl font-bold">
            {component ? 'Edit' : 'Add New'} Salary Component
          </h2>
          <p className="text-blue-100 mt-1">
            {component ? `Editing: ${component.name}` : 'Create a new salary component'}
          </p>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {/* Component Code and Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Component Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., BASIC, HRA"
                required
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Component Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Basic Salary"
                required
              />
            </div>
          </div>

          {/* Type, Category, Calculation Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="earning">Earning</option>
                <option value="deduction">Deduction</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="fixed">Fixed</option>
                <option value="variable">Variable</option>
                <option value="statutory">Statutory</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calculation Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.calculationType}
                onChange={(e) => handleChange('calculationType', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="flat">Flat Amount</option>
                <option value="percentage">Percentage</option>
                <option value="formula">Formula</option>
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.taxable}
                  onChange={(e) => handleChange('taxable', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Taxable</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pfApplicable}
                  onChange={(e) => handleChange('pfApplicable', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">PF Applicable</span>
              </label>
            </div>
            <div className="space-y-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.esiApplicable}
                  onChange={(e) => handleChange('esiApplicable', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">ESI Applicable</span>
              </label>
            </div>
          </div>

          {/* Display Order and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => handleChange('displayOrder', parseInt(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              {component ? 'Update' : 'Create'} Component
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
