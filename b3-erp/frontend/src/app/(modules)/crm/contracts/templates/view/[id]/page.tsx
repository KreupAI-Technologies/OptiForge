'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Copy, FileText, Calendar, DollarSign, Clock, CheckCircle, RefreshCw, TrendingUp, Star } from 'lucide-react';
import { crmService } from '@/services/crm.service';

interface ContractTemplate {
  id: string;
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
  usageCount: number;
  lastUsed?: string;
  createdDate: string;
  isFavorite: boolean;
  tags: string[];
  includesSLA: boolean;
  includesTermination: boolean;
  includesIPRights: boolean;
  includesConfidentiality: boolean;
}

export default function ViewTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<ContractTemplate>({
    id: templateId,
    name: '',
    description: '',
    category: 'license',
    defaultDuration: 0,
    defaultValue: 0,
    billingCycle: 'annually',
    autoRenew: false,
    renewalNoticeDays: 0,
    paymentTerms: '',
    clauses: [],
    usageCount: 0,
    lastUsed: undefined,
    createdDate: '',
    isFavorite: false,
    tags: [],
    includesSLA: false,
    includesTermination: false,
    includesIPRights: false,
    includesConfidentiality: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!templateId) return;
    let active = true;
    (async () => {
      try {
        const t: any = await crmService.contractTemplates.getById(templateId);
        if (!active || !t) return;
        setTemplate({
          id: t.id ?? templateId,
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
          usageCount: Number(t.usageCount ?? 0),
          lastUsed: t.lastUsed ?? undefined,
          createdDate: t.createdDate ?? '',
          isFavorite: Boolean(t.isFavorite),
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

  const handleBack = () => {
    router.push('/crm/contracts/templates');
  };

  const handleEdit = () => {
    router.push(`/crm/contracts/templates/edit/${templateId}`);
  };

  const handleUseTemplate = () => {
    router.push(`/crm/contracts/create?templateId=${templateId}`);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'service': return 'bg-blue-100 text-blue-700';
      case 'subscription': return 'bg-purple-100 text-purple-700';
      case 'license': return 'bg-green-100 text-green-700';
      case 'support': return 'bg-orange-100 text-orange-700';
      case 'maintenance': return 'bg-teal-100 text-teal-700';
      case 'custom': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getBillingCycleColor = (cycle: string) => {
    switch (cycle) {
      case 'monthly': return 'bg-blue-50 text-blue-700';
      case 'quarterly': return 'bg-purple-50 text-purple-700';
      case 'annually': return 'bg-green-50 text-green-700';
      case 'one-time': return 'bg-gray-50 text-gray-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      <div className="w-full space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Templates
            </button>
            <div className="flex items-center gap-2">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <FileText className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
                  {template.isFavorite && (
                    <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded ${getCategoryColor(template.category)}`}>
                    {template.category.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded capitalize ${getBillingCycleColor(template.billingCycle)}`}>
                    {template.billingCycle.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleUseTemplate}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Copy className="w-5 h-5" />
              Use Template
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-5 h-5" />
              Edit
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-gray-700">{template.description}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white">
            <DollarSign className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">
              ${(template.defaultValue / 1000).toFixed(0)}K
            </div>
            <div className="text-blue-100">Default Value</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white">
            <Calendar className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{template.defaultDuration}</div>
            <div className="text-purple-100">Months Duration</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white">
            <TrendingUp className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{template.usageCount}</div>
            <div className="text-green-100">Times Used</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3 text-white">
            <Clock className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{template.renewalNoticeDays}</div>
            <div className="text-orange-100">Notice Days</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-3">
            {/* Contract Terms */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Default Contract Terms</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Duration</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {template.defaultDuration} months
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Default Value</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${template.defaultValue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Billing Cycle</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded capitalize ${getBillingCycleColor(template.billingCycle)}`}>
                    {template.billingCycle.replace('-', ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Payment Terms</p>
                  <p className="text-lg font-semibold text-gray-900">{template.paymentTerms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Auto-Renewal</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded ${
                    template.autoRenew ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {template.autoRenew ? (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span className="font-medium">Yes</span>
                      </>
                    ) : (
                      <span className="font-medium">No</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Renewal Notice</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {template.renewalNoticeDays} days
                  </p>
                </div>
              </div>
            </div>

            {/* Included Clauses */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Included Clauses ({template.clauses.length})
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {template.clauses.map((clause, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{clause}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Protections */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Legal Protections</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  template.includesSLA ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  <CheckCircle className={`w-6 h-6 ${
                    template.includesSLA ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <div>
                    <p className="font-semibold text-gray-900">Service Level Agreement</p>
                    <p className="text-xs text-gray-600">
                      {template.includesSLA ? 'Included' : 'Not included'}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  template.includesTermination ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  <CheckCircle className={`w-6 h-6 ${
                    template.includesTermination ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <div>
                    <p className="font-semibold text-gray-900">Termination Clauses</p>
                    <p className="text-xs text-gray-600">
                      {template.includesTermination ? 'Included' : 'Not included'}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  template.includesIPRights ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  <CheckCircle className={`w-6 h-6 ${
                    template.includesIPRights ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <div>
                    <p className="font-semibold text-gray-900">IP Rights</p>
                    <p className="text-xs text-gray-600">
                      {template.includesIPRights ? 'Included' : 'Not included'}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  template.includesConfidentiality ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  <CheckCircle className={`w-6 h-6 ${
                    template.includesConfidentiality ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <div>
                    <p className="font-semibold text-gray-900">Confidentiality (NDA)</p>
                    <p className="text-xs text-gray-600">
                      {template.includesConfidentiality ? 'Included' : 'Not included'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            {/* Usage Statistics */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Usage Statistics</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Times Used</p>
                  <p className="text-3xl font-bold text-gray-900">{template.usageCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Used</p>
                  <p className="text-base font-medium text-gray-900">
                    {template.lastUsed
                      ? new Date(template.lastUsed).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'Never'}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Created</p>
                  <p className="text-base font-medium text-gray-900">
                    {new Date(template.createdDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
