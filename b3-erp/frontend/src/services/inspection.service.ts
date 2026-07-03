// Quality Inspection Service
// Handles quality inspection operations for the Quality Module

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ==================== ENUMS ====================

export enum InspectionStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum InspectionType {
  INCOMING = 'incoming',
  IN_PROCESS = 'in_process',
  FINAL = 'final',
  FIRST_ARTICLE = 'first_article',
  PERIODIC = 'periodic',
  SUPPLIER = 'supplier',
  CUSTOMER = 'customer',
}

export enum InspectionResult {
  PASS = 'pass',
  FAIL = 'fail',
  CONDITIONAL = 'conditional',
  PENDING = 'pending',
}

export enum DefectSeverity {
  CRITICAL = 'critical',
  MAJOR = 'major',
  MINOR = 'minor',
  COSMETIC = 'cosmetic',
}

// ==================== INTERFACES ====================

export interface InspectionCheckpoint {
  id: string;
  sequence: number;
  name: string;
  description: string;
  specification: string;
  tolerance?: string;
  unit?: string;
  method: string;
  result?: InspectionResult;
  measuredValue?: string;
  notes?: string;
  defects?: InspectionDefect[];
  inspectedAt?: Date;
  inspectedBy?: string;
}

export interface InspectionDefect {
  id: string;
  checkpointId: string;
  code: string;
  description: string;
  severity: DefectSeverity;
  quantity: number;
  location?: string;
  imageUrls?: string[];
  ncrId?: string;
  createdAt: Date;
}

export interface InspectionAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface Inspection {
  id: string;
  inspectionNumber: string;
  type: InspectionType;
  status: InspectionStatus;

  // Reference Information
  workOrderId?: string;
  workOrderNumber?: string;
  productId?: string;
  productName: string;
  productCode: string;
  batchNumber?: string;
  lotNumber?: string;

  // Quantity Information
  totalQuantity: number;
  sampledQuantity: number;
  passedQuantity: number;
  failedQuantity: number;

  // Template Reference
  templateId?: string;
  templateName?: string;

  // Checkpoints and Results
  checkpoints: InspectionCheckpoint[];
  overallResult: InspectionResult;
  defectSummary: {
    critical: number;
    major: number;
    minor: number;
    cosmetic: number;
    total: number;
  };

  // Scheduling
  scheduledDate: Date;
  startedAt?: Date;
  completedAt?: Date;

  // Personnel
  inspectorId: string;
  inspectorName: string;
  reviewerId?: string;
  reviewerName?: string;
  approvedBy?: string;
  approvedAt?: Date;

  // Location
  location?: string;
  workstation?: string;

  // Related Records
  relatedNCRs?: string[];
  relatedCAPAs?: string[];

  // Notes and Attachments
  notes?: string;
  attachments: InspectionAttachment[];

