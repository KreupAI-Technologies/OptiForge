// Quality Control Template Service
// Handles QC template operations for the Quality Module

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = true;

// ==================== ENUMS ====================

export enum QCTemplateStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  RETIRED = 'retired',
}

export enum QCTemplateType {
  INCOMING = 'incoming',
  IN_PROCESS = 'in_process',
  FINAL = 'final',
  FIRST_ARTICLE = 'first_article',
  SUPPLIER_AUDIT = 'supplier_audit',
  CUSTOMER_FAT = 'customer_fat',
  PERIODIC = 'periodic',
  GENERAL = 'general',
}

export enum CheckpointType {
  MEASUREMENT = 'measurement',
  VISUAL = 'visual',
  FUNCTIONAL = 'functional',
  ATTRIBUTE = 'attribute',
  DOCUMENTATION = 'documentation',
  TEST = 'test',
}

export enum MeasurementType {
  LINEAR = 'linear',
  ANGULAR = 'angular',
  SURFACE = 'surface',
  TEMPERATURE = 'temperature',
  PRESSURE = 'pressure',
  FORCE = 'force',
  WEIGHT = 'weight',
  HARDNESS = 'hardness',
  ELECTRICAL = 'electrical',
  OTHER = 'other',
}

export enum AcceptanceCriteria {
  WITHIN_TOLERANCE = 'within_tolerance',
  PASS_FAIL = 'pass_fail',
  VISUAL_ACCEPT = 'visual_accept',
  REFERENCE_STANDARD = 'reference_standard',
  CUSTOMER_SPECIFICATION = 'customer_specification',
}

// ==================== INTERFACES ====================

export interface QCCheckpoint {
  id: string;
  sequence: number;
  code: string;
  name: string;
  description: string;
  type: CheckpointType;
  mandatory: boolean;

  // Measurement Details
  measurementType?: MeasurementType;
  specification?: string;
  nominalValue?: number;
  upperLimit?: number;
  lowerLimit?: number;
  tolerance?: string;
  unit?: string;

  // Inspection Method
  method: string;
  equipment?: string[];
  calibrationRequired?: boolean;

  // Sampling
  sampleSize?: number;
  sampleFrequency?: string;

  // Acceptance
  acceptanceCriteria: AcceptanceCriteria;
  acceptanceNotes?: string;

  // Visual/Attribute Details
  referenceImages?: string[];
  defectCodes?: string[];

  // Instructions
  instructions?: string;
  safetyNotes?: string;

  // Time Estimate
  estimatedTime?: number; // minutes

  // Conditional Logic
  conditionalOn?: string; // checkpoint ID
  conditionalValue?: string;
}

export interface QCTemplateVersion {
  version: string;
  effectiveDate: Date;
  expiryDate?: Date;
  changedBy: string;
  changedByName: string;
  changeReason: string;
  changeDescription: string;
  previousVersion?: string;
}

export interface QCTemplateApplicability {
  productCategories?: string[];
  productCodes?: string[];
  processes?: string[];
  workCenters?: string[];
  suppliers?: string[];
  customers?: string[];
}

export interface QCTemplateAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: Date;
  uploadedBy: string;
  category: 'reference' | 'drawing' | 'specification' | 'instruction' | 'form';
}

export interface QCTemplate {
  id: string;
  templateCode: string;
  name: string;
  description: string;
  type: QCTemplateType;
  status: QCTemplateStatus;

  // Version Control
  currentVersion: string;
  versions: QCTemplateVersion[];

  // Checkpoints
  checkpoints: QCCheckpoint[];
  totalCheckpoints: number;
  mandatoryCheckpoints: number;
  estimatedDuration: number; // total minutes

  // Applicability
  applicability: QCTemplateApplicability;

  // Sampling Plan
  defaultSampleSize?: number;
  aqlLevel?: string;
  inspectionLevel?: 'normal' | 'tightened' | 'reduced';

  // Standards Reference
  standards?: string[];
  regulatoryRequirements?: string[];

  // Pass/Fail Criteria
  passThreshold?: number; // percentage
  criticalCheckpoints?: string[]; // checkpoint IDs that must pass

  // Approval
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: Date;
  approvalNotes?: string;

  // Usage Tracking
  usageCount: number;
  lastUsedDate?: Date;

  // Attachments
  attachments: QCTemplateAttachment[];

  // Notes
  notes?: string;
  internalNotes?: string;

  // Audit Fields
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  createdByName: string;
  updatedBy: string;
  updatedByName: string;
}

export interface CreateQCTemplateDto {
  templateCode: string;
  name: string;
  description: string;
  type: QCTemplateType;
  checkpoints?: QCCheckpoint[];
  applicability?: QCTemplateApplicability;
  defaultSampleSize?: number;
  aqlLevel?: string;
  inspectionLevel?: 'normal' | 'tightened' | 'reduced';
  standards?: string[];
  regulatoryRequirements?: string[];
  passThreshold?: number;
  criticalCheckpoints?: string[];
  notes?: string;
  createdBy: string;
  createdByName: string;
}

export interface UpdateQCTemplateDto extends Partial<CreateQCTemplateDto> {
  status?: QCTemplateStatus;
  changeReason?: string;
  changeDescription?: string;
}

