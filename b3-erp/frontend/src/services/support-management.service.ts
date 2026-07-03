/**
 * Support Management Service
 * Comprehensive service for Support module with Prisma backend integration
 * Covers: Tickets, Agents, SLA, Assets, Automation, ITIL, Omnichannel, CSAT, Analytics
 */

import { coreService } from './core.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Interfaces - Tickets
// ============================================================================

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'assigned' | 'in_progress' | 'pending' | 'resolved' | 'closed' | 'reopened';
  channel: 'email' | 'chat' | 'phone' | 'web' | 'social' | 'portal';
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  categoryId?: string;
  category?: TicketCategory;
  assigneeId?: string;
  assignee?: SupportAgent;
  slaId?: string;
  slaPolicy?: SLAPolicy;
  slaDueDate?: Date;
  slaBreached: boolean;
  firstResponseAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  tags: string[];
  resolution?: string;
  relatedAssetId?: string;
  comments?: TicketComment[];
  history?: TicketHistory[];
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parent?: TicketCategory;
  children?: TicketCategory[];
  defaultPriority?: string;
  defaultSlaId?: string;
  isActive: boolean;
  companyId: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  content: string;
  isInternal: boolean;
  createdById: string;
  createdByAgent?: SupportAgent;
  attachments?: unknown;
  companyId: string;
  createdAt: Date;
}

export interface TicketHistory {
  id: string;
  ticketId: string;
  action: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  changedById: string;
  changedByName: string;
  companyId: string;
  createdAt: Date;
}

// ============================================================================
// Interfaces - Support Agents
// ============================================================================

