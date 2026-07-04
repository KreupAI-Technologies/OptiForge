import { apiClient } from './api/client';

// ============================================================================
// TYPES - Team Activity
// ============================================================================

export type ActivityType = 'create' | 'update' | 'delete' | 'comment' | 'assign' | 'complete' | 'approve' | 'reject' | 'upload' | 'download' | 'share' | 'mention';
export type ResourceActivityType = 'work_order' | 'production_plan' | 'shift' | 'machine' | 'quality_check' | 'maintenance' | 'inventory' | 'document' | 'other';
export type UserStatus = 'online' | 'away' | 'busy' | 'offline';

export interface TeamActivity {
  id: string;
  companyId: string;
  activityType: ActivityType;
  activityDescription: string;
  activityAt: Date;
  userId: string;
  userName: string;
  userAvatar?: string;
  userStatus?: UserStatus;
  teamId?: string;
  teamName?: string;
  resourceType?: ResourceActivityType;
  resourceId?: string;
  resourceName?: string;
  oldValue?: any;
  newValue?: any;
  metadata?: any;
  isImportant: boolean;
  createdAt: Date;
}

// ============================================================================
// TYPES - Team Message
// ============================================================================

export type MessageType = 'text' | 'file' | 'image' | 'system' | 'announcement';
export type ChannelType = 'direct' | 'group' | 'shift' | 'department' | 'broadcast';

export interface TeamMessage {
  id: string;
  companyId: string;
  channelId: string;
  channelType: ChannelType;
  channelName?: string;
  messageType: MessageType;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  replyToId?: string;
  mentions?: string[];
  attachments?: any[];
  reactions?: any[];
  readBy?: string[];
  isEdited: boolean;
  editedAt?: Date;
  isPinned: boolean;
  isDeleted: boolean;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// TYPES - Shift Handoff
// ============================================================================

export type HandoffStatus = 'pending' | 'in_progress' | 'completed' | 'acknowledged';
export type HandoffShiftType = 'morning' | 'afternoon' | 'night' | 'custom';
export type ItemPriority = 'low' | 'medium' | 'high' | 'critical';

export interface ShiftHandoff {
  id: string;
  companyId: string;
  handoffDate: Date;
  outgoingShiftType: HandoffShiftType;
  incomingShiftType: HandoffShiftType;
  outgoingShiftId: string;
  incomingShiftId: string;
  outgoingUserId: string;
  outgoingUserName: string;
  incomingUserId?: string;
  incomingUserName?: string;
  workstationId?: string;
  workstationName?: string;
  productionLineId?: string;
  productionLineName?: string;
  status: HandoffStatus;
  checklistItems?: any[];
  activeIssues?: any[];
  productionStatus?: any;
  pendingTasks?: any[];
  safetyNotes?: any[];
  generalNotes?: string;
  handoffStartedAt?: Date;
  handoffCompletedAt?: Date;
  acknowledgedAt?: Date;
  acknowledgementNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// TYPES - Customer Portal Access
// ============================================================================

export type PortalAccessLevel = 'view_only' | 'limited' | 'standard' | 'full';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revoked';

export interface CustomerPortalAccess {
  id: string;
  companyId: string;
  customerId: string;
  customerName: string;
  contactEmail: string;
  contactName: string;
  accessLevel: PortalAccessLevel;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: Date;
  moduleAccess?: string[];
  dataFilters?: any;
  documentAccess?: string[];
  notificationPreferences?: any;
  lastLoginAt?: Date;
  loginCount: number;
  accessToken?: string;
  tokenExpiresAt?: Date;
  validFrom?: Date;
  validUntil?: Date;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

class CollaborationService {
  // Team Activity
  async getTeamActivities(filters?: {
    companyId?: string;
    userId?: string;
    activityType?: ActivityType;
    resourceType?: ResourceActivityType;
    teamId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<TeamActivity[]> {
    const params = new URLSearchParams();
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.activityType) params.append('activityType', filters.activityType);
    if (filters?.resourceType) params.append('resourceType', filters.resourceType);
    if (filters?.teamId) params.append('teamId', filters.teamId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    const response = await apiClient.get<TeamActivity[]>(`/production/collaboration/team-activity?${params.toString()}`);
    return response.data;
  }

  async getTeamActivityById(id: string): Promise<TeamActivity> {
    const response = await apiClient.get<TeamActivity>(`/production/collaboration/team-activity/${id}`);
    return response.data;
  }

  async logActivity(data: {
    companyId: string;
    userId: string;
    userName: string;
    activityType: ActivityType;
    description: string;
    resourceType?: ResourceActivityType;
    resourceId?: string;
    resourceName?: string;
    metadata?: any;
  }): Promise<TeamActivity> {
    const response = await apiClient.post<TeamActivity>('/production/collaboration/team-activity', data);
    return response.data;
  }

  async getRecentActivity(companyId: string, limit?: number): Promise<TeamActivity[]> {
    let url = `/production/collaboration/team-activity/recent?companyId=${companyId}`;
    if (limit) url += `&limit=${limit}`;
    const response = await apiClient.get<TeamActivity[]>(url);
    return response.data;
  }

  async getActivityFeed(companyId: string, options?: {
    teamId?: string;
    userId?: string;
    resourceType?: ResourceActivityType;
    limit?: number;
    offset?: number;
  }): Promise<{ activities: TeamActivity[]; total: number }> {
    const params = new URLSearchParams();
    params.append('companyId', companyId);
    if (options?.teamId) params.append('teamId', options.teamId);
    if (options?.userId) params.append('userId', options.userId);
    if (options?.resourceType) params.append('resourceType', options.resourceType);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    const response = await apiClient.get<{ activities: TeamActivity[]; total: number }>(`/production/collaboration/team-activity/feed?${params.toString()}`);
    return response.data;
  }

  async getActiveUsers(companyId: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/production/collaboration/team-activity/active-users?companyId=${companyId}`);
    return response.data;
  }

  async getActivitySummary(companyId: string, startDate: string, endDate: string): Promise<any> {
    const response = await apiClient.get<any>(`/production/collaboration/team-activity/summary?companyId=${companyId}&startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }

  // Team Messages
  async getMessages(filters?: { companyId?: string; channelId?: string; channelType?: ChannelType; senderId?: string; limit?: number; before?: string }): Promise<TeamMessage[]> {
    const params = new URLSearchParams();
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.channelId) params.append('channelId', filters.channelId);
    if (filters?.channelType) params.append('channelType', filters.channelType);
    if (filters?.senderId) params.append('senderId', filters.senderId);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.before) params.append('before', filters.before);
    const response = await apiClient.get<TeamMessage[]>(`/production/collaboration/team-messages?${params.toString()}`);
    return response.data;
  }

