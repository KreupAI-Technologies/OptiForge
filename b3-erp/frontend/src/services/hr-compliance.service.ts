// HR Compliance Service
// Handles all HR Compliance related API calls and data management

const USE_MOCK_DATA = false;

// ============================================
// ENUMS
// ============================================

export enum ComplianceType {
  LABOR_LAW = 'labor_law',
  STATUTORY = 'statutory',
  LICENSE = 'license',
  POLICY = 'policy',
  SAFETY = 'safety',
  ENVIRONMENTAL = 'environmental',
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PENDING = 'pending',
  PARTIALLY_COMPLIANT = 'partially_compliant',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ReturnType {
  PF = 'pf',
  ESI = 'esi',
  TDS = 'tds',
  PT = 'pt',
  LWF = 'lwf',
}

export enum ReturnStatus {
  PENDING = 'pending',
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  ACKNOWLEDGED = 'acknowledged',
  VERIFIED = 'verified',
  REVISED = 'revised',
}

export enum LicenseStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
  UNDER_RENEWAL = 'under_renewal',
}

export enum GrievanceStatus {
  FILED = 'filed',
  ACKNOWLEDGED = 'acknowledged',
  UNDER_REVIEW = 'under_review',
  INVESTIGATING = 'investigating',
  HEARING = 'hearing',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  WITHDRAWN = 'withdrawn',
  ESCALATED = 'escalated',
}

export enum ViolationSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AuditStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  FINDINGS_REVIEW = 'findings_review',
  REPORT_DRAFT = 'report_draft',
  COMPLETED = 'completed',
  CLOSED = 'closed',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// ============================================
// INTERFACES
// ============================================

export interface ComplianceTracker {
  id: string;
  trackerCode: string;
  complianceName: string;
  description?: string;
  complianceType: string;
  category: string;
  subCategory?: string;
  jurisdiction?: string;
  applicableState?: string;
  governingBody?: string;
  actName?: string;
  sectionReference?: string;
  frequency: string;
  dueDate?: string;
  status: string;
  complianceStatus: string;
  lastComplianceDate?: string;
  nextDueDate?: string;
  riskLevel: string;
  penaltyType?: string;
  penaltyAmount?: number;
  responsiblePersonName?: string;
  responsibleDepartment?: string;
}

export interface LaborRegister {
  id: string;
  registerCode: string;
  registerName: string;
  description?: string;
  registerType: string;
  actReference?: string;
  formNumber?: string;
  maintenanceMode: string;
  status: string;
  lastEntryDate?: string;
  totalEntries: number;
  maintainedByName?: string;
}

export interface LaborRegisterEntry {
  id: string;
  entryCode: string;
  registerId: string;
  entryDate: string;
  entryType?: string;
  employeeId?: string;
  employeeName?: string;
  entryData: Record<string, any>;
  enteredByName: string;
  remarks?: string;
}

export interface ComplianceCalendarEvent {
  id: string;
  eventCode: string;
  eventTitle: string;
  eventDescription?: string;
  eventType: string;
  complianceType?: string;
  referenceName?: string;
  eventDate: string;
  priority: string;
  status: string;
  assignedToName?: string;
}

export interface StatutoryReturn {
  id: string;
  returnCode: string;
  returnType: string;
  returnName: string;
  formNumber?: string;
  periodType: string;
  fiscalYear: string;
  returnMonth?: number;
  returnQuarter?: number;
  periodStart: string;
  periodEnd: string;
  filingDueDate: string;
  paymentDueDate?: string;
  actualFilingDate?: string;
  actualPaymentDate?: string;
  employeeContribution?: number;
  employerContribution?: number;
  adminCharges?: number;
  totalAmount: number;
  amountPaid?: number;
  amountDue?: number;
  totalEmployees?: number;
  coveredEmployees?: number;
  status: string;
  acknowledgmentNumber?: string;
  challanNumber?: string;
  preparedByName?: string;
  submittedByName?: string;
}

export interface License {
  id: string;
  licenseCode: string;
  licenseName: string;
  description?: string;
  licenseType: string;
  category: string;
  issuingAuthority: string;
  licenseNumber?: string;
  registrationNumber?: string;
  validFrom: string;
  validTo: string;
  status: string;
  renewalStatus?: string;
  licenseFee?: number;
  renewalFee?: number;
  responsiblePersonName?: string;
  responsibleDepartment?: string;
}

export interface LicenseRenewal {
  id: string;
  renewalCode: string;
  licenseId: string;
  licenseName?: string;
  renewalFrom: string;
  renewalTo: string;
  applicationDate?: string;
  applicationNumber?: string;
  approvalDate?: string;
  totalFee?: number;
  status: string;
  newLicenseNumber?: string;
}

export interface LicenseInspection {
  id: string;
  inspectionCode: string;
  licenseId?: string;
  licenseName?: string;
  inspectionType: string;
  inspectionName: string;
  inspectingAuthority: string;
  inspectorName?: string;
  scheduledDate?: string;
  actualDate: string;
  overallResult?: string;
  findings?: Array<{
    area: string;
    finding: string;
    severity: string;
    recommendation: string;
  }>;
  followUpRequired: boolean;
  followUpDate?: string;
}

