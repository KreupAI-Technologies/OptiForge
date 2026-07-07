'use client';

import { useState, useEffect } from 'react';
import { estimationAnalyticsService } from '@/services/estimation-analytics.service';
import { costEstimateService, CostEstimate } from '@/services/estimation-cost-estimate.service';
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
import { BOMImport, BOMImportSession } from '@/components/estimation/BOMImport';
import { HistoricalBenchmarking } from '@/components/estimation/HistoricalBenchmarking';
import { WhatIfSimulation } from '@/components/estimation/WhatIfSimulation';

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

// Mock Data - Versions
const mockVersions: EstimateVersion[] = [
  { id: '1', version: 'v1.0', name: 'Initial Estimate', status: 'approved', totalCost: 420000, suggestedPrice: 600000, margin: 180000, marginPercent: 30, createdBy: 'Sarah Johnson', createdAt: '2025-01-10T10:00:00Z', approvedBy: 'Mike Chen', approvedAt: '2025-01-12T14:00:00Z', notes: 'Initial rough estimate' },
  { id: '2', version: 'v1.1', name: 'Revised After Site Visit', status: 'approved', totalCost: 450000, suggestedPrice: 630000, margin: 180000, marginPercent: 28.6, createdBy: 'Sarah Johnson', createdAt: '2025-01-15T09:00:00Z', changes: ['Added specialized equipment costs', 'Increased labor hours'], approvedBy: 'Mike Chen', approvedAt: '2025-01-16T16:00:00Z' },
  { id: '3', version: 'v2.0', name: 'Final Proposal', status: 'submitted', totalCost: 450000, suggestedPrice: 656250, margin: 206250, marginPercent: 35, createdBy: 'Sarah Johnson', createdAt: '2025-01-20T15:00:00Z', changes: ['Increased margin to 35%', 'Added 10% contingency'], notes: 'Final version submitted to customer' },
];

// Mock Data - Risks
const mockRisks: RiskItem[] = [
  { id: '1', title: 'Material Price Volatility', description: 'Steel prices may increase by 10-15%', category: 'cost', level: 'high', status: 'open', probability: 70, impact: 80, riskScore: 56, costImpact: 18750, mitigationPlan: 'Lock in prices with supplier contract', owner: 'Procurement Team', identifiedDate: '2025-01-15', lastUpdated: '2025-01-20' },
  { id: '2', title: 'Equipment Delivery Delay', description: 'Specialized tooling has 8-week lead time', category: 'schedule', level: 'medium', status: 'mitigated', probability: 50, impact: 60, riskScore: 30, scheduleImpact: 14, mitigationPlan: 'Order equipment immediately', owner: 'Project Manager', identifiedDate: '2025-01-12', lastUpdated: '2025-01-18' },
];

// Mock Data - Approvals
const mockApprovalThresholds: ApprovalThreshold[] = [
  { id: '1', name: 'Large Estimate Approval', description: 'Requires director approval for estimates over $500K', condition: { type: 'estimate_value', operator: 'greater_than', value: 500000 }, requiredApprovers: [{ role: 'director', count: 1 }], priority: 'high' },
];

const mockApprovalRequests: ApprovalRequest[] = [
  { id: '1', estimateId: 'EST-2025-001', estimateName: 'Manufacturing Line Upgrade', estimateValue: 656250, marginPercent: 35, requestedBy: 'Sarah Johnson', requestedAt: '2025-01-20T15:00:00Z', status: 'pending', approvers: [{ id: 'a1', name: 'Mike Chen', email: 'mike@company.com', role: 'director', order: 1, status: 'pending' }], threshold: mockApprovalThresholds[0], currentLevel: 1, totalLevels: 1, notes: 'Final estimate ready for approval' },
];

// Mock Data - BOM Import
const mockBOMSessions: BOMImportSession[] = [
  { id: '1', source: 'excel', fileName: 'manufacturing_bom_v2.xlsx', fileSize: 245000, status: 'completed', uploadedAt: '2025-01-19T14:00:00Z', processedAt: '2025-01-19T14:05:00Z', totalItems: 150, validItems: 145, itemsWithWarnings: 3, itemsWithErrors: 2, items: [] },
];

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

// Mock Data - What-If Simulation
const mockSimulationVariables = [
  { id: 'v1', name: 'Material Cost', category: 'Direct Costs', baseValue: 125000, currentValue: 125000, min: 100000, max: 150000, unit: '$', impact: 'high' as const },
  { id: 'v2', name: 'Labor Hours', category: 'Direct Costs', baseValue: 400, currentValue: 400, min: 300, max: 500, unit: 'hours', impact: 'high' as const },
  { id: 'v3', name: 'Equipment Cost', category: 'Direct Costs', baseValue: 150000, currentValue: 150000, min: 120000, max: 180000, unit: '$', impact: 'high' as const },
];

const mockSimulationScenarios = [
  { id: 's1', name: 'Best Case', description: 'All variables at optimal levels', variables: [], totalCost: 400000, margin: 35, suggestedPrice: 590000, variance: -50000, variancePercent: -11.1 },
  { id: 's2', name: 'Worst Case', description: 'Maximum cost overruns', variables: [], totalCost: 520000, margin: 35, suggestedPrice: 767000, variance: 70000, variancePercent: 15.5 },
];

export default function EstimationAdvancedFeaturesPage() {
  const [activeTab, setActiveTab] = useState<string>('cost-breakdown');
  const [selectedVersion1, setSelectedVersion1] = useState<string>('1');
  const [selectedVersion2, setSelectedVersion2] = useState<string>('3');

  // Primary view: live cost breakdown for the most recent estimate.
  const [costData, setCostData] = useState<CostBreakdownData | null>(null);
  const [costLoading, setCostLoading] = useState<boolean>(true);
  const [costError, setCostError] = useState<string | null>(null);

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
          <VersionComparison
            estimateId={estimateIdentity.estimateId}
            estimateName={estimateIdentity.estimateName}
            versions={mockVersions}
            selectedVersion1={selectedVersion1}
            selectedVersion2={selectedVersion2}
            onSelectVersion1={setSelectedVersion1}
            onSelectVersion2={setSelectedVersion2}
          />
        )}

        {activeTab === 'risk-analysis' && (
          <RiskAnalysis
            estimateId={estimateIdentity.estimateId}
            risks={mockRisks}
            totalContingency={estimateIdentity.contingencyAmount}
            editable={true}
          />
        )}

        {activeTab === 'workflow-approvals' && (
          <WorkflowApprovals
            requests={mockApprovalRequests}
            thresholds={mockApprovalThresholds}
            currentUserRole="director"
          />
        )}

        {activeTab === 'bom-import' && (
          <BOMImport sessions={mockBOMSessions} />
        )}

        {activeTab === 'benchmarking' && (
          <HistoricalBenchmarking
            currentEstimate={{ id: estimateIdentity.estimateId, name: estimateIdentity.estimateName, estimatedCost: estimateIdentity.totalCost, category: 'manufacturing' }}
            similarProjects={historicalProjects}
            metrics={benchmarkMetrics}
          />
        )}

        {activeTab === 'what-if' && (
          <WhatIfSimulation
            baseEstimate={{ id: estimateIdentity.estimateId, name: estimateIdentity.estimateName, totalCost: estimateIdentity.totalCost, margin: estimateIdentity.targetMargin, suggestedPrice: estimateIdentity.suggestedPrice }}
            variables={mockSimulationVariables}
            scenarios={mockSimulationScenarios}
          />
        )}
      </div>
    </div>
  );
}
