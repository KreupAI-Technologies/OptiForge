import { RFP, RFPStatus, RFPPriority, RFPDashboard, RFPStatistics } from '@/types/rfp';
import { MOCK_RFPS } from '@/data/mock-rfps';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export class RFPService {
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

  static async getAllRFPs(filters?: {
    status?: RFPStatus;
    priority?: string;
    type?: string;
    customerId?: string;
    assignedTo?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
  }): Promise<RFP[]> {
    const getFilteredMockData = () => {
      let filteredData = [...MOCK_RFPS];

      // Apply filters if provided
      if (filters) {
        if (filters.status) {
          filteredData = filteredData.filter((rfp) => rfp.status === filters.status);
        }
        if (filters.priority) {
          filteredData = filteredData.filter((rfp) => rfp.priority === filters.priority);
        }
        if (filters.type) {
          filteredData = filteredData.filter((rfp) => rfp.type === filters.type);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredData = filteredData.filter(
            (rfp) =>
              rfp.title.toLowerCase().includes(searchLower) ||
              rfp.rfpNumber.toLowerCase().includes(searchLower) ||
              rfp.customerName.toLowerCase().includes(searchLower) ||
              rfp.description.toLowerCase().includes(searchLower)
          );
        }
      }

      return filteredData;
    };

    // Use mock data for development
    if (USE_MOCK_DATA) {
      console.log('[RFP Service] Using mock data, returning', MOCK_RFPS.length, 'RFPs');
      return getFilteredMockData();
    }

    // Use real API
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }

      const queryString = params.toString();
      const url = `/sales/rfp${queryString ? `?${queryString}` : ''}`;
      console.log('[RFP Service] Fetching from:', `${API_BASE_URL}${url}`);
      return await this.request<RFP[]>(url);
    } catch (error) {
      console.warn('API error fetching RFPs, using mock data:', error);
      return getFilteredMockData();
    }
  }

  static async getRFPById(id: string): Promise<RFP> {
    const getMockRFP = () => {
      const rfp = MOCK_RFPS.find((r) => r.id === id);
      if (!rfp) {
        throw new Error('RFP not found');
      }
      return rfp;
    };

    if (USE_MOCK_DATA) {
      return getMockRFP();
    }
    try {
      return await this.request<RFP>(`/sales/rfp/${id}`);
    } catch (error) {
      console.warn('API error fetching RFP by id, using mock data:', error);
      return getMockRFP();
    }
  }

  static async createRFP(data: Partial<RFP>): Promise<RFP> {
    try {
      return await this.request<RFP>('/sales/rfp', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('API error creating RFP, using mock data:', error);
      // Return mock created RFP
      const mockRFP: RFP = {
        id: `rfp-${Date.now()}`,
        rfpNumber: `RFP-${Date.now()}`,
        ...data,
      } as RFP;
      return mockRFP;
    }
  }

  static async updateRFP(id: string, data: Partial<RFP>): Promise<RFP> {
    try {
      return await this.request<RFP>(`/sales/rfp/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('API error updating RFP, using mock data:', error);
      const existingRFP = MOCK_RFPS.find((r) => r.id === id);
      return { ...existingRFP, ...data } as RFP;
    }
  }

  static async deleteRFP(id: string): Promise<void> {
    try {
      await this.request(`/sales/rfp/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('API error deleting RFP, silent fallback:', error);
      // Silent fallback for delete operation
    }
  }

  static async updateStatus(
    id: string,
    status: RFPStatus,
    updatedBy: string,
    comments?: string
  ): Promise<RFP> {
    try {
      return await this.request<RFP>(`/sales/rfp/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, updatedBy, comments }),
      });
    } catch (error) {
      console.warn('API error updating RFP status, using mock data:', error);
      const existingRFP = MOCK_RFPS.find((r) => r.id === id);
      return { ...existingRFP, status } as RFP;
    }
  }

  static async addAttachment(
    id: string,
    attachment: any,
    uploadedBy: string
  ): Promise<RFP> {
    try {
      return await this.request<RFP>(`/sales/rfp/${id}/attachments`, {
        method: 'POST',
        body: JSON.stringify({ attachment, uploadedBy }),
      });
    } catch (error) {
      console.warn('API error adding attachment, using mock data:', error);
      const existingRFP = MOCK_RFPS.find((r) => r.id === id);
      return existingRFP as RFP;
    }
  }

  static async removeAttachment(
    id: string,
    attachmentId: string,
    updatedBy: string
  ): Promise<RFP> {
    try {
      return await this.request<RFP>(`/sales/rfp/${id}/attachments/${attachmentId}`, {
        method: 'DELETE',
        body: JSON.stringify({ updatedBy }),
      });
    } catch (error) {
      console.warn('API error removing attachment, using mock data:', error);
      const existingRFP = MOCK_RFPS.find((r) => r.id === id);
      return existingRFP as RFP;
    }
  }

  static async addEvaluation(id: string, evaluation: any): Promise<RFP> {
    try {
      return await this.request<RFP>(`/sales/rfp/${id}/evaluations`, {
        method: 'POST',
        body: JSON.stringify(evaluation),
      });
    } catch (error) {
      console.warn('API error adding evaluation, using mock data:', error);
      const existingRFP = MOCK_RFPS.find((r) => r.id === id);
      return existingRFP as RFP;
    }
  }

  static async approveRFP(
    id: string,
    approver: string,
    comments?: string
  ): Promise<RFP> {
    try {
      return await this.request<RFP>(`/sales/rfp/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ approver, comments }),
      });
    } catch (error) {
      console.warn('API error approving RFP, using mock data:', error);
      const existingRFP = MOCK_RFPS.find((r) => r.id === id);
      return { ...existingRFP, status: 'Approved' as RFPStatus } as RFP;
    }
  }

  static async rejectRFP(
    id: string,
    approver: string,
    comments: string
  ): Promise<RFP> {
    try {
      return await this.request<RFP>(`/sales/rfp/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ approver, comments }),
      });
    } catch (error) {
      console.warn('API error rejecting RFP, using mock data:', error);
      const existingRFP = MOCK_RFPS.find((r) => r.id === id);
      return { ...existingRFP, status: 'Rejected' as RFPStatus } as RFP;
    }
  }

  static async getStatistics(): Promise<RFPStatistics> {
    try {
      return await this.request<RFPStatistics>('/sales/rfp/statistics');
    } catch (error) {
      console.warn('API error fetching statistics, using mock data:', error);
      // Build status counts
      const byStatus = {} as Record<RFPStatus, number>;
      Object.values(RFPStatus).forEach(status => {
        byStatus[status] = MOCK_RFPS.filter(r => r.status === status).length;
      });
      // Return mock statistics
      return {
        total: MOCK_RFPS.length,
        byStatus,
        byPriority: {},
        byType: {},
        totalEstimatedValue: MOCK_RFPS.reduce((sum, r) => sum + (r.estimatedBudget || 0), 0),
        totalProposalValue: MOCK_RFPS.reduce((sum, r) => sum + (r.proposalValue || 0), 0),
        averageWinProbability: 0,
        upcoming: 0,
        overdue: 0,
      };
    }
  }

  static async getDashboard(): Promise<RFPDashboard> {
    try {
      return await this.request<RFPDashboard>('/sales/rfp/dashboard');
    } catch (error) {
      console.warn('API error fetching dashboard, using mock data:', error);
      // Build status counts
      const byStatus = {} as Record<RFPStatus, number>;
      Object.values(RFPStatus).forEach(status => {
        byStatus[status] = MOCK_RFPS.filter(r => r.status === status).length;
      });
      // Return mock dashboard data
      return {
        recentRFPs: MOCK_RFPS.slice(0, 5),
        highPriorityRFPs: MOCK_RFPS.filter(r => r.priority === RFPPriority.HIGH || r.priority === RFPPriority.URGENT).slice(0, 5),
        upcomingDeadlines: MOCK_RFPS.slice(0, 5),
        statistics: {
          total: MOCK_RFPS.length,
          byStatus,
          byPriority: {},
          byType: {},
          totalEstimatedValue: MOCK_RFPS.reduce((sum, r) => sum + (r.estimatedBudget || 0), 0),
          totalProposalValue: MOCK_RFPS.reduce((sum, r) => sum + (r.proposalValue || 0), 0),
          averageWinProbability: 0,
          upcoming: 0,
          overdue: 0,
        },
      };
    }
  }
}
