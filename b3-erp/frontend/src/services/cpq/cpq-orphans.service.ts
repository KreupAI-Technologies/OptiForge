// CPQ orphan-page services.
//
// These endpoints return raw JSON arrays from the NestJS backend (no
// { success, data } envelope), so we fetch them directly against the API base
// URL rather than through the shared apiClient wrapper.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Company scoping header. Falls back to a demo id so pages render in dev.
function companyHeaders(): Record<string, string> {
  let companyId = 'demo-company';
  if (typeof window !== 'undefined') {
    companyId =
      localStorage.getItem('companyId') ||
      localStorage.getItem('x-company-id') ||
      companyId;
  }
  return {
    'Content-Type': 'application/json',
    'x-company-id': companyId,
  };
}

async function getJson<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'GET',
      credentials: 'include',
      headers: companyHeaders(),
    });
    if (!res.ok) return [];
    const body = await res.json();
    // Support both raw arrays and { data: [] } envelopes defensively.
    if (Array.isArray(body)) return body as T[];
    if (body && Array.isArray(body.data)) return body.data as T[];
    return [];
  } catch {
    return [];
  }
}

// ==================== Config Rules (products/rules) ====================

export interface CPQConfigRuleItem {
  id: string;
  companyId: string;
  name: string;
  type: 'compatibility' | 'dependency' | 'constraint' | 'pricing';
  condition: string | null;
  action: string | null;
  priority: number;
  status: 'active' | 'inactive';
  affectedProducts: number;
  createdAt: string;
  updatedAt: string;
}

