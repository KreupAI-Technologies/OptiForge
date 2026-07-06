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
