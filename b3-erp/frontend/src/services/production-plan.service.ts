import { apiClient } from './api/client';

// ============================================================================
// INTERFACES
// ============================================================================

export type ProductionPlanStatus =
  | 'Draft'
  | 'Submitted'
  | 'Approved'
  | 'Released'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export type ProductionPlanType = 'MPS' | 'MRP' | 'CRP' | 'Tactical' | 'Operational';

export type PlanPeriod = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual';

export interface ProductionPlanItem {
  id: string;
  lineNumber: number;
  productId: string;
  productCode: string;
  productName: string;
  plannedQuantity: number;
  uom: string;
  startDate: string;
  endDate: string;
  workCenterId?: string;
  workCenterName?: string;
  bomId?: string;
  bomCode?: string;
  priority: number;
  notes?: string;
  status: 'Planned' | 'Scheduled' | 'Released' | 'In Progress' | 'Completed';
  workOrderId?: string;
  workOrderNumber?: string;
  demandSource?: 'Forecast' | 'Sales Order' | 'Safety Stock' | 'Make to Stock';
  demandReferenceId?: string;
  materialAvailability: 'Available' | 'Partial' | 'Not Available' | 'Unknown';
  capacityAvailability: 'Available' | 'Overloaded' | 'Unknown';
}

export interface ProductionPlanCapacity {
  workCenterId: string;
  workCenterName: string;
  periodStart: string;
  periodEnd: string;
  availableCapacity: number;
  plannedCapacity: number;
  loadPercentage: number;
  capacityUom: string;
}

export interface ProductionPlanMaterial {
  itemId: string;
  itemCode: string;
  itemName: string;
  requiredQuantity: number;
  availableQuantity: number;
  shortageQuantity: number;
  uom: string;
  expectedDate?: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
}

export interface ProductionPlan {
  id: string;
  planNumber: string;
  planName: string;
  description?: string;
  planType: ProductionPlanType;
  planPeriod: PlanPeriod;
  startDate: string;
  endDate: string;
  status: ProductionPlanStatus;
  plantId?: string;
  plantName?: string;
  version: number;
  items: ProductionPlanItem[];
  capacitySummary: ProductionPlanCapacity[];
  materialRequirements: ProductionPlanMaterial[];
  totalPlannedQuantity: number;
  totalPlannedValue: number;
  currency: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  submittedBy?: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  releasedBy?: string;
  releasedAt?: string;
}

export interface CreateProductionPlanDto {
  planName: string;
  description?: string;
  planType: ProductionPlanType;
  planPeriod: PlanPeriod;
  startDate: string;
  endDate: string;
  plantId?: string;
  items: Omit<ProductionPlanItem, 'id' | 'status' | 'materialAvailability' | 'capacityAvailability'>[];
  notes?: string;
}

export interface UpdateProductionPlanDto extends Partial<CreateProductionPlanDto> {
  status?: ProductionPlanStatus;
}

