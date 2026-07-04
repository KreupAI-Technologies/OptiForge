import { apiClient } from './api/client';

// ==================== TypeScript Interfaces ====================

export interface EstimateTemplate {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  templateType?: string;
  category?: string;
  isActive: boolean;
  isDefault: boolean;
  defaultCurrency?: string;
  sections?: unknown[];
  defaultMarkups?: { costType: string; markupPercentage: number; name: string }[];
  defaultContingencyPercentage?: number;
  defaultValidityDays?: number;
  usageCount?: number;
  lastUsedAt?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== Service ====================

/**
 * Client for the estimation template endpoints exposed by the NestJS domain
 * backend at `${NEXT_PUBLIC_API_URL}/estimation/templates`.
 *
 * Note: these list endpoints return a raw array (not a `{ success, data }`
 * envelope), so callers should still defensively coerce the result.
 */
export class EstimationTemplateService {
  private baseUrl = '/estimation/templates';

  async findAllTemplates(filters?: {
    templateType?: string;
    category?: string;
    isActive?: boolean;
  }): Promise<EstimateTemplate[]> {
    const params = new URLSearchParams();
    if (filters?.templateType) params.append('templateType', filters.templateType);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    const query = params.toString();
    const res = (await apiClient.get<EstimateTemplate[]>(
      `${this.baseUrl}${query ? `?${query}` : ''}`,
    )) as unknown;
    // Backend may return either a raw array or a { data } envelope.
    if (Array.isArray(res)) return res as EstimateTemplate[];
    const data = (res as { data?: EstimateTemplate[] })?.data;
    return Array.isArray(data) ? data : [];
  }

  async findTemplateById(id: string): Promise<EstimateTemplate | null> {
    const res = (await apiClient.get<EstimateTemplate>(`${this.baseUrl}/${id}`)) as unknown;
    if (res && !Array.isArray(res) && (res as { data?: unknown }).data !== undefined) {
      return (res as { data: EstimateTemplate }).data;
    }
    return (res as EstimateTemplate) ?? null;
  }

  // DELETE /estimation/templates/boq/:id — remove a BOQ template.
  async deleteBoqTemplate(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/boq/${id}`);
  }
}

export const estimationTemplateService = new EstimationTemplateService();
