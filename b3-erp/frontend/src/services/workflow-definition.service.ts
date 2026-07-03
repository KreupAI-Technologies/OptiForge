import { apiClient } from './api/client';

/**
 * workflow-definition.service.ts
 *
 * Client for the visual workflow builder (ReactFlow canvas) save/load.
 * Backend: NestJS workflow module, WorkflowBuilderGraphController.
 * Route base: /api/v1/workflow/workflow-definitions
 */

const BASE = '/workflow/workflow-definitions';

export interface WorkflowDefinitionGraph {
  id: string;
  name: string;
  description?: string | null;
  nodes: any[];
  edges: any[];
  status: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveWorkflowDefinitionPayload {
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  status?: string;
}

export const workflowDefinitionService = {
  /** List all saved workflow builder graphs (most recently updated first). */
  async list(): Promise<WorkflowDefinitionGraph[]> {
    const res = await apiClient.get<WorkflowDefinitionGraph[]>(BASE);
    return res.data;
  },

  /** Fetch a single graph by id. */
  async getDefinition(id: string): Promise<WorkflowDefinitionGraph> {
    const res = await apiClient.get<WorkflowDefinitionGraph>(`${BASE}/${id}`);
    return res.data;
  },

  /**
   * Save a graph. Creates a new record when `id` is omitted, otherwise
   * updates the existing one.
   */
  async saveDefinition(
    payload: SaveWorkflowDefinitionPayload,
    id?: string,
  ): Promise<WorkflowDefinitionGraph> {
    if (id) {
      const res = await apiClient.put<WorkflowDefinitionGraph>(
        `${BASE}/${id}`,
        payload,
      );
      return res.data;
    }
    const res = await apiClient.post<WorkflowDefinitionGraph>(BASE, payload);
    return res.data;
  },
};
