'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  Package,
  Barcode,
  Clipboard,
  RefreshCw,
  Warehouse,
  Sparkles,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import {
  DemandPlanning,
  ABCAnalysis,
  WarehouseTasking,
  BarcodeScanningWorkflows,
  CycleCountManagement,
  AutomatedReplenishment,
  MultiWarehouseOptimization,
} from '@/components/inventory';
import { inventoryService, StockBalance } from '@/services/InventoryService';

type TabId = 'demand' | 'abc' | 'tasking' | 'barcode' | 'cycle-count' | 'replenishment' | 'multi-warehouse';

export default function InventoryAdvancedFeaturesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('demand');

  // Live inventory overview KPIs
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [balLoading, setBalLoading] = useState(true);
  const [balError, setBalError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setBalLoading(true);
    setBalError(null);
    inventoryService
      .getStockBalances()
      .then((data) => {
        if (active) setBalances(Array.isArray(data) ? data : []);
      })
      .catch((err: unknown) => {
        if (active) setBalError(err instanceof Error ? err.message : 'Failed to load inventory overview');
      })
      .finally(() => {
        if (active) setBalLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const invStats = {
    skus: balances.length,
    totalValue: balances.reduce((sum, b) => sum + (b.stockValue ?? 0), 0),
    belowReorder: balances.filter((b) => b.belowReorderLevel).length,
    availableUnits: balances.reduce((sum, b) => sum + (b.availableQuantity ?? 0), 0),
  };

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
    { id: 'demand', label: 'Demand Planning', icon: TrendingUp, component: DemandPlanning },
    { id: 'abc', label: 'ABC Analysis', icon: BarChart3, component: ABCAnalysis },
    { id: 'tasking', label: 'Warehouse Tasking', icon: Package, component: WarehouseTasking },
    { id: 'barcode', label: 'Barcode Scanning', icon: Barcode, component: BarcodeScanningWorkflows },
    { id: 'cycle-count', label: 'Cycle Count', icon: Clipboard, component: CycleCountManagement },
    { id: 'replenishment', label: 'Auto Replenishment', icon: RefreshCw, component: AutomatedReplenishment },
    { id: 'multi-warehouse', label: 'Multi-Warehouse', icon: Warehouse, component: MultiWarehouseOptimization },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || DemandPlanning;

  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-cyan-50 to-blue-50">
      <div className="h-full flex flex-col px-2 py-2">
        <div className="mb-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventory Advanced Features</h1>
              <p className="text-sm text-gray-600">WMS-grade inventory management capabilities</p>
            </div>
          </div>
        </div>

        {/* Live inventory overview KPIs */}
        <div className="mb-2">
          {balLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg border border-gray-200 animate-pulse" />
              ))}
            </div>
          ) : balError ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-sm text-amber-700">
              Unable to load live inventory overview. {balError}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                  <Package className="w-4 h-4" /> Stocked SKUs
                </div>
                <div className="mt-1 text-xl font-bold text-gray-900">{invStats.skus.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                  <DollarSign className="w-4 h-4" /> Stock Value
                </div>
                <div className="mt-1 text-xl font-bold text-gray-900">₹{invStats.totalValue.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4" /> Below Reorder
                </div>
                <div className="mt-1 text-xl font-bold text-gray-900">{invStats.belowReorder.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                  <TrendingUp className="w-4 h-4" /> Available Units
                </div>
                <div className="mt-1 text-xl font-bold text-gray-900">{invStats.availableUnits.toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-2">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabId);
                    window.location.hash = tab.id;
                  }}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? 'text-cyan-600 border-cyan-600 bg-cyan-50'
                      : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
