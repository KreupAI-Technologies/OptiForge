'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit, Trash2, Type, Hash, Calendar, ToggleLeft, List, FileText, Link2, CheckSquare } from 'lucide-react';
import { ItAdminService } from '@/services/it-admin.service';

interface CustomField {
  id: string;
  name: string;
  label: string;
  module: string;
  fieldType: 'text' | 'number' | 'date' | 'boolean' | 'dropdown' | 'textarea' | 'url' | 'email';
  required: boolean;
  defaultValue?: string;
  options?: string[];
  validation?: string;
  helpText?: string;
  createdAt: string;
  active: boolean;
}

export default function CustomFieldsPage() {
  const router = useRouter();
  const [selectedModule, setSelectedModule] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);

  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFields = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ItAdminService.getCustomFields();
      setCustomFields(
        (Array.isArray(data) ? data : []).map((f: any) => ({
          id: String(f.id),
          name: f.name ?? '',
          label: f.label ?? '',
          module: f.module ?? '',
          fieldType: (f.fieldType as CustomField['fieldType']) ?? 'text',
          required: !!f.required,
          defaultValue: f.defaultValue,
          options: Array.isArray(f.options) ? f.options : undefined,
          validation: f.validation,
          helpText: f.helpText,
          createdAt: f.createdAt ?? '',
          active: f.active !== false,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load custom fields');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, []);

  const emptyForm = {
    name: '',
    label: '',
    module: 'Customers',
    fieldType: 'text' as CustomField['fieldType'],
    required: false,
    helpText: '',
    active: true,
  };
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingField(null);
    setForm(emptyForm);
    setSaveError(null);
    setShowAddModal(true);
  };

  const openEditModal = (field: CustomField) => {
    setEditingField(field);
    setForm({
      name: field.name,
      label: field.label,
      module: field.module,
      fieldType: field.fieldType,
      required: field.required,
      helpText: field.helpText ?? '',
      active: field.active,
    });
    setSaveError(null);
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.label.trim()) {
      setSaveError('Field name and label are required.');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    const payload = {
      name: form.name.trim(),
      label: form.label.trim(),
      module: form.module,
      fieldType: form.fieldType,
      required: form.required,
      helpText: form.helpText.trim() || undefined,
      active: form.active,
    };
    try {
      if (editingField) {
        await ItAdminService.updateCustomField(editingField.id, payload);
      } else {
        await ItAdminService.createCustomField(payload);
      }
      setShowAddModal(false);
      await loadFields();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save field');
    } finally {
      setIsSaving(false);
    }
  };

  const modules = [
    'all',
    'Customers',
    'Sales Orders',
    'Products',
    'Work Orders',
    'Suppliers',
    'Invoices',
    'Employees'
  ];

  const fieldTypes = [
    { id: 'text', name: 'Text', icon: Type, description: 'Single line text input' },
    { id: 'textarea', name: 'Text Area', icon: FileText, description: 'Multi-line text input' },
    { id: 'number', name: 'Number', icon: Hash, description: 'Numeric input' },
    { id: 'date', name: 'Date', icon: Calendar, description: 'Date picker' },
    { id: 'boolean', name: 'Boolean', icon: ToggleLeft, description: 'Yes/No checkbox' },
    { id: 'dropdown', name: 'Dropdown', icon: List, description: 'Select from options' },
    { id: 'url', name: 'URL', icon: Link2, description: 'Website URL' },
    { id: 'email', name: 'Email', icon: Type, description: 'Email address' }
  ];

  const getFieldTypeIcon = (type: string) => {
    const iconMap: { [key: string]: any } = {
      text: Type,
      textarea: FileText,
      number: Hash,
      date: Calendar,
      boolean: ToggleLeft,
      dropdown: List,
      url: Link2,
      email: Type
    };
    return iconMap[type] || Type;
  };

  const getFieldTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      text: 'bg-blue-50 text-blue-700 border-blue-200',
      textarea: 'bg-purple-50 text-purple-700 border-purple-200',
      number: 'bg-green-50 text-green-700 border-green-200',
      date: 'bg-orange-50 text-orange-700 border-orange-200',
      boolean: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      dropdown: 'bg-pink-50 text-pink-700 border-pink-200',
      url: 'bg-teal-50 text-teal-700 border-teal-200',
      email: 'bg-cyan-50 text-cyan-700 border-cyan-200'
    };
    return colors[type] || colors.text;
  };

  const filteredFields = selectedModule === 'all'
    ? customFields
    : customFields.filter(f => f.module === selectedModule);

  const handleDelete = async (fieldId: string) => {
    const field = customFields.find(f => f.id === fieldId);
    if (!confirm(`Delete custom field "${field?.label ?? field?.name ?? ''}"?`)) return;
    try {
      await ItAdminService.deleteCustomField(fieldId);
      await loadFields();
    } catch {
      await loadFields();
    }
  };

  const handleToggleActive = (fieldId: string) => {
    let nextActive = false;
    setCustomFields(prev =>
      prev.map(f => {
        if (f.id === fieldId) {
          nextActive = !f.active;
          return { ...f, active: nextActive };
        }
        return f;
      })
    );
    void (async () => {
      try {
        await ItAdminService.updateCustomField(fieldId, { active: nextActive });
      } catch {
        // best-effort persistence; keep optimistic UI state
      }
    })();
  };

  const stats = {
    totalFields: customFields.length,
    activeFields: customFields.filter(f => f.active).length,
    modules: new Set(customFields.map(f => f.module)).size,
    requiredFields: customFields.filter(f => f.required).length
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {loading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading custom fields...</div>
      )}
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Custom Fields</h1>
          <p className="text-sm text-gray-500 mt-1">Add custom fields to extend module functionality</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Field
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <CheckSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Fields</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFields}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <ToggleLeft className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeFields}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <List className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Modules</p>
              <p className="text-2xl font-bold text-purple-600">{stats.modules}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <CheckSquare className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Required</p>
              <p className="text-2xl font-bold text-red-600">{stats.requiredFields}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Module Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Filter by Module</h2>

          <div className="space-y-2">
            {modules.map((module) => {
              const count = module === 'all'
                ? customFields.length
                : customFields.filter(f => f.module === module).length;

              return (
                <button
                  key={module}
                  onClick={() => setSelectedModule(module)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedModule === module
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 text-sm">
                      {module === 'all' ? 'All Modules' : module}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedModule === module
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
            <h3 className="text-sm font-bold text-blue-900 mb-3">Field Types</h3>
            <div className="space-y-2">
              {fieldTypes.slice(0, 5).map((type) => {
                const IconComponent = type.icon;
                return (
                  <div key={type.id} className="flex items-center gap-2 text-xs">
                    <IconComponent className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-900">{type.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Custom Fields List */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-gray-900">
              {selectedModule === 'all' ? 'All Custom Fields' : `${selectedModule} Fields`}
            </h2>
            <p className="text-sm text-gray-600">
              {filteredFields.length} field{filteredFields.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="space-y-2">
            {filteredFields.map((field) => {
              const IconComponent = getFieldTypeIcon(field.fieldType);

              return (
                <div key={field.id} className={`border-2 rounded-lg p-5 ${field.active ? 'border-gray-200' : 'border-gray-200 bg-gray-50 opacity-70'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${getFieldTypeColor(field.fieldType)}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{field.label}</h3>
                          <p className="text-sm text-gray-600">{field.name}</p>
                        </div>
                        {field.required && (
                          <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">
                            Required
                          </span>
                        )}
                        {!field.active && (
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-2">Details:</p>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-gray-600">Module:</span> <span className="font-medium text-gray-900">{field.module}</span></p>
                            <p><span className="text-gray-600">Type:</span> <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getFieldTypeColor(field.fieldType)}`}>{field.fieldType}</span></p>
                            <p><span className="text-gray-600">Created:</span> <span className="font-medium text-gray-900">{field.createdAt}</span></p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-2">Configuration:</p>
                          <div className="space-y-1 text-sm">
                            {field.defaultValue && (
                              <p><span className="text-gray-600">Default:</span> <span className="font-medium text-gray-900">{field.defaultValue}</span></p>
                            )}
                            {field.validation && (
                              <p><span className="text-gray-600">Validation:</span> <span className="font-medium text-gray-900">{field.validation}</span></p>
                            )}
                            {field.options && (
                              <div>
                                <p className="text-gray-600 mb-1">Options:</p>
                                <div className="flex flex-wrap gap-1">
                                  {field.options.slice(0, 3).map((option, i) => (
                                    <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                                      {option}
                                    </span>
                                  ))}
                                  {field.options.length > 3 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                      +{field.options.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {field.helpText && (
                        <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-2">
                          <p className="text-xs text-blue-700">
                            <strong>Help Text:</strong> {field.helpText}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleToggleActive(field.id)}
                        className={`p-2 rounded-lg ${field.active ? 'hover:bg-yellow-50 text-yellow-600' : 'hover:bg-green-50 text-green-600'}`}
                        title={field.active ? 'Deactivate' : 'Activate'}
                      >
                        <ToggleLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openEditModal(field)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                        title="Edit field"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(field.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                       
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredFields.length === 0 && (
            <div className="text-center py-12">
              <CheckSquare className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium">No custom fields found</p>
              <p className="text-sm text-gray-500">Add a new field to get started</p>
            </div>
          )}

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">Custom Field Guidelines:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Field names must be unique within each module</li>
              <li>• Use descriptive labels that users will understand</li>
              <li>• Required fields cannot be removed once in use</li>
              <li>• Changing field type may result in data loss</li>
              <li>• Inactive fields are hidden from forms but data is preserved</li>
              <li>• Test custom fields in staging before production deployment</li>
            </ul>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              {editingField ? 'Edit Custom Field' : 'Add Custom Field'}
            </h2>
            {saveError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {saveError}
              </div>
            )}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Name (key)</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Label</label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Module</label>
                  <select
                    value={form.module}
                    onChange={(e) => setForm({ ...form, module: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {modules.filter((m) => m !== 'all').map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Field Type</label>
                  <select
                    value={form.fieldType}
                    onChange={(e) => setForm({ ...form, fieldType: e.target.value as CustomField['fieldType'] })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {fieldTypes.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Help Text</label>
                <input
                  type="text"
                  value={form.helpText}
                  onChange={(e) => setForm({ ...form, helpText: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.required}
                    onChange={(e) => setForm({ ...form, required: e.target.checked })}
                  />
                  Required
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={isSaving}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : editingField ? 'Save Changes' : 'Add Field'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