export interface ComplianceCertificate {
  id: string;
  certificateCode: string;
  certificateName: string;
  description?: string;
  certificateType: string;
  category: string;
  issuingAuthority: string;
  certificateNumber?: string;
  issueDate: string;
  validFrom: string;
  validTo?: string;
  isPermanent: boolean;
  status: string;
}

export interface PolicyViolation {
  id: string;
  violationCode: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department?: string;
  policyName: string;
  policyCategory: string;
  violationType: string;
  violationDate: string;
  reportedDate: string;
  description: string;
  reportedByName: string;
  isAnonymous: boolean;
  investigationRequired: boolean;
  investigationStatus?: string;
  status: string;
  severity: string;
  actionTaken?: string;
  disciplinaryActionId?: string;
}

export interface DisciplinaryAction {
  id: string;
  actionCode: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department?: string;
  reason: string;
  violationType: string;
  incidentDate?: string;
  actionType: string;
  actionSeverity: string;
  initiationDate: string;
  noticeDate?: string;
  hearingDate?: string;
  decisionDate?: string;
  effectiveDate?: string;
  showcauseIssued: boolean;
  hearingConducted: boolean;
  decision?: string;
  finalAction?: string;
  suspensionDays?: number;
  salaryDeduction?: number;
  status: string;
  appealFiled: boolean;
  hrRepName?: string;
}

export interface DiversityMetrics {
  id: string;
  metricCode: string;
  periodType: string;
  periodStart: string;
  periodEnd: string;
  fiscalYear: string;
  scope: string;
  departmentName?: string;
  totalEmployees: number;
  maleCount: number;
  femaleCount: number;
  otherGenderCount: number;
  ageUnder25: number;
  age25to34: number;
  age35to44: number;
  age45to54: number;
  age55plus: number;
  generalCategory: number;
  obcCategory: number;
  scCategory: number;
  stCategory: number;
  pwdCategory: number;
  genderDiversityPercent?: number;
  pwdPercent?: number;
  avgMaleSalary?: number;
  avgFemaleSalary?: number;
  payGapPercent?: number;
}

export interface EEOReport {
  id: string;
  reportCode: string;
  reportName: string;
  reportType: string;
  reportingPeriod: string;
  fiscalYear: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  keyFindings?: Array<{
    finding: string;
    category: string;
    recommendation: string;
  }>;
  preparedByName?: string;
  preparedAt?: string;
  approvedByName?: string;
  approvedAt?: string;
}

export interface Grievance {
  id: string;
  grievanceCode: string;
  complainantId: string;
  complainantName: string;
  complainantDepartment?: string;
  isAnonymous: boolean;
  grievanceType: string;
  category: string;
  severity: string;
  subject: string;
  description: string;
  incidentDate?: string;
  againstEmployeeName?: string;
  againstDepartment?: string;
  filingDate: string;
  assignedToName?: string;
  investigationRequired: boolean;
  investigationStatus?: string;
  status: string;
  priority: string;
  resolutionType?: string;
  resolution?: string;
  resolutionDate?: string;
  complainantSatisfied?: boolean;
}

export interface POSHComplaint {
  id: string;
  complaintCode: string;
  complainantName: string;
  complainantDepartment?: string;
  isAnonymous: boolean;
  respondentName: string;
  respondentDepartment?: string;
  respondentType?: string;
  incidentDate: string;
  incidentLocation: string;
  incidentDescription: string;
  typeOfHarassment: string;
  frequency?: string;
  filingDate: string;
  icChairpersonName?: string;
  isValidComplaint?: boolean;
  conciliationRequested: boolean;
  inquiryStatus: string;
  inquiryStartDate?: string;
  inquiryEndDate?: string;
  complaintStatus: string;
  outcome?: string;
  actionRecommended?: string;
  actionTaken?: string;
  isTimelineCompliant: boolean;
}

export interface ComplianceAudit {
  id: string;
  auditCode: string;
  auditName: string;
  description?: string;
  auditType: string;
  auditCategory: string;
  auditYear: string;
  periodStart: string;
  periodEnd: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  auditorName: string;
  auditorOrganization?: string;
  areasAudited: string[];
  departments: string[];
  totalCheckpoints: number;
  compliantCount: number;
  nonCompliantCount: number;
  observationCount: number;
  criticalFindings: number;
  majorFindings: number;
  minorFindings: number;
  auditScore?: number;
  auditRating?: string;
  overallCompliance?: string;
  status: string;
  reportDate?: string;
}

export interface AuditFinding {
  id: string;
  findingCode: string;
  auditId: string;
  auditName?: string;
  findingTitle: string;
  findingDescription: string;
  findingType: string;
  category: string;
  areaAffected?: string;
  departmentAffected?: string;
  severity: string;
  riskLevel?: string;
  evidence?: string;
  rootCause?: string;
  complianceRequirement?: string;
  status: string;
  responsiblePersonName?: string;
  responsibleDepartment?: string;
  targetClosureDate?: string;
  actualClosureDate?: string;
}

