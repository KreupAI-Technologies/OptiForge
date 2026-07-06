/**
 * Compliance Service
 * Data-subject requests (GDPR) + regulatory reports, backed by the NestJS
 * `compliance` module (b3-erp/backend/src/modules/compliance).
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const DEFAULT_COMPANY = 'default-company-id';

export interface ComplianceDataRequest {
  id: string;
  company_id: string;
  reference: string;
  subject_name: string;
  subject_email?: string | null;
  request_type: string;
  status: string;
  received_at?: string | null;
  deadline_at?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DataRequestSummary {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  byStatus: Record<string, number>;
}

export interface ComplianceReport {
  id: string;
  company_id: string;
  name: string;
  report_type: string;
  status: string;
  report_date?: string | null;
  file_size?: string | null;
  file_url?: string | null;
  generated_by?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

export class ComplianceService {
  // --- Data-subject requests ---
  static async getDataRequests(): Promise<ComplianceDataRequest[]> {
    return request<ComplianceDataRequest[]>(
      `/compliance/data-requests?companyId=${DEFAULT_COMPANY}`,
    );
  }

  static async getDataRequestSummary(): Promise<DataRequestSummary> {
    return request<DataRequestSummary>(
      `/compliance/data-requests/summary?companyId=${DEFAULT_COMPANY}`,
    );
  }

  static async createDataRequest(
    data: Partial<ComplianceDataRequest> & { subjectName: string },
  ): Promise<ComplianceDataRequest> {
    return request<ComplianceDataRequest>('/compliance/data-requests', {
      method: 'POST',
      body: JSON.stringify({ companyId: DEFAULT_COMPANY, ...data }),
    });
  }

  // --- Regulatory reports ---
  static async getReports(reportType?: string): Promise<ComplianceReport[]> {
    const q = reportType
      ? `?companyId=${DEFAULT_COMPANY}&reportType=${encodeURIComponent(reportType)}`
      : `?companyId=${DEFAULT_COMPANY}`;
    return request<ComplianceReport[]>(`/compliance/reports${q}`);
  }

  static async createReport(
    data: { name: string; reportType?: string; status?: string; reportDate?: string; fileSize?: string },
  ): Promise<ComplianceReport> {
    return request<ComplianceReport>('/compliance/reports', {
      method: 'POST',
      body: JSON.stringify({ companyId: DEFAULT_COMPANY, ...data }),
    });
  }
}

export const complianceService = ComplianceService;
