// Production module — orphan-page wiring service.
// Talks directly to the NestJS domain backend (raw ORM array responses),
// so it uses a plain fetch helper rather than the {success,data}-wrapping apiClient.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function request<T = any>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

async function post<T = any>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

async function put<T = any>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

async function del(path: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
}

/**
 * Each method returns the raw backend array (typed as any[]). Pages apply a
 * defensive transform from the raw ORM shape into their local interface.
 */
export const ProductionOrphanService = {
  // GET production/shortage-records
  getShortageRecords: () => request<any[]>('/production/shortage-records'),

  // GET production/material-requirements
  getMaterialRequirements: () => request<any[]>('/production/material-requirements'),

  // GET production/planned-orders
  getPlannedOrders: () => request<any[]>('/production/planned-orders'),
  // PUT production/planned-orders/:id (used to approve — set status)
  updatePlannedOrder: (id: string, body: any) => put<any>(`/production/planned-orders/${id}`, body),

  // GET production/downtime-records
  getDowntimeRecords: () => request<any[]>('/production/downtime-records'),
  // DELETE production/downtime-records/:id
  deleteDowntimeRecord: (id: string) => del(`/production/downtime-records/${id}`),

  // GET production/maintenance-logs
  getMaintenanceLogs: () => request<any[]>('/production/maintenance-logs'),

  // --- Net-new orphan settings/list endpoints ---

  // GET production/routing-templates
  getRoutingTemplates: () => request<any[]>('/production/routing-templates'),

  // GET production/line-configs
  getLineConfigs: () => request<any[]>('/production/line-configs'),

  // GET production/shift-definitions
  getShiftDefinitions: () => request<any[]>('/production/shift-definitions'),

  // GET production/die-tool-assets
  getDieToolAssets: () => request<any[]>('/production/die-tool-assets'),

  // GET production/shutter-orders
  getShutterOrders: () => request<any[]>('/production/shutter-orders'),

  // GET production/trial-installations
  getTrialInstallations: () => request<any[]>('/production/trial-installations'),

  // GET production/operation-tasks
  getOperationTasks: () => request<any[]>('/production/operation-tasks'),

  // --- Follow-up orphan maintenance/quality endpoints ---

  // GET/POST production/spare-parts
  getSpareParts: () => request<any[]>('/production/spare-parts'),
  createSparePart: (body: any) => post<any>('/production/spare-parts', body),

  // GET/POST production/preventive-maintenance
  getPreventiveMaintenance: () => request<any[]>('/production/preventive-maintenance'),
  createPreventiveMaintenance: (body: any) => post<any>('/production/preventive-maintenance', body),

  // GET/POST production/maintenance-requests
  getMaintenanceRequests: () => request<any[]>('/production/maintenance-requests'),
  createMaintenanceRequest: (body: any) => post<any>('/production/maintenance-requests', body),

  // GET/POST production/ncrs
  getNcrs: () => request<any[]>('/production/ncrs'),
  createNcr: (body: any) => post<any>('/production/ncrs', body),

  // GET/POST production/quality-plans
  getQualityPlans: () => request<any[]>('/production/quality-plans'),
  createQualityPlan: (body: any) => post<any>('/production/quality-plans', body),

  // --- Newly-built shopfloor / scheduling / bom-verification endpoints ---

  // GET/POST production/floor-activities (backs /production/floor)
  getFloorActivities: () => request<any[]>('/production/floor-activities'),
  createFloorActivity: (body: any) => post<any>('/production/floor-activities', body),

  // GET/POST production/bom-verifications (backs /production/bom/verification)
  getBomVerifications: () => request<any[]>('/production/bom-verifications'),
  createBomVerification: (body: any) => post<any>('/production/bom-verifications', body),

  // GET/POST production/gantt-tasks (backs /production/scheduling/enhanced-gantt)
  getGanttTasks: () => request<any[]>('/production/gantt-tasks'),
  createGanttTask: (body: any) => post<any>('/production/gantt-tasks', body),

  // GET/POST production/machine-timelines (backs /production/shopfloor/machine-timeline)
  getMachineTimelines: () => request<any[]>('/production/machine-timelines'),
  createMachineTimeline: (body: any) => post<any>('/production/machine-timelines', body),

  // GET/POST production/andon-lines (backs /production/shopfloor/andon)
  getAndonLines: () => request<any[]>('/production/andon-lines'),
  createAndonLine: (body: any) => post<any>('/production/andon-lines', body),

  // GET/POST production/schedule-lines (backs /production/scheduling)
  getScheduleLines: () => request<any[]>('/production/schedule-lines'),
  createScheduleLine: (body: any) => post<any>('/production/schedule-lines', body),

  // --- Core single-record fetches for detail (view/edit) pages ---

  // GET production/work-order/:id (backs /production/work-orders/view|edit/[id])
  getWorkOrder: (id: string) => request<any>(`/production/work-order/${id}`),

  // GET production/bom/:id (backs /production/bom/view|edit/[id])
  getBom: (id: string) => request<any>(`/production/bom/${id}`),

  // --- List fetches backing the ~28 hardcoded production pages ---

  // GET production/work-order (backs work-orders/completed|progress|pending|tracking)
  getWorkOrders: () => request<any[]>('/production/work-order'),

  // GET production/bom (backs bom/versions|comparison|multi-level)
  getBoms: () => request<any[]>('/production/bom'),

  // GET production/job-sequences (backs scheduling/sequencing)
  getJobSequences: () => request<any[]>('/production/job-sequences'),

  // GET production/resource-allocations (backs scheduling/resources)
  getResourceAllocations: () => request<any[]>('/production/resource-allocations'),

  // GET production/production-schedules (backs scheduling/optimize)
  getProductionSchedules: () => request<any[]>('/production/production-schedules'),

  // GET production/master-schedules (backs planning)
  getMasterSchedules: () => request<any[]>('/production/master-schedules'),

  // GET production/mrp-runs (backs mrp/results)
  getMrpRuns: () => request<any[]>('/production/mrp-runs'),

  // GET production/demand-plans (backs planning/demand)
  getDemandPlans: () => request<any[]>('/production/demand-plans'),

  // GET production/root-cause-analyses (backs downtime/rca)
  getRootCauseAnalyses: () => request<any[]>('/production/root-cause-analyses'),

  // GET production/shop-floor-control (backs shopfloor/tracking)
  getShopFloorControl: () => request<any[]>('/production/shop-floor-control'),

  // GET production/operator-workstations (backs shopfloor/operator)
  getOperatorWorkstations: () => request<any[]>('/production/operator-workstations'),

  // GET production/oee-records (backs analytics/oee)
  getOeeRecords: () => request<any[]>('/production/oee-records'),

  // GET production/digital-twins (backs digital-twin)
  getDigitalTwins: () => request<any[]>('/production/digital-twins'),

  // GET production/automation-workflows (backs automation)
  getAutomationWorkflows: () => request<any[]>('/production/automation-workflows'),

  // GET production/ai-insights (backs smart-analytics)
  getAiInsights: () => request<any[]>('/production/ai-insights'),

  // GET production/equipment-health (backs real-time-monitoring)
  getEquipmentHealth: () => request<any[]>('/production/equipment-health'),

  // GET production/collaboration/team-activities (backs collaboration)
  getTeamActivities: () => request<any[]>('/production/collaboration/team-activities'),

  // GET production/sustainability/esg-scores (backs sustainability)
  getEsgScores: () => request<any[]>('/production/sustainability/esg-scores'),

  // GET production/resilience/scenario-planning (backs resilience)
  getScenarioPlanning: () => request<any[]>('/production/resilience/scenario-planning'),

  // GET production/skill-matrices (backs human-centric)
  getSkillMatrices: () => request<any[]>('/production/skill-matrices'),
};