  async getMessageById(id: string): Promise<TeamMessage> {
    const response = await apiClient.get<TeamMessage>(`/production/collaboration/team-messages/${id}`);
    return response.data;
  }

  async sendMessage(data: {
    companyId: string;
    channelId: string;
    channelType: ChannelType;
    messageType: MessageType;
    content: string;
    senderId: string;
    senderName: string;
    replyToId?: string;
    mentions?: string[];
    attachments?: any[];
  }): Promise<TeamMessage> {
    const response = await apiClient.post<TeamMessage>('/production/collaboration/team-messages', data);
    return response.data;
  }

  async updateMessage(id: string, content: string, userId: string): Promise<TeamMessage> {
    const response = await apiClient.put<TeamMessage>(`/production/collaboration/team-messages/${id}`, { content, userId });
    return response.data;
  }

  async deleteMessage(id: string, userId: string): Promise<TeamMessage> {
    const response = await apiClient.post<TeamMessage>(`/production/collaboration/team-messages/${id}/delete`, { userId });
    return response.data;
  }

  async addReaction(id: string, userId: string, emoji: string): Promise<TeamMessage> {
    const response = await apiClient.post<TeamMessage>(`/production/collaboration/team-messages/${id}/reaction`, { userId, emoji });
    return response.data;
  }

  async markAsRead(id: string, userId: string): Promise<TeamMessage> {
    const response = await apiClient.post<TeamMessage>(`/production/collaboration/team-messages/${id}/read`, { userId });
    return response.data;
  }

  async pinMessage(id: string): Promise<TeamMessage> {
    const response = await apiClient.post<TeamMessage>(`/production/collaboration/team-messages/${id}/pin`, {});
    return response.data;
  }

  async unpinMessage(id: string): Promise<TeamMessage> {
    const response = await apiClient.post<TeamMessage>(`/production/collaboration/team-messages/${id}/unpin`, {});
    return response.data;
  }

  async getChannelMessages(channelId: string, limit?: number, before?: string): Promise<TeamMessage[]> {
    let url = `/production/collaboration/team-messages/channel/${channelId}`;
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (before) params.append('before', before);
    if (params.toString()) url += `?${params.toString()}`;
    const response = await apiClient.get<TeamMessage[]>(url);
    return response.data;
  }

  async getUnreadCount(channelId: string, userId: string): Promise<number> {
    const response = await apiClient.get<{ count: number }>(`/production/collaboration/team-messages/channel/${channelId}/unread?userId=${userId}`);
    return response.data.count;
  }

