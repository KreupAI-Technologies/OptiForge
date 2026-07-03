// IT-Admin Audit Log Service
// Handles audit log retrieval and filtering

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Types & Interfaces
// ============================================================================

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  VIEW = 'view',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
  PASSWORD_CHANGE = 'password_change',
  PERMISSION_CHANGE = 'permission_change',
}

export enum AuditModule {
  USER_MANAGEMENT = 'User Management',
  ROLE_MANAGEMENT = 'Role Management',
  HR = 'Human Resources',
  PRODUCTION = 'Production',
  SALES = 'Sales',
  FINANCE = 'Finance',
  INVENTORY = 'Inventory',
  WORKFLOW = 'Workflow',
  AFTER_SALES = 'After Sales',
  AUTHENTICATION = 'Authentication',
  SYSTEM = 'System',
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userEmail: string;
  action: AuditAction;
  module: AuditModule;
  entityType: string;
  entityId: string;
  entityName?: string;
  description: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  severity: AuditSeverity;
  metadata?: Record<string, any>;
}

export interface AuditLogFilters {
  userId?: string;
  action?: AuditAction;
  module?: AuditModule;
  severity?: AuditSeverity;
  entityType?: string;
  entityId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogPaginatedResponse {
  data: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================================================
// Mock Data
// ============================================================================

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-001',
    timestamp: new Date('2026-01-26T09:15:23Z'),
    userId: 'user-001',
    userName: 'John Smith',
    userEmail: 'john.smith@manufacturing.com',
    action: AuditAction.LOGIN,
    module: AuditModule.AUTHENTICATION,
    entityType: 'session',
    entityId: 'session-12345',
    description: 'User logged in successfully',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    severity: AuditSeverity.INFO,
    metadata: { browser: 'Chrome', os: 'Windows 10' },
  },
  {
    id: 'audit-002',
    timestamp: new Date('2026-01-26T09:20:45Z'),
    userId: 'user-001',
    userName: 'John Smith',
    userEmail: 'john.smith@manufacturing.com',
    action: AuditAction.CREATE,
    module: AuditModule.USER_MANAGEMENT,
    entityType: 'user',
    entityId: 'user-010',
    entityName: 'Lisa Anderson',
    description: 'Created new user account for Lisa Anderson',
    newValue: {
      email: 'lisa.anderson@manufacturing.com',
      department: 'Sales',
      role: 'Sales Manager',
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    severity: AuditSeverity.INFO,
  },
  {
    id: 'audit-003',
    timestamp: new Date('2026-01-26T10:05:12Z'),
    userId: 'user-002',
    userName: 'Sarah Johnson',
    userEmail: 'sarah.johnson@manufacturing.com',
    action: AuditAction.UPDATE,
    module: AuditModule.HR,
    entityType: 'employee',
    entityId: 'emp-045',
    entityName: 'Mark Thompson',
    description: 'Updated employee salary information',
    oldValue: { salary: 55000, department: 'Production' },
    newValue: { salary: 60000, department: 'Production' },
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    severity: AuditSeverity.INFO,
  },
  {
    id: 'audit-004',
    timestamp: new Date('2026-01-26T10:30:00Z'),
    userId: 'user-003',
    userName: 'Michael Chen',
    userEmail: 'michael.chen@manufacturing.com',
    action: AuditAction.APPROVE,
    module: AuditModule.PRODUCTION,
    entityType: 'production_order',
    entityId: 'PO-2026-0125',
    entityName: 'Production Order #0125',
    description: 'Approved production order for 500 units',
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/122.0',
    severity: AuditSeverity.INFO,
    metadata: { quantity: 500, product: 'Widget A', estimatedCompletion: '2026-02-15' },
  },
  {
    id: 'audit-005',
    timestamp: new Date('2026-01-26T11:00:33Z'),
    userId: 'user-005',
    userName: 'Robert Wilson',
    userEmail: 'robert.wilson@manufacturing.com',
    action: AuditAction.EXPORT,
    module: AuditModule.FINANCE,
    entityType: 'report',
    entityId: 'report-financial-q4',
    entityName: 'Q4 2025 Financial Report',
    description: 'Exported Q4 2025 financial report to PDF',
    ipAddress: '192.168.1.110',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    severity: AuditSeverity.INFO,
    metadata: { format: 'PDF', pages: 45, fileSize: '2.5MB' },
  },
  {
    id: 'audit-006',
    timestamp: new Date('2026-01-26T11:45:20Z'),
    userId: 'user-001',
    userName: 'John Smith',
    userEmail: 'john.smith@manufacturing.com',
    action: AuditAction.PERMISSION_CHANGE,
    module: AuditModule.ROLE_MANAGEMENT,
    entityType: 'role',
    entityId: 'role-004',
    entityName: 'Sales User',
    description: 'Modified permissions for Sales User role',
    oldValue: { permissions: ['SALES_VIEW', 'SALES_MANAGE'] },
    newValue: { permissions: ['SALES_VIEW', 'SALES_MANAGE', 'INVENTORY_VIEW'] },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    severity: AuditSeverity.WARNING,
  },
  {
    id: 'audit-007',
    timestamp: new Date('2026-01-26T12:15:45Z'),
    userId: 'user-008',
    userName: 'Amanda Brown',
    userEmail: 'amanda.brown@manufacturing.com',
    action: AuditAction.LOGIN,
    module: AuditModule.AUTHENTICATION,
    entityType: 'session',
    entityId: 'session-failed-001',
    description: 'Failed login attempt - account suspended',
    ipAddress: '192.168.1.150',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X)',
    severity: AuditSeverity.WARNING,
    metadata: { reason: 'Account suspended', attempts: 3 },
  },
  {
    id: 'audit-008',
    timestamp: new Date('2026-01-26T13:00:00Z'),
    userId: 'user-004',
    userName: 'Emily Davis',
    userEmail: 'emily.davis@manufacturing.com',
    action: AuditAction.CREATE,
    module: AuditModule.SALES,
    entityType: 'sales_order',
    entityId: 'SO-2026-0890',
    entityName: 'Sales Order #0890',
    description: 'Created new sales order for Acme Corp',
    newValue: { customer: 'Acme Corp', total: 125000, items: 15 },
    ipAddress: '192.168.1.112',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0',
    severity: AuditSeverity.INFO,
  },
  {
    id: 'audit-009',
    timestamp: new Date('2026-01-26T13:30:22Z'),
    userId: 'user-007',
    userName: 'David Lee',
    userEmail: 'david.lee@manufacturing.com',
    action: AuditAction.UPDATE,
    module: AuditModule.INVENTORY,
    entityType: 'stock_adjustment',
    entityId: 'ADJ-2026-0045',
    entityName: 'Stock Adjustment #0045',
    description: 'Adjusted inventory for warehouse discrepancy',
    oldValue: { quantity: 1500, location: 'WH-A' },
    newValue: { quantity: 1485, location: 'WH-A', reason: 'Physical count variance' },
    ipAddress: '192.168.1.108',
    userAgent: 'Mozilla/5.0 (Android 14; Mobile) Chrome/120.0.0.0',
    severity: AuditSeverity.WARNING,
    metadata: { variance: -15, productSKU: 'SKU-12345' },
  },
  {
    id: 'audit-010',
    timestamp: new Date('2026-01-26T14:00:15Z'),
    userId: 'user-001',
    userName: 'John Smith',
    userEmail: 'john.smith@manufacturing.com',
    action: AuditAction.PASSWORD_CHANGE,
    module: AuditModule.USER_MANAGEMENT,
    entityType: 'user',
    entityId: 'user-006',
    entityName: 'Jennifer Martinez',
    description: 'Reset password for user Jennifer Martinez',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    severity: AuditSeverity.INFO,
    metadata: { resetType: 'admin_initiated', requireChangeOnLogin: true },
  },
  {
    id: 'audit-011',
    timestamp: new Date('2026-01-26T14:30:00Z'),
    userId: 'user-009',
    userName: 'James Taylor',
    userEmail: 'james.taylor@manufacturing.com',
    action: AuditAction.DELETE,
    module: AuditModule.SYSTEM,
    entityType: 'backup',
    entityId: 'backup-old-001',
    entityName: 'System Backup 2025-01-01',
    description: 'Deleted old system backup to free storage',
    oldValue: { date: '2025-01-01', size: '15GB', type: 'full' },
    ipAddress: '192.168.1.115',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    severity: AuditSeverity.WARNING,
  },
  {
    id: 'audit-012',
    timestamp: new Date('2026-01-26T15:00:45Z'),
    userId: 'system',
    userName: 'System',
    userEmail: 'system@manufacturing.com',
    action: AuditAction.CREATE,
    module: AuditModule.WORKFLOW,
    entityType: 'workflow_instance',
    entityId: 'WF-2026-0567',
    entityName: 'Purchase Approval Workflow',
    description: 'Workflow instance created automatically for purchase request',
    newValue: { template: 'PURCHASE_APPROVAL', requester: 'user-008', amount: 75000 },
    ipAddress: '127.0.0.1',
    userAgent: 'ManufacturingOS/Workflow-Engine/1.0',
    severity: AuditSeverity.INFO,
  },
  {
    id: 'audit-013',
    timestamp: new Date('2026-01-26T15:30:12Z'),
    userId: 'user-006',
    userName: 'Jennifer Martinez',
    userEmail: 'jennifer.martinez@manufacturing.com',
    action: AuditAction.REJECT,
    module: AuditModule.AFTER_SALES,
    entityType: 'warranty_claim',
    entityId: 'WC-2026-0089',
    entityName: 'Warranty Claim #0089',
    description: 'Rejected warranty claim - product tampered',
    oldValue: { status: 'pending' },
    newValue: { status: 'rejected', reason: 'Evidence of product tampering' },
    ipAddress: '192.168.1.118',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/122.0',
    severity: AuditSeverity.INFO,
    metadata: { claimAmount: 2500, productId: 'PROD-456' },
  },
  {
    id: 'audit-014',
    timestamp: new Date('2026-01-26T16:00:00Z'),
    userId: 'unknown',
    userName: 'Unknown',
    userEmail: 'unknown',
    action: AuditAction.LOGIN,
    module: AuditModule.AUTHENTICATION,
    entityType: 'session',
    entityId: 'session-failed-002',
    description: 'Multiple failed login attempts detected from suspicious IP',
    ipAddress: '203.0.113.42',
    userAgent: 'curl/7.68.0',
    severity: AuditSeverity.CRITICAL,
    metadata: { attempts: 50, targetAccount: 'admin', blocked: true },
  },
  {
    id: 'audit-015',
    timestamp: new Date('2026-01-26T16:15:30Z'),
    userId: 'user-002',
    userName: 'Sarah Johnson',
    userEmail: 'sarah.johnson@manufacturing.com',
    action: AuditAction.LOGOUT,
    module: AuditModule.AUTHENTICATION,
    entityType: 'session',
    entityId: 'session-12346',
    description: 'User logged out',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    severity: AuditSeverity.INFO,
    metadata: { sessionDuration: '6h 45m' },
  },
];