export interface SupportAgent {
  id: string;
  userId: string;
  name: string;
  email: string;
  teamId?: string;
  role: 'agent' | 'supervisor' | 'manager' | 'admin';
  status: 'available' | 'busy' | 'away' | 'offline';
  maxTickets: number;
  currentTickets: number;
  channels: string[];
  skills?: AgentSkillMatrix[];
  assignedTickets?: SupportTicket[];
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentSkillMatrix {
  id: string;
  agentId: string;
  agent?: SupportAgent;
  skillCategory: string;
  skillName: string;
  proficiencyLevel: number;
  certifiedDate?: Date;
  expiryDate?: Date;
  companyId: string;
}

export interface WorkloadDistribution {
  id: string;
  agentId: string;
  agent?: SupportAgent;
  date: Date;
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  avgHandleTime: number;
  utilizationRate: number;
  companyId: string;
  calculatedAt: Date;
}

export interface TeamPerformance {
  agentId: string;
  agentName: string;
  totalTickets: number;
  resolvedTickets: number;
  openTickets: number;
  avgResolutionTime: number;
  slaCompliance: number;
}

// ============================================================================
// Interfaces - SLA Management
// ============================================================================

export interface SLAPolicy {
  id: string;
  name: string;
  description?: string;
  priority: string;
  firstResponseMinutes: number;
  resolutionMinutes: number;
  businessHoursOnly: boolean;
  escalationRules?: unknown;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SLABreach {
  id: string;
  ticketId: string;
  ticket?: SupportTicket;
  slaId: string;
  slaPolicy?: SLAPolicy;
  breachType: 'first_response' | 'resolution';
  targetTime: Date;
  breachedAt: Date;
  breachMinutes: number;
  resolved: boolean;
  resolvedAt?: Date;
  companyId: string;
}

export interface SLADashboard {
  activePolicies: number;
  breachesLast30Days: number;
  complianceRate: number;
  totalTickets: number;
  breachedTickets: number;
}

// ============================================================================
// Interfaces - IT Assets
// ============================================================================

export interface ITAsset {
  id: string;
  assetTag: string;
  name: string;
  assetType: 'hardware' | 'software' | 'network' | 'peripheral' | 'mobile';
  status: 'active' | 'inactive' | 'maintenance' | 'retired' | 'disposed';
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  purchaseCost?: number;
  warrantyExpiry?: Date;
  location?: string;
  assignedTo?: string;
  assignedToName?: string;
  notes?: string;
  maintenanceRecords?: AssetMaintenanceRecord[];
  depreciation?: AssetDepreciation;
  relatedTickets?: SupportTicket[];
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetMaintenanceRecord {
  id: string;
  assetId: string;
  maintenanceType: 'preventive' | 'corrective' | 'upgrade' | 'inspection';
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  performedBy?: string;
  cost?: number;
  notes?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  companyId: string;
}

export interface AssetDepreciation {
  id: string;
  assetId: string;
  asset?: ITAsset;
  depreciationMethod: 'straight_line' | 'declining_balance' | 'sum_of_years';
  usefulLifeYears: number;
  salvageValue: number;
  currentValue: number;
  depreciationPerYear: number;
  accumulatedDepreciation: number;
  companyId: string;
  calculatedAt: Date;
}

export interface SoftwareLicense {
  id: string;
  softwareName: string;
  vendor: string;
  licenseType: 'perpetual' | 'subscription' | 'concurrent' | 'site' | 'volume';
  licenseKey?: string;
  totalSeats: number;
  usedSeats: number;
  purchaseDate: Date;
  expiryDate?: Date;
  renewalDate?: Date;
  cost: number;
  renewalCost?: number;
  status: 'active' | 'expired' | 'pending_renewal';
  assignedUsers?: string[];
  notes?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Interfaces - Automation
// ============================================================================

export interface SupportAutomationRule {
  id: string;
  name: string;
  description?: string;
  triggerType: 'ticket_created' | 'ticket_updated' | 'sla_warning' | 'sla_breach' | 'time_based';
  triggerConditions: unknown;
  actions: unknown;
  priority: number;
  isActive: boolean;
  executionCount: number;
  lastExecutedAt?: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EscalationRule {
  id: string;
  name: string;
  priority: string;
  triggerMinutes: number;
  escalationType: 'notify' | 'reassign' | 'escalate_tier';
  escalateTo: string;
  notifyChannels: string[];
  isActive: boolean;
  companyId: string;
  createdAt: Date;
}

export interface CannedResponse {
  id: string;
  title: string;
  content: string;
  category: string;
  shortcut?: string;
  variables?: string[];
  usageCount: number;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Interfaces - Problem Management (ITIL)
// ============================================================================

export interface KnownError {
  id: string;
  errorId: string;
  title: string;
  description: string;
  symptom: string;
  rootCause: string;
  workaround?: string;
  permanentFix?: string;
  affectedSystems: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'archived';
  relatedProblems?: string[];
  relatedIncidents?: string[];
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RootCauseAnalysis {
  id: string;
  problemId: string;
  analysisMethod: 'five_whys' | 'fishbone' | 'fault_tree' | 'pareto';
  rootCauses: unknown;
  contributingFactors?: unknown;
  recommendedActions?: unknown;
  status: 'in_progress' | 'completed' | 'reviewed';
  analyzedById: string;
  reviewedById?: string;
  companyId: string;
  createdAt: Date;
  completedAt?: Date;
}

// ============================================================================
// Interfaces - Omnichannel
// ============================================================================

export interface OmnichannelConversation {
  id: string;
  conversationId: string;
  channel: 'email' | 'chat' | 'whatsapp' | 'facebook' | 'twitter' | 'phone' | 'sms';
  status: 'active' | 'waiting' | 'resolved' | 'closed';
  customerId: string;
  customerName: string;
  customerContact: string;
  assignedAgentId?: string;
  assignedAgent?: SupportAgent;
  ticketId?: string;
  lastMessageAt: Date;
  messageCount: number;
  messages?: OmnichannelMessage[];
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OmnichannelMessage {
  id: string;
  conversationId: string;
  channel: string;
  content: string;
  senderType: 'customer' | 'agent' | 'bot';
  senderId: string;
  senderName: string;
  attachments?: unknown;
  isRead: boolean;
  companyId: string;
  createdAt: Date;
}

// ============================================================================
// Interfaces - CSAT
// ============================================================================

export interface CSATSurvey {
  id: string;
  name: string;
  triggerEvent: 'ticket_resolved' | 'ticket_closed' | 'conversation_ended' | 'manual';
  questions: unknown;
  thankYouMessage?: string;
  isActive: boolean;
  responseCount: number;
  avgRating?: number;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CSATResponse {
  id: string;
  surveyId: string;
  survey?: CSATSurvey;
  ticketId?: string;
  conversationId?: string;
  customerId: string;
  responses: unknown;
  overallRating: number;
  npsScore?: number;
  feedback?: string;
  submittedAt: Date;
  companyId: string;
}

export interface CSATAnalytics {
  totalResponses: number;
  avgRating: number;
  npsScore: number;
  promoters: number;
  passives: number;
  detractors: number;
}

// ============================================================================
// Interfaces - Analytics & Dashboard
// ============================================================================

export interface SupportDashboard {
  totalOpenTickets: number;
  unassignedTickets: number;
  overdueTickets: number;
  ticketsToday: number;
  resolvedToday: number;
  avgResponseTimeMinutes: number;
  csatScore: number;
  npsScore: number;
}

export interface SupportAnalyticsSnapshot {
  id: string;
  snapshotDate: Date;
  period: 'daily' | 'weekly' | 'monthly';
  totalTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  slaComplianceRate: number;
  csatScore?: number;
  ticketsByChannel: Record<string, number>;
  ticketsByPriority: Record<string, number>;
  ticketsByCategory: Record<string, number>;
  companyId: string;
}

export interface SupportModuleSettings {
  id: string;
  defaultTicketPriority: string;
  autoAssignEnabled: boolean;
  slaTrackingEnabled: boolean;
  csatEnabled: boolean;
  businessHoursStart: string;
  businessHoursEnd: string;
  businessDays: string[];
  ticketNumberPrefix: string;
  allowCustomerPortal: boolean;
  emailNotificationsEnabled: boolean;
  companyId: string;
}

// ============================================================================
// Mock Data
// ============================================================================

const mockTickets: SupportTicket[] = [
  {
    id: '1',
    ticketNumber: 'TKT-000001',
    subject: 'Cannot login to the system',
    description: 'Getting an error when trying to login with my credentials',
    priority: 'high',
    status: 'in_progress',
    channel: 'email',
    customerId: 'cust-001',
    customerName: 'John Smith',
    customerEmail: 'john.smith@example.com',
    customerPhone: '+1-555-0123',
    tags: ['login', 'authentication'],
    slaBreached: false,
    companyId: 'company-1',
    createdAt: new Date('2024-01-15T10:00:00'),
    updatedAt: new Date('2024-01-15T11:30:00'),
  },
  {
    id: '2',
    ticketNumber: 'TKT-000002',
    subject: 'Feature request: Dark mode',
    description: 'Would like to have a dark mode option in the application',
    priority: 'low',
    status: 'new',
    channel: 'portal',
    customerId: 'cust-002',
    customerName: 'Jane Doe',
    customerEmail: 'jane.doe@example.com',
    tags: ['feature-request', 'ui'],
    slaBreached: false,
    companyId: 'company-1',
    createdAt: new Date('2024-01-15T14:00:00'),
    updatedAt: new Date('2024-01-15T14:00:00'),
  },
];

const mockAgents: SupportAgent[] = [
  {
    id: 'agent-1',
    userId: 'user-1',
    name: 'Alex Johnson',
    email: 'alex.johnson@company.com',
    role: 'agent',
    status: 'available',
    maxTickets: 20,
    currentTickets: 5,
    channels: ['email', 'chat'],
    companyId: 'company-1',
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'agent-2',
    userId: 'user-2',
    name: 'Maria Garcia',
    email: 'maria.garcia@company.com',
    role: 'supervisor',
    status: 'busy',
    maxTickets: 15,
    currentTickets: 12,
    channels: ['email', 'chat', 'phone'],
    companyId: 'company-1',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

const mockSLAPolicies: SLAPolicy[] = [
  {
    id: 'sla-1',
    name: 'Critical Priority SLA',
    description: 'SLA for critical priority tickets',
    priority: 'critical',
    firstResponseMinutes: 15,
    resolutionMinutes: 120,
    businessHoursOnly: false,
    isActive: true,
    companyId: 'company-1',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: 'sla-2',
    name: 'High Priority SLA',
    description: 'SLA for high priority tickets',
    priority: 'high',
    firstResponseMinutes: 60,
    resolutionMinutes: 480,
    businessHoursOnly: true,
    isActive: true,
    companyId: 'company-1',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
];

const mockITAssets: ITAsset[] = [
  {
    id: 'asset-1',
    assetTag: 'IT-LAP-001',
    name: 'Dell Latitude 5520',
    assetType: 'hardware',
    status: 'active',
    manufacturer: 'Dell',
    model: 'Latitude 5520',
    serialNumber: 'DL5520ABC123',
    purchaseDate: new Date('2023-06-15'),
    purchaseCost: 1200,
    warrantyExpiry: new Date('2026-06-15'),
    location: 'Office A - Floor 2',
    assignedTo: 'user-1',
    assignedToName: 'Alex Johnson',
    companyId: 'company-1',
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'asset-2',
    assetTag: 'IT-SRV-001',
    name: 'HP ProLiant DL380',
    assetType: 'hardware',
    status: 'active',
    manufacturer: 'HP',
    model: 'ProLiant DL380 Gen10',
    serialNumber: 'HP380XYZ789',
    purchaseDate: new Date('2022-01-10'),
    purchaseCost: 8500,
    warrantyExpiry: new Date('2025-01-10'),
    location: 'Data Center - Rack 5',
    companyId: 'company-1',
    createdAt: new Date('2022-01-10'),
    updatedAt: new Date('2024-01-05'),
  },
];

const mockDashboard: SupportDashboard = {
  totalOpenTickets: 45,
  unassignedTickets: 8,
  overdueTickets: 3,
  ticketsToday: 12,
  resolvedToday: 9,
  avgResponseTimeMinutes: 18,
  csatScore: 4.2,
  npsScore: 42,
};

// ============================================================================
// API Functions - Tickets
// ============================================================================

export async function getTickets(params: {
  companyId: string;
  status?: string;
  priority?: string;
  category?: string;
  channel?: string;
  assigneeId?: string;
  customerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ tickets: SupportTicket[]; total: number; page: number; limit: number; totalPages: number }> {
  if (USE_MOCK_DATA) {
    let filtered = [...mockTickets];
    if (params.status) filtered = filtered.filter(t => t.status === params.status);
    if (params.priority) filtered = filtered.filter(t => t.priority === params.priority);
    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.ticketNumber.toLowerCase().includes(search) ||
        t.subject.toLowerCase().includes(search) ||
        t.customerName.toLowerCase().includes(search)
      );
    }
    return {
      tickets: filtered,
      total: filtered.length,
      page: params.page || 1,
      limit: params.limit || 20,
      totalPages: 1,
    };
  }

  return coreService.request<{ tickets: SupportTicket[]; total: number; page: number; limit: number; totalPages: number }>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/tickets`,
    params,
  });
}

export async function getTicketById(id: string, companyId: string): Promise<SupportTicket | null> {
  if (USE_MOCK_DATA) {
    return mockTickets.find(t => t.id === id) || null;
  }

  return coreService.request<SupportTicket>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/tickets/${id}`,
    params: { companyId },
  });
}

export async function createTicket(data: {
  companyId: string;
  subject: string;
  description: string;
  priority: string;
  channel: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  categoryId?: string;
  tags?: string[];
}): Promise<SupportTicket> {
  if (USE_MOCK_DATA) {
    const newTicket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      ticketNumber: `TKT-${String(mockTickets.length + 1).padStart(6, '0')}`,
      subject: data.subject,
      description: data.description,
      priority: data.priority as SupportTicket['priority'],
      status: 'new',
      channel: data.channel as SupportTicket['channel'],
      customerId: data.customerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      categoryId: data.categoryId,
      tags: data.tags || [],
      slaBreached: false,
      companyId: data.companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockTickets.push(newTicket);
    return newTicket;
  }

  return coreService.request<SupportTicket>({
    method: 'POST',
    url: `${API_BASE_URL}/api/support/tickets`,
    data,
  });
}

export async function updateTicket(id: string, companyId: string, data: Partial<SupportTicket>): Promise<SupportTicket> {
  if (USE_MOCK_DATA) {
    const ticket = mockTickets.find(t => t.id === id);
    if (!ticket) throw new Error('Ticket not found');
    Object.assign(ticket, data, { updatedAt: new Date() });
    return ticket;
  }

  return coreService.request<SupportTicket>({
    method: 'PUT',
    url: `${API_BASE_URL}/api/support/tickets/${id}`,
    params: { companyId },
    data,
  });
}

export async function assignTicket(ticketId: string, companyId: string, assigneeId: string): Promise<SupportTicket> {
  if (USE_MOCK_DATA) {
    const ticket = mockTickets.find(t => t.id === ticketId);
    if (!ticket) throw new Error('Ticket not found');
    ticket.assigneeId = assigneeId;
    ticket.status = ticket.status === 'new' ? 'assigned' : ticket.status;
    ticket.updatedAt = new Date();
    return ticket;
  }

  return coreService.request<SupportTicket>({
    method: 'POST',
    url: `${API_BASE_URL}/api/support/tickets/${ticketId}/assign`,
    params: { companyId },
    data: { assigneeId },
  });
}

export async function addTicketComment(ticketId: string, companyId: string, data: {
  content: string;
  isInternal: boolean;
  createdById: string;
}): Promise<TicketComment> {
  if (USE_MOCK_DATA) {
    return {
      id: `comment-${Date.now()}`,
      ticketId,
      content: data.content,
      isInternal: data.isInternal,
      createdById: data.createdById,
      companyId,
      createdAt: new Date(),
    };
  }

  return coreService.request<TicketComment>({
    method: 'POST',
    url: `${API_BASE_URL}/api/support/tickets/${ticketId}/comments`,
    params: { companyId },
    data,
  });
}

// ============================================================================
// API Functions - Ticket Categories
// ============================================================================

export async function getTicketCategories(companyId: string): Promise<TicketCategory[]> {
  if (USE_MOCK_DATA) {
    return [
      { id: 'cat-1', name: 'Technical Support', isActive: true, companyId },
      { id: 'cat-2', name: 'Billing', isActive: true, companyId },
      { id: 'cat-3', name: 'General Inquiry', isActive: true, companyId },
    ];
  }

  return coreService.request<TicketCategory[]>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/ticket-categories`,
    params: { companyId },
  });
}

// ============================================================================
// API Functions - Support Agents
// ============================================================================

export async function getSupportAgents(params: {
  companyId: string;
  status?: string;
  teamId?: string;
}): Promise<SupportAgent[]> {
  if (USE_MOCK_DATA) {
    let filtered = [...mockAgents];
    if (params.status) filtered = filtered.filter(a => a.status === params.status);
    if (params.teamId) filtered = filtered.filter(a => a.teamId === params.teamId);
    return filtered;
  }

  return coreService.request<SupportAgent[]>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/agents`,
    params,
  });
}

export async function getAgentById(id: string, companyId: string): Promise<SupportAgent | null> {
  if (USE_MOCK_DATA) {
    return mockAgents.find(a => a.id === id) || null;
  }

  return coreService.request<SupportAgent>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/agents/${id}`,
    params: { companyId },
  });
}

export async function updateAgentStatus(agentId: string, companyId: string, status: string): Promise<SupportAgent> {
  if (USE_MOCK_DATA) {
    const agent = mockAgents.find(a => a.id === agentId);
    if (!agent) throw new Error('Agent not found');
    agent.status = status as SupportAgent['status'];
    agent.updatedAt = new Date();
    return agent;
  }

  return coreService.request<SupportAgent>({
    method: 'PATCH',
    url: `${API_BASE_URL}/api/support/agents/${agentId}/status`,
    params: { companyId },
    data: { status },
  });
}

export async function getAgentSkillMatrix(companyId: string): Promise<AgentSkillMatrix[]> {
  if (USE_MOCK_DATA) {
    return [
      { id: '1', agentId: 'agent-1', skillCategory: 'Technical', skillName: 'Networking', proficiencyLevel: 4, companyId },
      { id: '2', agentId: 'agent-1', skillCategory: 'Technical', skillName: 'Database', proficiencyLevel: 3, companyId },
      { id: '3', agentId: 'agent-2', skillCategory: 'Technical', skillName: 'Cloud Services', proficiencyLevel: 5, companyId },
    ];
  }

  return coreService.request<AgentSkillMatrix[]>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/agents/skill-matrix`,
    params: { companyId },
  });
}

export async function getTeamPerformance(companyId: string, dateFrom?: Date, dateTo?: Date): Promise<TeamPerformance[]> {
  if (USE_MOCK_DATA) {
    return mockAgents.map(a => ({
      agentId: a.id,
      agentName: a.name,
      totalTickets: 45,
      resolvedTickets: 38,
      openTickets: 7,
      avgResolutionTime: 120,
      slaCompliance: 92,
    }));
  }

  return coreService.request<TeamPerformance[]>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/team-performance`,
    params: { companyId, dateFrom: dateFrom?.toISOString(), dateTo: dateTo?.toISOString() },
  });
}

export async function getWorkloadDistribution(companyId: string): Promise<WorkloadDistribution[]> {
  if (USE_MOCK_DATA) {
    return mockAgents.map(a => ({
      id: `wl-${a.id}`,
      agentId: a.id,
      agent: a,
      date: new Date(),
      totalTickets: a.currentTickets,
      openTickets: a.currentTickets,
      resolvedTickets: 0,
      avgHandleTime: 25,
      utilizationRate: (a.currentTickets / a.maxTickets) * 100,
      companyId,
      calculatedAt: new Date(),
    }));
  }

  return coreService.request<WorkloadDistribution[]>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/workload-distribution`,
    params: { companyId },
  });
}

// ============================================================================
// API Functions - SLA Management
// ============================================================================

export async function getSLAPolicies(companyId: string): Promise<SLAPolicy[]> {
  if (USE_MOCK_DATA) {
    return mockSLAPolicies;
  }

  return coreService.request<SLAPolicy[]>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/sla-policies`,
    params: { companyId },
  });
}

export async function createSLAPolicy(data: Omit<SLAPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<SLAPolicy> {
  if (USE_MOCK_DATA) {
    const newPolicy: SLAPolicy = {
      ...data,
      id: `sla-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockSLAPolicies.push(newPolicy);
    return newPolicy;
  }

