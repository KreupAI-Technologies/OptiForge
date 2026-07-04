/**
 * Leave Service
 * Handles all leave-related API operations for the HR module
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Interfaces
// ============================================================================

export enum LeaveTypeCode {
  CASUAL = 'CASUAL',
  SICK = 'SICK',
  ANNUAL = 'ANNUAL',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  BEREAVEMENT = 'BEREAVEMENT',
  UNPAID = 'UNPAID',
  COMPENSATORY = 'COMPENSATORY',
  STUDY = 'STUDY',
  MARRIAGE = 'MARRIAGE',
}

export enum LeaveApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum LeaveTypeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface LeaveType {
  id: string;
  code: LeaveTypeCode;
  name: string;
  description: string;
  defaultDays: number;
  maxDays: number;
  carryForward: boolean;
  maxCarryForwardDays?: number;
  isPaid: boolean;
  requiresApproval: boolean;
  requiresDocumentation: boolean;
  applicableGender?: 'MALE' | 'FEMALE' | 'ALL';
  minServiceDays?: number;
  color: string;
  status: LeaveTypeStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveApplication {
  id: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  departmentId?: string;
  departmentName?: string;
  leaveTypeId: string;
  leaveTypeName?: string;
  leaveTypeCode?: LeaveTypeCode;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  attachmentUrl?: string;
  status: LeaveApplicationStatus;
  appliedAt: Date;
  approvedBy?: string;
  approverName?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  employeeName?: string;
  leaveTypeId: string;
  leaveTypeName?: string;
  leaveTypeCode?: LeaveTypeCode;
  year: number;
  entitledDays: number;
  usedDays: number;
  pendingDays: number;
  balanceDays: number;
  carryForwardDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplyLeaveDto {
  employeeId: string;
  leaveTypeId: string;
  startDate: Date | string;
  endDate: Date | string;
  reason: string;
  attachmentUrl?: string;
}

export interface LeaveApplicationFilters {
  employeeId?: string;
  departmentId?: string;
  leaveTypeId?: string;
  status?: LeaveApplicationStatus;
  startDate?: Date | string;
  endDate?: Date | string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Mock Data - Leave Types
// ============================================================================

export const MOCK_LEAVE_TYPES: LeaveType[] = [
  {
    id: 'lt-001',
    code: LeaveTypeCode.CASUAL,
    name: 'Casual Leave',
    description: 'Leave for personal matters or short absences',
    defaultDays: 12,
    maxDays: 12,
    carryForward: false,
    isPaid: true,
    requiresApproval: true,
    requiresDocumentation: false,
    applicableGender: 'ALL',
    color: '#3B82F6',
    status: LeaveTypeStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'lt-002',
    code: LeaveTypeCode.SICK,
    name: 'Sick Leave',
    description: 'Leave due to illness or medical conditions',
    defaultDays: 10,
    maxDays: 15,
    carryForward: false,
    isPaid: true,
    requiresApproval: true,
    requiresDocumentation: true,
    applicableGender: 'ALL',
    color: '#EF4444',
    status: LeaveTypeStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'lt-003',
    code: LeaveTypeCode.ANNUAL,
    name: 'Annual Leave',
    description: 'Earned leave for vacation and personal time',
    defaultDays: 21,
    maxDays: 30,
    carryForward: true,
    maxCarryForwardDays: 10,
    isPaid: true,
    requiresApproval: true,
    requiresDocumentation: false,
    applicableGender: 'ALL',
    color: '#10B981',
    status: LeaveTypeStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'lt-004',
    code: LeaveTypeCode.MATERNITY,
    name: 'Maternity Leave',
    description: 'Leave for female employees for childbirth and childcare',
    defaultDays: 182,
    maxDays: 182,
    carryForward: false,
    isPaid: true,
    requiresApproval: true,
    requiresDocumentation: true,
    applicableGender: 'FEMALE',
    minServiceDays: 80,
    color: '#EC4899',
    status: LeaveTypeStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'lt-005',
    code: LeaveTypeCode.PATERNITY,
    name: 'Paternity Leave',
    description: 'Leave for male employees on birth of child',
    defaultDays: 15,
    maxDays: 15,
    carryForward: false,
    isPaid: true,
    requiresApproval: true,
    requiresDocumentation: true,
    applicableGender: 'MALE',
    color: '#8B5CF6',
    status: LeaveTypeStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'lt-006',
    code: LeaveTypeCode.BEREAVEMENT,
    name: 'Bereavement Leave',
    description: 'Leave for death of immediate family member',
    defaultDays: 5,
    maxDays: 7,
    carryForward: false,
    isPaid: true,
    requiresApproval: true,
    requiresDocumentation: true,
    applicableGender: 'ALL',
    color: '#6B7280',
    status: LeaveTypeStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'lt-007',
    code: LeaveTypeCode.UNPAID,
    name: 'Unpaid Leave',
    description: 'Leave without pay for extended absences',
    defaultDays: 0,
    maxDays: 90,
    carryForward: false,
    isPaid: false,
    requiresApproval: true,
    requiresDocumentation: false,
    applicableGender: 'ALL',
    color: '#F59E0B',
    status: LeaveTypeStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'lt-008',
    code: LeaveTypeCode.COMPENSATORY,
    name: 'Compensatory Off',
    description: 'Leave in lieu of working on holidays or weekends',
    defaultDays: 0,
    maxDays: 10,
    carryForward: false,
    isPaid: true,
    requiresApproval: true,
    requiresDocumentation: false,
    applicableGender: 'ALL',
    color: '#06B6D4',
    status: LeaveTypeStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'lt-009',
    code: LeaveTypeCode.STUDY,
    name: 'Study Leave',
    description: 'Leave for educational purposes and examinations',
    defaultDays: 5,
    maxDays: 10,
    carryForward: false,
    isPaid: true,
    requiresApproval: true,
    requiresDocumentation: true,
    applicableGender: 'ALL',
    minServiceDays: 365,
    color: '#14B8A6',
    status: LeaveTypeStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'lt-010',
    code: LeaveTypeCode.MARRIAGE,
    name: 'Marriage Leave',
    description: 'Leave for own marriage ceremony',
    defaultDays: 7,
    maxDays: 7,
    carryForward: false,
    isPaid: true,
    requiresApproval: true,
    requiresDocumentation: true,
    applicableGender: 'ALL',
    minServiceDays: 180,
    color: '#F472B6',
    status: LeaveTypeStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// ============================================================================
// Mock Data - Leave Applications
// ============================================================================

export const MOCK_LEAVE_APPLICATIONS: LeaveApplication[] = [
  {
    id: 'la-001',
    employeeId: 'emp-003',
    employeeName: 'Amit Patel',
    employeeCode: 'EMP003',
    departmentId: 'dept-003',
    departmentName: 'Quality Control',
    leaveTypeId: 'lt-001',
    leaveTypeName: 'Casual Leave',
    leaveTypeCode: LeaveTypeCode.CASUAL,
    startDate: new Date('2024-01-22'),
    endDate: new Date('2024-01-23'),
    totalDays: 2,
    reason: 'Family function',
    status: LeaveApplicationStatus.APPROVED,
    appliedAt: new Date('2024-01-18'),
    approvedBy: 'emp-001',
    approverName: 'Rajesh Kumar',
    approvedAt: new Date('2024-01-19'),
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-19'),
  },
  {
    id: 'la-002',
    employeeId: 'emp-007',
    employeeName: 'Anita Desai',
    employeeCode: 'EMP007',
    departmentId: 'dept-005',
    departmentName: 'Sales',
    leaveTypeId: 'lt-002',
    leaveTypeName: 'Sick Leave',
    leaveTypeCode: LeaveTypeCode.SICK,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-17'),
    totalDays: 3,
    reason: 'Fever and cold',
    attachmentUrl: '/documents/medical-certificate-001.pdf',
    status: LeaveApplicationStatus.APPROVED,
    appliedAt: new Date('2024-01-15'),
    approvedBy: 'emp-009',
    approverName: 'Sanjay Gupta',
    approvedAt: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'la-003',
    employeeId: 'emp-009',
    employeeName: 'Sanjay Gupta',
    employeeCode: 'EMP009',
    departmentId: 'dept-005',
    departmentName: 'Sales',
    leaveTypeId: 'lt-003',
    leaveTypeName: 'Annual Leave',
    leaveTypeCode: LeaveTypeCode.ANNUAL,
    startDate: new Date('2024-01-25'),
    endDate: new Date('2024-02-05'),
    totalDays: 10,
    reason: 'Annual vacation with family',
    status: LeaveApplicationStatus.APPROVED,
    appliedAt: new Date('2024-01-10'),
    approvedBy: 'emp-006',
    approverName: 'Vikram Singh',
    approvedAt: new Date('2024-01-12'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: 'la-004',
    employeeId: 'emp-004',
    employeeName: 'Sneha Reddy',
    employeeCode: 'EMP004',
    departmentId: 'dept-004',
    departmentName: 'Finance',
    leaveTypeId: 'lt-001',
    leaveTypeName: 'Casual Leave',
    leaveTypeCode: LeaveTypeCode.CASUAL,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-01'),
    totalDays: 1,
    reason: 'Personal work',
    status: LeaveApplicationStatus.PENDING,
    appliedAt: new Date('2024-01-25'),
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: 'la-005',
    employeeId: 'emp-008',
    employeeName: 'Deepak Verma',
    employeeCode: 'EMP008',
    departmentId: 'dept-006',
    departmentName: 'IT',
    leaveTypeId: 'lt-009',
    leaveTypeName: 'Study Leave',
    leaveTypeCode: LeaveTypeCode.STUDY,
    startDate: new Date('2024-02-10'),
    endDate: new Date('2024-02-12'),
    totalDays: 3,
    reason: 'Professional certification examination',
    attachmentUrl: '/documents/exam-schedule-001.pdf',
    status: LeaveApplicationStatus.PENDING,
    appliedAt: new Date('2024-01-20'),
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'la-006',
    employeeId: 'emp-005',
    employeeName: 'Mohammed Khan',
    employeeCode: 'EMP005',
    departmentId: 'dept-001',
    departmentName: 'Production',
    leaveTypeId: 'lt-006',
    leaveTypeName: 'Bereavement Leave',
    leaveTypeCode: LeaveTypeCode.BEREAVEMENT,
    startDate: new Date('2024-01-08'),
    endDate: new Date('2024-01-12'),
    totalDays: 5,
    reason: 'Death of grandmother',
    status: LeaveApplicationStatus.APPROVED,
    appliedAt: new Date('2024-01-08'),
    approvedBy: 'emp-001',
    approverName: 'Rajesh Kumar',
    approvedAt: new Date('2024-01-08'),
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
  },
  {
    id: 'la-007',
    employeeId: 'emp-002',
    employeeName: 'Priya Sharma',
    employeeCode: 'EMP002',
    departmentId: 'dept-002',
    departmentName: 'Human Resources',
    leaveTypeId: 'lt-008',
    leaveTypeName: 'Compensatory Off',
    leaveTypeCode: LeaveTypeCode.COMPENSATORY,
    startDate: new Date('2024-01-29'),
    endDate: new Date('2024-01-29'),
    totalDays: 1,
    reason: 'Worked on Saturday for recruitment drive',
    status: LeaveApplicationStatus.APPROVED,
    appliedAt: new Date('2024-01-22'),
    approvedBy: 'emp-006',
    approverName: 'Vikram Singh',
    approvedAt: new Date('2024-01-23'),
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-23'),
  },
  {
    id: 'la-008',
    employeeId: 'emp-010',
    employeeName: 'Kavita Nair',
    employeeCode: 'EMP010',
    departmentId: 'dept-006',
    departmentName: 'IT',
    leaveTypeId: 'lt-001',
    leaveTypeName: 'Casual Leave',
    leaveTypeCode: LeaveTypeCode.CASUAL,
    startDate: new Date('2024-01-05'),
    endDate: new Date('2024-01-05'),
    totalDays: 1,
    reason: 'Doctor appointment',
    status: LeaveApplicationStatus.REJECTED,
    appliedAt: new Date('2024-01-03'),
    approvedBy: 'emp-006',
    approverName: 'Vikram Singh',
    approvedAt: new Date('2024-01-04'),
    rejectionReason: 'Critical project deadline on the same day. Please reschedule.',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-04'),
  },
];

// ============================================================================
// Mock Data - Leave Balances
// ============================================================================

const generateLeaveBalances = (): LeaveBalance[] => {
  const employees = [
    { id: 'emp-001', name: 'Rajesh Kumar' },
    { id: 'emp-002', name: 'Priya Sharma' },
    { id: 'emp-003', name: 'Amit Patel' },
    { id: 'emp-004', name: 'Sneha Reddy' },
    { id: 'emp-005', name: 'Mohammed Khan' },
    { id: 'emp-006', name: 'Vikram Singh' },
    { id: 'emp-007', name: 'Anita Desai' },
    { id: 'emp-008', name: 'Deepak Verma' },
    { id: 'emp-009', name: 'Sanjay Gupta' },
    { id: 'emp-010', name: 'Kavita Nair' },
  ];

  const balances: LeaveBalance[] = [];
  const year = new Date().getFullYear();

  for (const emp of employees) {
    // Common leave types for all employees
    const commonLeaveTypes = [
      { id: 'lt-001', name: 'Casual Leave', code: LeaveTypeCode.CASUAL, entitled: 12 },
      { id: 'lt-002', name: 'Sick Leave', code: LeaveTypeCode.SICK, entitled: 10 },
      { id: 'lt-003', name: 'Annual Leave', code: LeaveTypeCode.ANNUAL, entitled: 21 },
    ];

    for (const lt of commonLeaveTypes) {
      const used = Math.floor(Math.random() * (lt.entitled * 0.5));
      const pending = Math.floor(Math.random() * 2);
      const carryForward = lt.code === LeaveTypeCode.ANNUAL ? Math.floor(Math.random() * 5) : 0;

      balances.push({
        id: `lb-${emp.id}-${lt.id}`,
        employeeId: emp.id,
        employeeName: emp.name,
        leaveTypeId: lt.id,
        leaveTypeName: lt.name,
        leaveTypeCode: lt.code,
        year,
        entitledDays: lt.entitled,
        usedDays: used,
        pendingDays: pending,
        balanceDays: lt.entitled + carryForward - used - pending,
        carryForwardDays: carryForward,
        createdAt: new Date(`${year}-01-01`),
        updatedAt: new Date(),
      });
    }
  }

  return balances;
};

export const MOCK_LEAVE_BALANCES: LeaveBalance[] = generateLeaveBalances();

// ============================================================================
// Leave Service Class
// ============================================================================

export class LeaveService {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all leave types (raw ORM shape) with company header.
   */
  static async getAllLeaveTypesRaw(): Promise<any[]> {
    return this.request<any[]>('/hr/leave-types', {
      headers: { 'x-company-id': 'test' },
    });
  }

  /**
   * Get all leave applications (raw ORM shape) with company header.
   * Backend returns [] when unseeded.
   */
  static async getAllLeaveApplicationsRaw(): Promise<any[]> {
    return this.request<any[]>('/hr/leave-applications', {
      headers: { 'x-company-id': 'test' },
    });
  }

  /**
   * Get all leave types
   */
  static async getLeaveTypes(): Promise<LeaveType[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return [...MOCK_LEAVE_TYPES].filter((lt) => lt.status === LeaveTypeStatus.ACTIVE);
    }
    return this.request<LeaveType[]>('/hr/leave-types');
  }

  /**
   * Get leave type by ID
   */
  static async getLeaveTypeById(id: string): Promise<LeaveType> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const leaveType = MOCK_LEAVE_TYPES.find((lt) => lt.id === id);
      if (!leaveType) throw new Error('Leave type not found');
      return leaveType;
    }
    return this.request<LeaveType>(`/hr/leave-types/${id}`);
  }

  /**
   * Get leave applications with filters
   */
  static async getLeaveApplications(
    filters?: LeaveApplicationFilters
  ): Promise<LeaveApplication[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredApplications = [...MOCK_LEAVE_APPLICATIONS];

      if (filters?.employeeId) {
        filteredApplications = filteredApplications.filter(
          (la) => la.employeeId === filters.employeeId
        );
      }
      if (filters?.departmentId) {
        filteredApplications = filteredApplications.filter(
          (la) => la.departmentId === filters.departmentId
        );
      }
      if (filters?.leaveTypeId) {
        filteredApplications = filteredApplications.filter(
          (la) => la.leaveTypeId === filters.leaveTypeId
        );
      }
      if (filters?.status) {
        filteredApplications = filteredApplications.filter(
          (la) => la.status === filters.status
        );
      }
      if (filters?.startDate) {
        const start = new Date(filters.startDate);
        filteredApplications = filteredApplications.filter(
          (la) => new Date(la.startDate) >= start
        );
      }
      if (filters?.endDate) {
        const end = new Date(filters.endDate);
        filteredApplications = filteredApplications.filter(
          (la) => new Date(la.endDate) <= end
        );
      }

      // Sort by applied date descending
      filteredApplications.sort(
        (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
      );

      // Pagination
      if (filters?.page && filters?.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        filteredApplications = filteredApplications.slice(start, end);
      }

      return filteredApplications;
    }

    const queryParams = new URLSearchParams();
    if (filters?.employeeId) queryParams.set('employeeId', filters.employeeId);
    if (filters?.departmentId) queryParams.set('departmentId', filters.departmentId);
    if (filters?.leaveTypeId) queryParams.set('leaveTypeId', filters.leaveTypeId);
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.startDate) queryParams.set('startDate', new Date(filters.startDate).toISOString());
    if (filters?.endDate) queryParams.set('endDate', new Date(filters.endDate).toISOString());
    if (filters?.page) queryParams.set('page', filters.page.toString());
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());

    return this.request<LeaveApplication[]>(`/hr/leave-applications?${queryParams.toString()}`);
  }

  /**
   * Get leave application by ID
   */
  static async getLeaveApplicationById(id: string): Promise<LeaveApplication> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const application = MOCK_LEAVE_APPLICATIONS.find((la) => la.id === id);
      if (!application) throw new Error('Leave application not found');
      return application;
    }
    return this.request<LeaveApplication>(`/hr/leave-applications/${id}`);
  }

  /**
   * Apply for leave
   */
  static async applyLeave(data: ApplyLeaveDto): Promise<LeaveApplication> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const totalDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

      const leaveType = MOCK_LEAVE_TYPES.find((lt) => lt.id === data.leaveTypeId);

      const newApplication: LeaveApplication = {
        id: `la-${Date.now()}`,
        employeeId: data.employeeId,
        leaveTypeId: data.leaveTypeId,
        leaveTypeName: leaveType?.name,
        leaveTypeCode: leaveType?.code,
        startDate,
        endDate,
        totalDays,
        reason: data.reason,
        attachmentUrl: data.attachmentUrl,
        status: LeaveApplicationStatus.PENDING,
        appliedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      MOCK_LEAVE_APPLICATIONS.push(newApplication);
      return newApplication;
    }
    return this.request<LeaveApplication>('/hr/leave-applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Approve leave application
   */
  static async approveLeave(
    id: string,
    approverId?: string
  ): Promise<LeaveApplication> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_LEAVE_APPLICATIONS.findIndex((la) => la.id === id);
      if (index === -1) throw new Error('Leave application not found');

      if (MOCK_LEAVE_APPLICATIONS[index].status !== LeaveApplicationStatus.PENDING) {
        throw new Error('Only pending applications can be approved');
      }

      MOCK_LEAVE_APPLICATIONS[index] = {
        ...MOCK_LEAVE_APPLICATIONS[index],
        status: LeaveApplicationStatus.APPROVED,
        approvedBy: approverId || 'emp-001',
        approverName: 'Rajesh Kumar',
        approvedAt: new Date(),
        updatedAt: new Date(),
      };

      // Update leave balance
      const app = MOCK_LEAVE_APPLICATIONS[index];
      const balanceIndex = MOCK_LEAVE_BALANCES.findIndex(
        (lb) => lb.employeeId === app.employeeId && lb.leaveTypeId === app.leaveTypeId
      );
      if (balanceIndex >= 0) {
        MOCK_LEAVE_BALANCES[balanceIndex].pendingDays -= app.totalDays;
        MOCK_LEAVE_BALANCES[balanceIndex].usedDays += app.totalDays;
        MOCK_LEAVE_BALANCES[balanceIndex].balanceDays -= app.totalDays;
      }

      return MOCK_LEAVE_APPLICATIONS[index];
    }
    return this.request<LeaveApplication>(`/hr/leave-applications/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approverId }),
    });
  }

  /**
   * Reject leave application
   */
  static async rejectLeave(
    id: string,
    rejectionReason: string,
    approverId?: string
  ): Promise<LeaveApplication> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_LEAVE_APPLICATIONS.findIndex((la) => la.id === id);
      if (index === -1) throw new Error('Leave application not found');

      if (MOCK_LEAVE_APPLICATIONS[index].status !== LeaveApplicationStatus.PENDING) {
        throw new Error('Only pending applications can be rejected');
      }

      MOCK_LEAVE_APPLICATIONS[index] = {
        ...MOCK_LEAVE_APPLICATIONS[index],
        status: LeaveApplicationStatus.REJECTED,
        approvedBy: approverId || 'emp-001',
        approverName: 'Rajesh Kumar',
        approvedAt: new Date(),
        rejectionReason,
        updatedAt: new Date(),
      };

      // Update leave balance (remove from pending)
      const app = MOCK_LEAVE_APPLICATIONS[index];
      const balanceIndex = MOCK_LEAVE_BALANCES.findIndex(
        (lb) => lb.employeeId === app.employeeId && lb.leaveTypeId === app.leaveTypeId
      );
      if (balanceIndex >= 0) {
        MOCK_LEAVE_BALANCES[balanceIndex].pendingDays -= app.totalDays;
        MOCK_LEAVE_BALANCES[balanceIndex].balanceDays += app.totalDays;
      }

      return MOCK_LEAVE_APPLICATIONS[index];
    }
    return this.request<LeaveApplication>(`/hr/leave-applications/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason, approverId }),
    });
  }

  /**
   * Cancel/withdraw leave application
   */
  static async withdrawLeave(id: string): Promise<LeaveApplication> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_LEAVE_APPLICATIONS.findIndex((la) => la.id === id);
      if (index === -1) throw new Error('Leave application not found');

      const currentStatus = MOCK_LEAVE_APPLICATIONS[index].status;
      if (
        currentStatus !== LeaveApplicationStatus.PENDING &&
        currentStatus !== LeaveApplicationStatus.APPROVED
      ) {
        throw new Error('Cannot withdraw this application');
      }

      const newStatus =
        currentStatus === LeaveApplicationStatus.PENDING
          ? LeaveApplicationStatus.WITHDRAWN
          : LeaveApplicationStatus.CANCELLED;

      MOCK_LEAVE_APPLICATIONS[index] = {
        ...MOCK_LEAVE_APPLICATIONS[index],
        status: newStatus,
        updatedAt: new Date(),
      };

      return MOCK_LEAVE_APPLICATIONS[index];
    }
    return this.request<LeaveApplication>(`/hr/leave-applications/${id}/withdraw`, {
      method: 'POST',
    });
  }

  /**
   * Get all leave balances (raw ORM shape) with company header.
   * Backend returns [] when unseeded.
   */
  static async getAllLeaveBalances(): Promise<any[]> {
    return this.request<any[]>('/hr/leave-balances', {
      headers: { 'x-company-id': 'test' },
    });
  }

  /**
   * Get leave balance for an employee
   */
  static async getLeaveBalance(employeeId: string): Promise<LeaveBalance[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return MOCK_LEAVE_BALANCES.filter((lb) => lb.employeeId === employeeId);
    }
    return this.request<LeaveBalance[]>(`/hr/leave-balances/employee/${employeeId}`);
  }

  /**
   * Get leave balance for a specific leave type
   */
  static async getLeaveBalanceByType(
    employeeId: string,
    leaveTypeId: string
  ): Promise<LeaveBalance | null> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const balance = MOCK_LEAVE_BALANCES.find(
        (lb) => lb.employeeId === employeeId && lb.leaveTypeId === leaveTypeId
      );
      return balance || null;
    }
    return this.request<LeaveBalance | null>(
      `/hr/leave-balances/employee/${employeeId}/type/${leaveTypeId}`
    );
  }

  /**
   * Get pending leave applications count
   */
  static async getPendingCount(): Promise<number> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return MOCK_LEAVE_APPLICATIONS.filter(
        (la) => la.status === LeaveApplicationStatus.PENDING
      ).length;
    }
    const response = await this.request<{ count: number }>('/hr/leave-applications/pending/count');
    return response.count;
  }

  /**
   * Get leave statistics
   */
  static async getStatistics(): Promise<{
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    applicationsByType: Record<string, number>;
    applicationsByDepartment: Record<string, number>;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const applicationsByType: Record<string, number> = {};
      const applicationsByDepartment: Record<string, number> = {};

      MOCK_LEAVE_APPLICATIONS.forEach((app) => {
        const typeName = app.leaveTypeName || 'Unknown';
        applicationsByType[typeName] = (applicationsByType[typeName] || 0) + 1;

        const deptName = app.departmentName || 'Unknown';
        applicationsByDepartment[deptName] = (applicationsByDepartment[deptName] || 0) + 1;
      });

      return {
        totalApplications: MOCK_LEAVE_APPLICATIONS.length,
        pendingApplications: MOCK_LEAVE_APPLICATIONS.filter(
          (la) => la.status === LeaveApplicationStatus.PENDING
        ).length,
        approvedApplications: MOCK_LEAVE_APPLICATIONS.filter(
          (la) => la.status === LeaveApplicationStatus.APPROVED
        ).length,
        rejectedApplications: MOCK_LEAVE_APPLICATIONS.filter(
          (la) => la.status === LeaveApplicationStatus.REJECTED
        ).length,
        applicationsByType,
        applicationsByDepartment,
      };
    }

    return this.request<{
      totalApplications: number;
      pendingApplications: number;
      approvedApplications: number;
      rejectedApplications: number;
      applicationsByType: Record<string, number>;
      applicationsByDepartment: Record<string, number>;
    }>('/hr/leave/statistics');
  }
}

// Export singleton instance
export const leaveService = LeaveService;
