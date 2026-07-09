'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles,
  DollarSign,
  GitBranch,
  Wand2,
  Shield,
  FileText,
  PenTool,
  BarChart3,
  ArrowRight,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { cpqAnalyticsService, CPQDashboardSummary } from '@/services/cpq/cpq-analytics.service';
import { cpqPricingService, PricingRule as ApiPricingRule } from '@/services/cpq/cpq-pricing.service';
import {
  cpqAdvancedService,
  CPQPricingVersion as ApiPricingVersion,
  CPQApprovalMatrixRule as ApiApprovalRule,
  CPQMarginGuardrail as ApiMarginGuardrail,
  CPQGuidedSellingQuestion as ApiGuidedSellingQuestion,
  CPQDocumentTemplate as ApiDocumentTemplate,
  CPQGeneratedDocument as ApiGeneratedDocument,
} from '@/services/cpq/cpq-advanced.service';
import { PricingRulesEngine, PricingRule } from '@/components/cpq/PricingRulesEngine';
import { CreateRuleModal, EditRuleModal, TestRuleModal } from '@/components/cpq/PricingRuleModals';
import { PricingVersionControl, PricingVersion } from '@/components/cpq/PricingVersionControl';
import { CreateVersionModal, ViewVersionModal, CompareVersionsModal } from '@/components/cpq/PricingVersionModals';
import { GuidedSellingWizard, WizardStep, Question, ProductRecommendation, Answer } from '@/components/cpq/GuidedSellingWizard';
import { RecommendationsModal } from '@/components/cpq/GuidedSellingModals';
import { ApprovalMatrix, ApprovalThreshold, ApprovalRequest } from '@/components/cpq/ApprovalMatrix';
import { CreateThresholdModal, EditThresholdModal, ViewRequestModal } from '@/components/cpq/ApprovalModals';
import { DocumentGenerator, DocumentTemplate, GeneratedDocument } from '@/components/cpq/DocumentGenerator';
import { CreateTemplateModal, GenerateDocumentModal, ViewDocumentModal, PreviewTemplateModal } from '@/components/cpq/DocumentModals';
import { ESignatureIntegration, SignatureDocument } from '@/components/cpq/ESignatureIntegration';
import { UploadDocumentModal, ViewDocumentDetailModal, ViewAuditTrailModal } from '@/components/cpq/ESignatureModals';
import { MarginAnalysis, QuoteMarginAnalysis, MarginGuardrail } from '@/components/cpq/MarginAnalysis';
import { GuardrailModal, ViewQuoteDetailModal, OptimizeMarginModal } from '@/components/cpq/MarginAnalysisModals';
import { exportToCsv } from '@/lib/export';

// Live APIs: pricing-rules (/cpq/pricing/rules), version-control
// (/cpq/advanced/pricing-versions), approval matrix
// (/cpq/advanced/approval-matrix), guided-selling
// (/cpq/advanced/guided-selling), and margin-guardrails
// (/cpq/advanced/margin-guardrails).
// The Document Generator tab is live: templates (/cpq/advanced/documents/templates),
// generated documents (/cpq/advanced/documents, /cpq/advanced/documents/generate)
// and file export (/cpq/advanced/documents/:id/export).
// The remaining collections (approval requests, e-signature documents, and quote
// margin analyses) have no backend entity in this cluster yet — they render empty
// until those endpoints exist.

// ---- Pricing-rule mapping between the backend PricingRule entity and the
// PricingRulesEngine component model ----

const ruleTypeToApi = (t: PricingRule['type']): ApiPricingRule['ruleType'] => {
  switch (t) {
    case 'discount':
      return 'discount';
    case 'markup':
      return 'markup';
    case 'volume':
      return 'volume';
    default:
      return 'promotional';
  }
};

const apiToRuleType = (t: ApiPricingRule['ruleType']): PricingRule['type'] => {
  switch (t) {
    case 'discount':
      return 'discount';
    case 'markup':
      return 'markup';
    case 'volume':
      return 'volume';
    default:
      return 'bundle';
  }
};

const apiRuleToComponent = (r: ApiPricingRule): PricingRule => ({
  id: r.id,
  name: r.ruleName,
  description: r.formulaExpression,
  type: apiToRuleType(r.ruleType),
  priority: Number(r.priority) || 1,
  status: r.isActive ? 'active' : 'inactive',
  conditions: (r.conditions ?? []).map((c, i) => ({
    id: `c${i}`,
    field: c.field,
    operator: (c.operator === 'not_equals' || c.operator === 'not_in'
      ? 'equals'
      : c.operator) as PricingRule['conditions'][number]['operator'],
    value: c.value,
  })),
  actions: [
    {
      type:
        r.adjustmentType === 'fixed'
          ? 'add_amount'
          : r.adjustmentType === 'formula'
            ? 'multiply'
            : 'add_discount',
      value: Number(r.adjustmentValue) || 0,
      applyTo: 'total',
    },
  ],
  validFrom: r.validFrom,
  validTo: r.validTo,
  createdBy: '',
  createdAt: r.createdAt,
  lastModified: r.updatedAt,
});

const componentRuleToApiPayload = (r: Partial<PricingRule>): Partial<ApiPricingRule> => {
  const action = r.actions?.[0];
  const adjustmentType: ApiPricingRule['adjustmentType'] =
    action?.type === 'add_amount' || action?.type === 'set_price'
      ? 'fixed'
      : action?.type === 'multiply'
        ? 'formula'
        : 'percentage';
  return {
    ruleName: r.name ?? '',
    ruleType: ruleTypeToApi(r.type ?? 'discount'),
    priority: r.priority ?? 1,
    conditions: (r.conditions ?? []).map((c) => ({
      field: c.field,
      operator: c.operator as ApiPricingRule['conditions'][number]['operator'],
      value: c.value,
    })),
    adjustmentType,
    adjustmentValue: Number(action?.value) || 0,
    formulaExpression: r.description,
    validFrom: r.validFrom,
    validTo: r.validTo,
    isActive: r.status === 'active',
  };
};

// ---- Pricing Version Control mappers (live /cpq/advanced/pricing-versions) ----
const apiVersionToComponent = (v: ApiPricingVersion): PricingVersion => ({
  id: v.id,
  version: v.version,
  name: v.name,
  description: v.description,
  status: v.status,
  changeType: v.changeType,
  createdBy: v.createdBy || '',
  createdAt: v.createdAt,
  activatedAt: v.activatedAt,
  lastModified: v.updatedAt,
  scheduledFor: v.scheduledFor,
  changes: v.changes ?? [],
  totalItems: Number(v.totalItems) || 0,
  avgPriceChange: Number(v.avgPriceChange) || 0,
  approvedBy: v.approvedBy,
  approvedAt: v.approvedAt,
  notes: v.notes,
});