export interface RemediationPlan {
  id: string;
  planCode: string;
  findingId: string;
  findingTitle?: string;
  planTitle: string;
  planDescription: string;
  correctiveActions: Array<{
    actionId: string;
    action: string;
    responsible: string;
    dueDate: string;
    status: string;
    completedDate?: string;
  }>;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status: string;
  overallProgress: number;
  planOwnerName: string;
  planOwnerDepartment?: string;
  approvedByName?: string;
  effectivenessVerified: boolean;
}

export interface ComplianceAlert {
  id: string;
  alertCode: string;
  alertType: string;
  alertCategory: string;
  severity: string;
  alertTitle: string;
  alertMessage: string;
  alertDescription?: string;
  referenceType?: string;
  referenceName?: string;
  triggerDate: string;
  dueDate?: string;
  daysUntilDue?: number;
  daysOverdue?: number;
  status: string;
  acknowledgedByName?: string;
  acknowledgedAt?: string;
  actionRequired?: string;
  actionTaken?: string;
}

export interface ComplianceDashboard {
  summary: {
    totalCompliances: number;
    compliantCount: number;
    nonCompliantCount: number;
    pendingCount: number;
    complianceRate: number;
  };
  alerts: {
    activeAlerts: number;
    licensesExpiringSoon: number;
    pendingReturns: number;
    openGrievances: number;
    openAuditFindings: number;
  };
  upcomingDeadlines: ComplianceCalendarEvent[];
}

// ============================================
// MOCK DATA
// ============================================

const mockComplianceTrackers: ComplianceTracker[] = [
  {
    id: '1',
    trackerCode: 'CMP-001',
    complianceName: 'Minimum Wages Act Compliance',
    description: 'Ensure compliance with Minimum Wages Act, 1948',
    complianceType: 'labor_law',
    category: 'central_law',
    jurisdiction: 'central',
    governingBody: 'Ministry of Labour and Employment',
    actName: 'Minimum Wages Act, 1948',
    frequency: 'monthly',
    status: 'active',
    complianceStatus: 'compliant',
    lastComplianceDate: '2024-01-31',
    nextDueDate: '2024-02-28',
    riskLevel: 'high',
    penaltyType: 'fine',
    penaltyAmount: 50000,
    responsiblePersonName: 'HR Manager',
    responsibleDepartment: 'HR',
  },
  {
    id: '2',
    trackerCode: 'CMP-002',
    complianceName: 'Payment of Gratuity Act',
    description: 'Compliance with Payment of Gratuity Act, 1972',
    complianceType: 'labor_law',
    category: 'central_law',
    governingBody: 'Ministry of Labour and Employment',
    actName: 'Payment of Gratuity Act, 1972',
    frequency: 'event_based',
    status: 'active',
    complianceStatus: 'compliant',
    riskLevel: 'medium',
    responsiblePersonName: 'Finance Manager',
    responsibleDepartment: 'Finance',
  },
  {
    id: '3',
    trackerCode: 'CMP-003',
    complianceName: 'Shops and Establishments Act',
    description: 'State-specific compliance for shops and establishments',
    complianceType: 'labor_law',
    category: 'state_law',
    jurisdiction: 'state',
    applicableState: 'Maharashtra',
    actName: 'Maharashtra Shops and Establishments Act',
    frequency: 'annually',
    status: 'active',
    complianceStatus: 'pending',
    nextDueDate: '2024-03-31',
    riskLevel: 'high',
    responsiblePersonName: 'Compliance Officer',
    responsibleDepartment: 'Legal',
  },
];

const mockLaborRegisters: LaborRegister[] = [
  {
    id: '1',
    registerCode: 'REG-001',
    registerName: 'Attendance Register',
    description: 'Daily attendance register as per Factories Act',
    registerType: 'attendance',
    actReference: 'Factories Act, 1948',
    formNumber: 'Form XII',
    maintenanceMode: 'electronic',
    status: 'active',
    lastEntryDate: '2024-02-10',
    totalEntries: 5420,
    maintainedByName: 'HR Assistant',
  },
  {
    id: '2',
    registerCode: 'REG-002',
    registerName: 'Wages Register',
    description: 'Register of wages paid to employees',
    registerType: 'wages',
    actReference: 'Payment of Wages Act, 1936',
    formNumber: 'Form IV',
    maintenanceMode: 'electronic',
    status: 'active',
    lastEntryDate: '2024-01-31',
    totalEntries: 1200,
    maintainedByName: 'Payroll Manager',
  },
  {
    id: '3',
    registerCode: 'REG-003',
    registerName: 'Overtime Register',
    description: 'Register of overtime hours worked',
    registerType: 'overtime',
    actReference: 'Factories Act, 1948',
    formNumber: 'Form X',
    maintenanceMode: 'electronic',
    status: 'active',
    lastEntryDate: '2024-02-09',
    totalEntries: 850,
    maintainedByName: 'HR Assistant',
  },
];

