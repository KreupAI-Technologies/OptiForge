// Corrective and Preventive Action (CAPA) Service
// Handles CAPA operations for the Quality Module

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ==================== ENUMS ====================

export enum CAPAStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  INITIATED = 'initiated',
  IN_PROGRESS = 'in_progress',
  IMPLEMENTATION = 'implementation',
  VERIFICATION = 'verification',
  EFFECTIVENESS_REVIEW = 'effectiveness_review',
  CLOSED = 'closed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum CAPAType {
  CORRECTIVE = 'corrective',
  PREVENTIVE = 'preventive',
  BOTH = 'both',
}

export enum CAPASource {
  NCR = 'ncr',
  AUDIT = 'audit',
  CUSTOMER_COMPLAINT = 'customer_complaint',
  INSPECTION = 'inspection',
  MANAGEMENT_REVIEW = 'management_review',
  INTERNAL_OBSERVATION = 'internal_observation',
  SUPPLIER_ISSUE = 'supplier_issue',
  REGULATORY = 'regulatory',
  CONTINUOUS_IMPROVEMENT = 'continuous_improvement',
  OTHER = 'other',
}

export enum CAPAPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum ActionStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled',
}

// ==================== INTERFACES ====================

export interface CAPAAction {
  id: string;
  sequence: number;
  type: 'root_cause' | 'corrective' | 'preventive' | 'verification';
  description: string;
  expectedOutcome: string;
  assignedTo: string;
  assignedToName: string;
  department?: string;
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  status: ActionStatus;
  completionPercentage: number;
  evidence?: string[];
  resources?: string[];
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  verifiedBy?: string;
  verifiedDate?: Date;
  verificationNotes?: string;
}

export interface RootCauseAnalysis {
  method: string;
  description: string;
  problemStatement: string;
  findings: string[];
  rootCause: string;
  contributingFactors: string[];
  impactAnalysis: string;
  analyzedBy: string;
  analyzedDate: Date;
  reviewedBy?: string;
  reviewedDate?: Date;
  attachments?: string[];
}

export interface EffectivenessReview {
  id: string;
  reviewDate: Date;
  reviewedBy: string;
  reviewerName: string;
  criteria: string[];
  metricsEvaluated: {
    metric: string;
    targetValue: string;
    actualValue: string;
    status: 'met' | 'not_met' | 'partially_met';
    comments?: string;
  }[];
  recurrenceCheck: boolean;
  recurrenceDetails?: string;
  overallEffective: boolean;
  additionalActionsRequired: boolean;
  additionalActions?: string[];
  conclusion: string;
  nextReviewDate?: Date;
}

export interface CAPAAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: Date;
  uploadedBy: string;
  category: 'evidence' | 'document' | 'photo' | 'report' | 'procedure';
}

export interface CAPAApproval {
  id: string;
  stage: 'initiation' | 'implementation' | 'closure';
  approver: string;
  approverName: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedDate: Date;
  actionDate?: Date;
  comments?: string;
}

export interface CAPA {
  id: string;
  capaNumber: string;
  title: string;
  description: string;
  status: CAPAStatus;
  type: CAPAType;
  source: CAPASource;
  priority: CAPAPriority;

  // Source Reference
  sourceId?: string;
  sourceReference?: string;
  ncrId?: string;
  ncrNumber?: string;
  auditId?: string;
  auditReference?: string;

  // Problem Definition
  problemStatement: string;
  impactDescription: string;
  affectedAreas: string[];
  affectedProducts?: string[];
  affectedProcesses?: string[];

  // Root Cause Analysis
  rootCauseAnalysis?: RootCauseAnalysis;

  // Actions
  actions: CAPAAction[];
  totalActions: number;
  completedActions: number;
  overallProgress: number;

  // Timeline
  targetCompletionDate: Date;
  actualCompletionDate?: Date;
  initiatedDate?: Date;
  implementationStartDate?: Date;
  verificationStartDate?: Date;

  // Cost Tracking
  estimatedCost?: number;
  actualCost?: number;
  costSavings?: number;

  // Personnel
  ownerId: string;
  ownerName: string;
  ownerDepartment: string;
  sponsorId?: string;
  sponsorName?: string;
  teamMembers?: { id: string; name: string; role: string }[];

  // Approvals
  approvals: CAPAApproval[];

  // Effectiveness Review
  effectivenessReviews: EffectivenessReview[];
  effectivenessVerified: boolean;
  effectivenessVerifiedDate?: Date;
  effectivenessVerifiedBy?: string;

  // Risk Assessment
  riskLevel?: 'high' | 'medium' | 'low';
  riskMitigation?: string;

  // Documentation
  relatedProcedures?: string[];
  updatedProcedures?: string[];
  trainingRequired?: boolean;
  trainingCompleted?: boolean;
  trainingDetails?: string;

  // Attachments
  attachments: CAPAAttachment[];

  // Notes and Comments
  notes?: string;
  internalComments?: string;

  // Closure
  closedBy?: string;
  closedByName?: string;
  closedDate?: Date;
  closureNotes?: string;
  lessonsLearned?: string;

