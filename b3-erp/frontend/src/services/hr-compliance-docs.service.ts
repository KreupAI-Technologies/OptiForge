// HR Compliance & Documents Service
// Wires the orphan (previously mock-only) pages under /hr/compliance/* and
// /hr/documents/* to the NestJS domain backend. Plain fetch, mirrors the
// pattern used by hr-shifts.service.ts.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

const qs = (companyId: string, extra?: Record<string, string | undefined>) => {
  const params = new URLSearchParams({ companyId });
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v) params.set(k, v);
    }
  }
  return params.toString();
};

export interface ComplianceLicense {
  id: string;
  companyId: string;
  recordType?: string;
  name?: string;
  number?: string;
  authority?: string;
  category?: string;
  status?: string;
  location?: string;
  applicableTo?: string;
  issueDate?: string;
  expiryDate?: string;
  renewalFrequency?: string;
  lastRenewalDate?: string;
  contactPerson?: string;
  validUntil?: string;
  relatedLicense?: string;
  documentUrl?: string;
  verifiedBy?: string;
  verificationDate?: string;
  renewalDueDate?: string;
  priority?: string;
  assignedTo?: string;
  renewalCost?: number;
  documentsRequired?: string[];
  submissionDeadline?: string;
  applicationNumber?: string;
  newExpiryDate?: string;
  remarks?: string;
}

export interface ComplianceReturn {
  id: string;
  companyId: string;
  returnType?: string;
  returnMonth?: string;
  returnPeriod?: string;
  quarter?: string;
  financialYear?: string;
  establishment?: string;
  state?: string;
  branch?: string;
  registrationNumber?: string;
  formType?: string;
  dueDate?: string;
  filingDate?: string;
  status?: string;
  totalEmployees?: number;
  coveredEmployees?: number;
  totalDeductees?: number;
  grossWages?: number;
  grossSalary?: number;
  employeeContribution?: number;
  employerContribution?: number;
  totalContribution?: number;
  totalDeducted?: number;
  totalPaid?: number;
  challanNumber?: string;
  challanDate?: string;
  acknowledgmentNumber?: string;
  challanDetails?: any;
  remarks?: string;
}

export interface DisciplinaryAction {
  id: string;
  companyId: string;
  employeeId?: string;
  employeeName?: string;
  department?: string;
  designation?: string;
  actionType?: string;
  violationCategory?: string;
  incidentDate?: string;
  actionDate?: string;
  issuedBy?: string;
  severity?: string;
  description?: string;
  justification?: string;
  witnessList?: string[];
  evidenceDocuments?: string[];
  employeeStatement?: string;
  suspensionDuration?: string;
  suspensionStartDate?: string;
  suspensionEndDate?: string;
  isPaid?: boolean;
  appealStatus?: string;
  appealDeadline?: string;
  appealFiledDate?: string;
  appealReviewedBy?: string;
  appealOutcome?: string;
  status?: string;
  effectiveUntil?: string;
  remarks?: string;
}

export interface PolicyViolation {
  id: string;
  companyId: string;
  employeeId?: string;
  employeeName?: string;
  department?: string;
  designation?: string;
  policyName?: string;
  violationType?: string;
  category?: string;
  severity?: string;
  violationDate?: string;
  reportedDate?: string;
  reportedBy?: string;
  description?: string;
  actionTaken?: string;
  status?: string;
  remarks?: string;
  meta?: any;
}

export interface ComplianceRegister {
  id: string;
  companyId: string;
  entryType?: string;
  registerName?: string;
  act?: string;
  formNumber?: string;
  requirement?: string;
  applicability?: string;
  frequency?: string;
  responsibility?: string;
  lastUpdated?: string;
  lastCompleted?: string;
  nextDue?: string;
  status?: string;
  totalEntries?: number;
  format?: string;
  retentionPeriod?: string;
  documents?: string[];
  penalties?: string;
}

export interface ComplianceAudit {
  id: string;
  companyId: string;
  auditId?: string;
  title?: string;
  auditType?: string;
  scope?: string[];
  auditor?: string;
  scheduledDate?: string;
  completedDate?: string;
  status?: string;
  findings?: number;
  criticalFindings?: number;
  complianceScore?: number;
  nextAuditDue?: string;
}