// ============================================================================
// Service Class
// ============================================================================

export class AuditLogService {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get audit logs with optional filters and pagination
   */
  static async getAuditLogs(filters?: AuditLogFilters): Promise<AuditLogPaginatedResponse> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      let filteredLogs = [...MOCK_AUDIT_LOGS];

      // Apply filters
      if (filters?.userId) {
        filteredLogs = filteredLogs.filter((log) => log.userId === filters.userId);
      }
      if (filters?.action) {
        filteredLogs = filteredLogs.filter((log) => log.action === filters.action);
      }
      if (filters?.module) {
        filteredLogs = filteredLogs.filter((log) => log.module === filters.module);
      }
      if (filters?.severity) {
        filteredLogs = filteredLogs.filter((log) => log.severity === filters.severity);
      }
      if (filters?.entityType) {
        filteredLogs = filteredLogs.filter((log) => log.entityType === filters.entityType);
      }
      if (filters?.entityId) {
        filteredLogs = filteredLogs.filter((log) => log.entityId === filters.entityId);
      }
      if (filters?.fromDate) {
        const fromDate = new Date(filters.fromDate);
        filteredLogs = filteredLogs.filter((log) => new Date(log.timestamp) >= fromDate);
      }
      if (filters?.toDate) {
        const toDate = new Date(filters.toDate);
        filteredLogs = filteredLogs.filter((log) => new Date(log.timestamp) <= toDate);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredLogs = filteredLogs.filter(
          (log) =>
            log.description.toLowerCase().includes(searchLower) ||
            log.userName.toLowerCase().includes(searchLower) ||
            log.entityName?.toLowerCase().includes(searchLower) ||
            log.entityId.toLowerCase().includes(searchLower)
        );
      }