  return coreService.request<SLAPolicy>({
    method: 'POST',
    url: `${API_BASE_URL}/api/support/sla-policies`,
    data,
  });
}

export async function getSLABreaches(params: {
  companyId: string;
  breachType?: string;
  resolved?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}): Promise<SLABreach[]> {
  if (USE_MOCK_DATA) {
    return [];
  }

  return coreService.request<SLABreach[]>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/sla-breaches`,
    params: {
      ...params,
      dateFrom: params.dateFrom?.toISOString(),
      dateTo: params.dateTo?.toISOString(),
    },
  });
}

export async function getSLADashboard(companyId: string): Promise<SLADashboard> {
  if (USE_MOCK_DATA) {
    return {
      activePolicies: mockSLAPolicies.filter(p => p.isActive).length,
      breachesLast30Days: 5,
      complianceRate: 94,
      totalTickets: mockTickets.length,
      breachedTickets: 1,
    };
  }

  return coreService.request<SLADashboard>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/sla-dashboard`,
    params: { companyId },
  });
}

// ============================================================================
// API Functions - IT Assets
// ============================================================================

export async function getITAssets(params: {
  companyId: string;
  assetType?: string;
  status?: string;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ assets: ITAsset[]; total: number; page: number; limit: number; totalPages: number }> {
  if (USE_MOCK_DATA) {
    let filtered = [...mockITAssets];
    if (params.assetType) filtered = filtered.filter(a => a.assetType === params.assetType);
    if (params.status) filtered = filtered.filter(a => a.status === params.status);
    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(a =>
        a.assetTag.toLowerCase().includes(search) ||
        a.name.toLowerCase().includes(search) ||
        a.serialNumber?.toLowerCase().includes(search)
      );
    }
    return {
      assets: filtered,
      total: filtered.length,
      page: params.page || 1,
      limit: params.limit || 20,
      totalPages: 1,
    };
  }

  return coreService.request<{ assets: ITAsset[]; total: number; page: number; limit: number; totalPages: number }>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/it-assets`,
    params,
  });
}

export async function getITAssetById(id: string, companyId: string): Promise<ITAsset | null> {
  if (USE_MOCK_DATA) {
    return mockITAssets.find(a => a.id === id) || null;
  }

  return coreService.request<ITAsset>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/it-assets/${id}`,
    params: { companyId },
  });
}