const mockStatutoryReturns: StatutoryReturn[] = [
  {
    id: '1',
    returnCode: 'RTN-PF-202401',
    returnType: 'pf',
    returnName: 'PF Monthly Return - January 2024',
    formNumber: 'ECR',
    periodType: 'monthly',
    fiscalYear: '2023-24',
    returnMonth: 1,
    periodStart: '2024-01-01',
    periodEnd: '2024-01-31',
    filingDueDate: '2024-02-15',
    paymentDueDate: '2024-02-15',
    actualFilingDate: '2024-02-10',
    actualPaymentDate: '2024-02-10',
    employeeContribution: 125000,
    employerContribution: 145000,
    adminCharges: 7250,
    totalAmount: 277250,
    amountPaid: 277250,
    totalEmployees: 150,
    coveredEmployees: 145,
    status: 'submitted',
    acknowledgmentNumber: 'ACK-PF-20240210-001',
    challanNumber: 'TRRN-20240210-001',
    preparedByName: 'Payroll Manager',
    submittedByName: 'HR Manager',
  },
  {
    id: '2',
    returnCode: 'RTN-ESI-202401',
    returnType: 'esi',
    returnName: 'ESI Monthly Return - January 2024',
    formNumber: 'ESIC-6',
    periodType: 'monthly',
    fiscalYear: '2023-24',
    returnMonth: 1,
    periodStart: '2024-01-01',
    periodEnd: '2024-01-31',
    filingDueDate: '2024-02-15',
    paymentDueDate: '2024-02-15',
    employeeContribution: 18750,
    employerContribution: 48750,
    totalAmount: 67500,
    amountPaid: 67500,
    totalEmployees: 150,
    coveredEmployees: 75,
    status: 'submitted',
    acknowledgmentNumber: 'ESI-ACK-202401-001',
    preparedByName: 'Payroll Manager',
  },
  {
    id: '3',
    returnCode: 'RTN-TDS-2024Q3',
    returnType: 'tds',
    returnName: 'TDS Quarterly Return - Q3 FY2023-24',
    formNumber: '24Q',
    periodType: 'quarterly',
    fiscalYear: '2023-24',
    returnQuarter: 3,
    periodStart: '2023-10-01',
    periodEnd: '2023-12-31',
    filingDueDate: '2024-01-31',
    actualFilingDate: '2024-01-28',
    totalAmount: 450000,
    amountPaid: 450000,
    totalEmployees: 150,
    status: 'acknowledged',
    acknowledgmentNumber: 'TDS-Q3-2024-ACK',
    preparedByName: 'Tax Consultant',
    submittedByName: 'Finance Manager',
  },
  {
    id: '4',
    returnCode: 'RTN-PT-202401',
    returnType: 'pt',
    returnName: 'Professional Tax - January 2024',
    periodType: 'monthly',
    fiscalYear: '2023-24',
    returnMonth: 1,
    periodStart: '2024-01-01',
    periodEnd: '2024-01-31',
    filingDueDate: '2024-02-28',
    totalAmount: 37500,
    totalEmployees: 150,
    status: 'pending',
    preparedByName: 'Payroll Manager',
  },
  {
    id: '5',
    returnCode: 'RTN-LWF-2024H1',
    returnType: 'lwf',
    returnName: 'Labour Welfare Fund - H1 FY2023-24',
    periodType: 'half_yearly',
    fiscalYear: '2023-24',
    periodStart: '2023-04-01',
    periodEnd: '2023-09-30',
    filingDueDate: '2024-01-15',
    actualFilingDate: '2024-01-12',
    totalAmount: 15000,
    amountPaid: 15000,
    totalEmployees: 150,
    status: 'submitted',
    preparedByName: 'HR Assistant',
  },
];

const mockLicenses: License[] = [
  {
    id: '1',
    licenseCode: 'LIC-001',
    licenseName: 'Shop & Establishment Registration',
    description: 'Registration under Maharashtra Shops and Establishments Act',
    licenseType: 'shop_establishment',
    category: 'mandatory',
    issuingAuthority: 'Municipal Corporation',
    licenseNumber: 'S&E/2023/12345',
    registrationNumber: 'MH-MUM-2023-12345',
    validFrom: '2023-04-01',
    validTo: '2026-03-31',
    status: 'active',
    renewalStatus: 'not_due',
    licenseFee: 5000,
    renewalFee: 5000,
    responsiblePersonName: 'Admin Manager',
    responsibleDepartment: 'Administration',
  },
  {
    id: '2',
    licenseCode: 'LIC-002',
    licenseName: 'PF Registration',
    description: 'Employees Provident Fund Registration',
    licenseType: 'pf',
    category: 'mandatory',
    issuingAuthority: 'EPFO',
    registrationNumber: 'MH/MUM/12345/000',
    validFrom: '2020-01-01',
    validTo: '2099-12-31',
    status: 'active',
    renewalStatus: 'not_applicable',
    responsiblePersonName: 'HR Manager',
    responsibleDepartment: 'HR',
  },
  {
    id: '3',
    licenseCode: 'LIC-003',
    licenseName: 'ESI Registration',
    description: 'Employees State Insurance Registration',
    licenseType: 'esi',
    category: 'mandatory',
    issuingAuthority: 'ESIC',
    registrationNumber: 'ESI/MH/12345',
    validFrom: '2020-01-01',
    validTo: '2099-12-31',
    status: 'active',
    renewalStatus: 'not_applicable',
    responsiblePersonName: 'HR Manager',
    responsibleDepartment: 'HR',
  },
  {
    id: '4',
    licenseCode: 'LIC-004',
    licenseName: 'Fire Safety Certificate',
    description: 'Fire NOC from Fire Department',
    licenseType: 'fire',
    category: 'mandatory',
    issuingAuthority: 'Fire Department',
    licenseNumber: 'FIRE/2023/5678',
    validFrom: '2023-06-01',
    validTo: '2024-05-31',
    status: 'active',
    renewalStatus: 'due_soon',
    licenseFee: 10000,
    renewalFee: 10000,
    responsiblePersonName: 'Safety Officer',
    responsibleDepartment: 'Safety',
  },
  {
    id: '5',
    licenseCode: 'LIC-005',
    licenseName: 'Trade License',
    description: 'Municipal Trade License',
    licenseType: 'trade',
    category: 'mandatory',
    issuingAuthority: 'Municipal Corporation',
    licenseNumber: 'TL/2024/9876',
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    status: 'active',
    renewalStatus: 'not_due',
    licenseFee: 25000,
    renewalFee: 25000,
    responsiblePersonName: 'Admin Manager',
    responsibleDepartment: 'Administration',
  },
];

