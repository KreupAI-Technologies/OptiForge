'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Shield,
  Clock,
  Brain,
  Settings,
  Filter,
  Download,
  RefreshCw,
  MapPin,
  Truck,
  Package,
  AlertTriangle,
  TrendingUp,
  Link,
} from 'lucide-react';
import { SupplyChainMap, Shipment, SupplyNode } from '@/components/industry4/SupplyChainMap';
import { VendorRiskHeatmap, Vendor } from '@/components/industry4/VendorRiskHeatmap';
import { LeadTimeTimeline, Order, Milestone } from '@/components/industry4/LeadTimeTimeline';
import { InventoryOptimization, ReorderSuggestion } from '@/components/industry4/InventoryOptimization';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

// ============================================================================
// Types
// ============================================================================

type ViewMode = 'overview' | 'supply-chain' | 'vendor-risk' | 'lead-time' | 'inventory';

// ============================================================================
// Quick Stats Component
// ============================================================================

function QuickStats() {
  const stats = [
    { label: 'Active Shipments', value: '47', trend: '12 in transit', color: 'text-blue-600', icon: Truck },
    { label: 'At-Risk Vendors', value: '4', trend: '2 critical', color: 'text-red-600', icon: AlertTriangle },
    { label: 'On-Time Delivery', value: '94.2%', trend: '+2.1%', color: 'text-green-600', icon: Clock },
    { label: 'Inventory Value', value: '$2.4M', trend: '6.2x turnover', color: 'text-purple-600', icon: Package },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.trend}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============================================================================
// View Selector Component
// ============================================================================

function ViewSelector({
  currentView,
  onViewChange,
}: {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}) {
  const views: { id: ViewMode; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'supply-chain', label: 'Supply Chain Map', icon: MapPin },
    { id: 'vendor-risk', label: 'Vendor Risk', icon: Shield },
    { id: 'lead-time', label: 'Lead Time', icon: Clock },
    { id: 'inventory', label: 'Inventory AI', icon: Brain },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {views.map(view => {
        const Icon = view.icon;
        const isActive = currentView === view.id;
        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors
              ${isActive
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            {view.label}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Main Connected Supply Chain Page
// ============================================================================

export default function SupplyChainPage() {
  const [currentView, setCurrentView] = useState<ViewMode>('overview');

  // Live supply-chain risks (GET /production/resilience/supply-chain-risks)
  const [risks, setRisks] = useState<any[]>([]);
  const [risksLoading, setRisksLoading] = useState(true);
  const [risksError, setRisksError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setRisksLoading(true);
      setRisksError(null);
      try {
        const raw = await ProductionOrphanService.getSupplyChainRisks();
        if (!cancelled) setRisks(Array.isArray(raw) ? raw : []);
      } catch (err) {
        if (!cancelled) {
          setRisksError(err instanceof Error ? err.message : 'Failed to load supply-chain risks');
          setRisks([]);
        }
      } finally {
        if (!cancelled) setRisksLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Event handlers
  const handleShipmentClick = (shipment: Shipment) => {
    console.log('Shipment clicked:', shipment);
  };

  const handleNodeClick = (node: SupplyNode) => {
    console.log('Node clicked:', node);
  };

  const handleVendorClick = (vendor: Vendor) => {
    console.log('Vendor clicked:', vendor);
  };

  const handleVendorAlertClick = (vendor: Vendor, alert: string) => {
    console.log('Vendor alert clicked:', vendor, alert);
  };

  const handleOrderClick = (order: Order) => {
    console.log('Order clicked:', order);
  };

  const handleMilestoneClick = (order: Order, milestone: Milestone) => {
    console.log('Milestone clicked:', order, milestone);
  };

  const handleReorderClick = (suggestion: ReorderSuggestion) => {
    console.log('Reorder clicked:', suggestion);
  };

  const handleApproveReorder = (suggestionId: string) => {
    console.log('Reorder approved:', suggestionId);
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    console.log('Suggestion dismissed:', suggestionId);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'supply-chain':
        return (
          <SupplyChainMap
            onShipmentClick={handleShipmentClick}
            onNodeClick={handleNodeClick}
            refreshInterval={30000}
          />
        );

      case 'vendor-risk':
        return (
          <VendorRiskHeatmap
            onVendorClick={handleVendorClick}
            onAlertClick={handleVendorAlertClick}
          />
        );

      case 'lead-time':
        return (
          <LeadTimeTimeline
            onOrderClick={handleOrderClick}
            onMilestoneClick={handleMilestoneClick}
          />
        );

      case 'inventory':
        return (
          <InventoryOptimization
            onReorderClick={handleReorderClick}
            onApproveReorder={handleApproveReorder}
            onDismissSuggestion={handleDismissSuggestion}
          />
        );

      default:
        // Overview - show all components in a compact layout
        return (
          <div className="space-y-3">
            {/* Live Supply-Chain Risks (primary data list) */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Live Supply-Chain Risks
                  </h2>
                </div>

                {risksLoading ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-4">Loading supply-chain risks…</p>
                ) : risksError ? (
                  <div className="flex items-center gap-2 text-sm text-red-600 py-4">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{risksError}</span>
                  </div>
                ) : risks.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-4">No supply-chain risk records</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                          <th className="py-2 pr-4 font-medium">Name</th>
                          <th className="py-2 pr-4 font-medium">Severity</th>
                          <th className="py-2 pr-4 font-medium">Status</th>
                          <th className="py-2 pr-4 font-medium">Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {risks.map((r: any, index: number) => (
                          <tr
                            key={r.id ?? index}
                            className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                          >
                            <td className="py-2 pr-4 text-gray-900 dark:text-white">
                              {r.name ?? r.riskName ?? r.vendorName ?? r.id ?? '—'}
                            </td>
                            <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                              {r.severity ?? r.riskLevel ?? '—'}
                            </td>
                            <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                              {r.status ?? '—'}
                            </td>
                            <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                              {r.category ?? '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Supply Chain Map - Featured */}
            <SupplyChainMap
              onShipmentClick={handleShipmentClick}
              onNodeClick={handleNodeClick}
              refreshInterval={60000}
            />

            {/* Vendor Risk and Lead Time side by side */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <VendorRiskHeatmap
                onVendorClick={handleVendorClick}
                onAlertClick={handleVendorAlertClick}
              />
              <LeadTimeTimeline
                onOrderClick={handleOrderClick}
                onMilestoneClick={handleMilestoneClick}
              />
            </div>

            {/* Inventory Optimization */}
            <InventoryOptimization
              onReorderClick={handleReorderClick}
              onApproveReorder={handleApproveReorder}
              onDismissSuggestion={handleDismissSuggestion}
            />
          </div>
        );
    }
  };

  return (
    <div className="w-full py-2 space-y-3 max-w-full px-4">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
              <Link className="w-6 h-6 text-white" />
            </div>
            Connected Supply Chain
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-13">
            Real-time visibility, vendor risk analysis, and AI-driven inventory optimization
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm">
            <option value="all">All Regions</option>
            <option value="apac">Asia Pacific</option>
            <option value="emea">EMEA</option>
            <option value="americas">Americas</option>
          </select>

          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats />

      {/* View Selector */}
      <div className="flex items-center justify-between">
        <ViewSelector currentView={currentView} onViewChange={setCurrentView} />

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Live tracking active</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
}
