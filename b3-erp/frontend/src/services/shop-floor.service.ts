import { apiClient } from './api/client';

// ============================================================================
// INTERFACES
// ============================================================================

export type ProductionEntryType = 'Production' | 'Rework' | 'Scrap' | 'Downtime' | 'Setup';

export type ProductionEntryStatus = 'Draft' | 'Confirmed' | 'Rejected' | 'Reversed';

export type DowntimeReason =
  | 'Machine Breakdown'
  | 'Material Shortage'
  | 'Tool Change'
  | 'Quality Issue'
  | 'Operator Unavailable'
  | 'Planned Maintenance'
  | 'Power Outage'
  | 'Other';

export interface ProductionEntry {
  id: string;
  entryNumber: string;
  workOrderId: string;
  workOrderNumber: string;
  operationId: string;
  operationName: string;
  workCenterId: string;
  workCenterName: string;
  entryType: ProductionEntryType;
  entryDate: string;
  shiftId?: string;
  shiftName?: string;
  operatorId: string;
  operatorName: string;
  productId: string;
  productCode: string;
  productName: string;
  plannedQuantity: number;
  goodQuantity: number;
  rejectedQuantity: number;
  scrapQuantity: number;
  uom: string;
  startTime: string;
  endTime: string;
  setupTime: number; // minutes
  runTime: number; // minutes
  downtimeMinutes: number;
  downtimeReason?: DowntimeReason;
  downtimeNotes?: string;
  laborHours: number;
  machineHours: number;
  materialConsumption?: {
    itemId: string;
    itemCode: string;
    itemName: string;
    quantity: number;
    uom: string;
  }[];
  qualityNotes?: string;
  status: ProductionEntryStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  confirmedBy?: string;
  confirmedAt?: string;
}

export interface WorkCenterStatus {
  workCenterId: string;
  workCenterCode: string;
  workCenterName: string;
  status: 'Idle' | 'Running' | 'Setup' | 'Maintenance' | 'Breakdown' | 'Offline';
  currentJobId?: string;
  currentJobNumber?: string;
  currentOperationId?: string;
  currentOperationName?: string;
  operatorId?: string;
  operatorName?: string;
  productCode?: string;
  productName?: string;
  targetQuantity?: number;
  completedQuantity?: number;
  progress?: number; // percentage
  startTime?: string;
  estimatedEndTime?: string;
  efficiency?: number;
  lastUpdate: string;
}

export interface ShopFloorStatus {
  timestamp: string;
  overallEfficiency: number;
  totalWorkCenters: number;
  runningWorkCenters: number;
  idleWorkCenters: number;
  maintenanceWorkCenters: number;
  breakdownWorkCenters: number;
  activeWorkOrders: number;
  todayProduction: {
    totalPlanned: number;
    totalCompleted: number;
    totalRejected: number;
    completionPercentage: number;
  };
  workCenterStatuses: WorkCenterStatus[];
  alerts: ShopFloorAlert[];
  recentEntries: ProductionEntry[];
}