export interface QCTemplateFilters {
  status?: QCTemplateStatus;
  type?: QCTemplateType;
  productCategory?: string;
  search?: string;
}

// ==================== MOCK DATA ====================

const INCOMING_CHECKPOINTS: QCCheckpoint[] = [
  {
    id: 'cp-inc-001',
    sequence: 1,
    code: 'INC-DOC-01',
    name: 'Document Verification',
    description: 'Verify delivery documents match purchase order',
    type: CheckpointType.DOCUMENTATION,
    mandatory: true,
    method: 'Document Review',
    acceptanceCriteria: AcceptanceCriteria.PASS_FAIL,
    instructions: 'Check PO number, quantity, part number, and supplier COC',
    estimatedTime: 5,
  },
  {
    id: 'cp-inc-002',
    sequence: 2,
    code: 'INC-VIS-01',
    name: 'Visual Inspection - Packaging',
    description: 'Check packaging condition and damage',
    type: CheckpointType.VISUAL,
    mandatory: true,
    method: 'Visual',
    acceptanceCriteria: AcceptanceCriteria.VISUAL_ACCEPT,
    acceptanceNotes: 'No visible damage, contamination, or moisture',
    referenceImages: ['packaging-accept.jpg', 'packaging-reject.jpg'],
    defectCodes: ['PKG-DAM', 'PKG-WET', 'PKG-CON'],
    estimatedTime: 5,
  },
  {
    id: 'cp-inc-003',
    sequence: 3,
    code: 'INC-VIS-02',
    name: 'Visual Inspection - Material',
    description: 'Check material for visual defects',
    type: CheckpointType.VISUAL,
    mandatory: true,
    method: 'Visual',
    acceptanceCriteria: AcceptanceCriteria.VISUAL_ACCEPT,
    acceptanceNotes: 'No scratches, dents, corrosion, or discoloration',
    defectCodes: ['MAT-SCR', 'MAT-DNT', 'MAT-COR', 'MAT-DIS'],
    estimatedTime: 10,
  },
  {
    id: 'cp-inc-004',
    sequence: 4,
    code: 'INC-DIM-01',
    name: 'Critical Dimension Check',
    description: 'Verify critical dimensions per drawing',
    type: CheckpointType.MEASUREMENT,
    mandatory: true,
    measurementType: MeasurementType.LINEAR,
    method: 'Digital Caliper / Micrometer',
    equipment: ['Digital Caliper', 'Outside Micrometer'],
    calibrationRequired: true,
    sampleSize: 5,
    sampleFrequency: 'Per lot',
    acceptanceCriteria: AcceptanceCriteria.WITHIN_TOLERANCE,
    instructions: 'Measure dimensions marked as CRITICAL on drawing',
    estimatedTime: 20,
  },
  {
    id: 'cp-inc-005',
    sequence: 5,
    code: 'INC-MAT-01',
    name: 'Material Certificate Review',
    description: 'Verify material certificate matches specification',
    type: CheckpointType.DOCUMENTATION,
    mandatory: true,
    method: 'Document Review',
    acceptanceCriteria: AcceptanceCriteria.REFERENCE_STANDARD,
    acceptanceNotes: 'Material grade, heat number, and properties must match specification',
    estimatedTime: 10,
  },
];

const IN_PROCESS_CHECKPOINTS: QCCheckpoint[] = [
  {
    id: 'cp-ip-001',
    sequence: 1,
    code: 'IP-SET-01',
    name: 'Setup Verification',
    description: 'Verify machine setup and first piece approval',
    type: CheckpointType.MEASUREMENT,
    mandatory: true,
    measurementType: MeasurementType.LINEAR,
    method: 'CMM / Digital Caliper',
    equipment: ['CMM', 'Digital Caliper'],
    calibrationRequired: true,
    sampleSize: 1,
    sampleFrequency: 'First piece',
    acceptanceCriteria: AcceptanceCriteria.WITHIN_TOLERANCE,
    instructions: 'Measure all critical dimensions on first piece before production run',
    estimatedTime: 30,
  },
  {
    id: 'cp-ip-002',
    sequence: 2,
    code: 'IP-VIS-01',
    name: 'Visual Inspection',
    description: 'Check for visual defects during processing',
    type: CheckpointType.VISUAL,
    mandatory: true,
    method: 'Visual',
    sampleSize: 10,
    sampleFrequency: 'Per hour',
    acceptanceCriteria: AcceptanceCriteria.VISUAL_ACCEPT,
    defectCodes: ['IP-BUR', 'IP-SCR', 'IP-CRK', 'IP-CHI'],
    estimatedTime: 10,
  },
  {
    id: 'cp-ip-003',
    sequence: 3,
    code: 'IP-DIM-01',
    name: 'In-Process Dimension Check',
    description: 'Periodic dimensional verification during production',
    type: CheckpointType.MEASUREMENT,
    mandatory: true,
    measurementType: MeasurementType.LINEAR,
    method: 'Digital Caliper / Go-NoGo Gauge',
    equipment: ['Digital Caliper', 'Go-NoGo Gauge'],
    calibrationRequired: true,
    sampleSize: 5,
    sampleFrequency: 'Every 50 pieces',
    acceptanceCriteria: AcceptanceCriteria.WITHIN_TOLERANCE,
    estimatedTime: 15,
  },
  {
    id: 'cp-ip-004',
    sequence: 4,
    code: 'IP-SRF-01',
    name: 'Surface Finish Check',
    description: 'Verify surface finish meets specification',
    type: CheckpointType.MEASUREMENT,
    mandatory: false,
    measurementType: MeasurementType.SURFACE,
    specification: 'Ra 1.6',
    upperLimit: 3.2,
    unit: 'Ra',
    method: 'Surface Roughness Tester',
    equipment: ['Surface Roughness Tester'],
    calibrationRequired: true,
    sampleSize: 3,
    sampleFrequency: 'Per lot',
    acceptanceCriteria: AcceptanceCriteria.WITHIN_TOLERANCE,
    estimatedTime: 15,
  },
];

