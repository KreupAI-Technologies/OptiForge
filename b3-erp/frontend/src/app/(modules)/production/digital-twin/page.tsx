'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heart,
  Sliders,
  MapPin,
  Activity,
  Settings,
  Filter,
  Download,
  RefreshCw,
  Layers,
  Cpu,
  Zap,
} from 'lucide-react';
import { FactoryFloor3D, FloorMachine, FloorZone } from '@/components/industry4/FactoryFloor3D';
import { EquipmentHealthCards, Equipment, MaintenancePrediction } from '@/components/industry4/EquipmentHealthCards';
import { ProductionSimulation, SimulationScenario, SimulationResults } from '@/components/industry4/ProductionSimulation';
import { AssetTrackingMap, TrackedAsset, Zone } from '@/components/industry4/AssetTrackingMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

// ============================================================================
// Types
// ============================================================================

type ViewMode = 'overview' | 'factory-floor' | 'equipment-health' | 'simulation' | 'asset-tracking';

// ============================================================================
// Quick Stats Component
// ============================================================================

function QuickStats() {
  const stats = [
    { label: 'Factory Health', value: '94%', trend: '+1.2%', color: 'text-green-600', icon: Heart },
    { label: 'Active Equipment', value: '45/52', trend: '87%', color: 'text-blue-600', icon: Cpu },
    { label: 'Tracked Assets', value: '1,247', trend: '+24', color: 'text-purple-600', icon: MapPin },
    { label: 'Simulation Runs', value: '12', trend: 'Today', color: 'text-orange-600', icon: Activity },
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
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'factory-floor', label: '3D Factory', icon: Box },
    { id: 'equipment-health', label: 'Equipment Health', icon: Heart },
    { id: 'simulation', label: 'Simulation', icon: Sliders },
    { id: 'asset-tracking', label: 'Asset Tracking', icon: MapPin },
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
                ? 'bg-indigo-600 text-white'
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
// Main Digital Twin Page
// ============================================================================

export default function DigitalTwinPage() {
  const [currentView, setCurrentView] = useState<ViewMode>('overview');
  const [selectedFloor, setSelectedFloor] = useState('floor-1');

  // Live primary data list — GET /production/digital-twins (NestJS domain backend)
  const [twins, setTwins] = useState<any[]>([]);
  const [twinsLoading, setTwinsLoading] = useState(true);
  const [twinsError, setTwinsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setTwinsLoading(true);
      setTwinsError(null);
      try {
        const raw = await ProductionOrphanService.getDigitalTwins();
        if (!cancelled) setTwins(Array.isArray(raw) ? raw : []);
      } catch (err) {
        if (!cancelled) {
          setTwinsError(err instanceof Error ? err.message : 'Failed to load digital twins');
          setTwins([]);
        }
      } finally {
        if (!cancelled) setTwinsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Event handlers
  const handleMachineClick = (machine: FloorMachine) => {
    console.log('Machine clicked:', machine);
  };

  const handleZoneClick = (zone: FloorZone) => {
    console.log('Zone clicked:', zone);
  };

  const handleEquipmentClick = (equipment: Equipment) => {
    console.log('Equipment clicked:', equipment);
  };

  const handleMaintenanceSchedule = (equipmentId: string, prediction: MaintenancePrediction) => {
    console.log('Schedule maintenance:', equipmentId, prediction);
  };

  const handleScenarioSave = (scenario: SimulationScenario) => {
    console.log('Scenario saved:', scenario);
  };

  const handleSimulationExport = (results: SimulationResults) => {
    console.log('Export results:', results);
  };

  const handleAssetClick = (asset: TrackedAsset) => {
    console.log('Asset clicked:', asset);
  };

  const handleTrackingZoneClick = (zone: Zone) => {
    console.log('Tracking zone clicked:', zone);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'factory-floor':
        return (
          <FactoryFloor3D
            floorId={selectedFloor}
            onMachineClick={handleMachineClick}
            onZoneClick={handleZoneClick}
          />
        );

      case 'equipment-health':
        return (
          <EquipmentHealthCards
            onEquipmentClick={handleEquipmentClick}
            onMaintenanceSchedule={handleMaintenanceSchedule}
          />
        );

      case 'simulation':
        return (
          <ProductionSimulation
            onScenarioSave={handleScenarioSave}
            onExport={handleSimulationExport}
          />
        );

      case 'asset-tracking':
        return (
          <AssetTrackingMap
            onAssetClick={handleAssetClick}
            onZoneClick={handleTrackingZoneClick}
            refreshInterval={3000}
          />
        );

      default:
        // Overview - show all components in a compact layout
        return (
          <div className="space-y-3">
            {/* Live Digital Twins — primary data list from GET /production/digital-twins */}
            <Card>
              <CardContent className="pt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-600" />
                  Live Digital Twins
                </h3>

                {twinsLoading && (
                  <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                    Loading digital twins…
                  </div>
                )}

                {twinsError && !twinsLoading && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                    <Zap className="h-4 w-4" />
                    {twinsError}
                  </div>
                )}

                {!twinsLoading && !twinsError && twins.length === 0 && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                    No digital twins
                  </div>
                )}

                {!twinsLoading && !twinsError && twins.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          <th className="px-3 py-2 font-medium">Name</th>
                          <th className="px-3 py-2 font-medium">Type</th>
                          <th className="px-3 py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {twins.map((t: any, index: number) => (
                          <tr
                            key={t.id ?? index}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">
                              {t.name ?? t.twinName ?? t.id ?? '—'}
                            </td>
                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                              {t.twinType ?? t.type ?? '—'}
                            </td>
                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                              {t.status ?? '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Factory Floor and Equipment Health */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Box className="w-5 h-5 text-indigo-600" />
                  3D Factory Floor
                </h3>
                <FactoryFloor3D
                  floorId={selectedFloor}
                  onMachineClick={handleMachineClick}
                  onZoneClick={handleZoneClick}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-emerald-600" />
                  Equipment Health
                </h3>
                <EquipmentHealthCards
                  onEquipmentClick={handleEquipmentClick}
                  onMaintenanceSchedule={handleMaintenanceSchedule}
                />
              </div>
            </div>

            {/* Simulation */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-violet-600" />
                Production Simulation
              </h3>
              <ProductionSimulation
                onScenarioSave={handleScenarioSave}
                onExport={handleSimulationExport}
              />
            </div>

            {/* Asset Tracking */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-600" />
                Asset Tracking
              </h3>
              <AssetTrackingMap
                onAssetClick={handleAssetClick}
                onZoneClick={handleTrackingZoneClick}
                refreshInterval={5000}
              />
            </div>
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
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
            Digital Twin Visualization
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-13">
            Industry 4.0 - Virtual factory representation with predictive analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Floor Selector */}
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
          >
            <option value="floor-1">Factory Floor 1</option>
            <option value="floor-2">Factory Floor 2</option>
            <option value="floor-3">Warehouse</option>
            <option value="all">All Locations</option>
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
          <span>Synced with physical assets</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
}
