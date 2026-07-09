import { apiClient } from './api/client';
import { USE_LIVE_API } from './api-flags';

// ============================================================================
// INTERFACES
// ============================================================================

export type WorkOrderStatus =
  | 'Draft'
  | 'Planned'
  | 'Released'
  | 'In Progress'
  | 'On Hold'
  | 'Completed'
  | 'Cancelled';

export type WorkOrderPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface WorkOrderOperation {
  id: string;
  operationNumber: number;
  operationName: string;
  workCenterId: string;
  workCenterName: string;
  setupTime: number; // minutes
  runTime: number; // minutes per unit
  laborCost: number;
  overheadCost: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Skipped';
  startedAt?: string;
  completedAt?: string;
  operatorId?: string;
  operatorName?: string;
}

export interface WorkOrderMaterial {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  requiredQuantity: number;
  issuedQuantity: number;
  uom: string;
  warehouseId: string;
  warehouseName: string;
  status: 'Pending' | 'Partial' | 'Issued';
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  productId: string;
  productCode: string;
  productName: string;
  bomId?: string;
  bomCode?: string;
  plannedQuantity: number;
  completedQuantity: number;
  scrapQuantity: number;
  uom: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  scheduledWorkCenterId?: string;
  scheduledWorkCenterName?: string;
  salesOrderId?: string;
  salesOrderNumber?: string;
  customerId?: string;
  customerName?: string;
  notes?: string;
  operations: WorkOrderOperation[];
  materials: WorkOrderMaterial[];
  estimatedCost: number;
  actualCost: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  releasedBy?: string;
  releasedAt?: string;
  completedBy?: string;
  completedAt?: string;
}

export interface CreateWorkOrderDto {
  productId: string;
  bomId?: string;
  plannedQuantity: number;
  priority: WorkOrderPriority;
  plannedStartDate: string;
  plannedEndDate: string;
  scheduledWorkCenterId?: string;
  salesOrderId?: string;
  notes?: string;
}

export interface UpdateWorkOrderDto extends Partial<CreateWorkOrderDto> {
  status?: WorkOrderStatus;
}

