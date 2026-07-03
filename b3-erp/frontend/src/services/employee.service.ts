/**
 * Employee Service
 * Handles all employee-related API operations for the HR module
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = true;

// ============================================================================
// Interfaces
// ============================================================================

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
  PROBATION = 'PROBATION',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
  TEMPORARY = 'TEMPORARY',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: Gender;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  departmentId: string;
  departmentName?: string;
  designation: string;
  reportingManagerId?: string;
  reportingManagerName?: string;
  dateOfJoining: Date;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  salary: number;
  bankAccountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  panNumber?: string;
  aadharNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeDto {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date | string;
  gender: Gender;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  departmentId: string;
  designation: string;
  reportingManagerId?: string;
  dateOfJoining: Date | string;
  employmentType: EmploymentType;
  status?: EmployeeStatus;
  salary: number;
  bankAccountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  panNumber?: string;
  aadharNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {}

export interface EmployeeFilters {
  departmentId?: string;
  status?: EmployeeStatus;
  employmentType?: EmploymentType;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Mock Data - 10 Demo Employees
// ============================================================================

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    employeeCode: 'EMP001',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh.kumar@manufacturingos.com',
    phone: '+91 98765 43210',
    dateOfBirth: new Date('1985-03-15'),
    gender: Gender.MALE,
    address: '123, MG Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    postalCode: '400001',
    departmentId: 'dept-001',
    departmentName: 'Production',
    designation: 'Production Manager',
    reportingManagerId: undefined,
    dateOfJoining: new Date('2018-06-01'),
    employmentType: EmploymentType.FULL_TIME,
    status: EmployeeStatus.ACTIVE,
    salary: 150000,
    bankAccountNumber: '1234567890',
    bankName: 'HDFC Bank',
    ifscCode: 'HDFC0001234',
    panNumber: 'ABCPK1234A',
    aadharNumber: '1234 5678 9012',
    emergencyContactName: 'Priya Kumar',
    emergencyContactPhone: '+91 98765 43211',
    emergencyContactRelation: 'Spouse',
    createdAt: new Date('2018-06-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'emp-002',
    employeeCode: 'EMP002',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@manufacturingos.com',
    phone: '+91 98765 43220',
    dateOfBirth: new Date('1990-07-22'),
    gender: Gender.FEMALE,
    address: '456, Linking Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    postalCode: '400050',
    departmentId: 'dept-002',
    departmentName: 'Human Resources',
    designation: 'HR Manager',
    reportingManagerId: undefined,
    dateOfJoining: new Date('2019-03-15'),
    employmentType: EmploymentType.FULL_TIME,
    status: EmployeeStatus.ACTIVE,
    salary: 120000,
    bankAccountNumber: '2345678901',
    bankName: 'ICICI Bank',
    ifscCode: 'ICIC0002345',
    panNumber: 'DEFPS5678B',
    aadharNumber: '2345 6789 0123',
    emergencyContactName: 'Amit Sharma',
    emergencyContactPhone: '+91 98765 43221',
    emergencyContactRelation: 'Brother',
    createdAt: new Date('2019-03-15'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'emp-003',
    employeeCode: 'EMP003',
    firstName: 'Amit',
    lastName: 'Patel',
    email: 'amit.patel@manufacturingos.com',
    phone: '+91 98765 43230',
    dateOfBirth: new Date('1988-11-08'),
    gender: Gender.MALE,
    address: '789, SG Highway',
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    postalCode: '380015',
    departmentId: 'dept-003',
    departmentName: 'Quality Control',
    designation: 'Quality Engineer',
    reportingManagerId: 'emp-001',
    reportingManagerName: 'Rajesh Kumar',
    dateOfJoining: new Date('2020-01-10'),
    employmentType: EmploymentType.FULL_TIME,
    status: EmployeeStatus.ACTIVE,
    salary: 85000,
    bankAccountNumber: '3456789012',
    bankName: 'State Bank of India',
    ifscCode: 'SBIN0003456',
    panNumber: 'GHIPA9012C',
    aadharNumber: '3456 7890 1234',
    emergencyContactName: 'Neha Patel',
    emergencyContactPhone: '+91 98765 43231',
    emergencyContactRelation: 'Wife',
    createdAt: new Date('2020-01-10'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'emp-004',
    employeeCode: 'EMP004',
    firstName: 'Sneha',
    lastName: 'Reddy',
    email: 'sneha.reddy@manufacturingos.com',
    phone: '+91 98765 43240',
    dateOfBirth: new Date('1992-04-30'),
    gender: Gender.FEMALE,
    address: '321, Banjara Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    postalCode: '500034',
    departmentId: 'dept-004',
    departmentName: 'Finance',
    designation: 'Finance Analyst',
    reportingManagerId: 'emp-006',
    reportingManagerName: 'Vikram Singh',
    dateOfJoining: new Date('2021-05-20'),
    employmentType: EmploymentType.FULL_TIME,
    status: EmployeeStatus.ACTIVE,
    salary: 95000,
    bankAccountNumber: '4567890123',
    bankName: 'Axis Bank',
    ifscCode: 'AXIS0004567',
    panNumber: 'JKLSR3456D',
    aadharNumber: '4567 8901 2345',
    emergencyContactName: 'Ravi Reddy',
    emergencyContactPhone: '+91 98765 43241',
    emergencyContactRelation: 'Father',
    createdAt: new Date('2021-05-20'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: 'emp-005',
    employeeCode: 'EMP005',
    firstName: 'Mohammed',
    lastName: 'Khan',
    email: 'mohammed.khan@manufacturingos.com',
    phone: '+91 98765 43250',
    dateOfBirth: new Date('1987-09-12'),
    gender: Gender.MALE,
    address: '654, Koramangala',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    postalCode: '560034',
    departmentId: 'dept-001',
    departmentName: 'Production',
    designation: 'Senior Technician',
    reportingManagerId: 'emp-001',
    reportingManagerName: 'Rajesh Kumar',
    dateOfJoining: new Date('2019-08-01'),
    employmentType: EmploymentType.FULL_TIME,
    status: EmployeeStatus.ACTIVE,
    salary: 75000,
    bankAccountNumber: '5678901234',
    bankName: 'Kotak Mahindra Bank',
    ifscCode: 'KKBK0005678',
    panNumber: 'MNOKH7890E',
    aadharNumber: '5678 9012 3456',
    emergencyContactName: 'Fatima Khan',
    emergencyContactPhone: '+91 98765 43251',
    emergencyContactRelation: 'Wife',
    createdAt: new Date('2019-08-01'),
    updatedAt: new Date('2024-01-08'),
  },
  {
    id: 'emp-006',
    employeeCode: 'EMP006',
    firstName: 'Vikram',
    lastName: 'Singh',
    email: 'vikram.singh@manufacturingos.com',
    phone: '+91 98765 43260',
    dateOfBirth: new Date('1982-12-25'),
    gender: Gender.MALE,
    address: '987, Sector 18',
    city: 'Noida',
    state: 'Uttar Pradesh',
    country: 'India',
    postalCode: '201301',
    departmentId: 'dept-004',
    departmentName: 'Finance',
    designation: 'Finance Director',
    reportingManagerId: undefined,
    dateOfJoining: new Date('2017-04-01'),
    employmentType: EmploymentType.FULL_TIME,
    status: EmployeeStatus.ACTIVE,
    salary: 200000,
    bankAccountNumber: '6789012345',
    bankName: 'HDFC Bank',
    ifscCode: 'HDFC0006789',
    panNumber: 'PQRVS1234F',
    aadharNumber: '6789 0123 4567',
    emergencyContactName: 'Meera Singh',
    emergencyContactPhone: '+91 98765 43261',
    emergencyContactRelation: 'Wife',
    createdAt: new Date('2017-04-01'),
    updatedAt: new Date('2024-01-14'),
  },
  {
    id: 'emp-007',
    employeeCode: 'EMP007',
    firstName: 'Anita',
    lastName: 'Desai',
    email: 'anita.desai@manufacturingos.com',
    phone: '+91 98765 43270',
    dateOfBirth: new Date('1995-06-18'),
    gender: Gender.FEMALE,
    address: '147, FC Road',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    postalCode: '411004',
    departmentId: 'dept-005',
    departmentName: 'Sales',
    designation: 'Sales Executive',
    reportingManagerId: 'emp-009',
    reportingManagerName: 'Sanjay Gupta',
    dateOfJoining: new Date('2022-09-01'),
    employmentType: EmploymentType.FULL_TIME,
    status: EmployeeStatus.PROBATION,
    salary: 55000,
    bankAccountNumber: '7890123456',
    bankName: 'Punjab National Bank',
    ifscCode: 'PUNB0007890',
    panNumber: 'STUD5678G',
    aadharNumber: '7890 1234 5678',
    emergencyContactName: 'Rajiv Desai',
    emergencyContactPhone: '+91 98765 43271',
    emergencyContactRelation: 'Father',
    createdAt: new Date('2022-09-01'),
    updatedAt: new Date('2024-01-11'),
  },
  {
    id: 'emp-008',
    employeeCode: 'EMP008',
    firstName: 'Deepak',
    lastName: 'Verma',
    email: 'deepak.verma@manufacturingos.com',
    phone: '+91 98765 43280',
    dateOfBirth: new Date('1991-02-28'),
    gender: Gender.MALE,
    address: '258, Civil Lines',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    postalCode: '110054',
    departmentId: 'dept-006',
    departmentName: 'IT',
    designation: 'Software Developer',
    reportingManagerId: 'emp-010',
    reportingManagerName: 'Kavita Nair',
    dateOfJoining: new Date('2021-02-15'),
    employmentType: EmploymentType.FULL_TIME,
    status: EmployeeStatus.ACTIVE,
    salary: 90000,
    bankAccountNumber: '8901234567',
    bankName: 'ICICI Bank',
    ifscCode: 'ICIC0008901',
    panNumber: 'VWXDV9012H',
    aadharNumber: '8901 2345 6789',
    emergencyContactName: 'Sunita Verma',
    emergencyContactPhone: '+91 98765 43281',
    emergencyContactRelation: 'Mother',
    createdAt: new Date('2021-02-15'),
    updatedAt: new Date('2024-01-09'),
  },
  {
    id: 'emp-009',
    employeeCode: 'EMP009',
    firstName: 'Sanjay',
    lastName: 'Gupta',
    email: 'sanjay.gupta@manufacturingos.com',
    phone: '+91 98765 43290',
    dateOfBirth: new Date('1984-08-05'),
    gender: Gender.MALE,
    address: '369, Park Street',
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    postalCode: '700016',
    departmentId: 'dept-005',
    departmentName: 'Sales',
    designation: 'Sales Manager',
    reportingManagerId: undefined,
    dateOfJoining: new Date('2018-11-01'),
    employmentType: EmploymentType.FULL_TIME,
    status: EmployeeStatus.ON_LEAVE,
    salary: 140000,
    bankAccountNumber: '9012345678',
    bankName: 'Bank of Baroda',
    ifscCode: 'BARB0009012',
    panNumber: 'YZASG3456I',
    aadharNumber: '9012 3456 7890',
    emergencyContactName: 'Rekha Gupta',
    emergencyContactPhone: '+91 98765 43291',
    emergencyContactRelation: 'Wife',
    createdAt: new Date('2018-11-01'),
    updatedAt: new Date('2024-01-13'),
  },
  {
    id: 'emp-010',
    employeeCode: 'EMP010',
    firstName: 'Kavita',
    lastName: 'Nair',
    email: 'kavita.nair@manufacturingos.com',
    phone: '+91 98765 43300',
    dateOfBirth: new Date('1986-10-10'),
    gender: Gender.FEMALE,
    address: '741, MG Road',
    city: 'Kochi',
    state: 'Kerala',
    country: 'India',
    postalCode: '682011',
    departmentId: 'dept-006',
    departmentName: 'IT',
    designation: 'IT Manager',
    reportingManagerId: undefined,
    dateOfJoining: new Date('2019-01-15'),
    employmentType: EmploymentType.FULL_TIME,
    status: EmployeeStatus.ACTIVE,
    salary: 160000,
    bankAccountNumber: '0123456789',
    bankName: 'Federal Bank',
    ifscCode: 'FDRL0000123',
    panNumber: 'BCDKN7890J',
    aadharNumber: '0123 4567 8901',
    emergencyContactName: 'Arun Nair',
    emergencyContactPhone: '+91 98765 43301',
    emergencyContactRelation: 'Husband',
    createdAt: new Date('2019-01-15'),
    updatedAt: new Date('2024-01-07'),
  },
];

// ============================================================================
// Employee Service Class
// ============================================================================

export class EmployeeService {
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
   * Get all employees with optional filters
   */
  static async getAllEmployees(filters?: EmployeeFilters): Promise<Employee[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredEmployees = [...MOCK_EMPLOYEES];

      if (filters?.departmentId) {
        filteredEmployees = filteredEmployees.filter(
          (e) => e.departmentId === filters.departmentId
        );
      }
      if (filters?.status) {
        filteredEmployees = filteredEmployees.filter(
          (e) => e.status === filters.status
        );
      }
      if (filters?.employmentType) {
        filteredEmployees = filteredEmployees.filter(
          (e) => e.employmentType === filters.employmentType
        );
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredEmployees = filteredEmployees.filter(
          (e) =>
            e.firstName.toLowerCase().includes(searchLower) ||
            e.lastName.toLowerCase().includes(searchLower) ||
            e.email.toLowerCase().includes(searchLower) ||
            e.employeeCode.toLowerCase().includes(searchLower) ||
            e.designation.toLowerCase().includes(searchLower)
        );
      }

      // Pagination
      if (filters?.page && filters?.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        filteredEmployees = filteredEmployees.slice(start, end);
      }

      return filteredEmployees;
    }

    const queryParams = new URLSearchParams();
    if (filters?.departmentId) queryParams.set('departmentId', filters.departmentId);
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.employmentType) queryParams.set('employmentType', filters.employmentType);
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.page) queryParams.set('page', filters.page.toString());
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());

    return this.request<Employee[]>(`/hr/employees?${queryParams.toString()}`);
  }

  /**
   * Get employee by ID
   */
  static async getEmployeeById(id: string): Promise<Employee> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const employee = MOCK_EMPLOYEES.find((e) => e.id === id);
      if (!employee) throw new Error('Employee not found');
      return employee;
    }
    return this.request<Employee>(`/hr/employees/${id}`);
  }

  /**
   * Get count of active employees
   */
  static async getActiveCount(): Promise<number> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return MOCK_EMPLOYEES.filter((e) => e.status === EmployeeStatus.ACTIVE).length;
    }
    const response = await this.request<{ count: number }>('/hr/employees/active/count');
    return response.count;
  }

  /**
   * Get employees by department
   */
  static async getByDepartment(deptId: string): Promise<Employee[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return MOCK_EMPLOYEES.filter((e) => e.departmentId === deptId);
    }
    return this.request<Employee[]>(`/hr/employees/department/${deptId}`);
  }

  /**
   * Create a new employee
   */
  static async createEmployee(data: CreateEmployeeDto): Promise<Employee> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newEmployee: Employee = {
        id: `emp-${Date.now()}`,
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
        dateOfJoining: new Date(data.dateOfJoining),
        status: data.status || EmployeeStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_EMPLOYEES.push(newEmployee);
      return newEmployee;
    }
    return this.request<Employee>('/hr/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing employee
   */
  static async updateEmployee(id: string, data: UpdateEmployeeDto): Promise<Employee> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_EMPLOYEES.findIndex((e) => e.id === id);
      if (index === -1) throw new Error('Employee not found');

      MOCK_EMPLOYEES[index] = {
        ...MOCK_EMPLOYEES[index],
        ...data,
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth)
          : MOCK_EMPLOYEES[index].dateOfBirth,
        dateOfJoining: data.dateOfJoining
          ? new Date(data.dateOfJoining)
          : MOCK_EMPLOYEES[index].dateOfJoining,
        updatedAt: new Date(),
      };
      return MOCK_EMPLOYEES[index];
    }
    return this.request<Employee>(`/hr/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete an employee
   */
  static async deleteEmployee(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_EMPLOYEES.findIndex((e) => e.id === id);
      if (index === -1) throw new Error('Employee not found');
      MOCK_EMPLOYEES.splice(index, 1);
      return;
    }
    await this.request<void>(`/hr/employees/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get employee statistics
   */
  static async getStatistics(): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    onLeaveEmployees: number;
    newHiresThisMonth: number;
    employeesByDepartment: Record<string, number>;
    employeesByStatus: Record<string, number>;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const employeesByDepartment: Record<string, number> = {};
      const employeesByStatus: Record<string, number> = {};

      MOCK_EMPLOYEES.forEach((emp) => {
        const deptName = emp.departmentName || 'Unknown';
        employeesByDepartment[deptName] = (employeesByDepartment[deptName] || 0) + 1;
        employeesByStatus[emp.status] = (employeesByStatus[emp.status] || 0) + 1;
      });

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const newHires = MOCK_EMPLOYEES.filter(
        (e) => new Date(e.dateOfJoining) >= thisMonth
      ).length;

      return {
        totalEmployees: MOCK_EMPLOYEES.length,
        activeEmployees: MOCK_EMPLOYEES.filter((e) => e.status === EmployeeStatus.ACTIVE).length,
        onLeaveEmployees: MOCK_EMPLOYEES.filter((e) => e.status === EmployeeStatus.ON_LEAVE).length,
        newHiresThisMonth: newHires,
        employeesByDepartment,
        employeesByStatus,
      };
    }

    return this.request<{
      totalEmployees: number;
      activeEmployees: number;
      onLeaveEmployees: number;
      newHiresThisMonth: number;
      employeesByDepartment: Record<string, number>;
      employeesByStatus: Record<string, number>;
    }>('/hr/employees/statistics');
  }
}

// Export singleton instance
export const employeeService = EmployeeService;
