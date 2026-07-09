'use client';

import React, { useState, useEffect } from 'react';
import {
  Cog,
  Server,
  Workflow,
  Activity,
  QrCode,
  Settings,
  Filter,
  Download,
  RefreshCw,
  Plug,
  Zap,
  ArrowRightLeft,
} from 'lucide-react';
import { MESIntegrationDashboard, DataEntity, SyncEvent } from '@/components/industry4/MESIntegrationDashboard';
import { AutomatedWorkflowStatus, AutomatedWorkflow } from '@/components/industry4/AutomatedWorkflowStatus';
import { IntegrationHealthMonitor, ConnectedSystem, HealthCheck } from '@/components/industry4/IntegrationHealthMonitor';
import { BarcodeScanner, ScannedItem, WIPStatus, ScanMode } from '@/components/industry4/BarcodeScanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

// ============================================================================
// Types
// ============================================================================

type ViewMode = 'overview' | 'mes-integration' | 'workflows' | 'health-monitor' | 'scanner';

// ============================================================================
// Quick Stats Component
// ============================================================================

function QuickStats() {
  const stats = [
    { label: 'Systems Online', value: '7/8', trend: '1 critical', color: 'text-amber-600', icon: Server },
    { label: 'Active Workflows', value: '12', trend: '2 running', color: 'text-blue-600', icon: Workflow },
    { label: 'Sync Status', value: '98.5%', trend: 'Healthy', color: 'text-green-600', icon: ArrowRightLeft },
    { label: 'Today\'s Scans', value: '1,247', trend: '+156 last hour', color: 'text-purple-600', icon: QrCode },
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
    { id: 'overview', label: 'Overview', icon: Cog },
    { id: 'mes-integration', label: 'MES Integration', icon: ArrowRightLeft },
    { id: 'workflows', label: 'Workflows', icon: Workflow },
    { id: 'health-monitor', label: 'System Health', icon: Activity },
    { id: 'scanner', label: 'Scanner', icon: QrCode },
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
                ? 'bg-orange-600 text-white'
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
// Main Automation & Integration Page
// ============================================================================

export default function AutomationPage() {
  const [currentView, setCurrentView] = useState<ViewMode>('overview');

  // Live primary data list: automation workflows from the NestJS domain backend.
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [wfLoading, setWfLoading] = useState(true);
  const [wfError, setWfError] = useState<string | null>(null);

  const loadWorkflows = React.useCallback(async () => {
    setWfLoading(true);
    setWfError(null);
    try {
      const raw = await ProductionOrphanService.getAutomationWorkflows();
      setWorkflows(Array.isArray(raw) ? raw : []);
    } catch (err) {
      setWfError(err instanceof Error ? err.message : 'Failed to load automation workflows');
      setWorkflows([]);
    } finally {
      setWfLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setWfLoading(true);
      setWfError(null);
      try {
        const raw = await ProductionOrphanService.getAutomationWorkflows();
        if (!cancelled) setWorkflows(Array.isArray(raw) ? raw : []);
      } catch (err) {
        if (!cancelled) {
          setWfError(err instanceof Error ? err.message : 'Failed to load automation workflows');
          setWorkflows([]);
        }
      } finally {
        if (!cancelled) setWfLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Scanner mode is a real piece of UI state driven by the BarcodeScanner.
  const [scanMode, setScanMode] = useState<ScanMode>('wip-tracking');

  // Detail/inspection handlers — no backend action exists for these; the child
  // components own their own drill-down, so these are intentional no-ops.
  const handleEntityClick = (_entity: DataEntity) => {};

  const handleSyncTrigger = (_entityId: string) => {
    // No backend sync-trigger endpoint; sync is surfaced by the MES dashboard.
  };

  const handleEventClick = (_event: SyncEvent) => {};

  const handleWorkflowClick = (_workflow: AutomatedWorkflow) => {};

  // Workflow actions wired to the NestJS domain backend, then reload the list.
  const handleStartWorkflow = async (workflowId: string) => {
    try {
      await ProductionOrphanService.executeAutomationWorkflow(workflowId);
      await loadWorkflows();
    } catch (err) {
      setWfError(err instanceof Error ? err.message : 'Failed to start workflow');
    }
  };

  const handlePauseWorkflow = async (workflowId: string) => {
    try {
      await ProductionOrphanService.pauseAutomationWorkflow(workflowId);
      await loadWorkflows();
    } catch (err) {
      setWfError(err instanceof Error ? err.message : 'Failed to pause workflow');
    }
  };

  const handleStopWorkflow = async (workflowId: string) => {
    try {
      await ProductionOrphanService.disableAutomationWorkflow(workflowId);
      await loadWorkflows();
    } catch (err) {
      setWfError(err instanceof Error ? err.message : 'Failed to stop workflow');
    }
  };

  const handleSystemClick = (_system: ConnectedSystem) => {};

  const handleAlertClick = (_system: ConnectedSystem, _alert: string) => {};

  const handleHealthCheckClick = (_system: ConnectedSystem, _check: HealthCheck) => {};

  const handleScan = (_barcode: string, _item?: ScannedItem) => {
    // No backend scan-record endpoint; scanning is handled inside BarcodeScanner.
  };

  const handleScanModeChange = (mode: ScanMode) => {
    setScanMode(mode);
  };

  const handleStatusUpdate = (_status: WIPStatus, _action: string) => {
    // No backend WIP-status endpoint; UI-only affordance.
  };

  const renderContent = () => {
    switch (currentView) {
      case 'mes-integration':
        return (
          <MESIntegrationDashboard
            onEntityClick={handleEntityClick}
            onSyncTrigger={handleSyncTrigger}
            onEventClick={handleEventClick}
          />
        );

      case 'workflows':
        return (
          <AutomatedWorkflowStatus
            onWorkflowClick={handleWorkflowClick}
            onStartWorkflow={handleStartWorkflow}
            onPauseWorkflow={handlePauseWorkflow}
            onStopWorkflow={handleStopWorkflow}
          />
        );

      case 'health-monitor':
        return (
          <IntegrationHealthMonitor
            onSystemClick={handleSystemClick}
            onAlertClick={handleAlertClick}
            onHealthCheckClick={handleHealthCheckClick}
            refreshInterval={5000}
          />
        );

      case 'scanner':
        return (
          <BarcodeScanner
            mode={scanMode}
            onScan={handleScan}
            onModeChange={handleScanModeChange}
            onStatusUpdate={handleStatusUpdate}
          />
        );

      default:
        // Overview - show all components in a compact layout
        return (
          <div className="space-y-3">
            {/* Live Automation Workflows (primary data list from backend) */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-orange-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Live Automation Workflows
                  </h2>
                </div>

                {wfLoading && (
                  <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                    Loading automation workflows…
                  </div>
                )}

                {wfError && !wfLoading && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                    <Activity className="h-4 w-4" />
                    {wfError}
                  </div>
                )}

                {!wfLoading && !wfError && workflows.length === 0 && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                    No automation workflows
                  </div>
                )}

                {!wfLoading && !wfError && workflows.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                          <th className="py-2 pr-4 font-medium">Name</th>
                          <th className="py-2 pr-4 font-medium">Status</th>
                          <th className="py-2 pr-4 font-medium">Trigger</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workflows.map((w: any, index: number) => (
                          <tr
                            key={w.id ?? index}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <td className="py-2 pr-4 font-medium text-gray-900 dark:text-white">
                              {w.name ?? w.workflowName ?? w.id ?? '—'}
                            </td>
                            <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                              {w.status ?? '—'}
                            </td>
                            <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                              {w.trigger ?? w.triggerType ?? '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* MES Integration */}
            <MESIntegrationDashboard
              onEntityClick={handleEntityClick}
              onSyncTrigger={handleSyncTrigger}
              onEventClick={handleEventClick}
            />

            {/* Workflows and Health side by side */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <AutomatedWorkflowStatus
                onWorkflowClick={handleWorkflowClick}
                onStartWorkflow={handleStartWorkflow}
                onPauseWorkflow={handlePauseWorkflow}
                onStopWorkflow={handleStopWorkflow}
              />
              <IntegrationHealthMonitor
                onSystemClick={handleSystemClick}
                onAlertClick={handleAlertClick}
                onHealthCheckClick={handleHealthCheckClick}
                refreshInterval={10000}
              />
            </div>

            {/* Scanner */}
            <BarcodeScanner
              mode={scanMode}
              onScan={handleScan}
              onModeChange={handleScanModeChange}
              onStatusUpdate={handleStatusUpdate}
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
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-amber-600 rounded-lg flex items-center justify-center">
              <Plug className="w-6 h-6 text-white" />
            </div>
            Automation & Integration
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-13">
            MES sync, automated workflows, system health, and barcode scanning
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm">
            <option value="all">All Systems</option>
            <option value="production">Production</option>
            <option value="quality">Quality</option>
            <option value="inventory">Inventory</option>
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
          <span>Real-time monitoring active</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
}