export interface ProductionPlanFilters {
  status?: ProductionPlanStatus;
  planType?: ProductionPlanType;
  planPeriod?: PlanPeriod;
  fromDate?: string;
  toDate?: string;
  plantId?: string;
  search?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const USE_MOCK_DATA = false;

export const MOCK_PRODUCTION_PLANS: ProductionPlan[] = [
  {
    id: 'pp-001',
    planNumber: 'PP-2024-001',
    planName: 'January 2024 Production Plan',
    description: 'Monthly production plan for January 2024 - Q1 targets',
    planType: 'MPS',
    planPeriod: 'Monthly',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    status: 'In Progress',
    plantId: 'plant-001',
    plantName: 'Main Manufacturing Plant',
    version: 2,
    items: [
      {
        id: 'ppi-001',
        lineNumber: 10,
        productId: 'prod-001',
        productCode: 'FG-MOTOR-001',
        productName: 'Electric Motor Assembly 5HP',
        plannedQuantity: 500,
        uom: 'Units',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        workCenterId: 'wc-001',
        workCenterName: 'Assembly Line A',
        bomId: 'bom-001',
        bomCode: 'BOM-MOTOR-001',
        priority: 1,
        status: 'In Progress',
        workOrderId: 'wo-001',
        workOrderNumber: 'WO-2024-0001',
        demandSource: 'Sales Order',
        materialAvailability: 'Available',
        capacityAvailability: 'Available',
      },
      {
        id: 'ppi-002',
        lineNumber: 20,
        productId: 'prod-002',
        productCode: 'FG-PUMP-001',
        productName: 'Centrifugal Pump 10HP',
        plannedQuantity: 200,
        uom: 'Units',
        startDate: '2024-01-05',
        endDate: '2024-01-28',
        workCenterId: 'wc-004',
        workCenterName: 'Pump Assembly Line',
        bomId: 'bom-002',
        bomCode: 'BOM-PUMP-001',
        priority: 2,
        status: 'In Progress',
        workOrderId: 'wo-010',
        workOrderNumber: 'WO-2024-0010',
        demandSource: 'Sales Order',
        materialAvailability: 'Available',
        capacityAvailability: 'Available',
      },
      {
        id: 'ppi-003',
        lineNumber: 30,
        productId: 'prod-003',
        productCode: 'FG-GEARBOX-001',
        productName: 'Industrial Gearbox 3:1',
        plannedQuantity: 50,
        uom: 'Units',
        startDate: '2024-01-15',
        endDate: '2024-01-31',
        workCenterId: 'wc-006',
        workCenterName: 'Gearbox Assembly',
        bomId: 'bom-003',
        bomCode: 'BOM-GEARBOX-001',
        priority: 1,
        notes: 'Rush order for Heavy Equipment Corp.',
        status: 'Released',
        workOrderId: 'wo-003',
        workOrderNumber: 'WO-2024-0003',
        demandSource: 'Sales Order',
        materialAvailability: 'Partial',
        capacityAvailability: 'Available',
      },
      {
        id: 'ppi-004',
        lineNumber: 40,
        productId: 'prod-006',
        productCode: 'FG-BEARING-001',
        productName: 'Precision Bearing Assembly',
        plannedQuantity: 1000,
        uom: 'Units',
        startDate: '2024-01-08',
        endDate: '2024-01-25',
        workCenterId: 'wc-005',
        workCenterName: 'CNC Machining Center',
        priority: 3,
        status: 'In Progress',
        workOrderId: 'wo-007',
        workOrderNumber: 'WO-2024-0007',
        demandSource: 'Make to Stock',
        materialAvailability: 'Available',
        capacityAvailability: 'Overloaded',
      },
    ],
    capacitySummary: [
      {
        workCenterId: 'wc-001',
        workCenterName: 'Assembly Line A',
        periodStart: '2024-01-01',
        periodEnd: '2024-01-31',
        availableCapacity: 1760,
        plannedCapacity: 1500,
        loadPercentage: 85.2,
        capacityUom: 'Hours',
      },
      {
        workCenterId: 'wc-004',
        workCenterName: 'Pump Assembly Line',
        periodStart: '2024-01-01',
        periodEnd: '2024-01-31',
        availableCapacity: 704,
        plannedCapacity: 640,
        loadPercentage: 90.9,
        capacityUom: 'Hours',
      },
      {
        workCenterId: 'wc-005',
        workCenterName: 'CNC Machining Center',
        periodStart: '2024-01-01',
        periodEnd: '2024-01-31',
        availableCapacity: 528,
        plannedCapacity: 580,
        loadPercentage: 109.8,
        capacityUom: 'Hours',
      },
      {
        workCenterId: 'wc-006',
        workCenterName: 'Gearbox Assembly',
        periodStart: '2024-01-01',
        periodEnd: '2024-01-31',
        availableCapacity: 352,
        plannedCapacity: 200,
        loadPercentage: 56.8,
        capacityUom: 'Hours',
      },
    ],
    materialRequirements: [
      {
        itemId: 'item-001',
        itemCode: 'RM-COPPER-WIRE',
        itemName: 'Copper Magnet Wire 18AWG',
        requiredQuantity: 2500,
        availableQuantity: 3000,
        shortageQuantity: 0,
        uom: 'Meters',
      },
      {
        itemId: 'item-002',
        itemCode: 'RM-STEEL-CORE',
        itemName: 'Laminated Steel Core',
        requiredQuantity: 500,
        availableQuantity: 450,
        shortageQuantity: 50,
        uom: 'Units',
        expectedDate: '2024-01-10',
        purchaseOrderId: 'po-001',
        purchaseOrderNumber: 'PO-2024-0015',
      },
      {
        itemId: 'item-010',
        itemCode: 'RM-PINION-GEAR',
        itemName: 'Pinion Gear 20T',
        requiredQuantity: 50,
        availableQuantity: 30,
        shortageQuantity: 20,
        uom: 'Units',
        expectedDate: '2024-01-18',
        purchaseOrderId: 'po-002',
        purchaseOrderNumber: 'PO-2024-0022',
      },
    ],
    totalPlannedQuantity: 1750,
    totalPlannedValue: 875000.00,
    currency: 'USD',
    notes: 'Plan updated to include rush order for gearboxes',
    createdBy: 'planner-001',
    createdAt: '2023-12-20T10:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z',
    submittedBy: 'planner-001',
    submittedAt: '2023-12-22T09:00:00Z',
    approvedBy: 'prod-manager',
    approvedAt: '2023-12-23T11:00:00Z',
    releasedBy: 'prod-manager',
    releasedAt: '2023-12-28T08:00:00Z',
  },
  {
    id: 'pp-002',
    planNumber: 'PP-2024-002',
    planName: 'February 2024 Production Plan',
    description: 'Monthly production plan for February 2024',
    planType: 'MPS',
    planPeriod: 'Monthly',
    startDate: '2024-02-01',
    endDate: '2024-02-29',
    status: 'Approved',
    plantId: 'plant-001',
    plantName: 'Main Manufacturing Plant',
    version: 1,
    items: [
      {
        id: 'ppi-005',
        lineNumber: 10,
        productId: 'prod-001',
        productCode: 'FG-MOTOR-001',
        productName: 'Electric Motor Assembly 5HP',
        plannedQuantity: 600,
        uom: 'Units',
        startDate: '2024-02-01',
        endDate: '2024-02-28',
        workCenterId: 'wc-001',
        workCenterName: 'Assembly Line A',
        bomId: 'bom-001',
        bomCode: 'BOM-MOTOR-001',
        priority: 1,
        status: 'Planned',
        demandSource: 'Forecast',
        materialAvailability: 'Unknown',
        capacityAvailability: 'Available',
      },
      {
        id: 'ppi-006',
        lineNumber: 20,
        productId: 'prod-002',
        productCode: 'FG-PUMP-001',
        productName: 'Centrifugal Pump 10HP',
        plannedQuantity: 180,
        uom: 'Units',
        startDate: '2024-02-01',
        endDate: '2024-02-25',
        workCenterId: 'wc-004',
        workCenterName: 'Pump Assembly Line',
        bomId: 'bom-002',
        bomCode: 'BOM-PUMP-001',
        priority: 2,
        status: 'Planned',
        demandSource: 'Forecast',
        materialAvailability: 'Unknown',
        capacityAvailability: 'Available',
      },
      {
        id: 'ppi-007',
        lineNumber: 30,
        productId: 'prod-007',
        productCode: 'FG-COUPLING-001',
        productName: 'Flexible Coupling Assembly',
        plannedQuantity: 300,
        uom: 'Units',
        startDate: '2024-02-05',
        endDate: '2024-02-20',
        workCenterId: 'wc-001',
        workCenterName: 'Assembly Line A',
        priority: 3,
        status: 'Planned',
        demandSource: 'Make to Stock',
        materialAvailability: 'Unknown',
        capacityAvailability: 'Available',
      },
    ],
    capacitySummary: [
      {
        workCenterId: 'wc-001',
        workCenterName: 'Assembly Line A',
        periodStart: '2024-02-01',
        periodEnd: '2024-02-29',
        availableCapacity: 1680,
        plannedCapacity: 1400,
        loadPercentage: 83.3,
        capacityUom: 'Hours',
      },
      {
        workCenterId: 'wc-004',
        workCenterName: 'Pump Assembly Line',
        periodStart: '2024-02-01',
        periodEnd: '2024-02-29',
        availableCapacity: 672,
        plannedCapacity: 580,
        loadPercentage: 86.3,
        capacityUom: 'Hours',
      },
    ],
    materialRequirements: [],
    totalPlannedQuantity: 1080,
    totalPlannedValue: 650000.00,
    currency: 'USD',
    createdBy: 'planner-001',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-18T11:00:00Z',
    submittedBy: 'planner-001',
    submittedAt: '2024-01-12T14:00:00Z',
    approvedBy: 'prod-manager',
    approvedAt: '2024-01-15T16:00:00Z',
  },
  {
    id: 'pp-003',
    planNumber: 'PP-2024-W03',
    planName: 'Week 3 - Operational Plan',
    description: 'Weekly operational production plan for Week 3 (Jan 15-21)',
    planType: 'Operational',
    planPeriod: 'Weekly',
    startDate: '2024-01-15',
    endDate: '2024-01-21',
    status: 'Released',
    plantId: 'plant-001',
    plantName: 'Main Manufacturing Plant',
    version: 1,
    items: [
      {
        id: 'ppi-008',
        lineNumber: 10,
        productId: 'prod-001',
        productCode: 'FG-MOTOR-001',
        productName: 'Electric Motor Assembly 5HP',
        plannedQuantity: 125,
        uom: 'Units',
        startDate: '2024-01-15',
        endDate: '2024-01-21',
        workCenterId: 'wc-001',
        workCenterName: 'Assembly Line A',
        bomId: 'bom-001',
        bomCode: 'BOM-MOTOR-001',
        priority: 1,
        status: 'In Progress',
        demandSource: 'Sales Order',
        materialAvailability: 'Available',
        capacityAvailability: 'Available',
      },
      {
        id: 'ppi-009',
        lineNumber: 20,
        productId: 'prod-003',
        productCode: 'FG-GEARBOX-001',
        productName: 'Industrial Gearbox 3:1',
        plannedQuantity: 25,
        uom: 'Units',
        startDate: '2024-01-15',
        endDate: '2024-01-21',
        workCenterId: 'wc-006',
        workCenterName: 'Gearbox Assembly',
        bomId: 'bom-003',
        bomCode: 'BOM-GEARBOX-001',
        priority: 1,
        notes: 'First batch of rush order',
        status: 'Released',
        demandSource: 'Sales Order',
        materialAvailability: 'Available',
        capacityAvailability: 'Available',
      },
    ],
    capacitySummary: [
      {
        workCenterId: 'wc-001',
        workCenterName: 'Assembly Line A',
        periodStart: '2024-01-15',
        periodEnd: '2024-01-21',
        availableCapacity: 440,
        plannedCapacity: 375,
        loadPercentage: 85.2,
        capacityUom: 'Hours',
      },
      {
        workCenterId: 'wc-006',
        workCenterName: 'Gearbox Assembly',
        periodStart: '2024-01-15',
        periodEnd: '2024-01-21',
        availableCapacity: 88,
        plannedCapacity: 75,
        loadPercentage: 85.2,
        capacityUom: 'Hours',
      },
    ],
    materialRequirements: [],
    totalPlannedQuantity: 150,
    totalPlannedValue: 95000.00,
    currency: 'USD',
    createdBy: 'planner-002',
    createdAt: '2024-01-12T14:00:00Z',
    updatedAt: '2024-01-14T16:00:00Z',
    submittedBy: 'planner-002',
    submittedAt: '2024-01-13T10:00:00Z',
    approvedBy: 'prod-manager',
    approvedAt: '2024-01-13T15:00:00Z',
    releasedBy: 'prod-manager',
    releasedAt: '2024-01-14T08:00:00Z',
  },
  {
    id: 'pp-004',
    planNumber: 'PP-2024-Q1',
    planName: 'Q1 2024 Tactical Plan',
    description: 'Quarterly tactical production plan for Q1 2024',
    planType: 'Tactical',
    planPeriod: 'Quarterly',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    status: 'In Progress',
    plantId: 'plant-001',
    plantName: 'Main Manufacturing Plant',
    version: 1,
    items: [
      {
        id: 'ppi-010',
        lineNumber: 10,
        productId: 'prod-001',
        productCode: 'FG-MOTOR-001',
        productName: 'Electric Motor Assembly 5HP',
        plannedQuantity: 1800,
        uom: 'Units',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        priority: 1,
        status: 'In Progress',
        demandSource: 'Forecast',
        materialAvailability: 'Available',
        capacityAvailability: 'Available',
      },
      {
        id: 'ppi-011',
        lineNumber: 20,
        productId: 'prod-002',
        productCode: 'FG-PUMP-001',
        productName: 'Centrifugal Pump 10HP',
        plannedQuantity: 600,
        uom: 'Units',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        priority: 2,
        status: 'In Progress',
        demandSource: 'Forecast',
        materialAvailability: 'Partial',
        capacityAvailability: 'Available',
      },
      {
        id: 'ppi-012',
        lineNumber: 30,
        productId: 'prod-003',
        productCode: 'FG-GEARBOX-001',
        productName: 'Industrial Gearbox 3:1',
        plannedQuantity: 150,
        uom: 'Units',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        priority: 2,
        status: 'In Progress',
        demandSource: 'Forecast',
        materialAvailability: 'Partial',
        capacityAvailability: 'Available',
      },
      {
        id: 'ppi-013',
        lineNumber: 40,
        productId: 'prod-006',
        productCode: 'FG-BEARING-001',
        productName: 'Precision Bearing Assembly',
        plannedQuantity: 5000,
        uom: 'Units',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        priority: 3,
        status: 'In Progress',
        demandSource: 'Make to Stock',
        materialAvailability: 'Available',
        capacityAvailability: 'Overloaded',
      },
    ],
    capacitySummary: [],
    materialRequirements: [],
    totalPlannedQuantity: 7550,
    totalPlannedValue: 3500000.00,
    currency: 'USD',
    notes: 'Q1 targets aligned with annual business plan',
    createdBy: 'planner-001',
    createdAt: '2023-11-15T10:00:00Z',
    updatedAt: '2024-01-05T09:00:00Z',
    submittedBy: 'planner-001',
    submittedAt: '2023-11-20T14:00:00Z',
    approvedBy: 'prod-manager',
    approvedAt: '2023-11-25T11:00:00Z',
    releasedBy: 'prod-manager',
    releasedAt: '2023-12-01T08:00:00Z',
  },
  {
    id: 'pp-005',
    planNumber: 'PP-2024-MRP-001',
    planName: 'MRP Run - January Week 4',
    description: 'Material Requirements Planning run for Week 4',
    planType: 'MRP',
    planPeriod: 'Weekly',
    startDate: '2024-01-22',
    endDate: '2024-01-28',
    status: 'Draft',
    plantId: 'plant-001',
    plantName: 'Main Manufacturing Plant',
    version: 1,
    items: [
      {
        id: 'ppi-014',
        lineNumber: 10,
        productId: 'item-001',
        productCode: 'RM-COPPER-WIRE',
        productName: 'Copper Magnet Wire 18AWG',
        plannedQuantity: 800,
        uom: 'Meters',
        startDate: '2024-01-22',
        endDate: '2024-01-28',
        priority: 1,
        status: 'Planned',
        demandSource: 'Make to Stock',
        materialAvailability: 'Not Available',
        capacityAvailability: 'Unknown',
      },
      {
        id: 'ppi-015',
        lineNumber: 20,
        productId: 'item-002',
        productCode: 'RM-STEEL-CORE',
        productName: 'Laminated Steel Core',
        plannedQuantity: 200,
        uom: 'Units',
        startDate: '2024-01-22',
        endDate: '2024-01-28',
        priority: 2,
        status: 'Planned',
        demandSource: 'Safety Stock',
        materialAvailability: 'Not Available',
        capacityAvailability: 'Unknown',
      },
    ],
    capacitySummary: [],
    materialRequirements: [],
    totalPlannedQuantity: 1000,
    totalPlannedValue: 45000.00,
    currency: 'USD',
    notes: 'Auto-generated from MRP explosion',
    createdBy: 'system',
    createdAt: '2024-01-19T06:00:00Z',
    updatedAt: '2024-01-19T06:00:00Z',
  },
];

// ============================================================================
// SERVICE CLASS
// ============================================================================

class ProductionPlanService {
  async getAllPlans(filters?: ProductionPlanFilters): Promise<ProductionPlan[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredPlans = [...MOCK_PRODUCTION_PLANS];

      if (filters) {
        if (filters.status) {
          filteredPlans = filteredPlans.filter((plan) => plan.status === filters.status);
        }
        if (filters.planType) {
          filteredPlans = filteredPlans.filter((plan) => plan.planType === filters.planType);
        }
        if (filters.planPeriod) {
          filteredPlans = filteredPlans.filter((plan) => plan.planPeriod === filters.planPeriod);
        }
        if (filters.plantId) {
          filteredPlans = filteredPlans.filter((plan) => plan.plantId === filters.plantId);
        }
        if (filters.fromDate) {
          filteredPlans = filteredPlans.filter((plan) => plan.startDate >= filters.fromDate!);
        }
        if (filters.toDate) {
          filteredPlans = filteredPlans.filter((plan) => plan.endDate <= filters.toDate!);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredPlans = filteredPlans.filter(
            (plan) =>
              plan.planNumber.toLowerCase().includes(searchLower) ||
              plan.planName.toLowerCase().includes(searchLower) ||
              plan.description?.toLowerCase().includes(searchLower)
          );
        }
      }

      return filteredPlans;
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await apiClient.get<ProductionPlan[]>(
      `/production/production-plans?${params.toString()}`
    );
    return response.data;
  }

