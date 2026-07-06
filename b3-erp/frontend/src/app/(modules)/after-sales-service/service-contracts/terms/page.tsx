'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Copy,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  ServiceContractService,
  type ServiceContractRecord,
} from '@/services/service-contract.service';

interface ContractTemplate {
  id: string;
  name: string;
  contractType: 'AMC' | 'CMC' | 'Extended Warranty';
  description: string;
  defaultDuration: number; // months
  responseTimeSLA: number; // hours
  resolutionTimeSLA: number; // hours
  coverageHours: string;
  inclusions: string[];
  exclusions: string[];
  specialTerms: string[];
  isDefault: boolean;
  usageCount: number;
}

interface SLAPreset {
  id: string;
  name: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  responseTime: number; // hours
  resolutionTime: number; // hours
  description: string;
}

// Map the backend enum contract type (e.g. 'amc', 'extended_warranty') onto
// the labels this page renders. Falls back to the raw value when unknown.
function normalizeContractType(raw: unknown): ContractTemplate['contractType'] {
  const key = String(raw ?? '').toLowerCase().replace(/[\s_-]+/g, '');
  if (key === 'amc') return 'AMC';
  if (key === 'cmc') return 'CMC';
  if (key === 'extendedwarranty') return 'Extended Warranty';
  // Unknown types are grouped under AMC's label bucket for display purposes.
  return 'AMC';
}

function asArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

// Derive display templates by grouping real contracts by (normalized) type.
// Each group's representative record supplies the terms/SLA/coverage, and the
// group size becomes the usage count.
function deriveTemplates(records: ServiceContractRecord[]): ContractTemplate[] {
  const groups = new Map<string, ServiceContractRecord[]>();
  for (const rec of records) {
    const label = normalizeContractType(rec.contractType);
    const bucket = groups.get(label) ?? [];
    bucket.push(rec);
    groups.set(label, bucket);
  }

  const templates: ContractTemplate[] = [];
  let seq = 1;
  for (const [label, group] of Array.from(groups.entries())) {
    // Representative = the record with the richest terms (most inclusions).
    const rep = [...group].sort(
      (a, b) => asArray(b.inclusions).length - asArray(a.inclusions).length,
    )[0];
    const coverage = asArray(rep.serviceCoverage);
    templates.push({
      id: `TPL-${String(seq).padStart(3, '0')}`,
      name: `${label} Template`,
      contractType: label as ContractTemplate['contractType'],
      description:
        typeof rep.termsAndConditions === 'string' && rep.termsAndConditions
          ? rep.termsAndConditions
          : `Derived from ${group.length} ${label} contract${group.length === 1 ? '' : 's'}`,
      defaultDuration: typeof rep.duration === 'number' ? rep.duration : 12,
      responseTimeSLA: typeof rep.responseTimeSLA === 'number' ? rep.responseTimeSLA : 0,
      resolutionTimeSLA:
        typeof rep.resolutionTimeSLA === 'number' ? rep.resolutionTimeSLA : 0,
      coverageHours:
        typeof rep.visitFrequency === 'string' && rep.visitFrequency
          ? `Visit frequency: ${rep.visitFrequency}`
          : 'Not specified',
      inclusions: asArray(rep.inclusions),
      exclusions: asArray(rep.exclusions),
      specialTerms: coverage,
      isDefault: seq === 1,
      usageCount: group.length,
    });
    seq += 1;
  }
  return templates;
}

// Derive SLA presets from the distinct (response, resolution) pairs across the
// real contracts, ranked fastest-first into P1..P4.
function deriveSlaPresets(records: ServiceContractRecord[]): SLAPreset[] {
  const pairs = new Map<string, { response: number; resolution: number }>();
  for (const rec of records) {
    const response = typeof rec.responseTimeSLA === 'number' ? rec.responseTimeSLA : undefined;
    const resolution =
      typeof rec.resolutionTimeSLA === 'number' ? rec.resolutionTimeSLA : undefined;
    if (response == null || resolution == null) continue;
    pairs.set(`${response}-${resolution}`, { response, resolution });
  }

  const priorities: SLAPreset['priority'][] = ['P1', 'P2', 'P3', 'P4'];
  const labels = ['Critical', 'High', 'Medium', 'Low'];
  return Array.from(pairs.values())
    .sort((a, b) => a.response - b.response || a.resolution - b.resolution)
    .slice(0, 4)
    .map((pair, idx) => ({
      id: `SLA-${String(idx + 1).padStart(3, '0')}`,
      name: `${labels[idx] ?? `Tier ${idx + 1}`} - ${priorities[idx] ?? 'P4'}`,
      priority: priorities[idx] ?? 'P4',
      responseTime: pair.response,
      resolutionTime: pair.resolution,
      description: `Response within ${pair.response}h, resolution within ${pair.resolution}h`,
    }));
}

