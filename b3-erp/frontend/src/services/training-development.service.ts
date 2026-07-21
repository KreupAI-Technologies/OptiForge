/**
 * Training & Development Service
 * Handles all training and development operations including programs, enrollment,
 * skill development, e-learning, budget, and training reports
 */

const USE_MOCK_DATA = false;

/**
 * NestJS domain backend base URL (b3-erp HR module). Training & development calls
 * target the real NestJS controllers under `${API_BASE_URL}/hr/...`.
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/** Default tenant scope; siblings (hr-self-service) send the same header. */
const COMPANY_ID = 'company-1';

/**
 * Central fetch wrapper: prefixes the NestJS base URL, attaches `credentials: 'include'`
 * for the Keycloak JWT cookie, and sends `x-company-id` (mirroring the other HR services).
 */
function trainFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      'x-company-id': COMPANY_ID,
      ...(init.headers ?? {}),
    },
  });
}

// ============================================================================
// Enums
// ============================================================================

export enum TrainingProgramStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived',
}

export enum TrainingType {
  CLASSROOM = 'classroom',
  VIRTUAL = 'virtual',
  E_LEARNING = 'e_learning',
  ON_THE_JOB = 'on_the_job',
  WORKSHOP = 'workshop',
  SEMINAR = 'seminar',
  CERTIFICATION = 'certification',
  EXTERNAL = 'external',
}

export enum TrainingCategory {
  TECHNICAL = 'technical',
  SOFT_SKILLS = 'soft_skills',
  LEADERSHIP = 'leadership',
  COMPLIANCE = 'compliance',
  PRODUCT = 'product',
  ONBOARDING = 'onboarding',
  SAFETY = 'safety',
  PROFESSIONAL = 'professional',
}

export enum EnrollmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ENROLLED = 'enrolled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  WAITLISTED = 'waitlisted',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  PARTIAL = 'partial',
  EXCUSED = 'excused',
}

export enum CourseProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum AssessmentType {
  PRE_ASSESSMENT = 'pre_assessment',
  POST_ASSESSMENT = 'post_assessment',
  QUIZ = 'quiz',
  EXAM = 'exam',
  PRACTICAL = 'practical',
}

export enum CertificationStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  PENDING_RENEWAL = 'pending_renewal',
  REVOKED = 'revoked',
}

export enum BudgetStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  ACTIVE = 'active',
  EXHAUSTED = 'exhausted',
  CLOSED = 'closed',
}

// ============================================================================
// Interfaces
// ============================================================================

export interface TrainingProgram {
  id: string;
  programCode: string;
  programName: string;
  description?: string;
  category: TrainingCategory;
  trainingType: TrainingType;
  status: TrainingProgramStatus;
  objectives?: string[];
  targetAudience?: string;
  prerequisites?: string[];
  syllabus?: SyllabusItem[];
  durationHours: number;
  durationDays?: number;
  maxParticipants?: number;
  minParticipants?: number;
  instructorName?: string;
  instructorId?: string;
  externalVendor?: string;
  location?: string;
  trainingMaterials?: string[];
  certificationProvided: boolean;
  certificationName?: string;
  certificationValidityMonths?: number;
  cost?: number;
  costPerParticipant?: number;
  isExternal: boolean;
  isMandatory: boolean;
  applicableDepartments?: string[];
  applicableDesignations?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SyllabusItem {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  order: number;
  topics?: string[];
}

export interface TrainingSchedule {
  id: string;
  scheduleCode: string;
  programId: string;
  program?: TrainingProgram;
  batchName: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  sessions?: TrainingSession[];
  location?: string;
  meetingLink?: string;
  instructorId?: string;
  instructorName?: string;
  maxParticipants: number;
  enrolledCount: number;
  availableSeats: number;
  waitlistCount: number;
  status: string;
  registrationDeadline?: string;
  remarks?: string;
}

export interface TrainingSession {
  id: string;
  sessionNumber: number;
  date: string;
  startTime: string;
  endTime: string;
  topic?: string;
  location?: string;
  meetingLink?: string;
  status: string;
}

export interface TrainingEnrollment {
  id: string;
  enrollmentCode: string;
  scheduleId: string;
  schedule?: TrainingSchedule;
  programId: string;
  program?: TrainingProgram;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department?: string;
  designation?: string;
  status: EnrollmentStatus;
  enrollmentDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  completionDate?: string;
  completionStatus?: string;
  score?: number;
  grade?: string;
  certificateIssued: boolean;
  certificateNumber?: string;
  certificateIssuedDate?: string;
  feedback?: string;
  attendancePercentage?: number;
}

export interface TrainingAttendance {
  id: string;
  enrollmentId: string;
  enrollment?: TrainingEnrollment;
  sessionId: string;
  session?: TrainingSession;
  employeeId: string;
  employeeName: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  durationMinutes?: number;
  remarks?: string;
  markedBy?: string;
}

export interface TrainingWaitlist {
  id: string;
  scheduleId: string;
  schedule?: TrainingSchedule;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department?: string;
  position: number;
  addedDate: string;
  notificationSent: boolean;
  status: string;
  expiresAt?: string;
}

export interface SkillMatrix {
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  skills: EmployeeSkill[];
  overallProficiency: number;
  lastAssessmentDate?: string;
}

export interface EmployeeSkill {
  skillId: string;
  skillName: string;
  category: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  lastAssessed?: string;
  certifications?: string[];
}

export interface SkillAssessment {
  id: string;
  assessmentCode: string;
  employeeId: string;
  employeeName: string;
  assessorId?: string;
  assessorName?: string;
  assessmentType: string;
  assessmentDate: string;
  skills: SkillAssessmentItem[];
  overallScore: number;
  strengths?: string[];
  developmentAreas?: string[];
  recommendations?: string[];
  status: string;
}

export interface SkillAssessmentItem {
  skillId: string;
  skillName: string;
  selfRating?: number;
  assessorRating?: number;
  finalRating: number;
  evidence?: string;
  comments?: string;
}

export interface SkillGapAnalysis {
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  gaps: SkillGap[];
  totalGapScore: number;
  recommendedTrainings: RecommendedTraining[];
}

export interface SkillGap {
  skillId: string;
  skillName: string;
  category: string;
  currentLevel: number;
  requiredLevel: number;
  gapScore: number;
  priority: string;
}

export interface RecommendedTraining {
  programId: string;
  programName: string;
  relevantSkills: string[];
  matchScore: number;
  nextSchedule?: string;
}

export interface CertificationTracking {
  id: string;
  certificationCode: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department?: string;
  certificationName: string;
  issuingAuthority: string;
  certificationNumber?: string;
  issueDate: string;
  expiryDate?: string;
  status: CertificationStatus;
  renewalReminderDays?: number;
  verificationUrl?: string;
  documentPath?: string;
  cost?: number;
  paidBy?: string;
  trainingProgramId?: string;
  trainingProgram?: TrainingProgram;
  renewalHistory?: CertificationRenewal[];
}

export interface CertificationRenewal {
  id: string;
  renewalDate: string;
  newExpiryDate: string;
  cost?: number;
  remarks?: string;
}

export interface TrainingFeedback {
  id: string;
  enrollmentId: string;
  enrollment?: TrainingEnrollment;
  scheduleId: string;
  programId: string;
  employeeId: string;
  employeeName?: string;
  isAnonymous: boolean;
  overallRating: number;
  contentRating: number;
  instructorRating: number;
  facilitiesRating?: number;
  relevanceRating: number;
  paceRating: number;
  materialsRating?: number;
  strengths?: string;
  improvements?: string;
  additionalComments?: string;
  wouldRecommend: boolean;
  submittedAt: string;
}

export interface TrainingAssessment {
  id: string;
  assessmentCode: string;
  programId: string;
  program?: TrainingProgram;
  scheduleId?: string;
  assessmentName: string;
  assessmentType: AssessmentType;
  description?: string;
  instructions?: string;
  totalMarks: number;
  passingMarks: number;
  durationMinutes: number;
  questions?: AssessmentQuestion[];
  questionCount: number;
  isRandomized: boolean;
  attemptsAllowed: number;
  isActive: boolean;
}

export interface AssessmentQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  questionType: string;
  options?: string[];
  correctAnswer?: string;
  marks: number;
  explanation?: string;
}

