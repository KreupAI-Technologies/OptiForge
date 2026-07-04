'use client';

import { useState, useMemo, useEffect } from 'react';
import { FileText, Plus, Search, Edit, Copy, Trash2, CheckCircle, Users, AlertCircle } from 'lucide-react';
import { PayrollService } from '@/services/payroll.service';

interface SalaryComponent {
  componentCode: string;
  componentName: string;
  type: 'earning' | 'deduction';
  calculationType: 'flat' | 'percentage';
  value: number;
  baseComponent?: string;
}

interface SalaryTemplate {
  id: string;
  templateCode: string;
  templateName: string;
  grade: string;
  employmentType: 'permanent' | 'contract' | 'temporary';
  ctcRange: string;
  components: SalaryComponent[];
  assignedCount: number;
  status: 'active' | 'inactive';
  createdBy: string;
  createdOn: string;
}

export default function PayrollTemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SalaryTemplate | null>(null);

  const [templates, setTemplates] = useState<SalaryTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await PayrollService.getSalaryTemplates()) as any[];
        const mapped: SalaryTemplate[] = raw.map((r) => ({
          id: String(r.id),
          templateCode: r.templateCode ?? '',
          templateName: r.templateName ?? '',
          grade: r.grade ?? '',
          employmentType: (r.employmentType ?? 'permanent') as SalaryTemplate['employmentType'],
          ctcRange: r.ctcRange ?? '',
          components: Array.isArray(r.components) ? (r.components as SalaryComponent[]) : [],
          assignedCount: Number(r.assignedCount ?? 0),
          status: (r.status ?? 'active') as SalaryTemplate['status'],
          createdBy: r.createdBy ?? '',
          createdOn: r.createdOn ?? '',
        }));
        if (!cancelled) setTemplates(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load salary templates');
          setTemplates([]);
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
    setEditingTemplate(null);
    setShowModal(true);
  };

  const handleEdit = (template: SalaryTemplate) => {
    setEditingTemplate(template);
    setShowModal(true);
  };

  const handleCopy = (template: SalaryTemplate) => {
    const newTemplate = {
      ...template,
      id: String(templates.length + 1),
      templateCode: template.templateCode + '-COPY',
      templateName: template.templateName + ' (Copy)',
      assignedCount: 0,
      createdBy: 'HR Admin',
      createdOn: new Date().toISOString().split('T')[0]
    };
    setTemplates([...templates, newTemplate]);
  };

  const handleDelete = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template && template.assignedCount > 0) {
      alert(`Cannot delete template "${template.templateName}" as it is assigned to ${template.assignedCount} employees.`);
      return;
    }
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleSave = (template: SalaryTemplate) => {
    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === template.id ? template : t));
    } else {
      const newTemplate = {
        ...template,
        id: String(templates.length + 1),
        assignedCount: 0,
        createdBy: 'HR Admin',
        createdOn: new Date().toISOString().split('T')[0]
      };
      setTemplates([...templates, newTemplate]);
    }
    setShowModal(false);
    setEditingTemplate(null);
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.templateCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = selectedGrade === 'all' || template.grade === selectedGrade;
      return matchesSearch && matchesGrade;
    });
  }, [templates, searchTerm, selectedGrade]);

  const stats = {
    total: templates.length,
    active: templates.filter(t => t.status === 'active').length,
    totalAssigned: templates.reduce((sum, t) => sum + t.assignedCount, 0)
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Salary Templates</h1>
        <p className="text-sm text-gray-600 mt-1">Predefined salary structure templates by grade and role</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading salary templates…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Templates</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Templates</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.active}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Employees Assigned</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.totalAssigned}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Grades</option>
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
            <option value="C">Grade C</option>
          </select>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Template
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filteredTemplates.map(template => (
          <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{template.templateName}</h3>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                    Grade {template.grade}
                  </span>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                    {template.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Template Code: {template.templateCode}</p>
                <p className="text-xs text-gray-500 mt-1">
                  CTC Range: {template.ctcRange} • {template.assignedCount} employees assigned
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(template)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="Edit Template"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleCopy(template)}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                  title="Copy Template"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Delete Template"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-3">Earnings</h4>
                <div className="space-y-2">
                  {template.components.filter(c => c.type === 'earning').map((component, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-green-700">{component.componentName}</span>
                      <span className="font-medium text-green-900">
                        {component.calculationType === 'flat'
                          ? `₹${component.value.toLocaleString('en-IN')}`
                          : `${component.value}% of ${component.baseComponent}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <h4 className="font-semibold text-red-900 mb-3">Deductions</h4>
                <div className="space-y-2">
                  {template.components.filter(c => c.type === 'deduction').map((component, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-red-700">{component.componentName}</span>
                      <span className="font-medium text-red-900">
                        {component.calculationType === 'flat'
                          ? `₹${component.value.toLocaleString('en-IN')}`
                          : `${component.value}% of ${component.baseComponent}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
              <p>Created by: {template.createdBy} on {new Date(template.createdOn).toLocaleDateString('en-IN')}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Salary Template Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Templates define standard salary structures for different grades and roles</li>
          <li>• Each template includes earnings (Basic, HRA, DA, Allowances) and deductions (PF, ESI, PT, TDS)</li>
          <li>• Components can be flat amounts or percentages of CTC/Basic/Gross</li>
          <li>• Templates are assigned to employees based on their grade and designation</li>
          <li>• Changes to templates do not affect existing employee assignments</li>
        </ul>
      </div>

      {showModal && (
        <TemplateModal
          template={editingTemplate}
          onClose={() => {
            setShowModal(false);
            setEditingTemplate(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

interface TemplateModalProps {
  template: SalaryTemplate | null;
  onClose: () => void;
  onSave: (template: SalaryTemplate) => void;
}

function TemplateModal({ template, onClose, onSave }: TemplateModalProps) {
  const [formData, setFormData] = useState<Partial<SalaryTemplate>>(
    template || {
      templateCode: '',
      templateName: '',
      grade: '',
      employmentType: 'permanent',
      ctcRange: '',
      status: 'active',
      components: []
    }
  );

  const [newComponent, setNewComponent] = useState<Partial<SalaryComponent>>({
    componentCode: '',
    componentName: '',
    type: 'earning',
    calculationType: 'flat',
    value: 0,
    baseComponent: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.templateCode || !formData.templateName || !formData.grade || !formData.ctcRange) {
      alert('Please fill all required fields');
      return;
    }
    if (!formData.components || formData.components.length === 0) {
      alert('Please add at least one component');
      return;
    }
    onSave(formData as SalaryTemplate);
  };

  const addComponent = () => {
    if (!newComponent.componentCode || !newComponent.componentName) {
      alert('Please fill component code and name');
      return;
    }
    setFormData({
      ...formData,
      components: [...(formData.components || []), newComponent as SalaryComponent]
    });
    setNewComponent({
      componentCode: '',
      componentName: '',
      type: 'earning',
      calculationType: 'flat',
      value: 0,
      baseComponent: ''
    });
  };

  const removeComponent = (index: number) => {
    const newComponents = [...(formData.components || [])];
    newComponents.splice(index, 1);
    setFormData({ ...formData, components: newComponents });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-t-lg">
          <h2 className="text-2xl font-bold">
            {template ? 'Edit Salary Template' : 'New Salary Template'}
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            Define salary structure with components
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Code *
              </label>
              <input
                type="text"
                value={formData.templateCode || ''}
                onChange={(e) => setFormData({ ...formData, templateCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., TPL-MFG-A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name *
              </label>
              <input
                type="text"
                value={formData.templateName || ''}
                onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Manufacturing - Grade A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade *
              </label>
              <input
                type="text"
                value={formData.grade || ''}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type *
              </label>
              <select
                value={formData.employmentType || 'permanent'}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as 'permanent' | 'contract' | 'temporary' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="permanent">Permanent</option>
                <option value="contract">Contract</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CTC Range *
              </label>
              <input
                type="text"
                value={formData.ctcRange || ''}
                onChange={(e) => setFormData({ ...formData, ctcRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., ₹6-8L"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Salary Components</h3>

            {formData.components && formData.components.length > 0 && (
              <div className="mb-2 space-y-2">
                {formData.components.map((comp, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="font-medium">{comp.componentCode}</span>
                        <span className="text-gray-600 ml-2">{comp.componentName}</span>
                      </div>
                      <div>
                        <span className={`px-2 py-1 text-xs rounded ${comp.type === 'earning' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {comp.type}
                        </span>
                      </div>
                      <div className="text-gray-700">
                        {comp.calculationType === 'flat'
                          ? `₹${comp.value.toLocaleString('en-IN')}`
                          : `${comp.value}% of ${comp.baseComponent}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeComponent(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-blue-900 mb-3">Add Component</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newComponent.componentCode || ''}
                  onChange={(e) => setNewComponent({ ...newComponent, componentCode: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Code (e.g., BASIC)"
                />
                <input
                  type="text"
                  value={newComponent.componentName || ''}
                  onChange={(e) => setNewComponent({ ...newComponent, componentName: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Name (e.g., Basic Salary)"
                />
                <select
                  value={newComponent.type || 'earning'}
                  onChange={(e) => setNewComponent({ ...newComponent, type: e.target.value as 'earning' | 'deduction' })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="earning">Earning</option>
                  <option value="deduction">Deduction</option>
                </select>
                <select
                  value={newComponent.calculationType || 'flat'}
                  onChange={(e) => setNewComponent({ ...newComponent, calculationType: e.target.value as 'flat' | 'percentage' })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="flat">Flat Amount</option>
                  <option value="percentage">Percentage</option>
                </select>
                <input
                  type="number"
                  value={newComponent.value || 0}
                  onChange={(e) => setNewComponent({ ...newComponent, value: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Value"
                />
                {newComponent.calculationType === 'percentage' && (
                  <input
                    type="text"
                    value={newComponent.baseComponent || ''}
                    onChange={(e) => setNewComponent({ ...newComponent, baseComponent: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Base (e.g., CTC, BASIC)"
                  />
                )}
                <button
                  type="button"
                  onClick={addComponent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {template ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
