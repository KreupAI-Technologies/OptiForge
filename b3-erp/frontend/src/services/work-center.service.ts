import { apiClient } from './api/client';

// ============================================================================
// INTERFACES
// ============================================================================

export type WorkCenterStatus = 'Active' | 'Inactive' | 'Maintenance' | 'Decommissioned';

export type WorkCenterType = 'Machine' | 'Assembly' | 'Manual' | 'Automated' | 'Quality Control';

export interface WorkCenterCapacity {
  capacityPerHour: number;
  capacityPerDay: number;
  capacityPerWeek: number;
  capacityUom: string;
  efficiency: number; // percentage
  utilization: number; // percentage
}

export interface WorkCenterSchedule {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  dayName: string;
  startTime: string; // HH:mm format
  endTime: string;
  breakMinutes: number;
  isWorkingDay: boolean;
}

export interface WorkCenterCost {
  laborRate: number; // per hour
  overheadRate: number; // per hour
  setupCost: number; // fixed cost per setup
  currency: string;
}

export interface WorkCenterMaintenance {
  id: string;
  maintenanceType: 'Preventive' | 'Corrective' | 'Predictive';
  scheduledDate: string;
  completedDate?: string;
  description: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  technician?: string;
  cost?: number;
  notes?: string;
}

export interface WorkCenter {
  id: string;
  workCenterCode: string;
  workCenterName: string;
  description?: string;
  type: WorkCenterType;
  status: WorkCenterStatus;
  departmentId?: string;
  departmentName?: string;
  locationId?: string;
  locationName?: string;
  capacity: WorkCenterCapacity;
  schedule: WorkCenterSchedule[];
  costs: WorkCenterCost;
  supervisor?: string;
  supervisorName?: string;
  operators: string[];
  equipment?: string[];
  skills?: string[];
  currentJobId?: string;
  currentJobNumber?: string;
  queuedJobs: number;
  nextMaintenanceDate?: string;
  lastMaintenanceDate?: string;
  maintenanceHistory: WorkCenterMaintenance[];
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkCenterDto {
  workCenterCode: string;
  workCenterName: string;
  description?: string;
  type: WorkCenterType;
  departmentId?: string;
  locationId?: string;
  capacity: Partial<WorkCenterCapacity>;
  schedule?: Partial<WorkCenterSchedule>[];
  costs: Partial<WorkCenterCost>;
  supervisor?: string;
  notes?: string;
}

export interface UpdateWorkCenterDto extends Partial<CreateWorkCenterDto> {
  status?: WorkCenterStatus;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const USE_MOCK_DATA = false;

const DEFAULT_SCHEDULE: WorkCenterSchedule[] = [
  { dayOfWeek: 0, dayName: 'Sunday', startTime: '00:00', endTime: '00:00', breakMinutes: 0, isWorkingDay: false },
  { dayOfWeek: 1, dayName: 'Monday', startTime: '08:00', endTime: '17:00', breakMinutes: 60, isWorkingDay: true },
  { dayOfWeek: 2, dayName: 'Tuesday', startTime: '08:00', endTime: '17:00', breakMinutes: 60, isWorkingDay: true },
  { dayOfWeek: 3, dayName: 'Wednesday', startTime: '08:00', endTime: '17:00', breakMinutes: 60, isWorkingDay: true },
  { dayOfWeek: 4, dayName: 'Thursday', startTime: '08:00', endTime: '17:00', breakMinutes: 60, isWorkingDay: true },
  { dayOfWeek: 5, dayName: 'Friday', startTime: '08:00', endTime: '17:00', breakMinutes: 60, isWorkingDay: true },
  { dayOfWeek: 6, dayName: 'Saturday', startTime: '08:00', endTime: '12:00', breakMinutes: 0, isWorkingDay: true },
];

export const MOCK_WORK_CENTERS: WorkCenter[] = [
  {
    id: 'wc-001',
    workCenterCode: 'WC-ASSY-A',
    workCenterName: 'Assembly Line A',
    description: 'Primary assembly line for motor and general products',
    type: 'Assembly',
    status: 'Active',
    departmentId: 'dept-001',
    departmentName: 'Production',
    locationId: 'loc-001',
    locationName: 'Building A - Floor 1',
    capacity: {
      capacityPerHour: 10,
      capacityPerDay: 80,
      capacityPerWeek: 440,
      capacityUom: 'Units',
      efficiency: 92,
      utilization: 85,
    },
    schedule: DEFAULT_SCHEDULE,
    costs: {
      laborRate: 30.00,
      overheadRate: 15.00,
      setupCost: 150.00,
      currency: 'USD',
    },
    supervisor: 'emp-010',
    supervisorName: 'Robert Miller',
    operators: ['emp-001', 'emp-002', 'emp-003', 'emp-004'],
    equipment: ['Assembly Fixture A1', 'Torque Wrench Set', 'Pneumatic Tools'],
    skills: ['Motor Assembly', 'Electrical Wiring', 'Quality Inspection'],
    currentJobId: 'wo-001',
    currentJobNumber: 'WO-2024-0001',
    queuedJobs: 3,
    nextMaintenanceDate: '2024-02-15',
    lastMaintenanceDate: '2024-01-15',
    maintenanceHistory: [
      {
        id: 'maint-001',
        maintenanceType: 'Preventive',
        scheduledDate: '2024-01-15',
        completedDate: '2024-01-15',
        description: 'Monthly preventive maintenance',
        status: 'Completed',
        technician: 'Tech-001',
        cost: 250.00,
      },
    ],
    notes: 'Primary assembly line - highest throughput',
    createdBy: 'admin',
    createdAt: '2023-06-01T10:00:00Z',
    updatedAt: '2024-01-18T14:30:00Z',
  },
  {
    id: 'wc-002',
    workCenterCode: 'WC-WIND-01',
    workCenterName: 'Winding Station',
    description: 'Automated winding station for motor stators',
    type: 'Automated',
    status: 'Active',
    departmentId: 'dept-001',
    departmentName: 'Production',
    locationId: 'loc-001',
    locationName: 'Building A - Floor 1',
    capacity: {
      capacityPerHour: 6,
      capacityPerDay: 48,
      capacityPerWeek: 264,
      capacityUom: 'Stators',
      efficiency: 95,
      utilization: 78,
    },
    schedule: DEFAULT_SCHEDULE,
    costs: {
      laborRate: 25.00,
      overheadRate: 20.00,
      setupCost: 200.00,
      currency: 'USD',
    },
    supervisor: 'emp-010',
    supervisorName: 'Robert Miller',
    operators: ['emp-005', 'emp-006'],
    equipment: ['Winding Machine WM-500', 'Wire Tension Controller', 'Insulation Tester'],
    skills: ['Winding Operation', 'Machine Setup', 'Wire Handling'],
    queuedJobs: 2,
    nextMaintenanceDate: '2024-02-01',
    lastMaintenanceDate: '2024-01-10',
    maintenanceHistory: [],
    createdBy: 'admin',
    createdAt: '2023-06-01T10:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 'wc-003',
    workCenterCode: 'WC-ROTOR-01',
    workCenterName: 'Rotor Station',
    description: 'Rotor assembly and balancing station',
    type: 'Machine',
    status: 'Active',
    departmentId: 'dept-001',
    departmentName: 'Production',
    locationId: 'loc-001',
    locationName: 'Building A - Floor 1',
    capacity: {
      capacityPerHour: 8,
      capacityPerDay: 64,
      capacityPerWeek: 352,
      capacityUom: 'Rotors',
      efficiency: 90,
      utilization: 82,
    },
    schedule: DEFAULT_SCHEDULE,
    costs: {
      laborRate: 22.00,
      overheadRate: 12.00,
      setupCost: 100.00,
      currency: 'USD',
    },
    supervisor: 'emp-010',
    supervisorName: 'Robert Miller',
    operators: ['emp-007', 'emp-008'],
    equipment: ['Dynamic Balancing Machine', 'Hydraulic Press', 'Bearing Heater'],
    skills: ['Rotor Assembly', 'Balancing', 'Bearing Installation'],
    currentJobId: 'wo-001',
    currentJobNumber: 'WO-2024-0001',
    queuedJobs: 1,
    nextMaintenanceDate: '2024-02-10',
    lastMaintenanceDate: '2024-01-05',
    maintenanceHistory: [],
    createdBy: 'admin',
    createdAt: '2023-06-01T10:00:00Z',
    updatedAt: '2024-01-17T11:00:00Z',
  },
  {
    id: 'wc-004',
    workCenterCode: 'WC-PUMP-01',
    workCenterName: 'Pump Assembly Line',
    description: 'Dedicated line for centrifugal pump assembly',
    type: 'Assembly',
    status: 'Active',
    departmentId: 'dept-001',
    departmentName: 'Production',
    locationId: 'loc-002',
    locationName: 'Building A - Floor 2',
    capacity: {
      capacityPerHour: 4,
      capacityPerDay: 32,
      capacityPerWeek: 176,
      capacityUom: 'Pumps',
      efficiency: 88,
      utilization: 90,
    },
    schedule: DEFAULT_SCHEDULE,
    costs: {
      laborRate: 28.00,
      overheadRate: 14.00,
      setupCost: 180.00,
      currency: 'USD',
    },
    supervisor: 'emp-011',
    supervisorName: 'Sarah Thompson',
    operators: ['emp-009', 'emp-012', 'emp-013'],
    equipment: ['Pump Test Stand', 'Seal Press', 'Hydraulic Test Bench'],
    skills: ['Pump Assembly', 'Hydraulic Testing', 'Seal Installation'],
    currentJobId: 'wo-010',
    currentJobNumber: 'WO-2024-0010',
    queuedJobs: 4,
    nextMaintenanceDate: '2024-01-25',
    lastMaintenanceDate: '2024-01-02',
    maintenanceHistory: [],
    createdBy: 'admin',
    createdAt: '2023-07-15T10:00:00Z',
    updatedAt: '2024-01-19T16:00:00Z',
  },
  {
    id: 'wc-005',
    workCenterCode: 'WC-CNC-01',
    workCenterName: 'CNC Machining Center',
    description: 'Multi-axis CNC machining center for precision components',
    type: 'Machine',
    status: 'Active',
    departmentId: 'dept-002',
    departmentName: 'Machining',
    locationId: 'loc-003',
    locationName: 'Building B - Floor 1',
    capacity: {
      capacityPerHour: 3,
      capacityPerDay: 24,
      capacityPerWeek: 132,
      capacityUom: 'Parts',
      efficiency: 94,
      utilization: 88,
    },
    schedule: [
      { dayOfWeek: 0, dayName: 'Sunday', startTime: '00:00', endTime: '00:00', breakMinutes: 0, isWorkingDay: false },
      { dayOfWeek: 1, dayName: 'Monday', startTime: '06:00', endTime: '22:00', breakMinutes: 120, isWorkingDay: true },
      { dayOfWeek: 2, dayName: 'Tuesday', startTime: '06:00', endTime: '22:00', breakMinutes: 120, isWorkingDay: true },
      { dayOfWeek: 3, dayName: 'Wednesday', startTime: '06:00', endTime: '22:00', breakMinutes: 120, isWorkingDay: true },
      { dayOfWeek: 4, dayName: 'Thursday', startTime: '06:00', endTime: '22:00', breakMinutes: 120, isWorkingDay: true },
      { dayOfWeek: 5, dayName: 'Friday', startTime: '06:00', endTime: '22:00', breakMinutes: 120, isWorkingDay: true },
      { dayOfWeek: 6, dayName: 'Saturday', startTime: '06:00', endTime: '14:00', breakMinutes: 30, isWorkingDay: true },
    ],
    costs: {
      laborRate: 35.00,
      overheadRate: 25.00,
      setupCost: 300.00,
      currency: 'USD',
    },
    supervisor: 'emp-014',
    supervisorName: 'Michael Chang',
    operators: ['emp-003', 'emp-015', 'emp-016'],
    equipment: ['5-Axis CNC Mill', 'Tool Presetter', 'CMM Probe System'],
    skills: ['CNC Programming', 'Precision Machining', 'Tool Setup'],
    currentJobId: 'wo-007',
    currentJobNumber: 'WO-2024-0007',
    queuedJobs: 5,
    nextMaintenanceDate: '2024-02-05',
    lastMaintenanceDate: '2024-01-12',
    maintenanceHistory: [
      {
        id: 'maint-002',
        maintenanceType: 'Preventive',
        scheduledDate: '2024-01-12',
        completedDate: '2024-01-12',
        description: 'Spindle inspection and lubrication',
        status: 'Completed',
        technician: 'Tech-002',
        cost: 450.00,
      },
    ],
    notes: 'High precision machining - critical path equipment',
    createdBy: 'admin',
    createdAt: '2023-05-01T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
  },
  {
    id: 'wc-006',
    workCenterCode: 'WC-GEAR-01',
    workCenterName: 'Gearbox Assembly',
    description: 'Specialized station for industrial gearbox assembly',
    type: 'Assembly',
    status: 'Active',
    departmentId: 'dept-001',
    departmentName: 'Production',
    locationId: 'loc-002',
    locationName: 'Building A - Floor 2',
    capacity: {
      capacityPerHour: 2,
      capacityPerDay: 16,
      capacityPerWeek: 88,
      capacityUom: 'Gearboxes',
      efficiency: 85,
      utilization: 72,
    },
    schedule: DEFAULT_SCHEDULE,
    costs: {
      laborRate: 35.00,
      overheadRate: 18.00,
      setupCost: 250.00,
      currency: 'USD',
    },
    supervisor: 'emp-011',
    supervisorName: 'Sarah Thompson',
    operators: ['emp-017', 'emp-018'],
    equipment: ['Gear Meshing Stand', 'Backlash Tester', 'Torque Test Bench'],
    skills: ['Gearbox Assembly', 'Gear Alignment', 'Precision Measurement'],
    queuedJobs: 2,
    nextMaintenanceDate: '2024-02-20',
    lastMaintenanceDate: '2023-12-20',
    maintenanceHistory: [],
    createdBy: 'admin',
    createdAt: '2023-08-01T10:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z',
  },
  {
    id: 'wc-007',
    workCenterCode: 'WC-GEAR-CUT',
    workCenterName: 'Gear Cutting Station',
    description: 'Gear hobbing and cutting operations',
    type: 'Machine',
    status: 'Maintenance',
    departmentId: 'dept-002',
    departmentName: 'Machining',
    locationId: 'loc-003',
    locationName: 'Building B - Floor 1',
    capacity: {
      capacityPerHour: 4,
      capacityPerDay: 32,
      capacityPerWeek: 176,
      capacityUom: 'Gears',
      efficiency: 88,
      utilization: 0,
    },
    schedule: DEFAULT_SCHEDULE,
    costs: {
      laborRate: 40.00,
      overheadRate: 30.00,
      setupCost: 400.00,
      currency: 'USD',
    },
    supervisor: 'emp-014',
    supervisorName: 'Michael Chang',
    operators: ['emp-019', 'emp-020'],
    equipment: ['Gear Hobbing Machine', 'Gear Shaper', 'Profile Grinder'],
    skills: ['Gear Cutting', 'Hobbing', 'Tool Sharpening'],
    queuedJobs: 3,
    nextMaintenanceDate: '2024-01-20',
    lastMaintenanceDate: '2024-01-18',
    maintenanceHistory: [
      {
        id: 'maint-003',
        maintenanceType: 'Corrective',
        scheduledDate: '2024-01-18',
        description: 'Spindle bearing replacement',
        status: 'In Progress',
        technician: 'Tech-003',
        notes: 'Expected completion: Jan 20',
      },
    ],
    notes: 'Currently under maintenance - bearing replacement',
    createdBy: 'admin',
    createdAt: '2023-08-15T10:00:00Z',
    updatedAt: '2024-01-18T16:00:00Z',
  },
  {
    id: 'wc-008',
    workCenterCode: 'WC-HEAT-01',
    workCenterName: 'Heat Treatment Furnace',
    description: 'Industrial furnace for heat treatment operations',
    type: 'Machine',
    status: 'Active',
    departmentId: 'dept-003',
    departmentName: 'Heat Treatment',
    locationId: 'loc-004',
    locationName: 'Building C - Heat Treatment Bay',
    capacity: {
      capacityPerHour: 1,
      capacityPerDay: 4, // Batch processing
      capacityPerWeek: 24,
      capacityUom: 'Batches',
      efficiency: 98,
      utilization: 65,
    },
    schedule: [
      { dayOfWeek: 0, dayName: 'Sunday', startTime: '00:00', endTime: '00:00', breakMinutes: 0, isWorkingDay: false },
      { dayOfWeek: 1, dayName: 'Monday', startTime: '00:00', endTime: '23:59', breakMinutes: 0, isWorkingDay: true },
      { dayOfWeek: 2, dayName: 'Tuesday', startTime: '00:00', endTime: '23:59', breakMinutes: 0, isWorkingDay: true },
      { dayOfWeek: 3, dayName: 'Wednesday', startTime: '00:00', endTime: '23:59', breakMinutes: 0, isWorkingDay: true },
      { dayOfWeek: 4, dayName: 'Thursday', startTime: '00:00', endTime: '23:59', breakMinutes: 0, isWorkingDay: true },
      { dayOfWeek: 5, dayName: 'Friday', startTime: '00:00', endTime: '23:59', breakMinutes: 0, isWorkingDay: true },
      { dayOfWeek: 6, dayName: 'Saturday', startTime: '00:00', endTime: '12:00', breakMinutes: 0, isWorkingDay: true },
    ],
    costs: {
      laborRate: 20.00,
      overheadRate: 50.00,
      setupCost: 100.00,
      currency: 'USD',
    },
    supervisor: 'emp-021',
    supervisorName: 'David Wilson',
    operators: ['emp-022', 'emp-023'],
    equipment: ['Gas Furnace HT-1000', 'Quench Tank', 'Tempering Oven', 'Pyrometer'],
    skills: ['Heat Treatment', 'Metallurgy', 'Temperature Control'],
    queuedJobs: 2,
    nextMaintenanceDate: '2024-03-01',
    lastMaintenanceDate: '2023-12-01',
    maintenanceHistory: [
      {
        id: 'maint-004',
        maintenanceType: 'Preventive',
        scheduledDate: '2023-12-01',
        completedDate: '2023-12-01',
        description: 'Annual furnace calibration and inspection',
        status: 'Completed',
        technician: 'Tech-004',
        cost: 1200.00,
      },
    ],
    notes: '24/7 operation capability for batch processing',
    createdBy: 'admin',
    createdAt: '2023-04-01T10:00:00Z',
    updatedAt: '2024-01-05T08:00:00Z',
  },
];

// ============================================================================
// SERVICE CLASS
// ============================================================================

class WorkCenterService {
  async getAllWorkCenters(): Promise<WorkCenter[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [...MOCK_WORK_CENTERS];
    }

