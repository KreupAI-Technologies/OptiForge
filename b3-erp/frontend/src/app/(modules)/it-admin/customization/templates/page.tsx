'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, FileText, Mail, Download, Copy, Edit, Trash2, Eye, Code } from 'lucide-react';
import { ItAdminService } from '@/services/it-admin.service';

interface Template {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'document' | 'report' | 'invoice' | 'label';
  category: string;
  content: string;
  variables: string[];
  format: 'html' | 'pdf' | 'docx' | 'plain';
  lastModified: string;
  usageCount: number;
  isDefault: boolean;
  active: boolean;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ItAdminService.getTemplates();
      setTemplates(
        (Array.isArray(data) ? data : []).map((t: any) => ({
          id: String(t.id),
          name: t.name ?? '',
          description: t.description ?? '',
          type: (t.type as Template['type']) ?? 'document',
          category: t.category ?? '',
          content: t.content ?? '',
          variables: Array.isArray(t.variables) ? t.variables : [],
          format: (t.format as Template['format']) ?? 'html',
          lastModified: t.lastModified ?? '',
          usageCount: t.usageCount ?? 0,
          isDefault: !!t.isDefault,
          active: t.active !== false,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const emptyForm = {
    name: '',
    description: '',
    type: 'document' as Template['type'],
    category: '',
    format: 'html' as Template['format'],
    content: '',
    active: true,
  };
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSaveError(null);
    setShowEditModal(true);
  };

  const openEditModal = (template: Template) => {
    setEditingId(template.id);
    setForm({
      name: template.name,
      description: template.description,
      type: template.type,
      category: template.category,
      format: template.format,
      content: template.content,
      active: template.active,
    });
    setSaveError(null);
    setShowEditModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setSaveError('Template name is required.');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type,
      category: form.category.trim(),
      format: form.format,
      content: form.content,
      active: form.active,
    };
    try {
      if (editingId) {
        await ItAdminService.updateTemplate(editingId, payload);
      } else {
        await ItAdminService.createTemplate(payload);
      }
      setShowEditModal(false);
      await loadTemplates();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const templateTypes = [
    { id: 'all', name: 'All Templates', icon: FileText, count: templates.length },
    { id: 'email', name: 'Email Templates', icon: Mail, count: templates.filter(t => t.type === 'email').length },
    { id: 'document', name: 'Documents', icon: FileText, count: templates.filter(t => t.type === 'document').length },
    { id: 'report', name: 'Reports', icon: FileText, count: templates.filter(t => t.type === 'report').length },
    { id: 'invoice', name: 'Invoices', icon: FileText, count: templates.filter(t => t.type === 'invoice').length },
    { id: 'label', name: 'Labels', icon: FileText, count: templates.filter(t => t.type === 'label').length }
  ];

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      email: 'bg-blue-50 text-blue-700 border-blue-200',
      document: 'bg-green-50 text-green-700 border-green-200',
      report: 'bg-purple-50 text-purple-700 border-purple-200',
      invoice: 'bg-orange-50 text-orange-700 border-orange-200',
      label: 'bg-pink-50 text-pink-700 border-pink-200'
    };
    return colors[type] || colors.document;
  };

  const getFormatColor = (format: string) => {
    const colors: { [key: string]: string } = {
      html: 'bg-blue-100 text-blue-800',
      pdf: 'bg-red-100 text-red-800',
      docx: 'bg-blue-100 text-blue-800',
      plain: 'bg-gray-100 text-gray-800'
    };
    return colors[format] || colors.plain;
  };

  const filteredTemplates = selectedType === 'all'
    ? templates
    : templates.filter(t => t.type === selectedType);

  const handleDuplicate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    try {
      await ItAdminService.createTemplate({
        name: `${template.name} (Copy)`,
        description: template.description,
        type: template.type,
        category: template.category,
        format: template.format,
        content: template.content,
        variables: template.variables,
        isDefault: false,
        active: template.active,
      });
      await loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate template');
    }
  };

  const handleDelete = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!confirm(`Delete template "${template?.name ?? ''}"?`)) return;
    try {
      await ItAdminService.deleteTemplate(templateId);
      await loadTemplates();
    } catch {
      await loadTemplates();
    }
  };

  const handleToggleActive = (templateId: string) => {
    let nextActive = false;
    setTemplates(prev =>
      prev.map(t => {
        if (t.id === templateId) {
          nextActive = !t.active;
          return { ...t, active: nextActive };
        }
        return t;
      })
    );
    void (async () => {
      try {
        await ItAdminService.updateTemplate(templateId, { active: nextActive });
      } catch {
        // best-effort persistence; keep optimistic UI state
      }
    })();
  };

  const stats = {
    totalTemplates: templates.length,
    activeTemplates: templates.filter(t => t.active).length,
    defaultTemplates: templates.filter(t => t.isDefault).length,
    totalUsage: templates.reduce((acc, t) => acc + t.usageCount, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {loading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading templates...</div>
      )}
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Document Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Manage templates for emails, documents, reports, and labels</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Templates</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTemplates}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeTemplates}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Default Templates</p>
              <p className="text-2xl font-bold text-purple-600">{stats.defaultTemplates}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Download className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalUsage.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Template Types */}
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Template Types</h2>

          <div className="space-y-2">
            {templateTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedType === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className={`w-4 h-4 ${selectedType === type.id ? 'text-blue-600' : 'text-gray-600'}`} />
                    <p className="font-medium text-gray-900 text-sm">{type.name}</p>
                  </div>
                  <p className="text-xs text-gray-600 ml-6">{type.count} templates</p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
            <h3 className="text-sm font-bold text-blue-900 mb-3">Quick Tips</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Use {'{'}variables{'}'} for dynamic content</li>
              <li>• Test templates before using</li>
              <li>• Duplicate to create variations</li>
              <li>• Default templates are auto-selected</li>
            </ul>
          </div>
        </div>

        {/* Templates List */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-gray-900">
              {selectedType === 'all' ? 'All Templates' : templateTypes.find(t => t.id === selectedType)?.name}
            </h2>
            <p className="text-sm text-gray-600">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="space-y-2">
            {filteredTemplates.map((template) => (
              <div key={template.id} className={`border-2 rounded-lg p-5 ${template.active ? 'border-gray-200' : 'border-gray-200 bg-gray-50 opacity-70'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className={template.active ? 'w-5 h-5 text-blue-600' : 'w-5 h-5 text-gray-400'} />
                      <div>
                        <h3 className="font-bold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs px-2 py-1 rounded border ${getTypeColor(template.type)}`}>
                        {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getFormatColor(template.format)}`}>
                        {template.format.toUpperCase()}
                      </span>
                      <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded border border-purple-200">
                        {template.category}
                      </span>
                      {template.isDefault && (
                        <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded border border-green-200">
                          Default
                        </span>
                      )}
                      {!template.active && (
                        <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-2">Variables ({template.variables.length}):</p>
                        <div className="flex flex-wrap gap-1">
                          {template.variables.slice(0, 5).map((variable, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded font-mono">
                              {'{' + variable + '}'}
                            </span>
                          ))}
                          {template.variables.length > 5 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              +{template.variables.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-2">Statistics:</p>
                        <div className="space-y-1 text-xs text-gray-700">
                          <p><span className="text-gray-600">Usage Count:</span> <span className="font-semibold">{template.usageCount.toLocaleString()}</span></p>
                          <p><span className="text-gray-600">Last Modified:</span> <span className="font-semibold">{template.lastModified}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowPreview(true);
                      }}
                      className="p-2 hover:bg-purple-50 rounded-lg text-purple-600"
                     
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(template.id)}
                      className="p-2 hover:bg-green-50 rounded-lg text-green-600"
                     
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openEditModal(template)}
                      className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                      title="Edit template"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    {!template.isDefault && (
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                       
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium">No templates found</p>
              <p className="text-sm text-gray-500">Create a new template to get started</p>
            </div>
          )}

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">Template Guidelines:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Variables are case-sensitive and must match exactly</li>
              <li>• HTML templates support full CSS styling</li>
              <li>• PDF templates are generated from HTML or plain text</li>
              <li>• Default templates cannot be deleted, only deactivated</li>
              <li>• Test all templates with sample data before deployment</li>
              <li>• Keep backups of custom templates before making changes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
              </div>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setSelectedTemplate(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700">Template Content</h3>
                </div>
                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs overflow-x-auto">
                  {selectedTemplate.content}
                </pre>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Available Variables</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.variables.map((variable, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded border border-blue-200 font-mono">
                      {'{' + variable + '}'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              {editingId ? 'Edit Template' : 'Create Template'}
            </h2>
            {saveError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {saveError}
              </div>
            )}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as Template['type'] })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="email">Email</option>
                    <option value="document">Document</option>
                    <option value="report">Report</option>
                    <option value="invoice">Invoice</option>
                    <option value="label">Label</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Format</label>
                  <select
                    value={form.format}
                    onChange={(e) => setForm({ ...form, format: e.target.value as Template['format'] })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="html">HTML</option>
                    <option value="pdf">PDF</option>
                    <option value="docx">DOCX</option>
                    <option value="plain">Plain</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                Active
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
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
                {isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
