import { apiClient } from './api/client';

// NestJS domain backend base URL (port 3001). The new project-management
// feature endpoints (settings/templates/milestone-templates/analytics) live here.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface PmSettings {
    id?: string;
    companyId?: string;
    defaultCurrency: string;
    fiscalYearStart: string;
    defaultProjectPrefix: string;
    autoNumbering: boolean;
    documentRetention: string;
    projectApprovalRequired: boolean;
    milestoneApprovalRequired: boolean;
    documentApprovalRequired: boolean;
    budgetApprovalThreshold: string;
    changeOrderApprovalLevels: string;
    projectStartNotification: boolean;
    milestoneCompleteNotification: boolean;
    budgetExceededNotification: boolean;
    scheduleDelayNotification: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    projectManagerApproval: boolean;
    departmentHeadApproval: boolean;
    financeApproval: boolean;
    ceoApprovalThreshold: string;
}

export interface PmTemplate {
    id: string;
    templateName: string;
    projectType: string;
    description: string;
    category: string;
    complexity: string;
    estimatedDuration: string;
    estimatedBudget: string;
    phases: any[];
    milestones: number;
    tasks: number;
    resources: string[];
    deliverables: string[];
    defaultSettings: any;
    tags: string[];
    usageCount: number;
    lastUsed: string;
    createdBy: string;
    createdDate?: string;
    isActive: boolean;
    isFavorite: boolean;
}

export interface PmMilestoneTemplate {
    id: string;
    templateName: string;
    projectType: string;
    description: string;
    totalMilestones: number;
    estimatedDuration: string;
    milestones: any[];
    usageCount: number;
    lastUsed: string;
    createdBy: string;
    createdDate?: string;
    isActive: boolean;
}

export interface PmChangeOrder {
    id: string;
    companyId?: string;
    changeOrderNumber: string;
    projectId: string;
    projectName: string;
    requestDate: string;
    requestedBy: string;
    requestedByRole: string;
    changeType: string;
    priority: string;
    title: string;
    description: string;
    reason: string;
    impactOnCost: number;
    impactOnSchedule: number;
    originalBudget: number;
    revisedBudget: number;
    originalEndDate: string;
    revisedEndDate: string;
    status: string;
    approvedBy: string;
    approvalDate: string;
    implementationDate: string;
    completionDate: string;
    attachments: number;
    remarks: string;
}

export interface PmDeliverable {
    id: string;
    companyId?: string;
    deliverableNumber: string;
    deliverableName: string;
    projectNumber: string;
    projectName: string;
    type: string;
    description: string;
    assignedTo: string;
    plannedDate: string;
    actualDate?: string;
    status: string;
    progress: number;
    dependencies: string[];
    quantity: number;
    unit: string;
    notes: string;
}

export interface PmProjectIssue {
    id: string;
    companyId?: string;
    number: string;
    title: string;
    type: string;
    category: string;
    projectNumber: string;
    projectName: string;
    description: string;
    impact: string;
    probability: string;
    status: string;
    priority: string;
    raisedBy: string;
    assignedTo: string;
    raisedDate: string;
    targetDate: string;
    resolvedDate?: string;
    mitigationPlan: string;
    costImpact: number;
    scheduleImpact: number;
}

export interface PmAnalyticsSummary {
    metrics: {
        totalProjects: number;
        activeProjects: number;
        completedProjects: number;
        delayedProjects: number;
        totalRevenue: number;
        totalCost: number;
        profitMargin: number;
        onTimeDelivery: number;
    };
    projectTypeMetrics: Array<{
        type: string;
        count: number;
        revenue: number;
        cost: number;
        avgDuration: number;
        successRate: number;
        color: string;
    }>;
    topProjects: Array<{
        name: string;
        revenue: number;
        profit: number;
        margin: number;
        status: string;
    }>;
}

// --- Newly-wired PM CRUD list feature types ---
export interface PmSiteIssue {
    id: string;
    companyId?: string;
    issueNumber?: string;
    projectId?: string;
    projectName?: string;
    issueTitle?: string;
    issueType?: string;
    severity?: string;
    priority?: string;
    reportedDate?: string;
    reportedBy?: string;
    reportedByRole?: string;
    location?: string;
    description?: string;
    impactOnWork?: string;
    rootCause?: string;
    proposedSolution?: string;
    assignedTo?: string;
    targetDate?: string;
    actualResolutionDate?: string;
    status?: string;
    resolutionDetails?: string;
    costImpact?: number;
    scheduleImpact?: number;
    preventiveMeasures?: string;
    attachments?: number;
    relatedIssues?: string[];
}

export interface PmMaterialConsumption {
    id: string;
    companyId?: string;
    date?: string;
    projectId?: string;
    projectName?: string;
    workPackage?: string;
    materialCode?: string;
    materialName?: string;
    category?: string;
    unit?: string;
    plannedQty?: number;
    consumedQty?: number;
    variance?: number;
    variancePercent?: number;
    unitCost?: number;
    totalCost?: number;
    source?: string;
    issuedBy?: string;
    receivedBy?: string;
    warehouseLocation?: string;
    remarks?: string;
    status?: string;
}

export interface PmLaborEntry {
    id: string;
    companyId?: string;
    date?: string;
    projectId?: string;
    projectName?: string;
    workPackage?: string;
    laborCategory?: string;
    workersDeployed?: number;
    hoursWorked?: number;
    overtimeHours?: number;
    totalManhours?: number;
    plannedManhours?: number;
    variance?: number;
    hourlyRate?: number;
    overtimeRate?: number;
    totalCost?: number;
    workDescription?: string;
    shift?: string;
    efficiency?: number;
    supervisor?: string;
    remarks?: string;
}

export interface PmProjectCost {
    id: string;
    companyId?: string;
    projectId?: string;
    projectName?: string;
    projectType?: string;
    customer?: string;
    startDate?: string;
    endDate?: string;
    progress?: number;
    status?: string;
    totalBudget?: number;
    actualCost?: number;
    committedCost?: number;
    forecastedCost?: number;
    variance?: number;
    variancePercent?: number;
    costBreakdown?: any[];
    profitMargin?: number;
    actualProfit?: number;
}

export interface PmCommissioningActivity {
    id: string;
    companyId?: string;
    activityNumber?: string;
    projectId?: string;
    projectName?: string;
    equipmentSystem?: string;
    systemCode?: string;
    commissioningType?: string;
    scheduledDate?: string;
    actualDate?: string;
    duration?: number;
    status?: string;
    progress?: number;
    engineer?: string;
    clientRep?: string;
    testParameters?: any[];
    checklistItems?: any[];
    totalChecks?: number;
    passedChecks?: number;
    failedChecks?: number;
    observations?: string;
    recommendations?: string;
    certificateIssued?: boolean;
    certificateNumber?: string;
    nextActivity?: string;
    dependencies?: string[];
    attachments?: number;
}

export interface PmCustomerAcceptance {
    id: string;
    companyId?: string;
    acceptanceNumber?: string;
    projectId?: string;
    projectName?: string;
    projectType?: string;
    customer?: string;
    customerContact?: string;
    customerEmail?: string;
    acceptanceDate?: string;
    acceptanceType?: string;
    phase?: string;
    deliverables?: string[];
    acceptanceCriteria?: any[];
    totalCriteria?: number;
    criteriaMet?: number;
    criteriaPending?: number;
    documentation?: any[];
    totalDocuments?: number;
    docsSubmitted?: number;
    docsPending?: number;
    defectsList?: string[];
    punchListItems?: number;
    completedPunchItems?: number;
    trainingCompleted?: boolean;
    warrantyPeriod?: string;
    warrantyStartDate?: string;
    amcOffered?: boolean;
    amcDuration?: string;
    signedBy?: string;
    signedByDesignation?: string;
    signedDate?: string;
    witnessedBy?: string;
    overallStatus?: string;
    remarks?: string;
    attachments?: number;
}

export interface PmProjectProfitability {
    id: string;
    companyId?: string;
    projectId?: string;
    projectName?: string;
    clientName?: string;
    projectType?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    contractValue?: number;
    actualRevenue?: number;
    revenueRecognized?: number;
    totalBudget?: number;
    actualCost?: number;
    directCosts?: any;
    indirectCosts?: any;
    grossProfit?: number;
    grossMargin?: number;
    netProfit?: number;
    netMargin?: number;
    budgetVariance?: number;
    variancePercent?: number;
    billedAmount?: number;
    outstandingAmount?: number;
    paymentStatus?: string;
    riskLevel?: string;
}

export interface PmLayoutBriefing {
    id: string;
    companyId?: string;
    briefingNumber?: string;
    projectId?: string;
    projectName?: string;
    briefingDate?: string;
    briefingTime?: string;
    location?: string;
    organizer?: string;
    status?: string;
    attendees?: Array<{ name: string; role: string; attended: boolean }>;
    agenda?: string;
    minutes?: string;
    actionItems?: string;
    attachments?: Array<{ id: string; name: string; type: string }>;
    duration?: string;
}

export interface PmProgressEntry {
    id: string;
    companyId?: string;
    date?: string;
    workPackage?: string;
    activity?: string;
    plannedWork?: string;
    actualWork?: string;
    completionPercent?: number;
    laborDeployed?: number;
    hoursWorked?: number;
    materialUsed?: string;
    equipmentUsed?: string;
    issues?: string;
    photos?: number;
    weather?: string;
    safetyIncidents?: number;
    reportedBy?: string;
    status?: string;
}