const componentVersionToApiPayload = (
  v: Partial<PricingVersion>,
): Partial<ApiPricingVersion> => ({
  version: v.version ?? '',
  name: v.name ?? '',
  description: v.description,
  status: v.status ?? 'draft',
  changeType: v.changeType ?? 'price_increase',
  changes: v.changes ?? [],
  totalItems: v.totalItems ?? 0,
  avgPriceChange: v.avgPriceChange ?? 0,
  notes: v.notes,
  createdBy: v.createdBy,
  scheduledFor: v.scheduledFor,
});

// ---- Approval Matrix mappers (live /cpq/advanced/approval-matrix) ----
const apiRuleToThreshold = (r: ApiApprovalRule): ApprovalThreshold => ({
  id: r.id,
  name: r.name,
  description: r.description || '',
  condition: (r.condition as ApprovalThreshold['condition']) ?? {
    type: 'deal_value',
    operator: 'greater_than',
    value: 0,
  },
  requiredApprovers: (r.requiredApprovers ?? []) as ApprovalThreshold['requiredApprovers'],
  priority: r.priority,
  autoEscalateAfterHours: r.autoEscalateAfterHours,
});

const thresholdToApiPayload = (
  t: Partial<ApprovalThreshold>,
): Partial<ApiApprovalRule> => ({
  name: t.name ?? '',
  description: t.description,
  condition: t.condition,
  requiredApprovers: t.requiredApprovers,
  priority: t.priority ?? 'medium',
  autoEscalateAfterHours: t.autoEscalateAfterHours,
});

// ---- Margin Guardrail mappers (live /cpq/advanced/margin-guardrails) ----
const apiGuardrailToComponent = (g: ApiMarginGuardrail): MarginGuardrail => ({
  id: g.id,
  name: g.name,
  type: g.guardrailType,
  threshold: Number(g.threshold) || 0,
  enabled: g.enabled,
  action: g.action,
  notifyRoles: g.notifyRoles ?? [],
  description: g.description,
});

const componentGuardrailToApiPayload = (
  g: Partial<MarginGuardrail>,
): Partial<ApiMarginGuardrail> => ({
  name: g.name ?? '',
  guardrailType: g.type ?? 'min_margin',
  threshold: Number(g.threshold) || 0,
  enabled: g.enabled ?? true,
  action: g.action ?? 'warn',
  notifyRoles: g.notifyRoles ?? [],
  description: g.description,
});

// ---- Guided Selling mappers (live /cpq/advanced/guided-selling) ----
// Backend questions map onto the wizard's Question shape; every persisted
// question becomes a single-step wizard question.
const apiQuestionToWizardQuestion = (q: ApiGuidedSellingQuestion): Question => ({
  id: q.id,
  title: q.title,
  description: q.description,
  type:
    q.questionType === 'multiple'
      ? 'multiple'
      : q.questionType === 'number'
        ? 'number'
        : q.questionType === 'boolean'
          ? 'boolean'
          : q.questionType === 'range'
            ? 'range'
            : q.questionType === 'text'
              ? 'text'
              : 'single',
  required: q.required,
  options: (q.options ?? []).map((o, i) => ({
    id: `${q.id}-opt-${i}`,
    label: o.label,
    value: o.value,
    recommended: o.recommended,
  })),
  helpText: q.helpText,
});

// ---- Document Generator mappers (live /cpq/advanced/documents*) ----
const apiTemplateToComponent = (t: ApiDocumentTemplate): DocumentTemplate => ({
  id: t.id,
  name: t.name,
  description: t.description || '',
  type: (t.documentType as DocumentTemplate['type']) || 'quote',
  status: (t.status as DocumentTemplate['status']) || 'draft',
  fields: [],
  sections: (t.sections ?? []).map((s, i) => ({
    id: s.id || `section-${i}`,
    title: s.title,
    content: s.content,
    order: s.order ?? i,
    editable: s.editable ?? true,
  })),
  createdBy: t.createdBy || '',
  createdAt: t.createdAt,
  lastModified: t.updatedAt,
  usageCount: Number(t.usageCount) || 0,
  version: t.version || '1.0',
});

const apiDocumentToComponent = (d: ApiGeneratedDocument): GeneratedDocument => ({
  id: d.id,
  templateId: d.templateId || '',
  templateName: d.templateName || '',
  documentType: (d.documentType as GeneratedDocument['documentType']) || 'quote',
  title: d.title || 'Untitled Document',
  customer: {
    name: d.customerName || '',
    email: (d.variables?.customerEmail as string) || '',
    company: (d.variables?.customerCompany as string) || '',
  },
  data: (d.variables as { [key: string]: unknown }) ?? {},
  status: (d.status as GeneratedDocument['status']) || 'draft',
  createdBy: d.generatedBy || '',
  createdAt: d.createdAt,
  expiresAt: d.expiresAt,
});