export interface ShopFloorAlert {
  id: string;
  alertType: 'Warning' | 'Critical' | 'Info';
  category: 'Machine' | 'Quality' | 'Material' | 'Schedule' | 'Safety';
  workCenterId?: string;
  workCenterName?: string;
  workOrderId?: string;
  workOrderNumber?: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface CreateProductionEntryDto {
  workOrderId: string;
  operationId: string;
  workCenterId: string;
  entryType: ProductionEntryType;
  entryDate: string;
  shiftId?: string;
  operatorId: string;
  goodQuantity: number;
  rejectedQuantity?: number;
  scrapQuantity?: number;
  startTime: string;
  endTime: string;
  setupTime?: number;
  downtimeMinutes?: number;
  downtimeReason?: DowntimeReason;
  downtimeNotes?: string;
  qualityNotes?: string;
  materialConsumption?: {
    itemId: string;
    quantity: number;
  }[];
}

export interface UpdateProductionEntryDto extends Partial<CreateProductionEntryDto> {
  status?: ProductionEntryStatus;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const USE_MOCK_DATA = false;

export const MOCK_PRODUCTION_ENTRIES: ProductionEntry[] = [
  {
    id: 'pe-001',
    entryNumber: 'PE-2024-0001',
    workOrderId: 'wo-001',
    workOrderNumber: 'WO-2024-0001',
    operationId: 'op-001',
    operationName: 'Stator Winding',
    workCenterId: 'wc-002',
    workCenterName: 'Winding Station',
    entryType: 'Production',
    entryDate: '2024-01-18',
    shiftId: 'shift-001',
    shiftName: 'Morning Shift',
    operatorId: 'emp-001',
    operatorName: 'John Smith',
    productId: 'prod-001',
    productCode: 'FG-MOTOR-001',
    productName: 'Electric Motor Assembly 5HP',
    plannedQuantity: 20,
    goodQuantity: 18,
    rejectedQuantity: 1,
    scrapQuantity: 1,
    uom: 'Units',
    startTime: '08:00',
    endTime: '16:00',
    setupTime: 30,
    runTime: 420,
    downtimeMinutes: 30,
    downtimeReason: 'Tool Change',
    laborHours: 8,
    machineHours: 7.5,
    materialConsumption: [
      {
        itemId: 'item-001',
        itemCode: 'RM-COPPER-WIRE',
        itemName: 'Copper Magnet Wire 18AWG',
        quantity: 100,
        uom: 'Meters',
      },
    ],
    status: 'Confirmed',
    createdBy: 'emp-001',
    createdAt: '2024-01-18T16:30:00Z',
    updatedAt: '2024-01-18T17:00:00Z',
    confirmedBy: 'sup-001',
    confirmedAt: '2024-01-18T17:00:00Z',
  },
  {
    id: 'pe-002',
    entryNumber: 'PE-2024-0002',
    workOrderId: 'wo-001',
    workOrderNumber: 'WO-2024-0001',
    operationId: 'op-002',
    operationName: 'Rotor Assembly',
    workCenterId: 'wc-003',
    workCenterName: 'Rotor Station',
    entryType: 'Production',
    entryDate: '2024-01-18',
    shiftId: 'shift-001',
    shiftName: 'Morning Shift',
    operatorId: 'emp-002',
    operatorName: 'Sarah Johnson',
    productId: 'prod-001',
    productCode: 'FG-MOTOR-001',
    productName: 'Electric Motor Assembly 5HP',
    plannedQuantity: 15,
    goodQuantity: 15,
    rejectedQuantity: 0,
    scrapQuantity: 0,
    uom: 'Units',
    startTime: '08:30',
    endTime: '15:30',
    setupTime: 20,
    runTime: 400,
    downtimeMinutes: 0,
    laborHours: 7,
    machineHours: 7,
    status: 'Confirmed',
    createdBy: 'emp-002',
    createdAt: '2024-01-18T15:45:00Z',
    updatedAt: '2024-01-18T16:00:00Z',
    confirmedBy: 'sup-001',
    confirmedAt: '2024-01-18T16:00:00Z',
  },
  {
    id: 'pe-003',
    entryNumber: 'PE-2024-0003',
    workOrderId: 'wo-010',
    workOrderNumber: 'WO-2024-0010',
    operationId: 'op-011',
    operationName: 'Impeller Machining',
    workCenterId: 'wc-005',
    workCenterName: 'CNC Machining Center',
    entryType: 'Production',
    entryDate: '2024-01-18',
    shiftId: 'shift-002',
    shiftName: 'Evening Shift',
    operatorId: 'emp-003',
    operatorName: 'Mike Chen',
    productId: 'prod-002',
    productCode: 'FG-PUMP-001',
    productName: 'Centrifugal Pump 10HP',
    plannedQuantity: 10,
    goodQuantity: 9,
    rejectedQuantity: 1,
    scrapQuantity: 0,
    uom: 'Units',
    startTime: '14:00',
    endTime: '22:00',
    setupTime: 60,
    runTime: 420,
    downtimeMinutes: 0,
    laborHours: 8,
    machineHours: 8,
    qualityNotes: '1 unit rejected due to dimensional deviation',
    status: 'Confirmed',
    createdBy: 'emp-003',
    createdAt: '2024-01-18T22:15:00Z',
    updatedAt: '2024-01-18T22:30:00Z',
    confirmedBy: 'sup-002',
    confirmedAt: '2024-01-18T22:30:00Z',
  },
  {
    id: 'pe-004',
    entryNumber: 'PE-2024-0004',
    workOrderId: 'wo-007',
    workOrderNumber: 'WO-2024-0007',
    operationId: 'op-009',
    operationName: 'Inner Race Grinding',
    workCenterId: 'wc-005',
    workCenterName: 'CNC Machining Center',
    entryType: 'Production',
    entryDate: '2024-01-18',
    shiftId: 'shift-001',
    shiftName: 'Morning Shift',
    operatorId: 'emp-015',
    operatorName: 'James Wilson',
    productId: 'prod-006',
    productCode: 'FG-BEARING-001',
    productName: 'Precision Bearing Assembly',
    plannedQuantity: 100,
    goodQuantity: 98,
    rejectedQuantity: 2,
    scrapQuantity: 0,
    uom: 'Units',
    startTime: '06:00',
    endTime: '14:00',
    setupTime: 30,
    runTime: 450,
    downtimeMinutes: 0,
    laborHours: 8,
    machineHours: 8,
    status: 'Confirmed',
    createdBy: 'emp-015',
    createdAt: '2024-01-18T14:15:00Z',
    updatedAt: '2024-01-18T14:30:00Z',
    confirmedBy: 'sup-003',
    confirmedAt: '2024-01-18T14:30:00Z',
  },
  {
    id: 'pe-005',
    entryNumber: 'PE-2024-0005',
    workOrderId: 'wo-010',
    workOrderNumber: 'WO-2024-0010',
    operationId: 'op-012',
    operationName: 'Pump Housing Assembly',
    workCenterId: 'wc-004',
    workCenterName: 'Pump Assembly Line',
    entryType: 'Production',
    entryDate: '2024-01-19',
    shiftId: 'shift-001',
    shiftName: 'Morning Shift',
    operatorId: 'emp-004',
    operatorName: 'Lisa Wong',
    productId: 'prod-002',
    productCode: 'FG-PUMP-001',
    productName: 'Centrifugal Pump 10HP',
    plannedQuantity: 12,
    goodQuantity: 10,
    rejectedQuantity: 0,
    scrapQuantity: 0,
    uom: 'Units',
    startTime: '08:00',
    endTime: '12:00',
    setupTime: 30,
    runTime: 210,
    downtimeMinutes: 0,
    laborHours: 4,
    machineHours: 4,
    status: 'Draft',
    createdBy: 'emp-004',
    createdAt: '2024-01-19T12:15:00Z',
    updatedAt: '2024-01-19T12:15:00Z',
  },
  {
    id: 'pe-006',
    entryNumber: 'PE-2024-0006',
    workOrderId: 'wo-007',
    workOrderNumber: 'WO-2024-0007',
    operationId: 'op-010',
    operationName: 'Outer Race Grinding',
    workCenterId: 'wc-005',
    workCenterName: 'CNC Machining Center',
    entryType: 'Downtime',
    entryDate: '2024-01-19',
    shiftId: 'shift-001',
    shiftName: 'Morning Shift',
    operatorId: 'emp-015',
    operatorName: 'James Wilson',
    productId: 'prod-006',
    productCode: 'FG-BEARING-001',
    productName: 'Precision Bearing Assembly',
    plannedQuantity: 0,
    goodQuantity: 0,
    rejectedQuantity: 0,
    scrapQuantity: 0,
    uom: 'Units',
    startTime: '08:00',
    endTime: '10:00',
    setupTime: 0,
    runTime: 0,
    downtimeMinutes: 120,
    downtimeReason: 'Machine Breakdown',
    downtimeNotes: 'Coolant pump failure - replaced',
    laborHours: 2,
    machineHours: 0,
    status: 'Confirmed',
    createdBy: 'emp-015',
    createdAt: '2024-01-19T10:15:00Z',
    updatedAt: '2024-01-19T10:30:00Z',
    confirmedBy: 'sup-003',
    confirmedAt: '2024-01-19T10:30:00Z',
  },
];

export const MOCK_WORK_CENTER_STATUSES: WorkCenterStatus[] = [
  {
    workCenterId: 'wc-001',
    workCenterCode: 'WC-ASSY-A',
    workCenterName: 'Assembly Line A',
    status: 'Running',
    currentJobId: 'wo-001',
    currentJobNumber: 'WO-2024-0001',
    currentOperationId: 'op-003',
    currentOperationName: 'Final Assembly',
    operatorId: 'emp-001',
    operatorName: 'John Smith',
    productCode: 'FG-MOTOR-001',
    productName: 'Electric Motor Assembly 5HP',
    targetQuantity: 25,
    completedQuantity: 12,
    progress: 48,
    startTime: '2024-01-19T08:00:00Z',
    estimatedEndTime: '2024-01-19T16:00:00Z',
    efficiency: 92,
    lastUpdate: '2024-01-19T12:30:00Z',
  },
  {
    workCenterId: 'wc-002',
    workCenterCode: 'WC-WIND-01',
    workCenterName: 'Winding Station',
    status: 'Running',
    currentJobId: 'wo-001',
    currentJobNumber: 'WO-2024-0001',
    currentOperationId: 'op-001',
    currentOperationName: 'Stator Winding',
    operatorId: 'emp-005',
    operatorName: 'Tom Brown',
    productCode: 'FG-MOTOR-001',
    productName: 'Electric Motor Assembly 5HP',
    targetQuantity: 20,
    completedQuantity: 18,
    progress: 90,
    startTime: '2024-01-19T08:00:00Z',
    estimatedEndTime: '2024-01-19T15:30:00Z',
    efficiency: 95,
    lastUpdate: '2024-01-19T12:25:00Z',
  },
  {
    workCenterId: 'wc-003',
    workCenterCode: 'WC-ROTOR-01',
    workCenterName: 'Rotor Station',
    status: 'Setup',
    currentJobId: 'wo-003',
    currentJobNumber: 'WO-2024-0003',
    operatorId: 'emp-007',
    operatorName: 'Peter Davis',
    lastUpdate: '2024-01-19T12:00:00Z',
  },
  {
    workCenterId: 'wc-004',
    workCenterCode: 'WC-PUMP-01',
    workCenterName: 'Pump Assembly Line',
    status: 'Running',
    currentJobId: 'wo-010',
    currentJobNumber: 'WO-2024-0010',
    currentOperationId: 'op-012',
    currentOperationName: 'Pump Housing Assembly',
    operatorId: 'emp-004',
    operatorName: 'Lisa Wong',
    productCode: 'FG-PUMP-001',
    productName: 'Centrifugal Pump 10HP',
    targetQuantity: 15,
    completedQuantity: 10,
    progress: 67,
    startTime: '2024-01-19T08:00:00Z',
    estimatedEndTime: '2024-01-19T17:00:00Z',
    efficiency: 88,
    lastUpdate: '2024-01-19T12:20:00Z',
  },
  {
    workCenterId: 'wc-005',
    workCenterCode: 'WC-CNC-01',
    workCenterName: 'CNC Machining Center',
    status: 'Running',
    currentJobId: 'wo-007',
    currentJobNumber: 'WO-2024-0007',
    currentOperationId: 'op-010',
    currentOperationName: 'Outer Race Grinding',
    operatorId: 'emp-015',
    operatorName: 'James Wilson',
    productCode: 'FG-BEARING-001',
    productName: 'Precision Bearing Assembly',
    targetQuantity: 100,
    completedQuantity: 65,
    progress: 65,
    startTime: '2024-01-19T10:30:00Z',
    estimatedEndTime: '2024-01-19T18:00:00Z',
    efficiency: 94,
    lastUpdate: '2024-01-19T12:28:00Z',
  },
  {
    workCenterId: 'wc-006',
    workCenterCode: 'WC-GEAR-01',
    workCenterName: 'Gearbox Assembly',
    status: 'Idle',
    lastUpdate: '2024-01-19T08:00:00Z',
  },
  {
    workCenterId: 'wc-007',
    workCenterCode: 'WC-GEAR-CUT',
    workCenterName: 'Gear Cutting Station',
    status: 'Maintenance',
    lastUpdate: '2024-01-19T09:00:00Z',
  },
  {
    workCenterId: 'wc-008',
    workCenterCode: 'WC-HEAT-01',
    workCenterName: 'Heat Treatment Furnace',
    status: 'Running',
    operatorId: 'emp-022',
    operatorName: 'Alex Martinez',
    targetQuantity: 1,
    completedQuantity: 0,
    progress: 45,
    startTime: '2024-01-19T06:00:00Z',
    estimatedEndTime: '2024-01-19T14:00:00Z',
    efficiency: 98,
    lastUpdate: '2024-01-19T12:15:00Z',
  },
];

export const MOCK_ALERTS: ShopFloorAlert[] = [
  {
    id: 'alert-001',
    alertType: 'Critical',
    category: 'Machine',
    workCenterId: 'wc-007',
    workCenterName: 'Gear Cutting Station',
    message: 'Machine under maintenance - spindle bearing replacement in progress',
    timestamp: '2024-01-19T09:00:00Z',
    acknowledged: true,
    acknowledgedBy: 'sup-001',
    acknowledgedAt: '2024-01-19T09:15:00Z',
  },
  {
    id: 'alert-002',
    alertType: 'Warning',
    category: 'Quality',
    workCenterId: 'wc-005',
    workCenterName: 'CNC Machining Center',
    workOrderId: 'wo-010',
    workOrderNumber: 'WO-2024-0010',
    message: 'Reject rate exceeding threshold (10%) on impeller machining',
    timestamp: '2024-01-19T11:30:00Z',
    acknowledged: false,
  },
  {
    id: 'alert-003',
    alertType: 'Warning',
    category: 'Material',
    workOrderId: 'wo-003',
    workOrderNumber: 'WO-2024-0003',
    message: 'Low inventory warning: Alloy Steel Gear Blank - only 25 units remaining',
    timestamp: '2024-01-19T10:00:00Z',
    acknowledged: false,
  },
  {
    id: 'alert-004',
    alertType: 'Info',
    category: 'Schedule',
    workCenterId: 'wc-001',
    workCenterName: 'Assembly Line A',
    workOrderId: 'wo-001',
    workOrderNumber: 'WO-2024-0001',
    message: 'Work order WO-2024-0001 ahead of schedule - estimated completion 2 hours early',
    timestamp: '2024-01-19T12:00:00Z',
    acknowledged: true,
    acknowledgedBy: 'sup-001',
    acknowledgedAt: '2024-01-19T12:05:00Z',
  },
];

// ============================================================================
// SERVICE CLASS
// ============================================================================

class ShopFloorService {
  async getShopFloorStatus(): Promise<ShopFloorStatus> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const runningCount = MOCK_WORK_CENTER_STATUSES.filter((wc) => wc.status === 'Running').length;
      const idleCount = MOCK_WORK_CENTER_STATUSES.filter((wc) => wc.status === 'Idle').length;
      const maintenanceCount = MOCK_WORK_CENTER_STATUSES.filter(
        (wc) => wc.status === 'Maintenance'
      ).length;
      const breakdownCount = MOCK_WORK_CENTER_STATUSES.filter(
        (wc) => wc.status === 'Breakdown'
      ).length;

