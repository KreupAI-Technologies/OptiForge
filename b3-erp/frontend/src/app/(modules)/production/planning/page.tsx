'use client';

import React, { useState, useEffect } from 'react';
import { RunMRPModal, ExportMPSModal, AdjustPlanModal } from '@/components/production/MPSModals';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import { exportToCsv } from '@/lib/export';
import {
  Calendar,
  TrendingUp,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Factory,
  BarChart3,
  Download,
  Play,
  Lock,
  Unlock,
  RefreshCw,
  Filter,
  Settings,
  Plus,
  Edit,
  Eye,
  ArrowRight,
  DollarSign,
  Users,
  Zap,
  Target,
  Activity,
  PieChart,
  LineChart,
  ShoppingCart,
  Layers,
  Box,
  TrendingDown,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronDown,
  Save,
  FileText,
  Send,
  Copy,
  Trash2,
} from 'lucide-react';

// TypeScript Interfaces
interface MPSPeriod {
  periodNumber: number;
  startDate: string;
  endDate: string;
  beginningInventory: number;
  grossRequirements: number;
  scheduledReceipts: number;
  projectedAvailable: number;
  netRequirements: number;
  plannedOrderReleases: number;
  availableToPromise: number;
  demandBreakdown: {
    forecast: number;
    firmOrders: number;
    safetyStock: number;
  };
}

interface MPSProduct {
  id: string;
  productCode: string;
  productName: string;
  family: string;
  planningStrategy: 'MTS' | 'MTO' | 'ATO';
  abcClass: 'A' | 'B' | 'C';
  uom: string;
  leadTime: number;
  lotSize: number;
  safetyStock: number;
  currentInventory: number;
  periods: MPSPeriod[];
  totalDemand: number;
  totalPlanned: number;
  status: 'ok' | 'warning' | 'critical';
}

interface WorkCenterCapacity {
  workCenter: string;
  availableHours: number;
  requiredHours: number;
  utilization: number;
  status: 'ok' | 'tight' | 'overload';
}

interface PlanVariance {
  period: string;
  planned: number;
  actual: number;
  variance: number;
  variancePercent: number;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  demandAdjustment: number;
  capacityAdjustment: number;
  impact: {
    inventoryChange: number;
    atpChange: number;
    utilizationChange: number;
  };
  createdDate: string;
}

interface DemandSource {
  type: 'forecast' | 'order' | 'safety-stock';
  source: string;
  quantity: number;
  date: string;
  status: string;
}

