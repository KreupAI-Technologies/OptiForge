import { apiClient } from './api/client';

// ==================== TypeScript Interfaces ====================

export type MarkupCostBasis = 'material-only' | 'material-labor' | 'full-cost';
export type MarkupStatus = 'active' | 'inactive';

export interface MarkupSetting {
  id: string;
  companyId: string;
  category: string;
  subcategory?: string;
  defaultMarkup: number;
  minMarkup: number;
  maxMarkup: number;
  costBasis: MarkupCostBasis;
  approvalRequired: boolean;
  approvalThreshold: number;
  updatedBy?: string;
  status: MarkupStatus;
  createdAt: string;
  updatedAt: string;
}

// ==================== Mock Data ====================

const MOCK_MARKUP_SETTINGS: MarkupSetting[] = [
  {
    id: 'MKP-001',
    companyId: 'company-001',
    category: 'Kitchen Sinks',
    subcategory: 'Standard Sinks',
    defaultMarkup: 48.0,
    minMarkup: 40.0,
    maxMarkup: 55.0,
    costBasis: 'full-cost',
    approvalRequired: true,
    approvalThreshold: 40.0,
    updatedBy: 'Admin',
    status: 'active',
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-10-01T00:00:00Z',
  },
  {
    id: 'MKP-002',
    companyId: 'company-001',
    category: 'Countertops',
    subcategory: 'Granite',
    defaultMarkup: 47.5,
    minMarkup: 42.0,
    maxMarkup: 55.0,
    costBasis: 'material-labor',
    approvalRequired: true,
    approvalThreshold: 42.0,
    updatedBy: 'Admin',
    status: 'active',
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-10-01T00:00:00Z',
  },
];

// ==================== Service Class ====================

class EstimationMarkupSettingService {
  private baseUrl = '/estimation/markup-settings';

  async create(
    companyId: string,
    data: Partial<MarkupSetting>
  ): Promise<MarkupSetting> {
    try {
      const response = await apiClient.post<MarkupSetting>(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.error('API Error creating markup setting, using mock data:', error);
      const newSetting: MarkupSetting = {
        id: `MKP-${Date.now()}`,
        companyId,
        category: data.category || 'New Category',
        defaultMarkup: data.defaultMarkup || 0,
        minMarkup: data.minMarkup || 0,
        maxMarkup: data.maxMarkup || 0,
        costBasis: data.costBasis || 'full-cost',
        approvalRequired: data.approvalRequired ?? false,
        approvalThreshold: data.approvalThreshold || 0,
        status: data.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      MOCK_MARKUP_SETTINGS.push(newSetting);
      return newSetting;
    }
  }

  async findAll(
    companyId: string,
    filters?: { category?: string; status?: MarkupStatus }
  ): Promise<MarkupSetting[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.status) params.append('status', filters.status);
      const query = params.toString();
      const response = await apiClient.get<MarkupSetting[]>(
        query ? `${this.baseUrl}?${query}` : this.baseUrl
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching markup settings, using mock data:', error);
      let result = MOCK_MARKUP_SETTINGS.filter((s) => s.companyId === companyId);
      if (filters?.category) {
        result = result.filter((s) => s.category === filters.category);
      }
      if (filters?.status) {
        result = result.filter((s) => s.status === filters.status);
      }
      return result;
    }
  }

  async findOne(companyId: string, id: string): Promise<MarkupSetting> {
    try {
      const response = await apiClient.get<MarkupSetting>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching markup setting, using mock data:', error);
      const setting = MOCK_MARKUP_SETTINGS.find((s) => s.id === id);
      if (!setting) throw new Error(`Markup Setting with ID ${id} not found`);
      return setting;
    }
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<MarkupSetting>
  ): Promise<MarkupSetting> {
    try {
      const response = await apiClient.patch<MarkupSetting>(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('API Error updating markup setting, using mock data:', error);
      const index = MOCK_MARKUP_SETTINGS.findIndex((s) => s.id === id);
      if (index === -1) throw new Error(`Markup Setting with ID ${id} not found`);
      MOCK_MARKUP_SETTINGS[index] = {
        ...MOCK_MARKUP_SETTINGS[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return MOCK_MARKUP_SETTINGS[index];
    }
  }

  async delete(companyId: string, id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('API Error deleting markup setting, using mock data:', error);
      const index = MOCK_MARKUP_SETTINGS.findIndex((s) => s.id === id);
      if (index !== -1) {
        MOCK_MARKUP_SETTINGS.splice(index, 1);
      }
    }
  }
}

export const estimationMarkupSettingService = new EstimationMarkupSettingService();
