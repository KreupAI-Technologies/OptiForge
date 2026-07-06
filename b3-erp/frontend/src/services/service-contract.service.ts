/**
 * Service Contract Service
 * Handles all service contract-related API operations for the After-Sales module
 */

import { apiClient } from './api/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

/**
 * Raw service-contract record as returned by the NestJS
 * `after-sales/contracts` controller. This mirrors the backend
 * `ServiceContract` entity, which is richer than the flat FE view model
 * above (it carries inclusions/exclusions/coverage used by the terms page).
 */
export interface ServiceContractRecord {
  id: string;
  contractNumber: string;
  contractType: string;
  status: string;
  customerName?: string;
  duration?: number;
  responseTimeSLA?: number;
  resolutionTimeSLA?: number;
  visitFrequency?: string;
  serviceCoverage?: string[];
  inclusions?: string[];
  exclusions?: string[];
  termsAndConditions?: string;
  partsIncluded?: boolean;
  laborIncluded?: boolean;
  consumablesIncluded?: boolean;
  [key: string]: unknown;
}

/**
 * Unwrap a response that may be either a bare array (the NestJS controller
 * returns raw arrays) or wrapped in an `{ success, data }` envelope.
 */
function unwrapArray<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  const data = (res as { data?: unknown } | null)?.data;
  return Array.isArray(data) ? (data as T[]) : [];
}

// ============================================================================
// Interfaces
// ============================================================================

export type ContractType = 'AMC' | 'CMC' | 'Pay Per Visit' | 'Parts & Labor' | 'Extended Warranty';
export type ContractStatus = 'draft' | 'active' | 'expired' | 'renewed' | 'terminated' | 'suspended';
export type PricingTier = 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
export type BillingFrequency = 'monthly' | 'quarterly' | 'half_yearly' | 'annual';

export interface ServiceContract {
  id: string;
  contractNumber: string;
  contractType: ContractType;
  customerId: string;
  customerName: string;
  status: ContractStatus;
  startDate: string;
  endDate: string;
  duration: number;
  pricingTier: PricingTier;
  contractValue: number;
  responseTimeSLA: number;
  resolutionTimeSLA: number;
  renewalCount: number;
  totalBilled: number;
  totalPaid: number;
  outstandingAmount: number;
  equipmentCount: number;
  accountManager: string;
  billingFrequency: BillingFrequency;
  autoRenewal: boolean;
}

export interface CreateServiceContractDto {
  contractType: ContractType;
  customerId: string;
  customerName: string;
  startDate: string;
  duration: number;
  pricingTier: PricingTier;
  contractValue: number;
  responseTimeSLA: number;
  resolutionTimeSLA: number;
  equipmentCount: number;
  accountManager: string;
  billingFrequency: BillingFrequency;
  autoRenewal: boolean;
}

export interface UpdateServiceContractDto extends Partial<CreateServiceContractDto> {
  status?: ContractStatus;
}