  // Audit Fields
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface InspectionStatistics {
  totalInspections: number;
  passRate: number;
  failRate: number;
  avgDefectsPerInspection: number;
  byStatus: Record<InspectionStatus, number>;
  byType: Record<InspectionType, number>;
  byResult: Record<InspectionResult, number>;
  defectsByType: {
    critical: number;
    major: number;
    minor: number;
    cosmetic: number;
  };
  recentTrend: {
    date: string;
    passRate: number;
    inspectionCount: number;
  }[];
}

export interface CreateInspectionDto {
  type: InspectionType;
  workOrderId?: string;
  workOrderNumber?: string;
  productId?: string;
  productName: string;
  productCode: string;
  batchNumber?: string;
  lotNumber?: string;
  totalQuantity: number;
  sampledQuantity: number;
  templateId?: string;
  scheduledDate: Date;
  inspectorId: string;
  inspectorName: string;
  location?: string;
  workstation?: string;
  notes?: string;
}

export interface UpdateInspectionDto extends Partial<CreateInspectionDto> {
  status?: InspectionStatus;
  checkpoints?: InspectionCheckpoint[];
  overallResult?: InspectionResult;
  reviewerId?: string;
  reviewerName?: string;
}

export interface InspectionFilters {
  status?: InspectionStatus;
  type?: InspectionType;
  result?: InspectionResult;
  inspectorId?: string;
  productId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

// ==================== MOCK DATA ====================

const MOCK_CHECKPOINTS: InspectionCheckpoint[] = [
  {
    id: 'cp-1',
    sequence: 1,
    name: 'Dimensional Check - Length',
    description: 'Measure overall length of part',
    specification: '100mm',
    tolerance: '+/- 0.5mm',
    unit: 'mm',
    method: 'Digital Caliper',
    result: InspectionResult.PASS,
    measuredValue: '100.2mm',
    inspectedAt: new Date('2024-01-15T10:30:00'),
    inspectedBy: 'John Smith',
  },
  {
    id: 'cp-2',
    sequence: 2,
    name: 'Dimensional Check - Width',
    description: 'Measure overall width of part',
    specification: '50mm',
    tolerance: '+/- 0.3mm',
    unit: 'mm',
    method: 'Digital Caliper',
    result: InspectionResult.PASS,
    measuredValue: '50.1mm',
    inspectedAt: new Date('2024-01-15T10:35:00'),
    inspectedBy: 'John Smith',
  },
  {
    id: 'cp-3',
    sequence: 3,
    name: 'Surface Finish',
    description: 'Check surface roughness',
    specification: 'Ra 1.6',
    tolerance: 'Max Ra 3.2',
    unit: 'Ra',
    method: 'Surface Roughness Tester',
    result: InspectionResult.PASS,
    measuredValue: 'Ra 1.4',
    inspectedAt: new Date('2024-01-15T10:40:00'),
    inspectedBy: 'John Smith',
  },
  {
    id: 'cp-4',
    sequence: 4,
    name: 'Visual Inspection',
    description: 'Check for visual defects, scratches, dents',
    specification: 'No visible defects',
    method: 'Visual',
    result: InspectionResult.PASS,
    inspectedAt: new Date('2024-01-15T10:45:00'),
    inspectedBy: 'John Smith',
  },
  {
    id: 'cp-5',
    sequence: 5,
    name: 'Hardness Test',
    description: 'Rockwell hardness test',
    specification: 'HRC 45-50',
    tolerance: '+/- 2',
    unit: 'HRC',
    method: 'Rockwell Hardness Tester',
    result: InspectionResult.PASS,
    measuredValue: 'HRC 47',
    inspectedAt: new Date('2024-01-15T10:50:00'),
    inspectedBy: 'John Smith',
  },
];

export const MOCK_INSPECTIONS: Inspection[] = [
  {
    id: 'insp-001',
    inspectionNumber: 'INS-2024-0001',
    type: InspectionType.INCOMING,
    status: InspectionStatus.APPROVED,
    productId: 'prod-001',
    productName: 'Steel Shaft Assembly',
    productCode: 'SSA-100',
    batchNumber: 'BATCH-2024-001',
    lotNumber: 'LOT-001',
    totalQuantity: 500,
    sampledQuantity: 50,
    passedQuantity: 48,
    failedQuantity: 2,
    templateId: 'tmpl-001',
    templateName: 'Incoming Material Inspection',
    checkpoints: [...MOCK_CHECKPOINTS],
    overallResult: InspectionResult.PASS,
    defectSummary: { critical: 0, major: 0, minor: 2, cosmetic: 0, total: 2 },
    scheduledDate: new Date('2024-01-15'),
    startedAt: new Date('2024-01-15T10:00:00'),
    completedAt: new Date('2024-01-15T12:00:00'),
    inspectorId: 'emp-001',
    inspectorName: 'John Smith',
    reviewerId: 'emp-002',
    reviewerName: 'Sarah Johnson',
    approvedBy: 'emp-002',
    approvedAt: new Date('2024-01-15T14:00:00'),
    location: 'Warehouse A',
    workstation: 'QC Station 1',
    notes: 'Minor surface scratches found on 2 pieces, within acceptable limits',
    attachments: [],
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'emp-001',
    updatedBy: 'emp-002',
  },
  {
    id: 'insp-002',
    inspectionNumber: 'INS-2024-0002',
    type: InspectionType.IN_PROCESS,
    status: InspectionStatus.IN_PROGRESS,
    workOrderId: 'wo-001',
    workOrderNumber: 'WO-2024-0015',
    productId: 'prod-002',
    productName: 'Aluminum Housing',
    productCode: 'ALH-200',
    batchNumber: 'BATCH-2024-002',
    totalQuantity: 200,
    sampledQuantity: 20,
    passedQuantity: 15,
    failedQuantity: 0,
    templateId: 'tmpl-002',
    templateName: 'In-Process Inspection',
    checkpoints: MOCK_CHECKPOINTS.slice(0, 3).map((cp) => ({
      ...cp,
      result: InspectionResult.PASS,
    })),
    overallResult: InspectionResult.PENDING,
    defectSummary: { critical: 0, major: 0, minor: 0, cosmetic: 0, total: 0 },
    scheduledDate: new Date('2024-01-16'),
    startedAt: new Date('2024-01-16T09:00:00'),
    inspectorId: 'emp-003',
    inspectorName: 'Mike Wilson',
    location: 'Production Floor',
    workstation: 'Machine Center 3',
    attachments: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    createdBy: 'emp-003',
    updatedBy: 'emp-003',
  },
  {
    id: 'insp-003',
    inspectionNumber: 'INS-2024-0003',
    type: InspectionType.FINAL,
    status: InspectionStatus.PENDING_REVIEW,
    workOrderId: 'wo-002',
    workOrderNumber: 'WO-2024-0012',
    productId: 'prod-003',
    productName: 'Precision Gearbox',
    productCode: 'PGB-300',
    batchNumber: 'BATCH-2024-003',
    lotNumber: 'LOT-003',
    totalQuantity: 50,
    sampledQuantity: 10,
    passedQuantity: 9,
    failedQuantity: 1,
    templateId: 'tmpl-003',
    templateName: 'Final Product Inspection',
    checkpoints: MOCK_CHECKPOINTS.map((cp) => ({
      ...cp,
      result: cp.sequence === 4 ? InspectionResult.FAIL : InspectionResult.PASS,
    })),
    overallResult: InspectionResult.CONDITIONAL,
    defectSummary: { critical: 0, major: 1, minor: 0, cosmetic: 0, total: 1 },
    scheduledDate: new Date('2024-01-17'),
    startedAt: new Date('2024-01-17T08:00:00'),
    completedAt: new Date('2024-01-17T11:00:00'),
    inspectorId: 'emp-001',
    inspectorName: 'John Smith',
    location: 'QC Department',
    workstation: 'Final Inspection Bay',
    relatedNCRs: ['ncr-001'],
    notes: 'One unit failed visual inspection - scratch on housing surface',
    attachments: [],
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-17'),
    createdBy: 'emp-001',
    updatedBy: 'emp-001',
  },
  {
    id: 'insp-004',
    inspectionNumber: 'INS-2024-0004',
    type: InspectionType.FIRST_ARTICLE,
    status: InspectionStatus.APPROVED,
    workOrderId: 'wo-003',
    workOrderNumber: 'WO-2024-0020',
    productId: 'prod-004',
    productName: 'Titanium Bracket',
    productCode: 'TIB-400',
    totalQuantity: 3,
    sampledQuantity: 3,
    passedQuantity: 3,
    failedQuantity: 0,
    templateId: 'tmpl-004',
    templateName: 'First Article Inspection',
    checkpoints: MOCK_CHECKPOINTS.map((cp) => ({ ...cp, result: InspectionResult.PASS })),
    overallResult: InspectionResult.PASS,
    defectSummary: { critical: 0, major: 0, minor: 0, cosmetic: 0, total: 0 },
    scheduledDate: new Date('2024-01-18'),
    startedAt: new Date('2024-01-18T10:00:00'),
    completedAt: new Date('2024-01-18T15:00:00'),
    inspectorId: 'emp-002',
    inspectorName: 'Sarah Johnson',
    reviewerId: 'emp-004',
    reviewerName: 'David Brown',
    approvedBy: 'emp-004',
    approvedAt: new Date('2024-01-18T16:00:00'),
    location: 'QC Lab',
    workstation: 'CMM Room',
    notes: 'First article approved for production',
    attachments: [],
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-18'),
    createdBy: 'emp-002',
    updatedBy: 'emp-004',
  },
  {
    id: 'insp-005',
    inspectionNumber: 'INS-2024-0005',
    type: InspectionType.SUPPLIER,
    status: InspectionStatus.REJECTED,
    productId: 'prod-005',
    productName: 'Cast Iron Valve Body',
    productCode: 'CIV-500',
    batchNumber: 'BATCH-2024-005',
    totalQuantity: 100,
    sampledQuantity: 15,
    passedQuantity: 8,
    failedQuantity: 7,
    templateId: 'tmpl-005',
    templateName: 'Supplier Quality Audit',
    checkpoints: MOCK_CHECKPOINTS.map((cp, idx) => ({
      ...cp,
      result: idx < 3 ? InspectionResult.FAIL : InspectionResult.PASS,
    })),
    overallResult: InspectionResult.FAIL,
    defectSummary: { critical: 2, major: 3, minor: 2, cosmetic: 0, total: 7 },
    scheduledDate: new Date('2024-01-19'),
    startedAt: new Date('2024-01-19T09:00:00'),
    completedAt: new Date('2024-01-19T13:00:00'),
    inspectorId: 'emp-003',
    inspectorName: 'Mike Wilson',
    reviewerId: 'emp-002',
    reviewerName: 'Sarah Johnson',
    location: 'Supplier Site - ABC Foundry',
    relatedNCRs: ['ncr-002'],
    relatedCAPAs: ['capa-001'],
    notes: 'Multiple dimensional non-conformances found. Batch rejected.',
    attachments: [],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-19'),
    createdBy: 'emp-003',
    updatedBy: 'emp-002',
  },
  {
    id: 'insp-006',
    inspectionNumber: 'INS-2024-0006',
    type: InspectionType.PERIODIC,
    status: InspectionStatus.SCHEDULED,
    productId: 'prod-006',
    productName: 'Hydraulic Cylinder Assembly',
    productCode: 'HCA-600',
    batchNumber: 'BATCH-2024-006',
    totalQuantity: 75,
    sampledQuantity: 10,
    passedQuantity: 0,
    failedQuantity: 0,
    templateId: 'tmpl-002',
    templateName: 'In-Process Inspection',
    checkpoints: MOCK_CHECKPOINTS.map((cp) => ({ ...cp, result: undefined, measuredValue: undefined })),
    overallResult: InspectionResult.PENDING,
    defectSummary: { critical: 0, major: 0, minor: 0, cosmetic: 0, total: 0 },
    scheduledDate: new Date('2024-01-22'),
    inspectorId: 'emp-001',
    inspectorName: 'John Smith',
    location: 'Production Floor',
    workstation: 'Assembly Line 2',
    attachments: [],
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19'),
    createdBy: 'emp-001',
    updatedBy: 'emp-001',
  },
  {
    id: 'insp-007',
    inspectionNumber: 'INS-2024-0007',
    type: InspectionType.INCOMING,
    status: InspectionStatus.APPROVED,
    productId: 'prod-007',
    productName: 'Stainless Steel Fasteners Kit',
    productCode: 'SSF-700',
    batchNumber: 'BATCH-2024-007',
    lotNumber: 'LOT-007',
    totalQuantity: 2000,
    sampledQuantity: 100,
    passedQuantity: 100,
    failedQuantity: 0,
    templateId: 'tmpl-001',
    templateName: 'Incoming Material Inspection',
    checkpoints: MOCK_CHECKPOINTS.map((cp) => ({ ...cp, result: InspectionResult.PASS })),
    overallResult: InspectionResult.PASS,
    defectSummary: { critical: 0, major: 0, minor: 0, cosmetic: 0, total: 0 },
    scheduledDate: new Date('2024-01-20'),
    startedAt: new Date('2024-01-20T08:00:00'),
    completedAt: new Date('2024-01-20T10:00:00'),
    inspectorId: 'emp-003',
    inspectorName: 'Mike Wilson',
    reviewerId: 'emp-001',
    reviewerName: 'John Smith',
    approvedBy: 'emp-001',
    approvedAt: new Date('2024-01-20T11:00:00'),
    location: 'Receiving Dock',
    workstation: 'Inspection Table 2',
    notes: 'All samples passed. Material released to inventory.',
    attachments: [],
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-20'),
    createdBy: 'emp-003',
    updatedBy: 'emp-001',
  },
  {
    id: 'insp-008',
    inspectionNumber: 'INS-2024-0008',
    type: InspectionType.FINAL,
    status: InspectionStatus.DRAFT,
    workOrderId: 'wo-004',
    workOrderNumber: 'WO-2024-0025',
    productId: 'prod-008',
    productName: 'Electric Motor Assembly',
    productCode: 'EMA-800',
    batchNumber: 'BATCH-2024-008',
    totalQuantity: 30,
    sampledQuantity: 5,
    passedQuantity: 0,
    failedQuantity: 0,
    templateId: 'tmpl-003',
    templateName: 'Final Product Inspection',
    checkpoints: [],
    overallResult: InspectionResult.PENDING,
    defectSummary: { critical: 0, major: 0, minor: 0, cosmetic: 0, total: 0 },
    scheduledDate: new Date('2024-01-23'),
    inspectorId: 'emp-002',
    inspectorName: 'Sarah Johnson',
    location: 'QC Department',
    workstation: 'Final Inspection Bay',
    attachments: [],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    createdBy: 'emp-002',
    updatedBy: 'emp-002',
  },
  {
    id: 'insp-009',
    inspectionNumber: 'INS-2024-0009',
    type: InspectionType.CUSTOMER,
    status: InspectionStatus.APPROVED,
    workOrderId: 'wo-005',
    workOrderNumber: 'WO-2024-0010',
    productId: 'prod-009',
    productName: 'Custom Machined Parts Set',
    productCode: 'CMP-900',
    batchNumber: 'BATCH-2024-009',
    lotNumber: 'LOT-009',
    totalQuantity: 25,
    sampledQuantity: 25,
    passedQuantity: 25,
    failedQuantity: 0,
    templateId: 'tmpl-006',
    templateName: 'Customer FAT Inspection',
    checkpoints: MOCK_CHECKPOINTS.map((cp) => ({ ...cp, result: InspectionResult.PASS })),
    overallResult: InspectionResult.PASS,
    defectSummary: { critical: 0, major: 0, minor: 0, cosmetic: 0, total: 0 },
    scheduledDate: new Date('2024-01-21'),
    startedAt: new Date('2024-01-21T09:00:00'),
    completedAt: new Date('2024-01-21T16:00:00'),
    inspectorId: 'emp-001',
    inspectorName: 'John Smith',
    reviewerId: 'emp-004',
    reviewerName: 'David Brown',
    approvedBy: 'emp-004',
    approvedAt: new Date('2024-01-21T17:00:00'),
    location: 'Shipping Area',
    workstation: 'Customer Inspection Bay',
    notes: 'Customer representative present during inspection. All parts approved for shipment.',
    attachments: [],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-21'),
    createdBy: 'emp-001',
    updatedBy: 'emp-004',
  },
  {
    id: 'insp-010',
    inspectionNumber: 'INS-2024-0010',
    type: InspectionType.IN_PROCESS,
    status: InspectionStatus.CANCELLED,
    workOrderId: 'wo-006',
    workOrderNumber: 'WO-2024-0008',
    productId: 'prod-010',
    productName: 'Copper Heat Exchanger',
    productCode: 'CHE-1000',
    batchNumber: 'BATCH-2024-010',
    totalQuantity: 10,
    sampledQuantity: 2,
    passedQuantity: 0,
    failedQuantity: 0,
    templateId: 'tmpl-002',
    templateName: 'In-Process Inspection',
    checkpoints: [],
    overallResult: InspectionResult.PENDING,
    defectSummary: { critical: 0, major: 0, minor: 0, cosmetic: 0, total: 0 },
    scheduledDate: new Date('2024-01-19'),
    inspectorId: 'emp-003',
    inspectorName: 'Mike Wilson',
    location: 'Production Floor',
    workstation: 'Brazing Station',
    notes: 'Inspection cancelled - Work order put on hold due to material shortage',
    attachments: [],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-19'),
    createdBy: 'emp-003',
    updatedBy: 'emp-003',
  },
];

// ==================== SERVICE CLASS ====================

export class InspectionService {
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