  // Shift Handoffs
  async getShiftHandoffs(filters?: {
    companyId?: string;
    status?: HandoffStatus;
    outgoingShiftType?: HandoffShiftType;
    incomingShiftType?: HandoffShiftType;
    workstationId?: string;
    productionLineId?: string;
  }): Promise<ShiftHandoff[]> {
    const params = new URLSearchParams();
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.outgoingShiftType) params.append('outgoingShiftType', filters.outgoingShiftType);
    if (filters?.incomingShiftType) params.append('incomingShiftType', filters.incomingShiftType);
    if (filters?.workstationId) params.append('workstationId', filters.workstationId);
    if (filters?.productionLineId) params.append('productionLineId', filters.productionLineId);
    const response = await apiClient.get<ShiftHandoff[]>(`/production/collaboration/shift-handoffs?${params.toString()}`);
    return response.data;
  }

  async getShiftHandoffById(id: string): Promise<ShiftHandoff> {
    const response = await apiClient.get<ShiftHandoff>(`/production/collaboration/shift-handoffs/${id}`);
    return response.data;
  }

  async createShiftHandoff(data: Partial<ShiftHandoff>): Promise<ShiftHandoff> {
    const response = await apiClient.post<ShiftHandoff>('/production/collaboration/shift-handoffs', data);
    return response.data;
  }

  async updateShiftHandoff(id: string, data: Partial<ShiftHandoff>): Promise<ShiftHandoff> {
    const response = await apiClient.put<ShiftHandoff>(`/production/collaboration/shift-handoffs/${id}`, data);
    return response.data;
  }

  async deleteShiftHandoff(id: string): Promise<void> {
    await apiClient.delete(`/production/collaboration/shift-handoffs/${id}`);
  }

  async startHandoff(id: string): Promise<ShiftHandoff> {
    const response = await apiClient.post<ShiftHandoff>(`/production/collaboration/shift-handoffs/${id}/start`, {});
    return response.data;
  }

  async completeHandoff(id: string): Promise<ShiftHandoff> {
    const response = await apiClient.post<ShiftHandoff>(`/production/collaboration/shift-handoffs/${id}/complete`, {});
    return response.data;
  }

  async acknowledgeHandoff(id: string, data: { incomingUserId: string; incomingUserName: string; notes?: string }): Promise<ShiftHandoff> {
    const response = await apiClient.post<ShiftHandoff>(`/production/collaboration/shift-handoffs/${id}/acknowledge`, data);
    return response.data;
  }

  async updateChecklistItem(id: string, itemId: string, update: { isCompleted: boolean; notes?: string; completedBy?: string }): Promise<ShiftHandoff> {
    const response = await apiClient.put<ShiftHandoff>(`/production/collaboration/shift-handoffs/${id}/checklist/${itemId}`, update);
    return response.data;
  }

  async addActiveIssue(id: string, issue: any): Promise<ShiftHandoff> {
    const response = await apiClient.post<ShiftHandoff>(`/production/collaboration/shift-handoffs/${id}/issue`, issue);
    return response.data;
  }

  async resolveIssue(id: string, issueId: string, resolution: string): Promise<ShiftHandoff> {
    const response = await apiClient.put<ShiftHandoff>(`/production/collaboration/shift-handoffs/${id}/issue/${issueId}/resolve`, { resolution });
    return response.data;
  }

  async getPendingHandoffs(companyId: string): Promise<ShiftHandoff[]> {
    const response = await apiClient.get<ShiftHandoff[]>(`/production/collaboration/shift-handoffs/pending?companyId=${companyId}`);
    return response.data;
  }