const mockPolicyViolations: PolicyViolation[] = [
  {
    id: '1',
    violationCode: 'VIO-001',
    employeeId: 'EMP001',
    employeeName: 'John Smith',
    employeeCode: 'EMP001',
    department: 'Sales',
    policyName: 'Attendance Policy',
    policyCategory: 'attendance',
    violationType: 'minor',
    violationDate: '2024-02-05',
    reportedDate: '2024-02-06',
    description: 'Excessive late arrivals - 5 instances in January',
    reportedByName: 'Department Manager',
    isAnonymous: false,
    investigationRequired: false,
    status: 'action_taken',
    severity: 'low',
    actionTaken: 'Verbal warning issued',
  },
  {
    id: '2',
    violationCode: 'VIO-002',
    employeeId: 'EMP002',
    employeeName: 'Jane Doe',
    employeeCode: 'EMP002',
    department: 'IT',
    policyName: 'Data Security Policy',
    policyCategory: 'data_security',
    violationType: 'moderate',
    violationDate: '2024-01-28',
    reportedDate: '2024-01-29',
    description: 'Sharing login credentials with another employee',
    reportedByName: 'IT Security Team',
    isAnonymous: false,
    investigationRequired: true,
    investigationStatus: 'completed',
    status: 'action_taken',
    severity: 'medium',
    actionTaken: 'Written warning and mandatory security training',
  },
];

const mockDisciplinaryActions: DisciplinaryAction[] = [
  {
    id: '1',
    actionCode: 'DA-001',
    employeeId: 'EMP003',
    employeeName: 'Robert Wilson',
    employeeCode: 'EMP003',
    department: 'Operations',
    reason: 'Repeated policy violations - Attendance',
    violationType: 'attendance',
    actionType: 'written_warning',
    actionSeverity: 'moderate',
    initiationDate: '2024-02-01',
    noticeDate: '2024-02-02',
    showcauseIssued: true,
    hearingConducted: false,
    decision: 'Warning issued',
    status: 'completed',
    appealFiled: false,
    hrRepName: 'HR Manager',
  },
];

const mockGrievances: Grievance[] = [
  {
    id: '1',
    grievanceCode: 'GRV-001',
    complainantId: 'EMP004',
    complainantName: 'Alice Johnson',
    complainantDepartment: 'Marketing',
    isAnonymous: false,
    grievanceType: 'workplace',
    category: 'individual',
    severity: 'medium',
    subject: 'Unfair workload distribution',
    description: 'Complaint regarding unequal distribution of work within the team',
    filingDate: '2024-02-05',
    assignedToName: 'HR Manager',
    investigationRequired: false,
    status: 'under_review',
    priority: 'normal',
  },
  {
    id: '2',
    grievanceCode: 'GRV-002',
    complainantId: 'EMP005',
    complainantName: 'Anonymous',
    isAnonymous: true,
    grievanceType: 'harassment',
    category: 'individual',
    severity: 'high',
    subject: 'Workplace harassment concern',
    description: 'Report of verbal harassment by a senior colleague',
    incidentDate: '2024-01-25',
    filingDate: '2024-01-26',
    assignedToName: 'Compliance Officer',
    investigationRequired: true,
    investigationStatus: 'in_progress',
    status: 'investigating',
    priority: 'high',
  },
];

const mockComplianceAudits: ComplianceAudit[] = [
  {
    id: '1',
    auditCode: 'AUD-001',
    auditName: 'Annual HR Compliance Audit 2023-24',
    description: 'Comprehensive annual audit of HR compliance',
    auditType: 'internal',
    auditCategory: 'hr_compliance',
    auditYear: '2023-24',
    periodStart: '2023-04-01',
    periodEnd: '2024-03-31',
    plannedStartDate: '2024-01-15',
    plannedEndDate: '2024-02-15',
    actualStartDate: '2024-01-15',
    auditorName: 'Internal Audit Team',
    areasAudited: ['Leave Management', 'Payroll', 'Statutory Compliance', 'Policy Compliance'],
    departments: ['HR', 'Finance', 'Operations'],
    totalCheckpoints: 50,
    compliantCount: 42,
    nonCompliantCount: 5,
    observationCount: 3,
    criticalFindings: 1,
    majorFindings: 2,
    minorFindings: 5,
    auditScore: 84,
    auditRating: 'good',
    overallCompliance: 'partially_compliant',
    status: 'in_progress',
  },
];