export interface ServiceContractFilters {
  status?: ContractStatus;
  contractType?: ContractType;
  pricingTier?: PricingTier;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Mock Data
// ============================================================================

export const MOCK_SERVICE_CONTRACTS: ServiceContract[] = [
  {
    id: '1',
    contractNumber: 'AMC-2025-0001',
    contractType: 'AMC',
    customerId: 'CUST001',
    customerName: 'Sharma Modular Kitchens Pvt Ltd',
    status: 'active',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    duration: 12,
    pricingTier: 'Premium',
    contractValue: 450000,
    responseTimeSLA: 4,
    resolutionTimeSLA: 24,
    renewalCount: 2,
    totalBilled: 225000,
    totalPaid: 225000,
    outstandingAmount: 0,
    equipmentCount: 45,
    accountManager: 'Priya Patel',
    billingFrequency: 'quarterly',
    autoRenewal: true,
  },
  {
    id: '2',
    contractNumber: 'CMC-2025-0012',
    contractType: 'CMC',
    customerId: 'CUST002',
    customerName: 'Prestige Developers Bangalore',
    status: 'active',
    startDate: '2025-03-15',
    endDate: '2026-03-14',
    duration: 12,
    pricingTier: 'Enterprise',
    contractValue: 1250000,
    responseTimeSLA: 2,
    resolutionTimeSLA: 6,
    renewalCount: 0,
    totalBilled: 625000,
    totalPaid: 625000,
    outstandingAmount: 0,
    equipmentCount: 120,
    accountManager: 'Amit Kumar',
    billingFrequency: 'half_yearly',
    autoRenewal: true,
  },
  {
    id: '3',
    contractNumber: 'AMC-2025-0035',
    contractType: 'AMC',
    customerId: 'CUST003',
    customerName: 'Urban Interiors & Designers',
    status: 'active',
    startDate: '2025-06-01',
    endDate: '2026-05-31',
    duration: 12,
    pricingTier: 'Standard',
    contractValue: 280000,
    responseTimeSLA: 8,
    resolutionTimeSLA: 48,
    renewalCount: 1,
    totalBilled: 93333,
    totalPaid: 93333,
    outstandingAmount: 0,
    equipmentCount: 28,
    accountManager: 'Rahul Verma',
    billingFrequency: 'quarterly',
    autoRenewal: false,
  },
  {
    id: '4',
    contractNumber: 'AMC-2024-0234',
    contractType: 'AMC',
    customerId: 'CUST004',
    customerName: 'Elite Contractors & Builders',
    status: 'expired',
    startDate: '2024-08-01',
    endDate: '2025-07-31',
    duration: 12,
    pricingTier: 'Basic',
    contractValue: 180000,
    responseTimeSLA: 24,
    resolutionTimeSLA: 72,
    renewalCount: 0,
    totalBilled: 180000,
    totalPaid: 160000,
    outstandingAmount: 20000,
    equipmentCount: 18,
    accountManager: 'Sanjay Gupta',
    billingFrequency: 'annual',
    autoRenewal: false,
  },
  {
    id: '5',
    contractNumber: 'CMC-2025-0045',
    contractType: 'CMC',
    customerId: 'CUST005',
    customerName: 'DLF Universal Projects',
    status: 'active',
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    duration: 12,
    pricingTier: 'Premium',
    contractValue: 850000,
    responseTimeSLA: 4,
    resolutionTimeSLA: 12,
    renewalCount: 3,
    totalBilled: 425000,
    totalPaid: 425000,
    outstandingAmount: 0,
    equipmentCount: 85,
    accountManager: 'Priya Patel',
    billingFrequency: 'half_yearly',
    autoRenewal: true,
  },
  {
    id: '6',
    contractNumber: 'AMC-2025-0078',
    contractType: 'Extended Warranty',
    customerId: 'CUST006',
    customerName: 'Signature Interiors Pune',
    status: 'suspended',
    startDate: '2025-02-15',
    endDate: '2026-02-14',
    duration: 12,
    pricingTier: 'Standard',
    contractValue: 320000,
    responseTimeSLA: 8,
    resolutionTimeSLA: 24,
    renewalCount: 0,
    totalBilled: 160000,
    totalPaid: 80000,
    outstandingAmount: 80000,
    equipmentCount: 32,
    accountManager: 'Amit Kumar',
    billingFrequency: 'half_yearly',
    autoRenewal: false,
  },
  {
    id: '7',
    contractNumber: 'AMC-2025-0103',
    contractType: 'AMC',
    customerId: 'CUST007',
    customerName: 'Royal Homes Hyderabad',
    status: 'draft',
    startDate: '2025-11-01',
    endDate: '2026-10-31',
    duration: 12,
    pricingTier: 'Premium',
    contractValue: 720000,
    responseTimeSLA: 4,
    resolutionTimeSLA: 24,
    renewalCount: 0,
    totalBilled: 0,
    totalPaid: 0,
    outstandingAmount: 0,
    equipmentCount: 68,
    accountManager: 'Rahul Verma',
    billingFrequency: 'quarterly',
    autoRenewal: true,
  },
  {
    id: '8',
    contractNumber: 'CMC-2025-0089',
    contractType: 'CMC',
    customerId: 'CUST008',
    customerName: 'Modern Living Ahmedabad',
    status: 'active',
    startDate: '2025-05-01',
    endDate: '2026-04-30',
    duration: 12,
    pricingTier: 'Enterprise',
    contractValue: 950000,
    responseTimeSLA: 2,
    resolutionTimeSLA: 8,
    renewalCount: 1,
    totalBilled: 475000,
    totalPaid: 475000,
    outstandingAmount: 0,
    equipmentCount: 95,
    accountManager: 'Priya Patel',
    billingFrequency: 'half_yearly',
    autoRenewal: true,
  },
];

// ============================================================================
// Service Contract Service Class
// ============================================================================

export class ServiceContractService {
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
   * Get all service contracts with optional filters
   */
  static async getAllServiceContracts(filters?: ServiceContractFilters): Promise<ServiceContract[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredContracts = [...MOCK_SERVICE_CONTRACTS];

      if (filters?.status) {
        filteredContracts = filteredContracts.filter((c) => c.status === filters.status);
      }
      if (filters?.contractType) {
        filteredContracts = filteredContracts.filter((c) => c.contractType === filters.contractType);
      }
      if (filters?.pricingTier) {
        filteredContracts = filteredContracts.filter((c) => c.pricingTier === filters.pricingTier);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredContracts = filteredContracts.filter(
          (c) =>
            c.contractNumber.toLowerCase().includes(searchLower) ||
            c.customerName.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.page && filters?.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        filteredContracts = filteredContracts.slice(start, end);
      }

      return filteredContracts;
    }

    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.contractType) queryParams.set('contractType', filters.contractType);
    if (filters?.pricingTier) queryParams.set('pricingTier', filters.pricingTier);
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.page) queryParams.set('page', filters.page.toString());
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());

    return this.request<ServiceContract[]>(`/after-sales/service-contracts?${queryParams.toString()}`);
  }

  /**
   * Get service contract by ID
   */
  static async getServiceContractById(id: string): Promise<ServiceContract> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const contract = MOCK_SERVICE_CONTRACTS.find((c) => c.id === id);
      if (!contract) throw new Error('Service contract not found');
      return contract;
    }
    return this.request<ServiceContract>(`/after-sales/service-contracts/${id}`);
  }

  /**
   * Create a new service contract
   */
  static async createServiceContract(data: CreateServiceContractDto): Promise<ServiceContract> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const now = new Date();
      const startDate = new Date(data.startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + data.duration);

      const contractPrefix = data.contractType === 'CMC' ? 'CMC' : 'AMC';
      const newContract: ServiceContract = {
        id: `sc-${Date.now()}`,
        contractNumber: `${contractPrefix}-${now.getFullYear()}-${String(MOCK_SERVICE_CONTRACTS.length + 1).padStart(4, '0')}`,
        ...data,
        status: 'draft',
        endDate: endDate.toISOString().split('T')[0],
        renewalCount: 0,
        totalBilled: 0,
        totalPaid: 0,
        outstandingAmount: 0,
      };
      MOCK_SERVICE_CONTRACTS.push(newContract);
      return newContract;
    }
    return this.request<ServiceContract>('/after-sales/service-contracts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing service contract
   */
  static async updateServiceContract(id: string, data: UpdateServiceContractDto): Promise<ServiceContract> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_SERVICE_CONTRACTS.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Service contract not found');

      MOCK_SERVICE_CONTRACTS[index] = {
        ...MOCK_SERVICE_CONTRACTS[index],
        ...data,
      };
      return MOCK_SERVICE_CONTRACTS[index];
    }
    return this.request<ServiceContract>(`/after-sales/service-contracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get service contract statistics
   */
  /**
   * Fetch raw service-contract records from the real NestJS controller
   * (`GET /after-sales/contracts`) via the shared api-client.
   *
   * Unlike `getAllServiceContracts`, this returns the full backend entity
   * shape (`ServiceContractRecord`), including inclusions/exclusions/coverage
   * and SLA fields that the Contract Terms page derives its templates and SLA
   * presets from. There is no dedicated templates/SLA-preset route on the
   * backend, so callers derive that presentation data from these records.
   */
  static async getContractRecords(filters?: {
    status?: string;
    contractType?: string;
    customerId?: string;
  }): Promise<ServiceContractRecord[]> {
    const query = new URLSearchParams();
    if (filters?.status) query.set('status', filters.status);
    if (filters?.contractType) query.set('contractType', filters.contractType);
    if (filters?.customerId) query.set('customerId', filters.customerId);
    const qs = query.toString();
    const res = await apiClient.get<ServiceContractRecord[]>(
      `/after-sales/contracts${qs ? `?${qs}` : ''}`,
    );
    return unwrapArray<ServiceContractRecord>(res);
  }

  static async getStatistics(): Promise<{
    totalContracts: number;
    activeContracts: number;
    expiringIn30Days: number;
    totalActiveValue: number;
    totalOutstanding: number;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const now = new Date();

      return {
        totalContracts: MOCK_SERVICE_CONTRACTS.length,
        activeContracts: MOCK_SERVICE_CONTRACTS.filter((c) => c.status === 'active').length,
        expiringIn30Days: MOCK_SERVICE_CONTRACTS.filter((c) => {
          const daysUntilExpiry = Math.ceil(
            (new Date(c.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          return c.status === 'active' && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        }).length,
        totalActiveValue: MOCK_SERVICE_CONTRACTS
          .filter((c) => c.status === 'active')
          .reduce((sum, c) => sum + c.contractValue, 0),
        totalOutstanding: MOCK_SERVICE_CONTRACTS.reduce((sum, c) => sum + c.outstandingAmount, 0),
      };
    }

    return this.request<{
      totalContracts: number;
      activeContracts: number;
      expiringIn30Days: number;
      totalActiveValue: number;
      totalOutstanding: number;
    }>('/after-sales/service-contracts/statistics');
  }
}

export const serviceContractService = ServiceContractService;