export interface HrGrievance {
  id: string;
  companyId: string;
  caseType?: string;
  caseNumber?: string;
  filedDate?: string;
  employeeId?: string;
  employeeName?: string;
  department?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
  targetResolutionDate?: string;
  actualResolutionDate?: string;
  resolutionDetails?: string;
  employeeSatisfaction?: string;
  isAnonymous?: boolean;
  witnesses?: string[];
  evidenceProvided?: boolean;
  complainantDetails?: string;
  respondentName?: string;
  respondentDesignation?: string;
  respondentDepartment?: string;
  incidentDate?: string;
  incidentLocation?: string;
  severity?: string;
  icAssigned?: string;
  targetCompletionDate?: string;
  actualCompletionDate?: string;
  actionTaken?: string;
  confidential?: boolean;
  remarks?: string;
}

export interface HrDocument {
  id: string;
  companyId: string;
  docCategory?: string;
  documentType?: string;
  documentNumber?: string;
  title?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  uploadedOn?: string;
  uploadedBy?: string;
  status?: string;
  fileName?: string;
  fileSize?: string;
  verifiedBy?: string;
  verifiedOn?: string;
  remarks?: string;
  meta?: any;
}

export interface CertificateRequest { id: string; companyId: string; recordType?: string; requestDate?: string; purpose?: string; addressedTo?: string; period?: string; includeBreakup?: boolean; includeDetails?: string; deliveryMode?: string; status?: string; requestedBy?: string; approvedBy?: string; approvedOn?: string; generatedOn?: string; deliveredOn?: string; rejectedReason?: string; remarks?: string; }
export interface DocumentAuditLog { id: string; companyId: string; timestamp?: string; action?: string; documentType?: string; documentId?: string; employeeId?: string; employeeName?: string; performedBy?: string; performedByRole?: string; ipAddress?: string; remarks?: string; }

export class HrComplianceDocsService {
  static async getLicenses(
    recordType?: string,
    companyId = 'company-1',
  ): Promise<ComplianceLicense[]> {
    const data = await getJson<ComplianceLicense[]>(
      `/hr/compliance-licenses?${qs(companyId, { recordType })}`,
    );
    return Array.isArray(data) ? data : [];
  }

  static async getReturns(
    returnType?: string,
    companyId = 'company-1',
  ): Promise<ComplianceReturn[]> {
    const data = await getJson<ComplianceReturn[]>(
      `/hr/compliance-returns?${qs(companyId, { returnType })}`,
    );
    return Array.isArray(data) ? data : [];
  }

  static async getDisciplinaryActions(
    companyId = 'company-1',
  ): Promise<DisciplinaryAction[]> {
    const data = await getJson<DisciplinaryAction[]>(
      `/hr/disciplinary-actions?${qs(companyId)}`,
    );
    return Array.isArray(data) ? data : [];
  }

  static async getPolicyViolations(
    companyId = 'company-1',
  ): Promise<PolicyViolation[]> {
    const data = await getJson<PolicyViolation[]>(
      `/hr/policy-violations?${qs(companyId)}`,
    );
    return Array.isArray(data) ? data : [];
  }

  static async getRegisters(
    entryType?: string,
    companyId = 'company-1',
  ): Promise<ComplianceRegister[]> {
    const data = await getJson<ComplianceRegister[]>(
      `/hr/compliance-registers?${qs(companyId, { entryType })}`,
    );
    return Array.isArray(data) ? data : [];
  }

  static async getAudits(companyId = 'company-1'): Promise<ComplianceAudit[]> {
    const data = await getJson<ComplianceAudit[]>(
      `/hr/compliance-audits?${qs(companyId)}`,
    );
    return Array.isArray(data) ? data : [];
  }

  static async getGrievances(
    caseType?: string,
    companyId = 'company-1',
  ): Promise<HrGrievance[]> {
    const data = await getJson<HrGrievance[]>(
      `/hr/grievances?${qs(companyId, { caseType })}`,
    );
    return Array.isArray(data) ? data : [];
  }

  static async getDocuments(
    docCategory?: string,
    companyId = 'company-1',
  ): Promise<HrDocument[]> {
    const data = await getJson<HrDocument[]>(
      `/hr/documents?${qs(companyId, { docCategory })}`,
    );
    return Array.isArray(data) ? data : [];
  }

  static async getCertificateRequests(recordType?: string, companyId = 'company-1'): Promise<CertificateRequest[]> {
    const data = await getJson<CertificateRequest[]>(`/hr/certificate-requests?${qs(companyId, { recordType })}`);
    return Array.isArray(data) ? data : [];
  }

  static async getDocumentAuditLogs(action?: string, companyId = 'company-1'): Promise<DocumentAuditLog[]> {
    const data = await getJson<DocumentAuditLog[]>(`/hr/document-audit-logs?${qs(companyId, { action })}`);
    return Array.isArray(data) ? data : [];
  }
}
