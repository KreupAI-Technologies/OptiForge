import { apiClient } from './api/client';
import { USE_LIVE_API } from './api-flags';

/**
 * Notification Service
 * Handles all notification-related API operations for the IT Admin module
 */

const USE_MOCK_DATA = !USE_LIVE_API;

// Domain (NestJS) backend base URL — used by the user-facing notification
// endpoints below. This backend returns raw JSON (no { success, data }
// envelope), so we hit it directly with fetch + cookie auth.
const DOMAIN_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// ============================================================================
// User-facing notification API (NestJS notifications module)
// Backend shape: Prisma `Notification` model
//   { id, userId, type, title, message, metadata, isRead, priority,
//     actionUrl, createdAt, updatedAt }
// ============================================================================

export interface UserNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown> | null;
  isRead: boolean;
  priority: string; // 'info' | 'warning' | 'urgent'
  actionUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedUserNotifications {
  notifications: UserNotification[];
  total: number;
}

async function domainRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${DOMAIN_API_BASE_URL}${endpoint}`, {
    credentials: 'include', // send HttpOnly JWT cookie
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  // Endpoints that return no body (e.g. read-all) — guard against empty JSON.
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/**
 * User-facing notification operations backed by the NestJS notifications
 * controller (global prefix `api/v1`).
 */
export const userNotificationService = {
  /** GET /notifications/user/:userId — paginated list for a user */
  async getForUser(
    userId: string,
    page = 1,
    limit = 50,
  ): Promise<PaginatedUserNotifications> {
    return domainRequest<PaginatedUserNotifications>(
      `/notifications/user/${userId}?page=${page}&limit=${limit}`,
    );
  },

  /** GET /notifications/user/:userId/unread-count */
  async getUnreadCount(userId: string): Promise<number> {
    const res = await domainRequest<{ count: number }>(
      `/notifications/user/${userId}/unread-count`,
    );
    return res.count;
  },

  /** PATCH /notifications/:id/read — mark a single notification as read */
  async markRead(id: string, userId: string): Promise<boolean> {
    return domainRequest<boolean>(`/notifications/${id}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ userId }),
    });
  },

  /** PATCH /notifications/user/:userId/read-all — mark all as read */
  async markAllRead(userId: string): Promise<number> {
    return domainRequest<number>(`/notifications/user/${userId}/read-all`, {
      method: 'PATCH',
    });
  },
};

// ============================================================================
// Interfaces
// ============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';
export type NotificationChannel = 'in-app' | 'email' | 'sms' | 'push';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationCategory =
  | 'workflow'
  | 'system'
  | 'order'
  | 'inventory'
  | 'hr'
  | 'finance'
  | 'quality'
  | 'maintenance'
  | 'security';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  status: NotificationStatus;
  recipientId: string;
  recipientName: string;
  recipientEmail?: string;
  senderId?: string;
  senderName?: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority?: NotificationPriority;
  channels: NotificationChannel[];
  recipientIds: string[];
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
  scheduledAt?: string;
  expiresAt?: string;
}

export interface UpdateNotificationDto {
  title?: string;
  message?: string;
  priority?: NotificationPriority;
  scheduledAt?: string;
  expiresAt?: string;
}

export interface NotificationFilters {
  type?: NotificationType;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  status?: NotificationStatus;
  channel?: NotificationChannel;
  isRead?: boolean;
  recipientId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  code: string;
  category: NotificationCategory;
  subject: string;
  body: string;
  channels: NotificationChannel[];
  variables: string[];
  isActive: boolean;
}

