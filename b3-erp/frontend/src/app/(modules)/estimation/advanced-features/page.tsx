'use client';

import { useState, useEffect, useCallback } from 'react';
import { estimationAnalyticsService } from '@/services/estimation-analytics.service';
import { costEstimateService, CostEstimate } from '@/services/estimation-cost-estimate.service';
import {
  estimationAdvancedService,
  EstimateVersionRecord,
  WhatIfScenario,
  BOMImportSessionRecord,
} from '@/services/estimation-advanced.service';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Sparkles,
  Calculator,
  GitBranch,
  AlertTriangle,
  Shield,
  Upload,
  BarChart3,
  Lightbulb,
} from 'lucide-react';
import { CostBreakdown, CostBreakdownData, CostLineItem } from '@/components/estimation/CostBreakdown';
import { VersionComparison, EstimateVersion } from '@/components/estimation/VersionComparison';
import { RiskAnalysis, RiskItem } from '@/components/estimation/RiskAnalysis';
import { WorkflowApprovals, ApprovalRequest, ApprovalThreshold } from '@/components/estimation/WorkflowApprovals';
import { BOMImport, BOMImportSession, ImportSource, BOMLineItem } from '@/components/estimation/BOMImport';
import { HistoricalBenchmarking } from '@/components/estimation/HistoricalBenchmarking';
import { WhatIfSimulation, SimulationVariable, SimulationScenario } from '@/components/estimation/WhatIfSimulation';

const COMPANY_ID = 'default-company-id';

// Map a live CostEstimate into the CostBreakdown component shape.
function toCostBreakdownData(e: CostEstimate): CostBreakdownData {
  const total = Number(e.totalCost) || 0;
  const pct = (v: number) => (total ? Number(((v / total) * 100).toFixed(1)) : 0);
  const cat = (
    category: CostBreakdownData['categorySummary'][number]['category'],
    amount: number,
  ) => ({
    category,
    totalCost: amount,
    percentage: pct(amount),
    itemCount: amount > 0 ? 1 : 0,
    status: 'normal' as const,
  });
  return {
    id: e.id,
    estimateId: e.estimateNumber || e.id,
    estimateName: e.title || 'Cost Estimate',
    totalCost: total,
    targetMargin: 0,
    suggestedPrice: total,
    contingency: Number(e.contingencyPercentage) || 0,
    contingencyAmount: Number(e.contingency) || 0,
    lastUpdated: e.updatedAt,
    updatedBy: e.approvedBy || e.submittedBy || '',
    lineItems: ([
      { id: `${e.id}-material`, category: 'material', description: 'Material', quantity: 1, unit: 'lot', unitCost: e.materialCost, totalCost: e.materialCost },
      { id: `${e.id}-labor`, category: 'labor', description: 'Labor', quantity: 1, unit: 'lot', unitCost: e.laborCost, totalCost: e.laborCost },
      { id: `${e.id}-equipment`, category: 'equipment', description: 'Equipment', quantity: 1, unit: 'lot', unitCost: e.equipmentCost, totalCost: e.equipmentCost },
      { id: `${e.id}-overhead`, category: 'overhead', description: 'Overhead', quantity: 1, unit: 'lot', unitCost: e.overheadCost, totalCost: e.overheadCost },
      { id: `${e.id}-subcontractor`, category: 'subcontractor', description: 'Subcontractor', quantity: 1, unit: 'lot', unitCost: e.subcontractorCost, totalCost: e.subcontractorCost },
    ] as CostLineItem[]).filter((li) => li.totalCost > 0),
    categorySummary: [
      cat('material', e.materialCost),
      cat('labor', e.laborCost),
      cat('equipment', e.equipmentCost),
      cat('overhead', e.overheadCost),
      cat('subcontractor', e.subcontractorCost),
    ],
  };
}

// Static approval policy (no dedicated backend endpoint; kept as config).
const APPROVAL_THRESHOLDS: ApprovalThreshold[] = [
  { id: '1', name: 'Large Estimate Approval', description: 'Requires director approval for estimates over $500K', condition: { type: 'estimate_value', operator: 'greater_than', value: 500000 }, requiredApprovers: [{ role: 'director', count: 1 }], priority: 'high' },
];

