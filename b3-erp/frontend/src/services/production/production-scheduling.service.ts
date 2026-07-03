import { apiClient } from '../api/client';

// ==================== TypeScript Interfaces ====================

export type ScheduleStatus = 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';
export type AllocationStatus = 'allocated' | 'in_use' | 'released' | 'unavailable';
export type ResourceType = 'machine' | 'labor' | 'tool' | 'material';
export type SequenceStatus = 'pending' | 'in_progress' | 'completed' | 'delayed';

export interface ProductionSchedule {
  id: string;
  companyId: string;
  scheduleNumber: string;
  name: string;
  description?: string;
  scheduleType: 'daily' | 'weekly' | 'monthly' | 'custom';
  status: ScheduleStatus;
  startDate: string;
  endDate: string;
  productionLineId?: string;
  workCenterId?: string;
  scheduleItems: {
    itemId: string;
    workOrderId: string;
    workOrderNumber: string;
    itemCode: string;
    itemName: string;
    quantity: number;
    startTime: string;
    endTime: string;
    duration: number;
    operationId: string;
    resourceId: string;
    status: string;
    sequence: number;
  }[];
  totalScheduledHours: number;
  totalWorkOrders: number;
  utilizationPercentage: number;
  resourceAllocations?: {
    resourceId: string;
    resourceType: string;
    resourceName: string;
    allocatedHours: number;
    availableHours: number;
    utilization: number;
  }[];
  conflicts?: {
    type: string;
    description: string;
    affectedItems: string[];
    resolution: string;
  }[];
  isOptimized: boolean;
  optimizationScore?: number;
  createdBy: string;
  publishedBy?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceAllocation {
  id: string;
  companyId: string;
  scheduleId?: string;
  workOrderId?: string;
  operationId?: string;
  resourceType: ResourceType;
  resourceId: string;
  resourceName: string;
  status: AllocationStatus;
  startTime: string;
  endTime: string;
  allocatedHours: number;
  actualHours?: number;
  quantity: number;
  uom?: string;
  costPerHour?: number;
  totalCost?: number;
  currency: string;
  priority: number;
  isOvertime: boolean;
  notes?: string;
  allocatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobSequence {
  id: string;
  companyId: string;
  sequenceNumber: string;
  scheduleId: string;
  workCenterId: string;
  workCenterName: string;
  sequenceDate: string;
  status: SequenceStatus;
  jobs: {
    jobId: string;
    workOrderId: string;
    workOrderNumber: string;
    operationId: string;
    operationName: string;
    sequence: number;
    priority: number;
    plannedStart: string;
    plannedEnd: string;
    actualStart?: string;
    actualEnd?: string;
    setupTime: number;
    runTime: number;
    status: string;
  }[];
  sequencingMethod: 'fifo' | 'edd' | 'spt' | 'priority' | 'custom';
  totalSetupTime: number;
  totalRunTime: number;
  efficiency: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Mock Data ====================

const MOCK_SCHEDULES: ProductionSchedule[] = [
  {
    id: 'sched-001',
    companyId: 'company-001',
    scheduleNumber: 'SCH-2025-001',
    name: 'Week 3 Production Schedule',
    description: 'Production schedule for week 3 of January 2025',
    scheduleType: 'weekly',
    status: 'in_progress',
    startDate: '2025-01-13',
    endDate: '2025-01-17',
    productionLineId: 'line-001',
    scheduleItems: [
      {
        itemId: 'si-001',
        workOrderId: 'wo-001',
        workOrderNumber: 'WO-2025-001',
        itemCode: 'PRD-A100',
        itemName: 'Assembly Unit A',
        quantity: 50,
        startTime: '2025-01-13T08:00:00Z',
        endTime: '2025-01-13T16:00:00Z',
        duration: 8,
        operationId: 'op-001',
        resourceId: 'res-001',
        status: 'completed',
        sequence: 1,
      },
      {
        itemId: 'si-002',
        workOrderId: 'wo-002',
        workOrderNumber: 'WO-2025-002',
        itemCode: 'PRD-B200',
        itemName: 'Component B',
        quantity: 100,
        startTime: '2025-01-14T08:00:00Z',
        endTime: '2025-01-14T16:00:00Z',
        duration: 8,
        operationId: 'op-002',
        resourceId: 'res-001',
        status: 'in_progress',
        sequence: 2,
      },
    ],
    totalScheduledHours: 40,
    totalWorkOrders: 5,
    utilizationPercentage: 85,
    resourceAllocations: [
      { resourceId: 'res-001', resourceType: 'machine', resourceName: 'CNC Mill 01', allocatedHours: 32, availableHours: 40, utilization: 80 },
    ],
    isOptimized: true,
    optimizationScore: 92.5,
    createdBy: 'user-001',
    publishedBy: 'user-001',
    publishedAt: '2025-01-10T14:00:00Z',
    createdAt: '2025-01-08T10:00:00Z',
    updatedAt: '2025-01-13T08:30:00Z',
  },
];

const MOCK_ALLOCATIONS: ResourceAllocation[] = [
  {
    id: 'alloc-001',
    companyId: 'company-001',
    scheduleId: 'sched-001',
    workOrderId: 'wo-001',
    operationId: 'op-001',
    resourceType: 'machine',
    resourceId: 'mach-001',
    resourceName: 'CNC Milling Center #1',
    status: 'in_use',
    startTime: '2025-01-13T08:00:00Z',
    endTime: '2025-01-13T16:00:00Z',
    allocatedHours: 8,
    actualHours: 7.5,
    quantity: 1,
    costPerHour: 150,
    totalCost: 1200,
    currency: 'USD',
    priority: 1,
    isOvertime: false,
    allocatedBy: 'user-001',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-13T16:00:00Z',
  },
  {
    id: 'alloc-002',
    companyId: 'company-001',
    scheduleId: 'sched-001',
    workOrderId: 'wo-001',
    operationId: 'op-001',
    resourceType: 'labor',
    resourceId: 'emp-001',
    resourceName: 'John Smith - Machinist',
    status: 'in_use',
    startTime: '2025-01-13T08:00:00Z',
    endTime: '2025-01-13T16:00:00Z',
    allocatedHours: 8,
    quantity: 1,
    costPerHour: 45,
    totalCost: 360,
    currency: 'USD',
    priority: 1,
    isOvertime: false,
    allocatedBy: 'user-001',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-13T16:00:00Z',
  },
];

const MOCK_SEQUENCES: JobSequence[] = [
  {
    id: 'seq-001',
    companyId: 'company-001',
    sequenceNumber: 'SEQ-2025-001',
    scheduleId: 'sched-001',
    workCenterId: 'wc-001',
    workCenterName: 'CNC Machining Center',
    sequenceDate: '2025-01-13',
    status: 'in_progress',
    jobs: [
      {
        jobId: 'job-001',
        workOrderId: 'wo-001',
        workOrderNumber: 'WO-2025-001',
        operationId: 'op-001',
        operationName: 'Rough Milling',
        sequence: 1,
        priority: 1,
        plannedStart: '2025-01-13T08:00:00Z',
        plannedEnd: '2025-01-13T10:00:00Z',
        actualStart: '2025-01-13T08:05:00Z',
        actualEnd: '2025-01-13T10:15:00Z',
        setupTime: 15,
        runTime: 105,
        status: 'completed',
      },
      {
        jobId: 'job-002',
        workOrderId: 'wo-001',
        workOrderNumber: 'WO-2025-001',
        operationId: 'op-002',
        operationName: 'Finish Milling',
        sequence: 2,
        priority: 1,
        plannedStart: '2025-01-13T10:30:00Z',
        plannedEnd: '2025-01-13T12:00:00Z',
        actualStart: '2025-01-13T10:45:00Z',
        setupTime: 10,
        runTime: 75,
        status: 'in_progress',
      },
    ],
    sequencingMethod: 'priority',
    totalSetupTime: 45,
    totalRunTime: 360,
    efficiency: 88.5,
    createdBy: 'user-001',
    createdAt: '2025-01-12T16:00:00Z',
    updatedAt: '2025-01-13T12:00:00Z',
  },
];

// ==================== Service Class ====================

class ProductionSchedulingService {
  private baseUrl = '/production';

  // Production Schedules
  async createSchedule(data: Partial<ProductionSchedule>): Promise<ProductionSchedule> {
    try {
      const response = await apiClient.post<ProductionSchedule>(`${this.baseUrl}/production-schedules`, data);
      return response.data;
    } catch (error) {
      console.error('API Error creating schedule, using mock data:', error);
      const newSchedule: ProductionSchedule = {
        id: `sched-${Date.now()}`,
        companyId: 'company-001',
        scheduleNumber: data.scheduleNumber || `SCH-${Date.now()}`,
        name: data.name || 'New Schedule',
        scheduleType: data.scheduleType || 'daily',
        status: 'draft',
        startDate: data.startDate || new Date().toISOString(),
        endDate: data.endDate || new Date().toISOString(),
        scheduleItems: data.scheduleItems || [],
        totalScheduledHours: 0,
        totalWorkOrders: 0,
        utilizationPercentage: 0,
        isOptimized: false,
        createdBy: 'user-001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      } as ProductionSchedule;
      MOCK_SCHEDULES.push(newSchedule);
      return newSchedule;
    }
  }

  async findAllSchedules(filters?: { status?: ScheduleStatus; productionLineId?: string }): Promise<ProductionSchedule[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.productionLineId) params.append('productionLineId', filters.productionLineId);
      const response = await apiClient.get<ProductionSchedule[]>(`${this.baseUrl}/production-schedules?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching schedules, using mock data:', error);
      let result = [...MOCK_SCHEDULES];
      if (filters?.status) result = result.filter((s) => s.status === filters.status);
      if (filters?.productionLineId) result = result.filter((s) => s.productionLineId === filters.productionLineId);
      return result;
    }
  }

  async findScheduleById(id: string): Promise<ProductionSchedule> {
    try {
      const response = await apiClient.get<ProductionSchedule>(`${this.baseUrl}/production-schedules/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching schedule, using mock data:', error);
      const schedule = MOCK_SCHEDULES.find((s) => s.id === id);
      if (!schedule) throw new Error(`Production Schedule with ID ${id} not found`);
      return schedule;
    }
  }

  async publishSchedule(id: string): Promise<ProductionSchedule> {
    try {
      const response = await apiClient.post<ProductionSchedule>(`${this.baseUrl}/production-schedules/${id}/publish`, {});
      return response.data;
    } catch (error) {
      console.error('API Error publishing schedule, using mock data:', error);
      const index = MOCK_SCHEDULES.findIndex((s) => s.id === id);
      if (index === -1) throw new Error(`Production Schedule with ID ${id} not found`);
      MOCK_SCHEDULES[index] = {
        ...MOCK_SCHEDULES[index],
        status: 'published',
        publishedBy: 'user-001',
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return MOCK_SCHEDULES[index];
    }
  }

  async optimizeSchedule(id: string): Promise<ProductionSchedule> {
    try {
      const response = await apiClient.post<ProductionSchedule>(`${this.baseUrl}/production-schedules/${id}/optimize`, {});
      return response.data;
    } catch (error) {
      console.error('API Error optimizing schedule, using mock data:', error);
      const index = MOCK_SCHEDULES.findIndex((s) => s.id === id);
      if (index === -1) throw new Error(`Production Schedule with ID ${id} not found`);
      MOCK_SCHEDULES[index] = {
        ...MOCK_SCHEDULES[index],
        isOptimized: true,
        optimizationScore: 95.0,
        updatedAt: new Date().toISOString(),
      };
      return MOCK_SCHEDULES[index];
    }
  }

  async getGanttData(id: string): Promise<{ scheduleId: string; scheduleName: string; scheduleItems: unknown[]; resourceAllocations: unknown[] }> {
    try {
      const response = await apiClient.get<{ scheduleId: string; scheduleName: string; scheduleItems: unknown[]; resourceAllocations: unknown[] }>(
        `${this.baseUrl}/production-schedules/${id}/gantt`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching Gantt data, using mock data:', error);
      const schedule = MOCK_SCHEDULES.find((s) => s.id === id);
      if (!schedule) throw new Error(`Production Schedule with ID ${id} not found`);
      return {
        scheduleId: schedule.id,
        scheduleName: schedule.name,
        scheduleItems: schedule.scheduleItems,
        resourceAllocations: schedule.resourceAllocations || [],
      };
    }
  }

  // Resource Allocations
  async findAllAllocations(filters?: { status?: AllocationStatus; resourceType?: ResourceType }): Promise<ResourceAllocation[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.resourceType) params.append('resourceType', filters.resourceType);
      const response = await apiClient.get<ResourceAllocation[]>(`${this.baseUrl}/resource-allocations?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching allocations, using mock data:', error);
      let result = [...MOCK_ALLOCATIONS];
      if (filters?.status) result = result.filter((a) => a.status === filters.status);
      if (filters?.resourceType) result = result.filter((a) => a.resourceType === filters.resourceType);
      return result;
    }
  }

  async checkResourceConflicts(
    resourceId: string,
    startTime: string,
    endTime: string
  ): Promise<{ hasConflicts: boolean; conflicts: ResourceAllocation[] }> {
    try {
      const response = await apiClient.post<{ hasConflicts: boolean; conflicts: ResourceAllocation[] }>(
        `${this.baseUrl}/resource-allocations/check-conflicts`,
        { resourceId, startTime, endTime }
      );
      return response.data;
    } catch (error) {
      console.error('API Error checking conflicts, using mock data:', error);
      const conflicts = MOCK_ALLOCATIONS.filter(
        (a) => a.resourceId === resourceId && a.startTime < endTime && a.endTime > startTime
      );
      return { hasConflicts: conflicts.length > 0, conflicts };
    }
  }

  async getResourceUtilization(
    resourceId: string,
    startDate: string,
    endDate: string
  ): Promise<{ resourceId: string; totalAllocatedHours: number; totalAvailableHours: number; utilizationRate: number }> {
    try {
      const response = await apiClient.get<{ resourceId: string; totalAllocatedHours: number; totalAvailableHours: number; utilizationRate: number }>(
        `${this.baseUrl}/resource-allocations/${resourceId}/utilization?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching utilization, using mock data:', error);
      const allocations = MOCK_ALLOCATIONS.filter((a) => a.resourceId === resourceId);
      const totalAllocatedHours = allocations.reduce((sum, a) => sum + a.allocatedHours, 0);
      return {
        resourceId,
        totalAllocatedHours,
        totalAvailableHours: 40,
        utilizationRate: (totalAllocatedHours / 40) * 100,
      };
    }
  }

  // Job Sequences
  async findAllJobSequences(filters?: { status?: SequenceStatus; workCenterId?: string }): Promise<JobSequence[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.workCenterId) params.append('workCenterId', filters.workCenterId);
      const response = await apiClient.get<JobSequence[]>(`${this.baseUrl}/job-sequences?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching job sequences, using mock data:', error);
      let result = [...MOCK_SEQUENCES];
      if (filters?.status) result = result.filter((s) => s.status === filters.status);
      if (filters?.workCenterId) result = result.filter((s) => s.workCenterId === filters.workCenterId);
      return result;
    }
  }

  async resequenceJobs(id: string, method: 'fifo' | 'edd' | 'spt' | 'priority'): Promise<JobSequence> {
    try {
      const response = await apiClient.post<JobSequence>(`${this.baseUrl}/job-sequences/${id}/resequence`, { method });
      return response.data;
    } catch (error) {
      console.error('API Error resequencing jobs, using mock data:', error);
      const index = MOCK_SEQUENCES.findIndex((s) => s.id === id);
      if (index === -1) throw new Error(`Job Sequence with ID ${id} not found`);
      MOCK_SEQUENCES[index] = { ...MOCK_SEQUENCES[index], sequencingMethod: method, updatedAt: new Date().toISOString() };
      return MOCK_SEQUENCES[index];
    }
  }
}

export const productionSchedulingService = new ProductionSchedulingService();
