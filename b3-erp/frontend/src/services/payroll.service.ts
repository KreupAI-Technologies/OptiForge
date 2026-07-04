/**
 * Payroll Service
 * Handles all payroll-related API operations for the HR module
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Interfaces
// ============================================================================

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  PROCESSED = 'PROCESSED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
  CASH = 'CASH',
  UPI = 'UPI',
}

export enum SalarySlipStatus {
  DRAFT = 'DRAFT',
  GENERATED = 'GENERATED',
  SENT = 'SENT',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
}

export interface Payroll {
  id: string;
  payrollPeriod: string;
  month: number;
  year: number;
  totalEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
  totalTaxDeductions: number;
  totalPfContributions: number;
  totalOtherDeductions: number;
  status: PayrollStatus;
  processedBy?: string;
  processedByName?: string;
  processedAt?: Date;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;
  paidAt?: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalaryComponent {
  name: string;
  code: string;
  amount: number;
  type: 'EARNING' | 'DEDUCTION';
}

export interface SalarySlip {
  id: string;
  payrollId: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  departmentId?: string;
  departmentName?: string;
  designation?: string;
  month: number;
  year: number;
  workingDays: number;
  presentDays: number;
  leaveDays: number;
  basicSalary: number;
  houseRentAllowance: number;
  dearnessAllowance: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  otherEarnings: number;
  overtimePay: number;
  bonus: number;
  grossSalary: number;
  providentFund: number;
  professionalTax: number;
  incomeTax: number;
  esiContribution: number;
  loanDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  paymentMethod: PaymentMethod;
  bankAccountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  paymentReferenceNumber?: string;
  paidAt?: Date;
  status: SalarySlipStatus;
  earnings: SalaryComponent[];
  deductions: SalaryComponent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollFilters {
  month?: number;
  year?: number;
  status?: PayrollStatus;
  page?: number;
  limit?: number;
}

export interface SalarySlipFilters {
  payrollId?: string;
  employeeId?: string;
  departmentId?: string;
  month?: number;
  year?: number;
  status?: SalarySlipStatus;
  page?: number;
  limit?: number;
}

export interface PayrollSummary {
  month: number;
  year: number;
  totalEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
  averageSalary: number;
  highestSalary: number;
  lowestSalary: number;
  departmentWiseSalary: Record<string, number>;
}

// ============================================================================
// Mock Data - Payrolls
// ============================================================================

export const MOCK_PAYROLLS: Payroll[] = [
  {
    id: 'pr-001',
    payrollPeriod: 'January 2024',
    month: 1,
    year: 2024,
    totalEmployees: 10,
    totalGrossSalary: 1171000,
    totalDeductions: 175650,
    totalNetSalary: 995350,
    totalTaxDeductions: 87500,
    totalPfContributions: 70260,
    totalOtherDeductions: 17890,
    status: PayrollStatus.PAID,
    processedBy: 'emp-002',
    processedByName: 'Priya Sharma',
    processedAt: new Date('2024-01-28'),
    approvedBy: 'emp-006',
    approvedByName: 'Vikram Singh',
    approvedAt: new Date('2024-01-29'),
    paidAt: new Date('2024-01-31'),
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-31'),
  },
  {
    id: 'pr-002',
    payrollPeriod: 'December 2023',
    month: 12,
    year: 2023,
    totalEmployees: 10,
    totalGrossSalary: 1171000,
    totalDeductions: 175650,
    totalNetSalary: 995350,
    totalTaxDeductions: 87500,
    totalPfContributions: 70260,
    totalOtherDeductions: 17890,
    status: PayrollStatus.PAID,
    processedBy: 'emp-002',
    processedByName: 'Priya Sharma',
    processedAt: new Date('2023-12-28'),
    approvedBy: 'emp-006',
    approvedByName: 'Vikram Singh',
    approvedAt: new Date('2023-12-29'),
    paidAt: new Date('2023-12-31'),
    createdAt: new Date('2023-12-25'),
    updatedAt: new Date('2023-12-31'),
  },
  {
    id: 'pr-003',
    payrollPeriod: 'November 2023',
    month: 11,
    year: 2023,
    totalEmployees: 10,
    totalGrossSalary: 1171000,
    totalDeductions: 175650,
    totalNetSalary: 995350,
    totalTaxDeductions: 87500,
    totalPfContributions: 70260,
    totalOtherDeductions: 17890,
    status: PayrollStatus.PAID,
    processedBy: 'emp-002',
    processedByName: 'Priya Sharma',
    processedAt: new Date('2023-11-28'),
    approvedBy: 'emp-006',
    approvedByName: 'Vikram Singh',
    approvedAt: new Date('2023-11-29'),
    paidAt: new Date('2023-11-30'),
    createdAt: new Date('2023-11-25'),
    updatedAt: new Date('2023-11-30'),
  },
  {
    id: 'pr-004',
    payrollPeriod: 'February 2024',
    month: 2,
    year: 2024,
    totalEmployees: 10,
    totalGrossSalary: 1171000,
    totalDeductions: 175650,
    totalNetSalary: 995350,
    totalTaxDeductions: 87500,
    totalPfContributions: 70260,
    totalOtherDeductions: 17890,
    status: PayrollStatus.PENDING_APPROVAL,
    processedBy: 'emp-002',
    processedByName: 'Priya Sharma',
    processedAt: new Date('2024-02-26'),
    createdAt: new Date('2024-02-25'),
    updatedAt: new Date('2024-02-26'),
  },
];

// ============================================================================
// Mock Data - Salary Slips
// ============================================================================

const generateSalarySlips = (): SalarySlip[] => {
  const employees = [
    { id: 'emp-001', name: 'Rajesh Kumar', code: 'EMP001', deptId: 'dept-001', deptName: 'Production', designation: 'Production Manager', salary: 150000 },
    { id: 'emp-002', name: 'Priya Sharma', code: 'EMP002', deptId: 'dept-002', deptName: 'Human Resources', designation: 'HR Manager', salary: 120000 },
    { id: 'emp-003', name: 'Amit Patel', code: 'EMP003', deptId: 'dept-003', deptName: 'Quality Control', designation: 'Quality Engineer', salary: 85000 },
    { id: 'emp-004', name: 'Sneha Reddy', code: 'EMP004', deptId: 'dept-004', deptName: 'Finance', designation: 'Finance Analyst', salary: 95000 },
    { id: 'emp-005', name: 'Mohammed Khan', code: 'EMP005', deptId: 'dept-001', deptName: 'Production', designation: 'Senior Technician', salary: 75000 },
    { id: 'emp-006', name: 'Vikram Singh', code: 'EMP006', deptId: 'dept-004', deptName: 'Finance', designation: 'Finance Director', salary: 200000 },
    { id: 'emp-007', name: 'Anita Desai', code: 'EMP007', deptId: 'dept-005', deptName: 'Sales', designation: 'Sales Executive', salary: 55000 },
    { id: 'emp-008', name: 'Deepak Verma', code: 'EMP008', deptId: 'dept-006', deptName: 'IT', designation: 'Software Developer', salary: 90000 },
    { id: 'emp-009', name: 'Sanjay Gupta', code: 'EMP009', deptId: 'dept-005', deptName: 'Sales', designation: 'Sales Manager', salary: 140000 },
    { id: 'emp-010', name: 'Kavita Nair', code: 'EMP010', deptId: 'dept-006', deptName: 'IT', designation: 'IT Manager', salary: 160000 },
  ];

  const slips: SalarySlip[] = [];

  // Generate for January 2024 payroll
  for (const emp of employees) {
    const basicSalary = Math.round(emp.salary * 0.4);
    const hra = Math.round(emp.salary * 0.2);
    const da = Math.round(emp.salary * 0.1);
    const conveyance = Math.round(emp.salary * 0.05);
    const medical = Math.round(emp.salary * 0.05);
    const special = Math.round(emp.salary * 0.15);
    const otherEarnings = Math.round(emp.salary * 0.05);

    const grossSalary = basicSalary + hra + da + conveyance + medical + special + otherEarnings;

    const pf = Math.round(basicSalary * 0.12);
    const pt = emp.salary > 50000 ? 200 : 0;
    const incomeTax = Math.round(emp.salary * 0.05);
    const esi = emp.salary <= 21000 ? Math.round(grossSalary * 0.0075) : 0;
    const otherDeductions = 0;

    const totalDeductions = pf + pt + incomeTax + esi + otherDeductions;
    const netSalary = grossSalary - totalDeductions;

    slips.push({
      id: `ss-001-${emp.id}`,
      payrollId: 'pr-001',
      employeeId: emp.id,
      employeeName: emp.name,
      employeeCode: emp.code,
      departmentId: emp.deptId,
      departmentName: emp.deptName,
      designation: emp.designation,
      month: 1,
      year: 2024,
      workingDays: 22,
      presentDays: 20 + Math.floor(Math.random() * 3),
      leaveDays: Math.floor(Math.random() * 3),
      basicSalary,
      houseRentAllowance: hra,
      dearnessAllowance: da,
      conveyanceAllowance: conveyance,
      medicalAllowance: medical,
      specialAllowance: special,
      otherEarnings,
      overtimePay: 0,
      bonus: 0,
      grossSalary,
      providentFund: pf,
      professionalTax: pt,
      incomeTax,
      esiContribution: esi,
      loanDeduction: 0,
      otherDeductions,
      totalDeductions,
      netSalary,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      bankAccountNumber: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      bankName: 'HDFC Bank',
      ifscCode: 'HDFC0001234',
      paymentReferenceNumber: `TXN${Date.now()}${emp.code}`,
      paidAt: new Date('2024-01-31'),
      status: SalarySlipStatus.SENT,
      earnings: [
        { name: 'Basic Salary', code: 'BASIC', amount: basicSalary, type: 'EARNING' },
        { name: 'House Rent Allowance', code: 'HRA', amount: hra, type: 'EARNING' },
        { name: 'Dearness Allowance', code: 'DA', amount: da, type: 'EARNING' },
        { name: 'Conveyance Allowance', code: 'CA', amount: conveyance, type: 'EARNING' },
        { name: 'Medical Allowance', code: 'MA', amount: medical, type: 'EARNING' },
        { name: 'Special Allowance', code: 'SA', amount: special, type: 'EARNING' },
        { name: 'Other Earnings', code: 'OE', amount: otherEarnings, type: 'EARNING' },
      ],
      deductions: [
        { name: 'Provident Fund', code: 'PF', amount: pf, type: 'DEDUCTION' },
        { name: 'Professional Tax', code: 'PT', amount: pt, type: 'DEDUCTION' },
        { name: 'Income Tax', code: 'IT', amount: incomeTax, type: 'DEDUCTION' },
        { name: 'ESI Contribution', code: 'ESI', amount: esi, type: 'DEDUCTION' },
      ],
      createdAt: new Date('2024-01-28'),
      updatedAt: new Date('2024-01-31'),
    });
  }

  return slips;
};

export const MOCK_SALARY_SLIPS: SalarySlip[] = generateSalarySlips();

// ============================================================================
// Payroll Service Class
// ============================================================================

export class PayrollService {
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
   * Get all salary structures (raw ORM shape) with company header.
   * Backend returns [] when unseeded.
   */
  static async getSalaryStructures(): Promise<any[]> {
    return this.request<any[]>('/hr/salary-structures', {
      headers: { 'x-company-id': 'test' },
    });
  }

  /**
   * Get all payroll tax records (raw ORM shape) with company header.
   * Backend returns [] when unseeded.
   */
  static async getTaxRecords(): Promise<any[]> {
    return this.request<any[]>('/hr/tax-records', {
      headers: { 'x-company-id': 'test' },
    });
  }

  /**
   * Get all payrolls with filters
   */
  static async getPayrolls(filters?: PayrollFilters): Promise<Payroll[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredPayrolls = [...MOCK_PAYROLLS];

      if (filters?.month) {
        filteredPayrolls = filteredPayrolls.filter((p) => p.month === filters.month);
      }
      if (filters?.year) {
        filteredPayrolls = filteredPayrolls.filter((p) => p.year === filters.year);
      }
      if (filters?.status) {
        filteredPayrolls = filteredPayrolls.filter((p) => p.status === filters.status);
      }

      // Sort by year and month descending
      filteredPayrolls.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });

      // Pagination
      if (filters?.page && filters?.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        filteredPayrolls = filteredPayrolls.slice(start, end);
      }

      return filteredPayrolls;
    }

    const queryParams = new URLSearchParams();
    if (filters?.month) queryParams.set('month', filters.month.toString());
    if (filters?.year) queryParams.set('year', filters.year.toString());
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.page) queryParams.set('page', filters.page.toString());
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());

    return this.request<Payroll[]>(`/hr/payroll?${queryParams.toString()}`);
  }

  /**
   * Get payroll by ID
   */
  static async getPayrollById(id: string): Promise<Payroll> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const payroll = MOCK_PAYROLLS.find((p) => p.id === id);
      if (!payroll) throw new Error('Payroll not found');
      return payroll;
    }
    return this.request<Payroll>(`/hr/payroll/${id}`);
  }

  /**
   * Process payroll (generate salary slips)
   */
  static async processPayroll(
    id: string,
    processedBy?: string
  ): Promise<Payroll> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const index = MOCK_PAYROLLS.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Payroll not found');

      if (MOCK_PAYROLLS[index].status !== PayrollStatus.DRAFT) {
        throw new Error('Only draft payrolls can be processed');
      }

      MOCK_PAYROLLS[index] = {
        ...MOCK_PAYROLLS[index],
        status: PayrollStatus.PENDING_APPROVAL,
        processedBy: processedBy || 'emp-002',
        processedByName: 'Priya Sharma',
        processedAt: new Date(),
        updatedAt: new Date(),
      };

      return MOCK_PAYROLLS[index];
    }
    return this.request<Payroll>(`/hr/payroll/${id}/process`, {
      method: 'POST',
      body: JSON.stringify({ processedBy }),
    });
  }

  /**
   * Approve payroll
   */
  static async approvePayroll(
    id: string,
    approvedBy?: string
  ): Promise<Payroll> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_PAYROLLS.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Payroll not found');

      if (MOCK_PAYROLLS[index].status !== PayrollStatus.PENDING_APPROVAL) {
        throw new Error('Only pending payrolls can be approved');
      }

      MOCK_PAYROLLS[index] = {
        ...MOCK_PAYROLLS[index],
        status: PayrollStatus.APPROVED,
        approvedBy: approvedBy || 'emp-006',
        approvedByName: 'Vikram Singh',
        approvedAt: new Date(),
        updatedAt: new Date(),
      };

      return MOCK_PAYROLLS[index];
    }
    return this.request<Payroll>(`/hr/payroll/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approvedBy }),
    });
  }

  /**
   * Mark payroll as paid
   */
  static async markPayrollPaid(id: string): Promise<Payroll> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_PAYROLLS.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Payroll not found');

      if (MOCK_PAYROLLS[index].status !== PayrollStatus.APPROVED) {
        throw new Error('Only approved payrolls can be marked as paid');
      }

      MOCK_PAYROLLS[index] = {
        ...MOCK_PAYROLLS[index],
        status: PayrollStatus.PAID,
        paidAt: new Date(),
        updatedAt: new Date(),
      };

      return MOCK_PAYROLLS[index];
    }
    return this.request<Payroll>(`/hr/payroll/${id}/pay`, {
      method: 'POST',
    });
  }

  /**
   * Get salary slips with filters
   */
  static async getSalarySlips(filters?: SalarySlipFilters): Promise<SalarySlip[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredSlips = [...MOCK_SALARY_SLIPS];

      if (filters?.payrollId) {
        filteredSlips = filteredSlips.filter((s) => s.payrollId === filters.payrollId);
      }
      if (filters?.employeeId) {
        filteredSlips = filteredSlips.filter((s) => s.employeeId === filters.employeeId);
      }
      if (filters?.departmentId) {
        filteredSlips = filteredSlips.filter((s) => s.departmentId === filters.departmentId);
      }
      if (filters?.month) {
        filteredSlips = filteredSlips.filter((s) => s.month === filters.month);
      }
      if (filters?.year) {
        filteredSlips = filteredSlips.filter((s) => s.year === filters.year);
      }
      if (filters?.status) {
        filteredSlips = filteredSlips.filter((s) => s.status === filters.status);
      }

      // Sort by employee name
      filteredSlips.sort((a, b) =>
        (a.employeeName || '').localeCompare(b.employeeName || '')
      );

      // Pagination
      if (filters?.page && filters?.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        filteredSlips = filteredSlips.slice(start, end);
      }

      return filteredSlips;
    }

    const queryParams = new URLSearchParams();
    if (filters?.payrollId) queryParams.set('payrollId', filters.payrollId);
    if (filters?.employeeId) queryParams.set('employeeId', filters.employeeId);
    if (filters?.departmentId) queryParams.set('departmentId', filters.departmentId);
    if (filters?.month) queryParams.set('month', filters.month.toString());
    if (filters?.year) queryParams.set('year', filters.year.toString());
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.page) queryParams.set('page', filters.page.toString());
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());

    return this.request<SalarySlip[]>(`/hr/salary-slips?${queryParams.toString()}`);
  }

  /**
   * Get salary slip by ID
   */
  static async getSalarySlipById(id: string): Promise<SalarySlip> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const slip = MOCK_SALARY_SLIPS.find((s) => s.id === id);
      if (!slip) throw new Error('Salary slip not found');
      return slip;
    }
    return this.request<SalarySlip>(`/hr/salary-slips/${id}`);
  }

  /**
   * Get salary slips for an employee
   */
  static async getEmployeeSalarySlips(employeeId: string): Promise<SalarySlip[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return MOCK_SALARY_SLIPS.filter((s) => s.employeeId === employeeId);
    }
    return this.request<SalarySlip[]>(`/hr/salary-slips/employee/${employeeId}`);
  }

  /**
   * Download salary slip PDF
   */
  static async downloadSalarySlipPdf(id: string): Promise<Blob> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // In mock mode, just return a placeholder
      throw new Error('PDF download not available in mock mode');
    }
    const response = await fetch(`${API_BASE_URL}/hr/salary-slips/${id}/pdf`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Failed to download salary slip');
    }
    return response.blob();
  }

  /**
   * Send salary slip to employee email
   */
  static async sendSalarySlipEmail(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_SALARY_SLIPS.findIndex((s) => s.id === id);
      if (index >= 0) {
        MOCK_SALARY_SLIPS[index].status = SalarySlipStatus.SENT;
      }
      return;
    }
    await this.request<void>(`/hr/salary-slips/${id}/send-email`, {
      method: 'POST',
    });
  }

  /**
   * Get payroll summary for a period
   */
  static async getPayrollSummary(month: number, year: number): Promise<PayrollSummary> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const slips = MOCK_SALARY_SLIPS.filter(
        (s) => s.month === month && s.year === year
      );

      const departmentWiseSalary: Record<string, number> = {};
      slips.forEach((slip) => {
        const deptName = slip.departmentName || 'Unknown';
        departmentWiseSalary[deptName] =
          (departmentWiseSalary[deptName] || 0) + slip.netSalary;
      });

      const salaries = slips.map((s) => s.netSalary);

      return {
        month,
        year,
        totalEmployees: slips.length,
        totalGrossSalary: slips.reduce((sum, s) => sum + s.grossSalary, 0),
        totalDeductions: slips.reduce((sum, s) => sum + s.totalDeductions, 0),
        totalNetSalary: slips.reduce((sum, s) => sum + s.netSalary, 0),
        averageSalary: salaries.length > 0
          ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length)
          : 0,
        highestSalary: salaries.length > 0 ? Math.max(...salaries) : 0,
        lowestSalary: salaries.length > 0 ? Math.min(...salaries) : 0,
        departmentWiseSalary,
      };
    }

    return this.request<PayrollSummary>(
      `/hr/payroll/summary?month=${month}&year=${year}`
    );
  }

  /**
   * Get payroll statistics
   */
  static async getStatistics(): Promise<{
    totalPayrolls: number;
    pendingPayrolls: number;
    totalDisbursed: number;
    averageMonthlyPayroll: number;
    payrollsByStatus: Record<string, number>;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const payrollsByStatus: Record<string, number> = {};
      MOCK_PAYROLLS.forEach((p) => {
        payrollsByStatus[p.status] = (payrollsByStatus[p.status] || 0) + 1;
      });

      const paidPayrolls = MOCK_PAYROLLS.filter(
        (p) => p.status === PayrollStatus.PAID
      );
      const totalDisbursed = paidPayrolls.reduce(
        (sum, p) => sum + p.totalNetSalary,
        0
      );

      return {
        totalPayrolls: MOCK_PAYROLLS.length,
        pendingPayrolls: MOCK_PAYROLLS.filter(
          (p) => p.status === PayrollStatus.PENDING_APPROVAL
        ).length,
        totalDisbursed,
        averageMonthlyPayroll: paidPayrolls.length > 0
          ? Math.round(totalDisbursed / paidPayrolls.length)
          : 0,
        payrollsByStatus,
      };
    }

    return this.request<{
      totalPayrolls: number;
      pendingPayrolls: number;
      totalDisbursed: number;
      averageMonthlyPayroll: number;
      payrollsByStatus: Record<string, number>;
    }>('/hr/payroll/statistics');
  }

  /**
   * Get salary component definitions (backs hr/payroll/components).
   * Called with no query params; scoped by x-company-id header.
   */
  static async getSalaryComponents(): Promise<any[]> {
    return this.request<any[]>('/hr/salary-components', {
      headers: { 'x-company-id': 'test' },
    });
  }

  /**
   * Get salary templates (backs hr/payroll/templates).
   */
  static async getSalaryTemplates(): Promise<any[]> {
    return this.request<any[]>('/hr/salary-templates', {
      headers: { 'x-company-id': 'test' },
    });
  }

  /**
   * Get payroll calendar events (backs hr/payroll/calendar).
   */
  static async getPayrollCalendar(): Promise<any[]> {
    return this.request<any[]>('/hr/payroll-calendar', {
      headers: { 'x-company-id': 'test' },
    });
  }

  /**
   * Create new payroll for a month
   */
  static async createPayroll(month: number, year: number): Promise<Payroll> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if payroll already exists
      const exists = MOCK_PAYROLLS.some(
        (p) => p.month === month && p.year === year
      );
      if (exists) {
        throw new Error('Payroll already exists for this period');
      }

      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const newPayroll: Payroll = {
        id: `pr-${Date.now()}`,
        payrollPeriod: `${monthNames[month - 1]} ${year}`,
        month,
        year,
        totalEmployees: 10,
        totalGrossSalary: 1171000,
        totalDeductions: 175650,
        totalNetSalary: 995350,
        totalTaxDeductions: 87500,
        totalPfContributions: 70260,
        totalOtherDeductions: 17890,
        status: PayrollStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      MOCK_PAYROLLS.push(newPayroll);
      return newPayroll;
    }

    return this.request<Payroll>('/hr/payroll', {
      method: 'POST',
      body: JSON.stringify({ month, year }),
    });
  }
}

// Export singleton instance
export const payrollService = PayrollService;