const mockAuditFindings: AuditFinding[] = [
  {
    id: '1',
    findingCode: 'FND-001',
    auditId: '1',
    auditName: 'Annual HR Compliance Audit 2023-24',
    findingTitle: 'PF Contribution Calculation Error',
    findingDescription: 'Errors found in PF contribution calculation for 3 employees',
    findingType: 'non_compliance',
    category: 'process',
    areaAffected: 'Payroll',
    departmentAffected: 'Finance',
    severity: 'major',
    riskLevel: 'high',
    rootCause: 'Manual calculation errors in wage components',
    complianceRequirement: 'EPF Act, 1952',
    status: 'action_planned',
    responsiblePersonName: 'Payroll Manager',
    responsibleDepartment: 'Finance',
    targetClosureDate: '2024-02-28',
  },
  {
    id: '2',
    findingCode: 'FND-002',
    auditId: '1',
    auditName: 'Annual HR Compliance Audit 2023-24',
    findingTitle: 'Leave Register Not Updated',
    findingDescription: 'Leave register not maintained as per statutory requirements',
    findingType: 'non_compliance',
    category: 'documentation',
    areaAffected: 'Leave Management',
    departmentAffected: 'HR',
    severity: 'minor',
    riskLevel: 'medium',
    status: 'in_progress',
    responsiblePersonName: 'HR Assistant',
    responsibleDepartment: 'HR',
    targetClosureDate: '2024-02-15',
  },
];

const mockComplianceAlerts: ComplianceAlert[] = [
  {
    id: '1',
    alertCode: 'ALT-001',
    alertType: 'expiry',
    alertCategory: 'license',
    severity: 'high',
    alertTitle: 'Fire Safety Certificate Expiring Soon',
    alertMessage: 'Fire Safety Certificate will expire in 90 days',
    referenceType: 'license',
    referenceName: 'Fire Safety Certificate',
    triggerDate: '2024-02-11',
    dueDate: '2024-05-31',
    daysUntilDue: 110,
    status: 'active',
    actionRequired: 'Initiate renewal process',
  },
  {
    id: '2',
    alertCode: 'ALT-002',
    alertType: 'deadline',
    alertCategory: 'return',
    severity: 'medium',
    alertTitle: 'Professional Tax Return Due',
    alertMessage: 'PT return for January 2024 due by Feb 28',
    referenceType: 'return',
    referenceName: 'Professional Tax - January 2024',
    triggerDate: '2024-02-11',
    dueDate: '2024-02-28',
    daysUntilDue: 17,
    status: 'active',
    actionRequired: 'File PT return',
  },
  {
    id: '3',
    alertCode: 'ALT-003',
    alertType: 'audit',
    alertCategory: 'compliance',
    severity: 'high',
    alertTitle: 'Audit Finding Closure Due',
    alertMessage: 'Critical audit finding FND-001 closure due',
    referenceType: 'audit',
    referenceName: 'PF Contribution Calculation Error',
    triggerDate: '2024-02-11',
    dueDate: '2024-02-28',
    daysUntilDue: 17,
    status: 'active',
    actionRequired: 'Close audit finding',
  },
];

const mockDiversityMetrics: DiversityMetrics[] = [
  {
    id: '1',
    metricCode: 'DIV-2024Q3',
    periodType: 'quarterly',
    periodStart: '2023-10-01',
    periodEnd: '2023-12-31',
    fiscalYear: '2023-24',
    scope: 'company',
    totalEmployees: 150,
    maleCount: 95,
    femaleCount: 53,
    otherGenderCount: 2,
    ageUnder25: 20,
    age25to34: 55,
    age35to44: 45,
    age45to54: 22,
    age55plus: 8,
    generalCategory: 100,
    obcCategory: 25,
    scCategory: 15,
    stCategory: 5,
    pwdCategory: 5,
    genderDiversityPercent: 35.3,
    pwdPercent: 3.3,
    avgMaleSalary: 85000,
    avgFemaleSalary: 82000,
    payGapPercent: 3.5,
  },
];