  // Audit Fields
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface CreateCAPADto {
  title: string;
  description: string;
  type: CAPAType;
  source: CAPASource;
  priority: CAPAPriority;
  sourceId?: string;
  sourceReference?: string;
  ncrId?: string;
  ncrNumber?: string;
  problemStatement: string;
  impactDescription: string;
  affectedAreas: string[];
  affectedProducts?: string[];
  affectedProcesses?: string[];
  targetCompletionDate: Date;
  ownerId: string;
  ownerName: string;
  ownerDepartment: string;
  sponsorId?: string;
  sponsorName?: string;
  estimatedCost?: number;
  riskLevel?: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface UpdateCAPADto extends Partial<CreateCAPADto> {
  status?: CAPAStatus;
  rootCauseAnalysis?: RootCauseAnalysis;
  actions?: CAPAAction[];
  teamMembers?: { id: string; name: string; role: string }[];
  closureNotes?: string;
  lessonsLearned?: string;
}

export interface CAPAFilters {
  status?: CAPAStatus;
  type?: CAPAType;
  source?: CAPASource;
  priority?: CAPAPriority;
  ownerId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

// ==================== MOCK DATA ====================

export const MOCK_CAPAS: CAPA[] = [
  {
    id: 'capa-001',
    capaNumber: 'CAPA-2024-0001',
    title: 'CNC Tool Wear Monitoring Process Improvement',
    description: 'Implement improved tool wear monitoring and replacement procedures to prevent dimensional non-conformances.',
    status: CAPAStatus.IN_PROGRESS,
    type: CAPAType.CORRECTIVE,
    source: CAPASource.NCR,
    priority: CAPAPriority.HIGH,
    sourceId: 'ncr-001',
    sourceReference: 'NCR-2024-0001',
    ncrId: 'ncr-001',
    ncrNumber: 'NCR-2024-0001',
    problemStatement: 'Dimensional non-conformances in steel shaft assemblies due to undetected CNC tool wear.',
    impactDescription: 'Product quality affected. Rework and scrap costs incurred. Production schedule delays.',
    affectedAreas: ['Production', 'Quality Control', 'Maintenance'],
    affectedProducts: ['Steel Shaft Assembly - SSA-100'],
    affectedProcesses: ['CNC Machining', 'Tool Management'],
    rootCauseAnalysis: {
      method: '5-Why Analysis',
      description: 'Root cause analysis to identify why dimensional non-conformance occurred',
      problemStatement: 'CNC machined parts exceeded dimensional tolerance limits',
      findings: [
        'Tool wear exceeded tolerance limits',
        'Scheduled tool change was missed',
        'Operator not trained on wear monitoring indicators',
        'Tool wear monitoring system was offline',
      ],
      rootCause: 'Inadequate tool wear monitoring process and training gaps',
      contributingFactors: [
        'Heavy production schedule pressure',
        'Tool monitoring system maintenance overdue',
        'Inconsistent tool change documentation',
      ],
      impactAnalysis: '5 parts non-conforming, $770 in rework/scrap costs, 4-hour production delay',
      analyzedBy: 'emp-004',
      analyzedDate: new Date('2024-01-19'),
      reviewedBy: 'emp-002',
      reviewedDate: new Date('2024-01-20'),
    },
    actions: [
      {
        id: 'act-001',
        sequence: 1,
        type: 'root_cause',
        description: 'Complete root cause analysis and document findings',
        expectedOutcome: 'Clear understanding of failure mode and root cause',
        assignedTo: 'emp-004',
        assignedToName: 'David Brown',
        department: 'Quality',
        plannedStartDate: new Date('2024-01-18'),
        plannedEndDate: new Date('2024-01-20'),
        actualStartDate: new Date('2024-01-18'),
        actualEndDate: new Date('2024-01-20'),
        status: ActionStatus.COMPLETED,
        completionPercentage: 100,
        evidence: ['5-why-analysis.pdf', 'rca-findings.docx'],
        estimatedCost: 0,
        actualCost: 0,
        verifiedBy: 'emp-002',
        verifiedDate: new Date('2024-01-20'),
        verificationNotes: 'Root cause analysis complete and verified',
      },
      {
        id: 'act-002',
        sequence: 2,
        type: 'corrective',
        description: 'Repair and calibrate tool wear monitoring system',
        expectedOutcome: 'Monitoring system fully operational with accurate readings',
        assignedTo: 'emp-005',
        assignedToName: 'James Taylor',
        department: 'Maintenance',
        plannedStartDate: new Date('2024-01-21'),
        plannedEndDate: new Date('2024-01-23'),
        actualStartDate: new Date('2024-01-21'),
        actualEndDate: new Date('2024-01-22'),
        status: ActionStatus.COMPLETED,
        completionPercentage: 100,
        evidence: ['calibration-cert.pdf', 'system-test-report.pdf'],
        estimatedCost: 500,
        actualCost: 450,
        verifiedBy: 'emp-002',
        verifiedDate: new Date('2024-01-23'),
        verificationNotes: 'System operational and validated',
      },
      {
        id: 'act-003',
        sequence: 3,
        type: 'corrective',
        description: 'Update tool change procedure with mandatory wear checks',
        expectedOutcome: 'Revised procedure requiring wear verification before continuing production',
        assignedTo: 'emp-010',
        assignedToName: 'Jennifer Lee',
        department: 'Engineering',
        plannedStartDate: new Date('2024-01-22'),
        plannedEndDate: new Date('2024-01-25'),
        actualStartDate: new Date('2024-01-22'),
        status: ActionStatus.IN_PROGRESS,
        completionPercentage: 75,
        estimatedCost: 0,
        notes: 'Draft procedure under review',
      },
      {
        id: 'act-004',
        sequence: 4,
        type: 'corrective',
        description: 'Train all CNC operators on updated procedure and wear monitoring',
        expectedOutcome: 'All operators certified on new procedure',
        assignedTo: 'emp-012',
        assignedToName: 'Mark Anderson',
        department: 'Production',
        plannedStartDate: new Date('2024-01-26'),
        plannedEndDate: new Date('2024-01-30'),
        status: ActionStatus.NOT_STARTED,
        completionPercentage: 0,
        estimatedCost: 300,
        resources: ['Training room', 'Training materials'],
      },
      {
        id: 'act-005',
        sequence: 5,
        type: 'preventive',
        description: 'Implement automated tool wear alerts in machine monitoring system',
        expectedOutcome: 'Automatic alerts when tool wear approaches limits',
        assignedTo: 'emp-005',
        assignedToName: 'James Taylor',
        department: 'Maintenance',
        plannedStartDate: new Date('2024-01-28'),
        plannedEndDate: new Date('2024-02-05'),
        status: ActionStatus.NOT_STARTED,
        completionPercentage: 0,
        estimatedCost: 1500,
      },
      {
        id: 'act-006',
        sequence: 6,
        type: 'verification',
        description: 'Monitor process for 30 days and verify no recurrence',
        expectedOutcome: 'No dimensional non-conformances from tool wear issues',
        assignedTo: 'emp-001',
        assignedToName: 'John Smith',
        department: 'Quality',
        plannedStartDate: new Date('2024-02-06'),
        plannedEndDate: new Date('2024-03-07'),
        status: ActionStatus.NOT_STARTED,
        completionPercentage: 0,
        estimatedCost: 0,
      },
    ],
    totalActions: 6,
    completedActions: 2,
    overallProgress: 45,
    targetCompletionDate: new Date('2024-03-07'),
    initiatedDate: new Date('2024-01-18'),
    implementationStartDate: new Date('2024-01-21'),
    estimatedCost: 2300,
    actualCost: 450,
    ownerId: 'emp-004',
    ownerName: 'David Brown',
    ownerDepartment: 'Quality',
    sponsorId: 'emp-013',
    sponsorName: 'Patricia White',
    teamMembers: [
      { id: 'emp-001', name: 'John Smith', role: 'QC Inspector' },
      { id: 'emp-005', name: 'James Taylor', role: 'Maintenance Lead' },
      { id: 'emp-010', name: 'Jennifer Lee', role: 'Process Engineer' },
    ],
    approvals: [
      {
        id: 'appr-001',
        stage: 'initiation',
        approver: 'emp-002',
        approverName: 'Sarah Johnson',
        approverRole: 'QC Manager',
        status: 'approved',
        requestedDate: new Date('2024-01-18'),
        actionDate: new Date('2024-01-18'),
        comments: 'Approved. Priority action required.',
      },
    ],
    effectivenessReviews: [],
    effectivenessVerified: false,
    riskLevel: 'medium',
    riskMitigation: 'Interim 100% inspection until CAPA closure',
    relatedProcedures: ['PRO-MFG-015 Tool Change Procedure'],
    trainingRequired: true,
    trainingCompleted: false,
    attachments: [
      {
        id: 'att-capa-001',
        fileName: 'root-cause-analysis.pdf',
        fileType: 'application/pdf',
        fileSize: 450000,
        fileUrl: '/attachments/capa-001/root-cause-analysis.pdf',
        uploadedAt: new Date('2024-01-20'),
        uploadedBy: 'emp-004',
        category: 'document',
      },
    ],
    notes: 'High priority CAPA linked to production quality issue',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-23'),
    createdBy: 'emp-004',
    updatedBy: 'emp-004',
  },
  {
    id: 'capa-002',
    capaNumber: 'CAPA-2024-0002',
    title: 'Supplier Quality Improvement - ABC Foundry',
    description: 'Address recurring quality issues with cast iron valve bodies from supplier ABC Foundry.',
    status: CAPAStatus.INITIATED,
    type: CAPAType.BOTH,
    source: CAPASource.SUPPLIER_ISSUE,
    priority: CAPAPriority.CRITICAL,
    sourceId: 'ncr-002',
    sourceReference: 'NCR-2024-0002',
    ncrId: 'ncr-002',
    ncrNumber: 'NCR-2024-0002',
    problemStatement: 'Multiple defects including porosity and dimensional issues in cast iron valve bodies from ABC Foundry.',
    impactDescription: 'Production schedule at risk. Material shortage possible. Significant quality costs.',
    affectedAreas: ['Supply Chain', 'Quality Control', 'Production Planning'],
    affectedProducts: ['Cast Iron Valve Body - CIV-500'],
    affectedProcesses: ['Incoming Inspection', 'Supplier Management'],
    actions: [
      {
        id: 'act-007',
        sequence: 1,
        type: 'root_cause',
        description: 'Request and review supplier 8D report',
        expectedOutcome: 'Understanding of supplier root cause and corrective actions',
        assignedTo: 'emp-006',
        assignedToName: 'Lisa Anderson',
        department: 'Supply Chain',
        plannedStartDate: new Date('2024-01-20'),
        plannedEndDate: new Date('2024-01-27'),
        actualStartDate: new Date('2024-01-20'),
        status: ActionStatus.IN_PROGRESS,
        completionPercentage: 50,
        estimatedCost: 0,
        notes: 'Supplier 8D in progress. Due date: Jan 27',
      },
      {
        id: 'act-008',
        sequence: 2,
        type: 'corrective',
        description: 'Conduct on-site supplier quality audit',
        expectedOutcome: 'Identify process gaps and improvement opportunities',
        assignedTo: 'emp-002',
        assignedToName: 'Sarah Johnson',
        department: 'Quality',
        plannedStartDate: new Date('2024-01-28'),
        plannedEndDate: new Date('2024-01-30'),
        status: ActionStatus.NOT_STARTED,
        completionPercentage: 0,
        estimatedCost: 2000,
        resources: ['Travel', 'Audit checklist'],
      },
      {
        id: 'act-009',
        sequence: 3,
        type: 'preventive',
        description: 'Update supplier quality agreement with enhanced requirements',
        expectedOutcome: 'Strengthened quality requirements and penalties',
        assignedTo: 'emp-006',
        assignedToName: 'Lisa Anderson',
        department: 'Supply Chain',
        plannedStartDate: new Date('2024-02-01'),
        plannedEndDate: new Date('2024-02-10'),
        status: ActionStatus.NOT_STARTED,
        completionPercentage: 0,
        estimatedCost: 0,
      },
      {
        id: 'act-010',
        sequence: 4,
        type: 'preventive',
        description: 'Qualify backup supplier for critical components',
        expectedOutcome: 'Alternative supply source approved and ready',
        assignedTo: 'emp-006',
        assignedToName: 'Lisa Anderson',
        department: 'Supply Chain',
        plannedStartDate: new Date('2024-02-01'),
        plannedEndDate: new Date('2024-03-15'),
        status: ActionStatus.NOT_STARTED,
        completionPercentage: 0,
        estimatedCost: 5000,
      },
    ],
    totalActions: 4,
    completedActions: 0,
    overallProgress: 12,
    targetCompletionDate: new Date('2024-03-15'),
    initiatedDate: new Date('2024-01-20'),
    estimatedCost: 7000,
    ownerId: 'emp-006',
    ownerName: 'Lisa Anderson',
    ownerDepartment: 'Supply Chain',
    sponsorId: 'emp-014',
    sponsorName: 'Michael Green',
    teamMembers: [
      { id: 'emp-002', name: 'Sarah Johnson', role: 'QC Manager' },
      { id: 'emp-003', name: 'Mike Wilson', role: 'QC Inspector' },
    ],
    approvals: [
      {
        id: 'appr-002',
        stage: 'initiation',
        approver: 'emp-014',
        approverName: 'Michael Green',
        approverRole: 'Supply Chain Director',
        status: 'approved',
        requestedDate: new Date('2024-01-20'),
        actionDate: new Date('2024-01-20'),
        comments: 'Critical issue. Full support for backup supplier qualification.',
      },
    ],
    effectivenessReviews: [],
    effectivenessVerified: false,
    riskLevel: 'high',
    riskMitigation: 'Enhanced incoming inspection, expedite backup supplier qualification',
    trainingRequired: false,
    attachments: [],
    notes: 'Second occurrence with this supplier. Consider supplier rating downgrade if not resolved.',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-22'),
    createdBy: 'emp-006',
    updatedBy: 'emp-006',
  },
  {
    id: 'capa-003',
    capaNumber: 'CAPA-2024-0003',
    title: 'CMM Calibration Verification Process Improvement',
    description: 'Improve CMM calibration verification frequency and environmental controls.',
    status: CAPAStatus.APPROVED,
    type: CAPAType.PREVENTIVE,
    source: CAPASource.NCR,
    priority: CAPAPriority.HIGH,
    sourceId: 'ncr-005',
    sourceReference: 'NCR-2024-0005',
    ncrId: 'ncr-005',
    ncrNumber: 'NCR-2024-0005',
    problemStatement: 'CMM calibration drift went undetected for 2 weeks, potentially affecting measurement accuracy.',
    impactDescription: 'Risk of undetected non-conforming parts. Re-inspection required for 15 batches.',
    affectedAreas: ['Quality Lab', 'Maintenance', 'Production'],
    affectedProcesses: ['Calibration Management', 'Dimensional Inspection'],
    actions: [
      {
        id: 'act-011',
        sequence: 1,
        type: 'corrective',
        description: 'Repair CMM air bearing and recalibrate',
        expectedOutcome: 'CMM restored to full accuracy',
        assignedTo: 'emp-011',
        assignedToName: 'Thomas Brown',
        department: 'Quality Lab',
        plannedStartDate: new Date('2024-01-22'),
        plannedEndDate: new Date('2024-01-25'),
        status: ActionStatus.NOT_STARTED,
        completionPercentage: 0,
        estimatedCost: 3500,
      },
      {
        id: 'act-012',
        sequence: 2,
        type: 'preventive',
        description: 'Reduce calibration verification interval from monthly to weekly',
        expectedOutcome: 'Earlier detection of any calibration drift',
        assignedTo: 'emp-011',
        assignedToName: 'Thomas Brown',
        department: 'Quality Lab',
        plannedStartDate: new Date('2024-01-26'),
        plannedEndDate: new Date('2024-01-28'),
        status: ActionStatus.NOT_STARTED,
        completionPercentage: 0,
        estimatedCost: 0,
      },
      {
        id: 'act-013',
        sequence: 3,
        type: 'preventive',
        description: 'Install dedicated HVAC system for CMM room with temperature monitoring',
        expectedOutcome: 'Stable temperature environment for CMM operation',
        assignedTo: 'emp-015',
        assignedToName: 'Richard Moore',
        department: 'Facilities',
        plannedStartDate: new Date('2024-02-01'),
        plannedEndDate: new Date('2024-02-28'),
        status: ActionStatus.NOT_STARTED,
        completionPercentage: 0,
        estimatedCost: 15000,
      },
    ],
    totalActions: 3,
    completedActions: 0,
    overallProgress: 0,
    targetCompletionDate: new Date('2024-02-28'),
    estimatedCost: 18500,
    ownerId: 'emp-011',
    ownerName: 'Thomas Brown',
    ownerDepartment: 'Quality Lab',
    sponsorId: 'emp-002',
    sponsorName: 'Sarah Johnson',
    teamMembers: [
      { id: 'emp-015', name: 'Richard Moore', role: 'Facilities Manager' },
    ],
    approvals: [
      {
        id: 'appr-003',
        stage: 'initiation',
        approver: 'emp-002',
        approverName: 'Sarah Johnson',
        approverRole: 'QC Manager',
        status: 'approved',
        requestedDate: new Date('2024-01-22'),
        actionDate: new Date('2024-01-22'),
        comments: 'Approved. Capital expenditure for HVAC to be fast-tracked.',
      },
    ],
    effectivenessReviews: [],
    effectivenessVerified: false,
    riskLevel: 'medium',
    trainingRequired: true,
    trainingCompleted: false,
    trainingDetails: 'Updated calibration verification procedure training for lab technicians',
    attachments: [],
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
    createdBy: 'emp-011',
    updatedBy: 'emp-011',
  },
  {
    id: 'capa-004',
    capaNumber: 'CAPA-2024-0004',
    title: 'Assembly Torque Verification Process',
    description: 'Implement torque verification checkpoints to prevent assembly errors.',
    status: CAPAStatus.VERIFICATION,
    type: CAPAType.PREVENTIVE,
    source: CAPASource.INTERNAL_OBSERVATION,
    priority: CAPAPriority.MEDIUM,
    sourceReference: 'INT-2024-0025',
    problemStatement: 'Risk of incorrect torque application identified during process audit.',
    impactDescription: 'Potential product failures if fasteners not properly tightened.',
    affectedAreas: ['Production', 'Assembly'],
    affectedProcesses: ['Final Assembly', 'Torque Application'],
    rootCauseAnalysis: {
      method: 'Process FMEA',
      description: 'FMEA analysis of torque application process',
      problemStatement: 'Risk of under/over torqued fasteners in assembly',
      findings: [
        'Manual torque wrenches without verification',
        'No torque recording for traceability',
        'Operator technique variations',
      ],
      rootCause: 'Lack of automated torque verification and recording system',
      contributingFactors: ['Manual process', 'No real-time feedback'],
      impactAnalysis: 'Potential warranty claims and safety concerns',
      analyzedBy: 'emp-010',
      analyzedDate: new Date('2024-01-10'),
    },
    actions: [
      {
        id: 'act-014',
        sequence: 1,
        type: 'preventive',
        description: 'Procure and install electronic torque wrenches with data logging',
        expectedOutcome: 'Automated torque verification and recording for each fastener',
        assignedTo: 'emp-005',
        assignedToName: 'James Taylor',
        department: 'Maintenance',
        plannedStartDate: new Date('2024-01-12'),
        plannedEndDate: new Date('2024-01-18'),
        actualStartDate: new Date('2024-01-12'),
        actualEndDate: new Date('2024-01-17'),
        status: ActionStatus.COMPLETED,
        completionPercentage: 100,
        estimatedCost: 8000,
        actualCost: 7500,
        verifiedBy: 'emp-010',
        verifiedDate: new Date('2024-01-18'),
      },
      {
        id: 'act-015',
        sequence: 2,
        type: 'preventive',
        description: 'Update work instructions with torque verification steps',
        expectedOutcome: 'Clear procedures for operators',
        assignedTo: 'emp-010',
        assignedToName: 'Jennifer Lee',
        department: 'Engineering',
        plannedStartDate: new Date('2024-01-15'),
        plannedEndDate: new Date('2024-01-18'),
        actualStartDate: new Date('2024-01-15'),
        actualEndDate: new Date('2024-01-18'),
        status: ActionStatus.COMPLETED,
        completionPercentage: 100,
        verifiedBy: 'emp-002',
        verifiedDate: new Date('2024-01-19'),
      },
      {
        id: 'act-016',
        sequence: 3,
        type: 'preventive',
        description: 'Train assembly operators on new equipment and procedures',
        expectedOutcome: 'All operators competent with new system',
        assignedTo: 'emp-012',
        assignedToName: 'Mark Anderson',
        department: 'Production',
        plannedStartDate: new Date('2024-01-19'),
        plannedEndDate: new Date('2024-01-22'),
        actualStartDate: new Date('2024-01-19'),
        actualEndDate: new Date('2024-01-21'),
        status: ActionStatus.COMPLETED,
        completionPercentage: 100,
        verifiedBy: 'emp-010',
        verifiedDate: new Date('2024-01-22'),
      },
      {
        id: 'act-017',
        sequence: 4,
        type: 'verification',
        description: 'Monitor process for 2 weeks and verify effectiveness',
        expectedOutcome: 'No torque-related issues, 100% data capture rate',
        assignedTo: 'emp-001',
        assignedToName: 'John Smith',
        department: 'Quality',
        plannedStartDate: new Date('2024-01-22'),
        plannedEndDate: new Date('2024-02-05'),
        actualStartDate: new Date('2024-01-22'),
        status: ActionStatus.IN_PROGRESS,
        completionPercentage: 70,
        notes: 'Monitoring in progress. No issues reported so far.',
      },
    ],
    totalActions: 4,
    completedActions: 3,
    overallProgress: 85,
    targetCompletionDate: new Date('2024-02-05'),
    initiatedDate: new Date('2024-01-12'),
    implementationStartDate: new Date('2024-01-12'),
    verificationStartDate: new Date('2024-01-22'),
    estimatedCost: 8000,
    actualCost: 7500,
    ownerId: 'emp-010',
    ownerName: 'Jennifer Lee',
    ownerDepartment: 'Engineering',
    approvals: [
      {
        id: 'appr-004',
        stage: 'initiation',
        approver: 'emp-013',
        approverName: 'Patricia White',
        approverRole: 'Operations Manager',
        status: 'approved',
        requestedDate: new Date('2024-01-11'),
        actionDate: new Date('2024-01-11'),
      },
      {
        id: 'appr-005',
        stage: 'implementation',
        approver: 'emp-002',
        approverName: 'Sarah Johnson',
        approverRole: 'QC Manager',
        status: 'approved',
        requestedDate: new Date('2024-01-22'),
        actionDate: new Date('2024-01-22'),
        comments: 'Implementation complete. Proceed with verification.',
      },
    ],
    effectivenessReviews: [],
    effectivenessVerified: false,
    riskLevel: 'low',
    relatedProcedures: ['PRO-ASM-008 Fastener Assembly'],
    updatedProcedures: ['PRO-ASM-008 Rev B Fastener Assembly with Torque Verification'],
    trainingRequired: true,
    trainingCompleted: true,
    trainingDetails: '12 operators trained on electronic torque wrench system',
    attachments: [],
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-22'),
    createdBy: 'emp-010',
    updatedBy: 'emp-001',
  },
  {
    id: 'capa-005',
    capaNumber: 'CAPA-2024-0005',
    title: 'Customer Returns Handling Process Improvement',
    description: 'Streamline customer returns investigation and response process.',
    status: CAPAStatus.CLOSED,
    type: CAPAType.BOTH,
    source: CAPASource.MANAGEMENT_REVIEW,
    priority: CAPAPriority.MEDIUM,
    sourceReference: 'MGT-REV-2024-Q1',
    problemStatement: 'Customer returns investigation time averaging 15 days, target is 5 days.',
    impactDescription: 'Customer satisfaction impacted. Response time exceeds commitments.',
    affectedAreas: ['Customer Service', 'Quality', 'Engineering'],
    affectedProcesses: ['Returns Investigation', 'Customer Communication'],
    rootCauseAnalysis: {
      method: 'Process Mapping',
      description: 'Analysis of current returns handling process',
      problemStatement: 'Returns investigation takes too long',
      findings: [
        'Multiple handoffs between departments',
        'No standard investigation checklist',
        'Delayed receipt of returned items',
        'Root cause analysis not prioritized',
      ],
      rootCause: 'Inefficient process with unclear ownership and no standard workflow',
      contributingFactors: ['Competing priorities', 'Limited cross-functional coordination'],
      impactAnalysis: 'Average 10 day delay in customer response, NPS impact',
      analyzedBy: 'emp-007',
      analyzedDate: new Date('2024-01-05'),
    },
    actions: [
      {
        id: 'act-018',
        sequence: 1,
        type: 'corrective',
        description: 'Create dedicated returns investigation team',
        expectedOutcome: 'Clear ownership and faster response',
        assignedTo: 'emp-007',
        assignedToName: 'Robert Chen',
        department: 'Customer Service',
        plannedStartDate: new Date('2024-01-08'),
        plannedEndDate: new Date('2024-01-10'),
        actualStartDate: new Date('2024-01-08'),
        actualEndDate: new Date('2024-01-10'),
        status: ActionStatus.COMPLETED,
        completionPercentage: 100,
        verifiedBy: 'emp-002',
        verifiedDate: new Date('2024-01-11'),
      },
      {
        id: 'act-019',
        sequence: 2,
        type: 'corrective',
        description: 'Develop standard investigation checklist and workflow',
        expectedOutcome: 'Consistent investigation process',
        assignedTo: 'emp-002',
        assignedToName: 'Sarah Johnson',
        department: 'Quality',
        plannedStartDate: new Date('2024-01-08'),
        plannedEndDate: new Date('2024-01-12'),
        actualStartDate: new Date('2024-01-08'),
        actualEndDate: new Date('2024-01-11'),
        status: ActionStatus.COMPLETED,
        completionPercentage: 100,
        verifiedBy: 'emp-007',
        verifiedDate: new Date('2024-01-12'),
      },
      {
        id: 'act-020',
        sequence: 3,
        type: 'preventive',
        description: 'Implement returns tracking dashboard',
        expectedOutcome: 'Real-time visibility of all open returns',
        assignedTo: 'emp-016',
        assignedToName: 'Anna Wilson',
        department: 'IT',
        plannedStartDate: new Date('2024-01-10'),
        plannedEndDate: new Date('2024-01-17'),
        actualStartDate: new Date('2024-01-10'),
        actualEndDate: new Date('2024-01-16'),
        status: ActionStatus.COMPLETED,
        completionPercentage: 100,
        estimatedCost: 2000,
        actualCost: 1800,
        verifiedBy: 'emp-007',
        verifiedDate: new Date('2024-01-17'),
      },
      {
        id: 'act-021',
        sequence: 4,
        type: 'verification',
        description: 'Monitor response time for 4 weeks',
        expectedOutcome: 'Average investigation time < 5 days',
        assignedTo: 'emp-007',
        assignedToName: 'Robert Chen',
        department: 'Customer Service',
        plannedStartDate: new Date('2024-01-18'),
        plannedEndDate: new Date('2024-02-15'),
        actualStartDate: new Date('2024-01-18'),
        actualEndDate: new Date('2024-02-15'),
        status: ActionStatus.COMPLETED,
        completionPercentage: 100,
        verifiedBy: 'emp-002',
        verifiedDate: new Date('2024-02-16'),
        verificationNotes: 'Average response time reduced to 3.5 days. Target met.',
      },
    ],
    totalActions: 4,
    completedActions: 4,
    overallProgress: 100,
    targetCompletionDate: new Date('2024-02-15'),
    actualCompletionDate: new Date('2024-02-16'),
    initiatedDate: new Date('2024-01-08'),
    implementationStartDate: new Date('2024-01-08'),
    verificationStartDate: new Date('2024-01-18'),
    estimatedCost: 2000,
    actualCost: 1800,
    costSavings: 5000,
    ownerId: 'emp-007',
    ownerName: 'Robert Chen',
    ownerDepartment: 'Customer Service',
    sponsorId: 'emp-017',
    sponsorName: 'Elizabeth Taylor',
    approvals: [
      {
        id: 'appr-006',
        stage: 'initiation',
        approver: 'emp-017',
        approverName: 'Elizabeth Taylor',
        approverRole: 'Customer Service Director',
        status: 'approved',
        requestedDate: new Date('2024-01-07'),
        actionDate: new Date('2024-01-07'),
      },
      {
        id: 'appr-007',
        stage: 'closure',
        approver: 'emp-002',
        approverName: 'Sarah Johnson',
        approverRole: 'QC Manager',
        status: 'approved',
        requestedDate: new Date('2024-02-16'),
        actionDate: new Date('2024-02-16'),
        comments: 'CAPA successful. Target met. Approved for closure.',
      },
    ],
    effectivenessReviews: [
      {
        id: 'eff-001',
        reviewDate: new Date('2024-02-16'),
        reviewedBy: 'emp-002',
        reviewerName: 'Sarah Johnson',
        criteria: ['Response time < 5 days', 'Customer satisfaction improved', 'No backlog accumulation'],
        metricsEvaluated: [
          {
            metric: 'Average Investigation Time',
            targetValue: '< 5 days',
            actualValue: '3.5 days',
            status: 'met',
          },
          {
            metric: 'Customer Satisfaction Score',
            targetValue: '> 4.0',
            actualValue: '4.3',
            status: 'met',
          },
          {
            metric: 'Open Returns Backlog',
            targetValue: '< 10',
            actualValue: '5',
            status: 'met',
          },
        ],
        recurrenceCheck: true,
        recurrenceDetails: 'No recurrence of delay issues',
        overallEffective: true,
        additionalActionsRequired: false,
        conclusion: 'CAPA effective. Process improvements sustained. Recommend quarterly monitoring.',
      },
    ],
    effectivenessVerified: true,
    effectivenessVerifiedDate: new Date('2024-02-16'),
    effectivenessVerifiedBy: 'emp-002',
    riskLevel: 'low',
    relatedProcedures: ['PRO-CS-003 Customer Returns Handling'],
    updatedProcedures: ['PRO-CS-003 Rev C Customer Returns Handling'],
    trainingRequired: true,
    trainingCompleted: true,
    trainingDetails: 'Customer service and quality teams trained on new process',
    attachments: [],
    closedBy: 'emp-002',
    closedByName: 'Sarah Johnson',
    closedDate: new Date('2024-02-16'),
    closureNotes: 'All actions completed and verified effective. Process improvements documented.',
    lessonsLearned: 'Cross-functional teams with clear ownership significantly improve response time. Automated tracking dashboards essential for visibility.',
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-02-16'),
    createdBy: 'emp-007',
    updatedBy: 'emp-002',
  },
];

// ==================== SERVICE CLASS ====================

export class CAPAService {
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

  // Get all CAPAs with optional filters
  static async getAllCAPAs(filters?: CAPAFilters): Promise<CAPA[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredCAPAs = [...MOCK_CAPAS];

      if (filters) {
        if (filters.status) {
          filteredCAPAs = filteredCAPAs.filter((c) => c.status === filters.status);
        }
        if (filters.type) {
          filteredCAPAs = filteredCAPAs.filter((c) => c.type === filters.type);
        }
        if (filters.source) {
          filteredCAPAs = filteredCAPAs.filter((c) => c.source === filters.source);
        }
        if (filters.priority) {
          filteredCAPAs = filteredCAPAs.filter((c) => c.priority === filters.priority);
        }
        if (filters.ownerId) {
          filteredCAPAs = filteredCAPAs.filter((c) => c.ownerId === filters.ownerId);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredCAPAs = filteredCAPAs.filter(
            (c) =>
              c.capaNumber.toLowerCase().includes(searchLower) ||
              c.title.toLowerCase().includes(searchLower) ||
              c.description.toLowerCase().includes(searchLower)
          );
        }
      }

      return filteredCAPAs;
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const queryString = params.toString();
    return this.request<CAPA[]>(`/quality/capa${queryString ? `?${queryString}` : ''}`);
  }

  // Get CAPA by ID
  static async getCAPAById(id: string): Promise<CAPA> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const capa = MOCK_CAPAS.find((c) => c.id === id);
      if (!capa) {
        throw new Error('CAPA not found');
      }
      return capa;
    }
    return this.request<CAPA>(`/quality/capa/${id}`);
  }

  // Create a new CAPA
  static async createCAPA(data: CreateCAPADto): Promise<CAPA> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newCAPA: CAPA = {
        id: `capa-${Date.now()}`,
        capaNumber: `CAPA-2024-${String(MOCK_CAPAS.length + 1).padStart(4, '0')}`,
        title: data.title,
        description: data.description,
        status: CAPAStatus.DRAFT,
        type: data.type,
        source: data.source,
        priority: data.priority,
        sourceId: data.sourceId,
        sourceReference: data.sourceReference,
        ncrId: data.ncrId,
        ncrNumber: data.ncrNumber,
        problemStatement: data.problemStatement,
        impactDescription: data.impactDescription,
        affectedAreas: data.affectedAreas,
        affectedProducts: data.affectedProducts,
        affectedProcesses: data.affectedProcesses,
        actions: [],
        totalActions: 0,
        completedActions: 0,
        overallProgress: 0,
        targetCompletionDate: data.targetCompletionDate,
        estimatedCost: data.estimatedCost,
        ownerId: data.ownerId,
        ownerName: data.ownerName,
        ownerDepartment: data.ownerDepartment,
        sponsorId: data.sponsorId,
        sponsorName: data.sponsorName,
        approvals: [],
        effectivenessReviews: [],
        effectivenessVerified: false,
        riskLevel: data.riskLevel,
        attachments: [],
        notes: data.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: data.ownerId,
        updatedBy: data.ownerId,
      };
      MOCK_CAPAS.push(newCAPA);
      return newCAPA;
    }