    const response = await apiClient.get<WorkCenter[]>('/production/work-centers');
    return response.data;
  }

  async getWorkCenterById(id: string): Promise<WorkCenter> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const workCenter = MOCK_WORK_CENTERS.find((wc) => wc.id === id);
      if (!workCenter) {
        throw new Error('Work center not found');
      }
      return workCenter;
    }

    const response = await apiClient.get<WorkCenter>(`/production/work-centers/${id}`);
    return response.data;
  }

  async createWorkCenter(data: CreateWorkCenterDto): Promise<WorkCenter> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newWorkCenter: WorkCenter = {
        id: `wc-${Date.now()}`,
        workCenterCode: data.workCenterCode,
        workCenterName: data.workCenterName,
        description: data.description,
        type: data.type,
        status: 'Active',
        departmentId: data.departmentId,
        locationId: data.locationId,
        capacity: {
          capacityPerHour: data.capacity.capacityPerHour || 1,
          capacityPerDay: data.capacity.capacityPerDay || 8,
          capacityPerWeek: data.capacity.capacityPerWeek || 40,
          capacityUom: data.capacity.capacityUom || 'Units',
          efficiency: data.capacity.efficiency || 100,
          utilization: 0,
        },
        schedule: data.schedule as WorkCenterSchedule[] || DEFAULT_SCHEDULE,
        costs: {
          laborRate: data.costs.laborRate || 0,
          overheadRate: data.costs.overheadRate || 0,
          setupCost: data.costs.setupCost || 0,
          currency: data.costs.currency || 'USD',
        },
        supervisor: data.supervisor,
        operators: [],
        queuedJobs: 0,
        maintenanceHistory: [],
        notes: data.notes,
        createdBy: 'current-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_WORK_CENTERS.push(newWorkCenter);
      return newWorkCenter;
    }

    const response = await apiClient.post<WorkCenter>('/production/work-centers', data);
    return response.data;
  }

  async updateWorkCenter(id: string, data: UpdateWorkCenterDto): Promise<WorkCenter> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_WORK_CENTERS.findIndex((wc) => wc.id === id);
      if (index === -1) {
        throw new Error('Work center not found');
      }
      MOCK_WORK_CENTERS[index] = {
        ...MOCK_WORK_CENTERS[index],
        ...data,
        capacity: data.capacity
          ? { ...MOCK_WORK_CENTERS[index].capacity, ...data.capacity }
          : MOCK_WORK_CENTERS[index].capacity,
        costs: data.costs
          ? { ...MOCK_WORK_CENTERS[index].costs, ...data.costs }
          : MOCK_WORK_CENTERS[index].costs,
        updatedAt: new Date().toISOString(),
      } as WorkCenter;
      return MOCK_WORK_CENTERS[index];
    }

    const response = await apiClient.put<WorkCenter>(`/production/work-centers/${id}`, data);
    return response.data;
  }

  async getWorkCenterCapacity(id: string, startDate: string, endDate: string): Promise<{
    workCenterId: string;
    workCenterName: string;
    period: { start: string; end: string };
    totalCapacity: number;
    allocatedCapacity: number;
    availableCapacity: number;
    utilizationPercentage: number;
    dailyBreakdown: { date: string; allocated: number; available: number }[];
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const workCenter = MOCK_WORK_CENTERS.find((wc) => wc.id === id);
      if (!workCenter) {
        throw new Error('Work center not found');
      }

      const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
      const totalCapacity = workCenter.capacity.capacityPerDay * days;
      const allocatedCapacity = Math.floor(totalCapacity * (workCenter.capacity.utilization / 100));

      return {
        workCenterId: id,
        workCenterName: workCenter.workCenterName,
        period: { start: startDate, end: endDate },
        totalCapacity,
        allocatedCapacity,
        availableCapacity: totalCapacity - allocatedCapacity,
        utilizationPercentage: workCenter.capacity.utilization,
        dailyBreakdown: [],
      };
    }

    const params = new URLSearchParams({ startDate, endDate });
    const response = await apiClient.get<any>(`/production/work-centers/${id}/capacity?${params.toString()}`);
    return response.data;
  }

  async getWorkCenterStatistics(): Promise<{
    total: number;
    byStatus: Record<WorkCenterStatus, number>;
    byType: Record<WorkCenterType, number>;
    averageUtilization: number;
    averageEfficiency: number;
    inMaintenance: number;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const byStatus: Record<string, number> = {};
      const byType: Record<string, number> = {};
      let totalUtilization = 0;
      let totalEfficiency = 0;

      MOCK_WORK_CENTERS.forEach((wc) => {
        byStatus[wc.status] = (byStatus[wc.status] || 0) + 1;
        byType[wc.type] = (byType[wc.type] || 0) + 1;
        totalUtilization += wc.capacity.utilization;
        totalEfficiency += wc.capacity.efficiency;
      });

      return {
        total: MOCK_WORK_CENTERS.length,
        byStatus: byStatus as Record<WorkCenterStatus, number>,
        byType: byType as Record<WorkCenterType, number>,
        averageUtilization: totalUtilization / MOCK_WORK_CENTERS.length,
        averageEfficiency: totalEfficiency / MOCK_WORK_CENTERS.length,
        inMaintenance: MOCK_WORK_CENTERS.filter((wc) => wc.status === 'Maintenance').length,
      };
    }

    const response = await apiClient.get<any>('/production/work-centers/statistics');
    return response.data;
  }

  async scheduleMaintenace(id: string, maintenance: Omit<WorkCenterMaintenance, 'id'>): Promise<WorkCenterMaintenance> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const workCenter = MOCK_WORK_CENTERS.find((wc) => wc.id === id);
      if (!workCenter) {
        throw new Error('Work center not found');
      }
      const newMaintenance: WorkCenterMaintenance = {
        ...maintenance,
        id: `maint-${Date.now()}`,
      };
      workCenter.maintenanceHistory.push(newMaintenance);
      workCenter.nextMaintenanceDate = maintenance.scheduledDate;
      return newMaintenance;
    }

    const response = await apiClient.post<WorkCenterMaintenance>(
      `/production/work-centers/${id}/maintenance`,
      maintenance
    );
    return response.data;
  }

  async updateWorkCenterShifts(id: string, shifts: any[]): Promise<WorkCenter> {
    const response = await apiClient.patch<WorkCenter>(`/production/work-center/${id}/shifts`, shifts);
    return response.data;
  }

  async getWorkCenterAnalytics(id: string, period: 'day' | 'week' | 'month' = 'week'): Promise<any> {
    const response = await apiClient.get<any>(`/production/work-center/${id}/analytics?period=${period}`);
    return response.data;
  }

  async getMaintenanceLogs(workCenterId?: string, status?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (workCenterId) params.append('workCenterId', workCenterId);
    if (status) params.append('status', status);
    const response = await apiClient.get<any[]>(`/production/maintenance-logs?${params.toString()}`);
    return response.data;
  }

  async createMaintenanceLog(data: any): Promise<any> {
    const response = await apiClient.post<any>('/production/maintenance-logs', data);
    return response.data;
  }

  async updateMaintenanceLog(id: string, data: any): Promise<any> {
    const response = await apiClient.patch<any>(`/production/maintenance-logs/${id}`, data);
    return response.data;
  }
}

export const workCenterService = new WorkCenterService();
