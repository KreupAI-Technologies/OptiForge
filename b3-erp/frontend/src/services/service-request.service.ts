/**
 * Service Request Service
 * Handles all service request-related API operations for the After-Sales module
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Interfaces
// ============================================================================

export type ServiceRequestPriority = 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'P4 - Low';
export type ServiceRequestStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';
export type ServiceRequestChannel = 'Phone' | 'Email' | 'Web' | 'Mobile' | 'WhatsApp' | 'Chat';
export type SLAStatus = 'on_track' | 'at_risk' | 'breached' | 'met';

export interface ServiceRequest {
  id: string;
  ticketNumber: string;
  priority: ServiceRequestPriority;
  status: ServiceRequestStatus;
  customerId: string;
  customerName: string;
  issueDescription: string;
  channel: ServiceRequestChannel;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  responseDeadline: string;
  resolutionDeadline: string;
  slaStatus: SLAStatus;
  responseTime?: number;
  resolutionTime?: number;
  escalationLevel: number;
  equipmentModel?: string;
}

export interface CreateServiceRequestDto {
  priority: ServiceRequestPriority;
  customerId: string;
  customerName: string;
  issueDescription: string;
  channel: ServiceRequestChannel;
  equipmentModel?: string;
}

export interface UpdateServiceRequestDto extends Partial<CreateServiceRequestDto> {
  status?: ServiceRequestStatus;
  assignedTo?: string;
  assignedToName?: string;
}

export interface ServiceRequestFilters {
  status?: ServiceRequestStatus;
  priority?: ServiceRequestPriority;
  channel?: ServiceRequestChannel;
  slaStatus?: SLAStatus;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Mock Data
// ============================================================================

export const MOCK_SERVICE_REQUESTS: ServiceRequest[] = [
  {
    id: '1',
    ticketNumber: 'TICKET-2025-000123',
    priority: 'P1 - Critical',
    status: 'in_progress',
    customerId: 'CUST001',
    customerName: 'Sharma Modular Kitchens Pvt Ltd',
    issueDescription: 'Chimney motor not working - smoke entering kitchen',
    channel: 'Phone',
    assignedTo: 'ENG001',
    assignedToName: 'Rajesh Kumar',
    createdAt: '2025-10-17T09:30:00',
    responseDeadline: '2025-10-17T11:30:00',
    resolutionDeadline: '2025-10-17T15:30:00',
    slaStatus: 'on_track',
    responseTime: 0.5,
    escalationLevel: 0,
    equipmentModel: 'Chimney Auto Clean 90cm',
  },
  {
    id: '2',
    ticketNumber: 'TICKET-2025-000118',
    priority: 'P2 - High',
    status: 'acknowledged',
    customerId: 'CUST002',
    customerName: 'Prestige Developers Bangalore',
    issueDescription: 'Built-in oven temperature not reaching set level',
    channel: 'Email',
    assignedTo: 'ENG002',
    assignedToName: 'Amit Sharma',
    createdAt: '2025-10-17T08:00:00',
    responseDeadline: '2025-10-17T12:00:00',
    resolutionDeadline: '2025-10-18T08:00:00',
    slaStatus: 'on_track',
    responseTime: 2,
    escalationLevel: 0,
    equipmentModel: 'Built-in Oven 60L',
  },
  {
    id: '3',
    ticketNumber: 'TICKET-2025-000115',
    priority: 'P3 - Medium',
    status: 'resolved',
    customerId: 'CUST003',
    customerName: 'Urban Interiors & Designers',
    issueDescription: 'Hob auto-ignition not sparking on burner 3',
    channel: 'Web',
    assignedTo: 'ENG003',
    assignedToName: 'Priya Patel',
    createdAt: '2025-10-16T14:00:00',
    responseDeadline: '2025-10-16T22:00:00',
    resolutionDeadline: '2025-10-18T14:00:00',
    slaStatus: 'met',
    responseTime: 3,
    resolutionTime: 18,
    escalationLevel: 0,
    equipmentModel: 'Built-in Hob 4 Burner Gas',
  },
  {
    id: '4',
    ticketNumber: 'TICKET-2025-000089',
    priority: 'P1 - Critical',
    status: 'open',
    customerId: 'CUST004',
    customerName: 'Elite Contractors & Builders',
    issueDescription: 'Dishwasher water leaking - flooding issue',
    channel: 'Phone',
    createdAt: '2025-10-17T10:15:00',
    responseDeadline: '2025-10-17T12:15:00',
    resolutionDeadline: '2025-10-17T16:15:00',
    slaStatus: 'at_risk',
    escalationLevel: 1,
    equipmentModel: 'Dishwasher 14 Place Settings',
  },
  {
    id: '5',
    ticketNumber: 'TICKET-2025-000102',
    priority: 'P4 - Low',
    status: 'closed',
    customerId: 'CUST005',
    customerName: 'DLF Universal Projects',
    issueDescription: 'Microwave turntable making noise',
    channel: 'WhatsApp',
    assignedTo: 'ENG004',
    assignedToName: 'Sanjay Gupta',
    createdAt: '2025-10-15T11:00:00',
    responseDeadline: '2025-10-16T11:00:00',
    resolutionDeadline: '2025-10-18T11:00:00',
    slaStatus: 'met',
    responseTime: 20,
    resolutionTime: 48,
    escalationLevel: 0,
    equipmentModel: 'Microwave Oven 30L',
  },
  {
    id: '6',
    ticketNumber: 'TICKET-2025-000095',
    priority: 'P2 - High',
    status: 'in_progress',
    customerId: 'CUST006',
    customerName: 'Signature Interiors Pune',
    issueDescription: 'Induction hob not detecting cookware',
    channel: 'Mobile',
    assignedTo: 'ENG001',
    assignedToName: 'Rajesh Kumar',
    createdAt: '2025-10-16T16:00:00',
    responseDeadline: '2025-10-16T20:00:00',
    resolutionDeadline: '2025-10-17T16:00:00',
    slaStatus: 'breached',
    responseTime: 5,
    escalationLevel: 1,
    equipmentModel: 'Induction Hob 4 Burner',
  },
  {
    id: '7',
    ticketNumber: 'TICKET-2025-000077',
    priority: 'P3 - Medium',
    status: 'acknowledged',
    customerId: 'CUST007',
    customerName: 'Royal Homes Hyderabad',
    issueDescription: 'RO filter replacement required - TDS high',
    channel: 'Email',
    assignedTo: 'ENG005',
    assignedToName: 'Neha Singh',
    createdAt: '2025-10-17T07:00:00',
    responseDeadline: '2025-10-17T15:00:00',
    resolutionDeadline: '2025-10-19T07:00:00',
    slaStatus: 'on_track',
    responseTime: 4,
    escalationLevel: 0,
    equipmentModel: 'RO Water Purifier 10L',
  },
  {
    id: '8',
    ticketNumber: 'TICKET-2025-000134',
    priority: 'P2 - High',
    status: 'open',
    customerId: 'CUST008',
    customerName: 'Modern Living Ahmedabad',
    issueDescription: 'Chimney suction power reduced - not effective',
    channel: 'Chat',
    createdAt: '2025-10-17T09:00:00',
    responseDeadline: '2025-10-17T13:00:00',
    resolutionDeadline: '2025-10-18T09:00:00',
    slaStatus: 'on_track',
    escalationLevel: 0,
    equipmentModel: 'Chimney Curved Glass 60cm',
  },
];

// ============================================================================
// Service Request Service Class
// ============================================================================

export class ServiceRequestService {
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
   * Get all service requests with optional filters
   */
  static async getAllServiceRequests(filters?: ServiceRequestFilters): Promise<ServiceRequest[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredRequests = [...MOCK_SERVICE_REQUESTS];

      if (filters?.status) {
        filteredRequests = filteredRequests.filter((r) => r.status === filters.status);
      }
      if (filters?.priority) {
        filteredRequests = filteredRequests.filter((r) => r.priority === filters.priority);
      }
      if (filters?.channel) {
        filteredRequests = filteredRequests.filter((r) => r.channel === filters.channel);
      }
      if (filters?.slaStatus) {
        filteredRequests = filteredRequests.filter((r) => r.slaStatus === filters.slaStatus);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredRequests = filteredRequests.filter(
          (r) =>
            r.ticketNumber.toLowerCase().includes(searchLower) ||
            r.customerName.toLowerCase().includes(searchLower) ||
            r.issueDescription.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.page && filters?.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        filteredRequests = filteredRequests.slice(start, end);
      }

      return filteredRequests;
    }

    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.priority) queryParams.set('priority', filters.priority);
    if (filters?.channel) queryParams.set('channel', filters.channel);
    if (filters?.slaStatus) queryParams.set('slaStatus', filters.slaStatus);
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.page) queryParams.set('page', filters.page.toString());
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());

    return this.request<ServiceRequest[]>(`/after-sales/service-requests?${queryParams.toString()}`);
  }

  /**
   * Get service request by ID
   */
  static async getServiceRequestById(id: string): Promise<ServiceRequest> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const request = MOCK_SERVICE_REQUESTS.find((r) => r.id === id);
      if (!request) throw new Error('Service request not found');
      return request;
    }
    return this.request<ServiceRequest>(`/after-sales/service-requests/${id}`);
  }

  /**
   * Create a new service request
   */
  static async createServiceRequest(data: CreateServiceRequestDto): Promise<ServiceRequest> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const now = new Date();
      const newRequest: ServiceRequest = {
        id: `sr-${Date.now()}`,
        ticketNumber: `TICKET-${now.getFullYear()}-${String(MOCK_SERVICE_REQUESTS.length + 1).padStart(6, '0')}`,
        ...data,
        status: 'open',
        createdAt: now.toISOString(),
        responseDeadline: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
        resolutionDeadline: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        slaStatus: 'on_track',
        escalationLevel: 0,
      };
      MOCK_SERVICE_REQUESTS.push(newRequest);
      return newRequest;
    }
    return this.request<ServiceRequest>('/after-sales/service-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing service request
   */
  static async updateServiceRequest(id: string, data: UpdateServiceRequestDto): Promise<ServiceRequest> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_SERVICE_REQUESTS.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Service request not found');

      MOCK_SERVICE_REQUESTS[index] = {
        ...MOCK_SERVICE_REQUESTS[index],
        ...data,
      };
      return MOCK_SERVICE_REQUESTS[index];
    }
    return this.request<ServiceRequest>(`/after-sales/service-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Assign service request to an engineer (POST :id/assign)
   */
  static async assignServiceRequest(
    id: string,
    engineerId: string,
    engineerName: string,
    assignedBy = 'system',
  ): Promise<ServiceRequest> {
    return this.request<ServiceRequest>(`/after-sales/service-requests/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({
        assignedTo: engineerId,
        assignedToName: engineerName,
        assignedBy,
      }),
    });
  }

  /** Acknowledge a service request (POST :id/acknowledge) */
  static async acknowledgeServiceRequest(id: string, acknowledgedBy = 'system'): Promise<ServiceRequest> {
    return this.request<ServiceRequest>(`/after-sales/service-requests/${id}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ acknowledgedBy }),
    });
  }

  /** Start work on a service request (POST :id/start) */
  static async startServiceRequest(id: string, startedBy = 'system'): Promise<ServiceRequest> {
    return this.request<ServiceRequest>(`/after-sales/service-requests/${id}/start`, {
      method: 'POST',
      body: JSON.stringify({ startedBy }),
    });
  }

  /** Resolve a service request (POST :id/resolve) */
  static async resolveServiceRequest(
    id: string,
    resolution: string,
    resolvedBy = 'system',
    rootCause?: string,
  ): Promise<ServiceRequest> {
    return this.request<ServiceRequest>(`/after-sales/service-requests/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution, resolvedBy, rootCause }),
    });
  }

  /** Close a service request (POST :id/close) */
  static async closeServiceRequest(id: string, closedBy = 'system', closureNotes?: string): Promise<ServiceRequest> {
    return this.request<ServiceRequest>(`/after-sales/service-requests/${id}/close`, {
      method: 'POST',
      body: JSON.stringify({ closedBy, closureNotes }),
    });
  }

  /** Cancel a service request (POST :id/cancel) */
  static async cancelServiceRequest(
    id: string,
    cancellationReason: string,
    cancelledBy = 'system',
  ): Promise<ServiceRequest> {
    return this.request<ServiceRequest>(`/after-sales/service-requests/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ cancellationReason, cancelledBy }),
    });
  }

  /**
   * Get service request statistics
   */
  static async getStatistics(): Promise<{
    totalRequests: number;
    openRequests: number;
    slaBreached: number;
    p1Critical: number;
    avgResponseTime: number;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const activeStatuses: ServiceRequestStatus[] = ['open', 'acknowledged', 'in_progress'];
      const requestsWithResponse = MOCK_SERVICE_REQUESTS.filter((r) => r.responseTime);

      return {
        totalRequests: MOCK_SERVICE_REQUESTS.length,
        openRequests: MOCK_SERVICE_REQUESTS.filter((r) => activeStatuses.includes(r.status)).length,
        slaBreached: MOCK_SERVICE_REQUESTS.filter((r) => r.slaStatus === 'breached').length,
        p1Critical: MOCK_SERVICE_REQUESTS.filter(
          (r) => r.priority === 'P1 - Critical' && activeStatuses.includes(r.status)
        ).length,
        avgResponseTime:
          requestsWithResponse.length > 0
            ? requestsWithResponse.reduce((sum, r) => sum + (r.responseTime || 0), 0) / requestsWithResponse.length
            : 0,
      };
    }

    return this.request<{
      totalRequests: number;
      openRequests: number;
      slaBreached: number;
      p1Critical: number;
      avgResponseTime: number;
    }>('/after-sales/service-requests/statistics');
  }
}

export const serviceRequestService = ServiceRequestService;