  // Get all inspections with optional filters
  static async getAllInspections(filters?: InspectionFilters): Promise<Inspection[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredInspections = [...MOCK_INSPECTIONS];

      if (filters) {
        if (filters.status) {
          filteredInspections = filteredInspections.filter((i) => i.status === filters.status);
        }
        if (filters.type) {
          filteredInspections = filteredInspections.filter((i) => i.type === filters.type);
        }
        if (filters.result) {
          filteredInspections = filteredInspections.filter((i) => i.overallResult === filters.result);
        }
        if (filters.inspectorId) {
          filteredInspections = filteredInspections.filter((i) => i.inspectorId === filters.inspectorId);
        }
        if (filters.productId) {
          filteredInspections = filteredInspections.filter((i) => i.productId === filters.productId);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredInspections = filteredInspections.filter(
            (i) =>
              i.inspectionNumber.toLowerCase().includes(searchLower) ||
              i.productName.toLowerCase().includes(searchLower) ||
              i.productCode.toLowerCase().includes(searchLower) ||
              i.inspectorName.toLowerCase().includes(searchLower)
          );
        }
      }

      return filteredInspections;
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const queryString = params.toString();
    return this.request<Inspection[]>(`/quality/inspection${queryString ? `?${queryString}` : ''}`);
  }