export interface WorkOrderFilters {
  status?: WorkOrderStatus;
  priority?: WorkOrderPriority;
  productId?: string;
  workCenterId?: string;
  fromDate?: string;
  toDate?: string;
  salesOrderId?: string;
  search?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const USE_MOCK_DATA = !USE_LIVE_API;

export const MOCK_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo-001',
    workOrderNumber: 'WO-2024-0001',
    productId: 'prod-001',
    productCode: 'FG-MOTOR-001',
    productName: 'Electric Motor Assembly 5HP',
    bomId: 'bom-001',
    bomCode: 'BOM-MOTOR-001',
    plannedQuantity: 100,
    completedQuantity: 75,
    scrapQuantity: 2,
    uom: 'Units',
    priority: 'High',
    status: 'In Progress',
    plannedStartDate: '2024-01-15',
    plannedEndDate: '2024-01-25',
    actualStartDate: '2024-01-15',
    scheduledWorkCenterId: 'wc-001',
    scheduledWorkCenterName: 'Assembly Line A',
    salesOrderId: 'so-001',
    salesOrderNumber: 'SO-2024-0015',
    customerId: 'cust-001',
    customerName: 'ABC Manufacturing Ltd.',
    notes: 'Priority order for key customer',
    operations: [
      {
        id: 'op-001',
        operationNumber: 10,
        operationName: 'Stator Winding',
        workCenterId: 'wc-002',
        workCenterName: 'Winding Station',
        setupTime: 30,
        runTime: 15,
        laborCost: 25.00,
        overheadCost: 10.00,
        status: 'Completed',
        startedAt: '2024-01-15T08:00:00Z',
        completedAt: '2024-01-16T16:00:00Z',
        operatorId: 'emp-001',
        operatorName: 'John Smith',
      },
      {
        id: 'op-002',
        operationNumber: 20,
        operationName: 'Rotor Assembly',
        workCenterId: 'wc-003',
        workCenterName: 'Rotor Station',
        setupTime: 20,
        runTime: 12,
        laborCost: 22.00,
        overheadCost: 8.00,
        status: 'In Progress',
        startedAt: '2024-01-17T08:00:00Z',
        operatorId: 'emp-002',
        operatorName: 'Sarah Johnson',
      },
      {
        id: 'op-003',
        operationNumber: 30,
        operationName: 'Final Assembly',
        workCenterId: 'wc-001',
        workCenterName: 'Assembly Line A',
        setupTime: 45,
        runTime: 25,
        laborCost: 30.00,
        overheadCost: 15.00,
        status: 'Pending',
      },
    ],
    materials: [
      {
        id: 'mat-001',
        itemId: 'item-001',
        itemCode: 'RM-COPPER-WIRE',
        itemName: 'Copper Magnet Wire 18AWG',
        requiredQuantity: 500,
        issuedQuantity: 500,
        uom: 'Meters',
        warehouseId: 'wh-001',
        warehouseName: 'Raw Materials Warehouse',
        status: 'Issued',
      },
      {
        id: 'mat-002',
        itemId: 'item-002',
        itemCode: 'RM-STEEL-CORE',
        itemName: 'Laminated Steel Core',
        requiredQuantity: 100,
        issuedQuantity: 80,
        uom: 'Units',
        warehouseId: 'wh-001',
        warehouseName: 'Raw Materials Warehouse',
        status: 'Partial',
      },
    ],
    estimatedCost: 15000.00,
    actualCost: 11250.00,
    createdBy: 'admin',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-18T14:30:00Z',
    releasedBy: 'prod-manager',
    releasedAt: '2024-01-14T09:00:00Z',
  },
  {
    id: 'wo-002',
    workOrderNumber: 'WO-2024-0002',
    productId: 'prod-002',
    productCode: 'FG-PUMP-001',
    productName: 'Centrifugal Pump 10HP',
    bomId: 'bom-002',
    bomCode: 'BOM-PUMP-001',
    plannedQuantity: 50,
    completedQuantity: 50,
    scrapQuantity: 1,
    uom: 'Units',
    priority: 'Medium',
    status: 'Completed',
    plannedStartDate: '2024-01-08',
    plannedEndDate: '2024-01-15',
    actualStartDate: '2024-01-08',
    actualEndDate: '2024-01-14',
    scheduledWorkCenterId: 'wc-004',
    scheduledWorkCenterName: 'Pump Assembly Line',
    salesOrderId: 'so-002',
    salesOrderNumber: 'SO-2024-0012',
    customerId: 'cust-002',
    customerName: 'XYZ Industries',
    operations: [
      {
        id: 'op-004',
        operationNumber: 10,
        operationName: 'Impeller Machining',
        workCenterId: 'wc-005',
        workCenterName: 'CNC Machining Center',
        setupTime: 60,
        runTime: 30,
        laborCost: 35.00,
        overheadCost: 20.00,
        status: 'Completed',
        startedAt: '2024-01-08T08:00:00Z',
        completedAt: '2024-01-10T16:00:00Z',
        operatorId: 'emp-003',
        operatorName: 'Mike Chen',
      },
      {
        id: 'op-005',
        operationNumber: 20,
        operationName: 'Pump Housing Assembly',
        workCenterId: 'wc-004',
        workCenterName: 'Pump Assembly Line',
        setupTime: 30,
        runTime: 20,
        laborCost: 28.00,
        overheadCost: 12.00,
        status: 'Completed',
        startedAt: '2024-01-11T08:00:00Z',
        completedAt: '2024-01-14T12:00:00Z',
        operatorId: 'emp-004',
        operatorName: 'Lisa Wong',
      },
    ],
    materials: [
      {
        id: 'mat-003',
        itemId: 'item-003',
        itemCode: 'RM-SS-IMPELLER',
        itemName: 'Stainless Steel Blank (Impeller)',
        requiredQuantity: 50,
        issuedQuantity: 50,
        uom: 'Units',
        warehouseId: 'wh-001',
        warehouseName: 'Raw Materials Warehouse',
        status: 'Issued',
      },
    ],
    estimatedCost: 25000.00,
    actualCost: 24500.00,
    createdBy: 'admin',
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-14T16:00:00Z',
    releasedBy: 'prod-manager',
    releasedAt: '2024-01-07T14:00:00Z',
    completedBy: 'prod-supervisor',
    completedAt: '2024-01-14T16:00:00Z',
  },
  {
    id: 'wo-003',
    workOrderNumber: 'WO-2024-0003',
    productId: 'prod-003',
    productCode: 'FG-GEARBOX-001',
    productName: 'Industrial Gearbox 3:1',
    bomId: 'bom-003',
    bomCode: 'BOM-GEARBOX-001',
    plannedQuantity: 25,
    completedQuantity: 0,
    scrapQuantity: 0,
    uom: 'Units',
    priority: 'Critical',
    status: 'Released',
    plannedStartDate: '2024-01-20',
    plannedEndDate: '2024-02-05',
    scheduledWorkCenterId: 'wc-006',
    scheduledWorkCenterName: 'Gearbox Assembly',
    salesOrderId: 'so-003',
    salesOrderNumber: 'SO-2024-0018',
    customerId: 'cust-003',
    customerName: 'Heavy Equipment Corp.',
    notes: 'Rush order - expedite processing',
    operations: [
      {
        id: 'op-006',
        operationNumber: 10,
        operationName: 'Gear Cutting',
        workCenterId: 'wc-007',
        workCenterName: 'Gear Cutting Station',
        setupTime: 120,
        runTime: 45,
        laborCost: 40.00,
        overheadCost: 25.00,
        status: 'Pending',
      },
      {
        id: 'op-007',
        operationNumber: 20,
        operationName: 'Heat Treatment',
        workCenterId: 'wc-008',
        workCenterName: 'Heat Treatment Furnace',
        setupTime: 60,
        runTime: 120,
        laborCost: 20.00,
        overheadCost: 50.00,
        status: 'Pending',
      },
      {
        id: 'op-008',
        operationNumber: 30,
        operationName: 'Gearbox Assembly',
        workCenterId: 'wc-006',
        workCenterName: 'Gearbox Assembly',
        setupTime: 45,
        runTime: 60,
        laborCost: 35.00,
        overheadCost: 18.00,
        status: 'Pending',
      },
    ],
    materials: [
      {
        id: 'mat-004',
        itemId: 'item-004',
        itemCode: 'RM-STEEL-GEAR',
        itemName: 'Alloy Steel Gear Blank',
        requiredQuantity: 75,
        issuedQuantity: 0,
        uom: 'Units',
        warehouseId: 'wh-001',
        warehouseName: 'Raw Materials Warehouse',
        status: 'Pending',
      },
    ],
    estimatedCost: 45000.00,
    actualCost: 0,
    createdBy: 'admin',
    createdAt: '2024-01-18T11:00:00Z',
    updatedAt: '2024-01-19T10:00:00Z',
    releasedBy: 'prod-manager',
    releasedAt: '2024-01-19T10:00:00Z',
  },
  {
    id: 'wo-004',
    workOrderNumber: 'WO-2024-0004',
    productId: 'prod-004',
    productCode: 'FG-VALVE-001',
    productName: 'Control Valve Assembly DN50',
    bomId: 'bom-004',
    bomCode: 'BOM-VALVE-001',
    plannedQuantity: 200,
    completedQuantity: 0,
    scrapQuantity: 0,
    uom: 'Units',
    priority: 'Medium',
    status: 'Planned',
    plannedStartDate: '2024-01-25',
    plannedEndDate: '2024-02-10',
    scheduledWorkCenterId: 'wc-001',
    scheduledWorkCenterName: 'Assembly Line A',
    operations: [],
    materials: [],
    estimatedCost: 30000.00,
    actualCost: 0,
    createdBy: 'admin',
    createdAt: '2024-01-20T14:00:00Z',
    updatedAt: '2024-01-20T14:00:00Z',
  },
  {
    id: 'wo-005',
    workOrderNumber: 'WO-2024-0005',
    productId: 'prod-005',
    productCode: 'FG-CONVEYOR-001',
    productName: 'Conveyor Belt Section 10m',
    plannedQuantity: 15,
    completedQuantity: 0,
    scrapQuantity: 0,
    uom: 'Units',
    priority: 'Low',
    status: 'Draft',
    plannedStartDate: '2024-02-01',
    plannedEndDate: '2024-02-20',
    notes: 'Pending material availability confirmation',
    operations: [],
    materials: [],
    estimatedCost: 75000.00,
    actualCost: 0,
    createdBy: 'planner',
    createdAt: '2024-01-21T09:00:00Z',
    updatedAt: '2024-01-21T09:00:00Z',
  },
  {
    id: 'wo-006',
    workOrderNumber: 'WO-2024-0006',
    productId: 'prod-001',
    productCode: 'FG-MOTOR-001',
    productName: 'Electric Motor Assembly 5HP',
    bomId: 'bom-001',
    bomCode: 'BOM-MOTOR-001',
    plannedQuantity: 50,
    completedQuantity: 0,
    scrapQuantity: 0,
    uom: 'Units',
    priority: 'High',
    status: 'On Hold',
    plannedStartDate: '2024-01-22',
    plannedEndDate: '2024-01-30',
    scheduledWorkCenterId: 'wc-001',
    scheduledWorkCenterName: 'Assembly Line A',
    salesOrderId: 'so-005',
    salesOrderNumber: 'SO-2024-0022',
    customerId: 'cust-004',
    customerName: 'Power Systems Inc.',
    notes: 'On hold - waiting for copper wire delivery',
    operations: [],
    materials: [],
    estimatedCost: 7500.00,
    actualCost: 0,
    createdBy: 'admin',
    createdAt: '2024-01-19T15:00:00Z',
    updatedAt: '2024-01-21T11:00:00Z',
  },
  {
    id: 'wo-007',
    workOrderNumber: 'WO-2024-0007',
    productId: 'prod-006',
    productCode: 'FG-BEARING-001',
    productName: 'Precision Bearing Assembly',
    bomId: 'bom-005',
    bomCode: 'BOM-BEARING-001',
    plannedQuantity: 500,
    completedQuantity: 320,
    scrapQuantity: 5,
    uom: 'Units',
    priority: 'Medium',
    status: 'In Progress',
    plannedStartDate: '2024-01-10',
    plannedEndDate: '2024-01-24',
    actualStartDate: '2024-01-10',
    scheduledWorkCenterId: 'wc-005',
    scheduledWorkCenterName: 'CNC Machining Center',
    operations: [
      {
        id: 'op-009',
        operationNumber: 10,
        operationName: 'Inner Race Grinding',
        workCenterId: 'wc-005',
        workCenterName: 'CNC Machining Center',
        setupTime: 30,
        runTime: 5,
        laborCost: 18.00,
        overheadCost: 8.00,
        status: 'Completed',
        startedAt: '2024-01-10T08:00:00Z',
        completedAt: '2024-01-15T16:00:00Z',
      },
      {
        id: 'op-010',
        operationNumber: 20,
        operationName: 'Outer Race Grinding',
        workCenterId: 'wc-005',
        workCenterName: 'CNC Machining Center',
        setupTime: 30,
        runTime: 6,
        laborCost: 18.00,
        overheadCost: 8.00,
        status: 'In Progress',
        startedAt: '2024-01-16T08:00:00Z',
      },
    ],
    materials: [],
    estimatedCost: 12500.00,
    actualCost: 8000.00,
    createdBy: 'admin',
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-18T16:00:00Z',
    releasedBy: 'prod-manager',
    releasedAt: '2024-01-09T14:00:00Z',
  },
  {
    id: 'wo-008',
    workOrderNumber: 'WO-2024-0008',
    productId: 'prod-007',
    productCode: 'FG-COUPLING-001',
    productName: 'Flexible Coupling Assembly',
    plannedQuantity: 100,
    completedQuantity: 100,
    scrapQuantity: 0,
    uom: 'Units',
    priority: 'Low',
    status: 'Completed',
    plannedStartDate: '2024-01-05',
    plannedEndDate: '2024-01-12',
    actualStartDate: '2024-01-05',
    actualEndDate: '2024-01-11',
    scheduledWorkCenterId: 'wc-001',
    scheduledWorkCenterName: 'Assembly Line A',
    operations: [],
    materials: [],
    estimatedCost: 8000.00,
    actualCost: 7800.00,
    createdBy: 'admin',
    createdAt: '2024-01-03T09:00:00Z',
    updatedAt: '2024-01-11T17:00:00Z',
    releasedBy: 'prod-manager',
    releasedAt: '2024-01-04T10:00:00Z',
    completedBy: 'prod-supervisor',
    completedAt: '2024-01-11T17:00:00Z',
  },
  {
    id: 'wo-009',
    workOrderNumber: 'WO-2024-0009',
    productId: 'prod-008',
    productCode: 'FG-SHAFT-001',
    productName: 'Drive Shaft Assembly',
    bomId: 'bom-006',
    bomCode: 'BOM-SHAFT-001',
    plannedQuantity: 30,
    completedQuantity: 0,
    scrapQuantity: 0,
    uom: 'Units',
    priority: 'High',
    status: 'Cancelled',
    plannedStartDate: '2024-01-18',
    plannedEndDate: '2024-01-28',
    scheduledWorkCenterId: 'wc-005',
    scheduledWorkCenterName: 'CNC Machining Center',
    salesOrderId: 'so-006',
    salesOrderNumber: 'SO-2024-0020',
    customerId: 'cust-005',
    customerName: 'AutoParts Ltd.',
    notes: 'Cancelled due to customer order cancellation',
    operations: [],
    materials: [],
    estimatedCost: 18000.00,
    actualCost: 0,
    createdBy: 'admin',
    createdAt: '2024-01-15T14:00:00Z',
    updatedAt: '2024-01-17T09:00:00Z',
  },
  {
    id: 'wo-010',
    workOrderNumber: 'WO-2024-0010',
    productId: 'prod-002',
    productCode: 'FG-PUMP-001',
    productName: 'Centrifugal Pump 10HP',
    bomId: 'bom-002',
    bomCode: 'BOM-PUMP-001',
    plannedQuantity: 75,
    completedQuantity: 30,
    scrapQuantity: 2,
    uom: 'Units',
    priority: 'Critical',
    status: 'In Progress',
    plannedStartDate: '2024-01-16',
    plannedEndDate: '2024-01-28',
    actualStartDate: '2024-01-16',
    scheduledWorkCenterId: 'wc-004',
    scheduledWorkCenterName: 'Pump Assembly Line',
    salesOrderId: 'so-007',
    salesOrderNumber: 'SO-2024-0025',
    customerId: 'cust-006',
    customerName: 'Water Works Co.',
    notes: 'Expedite - critical infrastructure project',
    operations: [
      {
        id: 'op-011',
        operationNumber: 10,
        operationName: 'Impeller Machining',
        workCenterId: 'wc-005',
        workCenterName: 'CNC Machining Center',
        setupTime: 60,
        runTime: 30,
        laborCost: 35.00,
        overheadCost: 20.00,
        status: 'Completed',
        startedAt: '2024-01-16T08:00:00Z',
        completedAt: '2024-01-18T16:00:00Z',
        operatorId: 'emp-003',
        operatorName: 'Mike Chen',
      },
      {
        id: 'op-012',
        operationNumber: 20,
        operationName: 'Pump Housing Assembly',
        workCenterId: 'wc-004',
        workCenterName: 'Pump Assembly Line',
        setupTime: 30,
        runTime: 20,
        laborCost: 28.00,
        overheadCost: 12.00,
        status: 'In Progress',
        startedAt: '2024-01-19T08:00:00Z',
        operatorId: 'emp-004',
        operatorName: 'Lisa Wong',
      },
    ],
    materials: [],
    estimatedCost: 37500.00,
    actualCost: 15000.00,
    createdBy: 'admin',
    createdAt: '2024-01-14T11:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
    releasedBy: 'prod-manager',
    releasedAt: '2024-01-15T16:00:00Z',
  },
];