const FINAL_CHECKPOINTS: QCCheckpoint[] = [
  {
    id: 'cp-fin-001',
    sequence: 1,
    code: 'FIN-VIS-01',
    name: 'Final Visual Inspection',
    description: 'Complete visual inspection of finished part',
    type: CheckpointType.VISUAL,
    mandatory: true,
    method: 'Visual - Adequate Lighting',
    acceptanceCriteria: AcceptanceCriteria.VISUAL_ACCEPT,
    acceptanceNotes: 'No defects, complete part, correct finish',
    defectCodes: ['FIN-SCR', 'FIN-DNT', 'FIN-INC', 'FIN-CON'],
    instructions: 'Inspect all surfaces under adequate lighting conditions',
    estimatedTime: 10,
  },
  {
    id: 'cp-fin-002',
    sequence: 2,
    code: 'FIN-DIM-01',
    name: 'Final Dimensional Inspection',
    description: 'Complete dimensional verification',
    type: CheckpointType.MEASUREMENT,
    mandatory: true,
    measurementType: MeasurementType.LINEAR,
    method: 'CMM / Manual Measurement',
    equipment: ['CMM', 'Digital Caliper', 'Micrometer', 'Height Gauge'],
    calibrationRequired: true,
    acceptanceCriteria: AcceptanceCriteria.WITHIN_TOLERANCE,
    instructions: 'Measure all dimensions on inspection report',
    estimatedTime: 30,
  },
  {
    id: 'cp-fin-003',
    sequence: 3,
    code: 'FIN-FNC-01',
    name: 'Functional Test',
    description: 'Verify functional requirements',
    type: CheckpointType.FUNCTIONAL,
    mandatory: true,
    method: 'Per Test Procedure',
    acceptanceCriteria: AcceptanceCriteria.PASS_FAIL,
    instructions: 'Execute functional test procedure and record results',
    estimatedTime: 20,
  },
  {
    id: 'cp-fin-004',
    sequence: 4,
    code: 'FIN-HDN-01',
    name: 'Hardness Test',
    description: 'Verify material hardness',
    type: CheckpointType.TEST,
    mandatory: false,
    measurementType: MeasurementType.HARDNESS,
    specification: 'HRC 45-50',
    nominalValue: 47.5,
    upperLimit: 50,
    lowerLimit: 45,
    unit: 'HRC',
    method: 'Rockwell Hardness Tester',
    equipment: ['Rockwell Hardness Tester'],
    calibrationRequired: true,
    sampleSize: 3,
    acceptanceCriteria: AcceptanceCriteria.WITHIN_TOLERANCE,
    estimatedTime: 15,
  },
  {
    id: 'cp-fin-005',
    sequence: 5,
    code: 'FIN-DOC-01',
    name: 'Documentation Verification',
    description: 'Verify all required documentation is complete',
    type: CheckpointType.DOCUMENTATION,
    mandatory: true,
    method: 'Document Review',
    acceptanceCriteria: AcceptanceCriteria.PASS_FAIL,
    instructions: 'Verify inspection report, material certs, and test records are complete',
    estimatedTime: 10,
  },
];

