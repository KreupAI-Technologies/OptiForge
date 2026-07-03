// Non-Conformance Report (NCR) Service
// Handles NCR operations for the Quality Module

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = true;

// ==================== ENUMS ====================

export enum NCRStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  CONTAINMENT = 'containment',
  ROOT_CAUSE = 'root_cause',
  DISPOSITION = 'disposition',
  CAPA_REQUIRED = 'capa_required',
  CAPA_IN_PROGRESS = 'capa_in_progress',
  VERIFICATION = 'verification',
  CLOSED = 'closed',
  REJECTED = 'rejected',
}

export enum NCRCategory {
  MATERIAL = 'material',
  PROCESS = 'process',
  EQUIPMENT = 'equipment',
  HUMAN_ERROR = 'human_error',
  DESIGN = 'design',
  SUPPLIER = 'supplier',
  CUSTOMER_COMPLAINT = 'customer_complaint',
  DOCUMENTATION = 'documentation',
  ENVIRONMENTAL = 'environmental',
  OTHER = 'other',
}

export enum NCRSeverity {
  CRITICAL = 'critical',
  MAJOR = 'major',
  MINOR = 'minor',
}

export enum NCRPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum DispositionType {
  USE_AS_IS = 'use_as_is',
  REWORK = 'rework',
  REPAIR = 'repair',
  SCRAP = 'scrap',
  RETURN_TO_SUPPLIER = 'return_to_supplier',
  SORT_AND_SCREEN = 'sort_and_screen',
  CUSTOMER_CONCESSION = 'customer_concession',
  DOWNGRADE = 'downgrade',
}

// ==================== INTERFACES ====================

export interface NCRDefect {
  id: string;
  code: string;
  description: string;
  quantity: number;
  location?: string;
  imageUrls?: string[];
}

export interface ContainmentAction {
  id: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  dueDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed';
  result?: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedDate?: Date;
}

export interface RootCauseAnalysis {
  method: string; // 5-Why, Fishbone, 8D, etc.
  description: string;
  findings: string[];
  rootCause: string;
  contributingFactors?: string[];
  analyzedBy: string;
  analyzedDate: Date;
  attachments?: string[];
}

export interface NCRDisposition {
  type: DispositionType;
  description: string;
  quantity: number;
  cost?: number;
  approvedBy: string;
  approvedDate: Date;
  executedBy?: string;
  executedDate?: Date;
  notes?: string;
}

export interface NCRAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: Date;
  uploadedBy: string;
  category: 'evidence' | 'document' | 'photo' | 'report';
}

export interface NCR {
  id: string;
  ncrNumber: string;
  title: string;
  description: string;
  status: NCRStatus;
  category: NCRCategory;
  severity: NCRSeverity;
  priority: NCRPriority;

  // Source Information
  sourceType: 'inspection' | 'production' | 'customer' | 'supplier' | 'audit' | 'internal';
  sourceId?: string;
  sourceReference?: string;
  inspectionId?: string;
  inspectionNumber?: string;

  // Product Information
  productId?: string;
  productName: string;
  productCode: string;
  batchNumber?: string;
  lotNumber?: string;
  serialNumber?: string;

  // Quantity Details
  totalQuantity: number;
  affectedQuantity: number;
  defects: NCRDefect[];

  // Location
  discoveredLocation: string;
  workstation?: string;
  processStep?: string;

  // Discovery Information
  discoveredDate: Date;
  discoveredBy: string;
  discoveredByName: string;
  reportedDate: Date;

  // Containment
  containmentActions: ContainmentAction[];
  containmentStatus: 'not_required' | 'pending' | 'in_progress' | 'completed';

  // Root Cause Analysis
  rootCauseAnalysis?: RootCauseAnalysis;
  isRecurring: boolean;
  previousNCRs?: string[];

  // Disposition
  dispositions: NCRDisposition[];
  totalDispositionCost?: number;

  // CAPA Link
  capaRequired: boolean;
  capaId?: string;
  capaNumber?: string;

  // Customer Impact
  customerImpacted: boolean;
  customerName?: string;
  customerNotified?: boolean;
  customerNotifiedDate?: Date;

  // Supplier Impact
  supplierImpacted: boolean;
  supplierId?: string;
  supplierName?: string;
  supplierNotified?: boolean;
  supplierNotifiedDate?: Date;

