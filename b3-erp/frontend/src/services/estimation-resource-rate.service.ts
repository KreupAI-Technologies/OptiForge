import { apiClient } from './api/client';

// ==================== TypeScript Interfaces ====================

export type ResourceRateType = 'Material' | 'Labor' | 'Equipment' | 'Subcontractor';

export type RateUnit =
  | 'Each'
  | 'Piece'
  | 'Kilogram'
  | 'Ton'
  | 'Meter'
  | 'Square Meter'
  | 'Cubic Meter'
  | 'Hour'
  | 'Day'
  | 'Week'
  | 'Month'
  | 'Lump Sum'
  | 'Liter'
  | 'Gallon';

export interface ResourceRate {
  id: string;
  companyId: string;
  code: string;
  name: string;
  description?: string;
  rateType: ResourceRateType;
  category?: string;
  subCategory?: string;
  unit: RateUnit;
  currency: string;
  standardRate: number;
  minimumRate?: number;
  maximumRate?: number;
  overtimeRate?: number;
  isActive: boolean;
  effectiveFrom?: string;
  effectiveUntil?: string;
  supplierName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialRateCard {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  effectiveFrom?: string;
  effectiveUntil?: string;
  supplierName?: string;
  currency: string;
  items: {
    resourceRateId: string;
    code: string;
    name: string;
    unit: string;
    rate: number;
    category: string;
  }[];
  createdAt: string;
}

export interface LaborRateCard {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  effectiveFrom?: string;
  effectiveUntil?: string;
  region?: string;
  currency: string;
  roles: {
    roleId: string;
    roleName: string;
    skillLevel: string;
    hourlyRate: number;
    dailyRate: number;
    overtimeRate: number;
    benefits: number;
    totalHourlyRate: number;
  }[];
  createdAt: string;
}

export interface EquipmentRate {
  id: string;
  companyId: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  manufacturer?: string;
  model?: string;
  currency: string;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  fuelCostPerHour?: number;
  operatorCostPerHour?: number;
  maintenanceCostPerHour?: number;
  mobilizationCost?: number;
  demobilizationCost?: number;
  isActive: boolean;
  supplierName?: string;
  createdAt: string;
}

export interface SubcontractorRate {
  id: string;
  companyId: string;
  subcontractorId: string;
  subcontractorName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  services: {
    serviceId: string;
    serviceName: string;
    description: string;
    unit: string;
    rate: number;
    minimumCharge: number;
    leadTime: string;
  }[];
  performanceRating?: number;
  isActive: boolean;
  isPreferred: boolean;
  createdAt: string;
}

// ==================== Mock Data ====================

const MOCK_RESOURCE_RATES: ResourceRate[] = [
  {
    id: 'rate-001',
    companyId: 'company-001',
    code: 'MAT-001',
    name: 'Portland Cement',
    description: 'Type I/II Portland Cement - 50kg bag',
    rateType: 'Material',
    category: 'Concrete Materials',
    unit: 'Each',
    currency: 'USD',
    standardRate: 12.5,
    minimumRate: 11.0,
    maximumRate: 15.0,
    isActive: true,
    supplierName: 'ABC Building Supplies',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'rate-002',
    companyId: 'company-001',
    code: 'MAT-002',
    name: 'Structural Steel',
    description: 'Grade 60 structural steel rebar',
    rateType: 'Material',
    category: 'Steel Materials',
    unit: 'Ton',
    currency: 'USD',
    standardRate: 850,
    minimumRate: 780,
    maximumRate: 950,
    isActive: true,
    supplierName: 'Steel Dynamics Inc',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'rate-003',
    companyId: 'company-001',
    code: 'LAB-001',
    name: 'General Labor',
    description: 'General construction labor',
    rateType: 'Labor',
    category: 'General',
    unit: 'Hour',
    currency: 'USD',
    standardRate: 35,
    overtimeRate: 52.5,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'rate-004',
    companyId: 'company-001',
    code: 'LAB-002',
    name: 'Skilled Electrician',
    description: 'Licensed electrician',
    rateType: 'Labor',
    category: 'Electrical',
    unit: 'Hour',
    currency: 'USD',
    standardRate: 75,
    overtimeRate: 112.5,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
];

const MOCK_MATERIAL_RATE_CARDS: MaterialRateCard[] = [
  {
    id: 'mrc-001',
    companyId: 'company-001',
    name: 'Q1 2025 Material Rates',
    description: 'Standard material rates for Q1 2025',
    isActive: true,
    isDefault: true,
    effectiveFrom: '2025-01-01',
    effectiveUntil: '2025-03-31',
    supplierName: 'ABC Building Supplies',
    currency: 'USD',
    items: [
      {
        resourceRateId: 'rate-001',
        code: 'MAT-001',
        name: 'Portland Cement',
        unit: 'Each',
        rate: 12.5,
        category: 'Concrete Materials',
      },
      {
        resourceRateId: 'rate-002',
        code: 'MAT-002',
        name: 'Structural Steel',
        unit: 'Ton',
        rate: 850,
        category: 'Steel Materials',
      },
    ],
    createdAt: '2024-12-15T00:00:00Z',
  },
];

const MOCK_LABOR_RATE_CARDS: LaborRateCard[] = [
  {
    id: 'lrc-001',
    companyId: 'company-001',
    name: '2025 Labor Rates - Northeast',
    description: 'Labor rates for Northeast region',
    isActive: true,
    isDefault: true,
    effectiveFrom: '2025-01-01',
    effectiveUntil: '2025-12-31',
    region: 'Northeast',
    currency: 'USD',
    roles: [
      {
        roleId: 'role-001',
        roleName: 'General Laborer',
        skillLevel: 'Entry',
        hourlyRate: 35,
        dailyRate: 280,
        overtimeRate: 52.5,
        benefits: 8.75,
        totalHourlyRate: 43.75,
      },
      {
        roleId: 'role-002',
        roleName: 'Skilled Carpenter',
        skillLevel: 'Journeyman',
        hourlyRate: 55,
        dailyRate: 440,
        overtimeRate: 82.5,
        benefits: 13.75,
        totalHourlyRate: 68.75,
      },
      {
        roleId: 'role-003',
        roleName: 'Electrician',
        skillLevel: 'Master',
        hourlyRate: 75,
        dailyRate: 600,
        overtimeRate: 112.5,
        benefits: 18.75,
        totalHourlyRate: 93.75,
      },
    ],
    createdAt: '2024-12-01T00:00:00Z',
  },
];

const MOCK_EQUIPMENT_RATES: EquipmentRate[] = [
  {
    id: 'eq-001',
    companyId: 'company-001',
    code: 'EQ-001',
    name: 'Excavator - 20 Ton',
    description: 'Hydraulic excavator 20 ton capacity',
    category: 'Earthmoving',
    manufacturer: 'Caterpillar',
    model: '320D',
    currency: 'USD',
    hourlyRate: 125,
    dailyRate: 850,
    weeklyRate: 3500,
    monthlyRate: 12000,
    fuelCostPerHour: 25,
    operatorCostPerHour: 45,
    maintenanceCostPerHour: 15,
    mobilizationCost: 500,
    demobilizationCost: 500,
    isActive: true,
    supplierName: 'Heavy Equipment Rentals Inc',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'eq-002',
    companyId: 'company-001',
    code: 'EQ-002',
    name: 'Tower Crane - 10 Ton',
    description: 'Tower crane 10 ton lifting capacity',
    category: 'Lifting',
    manufacturer: 'Liebherr',
    model: '120 EC-H',
    currency: 'USD',
    hourlyRate: 200,
    dailyRate: 1400,
    weeklyRate: 6000,
    monthlyRate: 22000,
    operatorCostPerHour: 65,
    maintenanceCostPerHour: 35,
    mobilizationCost: 5000,
    demobilizationCost: 5000,
    isActive: true,
    supplierName: 'Crane Services LLC',
    createdAt: '2025-01-01T00:00:00Z',
  },
];

const MOCK_SUBCONTRACTOR_RATES: SubcontractorRate[] = [
  {
    id: 'sub-001',
    companyId: 'company-001',
    subcontractorId: 'vendor-001',
    subcontractorName: 'Elite Electrical Services',
    contactPerson: 'John Smith',
    email: 'john@eliteelectrical.com',
    phone: '+1-555-0101',
    services: [
      {
        serviceId: 'svc-001',
        serviceName: 'Commercial Electrical Installation',
        description: 'Complete electrical installation for commercial buildings',
        unit: 'Square Foot',
        rate: 12.5,
        minimumCharge: 5000,
        leadTime: '2 weeks',
      },
      {
        serviceId: 'svc-002',
        serviceName: 'Panel Upgrade',
        description: 'Electrical panel upgrade and replacement',
        unit: 'Each',
        rate: 2500,
        minimumCharge: 2500,
        leadTime: '1 week',
      },
    ],
    performanceRating: 4.8,
    isActive: true,
    isPreferred: true,
    createdAt: '2024-06-01T00:00:00Z',
  },
];

// ==================== Service Class ====================

class EstimationResourceRateService {
  private baseUrl = '/estimation/resource-rates';

  // Resource Rates
  async createResourceRate(
    companyId: string,
    data: Partial<ResourceRate>
  ): Promise<ResourceRate> {
    try {
      const response = await apiClient.post<ResourceRate>(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.error('API Error creating resource rate, using mock data:', error);
      const newRate: ResourceRate = {
        id: `rate-${Date.now()}`,
        companyId,
        code: data.code || `CODE-${Date.now()}`,
        name: data.name || 'New Rate',
        rateType: data.rateType || 'Material',
        unit: data.unit || 'Each',
        currency: data.currency || 'USD',
        standardRate: data.standardRate || 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      MOCK_RESOURCE_RATES.push(newRate);
      return newRate;
    }
  }

  async findAllResourceRates(
    companyId: string,
    filters?: { rateType?: ResourceRateType; category?: string; isActive?: boolean }
  ): Promise<ResourceRate[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.rateType) params.append('rateType', filters.rateType);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.isActive !== undefined)
        params.append('isActive', filters.isActive.toString());

      const response = await apiClient.get<ResourceRate[]>(
        `${this.baseUrl}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching resource rates, using mock data:', error);
      let result = MOCK_RESOURCE_RATES.filter((r) => r.companyId === companyId);
      if (filters?.rateType) {
        result = result.filter((r) => r.rateType === filters.rateType);
      }
      if (filters?.category) {
        result = result.filter((r) => r.category === filters.category);
      }
      if (filters?.isActive !== undefined) {
        result = result.filter((r) => r.isActive === filters.isActive);
      }
      return result;
    }
  }

  async findResourceRateById(companyId: string, id: string): Promise<ResourceRate> {
    try {
      const response = await apiClient.get<ResourceRate>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching resource rate, using mock data:', error);
      const rate = MOCK_RESOURCE_RATES.find((r) => r.id === id);
      if (!rate) throw new Error(`Resource Rate with ID ${id} not found`);
      return rate;
    }
  }

  async updateResourceRate(
    companyId: string,
    id: string,
    data: Partial<ResourceRate>
  ): Promise<ResourceRate> {
    try {
      const response = await apiClient.patch<ResourceRate>(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('API Error updating resource rate, using mock data:', error);
      const index = MOCK_RESOURCE_RATES.findIndex((r) => r.id === id);
      if (index === -1) throw new Error(`Resource Rate with ID ${id} not found`);
      MOCK_RESOURCE_RATES[index] = {
        ...MOCK_RESOURCE_RATES[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return MOCK_RESOURCE_RATES[index];
    }
  }

  async deleteResourceRate(companyId: string, id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('API Error deleting resource rate, using mock data:', error);
      const index = MOCK_RESOURCE_RATES.findIndex((r) => r.id === id);
      if (index !== -1) {
        MOCK_RESOURCE_RATES.splice(index, 1);
      }
    }
  }

  // Material Rate Cards
  async findAllMaterialRateCards(
    companyId: string,
    activeOnly?: boolean
  ): Promise<MaterialRateCard[]> {
    try {
      const params = activeOnly ? '?activeOnly=true' : '';
      const response = await apiClient.get<MaterialRateCard[]>(
        `${this.baseUrl}/material-cards/all${params}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching material rate cards, using mock data:', error);
      let result = MOCK_MATERIAL_RATE_CARDS.filter((c) => c.companyId === companyId);
      if (activeOnly) {
        result = result.filter((c) => c.isActive);
      }
      return result;
    }
  }

  // Labor Rate Cards
  async findAllLaborRateCards(companyId: string, activeOnly?: boolean): Promise<LaborRateCard[]> {
    try {
      const params = activeOnly ? '?activeOnly=true' : '';
      const response = await apiClient.get<LaborRateCard[]>(
        `${this.baseUrl}/labor-cards/all${params}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching labor rate cards, using mock data:', error);
      let result = MOCK_LABOR_RATE_CARDS.filter((c) => c.companyId === companyId);
      if (activeOnly) {
        result = result.filter((c) => c.isActive);
      }
      return result;
    }
  }

  // Equipment Rates
  async findAllEquipmentRates(
    companyId: string,
    filters?: { category?: string; isActive?: boolean }
  ): Promise<EquipmentRate[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.isActive !== undefined)
        params.append('isActive', filters.isActive.toString());

      const response = await apiClient.get<EquipmentRate[]>(
        `${this.baseUrl}/equipment/all?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching equipment rates, using mock data:', error);
      let result = MOCK_EQUIPMENT_RATES.filter((e) => e.companyId === companyId);
      if (filters?.category) {
        result = result.filter((e) => e.category === filters.category);
      }
      if (filters?.isActive !== undefined) {
        result = result.filter((e) => e.isActive === filters.isActive);
      }
      return result;
    }
  }

  async calculateEquipmentCost(
    companyId: string,
    equipmentRateId: string,
    days: number,
    includeOperator: boolean = false
  ): Promise<{
    baseCost: number;
    fuelCost: number;
    operatorCost: number;
    maintenanceCost: number;
    mobilization: number;
    demobilization: number;
    totalCost: number;
  }> {
    try {
      const response = await apiClient.get<{
        baseCost: number;
        fuelCost: number;
        operatorCost: number;
        maintenanceCost: number;
        mobilization: number;
        demobilization: number;
        totalCost: number;
      }>(
        `${this.baseUrl}/equipment/${equipmentRateId}/calculate-cost?days=${days}&includeOperator=${includeOperator}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error calculating equipment cost, using mock data:', error);
      const equipment = MOCK_EQUIPMENT_RATES.find((e) => e.id === equipmentRateId);
      if (!equipment) throw new Error(`Equipment Rate with ID ${equipmentRateId} not found`);

      const hoursPerDay = 8;
      const totalHours = days * hoursPerDay;

      const baseCost = equipment.dailyRate * days;
      const fuelCost = (equipment.fuelCostPerHour || 0) * totalHours;
      const operatorCost = includeOperator
        ? (equipment.operatorCostPerHour || 0) * totalHours
        : 0;
      const maintenanceCost = (equipment.maintenanceCostPerHour || 0) * totalHours;
      const mobilization = equipment.mobilizationCost || 0;
      const demobilization = equipment.demobilizationCost || 0;

      return {
        baseCost,
        fuelCost,
        operatorCost,
        maintenanceCost,
        mobilization,
        demobilization,
        totalCost:
          baseCost + fuelCost + operatorCost + maintenanceCost + mobilization + demobilization,
      };
    }
  }

  // Subcontractor Rates
  async findAllSubcontractorRates(
    companyId: string,
    filters?: { isActive?: boolean; isPreferred?: boolean }
  ): Promise<SubcontractorRate[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.isActive !== undefined)
        params.append('isActive', filters.isActive.toString());
      if (filters?.isPreferred !== undefined)
        params.append('isPreferred', filters.isPreferred.toString());

      const response = await apiClient.get<SubcontractorRate[]>(
        `${this.baseUrl}/subcontractors/all?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching subcontractor rates, using mock data:', error);
      let result = MOCK_SUBCONTRACTOR_RATES.filter((s) => s.companyId === companyId);
      if (filters?.isActive !== undefined) {
        result = result.filter((s) => s.isActive === filters.isActive);
      }
      if (filters?.isPreferred !== undefined) {
        result = result.filter((s) => s.isPreferred === filters.isPreferred);
      }
      return result;
    }
  }
}

export const estimationResourceRateService = new EstimationResourceRateService();