export default function ContractTermsConfigPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'sla' | 'clauses'>('templates');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSLAModal, setShowSLAModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);

  // Contract Templates are DERIVED from real service-contract records.
  // The backend (`GET /after-sales/contracts`) exposes contracts, not preset
  // templates, so we group real contracts by contract type and surface the
  // representative terms/SLA/coverage for each type.
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  // SLA Presets are DERIVED from the distinct (responseTime, resolutionTime)
  // pairs seen across real contracts, ranked into P1..P4 tiers.
  const [slaPresets, setSlaPresets] = useState<SLAPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const records = await ServiceContractService.getContractRecords();
        if (cancelled) return;
        const list = Array.isArray(records) ? records : [];
        setTemplates(deriveTemplates(list));
        setSlaPresets(deriveSlaPresets(list));
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : 'Failed to load contract terms',
          );
          setTemplates([]);
          setSlaPresets([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Standard Clauses Library
  const standardClauses = {
    inclusions: [
      'Preventive maintenance visits',
      'Emergency repair services',
      'Parts replacement',
      'Labor charges',
      'Routine inspections',
      'Remote diagnostics',
      'Priority spare parts',
      'Annual equipment audit',
      'Performance reports',
      'Equipment cleaning'
    ],
    exclusions: [
      'Consumables and supplies',
      'Damages due to misuse',
      'Third-party equipment',
      'Cosmetic repairs',
      'Upgrades and modifications',
      'Relocation costs',
      'Unauthorized repairs',
      'Force majeure events',
      'Commercial misuse',
      'Structural modifications'
    ],
    specialTerms: [
      'Priority response for critical issues',
      'Dedicated service engineer',
      'Annual performance review',
      'Quarterly service reports',
      'Guaranteed response times',
      'Account manager assigned',
      'Monthly performance tracking',
      'Free equipment audit',
      'Transferable contract',
      'No deductible for parts'
    ]
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-100 text-red-700';
      case 'P2': return 'bg-orange-100 text-orange-700';
      case 'P3': return 'bg-yellow-100 text-yellow-700';
      case 'P4': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'AMC': return 'bg-blue-100 text-blue-700';
      case 'CMC': return 'bg-green-100 text-green-700';
      case 'Extended Warranty': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contract Terms Configuration</h1>
          <p className="text-sm text-gray-500 mt-1">Manage contract templates, SLA presets, and standard clauses</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {activeTab === 'templates' && (
            <button
              onClick={() => {
                setEditingTemplate(null);
                setShowTemplateModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              New Template
            </button>
          )}
          {activeTab === 'sla' && (
            <button
              onClick={() => setShowSLAModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              New SLA Preset
            </button>
          )}
        </div>
      </div>

      {/* Load state banners */}
      {isLoading && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-2 text-sm text-gray-600">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          Loading contract terms from service contracts…
        </div>
      )}
      {!isLoading && loadError && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4" />
            {loadError}
          </div>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="text-sm font-medium text-red-700 underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}
      {!isLoading && !loadError && templates.length === 0 && slaPresets.length === 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm text-gray-500 flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          No service contracts found yet. Contract templates and SLA presets are derived from existing contracts.
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Contract Templates</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{templates.length}</div>
          <div className="text-xs text-gray-500 mt-1">{templates.filter(t => t.isDefault).length} default templates</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">SLA Presets</span>
            <Clock className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{slaPresets.length}</div>
          <div className="text-xs text-gray-500 mt-1">4 priority levels</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Usage</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {templates.reduce((sum, t) => sum + t.usageCount, 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Contracts created</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Standard Clauses</span>
            <Settings className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {standardClauses.inclusions.length + standardClauses.exclusions.length + standardClauses.specialTerms.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Available clauses</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${activeTab === 'templates'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Contract Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('sla')}
            className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${activeTab === 'sla'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            SLA Presets ({slaPresets.length})
          </button>
          <button
            onClick={() => setActiveTab('clauses')}
            className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${activeTab === 'clauses'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Standard Clauses Library
          </button>
        </div>
      </div>

      {/* Contract Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-2">
          {templates.map((template) => (
            <div key={template.id} className="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.contractType)}`}>
                      {template.contractType}
                    </span>
                    {template.isDefault && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="ml-2 font-medium text-gray-900">{template.defaultDuration} months</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Response SLA:</span>
                      <span className="ml-2 font-medium text-gray-900">{template.responseTimeSLA}h</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Resolution SLA:</span>
                      <span className="ml-2 font-medium text-gray-900">{template.resolutionTimeSLA}h</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Usage:</span>
                      <span className="ml-2 font-medium text-gray-900">{template.usageCount} contracts</span>
                    </div>
                  </div>

                  <div className="mt-4 text-sm">
                    <div className="text-gray-500 mb-1">Coverage Hours:</div>
                    <div className="text-gray-900">{template.coverageHours}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => {
                      setEditingTemplate(template);
                      setShowTemplateModal(true);
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"

                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const newTemplate = { ...template, id: `TPL-${Date.now()}`, name: `${template.name} (Copy)`, isDefault: false, usageCount: 0 };
                      setTemplates([...templates, newTemplate]);
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"

                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"

                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expandable Details */}
              <details className="mt-4">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                  View Terms & Conditions
                </summary>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="font-medium text-gray-900 mb-2">Inclusions ({template.inclusions.length})</div>
                    <ul className="space-y-1">
                      {template.inclusions.map((item, idx) => (
                        <li key={idx} className="text-gray-600 flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="font-medium text-gray-900 mb-2">Exclusions ({template.exclusions.length})</div>
                    <ul className="space-y-1">
                      {template.exclusions.map((item, idx) => (
                        <li key={idx} className="text-gray-600 flex items-start gap-2">
                          <X className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="font-medium text-gray-900 mb-2">Special Terms ({template.specialTerms.length})</div>
                    <ul className="space-y-1">
                      {template.specialTerms.map((item, idx) => (
                        <li key={idx} className="text-gray-600 flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>
      )}

      {/* SLA Presets Tab */}
      {activeTab === 'sla' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {slaPresets.map((preset) => (
            <div key={preset.id} className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{preset.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(preset.priority)}`}>
                      {preset.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{preset.description}</p>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"

                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"

                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-blue-600 font-medium">Response Time</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{preset.responseTime}h</div>
                  <div className="text-xs text-blue-700 mt-1">Time to acknowledge</div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Resolution Time</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">{preset.resolutionTime}h</div>
                  <div className="text-xs text-green-700 mt-1">Time to resolve</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Standard Clauses Tab */}
      {activeTab === 'clauses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Inclusions</h3>
            </div>
            <div className="space-y-2">
              {standardClauses.inclusions.map((clause, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
                  <input type="checkbox" className="mt-1" />
                  <span className="text-sm text-gray-700">{clause}</span>
                </div>
              ))}
            </div>
            <button className="mt-4 flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md">
              <Plus className="w-3 h-3" />
              Add New Inclusion
            </button>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <X className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Exclusions</h3>
            </div>
            <div className="space-y-2">
              {standardClauses.exclusions.map((clause, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
                  <input type="checkbox" className="mt-1" />
                  <span className="text-sm text-gray-700">{clause}</span>
                </div>
              ))}
            </div>
            <button className="mt-4 flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md">
              <Plus className="w-3 h-3" />
              Add New Exclusion
            </button>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Special Terms</h3>
            </div>
            <div className="space-y-2">
              {standardClauses.specialTerms.map((clause, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
                  <input type="checkbox" className="mt-1" />
                  <span className="text-sm text-gray-700">{clause}</span>
                </div>
              ))}
            </div>
            <button className="mt-4 flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md">
              <Plus className="w-3 h-3" />
              Add New Term
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