  // Get inspection by ID
  static async getInspectionById(id: string): Promise<Inspection> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const inspection = MOCK_INSPECTIONS.find((i) => i.id === id);
      if (!inspection) {
        throw new Error('Inspection not found');
      }
      return inspection;
    }
    return this.request<Inspection>(`/quality/inspection/${id}`);
  }

  // Get inspection statistics
  static async getInspectionStatistics(id?: string): Promise<InspectionStatistics> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const inspections = id
        ? MOCK_INSPECTIONS.filter((i) => i.id === id)
        : MOCK_INSPECTIONS;

      const totalInspections = inspections.length;
      const completedInspections = inspections.filter(
        (i) => i.status === InspectionStatus.APPROVED || i.status === InspectionStatus.REJECTED
      );
      const passedInspections = inspections.filter((i) => i.overallResult === InspectionResult.PASS);
      const failedInspections = inspections.filter((i) => i.overallResult === InspectionResult.FAIL);

      const byStatus: Record<InspectionStatus, number> = {
        [InspectionStatus.DRAFT]: 0,
        [InspectionStatus.SCHEDULED]: 0,
        [InspectionStatus.IN_PROGRESS]: 0,
        [InspectionStatus.PENDING_REVIEW]: 0,
        [InspectionStatus.APPROVED]: 0,
        [InspectionStatus.REJECTED]: 0,
        [InspectionStatus.CANCELLED]: 0,
      };