const FIRST_ARTICLE_CHECKPOINTS: QCCheckpoint[] = [
  {
    id: 'cp-fai-001',
    sequence: 1,
    code: 'FAI-ALL-01',
    name: 'All Dimensions',
    description: 'Measure all dimensions on drawing',
    type: CheckpointType.MEASUREMENT,
    mandatory: true,
    measurementType: MeasurementType.LINEAR,
    method: 'CMM / Manual Measurement',
    equipment: ['CMM', 'Digital Caliper', 'Micrometer', 'Height Gauge', 'Thread Gauge'],
    calibrationRequired: true,
    acceptanceCriteria: AcceptanceCriteria.WITHIN_TOLERANCE,
    instructions: 'Measure and record ALL dimensions shown on drawing',
    estimatedTime: 120,
  },
  {
    id: 'cp-fai-002',
    sequence: 2,
    code: 'FAI-MAT-01',
    name: 'Material Verification',
    description: 'Verify material matches specification',
    type: CheckpointType.TEST,
    mandatory: true,
    method: 'PMI Test / Material Certificate Review',
    equipment: ['PMI Analyzer'],
    acceptanceCriteria: AcceptanceCriteria.REFERENCE_STANDARD,
    instructions: 'Perform PMI test and verify against material specification',
    estimatedTime: 30,
  },
  {
    id: 'cp-fai-003',
    sequence: 3,
    code: 'FAI-FNC-01',
    name: 'Full Functional Test',
    description: 'Complete functional verification',
    type: CheckpointType.FUNCTIONAL,
    mandatory: true,
    method: 'Per Test Procedure',
    acceptanceCriteria: AcceptanceCriteria.PASS_FAIL,
    instructions: 'Execute complete functional test procedure',
    estimatedTime: 60,
  },
  {
    id: 'cp-fai-004',
    sequence: 4,
    code: 'FAI-VIS-01',
    name: 'Visual and Cosmetic',
    description: 'Complete visual and cosmetic inspection',
    type: CheckpointType.VISUAL,
    mandatory: true,
    method: 'Visual',
    acceptanceCriteria: AcceptanceCriteria.VISUAL_ACCEPT,
    referenceImages: ['fai-visual-standard.jpg'],
    instructions: 'Compare to visual standard and document any deviations',
    estimatedTime: 20,
  },
  {
    id: 'cp-fai-005',
    sequence: 5,
    code: 'FAI-DOC-01',
    name: 'FAI Report Completion',
    description: 'Complete FAI report documentation',
    type: CheckpointType.DOCUMENTATION,
    mandatory: true,
    method: 'Document Completion',
    acceptanceCriteria: AcceptanceCriteria.PASS_FAIL,
    instructions: 'Complete AS9102 FAI report with all required data',
    estimatedTime: 45,
  },
];

const SUPPLIER_AUDIT_CHECKPOINTS: QCCheckpoint[] = [
  {
    id: 'cp-sup-001',
    sequence: 1,
    code: 'SUP-QMS-01',
    name: 'Quality Management System',
    description: 'Verify QMS certification and implementation',
    type: CheckpointType.DOCUMENTATION,
    mandatory: true,
    method: 'Document Review / Interview',
    acceptanceCriteria: AcceptanceCriteria.REFERENCE_STANDARD,
    acceptanceNotes: 'Valid ISO 9001 or equivalent certification',
    instructions: 'Review QMS certificates, procedures, and interview quality manager',
    estimatedTime: 60,
  },
  {
    id: 'cp-sup-002',
    sequence: 2,
    code: 'SUP-PRO-01',
    name: 'Process Control',
    description: 'Evaluate process control measures',
    type: CheckpointType.ATTRIBUTE,
    mandatory: true,
    method: 'Process Observation / Document Review',
    acceptanceCriteria: AcceptanceCriteria.REFERENCE_STANDARD,
    instructions: 'Review process control documents and observe production processes',
    estimatedTime: 90,
  },
  {
    id: 'cp-sup-003',
    sequence: 3,
    code: 'SUP-INS-01',
    name: 'Inspection Capabilities',
    description: 'Evaluate inspection equipment and methods',
    type: CheckpointType.ATTRIBUTE,
    mandatory: true,
    method: 'Equipment Review / Calibration Records',
    acceptanceCriteria: AcceptanceCriteria.REFERENCE_STANDARD,
    instructions: 'Review inspection equipment, calibration records, and inspection procedures',
    estimatedTime: 60,
  },
  {
    id: 'cp-sup-004',
    sequence: 4,
    code: 'SUP-NCR-01',
    name: 'Non-Conformance Handling',
    description: 'Evaluate NCR and CAPA processes',
    type: CheckpointType.DOCUMENTATION,
    mandatory: true,
    method: 'Document Review',
    acceptanceCriteria: AcceptanceCriteria.REFERENCE_STANDARD,
    instructions: 'Review NCR records, CAPA effectiveness, and trending data',
    estimatedTime: 45,
  },
  {
    id: 'cp-sup-005',
    sequence: 5,
    code: 'SUP-TRA-01',
    name: 'Traceability',
    description: 'Verify material and process traceability',
    type: CheckpointType.ATTRIBUTE,
    mandatory: true,
    method: 'Traceability Exercise',
    acceptanceCriteria: AcceptanceCriteria.PASS_FAIL,
    instructions: 'Perform forward and backward traceability exercise on sample batch',
    estimatedTime: 30,
  },
];

