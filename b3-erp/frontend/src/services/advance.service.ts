/**
 * Salary Advance Service
 * Handles all salary advance-related API operations for the HR Payroll module
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Interfaces
// ============================================================================

export interface SalaryAdvance {
  id: string;
  advanceNumber: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  department?: string;
  requestDate: Date;
  requestedAmount: number;
  approvedAmount?: number;
  purpose?: string;
  repaymentMonths: number;
  monthlyDeduction?: number;
  disbursementDate?: Date;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Disbursed' | 'Repaying' | 'Closed';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  paidAmount: number;
  balanceAmount?: number;
  remarks?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  recoveries?: AdvanceRecovery[];
}

export interface AdvanceRecovery {
  id: string;
  advanceId: string;
  installmentNumber: number;
  dueDate: Date;
  amount: number;
  paidAmount: number;
  balanceAfter: number;
  status: 'Pending' | 'Deducted' | 'Paid' | 'Waived';
  deductionDate?: Date;
  payslipId?: string;
  remarks?: string;
  companyId: string;
}

export interface AdvanceSummary {
  totalAdvances: number;
  activeAdvances: number;
  totalDisbursed: number;
  totalOutstanding: number;
  totalRecovered: number;
  byStatus: Record<string, { count: number; totalAmount: number }>;
}

export interface CreateSalaryAdvanceDto {
  employeeId: string;
  requestedAmount: number;
  purpose?: string;
  repaymentMonths?: number;
  remarks?: string;
  companyId: string;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_SALARY_ADVANCES: SalaryAdvance[] = [
  {
    id: 'adv-001',
    advanceNumber: 'ADV-2025-00001',
    employeeId: 'emp-002',
    employeeName: 'Priya Sharma',
    employeeCode: 'EMP002',
    department: 'Human Resources',
    requestDate: new Date('2025-01-05'),
    requestedAmount: 30000,
    approvedAmount: 30000,
    purpose: 'Home renovation',
    repaymentMonths: 3,
    monthlyDeduction: 10000,
    disbursementDate: new Date('2025-01-08'),
    status: 'Repaying',
    approvedBy: 'Finance Manager',
    approvedAt: new Date('2025-01-06'),
    paidAmount: 10000,
    balanceAmount: 20000,
    companyId: 'company-001',
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-02-01'),
  },
  {
    id: 'adv-002',
    advanceNumber: 'ADV-2025-00002',
    employeeId: 'emp-004',
    employeeName: 'Sneha Reddy',
    employeeCode: 'EMP004',
    department: 'Finance',
    requestDate: new Date('2025-01-20'),
    requestedAmount: 20000,
    approvedAmount: 20000,
    purpose: 'Medical emergency',
    repaymentMonths: 2,
    monthlyDeduction: 10000,
    disbursementDate: new Date('2025-01-21'),
    status: 'Repaying',
    approvedBy: 'HR Manager',
    approvedAt: new Date('2025-01-20'),
    paidAmount: 10000,
    balanceAmount: 10000,
    companyId: 'company-001',
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-02-01'),
  },
  {
    id: 'adv-003',
    advanceNumber: 'ADV-2025-00003',
    employeeId: 'emp-007',
    employeeName: 'Anita Desai',
    employeeCode: 'EMP007',
    department: 'Sales',
    requestDate: new Date('2025-02-08'),
    requestedAmount: 15000,
    purpose: 'Festival expenses',
    repaymentMonths: 1,
    paidAmount: 0,
    status: 'Pending',
    companyId: 'company-001',
    createdAt: new Date('2025-02-08'),
    updatedAt: new Date('2025-02-08'),
  },
  {
    id: 'adv-004',
    advanceNumber: 'ADV-2024-00010',
    employeeId: 'emp-008',
    employeeName: 'Deepak Verma',
    employeeCode: 'EMP008',
    department: 'IT',
    requestDate: new Date('2024-11-15'),
    requestedAmount: 25000,
    approvedAmount: 25000,
    purpose: 'Laptop purchase',
    repaymentMonths: 2,
    monthlyDeduction: 12500,
    disbursementDate: new Date('2024-11-16'),
    status: 'Closed',
    approvedBy: 'Finance Manager',
    approvedAt: new Date('2024-11-15'),
    paidAmount: 25000,
    balanceAmount: 0,
    companyId: 'company-001',
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2025-01-01'),
  },
];

// ============================================================================
// Advance Service Class
// ============================================================================

export class AdvanceService {
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
  // Salary Advances
  // ============================================================================

  static async getAdvances(companyId: string, filters?: {
    employeeId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: SalaryAdvance[]; total: number }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filtered = [...MOCK_SALARY_ADVANCES];

      if (filters?.employeeId) {
        filtered = filtered.filter((a) => a.employeeId === filters.employeeId);
      }
      if (filters?.status) {
        filtered = filtered.filter((a) => a.status === filters.status);
      }
      if (filters?.fromDate) {
        const from = new Date(filters.fromDate);
        filtered = filtered.filter((a) => new Date(a.requestDate) >= from);
      }
      if (filters?.toDate) {
        const to = new Date(filters.toDate);
        filtered = filtered.filter((a) => new Date(a.requestDate) <= to);
      }

      // Sort by date descending
      filtered.sort((a, b) =>
        new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
      );

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const start = (page - 1) * limit;
      const paginatedData = filtered.slice(start, start + limit);

      return { data: paginatedData, total: filtered.length };
    }

    const params = new URLSearchParams({ companyId });
    if (filters?.employeeId) params.set('employeeId', filters.employeeId);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.fromDate) params.set('fromDate', filters.fromDate);
    if (filters?.toDate) params.set('toDate', filters.toDate);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));

    return this.request<{ data: SalaryAdvance[]; total: number }>(
      `/hr/advances?${params.toString()}`
    );
  }

  static async getAdvanceById(id: string): Promise<SalaryAdvance> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const advance = MOCK_SALARY_ADVANCES.find((a) => a.id === id);
      if (!advance) throw new Error('Salary advance not found');
      return advance;
    }
    return this.request<SalaryAdvance>(`/hr/advances/${id}`);
  }

  static async createAdvance(dto: CreateSalaryAdvanceDto): Promise<SalaryAdvance> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const count = MOCK_SALARY_ADVANCES.length;
      const repaymentMonths = dto.repaymentMonths || 1;
      const monthlyDeduction = Math.round((dto.requestedAmount / repaymentMonths) * 100) / 100;

      const newAdvance: SalaryAdvance = {
        id: `adv-${Date.now()}`,
        advanceNumber: `ADV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`,
        ...dto,
        requestDate: new Date(),
        repaymentMonths,
        monthlyDeduction,
        balanceAmount: dto.requestedAmount,
        paidAmount: 0,
        status: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_SALARY_ADVANCES.push(newAdvance);
      return newAdvance;
    }
    return this.request<SalaryAdvance>('/hr/advances', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  static async approveAdvance(id: string, approvedBy: string, approvedAmount?: number): Promise<SalaryAdvance> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_SALARY_ADVANCES.findIndex((a) => a.id === id);
      if (index === -1) throw new Error('Salary advance not found');

      const advance = MOCK_SALARY_ADVANCES[index];
      const amount = approvedAmount ?? advance.requestedAmount;
      const monthlyDeduction = Math.round((amount / advance.repaymentMonths) * 100) / 100;

      MOCK_SALARY_ADVANCES[index] = {
        ...advance,
        status: 'Approved',
        approvedBy,
        approvedAt: new Date(),
        approvedAmount: amount,
        monthlyDeduction,
        balanceAmount: amount,
        updatedAt: new Date(),
      };
      return MOCK_SALARY_ADVANCES[index];
    }
    return this.request<SalaryAdvance>(`/hr/advances/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approvedBy, approvedAmount }),
    });
  }

  static async rejectAdvance(id: string, rejectionReason: string): Promise<SalaryAdvance> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_SALARY_ADVANCES.findIndex((a) => a.id === id);
      if (index === -1) throw new Error('Salary advance not found');
      MOCK_SALARY_ADVANCES[index] = {
        ...MOCK_SALARY_ADVANCES[index],
        status: 'Rejected',
        rejectionReason,
        updatedAt: new Date(),
      };
      return MOCK_SALARY_ADVANCES[index];
    }
    return this.request<SalaryAdvance>(`/hr/advances/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    });
  }

  static async disburseAdvance(id: string): Promise<SalaryAdvance> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_SALARY_ADVANCES.findIndex((a) => a.id === id);
      if (index === -1) throw new Error('Salary advance not found');
      MOCK_SALARY_ADVANCES[index] = {
        ...MOCK_SALARY_ADVANCES[index],
        status: 'Disbursed',
        disbursementDate: new Date(),
        updatedAt: new Date(),
      };
      return MOCK_SALARY_ADVANCES[index];
    }
    return this.request<SalaryAdvance>(`/hr/advances/${id}/disburse`, {
      method: 'POST',
    });
  }

  // ============================================================================
  // Advance Reports
  // ============================================================================

  static async getAdvanceSummary(companyId: string): Promise<AdvanceSummary> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const advances = MOCK_SALARY_ADVANCES;

      const byStatus: Record<string, { count: number; totalAmount: number }> = {};
      advances.forEach((adv) => {
        if (!byStatus[adv.status]) {
          byStatus[adv.status] = { count: 0, totalAmount: 0 };
        }
        byStatus[adv.status].count++;
        byStatus[adv.status].totalAmount += adv.approvedAmount || adv.requestedAmount;
      });

      const activeAdvances = advances.filter((a) =>
        ['Disbursed', 'Repaying'].includes(a.status)
      );

      return {
        totalAdvances: advances.length,
        activeAdvances: activeAdvances.length,
        totalDisbursed: activeAdvances.reduce((sum, a) => sum + (a.approvedAmount || 0), 0),
        totalOutstanding: activeAdvances.reduce((sum, a) => sum + (a.balanceAmount || 0), 0),
        totalRecovered: activeAdvances.reduce((sum, a) => sum + (a.paidAmount || 0), 0),
        byStatus,
      };
    }

    return this.request<AdvanceSummary>(`/hr/advances/summary/all?companyId=${companyId}`);
  }

  static async getPendingRecoveries(companyId: string, month: number, year: number): Promise<AdvanceRecovery[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      // Return mock pending recoveries
      return [];
    }
    return this.request<AdvanceRecovery[]>(
      `/hr/advances/pending-recoveries?companyId=${companyId}&month=${month}&year=${year}`
    );
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  static async getStatistics(companyId: string): Promise<{
    totalRequests: number;
    pendingRequests: number;
    activeAdvances: number;
    totalDisbursed: number;
    totalRecovered: number;
    averageAdvanceAmount: number;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const advances = MOCK_SALARY_ADVANCES;
      const activeAdvances = advances.filter((a) =>
        ['Disbursed', 'Repaying'].includes(a.status)
      );

      const totalDisbursed = activeAdvances.reduce(
        (sum, a) => sum + (a.approvedAmount || 0),
        0
      );

      return {
        totalRequests: advances.length,
        pendingRequests: advances.filter((a) => a.status === 'Pending').length,
        activeAdvances: activeAdvances.length,
        totalDisbursed,
        totalRecovered: activeAdvances.reduce((sum, a) => sum + (a.paidAmount || 0), 0),
        averageAdvanceAmount:
          activeAdvances.length > 0
            ? Math.round(totalDisbursed / activeAdvances.length)
            : 0,
      };
    }

    return this.request<{
      totalRequests: number;
      pendingRequests: number;
      activeAdvances: number;
      totalDisbursed: number;
      totalRecovered: number;
      averageAdvanceAmount: number;
    }>(`/hr/advances/statistics?companyId=${companyId}`);
  }
}

export const advanceService = AdvanceService;
