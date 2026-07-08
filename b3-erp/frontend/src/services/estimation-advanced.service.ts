import { apiClient } from './api/client';

// ==================== Version Comparison ====================

export interface EstimateVersionRecord {
  id: string;
  version?: string | number;
  name?: string;
  title?: string;
  status?: string;
  totalCost?: number;
  suggestedPrice?: number;
  margin?: number;
  marginPercent?: number;
  createdBy?: string;
  createdAt?: string;
  notes?: string;
  changes?: string[];
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
}

export interface VersionDiffResult {
  base: { id: string; label: string; total: number };
  target: { id: string; label: string; total: number };
  totals: {
    baseTotal: number;
    targetTotal: number;
    deltaValue: number;
    deltaPct: number;
  };
  changed: {
    key: string;
    description: string;
    changeType: string;
    baseTotal: number;
    targetTotal: number;
    deltaValue: number;
  }[];
}

// ==================== What-If ====================

export interface WhatIfVariableInput {
  key: string;
  label: string;
  baseValue: number;
  adjustPct: number;
}

export interface WhatIfScenario {
  id: string;
  name: string;
  estimateId?: string;
  baseValue?: number;
  variables: WhatIfVariableInput[];
  results?: {
    baseValue: number;
    adjustedValue: number;
    deltaValue: number;
    deltaPct: number;
    perVariable: { key: string; contribution: number }[];
  };
  createdAt?: string;
}

// ==================== BOM Import ====================

export interface BOMImportRow {
  code: string;
  description: string;
  quantity: number;
  unitCost: number;
}

export interface BOMImportSessionRecord {
  id: string;
  fileName?: string;
  status: string;
  rowCount: number;
  rows: BOMImportRow[];
  errors?: string[];
  totalValue: number;
  estimateId?: string;
  createdAt?: string;
}

// ==================== Service ====================

class EstimationAdvancedService {
  private estimatesUrl = '/estimation/cost-estimates';
  private whatIfUrl = '/estimation/what-if';
  private bomUrl = '/estimation/bom-import';

  // ---- Version compare ----
  async getVersions(id: string): Promise<EstimateVersionRecord[]> {
    const response = await apiClient.get<EstimateVersionRecord[]>(
      `${this.estimatesUrl}/${id}/versions`,
    );
    return response.data;
  }

  async compareVersions(baseId: string, targetId: string): Promise<VersionDiffResult> {
    const params = new URLSearchParams({ baseId, targetId });
    const response = await apiClient.get<VersionDiffResult>(
      `${this.estimatesUrl}/compare/diff?${params.toString()}`,
    );
    return response.data;
  }

  // ---- What-If ----
  async listWhatIf(estimateId?: string): Promise<WhatIfScenario[]> {
    const qs = estimateId ? `?estimateId=${encodeURIComponent(estimateId)}` : '';
    const response = await apiClient.get<WhatIfScenario[]>(`${this.whatIfUrl}${qs}`);
    return response.data;
  }

  async createWhatIf(data: {
    name: string;
    estimateId?: string;
    baseValue?: number;
    variables: WhatIfVariableInput[];
  }): Promise<WhatIfScenario> {
    const response = await apiClient.post<WhatIfScenario>(this.whatIfUrl, data);
    return response.data;
  }

  async deleteWhatIf(id: string): Promise<void> {
    await apiClient.delete(`${this.whatIfUrl}/${id}`);
  }

  // ---- BOM Import ----
  async listBomSessions(estimateId?: string): Promise<BOMImportSessionRecord[]> {
    const qs = estimateId ? `?estimateId=${encodeURIComponent(estimateId)}` : '';
    const response = await apiClient.get<BOMImportSessionRecord[]>(`${this.bomUrl}${qs}`);
    return response.data;
  }

  async createBomSession(data: {
    fileName?: string;
    estimateId?: string;
    csv?: string;
    rows?: BOMImportRow[];
  }): Promise<BOMImportSessionRecord> {
    const response = await apiClient.post<BOMImportSessionRecord>(this.bomUrl, data);
    return response.data;
  }

  async deleteBomSession(id: string): Promise<void> {
    await apiClient.delete(`${this.bomUrl}/${id}`);
  }
}

export const estimationAdvancedService = new EstimationAdvancedService();
