'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Truck,
  AlertTriangle,
  Calendar,
  DollarSign,
  Eye,
  Sparkles,
} from 'lucide-react';
import {
  LiveTelematicsTracking,
  RouteOptimization,
  CarrierManagement,
  ExceptionHandling,
  DockScheduling,
  FreightCostAnalytics,
  CustomerVisibilityPortal,
} from '@/components/logistics';
import LogisticsManagementService, {
  type LogisticsDashboard,
} from '@/services/logistics-management.service';

type TabId = 'telematics' | 'routing' | 'carriers' | 'exceptions' | 'dock' | 'cost' | 'customer';

export default function LogisticsAdvancedFeaturesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('telematics');
  const [summary, setSummary] = useState<LogisticsDashboard['summary'] | null>(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setKpiLoading(true);
        setKpiError(null);
        const res = await LogisticsManagementService.getDashboard();
        if (!cancelled) setSummary(res?.summary ?? null);
      } catch (err) {
        if (!cancelled) {
          setKpiError(err instanceof Error ? err.message : 'Failed to load overview');
          setSummary(null);
        }
      } finally {
        if (!cancelled) setKpiLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis: { label: string; value: number }[] = summary
    ? [
        { label: 'In Transit', value: summary.inTransitShipments },
        { label: 'Active Vehicles', value: summary.activeVehicles },
        { label: 'Active Drivers', value: summary.activeDrivers },
        { label: 'Active Carriers', value: summary.activeCarriers },
        { label: 'Open Exceptions', value: summary.openExceptions },
        { label: 'Delivered (MTD)', value: summary.deliveredThisMonth },
      ]
    : [];

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as TabId;
      if (hash) setActiveTab(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const tabs = [
    { id: 'telematics', label: 'Live Telematics', icon: MapPin, component: LiveTelematicsTracking },
    { id: 'routing', label: 'Route Optimization', icon: Navigation, component: RouteOptimization },
    { id: 'carriers', label: 'Carrier Management', icon: Truck, component: CarrierManagement },
    { id: 'exceptions', label: 'Exception Handling', icon: AlertTriangle, component: ExceptionHandling },
    { id: 'dock', label: 'Dock Scheduling', icon: Calendar, component: DockScheduling },
    { id: 'cost', label: 'Freight Cost Analytics', icon: DollarSign, component: FreightCostAnalytics },
    { id: 'customer', label: 'Customer Portal', icon: Eye, component: CustomerVisibilityPortal },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || LiveTelematicsTracking;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="px-3 py-2 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Logistics Advanced Features</h1>
            <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest leading-none">
              TMS-grade transportation management capabilities
            </p>
          </div>

          {/* Live overview KPIs (API-backed) */}
          <div className="ml-auto flex items-center gap-2">
            {kpiLoading ? (
              <div className="text-[11px] font-semibold text-gray-400">Loading overview…</div>
            ) : kpiError ? (
              <div className="text-[11px] font-semibold text-red-500" title={kpiError}>
                Overview unavailable
              </div>
            ) : kpis.length === 0 ? (
              <div className="text-[11px] font-semibold text-gray-400">No overview data</div>
            ) : (
              kpis.map((kpi) => (
                <div
                  key={kpi.label}
                  className="flex flex-col items-center px-3 py-1 rounded-lg bg-gray-50 border border-gray-100 min-w-[72px]"
                >
                  <span className="text-lg font-bold text-gray-900 leading-none">{kpi.value}</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 mt-1 whitespace-nowrap">
                    {kpi.label}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex overflow-x-auto px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabId);
                  window.location.hash = tab.id;
                }}
                className={`flex items-center gap-2 px-4 py-3 font-bold transition-colors whitespace-nowrap border-b-2 text-[11px] uppercase tracking-wider ${activeTab === tab.id
                    ? 'text-orange-600 border-orange-600 bg-orange-50'
                    : 'text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <ActiveComponent />
      </div>
    </div>
  );
}
