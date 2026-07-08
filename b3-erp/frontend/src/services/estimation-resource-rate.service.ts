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

// ==================== Service Class ====================

class EstimationResourceRateService {
  private baseUrl = '/estimation/resource-rates';

  // Resource Rates
  async createResourceRate(
    companyId: string,
    data: Partial<ResourceRate>
  ): Promise<ResourceRate> {
    const response = await apiClient.post<ResourceRate>(this.baseUrl, data);
    return response.data;
  }

  async findAllResourceRates(
    companyId: string,
    filters?: { rateType?: ResourceRateType; category?: string; isActive?: boolean }
  ): Promise<ResourceRate[]> {
    const params = new URLSearchParams();
    if (filters?.rateType) params.append('rateType', filters.rateType);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.isActive !== undefined)
      params.append('isActive', filters.isActive.toString());

    const response = await apiClient.get<ResourceRate[]>(
      `${this.baseUrl}?${params.toString()}`
    );
    return response.data;
  }

  async findResourceRateById(companyId: string, id: string): Promise<ResourceRate> {
    const response = await apiClient.get<ResourceRate>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async updateResourceRate(
    companyId: string,
    id: string,
    data: Partial<ResourceRate>
  ): Promise<ResourceRate> {
    const response = await apiClient.patch<ResourceRate>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteResourceRate(companyId: string, id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  // Material Rate Cards
  async createMaterialRateCard(
    companyId: string,
    data: Partial<MaterialRateCard>
  ): Promise<MaterialRateCard> {
    const response = await apiClient.post<MaterialRateCard>(
      `${this.baseUrl}/material-cards`,
      data
    );
    return response.data;
  }

  async findAllMaterialRateCards(
    companyId: string,
    activeOnly?: boolean
  ): Promise<MaterialRateCard[]> {
    const params = activeOnly ? '?activeOnly=true' : '';
    const response = await apiClient.get<MaterialRateCard[]>(
      `${this.baseUrl}/material-cards/all${params}`
    );
    return response.data;
  }

  // Labor Rate Cards
  async createLaborRateCard(
    companyId: string,
    data: Partial<LaborRateCard>
  ): Promise<LaborRateCard> {
    const response = await apiClient.post<LaborRateCard>(
      `${this.baseUrl}/labor-cards`,
      data
    );
    return response.data;
  }

  async findAllLaborRateCards(companyId: string, activeOnly?: boolean): Promise<LaborRateCard[]> {
    const params = activeOnly ? '?activeOnly=true' : '';
    const response = await apiClient.get<LaborRateCard[]>(
      `${this.baseUrl}/labor-cards/all${params}`
    );
    return response.data;
  }

  // Equipment Rates
  async createEquipmentRate(
    companyId: string,
    data: Partial<EquipmentRate>
  ): Promise<EquipmentRate> {
    const response = await apiClient.post<EquipmentRate>(
      `${this.baseUrl}/equipment`,
      data
    );
    return response.data;
  }

  async findAllEquipmentRates(
    companyId: string,
    filters?: { category?: string; isActive?: boolean }
  ): Promise<EquipmentRate[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.isActive !== undefined)
      params.append('isActive', filters.isActive.toString());

    const response = await apiClient.get<EquipmentRate[]>(
      `${this.baseUrl}/equipment/all?${params.toString()}`
    );
    return response.data;
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
  }

  // Subcontractor Rates
  async createSubcontractorRate(
    companyId: string,
    data: Partial<SubcontractorRate>
  ): Promise<SubcontractorRate> {
    const response = await apiClient.post<SubcontractorRate>(
      `${this.baseUrl}/subcontractors`,
      data
    );
    return response.data;
  }

  async findAllSubcontractorRates(
    companyId: string,
    filters?: { isActive?: boolean; isPreferred?: boolean }
  ): Promise<SubcontractorRate[]> {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined)
      params.append('isActive', filters.isActive.toString());
    if (filters?.isPreferred !== undefined)
      params.append('isPreferred', filters.isPreferred.toString());

    const response = await apiClient.get<SubcontractorRate[]>(
      `${this.baseUrl}/subcontractors/all?${params.toString()}`
    );
    return response.data;
  }
}

export const estimationResourceRateService = new EstimationResourceRateService();
