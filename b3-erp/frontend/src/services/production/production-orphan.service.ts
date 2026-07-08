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

  // GET production/work-center (backs settings — work-center counts)
  getWorkCenters: () => request<any[]>('/production/work-center'),

  // GET production/routing (backs settings — routing/template counts)
  getRoutings: () => request<any[]>('/production/routing'),

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

  // GET production/productivity-metrics (backs analytics)
  getProductivityMetrics: () => request<any[]>('/production/productivity-metrics'),

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

  // GET production/ergonomic-alerts (backs human-centric ergonomics view)
  getErgonomicAlerts: () => request<any[]>('/production/ergonomic-alerts'),

  // GET production/workload-assignments (backs human-centric workload view)
  getWorkloadAssignments: () => request<any[]>('/production/workload-assignments'),

  // GET production/sustainability/energy-consumption (backs sustainability energy view)
  getEnergyConsumption: () => request<any[]>('/production/sustainability/energy-consumption'),

  // GET production/sustainability/water-usage (backs sustainability water view)
  getWaterUsage: () => request<any[]>('/production/sustainability/water-usage'),

  // GET production/sustainability/carbon-footprint (backs sustainability carbon view)
  getCarbonFootprint: () => request<any[]>('/production/sustainability/carbon-footprint'),

  // GET production/sustainability/waste-records (backs sustainability waste view)
  getWasteRecords: () => request<any[]>('/production/sustainability/waste-records'),

  // GET production/sustainability/green-suppliers (backs sustainability suppliers view)
  getGreenSuppliers: () => request<any[]>('/production/sustainability/green-suppliers'),

  // GET production/mes-integrations (backs automation MES view)
  getMesIntegrations: () => request<any[]>('/production/mes-integrations'),

  // GET production/resilience/supply-chain-risks (backs supply-chain vendor-risk view)
  getSupplyChainRisks: () => request<any[]>('/production/resilience/supply-chain-risks'),

  // ---- Write methods (added for orphan-page TODO wiring) ----

  // BOM (backs /production/bom, /production/bom/add|edit)
  createBom: (body: any) => post<any>('/production/bom', body),
  updateBom: (id: string, body: any) => put<any>(`/production/bom/${id}`, body),
  deleteBom: (id: string) => del(`/production/bom/${id}`),

  // Planned orders (backs /production/mrp/planned-orders)
  createPlannedOrder: (body: any) => post<any>('/production/planned-orders', body),
  releasePlannedOrder: (id: string) => post<any>(`/production/planned-orders/${id}/release`, {}),
  firmPlannedOrder: (id: string) => post<any>(`/production/planned-orders/${id}/firm`, {}),

  // Shortage records (backs /production/mrp/shortage)
  createShortageRecord: (body: any) => post<any>('/production/shortage-records', body),
  updateShortageRecord: (id: string, body: any) => put<any>(`/production/shortage-records/${id}`, body),
  resolveShortageRecord: (id: string, body: any) => post<any>(`/production/shortage-records/${id}/resolve`, body),
  escalateShortageRecord: (id: string, body: any) => post<any>(`/production/shortage-records/${id}/escalate`, body),

  // Downtime records (backs /production/downtime, /production/downtime/log)
  createDowntimeRecord: (body: any) => post<any>('/production/downtime-records', body),
  updateDowntimeRecord: (id: string, body: any) => put<any>(`/production/downtime-records/${id}`, body),
  endDowntimeRecord: (id: string, body: any) => post<any>(`/production/downtime-records/${id}/end`, body),

  // Root cause analyses (backs /production/downtime/rca)
  createRootCauseAnalysis: (body: any) => post<any>('/production/root-cause-analyses', body),
  updateRootCauseAnalysis: (id: string, body: any) => put<any>(`/production/root-cause-analyses/${id}`, body),
  deleteRootCauseAnalysis: (id: string) => del(`/production/root-cause-analyses/${id}`),
  completeRootCauseAnalysis: (id: string, body: any) => post<any>(`/production/root-cause-analyses/${id}/complete`, body),
  addRcaCorrectiveAction: (id: string, body: any) => post<any>(`/production/root-cause-analyses/${id}/corrective-action`, body),
  verifyRootCauseAnalysis: (id: string, body: any) => post<any>(`/production/root-cause-analyses/${id}/verify`, body),

  // NCR (backs /production/quality/ncr, /production/quality/add|edit)
  updateNcr: (id: string, body: any) => put<any>(`/production/ncrs/${id}`, body),
  deleteNcr: (id: string) => del(`/production/ncrs/${id}`),
  getNcr: (id: string) => request<any>(`/production/ncrs/${id}`),

  // Quality plans (backs /production/quality/plans)
  updateQualityPlan: (id: string, body: any) => put<any>(`/production/quality-plans/${id}`, body),
  deleteQualityPlan: (id: string) => del(`/production/quality-plans/${id}`),

  // Shop floor control (backs /production/shopfloor)
  reportShopFloorDowntime: (id: string, body: any) => post<any>(`/production/shop-floor-control/${id}/report-downtime`, body),

  // Floor activities (backs /production/floor/view|edit)
  updateFloorActivity: (id: string, body: any) => put<any>(`/production/floor-activities/${id}`, body),
  getFloorActivity: (id: string) => request<any>(`/production/floor-activities/${id}`),

  // Aggregate plans (backs /production/planning/aggregate)
  getAggregatePlans: () => request<any[]>('/production/aggregate-plans'),
  createAggregatePlan: (body: any) => post<any>('/production/aggregate-plans', body),

  // Capacity plans (backs /production/capacity-planning)
  getCapacityPlans: () => request<any[]>('/production/capacity-plans'),
  createCapacityPlan: (body: any) => post<any>('/production/capacity-plans', body),

  // ---- Work orders (backs /production/work-orders/*) ----
  createWorkOrder: (body: any) => post<any>('/production/work-order', body),
  updateWorkOrder: (id: string, body: any) => put<any>(`/production/work-order/${id}`, body),
  deleteWorkOrder: (id: string) => del(`/production/work-order/${id}`),
  submitWorkOrder: (id: string, body: any = {}) => post<any>(`/production/work-order/${id}/submit`, body),
  releaseWorkOrder: (id: string, body: any = {}) => post<any>(`/production/work-order/${id}/release`, body),
  startWorkOrder: (id: string, body: any = {}) => post<any>(`/production/work-order/${id}/start`, body),
  completeWorkOrder: (id: string, body: any = {}) => post<any>(`/production/work-order/${id}/complete`, body),
  closeWorkOrder: (id: string, body: any = {}) => post<any>(`/production/work-order/${id}/close`, body),
  cancelWorkOrder: (id: string, body: any = {}) => post<any>(`/production/work-order/${id}/cancel`, body),
  updateWorkOrderProgress: (id: string, body: any) => put<any>(`/production/work-order/${id}/progress`, body),

  // ---- Shop floor control operations (backs /production/shopfloor) ----
  startShopFloorOperation: (id: string, body: any) => post<any>(`/production/shop-floor-control/${id}/start-operation`, body),
  completeShopFloorOperation: (id: string, body: any) => post<any>(`/production/shop-floor-control/${id}/complete-operation`, body),

  // ---- Maintenance requests write (approve/reject via PUT status) ----
  updateMaintenanceRequest: (id: string, body: any) => put<any>(`/production/maintenance-requests/${id}`, body),

  // ---- Preventive maintenance write ----
  updatePreventiveMaintenance: (id: string, body: any) => put<any>(`/production/preventive-maintenance/${id}`, body),
  deletePreventiveMaintenance: (id: string) => del(`/production/preventive-maintenance/${id}`),

  // ---- Spare parts write ----
  updateSparePart: (id: string, body: any) => put<any>(`/production/spare-parts/${id}`, body),

  // ---- Schedule lines write (backs /production/scheduling) ----
  updateScheduleLine: (id: string, body: any) => put<any>(`/production/schedule-lines/${id}`, body),
  getScheduleLine: (id: string) => request<any>(`/production/schedule-lines/${id}`),

  // ---- Production schedules write (backs /production/scheduling optimize/publish) ----
  publishProductionSchedule: (id: string) => post<any>(`/production/production-schedules/${id}/publish`, {}),
  optimizeProductionSchedule: (id: string, body: any = {}) => post<any>(`/production/production-schedules/${id}/optimize`, body),
  createProductionSchedule: (body: any) => post<any>('/production/production-schedules', body),
  updateProductionSchedule: (id: string, body: any) => put<any>(`/production/production-schedules/${id}`, body),

  // ---- MRP runs write (backs /production/mrp) ----
  createMrpRun: (body: any) => post<any>('/production/mrp-runs', body),
  executeMrpRun: (id: string, body: any = {}) => post<any>(`/production/mrp-runs/${id}/execute`, body),

  // ---- Master schedules write (backs /production/planning) ----
  createMasterSchedule: (body: any) => post<any>('/production/master-schedules', body),
  updateMasterSchedule: (id: string, body: any) => put<any>(`/production/master-schedules/${id}`, body),
  freezeMasterSchedule: (id: string, body: any = {}) => post<any>(`/production/master-schedules/${id}/freeze`, body),
};
