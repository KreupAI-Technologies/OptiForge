'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Gauge,
  Cpu,
  Waves,
  Factory,
  AlertTriangle,
  Settings,
  Maximize2,
  RefreshCw,
  Download,
  Calendar,
  Filter,
} from 'lucide-react';
import { LiveOEEDashboard } from '@/components/industry4/LiveOEEDashboard';
import { MachineStatusGrid, Machine } from '@/components/industry4/MachineStatusGrid';
import { IoTSensorCharts, SensorData } from '@/components/industry4/IoTSensorCharts';
import { ProductionLineFlow, Station } from '@/components/industry4/ProductionLineFlow';
import { RealTimeAlertsBanner, ProductionAlert } from '@/components/industry4/RealTimeAlertsBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

// ============================================================================
// Types
// ============================================================================

type ViewMode = 'dashboard' | 'oee' | 'machines' | 'sensors' | 'flow' | 'alerts';

// ============================================================================
// Quick Stats Component
// ============================================================================

function QuickStats() {
  const stats = [
    { label: 'Overall OEE', value: '82.4%', trend: '+2.1%', color: 'text-green-600', icon: Gauge },
    { label: 'Active Machines', value: '18/24', trend: '75%', color: 'text-blue-600', icon: Cpu },
    { label: 'Production Rate', value: '847/hr', trend: '+5%', color: 'text-purple-600', icon: Activity },
    { label: 'Active Alerts', value: '3', trend: '2 critical', color: 'text-red-600', icon: AlertTriangle },
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
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'oee', label: 'OEE Monitor', icon: Gauge },
    { id: 'machines', label: 'Machines', icon: Cpu },
    { id: 'sensors', label: 'IoT Sensors', icon: Waves },
    { id: 'flow', label: 'Production Flow', icon: Factory },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
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
                ? 'bg-blue-600 text-white'
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
// Main Dashboard Page
// ============================================================================

export default function RealTimeMonitoringPage() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [selectedProductionLine, setSelectedProductionLine] = useState('line-1');

  // Live primary data list — equipment health from the NestJS domain backend.
  const [equipmentHealth, setEquipmentHealth] = useState<any[]>([]);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setHealthLoading(true);
      setHealthError(null);
      try {
        const raw = await ProductionOrphanService.getEquipmentHealth();
        if (!cancelled) setEquipmentHealth(Array.isArray(raw) ? raw : []);
      } catch (err) {
        if (!cancelled) {
          setHealthError(err instanceof Error ? err.message : 'Failed to load equipment health');
          setEquipmentHealth([]);
        }
      } finally {
        if (!cancelled) setHealthLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMachineClick = (machine: Machine) => {
    setSelectedMachine(machine);
    console.log('Machine clicked:', machine);
  };

  const handleStationClick = (station: Station) => {
    console.log('Station clicked:', station);
  };

  const handleAlertClick = (alert: ProductionAlert) => {
    console.log('Alert clicked:', alert);
  };

  const handleSensorThresholdAlert = (sensor: SensorData) => {
    console.log('Sensor threshold exceeded:', sensor);
  };

  const handleOEEAlert = (type: string, value: number) => {
    console.log('OEE Alert:', type, value);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'oee':
        return (
          <div className="space-y-3">
            <LiveOEEDashboard
              productionLineId={selectedProductionLine}
              refreshInterval={3000}
              showDetails
              onAlert={handleOEEAlert}
            />
          </div>
        );

      case 'machines':
        return (
          <MachineStatusGrid
            productionLineId={selectedProductionLine}
            refreshInterval={3000}
            onMachineClick={handleMachineClick}
            onAlertClick={(machineId, alert) => console.log('Machine alert:', machineId, alert)}
          />
        );

      case 'sensors':
        return (
          <IoTSensorCharts
            machineId={selectedMachine?.id || 'machine-01'}
            refreshInterval={2000}
            maxDataPoints={30}
            onThresholdAlert={handleSensorThresholdAlert}
          />
        );

      case 'flow':
        return (
          <ProductionLineFlow
            lineId={selectedProductionLine}
            onStationClick={handleStationClick}
          />
        );

      case 'alerts':
        return (
          <RealTimeAlertsBanner
            soundEnabled
            maxVisibleAlerts={10}
            onAlertClick={handleAlertClick}
            onAcknowledge={(id) => console.log('Acknowledged:', id)}
          />
        );

      default:
        // Full Dashboard View
        return (
          <div className="space-y-3">
            {/* Live Equipment Health (backend-fetched primary data list) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Live Equipment Health</CardTitle>
              </CardHeader>
              <CardContent>
                {healthLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Loading equipment health…
                  </div>
                ) : healthError ? (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                    <AlertTriangle className="w-4 h-4" />
                    {healthError}
                  </div>
                ) : equipmentHealth.length === 0 ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                    No equipment health records
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                          <th className="py-2 pr-4 font-medium">Equipment</th>
                          <th className="py-2 pr-4 font-medium">Health Score</th>
                          <th className="py-2 pr-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {equipmentHealth.map((item, index) => (
                          <tr
                            key={item?.id ?? index}
                            className="border-b border-gray-100 dark:border-gray-800"
                          >
                            <td className="py-2 pr-4 text-gray-900 dark:text-gray-100">
                              {item?.equipmentName ?? item?.name ?? item?.id ?? '—'}
                            </td>
                            <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                              {item?.healthScore ?? item?.score ?? '—'}
                            </td>
                            <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                              {item?.healthStatus ?? item?.status ?? '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Alerts Banner */}
            <RealTimeAlertsBanner
              soundEnabled
              maxVisibleAlerts={3}
              onAlertClick={handleAlertClick}
              onAcknowledge={(id) => console.log('Acknowledged:', id)}
            />

            {/* OEE and Machine Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <LiveOEEDashboard
                productionLineId={selectedProductionLine}
                refreshInterval={5000}
                showDetails
                onAlert={handleOEEAlert}
              />
              <MachineStatusGrid
                productionLineId={selectedProductionLine}
                refreshInterval={5000}
                onMachineClick={handleMachineClick}
              />
            </div>

            {/* Production Flow */}
            <ProductionLineFlow
              lineId={selectedProductionLine}
              onStationClick={handleStationClick}
            />

            {/* IoT Sensors */}
            <IoTSensorCharts
              machineId="machine-01"
              refreshInterval={3000}
              maxDataPoints={20}
              onThresholdAlert={handleSensorThresholdAlert}
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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            Real-Time Monitoring Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-13">
            Industry 4.0 Smart Manufacturing - Live production monitoring and IoT data visualization
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Production Line Selector */}
          <select
            value={selectedProductionLine}
            onChange={(e) => setSelectedProductionLine(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
          >
            <option value="line-1">Production Line 1</option>
            <option value="line-2">Production Line 2</option>
            <option value="line-3">Production Line 3</option>
            <option value="all">All Lines</option>
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
          <span>Live data updating</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>

      {/* Machine Detail Modal - Placeholder */}
      {selectedMachine && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedMachine(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedMachine.name}
                </h2>
                <button
                  onClick={() => setSelectedMachine(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Maximize2 className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <IoTSensorCharts
                machineId={selectedMachine.id}
                refreshInterval={2000}
                maxDataPoints={30}
                onThresholdAlert={handleSensorThresholdAlert}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
