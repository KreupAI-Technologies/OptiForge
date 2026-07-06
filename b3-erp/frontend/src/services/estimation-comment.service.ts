// Estimation Comments service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth: estimation/controllers/estimate-comment.controller.ts
//   @Controller('estimation/comments')

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

export interface EstimateComment {
  id: string;
  companyId: string;
  estimateId: string;
  authorId?: string;
  authorName?: string;
  message: string;
  commentType: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateEstimateCommentPayload = {
  estimateId: string;
  message: string;
  authorId?: string;
  authorName?: string;
  commentType?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-company-id': COMPANY_ID,
    },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${path}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export const estimationCommentService = {
  async getComments(estimateId: string): Promise<EstimateComment[]> {
    const data = await request<any>(
      `/estimation/comments?estimateId=${encodeURIComponent(estimateId)}`,
    );
    return Array.isArray(data) ? data : data?.data ?? [];
  },

  async createComment(
    payload: CreateEstimateCommentPayload,
  ): Promise<EstimateComment> {
    return request<EstimateComment>('/estimation/comments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteComment(id: string): Promise<void> {
    await request<void>(`/estimation/comments/${id}`, {
      method: 'DELETE',
    });
  },
};