export const MOCK_QC_TEMPLATES: QCTemplate[] = [
  {
    id: 'tmpl-001',
    templateCode: 'QC-INC-001',
    name: 'Incoming Material Inspection',
    description: 'Standard template for incoming raw material and component inspection',
    type: QCTemplateType.INCOMING,
    status: QCTemplateStatus.ACTIVE,
    currentVersion: '2.0',
    versions: [
      {
        version: '1.0',
        effectiveDate: new Date('2023-01-01'),
        expiryDate: new Date('2024-01-01'),
        changedBy: 'emp-002',
        changedByName: 'Sarah Johnson',
        changeReason: 'Initial Release',
        changeDescription: 'First version of incoming inspection template',
      },
      {
        version: '2.0',
        effectiveDate: new Date('2024-01-01'),
        changedBy: 'emp-002',
        changedByName: 'Sarah Johnson',
        changeReason: 'Process Improvement',
        changeDescription: 'Added material certificate review checkpoint, updated sampling requirements',
        previousVersion: '1.0',
      },
    ],
    checkpoints: INCOMING_CHECKPOINTS,
    totalCheckpoints: 5,
    mandatoryCheckpoints: 5,
    estimatedDuration: 50,
    applicability: {
      productCategories: ['Raw Material', 'Components', 'Fasteners'],
      processes: ['Receiving Inspection'],
    },
    defaultSampleSize: 10,
    aqlLevel: 'Level II',
    inspectionLevel: 'normal',
    standards: ['ISO 2859-1', 'ASTM E8'],
    passThreshold: 100,
    approvedBy: 'emp-004',
    approvedByName: 'David Brown',
    approvedDate: new Date('2024-01-01'),
    usageCount: 156,
    lastUsedDate: new Date('2024-01-20'),
    attachments: [
      {
        id: 'att-tmpl-001',
        fileName: 'incoming-inspection-guide.pdf',
        fileType: 'application/pdf',
        fileSize: 250000,
        fileUrl: '/attachments/templates/incoming-inspection-guide.pdf',
        uploadedAt: new Date('2024-01-01'),
        uploadedBy: 'emp-002',
        category: 'instruction',
      },
    ],
    notes: 'Standard template for all incoming inspections. Customize sampling based on supplier history.',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: 'emp-002',
    createdByName: 'Sarah Johnson',
    updatedBy: 'emp-002',
    updatedByName: 'Sarah Johnson',
  },
  {
    id: 'tmpl-002',
    templateCode: 'QC-IP-001',
    name: 'In-Process Inspection',
    description: 'Standard template for in-process quality checks during manufacturing',
    type: QCTemplateType.IN_PROCESS,
    status: QCTemplateStatus.ACTIVE,
    currentVersion: '1.1',
    versions: [
      {
        version: '1.0',
        effectiveDate: new Date('2023-06-01'),
        expiryDate: new Date('2023-12-01'),
        changedBy: 'emp-001',
        changedByName: 'John Smith',
        changeReason: 'Initial Release',
        changeDescription: 'First version of in-process inspection template',
      },
      {
        version: '1.1',
        effectiveDate: new Date('2023-12-01'),
        changedBy: 'emp-001',
        changedByName: 'John Smith',
        changeReason: 'Added Surface Finish',
        changeDescription: 'Added surface finish checkpoint for critical applications',
        previousVersion: '1.0',
      },
    ],
    checkpoints: IN_PROCESS_CHECKPOINTS,
    totalCheckpoints: 4,
    mandatoryCheckpoints: 3,
    estimatedDuration: 70,
    applicability: {
      productCategories: ['Machined Parts', 'Assemblies'],
      processes: ['CNC Machining', 'Turning', 'Milling'],
      workCenters: ['MC-001', 'MC-002', 'MC-003'],
    },
    defaultSampleSize: 5,
    inspectionLevel: 'normal',
    standards: ['ISO 9001'],
    passThreshold: 95,
    criticalCheckpoints: ['cp-ip-001', 'cp-ip-003'],
    approvedBy: 'emp-002',
    approvedByName: 'Sarah Johnson',
    approvedDate: new Date('2023-12-01'),
    usageCount: 342,
    lastUsedDate: new Date('2024-01-21'),
    attachments: [],
    notes: 'Use this template for all machining operations. First piece must always pass.',
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-12-01'),
    createdBy: 'emp-001',
    createdByName: 'John Smith',
    updatedBy: 'emp-001',
    updatedByName: 'John Smith',
  },
  {
    id: 'tmpl-003',
    templateCode: 'QC-FIN-001',
    name: 'Final Product Inspection',
    description: 'Comprehensive final inspection template for finished products',
    type: QCTemplateType.FINAL,
    status: QCTemplateStatus.ACTIVE,
    currentVersion: '3.0',
    versions: [
      {
        version: '1.0',
        effectiveDate: new Date('2022-01-01'),
        expiryDate: new Date('2023-01-01'),
        changedBy: 'emp-002',
        changedByName: 'Sarah Johnson',
        changeReason: 'Initial Release',
        changeDescription: 'First version of final inspection template',
      },
      {
        version: '2.0',
        effectiveDate: new Date('2023-01-01'),
        expiryDate: new Date('2024-01-01'),
        changedBy: 'emp-002',
        changedByName: 'Sarah Johnson',
        changeReason: 'Customer Requirement',
        changeDescription: 'Added hardness test per customer specification',
        previousVersion: '1.0',
      },
      {
        version: '3.0',
        effectiveDate: new Date('2024-01-01'),
        changedBy: 'emp-004',
        changedByName: 'David Brown',
        changeReason: 'ISO Audit Finding',
        changeDescription: 'Enhanced documentation verification requirements',
        previousVersion: '2.0',
      },
    ],
    checkpoints: FINAL_CHECKPOINTS,
    totalCheckpoints: 5,
    mandatoryCheckpoints: 4,
    estimatedDuration: 85,
    applicability: {
      productCategories: ['Finished Products', 'Assemblies'],
      processes: ['Final Inspection', 'Pre-Shipment'],
    },
    defaultSampleSize: 10,
    aqlLevel: 'Level II',
    inspectionLevel: 'normal',
    standards: ['ISO 9001', 'Customer Specifications'],
    regulatoryRequirements: ['Product Safety Standards'],
    passThreshold: 100,
    criticalCheckpoints: ['cp-fin-002', 'cp-fin-003'],
    approvedBy: 'emp-004',
    approvedByName: 'David Brown',
    approvedDate: new Date('2024-01-01'),
    usageCount: 523,
    lastUsedDate: new Date('2024-01-21'),
    attachments: [
      {
        id: 'att-tmpl-002',
        fileName: 'final-inspection-standard.pdf',
        fileType: 'application/pdf',
        fileSize: 450000,
        fileUrl: '/attachments/templates/final-inspection-standard.pdf',
        uploadedAt: new Date('2024-01-01'),
        uploadedBy: 'emp-004',
        category: 'specification',
      },
    ],
    notes: 'Must complete all mandatory checkpoints before release to shipping',
    createdAt: new Date('2022-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: 'emp-002',
    createdByName: 'Sarah Johnson',
    updatedBy: 'emp-004',
    updatedByName: 'David Brown',
  },
  {
    id: 'tmpl-004',
    templateCode: 'QC-FAI-001',
    name: 'First Article Inspection',
    description: 'Comprehensive first article inspection template per AS9102',
    type: QCTemplateType.FIRST_ARTICLE,
    status: QCTemplateStatus.ACTIVE,
    currentVersion: '1.0',
    versions: [
      {
        version: '1.0',
        effectiveDate: new Date('2023-06-01'),
        changedBy: 'emp-004',
        changedByName: 'David Brown',
        changeReason: 'Initial Release',
        changeDescription: 'AS9102 compliant FAI template',
      },
    ],
    checkpoints: FIRST_ARTICLE_CHECKPOINTS,
    totalCheckpoints: 5,
    mandatoryCheckpoints: 5,
    estimatedDuration: 275,
    applicability: {
      productCategories: ['New Products', 'Design Changes', 'Process Changes'],
      processes: ['First Article Inspection'],
    },
    defaultSampleSize: 3,
    inspectionLevel: 'tightened',
    standards: ['AS9102', 'ISO 9001'],
    regulatoryRequirements: ['AS9100D'],
    passThreshold: 100,
    criticalCheckpoints: ['cp-fai-001', 'cp-fai-002', 'cp-fai-003'],
    approvedBy: 'emp-004',
    approvedByName: 'David Brown',
    approvedDate: new Date('2023-06-01'),
    usageCount: 45,
    lastUsedDate: new Date('2024-01-18'),
    attachments: [
      {
        id: 'att-tmpl-003',
        fileName: 'as9102-form.xlsx',
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileSize: 85000,
        fileUrl: '/attachments/templates/as9102-form.xlsx',
        uploadedAt: new Date('2023-06-01'),
        uploadedBy: 'emp-004',
        category: 'form',
      },
    ],
    notes: 'Required for all new products, design changes, and process changes',
    internalNotes: 'Must be completed by Level 3 QC Inspector',
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-01'),
    createdBy: 'emp-004',
    createdByName: 'David Brown',
    updatedBy: 'emp-004',
    updatedByName: 'David Brown',
  },
  {
    id: 'tmpl-005',
    templateCode: 'QC-SUP-001',
    name: 'Supplier Quality Audit',
    description: 'Standard template for supplier quality system audits',
    type: QCTemplateType.SUPPLIER_AUDIT,
    status: QCTemplateStatus.ACTIVE,
    currentVersion: '2.1',
    versions: [
      {
        version: '1.0',
        effectiveDate: new Date('2022-06-01'),
        expiryDate: new Date('2023-06-01'),
        changedBy: 'emp-006',
        changedByName: 'Lisa Anderson',
        changeReason: 'Initial Release',
        changeDescription: 'First version of supplier audit template',
      },
      {
        version: '2.0',
        effectiveDate: new Date('2023-06-01'),
        expiryDate: new Date('2024-01-15'),
        changedBy: 'emp-006',
        changedByName: 'Lisa Anderson',
        changeReason: 'Enhanced Traceability',
        changeDescription: 'Added traceability exercise requirement',
        previousVersion: '1.0',
      },
      {
        version: '2.1',
        effectiveDate: new Date('2024-01-15'),
        changedBy: 'emp-002',
        changedByName: 'Sarah Johnson',
        changeReason: 'Minor Update',
        changeDescription: 'Updated scoring criteria and added NCR review requirement',
        previousVersion: '2.0',
      },
    ],
    checkpoints: SUPPLIER_AUDIT_CHECKPOINTS,
    totalCheckpoints: 5,
    mandatoryCheckpoints: 5,
    estimatedDuration: 285,
    applicability: {
      suppliers: ['All Approved Suppliers'],
      productCategories: ['Critical Components', 'Raw Materials'],
    },
    inspectionLevel: 'normal',
    standards: ['ISO 9001', 'AS9100D', 'IATF 16949'],
    passThreshold: 80,
    approvedBy: 'emp-014',
    approvedByName: 'Michael Green',
    approvedDate: new Date('2024-01-15'),
    usageCount: 28,
    lastUsedDate: new Date('2024-01-19'),
    attachments: [
      {
        id: 'att-tmpl-004',
        fileName: 'supplier-audit-checklist.pdf',
        fileType: 'application/pdf',
        fileSize: 320000,
        fileUrl: '/attachments/templates/supplier-audit-checklist.pdf',
        uploadedAt: new Date('2024-01-15'),
        uploadedBy: 'emp-006',
        category: 'form',
      },
      {
        id: 'att-tmpl-005',
        fileName: 'supplier-scoring-guide.pdf',
        fileType: 'application/pdf',
        fileSize: 180000,
        fileUrl: '/attachments/templates/supplier-scoring-guide.pdf',
        uploadedAt: new Date('2024-01-15'),
        uploadedBy: 'emp-002',
        category: 'instruction',
      },
    ],
    notes: 'Use for annual supplier audits and new supplier qualification',
    internalNotes: 'Score of 80% or above required for approved supplier status',
    createdAt: new Date('2022-06-01'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'emp-006',
    createdByName: 'Lisa Anderson',
    updatedBy: 'emp-002',
    updatedByName: 'Sarah Johnson',
  },
];

// ==================== SERVICE CLASS ====================

export class QCTemplateService {
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

  // Get all templates with optional filters
  static async getAllTemplates(filters?: QCTemplateFilters): Promise<QCTemplate[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredTemplates = [...MOCK_QC_TEMPLATES];

      if (filters) {
        if (filters.status) {
          filteredTemplates = filteredTemplates.filter((t) => t.status === filters.status);
        }
        if (filters.type) {
          filteredTemplates = filteredTemplates.filter((t) => t.type === filters.type);
        }
        if (filters.productCategory) {
          filteredTemplates = filteredTemplates.filter(
            (t) => t.applicability.productCategories?.includes(filters.productCategory!)
          );
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredTemplates = filteredTemplates.filter(
            (t) =>
              t.templateCode.toLowerCase().includes(searchLower) ||
              t.name.toLowerCase().includes(searchLower) ||
              t.description.toLowerCase().includes(searchLower)
          );
        }
      }

      return filteredTemplates;
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const queryString = params.toString();
    return this.request<QCTemplate[]>(`/quality/qc-template${queryString ? `?${queryString}` : ''}`);
  }

  // Get template by ID
  static async getTemplateById(id: string): Promise<QCTemplate> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const template = MOCK_QC_TEMPLATES.find((t) => t.id === id);
      if (!template) {
        throw new Error('Template not found');
      }
      return template;
    }
    return this.request<QCTemplate>(`/quality/qc-template/${id}`);
  }

  // Create a new template
  static async createTemplate(data: CreateQCTemplateDto): Promise<QCTemplate> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const checkpoints = data.checkpoints || [];
      const mandatoryCheckpoints = checkpoints.filter((cp) => cp.mandatory).length;
      const estimatedDuration = checkpoints.reduce((sum, cp) => sum + (cp.estimatedTime || 0), 0);

      const newTemplate: QCTemplate = {
        id: `tmpl-${Date.now()}`,
        templateCode: data.templateCode,
        name: data.name,
        description: data.description,
        type: data.type,
        status: QCTemplateStatus.DRAFT,
        currentVersion: '1.0',
        versions: [
          {
            version: '1.0',
            effectiveDate: new Date(),
            changedBy: data.createdBy,
            changedByName: data.createdByName,
            changeReason: 'Initial Release',
            changeDescription: 'First version of template',
          },
        ],
        checkpoints,
        totalCheckpoints: checkpoints.length,
        mandatoryCheckpoints,
        estimatedDuration,
        applicability: data.applicability || {},
        defaultSampleSize: data.defaultSampleSize,
        aqlLevel: data.aqlLevel,
        inspectionLevel: data.inspectionLevel,
        standards: data.standards,
        regulatoryRequirements: data.regulatoryRequirements,
        passThreshold: data.passThreshold,
        criticalCheckpoints: data.criticalCheckpoints,
        usageCount: 0,
        attachments: [],
        notes: data.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: data.createdBy,
        createdByName: data.createdByName,
        updatedBy: data.createdBy,
        updatedByName: data.createdByName,
      };
      MOCK_QC_TEMPLATES.push(newTemplate);
      return newTemplate;
    }

    return this.request<QCTemplate>('/quality/qc-template', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update a template
  static async updateTemplate(id: string, data: UpdateQCTemplateDto): Promise<QCTemplate> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_QC_TEMPLATES.findIndex((t) => t.id === id);
      if (index === -1) {
        throw new Error('Template not found');
      }

      const updatedTemplate = {
        ...MOCK_QC_TEMPLATES[index],
        ...data,
        updatedAt: new Date(),
      };

      // Recalculate if checkpoints changed
      if (data.checkpoints) {
        updatedTemplate.totalCheckpoints = data.checkpoints.length;
        updatedTemplate.mandatoryCheckpoints = data.checkpoints.filter((cp) => cp.mandatory).length;
        updatedTemplate.estimatedDuration = data.checkpoints.reduce(
          (sum, cp) => sum + (cp.estimatedTime || 0),
          0
        );
      }

      MOCK_QC_TEMPLATES[index] = updatedTemplate;
      return MOCK_QC_TEMPLATES[index];
    }

    return this.request<QCTemplate>(`/quality/qc-template/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Activate a template
  static async activateTemplate(id: string, approverId: string, approverName: string): Promise<QCTemplate> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_QC_TEMPLATES.findIndex((t) => t.id === id);
      if (index === -1) {
        throw new Error('Template not found');
      }

      MOCK_QC_TEMPLATES[index] = {
        ...MOCK_QC_TEMPLATES[index],
        status: QCTemplateStatus.ACTIVE,
        approvedBy: approverId,
        approvedByName: approverName,
        approvedDate: new Date(),
        updatedAt: new Date(),
      };
      return MOCK_QC_TEMPLATES[index];
    }

    return this.request<QCTemplate>(`/quality/qc-template/${id}/activate`, {
      method: 'POST',
      body: JSON.stringify({ approverId, approverName }),
    });
  }

  // Deactivate a template
  static async deactivateTemplate(id: string): Promise<QCTemplate> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_QC_TEMPLATES.findIndex((t) => t.id === id);
      if (index === -1) {
        throw new Error('Template not found');
      }

      MOCK_QC_TEMPLATES[index] = {
        ...MOCK_QC_TEMPLATES[index],
        status: QCTemplateStatus.INACTIVE,
        updatedAt: new Date(),
      };
      return MOCK_QC_TEMPLATES[index];
    }

    return this.request<QCTemplate>(`/quality/qc-template/${id}/deactivate`, {
      method: 'POST',
    });
  }

  // Clone a template
  static async cloneTemplate(
    id: string,
    newCode: string,
    newName: string,
    createdBy: string,
    createdByName: string
  ): Promise<QCTemplate> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const original = MOCK_QC_TEMPLATES.find((t) => t.id === id);
      if (!original) {
        throw new Error('Template not found');
      }

      const clonedTemplate: QCTemplate = {
        ...original,
        id: `tmpl-${Date.now()}`,
        templateCode: newCode,
        name: newName,
        status: QCTemplateStatus.DRAFT,
        currentVersion: '1.0',
        versions: [
          {
            version: '1.0',
            effectiveDate: new Date(),
            changedBy: createdBy,
            changedByName: createdByName,
            changeReason: 'Cloned from ' + original.templateCode,
            changeDescription: `Cloned from template ${original.name} (${original.templateCode})`,
          },
        ],
        approvedBy: undefined,
        approvedByName: undefined,
        approvedDate: undefined,
        usageCount: 0,
        lastUsedDate: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy,
        createdByName,
        updatedBy: createdBy,
        updatedByName: createdByName,
      };

      MOCK_QC_TEMPLATES.push(clonedTemplate);
      return clonedTemplate;
    }

    return this.request<QCTemplate>(`/quality/qc-template/${id}/clone`, {
      method: 'POST',
      body: JSON.stringify({ newCode, newName, createdBy, createdByName }),
    });
  }

  // Delete a template
  static async deleteTemplate(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_QC_TEMPLATES.findIndex((t) => t.id === id);
      if (index === -1) {
        throw new Error('Template not found');
      }
      MOCK_QC_TEMPLATES.splice(index, 1);
      return;
    }

    await this.request<void>(`/quality/qc-template/${id}`, {
      method: 'DELETE',
    });
  }

  // Get active templates by type
  static async getActiveTemplatesByType(type: QCTemplateType): Promise<QCTemplate[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return MOCK_QC_TEMPLATES.filter(
        (t) => t.type === type && t.status === QCTemplateStatus.ACTIVE
      );
    }

    return this.request<QCTemplate[]>(`/quality/qc-template/active/${type}`);
  }

  // Get template statistics
  static async getTemplateStatistics(): Promise<{
    total: number;
    active: number;
    draft: number;
    byType: Record<QCTemplateType, number>;
    totalUsage: number;
    avgCheckpointsPerTemplate: number;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const byType: Record<QCTemplateType, number> = {} as Record<QCTemplateType, number>;
      Object.values(QCTemplateType).forEach((t) => (byType[t] = 0));

      let totalUsage = 0;
      let totalCheckpoints = 0;

      MOCK_QC_TEMPLATES.forEach((template) => {
        byType[template.type]++;
        totalUsage += template.usageCount;
        totalCheckpoints += template.totalCheckpoints;
      });

      return {
        total: MOCK_QC_TEMPLATES.length,
        active: MOCK_QC_TEMPLATES.filter((t) => t.status === QCTemplateStatus.ACTIVE).length,
        draft: MOCK_QC_TEMPLATES.filter((t) => t.status === QCTemplateStatus.DRAFT).length,
        byType,
        totalUsage,
        avgCheckpointsPerTemplate:
          MOCK_QC_TEMPLATES.length > 0 ? Math.round(totalCheckpoints / MOCK_QC_TEMPLATES.length) : 0,
      };
    }

    return this.request('/quality/qc-template/statistics');
  }
}

// Export singleton instance
export const qcTemplateService = QCTemplateService;
