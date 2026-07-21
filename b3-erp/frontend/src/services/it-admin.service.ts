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

export interface AlertRuleDto {
  id: string;
  companyId?: string;
  name: string;
  description?: string;
  category: string;
  severity: string;
  enabled: boolean;
  conditions?: string[];
  actions?: string[];
  notifyVia?: string[];
  recipients?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPasswordStatusDto {
  id: string;
  userId: string;
  userName: string;
  email: string;
  department: string;
  lastChanged: string | null;
  daysOld: number | null;
  status: string;
  strength: string;
  expiresIn: number | null;
  failedAttempts: number;
  locked: boolean;
}

export interface IpWhitelistEntryDto {
  id: string;
  companyId?: string;
  ipAddress: string;
  type?: string;
  description?: string;
  category?: string;
  addedBy?: string;
  addedDate?: string;
  lastAccess?: string;
  accessCount?: number;
  status: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItUserDto {
  id: string;
  employeeId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  roleId?: string;
  roleName?: string;
  status: string;
  lastLogin?: string;
  passwordChangedAt?: string;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItUserDto {
  employeeId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  roleId?: string;
  password?: string;
  twoFactorEnabled?: boolean;
}

export interface UpdateItUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  roleId?: string;
  status?: string;
  twoFactorEnabled?: boolean;
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

export interface UserGroupDto {
  id: string;
  companyId?: string;
  name: string;
  description?: string;
  memberCount: number;
  permissions?: string[];
  members?: Array<{ id: string; name: string; email: string; role: string }>;
  createdDate?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface LicenseFeatureDto {
  id: string;
  companyId?: string;
  name: string;
  description?: string;
  category: string;
  enabled: boolean;
  included: boolean;
  tier?: string;
  usageLimit?: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LicenseUserDto {
  id: string;
  companyId?: string;
  name: string;
  email?: string;
  role?: string;
  department?: string;
  licenseType: string;
  status: string;
  assignedDate?: string;
  lastActive?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityPolicyDto {
  id: string;
  companyId?: string;
  name: string;
  description?: string;
  type: string;
  enabled: boolean;
  appliedRoles?: string[];
  severity: string;
  config?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookEndpointDto {
  id: string;
  companyId?: string;
  name: string;
  url?: string;
  events?: string[];
  status: string;
  secret?: string;
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiEndpointDto {
  id: string;
  companyId?: string;
  name: string;
  method: string;
  path?: string;
  description?: string;
  category: string;
  enabled: boolean;
  authRequired: boolean;
  parameters?: any;
  rateLimit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BackupRecordDto {
  id: string;
  companyId?: string;
  name: string;
  type: string;
  status: string;
  size?: string;
  location?: string;
  startedAt?: string;
  completedAt?: string;
  duration?: string;
  automated: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportDatasetDto {
  id: string;
  companyId?: string;
  name: string;
  category: string;
  recordCount: number;
  size?: string;
  exportable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSessionUserDto {
  id?: string;
  fullName?: string;
  email?: string;
  department?: string;
  userType?: string;
}

export interface UserSessionDto {
  id: string;
  userId: string;
  sessionToken?: string;
  status: string;
  ipAddress: string;
  userAgent?: string;
  device?: string;
  browser?: string;
  os?: string;
  location?: string;
  expiresAt?: string;
  lastActivityAt?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: UserSessionUserDto;
}

export interface UserSessionStatsDto {
  totalSessions: number;
  activeSessions: number;
  uniqueUsers: number;
  mobileDevices: number;
  byStatus: Record<string, number>;
}

export interface AuditLogDto {
  id: string;
  userId?: string;
  userName?: string;
  action?: string;
  module?: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  status?: string;
  severity?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLogPageDto {
  data: AuditLogDto[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface SystemMonitorDto {
  id: string;
  companyId?: string;
  kind: string; // health | error | performance
  name: string;
  category?: string;
  status: string;
  severity?: string;
  message?: string;
  source?: string;
  value?: number;
  unit?: string;
  threshold?: number;
  occurrences: number;
  lastOccurred?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SystemMonitorSummaryDto {
  total: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
}

export interface SystemMonitorHistoryDto {
  kind: string;
  metrics: string[];
  series: Array<{ timestamp: string; values: Record<string, number> }>;
}

export interface ComplianceRequirementDto {
  id: string;
  companyId?: string;
  standard: string;
  requirement: string;
  description?: string;
  category: string;
  status: string;
  severity: string;
  compliance: number;
  lastAssessed?: string;
  nextReview?: string;
  owner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceReportDto {
  generatedAt: string;
  totalRequirements: number;
  overallCompliance: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  byStandard: Array<{
    standard: string;
    count: number;
    averageCompliance: number;
  }>;
}

export interface SystemConfigValueDto {
  key: string;
  value: any;
}

export interface EmailStatsDto {
  sent24h: number;
  sentThisMonth: number;
  failed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

export interface EmailTestResultDto {
  success: boolean;
  message: string;
  loggedAt: string;
}

export interface NotificationMetricsDto {
  totalNotifications: number;
  last30Days: number;
  byChannel: Record<string, number>;
  byPriority: Record<string, number>;
  configuredSettings: number;
  criticalSettings: number;
}

export interface ComplianceViolationDto {
  id: string;
  companyId?: string;
  requirementId?: string;
  category: string;
  requirement?: string;
  description?: string;
  severity: string;
  status: string;
  affectedEntity?: string;
  detectedBy?: string;
  assignedTo?: string;
  detectedAt?: string;
  dueDate?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CleanupTaskDto {
  id: string;
  companyId?: string;
  name: string;
  description?: string;
  category: string;
  impact: string;
  estimatedSpace?: string;
  recordCount: number;
  automated: boolean;
  enabled: boolean;
  lastRunAt?: string;
  recordsAffected: number;
  createdAt: string;
  updatedAt: string;
}

export interface CleanupRunResultDto {
  task: CleanupTaskDto;
  ranAt: string;
  recordsAffected: number;
  estimatedSpace: string;
}

export interface ExportTemplateDto {
  id: string;
  companyId?: string;
  name: string;
  description?: string;
  dataset?: string;
  format: string;
  tables?: string[];
  columns?: string[];
  filters?: string[];
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportColumnMappingDto {
  sourceColumn: string;
  targetColumn: string;
  dataType: string;
  required: boolean;
}

export interface MonitoredServerDto {
  id: string;
  companyId?: string;
  name: string;
  host?: string;
  role: string;
  status: string;
  cpuPct: number;
  memPct: number;
  diskPct: number;
  networkPct: number;
  uptime?: string;
  location?: string;
  lastRestartAt?: string;
  lastCheckAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationConfigDto {
  id: string;
  companyId?: string;
  name: string;
  category?: string;
  description?: string;
  status?: string;
  icon?: string;
  config?: Record<string, any>;
  lastSync?: string;
  syncFrequency?: string;
  features?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleDto {
  id: string;
  code?: string;
  name: string;
  description?: string;
  roleType?: string;
  status?: string;
  userCount?: number;
  applicableModules?: string[];
  permissions?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomFieldDto {
  id: string;
  companyId?: string;
  name: string;
  label?: string;
  module?: string;
  fieldType?: string;
  required?: boolean;
  defaultValue?: string;
  options?: string[];
  validation?: string;
  helpText?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentTemplateDto {
  id: string;
  companyId?: string;
  name: string;
  description?: string;
  type?: string;
  category?: string;
  content?: string;
  variables?: string[];
  format?: string;
  lastModified?: string;
  usageCount?: number;
  isDefault?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TwoFactorSettingDto {
  id: string;
  companyId?: string;
  enabled: boolean;
  required: boolean;
  allowedMethods?: string[];
  gracePeriodDays: number;
  config?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TwoFactorEnrollmentStatusDto {
  id: string;
  userId: string;
  userName: string;
  email: string;
  department: string;
  role: string;
  status: string; // Enrolled | Pending | Not Enrolled
  method: string;
  enrolled: boolean;
  enrolledDate: string;
  lastVerifiedAt: string | null;
  backupCodes: number;
}

// ============================================================================
// Helpers
// ============================================================================

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    // Auth is carried by the HttpOnly `access_token` cookie set on login.
    // `credentials: 'include'` attaches it so JwtAuthGuard-protected it-admin
    // endpoints (users, etc.) receive the token. Matches api-client.ts.
    credentials: 'include',
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

  async runScheduledJob(id: string): Promise<ScheduledJobDto> {
    return request<ScheduledJobDto>(`/it-admin/scheduled-jobs/${id}/run`, {
      method: 'POST',
    });
  }

  async deleteScheduledJob(id: string): Promise<void> {
    return request<void>(`/it-admin/scheduled-jobs/${id}`, {
      method: 'DELETE',
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

  async createAutomationRule(
    data: Partial<AutomationRuleDto>,
  ): Promise<AutomationRuleDto> {
    return request<AutomationRuleDto>('/it-admin/automation-rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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

  async deleteAutomationRule(id: string): Promise<void> {
    return request<void>(`/it-admin/automation-rules/${id}`, {
      method: 'DELETE',
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

  async updateSecurityAlert(
    id: string,
    data: Partial<SecurityAlertDto>,
  ): Promise<SecurityAlertDto> {
    return request<SecurityAlertDto>(`/it-admin/security-alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSecurityAlert(id: string): Promise<void> {
    return request<void>(`/it-admin/security-alerts/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Alert Rules ---
  async getAlertRules(params?: {
    companyId?: string;
    category?: string;
    severity?: string;
  }): Promise<AlertRuleDto[]> {
    return request<AlertRuleDto[]>(`/it-admin/alert-rules${qs(params)}`);
  }

  async createAlertRule(data: Partial<AlertRuleDto>): Promise<AlertRuleDto> {
    return request<AlertRuleDto>('/it-admin/alert-rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAlertRule(
    id: string,
    data: Partial<AlertRuleDto>,
  ): Promise<AlertRuleDto> {
    return request<AlertRuleDto>(`/it-admin/alert-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAlertRule(id: string): Promise<void> {
    return request<void>(`/it-admin/alert-rules/${id}`, { method: 'DELETE' });
  }

  // --- IP Whitelist ---
  async getIpWhitelist(params?: {
    companyId?: string;
    category?: string;
    status?: string;
  }): Promise<IpWhitelistEntryDto[]> {
    return request<IpWhitelistEntryDto[]>(
      `/it-admin/ip-whitelist${qs(params)}`,
    );
  }

  async createIpWhitelistEntry(
    data: Partial<IpWhitelistEntryDto>,
  ): Promise<IpWhitelistEntryDto> {
    return request<IpWhitelistEntryDto>('/it-admin/ip-whitelist', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteIpWhitelistEntry(id: string): Promise<void> {
    return request<void>(`/it-admin/ip-whitelist/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Users ---
  async getUsers(params?: {
    status?: string;
    userType?: string;
    department?: string;
    search?: string;
  }): Promise<ItUserDto[]> {
    return request<ItUserDto[]>(`/it-admin/users${qs(params)}`);
  }

  async createUser(data: CreateItUserDto): Promise<ItUserDto> {
    return request<ItUserDto>('/it-admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: UpdateItUserDto): Promise<ItUserDto> {
    return request<ItUserDto>(`/it-admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deactivateUser(id: string, reason?: string): Promise<ItUserDto> {
    return request<ItUserDto>(`/it-admin/users/${id}/deactivate`, {
      method: 'PATCH',
      body: JSON.stringify({ reason: reason ?? 'Deactivated from console' }),
    });
  }

  async activateUser(id: string): Promise<ItUserDto> {
    return request<ItUserDto>(`/it-admin/users/${id}/activate`, {
      method: 'PATCH',
    });
  }

  async unlockUser(id: string): Promise<ItUserDto> {
    return request<ItUserDto>(`/it-admin/users/${id}/unlock`, {
      method: 'PATCH',
    });
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

  async getPasswordStatuses(
    companyId?: string,
  ): Promise<UserPasswordStatusDto[]> {
    return request<UserPasswordStatusDto[]>(
      `/it-admin/password-policy/user-status${qs({ companyId })}`,
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

  // --- User Groups ---
  async getUserGroups(params?: {
    companyId?: string;
    status?: string;
  }): Promise<UserGroupDto[]> {
    return request<UserGroupDto[]>(`/it-admin/user-groups${qs(params)}`);
  }

  async createUserGroup(data: Partial<UserGroupDto>): Promise<UserGroupDto> {
    return request<UserGroupDto>('/it-admin/user-groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserGroup(
    id: string,
    data: Partial<UserGroupDto>,
  ): Promise<UserGroupDto> {
    return request<UserGroupDto>(`/it-admin/user-groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUserGroup(id: string): Promise<void> {
    return request<void>(`/it-admin/user-groups/${id}`, { method: 'DELETE' });
  }

  // --- License Features ---
  async getLicenseFeatures(params?: {
    companyId?: string;
    category?: string;
  }): Promise<LicenseFeatureDto[]> {
    return request<LicenseFeatureDto[]>(
      `/it-admin/license-features${qs(params)}`,
    );
  }

  async updateLicenseFeature(
    id: string,
    data: Partial<LicenseFeatureDto>,
  ): Promise<LicenseFeatureDto> {
    return request<LicenseFeatureDto>(`/it-admin/license-features/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- License Users ---
  async getLicenseUsers(params?: {
    companyId?: string;
    status?: string;
    licenseType?: string;
  }): Promise<LicenseUserDto[]> {
    return request<LicenseUserDto[]>(`/it-admin/license-users${qs(params)}`);
  }

  async updateLicenseUser(
    id: string,
    data: Partial<LicenseUserDto>,
  ): Promise<LicenseUserDto> {
    return request<LicenseUserDto>(`/it-admin/license-users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async renewLicenseUser(
    id: string,
    months = 12,
  ): Promise<LicenseUserDto> {
    return request<LicenseUserDto>(`/it-admin/license-users/${id}/renew`, {
      method: 'POST',
      body: JSON.stringify({ months }),
    });
  }

  // --- Security Policies ---
  async getSecurityPolicies(params?: {
    companyId?: string;
    type?: string;
  }): Promise<SecurityPolicyDto[]> {
    return request<SecurityPolicyDto[]>(
      `/it-admin/security-policies${qs(params)}`,
    );
  }

  async createSecurityPolicy(
    data: Partial<SecurityPolicyDto>,
  ): Promise<SecurityPolicyDto> {
    return request<SecurityPolicyDto>('/it-admin/security-policies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSecurityPolicy(
    id: string,
    data: Partial<SecurityPolicyDto>,
  ): Promise<SecurityPolicyDto> {
    return request<SecurityPolicyDto>(`/it-admin/security-policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- Webhook Endpoints ---
  async getWebhookEndpoints(params?: {
    companyId?: string;
    status?: string;
  }): Promise<WebhookEndpointDto[]> {
    return request<WebhookEndpointDto[]>(
      `/it-admin/webhook-endpoints${qs(params)}`,
    );
  }

  async createWebhookEndpoint(
    data: Partial<WebhookEndpointDto>,
  ): Promise<WebhookEndpointDto> {
    return request<WebhookEndpointDto>('/it-admin/webhook-endpoints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWebhookEndpoint(
    id: string,
    data: Partial<WebhookEndpointDto>,
  ): Promise<WebhookEndpointDto> {
    return request<WebhookEndpointDto>(`/it-admin/webhook-endpoints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- API Endpoints ---
  async getApiEndpoints(params?: {
    companyId?: string;
    category?: string;
  }): Promise<ApiEndpointDto[]> {
    return request<ApiEndpointDto[]>(`/it-admin/api-endpoints${qs(params)}`);
  }

  async updateApiEndpoint(
    id: string,
    data: Partial<ApiEndpointDto>,
  ): Promise<ApiEndpointDto> {
    return request<ApiEndpointDto>(`/it-admin/api-endpoints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- Backup Records ---
  async getBackupRecords(params?: {
    companyId?: string;
    type?: string;
    status?: string;
  }): Promise<BackupRecordDto[]> {
    return request<BackupRecordDto[]>(`/it-admin/backup-records${qs(params)}`);
  }

  async createBackupRecord(
    data: Partial<BackupRecordDto>,
  ): Promise<BackupRecordDto> {
    return request<BackupRecordDto>('/it-admin/backup-records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async restoreBackupRecord(id: string): Promise<BackupRecordDto> {
    return request<BackupRecordDto>(`/it-admin/backup-records/${id}/restore`, {
      method: 'POST',
    });
  }

  async pauseImport(id: string): Promise<BackupRecordDto> {
    return request<BackupRecordDto>(`/it-admin/backup-records/${id}/pause`, {
      method: 'POST',
    });
  }

  async resumeImport(id: string): Promise<BackupRecordDto> {
    return request<BackupRecordDto>(`/it-admin/backup-records/${id}/resume`, {
      method: 'POST',
    });
  }

  async retryImport(id: string): Promise<BackupRecordDto> {
    return request<BackupRecordDto>(`/it-admin/backup-records/${id}/retry`, {
      method: 'POST',
    });
  }

  async deleteBackupRecord(id: string): Promise<void> {
    return request<void>(`/it-admin/backup-records/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Export Datasets ---
  async getExportDatasets(params?: {
    companyId?: string;
    category?: string;
  }): Promise<ExportDatasetDto[]> {
    return request<ExportDatasetDto[]>(`/it-admin/export-datasets${qs(params)}`);
  }

  // --- Audit Logs ---
  async getAuditLogs(params?: {
    userId?: string;
    module?: string;
    action?: string;
    page?: string;
    limit?: string;
  }): Promise<AuditLogPageDto> {
    return request<AuditLogPageDto>(`/it-admin/audit-logs${qs(params)}`);
  }

  async createExportDataset(
    data: Partial<ExportDatasetDto>,
  ): Promise<ExportDatasetDto> {
    return request<ExportDatasetDto>('/it-admin/export-datasets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- System Monitoring (health / errors / performance) ---
  async getMonitoring(params?: {
    companyId?: string;
    kind?: string;
    status?: string;
    severity?: string;
    category?: string;
  }): Promise<SystemMonitorDto[]> {
    return request<SystemMonitorDto[]>(`/it-admin/monitoring${qs(params)}`);
  }

  async getMonitoringSummary(
    kind: string,
    companyId?: string,
  ): Promise<SystemMonitorSummaryDto> {
    return request<SystemMonitorSummaryDto>(
      `/it-admin/monitoring/summary${qs({ kind, companyId })}`,
    );
  }

  async getMonitoringHistory(params?: {
    kind?: string;
    companyId?: string;
    limit?: string;
  }): Promise<SystemMonitorHistoryDto> {
    return request<SystemMonitorHistoryDto>(
      `/it-admin/monitoring/history${qs(params)}`,
    );
  }

  // --- Compliance Requirements ---
  async getComplianceRequirements(params?: {
    companyId?: string;
    standard?: string;
    category?: string;
    status?: string;
    severity?: string;
  }): Promise<ComplianceRequirementDto[]> {
    return request<ComplianceRequirementDto[]>(
      `/it-admin/compliance-requirements${qs(params)}`,
    );
  }

  async generateComplianceReport(
    companyId?: string,
  ): Promise<ComplianceReportDto> {
    return request<ComplianceReportDto>(
      `/it-admin/compliance-requirements/report${qs({ companyId })}`,
    );
  }

  async updateMonitoring(
    id: string,
    data: Partial<SystemMonitorDto>,
  ): Promise<SystemMonitorDto> {
    return request<SystemMonitorDto>(`/it-admin/monitoring/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- System Config key/value (SSO, scalability, misc settings) ---
  async getConfigValue(key: string): Promise<SystemConfigValueDto> {
    return request<SystemConfigValueDto>(
      `/it-admin/system-config/value/${encodeURIComponent(key)}`,
    );
  }

  async setConfigValue(
    key: string,
    value: any,
  ): Promise<SystemConfigValueDto> {
    return request<SystemConfigValueDto>(
      `/it-admin/system-config/value/${encodeURIComponent(key)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ value }),
      },
    );
  }

  // --- Roles ---
  async getRoles(params?: {
    status?: string;
    roleType?: string;
  }): Promise<RoleDto[]> {
    return request<RoleDto[]>(`/it-admin/roles${qs(params)}`);
  }

  async getRoleHierarchy(): Promise<RoleDto[]> {
    return request<RoleDto[]>('/it-admin/roles/hierarchy');
  }

  async createRole(data: Partial<RoleDto>): Promise<RoleDto> {
    return request<RoleDto>('/it-admin/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRole(id: string, data: Partial<RoleDto>): Promise<RoleDto> {
    return request<RoleDto>(`/it-admin/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRole(id: string): Promise<void> {
    return request<void>(`/it-admin/roles/${id}`, {
      method: 'DELETE',
    });
  }

  async assignRolePermissions(
    id: string,
    permissionIds: string[],
  ): Promise<RoleDto> {
    return request<RoleDto>(`/it-admin/roles/${id}/assign-permissions`, {
      method: 'PATCH',
      body: JSON.stringify({ permissionIds }),
    });
  }

  // --- Integrations ---
  async getIntegrations(params?: {
    companyId?: string;
    category?: string;
  }): Promise<IntegrationConfigDto[]> {
    return request<IntegrationConfigDto[]>(`/it-admin/integrations${qs(params)}`);
  }

  async updateIntegration(
    id: string,
    data: Partial<IntegrationConfigDto>,
  ): Promise<IntegrationConfigDto> {
    return request<IntegrationConfigDto>(`/it-admin/integrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- User Sessions (security/sessions console) ---
  async getSessions(params?: {
    status?: string;
    device?: string;
  }): Promise<UserSessionDto[]> {
    return request<UserSessionDto[]>(`/it-admin/sessions${qs(params)}`);
  }

  async getSessionStats(): Promise<UserSessionStatsDto> {
    return request<UserSessionStatsDto>('/it-admin/sessions/stats');
  }

  async terminateSession(
    id: string,
    body?: { terminatedBy?: string; reason?: string },
  ): Promise<{ message: string }> {
    return request<{ message: string }>(`/it-admin/sessions/${id}/terminate`, {
      method: 'POST',
      body: JSON.stringify({
        terminatedBy: body?.terminatedBy ?? 'admin',
        reason: body?.reason ?? 'Manual termination from console',
      }),
    });
  }

  async terminateAllUserSessions(
    userId: string,
    body?: { terminatedBy?: string; reason?: string },
  ): Promise<{ message: string }> {
    return request<{ message: string }>(
      `/it-admin/sessions/user/${userId}/terminate-all`,
      {
        method: 'POST',
        body: JSON.stringify({
          terminatedBy: body?.terminatedBy ?? 'admin',
          reason: body?.reason ?? 'Manual termination from console',
        }),
      },
    );
  }

  // --- Custom Fields ---
  async getCustomFields(params?: {
    companyId?: string;
    module?: string;
  }): Promise<CustomFieldDto[]> {
    return request<CustomFieldDto[]>(`/it-admin/custom-fields${qs(params)}`);
  }

  async createCustomField(
    data: Partial<CustomFieldDto>,
  ): Promise<CustomFieldDto> {
    return request<CustomFieldDto>('/it-admin/custom-fields', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomField(
    id: string,
    data: Partial<CustomFieldDto>,
  ): Promise<CustomFieldDto> {
    return request<CustomFieldDto>(`/it-admin/custom-fields/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomField(id: string): Promise<void> {
    return request<void>(`/it-admin/custom-fields/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Document Templates ---
  async getTemplates(params?: {
    companyId?: string;
    type?: string;
  }): Promise<DocumentTemplateDto[]> {
    return request<DocumentTemplateDto[]>(`/it-admin/templates${qs(params)}`);
  }

  async createTemplate(
    data: Partial<DocumentTemplateDto>,
  ): Promise<DocumentTemplateDto> {
    return request<DocumentTemplateDto>('/it-admin/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTemplate(
    id: string,
    data: Partial<DocumentTemplateDto>,
  ): Promise<DocumentTemplateDto> {
    return request<DocumentTemplateDto>(`/it-admin/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTemplate(id: string): Promise<void> {
    return request<void>(`/it-admin/templates/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Two-Factor Authentication (2FA) ---
  async getTwoFactorSettings(
    companyId?: string,
  ): Promise<TwoFactorSettingDto> {
    return request<TwoFactorSettingDto>(
      `/it-admin/two-factor/settings${qs({ companyId })}`,
    );
  }

  async saveTwoFactorSettings(
    data: Partial<TwoFactorSettingDto>,
    companyId?: string,
  ): Promise<TwoFactorSettingDto> {
    return request<TwoFactorSettingDto>(
      `/it-admin/two-factor/settings${qs({ companyId })}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
    );
  }

  async getTwoFactorEnrollments(
    companyId?: string,
  ): Promise<TwoFactorEnrollmentStatusDto[]> {
    return request<TwoFactorEnrollmentStatusDto[]>(
      `/it-admin/two-factor/enrollments${qs({ companyId })}`,
    );
  }

  async sendTwoFactorReminder(
    userId: string,
    companyId?: string,
  ): Promise<{ message: string; sentAt: string }> {
    return request<{ message: string; sentAt: string }>(
      `/it-admin/two-factor/enrollments/${userId}/reminder${qs({ companyId })}`,
      { method: 'POST' },
    );
  }

  async resetTwoFactor(
    userId: string,
    companyId?: string,
  ): Promise<TwoFactorEnrollmentStatusDto> {
    return request<TwoFactorEnrollmentStatusDto>(
      `/it-admin/two-factor/enrollments/${userId}/reset${qs({ companyId })}`,
      { method: 'POST' },
    );
  }

  async generateTwoFactorBackupCodes(
    userId: string,
    count?: number,
    companyId?: string,
  ): Promise<{ codes: string[]; generatedAt: string }> {
    return request<{ codes: string[]; generatedAt: string }>(
      `/it-admin/two-factor/enrollments/${userId}/backup-codes${qs({ companyId })}`,
      {
        method: 'POST',
        body: JSON.stringify({ count }),
      },
    );
  }

  // --- Email Settings (system/email page) ---
  async getEmailSettings(): Promise<SystemConfigValueDto> {
    return request<SystemConfigValueDto>('/it-admin/email/settings');
  }

  async saveEmailSettings(value: any): Promise<SystemConfigValueDto> {
    return request<SystemConfigValueDto>('/it-admin/email/settings', {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  async getEmailStats(companyId?: string): Promise<EmailStatsDto> {
    return request<EmailStatsDto>(`/it-admin/email/stats${qs({ companyId })}`);
  }

  async sendTestEmail(body: {
    toAddress: string;
    smtpHost?: string;
    companyId?: string;
  }): Promise<EmailTestResultDto> {
    return request<EmailTestResultDto>('/it-admin/email/test', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // --- Notification metrics (system/notifications page) ---
  async getNotificationMetrics(
    companyId?: string,
  ): Promise<NotificationMetricsDto> {
    return request<NotificationMetricsDto>(
      `/it-admin/notification-settings/metrics${qs({ companyId })}`,
    );
  }

  // --- Compliance Violations (audit/compliance page) ---
  async getComplianceViolations(params?: {
    companyId?: string;
    category?: string;
    severity?: string;
    status?: string;
  }): Promise<ComplianceViolationDto[]> {
    return request<ComplianceViolationDto[]>(
      `/it-admin/compliance-violations${qs(params)}`,
    );
  }

  async createComplianceViolation(
    data: Partial<ComplianceViolationDto>,
  ): Promise<ComplianceViolationDto> {
    return request<ComplianceViolationDto>('/it-admin/compliance-violations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resolveComplianceViolation(
    id: string,
    resolvedBy?: string,
  ): Promise<ComplianceViolationDto> {
    return request<ComplianceViolationDto>(
      `/it-admin/compliance-violations/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify({ status: 'Resolved', resolvedBy }),
      },
    );
  }

  async updateComplianceViolation(
    id: string,
    data: Partial<ComplianceViolationDto>,
  ): Promise<ComplianceViolationDto> {
    return request<ComplianceViolationDto>(
      `/it-admin/compliance-violations/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
    );
  }

  // --- Cleanup Tasks (database/cleanup page) ---
  async getCleanupTasks(params?: {
    companyId?: string;
    category?: string;
  }): Promise<CleanupTaskDto[]> {
    return request<CleanupTaskDto[]>(`/it-admin/cleanup-tasks${qs(params)}`);
  }

  async runCleanupTask(id: string): Promise<CleanupRunResultDto> {
    return request<CleanupRunResultDto>(`/it-admin/cleanup-tasks/run/${id}`, {
      method: 'POST',
    });
  }

  async updateCleanupTask(
    id: string,
    data: Partial<CleanupTaskDto>,
  ): Promise<CleanupTaskDto> {
    return request<CleanupTaskDto>(`/it-admin/cleanup-tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- Export Templates (database/export page) ---
  async getExportTemplates(params?: {
    companyId?: string;
    dataset?: string;
  }): Promise<ExportTemplateDto[]> {
    return request<ExportTemplateDto[]>(
      `/it-admin/export-templates${qs(params)}`,
    );
  }

  async applyExportTemplate(id: string): Promise<ExportTemplateDto> {
    return request<ExportTemplateDto>(
      `/it-admin/export-templates/${id}/apply`,
      { method: 'POST' },
    );
  }

  async createExportTemplate(
    data: Partial<ExportTemplateDto>,
  ): Promise<ExportTemplateDto> {
    return request<ExportTemplateDto>('/it-admin/export-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Import column-schema (database/import page) ---
  async getImportColumnSchema(
    dataset: string,
  ): Promise<ImportColumnMappingDto[]> {
    return request<ImportColumnMappingDto[]>(
      `/it-admin/export-templates/column-schema/${encodeURIComponent(dataset)}`,
    );
  }

  // --- Monitored Servers (monitoring/health page) ---
  async getMonitoredServers(params?: {
    companyId?: string;
    status?: string;
    role?: string;
  }): Promise<MonitoredServerDto[]> {
    return request<MonitoredServerDto[]>(
      `/it-admin/monitored-servers${qs(params)}`,
    );
  }
}

export const ItAdminService = new ItAdminServiceClass();
