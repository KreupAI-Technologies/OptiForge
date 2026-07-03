'use client';

import React, { useState, useEffect } from 'react';
import crmService from '@/services/crm.service';
import {
  ListChecks,
  Type,
  Hash,
  Calendar,
  ToggleLeft,
  Link,
  FileText,
  Percent,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  Star,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  EyeOff,
  Settings,
  Copy,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  Users,
  Building2,
  Briefcase,
  User,
  Target,
  Database
} from 'lucide-react';

interface CustomField {
  id: string;
  name: string;
  apiName: string;
  label: string;
  description: string;
  fieldType: 'text' | 'number' | 'email' | 'phone' | 'url' | 'date' | 'datetime' | 'boolean' | 'picklist' | 'multipicklist' | 'textarea' | 'currency' | 'percent' | 'lookup';
  module: 'opportunity' | 'lead' | 'contact' | 'account' | 'contract' | 'ticket' | 'activity';
  category: 'standard' | 'custom' | 'system';
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'reference';
  isRequired: boolean;
  isUnique: boolean;
  isActive: boolean;
  isSearchable: boolean;
  isEditable: boolean;
  defaultValue?: string;
  helpText?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  usage: {
    recordsWithValue: number;
    totalRecords: number;
    lastUsed?: string;
  };
  createdBy: string;
  createdAt: string;
  lastModified: string;
}