const ProductionPlanningPage = () => {
  // State Management
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [dateRange, setDateRange] = useState({
    start: '2025-10-17',
    end: '2025-12-31',
  });
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showScenario, setShowScenario] = useState(false);
  const [planFrozen, setPlanFrozen] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'capacity' | 'variance' | 'scenarios'>('schedule');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [filterFamily, setFilterFamily] = useState<string>('all');
  const [filterStrategy, setFilterStrategy] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [demandAdjustment, setDemandAdjustment] = useState(0);
  const [capacityAdjustment, setCapacityAdjustment] = useState(0);

  // Modal states
  const [isRunMRPModalOpen, setIsRunMRPModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAdjustPlanModalOpen, setIsAdjustPlanModalOpen] = useState(false);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<any | null>(null);

  // Mock Data - Master Production Schedule
  // Master Production Schedule (live data)
  const [mpsData, setMpsData] = useState<MPSProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const raw = (await ProductionOrphanService.getMasterSchedules()) as any[];
        const mapped: MPSProduct[] = (raw || []).map((r: any, idx: number) => ({
          id: String(r.id ?? `MPS-${idx + 1}`),
          productCode: String(r.productCode ?? ''),
          productName: String(r.productName ?? ''),
          family: String(r.family ?? ''),
          planningStrategy: (r.planningStrategy ?? 'MTS') as MPSProduct['planningStrategy'],
          abcClass: (r.abcClass ?? 'C') as MPSProduct['abcClass'],
          uom: String(r.uom ?? ''),
          leadTime: Number(r.leadTime ?? 0),
          lotSize: Number(r.lotSize ?? 0),
          safetyStock: Number(r.safetyStock ?? 0),
          currentInventory: Number(r.currentInventory ?? 0),
          periods: (Array.isArray(r.periods) ? r.periods : []).map((p: any, pIdx: number) => ({
            periodNumber: Number(p.periodNumber ?? pIdx + 1),
            startDate: String(p.startDate ?? ''),
            endDate: String(p.endDate ?? ''),
            beginningInventory: Number(p.beginningInventory ?? 0),
            grossRequirements: Number(p.grossRequirements ?? 0),
            scheduledReceipts: Number(p.scheduledReceipts ?? 0),
            projectedAvailable: Number(p.projectedAvailable ?? 0),
            netRequirements: Number(p.netRequirements ?? 0),
            plannedOrderReleases: Number(p.plannedOrderReleases ?? 0),
            availableToPromise: Number(p.availableToPromise ?? 0),
            demandBreakdown: {
              forecast: Number(p.demandBreakdown?.forecast ?? 0),
              firmOrders: Number(p.demandBreakdown?.firmOrders ?? 0),
              safetyStock: Number(p.demandBreakdown?.safetyStock ?? 0),
            },
          })),
          totalDemand: Number(r.totalDemand ?? 0),
          totalPlanned: Number(r.totalPlanned ?? 0),
          status: (r.status ?? 'ok') as MPSProduct['status'],
        }));
        if (!cancelled) setMpsData(mapped);
      } catch (err) {
        if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setMpsData([]); }
      } finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  // Mock Data - Rough-Cut Capacity
  const [capacityData, setCapacityData] = useState<WorkCenterCapacity[]>([
    {
      workCenter: 'Assembly Line 1',
      availableHours: 160,
      requiredHours: 145,
      utilization: 90.6,
      status: 'ok',
    },
    {
      workCenter: 'Fabrication Shop',
      availableHours: 320,
      requiredHours: 315,
      utilization: 98.4,
      status: 'tight',
    },
    {
      workCenter: 'Welding Station',
      availableHours: 240,
      requiredHours: 268,
      utilization: 111.7,
      status: 'overload',
    },
    {
      workCenter: 'Testing Bay',
      availableHours: 200,
      requiredHours: 178,
      utilization: 89.0,
      status: 'ok',
    },
    {
      workCenter: 'Paint Shop',
      availableHours: 160,
      requiredHours: 142,
      utilization: 88.8,
      status: 'ok',
    },
  ]);

  // Mock Data - Plan vs Actual Variance
  const [varianceData, setVarianceData] = useState<PlanVariance[]>([
    { period: 'May 2025', planned: 120, actual: 118, variance: -2, variancePercent: -1.7 },
    { period: 'Jun 2025', planned: 135, actual: 142, variance: 7, variancePercent: 5.2 },
    { period: 'Jul 2025', planned: 140, actual: 135, variance: -5, variancePercent: -3.6 },
    { period: 'Aug 2025', planned: 150, actual: 155, variance: 5, variancePercent: 3.3 },
    { period: 'Sep 2025', planned: 145, actual: 140, variance: -5, variancePercent: -3.4 },
    { period: 'Oct 2025', planned: 160, actual: 0, variance: 0, variancePercent: 0 },
  ]);

  // Mock Data - Scenarios
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: 'SCN001',
      name: 'Festive Season Boost',
      description: '20% demand increase during Diwali period',
      demandAdjustment: 20,
      capacityAdjustment: 10,
      impact: {
        inventoryChange: -15,
        atpChange: -12,
        utilizationChange: 8,
      },
      createdDate: '2025-10-15',
    },
    {
      id: 'SCN002',
      name: 'New Product Launch',
      description: 'Introduction of new 800A panel series',
      demandAdjustment: 15,
      capacityAdjustment: 5,
      impact: {
        inventoryChange: -10,
        atpChange: -8,
        utilizationChange: 6,
      },
      createdDate: '2025-10-10',
    },
  ]);

  // Mock Data - Demand Sources
  const demandSources: DemandSource[] = [
    { type: 'order', source: 'SO-2025-1234', quantity: 10, date: '2025-10-25', status: 'Confirmed' },
    { type: 'order', source: 'SO-2025-1245', quantity: 8, date: '2025-10-28', status: 'Confirmed' },
    { type: 'forecast', source: 'October Forecast', quantity: 25, date: '2025-10-31', status: 'Projected' },
    { type: 'order', source: 'SO-2025-1256', quantity: 12, date: '2025-11-05', status: 'Confirmed' },
    { type: 'forecast', source: 'November Forecast', quantity: 30, date: '2025-11-30', status: 'Projected' },
    { type: 'safety-stock', source: 'Safety Stock', quantity: 5, date: 'Ongoing', status: 'Required' },
  ];

  // Calculate Summary Statistics
  const calculateStats = () => {
    const totalDemand = mpsData.reduce((sum, product) => sum + product.totalDemand, 0);
    const totalPlanned = mpsData.reduce((sum, product) => sum + product.totalPlanned, 0);
    const totalInventory = mpsData.reduce((sum, product) => sum + product.currentInventory, 0);
    const totalATP = mpsData.reduce((sum, product) => {
      const lastPeriod = product.periods[product.periods.length - 1];
      return sum + (lastPeriod?.availableToPromise || 0);
    }, 0);

    return { totalDemand, totalPlanned, totalInventory, totalATP };
  };

  const stats = calculateStats();

  // Toggle row expansion
  const toggleRowExpansion = (productId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedRows(newExpanded);
  };

  // Filter products
  const filteredProducts = mpsData.filter((product) => {
    if (filterFamily !== 'all' && product.family !== filterFamily) return false;
    if (filterStrategy !== 'all' && product.planningStrategy !== filterStrategy) return false;
    if (filterClass !== 'all' && product.abcClass !== filterClass) return false;
    return true;
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'tight':
        return 'text-orange-600 bg-orange-50';
      case 'overload':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Get cell color based on inventory level
  const getCellColor = (available: number, safetyStock: number) => {
    if (available < 0) return 'bg-red-100 text-red-800';
    if (available < safetyStock) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-50 text-green-800';
  };

  // Generate Production Orders
  const generateProductionOrders = () => {
    alert('Generating Production Orders from planned releases...\n\nThis will create Work Orders for all planned order releases in the MPS.');
  };

  // Run MRP
  const runMRP = () => {
    setIsRunMRPModalOpen(true);
  };

  // Freeze Plan
  const toggleFreezePlan = () => {
    setPlanFrozen(!planFrozen);
  };

  // Export MPS
  const exportMPS = () => {
    setIsExportModalOpen(true);
  };

  // Handler functions
  const handleRunMRP = (options: any) => {
    console.log('Running MRP with options:', options);
    alert(`Running MRP Cascade!\n\nType: ${options.regenerative ? 'Regenerative' : 'Net Change'}\nNetting: ${options.nettingMode}\nHorizon: ${options.horizonWeeks} weeks\n\nThis will explode BOMs and generate material requirements for all components.`);
  };

  const handleExport = (format: string, options: any) => {
    exportToCsv('master-production-schedule', filteredProducts as unknown as Record<string, unknown>[]);
  };

  const handleAdjustPlan = (adjustments: any) => {
    console.log('Applying plan adjustments:', adjustments);
    alert(`Plan Adjustment Applied!\n\nType: ${adjustments.adjustmentType}\nPeriod: ${adjustments.selectedPeriod}\nValue: ${adjustments.adjustmentValue}\nReason: ${adjustments.reason}`);
  };

  // Save Scenario
  const saveScenario = () => {
    if (!scenarioName) {
      alert('Please enter a scenario name');
      return;
    }

    const newScenario: Scenario = {
      id: `SCN${String(scenarios.length + 1).padStart(3, '0')}`,
      name: scenarioName,
      description: `Demand ${demandAdjustment > 0 ? '+' : ''}${demandAdjustment}%, Capacity ${capacityAdjustment > 0 ? '+' : ''}${capacityAdjustment}%`,
      demandAdjustment,
      capacityAdjustment,
      impact: {
        inventoryChange: Math.round(demandAdjustment * -0.5),
        atpChange: Math.round(demandAdjustment * -0.4),
        utilizationChange: Math.round((demandAdjustment - capacityAdjustment) * 0.5),
      },
      createdDate: new Date().toISOString().split('T')[0],
    };

    setScenarios([...scenarios, newScenario]);
    setScenarioName('');
    setDemandAdjustment(0);
    setCapacityAdjustment(0);
    alert(`Scenario "${newScenario.name}" saved successfully!`);
  };

  return (
    <div className="p-6 space-y-3 bg-gray-50 min-h-screen">
      {isLoading && (<div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700"><div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />Loading…</div>)}
      {loadError && !isLoading && (<div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>)}
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              Master Production Schedule (MPS)
            </h1>
            <p className="text-gray-600 mt-1">
              Plan production to meet demand while optimizing inventory and capacity
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleFreezePlan}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                planFrozen
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {planFrozen ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              {planFrozen ? 'Plan Frozen' : 'Plan Active'}
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Planning Period and Date Range */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Planning Period:</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('weekly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'weekly'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'monthly'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Date Range:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Plan
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Demand</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalDemand}</p>
                <p className="text-xs text-blue-600 mt-1">Units (next 4 periods)</p>
              </div>
              <ShoppingCart className="h-10 w-10 text-blue-400" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Planned Production</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.totalPlanned}</p>
                <p className="text-xs text-green-600 mt-1">Units (scheduled)</p>
              </div>
              <Factory className="h-10 w-10 text-green-400" />
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Available Inventory</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{stats.totalInventory}</p>
                <p className="text-xs text-purple-600 mt-1">Units (on hand)</p>
              </div>
              <Package className="h-10 w-10 text-purple-400" />
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Available-to-Promise</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">{stats.totalATP}</p>
                <p className="text-xs text-orange-600 mt-1">Units (can commit)</p>
              </div>
              <Target className="h-10 w-10 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Planning Alerts
        </h2>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Stock-out Risk: VCB - 11kV 630A</p>
              <p className="text-xs text-red-700 mt-0.5">
                Projected negative inventory in periods 2-4. Consider expediting production.
              </p>
            </div>
            <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
              Resolve
            </button>
          </div>

          <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">
                Capacity Constraint: Welding Station
              </p>
              <p className="text-xs text-yellow-700 mt-0.5">
                111.7% utilization detected. Consider overtime or rescheduling.
              </p>
            </div>
            <button className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700">
              Review
            </button>
          </div>

          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Planning Horizon: 4 weeks configured
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                Consider extending to 8-12 weeks for better visibility.
              </p>
            </div>
            <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
              Adjust
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-1 p-2">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'schedule'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Production Schedule
              </div>
            </button>
            <button
              onClick={() => setActiveTab('capacity')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'capacity'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Factory className="h-4 w-4" />
                Rough-Cut Capacity
              </div>
            </button>
            <button
              onClick={() => setActiveTab('variance')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'variance'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Plan vs Actual
              </div>
            </button>
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'scenarios'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                What-If Scenarios
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Master Production Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-3">
              {/* Filters */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Filter className="h-5 w-5 text-gray-600" />
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Product Family:</label>
                  <select
                    value={filterFamily}
                    onChange={(e) => setFilterFamily(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Families</option>
                    <option value="Control Panels">Control Panels</option>
                    <option value="Switchgear">Switchgear</option>
                    <option value="Transformers">Transformers</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Planning Strategy:</label>
                  <select
                    value={filterStrategy}
                    onChange={(e) => setFilterStrategy(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Strategies</option>
                    <option value="MTS">Make-to-Stock (MTS)</option>
                    <option value="MTO">Make-to-Order (MTO)</option>
                    <option value="ATO">Assemble-to-Order (ATO)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">ABC Class:</label>
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Classes</option>
                    <option value="A">Class A</option>
                    <option value="B">Class B</option>
                    <option value="C">Class C</option>
                  </select>
                </div>

                <button className="ml-auto px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium">
                  Reset Filters
                </button>
              </div>

              {/* MPS Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 sticky left-0 bg-gray-100">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Strategy</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Class</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900">
                        Current Inv
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900 bg-blue-50" colSpan={4}>
                        Period 1 (Oct 20-26)
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900 bg-green-50" colSpan={4}>
                        Period 2 (Oct 27-Nov 2)
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900 bg-yellow-50" colSpan={4}>
                        Period 3 (Nov 3-9)
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900 bg-purple-50" colSpan={4}>
                        Period 4 (Nov 10-16)
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900">Status</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900">Actions</th>
                    </tr>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 sticky left-0 bg-gray-50"></th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600"></th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600"></th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600"></th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 bg-blue-50">Demand</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 bg-blue-50">Receipt</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 bg-blue-50">Avail</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 bg-blue-50">ATP</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 bg-green-50">Demand</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 bg-green-50">Receipt</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 bg-green-50">Avail</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 bg-green-50">ATP</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 bg-yellow-50">Demand</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 bg-yellow-50">Receipt</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 bg-yellow-50">Avail</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 bg-yellow-50">ATP</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 bg-purple-50">Demand</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 bg-purple-50">Receipt</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 bg-purple-50">Avail</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 bg-purple-50">ATP</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-600"></th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-600"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <React.Fragment key={product.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 sticky left-0 bg-white">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleRowExpansion(product.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {expandedRows.has(product.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                              <div>
                                <p className="font-medium text-gray-900">{product.productCode}</p>
                                <p className="text-xs text-gray-600">{product.productName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                product.planningStrategy === 'MTS'
                                  ? 'bg-blue-100 text-blue-800'
                                  : product.planningStrategy === 'MTO'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {product.planningStrategy}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                              {product.abcClass}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">{product.currentInventory}</td>

                          {/* Period 1 */}
                          <td className="px-4 py-3 text-right bg-blue-50">
                            {product.periods[0]?.grossRequirements}
                          </td>
                          <td className="px-4 py-3 text-right bg-blue-50 font-medium text-green-700">
                            {product.periods[0]?.scheduledReceipts > 0
                              ? product.periods[0].scheduledReceipts
                              : '-'}
                          </td>
                          <td
                            className={`px-4 py-3 text-right font-medium ${getCellColor(
                              product.periods[0]?.projectedAvailable,
                              product.safetyStock
                            )}`}
                          >
                            {product.periods[0]?.projectedAvailable}
                          </td>
                          <td className="px-4 py-3 text-right bg-blue-50 font-medium text-blue-700">
                            {product.periods[0]?.availableToPromise}
                          </td>

                          {/* Period 2 */}
                          <td className="px-4 py-3 text-right bg-green-50">
                            {product.periods[1]?.grossRequirements}
                          </td>
                          <td className="px-4 py-3 text-right bg-green-50 font-medium text-green-700">
                            {product.periods[1]?.scheduledReceipts > 0
                              ? product.periods[1].scheduledReceipts
                              : '-'}
                          </td>
                          <td
                            className={`px-4 py-3 text-right font-medium ${getCellColor(
                              product.periods[1]?.projectedAvailable,
                              product.safetyStock
                            )}`}
                          >
                            {product.periods[1]?.projectedAvailable}
                          </td>
                          <td className="px-4 py-3 text-right bg-green-50 font-medium text-blue-700">
                            {product.periods[1]?.availableToPromise}
                          </td>

                          {/* Period 3 */}
                          <td className="px-4 py-3 text-right bg-yellow-50">
                            {product.periods[2]?.grossRequirements}
                          </td>
                          <td className="px-4 py-3 text-right bg-yellow-50 font-medium text-green-700">
                            {product.periods[2]?.scheduledReceipts > 0
                              ? product.periods[2].scheduledReceipts
                              : '-'}
                          </td>
                          <td
                            className={`px-4 py-3 text-right font-medium ${getCellColor(
                              product.periods[2]?.projectedAvailable,
                              product.safetyStock
                            )}`}
                          >
                            {product.periods[2]?.projectedAvailable}
                          </td>
                          <td className="px-4 py-3 text-right bg-yellow-50 font-medium text-blue-700">
                            {product.periods[2]?.availableToPromise}
                          </td>

                          {/* Period 4 */}
                          <td className="px-4 py-3 text-right bg-purple-50">
                            {product.periods[3]?.grossRequirements}
                          </td>
                          <td className="px-4 py-3 text-right bg-purple-50 font-medium text-green-700">
                            {product.periods[3]?.scheduledReceipts > 0
                              ? product.periods[3].scheduledReceipts
                              : '-'}
                          </td>
                          <td
                            className={`px-4 py-3 text-right font-medium ${getCellColor(
                              product.periods[3]?.projectedAvailable,
                              product.safetyStock
                            )}`}
                          >
                            {product.periods[3]?.projectedAvailable}
                          </td>
                          <td className="px-4 py-3 text-right bg-purple-50 font-medium text-blue-700">
                            {product.periods[3]?.availableToPromise}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                product.status
                              )}`}
                            >
                              {product.status === 'ok'
                                ? 'On Track'
                                : product.status === 'warning'
                                ? 'Review'
                                : 'Critical'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                               
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                               
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Row - Demand Breakdown */}
                        {expandedRows.has(product.id) && (
                          <tr className="bg-gray-50">
                            <td colSpan={24} className="px-4 py-4">
                              <div className="ml-8 space-y-2">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                  <Layers className="h-4 w-4" />
                                  Demand Breakdown & Details
                                </h4>

                                <div className="grid grid-cols-4 gap-2">
                                  {product.periods.map((period) => (
                                    <div
                                      key={period.periodNumber}
                                      className="bg-white p-3 rounded-lg border border-gray-200"
                                    >
                                      <p className="font-medium text-gray-900 mb-2">
                                        Period {period.periodNumber}
                                      </p>
                                      <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Forecast:</span>
                                          <span className="font-medium">
                                            {period.demandBreakdown.forecast}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Firm Orders:</span>
                                          <span className="font-medium">
                                            {period.demandBreakdown.firmOrders}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Safety Stock:</span>
                                          <span className="font-medium">
                                            {period.demandBreakdown.safetyStock}
                                          </span>
                                        </div>
                                        <div className="flex justify-between pt-1 border-t border-gray-200">
                                          <span className="text-gray-900 font-medium">Total:</span>
                                          <span className="font-bold">{period.grossRequirements}</span>
                                        </div>
                                        {period.plannedOrderReleases > 0 && (
                                          <div className="flex justify-between pt-1 mt-2 border-t border-gray-200">
                                            <span className="text-blue-600 font-medium">
                                              Planned Order:
                                            </span>
                                            <span className="font-bold text-blue-700">
                                              {period.plannedOrderReleases}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="grid grid-cols-3 gap-2 mt-4">
                                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                    <p className="text-xs font-medium text-blue-600 mb-1">
                                      Planning Parameters
                                    </p>
                                    <div className="space-y-1 text-xs">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Lead Time:</span>
                                        <span className="font-medium">
                                          {product.leadTime} weeks
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Lot Size:</span>
                                        <span className="font-medium">{product.lotSize} units</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Safety Stock:</span>
                                        <span className="font-medium">
                                          {product.safetyStock} units
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                    <p className="text-xs font-medium text-green-600 mb-1">
                                      Summary Totals
                                    </p>
                                    <div className="space-y-1 text-xs">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Total Demand:</span>
                                        <span className="font-medium">{product.totalDemand} units</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Total Planned:</span>
                                        <span className="font-medium">
                                          {product.totalPlanned} units
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Current Stock:</span>
                                        <span className="font-medium">
                                          {product.currentInventory} units
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                                    <p className="text-xs font-medium text-purple-600 mb-1">
                                      Quick Actions
                                    </p>
                                    <div className="space-y-2">
                                      <button className="w-full px-3 py-1.5 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 flex items-center justify-center gap-1">
                                        <Play className="h-3 w-3" />
                                        Create Work Orders
                                      </button>
                                      <button className="w-full px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center justify-center gap-1">
                                        <RefreshCw className="h-3 w-3" />
                                        Run MRP
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Demand Sources Section */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  Demand Sources Aggregation
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-900">Type</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-900">Source</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-900">Quantity</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-900">Date</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {demandSources.map((source, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                source.type === 'order'
                                  ? 'bg-green-100 text-green-800'
                                  : source.type === 'forecast'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {source.type === 'order'
                                ? 'Firm Order'
                                : source.type === 'forecast'
                                ? 'Forecast'
                                : 'Safety Stock'}
                            </span>
                          </td>
                          <td className="px-4 py-2 font-medium text-gray-900">{source.source}</td>
                          <td className="px-4 py-2 text-right font-semibold">{source.quantity}</td>
                          <td className="px-4 py-2 text-gray-600">{source.date}</td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                source.status === 'Confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : source.status === 'Projected'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {source.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={generateProductionOrders}
                  disabled={planFrozen}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="h-5 w-5" />
                  Generate Production Orders
                </button>
                <button
                  onClick={runMRP}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  Run MRP Cascade
                </button>
                <button
                  onClick={() => {
                    if (mpsData.length > 0) {
                      setSelectedProductForAdjust(mpsData[0]);
                      setIsAdjustPlanModalOpen(true);
                    }
                  }}
                  disabled={planFrozen}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Edit className="h-5 w-5" />
                  Adjust Plan
                </button>
                <button
                  onClick={exportMPS}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium flex items-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Export to Excel
                </button>
              </div>
            </div>
          )}

          {/* Rough-Cut Capacity Tab */}
          {activeTab === 'capacity' && (
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Rough-Cut Capacity Planning (RCCP)
                </h3>
                <p className="text-sm text-blue-700">
                  RCCP validates whether the MPS is feasible given critical resource constraints.
                  Check capacity at bottleneck work centers before finalizing the production
                  schedule.
                </p>
              </div>

              {/* Capacity Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">
                        Work Center
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900">
                        Available Hours
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900">
                        Required Hours
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900">
                        Utilization %
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900">
                        Variance (hrs)
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900">Status</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {capacityData.map((capacity, index) => {
                      const variance = capacity.availableHours - capacity.requiredHours;
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {capacity.workCenter}
                          </td>
                          <td className="px-4 py-3 text-right">{capacity.availableHours}</td>
                          <td className="px-4 py-3 text-right font-medium">
                            {capacity.requiredHours}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`font-bold ${
                                capacity.utilization > 100
                                  ? 'text-red-600'
                                  : capacity.utilization > 90
                                  ? 'text-orange-600'
                                  : capacity.utilization > 80
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                              }`}
                            >
                              {capacity.utilization.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`font-medium ${
                                variance < 0 ? 'text-red-600' : 'text-green-600'
                              }`}
                            >
                              {variance > 0 ? '+' : ''}
                              {variance.toFixed(0)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                capacity.status
                              )}`}
                            >
                              {capacity.status === 'ok'
                                ? 'OK'
                                : capacity.status === 'tight'
                                ? 'Tight'
                                : 'Overload'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {capacity.status === 'overload' && (
                              <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                                Resolve
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Capacity Visualization */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Capacity vs Load Comparison
                  </h3>
                  <div className="space-y-3">
                    {capacityData.map((capacity, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{capacity.workCenter}</span>
                          <span className="text-xs text-gray-600">
                            {capacity.requiredHours} / {capacity.availableHours} hrs
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                          <div
                            className={`h-full ${
                              capacity.utilization > 100
                                ? 'bg-red-500'
                                : capacity.utilization > 90
                                ? 'bg-orange-500'
                                : capacity.utilization > 80
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(capacity.utilization, 100)}%` }}
                          >
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900">
                              {capacity.utilization.toFixed(1)}%
                            </span>
                          </div>
                          {capacity.utilization > 100 && (
                            <div
                              className="absolute top-0 h-full bg-red-700 opacity-50"
                              style={{
                                left: '100%',
                                width: `${((capacity.utilization - 100) / 100) * 100}%`,
                              }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Bottleneck Analysis
                  </h3>
                  <div className="space-y-3">
                    {capacityData
                      .filter((c) => c.utilization > 100)
                      .map((capacity, index) => (
                        <div
                          key={index}
                          className="bg-red-50 p-3 rounded-lg border border-red-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-red-900">{capacity.workCenter}</p>
                              <p className="text-xs text-red-700 mt-0.5">
                                Overloaded by {(capacity.requiredHours - capacity.availableHours).toFixed(0)} hours
                              </p>
                            </div>
                            <span className="px-2 py-1 bg-red-600 text-white text-xs rounded font-bold">
                              {capacity.utilization.toFixed(1)}%
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-red-800">
                              Suggested Resolutions:
                            </p>
                            <ul className="text-xs text-red-700 space-y-0.5 ml-4">
                              <li className="flex items-center gap-1">
                                <ChevronRight className="h-3 w-3" />
                                Add {Math.ceil((capacity.requiredHours - capacity.availableHours) / 8)} overtime shifts
                              </li>
                              <li className="flex items-center gap-1">
                                <ChevronRight className="h-3 w-3" />
                                Reschedule non-critical work orders
                              </li>
                              <li className="flex items-center gap-1">
                                <ChevronRight className="h-3 w-3" />
                                Consider outsourcing operations
                              </li>
                            </ul>
                          </div>
                        </div>
                      ))}

                    {capacityData.filter((c) => c.utilization > 100).length === 0 && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
                        <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                        <p className="text-sm font-medium text-green-900">
                          No Bottlenecks Detected
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          All work centers are within capacity limits
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Plan vs Actual Variance Tab */}
          {activeTab === 'variance' && (
            <div className="space-y-3">
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Plan vs Actual Performance Analysis
                </h3>
                <p className="text-sm text-purple-700">
                  Track planned production vs actual production over the last 6 months. Analyze
                  variance trends to improve future planning accuracy.
                </p>
              </div>

              {/* Variance Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Period</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900">
                        Planned Production
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900">
                        Actual Production
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900">
                        Variance (Units)
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900">
                        Variance %
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900">
                        Performance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {varianceData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.period}</td>
                        <td className="px-4 py-3 text-right">{item.planned}</td>
                        <td className="px-4 py-3 text-right font-medium">{item.actual || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`font-semibold ${
                              item.variance > 0
                                ? 'text-green-600'
                                : item.variance < 0
                                ? 'text-red-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {item.variance > 0 ? '+' : ''}
                            {item.variance}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`font-semibold ${
                              item.variancePercent > 0
                                ? 'text-green-600'
                                : item.variancePercent < 0
                                ? 'text-red-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {item.variancePercent > 0 ? '+' : ''}
                            {item.variancePercent.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.actual > 0 ? (
                            Math.abs(item.variancePercent) <= 5 ? (
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Excellent
                              </span>
                            ) : Math.abs(item.variancePercent) <= 10 ? (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                Good
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                Needs Improvement
                              </span>
                            )
                          ) : (
                            <span className="text-gray-400 text-xs">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Trend Analysis */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-blue-600" />
                    Production Trend (6 Months)
                  </h3>
                  <div className="space-y-2">
                    {varianceData
                      .filter((v) => v.actual > 0)
                      .map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <span className="text-xs font-medium text-gray-600 w-20">
                            {item.period}
                          </span>
                          <div className="flex-1 flex gap-2">
                            <div className="flex-1 bg-blue-100 rounded h-8 relative">
                              <div
                                className="bg-blue-500 h-full rounded"
                                style={{
                                  width: `${(item.planned / Math.max(...varianceData.map((v) => v.planned))) * 100}%`,
                                }}
                              >
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-blue-900">
                                  P: {item.planned}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 bg-green-100 rounded h-8 relative">
                              <div
                                className="bg-green-500 h-full rounded"
                                style={{
                                  width: `${(item.actual / Math.max(...varianceData.map((v) => v.actual))) * 100}%`,
                                }}
                              >
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-green-900">
                                  A: {item.actual}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-gray-600">Planned</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-gray-600">Actual</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    Variance Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-900">Over-Performance</span>
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-700">
                        {varianceData.filter((v) => v.variance > 0).length} months
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Produced more than planned
                      </p>
                    </div>

                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-red-900">Under-Performance</span>
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      </div>
                      <p className="text-2xl font-bold text-red-700">
                        {varianceData.filter((v) => v.variance < 0).length} months
                      </p>
                      <p className="text-xs text-red-600 mt-1">Produced less than planned</p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">Avg Accuracy</span>
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-700">
                        {(
                          varianceData
                            .filter((v) => v.actual > 0)
                            .reduce(
                              (sum, v) => sum + (100 - Math.abs(v.variancePercent)),
                              0
                            ) / varianceData.filter((v) => v.actual > 0).length
                        ).toFixed(1)}
                        %
                      </p>
                      <p className="text-xs text-blue-600 mt-1">Planning accuracy rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* What-If Scenarios Tab */}
          {activeTab === 'scenarios' && (
            <div className="space-y-3">
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  What-If Scenario Simulation
                </h3>
                <p className="text-sm text-yellow-700">
                  Test different demand and capacity scenarios to understand their impact on
                  inventory levels, ATP, and resource utilization before committing to the plan.
                </p>
              </div>

              {/* Create New Scenario */}
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                  Create New Scenario
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Scenario Name
                      </label>
                      <input
                        type="text"
                        value={scenarioName}
                        onChange={(e) => setScenarioName(e.target.value)}
                        placeholder="e.g., High Demand Season"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Demand Adjustment (%)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={demandAdjustment}
                          onChange={(e) => setDemandAdjustment(Number(e.target.value))}
                          className="flex-1"
                        />
                        <span
                          className={`font-bold text-lg w-16 text-right ${
                            demandAdjustment > 0
                              ? 'text-red-600'
                              : demandAdjustment < 0
                              ? 'text-green-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {demandAdjustment > 0 ? '+' : ''}
                          {demandAdjustment}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacity Adjustment (%)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="-30"
                          max="30"
                          value={capacityAdjustment}
                          onChange={(e) => setCapacityAdjustment(Number(e.target.value))}
                          className="flex-1"
                        />
                        <span
                          className={`font-bold text-lg w-16 text-right ${
                            capacityAdjustment > 0
                              ? 'text-green-600'
                              : capacityAdjustment < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {capacityAdjustment > 0 ? '+' : ''}
                          {capacityAdjustment}%
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={saveScenario}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save Scenario
                    </button>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Projected Impact:</h4>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Inventory Change</span>
                          <span
                            className={`font-bold ${
                              demandAdjustment * -0.5 < 0 ? 'text-red-600' : 'text-green-600'
                            }`}
                          >
                            {demandAdjustment * -0.5 > 0 ? '+' : ''}
                            {Math.round(demandAdjustment * -0.5)}%
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">ATP Change</span>
                          <span
                            className={`font-bold ${
                              demandAdjustment * -0.4 < 0 ? 'text-red-600' : 'text-green-600'
                            }`}
                          >
                            {demandAdjustment * -0.4 > 0 ? '+' : ''}
                            {Math.round(demandAdjustment * -0.4)}%
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Utilization Change</span>
                          <span
                            className={`font-bold ${
                              (demandAdjustment - capacityAdjustment) * 0.5 > 0
                                ? 'text-orange-600'
                                : 'text-green-600'
                            }`}
                          >
                            {(demandAdjustment - capacityAdjustment) * 0.5 > 0 ? '+' : ''}
                            {Math.round((demandAdjustment - capacityAdjustment) * 0.5)}%
                          </span>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-3 rounded border border-blue-200 mt-4">
                        <p className="text-xs text-blue-700">
                          <strong>Note:</strong> These are projected impacts based on historical
                          data. Actual results may vary.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Saved Scenarios */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-3 py-2 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Saved Scenarios ({scenarios.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {scenarios.map((scenario) => (
                    <div key={scenario.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {scenario.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Created: {scenario.createdDate}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                            <Eye className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-700">View</span>
                          </button>
                          <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                            <Copy className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-700">Copy</span>
                          </button>
                          <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm">
                            <Trash2 className="h-4 w-4 text-red-600" />
                            <span className="text-red-600">Delete</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-3">
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-xs font-medium text-blue-600">Demand Adj</p>
                          <p className="text-lg font-bold text-blue-900 mt-1">
                            {scenario.demandAdjustment > 0 ? '+' : ''}
                            {scenario.demandAdjustment}%
                          </p>
                        </div>

                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <p className="text-xs font-medium text-green-600">Capacity Adj</p>
                          <p className="text-lg font-bold text-green-900 mt-1">
                            {scenario.capacityAdjustment > 0 ? '+' : ''}
                            {scenario.capacityAdjustment}%
                          </p>
                        </div>

                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <p className="text-xs font-medium text-purple-600">Inventory Impact</p>
                          <p className="text-lg font-bold text-purple-900 mt-1">
                            {scenario.impact.inventoryChange > 0 ? '+' : ''}
                            {scenario.impact.inventoryChange}%
                          </p>
                        </div>

                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                          <p className="text-xs font-medium text-orange-600">ATP Impact</p>
                          <p className="text-lg font-bold text-orange-900 mt-1">
                            {scenario.impact.atpChange > 0 ? '+' : ''}
                            {scenario.impact.atpChange}%
                          </p>
                        </div>

                        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                          <p className="text-xs font-medium text-red-600">Utilization Impact</p>
                          <p className="text-lg font-bold text-red-900 mt-1">
                            {scenario.impact.utilizationChange > 0 ? '+' : ''}
                            {scenario.impact.utilizationChange}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <RunMRPModal
        isOpen={isRunMRPModalOpen}
        onClose={() => setIsRunMRPModalOpen(false)}
        onRun={handleRunMRP}
      />
      <ExportMPSModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />
      <AdjustPlanModal
        isOpen={isAdjustPlanModalOpen}
        onClose={() => {
          setIsAdjustPlanModalOpen(false);
          setSelectedProductForAdjust(null);
        }}
        product={selectedProductForAdjust}
        onSave={handleAdjustPlan}
      />
    </div>
  );
};

export default ProductionPlanningPage;
