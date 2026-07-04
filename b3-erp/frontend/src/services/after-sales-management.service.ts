// After Sales Management Service - Frontend
// Comprehensive service for After Sales Service module

const USE_MOCK_DATA = false;

// Base URL for the NestJS domain backend (b3-erp domain services).
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function apiRequest<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

// ========================================
// ENUMS
// ========================================

export enum ServiceRequestStatus {
  OPEN = 'open',
  ACKNOWLEDGED = 'acknowledged',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  PENDING_PARTS = 'pending_parts',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum ServiceRequestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ContractStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  RENEWED = 'renewed',
}

export enum WarrantyStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  VOID = 'void',
  TRANSFERRED = 'transferred',
}

export enum ClaimStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  INVESTIGATING = 'investigating',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum InstallationStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
}

export enum FieldJobStatus {
  CREATED = 'created',
  DISPATCHED = 'dispatched',
  EN_ROUTE = 'en_route',
  ON_SITE = 'on_site',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TechnicianStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated',
}

export enum ComplaintStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  PENDING_ACTION = 'pending_action',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ESCALATED = 'escalated',
}

// ========================================
// INTERFACES
// ========================================

export interface ServiceType {
  id: string;
  serviceTypeCode: string;
  serviceTypeName: string;
  category: string;
  description?: string;
  slaResponseHours?: number;
  slaResolutionHours?: number;
  defaultPriority: string;
  skillsRequired: string[];
  estimatedDuration?: number;
  baseCharge?: number;
  laborRate?: number;
  isActive: boolean;
}

export interface WarrantyType {
  id: string;
  warrantyTypeCode: string;
  warrantyTypeName: string;
  description?: string;
  durationMonths: number;
  coverageType: string;
  maxClaimsAllowed?: number;
  maxClaimAmount?: number;
  transferable: boolean;
  extendable: boolean;
  isActive: boolean;
}

export interface EquipmentRegistry {
  id: string;
  equipmentCode: string;
  serialNumber: string;
  productId?: string;
  productCode?: string;
  productName: string;
  category?: string;
  model?: string;
  manufacturer?: string;
  customerId?: string;
  customerName: string;
  installationAddress?: string;
  city?: string;
  state?: string;
  purchaseDate?: Date;
  installationDate?: Date;
  warrantyStartDate?: Date;
  warrantyEndDate?: Date;
  warrantyStatus: string;
  contractId?: string;
  contractNumber?: string;
  status: string;
  isActive: boolean;
}

export interface ServiceRequest {
  id: string;
  requestCode: string;
  requestNumber: string;
  requestDate: Date;
  requestType: string;
  customerId?: string;
  customerName: string;
  customerContact?: string;
  customerPhone?: string;
  equipmentId?: string;
  serialNumber?: string;
  productName?: string;
  issueCategory?: string;
  issueDescription: string;
  priority: ServiceRequestPriority;
  slaResponseDue?: Date;
  slaResolutionDue?: Date;
  slaBreached: boolean;
  assignedTechnicianId?: string;
  assignedTechnician?: string;
  diagnosisNotes?: string;
  resolution?: string;
  scheduledDate?: Date;
  completedAt?: Date;
  status: ServiceRequestStatus;
  customerRating?: number;
  source?: string;
  isActive: boolean;
}

export interface SLAConfiguration {
  id: string;
  slaCode: string;
  slaName: string;
  description?: string;
  priority?: string;
  serviceType?: string;
  responseTimeHours: number;
  resolutionTimeHours: number;
  escalationRules?: any;
  penaltyEnabled: boolean;
  isDefault: boolean;
  isActive: boolean;
}

export interface ServiceContract {
  id: string;
  contractCode: string;
  contractNumber: string;
  contractType: string;
  customerId?: string;
  customerName: string;
  startDate: Date;
  endDate: Date;
  durationMonths: number;
  coverageType: string;
  visitsIncluded?: number;
  visitsUsed: number;
  contractValue: number;
  totalAmount: number;
  paymentTerms?: string;
  status: ContractStatus;
  autoRenewal: boolean;
  isActive: boolean;
}

export interface ContractRenewal {
  id: string;
  renewalCode: string;
  contractId: string;
  renewalNumber: number;
  previousEndDate?: Date;
  newStartDate: Date;
  newEndDate: Date;
  newValue: number;
  priceIncrease?: number;
  status: string;
  isActive: boolean;
}

export interface WarrantyRegistration {
  id: string;
  warrantyCode: string;
  warrantyNumber: string;
  equipmentId?: string;
  serialNumber: string;
  productId?: string;
  productName: string;
  customerId?: string;
  customerName: string;
  purchaseDate: Date;
  warrantyTypeId?: string;
  warrantyTypeName?: string;
  warrantyStartDate: Date;
  warrantyEndDate: Date;
  durationMonths: number;
  coverageType: string;
  claimsUsed: number;
  status: WarrantyStatus;
  isActive: boolean;
}

export interface WarrantyClaim {
  id: string;
  claimCode: string;
  claimNumber: string;
  claimDate: Date;
  warrantyId: string;
  warrantyNumber?: string;
  serialNumber?: string;
  productName?: string;
  customerId?: string;
  customerName: string;
  issueDescription: string;
  defectType?: string;
  resolutionType?: string;
  resolution?: string;
  totalClaimValue?: number;
  status: ClaimStatus;
  rejectionReason?: string;
  isActive: boolean;
}