export interface Project {
    id: string;
    name: string;
    clientName: string;
    description?: string;
    projectCode?: string;
    startDate?: string;
    endDate?: string;
    status: string;
    priority: string;
    progress: number;
    budgetAllocated: number;
    budgetSpent: number;
    projectManagerId?: string;
    location?: string;
    projectType?: string;
    handoverStatus?: 'pending' | 'approved' | 'rejected' | 'n/a';
}

export interface ProjectTask {
    id: string;
    projectId: string;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status: string;
    priority: string;
    progress: number;
    assignedTo?: string[];
    parentTaskId?: string;
    subtasks?: ProjectTask[];
}

export interface ProjectResource {
    id: string;
    projectId: string;
    userId: string;
    role?: string;
    allocationPercentage: number;
    startDate?: string;
    endDate?: string;
}

export interface ProjectBudget {
    id: string;
    projectId: string;
    category: string;
    budgetAllocated: number;
    budgetSpent: number;
    forecastCost: number;
}

export interface ProjectMilestone {
    id: string;
    projectId: string;
    name: string;
    dueDate?: string;
    status: string;
}

export interface TimeLog {
    id: string;
    projectId: string;
    taskId?: string;
    userId: string;
    date: string;
    hours: number;
    description?: string;
}

export interface TAClaim {
    id: string;
    date: string;
    amount: number;
    description: string;
    status: 'Approved' | 'Pending' | 'Rejected';
    projectId: string;
}

export interface EmergencySpareRequest {
    id: string;
    partId: string;
    quantity: number;
    urgency: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Approved' | 'Pending Approval' | 'Rejected';
    requestedBy: string;
    projectId: string;
    reason: string;
}

export interface FieldScheduleItem {
    id: number;
    project: string;
    location: string;
    time: string;
    status: 'Upcoming' | 'Completed' | 'In Progress';
}

export interface Measurement {
    id: string;
    label: string;
    value: string;
    unit: string;
    description?: string;
}

export interface RoomMeasurements {
    id: string;
    roomName: string;
    measurements: Measurement[];
}

export interface Discrepancy {
    id: string;
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Open' | 'In Review' | 'Resolved';
    date: string;
    reportedBy: string;
}

export interface BOQItem {
    id: string;
    description: string;
    boqQty: number;
    drawingQty: number;
    status: 'Match' | 'Mismatch';
    notes?: string;
}

export interface Drawing {
    id: string;
    name: string;
    type: 'Layout' | 'Structural' | 'MEP';
    version: string;
    status: 'Pending' | 'Verified' | 'Rejected';
    uploadDate: string;
    url: string;
    notes?: string;
    projectId?: string;
}

export interface DrawingRevision {
    id: string;
    projectId: string;
    documentNumber: string;
    documentName: string;
    version: string;
    revisionDate: string;
    revisedBy: string;
    status: 'Draft' | 'Under Review' | 'Approved' | 'Superseded';
    changeDescription: string;
    changesCount: number;
    reviewedBy?: string;
    approvedDate?: string;
    previousVersion?: string;
}

export interface MEPDrawing {
    id: string;
    mepNumber: string;
    projectId: string;
    projectName: string;
    drawingType: 'Electrical' | 'Plumbing' | 'HVAC' | 'Fire Safety' | 'Drainage';
    drawingName: string;
    version: string;
    status: 'Draft' | 'Under Review' | 'Approved' | 'Shared with Site' | 'Site Work Complete';
    createdDate: string;
    createdBy: string;
    approvedDate?: string;
    siteWorkProgress: number;
    siteWorkStatus: 'Not Started' | 'In Progress' | 'Pending Inspection' | 'Completed';
    assignedTo: string;
    fileSize: string;
}

export interface SiteVisit {
    id: string;
    projectId: string;
    date: string;
    time: string;
    location: string;
    contactName: string;
    status: 'Confirmed' | 'Pending' | 'Canceled';
}

export interface CabinetMarkingTask {
    id: string;
    taskNumber: string;
    projectId: string;
    projectName: string;
    cabinetType: string;
    quantity: number;
    scheduledDate: string;
    assignedTeam: string;
    status: 'Scheduled' | 'In Progress' | 'Completed' | 'Pending Review';
    completionPercentage: number;
    markedItems: number;
    totalItems: number;
    photosUploaded: number;
    reportGenerated: boolean;
}

export interface DrawingTimeline {
    id: string;
    timelineNumber: string;
    projectId: string;
    projectName: string;
    drawingType: string;
    quantity: number;
    complexity: 'Low' | 'Medium' | 'High' | 'Very High';
    estimatedDays: number;
    startDate: string;
    targetDate: string;
    assignedDesigner: string;
    status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
    progress: number;
}

export interface Supervisor {
    id: string;
    name: string;
    role: string;
    exp: string;
    projects: number;
    status: 'Available' | 'Busy';
}

export interface SiteReadiness {
    projectId: string;
    isReady: boolean | null;
    lastChecked: string;
    checkList: { item: string; completed: boolean }[];
    comments?: string;
}

export interface TechnicalDocument {
    id: string;
    projectId: string;
    name: string;
    type: 'BOQ' | 'Drawing' | 'Render' | 'Spec';
    status: 'Ready' | 'Pending' | 'Missing';
    date: string;
}

export interface TechnicalBriefing {
    projectId: string;
    date: string;
    time: string;
    notes: string;
    attendees: string[];
    isCompleted: boolean;
}

export interface DrawingTimeline {
    projectId: string;
    complexity: 'Low' | 'Medium' | 'High' | 'Complex';
    resources: number;
    startDate: string;
    estimatedDays: number;
    completionDate: string;
    isConfirmed: boolean;
}

export interface ProductionDrawing {
    id: string;
    projectId: string;
    name: string;
    version: string;
    type: 'CAD' | 'PDF' | 'Production';
    uploadedBy: string;
    date: string;
    status: 'Draft' | 'Approved';
}

export interface AccessoryItem {
    id: string;
    projectId: string;
    category: string;
    name: string;
    quantity: number;
    unit: string;
    notes: string;
}

export interface ShutterSpecs {
    projectId: string;
    glass: { type: string; thickness: string; finish: string; notes: string };
    wood: { core: string; finish: string; edgeBand: string; notes: string };
    stone: { material: string; thickness: string; edgeProfile: string; notes: string };
    metal: { material: string; gauge: string; finish: string; notes: string };
}

export interface BOMValidation {
    projectId: string;
    checks: {
        drawings: boolean;
        accessories: boolean;
        specs: boolean;
        quantities: boolean;
    };
    isSubmitted: boolean;
    submittedAt?: string;
}

export interface BOMReception {
    id: string;
    projectId: string;
    submittedBy: string;
    date: string;
    itemsCount: number;
    status: 'Pending' | 'Processing' | 'Completed';
    priority: 'High' | 'Medium' | 'Low';
}

export interface StockItem {
    id: string;
    projectId: string;
    name: string;
    category: string;
    requiredQty: number;
    availableQty: number;
    unit: string;
    status: 'Available' | 'Shortfall';
}

class ProjectManagementService {
    private bomValidations: BOMValidation[] = [
        {
            projectId: 'proj-001',
            checks: { drawings: true, accessories: true, specs: true, quantities: false },
            isSubmitted: false
        }
    ];

    private bomReceptions: BOMReception[] = [
        { id: 'BOM-001', projectId: 'proj-001', submittedBy: 'Alex Tech', date: '2025-02-01', itemsCount: 45, status: 'Pending', priority: 'High' },
        { id: 'BOM-002', projectId: 'proj-002', submittedBy: 'Sarah Design', date: '2025-02-02', itemsCount: 120, status: 'Processing', priority: 'Medium' },
    ];

    private stockItems: StockItem[] = [
        { id: 'ITM-001', projectId: 'proj-001', name: 'Plywood 18mm MR Grade', category: 'Wood', requiredQty: 50, availableQty: 120, unit: 'sheets', status: 'Available' },
        { id: 'ITM-002', projectId: 'proj-001', name: 'Laminate - White Gloss', category: 'Finish', requiredQty: 30, availableQty: 10, unit: 'sheets', status: 'Shortfall' },
        { id: 'ITM-003', projectId: 'proj-001', name: 'Hettich Soft Close Hinge', category: 'Hardware', requiredQty: 100, availableQty: 45, unit: 'pcs', status: 'Shortfall' },
        { id: 'ITM-004', projectId: 'proj-001', name: 'Fevicol SH', category: 'Adhesive', requiredQty: 20, availableQty: 50, unit: 'kg', status: 'Available' },
    ];

    // ... existing mock data stores ...
    private claims: TAClaim[] = [
        { id: 'CLM-001', date: '2023-10-25', amount: 1500, description: 'Site visit travel', status: 'Approved', projectId: 'proj-001' },
        { id: 'CLM-002', date: '2023-10-28', amount: 800, description: 'Local conveyance', status: 'Pending', projectId: 'proj-001' },
    ];

    private spareRequests: EmergencySpareRequest[] = [
        { id: 'SPR-001', partId: 'PT-123', quantity: 5, urgency: 'High', status: 'Approved', requestedBy: 'John Doe', projectId: 'proj-001', reason: 'Broken during install' },
        { id: 'SPR-002', partId: 'PT-456', quantity: 2, urgency: 'Medium', status: 'Pending Approval', requestedBy: 'Jane Smith', projectId: 'proj-001', reason: 'Missing from kit' },
    ];

