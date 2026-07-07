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

// Mock Data
const mockRules: PricingRule[] = [
  {
    id: '1',
    name: 'Volume Discount - Enterprise',
    description: 'Automatic 15% discount for orders over $50,000',
    type: 'volume',
    priority: 10,
    status: 'active',
    conditions: [
      { id: 'c1', field: 'deal_value', operator: 'greater_than', value: 50000 },
    ],
    actions: [
      { type: 'add_discount', value: 15, applyTo: 'total' },
    ],
    validFrom: '2025-01-01',
    createdBy: 'Admin',
    createdAt: '2025-01-15',
    lastModified: '2025-01-20',
    executionCount: 47,
  },
  {
    id: '2',
    name: 'Bundle Pricing - Starter Pack',
    description: '20% discount when buying all starter products together',
    type: 'bundle',
    priority: 8,
    status: 'active',
    conditions: [
      { id: 'c2', field: 'product_category', operator: 'equals', value: 'starter_pack' },
      { id: 'c3', field: 'quantity', operator: 'greater_than', value: 3, logicOperator: 'AND' },
    ],
    actions: [
      { type: 'add_discount', value: 20, applyTo: 'line_items' },
    ],
    createdBy: 'Sales Manager',
    createdAt: '2025-01-10',
    lastModified: '2025-01-18',
    executionCount: 23,
  },
];

const mockVersions: PricingVersion[] = [
  {
    id: '1',
    version: 'v2.1',
    name: 'Q1 2025 Price Increase',
    description: 'Annual price adjustment reflecting increased manufacturing costs',
    status: 'active',
    changeType: 'price_increase',
    createdBy: 'Pricing Team',
    createdAt: '2025-01-10T10:00:00Z',
    activatedAt: '2025-01-15T08:00:00Z',
    lastModified: '2025-01-15T08:00:00Z',
    changes: [
      { productId: '1', productName: 'Product A', oldPrice: 100, newPrice: 105, changePercent: 5 },
      { productId: '2', productName: 'Product B', oldPrice: 200, newPrice: 215, changePercent: 7.5 },
      { productId: '3', productName: 'Product C', oldPrice: 300, newPrice: 309, changePercent: 3 },
    ],
    totalItems: 45,
    avgPriceChange: 5.2,
    approvedBy: 'VP Sales',
    approvedAt: '2025-01-14T16:00:00Z',
  },
  {
    id: '2',
    version: 'v2.0',
    name: 'Holiday Promotion 2024',
    description: 'Temporary price reductions for year-end promotion',
    status: 'archived',
    changeType: 'price_decrease',
    createdBy: 'Marketing',
    createdAt: '2024-11-15T10:00:00Z',
    activatedAt: '2024-12-01T00:00:00Z',
    lastModified: '2024-12-31T23:59:59Z',
    changes: [
      { productId: '1', productName: 'Product A', oldPrice: 100, newPrice: 85, changePercent: -15 },
      { productId: '2', productName: 'Product B', oldPrice: 200, newPrice: 170, changePercent: -15 },
    ],
    totalItems: 30,
    avgPriceChange: -12.5,
    approvedBy: 'CEO',
    approvedAt: '2024-11-20T14:00:00Z',
  },
];

const mockWizardSteps: WizardStep[] = [
  {
    id: 'step1',
    title: 'Business Requirements',
    description: 'Tell us about your business needs',
    icon: Sparkles,
    status: 'active',
    questions: [
      {
        id: 'q1',
        title: 'What is your company size?',
        type: 'single',
        required: true,
        options: [
          { id: 'o1', label: '1-10 employees', value: 'small', icon: TrendingUp, popular: true },
          { id: 'o2', label: '11-50 employees', value: 'medium', icon: TrendingUp },
          { id: 'o3', label: '51-200 employees', value: 'large', icon: TrendingUp, recommended: true },
          { id: 'o4', label: '200+ employees', value: 'enterprise', icon: TrendingUp },
        ],
      },
    ],
  },
];

const mockThresholds: ApprovalThreshold[] = [
  {
    id: '1',
    name: 'Large Deal Approval',
    description: 'Requires director approval for deals over $100K',
    condition: {
      type: 'deal_value',
      operator: 'greater_than',
      value: 100000,
    },
    requiredApprovers: [
      { role: 'director', count: 1 },
    ],
    autoEscalateAfterHours: 48,
    priority: 'high',
  },
];