  // Cost Impact
  estimatedCost?: number;
  actualCost?: number;
  costCategory?: string;

  // Closure
  closedBy?: string;
  closedByName?: string;
  closedDate?: Date;
  closureNotes?: string;
  effectivenessVerified?: boolean;
  effectivenessVerifiedBy?: string;
  effectivenessVerifiedDate?: Date;

  // Attachments
  attachments: NCRAttachment[];

  // Audit Fields
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface CreateNCRDto {
  title: string;
  description: string;
  category: NCRCategory;
  severity: NCRSeverity;
  priority: NCRPriority;
  sourceType: 'inspection' | 'production' | 'customer' | 'supplier' | 'audit' | 'internal';
  sourceId?: string;
  sourceReference?: string;
  inspectionId?: string;
  productId?: string;
  productName: string;
  productCode: string;
  batchNumber?: string;
  lotNumber?: string;
  totalQuantity: number;
  affectedQuantity: number;
  defects?: NCRDefect[];
  discoveredLocation: string;
  workstation?: string;
  processStep?: string;
  discoveredBy: string;
  discoveredByName: string;
  customerImpacted?: boolean;
  customerName?: string;
  supplierImpacted?: boolean;
  supplierId?: string;
  supplierName?: string;
}

export interface UpdateNCRDto extends Partial<CreateNCRDto> {
  status?: NCRStatus;
  containmentActions?: ContainmentAction[];
  rootCauseAnalysis?: RootCauseAnalysis;
  dispositions?: NCRDisposition[];
  capaRequired?: boolean;
  capaId?: string;
  closureNotes?: string;
}

export interface NCRFilters {
  status?: NCRStatus;
  category?: NCRCategory;
  severity?: NCRSeverity;
  priority?: NCRPriority;
  sourceType?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

// ==================== MOCK DATA ====================

export const MOCK_NCRS: NCR[] = [
  {
    id: 'ncr-001',
    ncrNumber: 'NCR-2024-0001',
    title: 'Dimensional Non-Conformance on Steel Shaft',
    description: 'Steel shaft assembly dimensions out of tolerance. Length exceeds upper specification limit.',
    status: NCRStatus.CAPA_IN_PROGRESS,
    category: NCRCategory.PROCESS,
    severity: NCRSeverity.MAJOR,
    priority: NCRPriority.HIGH,
    sourceType: 'inspection',
    sourceId: 'insp-003',
    sourceReference: 'INS-2024-0003',
    inspectionId: 'insp-003',
    inspectionNumber: 'INS-2024-0003',
    productId: 'prod-003',
    productName: 'Precision Gearbox',
    productCode: 'PGB-300',
    batchNumber: 'BATCH-2024-003',
    lotNumber: 'LOT-003',
    totalQuantity: 50,
    affectedQuantity: 5,
    defects: [
      {
        id: 'def-001',
        code: 'DIM-001',
        description: 'Length out of tolerance (+0.8mm)',
        quantity: 3,
        location: 'Main shaft section',
      },
      {
        id: 'def-002',
        code: 'DIM-002',
        description: 'Width out of tolerance (+0.4mm)',
        quantity: 2,
        location: 'Mounting flange',
      },
    ],
    discoveredLocation: 'QC Department',
    workstation: 'Final Inspection Bay',
    processStep: 'Final Inspection',
    discoveredDate: new Date('2024-01-17'),
    discoveredBy: 'emp-001',
    discoveredByName: 'John Smith',
    reportedDate: new Date('2024-01-17'),
    containmentActions: [
      {
        id: 'ca-001',
        description: 'Quarantine all parts from batch BATCH-2024-003',
        assignedTo: 'emp-003',
        assignedToName: 'Mike Wilson',
        dueDate: new Date('2024-01-17'),
        completedDate: new Date('2024-01-17'),
        status: 'completed',
        result: '50 parts quarantined in QC Hold area',
        verified: true,
        verifiedBy: 'emp-001',
        verifiedDate: new Date('2024-01-17'),
      },
      {
        id: 'ca-002',
        description: '100% inspection of remaining parts in batch',
        assignedTo: 'emp-002',
        assignedToName: 'Sarah Johnson',
        dueDate: new Date('2024-01-18'),
        completedDate: new Date('2024-01-18'),
        status: 'completed',
        result: 'Additional 2 non-conforming parts identified',
        verified: true,
        verifiedBy: 'emp-001',
        verifiedDate: new Date('2024-01-18'),
      },
    ],
    containmentStatus: 'completed',
    rootCauseAnalysis: {
      method: '5-Why Analysis',
      description: 'Root cause analysis performed to identify why dimensional non-conformance occurred',
      findings: [
        'CNC machine tool wear exceeded tolerance limits',
        'Tool change schedule not followed',
        'Operator training gap on tool wear monitoring',
      ],
      rootCause: 'Tool wear not detected due to missed scheduled tool change and inadequate monitoring',
      contributingFactors: ['Heavy production schedule', 'Tool wear monitoring system offline'],
      analyzedBy: 'emp-004',
      analyzedDate: new Date('2024-01-19'),
    },
    isRecurring: false,
    dispositions: [
      {
        type: DispositionType.REWORK,
        description: 'Re-machine affected shafts to specification',
        quantity: 3,
        cost: 450,
        approvedBy: 'emp-004',
        approvedDate: new Date('2024-01-19'),
        executedBy: 'emp-005',
        executedDate: new Date('2024-01-20'),
      },
      {
        type: DispositionType.SCRAP,
        description: 'Scrap parts with excessive material removal',
        quantity: 2,
        cost: 320,
        approvedBy: 'emp-004',
        approvedDate: new Date('2024-01-19'),
      },
    ],
    totalDispositionCost: 770,
    capaRequired: true,
    capaId: 'capa-001',
    capaNumber: 'CAPA-2024-0001',
    customerImpacted: false,
    supplierImpacted: false,
    estimatedCost: 1000,
    actualCost: 770,
    costCategory: 'Internal Quality',
    attachments: [
      {
        id: 'att-001',
        fileName: 'inspection-report.pdf',
        fileType: 'application/pdf',
        fileSize: 245000,
        fileUrl: '/attachments/ncr-001/inspection-report.pdf',
        uploadedAt: new Date('2024-01-17'),
        uploadedBy: 'emp-001',
        category: 'report',
      },
    ],
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-20'),
    createdBy: 'emp-001',
    updatedBy: 'emp-004',
  },
  {
    id: 'ncr-002',
    ncrNumber: 'NCR-2024-0002',
    title: 'Supplier Material Defect - Cast Iron Valve Bodies',
    description: 'Multiple dimensional and porosity defects found in incoming cast iron valve bodies from supplier ABC Foundry.',
    status: NCRStatus.DISPOSITION,
    category: NCRCategory.SUPPLIER,
    severity: NCRSeverity.CRITICAL,
    priority: NCRPriority.HIGH,
    sourceType: 'inspection',
    sourceId: 'insp-005',
    sourceReference: 'INS-2024-0005',
    inspectionId: 'insp-005',
    inspectionNumber: 'INS-2024-0005',
    productId: 'prod-005',
    productName: 'Cast Iron Valve Body',
    productCode: 'CIV-500',
    batchNumber: 'BATCH-2024-005',
    totalQuantity: 100,
    affectedQuantity: 47,
    defects: [
      {
        id: 'def-003',
        code: 'POR-001',
        description: 'Porosity in casting exceeding AQL',
        quantity: 25,
        location: 'Internal bore area',
      },
      {
        id: 'def-004',
        code: 'DIM-003',
        description: 'Flange bolt holes misaligned',
        quantity: 15,
        location: 'Mounting flange',
      },
      {
        id: 'def-005',
        code: 'SUR-001',
        description: 'Surface finish not meeting specification',
        quantity: 7,
        location: 'Sealing surfaces',
      },
    ],
    discoveredLocation: 'Receiving Inspection',
    workstation: 'Inspection Table 1',
    processStep: 'Incoming Inspection',
    discoveredDate: new Date('2024-01-19'),
    discoveredBy: 'emp-003',
    discoveredByName: 'Mike Wilson',
    reportedDate: new Date('2024-01-19'),
    containmentActions: [
      {
        id: 'ca-003',
        description: 'Quarantine entire shipment',
        assignedTo: 'emp-003',
        assignedToName: 'Mike Wilson',
        dueDate: new Date('2024-01-19'),
        completedDate: new Date('2024-01-19'),
        status: 'completed',
        result: 'Shipment quarantined in receiving dock',
        verified: true,
        verifiedBy: 'emp-002',
        verifiedDate: new Date('2024-01-19'),
      },
      {
        id: 'ca-004',
        description: 'Notify supplier and request corrective action',
        assignedTo: 'emp-006',
        assignedToName: 'Lisa Anderson',
        dueDate: new Date('2024-01-20'),
        completedDate: new Date('2024-01-20'),
        status: 'completed',
        result: 'Supplier notified. Awaiting 8D response.',
        verified: true,
        verifiedBy: 'emp-002',
        verifiedDate: new Date('2024-01-20'),
      },
    ],
    containmentStatus: 'completed',
    rootCauseAnalysis: {
      method: '8D Analysis',
      description: 'Supplier 8D analysis in progress',
      findings: [
        'Pattern equipment wear',
        'Sand mixture inconsistency',
        'Temperature control issues during pouring',
      ],
      rootCause: 'Supplier process control failures - Pending full 8D from supplier',
      analyzedBy: 'emp-006',
      analyzedDate: new Date('2024-01-21'),
    },
    isRecurring: true,
    previousNCRs: ['NCR-2023-0089'],
    dispositions: [],
    capaRequired: true,
    capaId: 'capa-002',
    capaNumber: 'CAPA-2024-0002',
    customerImpacted: false,
    supplierImpacted: true,
    supplierId: 'sup-001',
    supplierName: 'ABC Foundry',
    supplierNotified: true,
    supplierNotifiedDate: new Date('2024-01-20'),
    estimatedCost: 5000,
    costCategory: 'Supplier Quality',
    attachments: [
      {
        id: 'att-002',
        fileName: 'porosity-photos.zip',
        fileType: 'application/zip',
        fileSize: 15000000,
        fileUrl: '/attachments/ncr-002/porosity-photos.zip',
        uploadedAt: new Date('2024-01-19'),
        uploadedBy: 'emp-003',
        category: 'photo',
      },
      {
        id: 'att-003',
        fileName: 'dimensional-report.xlsx',
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileSize: 45000,
        fileUrl: '/attachments/ncr-002/dimensional-report.xlsx',
        uploadedAt: new Date('2024-01-19'),
        uploadedBy: 'emp-003',
        category: 'report',
      },
    ],
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-21'),
    createdBy: 'emp-003',
    updatedBy: 'emp-006',
  },
  {
    id: 'ncr-003',
    ncrNumber: 'NCR-2024-0003',
    title: 'Customer Complaint - Hydraulic Seal Leakage',
    description: 'Customer reported hydraulic fluid leakage from seal assembly in delivered units.',
    status: NCRStatus.ROOT_CAUSE,
    category: NCRCategory.CUSTOMER_COMPLAINT,
    severity: NCRSeverity.CRITICAL,
    priority: NCRPriority.HIGH,
    sourceType: 'customer',
    sourceReference: 'CC-2024-0015',
    productId: 'prod-011',
    productName: 'Hydraulic Seal Assembly',
    productCode: 'HSA-1100',
    batchNumber: 'BATCH-2024-011',
    lotNumber: 'LOT-011',
    serialNumber: 'SN-2024-001 to SN-2024-010',
    totalQuantity: 10,
    affectedQuantity: 3,
    defects: [
      {
        id: 'def-006',
        code: 'SEAL-001',
        description: 'O-ring seal failure causing fluid leakage',
        quantity: 3,
        location: 'Main seal groove',
      },
    ],
    discoveredLocation: 'Customer Site - XYZ Manufacturing',
    processStep: 'Field Operation',
    discoveredDate: new Date('2024-01-20'),
    discoveredBy: 'ext-001',
    discoveredByName: 'Customer Service Rep',
    reportedDate: new Date('2024-01-20'),
    containmentActions: [
      {
        id: 'ca-005',
        description: 'Contact customer for immediate support',
        assignedTo: 'emp-007',
        assignedToName: 'Robert Chen',
        dueDate: new Date('2024-01-20'),
        completedDate: new Date('2024-01-20'),
        status: 'completed',
        result: 'Customer contacted. Replacement units being prepared.',
        verified: true,
        verifiedBy: 'emp-002',
        verifiedDate: new Date('2024-01-20'),
      },
      {
        id: 'ca-006',
        description: 'Ship replacement units to customer',
        assignedTo: 'emp-008',
        assignedToName: 'Emily Davis',
        dueDate: new Date('2024-01-22'),
        status: 'in_progress',
        verified: false,
      },
      {
        id: 'ca-007',
        description: 'Retrieve failed units for analysis',
        assignedTo: 'emp-007',
        assignedToName: 'Robert Chen',
        dueDate: new Date('2024-01-23'),
        status: 'pending',
        verified: false,
      },
    ],
    containmentStatus: 'in_progress',
    isRecurring: false,
    dispositions: [],
    capaRequired: true,
    customerImpacted: true,
    customerName: 'XYZ Manufacturing',
    customerNotified: true,
    customerNotifiedDate: new Date('2024-01-20'),
    supplierImpacted: false,
    estimatedCost: 8000,
    costCategory: 'Customer Quality',
    attachments: [
      {
        id: 'att-004',
        fileName: 'customer-complaint-form.pdf',
        fileType: 'application/pdf',
        fileSize: 125000,
        fileUrl: '/attachments/ncr-003/customer-complaint-form.pdf',
        uploadedAt: new Date('2024-01-20'),
        uploadedBy: 'emp-007',
        category: 'document',
      },
    ],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-21'),
    createdBy: 'emp-007',
    updatedBy: 'emp-007',
  },
  {
    id: 'ncr-004',
    ncrNumber: 'NCR-2024-0004',
    title: 'Documentation Error - Incorrect Assembly Instructions',
    description: 'Assembly instructions document contained incorrect torque specifications for fastener installation.',
    status: NCRStatus.CLOSED,
    category: NCRCategory.DOCUMENTATION,
    severity: NCRSeverity.MINOR,
    priority: NCRPriority.MEDIUM,
    sourceType: 'internal',
    sourceReference: 'INT-2024-0022',
    productId: 'prod-012',
    productName: 'Motor Mount Assembly',
    productCode: 'MMA-1200',
    totalQuantity: 100,
    affectedQuantity: 0,
    defects: [
      {
        id: 'def-007',
        code: 'DOC-001',
        description: 'Incorrect torque value in assembly instruction (50 Nm instead of 45 Nm)',
        quantity: 1,
      },
    ],
    discoveredLocation: 'Assembly Line',
    workstation: 'Assembly Station 5',
    processStep: 'Final Assembly',
    discoveredDate: new Date('2024-01-18'),
    discoveredBy: 'emp-009',
    discoveredByName: 'Carlos Martinez',
    reportedDate: new Date('2024-01-18'),
    containmentActions: [
      {
        id: 'ca-008',
        description: 'Issue corrected instructions to assembly floor',
        assignedTo: 'emp-010',
        assignedToName: 'Jennifer Lee',
        dueDate: new Date('2024-01-18'),
        completedDate: new Date('2024-01-18'),
        status: 'completed',
        result: 'Corrected instructions distributed. Old copies collected.',
        verified: true,
        verifiedBy: 'emp-002',
        verifiedDate: new Date('2024-01-18'),
      },
    ],
    containmentStatus: 'completed',
    rootCauseAnalysis: {
      method: '5-Why Analysis',
      description: 'Analysis to determine why incorrect specification was published',
      findings: [
        'Document revision control not followed',
        'Engineering change notice not properly reviewed',
        'Multiple document versions in circulation',
      ],
      rootCause: 'Document revision control process not followed during engineering change',
      analyzedBy: 'emp-010',
      analyzedDate: new Date('2024-01-19'),
    },
    isRecurring: false,
    dispositions: [
      {
        type: DispositionType.USE_AS_IS,
        description: 'No product impact - documentation error only. All assemblies verified correct.',
        quantity: 100,
        cost: 0,
        approvedBy: 'emp-004',
        approvedDate: new Date('2024-01-19'),
      },
    ],
    totalDispositionCost: 0,
    capaRequired: false,
    customerImpacted: false,
    supplierImpacted: false,
    estimatedCost: 200,
    actualCost: 150,
    costCategory: 'Internal Quality',
    closedBy: 'emp-002',
    closedByName: 'Sarah Johnson',
    closedDate: new Date('2024-01-20'),
    closureNotes: 'Documentation corrected. All assemblies verified. No product impact.',
    effectivenessVerified: true,
    effectivenessVerifiedBy: 'emp-002',
    effectivenessVerifiedDate: new Date('2024-01-20'),
    attachments: [],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-20'),
    createdBy: 'emp-009',
    updatedBy: 'emp-002',
  },
  {
    id: 'ncr-005',
    ncrNumber: 'NCR-2024-0005',
    title: 'Equipment Calibration Drift - CMM Machine',
    description: 'CMM machine calibration drift detected during routine verification. Potential impact on measurements taken in past 2 weeks.',
    status: NCRStatus.VERIFICATION,
    category: NCRCategory.EQUIPMENT,
    severity: NCRSeverity.MAJOR,
    priority: NCRPriority.HIGH,
    sourceType: 'audit',
    sourceReference: 'CAL-2024-0005',
    productId: 'prod-000',
    productName: 'Multiple Products',
    productCode: 'VARIOUS',
    totalQuantity: 500,
    affectedQuantity: 500,
    defects: [
      {
        id: 'def-008',
        code: 'CAL-001',
        description: 'X-axis measurement drift of 0.015mm beyond tolerance',
        quantity: 1,
        location: 'CMM Machine #2',
      },
    ],
    discoveredLocation: 'QC Lab',
    workstation: 'CMM Room',
    processStep: 'Calibration Verification',
    discoveredDate: new Date('2024-01-21'),
    discoveredBy: 'emp-011',
    discoveredByName: 'Thomas Brown',
    reportedDate: new Date('2024-01-21'),
    containmentActions: [
      {
        id: 'ca-009',
        description: 'Take CMM out of service for recalibration',
        assignedTo: 'emp-011',
        assignedToName: 'Thomas Brown',
        dueDate: new Date('2024-01-21'),
        completedDate: new Date('2024-01-21'),
        status: 'completed',
        result: 'CMM tagged out of service. Calibration vendor contacted.',
        verified: true,
        verifiedBy: 'emp-002',
        verifiedDate: new Date('2024-01-21'),
      },
      {
        id: 'ca-010',
        description: 'Identify all parts measured on CMM in past 2 weeks',
        assignedTo: 'emp-001',
        assignedToName: 'John Smith',
        dueDate: new Date('2024-01-22'),
        completedDate: new Date('2024-01-22'),
        status: 'completed',
        result: '15 batches identified. Re-inspection list created.',
        verified: true,
        verifiedBy: 'emp-002',
        verifiedDate: new Date('2024-01-22'),
      },
      {
        id: 'ca-011',
        description: 'Re-inspect critical dimension parts on backup CMM',
        assignedTo: 'emp-001',
        assignedToName: 'John Smith',
        dueDate: new Date('2024-01-24'),
        status: 'in_progress',
        verified: false,
      },
    ],
    containmentStatus: 'in_progress',
    rootCauseAnalysis: {
      method: 'Equipment Failure Analysis',
      description: 'Analysis of CMM calibration drift cause',
      findings: [
        'Air bearing wear detected',
        'Temperature fluctuations in CMM room',
        'Calibration verification frequency insufficient',
      ],
      rootCause: 'Air bearing wear combined with temperature variations caused measurement drift',
      contributingFactors: ['Extended verification interval', 'HVAC inconsistency in CMM room'],
      analyzedBy: 'emp-011',
      analyzedDate: new Date('2024-01-22'),
    },
    isRecurring: false,
    dispositions: [],
    capaRequired: true,
    capaId: 'capa-003',
    capaNumber: 'CAPA-2024-0003',
    customerImpacted: false,
    supplierImpacted: false,
    estimatedCost: 3500,
    costCategory: 'Equipment Quality',
    attachments: [
      {
        id: 'att-005',
        fileName: 'calibration-report.pdf',
        fileType: 'application/pdf',
        fileSize: 350000,
        fileUrl: '/attachments/ncr-005/calibration-report.pdf',
        uploadedAt: new Date('2024-01-21'),
        uploadedBy: 'emp-011',
        category: 'report',
      },
    ],
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-22'),
    createdBy: 'emp-011',
    updatedBy: 'emp-011',
  },
];

// ==================== SERVICE CLASS ====================

export class NCRService {
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