export interface TrainingAssessmentAttempt {
  id: string;
  assessmentId: string;
  assessment?: TrainingAssessment;
  enrollmentId: string;
  employeeId: string;
  employeeName: string;
  attemptNumber: number;
  startTime: string;
  endTime?: string;
  status: string;
  answers?: AssessmentAnswer[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  isPassed: boolean;
  feedback?: string;
}

export interface AssessmentAnswer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  marksObtained?: number;
}

export interface ELearningCourse {
  id: string;
  courseCode: string;
  courseName: string;
  description?: string;
  category: TrainingCategory;
  thumbnail?: string;
  instructorName?: string;
  durationHours: number;
  modules: CourseModule[];
  totalModules: number;
  totalLessons: number;
  level: string;
  prerequisites?: string[];
  skills?: string[];
  enrollmentCount: number;
  averageRating: number;
  ratingCount: number;
  certificationProvided: boolean;
  certificationName?: string;
  isPublished: boolean;
  isFree: boolean;
  price?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  moduleNumber: number;
  title: string;
  description?: string;
  durationMinutes: number;
  lessons: CourseLesson[];
  isLocked: boolean;
}

export interface CourseLesson {
  id: string;
  lessonNumber: number;
  title: string;
  type: string;
  content?: string;
  videoUrl?: string;
  documentUrl?: string;
  durationMinutes: number;
  isPreview: boolean;
}

export interface CourseProgress {
  id: string;
  courseId: string;
  course?: ELearningCourse;
  employeeId: string;
  employeeName: string;
  enrollmentDate: string;
  status: CourseProgressStatus;
  progressPercentage: number;
  completedModules: number;
  completedLessons: number;
  totalModules: number;
  totalLessons: number;
  lastAccessedAt?: string;
  lastAccessedLessonId?: string;
  timeSpentMinutes: number;
  lessonProgress: LessonProgress[];
  assessmentsPassed: number;
  totalAssessments: number;
  completionDate?: string;
  certificateIssued: boolean;
  certificateNumber?: string;
}

export interface LessonProgress {
  lessonId: string;
  moduleId: string;
  isCompleted: boolean;
  progressPercentage: number;
  timeSpentMinutes: number;
  lastAccessedAt?: string;
}

export interface TrainingBudget {
  id: string;
  budgetCode: string;
  budgetName: string;
  fiscalYear: string;
  departmentId?: string;
  departmentName?: string;
  budgetType: string;
  totalBudget: number;
  allocatedBudget: number;
  usedBudget: number;
  availableBudget: number;
  status: BudgetStatus;
  approvedBy?: string;
  approvedDate?: string;
  startDate: string;
  endDate: string;
  categories?: BudgetCategory[];
  remarks?: string;
}

export interface BudgetCategory {
  category: string;
  allocated: number;
  used: number;
  available: number;
}

export interface TrainingCost {
  id: string;
  costCode: string;
  scheduleId?: string;
  schedule?: TrainingSchedule;
  programId: string;
  program?: TrainingProgram;
  budgetId?: string;
  budget?: TrainingBudget;
  costType: string;
  description: string;
  amount: number;
  currency: string;
  vendorName?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  paymentStatus: string;
  paidDate?: string;
  paidBy?: string;
  departmentId?: string;
  departmentName?: string;
  employeeId?: string;
  employeeName?: string;
  remarks?: string;
  createdAt: string;
}

export interface TrainingDashboard {
  overview: {
    totalPrograms: number;
    activePrograms: number;
    upcomingTrainings: number;
    completedTrainings: number;
  };
  enrollments: {
    totalEnrollments: number;
    pendingApproval: number;
    inProgress: number;
    completed: number;
  };
  budget: {
    totalBudget: number;
    usedBudget: number;
    availableBudget: number;
    utilizationPercentage: number;
  };
  eLearning: {
    totalCourses: number;
    activeEnrollments: number;
    completedCourses: number;
    averageCompletion: number;
  };
  recentActivities: TrainingActivity[];
  upcomingSchedules: TrainingSchedule[];
}

export interface TrainingActivity {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  actorName?: string;
}

export interface TrainingSummaryReport {
  period: string;
  totalTrainings: number;
  totalParticipants: number;
  uniqueEmployees: number;
  totalHours: number;
  totalCost: number;
  averageRating: number;
  completionRate: number;
  byCategory: { category: string; count: number; participants: number }[];
  byDepartment: { department: string; employees: number; trainings: number; hours: number }[];
}

export interface EmployeeTrainingReport {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  totalTrainings: number;
  completedTrainings: number;
  inProgressTrainings: number;
  totalHours: number;
  certifications: number;
  averageScore: number;
  trainings: EmployeeTrainingItem[];
}

export interface EmployeeTrainingItem {
  programName: string;
  category: string;
  completionDate?: string;
  status: string;
  score?: number;
  certificateIssued: boolean;
}

// ============================================================================
// Mock Data
// ============================================================================

const mockPrograms: TrainingProgram[] = [
  {
    id: '1',
    programCode: 'TRN-001',
    programName: 'Leadership Excellence Program',
    description: 'Comprehensive leadership training for emerging leaders',
    category: TrainingCategory.LEADERSHIP,
    trainingType: TrainingType.CLASSROOM,
    status: TrainingProgramStatus.ACTIVE,
    objectives: ['Develop strategic thinking', 'Enhance team management skills', 'Build communication effectiveness'],
    targetAudience: 'Senior Associates and Team Leads',
    durationHours: 40,
    durationDays: 5,
    maxParticipants: 20,
    minParticipants: 10,
    instructorName: 'Dr. Sarah Mitchell',
    certificationProvided: true,
    certificationName: 'Certified Leadership Professional',
    certificationValidityMonths: 24,
    cost: 50000,
    isExternal: false,
    isMandatory: false,
  },
  {
    id: '2',
    programCode: 'TRN-002',
    programName: 'Advanced React Development',
    description: 'Deep dive into React ecosystem with hooks, patterns, and best practices',
    category: TrainingCategory.TECHNICAL,
    trainingType: TrainingType.VIRTUAL,
    status: TrainingProgramStatus.ACTIVE,
    objectives: ['Master React hooks', 'Implement state management', 'Build scalable applications'],
    targetAudience: 'Frontend Developers',
    prerequisites: ['Basic React knowledge', 'JavaScript ES6+'],
    durationHours: 24,
    durationDays: 3,
    maxParticipants: 30,
    instructorName: 'John Developer',
    certificationProvided: false,
    isExternal: false,
    isMandatory: false,
  },
  {
    id: '3',
    programCode: 'TRN-003',
    programName: 'Workplace Safety Essentials',
    description: 'Mandatory safety training for all manufacturing floor employees',
    category: TrainingCategory.SAFETY,
    trainingType: TrainingType.CLASSROOM,
    status: TrainingProgramStatus.ACTIVE,
    objectives: ['Understand safety protocols', 'Emergency response procedures', 'Hazard identification'],
    durationHours: 8,
    durationDays: 1,
    maxParticipants: 50,
    certificationProvided: true,
    certificationName: 'Workplace Safety Certificate',
    certificationValidityMonths: 12,
    isExternal: false,
    isMandatory: true,
    applicableDepartments: ['Manufacturing', 'Operations', 'Warehouse'],
  },
];

