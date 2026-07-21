// Defect Management Service
// Defects are tracked as Non-Conformance Records (NCRs) in the Quality module.
// Backend controller: @Controller('quality/non-conformance')

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Raw ORM shape returned by GET /quality/non-conformance (partial — defensive access).
export interface RawNonConformance {
  id: string;
  ncrNumber?: string;
  title?: string;
  description?: string;
  ncrType?: string;
  status?: string;
  severity?: string;
  priority?: string;
  workOrderNumber?: string;
  itemName?: string;
  itemCode?: string;
  reportedByName?: string;
  reportedDate?: string;
  reworkQuantity?: number;
  [key: string]: unknown;
}

export class DefectService {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
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

  // Get all defects (non-conformance records).
  static async getAllDefects(): Promise<RawNonConformance[]> {
    const data = await this.request<RawNonConformance[]>('/quality/non-conformance');
    return Array.isArray(data) ? data : [];
  }

  // Create a defect (non-conformance record) via POST /quality/non-conformance.
  // Backend CreateNonConformanceDto requires: ncrNumber, title, description,
  // ncrType, severity, reportedDate. Optional: reportedByName, defectDescription, notes.
  static async create(data: {
    title: string;
    description: string;
    severity: string;
    ncrType: string;
    reportedByName?: string;
    reportedDate?: string;
  }): Promise<RawNonConformance> {
    const ncrNumber = `NCR-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    return this.request<RawNonConformance>('/quality/non-conformance', {
      method: 'POST',
      body: JSON.stringify({
        ncrNumber,
        title: data.title,
        description: data.description,
        ncrType: data.ncrType,
        severity: data.severity,
        reportedDate: data.reportedDate || new Date().toISOString().slice(0, 10),
        ...(data.reportedByName ? { reportedByName: data.reportedByName } : {}),
      }),
    });
  }
}

export const defectService = DefectService;
