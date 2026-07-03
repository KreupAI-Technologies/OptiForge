import { apiClient } from '../api/client';

// ==================== TypeScript Interfaces ====================

export type MRPRunStatus = 'pending' | 'running' | 'completed' | 'failed';
export type PlannedOrderStatus = 'planned' | 'firmed' | 'released' | 'cancelled';
export type PlannedOrderType = 'purchase' | 'production' | 'transfer';
export type ShortageStatus = 'open' | 'resolved' | 'escalated';
export type ShortageSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface MRPRun {
  id: string;
  companyId: string;
  runNumber: string;
  runType: 'full' | 'net_change' | 'selective';
  status: MRPRunStatus;
  runStartedAt?: string;
  runCompletedAt?: string;
  parameters: {
    planningHorizon: number;
    regenerationType: string;
    includeSafetyStock: boolean;
    includeOpenOrders: boolean;
    planItems?: string[];
  };
  summary?: {
    itemsProcessed: number;
    plannedOrdersCreated: number;
    shortagesIdentified: number;
    rescheduleMessages: number;
    errors: number;
  };
  messages?: {
    type: 'action' | 'warning' | 'exception';
    itemId: string;
    message: string;
    suggestedAction: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  createdBy: string;
  createdAt: string;
}

export interface PlannedOrder {
  id: string;
  companyId: string;
  orderNumber: string;
  orderType: PlannedOrderType;
  status: PlannedOrderStatus;
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  uom: string;
  plannedStartDate: string;
  plannedEndDate: string;
  requiredDate: string;
  mrpRunId?: string;
  demandSource?: {
    type: 'sales_order' | 'forecast' | 'safety_stock' | 'work_order';
    sourceId: string;
    sourceNumber: string;
  };
  supplier?: {
    supplierId: string;
    supplierName: string;
    leadTimeDays: number;
  };
  workCenter?: {
    workCenterId: string;
    workCenterName: string;
  };
  releasedOrderId?: string;
  firmedBy?: string;
  firmedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShortageRecord {
  id: string;
  companyId: string;
  shortageNumber: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  requiredQuantity: number;
  availableQuantity: number;
  shortageQuantity: number;
  uom: string;
  requiredDate: string;
  status: ShortageStatus;
  severity: ShortageSeverity;
  demandSource: {
    type: string;
    sourceId: string;
    sourceNumber: string;
  };
  impactedOrders?: {
    orderId: string;
    orderNumber: string;
    orderType: string;
    impactLevel: 'direct' | 'indirect';
  }[];
  resolutionOptions?: {
    option: string;
    description: string;
    cost: number;
    leadTime: number;
    isRecommended: boolean;
  }[];
  selectedResolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdBy: string;
  createdAt: string;
}

// ==================== Mock Data ====================

const MOCK_MRP_RUNS: MRPRun[] = [
  {
    id: 'mrp-001',
    companyId: 'company-001',
    runNumber: 'MRP-2025-001',
    runType: 'full',
    status: 'completed',
    runStartedAt: '2025-01-15T08:00:00Z',
    runCompletedAt: '2025-01-15T08:15:00Z',
    parameters: {
      planningHorizon: 90,
      regenerationType: 'full',
      includeSafetyStock: true,
      includeOpenOrders: true,
    },
    summary: {
      itemsProcessed: 1250,
      plannedOrdersCreated: 85,
      shortagesIdentified: 12,
      rescheduleMessages: 23,
      errors: 0,
    },
    messages: [
      { type: 'action', itemId: 'item-001', message: 'Release planned order PO-001', suggestedAction: 'Convert to purchase order', priority: 'high' },
      { type: 'warning', itemId: 'item-002', message: 'Lead time conflict', suggestedAction: 'Expedite order', priority: 'medium' },
    ],
    createdBy: 'user-001',
    createdAt: '2025-01-15T08:00:00Z',
  },
  {
    id: 'mrp-002',
    companyId: 'company-001',
    runNumber: 'MRP-2025-002',
    runType: 'net_change',
    status: 'running',
    runStartedAt: '2025-01-16T06:00:00Z',
    parameters: {
      planningHorizon: 60,
      regenerationType: 'net_change',
      includeSafetyStock: true,
      includeOpenOrders: true,
    },
    createdBy: 'system',
    createdAt: '2025-01-16T06:00:00Z',
  },
];

const MOCK_PLANNED_ORDERS: PlannedOrder[] = [
  {
    id: 'po-001',
    companyId: 'company-001',
    orderNumber: 'PLN-2025-001',
    orderType: 'purchase',
    status: 'planned',
    itemId: 'item-001',
    itemCode: 'RAW-STEEL-001',
    itemName: 'Steel Plate 10mm',
    quantity: 500,
    uom: 'KG',
    plannedStartDate: '2025-01-20',
    plannedEndDate: '2025-01-25',
    requiredDate: '2025-01-28',
    mrpRunId: 'mrp-001',
    demandSource: { type: 'work_order', sourceId: 'wo-001', sourceNumber: 'WO-2025-001' },
    supplier: { supplierId: 'sup-001', supplierName: 'Steel Suppliers Inc.', leadTimeDays: 5 },
    createdBy: 'system',
    createdAt: '2025-01-15T08:10:00Z',
    updatedAt: '2025-01-15T08:10:00Z',
  },
  {
    id: 'po-002',
    companyId: 'company-001',
    orderNumber: 'PLN-2025-002',
    orderType: 'production',
    status: 'firmed',
    itemId: 'item-002',
    itemCode: 'ASSY-001',
    itemName: 'Assembly Component A',
    quantity: 100,
    uom: 'PCS',
    plannedStartDate: '2025-01-22',
    plannedEndDate: '2025-01-30',
    requiredDate: '2025-02-05',
    mrpRunId: 'mrp-001',
    demandSource: { type: 'sales_order', sourceId: 'so-001', sourceNumber: 'SO-2025-001' },
    workCenter: { workCenterId: 'wc-001', workCenterName: 'Assembly Line A' },
    firmedBy: 'user-001',
    firmedAt: '2025-01-16T10:00:00Z',
    createdBy: 'system',
    createdAt: '2025-01-15T08:12:00Z',
    updatedAt: '2025-01-16T10:00:00Z',
  },
];

const MOCK_SHORTAGES: ShortageRecord[] = [
  {
    id: 'short-001',
    companyId: 'company-001',
    shortageNumber: 'SHR-2025-001',
    itemId: 'item-003',
    itemCode: 'COMP-ELEC-001',
    itemName: 'Electronic Controller Unit',
    requiredQuantity: 50,
    availableQuantity: 20,
    shortageQuantity: 30,
    uom: 'PCS',
    requiredDate: '2025-01-25',
    status: 'open',
    severity: 'high',
    demandSource: { type: 'work_order', sourceId: 'wo-002', sourceNumber: 'WO-2025-002' },
    impactedOrders: [
      { orderId: 'wo-002', orderNumber: 'WO-2025-002', orderType: 'work_order', impactLevel: 'direct' },
      { orderId: 'so-003', orderNumber: 'SO-2025-003', orderType: 'sales_order', impactLevel: 'indirect' },
    ],
    resolutionOptions: [
      { option: 'expedite', description: 'Expedite existing PO', cost: 500, leadTime: 3, isRecommended: true },
      { option: 'alternate', description: 'Use alternate supplier', cost: 800, leadTime: 5, isRecommended: false },
      { option: 'substitute', description: 'Use substitute item', cost: 200, leadTime: 1, isRecommended: false },
    ],
    createdBy: 'system',
    createdAt: '2025-01-15T08:14:00Z',
  },
];

// ==================== Service Class ====================

class ProductionMRPService {
  private baseUrl = '/production';

  // MRP Runs
  async executeMRPRun(data: {
    runType: 'full' | 'net_change' | 'selective';
    parameters: Partial<MRPRun['parameters']>;
  }): Promise<MRPRun> {
    try {
      const response = await apiClient.post<MRPRun>(`${this.baseUrl}/mrp-runs`, data);
      return response.data;
    } catch (error) {
      console.error('API Error executing MRP run, using mock data:', error);
      const newRun: MRPRun = {
        id: `mrp-${Date.now()}`,
        companyId: 'company-001',
        runNumber: `MRP-${Date.now()}`,
        runType: data.runType,
        status: 'running',
        runStartedAt: new Date().toISOString(),
        parameters: {
          planningHorizon: data.parameters.planningHorizon || 90,
          regenerationType: data.runType,
          includeSafetyStock: data.parameters.includeSafetyStock ?? true,
          includeOpenOrders: data.parameters.includeOpenOrders ?? true,
          ...data.parameters,
        },
        createdBy: 'user-001',
        createdAt: new Date().toISOString(),
      };
      MOCK_MRP_RUNS.push(newRun);
      return newRun;
    }
  }

  async findAllMRPRuns(filters?: { status?: MRPRunStatus }): Promise<MRPRun[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      const response = await apiClient.get<MRPRun[]>(`${this.baseUrl}/mrp-runs?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching MRP runs, using mock data:', error);
      let result = [...MOCK_MRP_RUNS];
      if (filters?.status) result = result.filter((r) => r.status === filters.status);
      return result;
    }
  }

  async findMRPRunById(id: string): Promise<MRPRun> {
    try {
      const response = await apiClient.get<MRPRun>(`${this.baseUrl}/mrp-runs/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching MRP run, using mock data:', error);
      const run = MOCK_MRP_RUNS.find((r) => r.id === id);
      if (!run) throw new Error(`MRP Run with ID ${id} not found`);
      return run;
    }
  }

  async getMRPRunSummary(id: string): Promise<{ runId: string; summary: MRPRun['summary']; messages: MRPRun['messages'] }> {
    try {
      const response = await apiClient.get<{ runId: string; summary: MRPRun['summary']; messages: MRPRun['messages'] }>(
        `${this.baseUrl}/mrp-runs/${id}/summary`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching MRP summary, using mock data:', error);
      const run = MOCK_MRP_RUNS.find((r) => r.id === id);
      if (!run) throw new Error(`MRP Run with ID ${id} not found`);
      return { runId: run.id, summary: run.summary, messages: run.messages };
    }
  }

  // Planned Orders
  async findAllPlannedOrders(filters?: {
    status?: PlannedOrderStatus;
    orderType?: PlannedOrderType;
    itemId?: string;
  }): Promise<PlannedOrder[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.orderType) params.append('orderType', filters.orderType);
      if (filters?.itemId) params.append('itemId', filters.itemId);
      const response = await apiClient.get<PlannedOrder[]>(`${this.baseUrl}/planned-orders?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching planned orders, using mock data:', error);
      let result = [...MOCK_PLANNED_ORDERS];
      if (filters?.status) result = result.filter((o) => o.status === filters.status);
      if (filters?.orderType) result = result.filter((o) => o.orderType === filters.orderType);
      if (filters?.itemId) result = result.filter((o) => o.itemId === filters.itemId);
      return result;
    }
  }

  async findPlannedOrderById(id: string): Promise<PlannedOrder> {
    try {
      const response = await apiClient.get<PlannedOrder>(`${this.baseUrl}/planned-orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching planned order, using mock data:', error);
      const order = MOCK_PLANNED_ORDERS.find((o) => o.id === id);
      if (!order) throw new Error(`Planned Order with ID ${id} not found`);
      return order;
    }
  }

  async firmPlannedOrder(id: string, firmedBy: string): Promise<PlannedOrder> {
    try {
      const response = await apiClient.post<PlannedOrder>(`${this.baseUrl}/planned-orders/${id}/firm`, { firmedBy });
      return response.data;
    } catch (error) {
      console.error('API Error firming planned order, using mock data:', error);
      const index = MOCK_PLANNED_ORDERS.findIndex((o) => o.id === id);
      if (index === -1) throw new Error(`Planned Order with ID ${id} not found`);
      MOCK_PLANNED_ORDERS[index] = {
        ...MOCK_PLANNED_ORDERS[index],
        status: 'firmed',
        firmedBy,
        firmedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return MOCK_PLANNED_ORDERS[index];
    }
  }

  async releasePlannedOrder(id: string, releasedOrderId: string): Promise<PlannedOrder> {
    try {
      const response = await apiClient.post<PlannedOrder>(`${this.baseUrl}/planned-orders/${id}/release`, { releasedOrderId });
      return response.data;
    } catch (error) {
      console.error('API Error releasing planned order, using mock data:', error);
      const index = MOCK_PLANNED_ORDERS.findIndex((o) => o.id === id);
      if (index === -1) throw new Error(`Planned Order with ID ${id} not found`);
      MOCK_PLANNED_ORDERS[index] = {
        ...MOCK_PLANNED_ORDERS[index],
        status: 'released',
        releasedOrderId,
        updatedAt: new Date().toISOString(),
      };
      return MOCK_PLANNED_ORDERS[index];
    }
  }

  // Shortage Records
  async findAllShortages(filters?: { status?: ShortageStatus; severity?: ShortageSeverity }): Promise<ShortageRecord[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.severity) params.append('severity', filters.severity);
      const response = await apiClient.get<ShortageRecord[]>(`${this.baseUrl}/shortage-records?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching shortages, using mock data:', error);
      let result = [...MOCK_SHORTAGES];
      if (filters?.status) result = result.filter((s) => s.status === filters.status);
      if (filters?.severity) result = result.filter((s) => s.severity === filters.severity);
      return result;
    }
  }

  async resolveShortage(id: string, resolution: string, resolvedBy: string): Promise<ShortageRecord> {
    try {
      const response = await apiClient.post<ShortageRecord>(`${this.baseUrl}/shortage-records/${id}/resolve`, { resolution, resolvedBy });
      return response.data;
    } catch (error) {
      console.error('API Error resolving shortage, using mock data:', error);
      const index = MOCK_SHORTAGES.findIndex((s) => s.id === id);
      if (index === -1) throw new Error(`Shortage Record with ID ${id} not found`);
      MOCK_SHORTAGES[index] = {
        ...MOCK_SHORTAGES[index],
        status: 'resolved',
        selectedResolution: resolution,
        resolvedBy,
        resolvedAt: new Date().toISOString(),
      };
      return MOCK_SHORTAGES[index];
    }
  }

  async escalateShortage(id: string): Promise<ShortageRecord> {
    try {
      const response = await apiClient.post<ShortageRecord>(`${this.baseUrl}/shortage-records/${id}/escalate`, {});
      return response.data;
    } catch (error) {
      console.error('API Error escalating shortage, using mock data:', error);
      const index = MOCK_SHORTAGES.findIndex((s) => s.id === id);
      if (index === -1) throw new Error(`Shortage Record with ID ${id} not found`);
      MOCK_SHORTAGES[index] = { ...MOCK_SHORTAGES[index], status: 'escalated', severity: 'critical' };
      return MOCK_SHORTAGES[index];
    }
  }
}

export const productionMRPService = new ProductionMRPService();