export interface Installation {
  id: string;
  installationCode: string;
  installationNumber: string;
  salesOrderId?: string;
  salesOrderNumber?: string;
  customerId?: string;
  customerName: string;
  installationAddress: string;
  city?: string;
  state?: string;
  equipmentItems: any;
  totalItems: number;
  requestedDate?: Date;
  scheduledDate?: Date;
  assignedTeam?: string;
  leadTechnician?: string;
  actualStartDate?: Date;
  actualEndDate?: Date;
  status: InstallationStatus;
  completionPercentage: number;
  isActive: boolean;
}

export interface FieldServiceJob {
  id: string;
  jobCode: string;
  jobNumber: string;
  jobType: string;
  serviceRequestId?: string;
  customerId?: string;
  customerName: string;
  serviceAddress: string;
  city?: string;
  state?: string;
  equipmentId?: string;
  serialNumber?: string;
  productName?: string;
  technicianId?: string;
  technicianName?: string;
  scheduledDate: Date;
  scheduledTimeSlot?: string;
  estimatedDuration?: number;
  priority: string;
  actualStartTime?: Date;
  actualEndTime?: Date;
  workPerformed?: string;
  partsCost?: number;
  laborCost?: number;
  totalCost?: number;
  status: FieldJobStatus;
  customerRating?: number;
  isBillable: boolean;
  isActive: boolean;
}

export interface Technician {
  id: string;
  technicianCode: string;
  technicianName: string;
  employeeId?: string;
  email?: string;
  phone: string;
  skills: string[];
  certifications: string[];
  productExpertise: string[];
  experienceYears?: number;
  baseLocation?: string;
  serviceAreas: string[];
  isAvailable: boolean;
  availabilityStatus: string;
  totalJobsCompleted: number;
  averageRating?: number;
  firstTimeFixRate?: number;
  status: TechnicianStatus;
  isActive: boolean;
}

export interface ServiceSparePart {
  id: string;
  partCode: string;
  partNumber: string;
  partName: string;
  description?: string;
  category?: string;
  unitPrice: number;
  costPrice?: number;
  stockQuantity: number;
  availableQuantity: number;
  reorderLevel?: number;
  unit: string;
  preferredVendor?: string;
  isCritical: boolean;
  isActive: boolean;
}

export interface PartsRequisition {
  id: string;
  requisitionCode: string;
  requisitionNumber: string;
  requisitionDate: Date;
  serviceRequestId?: string;
  fieldJobId?: string;
  technicianId?: string;
  technicianName?: string;
  requestType: string;
  priority: string;
  items: any;
  totalItems: number;
  estimatedValue?: number;
  status: string;
  isActive: boolean;
}

export interface ServiceInvoice {
  id: string;
  invoiceCode: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate?: Date;
  invoiceType: string;
  customerId?: string;
  customerName: string;
  serviceRequestId?: string;
  fieldJobId?: string;
  contractId?: string;
  laborCharges?: number;
  partsCharges?: number;
  subtotal: number;
  totalTax?: number;
  totalAmount: number;
  grandTotal: number;
  amountPaid?: number;
  balanceDue?: number;
  paymentStatus: string;
  status: string;
  isActive: boolean;
}

export interface KnowledgeArticle {
  id: string;
  articleCode: string;
  title: string;
  slug?: string;
  category: string;
  subCategory?: string;
  summary?: string;
  content: string;
  tags: string[];
  keywords: string[];
  productCategories: string[];
  visibleToCustomers: boolean;
  visibleToTechnicians: boolean;
  viewCount: number;
  helpfulCount: number;
  status: string;
  isActive: boolean;
}

export interface TroubleshootingGuide {
  id: string;
  guideCode: string;
  title: string;
  problemDescription: string;
  symptoms: string[];
  errorCodes: string[];
  productCategories: string[];
  diagnosticSteps: any;
  solutionSteps: any;
  toolsRequired: string[];
  estimatedTime?: number;
  skillLevel?: string;
  usageCount: number;
  status: string;
  isActive: boolean;
}

export interface FeedbackSurvey {
  id: string;
  surveyCode: string;
  surveyName: string;
  description?: string;
  surveyType: string;
  questions: any;
  triggerEvent?: string;
  autoSend: boolean;
  totalSent: number;
  totalResponses: number;
  responseRate?: number;
  status: string;
  isActive: boolean;
}

export interface ServiceRating {
  id: string;
  ratingCode: string;
  ratingDate: Date;
  serviceRequestId?: string;
  fieldJobId?: string;
  customerId?: string;
  customerName?: string;
  technicianId?: string;
  technicianName?: string;
  overallRating: number;
  npsScore?: number;
  npsCategory?: string;
  feedback?: string;
  wouldRecommend?: boolean;
  status: string;
  isActive: boolean;
}

export interface CustomerComplaint {
  id: string;
  complaintCode: string;
  complaintNumber: string;
  complaintDate: Date;
  customerId?: string;
  customerName: string;
  serviceRequestId?: string;
  technicianId?: string;
  category: string;
  subject: string;
  description: string;
  priority: string;
  severity?: string;
  assignedTo?: string;
  resolution?: string;
  resolutionDate?: Date;
  status: ComplaintStatus;
  slaBreached: boolean;
  customerSatisfied?: boolean;
  isActive: boolean;
}

export interface DashboardStats {
  serviceRequests: {
    total: number;
    open: number;
    inProgress: number;
    resolvedThisMonth: number;
  };
  contracts: {
    active: number;
    expiringSoon: number;
  };
  warranties: {
    active: number;
    pendingClaims: number;
  };
  complaints: {
    open: number;
  };
  technicians: {
    available: number;
  };
}

