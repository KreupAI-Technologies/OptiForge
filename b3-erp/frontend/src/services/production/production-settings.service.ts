import { apiClient } from '../api/client';

// ==================== TypeScript Interfaces ====================

export type ProductionLineStatus = 'active' | 'inactive' | 'maintenance' | 'setup';
export type ProductionLineType = 'assembly' | 'machining' | 'fabrication' | 'packaging' | 'mixed';
export type ShiftStatus = 'active' | 'inactive';
export type ShiftType = 'day' | 'evening' | 'night' | 'rotating' | 'flexible';

export interface ProductionLine {
  id: string;
  companyId: string;
  code: string;
  name: string;
  description?: string;
  lineType: ProductionLineType;
  status: ProductionLineStatus;
  location?: string;
  building?: string;
  floor?: string;
  capacityPerHour: number;
  capacityUom: string;
  standardCycleTime?: number;
  taktTime?: number;
  workCenters?: {
    workCenterId: string;
    workCenterCode: string;
    workCenterName: string;
    sequence: number;
  }[];
  operators?: {
    operatorId: string;
    operatorName: string;
    role: string;
    shiftId: string;
  }[];
  minOperators: number;
  maxOperators?: number;
  operatingHours?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breakDuration: number;
  }[];
  capabilities?: {
    productTypes: string[];
    maxDimensions: { length: number; width: number; height: number };
    maxWeight: number;
    specialFeatures: string[];
  };
  oeeTarget: number;
  currentOee?: number;
  costPerHour?: number;
  currency: string;
  supervisorId?: string;
  supervisorName?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shift {
  id: string;
  companyId: string;
  code: string;
  name: string;
  description?: string;
  shiftType: ShiftType;
  status: ShiftStatus;
  startTime: string;
  endTime: string;
  durationHours: number;
  breaks?: {
    name: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    isPaid: boolean;
  }[];
  totalBreakMinutes: number;
  effectiveHours: number;
  workingDays?: {
    dayOfWeek: number;
    dayName: string;
    isWorking: boolean;
  }[];
  overtimeMultiplier: number;
  nightShiftPremium: number;
  rotationPattern?: {
    weekNumber: number;
    shiftId: string;
    shiftName: string;
  }[];
  minStaff: number;
  maxStaff?: number;
  supervisorRequired: boolean;
  requiredSkills?: {
    skillId: string;
    skillName: string;
    minimumLevel: number;
    count: number;
  }[];
  colorCode?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftAssignment {
  id: string;
  companyId: string;
  assignmentDate: string;
  shiftId: string;
  shiftName: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  workCenterId?: string;
  workCenterName?: string;
  productionLineId?: string;
  productionLineName?: string;
  role: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: 'scheduled' | 'checked_in' | 'checked_out' | 'absent' | 'cancelled';
  scheduledHours: number;
  actualHours?: number;
  overtimeHours?: number;
  breaksTaken?: {
    breakName: string;
    startTime: string;
    endTime: string;
    duration: number;
  }[];
  notes?: string;
  assignedBy: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Mock Data ====================

const MOCK_PRODUCTION_LINES: ProductionLine[] = [
  {
    id: 'line-001',
    companyId: 'company-001',
    code: 'ASSY-LINE-A',
    name: 'Assembly Line A',
    description: 'Main assembly line for product A series',
    lineType: 'assembly',
    status: 'active',
    location: 'Building A',
    building: 'Building A',
    floor: 'Ground Floor',
    capacityPerHour: 25,
    capacityUom: 'PCS',
    standardCycleTime: 2.4,
    taktTime: 2.5,
    workCenters: [
      { workCenterId: 'wc-001', workCenterCode: 'WC-PREP', workCenterName: 'Preparation', sequence: 1 },
      { workCenterId: 'wc-002', workCenterCode: 'WC-ASSY', workCenterName: 'Assembly', sequence: 2 },
      { workCenterId: 'wc-003', workCenterCode: 'WC-TEST', workCenterName: 'Testing', sequence: 3 },
    ],
    minOperators: 4,
    maxOperators: 8,
    operatingHours: [
      { dayOfWeek: 1, startTime: '08:00', endTime: '16:00', breakDuration: 60 },
      { dayOfWeek: 2, startTime: '08:00', endTime: '16:00', breakDuration: 60 },
      { dayOfWeek: 3, startTime: '08:00', endTime: '16:00', breakDuration: 60 },
      { dayOfWeek: 4, startTime: '08:00', endTime: '16:00', breakDuration: 60 },
      { dayOfWeek: 5, startTime: '08:00', endTime: '16:00', breakDuration: 60 },
    ],
    capabilities: {
      productTypes: ['Product A', 'Product B'],
      maxDimensions: { length: 1000, width: 500, height: 300 },
      maxWeight: 50,
      specialFeatures: ['Clean room compatible', 'ESD protected'],
    },
    oeeTarget: 85,
    currentOee: 82.5,
    costPerHour: 450,
    currency: 'USD',
    supervisorId: 'emp-010',
    supervisorName: 'Robert Johnson',
    isActive: true,
    createdBy: 'user-001',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'line-002',
    companyId: 'company-001',
    code: 'CNC-LINE-B',
    name: 'CNC Machining Line B',
    description: 'Precision CNC machining production line',
    lineType: 'machining',
    status: 'active',
    location: 'Building B',
    building: 'Building B',
    floor: 'Ground Floor',
    capacityPerHour: 15,
    capacityUom: 'PCS',
    standardCycleTime: 4.0,
    minOperators: 3,
    maxOperators: 6,
    oeeTarget: 80,
    currentOee: 78.2,
    costPerHour: 650,
    currency: 'USD',
    isActive: true,
    createdBy: 'user-001',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-01-14T15:00:00Z',
  },
];

const MOCK_SHIFTS: Shift[] = [
  {
    id: 'shift-001',
    companyId: 'company-001',
    code: 'DAY-SHIFT',
    name: 'Day Shift',
    description: 'Standard day shift 8 AM to 4 PM',
    shiftType: 'day',
    status: 'active',
    startTime: '08:00',
    endTime: '16:00',
    durationHours: 8,
    breaks: [
      { name: 'Morning Break', startTime: '10:00', endTime: '10:15', durationMinutes: 15, isPaid: true },
      { name: 'Lunch', startTime: '12:00', endTime: '12:30', durationMinutes: 30, isPaid: false },
      { name: 'Afternoon Break', startTime: '14:30', endTime: '14:45', durationMinutes: 15, isPaid: true },
    ],
    totalBreakMinutes: 60,
    effectiveHours: 7,
    workingDays: [
      { dayOfWeek: 1, dayName: 'Monday', isWorking: true },
      { dayOfWeek: 2, dayName: 'Tuesday', isWorking: true },
      { dayOfWeek: 3, dayName: 'Wednesday', isWorking: true },
      { dayOfWeek: 4, dayName: 'Thursday', isWorking: true },
      { dayOfWeek: 5, dayName: 'Friday', isWorking: true },
      { dayOfWeek: 6, dayName: 'Saturday', isWorking: false },
      { dayOfWeek: 0, dayName: 'Sunday', isWorking: false },
    ],
    overtimeMultiplier: 1.5,
    nightShiftPremium: 1.0,
    minStaff: 10,
    maxStaff: 20,
    supervisorRequired: true,
    colorCode: '#4CAF50',
    isActive: true,
    createdBy: 'user-001',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'shift-002',
    companyId: 'company-001',
    code: 'NIGHT-SHIFT',
    name: 'Night Shift',
    description: 'Night shift 10 PM to 6 AM',
    shiftType: 'night',
    status: 'active',
    startTime: '22:00',
    endTime: '06:00',
    durationHours: 8,
    breaks: [
      { name: 'Break 1', startTime: '00:00', endTime: '00:30', durationMinutes: 30, isPaid: true },
      { name: 'Break 2', startTime: '03:00', endTime: '03:30', durationMinutes: 30, isPaid: true },
    ],
    totalBreakMinutes: 60,
    effectiveHours: 7,
    overtimeMultiplier: 1.5,
    nightShiftPremium: 1.25,
    minStaff: 5,
    maxStaff: 10,
    supervisorRequired: true,
    colorCode: '#3F51B5',
    isActive: true,
    createdBy: 'user-001',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
];

const MOCK_ASSIGNMENTS: ShiftAssignment[] = [
  {
    id: 'assign-001',
    companyId: 'company-001',
    assignmentDate: '2025-01-15',
    shiftId: 'shift-001',
    shiftName: 'Day Shift',
    employeeId: 'emp-001',
    employeeName: 'John Smith',
    employeeCode: 'EMP-001',
    workCenterId: 'wc-001',
    workCenterName: 'Assembly Station 1',
    productionLineId: 'line-001',
    productionLineName: 'Assembly Line A',
    role: 'Operator',
    scheduledStart: '2025-01-15T08:00:00Z',
    scheduledEnd: '2025-01-15T16:00:00Z',
    actualStart: '2025-01-15T07:55:00Z',
    status: 'checked_in',
    scheduledHours: 8,
    notes: 'Team lead for the shift',
    assignedBy: 'user-001',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-15T07:55:00Z',
  },
];

// ==================== Service Class ====================

class ProductionSettingsService {
  private baseUrl = '/production';

  // Production Lines
  async findAllProductionLines(filters?: { status?: ProductionLineStatus; lineType?: ProductionLineType }): Promise<ProductionLine[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.lineType) params.append('lineType', filters.lineType);
      const response = await apiClient.get<ProductionLine[]>(`${this.baseUrl}/production-lines?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching production lines, using mock data:', error);
      let result = [...MOCK_PRODUCTION_LINES];
      if (filters?.status) result = result.filter((l) => l.status === filters.status);
      if (filters?.lineType) result = result.filter((l) => l.lineType === filters.lineType);
      return result;
    }
  }

  async findProductionLineById(id: string): Promise<ProductionLine> {
    try {
      const response = await apiClient.get<ProductionLine>(`${this.baseUrl}/production-lines/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching production line, using mock data:', error);
      const line = MOCK_PRODUCTION_LINES.find((l) => l.id === id);
      if (!line) throw new Error(`Production Line with ID ${id} not found`);
      return line;
    }
  }

  async createProductionLine(data: Partial<ProductionLine>): Promise<ProductionLine> {
    try {
      const response = await apiClient.post<ProductionLine>(`${this.baseUrl}/production-lines`, data);
      return response.data;
    } catch (error) {
      console.error('API Error creating production line, using mock data:', error);
      const newLine: ProductionLine = {
        id: `line-${Date.now()}`,
        companyId: 'company-001',
        code: data.code || `LINE-${Date.now()}`,
        name: data.name || 'New Production Line',
        lineType: data.lineType || 'assembly',
        status: 'inactive',
        capacityPerHour: data.capacityPerHour || 0,
        capacityUom: data.capacityUom || 'PCS',
        minOperators: data.minOperators || 1,
        oeeTarget: data.oeeTarget || 85,
        currency: data.currency || 'USD',
        isActive: true,
        createdBy: 'user-001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      } as ProductionLine;
      MOCK_PRODUCTION_LINES.push(newLine);
      return newLine;
    }
  }

  async updateProductionLine(id: string, data: Partial<ProductionLine>): Promise<ProductionLine> {
    try {
      const response = await apiClient.patch<ProductionLine>(`${this.baseUrl}/production-lines/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('API Error updating production line, using mock data:', error);
      const index = MOCK_PRODUCTION_LINES.findIndex((l) => l.id === id);
      if (index === -1) throw new Error(`Production Line with ID ${id} not found`);
      MOCK_PRODUCTION_LINES[index] = { ...MOCK_PRODUCTION_LINES[index], ...data, updatedAt: new Date().toISOString() };
      return MOCK_PRODUCTION_LINES[index];
    }
  }

  async getLineCapacityUtilization(id: string): Promise<{
    lineId: string;
    lineName: string;
    capacityPerHour: number;
    currentOee: number;
    utilizationRate: number;
  }> {
    try {
      const response = await apiClient.get<{
        lineId: string;
        lineName: string;
        capacityPerHour: number;
        currentOee: number;
        utilizationRate: number;
      }>(`${this.baseUrl}/production-lines/${id}/capacity-utilization`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching capacity utilization, using mock data:', error);
      const line = MOCK_PRODUCTION_LINES.find((l) => l.id === id);
      if (!line) throw new Error(`Production Line with ID ${id} not found`);
      return {
        lineId: line.id,
        lineName: line.name,
        capacityPerHour: line.capacityPerHour,
        currentOee: line.currentOee || 0,
        utilizationRate: line.currentOee || 0,
      };
    }
  }

  // Shifts
  async findAllShifts(filters?: { status?: ShiftStatus; shiftType?: ShiftType }): Promise<Shift[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.shiftType) params.append('shiftType', filters.shiftType);
      const response = await apiClient.get<Shift[]>(`${this.baseUrl}/shifts?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching shifts, using mock data:', error);
      let result = [...MOCK_SHIFTS];
      if (filters?.status) result = result.filter((s) => s.status === filters.status);
      if (filters?.shiftType) result = result.filter((s) => s.shiftType === filters.shiftType);
      return result;
    }
  }

  async findShiftById(id: string): Promise<Shift> {
    try {
      const response = await apiClient.get<Shift>(`${this.baseUrl}/shifts/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching shift, using mock data:', error);
      const shift = MOCK_SHIFTS.find((s) => s.id === id);
      if (!shift) throw new Error(`Shift with ID ${id} not found`);
      return shift;
    }
  }

  async createShift(data: Partial<Shift>): Promise<Shift> {
    try {
      const response = await apiClient.post<Shift>(`${this.baseUrl}/shifts`, data);
      return response.data;
    } catch (error) {
      console.error('API Error creating shift, using mock data:', error);
      const newShift: Shift = {
        id: `shift-${Date.now()}`,
        companyId: 'company-001',
        code: data.code || `SHIFT-${Date.now()}`,
        name: data.name || 'New Shift',
        shiftType: data.shiftType || 'day',
        status: 'active',
        startTime: data.startTime || '08:00',
        endTime: data.endTime || '16:00',
        durationHours: data.durationHours || 8,
        totalBreakMinutes: data.totalBreakMinutes || 0,
        effectiveHours: data.effectiveHours || 8,
        overtimeMultiplier: data.overtimeMultiplier || 1.5,
        nightShiftPremium: data.nightShiftPremium || 1.0,
        minStaff: data.minStaff || 1,
        supervisorRequired: data.supervisorRequired || true,
        isActive: true,
        createdBy: 'user-001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      } as Shift;
      MOCK_SHIFTS.push(newShift);
      return newShift;
    }
  }

  // Shift Assignments
  async findAllShiftAssignments(filters?: {
    assignmentDate?: string;
    shiftId?: string;
    employeeId?: string;
  }): Promise<ShiftAssignment[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.assignmentDate) params.append('assignmentDate', filters.assignmentDate);
      if (filters?.shiftId) params.append('shiftId', filters.shiftId);
      if (filters?.employeeId) params.append('employeeId', filters.employeeId);
      const response = await apiClient.get<ShiftAssignment[]>(`${this.baseUrl}/shift-assignments?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching shift assignments, using mock data:', error);
      let result = [...MOCK_ASSIGNMENTS];
      if (filters?.assignmentDate) result = result.filter((a) => a.assignmentDate === filters.assignmentDate);
      if (filters?.shiftId) result = result.filter((a) => a.shiftId === filters.shiftId);
      if (filters?.employeeId) result = result.filter((a) => a.employeeId === filters.employeeId);
      return result;
    }
  }

  async createShiftAssignment(data: Partial<ShiftAssignment>): Promise<ShiftAssignment> {
    try {
      const response = await apiClient.post<ShiftAssignment>(`${this.baseUrl}/shift-assignments`, data);
      return response.data;
    } catch (error) {
      console.error('API Error creating shift assignment, using mock data:', error);
      const newAssignment: ShiftAssignment = {
        id: `assign-${Date.now()}`,
        companyId: 'company-001',
        assignmentDate: data.assignmentDate || new Date().toISOString().split('T')[0],
        shiftId: data.shiftId || 'shift-001',
        shiftName: data.shiftName || 'Day Shift',
        employeeId: data.employeeId || 'emp-001',
        employeeName: data.employeeName || 'New Employee',
        employeeCode: data.employeeCode || 'EMP-NEW',
        role: data.role || 'Operator',
        scheduledStart: data.scheduledStart || new Date().toISOString(),
        scheduledEnd: data.scheduledEnd || new Date().toISOString(),
        status: 'scheduled',
        scheduledHours: data.scheduledHours || 8,
        assignedBy: 'user-001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      } as ShiftAssignment;
      MOCK_ASSIGNMENTS.push(newAssignment);
      return newAssignment;
    }
  }

  async clockIn(id: string): Promise<ShiftAssignment> {
    try {
      const response = await apiClient.post<ShiftAssignment>(`${this.baseUrl}/shift-assignments/${id}/clock-in`, {});
      return response.data;
    } catch (error) {
      console.error('API Error clocking in, using mock data:', error);
      const index = MOCK_ASSIGNMENTS.findIndex((a) => a.id === id);
      if (index === -1) throw new Error(`Shift Assignment with ID ${id} not found`);
      MOCK_ASSIGNMENTS[index] = {
        ...MOCK_ASSIGNMENTS[index],
        status: 'checked_in',
        actualStart: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return MOCK_ASSIGNMENTS[index];
    }
  }

  async clockOut(id: string): Promise<ShiftAssignment> {
    try {
      const response = await apiClient.post<ShiftAssignment>(`${this.baseUrl}/shift-assignments/${id}/clock-out`, {});
      return response.data;
    } catch (error) {
      console.error('API Error clocking out, using mock data:', error);
      const index = MOCK_ASSIGNMENTS.findIndex((a) => a.id === id);
      if (index === -1) throw new Error(`Shift Assignment with ID ${id} not found`);
      const now = new Date();
      const start = new Date(MOCK_ASSIGNMENTS[index].actualStart || MOCK_ASSIGNMENTS[index].scheduledStart);
      const actualHours = (now.getTime() - start.getTime()) / (1000 * 60 * 60);
      MOCK_ASSIGNMENTS[index] = {
        ...MOCK_ASSIGNMENTS[index],
        status: 'checked_out',
        actualEnd: now.toISOString(),
        actualHours: Math.round(actualHours * 10) / 10,
        updatedAt: now.toISOString(),
      };
      return MOCK_ASSIGNMENTS[index];
    }
  }
}

export const productionSettingsService = new ProductionSettingsService();