    private schedule: FieldScheduleItem[] = [
        { id: 1, project: 'Metro Rail Phase 1', location: 'Site A', time: '09:00 AM', status: 'Upcoming' },
        { id: 2, project: 'Solar Power Plant', location: 'Site B', time: '02:00 PM', status: 'Upcoming' },
    ];

    private siteMeasurements: RoomMeasurements[] = [
        {
            id: 'RM-001',
            roomName: 'Kitchen',
            measurements: [
                { id: 'M-001', label: 'Wall A Length', value: '3000', unit: 'mm', description: 'North facing wall' },
                { id: 'M-002', label: 'Ceiling Height', value: '2800', unit: 'mm' },
            ]
        },
        {
            id: 'RM-002',
            roomName: 'Pantry',
            measurements: [
                { id: 'M-003', label: 'Floor Area', value: '4.5', unit: 'sqm', description: 'Tiled flooring' },
            ]
        }
    ];

    private drawings: Drawing[] = [
        // Project 1: Taj Hotel Commercial Kitchen
        { id: 'DRW-001', projectId: 'proj-001', name: 'Kitchen Equipment Layout Plan - Ground Floor', type: 'Layout', version: 'v2.1', status: 'Pending', uploadDate: '2026-02-10', url: '/drawings/taj-kitchen-layout-gf.pdf' },
        { id: 'DRW-002', projectId: 'proj-001', name: 'Kitchen Equipment Layout Plan - First Floor', type: 'Layout', version: 'v1.5', status: 'Pending', uploadDate: '2026-02-09', url: '/drawings/taj-kitchen-layout-ff.pdf' },
        { id: 'DRW-003', projectId: 'proj-001', name: 'Cold Room & Walk-in Freezer Layout', type: 'Layout', version: 'v1.2', status: 'Pending', uploadDate: '2026-02-08', url: '/drawings/taj-cold-room-layout.pdf' },
        { id: 'DRW-004', projectId: 'proj-001', name: 'Electrical Distribution - Main Panel SLD', type: 'MEP', version: 'v2.0', status: 'Verified', uploadDate: '2026-02-05', url: '/drawings/taj-electrical-sld.pdf' },
        { id: 'DRW-005', projectId: 'proj-001', name: 'Plumbing & Drainage Layout', type: 'MEP', version: 'v1.8', status: 'Pending', uploadDate: '2026-02-07', url: '/drawings/taj-plumbing-drainage.pdf' },
        { id: 'DRW-006', projectId: 'proj-001', name: 'HVAC & Kitchen Exhaust System', type: 'MEP', version: 'v1.4', status: 'Rejected', uploadDate: '2026-02-04', url: '/drawings/taj-hvac-exhaust.pdf', notes: 'CFM calculations need revision - exhaust capacity insufficient for cooking stations' },
        { id: 'DRW-007', projectId: 'proj-001', name: 'Fire Suppression System Layout', type: 'MEP', version: 'v1.0', status: 'Verified', uploadDate: '2026-02-03', url: '/drawings/taj-fire-suppression.pdf' },
        { id: 'DRW-008', projectId: 'proj-001', name: 'Structural Foundation Details', type: 'Structural', version: 'v1.2', status: 'Verified', uploadDate: '2026-01-28', url: '/drawings/taj-structural-foundation.pdf' },
        { id: 'DRW-009', projectId: 'proj-001', name: 'Equipment Load Bearing Structure', type: 'Structural', version: 'v1.0', status: 'Pending', uploadDate: '2026-02-06', url: '/drawings/taj-load-bearing.pdf' },
        { id: 'DRW-010', projectId: 'proj-001', name: 'Gas Pipeline & Safety System', type: 'MEP', version: 'v1.3', status: 'Pending', uploadDate: '2026-02-08', url: '/drawings/taj-gas-pipeline.pdf' },

        // Project 2: BigBasket Cold Storage
        { id: 'DRW-011', projectId: 'proj-002', name: 'Cold Room Layout - Zone A (-18°C)', type: 'Layout', version: 'v1.5', status: 'Pending', uploadDate: '2026-02-08', url: '/drawings/bb-cold-zone-a.pdf' },
        { id: 'DRW-012', projectId: 'proj-002', name: 'Cold Room Layout - Zone B (+4°C)', type: 'Layout', version: 'v1.3', status: 'Pending', uploadDate: '2026-02-07', url: '/drawings/bb-cold-zone-b.pdf' },
        { id: 'DRW-013', projectId: 'proj-002', name: 'Refrigeration P&ID', type: 'MEP', version: 'v2.0', status: 'Verified', uploadDate: '2026-02-05', url: '/drawings/bb-refrigeration-pid.pdf' },
        { id: 'DRW-014', projectId: 'proj-002', name: 'Compressor Room Layout', type: 'Layout', version: 'v1.1', status: 'Pending', uploadDate: '2026-02-06', url: '/drawings/bb-compressor-room.pdf' },
        { id: 'DRW-015', projectId: 'proj-002', name: 'PUF Panel Installation Details', type: 'Structural', version: 'v1.0', status: 'Pending', uploadDate: '2026-02-04', url: '/drawings/bb-puf-panel.pdf' },
    ];

    private boqItems: BOQItem[] = [
        { id: 'BOQ-001', description: 'Base Cabinet 600mm', boqQty: 12, drawingQty: 12, status: 'Match' },
        { id: 'BOQ-002', description: 'Wall Cabinet 900mm', boqQty: 8, drawingQty: 8, status: 'Match' },
        { id: 'BOQ-003', description: 'Tall Unit 2100mm', boqQty: 2, drawingQty: 3, status: 'Mismatch', notes: 'Extra unit added in layout' },
        { id: 'BOQ-004', description: 'Island Countertop', boqQty: 1, drawingQty: 1, status: 'Match' },
        { id: 'BOQ-005', description: 'Drawer Unit 450mm', boqQty: 5, drawingQty: 4, status: 'Mismatch', notes: 'Removed due to space constraint' },
    ];

    private discrepancies: Discrepancy[] = [
        { id: 'DIS-001', title: 'Tall Unit Quantity Mismatch', description: 'BOQ says 2, Drawing shows 3', priority: 'High', status: 'Open', date: '2025-01-20', reportedBy: 'Site Supervisor' },
        { id: 'DIS-002', title: 'Sink Position Conflict', description: 'Plumbing not aligned with cabinet', priority: 'Medium', status: 'In Review', date: '2025-01-19', reportedBy: 'MEP Engineer' },
        { id: 'DIS-003', title: 'Material Finish Unavailable', description: 'Selected laminate out of stock', priority: 'Low', status: 'Resolved', date: '2025-01-18', reportedBy: 'Procurement' },
    ];

    private drawingRevisions: DrawingRevision[] = [
        {
            id: '1',
            projectId: 'proj-001',
            documentNumber: 'D-2025-001',
            documentName: 'Equipment Layout Drawing',
            version: '3.0',
            revisionDate: '2025-01-20',
            revisedBy: 'Design Team',
            status: 'Approved',
            changeDescription: 'Updated kitchen equipment positions based on site measurements. Adjusted spacing for exhaust hoods.',
            changesCount: 8,
            reviewedBy: 'Project Manager',
            approvedDate: '2025-01-21',
            previousVersion: '2.0',
        }
    ];

    private mepDrawings: MEPDrawing[] = [
        {
            id: '1',
            mepNumber: 'MEP-2025-001',
            projectId: 'proj-001',
            projectName: 'Taj Hotels - Commercial Kitchen Setup',
            drawingType: 'Electrical',
            drawingName: 'Kitchen Power Distribution - Main Panel',
            version: '2.0',
            status: 'Shared with Site',
            createdDate: '2025-01-15',
            createdBy: 'MEP Designer',
            approvedDate: '2025-01-16',
            siteWorkProgress: 75,
            siteWorkStatus: 'In Progress',
            assignedTo: 'Site Supervisor - Anil Kumar',
            fileSize: '3.2 MB',
        }
    ];

    private siteVisits: SiteVisit[] = [
        { id: '1', projectId: 'proj-001', date: '2025-01-24', time: '10:00 AM', location: 'Taj Hotels', contactName: 'Client Representative', status: 'Confirmed' },
        { id: '2', projectId: 'proj-001', date: '2025-01-26', time: '02:00 PM', location: 'BigBasket', contactName: 'Site Manager', status: 'Pending' },
    ];

    private cabinetMarkingTasks: CabinetMarkingTask[] = [
        {
            id: '1',
            taskNumber: 'CM-2025-001',
            projectId: 'proj-001',
            projectName: 'Taj Hotels - Commercial Kitchen Setup',
            cabinetType: 'Wall Cabinets - Upper Level',
            quantity: 24,
            scheduledDate: '2025-01-22',
            assignedTeam: 'Installation Team A - 4 members',
            status: 'Completed',
            completionPercentage: 100,
            markedItems: 24,
            totalItems: 24,
            photosUploaded: 12,
            reportGenerated: true,
        },
        {
            id: '2',
            taskNumber: 'CM-2025-002',
            projectId: 'proj-001',
            projectName: 'Taj Hotels - Commercial Kitchen Setup',
            cabinetType: 'Base Cabinets - Floor Level',
            quantity: 18,
            scheduledDate: '2025-01-23',
            assignedTeam: 'Installation Team A - 4 members',
            status: 'In Progress',
            completionPercentage: 65,
            markedItems: 12,
            totalItems: 18,
            photosUploaded: 8,
            reportGenerated: false,
        },
        {
            id: '4',
            taskNumber: 'CM-2025-004',
            projectId: 'proj-002',
            projectName: 'BigBasket Cold Storage Facility',
            cabinetType: 'Control Panel Enclosures',
            quantity: 8,
            scheduledDate: '2025-01-26',
            assignedTeam: 'Installation Team C - 2 members',
            status: 'Pending Review',
            completionPercentage: 100,
            markedItems: 8,
            totalItems: 8,
            photosUploaded: 4,
            reportGenerated: false,
        },
    ];

