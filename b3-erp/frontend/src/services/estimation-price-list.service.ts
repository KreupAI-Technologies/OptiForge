import { apiClient } from './api/client';

// ==================== TypeScript Interfaces ====================

export type PriceListStatus = 'active' | 'inactive' | 'draft' | 'expired';
export type PriceListType = 'standard' | 'promotional' | 'bulk' | 'custom';

export interface PriceList {
  id: string;
  companyId: string;
  priceListName: string;
  description?: string;
  currency: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  status: PriceListStatus;
  totalItems: number;
  priceType: PriceListType;
  customerSegment?: string;
  lastUpdated?: string;
  updatedBy?: string;
  averageMargin: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== Mock Data ====================

const MOCK_PRICE_LISTS: PriceList[] = [
  {
    id: 'PL-001',
    companyId: 'company-001',
    priceListName: 'Standard Commercial Kitchen Equipment',
    description: 'Default pricing for all commercial kitchen products',
    currency: 'USD',
    effectiveFrom: '2025-01-01',
    effectiveTo: '2025-12-31',
    status: 'active',
    totalItems: 250,
    priceType: 'standard',
    customerSegment: 'All Customers',
    lastUpdated: '2025-10-15',
    updatedBy: 'John Pricing',
    averageMargin: 22.5,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-10-15T00:00:00Z',
  },
  {
    id: 'PL-002',
    companyId: 'company-001',
    priceListName: 'Q4 2025 Promotional Pricing',
    description: 'Year-end promotional offers',
    currency: 'USD',
    effectiveFrom: '2025-10-01',
    effectiveTo: '2025-12-31',
    status: 'active',
    totalItems: 95,
    priceType: 'promotional',
    customerSegment: 'All Customers',
    lastUpdated: '2025-10-01',
    updatedBy: 'Michael Marketing',
    averageMargin: 15.5,
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-10-01T00:00:00Z',
  },
];

// ==================== Service Class ====================

class EstimationPriceListService {
  private baseUrl = '/estimation/price-lists';

  async create(companyId: string, data: Partial<PriceList>): Promise<PriceList> {
    try {
      const response = await apiClient.post<PriceList>(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.error('API Error creating price list, using mock data:', error);
      const newPriceList: PriceList = {
        id: `PL-${Date.now()}`,
        companyId,
        priceListName: data.priceListName || 'New Price List',
        currency: data.currency || 'USD',
        status: data.status || 'draft',
        totalItems: data.totalItems || 0,
        priceType: data.priceType || 'standard',
        averageMargin: data.averageMargin || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      MOCK_PRICE_LISTS.push(newPriceList);
      return newPriceList;
    }
  }

  async findAll(
    companyId: string,
    filters?: { status?: PriceListStatus; priceType?: PriceListType }
  ): Promise<PriceList[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priceType) params.append('priceType', filters.priceType);
      const query = params.toString();
      const response = await apiClient.get<PriceList[]>(
        query ? `${this.baseUrl}?${query}` : this.baseUrl
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching price lists, using mock data:', error);
      let result = MOCK_PRICE_LISTS.filter((p) => p.companyId === companyId);
      if (filters?.status) {
        result = result.filter((p) => p.status === filters.status);
      }
      if (filters?.priceType) {
        result = result.filter((p) => p.priceType === filters.priceType);
      }
      return result;
    }
  }

  async findOne(companyId: string, id: string): Promise<PriceList> {
    try {
      const response = await apiClient.get<PriceList>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching price list, using mock data:', error);
      const priceList = MOCK_PRICE_LISTS.find((p) => p.id === id);
      if (!priceList) throw new Error(`Price List with ID ${id} not found`);
      return priceList;
    }
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<PriceList>
  ): Promise<PriceList> {
    try {
      const response = await apiClient.patch<PriceList>(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('API Error updating price list, using mock data:', error);
      const index = MOCK_PRICE_LISTS.findIndex((p) => p.id === id);
      if (index === -1) throw new Error(`Price List with ID ${id} not found`);
      MOCK_PRICE_LISTS[index] = {
        ...MOCK_PRICE_LISTS[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return MOCK_PRICE_LISTS[index];
    }
  }

  async delete(companyId: string, id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('API Error deleting price list, using mock data:', error);
      const index = MOCK_PRICE_LISTS.findIndex((p) => p.id === id);
      if (index !== -1) {
        MOCK_PRICE_LISTS.splice(index, 1);
      }
    }
  }
}

export const estimationPriceListService = new EstimationPriceListService();