  // Get all NCRs with optional filters
  static async getAllNCRs(filters?: NCRFilters): Promise<NCR[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredNCRs = [...MOCK_NCRS];

      if (filters) {
        if (filters.status) {
          filteredNCRs = filteredNCRs.filter((n) => n.status === filters.status);
        }
        if (filters.category) {
          filteredNCRs = filteredNCRs.filter((n) => n.category === filters.category);
        }
        if (filters.severity) {
          filteredNCRs = filteredNCRs.filter((n) => n.severity === filters.severity);
        }
        if (filters.priority) {
          filteredNCRs = filteredNCRs.filter((n) => n.priority === filters.priority);
        }
        if (filters.sourceType) {
          filteredNCRs = filteredNCRs.filter((n) => n.sourceType === filters.sourceType);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredNCRs = filteredNCRs.filter(
            (n) =>
              n.ncrNumber.toLowerCase().includes(searchLower) ||
              n.title.toLowerCase().includes(searchLower) ||
              n.productName.toLowerCase().includes(searchLower) ||
              n.description.toLowerCase().includes(searchLower)
          );
        }
      }

      return filteredNCRs;
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const queryString = params.toString();
    return this.request<NCR[]>(`/quality/ncr${queryString ? `?${queryString}` : ''}`);
  }

