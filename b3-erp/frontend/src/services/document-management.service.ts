/**
 * Document Management Service
 * Handles all document management operations including employee documents,
 * compliance documents, HR policies, document repository, and certificate requests
 */

const USE_MOCK_DATA = false;

/**
 * Central fetch wrapper for this service. Always attaches `credentials: 'include'`
 * so the Keycloak JWT cookie rides along and JwtAuthGuard/PermissionsGuard on the
 * NestJS backend can authenticate the request in production.
 */
function docFetch(input: string, init: RequestInit = {}): Promise<Response> {
  return fetch(input, { credentials: 'include', ...init });
}

// ============================================================================
// Enums
// ============================================================================

export enum DocumentCategory {
  PERSONAL = 'personal',
  EDUCATIONAL = 'educational',
  EMPLOYMENT = 'employment',
  FINANCIAL = 'financial',
  MEDICAL = 'medical',
  LEGAL = 'legal',
}

export enum DocumentStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum ComplianceDocumentCategory {
  STATUTORY_FORM = 'statutory_form',
  DECLARATION = 'declaration',
  NOMINATION = 'nomination',
  INSURANCE_FORM = 'insurance_form',
}

export enum PolicyCategory {
  EMPLOYEE_HANDBOOK = 'employee_handbook',
  LEAVE_POLICY = 'leave_policy',
  ATTENDANCE_POLICY = 'attendance_policy',
  EXPENSE_POLICY = 'expense_policy',
  CODE_OF_CONDUCT = 'code_of_conduct',
  OTHER = 'other',
}

export enum PolicyStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum CertificateType {
  EXPERIENCE_CERTIFICATE = 'experience_certificate',
  SALARY_CERTIFICATE = 'salary_certificate',
  EMPLOYMENT_CERTIFICATE = 'employment_certificate',
  SERVICE_CERTIFICATE = 'service_certificate',
  BONAFIDE_CERTIFICATE = 'bonafide_certificate',
}

export enum CertificateRequestStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  GENERATED = 'generated',
  ISSUED = 'issued',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum ComplianceStatus {
  MISSING = 'missing',
  EXPIRED = 'expired',
  EXPIRING_SOON = 'expiring_soon',
  COMPLIANT = 'compliant',
}

// ============================================================================
// Interfaces
// ============================================================================

export interface EmployeeDocument {
  id: string;
  documentNumber: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  documentCategory: DocumentCategory;
  documentType: string;
  documentName: string;
  description?: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  documentDate?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  documentNumber2?: string;
  status: DocumentStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  isMandatory: boolean;
  isVerificationRequired: boolean;
  isConfidential: boolean;
  renewalRequired: boolean;
  renewalStatus?: string;
}

export interface ComplianceDocument {
  id: string;
  documentCode: string;
  documentName: string;
  documentCategory: ComplianceDocumentCategory;
  employeeId?: string;
  employeeName?: string;
  employeeCode?: string;
  formType?: string;
  financialYear?: string;
  effectiveDate?: string;
  expiryDate?: string;
  status: string;
  submittedAt?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  fileName?: string;
  fileUrl?: string;
  isValid: boolean;
}

export interface HRPolicy {
  id: string;
  policyCode: string;
  policyName: string;
  policyCategory: PolicyCategory;
  version: string;
  summary?: string;
  content?: string;
  fileName?: string;
  fileUrl?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status: PolicyStatus;
  publishedAt?: string;
  publishedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  applicableTo: string;
  applicableEntities: string[];
  requiresAcknowledgment: boolean;
  acknowledgmentDeadline?: string;
  acknowledgmentCount?: number;
}

export interface PolicyAcknowledgment {
  id: string;
  policyId: string;
  policyName?: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  status: string;
  acknowledgedAt?: string;
  declinedReason?: string;
}

export interface DocumentRepository {
  id: string;
  documentCode: string;
  documentName: string;
  documentCategory: string;
  folderId?: string;
  folderPath?: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
  description?: string;
  tags: string[];
  keywords: string[];
  version: string;
  accessLevel: string;
  allowedDepartments: string[];
  allowedRoles: string[];
  status: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  lastAccessedAt?: string;
  downloadCount: number;
}

export interface CertificateRequest {
  id: string;
  requestNumber: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department?: string;
  designation?: string;
  certificateType: CertificateType;
  purpose?: string;
  addressTo?: string;
  customContent?: string;
  requestDate: string;
  requiredByDate?: string;
  issuedDate?: string;
  status: CertificateRequestStatus;
  processedBy?: string;
  processedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  documentUrl?: string;
  documentNumber?: string;
  deliveryMethod: string;
  deliveredAt?: string;
}