// ============================================================================
// Mock Data
// ============================================================================

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    title: 'Work Order Approval Required',
    message: 'Work Order WO-2025-0089 requires your approval. Requested by Production Manager.',
    type: 'warning',
    category: 'workflow',
    priority: 'high',
    channels: ['in-app', 'email'],
    status: 'delivered',
    recipientId: 'user-001',
    recipientName: 'Rajesh Kumar',
    recipientEmail: 'rajesh.kumar@manufacturingos.com',
    senderId: 'user-002',
    senderName: 'System',
    actionUrl: '/production/work-orders/WO-2025-0089',
    actionLabel: 'Review Order',
    metadata: { workOrderId: 'WO-2025-0089', amount: 450000 },
    isRead: false,
    sentAt: '2025-01-25T09:30:00Z',
    deliveredAt: '2025-01-25T09:30:05Z',
    createdAt: '2025-01-25T09:30:00Z',
    updatedAt: '2025-01-25T09:30:05Z',
  },
  {
    id: 'notif-002',
    title: 'Low Stock Alert',
    message: 'Item SKU-MK-2024-001 (Modular Kitchen Panel SS-304) has fallen below minimum stock level. Current: 15 units, Minimum: 50 units.',
    type: 'error',
    category: 'inventory',
    priority: 'urgent',
    channels: ['in-app', 'email', 'sms'],
    status: 'delivered',
    recipientId: 'user-003',
    recipientName: 'Inventory Manager',
    recipientEmail: 'inventory@manufacturingos.com',
    senderName: 'Inventory System',
    actionUrl: '/inventory/items/SKU-MK-2024-001',
    actionLabel: 'View Item',
    metadata: { itemId: 'SKU-MK-2024-001', currentStock: 15, minStock: 50 },
    isRead: true,
    readAt: '2025-01-25T10:15:00Z',
    sentAt: '2025-01-25T08:00:00Z',
    deliveredAt: '2025-01-25T08:00:10Z',
    createdAt: '2025-01-25T08:00:00Z',
    updatedAt: '2025-01-25T10:15:00Z',
  },
  {
    id: 'notif-003',
    title: 'New Sales Order Created',
    message: 'Sales Order SO-2025-0156 has been created for customer Sharma Modular Kitchens. Total Value: INR 12,50,000.',
    type: 'success',
    category: 'order',
    priority: 'medium',
    channels: ['in-app'],
    status: 'read',
    recipientId: 'user-004',
    recipientName: 'Sales Manager',
    recipientEmail: 'sales@manufacturingos.com',
    senderId: 'user-005',
    senderName: 'Anita Desai',
    actionUrl: '/sales/orders/SO-2025-0156',
    actionLabel: 'View Order',
    metadata: { orderId: 'SO-2025-0156', customerId: 'cust-001', amount: 1250000 },
    isRead: true,
    readAt: '2025-01-24T15:45:00Z',
    sentAt: '2025-01-24T14:30:00Z',
    deliveredAt: '2025-01-24T14:30:02Z',
    createdAt: '2025-01-24T14:30:00Z',
    updatedAt: '2025-01-24T15:45:00Z',
  },
  {
    id: 'notif-004',
    title: 'Leave Request Approved',
    message: 'Your leave request for January 28-30, 2025 has been approved by HR Manager.',
    type: 'success',
    category: 'hr',
    priority: 'low',
    channels: ['in-app', 'email'],
    status: 'delivered',
    recipientId: 'user-006',
    recipientName: 'Deepak Verma',
    recipientEmail: 'deepak.verma@manufacturingos.com',
    senderId: 'user-002',
    senderName: 'Priya Sharma',
    actionUrl: '/hr/leave/requests/LR-2025-0034',
    actionLabel: 'View Details',
    metadata: { leaveRequestId: 'LR-2025-0034', startDate: '2025-01-28', endDate: '2025-01-30' },
    isRead: false,
    sentAt: '2025-01-24T11:00:00Z',
    deliveredAt: '2025-01-24T11:00:05Z',
    createdAt: '2025-01-24T11:00:00Z',
    updatedAt: '2025-01-24T11:00:05Z',
  },
  {
    id: 'notif-005',
    title: 'System Maintenance Scheduled',
    message: 'System maintenance is scheduled for January 27, 2025 from 2:00 AM to 4:00 AM IST. Please save your work before this time.',
    type: 'system',
    category: 'system',
    priority: 'high',
    channels: ['in-app', 'email'],
    status: 'delivered',
    recipientId: 'all',
    recipientName: 'All Users',
    senderName: 'IT Admin',
    metadata: { maintenanceWindow: '2025-01-27T02:00:00Z', duration: '2 hours' },
    isRead: false,
    sentAt: '2025-01-25T06:00:00Z',
    deliveredAt: '2025-01-25T06:00:30Z',
    createdAt: '2025-01-25T06:00:00Z',
    updatedAt: '2025-01-25T06:00:30Z',
  },
  {
    id: 'notif-006',
    title: 'Invoice Payment Received',
    message: 'Payment of INR 5,00,000 received for Invoice INV-2025-0045 from Prestige Developers.',
    type: 'success',
    category: 'finance',
    priority: 'medium',
    channels: ['in-app', 'email'],
    status: 'delivered',
    recipientId: 'user-007',
    recipientName: 'Finance Manager',
    recipientEmail: 'finance@manufacturingos.com',
    senderName: 'Payment Gateway',
    actionUrl: '/finance/invoices/INV-2025-0045',
    actionLabel: 'View Invoice',
    metadata: { invoiceId: 'INV-2025-0045', amount: 500000, paymentMethod: 'bank_transfer' },
    isRead: true,
    readAt: '2025-01-23T16:30:00Z',
    sentAt: '2025-01-23T16:00:00Z',
    deliveredAt: '2025-01-23T16:00:03Z',
    createdAt: '2025-01-23T16:00:00Z',
    updatedAt: '2025-01-23T16:30:00Z',
  },
  {
    id: 'notif-007',
    title: 'Quality Inspection Failed',
    message: 'Quality inspection QC-2025-0078 for Batch B-2025-0234 has failed. NCR has been created.',
    type: 'error',
    category: 'quality',
    priority: 'high',
    channels: ['in-app', 'email', 'sms'],
    status: 'delivered',
    recipientId: 'user-008',
    recipientName: 'Quality Manager',
    recipientEmail: 'quality@manufacturingos.com',
    senderId: 'user-009',
    senderName: 'QC Inspector',
    actionUrl: '/quality/inspections/QC-2025-0078',
    actionLabel: 'View Report',
    metadata: { inspectionId: 'QC-2025-0078', batchId: 'B-2025-0234', ncrId: 'NCR-2025-0012' },
    isRead: false,
    sentAt: '2025-01-25T11:45:00Z',
    deliveredAt: '2025-01-25T11:45:08Z',
    createdAt: '2025-01-25T11:45:00Z',
    updatedAt: '2025-01-25T11:45:08Z',
  },
  {
    id: 'notif-008',
    title: 'Equipment Maintenance Due',
    message: 'Preventive maintenance for CNC Machine (EQ-CNC-001) is due on January 30, 2025. Please schedule accordingly.',
    type: 'warning',
    category: 'maintenance',
    priority: 'medium',
    channels: ['in-app', 'email'],
    status: 'delivered',
    recipientId: 'user-010',
    recipientName: 'Maintenance Supervisor',
    recipientEmail: 'maintenance@manufacturingos.com',
    senderName: 'Maintenance System',
    actionUrl: '/maintenance/equipment/EQ-CNC-001',
    actionLabel: 'Schedule Maintenance',
    metadata: { equipmentId: 'EQ-CNC-001', maintenanceType: 'preventive', dueDate: '2025-01-30' },
    isRead: true,
    readAt: '2025-01-24T09:00:00Z',
    sentAt: '2025-01-23T08:00:00Z',
    deliveredAt: '2025-01-23T08:00:05Z',
    createdAt: '2025-01-23T08:00:00Z',
    updatedAt: '2025-01-24T09:00:00Z',
  },
  {
    id: 'notif-009',
    title: 'Security Alert: Multiple Failed Login Attempts',
    message: 'Multiple failed login attempts detected for user account vikram.singh@manufacturingos.com. Account has been temporarily locked.',
    type: 'error',
    category: 'security',
    priority: 'urgent',
    channels: ['in-app', 'email', 'sms'],
    status: 'delivered',
    recipientId: 'user-011',
    recipientName: 'IT Administrator',
    recipientEmail: 'admin@manufacturingos.com',
    senderName: 'Security System',
    actionUrl: '/it-admin/users/vikram.singh',
    actionLabel: 'Review Account',
    metadata: { userId: 'vikram.singh', attempts: 5, ipAddress: '192.168.1.105' },
    isRead: false,
    sentAt: '2025-01-25T14:00:00Z',
    deliveredAt: '2025-01-25T14:00:02Z',
    createdAt: '2025-01-25T14:00:00Z',
    updatedAt: '2025-01-25T14:00:02Z',
  },
  {
    id: 'notif-010',
    title: 'Purchase Order Approved',
    message: 'Purchase Order PO-2025-0067 for INR 8,50,000 has been approved and sent to vendor.',
    type: 'info',
    category: 'order',
    priority: 'low',
    channels: ['in-app'],
    status: 'read',
    recipientId: 'user-012',
    recipientName: 'Purchase Manager',
    recipientEmail: 'purchase@manufacturingos.com',
    senderId: 'user-007',
    senderName: 'Finance Manager',
    actionUrl: '/procurement/purchase-orders/PO-2025-0067',
    actionLabel: 'View PO',
    metadata: { poId: 'PO-2025-0067', vendorId: 'vendor-003', amount: 850000 },
    isRead: true,
    readAt: '2025-01-22T17:30:00Z',
    sentAt: '2025-01-22T16:00:00Z',
    deliveredAt: '2025-01-22T16:00:01Z',
    createdAt: '2025-01-22T16:00:00Z',
    updatedAt: '2025-01-22T17:30:00Z',
  },
];

