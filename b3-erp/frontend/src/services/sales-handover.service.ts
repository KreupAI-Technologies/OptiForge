import { apiClient } from './api/client';

// ============== Interfaces ==============

export interface Handover {
  id: string;
  companyId?: string;
  handoverNumber: string;
  projectNumber?: string;
  projectName: string;
  customer?: string;
  salesPerson?: string;
  projectManager?: string;
  handoverDate?: string;
  status: string;
  completionPercentage: number;
  documentsAttached: number;
  requiredDocuments: number;
  clientRequestDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HandoverPackageDocument {
  id: string;
  companyId?: string;
  projectId?: string;
  projectNumber?: string;
  projectName?: string;
  customer?: string;
  name: string;
  type?: string;
  status: string;
  uploadDate?: string;
  uploadedBy?: string;
  content?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ============== Service ==============

class SalesHandoverService {
  async getHandovers(filters?: {
    companyId?: string;
    status?: string;
  }): Promise<Handover[]> {
    const params = new URLSearchParams();
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.status) params.append('status', filters.status);
    const qs = params.toString();
    const response = await apiClient.get<Handover[]>(
      `/sales/handovers${qs ? `?${qs}` : ''}`,
    );
    return response.data;
  }

  async getPackageDocuments(filters?: {
    companyId?: string;
    projectId?: string;
    status?: string;
  }): Promise<HandoverPackageDocument[]> {
    const params = new URLSearchParams();
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.status) params.append('status', filters.status);
    const qs = params.toString();
    const response = await apiClient.get<HandoverPackageDocument[]>(
      `/sales/handover-packages${qs ? `?${qs}` : ''}`,
    );
    return response.data;
  }
}

export const salesHandoverService = new SalesHandoverService();
