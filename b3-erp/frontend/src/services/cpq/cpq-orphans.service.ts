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