export const MOCK_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'template-001',
    name: 'Workflow Approval Required',
    code: 'WORKFLOW_APPROVAL',
    category: 'workflow',
    subject: '{{documentType}} Approval Required - {{documentNumber}}',
    body: '{{documentType}} {{documentNumber}} requires your approval. Requested by {{requesterName}}. Amount: {{amount}}.',
    channels: ['in-app', 'email'],
    variables: ['documentType', 'documentNumber', 'requesterName', 'amount'],
    isActive: true,
  },
  {
    id: 'template-002',
    name: 'Low Stock Alert',
    code: 'LOW_STOCK',
    category: 'inventory',
    subject: 'Low Stock Alert - {{itemName}}',
    body: 'Item {{itemCode}} ({{itemName}}) has fallen below minimum stock level. Current: {{currentStock}} units, Minimum: {{minStock}} units.',
    channels: ['in-app', 'email', 'sms'],
    variables: ['itemCode', 'itemName', 'currentStock', 'minStock'],
    isActive: true,
  },
  {
    id: 'template-003',
    name: 'Order Confirmation',
    code: 'ORDER_CONFIRMATION',
    category: 'order',
    subject: 'Order Confirmation - {{orderNumber}}',
    body: 'Your order {{orderNumber}} has been confirmed. Total Value: {{currency}} {{amount}}. Expected delivery: {{deliveryDate}}.',
    channels: ['in-app', 'email'],
    variables: ['orderNumber', 'currency', 'amount', 'deliveryDate'],
    isActive: true,
  },
];

