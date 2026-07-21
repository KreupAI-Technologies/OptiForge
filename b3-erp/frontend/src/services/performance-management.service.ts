/**
 * Performance Management Service
 * Handles all performance management operations including goals, reviews,
 * feedback, KPIs, PIPs, and performance analytics
 */

const USE_MOCK_DATA = false;

// ============================================================================
// Enums
// ============================================================================

export enum GoalStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DEFERRED = 'deferred',
}

export enum GoalType {
  INDIVIDUAL = 'individual',
  TEAM = 'team',
  DEPARTMENT = 'department',
  COMPANY = 'company',
}

export enum GoalCategory {
  PERFORMANCE = 'performance',
  DEVELOPMENT = 'development',
  PROJECT = 'project',
  BEHAVIOR = 'behavior',
  STRATEGIC = 'strategic',
}

export enum GoalPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ReviewCycleStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress',
  CALIBRATION = 'calibration',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ReviewStatus {
  NOT_STARTED = 'not_started',
  SELF_APPRAISAL_PENDING = 'self_appraisal_pending',
  SELF_APPRAISAL_SUBMITTED = 'self_appraisal_submitted',
  MANAGER_REVIEW_PENDING = 'manager_review_pending',
  MANAGER_REVIEW_SUBMITTED = 'manager_review_submitted',
  PEER_REVIEW_PENDING = 'peer_review_pending',
  CALIBRATION = 'calibration',
  FINAL_RATING_PENDING = 'final_rating_pending',
  COMPLETED = 'completed',
  ACKNOWLEDGED = 'acknowledged',
}

export enum FeedbackType {
  PRAISE = 'praise',
  CONSTRUCTIVE = 'constructive',
  SUGGESTION = 'suggestion',
  RECOGNITION = 'recognition',
}

export enum FeedbackVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  MANAGER_ONLY = 'manager_only',
}

export enum KPIType {
  QUANTITATIVE = 'quantitative',
  QUALITATIVE = 'qualitative',
  BINARY = 'binary',
}

export enum KPIMeasurement {
  NUMBER = 'number',
  PERCENTAGE = 'percentage',
  CURRENCY = 'currency',
  RATING = 'rating',
  YES_NO = 'yes_no',
}

export enum PIPStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  EXTENDED = 'extended',
  COMPLETED_SUCCESS = 'completed_success',
  COMPLETED_FAILURE = 'completed_failure',
  TERMINATED = 'terminated',
}

// ============================================================================
// Interfaces
// ============================================================================

