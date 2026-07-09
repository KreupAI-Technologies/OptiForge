'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  Play,
  Download,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Settings,
  RefreshCw,
  DollarSign,
  Truck,
  Box,
  BarChart3,
  ArrowRight,
  List,
} from 'lucide-react';
import {
  RunMRPModal,
  ConfigureMRPModal,
  ViewItemDetailsModal,
  type MRPSettings,
} from '@/components/production/MRPRunModals';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import { exportToCsv } from '@/lib/export';

// TypeScript Interfaces
interface MRPRequirement {
  id: string;
  itemCode: string;
  itemName: string;
  description: string;
  category: string;
  uom: string;
  grossRequirement: number;
  scheduledReceipts: number;
  onHandInventory: number;
  allocatedQty: number;
  availableQty: number;
  safetyStock: number;
  netRequirement: number;
  plannedOrderRelease: number;
  suggestedAction: 'Purchase' | 'Transfer' | 'None';
  leadTimeDays: number;
  requiredDate: string;
  preferredVendor: string;
  unitCost: number;
  totalCost: number;
  status: 'Critical' | 'Warning' | 'Normal';
  affectedWOs: string[];
}

interface MRPRun {
  runId: string;
  runDate: string;
  planningHorizon: number;
  cutoffDate: string;
  totalItems: number;
  shortageItems: number;
  purchaseSuggestions: number;
  excessItems: number;
  status: 'Completed' | 'Running' | 'Failed';
}

interface ShortageItem {
  id: string;
  itemCode: string;
  itemName: string;
  shortageQty: number;
  requiredDate: string;
  daysUntilRequired: number;
  severity: 'Critical' | 'High' | 'Medium';
  affectedWOs: string[];
  impactDescription: string;
  recommendedAction: string;
}

interface PurchaseSuggestion {
  id: string;
  itemCode: string;
  itemName: string;
  suggestedQty: number;
  uom: string;
  preferredVendor: string;
  unitCost: number;
  totalCost: number;
  requiredDate: string;
  leadTimeDays: number;
  orderByDate: string;
  priority: 'High' | 'Medium' | 'Low';
  selected: boolean;
}

interface ExcessStock {
  id: string;
  itemCode: string;
  itemName: string;
  excessQty: number;
  valueAmount: number;
  lastMovementDate: string;
  daysSinceMovement: number;
  classification: 'Slow Moving' | 'Obsolete' | 'Excess';
  suggestedDisposition: string;
}

interface TimePhase {
  week: string;
  weekStart: string;
  weekEnd: string;
  grossRequirement: number;
  scheduledReceipts: number;
  projectedOnHand: number;
  plannedOrderRelease: number;
  status: 'OK' | 'Warning' | 'Critical';
}

