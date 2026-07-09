// Estimation Report Schedules service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth: estimation/controllers/report-schedule.controller.ts
//   @Controller('estimation/report-schedules')

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

export interface ReportSchedule {
  id: string;
  companyId: string;
  reportType: string;
  frequency: string;
  dayOfWeek?: string;
  dayOfMonth?: string;
  time: string;
  format: string;
  recipients: string[];
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UpsertReportSchedulePayload = Partial<
  Omit<ReportSchedule, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>
> & { reportType: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-company-id': COMPANY_ID,
    },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${path}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export const estimationReportScheduleService = {
  async getSchedules(filters?: {
    isActive?: boolean;
    reportType?: string;
  }): Promise<ReportSchedule[]> {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined)
      params.append('isActive', String(filters.isActive));
    if (filters?.reportType)
      params.append('reportType', filters.reportType);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await request<any>(`/estimation/report-schedules${qs}`);
    return Array.isArray(data) ? data : data?.data ?? [];
  },

  async getSchedule(id: string): Promise<ReportSchedule> {
    return request<ReportSchedule>(`/estimation/report-schedules/${id}`);
  },

  async createSchedule(
    payload: UpsertReportSchedulePayload,
  ): Promise<ReportSchedule> {
    return request<ReportSchedule>('/estimation/report-schedules', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateSchedule(
    id: string,
    payload: Partial<UpsertReportSchedulePayload>,
  ): Promise<ReportSchedule> {
    return request<ReportSchedule>(`/estimation/report-schedules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteSchedule(id: string): Promise<void> {
    await request<void>(`/estimation/report-schedules/${id}`, {
      method: 'DELETE',
    });
  },
};

// ---------------------------------------------------------------------------
// Report file generation / download (PDF + Excel).
// Backend source of truth: estimation/controllers/estimation-report.controller.ts
//   GET  estimation/analytics/reports/:type/export?format=pdf|excel
//   POST estimation/analytics/reports/custom/generate?format=pdf|excel
//   GET  estimation/analytics/reports/bulk/export?format=excel|pdf
// ---------------------------------------------------------------------------

export type ReportExportFormat = 'pdf' | 'excel' | 'csv';

function filenameFromDisposition(
  header: string | null,
  fallback: string,
): string {
  if (!header) return fallback;
  const match = /filename="?([^"]+)"?/i.exec(header);
  return match?.[1] ?? fallback;
}

/** Trigger a browser download for a fetched blob. */
function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

async function downloadReportBlob(
  path: string,
  init: RequestInit,
  fallbackName: string,
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'x-company-id': COMPANY_ID, ...(init.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    let detail = '';
    try {
      detail = await res.text();
    } catch {
      /* ignore */
    }
    throw new Error(
      `Report download failed (${res.status})${detail ? `: ${detail}` : ''}`,
    );
  }
  const blob = await res.blob();
  const filename = filenameFromDisposition(
    res.headers.get('content-disposition'),
    fallbackName,
  );
  triggerBlobDownload(blob, filename);
}

export interface CustomEstimationReportRequest {
  reportName: string;
  description?: string;
  metrics: string[];
  filters?: string[];
  groupBy?: string[];
  dateRange?: string;
  startDate?: string;
  endDate?: string;
}

export const estimationReportExportService = {
  /** Download a built-in estimation report (estimates | win-loss | accuracy). */
  async exportReport(
    type: string,
    format: ReportExportFormat = 'pdf',
    range?: { fromDate?: string; toDate?: string },
  ): Promise<void> {
    const params = new URLSearchParams({ format });
    if (range?.fromDate) params.set('fromDate', range.fromDate);
    if (range?.toDate) params.set('toDate', range.toDate);
    await downloadReportBlob(
      `/estimation/analytics/reports/${encodeURIComponent(
        type,
      )}/export?${params.toString()}`,
      { method: 'GET' },
      `${type}-report.${format === 'excel' ? 'xlsx' : format}`,
    );
  },

  /** Generate + download an ad-hoc custom estimation report. */
  async generateCustom(
    payload: CustomEstimationReportRequest,
    format: ReportExportFormat = 'pdf',
  ): Promise<void> {
    await downloadReportBlob(
      `/estimation/analytics/reports/custom/generate?format=${format}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      `${payload.reportName || 'custom-report'}.${
        format === 'excel' ? 'xlsx' : format
      }`,
    );
  },

  /** Download all built-in reports as one file (Excel workbook by default). */
  async bulkExport(
    format: ReportExportFormat = 'excel',
    range?: { fromDate?: string; toDate?: string },
  ): Promise<void> {
    const params = new URLSearchParams({ format });
    if (range?.fromDate) params.set('fromDate', range.fromDate);
    if (range?.toDate) params.set('toDate', range.toDate);
    await downloadReportBlob(
      `/estimation/analytics/reports/bulk/export?${params.toString()}`,
      { method: 'GET' },
      `estimation-reports-bulk.${format === 'excel' ? 'xlsx' : format}`,
    );
  },
};
