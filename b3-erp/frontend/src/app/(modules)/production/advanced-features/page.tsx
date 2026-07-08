'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Cpu, ClipboardCheck, BarChart3, Wrench, GitBranch, Monitor, ClipboardList, Gauge, Factory, Loader2, AlertCircle } from 'lucide-react';
import {
  FiniteScheduling,
  MESIntegration,
  QualityChecks,
  OEEAnalytics,
  MaintenanceCoordination,
  Traceability,
  ShopFloorControl,
} from '@/components/production';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import { productionSettingsService } from '@/services/production/production-settings.service';

type TabId = 'scheduling' | 'mes' | 'quality' | 'oee' | 'maintenance' | 'traceability' | 'shopfloor';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
  component: React.ComponentType;
}

const tabs: Tab[] = [
  { id: 'scheduling', label: 'Finite Scheduling', icon: Calendar, component: FiniteScheduling },
  { id: 'mes', label: 'MES Integration', icon: Cpu, component: MESIntegration },
  { id: 'quality', label: 'Quality Checks', icon: ClipboardCheck, component: QualityChecks },
  { id: 'oee', label: 'OEE Analytics', icon: BarChart3, component: OEEAnalytics },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, component: MaintenanceCoordination },
  { id: 'traceability', label: 'Traceability', icon: GitBranch, component: Traceability },
  { id: 'shopfloor', label: 'Shop Floor Control', icon: Monitor, component: ShopFloorControl },
];

interface ProductionKpis {
  workOrders: number
  inProgress: number
  avgOee: number | null
  productionLines: number
}

export default function ProductionAdvancedFeaturesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('scheduling');
  const [kpis, setKpis] = useState<ProductionKpis | null>(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState<string | null>(null);

  // Live production KPIs from the production module
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setKpiLoading(true);
      setKpiError(null);
      try {
        const [workOrders, oeeRecords, lines] = await Promise.all([
          ProductionOrphanService.getWorkOrders().catch(() => [] as any[]),
          ProductionOrphanService.getOeeRecords().catch(() => [] as any[]),
          productionSettingsService.findAllProductionLines().catch(() => [] as any[]),
        ]);
        if (cancelled) return;
        const woArr = Array.isArray(workOrders) ? workOrders : [];
        const inProgress = woArr.filter((w: any) => {
          const s = String(w?.status ?? '').toLowerCase();
          return s === 'in_progress' || s === 'in-progress' || s === 'released' || s === 'active';
        }).length;
        const oeeArr = Array.isArray(oeeRecords) ? oeeRecords : [];
        const oeeVals = oeeArr
          .map((r: any) => Number(r?.oee ?? r?.oeePercentage ?? r?.overallOee))
          .filter((n: number) => Number.isFinite(n));
        const avgOee = oeeVals.length
          ? Math.round((oeeVals.reduce((a: number, b: number) => a + b, 0) / oeeVals.length) * 10) / 10
          : null;
        setKpis({
          workOrders: woArr.length,
          inProgress,
          avgOee,
          productionLines: Array.isArray(lines) ? lines.length : 0,
        });
      } catch (err) {
        if (!cancelled) setKpiError(err instanceof Error ? err.message : 'Failed to load production metrics');
      } finally {
        if (!cancelled) setKpiLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as TabId;
      if (hash && tabs.find(t => t.id === hash)) {
        setActiveTab(hash);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
  };

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || FiniteScheduling;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="space-y-3">
        <div className="bg-white shadow-lg p-3">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Production Advanced Features</h1>
          <p className="text-gray-600">
            MES-grade capabilities: scheduling, real-time monitoring, quality management, and OEE analytics
          </p>
        </div>

        {/* Live Production KPIs */}
        <div className="px-3">
          {kpiLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white shadow-sm p-3">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading production metrics…
            </div>
          ) : kpiError ? (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 p-3">
              <AlertCircle className="h-4 w-4" /> {kpiError}
            </div>
          ) : kpis ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white shadow-sm p-3 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Work Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{kpis.workOrders}</p>
                  </div>
                  <ClipboardList className="h-7 w-7 text-blue-500" />
                </div>
              </div>
              <div className="bg-white shadow-sm p-3 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">In Progress</p>
                    <p className="text-2xl font-bold text-green-600">{kpis.inProgress}</p>
                  </div>
                  <Wrench className="h-7 w-7 text-green-500" />
                </div>
              </div>
              <div className="bg-white shadow-sm p-3 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Avg OEE</p>
                    <p className="text-2xl font-bold text-purple-600">{kpis.avgOee != null ? `${kpis.avgOee}%` : '—'}</p>
                  </div>
                  <Gauge className="h-7 w-7 text-purple-500" />
                </div>
              </div>
              <div className="bg-white shadow-sm p-3 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Production Lines</p>
                    <p className="text-2xl font-bold text-orange-600">{kpis.productionLines}</p>
                  </div>
                  <Factory className="h-7 w-7 text-orange-500" />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="bg-white shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`group inline-flex items-center px-3 py-2 border-b-2 font-medium text-sm transition-all ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon
                      className={`mr-2 h-5 w-5 ${
                        activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            <ActiveComponent />
          </div>
        </div>

        <div className="bg-white shadow p-3 text-center text-sm text-gray-600">
          <p>
            These advanced features provide MES-grade manufacturing capabilities comparable to Siemens Opcenter, Rockwell FactoryTalk, and SAP ME.
          </p>
        </div>
      </div>
    </div>
  );
}
