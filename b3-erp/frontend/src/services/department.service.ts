/**
 * Department Service
 * Handles all department-related API operations for the HR module
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Interfaces
// ============================================================================

export enum DepartmentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  headOfDepartmentId?: string;
  headOfDepartmentName?: string;
  parentDepartmentId?: string;
  parentDepartmentName?: string;
  location: string;
  costCenter?: string;
  budget?: number;
  employeeCount: number;
  status: DepartmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDepartmentDto {
  code: string;
  name: string;
  description: string;
  headOfDepartmentId?: string;
  parentDepartmentId?: string;
  location: string;
  costCenter?: string;
  budget?: number;
  status?: DepartmentStatus;
}

export interface UpdateDepartmentDto extends Partial<CreateDepartmentDto> { }

export interface DepartmentFilters {
  status?: DepartmentStatus;
  parentDepartmentId?: string;
  search?: string;
}

// ============================================================================
// Mock Data - 10 Departments
// ============================================================================

export const MOCK_DEPARTMENTS: Department[] = [
  {
    id: 'dept-001',
    code: 'PROD',
    name: 'Production',
    description: 'Manufacturing and production operations including assembly lines and quality control.',
    headOfDepartmentId: 'emp-001',
    headOfDepartmentName: 'Rajesh Kumar',
    parentDepartmentId: undefined,
    location: 'Building A, Floor 1',
    costCenter: 'CC-PROD-001',
    budget: 5000000,
    employeeCount: 45,
    status: DepartmentStatus.ACTIVE,
    createdAt: new Date('2017-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'dept-002',
    code: 'HR',
    name: 'Human Resources',
    description: 'Employee management, recruitment, training, and organizational development.',
    headOfDepartmentId: 'emp-002',
    headOfDepartmentName: 'Priya Sharma',
    parentDepartmentId: undefined,
    location: 'Building B, Floor 2',
    costCenter: 'CC-HR-001',
    budget: 1500000,
    employeeCount: 12,
    status: DepartmentStatus.ACTIVE,
    createdAt: new Date('2017-01-01'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'dept-003',
    code: 'QC',
    name: 'Quality Control',
    description: 'Quality assurance, testing, and compliance verification for all products.',
    headOfDepartmentId: undefined,
    parentDepartmentId: 'dept-001',
    parentDepartmentName: 'Production',
    location: 'Building A, Floor 2',
    costCenter: 'CC-QC-001',
    budget: 2000000,
    employeeCount: 18,
    status: DepartmentStatus.ACTIVE,
    createdAt: new Date('2017-03-01'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'dept-004',
    code: 'FIN',
    name: 'Finance',
    description: 'Financial planning, accounting, budgeting, and financial reporting.',
    headOfDepartmentId: 'emp-006',
    headOfDepartmentName: 'Vikram Singh',
    parentDepartmentId: undefined,
    location: 'Building B, Floor 3',
    costCenter: 'CC-FIN-001',
    budget: 1200000,
    employeeCount: 15,
    status: DepartmentStatus.ACTIVE,
    createdAt: new Date('2017-01-01'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: 'dept-005',
    code: 'SALES',
    name: 'Sales',
    description: 'Sales operations, customer acquisition, and revenue generation.',
    headOfDepartmentId: 'emp-009',
    headOfDepartmentName: 'Sanjay Gupta',
    parentDepartmentId: undefined,
    location: 'Building C, Floor 1',
    costCenter: 'CC-SALES-001',
    budget: 3000000,
    employeeCount: 25,
    status: DepartmentStatus.ACTIVE,
    createdAt: new Date('2017-01-01'),
    updatedAt: new Date('2024-01-11'),
  },
  {
    id: 'dept-006',
    code: 'IT',
    name: 'IT',
    description: 'Information technology, software development, and infrastructure management.',
    headOfDepartmentId: 'emp-010',
    headOfDepartmentName: 'Kavita Nair',
    parentDepartmentId: undefined,
    location: 'Building B, Floor 4',
    costCenter: 'CC-IT-001',
    budget: 2500000,
    employeeCount: 20,
    status: DepartmentStatus.ACTIVE,
    createdAt: new Date('2017-01-01'),
    updatedAt: new Date('2024-01-14'),
  },
  {
    id: 'dept-007',
    code: 'MAINT',
    name: 'Maintenance',
    description: 'Equipment maintenance, repairs, and facility management.',
    headOfDepartmentId: undefined,
    parentDepartmentId: 'dept-001',
    parentDepartmentName: 'Production',
    location: 'Building A, Ground Floor',
    costCenter: 'CC-MAINT-001',
    budget: 1800000,
    employeeCount: 22,
    status: DepartmentStatus.ACTIVE,
    createdAt: new Date('2017-06-01'),
    updatedAt: new Date('2024-01-08'),
  },
  {
    id: 'dept-008',
    code: 'LOG',
    name: 'Logistics',
    description: 'Supply chain management, warehousing, and distribution.',
    headOfDepartmentId: undefined,
    parentDepartmentId: undefined,
    location: 'Warehouse Complex',
    costCenter: 'CC-LOG-001',
    budget: 2200000,
    employeeCount: 30,
    status: DepartmentStatus.ACTIVE,
    createdAt: new Date('2017-04-01'),
    updatedAt: new Date('2024-01-09'),
  },
  {
    id: 'dept-009',
    code: 'RND',
    name: 'Research & Development',
    description: 'Product research, innovation, and new technology development.',
    headOfDepartmentId: undefined,
    parentDepartmentId: undefined,
    location: 'Building D, All Floors',
    costCenter: 'CC-RND-001',
    budget: 4000000,
    employeeCount: 16,
    status: DepartmentStatus.ACTIVE,
    createdAt: new Date('2018-01-01'),
    updatedAt: new Date('2024-01-13'),
  },
  {
    id: 'dept-010',
    code: 'ADMIN',
    name: 'Administration',
    description: 'General administration, office management, and support services.',
    headOfDepartmentId: undefined,
    parentDepartmentId: undefined,
    location: 'Building B, Floor 1',
    costCenter: 'CC-ADMIN-001',
    budget: 800000,
    employeeCount: 8,
    status: DepartmentStatus.INACTIVE,
    createdAt: new Date('2017-01-01'),
    updatedAt: new Date('2023-12-01'),
  },
];

// ============================================================================
// Department Service Class
// ============================================================================

export class DepartmentService {
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
   * Get all departments with optional filters
   */
  static async getAllDepartments(filters?: DepartmentFilters): Promise<Department[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredDepartments = [...MOCK_DEPARTMENTS];

      if (filters?.status) {
        filteredDepartments = filteredDepartments.filter(
          (d) => d.status === filters.status
        );
      }
      if (filters?.parentDepartmentId) {
        filteredDepartments = filteredDepartments.filter(
          (d) => d.parentDepartmentId === filters.parentDepartmentId
        );
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredDepartments = filteredDepartments.filter(
          (d) =>
            d.name.toLowerCase().includes(searchLower) ||
            d.code.toLowerCase().includes(searchLower) ||
            d.description.toLowerCase().includes(searchLower)
        );
      }

      return filteredDepartments;
    }

    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.parentDepartmentId) queryParams.set('parentDepartmentId', filters.parentDepartmentId);
    if (filters?.search) queryParams.set('search', filters.search);

    return this.request<Department[]>(`/api/v1/common-masters/departments?${queryParams.toString()}`);
  }

  /**
   * Get department by ID
   */
  static async getDepartmentById(id: string): Promise<Department> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const department = MOCK_DEPARTMENTS.find((d) => d.id === id);
      if (!department) throw new Error('Department not found');
      return department;
    }
    return this.request<Department>(`/hr/departments/${id}`);
  }

  /**
   * Get department by code
   */
  static async getDepartmentByCode(code: string): Promise<Department> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const department = MOCK_DEPARTMENTS.find(
        (d) => d.code.toLowerCase() === code.toLowerCase()
      );
      if (!department) throw new Error('Department not found');
      return department;
    }
    return this.request<Department>(`/hr/departments/code/${code}`);
  }

  /**
   * Create a new department
   */
  static async createDepartment(data: CreateDepartmentDto): Promise<Department> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check for duplicate code
      const exists = MOCK_DEPARTMENTS.some(
        (d) => d.code.toLowerCase() === data.code.toLowerCase()
      );
      if (exists) throw new Error('Department code already exists');

      const parentDept = data.parentDepartmentId
        ? MOCK_DEPARTMENTS.find((d) => d.id === data.parentDepartmentId)
        : undefined;

      const newDepartment: Department = {
        id: `dept-${Date.now()}`,
        ...data,
        parentDepartmentName: parentDept?.name,
        employeeCount: 0,
        status: data.status || DepartmentStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_DEPARTMENTS.push(newDepartment);
      return newDepartment;
    }
    return this.request<Department>('/hr/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing department
   */
  static async updateDepartment(id: string, data: UpdateDepartmentDto): Promise<Department> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_DEPARTMENTS.findIndex((d) => d.id === id);
      if (index === -1) throw new Error('Department not found');

      // Check for duplicate code if code is being changed
      if (data.code && data.code !== MOCK_DEPARTMENTS[index].code) {
        const exists = MOCK_DEPARTMENTS.some(
          (d) => d.code.toLowerCase() === data.code!.toLowerCase() && d.id !== id
        );
        if (exists) throw new Error('Department code already exists');
      }

      const parentDept = data.parentDepartmentId
        ? MOCK_DEPARTMENTS.find((d) => d.id === data.parentDepartmentId)
        : undefined;

      MOCK_DEPARTMENTS[index] = {
        ...MOCK_DEPARTMENTS[index],
        ...data,
        parentDepartmentName: parentDept?.name || MOCK_DEPARTMENTS[index].parentDepartmentName,
        updatedAt: new Date(),
      };
      return MOCK_DEPARTMENTS[index];
    }
    return this.request<Department>(`/hr/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a department
   */
  static async deleteDepartment(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_DEPARTMENTS.findIndex((d) => d.id === id);
      if (index === -1) throw new Error('Department not found');

      // Check if department has sub-departments
      const hasSubDepartments = MOCK_DEPARTMENTS.some(
        (d) => d.parentDepartmentId === id
      );
      if (hasSubDepartments) {
        throw new Error('Cannot delete department with sub-departments');
      }

      // Check if department has employees
      const dept = MOCK_DEPARTMENTS[index];
      if (dept.employeeCount > 0) {
        throw new Error('Cannot delete department with employees');
      }

      MOCK_DEPARTMENTS.splice(index, 1);
      return;
    }
    await this.request<void>(`/hr/departments/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get sub-departments for a parent department
   */
  static async getSubDepartments(parentId: string): Promise<Department[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return MOCK_DEPARTMENTS.filter((d) => d.parentDepartmentId === parentId);
    }
    return this.request<Department[]>(`/hr/departments/${parentId}/sub-departments`);
  }

  /**
   * Get department hierarchy (tree structure)
   */
  static async getDepartmentHierarchy(): Promise<Department[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      // Return only root departments (those without parent)
      return MOCK_DEPARTMENTS.filter((d) => !d.parentDepartmentId);
    }
    return this.request<Department[]>('/hr/departments/hierarchy');
  }

  /**
   * Get department statistics
   */
  static async getStatistics(): Promise<{
    totalDepartments: number;
    activeDepartments: number;
    totalBudget: number;
    totalEmployees: number;
    departmentsByStatus: Record<string, number>;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const departmentsByStatus: Record<string, number> = {};

      let totalBudget = 0;
      let totalEmployees = 0;

      MOCK_DEPARTMENTS.forEach((dept) => {
        departmentsByStatus[dept.status] = (departmentsByStatus[dept.status] || 0) + 1;
        totalBudget += dept.budget || 0;
        totalEmployees += dept.employeeCount;
      });

      return {
        totalDepartments: MOCK_DEPARTMENTS.length,
        activeDepartments: MOCK_DEPARTMENTS.filter(
          (d) => d.status === DepartmentStatus.ACTIVE
        ).length,
        totalBudget,
        totalEmployees,
        departmentsByStatus,
      };
    }

    return this.request<{
      totalDepartments: number;
      activeDepartments: number;
      totalBudget: number;
      totalEmployees: number;
      departmentsByStatus: Record<string, number>;
    }>('/hr/departments/statistics');
  }
}

// Export singleton instance
export const departmentService = DepartmentService;
