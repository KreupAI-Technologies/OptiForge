import { apiClient } from '../api/client';

// ==================== TypeScript Interfaces ====================

export type CapacityPlanStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type DemandPlanStatus = 'draft' | 'approved' | 'active' | 'archived';
export type AggregatePlanStatus = 'draft' | 'approved' | 'active' | 'closed';
export type MasterScheduleStatus = 'draft' | 'released' | 'frozen' | 'closed';

export interface CapacityPlan {
  id: string;
  companyId: string;
  planNumber: string;
  name: string;
  description?: string;
  status: CapacityPlanStatus;
  workCenterId?: string;
  workCenterName?: string;
  startDate: string;
  endDate: string;
  requiredCapacity: number;
  availableCapacity: number;
  utilizationPercentage: number;
  capacityUnit: string;
  constraints?: {
    type: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DemandPlan {
  id: string;
  companyId: string;
  planNumber: string;
  name: string;
  description?: string;
  status: DemandPlanStatus;
  planningHorizon: number;
  horizonUnit: 'days' | 'weeks' | 'months';
  startDate: string;
  endDate: string;
  demandItems: {
    itemId: string;
    itemCode: string;
    itemName: string;
    forecastedDemand: number;
    actualDemand: number;
    variance: number;
    period: string;
  }[];
  forecastMethod: 'moving_average' | 'exponential_smoothing' | 'regression' | 'machine_learning';
  forecastAccuracy?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AggregatePlan {
  id: string;
  companyId: string;
  planNumber: string;
  name: string;
  description?: string;
  status: AggregatePlanStatus;
  planningHorizon: number;
  planningStrategy: 'chase' | 'level' | 'hybrid';
  startDate: string;
  endDate: string;
  periodPlans: {
    period: number;
    periodStart: string;
    periodEnd: string;
    demandForecast: number;
    productionPlan: number;
    inventoryLevel: number;
    workforceLevel: number;
    overtimeHours: number;
    subcontractUnits: number;
    backlogUnits: number;
    costs: {
      regularLabor: number;
      overtime: number;
      inventory: number;
      backlog: number;
      hiringFiring: number;
    };
  }[];
  costs?: {
    regularLaborCost: number;
    overtimeCost: number;
    inventoryHoldingCost: number;
    backlogCost: number;
    hiringCost: number;
    firingCost: number;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MasterSchedule {
  id: string;
  companyId: string;
  scheduleNumber: string;
  name: string;
  description?: string;
  status: MasterScheduleStatus;
  planningHorizonWeeks: number;
  frozenHorizonWeeks: number;
  startDate: string;
  endDate: string;
  scheduleItems: {
    itemId: string;
    itemCode: string;
    itemName: string;
    weeklySchedule: {
      week: number;
      weekStart: string;
      grossRequirements: number;
      scheduledReceipts: number;
      projectedAvailable: number;
      netRequirements: number;
      plannedOrderReceipt: number;
      plannedOrderRelease: number;
      mpsQuantity: number;
      availableToPromise: number;
    }[];
    totalMpsQuantity: number;
    totalAtp: number;
  }[];
  timeFenceDays: number;
  planningTimeFenceDays: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Mock Data ====================

const MOCK_CAPACITY_PLANS: CapacityPlan[] = [
  {
    id: 'cp-001',
    companyId: 'company-001',
    planNumber: 'CP-2025-001',
    name: 'Q1 2025 Production Capacity',
    description: 'First quarter capacity planning for assembly lines',
    status: 'active',
    workCenterId: 'wc-001',
    workCenterName: 'Assembly Line A',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    requiredCapacity: 8500,
    availableCapacity: 10000,
    utilizationPercentage: 85,
    capacityUnit: 'hours',
    constraints: [
      { type: 'equipment', description: 'CNC machine maintenance scheduled', impact: 'medium' },
      { type: 'labor', description: 'Two operators on leave in February', impact: 'low' },
    ],
    createdBy: 'user-001',
    createdAt: '2024-12-15T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'cp-002',
    companyId: 'company-001',
    planNumber: 'CP-2025-002',
    name: 'CNC Machining Center Capacity',
    description: 'Capacity plan for precision machining center',
    status: 'draft',
    workCenterId: 'wc-002',
    workCenterName: 'CNC Machining Center',
    startDate: '2025-02-01',
    endDate: '2025-04-30',
    requiredCapacity: 5200,
    availableCapacity: 6000,
    utilizationPercentage: 86.67,
    capacityUnit: 'hours',
    createdBy: 'user-001',
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-08T00:00:00Z',
  },
];

const MOCK_DEMAND_PLANS: DemandPlan[] = [
  {
    id: 'dp-001',
    companyId: 'company-001',
    planNumber: 'DP-2025-001',
    name: '2025 Annual Demand Forecast',
    description: 'Annual demand planning for all product lines',
    status: 'approved',
    planningHorizon: 12,
    horizonUnit: 'months',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    demandItems: [
      { itemId: 'item-001', itemCode: 'PRD-A100', itemName: 'Assembly Unit A', forecastedDemand: 1500, actualDemand: 1420, variance: -5.33, period: '2025-01' },
      { itemId: 'item-002', itemCode: 'PRD-B200', itemName: 'Component B', forecastedDemand: 3200, actualDemand: 3350, variance: 4.69, period: '2025-01' },
    ],
    forecastMethod: 'exponential_smoothing',
    forecastAccuracy: 94.5,
    createdBy: 'user-001',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
  },
];

const MOCK_AGGREGATE_PLANS: AggregatePlan[] = [
  {
    id: 'ap-001',
    companyId: 'company-001',
    planNumber: 'AP-2025-Q1',
    name: 'Q1 2025 Aggregate Production Plan',
    description: 'Quarterly aggregate plan using chase strategy',
    status: 'active',
    planningHorizon: 3,
    planningStrategy: 'chase',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    periodPlans: [
      {
        period: 1,
        periodStart: '2025-01-01',
        periodEnd: '2025-01-31',
        demandForecast: 5000,
        productionPlan: 5200,
        inventoryLevel: 200,
        workforceLevel: 50,
        overtimeHours: 100,
        subcontractUnits: 0,
        backlogUnits: 0,
        costs: { regularLabor: 125000, overtime: 5000, inventory: 2000, backlog: 0, hiringFiring: 0 },
      },
    ],
    costs: {
      regularLaborCost: 125000,
      overtimeCost: 5000,
      inventoryHoldingCost: 2000,
      backlogCost: 0,
      hiringCost: 0,
      firingCost: 0,
    },
    createdBy: 'user-001',
    createdAt: '2024-12-20T00:00:00Z',
    updatedAt: '2025-01-05T00:00:00Z',
  },
];

const MOCK_MASTER_SCHEDULES: MasterSchedule[] = [
  {
    id: 'ms-001',
    companyId: 'company-001',
    scheduleNumber: 'MPS-2025-001',
    name: 'January 2025 Master Schedule',
    description: 'Master production schedule for January',
    status: 'released',
    planningHorizonWeeks: 16,
    frozenHorizonWeeks: 4,
    startDate: '2025-01-01',
    endDate: '2025-04-30',
    scheduleItems: [
      {
        itemId: 'item-001',
        itemCode: 'PRD-A100',
        itemName: 'Assembly Unit A',
        weeklySchedule: [
          { week: 1, weekStart: '2025-01-06', grossRequirements: 100, scheduledReceipts: 0, projectedAvailable: 50, netRequirements: 50, plannedOrderReceipt: 75, plannedOrderRelease: 75, mpsQuantity: 75, availableToPromise: 25 },
          { week: 2, weekStart: '2025-01-13', grossRequirements: 120, scheduledReceipts: 75, projectedAvailable: 5, netRequirements: 45, plannedOrderReceipt: 100, plannedOrderRelease: 100, mpsQuantity: 100, availableToPromise: 55 },
        ],
        totalMpsQuantity: 175,
        totalAtp: 80,
      },
    ],
    timeFenceDays: 30,
    planningTimeFenceDays: 60,
    createdBy: 'user-001',
    createdAt: '2024-12-28T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
  },
];

// ==================== Service Class ====================

class ProductionPlanningService {
  private baseUrl = '/production';

  // Capacity Plans
  async createCapacityPlan(data: Partial<CapacityPlan>): Promise<CapacityPlan> {
    try {
      const response = await apiClient.post<CapacityPlan>(`${this.baseUrl}/capacity-plans`, data);
      return response.data;
    } catch (error) {
      console.error('API Error creating capacity plan, using mock data:', error);
      const newPlan: CapacityPlan = {
        id: `cp-${Date.now()}`,
        companyId: 'company-001',
        planNumber: data.planNumber || `CP-${Date.now()}`,
        name: data.name || 'New Capacity Plan',
        status: 'draft',
        startDate: data.startDate || new Date().toISOString(),
        endDate: data.endDate || new Date().toISOString(),
        requiredCapacity: data.requiredCapacity || 0,
        availableCapacity: data.availableCapacity || 0,
        utilizationPercentage: 0,
        capacityUnit: data.capacityUnit || 'hours',
        createdBy: 'user-001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      } as CapacityPlan;
      MOCK_CAPACITY_PLANS.push(newPlan);
      return newPlan;
    }
  }

  async findAllCapacityPlans(filters?: { status?: CapacityPlanStatus; workCenterId?: string }): Promise<CapacityPlan[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.workCenterId) params.append('workCenterId', filters.workCenterId);
      const response = await apiClient.get<CapacityPlan[]>(`${this.baseUrl}/capacity-plans?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching capacity plans, using mock data:', error);
      let result = [...MOCK_CAPACITY_PLANS];
      if (filters?.status) result = result.filter((p) => p.status === filters.status);
      if (filters?.workCenterId) result = result.filter((p) => p.workCenterId === filters.workCenterId);
      return result;
    }
  }

  async findCapacityPlanById(id: string): Promise<CapacityPlan> {
    try {
      const response = await apiClient.get<CapacityPlan>(`${this.baseUrl}/capacity-plans/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching capacity plan, using mock data:', error);
      const plan = MOCK_CAPACITY_PLANS.find((p) => p.id === id);
      if (!plan) throw new Error(`Capacity Plan with ID ${id} not found`);
      return plan;
    }
  }

  async updateCapacityPlan(id: string, data: Partial<CapacityPlan>): Promise<CapacityPlan> {
    try {
      const response = await apiClient.patch<CapacityPlan>(`${this.baseUrl}/capacity-plans/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('API Error updating capacity plan, using mock data:', error);
      const index = MOCK_CAPACITY_PLANS.findIndex((p) => p.id === id);
      if (index === -1) throw new Error(`Capacity Plan with ID ${id} not found`);
      MOCK_CAPACITY_PLANS[index] = { ...MOCK_CAPACITY_PLANS[index], ...data, updatedAt: new Date().toISOString() };
      return MOCK_CAPACITY_PLANS[index];
    }
  }

  async calculateUtilization(id: string): Promise<{ planId: string; utilization: number; requiredCapacity: number; availableCapacity: number }> {
    try {
      const response = await apiClient.get<{ planId: string; utilization: number; requiredCapacity: number; availableCapacity: number }>(
        `${this.baseUrl}/capacity-plans/${id}/utilization`
      );
      return response.data;
    } catch (error) {
      console.error('API Error calculating utilization, using mock data:', error);
      const plan = MOCK_CAPACITY_PLANS.find((p) => p.id === id);
      if (!plan) throw new Error(`Capacity Plan with ID ${id} not found`);
      return {
        planId: plan.id,
        utilization: plan.utilizationPercentage,
        requiredCapacity: plan.requiredCapacity,
        availableCapacity: plan.availableCapacity,
      };
    }
  }

  // Demand Plans
  async findAllDemandPlans(filters?: { status?: DemandPlanStatus }): Promise<DemandPlan[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      const response = await apiClient.get<DemandPlan[]>(`${this.baseUrl}/demand-plans?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching demand plans, using mock data:', error);
      let result = [...MOCK_DEMAND_PLANS];
      if (filters?.status) result = result.filter((p) => p.status === filters.status);
      return result;
    }
  }

  async findDemandPlanById(id: string): Promise<DemandPlan> {
    try {
      const response = await apiClient.get<DemandPlan>(`${this.baseUrl}/demand-plans/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching demand plan, using mock data:', error);
      const plan = MOCK_DEMAND_PLANS.find((p) => p.id === id);
      if (!plan) throw new Error(`Demand Plan with ID ${id} not found`);
      return plan;
    }
  }

  // Aggregate Plans
  async findAllAggregatePlans(filters?: { status?: AggregatePlanStatus }): Promise<AggregatePlan[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      const response = await apiClient.get<AggregatePlan[]>(`${this.baseUrl}/aggregate-plans?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching aggregate plans, using mock data:', error);
      let result = [...MOCK_AGGREGATE_PLANS];
      if (filters?.status) result = result.filter((p) => p.status === filters.status);
      return result;
    }
  }

  // Master Schedules
  async findAllMasterSchedules(filters?: { status?: MasterScheduleStatus }): Promise<MasterSchedule[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      const response = await apiClient.get<MasterSchedule[]>(`${this.baseUrl}/master-schedules?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching master schedules, using mock data:', error);
      let result = [...MOCK_MASTER_SCHEDULES];
      if (filters?.status) result = result.filter((s) => s.status === filters.status);
      return result;
    }
  }

  async findMasterScheduleById(id: string): Promise<MasterSchedule> {
    try {
      const response = await apiClient.get<MasterSchedule>(`${this.baseUrl}/master-schedules/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching master schedule, using mock data:', error);
      const schedule = MOCK_MASTER_SCHEDULES.find((s) => s.id === id);
      if (!schedule) throw new Error(`Master Schedule with ID ${id} not found`);
      return schedule;
    }
  }

  async freezeMasterSchedule(id: string): Promise<MasterSchedule> {
    try {
      const response = await apiClient.post<MasterSchedule>(`${this.baseUrl}/master-schedules/${id}/freeze`, {});
      return response.data;
    } catch (error) {
      console.error('API Error freezing master schedule, using mock data:', error);
      const index = MOCK_MASTER_SCHEDULES.findIndex((s) => s.id === id);
      if (index === -1) throw new Error(`Master Schedule with ID ${id} not found`);
      MOCK_MASTER_SCHEDULES[index] = { ...MOCK_MASTER_SCHEDULES[index], status: 'frozen', updatedAt: new Date().toISOString() };
      return MOCK_MASTER_SCHEDULES[index];
    }
  }

  async calculateATP(id: string): Promise<{ scheduleId: string; scheduleName: string; atpCalculation: unknown[] }> {
    try {
      const response = await apiClient.get<{ scheduleId: string; scheduleName: string; atpCalculation: unknown[] }>(
        `${this.baseUrl}/master-schedules/${id}/atp`
      );
      return response.data;
    } catch (error) {
      console.error('API Error calculating ATP, using mock data:', error);
      const schedule = MOCK_MASTER_SCHEDULES.find((s) => s.id === id);
      if (!schedule) throw new Error(`Master Schedule with ID ${id} not found`);
      return {
        scheduleId: schedule.id,
        scheduleName: schedule.name,
        atpCalculation: schedule.scheduleItems.map((item) => ({
          itemId: item.itemId,
          itemCode: item.itemCode,
          itemName: item.itemName,
          totalMpsQuantity: item.totalMpsQuantity,
          totalAtp: item.totalAtp,
        })),
      };
    }
  }
}

export const productionPlanningService = new ProductionPlanningService();