// ============================================================================
// SERVICE CLASS
// ============================================================================

class WorkOrderService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await apiClient.get<T>(endpoint);
      return response.data;
    } catch (error) {
      if (USE_MOCK_DATA) {
        console.warn('[WorkOrderService] API call failed, using mock data');
        throw error;
      }
      throw error;
    }
  }

  async getAllWorkOrders(filters?: WorkOrderFilters): Promise<WorkOrder[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredOrders = [...MOCK_WORK_ORDERS];

      if (filters) {
        if (filters.status) {
          filteredOrders = filteredOrders.filter((wo) => wo.status === filters.status);
        }
        if (filters.priority) {
          filteredOrders = filteredOrders.filter((wo) => wo.priority === filters.priority);
        }
        if (filters.productId) {
          filteredOrders = filteredOrders.filter((wo) => wo.productId === filters.productId);
        }
        if (filters.workCenterId) {
          filteredOrders = filteredOrders.filter((wo) => wo.scheduledWorkCenterId === filters.workCenterId);
        }
        if (filters.salesOrderId) {
          filteredOrders = filteredOrders.filter((wo) => wo.salesOrderId === filters.salesOrderId);
        }
        if (filters.fromDate) {
          filteredOrders = filteredOrders.filter((wo) => wo.plannedStartDate >= filters.fromDate!);
        }
        if (filters.toDate) {
          filteredOrders = filteredOrders.filter((wo) => wo.plannedEndDate <= filters.toDate!);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredOrders = filteredOrders.filter(
            (wo) =>
              wo.workOrderNumber.toLowerCase().includes(searchLower) ||
              wo.productName.toLowerCase().includes(searchLower) ||
              wo.productCode.toLowerCase().includes(searchLower) ||
              wo.customerName?.toLowerCase().includes(searchLower)
          );
        }
      }

      return filteredOrders;
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await apiClient.get<WorkOrder[]>(`/production/work-orders?${params.toString()}`);
    return response.data;
  }

  async getWorkOrderById(id: string): Promise<WorkOrder> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const workOrder = MOCK_WORK_ORDERS.find((wo) => wo.id === id);
      if (!workOrder) {
        throw new Error('Work order not found');
      }
      return workOrder;
    }

    const response = await apiClient.get<WorkOrder>(`/production/work-orders/${id}`);
    return response.data;
  }

  async createWorkOrder(data: CreateWorkOrderDto): Promise<WorkOrder> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newWorkOrder: WorkOrder = {
        id: `wo-${Date.now()}`,
        workOrderNumber: `WO-2024-${String(MOCK_WORK_ORDERS.length + 1).padStart(4, '0')}`,
        productId: data.productId,
        productCode: 'FG-NEW-001',
        productName: 'New Product',
        bomId: data.bomId,
        plannedQuantity: data.plannedQuantity,
        completedQuantity: 0,
        scrapQuantity: 0,
        uom: 'Units',
        priority: data.priority,
        status: 'Draft',
        plannedStartDate: data.plannedStartDate,
        plannedEndDate: data.plannedEndDate,
        scheduledWorkCenterId: data.scheduledWorkCenterId,
        salesOrderId: data.salesOrderId,
        notes: data.notes,
        operations: [],
        materials: [],
        estimatedCost: 0,
        actualCost: 0,
        createdBy: 'current-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_WORK_ORDERS.push(newWorkOrder);
      return newWorkOrder;
    }

    const response = await apiClient.post<WorkOrder>('/production/work-orders', data);
    return response.data;
  }

  async updateWorkOrder(id: string, data: UpdateWorkOrderDto): Promise<WorkOrder> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_WORK_ORDERS.findIndex((wo) => wo.id === id);
      if (index === -1) {
        throw new Error('Work order not found');
      }
      MOCK_WORK_ORDERS[index] = {
        ...MOCK_WORK_ORDERS[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return MOCK_WORK_ORDERS[index];
    }

    const response = await apiClient.put<WorkOrder>(`/production/work-orders/${id}`, data);
    return response.data;
  }

  /**
   * Persist material/routing (and other) edits for a work order.
   * Uses the verified singular route PUT /production/work-order/:id, which
   * accepts routingId, materialsIssued, operations, materials, etc.
   */
  async saveWorkOrderEdits(id: string, data: Record<string, unknown>): Promise<WorkOrder> {
    const response = await apiClient.put<WorkOrder>(`/production/work-order/${id}`, data);
    return response.data;
  }

  async releaseWorkOrder(id: string): Promise<WorkOrder> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_WORK_ORDERS.findIndex((wo) => wo.id === id);
      if (index === -1) {
        throw new Error('Work order not found');
      }
      if (MOCK_WORK_ORDERS[index].status !== 'Planned' && MOCK_WORK_ORDERS[index].status !== 'Draft') {
        throw new Error('Work order cannot be released from current status');
      }
      MOCK_WORK_ORDERS[index] = {
        ...MOCK_WORK_ORDERS[index],
        status: 'Released',
        releasedBy: 'current-user',
        releasedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return MOCK_WORK_ORDERS[index];
    }

    const response = await apiClient.post<WorkOrder>(`/production/work-orders/${id}/release`, {});
    return response.data;
  }

  async completeWorkOrder(id: string): Promise<WorkOrder> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_WORK_ORDERS.findIndex((wo) => wo.id === id);
      if (index === -1) {
        throw new Error('Work order not found');
      }
      if (MOCK_WORK_ORDERS[index].status !== 'In Progress') {
        throw new Error('Only in-progress work orders can be completed');
      }
      MOCK_WORK_ORDERS[index] = {
        ...MOCK_WORK_ORDERS[index],
        status: 'Completed',
        completedBy: 'current-user',
        completedAt: new Date().toISOString(),
        actualEndDate: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString(),
      };
      return MOCK_WORK_ORDERS[index];
    }

    const response = await apiClient.post<WorkOrder>(`/production/work-orders/${id}/complete`, {});
    return response.data;
  }

  async getWorkOrderStatistics(): Promise<{
    total: number;
    byStatus: Record<WorkOrderStatus, number>;
    byPriority: Record<WorkOrderPriority, number>;
    completionRate: number;
    averageLeadTime: number;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const byStatus: Record<string, number> = {};
      const byPriority: Record<string, number> = {};

      MOCK_WORK_ORDERS.forEach((wo) => {
        byStatus[wo.status] = (byStatus[wo.status] || 0) + 1;
        byPriority[wo.priority] = (byPriority[wo.priority] || 0) + 1;
      });

      const completed = MOCK_WORK_ORDERS.filter((wo) => wo.status === 'Completed').length;
      const completionRate = (completed / MOCK_WORK_ORDERS.length) * 100;

      return {
        total: MOCK_WORK_ORDERS.length,
        byStatus: byStatus as Record<WorkOrderStatus, number>,
        byPriority: byPriority as Record<WorkOrderPriority, number>,
        completionRate,
        averageLeadTime: 8.5, // days
      };
    }

    const response = await apiClient.get<any>('/production/work-orders/statistics');
    return response.data;
  }
}

export const workOrderService = new WorkOrderService();
