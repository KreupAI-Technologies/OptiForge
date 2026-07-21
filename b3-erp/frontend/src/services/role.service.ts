// IT-Admin Role Management Service
// Handles role CRUD operations and permission management

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Types & Interfaces
// ============================================================================

export enum RoleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  module: string;
  actions: string[];
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string;
  level: number;
  permissions: Permission[];
  userCount: number;
  isSystemRole: boolean;
  status: RoleStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface CreateRoleDto {
  code: string;
  name: string;
  description: string;
  level?: number;
  permissionIds: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  level?: number;
  permissionIds?: string[];
  status?: RoleStatus;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_PERMISSIONS: Permission[] = [
  {
    id: 'perm-001',
    code: 'USER_VIEW',
    name: 'View Users',
    description: 'View user list and details',
    module: 'IT Admin',
    actions: ['read'],
  },
  {
    id: 'perm-002',
    code: 'USER_MANAGE',
    name: 'Manage Users',
    description: 'Create, update, and delete users',
    module: 'IT Admin',
    actions: ['create', 'update', 'delete'],
  },
  {
    id: 'perm-003',
    code: 'ROLE_VIEW',
    name: 'View Roles',
    description: 'View role list and details',
    module: 'IT Admin',
    actions: ['read'],
  },
  {
    id: 'perm-004',
    code: 'ROLE_MANAGE',
    name: 'Manage Roles',
    description: 'Create, update, and delete roles',
    module: 'IT Admin',
    actions: ['create', 'update', 'delete'],
  },
  {
    id: 'perm-005',
    code: 'HR_VIEW',
    name: 'View HR Data',
    description: 'View employee records and HR data',
    module: 'HR',
    actions: ['read'],
  },
  {
    id: 'perm-006',
    code: 'HR_MANAGE',
    name: 'Manage HR Data',
    description: 'Manage employee records and HR operations',
    module: 'HR',
    actions: ['create', 'update', 'delete'],
  },
  {
    id: 'perm-007',
    code: 'PRODUCTION_VIEW',
    name: 'View Production',
    description: 'View production orders and schedules',
    module: 'Production',
    actions: ['read'],
  },
  {
    id: 'perm-008',
    code: 'PRODUCTION_MANAGE',
    name: 'Manage Production',
    description: 'Manage production orders and resources',
    module: 'Production',
    actions: ['create', 'update', 'delete'],
  },
  {
    id: 'perm-009',
    code: 'SALES_VIEW',
    name: 'View Sales',
    description: 'View sales orders and customers',
    module: 'Sales',
    actions: ['read'],
  },
  {
    id: 'perm-010',
    code: 'SALES_MANAGE',
    name: 'Manage Sales',
    description: 'Manage sales orders and customer data',
    module: 'Sales',
    actions: ['create', 'update', 'delete'],
  },
  {
    id: 'perm-011',
    code: 'FINANCE_VIEW',
    name: 'View Finance',
    description: 'View financial reports and transactions',
    module: 'Finance',
    actions: ['read'],
  },
  {
    id: 'perm-012',
    code: 'FINANCE_MANAGE',
    name: 'Manage Finance',
    description: 'Manage financial transactions and budgets',
    module: 'Finance',
    actions: ['create', 'update', 'delete'],
  },
  {
    id: 'perm-013',
    code: 'INVENTORY_VIEW',
    name: 'View Inventory',
    description: 'View inventory and stock levels',
    module: 'Inventory',
    actions: ['read'],
  },
  {
    id: 'perm-014',
    code: 'INVENTORY_MANAGE',
    name: 'Manage Inventory',
    description: 'Manage stock, transfers, and adjustments',
    module: 'Inventory',
    actions: ['create', 'update', 'delete'],
  },
  {
    id: 'perm-015',
    code: 'WORKFLOW_VIEW',
    name: 'View Workflows',
    description: 'View workflow templates and instances',
    module: 'Workflow',
    actions: ['read'],
  },
  {
    id: 'perm-016',
    code: 'WORKFLOW_MANAGE',
    name: 'Manage Workflows',
    description: 'Design and manage workflow templates',
    module: 'Workflow',
    actions: ['create', 'update', 'delete'],
  },
  {
    id: 'perm-017',
    code: 'REPORTS_VIEW',
    name: 'View Reports',
    description: 'View system reports and analytics',
    module: 'Reports',
    actions: ['read'],
  },
  {
    id: 'perm-018',
    code: 'AUDIT_VIEW',
    name: 'View Audit Logs',
    description: 'View system audit logs',
    module: 'IT Admin',
    actions: ['read'],
  },
];

export const MOCK_ROLES: Role[] = [
  {
    id: 'role-001',
    code: 'SUPER_ADMIN',
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    level: 1,
    permissions: [...MOCK_PERMISSIONS],
    userCount: 2,
    isSystemRole: true,
    status: RoleStatus.ACTIVE,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: 'system',
  },
  {
    id: 'role-002',
    code: 'HR_ADMIN',
    name: 'HR Admin',
    description: 'Full access to HR module and employee management',
    level: 2,
    permissions: MOCK_PERMISSIONS.filter((p) =>
      ['USER_VIEW', 'HR_VIEW', 'HR_MANAGE', 'REPORTS_VIEW'].includes(p.code)
    ),
    userCount: 3,
    isSystemRole: true,
    status: RoleStatus.ACTIVE,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: 'system',
  },
  {
    id: 'role-003',
    code: 'PRODUCTION_MANAGER',
    name: 'Production Manager',
    description: 'Manage production operations and resources',
    level: 3,
    permissions: MOCK_PERMISSIONS.filter((p) =>
      ['PRODUCTION_VIEW', 'PRODUCTION_MANAGE', 'INVENTORY_VIEW', 'REPORTS_VIEW'].includes(p.code)
    ),
    userCount: 5,
    isSystemRole: false,
    status: RoleStatus.ACTIVE,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-06-10T14:30:00Z'),
    createdBy: 'user-001',
  },
  {
    id: 'role-004',
    code: 'SALES_USER',
    name: 'Sales User',
    description: 'Access to sales module for order processing',
    level: 4,
    permissions: MOCK_PERMISSIONS.filter((p) =>
      ['SALES_VIEW', 'SALES_MANAGE', 'INVENTORY_VIEW'].includes(p.code)
    ),
    userCount: 12,
    isSystemRole: false,
    status: RoleStatus.ACTIVE,
    createdAt: new Date('2024-02-01T09:00:00Z'),
    updatedAt: new Date('2024-08-15T11:00:00Z'),
    createdBy: 'user-001',
  },
  {
    id: 'role-005',
    code: 'FINANCE_MANAGER',
    name: 'Finance Manager',
    description: 'Manage financial operations and reporting',
    level: 3,
    permissions: MOCK_PERMISSIONS.filter((p) =>
      ['FINANCE_VIEW', 'FINANCE_MANAGE', 'REPORTS_VIEW', 'AUDIT_VIEW'].includes(p.code)
    ),
    userCount: 4,
    isSystemRole: false,
    status: RoleStatus.ACTIVE,
    createdAt: new Date('2024-02-15T08:00:00Z'),
    updatedAt: new Date('2024-09-20T16:00:00Z'),
    createdBy: 'user-001',
  },
  {
    id: 'role-006',
    code: 'QA_SUPERVISOR',
    name: 'Quality Assurance',
    description: 'Quality control and inspection management',
    level: 4,
    permissions: MOCK_PERMISSIONS.filter((p) =>
      ['PRODUCTION_VIEW', 'INVENTORY_VIEW', 'REPORTS_VIEW'].includes(p.code)
    ),
    userCount: 6,
    isSystemRole: false,
    status: RoleStatus.ACTIVE,
    createdAt: new Date('2024-03-01T10:00:00Z'),
    updatedAt: new Date('2024-10-05T09:30:00Z'),
    createdBy: 'user-002',
  },
  {
    id: 'role-007',
    code: 'INVENTORY_MANAGER',
    name: 'Inventory Manager',
    description: 'Manage warehouse and inventory operations',
    level: 3,
    permissions: MOCK_PERMISSIONS.filter((p) =>
      ['INVENTORY_VIEW', 'INVENTORY_MANAGE', 'PRODUCTION_VIEW', 'REPORTS_VIEW'].includes(p.code)
    ),
    userCount: 8,
    isSystemRole: false,
    status: RoleStatus.ACTIVE,
    createdAt: new Date('2024-03-15T11:00:00Z'),
    updatedAt: new Date('2024-11-12T14:00:00Z'),
    createdBy: 'user-001',
  },
];

// ============================================================================
// Service Class
// ============================================================================

export class RoleService {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      // Auth is carried by the HttpOnly `access_token` cookie set on login.
      // `credentials: 'include'` attaches it so JwtAuthGuard-protected
      // it-admin endpoints receive the token.
      credentials: 'include',
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
   * Get all roles
   */
  static async getAllRoles(): Promise<Role[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [...MOCK_ROLES];
    }

    return this.request<Role[]>('/it-admin/roles');
  }

  /**
   * Get a single role by ID
   */
  static async getRoleById(id: string): Promise<Role> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const role = MOCK_ROLES.find((r) => r.id === id);
      if (!role) {
        throw new Error('Role not found');
      }
      return role;
    }

    return this.request<Role>(`/it-admin/roles/${id}`);
  }

  /**
   * Create a new role
   */
  static async createRole(data: CreateRoleDto): Promise<Role> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newRole: Role = {
        id: `role-${Date.now()}`,
        code: data.code,
        name: data.name,
        description: data.description,
        level: data.level || 5,
        permissions: MOCK_PERMISSIONS.filter((p) => data.permissionIds.includes(p.id)),
        userCount: 0,
        isSystemRole: false,
        status: RoleStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user',
      };
      MOCK_ROLES.push(newRole);
      return newRole;
    }

    return this.request<Role>('/it-admin/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing role
   */
  static async updateRole(id: string, data: UpdateRoleDto): Promise<Role> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_ROLES.findIndex((r) => r.id === id);
      if (index === -1) {
        throw new Error('Role not found');
      }

      if (MOCK_ROLES[index].isSystemRole) {
        throw new Error('Cannot modify system roles');
      }

      const updatedRole = {
        ...MOCK_ROLES[index],
        ...data,
        permissions: data.permissionIds
          ? MOCK_PERMISSIONS.filter((p) => data.permissionIds!.includes(p.id))
          : MOCK_ROLES[index].permissions,
        updatedAt: new Date(),
      };
      MOCK_ROLES[index] = updatedRole;
      return updatedRole;
    }

    return this.request<Role>(`/it-admin/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a role
   */
  static async deleteRole(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_ROLES.findIndex((r) => r.id === id);
      if (index === -1) {
        throw new Error('Role not found');
      }

      if (MOCK_ROLES[index].isSystemRole) {
        throw new Error('Cannot delete system roles');
      }

      if (MOCK_ROLES[index].userCount > 0) {
        throw new Error('Cannot delete role with assigned users');
      }

      MOCK_ROLES.splice(index, 1);
      return;
    }

    await this.request<void>(`/it-admin/roles/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get all available permissions
   */
  static async getAllPermissions(): Promise<Permission[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return [...MOCK_PERMISSIONS];
    }

    return this.request<Permission[]>('/it-admin/permissions');
  }

  /**
   * Get permissions grouped by module
   */
  static async getPermissionsByModule(): Promise<Record<string, Permission[]>> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const grouped: Record<string, Permission[]> = {};

      MOCK_PERMISSIONS.forEach((permission) => {
        if (!grouped[permission.module]) {
          grouped[permission.module] = [];
        }
        grouped[permission.module].push(permission);
      });

      return grouped;
    }

    return this.request<Record<string, Permission[]>>('/it-admin/permissions/by-module');
  }

  /**
   * Get role statistics
   */
  static async getRoleStatistics(): Promise<{
    totalRoles: number;
    activeRoles: number;
    systemRoles: number;
    customRoles: number;
    totalAssignments: number;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      return {
        totalRoles: MOCK_ROLES.length,
        activeRoles: MOCK_ROLES.filter((r) => r.status === RoleStatus.ACTIVE).length,
        systemRoles: MOCK_ROLES.filter((r) => r.isSystemRole).length,
        customRoles: MOCK_ROLES.filter((r) => !r.isSystemRole).length,
        totalAssignments: MOCK_ROLES.reduce((sum, r) => sum + r.userCount, 0),
      };
    }

    return this.request<{
      totalRoles: number;
      activeRoles: number;
      systemRoles: number;
      customRoles: number;
      totalAssignments: number;
    }>('/it-admin/roles/statistics');
  }
}

// Export singleton instance
export const roleService = RoleService;