export default function CustomFieldsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [fields, setFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadFields = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await crmService.customFields.getAll();
        if (cancelled) return;
        const mapped: CustomField[] = (rows ?? []).map((r: any) => ({
          id: String(r.id ?? ''),
          name: r.name ?? '',
          apiName: r.apiName ?? '',
          label: r.label ?? r.name ?? '',
          description: r.description ?? '',
          fieldType: r.fieldType ?? 'text',
          module: r.module ?? 'account',
          category: r.category ?? 'custom',
          dataType: r.dataType ?? 'string',
          isRequired: r.isRequired ?? false,
          isUnique: r.isUnique ?? false,
          isActive: r.isActive ?? true,
          isSearchable: r.isSearchable ?? false,
          isEditable: r.isEditable ?? true,
          defaultValue: r.defaultValue ?? undefined,
          helpText: r.helpText ?? undefined,
          validation: r.validation ?? {},
          usage: r.usage ?? { recordsWithValue: 0, totalRecords: 0 },
          createdBy: r.createdBy ?? 'System',
          createdAt: r.createdAt ? String(r.createdAt).slice(0, 10) : '',
          lastModified: r.createdAt ? String(r.createdAt).slice(0, 10) : '',
        }));
        setFields(mapped);
      } catch (err) {
        if (cancelled) return;
        setFields([]);
        setLoadError('Failed to load custom fields. Please try again.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadFields();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredFields = fields.filter(field => {
    const matchesSearch = field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         field.apiName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         field.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = moduleFilter === 'all' || field.module === moduleFilter;
    const matchesType = typeFilter === 'all' || field.fieldType === typeFilter;
    const matchesCategory = categoryFilter === 'all' || field.category === categoryFilter;
    return matchesSearch && matchesModule && matchesType && matchesCategory;
  });

  const stats = [
    {
      label: 'Total Fields',
      value: fields.length,
      subtitle: `${fields.filter(f => f.isActive).length} active`,
      icon: Database,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Custom Fields',
      value: fields.filter(f => f.category === 'custom').length,
      subtitle: `${fields.filter(f => f.category === 'standard').length} standard`,
      icon: Settings,
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Required Fields',
      value: fields.filter(f => f.isRequired).length,
      subtitle: 'Across all modules',
      icon: AlertCircle,
      color: 'from-orange-500 to-orange-600'
    },
    {
      label: 'Avg Usage',
      value: Math.round(fields.reduce((sum, f) => sum + (f.usage.recordsWithValue / f.usage.totalRecords * 100), 0) / fields.length) + '%',
      subtitle: 'Field utilization',
      icon: Target,
      color: 'from-green-500 to-green-600'
    }
  ];

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
      case 'textarea': return Type;
      case 'number': return Hash;
      case 'email': return Mail;
      case 'phone': return Phone;
      case 'url': return Link;
      case 'date':
      case 'datetime': return Calendar;
      case 'boolean': return ToggleLeft;
      case 'picklist':
      case 'multipicklist': return ListChecks;
      case 'currency': return DollarSign;
      case 'percent': return Percent;
      case 'lookup': return Users;
      default: return FileText;
    }
  };

  const getFieldTypeColor = (type: string) => {
    switch (type) {
      case 'text':
      case 'textarea': return 'bg-blue-100 text-blue-700';
      case 'number':
      case 'currency':
      case 'percent': return 'bg-green-100 text-green-700';
      case 'email':
      case 'phone':
      case 'url': return 'bg-purple-100 text-purple-700';
      case 'date':
      case 'datetime': return 'bg-orange-100 text-orange-700';
      case 'boolean': return 'bg-pink-100 text-pink-700';
      case 'picklist':
      case 'multipicklist': return 'bg-indigo-100 text-indigo-700';
      case 'lookup': return 'bg-cyan-100 text-cyan-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'standard': return 'bg-blue-100 text-blue-700';
      case 'custom': return 'bg-purple-100 text-purple-700';
      case 'system': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'opportunity': return Briefcase;
      case 'lead': return Target;
      case 'contact': return User;
      case 'account': return Building2;
      case 'contract': return FileText;
      case 'ticket': return AlertCircle;
      case 'activity': return Calendar;
      default: return Database;
    }
  };

  return (
    <div className="w-full h-full px-3 py-2  space-y-3">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading fields…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
      )}
      {/* Header */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Field
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`bg-gradient-to-br ${stat.color} rounded-xl p-3 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-white/70 text-xs mt-1">{stat.subtitle}</p>
                </div>
                <Icon className="w-12 h-12 text-white/30" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Search Fields
            </label>
            <input
              type="text"
              placeholder="Search by name, API name, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Module
            </label>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Modules</option>
              <option value="opportunity">Opportunity</option>
              <option value="lead">Lead</option>
              <option value="contact">Contact</option>
              <option value="account">Account</option>
              <option value="contract">Contract</option>
              <option value="ticket">Ticket</option>
              <option value="activity">Activity</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Field Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="picklist">Picklist</option>
              <option value="date">Date</option>
              <option value="boolean">Boolean</option>
              <option value="currency">Currency</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="standard">Standard</option>
              <option value="custom">Custom</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fields List */}
      <div className="space-y-3">
        {filteredFields.map((field) => {
          const TypeIcon = getFieldTypeIcon(field.fieldType);
          const ModuleIcon = getModuleIcon(field.module);
          const usagePercent = (field.usage.recordsWithValue / field.usage.totalRecords * 100).toFixed(1);

          return (
            <div
              key={field.id}
              className={`bg-white rounded-lg border-2 transition-all ${
                field.category === 'system' ? 'border-gray-300 bg-gray-50/30' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    {/* Field Type Icon */}
                    <div className={`p-3 rounded-lg ${getFieldTypeColor(field.fieldType)} bg-opacity-20`}>
                      <TypeIcon className="w-6 h-6" />
                    </div>

                    {/* Field Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{field.label}</h3>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-mono rounded">
                          {field.apiName}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getFieldTypeColor(field.fieldType)}`}>
                          {field.fieldType.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(field.category)}`}>
                          {field.category.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{field.description}</p>

                      {/* Field Properties */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <ModuleIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 capitalize">{field.module}</span>
                        </div>
                        {field.isRequired && (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            <span className="text-xs font-medium text-orange-700">Required</span>
                          </div>
                        )}
                        {field.isUnique && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-medium text-blue-700">Unique</span>
                          </div>
                        )}
                        {field.isSearchable && (
                          <div className="flex items-center gap-1">
                            <Search className="w-4 h-4 text-purple-500" />
                            <span className="text-xs font-medium text-purple-700">Searchable</span>
                          </div>
                        )}
                        {!field.isEditable && (
                          <div className="flex items-center gap-1">
                            <Lock className="w-4 h-4 text-gray-500" />
                            <span className="text-xs font-medium text-gray-700">Read-only</span>
                          </div>
                        )}
                      </div>

                      {/* Validation Rules */}
                      {field.validation && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">VALIDATION</p>
                          <div className="flex flex-wrap gap-2">
                            {field.validation.min !== undefined && (
                              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                Min: {field.validation.min}
                              </span>
                            )}
                            {field.validation.max !== undefined && (
                              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                Max: {field.validation.max}
                              </span>
                            )}
                            {field.validation.pattern && (
                              <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded font-mono">
                                Pattern: {field.validation.pattern}
                              </span>
                            )}
                            {field.validation.options && (
                              <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
                                {field.validation.options.length} options
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Options for Picklists */}
                      {field.validation?.options && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">OPTIONS</p>
                          <div className="flex flex-wrap gap-1">
                            {field.validation.options.map((option, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                {option}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Usage Stats */}
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Records with Value</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {field.usage.recordsWithValue} / {field.usage.totalRecords}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Usage Rate</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">{usagePercent}%</p>
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  parseFloat(usagePercent) >= 80
                                    ? 'bg-green-500'
                                    : parseFloat(usagePercent) >= 50
                                    ? 'bg-blue-500'
                                    : 'bg-orange-500'
                                }`}
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Last Used</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {field.usage.lastUsed
                              ? new Date(field.usage.lastUsed).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : 'Never'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Created By</p>
                          <p className="text-sm font-semibold text-gray-900">{field.createdBy}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {field.isActive ? (
                      <button className="p-2 hover:bg-green-50 rounded-lg transition-colors">
                        <Eye className="w-5 h-5 text-green-600" />
                      </button>
                    ) : (
                      <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      </button>
                    )}
                    <button
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      disabled={field.category === 'system'}
                     
                    >
                      <Edit className={`w-5 h-5 ${field.category === 'system' ? 'text-gray-300' : 'text-blue-600'}`} />
                    </button>
                    <button className="p-2 hover:bg-purple-50 rounded-lg transition-colors">
                      <Copy className="w-5 h-5 text-purple-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <Settings className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={field.category === 'system' || field.category === 'standard'}
                      title={
                        field.category === 'system' || field.category === 'standard'
                          ? 'Cannot delete system/standard fields'
                          : 'Delete Field'
                      }
                    >
                      <Trash2
                        className={`w-5 h-5 ${
                          field.category === 'system' || field.category === 'standard' ? 'text-gray-300' : 'text-red-600'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Field Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-gray-900">Add Custom Field</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Field Label</label>
                  <input
                    type="text"
                    placeholder="e.g., Customer Priority"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API Name</label>
                  <input
                    type="text"
                    placeholder="e.g., customer_priority"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select module...</option>
                    <option value="opportunity">Opportunity</option>
                    <option value="lead">Lead</option>
                    <option value="contact">Contact</option>
                    <option value="account">Account</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Field Type</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select type...</option>
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="picklist">Picklist</option>
                    <option value="date">Date</option>
                    <option value="boolean">Boolean</option>
                    <option value="currency">Currency</option>
                    <option value="email">Email</option>
                    <option value="textarea">Text Area</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Describe the purpose of this field..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Help Text</label>
                <input
                  type="text"
                  placeholder="Help text shown to users..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">Required field</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">Unique values</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">Searchable</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">Editable</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Create Field
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