// ============================================================================
// Notification Service Class
// ============================================================================

export class NotificationService {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await apiClient.request<T>({
      url: endpoint,
      method: options?.method || 'GET',
      data: options?.body ? JSON.parse(options.body as string) : undefined,
      headers: options?.headers as any,
    });

    return response.data;
  }

  /**
   * Get all notifications with optional filters
   */
  static async getAllNotifications(filters?: NotificationFilters): Promise<Notification[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredNotifications = [...MOCK_NOTIFICATIONS];

      if (filters?.type) {
        filteredNotifications = filteredNotifications.filter((n) => n.type === filters.type);
      }
      if (filters?.category) {
        filteredNotifications = filteredNotifications.filter((n) => n.category === filters.category);
      }
      if (filters?.priority) {
        filteredNotifications = filteredNotifications.filter((n) => n.priority === filters.priority);
      }
      if (filters?.status) {
        filteredNotifications = filteredNotifications.filter((n) => n.status === filters.status);
      }
      if (filters?.channel) {
        filteredNotifications = filteredNotifications.filter((n) => n.channels.includes(filters.channel!));
      }
      if (filters?.isRead !== undefined) {
        filteredNotifications = filteredNotifications.filter((n) => n.isRead === filters.isRead);
      }
      if (filters?.recipientId) {
        filteredNotifications = filteredNotifications.filter(
          (n) => n.recipientId === filters.recipientId || n.recipientId === 'all'
        );
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredNotifications = filteredNotifications.filter(
          (n) =>
            n.title.toLowerCase().includes(searchLower) ||
            n.message.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.page && filters?.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        filteredNotifications = filteredNotifications.slice(start, end);
      }

      return filteredNotifications;
    }

    const queryParams = new URLSearchParams();
    if (filters?.type) queryParams.set('type', filters.type);
    if (filters?.category) queryParams.set('category', filters.category);
    if (filters?.priority) queryParams.set('priority', filters.priority);
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.channel) queryParams.set('channel', filters.channel);
    if (filters?.isRead !== undefined) queryParams.set('isRead', filters.isRead.toString());
    if (filters?.recipientId) queryParams.set('recipientId', filters.recipientId);
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.page) queryParams.set('page', filters.page.toString());
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());

    return this.request<Notification[]>(`/it-admin/notifications?${queryParams.toString()}`);
  }

  /**
   * Get notification by ID
   */
  static async getNotificationById(id: string): Promise<Notification> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const notification = MOCK_NOTIFICATIONS.find((n) => n.id === id);
      if (!notification) throw new Error('Notification not found');
      return notification;
    }
    return this.request<Notification>(`/it-admin/notifications/${id}`);
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(recipientId: string): Promise<number> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return MOCK_NOTIFICATIONS.filter(
        (n) => (n.recipientId === recipientId || n.recipientId === 'all') && !n.isRead
      ).length;
    }
    const response = await this.request<{ count: number }>(`/it-admin/notifications/unread-count/${recipientId}`);
    return response.count;
  }

  /**
   * Create a new notification
   */
  static async createNotification(data: CreateNotificationDto): Promise<Notification[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const now = new Date();
      const createdNotifications: Notification[] = data.recipientIds.map((recipientId, index) => ({
        id: `notif-${Date.now()}-${index}`,
        title: data.title,
        message: data.message,
        type: data.type,
        category: data.category,
        priority: data.priority || 'medium',
        channels: data.channels,
        status: data.scheduledAt ? 'pending' : 'sent',
        recipientId,
        recipientName: `User ${recipientId}`,
        actionUrl: data.actionUrl,
        actionLabel: data.actionLabel,
        metadata: data.metadata,
        isRead: false,
        scheduledAt: data.scheduledAt,
        sentAt: data.scheduledAt ? undefined : now.toISOString(),
        expiresAt: data.expiresAt,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }));
      MOCK_NOTIFICATIONS.push(...createdNotifications);
      return createdNotifications;
    }
    return this.request<Notification[]>('/it-admin/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(id: string): Promise<Notification> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const index = MOCK_NOTIFICATIONS.findIndex((n) => n.id === id);
      if (index === -1) throw new Error('Notification not found');

      MOCK_NOTIFICATIONS[index] = {
        ...MOCK_NOTIFICATIONS[index],
        isRead: true,
        readAt: new Date().toISOString(),
        status: 'read',
        updatedAt: new Date().toISOString(),
      };
      return MOCK_NOTIFICATIONS[index];
    }
    return this.request<Notification>(`/it-admin/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(recipientId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const now = new Date().toISOString();
      MOCK_NOTIFICATIONS.forEach((n, index) => {
        if ((n.recipientId === recipientId || n.recipientId === 'all') && !n.isRead) {
          MOCK_NOTIFICATIONS[index] = {
            ...n,
            isRead: true,
            readAt: now,
            status: 'read',
            updatedAt: now,
          };
        }
      });
      return;
    }
    await this.request<void>(`/it-admin/notifications/read-all/${recipientId}`, {
      method: 'PATCH',
    });
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_NOTIFICATIONS.findIndex((n) => n.id === id);
      if (index === -1) throw new Error('Notification not found');
      MOCK_NOTIFICATIONS.splice(index, 1);
      return;
    }
    await this.request<void>(`/it-admin/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get notification templates
   */
  static async getTemplates(): Promise<NotificationTemplate[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return [...MOCK_NOTIFICATION_TEMPLATES];
    }
    return this.request<NotificationTemplate[]>('/it-admin/notifications/templates');
  }

  /**
   * Get notification statistics
   */
  static async getStatistics(): Promise<{
    totalNotifications: number;
    sentToday: number;
    unreadCount: number;
    failedCount: number;
    notificationsByType: Record<string, number>;
    notificationsByCategory: Record<string, number>;
    notificationsByPriority: Record<string, number>;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const notificationsByType: Record<string, number> = {};
      const notificationsByCategory: Record<string, number> = {};
      const notificationsByPriority: Record<string, number> = {};

      const today = new Date().toISOString().split('T')[0];

      MOCK_NOTIFICATIONS.forEach((notification) => {
        notificationsByType[notification.type] = (notificationsByType[notification.type] || 0) + 1;
        notificationsByCategory[notification.category] = (notificationsByCategory[notification.category] || 0) + 1;
        notificationsByPriority[notification.priority] = (notificationsByPriority[notification.priority] || 0) + 1;
      });

      return {
        totalNotifications: MOCK_NOTIFICATIONS.length,
        sentToday: MOCK_NOTIFICATIONS.filter((n) => n.sentAt?.startsWith(today)).length,
        unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length,
        failedCount: MOCK_NOTIFICATIONS.filter((n) => n.status === 'failed').length,
        notificationsByType,
        notificationsByCategory,
        notificationsByPriority,
      };
    }

    return this.request<{
      totalNotifications: number;
      sentToday: number;
      unreadCount: number;
      failedCount: number;
      notificationsByType: Record<string, number>;
      notificationsByCategory: Record<string, number>;
      notificationsByPriority: Record<string, number>;
    }>('/it-admin/notifications/statistics');
  }
}

// Export singleton instance
export const notificationService = NotificationService;
