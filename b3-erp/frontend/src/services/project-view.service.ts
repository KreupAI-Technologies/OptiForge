/**
 * Project View Service
 *
 * Typed client for the project detail page
 * src/app/(modules)/project-management/view/[id]. Talks to the NestJS domain
 * backend (port 3001, /api/v1) with the x-company-id header.
 *
 * Endpoints (project-management module):
 *   GET /projects/:id                        — single project
 *   GET /project-tasks?projectId=<id>        — tasks for the project
 *   GET /project-milestones?projectId=<id>   — milestones for the project
 *
 * Backend returns bare JSON (no envelope); reads are defensive.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', 'x-company-id': 'test' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

function toArray<T = any>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) {
    return (raw as any).data as T[];
  }
  return [];
}

export interface ProjectDetail {
  id: string;
  name?: string;
  projectCode?: string;
  clientName?: string;
  description?: string;
  status?: string;
  priority?: string;
  location?: string;
  progress?: number | string;
  budgetAllocated?: number | string;
  budgetSpent?: number | string;
  totalIncome?: number | string;
  totalExpenditure?: number | string;
  netProfit?: number | string;
  profitMargin?: number | string;
  plannedStart?: string;
  plannedEnd?: string;
  startDate?: string;
  endDate?: string;
  projectType?: string;
  clientContactPerson?: string;
  clientContactEmail?: string;
  [key: string]: any;
}

export interface ProjectTaskItem {
  id: string;
  name?: string;
  status?: string;
  progress?: number;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

export interface ProjectMilestoneItem {
  id: string;
  name?: string;
  status?: string;
  dueDate?: string;
  completedDate?: string;
  [key: string]: any;
}

export const ProjectViewService = {
  async getProject(id: string): Promise<ProjectDetail | null> {
    const raw = await getJson<any>(`/projects/${id}`);
    return raw && typeof raw === 'object' ? (raw as ProjectDetail) : null;
  },
  async getTasks(projectId: string): Promise<ProjectTaskItem[]> {
    return toArray<ProjectTaskItem>(
      await getJson(`/project-tasks?projectId=${encodeURIComponent(projectId)}`),
    );
  },
  async getMilestones(projectId: string): Promise<ProjectMilestoneItem[]> {
    return toArray<ProjectMilestoneItem>(
      await getJson(`/project-milestones?projectId=${encodeURIComponent(projectId)}`),
    );
  },
};
