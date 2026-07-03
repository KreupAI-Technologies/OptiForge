import { apiClient } from './api/client';

// ==================== TypeScript Interfaces ====================

export type BOQStatus = 'Draft' | 'Under Review' | 'Approved' | 'Rejected';

export interface BOQ {
  id: string;
  boqNumber: string;
  projectName: string;
  clientName: string;
  projectLocation: string;
  projectDuration?: string;
  currency: string;
  estimatedValue: number;
  notes?: string;
  status: BOQStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BOQItem {
  id: string;
  boqId: string;
  itemNo: string;
  description: string;
  unit: string;
  quantity: number;
  unitRate: number;
  totalAmount: number;
  specifications?: string;
  category: string;
}

export interface BOQAnalysis {
  boq: BOQ;
  items: BOQItem[];
  summary: {
    totalItems: number;
    totalAmount: number;
    byCategory: { category: string; itemCount: number; totalAmount: number }[];
    topItems: { description: string; totalAmount: number; percentage: number }[];
  };
}

export interface BOQComparison {
  boq1: BOQ;
  boq2: BOQ;
  comparison: {
    valueDifference: number;
    percentageDifference: number;
    itemDifferences: {
      itemNo: string;
      description: string;
      boq1Quantity: number;
      boq2Quantity: number;
      boq1Amount: number;
      boq2Amount: number;
      difference: number;
    }[];
    onlyInBOQ1: BOQItem[];
    onlyInBOQ2: BOQItem[];
  };
}

// ==================== Mock Data ====================

const MOCK_BOQS: BOQ[] = [
  {
    id: 'boq-001',
    boqNumber: 'BOQ-2025-0001',
    projectName: 'Office Building Construction',
    clientName: 'ABC Corporation',
    projectLocation: 'New York, NY',
    projectDuration: '18 months',
    currency: 'USD',
    estimatedValue: 2500000,
    status: 'Approved',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-20T14:30:00Z',
  },
  {
    id: 'boq-002',
    boqNumber: 'BOQ-2025-0002',
    projectName: 'Warehouse Renovation',
    clientName: 'XYZ Logistics',
    projectLocation: 'Chicago, IL',
    projectDuration: '6 months',
    currency: 'USD',
    estimatedValue: 850000,
    status: 'Under Review',
    createdAt: '2025-01-25T09:00:00Z',
    updatedAt: '2025-01-28T11:00:00Z',
  },
  {
    id: 'boq-003',
    boqNumber: 'BOQ-2025-0003',
    projectName: 'Shopping Mall Interior',
    clientName: 'Retail Partners Inc',
    projectLocation: 'Los Angeles, CA',
    projectDuration: '12 months',
    currency: 'USD',
    estimatedValue: 4200000,
    status: 'Draft',
    createdAt: '2025-02-01T08:00:00Z',
    updatedAt: '2025-02-05T16:00:00Z',
  },
];

const MOCK_BOQ_ITEMS: BOQItem[] = [
  {
    id: 'item-001',
    boqId: 'boq-001',
    itemNo: '1.1',
    description: 'Site Preparation and Clearing',
    unit: 'SQ M',
    quantity: 5000,
    unitRate: 15,
    totalAmount: 75000,
    category: 'Site Work',
  },
  {
    id: 'item-002',
    boqId: 'boq-001',
    itemNo: '1.2',
    description: 'Foundation Excavation',
    unit: 'CU M',
    quantity: 1200,
    unitRate: 45,
    totalAmount: 54000,
    category: 'Site Work',
  },
  {
    id: 'item-003',
    boqId: 'boq-001',
    itemNo: '2.1',
    description: 'Reinforced Concrete Foundation',
    unit: 'CU M',
    quantity: 800,
    unitRate: 350,
    totalAmount: 280000,
    category: 'Structure',
  },
  {
    id: 'item-004',
    boqId: 'boq-001',
    itemNo: '2.2',
    description: 'Structural Steel Frame',
    unit: 'TON',
    quantity: 150,
    unitRate: 2500,
    totalAmount: 375000,
    category: 'Structure',
  },
  {
    id: 'item-005',
    boqId: 'boq-001',
    itemNo: '3.1',
    description: 'Exterior Glazing System',
    unit: 'SQ M',
    quantity: 3000,
    unitRate: 180,
    totalAmount: 540000,
    category: 'Facade',
  },
];

// ==================== Service Class ====================

class EstimationBOQService {
  private baseUrl = '/estimation/boq';