      const avgEfficiency =
        MOCK_WORK_CENTER_STATUSES.filter((wc) => wc.efficiency)
          .reduce((sum, wc) => sum + (wc.efficiency || 0), 0) /
        MOCK_WORK_CENTER_STATUSES.filter((wc) => wc.efficiency).length;

      return {
        timestamp: new Date().toISOString(),
        overallEfficiency: avgEfficiency || 0,
        totalWorkCenters: MOCK_WORK_CENTER_STATUSES.length,
        runningWorkCenters: runningCount,
        idleWorkCenters: idleCount,
        maintenanceWorkCenters: maintenanceCount,
        breakdownWorkCenters: breakdownCount,
        activeWorkOrders: 5,
        todayProduction: {
          totalPlanned: 300,
          totalCompleted: 245,
          totalRejected: 8,
          completionPercentage: 81.7,
        },
        workCenterStatuses: MOCK_WORK_CENTER_STATUSES,
        alerts: MOCK_ALERTS,
        recentEntries: MOCK_PRODUCTION_ENTRIES.slice(0, 5),
      };
    }

    const response = await apiClient.get<ShopFloorStatus>('/production/shop-floor-control');
    return response.data;
  }

  async getWorkCenterLiveStatus(workCenterId: string): Promise<WorkCenterStatus> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const status = MOCK_WORK_CENTER_STATUSES.find((wc) => wc.workCenterId === workCenterId);
      if (!status) {
        throw new Error('Work center not found');
      }
      return status;
    }

    const response = await apiClient.get<WorkCenterStatus>(
      `/production/shop-floor-control/work-centers/${workCenterId}`
    );
    return response.data;
  }

  async getProductionEntries(filters?: {
    workOrderId?: string;
    workCenterId?: string;
    operatorId?: string;
    entryType?: ProductionEntryType;
    status?: ProductionEntryStatus;
    fromDate?: string;
    toDate?: string;
  }): Promise<ProductionEntry[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filtered = [...MOCK_PRODUCTION_ENTRIES];

      if (filters) {
        if (filters.workOrderId) {
          filtered = filtered.filter((pe) => pe.workOrderId === filters.workOrderId);
        }
        if (filters.workCenterId) {
          filtered = filtered.filter((pe) => pe.workCenterId === filters.workCenterId);
        }
        if (filters.operatorId) {
          filtered = filtered.filter((pe) => pe.operatorId === filters.operatorId);
        }
        if (filters.entryType) {
          filtered = filtered.filter((pe) => pe.entryType === filters.entryType);
        }
        if (filters.status) {
          filtered = filtered.filter((pe) => pe.status === filters.status);
        }
        if (filters.fromDate) {
          filtered = filtered.filter((pe) => pe.entryDate >= filters.fromDate!);
        }
        if (filters.toDate) {
          filtered = filtered.filter((pe) => pe.entryDate <= filters.toDate!);
        }
      }

      return filtered;
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await apiClient.get<ProductionEntry[]>(
      `/production/production-entries?${params.toString()}`
    );
    return response.data;
  }

  async createProductionEntry(data: CreateProductionEntryDto): Promise<ProductionEntry> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Calculate run time from start/end time
      const start = new Date(`2024-01-01T${data.startTime}:00`);
      const end = new Date(`2024-01-01T${data.endTime}:00`);
      const runTimeMinutes = (end.getTime() - start.getTime()) / (1000 * 60) - (data.setupTime || 0) - (data.downtimeMinutes || 0);

      const newEntry: ProductionEntry = {
        id: `pe-${Date.now()}`,
        entryNumber: `PE-2024-${String(MOCK_PRODUCTION_ENTRIES.length + 1).padStart(4, '0')}`,
        workOrderId: data.workOrderId,
        workOrderNumber: 'WO-2024-XXXX', // Would be fetched from work order
        operationId: data.operationId,
        operationName: 'Operation Name', // Would be fetched from operation
        workCenterId: data.workCenterId,
        workCenterName: 'Work Center Name', // Would be fetched from work center
        entryType: data.entryType,
        entryDate: data.entryDate,
        shiftId: data.shiftId,
        operatorId: data.operatorId,
        operatorName: 'Operator Name', // Would be fetched from employee
        productId: 'prod-xxx',
        productCode: 'PROD-XXX',
        productName: 'Product Name',
        plannedQuantity: data.goodQuantity + (data.rejectedQuantity || 0) + (data.scrapQuantity || 0),
        goodQuantity: data.goodQuantity,
        rejectedQuantity: data.rejectedQuantity || 0,
        scrapQuantity: data.scrapQuantity || 0,
        uom: 'Units',
        startTime: data.startTime,
        endTime: data.endTime,
        setupTime: data.setupTime || 0,
        runTime: runTimeMinutes,
        downtimeMinutes: data.downtimeMinutes || 0,
        downtimeReason: data.downtimeReason,
        downtimeNotes: data.downtimeNotes,
        laborHours: (end.getTime() - start.getTime()) / (1000 * 60 * 60),
        machineHours: runTimeMinutes / 60,
        qualityNotes: data.qualityNotes,
        status: 'Draft',
        createdBy: data.operatorId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_PRODUCTION_ENTRIES.push(newEntry);
      return newEntry;
    }

    const response = await apiClient.post<ProductionEntry>('/production/production-entries', data);
    return response.data;
  }

  async updateProductionEntry(id: string, data: UpdateProductionEntryDto): Promise<ProductionEntry> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_PRODUCTION_ENTRIES.findIndex((pe) => pe.id === id);
      if (index === -1) {
        throw new Error('Production entry not found');
      }
      MOCK_PRODUCTION_ENTRIES[index] = {
        ...MOCK_PRODUCTION_ENTRIES[index],
        ...data,
        updatedAt: new Date().toISOString(),
      } as ProductionEntry;
      return MOCK_PRODUCTION_ENTRIES[index];
    }

    const response = await apiClient.put<ProductionEntry>(
      `/production/production-entries/${id}`,
      data
    );
    return response.data;
  }

  async confirmProductionEntry(id: string): Promise<ProductionEntry> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_PRODUCTION_ENTRIES.findIndex((pe) => pe.id === id);
      if (index === -1) {
        throw new Error('Production entry not found');
      }
      if (MOCK_PRODUCTION_ENTRIES[index].status !== 'Draft') {
        throw new Error('Only draft entries can be confirmed');
      }
      MOCK_PRODUCTION_ENTRIES[index] = {
        ...MOCK_PRODUCTION_ENTRIES[index],
        status: 'Confirmed',
        confirmedBy: 'current-user',
        confirmedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return MOCK_PRODUCTION_ENTRIES[index];
    }

    const response = await apiClient.post<ProductionEntry>(
      `/production/production-entries/${id}/confirm`,
      {}
    );
    return response.data;
  }

  async acknowledgeAlert(alertId: string): Promise<ShopFloorAlert> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const alert = MOCK_ALERTS.find((a) => a.id === alertId);
      if (!alert) {
        throw new Error('Alert not found');
      }
      alert.acknowledged = true;
      alert.acknowledgedBy = 'current-user';
      alert.acknowledgedAt = new Date().toISOString();
      return alert;
    }

    const response = await apiClient.post<ShopFloorAlert>(
      `/production/shop-floor-control/alerts/${alertId}/acknowledge`,
      {}
    );
    return response.data;
  }

  async getProductionStatistics(
    fromDate: string,
    toDate: string
  ): Promise<{
    totalProduction: number;
    totalRejected: number;
    totalScrap: number;
    qualityRate: number;
    totalLaborHours: number;
    totalMachineHours: number;
    averageEfficiency: number;
    downtimeBreakdown: { reason: string; minutes: number }[];
    productionByWorkCenter: { workCenterName: string; quantity: number }[];
    productionByProduct: { productName: string; quantity: number }[];
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      let totalGood = 0;
      let totalRejected = 0;
      let totalScrap = 0;
      let totalLabor = 0;
      let totalMachine = 0;
      let totalDowntime = 0;
      const downtimeByReason: Record<string, number> = {};
      const productionByWC: Record<string, number> = {};
      const productionByProduct: Record<string, number> = {};

      MOCK_PRODUCTION_ENTRIES.forEach((pe) => {
        if (pe.entryDate >= fromDate && pe.entryDate <= toDate) {
          totalGood += pe.goodQuantity;
          totalRejected += pe.rejectedQuantity;
          totalScrap += pe.scrapQuantity;
          totalLabor += pe.laborHours;
          totalMachine += pe.machineHours;
          totalDowntime += pe.downtimeMinutes;

          if (pe.downtimeReason) {
            downtimeByReason[pe.downtimeReason] =
              (downtimeByReason[pe.downtimeReason] || 0) + pe.downtimeMinutes;
          }

          productionByWC[pe.workCenterName] =
            (productionByWC[pe.workCenterName] || 0) + pe.goodQuantity;

          productionByProduct[pe.productName] =
            (productionByProduct[pe.productName] || 0) + pe.goodQuantity;
        }
      });

      const totalProduced = totalGood + totalRejected + totalScrap;
      const qualityRate = totalProduced > 0 ? (totalGood / totalProduced) * 100 : 100;

      return {
        totalProduction: totalGood,
        totalRejected,
        totalScrap,
        qualityRate,
        totalLaborHours: totalLabor,
        totalMachineHours: totalMachine,
        averageEfficiency: 91.5, // Calculated average
        downtimeBreakdown: Object.entries(downtimeByReason).map(([reason, minutes]) => ({
          reason,
          minutes,
        })),
        productionByWorkCenter: Object.entries(productionByWC).map(([workCenterName, quantity]) => ({
          workCenterName,
          quantity,
        })),
        productionByProduct: Object.entries(productionByProduct).map(([productName, quantity]) => ({
          productName,
          quantity,
        })),
      };
    }

    const params = new URLSearchParams({ fromDate, toDate });
    const response = await apiClient.get<any>(
      `/production/shop-floor-control/statistics?${params.toString()}`
    );
    return response.data;
  }
}

export const shopFloorService = new ShopFloorService();