export async function createITAsset(data: Omit<ITAsset, 'id' | 'createdAt' | 'updatedAt' | 'maintenanceRecords' | 'depreciation' | 'relatedTickets'>): Promise<ITAsset> {
  if (USE_MOCK_DATA) {
    const newAsset: ITAsset = {
      ...data,
      id: `asset-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockITAssets.push(newAsset);
    return newAsset;
  }

  return coreService.request<ITAsset>({
    method: 'POST',
    url: `${API_BASE_URL}/api/support/it-assets`,
    data,
  });
}

export async function updateITAsset(id: string, companyId: string, data: Partial<ITAsset>): Promise<ITAsset> {
  if (USE_MOCK_DATA) {
    const asset = mockITAssets.find(a => a.id === id);
    if (!asset) throw new Error('Asset not found');
    Object.assign(asset, data, { updatedAt: new Date() });
    return asset;
  }

  return coreService.request<ITAsset>({
    method: 'PUT',
    url: `${API_BASE_URL}/api/support/it-assets/${id}`,
    params: { companyId },
    data,
  });
}

export async function getSoftwareLicenses(params: {
  companyId: string;
  status?: string;
  licenseType?: string;
  search?: string;
}): Promise<SoftwareLicense[]> {
  if (USE_MOCK_DATA) {
    return [
      {
        id: 'lic-1',
        softwareName: 'Microsoft 365',
        vendor: 'Microsoft',
        licenseType: 'subscription',
        totalSeats: 100,
        usedSeats: 85,
        purchaseDate: new Date('2023-01-01'),
        expiryDate: new Date('2024-12-31'),
        cost: 12000,
        renewalCost: 13200,
        status: 'active',
        companyId: params.companyId,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2024-01-15'),
      },
    ];
  }

  return coreService.request<SoftwareLicense[]>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/software-licenses`,
    params,
  });
}