  async create(data: { boq: Partial<BOQ>; items?: Partial<BOQItem>[] }): Promise<BOQ> {
    try {
      const response = await apiClient.post<BOQ>(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.error('API Error creating BOQ, using mock data:', error);
      const newBOQ: BOQ = {
        id: `boq-${Date.now()}`,
        boqNumber: `BOQ-2025-${String(MOCK_BOQS.length + 1).padStart(4, '0')}`,
        projectName: data.boq.projectName || 'New Project',
        clientName: data.boq.clientName || 'Client',
        projectLocation: data.boq.projectLocation || 'Location',
        currency: data.boq.currency || 'USD',
        estimatedValue: 0,
        status: 'Draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_BOQS.push(newBOQ);
      return newBOQ;
    }
  }

  async createFromTemplate(templateId: string, data: Partial<BOQ>): Promise<BOQ> {
    try {
      const response = await apiClient.post<BOQ>(
        `${this.baseUrl}/from-template/${templateId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('API Error creating BOQ from template:', error);
      return this.create({ boq: data });
    }
  }

  async findAll(filters?: { status?: BOQStatus; clientName?: string }): Promise<BOQ[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.clientName) params.append('clientName', filters.clientName);

      const response = await apiClient.get<BOQ[]>(`${this.baseUrl}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching BOQs, using mock data:', error);
      let result = [...MOCK_BOQS];
      if (filters?.status) {
        result = result.filter((b) => b.status === filters.status);
      }
      if (filters?.clientName) {
        result = result.filter((b) =>
          b.clientName.toLowerCase().includes(filters.clientName!.toLowerCase())
        );
      }
      return result;
    }
  }

  async findOne(id: string): Promise<BOQ> {
    try {
      const response = await apiClient.get<BOQ>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching BOQ, using mock data:', error);
      const boq = MOCK_BOQS.find((b) => b.id === id);
      if (!boq) throw new Error(`BOQ with ID ${id} not found`);
      return boq;
    }
  }

  async findItems(boqId: string): Promise<BOQItem[]> {
    try {
      const response = await apiClient.get<BOQItem[]>(`${this.baseUrl}/${boqId}/items`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching BOQ items, using mock data:', error);
      return MOCK_BOQ_ITEMS.filter((i) => i.boqId === boqId);
    }
  }

  async getAnalysis(id: string): Promise<BOQAnalysis> {
    try {
      const response = await apiClient.get<BOQAnalysis>(`${this.baseUrl}/${id}/analysis`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching BOQ analysis, using mock data:', error);
      const boq = MOCK_BOQS.find((b) => b.id === id);
      const items = MOCK_BOQ_ITEMS.filter((i) => i.boqId === id);

      if (!boq) throw new Error(`BOQ with ID ${id} not found`);

      const totalAmount = items.reduce((sum, i) => sum + i.totalAmount, 0);

      const categoryMap = new Map<string, { itemCount: number; totalAmount: number }>();
      items.forEach((item) => {
        const cat = categoryMap.get(item.category) || { itemCount: 0, totalAmount: 0 };
        cat.itemCount++;
        cat.totalAmount += item.totalAmount;
        categoryMap.set(item.category, cat);
      });

      return {
        boq,
        items,
        summary: {
          totalItems: items.length,
          totalAmount,
          byCategory: Array.from(categoryMap.entries()).map(([category, stats]) => ({
            category,
            ...stats,
          })),
          topItems: items
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, 5)
            .map((i) => ({
              description: i.description,
              totalAmount: i.totalAmount,
              percentage: totalAmount > 0 ? (i.totalAmount / totalAmount) * 100 : 0,
            })),
        },
      };
    }
  }

  async compareBOQs(boqId1: string, boqId2: string): Promise<BOQComparison> {
    try {
      const response = await apiClient.get<BOQComparison>(
        `${this.baseUrl}/compare/${boqId1}/${boqId2}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error comparing BOQs, using mock data:', error);
      const boq1 = MOCK_BOQS.find((b) => b.id === boqId1);
      const boq2 = MOCK_BOQS.find((b) => b.id === boqId2);

      if (!boq1 || !boq2) throw new Error('BOQs not found');

      return {
        boq1,
        boq2,
        comparison: {
          valueDifference: boq2.estimatedValue - boq1.estimatedValue,
          percentageDifference:
            boq1.estimatedValue > 0
              ? ((boq2.estimatedValue - boq1.estimatedValue) / boq1.estimatedValue) * 100
              : 0,
          itemDifferences: [],
          onlyInBOQ1: [],
          onlyInBOQ2: [],
        },
      };
    }
  }

  async update(id: string, data: Partial<BOQ>): Promise<BOQ> {
    try {
      const response = await apiClient.patch<BOQ>(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('API Error updating BOQ, using mock data:', error);
      const index = MOCK_BOQS.findIndex((b) => b.id === id);
      if (index === -1) throw new Error(`BOQ with ID ${id} not found`);
      MOCK_BOQS[index] = { ...MOCK_BOQS[index], ...data, updatedAt: new Date().toISOString() };
      return MOCK_BOQS[index];
    }
  }

  async submitForReview(id: string): Promise<BOQ> {
    try {
      const response = await apiClient.post<BOQ>(`${this.baseUrl}/${id}/submit`, {});
      return response.data;
    } catch (error) {
      console.error('API Error submitting BOQ for review:', error);
      return this.update(id, { status: 'Under Review' });
    }
  }

  async approve(id: string): Promise<BOQ> {
    try {
      const response = await apiClient.post<BOQ>(`${this.baseUrl}/${id}/approve`, {});
      return response.data;
    } catch (error) {
      console.error('API Error approving BOQ:', error);
      return this.update(id, { status: 'Approved' });
    }
  }

  async reject(id: string): Promise<BOQ> {
    try {
      const response = await apiClient.post<BOQ>(`${this.baseUrl}/${id}/reject`, {});
      return response.data;
    } catch (error) {
      console.error('API Error rejecting BOQ:', error);
      return this.update(id, { status: 'Rejected' });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('API Error deleting BOQ, using mock data:', error);
      const index = MOCK_BOQS.findIndex((b) => b.id === id);
      if (index !== -1) {
        MOCK_BOQS.splice(index, 1);
      }
    }
  }
}

export const estimationBOQService = new EstimationBOQService();
