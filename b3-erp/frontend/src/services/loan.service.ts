/**
 * Loan Service
 * Handles all employee loan-related API operations for the HR Payroll module
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = true;

// ============================================================================
// Interfaces
// ============================================================================

export interface LoanType {
  id: string;
  code: string;
  name: string;
  description?: string;
  maxAmount?: number;
  maxTenureMonths?: number;
  interestType: 'None' | 'Simple' | 'Compound';
  defaultInterestRate: number;
  processingFeePercent: number;
  minServiceMonths: number;
  maxLoanMultiplier?: number;
  requiresGuarantor: boolean;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeLoan {
  id: string;
  loanNumber: string;
  loanTypeId: string;
  loanType?: LoanType;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  department?: string;
  requestDate: Date;
  requestedAmount: number;
  approvedAmount?: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount?: number;
  processingFee: number;
  totalRepayable?: number;
  disbursementDate?: Date;
  repaymentStartDate?: Date;
  repaymentEndDate?: Date;
  outstandingBalance?: number;
  paidEMIs: number;
  remainingEMIs?: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Disbursed' | 'Active' | 'Closed' | 'Defaulted';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  guarantorId?: string;
  remarks?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  repayments?: LoanRepayment[];
}

export interface LoanRepayment {
  id: string;
  loanId: string;
  emiNumber: number;
  dueDate: Date;
  principalAmount: number;
  interestAmount: number;
  emiAmount: number;
  paidAmount: number;
  balanceAfterEMI: number;
  status: 'Pending' | 'Deducted' | 'Paid' | 'Skipped' | 'Waived';
  deductionDate?: Date;
  payslipId?: string;
  paymentMode?: string;
  remarks?: string;
  companyId: string;
}

export interface LoanSummary {
  totalLoans: number;
  activeLoans: number;
  totalDisbursed: number;
  totalOutstanding: number;
  totalRecovered: number;
  byStatus: Record<string, { count: number; totalAmount: number }>;
  byType: Record<string, { count: number; totalAmount: number; outstanding: number }>;
}

export interface CreateLoanTypeDto {
  code: string;
  name: string;
  description?: string;
  maxAmount?: number;
  maxTenureMonths?: number;
  interestType: string;
  defaultInterestRate?: number;
  processingFeePercent?: number;
  minServiceMonths?: number;
  maxLoanMultiplier?: number;
  requiresGuarantor?: boolean;
  companyId: string;
}

export interface CreateEmployeeLoanDto {
  loanTypeId: string;
  employeeId: string;
  requestedAmount: number;
  interestRate?: number;
  tenureMonths: number;
  guarantorId?: string;
  remarks?: string;
  companyId: string;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_LOAN_TYPES: LoanType[] = [
  {
    id: 'lt-001',
    code: 'PERSONAL',
    name: 'Personal Loan',
    description: 'Personal loan for employees for any purpose',
    maxAmount: 500000,
    maxTenureMonths: 36,
    interestType: 'Simple',
    defaultInterestRate: 8,
    processingFeePercent: 1,
    minServiceMonths: 12,
    maxLoanMultiplier: 3,
    requiresGuarantor: false,
    isActive: true,
    companyId: 'company-001',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'lt-002',
    code: 'EMERGENCY',
    name: 'Emergency Loan',
    description: 'Interest-free emergency loan for medical/urgent needs',
    maxAmount: 100000,
    maxTenureMonths: 12,
    interestType: 'None',
    defaultInterestRate: 0,
    processingFeePercent: 0,
    minServiceMonths: 6,
    requiresGuarantor: false,
    isActive: true,
    companyId: 'company-001',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'lt-003',
    code: 'VEHICLE',
    name: 'Vehicle Loan',
    description: 'Loan for purchasing two-wheeler or car',
    maxAmount: 800000,
    maxTenureMonths: 60,
    interestType: 'Simple',
    defaultInterestRate: 7.5,
    processingFeePercent: 1,
    minServiceMonths: 24,
    requiresGuarantor: true,
    isActive: true,
    companyId: 'company-001',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

const MOCK_EMPLOYEE_LOANS: EmployeeLoan[] = [
  {
    id: 'ln-001',
    loanNumber: 'LN-2025-00001',
    loanTypeId: 'lt-001',
    loanType: MOCK_LOAN_TYPES[0],
    employeeId: 'emp-001',
    employeeName: 'Rajesh Kumar',
    employeeCode: 'EMP001',
    department: 'Production',
    requestDate: new Date('2024-10-15'),
    requestedAmount: 300000,
    approvedAmount: 300000,
    interestRate: 8,
    tenureMonths: 24,
    emiAmount: 13600,
    processingFee: 3000,
    totalRepayable: 348000,
    disbursementDate: new Date('2024-10-20'),
    repaymentStartDate: new Date('2024-11-01'),
    repaymentEndDate: new Date('2026-10-01'),
    outstandingBalance: 272000,
    paidEMIs: 4,
    remainingEMIs: 20,
    status: 'Active',
    approvedBy: 'Finance Manager',
    approvedAt: new Date('2024-10-18'),
    companyId: 'company-001',
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2025-02-01'),
  },
  {
    id: 'ln-002',
    loanNumber: 'LN-2025-00002',
    loanTypeId: 'lt-002',
    loanType: MOCK_LOAN_TYPES[1],
    employeeId: 'emp-003',
    employeeName: 'Amit Patel',
    employeeCode: 'EMP003',
    department: 'Quality Control',
    requestDate: new Date('2025-01-10'),
    requestedAmount: 50000,
    approvedAmount: 50000,
    interestRate: 0,
    tenureMonths: 10,
    emiAmount: 5000,
    processingFee: 0,
    totalRepayable: 50000,
    disbursementDate: new Date('2025-01-12'),
    repaymentStartDate: new Date('2025-02-01'),
    repaymentEndDate: new Date('2025-11-01'),
    outstandingBalance: 45000,
    paidEMIs: 1,
    remainingEMIs: 9,
    status: 'Active',
    approvedBy: 'HR Manager',
    approvedAt: new Date('2025-01-11'),
    remarks: 'Medical emergency',
    companyId: 'company-001',
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-02-01'),
  },
  {
    id: 'ln-003',
    loanNumber: 'LN-2025-00003',
    loanTypeId: 'lt-001',
    loanType: MOCK_LOAN_TYPES[0],
    employeeId: 'emp-005',
    employeeName: 'Mohammed Khan',
    employeeCode: 'EMP005',
    department: 'Production',
    requestDate: new Date('2025-02-05'),
    requestedAmount: 200000,
    interestRate: 8,
    tenureMonths: 18,
    processingFee: 2000,
    paidEMIs: 0,
    status: 'Pending',
    companyId: 'company-001',
    createdAt: new Date('2025-02-05'),
    updatedAt: new Date('2025-02-05'),
  },
];

// ============================================================================
// Loan Service Class
// ============================================================================

export class LoanService {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
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

  // ============================================================================
  // Loan Types
  // ============================================================================

  static async getLoanTypes(companyId: string, filters?: {
    isActive?: boolean;
    search?: string;
  }): Promise<LoanType[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filtered = [...MOCK_LOAN_TYPES];

      if (filters?.isActive !== undefined) {
        filtered = filtered.filter((t) => t.isActive === filters.isActive);
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.code.toLowerCase().includes(search) ||
            t.name.toLowerCase().includes(search)
        );
      }

      return filtered;
    }

    const params = new URLSearchParams({ companyId });
    if (filters?.isActive !== undefined) params.set('isActive', String(filters.isActive));
    if (filters?.search) params.set('search', filters.search);

    return this.request<LoanType[]>(`/hr/loans/types?${params.toString()}`);
  }

  static async createLoanType(dto: CreateLoanTypeDto): Promise<LoanType> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newType: LoanType = {
        id: `lt-${Date.now()}`,
        ...dto,
        defaultInterestRate: dto.defaultInterestRate || 0,
        processingFeePercent: dto.processingFeePercent || 0,
        minServiceMonths: dto.minServiceMonths || 0,
        requiresGuarantor: dto.requiresGuarantor || false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as LoanType;
      MOCK_LOAN_TYPES.push(newType);
      return newType;
    }
    return this.request<LoanType>('/hr/loans/types', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  // ============================================================================
  // Employee Loans
  // ============================================================================

  static async getLoans(companyId: string, filters?: {
    employeeId?: string;
    loanTypeId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: EmployeeLoan[]; total: number }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filtered = [...MOCK_EMPLOYEE_LOANS];

      if (filters?.employeeId) {
        filtered = filtered.filter((l) => l.employeeId === filters.employeeId);
      }
      if (filters?.loanTypeId) {
        filtered = filtered.filter((l) => l.loanTypeId === filters.loanTypeId);
      }
      if (filters?.status) {
        filtered = filtered.filter((l) => l.status === filters.status);
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const start = (page - 1) * limit;
      const paginatedData = filtered.slice(start, start + limit);

      return { data: paginatedData, total: filtered.length };
    }

    const params = new URLSearchParams({ companyId });
    if (filters?.employeeId) params.set('employeeId', filters.employeeId);
    if (filters?.loanTypeId) params.set('loanTypeId', filters.loanTypeId);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));

    return this.request<{ data: EmployeeLoan[]; total: number }>(
      `/hr/loans?${params.toString()}`
    );
  }

  static async getLoanById(id: string): Promise<EmployeeLoan> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const loan = MOCK_EMPLOYEE_LOANS.find((l) => l.id === id);
      if (!loan) throw new Error('Loan not found');
      return loan;
    }
    return this.request<EmployeeLoan>(`/hr/loans/${id}`);
  }

  static async createLoan(dto: CreateEmployeeLoanDto): Promise<EmployeeLoan> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const loanType = MOCK_LOAN_TYPES.find((t) => t.id === dto.loanTypeId);
      const count = MOCK_EMPLOYEE_LOANS.length;

      const newLoan: EmployeeLoan = {
        id: `ln-${Date.now()}`,
        loanNumber: `LN-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`,
        ...dto,
        loanType,
        requestDate: new Date(),
        interestRate: dto.interestRate ?? loanType?.defaultInterestRate ?? 0,
        processingFee: dto.requestedAmount * (loanType?.processingFeePercent || 0) / 100,
        paidEMIs: 0,
        status: 'Pending',
        companyId: dto.companyId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_EMPLOYEE_LOANS.push(newLoan);
      return newLoan;
    }
    return this.request<EmployeeLoan>('/hr/loans', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  static async approveLoan(id: string, approvedBy: string, approvedAmount?: number): Promise<EmployeeLoan> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_EMPLOYEE_LOANS.findIndex((l) => l.id === id);
      if (index === -1) throw new Error('Loan not found');

      const loan = MOCK_EMPLOYEE_LOANS[index];
      const amount = approvedAmount ?? loan.requestedAmount;
      const tenure = loan.tenureMonths;
      const rate = loan.interestRate;
      const interest = (amount * rate * tenure) / (12 * 100);
      const total = amount + interest;
      const emi = Math.round((total / tenure) * 100) / 100;

      MOCK_EMPLOYEE_LOANS[index] = {
        ...loan,
        status: 'Approved',
        approvedBy,
        approvedAt: new Date(),
        approvedAmount: amount,
        totalRepayable: total,
        emiAmount: emi,
        outstandingBalance: total,
        remainingEMIs: tenure,
        updatedAt: new Date(),
      };
      return MOCK_EMPLOYEE_LOANS[index];
    }
    return this.request<EmployeeLoan>(`/hr/loans/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approvedBy, approvedAmount }),
    });
  }

  static async rejectLoan(id: string, rejectionReason: string): Promise<EmployeeLoan> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_EMPLOYEE_LOANS.findIndex((l) => l.id === id);
      if (index === -1) throw new Error('Loan not found');
      MOCK_EMPLOYEE_LOANS[index] = {
        ...MOCK_EMPLOYEE_LOANS[index],
        status: 'Rejected',
        rejectionReason,
        updatedAt: new Date(),
      };
      return MOCK_EMPLOYEE_LOANS[index];
    }
    return this.request<EmployeeLoan>(`/hr/loans/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    });
  }

  static async disburseLoan(id: string): Promise<EmployeeLoan> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_EMPLOYEE_LOANS.findIndex((l) => l.id === id);
      if (index === -1) throw new Error('Loan not found');

      const disbursementDate = new Date();
      const repaymentStartDate = new Date(disbursementDate);
      repaymentStartDate.setMonth(repaymentStartDate.getMonth() + 1);

      MOCK_EMPLOYEE_LOANS[index] = {
        ...MOCK_EMPLOYEE_LOANS[index],
        status: 'Disbursed',
        disbursementDate,
        repaymentStartDate,
        updatedAt: new Date(),
      };
      return MOCK_EMPLOYEE_LOANS[index];
    }
    return this.request<EmployeeLoan>(`/hr/loans/${id}/disburse`, {
      method: 'POST',
    });
  }

  // ============================================================================
  // Loan Reports
  // ============================================================================

  static async getLoanSummary(companyId: string): Promise<LoanSummary> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const loans = MOCK_EMPLOYEE_LOANS;

      const byStatus: Record<string, { count: number; totalAmount: number }> = {};
      loans.forEach((loan) => {
        if (!byStatus[loan.status]) {
          byStatus[loan.status] = { count: 0, totalAmount: 0 };
        }
        byStatus[loan.status].count++;
        byStatus[loan.status].totalAmount += loan.approvedAmount || loan.requestedAmount;
      });

      const byType: Record<string, { count: number; totalAmount: number; outstanding: number }> = {};
      loans.forEach((loan) => {
        const typeName = loan.loanType?.name || 'Unknown';
        if (!byType[typeName]) {
          byType[typeName] = { count: 0, totalAmount: 0, outstanding: 0 };
        }
        byType[typeName].count++;
        byType[typeName].totalAmount += loan.approvedAmount || loan.requestedAmount;
        byType[typeName].outstanding += loan.outstandingBalance || 0;
      });

      const activeLoans = loans.filter((l) =>
        ['Disbursed', 'Active'].includes(l.status)
      );

      return {
        totalLoans: loans.length,
        activeLoans: activeLoans.length,
        totalDisbursed: activeLoans.reduce((sum, l) => sum + (l.approvedAmount || 0), 0),
        totalOutstanding: activeLoans.reduce((sum, l) => sum + (l.outstandingBalance || 0), 0),
        totalRecovered: activeLoans.reduce(
          (sum, l) => sum + ((l.totalRepayable || 0) - (l.outstandingBalance || 0)),
          0
        ),
        byStatus,
        byType,
      };
    }

    return this.request<LoanSummary>(`/hr/loans/summary/all?companyId=${companyId}`);
  }

  static async getPendingEMIs(companyId: string, month: number, year: number): Promise<LoanRepayment[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      // Return mock pending EMIs
      return [];
    }
    return this.request<LoanRepayment[]>(
      `/hr/loans/pending-emis?companyId=${companyId}&month=${month}&year=${year}`
    );
  }
}

export const loanService = LoanService;