export interface Goal {
  id: string;
  goalCode: string;
  title: string;
  description?: string;
  goalType: GoalType;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  employeeId: string;
  employeeName?: string;
  department?: string;
  parentGoalId?: string;
  parentGoal?: Goal;
  childGoals?: Goal[];
  targetValue?: number;
  currentValue?: number;
  progress: number;
  weightage: number;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  measurementUnit?: string;
  keyResults?: KeyResult[];
  milestones?: Milestone[];
  alignedGoals?: GoalAlignment[];
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface KeyResult {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  progress: number;
  status: string;
  dueDate?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  completedDate?: string;
  status: string;
}

export interface GoalAlignment {
  id: string;
  sourceGoalId: string;
  targetGoalId: string;
  targetGoal?: Goal;
  alignmentType: string;
  contributionPercentage?: number;
}

export interface PerformanceReviewCycle {
  id: string;
  cycleCode: string;
  cycleName: string;
  description?: string;
  cycleType: string;
  status: ReviewCycleStatus;
  startDate: string;
  endDate: string;
  selfAppraisalStartDate?: string;
  selfAppraisalEndDate?: string;
  managerReviewStartDate?: string;
  managerReviewEndDate?: string;
  peerReviewStartDate?: string;
  peerReviewEndDate?: string;
  calibrationStartDate?: string;
  calibrationEndDate?: string;
  goalsWeightage: number;
  competenciesWeightage: number;
  includeGoals: boolean;
  includePeerReview: boolean;
  include360Review: boolean;
  ratingScale?: RatingScale;
  totalReviews?: number;
  completedReviews?: number;
}

export interface RatingScale {
  id: string;
  name: string;
  levels: RatingLevel[];
}

export interface RatingLevel {
  value: number;
  label: string;
  description?: string;
  color?: string;
}

export interface PerformanceReview {
  id: string;
  reviewCode: string;
  cycleId: string;
  cycle?: PerformanceReviewCycle;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department?: string;
  designation?: string;
  managerId?: string;
  managerName?: string;
  status: ReviewStatus;
  selfRating?: number;
  selfComments?: string;
  selfAppraisalDate?: string;
  managerRating?: number;
  managerComments?: string;
  managerReviewDate?: string;
  peerRatings?: PeerRating[];
  averagePeerRating?: number;
  finalRating?: number;
  finalComments?: string;
  finalizedBy?: string;
  finalizedAt?: string;
  acknowledgedAt?: string;
  acknowledgmentComments?: string;
  goalsAchievement?: number;
  competencyScores?: CompetencyScore[];
  strengths?: string[];
  areasForImprovement?: string[];
  developmentPlan?: string;
}

export interface PeerRating {
  peerId: string;
  peerName: string;
  rating: number;
  comments?: string;
  submittedAt?: string;
}

export interface CompetencyScore {
  competencyId: string;
  competencyName: string;
  selfRating?: number;
  managerRating?: number;
  finalRating?: number;
}

export interface ReviewMeeting {
  id: string;
  reviewId: string;
  review?: PerformanceReview;
  meetingType: string;
  scheduledDate: string;
  scheduledTime?: string;
  duration?: number;
  location?: string;
  meetingLink?: string;
  status: string;
  agenda?: string;
  notes?: string;
  actionItems?: string[];
  attendees?: string[];
}

export interface ContinuousFeedback {
  id: string;
  feedbackCode: string;
  fromEmployeeId: string;
  fromEmployeeName: string;
  toEmployeeId: string;
  toEmployeeName: string;
  feedbackType: FeedbackType;
  visibility: FeedbackVisibility;
  subject: string;
  content: string;
  tags?: string[];
  relatedGoalId?: string;
  relatedProjectId?: string;
  createdAt: string;
  isAnonymous: boolean;
  reactions?: FeedbackReaction[];
}

export interface FeedbackReaction {
  employeeId: string;
  reactionType: string;
  createdAt: string;
}

export interface FeedbackRequest {
  id: string;
  requestCode: string;
  requesterId: string;
  requesterName: string;
  respondentId: string;
  respondentName: string;
  requestType: string;
  context?: string;
  questions?: string[];
  status: string;
  requestedAt: string;
  dueDate?: string;
  response?: string;
  respondedAt?: string;
}

export interface Recognition {
  id: string;
  recognitionCode: string;
  fromEmployeeId: string;
  fromEmployeeName: string;
  toEmployeeId: string;
  toEmployeeName: string;
  recognitionType: string;
  category?: string;
  title: string;
  message: string;
  badges?: string[];
  points?: number;
  visibility: string;
  createdAt: string;
  likes?: number;
  likedBy?: string[];
  comments?: RecognitionComment[];
}

export interface RecognitionComment {
  id: string;
  employeeId: string;
  employeeName: string;
  comment: string;
  createdAt: string;
}

export interface KPIMaster {
  id: string;
  kpiCode: string;
  kpiName: string;
  description?: string;
  category: string;
  kpiType: KPIType;
  measurementUnit: KPIMeasurement;
  targetType: string;
  defaultTarget?: number;
  minValue?: number;
  maxValue?: number;
  frequency: string;
  applicableTo: string;
  department?: string;
  designation?: string;
  isActive: boolean;
  weightage?: number;
  formula?: string;
}

export interface KPIAssignment {
  id: string;
  assignmentCode: string;
  kpiId: string;
  kpi?: KPIMaster;
  employeeId?: string;
  employeeName?: string;
  teamId?: string;
  teamName?: string;
  departmentId?: string;
  departmentName?: string;
  targetValue: number;
  currentValue: number;
  achievement: number;
  variance: number;
  periodStart: string;
  periodEnd: string;
  status: string;
  lastUpdated?: string;
  history?: KPIHistory[];
}

export interface KPIHistory {
  id: string;
  date: string;
  value: number;
  notes?: string;
  updatedBy?: string;
}

export interface KPITracking {
  id: string;
  assignmentId: string;
  assignment?: KPIAssignment;
  trackingDate: string;
  actualValue: number;
  targetValue: number;
  achievement: number;
  variance: number;
  notes?: string;
  evidence?: string[];
  updatedBy: string;
}

export interface PerformanceImprovementPlan {
  id: string;
  pipCode: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department?: string;
  designation?: string;
  managerId: string;
  managerName: string;
  hrPartnerId?: string;
  hrPartnerName?: string;
  status: PIPStatus;
  reason: string;
  areasOfImprovement: string[];
  objectives: PIPObjective[];
  supportProvided?: string;
  resources?: string;
  startDate: string;
  originalEndDate: string;
  currentEndDate: string;
  extensionCount: number;
  reviews?: PIPReview[];
  outcome?: string;
  outcomeDate?: string;
  outcomeNotes?: string;
}

export interface PIPObjective {
  id: string;
  objective: string;
  targetDate: string;
  status: string;
  progress: number;
  evidence?: string;
  managerComments?: string;
}

export interface PIPReview {
  id: string;
  pipId: string;
  reviewDate: string;
  reviewType: string;
  overallProgress: number;
  objectiveProgress: PIPObjectiveProgress[];
  employeeComments?: string;
  managerComments?: string;
  hrComments?: string;
  recommendation?: string;
  nextReviewDate?: string;
}

export interface PIPObjectiveProgress {
  objectiveId: string;
  progress: number;
  status: string;
  comments?: string;
}

export interface PerformanceDashboard {
  goalsOverview: {
    totalGoals: number;
    completedGoals: number;
    inProgressGoals: number;
    overdueGoals: number;
    averageProgress: number;
  };
  reviewsOverview: {
    totalReviews: number;
    completedReviews: number;
    pendingReviews: number;
    averageRating: number;
  };
  feedbackStats: {
    givenCount: number;
    receivedCount: number;
    pendingRequests: number;
  };
  kpiStats: {
    totalKPIs: number;
    onTrack: number;
    atRisk: number;
    offTrack: number;
  };
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  actorName?: string;
}

export interface RatingDistribution {
  rating: number;
  label: string;
  count: number;
  percentage: number;
}

export interface DepartmentPerformance {
  departmentId: string;
  departmentName: string;
  employeeCount: number;
  averageRating: number;
  goalsCompletion: number;
  kpiAchievement: number;
  ratingDistribution: RatingDistribution[];
}

// ============================================================================
// Mock Data
// ============================================================================

const mockGoals: Goal[] = [
  {
    id: '1',
    goalCode: 'GOAL-001',
    title: 'Increase Sales Revenue by 20%',
    description: 'Achieve 20% growth in quarterly sales revenue',
    goalType: GoalType.INDIVIDUAL,
    category: GoalCategory.PERFORMANCE,
    priority: GoalPriority.HIGH,
    status: GoalStatus.IN_PROGRESS,
    employeeId: 'E001',
    employeeName: 'John Doe',
    department: 'Sales',
    targetValue: 20,
    currentValue: 15,
    progress: 75,
    weightage: 30,
    startDate: '2024-01-01',
    dueDate: '2024-12-31',
    keyResults: [
      { id: 'kr1', title: 'Close 50 new deals', targetValue: 50, currentValue: 38, progress: 76, status: 'in_progress' },
      { id: 'kr2', title: 'Upsell to 20 existing clients', targetValue: 20, currentValue: 15, progress: 75, status: 'in_progress' },
    ],
  },
  {
    id: '2',
    goalCode: 'GOAL-002',
    title: 'Complete Leadership Training',
    description: 'Complete the emerging leaders program',
    goalType: GoalType.INDIVIDUAL,
    category: GoalCategory.DEVELOPMENT,
    priority: GoalPriority.MEDIUM,
    status: GoalStatus.ACTIVE,
    employeeId: 'E001',
    employeeName: 'John Doe',
    department: 'Sales',
    progress: 40,
    weightage: 15,
    startDate: '2024-02-01',
    dueDate: '2024-06-30',
    milestones: [
      { id: 'm1', title: 'Module 1 - Self Awareness', dueDate: '2024-02-28', completedDate: '2024-02-25', status: 'completed' },
      { id: 'm2', title: 'Module 2 - Team Leadership', dueDate: '2024-03-31', completedDate: '2024-03-28', status: 'completed' },
      { id: 'm3', title: 'Module 3 - Strategic Thinking', dueDate: '2024-04-30', status: 'in_progress' },
    ],
  },
  {
    id: '3',
    goalCode: 'GOAL-003',
    title: 'Improve Customer Satisfaction Score',
    description: 'Achieve NPS score of 80+',
    goalType: GoalType.TEAM,
    category: GoalCategory.PERFORMANCE,
    priority: GoalPriority.HIGH,
    status: GoalStatus.IN_PROGRESS,
    employeeId: 'E002',
    employeeName: 'Jane Smith',
    department: 'Customer Success',
    targetValue: 80,
    currentValue: 72,
    progress: 90,
    weightage: 25,
    startDate: '2024-01-01',
    dueDate: '2024-12-31',
  },
];

const mockReviewCycles: PerformanceReviewCycle[] = [
  {
    id: '1',
    cycleCode: 'CYCLE-2024-Q4',
    cycleName: 'Q4 2024 Performance Review',
    description: 'Annual performance review cycle for Q4 2024',
    cycleType: 'quarterly',
    status: ReviewCycleStatus.IN_PROGRESS,
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    selfAppraisalStartDate: '2024-11-01',
    selfAppraisalEndDate: '2024-11-15',
    managerReviewStartDate: '2024-11-16',
    managerReviewEndDate: '2024-11-30',
    calibrationStartDate: '2024-12-01',
    calibrationEndDate: '2024-12-15',
    goalsWeightage: 60,
    competenciesWeightage: 40,
    includeGoals: true,
    includePeerReview: true,
    include360Review: false,
    totalReviews: 150,
    completedReviews: 85,
    ratingScale: {
      id: 'rs1',
      name: '5-Point Scale',
      levels: [
        { value: 5, label: 'Exceptional', description: 'Consistently exceeds expectations', color: '#22c55e' },
        { value: 4, label: 'Exceeds Expectations', description: 'Frequently exceeds expectations', color: '#84cc16' },
        { value: 3, label: 'Meets Expectations', description: 'Meets all expectations', color: '#eab308' },
        { value: 2, label: 'Needs Improvement', description: 'Partially meets expectations', color: '#f97316' },
        { value: 1, label: 'Unsatisfactory', description: 'Does not meet expectations', color: '#ef4444' },
      ],
    },
  },
];

const mockReviews: PerformanceReview[] = [
  {
    id: '1',
    reviewCode: 'REV-2024-001',
    cycleId: '1',
    employeeId: 'E001',
    employeeName: 'John Doe',
    employeeCode: 'EMP001',
    department: 'Sales',
    designation: 'Senior Sales Executive',
    managerId: 'M001',
    managerName: 'Robert Wilson',
    status: ReviewStatus.MANAGER_REVIEW_PENDING,
    selfRating: 4,
    selfComments: 'I have achieved most of my targets and exceeded in customer acquisition.',
    selfAppraisalDate: '2024-11-10',
    goalsAchievement: 85,
    competencyScores: [
      { competencyId: 'c1', competencyName: 'Communication', selfRating: 4 },
      { competencyId: 'c2', competencyName: 'Leadership', selfRating: 3 },
      { competencyId: 'c3', competencyName: 'Problem Solving', selfRating: 4 },
    ],
    strengths: ['Customer relationship building', 'Product knowledge', 'Negotiation skills'],
    areasForImprovement: ['Documentation', 'Time management'],
  },
  {
    id: '2',
    reviewCode: 'REV-2024-002',
    cycleId: '1',
    employeeId: 'E002',
    employeeName: 'Jane Smith',
    employeeCode: 'EMP002',
    department: 'Customer Success',
    designation: 'Customer Success Manager',
    managerId: 'M002',
    managerName: 'Sarah Johnson',
    status: ReviewStatus.COMPLETED,
    selfRating: 4,
    managerRating: 4,
    finalRating: 4,
    finalComments: 'Jane has shown excellent performance in customer retention.',
    acknowledgedAt: '2024-11-28',
    goalsAchievement: 92,
  },
];

const mockFeedback: ContinuousFeedback[] = [
  {
    id: '1',
    feedbackCode: 'FB-001',
    fromEmployeeId: 'E003',
    fromEmployeeName: 'Mike Johnson',
    toEmployeeId: 'E001',
    toEmployeeName: 'John Doe',
    feedbackType: FeedbackType.PRAISE,
    visibility: FeedbackVisibility.PUBLIC,
    subject: 'Great presentation skills',
    content: 'Your presentation at the client meeting was excellent. You handled all the tough questions with confidence.',
    tags: ['presentation', 'client-meeting'],
    createdAt: '2024-11-05T10:30:00Z',
    isAnonymous: false,
    reactions: [{ employeeId: 'E004', reactionType: '👏', createdAt: '2024-11-05T11:00:00Z' }],
  },
  {
    id: '2',
    feedbackCode: 'FB-002',
    fromEmployeeId: 'E001',
    fromEmployeeName: 'John Doe',
    toEmployeeId: 'E002',
    toEmployeeName: 'Jane Smith',
    feedbackType: FeedbackType.RECOGNITION,
    visibility: FeedbackVisibility.PUBLIC,
    subject: 'Outstanding customer handling',
    content: 'Thank you for going above and beyond to help the customer resolve their issue. Your patience was admirable.',
    tags: ['customer-service', 'teamwork'],
    createdAt: '2024-11-03T14:20:00Z',
    isAnonymous: false,
  },
];

const mockRecognitions: Recognition[] = [
  {
    id: '1',
    recognitionCode: 'REC-001',
    fromEmployeeId: 'M001',
    fromEmployeeName: 'Robert Wilson',
    toEmployeeId: 'E001',
    toEmployeeName: 'John Doe',
    recognitionType: 'spot_award',
    category: 'Sales Excellence',
    title: 'Top Performer of the Month',
    message: 'Congratulations on closing the biggest deal of the quarter! Your dedication and hard work truly paid off.',
    badges: ['star_performer', 'deal_closer'],
    points: 500,
    visibility: 'public',
    createdAt: '2024-11-01T09:00:00Z',
    likes: 25,
    likedBy: ['E002', 'E003', 'E004'],
  },
];

const mockKPIs: KPIMaster[] = [
  { id: '1', kpiCode: 'KPI-001', kpiName: 'Sales Revenue', description: 'Monthly sales revenue target', category: 'Sales', kpiType: KPIType.QUANTITATIVE, measurementUnit: KPIMeasurement.CURRENCY, targetType: 'monthly', defaultTarget: 1000000, frequency: 'monthly', applicableTo: 'department', department: 'Sales', isActive: true, weightage: 30 },
  { id: '2', kpiCode: 'KPI-002', kpiName: 'Customer Satisfaction', description: 'NPS Score', category: 'Service', kpiType: KPIType.QUANTITATIVE, measurementUnit: KPIMeasurement.NUMBER, targetType: 'quarterly', defaultTarget: 80, frequency: 'quarterly', applicableTo: 'department', department: 'Customer Success', isActive: true, weightage: 25 },
  { id: '3', kpiCode: 'KPI-003', kpiName: 'Code Quality', description: 'Code review pass rate', category: 'Engineering', kpiType: KPIType.QUANTITATIVE, measurementUnit: KPIMeasurement.PERCENTAGE, targetType: 'monthly', defaultTarget: 95, frequency: 'monthly', applicableTo: 'team', isActive: true, weightage: 20 },
];

const mockKPIAssignments: KPIAssignment[] = [
  { id: '1', assignmentCode: 'KPIA-001', kpiId: '1', kpi: mockKPIs[0], employeeId: 'E001', employeeName: 'John Doe', targetValue: 1000000, currentValue: 850000, achievement: 85, variance: -15, periodStart: '2024-11-01', periodEnd: '2024-11-30', status: 'at_risk', lastUpdated: '2024-11-10' },
  { id: '2', assignmentCode: 'KPIA-002', kpiId: '2', departmentId: 'D002', departmentName: 'Customer Success', targetValue: 80, currentValue: 82, achievement: 102.5, variance: 2.5, periodStart: '2024-10-01', periodEnd: '2024-12-31', status: 'on_track', lastUpdated: '2024-11-08' },
];

const mockPIPs: PerformanceImprovementPlan[] = [
  {
    id: '1',
    pipCode: 'PIP-2024-001',
    employeeId: 'E005',
    employeeName: 'Alex Turner',
    employeeCode: 'EMP005',
    department: 'Engineering',
    designation: 'Software Developer',
    managerId: 'M003',
    managerName: 'David Chen',
    hrPartnerId: 'HR001',
    hrPartnerName: 'Emily HR',
    status: PIPStatus.ACTIVE,
    reason: 'Consistent underperformance in code quality and missed deadlines',
    areasOfImprovement: ['Code quality', 'Time management', 'Communication'],
    objectives: [
      { id: 'obj1', objective: 'Achieve 90% code review pass rate', targetDate: '2024-12-15', status: 'in_progress', progress: 65 },
      { id: 'obj2', objective: 'Complete all assigned tasks within deadlines', targetDate: '2024-12-31', status: 'in_progress', progress: 70 },
      { id: 'obj3', objective: 'Provide daily status updates', targetDate: '2024-12-31', status: 'on_track', progress: 85 },
    ],
    supportProvided: 'Weekly 1:1 meetings with manager, code review mentorship, time management training',
    startDate: '2024-10-15',
    originalEndDate: '2024-12-31',
    currentEndDate: '2024-12-31',
    extensionCount: 0,
  },
];

// ============================================================================
// Service Class
// ============================================================================

export class PerformanceManagementService {
  // ========== Performance Reviews (NestJS HR backend) ==========