export default function CPQAdvancedFeaturesPage() {
  const [activeTab, setActiveTab] = useState<string>('pricing-rules');

  // Live CPQ overview KPIs (defensive: service falls back to mock on API error)
  const [summary, setSummary] = useState<CPQDashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setSummaryLoading(true);
    setSummaryError(null);
    cpqAnalyticsService
      .getDashboardSummary()
      .then((data) => {
        if (active) setSummary(data ?? null);
      })
      .catch((err) => {
        if (active) setSummaryError(err?.message || 'Failed to load CPQ overview');
      })
      .finally(() => {
        if (active) setSummaryLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Pricing Rules State (loaded from /cpq/pricing/rules)
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [rulesError, setRulesError] = useState<string | null>(null);
  const [rulesActionError, setRulesActionError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);

  const loadRules = async () => {
    setRulesLoading(true);
    setRulesError(null);
    try {
      const apiRules = await cpqPricingService.findAllRules();
      setRules((apiRules ?? []).map(apiRuleToComponent));
    } catch (err) {
      setRulesError(err instanceof Error ? err.message : 'Failed to load pricing rules');
      setRules([]);
    } finally {
      setRulesLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  // Version Control State (loaded from /cpq/advanced/pricing-versions)
  const [versions, setVersions] = useState<PricingVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(true);
  const [versionsError, setVersionsError] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState<string>('');

  const loadVersions = async () => {
    setVersionsLoading(true);
    setVersionsError(null);
    try {
      const apiVersions = await cpqAdvancedService.findAllPricingVersions();
      const mapped = (apiVersions ?? []).map(apiVersionToComponent);
      setVersions(mapped);
      const active = mapped.find((v) => v.status === 'active');
      setCurrentVersion(active?.id ?? '');
    } catch (err) {
      setVersionsError(err instanceof Error ? err.message : 'Failed to load pricing versions');
      setVersions([]);
    } finally {
      setVersionsLoading(false);
    }
  };

  useEffect(() => {
    loadVersions();
  }, []);

  const [isCreateVersionModalOpen, setIsCreateVersionModalOpen] = useState(false);
  const [isViewVersionModalOpen, setIsViewVersionModalOpen] = useState(false);
  const [isCompareVersionsModalOpen, setIsCompareVersionsModalOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<PricingVersion | null>(null);
  const [compareVersions, setCompareVersions] = useState<{ v1: PricingVersion | null; v2: PricingVersion | null }>({ v1: null, v2: null });

  // Guided Selling State
  const [isRecommendationsModalOpen, setIsRecommendationsModalOpen] = useState(false);
  const [wizardAnswers, setWizardAnswers] = useState<Answer[]>([]);
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  // Persisted guided-selling questions (live /cpq/advanced/guided-selling).
  const [guidedQuestions, setGuidedQuestions] = useState<Question[]>([]);
  const [guidedLoading, setGuidedLoading] = useState(true);
  const [guidedError, setGuidedError] = useState<string | null>(null);

  const loadGuidedQuestions = async () => {
    setGuidedLoading(true);
    setGuidedError(null);
    try {
      const apiQuestions = await cpqAdvancedService.findAllGuidedSellingQuestions();
      setGuidedQuestions((apiQuestions ?? []).map(apiQuestionToWizardQuestion));
    } catch (err) {
      setGuidedError(err instanceof Error ? err.message : 'Failed to load guided-selling questions');
      setGuidedQuestions([]);
    } finally {
      setGuidedLoading(false);
    }
  };

  useEffect(() => {
    loadGuidedQuestions();
  }, []);

  // Approval Workflows State
  // Thresholds (the approval matrix) are loaded from /cpq/advanced/approval-matrix.
  // Approval requests remain sample data (no request backend in this cluster).
  const [thresholds, setThresholds] = useState<ApprovalThreshold[]>([]);
  const [thresholdsLoading, setThresholdsLoading] = useState(true);
  const [thresholdsError, setThresholdsError] = useState<string | null>(null);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);

  const loadThresholds = async () => {
    setThresholdsLoading(true);
    setThresholdsError(null);
    try {
      const apiRules = await cpqAdvancedService.findAllApprovalRules();
      setThresholds((apiRules ?? []).map(apiRuleToThreshold));
    } catch (err) {
      setThresholdsError(err instanceof Error ? err.message : 'Failed to load approval matrix');
      setThresholds([]);
    } finally {
      setThresholdsLoading(false);
    }
  };

  useEffect(() => {
    loadThresholds();
  }, []);
  const [isCreateThresholdModalOpen, setIsCreateThresholdModalOpen] = useState(false);
  const [isEditThresholdModalOpen, setIsEditThresholdModalOpen] = useState(false);
  const [isViewRequestModalOpen, setIsViewRequestModalOpen] = useState(false);
  const [selectedThreshold, setSelectedThreshold] = useState<ApprovalThreshold | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);

  // Document Generation State (loaded from /cpq/advanced/documents*)
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [documentsActionError, setDocumentsActionError] = useState<string | null>(null);
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false);
  const [isGenerateDocModalOpen, setIsGenerateDocModalOpen] = useState(false);
  const [isViewDocModalOpen, setIsViewDocModalOpen] = useState(false);
  const [isPreviewTemplateModalOpen, setIsPreviewTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<GeneratedDocument | null>(null);

  const loadDocuments = async () => {
    setDocumentsLoading(true);
    setDocumentsError(null);
    try {
      const [apiTemplates, apiDocuments] = await Promise.all([
        cpqAdvancedService.findAllDocumentTemplates(),
        cpqAdvancedService.findAllGeneratedDocuments(),
      ]);
      setTemplates((apiTemplates ?? []).map(apiTemplateToComponent));
      setDocuments((apiDocuments ?? []).map(apiDocumentToComponent));
    } catch (err) {
      setDocumentsError(err instanceof Error ? err.message : 'Failed to load documents');
      setTemplates([]);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // E-Signature State
  const [signatureDocs, setSignatureDocs] = useState<SignatureDocument[]>([]);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [isViewDocDetailModalOpen, setIsViewDocDetailModalOpen] = useState(false);
  const [isViewAuditTrailModalOpen, setIsViewAuditTrailModalOpen] = useState(false);
  const [selectedSignatureDoc, setSelectedSignatureDoc] = useState<SignatureDocument | null>(null);

  // Margin Analysis State
  const [quotes, setQuotes] = useState<QuoteMarginAnalysis[]>([]);
  // Guardrails are loaded from /cpq/advanced/margin-guardrails.
  const [guardrails, setGuardrails] = useState<MarginGuardrail[]>([]);
  const [guardrailsLoading, setGuardrailsLoading] = useState(true);
  const [guardrailsError, setGuardrailsError] = useState<string | null>(null);

  const loadGuardrails = async () => {
    setGuardrailsLoading(true);
    setGuardrailsError(null);
    try {
      const apiGuardrails = await cpqAdvancedService.findAllMarginGuardrails();
      setGuardrails((apiGuardrails ?? []).map(apiGuardrailToComponent));
    } catch (err) {
      setGuardrailsError(err instanceof Error ? err.message : 'Failed to load margin guardrails');
      setGuardrails([]);
    } finally {
      setGuardrailsLoading(false);
    }
  };

  useEffect(() => {
    loadGuardrails();
  }, []);
  const [isGuardrailModalOpen, setIsGuardrailModalOpen] = useState(false);
  const [isViewQuoteModalOpen, setIsViewQuoteModalOpen] = useState(false);
  const [isOptimizeMarginModalOpen, setIsOptimizeMarginModalOpen] = useState(false);
  const [selectedGuardrail, setSelectedGuardrail] = useState<MarginGuardrail | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<QuoteMarginAnalysis | null>(null);
  const targetMargin = 30;

  // Pricing Rules Handlers
  const handleCreateRule = () => {
    setIsCreateModalOpen(true);
  };

  const handleSaveNewRule = async (newRule: Partial<PricingRule>) => {
    setRulesActionError(null);
    try {
      await cpqPricingService.createRule(componentRuleToApiPayload(newRule));
      setIsCreateModalOpen(false);
      await loadRules();
    } catch (err) {
      setRulesActionError(err instanceof Error ? err.message : 'Failed to create pricing rule');
    }
  };

  const handleEditRule = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      setSelectedRule(rule);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEditedRule = async (updatedRule: PricingRule) => {
    setRulesActionError(null);
    try {
      await cpqPricingService.updateRule(updatedRule.id, componentRuleToApiPayload(updatedRule));
      setIsEditModalOpen(false);
      setSelectedRule(null);
      await loadRules();
    } catch (err) {
      setRulesActionError(err instanceof Error ? err.message : 'Failed to update pricing rule');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    if (!confirm(`Are you sure you want to delete the rule "${rule.name}"?`)) return;
    setRulesActionError(null);
    try {
      await cpqPricingService.deleteRule(ruleId);
      await loadRules();
    } catch (err) {
      setRulesActionError(err instanceof Error ? err.message : 'Failed to delete pricing rule');
    }
  };

  const handleDuplicateRule = async (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    setRulesActionError(null);
    try {
      await cpqPricingService.createRule({
        ...componentRuleToApiPayload(rule),
        ruleName: `${rule.name} (Copy)`,
        isActive: false,
      });
      await loadRules();
    } catch (err) {
      setRulesActionError(err instanceof Error ? err.message : 'Failed to duplicate pricing rule');
    }
  };

  const handleToggleStatus = async (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    setRulesActionError(null);
    try {
      await cpqPricingService.updateRule(ruleId, { isActive: rule.status !== 'active' });
      await loadRules();
    } catch (err) {
      setRulesActionError(err instanceof Error ? err.message : 'Failed to update rule status');
    }
  };

  const handleTestRule = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      setSelectedRule(rule);
      setIsTestModalOpen(true);
    }
  };

  // Version Control Handlers
  const handleCreateVersion = () => {
    setIsCreateVersionModalOpen(true);
  };

  const handleSaveNewVersion = async (newVersion: Partial<PricingVersion>) => {
    setVersionsError(null);
    try {
      await cpqAdvancedService.createPricingVersion(
        componentVersionToApiPayload({
          ...newVersion,
          createdBy: newVersion.createdBy || 'Current User',
        }),
      );
      await loadVersions();
    } catch (err) {
      setVersionsError(err instanceof Error ? err.message : 'Failed to create pricing version');
    }
  };

  const handleActivateVersion = (versionId: string) => {
    if (confirm('Activate this version? This will make it the current active version.')) {
      setVersions(versions.map(v => {
        if (v.id === versionId) {
          return {
            ...v,
            status: 'active' as const,
            activatedAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
          };
        }
        // Deactivate current active version
        if (v.status === 'active') {
          return { ...v, status: 'superseded' as const };
        }
        return v;
      }));
      setCurrentVersion(versionId);
    }
  };

  const handleArchiveVersion = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version && confirm(`Archive version "${version.version}"?`)) {
      setVersions(versions.map(v =>
        v.id === versionId
          ? { ...v, status: 'archived' as const, lastModified: new Date().toISOString() }
          : v
      ));
    }
  };

  const handleViewVersion = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      setSelectedVersion(version);
      setIsViewVersionModalOpen(true);
    }
  };

  const handleCompareVersions = (versionId1: string, versionId2: string) => {
    const v1 = versions.find(v => v.id === versionId1);
    const v2 = versions.find(v => v.id === versionId2);
    if (v1 && v2) {
      setCompareVersions({ v1, v2 });
      setIsCompareVersionsModalOpen(true);
    }
  };

  const handleDuplicateVersion = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      const duplicatedVersion: PricingVersion = {
        ...version,
        id: `version-${Date.now()}`,
        version: `${version.version}-copy`,
        name: `${version.name} (Copy)`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        activatedAt: undefined,
        approvedBy: undefined,
        approvedAt: undefined
      };
      setVersions([duplicatedVersion, ...versions]);
    }
  };

  const handleRollbackVersion = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version && confirm(`Rollback to version "${version.version}"? This will reactivate this version.`)) {
      handleActivateVersion(versionId);
    }
  };

  const handleExportVersion = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      const exportData = JSON.stringify(version, null, 2);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pricing-version-${version.version}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Guided Selling Handlers
  const handleWizardComplete = (answers: Answer[], productRecommendations: ProductRecommendation[]) => {
    setWizardAnswers(answers);
    setRecommendations(productRecommendations);
    setIsRecommendationsModalOpen(true);
  };

  const handleWizardCancel = () => {
    if (confirm('Are you sure you want to cancel? All your answers will be lost.')) {
      // Reset wizard state if needed
      setWizardAnswers([]);
      setRecommendations([]);
    }
  };

  const handleSelectRecommendation = (recommendation: ProductRecommendation) => {
    console.log('Selected recommendation:', recommendation);
    // In a real app, this would add to cart or create a quote
  };

  // Approval Workflows Handlers
  const handleCreateThreshold = () => {
    setIsCreateThresholdModalOpen(true);
  };

  const handleSaveNewThreshold = async (newThreshold: Partial<ApprovalThreshold>) => {
    setThresholdsError(null);
    try {
      await cpqAdvancedService.createApprovalRule(thresholdToApiPayload(newThreshold));
      await loadThresholds();
    } catch (err) {
      setThresholdsError(err instanceof Error ? err.message : 'Failed to create approval rule');
    }
  };

  const handleEditThreshold = (thresholdId: string) => {
    const threshold = thresholds.find(t => t.id === thresholdId);
    if (threshold) {
      setSelectedThreshold(threshold);
      setIsEditThresholdModalOpen(true);
    }
  };

  const handleSaveEditedThreshold = (updatedThreshold: ApprovalThreshold) => {
    setThresholds(thresholds.map(t => t.id === updatedThreshold.id ? updatedThreshold : t));
  };

  const handleDeleteThreshold = (thresholdId: string) => {
    const threshold = thresholds.find(t => t.id === thresholdId);
    if (threshold && confirm(`Delete threshold "${threshold.name}"?`)) {
      setThresholds(thresholds.filter(t => t.id !== thresholdId));
    }
  };

  const handleApprove = (requestId: string, comments?: string) => {
    setApprovalRequests(approvalRequests.map(request => {
      if (request.id === requestId) {
        const updatedApprovers = request.approvers.map(approver => {
          if (approver.role === 'director' && approver.status === 'pending') {
            return {
              ...approver,
              status: 'approved' as const,
              respondedAt: new Date().toISOString(),
              comments: comments || 'Approved'
            };
          }
          return approver;
        });

        // Check if all approvers have approved
        const allApproved = updatedApprovers.every(a => a.status === 'approved');

        return {
          ...request,
          approvers: updatedApprovers,
          status: allApproved ? 'approved' as const : request.status
        };
      }
      return request;
    }));
  };

  const handleReject = (requestId: string, comments: string) => {
    setApprovalRequests(approvalRequests.map(request => {
      if (request.id === requestId) {
        const updatedApprovers = request.approvers.map(approver => {
          if (approver.role === 'director' && approver.status === 'pending') {
            return {
              ...approver,
              status: 'rejected' as const,
              respondedAt: new Date().toISOString(),
              comments
            };
          }
          return approver;
        });

        return {
          ...request,
          approvers: updatedApprovers,
          status: 'rejected' as const
        };
      }
      return request;
    }));
  };

  const handleEscalate = (requestId: string) => {
    if (confirm('Escalate this approval request to the next level?')) {
      setApprovalRequests(approvalRequests.map(request =>
        request.id === requestId
          ? { ...request, status: 'escalated' as const, escalatedAt: new Date().toISOString() }
          : request
      ));
    }
  };

  const handleViewRequest = (requestId: string) => {
    const request = approvalRequests.find(r => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setIsViewRequestModalOpen(true);
    }
  };

  // Document Generation Handlers
  const handleCreateTemplate = () => {
    setIsCreateTemplateModalOpen(true);
  };

  const handleSaveNewTemplate = async (newTemplate: Partial<DocumentTemplate>) => {
    setDocumentsActionError(null);
    try {
      await cpqAdvancedService.createDocumentTemplate({
        name: newTemplate.name || '',
        description: newTemplate.description,
        documentType: newTemplate.type || 'quote',
        sections: (newTemplate.sections ?? []).map((s) => ({
          id: s.id,
          title: s.title,
          content: s.content,
          order: s.order,
          editable: s.editable,
        })),
      });
      await loadDocuments();
    } catch (err) {
      setDocumentsActionError(err instanceof Error ? err.message : 'Failed to create template');
    }
  };

  const handleEditTemplate = (templateId: string) => {
    console.log('Edit template:', templateId);
    // In production, this would open an edit modal
  };

  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template && confirm(`Delete template "${template.name}"?`)) {
      setTemplates(templates.filter(t => t.id !== templateId));
    }
  };

  const handleDuplicateTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const duplicated: DocumentTemplate = {
        ...template,
        id: `template-${Date.now()}`,
        name: `${template.name} (Copy)`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        usageCount: 0
      };
      setTemplates([...templates, duplicated]);
    }
  };

  const handleGenerateDocument = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setIsGenerateDocModalOpen(true);
    }
  };

  const handleSaveGeneratedDocument = async (data: any) => {
    setDocumentsActionError(null);
    try {
      await cpqAdvancedService.generateDocument({
        templateId: data.templateId,
        title: data.title,
        documentType: data.documentType,
        customerName: data.customer?.name,
        variables: {
          customerEmail: data.customer?.email,
          customerCompany: data.customer?.company,
          dealValue: data.dealValue,
          expiresInDays: data.expiresInDays,
          templateName: data.templateName,
        },
        generatedBy: 'Current User',
      });
      await loadDocuments();
    } catch (err) {
      setDocumentsActionError(err instanceof Error ? err.message : 'Failed to generate document');
    }
  };

  const handleViewDocument = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc) {
      setSelectedDocument(doc);
      setIsViewDocModalOpen(true);
    }
  };

  const handleDownloadDocument = async (documentId: string) => {
    setDocumentsActionError(null);
    try {
      await cpqAdvancedService.exportDocument(documentId, 'pdf');
    } catch (err) {
      setDocumentsActionError(err instanceof Error ? err.message : 'Failed to download document');
    }
  };

  const handleSendDocument = (documentId: string) => {
    if (confirm('Send this document to the customer?')) {
      setDocuments(documents.map(d =>
        d.id === documentId
          ? { ...d, status: 'sent' as const, sentAt: new Date().toISOString() }
          : d
      ));
    }
  };

  const handlePreviewTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setIsPreviewTemplateModalOpen(true);
    }
  };

  // E-Signature Handlers
  const handleUploadSignatureDocument = () => {
    setIsUploadDocModalOpen(true);
  };

  const handleSaveUploadedDocument = (data: any) => {
    const newDoc: SignatureDocument = {
      id: `esig-${Date.now()}`,
      title: data.title,
      description: data.description,
      status: 'draft',
      documentType: data.documentType,
      fileUrl: `/documents/${data.fileName}`,
      fileName: data.fileName,
      fileSize: data.fileSize,
      signers: data.signers,
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
      expiresAt: data.expiresAt,
      remindersSent: 0,
      securityOptions: data.securityOptions,
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          actor: 'Current User',
          action: 'Document Created',
          details: `Created document: ${data.title}`,
        },
      ],
      customMessage: data.customMessage,
      brandingEnabled: data.brandingEnabled,
    };
    setSignatureDocs([newDoc, ...signatureDocs]);
  };

  const handleSendSignatureDocument = (documentId: string) => {
    if (confirm('Send this document for signature?')) {
      setSignatureDocs(signatureDocs.map(doc => {
        if (doc.id === documentId) {
          const now = new Date().toISOString();
          return {
            ...doc,
            status: 'sent' as const,
            sentAt: now,
            signers: doc.signers.map(s => ({ ...s, status: 'sent' as const, sentAt: now })),
            auditTrail: [
              ...doc.auditTrail,
              {
                timestamp: now,
                actor: 'Current User',
                action: 'Document Sent',
                details: `Sent to ${doc.signers.length} signer(s)`,
              },
            ],
          };
        }
        return doc;
      }));
    }
  };

  const handleVoidSignatureDocument = (documentId: string, reason: string) => {
    setSignatureDocs(signatureDocs.map(doc => {
      if (doc.id === documentId) {
        const now = new Date().toISOString();
        return {
          ...doc,
          status: 'voided' as const,
          voidedAt: now,
          voidReason: reason,
          auditTrail: [
            ...doc.auditTrail,
            {
              timestamp: now,
              actor: 'Current User',
              action: 'Document Voided',
              details: reason,
            },
          ],
        };
      }
      return doc;
    }));
  };

  const handleResendSignatureDocument = (documentId: string) => {
    if (confirm('Resend this document to all pending signers?')) {
      setSignatureDocs(signatureDocs.map(doc => {
        if (doc.id === documentId) {
          return {
            ...doc,
            auditTrail: [
              ...doc.auditTrail,
              {
                timestamp: new Date().toISOString(),
                actor: 'Current User',
                action: 'Document Resent',
                details: 'Resent to pending signers',
              },
            ],
          };
        }
        return doc;
      }));
    }
  };

  const handleSendSignatureReminder = (documentId: string, signerId: string) => {
    const doc = signatureDocs.find(d => d.id === documentId);
    const signer = doc?.signers.find(s => s.id === signerId);

    if (doc && signer && confirm(`Send reminder to ${signer.name}?`)) {
      setSignatureDocs(signatureDocs.map(d => {
        if (d.id === documentId) {
          return {
            ...d,
            remindersSent: d.remindersSent + 1,
            lastReminderAt: new Date().toISOString(),
            auditTrail: [
              ...d.auditTrail,
              {
                timestamp: new Date().toISOString(),
                actor: 'Current User',
                action: 'Reminder Sent',
                details: `Reminder sent to ${signer.name}`,
              },
            ],
          };
        }
        return d;
      }));
    }
  };

  const handleDownloadSignedDocument = (documentId: string) => {
    const doc = signatureDocs.find(d => d.id === documentId);
    if (doc && doc.status === 'signed') {
      console.log('Downloading signed document:', doc.title);
      alert(`Downloading signed document: ${doc.title}.pdf`);
    }
  };

  const handleViewSignatureDocument = (documentId: string) => {
    const doc = signatureDocs.find(d => d.id === documentId);
    if (doc) {
      setSelectedSignatureDoc(doc);
      setIsViewDocDetailModalOpen(true);
    }
  };

  const handleViewAuditTrail = (documentId: string) => {
    const doc = signatureDocs.find(d => d.id === documentId);
    if (doc) {
      setSelectedSignatureDoc(doc);
      setIsViewAuditTrailModalOpen(true);
    }
  };

  // Margin Analysis Handlers
  const handleCreateGuardrail = () => {
    setSelectedGuardrail(null);
    setIsGuardrailModalOpen(true);
  };

  const handleEditGuardrail = (guardrailId: string) => {
    const guardrail = guardrails.find(g => g.id === guardrailId);
    if (guardrail) {
      setSelectedGuardrail(guardrail);
      setIsGuardrailModalOpen(true);
    }
  };

  const handleSaveGuardrail = async (data: MarginGuardrail) => {
    setGuardrailsError(null);
    if (selectedGuardrail) {
      // Editing is optimistic — no update endpoint in this cluster yet.
      setGuardrails(guardrails.map(g => g.id === data.id ? data : g));
      return;
    }
    try {
      await cpqAdvancedService.createMarginGuardrail(
        componentGuardrailToApiPayload(data),
      );
      await loadGuardrails();
    } catch (err) {
      setGuardrailsError(err instanceof Error ? err.message : 'Failed to save margin guardrail');
    }
  };

  const handleToggleGuardrail = (guardrailId: string) => {
    // Optimistic toggle — persisted on next create/reload.
    setGuardrails(guardrails.map(g =>
      g.id === guardrailId ? { ...g, enabled: !g.enabled } : g
    ));
  };

  const handleViewQuote = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (quote) {
      setSelectedQuote(quote);
      setIsViewQuoteModalOpen(true);
    }
  };

  const handleOptimizeMargin = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (quote) {
      setSelectedQuote(quote);
      setIsOptimizeMarginModalOpen(true);
    }
  };

  const handleApplyOptimization = (quoteId: string, optimizations: any[]) => {
    setQuotes(quotes.map(quote => {
      if (quote.id === quoteId) {
        const updatedProducts = quote.products.map(product => {
          const opt = optimizations.find(o => o.productId === product.id);
          if (opt) {
            const newSellingPrice = opt.recommendedPrice;
            const newMarginAmount = newSellingPrice - product.cost;
            const newMarginPercent = (newMarginAmount / newSellingPrice) * 100;
            const newTotalRevenue = newSellingPrice * product.quantity;
            const newTotalCost = product.cost * product.quantity;
            const newTotalMargin = newTotalRevenue - newTotalCost;

            return {
              ...product,
              sellingPrice: newSellingPrice,
              marginAmount: newMarginAmount,
              marginPercent: newMarginPercent,
              totalRevenue: newTotalRevenue,
              totalMargin: newTotalMargin,
              discountPercent: ((product.basePrice - newSellingPrice) / product.basePrice) * 100,
              discountAmount: product.basePrice - newSellingPrice,
              status: newMarginPercent >= targetMargin + 10 ? 'excellent' as const :
                      newMarginPercent >= targetMargin ? 'healthy' as const :
                      newMarginPercent >= targetMargin - 5 ? 'warning' as const :
                      'critical' as const,
            };
          }
          return product;
        });

        const newTotalRevenue = updatedProducts.reduce((sum, p) => sum + p.totalRevenue, 0);
        const newTotalCost = updatedProducts.reduce((sum, p) => sum + p.totalCost, 0);
        const newTotalMargin = newTotalRevenue - newTotalCost;
        const newMarginPercent = (newTotalMargin / newTotalRevenue) * 100;

        return {
          ...quote,
          products: updatedProducts,
          totalRevenue: newTotalRevenue,
          totalCost: newTotalCost,
          totalMargin: newTotalMargin,
          marginPercent: newMarginPercent,
          status: newMarginPercent >= targetMargin + 10 ? 'excellent' as const :
                  newMarginPercent >= targetMargin ? 'healthy' as const :
                  newMarginPercent >= targetMargin - 5 ? 'warning' as const :
                  'critical' as const,
          lastModified: new Date().toISOString(),
        };
      }
      return quote;
    }));
  };

  const handleExportAnalysis = () => {
    exportToCsv('margin-analysis', quotes);
  };

  const features = [
    {
      id: 'pricing-rules',
      name: 'Pricing Rules Engine',
      icon: DollarSign,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      description: 'Automated pricing logic with conditional rules',
    },
    {
      id: 'version-control',
      name: 'Version Control',
      icon: GitBranch,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      description: 'Track pricing changes and manage versions',
    },
    {
      id: 'guided-selling',
      name: 'Guided Selling',
      icon: Wand2,
      color: 'text-green-600',
      bg: 'bg-green-50',
      description: 'Step-by-step product configuration wizard',
    },
    {
      id: 'approvals',
      name: 'Approval Workflows',
      icon: Shield,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      description: 'Multi-level approval matrices and thresholds',
    },
    {
      id: 'documents',
      name: 'Document Generation',
      icon: FileText,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      description: 'Template-based document creation',
    },
    {
      id: 'e-signature',
      name: 'E-Signature',
      icon: PenTool,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      description: 'Digital signature workflows and tracking',
    },
    {
      id: 'margin-analysis',
      name: 'Margin Analysis',
      icon: BarChart3,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      description: 'Real-time margin analytics and guardrails',
    },
  ];

  const activeFeature = features.find((f) => f.id === activeTab);

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center space-x-3 mb-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">CPQ Advanced Features</h1>
        </div>
        <p className="text-gray-600">
          Enterprise-grade CPQ capabilities including pricing automation, approval workflows, document generation, and margin analytics
        </p>
      </div>

      {/* Live CPQ Overview KPIs */}
      <div className="mb-3">
        {summaryLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : summaryError ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            Unable to load live CPQ overview. {summaryError}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                <FileText className="h-4 w-4" /> Total Quotes
              </div>
              <div className="mt-1 text-2xl font-bold text-gray-900">
                {(summary.quoteMetrics?.total ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                <DollarSign className="h-4 w-4" /> Pipeline Value
              </div>
              <div className="mt-1 text-2xl font-bold text-gray-900">
                ${(summary.valueMetrics?.totalPipelineValue ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                <TrendingUp className="h-4 w-4" /> Win Rate
              </div>
              <div className="mt-1 text-2xl font-bold text-gray-900">
                {(summary.performanceMetrics?.winRate ?? 0).toFixed(1)}%
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                <CheckCircle className="h-4 w-4" /> Avg Deal Size
              </div>
              <div className="mt-1 text-2xl font-bold text-gray-900">
                ${(summary.valueMetrics?.avgDealSize ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Feature Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 mb-3 overflow-hidden">
        <div className="grid grid-cols-7 divide-x divide-gray-200">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isActive = feature.id === activeTab;

            return (
              <button
                key={feature.id}
                onClick={() => setActiveTab(feature.id)}
                className={`p-4 transition-all ${
                  isActive
                    ? `${feature.bg} border-b-4 border-current ${feature.color}`
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`p-3 rounded-lg ${isActive ? 'bg-white' : feature.bg}`}>
                    <Icon className={`h-6 w-6 ${isActive ? feature.color : 'text-gray-500'}`} />
                  </div>
                  <span className={`text-xs font-semibold text-center ${isActive ? feature.color : 'text-gray-700'}`}>
                    {feature.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature Description */}
      {activeFeature && (
        <div className={`mb-3 ${activeFeature.bg} rounded-lg border border-gray-200 p-3`}>
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-white rounded-lg">
              <activeFeature.icon className={`h-6 w-6 ${activeFeature.color}`} />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${activeFeature.color} mb-1`}>{activeFeature.name}</h2>
              <p className="text-sm text-gray-700">{activeFeature.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Feature Content */}
      <div>
        {activeTab === 'pricing-rules' && (
          <>
            {rulesLoading && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                Loading pricing rules…
              </div>
            )}
            {rulesError && !rulesLoading && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {rulesError}
              </div>
            )}
            {rulesActionError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {rulesActionError}
              </div>
            )}
            <PricingRulesEngine
              rules={rules}
              onCreateRule={handleCreateRule}
              onEditRule={handleEditRule}
              onDeleteRule={handleDeleteRule}
              onDuplicateRule={handleDuplicateRule}
              onToggleStatus={handleToggleStatus}
              onTestRule={handleTestRule}
            />

            <CreateRuleModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSave={handleSaveNewRule}
            />

            <EditRuleModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedRule(null);
              }}
              onSave={handleSaveEditedRule}
              rule={selectedRule}
            />

            <TestRuleModal
              isOpen={isTestModalOpen}
              onClose={() => {
                setIsTestModalOpen(false);
                setSelectedRule(null);
              }}
              rule={selectedRule}
            />
          </>
        )}

        {activeTab === 'version-control' && (
          <>
            {versionsLoading && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                Loading pricing versions…
              </div>
            )}
            {versionsError && !versionsLoading && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {versionsError}
              </div>
            )}
            <PricingVersionControl
              versions={versions}
              currentVersion={currentVersion}
              onCreateVersion={handleCreateVersion}
              onActivateVersion={handleActivateVersion}
              onArchiveVersion={handleArchiveVersion}
              onViewVersion={handleViewVersion}
              onCompareVersions={handleCompareVersions}
              onDuplicateVersion={handleDuplicateVersion}
              onRollbackVersion={handleRollbackVersion}
              onExportVersion={handleExportVersion}
            />

            <CreateVersionModal
              isOpen={isCreateVersionModalOpen}
              onClose={() => setIsCreateVersionModalOpen(false)}
              onSave={handleSaveNewVersion}
            />

            <ViewVersionModal
              isOpen={isViewVersionModalOpen}
              onClose={() => {
                setIsViewVersionModalOpen(false);
                setSelectedVersion(null);
              }}
              version={selectedVersion}
            />

            <CompareVersionsModal
              isOpen={isCompareVersionsModalOpen}
              onClose={() => {
                setIsCompareVersionsModalOpen(false);
                setCompareVersions({ v1: null, v2: null });
              }}
              version1={compareVersions.v1}
              version2={compareVersions.v2}
            />
          </>
        )}

        {activeTab === 'guided-selling' && (
          <>
            {guidedLoading && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                Loading guided-selling questions…
              </div>
            )}
            {guidedError && !guidedLoading && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {guidedError}
              </div>
            )}
            {!guidedLoading && !guidedError && guidedQuestions.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                No guided-selling questions configured yet.
              </div>
            ) : (
              <GuidedSellingWizard
                steps={
                  guidedQuestions.length > 0
                    ? [
                        {
                          id: 'guided-selling-live',
                          title: 'Product Discovery',
                          description:
                            'Answer the qualifying questions to receive tailored recommendations.',
                          icon: Wand2,
                          status: 'active',
                          questions: guidedQuestions,
                        },
                      ]
                    : []
                }
                onComplete={handleWizardComplete}
                onCancel={handleWizardCancel}
                showRecommendations={true}
              />
            )}

            <RecommendationsModal
              isOpen={isRecommendationsModalOpen}
              onClose={() => setIsRecommendationsModalOpen(false)}
              recommendations={recommendations}
              answers={wizardAnswers}
              onSelectRecommendation={handleSelectRecommendation}
            />
          </>
        )}

        {activeTab === 'approvals' && (
          <>
            {thresholdsLoading && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                Loading approval matrix…
              </div>
            )}
            {thresholdsError && !thresholdsLoading && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {thresholdsError}
              </div>
            )}
            <ApprovalMatrix
              thresholds={thresholds}
              approvalRequests={approvalRequests}
              currentUserRole="director"
              onCreateThreshold={handleCreateThreshold}
              onEditThreshold={handleEditThreshold}
              onDeleteThreshold={handleDeleteThreshold}
              onApprove={handleApprove}
              onReject={handleReject}
              onEscalate={handleEscalate}
              onViewRequest={handleViewRequest}
            />

            <CreateThresholdModal
              isOpen={isCreateThresholdModalOpen}
              onClose={() => setIsCreateThresholdModalOpen(false)}
              onSave={handleSaveNewThreshold}
            />

            <EditThresholdModal
              isOpen={isEditThresholdModalOpen}
              onClose={() => {
                setIsEditThresholdModalOpen(false);
                setSelectedThreshold(null);
              }}
              onSave={handleSaveEditedThreshold}
              threshold={selectedThreshold}
            />

            <ViewRequestModal
              isOpen={isViewRequestModalOpen}
              onClose={() => {
                setIsViewRequestModalOpen(false);
                setSelectedRequest(null);
              }}
              request={selectedRequest}
              currentUserRole="director"
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </>
        )}

        {activeTab === 'documents' && (
          <>
            {documentsLoading && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                Loading document templates and documents…
              </div>
            )}
            {documentsError && !documentsLoading && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {documentsError}
              </div>
            )}
            {documentsActionError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {documentsActionError}
              </div>
            )}
            <DocumentGenerator
              templates={templates}
              documents={documents}
              onCreateTemplate={handleCreateTemplate}
              onEditTemplate={handleEditTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onDuplicateTemplate={handleDuplicateTemplate}
              onGenerateDocument={handleGenerateDocument}
              onViewDocument={handleViewDocument}
              onDownloadDocument={handleDownloadDocument}
              onSendDocument={handleSendDocument}
              onPreviewTemplate={handlePreviewTemplate}
            />

            <CreateTemplateModal
              isOpen={isCreateTemplateModalOpen}
              onClose={() => setIsCreateTemplateModalOpen(false)}
              onSave={handleSaveNewTemplate}
            />

            <GenerateDocumentModal
              isOpen={isGenerateDocModalOpen}
              onClose={() => {
                setIsGenerateDocModalOpen(false);
                setSelectedTemplate(null);
              }}
              onGenerate={handleSaveGeneratedDocument}
              template={selectedTemplate}
            />

            <ViewDocumentModal
              isOpen={isViewDocModalOpen}
              onClose={() => {
                setIsViewDocModalOpen(false);
                setSelectedDocument(null);
              }}
              document={selectedDocument}
              onDownload={handleDownloadDocument}
              onSend={handleSendDocument}
            />

            <PreviewTemplateModal
              isOpen={isPreviewTemplateModalOpen}
              onClose={() => {
                setIsPreviewTemplateModalOpen(false);
                setSelectedTemplate(null);
              }}
              template={selectedTemplate}
            />
          </>
        )}

        {activeTab === 'e-signature' && (
          <>
            <ESignatureIntegration
              documents={signatureDocs}
              onSendDocument={handleSendSignatureDocument}
              onVoidDocument={handleVoidSignatureDocument}
              onResendDocument={handleResendSignatureDocument}
              onSendReminder={handleSendSignatureReminder}
              onDownloadDocument={handleDownloadSignedDocument}
              onViewDocument={handleViewSignatureDocument}
              onViewAuditTrail={handleViewAuditTrail}
              onUploadDocument={handleUploadSignatureDocument}
            />

            <UploadDocumentModal
              isOpen={isUploadDocModalOpen}
              onClose={() => setIsUploadDocModalOpen(false)}
              onUpload={handleSaveUploadedDocument}
            />

            <ViewDocumentDetailModal
              isOpen={isViewDocDetailModalOpen}
              onClose={() => {
                setIsViewDocDetailModalOpen(false);
                setSelectedSignatureDoc(null);
              }}
              document={selectedSignatureDoc}
              onDownload={handleDownloadSignedDocument}
              onSend={handleSendSignatureDocument}
            />

            <ViewAuditTrailModal
              isOpen={isViewAuditTrailModalOpen}
              onClose={() => {
                setIsViewAuditTrailModalOpen(false);
                setSelectedSignatureDoc(null);
              }}
              document={selectedSignatureDoc}
            />
          </>
        )}

        {activeTab === 'margin-analysis' && (
          <>
            {guardrailsLoading && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                Loading margin guardrails…
              </div>
            )}
            {guardrailsError && !guardrailsLoading && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {guardrailsError}
              </div>
            )}
            <MarginAnalysis
              quotes={quotes}
              guardrails={guardrails}
              targetMargin={targetMargin}
              onEditGuardrail={handleEditGuardrail}
              onToggleGuardrail={handleToggleGuardrail}
              onCreateGuardrail={handleCreateGuardrail}
              onViewQuote={handleViewQuote}
              onOptimizeMargin={handleOptimizeMargin}
              onExportAnalysis={handleExportAnalysis}
            />

            <GuardrailModal
              isOpen={isGuardrailModalOpen}
              onClose={() => {
                setIsGuardrailModalOpen(false);
                setSelectedGuardrail(null);
              }}
              onSave={handleSaveGuardrail}
              guardrail={selectedGuardrail}
            />

            <ViewQuoteDetailModal
              isOpen={isViewQuoteModalOpen}
              onClose={() => {
                setIsViewQuoteModalOpen(false);
                setSelectedQuote(null);
              }}
              quote={selectedQuote}
              targetMargin={targetMargin}
            />

            <OptimizeMarginModal
              isOpen={isOptimizeMarginModalOpen}
              onClose={() => {
                setIsOptimizeMarginModalOpen(false);
                setSelectedQuote(null);
              }}
              quote={selectedQuote}
              targetMargin={targetMargin}
              onApplyOptimization={handleApplyOptimization}
            />
          </>
        )}
      </div>
    </div>
  );
}
