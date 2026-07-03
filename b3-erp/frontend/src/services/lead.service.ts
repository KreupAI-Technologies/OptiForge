/**
 * Lead Service
 * Handles all lead-related API operations for the CRM module
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false; // Set to false to use backend

// ============================================================================
// Interfaces
// ============================================================================

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: string;
  value: number;
  assignedTo: string;
  createdAt: string;
  lastContact: string;
}

export interface CreateLeadDto {
  name: string;
  company: string;
  email: string;
  phone: string;
  status?: LeadStatus;
  source: string;
  value: number;
  assignedTo: string;
}

export interface UpdateLeadDto extends Partial<CreateLeadDto> { }

export interface LeadFilters {
  status?: LeadStatus;
  source?: string;
  assignedTo?: string;
  search?: string;
  valueMin?: number;
  valueMax?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'status_change' | 'task' | 'proposal' | 'video_call';
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
  metadata?: {
    previousStatus?: string;
    newStatus?: string;
    duration?: string;
    outcome?: string;
    attachments?: number;
  };
}

// ============================================================================
// Mock Data
// ============================================================================

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'John Smith',
    company: 'Tech Solutions Inc',
    email: 'john.smith@techsolutions.com',
    phone: '+1 234-567-8900',
    status: 'qualified',
    source: 'Website',
    value: 45000,
    assignedTo: 'Sarah Johnson',
    createdAt: '2025-10-01',
    lastContact: '2025-10-08',
  },
  {
    id: '2',
    name: 'Emily Davis',
    company: 'Global Manufacturing Ltd',
    email: 'emily.davis@globalmanuf.com',
    phone: '+1 234-567-8901',
    status: 'new',
    source: 'Referral',
    value: 75000,
    assignedTo: 'Michael Chen',
    createdAt: '2025-10-05',
    lastContact: '2025-10-05',
  },
  {
    id: '3',
    name: 'Robert Wilson',
    company: 'Precision Parts Co',
    email: 'r.wilson@precisionparts.com',
    phone: '+1 234-567-8902',
    status: 'proposal',
    source: 'Trade Show',
    value: 120000,
    assignedTo: 'Sarah Johnson',
    createdAt: '2025-09-28',
    lastContact: '2025-10-07',
  },
  {
    id: '4',
    name: 'Lisa Anderson',
    company: 'Industrial Automation Inc',
    email: 'l.anderson@indauto.com',
    phone: '+1 234-567-8903',
    status: 'negotiation',
    source: 'LinkedIn',
    value: 95000,
    assignedTo: 'David Park',
    createdAt: '2025-09-15',
    lastContact: '2025-10-09',
  },
  {
    id: '5',
    name: 'James Martinez',
    company: 'Smart Systems Corp',
    email: 'j.martinez@smartsys.com',
    phone: '+1 234-567-8904',
    status: 'contacted',
    source: 'Cold Call',
    value: 60000,
    assignedTo: 'Michael Chen',
    createdAt: '2025-10-03',
    lastContact: '2025-10-06',
  },
];

export const MOCK_LEAD_ACTIVITIES: LeadActivity[] = [
  {
    id: 'a1',
    leadId: '1',
    type: 'status_change',
    title: 'Status Changed',
    description: 'Lead status updated from "Contacted" to "Qualified"',
    performedBy: 'Sarah Johnson',
    timestamp: '2025-10-08 14:30',
    metadata: { previousStatus: 'contacted', newStatus: 'qualified' }
  },
  {
    id: 'a2',
    leadId: '1',
    type: 'call',
    title: 'Phone Call',
    description: 'Discussed product requirements and pricing options. Client is interested in modular kitchen solutions.',
    performedBy: 'Sarah Johnson',
    timestamp: '2025-10-08 10:15',
    metadata: { duration: '45 mins', outcome: 'Positive' }
  },
  {
    id: 'a3',
    leadId: '1',
    type: 'email',
    title: 'Email Sent',
    description: 'Sent product catalog and pricing information',
    performedBy: 'Sarah Johnson',
    timestamp: '2025-10-07 16:20',
    metadata: { attachments: 3 }
  },
  {
    id: 'a4',
    leadId: '1',
    type: 'meeting',
    title: 'Site Visit Scheduled',
    description: 'Arranged site visit for kitchen measurement and design consultation on Oct 15, 2025',
    performedBy: 'Sarah Johnson',
    timestamp: '2025-10-06 11:00',
    metadata: { duration: '2 hours' }
  },
  {
    id: 'a5',
    leadId: '1',
    type: 'note',
    title: 'Added Note',
    description: 'Client has a budget of $45K-50K. Looking for premium finish with granite countertops.',
    performedBy: 'Sarah Johnson',
    timestamp: '2025-10-05 09:30'
  },
  {
    id: 'a6',
    leadId: '1',
    type: 'call',
    title: 'Initial Contact',
    description: 'First contact call. Introduced our kitchen solutions and gathered basic requirements.',
    performedBy: 'Sarah Johnson',
    timestamp: '2025-10-02 14:45',
    metadata: { duration: '20 mins', outcome: 'Interested' }
  },
  {
    id: 'a7',
    leadId: '1',
    type: 'status_change',
    title: 'Lead Created',
    description: 'New lead created from website inquiry',
    performedBy: 'System',
    timestamp: '2025-10-01 09:00',
    metadata: { newStatus: 'new' }
  }
];

// ============================================================================
// Lead Service Class
// ============================================================================

export class LeadService {
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
   * Get all leads with optional filters
   */
  static async getAllLeads(filters?: LeadFilters): Promise<Lead[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredLeads = [...MOCK_LEADS];

      if (filters?.status) {
        filteredLeads = filteredLeads.filter((l) => l.status === filters.status);
      }
      if (filters?.source) {
        filteredLeads = filteredLeads.filter((l) => l.source === filters.source);
      }
      if (filters?.assignedTo) {
        filteredLeads = filteredLeads.filter((l) => l.assignedTo === filters.assignedTo);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredLeads = filteredLeads.filter(
          (l) =>
            l.name.toLowerCase().includes(searchLower) ||
            l.company.toLowerCase().includes(searchLower) ||
            l.email.toLowerCase().includes(searchLower)
        );
      }
      if (filters?.valueMin !== undefined) {
        filteredLeads = filteredLeads.filter((l) => l.value >= filters.valueMin!);
      }
      if (filters?.valueMax !== undefined) {
        filteredLeads = filteredLeads.filter((l) => l.value <= filters.valueMax!);
      }

      // Pagination
      if (filters?.page && filters?.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        filteredLeads = filteredLeads.slice(start, end);
      }

      return filteredLeads;
    }

    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.source) queryParams.set('source', filters.source);
    if (filters?.assignedTo) queryParams.set('assignedTo', filters.assignedTo);
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.page) queryParams.set('page', filters.page.toString());
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());

    return this.request<Lead[]>(`/crm/leads?${queryParams.toString()}`);
  }

  /**
   * Get lead by ID
   */
  static async getLeadById(id: string): Promise<Lead> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const lead = MOCK_LEADS.find((l) => l.id === id);
      if (!lead) throw new Error('Lead not found');
      return lead;
    }
    return this.request<Lead>(`/crm/leads/${id}`);
  }

  /**
   * Create a new lead
   */
  static async createLead(data: CreateLeadDto): Promise<Lead> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        ...data,
        status: data.status || 'new',
        createdAt: new Date().toISOString().split('T')[0],
        lastContact: new Date().toISOString().split('T')[0],
      };
      MOCK_LEADS.push(newLead);
      return newLead;
    }
    return this.request<Lead>('/crm/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing lead
   */
  static async updateLead(id: string, data: UpdateLeadDto): Promise<Lead> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_LEADS.findIndex((l) => l.id === id);
      if (index === -1) throw new Error('Lead not found');

      MOCK_LEADS[index] = {
        ...MOCK_LEADS[index],
        ...data,
        lastContact: new Date().toISOString().split('T')[0],
      };
      return MOCK_LEADS[index];
    }
    return this.request<Lead>(`/crm/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a lead
   */
  static async deleteLead(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_LEADS.findIndex((l) => l.id === id);
      if (index === -1) throw new Error('Lead not found');
      MOCK_LEADS.splice(index, 1);
      return;
    }
    await this.request<void>(`/crm/leads/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get lead activities
   */
  static async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return MOCK_LEAD_ACTIVITIES.filter((a) => a.leadId === leadId);
    }
    return this.request<LeadActivity[]>(`/crm/leads/${leadId}/activities`);
  }

  /**
   * Get lead statistics
   */
  static async getStatistics(): Promise<{
    totalLeads: number;
    newLeads: number;
    qualifiedLeads: number;
    totalValue: number;
    leadsByStatus: Record<string, number>;
    leadsBySource: Record<string, number>;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const leadsByStatus: Record<string, number> = {};
      const leadsBySource: Record<string, number> = {};

      MOCK_LEADS.forEach((lead) => {
        leadsByStatus[lead.status] = (leadsByStatus[lead.status] || 0) + 1;
        leadsBySource[lead.source] = (leadsBySource[lead.source] || 0) + 1;
      });

      return {
        totalLeads: MOCK_LEADS.length,
        newLeads: MOCK_LEADS.filter((l) => l.status === 'new').length,
        qualifiedLeads: MOCK_LEADS.filter((l) => l.status === 'qualified').length,
        totalValue: MOCK_LEADS.reduce((sum, l) => sum + l.value, 0),
        leadsByStatus,
        leadsBySource,
      };
    }

    return this.request<{
      totalLeads: number;
      newLeads: number;
      qualifiedLeads: number;
      totalValue: number;
      leadsByStatus: Record<string, number>;
      leadsBySource: Record<string, number>;
    }>('/crm/leads/stats');
  }

  /**
   * Get source analytics
   */
  static async getSourceAnalytics(): Promise<any[]> {
    return this.request<any[]>('/crm/leads/analytics/sources');
  }

  /**
   * Get conversion stats
   */
  static async getConversionStats(): Promise<any> {
    return this.request<any>('/crm/leads/analytics/conversion');
  }

  /**
   * Trigger auto-assignment for a lead
   */
  static async autoAssign(id: string): Promise<Lead> {
    return this.request<Lead>(`/crm/leads/${id}/auto-assign`, {
      method: 'POST',
    });
  }
}

// Export singleton instance
export const leadService = LeadService;