const mockSchedules: TrainingSchedule[] = [
  {
    id: '1',
    scheduleCode: 'SCH-2024-001',
    programId: '1',
    program: mockPrograms[0],
    batchName: 'Leadership Batch Q1-2024',
    startDate: '2024-12-01',
    endDate: '2024-12-05',
    startTime: '09:00',
    endTime: '17:00',
    location: 'Training Center - Room A',
    instructorName: 'Dr. Sarah Mitchell',
    maxParticipants: 20,
    enrolledCount: 15,
    availableSeats: 5,
    waitlistCount: 2,
    status: 'scheduled',
    registrationDeadline: '2024-11-25',
  },
  {
    id: '2',
    scheduleCode: 'SCH-2024-002',
    programId: '2',
    program: mockPrograms[1],
    batchName: 'React Advanced Nov 2024',
    startDate: '2024-11-18',
    endDate: '2024-11-20',
    startTime: '10:00',
    endTime: '17:00',
    meetingLink: 'https://meet.company.com/react-training',
    instructorName: 'John Developer',
    maxParticipants: 30,
    enrolledCount: 25,
    availableSeats: 5,
    waitlistCount: 0,
    status: 'in_progress',
  },
];

const mockEnrollments: TrainingEnrollment[] = [
  {
    id: '1',
    enrollmentCode: 'ENR-2024-001',
    scheduleId: '1',
    schedule: mockSchedules[0],
    programId: '1',
    program: mockPrograms[0],
    employeeId: 'E001',
    employeeName: 'John Doe',
    employeeCode: 'EMP001',
    department: 'Sales',
    designation: 'Senior Sales Executive',
    status: EnrollmentStatus.ENROLLED,
    enrollmentDate: '2024-11-01',
    approvedBy: 'M001',
    approvedDate: '2024-11-02',
    certificateIssued: false,
  },
  {
    id: '2',
    enrollmentCode: 'ENR-2024-002',
    scheduleId: '2',
    schedule: mockSchedules[1],
    programId: '2',
    program: mockPrograms[1],
    employeeId: 'E002',
    employeeName: 'Jane Smith',
    employeeCode: 'EMP002',
    department: 'Engineering',
    designation: 'Software Developer',
    status: EnrollmentStatus.COMPLETED,
    enrollmentDate: '2024-11-10',
    completionDate: '2024-11-20',
    completionStatus: 'passed',
    score: 85,
    grade: 'A',
    certificateIssued: false,
    attendancePercentage: 100,
  },
];

const mockCourses: ELearningCourse[] = [
  {
    id: '1',
    courseCode: 'EL-001',
    courseName: 'Introduction to Cloud Computing',
    description: 'Learn the fundamentals of cloud computing and AWS basics',
    category: TrainingCategory.TECHNICAL,
    instructorName: 'Cloud Expert',
    durationHours: 10,
    modules: [
      {
        id: 'm1', moduleNumber: 1, title: 'Cloud Fundamentals', durationMinutes: 120, lessons: [
          { id: 'l1', lessonNumber: 1, title: 'What is Cloud?', type: 'video', durationMinutes: 30, isPreview: true },
          { id: 'l2', lessonNumber: 2, title: 'Cloud Service Models', type: 'video', durationMinutes: 45, isPreview: false },
        ], isLocked: false
      },
    ],
    totalModules: 5,
    totalLessons: 20,
    level: 'beginner',
    enrollmentCount: 150,
    averageRating: 4.5,
    ratingCount: 85,
    certificationProvided: true,
    certificationName: 'Cloud Computing Fundamentals',
    isPublished: true,
    isFree: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-10-01',
  },
  {
    id: '2',
    courseCode: 'EL-002',
    courseName: 'Effective Communication Skills',
    description: 'Master professional communication in the workplace',
    category: TrainingCategory.SOFT_SKILLS,
    instructorName: 'Communication Coach',
    durationHours: 6,
    modules: [],
    totalModules: 4,
    totalLessons: 16,
    level: 'intermediate',
    enrollmentCount: 200,
    averageRating: 4.7,
    ratingCount: 120,
    certificationProvided: false,
    isPublished: true,
    isFree: true,
    createdAt: '2024-02-20',
    updatedAt: '2024-09-15',
  },
];

const mockCertifications: CertificationTracking[] = [
  {
    id: '1',
    certificationCode: 'CERT-001',
    employeeId: 'E001',
    employeeName: 'John Doe',
    employeeCode: 'EMP001',
    department: 'Sales',
    certificationName: 'AWS Certified Solutions Architect',
    issuingAuthority: 'Amazon Web Services',
    certificationNumber: 'AWS-SAA-12345',
    issueDate: '2024-03-15',
    expiryDate: '2027-03-15',
    status: CertificationStatus.ACTIVE,
    renewalReminderDays: 90,
    cost: 15000,
    paidBy: 'company',
  },
  {
    id: '2',
    certificationCode: 'CERT-002',
    employeeId: 'E002',
    employeeName: 'Jane Smith',
    employeeCode: 'EMP002',
    department: 'Engineering',
    certificationName: 'PMP - Project Management Professional',
    issuingAuthority: 'PMI',
    certificationNumber: 'PMP-67890',
    issueDate: '2023-06-01',
    expiryDate: '2024-12-01',
    status: CertificationStatus.PENDING_RENEWAL,
    renewalReminderDays: 60,
    cost: 45000,
    paidBy: 'company',
  },
];

const mockBudgets: TrainingBudget[] = [
  {
    id: '1',
    budgetCode: 'BUD-2024',
    budgetName: 'FY 2024-25 Training Budget',
    fiscalYear: '2024-25',
    budgetType: 'annual',
    totalBudget: 5000000,
    allocatedBudget: 4500000,
    usedBudget: 2800000,
    availableBudget: 1700000,
    status: BudgetStatus.ACTIVE,
    approvedBy: 'CFO',
    approvedDate: '2024-04-01',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    categories: [
      { category: 'Technical', allocated: 2000000, used: 1200000, available: 800000 },
      { category: 'Leadership', allocated: 1500000, used: 900000, available: 600000 },
      { category: 'Compliance', allocated: 500000, used: 400000, available: 100000 },
      { category: 'Soft Skills', allocated: 500000, used: 300000, available: 200000 },
    ],
  },
];

// ============================================================================
// Service Class
// ============================================================================

export class TrainingDevelopmentService {
  // ========== Training Programs ==========