    private drawingTimelines: DrawingTimeline[] = [
        {
            id: '1',
            timelineNumber: 'TL-2025-001',
            projectId: 'proj-001',
            projectName: 'Taj Hotels - Commercial Kitchen Setup',
            drawingType: 'Technical Fabrication Drawings',
            quantity: 12,
            complexity: 'High',
            estimatedDays: 14,
            startDate: '2025-01-18',
            targetDate: '2025-02-01',
            assignedDesigner: 'Technical Designer Team A',
            status: 'In Progress',
            progress: 60,
        },
        {
            id: '2',
            timelineNumber: 'TL-2025-002',
            projectId: 'proj-001',
            projectName: 'Taj Hotels - Commercial Kitchen Setup',
            drawingType: 'Assembly Drawings',
            quantity: 8,
            complexity: 'Medium',
            estimatedDays: 7,
            startDate: '2025-01-25',
            targetDate: '2025-02-01',
            assignedDesigner: 'Technical Designer Team B',
            status: 'Not Started',
            progress: 0,
        },
        {
            id: '3',
            timelineNumber: 'TL-2025-003',
            projectId: 'proj-002',
            projectName: 'BigBasket Cold Storage Facility',
            drawingType: 'Cold Room Technical Drawings',
            quantity: 15,
            complexity: 'Very High',
            estimatedDays: 21,
            startDate: '2025-01-22',
            targetDate: '2025-02-12',
            assignedDesigner: 'Senior Technical Designer',
            status: 'Not Started',
            progress: 0,
        },
    ];

    private supervisors: Supervisor[] = [
        { id: 'SUP-001', name: 'Anil Kumar', role: 'Senior Supervisor', exp: '8 years', projects: 2, status: 'Available' },
        { id: 'SUP-002', name: 'Rajesh Singh', role: 'Site Engineer', exp: '5 years', projects: 1, status: 'Available' },
        { id: 'SUP-003', name: 'Vikram Malhotra', role: 'Project Manager', exp: '12 years', projects: 4, status: 'Busy' },
    ];

    private siteReadinessRecords: SiteReadiness[] = [
        {
            projectId: 'proj-001',
            isReady: null,
            lastChecked: '2025-02-01',
            checkList: [
                { item: 'Civil work completed', completed: false },
                { item: 'Flooring installed', completed: false },
                { item: 'Power & water points available', completed: false },
                { item: 'Access for material delivery clear', completed: false },
            ],
        },
    ];

    private technicalDocuments: TechnicalDocument[] = [
        { id: '1', projectId: 'proj-001', name: 'Final_Approved_BOQ_v2.pdf', type: 'BOQ', status: 'Ready', date: '2025-01-20' },
        { id: '2', projectId: 'proj-001', name: 'Site_Measurements_Verified.pdf', type: 'Drawing', status: 'Ready', date: '2025-01-22' },
        { id: '3', projectId: 'proj-001', name: 'Kitchen_Layout_Concept_v3.jpg', type: 'Render', status: 'Ready', date: '2025-01-18' },
        { id: '4', projectId: 'proj-001', name: 'Appliance_Specifications_Sheet.pdf', type: 'Spec', status: 'Ready', date: '2025-01-19' },
        { id: '5', projectId: 'proj-002', name: 'BOQ_Rough_Draft.pdf', type: 'BOQ', status: 'Ready', date: '2025-01-25' },
    ];

    private technicalBriefings: TechnicalBriefing[] = [
        {
            projectId: 'proj-001',
            date: '2025-01-25',
            time: '10:00',
            notes: 'Reviewed site constraints and kitchen layout requirements.',
            attendees: ['Project Manager', 'Technical Lead', 'Kitchen Specialist'],
            isCompleted: true,
        },
    ];

    private drawingTimelines: DrawingTimeline[] = [
        {
            projectId: 'proj-001',
            complexity: 'Medium',
            resources: 2,
            startDate: '2025-01-26',
            estimatedDays: 5,
            completionDate: '2025-01-31',
            isConfirmed: true,
        },
    ];

    private productionDrawings: ProductionDrawing[] = [
        {
            id: 'DWG-001',
            projectId: 'proj-001',
            name: 'Kitchen_Joinery_Detail_A.dwg',
            version: 'v1.0',
            type: 'CAD',
            uploadedBy: 'Tech Lead',
            date: '2025-01-25',
            status: 'Draft',
        },
        {
            id: 'DWG-002',
            projectId: 'proj-001',
            name: 'Wardrobe_Section_B.pdf',
            version: 'v1.0',
            type: 'PDF',
            uploadedBy: 'Tech Lead',
            date: '2025-01-25',
            status: 'Draft',
        },
    ];

    private accessoriesBOM: AccessoryItem[] = [
        {
            id: 'ACC-001',
            projectId: 'proj-001',
            category: 'Hinges',
            name: 'Soft Close Hinge 110°',
            quantity: 24,
            unit: 'pcs',
            notes: 'Blum or Hettich',
        },
        {
            id: 'ACC-002',
            projectId: 'proj-001',
            category: 'Handles',
            name: 'Brushed Nickel Bar Handle',
            quantity: 12,
            unit: 'pcs',
            notes: '128mm center',
        },
    ];

    private shutterSpecs: ShutterSpecs[] = [
        {
            projectId: 'proj-001',
            glass: { type: 'Toughened', thickness: '5mm', finish: 'Clear', notes: '' },
            wood: { core: 'MDF', finish: 'Laminate', edgeBand: '2mm PVC', notes: '' },
            stone: { material: 'Granite', thickness: '20mm', edgeProfile: 'Chamfered', notes: '' },
            metal: { material: 'SS 304', gauge: '18G', finish: 'Brushed', notes: '' },
        }
    ];

    private mockProjectResources: any[] = [
        {
            id: 'RES-001',
            projectId: 'proj-001',
            userId: 'USR-001',
            role: 'Project Manager',
            allocationPercentage: 100,
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            user: {
                id: 'USR-001',
                name: 'Vikram Malhotra',
                employeeId: 'EMP-2023-001',
                email: 'vikram.m@optiforge.com',
                phone: '+91 98765 43210',
                department: 'Project Management',
                skills: ['Project Planning', 'Risk Management', 'Stakeholder Management', 'Agile'],
                avatar: '/avatars/vikram.jpg'
            }
        },
        {
            id: 'RES-002',
            projectId: 'proj-001',
            userId: 'USR-002',
            role: 'Senior Electrical Engineer',
            allocationPercentage: 80,
            startDate: '2024-01-15',
            endDate: '2024-11-30',
            user: {
                id: 'USR-002',
                name: 'Anjali Sharma',
                employeeId: 'EMP-2023-045',
                email: 'anjali.s@optiforge.com',
                phone: '+91 98765 43211',
                department: 'Engineering',
                skills: ['Electrical Design', 'AutoCAD', 'Power Systems', 'Safety Compliance'],
                avatar: '/avatars/anjali.jpg'
            }
        },
        {
            id: 'RES-003',
            projectId: 'proj-001',
            userId: 'USR-003',
            role: 'Site Supervisor',
            allocationPercentage: 100,
            startDate: '2024-02-01',
            endDate: '2024-12-31',
            user: {
                id: 'USR-003',
                name: 'Rahul Verma',
                employeeId: 'EMP-2023-089',
                email: 'rahul.v@optiforge.com',
                phone: '+91 98765 43212',
                department: 'Operations',
                skills: ['Site Supervision', 'Team Leadership', 'Quality Control', 'Safety Regulations'],
                avatar: '/avatars/rahul.jpg'
            }
        },
        {
            id: 'RES-004',
            projectId: 'proj-001',
            userId: 'USR-004',
            role: 'HVAC Specialist',
            allocationPercentage: 50,
            startDate: '2024-03-01',
            endDate: '2024-08-30',
            user: {
                id: 'USR-004',
                name: 'David Fernades',
                employeeId: 'EMP-2023-102',
                email: 'david.f@optiforge.com',
                phone: '+91 98765 43213',
                department: 'Engineering',
                skills: ['HVAC Systems', 'Thermal Analysis', 'Installation', 'Maintenance'],
                avatar: '/avatars/david.jpg'
            }
        },
        {
            id: 'RES-005',
            projectId: 'proj-001',
            userId: 'USR-005',
            role: 'Quality Inspector',
            allocationPercentage: 40,
            startDate: '2024-04-01',
            endDate: '2024-12-31',
            user: {
                id: 'USR-005',
                name: 'Priya Nair',
                employeeId: 'EMP-2023-156',
                email: 'priya.n@optiforge.com',
                phone: '+91 98765 43214',
                department: 'Quality Control',
                skills: ['Quality Assurance', 'ISO Standards', 'Inspection', 'Reporting'],
                avatar: '/avatars/priya.jpg'
            }
        },
        {
            id: 'RES-006',
            projectId: 'proj-002',
            userId: 'USR-006',
            role: 'Project Manager',
            allocationPercentage: 100,
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            user: {
                id: 'USR-006',
                name: 'Suresh Raina',
                employeeId: 'EMP-2023-002',
                email: 'suresh.r@optiforge.com',
                phone: '+91 98765 43215',
                department: 'Project Management',
                skills: ['Project Coordination', 'Budgeting', 'Client Relations'],
                avatar: '/avatars/suresh.jpg'
            }
        },
        {
            id: 'RES-007',
            projectId: 'proj-002',
            userId: 'USR-007',
            role: 'Cold Storage Expert',
            allocationPercentage: 100,
            startDate: '2024-01-10',
            endDate: '2024-09-30',
            user: {
                id: 'USR-007',
                name: 'Michael Chen',
                employeeId: 'EMP-2023-210',
                email: 'michael.c@optiforge.com',
                phone: '+91 98765 43216',
                department: 'Engineering',
                skills: ['Refrigeration', 'Insulation', 'Thermal Dynamics', 'Energy Efficiency'],
                avatar: '/avatars/michael.jpg'
            }
        },
        {
            id: 'RES-008',
            projectId: 'proj-001',
            userId: 'USR-008',
            role: 'Safety Officer',
            allocationPercentage: 30,
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            user: {
                id: 'USR-008',
                name: 'Karthik S',
                employeeId: 'EMP-2023-301',
                email: 'karthik.s@optiforge.com',
                phone: '+91 98765 43217',
                department: 'Safety',
                skills: ['Occupational Health', 'Risk Assessment', 'Safety Training', 'Compliance'],
                avatar: '/avatars/karthik.jpg'
            }
        },
        {
            id: 'RES-009',
            projectId: 'proj-001',
            userId: 'USR-009',
            role: 'Installation Technician',
            allocationPercentage: 100,
            startDate: '2024-06-01',
            endDate: '2024-08-31',
            user: {
                id: 'USR-009',
                name: 'Manoj Kumar',
                employeeId: 'EMP-2023-405',
                email: 'manoj.k@optiforge.com',
                phone: '+91 98765 43218',
                department: 'Operations',
                skills: ['Equipment Installation', 'Blueprint Reading', 'Tool Handling', 'Physical Endurance'],
                avatar: '/avatars/manoj.jpg'
            }
        },
        {
            id: 'RES-010',
            projectId: 'proj-001',
            userId: 'USR-010',
            role: 'Junior Designer',
            allocationPercentage: 60,
            startDate: '2024-02-01',
            endDate: '2024-10-31',
            user: {
                id: 'USR-010',
                name: 'Sarah Lee',
                employeeId: 'EMP-2023-512',
                email: 'sarah.l@optiforge.com',
                phone: '+91 98765 43219',
                department: 'Design',
                skills: ['CAD', '3D Modeling', 'Sketching', 'Material Selection'],
                avatar: '/avatars/sarah.jpg'
            }
        }
    ];


