'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, FileText, Calendar, DollarSign, User, Building2, Clock, AlertCircle } from 'lucide-react';
import { crmService } from '@/services/crm.service';

interface ContractFormData {
  title: string;
  customerId: string;
  customerName: string;
  templateId?: string;
  templateName?: string;
  category: 'service' | 'subscription' | 'license' | 'support' | 'maintenance' | 'custom';
  startDate: string;
  endDate: string;
  value: number;
  billingCycle: 'monthly' | 'quarterly' | 'annually' | 'one-time';
  paymentTerms: string;
  autoRenew: boolean;
  renewalNoticeDays: number;
  description: string;
  notes: string;
}

export default function CreateContractPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');

  const [formData, setFormData] = useState<ContractFormData>({
    title: '',
    customerId: '',
    customerName: '',
    category: 'service',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    value: 0,
    billingCycle: 'monthly',
    paymentTerms: 'Net 30',
    autoRenew: true,
    renewalNoticeDays: 30,
    description: '',
    notes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // If templateId is provided, load template data
    if (templateId) {
      // Mock template data - in a real app, fetch from API
      const templates: { [key: string]: any } = {
        '1': {
          name: 'Enterprise Software License Agreement',
          category: 'license',
          defaultDuration: 36,
          defaultValue: 450000,
          billingCycle: 'annually',
          autoRenew: true,
          renewalNoticeDays: 90,
          paymentTerms: 'Net 30',
          description: 'Comprehensive software licensing agreement for enterprise customers with multi-year terms',
        },
        '2': {
          name: 'SaaS Subscription Agreement',
          category: 'subscription',
          defaultDuration: 12,
          defaultValue: 24000,
          billingCycle: 'monthly',
          autoRenew: true,
          renewalNoticeDays: 30,
          paymentTerms: 'Credit Card - Immediate',
          description: 'Standard monthly or annual SaaS subscription contract with auto-renewal',
        },
      };

      const template = templates[templateId];
      if (template) {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + template.defaultDuration);

        setFormData(prev => ({
          ...prev,
          templateId,
          templateName: template.name,
          category: template.category,
          endDate: endDate.toISOString().split('T')[0],
          value: template.defaultValue,
          billingCycle: template.billingCycle,
          paymentTerms: template.paymentTerms,
          autoRenew: template.autoRenew,
          renewalNoticeDays: template.renewalNoticeDays,
          description: template.description,
        }));
      }
    }
  }, [templateId]);

  const handleChange = (field: keyof ContractFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Contract title is required';
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.value <= 0) {
      newErrors.value = 'Contract value must be greater than 0';
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
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
      const payload: any = {
        companyId: 'default-company-id',
        title: formData.title,
        customerId: formData.customerId || undefined,
        customerName: formData.customerName,
        templateId: formData.templateId || undefined,
        category: formData.category,
        startDate: formData.startDate,
        endDate: formData.endDate,
        value: formData.value,
        billingCycle: formData.billingCycle,
        paymentTerms: formData.paymentTerms,
        autoRenew: formData.autoRenew,
        renewalNoticeDays: formData.renewalNoticeDays,
        description: formData.description,
        notes: formData.notes,
      };
      await crmService.contracts.create(payload);
      router.push('/crm/contracts');
    } catch (err) {
      console.error('Failed to create contract', err);
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/crm/contracts');
  };

  const calculateDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
      return months;
    }
    return 0;
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
            Back to Contracts
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Contract</h1>
              {formData.templateName && (
                <p className="text-gray-600 mt-2">Using template: <span className="font-medium">{formData.templateName}</span></p>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 space-y-3">
            {/* Contract Information */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Contract Information
              </h2>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="e.g., Enterprise Software License - Acme Corp"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value as ContractFormData['category'])}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Brief description of the contract..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Customer Information
              </h2>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => handleChange('customerName', e.target.value)}
                    placeholder="e.g., Acme Corporation"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.customerName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.customerName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contract Terms */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Contract Terms
              </h2>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.startDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.startDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.endDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.endDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                    )}
                  </div>
                </div>

                {calculateDuration() > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Contract Duration: <span className="font-semibold">{calculateDuration()} months</span>
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contract Value <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        value={formData.value || ''}
                        onChange={(e) => handleChange('value', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        step="0.01"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.value ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.value && (
                      <p className="text-red-500 text-sm mt-1">{errors.value}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Billing Cycle <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.billingCycle}
                      onChange={(e) => handleChange('billingCycle', e.target.value as ContractFormData['billingCycle'])}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                      <option value="one-time">One-time</option>
                    </select>
                  </div>
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
            </div>

            {/* Renewal Settings */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Renewal Settings</h2>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoRenew}
                    onChange={(e) => handleChange('autoRenew', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Auto-Renewal</span>
                    <p className="text-xs text-gray-500">Automatically renew contract at the end of term</p>
                  </div>
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

            {/* Notes */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Additional Notes</h2>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Any additional notes or special terms..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Creating...' : 'Create Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