const MRPPage: React.FC = () => {
  // State Management
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunDate, setLastRunDate] = useState('2025-10-17 09:30:00');
  const [activeTab, setActiveTab] = useState<'requirements' | 'shortages' | 'purchases' | 'excess' | 'timephased'>('requirements');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Critical' | 'Warning' | 'Normal'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isRunMRPOpen, setIsRunMRPOpen] = useState(false);
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [isViewItemOpen, setIsViewItemOpen] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState<MRPRequirement | null>(null);

  // Live data loaded from the NestJS backend (production/mrp-runs,
  // production/planned-orders, production/shortage-records). Used to drive the
  // dashboard summary stats and last-run info; the tabbed detail views below
  // still render their reference/mock rows until per-tab endpoints exist.
  const [mrpRuns, setMrpRuns] = useState<any[]>([]);
  const [livePlannedOrders, setLivePlannedOrders] = useState<any[]>([]);
  const [liveShortages, setLiveShortages] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [prBusy, setPrBusy] = useState(false);
  const [prMessage, setPrMessage] = useState<string | null>(null);

  // MRP Configuration State
  const [mrpConfig, setMrpConfig] = useState({
    planningHorizon: 12,
    leadTimeConsideration: true,
    safetyStockConsideration: true,
    reorderPointMethod: 'Dynamic',
  });

  // Mock Data - MRP Requirements
  const [mrpRequirements] = useState<MRPRequirement[]>([
    {
      id: 'MRP001',
      itemCode: 'RM-STEEL-001',
      itemName: 'Steel Rod 12mm',
      description: 'Mild Steel Rod 12mm x 6m',
      category: 'Raw Material',
      uom: 'KG',
      grossRequirement: 5000,
      scheduledReceipts: 1000,
      onHandInventory: 800,
      allocatedQty: 300,
      availableQty: 500,
      safetyStock: 500,
      netRequirement: 3200,
      plannedOrderRelease: 3500,
      suggestedAction: 'Purchase',
      leadTimeDays: 7,
      requiredDate: '2025-10-24',
      preferredVendor: 'Tata Steel',
      unitCost: 65,
      totalCost: 227500,
      status: 'Critical',
      affectedWOs: ['WO-2024-1034', 'WO-2024-1035', 'WO-2024-1036'],
    },
    {
      id: 'MRP002',
      itemCode: 'RM-ALUM-002',
      itemName: 'Aluminum Sheet',
      description: 'Aluminum Sheet 2mm x 4x8',
      category: 'Raw Material',
      uom: 'SHT',
      grossRequirement: 200,
      scheduledReceipts: 50,
      onHandInventory: 80,
      allocatedQty: 20,
      availableQty: 60,
      safetyStock: 30,
      netRequirement: 40,
      plannedOrderRelease: 50,
      suggestedAction: 'Purchase',
      leadTimeDays: 10,
      requiredDate: '2025-10-27',
      preferredVendor: 'Hindalco Industries',
      unitCost: 1200,
      totalCost: 60000,
      status: 'Warning',
      affectedWOs: ['WO-2024-1037'],
    },
    {
      id: 'MRP003',
      itemCode: 'COMP-BEAR-003',
      itemName: 'Ball Bearing 6205',
      description: 'Deep Groove Ball Bearing 6205',
      category: 'Component',
      uom: 'NOS',
      grossRequirement: 500,
      scheduledReceipts: 200,
      onHandInventory: 150,
      allocatedQty: 50,
      availableQty: 100,
      safetyStock: 100,
      netRequirement: 150,
      plannedOrderRelease: 200,
      suggestedAction: 'Purchase',
      leadTimeDays: 5,
      requiredDate: '2025-10-22',
      preferredVendor: 'SKF India',
      unitCost: 180,
      totalCost: 36000,
      status: 'Critical',
      affectedWOs: ['WO-2024-1038', 'WO-2024-1039'],
    },
    {
      id: 'MRP004',
      itemCode: 'RM-PAINT-004',
      itemName: 'Industrial Paint Red',
      description: 'Enamel Paint Red 20L',
      category: 'Consumable',
      uom: 'LTR',
      grossRequirement: 100,
      scheduledReceipts: 0,
      onHandInventory: 80,
      allocatedQty: 10,
      availableQty: 70,
      safetyStock: 20,
      netRequirement: 10,
      plannedOrderRelease: 50,
      suggestedAction: 'Purchase',
      leadTimeDays: 3,
      requiredDate: '2025-10-20',
      preferredVendor: 'Asian Paints',
      unitCost: 350,
      totalCost: 17500,
      status: 'Normal',
      affectedWOs: ['WO-2024-1040'],
    },
    {
      id: 'MRP005',
      itemCode: 'COMP-MOTOR-005',
      itemName: 'AC Motor 3HP',
      description: '3HP 3 Phase AC Motor',
      category: 'Component',
      uom: 'NOS',
      grossRequirement: 30,
      scheduledReceipts: 10,
      onHandInventory: 15,
      allocatedQty: 5,
      availableQty: 10,
      safetyStock: 5,
      netRequirement: 10,
      plannedOrderRelease: 15,
      suggestedAction: 'Purchase',
      leadTimeDays: 14,
      requiredDate: '2025-10-31',
      preferredVendor: 'Crompton Greaves',
      unitCost: 12500,
      totalCost: 187500,
      status: 'Warning',
      affectedWOs: ['WO-2024-1041'],
    },
    {
      id: 'MRP006',
      itemCode: 'RM-COPPER-006',
      itemName: 'Copper Wire 2.5mm',
      description: 'Copper Wire 2.5mm PVC Insulated',
      category: 'Raw Material',
      uom: 'MTR',
      grossRequirement: 2000,
      scheduledReceipts: 500,
      onHandInventory: 1200,
      allocatedQty: 200,
      availableQty: 1000,
      safetyStock: 300,
      netRequirement: 0,
      plannedOrderRelease: 0,
      suggestedAction: 'None',
      leadTimeDays: 7,
      requiredDate: '2025-11-05',
      preferredVendor: 'Polycab Wires',
      unitCost: 45,
      totalCost: 0,
      status: 'Normal',
      affectedWOs: [],
    },
    {
      id: 'MRP007',
      itemCode: 'COMP-VALVE-007',
      itemName: 'Hydraulic Valve',
      description: 'Hydraulic Control Valve 1/2"',
      category: 'Component',
      uom: 'NOS',
      grossRequirement: 80,
      scheduledReceipts: 0,
      onHandInventory: 20,
      allocatedQty: 10,
      availableQty: 10,
      safetyStock: 15,
      netRequirement: 65,
      plannedOrderRelease: 80,
      suggestedAction: 'Purchase',
      leadTimeDays: 12,
      requiredDate: '2025-10-29',
      preferredVendor: 'Bosch Rexroth',
      unitCost: 2800,
      totalCost: 224000,
      status: 'Critical',
      affectedWOs: ['WO-2024-1042', 'WO-2024-1043'],
    },
    {
      id: 'MRP008',
      itemCode: 'RM-RUBBER-008',
      itemName: 'Rubber Gasket Material',
      description: 'NBR Rubber Sheet 3mm',
      category: 'Raw Material',
      uom: 'KG',
      grossRequirement: 150,
      scheduledReceipts: 50,
      onHandInventory: 60,
      allocatedQty: 20,
      availableQty: 40,
      safetyStock: 25,
      netRequirement: 35,
      plannedOrderRelease: 50,
      suggestedAction: 'Purchase',
      leadTimeDays: 6,
      requiredDate: '2025-10-23',
      preferredVendor: 'Supreme Rubber',
      unitCost: 420,
      totalCost: 21000,
      status: 'Warning',
      affectedWOs: ['WO-2024-1044'],
    },
  ]);

  // Mock Data - Shortages
  const [shortages] = useState<ShortageItem[]>([
    {
      id: 'SH001',
      itemCode: 'RM-STEEL-001',
      itemName: 'Steel Rod 12mm',
      shortageQty: 3200,
      requiredDate: '2025-10-24',
      daysUntilRequired: 7,
      severity: 'Critical',
      affectedWOs: ['WO-2024-1034', 'WO-2024-1035', 'WO-2024-1036'],
      impactDescription: 'Will stop production of 3 work orders. Affects customer orders CO-2024-234, CO-2024-235',
      recommendedAction: 'Emergency purchase from Tata Steel. Expedite delivery with premium freight.',
    },
    {
      id: 'SH002',
      itemCode: 'COMP-BEAR-003',
      itemName: 'Ball Bearing 6205',
      shortageQty: 150,
      requiredDate: '2025-10-22',
      daysUntilRequired: 5,
      severity: 'Critical',
      affectedWOs: ['WO-2024-1038', 'WO-2024-1039'],
      impactDescription: 'Assembly line will be blocked. 2 customer deliveries at risk.',
      recommendedAction: 'Immediate purchase order. Check alternative suppliers if SKF cannot deliver.',
    },
    {
      id: 'SH003',
      itemCode: 'COMP-VALVE-007',
      itemName: 'Hydraulic Valve',
      shortageQty: 65,
      requiredDate: '2025-10-29',
      daysUntilRequired: 12,
      severity: 'High',
      affectedWOs: ['WO-2024-1042', 'WO-2024-1043'],
      impactDescription: 'Hydraulic assembly work will be delayed. Lead time is critical.',
      recommendedAction: 'Place purchase order immediately. 12-day lead time leaves no buffer.',
    },
    {
      id: 'SH004',
      itemCode: 'RM-ALUM-002',
      itemName: 'Aluminum Sheet',
      shortageQty: 40,
      requiredDate: '2025-10-27',
      daysUntilRequired: 10,
      severity: 'Medium',
      affectedWOs: ['WO-2024-1037'],
      impactDescription: 'Sheet metal work will be delayed. 1 work order affected.',
      recommendedAction: 'Schedule purchase order. Monitor lead time closely.',
    },
  ]);

  // Mock Data - Purchase Suggestions
  const [purchaseSuggestions, setPurchaseSuggestions] = useState<PurchaseSuggestion[]>([
    {
      id: 'PS001',
      itemCode: 'RM-STEEL-001',
      itemName: 'Steel Rod 12mm',
      suggestedQty: 3500,
      uom: 'KG',
      preferredVendor: 'Tata Steel',
      unitCost: 65,
      totalCost: 227500,
      requiredDate: '2025-10-24',
      leadTimeDays: 7,
      orderByDate: '2025-10-17',
      priority: 'High',
      selected: false,
    },
    {
      id: 'PS002',
      itemCode: 'COMP-BEAR-003',
      itemName: 'Ball Bearing 6205',
      suggestedQty: 200,
      uom: 'NOS',
      preferredVendor: 'SKF India',
      unitCost: 180,
      totalCost: 36000,
      requiredDate: '2025-10-22',
      leadTimeDays: 5,
      orderByDate: '2025-10-17',
      priority: 'High',
      selected: false,
    },
    {
      id: 'PS003',
      itemCode: 'COMP-VALVE-007',
      itemName: 'Hydraulic Valve',
      suggestedQty: 80,
      uom: 'NOS',
      preferredVendor: 'Bosch Rexroth',
      unitCost: 2800,
      totalCost: 224000,
      requiredDate: '2025-10-29',
      leadTimeDays: 12,
      orderByDate: '2025-10-17',
      priority: 'High',
      selected: false,
    },
    {
      id: 'PS004',
      itemCode: 'RM-ALUM-002',
      itemName: 'Aluminum Sheet',
      suggestedQty: 50,
      uom: 'SHT',
      preferredVendor: 'Hindalco Industries',
      unitCost: 1200,
      totalCost: 60000,
      requiredDate: '2025-10-27',
      leadTimeDays: 10,
      orderByDate: '2025-10-17',
      priority: 'Medium',
      selected: false,
    },
    {
      id: 'PS005',
      itemCode: 'COMP-MOTOR-005',
      itemName: 'AC Motor 3HP',
      suggestedQty: 15,
      uom: 'NOS',
      preferredVendor: 'Crompton Greaves',
      unitCost: 12500,
      totalCost: 187500,
      requiredDate: '2025-10-31',
      leadTimeDays: 14,
      orderByDate: '2025-10-17',
      priority: 'Medium',
      selected: false,
    },
    {
      id: 'PS006',
      itemCode: 'RM-PAINT-004',
      itemName: 'Industrial Paint Red',
      suggestedQty: 50,
      uom: 'LTR',
      preferredVendor: 'Asian Paints',
      unitCost: 350,
      totalCost: 17500,
      requiredDate: '2025-10-20',
      leadTimeDays: 3,
      orderByDate: '2025-10-17',
      priority: 'Low',
      selected: false,
    },
    {
      id: 'PS007',
      itemCode: 'RM-RUBBER-008',
      itemName: 'Rubber Gasket Material',
      suggestedQty: 50,
      uom: 'KG',
      preferredVendor: 'Supreme Rubber',
      unitCost: 420,
      totalCost: 21000,
      requiredDate: '2025-10-23',
      leadTimeDays: 6,
      orderByDate: '2025-10-17',
      priority: 'Medium',
      selected: false,
    },
  ]);

  // Mock Data - Excess Stock
  const [excessStock] = useState<ExcessStock[]>([
    {
      id: 'EX001',
      itemCode: 'RM-BRASS-009',
      itemName: 'Brass Rod 16mm',
      excessQty: 500,
      valueAmount: 45000,
      lastMovementDate: '2025-06-15',
      daysSinceMovement: 124,
      classification: 'Slow Moving',
      suggestedDisposition: 'Use in alternative products or return to vendor',
    },
    {
      id: 'EX002',
      itemCode: 'COMP-GEAR-010',
      itemName: 'Gear Wheel 24T',
      excessQty: 200,
      valueAmount: 38000,
      lastMovementDate: '2025-04-20',
      daysSinceMovement: 180,
      classification: 'Obsolete',
      suggestedDisposition: 'Scrap or sell as dead stock',
    },
    {
      id: 'EX003',
      itemCode: 'RM-PLASTIC-011',
      itemName: 'ABS Plastic Granules',
      excessQty: 800,
      valueAmount: 56000,
      lastMovementDate: '2025-08-10',
      daysSinceMovement: 68,
      classification: 'Excess',
      suggestedDisposition: 'Plan production campaigns to consume excess',
    },
    {
      id: 'EX004',
      itemCode: 'COMP-SPRING-012',
      itemName: 'Compression Spring 50mm',
      excessQty: 1000,
      valueAmount: 15000,
      lastMovementDate: '2025-05-05',
      daysSinceMovement: 165,
      classification: 'Slow Moving',
      suggestedDisposition: 'Transfer to other plants or adjust safety stock',
    },
  ]);

  // Mock Data - Time Phased View
  const [timePhases] = useState<TimePhase[]>([
    {
      week: 'Week 42',
      weekStart: '2025-10-13',
      weekEnd: '2025-10-19',
      grossRequirement: 1200,
      scheduledReceipts: 500,
      projectedOnHand: 800,
      plannedOrderRelease: 0,
      status: 'OK',
    },
    {
      week: 'Week 43',
      weekStart: '2025-10-20',
      weekEnd: '2025-10-26',
      grossRequirement: 2500,
      scheduledReceipts: 1000,
      projectedOnHand: -900,
      plannedOrderRelease: 2000,
      status: 'Critical',
    },
    {
      week: 'Week 44',
      weekStart: '2025-10-27',
      weekEnd: '2025-11-02',
      grossRequirement: 1800,
      scheduledReceipts: 2000,
      projectedOnHand: 300,
      plannedOrderRelease: 0,
      status: 'Warning',
    },
    {
      week: 'Week 45',
      weekStart: '2025-11-03',
      weekEnd: '2025-11-09',
      grossRequirement: 1500,
      scheduledReceipts: 0,
      projectedOnHand: -1200,
      plannedOrderRelease: 1500,
      status: 'Critical',
    },
    {
      week: 'Week 46',
      weekStart: '2025-11-10',
      weekEnd: '2025-11-16',
      grossRequirement: 1000,
      scheduledReceipts: 1500,
      projectedOnHand: 800,
      plannedOrderRelease: 0,
      status: 'OK',
    },
    {
      week: 'Week 47',
      weekStart: '2025-11-17',
      weekEnd: '2025-11-23',
      grossRequirement: 1300,
      scheduledReceipts: 0,
      projectedOnHand: -500,
      plannedOrderRelease: 1500,
      status: 'Critical',
    },
  ]);

  // Calculate Statistics — prefer live backend counts, fall back to reference rows.
  const totalRequirements = mrpRequirements.reduce((sum, item) => sum + item.netRequirement, 0);
  const shortageCount =
    (liveShortages?.length ?? 0) > 0
      ? liveShortages.length
      : mrpRequirements.filter((item) => item.netRequirement > 0).length;
  const purchaseSuggestionsCount =
    (livePlannedOrders?.length ?? 0) > 0 ? livePlannedOrders.length : purchaseSuggestions.length;
  const excessStockCount = excessStock.length;
  const totalPurchaseValue = purchaseSuggestions.reduce((sum, item) => sum + item.totalCost, 0);

  // Filter Requirements
  const filteredRequirements = mrpRequirements.filter((item) => {
    const matchesFilter = filterStatus === 'All' || item.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Load live MRP dashboard data from the backend.
  const loadMrpData = useCallback(async () => {
    setLoadError(null);
    try {
      const [runs, orders, shortageRecords] = await Promise.all([
        ProductionOrphanService.getMrpRuns(),
        ProductionOrphanService.getPlannedOrders(),
        ProductionOrphanService.getShortageRecords(),
      ]);
      const runsArr = Array.isArray(runs) ? runs : [];
      setMrpRuns(runsArr);
      setLivePlannedOrders(Array.isArray(orders) ? orders : []);
      setLiveShortages(Array.isArray(shortageRecords) ? shortageRecords : []);
      const latestRun = runsArr[0];
      const runAt = latestRun?.runDate ?? latestRun?.completedAt ?? latestRun?.createdAt;
      if (runAt) setLastRunDate(String(runAt));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load MRP data');
      setMrpRuns([]);
      setLivePlannedOrders([]);
      setLiveShortages([]);
    }
  }, []);

  useEffect(() => {
    loadMrpData();
  }, [loadMrpData]);

  // Run MRP — create a run then execute it against the backend, then refresh.
  const handleRunMRP = async (config?: any) => {
    setIsRunning(true);
    setLoadError(null);
    try {
      const created = await ProductionOrphanService.createMrpRun({
        planningHorizon: config?.planningHorizon ?? mrpConfig.planningHorizon,
        leadTimeConsideration: config?.leadTimeConsideration ?? mrpConfig.leadTimeConsideration,
        safetyStockConsideration: config?.safetyStockConsideration ?? mrpConfig.safetyStockConsideration,
        reorderPointMethod: config?.reorderPointMethod ?? mrpConfig.reorderPointMethod,
      });
      const runId = created?.id ?? created?.runId;
      if (runId) {
        await ProductionOrphanService.executeMrpRun(String(runId));
      }
      await loadMrpData();
      setLastRunDate(new Date().toLocaleString());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to run MRP');
    } finally {
      setIsRunning(false);
    }
  };

  // Toggle Purchase Suggestion Selection
  const togglePurchaseSelection = (id: string) => {
    setPurchaseSuggestions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  // Toggle All Purchase Selections
  const toggleAllPurchases = () => {
    const allSelected = purchaseSuggestions.every((item) => item.selected);
    setPurchaseSuggestions((prev) => prev.map((item) => ({ ...item, selected: !allSelected })));
  };

  // Create Bulk Purchase Requisitions — persists real purchase requisitions via
  // the production planning-actions endpoint (POST /production/mrp/bulk-requisitions).
  const handleCreateBulkPR = async () => {
    const selectedItems = purchaseSuggestions.filter((item) => item.selected);
    if (selectedItems.length === 0) {
      alert('Please select at least one item to create purchase requisitions.');
      return;
    }
    setPrBusy(true);
    setPrMessage(null);
    setLoadError(null);
    try {
      const created = await ProductionOrphanService.createBulkRequisitions({
        consolidateByVendor: true,
        items: selectedItems.map((item) => ({
          itemCode: item.itemCode,
          itemName: item.itemName,
          uom: item.uom,
          quantity: item.suggestedQty,
          estimatedUnitPrice: item.unitCost,
          requiredDate: item.requiredDate,
          preferredVendor: item.preferredVendor,
          priority: item.priority,
        })),
        priority:
          selectedItems.some((i) => i.priority === 'High') ? 'High' : 'Medium',
      });
      const count = Array.isArray(created) ? created.length : 0;
      setPrMessage(
        `Created ${count} purchase requisition${count === 1 ? '' : 's'} from ${selectedItems.length} selected item${selectedItems.length === 1 ? '' : 's'}.`,
      );
      // Clear selection after successful creation.
      setPurchaseSuggestions((prev) => prev.map((item) => ({ ...item, selected: false })));
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'Failed to create purchase requisitions.',
      );
    } finally {
      setPrBusy(false);
    }
  };

  // Export the currently-active tab's rows to CSV.
  const handleExportToExcel = () => {
    const map: Record<typeof activeTab, { name: string; rows: readonly object[] }> = {
      requirements: { name: 'mrp-requirements', rows: filteredRequirements },
      shortages: { name: 'mrp-shortages', rows: shortages },
      purchases: { name: 'mrp-purchase-suggestions', rows: purchaseSuggestions },
      excess: { name: 'mrp-excess-stock', rows: excessStock },
      timephased: { name: 'mrp-time-phased', rows: timePhases },
    };
    const target = map[activeTab];
    exportToCsv(target.name, target.rows);
  };

  // Get Status Badge
  const getStatusBadge = (status: string) => {
    const badges = {
      Critical: 'bg-red-100 text-red-800 border-red-200',
      Warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Normal: 'bg-green-100 text-green-800 border-green-200',
      High: 'bg-orange-100 text-orange-800 border-orange-200',
      Medium: 'bg-blue-100 text-blue-800 border-blue-200',
      Low: 'bg-gray-100 text-gray-800 border-gray-200',
      OK: 'bg-green-100 text-green-800 border-green-200',
    };
    return badges[status as keyof typeof badges] || badges.Normal;
  };

  // Modal Handler Functions
  const handleOpenRunMRP = () => {
    setIsRunMRPOpen(true);
  };

  const handleConfigure = () => {
    setIsConfigureOpen(true);
  };

  const handleViewItem = (item: MRPRequirement) => {
    setSelectedItemForModal(item);
    setIsViewItemOpen(true);
  };

  const handleRunMRPSubmit = async (config: any) => {
    setIsRunMRPOpen(false);
    // Create + execute the MRP run against the backend, then refresh dashboard data.
    await handleRunMRP(config);
  };

  const handleSaveConfig = (settings: MRPSettings) => {
    // Configuration is applied to local run parameters; there is no dedicated
    // MRP-config persistence endpoint on the shared production service yet.
    setMrpConfig({
      planningHorizon: settings.planningHorizon,
      leadTimeConsideration: settings.leadTimeConsideration,
      safetyStockConsideration: settings.safetyStockConsideration,
      reorderPointMethod: settings.reorderPointMethod,
    });
    setIsConfigureOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Material Requirements Planning (MRP)</h1>
            <p className="text-gray-600 mt-1">
              Plan material requirements based on production schedules and inventory levels
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportToExcel}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={handleConfigure}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
            <button
              onClick={handleOpenRunMRP}
              disabled={isRunning}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run MRP
                </>
              )}
            </button>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Last run: {lastRunDate}
        </div>
        {loadError && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4" />
            {loadError}
          </div>
        )}
        {prMessage && (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            <span>{prMessage}</span>
            <button onClick={() => setPrMessage(null)} className="text-green-600 hover:text-green-900">Dismiss</button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white rounded-lg shadow p-3 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requirements</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalRequirements.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Units across all items</p>
            </div>
            <Package className="w-12 h-12 text-blue-500 opacity-80" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Shortages</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{shortageCount}</p>
              <p className="text-xs text-gray-500 mt-1">Items with net requirements</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-500 opacity-80" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Purchase Suggestions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{purchaseSuggestionsCount}</p>
              <p className="text-xs text-gray-500 mt-1">₹{totalPurchaseValue.toLocaleString()}</p>
            </div>
            <ShoppingCart className="w-12 h-12 text-green-500 opacity-80" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Excess Stock</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{excessStockCount}</p>
              <p className="text-xs text-gray-500 mt-1">Slow moving items</p>
            </div>
            <TrendingUp className="w-12 h-12 text-yellow-500 opacity-80" />
          </div>
        </div>
      </div>

      {/* MRP Configuration */}
      <div className="bg-white rounded-lg shadow mb-3 p-3">
        <div className="flex items-center mb-2">
          <Settings className="w-5 h-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">MRP Run Configuration</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Planning Horizon (weeks)
            </label>
            <input
              type="number"
              value={mrpConfig.planningHorizon}
              onChange={(e) => setMrpConfig({ ...mrpConfig, planningHorizon: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={mrpConfig.leadTimeConsideration}
              onChange={(e) => setMrpConfig({ ...mrpConfig, leadTimeConsideration: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">Lead Time Consideration</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={mrpConfig.safetyStockConsideration}
              onChange={(e) => setMrpConfig({ ...mrpConfig, safetyStockConsideration: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">Safety Stock Consideration</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reorder Point Method
            </label>
            <select
              value={mrpConfig.reorderPointMethod}
              onChange={(e) => setMrpConfig({ ...mrpConfig, reorderPointMethod: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>Dynamic</option>
              <option>Fixed</option>
              <option>Time-Based</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-3">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { key: 'requirements', label: 'Material Requirements', icon: List },
              { key: 'shortages', label: 'Shortage Analysis', icon: AlertTriangle },
              { key: 'purchases', label: 'Purchase Suggestions', icon: ShoppingCart },
              { key: 'excess', label: 'Excess Stock', icon: Box },
              { key: 'timephased', label: 'Time-Phased View', icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Material Requirements Tab */}
        {activeTab === 'requirements' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
                  />
                  <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option>All</option>
                  <option>Critical</option>
                  <option>Warning</option>
                  <option>Normal</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredRequirements.length} of {mrpRequirements.length} items
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross Req</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Sch Receipts</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">On Hand</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Available</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Safety Stock</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Req</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Planned Order</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequirements.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewItem(item)}
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{item.itemCode}</div>
                        <div className="text-xs text-gray-500">{item.category}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{item.itemName}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm text-gray-900">{item.grossRequirement.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{item.uom}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        {item.scheduledReceipts.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        {item.onHandInventory.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {item.availableQty.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">
                        {item.safetyStock.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div
                          className={`text-sm font-medium ${
                            item.netRequirement > 0 ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {item.netRequirement.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm font-medium text-blue-600">
                          {item.plannedOrderRelease.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.suggestedAction === 'Purchase'
                              ? 'bg-blue-100 text-blue-800'
                              : item.suggestedAction === 'Transfer'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {item.suggestedAction}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center text-sm text-gray-900">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.leadTimeDays}d
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.requiredDate}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedItem && (
              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Additional Details</h3>
                    {(() => {
                      const item = mrpRequirements.find((r) => r.id === selectedItem);
                      return item ? (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Preferred Vendor:</span>
                            <span className="ml-2 font-medium">{item.preferredVendor}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Unit Cost:</span>
                            <span className="ml-2 font-medium">₹{item.unitCost.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Cost:</span>
                            <span className="ml-2 font-medium">₹{item.totalCost.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Affected Work Orders:</span>
                            <span className="ml-2 font-medium">{item.affectedWOs.join(', ')}</span>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Shortage Analysis Tab */}
        {activeTab === 'shortages' && (
          <div className="p-6">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Critical Shortages</h3>
              <p className="text-sm text-gray-600">
                Items that will stop production if not procured immediately
              </p>
            </div>

            <div className="space-y-2">
              {shortages.map((shortage) => (
                <div
                  key={shortage.id}
                  className={`border-l-4 rounded-lg p-3 ${
                    shortage.severity === 'Critical'
                      ? 'bg-red-50 border-red-500'
                      : shortage.severity === 'High'
                      ? 'bg-orange-50 border-orange-500'
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <AlertTriangle
                          className={`w-5 h-5 mr-2 ${
                            shortage.severity === 'Critical'
                              ? 'text-red-600'
                              : shortage.severity === 'High'
                              ? 'text-orange-600'
                              : 'text-yellow-600'
                          }`}
                        />
                        <h4 className="text-base font-semibold text-gray-900">
                          {shortage.itemCode} - {shortage.itemName}
                        </h4>
                        <span
                          className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                            shortage.severity
                          )}`}
                        >
                          {shortage.severity}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                        <div>
                          <p className="text-xs text-gray-600">Shortage Quantity</p>
                          <p className="text-sm font-semibold text-red-600">
                            {shortage.shortageQty.toLocaleString()} units
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Required Date</p>
                          <p className="text-sm font-medium text-gray-900">{shortage.requiredDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Days Until Required</p>
                          <p className="text-sm font-medium text-gray-900">
                            {shortage.daysUntilRequired} days
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Affected Work Orders</p>
                          <p className="text-sm font-medium text-gray-900">
                            {shortage.affectedWOs.length} WOs
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-1">Impact Analysis</p>
                        <p className="text-sm text-gray-900">{shortage.impactDescription}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Recommended Action</p>
                          <p className="text-sm font-medium text-blue-600">{shortage.recommendedAction}</p>
                        </div>
                        <button className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                          Create Emergency PO
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Purchase Suggestions Tab */}
        {activeTab === 'purchases' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Purchase Suggestions</h3>
                <p className="text-sm text-gray-600">
                  System-generated purchase recommendations based on MRP run
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleAllPurchases}
                  className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
                >
                  {purchaseSuggestions.every((item) => item.selected) ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={handleCreateBulkPR}
                  disabled={prBusy}
                  className="flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {prBusy
                    ? 'Creating…'
                    : `Create Bulk PR (${purchaseSuggestions.filter((item) => item.selected).length})`}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={purchaseSuggestions.every((item) => item.selected)}
                        onChange={toggleAllPurchases}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order By</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {purchaseSuggestions.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => togglePurchaseSelection(item.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{item.itemCode}</div>
                        <div className="text-xs text-gray-500">{item.itemName}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm text-gray-900">{item.suggestedQty.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{item.uom}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center text-sm text-gray-900">
                          <Truck className="w-3 h-3 mr-1" />
                          {item.preferredVendor}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        ₹{item.unitCost.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{item.totalCost.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.requiredDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center text-sm text-gray-900">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.leadTimeDays}d
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-red-600">{item.orderByDate}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                            item.priority
                          )}`}
                        >
                          {item.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-right font-semibold text-gray-900">
                      Total Purchase Value:
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-base font-bold text-gray-900">
                        ₹{totalPurchaseValue.toLocaleString()}
                      </div>
                    </td>
                    <td colSpan={4}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Excess Stock Tab */}
        {activeTab === 'excess' && (
          <div className="p-6">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Excess Stock Alerts</h3>
              <p className="text-sm text-gray-600">
                Slow moving, obsolete, and excess inventory requiring action
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Excess Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Movement</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Days</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classification</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Suggested Disposition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {excessStock.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{item.itemCode}</div>
                        <div className="text-xs text-gray-500">{item.itemName}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {item.excessQty.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        ₹{item.valueAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.lastMovementDate}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium text-red-600">{item.daysSinceMovement}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.classification === 'Obsolete'
                              ? 'bg-red-100 text-red-800'
                              : item.classification === 'Slow Moving'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {item.classification}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.suggestedDisposition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Excess Stock Summary</h4>
                  <p className="text-sm text-gray-700">
                    Total excess stock value: ₹
                    {excessStock.reduce((sum, item) => sum + item.valueAmount, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    Recommended actions: Review slow-moving items, plan consumption campaigns, adjust safety stock
                    levels, or dispose of obsolete inventory.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Time-Phased View Tab */}
        {activeTab === 'timephased' && (
          <div className="p-6">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Time-Phased Material View</h3>
              <p className="text-sm text-gray-600">
                Weekly projection of material requirements and availability
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Week</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Range</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Gross Requirement
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Scheduled Receipts
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Projected On Hand
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Planned Order Release
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {timePhases.map((phase, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{phase.week}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {phase.weekStart} to {phase.weekEnd}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        {phase.grossRequirement.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-green-600 font-medium">
                        {phase.scheduledReceipts.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`text-sm font-medium ${
                            phase.projectedOnHand < 0 ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {phase.projectedOnHand.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium text-blue-600">
                          {phase.plannedOrderRelease > 0 ? phase.plannedOrderRelease.toLocaleString() : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
                            phase.status
                          )}`}
                        >
                          {phase.status === 'OK' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {phase.status === 'Warning' && <AlertCircle className="w-3 h-3 mr-1" />}
                          {phase.status === 'Critical' && <XCircle className="w-3 h-3 mr-1" />}
                          {phase.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="text-sm font-semibold text-gray-900">Planning Horizon</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900">{mrpConfig.planningHorizon} weeks</p>
                <p className="text-xs text-gray-600 mt-1">Forward looking projection</p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="text-sm font-semibold text-gray-900">Healthy Weeks</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {timePhases.filter((p) => p.status === 'OK').length}
                </p>
                <p className="text-xs text-gray-600 mt-1">Sufficient inventory</p>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <h4 className="text-sm font-semibold text-gray-900">Critical Weeks</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {timePhases.filter((p) => p.status === 'Critical').length}
                </p>
                <p className="text-xs text-gray-600 mt-1">Negative inventory projected</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <RunMRPModal
        isOpen={isRunMRPOpen}
        onClose={() => setIsRunMRPOpen(false)}
        onRun={handleRunMRPSubmit}
      />

      <ConfigureMRPModal
        isOpen={isConfigureOpen}
        onClose={() => setIsConfigureOpen(false)}
        onSave={handleSaveConfig}
        currentSettings={{
          planningHorizon: mrpConfig.planningHorizon,
          leadTimeConsideration: mrpConfig.leadTimeConsideration,
          safetyStockConsideration: mrpConfig.safetyStockConsideration,
          reorderPointMethod: mrpConfig.reorderPointMethod,
          autoApproveThreshold: 10000,
          criticalShortageThreshold: 7,
          excessStockThreshold: 150,
        }}
      />

      <ViewItemDetailsModal
        isOpen={isViewItemOpen}
        onClose={() => setIsViewItemOpen(false)}
        item={selectedItemForModal}
      />
    </div>
  );
};

export default MRPPage;
