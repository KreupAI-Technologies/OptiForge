// Support pages service — hits NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', 'x-company-id': COMPANY_ID },
    ...init,
  });
  if (!res.ok) throw new Error(`Request failed (${res.status}) for ${path}`);
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}
function asArray<T>(d: any): T[] { return Array.isArray(d) ? d : (d?.data ?? []); }

export const supportPagesService = {
  async getHardwareAssets(): Promise<any[]> { return asArray(await request('/support/assets/hardware')); },
  async getAutomationRules(): Promise<any[]> { return asArray(await request('/support/automation/rules')); },
  async getScheduledChanges(): Promise<any[]> { return asArray(await request('/support/changes/scheduled')); },
  async getFaqs(): Promise<any[]> { return asArray(await request('/support/knowledge/faqs')); },
  async getSlaSettings(): Promise<any> { return await request('/support/sla/settings'); },
  async getTeamAgents(): Promise<any[]> { return asArray(await request('/support/team/agents')); },
  async getOmnichannel(): Promise<any[]> { return asArray(await request('/support/omnichannel')); },
  async getReportTemplates(): Promise<any[]> { return asArray(await request('/support/report-templates')); },

  // --- Scheduled Reports (support/report-schedules) ---
  async getReportSchedules(): Promise<any[]> { return asArray(await request('/support/report-schedules')); },
  async createReportSchedule(data: any): Promise<any> {
    return request('/support/report-schedules', { method: 'POST', body: JSON.stringify(data) });
  },
  async toggleReportSchedule(id: string, isActive: boolean): Promise<any> {
    return request(`/support/report-schedules/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive }) });
  },
  async deleteReportSchedule(id: string): Promise<void> {
    await request(`/support/report-schedules/${id}`, { method: 'DELETE' });
  },

  // --- Custom Reports (support/custom-reports) ---
  async getCustomReports(): Promise<any[]> { return asArray(await request('/support/custom-reports')); },
  async createCustomReport(data: any): Promise<any> {
    return request('/support/custom-reports', { method: 'POST', body: JSON.stringify(data) });
  },
  async deleteCustomReport(id: string): Promise<void> {
    await request(`/support/custom-reports/${id}`, { method: 'DELETE' });
  },
};
