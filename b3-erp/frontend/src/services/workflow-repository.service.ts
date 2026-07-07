import { apiClient } from './api/client';

/**
 * workflow-repository.service.ts
 *
 * Read-side client for the NestJS WorkflowRepositoryController.
 * Route base: /api/v1/workflow-repository
 *
 * Provides the two primary data views used by the Workflow Automation
 * Advanced Features page:
 *   - definitions -> OrchestrationEngine
 *   - instances   -> ExecutionLogs
 */

const BASE = '/workflow-repository';

export interface WorkflowDefinitionDTO {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  status: string;
  version: number;
  triggers?: Array<{ event: string; conditions?: Record<string, unknown> }> | null;
  steps?: Array<{
    id: string;
    name: string;
    description?: string;
    actions?: Array<{ type: string; config?: Record<string, unknown>; order?: number }>;
    nextSteps?: string[];
    conditions?: Record<string, unknown>;
  }> | null;
  metadata?: Record<string, unknown> | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowInstanceDTO {
  id: string;
  instanceNumber: string;
  definitionId?: string | null;
  definition?: { id: string; name: string } | null;
  status: string;
  priority: string;
  currentStepId?: string | null;
  currentStepName?: string | null;
  sourceType?: string | null;
  sourceId?: string | null;
  sourceNumber?: string | null;
  context?: Record<string, unknown> | null;
  errorMessage?: string | null;
  errorDetails?: Record<string, unknown> | null;
  startedAt?: string | null;
  completedAt?: string | null;
  dueDate?: string | null;
  totalSteps: number;
  completedSteps: number;
  progressPercentage: number;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const workflowRepositoryService = {
  /** List workflow definitions (optionally filtered by type/status). */
  async getDefinitions(filters?: {
    type?: string;
    status?: string;
  }): Promise<WorkflowDefinitionDTO[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    const qs = params.toString();
    const res = await apiClient.get<WorkflowDefinitionDTO[]>(
      qs ? `${BASE}/definitions?${qs}` : `${BASE}/definitions`,
    );
    return Array.isArray(res.data) ? res.data : [];
  },

  /** List workflow instances (execution logs), most recent first. */
  async getInstances(filters?: {
    status?: string;
    priority?: string;
    sourceType?: string;
    limit?: number;
  }): Promise<WorkflowInstanceDTO[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.sourceType) params.append('sourceType', filters.sourceType);
    if (filters?.limit != null) params.append('limit', String(filters.limit));
    const qs = params.toString();
    const res = await apiClient.get<WorkflowInstanceDTO[]>(
      qs ? `${BASE}/instances?${qs}` : `${BASE}/instances`,
    );
    return Array.isArray(res.data) ? res.data : [];
  },
};