      // Sort by timestamp descending (most recent first)
      filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Apply pagination
      const total = filteredLogs.length;
      const limit = filters?.limit || 20;
      const offset = filters?.offset || 0;
      const paginatedLogs = filteredLogs.slice(offset, offset + limit);

      return {
        data: paginatedLogs,
        total,
        limit,
        offset,
      };
    }

    const queryParams = new URLSearchParams();
    if (filters?.userId) queryParams.set('userId', filters.userId);
    if (filters?.action) queryParams.set('action', filters.action);
    if (filters?.module) queryParams.set('module', filters.module);
    if (filters?.severity) queryParams.set('severity', filters.severity);
    if (filters?.entityType) queryParams.set('entityType', filters.entityType);
    if (filters?.entityId) queryParams.set('entityId', filters.entityId);
    if (filters?.fromDate) queryParams.set('fromDate', filters.fromDate);
    if (filters?.toDate) queryParams.set('toDate', filters.toDate);
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());
    if (filters?.offset) queryParams.set('offset', filters.offset.toString());

    const queryString = queryParams.toString();
    return this.request<AuditLogPaginatedResponse>(
      `/it-admin/audit-logs${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get a single audit log by ID
   */
  static async getAuditLogById(id: string): Promise<AuditLog> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const log = MOCK_AUDIT_LOGS.find((l) => l.id === id);
      if (!log) {
        throw new Error('Audit log not found');
      }
      return log;
    }

    return this.request<AuditLog>(`/it-admin/audit-logs/${id}`);
  }

  /**
   * Get audit log statistics
   */
  static async getAuditStatistics(): Promise<{
    totalLogs: number;
    todayLogs: number;
    byAction: Record<string, number>;
    byModule: Record<string, number>;
    bySeverity: Record<string, number>;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const byAction: Record<string, number> = {};
      const byModule: Record<string, number> = {};
      const bySeverity: Record<string, number> = {};

      MOCK_AUDIT_LOGS.forEach((log) => {
        byAction[log.action] = (byAction[log.action] || 0) + 1;
        byModule[log.module] = (byModule[log.module] || 0) + 1;
        bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;
      });

      return {
        totalLogs: MOCK_AUDIT_LOGS.length,
        todayLogs: MOCK_AUDIT_LOGS.filter((log) => new Date(log.timestamp) >= today).length,
        byAction,
        byModule,
        bySeverity,
      };
    }

    return this.request<{
      totalLogs: number;
      todayLogs: number;
      byAction: Record<string, number>;
      byModule: Record<string, number>;
      bySeverity: Record<string, number>;
    }>('/it-admin/audit-logs/statistics');
  }

  /**
   * Get recent activity for a specific user
   */
  static async getUserActivity(userId: string, limit: number = 10): Promise<AuditLog[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return MOCK_AUDIT_LOGS
        .filter((log) => log.userId === userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    }

    return this.request<AuditLog[]>(`/it-admin/audit-logs/user/${userId}?limit=${limit}`);
  }

  /**
   * Get activity for a specific entity
   */
  static async getEntityActivity(entityType: string, entityId: string): Promise<AuditLog[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return MOCK_AUDIT_LOGS
        .filter((log) => log.entityType === entityType && log.entityId === entityId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    return this.request<AuditLog[]>(`/it-admin/audit-logs/entity/${entityType}/${entityId}`);
  }
}

// Export singleton instance
export const auditLogService = AuditLogService;
