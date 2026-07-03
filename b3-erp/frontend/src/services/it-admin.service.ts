// IT-Admin Service
// Typed fetch client for net-new it-admin endpoints (NestJS domain backend).

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// ============================================================================
// Types
// ============================================================================

export interface ScheduledJobDto {
  id: string;
  companyId?: string;
  name: string;
  description?: string;
  type: string;
  schedule?: string;
  cronExpression?: string;
  status: string;
  lastRun?: string;
  lastRunStatus?: string;
  nextRun?: string;
  duration?: string;
  successRate: number;
  totalRuns: number;
  failedRuns: number;
  enabled: boolean;
  priority: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationRuleDto {
  id: string;
  companyId?: string;
  name: string;
  description?: string;
  category: string;
  trigger?: string;
  triggerType?: string;
  conditions?: string[];
  actions?: string[];
  status: string;
  enabled: boolean;
  priority: string;
  lastTriggered?: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityAlertDto {
  id: string;
  companyId?: string;
  type: string;
  severity: string;
  title: string;
  description?: string;
  timestamp?: string;
  source?: string;
  ipAddress?: string;
  userId?: string;
  userName?: string;
  status: string;
  actionTaken?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PasswordPolicyDto {
  id: string;
  companyId?: string;
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expiryDays: number;
  historyCount: number;
  lockoutThreshold: number;
  lockoutDurationMinutes: number;
  mfaRequired: boolean;
  extra?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettingDto {
  id: string;
  companyId?: string;
  category: string;
  name: string;
  description?: string;
  channels?: Record<string, boolean>;
  priority: string;
  roles?: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Helpers
// ============================================================================

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${path}`);
  }
  if (res.status === 204) {
    return undefined as unknown as T;
  }
  return (await res.json()) as T;
}

function qs(params?: Record<string, string | undefined>): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== '',
  ) as [string, string][];
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries).toString();
}

// ============================================================================
// Service
// ============================================================================

class ItAdminServiceClass {
  // --- Scheduled Jobs ---
  async getScheduledJobs(params?: {
    companyId?: string;
    type?: string;
    status?: string;
  }): Promise<ScheduledJobDto[]> {
    return request<ScheduledJobDto[]>(`/it-admin/scheduled-jobs${qs(params)}`);
  }

  async createScheduledJob(
    data: Partial<ScheduledJobDto>,
  ): Promise<ScheduledJobDto> {
    return request<ScheduledJobDto>('/it-admin/scheduled-jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateScheduledJob(
    id: string,
    data: Partial<ScheduledJobDto>,
  ): Promise<ScheduledJobDto> {
    return request<ScheduledJobDto>(`/it-admin/scheduled-jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- Automation Rules ---
  async getAutomationRules(params?: {
    companyId?: string;
    category?: string;
    status?: string;
  }): Promise<AutomationRuleDto[]> {
    return request<AutomationRuleDto[]>(
      `/it-admin/automation-rules${qs(params)}`,
    );
  }

  async updateAutomationRule(
    id: string,
    data: Partial<AutomationRuleDto>,
  ): Promise<AutomationRuleDto> {
    return request<AutomationRuleDto>(`/it-admin/automation-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- Security Alerts ---
  async getSecurityAlerts(params?: {
    companyId?: string;
    severity?: string;
    status?: string;
    type?: string;
  }): Promise<SecurityAlertDto[]> {
    return request<SecurityAlertDto[]>(
      `/it-admin/security-alerts${qs(params)}`,
    );
  }

  // --- Password Policy ---
  async getPasswordPolicy(companyId?: string): Promise<PasswordPolicyDto> {
    return request<PasswordPolicyDto>(
      `/it-admin/password-policy${qs({ companyId })}`,
    );
  }

  async savePasswordPolicy(
    data: Partial<PasswordPolicyDto>,
    companyId?: string,
  ): Promise<PasswordPolicyDto> {
    return request<PasswordPolicyDto>(
      `/it-admin/password-policy${qs({ companyId })}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
    );
  }

  // --- Notification Settings ---
  async getNotificationSettings(params?: {
    companyId?: string;
    category?: string;
  }): Promise<NotificationSettingDto[]> {
    return request<NotificationSettingDto[]>(
      `/it-admin/notification-settings${qs(params)}`,
    );
  }

  async saveNotificationSettings(
    items: Array<Partial<NotificationSettingDto>>,
  ): Promise<NotificationSettingDto[]> {
    return request<NotificationSettingDto[]>(
      '/it-admin/notification-settings/bulk',
      {
        method: 'PUT',
        body: JSON.stringify(items),
      },
    );
  }
}

export const ItAdminService = new ItAdminServiceClass();
