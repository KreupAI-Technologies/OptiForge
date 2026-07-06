/**
 * Support Service
 * Handles all support-related API operations for omnichannel, knowledge base,
 * AI responses, SLA, CSAT, backlog forecasting, and ITIL workflows
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Interfaces - Support Channels
// ============================================================================

export type ChannelType = 'email' | 'chat' | 'phone' | 'social' | 'portal' | 'whatsapp' | 'video' | 'sms';

export interface SupportChannel {
  id: string;
  code: string;
  name: string;
  type: ChannelType;
  description?: string;
  priority: number;
  isEnabled: boolean;
  autoAssign: boolean;
  defaultTeamId?: string;
  defaultAgentId?: string;
  autoResponseEnabled: boolean;
  autoResponseTemplate?: string;
  slaOverrideId?: string;
  integrationConfig?: Record<string, unknown>;
  ticketCount: number;
  avgResponseTime?: number;
  avgResolutionTime?: number;
  agentsOnline?: number;
  satisfaction?: number;
  volumeToday?: number;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChannelDto {
  code: string;
  name: string;
  type: ChannelType;
  description?: string;
  priority?: number;
  autoAssign?: boolean;
  defaultTeamId?: string;
  defaultAgentId?: string;
  autoResponseEnabled?: boolean;
  autoResponseTemplate?: string;
  slaOverrideId?: string;
  integrationConfig?: Record<string, unknown>;
  companyId: string;
}

// ============================================================================
// Interfaces - Routing Rules
// ============================================================================

export type RoutingStrategy = 'round-robin' | 'skill-based' | 'load-balanced' | 'priority-based' | 'ai-suggested';

export interface RoutingCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'starts_with' | 'ends_with';
  value: string | string[];
}

export interface ChannelRoutingRule {
  id: string;
  name: string;
  description?: string;
  priority: number;
  channelId?: string;
  channel?: SupportChannel;
  conditions: RoutingCondition[];
  assignToTeamId?: string;
  assignToAgentId?: string;
  setPriority?: string;
  setCategory?: string;
  addTags: string[];
  autoResponse?: string;
  escalateAfter?: number;
  activeHoursStart?: string;
  activeHoursEnd?: string;
  activeDays: number[];
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoutingRuleDto {
  name: string;
  description?: string;
  priority?: number;
  channelId?: string;
  conditions: RoutingCondition[];
  assignToTeamId?: string;
  assignToAgentId?: string;
  setPriority?: string;
  setCategory?: string;
  addTags?: string[];
  autoResponse?: string;
  escalateAfter?: number;
  activeHoursStart?: string;
  activeHoursEnd?: string;
  activeDays?: number[];
  companyId: string;
}

// ============================================================================
// Interfaces - Knowledge Base
// ============================================================================

export interface KnowledgeCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  parentId?: string;
  parent?: KnowledgeCategory;
  children?: KnowledgeCategory[];
  icon?: string;
  color?: string;
  displayOrder: number;
  isPublic: boolean;
  isInternal: boolean;
  allowedRoles: string[];
  articleCount: number;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeArticle {
  id: string;
  articleNumber: string;
  title: string;
  content: string;
  summary?: string;
  category: string;
  subcategory?: string;
  tags: string[];
  isPublic: boolean;
  isInternal: boolean;
  status: 'draft' | 'published' | 'archived';
  authorId?: string;
  authorName?: string;
  publishedDate?: Date;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  relatedArticles: string[];
  attachments?: Record<string, unknown>;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateArticleDto {
  title: string;
  content: string;
  summary?: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  isPublic?: boolean;
  isInternal?: boolean;
  authorId?: string;
  authorName?: string;
  relatedArticles?: string[];
  attachments?: Record<string, unknown>;
  companyId: string;
}

// ============================================================================
// Interfaces - AI Response Templates
// ============================================================================

export interface AIResponseTemplate {
  id: string;
  code: string;
  name: string;
  description?: string;
  content: string;
  shortcut?: string;
  category?: string;
  tags: string[];
  ticketTypes: string[];
  ticketCategories: string[];
  ticketPriorities: string[];
  useAiEnhancement: boolean;
  aiPrompt?: string;
  usageCount: number;
  avgRating?: number;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIResponseSuggestion {
  id: string;
  ticketId: string;
  templateId?: string;
  suggestedResponse: string;
  confidence: number;
  usedArticles: string[];
  usedTemplates: string[];
  wasUsed: boolean;
  wasModified: boolean;
  finalResponse?: string;
  agentFeedback?: 'helpful' | 'not_helpful' | 'neutral';
  companyId: string;
  createdAt: Date;
}

// ============================================================================
// Interfaces - CSAT Surveys
// ============================================================================

export interface SurveyQuestion {
  id: string;
  type: 'rating' | 'text' | 'select' | 'multiselect';
  question: string;
  required: boolean;
  scale?: number;
  labels?: Record<number, string>;
  options?: string[];
  maxLength?: number;
  isNPS?: boolean;
}

export interface CSATSurveyTemplate {
  id: string;
  code: string;
  name: string;
  description?: string;
  surveyType: string;
  triggerEvent?: string;
  questions: SurveyQuestion[];
  sendDelay: number;
  expiresAfter: number;
  reminderEnabled: boolean;
  reminderAfter: number;
  headerImage?: string;
  thankYouMessage?: string;
  isDefault: boolean;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CSATSurveyResponse {
  id: string;
  surveyId: string;
  survey?: CSATSurveyTemplate;
  ticketId?: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  responses: Record<string, unknown>;
  overallRating?: number;
  npsScore?: number;
  sentAt: Date;
  openedAt?: Date;
  completedAt?: Date;
  followUpRequired: boolean;
  followUpNotes?: string;
  followUpBy?: string;
  followUpAt?: Date;
  companyId: string;
}

export interface CSATMetrics {
  totalSent: number;
  totalResponses: number;
  responseRate: number;
  csatScore: number;
  avgRating: number;
  nps: number;
  ratingDistribution: Record<number, number>;
}

// ============================================================================
// Interfaces - ITIL
// ============================================================================

export interface ITILIncident {
  id: string;
  incidentNumber: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  category?: string;
  subcategory?: string;
  reportedBy?: string;
  assignedTo?: string;
  assignedTeam?: string;
  relatedTicketId?: string;
  relatedProblemId?: string;
  resolutionCode?: string;
  resolutionNotes?: string;
  resolvedAt?: Date;
  closedAt?: Date;
  reopenedCount: number;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITILProblem {
  id: string;
  problemNumber: string;
  title: string;
  description: string;
  status: 'open' | 'root_cause_identified' | 'known_error' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  rootCause?: string;
  workaround?: string;
  permanentFix?: string;
  affectedCI?: string;
  assignedTo?: string;
  assignedTeam?: string;
  resolvedAt?: Date;
  closedAt?: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITILChange {
  id: string;
  changeNumber: string;
  title: string;
  description: string;
  type: 'standard' | 'normal' | 'emergency';
  status: 'draft' | 'submitted' | 'approved' | 'scheduled' | 'implementing' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  risk: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  category?: string;
  reason?: string;
  implementationPlan?: string;
  backoutPlan?: string;
  testPlan?: string;
  affectedServices?: string[];
  requestedBy?: string;
  assignedTo?: string;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  actualStart?: Date;
  actualEnd?: Date;
  reviewNotes?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Interfaces - Backlog & Settings
// ============================================================================

export interface BacklogSnapshot {
  id: string;
  snapshotDate: Date;
  totalOpen: number;
  newToday: number;
  closedToday: number;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
  byAge: Record<string, number>;
  avgAge: number;
  forecastCloseRate: number;
  forecastClearDate?: Date;
  companyId: string;
}

export interface BacklogForecast {
  currentBacklog: number;
  avgDailyInflow: number;
  avgDailyOutflow: number;
  forecastClearDays: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  byPriority: Record<string, { current: number; forecast7d: number }>;
}

export interface SupportSettings {
  id: string;
  companyId: string;
  ticketPrefix: string;
  autoAssignEnabled: boolean;
  autoAssignStrategy?: string;
  businessHoursStart: string;
  businessHoursEnd: string;
  businessDays: number[];
  timezone: string;
  defaultResponseTime: number;
  defaultResolutionTime: number;
  csatEnabled: boolean;
  csatAutoSend: boolean;
  csatDelay: number;
  csatDefaultTemplate?: string;
  aiSuggestionsEnabled: boolean;
  aiAutoResponse: boolean;
  aiConfidenceThreshold: number;
  itilEnabled: boolean;
  incidentPrefix: string;
  problemPrefix: string;
  changePrefix: string;
  escalationNotifyEmail: boolean;
  escalationNotifySms: boolean;
  breachNotifyEmail: boolean;
  breachNotifySms: boolean;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_CHANNELS: SupportChannel[] = [
  {
    id: 'ch-1',
    code: 'EMAIL',
    name: 'Email Support',
    type: 'email',
    description: 'Customer support via email',
    priority: 3,
    isEnabled: true,
    autoAssign: true,
    autoResponseEnabled: true,
    autoResponseTemplate: 'Thank you for contacting us...',
    ticketCount: 234,
    avgResponseTime: 125,
    avgResolutionTime: 480,
    agentsOnline: 8,
    satisfaction: 4.6,
    volumeToday: 45,
    isActive: true,
    companyId: 'comp-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ch-2',
    code: 'CHAT',
    name: 'Live Chat',
    type: 'chat',
    description: 'Real-time chat support',
    priority: 1,
    isEnabled: true,
    autoAssign: true,
    autoResponseEnabled: false,
    ticketCount: 189,
    avgResponseTime: 3.2,
    avgResolutionTime: 15,
    agentsOnline: 12,
    satisfaction: 4.8,
    volumeToday: 23,
    isActive: true,
    companyId: 'comp-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ch-3',
    code: 'PHONE',
    name: 'Phone Support',
    type: 'phone',
    description: 'Voice support',
    priority: 2,
    isEnabled: true,
    autoAssign: true,
    autoResponseEnabled: false,
    ticketCount: 156,
    avgResponseTime: 5.8,
    avgResolutionTime: 12,
    agentsOnline: 15,
    satisfaction: 4.7,
    volumeToday: 8,
    isActive: true,
    companyId: 'comp-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ch-4',
    code: 'SOCIAL',
    name: 'Social Media',
    type: 'social',
    description: 'Twitter, Facebook support',
    priority: 5,
    isEnabled: true,
    autoAssign: true,
    autoResponseEnabled: false,
    ticketCount: 67,
    avgResponseTime: 45,
    avgResolutionTime: 120,
    agentsOnline: 4,
    satisfaction: 4.5,
    volumeToday: 12,
    isActive: true,
    companyId: 'comp-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ch-5',
    code: 'PORTAL',
    name: 'Self-Service Portal',
    type: 'portal',
    description: 'Customer self-service',
    priority: 4,
    isEnabled: true,
    autoAssign: false,
    autoResponseEnabled: true,
    ticketCount: 345,
    avgResponseTime: 60,
    avgResolutionTime: 240,
    volumeToday: 28,
    isActive: true,
    companyId: 'comp-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const MOCK_ROUTING_RULES: ChannelRoutingRule[] = [
  {
    id: 'rule-1',
    name: 'Critical Priority - Urgent Keywords',
    description: 'Route urgent tickets to high priority',
    priority: 10,
    conditions: [{ field: 'subject', operator: 'contains', value: 'urgent' }],
    setPriority: 'critical',
    escalateAfter: 30,
    addTags: [],
    activeDays: [1, 2, 3, 4, 5],
    isActive: true,
    companyId: 'comp-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'rule-2',
    name: 'Billing Category - Finance Team',
    description: 'Route billing tickets to finance',
    priority: 50,
    conditions: [{ field: 'category', operator: 'equals', value: 'billing' }],
    assignToTeamId: 'finance-team',
    setCategory: 'billing',
    addTags: [],
    activeDays: [1, 2, 3, 4, 5],
    isActive: true,
    companyId: 'comp-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const MOCK_CATEGORIES: KnowledgeCategory[] = [
  {
    id: 'cat-1',
    code: 'GETTING_STARTED',
    name: 'Getting Started',
    description: 'Onboarding and setup guides',
    icon: 'rocket',
    color: '#10B981',
    displayOrder: 1,
    isPublic: true,
    isInternal: false,
    allowedRoles: [],
    articleCount: 15,
    isActive: true,
    companyId: 'comp-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat-2',
    code: 'TROUBLESHOOTING',
    name: 'Troubleshooting',
    description: 'Common issues and solutions',
    icon: 'wrench',
    color: '#F59E0B',
    displayOrder: 2,
    isPublic: true,
    isInternal: false,
    allowedRoles: [],
    articleCount: 42,
    isActive: true,
    companyId: 'comp-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat-3',
    code: 'BILLING',
    name: 'Billing & Payments',
    description: 'Invoicing and payment info',
    icon: 'credit-card',
    color: '#8B5CF6',
    displayOrder: 3,
    isPublic: true,
    isInternal: false,
    allowedRoles: [],
    articleCount: 18,
    isActive: true,
    companyId: 'comp-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const MOCK_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'art-1',
    articleNumber: 'KB-00001',
    title: 'Getting Started with ManufacturingOS',
    content: '# Welcome to ManufacturingOS\n\nThis guide will help you get started...',
    summary: 'Quick start guide for new users',
    category: 'Getting Started',
    tags: ['onboarding', 'setup', 'basics'],
    isPublic: true,
    isInternal: false,
    status: 'published',
    authorName: 'Support Team',
    publishedDate: new Date('2024-01-15'),
    viewCount: 1250,
    helpfulCount: 180,
    notHelpfulCount: 12,
    relatedArticles: ['art-2', 'art-3'],
    isActive: true,
    companyId: 'comp-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'art-2',
    articleNumber: 'KB-00002',
    title: 'How to Reset Your Password',
    content: '# Password Reset\n\nFollow these steps to reset your password...',
    summary: 'Step-by-step password reset guide',
    category: 'Troubleshooting',
    tags: ['password', 'login', 'security'],
    isPublic: true,
    isInternal: false,
    status: 'published',
    authorName: 'Support Team',
    publishedDate: new Date('2024-01-20'),
    viewCount: 3456,
    helpfulCount: 420,
    notHelpfulCount: 8,
    relatedArticles: [],
    isActive: true,
    companyId: 'comp-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const MOCK_TEMPLATES: AIResponseTemplate[] = [
  {
    id: 'tpl-1',
    code: 'GREETING',
    name: 'Standard Greeting',
    description: 'Standard greeting for new tickets',
    content: 'Hello {{customer_name}},\n\nThank you for contacting our support team...',
    shortcut: '/greet',
    category: 'general',
    tags: ['greeting', 'opening'],
    ticketTypes: ['issue', 'question'],
    ticketCategories: [],
    ticketPriorities: [],
    useAiEnhancement: false,
    usageCount: 1234,
    avgRating: 4.8,
    isActive: true,
    companyId: 'comp-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tpl-2',
    code: 'CLOSING',
    name: 'Standard Closing',
    description: 'Standard closing for resolved tickets',
    content: 'If you have any further questions, please don\'t hesitate to reach out...',
    shortcut: '/close',
    category: 'general',
    tags: ['closing', 'resolution'],
    ticketTypes: [],
    ticketCategories: [],
    ticketPriorities: [],
    useAiEnhancement: false,
    usageCount: 987,
    avgRating: 4.7,
    isActive: true,
    companyId: 'comp-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const MOCK_CSAT_METRICS: CSATMetrics = {
  totalSent: 1450,
  totalResponses: 1234,
  responseRate: 85,
  csatScore: 92,
  avgRating: 4.7,
  nps: 72,
  ratingDistribution: { 1: 12, 2: 25, 3: 89, 4: 345, 5: 763 },
};

const MOCK_BACKLOG_FORECAST: BacklogForecast = {
  currentBacklog: 156,
  avgDailyInflow: 45,
  avgDailyOutflow: 52,
  forecastClearDays: 22,
  trend: 'decreasing',
  byPriority: {
    critical: { current: 8, forecast7d: 3 },
    high: { current: 34, forecast7d: 28 },
    medium: { current: 78, forecast7d: 65 },
    low: { current: 36, forecast7d: 30 },
  },
};

const MOCK_SETTINGS: SupportSettings = {
  id: 'settings-1',
  companyId: 'comp-1',
  ticketPrefix: 'TKT',
  autoAssignEnabled: true,
  autoAssignStrategy: 'round-robin',
  businessHoursStart: '09:00',
  businessHoursEnd: '18:00',
  businessDays: [1, 2, 3, 4, 5],
  timezone: 'Asia/Kolkata',
  defaultResponseTime: 240,
  defaultResolutionTime: 1440,
  csatEnabled: true,
  csatAutoSend: true,
  csatDelay: 60,
  aiSuggestionsEnabled: true,
  aiAutoResponse: false,
  aiConfidenceThreshold: 0.8,
  itilEnabled: true,
  incidentPrefix: 'INC',
  problemPrefix: 'PRB',
  changePrefix: 'CHG',
  escalationNotifyEmail: true,
  escalationNotifySms: false,
  breachNotifyEmail: true,
  breachNotifySms: false,
};

// ============================================================================
// API Helper
// ============================================================================

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// ============================================================================
// Channel Service
// ============================================================================

export const ChannelService = {
  async getChannels(companyId: string): Promise<SupportChannel[]> {
    if (USE_MOCK_DATA) {
      return Promise.resolve(MOCK_CHANNELS);
    }
    return apiRequest<SupportChannel[]>(`/api/support/channels?companyId=${companyId}`);
  },

  async getChannelById(id: string): Promise<SupportChannel> {
    if (USE_MOCK_DATA) {
      const channel = MOCK_CHANNELS.find(c => c.id === id);
      if (!channel) throw new Error('Channel not found');
      return Promise.resolve(channel);
    }
    return apiRequest<SupportChannel>(`/api/support/channels/${id}`);
  },

  async createChannel(data: CreateChannelDto): Promise<SupportChannel> {
    if (USE_MOCK_DATA) {
      const newChannel: SupportChannel = {
        id: `ch-${Date.now()}`,
        ...data,
        type: data.type,
        priority: data.priority || 5,
        isEnabled: true,
        autoAssign: data.autoAssign || false,
        autoResponseEnabled: data.autoResponseEnabled || false,
        ticketCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_CHANNELS.push(newChannel);
      return Promise.resolve(newChannel);
    }
    return apiRequest<SupportChannel>('/api/support/channels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateChannel(id: string, data: Partial<SupportChannel>): Promise<SupportChannel> {
    if (USE_MOCK_DATA) {
      const index = MOCK_CHANNELS.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Channel not found');
      MOCK_CHANNELS[index] = { ...MOCK_CHANNELS[index], ...data, updatedAt: new Date() };
      return Promise.resolve(MOCK_CHANNELS[index]);
    }
    return apiRequest<SupportChannel>(`/api/support/channels/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteChannel(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      const index = MOCK_CHANNELS.findIndex(c => c.id === id);
      if (index !== -1) MOCK_CHANNELS[index].isActive = false;
      return Promise.resolve();
    }
    return apiRequest(`/api/support/channels/${id}`, { method: 'DELETE' });
  },

  async getChannelAnalytics(companyId: string): Promise<{
    channels: (SupportChannel & { percentage: number })[];
    totalTickets: number;
    byType: Record<string, number>;
  }> {
    if (USE_MOCK_DATA) {
      const totalTickets = MOCK_CHANNELS.reduce((sum, ch) => sum + ch.ticketCount, 0);
      return Promise.resolve({
        channels: MOCK_CHANNELS.map(ch => ({
          ...ch,
          percentage: Math.round((ch.ticketCount / totalTickets) * 100),
        })),
        totalTickets,
        byType: MOCK_CHANNELS.reduce((acc, ch) => {
          acc[ch.type] = (acc[ch.type] || 0) + ch.ticketCount;
          return acc;
        }, {} as Record<string, number>),
      });
    }
    return apiRequest(`/api/support/channels/analytics?companyId=${companyId}`);
  },
};

// ============================================================================
// Routing Rule Service
// ============================================================================

export const RoutingRuleService = {
  async getRules(companyId: string, channelId?: string): Promise<ChannelRoutingRule[]> {
    if (USE_MOCK_DATA) {
      let rules = MOCK_ROUTING_RULES;
      if (channelId) {
        rules = rules.filter(r => r.channelId === channelId);
      }
      return Promise.resolve(rules);
    }
    const params = new URLSearchParams({ companyId });
    if (channelId) params.append('channelId', channelId);
    return apiRequest<ChannelRoutingRule[]>(`/api/support/routing-rules?${params}`);
  },

  async getRuleById(id: string): Promise<ChannelRoutingRule> {
    if (USE_MOCK_DATA) {
      const rule = MOCK_ROUTING_RULES.find(r => r.id === id);
      if (!rule) throw new Error('Rule not found');
      return Promise.resolve(rule);
    }
    return apiRequest<ChannelRoutingRule>(`/api/support/routing-rules/${id}`);
  },

  async createRule(data: CreateRoutingRuleDto): Promise<ChannelRoutingRule> {
    if (USE_MOCK_DATA) {
      const newRule: ChannelRoutingRule = {
        id: `rule-${Date.now()}`,
        ...data,
        priority: data.priority || 100,
        addTags: data.addTags || [],
        activeDays: data.activeDays || [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_ROUTING_RULES.push(newRule);
      return Promise.resolve(newRule);
    }
    return apiRequest<ChannelRoutingRule>('/api/support/routing-rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateRule(id: string, data: Partial<ChannelRoutingRule>): Promise<ChannelRoutingRule> {
    if (USE_MOCK_DATA) {
      const index = MOCK_ROUTING_RULES.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Rule not found');
      MOCK_ROUTING_RULES[index] = { ...MOCK_ROUTING_RULES[index], ...data, updatedAt: new Date() };
      return Promise.resolve(MOCK_ROUTING_RULES[index]);
    }
    return apiRequest<ChannelRoutingRule>(`/api/support/routing-rules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteRule(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      const index = MOCK_ROUTING_RULES.findIndex(r => r.id === id);
      if (index !== -1) MOCK_ROUTING_RULES[index].isActive = false;
      return Promise.resolve();
    }
    return apiRequest(`/api/support/routing-rules/${id}`, { method: 'DELETE' });
  },

  async evaluateRouting(ticket: {
    channel: string;
    subject: string;
    category?: string;
    priority?: string;
    customerId?: string;
    tags?: string[];
  }, companyId: string): Promise<{
    assignToTeamId?: string;
    assignToAgentId?: string;
    priority?: string;
    category?: string;
    tags?: string[];
    autoResponse?: string;
  } | null> {
    if (USE_MOCK_DATA) {
      // Simple mock evaluation
      if (ticket.subject.toLowerCase().includes('urgent')) {
        return Promise.resolve({ priority: 'critical', tags: ['urgent'] });
      }
      return Promise.resolve(null);
    }
    return apiRequest(`/api/support/routing-rules/evaluate`, {
      method: 'POST',
      body: JSON.stringify({ ticket, companyId }),
    });
  },
};

// ============================================================================
// Knowledge Base Service
// ============================================================================

export const KnowledgeBaseService = {
  async getCategories(companyId: string, options?: {
    parentId?: string | null;
    isPublic?: boolean;
  }): Promise<KnowledgeCategory[]> {
    if (USE_MOCK_DATA) {
      let categories = MOCK_CATEGORIES;
      if (options?.isPublic !== undefined) {
        categories = categories.filter(c => c.isPublic === options.isPublic);
      }
      return Promise.resolve(categories);
    }
    const params = new URLSearchParams({ companyId });
    if (options?.parentId) params.append('parentId', options.parentId);
    if (options?.isPublic !== undefined) params.append('isPublic', String(options.isPublic));
    return apiRequest<KnowledgeCategory[]>(`/api/support/knowledge/categories?${params}`);
  },

  async getCategoryById(id: string): Promise<KnowledgeCategory> {
    if (USE_MOCK_DATA) {
      const cat = MOCK_CATEGORIES.find(c => c.id === id);
      if (!cat) throw new Error('Category not found');
      return Promise.resolve(cat);
    }
    return apiRequest<KnowledgeCategory>(`/api/support/knowledge/categories/${id}`);
  },

  async getArticles(companyId: string, options?: {
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: KnowledgeArticle[]; total: number; page: number; limit: number }> {
    if (USE_MOCK_DATA) {
      let articles = MOCK_ARTICLES;
      if (options?.category) {
        articles = articles.filter(a => a.category === options.category);
      }
      if (options?.search) {
        const search = options.search.toLowerCase();
        articles = articles.filter(a =>
          a.title.toLowerCase().includes(search) ||
          a.content.toLowerCase().includes(search)
        );
      }
      return Promise.resolve({
        data: articles,
        total: articles.length,
        page: options?.page || 1,
        limit: options?.limit || 20,
      });
    }
    const params = new URLSearchParams({ companyId });
    if (options?.category) params.append('category', options.category);
    if (options?.status) params.append('status', options.status);
    if (options?.search) params.append('search', options.search);
    if (options?.page) params.append('page', String(options.page));
    if (options?.limit) params.append('limit', String(options.limit));
    return apiRequest(`/api/support/knowledge/articles?${params}`);
  },

  async getArticleById(id: string): Promise<KnowledgeArticle> {
    if (USE_MOCK_DATA) {
      const article = MOCK_ARTICLES.find(a => a.id === id);
      if (!article) throw new Error('Article not found');
      return Promise.resolve(article);
    }
    return apiRequest<KnowledgeArticle>(`/api/support/knowledge/articles/${id}`);
  },

  async createArticle(data: CreateArticleDto): Promise<KnowledgeArticle> {
    if (USE_MOCK_DATA) {
      const newArticle: KnowledgeArticle = {
        id: `art-${Date.now()}`,
        articleNumber: `KB-${String(MOCK_ARTICLES.length + 1).padStart(5, '0')}`,
        ...data,
        tags: data.tags || [],
        isPublic: data.isPublic ?? false,
        isInternal: data.isInternal ?? true,
        status: 'draft',
        viewCount: 0,
        helpfulCount: 0,
        notHelpfulCount: 0,
        relatedArticles: data.relatedArticles || [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_ARTICLES.push(newArticle);
      return Promise.resolve(newArticle);
    }
    return apiRequest<KnowledgeArticle>('/api/support/knowledge/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateArticle(id: string, data: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> {
    if (USE_MOCK_DATA) {
      const index = MOCK_ARTICLES.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Article not found');
      MOCK_ARTICLES[index] = { ...MOCK_ARTICLES[index], ...data, updatedAt: new Date() };
      return Promise.resolve(MOCK_ARTICLES[index]);
    }
    return apiRequest<KnowledgeArticle>(`/api/support/knowledge/articles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async publishArticle(id: string): Promise<KnowledgeArticle> {
    if (USE_MOCK_DATA) {
      const index = MOCK_ARTICLES.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Article not found');
      MOCK_ARTICLES[index].status = 'published';
      MOCK_ARTICLES[index].publishedDate = new Date();
      return Promise.resolve(MOCK_ARTICLES[index]);
    }
    return apiRequest<KnowledgeArticle>(`/api/support/knowledge/articles/${id}/publish`, {
      method: 'POST',
    });
  },

  async rateArticle(id: string, helpful: boolean): Promise<void> {
    if (USE_MOCK_DATA) {
      const index = MOCK_ARTICLES.findIndex(a => a.id === id);
      if (index !== -1) {
        if (helpful) {
          MOCK_ARTICLES[index].helpfulCount++;
        } else {
          MOCK_ARTICLES[index].notHelpfulCount++;
        }
      }
      return Promise.resolve();
    }
    return apiRequest(`/api/support/knowledge/articles/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ helpful }),
    });
  },

  async searchArticles(companyId: string, query: string, limit = 10): Promise<KnowledgeArticle[]> {
    if (USE_MOCK_DATA) {
      const search = query.toLowerCase();
      return Promise.resolve(
        MOCK_ARTICLES.filter(a =>
          a.status === 'published' &&
          (a.title.toLowerCase().includes(search) ||
           a.content.toLowerCase().includes(search) ||
           a.tags.some(t => t.toLowerCase().includes(search)))
        ).slice(0, limit)
      );
    }
    return apiRequest<KnowledgeArticle[]>(
      `/api/support/knowledge/articles/search?companyId=${companyId}&query=${query}&limit=${limit}`
    );
  },

  async getPopularArticles(companyId: string, limit = 10): Promise<KnowledgeArticle[]> {
    if (USE_MOCK_DATA) {
      return Promise.resolve(
        [...MOCK_ARTICLES]
          .filter(a => a.status === 'published')
          .sort((a, b) => b.viewCount - a.viewCount)
          .slice(0, limit)
      );
    }
    return apiRequest<KnowledgeArticle[]>(
      `/api/support/knowledge/articles/popular?companyId=${companyId}&limit=${limit}`
    );
  },
};

// ============================================================================
// AI Response Service
// ============================================================================

export const AIResponseService = {
  async getTemplates(companyId: string, options?: {
    category?: string;
    ticketType?: string;
  }): Promise<AIResponseTemplate[]> {
    if (USE_MOCK_DATA) {
      let templates = MOCK_TEMPLATES;
      if (options?.category) {
        templates = templates.filter(t => t.category === options.category);
      }
      return Promise.resolve(templates);
    }
    const params = new URLSearchParams({ companyId });
    if (options?.category) params.append('category', options.category);
    if (options?.ticketType) params.append('ticketType', options.ticketType);
    return apiRequest<AIResponseTemplate[]>(`/api/support/ai/templates?${params}`);
  },

  async getTemplateById(id: string): Promise<AIResponseTemplate> {
    if (USE_MOCK_DATA) {
      const template = MOCK_TEMPLATES.find(t => t.id === id);
      if (!template) throw new Error('Template not found');
      return Promise.resolve(template);
    }
    return apiRequest<AIResponseTemplate>(`/api/support/ai/templates/${id}`);
  },

  async getTemplateByShortcut(shortcut: string, companyId: string): Promise<AIResponseTemplate | null> {
    if (USE_MOCK_DATA) {
      return Promise.resolve(MOCK_TEMPLATES.find(t => t.shortcut === shortcut) || null);
    }
    return apiRequest<AIResponseTemplate | null>(
      `/api/support/ai/templates/shortcut?shortcut=${shortcut}&companyId=${companyId}`
    );
  },

  async generateSuggestion(ticketId: string, context: {
    subject: string;
    description: string;
    category?: string;
    priority?: string;
  }, companyId: string): Promise<AIResponseSuggestion> {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        id: `sug-${Date.now()}`,
        ticketId,
        suggestedResponse: `Thank you for reaching out regarding "${context.subject}".\n\nWe understand your concern and will look into this matter promptly.`,
        confidence: 0.85,
        usedArticles: ['art-1'],
        usedTemplates: ['tpl-1'],
        wasUsed: false,
        wasModified: false,
        companyId,
        createdAt: new Date(),
      });
    }
    return apiRequest<AIResponseSuggestion>('/api/support/ai/suggest', {
      method: 'POST',
      body: JSON.stringify({ ticketId, context, companyId }),
    });
  },

  async recordSuggestionUsage(suggestionId: string, data: {
    wasUsed: boolean;
    wasModified?: boolean;
    finalResponse?: string;
    feedback?: 'helpful' | 'not_helpful' | 'neutral';
  }): Promise<void> {
    if (USE_MOCK_DATA) {
      return Promise.resolve();
    }
    return apiRequest(`/api/support/ai/suggestions/${suggestionId}/usage`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// CSAT Service
// ============================================================================

export const CSATService = {
  async getSurveyTemplates(companyId: string): Promise<CSATSurveyTemplate[]> {
    if (USE_MOCK_DATA) {
      return Promise.resolve([{
        id: 'survey-1',
        code: 'DEFAULT',
        name: 'Post-Resolution Survey',
        description: 'Default survey after ticket resolution',
        surveyType: 'post_resolution',
        triggerEvent: 'ticket_closed',
        questions: [
          { id: 'q1', type: 'rating', question: 'How satisfied are you?', required: true, scale: 5, labels: { 1: 'Very Unsatisfied', 5: 'Very Satisfied' } },
          { id: 'q2', type: 'rating', question: 'How likely to recommend?', required: true, scale: 10, isNPS: true },
          { id: 'q3', type: 'text', question: 'What could we improve?', required: false, maxLength: 500 },
        ],
        sendDelay: 60,
        expiresAfter: 168,
        reminderEnabled: true,
        reminderAfter: 48,
        thankYouMessage: 'Thank you for your feedback!',
        isDefault: true,
        isActive: true,
        companyId: 'comp-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }]);
    }
    return apiRequest<CSATSurveyTemplate[]>(`/api/support/csat/templates?companyId=${companyId}`);
  },

  async getMetrics(companyId: string, options?: {
    fromDate?: Date;
    toDate?: Date;
    surveyId?: string;
  }): Promise<CSATMetrics> {
    if (USE_MOCK_DATA) {
      return Promise.resolve(MOCK_CSAT_METRICS);
    }
    const params = new URLSearchParams({ companyId });
    if (options?.fromDate) params.append('fromDate', options.fromDate.toISOString());
    if (options?.toDate) params.append('toDate', options.toDate.toISOString());
    if (options?.surveyId) params.append('surveyId', options.surveyId);
    return apiRequest<CSATMetrics>(`/api/support/csat/metrics?${params}`);
  },

  async getTrend(companyId: string, days = 30): Promise<{
    date: string;
    responses: number;
    avgRating: number;
  }[]> {
    if (USE_MOCK_DATA) {
      const trend = [];
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        trend.push({
          date: date.toISOString().split('T')[0],
          responses: Math.floor(Math.random() * 50) + 20,
          avgRating: 4.2 + Math.random() * 0.6,
        });
      }
      return Promise.resolve(trend);
    }
    return apiRequest(`/api/support/csat/trend?companyId=${companyId}&days=${days}`);
  },

  async sendSurvey(data: {
    surveyId: string;
    ticketId?: string;
    customerId?: string;
    customerEmail?: string;
    customerName?: string;
    companyId: string;
  }): Promise<CSATSurveyResponse> {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        id: `resp-${Date.now()}`,
        surveyId: data.surveyId,
        ticketId: data.ticketId,
        customerId: data.customerId,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        responses: {},
        sentAt: new Date(),
        followUpRequired: false,
        companyId: data.companyId,
      });
    }
    return apiRequest<CSATSurveyResponse>('/api/support/csat/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getResponses(companyId: string, options?: {
    surveyId?: string;
    completed?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: CSATSurveyResponse[]; total: number }> {
    if (USE_MOCK_DATA) {
      return Promise.resolve({ data: [], total: 0 });
    }
    const params = new URLSearchParams({ companyId });
    if (options?.surveyId) params.append('surveyId', options.surveyId);
    if (options?.completed !== undefined) params.append('completed', String(options.completed));
    if (options?.page) params.append('page', String(options.page));
    if (options?.limit) params.append('limit', String(options.limit));
    return apiRequest(`/api/support/csat/responses?${params}`);
  },
};

// ============================================================================
// Backlog Service
// ============================================================================

export const BacklogService = {
  async getForecast(companyId: string): Promise<BacklogForecast> {
    if (USE_MOCK_DATA) {
      return Promise.resolve(MOCK_BACKLOG_FORECAST);
    }
    return apiRequest<BacklogForecast>(`/api/support/backlog/forecast?companyId=${companyId}`);
  },

  async getSnapshots(companyId: string, days = 30): Promise<BacklogSnapshot[]> {
    if (USE_MOCK_DATA) {
      const snapshots: BacklogSnapshot[] = [];
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        snapshots.push({
          id: `snap-${i}`,
          snapshotDate: date,
          totalOpen: 150 + Math.floor(Math.random() * 20),
          newToday: 40 + Math.floor(Math.random() * 15),
          closedToday: 45 + Math.floor(Math.random() * 15),
          byPriority: { critical: 5, high: 30, medium: 80, low: 35 },
          byCategory: { billing: 40, technical: 60, general: 50 },
          byAge: { '0-1d': 30, '1-3d': 50, '3-7d': 40, '7d+': 30 },
          avgAge: 2.5,
          forecastCloseRate: 52,
          companyId: 'comp-1',
        });
      }
      return Promise.resolve(snapshots);
    }
    return apiRequest<BacklogSnapshot[]>(`/api/support/backlog/snapshots?companyId=${companyId}&days=${days}`);
  },

  async getWorkloadAnalysis(companyId: string): Promise<{
    byTeam: Record<string, { assigned: number; capacity: number; utilization: number }>;
    byAgent: Record<string, { assigned: number; avgResolutionTime: number }>;
    recommendations: string[];
  }> {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        byTeam: {
          'Technical Support': { assigned: 45, capacity: 50, utilization: 90 },
          'Billing': { assigned: 30, capacity: 40, utilization: 75 },
          'General': { assigned: 35, capacity: 45, utilization: 78 },
        },
        byAgent: {},
        recommendations: [
          'Technical Support team is near capacity. Consider redistributing load.',
          'Average resolution time trending upward. Review complex tickets.',
        ],
      });
    }
    return apiRequest(`/api/support/backlog/workload?companyId=${companyId}`);
  },
};

// ============================================================================
// ITIL Service
// ============================================================================

export const ITILService = {
  // Incidents
  async getIncidents(companyId: string, options?: {
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: ITILIncident[]; total: number }> {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: [{
          id: 'inc-1',
          incidentNumber: 'INC-00001',
          title: 'Email service unavailable',
          description: 'Users unable to access email',
          impact: 'high',
          urgency: 'high',
          priority: 'critical',
          status: 'in_progress',
          category: 'Infrastructure',
          assignedTeam: 'IT Operations',
          reopenedCount: 0,
          companyId: 'comp-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        }],
        total: 1,
      });
    }
    const params = new URLSearchParams({ companyId });
    if (options?.status) params.append('status', options.status);
    if (options?.priority) params.append('priority', options.priority);
    return apiRequest(`/support/itil/incidents?${params}`);
  },

  async createIncident(data: Partial<ITILIncident> & { companyId: string }): Promise<ITILIncident> {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        id: `inc-${Date.now()}`,
        incidentNumber: `INC-${String(Date.now()).slice(-5)}`,
        title: data.title || '',
        description: data.description || '',
        impact: data.impact || 'medium',
        urgency: data.urgency || 'medium',
        priority: data.priority || 'medium',
        status: 'open',
        category: data.category,
        assignedTo: data.assignedTo,
        assignedTeam: data.assignedTeam,
        reopenedCount: 0,
        companyId: data.companyId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return apiRequest<ITILIncident>('/support/itil/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Problems
  async getProblems(companyId: string, options?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: ITILProblem[]; total: number }> {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: [{
          id: 'prb-1',
          problemNumber: 'PRB-00001',
          title: 'Recurring email service failures',
          description: 'Multiple incidents related to email',
          status: 'root_cause_identified',
          priority: 'high',
          category: 'Infrastructure',
          rootCause: 'Memory leak in email server',
          workaround: 'Restart service every 6 hours',
          assignedTeam: 'IT Operations',
          companyId: 'comp-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        }],
        total: 1,
      });
    }
    const params = new URLSearchParams({ companyId });
    if (options?.status) params.append('status', options.status);
    return apiRequest(`/support/itil/problems?${params}`);
  },

  async createProblem(data: Partial<ITILProblem> & { companyId: string }): Promise<ITILProblem> {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        id: `prb-${Date.now()}`,
        problemNumber: `PRB-${String(Date.now()).slice(-5)}`,
        title: data.title || '',
        description: data.description || '',
        status: 'open',
        priority: data.priority || 'medium',
        category: data.category,
        assignedTo: data.assignedTo,
        assignedTeam: data.assignedTeam,
        companyId: data.companyId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return apiRequest<ITILProblem>('/support/itil/problems', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Changes
  async getChanges(companyId: string, options?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: ITILChange[]; total: number }> {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: [{
          id: 'chg-1',
          changeNumber: 'CHG-00001',
          title: 'Email server upgrade',
          description: 'Upgrade email server to fix memory leak',
          type: 'normal',
          status: 'approved',
          priority: 'high',
          risk: 'medium',
          impact: 'high',
          category: 'Infrastructure',
          implementationPlan: 'Upgrade during maintenance window',
          backoutPlan: 'Restore from backup',
          affectedServices: ['Email', 'Calendar'],
          scheduledStart: new Date(),
          scheduledEnd: new Date(),
          companyId: 'comp-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        }],
        total: 1,
      });
    }
    const params = new URLSearchParams({ companyId });
    if (options?.status) params.append('status', options.status);
    if (options?.type) params.append('type', options.type);
    return apiRequest(`/support/itil/changes?${params}`);
  },

  async createChange(data: Partial<ITILChange> & { companyId: string }): Promise<ITILChange> {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        id: `chg-${Date.now()}`,
        changeNumber: `CHG-${String(Date.now()).slice(-5)}`,
        title: data.title || '',
        description: data.description || '',
        type: data.type || 'normal',
        status: 'draft',
        priority: data.priority || 'medium',
        risk: data.risk || 'medium',
        impact: data.impact || 'medium',
        category: data.category,
        implementationPlan: data.implementationPlan,
        backoutPlan: data.backoutPlan,
        testPlan: data.testPlan,
        affectedServices: data.affectedServices || [],
        requestedBy: data.requestedBy,
        assignedTo: data.assignedTo,
        scheduledStart: data.scheduledStart,
        scheduledEnd: data.scheduledEnd,
        companyId: data.companyId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return apiRequest<ITILChange>('/support/itil/changes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async approveChange(id: string, approver: string, notes?: string): Promise<ITILChange> {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        id,
        changeNumber: 'CHG-00001',
        title: 'Email server upgrade',
        description: 'Upgrade email server',
        type: 'normal',
        status: 'approved',
        priority: 'high',
        risk: 'medium',
        impact: 'high',
        companyId: 'comp-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return apiRequest<ITILChange>(`/support/itil/changes/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approver, notes }),
    });
  },
};

// ============================================================================
// Settings Service
// ============================================================================

export const SupportSettingsService = {
  async getSettings(companyId: string): Promise<SupportSettings> {
    if (USE_MOCK_DATA) {
      return Promise.resolve(MOCK_SETTINGS);
    }
    return apiRequest<SupportSettings>(`/api/support/settings?companyId=${companyId}`);
  },

  async updateSettings(companyId: string, data: Partial<SupportSettings>): Promise<SupportSettings> {
    if (USE_MOCK_DATA) {
      return Promise.resolve({ ...MOCK_SETTINGS, ...data });
    }
    return apiRequest<SupportSettings>(`/api/support/settings`, {
      method: 'PATCH',
      body: JSON.stringify({ companyId, ...data }),
    });
  },

  async isWithinBusinessHours(companyId: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      const now = new Date();
      const day = now.getDay() || 7;
      const hour = now.getHours();
      return Promise.resolve(MOCK_SETTINGS.businessDays.includes(day) && hour >= 9 && hour < 18);
    }
    return apiRequest<boolean>(`/api/support/settings/business-hours?companyId=${companyId}`);
  },
};

// ============================================================================
// Ticket Category Service (net-new: /support/tickets/categories)
// ============================================================================

export interface SupportTicketCategory {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  color?: string;
  ticketCount: number;
  avgResolutionTime?: string;
  slaTarget?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const TicketCategoryService = {
  async getCategories(companyId = 'company-1'): Promise<SupportTicketCategory[]> {
    return apiRequest<SupportTicketCategory[]>(
      `/support/tickets/categories?companyId=${encodeURIComponent(companyId)}`
    );
  },

  async createCategory(
    data: Partial<SupportTicketCategory> & { companyId?: string }
  ): Promise<SupportTicketCategory> {
    return apiRequest<SupportTicketCategory>('/support/tickets/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(
    id: string,
    data: Partial<SupportTicketCategory>
  ): Promise<SupportTicketCategory> {
    return apiRequest<SupportTicketCategory>(`/support/tickets/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/support/tickets/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Response Template Service (net-new: /support/automation/responses)
// ============================================================================

export interface SupportResponseTemplate {
  id: string;
  companyId: string;
  name: string;
  category?: string;
  subject?: string;
  body?: string;
  trigger?: { type: string; conditions: string[] };
  language: string;
  active: boolean;
  usageCount: number;
  effectivenessRate: number;
  avgResponseTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const ResponseTemplateService = {
  async getTemplates(
    companyId = 'company-1',
    options?: { category?: string; active?: boolean }
  ): Promise<SupportResponseTemplate[]> {
    const params = new URLSearchParams({ companyId });
    if (options?.category) params.append('category', options.category);
    if (options?.active !== undefined) params.append('active', String(options.active));
    return apiRequest<SupportResponseTemplate[]>(
      `/support/automation/responses?${params.toString()}`
    );
  },

  async createTemplate(
    data: Partial<SupportResponseTemplate> & { companyId?: string }
  ): Promise<SupportResponseTemplate> {
    return apiRequest<SupportResponseTemplate>('/support/automation/responses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTemplate(
    id: string,
    data: Partial<SupportResponseTemplate>
  ): Promise<SupportResponseTemplate> {
    return apiRequest<SupportResponseTemplate>(`/support/automation/responses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTemplate(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/support/automation/responses/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// SLA Settings Service (net-new: /support/sla/settings)
// ============================================================================

export interface SupportSlaSettingRecord {
  id?: string;
  companyId: string;
  slaConfigs: Array<Record<string, unknown>>;
  businessHours: Array<Record<string, unknown>>;
  escalationRules: Array<Record<string, unknown>>;
  notifications: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export const SlaSettingsService = {
  async getSlaSettings(companyId = 'company-1'): Promise<SupportSlaSettingRecord> {
    return apiRequest<SupportSlaSettingRecord>(
      `/support/sla/settings?companyId=${encodeURIComponent(companyId)}`
    );
  },

  async saveSlaSettings(
    data: Partial<SupportSlaSettingRecord> & { companyId?: string }
  ): Promise<SupportSlaSettingRecord> {
    return apiRequest<SupportSlaSettingRecord>('/support/sla/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// Team Agents Service (net-new: /support/team/agents)
// ============================================================================

export interface SupportAgentRecord {
  id: string;
  companyId: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  team?: string;
  status: string;
  avatar?: string;
  joinDate?: string;
  location?: string;
  shift?: string;
  activeTickets: number;
  resolvedToday: number;
  resolvedThisMonth: number;
  avgResolutionTime?: string;
  satisfaction: number;
  responseTime?: string;
  slaCompliance: number;
  skills?: string[];
  specializations?: string[];
  certifications?: string[];
  performance?: { thisMonth: number; lastMonth: number; trend: string };
  createdAt?: string;
  updatedAt?: string;
}

export const SupportAgentService = {
  async getAgents(companyId = 'company-1'): Promise<SupportAgentRecord[]> {
    return apiRequest<SupportAgentRecord[]>(
      `/support/team/agents?companyId=${encodeURIComponent(companyId)}`
    );
  },
  async createAgent(
    data: Partial<SupportAgentRecord> & { companyId?: string }
  ): Promise<SupportAgentRecord> {
    return apiRequest<SupportAgentRecord>('/support/team/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateAgent(
    id: string,
    data: Partial<SupportAgentRecord>
  ): Promise<SupportAgentRecord> {
    return apiRequest<SupportAgentRecord>(`/support/team/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteAgent(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/support/team/agents/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Agent Skills Service (net-new: /support/team/skills)
// ============================================================================

export interface SupportAgentSkillRecord {
  id: string;
  companyId: string;
  agentId?: string;
  agentName: string;
  team?: string;
  avatar?: string;
  skills?: Array<{
    category: string;
    skillName: string;
    level: string;
    yearsExperience: number;
    certifications: string[];
    lastUpdated: string;
  }>;
  totalSkills: number;
  expertLevel: number;
  certifications: number;
  createdAt?: string;
  updatedAt?: string;
}

export const SupportAgentSkillService = {
  async getSkills(companyId = 'company-1'): Promise<SupportAgentSkillRecord[]> {
    return apiRequest<SupportAgentSkillRecord[]>(
      `/support/team/skills?companyId=${encodeURIComponent(companyId)}`
    );
  },
  async createSkill(
    data: Partial<SupportAgentSkillRecord> & { companyId?: string }
  ): Promise<SupportAgentSkillRecord> {
    return apiRequest<SupportAgentSkillRecord>('/support/team/skills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateSkill(
    id: string,
    data: Partial<SupportAgentSkillRecord>
  ): Promise<SupportAgentSkillRecord> {
    return apiRequest<SupportAgentSkillRecord>(`/support/team/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteSkill(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/support/team/skills/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Escalation Rule Service (net-new: /support/automation/escalation)
// ============================================================================

export interface SupportEscalationRuleRecord {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  level: number;
  trigger?: { type: string; threshold: string };
  escalateTo?: string;
  notificationChannels?: string[];
  active: boolean;
  executionCount: number;
  avgResponseTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const SupportEscalationRuleService = {
  async getRules(companyId = 'company-1'): Promise<SupportEscalationRuleRecord[]> {
    return apiRequest<SupportEscalationRuleRecord[]>(
      `/support/automation/escalation?companyId=${encodeURIComponent(companyId)}`
    );
  },
  async createRule(
    data: Partial<SupportEscalationRuleRecord> & { companyId?: string }
  ): Promise<SupportEscalationRuleRecord> {
    return apiRequest<SupportEscalationRuleRecord>('/support/automation/escalation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateRule(
    id: string,
    data: Partial<SupportEscalationRuleRecord>
  ): Promise<SupportEscalationRuleRecord> {
    return apiRequest<SupportEscalationRuleRecord>(`/support/automation/escalation/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteRule(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/support/automation/escalation/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Assignment Rule Service (net-new: /support/automation/assignment)
// ============================================================================

export interface SupportAssignmentRuleRecord {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  priority: number;
  conditions?: Array<{ field: string; operator: string; value: string }>;
  assignmentLogic: string;
  assignTo?: string;
  active: boolean;
  matchedTickets: number;
  avgAssignmentTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const SupportAssignmentRuleService = {
  async getRules(companyId = 'company-1'): Promise<SupportAssignmentRuleRecord[]> {
    return apiRequest<SupportAssignmentRuleRecord[]>(
      `/support/automation/assignment?companyId=${encodeURIComponent(companyId)}`
    );
  },
  async createRule(
    data: Partial<SupportAssignmentRuleRecord> & { companyId?: string }
  ): Promise<SupportAssignmentRuleRecord> {
    return apiRequest<SupportAssignmentRuleRecord>('/support/automation/assignment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateRule(
    id: string,
    data: Partial<SupportAssignmentRuleRecord>
  ): Promise<SupportAssignmentRuleRecord> {
    return apiRequest<SupportAssignmentRuleRecord>(`/support/automation/assignment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteRule(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/support/automation/assignment/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Guide Service (net-new: /support/knowledge/guides)
// ============================================================================

export interface SupportGuideRecord {
  id: string;
  companyId: string;
  guideId?: string;
  title: string;
  description?: string;
  category?: string;
  difficulty: string;
  readTime?: string;
  views: number;
  helpful: number;
  lastUpdated?: string;
  author?: string;
  tags?: string[];
  sections: number;
  featured: boolean;
  format: string;
  thumbnail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const SupportGuideService = {
  async getGuides(companyId = 'company-1'): Promise<SupportGuideRecord[]> {
    return apiRequest<SupportGuideRecord[]>(
      `/support/knowledge/guides?companyId=${encodeURIComponent(companyId)}`
    );
  },
  async createGuide(
    data: Partial<SupportGuideRecord> & { companyId?: string }
  ): Promise<SupportGuideRecord> {
    return apiRequest<SupportGuideRecord>('/support/knowledge/guides', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateGuide(
    id: string,
    data: Partial<SupportGuideRecord>
  ): Promise<SupportGuideRecord> {
    return apiRequest<SupportGuideRecord>(`/support/knowledge/guides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteGuide(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/support/knowledge/guides/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Troubleshooting Article Service (net-new: /support/knowledge/troubleshooting)
// ============================================================================

export interface SupportTroubleshootingArticleRecord {
  id: string;
  companyId: string;
  articleId?: string;
  title: string;
  problem?: string;
  solution?: string;
  category?: string;
  severity: string;
  steps?: string[];
  causes?: string[];
  prevention?: string[];
  tags?: string[];
  views: number;
  helpful: number;
  lastUpdated?: string;
  author?: string;
  relatedArticles?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const SupportTroubleshootingService = {
  async getArticles(
    companyId = 'company-1'
  ): Promise<SupportTroubleshootingArticleRecord[]> {
    return apiRequest<SupportTroubleshootingArticleRecord[]>(
      `/support/knowledge/troubleshooting?companyId=${encodeURIComponent(companyId)}`
    );
  },
  async createArticle(
    data: Partial<SupportTroubleshootingArticleRecord> & { companyId?: string }
  ): Promise<SupportTroubleshootingArticleRecord> {
    return apiRequest<SupportTroubleshootingArticleRecord>('/support/knowledge/troubleshooting', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateArticle(
    id: string,
    data: Partial<SupportTroubleshootingArticleRecord>
  ): Promise<SupportTroubleshootingArticleRecord> {
    return apiRequest<SupportTroubleshootingArticleRecord>(`/support/knowledge/troubleshooting/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteArticle(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/support/knowledge/troubleshooting/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Known Error Service (net-new: /support/problems/known-errors)
// ============================================================================

export interface SupportKnownErrorRecord {
  id: string;
  companyId: string;
  errorId?: string;
  title: string;
  description?: string;
  workaround?: string;
  status: string;
  category?: string;
  affectedSystems?: string[];
  relatedProblems?: string[];
  documentedBy?: string;
  documentedDate?: string;
  lastUpdated?: string;
  affectedUsers: number;
  severity: string;
  createdAt?: string;
  updatedAt?: string;
}

export const SupportKnownErrorService = {
  async getErrors(companyId = 'company-1'): Promise<SupportKnownErrorRecord[]> {
    return apiRequest<SupportKnownErrorRecord[]>(
      `/support/problems/known-errors?companyId=${encodeURIComponent(companyId)}`
    );
  },
  async createError(
    data: Partial<SupportKnownErrorRecord> & { companyId?: string }
  ): Promise<SupportKnownErrorRecord> {
    return apiRequest<SupportKnownErrorRecord>('/support/problems/known-errors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateError(
    id: string,
    data: Partial<SupportKnownErrorRecord>
  ): Promise<SupportKnownErrorRecord> {
    return apiRequest<SupportKnownErrorRecord>(`/support/problems/known-errors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteError(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/support/problems/known-errors/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Hardware Asset Service (net-new: /support/assets/hardware)
// ============================================================================

export interface SupportHardwareAssetRecord {
  id: string;
  companyId: string;
  assetTag?: string;
  name: string;
  category: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  status: string;
  condition: string;
  location?: { building: string; floor: string; room: string };
  assignedTo?: { name: string; department: string; email: string } | null;
  purchase?: { date: string; cost: number; vendor: string; warrantyExpiry: string };
  specifications?: Record<string, string>;
  maintenance?: { lastService: string; nextService: string; serviceCount: number };
  lifecycle?: { age: string; expectedLife: string; remainingLife: string; depreciation: number };
  createdAt?: string;
  updatedAt?: string;
}

export const SupportHardwareAssetService = {
  async getAssets(companyId = 'company-1'): Promise<SupportHardwareAssetRecord[]> {
    return apiRequest<SupportHardwareAssetRecord[]>(
      `/support/assets/hardware?companyId=${encodeURIComponent(companyId)}`
    );
  },
  async createAsset(
    data: Partial<SupportHardwareAssetRecord> & { companyId?: string }
  ): Promise<SupportHardwareAssetRecord> {
    return apiRequest<SupportHardwareAssetRecord>('/support/assets/hardware', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateAsset(
    id: string,
    data: Partial<SupportHardwareAssetRecord>
  ): Promise<SupportHardwareAssetRecord> {
    return apiRequest<SupportHardwareAssetRecord>(`/support/assets/hardware/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteAsset(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/support/assets/hardware/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Software Asset Service (net-new: /support/assets/software)
// ============================================================================

export interface SupportSoftwareAssetRecord {
  id: string;
  companyId: string;
  name: string;
  vendor?: string;
  category: string;
  version?: string;
  licenseType: string;
  licenses?: { total: number; used: number; available: number };
  cost?: { perLicense: number; totalAnnual: number; billingCycle: string };
  deployment?: { type: string; installCount: number; lastDeployed: string };
  contract?: {
    startDate: string;
    renewalDate: string;
    vendor: string;
    contactPerson: string;
    contactEmail: string;
  };
  compliance?: { status: string; lastAudit: string; nextAudit: string };
  support?: { level: string; expiryDate: string; supportHours: string };
  createdAt?: string;
  updatedAt?: string;
}

export const SupportSoftwareAssetService = {
  async getAssets(companyId = 'company-1'): Promise<SupportSoftwareAssetRecord[]> {
    return apiRequest<SupportSoftwareAssetRecord[]>(
      `/support/assets/software?companyId=${encodeURIComponent(companyId)}`
    );
  },
  async createAsset(
    data: Partial<SupportSoftwareAssetRecord> & { companyId?: string }
  ): Promise<SupportSoftwareAssetRecord> {
    return apiRequest<SupportSoftwareAssetRecord>('/support/assets/software', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateAsset(
    id: string,
    data: Partial<SupportSoftwareAssetRecord>
  ): Promise<SupportSoftwareAssetRecord> {
    return apiRequest<SupportSoftwareAssetRecord>(`/support/assets/software/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteAsset(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/support/assets/software/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Scheduled Change Service (net-new: /support/changes/scheduled)
// ============================================================================

export interface SupportScheduledChangeRecord {
  id: string;
  companyId: string;
  ticketNumber?: string;
  title: string;
  type: string;
  category?: string;
  priority: string;
  implementer?: string;
  implementationDate?: string;
  implementationTime?: string;
  duration?: string;
  status: string;
  affectedSystems?: string[];
  downtime: boolean;
  backupCompleted: boolean;
  stakeholdersNotified: boolean;
  changeWindow?: string;
  approvedBy?: string;
  approvalDate?: string;
  rollbackPlan: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const SupportScheduledChangeService = {
  async getChanges(companyId = 'company-1'): Promise<SupportScheduledChangeRecord[]> {
    return apiRequest<SupportScheduledChangeRecord[]>(
      `/support/changes/scheduled?companyId=${encodeURIComponent(companyId)}`
    );
  },
  async createChange(
    data: Partial<SupportScheduledChangeRecord> & { companyId?: string }
  ): Promise<SupportScheduledChangeRecord> {
    return apiRequest<SupportScheduledChangeRecord>('/support/changes/scheduled', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateChange(
    id: string,
    data: Partial<SupportScheduledChangeRecord>
  ): Promise<SupportScheduledChangeRecord> {
    return apiRequest<SupportScheduledChangeRecord>(`/support/changes/scheduled/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteChange(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/support/changes/scheduled/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Omnichannel Interaction Service (net-new: /support/omnichannel)
// ============================================================================

export interface OmnichannelInteraction {
  id: string;
  companyId: string;
  ticketId: string;
  subject: string;
  customerName: string;
  customerEmail?: string;
  customerAvatar?: string;
  channel: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  assignedToName?: string;
  assignedToAvatar?: string;
  tags?: string[];
  starred?: boolean;
  hasAttachments?: boolean;
  slaDeadline?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const OmnichannelService = {
  async getInteractions(
    companyId = 'company-1',
    options?: { channel?: string; status?: string; search?: string }
  ): Promise<OmnichannelInteraction[]> {
    const params = new URLSearchParams({ companyId });
    if (options?.channel) params.append('channel', options.channel);
    if (options?.status) params.append('status', options.status);
    if (options?.search) params.append('search', options.search);
    return apiRequest<OmnichannelInteraction[]>(
      `/support/omnichannel?${params.toString()}`
    );
  },

  async getInteraction(id: string): Promise<OmnichannelInteraction> {
    return apiRequest<OmnichannelInteraction>(`/support/omnichannel/${id}`);
  },
};

// ============================================================================
// Unified Export
// ============================================================================

export const SupportService = {
  channels: ChannelService,
  routing: RoutingRuleService,
  knowledge: KnowledgeBaseService,
  ai: AIResponseService,
  csat: CSATService,
  backlog: BacklogService,
  itil: ITILService,
  settings: SupportSettingsService,
  ticketCategories: TicketCategoryService,
  responseTemplates: ResponseTemplateService,
  slaSettings: SlaSettingsService,
  agents: SupportAgentService,
  agentSkills: SupportAgentSkillService,
  escalationRules: SupportEscalationRuleService,
  assignmentRules: SupportAssignmentRuleService,
  guides: SupportGuideService,
  troubleshooting: SupportTroubleshootingService,
  knownErrors: SupportKnownErrorService,
  hardwareAssets: SupportHardwareAssetService,
  softwareAssets: SupportSoftwareAssetService,
  scheduledChanges: SupportScheduledChangeService,
  omnichannel: OmnichannelService,
};

export default SupportService;
