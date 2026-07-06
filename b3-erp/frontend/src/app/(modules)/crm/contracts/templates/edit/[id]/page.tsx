'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, FileText, Calendar, DollarSign, AlertCircle, Plus, X } from 'lucide-react';
import { crmService } from '@/services/crm.service';

interface TemplateFormData {
  name: string;
  description: string;
  category: 'service' | 'subscription' | 'license' | 'support' | 'maintenance' | 'custom';
  defaultDuration: number;
  defaultValue: number;
  billingCycle: 'monthly' | 'quarterly' | 'annually' | 'one-time';
  autoRenew: boolean;
  renewalNoticeDays: number;
  paymentTerms: string;
  clauses: string[];
  tags: string[];
  includesSLA: boolean;
  includesTermination: boolean;
  includesIPRights: boolean;
  includesConfidentiality: boolean;
}

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    category: 'license',
    defaultDuration: 0,
    defaultValue: 0,
    billingCycle: 'annually',
    autoRenew: true,
    renewalNoticeDays: 0,
    paymentTerms: '',
    clauses: [],
    tags: [],
    includesSLA: false,
    includesTermination: false,
    includesIPRights: false,
    includesConfidentiality: false,
  });

  const [newClause, setNewClause] = useState('');
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!templateId) return;
    let active = true;
    (async () => {
      try {
        const t: any = await crmService.contractTemplates.getById(templateId);
        if (!active || !t) return;
        setFormData({
          name: t.name ?? '',
          description: t.description ?? '',
          category: t.category ?? 'license',
          defaultDuration: Number(t.defaultDuration ?? 0),
          defaultValue: Number(t.defaultValue ?? 0),
          billingCycle: t.billingCycle ?? 'annually',
          autoRenew: Boolean(t.autoRenew),
          renewalNoticeDays: Number(t.renewalNoticeDays ?? 0),
          paymentTerms: t.paymentTerms ?? '',
          clauses: Array.isArray(t.clauses) ? t.clauses : [],
          tags: Array.isArray(t.tags) ? t.tags : [],
          includesSLA: Boolean(t.includesSLA),
          includesTermination: Boolean(t.includesTermination),
          includesIPRights: Boolean(t.includesIPRights),
          includesConfidentiality: Boolean(t.includesConfidentiality),
        });
      } catch (err) {
        console.error('Failed to load template', err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [templateId]);

  const handleChange = (field: keyof TemplateFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addClause = () => {
    if (newClause.trim()) {
      setFormData(prev => ({
        ...prev,
        clauses: [...prev.clauses, newClause.trim()]
      }));
      setNewClause('');
    }
  };

  const removeClause = (index: number) => {
    setFormData(prev => ({
      ...prev,
      clauses: prev.clauses.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.defaultDuration <= 0) {
      newErrors.defaultDuration = 'Duration must be greater than 0';
    }

    if (formData.defaultValue <= 0) {
      newErrors.defaultValue = 'Default value must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await crmService.contractTemplates.update(templateId, { ...formData });
      router.push('/crm/contracts/templates');
    } catch (err) {
      console.error('Failed to update template', err);
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/crm/contracts/templates');
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      <div className="w-full">
        {/* Header */}
        <div className="mb-3">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Templates
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Contract Template</h1>
          <p className="text-gray-600 mt-2">Update template details and default terms</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 space-y-3">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Template Information
              </h2>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Enterprise Software License Agreement"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value as TemplateFormData['category'])}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="service">Service</option>
                    <option value="subscription">Subscription</option>
                    <option value="license">License</option>
                    <option value="support">Support</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Brief description of the template..."
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Default Terms */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Default Contract Terms
              </h2>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Duration (months) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.defaultDuration}
                      onChange={(e) => handleChange('defaultDuration', parseInt(e.target.value) || 0)}
                      min="1"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.defaultDuration ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.defaultDuration && (
                      <p className="text-red-500 text-sm mt-1">{errors.defaultDuration}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Value <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        value={formData.defaultValue}
                        onChange={(e) => handleChange('defaultValue', parseFloat(e.target.value) || 0)}
                        step="0.01"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.defaultValue ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.defaultValue && (
                      <p className="text-red-500 text-sm mt-1">{errors.defaultValue}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Billing Cycle <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.billingCycle}
                      onChange={(e) => handleChange('billingCycle', e.target.value as TemplateFormData['billingCycle'])}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                      <option value="one-time">One-time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                    <input
                      type="text"
                      value={formData.paymentTerms}
                      onChange={(e) => handleChange('paymentTerms', e.target.value)}
                      placeholder="e.g., Net 30"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoRenew}
                      onChange={(e) => handleChange('autoRenew', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Auto-Renewal</span>
                  </label>

                  {formData.autoRenew && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Renewal Notice Period (days)
                      </label>
                      <input
                        type="number"
                        value={formData.renewalNoticeDays}
                        onChange={(e) => handleChange('renewalNoticeDays', parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contract Clauses */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Contract Clauses</h2>
              <div className="space-y-3">
                {formData.clauses.map((clause, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={clause}
                      onChange={(e) => {
                        const newClauses = [...formData.clauses];
                        newClauses[index] = e.target.value;
                        handleChange('clauses', newClauses);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeClause(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newClause}
                    onChange={(e) => setNewClause(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addClause())}
                    placeholder="Add new clause..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addClause}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Legal Protections */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Legal Protections</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includesSLA}
                    onChange={(e) => handleChange('includesSLA', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Include Service Level Agreement (SLA)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includesTermination}
                    onChange={(e) => handleChange('includesTermination', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Include Termination Clauses</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includesIPRights}
                    onChange={(e) => handleChange('includesIPRights', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Include Intellectual Property Rights</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includesConfidentiality}
                    onChange={(e) => handleChange('includesConfidentiality', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Include Confidentiality (NDA)</span>
                </label>
              </div>
            </div>

            {/* Tags */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Tags</h2>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full"
                    >
                      <span className="text-sm font-medium">{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add new tag..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Updating...' : 'Update Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