    private mockProjectBudgets: ProjectBudget[] = [
        // Project 1: Commercial Kitchen (On Track / Slightly Under)
        { id: 'BUD-001', projectId: 'proj-001', category: 'Labor', budgetAllocated: 50000, budgetSpent: 45000, forecastCost: 48000 },
        { id: 'BUD-002', projectId: 'proj-001', category: 'Materials', budgetAllocated: 120000, budgetSpent: 110000, forecastCost: 118000 },
        { id: 'BUD-003', projectId: 'proj-001', category: 'Equipment', budgetAllocated: 80000, budgetSpent: 75000, forecastCost: 78000 },
        { id: 'BUD-004', projectId: 'proj-001', category: 'Subcontractor', budgetAllocated: 30000, budgetSpent: 32000, forecastCost: 35000 }, // Overspend
        { id: 'BUD-005', projectId: 'proj-001', category: 'Logistics', budgetAllocated: 15000, budgetSpent: 12000, forecastCost: 14000 },
        { id: 'BUD-006', projectId: 'proj-001', category: 'Design', budgetAllocated: 25000, budgetSpent: 25000, forecastCost: 25000 },
        { id: 'BUD-007', projectId: 'proj-001', category: 'Contingency', budgetAllocated: 20000, budgetSpent: 5000, forecastCost: 10000 },

        // Project 2: Cold Storage (Over Budget)
        { id: 'BUD-008', projectId: 'proj-002', category: 'Labor', budgetAllocated: 40000, budgetSpent: 48000, forecastCost: 55000 }, // Significant Overspend
        { id: 'BUD-009', projectId: 'proj-002', category: 'Materials', budgetAllocated: 90000, budgetSpent: 95000, forecastCost: 100000 },
        { id: 'BUD-010', projectId: 'proj-002', category: 'Equipment', budgetAllocated: 150000, budgetSpent: 145000, forecastCost: 152000 },
        { id: 'BUD-011', projectId: 'proj-002', category: 'Subcontractor', budgetAllocated: 20000, budgetSpent: 22000, forecastCost: 24000 },
        { id: 'BUD-012', projectId: 'proj-002', category: 'Logistics', budgetAllocated: 10000, budgetSpent: 11000, forecastCost: 12000 },

        // Project 3: Industrial Kitchen (Under Budget)
        { id: 'BUD-013', projectId: 'proj-003', category: 'Labor', budgetAllocated: 60000, budgetSpent: 40000, forecastCost: 55000 },
        { id: 'BUD-014', projectId: 'proj-003', category: 'Materials', budgetAllocated: 140000, budgetSpent: 100000, forecastCost: 135000 },
        { id: 'BUD-015', projectId: 'proj-003', category: 'Equipment', budgetAllocated: 100000, budgetSpent: 60000, forecastCost: 95000 },
        { id: 'BUD-016', projectId: 'proj-003', category: 'Design', budgetAllocated: 30000, budgetSpent: 28000, forecastCost: 30000 },
    ];

    private mockProjects: Project[] = [
        {
            id: 'proj-001',
            name: 'Taj Hotel Commercial Kitchen Installation',
            clientName: 'Taj Hotels Limited',
            projectCode: 'PRJ-2024-001',
            status: 'In Progress',
            priority: 'High',
            progress: 65,
            budgetAllocated: 8500000,
            budgetSpent: 5200000,
            location: 'Mumbai',
            projectType: 'Commercial Kitchen'
        },
        {
            id: 'proj-002',
            name: 'BigBasket Cold Storage Facility',
            clientName: 'BigBasket Pvt Ltd',
            projectCode: 'PRJ-2024-002',
            status: 'In Progress',
            priority: 'High',
            progress: 45,
            budgetAllocated: 12000000,
            budgetSpent: 4800000,
            location: 'Bangalore',
            projectType: 'Cold Room'
        }
    ];

    // --- Projects ---
    async getProjects(): Promise<Project[]> {
        try {
            const response = await apiClient.get<Project[]>('/projects');
            const data = response.data || [];
            return data.length > 0 ? data : this.mockProjects;
        } catch (error) {
            console.error('API Error fetching projects, using mocks:', error);
            return this.mockProjects;
        }
    }

    async getProject(id: string): Promise<Project> {
        try {
            const response = await apiClient.get<Project>(`/projects/${id}`);
            return response.data;
        } catch (error) {
            console.error(`API Error fetching project ${id}, using mocks:`, error);
            const mock = this.mockProjects.find(p => p.id === id);
            if (mock) return mock;
            throw error;
        }
    }

    async createProject(data: any): Promise<Project> {
        const response = await apiClient.post<Project>('/projects', data);
        return response.data;
    }

    async updateProject(id: string, data: any): Promise<Project> {
        const response = await apiClient.put<Project>(`/projects/${id}`, data); // or patch
        return response.data; // Assuming patch is supported or use put
    }

    async deleteProject(id: string): Promise<void> {
        await apiClient.delete(`/projects/${id}`);
    }

    // --- Tasks ---
    async getTasks(projectId: string): Promise<ProjectTask[]> {
        const response = await apiClient.get<ProjectTask[]>(`/project-tasks?projectId=${projectId}`);
        return response.data || [];
    }

    async createTask(data: any): Promise<ProjectTask> {
        const response = await apiClient.post<ProjectTask>('/project-tasks', data);
        return response.data;
    }

    async updateTask(id: string, data: any): Promise<ProjectTask> {
        const response = await apiClient.put<ProjectTask>(`/project-tasks/${id}`, data); // Using put for now, maybe patch
        return response.data;
    }

    async deleteTask(id: string): Promise<void> {
        await apiClient.delete(`/project-tasks/${id}`);
    }

    // --- Resources ---
    async getResources(projectId: string): Promise<ProjectResource[]> {
        try {
            const response = await apiClient.get<ProjectResource[]>(`/project-resources?projectId=${projectId}`);
            if (response.data?.length > 0) return response.data;
            // If API returns empty, fallback to mock data
            const projectResources = this.mockProjectResources.filter(r => r.projectId === projectId);
            return projectResources;
        } catch (error) {
            console.warn('API error fetching resources, using mock data:', error);
            const projectResources = this.mockProjectResources.filter(r => r.projectId === projectId);
            return projectResources;
        }
    }

    async createResource(data: any): Promise<ProjectResource> {
        const response = await apiClient.post<ProjectResource>('/project-resources', data);
        return response.data;
    }

