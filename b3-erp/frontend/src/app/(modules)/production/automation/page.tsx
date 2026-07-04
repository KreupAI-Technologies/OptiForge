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

  // Event handlers
  const handleEntityClick = (entity: DataEntity) => {
    console.log('Entity clicked:', entity);
  };

  const handleSyncTrigger = (entityId: string) => {
    console.log('Sync triggered:', entityId);
  };

  const handleEventClick = (event: SyncEvent) => {
    console.log('Event clicked:', event);
  };

  const handleWorkflowClick = (workflow: AutomatedWorkflow) => {
    console.log('Workflow clicked:', workflow);
  };

  const handleStartWorkflow = (workflowId: string) => {
    console.log('Start workflow:', workflowId);
  };

  const handlePauseWorkflow = (workflowId: string) => {
    console.log('Pause workflow:', workflowId);
  };

  const handleStopWorkflow = (workflowId: string) => {
    console.log('Stop workflow:', workflowId);
  };

  const handleSystemClick = (system: ConnectedSystem) => {
    console.log('System clicked:', system);
  };

  const handleAlertClick = (system: ConnectedSystem, alert: string) => {
    console.log('Alert clicked:', system, alert);
  };

  const handleHealthCheckClick = (system: ConnectedSystem, check: HealthCheck) => {
    console.log('Health check clicked:', system, check);
  };

  const handleScan = (barcode: string, item?: ScannedItem) => {
    console.log('Barcode scanned:', barcode, item);
  };

  const handleScanModeChange = (mode: ScanMode) => {
    console.log('Scan mode changed:', mode);
  };

  const handleStatusUpdate = (status: WIPStatus, action: string) => {
    console.log('WIP status update:', status, action);
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
            mode="wip-tracking"
            onScan={handleScan}
            onModeChange={handleScanModeChange}
            onStatusUpdate={handleStatusUpdate}
          />
        );

      default:
        // Overview - show all components in a compact layout
        return (
          <div className="space-y-3">
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
              mode="wip-tracking"
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