// ---- Backend -> component prop mappers ----

function toEstimateVersion(v: EstimateVersionRecord): EstimateVersion {
  const total = Number(v.totalCost) || 0;
  const price = Number(v.suggestedPrice) || total;
  const margin = Number(v.margin) || price - total;
  const statusMap: Record<string, EstimateVersion['status']> = {
    Draft: 'draft',
    'Pending Approval': 'submitted',
    Submitted: 'submitted',
    Approved: 'approved',
    Rejected: 'rejected',
    Superseded: 'superseded',
  };
  return {
    id: v.id,
    version: v.version != null ? `v${v.version}` : 'v1',
    name: v.name || v.title || 'Version',
    status: statusMap[String(v.status)] ?? 'draft',
    totalCost: total,
    suggestedPrice: price,
    margin,
    marginPercent: Number(v.marginPercent) || (price ? Number(((margin / price) * 100).toFixed(1)) : 0),
    createdBy: v.createdBy || '',
    createdAt: v.createdAt || '',
    notes: v.notes,
    changes: v.changes,
    approvedBy: v.approvedBy,
    approvedAt: v.approvedAt,
    rejectedReason: v.rejectedReason,
  };
}

function toApprovalRequest(e: CostEstimate): ApprovalRequest {
  const value = Number(e.totalCost) || 0;
  const price = value;
  const marginPercent = 0;
  return {
    id: e.id,
    estimateId: e.estimateNumber || e.id,
    estimateName: e.title || 'Cost Estimate',
    estimateValue: value,
    marginPercent,
    requestedBy: e.submittedBy || '',
    requestedAt: e.submittedAt || e.updatedAt || e.createdAt,
    status: 'pending',
    approvers: [{ id: `${e.id}-a1`, name: 'Director', email: '', role: 'director', order: 1, status: 'pending' }],
    threshold: APPROVAL_THRESHOLDS[0],
    currentLevel: 1,
    totalLevels: 1,
  };
}

function toBOMImportSession(s: BOMImportSessionRecord): BOMImportSession {
  const items: BOMLineItem[] = (s.rows || []).map((r, i) => ({
    itemNumber: String(i + 1),
    partNumber: r.code,
    description: r.description,
    quantity: Number(r.quantity) || 0,
    unit: 'ea',
    unitCost: Number(r.unitCost) || 0,
    totalCost: (Number(r.quantity) || 0) * (Number(r.unitCost) || 0),
    status: 'valid' as const,
  }));
  const errorCount = (s.errors || []).length;
  const statusMap: Record<string, BOMImportSession['status']> = {
    ready: 'ready',
    processing: 'processing',
    completed: 'completed',
    failed: 'failed',
  };
  return {
    id: s.id,
    source: 'csv',
    fileName: s.fileName || 'bom.csv',
    fileSize: 0,
    status: statusMap[String(s.status)] ?? 'completed',
    uploadedAt: s.createdAt || new Date().toISOString(),
    processedAt: s.createdAt,
    totalItems: Number(s.rowCount) || items.length,
    validItems: items.length - errorCount,
    itemsWithWarnings: 0,
    itemsWithErrors: errorCount,
    items,
  };
}

function toSimulationScenario(s: WhatIfScenario): SimulationScenario {
  const base = Number(s.results?.baseValue ?? s.baseValue) || 0;
  const total = Number(s.results?.adjustedValue) || base;
  const variance = Number(s.results?.deltaValue) || total - base;
  const variancePercent = Number(s.results?.deltaPct) || (base ? (variance / base) * 100 : 0);
  return {
    id: s.id,
    name: s.name,
    description: (s.variables || []).map((v) => `${v.label} ${v.adjustPct > 0 ? '+' : ''}${v.adjustPct}%`).join(', ') || 'Scenario',
    variables: (s.variables || []).map((v) => ({ variableId: v.key, value: v.adjustPct })),
    totalCost: total,
    margin: 0,
    suggestedPrice: total,
    variance,
    variancePercent: Number(variancePercent.toFixed(1)),
  };
}