    async updateResource(id: string, data: any): Promise<ProjectResource> {
        const response = await apiClient.put<ProjectResource>(`/project-resources/${id}`, data);
        return response.data;
    }

    async deleteResource(id: string): Promise<void> {
        await apiClient.delete(`/project-resources/${id}`);
    }

    // --- Raw list endpoints (no projectId filter) ---
    // These hit the NestJS list controllers that return a bare array (not the
    // { success, data } envelope). apiClient.get() JSON-parses the body and
    // returns it typed as ApiResponse; for a bare array the whole parsed value
    // IS the array, so we coerce defensively and always fall back to [].
    private static unwrapArray(res: unknown): any[] {
        if (Array.isArray(res)) return res as any[];
        const data = (res as { data?: unknown })?.data;
        return Array.isArray(data) ? (data as any[]) : [];
    }

    async listAllResources(): Promise<any[]> {
        const res = await apiClient.get<any[]>('/project-resources');
        return ProjectManagementService.unwrapArray(res);
    }

    async listAllMilestones(): Promise<any[]> {
        const res = await apiClient.get<any[]>('/project-milestones');
        return ProjectManagementService.unwrapArray(res);
    }

    async listAllTimeLogs(): Promise<any[]> {
        const res = await apiClient.get<any[]>('/time-logs');
        return ProjectManagementService.unwrapArray(res);
    }

    // --- Budgets ---
    async getBudgets(projectId: string): Promise<ProjectBudget[]> {
        try {
            const response = await apiClient.get<ProjectBudget[]>(`/project-budgets?projectId=${projectId}`);
            if (response.data?.length > 0) return response.data;
            // If API returns empty, fallback to mock data
            const budgets = this.mockProjectBudgets.filter(b => b.projectId === projectId);
            return budgets;
        } catch (error) {
            console.warn('API error fetching budgets, using mock data:', error);
            const budgets = this.mockProjectBudgets.filter(b => b.projectId === projectId);
            return budgets;
        }
    }

    async createBudget(data: any): Promise<ProjectBudget> {
        const response = await apiClient.post<ProjectBudget>('/project-budgets', data);
        return response.data;
    }

    async updateBudget(id: string, data: any): Promise<ProjectBudget> {
        const response = await apiClient.put<ProjectBudget>(`/project-budgets/${id}`, data);
        return response.data;
    }

    async deleteBudget(id: string): Promise<void> {
        await apiClient.delete(`/project-budgets/${id}`);
    }

    // --- Milestones ---
    async getMilestones(projectId: string): Promise<ProjectMilestone[]> {
        const response = await apiClient.get<ProjectMilestone[]>(`/project-milestones?projectId=${projectId}`);
        return response.data || [];
    }

    async createMilestone(data: any): Promise<ProjectMilestone> {
        const response = await apiClient.post<ProjectMilestone>('/project-milestones', data);
        return response.data;
    }

    async updateMilestone(id: string, data: any): Promise<ProjectMilestone> {
        const response = await apiClient.put<ProjectMilestone>(`/project-milestones/${id}`, data);
        return response.data;
    }

    async deleteMilestone(id: string): Promise<void> {
        await apiClient.delete(`/project-milestones/${id}`);
    }

    // --- Time Logs ---
    async getTimeLogs(projectId: string, userId?: string): Promise<TimeLog[]> {
        let url = `/time-logs?projectId=${projectId}`;
        if (userId) url += `&userId=${userId}`;
        const response = await apiClient.get<TimeLog[]>(url);
        return response.data || [];
    }

    async createTimeLog(data: any): Promise<TimeLog> {
        const response = await apiClient.post<TimeLog>('/time-logs', data);
        return response.data;
    }

    async updateTimeLog(id: string, data: any): Promise<TimeLog> {
        const response = await apiClient.put<TimeLog>(`/time-logs/${id}`, data);
        return response.data;
    }

    async deleteTimeLog(id: string): Promise<void> {
        await apiClient.delete(`/time-logs/${id}`);
    }

    // ... existing methods ...
    // TA Settlement Methods
    async getClaims(projectId: string): Promise<TAClaim[]> {
        try {
            const response = await apiClient.get<TAClaim[]>(`/ta-claims?projectId=${projectId}`);
            if (response.data?.length > 0) return response.data;
            return this.claims.filter(c => c.projectId === projectId);
        } catch (error) {
            console.warn('API error fetching claims, using mock data:', error);
            return this.claims.filter(c => c.projectId === projectId);
        }
    }

    async createClaim(claim: Omit<TAClaim, 'id' | 'status'>): Promise<TAClaim> {
        await new Promise(resolve => setTimeout(resolve, 800));
        const newClaim: TAClaim = {
            ...claim,
            id: `CLM-${Date.now()}`,
            status: 'Pending',
        };
        this.claims.push(newClaim);
        return newClaim;
    }

    // Emergency Spares Methods
    async getSpareRequests(projectId: string): Promise<EmergencySpareRequest[]> {
        try {
            const response = await apiClient.get<EmergencySpareRequest[]>(`/spare-requests?projectId=${projectId}`);
            if (response.data?.length > 0) return response.data;
            return this.spareRequests.filter(r => r.projectId === projectId);
        } catch (error) {
            console.warn('API error fetching spare requests, using mock data:', error);
            return this.spareRequests.filter(r => r.projectId === projectId);
        }
    }

    async createSpareRequest(request: Omit<EmergencySpareRequest, 'id' | 'status'>): Promise<EmergencySpareRequest> {
        await new Promise(resolve => setTimeout(resolve, 800));
        const newRequest: EmergencySpareRequest = {
            ...request,
            id: `SPR-${Date.now()}`,
            status: 'Pending Approval',
        };
        this.spareRequests.push(newRequest);
        return newRequest;
    }