    return this.request<CAPA>('/quality/capa', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update a CAPA
  static async updateCAPA(id: string, data: UpdateCAPADto): Promise<CAPA> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_CAPAS.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error('CAPA not found');
      }

      const updatedCAPA = {
        ...MOCK_CAPAS[index],
        ...data,
        updatedAt: new Date(),
      };

      // Recalculate progress
      if (updatedCAPA.actions && updatedCAPA.actions.length > 0) {
        updatedCAPA.totalActions = updatedCAPA.actions.length;
        updatedCAPA.completedActions = updatedCAPA.actions.filter(
          (a) => a.status === ActionStatus.COMPLETED
        ).length;
        updatedCAPA.overallProgress = Math.round(
          (updatedCAPA.completedActions / updatedCAPA.totalActions) * 100
        );
      }

      MOCK_CAPAS[index] = updatedCAPA;
      return MOCK_CAPAS[index];
    }

    return this.request<CAPA>(`/quality/capa/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Initiate a CAPA (move to initiated status)
  static async initiateCAPA(id: string, initiatorId?: string): Promise<CAPA> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_CAPAS.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error('CAPA not found');
      }

      MOCK_CAPAS[index] = {
        ...MOCK_CAPAS[index],
        status: CAPAStatus.INITIATED,
        initiatedDate: new Date(),
        updatedAt: new Date(),
        updatedBy: initiatorId || MOCK_CAPAS[index].ownerId,
      };
      return MOCK_CAPAS[index];
    }

    return this.request<CAPA>(`/quality/capa/${id}/initiate`, {
      method: 'POST',
      body: JSON.stringify({ initiatedBy: initiatorId }),
    });
  }

  // Move CAPA to implementation phase
  static async implementCAPA(id: string, implementedBy?: string): Promise<CAPA> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_CAPAS.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error('CAPA not found');
      }

      MOCK_CAPAS[index] = {
        ...MOCK_CAPAS[index],
        status: CAPAStatus.IMPLEMENTATION,
        implementationStartDate: new Date(),
        updatedAt: new Date(),
      };
      return MOCK_CAPAS[index];
    }

    return this.request<CAPA>(`/quality/capa/${id}/implement`, {
      method: 'POST',
      body: JSON.stringify({ implementedBy }),
    });
  }

  // Move CAPA to verification phase
  static async verifyCAPA(id: string, verifiedBy?: string, isEffective = true): Promise<CAPA> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_CAPAS.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error('CAPA not found');
      }

      MOCK_CAPAS[index] = {
        ...MOCK_CAPAS[index],
        status: CAPAStatus.VERIFICATION,
        verificationStartDate: new Date(),
        updatedAt: new Date(),
      };
      return MOCK_CAPAS[index];
    }

    return this.request<CAPA>(`/quality/capa/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verifiedBy, isEffective }),
    });
  }

  // Close a CAPA
  static async closeCAPA(
    id: string,
    closureData: {
      closedBy: string;
      closedByName: string;
      closureNotes: string;
      lessonsLearned?: string;
    }
  ): Promise<CAPA> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_CAPAS.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error('CAPA not found');
      }

      MOCK_CAPAS[index] = {
        ...MOCK_CAPAS[index],
        status: CAPAStatus.CLOSED,
        closedBy: closureData.closedBy,
        closedByName: closureData.closedByName,
        closedDate: new Date(),
        actualCompletionDate: new Date(),
        closureNotes: closureData.closureNotes,
        lessonsLearned: closureData.lessonsLearned,
        overallProgress: 100,
        updatedAt: new Date(),
      };
      return MOCK_CAPAS[index];
    }

    return this.request<CAPA>(`/quality/capa/${id}/close`, {
      method: 'POST',
      body: JSON.stringify(closureData),
    });
  }

  // Add action to CAPA
  static async addAction(id: string, action: Omit<CAPAAction, 'id'>): Promise<CAPA> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_CAPAS.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error('CAPA not found');
      }

      const newAction: CAPAAction = {
        ...action,
        id: `act-${Date.now()}`,
      };

      MOCK_CAPAS[index].actions.push(newAction);
      MOCK_CAPAS[index].totalActions = MOCK_CAPAS[index].actions.length;
      MOCK_CAPAS[index].completedActions = MOCK_CAPAS[index].actions.filter(
        (a) => a.status === ActionStatus.COMPLETED
      ).length;
      MOCK_CAPAS[index].overallProgress = Math.round(
        (MOCK_CAPAS[index].completedActions / MOCK_CAPAS[index].totalActions) * 100
      );
      MOCK_CAPAS[index].updatedAt = new Date();

      return MOCK_CAPAS[index];
    }

    return this.request<CAPA>(`/quality/capa/${id}/actions`, {
      method: 'POST',
      body: JSON.stringify(action),
    });
  }

  // Add effectiveness review
  static async addEffectivenessReview(
    id: string,
    review: Omit<EffectivenessReview, 'id'>
  ): Promise<CAPA> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_CAPAS.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error('CAPA not found');
      }

      const newReview: EffectivenessReview = {
        ...review,
        id: `eff-${Date.now()}`,
      };

      MOCK_CAPAS[index].effectivenessReviews.push(newReview);

      if (review.overallEffective) {
        MOCK_CAPAS[index].effectivenessVerified = true;
        MOCK_CAPAS[index].effectivenessVerifiedDate = new Date();
        MOCK_CAPAS[index].effectivenessVerifiedBy = review.reviewedBy;
        MOCK_CAPAS[index].status = CAPAStatus.EFFECTIVENESS_REVIEW;
      }

      MOCK_CAPAS[index].updatedAt = new Date();
      return MOCK_CAPAS[index];
    }

    return this.request<CAPA>(`/quality/capa/${id}/effectiveness-review`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  // Delete CAPA
  static async deleteCAPA(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_CAPAS.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error('CAPA not found');
      }
      MOCK_CAPAS.splice(index, 1);
      return;
    }

    await this.request<void>(`/quality/capa/${id}`, {
      method: 'DELETE',
    });
  }

  // Get CAPA statistics
  static async getCAPAStatistics(): Promise<{
    total: number;
    open: number;
    closed: number;
    overdue: number;
    byStatus: Record<CAPAStatus, number>;
    byType: Record<CAPAType, number>;
    byPriority: Record<CAPAPriority, number>;
    avgCompletionDays: number;
    effectivenessRate: number;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const byStatus: Record<CAPAStatus, number> = {} as Record<CAPAStatus, number>;
      const byType: Record<CAPAType, number> = {} as Record<CAPAType, number>;
      const byPriority: Record<CAPAPriority, number> = {} as Record<CAPAPriority, number>;

      Object.values(CAPAStatus).forEach((s) => (byStatus[s] = 0));
      Object.values(CAPAType).forEach((t) => (byType[t] = 0));
      Object.values(CAPAPriority).forEach((p) => (byPriority[p] = 0));

      let closedCount = 0;
      let totalCompletionDays = 0;
      let effectiveCount = 0;

      const now = new Date();
      let overdueCount = 0;

      MOCK_CAPAS.forEach((capa) => {
        byStatus[capa.status]++;
        byType[capa.type]++;
        byPriority[capa.priority]++;

        if (capa.status === CAPAStatus.CLOSED) {
          closedCount++;
          if (capa.actualCompletionDate && capa.initiatedDate) {
            const days = Math.ceil(
              (new Date(capa.actualCompletionDate).getTime() - new Date(capa.initiatedDate).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            totalCompletionDays += days;
          }
          if (capa.effectivenessVerified) {
            effectiveCount++;
          }
        }

        // Check overdue
        if (
          capa.status !== CAPAStatus.CLOSED &&
          capa.status !== CAPAStatus.CANCELLED &&
          capa.status !== CAPAStatus.REJECTED &&
          new Date(capa.targetCompletionDate) < now
        ) {
          overdueCount++;
        }
      });

      return {
        total: MOCK_CAPAS.length,
        open: MOCK_CAPAS.filter(
          (c) => c.status !== CAPAStatus.CLOSED && c.status !== CAPAStatus.CANCELLED && c.status !== CAPAStatus.REJECTED
        ).length,
        closed: closedCount,
        overdue: overdueCount,
        byStatus,
        byType,
        byPriority,
        avgCompletionDays: closedCount > 0 ? Math.round(totalCompletionDays / closedCount) : 0,
        effectivenessRate: closedCount > 0 ? Math.round((effectiveCount / closedCount) * 100) : 0,
      };
    }

    return this.request('/quality/capa/statistics');
  }
}

// Export singleton instance
export const capaService = CAPAService;