// Mock Data - Historical Benchmarking
interface HistoricalProject {
  id: string;
  name: string;
  completedDate: string;
  estimatedCost: number;
  actualCost: number;
  variance: number;
  variancePercent: number;
  duration: number;
  category: string;
  accuracy: 'excellent' | 'good' | 'fair' | 'poor';
}

const emptyBenchmarkMetrics = {
  averageAccuracy: 0,
  totalProjects: 0,
  onBudgetProjects: 0,
  overBudgetProjects: 0,
  underBudgetProjects: 0,
  avgVariancePercent: 0,
  bestAccuracy: 0,
  worstAccuracy: 0,
};

export default function EstimationAdvancedFeaturesPage() {
  const [activeTab, setActiveTab] = useState<string>('cost-breakdown');
  const [selectedVersion1, setSelectedVersion1] = useState<string>('1');
  const [selectedVersion2, setSelectedVersion2] = useState<string>('3');

  // Primary view: live cost breakdown for the most recent estimate.
  const [primaryEstimate, setPrimaryEstimate] = useState<CostEstimate | null>(null);
  const [costData, setCostData] = useState<CostBreakdownData | null>(null);
  const [costLoading, setCostLoading] = useState<boolean>(true);
  const [costError, setCostError] = useState<string | null>(null);

  // Real backend id of the primary estimate (UUID), used for by-estimate fetches.
  const estimateId = primaryEstimate?.id ?? '';

  // Live analytics: pull historical benchmarks/projects.
  const [historicalProjects, setHistoricalProjects] = useState<HistoricalProject[]>([]);
  const [benchmarkMetrics, setBenchmarkMetrics] = useState(emptyBenchmarkMetrics);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setCostLoading(true);
      try {
        const estimates = (await costEstimateService.findAll(COMPANY_ID)) as CostEstimate[];
        if (cancelled) return;
        const first = Array.isArray(estimates) && estimates.length ? estimates[0] : null;
        setPrimaryEstimate(first);
        setCostData(first ? toCostBreakdownData(first) : null);
      } catch (err) {
        if (!cancelled) setCostError(err instanceof Error ? err.message : 'Failed to load cost estimate');
      } finally {
        if (!cancelled) setCostLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Identity used by decorative sub-tabs (labels only), derived from live data when present.
  const estimateIdentity = {
    estimateId: costData?.estimateId ?? '',
    estimateName: costData?.estimateName ?? 'Estimate',
    totalCost: costData?.totalCost ?? 0,
    targetMargin: costData?.targetMargin ?? 0,
    suggestedPrice: costData?.suggestedPrice ?? 0,
    contingencyAmount: costData?.contingencyAmount ?? 0,
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const benchmarks = (await estimationAnalyticsService.findBenchmarks('default')) as any[];
        if (!cancelled && Array.isArray(benchmarks) && benchmarks.length) {
          const projects = benchmarks.map((b: any, idx: number) => {
            const est = Number(b.estimatedCost ?? b.benchmarkCost ?? 0);
            const act = Number(b.actualCost ?? est);
            const variance = act - est;
            const variancePercent = est ? (variance / est) * 100 : 0;
            const absPct = Math.abs(variancePercent);
            return {
              id: b.id ?? String(idx),
              name: b.projectName ?? b.name ?? b.subCategory ?? `Benchmark ${idx + 1}`,
              completedDate: (b.completedDate ?? b.createdAt ?? '').toString().slice(0, 10),
              estimatedCost: est,
              actualCost: act,
              variance,
              variancePercent: Number(variancePercent.toFixed(1)),
              duration: Number(b.duration ?? 0),
              category: b.category ?? 'manufacturing',
              accuracy: (absPct <= 5 ? 'excellent' : absPct <= 10 ? 'good' : 'fair') as
                | 'excellent'
                | 'good'
                | 'fair'
                | 'poor',
            };
          });
          setHistoricalProjects(projects);
          const variances = projects.map((p) => p.variancePercent);
          const accuracies = projects.map((p) => 100 - Math.abs(p.variancePercent));
          setBenchmarkMetrics({
            averageAccuracy: Number((accuracies.reduce((a, b) => a + b, 0) / accuracies.length).toFixed(1)),
            totalProjects: projects.length,
            onBudgetProjects: projects.filter((p) => Math.abs(p.variancePercent) <= 2).length,
            overBudgetProjects: projects.filter((p) => p.variancePercent > 2).length,
            underBudgetProjects: projects.filter((p) => p.variancePercent < -2).length,
            avgVariancePercent: Number(
              (variances.reduce((a, b) => a + Math.abs(b), 0) / variances.length).toFixed(1),
            ),
            bestAccuracy: Number(Math.max(...accuracies).toFixed(1)),
            worstAccuracy: Number(Math.min(...accuracies).toFixed(1)),
          });
        }
      } catch (err) {
        if (!cancelled) setAnalyticsError(err instanceof Error ? err.message : 'Failed to load analytics');
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ==================== Version Comparison tab ====================
  const [versions, setVersions] = useState<EstimateVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState<boolean>(false);
  const [versionsError, setVersionsError] = useState<string | null>(null);

  useEffect(() => {
    if (!estimateId) return;
    let cancelled = false;
    setVersionsLoading(true);
    setVersionsError(null);
    estimationAdvancedService
      .getVersions(estimateId)
      .then((rows) => {
        if (cancelled) return;
        const mapped = (Array.isArray(rows) ? rows : []).map(toEstimateVersion);
        setVersions(mapped);
        if (mapped.length >= 1) setSelectedVersion1(mapped[0].id);
        if (mapped.length >= 2) setSelectedVersion2(mapped[mapped.length - 1].id);
      })
      .catch((err) => {
        if (!cancelled) setVersionsError(err instanceof Error ? err.message : 'Failed to load versions');
      })
      .finally(() => {
        if (!cancelled) setVersionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [estimateId]);

  // ==================== Risk Analysis tab ====================
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [risksLoading, setRisksLoading] = useState<boolean>(false);
  const [risksError, setRisksError] = useState<string | null>(null);

  const loadRisks = useCallback(async () => {
    if (!estimateId) return;
    setRisksLoading(true);
    setRisksError(null);
    try {
      const analysis = await estimationAnalyticsService.findRiskAnalysisByEstimate(COMPANY_ID, estimateId);
      const probMap: Record<string, number> = { Low: 25, Medium: 55, High: 85 };
      const items: RiskItem[] = (analysis?.risks ?? []).map((r) => {
        const probability = probMap[r.probability] ?? 50;
        const impact = probMap[r.impact] ?? 50;
        const level: RiskItem['level'] =
          r.riskScore >= 8 ? 'critical' : r.riskScore >= 6 ? 'high' : r.riskScore >= 3 ? 'medium' : 'low';
        const statusMap: Record<string, RiskItem['status']> = {
          Identified: 'open',
          Mitigated: 'mitigated',
          Accepted: 'accepted',
          Closed: 'closed',
        };
        const catMap: Record<string, RiskItem['category']> = {
          Technical: 'technical',
          Financial: 'cost',
          Schedule: 'schedule',
          Resource: 'resource',
          External: 'market',
          Other: 'technical',
        };
        return {
          id: r.riskId,
          title: r.description,
          description: r.mitigationStrategy || r.description,
          category: catMap[r.category] ?? 'technical',
          level,
          status: statusMap[r.status] ?? 'open',
          probability,
          impact,
          riskScore: r.riskScore,
          costImpact: r.mitigationCost,
          mitigationPlan: r.mitigationStrategy,
          owner: r.owner,
          identifiedDate: (analysis?.createdAt ?? '').slice(0, 10),
          lastUpdated: (analysis?.createdAt ?? '').slice(0, 10),
        };
      });
      setRisks(items);
    } catch (err) {
      setRisksError(err instanceof Error ? err.message : 'Failed to load risks');
    } finally {
      setRisksLoading(false);
    }
  }, [estimateId]);

  useEffect(() => {
    loadRisks();
  }, [loadRisks]);

  const handleAddRisk = useCallback(async () => {
    if (!estimateId || !primaryEstimate) return;
    const description = typeof window !== 'undefined' ? window.prompt('Risk description?') : null;
    if (!description) return;
    try {
      await estimationAnalyticsService.createRiskAnalysis(COMPANY_ID, {
        estimateId,
        estimateNumber: primaryEstimate.estimateNumber,
        projectName: primaryEstimate.title,
        risks: [
          {
            riskId: `r-${Date.now()}`,
            category: 'Financial',
            description,
            probability: 'Medium',
            impact: 'Medium',
            riskScore: 4,
            mitigationStrategy: '',
            mitigationCost: 0,
            residualRisk: 'Low',
            owner: '',
            status: 'Identified',
          },
        ],
      });
      await loadRisks();
    } catch {
      /* fallback handled in service */
    }
  }, [estimateId, primaryEstimate, loadRisks]);

  // ==================== Workflow & Approvals tab ====================
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState<boolean>(false);
  const [approvalsError, setApprovalsError] = useState<string | null>(null);

  const loadApprovals = useCallback(async () => {
    setApprovalsLoading(true);
    setApprovalsError(null);
    try {
      const pending = (await costEstimateService.findAll(COMPANY_ID, { status: 'Pending Approval' })) as CostEstimate[];
      setApprovalRequests((Array.isArray(pending) ? pending : []).map(toApprovalRequest));
    } catch (err) {
      setApprovalsError(err instanceof Error ? err.message : 'Failed to load approvals');
    } finally {
      setApprovalsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  const handleApprove = useCallback(
    async (requestId: string, comments?: string) => {
      try {
        await costEstimateService.approve(COMPANY_ID, requestId, 'director', comments);
        await loadApprovals();
      } catch {
        /* fallback handled in service */
      }
    },
    [loadApprovals],
  );

  const handleReject = useCallback(
    async (requestId: string, reason: string) => {
      try {
        await costEstimateService.reject(COMPANY_ID, requestId, 'director', reason);
        await loadApprovals();
      } catch {
        /* fallback handled in service */
      }
    },
    [loadApprovals],
  );

  // ==================== BOM Import tab ====================
  const [bomSessions, setBomSessions] = useState<BOMImportSession[]>([]);
  const [bomLoading, setBomLoading] = useState<boolean>(false);
  const [bomError, setBomError] = useState<string | null>(null);

  const loadBom = useCallback(async () => {
    setBomLoading(true);
    setBomError(null);
    try {
      const rows = await estimationAdvancedService.listBomSessions(estimateId || undefined);
      setBomSessions((Array.isArray(rows) ? rows : []).map(toBOMImportSession));
    } catch (err) {
      setBomError(err instanceof Error ? err.message : 'Failed to load BOM sessions');
    } finally {
      setBomLoading(false);
    }
  }, [estimateId]);

  useEffect(() => {
    loadBom();
  }, [loadBom]);

  const handleUploadBom = useCallback(
    async (file: File, _source: ImportSource) => {
      try {
        const csv = await file.text();
        await estimationAdvancedService.createBomSession({
          fileName: file.name,
          estimateId: estimateId || undefined,
          csv,
        });
        await loadBom();
      } catch (err) {
        setBomError(err instanceof Error ? err.message : 'Failed to import BOM');
      }
    },
    [estimateId, loadBom],
  );

  // ==================== What-If Simulation tab ====================
  const [whatIfVariables, setWhatIfVariables] = useState<SimulationVariable[]>([]);
  const [whatIfScenarios, setWhatIfScenarios] = useState<SimulationScenario[]>([]);
  const [whatIfLoading, setWhatIfLoading] = useState<boolean>(false);
  const [whatIfError, setWhatIfError] = useState<string | null>(null);

  // Derive simulation variables from the primary estimate's cost lines.
  useEffect(() => {
    if (!primaryEstimate) {
      setWhatIfVariables([]);
      return;
    }
    const e = primaryEstimate;
    const mk = (id: string, name: string, base: number): SimulationVariable => ({
      id,
      name,
      category: 'Direct Costs',
      baseValue: base,
      currentValue: base,
      min: Math.round(base * 0.7),
      max: Math.round(base * 1.3),
      unit: '$',
      impact: 'high',
    });
    setWhatIfVariables(
      [
        mk('materialCost', 'Material Cost', Number(e.materialCost) || 0),
        mk('laborCost', 'Labor Cost', Number(e.laborCost) || 0),
        mk('equipmentCost', 'Equipment Cost', Number(e.equipmentCost) || 0),
        mk('overheadCost', 'Overhead Cost', Number(e.overheadCost) || 0),
        mk('subcontractorCost', 'Subcontractor Cost', Number(e.subcontractorCost) || 0),
      ].filter((v) => v.baseValue > 0),
    );
  }, [primaryEstimate]);

  const loadWhatIf = useCallback(async () => {
    if (!estimateId) return;
    setWhatIfLoading(true);
    setWhatIfError(null);
    try {
      const rows = await estimationAdvancedService.listWhatIf(estimateId);
      setWhatIfScenarios((Array.isArray(rows) ? rows : []).map(toSimulationScenario));
    } catch (err) {
      setWhatIfError(err instanceof Error ? err.message : 'Failed to load scenarios');
    } finally {
      setWhatIfLoading(false);
    }
  }, [estimateId]);

  useEffect(() => {
    loadWhatIf();
  }, [loadWhatIf]);

  const handleRunSimulation = useCallback(
    async (vars: SimulationVariable[]) => {
      if (!estimateId) return;
      const changed = vars.filter((v) => v.currentValue !== v.baseValue);
      if (!changed.length) return;
      try {
        await estimationAdvancedService.createWhatIf({
          name: `Scenario ${new Date().toLocaleString()}`,
          estimateId,
          baseValue: primaryEstimate ? Number(primaryEstimate.totalCost) || 0 : undefined,
          variables: vars.map((v) => ({
            key: v.id,
            label: v.name,
            baseValue: v.baseValue,
            adjustPct: v.baseValue ? Number((((v.currentValue - v.baseValue) / v.baseValue) * 100).toFixed(2)) : 0,
          })),
        });
        await loadWhatIf();
      } catch (err) {
        setWhatIfError(err instanceof Error ? err.message : 'Failed to run simulation');
      }
    },
    [estimateId, primaryEstimate, loadWhatIf],
  );

  const features = [
    { id: 'cost-breakdown', name: 'Cost Breakdown', icon: Calculator, color: 'text-blue-600', bg: 'bg-blue-50', description: 'Detailed cost analysis by category' },
    { id: 'version-comparison', name: 'Version Control', icon: GitBranch, color: 'text-purple-600', bg: 'bg-purple-50', description: 'Compare estimate versions' },
    { id: 'risk-analysis', name: 'Risk Analysis', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', description: 'Project risk assessment' },
    { id: 'workflow-approvals', name: 'Workflow & Approvals', icon: Shield, color: 'text-green-600', bg: 'bg-green-50', description: 'Multi-level approval workflows' },
    { id: 'bom-import', name: 'BOM Import', icon: Upload, color: 'text-indigo-600', bg: 'bg-indigo-50', description: 'Import Bill of Materials' },
    { id: 'benchmarking', name: 'Historical Benchmarking', icon: BarChart3, color: 'text-cyan-600', bg: 'bg-cyan-50', description: 'Compare with historical data' },
    { id: 'what-if', name: 'What-If Simulation', icon: Lightbulb, color: 'text-pink-600', bg: 'bg-pink-50', description: 'Scenario modeling' },
  ];

  const activeFeature = features.find((f) => f.id === activeTab);

  return (
    <div className="w-full h-full px-4 py-2">
      {analyticsError && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {analyticsError}
        </div>
      )}
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center space-x-3 mb-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Estimation Advanced Features</h1>
        </div>
        <p className="text-gray-600">
          Enterprise-grade estimation capabilities including cost breakdown, version comparison, risk analysis, approvals, BOM import, and simulations
        </p>
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
                className={`p-4 transition-all ${isActive ? `${feature.bg} border-b-4 border-current ${feature.color}` : 'hover:bg-gray-50 text-gray-600'
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
        {activeTab === 'cost-breakdown' && (
          costLoading ? (
            <div className="py-12 text-center text-sm text-gray-500">Loading cost breakdown…</div>
          ) : costData ? (
            <CostBreakdown data={costData} editable={true} />
          ) : (
            <EmptyState
              icon={Calculator}
              title="No cost estimates yet"
              description={costError ?? 'Create a cost estimate to see the detailed cost breakdown here.'}
            />
          )
        )}

        {activeTab === 'version-comparison' && (
          !estimateId ? (
            <EmptyState icon={GitBranch} title="No estimate selected" description="Create a cost estimate to compare its versions." />
          ) : versionsLoading ? (
            <div className="py-12 text-center text-sm text-gray-500">Loading versions…</div>
          ) : versions.length ? (
            <VersionComparison
              estimateId={estimateIdentity.estimateId}
              estimateName={estimateIdentity.estimateName}
              versions={versions}
              selectedVersion1={selectedVersion1}
              selectedVersion2={selectedVersion2}
              onSelectVersion1={setSelectedVersion1}
              onSelectVersion2={setSelectedVersion2}
            />
          ) : (
            <EmptyState icon={GitBranch} title="No versions yet" description={versionsError ?? 'This estimate has no version history yet.'} />
          )
        )}

        {activeTab === 'risk-analysis' && (
          !estimateId ? (
            <EmptyState icon={AlertTriangle} title="No estimate selected" description="Create a cost estimate to run a risk analysis." />
          ) : risksLoading ? (
            <div className="py-12 text-center text-sm text-gray-500">Loading risks…</div>
          ) : (
            <RiskAnalysis
              estimateId={estimateIdentity.estimateId}
              risks={risks}
              totalContingency={estimateIdentity.contingencyAmount}
              editable={true}
              onAddRisk={handleAddRisk}
            />
          )
        )}

        {activeTab === 'workflow-approvals' && (
          approvalsLoading ? (
            <div className="py-12 text-center text-sm text-gray-500">Loading pending approvals…</div>
          ) : approvalRequests.length ? (
            <WorkflowApprovals
              requests={approvalRequests}
              thresholds={APPROVAL_THRESHOLDS}
              currentUserRole="director"
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ) : (
            <EmptyState icon={Shield} title="No pending approvals" description={approvalsError ?? 'There are no estimates currently awaiting approval.'} />
          )
        )}

        {activeTab === 'bom-import' && (
          bomLoading ? (
            <div className="py-12 text-center text-sm text-gray-500">Loading BOM sessions…</div>
          ) : (
            <>
              {bomError && (
                <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">{bomError}</div>
              )}
              <BOMImport sessions={bomSessions} onUploadFile={handleUploadBom} />
            </>
          )
        )}

        {activeTab === 'benchmarking' && (
          <HistoricalBenchmarking
            currentEstimate={{ id: estimateIdentity.estimateId, name: estimateIdentity.estimateName, estimatedCost: estimateIdentity.totalCost, category: 'manufacturing' }}
            similarProjects={historicalProjects}
            metrics={benchmarkMetrics}
          />
        )}

        {activeTab === 'what-if' && (
          !estimateId ? (
            <EmptyState icon={Lightbulb} title="No estimate selected" description="Create a cost estimate to model what-if scenarios." />
          ) : whatIfLoading ? (
            <div className="py-12 text-center text-sm text-gray-500">Loading scenarios…</div>
          ) : (
            <>
              {whatIfError && (
                <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">{whatIfError}</div>
              )}
              <WhatIfSimulation
                key={whatIfVariables.length}
                baseEstimate={{ id: estimateIdentity.estimateId, name: estimateIdentity.estimateName, totalCost: estimateIdentity.totalCost, margin: estimateIdentity.targetMargin, suggestedPrice: estimateIdentity.suggestedPrice }}
                variables={whatIfVariables}
                scenarios={whatIfScenarios}
                onRunSimulation={handleRunSimulation}
              />
            </>
          )
        )}
      </div>
    </div>
  );
}