  async getPlanById(id: string): Promise<ProductionPlan> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const plan = MOCK_PRODUCTION_PLANS.find((p) => p.id === id);
      if (!plan) {
        throw new Error('Production plan not found');
      }
      return plan;
    }

    const response = await apiClient.get<ProductionPlan>(`/production/production-plans/${id}`);
    return response.data;
  }

  async createPlan(data: CreateProductionPlanDto): Promise<ProductionPlan> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newPlan: ProductionPlan = {
        id: `pp-${Date.now()}`,
        planNumber: `PP-2024-${String(MOCK_PRODUCTION_PLANS.length + 1).padStart(3, '0')}`,
        planName: data.planName,
        description: data.description,
        planType: data.planType,
        planPeriod: data.planPeriod,
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'Draft',
        plantId: data.plantId,
        version: 1,
        items: data.items.map((item, idx) => ({
          ...item,
          id: `ppi-${Date.now()}-${idx}`,
          status: 'Planned' as const,
          materialAvailability: 'Unknown' as const,
          capacityAvailability: 'Unknown' as const,
        })),
        capacitySummary: [],
        materialRequirements: [],
        totalPlannedQuantity: data.items.reduce((sum, item) => sum + item.plannedQuantity, 0),
        totalPlannedValue: 0, // Would be calculated from item costs
        currency: 'USD',
        notes: data.notes,
        createdBy: 'current-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_PRODUCTION_PLANS.push(newPlan);
      return newPlan;
    }

    const response = await apiClient.post<ProductionPlan>('/production/production-plans', data);
    return response.data;
  }

  async updatePlan(id: string, data: UpdateProductionPlanDto): Promise<ProductionPlan> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_PRODUCTION_PLANS.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error('Production plan not found');
      }
      MOCK_PRODUCTION_PLANS[index] = {
        ...MOCK_PRODUCTION_PLANS[index],
        ...data,
        version: MOCK_PRODUCTION_PLANS[index].version + 1,
        updatedAt: new Date().toISOString(),
      } as ProductionPlan;
      return MOCK_PRODUCTION_PLANS[index];
    }

    const response = await apiClient.put<ProductionPlan>(
      `/production/production-plans/${id}`,
      data
    );
    return response.data;
  }

  async submitPlan(id: string): Promise<ProductionPlan> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_PRODUCTION_PLANS.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error('Production plan not found');
      }
      if (MOCK_PRODUCTION_PLANS[index].status !== 'Draft') {
        throw new Error('Only draft plans can be submitted');
      }
      MOCK_PRODUCTION_PLANS[index] = {
        ...MOCK_PRODUCTION_PLANS[index],
        status: 'Submitted',
        submittedBy: 'current-user',
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return MOCK_PRODUCTION_PLANS[index];
    }

    const response = await apiClient.post<ProductionPlan>(
      `/production/production-plans/${id}/submit`,
      {}
    );
    return response.data;
  }

  async approvePlan(id: string, comments?: string): Promise<ProductionPlan> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_PRODUCTION_PLANS.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error('Production plan not found');
      }
      if (MOCK_PRODUCTION_PLANS[index].status !== 'Submitted') {
        throw new Error('Only submitted plans can be approved');
      }
      MOCK_PRODUCTION_PLANS[index] = {
        ...MOCK_PRODUCTION_PLANS[index],
        status: 'Approved',
        approvedBy: 'current-user',
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return MOCK_PRODUCTION_PLANS[index];
    }

    const response = await apiClient.post<ProductionPlan>(
      `/production/production-plans/${id}/approve`,
      { comments }
    );
    return response.data;
  }

  async releasePlan(id: string): Promise<ProductionPlan> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_PRODUCTION_PLANS.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error('Production plan not found');
      }
      if (MOCK_PRODUCTION_PLANS[index].status !== 'Approved') {
        throw new Error('Only approved plans can be released');
      }
      MOCK_PRODUCTION_PLANS[index] = {
        ...MOCK_PRODUCTION_PLANS[index],
        status: 'Released',
        releasedBy: 'current-user',
        releasedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return MOCK_PRODUCTION_PLANS[index];
    }

    const response = await apiClient.post<ProductionPlan>(
      `/production/production-plans/${id}/release`,
      {}
    );
    return response.data;
  }

  async generateWorkOrders(id: string): Promise<{ workOrderIds: string[] }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const plan = MOCK_PRODUCTION_PLANS.find((p) => p.id === id);
      if (!plan) {
        throw new Error('Production plan not found');
      }
      if (plan.status !== 'Released') {
        throw new Error('Only released plans can generate work orders');
      }
      // Return mock work order IDs
      return {
        workOrderIds: plan.items.map((_, idx) => `wo-gen-${Date.now()}-${idx}`),
      };
    }

    const response = await apiClient.post<{ workOrderIds: string[] }>(
      `/production/production-plans/${id}/generate-work-orders`,
      {}
    );
    return response.data;
  }

  async runMRP(planId: string): Promise<{
    plannedOrders: ProductionPlanItem[];
    materialShortages: ProductionPlanMaterial[];
    capacityOverloads: ProductionPlanCapacity[];
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      // Return mock MRP results
      return {
        plannedOrders: [],
        materialShortages: [],
        capacityOverloads: [],
      };
    }

    const response = await apiClient.post<any>(
      `/production/production-plans/${planId}/run-mrp`,
      {}
    );
    return response.data;
  }

  async getPlanStatistics(): Promise<{
    total: number;
    byStatus: Record<ProductionPlanStatus, number>;
    byType: Record<ProductionPlanType, number>;
    byPeriod: Record<PlanPeriod, number>;
    totalPlannedValue: number;
    averageUtilization: number;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const byStatus: Record<string, number> = {};
      const byType: Record<string, number> = {};
      const byPeriod: Record<string, number> = {};
      let totalValue = 0;

      MOCK_PRODUCTION_PLANS.forEach((plan) => {
        byStatus[plan.status] = (byStatus[plan.status] || 0) + 1;
        byType[plan.planType] = (byType[plan.planType] || 0) + 1;
        byPeriod[plan.planPeriod] = (byPeriod[plan.planPeriod] || 0) + 1;
        totalValue += plan.totalPlannedValue;
      });

      return {
        total: MOCK_PRODUCTION_PLANS.length,
        byStatus: byStatus as Record<ProductionPlanStatus, number>,
        byType: byType as Record<ProductionPlanType, number>,
        byPeriod: byPeriod as Record<PlanPeriod, number>,
        totalPlannedValue: totalValue,
        averageUtilization: 82.5,
      };
    }

    const response = await apiClient.get<any>('/production/production-plans/statistics');
    return response.data;
  }
}

export const productionPlanService = new ProductionPlanService();