  /**
   * Fetch performance reviews directly from the NestJS HR backend
   * (GET /hr/performance-reviews). Returns the raw ORM rows as-is;
   * callers should defensively map to their view model.
   */
  static async getHrPerformanceReviews(filters?: Record<string, string>): Promise<any[]> {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const params = new URLSearchParams(filters ?? {});
    const qs = params.toString();
    const response = await fetch(`${base}/hr/performance-reviews${qs ? `?${qs}` : ''}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch performance reviews (${response.status})`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data ?? []);
  }

  /**
   * Fetch a single performance review directly from the NestJS HR backend
   * (GET /hr/performance-reviews/:id). Returns the raw ORM row; callers should
   * defensively map to their view model.
   */
  static async getHrPerformanceReviewById(id: string): Promise<any> {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const response = await fetch(`${base}/hr/performance-reviews/${id}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch performance review (${response.status})`);
    }
    return response.json();
  }

  /**
   * Update a performance review directly on the NestJS HR backend
   * (PUT /hr/performance-reviews/:id). Accepts a partial payload.
   */
  static async updateHrPerformanceReview(id: string, data: Record<string, any>): Promise<any> {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const response = await fetch(`${base}/hr/performance-reviews/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update performance review (${response.status})`);
    }
    return response.json();
  }

  /**
   * Create a performance review directly on the NestJS HR backend
   * (POST /hr/performance-reviews). Accepts an arbitrary payload; the backend
   * persists it as-is.
   */
  static async createHrPerformanceReview(data: Record<string, any>): Promise<any> {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const response = await fetch(`${base}/hr/performance-reviews`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create performance review (${response.status})`);
    }
    return response.json();
  }

  // ========== Goals ==========

  static async getGoals(options?: {
    employeeId?: string;
    goalType?: GoalType;
    status?: GoalStatus;
    category?: GoalCategory;
    parentGoalId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Goal[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockGoals];
      if (options?.employeeId) filtered = filtered.filter(g => g.employeeId === options.employeeId);
      if (options?.goalType) filtered = filtered.filter(g => g.goalType === options.goalType);
      if (options?.status) filtered = filtered.filter(g => g.status === options.status);
      if (options?.category) filtered = filtered.filter(g => g.category === options.category);
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (options?.employeeId) params.append('employeeId', options.employeeId);
    if (options?.goalType) params.append('goalType', options.goalType);
    if (options?.status) params.append('status', options.status);
    if (options?.category) params.append('category', options.category);
    const response = await fetch(`/api/hr/performance/goals?${params.toString()}`);
    return response.json();
  }

  static async getGoalById(id: string): Promise<Goal> {
    if (USE_MOCK_DATA) {
      const goal = mockGoals.find(g => g.id === id);
      if (!goal) throw new Error('Goal not found');
      return goal;
    }
    const response = await fetch(`/api/hr/performance/goals/${id}`);
    return response.json();
  }

  static async createGoal(data: Partial<Goal>): Promise<Goal> {
    if (USE_MOCK_DATA) {
      const newGoal: Goal = {
        id: String(mockGoals.length + 1),
        goalCode: `GOAL-${String(mockGoals.length + 1).padStart(3, '0')}`,
        title: data.title || 'New Goal',
        goalType: data.goalType || GoalType.INDIVIDUAL,
        category: data.category || GoalCategory.PERFORMANCE,
        priority: data.priority || GoalPriority.MEDIUM,
        status: GoalStatus.DRAFT,
        employeeId: data.employeeId || 'E001',
        progress: 0,
        weightage: data.weightage || 10,
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        dueDate: data.dueDate || new Date().toISOString().split('T')[0],
        ...data,
      } as Goal;
      mockGoals.push(newGoal);
      return newGoal;
    }
    const response = await fetch('/api/hr/performance/goals', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async updateGoal(id: string, data: Partial<Goal>): Promise<Goal> {
    if (USE_MOCK_DATA) {
      const index = mockGoals.findIndex(g => g.id === id);
      if (index !== -1) {
        mockGoals[index] = { ...mockGoals[index], ...data };
        return mockGoals[index];
      }
      throw new Error('Goal not found');
    }
    const response = await fetch(`/api/hr/performance/goals/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async updateGoalProgress(id: string, progress: number, notes?: string): Promise<Goal> {
    if (USE_MOCK_DATA) {
      const goal = mockGoals.find(g => g.id === id);
      if (goal) {
        goal.progress = progress;
        goal.currentValue = goal.targetValue ? (goal.targetValue * progress) / 100 : undefined;
      }
      return goal!;
    }
    const response = await fetch(`/api/hr/performance/goals/${id}/progress`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress, notes }),
    });
    return response.json();
  }

  static async submitGoalForApproval(id: string): Promise<Goal> {
    return this.updateGoal(id, { status: GoalStatus.PENDING_APPROVAL });
  }

  static async approveGoal(id: string, approvedBy: string): Promise<Goal> {
    return this.updateGoal(id, {
      status: GoalStatus.ACTIVE,
      approvedBy,
      approvedAt: new Date().toISOString()
    });
  }

  static async completeGoal(id: string): Promise<Goal> {
    return this.updateGoal(id, {
      status: GoalStatus.COMPLETED,
      completedDate: new Date().toISOString().split('T')[0],
      progress: 100
    });
  }

  // ========== Review Cycles ==========

  static async getReviewCycles(options?: {
    status?: ReviewCycleStatus;
    cycleType?: string;
  }): Promise<PerformanceReviewCycle[]> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockReviewCycles];
      if (options?.status) filtered = filtered.filter(c => c.status === options.status);
      return filtered;
    }
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.cycleType) params.append('cycleType', options.cycleType);
    const response = await fetch(`/api/hr/performance/review-cycles?${params.toString()}`);
    return response.json();
  }

  static async getReviewCycleById(id: string): Promise<PerformanceReviewCycle> {
    if (USE_MOCK_DATA) {
      const cycle = mockReviewCycles.find(c => c.id === id);
      if (!cycle) throw new Error('Review cycle not found');
      return cycle;
    }
    const response = await fetch(`/api/hr/performance/review-cycles/${id}`);
    return response.json();
  }

  static async createReviewCycle(data: Partial<PerformanceReviewCycle>): Promise<PerformanceReviewCycle> {
    if (USE_MOCK_DATA) {
      const newCycle: PerformanceReviewCycle = {
        id: String(mockReviewCycles.length + 1),
        cycleCode: `CYCLE-${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
        cycleName: data.cycleName || 'New Review Cycle',
        cycleType: data.cycleType || 'quarterly',
        status: ReviewCycleStatus.DRAFT,
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        endDate: data.endDate || new Date().toISOString().split('T')[0],
        goalsWeightage: data.goalsWeightage || 60,
        competenciesWeightage: data.competenciesWeightage || 40,
        includeGoals: data.includeGoals ?? true,
        includePeerReview: data.includePeerReview ?? false,
        include360Review: data.include360Review ?? false,
        ...data,
      } as PerformanceReviewCycle;
      mockReviewCycles.push(newCycle);
      return newCycle;
    }
    const response = await fetch('/api/hr/performance/review-cycles', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async updateReviewCycle(id: string, data: Partial<PerformanceReviewCycle>): Promise<PerformanceReviewCycle> {
    if (USE_MOCK_DATA) {
      const index = mockReviewCycles.findIndex(c => c.id === id);
      if (index !== -1) {
        mockReviewCycles[index] = { ...mockReviewCycles[index], ...data };
        return mockReviewCycles[index];
      }
      throw new Error('Review cycle not found');
    }
    const response = await fetch(`/api/hr/performance/review-cycles/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // ========== Performance Reviews ==========

  static async getPerformanceReviews(options?: {
    cycleId?: string;
    employeeId?: string;
    managerId?: string;
    status?: ReviewStatus;
    department?: string;
  }): Promise<{ data: PerformanceReview[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockReviews];
      if (options?.cycleId) filtered = filtered.filter(r => r.cycleId === options.cycleId);
      if (options?.employeeId) filtered = filtered.filter(r => r.employeeId === options.employeeId);
      if (options?.status) filtered = filtered.filter(r => r.status === options.status);
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (options?.cycleId) params.append('cycleId', options.cycleId);
    if (options?.employeeId) params.append('employeeId', options.employeeId);
    if (options?.managerId) params.append('managerId', options.managerId);
    if (options?.status) params.append('status', options.status);
    const response = await fetch(`/api/hr/performance/reviews?${params.toString()}`);
    return response.json();
  }

  static async getPerformanceReviewById(id: string): Promise<PerformanceReview> {
    if (USE_MOCK_DATA) {
      const review = mockReviews.find(r => r.id === id);
      if (!review) throw new Error('Review not found');
      return review;
    }
    const response = await fetch(`/api/hr/performance/reviews/${id}`);
    return response.json();
  }

  static async submitSelfAppraisal(id: string, data: {
    selfRating: number;
    selfComments: string;
    competencyScores?: CompetencyScore[];
    strengths?: string[];
    areasForImprovement?: string[];
  }): Promise<PerformanceReview> {
    if (USE_MOCK_DATA) {
      const review = mockReviews.find(r => r.id === id);
      if (review) {
        review.selfRating = data.selfRating;
        review.selfComments = data.selfComments;
        review.selfAppraisalDate = new Date().toISOString().split('T')[0];
        review.status = ReviewStatus.SELF_APPRAISAL_SUBMITTED;
        if (data.competencyScores) review.competencyScores = data.competencyScores;
        if (data.strengths) review.strengths = data.strengths;
        if (data.areasForImprovement) review.areasForImprovement = data.areasForImprovement;
      }
      return review!;
    }
    const response = await fetch(`/api/hr/performance/reviews/${id}/self-appraisal`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async submitManagerReview(id: string, data: {
    managerRating: number;
    managerComments: string;
    competencyScores?: CompetencyScore[];
  }): Promise<PerformanceReview> {
    if (USE_MOCK_DATA) {
      const review = mockReviews.find(r => r.id === id);
      if (review) {
        review.managerRating = data.managerRating;
        review.managerComments = data.managerComments;
        review.managerReviewDate = new Date().toISOString().split('T')[0];
        review.status = ReviewStatus.MANAGER_REVIEW_SUBMITTED;
      }
      return review!;
    }
    const response = await fetch(`/api/hr/performance/reviews/${id}/manager-review`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async submitFinalRating(id: string, data: {
    finalRating: number;
    finalComments: string;
    developmentPlan?: string;
  }): Promise<PerformanceReview> {
    if (USE_MOCK_DATA) {
      const review = mockReviews.find(r => r.id === id);
      if (review) {
        review.finalRating = data.finalRating;
        review.finalComments = data.finalComments;
        review.developmentPlan = data.developmentPlan;
        review.status = ReviewStatus.COMPLETED;
        review.finalizedAt = new Date().toISOString();
      }
      return review!;
    }
    const response = await fetch(`/api/hr/performance/reviews/${id}/final-rating`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async acknowledgeReview(id: string, comments?: string): Promise<PerformanceReview> {
    if (USE_MOCK_DATA) {
      const review = mockReviews.find(r => r.id === id);
      if (review) {
        review.status = ReviewStatus.ACKNOWLEDGED;
        review.acknowledgedAt = new Date().toISOString();
        review.acknowledgmentComments = comments;
      }
      return review!;
    }
    const response = await fetch(`/api/hr/performance/reviews/${id}/acknowledge`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comments }),
    });
    return response.json();
  }

  // ========== Review Meetings ==========

  static async getReviewMeetings(options?: {
    reviewId?: string;
    employeeId?: string;
    status?: string;
  }): Promise<ReviewMeeting[]> {
    if (USE_MOCK_DATA) {
      return [];
    }
    const params = new URLSearchParams();
    if (options?.reviewId) params.append('reviewId', options.reviewId);
    if (options?.employeeId) params.append('employeeId', options.employeeId);
    const response = await fetch(`/api/hr/performance/review-meetings?${params.toString()}`);
    return response.json();
  }

  static async scheduleReviewMeeting(data: Partial<ReviewMeeting>): Promise<ReviewMeeting> {
    if (USE_MOCK_DATA) {
      return {
        id: '1',
        reviewId: data.reviewId || '1',
        meetingType: data.meetingType || 'review_discussion',
        scheduledDate: data.scheduledDate || new Date().toISOString().split('T')[0],
        status: 'scheduled',
        ...data,
      } as ReviewMeeting;
    }
    const response = await fetch('/api/hr/performance/review-meetings', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // ========== Continuous Feedback ==========

  static async getFeedback(options?: {
    toEmployeeId?: string;
    fromEmployeeId?: string;
    feedbackType?: FeedbackType;
    visibility?: FeedbackVisibility;
  }): Promise<{ data: ContinuousFeedback[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockFeedback];
      if (options?.toEmployeeId) filtered = filtered.filter(f => f.toEmployeeId === options.toEmployeeId);
      if (options?.fromEmployeeId) filtered = filtered.filter(f => f.fromEmployeeId === options.fromEmployeeId);
      if (options?.feedbackType) filtered = filtered.filter(f => f.feedbackType === options.feedbackType);
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (options?.toEmployeeId) params.append('toEmployeeId', options.toEmployeeId);
    if (options?.fromEmployeeId) params.append('fromEmployeeId', options.fromEmployeeId);
    if (options?.feedbackType) params.append('feedbackType', options.feedbackType);
    const response = await fetch(`/api/hr/performance/feedback?${params.toString()}`);
    return response.json();
  }

  static async createFeedback(data: Partial<ContinuousFeedback>): Promise<ContinuousFeedback> {
    if (USE_MOCK_DATA) {
      const newFeedback: ContinuousFeedback = {
        id: String(mockFeedback.length + 1),
        feedbackCode: `FB-${String(mockFeedback.length + 1).padStart(3, '0')}`,
        fromEmployeeId: data.fromEmployeeId || 'E001',
        fromEmployeeName: data.fromEmployeeName || 'Employee',
        toEmployeeId: data.toEmployeeId || 'E002',
        toEmployeeName: data.toEmployeeName || 'Recipient',
        feedbackType: data.feedbackType || FeedbackType.PRAISE,
        visibility: data.visibility || FeedbackVisibility.PUBLIC,
        subject: data.subject || 'Feedback',
        content: data.content || '',
        createdAt: new Date().toISOString(),
        isAnonymous: data.isAnonymous ?? false,
        ...data,
      } as ContinuousFeedback;
      mockFeedback.push(newFeedback);
      return newFeedback;
    }
    const response = await fetch('/api/hr/performance/feedback', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // ========== Feedback Requests ==========

  static async getFeedbackRequests(options?: {
    requesterId?: string;
    respondentId?: string;
    status?: string;
  }): Promise<FeedbackRequest[]> {
    if (USE_MOCK_DATA) {
      return [];
    }
    const params = new URLSearchParams();
    if (options?.requesterId) params.append('requesterId', options.requesterId);
    if (options?.respondentId) params.append('respondentId', options.respondentId);
    if (options?.status) params.append('status', options.status);
    const response = await fetch(`/api/hr/performance/feedback-requests?${params.toString()}`);
    return response.json();
  }

  static async createFeedbackRequest(data: Partial<FeedbackRequest>): Promise<FeedbackRequest> {
    if (USE_MOCK_DATA) {
      return {
        id: '1',
        requestCode: 'FBR-001',
        requesterId: data.requesterId || 'E001',
        requesterName: 'Requester',
        respondentId: data.respondentId || 'E002',
        respondentName: 'Respondent',
        requestType: data.requestType || 'general',
        status: 'pending',
        requestedAt: new Date().toISOString(),
        ...data,
      } as FeedbackRequest;
    }
    const response = await fetch('/api/hr/performance/feedback-requests', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // ========== Recognition ==========

  static async getRecognitions(options?: {
    toEmployeeId?: string;
    fromEmployeeId?: string;
    recognitionType?: string;
  }): Promise<{ data: Recognition[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockRecognitions];
      if (options?.toEmployeeId) filtered = filtered.filter(r => r.toEmployeeId === options.toEmployeeId);
      if (options?.fromEmployeeId) filtered = filtered.filter(r => r.fromEmployeeId === options.fromEmployeeId);
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (options?.toEmployeeId) params.append('toEmployeeId', options.toEmployeeId);
    if (options?.fromEmployeeId) params.append('fromEmployeeId', options.fromEmployeeId);
    const response = await fetch(`/api/hr/performance/recognitions?${params.toString()}`);
    return response.json();
  }

  static async createRecognition(data: Partial<Recognition>): Promise<Recognition> {
    if (USE_MOCK_DATA) {
      const newRecognition: Recognition = {
        id: String(mockRecognitions.length + 1),
        recognitionCode: `REC-${String(mockRecognitions.length + 1).padStart(3, '0')}`,
        fromEmployeeId: data.fromEmployeeId || 'E001',
        fromEmployeeName: data.fromEmployeeName || 'Sender',
        toEmployeeId: data.toEmployeeId || 'E002',
        toEmployeeName: data.toEmployeeName || 'Recipient',
        recognitionType: data.recognitionType || 'spot_award',
        title: data.title || 'Recognition',
        message: data.message || '',
        visibility: data.visibility || 'public',
        createdAt: new Date().toISOString(),
        likes: 0,
        ...data,
      } as Recognition;
      mockRecognitions.push(newRecognition);
      return newRecognition;
    }
    const response = await fetch('/api/hr/performance/recognitions', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async likeRecognition(id: string, employeeId: string): Promise<Recognition> {
    if (USE_MOCK_DATA) {
      const recognition = mockRecognitions.find(r => r.id === id);
      if (recognition) {
        recognition.likes = (recognition.likes || 0) + 1;
        if (!recognition.likedBy) recognition.likedBy = [];
        recognition.likedBy.push(employeeId);
      }
      return recognition!;
    }
    const response = await fetch(`/api/hr/performance/recognitions/${id}/like`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId }),
    });
    return response.json();
  }

  // ========== KPI Management ==========

  static async getKPIMasters(options?: {
    category?: string;
    kpiType?: KPIType;
    applicableTo?: string;
    isActive?: boolean;
  }): Promise<KPIMaster[]> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockKPIs];
      if (options?.category) filtered = filtered.filter(k => k.category === options.category);
      if (options?.kpiType) filtered = filtered.filter(k => k.kpiType === options.kpiType);
      if (options?.isActive !== undefined) filtered = filtered.filter(k => k.isActive === options.isActive);
      return filtered;
    }
    const params = new URLSearchParams();
    if (options?.category) params.append('category', options.category);
    if (options?.kpiType) params.append('kpiType', options.kpiType);
    if (options?.applicableTo) params.append('applicableTo', options.applicableTo);
    const response = await fetch(`/api/hr/performance/kpi-masters?${params.toString()}`);
    return response.json();
  }

  static async createKPIMaster(data: Partial<KPIMaster>): Promise<KPIMaster> {
    if (USE_MOCK_DATA) {
      const newKPI: KPIMaster = {
        id: String(mockKPIs.length + 1),
        kpiCode: `KPI-${String(mockKPIs.length + 1).padStart(3, '0')}`,
        kpiName: data.kpiName || 'New KPI',
        category: data.category || 'General',
        kpiType: data.kpiType || KPIType.QUANTITATIVE,
        measurementUnit: data.measurementUnit || KPIMeasurement.NUMBER,
        targetType: data.targetType || 'monthly',
        frequency: data.frequency || 'monthly',
        applicableTo: data.applicableTo || 'individual',
        isActive: true,
        ...data,
      } as KPIMaster;
      mockKPIs.push(newKPI);
      return newKPI;
    }
    const response = await fetch('/api/hr/performance/kpi-masters', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async getKPIAssignments(options?: {
    kpiId?: string;
    employeeId?: string;
    departmentId?: string;
    status?: string;
  }): Promise<{ data: KPIAssignment[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockKPIAssignments];
      if (options?.kpiId) filtered = filtered.filter(a => a.kpiId === options.kpiId);
      if (options?.employeeId) filtered = filtered.filter(a => a.employeeId === options.employeeId);
      if (options?.departmentId) filtered = filtered.filter(a => a.departmentId === options.departmentId);
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (options?.kpiId) params.append('kpiId', options.kpiId);
    if (options?.employeeId) params.append('employeeId', options.employeeId);
    if (options?.departmentId) params.append('departmentId', options.departmentId);
    const response = await fetch(`/api/hr/performance/kpi-assignments?${params.toString()}`);
    return response.json();
  }

  static async assignKPI(data: Partial<KPIAssignment>): Promise<KPIAssignment> {
    if (USE_MOCK_DATA) {
      const newAssignment: KPIAssignment = {
        id: String(mockKPIAssignments.length + 1),
        assignmentCode: `KPIA-${String(mockKPIAssignments.length + 1).padStart(3, '0')}`,
        kpiId: data.kpiId || '1',
        targetValue: data.targetValue || 100,
        currentValue: 0,
        achievement: 0,
        variance: -100,
        periodStart: data.periodStart || new Date().toISOString().split('T')[0],
        periodEnd: data.periodEnd || new Date().toISOString().split('T')[0],
        status: 'not_started',
        ...data,
      } as KPIAssignment;
      mockKPIAssignments.push(newAssignment);
      return newAssignment;
    }
    const response = await fetch('/api/hr/performance/kpi-assignments', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async trackKPI(assignmentId: string, data: {
    actualValue: number;
    notes?: string;
    evidence?: string[];
  }): Promise<KPITracking> {
    if (USE_MOCK_DATA) {
      const assignment = mockKPIAssignments.find(a => a.id === assignmentId);
      if (assignment) {
        assignment.currentValue = data.actualValue;
        assignment.achievement = (data.actualValue / assignment.targetValue) * 100;
        assignment.variance = data.actualValue - assignment.targetValue;
        assignment.lastUpdated = new Date().toISOString().split('T')[0];
      }
      return {
        id: '1',
        assignmentId,
        trackingDate: new Date().toISOString().split('T')[0],
        actualValue: data.actualValue,
        targetValue: assignment?.targetValue || 100,
        achievement: assignment?.achievement || 0,
        variance: assignment?.variance || 0,
        notes: data.notes,
        updatedBy: 'current_user',
      };
    }
    const response = await fetch(`/api/hr/performance/kpi-assignments/${assignmentId}/track`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // ========== Performance Improvement Plan ==========

  static async getPIPs(options?: {
    employeeId?: string;
    managerId?: string;
    status?: PIPStatus;
  }): Promise<{ data: PerformanceImprovementPlan[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockPIPs];
      if (options?.employeeId) filtered = filtered.filter(p => p.employeeId === options.employeeId);
      if (options?.managerId) filtered = filtered.filter(p => p.managerId === options.managerId);
      if (options?.status) filtered = filtered.filter(p => p.status === options.status);
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (options?.employeeId) params.append('employeeId', options.employeeId);
    if (options?.managerId) params.append('managerId', options.managerId);
    if (options?.status) params.append('status', options.status);
    const response = await fetch(`/api/hr/performance/pips?${params.toString()}`);
    return response.json();
  }

  static async getPIPById(id: string): Promise<PerformanceImprovementPlan> {
    if (USE_MOCK_DATA) {
      const pip = mockPIPs.find(p => p.id === id);
      if (!pip) throw new Error('PIP not found');
      return pip;
    }
    const response = await fetch(`/api/hr/performance/pips/${id}`);
    return response.json();
  }

  static async createPIP(data: Partial<PerformanceImprovementPlan>): Promise<PerformanceImprovementPlan> {
    if (USE_MOCK_DATA) {
      const newPIP: PerformanceImprovementPlan = {
        id: String(mockPIPs.length + 1),
        pipCode: `PIP-${new Date().getFullYear()}-${String(mockPIPs.length + 1).padStart(3, '0')}`,
        employeeId: data.employeeId || 'E001',
        employeeName: data.employeeName || 'Employee',
        employeeCode: data.employeeCode || 'EMP001',
        managerId: data.managerId || 'M001',
        managerName: data.managerName || 'Manager',
        status: PIPStatus.DRAFT,
        reason: data.reason || 'Performance concerns',
        areasOfImprovement: data.areasOfImprovement || [],
        objectives: data.objectives || [],
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        originalEndDate: data.originalEndDate || new Date().toISOString().split('T')[0],
        currentEndDate: data.originalEndDate || new Date().toISOString().split('T')[0],
        extensionCount: 0,
        ...data,
      } as PerformanceImprovementPlan;
      mockPIPs.push(newPIP);
      return newPIP;
    }
    const response = await fetch('/api/hr/performance/pips', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async updatePIPObjective(pipId: string, objectiveId: string, data: {
    progress: number;
    status: string;
    evidence?: string;
    comments?: string;
  }): Promise<PerformanceImprovementPlan> {
    if (USE_MOCK_DATA) {
      const pip = mockPIPs.find(p => p.id === pipId);
      if (pip) {
        const objective = pip.objectives.find(o => o.id === objectiveId);
        if (objective) {
          objective.progress = data.progress;
          objective.status = data.status;
          objective.evidence = data.evidence;
          objective.managerComments = data.comments;
        }
      }
      return pip!;
    }
    const response = await fetch(`/api/hr/performance/pips/${pipId}/objectives/${objectiveId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async extendPIP(id: string, newEndDate: string, reason: string): Promise<PerformanceImprovementPlan> {
    if (USE_MOCK_DATA) {
      const pip = mockPIPs.find(p => p.id === id);
      if (pip) {
        pip.currentEndDate = newEndDate;
        pip.extensionCount += 1;
        pip.status = PIPStatus.EXTENDED;
      }
      return pip!;
    }
    const response = await fetch(`/api/hr/performance/pips/${id}/extend`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newEndDate, reason }),
    });
    return response.json();
  }

  static async concludePIP(id: string, outcome: 'success' | 'failure', notes: string): Promise<PerformanceImprovementPlan> {
    if (USE_MOCK_DATA) {
      const pip = mockPIPs.find(p => p.id === id);
      if (pip) {
        pip.status = outcome === 'success' ? PIPStatus.COMPLETED_SUCCESS : PIPStatus.COMPLETED_FAILURE;
        pip.outcome = outcome;
        pip.outcomeDate = new Date().toISOString().split('T')[0];
        pip.outcomeNotes = notes;
      }
      return pip!;
    }
    const response = await fetch(`/api/hr/performance/pips/${id}/conclude`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outcome, notes }),
    });
    return response.json();
  }

  // ========== Dashboard & Reports ==========

  static async getDashboard(employeeId?: string): Promise<PerformanceDashboard> {
    if (USE_MOCK_DATA) {
      return {
        goalsOverview: {
          totalGoals: mockGoals.length,
          completedGoals: mockGoals.filter(g => g.status === GoalStatus.COMPLETED).length,
          inProgressGoals: mockGoals.filter(g => g.status === GoalStatus.IN_PROGRESS).length,
          overdueGoals: 1,
          averageProgress: mockGoals.reduce((sum, g) => sum + g.progress, 0) / mockGoals.length,
        },
        reviewsOverview: {
          totalReviews: mockReviews.length,
          completedReviews: mockReviews.filter(r => r.status === ReviewStatus.COMPLETED || r.status === ReviewStatus.ACKNOWLEDGED).length,
          pendingReviews: mockReviews.filter(r => r.status !== ReviewStatus.COMPLETED && r.status !== ReviewStatus.ACKNOWLEDGED).length,
          averageRating: 4.0,
        },
        feedbackStats: {
          givenCount: 5,
          receivedCount: 8,
          pendingRequests: 2,
        },
        kpiStats: {
          totalKPIs: mockKPIAssignments.length,
          onTrack: 1,
          atRisk: 1,
          offTrack: 0,
        },
        recentActivity: [
          { id: '1', type: 'goal_progress', title: 'Goal progress updated', description: 'Sales Revenue goal progress updated to 75%', timestamp: '2024-11-10T10:00:00Z' },
          { id: '2', type: 'feedback_received', title: 'New feedback received', description: 'Received positive feedback from Mike Johnson', timestamp: '2024-11-05T10:30:00Z' },
          { id: '3', type: 'review_submitted', title: 'Self appraisal submitted', description: 'Q4 2024 self appraisal submitted', timestamp: '2024-11-10T14:00:00Z' },
        ],
      };
    }
    const params = employeeId ? `?employeeId=${employeeId}` : '';
    const response = await fetch(`/api/hr/performance/dashboard${params}`);
    return response.json();
  }

  static async getRatingDistribution(cycleId: string): Promise<RatingDistribution[]> {
    if (USE_MOCK_DATA) {
      return [
        { rating: 5, label: 'Exceptional', count: 10, percentage: 6.7 },
        { rating: 4, label: 'Exceeds Expectations', count: 45, percentage: 30 },
        { rating: 3, label: 'Meets Expectations', count: 75, percentage: 50 },
        { rating: 2, label: 'Needs Improvement', count: 15, percentage: 10 },
        { rating: 1, label: 'Unsatisfactory', count: 5, percentage: 3.3 },
      ];
    }
    const response = await fetch(`/api/hr/performance/reports/rating-distribution?cycleId=${cycleId}`);
    return response.json();
  }

  static async getDepartmentPerformance(): Promise<DepartmentPerformance[]> {
    if (USE_MOCK_DATA) {
      return [
        { departmentId: 'D001', departmentName: 'Sales', employeeCount: 25, averageRating: 3.8, goalsCompletion: 82, kpiAchievement: 95, ratingDistribution: [] },
        { departmentId: 'D002', departmentName: 'Engineering', employeeCount: 40, averageRating: 3.5, goalsCompletion: 75, kpiAchievement: 88, ratingDistribution: [] },
        { departmentId: 'D003', departmentName: 'Customer Success', employeeCount: 15, averageRating: 4.1, goalsCompletion: 90, kpiAchievement: 102, ratingDistribution: [] },
        { departmentId: 'D004', departmentName: 'HR', employeeCount: 8, averageRating: 3.9, goalsCompletion: 85, kpiAchievement: 96, ratingDistribution: [] },
      ];
    }
    const response = await fetch('/api/hr/performance/reports/department-performance');
    return response.json();
  }

  static async getPerformanceTrendAnalysis(options?: {
    employeeId?: string;
    departmentId?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<{ period: string; averageRating: number; goalsCompletion: number }[]> {
    if (USE_MOCK_DATA) {
      return [
        { period: 'Q1 2024', averageRating: 3.6, goalsCompletion: 78 },
        { period: 'Q2 2024', averageRating: 3.7, goalsCompletion: 82 },
        { period: 'Q3 2024', averageRating: 3.8, goalsCompletion: 85 },
        { period: 'Q4 2024', averageRating: 3.9, goalsCompletion: 88 },
      ];
    }
    const params = new URLSearchParams();
    if (options?.employeeId) params.append('employeeId', options.employeeId);
    if (options?.departmentId) params.append('departmentId', options.departmentId);
    if (options?.fromDate) params.append('fromDate', options.fromDate);
    if (options?.toDate) params.append('toDate', options.toDate);
    const response = await fetch(`/api/hr/performance/reports/trend-analysis?${params.toString()}`);
    return response.json();
  }
}