const mockCalendarEvents: ComplianceCalendarEvent[] = [
  {
    id: '1',
    eventCode: 'EVT-001',
    eventTitle: 'PF Return Filing',
    eventDescription: 'Monthly PF return filing deadline',
    eventType: 'deadline',
    complianceType: 'statutory',
    referenceName: 'PF Monthly Return',
    eventDate: '2024-02-15',
    priority: 'high',
    status: 'upcoming',
    assignedToName: 'Payroll Manager',
  },
  {
    id: '2',
    eventCode: 'EVT-002',
    eventTitle: 'ESI Return Filing',
    eventDescription: 'Monthly ESI return filing deadline',
    eventType: 'deadline',
    complianceType: 'statutory',
    referenceName: 'ESI Monthly Return',
    eventDate: '2024-02-15',
    priority: 'high',
    status: 'upcoming',
    assignedToName: 'Payroll Manager',
  },
  {
    id: '3',
    eventCode: 'EVT-003',
    eventTitle: 'PT Return Filing',
    eventDescription: 'Professional Tax return filing deadline',
    eventType: 'deadline',
    complianceType: 'statutory',
    referenceName: 'Professional Tax Return',
    eventDate: '2024-02-28',
    priority: 'medium',
    status: 'upcoming',
    assignedToName: 'Payroll Manager',
  },
  {
    id: '4',
    eventCode: 'EVT-004',
    eventTitle: 'Fire Safety License Renewal',
    eventDescription: 'Fire safety certificate renewal reminder',
    eventType: 'renewal',
    complianceType: 'license',
    referenceName: 'Fire Safety Certificate',
    eventDate: '2024-03-01',
    priority: 'high',
    status: 'upcoming',
    assignedToName: 'Safety Officer',
  },
];

// ============================================
// SERVICE CLASS
// ============================================