export async function getAssetDepreciation(companyId: string): Promise<AssetDepreciation[]> {
  if (USE_MOCK_DATA) {
    return mockITAssets
      .filter(a => a.purchaseCost)
      .map(a => ({
        id: `dep-${a.id}`,
        assetId: a.id,
        asset: a,
        depreciationMethod: 'straight_line' as const,
        usefulLifeYears: 5,
        salvageValue: (a.purchaseCost || 0) * 0.1,
        currentValue: (a.purchaseCost || 0) * 0.7,
        depreciationPerYear: ((a.purchaseCost || 0) * 0.9) / 5,
        accumulatedDepreciation: (a.purchaseCost || 0) * 0.3,
        companyId,
        calculatedAt: new Date(),
      }));
  }

  return coreService.request<AssetDepreciation[]>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/asset-depreciation`,
    params: { companyId },
  });
}

// ============================================================================
// API Functions - Automation
// ============================================================================

export async function getAutomationRules(companyId: string): Promise<SupportAutomationRule[]> {
  if (USE_MOCK_DATA) {
    return [
      {
        id: 'rule-1',
        name: 'Auto-assign high priority tickets',
        description: 'Automatically assigns high priority tickets to available senior agents',
        triggerType: 'ticket_created',
        triggerConditions: { priority: 'high' },
        actions: { assignToTeam: 'senior-team' },
        priority: 100,
        isActive: true,
        executionCount: 245,
        lastExecutedAt: new Date(),
        companyId,
        createdAt: new Date('2023-06-01'),
        updatedAt: new Date('2024-01-10'),
      },
    ];
  }

  return coreService.request<SupportAutomationRule[]>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/automation-rules`,
    params: { companyId },
  });
}

