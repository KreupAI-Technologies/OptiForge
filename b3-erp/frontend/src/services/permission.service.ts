/**
 * Permission Service
 * Handles all permission-related API operations for the IT Admin module
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Interfaces
// ============================================================================

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export';
export type PermissionStatus = 'active' | 'inactive' | 'deprecated';
export type PermissionModule =
  | 'IT Admin'
  | 'HR'
  | 'Production'
  | 'Sales'
  | 'Finance'
  | 'Inventory'
  | 'Procurement'
  | 'Quality'
  | 'CRM'
  | 'Workflow'
  | 'After-Sales'
  | 'Reports';

export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  module: PermissionModule;
  actions: PermissionAction[];
  status: PermissionStatus;
  isSystemPermission: boolean;
  dependsOn?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionDto {
  code: string;
  name: string;
  description: string;
  module: PermissionModule;
  actions: PermissionAction[];
  dependsOn?: string[];
}

export interface UpdatePermissionDto extends Partial<CreatePermissionDto> {
  status?: PermissionStatus;
}

export interface PermissionFilters {
  module?: PermissionModule;
  status?: PermissionStatus;
  action?: PermissionAction;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Mock Data
// ============================================================================

export const MOCK_PERMISSIONS: Permission[] = [
  {
    id: 'perm-001',
    code: 'USER_VIEW',
    name: 'View Users',
    description: 'View user list and details',
    module: 'IT Admin',
    actions: ['read'],
    status: 'active',
    isSystemPermission: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-002',
    code: 'USER_MANAGE',
    name: 'Manage Users',
    description: 'Create, update, and delete users',
    module: 'IT Admin',
    actions: ['create', 'update', 'delete'],
    status: 'active',
    isSystemPermission: true,
    dependsOn: ['perm-001'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-003',
    code: 'ROLE_VIEW',
    name: 'View Roles',
    description: 'View role list and details',
    module: 'IT Admin',
    actions: ['read'],
    status: 'active',
    isSystemPermission: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-004',
    code: 'ROLE_MANAGE',
    name: 'Manage Roles',
    description: 'Create, update, and delete roles',
    module: 'IT Admin',
    actions: ['create', 'update', 'delete'],
    status: 'active',
    isSystemPermission: true,
    dependsOn: ['perm-003'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-005',
    code: 'HR_VIEW',
    name: 'View HR Data',
    description: 'View employee records and HR data',
    module: 'HR',
    actions: ['read'],
    status: 'active',
    isSystemPermission: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-006',
    code: 'HR_MANAGE',
    name: 'Manage HR Data',
    description: 'Manage employee records and HR operations',
    module: 'HR',
    actions: ['create', 'update', 'delete'],
    status: 'active',
    isSystemPermission: true,
    dependsOn: ['perm-005'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-007',
    code: 'PRODUCTION_VIEW',
    name: 'View Production',
    description: 'View production orders and schedules',
    module: 'Production',
    actions: ['read'],
    status: 'active',
    isSystemPermission: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-008',
    code: 'PRODUCTION_MANAGE',
    name: 'Manage Production',
    description: 'Manage production orders and resources',
    module: 'Production',
    actions: ['create', 'update', 'delete', 'approve'],
    status: 'active',
    isSystemPermission: true,
    dependsOn: ['perm-007'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-009',
    code: 'SALES_VIEW',
    name: 'View Sales',
    description: 'View sales orders and customer information',
    module: 'Sales',
    actions: ['read'],
    status: 'active',
    isSystemPermission: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-010',
    code: 'SALES_MANAGE',
    name: 'Manage Sales',
    description: 'Manage sales orders and customer data',
    module: 'Sales',
    actions: ['create', 'update', 'delete'],
    status: 'active',
    isSystemPermission: true,
    dependsOn: ['perm-009'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-011',
    code: 'FINANCE_VIEW',
    name: 'View Finance',
    description: 'View financial reports and transactions',
    module: 'Finance',
    actions: ['read', 'export'],
    status: 'active',
    isSystemPermission: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-012',
    code: 'FINANCE_MANAGE',
    name: 'Manage Finance',
    description: 'Manage financial transactions and budgets',
    module: 'Finance',
    actions: ['create', 'update', 'delete', 'approve'],
    status: 'active',
    isSystemPermission: true,
    dependsOn: ['perm-011'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-013',
    code: 'INVENTORY_VIEW',
    name: 'View Inventory',
    description: 'View inventory and stock levels',
    module: 'Inventory',
    actions: ['read'],
    status: 'active',
    isSystemPermission: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-014',
    code: 'INVENTORY_MANAGE',
    name: 'Manage Inventory',
    description: 'Manage stock, transfers, and adjustments',
    module: 'Inventory',
    actions: ['create', 'update', 'delete'],
    status: 'active',
    isSystemPermission: true,
    dependsOn: ['perm-013'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-015',
    code: 'QUALITY_VIEW',
    name: 'View Quality',
    description: 'View quality inspections and reports',
    module: 'Quality',
    actions: ['read'],
    status: 'active',
    isSystemPermission: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-016',
    code: 'QUALITY_MANAGE',
    name: 'Manage Quality',
    description: 'Manage quality inspections and NCRs',
    module: 'Quality',
    actions: ['create', 'update', 'delete', 'approve'],
    status: 'active',
    isSystemPermission: true,
    dependsOn: ['perm-015'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-017',
    code: 'CRM_VIEW',
    name: 'View CRM',
    description: 'View leads, contacts, and opportunities',
    module: 'CRM',
    actions: ['read'],
    status: 'active',
    isSystemPermission: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-018',
    code: 'CRM_MANAGE',
    name: 'Manage CRM',
    description: 'Manage CRM data and campaigns',
    module: 'CRM',
    actions: ['create', 'update', 'delete'],
    status: 'active',
    isSystemPermission: true,
    dependsOn: ['perm-017'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-019',
    code: 'WORKFLOW_VIEW',
    name: 'View Workflows',
    description: 'View workflow templates and instances',
    module: 'Workflow',
    actions: ['read'],
    status: 'active',
    isSystemPermission: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-020',
    code: 'WORKFLOW_MANAGE',
    name: 'Manage Workflows',
    description: 'Design and manage workflow templates',
    module: 'Workflow',
    actions: ['create', 'update', 'delete', 'approve'],
    status: 'active',
    isSystemPermission: true,
    dependsOn: ['perm-019'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-021',
    code: 'AFTER_SALES_VIEW',
    name: 'View After-Sales',
    description: 'View service requests, warranties, and assets',
    module: 'After-Sales',
    actions: ['read'],
    status: 'active',
    isSystemPermission: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-022',
    code: 'AFTER_SALES_MANAGE',
    name: 'Manage After-Sales',
    description: 'Manage service operations and warranties',
    module: 'After-Sales',
    actions: ['create', 'update', 'delete'],
    status: 'active',
    isSystemPermission: true,
    dependsOn: ['perm-021'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-023',
    code: 'REPORTS_VIEW',
    name: 'View Reports',
    description: 'View system reports and analytics',
    module: 'Reports',
    actions: ['read', 'export'],
    status: 'active',
    isSystemPermission: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'perm-024',
    code: 'AUDIT_LOG_VIEW',
    name: 'View Audit Logs',
    description: 'View system audit logs and activity',
    module: 'IT Admin',
    actions: ['read', 'export'],
    status: 'active',
    isSystemPermission: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

// ============================================================================
// Permission Service Class
// ============================================================================

export class PermissionService {
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
   * Get all permissions with optional filters
   */
  static async getAllPermissions(filters?: PermissionFilters): Promise<Permission[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredPermissions = [...MOCK_PERMISSIONS];

      if (filters?.module) {
        filteredPermissions = filteredPermissions.filter((p) => p.module === filters.module);
      }
      if (filters?.status) {
        filteredPermissions = filteredPermissions.filter((p) => p.status === filters.status);
      }
      if (filters?.action) {
        filteredPermissions = filteredPermissions.filter((p) => p.actions.includes(filters.action!));
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredPermissions = filteredPermissions.filter(
          (p) =>
            p.code.toLowerCase().includes(searchLower) ||
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.page && filters?.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        filteredPermissions = filteredPermissions.slice(start, end);
      }

      return filteredPermissions;
    }

    const queryParams = new URLSearchParams();
    if (filters?.module) queryParams.set('module', filters.module);
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.action) queryParams.set('action', filters.action);
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.page) queryParams.set('page', filters.page.toString());
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());

    return this.request<Permission[]>(`/it-admin/permissions?${queryParams.toString()}`);
  }

  /**
   * Get permission by ID
   */
  static async getPermissionById(id: string): Promise<Permission> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const permission = MOCK_PERMISSIONS.find((p) => p.id === id);
      if (!permission) throw new Error('Permission not found');
      return permission;
    }
    return this.request<Permission>(`/it-admin/permissions/${id}`);
  }

  /**
   * Get permissions by module
   */
  static async getPermissionsByModule(): Promise<Record<PermissionModule, Permission[]>> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const grouped: Record<string, Permission[]> = {};

      MOCK_PERMISSIONS.forEach((permission) => {
        if (!grouped[permission.module]) {
          grouped[permission.module] = [];
        }
        grouped[permission.module].push(permission);
      });

      return grouped as Record<PermissionModule, Permission[]>;
    }

    return this.request<Record<PermissionModule, Permission[]>>('/it-admin/permissions/by-module');
  }

  /**
   * Create a new permission
   */
  static async createPermission(data: CreatePermissionDto): Promise<Permission> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newPermission: Permission = {
        id: `perm-${Date.now()}`,
        ...data,
        status: 'active',
        isSystemPermission: false,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      MOCK_PERMISSIONS.push(newPermission);
      return newPermission;
    }
    return this.request<Permission>('/it-admin/permissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing permission
   */
  static async updatePermission(id: string, data: UpdatePermissionDto): Promise<Permission> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_PERMISSIONS.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Permission not found');

      if (MOCK_PERMISSIONS[index].isSystemPermission) {
        throw new Error('Cannot modify system permissions');
      }

      MOCK_PERMISSIONS[index] = {
        ...MOCK_PERMISSIONS[index],
        ...data,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      return MOCK_PERMISSIONS[index];
    }
    return this.request<Permission>(`/it-admin/permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a permission
   */
  static async deletePermission(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_PERMISSIONS.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Permission not found');

      if (MOCK_PERMISSIONS[index].isSystemPermission) {
        throw new Error('Cannot delete system permissions');
      }

      MOCK_PERMISSIONS.splice(index, 1);
      return;
    }
    await this.request<void>(`/it-admin/permissions/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get permission statistics
   */
  static async getStatistics(): Promise<{
    totalPermissions: number;
    activePermissions: number;
    systemPermissions: number;
    customPermissions: number;
    permissionsByModule: Record<string, number>;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const permissionsByModule: Record<string, number> = {};
      MOCK_PERMISSIONS.forEach((perm) => {
        permissionsByModule[perm.module] = (permissionsByModule[perm.module] || 0) + 1;
      });

      return {
        totalPermissions: MOCK_PERMISSIONS.length,
        activePermissions: MOCK_PERMISSIONS.filter((p) => p.status === 'active').length,
        systemPermissions: MOCK_PERMISSIONS.filter((p) => p.isSystemPermission).length,
        customPermissions: MOCK_PERMISSIONS.filter((p) => !p.isSystemPermission).length,
        permissionsByModule,
      };
    }

    return this.request<{
      totalPermissions: number;
      activePermissions: number;
      systemPermissions: number;
      customPermissions: number;
      permissionsByModule: Record<string, number>;
    }>('/it-admin/permissions/statistics');
  }
}

// Export singleton instance
export const permissionService = PermissionService;
