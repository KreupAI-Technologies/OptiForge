// IT-Admin User Management Service
// Handles user CRUD operations and password management

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = true;

// ============================================================================
// Types & Interfaces
// ============================================================================

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  VIEWER = 'viewer',
}

export interface User {
  id: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone?: string;
  department: string;
  jobTitle: string;
  roleId: string;
  roleName: string;
  status: UserStatus;
  avatar?: string;
  lastLogin?: Date;
  passwordChangedAt?: Date;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface CreateUserDto {
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  department: string;
  jobTitle: string;
  roleId: string;
  password: string;
  twoFactorEnabled?: boolean;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  roleId?: string;
  status?: UserStatus;
  twoFactorEnabled?: boolean;
}

export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
  forceChangeOnNextLogin?: boolean;
}

export interface UserFilters {
  status?: UserStatus;
  roleId?: string;
  department?: string;
  search?: string;
}

// ============================================================================
// Mock Data
// ============================================================================

export const MOCK_USERS: User[] = [
  {
    id: 'user-001',
    employeeId: 'EMP001',
    email: 'john.smith@manufacturing.com',
    firstName: 'John',
    lastName: 'Smith',
    displayName: 'John Smith',
    phone: '+1-555-0101',
    department: 'IT',
    jobTitle: 'System Administrator',
    roleId: 'role-001',
    roleName: 'Super Admin',
    status: UserStatus.ACTIVE,
    avatar: '/avatars/john-smith.jpg',
    lastLogin: new Date('2026-01-25T14:30:00Z'),
    passwordChangedAt: new Date('2025-12-01T10:00:00Z'),
    twoFactorEnabled: true,
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2026-01-25T14:30:00Z'),
    createdBy: 'system',
  },
  {
    id: 'user-002',
    employeeId: 'EMP002',
    email: 'sarah.johnson@manufacturing.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    displayName: 'Sarah Johnson',
    phone: '+1-555-0102',
    department: 'Human Resources',
    jobTitle: 'HR Manager',
    roleId: 'role-002',
    roleName: 'HR Admin',
    status: UserStatus.ACTIVE,
    lastLogin: new Date('2026-01-25T16:45:00Z'),
    passwordChangedAt: new Date('2025-11-15T08:30:00Z'),
    twoFactorEnabled: true,
    createdAt: new Date('2024-02-10T10:00:00Z'),
    updatedAt: new Date('2026-01-25T16:45:00Z'),
    createdBy: 'user-001',
  },
  {
    id: 'user-003',
    employeeId: 'EMP003',
    email: 'michael.chen@manufacturing.com',
    firstName: 'Michael',
    lastName: 'Chen',
    displayName: 'Michael Chen',
    phone: '+1-555-0103',
    department: 'Production',
    jobTitle: 'Production Manager',
    roleId: 'role-003',
    roleName: 'Production Manager',
    status: UserStatus.ACTIVE,
    lastLogin: new Date('2026-01-24T08:15:00Z'),
    passwordChangedAt: new Date('2025-10-20T14:00:00Z'),
    twoFactorEnabled: false,
    createdAt: new Date('2024-03-05T11:00:00Z'),
    updatedAt: new Date('2026-01-24T08:15:00Z'),
    createdBy: 'user-001',
  },
  {
    id: 'user-004',
    employeeId: 'EMP004',
    email: 'emily.davis@manufacturing.com',
    firstName: 'Emily',
    lastName: 'Davis',
    displayName: 'Emily Davis',
    phone: '+1-555-0104',
    department: 'Sales',
    jobTitle: 'Sales Representative',
    roleId: 'role-004',
    roleName: 'Sales User',
    status: UserStatus.ACTIVE,
    lastLogin: new Date('2026-01-25T11:20:00Z'),
    passwordChangedAt: new Date('2025-09-10T09:00:00Z'),
    twoFactorEnabled: false,
    createdAt: new Date('2024-04-20T09:30:00Z'),
    updatedAt: new Date('2026-01-25T11:20:00Z'),
    createdBy: 'user-002',
  },
  {
    id: 'user-005',
    employeeId: 'EMP005',
    email: 'robert.wilson@manufacturing.com',
    firstName: 'Robert',
    lastName: 'Wilson',
    displayName: 'Robert Wilson',
    phone: '+1-555-0105',
    department: 'Finance',
    jobTitle: 'Finance Controller',
    roleId: 'role-005',
    roleName: 'Finance Manager',
    status: UserStatus.ACTIVE,
    lastLogin: new Date('2026-01-25T17:00:00Z'),
    passwordChangedAt: new Date('2025-08-05T10:30:00Z'),
    twoFactorEnabled: true,
    createdAt: new Date('2024-05-12T08:00:00Z'),
    updatedAt: new Date('2026-01-25T17:00:00Z'),
    createdBy: 'user-001',
  },
  {
    id: 'user-006',
    employeeId: 'EMP006',
    email: 'jennifer.martinez@manufacturing.com',
    firstName: 'Jennifer',
    lastName: 'Martinez',
    displayName: 'Jennifer Martinez',
    phone: '+1-555-0106',
    department: 'Quality',
    jobTitle: 'QA Supervisor',
    roleId: 'role-006',
    roleName: 'Quality Assurance',
    status: UserStatus.INACTIVE,
    lastLogin: new Date('2025-12-15T13:45:00Z'),
    passwordChangedAt: new Date('2025-06-20T11:00:00Z'),
    twoFactorEnabled: false,
    createdAt: new Date('2024-06-01T10:00:00Z'),
    updatedAt: new Date('2025-12-20T09:00:00Z'),
    createdBy: 'user-001',
  },
  {
    id: 'user-007',
    employeeId: 'EMP007',
    email: 'david.lee@manufacturing.com',
    firstName: 'David',
    lastName: 'Lee',
    displayName: 'David Lee',
    phone: '+1-555-0107',
    department: 'Warehouse',
    jobTitle: 'Warehouse Supervisor',
    roleId: 'role-007',
    roleName: 'Inventory Manager',
    status: UserStatus.ACTIVE,
    lastLogin: new Date('2026-01-25T07:30:00Z'),
    passwordChangedAt: new Date('2025-07-15T08:00:00Z'),
    twoFactorEnabled: false,
    createdAt: new Date('2024-07-10T09:00:00Z'),
    updatedAt: new Date('2026-01-25T07:30:00Z'),
    createdBy: 'user-002',
  },
  {
    id: 'user-008',
    employeeId: 'EMP008',
    email: 'amanda.brown@manufacturing.com',
    firstName: 'Amanda',
    lastName: 'Brown',
    displayName: 'Amanda Brown',
    phone: '+1-555-0108',
    department: 'Procurement',
    jobTitle: 'Procurement Officer',
    roleId: 'role-004',
    roleName: 'Standard User',
    status: UserStatus.SUSPENDED,
    lastLogin: new Date('2025-11-01T10:00:00Z'),
    passwordChangedAt: new Date('2025-05-01T09:00:00Z'),
    twoFactorEnabled: false,
    createdAt: new Date('2024-08-15T11:00:00Z'),
    updatedAt: new Date('2025-11-10T14:00:00Z'),
    createdBy: 'user-001',
  },
  {
    id: 'user-009',
    employeeId: 'EMP009',
    email: 'james.taylor@manufacturing.com',
    firstName: 'James',
    lastName: 'Taylor',
    displayName: 'James Taylor',
    phone: '+1-555-0109',
    department: 'IT',
    jobTitle: 'IT Support Specialist',
    roleId: 'role-004',
    roleName: 'Standard User',
    status: UserStatus.ACTIVE,
    lastLogin: new Date('2026-01-25T15:00:00Z'),
    passwordChangedAt: new Date('2025-04-10T10:00:00Z'),
    twoFactorEnabled: true,
    createdAt: new Date('2024-09-01T08:30:00Z'),
    updatedAt: new Date('2026-01-25T15:00:00Z'),
    createdBy: 'user-001',
  },
  {
    id: 'user-010',
    employeeId: 'EMP010',
    email: 'lisa.anderson@manufacturing.com',
    firstName: 'Lisa',
    lastName: 'Anderson',
    displayName: 'Lisa Anderson',
    phone: '+1-555-0110',
    department: 'Sales',
    jobTitle: 'Sales Manager',
    roleId: 'role-003',
    roleName: 'Department Manager',
    status: UserStatus.PENDING,
    passwordChangedAt: undefined,
    twoFactorEnabled: false,
    createdAt: new Date('2026-01-20T09:00:00Z'),
    updatedAt: new Date('2026-01-20T09:00:00Z'),
    createdBy: 'user-002',
  },
];