      const byType: Record<InspectionType, number> = {
        [InspectionType.INCOMING]: 0,
        [InspectionType.IN_PROCESS]: 0,
        [InspectionType.FINAL]: 0,
        [InspectionType.FIRST_ARTICLE]: 0,
        [InspectionType.PERIODIC]: 0,
        [InspectionType.SUPPLIER]: 0,
        [InspectionType.CUSTOMER]: 0,
      };

      const byResult: Record<InspectionResult, number> = {
        [InspectionResult.PASS]: 0,
        [InspectionResult.FAIL]: 0,
        [InspectionResult.CONDITIONAL]: 0,
        [InspectionResult.PENDING]: 0,
      };

      const defectsByType = { critical: 0, major: 0, minor: 0, cosmetic: 0 };

      inspections.forEach((inspection) => {
        byStatus[inspection.status]++;
        byType[inspection.type]++;
        byResult[inspection.overallResult]++;
        defectsByType.critical += inspection.defectSummary.critical;
        defectsByType.major += inspection.defectSummary.major;
        defectsByType.minor += inspection.defectSummary.minor;
        defectsByType.cosmetic += inspection.defectSummary.cosmetic;
      });

      const totalDefects = inspections.reduce((sum, i) => sum + i.defectSummary.total, 0);

      return {
        totalInspections,
        passRate: completedInspections.length > 0 ? (passedInspections.length / completedInspections.length) * 100 : 0,
        failRate: completedInspections.length > 0 ? (failedInspections.length / completedInspections.length) * 100 : 0,
        avgDefectsPerInspection: totalInspections > 0 ? totalDefects / totalInspections : 0,
        byStatus,
        byType,
        byResult,
        defectsByType,
        recentTrend: [
          { date: '2024-01-15', passRate: 92, inspectionCount: 5 },
          { date: '2024-01-16', passRate: 88, inspectionCount: 7 },
          { date: '2024-01-17', passRate: 95, inspectionCount: 4 },
          { date: '2024-01-18', passRate: 85, inspectionCount: 6 },
          { date: '2024-01-19', passRate: 90, inspectionCount: 8 },
          { date: '2024-01-20', passRate: 93, inspectionCount: 5 },
          { date: '2024-01-21', passRate: 97, inspectionCount: 3 },
        ],
      };
    }

    const endpoint = id ? `/quality/inspection/${id}/statistics` : '/quality/inspection/statistics';
    return this.request<InspectionStatistics>(endpoint);
  }

  // Create a new inspection
  static async createInspection(data: CreateInspectionDto): Promise<Inspection> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newInspection: Inspection = {
        id: `insp-${Date.now()}`,
        inspectionNumber: `INS-2024-${String(MOCK_INSPECTIONS.length + 1).padStart(4, '0')}`,
        type: data.type,
        status: InspectionStatus.DRAFT,
        workOrderId: data.workOrderId,
        workOrderNumber: data.workOrderNumber,
        productId: data.productId,
        productName: data.productName,
        productCode: data.productCode,
        batchNumber: data.batchNumber,
        lotNumber: data.lotNumber,
        totalQuantity: data.totalQuantity,
        sampledQuantity: data.sampledQuantity,
        passedQuantity: 0,
        failedQuantity: 0,
        templateId: data.templateId,
        checkpoints: [],
        overallResult: InspectionResult.PENDING,
        defectSummary: { critical: 0, major: 0, minor: 0, cosmetic: 0, total: 0 },
        scheduledDate: data.scheduledDate,
        inspectorId: data.inspectorId,
        inspectorName: data.inspectorName,
        location: data.location,
        workstation: data.workstation,
        notes: data.notes,
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: data.inspectorId,
        updatedBy: data.inspectorId,
      };
      MOCK_INSPECTIONS.push(newInspection);
      return newInspection;
    }

    return this.request<Inspection>('/quality/inspection', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update an inspection
  static async updateInspection(id: string, data: UpdateInspectionDto): Promise<Inspection> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_INSPECTIONS.findIndex((i) => i.id === id);
      if (index === -1) {
        throw new Error('Inspection not found');
      }

      MOCK_INSPECTIONS[index] = {
        ...MOCK_INSPECTIONS[index],
        ...data,
        updatedAt: new Date(),
      };
      return MOCK_INSPECTIONS[index];
    }

    return this.request<Inspection>(`/quality/inspection/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Start an inspection
  static async startInspection(id: string): Promise<Inspection> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_INSPECTIONS.findIndex((i) => i.id === id);
      if (index === -1) {
        throw new Error('Inspection not found');
      }

      MOCK_INSPECTIONS[index] = {
        ...MOCK_INSPECTIONS[index],
        status: InspectionStatus.IN_PROGRESS,
        startedAt: new Date(),
        updatedAt: new Date(),
      };
      return MOCK_INSPECTIONS[index];
    }

    return this.request<Inspection>(`/quality/inspection/${id}/start`, {
      method: 'POST',
    });
  }

  // Submit inspection for review
  static async submitInspection(id: string): Promise<Inspection> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_INSPECTIONS.findIndex((i) => i.id === id);
      if (index === -1) {
        throw new Error('Inspection not found');
      }

      MOCK_INSPECTIONS[index] = {
        ...MOCK_INSPECTIONS[index],
        status: InspectionStatus.PENDING_REVIEW,
        completedAt: new Date(),
        updatedAt: new Date(),
      };
      return MOCK_INSPECTIONS[index];
    }

    return this.request<Inspection>(`/quality/inspection/${id}/submit`, {
      method: 'POST',
    });
  }

  // Approve an inspection
  static async approveInspection(id: string, approverId?: string): Promise<Inspection> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_INSPECTIONS.findIndex((i) => i.id === id);
      if (index === -1) {
        throw new Error('Inspection not found');
      }

      MOCK_INSPECTIONS[index] = {
        ...MOCK_INSPECTIONS[index],
        status: InspectionStatus.APPROVED,
        approvedBy: approverId || 'emp-001',
        approvedAt: new Date(),
        updatedAt: new Date(),
      };
      return MOCK_INSPECTIONS[index];
    }

    return this.request<Inspection>(`/quality/inspection/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approverId }),
    });
  }

  // Delete an inspection
  static async deleteInspection(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_INSPECTIONS.findIndex((i) => i.id === id);
      if (index === -1) {
        throw new Error('Inspection not found');
      }
      MOCK_INSPECTIONS.splice(index, 1);
      return;
    }

    await this.request<void>(`/quality/inspection/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const inspectionService = InspectionService;