export interface DocumentComplianceTracking {
  id: string;
  trackingCode: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department?: string;
  documentCategory: string;
  documentType: string;
  documentName: string;
  complianceStatus: ComplianceStatus;
  dueDate?: string;
  expiryDate?: string;
  submittedDate?: string;
  remindersSent: number;
  lastReminderAt?: string;
  nextReminderAt?: string;
  escalatedTo?: string;
  escalatedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface DocumentDashboardStats {
  totalDocuments: number;
  documentsByCategory: Record<string, number>;
  documentsByStatus: Record<string, number>;
  pendingVerifications: number;
  pendingCertificates: number;
  missingDocuments: number;
  expiredDocuments: number;
  expiringDocuments: number;
  publishedPolicies: number;
  pendingAcknowledgments: number;
}

// ============================================================================
// Mock Data
// ============================================================================

const mockEmployeeDocuments: EmployeeDocument[] = [
  { id: '1', documentNumber: 'DOC-000001', employeeId: 'E001', employeeName: 'John Doe', employeeCode: 'EMP001', documentCategory: DocumentCategory.PERSONAL, documentType: 'id_proof', documentName: 'Aadhar Card', fileName: 'aadhar_john.pdf', status: DocumentStatus.VERIFIED, isMandatory: true, isVerificationRequired: true, isConfidential: false, renewalRequired: false, verifiedBy: 'HR Admin', verifiedAt: '2024-01-20' },
  { id: '2', documentNumber: 'DOC-000002', employeeId: 'E001', employeeName: 'John Doe', employeeCode: 'EMP001', documentCategory: DocumentCategory.PERSONAL, documentType: 'pan_card', documentName: 'PAN Card', fileName: 'pan_john.pdf', status: DocumentStatus.VERIFIED, isMandatory: true, isVerificationRequired: true, isConfidential: false, renewalRequired: false, verifiedBy: 'HR Admin', verifiedAt: '2024-01-20' },
  { id: '3', documentNumber: 'DOC-000003', employeeId: 'E001', employeeName: 'John Doe', employeeCode: 'EMP001', documentCategory: DocumentCategory.EDUCATIONAL, documentType: 'degree', documentName: 'B.Tech Degree Certificate', fileName: 'degree_john.pdf', status: DocumentStatus.VERIFIED, isMandatory: true, isVerificationRequired: true, isConfidential: false, renewalRequired: false },
  { id: '4', documentNumber: 'DOC-000004', employeeId: 'E002', employeeName: 'Jane Smith', employeeCode: 'EMP002', documentCategory: DocumentCategory.EMPLOYMENT, documentType: 'experience_letter', documentName: 'Previous Employment Letter', fileName: 'exp_jane.pdf', status: DocumentStatus.PENDING, isMandatory: true, isVerificationRequired: true, isConfidential: false, renewalRequired: false },
  { id: '5', documentNumber: 'DOC-000005', employeeId: 'E003', employeeName: 'Mike Johnson', employeeCode: 'EMP003', documentCategory: DocumentCategory.PERSONAL, documentType: 'passport', documentName: 'Passport', fileName: 'passport_mike.pdf', expiryDate: '2024-12-15', status: DocumentStatus.VERIFIED, isMandatory: false, isVerificationRequired: true, isConfidential: true, renewalRequired: true, renewalStatus: 'expiring_soon' },
];

const mockComplianceDocuments: ComplianceDocument[] = [
  { id: '1', documentCode: 'COMP-000001', documentName: 'Form 12B - Income Tax Declaration', documentCategory: ComplianceDocumentCategory.STATUTORY_FORM, employeeId: 'E001', employeeName: 'John Doe', employeeCode: 'EMP001', formType: 'form_12b', financialYear: '2024-25', effectiveDate: '2024-04-01', status: 'submitted', submittedAt: '2024-04-15', isValid: true },
  { id: '2', documentCode: 'COMP-000002', documentName: 'PF Nomination Form', documentCategory: ComplianceDocumentCategory.NOMINATION, employeeId: 'E001', employeeName: 'John Doe', employeeCode: 'EMP001', formType: 'pf_nomination', effectiveDate: '2024-01-15', status: 'acknowledged', acknowledgedBy: 'HR Manager', acknowledgedAt: '2024-01-20', isValid: true },
  { id: '3', documentCode: 'COMP-000003', documentName: 'Gratuity Nomination', documentCategory: ComplianceDocumentCategory.NOMINATION, employeeId: 'E002', employeeName: 'Jane Smith', employeeCode: 'EMP002', formType: 'gratuity_nomination', status: 'pending', isValid: false },
  { id: '4', documentCode: 'COMP-000004', documentName: 'Group Insurance Declaration', documentCategory: ComplianceDocumentCategory.INSURANCE_FORM, employeeId: 'E001', employeeName: 'John Doe', employeeCode: 'EMP001', formType: 'group_insurance', effectiveDate: '2024-01-01', expiryDate: '2024-12-31', status: 'submitted', isValid: true },
];

const mockPolicies: HRPolicy[] = [
  { id: '1', policyCode: 'POL-00001', policyName: 'Employee Handbook 2024', policyCategory: PolicyCategory.EMPLOYEE_HANDBOOK, version: '2.0', summary: 'Comprehensive guide to company policies and procedures', effectiveFrom: '2024-01-01', status: PolicyStatus.PUBLISHED, publishedAt: '2024-01-01', publishedBy: 'HR Director', applicableTo: 'all', applicableEntities: [], requiresAcknowledgment: true, acknowledgmentDeadline: '2024-02-01', acknowledgmentCount: 145 },
  { id: '2', policyCode: 'POL-00002', policyName: 'Leave Policy', policyCategory: PolicyCategory.LEAVE_POLICY, version: '1.5', summary: 'Guidelines for all types of leaves', effectiveFrom: '2024-01-01', status: PolicyStatus.PUBLISHED, publishedAt: '2024-01-01', applicableTo: 'all', applicableEntities: [], requiresAcknowledgment: true, acknowledgmentCount: 150 },
  { id: '3', policyCode: 'POL-00003', policyName: 'Attendance Policy', policyCategory: PolicyCategory.ATTENDANCE_POLICY, version: '1.2', summary: 'Attendance tracking and regularization guidelines', effectiveFrom: '2024-01-01', status: PolicyStatus.PUBLISHED, applicableTo: 'all', applicableEntities: [], requiresAcknowledgment: true, acknowledgmentCount: 148 },
  { id: '4', policyCode: 'POL-00004', policyName: 'Expense Reimbursement Policy', policyCategory: PolicyCategory.EXPENSE_POLICY, version: '1.0', summary: 'Guidelines for expense claims and reimbursements', effectiveFrom: '2024-04-01', status: PolicyStatus.PUBLISHED, applicableTo: 'all', applicableEntities: [], requiresAcknowledgment: true, acknowledgmentCount: 140 },
  { id: '5', policyCode: 'POL-00005', policyName: 'Code of Conduct', policyCategory: PolicyCategory.CODE_OF_CONDUCT, version: '1.0', summary: 'Expected behavior and ethics guidelines', effectiveFrom: '2024-01-01', status: PolicyStatus.PUBLISHED, applicableTo: 'all', applicableEntities: [], requiresAcknowledgment: true, acknowledgmentCount: 152 },
  { id: '6', policyCode: 'POL-00006', policyName: 'Remote Work Policy', policyCategory: PolicyCategory.OTHER, version: '1.0', summary: 'Guidelines for work from home', effectiveFrom: '2024-06-01', status: PolicyStatus.DRAFT, applicableTo: 'all', applicableEntities: [], requiresAcknowledgment: true },
];

const mockRepositoryDocuments: DocumentRepository[] = [
  { id: '1', documentCode: 'REPO-000001', documentName: 'Leave Application Form', documentCategory: 'hr_forms', fileName: 'leave_application_form.pdf', fileUrl: '/documents/forms/leave_application.pdf', fileSize: 125, fileType: 'pdf', description: 'Standard leave application form template', tags: ['leave', 'form', 'template'], keywords: ['leave', 'application'], version: '1.0', accessLevel: 'company', allowedDepartments: [], allowedRoles: [], status: 'active', uploadedBy: 'HR001', uploadedByName: 'HR Admin', uploadedAt: '2024-01-15', downloadCount: 234 },
  { id: '2', documentCode: 'REPO-000002', documentName: 'Expense Claim Form', documentCategory: 'hr_forms', fileName: 'expense_claim_form.xlsx', fileUrl: '/documents/forms/expense_claim.xlsx', fileSize: 45, fileType: 'xlsx', description: 'Excel template for expense claims', tags: ['expense', 'form', 'template'], keywords: ['expense', 'claim', 'reimbursement'], version: '2.0', accessLevel: 'company', allowedDepartments: [], allowedRoles: [], status: 'active', uploadedBy: 'HR001', uploadedByName: 'HR Admin', uploadedAt: '2024-02-10', downloadCount: 189 },
  { id: '3', documentCode: 'REPO-000003', documentName: 'New Employee Onboarding Guide', documentCategory: 'guidelines', fileName: 'onboarding_guide.pdf', fileUrl: '/documents/guides/onboarding.pdf', fileSize: 2500, fileType: 'pdf', description: 'Complete guide for new employees', tags: ['onboarding', 'new hire', 'guide'], keywords: ['onboarding', 'joining', 'induction'], version: '3.0', accessLevel: 'company', allowedDepartments: [], allowedRoles: [], status: 'active', uploadedBy: 'HR002', uploadedByName: 'HR Manager', uploadedAt: '2024-03-01', downloadCount: 89 },
];

const mockCertificateRequests: CertificateRequest[] = [
  { id: '1', requestNumber: 'CERT-000001', employeeId: 'E004', employeeName: 'Sarah Wilson', employeeCode: 'EMP004', department: 'Marketing', designation: 'Marketing Executive', certificateType: CertificateType.EXPERIENCE_CERTIFICATE, purpose: 'Higher studies abroad', addressTo: 'To Whom It May Concern', requestDate: '2024-11-01', requiredByDate: '2024-11-15', status: CertificateRequestStatus.APPROVED, approvedBy: 'HR Manager', approvedAt: '2024-11-02', deliveryMethod: 'email' },
  { id: '2', requestNumber: 'CERT-000002', employeeId: 'E005', employeeName: 'Tom Brown', employeeCode: 'EMP005', department: 'HR', designation: 'HR Associate', certificateType: CertificateType.SALARY_CERTIFICATE, purpose: 'Bank loan application', requestDate: '2024-10-28', requiredByDate: '2024-11-05', status: CertificateRequestStatus.ISSUED, issuedDate: '2024-10-30', processedBy: 'Payroll Admin', documentUrl: '/certificates/salary_cert_tom.pdf', deliveryMethod: 'both', deliveredAt: '2024-10-30' },
  { id: '3', requestNumber: 'CERT-000003', employeeId: 'E006', employeeName: 'Emily Davis', employeeCode: 'EMP006', department: 'Finance', designation: 'Senior Accountant', certificateType: CertificateType.EMPLOYMENT_CERTIFICATE, purpose: 'Visa application', requestDate: '2024-11-05', status: CertificateRequestStatus.PENDING, deliveryMethod: 'print' },
];

const mockComplianceTracking: DocumentComplianceTracking[] = [
  { id: '1', trackingCode: 'TRK-000001', employeeId: 'E007', employeeName: 'Alex Turner', employeeCode: 'EMP007', department: 'Engineering', documentCategory: 'personal', documentType: 'id_proof', documentName: 'Aadhar Card', complianceStatus: ComplianceStatus.MISSING, dueDate: '2024-11-15', remindersSent: 2, lastReminderAt: '2024-11-05' },
  { id: '2', trackingCode: 'TRK-000002', employeeId: 'E003', employeeName: 'Mike Johnson', employeeCode: 'EMP003', department: 'Management', documentCategory: 'personal', documentType: 'passport', documentName: 'Passport', complianceStatus: ComplianceStatus.EXPIRING_SOON, expiryDate: '2024-12-15', remindersSent: 1, lastReminderAt: '2024-11-01' },
  { id: '3', trackingCode: 'TRK-000003', employeeId: 'E008', employeeName: 'Lisa Chen', employeeCode: 'EMP008', department: 'Sales', documentCategory: 'employment', documentType: 'experience_letter', documentName: 'Previous Experience Letter', complianceStatus: ComplianceStatus.MISSING, dueDate: '2024-10-30', remindersSent: 3, escalatedTo: 'HR Manager', escalatedAt: '2024-11-01' },
  { id: '4', trackingCode: 'TRK-000004', employeeId: 'E009', employeeName: 'David Park', employeeCode: 'EMP009', department: 'Operations', documentCategory: 'medical', documentType: 'medical_certificate', documentName: 'Medical Fitness Certificate', complianceStatus: ComplianceStatus.EXPIRED, expiryDate: '2024-10-01', remindersSent: 4, escalatedTo: 'Department Head' },
];

// ============================================================================
// Service Class
// ============================================================================

export class DocumentManagementService {
  // Employee Documents
  static async getEmployeeDocuments(options?: {
    employeeId?: string;
    documentCategory?: DocumentCategory;
    documentType?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: EmployeeDocument[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockEmployeeDocuments];
      if (options?.employeeId) {
        filtered = filtered.filter(d => d.employeeId === options.employeeId);
      }
      if (options?.documentCategory) {
        filtered = filtered.filter(d => d.documentCategory === options.documentCategory);
      }
      if (options?.status) {
        filtered = filtered.filter(d => d.status === options.status);
      }
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (options?.employeeId) params.append('employeeId', options.employeeId);
    if (options?.documentCategory) params.append('documentCategory', options.documentCategory);
    if (options?.status) params.append('status', options.status);
    const response = await docFetch(`/api/hr/employee-documents?${params.toString()}`);
    return response.json();
  }

  static async getEmployeeDocumentById(id: string): Promise<EmployeeDocument> {
    if (USE_MOCK_DATA) {
      const doc = mockEmployeeDocuments.find(d => d.id === id);
      if (!doc) throw new Error('Document not found');
      return doc;
    }
    const response = await docFetch(`/api/hr/employee-documents/${id}`);
    return response.json();
  }

  static async createEmployeeDocument(data: Partial<EmployeeDocument>): Promise<EmployeeDocument> {
    if (USE_MOCK_DATA) {
      const newDoc: EmployeeDocument = {
        id: String(mockEmployeeDocuments.length + 1),
        documentNumber: `DOC-${String(mockEmployeeDocuments.length + 1).padStart(6, '0')}`,
        employeeId: data.employeeId || 'E001',
        employeeName: data.employeeName || 'Employee',
        employeeCode: data.employeeCode || 'EMP001',
        documentCategory: data.documentCategory || DocumentCategory.PERSONAL,
        documentType: data.documentType || 'other',
        documentName: data.documentName || 'Document',
        status: DocumentStatus.PENDING,
        isMandatory: data.isMandatory || false,
        isVerificationRequired: data.isVerificationRequired || false,
        isConfidential: data.isConfidential || false,
        renewalRequired: data.renewalRequired || false,
        ...data,
      } as EmployeeDocument;
      mockEmployeeDocuments.push(newDoc);
      return newDoc;
    }
    const response = await docFetch('/api/hr/employee-documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async verifyDocument(id: string, verifiedBy: string, remarks?: string): Promise<EmployeeDocument> {
    if (USE_MOCK_DATA) {
      const doc = mockEmployeeDocuments.find(d => d.id === id);
      if (doc) {
        doc.status = DocumentStatus.VERIFIED;
        doc.verifiedBy = verifiedBy;
        doc.verifiedAt = new Date().toISOString().split('T')[0];
      }
      return doc!;
    }
    const response = await docFetch(`/api/hr/employee-documents/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verifiedBy, remarks }),
    });
    return response.json();
  }

  static async rejectDocument(id: string, rejectedBy: string, reason: string): Promise<EmployeeDocument> {
    if (USE_MOCK_DATA) {
      const doc = mockEmployeeDocuments.find(d => d.id === id);
      if (doc) {
        doc.status = DocumentStatus.REJECTED;
        doc.verifiedBy = rejectedBy;
        doc.rejectionReason = reason;
      }
      return doc!;
    }
    const response = await docFetch(`/api/hr/employee-documents/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejectedBy, reason }),
    });
    return response.json();
  }