const mockApprovalRequests: ApprovalRequest[] = [
  {
    id: '1',
    quoteId: 'Q-2025-001',
    quoteName: 'Enterprise Manufacturing Solution',
    customerName: 'Global Tech Industries',
    dealValue: 125000,
    discountPercent: 18,
    marginPercent: 32,
    requestedBy: 'Sarah Johnson',
    requestedAt: '2025-01-20T10:00:00Z',
    status: 'pending',
    approvers: [
      {
        id: 'a1',
        name: 'Michael Chen',
        email: 'michael@company.com',
        role: 'director',
        order: 1,
        status: 'pending',
      },
    ],
    threshold: mockThresholds[0],
    currentApprovalLevel: 1,
    totalApprovalLevels: 1,
    justification: 'Strategic account with high growth potential and multi-year commitment',
  },
];

const mockTemplates: DocumentTemplate[] = [
  {
    id: '1',
    name: 'Standard Sales Quote',
    description: 'Professional quote template with company branding',
    type: 'quote',
    status: 'active',
    fields: [
      { id: 'f1', name: 'customer_name', label: 'Customer Name', type: 'text', required: true },
      { id: 'f2', name: 'total_amount', label: 'Total Amount', type: 'currency', required: true },
    ],
    sections: [
      { id: 's1', title: 'Introduction', content: 'Thank you for your interest...', order: 1, editable: true },
      { id: 's2', title: 'Pricing', content: 'See attached pricing details...', order: 2, editable: false },
    ],
    createdBy: 'Sales Ops',
    createdAt: '2025-01-01T00:00:00Z',
    lastModified: '2025-01-15T00:00:00Z',
    usageCount: 145,
    version: '2.0',
  },
];

const mockDocuments: GeneratedDocument[] = [
  {
    id: '1',
    templateId: '1',
    templateName: 'Standard Sales Quote',
    documentType: 'quote',
    title: 'Quote for Global Tech Industries',
    customer: {
      name: 'John Smith',
      email: 'john@globaltech.com',
      company: 'Global Tech Industries',
    },
    data: {},
    status: 'sent',
    createdBy: 'Sarah Johnson',
    createdAt: '2025-01-20T10:00:00Z',
    sentAt: '2025-01-20T11:00:00Z',
  },
];

const mockSignatureDocs: SignatureDocument[] = [
  {
    id: '1',
    title: 'Enterprise Service Agreement - Global Tech',
    description: 'Three-year service agreement for manufacturing platform',
    status: 'awaiting',
    documentType: 'contract',
    fileUrl: '/docs/contract.pdf',
    fileName: 'contract-globaltech-2025.pdf',
    fileSize: 245000,
    signers: [
      {
        id: 's1',
        name: 'John Smith',
        email: 'john@globaltech.com',
        role: 'signer',
        order: 1,
        status: 'signed',
        signedAt: '2025-01-21T14:30:00Z',
        ipAddress: '192.168.1.100',
        location: 'New York, USA',
      },
      {
        id: 's2',
        name: 'Sarah Johnson',
        email: 'sarah@company.com',
        role: 'signer',
        order: 2,
        status: 'pending',
      },
    ],
    createdBy: 'Sales Team',
    createdAt: '2025-01-20T10:00:00Z',
    sentAt: '2025-01-20T11:00:00Z',
    expiresAt: '2025-02-20T23:59:59Z',
    remindersSent: 1,
    lastReminderAt: '2025-01-22T09:00:00Z',
    securityOptions: {
      requireIdVerification: true,
      allowPrinting: false,
      allowDownload: false,
      watermark: true,
    },
    auditTrail: [
      {
        timestamp: '2025-01-20T10:00:00Z',
        actor: 'Sarah Johnson',
        action: 'Document Created',
        details: 'Created from template',
      },
      {
        timestamp: '2025-01-20T11:00:00Z',
        actor: 'System',
        action: 'Document Sent',
        details: 'Sent to 2 signers',
      },
    ],
  },
];

const mockQuotes: QuoteMarginAnalysis[] = [
  {
    id: '1',
    quoteId: 'Q-2025-001',
    quoteName: 'Enterprise Manufacturing Solution',
    customer: 'Global Tech Industries',
    totalRevenue: 125000,
    totalCost: 75000,
    totalMargin: 50000,
    marginPercent: 40,
    status: 'healthy',
    products: [
      {
        id: 'p1',
        productId: 'PROD-001',
        productName: 'Manufacturing Platform License',
        category: 'Software',
        basePrice: 50000,
        cost: 25000,
        sellingPrice: 45000,
        discountPercent: 10,
        discountAmount: 5000,
        marginAmount: 20000,
        marginPercent: 44.4,
        status: 'healthy',
        quantity: 1,
        totalRevenue: 45000,
        totalCost: 25000,
        totalMargin: 20000,
      },
    ],
    createdBy: 'Sarah Johnson',
    createdAt: '2025-01-20T10:00:00Z',
    lastModified: '2025-01-20T15:00:00Z',
  },
];

