/**
 * Offboarding Service
 * Handles all offboarding-related API operations for the HR module
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Enums
// ============================================================================

export enum ResignationStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  EARLY_RELEASE_REQUESTED = 'early_release_requested',
  EARLY_RELEASE_APPROVED = 'early_release_approved',
}

export enum ClearanceStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}

export enum ClearanceItemStatus {
  PENDING = 'pending',
  CLEARED = 'cleared',
  NOT_APPLICABLE = 'not_applicable',
  BLOCKED = 'blocked',
}

export enum SettlementStatus {
  DRAFT = 'draft',
  CALCULATED = 'calculated',
  APPROVED = 'approved',
  PROCESSED = 'processed',
  PAID = 'paid',
}

export enum ExitDocumentType {
  EXPERIENCE_CERTIFICATE = 'experience_certificate',
  RELIEVING_LETTER = 'relieving_letter',
  SERVICE_CERTIFICATE = 'service_certificate',
  SALARY_CERTIFICATE = 'salary_certificate',
  NO_DUES_CERTIFICATE = 'no_dues_certificate',
}

// ============================================================================
// Interfaces
// ============================================================================

export interface ResignationRequest {
  id: string;
  resignationNumber: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentId?: string;
  departmentName?: string;
  designationId?: string;
  designationName?: string;
  reportingManagerId?: string;
  reportingManagerName?: string;
  joiningDate?: Date;
  resignationDate: Date;
  noticePeriodDays: number;
  lastWorkingDate: Date;
  reason: string;
  reasonCategory?: string;
  detailedReason?: string;
  status: ResignationStatus;
  submittedAt: Date;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: Date;
  acceptedAt?: Date;
  acceptedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
  earlyReleaseRequestedDate?: Date;
  earlyReleaseApprovedDate?: Date;
  earlyReleaseDays?: number;
  withdrawnAt?: Date;
  withdrawnReason?: string;
  attachmentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExitClearance {
  id: string;
  clearanceNumber: string;
  resignationId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentId?: string;
  departmentName?: string;
  lastWorkingDate: Date;
  status: ClearanceStatus;
  itClearance: ClearanceItemStatus;
  hrClearance: ClearanceItemStatus;
  financeClearance: ClearanceItemStatus;
  adminClearance: ClearanceItemStatus;
  overallProgress: number;
  completedAt?: Date;
  items?: ClearanceItem[];
  assetReturns?: AssetReturn[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ClearanceItem {
  id: string;
  clearanceId: string;
  department: string;
  itemName: string;
  description?: string;
  isRequired: boolean;
  assignedTo?: string;
  assignedToName?: string;
  status: ClearanceItemStatus;
  remarks?: string;
  clearedBy?: string;
  clearedByName?: string;
  clearedAt?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetReturn {
  id: string;
  clearanceId: string;
  assetType: string;
  assetId?: string;
  assetName: string;
  assetTag?: string;
  serialNumber?: string;
  issuedDate?: Date;
  returnDate?: Date;
  condition?: string;
  status: string;
  receivedBy?: string;
  receivedByName?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExitInterview {
  id: string;
  resignationId: string;
  employeeId: string;
  employeeName: string;
  interviewerId?: string;
  interviewerName?: string;
  scheduledDate?: Date;
  conductedDate?: Date;
  status: string;
  overallExperience?: number;
  managerRelationship?: number;
  teamRelationship?: number;
  workLifeBalance?: number;
  careerGrowth?: number;
  compensation?: number;
  primaryReason?: string;
  whatCouldBeImproved?: string;
  wouldRecommend?: boolean;
  wouldRejoin?: boolean;
  feedbackOnManager?: string;
  feedbackOnTeam?: string;
  feedbackOnCompany?: string;
  suggestions?: string;
  additionalComments?: string;
  isConfidential: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FullFinalSettlement {
  id: string;
  settlementNumber: string;
  resignationId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  lastWorkingDate: Date;
  status: SettlementStatus;
  basicSalary: number;
  pendingSalaryDays: number;
  pendingSalaryAmount: number;
  leaveEncashmentDays: number;
  leaveEncashmentAmount: number;
  gratuityEligible: boolean;
  gratuityYears?: number;
  gratuityAmount: number;
  bonusAmount: number;
  otherEarnings: number;
  otherEarningsDetails?: string;
  totalEarnings: number;
  loanRecovery: number;
  advanceRecovery: number;
  noticeShortfall: number;
  noticeShortfallAmount: number;
  taxDeduction: number;
  otherDeductions: number;
  otherDeductionsDetails?: string;
  totalDeductions: number;
  netPayable: number;
  calculatedBy?: string;
  calculatedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  processedBy?: string;
  processedAt?: Date;
  paidAt?: Date;
  paymentMode?: string;
  paymentReference?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExitDocument {
  id: string;
  resignationId: string;
  employeeId: string;
  employeeName: string;
  documentType: ExitDocumentType;
  documentName: string;
  generatedAt?: Date;
  generatedBy?: string;
  documentUrl?: string;
  status: string;
  issuedAt?: Date;
  issuedBy?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlumniRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  personalEmail?: string;
  personalPhone?: string;
  linkedinUrl?: string;
  departmentAtExit?: string;
  designationAtExit?: string;
  joiningDate?: Date;
  exitDate?: Date;
  tenureYears?: number;
  exitReason?: string;
  lastDrawnSalary?: number;
  performanceRating?: number;
  isEligibleForRehire: boolean;
  rehireRestrictionReason?: string;
  currentCompany?: string;
  currentDesignation?: string;
  currentLocation?: string;
  hasConnectedOnLinkedIn: boolean;
  isActiveInNetwork: boolean;
  lastContactedDate?: Date;
  referralCount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_RESIGNATIONS: ResignationRequest[] = [
  {
    id: 'res-001',
    resignationNumber: 'RES-00001',
    employeeId: 'emp-012',
    employeeName: 'Suresh Menon',
    employeeCode: 'EMP012',
    departmentId: 'dept-001',
    departmentName: 'Production',
    designationId: 'desig-004',
    designationName: 'Production Supervisor',
    reportingManagerId: 'emp-001',
    reportingManagerName: 'Rajesh Kumar',
    joiningDate: new Date('2020-03-15'),
    resignationDate: new Date('2024-01-15'),
    noticePeriodDays: 30,
    lastWorkingDate: new Date('2024-02-14'),
    reason: 'Better opportunity',
    reasonCategory: 'career_growth',
    detailedReason: 'Received an offer with better growth prospects and compensation.',
    status: ResignationStatus.ACCEPTED,
    submittedAt: new Date('2024-01-15'),
    reviewedBy: 'emp-001',
    reviewedByName: 'Rajesh Kumar',
    reviewedAt: new Date('2024-01-16'),
    acceptedAt: new Date('2024-01-17'),
    acceptedBy: 'emp-006',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-17'),
  },
  {
    id: 'res-002',
    resignationNumber: 'RES-00002',
    employeeId: 'emp-015',
    employeeName: 'Pooja Iyer',
    employeeCode: 'EMP015',
    departmentId: 'dept-005',
    departmentName: 'Sales',
    designationId: 'desig-009',
    designationName: 'Sales Executive',
    reportingManagerId: 'emp-009',
    reportingManagerName: 'Sanjay Gupta',
    joiningDate: new Date('2022-06-01'),
    resignationDate: new Date('2024-01-20'),
    noticePeriodDays: 30,
    lastWorkingDate: new Date('2024-02-19'),
    reason: 'Personal reasons',
    reasonCategory: 'personal',
    status: ResignationStatus.UNDER_REVIEW,
    submittedAt: new Date('2024-01-20'),
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'res-003',
    resignationNumber: 'RES-00003',
    employeeId: 'emp-018',
    employeeName: 'Arun Bhat',
    employeeCode: 'EMP018',
    departmentId: 'dept-006',
    departmentName: 'IT',
    designationId: 'desig-012',
    designationName: 'Software Developer',
    reportingManagerId: 'emp-008',
    reportingManagerName: 'Deepak Verma',
    joiningDate: new Date('2021-09-15'),
    resignationDate: new Date('2024-01-10'),
    noticePeriodDays: 60,
    lastWorkingDate: new Date('2024-03-10'),
    reason: 'Higher studies',
    reasonCategory: 'education',
    detailedReason: 'Planning to pursue MBA from a premier institute.',
    status: ResignationStatus.EARLY_RELEASE_REQUESTED,
    submittedAt: new Date('2024-01-10'),
    reviewedBy: 'emp-008',
    reviewedByName: 'Deepak Verma',
    reviewedAt: new Date('2024-01-11'),
    acceptedAt: new Date('2024-01-12'),
    acceptedBy: 'emp-006',
    earlyReleaseRequestedDate: new Date('2024-01-15'),
    earlyReleaseDays: 30,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
  },
];

const MOCK_EXIT_CLEARANCES: ExitClearance[] = [
  {
    id: 'clr-001',
    clearanceNumber: 'CLR-00001',
    resignationId: 'res-001',
    employeeId: 'emp-012',
    employeeName: 'Suresh Menon',
    employeeCode: 'EMP012',
    departmentId: 'dept-001',
    departmentName: 'Production',
    lastWorkingDate: new Date('2024-02-14'),
    status: ClearanceStatus.IN_PROGRESS,
    itClearance: ClearanceItemStatus.CLEARED,
    hrClearance: ClearanceItemStatus.PENDING,
    financeClearance: ClearanceItemStatus.PENDING,
    adminClearance: ClearanceItemStatus.CLEARED,
    overallProgress: 50,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-02-01'),
  },
];

const MOCK_EXIT_INTERVIEWS: ExitInterview[] = [
  {
    id: 'exit-int-001',
    resignationId: 'res-001',
    employeeId: 'emp-012',
    employeeName: 'Suresh Menon',
    interviewerId: 'emp-002',
    interviewerName: 'Priya Sharma',
    scheduledDate: new Date('2024-02-10'),
    conductedDate: new Date('2024-02-10'),
    status: 'completed',
    overallExperience: 4,
    managerRelationship: 4,
    teamRelationship: 5,
    workLifeBalance: 3,
    careerGrowth: 3,
    compensation: 3,
    primaryReason: 'Better compensation and growth opportunities elsewhere',
    whatCouldBeImproved: 'Career growth paths, salary benchmarking',
    wouldRecommend: true,
    wouldRejoin: true,
    feedbackOnManager: 'Very supportive and helpful',
    feedbackOnTeam: 'Great team collaboration',
    feedbackOnCompany: 'Good work culture but needs better compensation structure',
    suggestions: 'Implement regular salary reviews and clear promotion paths',
    isConfidential: false,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-10'),
  },
];

const MOCK_SETTLEMENTS: FullFinalSettlement[] = [
  {
    id: 'fnf-001',
    settlementNumber: 'FNF-00001',
    resignationId: 'res-001',
    employeeId: 'emp-012',
    employeeName: 'Suresh Menon',
    employeeCode: 'EMP012',
    lastWorkingDate: new Date('2024-02-14'),
    status: SettlementStatus.CALCULATED,
    basicSalary: 45000,
    pendingSalaryDays: 14,
    pendingSalaryAmount: 21000,
    leaveEncashmentDays: 8,
    leaveEncashmentAmount: 12000,
    gratuityEligible: true,
    gratuityYears: 3.9,
    gratuityAmount: 105000,
    bonusAmount: 15000,
    otherEarnings: 5000,
    otherEarningsDetails: 'Pending reimbursements',
    totalEarnings: 158000,
    loanRecovery: 10000,
    advanceRecovery: 5000,
    noticeShortfall: 0,
    noticeShortfallAmount: 0,
    taxDeduction: 18000,
    otherDeductions: 2000,
    otherDeductionsDetails: 'Insurance premium',
    totalDeductions: 35000,
    netPayable: 123000,
    calculatedBy: 'emp-004',
    calculatedAt: new Date('2024-02-05'),
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-05'),
  },
];

const MOCK_EXIT_DOCUMENTS: ExitDocument[] = [
  {
    id: 'doc-001',
    resignationId: 'res-001',
    employeeId: 'emp-012',
    employeeName: 'Suresh Menon',
    documentType: ExitDocumentType.EXPERIENCE_CERTIFICATE,
    documentName: 'Experience Certificate',
    status: 'pending',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'doc-002',
    resignationId: 'res-001',
    employeeId: 'emp-012',
    employeeName: 'Suresh Menon',
    documentType: ExitDocumentType.RELIEVING_LETTER,
    documentName: 'Relieving Letter',
    status: 'pending',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
];

const MOCK_ALUMNI: AlumniRecord[] = [
  {
    id: 'alumni-001',
    employeeId: 'emp-ex-001',
    employeeName: 'Ramesh Joshi',
    employeeCode: 'EMP050',
    personalEmail: 'ramesh.joshi@gmail.com',
    linkedinUrl: 'https://linkedin.com/in/rameshjoshi',
    departmentAtExit: 'Engineering',
    designationAtExit: 'Senior Engineer',
    joiningDate: new Date('2018-05-01'),
    exitDate: new Date('2023-08-31'),
    tenureYears: 5.3,
    exitReason: 'Better opportunity',
    performanceRating: 4.5,
    isEligibleForRehire: true,
    currentCompany: 'Tech Solutions Pvt Ltd',
    currentDesignation: 'Engineering Manager',
    hasConnectedOnLinkedIn: true,
    isActiveInNetwork: true,
    referralCount: 2,
    createdAt: new Date('2023-09-01'),
    updatedAt: new Date('2024-01-15'),
  },
];

// ============================================================================
// Service Class
// ============================================================================

export class OffboardingService {
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

  // ============================================================================
  // Offboarding Tasks
  // ============================================================================

  static async getOffboardingTasks(): Promise<any> {
    return this.request<any>('/hr/offboarding-tasks');
  }

  // ============================================================================
  // Resignation Management
  // ============================================================================

  static async getResignations(filters?: {
    status?: ResignationStatus;
    departmentId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: ResignationRequest[]; total: number }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filtered = [...MOCK_RESIGNATIONS];
      if (filters?.status) {
        filtered = filtered.filter((r) => r.status === filters.status);
      }
      if (filters?.departmentId) {
        filtered = filtered.filter((r) => r.departmentId === filters.departmentId);
      }
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.departmentId) params.set('departmentId', filters.departmentId);
    if (filters?.page) params.set('page', filters.page.toString());
    if (filters?.limit) params.set('limit', filters.limit.toString());
    return this.request<{ data: ResignationRequest[]; total: number }>(
      `/hr/resignations?${params.toString()}`
    );
  }

  static async getResignationById(id: string): Promise<ResignationRequest> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const resignation = MOCK_RESIGNATIONS.find((r) => r.id === id);
      if (!resignation) throw new Error('Resignation not found');
      return resignation;
    }
    return this.request<ResignationRequest>(`/hr/resignations/${id}`);
  }

  static async submitResignation(data: {
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    departmentId?: string;
    designationId?: string;
    reportingManagerId?: string;
    noticePeriodDays: number;
    reason: string;
    reasonCategory?: string;
    detailedReason?: string;
    lastWorkingDate: Date;
  }): Promise<ResignationRequest> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newResignation: ResignationRequest = {
        id: `res-${Date.now()}`,
        resignationNumber: `RES-${String(MOCK_RESIGNATIONS.length + 1).padStart(5, '0')}`,
        ...data,
        resignationDate: new Date(),
        status: ResignationStatus.SUBMITTED,
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_RESIGNATIONS.push(newResignation);
      return newResignation;
    }
    return this.request<ResignationRequest>('/hr/resignations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async acceptResignation(
    id: string,
    data: { acceptedBy: string; remarks?: string }
  ): Promise<ResignationRequest> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_RESIGNATIONS.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Resignation not found');
      MOCK_RESIGNATIONS[index] = {
        ...MOCK_RESIGNATIONS[index],
        status: ResignationStatus.ACCEPTED,
        acceptedAt: new Date(),
        acceptedBy: data.acceptedBy,
        updatedAt: new Date(),
      };
      return MOCK_RESIGNATIONS[index];
    }
    return this.request<ResignationRequest>(`/hr/resignations/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async rejectResignation(
    id: string,
    data: { rejectedBy: string; rejectionReason: string }
  ): Promise<ResignationRequest> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_RESIGNATIONS.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Resignation not found');
      MOCK_RESIGNATIONS[index] = {
        ...MOCK_RESIGNATIONS[index],
        status: ResignationStatus.REJECTED,
        rejectedAt: new Date(),
        rejectedBy: data.rejectedBy,
        rejectionReason: data.rejectionReason,
        updatedAt: new Date(),
      };
      return MOCK_RESIGNATIONS[index];
    }
    return this.request<ResignationRequest>(`/hr/resignations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async requestEarlyRelease(
    id: string,
    data: { earlyReleaseDays: number; reason: string }
  ): Promise<ResignationRequest> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_RESIGNATIONS.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Resignation not found');
      MOCK_RESIGNATIONS[index] = {
        ...MOCK_RESIGNATIONS[index],
        status: ResignationStatus.EARLY_RELEASE_REQUESTED,
        earlyReleaseRequestedDate: new Date(),
        earlyReleaseDays: data.earlyReleaseDays,
        updatedAt: new Date(),
      };
      return MOCK_RESIGNATIONS[index];
    }
    return this.request<ResignationRequest>(`/hr/resignations/${id}/early-release`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async approveEarlyRelease(
    id: string,
    data: { approvedBy: string; newLastWorkingDate: Date }
  ): Promise<ResignationRequest> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_RESIGNATIONS.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Resignation not found');
      MOCK_RESIGNATIONS[index] = {
        ...MOCK_RESIGNATIONS[index],
        status: ResignationStatus.EARLY_RELEASE_APPROVED,
        earlyReleaseApprovedDate: new Date(),
        lastWorkingDate: data.newLastWorkingDate,
        updatedAt: new Date(),
      };
      return MOCK_RESIGNATIONS[index];
    }
    return this.request<ResignationRequest>(`/hr/resignations/${id}/approve-early-release`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============================================================================
  // Exit Clearance
  // ============================================================================

  static async getExitClearances(filters?: {
    status?: ClearanceStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: ExitClearance[]; total: number }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filtered = [...MOCK_EXIT_CLEARANCES];
      if (filters?.status) {
        filtered = filtered.filter((c) => c.status === filters.status);
      }
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.page) params.set('page', filters.page.toString());
    if (filters?.limit) params.set('limit', filters.limit.toString());
    return this.request<{ data: ExitClearance[]; total: number }>(
      `/hr/exit-clearance?${params.toString()}`
    );
  }

  static async getExitClearanceById(id: string): Promise<ExitClearance> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const clearance = MOCK_EXIT_CLEARANCES.find((c) => c.id === id);
      if (!clearance) throw new Error('Exit clearance not found');
      return clearance;
    }
    return this.request<ExitClearance>(`/hr/exit-clearance/${id}`);
  }

  static async updateClearanceItem(
    clearanceId: string,
    itemId: string,
    data: { status: ClearanceItemStatus; remarks?: string; clearedBy?: string }
  ): Promise<ClearanceItem> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        id: itemId,
        clearanceId,
        department: 'IT',
        itemName: 'Return Laptop',
        isRequired: true,
        status: data.status,
        remarks: data.remarks,
        clearedBy: data.clearedBy,
        clearedAt: new Date(),
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return this.request<ClearanceItem>(`/hr/exit-clearance/${clearanceId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async recordAssetReturn(
    clearanceId: string,
    data: {
      assetType: string;
      assetName: string;
      assetTag?: string;
      condition: string;
      receivedBy: string;
      remarks?: string;
    }
  ): Promise<AssetReturn> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        id: `asset-${Date.now()}`,
        clearanceId,
        assetType: data.assetType,
        assetName: data.assetName,
        assetTag: data.assetTag,
        returnDate: new Date(),
        condition: data.condition,
        status: 'returned',
        receivedBy: data.receivedBy,
        remarks: data.remarks,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return this.request<AssetReturn>(`/hr/exit-clearance/${clearanceId}/assets`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============================================================================
  // Exit Interview
  // ============================================================================

  static async getExitInterviews(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: ExitInterview[]; total: number }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filtered = [...MOCK_EXIT_INTERVIEWS];
      if (filters?.status) {
        filtered = filtered.filter((i) => i.status === filters.status);
      }
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.page) params.set('page', filters.page.toString());
    if (filters?.limit) params.set('limit', filters.limit.toString());
    return this.request<{ data: ExitInterview[]; total: number }>(
      `/hr/exit-interviews?${params.toString()}`
    );
  }

  static async scheduleExitInterview(data: {
    resignationId: string;
    employeeId: string;
    employeeName: string;
    interviewerId?: string;
    interviewerName?: string;
    scheduledDate: Date;
  }): Promise<ExitInterview> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newInterview: ExitInterview = {
        id: `exit-int-${Date.now()}`,
        ...data,
        status: 'scheduled',
        isConfidential: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_EXIT_INTERVIEWS.push(newInterview);
      return newInterview;
    }
    return this.request<ExitInterview>('/hr/exit-interviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async submitExitInterviewResponse(
    id: string,
    data: Partial<ExitInterview>
  ): Promise<ExitInterview> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_EXIT_INTERVIEWS.findIndex((i) => i.id === id);
      if (index === -1) throw new Error('Exit interview not found');
      MOCK_EXIT_INTERVIEWS[index] = {
        ...MOCK_EXIT_INTERVIEWS[index],
        ...data,
        status: 'completed',
        conductedDate: new Date(),
        updatedAt: new Date(),
      };
      return MOCK_EXIT_INTERVIEWS[index];
    }
    return this.request<ExitInterview>(`/hr/exit-interviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ============================================================================
  // Full & Final Settlement
  // ============================================================================

  static async getSettlements(filters?: {
    status?: SettlementStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: FullFinalSettlement[]; total: number }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filtered = [...MOCK_SETTLEMENTS];
      if (filters?.status) {
        filtered = filtered.filter((s) => s.status === filters.status);
      }
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.page) params.set('page', filters.page.toString());
    if (filters?.limit) params.set('limit', filters.limit.toString());
    return this.request<{ data: FullFinalSettlement[]; total: number }>(
      `/hr/settlements?${params.toString()}`
    );
  }

  static async getSettlementById(id: string): Promise<FullFinalSettlement> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const settlement = MOCK_SETTLEMENTS.find((s) => s.id === id);
      if (!settlement) throw new Error('Settlement not found');
      return settlement;
    }
    return this.request<FullFinalSettlement>(`/hr/settlements/${id}`);
  }

  static async calculateSettlement(
    resignationId: string,
    data: { calculatedBy: string }
  ): Promise<FullFinalSettlement> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newSettlement: FullFinalSettlement = {
        id: `fnf-${Date.now()}`,
        settlementNumber: `FNF-${String(MOCK_SETTLEMENTS.length + 1).padStart(5, '0')}`,
        resignationId,
        employeeId: 'emp-012',
        employeeName: 'Test Employee',
        employeeCode: 'EMP999',
        lastWorkingDate: new Date(),
        status: SettlementStatus.CALCULATED,
        basicSalary: 50000,
        pendingSalaryDays: 15,
        pendingSalaryAmount: 25000,
        leaveEncashmentDays: 10,
        leaveEncashmentAmount: 16667,
        gratuityEligible: true,
        gratuityYears: 4,
        gratuityAmount: 115385,
        bonusAmount: 10000,
        otherEarnings: 0,
        totalEarnings: 167052,
        loanRecovery: 0,
        advanceRecovery: 0,
        noticeShortfall: 0,
        noticeShortfallAmount: 0,
        taxDeduction: 15000,
        otherDeductions: 0,
        totalDeductions: 15000,
        netPayable: 152052,
        calculatedBy: data.calculatedBy,
        calculatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_SETTLEMENTS.push(newSettlement);
      return newSettlement;
    }
    return this.request<FullFinalSettlement>('/hr/settlements/calculate', {
      method: 'POST',
      body: JSON.stringify({ resignationId, ...data }),
    });
  }

  static async approveSettlement(
    id: string,
    data: { approvedBy: string; remarks?: string }
  ): Promise<FullFinalSettlement> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_SETTLEMENTS.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Settlement not found');
      MOCK_SETTLEMENTS[index] = {
        ...MOCK_SETTLEMENTS[index],
        status: SettlementStatus.APPROVED,
        approvedBy: data.approvedBy,
        approvedAt: new Date(),
        remarks: data.remarks,
        updatedAt: new Date(),
      };
      return MOCK_SETTLEMENTS[index];
    }
    return this.request<FullFinalSettlement>(`/hr/settlements/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async processSettlement(
    id: string,
    data: { processedBy: string; paymentMode: string; paymentReference?: string }
  ): Promise<FullFinalSettlement> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_SETTLEMENTS.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Settlement not found');
      MOCK_SETTLEMENTS[index] = {
        ...MOCK_SETTLEMENTS[index],
        status: SettlementStatus.PAID,
        processedBy: data.processedBy,
        processedAt: new Date(),
        paidAt: new Date(),
        paymentMode: data.paymentMode,
        paymentReference: data.paymentReference,
        updatedAt: new Date(),
      };
      return MOCK_SETTLEMENTS[index];
    }
    return this.request<FullFinalSettlement>(`/hr/settlements/${id}/process`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============================================================================
  // Exit Documents
  // ============================================================================

  static async getExitDocuments(resignationId: string): Promise<ExitDocument[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return MOCK_EXIT_DOCUMENTS.filter((d) => d.resignationId === resignationId);
    }
    return this.request<ExitDocument[]>(`/hr/resignations/${resignationId}/documents`);
  }

  static async generateDocument(data: {
    resignationId: string;
    employeeId: string;
    employeeName: string;
    documentType: ExitDocumentType;
    generatedBy: string;
  }): Promise<ExitDocument> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const documentNames: Record<ExitDocumentType, string> = {
        [ExitDocumentType.EXPERIENCE_CERTIFICATE]: 'Experience Certificate',
        [ExitDocumentType.RELIEVING_LETTER]: 'Relieving Letter',
        [ExitDocumentType.SERVICE_CERTIFICATE]: 'Service Certificate',
        [ExitDocumentType.SALARY_CERTIFICATE]: 'Salary Certificate',
        [ExitDocumentType.NO_DUES_CERTIFICATE]: 'No Dues Certificate',
      };
      const newDoc: ExitDocument = {
        id: `doc-${Date.now()}`,
        ...data,
        documentName: documentNames[data.documentType],
        generatedAt: new Date(),
        documentUrl: `/documents/exit/${data.documentType}-${data.employeeId}.pdf`,
        status: 'generated',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_EXIT_DOCUMENTS.push(newDoc);
      return newDoc;
    }
    return this.request<ExitDocument>('/hr/exit-documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async issueDocument(
    id: string,
    data: { issuedBy: string }
  ): Promise<ExitDocument> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_EXIT_DOCUMENTS.findIndex((d) => d.id === id);
      if (index === -1) throw new Error('Document not found');
      MOCK_EXIT_DOCUMENTS[index] = {
        ...MOCK_EXIT_DOCUMENTS[index],
        status: 'issued',
        issuedAt: new Date(),
        issuedBy: data.issuedBy,
        updatedAt: new Date(),
      };
      return MOCK_EXIT_DOCUMENTS[index];
    }
    return this.request<ExitDocument>(`/hr/exit-documents/${id}/issue`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============================================================================
  // Alumni Management
  // ============================================================================

  static async getAlumni(filters?: {
    isEligibleForRehire?: boolean;
    isActiveInNetwork?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: AlumniRecord[]; total: number }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filtered = [...MOCK_ALUMNI];
      if (filters?.isEligibleForRehire !== undefined) {
        filtered = filtered.filter((a) => a.isEligibleForRehire === filters.isEligibleForRehire);
      }
      if (filters?.isActiveInNetwork !== undefined) {
        filtered = filtered.filter((a) => a.isActiveInNetwork === filters.isActiveInNetwork);
      }
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (filters?.isEligibleForRehire !== undefined)
      params.set('isEligibleForRehire', String(filters.isEligibleForRehire));
    if (filters?.isActiveInNetwork !== undefined)
      params.set('isActiveInNetwork', String(filters.isActiveInNetwork));
    if (filters?.page) params.set('page', filters.page.toString());
    if (filters?.limit) params.set('limit', filters.limit.toString());
    return this.request<{ data: AlumniRecord[]; total: number }>(
      `/hr/alumni?${params.toString()}`
    );
  }

  static async getAlumniById(id: string): Promise<AlumniRecord> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const alumni = MOCK_ALUMNI.find((a) => a.id === id);
      if (!alumni) throw new Error('Alumni record not found');
      return alumni;
    }
    return this.request<AlumniRecord>(`/hr/alumni/${id}`);
  }

  static async updateAlumni(
    id: string,
    data: Partial<AlumniRecord>
  ): Promise<AlumniRecord> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_ALUMNI.findIndex((a) => a.id === id);
      if (index === -1) throw new Error('Alumni record not found');
      MOCK_ALUMNI[index] = {
        ...MOCK_ALUMNI[index],
        ...data,
        updatedAt: new Date(),
      };
      return MOCK_ALUMNI[index];
    }
    return this.request<AlumniRecord>(`/hr/alumni/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async initiateRehireProcess(
    id: string,
    data: { initiatedBy: string; remarks?: string }
  ): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const alumni = MOCK_ALUMNI.find((a) => a.id === id);
      if (!alumni) throw new Error('Alumni record not found');
      if (!alumni.isEligibleForRehire) {
        return { success: false, message: 'Alumni is not eligible for rehire' };
      }
      return { success: true, message: 'Rehire process initiated successfully' };
    }
    return this.request<{ success: boolean; message: string }>(`/hr/alumni/${id}/rehire`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============================================================================
  // Dashboard & Statistics
  // ============================================================================

  static async getOffboardingDashboard(): Promise<{
    activeResignations: number;
    pendingClearances: number;
    pendingSettlements: number;
    exitInterviewsPending: number;
    byStatus: Record<string, number>;
    byReason: Record<string, number>;
    recentResignations: ResignationRequest[];
    upcomingLastDays: ResignationRequest[];
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const byStatus: Record<string, number> = {};
      const byReason: Record<string, number> = {};

      MOCK_RESIGNATIONS.forEach((r) => {
        byStatus[r.status] = (byStatus[r.status] || 0) + 1;
        const reason = r.reasonCategory || 'other';
        byReason[reason] = (byReason[reason] || 0) + 1;
      });

      return {
        activeResignations: MOCK_RESIGNATIONS.filter(
          (r) =>
            r.status !== ResignationStatus.WITHDRAWN &&
            r.status !== ResignationStatus.REJECTED
        ).length,
        pendingClearances: MOCK_EXIT_CLEARANCES.filter(
          (c) => c.status === ClearanceStatus.PENDING || c.status === ClearanceStatus.IN_PROGRESS
        ).length,
        pendingSettlements: MOCK_SETTLEMENTS.filter(
          (s) => s.status !== SettlementStatus.PAID
        ).length,
        exitInterviewsPending: MOCK_EXIT_INTERVIEWS.filter((i) => i.status === 'scheduled').length,
        byStatus,
        byReason,
        recentResignations: MOCK_RESIGNATIONS.slice(0, 5),
        upcomingLastDays: MOCK_RESIGNATIONS.filter(
          (r) => r.status === ResignationStatus.ACCEPTED
        ).slice(0, 5),
      };
    }
    return this.request<{
      activeResignations: number;
      pendingClearances: number;
      pendingSettlements: number;
      exitInterviewsPending: number;
      byStatus: Record<string, number>;
      byReason: Record<string, number>;
      recentResignations: ResignationRequest[];
      upcomingLastDays: ResignationRequest[];
    }>('/hr/offboarding/dashboard');
  }

  static async getExitAnalytics(options?: {
    fromDate?: Date;
    toDate?: Date;
  }): Promise<{
    totalExits: number;
    avgTenure: number;
    topReasons: Array<{ reason: string; count: number; percentage: number }>;
    avgSatisfaction: number;
    wouldRecommendRate: number;
    wouldRejoinRate: number;
    monthlyTrend: Array<{ month: string; count: number }>;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        totalExits: 15,
        avgTenure: 2.8,
        topReasons: [
          { reason: 'Better opportunity', count: 6, percentage: 40 },
          { reason: 'Personal reasons', count: 4, percentage: 26.7 },
          { reason: 'Career growth', count: 3, percentage: 20 },
          { reason: 'Education', count: 2, percentage: 13.3 },
        ],
        avgSatisfaction: 3.8,
        wouldRecommendRate: 75,
        wouldRejoinRate: 60,
        monthlyTrend: [
          { month: 'Oct 2023', count: 2 },
          { month: 'Nov 2023', count: 3 },
          { month: 'Dec 2023', count: 4 },
          { month: 'Jan 2024', count: 3 },
        ],
      };
    }
    const params = new URLSearchParams();
    if (options?.fromDate) params.set('fromDate', options.fromDate.toISOString());
    if (options?.toDate) params.set('toDate', options.toDate.toISOString());
    return this.request<{
      totalExits: number;
      avgTenure: number;
      topReasons: Array<{ reason: string; count: number; percentage: number }>;
      avgSatisfaction: number;
      wouldRecommendRate: number;
      wouldRejoinRate: number;
      monthlyTrend: Array<{ month: string; count: number }>;
    }>(`/hr/offboarding/analytics?${params.toString()}`);
  }
}

// Export singleton instance
export const offboardingService = OffboardingService;
