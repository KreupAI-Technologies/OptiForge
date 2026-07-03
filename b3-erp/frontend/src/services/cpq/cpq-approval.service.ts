import { apiClient } from '../api/client';

// ==================== TypeScript Interfaces ====================

export type ApprovalCategory =
  | 'quote'
  | 'contract'
  | 'discount'
  | 'legal'
  | 'executive'
  | 'proposal';

export type ApprovalItemStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'escalated';

export type ApprovalItemPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Generic CPQ approval-queue row. Page-specific fields (approval chain,
 * comments, discount %, etc.) are carried in the flexible `payload` object.
 */
export interface CPQApprovalItem {
  id: string;
  companyId: string;
  category: ApprovalCategory;
  reference: string | null;
  title: string | null;
  customerName: string | null;
  value: number | null;
  requestedBy: string | null;
  status: ApprovalItemStatus;
  priority: ApprovalItemPriority;
  reason: string | null;
  dueDate: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

// ==================== Service ====================

class CPQApprovalService {
  private readonly baseUrl = '/cpq/approval-items';

  async findAll(filters?: {
    category?: ApprovalCategory;
    status?: ApprovalItemStatus;
  }): Promise<CPQApprovalItem[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.status) params.append('status', filters.status);
      const qs = params.toString();
      const response = await apiClient.get<CPQApprovalItem[]>(
        qs ? `${this.baseUrl}?${qs}` : this.baseUrl,
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      // Safe empty fallback keeps the page rendering during API downtime.
      return [];
    }
  }

  async findOne(id: string): Promise<CPQApprovalItem | null> {
    try {
      const response = await apiClient.get<CPQApprovalItem>(
        `${this.baseUrl}/${id}`,
      );
      return response.data ?? null;
    } catch {
      return null;
    }
  }

  async create(
    data: Partial<CPQApprovalItem>,
  ): Promise<CPQApprovalItem | null> {
    try {
      const response = await apiClient.post<CPQApprovalItem>(this.baseUrl, data);
      return response.data ?? null;
    } catch {
      return null;
    }
  }

  async decide(
    id: string,
    status: ApprovalItemStatus,
  ): Promise<CPQApprovalItem | null> {
    try {
      const response = await apiClient.post<CPQApprovalItem>(
        `${this.baseUrl}/${id}/decision`,
        { status },
      );
      return response.data ?? null;
    } catch {
      return null;
    }
  }
}

export const cpqApprovalService = new CPQApprovalService();