const mockGuardrails: MarginGuardrail[] = [
  {
    id: '1',
    name: 'Minimum Margin Protection',
    type: 'min_margin',
    threshold: 25,
    enabled: true,
    action: 'require_approval',
    notifyRoles: ['Sales Manager', 'Director'],
    description: 'Requires approval when margin falls below 25%',
  },
  {
    id: '2',
    name: 'Maximum Discount Cap',
    type: 'max_discount',
    threshold: 20,
    enabled: true,
    action: 'block',
    notifyRoles: ['VP Sales'],
    description: 'Blocks deals with discounts exceeding 20%',
  },
];

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

  // Pricing Rules State
  const [rules, setRules] = useState<PricingRule[]>(mockRules);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);

  // Version Control State
  const [versions, setVersions] = useState<PricingVersion[]>(mockVersions);
  const [currentVersion, setCurrentVersion] = useState<string>('1');
  const [isCreateVersionModalOpen, setIsCreateVersionModalOpen] = useState(false);
  const [isViewVersionModalOpen, setIsViewVersionModalOpen] = useState(false);
  const [isCompareVersionsModalOpen, setIsCompareVersionsModalOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<PricingVersion | null>(null);
  const [compareVersions, setCompareVersions] = useState<{ v1: PricingVersion | null; v2: PricingVersion | null }>({ v1: null, v2: null });

  // Guided Selling State
  const [isRecommendationsModalOpen, setIsRecommendationsModalOpen] = useState(false);
  const [wizardAnswers, setWizardAnswers] = useState<Answer[]>([]);
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);

  // Approval Workflows State
  const [thresholds, setThresholds] = useState<ApprovalThreshold[]>(mockThresholds);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(mockApprovalRequests);
  const [isCreateThresholdModalOpen, setIsCreateThresholdModalOpen] = useState(false);
  const [isEditThresholdModalOpen, setIsEditThresholdModalOpen] = useState(false);
  const [isViewRequestModalOpen, setIsViewRequestModalOpen] = useState(false);
  const [selectedThreshold, setSelectedThreshold] = useState<ApprovalThreshold | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);

  // Document Generation State
  const [templates, setTemplates] = useState<DocumentTemplate[]>(mockTemplates);
  const [documents, setDocuments] = useState<GeneratedDocument[]>(mockDocuments);
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false);
  const [isGenerateDocModalOpen, setIsGenerateDocModalOpen] = useState(false);
  const [isViewDocModalOpen, setIsViewDocModalOpen] = useState(false);
  const [isPreviewTemplateModalOpen, setIsPreviewTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<GeneratedDocument | null>(null);

  // E-Signature State
  const [signatureDocs, setSignatureDocs] = useState<SignatureDocument[]>(mockSignatureDocs);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [isViewDocDetailModalOpen, setIsViewDocDetailModalOpen] = useState(false);
  const [isViewAuditTrailModalOpen, setIsViewAuditTrailModalOpen] = useState(false);
  const [selectedSignatureDoc, setSelectedSignatureDoc] = useState<SignatureDocument | null>(null);

  // Margin Analysis State
  const [quotes, setQuotes] = useState<QuoteMarginAnalysis[]>(mockQuotes);
  const [guardrails, setGuardrails] = useState<MarginGuardrail[]>(mockGuardrails);
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

  const handleSaveNewRule = (newRule: Partial<PricingRule>) => {
    const ruleWithId: PricingRule = {
      id: `rule-${Date.now()}`,
      name: newRule.name || '',
      description: newRule.description,
      type: newRule.type || 'discount',
      priority: newRule.priority || 1,
      status: newRule.status || 'draft',
      conditions: newRule.conditions || [],
      actions: newRule.actions || [],
      validFrom: newRule.validFrom,
      validTo: newRule.validTo,
      createdBy: newRule.createdBy || 'Current User',
      createdAt: newRule.createdAt || new Date().toISOString(),
      lastModified: newRule.lastModified || new Date().toISOString(),
      executionCount: 0
    };
    setRules([...rules, ruleWithId]);
  };

  const handleEditRule = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      setSelectedRule(rule);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEditedRule = (updatedRule: PricingRule) => {
    setRules(rules.map(r => r.id === updatedRule.id ? updatedRule : r));
  };

  const handleDeleteRule = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule && confirm(`Are you sure you want to delete the rule "${rule.name}"?`)) {
      setRules(rules.filter(r => r.id !== ruleId));
    }
  };

  const handleDuplicateRule = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      const duplicatedRule: PricingRule = {
        ...rule,
        id: `rule-${Date.now()}`,
        name: `${rule.name} (Copy)`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        executionCount: 0
      };
      setRules([...rules, duplicatedRule]);
    }
  };

  const handleToggleStatus = (ruleId: string) => {
    setRules(rules.map(r => {
      if (r.id === ruleId) {
        const newStatus = r.status === 'active' ? 'inactive' : 'active';
        return {
          ...r,
          status: newStatus,
          lastModified: new Date().toISOString()
        };
      }
      return r;
    }));
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

  const handleSaveNewVersion = (newVersion: Partial<PricingVersion>) => {
    const versionWithId: PricingVersion = {
      id: `version-${Date.now()}`,
      version: newVersion.version || '',
      name: newVersion.name || '',
      description: newVersion.description,
      status: newVersion.status || 'draft',
      changeType: newVersion.changeType || 'price_increase',
      createdBy: newVersion.createdBy || 'Current User',
      createdAt: newVersion.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString(),
      changes: newVersion.changes || [],
      totalItems: newVersion.totalItems || 0,
      avgPriceChange: newVersion.avgPriceChange || 0,
      notes: newVersion.notes,
      scheduledFor: newVersion.scheduledFor
    };
    setVersions([versionWithId, ...versions]);
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

  const handleSaveNewThreshold = (newThreshold: Partial<ApprovalThreshold>) => {
    const thresholdWithId: ApprovalThreshold = {
      id: `threshold-${Date.now()}`,
      name: newThreshold.name || '',
      description: newThreshold.description || '',
      condition: newThreshold.condition || {
        type: 'deal_value',
        operator: 'greater_than',
        value: 0
      },
      requiredApprovers: newThreshold.requiredApprovers || [],
      priority: newThreshold.priority || 'medium',
      autoEscalateAfterHours: newThreshold.autoEscalateAfterHours
    };
    setThresholds([...thresholds, thresholdWithId]);
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

  const handleSaveNewTemplate = (newTemplate: Partial<DocumentTemplate>) => {
    const templateWithId: DocumentTemplate = {
      id: `template-${Date.now()}`,
      name: newTemplate.name || '',
      description: newTemplate.description || '',
      type: newTemplate.type || 'quote',
      status: newTemplate.status || 'draft',
      fields: newTemplate.fields || [],
      sections: newTemplate.sections || [],
      createdBy: newTemplate.createdBy || 'Current User',
      createdAt: newTemplate.createdAt || new Date().toISOString(),
      lastModified: newTemplate.lastModified || new Date().toISOString(),
      usageCount: 0,
      version: '1.0'
    };
    setTemplates([...templates, templateWithId]);
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

  const handleSaveGeneratedDocument = (data: any) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (data.expiresInDays || 30));

    const newDoc: GeneratedDocument = {
      id: `doc-${Date.now()}`,
      templateId: data.templateId,
      templateName: data.templateName,
      documentType: data.documentType,
      title: data.title,
      customer: data.customer,
      data: data,
      status: 'draft',
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString()
    };
    setDocuments([...documents, newDoc]);

    // Update template usage count
    setTemplates(templates.map(t =>
      t.id === data.templateId ? { ...t, usageCount: t.usageCount + 1 } : t
    ));
  };

  const handleViewDocument = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc) {
      setSelectedDocument(doc);
      setIsViewDocModalOpen(true);
    }
  };

  const handleDownloadDocument = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc) {
      console.log('Downloading document:', doc.title);
      // In production, this would trigger actual download
      alert(`Downloading: ${doc.title}.pdf`);
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

  const handleSaveGuardrail = (data: MarginGuardrail) => {
    if (selectedGuardrail) {
      // Edit existing
      setGuardrails(guardrails.map(g => g.id === data.id ? data : g));
    } else {
      // Create new
      setGuardrails([...guardrails, data]);
    }
  };

  const handleToggleGuardrail = (guardrailId: string) => {
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
            <GuidedSellingWizard
              steps={mockWizardSteps}
              onComplete={handleWizardComplete}
              onCancel={handleWizardCancel}
              showRecommendations={true}
            />

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