export class HRComplianceService {
  // Dashboard
  static async getDashboard(): Promise<ComplianceDashboard> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        summary: {
          totalCompliances: mockComplianceTrackers.length,
          compliantCount: mockComplianceTrackers.filter(c => c.complianceStatus === 'compliant').length,
          nonCompliantCount: mockComplianceTrackers.filter(c => c.complianceStatus === 'non_compliant').length,
          pendingCount: mockComplianceTrackers.filter(c => c.complianceStatus === 'pending').length,
          complianceRate: 67,
        },
        alerts: {
          activeAlerts: mockComplianceAlerts.filter(a => a.status === 'active').length,
          licensesExpiringSoon: mockLicenses.filter(l => l.renewalStatus === 'due_soon').length,
          pendingReturns: mockStatutoryReturns.filter(r => r.status === 'pending').length,
          openGrievances: mockGrievances.filter(g => !['resolved', 'closed', 'withdrawn'].includes(g.status)).length,
          openAuditFindings: mockAuditFindings.filter(f => !['closed', 'verified'].includes(f.status)).length,
        },
        upcomingDeadlines: mockCalendarEvents.slice(0, 5),
      };
    }
    // API call would go here
    throw new Error('API not implemented');
  }

  // Compliance Trackers
  static async getComplianceTrackers(filters?: {
    complianceType?: string;
    category?: string;
    status?: string;
    riskLevel?: string;
  }): Promise<ComplianceTracker[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let result = [...mockComplianceTrackers];
      if (filters?.complianceType) {
        result = result.filter(c => c.complianceType === filters.complianceType);
      }
      if (filters?.status) {
        result = result.filter(c => c.status === filters.status);
      }
      if (filters?.riskLevel) {
        result = result.filter(c => c.riskLevel === filters.riskLevel);
      }
      return result;
    }
    throw new Error('API not implemented');
  }

  static async getComplianceTrackerById(id: string): Promise<ComplianceTracker | null> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockComplianceTrackers.find(c => c.id === id) || null;
    }
    throw new Error('API not implemented');
  }

  // Labor Registers
  static async getLaborRegisters(filters?: {
    registerType?: string;
    status?: string;
  }): Promise<LaborRegister[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let result = [...mockLaborRegisters];
      if (filters?.registerType) {
        result = result.filter(r => r.registerType === filters.registerType);
      }
      if (filters?.status) {
        result = result.filter(r => r.status === filters.status);
      }
      return result;
    }
    throw new Error('API not implemented');
  }

  // Compliance Calendar
  static async getComplianceCalendarEvents(filters?: {
    startDate?: string;
    endDate?: string;
    eventType?: string;
    status?: string;
  }): Promise<ComplianceCalendarEvent[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let result = [...mockCalendarEvents];
      if (filters?.eventType) {
        result = result.filter(e => e.eventType === filters.eventType);
      }
      if (filters?.status) {
        result = result.filter(e => e.status === filters.status);
      }
      return result;
    }
    throw new Error('API not implemented');
  }

  // Statutory Returns
  static async getStatutoryReturns(filters?: {
    returnType?: string;
    status?: string;
    fiscalYear?: string;
  }): Promise<StatutoryReturn[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let result = [...mockStatutoryReturns];
      if (filters?.returnType) {
        result = result.filter(r => r.returnType === filters.returnType);
      }
      if (filters?.status) {
        result = result.filter(r => r.status === filters.status);
      }
      if (filters?.fiscalYear) {
        result = result.filter(r => r.fiscalYear === filters.fiscalYear);
      }
      return result;
    }
    throw new Error('API not implemented');
  }

  static async getStatutoryReturnById(id: string): Promise<StatutoryReturn | null> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockStatutoryReturns.find(r => r.id === id) || null;
    }
    throw new Error('API not implemented');
  }

  static async getStatutoryReturnsByType(returnType: string): Promise<StatutoryReturn[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockStatutoryReturns.filter(r => r.returnType === returnType);
    }
    throw new Error('API not implemented');
  }

  // Licenses
  static async getLicenses(filters?: {
    licenseType?: string;
    status?: string;
    renewalStatus?: string;
  }): Promise<License[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let result = [...mockLicenses];
      if (filters?.licenseType) {
        result = result.filter(l => l.licenseType === filters.licenseType);
      }
      if (filters?.status) {
        result = result.filter(l => l.status === filters.status);
      }
      if (filters?.renewalStatus) {
        result = result.filter(l => l.renewalStatus === filters.renewalStatus);
      }
      return result;
    }
    throw new Error('API not implemented');
  }

  static async getLicenseById(id: string): Promise<License | null> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockLicenses.find(l => l.id === id) || null;
    }
    throw new Error('API not implemented');
  }

  // Policy Violations
  static async getPolicyViolations(filters?: {
    employeeId?: string;
    policyCategory?: string;
    status?: string;
    severity?: string;
  }): Promise<PolicyViolation[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let result = [...mockPolicyViolations];
      if (filters?.policyCategory) {
        result = result.filter(v => v.policyCategory === filters.policyCategory);
      }
      if (filters?.status) {
        result = result.filter(v => v.status === filters.status);
      }
      if (filters?.severity) {
        result = result.filter(v => v.severity === filters.severity);
      }
      return result;
    }
    throw new Error('API not implemented');
  }

  // Disciplinary Actions
  static async getDisciplinaryActions(filters?: {
    employeeId?: string;
    actionType?: string;
    status?: string;
  }): Promise<DisciplinaryAction[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let result = [...mockDisciplinaryActions];
      if (filters?.actionType) {
        result = result.filter(a => a.actionType === filters.actionType);
      }
      if (filters?.status) {
        result = result.filter(a => a.status === filters.status);
      }
      return result;
    }
    throw new Error('API not implemented');
  }

  // Diversity Metrics
  static async getDiversityMetrics(filters?: {
    periodType?: string;
    fiscalYear?: string;
    scope?: string;
  }): Promise<DiversityMetrics[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockDiversityMetrics;
    }
    throw new Error('API not implemented');
  }

  // Grievances
  static async getGrievances(filters?: {
    grievanceType?: string;
    status?: string;
    severity?: string;
  }): Promise<Grievance[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let result = [...mockGrievances];
      if (filters?.grievanceType) {
        result = result.filter(g => g.grievanceType === filters.grievanceType);
      }
      if (filters?.status) {
        result = result.filter(g => g.status === filters.status);
      }
      if (filters?.severity) {
        result = result.filter(g => g.severity === filters.severity);
      }
      return result;
    }
    throw new Error('API not implemented');
  }

  static async getGrievanceById(id: string): Promise<Grievance | null> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockGrievances.find(g => g.id === id) || null;
    }
    throw new Error('API not implemented');
  }

  // Compliance Audits
  static async getComplianceAudits(filters?: {
    auditType?: string;
    auditCategory?: string;
    status?: string;
    auditYear?: string;
  }): Promise<ComplianceAudit[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let result = [...mockComplianceAudits];
      if (filters?.auditType) {
        result = result.filter(a => a.auditType === filters.auditType);
      }
      if (filters?.status) {
        result = result.filter(a => a.status === filters.status);
      }
      return result;
    }
    throw new Error('API not implemented');
  }

  static async getComplianceAuditById(id: string): Promise<ComplianceAudit | null> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockComplianceAudits.find(a => a.id === id) || null;
    }
    throw new Error('API not implemented');
  }

  // Audit Findings
  static async getAuditFindings(filters?: {
    auditId?: string;
    severity?: string;
    status?: string;
  }): Promise<AuditFinding[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let result = [...mockAuditFindings];
      if (filters?.auditId) {
        result = result.filter(f => f.auditId === filters.auditId);
      }
      if (filters?.severity) {
        result = result.filter(f => f.severity === filters.severity);
      }
      if (filters?.status) {
        result = result.filter(f => f.status === filters.status);
      }
      return result;
    }
    throw new Error('API not implemented');
  }

  // Compliance Alerts
  static async getComplianceAlerts(filters?: {
    alertType?: string;
    alertCategory?: string;
    status?: string;
    severity?: string;
  }): Promise<ComplianceAlert[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let result = [...mockComplianceAlerts];
      if (filters?.alertType) {
        result = result.filter(a => a.alertType === filters.alertType);
      }
      if (filters?.alertCategory) {
        result = result.filter(a => a.alertCategory === filters.alertCategory);
      }
      if (filters?.status) {
        result = result.filter(a => a.status === filters.status);
      }
      if (filters?.severity) {
        result = result.filter(a => a.severity === filters.severity);
      }
      return result;
    }
    throw new Error('API not implemented');
  }

  static async acknowledgeAlert(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const alert = mockComplianceAlerts.find(a => a.id === id);
      if (alert) {
        alert.status = 'acknowledged';
        alert.acknowledgedAt = new Date().toISOString();
        return true;
      }
      return false;
    }
    throw new Error('API not implemented');
  }
}

export default HRComplianceService;