  static async getTrainingPrograms(options?: {
    category?: TrainingCategory;
    trainingType?: TrainingType;
    status?: TrainingProgramStatus;
    isMandatory?: boolean;
    search?: string;
  }): Promise<{ data: TrainingProgram[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockPrograms];
      if (options?.category) filtered = filtered.filter(p => p.category === options.category);
      if (options?.trainingType) filtered = filtered.filter(p => p.trainingType === options.trainingType);
      if (options?.status) filtered = filtered.filter(p => p.status === options.status);
      if (options?.isMandatory !== undefined) filtered = filtered.filter(p => p.isMandatory === options.isMandatory);
      if (options?.search) {
        const searchLower = options.search.toLowerCase();
        filtered = filtered.filter(p =>
          p.programName.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
        );
      }
      return { data: filtered, total: filtered.length };
    }
    // NestJS: GET /hr/training-programs?companyId&category&status -> bare TrainingProgram[].
    const params = new URLSearchParams();
    params.append('companyId', COMPANY_ID);
    if (options?.category) params.append('category', options.category);
    if (options?.status) params.append('status', options.status);
    const response = await trainFetch(`/hr/training-programs?${params.toString()}`);
    const rows = await response.json();
    const arr: TrainingProgram[] = Array.isArray(rows) ? rows : (rows?.data ?? []);
    return { data: arr, total: arr.length };
  }

  static async getTrainingProgramById(id: string): Promise<TrainingProgram> {
    if (USE_MOCK_DATA) {
      const program = mockPrograms.find(p => p.id === id);
      if (!program) throw new Error('Training program not found');
      return program;
    }
    // NestJS: GET /hr/training-programs/:id
    const response = await trainFetch(`/hr/training-programs/${id}`);
    return response.json();
  }

  static async createTrainingProgram(data: Partial<TrainingProgram>): Promise<TrainingProgram> {
    if (USE_MOCK_DATA) {
      const newProgram: TrainingProgram = {
        id: String(mockPrograms.length + 1),
        programCode: `TRN-${String(mockPrograms.length + 1).padStart(3, '0')}`,
        programName: data.programName || 'New Program',
        category: data.category || TrainingCategory.TECHNICAL,
        trainingType: data.trainingType || TrainingType.CLASSROOM,
        status: TrainingProgramStatus.DRAFT,
        durationHours: data.durationHours || 8,
        certificationProvided: data.certificationProvided ?? false,
        isExternal: data.isExternal ?? false,
        isMandatory: data.isMandatory ?? false,
        createdAt: new Date().toISOString(),
        ...data,
      } as TrainingProgram;
      mockPrograms.push(newProgram);
      return newProgram;
    }
    // NestJS: POST /hr/training-programs (companyId in body).
    const response = await trainFetch('/hr/training-programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId: COMPANY_ID, ...data }),
    });
    return response.json();
  }

  static async updateTrainingProgram(id: string, data: Partial<TrainingProgram>): Promise<TrainingProgram> {
    if (USE_MOCK_DATA) {
      const index = mockPrograms.findIndex(p => p.id === id);
      if (index !== -1) {
        mockPrograms[index] = { ...mockPrograms[index], ...data, updatedAt: new Date().toISOString() };
        return mockPrograms[index];
      }
      throw new Error('Training program not found');
    }
    // NestJS: PUT /hr/training-programs/:id
    const response = await trainFetch(`/hr/training-programs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // ========== Training Schedules ==========

  static async getTrainingSchedules(options?: {
    programId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<{ data: TrainingSchedule[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockSchedules];
      if (options?.programId) filtered = filtered.filter(s => s.programId === options.programId);
      if (options?.status) filtered = filtered.filter(s => s.status === options.status);
      return { data: filtered, total: filtered.length };
    }
    // TODO(needs-backend): no NestJS route for training schedules (hr/training-schedules).
    const params = new URLSearchParams();
    if (options?.programId) params.append('programId', options.programId);
    if (options?.status) params.append('status', options.status);
    if (options?.fromDate) params.append('fromDate', options.fromDate);
    if (options?.toDate) params.append('toDate', options.toDate);
    const response = await fetch(`/api/hr/training/schedules?${params.toString()}`, { credentials: 'include' });
    return response.json();
  }

  static async createTrainingSchedule(data: Partial<TrainingSchedule>): Promise<TrainingSchedule> {
    if (USE_MOCK_DATA) {
      const program = mockPrograms.find(p => p.id === data.programId);
      const newSchedule: TrainingSchedule = {
        id: String(mockSchedules.length + 1),
        scheduleCode: `SCH-${new Date().getFullYear()}-${String(mockSchedules.length + 1).padStart(3, '0')}`,
        programId: data.programId || '1',
        program,
        batchName: data.batchName || 'New Batch',
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        endDate: data.endDate || new Date().toISOString().split('T')[0],
        maxParticipants: data.maxParticipants || program?.maxParticipants || 20,
        enrolledCount: 0,
        availableSeats: data.maxParticipants || program?.maxParticipants || 20,
        waitlistCount: 0,
        status: 'scheduled',
        ...data,
      } as TrainingSchedule;
      mockSchedules.push(newSchedule);
      return newSchedule;
    }
    // TODO(needs-backend): no NestJS route for training schedules (hr/training-schedules).
    const response = await fetch('/api/hr/training/schedules', {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // ========== Enrollments ==========

  static async getEnrollments(options?: {
    scheduleId?: string;
    programId?: string;
    employeeId?: string;
    status?: EnrollmentStatus;
    department?: string;
  }): Promise<{ data: TrainingEnrollment[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockEnrollments];
      if (options?.scheduleId) filtered = filtered.filter(e => e.scheduleId === options.scheduleId);
      if (options?.programId) filtered = filtered.filter(e => e.programId === options.programId);
      if (options?.employeeId) filtered = filtered.filter(e => e.employeeId === options.employeeId);
      if (options?.status) filtered = filtered.filter(e => e.status === options.status);
      return { data: filtered, total: filtered.length };
    }
    // NestJS: GET /hr/training-enrollments?companyId&status -> bare TrainingEnrollment[].
    const params = new URLSearchParams();
    params.append('companyId', COMPANY_ID);
    if (options?.status) params.append('status', options.status);
    const response = await trainFetch(`/hr/training-enrollments?${params.toString()}`);
    const rows = await response.json();
    const arr: TrainingEnrollment[] = Array.isArray(rows) ? rows : (rows?.data ?? []);
    return { data: arr, total: arr.length };
  }

  static async enrollInTraining(data: {
    scheduleId: string;
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    department?: string;
    designation?: string;
  }): Promise<TrainingEnrollment> {
    if (USE_MOCK_DATA) {
      const schedule = mockSchedules.find(s => s.id === data.scheduleId);
      const program = schedule?.program;
      const newEnrollment: TrainingEnrollment = {
        id: String(mockEnrollments.length + 1),
        enrollmentCode: `ENR-${new Date().getFullYear()}-${String(mockEnrollments.length + 1).padStart(3, '0')}`,
        scheduleId: data.scheduleId,
        schedule,
        programId: schedule?.programId || '1',
        program,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        employeeCode: data.employeeCode,
        department: data.department,
        designation: data.designation,
        status: EnrollmentStatus.PENDING,
        enrollmentDate: new Date().toISOString().split('T')[0],
        certificateIssued: false,
      };
      mockEnrollments.push(newEnrollment);
      return newEnrollment;
    }
    // NestJS: POST /hr/training-enrollments (companyId in body).
    const response = await trainFetch('/hr/training-enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId: COMPANY_ID, ...data }),
    });
    return response.json();
  }

  static async approveEnrollment(id: string, approvedBy: string): Promise<TrainingEnrollment> {
    if (USE_MOCK_DATA) {
      const enrollment = mockEnrollments.find(e => e.id === id);
      if (enrollment) {
        enrollment.status = EnrollmentStatus.APPROVED;
        enrollment.approvedBy = approvedBy;
        enrollment.approvedDate = new Date().toISOString().split('T')[0];
      }
      return enrollment!;
    }
    // NestJS training-enrollments has no /approve action route; model it as a PUT status update.
    const response = await trainFetch(`/hr/training-enrollments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: EnrollmentStatus.APPROVED,
        approvedBy,
        approvedDate: new Date().toISOString(),
      }),
    });
    return response.json();
  }

  static async rejectEnrollment(id: string, rejectedBy: string, reason: string): Promise<TrainingEnrollment> {
    if (USE_MOCK_DATA) {
      const enrollment = mockEnrollments.find(e => e.id === id);
      if (enrollment) {
        enrollment.status = EnrollmentStatus.REJECTED;
        enrollment.rejectionReason = reason;
      }
      return enrollment!;
    }
    // NestJS training-enrollments has no /reject action route; model it as a PUT status update.
    const response = await trainFetch(`/hr/training-enrollments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: EnrollmentStatus.REJECTED,
        rejectionReason: reason,
      }),
    });
    return response.json();
  }

  static async completeEnrollment(id: string, data: {
    completionStatus: string;
    score?: number;
    grade?: string;
    feedback?: string;
  }): Promise<TrainingEnrollment> {
    if (USE_MOCK_DATA) {
      const enrollment = mockEnrollments.find(e => e.id === id);
      if (enrollment) {
        enrollment.status = EnrollmentStatus.COMPLETED;
        enrollment.completionDate = new Date().toISOString().split('T')[0];
        enrollment.completionStatus = data.completionStatus;
        enrollment.score = data.score;
        enrollment.grade = data.grade;
        enrollment.feedback = data.feedback;
      }
      return enrollment!;
    }
    // NestJS training-enrollments has no /complete action route; model it as a PUT status update.
    const response = await trainFetch(`/hr/training-enrollments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: EnrollmentStatus.COMPLETED,
        completionDate: new Date().toISOString(),
        ...data,
      }),
    });
    return response.json();
  }

  static async issueCertificate(enrollmentId: string): Promise<TrainingEnrollment> {
    if (USE_MOCK_DATA) {
      const enrollment = mockEnrollments.find(e => e.id === enrollmentId);
      if (enrollment) {
        enrollment.certificateIssued = true;
        enrollment.certificateNumber = `CERT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`;
        enrollment.certificateIssuedDate = new Date().toISOString().split('T')[0];
      }
      return enrollment!;
    }
    // NestJS training-enrollments has no /issue-certificate action route; model it as a PUT update.
    const response = await trainFetch(`/hr/training-enrollments/${enrollmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        certificateIssued: true,
        certificateIssuedDate: new Date().toISOString(),
      }),
    });
    return response.json();
  }

  // ========== Training Attendance ==========

  static async getTrainingAttendance(options?: {
    enrollmentId?: string;
    scheduleId?: string;
    sessionId?: string;
    date?: string;
  }): Promise<TrainingAttendance[]> {
    if (USE_MOCK_DATA) {
      return [];
    }
    // TODO(needs-backend): no NestJS route for training attendance (hr/training-attendance).
    const params = new URLSearchParams();
    if (options?.enrollmentId) params.append('enrollmentId', options.enrollmentId);
    if (options?.scheduleId) params.append('scheduleId', options.scheduleId);
    if (options?.sessionId) params.append('sessionId', options.sessionId);
    const response = await fetch(`/api/hr/training/attendance?${params.toString()}`, { credentials: 'include' });
    return response.json();
  }

  static async markAttendance(data: Partial<TrainingAttendance>): Promise<TrainingAttendance> {
    if (USE_MOCK_DATA) {
      return {
        id: '1',
        enrollmentId: data.enrollmentId || '1',
        sessionId: data.sessionId || '1',
        employeeId: data.employeeId || 'E001',
        employeeName: data.employeeName || 'Employee',
        date: data.date || new Date().toISOString().split('T')[0],
        status: data.status || AttendanceStatus.PRESENT,
        ...data,
      } as TrainingAttendance;
    }
    // TODO(needs-backend): no NestJS route for training attendance (hr/training-attendance).
    const response = await fetch('/api/hr/training/attendance', {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // ========== Waitlist ==========

  static async getWaitlist(scheduleId: string): Promise<TrainingWaitlist[]> {
    if (USE_MOCK_DATA) {
      return [];
    }
    // TODO(needs-backend): no NestJS route for training waitlist (hr/training-waitlist).
    const response = await fetch(`/api/hr/training/schedules/${scheduleId}/waitlist`, { credentials: 'include' });
    return response.json();
  }

  static async addToWaitlist(data: {
    scheduleId: string;
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    department?: string;
  }): Promise<TrainingWaitlist> {
    if (USE_MOCK_DATA) {
      return {
        id: '1',
        scheduleId: data.scheduleId,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        employeeCode: data.employeeCode,
        department: data.department,
        position: 1,
        addedDate: new Date().toISOString(),
        notificationSent: false,
        status: 'waiting',
      };
    }
    // TODO(needs-backend): no NestJS route for training waitlist (hr/training-waitlist).
    const response = await fetch('/api/hr/training/waitlist', {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // ========== Skill Development ==========

  static async getSkillMatrix(options?: {
    employeeId?: string;
    departmentId?: string;
  }): Promise<SkillMatrix[]> {
    if (USE_MOCK_DATA) {
      return [
        {
          employeeId: 'E001',
          employeeName: 'John Doe',
          department: 'Sales',
          designation: 'Senior Sales Executive',
          skills: [
            { skillId: 's1', skillName: 'Negotiation', category: 'Sales', currentLevel: 4, requiredLevel: 4, gap: 0 },
            { skillId: 's2', skillName: 'Product Knowledge', category: 'Sales', currentLevel: 4, requiredLevel: 5, gap: 1 },
            { skillId: 's3', skillName: 'CRM Tools', category: 'Technical', currentLevel: 3, requiredLevel: 4, gap: 1 },
          ],
          overallProficiency: 78,
          lastAssessmentDate: '2024-10-15',
        },
      ];
    }
    // NestJS: GET /hr/user-skills/matrix?departmentId -> bare any[] (skill matrix rows).
    const params = new URLSearchParams();
    if (options?.departmentId) params.append('departmentId', options.departmentId);
    const response = await trainFetch(`/hr/user-skills/matrix?${params.toString()}`);
    const rows = await response.json();
    return (Array.isArray(rows) ? rows : (rows?.data ?? [])) as SkillMatrix[];
  }

  static async getSkillGapAnalysis(employeeId: string): Promise<SkillGapAnalysis> {
    if (USE_MOCK_DATA) {
      return {
        employeeId,
        employeeName: 'John Doe',
        department: 'Sales',
        designation: 'Senior Sales Executive',
        gaps: [
          { skillId: 's2', skillName: 'Product Knowledge', category: 'Sales', currentLevel: 4, requiredLevel: 5, gapScore: 1, priority: 'medium' },
          { skillId: 's3', skillName: 'CRM Tools', category: 'Technical', currentLevel: 3, requiredLevel: 4, gapScore: 1, priority: 'high' },
        ],
        totalGapScore: 2,
        recommendedTrainings: [
          { programId: '1', programName: 'Advanced CRM Training', relevantSkills: ['CRM Tools'], matchScore: 95 },
          { programId: '2', programName: 'Product Mastery', relevantSkills: ['Product Knowledge'], matchScore: 88 },
        ],
      };
    }
    // TODO(needs-backend): no NestJS route returns the per-employee SkillGapAnalysis aggregate
    // (hr/skill-gaps lists gap rows but not this recommended-training aggregate shape).
    const response = await fetch(`/api/hr/training/skill-gap-analysis/${employeeId}`, { credentials: 'include' });
    return response.json();
  }

  static async createSkillAssessment(data: Partial<SkillAssessment>): Promise<SkillAssessment> {
    if (USE_MOCK_DATA) {
      return {
        id: '1',
        assessmentCode: 'SA-001',
        employeeId: data.employeeId || 'E001',
        employeeName: data.employeeName || 'Employee',
        assessmentType: data.assessmentType || 'self',
        assessmentDate: new Date().toISOString().split('T')[0],
        skills: data.skills || [],
        overallScore: 0,
        status: 'pending',
        ...data,
      } as SkillAssessment;
    }
    // NestJS: POST /hr/skill-assessments (companyId in body).
    const response = await trainFetch('/hr/skill-assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId: COMPANY_ID, ...data }),
    });
    return response.json();
  }

  // ========== Certification Tracking ==========

  static async getCertifications(options?: {
    employeeId?: string;
    status?: CertificationStatus;
    expiringWithinDays?: number;
  }): Promise<{ data: CertificationTracking[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockCertifications];
      if (options?.employeeId) filtered = filtered.filter(c => c.employeeId === options.employeeId);
      if (options?.status) filtered = filtered.filter(c => c.status === options.status);
      return { data: filtered, total: filtered.length };
    }
    // TODO(needs-backend): no NestJS route for certification tracking (hr/training-certifications).
    const params = new URLSearchParams();
    if (options?.employeeId) params.append('employeeId', options.employeeId);
    if (options?.status) params.append('status', options.status);
    if (options?.expiringWithinDays) params.append('expiringWithinDays', String(options.expiringWithinDays));
    const response = await fetch(`/api/hr/training/certifications?${params.toString()}`, { credentials: 'include' });
    return response.json();
  }

  static async createCertification(data: Partial<CertificationTracking>): Promise<CertificationTracking> {
    if (USE_MOCK_DATA) {
      const newCert: CertificationTracking = {
        id: String(mockCertifications.length + 1),
        certificationCode: `CERT-${String(mockCertifications.length + 1).padStart(3, '0')}`,
        employeeId: data.employeeId || 'E001',
        employeeName: data.employeeName || 'Employee',
        employeeCode: data.employeeCode || 'EMP001',
        certificationName: data.certificationName || 'Certification',
        issuingAuthority: data.issuingAuthority || 'Authority',
        issueDate: data.issueDate || new Date().toISOString().split('T')[0],
        status: CertificationStatus.ACTIVE,
        ...data,
      } as CertificationTracking;
      mockCertifications.push(newCert);
      return newCert;
    }
    // TODO(needs-backend): no NestJS route for certification tracking (hr/training-certifications).
    const response = await fetch('/api/hr/training/certifications', {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async renewCertification(id: string, data: {
    newExpiryDate: string;
    cost?: number;
    remarks?: string;
  }): Promise<CertificationTracking> {
    if (USE_MOCK_DATA) {
      const cert = mockCertifications.find(c => c.id === id);
      if (cert) {
        cert.expiryDate = data.newExpiryDate;
        cert.status = CertificationStatus.ACTIVE;
        if (!cert.renewalHistory) cert.renewalHistory = [];
        cert.renewalHistory.push({
          id: String(cert.renewalHistory.length + 1),
          renewalDate: new Date().toISOString().split('T')[0],
          newExpiryDate: data.newExpiryDate,
          cost: data.cost,
          remarks: data.remarks,
        });
      }
      return cert!;
    }
    // TODO(needs-backend): no NestJS route for certification tracking (hr/training-certifications/:id/renew).
    const response = await fetch(`/api/hr/training/certifications/${id}/renew`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // ========== Training Feedback ==========

  static async getTrainingFeedback(options?: {
    scheduleId?: string;
    programId?: string;
    employeeId?: string;
  }): Promise<TrainingFeedback[]> {
    if (USE_MOCK_DATA) {
      return [];
    }
    // TODO(needs-backend): no NestJS route for training feedback (hr/training-feedback).
    const params = new URLSearchParams();
    if (options?.scheduleId) params.append('scheduleId', options.scheduleId);
    if (options?.programId) params.append('programId', options.programId);
    if (options?.employeeId) params.append('employeeId', options.employeeId);
    const response = await fetch(`/api/hr/training/feedback?${params.toString()}`, { credentials: 'include' });
    return response.json();
  }

  static async submitTrainingFeedback(data: Partial<TrainingFeedback>): Promise<TrainingFeedback> {
    if (USE_MOCK_DATA) {
      return {
        id: '1',
        enrollmentId: data.enrollmentId || '1',
        scheduleId: data.scheduleId || '1',
        programId: data.programId || '1',
        employeeId: data.employeeId || 'E001',
        isAnonymous: data.isAnonymous ?? false,
        overallRating: data.overallRating || 4,
        contentRating: data.contentRating || 4,
        instructorRating: data.instructorRating || 4,
        relevanceRating: data.relevanceRating || 4,
        paceRating: data.paceRating || 4,
        wouldRecommend: data.wouldRecommend ?? true,
        submittedAt: new Date().toISOString(),
        ...data,
      } as TrainingFeedback;
    }
    // TODO(needs-backend): no NestJS route for training feedback (hr/training-feedback).
    const response = await fetch('/api/hr/training/feedback', {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // ========== Training Assessments ==========

  static async getTrainingAssessments(options?: {
    programId?: string;
    scheduleId?: string;
    assessmentType?: AssessmentType;
  }): Promise<TrainingAssessment[]> {
    if (USE_MOCK_DATA) {
      return [];
    }
    // TODO(needs-backend): no NestJS route for training assessments (hr/training-assessments).
    const params = new URLSearchParams();
    if (options?.programId) params.append('programId', options.programId);
    if (options?.scheduleId) params.append('scheduleId', options.scheduleId);
    if (options?.assessmentType) params.append('assessmentType', options.assessmentType);
    const response = await fetch(`/api/hr/training/assessments?${params.toString()}`, { credentials: 'include' });
    return response.json();
  }

  static async createTrainingAssessment(data: Partial<TrainingAssessment>): Promise<TrainingAssessment> {
    if (USE_MOCK_DATA) {
      return {
        id: Math.random().toString(36).slice(2),
        ...data,
      } as TrainingAssessment;
    }
    // TODO(needs-backend): no NestJS route for training assessments (hr/training-assessments).
    const response = await fetch('/api/hr/training/assessments', {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async startAssessmentAttempt(assessmentId: string, enrollmentId: string, employeeId: string): Promise<TrainingAssessmentAttempt> {
    if (USE_MOCK_DATA) {
      return {
        id: '1',
        assessmentId,
        enrollmentId,
        employeeId,
        employeeName: 'Employee',
        attemptNumber: 1,
        startTime: new Date().toISOString(),
        status: 'in_progress',
        totalMarks: 100,
        obtainedMarks: 0,
        percentage: 0,
        isPassed: false,
      };
    }
    // TODO(needs-backend): no NestJS route for training assessment attempts (hr/training-assessments/:id/attempt).
    const response = await fetch(`/api/hr/training/assessments/${assessmentId}/attempt`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollmentId, employeeId }),
    });
    return response.json();
  }

  static async submitAssessmentAttempt(attemptId: string, answers: AssessmentAnswer[]): Promise<TrainingAssessmentAttempt> {
    if (USE_MOCK_DATA) {
      return {
        id: attemptId,
        assessmentId: '1',
        enrollmentId: '1',
        employeeId: 'E001',
        employeeName: 'Employee',
        attemptNumber: 1,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        status: 'completed',
        answers,
        totalMarks: 100,
        obtainedMarks: 85,
        percentage: 85,
        isPassed: true,
      };
    }
    // TODO(needs-backend): no NestJS route for training assessment attempts (hr/training-assessment-attempts/:id/submit).
    const response = await fetch(`/api/hr/training/assessment-attempts/${attemptId}/submit`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    return response.json();
  }

  // ========== E-Learning ==========

  static async getELearningCourses(options?: {
    category?: TrainingCategory;
    level?: string;
    isPublished?: boolean;
    search?: string;
  }): Promise<{ data: ELearningCourse[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockCourses];
      if (options?.category) filtered = filtered.filter(c => c.category === options.category);
      if (options?.level) filtered = filtered.filter(c => c.level === options.level);
      if (options?.isPublished !== undefined) filtered = filtered.filter(c => c.isPublished === options.isPublished);
      if (options?.search) {
        const searchLower = options.search.toLowerCase();
        filtered = filtered.filter(c =>
          c.courseName.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower)
        );
      }
      return { data: filtered, total: filtered.length };
    }
    // NestJS: GET /hr/elearning-courses?companyId&status -> bare ElearningCourse[].
    // (Controller supports companyId + status only; category/level/search are filtered client-side.)
    const params = new URLSearchParams();
    params.append('companyId', COMPANY_ID);
    const response = await trainFetch(`/hr/elearning-courses?${params.toString()}`);
    const rows = await response.json();
    let arr: ELearningCourse[] = Array.isArray(rows) ? rows : (rows?.data ?? []);
    if (options?.category) arr = arr.filter(c => c.category === options.category);
    if (options?.level) arr = arr.filter(c => c.level === options.level);
    if (options?.search) {
      const s = options.search.toLowerCase();
      arr = arr.filter(c =>
        c.courseName?.toLowerCase().includes(s) ||
        c.description?.toLowerCase().includes(s),
      );
    }
    return { data: arr, total: arr.length };
  }

  static async getELearningCourseById(id: string): Promise<ELearningCourse> {
    if (USE_MOCK_DATA) {
      const course = mockCourses.find(c => c.id === id);
      if (!course) throw new Error('Course not found');
      return course;
    }
    // NestJS: GET /hr/elearning-courses/:id
    const response = await trainFetch(`/hr/elearning-courses/${id}`);
    return response.json();
  }

  static async enrollInCourse(courseId: string, employeeId: string): Promise<CourseProgress> {
    if (USE_MOCK_DATA) {
      const course = mockCourses.find(c => c.id === courseId);
      return {
        id: '1',
        courseId,
        course,
        employeeId,
        employeeName: 'Employee',
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: CourseProgressStatus.NOT_STARTED,
        progressPercentage: 0,
        completedModules: 0,
        completedLessons: 0,
        totalModules: course?.totalModules || 5,
        totalLessons: course?.totalLessons || 20,
        timeSpentMinutes: 0,
        lessonProgress: [],
        assessmentsPassed: 0,
        totalAssessments: 2,
        certificateIssued: false,
      };
    }
    // TODO(needs-backend): no NestJS route for e-learning course enrollment/progress
    // (hr/elearning-courses exists for the catalogue, but not course-progress).
    const response = await fetch(`/api/hr/training/e-learning/courses/${courseId}/enroll`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId }),
    });
    return response.json();
  }

  static async getCourseProgress(options?: {
    courseId?: string;
    employeeId?: string;
    status?: CourseProgressStatus;
  }): Promise<{ data: CourseProgress[]; total: number }> {
    if (USE_MOCK_DATA) {
      return { data: [], total: 0 };
    }
    // TODO(needs-backend): no NestJS route for e-learning course progress (hr/elearning-course-progress).
    const params = new URLSearchParams();
    if (options?.courseId) params.append('courseId', options.courseId);
    if (options?.employeeId) params.append('employeeId', options.employeeId);
    if (options?.status) params.append('status', options.status);
    const response = await fetch(`/api/hr/training/e-learning/progress?${params.toString()}`, { credentials: 'include' });
    return response.json();
  }

  static async updateLessonProgress(progressId: string, lessonId: string, data: {
    isCompleted: boolean;
    progressPercentage: number;
    timeSpentMinutes: number;
  }): Promise<CourseProgress> {
    if (USE_MOCK_DATA) {
      return {
        id: progressId,
        courseId: '1',
        employeeId: 'E001',
        employeeName: 'Employee',
        enrollmentDate: '2024-11-01',
        status: CourseProgressStatus.IN_PROGRESS,
        progressPercentage: data.progressPercentage,
        completedModules: 1,
        completedLessons: 5,
        totalModules: 5,
        totalLessons: 20,
        timeSpentMinutes: data.timeSpentMinutes,
        lessonProgress: [],
        assessmentsPassed: 0,
        totalAssessments: 2,
        certificateIssued: false,
      };
    }
    // TODO(needs-backend): no NestJS route for e-learning lesson progress (hr/elearning-course-progress/:id/lesson/:lessonId).
    const response = await fetch(`/api/hr/training/e-learning/progress/${progressId}/lesson/${lessonId}`, {
      credentials: 'include',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // ========== Training Budget ==========

  static async getTrainingBudgets(options?: {
    fiscalYear?: string;
    departmentId?: string;
    status?: BudgetStatus;
  }): Promise<TrainingBudget[]> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockBudgets];
      if (options?.fiscalYear) filtered = filtered.filter(b => b.fiscalYear === options.fiscalYear);
      if (options?.departmentId) filtered = filtered.filter(b => b.departmentId === options.departmentId);
      if (options?.status) filtered = filtered.filter(b => b.status === options.status);
      return filtered;
    }
    // TODO(needs-backend): no NestJS route for training budgets (hr/training-budgets).
    const params = new URLSearchParams();
    if (options?.fiscalYear) params.append('fiscalYear', options.fiscalYear);
    if (options?.departmentId) params.append('departmentId', options.departmentId);
    if (options?.status) params.append('status', options.status);
    const response = await fetch(`/api/hr/training/budgets?${params.toString()}`, { credentials: 'include' });
    return response.json();
  }

  static async createTrainingBudget(data: Partial<TrainingBudget>): Promise<TrainingBudget> {
    if (USE_MOCK_DATA) {
      const newBudget: TrainingBudget = {
        id: String(mockBudgets.length + 1),
        budgetCode: `BUD-${new Date().getFullYear()}-${String(mockBudgets.length + 1).padStart(2, '0')}`,
        budgetName: data.budgetName || 'New Budget',
        fiscalYear: data.fiscalYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        budgetType: data.budgetType || 'annual',
        totalBudget: data.totalBudget || 0,
        allocatedBudget: data.allocatedBudget || 0,
        usedBudget: 0,
        availableBudget: data.allocatedBudget || 0,
        status: BudgetStatus.DRAFT,
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        endDate: data.endDate || new Date().toISOString().split('T')[0],
        ...data,
      } as TrainingBudget;
      mockBudgets.push(newBudget);
      return newBudget;
    }
    // TODO(needs-backend): no NestJS route for training budgets (hr/training-budgets).
    const response = await fetch('/api/hr/training/budgets', {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async recordTrainingCost(data: Partial<TrainingCost>): Promise<TrainingCost> {
    if (USE_MOCK_DATA) {
      return {
        id: '1',
        costCode: `COST-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
        programId: data.programId || '1',
        costType: data.costType || 'training_fee',
        description: data.description || 'Training cost',
        amount: data.amount || 0,
        currency: data.currency || 'INR',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        ...data,
      } as TrainingCost;
    }
    // TODO(needs-backend): no NestJS route for training costs (hr/training-costs).
    const response = await fetch('/api/hr/training/costs', {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // ========== Dashboard & Reports ==========

  static async getDashboard(): Promise<TrainingDashboard> {
    if (USE_MOCK_DATA) {
      return {
        overview: {
          totalPrograms: mockPrograms.length,
          activePrograms: mockPrograms.filter(p => p.status === TrainingProgramStatus.ACTIVE).length,
          upcomingTrainings: mockSchedules.filter(s => s.status === 'scheduled').length,
          completedTrainings: 25,
        },
        enrollments: {
          totalEnrollments: mockEnrollments.length,
          pendingApproval: mockEnrollments.filter(e => e.status === EnrollmentStatus.PENDING).length,
          inProgress: mockEnrollments.filter(e => e.status === EnrollmentStatus.IN_PROGRESS).length,
          completed: mockEnrollments.filter(e => e.status === EnrollmentStatus.COMPLETED).length,
        },
        budget: {
          totalBudget: mockBudgets[0]?.totalBudget || 0,
          usedBudget: mockBudgets[0]?.usedBudget || 0,
          availableBudget: mockBudgets[0]?.availableBudget || 0,
          utilizationPercentage: mockBudgets[0] ? (mockBudgets[0].usedBudget / mockBudgets[0].totalBudget) * 100 : 0,
        },
        eLearning: {
          totalCourses: mockCourses.length,
          activeEnrollments: 150,
          completedCourses: 85,
          averageCompletion: 72,
        },
        recentActivities: [
          { id: '1', type: 'enrollment', title: 'New enrollment', description: 'John Doe enrolled in Leadership Excellence Program', timestamp: '2024-11-10T10:00:00Z' },
          { id: '2', type: 'completion', title: 'Training completed', description: 'Jane Smith completed Advanced React Development', timestamp: '2024-11-20T16:00:00Z' },
          { id: '3', type: 'certificate', title: 'Certificate issued', description: 'Certificate issued for AWS Certified Solutions Architect', timestamp: '2024-11-08T14:00:00Z' },
        ],
        upcomingSchedules: mockSchedules.filter(s => s.status === 'scheduled').slice(0, 5),
      };
    }
    // TODO(needs-backend): no NestJS route for the training dashboard aggregate (hr/training-dashboard).
    const response = await fetch('/api/hr/training/dashboard', { credentials: 'include' });
    return response.json();
  }

  static async getTrainingSummaryReport(options?: {
    fromDate?: string;
    toDate?: string;
    departmentId?: string;
  }): Promise<TrainingSummaryReport> {
    if (USE_MOCK_DATA) {
      return {
        period: 'Q4 2024',
        totalTrainings: 15,
        totalParticipants: 180,
        uniqueEmployees: 120,
        totalHours: 640,
        totalCost: 850000,
        averageRating: 4.3,
        completionRate: 92,
        byCategory: [
          { category: 'Technical', count: 6, participants: 75 },
          { category: 'Leadership', count: 3, participants: 35 },
          { category: 'Soft Skills', count: 4, participants: 50 },
          { category: 'Compliance', count: 2, participants: 20 },
        ],
        byDepartment: [
          { department: 'Engineering', employees: 45, trainings: 8, hours: 280 },
          { department: 'Sales', employees: 30, trainings: 5, hours: 160 },
          { department: 'Operations', employees: 25, trainings: 4, hours: 120 },
          { department: 'HR', employees: 20, trainings: 3, hours: 80 },
        ],
      };
    }
    const params = new URLSearchParams();
    if (options?.fromDate) params.append('fromDate', options.fromDate);
    if (options?.toDate) params.append('toDate', options.toDate);
    if (options?.departmentId) params.append('departmentId', options.departmentId);
    // TODO(needs-backend): no NestJS route for training reports (hr/training-reports/summary).
    const response = await fetch(`/api/hr/training/reports/summary?${params.toString()}`, { credentials: 'include' });
    return response.json();
  }

  static async getEmployeeTrainingReport(employeeId: string): Promise<EmployeeTrainingReport> {
    if (USE_MOCK_DATA) {
      const employeeEnrollments = mockEnrollments.filter(e => e.employeeId === employeeId);
      return {
        employeeId,
        employeeName: 'John Doe',
        employeeCode: 'EMP001',
        department: 'Sales',
        designation: 'Senior Sales Executive',
        totalTrainings: employeeEnrollments.length,
        completedTrainings: employeeEnrollments.filter(e => e.status === EnrollmentStatus.COMPLETED).length,
        inProgressTrainings: employeeEnrollments.filter(e => e.status === EnrollmentStatus.IN_PROGRESS).length,
        totalHours: 48,
        certifications: 2,
        averageScore: 85,
        trainings: employeeEnrollments.map(e => ({
          programName: e.program?.programName || 'Training',
          category: e.program?.category || 'General',
          completionDate: e.completionDate,
          status: e.status,
          score: e.score,
          certificateIssued: e.certificateIssued,
        })),
      };
    }
    // TODO(needs-backend): no NestJS route for training reports (hr/training-reports/employee/:id).
    const response = await fetch(`/api/hr/training/reports/employee/${employeeId}`, { credentials: 'include' });
    return response.json();
  }

  static async getDepartmentTrainingReport(departmentId: string): Promise<{
    departmentName: string;
    employeeCount: number;
    totalTrainings: number;
    totalHours: number;
    averageHoursPerEmployee: number;
    completionRate: number;
    byCategory: { category: string; count: number }[];
    topTrainings: { programName: string; participants: number }[];
  }> {
    if (USE_MOCK_DATA) {
      return {
        departmentName: 'Sales',
        employeeCount: 30,
        totalTrainings: 45,
        totalHours: 360,
        averageHoursPerEmployee: 12,
        completionRate: 88,
        byCategory: [
          { category: 'Sales Skills', count: 15 },
          { category: 'Product', count: 12 },
          { category: 'Soft Skills', count: 10 },
          { category: 'Technical', count: 8 },
        ],
        topTrainings: [
          { programName: 'Sales Excellence', participants: 25 },
          { programName: 'Product Mastery', participants: 22 },
          { programName: 'Negotiation Skills', participants: 18 },
        ],
      };
    }
    // TODO(needs-backend): no NestJS route for training reports (hr/training-reports/department/:id).
    const response = await fetch(`/api/hr/training/reports/department/${departmentId}`, { credentials: 'include' });
    return response.json();
  }

  static async getTrainingHoursReport(options?: {
    fromDate?: string;
    toDate?: string;
    departmentId?: string;
  }): Promise<{ month: string; hours: number; employees: number }[]> {
    if (USE_MOCK_DATA) {
      return [
        { month: 'Jan 2024', hours: 480, employees: 60 },
        { month: 'Feb 2024', hours: 520, employees: 65 },
        { month: 'Mar 2024', hours: 600, employees: 75 },
        { month: 'Apr 2024', hours: 440, employees: 55 },
        { month: 'May 2024', hours: 560, employees: 70 },
        { month: 'Jun 2024', hours: 620, employees: 78 },
        { month: 'Jul 2024', hours: 380, employees: 48 },
        { month: 'Aug 2024', hours: 540, employees: 68 },
        { month: 'Sep 2024', hours: 680, employees: 85 },
        { month: 'Oct 2024', hours: 720, employees: 90 },
        { month: 'Nov 2024', hours: 640, employees: 80 },
      ];
    }
    const params = new URLSearchParams();
    if (options?.fromDate) params.append('fromDate', options.fromDate);
    if (options?.toDate) params.append('toDate', options.toDate);
    if (options?.departmentId) params.append('departmentId', options.departmentId);
    // TODO(needs-backend): no NestJS route for training reports (hr/training-reports/hours).
    const response = await fetch(`/api/hr/training/reports/hours?${params.toString()}`, { credentials: 'include' });
    return response.json();
  }
}