export async function createAutomationRule(data: Omit<SupportAutomationRule, 'id' | 'executionCount' | 'lastExecutedAt' | 'createdAt' | 'updatedAt'>): Promise<SupportAutomationRule> {
  if (USE_MOCK_DATA) {
    return {
      ...data,
      id: `rule-${Date.now()}`,
      executionCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return coreService.request<SupportAutomationRule>({
    method: 'POST',
    url: `${API_BASE_URL}/api/support/automation-rules`,
    data,
  });
}

export async function getEscalationRules(companyId: string): Promise<EscalationRule[]> {
  if (USE_MOCK_DATA) {
    return [
      {
        id: 'esc-1',
        name: 'Critical ticket escalation',
        priority: 'critical',
        triggerMinutes: 15,
        escalationType: 'notify',
        escalateTo: 'manager',
        notifyChannels: ['email', 'slack'],
        isActive: true,
        companyId,
        createdAt: new Date('2023-01-01'),
      },
    ];
  }

  return coreService.request<EscalationRule[]>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/escalation-rules`,
    params: { companyId },
  });
}

export async function getCannedResponses(companyId: string, category?: string): Promise<CannedResponse[]> {
  if (USE_MOCK_DATA) {
    return [
      {
        id: 'cr-1',
        title: 'Welcome greeting',
        content: 'Hello {{customer_name}}, thank you for contacting support. How can I help you today?',
        category: 'greeting',
        shortcut: '/greet',
        variables: ['customer_name'],
        usageCount: 520,
        isActive: true,
        companyId,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2024-01-10'),
      },
      {
        id: 'cr-2',
        title: 'Ticket acknowledgment',
        content: 'Thank you for your patience. We have received your request and our team is working on it.',
        category: 'acknowledgment',
        shortcut: '/ack',
        usageCount: 380,
        isActive: true,
        companyId,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2024-01-05'),
      },
    ];
  }

  return coreService.request<CannedResponse[]>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/canned-responses`,
    params: { companyId, category },
  });
}

