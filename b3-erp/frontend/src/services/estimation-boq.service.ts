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

// ==================== Service Class ====================

class EstimationBOQService {
  private baseUrl = '/estimation/boq';

  async create(data: { boq: Partial<BOQ>; items?: Partial<BOQItem>[] }): Promise<BOQ> {
    const response = await apiClient.post<BOQ>(this.baseUrl, data);
    return response.data;
  }

  async createFromTemplate(templateId: string, data: Partial<BOQ>): Promise<BOQ> {
    const response = await apiClient.post<BOQ>(
      `${this.baseUrl}/from-template/${templateId}`,
      data
    );
    return response.data;
  }

  async findAll(filters?: { status?: BOQStatus; clientName?: string }): Promise<BOQ[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.clientName) params.append('clientName', filters.clientName);

    const query = params.toString();
    const response = await apiClient.get<BOQ[]>(
      `${this.baseUrl}${query ? `?${query}` : ''}`
    );
    return Array.isArray(response.data) ? response.data : [];
  }

  async findOne(id: string): Promise<BOQ> {
    const response = await apiClient.get<BOQ>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async findItems(boqId: string): Promise<BOQItem[]> {
    const response = await apiClient.get<BOQItem[]>(`${this.baseUrl}/${boqId}/items`);
    return Array.isArray(response.data) ? response.data : [];
  }

  async getAnalysis(id: string): Promise<BOQAnalysis> {
    const response = await apiClient.get<BOQAnalysis>(`${this.baseUrl}/${id}/analysis`);
    return response.data;
  }

  async compareBOQs(boqId1: string, boqId2: string): Promise<BOQComparison> {
    const response = await apiClient.get<BOQComparison>(
      `${this.baseUrl}/compare/${boqId1}/${boqId2}`
    );
    return response.data;
  }

  async update(id: string, data: Partial<BOQ>): Promise<BOQ> {
    const response = await apiClient.patch<BOQ>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async submitForReview(id: string): Promise<BOQ> {
    const response = await apiClient.post<BOQ>(`${this.baseUrl}/${id}/submit`, {});
    return response.data;
  }

  async approve(id: string): Promise<BOQ> {
    const response = await apiClient.post<BOQ>(`${this.baseUrl}/${id}/approve`, {});
    return response.data;
  }

  async reject(id: string): Promise<BOQ> {
    const response = await apiClient.post<BOQ>(`${this.baseUrl}/${id}/reject`, {});
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const estimationBOQService = new EstimationBOQService();