// ============================================================================
// Service Class
// ============================================================================

export class UserManagementService {
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
   * Get all users with optional filters
   */
  static async getAllUsers(filters?: UserFilters): Promise<User[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      let filteredUsers = [...MOCK_USERS];

      if (filters?.status) {
        filteredUsers = filteredUsers.filter((u) => u.status === filters.status);
      }
      if (filters?.roleId) {
        filteredUsers = filteredUsers.filter((u) => u.roleId === filters.roleId);
      }
      if (filters?.department) {
        filteredUsers = filteredUsers.filter((u) => u.department === filters.department);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(
          (u) =>
            u.firstName.toLowerCase().includes(searchLower) ||
            u.lastName.toLowerCase().includes(searchLower) ||
            u.email.toLowerCase().includes(searchLower) ||
            u.employeeId.toLowerCase().includes(searchLower) ||
            u.displayName.toLowerCase().includes(searchLower)
        );
      }

      return filteredUsers;
    }

    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.roleId) queryParams.set('roleId', filters.roleId);
    if (filters?.department) queryParams.set('department', filters.department);
    if (filters?.search) queryParams.set('search', filters.search);

    const queryString = queryParams.toString();
    return this.request<User[]>(`/it-admin/users${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Get a single user by ID
   */
  static async getUserById(id: string): Promise<User> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const user = MOCK_USERS.find((u) => u.id === id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    }

    return this.request<User>(`/it-admin/users/${id}`);
  }

  /**
   * Create a new user
   */
  static async createUser(data: CreateUserDto): Promise<User> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newUser: User = {
        id: `user-${Date.now()}`,
        employeeId: data.employeeId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: `${data.firstName} ${data.lastName}`,
        phone: data.phone,
        department: data.department,
        jobTitle: data.jobTitle,
        roleId: data.roleId,
        roleName: 'Standard User',
        status: UserStatus.PENDING,
        twoFactorEnabled: data.twoFactorEnabled || false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user',
      };
      MOCK_USERS.push(newUser);
      return newUser;
    }

    return this.request<User>('/it-admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing user
   */
  static async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_USERS.findIndex((u) => u.id === id);
      if (index === -1) {
        throw new Error('User not found');
      }

      const updatedUser = {
        ...MOCK_USERS[index],
        ...data,
        displayName: data.firstName && data.lastName
          ? `${data.firstName} ${data.lastName}`
          : MOCK_USERS[index].displayName,
        updatedAt: new Date(),
      };
      MOCK_USERS[index] = updatedUser;
      return updatedUser;
    }

    return this.request<User>(`/it-admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a user
   */
  static async deleteUser(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_USERS.findIndex((u) => u.id === id);
      if (index === -1) {
        throw new Error('User not found');
      }
      MOCK_USERS.splice(index, 1);
      return;
    }

    await this.request<void>(`/it-admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Change user password
   */
  static async changePassword(id: string, data: ChangePasswordDto): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (data.newPassword !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (data.newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const index = MOCK_USERS.findIndex((u) => u.id === id);
      if (index === -1) {
        throw new Error('User not found');
      }

      MOCK_USERS[index] = {
        ...MOCK_USERS[index],
        passwordChangedAt: new Date(),
        updatedAt: new Date(),
      };

      return {
        success: true,
        message: 'Password changed successfully',
      };
    }

    return this.request<{ success: boolean; message: string }>(`/it-admin/users/${id}/change-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get user statistics
   */
  static async getUserStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    suspendedUsers: number;
    pendingUsers: number;
    byDepartment: Record<string, number>;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const byDepartment: Record<string, number> = {};
      MOCK_USERS.forEach((user) => {
        byDepartment[user.department] = (byDepartment[user.department] || 0) + 1;
      });

      return {
        totalUsers: MOCK_USERS.length,
        activeUsers: MOCK_USERS.filter((u) => u.status === UserStatus.ACTIVE).length,
        inactiveUsers: MOCK_USERS.filter((u) => u.status === UserStatus.INACTIVE).length,
        suspendedUsers: MOCK_USERS.filter((u) => u.status === UserStatus.SUSPENDED).length,
        pendingUsers: MOCK_USERS.filter((u) => u.status === UserStatus.PENDING).length,
        byDepartment,
      };
    }

    return this.request<{
      totalUsers: number;
      activeUsers: number;
      inactiveUsers: number;
      suspendedUsers: number;
      pendingUsers: number;
      byDepartment: Record<string, number>;
    }>('/it-admin/users/statistics');
  }
}

// Export singleton instance
export const userManagementService = UserManagementService;