  // Compliance Documents
  static async getComplianceDocuments(options?: {
    documentCategory?: ComplianceDocumentCategory;
    employeeId?: string;
    formType?: string;
    financialYear?: string;
    status?: string;
  }): Promise<{ data: ComplianceDocument[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockComplianceDocuments];
      if (options?.documentCategory) {
        filtered = filtered.filter(d => d.documentCategory === options.documentCategory);
      }
      if (options?.employeeId) {
        filtered = filtered.filter(d => d.employeeId === options.employeeId);
      }
      if (options?.status) {
        filtered = filtered.filter(d => d.status === options.status);
      }
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (options?.documentCategory) params.append('documentCategory', options.documentCategory);
    if (options?.employeeId) params.append('employeeId', options.employeeId);
    if (options?.formType) params.append('formType', options.formType);
    if (options?.financialYear) params.append('financialYear', options.financialYear);
    if (options?.status) params.append('status', options.status);
    const response = await docFetch(`/api/hr/compliance-documents?${params.toString()}`);
    return response.json();
  }

  static async createComplianceDocument(data: Partial<ComplianceDocument>): Promise<ComplianceDocument> {
    if (USE_MOCK_DATA) {
      const newDoc: ComplianceDocument = {
        id: String(mockComplianceDocuments.length + 1),
        documentCode: `COMP-${String(mockComplianceDocuments.length + 1).padStart(6, '0')}`,
        documentName: data.documentName || 'Compliance Document',
        documentCategory: data.documentCategory || ComplianceDocumentCategory.STATUTORY_FORM,
        status: 'pending',
        isValid: false,
        ...data,
      } as ComplianceDocument;
      mockComplianceDocuments.push(newDoc);
      return newDoc;
    }
    const response = await docFetch('/api/hr/compliance-documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async acknowledgeComplianceDocument(id: string, acknowledgedBy: string): Promise<ComplianceDocument> {
    if (USE_MOCK_DATA) {
      const doc = mockComplianceDocuments.find(d => d.id === id);
      if (doc) {
        doc.status = 'acknowledged';
        doc.acknowledgedBy = acknowledgedBy;
        doc.acknowledgedAt = new Date().toISOString().split('T')[0];
      }
      return doc!;
    }
    const response = await docFetch(`/api/hr/compliance-documents/${id}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acknowledgedBy }),
    });
    return response.json();
  }

  // HR Policies
  static async getHRPolicies(options?: {
    policyCategory?: PolicyCategory;
    status?: PolicyStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: HRPolicy[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockPolicies];
      if (options?.policyCategory) {
        filtered = filtered.filter(p => p.policyCategory === options.policyCategory);
      }
      if (options?.status) {
        filtered = filtered.filter(p => p.status === options.status);
      }
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (options?.policyCategory) params.append('policyCategory', options.policyCategory);
    if (options?.status) params.append('status', options.status);
    const response = await docFetch(`/api/hr/policies?${params.toString()}`);
    return response.json();
  }

  static async getHRPolicyById(id: string): Promise<HRPolicy> {
    if (USE_MOCK_DATA) {
      const policy = mockPolicies.find(p => p.id === id);
      if (!policy) throw new Error('Policy not found');
      return policy;
    }
    const response = await docFetch(`/api/hr/policies/${id}`);
    return response.json();
  }

  static async createHRPolicy(data: Partial<HRPolicy>): Promise<HRPolicy> {
    if (USE_MOCK_DATA) {
      const newPolicy: HRPolicy = {
        id: String(mockPolicies.length + 1),
        policyCode: `POL-${String(mockPolicies.length + 1).padStart(5, '0')}`,
        policyName: data.policyName || 'New Policy',
        policyCategory: data.policyCategory || PolicyCategory.OTHER,
        version: data.version || '1.0',
        effectiveFrom: data.effectiveFrom || new Date().toISOString().split('T')[0],
        status: PolicyStatus.DRAFT,
        applicableTo: data.applicableTo || 'all',
        applicableEntities: data.applicableEntities || [],
        requiresAcknowledgment: data.requiresAcknowledgment || false,
        ...data,
      } as HRPolicy;
      mockPolicies.push(newPolicy);
      return newPolicy;
    }
    const response = await docFetch('/api/hr/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async publishPolicy(id: string, publishedBy: string): Promise<HRPolicy> {
    if (USE_MOCK_DATA) {
      const policy = mockPolicies.find(p => p.id === id);
      if (policy) {
        policy.status = PolicyStatus.PUBLISHED;
        policy.publishedBy = publishedBy;
        policy.publishedAt = new Date().toISOString().split('T')[0];
      }
      return policy!;
    }
    const response = await docFetch(`/api/hr/policies/${id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publishedBy }),
    });
    return response.json();
  }

  static async acknowledgePolicy(policyId: string, data: {
    employeeId: string;
    employeeName: string;
    employeeCode: string;
  }): Promise<PolicyAcknowledgment> {
    if (USE_MOCK_DATA) {
      return {
        id: '1',
        policyId,
        ...data,
        status: 'acknowledged',
        acknowledgedAt: new Date().toISOString().split('T')[0],
      };
    }
    const response = await docFetch(`/api/hr/policies/${policyId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async getPendingAcknowledgments(employeeId?: string): Promise<HRPolicy[]> {
    if (USE_MOCK_DATA) {
      return mockPolicies.filter(p => p.status === PolicyStatus.PUBLISHED && p.requiresAcknowledgment);
    }
    const params = employeeId ? `?employeeId=${employeeId}` : '';
    const response = await docFetch(`/api/hr/policies/pending-acknowledgments${params}`);
    return response.json();
  }

  // Document Repository
  static async getRepositoryDocuments(options?: {
    documentCategory?: string;
    folderId?: string;
    tags?: string[];
    accessLevel?: string;
    status?: string;
    searchQuery?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: DocumentRepository[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockRepositoryDocuments];
      if (options?.documentCategory) {
        filtered = filtered.filter(d => d.documentCategory === options.documentCategory);
      }
      if (options?.searchQuery) {
        const query = options.searchQuery.toLowerCase();
        filtered = filtered.filter(d =>
          d.documentName.toLowerCase().includes(query) ||
          d.description?.toLowerCase().includes(query) ||
          d.tags.some(t => t.toLowerCase().includes(query))
        );
      }
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (options?.documentCategory) params.append('documentCategory', options.documentCategory);
    if (options?.searchQuery) params.append('searchQuery', options.searchQuery);
    if (options?.accessLevel) params.append('accessLevel', options.accessLevel);
    const response = await docFetch(`/api/hr/document-repository?${params.toString()}`);
    return response.json();
  }

  static async searchDocuments(query: string): Promise<{ data: DocumentRepository[]; total: number }> {
    return this.getRepositoryDocuments({ searchQuery: query });
  }

  static async uploadDocument(data: Partial<DocumentRepository>): Promise<DocumentRepository> {
    if (USE_MOCK_DATA) {
      const newDoc: DocumentRepository = {
        id: String(mockRepositoryDocuments.length + 1),
        documentCode: `REPO-${String(mockRepositoryDocuments.length + 1).padStart(6, '0')}`,
        documentName: data.documentName || 'New Document',
        documentCategory: data.documentCategory || 'other',
        fileName: data.fileName || 'document.pdf',
        fileUrl: data.fileUrl || '/documents/new.pdf',
        tags: data.tags || [],
        keywords: data.keywords || [],
        version: data.version || '1.0',
        accessLevel: data.accessLevel || 'company',
        allowedDepartments: data.allowedDepartments || [],
        allowedRoles: data.allowedRoles || [],
        status: 'active',
        uploadedBy: data.uploadedBy || 'USER001',
        uploadedByName: data.uploadedByName || 'User',
        uploadedAt: new Date().toISOString().split('T')[0],
        downloadCount: 0,
        ...data,
      } as DocumentRepository;
      mockRepositoryDocuments.push(newDoc);
      return newDoc;
    }
    const response = await docFetch('/api/hr/document-repository', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async downloadDocument(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      const doc = mockRepositoryDocuments.find(d => d.id === id);
      if (doc) doc.downloadCount++;
      return;
    }
    await docFetch(`/api/hr/document-repository/${id}/download`, { method: 'POST' });
  }

  // Certificate Requests
  static async getCertificateRequests(options?: {
    employeeId?: string;
    certificateType?: CertificateType;
    status?: CertificateRequestStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: CertificateRequest[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockCertificateRequests];
      if (options?.employeeId) {
        filtered = filtered.filter(r => r.employeeId === options.employeeId);
      }
      if (options?.certificateType) {
        filtered = filtered.filter(r => r.certificateType === options.certificateType);
      }
      if (options?.status) {
        filtered = filtered.filter(r => r.status === options.status);
      }
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (options?.employeeId) params.append('employeeId', options.employeeId);
    if (options?.certificateType) params.append('certificateType', options.certificateType);
    if (options?.status) params.append('status', options.status);
    const response = await docFetch(`/api/hr/certificate-requests?${params.toString()}`);
    return response.json();
  }

  static async createCertificateRequest(data: Partial<CertificateRequest>): Promise<CertificateRequest> {
    if (USE_MOCK_DATA) {
      const newRequest: CertificateRequest = {
        id: String(mockCertificateRequests.length + 1),
        requestNumber: `CERT-${String(mockCertificateRequests.length + 1).padStart(6, '0')}`,
        employeeId: data.employeeId || 'E001',
        employeeName: data.employeeName || 'Employee',
        employeeCode: data.employeeCode || 'EMP001',
        certificateType: data.certificateType || CertificateType.EXPERIENCE_CERTIFICATE,
        requestDate: new Date().toISOString().split('T')[0],
        status: CertificateRequestStatus.PENDING,
        deliveryMethod: data.deliveryMethod || 'email',
        ...data,
      } as CertificateRequest;
      mockCertificateRequests.push(newRequest);
      return newRequest;
    }
    const response = await docFetch('/api/hr/certificate-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async approveCertificateRequest(id: string, approvedBy: string): Promise<CertificateRequest> {
    if (USE_MOCK_DATA) {
      const request = mockCertificateRequests.find(r => r.id === id);
      if (request) {
        request.status = CertificateRequestStatus.APPROVED;
        request.approvedBy = approvedBy;
        request.approvedAt = new Date().toISOString().split('T')[0];
      }
      return request!;
    }
    const response = await docFetch(`/api/hr/certificate-requests/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy }),
    });
    return response.json();
  }

  static async rejectCertificateRequest(id: string, rejectedBy: string, reason: string): Promise<CertificateRequest> {
    if (USE_MOCK_DATA) {
      const request = mockCertificateRequests.find(r => r.id === id);
      if (request) {
        request.status = CertificateRequestStatus.REJECTED;
        request.processedBy = rejectedBy;
        request.rejectionReason = reason;
      }
      return request!;
    }
    const response = await docFetch(`/api/hr/certificate-requests/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejectedBy, reason }),
    });
    return response.json();
  }

  static async issueCertificate(id: string): Promise<CertificateRequest> {
    if (USE_MOCK_DATA) {
      const request = mockCertificateRequests.find(r => r.id === id);
      if (request) {
        request.status = CertificateRequestStatus.ISSUED;
        request.issuedDate = new Date().toISOString().split('T')[0];
        request.deliveredAt = new Date().toISOString().split('T')[0];
      }
      return request!;
    }
    const response = await docFetch(`/api/hr/certificate-requests/${id}/issue`, {
      method: 'POST',
    });
    return response.json();
  }

  // Compliance Tracking
  static async getComplianceTracking(options?: {
    employeeId?: string;
    complianceStatus?: ComplianceStatus;
    documentCategory?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: DocumentComplianceTracking[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockComplianceTracking];
      if (options?.employeeId) {
        filtered = filtered.filter(t => t.employeeId === options.employeeId);
      }
      if (options?.complianceStatus) {
        filtered = filtered.filter(t => t.complianceStatus === options.complianceStatus);
      }
      if (options?.documentCategory) {
        filtered = filtered.filter(t => t.documentCategory === options.documentCategory);
      }
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (options?.employeeId) params.append('employeeId', options.employeeId);
    if (options?.complianceStatus) params.append('complianceStatus', options.complianceStatus);
    if (options?.documentCategory) params.append('documentCategory', options.documentCategory);
    const response = await docFetch(`/api/hr/document-compliance?${params.toString()}`);
    return response.json();
  }

  static async getMissingDocuments(): Promise<DocumentComplianceTracking[]> {
    if (USE_MOCK_DATA) {
      return mockComplianceTracking.filter(t => t.complianceStatus === ComplianceStatus.MISSING);
    }
    const response = await docFetch('/api/hr/document-compliance/missing');
    return response.json();
  }

  static async getExpiredDocuments(): Promise<DocumentComplianceTracking[]> {
    if (USE_MOCK_DATA) {
      return mockComplianceTracking.filter(t => t.complianceStatus === ComplianceStatus.EXPIRED);
    }
    const response = await docFetch('/api/hr/document-compliance/expired');
    return response.json();
  }

  static async getExpiringDocuments(withinDays: number = 30): Promise<DocumentComplianceTracking[]> {
    if (USE_MOCK_DATA) {
      return mockComplianceTracking.filter(t => t.complianceStatus === ComplianceStatus.EXPIRING_SOON);
    }
    const response = await docFetch(`/api/hr/document-compliance/expiring?withinDays=${withinDays}`);
    return response.json();
  }

  static async sendComplianceReminder(id: string): Promise<DocumentComplianceTracking> {
    if (USE_MOCK_DATA) {
      const tracking = mockComplianceTracking.find(t => t.id === id);
      if (tracking) {
        tracking.remindersSent++;
        tracking.lastReminderAt = new Date().toISOString().split('T')[0];
      }
      return tracking!;
    }
    const response = await docFetch(`/api/hr/document-compliance/${id}/remind`, {
      method: 'POST',
    });
    return response.json();
  }

  static async resolveComplianceIssue(id: string, resolvedBy: string, notes?: string): Promise<DocumentComplianceTracking> {
    if (USE_MOCK_DATA) {
      const tracking = mockComplianceTracking.find(t => t.id === id);
      if (tracking) {
        tracking.complianceStatus = ComplianceStatus.COMPLIANT;
        tracking.resolvedBy = resolvedBy;
        tracking.resolvedAt = new Date().toISOString().split('T')[0];
      }
      return tracking!;
    }
    const response = await docFetch(`/api/hr/document-compliance/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolvedBy, notes }),
    });
    return response.json();
  }

  // Dashboard
  static async getDashboard(): Promise<DocumentDashboardStats> {
    if (USE_MOCK_DATA) {
      return {
        totalDocuments: mockEmployeeDocuments.length,
        documentsByCategory: {
          personal: mockEmployeeDocuments.filter(d => d.documentCategory === DocumentCategory.PERSONAL).length,
          educational: mockEmployeeDocuments.filter(d => d.documentCategory === DocumentCategory.EDUCATIONAL).length,
          employment: mockEmployeeDocuments.filter(d => d.documentCategory === DocumentCategory.EMPLOYMENT).length,
        },
        documentsByStatus: {
          pending: mockEmployeeDocuments.filter(d => d.status === DocumentStatus.PENDING).length,
          verified: mockEmployeeDocuments.filter(d => d.status === DocumentStatus.VERIFIED).length,
          rejected: mockEmployeeDocuments.filter(d => d.status === DocumentStatus.REJECTED).length,
        },
        pendingVerifications: mockEmployeeDocuments.filter(d => d.status === DocumentStatus.PENDING).length,
        pendingCertificates: mockCertificateRequests.filter(r => r.status === CertificateRequestStatus.PENDING || r.status === CertificateRequestStatus.APPROVED).length,
        missingDocuments: mockComplianceTracking.filter(t => t.complianceStatus === ComplianceStatus.MISSING).length,
        expiredDocuments: mockComplianceTracking.filter(t => t.complianceStatus === ComplianceStatus.EXPIRED).length,
        expiringDocuments: mockComplianceTracking.filter(t => t.complianceStatus === ComplianceStatus.EXPIRING_SOON).length,
        publishedPolicies: mockPolicies.filter(p => p.status === PolicyStatus.PUBLISHED).length,
        pendingAcknowledgments: 5,
      };
    }
    const response = await docFetch('/api/hr/document-management/dashboard');
    return response.json();
  }

  // Employee Document Summary
  static async getEmployeeDocumentsSummary(employeeId: string): Promise<{
    documents: EmployeeDocument[];
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    pendingVerification: number;
    expiringDocuments: number;
  }> {
    if (USE_MOCK_DATA) {
      const docs = mockEmployeeDocuments.filter(d => d.employeeId === employeeId);
      return {
        documents: docs,
        byCategory: {
          personal: docs.filter(d => d.documentCategory === DocumentCategory.PERSONAL).length,
          educational: docs.filter(d => d.documentCategory === DocumentCategory.EDUCATIONAL).length,
          employment: docs.filter(d => d.documentCategory === DocumentCategory.EMPLOYMENT).length,
        },
        byStatus: {
          pending: docs.filter(d => d.status === DocumentStatus.PENDING).length,
          verified: docs.filter(d => d.status === DocumentStatus.VERIFIED).length,
        },
        pendingVerification: docs.filter(d => d.status === DocumentStatus.PENDING).length,
        expiringDocuments: docs.filter(d => d.renewalStatus === 'expiring_soon').length,
      };
    }
    const response = await docFetch(`/api/hr/employees/${employeeId}/documents/summary`);
    return response.json();
  }
}