// ============================================================================
// API Functions - Problem Management (ITIL)
// ============================================================================

export async function getKnownErrors(companyId: string): Promise<KnownError[]> {
  if (USE_MOCK_DATA) {
    return [
      {
        id: 'ke-1',
        errorId: 'KE-001',
        title: 'Login timeout on slow networks',
        description: 'Users experience timeout errors when logging in on slow network connections',
        symptom: 'Login page shows timeout error after 30 seconds',
        rootCause: 'Server-side timeout is set too low for slow connections',
        workaround: 'Retry login or use mobile data',
        permanentFix: 'Increase server timeout and add retry logic',
        affectedSystems: ['Authentication', 'Login Portal'],
        severity: 'medium',
        status: 'active',
        companyId,
        createdAt: new Date('2023-10-15'),
        updatedAt: new Date('2024-01-10'),
      },
    ];
  }

  return coreService.request<KnownError[]>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/known-errors`,
    params: { companyId },
  });
}

export async function getRootCauseAnalyses(companyId: string, problemId?: string): Promise<RootCauseAnalysis[]> {
  if (USE_MOCK_DATA) {
    return [];
  }

  return coreService.request<RootCauseAnalysis[]>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/root-cause-analyses`,
    params: { companyId, problemId },
  });
}

// ============================================================================
// API Functions - Omnichannel
// ============================================================================

export async function getOmnichannelConversations(params: {
  companyId: string;
  channel?: string;
  status?: string;
  agentId?: string;
  page?: number;
  limit?: number;
}): Promise<{ conversations: OmnichannelConversation[]; total: number; page: number; limit: number; totalPages: number }> {
  if (USE_MOCK_DATA) {
    return {
      conversations: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 20,
      totalPages: 0,
    };
  }

  return coreService.request<{ conversations: OmnichannelConversation[]; total: number; page: number; limit: number; totalPages: number }>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/omnichannel/conversations`,
    params,
  });
}

export async function getConversationMessages(conversationId: string, companyId: string): Promise<OmnichannelMessage[]> {
  if (USE_MOCK_DATA) {
    return [];
  }

  return coreService.request<OmnichannelMessage[]>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/omnichannel/conversations/${conversationId}/messages`,
    params: { companyId },
  });
}

export async function sendOmnichannelMessage(conversationId: string, companyId: string, data: {
  content: string;
  senderType: string;
  senderId: string;
  senderName: string;
}): Promise<OmnichannelMessage> {
  if (USE_MOCK_DATA) {
    return {
      id: `msg-${Date.now()}`,
      conversationId,
      channel: 'chat',
      content: data.content,
      senderType: data.senderType as OmnichannelMessage['senderType'],
      senderId: data.senderId,
      senderName: data.senderName,
      isRead: false,
      companyId,
      createdAt: new Date(),
    };
  }

  return coreService.request<OmnichannelMessage>({
    method: 'POST',
    url: `${API_BASE_URL}/api/support/omnichannel/conversations/${conversationId}/messages`,
    params: { companyId },
    data,
  });
}

// ============================================================================
// API Functions - CSAT
// ============================================================================

export async function getCSATSurveys(companyId: string): Promise<CSATSurvey[]> {
  if (USE_MOCK_DATA) {
    return [
      {
        id: 'survey-1',
        name: 'Post-Resolution Survey',
        triggerEvent: 'ticket_resolved',
        questions: [
          { type: 'rating', question: 'How satisfied were you with our support?' },
          { type: 'nps', question: 'How likely are you to recommend us?' },
          { type: 'text', question: 'Any additional feedback?' },
        ],
        thankYouMessage: 'Thank you for your feedback!',
        isActive: true,
        responseCount: 156,
        avgRating: 4.3,
        companyId,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2024-01-15'),
      },
    ];
  }

  return coreService.request<CSATSurvey[]>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/csat/surveys`,
    params: { companyId },
  });
}

export async function getCSATResponses(params: {
  companyId: string;
  surveyId?: string;
  ticketId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}): Promise<CSATResponse[]> {
  if (USE_MOCK_DATA) {
    return [];
  }

  return coreService.request<CSATResponse[]>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/csat/responses`,
    params: {
      ...params,
      dateFrom: params.dateFrom?.toISOString(),
      dateTo: params.dateTo?.toISOString(),
    },
  });
}

