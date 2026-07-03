/**
 * Opportunity Service
 * Handles all opportunity-related API operations for the CRM module
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Interfaces
// ============================================================================

export type OpportunityStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Opportunity {
  id: string;
  name: string;
  account: string;
  stage: OpportunityStage;
  amount: number;
  probability: number;
  expectedCloseDate: string;
  owner: string;
  createdAt: string;
  winReason?: string;
  lossReason?: string;
  competitor?: string;
}

export interface CreateOpportunityDto {
  name: string;
  account: string;
  stage?: OpportunityStage;
  amount: number;
  probability: number;
  expectedCloseDate: string;
  owner: string;
}

export interface UpdateOpportunityDto extends Partial<CreateOpportunityDto> {
  winReason?: string;
  lossReason?: string;
  competitor?: string;
}

export interface OpportunityFilters {
  stage?: OpportunityStage;
  owner?: string;
  search?: string;
  amountMin?: number;
  amountMax?: number;
  probabilityMin?: number;
  probabilityMax?: number;
  closeDateFrom?: string;
  closeDateTo?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Mock Data
// ============================================================================

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    name: 'Premium Kitchen Installation - Luxury Apartments',
    account: 'Skyline Properties Inc',
    stage: 'proposal',
    amount: 350000,
    probability: 70,
    expectedCloseDate: '2025-11-15',
    owner: 'Sarah Johnson',
    createdAt: '2025-09-15',
  },
  {
    id: '2',
    name: 'Commercial Kitchen Equipment - Restaurant Chain',
    account: 'Golden Fork Restaurants',
    stage: 'negotiation',
    amount: 580000,
    probability: 85,
    expectedCloseDate: '2025-10-30',
    owner: 'Michael Chen',
    createdAt: '2025-08-20',
  },
  {
    id: '3',
    name: 'Modular Kitchen Solutions - Office Complex',
    account: 'Tech Solutions Inc',
    stage: 'qualification',
    amount: 125000,
    probability: 50,
    expectedCloseDate: '2025-12-20',
    owner: 'Sarah Johnson',
    createdAt: '2025-10-01',
  },
  {
    id: '4',
    name: 'Custom Cabinetry - Residential Development',
    account: 'Urban Living Developers',
    stage: 'closed_won',
    amount: 425000,
    probability: 100,
    expectedCloseDate: '2025-10-05',
    owner: 'David Park',
    createdAt: '2025-07-10',
    winReason: 'Competitive pricing and superior design quality',
  },
  {
    id: '5',
    name: 'Kitchen Renovation - Hotel Chain',
    account: 'Grand Stay Hotels',
    stage: 'prospecting',
    amount: 750000,
    probability: 30,
    expectedCloseDate: '2026-01-15',
    owner: 'Emily Davis',
    createdAt: '2025-10-05',
  },
];

// ============================================================================
// Opportunity Service Class
// ============================================================================

export class OpportunityService {
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
   * Get all opportunities with optional filters
   */
  static async getAllOpportunities(filters?: OpportunityFilters): Promise<Opportunity[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredOpportunities = [...MOCK_OPPORTUNITIES];

      if (filters?.stage) {
        filteredOpportunities = filteredOpportunities.filter((o) => o.stage === filters.stage);
      }
      if (filters?.owner) {
        filteredOpportunities = filteredOpportunities.filter((o) => o.owner === filters.owner);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredOpportunities = filteredOpportunities.filter(
          (o) =>
            o.name.toLowerCase().includes(searchLower) ||
            o.account.toLowerCase().includes(searchLower)
        );
      }
      if (filters?.amountMin !== undefined) {
        filteredOpportunities = filteredOpportunities.filter((o) => o.amount >= filters.amountMin!);
      }
      if (filters?.amountMax !== undefined) {
        filteredOpportunities = filteredOpportunities.filter((o) => o.amount <= filters.amountMax!);
      }
      if (filters?.probabilityMin !== undefined) {
        filteredOpportunities = filteredOpportunities.filter((o) => o.probability >= filters.probabilityMin!);
      }
      if (filters?.probabilityMax !== undefined) {
        filteredOpportunities = filteredOpportunities.filter((o) => o.probability <= filters.probabilityMax!);
      }

      // Pagination
      if (filters?.page && filters?.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        filteredOpportunities = filteredOpportunities.slice(start, end);
      }

      return filteredOpportunities;
    }

    const queryParams = new URLSearchParams();
    if (filters?.stage) queryParams.set('stage', filters.stage);
    if (filters?.owner) queryParams.set('owner', filters.owner);
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.page) queryParams.set('page', filters.page.toString());
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());

    return this.request<Opportunity[]>(`/crm/opportunities?${queryParams.toString()}`);
  }

  /**
   * Get opportunity by ID
   */
  static async getOpportunityById(id: string): Promise<Opportunity> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const opportunity = MOCK_OPPORTUNITIES.find((o) => o.id === id);
      if (!opportunity) throw new Error('Opportunity not found');
      return opportunity;
    }
    return this.request<Opportunity>(`/crm/opportunities/${id}`);
  }

  /**
   * Create a new opportunity
   */
  static async createOpportunity(data: CreateOpportunityDto): Promise<Opportunity> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newOpportunity: Opportunity = {
        id: `opp-${Date.now()}`,
        ...data,
        stage: data.stage || 'prospecting',
        createdAt: new Date().toISOString().split('T')[0],
      };
      MOCK_OPPORTUNITIES.push(newOpportunity);
      return newOpportunity;
    }
    return this.request<Opportunity>('/crm/opportunities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing opportunity
   */
  static async updateOpportunity(id: string, data: UpdateOpportunityDto): Promise<Opportunity> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_OPPORTUNITIES.findIndex((o) => o.id === id);
      if (index === -1) throw new Error('Opportunity not found');

      MOCK_OPPORTUNITIES[index] = {
        ...MOCK_OPPORTUNITIES[index],
        ...data,
      };
      return MOCK_OPPORTUNITIES[index];
    }
    return this.request<Opportunity>(`/crm/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete an opportunity
   */
  static async deleteOpportunity(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_OPPORTUNITIES.findIndex((o) => o.id === id);
      if (index === -1) throw new Error('Opportunity not found');
      MOCK_OPPORTUNITIES.splice(index, 1);
      return;
    }
    await this.request<void>(`/crm/opportunities/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get opportunity statistics
   */
  static async getStatistics(): Promise<{
    totalOpportunities: number;
    openOpportunities: number;
    wonThisMonth: number;
    lostThisMonth: number;
    totalPipeline: number;
    wonValue: number;
    opportunitiesByStage: Record<string, number>;
    opportunitiesByOwner: Record<string, number>;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const opportunitiesByStage: Record<string, number> = {};
      const opportunitiesByOwner: Record<string, number> = {};

      MOCK_OPPORTUNITIES.forEach((opp) => {
        opportunitiesByStage[opp.stage] = (opportunitiesByStage[opp.stage] || 0) + 1;
        opportunitiesByOwner[opp.owner] = (opportunitiesByOwner[opp.owner] || 0) + 1;
      });

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const wonThisMonth = MOCK_OPPORTUNITIES.filter((o) => {
        if (o.stage !== 'closed_won') return false;
        const closeDate = new Date(o.expectedCloseDate);
        return closeDate >= thisMonth;
      }).length;

      const lostThisMonth = MOCK_OPPORTUNITIES.filter((o) => {
        if (o.stage !== 'closed_lost') return false;
        const closeDate = new Date(o.expectedCloseDate);
        return closeDate >= thisMonth;
      }).length;

      return {
        totalOpportunities: MOCK_OPPORTUNITIES.length,
        openOpportunities: MOCK_OPPORTUNITIES.filter(
          (o) => !['closed_won', 'closed_lost'].includes(o.stage)
        ).length,
        wonThisMonth,
        lostThisMonth,
        totalPipeline: MOCK_OPPORTUNITIES
          .filter((o) => !['closed_won', 'closed_lost'].includes(o.stage))
          .reduce((sum, o) => sum + o.amount, 0),
        wonValue: MOCK_OPPORTUNITIES
          .filter((o) => o.stage === 'closed_won')
          .reduce((sum, o) => sum + o.amount, 0),
        opportunitiesByStage,
        opportunitiesByOwner,
      };
    }

    return this.request<{
      totalOpportunities: number;
      openOpportunities: number;
      wonThisMonth: number;
      lostThisMonth: number;
      totalPipeline: number;
      wonValue: number;
      opportunitiesByStage: Record<string, number>;
      opportunitiesByOwner: Record<string, number>;
    }>('/crm/opportunities/statistics');
  }
}

// Export singleton instance
export const opportunityService = OpportunityService;
