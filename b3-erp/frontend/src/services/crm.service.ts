/**
 * CRM Service
 * Comprehensive service for all CRM module API operations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// ============================================================================
// Helper Functions
// ============================================================================

// Default tenant/company header expected by NestJS controllers (x-company-id).
const DEFAULT_COMPANY_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID || 'test';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-company-id': DEFAULT_COMPANY_ID,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

function buildQueryParams(params: Record<string, any>): string {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.set(key, String(value));
    }
  });
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Defensive list normaliser. Backends variously return a bare array, a
 * `{ data: [...] }` envelope, or `{ items: [...] }`. Callers can wrap any
 * list-returning request in this to always receive an array.
 */
export function asArray<T = any>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.items)) return payload.items;
  if (payload && Array.isArray(payload.results)) return payload.results;
  return [];
}

// ============================================================================
// Interfaces
// ============================================================================

export interface CrmContact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  department?: string;
  contactType: string;
  status: string;
  customerId?: string;
  customerName?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  linkedIn?: string;
  twitter?: string;
  value: number;
  lastContactDate?: string;
  notes?: string;
  tags: string[];
  companyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrmOpportunity {
  id: string;
  opportunityNumber: string;
  name: string;
  description?: string;
  customerId?: string;
  customerName?: string;
  contactId?: string;
  stage: string;
  probability: number;
  amount: number;
  currency: string;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  leadSource?: string;
  campaignId?: string;
  ownerId?: string;
  ownerName?: string;
  teamId?: string;
  winReason?: string;
  lossReason?: string;
  competitor?: string;
  products?: any[];
  tags: string[];
  customFields?: Record<string, any>;
  notes?: string;
  companyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrmActivity {
  id: string;
  activityNumber?: string;
  type: string;
  subject: string;
  description?: string;
  status: string;
  priority: string;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  completedDate?: string;
  duration?: number;
  leadId?: string;
  contactId?: string;
  opportunityId?: string;
  customerId?: string;
  assignedToId?: string;
  assignedToName?: string;
  performedById?: string;
  performedByName?: string;
  outcome?: string;
  nextSteps?: string;
  location?: string;
  isVirtual: boolean;
  meetingLink?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  tags: string[];
  attachments?: any[];
  companyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrmCampaign {
  id: string;
  campaignNumber: string;
  name: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  description?: string;
  objective?: string;
  targetAudience?: string;
  budget: number;
  actualCost: number;
  expectedRevenue: number;
  actualRevenue: number;
  currency: string;
  totalLeads: number;
  convertedLeads: number;
  totalOpportunities: number;
  wonOpportunities: number;
  assignedToId?: string;
  assignedToName?: string;
  parentCampaignId?: string;
  tags: string[];
  notes?: string;
  companyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrmQuote {
  id: string;
  quoteNumber: string;
  title: string;
  description?: string;
  status: string;
  validUntil?: string;
  customerId?: string;
  customerName?: string;
  contactName?: string;
  contactEmail?: string;
  opportunityId?: string;
  billingAddress?: any;
  shippingAddress?: any;
  items?: any[];
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  paymentTerms?: string;
  paymentTermDays?: number;
  preparedById?: string;
  preparedByName?: string;
  approvedById?: string;
  approvedByName?: string;
  sentDate?: string;
  acceptedDate?: string;
  rejectedDate?: string;
  notes?: string;
  termsConditions?: string;
  attachments?: any[];
  companyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrmContract {
  id: string;
  contractNumber: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  customerId?: string;
  customerName?: string;
  contactName?: string;
  contactEmail?: string;
  opportunityId?: string;
  quoteId?: string;
  startDate: string;
  endDate: string;
  signedDate?: string;
  renewalDate?: string;
  contractValue: number;
  currency: string;
  billingCycle?: string;
  autoRenew: boolean;
  renewalTerms?: string;
  renewalNoticeDays?: number;
  ownerId?: string;
  ownerName?: string;
  terms?: string;
  termsAndConditions?: any;
  attachments?: any[];
  notes?: string;
  companyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrmSupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  customerId?: string;
  customerName?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  category?: string;
  subcategory?: string;
  assignedToId?: string;
  assignedToName?: string;
  teamId?: string;
  slaId?: string;
  responseDeadline?: string;
  resolutionDeadline?: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  resolution?: string;
  resolutionNotes?: string;
  customerSatisfaction?: number;
  feedbackNotes?: string;
  relatedTicketId?: string;
  source?: string;
  attachments?: any[];
  tags: string[];
  companyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrmSla {
  id: string;
  slaCode: string;
  name: string;
  description?: string;
  responseTimeHours: number;
  resolutionTimeHours: number;
  priorityTimes?: any;
  businessHoursOnly: boolean;
  businessHoursStart?: string;
  businessHoursEnd?: string;
  excludeWeekends: boolean;
  excludeHolidays: boolean;
  escalationEnabled: boolean;
  escalationRules?: any[];
  customerCategories: string[];
  ticketCategories: string[];
  status: string;
  isDefault: boolean;
  companyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrmKnowledgeArticle {
  id: string;
  articleNumber: string;
  title: string;
  content: string;
  summary?: string;
  category: string;
  subcategory?: string;
  tags: string[];
  status: string;
  publishedDate?: string;
  isPublic: boolean;
  isInternal: boolean;
  authorId?: string;
  authorName?: string;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  relatedArticles: string[];
  relatedTickets: string[];
  attachments?: any[];
  companyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// CRM Service
// ============================================================================

export const crmService = {
  // ===========================
  // CONTACTS
  // ===========================
  contacts: {
    getAll: (filters?: { search?: string; status?: string; department?: string; customerId?: string }) =>
      request<CrmContact[]>(`/crm/contacts${buildQueryParams(filters || {})}`),

    getById: (id: string) => request<CrmContact>(`/crm/contacts/${id}`),

    create: (data: Partial<CrmContact>) =>
      request<CrmContact>('/crm/contacts', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: Partial<CrmContact>) =>
      request<CrmContact>(`/crm/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/contacts/${id}`, { method: 'DELETE' }),

    getStats: () => request<any>('/crm/contacts/stats'),
  },

  // ===========================
  // OPPORTUNITIES
  // ===========================
  opportunities: {
    getAll: (filters?: { search?: string; stage?: string; ownerId?: string; customerId?: string; campaignId?: string }) =>
      request<CrmOpportunity[]>(`/crm/opportunities${buildQueryParams(filters || {})}`),

    getById: (id: string) => request<CrmOpportunity>(`/crm/opportunities/${id}`),

    create: (data: Partial<CrmOpportunity>) =>
      request<CrmOpportunity>('/crm/opportunities', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: Partial<CrmOpportunity>) =>
      request<CrmOpportunity>(`/crm/opportunities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/opportunities/${id}`, { method: 'DELETE' }),

    getStats: () => request<any>('/crm/opportunities/stats'),

    getForecast: () => request<any>('/crm/opportunities/forecast'),

    // Related activity timeline for the opportunity detail view.
    getActivities: (opportunityId: string) =>
      request<any>(`/crm/activities${buildQueryParams({ opportunityId })}`).then(asArray),
  },

  // ===========================
  // ACTIVITIES
  // ===========================
  activities: {
    getAll: (filters?: { search?: string; type?: string; status?: string; assignedToId?: string; leadId?: string; contactId?: string; opportunityId?: string }) =>
      request<CrmActivity[]>(`/crm/activities${buildQueryParams(filters || {})}`),

    getById: (id: string) => request<CrmActivity>(`/crm/activities/${id}`),

    create: (data: Partial<CrmActivity>) =>
      request<CrmActivity>('/crm/activities', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: Partial<CrmActivity>) =>
      request<CrmActivity>(`/crm/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    complete: (id: string) => request<CrmActivity>(`/crm/activities/${id}/complete`, { method: 'POST' }),

    delete: (id: string) => request<void>(`/crm/activities/${id}`, { method: 'DELETE' }),

    getStats: () => request<any>('/crm/activities/stats'),
  },

  // ===========================
  // CAMPAIGNS
  // ===========================
  campaigns: {
    getAll: (filters?: { search?: string; type?: string; status?: string; assignedToId?: string }) =>
      request<CrmCampaign[]>(`/crm/campaigns${buildQueryParams(filters || {})}`),

    getById: (id: string) => request<CrmCampaign>(`/crm/campaigns/${id}`),

    create: (data: Partial<CrmCampaign>) =>
      request<CrmCampaign>('/crm/campaigns', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: Partial<CrmCampaign>) =>
      request<CrmCampaign>(`/crm/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/campaigns/${id}`, { method: 'DELETE' }),

    getStats: () => request<any>('/crm/campaigns/stats'),
  },

  // ===========================
  // QUOTES
  // ===========================
  quotes: {
    getAll: (filters?: { search?: string; status?: string; customerId?: string; opportunityId?: string }) =>
      request<CrmQuote[]>(`/crm/quotes${buildQueryParams(filters || {})}`),

    getById: (id: string) => request<CrmQuote>(`/crm/quotes/${id}`),

    create: (data: Partial<CrmQuote>) =>
      request<CrmQuote>('/crm/quotes', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: Partial<CrmQuote>) =>
      request<CrmQuote>(`/crm/quotes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    send: (id: string) => request<CrmQuote>(`/crm/quotes/${id}/send`, { method: 'POST' }),

    accept: (id: string) => request<CrmQuote>(`/crm/quotes/${id}/accept`, { method: 'POST' }),

    reject: (id: string) => request<CrmQuote>(`/crm/quotes/${id}/reject`, { method: 'POST' }),

    delete: (id: string) => request<void>(`/crm/quotes/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // CONTRACTS
  // ===========================
  contracts: {
    getAll: (filters?: { search?: string; status?: string; type?: string; customerId?: string }) =>
      request<CrmContract[]>(`/crm/contracts${buildQueryParams(filters || {})}`),

    getById: (id: string) => request<CrmContract>(`/crm/contracts/${id}`),

    create: (data: Partial<CrmContract>) =>
      request<CrmContract>('/crm/contracts', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: Partial<CrmContract>) =>
      request<CrmContract>(`/crm/contracts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    activate: (id: string) => request<CrmContract>(`/crm/contracts/${id}/activate`, { method: 'POST' }),

    delete: (id: string) => request<void>(`/crm/contracts/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // SUPPORT TICKETS
  // ===========================
  tickets: {
    getAll: (filters?: { search?: string; status?: string; priority?: string; type?: string; assignedToId?: string; customerId?: string }) =>
      request<CrmSupportTicket[]>(`/crm/tickets${buildQueryParams(filters || {})}`),

    getById: (id: string) => request<CrmSupportTicket>(`/crm/tickets/${id}`),

    create: (data: Partial<CrmSupportTicket>) =>
      request<CrmSupportTicket>('/crm/tickets', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: Partial<CrmSupportTicket>) =>
      request<CrmSupportTicket>(`/crm/tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    resolve: (id: string, resolution: string) =>
      request<CrmSupportTicket>(`/crm/tickets/${id}/resolve`, { method: 'POST', body: JSON.stringify({ resolution }) }),

    close: (id: string) => request<CrmSupportTicket>(`/crm/tickets/${id}/close`, { method: 'POST' }),

    getStats: () => request<any>('/crm/tickets/stats'),
  },

  // ===========================
  // SLA
  // ===========================
  slas: {
    getAll: () => request<CrmSla[]>('/crm/slas'),

    getPerformance: () => request<any[]>('/crm/slas/performance'),

    getById: (id: string) => request<CrmSla>(`/crm/slas/${id}`),

    create: (data: Partial<CrmSla>) =>
      request<CrmSla>('/crm/slas', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: Partial<CrmSla>) =>
      request<CrmSla>(`/crm/slas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/slas/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // KNOWLEDGE ARTICLES
  // ===========================
  knowledgeArticles: {
    getAll: (filters?: { search?: string; status?: string; category?: string; isPublic?: boolean }) =>
      request<CrmKnowledgeArticle[]>(`/crm/knowledge-articles${buildQueryParams(filters || {})}`),

    getById: (id: string) => request<CrmKnowledgeArticle>(`/crm/knowledge-articles/${id}`),

    create: (data: Partial<CrmKnowledgeArticle>) =>
      request<CrmKnowledgeArticle>('/crm/knowledge-articles', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: Partial<CrmKnowledgeArticle>) =>
      request<CrmKnowledgeArticle>(`/crm/knowledge-articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    publish: (id: string) => request<CrmKnowledgeArticle>(`/crm/knowledge-articles/${id}/publish`, { method: 'POST' }),

    markHelpful: (id: string, helpful: boolean) =>
      request<CrmKnowledgeArticle>(`/crm/knowledge-articles/${id}/helpful`, { method: 'POST', body: JSON.stringify({ helpful }) }),
  },

  // ===========================
  // INTERACTIONS (v2 - Prisma-based)
  // ===========================
  interactions: {
    getAll: (filters?: { type?: string; leadId?: string; contactId?: string; customerId?: string; opportunityId?: string }) =>
      request<any[]>(`/crm/interactions-v2${buildQueryParams(filters || {})}`),

    create: (data: any) =>
      request<any>('/crm/interactions-v2', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/interactions-v2/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/interactions-v2/${id}`, { method: 'DELETE' }),

    getStats: () => request<any>('/crm/interactions-v2/stats'),

    // v2 (Prisma) single-record fetch: GET /crm/interactions-v2/:id
    getById: (id: string) => request<any>(`/crm/interactions-v2/${id}`),

    // Legacy TypeORM-backed interactions controller (GET /crm/interactions).
    // Returns a bare array of raw interaction records.
    getAllLegacy: (filters?: { type?: string; customerId?: string; contactId?: string; opportunityId?: string }) =>
      request<any[]>(`/crm/interactions${buildQueryParams(filters || {})}`),

    // Legacy TypeORM-backed single-record fetch: GET /crm/interactions/:id
    getByIdLegacy: (id: string) => request<any>(`/crm/interactions/${id}`),
  },

  // ===========================
  // LEADS (TypeORM-backed: /crm/leads)
  // ===========================
  leads: {
    getAll: (filters?: { search?: string; status?: string; source?: string; assignedToId?: string }) =>
      request<any[]>(`/crm/leads${buildQueryParams(filters || {})}`),

    getById: (id: string) => request<any>(`/crm/leads/${id}`),

    create: (data: any) =>
      request<any>('/crm/leads', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/leads/${id}`, { method: 'DELETE' }),

    getStats: () => request<any>('/crm/leads/stats'),
  },

  // ===========================
  // PRICING RULES (TypeORM-backed: /crm/pricing-rules)
  // ===========================
  pricingRules: {
    getAll: () => request<any[]>('/crm/pricing-rules'),

    getById: (id: string) => request<any>(`/crm/pricing-rules/${id}`),

    create: (data: any) =>
      request<any>('/crm/pricing-rules', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/pricing-rules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/pricing-rules/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // SALES TERRITORIES
  // ===========================
  salesTerritories: {
    getAll: () => request<any[]>('/crm/sales-territories'),

    getById: (id: string) => request<any>(`/crm/sales-territories/${id}`),

    create: (data: any) =>
      request<any>('/crm/sales-territories', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/sales-territories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/sales-territories/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // TERRITORIES (TypeORM-backed sales-territory controller: GET /crm/territories)
  // ===========================
  territories: {
    getAll: () => request<any[]>('/crm/territories'),

    getById: (id: string) => request<any>(`/crm/territories/${id}`),

    create: (data: any) =>
      request<any>('/crm/territories', { method: 'POST', body: JSON.stringify(data) }),
  },

  // ===========================
  // PIPELINE STAGES
  // ===========================
  pipelineStages: {
    getAll: (stageType?: string) =>
      request<any[]>(`/crm/pipeline-stages${buildQueryParams({ stageType })}`),

    create: (data: any) =>
      request<any>('/crm/pipeline-stages', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/pipeline-stages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/pipeline-stages/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // LEAD STATUSES
  // ===========================
  leadStatuses: {
    getAll: () => request<any[]>('/crm/lead-statuses'),

    create: (data: any) =>
      request<any>('/crm/lead-statuses', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/lead-statuses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/lead-statuses/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // LEAD SOURCES
  // ===========================
  leadSources: {
    getAll: () => request<any[]>('/crm/lead-sources'),

    create: (data: any) =>
      request<any>('/crm/lead-sources', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/lead-sources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/lead-sources/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // EMAIL TEMPLATES (marketing)
  // ===========================
  emailTemplates: {
    getAll: (companyId?: string) =>
      request<any[]>(`/crm/email-templates${buildQueryParams({ companyId })}`),

    getById: (id: string) => request<any>(`/crm/email-templates/${id}`),

    create: (data: any) =>
      request<any>('/crm/email-templates', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/email-templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/email-templates/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // SALES ANALYTICS (aggregated from leads)
  // ===========================
  salesAnalytics: {
    getSummary: () => request<any>('/crm/analytics/sales/summary'),
  },

  // ===========================
  // QUOTE TEMPLATES
  // ===========================
  quoteTemplates: {
    getAll: (companyId?: string) =>
      request<any[]>(`/crm/quote-templates${buildQueryParams({ companyId })}`),

    getById: (id: string) => request<any>(`/crm/quote-templates/${id}`),

    create: (data: any) =>
      request<any>('/crm/quote-templates', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/quote-templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/quote-templates/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // CONTRACT TEMPLATES
  // ===========================
  contractTemplates: {
    getAll: (companyId?: string) =>
      request<any[]>(`/crm/contract-templates${buildQueryParams({ companyId })}`),

    getById: (id: string) => request<any>(`/crm/contract-templates/${id}`),

    create: (data: any) =>
      request<any>('/crm/contract-templates', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/contract-templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/contract-templates/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // CAMPAIGN TEMPLATES (email design templates)
  // ===========================
  campaignTemplates: {
    getAll: (companyId?: string) =>
      request<any[]>(`/crm/campaign-templates${buildQueryParams({ companyId })}`),

    getById: (id: string) => request<any>(`/crm/campaign-templates/${id}`),

    create: (data: any) =>
      request<any>('/crm/campaign-templates', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/campaign-templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/campaign-templates/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // SALES TEAMS (settings)
  // ===========================
  salesTeams: {
    getAll: (companyId?: string) =>
      request<any[]>(`/crm/sales-teams${buildQueryParams({ companyId })}`),

    getById: (id: string) => request<any>(`/crm/sales-teams/${id}`),

    create: (data: any) =>
      request<any>('/crm/sales-teams', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/sales-teams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/sales-teams/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // ASSIGNMENT RULES (settings)
  // ===========================
  assignmentRules: {
    getAll: (companyId?: string) =>
      request<any[]>(`/crm/assignment-rules${buildQueryParams({ companyId })}`),

    getById: (id: string) => request<any>(`/crm/assignment-rules/${id}`),

    create: (data: any) =>
      request<any>('/crm/assignment-rules', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/assignment-rules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/assignment-rules/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // CUSTOMER SEGMENTS
  // ===========================
  customerSegments: {
    getAll: (companyId?: string) =>
      request<any[]>(`/crm/customer-segments${buildQueryParams({ companyId })}`),

    getById: (id: string) => request<any>(`/crm/customer-segments/${id}`),

    create: (data: any) =>
      request<any>('/crm/customer-segments', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/customer-segments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/customer-segments/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // CONTACT LISTS
  // ===========================
  contactLists: {
    getAll: (companyId?: string) =>
      request<any[]>(`/crm/contact-lists${buildQueryParams({ companyId })}`),

    getById: (id: string) => request<any>(`/crm/contact-lists/${id}`),

    create: (data: any) =>
      request<any>('/crm/contact-lists', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/contact-lists/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/contact-lists/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // CONTACT ROLES
  // ===========================
  contactRoles: {
    getAll: (companyId?: string) =>
      request<any[]>(`/crm/contact-roles${buildQueryParams({ companyId })}`),

    getById: (id: string) => request<any>(`/crm/contact-roles/${id}`),

    create: (data: any) =>
      request<any>('/crm/contact-roles', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/contact-roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/contact-roles/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // ACTIVITY RECORDS (calls / tasks / emails / meetings)
  // ===========================
  activityRecords: {
    getAll: (filters?: { companyId?: string; type?: string; status?: string }) =>
      request<any[]>(`/crm/activity-records${buildQueryParams(filters || {})}`),

    getById: (id: string) => request<any>(`/crm/activity-records/${id}`),

    create: (data: any) =>
      request<any>('/crm/activity-records', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/activity-records/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/activity-records/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // PIPELINE STAGE CONFIGS (settings/stages)
  // ===========================
  pipelineStageConfigs: {
    getAll: (filters?: { companyId?: string; pipelineType?: string }) =>
      request<any[]>(`/crm/pipeline-stage-configs${buildQueryParams(filters || {})}`),

    getById: (id: string) => request<any>(`/crm/pipeline-stage-configs/${id}`),

    create: (data: any) =>
      request<any>('/crm/pipeline-stage-configs', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/pipeline-stage-configs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/pipeline-stage-configs/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // CRM ANALYTICS (aggregated GETs — no new table)
  // ===========================
  crmAnalytics: {
    getLeadScoring: () => request<any>('/crm/analytics/lead-scoring'),
    getForecast: () => request<any>('/crm/analytics/forecast'),
    getInteractionAnalysis: () => request<any>('/crm/analytics/interaction-analysis'),
  },

  // ===========================
  // CUSTOMERS (second-pass)
  // ===========================
  customers: {
    getAll: (companyId?: string) =>
      request<any[]>(`/crm/customers${buildQueryParams({ companyId })}`),

    getHierarchy: (companyId?: string) =>
      request<any[]>(`/crm/customers/hierarchy${buildQueryParams({ companyId })}`),

    getById: (id: string) => request<any>(`/crm/customers/${id}`),

    create: (data: any) =>
      request<any>('/crm/customers', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/customers/${id}`, { method: 'DELETE' }),

    // Related lists for the customer detail view. There is no dedicated
    // customer-orders/invoices endpoint in the CRM module, so the "orders"
    // panel is fed from the customer's quotes and the activity timeline from
    // the customer's CRM activities (both support ?customerId=).
    getQuotes: (customerId: string) =>
      request<any>(`/crm/quotes${buildQueryParams({ customerId })}`).then(asArray),

    getOpportunities: (customerId: string) =>
      request<any>(`/crm/opportunities${buildQueryParams({ customerId })}`).then(asArray),

    getContacts: (customerId: string) =>
      request<any>(`/crm/contacts${buildQueryParams({ customerId })}`).then(asArray),

    getActivities: (customerId: string) =>
      request<any>(`/crm/activities${buildQueryParams({ customerId })}`).then(asArray),
  },

  // ===========================
  // PRODUCTS (CPQ catalogue — reused for quote line-item picker)
  // ===========================
  products: {
    getAll: (filters?: { search?: string; category?: string; isActive?: string }) =>
      request<any>(`/cpq/products${buildQueryParams(filters || {})}`).then(asArray),

    getById: (id: string) => request<any>(`/cpq/products/${id}`),
  },

  // ===========================
  // PROPOSALS (second-pass)
  // ===========================
  proposals: {
    getAll: (companyId?: string) =>
      request<any[]>(`/crm/proposals${buildQueryParams({ companyId })}`),

    getById: (id: string) => request<any>(`/crm/proposals/${id}`),

    create: (data: any) =>
      request<any>('/crm/proposals', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/proposals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/proposals/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // MARKETING CAMPAIGNS (second-pass)
  // ===========================
  marketingCampaigns: {
    getAll: (companyId?: string) =>
      request<any[]>(`/crm/marketing-campaigns${buildQueryParams({ companyId })}`),

    getById: (id: string) => request<any>(`/crm/marketing-campaigns/${id}`),

    create: (data: any) =>
      request<any>('/crm/marketing-campaigns', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/marketing-campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/marketing-campaigns/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // EMAIL CAMPAIGNS + PERFORMANCE (second-pass)
  // ===========================
  emailCampaigns: {
    getAll: (companyId?: string) =>
      request<any[]>(`/crm/email-campaigns${buildQueryParams({ companyId })}`),

    getPerformance: (companyId?: string) =>
      request<any>(`/crm/email-campaigns/performance${buildQueryParams({ companyId })}`),

    getById: (id: string) => request<any>(`/crm/email-campaigns/${id}`),

    create: (data: any) =>
      request<any>('/crm/email-campaigns', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/email-campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/email-campaigns/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // CONTRACT RENEWALS (second-pass)
  // ===========================
  contractRenewals: {
    getAll: (companyId?: string) =>
      request<any[]>(`/crm/contract-renewals${buildQueryParams({ companyId })}`),

    getById: (id: string) => request<any>(`/crm/contract-renewals/${id}`),

    create: (data: any) =>
      request<any>('/crm/contract-renewals', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/contract-renewals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/contract-renewals/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // CONTRACT AMENDMENTS (second-pass)
  // ===========================
  contractAmendments: {
    getAll: (companyId?: string) =>
      request<any[]>(`/crm/contract-amendments${buildQueryParams({ companyId })}`),

    getById: (id: string) => request<any>(`/crm/contract-amendments/${id}`),

    create: (data: any) =>
      request<any>('/crm/contract-amendments', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
      request<any>(`/crm/contract-amendments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => request<void>(`/crm/contract-amendments/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // OPPORTUNITY VIEWS (second-pass — derived from crm_leads, no new table)
  // ===========================
  opportunityViews: {
    getPipeline: () => request<any>('/crm/opportunities-views/pipeline'),
    getWon: () => request<any>('/crm/opportunities-views/won'),
    getLost: () => request<any>('/crm/opportunities-views/lost'),
  },

  // ===========================
  // CAMPAIGN AUTOMATIONS (follow-up pass)
  // ===========================
  campaignAutomations: {
    getAll: (companyId?: string) =>
      request<any[]>(`/crm/campaign-automations${buildQueryParams({ companyId })}`),
    getById: (id: string) => request<any>(`/crm/campaign-automations/${id}`),
    create: (data: any) =>
      request<any>('/crm/campaign-automations', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/crm/campaign-automations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/crm/campaign-automations/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // APPROVAL WORKFLOWS (follow-up pass — settings/approval-workflows)
  // ===========================
  approvalWorkflows: {
    getAll: (companyId?: string) =>
      request<any[]>(`/crm/approval-workflows${buildQueryParams({ companyId })}`),
    getById: (id: string) => request<any>(`/crm/approval-workflows/${id}`),
    create: (data: any) =>
      request<any>('/crm/approval-workflows', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/crm/approval-workflows/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/crm/approval-workflows/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // CUSTOM FIELDS (follow-up pass — settings/fields)
  // ===========================
  customFields: {
    getAll: (filters?: { companyId?: string; module?: string }) =>
      request<any[]>(`/crm/custom-fields${buildQueryParams(filters || {})}`),
    getById: (id: string) => request<any>(`/crm/custom-fields/${id}`),
    create: (data: any) =>
      request<any>('/crm/custom-fields', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/crm/custom-fields/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/crm/custom-fields/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // TASKS (follow-up pass — advanced-features/task-management)
  // ===========================
  tasks: {
    getAll: (filters?: { companyId?: string; status?: string; assignedToId?: string }) =>
      request<any[]>(`/crm/tasks${buildQueryParams(filters || {})}`),
    getById: (id: string) => request<any>(`/crm/tasks/${id}`),
    create: (data: any) =>
      request<any>('/crm/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/crm/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/crm/tasks/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // PORTAL USERS (follow-up pass — customers/portal)
  // ===========================
  portalUsers: {
    getAll: (companyId?: string) =>
      request<any[]>(`/crm/portal-users${buildQueryParams({ companyId })}`),
    getById: (id: string) => request<any>(`/crm/portal-users/${id}`),
    create: (data: any) =>
      request<any>('/crm/portal-users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/crm/portal-users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/crm/portal-users/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // SOCIAL ACCOUNTS (follow-up pass — integrations/social-media)
  // ===========================
  socialAccounts: {
    getAll: (companyId?: string) =>
      request<any[]>(`/crm/social-accounts${buildQueryParams({ companyId })}`),
    getById: (id: string) => request<any>(`/crm/social-accounts/${id}`),
    create: (data: any) =>
      request<any>('/crm/social-accounts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/crm/social-accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/crm/social-accounts/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // SAVED REPORTS (follow-up pass — analytics/custom)
  // ===========================
  savedReports: {
    getAll: (companyId?: string) =>
      request<any[]>(`/crm/saved-reports${buildQueryParams({ companyId })}`),
    getById: (id: string) => request<any>(`/crm/saved-reports/${id}`),
    create: (data: any) =>
      request<any>('/crm/saved-reports', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/crm/saved-reports/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/crm/saved-reports/${id}`, { method: 'DELETE' }),
  },

  // ===========================
  // CRM ANALYTICS (follow-up pass — aggregated GETs, no new table)
  // ===========================
  analyticsViews: {
    getCustomers: () => request<any>('/crm/analytics/customers'),
    getRevenue: () => request<any>('/crm/analytics/revenue'),
    getTeam: () => request<any>('/crm/analytics/team'),
    getOverview: () => request<any>('/crm/analytics/overview'),
    getPipelineForecast: () => request<any>('/crm/analytics/pipeline-forecast'),
  },
};

export default crmService;
