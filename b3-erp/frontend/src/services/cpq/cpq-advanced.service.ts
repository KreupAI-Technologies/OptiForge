import { apiClient } from '../api/client';

// ==================== Pricing Version Control ====================

export interface CPQPricingVersion {
  id: string;
  companyId: string;
  version: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'scheduled' | 'archived' | 'superseded';
  changeType:
    | 'price_increase'
    | 'price_decrease'
    | 'new_product'
    | 'discontinued'
    | 'restructure';
  changes?: {
    productId: string;
    productName: string;
    oldPrice: number;
    newPrice: number;
    changePercent: number;
    reason?: string;
  }[];
  totalItems: number;
  avgPriceChange: number;
  notes?: string;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  activatedAt?: string;
  scheduledFor?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Approval Matrix ====================

export interface CPQApprovalMatrixRule {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  condition?: {
    type: string;
    operator: string;
    value: number | [number, number];
  };
  requiredApprovers?: { role: string; count: number }[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  autoEscalateAfterHours?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== Guided Selling ====================

export interface CPQGuidedSellingQuestion {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  questionType: 'single' | 'multiple' | 'number' | 'text' | 'boolean' | 'range';
  required: boolean;
  displayOrder: number;
  options?: {
    label: string;
    value: string;
    recommended?: boolean;
    productIds?: string[];
  }[];
  helpText?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== Margin Guardrails ====================

export interface CPQMarginGuardrail {
  id: string;
  companyId: string;
  name: string;
  guardrailType: 'min_margin' | 'max_discount' | 'target_margin' | 'floor_price';
  threshold: number;
  enabled: boolean;
  action: 'warn' | 'block' | 'require_approval';
  notifyRoles?: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Document Generator ====================

export interface CPQDocumentTemplateSection {
  id?: string;
  title: string;
  content: string;
  order?: number;
  editable?: boolean;
}

export interface CPQDocumentTemplate {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  documentType: string;
  content?: string;
  sections?: CPQDocumentTemplateSection[];
  status?: string;
  usageCount?: number;
  version?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CPQGeneratedDocument {
  id: string;
  companyId: string;
  templateId?: string;
  templateName?: string;
  documentType?: string;
  title?: string;
  referenceId?: string;
  customerName?: string;
  content?: string;
  variables?: Record<string, unknown>;
  status?: string;
  generatedBy?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Blob-download helpers for document export (mirrors reports-management.service).
const DOCUMENTS_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const DOCUMENTS_COMPANY_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID || 'company-001';

function documentFilenameFromDisposition(
  header: string | null,
  fallback: string,
): string {
  if (!header) return fallback;
  const match = /filename="?([^"]+)"?/i.exec(header);
  return match?.[1] ?? fallback;
}

function triggerDocumentBlobDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// ==================== Service Class ====================

class CPQAdvancedService {
  private pricingVersionsUrl = '/cpq/advanced/pricing-versions';
  private approvalMatrixUrl = '/cpq/advanced/approval-matrix';
  private guidedSellingUrl = '/cpq/advanced/guided-selling';
  private marginGuardrailsUrl = '/cpq/advanced/margin-guardrails';
  private documentTemplatesUrl = '/cpq/advanced/documents/templates';
  private documentsUrl = '/cpq/advanced/documents';

  async findAllPricingVersions(): Promise<CPQPricingVersion[]> {
    const response = await apiClient.get<CPQPricingVersion[]>(this.pricingVersionsUrl);
    return Array.isArray(response.data) ? response.data : [];
  }

  async createPricingVersion(
    data: Partial<CPQPricingVersion>,
  ): Promise<CPQPricingVersion> {
    const response = await apiClient.post<CPQPricingVersion>(
      this.pricingVersionsUrl,
      data,
    );
    return response.data;
  }

  async findAllApprovalRules(): Promise<CPQApprovalMatrixRule[]> {
    const response = await apiClient.get<CPQApprovalMatrixRule[]>(this.approvalMatrixUrl);
    return Array.isArray(response.data) ? response.data : [];
  }

  async createApprovalRule(
    data: Partial<CPQApprovalMatrixRule>,
  ): Promise<CPQApprovalMatrixRule> {
    const response = await apiClient.post<CPQApprovalMatrixRule>(
      this.approvalMatrixUrl,
      data,
    );
    return response.data;
  }

  async findAllGuidedSellingQuestions(): Promise<CPQGuidedSellingQuestion[]> {
    const response = await apiClient.get<CPQGuidedSellingQuestion[]>(
      this.guidedSellingUrl,
    );
    return Array.isArray(response.data) ? response.data : [];
  }

  async createGuidedSellingQuestion(
    data: Partial<CPQGuidedSellingQuestion>,
  ): Promise<CPQGuidedSellingQuestion> {
    const response = await apiClient.post<CPQGuidedSellingQuestion>(
      this.guidedSellingUrl,
      data,
    );
    return response.data;
  }

  async findAllMarginGuardrails(): Promise<CPQMarginGuardrail[]> {
    const response = await apiClient.get<CPQMarginGuardrail[]>(
      this.marginGuardrailsUrl,
    );
    return Array.isArray(response.data) ? response.data : [];
  }

  async createMarginGuardrail(
    data: Partial<CPQMarginGuardrail>,
  ): Promise<CPQMarginGuardrail> {
    const response = await apiClient.post<CPQMarginGuardrail>(
      this.marginGuardrailsUrl,
      data,
    );
    return response.data;
  }

  // ==================== Document Generator ====================

  async findAllDocumentTemplates(): Promise<CPQDocumentTemplate[]> {
    const response = await apiClient.get<CPQDocumentTemplate[]>(
      this.documentTemplatesUrl,
    );
    return Array.isArray(response.data) ? response.data : [];
  }

  async createDocumentTemplate(data: {
    name: string;
    description?: string;
    documentType: string;
    content?: string;
    sections?: CPQDocumentTemplateSection[];
  }): Promise<CPQDocumentTemplate> {
    const response = await apiClient.post<CPQDocumentTemplate>(
      this.documentTemplatesUrl,
      data,
    );
    return response.data;
  }

  async findAllGeneratedDocuments(): Promise<CPQGeneratedDocument[]> {
    const response = await apiClient.get<CPQGeneratedDocument[]>(
      this.documentsUrl,
    );
    return Array.isArray(response.data) ? response.data : [];
  }

  async findGeneratedDocument(id: string): Promise<CPQGeneratedDocument> {
    const response = await apiClient.get<CPQGeneratedDocument>(
      `${this.documentsUrl}/${id}`,
    );
    return response.data;
  }

  async generateDocument(data: {
    templateId?: string;
    title?: string;
    documentType?: string;
    referenceId?: string;
    customerName?: string;
    content?: string;
    variables?: Record<string, unknown>;
    generatedBy?: string;
  }): Promise<CPQGeneratedDocument> {
    const response = await apiClient.post<CPQGeneratedDocument>(
      `${this.documentsUrl}/generate`,
      data,
    );
    return response.data;
  }

  /**
   * Download a generated document as a PDF / Excel / CSV file. Uses a raw
   * fetch + blob (not the JSON apiClient) so the binary response streams to a
   * file download, mirroring reports-management.service's downloadReportFile.
   */
  async exportDocument(
    id: string,
    format: 'pdf' | 'excel' | 'csv' = 'pdf',
  ): Promise<void> {
    const res = await fetch(
      `${DOCUMENTS_API_BASE_URL}${this.documentsUrl}/${id}/export?format=${format}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: { 'x-company-id': DOCUMENTS_COMPANY_ID },
      },
    );
    if (!res.ok) {
      throw new Error(`Document download failed (${res.status})`);
    }
    const blob = await res.blob();
    const filename = documentFilenameFromDisposition(
      res.headers.get('content-disposition'),
      `document-${id}.${format === 'excel' ? 'xlsx' : format}`,
    );
    triggerDocumentBlobDownload(blob, filename);
  }
}

export const cpqAdvancedService = new CPQAdvancedService();