export interface KnowledgeFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  unhelpful: number;
  views: number;
  featured: boolean;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface KnowledgeManual {
  id: string;
  title: string;
  productModel: string;
  description: string;
  category: string;
  author: string;
  datePublished: string;
  fileSize: string;
  format: string;
  downloads: number;
  rating: number;
  views: number;
  language: string;
  pages: number;
  versions: number;
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServicePayment {
  id: string;
  paymentNumber?: string;
  invoiceNumber?: string;
  invoiceId?: string;
  customerId?: string;
  customerName?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  paymentReference?: string;
  notes?: string;
  status?: string;
}

// ========================================
// MOCK DATA
// ========================================

const mockServiceTypes: ServiceType[] = [
  {
    id: '1',
    serviceTypeCode: 'ST001',
    serviceTypeName: 'Installation',
    category: 'installation',
    description: 'Product installation service',
    slaResponseHours: 4,
    slaResolutionHours: 24,
    defaultPriority: 'medium',
    skillsRequired: ['installation', 'configuration'],
    estimatedDuration: 120,
    baseCharge: 500,
    laborRate: 200,
    isActive: true,
  },
  {
    id: '2',
    serviceTypeCode: 'ST002',
    serviceTypeName: 'Repair',
    category: 'repair',
    description: 'Equipment repair service',
    slaResponseHours: 2,
    slaResolutionHours: 8,
    defaultPriority: 'high',
    skillsRequired: ['diagnosis', 'repair'],
    estimatedDuration: 90,
    baseCharge: 300,
    laborRate: 250,
    isActive: true,
  },
  {
    id: '3',
    serviceTypeCode: 'ST003',
    serviceTypeName: 'Preventive Maintenance',
    category: 'maintenance',
    description: 'Regular preventive maintenance',
    slaResponseHours: 24,
    slaResolutionHours: 48,
    defaultPriority: 'low',
    skillsRequired: ['maintenance', 'inspection'],
    estimatedDuration: 60,
    baseCharge: 200,
    laborRate: 150,
    isActive: true,
  },
];

const mockServiceRequests: ServiceRequest[] = [
  {
    id: '1',
    requestCode: 'SR001',
    requestNumber: 'SR-2024-00001',
    requestDate: new Date('2024-01-15'),
    requestType: 'complaint',
    customerName: 'ABC Manufacturing Ltd',
    customerContact: 'John Smith',
    customerPhone: '9876543210',
    serialNumber: 'EQ-12345',
    productName: 'CNC Machine Model X500',
    issueCategory: 'Mechanical',
    issueDescription: 'Machine making unusual noise during operation',
    priority: ServiceRequestPriority.HIGH,
    slaResponseDue: new Date('2024-01-15T18:00:00'),
    slaResolutionDue: new Date('2024-01-16T18:00:00'),
    slaBreached: false,
    assignedTechnician: 'Rajesh Kumar',
    status: ServiceRequestStatus.IN_PROGRESS,
    source: 'phone',
    isActive: true,
  },
  {
    id: '2',
    requestCode: 'SR002',
    requestNumber: 'SR-2024-00002',
    requestDate: new Date('2024-01-16'),
    requestType: 'service',
    customerName: 'XYZ Industries',
    customerContact: 'Mary Johnson',
    customerPhone: '9123456789',
    serialNumber: 'EQ-23456',
    productName: 'Industrial Pump P200',
    issueDescription: 'Scheduled maintenance required',
    priority: ServiceRequestPriority.MEDIUM,
    slaBreached: false,
    status: ServiceRequestStatus.SCHEDULED,
    source: 'portal',
    isActive: true,
  },
];

const mockServiceContracts: ServiceContract[] = [
  {
    id: '1',
    contractCode: 'SC001',
    contractNumber: 'AMC-2024-00001',
    contractType: 'amc',
    customerName: 'ABC Manufacturing Ltd',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    durationMonths: 12,
    coverageType: 'comprehensive',
    visitsIncluded: 4,
    visitsUsed: 1,
    contractValue: 50000,
    totalAmount: 59000,
    paymentTerms: 'quarterly',
    status: ContractStatus.ACTIVE,
    autoRenewal: true,
    isActive: true,
  },
  {
    id: '2',
    contractCode: 'SC002',
    contractNumber: 'AMC-2024-00002',
    contractType: 'cmc',
    customerName: 'XYZ Industries',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2025-01-31'),
    durationMonths: 12,
    coverageType: 'non_comprehensive',
    visitsIncluded: 2,
    visitsUsed: 0,
    contractValue: 30000,
    totalAmount: 35400,
    status: ContractStatus.ACTIVE,
    autoRenewal: false,
    isActive: true,
  },
];

const mockWarrantyRegistrations: WarrantyRegistration[] = [
  {
    id: '1',
    warrantyCode: 'WR001',
    warrantyNumber: 'WR-2024-00001',
    serialNumber: 'EQ-12345',
    productName: 'CNC Machine Model X500',
    customerName: 'ABC Manufacturing Ltd',
    purchaseDate: new Date('2023-06-15'),
    warrantyTypeName: 'Standard Warranty',
    warrantyStartDate: new Date('2023-06-15'),
    warrantyEndDate: new Date('2024-06-14'),
    durationMonths: 12,
    coverageType: 'full',
    claimsUsed: 0,
    status: WarrantyStatus.ACTIVE,
    isActive: true,
  },
];

const mockWarrantyClaims: WarrantyClaim[] = [
  {
    id: '1',
    claimCode: 'WC001',
    claimNumber: 'WC-2024-00001',
    claimDate: new Date('2024-01-10'),
    warrantyId: '1',
    warrantyNumber: 'WR-2024-00001',
    serialNumber: 'EQ-12345',
    productName: 'CNC Machine Model X500',
    customerName: 'ABC Manufacturing Ltd',
    issueDescription: 'Spindle motor failure',
    defectType: 'Manufacturing Defect',
    status: ClaimStatus.UNDER_REVIEW,
    isActive: true,
  },
];

const mockInstallations: Installation[] = [
  {
    id: '1',
    installationCode: 'INS001',
    installationNumber: 'INS-2024-00001',
    salesOrderNumber: 'SO-2024-00100',
    customerName: 'ABC Manufacturing Ltd',
    installationAddress: '123 Industrial Park, Sector 5',
    city: 'Mumbai',
    state: 'Maharashtra',
    equipmentItems: [
      { productName: 'CNC Machine X500', serialNumber: 'EQ-34567', quantity: 1 },
    ],
    totalItems: 1,
    scheduledDate: new Date('2024-01-20'),
    assignedTeam: 'Installation Team A',
    leadTechnician: 'Suresh Patel',
    status: InstallationStatus.SCHEDULED,
    completionPercentage: 0,
    isActive: true,
  },
];

const mockFieldServiceJobs: FieldServiceJob[] = [
  {
    id: '1',
    jobCode: 'FJ001',
    jobNumber: 'FJ-2024-00001',
    jobType: 'repair',
    serviceRequestId: '1',
    customerName: 'ABC Manufacturing Ltd',
    serviceAddress: '123 Industrial Park, Sector 5, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    serialNumber: 'EQ-12345',
    productName: 'CNC Machine Model X500',
    technicianId: '1',
    technicianName: 'Rajesh Kumar',
    scheduledDate: new Date('2024-01-15'),
    scheduledTimeSlot: 'morning',
    estimatedDuration: 120,
    priority: 'high',
    status: FieldJobStatus.IN_PROGRESS,
    isBillable: false,
    isActive: true,
  },
];

const mockTechnicians: Technician[] = [
  {
    id: '1',
    technicianCode: 'TEC001',
    technicianName: 'Rajesh Kumar',
    email: 'rajesh.kumar@company.com',
    phone: '9876543210',
    skills: ['CNC', 'PLC', 'Hydraulics'],
    certifications: ['ISO Certified Technician'],
    productExpertise: ['CNC Machines', 'Industrial Pumps'],
    experienceYears: 8,
    baseLocation: 'Mumbai',
    serviceAreas: ['Mumbai', 'Navi Mumbai', 'Thane'],
    isAvailable: true,
    availabilityStatus: 'available',
    totalJobsCompleted: 245,
    averageRating: 4.5,
    firstTimeFixRate: 85.5,
    status: TechnicianStatus.ACTIVE,
    isActive: true,
  },
  {
    id: '2',
    technicianCode: 'TEC002',
    technicianName: 'Suresh Patel',
    email: 'suresh.patel@company.com',
    phone: '9123456789',
    skills: ['Installation', 'Commissioning', 'Training'],
    certifications: ['OEM Certified'],
    productExpertise: ['All Products'],
    experienceYears: 10,
    baseLocation: 'Mumbai',
    serviceAreas: ['Mumbai', 'Pune', 'Nashik'],
    isAvailable: true,
    availabilityStatus: 'on_job',
    totalJobsCompleted: 320,
    averageRating: 4.8,
    status: TechnicianStatus.ACTIVE,
    isActive: true,
  },
];

const mockSpareParts: ServiceSparePart[] = [
  {
    id: '1',
    partCode: 'SP001',
    partNumber: 'MTR-CNC-500',
    partName: 'Spindle Motor Assembly',
    description: 'Complete spindle motor for CNC X500',
    category: 'Motors',
    unitPrice: 45000,
    costPrice: 35000,
    stockQuantity: 5,
    availableQuantity: 3,
    reorderLevel: 2,
    unit: 'pcs',
    preferredVendor: 'Motor Suppliers Inc',
    isCritical: true,
    isActive: true,
  },
  {
    id: '2',
    partCode: 'SP002',
    partNumber: 'BRG-6205-2RS',
    partName: 'Ball Bearing 6205-2RS',
    description: 'Standard ball bearing',
    category: 'Bearings',
    unitPrice: 250,
    costPrice: 180,
    stockQuantity: 50,
    availableQuantity: 45,
    reorderLevel: 20,
    unit: 'pcs',
    isCritical: false,
    isActive: true,
  },
];

const mockKnowledgeArticles: KnowledgeArticle[] = [
  {
    id: '1',
    articleCode: 'KB001',
    title: 'CNC Machine Spindle Maintenance Guide',
    category: 'troubleshooting',
    summary: 'Step-by-step guide for spindle maintenance',
    content:
      'This guide covers the complete process for maintaining CNC machine spindles...',
    tags: ['cnc', 'spindle', 'maintenance'],
    keywords: ['spindle maintenance', 'cnc care'],
    productCategories: ['CNC Machines'],
    visibleToCustomers: false,
    visibleToTechnicians: true,
    viewCount: 125,
    helpfulCount: 98,
    status: 'published',
    isActive: true,
  },
];

const mockComplaints: CustomerComplaint[] = [
  {
    id: '1',
    complaintCode: 'CMP001',
    complaintNumber: 'CMP-2024-00001',
    complaintDate: new Date('2024-01-12'),
    customerName: 'ABC Manufacturing Ltd',
    category: 'service_quality',
    subject: 'Delayed response to service request',
    description: 'Service request SR-2024-00001 was not responded to within SLA',
    priority: 'high',
    status: ComplaintStatus.INVESTIGATING,
    slaBreached: true,
    isActive: true,
  },
];

const mockDashboardStats: DashboardStats = {
  serviceRequests: {
    total: 156,
    open: 12,
    inProgress: 8,
    resolvedThisMonth: 45,
  },
  contracts: {
    active: 87,
    expiringSoon: 5,
  },
  warranties: {
    active: 234,
    pendingClaims: 3,
  },
  complaints: {
    open: 2,
  },
  technicians: {
    available: 8,
  },
};

// ========================================
// SERVICE CLASS
// ========================================

export class AfterSalesManagementService {
  // Service Types
  static async getServiceTypes(): Promise<ServiceType[]> {
    if (USE_MOCK_DATA) return mockServiceTypes;
    // API call
    return [];
  }

  static async getServiceType(id: string): Promise<ServiceType | null> {
    if (USE_MOCK_DATA) return mockServiceTypes.find((s) => s.id === id) || null;
    return null;
  }

  static async createServiceType(data: Partial<ServiceType>): Promise<ServiceType> {
    if (USE_MOCK_DATA) {
      const newType = { ...data, id: Date.now().toString() } as ServiceType;
      mockServiceTypes.push(newType);
      return newType;
    }
    return {} as ServiceType;
  }

  // Warranty Types
  static async getWarrantyTypes(): Promise<WarrantyType[]> {
    if (USE_MOCK_DATA)
      return [
        {
          id: '1',
          warrantyTypeCode: 'WT001',
          warrantyTypeName: 'Standard Warranty',
          durationMonths: 12,
          coverageType: 'full',
          transferable: false,
          extendable: true,
          isActive: true,
        },
      ];
    return [];
  }

  // Equipment Registry
  static async getEquipmentRegistry(): Promise<EquipmentRegistry[]> {
    if (USE_MOCK_DATA)
      return [
        {
          id: '1',
          equipmentCode: 'EQ001',
          serialNumber: 'EQ-12345',
          productName: 'CNC Machine Model X500',
          customerName: 'ABC Manufacturing Ltd',
          status: 'active',
          warrantyStatus: 'active',
          isActive: true,
        },
      ] as EquipmentRegistry[];
    return [];
  }

  static async getEquipment(id: string): Promise<EquipmentRegistry | null> {
    if (USE_MOCK_DATA)
      return {
        id: '1',
        equipmentCode: 'EQ001',
        serialNumber: 'EQ-12345',
        productName: 'CNC Machine Model X500',
        customerName: 'ABC Manufacturing Ltd',
        status: 'active',
        warrantyStatus: 'active',
        isActive: true,
      } as EquipmentRegistry;
    return null;
  }

  // Service Requests
  static async getServiceRequests(filters?: any): Promise<ServiceRequest[]> {
    if (USE_MOCK_DATA) {
      let results = [...mockServiceRequests];
      if (filters?.status) {
        results = results.filter((r) => r.status === filters.status);
      }
      return results;
    }
    return [];
  }

  static async getServiceRequest(id: string): Promise<ServiceRequest | null> {
    if (USE_MOCK_DATA)
      return mockServiceRequests.find((r) => r.id === id) || null;
    return null;
  }

  static async createServiceRequest(
    data: Partial<ServiceRequest>
  ): Promise<ServiceRequest> {
    if (USE_MOCK_DATA) {
      const newRequest = {
        ...data,
        id: Date.now().toString(),
        requestCode: `SR${Date.now()}`,
        requestNumber: `SR-2024-${String(mockServiceRequests.length + 1).padStart(5, '0')}`,
        requestDate: new Date(),
        status: ServiceRequestStatus.OPEN,
        slaBreached: false,
        isActive: true,
      } as ServiceRequest;
      mockServiceRequests.push(newRequest);
      return newRequest;
    }
    return {} as ServiceRequest;
  }

  static async updateServiceRequest(
    id: string,
    data: Partial<ServiceRequest>
  ): Promise<ServiceRequest | null> {
    if (USE_MOCK_DATA) {
      const index = mockServiceRequests.findIndex((r) => r.id === id);
      if (index >= 0) {
        mockServiceRequests[index] = { ...mockServiceRequests[index], ...data };
        return mockServiceRequests[index];
      }
    }
    return null;
  }

  static async getOpenServiceRequests(): Promise<ServiceRequest[]> {
    return this.getServiceRequests({ status: ServiceRequestStatus.OPEN });
  }

  // SLA Configuration
  static async getSLAConfigurations(): Promise<SLAConfiguration[]> {
    if (USE_MOCK_DATA)
      return [
        {
          id: '1',
          slaCode: 'SLA001',
          slaName: 'Critical Priority SLA',
          responseTimeHours: 1,
          resolutionTimeHours: 4,
          penaltyEnabled: true,
          isDefault: false,
          isActive: true,
        },
      ];
    return [];
  }

  // Service Contracts
  static async getServiceContracts(filters?: any): Promise<ServiceContract[]> {
    if (USE_MOCK_DATA) {
      let results = [...mockServiceContracts];
      if (filters?.status) {
        results = results.filter((c) => c.status === filters.status);
      }
      return results;
    }
    return [];
  }

  static async getServiceContract(id: string): Promise<ServiceContract | null> {
    if (USE_MOCK_DATA)
      return mockServiceContracts.find((c) => c.id === id) || null;
    return null;
  }

  static async createServiceContract(
    data: Partial<ServiceContract>
  ): Promise<ServiceContract> {
    if (USE_MOCK_DATA) {
      const newContract = {
        ...data,
        id: Date.now().toString(),
        contractCode: `SC${Date.now()}`,
        contractNumber: `AMC-2024-${String(mockServiceContracts.length + 1).padStart(5, '0')}`,
        status: ContractStatus.DRAFT,
        visitsUsed: 0,
        isActive: true,
      } as ServiceContract;
      mockServiceContracts.push(newContract);
      return newContract;
    }
    return {} as ServiceContract;
  }

  static async getActiveContracts(): Promise<ServiceContract[]> {
    return this.getServiceContracts({ status: ContractStatus.ACTIVE });
  }

  static async getExpiringContracts(daysAhead: number = 30): Promise<ServiceContract[]> {
    if (USE_MOCK_DATA) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);
      return mockServiceContracts.filter(
        (c) => c.status === ContractStatus.ACTIVE && new Date(c.endDate) <= futureDate
      );
    }
    return [];
  }

  // Contract Renewals
  static async getContractRenewals(contractId?: string): Promise<ContractRenewal[]> {
    if (USE_MOCK_DATA) return [];
    return [];
  }

  // Warranty Registrations
  static async getWarrantyRegistrations(filters?: any): Promise<WarrantyRegistration[]> {
    if (USE_MOCK_DATA) {
      let results = [...mockWarrantyRegistrations];
      if (filters?.status) {
        results = results.filter((w) => w.status === filters.status);
      }
      return results;
    }
    return [];
  }

  static async getWarrantyRegistration(id: string): Promise<WarrantyRegistration | null> {
    if (USE_MOCK_DATA)
      return mockWarrantyRegistrations.find((w) => w.id === id) || null;
    return null;
  }

  static async createWarrantyRegistration(
    data: Partial<WarrantyRegistration>
  ): Promise<WarrantyRegistration> {
    if (USE_MOCK_DATA) {
      const newWarranty = {
        ...data,
        id: Date.now().toString(),
        warrantyCode: `WR${Date.now()}`,
        warrantyNumber: `WR-2024-${String(mockWarrantyRegistrations.length + 1).padStart(5, '0')}`,
        claimsUsed: 0,
        status: WarrantyStatus.ACTIVE,
        isActive: true,
      } as WarrantyRegistration;
      mockWarrantyRegistrations.push(newWarranty);
      return newWarranty;
    }
    return {} as WarrantyRegistration;
  }

  static async getActiveWarranties(): Promise<WarrantyRegistration[]> {
    return this.getWarrantyRegistrations({ status: WarrantyStatus.ACTIVE });
  }

  // Warranty Claims
  static async getWarrantyClaims(filters?: any): Promise<WarrantyClaim[]> {
    if (USE_MOCK_DATA) {
      let results = [...mockWarrantyClaims];
      if (filters?.status) {
        results = results.filter((c) => c.status === filters.status);
      }
      return results;
    }
    return [];
  }

  static async getWarrantyClaim(id: string): Promise<WarrantyClaim | null> {
    if (USE_MOCK_DATA) return mockWarrantyClaims.find((c) => c.id === id) || null;
    return null;
  }

  static async createWarrantyClaim(data: Partial<WarrantyClaim>): Promise<WarrantyClaim> {
    if (USE_MOCK_DATA) {
      const newClaim = {
        ...data,
        id: Date.now().toString(),
        claimCode: `WC${Date.now()}`,
        claimNumber: `WC-2024-${String(mockWarrantyClaims.length + 1).padStart(5, '0')}`,
        claimDate: new Date(),
        status: ClaimStatus.SUBMITTED,
        isActive: true,
      } as WarrantyClaim;
      mockWarrantyClaims.push(newClaim);
      return newClaim;
    }
    return {} as WarrantyClaim;
  }

  static async getPendingClaimApprovals(): Promise<WarrantyClaim[]> {
    return this.getWarrantyClaims({ status: ClaimStatus.SUBMITTED });
  }

  // Installations
  static async getInstallations(filters?: any): Promise<Installation[]> {
    if (USE_MOCK_DATA) return mockInstallations;
    return [];
  }

  static async getInstallation(id: string): Promise<Installation | null> {
    if (USE_MOCK_DATA) return mockInstallations.find((i) => i.id === id) || null;
    return null;
  }

  static async createInstallation(data: Partial<Installation>): Promise<Installation> {
    if (USE_MOCK_DATA) {
      const newInstallation = {
        ...data,
        id: Date.now().toString(),
        installationCode: `INS${Date.now()}`,
        installationNumber: `INS-2024-${String(mockInstallations.length + 1).padStart(5, '0')}`,
        status: InstallationStatus.PENDING,
        completionPercentage: 0,
        isActive: true,
      } as Installation;
      mockInstallations.push(newInstallation);
      return newInstallation;
    }
    return {} as Installation;
  }

  static async getPendingInstallations(): Promise<Installation[]> {
    if (USE_MOCK_DATA) {
      return mockInstallations.filter(
        (i) =>
          i.status === InstallationStatus.PENDING ||
          i.status === InstallationStatus.SCHEDULED
      );
    }
    return [];
  }

  // Field Service Jobs
  static async getFieldServiceJobs(filters?: any): Promise<FieldServiceJob[]> {
    if (USE_MOCK_DATA) return mockFieldServiceJobs;
    return [];
  }

  static async getFieldServiceJob(id: string): Promise<FieldServiceJob | null> {
    if (USE_MOCK_DATA) return mockFieldServiceJobs.find((j) => j.id === id) || null;
    return null;
  }

  static async createFieldServiceJob(data: Partial<FieldServiceJob>): Promise<FieldServiceJob> {
    if (USE_MOCK_DATA) {
      const newJob = {
        ...data,
        id: Date.now().toString(),
        jobCode: `FJ${Date.now()}`,
        jobNumber: `FJ-2024-${String(mockFieldServiceJobs.length + 1).padStart(5, '0')}`,
        status: FieldJobStatus.CREATED,
        isBillable: true,
        isActive: true,
      } as FieldServiceJob;
      mockFieldServiceJobs.push(newJob);
      return newJob;
    }
    return {} as FieldServiceJob;
  }

  static async getDispatchBoard(date: Date): Promise<any> {
    if (USE_MOCK_DATA) {
      return {
        date,
        jobs: mockFieldServiceJobs,
        technicians: mockTechnicians,
        summary: {
          totalJobs: mockFieldServiceJobs.length,
          dispatched: 1,
          inProgress: 1,
          completed: 0,
        },
      };
    }
    return {};
  }

  // Technicians
  static async getTechnicians(filters?: any): Promise<Technician[]> {
    if (USE_MOCK_DATA) return mockTechnicians;
    return [];
  }

  static async getTechnician(id: string): Promise<Technician | null> {
    if (USE_MOCK_DATA) return mockTechnicians.find((t) => t.id === id) || null;
    return null;
  }

  static async createTechnician(data: Partial<Technician>): Promise<Technician> {
    if (USE_MOCK_DATA) {
      const newTechnician = {
        ...data,
        id: Date.now().toString(),
        technicianCode: `TEC${Date.now()}`,
        isAvailable: true,
        availabilityStatus: 'available',
        totalJobsCompleted: 0,
        status: TechnicianStatus.ACTIVE,
        isActive: true,
      } as Technician;
      mockTechnicians.push(newTechnician);
      return newTechnician;
    }
    return {} as Technician;
  }

  static async getAvailableTechnicians(): Promise<Technician[]> {
    if (USE_MOCK_DATA) {
      return mockTechnicians.filter((t) => t.isAvailable);
    }
    return [];
  }

  // Spare Parts
  static async getSpareParts(filters?: any): Promise<ServiceSparePart[]> {
    if (USE_MOCK_DATA) return mockSpareParts;
    return [];
  }

  static async getSparePart(id: string): Promise<ServiceSparePart | null> {
    if (USE_MOCK_DATA) return mockSpareParts.find((p) => p.id === id) || null;
    return null;
  }

  static async createSparePart(data: Partial<ServiceSparePart>): Promise<ServiceSparePart> {
    if (USE_MOCK_DATA) {
      const newPart = {
        ...data,
        id: Date.now().toString(),
        partCode: `SP${Date.now()}`,
        stockQuantity: 0,
        availableQuantity: 0,
        isActive: true,
      } as ServiceSparePart;
      mockSpareParts.push(newPart);
      return newPart;
    }
    return {} as ServiceSparePart;
  }

  static async getLowStockParts(): Promise<ServiceSparePart[]> {
    if (USE_MOCK_DATA) {
      return mockSpareParts.filter(
        (p) => p.reorderLevel && p.availableQuantity <= p.reorderLevel
      );
    }
    return [];
  }

  // Parts Requisitions
  static async getPartsRequisitions(filters?: any): Promise<PartsRequisition[]> {
    if (USE_MOCK_DATA) return [];
    return [];
  }

  static async createPartsRequisition(
    data: Partial<PartsRequisition>
  ): Promise<PartsRequisition> {
    return {} as PartsRequisition;
  }

  // Service Invoices
  static async getServiceInvoices(filters?: any): Promise<ServiceInvoice[]> {
    if (USE_MOCK_DATA)
      return [
        {
          id: '1',
          invoiceCode: 'SI001',
          invoiceNumber: 'SI-2024-00001',
          invoiceDate: new Date('2024-01-15'),
          invoiceType: 'service',
          customerName: 'ABC Manufacturing Ltd',
          subtotal: 5000,
          totalTax: 900,
          totalAmount: 5900,
          grandTotal: 5900,
          paymentStatus: 'pending',
          status: 'sent',
          isActive: true,
        },
      ] as ServiceInvoice[];
    return [];
  }

  static async getPendingInvoices(): Promise<ServiceInvoice[]> {
    const invoices = await this.getServiceInvoices();
    return invoices.filter(
      (i) => i.paymentStatus === 'pending' || i.paymentStatus === 'partial'
    );
  }

  // Knowledge Base
  static async getKnowledgeArticles(filters?: any): Promise<KnowledgeArticle[]> {
    if (USE_MOCK_DATA) return mockKnowledgeArticles;
    return [];
  }

  static async getKnowledgeArticle(id: string): Promise<KnowledgeArticle | null> {
    if (USE_MOCK_DATA) return mockKnowledgeArticles.find((a) => a.id === id) || null;
    return null;
  }

  static async searchKnowledgeArticles(searchTerm: string): Promise<KnowledgeArticle[]> {
    if (USE_MOCK_DATA) {
      const term = searchTerm.toLowerCase();
      return mockKnowledgeArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.content.toLowerCase().includes(term) ||
          a.tags.some((t) => t.toLowerCase().includes(term))
      );
    }
    return [];
  }

  // Troubleshooting Guides
  static async getTroubleshootingGuides(filters?: any): Promise<TroubleshootingGuide[]> {
    if (USE_MOCK_DATA)
      return [
        {
          id: '1',
          guideCode: 'TG001',
          title: 'CNC Spindle Noise Troubleshooting',
          problemDescription: 'Machine spindle making unusual noise',
          symptoms: ['grinding noise', 'vibration', 'overheating'],
          errorCodes: ['E001', 'E002'],
          productCategories: ['CNC Machines'],
          diagnosticSteps: [{ step: 1, description: 'Check bearing condition' }],
          solutionSteps: [{ step: 1, description: 'Replace worn bearings' }],
          toolsRequired: ['Bearing puller', 'Torque wrench'],
          estimatedTime: 60,
          skillLevel: 'intermediate',
          usageCount: 45,
          status: 'active',
          isActive: true,
        },
      ];
    return [];
  }

  // Feedback & Ratings
  static async getFeedbackSurveys(): Promise<FeedbackSurvey[]> {
    if (USE_MOCK_DATA)
      return [
        {
          id: '1',
          surveyCode: 'FS001',
          surveyName: 'Post-Service Satisfaction Survey',
          surveyType: 'post_service',
          questions: [],
          autoSend: true,
          totalSent: 100,
          totalResponses: 65,
          responseRate: 65,
          status: 'active',
          isActive: true,
        },
      ];
    return [];
  }

  static async getServiceRatings(filters?: any): Promise<ServiceRating[]> {
    if (USE_MOCK_DATA)
      return [
        {
          id: '1',
          ratingCode: 'RT001',
          ratingDate: new Date('2024-01-15'),
          customerName: 'ABC Manufacturing Ltd',
          technicianName: 'Rajesh Kumar',
          overallRating: 5,
          npsScore: 9,
          npsCategory: 'promoter',
          feedback: 'Excellent service!',
          wouldRecommend: true,
          status: 'submitted',
          isActive: true,
        },
      ];
    return [];
  }

  static async createServiceRating(data: Partial<ServiceRating>): Promise<ServiceRating> {
    return {} as ServiceRating;
  }

  // Complaints
  static async getComplaints(filters?: any): Promise<CustomerComplaint[]> {
    if (USE_MOCK_DATA) {
      let results = [...mockComplaints];
      if (filters?.status) {
        results = results.filter((c) => c.status === filters.status);
      }
      return results;
    }
    return [];
  }

  static async getComplaint(id: string): Promise<CustomerComplaint | null> {
    if (USE_MOCK_DATA) return mockComplaints.find((c) => c.id === id) || null;
    return null;
  }

  static async createComplaint(data: Partial<CustomerComplaint>): Promise<CustomerComplaint> {
    if (USE_MOCK_DATA) {
      const newComplaint = {
        ...data,
        id: Date.now().toString(),
        complaintCode: `CMP${Date.now()}`,
        complaintNumber: `CMP-2024-${String(mockComplaints.length + 1).padStart(5, '0')}`,
        complaintDate: new Date(),
        status: ComplaintStatus.OPEN,
        slaBreached: false,
        isActive: true,
      } as CustomerComplaint;
      mockComplaints.push(newComplaint);
      return newComplaint;
    }
    return {} as CustomerComplaint;
  }

  static async getOpenComplaints(): Promise<CustomerComplaint[]> {
    if (USE_MOCK_DATA) {
      return mockComplaints.filter(
        (c) =>
          c.status === ComplaintStatus.OPEN ||
          c.status === ComplaintStatus.INVESTIGATING
      );
    }
    return [];
  }

  // Dashboard & Analytics
  static async getDashboardStats(): Promise<DashboardStats> {
    if (USE_MOCK_DATA) return mockDashboardStats;
    return {} as DashboardStats;
  }

  static async getSLAPerformanceReport(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    if (USE_MOCK_DATA) {
      return {
        period: { startDate, endDate },
        total: 156,
        compliant: 145,
        breached: 11,
        complianceRate: '92.95',
        byPriority: {
          low: { total: 50, breached: 2 },
          medium: { total: 70, breached: 5 },
          high: { total: 30, breached: 3 },
          critical: { total: 6, breached: 1 },
        },
      };
    }
    return {};
  }

  static async getTechnicianPerformanceReport(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    if (USE_MOCK_DATA) {
      return {
        period: { startDate, endDate },
        totalJobs: 85,
        byTechnician: mockTechnicians.map((t) => ({
          technicianId: t.id,
          technicianName: t.technicianName,
          totalJobs: Math.floor(Math.random() * 20) + 5,
          completed: Math.floor(Math.random() * 18) + 3,
          avgRating: (Math.random() * 1.5 + 3.5).toFixed(2),
          completionRate: (Math.random() * 20 + 80).toFixed(2),
        })),
      };
    }
    return {};
  }

  static async getFirstTimeFixRateReport(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    if (USE_MOCK_DATA) {
      return {
        period: { startDate, endDate },
        totalRequests: 120,
        firstTimeFixes: 102,
        revisits: 18,
        ftfRate: '85.00',
      };
    }
    return {};
  }

  static async getNPSReport(startDate: Date, endDate: Date): Promise<any> {
    if (USE_MOCK_DATA) {
      return {
        period: { startDate, endDate },
        totalResponses: 65,
        promoters: 45,
        passives: 15,
        detractors: 5,
        npsScore: 62,
      };
    }
    return {};
  }

  // Knowledge Base - FAQs (persisted via NestJS)
  static async getKnowledgeFaqs(search?: string): Promise<KnowledgeFaq[]> {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest<KnowledgeFaq[]>(
      `/after-sales-service/knowledge-faqs${qs}`,
    );
  }

  // Knowledge Base - Manuals (persisted via NestJS)
  static async getKnowledgeManuals(search?: string): Promise<KnowledgeManual[]> {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest<KnowledgeManual[]>(
      `/after-sales-service/knowledge-manuals${qs}`,
    );
  }

  // Billing - Payment collections (persisted via NestJS)
  static async getServicePayments(): Promise<ServicePayment[]> {
    return apiRequest<ServicePayment[]>(`/after-sales/billing/payments`);
  }

  // Service Requests (live via NestJS domain backend)
  static async getServiceRequestsLive(filters?: {
    status?: string;
    priority?: string;
    customerId?: string;
    assignedTo?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.customerId) params.set('customerId', filters.customerId);
    if (filters?.assignedTo) params.set('assignedTo', filters.assignedTo);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<any[]>(`/after-sales/service-requests${qs}`);
  }

  // Installations (live via NestJS domain backend)
  static async getInstallationsLive(filters?: {
    status?: string;
    customerId?: string;
    teamLeaderId?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.customerId) params.set('customerId', filters.customerId);
    if (filters?.teamLeaderId) params.set('teamLeaderId', filters.teamLeaderId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<any[]>(`/after-sales/installations${qs}`);
  }
}

export default AfterSalesManagementService;
