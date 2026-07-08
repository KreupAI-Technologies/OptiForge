/**
 * Quality Service
 * Typed API client for quality domain endpoints (NestJS, port 3001).
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// ============================================================================
// Rework Items
// ============================================================================

export interface ReworkItemDto {
  id: string;
  reworkCode?: string;
  defectId?: string;
  projectId?: string;
  component: string;
  defectType?: string;
  priority?: string;
  assignedTo?: string;
  status?: string;
  iterations?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class QualityService {
  static async getReworkItems(filters?: {
    status?: string;
    priority?: string;
    projectId?: string;
  }): Promise<ReworkItemDto[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.projectId) params.set('projectId', filters.projectId);
    const qs = params.toString();
    return request<ReworkItemDto[]>(
      `/quality/rework-items${qs ? `?${qs}` : ''}`,
    );
  }

  static async updateReworkItem(
    id: string,
    data: Partial<ReworkItemDto>,
  ): Promise<ReworkItemDto> {
    return request<ReworkItemDto>(`/quality/rework-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const qualityService = QualityService;
