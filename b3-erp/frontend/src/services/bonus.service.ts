/**
 * Bonus Service
 * Handles all bonus-related API operations for the HR Payroll module
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Interfaces
// ============================================================================

export interface BonusType {
  id: string;
  code: string;
  name: string;
  description?: string;
  calculationType: 'Fixed' | 'PercentageOfBasic' | 'PercentageOfGross' | 'PercentageOfCTC' | 'Custom';
  defaultPercent?: number;
  defaultAmount?: number;
  frequency: 'Annual' | 'Quarterly' | 'Monthly' | 'OneTime';
  taxable: boolean;
  isStatutory: boolean;
  minDaysWorked?: number;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BonusCalculation {
  id: string;
  bonusTypeId: string;
  bonusType?: BonusType;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  department?: string;
  financialYear: string;
  period?: string;
  eligibleDays: number;
  bonusableAmount: number;
  calculatedAmount: number;
  adjustments: number;
  finalAmount: number;
  taxDeducted: number;
  netAmount: number;
  status: 'Draft' | 'Approved' | 'Paid' | 'Cancelled';
  approvedBy?: string;
  approvedAt?: Date;
  paidOn?: Date;
  payslipId?: string;
  remarks?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BonusSummary {
  financialYear: string;
  totalEmployees: number;
  totalCalculations: number;
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  byType: Record<string, { count: number; totalAmount: number; paidAmount: number }>;
}

export interface CreateBonusTypeDto {
  code: string;
  name: string;
  description?: string;
  calculationType: string;
  defaultPercent?: number;
  defaultAmount?: number;
  frequency: string;
  taxable?: boolean;
  isStatutory?: boolean;
  minDaysWorked?: number;
  companyId: string;
}

export interface CreateBonusCalculationDto {
  bonusTypeId: string;
  employeeId: string;
  financialYear: string;
  period?: string;
  eligibleDays: number;
  bonusableAmount: number;
  calculatedAmount?: number;
  adjustments?: number;
  taxDeducted?: number;
  remarks?: string;
  companyId: string;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_BONUS_TYPES: BonusType[] = [
  {
    id: 'bt-001',
    code: 'ANNUAL',
    name: 'Annual Bonus',
    description: 'Annual performance-based bonus paid at year end',
    calculationType: 'PercentageOfBasic',
    defaultPercent: 8.33,
    frequency: 'Annual',
    taxable: true,
    isStatutory: true,
    minDaysWorked: 30,
    isActive: true,
    companyId: 'company-001',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'bt-002',
    code: 'PERF',
    name: 'Performance Bonus',
    description: 'Quarterly performance bonus based on individual KPIs',
    calculationType: 'PercentageOfGross',
    defaultPercent: 10,
    frequency: 'Quarterly',
    taxable: true,
    isStatutory: false,
    isActive: true,
    companyId: 'company-001',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'bt-003',
    code: 'FESTIVAL',
    name: 'Festival Bonus',
    description: 'Festival allowance/bonus',
    calculationType: 'Fixed',
    defaultAmount: 5000,
    frequency: 'Annual',
    taxable: true,
    isStatutory: false,
    isActive: true,
    companyId: 'company-001',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

const MOCK_BONUS_CALCULATIONS: BonusCalculation[] = [
  {
    id: 'bc-001',
    bonusTypeId: 'bt-001',
    bonusType: MOCK_BONUS_TYPES[0],
    employeeId: 'emp-001',
    employeeName: 'Rajesh Kumar',
    employeeCode: 'EMP001',
    department: 'Production',
    financialYear: '2024-25',
    eligibleDays: 365,
    bonusableAmount: 720000,
    calculatedAmount: 60000,
    adjustments: 0,
    finalAmount: 60000,
    taxDeducted: 18000,
    netAmount: 42000,
    status: 'Paid',
    approvedBy: 'HR Manager',
    approvedAt: new Date('2025-01-15'),
    paidOn: new Date('2025-01-31'),
    companyId: 'company-001',
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-31'),
  },
  {
    id: 'bc-002',
    bonusTypeId: 'bt-002',
    bonusType: MOCK_BONUS_TYPES[1],
    employeeId: 'emp-002',
    employeeName: 'Priya Sharma',
    employeeCode: 'EMP002',
    department: 'Human Resources',
    financialYear: '2024-25',
    period: 'Q4',
    eligibleDays: 90,
    bonusableAmount: 120000,
    calculatedAmount: 12000,
    adjustments: 2000,
    finalAmount: 14000,
    taxDeducted: 4200,
    netAmount: 9800,
    status: 'Approved',
    approvedBy: 'Finance Manager',
    approvedAt: new Date('2025-02-05'),
    companyId: 'company-001',
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-02-05'),
  },
  {
    id: 'bc-003',
    bonusTypeId: 'bt-003',
    bonusType: MOCK_BONUS_TYPES[2],
    employeeId: 'emp-003',
    employeeName: 'Amit Patel',
    employeeCode: 'EMP003',
    department: 'Quality Control',
    financialYear: '2024-25',
    eligibleDays: 250,
    bonusableAmount: 0,
    calculatedAmount: 5000,
    adjustments: 0,
    finalAmount: 5000,
    taxDeducted: 1500,
    netAmount: 3500,
    status: 'Draft',
    companyId: 'company-001',
    createdAt: new Date('2025-02-08'),
    updatedAt: new Date('2025-02-08'),
  },
];

// ============================================================================
// Bonus Service Class
// ============================================================================

export class BonusService {
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
  // Bonus Types
  // ============================================================================

  static async getBonusTypes(companyId: string, filters?: {
    isActive?: boolean;
    frequency?: string;
    search?: string;
  }): Promise<BonusType[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filtered = [...MOCK_BONUS_TYPES];

      if (filters?.isActive !== undefined) {
        filtered = filtered.filter((t) => t.isActive === filters.isActive);
      }
      if (filters?.frequency) {
        filtered = filtered.filter((t) => t.frequency === filters.frequency);
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
    if (filters?.frequency) params.set('frequency', filters.frequency);
    if (filters?.search) params.set('search', filters.search);

    return this.request<BonusType[]>(`/hr/bonus/types?${params.toString()}`);
  }

  static async getBonusTypeById(id: string): Promise<BonusType> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const bonusType = MOCK_BONUS_TYPES.find((t) => t.id === id);
      if (!bonusType) throw new Error('Bonus type not found');
      return bonusType;
    }
    return this.request<BonusType>(`/hr/bonus/types/${id}`);
  }

  static async createBonusType(dto: CreateBonusTypeDto): Promise<BonusType> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newType: BonusType = {
        id: `bt-${Date.now()}`,
        ...dto,
        taxable: dto.taxable ?? true,
        isStatutory: dto.isStatutory ?? false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as BonusType;
      MOCK_BONUS_TYPES.push(newType);
      return newType;
    }
    return this.request<BonusType>('/hr/bonus/types', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  static async updateBonusType(id: string, dto: Partial<CreateBonusTypeDto>): Promise<BonusType> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_BONUS_TYPES.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Bonus type not found');
      MOCK_BONUS_TYPES[index] = {
        ...MOCK_BONUS_TYPES[index],
        ...dto,
        updatedAt: new Date(),
      } as BonusType;
      return MOCK_BONUS_TYPES[index];
    }
    return this.request<BonusType>(`/hr/bonus/types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  }

  static async deleteBonusType(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_BONUS_TYPES.findIndex((t) => t.id === id);
      if (index !== -1) {
        MOCK_BONUS_TYPES.splice(index, 1);
      }
      return;
    }
    await this.request<void>(`/hr/bonus/types/${id}`, { method: 'DELETE' });
  }

  // ============================================================================
  // Bonus Calculations
  // ============================================================================

  static async getBonusCalculations(companyId: string, filters?: {
    employeeId?: string;
    bonusTypeId?: string;
    financialYear?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: BonusCalculation[]; total: number }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filtered = [...MOCK_BONUS_CALCULATIONS];

      if (filters?.employeeId) {
        filtered = filtered.filter((c) => c.employeeId === filters.employeeId);
      }
      if (filters?.bonusTypeId) {
        filtered = filtered.filter((c) => c.bonusTypeId === filters.bonusTypeId);
      }
      if (filters?.financialYear) {
        filtered = filtered.filter((c) => c.financialYear === filters.financialYear);
      }
      if (filters?.status) {
        filtered = filtered.filter((c) => c.status === filters.status);
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const start = (page - 1) * limit;
      const paginatedData = filtered.slice(start, start + limit);

      return { data: paginatedData, total: filtered.length };
    }

    const params = new URLSearchParams({ companyId });
    if (filters?.employeeId) params.set('employeeId', filters.employeeId);
    if (filters?.bonusTypeId) params.set('bonusTypeId', filters.bonusTypeId);
    if (filters?.financialYear) params.set('financialYear', filters.financialYear);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));

    return this.request<{ data: BonusCalculation[]; total: number }>(
      `/hr/bonus/calculations?${params.toString()}`
    );
  }

  static async createBonusCalculation(dto: CreateBonusCalculationDto): Promise<BonusCalculation> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const bonusType = MOCK_BONUS_TYPES.find((t) => t.id === dto.bonusTypeId);
      const newCalc: BonusCalculation = {
        id: `bc-${Date.now()}`,
        ...dto,
        bonusType,
        calculatedAmount: dto.calculatedAmount || 0,
        adjustments: dto.adjustments || 0,
        finalAmount: (dto.calculatedAmount || 0) + (dto.adjustments || 0),
        taxDeducted: dto.taxDeducted || 0,
        netAmount: (dto.calculatedAmount || 0) + (dto.adjustments || 0) - (dto.taxDeducted || 0),
        status: 'Draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_BONUS_CALCULATIONS.push(newCalc);
      return newCalc;
    }
    return this.request<BonusCalculation>('/hr/bonus/calculations', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  static async approveBonusCalculation(id: string, approvedBy: string): Promise<BonusCalculation> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_BONUS_CALCULATIONS.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Bonus calculation not found');
      MOCK_BONUS_CALCULATIONS[index] = {
        ...MOCK_BONUS_CALCULATIONS[index],
        status: 'Approved',
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date(),
      };
      return MOCK_BONUS_CALCULATIONS[index];
    }
    return this.request<BonusCalculation>(`/hr/bonus/calculations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approvedBy }),
    });
  }

  static async markBonusPaid(id: string): Promise<BonusCalculation> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_BONUS_CALCULATIONS.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Bonus calculation not found');
      MOCK_BONUS_CALCULATIONS[index] = {
        ...MOCK_BONUS_CALCULATIONS[index],
        status: 'Paid',
        paidOn: new Date(),
        updatedAt: new Date(),
      };
      return MOCK_BONUS_CALCULATIONS[index];
    }
    return this.request<BonusCalculation>(`/hr/bonus/calculations/${id}/mark-paid`, {
      method: 'POST',
    });
  }

  // ============================================================================
  // Bonus Reports
  // ============================================================================

  static async getBonusSummary(companyId: string, financialYear: string): Promise<BonusSummary> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const calculations = MOCK_BONUS_CALCULATIONS.filter(
        (c) => c.financialYear === financialYear
      );

      const byType: Record<string, { count: number; totalAmount: number; paidAmount: number }> = {};
      calculations.forEach((calc) => {
        const typeName = calc.bonusType?.name || 'Unknown';
        if (!byType[typeName]) {
          byType[typeName] = { count: 0, totalAmount: 0, paidAmount: 0 };
        }
        byType[typeName].count++;
        byType[typeName].totalAmount += calc.finalAmount;
        if (calc.status === 'Paid') {
          byType[typeName].paidAmount += calc.netAmount;
        }
      });

      return {
        financialYear,
        totalEmployees: new Set(calculations.map((c) => c.employeeId)).size,
        totalCalculations: calculations.length,
        totalAmount: calculations.reduce((sum, c) => sum + c.finalAmount, 0),
        totalPaid: calculations
          .filter((c) => c.status === 'Paid')
          .reduce((sum, c) => sum + c.netAmount, 0),
        totalPending: calculations
          .filter((c) => c.status !== 'Paid')
          .reduce((sum, c) => sum + c.netAmount, 0),
        byType,
      };
    }

    return this.request<BonusSummary>(
      `/hr/bonus/summary?companyId=${companyId}&financialYear=${financialYear}`
    );
  }
}

export const bonusService = BonusService;
