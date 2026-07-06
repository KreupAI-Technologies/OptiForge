/**
 * Onboarding Service
 * Handles all onboarding and probation-related API operations for the HR module
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Enums
// ============================================================================

export enum OnboardingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum OfferStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  NEGOTIATING = 'negotiating',
}

export enum DocumentStatus {
  PENDING = 'pending',
  UPLOADED = 'uploaded',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum VerificationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ProbationStatus {
  ACTIVE = 'active',
  EXTENDED = 'extended',
  CONFIRMED = 'confirmed',
  TERMINATED = 'terminated',
}

export enum ReviewStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  MISSED = 'missed',
}

// ============================================================================
// Interfaces
// ============================================================================

export interface OnboardingProcess {
  id: string;
  onboardingNumber: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentId?: string;
  departmentName?: string;
  designationId?: string;
  designationName?: string;
  reportingManagerId?: string;
  reportingManagerName?: string;
  joiningDate: Date;
  status: OnboardingStatus;
  currentStep?: string;
  progress: number;
  preJoiningComplete: boolean;
  joiningProcessComplete: boolean;
  orientationComplete: boolean;
  checklistComplete: boolean;
  assignedHrId?: string;
  assignedHrName?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OfferManagement {
  id: string;
  offerNumber: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  positionTitle: string;
  departmentId?: string;
  departmentName?: string;
  designationId?: string;
  designationName?: string;
  salary: number;
  joiningDate: Date;
  offerLetterUrl?: string;
  status: OfferStatus;
  sentAt?: Date;
  respondedAt?: Date;
  expiryDate?: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentCollection {
  id: string;
  onboardingId: string;
  documentType: string;
  documentName: string;
  description?: string;
  isRequired: boolean;
  uploadedUrl?: string;
  status: DocumentStatus;
  verifiedBy?: string;
  verifiedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BackgroundVerification {
  id: string;
  onboardingId: string;
  verificationType: string;
  vendorName?: string;
  initiatedDate: Date;
  expectedCompletionDate?: Date;
  completedDate?: Date;
  status: VerificationStatus;
  result?: string;
  remarks?: string;
  reportUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalCheckup {
  id: string;
  onboardingId: string;
  checkupType: string;
  hospitalName?: string;
  scheduledDate?: Date;
  completedDate?: Date;
  status: VerificationStatus;
  result?: string;
  medicalReportUrl?: string;
  fitnessStatus?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirstDaySetup {
  id: string;
  onboardingId: string;
  workstationAssigned: boolean;
  accessCardIssued: boolean;
  itEquipmentReady: boolean;
  welcomeKitProvided: boolean;
  mentorAssigned: boolean;
  mentorId?: string;
  mentorName?: string;
  buddyAssigned: boolean;
  buddyId?: string;
  buddyName?: string;
  parkingAssigned: boolean;
  cafeteriaAccess: boolean;
  status: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDCardRequest {
  id: string;
  onboardingId: string;
  requestNumber: string;
  photoUrl?: string;
  employeeId: string;
  employeeName: string;
  status: string;
  requestedAt: Date;
  generatedAt?: Date;
  issuedAt?: Date;
  cardNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemAccessRequest {
  id: string;
  onboardingId: string;
  requestNumber: string;
  systemName: string;
  accessLevel: string;
  justification?: string;
  status: string;
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  provisionedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrientationSchedule {
  id: string;
  onboardingId: string;
  sessionType: string;
  sessionName: string;
  description?: string;
  facilitatorId?: string;
  facilitatorName?: string;
  scheduledDate: Date;
  scheduledTime?: string;
  duration?: number;
  location?: string;
  isVirtual: boolean;
  meetingLink?: string;
  status: string;
  attendedAt?: Date;
  feedback?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingChecklistItem {
  id: string;
  onboardingId: string;
  category: string;
  itemName: string;
  description?: string;
  isRequired: boolean;
  assignedTo?: string;
  assignedToName?: string;
  dueDate?: Date;
  status: string;
  completedAt?: Date;
  completedBy?: string;
  remarks?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProbationPeriod {
  id: string;
  probationNumber: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentId?: string;
  departmentName?: string;
  designationId?: string;
  designationName?: string;
  reportingManagerId?: string;
  reportingManagerName?: string;
  joiningDate: Date;
  probationStartDate: Date;
  probationEndDate: Date;
  duration: number;
  status: ProbationStatus;
  performanceRating?: number;
  attendanceRating?: number;
  behaviorRating?: number;
  skillsRating?: number;
  overallRating?: number;
  recommendation?: string;
  decisionDate?: Date;
  decisionBy?: string;
  decisionRemarks?: string;
  extensionPeriod?: number;
  extensionReason?: string;
  extendedEndDate?: Date;
  confirmedAt?: Date;
  reviews?: ProbationReview[];
  feedbacks?: ProbationFeedback[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProbationReview {
  id: string;
  probationId: string;
  reviewNumber: number;
  reviewType: string;
  scheduledDate: Date;
  actualDate?: Date;
  reviewerId?: string;
  reviewerName?: string;
  status: ReviewStatus;
  performanceScore?: number;
  attendanceScore?: number;
  teamworkScore?: number;
  communicationScore?: number;
  technicalScore?: number;
  overallScore?: number;
  strengths?: string;
  areasOfImprovement?: string;
  goalsForNextPeriod?: string;
  recommendation?: string;
  remarks?: string;
  employeeComments?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProbationFeedback {
  id: string;
  probationId: string;
  feedbackType: string;
  feedbackFrom?: string;
  feedbackFromName?: string;
  technicalSkills?: number;
  communication?: number;
  teamwork?: number;
  initiative?: number;
  punctuality?: number;
  qualityOfWork?: number;
  positives?: string;
  improvements?: string;
  overallComments?: string;
  overallRating?: number;
  isAnonymous: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_ONBOARDING_PROCESSES: OnboardingProcess[] = [
  {
    id: 'onb-001',
    onboardingNumber: 'ONB-00001',
    employeeId: 'emp-new-001',
    employeeName: 'Rahul Mehta',
    employeeCode: 'EMP101',
    departmentId: 'dept-001',
    departmentName: 'Production',
    designationId: 'desig-005',
    designationName: 'Production Engineer',
    reportingManagerId: 'emp-001',
    reportingManagerName: 'Rajesh Kumar',
    joiningDate: new Date('2024-02-01'),
    status: OnboardingStatus.IN_PROGRESS,
    currentStep: 'orientation',
    progress: 75,
    preJoiningComplete: true,
    joiningProcessComplete: true,
    orientationComplete: false,
    checklistComplete: false,
    assignedHrId: 'emp-002',
    assignedHrName: 'Priya Sharma',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-05'),
  },
  {
    id: 'onb-002',
    onboardingNumber: 'ONB-00002',
    employeeId: 'emp-new-002',
    employeeName: 'Anjali Singh',
    employeeCode: 'EMP102',
    departmentId: 'dept-004',
    departmentName: 'Finance',
    designationId: 'desig-008',
    designationName: 'Financial Analyst',
    reportingManagerId: 'emp-004',
    reportingManagerName: 'Sneha Reddy',
    joiningDate: new Date('2024-02-15'),
    status: OnboardingStatus.PENDING,
    currentStep: 'pre-joining',
    progress: 25,
    preJoiningComplete: false,
    joiningProcessComplete: false,
    orientationComplete: false,
    checklistComplete: false,
    assignedHrId: 'emp-002',
    assignedHrName: 'Priya Sharma',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: 'onb-003',
    onboardingNumber: 'ONB-00003',
    employeeId: 'emp-new-003',
    employeeName: 'Vikrant Patel',
    employeeCode: 'EMP103',
    departmentId: 'dept-006',
    departmentName: 'IT',
    designationId: 'desig-012',
    designationName: 'Software Developer',
    reportingManagerId: 'emp-008',
    reportingManagerName: 'Deepak Verma',
    joiningDate: new Date('2024-01-15'),
    status: OnboardingStatus.COMPLETED,
    currentStep: 'completed',
    progress: 100,
    preJoiningComplete: true,
    joiningProcessComplete: true,
    orientationComplete: true,
    checklistComplete: true,
    assignedHrId: 'emp-002',
    assignedHrName: 'Priya Sharma',
    completedAt: new Date('2024-01-30'),
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-30'),
  },
];

const MOCK_OFFERS: OfferManagement[] = [
  {
    id: 'offer-001',
    offerNumber: 'OFR-00001',
    candidateName: 'Meera Krishnan',
    candidateEmail: 'meera.k@email.com',
    candidatePhone: '+91 98765 43210',
    positionTitle: 'Senior QC Engineer',
    departmentId: 'dept-003',
    departmentName: 'Quality Control',
    designationId: 'desig-006',
    designationName: 'Senior QC Engineer',
    salary: 75000,
    joiningDate: new Date('2024-03-01'),
    offerLetterUrl: '/documents/offers/offer-001.pdf',
    status: OfferStatus.SENT,
    sentAt: new Date('2024-01-28'),
    expiryDate: new Date('2024-02-10'),
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-28'),
  },
  {
    id: 'offer-002',
    offerNumber: 'OFR-00002',
    candidateName: 'Arjun Nair',
    candidateEmail: 'arjun.n@email.com',
    candidatePhone: '+91 87654 32109',
    positionTitle: 'Marketing Executive',
    departmentId: 'dept-007',
    departmentName: 'Marketing',
    designationId: 'desig-015',
    designationName: 'Marketing Executive',
    salary: 55000,
    joiningDate: new Date('2024-02-20'),
    status: OfferStatus.ACCEPTED,
    sentAt: new Date('2024-01-20'),
    respondedAt: new Date('2024-01-22'),
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-22'),
  },
  {
    id: 'offer-003',
    offerNumber: 'OFR-00003',
    candidateName: 'Neha Sharma',
    candidateEmail: 'neha.s@email.com',
    positionTitle: 'HR Executive',
    departmentId: 'dept-002',
    departmentName: 'Human Resources',
    salary: 45000,
    joiningDate: new Date('2024-02-25'),
    status: OfferStatus.NEGOTIATING,
    sentAt: new Date('2024-01-25'),
    remarks: 'Candidate requested higher salary',
    createdAt: new Date('2024-01-23'),
    updatedAt: new Date('2024-01-27'),
  },
];

const MOCK_PROBATION_PERIODS: ProbationPeriod[] = [
  {
    id: 'prob-001',
    probationNumber: 'PRB-00001',
    employeeId: 'emp-new-003',
    employeeName: 'Vikrant Patel',
    employeeCode: 'EMP103',
    departmentId: 'dept-006',
    departmentName: 'IT',
    designationId: 'desig-012',
    designationName: 'Software Developer',
    reportingManagerId: 'emp-008',
    reportingManagerName: 'Deepak Verma',
    joiningDate: new Date('2024-01-15'),
    probationStartDate: new Date('2024-01-15'),
    probationEndDate: new Date('2024-04-15'),
    duration: 90,
    status: ProbationStatus.ACTIVE,
    performanceRating: 4.2,
    attendanceRating: 4.5,
    behaviorRating: 4.0,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'prob-002',
    probationNumber: 'PRB-00002',
    employeeId: 'emp-010',
    employeeName: 'Kavita Nair',
    employeeCode: 'EMP010',
    departmentId: 'dept-006',
    departmentName: 'IT',
    reportingManagerId: 'emp-006',
    reportingManagerName: 'Vikram Singh',
    joiningDate: new Date('2023-09-01'),
    probationStartDate: new Date('2023-09-01'),
    probationEndDate: new Date('2023-12-01'),
    duration: 90,
    status: ProbationStatus.CONFIRMED,
    performanceRating: 4.5,
    attendanceRating: 4.8,
    behaviorRating: 4.6,
    skillsRating: 4.4,
    overallRating: 4.6,
    recommendation: 'Confirmed',
    decisionDate: new Date('2023-11-28'),
    decisionBy: 'emp-006',
    decisionRemarks: 'Excellent performance during probation. Confirmed as permanent employee.',
    confirmedAt: new Date('2023-12-01'),
    createdAt: new Date('2023-09-01'),
    updatedAt: new Date('2023-12-01'),
  },
  {
    id: 'prob-003',
    probationNumber: 'PRB-00003',
    employeeId: 'emp-009',
    employeeName: 'Sanjay Gupta',
    employeeCode: 'EMP009',
    departmentId: 'dept-005',
    departmentName: 'Sales',
    reportingManagerId: 'emp-006',
    reportingManagerName: 'Vikram Singh',
    joiningDate: new Date('2023-07-01'),
    probationStartDate: new Date('2023-07-01'),
    probationEndDate: new Date('2023-10-01'),
    duration: 90,
    status: ProbationStatus.EXTENDED,
    performanceRating: 3.2,
    recommendation: 'Extend',
    decisionDate: new Date('2023-09-28'),
    decisionBy: 'emp-006',
    decisionRemarks: 'Need more time to assess sales performance.',
    extensionPeriod: 30,
    extensionReason: 'Performance below expectations in initial months. Given extension for improvement.',
    extendedEndDate: new Date('2023-11-01'),
    createdAt: new Date('2023-07-01'),
    updatedAt: new Date('2023-10-01'),
  },
];

const MOCK_PROBATION_REVIEWS: ProbationReview[] = [
  {
    id: 'review-001',
    probationId: 'prob-001',
    reviewNumber: 1,
    reviewType: '30-day',
    scheduledDate: new Date('2024-02-14'),
    actualDate: new Date('2024-02-14'),
    reviewerId: 'emp-008',
    reviewerName: 'Deepak Verma',
    status: ReviewStatus.COMPLETED,
    performanceScore: 4.0,
    attendanceScore: 4.5,
    teamworkScore: 4.2,
    communicationScore: 4.0,
    technicalScore: 4.3,
    overallScore: 4.2,
    strengths: 'Quick learner, good coding skills, proactive approach',
    areasOfImprovement: 'Documentation can be improved',
    goalsForNextPeriod: 'Complete 2 modules independently, improve documentation',
    recommendation: 'Continue',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-14'),
  },
  {
    id: 'review-002',
    probationId: 'prob-001',
    reviewNumber: 2,
    reviewType: '60-day',
    scheduledDate: new Date('2024-03-15'),
    reviewerId: 'emp-008',
    reviewerName: 'Deepak Verma',
    status: ReviewStatus.SCHEDULED,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
];

// ============================================================================
// Service Class
// ============================================================================

export class OnboardingService {
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
  // Onboarding Process
  // ============================================================================

  static async getOnboardingProcesses(filters?: {
    status?: OnboardingStatus;
    departmentId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: OnboardingProcess[]; total: number }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filtered = [...MOCK_ONBOARDING_PROCESSES];
      if (filters?.status) {
        filtered = filtered.filter((o) => o.status === filters.status);
      }
      if (filters?.departmentId) {
        filtered = filtered.filter((o) => o.departmentId === filters.departmentId);
      }
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.departmentId) params.set('departmentId', filters.departmentId);
    if (filters?.page) params.set('page', filters.page.toString());
    if (filters?.limit) params.set('limit', filters.limit.toString());
    return this.request<{ data: OnboardingProcess[]; total: number }>(
      `/hr/onboarding?${params.toString()}`
    );
  }

  static async getOnboardingById(id: string): Promise<OnboardingProcess> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const process = MOCK_ONBOARDING_PROCESSES.find((o) => o.id === id);
      if (!process) throw new Error('Onboarding process not found');
      return process;
    }
    return this.request<OnboardingProcess>(`/hr/onboarding/${id}`);
  }

  static async createOnboarding(data: {
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    departmentId?: string;
    designationId?: string;
    reportingManagerId?: string;
    joiningDate: Date;
    assignedHrId?: string;
  }): Promise<OnboardingProcess> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newProcess: OnboardingProcess = {
        id: `onb-${Date.now()}`,
        onboardingNumber: `ONB-${String(MOCK_ONBOARDING_PROCESSES.length + 1).padStart(5, '0')}`,
        ...data,
        status: OnboardingStatus.PENDING,
        currentStep: 'pre-joining',
        progress: 0,
        preJoiningComplete: false,
        joiningProcessComplete: false,
        orientationComplete: false,
        checklistComplete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_ONBOARDING_PROCESSES.push(newProcess);
      return newProcess;
    }
    return this.request<OnboardingProcess>('/hr/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateOnboardingProgress(
    id: string,
    data: { currentStep: string; progress: number }
  ): Promise<OnboardingProcess> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_ONBOARDING_PROCESSES.findIndex((o) => o.id === id);
      if (index === -1) throw new Error('Onboarding process not found');
      MOCK_ONBOARDING_PROCESSES[index] = {
        ...MOCK_ONBOARDING_PROCESSES[index],
        ...data,
        updatedAt: new Date(),
      };
      return MOCK_ONBOARDING_PROCESSES[index];
    }
    return this.request<OnboardingProcess>(`/hr/onboarding/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ============================================================================
  // Offer Management
  // ============================================================================

  static async getOffers(filters?: {
    status?: OfferStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: OfferManagement[]; total: number }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filtered = [...MOCK_OFFERS];
      if (filters?.status) {
        filtered = filtered.filter((o) => o.status === filters.status);
      }
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.page) params.set('page', filters.page.toString());
    if (filters?.limit) params.set('limit', filters.limit.toString());
    return this.request<{ data: OfferManagement[]; total: number }>(
      `/hr/offers?${params.toString()}`
    );
  }

  static async getOfferById(id: string): Promise<OfferManagement | null> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return MOCK_OFFERS.find((o) => o.id === id) || null;
    }
    return this.request<OfferManagement | null>(`/hr/offers/${id}`);
  }

  static async createOffer(data: Partial<OfferManagement>): Promise<OfferManagement> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newOffer: OfferManagement = {
        id: `offer-${Date.now()}`,
        offerNumber: `OFR-${String(MOCK_OFFERS.length + 1).padStart(5, '0')}`,
        candidateName: data.candidateName || '',
        candidateEmail: data.candidateEmail || '',
        candidatePhone: data.candidatePhone,
        positionTitle: data.positionTitle || '',
        departmentId: data.departmentId,
        designationId: data.designationId,
        salary: data.salary || 0,
        joiningDate: data.joiningDate || new Date(),
        status: OfferStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_OFFERS.push(newOffer);
      return newOffer;
    }
    return this.request<OfferManagement>('/hr/offers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async sendOffer(id: string): Promise<OfferManagement> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_OFFERS.findIndex((o) => o.id === id);
      if (index === -1) throw new Error('Offer not found');
      MOCK_OFFERS[index] = {
        ...MOCK_OFFERS[index],
        status: OfferStatus.SENT,
        sentAt: new Date(),
        updatedAt: new Date(),
      };
      return MOCK_OFFERS[index];
    }
    return this.request<OfferManagement>(`/hr/offers/${id}/send`, {
      method: 'POST',
    });
  }

  static async updateOfferStatus(
    id: string,
    status: OfferStatus,
    remarks?: string
  ): Promise<OfferManagement> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_OFFERS.findIndex((o) => o.id === id);
      if (index === -1) throw new Error('Offer not found');
      MOCK_OFFERS[index] = {
        ...MOCK_OFFERS[index],
        status,
        remarks,
        respondedAt: status === OfferStatus.ACCEPTED || status === OfferStatus.REJECTED ? new Date() : undefined,
        updatedAt: new Date(),
      };
      return MOCK_OFFERS[index];
    }
    return this.request<OfferManagement>(`/hr/offers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks }),
    });
  }

  // ============================================================================
  // Probation Management
  // ============================================================================

  static async getProbationPeriods(filters?: {
    status?: ProbationStatus;
    departmentId?: string;
    endingSoon?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: ProbationPeriod[]; total: number }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filtered = [...MOCK_PROBATION_PERIODS];
      if (filters?.status) {
        filtered = filtered.filter((p) => p.status === filters.status);
      }
      if (filters?.departmentId) {
        filtered = filtered.filter((p) => p.departmentId === filters.departmentId);
      }
      if (filters?.endingSoon) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        filtered = filtered.filter(
          (p) => p.status === ProbationStatus.ACTIVE && new Date(p.probationEndDate) <= thirtyDaysFromNow
        );
      }
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.departmentId) params.set('departmentId', filters.departmentId);
    if (filters?.endingSoon) params.set('endingSoon', 'true');
    if (filters?.page) params.set('page', filters.page.toString());
    if (filters?.limit) params.set('limit', filters.limit.toString());
    return this.request<{ data: ProbationPeriod[]; total: number }>(
      `/hr/probation?${params.toString()}`
    );
  }

  static async getProbationById(id: string): Promise<ProbationPeriod> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const probation = MOCK_PROBATION_PERIODS.find((p) => p.id === id);
      if (!probation) throw new Error('Probation period not found');
      probation.reviews = MOCK_PROBATION_REVIEWS.filter((r) => r.probationId === id);
      return probation;
    }
    return this.request<ProbationPeriod>(`/hr/probation/${id}`);
  }

  static async confirmEmployee(
    id: string,
    data: { confirmedBy: string; remarks?: string }
  ): Promise<ProbationPeriod> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_PROBATION_PERIODS.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Probation period not found');
      MOCK_PROBATION_PERIODS[index] = {
        ...MOCK_PROBATION_PERIODS[index],
        status: ProbationStatus.CONFIRMED,
        decisionDate: new Date(),
        decisionBy: data.confirmedBy,
        decisionRemarks: data.remarks,
        confirmedAt: new Date(),
        updatedAt: new Date(),
      };
      return MOCK_PROBATION_PERIODS[index];
    }
    return this.request<ProbationPeriod>(`/hr/probation/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async extendProbation(
    id: string,
    data: { extensionPeriod: number; extensionReason: string; extendedBy: string }
  ): Promise<ProbationPeriod> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_PROBATION_PERIODS.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Probation period not found');
      const current = MOCK_PROBATION_PERIODS[index];
      const newEndDate = new Date(current.extendedEndDate || current.probationEndDate);
      newEndDate.setDate(newEndDate.getDate() + data.extensionPeriod);
      MOCK_PROBATION_PERIODS[index] = {
        ...current,
        status: ProbationStatus.EXTENDED,
        extensionPeriod: data.extensionPeriod,
        extensionReason: data.extensionReason,
        extendedEndDate: newEndDate,
        decisionDate: new Date(),
        decisionBy: data.extendedBy,
        updatedAt: new Date(),
      };
      return MOCK_PROBATION_PERIODS[index];
    }
    return this.request<ProbationPeriod>(`/hr/probation/${id}/extend`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============================================================================
  // Probation Reviews
  // ============================================================================

  static async getReviews(probationId: string): Promise<ProbationReview[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return MOCK_PROBATION_REVIEWS.filter((r) => r.probationId === probationId);
    }
    return this.request<ProbationReview[]>(`/hr/probation/${probationId}/reviews`);
  }

  static async scheduleReview(data: {
    probationId: string;
    reviewNumber: number;
    reviewType: string;
    scheduledDate: Date;
    reviewerId?: string;
    reviewerName?: string;
  }): Promise<ProbationReview> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newReview: ProbationReview = {
        id: `review-${Date.now()}`,
        ...data,
        status: ReviewStatus.SCHEDULED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_PROBATION_REVIEWS.push(newReview);
      return newReview;
    }
    return this.request<ProbationReview>('/hr/probation/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async submitReview(
    id: string,
    data: Partial<ProbationReview>
  ): Promise<ProbationReview> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_PROBATION_REVIEWS.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Review not found');
      MOCK_PROBATION_REVIEWS[index] = {
        ...MOCK_PROBATION_REVIEWS[index],
        ...data,
        status: ReviewStatus.COMPLETED,
        actualDate: new Date(),
        updatedAt: new Date(),
      };
      return MOCK_PROBATION_REVIEWS[index];
    }
    return this.request<ProbationReview>(`/hr/probation/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ============================================================================
  // Dashboard & Statistics
  // ============================================================================

  static async getOnboardingDashboard(): Promise<{
    totalActive: number;
    pendingJoining: number;
    inProgress: number;
    completedThisMonth: number;
    pendingOffers: number;
    byDepartment: Record<string, number>;
    recentOnboardings: OnboardingProcess[];
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const byDepartment: Record<string, number> = {};
      MOCK_ONBOARDING_PROCESSES.forEach((o) => {
        const dept = o.departmentName || 'Unknown';
        byDepartment[dept] = (byDepartment[dept] || 0) + 1;
      });

      return {
        totalActive: MOCK_ONBOARDING_PROCESSES.filter(
          (o) => o.status !== OnboardingStatus.COMPLETED && o.status !== OnboardingStatus.CANCELLED
        ).length,
        pendingJoining: MOCK_ONBOARDING_PROCESSES.filter((o) => o.status === OnboardingStatus.PENDING).length,
        inProgress: MOCK_ONBOARDING_PROCESSES.filter((o) => o.status === OnboardingStatus.IN_PROGRESS).length,
        completedThisMonth: MOCK_ONBOARDING_PROCESSES.filter((o) => o.status === OnboardingStatus.COMPLETED).length,
        pendingOffers: MOCK_OFFERS.filter((o) => o.status === OfferStatus.SENT).length,
        byDepartment,
        recentOnboardings: MOCK_ONBOARDING_PROCESSES.slice(0, 5),
      };
    }
    return this.request<{
      totalActive: number;
      pendingJoining: number;
      inProgress: number;
      completedThisMonth: number;
      pendingOffers: number;
      byDepartment: Record<string, number>;
      recentOnboardings: OnboardingProcess[];
    }>('/hr/onboarding/dashboard');
  }

  static async getProbationDashboard(): Promise<{
    totalActive: number;
    byStatus: Record<string, number>;
    endingSoon: ProbationPeriod[];
    pendingReviews: number;
    recentConfirmations: ProbationPeriod[];
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const byStatus: Record<string, number> = {};
      MOCK_PROBATION_PERIODS.forEach((p) => {
        byStatus[p.status] = (byStatus[p.status] || 0) + 1;
      });

      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      return {
        totalActive: MOCK_PROBATION_PERIODS.filter((p) => p.status === ProbationStatus.ACTIVE).length,
        byStatus,
        endingSoon: MOCK_PROBATION_PERIODS.filter(
          (p) => p.status === ProbationStatus.ACTIVE && new Date(p.probationEndDate) <= thirtyDaysFromNow
        ),
        pendingReviews: MOCK_PROBATION_REVIEWS.filter((r) => r.status === ReviewStatus.SCHEDULED).length,
        recentConfirmations: MOCK_PROBATION_PERIODS.filter((p) => p.status === ProbationStatus.CONFIRMED).slice(0, 5),
      };
    }
    return this.request<{
      totalActive: number;
      byStatus: Record<string, number>;
      endingSoon: ProbationPeriod[];
      pendingReviews: number;
      recentConfirmations: ProbationPeriod[];
    }>('/hr/probation/dashboard');
  }
}

// Export singleton instance
export const onboardingService = OnboardingService;