export async function getCSATAnalytics(companyId: string, dateFrom?: Date, dateTo?: Date): Promise<CSATAnalytics> {
  if (USE_MOCK_DATA) {
    return {
      totalResponses: 156,
      avgRating: 4.3,
      npsScore: 42,
      promoters: 68,
      passives: 52,
      detractors: 36,
    };
  }

  return coreService.request<CSATAnalytics>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/csat/analytics`,
    params: { companyId, dateFrom: dateFrom?.toISOString(), dateTo: dateTo?.toISOString() },
  });
}

// ============================================================================
// API Functions - Dashboard & Analytics
// ============================================================================

export async function getSupportDashboard(companyId: string): Promise<SupportDashboard> {
  if (USE_MOCK_DATA) {
    return mockDashboard;
  }

  return coreService.request<SupportDashboard>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/dashboard`,
    params: { companyId },
  });
}

export async function getAnalyticsSnapshot(companyId: string, period: string): Promise<SupportAnalyticsSnapshot | null> {
  if (USE_MOCK_DATA) {
    return {
      id: 'snapshot-1',
      snapshotDate: new Date(),
      period: period as SupportAnalyticsSnapshot['period'],
      totalTickets: 450,
      resolvedTickets: 380,
      avgResponseTime: 18,
      avgResolutionTime: 180,
      slaComplianceRate: 94,
      csatScore: 4.3,
      ticketsByChannel: { email: 200, chat: 150, phone: 60, portal: 40 },
      ticketsByPriority: { low: 100, medium: 250, high: 80, critical: 20 },
      ticketsByCategory: { technical: 200, billing: 100, general: 150 },
      companyId,
    };
  }

  return coreService.request<SupportAnalyticsSnapshot>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/analytics/snapshot`,
    params: { companyId, period },
  });
}

// ============================================================================
// API Functions - Settings
// ============================================================================

export async function getSupportSettings(companyId: string): Promise<SupportModuleSettings> {
  if (USE_MOCK_DATA) {
    return {
      id: 'settings-1',
      defaultTicketPriority: 'medium',
      autoAssignEnabled: true,
      slaTrackingEnabled: true,
      csatEnabled: true,
      businessHoursStart: '09:00',
      businessHoursEnd: '18:00',
      businessDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      ticketNumberPrefix: 'TKT',
      allowCustomerPortal: true,
      emailNotificationsEnabled: true,
      companyId,
    };
  }

  return coreService.request<SupportModuleSettings>({
    method: 'GET',
    url: `${API_BASE_URL}/api/support/settings`,
    params: { companyId },
  });
}

export async function updateSupportSettings(companyId: string, data: Partial<SupportModuleSettings>): Promise<SupportModuleSettings> {
  if (USE_MOCK_DATA) {
    return {
      id: 'settings-1',
      defaultTicketPriority: data.defaultTicketPriority || 'medium',
      autoAssignEnabled: data.autoAssignEnabled ?? true,
      slaTrackingEnabled: data.slaTrackingEnabled ?? true,
      csatEnabled: data.csatEnabled ?? true,
      businessHoursStart: data.businessHoursStart || '09:00',
      businessHoursEnd: data.businessHoursEnd || '18:00',
      businessDays: data.businessDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      ticketNumberPrefix: data.ticketNumberPrefix || 'TKT',
      allowCustomerPortal: data.allowCustomerPortal ?? true,
      emailNotificationsEnabled: data.emailNotificationsEnabled ?? true,
      companyId,
    };
  }

  return coreService.request<SupportModuleSettings>({
    method: 'PUT',
    url: `${API_BASE_URL}/api/support/settings`,
    params: { companyId },
    data,
  });
}

// ============================================================================
// Export Service Object
// ============================================================================

export const supportManagementService = {
  // Tickets
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  assignTicket,
  addTicketComment,
  getTicketCategories,

  // Agents
  getSupportAgents,
  getAgentById,
  updateAgentStatus,
  getAgentSkillMatrix,
  getTeamPerformance,
  getWorkloadDistribution,

  // SLA
  getSLAPolicies,
  createSLAPolicy,
  getSLABreaches,
  getSLADashboard,

  // IT Assets
  getITAssets,
  getITAssetById,
  createITAsset,
  updateITAsset,
  getSoftwareLicenses,
  getAssetDepreciation,

  // Automation
  getAutomationRules,
  createAutomationRule,
  getEscalationRules,
  getCannedResponses,

  // Problem Management
  getKnownErrors,
  getRootCauseAnalyses,

  // Omnichannel
  getOmnichannelConversations,
  getConversationMessages,
  sendOmnichannelMessage,

  // CSAT
  getCSATSurveys,
  getCSATResponses,
  getCSATAnalytics,

  // Dashboard & Analytics
  getSupportDashboard,
  getAnalyticsSnapshot,

  // Settings
  getSupportSettings,
  updateSupportSettings,
};

export default supportManagementService;
