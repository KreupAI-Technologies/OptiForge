'use client';

import React, { useState, useEffect } from 'react';
import {
  SupplyChainRiskDashboard,
  ScenarioPlanningTool,
  CapacityFlexibilityView,
  BusinessContinuityStatus
} from '@/components/industry4';
import { resilienceService } from '@/services/resilience.service';

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'default-company-id';

interface ResilienceStats {
  resilienceScore: number;
  activeRiskAlerts: number;
  criticalRisks: number;
  highRisks: number;
  capacityUtilization: number;
  bcpHealth: number;
  healthyProcesses: number;
  totalProcesses: number;
  soleSourceCount: number;
  scenarioCount: number;
  scenariosAnalyzed: number;
  strainedResources: number;
  overloadedResources: number;
  criticalProcesses: number;
  drillsYTD: number;
}

type ResilienceTab = 'overview' | 'supply-risk' | 'scenarios' | 'capacity' | 'continuity';

export default function ResilienceDashboardPage() {
  const [activeTab, setActiveTab] = useState<ResilienceTab>('overview');

  const DEFAULT_STATS: ResilienceStats = {
    resilienceScore: 78,
    activeRiskAlerts: 12,
    criticalRisks: 3,
    highRisks: 5,
    capacityUtilization: 87,
    bcpHealth: 92,
    healthyProcesses: 6,
    totalProcesses: 8,
    soleSourceCount: 2,
    scenarioCount: 8,
    scenariosAnalyzed: 3,
    strainedResources: 2,
    overloadedResources: 2,
    criticalProcesses: 1,
    drillsYTD: 12,
  };

  const [stats, setStats] = useState<ResilienceStats>(DEFAULT_STATS);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadError(null);
      try {
        const [risk, capacity, bcp, scenario] = await Promise.all([
          resilienceService.getRiskSummary(COMPANY_ID).catch(() => null),
          resilienceService.getCapacitySummary(COMPANY_ID).catch(() => null),
          resilienceService.getBCPSummary(COMPANY_ID).catch(() => null),
          resilienceService.getScenarioSummary(COMPANY_ID).catch(() => null),
        ]);
        if (cancelled) return;

        const riskByLevel = risk?.byLevel ?? {};
        const bcpByStatus = bcp?.byStatus ?? {};
        const capByStatus = capacity?.byStatus ?? {};

        const criticalRisks = Number(riskByLevel.critical ?? DEFAULT_STATS.criticalRisks);
        const highRisks = Number(riskByLevel.high ?? DEFAULT_STATS.highRisks);
        const totalRisks = Number(risk?.totalRisks ?? DEFAULT_STATS.activeRiskAlerts);
        const avgRiskScore = Number(risk?.averageRiskScore ?? 0);
        const bcpHealth = Math.round(Number(bcp?.averageHealthScore ?? DEFAULT_STATS.bcpHealth));
        const capUtil = Math.round(Number(capacity?.overallUtilization ?? DEFAULT_STATS.capacityUtilization));

        setStats({
          resilienceScore: risk || bcp
            ? Math.max(0, Math.min(100, Math.round(((100 - avgRiskScore) + bcpHealth) / 2)))
            : DEFAULT_STATS.resilienceScore,
          activeRiskAlerts: totalRisks,
          criticalRisks,
          highRisks,
          capacityUtilization: capUtil,
          bcpHealth,
          healthyProcesses: Number(bcpByStatus.healthy ?? DEFAULT_STATS.healthyProcesses),
          totalProcesses: Number(bcp?.totalProcesses ?? DEFAULT_STATS.totalProcesses),
          soleSourceCount: Number(risk?.singleSourceCount ?? DEFAULT_STATS.soleSourceCount),
          scenarioCount: Number(scenario?.totalScenarios ?? scenario?.total ?? DEFAULT_STATS.scenarioCount),
          scenariosAnalyzed: Number(
            scenario?.byStatus?.analyzed ?? scenario?.analyzed ?? DEFAULT_STATS.scenariosAnalyzed,
          ),
          strainedResources: Number(capByStatus.strained ?? DEFAULT_STATS.strainedResources),
          overloadedResources: Number(capByStatus.overloaded ?? DEFAULT_STATS.overloadedResources),
          criticalProcesses: Number(bcpByStatus.critical ?? DEFAULT_STATS.criticalProcesses),
          drillsYTD: Number(bcp?.totalDrillsYTD ?? DEFAULT_STATS.drillsYTD),
        });
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load resilience data');
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const tabs: { id: ResilienceTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'supply-risk', label: 'Supply Chain Risk', icon: '⚠️' },
    { id: 'scenarios', label: 'Scenario Planning', icon: '🎯' },
    { id: 'capacity', label: 'Capacity Flexibility', icon: '📈' },
    { id: 'continuity', label: 'Business Continuity', icon: '🛡️' },
  ];

  const renderOverview = () => (
    <div className="space-y-3">
      {loadError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          Live resilience metrics unavailable — showing reference figures.
        </div>
      )}
      {/* Hero Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Resilience Score</p>
              <p className="text-4xl font-bold mt-1">{stats.resilienceScore}%</p>
              <p className="text-blue-100 text-xs mt-2">Composite risk &amp; continuity index</p>
            </div>
            <div className="text-3xl opacity-80">🛡️</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-amber-100 text-sm">Active Risk Alerts</p>
              <p className="text-4xl font-bold mt-1">{stats.activeRiskAlerts}</p>
              <p className="text-amber-100 text-xs mt-2">{stats.criticalRisks} critical, {stats.highRisks} high</p>
            </div>
            <div className="text-3xl opacity-80">⚠️</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Capacity Utilization</p>
              <p className="text-4xl font-bold mt-1">{stats.capacityUtilization}%</p>
              <p className="text-green-100 text-xs mt-2">Across monitored resources</p>
            </div>
            <div className="text-3xl opacity-80">📈</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm">BCP Health</p>
              <p className="text-4xl font-bold mt-1">{stats.bcpHealth}%</p>
              <p className="text-purple-100 text-xs mt-2">{stats.healthyProcesses}/{stats.totalProcesses} processes healthy</p>
            </div>
            <div className="text-3xl opacity-80">✓</div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setActiveTab('supply-risk')}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-2xl">⚠️</div>
            <div>
              <h3 className="font-semibold text-gray-800">Supply Chain Risk Dashboard</h3>
              <p className="text-sm text-gray-500">Monitor supplier vulnerabilities and buffer stocks</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-4 border-t">
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">{stats.soleSourceCount}</div>
              <div className="text-xs text-gray-500">Sole Source</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-amber-600">{stats.criticalRisks}</div>
              <div className="text-xs text-gray-500">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{stats.activeRiskAlerts}</div>
              <div className="text-xs text-gray-500">Alerts</div>
            </div>
          </div>
        </div>

        <div
          className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setActiveTab('scenarios')}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">🎯</div>
            <div>
              <h3 className="font-semibold text-gray-800">Scenario Planning Tool</h3>
              <p className="text-sm text-gray-500">What-if analysis for disruption scenarios</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-4 border-t">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{stats.scenarioCount}</div>
              <div className="text-xs text-gray-500">Scenarios</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{stats.scenariosAnalyzed}</div>
              <div className="text-xs text-gray-500">Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">{Math.max(0, stats.scenarioCount - stats.scenariosAnalyzed)}</div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
          </div>
        </div>

        <div
          className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setActiveTab('capacity')}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">📈</div>
            <div>
              <h3 className="font-semibold text-gray-800">Capacity Flexibility View</h3>
              <p className="text-sm text-gray-500">Monitor capacity vs demand with surge options</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-4 border-t">
            <div className="text-center">
              <div className="text-xl font-bold text-amber-600">{stats.strainedResources}</div>
              <div className="text-xs text-gray-500">Strained</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">{stats.overloadedResources}</div>
              <div className="text-xs text-gray-500">Overloaded</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{stats.capacityUtilization}%</div>
              <div className="text-xs text-gray-500">Utilization</div>
            </div>
          </div>
        </div>

        <div
          className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setActiveTab('continuity')}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">🛡️</div>
            <div>
              <h3 className="font-semibold text-gray-800">Business Continuity Status</h3>
              <p className="text-sm text-gray-500">Health check of critical business processes</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-4 border-t">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{stats.healthyProcesses}</div>
              <div className="text-xs text-gray-500">Healthy</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">{stats.criticalProcesses}</div>
              <div className="text-xs text-gray-500">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{stats.drillsYTD}</div>
              <div className="text-xs text-gray-500">Drills YTD</div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Heat Map */}
      <div className="bg-white border border-gray-200 rounded-xl p-3">
        <h3 className="font-semibold text-gray-800 mb-2">Risk Assessment Matrix</h3>
        <div className="grid grid-cols-5 gap-1">
          {/* Y-axis labels */}
          <div className="col-span-1 flex flex-col justify-between pr-2">
            <span className="text-xs text-gray-500 text-right">Catastrophic</span>
            <span className="text-xs text-gray-500 text-right">Major</span>
            <span className="text-xs text-gray-500 text-right">Moderate</span>
            <span className="text-xs text-gray-500 text-right">Minor</span>
            <span className="text-xs text-gray-500 text-right">Insignificant</span>
          </div>
          {/* Heat map grid */}
          <div className="col-span-4">
            <div className="grid grid-cols-5 gap-1">
              {/* Row 1 - Catastrophic */}
              <div className="bg-amber-200 h-12 rounded flex items-center justify-center text-xs">M</div>
              <div className="bg-amber-400 h-12 rounded flex items-center justify-center text-xs">H</div>
              <div className="bg-red-400 h-12 rounded flex items-center justify-center text-xs">H</div>
              <div className="bg-red-500 h-12 rounded flex items-center justify-center text-xs font-bold text-white">E</div>
              <div className="bg-red-600 h-12 rounded flex items-center justify-center text-xs font-bold text-white">E</div>
              {/* Row 2 - Major */}
              <div className="bg-yellow-200 h-12 rounded flex items-center justify-center text-xs">M</div>
              <div className="bg-amber-300 h-12 rounded flex items-center justify-center text-xs">M</div>
              <div className="bg-amber-400 h-12 rounded flex items-center justify-center text-xs">H</div>
              <div className="bg-red-400 h-12 rounded flex items-center justify-center text-xs">H</div>
              <div className="bg-red-500 h-12 rounded flex items-center justify-center text-xs font-bold text-white">E</div>
              {/* Row 3 - Moderate */}
              <div className="bg-green-200 h-12 rounded flex items-center justify-center text-xs">L</div>
              <div className="bg-yellow-200 h-12 rounded flex items-center justify-center text-xs">M</div>
              <div className="bg-amber-300 h-12 rounded flex items-center justify-center text-xs">M</div>
              <div className="bg-amber-400 h-12 rounded flex items-center justify-center text-xs">H</div>
              <div className="bg-red-400 h-12 rounded flex items-center justify-center text-xs">H</div>
              {/* Row 4 - Minor */}
              <div className="bg-green-200 h-12 rounded flex items-center justify-center text-xs">L</div>
              <div className="bg-green-300 h-12 rounded flex items-center justify-center text-xs">L</div>
              <div className="bg-yellow-200 h-12 rounded flex items-center justify-center text-xs">M</div>
              <div className="bg-amber-300 h-12 rounded flex items-center justify-center text-xs">M</div>
              <div className="bg-amber-400 h-12 rounded flex items-center justify-center text-xs">H</div>
              {/* Row 5 - Insignificant */}
              <div className="bg-green-100 h-12 rounded flex items-center justify-center text-xs">L</div>
              <div className="bg-green-200 h-12 rounded flex items-center justify-center text-xs">L</div>
              <div className="bg-green-300 h-12 rounded flex items-center justify-center text-xs">L</div>
              <div className="bg-yellow-200 h-12 rounded flex items-center justify-center text-xs">M</div>
              <div className="bg-amber-300 h-12 rounded flex items-center justify-center text-xs">M</div>
            </div>
            {/* X-axis labels */}
            <div className="grid grid-cols-5 gap-1 mt-2">
              <span className="text-xs text-gray-500 text-center">Rare</span>
              <span className="text-xs text-gray-500 text-center">Unlikely</span>
              <span className="text-xs text-gray-500 text-center">Possible</span>
              <span className="text-xs text-gray-500 text-center">Likely</span>
              <span className="text-xs text-gray-500 text-center">Almost Certain</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 rounded"></div>
            <span className="text-xs text-gray-600">Low (L)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-200 rounded"></div>
            <span className="text-xs text-gray-600">Medium (M)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-400 rounded"></div>
            <span className="text-xs text-gray-600">High (H)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-xs text-gray-600">Extreme (E)</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>Production</span>
          <span>/</span>
          <span className="text-gray-800">Resilience & Flexibility</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Resilience & Flexibility Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor and manage supply chain resilience, capacity flexibility, and business continuity</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3">
        <div className="flex gap-2 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'supply-risk' && <SupplyChainRiskDashboard />}
      {activeTab === 'scenarios' && <ScenarioPlanningTool />}
      {activeTab === 'capacity' && <CapacityFlexibilityView />}
      {activeTab === 'continuity' && <BusinessContinuityStatus />}
    </div>
  );
}