  // Get NCR by ID
  static async getNCRById(id: string): Promise<NCR> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const ncr = MOCK_NCRS.find((n) => n.id === id);
      if (!ncr) {
        throw new Error('NCR not found');
      }
      return ncr;
    }
    return this.request<NCR>(`/quality/ncr/${id}`);
  }

  // Create a new NCR
  static async createNCR(data: CreateNCRDto): Promise<NCR> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newNCR: NCR = {
        id: `ncr-${Date.now()}`,
        ncrNumber: `NCR-2024-${String(MOCK_NCRS.length + 1).padStart(4, '0')}`,
        title: data.title,
        description: data.description,
        status: NCRStatus.DRAFT,
        category: data.category,
        severity: data.severity,
        priority: data.priority,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        sourceReference: data.sourceReference,
        inspectionId: data.inspectionId,
        productId: data.productId,
        productName: data.productName,
        productCode: data.productCode,
        batchNumber: data.batchNumber,
        lotNumber: data.lotNumber,
        totalQuantity: data.totalQuantity,
        affectedQuantity: data.affectedQuantity,
        defects: data.defects || [],
        discoveredLocation: data.discoveredLocation,
        workstation: data.workstation,
        processStep: data.processStep,
        discoveredDate: new Date(),
        discoveredBy: data.discoveredBy,
        discoveredByName: data.discoveredByName,
        reportedDate: new Date(),
        containmentActions: [],
        containmentStatus: 'pending',
        isRecurring: false,
        dispositions: [],
        capaRequired: false,
        customerImpacted: data.customerImpacted || false,
        customerName: data.customerName,
        supplierImpacted: data.supplierImpacted || false,
        supplierId: data.supplierId,
        supplierName: data.supplierName,
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: data.discoveredBy,
        updatedBy: data.discoveredBy,
      };
      MOCK_NCRS.push(newNCR);
      return newNCR;
    }

    return this.request<NCR>('/quality/ncr', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update an NCR
  static async updateNCR(id: string, data: UpdateNCRDto): Promise<NCR> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_NCRS.findIndex((n) => n.id === id);
      if (index === -1) {
        throw new Error('NCR not found');
      }

      MOCK_NCRS[index] = {
        ...MOCK_NCRS[index],
        ...data,
        updatedAt: new Date(),
      };
      return MOCK_NCRS[index];
    }

    return this.request<NCR>(`/quality/ncr/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Add containment action
  static async addContainmentAction(id: string, action: Omit<ContainmentAction, 'id'>): Promise<NCR> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_NCRS.findIndex((n) => n.id === id);
      if (index === -1) {
        throw new Error('NCR not found');
      }

      const newAction: ContainmentAction = {
        ...action,
        id: `ca-${Date.now()}`,
      };

      MOCK_NCRS[index].containmentActions.push(newAction);
      MOCK_NCRS[index].updatedAt = new Date();

      return MOCK_NCRS[index];
    }

    return this.request<NCR>(`/quality/ncr/${id}/containment`, {
      method: 'POST',
      body: JSON.stringify(action),
    });
  }

  // Add disposition
  static async addDisposition(id: string, disposition: Omit<NCRDisposition, 'id'>): Promise<NCR> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_NCRS.findIndex((n) => n.id === id);
      if (index === -1) {
        throw new Error('NCR not found');
      }

      MOCK_NCRS[index].dispositions.push(disposition);
      MOCK_NCRS[index].totalDispositionCost = MOCK_NCRS[index].dispositions.reduce(
        (sum, d) => sum + (d.cost || 0),
        0
      );
      MOCK_NCRS[index].updatedAt = new Date();

      return MOCK_NCRS[index];
    }

    return this.request<NCR>(`/quality/ncr/${id}/disposition`, {
      method: 'POST',
      body: JSON.stringify(disposition),
    });
  }

  // Close NCR
  static async closeNCR(id: string, closureData: { closedBy: string; closedByName: string; closureNotes: string }): Promise<NCR> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_NCRS.findIndex((n) => n.id === id);
      if (index === -1) {
        throw new Error('NCR not found');
      }

      MOCK_NCRS[index] = {
        ...MOCK_NCRS[index],
        status: NCRStatus.CLOSED,
        closedBy: closureData.closedBy,
        closedByName: closureData.closedByName,
        closedDate: new Date(),
        closureNotes: closureData.closureNotes,
        updatedAt: new Date(),
      };

      return MOCK_NCRS[index];
    }

    return this.request<NCR>(`/quality/ncr/${id}/close`, {
      method: 'POST',
      body: JSON.stringify(closureData),
    });
  }

  // Delete NCR
  static async deleteNCR(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_NCRS.findIndex((n) => n.id === id);
      if (index === -1) {
        throw new Error('NCR not found');
      }
      MOCK_NCRS.splice(index, 1);
      return;
    }

    await this.request<void>(`/quality/ncr/${id}`, {
      method: 'DELETE',
    });
  }

  // Get NCR statistics
  static async getNCRStatistics(): Promise<{
    total: number;
    open: number;
    closed: number;
    byStatus: Record<NCRStatus, number>;
    byCategory: Record<NCRCategory, number>;
    bySeverity: Record<NCRSeverity, number>;
    totalCost: number;
    avgResolutionDays: number;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const byStatus: Record<NCRStatus, number> = {} as Record<NCRStatus, number>;
      const byCategory: Record<NCRCategory, number> = {} as Record<NCRCategory, number>;
      const bySeverity: Record<NCRSeverity, number> = {} as Record<NCRSeverity, number>;

      Object.values(NCRStatus).forEach((s) => (byStatus[s] = 0));
      Object.values(NCRCategory).forEach((c) => (byCategory[c] = 0));
      Object.values(NCRSeverity).forEach((s) => (bySeverity[s] = 0));

      let totalCost = 0;
      let closedCount = 0;
      let totalResolutionDays = 0;

      MOCK_NCRS.forEach((ncr) => {
        byStatus[ncr.status]++;
        byCategory[ncr.category]++;
        bySeverity[ncr.severity]++;
        totalCost += ncr.actualCost || ncr.estimatedCost || 0;

        if (ncr.status === NCRStatus.CLOSED && ncr.closedDate) {
          closedCount++;
          const days = Math.ceil(
            (new Date(ncr.closedDate).getTime() - new Date(ncr.reportedDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          totalResolutionDays += days;
        }
      });

      return {
        total: MOCK_NCRS.length,
        open: MOCK_NCRS.filter((n) => n.status !== NCRStatus.CLOSED && n.status !== NCRStatus.REJECTED).length,
        closed: MOCK_NCRS.filter((n) => n.status === NCRStatus.CLOSED).length,
        byStatus,
        byCategory,
        bySeverity,
        totalCost,
        avgResolutionDays: closedCount > 0 ? Math.round(totalResolutionDays / closedCount) : 0,
      };
    }

    return this.request('/quality/ncr/statistics');
  }
}

// Export singleton instance
export const ncrService = NCRService;