export const cpqConfigRuleService = {
  findAll: (filters?: { type?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (filters?.type) qs.append('type', filters.type);
    if (filters?.status) qs.append('status', filters.status);
    const q = qs.toString();
    return getJson<CPQConfigRuleItem>(
      q ? `/cpq/config-rules?${q}` : '/cpq/config-rules',
    );
  },
};

// ==================== Compatibility (products/compatibility) ============

export interface CPQCompatibilityEntry {
  id: string;
  companyId: string;
  product1: string;
  product2: string;
  compatible: boolean;
  reason: string | null;
  severity: 'critical' | 'warning' | 'info' | null;
  createdAt: string;
  updatedAt: string;
}

export const cpqCompatibilityService = {
  findAll: () =>
    getJson<CPQCompatibilityEntry>('/cpq/compatibility-entries'),
};

// ==================== Cross-sell (guided-selling/cross-sell) ============

export interface CPQCrossSellRule {
  id: string;
  companyId: string;
  primaryProduct: {
    code?: string;
    name?: string;
    category?: string;
    value?: number;
  } | null;
  suggestedProduct: {
    code?: string;
    name?: string;
    category?: string;
    value?: number;
  } | null;
  relationship: 'complement' | 'essential' | 'upgrade' | 'bundle';
  coOccurrenceRate: number;
  avgAdditionalRevenue: number;
  conversionRate: number;
  customersCount: number;
  totalOpportunityValue: number;
  recommendationStrength: 'strong' | 'medium' | 'weak';
  activeCampaigns: number;
  createdAt: string;
  updatedAt: string;
}

export const cpqCrossSellService = {
  findAll: () => getJson<CPQCrossSellRule>('/cpq/cross-sell-rules'),
};

// ==================== Recommendations (guided-selling/recommendations) ==

export interface CPQRecommendation {
  id: string;
  companyId: string;
  customerId: string | null;
  customerName: string | null;
  segment: string | null;
  productCode: string | null;
  productName: string | null;
  category: string | null;
  recommendationType:
    | 'best-match'
    | 'upgrade'
    | 'alternative'
    | 'frequently-bought'
    | 'trending';
  confidenceScore: number;
  estimatedValue: number;
  reason: string | null;
  basedOn: string | null;
  priority: 'high' | 'medium' | 'low';
  aiGenerated: boolean;
  acceptanceRate: number;
  expiresDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export const cpqRecommendationService = {
  findAll: (filters?: { customerId?: string; priority?: string }) => {
    const qs = new URLSearchParams();
    if (filters?.customerId) qs.append('customerId', filters.customerId);
    if (filters?.priority) qs.append('priority', filters.priority);
    const q = qs.toString();
    return getJson<CPQRecommendation>(
      q ? `/cpq/recommendations?${q}` : '/cpq/recommendations',
    );
  },
};

// ==================== Code lists (settings/numbering) ===================

export interface CPQCodeListItem {
  id: string;
  companyId: string;
  listType: 'branch' | 'category';
  name: string;
  code: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const cpqCodeListService = {
  findAll: (listType?: 'branch' | 'category') => {
    const q = listType ? `?listType=${listType}` : '';
    return getJson<CPQCodeListItem>(`/cpq/code-lists${q}`);
  },
};

// ==================== Integration sync logs (integration/crm) ===========

export interface CPQIntegrationSyncLog {
  id: string;
  companyId: string;
  system: string;
  operation: string | null;
  records: number;
  status: 'success' | 'error' | 'warning';
  duration: string | null;
  message: string | null;
  createdAt: string;
  updatedAt: string;
}

export const cpqIntegrationSyncLogService = {
  findAll: (filters?: { system?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (filters?.system) qs.append('system', filters.system);
    if (filters?.status) qs.append('status', filters.status);
    const q = qs.toString();
    return getJson<CPQIntegrationSyncLog>(
      q ? `/cpq/integration-sync-logs?${q}` : '/cpq/integration-sync-logs',
    );
  },
};

// ==================== Second-pass orphan services ======================

// -------- Workflow requests (workflow/legal, workflow/executive) --------

export interface CPQWorkflowRequest {
  id: string;
  companyId: string;
  requestType: 'legal' | 'executive' | 'discount';
  reference: string | null;
  documentNumber: string | null;
  customerName: string | null;
  value: number;
  requestedBy: string | null;
  assignedTo: string | null;
  priority: string | null;
  status: string | null;
  requestDate: string | null;
  dueDate: string | null;
  payload: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export const cpqWorkflowRequestService = {
  findAll: (filters?: { requestType?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (filters?.requestType) qs.append('requestType', filters.requestType);
    if (filters?.status) qs.append('status', filters.status);
    const q = qs.toString();
    return getJson<CPQWorkflowRequest>(
      q ? `/cpq/workflow-requests?${q}` : '/cpq/workflow-requests',
    );
  },
};

// -------- Quote versions (quotes/versions) ------------------------------

export interface CPQQuoteVersionRow {
  id: string;
  companyId: string;
  quoteNumber: string | null;
  version: string | null;
  customerName: string | null;
  value: number;
  changes: string[] | null;
  changeType:
    | 'price-increase'
    | 'price-decrease'
    | 'items-added'
    | 'items-removed'
    | 'terms-updated';
  createdBy: string | null;
  createdDate: string | null;
  status: 'draft' | 'sent' | 'current' | 'superseded';
  createdAt: string;
  updatedAt: string;
}

export const cpqQuoteVersionService = {
  findAll: (filters?: { quoteNumber?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (filters?.quoteNumber) qs.append('quoteNumber', filters.quoteNumber);
    if (filters?.status) qs.append('status', filters.status);
    const q = qs.toString();
    return getJson<CPQQuoteVersionRow>(
      q ? `/cpq/quote-versions-list?${q}` : '/cpq/quote-versions-list',
    );
  },
};

// -------- Notification settings (settings/notifications) ----------------

export interface CPQNotificationSettingRow {
  id: string;
  companyId: string;
  settingType: 'email-template' | 'escalation-rule' | 'toggle' | 'threshold';
  name: string | null;
  subject: string | null;
  enabled: boolean;
  config: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export const cpqNotificationSettingService = {
  findAll: (settingType?: string) => {
    const q = settingType ? `?settingType=${settingType}` : '';
    return getJson<CPQNotificationSettingRow>(`/cpq/notification-settings${q}`);
  },
};

// -------- Permission roles (settings/permissions) -----------------------

export interface CPQPermissionRole {
  id: string;
  companyId: string;
  name: string | null;
  description: string | null;
  usersCount: number;
  permissions: Record<string, any> | null;
  approvalLimit: number | null;
  createdAt: string;
  updatedAt: string;
}

export const cpqPermissionRoleService = {
  findAll: () => getJson<CPQPermissionRole>('/cpq/permission-roles'),
};

// -------- Integration endpoints (integration/cad|ecommerce|erp) ---------

export interface CPQIntegrationEndpoint {
  id: string;
  companyId: string;
  system: string;
  name: string | null;
  type: string | null;
  status: 'connected' | 'disconnected' | 'error';
  version: string | null;
  lastSync: string | null;
  recordCount: number;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export const cpqIntegrationEndpointService = {
  findAll: (filters?: { system?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (filters?.system) qs.append('system', filters.system);
    if (filters?.status) qs.append('status', filters.status);
    const q = qs.toString();
    return getJson<CPQIntegrationEndpoint>(
      q ? `/cpq/integration-endpoints?${q}` : '/cpq/integration-endpoints',
    );
  },
};

// -------- Config steps (products/configurator) --------------------------

export interface CPQConfigStep {
  id: string;
  companyId: string;
  title: string | null;
  stepOrder: number;
  completed: boolean;
  active: boolean;
  options:
    | {
        id?: string;
        name?: string;
        price?: number;
        selected?: boolean;
        image?: string;
      }[]
    | null;
  createdAt: string;
  updatedAt: string;
}

export const cpqConfigStepService = {
  findAll: () => getJson<CPQConfigStep>('/cpq/config-steps'),
};