  async getHandoffSummary(companyId: string, startDate: string, endDate: string): Promise<any> {
    const response = await apiClient.get<any>(`/production/collaboration/shift-handoffs/summary?companyId=${companyId}&startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }

  // Customer Portal Access
  async getCustomerPortalAccesses(filters?: {
    companyId?: string;
    customerId?: string;
    accessLevel?: PortalAccessLevel;
    approvalStatus?: ApprovalStatus;
  }): Promise<CustomerPortalAccess[]> {
    const params = new URLSearchParams();
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.customerId) params.append('customerId', filters.customerId);
    if (filters?.accessLevel) params.append('accessLevel', filters.accessLevel);
    if (filters?.approvalStatus) params.append('approvalStatus', filters.approvalStatus);
    const response = await apiClient.get<CustomerPortalAccess[]>(`/production/collaboration/customer-portal-access?${params.toString()}`);
    return response.data;
  }

  async getCustomerPortalAccessById(id: string): Promise<CustomerPortalAccess> {
    const response = await apiClient.get<CustomerPortalAccess>(`/production/collaboration/customer-portal-access/${id}`);
    return response.data;
  }

  async createCustomerPortalAccess(data: Partial<CustomerPortalAccess>): Promise<CustomerPortalAccess> {
    const response = await apiClient.post<CustomerPortalAccess>('/production/collaboration/customer-portal-access', data);
    return response.data;
  }

  async updateCustomerPortalAccess(id: string, data: Partial<CustomerPortalAccess>): Promise<CustomerPortalAccess> {
    const response = await apiClient.put<CustomerPortalAccess>(`/production/collaboration/customer-portal-access/${id}`, data);
    return response.data;
  }

  async deleteCustomerPortalAccess(id: string): Promise<void> {
    await apiClient.delete(`/production/collaboration/customer-portal-access/${id}`);
  }

  async approveAccess(id: string, approvedBy: string): Promise<CustomerPortalAccess> {
    const response = await apiClient.post<CustomerPortalAccess>(`/production/collaboration/customer-portal-access/${id}/approve`, { approvedBy });
    return response.data;
  }

  async rejectAccess(id: string, rejectedBy: string, reason: string): Promise<CustomerPortalAccess> {
    const response = await apiClient.post<CustomerPortalAccess>(`/production/collaboration/customer-portal-access/${id}/reject`, { rejectedBy, reason });
    return response.data;
  }

  async revokeAccess(id: string, revokedBy: string, reason: string): Promise<CustomerPortalAccess> {
    const response = await apiClient.post<CustomerPortalAccess>(`/production/collaboration/customer-portal-access/${id}/revoke`, { revokedBy, reason });
    return response.data;
  }

  async generateToken(id: string): Promise<CustomerPortalAccess> {
    const response = await apiClient.post<CustomerPortalAccess>(`/production/collaboration/customer-portal-access/${id}/generate-token`, {});
    return response.data;
  }

  async recordLogin(id: string): Promise<CustomerPortalAccess> {
    const response = await apiClient.post<CustomerPortalAccess>(`/production/collaboration/customer-portal-access/${id}/login`, {});
    return response.data;
  }

  async updateModuleAccess(id: string, modules: string[]): Promise<CustomerPortalAccess> {
    const response = await apiClient.put<CustomerPortalAccess>(`/production/collaboration/customer-portal-access/${id}/module-access`, { modules });
    return response.data;
  }

  async getAccessSummary(companyId: string): Promise<any> {
    const response = await apiClient.get<any>(`/production/collaboration/customer-portal-access/summary?companyId=${companyId}`);
    return response.data;
  }

  async getActiveTokens(companyId: string): Promise<CustomerPortalAccess[]> {
    const response = await apiClient.get<CustomerPortalAccess[]>(`/production/collaboration/customer-portal-access/active-tokens?companyId=${companyId}`);
    return response.data;
  }
}

export const collaborationService = new CollaborationService();

// ============================================================================
// COLLABORATION ORPHAN PAGES — files / folders / channels / messages
// Direct fetch against the NestJS collaboration module (port 3001, /api/v1)
// with the x-company-id header. Reads are defensive and resolve to an array.
// ============================================================================

const COLLAB_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function collabGetJson<T>(path: string): Promise<T> {
  const res = await fetch(`${COLLAB_API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', 'x-company-id': 'test' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json() as Promise<T>;
}

function collabToArray<T = any>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) {
    return (raw as any).data as T[];
  }
  return [];
}

export interface CollabFolderItem {
  id: string;
  name?: string;
  itemCount?: number;
  sizeBytes?: number | string;
  owner?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface CollabFileItem {
  id: string;
  name?: string;
  fileType?: string;
  sizeBytes?: number | string;
  owner?: string;
  isStarred?: boolean;
  isShared?: boolean;
  updatedAt?: string;
  [key: string]: any;
}

export interface CollabChannelItem {
  id: string;
  name?: string;
  channelType?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  memberCount?: number;
  status?: string;
  [key: string]: any;
}

export interface CollabMessageItem {
  id: string;
  channelId?: string;
  senderName?: string;
  senderId?: string;
  content?: string;
  messageType?: string;
  status?: string;
  sentAt?: string;
  createdAt?: string;
  [key: string]: any;
}

export const collaborationOrphanService = {
  async getFolders(): Promise<CollabFolderItem[]> {
    return collabToArray<CollabFolderItem>(await collabGetJson('/collaboration/folders'));
  },
  async getFiles(): Promise<CollabFileItem[]> {
    return collabToArray<CollabFileItem>(await collabGetJson('/collaboration/files'));
  },
  async getChannels(): Promise<CollabChannelItem[]> {
    return collabToArray<CollabChannelItem>(await collabGetJson('/collaboration/channels'));
  },
  async getMessages(channelId?: string): Promise<CollabMessageItem[]> {
    const q = channelId ? `?channelId=${encodeURIComponent(channelId)}` : '';
    return collabToArray<CollabMessageItem>(await collabGetJson(`/collaboration/messages${q}`));
  },
};
