// HR Safety Service
// Wires the orphan (previously mock-only) pages under /hr/safety/* to the
// NestJS domain backend. Plain fetch, mirrors hr-compliance-docs.service.ts.
// Shared discriminator tables: recordType groups related pages.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', 'x-company-id': 'test' },
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

export interface SafetyIncident {
  id: string;
  companyId: string;
  incidentNumber?: string;
  reportedDate?: string;
  incidentDate?: string;
  incidentTime?: string;
  location?: string;
  department?: string;
  severity?: string;
  type?: string;
  description?: string;
  reportedBy?: string;
  employeeInvolved?: string;
  witnessCount?: number;
  status?: string;
  investigator?: string;
  rootCause?: string;
  daysLost?: number;
  medicalAttention?: boolean;
  meta?: any;
}

export interface SafetyHazard {
  id: string;
  companyId: string;
  recordType?: string;
  code?: string;
  title?: string;
  category?: string;
  location?: string;
  department?: string;
  identifiedBy?: string;
  date?: string;
  severity?: string;
  likelihood?: string;
  riskLevel?: string;
  riskScore?: number;
  owner?: string;
  controlMeasures?: string;
  status?: string;
  remarks?: string;
  meta?: any;
}

export interface SafetyInspection {
  id: string;
  companyId: string;
  recordType?: string;
  code?: string;
  title?: string;
  auditType?: string;
  area?: string;
  department?: string;
  auditor?: string;
  scheduledDate?: string;
  completedDate?: string;
  frequency?: string;
  severity?: string;
  priority?: string;
  assignedTo?: string;
  dueDate?: string;
  score?: number;
  findingsCount?: number;
  description?: string;
  status?: string;
  remarks?: string;
  meta?: any;
}

export interface SafetyPpe {
  id: string;
  companyId: string;
  recordType?: string;
  itemCode?: string;
  itemName?: string;
  category?: string;
  size?: string;
  quantity?: number;
  inStock?: number;
  reorderLevel?: number;
  employeeId?: string;
  employeeName?: string;
  department?: string;
  issuedDate?: string;
  expiryDate?: string;
  nextReplacement?: string;
  condition?: string;
  supplier?: string;
  status?: string;
  remarks?: string;
  meta?: any;
}

export interface SafetyDrill {
  id: string;
  companyId: string;
  recordType?: string;
  code?: string;
  name?: string;
  drillType?: string;
  location?: string;
  department?: string;
  conductedDate?: string;
  scheduledDate?: string;
  participants?: number;
  duration?: string;
  coordinator?: string;
  contactName?: string;
  role?: string;
  phone?: string;
  serviceType?: string;
  effectiveness?: string;
  description?: string;
  status?: string;
  remarks?: string;
  meta?: any;
}

export interface SafetyTraining {
  id: string;
  companyId: string;
  recordType?: string;
  code?: string;
  title?: string;
  category?: string;
  trainer?: string;
  department?: string;
  scheduledDate?: string;
  completedDate?: string;
  participants?: number;
  duration?: string;
  memberName?: string;
  role?: string;
  version?: string;
  effectiveDate?: string;
  reviewDate?: string;
  owner?: string;
  compliancePercent?: number;
  description?: string;
  status?: string;
  remarks?: string;
  meta?: any;
}

export interface SafetyWellness {
  id: string;
  companyId: string;
  recordType?: string;
  code?: string;
  title?: string;
  category?: string;
  employeeId?: string;
  employeeName?: string;
  department?: string;
  scheduledDate?: string;
  completedDate?: string;
  provider?: string;
  result?: string;
  riskLevel?: string;
  participants?: number;
  score?: number;
  exposureType?: string;
  nextDue?: string;
  description?: string;
  status?: string;
  remarks?: string;
  meta?: any;
}

export interface SafetyReport {
  id: string;
  companyId: string;
  recordType?: string;
  metricKey?: string;
  label?: string;
  category?: string;
  period?: string;
  department?: string;
  value?: number;
  target?: number;
  unit?: string;
  trend?: string;
  framework?: string;
  dueDate?: string;
  severity?: string;
  description?: string;
  status?: string;
  remarks?: string;
  meta?: any;
}

export class HrSafetyService {
  static async getIncidents(
    status?: string,
    companyId = 'company-1',
  ): Promise<SafetyIncident[]> {
    const data = await getJson<SafetyIncident[]>(
      `/hr/safety-incidents?${qs(companyId, { status })}`,
    );
    return Array.isArray(data) ? data : [];
  }

  static async getHazards(
    recordType?: string,
    companyId = 'company-1',
  ): Promise<SafetyHazard[]> {
    const data = await getJson<SafetyHazard[]>(
      `/hr/safety-hazards?${qs(companyId, { recordType })}`,
    );
    return Array.isArray(data) ? data : [];
  }

  static async getInspections(
    recordType?: string,
    companyId = 'company-1',
  ): Promise<SafetyInspection[]> {
    const data = await getJson<SafetyInspection[]>(
      `/hr/safety-inspections?${qs(companyId, { recordType })}`,
    );
    return Array.isArray(data) ? data : [];
  }

  static async getPpe(
    recordType?: string,
    companyId = 'company-1',
  ): Promise<SafetyPpe[]> {
    const data = await getJson<SafetyPpe[]>(
      `/hr/safety-ppe?${qs(companyId, { recordType })}`,
    );
    return Array.isArray(data) ? data : [];
  }

  static async getDrills(
    recordType?: string,
    companyId = 'company-1',
  ): Promise<SafetyDrill[]> {
    const data = await getJson<SafetyDrill[]>(
      `/hr/safety-drills?${qs(companyId, { recordType })}`,
    );
    return Array.isArray(data) ? data : [];
  }

  static async getTrainings(
    recordType?: string,
    companyId = 'company-1',
  ): Promise<SafetyTraining[]> {
    const data = await getJson<SafetyTraining[]>(
      `/hr/safety-trainings?${qs(companyId, { recordType })}`,
    );
    return Array.isArray(data) ? data : [];
  }

  static async getWellness(
    recordType?: string,
    companyId = 'company-1',
  ): Promise<SafetyWellness[]> {
    const data = await getJson<SafetyWellness[]>(
      `/hr/safety-wellness?${qs(companyId, { recordType })}`,
    );
    return Array.isArray(data) ? data : [];
  }

  static async getReports(
    recordType?: string,
    companyId = 'company-1',
  ): Promise<SafetyReport[]> {
    const data = await getJson<SafetyReport[]>(
      `/hr/safety-reports?${qs(companyId, { recordType })}`,
    );
    return Array.isArray(data) ? data : [];
  }
}
