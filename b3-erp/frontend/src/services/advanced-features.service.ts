/**
 * Advanced Features Service
 * Thin fetch wrapper backing the /advanced-features AI Insights and OCR pages.
 *
 * Endpoints live on the NestJS domain backend under /api/v1 and return raw
 * JSON (no envelope). Tenant scoping via the `x-company-id` header +
 * a `companyId` query param, mirroring dashboard-overview.service.ts.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_DOMAIN_API_URL ||
  'http://localhost:3001/api/v1';

function getCompanyId(): string {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.companyId) return String(u.companyId);
      }
    } catch {
      /* ignore */
    }
  }
  return process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID || 'test';
}

async function request<T>(path: string): Promise<T> {
  const companyId = getCompanyId();
  const sep = path.includes('?') ? '&' : '?';
  const url = `${API_BASE_URL}${path}${sep}companyId=${encodeURIComponent(companyId)}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'x-company-id': companyId,
    },
  });
  if (!response.ok) {
    throw new Error(
      `Advanced Features API error ${response.status}: ${response.statusText}`,
    );
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : {}) as T;
}

// ---------------------------------------------------------------------------
// AI Insights
// ---------------------------------------------------------------------------
export interface AiInsight {
  id: string;
  companyId: string;
  category: string;
  title: string;
  description?: string | null;
  severity: string;
  confidence: number;
  module?: string | null;
  status: string;
  createdAt: string;
}

export interface AiInsightListResponse {
  data: AiInsight[];
  total: number;
}

export interface AiInsightStats {
  total: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  avgConfidence: number;
}

// ---------------------------------------------------------------------------
// OCR Documents
// ---------------------------------------------------------------------------
export interface OcrDocument {
  id: string;
  companyId: string;
  fileName: string;
  docType: string;
  status: string;
  extractedFields?: Record<string, unknown> | null;
  confidence: number;
  uploadedAt: string;
  processedAt?: string | null;
}

export interface OcrDocumentListResponse {
  data: OcrDocument[];
  total: number;
}

export interface OcrStats {
  total: number;
  byStatus: Record<string, number>;
  completed: number;
  processing: number;
  queued: number;
  failed: number;
  avgConfidence: number;
}

export const advancedFeaturesService = {
  async listInsights(): Promise<AiInsightListResponse> {
    const res = await request<Partial<AiInsightListResponse>>(
      '/advanced-features/ai-insights',
    );
    const data = Array.isArray(res?.data) ? (res!.data as AiInsight[]) : [];
    return { data, total: res?.total ?? data.length };
  },

  async insightStats(): Promise<AiInsightStats> {
    const res = await request<Partial<AiInsightStats>>(
      '/advanced-features/ai-insights/stats',
    );
    return {
      total: res?.total ?? 0,
      byCategory: res?.byCategory ?? {},
      bySeverity: res?.bySeverity ?? {},
      avgConfidence: res?.avgConfidence ?? 0,
    };
  },

  async listOcrDocuments(): Promise<OcrDocumentListResponse> {
    const res = await request<Partial<OcrDocumentListResponse>>(
      '/advanced-features/ocr-documents',
    );
    const data = Array.isArray(res?.data) ? (res!.data as OcrDocument[]) : [];
    return { data, total: res?.total ?? data.length };
  },

  async ocrStats(): Promise<OcrStats> {
    const res = await request<Partial<OcrStats>>(
      '/advanced-features/ocr-documents/stats',
    );
    return {
      total: res?.total ?? 0,
      byStatus: res?.byStatus ?? {},
      completed: res?.completed ?? 0,
      processing: res?.processing ?? 0,
      queued: res?.queued ?? 0,
      failed: res?.failed ?? 0,
      avgConfidence: res?.avgConfidence ?? 0,
    };
  },
};
