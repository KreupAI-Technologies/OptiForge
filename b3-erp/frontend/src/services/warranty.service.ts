/**
 * Warranty Service
 * Handles all warranty-related API operations for the After-Sales module
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = true;

// ============================================================================
// Interfaces
// ============================================================================

export type WarrantyType = 'Standard' | 'Extended' | 'Manufacturer' | 'Dealer';
export type WarrantyStatus = 'active' | 'expired' | 'void' | 'extended' | 'transferred';
export type WarrantyCoverage = 'Parts Only' | 'Labor Only' | 'Parts & Labor' | 'Comprehensive';

export interface Warranty {
  id: string;
  warrantyNumber: string;
  warrantyType: WarrantyType;
  customerId: string;
  customerName: string;
  equipmentId: string;
  equipmentModel: string;
  status: WarrantyStatus;
  startDate: string;
  endDate: string;
  durationMonths: number;
  coverage: WarrantyCoverage;
  claimCount: number;
  totalClaimValue: number;
  remainingCoverage: number;
  isExtended: boolean;
  baseWarrantyId?: string;
}

export interface CreateWarrantyDto {
  warrantyType: WarrantyType;
  customerId: string;
  customerName: string;
  equipmentId: string;
  equipmentModel: string;
  startDate: string;
  durationMonths: number;
  coverage: WarrantyCoverage;
}

export interface UpdateWarrantyDto extends Partial<CreateWarrantyDto> {
  status?: WarrantyStatus;
}

export interface WarrantyFilters {
  status?: WarrantyStatus;
  warrantyType?: WarrantyType;
  coverage?: WarrantyCoverage;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Mock Data
// ============================================================================

export const MOCK_WARRANTIES: Warranty[] = [
  {
    id: '1',
    warrantyNumber: 'WRN-2025-00001',
    warrantyType: 'Standard',
    customerId: 'CUST001',
    customerName: 'Sharma Modular Kitchens Pvt Ltd',
    equipmentId: 'EQP-MK-2025-001',
    equipmentModel: 'Modular Kitchen Premium SS-304',
    status: 'active',
    startDate: '2025-01-15',
    endDate: '2026-01-14',
    durationMonths: 12,
    coverage: 'Parts & Labor',
    claimCount: 0,
    totalClaimValue: 0,
    remainingCoverage: 100,
    isExtended: false,
  },
  {
    id: '2',
    warrantyNumber: 'WRN-2025-00045',
    warrantyType: 'Extended',
    customerId: 'CUST002',
    customerName: 'Prestige Developers Bangalore',
    equipmentId: 'EQP-HB-2024-234',
    equipmentModel: 'Built-in Hob 4 Burner Gas',
    status: 'active',
    startDate: '2024-03-20',
    endDate: '2027-03-19',
    durationMonths: 36,
    coverage: 'Comprehensive',
    claimCount: 2,
    totalClaimValue: 28500,
    remainingCoverage: 85,
    isExtended: true,
    baseWarrantyId: 'WRN-2024-00012',
  },
  {
    id: '3',
    warrantyNumber: 'WRN-2025-00123',
    warrantyType: 'Manufacturer',
    customerId: 'CUST003',
    customerName: 'Urban Interiors & Designers',
    equipmentId: 'EQP-CH-2025-067',
    equipmentModel: 'Chimney Auto Clean 90cm',
    status: 'active',
    startDate: '2025-05-10',
    endDate: '2027-05-09',
    durationMonths: 24,
    coverage: 'Parts Only',
    claimCount: 1,
    totalClaimValue: 8500,
    remainingCoverage: 95,
    isExtended: false,
  },
  {
    id: '4',
    warrantyNumber: 'WRN-2024-00876',
    warrantyType: 'Standard',
    customerId: 'CUST004',
    customerName: 'Elite Contractors & Builders',
    equipmentId: 'EQP-OV-2024-543',
    equipmentModel: 'Built-in Oven 60L',
    status: 'expired',
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    durationMonths: 12,
    coverage: 'Parts & Labor',
    claimCount: 3,
    totalClaimValue: 45000,
    remainingCoverage: 0,
    isExtended: false,
  },
  {
    id: '5',
    warrantyNumber: 'WRN-2025-00234',
    warrantyType: 'Extended',
    customerId: 'CUST005',
    customerName: 'DLF Universal Projects',
    equipmentId: 'EQP-DW-2023-890',
    equipmentModel: 'Dishwasher 14 Place Settings',
    status: 'active',
    startDate: '2023-08-15',
    endDate: '2026-08-14',
    durationMonths: 36,
    coverage: 'Comprehensive',
    claimCount: 4,
    totalClaimValue: 67000,
    remainingCoverage: 70,
    isExtended: true,
    baseWarrantyId: 'WRN-2023-00456',
  },
  {
    id: '6',
    warrantyNumber: 'WRN-2025-00345',
    warrantyType: 'Dealer',
    customerId: 'CUST006',
    customerName: 'Signature Interiors Pune',
    equipmentId: 'EQP-MK-2025-234',
    equipmentModel: 'Modular Kitchen L-Shape',
    status: 'active',
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    durationMonths: 12,
    coverage: 'Labor Only',
    claimCount: 0,
    totalClaimValue: 0,
    remainingCoverage: 100,
    isExtended: false,
  },
  {
    id: '7',
    warrantyNumber: 'WRN-2024-00567',
    warrantyType: 'Standard',
    customerId: 'CUST007',
    customerName: 'Royal Homes Hyderabad',
    equipmentId: 'EQP-HB-2024-789',
    equipmentModel: 'Induction Hob 4 Burner',
    status: 'transferred',
    startDate: '2024-06-15',
    endDate: '2025-06-14',
    durationMonths: 12,
    coverage: 'Parts & Labor',
    claimCount: 1,
    totalClaimValue: 12000,
    remainingCoverage: 90,
    isExtended: false,
  },
  {
    id: '8',
    warrantyNumber: 'WRN-2025-00456',
    warrantyType: 'Manufacturer',
    customerId: 'CUST008',
    customerName: 'Modern Living Ahmedabad',
    equipmentId: 'EQP-MW-2025-123',
    equipmentModel: 'Microwave Oven 30L Convection',
    status: 'active',
    startDate: '2025-07-20',
    endDate: '2027-07-19',
    durationMonths: 24,
    coverage: 'Comprehensive',
    claimCount: 0,
    totalClaimValue: 0,
    remainingCoverage: 100,
    isExtended: false,
  },
  {
    id: '9',
    warrantyNumber: 'WRN-2023-00234',
    warrantyType: 'Standard',
    customerId: 'CUST009',
    customerName: 'Decor Studio Chennai',
    equipmentId: 'EQP-CH-2023-456',
    equipmentModel: 'Chimney Curved Glass 60cm',
    status: 'void',
    startDate: '2023-12-01',
    endDate: '2024-11-30',
    durationMonths: 12,
    coverage: 'Parts Only',
    claimCount: 5,
    totalClaimValue: 89000,
    remainingCoverage: 0,
    isExtended: false,
  },
  {
    id: '10',
    warrantyNumber: 'WRN-2025-00789',
    warrantyType: 'Extended',
    customerId: 'CUST010',
    customerName: 'Cosmos Furniture Mart',
    equipmentId: 'EQP-RO-2024-678',
    equipmentModel: 'RO Water Purifier 10L',
    status: 'active',
    startDate: '2024-09-01',
    endDate: '2027-08-31',
    durationMonths: 36,
    coverage: 'Parts & Labor',
    claimCount: 2,
    totalClaimValue: 15000,
    remainingCoverage: 88,
    isExtended: true,
    baseWarrantyId: 'WRN-2024-00345',
  },
];

// ============================================================================
// Warranty Service Class
// ============================================================================

export class WarrantyService {
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
   * Get all warranties with optional filters
   */
  static async getAllWarranties(filters?: WarrantyFilters): Promise<Warranty[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredWarranties = [...MOCK_WARRANTIES];

      if (filters?.status) {
        filteredWarranties = filteredWarranties.filter((w) => w.status === filters.status);
      }
      if (filters?.warrantyType) {
        filteredWarranties = filteredWarranties.filter((w) => w.warrantyType === filters.warrantyType);
      }
      if (filters?.coverage) {
        filteredWarranties = filteredWarranties.filter((w) => w.coverage === filters.coverage);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredWarranties = filteredWarranties.filter(
          (w) =>
            w.warrantyNumber.toLowerCase().includes(searchLower) ||
            w.customerName.toLowerCase().includes(searchLower) ||
            w.equipmentModel.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.page && filters?.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        filteredWarranties = filteredWarranties.slice(start, end);
      }

      return filteredWarranties;
    }

    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.warrantyType) queryParams.set('warrantyType', filters.warrantyType);
    if (filters?.coverage) queryParams.set('coverage', filters.coverage);
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.page) queryParams.set('page', filters.page.toString());
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());

    return this.request<Warranty[]>(`/after-sales/warranties?${queryParams.toString()}`);
  }

  /**
   * Get warranty by ID
   */
  static async getWarrantyById(id: string): Promise<Warranty> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const warranty = MOCK_WARRANTIES.find((w) => w.id === id);
      if (!warranty) throw new Error('Warranty not found');
      return warranty;
    }
    return this.request<Warranty>(`/after-sales/warranties/${id}`);
  }

  /**
   * Create a new warranty
   */
  static async createWarranty(data: CreateWarrantyDto): Promise<Warranty> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const now = new Date();
      const startDate = new Date(data.startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + data.durationMonths);

      const newWarranty: Warranty = {
        id: `wrn-${Date.now()}`,
        warrantyNumber: `WRN-${now.getFullYear()}-${String(MOCK_WARRANTIES.length + 1).padStart(5, '0')}`,
        ...data,
        status: 'active',
        endDate: endDate.toISOString().split('T')[0],
        claimCount: 0,
        totalClaimValue: 0,
        remainingCoverage: 100,
        isExtended: false,
      };
      MOCK_WARRANTIES.push(newWarranty);
      return newWarranty;
    }
    return this.request<Warranty>('/after-sales/warranties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing warranty
   */
  static async updateWarranty(id: string, data: UpdateWarrantyDto): Promise<Warranty> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_WARRANTIES.findIndex((w) => w.id === id);
      if (index === -1) throw new Error('Warranty not found');

      MOCK_WARRANTIES[index] = {
        ...MOCK_WARRANTIES[index],
        ...data,
      };
      return MOCK_WARRANTIES[index];
    }
    return this.request<Warranty>(`/after-sales/warranties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get warranty statistics
   */
  static async getStatistics(): Promise<{
    totalWarranties: number;
    activeWarranties: number;
    expiringIn30Days: number;
    totalClaims: number;
    totalClaimValue: number;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const now = new Date();

      return {
        totalWarranties: MOCK_WARRANTIES.length,
        activeWarranties: MOCK_WARRANTIES.filter((w) => w.status === 'active').length,
        expiringIn30Days: MOCK_WARRANTIES.filter((w) => {
          const daysUntilExpiry = Math.ceil(
            (new Date(w.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          return w.status === 'active' && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        }).length,
        totalClaims: MOCK_WARRANTIES.reduce((sum, w) => sum + w.claimCount, 0),
        totalClaimValue: MOCK_WARRANTIES.reduce((sum, w) => sum + w.totalClaimValue, 0),
      };
    }

    return this.request<{
      totalWarranties: number;
      activeWarranties: number;
      expiringIn30Days: number;
      totalClaims: number;
      totalClaimValue: number;
    }>('/after-sales/warranties/statistics');
  }
}

export const warrantyService = WarrantyService;