    async updateSpareRequestStatus(id: string, status: EmergencySpareRequest['status']): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
        const request = this.spareRequests.find(r => r.id === id);
        if (request) {
            request.status = status;
        }
    }

    // Field View Methods
    async getSchedule(): Promise<FieldScheduleItem[]> {
        try {
            const response = await apiClient.get<FieldScheduleItem[]>('/field-schedule');
            if (response.data?.length > 0) return response.data;
            return [...this.schedule];
        } catch (error) {
            console.warn('API error fetching schedule, using mock data:', error);
            return [...this.schedule];
        }
    }

    async checkIn(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 600));
        // In a real app, this would verify location, etc.
    }

    async checkOut(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 600));
    }

    async getSiteMeasurements(projectId: string): Promise<RoomMeasurements[]> {
        try {
            const response = await apiClient.get<RoomMeasurements[]>(`/site-measurements?projectId=${projectId}`);
            if (response.data?.length > 0) return response.data;
            return JSON.parse(JSON.stringify(this.siteMeasurements));
        } catch (error) {
            console.warn('API error fetching site measurements, using mock data:', error);
            return JSON.parse(JSON.stringify(this.siteMeasurements));
        }
    }

    async saveSiteMeasurements(projectId: string, data: RoomMeasurements[]): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 800));
        this.siteMeasurements = data;
    }

    // Drawing Verification Methods
    async getDrawings(projectId: string): Promise<Drawing[]> {
        try {
            const response = await apiClient.get<Drawing[]>(`/drawings?projectId=${projectId}`);
            if (response.data?.length > 0) return response.data;
            // Filter mock drawings by projectId
            return this.drawings.filter(d => d.projectId === projectId);
        } catch (error) {
            console.warn('API error fetching drawings, using mock data:', error);
            // Filter mock drawings by projectId
            return this.drawings.filter(d => d.projectId === projectId);
        }
    }

    async verifyDrawing(id: string, status: 'Verified' | 'Rejected', notes?: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
        const drawing = this.drawings.find(d => d.id === id);
        if (drawing) {
            drawing.status = status;
            if (notes) drawing.notes = notes;
        }
    }

    async getBOQItems(projectId: string): Promise<BOQItem[]> {
        try {
            const response = await apiClient.get<BOQItem[]>(`/boq-items?projectId=${projectId}`);
            if (response.data?.length > 0) return response.data;
            return [...this.boqItems];
        } catch (error) {
            console.warn('API error fetching BOQ items, using mock data:', error);
            return [...this.boqItems];
        }
    }

    async updateBOQItem(id: string, drawingQty: number, notes?: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
        const itemIndex = this.boqItems.findIndex(i => i.id === id);
        if (itemIndex > -1) {
            const item = this.boqItems[itemIndex];
            const status = item.boqQty === drawingQty ? 'Match' : 'Mismatch';
            this.boqItems[itemIndex] = { ...item, drawingQty, status, notes };
        }
    }

    async getDiscrepancies(projectId: string): Promise<Discrepancy[]> {
        try {
            const response = await apiClient.get<Discrepancy[]>(`/discrepancies?projectId=${projectId}`);
            if (response.data?.length > 0) return response.data;
            return [...this.discrepancies];
        } catch (error) {
            console.warn('API error fetching discrepancies, using mock data:', error);
            return [...this.discrepancies];
        }
    }

    async createDiscrepancy(discrepancy: Omit<Discrepancy, 'id' | 'date' | 'status'>): Promise<Discrepancy> {
        await new Promise(resolve => setTimeout(resolve, 800));
        const newDiscrepancy: Discrepancy = {
            ...discrepancy,
            id: `DIS-${Math.floor(Math.random() * 1000)}`,
            date: new Date().toISOString().split('T')[0],
            status: 'Open'
        };
        this.discrepancies.unshift(newDiscrepancy);
        return newDiscrepancy;
    }

    // Site Visit Schedule
    async getSiteVisits(projectId: string): Promise<SiteVisit[]> {
        return this.siteVisits.filter(v => v.projectId === projectId);
    }

    // Drawing Revisions
    async getDrawingRevisions(projectId: string): Promise<DrawingRevision[]> {
        return this.drawingRevisions.filter(r => r.projectId === projectId);
    }

    // MEP Drawing Management
    async getMEPDrawings(projectId: string): Promise<MEPDrawing[]> {
        return this.mepDrawings.filter(d => d.projectId === projectId);
    }

    // Cabinet Marking
    async getCabinetMarkingTasks(projectId: string): Promise<CabinetMarkingTask[]> {
        return this.cabinetMarkingTasks.filter(t => t.projectId === projectId);
    }

    // Drawing Timelines
    async getDrawingTimelines(projectId: string): Promise<DrawingTimeline[]> {
        return this.drawingTimelines.filter(t => t.projectId === projectId);
    }

    // Team Assignment
    async getSupervisors(): Promise<Supervisor[]> {
        return this.supervisors;
    }

    // Site Readiness
    async getSiteReadiness(projectId: string): Promise<SiteReadiness | null> {
        return this.siteReadinessRecords.find(r => r.projectId === projectId) || null;
    }

    async updateSiteReadiness(record: SiteReadiness): Promise<void> {
        const index = this.siteReadinessRecords.findIndex(r => r.projectId === record.projectId);
        if (index >= 0) {
            this.siteReadinessRecords[index] = record;
        } else {
            this.siteReadinessRecords.push(record);
        }
    }

    // Technical Sharing
    async getTechnicalDocuments(projectId: string): Promise<TechnicalDocument[]> {
        return this.technicalDocuments.filter(d => d.projectId === projectId);
    }

    // Technical Briefing
    async getTechnicalBriefing(projectId: string): Promise<TechnicalBriefing | null> {
        return this.technicalBriefings.find(b => b.projectId === projectId) || null;
    }

    async updateTechnicalBriefing(briefing: TechnicalBriefing): Promise<void> {
        const index = this.technicalBriefings.findIndex(b => b.projectId === briefing.projectId);
        if (index >= 0) {
            this.technicalBriefings[index] = briefing;
        } else {
            this.technicalBriefings.push(briefing);
        }
    }

    // Technical Timeline (Drawings)
    async getDrawingTimeline(projectId: string): Promise<DrawingTimeline | null> {
        return this.drawingTimelines.find(t => t.projectId === projectId) || null;
    }

    async updateDrawingTimeline(timeline: DrawingTimeline): Promise<void> {
        const index = this.drawingTimelines.findIndex(t => t.projectId === timeline.projectId);
        if (index >= 0) {
            this.drawingTimelines[index] = timeline;
        } else {
            this.drawingTimelines.push(timeline);
        }
    }

    // Production Drawings
    async getProductionDrawings(projectId: string): Promise<ProductionDrawing[]> {
        return this.productionDrawings.filter(d => d.projectId === projectId);
    }

    async addProductionDrawing(drawing: ProductionDrawing): Promise<void> {
        this.productionDrawings.push(drawing);
    }

    async deleteProductionDrawing(id: string): Promise<void> {
        this.productionDrawings = this.productionDrawings.filter(d => d.id !== id);
    }

    // Accessories BOM
    async getAccessoriesBOM(projectId: string): Promise<AccessoryItem[]> {
        return this.accessoriesBOM.filter(i => i.projectId === projectId);
    }

    async addAccessoryItem(item: AccessoryItem): Promise<void> {
        this.accessoriesBOM.push(item);
    }

    async deleteAccessoryItem(id: string): Promise<void> {
        this.accessoriesBOM = this.accessoriesBOM.filter(i => i.id !== id);
    }

    // Shutter Specs
    async getShutterSpecs(projectId: string): Promise<ShutterSpecs | null> {
        return this.shutterSpecs.find(s => s.projectId === projectId) || null;
    }

    async updateShutterSpecs(specs: ShutterSpecs): Promise<void> {
        const index = this.shutterSpecs.findIndex(s => s.projectId === specs.projectId);
        if (index >= 0) {
            this.shutterSpecs[index] = specs;
        } else {
            this.shutterSpecs.push(specs);
        }
    }

    // BOM Validation
    async getBOMValidation(projectId: string): Promise<BOMValidation | null> {
        return this.bomValidations.find(v => v.projectId === projectId) || null;
    }

    async updateBOMValidation(validation: BOMValidation): Promise<void> {
        const index = this.bomValidations.findIndex(v => v.projectId === validation.projectId);
        if (index >= 0) {
            this.bomValidations[index] = validation;
        } else {
            this.bomValidations.push(validation);
        }
    }

    // BOM Reception
    async getBOMReceptions(projectId?: string): Promise<BOMReception[]> {
        if (projectId) {
            return this.bomReceptions.filter(r => r.projectId === projectId);
        }
        return this.bomReceptions;
    }

    async updateBOMReception(reception: BOMReception): Promise<void> {
        const index = this.bomReceptions.findIndex(r => r.id === reception.id);
        if (index >= 0) {
            this.bomReceptions[index] = reception;
        } else {
            this.bomReceptions.push(reception);
        }
    }

    // Stock Check
    async getStockItems(projectId: string): Promise<StockItem[]> {
        return this.stockItems.filter(i => i.projectId === projectId);
    }

    async updateStockItems(items: StockItem[]): Promise<void> {
        for (const item of items) {
            const index = this.stockItems.findIndex(i => i.id === item.id);
            if (index >= 0) {
                this.stockItems[index] = item;
            } else {
                this.stockItems.push(item);
            }
        }
    }

    async updateHandoverStatus(projectId: string, status: string): Promise<void> {
        const project = this.mockProjects.find(p => p.id === projectId);
        if (project) {
            project.handoverStatus = status as any;
        }
    }

    async getAttachments(projectId: string, category?: string): Promise<any[]> {
        return apiClient.get(`/api/project-attachments/${projectId}`, { params: { category } });
    }

    async uploadAttachment(projectId: string, data: any): Promise<any> {
        return apiClient.post(`/api/project-attachments/${projectId}`, data);
    }

    async deleteAttachment(id: string): Promise<void> {
        return apiClient.delete(`/api/project-attachments/${id}`);
    }

    async getUploadUrl(fileName: string, contentType: string): Promise<{ url: string; key: string }> {
        return apiClient.post('/api/project-attachments/simulate-upload', { fileName, contentType });
    }

    // --- Project Management module settings (NestJS) ---
    async getPmSettings(companyId = 'default'): Promise<PmSettings | null> {
        try {
            const res = await fetch(`${API_BASE_URL}/project-management/settings?companyId=${encodeURIComponent(companyId)}`);
            if (!res.ok) return null;
            return (await res.json()) as PmSettings;
        } catch (error) {
            console.error('Error fetching PM settings:', error);
            return null;
        }
    }

    async savePmSettings(data: Partial<PmSettings>, companyId = 'default'): Promise<PmSettings | null> {
        try {
            const res = await fetch(`${API_BASE_URL}/project-management/settings?companyId=${encodeURIComponent(companyId)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(`PUT settings failed: ${res.status}`);
            return (await res.json()) as PmSettings;
        } catch (error) {
            console.error('Error saving PM settings:', error);
            return null;
        }
    }

    // --- Project templates (NestJS) ---
    async listPmTemplates(companyId = 'default'): Promise<PmTemplate[]> {
        try {
            const res = await fetch(`${API_BASE_URL}/project-management/templates?companyId=${encodeURIComponent(companyId)}`);
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? (data as PmTemplate[]) : [];
        } catch (error) {
            console.error('Error fetching PM templates:', error);
            return [];
        }
    }

    async createPmTemplate(data: Partial<PmTemplate>): Promise<PmTemplate | null> {
        try {
            const res = await fetch(`${API_BASE_URL}/project-management/templates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(`POST template failed: ${res.status}`);
            return (await res.json()) as PmTemplate;
        } catch (error) {
            console.error('Error creating PM template:', error);
            return null;
        }
    }

    async deletePmTemplate(id: string): Promise<void> {
        try {
            await fetch(`${API_BASE_URL}/project-management/templates/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Error deleting PM template:', error);
        }
    }

    // --- Milestone templates (NestJS) ---
    async listMilestoneTemplates(companyId = 'default'): Promise<PmMilestoneTemplate[]> {
        try {
            const res = await fetch(`${API_BASE_URL}/project-management/milestone-templates?companyId=${encodeURIComponent(companyId)}`);
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? (data as PmMilestoneTemplate[]) : [];
        } catch (error) {
            console.error('Error fetching milestone templates:', error);
            return [];
        }
    }

    async createMilestoneTemplate(data: Partial<PmMilestoneTemplate>): Promise<PmMilestoneTemplate | null> {
        try {
            const res = await fetch(`${API_BASE_URL}/project-management/milestone-templates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(`POST milestone template failed: ${res.status}`);
            return (await res.json()) as PmMilestoneTemplate;
        } catch (error) {
            console.error('Error creating milestone template:', error);
            return null;
        }
    }

    async deleteMilestoneTemplate(id: string): Promise<void> {
        try {
            await fetch(`${API_BASE_URL}/project-management/milestone-templates/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Error deleting milestone template:', error);
        }
    }

    // --- Change orders (NestJS CRUD) ---
    async listChangeOrders(companyId = 'default'): Promise<PmChangeOrder[]> {
        try {
            const res = await fetch(`${API_BASE_URL}/project-management/change-orders?companyId=${encodeURIComponent(companyId)}`);
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? (data as PmChangeOrder[]) : [];
        } catch (error) {
            console.error('Error fetching change orders:', error);
            return [];
        }
    }

    async createChangeOrder(data: Partial<PmChangeOrder>): Promise<PmChangeOrder | null> {
        try {
            const res = await fetch(`${API_BASE_URL}/project-management/change-orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(`POST change-order failed: ${res.status}`);
            return (await res.json()) as PmChangeOrder;
        } catch (error) {
            console.error('Error creating change order:', error);
            return null;
        }
    }

    async deleteChangeOrder(id: string): Promise<void> {
        try {
            await fetch(`${API_BASE_URL}/project-management/change-orders/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Error deleting change order:', error);
        }
    }

    // --- Deliverables (NestJS CRUD) ---
    async listDeliverables(companyId = 'default'): Promise<PmDeliverable[]> {
        try {
            const res = await fetch(`${API_BASE_URL}/project-management/deliverables?companyId=${encodeURIComponent(companyId)}`);
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? (data as PmDeliverable[]) : [];
        } catch (error) {
            console.error('Error fetching deliverables:', error);
            return [];
        }
    }

    async createDeliverable(data: Partial<PmDeliverable>): Promise<PmDeliverable | null> {
        try {
            const res = await fetch(`${API_BASE_URL}/project-management/deliverables`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(`POST deliverable failed: ${res.status}`);
            return (await res.json()) as PmDeliverable;
        } catch (error) {
            console.error('Error creating deliverable:', error);
            return null;
        }
    }

    async deleteDeliverable(id: string): Promise<void> {
        try {
            await fetch(`${API_BASE_URL}/project-management/deliverables/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Error deleting deliverable:', error);
        }
    }

    // --- Issues & risks (NestJS CRUD) ---
    async listProjectIssues(companyId = 'default'): Promise<PmProjectIssue[]> {
        try {
            const res = await fetch(`${API_BASE_URL}/project-management/issues?companyId=${encodeURIComponent(companyId)}`);
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? (data as PmProjectIssue[]) : [];
        } catch (error) {
            console.error('Error fetching project issues:', error);
            return [];
        }
    }

    async createProjectIssue(data: Partial<PmProjectIssue>): Promise<PmProjectIssue | null> {
        try {
            const res = await fetch(`${API_BASE_URL}/project-management/issues`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(`POST issue failed: ${res.status}`);
            return (await res.json()) as PmProjectIssue;
        } catch (error) {
            console.error('Error creating project issue:', error);
            return null;
        }
    }

    async deleteProjectIssue(id: string): Promise<void> {
        try {
            await fetch(`${API_BASE_URL}/project-management/issues/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Error deleting project issue:', error);
        }
    }

    // --- Analytics summary (NestJS, aggregated) ---
    async getPmAnalyticsSummary(): Promise<PmAnalyticsSummary | null> {
        try {
            const res = await fetch(`${API_BASE_URL}/project-management/analytics/summary`);
            if (!res.ok) return null;
            return (await res.json()) as PmAnalyticsSummary;
        } catch (error) {
            console.error('Error fetching PM analytics summary:', error);
            return null;
        }
    }

    // --- Generic CRUD helper for new PM list features ---
    private async pmList<T>(feature: string, companyId = 'default'): Promise<T[]> {
        try {
            const res = await fetch(`${API_BASE_URL}/project-management/${feature}?companyId=${encodeURIComponent(companyId)}`);
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? (data as T[]) : [];
        } catch (error) {
            console.error(`Error fetching ${feature}:`, error);
            return [];
        }
    }

    private async pmCreate<T>(feature: string, data: Partial<T>): Promise<T | null> {
        try {
            const res = await fetch(`${API_BASE_URL}/project-management/${feature}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(`POST ${feature} failed: ${res.status}`);
            return (await res.json()) as T;
        } catch (error) {
            console.error(`Error creating ${feature}:`, error);
            return null;
        }
    }

    private async pmUpdate<T>(feature: string, id: string, data: Partial<T>): Promise<T | null> {
        try {
            const res = await fetch(`${API_BASE_URL}/project-management/${feature}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(`PUT ${feature} failed: ${res.status}`);
            return (await res.json()) as T;
        } catch (error) {
            console.error(`Error updating ${feature}:`, error);
            return null;
        }
    }

    private async pmDelete(feature: string, id: string): Promise<void> {
        try {
            await fetch(`${API_BASE_URL}/project-management/${feature}/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error(`Error deleting ${feature}:`, error);
        }
    }

    // Site issues
    listSiteIssues(companyId = 'default') { return this.pmList<PmSiteIssue>('site-issues', companyId); }
    createSiteIssue(data: Partial<PmSiteIssue>) { return this.pmCreate<PmSiteIssue>('site-issues', data); }
    updateSiteIssue(id: string, data: Partial<PmSiteIssue>) { return this.pmUpdate<PmSiteIssue>('site-issues', id, data); }
    deleteSiteIssue(id: string) { return this.pmDelete('site-issues', id); }

    // Material consumption
    listMaterialConsumption(companyId = 'default') { return this.pmList<PmMaterialConsumption>('material-consumption', companyId); }
    createMaterialConsumption(data: Partial<PmMaterialConsumption>) { return this.pmCreate<PmMaterialConsumption>('material-consumption', data); }
    updateMaterialConsumption(id: string, data: Partial<PmMaterialConsumption>) { return this.pmUpdate<PmMaterialConsumption>('material-consumption', id, data); }
    deleteMaterialConsumption(id: string) { return this.pmDelete('material-consumption', id); }

    // Labor tracking
    listLaborEntries(companyId = 'default') { return this.pmList<PmLaborEntry>('labor-tracking', companyId); }
    createLaborEntry(data: Partial<PmLaborEntry>) { return this.pmCreate<PmLaborEntry>('labor-tracking', data); }
    updateLaborEntry(id: string, data: Partial<PmLaborEntry>) { return this.pmUpdate<PmLaborEntry>('labor-tracking', id, data); }
    deleteLaborEntry(id: string) { return this.pmDelete('labor-tracking', id); }

    // Project costing
    listProjectCosts(companyId = 'default') { return this.pmList<PmProjectCost>('project-costing', companyId); }
    createProjectCost(data: Partial<PmProjectCost>) { return this.pmCreate<PmProjectCost>('project-costing', data); }
    updateProjectCost(id: string, data: Partial<PmProjectCost>) { return this.pmUpdate<PmProjectCost>('project-costing', id, data); }
    deleteProjectCost(id: string) { return this.pmDelete('project-costing', id); }

    // Commissioning
    listCommissioningActivities(companyId = 'default') { return this.pmList<PmCommissioningActivity>('commissioning', companyId); }
    createCommissioningActivity(data: Partial<PmCommissioningActivity>) { return this.pmCreate<PmCommissioningActivity>('commissioning', data); }
    updateCommissioningActivity(id: string, data: Partial<PmCommissioningActivity>) { return this.pmUpdate<PmCommissioningActivity>('commissioning', id, data); }
    deleteCommissioningActivity(id: string) { return this.pmDelete('commissioning', id); }

    // Customer acceptance
    listCustomerAcceptances(companyId = 'default') { return this.pmList<PmCustomerAcceptance>('customer-acceptance', companyId); }
    createCustomerAcceptance(data: Partial<PmCustomerAcceptance>) { return this.pmCreate<PmCustomerAcceptance>('customer-acceptance', data); }
    updateCustomerAcceptance(id: string, data: Partial<PmCustomerAcceptance>) { return this.pmUpdate<PmCustomerAcceptance>('customer-acceptance', id, data); }
    deleteCustomerAcceptance(id: string) { return this.pmDelete('customer-acceptance', id); }

    // Profitability
    listProfitability(companyId = 'default') { return this.pmList<PmProjectProfitability>('profitability', companyId); }
    createProfitability(data: Partial<PmProjectProfitability>) { return this.pmCreate<PmProjectProfitability>('profitability', data); }
    updateProfitability(id: string, data: Partial<PmProjectProfitability>) { return this.pmUpdate<PmProjectProfitability>('profitability', id, data); }
    deleteProfitability(id: string) { return this.pmDelete('profitability', id); }

    // Briefings
    listBriefings(companyId = 'default') { return this.pmList<PmLayoutBriefing>('briefings', companyId); }
    createBriefing(data: Partial<PmLayoutBriefing>) { return this.pmCreate<PmLayoutBriefing>('briefings', data); }
    updateBriefing(id: string, data: Partial<PmLayoutBriefing>) { return this.pmUpdate<PmLayoutBriefing>('briefings', id, data); }
    deleteBriefing(id: string) { return this.pmDelete('briefings', id); }

    // Progress entries
    listProgressEntries(companyId = 'default') { return this.pmList<PmProgressEntry>('progress', companyId); }
    createProgressEntry(data: Partial<PmProgressEntry>) { return this.pmCreate<PmProgressEntry>('progress', data); }
    updateProgressEntry(id: string, data: Partial<PmProgressEntry>) { return this.pmUpdate<PmProgressEntry>('progress', id, data); }
    deleteProgressEntry(id: string) { return this.pmDelete('progress', id); }
}

export const projectManagementService = new ProjectManagementService();
