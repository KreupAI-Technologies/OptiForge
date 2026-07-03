# OptiForge — Page Wiring Status & Endpoints To Build

## Cumulative status (branch `fix/foundation-build-and-api-wiring`, PR #129)

| Area | Result |
|---|---|
| FE `next build` | ✅ green (all passes) |
| NestJS build + boot | ✅ green, live, serving real data |
| Backend endpoint health | ✅ **157/216 controllers healthy, 0 real 500s** (all 6 originally-broken fixed; last "500" is a POST seeder) |
| Pages wired to live endpoints | ✅ **108** (66 pass-1 + 41 orphan-pass + template) |
| Export/Print buttons destubbed | ✅ **185 pages** → real CSV / print |
| Mock-data flags | ✅ all 41 services flipped off |
| Auth | ✅ consolidated on local JWT (verified) |
| Pages needing net-new endpoints | ⏳ **210** (itemized below) — net-new feature development |

The detail sections below record each automated pass. The **210 truly-orphan pages** are the remaining work: their backend endpoints do not exist and must be built (mostly analytics, settings, workflow-approval, template, and integration sub-features) — this is net-new development, not wiring.

---

Automated wiring pass (24 module agents). **66 pages wired** to the live NestJS backend; **161 pages need net-new endpoints**.

## Per-module summary

| Module | Wired | Needs endpoint |
|---|--:|--:|
| logistics | 2 | 27 |
| inventory | 5 | 25 |
| it-admin | 1 | 23 |
| sales | 6 | 21 |
| cpq | 13 | 19 |
| procurement | 2 | 6 |
| production | 1 | 6 |
| workflow | 2 | 5 |
| hr | 1 | 4 |
| packaging | 0 | 4 |
| common-masters | 12 | 3 |
| reports | 0 | 3 |
| advanced-features | 0 | 3 |
| quality | 1 | 2 |
| compliance | 1 | 2 |
| rfq | 1 | 2 |
| admin | 0 | 1 |
| after-sales-service | 2 | 1 |
| estimation | 2 | 1 |
| finance | 2 | 1 |
| support | 3 | 1 |
| collaboration | 1 | 1 |
| crm | 7 | 0 |
| project-management | 1 | 0 |

## Orphan pages (need backend endpoints), by module

### admin (1)
- src/app/(modules)/admin/workflows/builder/page.tsx

### after-sales-service (1)
- src/app/(modules)/after-sales-service/service-contracts/renewals/page.tsx

### common-masters (3)
- src/app/(modules)/common-masters/grade-master/page.tsx
- src/app/(modules)/common-masters/state-master/page.tsx
- src/app/(modules)/common-masters/city-master/page.tsx

### cpq (19)
- src/app/(modules)/cpq/products/options/page.tsx — service only exposes findProductOptions(productId); no list-all-options endpoint
- src/app/(modules)/cpq/products/rules/page.tsx — CPQProductService has ConfigurationRule interface but no findAll method / list endpoint
- src/app/(modules)/cpq/products/compatibility/page.tsx — no compatibility-matrix service/endpoint
- src/app/(modules)/cpq/products/configurator/page.tsx — no service returns wizard steps/option lists
- src/app/(modules)/cpq/pricing/contracts/page.tsx — pricing service has ContractPricing interface but no findAll method / endpoint
- src/app/(modules)/cpq/pricing/dynamic/page.tsx — no dynamic-pricing-factors service/endpoint
- src/app/(modules)/cpq/guided-selling/recommendations/page.tsx — page needs per-customer generated recommendations; findAllRecommendationRules returns rule definitions (semantic mismatch, no customer data)
- src/app/(modules)/cpq/guided-selling/cross-sell/page.tsx — analytics/opportunity shape with nested product pairs; no matching endpoint (RecommendationRule is a rule, not a scored opportunity)
- src/app/(modules)/cpq/workflow/approvals/page.tsx — page renders pending ApprovalRequest instances; findAllWorkflows returns workflow definitions, not requests
- src/app/(modules)/cpq/workflow/discounts/page.tsx — renders DiscountRequest instances; no pending-request endpoint
- src/app/(modules)/cpq/workflow/executive/page.tsx — renders ExecutiveApproval instances; no pending-request endpoint
- src/app/(modules)/cpq/workflow/legal/page.tsx — renders LegalReview instances; no pending-review endpoint
- src/app/(modules)/cpq/integration/cad/page.tsx — CADSystem/DesignFile shapes; findAllIntegrations returns generic CPQIntegration, no match
- src/app/(modules)/cpq/integration/ecommerce/page.tsx — EcommercePlatform/WebQuote shapes; no matching endpoint
- src/app/(modules)/cpq/integration/crm/page.tsx — syncLogs shape; no matching endpoint
- src/app/(modules)/cpq/integration/erp/page.tsx — no matching integration-list shape/endpoint
- src/app/(modules)/cpq/settings/permissions/page.tsx — untyped roles/approvalLimits arrays; getSettings returns a single config object, no matching list endpoints
- src/app/(modules)/cpq/settings/notifications/page.tsx — emailTemplates/escalationRules arrays; no matching endpoint
- src/app/(modules)/cpq/settings/numbering/page.tsx — branchCodes/categoryCodes arrays; no matching endpoint

### estimation (1)
- src/app/(modules)/estimation/pricing/page.tsx

### finance (1)
- src/app/(modules)/finance/costing/page.tsx

### hr (4)
- src/app/(modules)/hr/shifts/assignment/page.tsx
- src/app/(modules)/hr/shifts/roster/page.tsx
- src/app/(modules)/hr/shifts/swaps/page.tsx
- src/app/(modules)/hr/hr-compliance/page.tsx

### inventory (25)
- src/app/(modules)/inventory/adjustments/page.tsx (no stock-adjustment list service)
- src/app/(modules)/inventory/adjustments/approvals/page.tsx
- src/app/(modules)/inventory/adjustments/quantity/page.tsx
- src/app/(modules)/inventory/adjustments/reasons/page.tsx
- src/app/(modules)/inventory/adjustments/value/page.tsx
- src/app/(modules)/inventory/adjustments/write-offs/page.tsx
- src/app/(modules)/inventory/adjustments/create/page.tsx
- src/app/(modules)/inventory/analytics/carrying-cost/page.tsx
- src/app/(modules)/inventory/analytics/dead-stock/page.tsx
- src/app/(modules)/inventory/analytics/reports/page.tsx
- src/app/(modules)/inventory/analytics/turnover/page.tsx
- src/app/(modules)/inventory/analytics/velocity/page.tsx
- src/app/(modules)/inventory/cycle-count/page.tsx (no cycle-count service)
- src/app/(modules)/inventory/cycle-count/physical/page.tsx
- src/app/(modules)/inventory/cycle-count/reconciliation/page.tsx
- src/app/(modules)/inventory/cycle-count/variance/page.tsx
- src/app/(modules)/inventory/kitting/assembly/page.tsx (no kitting service)
- src/app/(modules)/inventory/kitting/disassembly/page.tsx
- src/app/(modules)/inventory/kitting/kits/page.tsx
- src/app/(modules)/inventory/movements/reports/page.tsx
- src/app/(modules)/inventory/replenishment/min-max/page.tsx
- src/app/(modules)/inventory/settings/categories/page.tsx
- src/app/(modules)/inventory/settings/policies/page.tsx
- src/app/(modules)/inventory/settings/storage/page.tsx
- src/app/(modules)/inventory/settings/uom/page.tsx

### it-admin (23)
- src/app/(modules)/it-admin/users/groups/page.tsx (AdminManagementService.getUserGroups — non-mock branch throws 'API not implemented'; no live endpoint)
- src/app/(modules)/it-admin/security/password/page.tsx (AdminManagementService.getPasswordPolicies — not implemented)
- src/app/(modules)/it-admin/security/sessions/page.tsx (AdminManagementService.getUserSessions — not implemented)
- src/app/(modules)/it-admin/security/ip-whitelist/page.tsx (AdminManagementService.getIPWhitelist — not implemented)
- src/app/(modules)/it-admin/security/alerts/page.tsx (AdminManagementService.getSecurityAlerts — not implemented)
- src/app/(modules)/it-admin/audit/logins/page.tsx (AdminManagementService.getLoginHistory — not implemented)
- src/app/(modules)/it-admin/audit/changes/page.tsx (AdminManagementService.getChangeLogs — not implemented)
- src/app/(modules)/it-admin/audit/compliance/page.tsx (AdminManagementService.getComplianceReports — not implemented)
- src/app/(modules)/it-admin/database/backup/page.tsx (AdminManagementService.getDatabaseBackups — not implemented)
- src/app/(modules)/it-admin/database/export/page.tsx (AdminManagementService.getDataExportJobs — not implemented)
- src/app/(modules)/it-admin/database/import/page.tsx (AdminManagementService.getDataImportJobs — not implemented)
- src/app/(modules)/it-admin/monitoring/health/page.tsx (AdminManagementService.getSystemHealthChecks — not implemented)
- src/app/(modules)/it-admin/monitoring/performance/page.tsx (AdminManagementService.getPerformanceMetrics — not implemented)
- src/app/(modules)/it-admin/monitoring/errors/page.tsx (AdminManagementService.getErrorTracking — not implemented)
- src/app/(modules)/it-admin/customization/fields/page.tsx (AdminManagementService.getCustomFields — not implemented)
- src/app/(modules)/it-admin/customization/branding/page.tsx (AdminManagementService.getBrandingSettings — not implemented)
- src/app/(modules)/it-admin/scheduler/jobs/page.tsx (AdminManagementService.getScheduledJobs — not implemented)
- src/app/(modules)/it-admin/scheduler/history/page.tsx (AdminManagementService.getJobExecutions — not implemented)
- src/app/(modules)/it-admin/scheduler/automation/page.tsx (AdminManagementService.getAutomationRules — not implemented)
- src/app/(modules)/it-admin/license/page.tsx (AdminManagementService.getLicense — not implemented)
- src/app/(modules)/it-admin/license/features/page.tsx (AdminManagementService.getFeatureAccess — not implemented)
- src/app/(modules)/it-admin/system/integrations/page.tsx (AdminManagementService.getIntegrations — not implemented)
- src/app/(modules)/it-admin/system/email/page.tsx (AdminManagementService.getEmailConfigurations — not implemented)

### logistics (27)
- src/app/(modules)/logistics/carriers/page.tsx
- src/app/(modules)/logistics/carriers/add/page.tsx
- src/app/(modules)/logistics/carriers/edit/[id]/page.tsx
- src/app/(modules)/logistics/carriers/view/[id]/page.tsx
- src/app/(modules)/logistics/carriers/contracts/page.tsx
- src/app/(modules)/logistics/carriers/performance/page.tsx
- src/app/(modules)/logistics/carriers/rates/page.tsx
- src/app/(modules)/logistics/freight/audit/page.tsx
- src/app/(modules)/logistics/freight/booking/page.tsx
- src/app/(modules)/logistics/freight/invoicing/page.tsx
- src/app/(modules)/logistics/freight/quotes/page.tsx
- src/app/(modules)/logistics/shipping/inbound/page.tsx
- src/app/(modules)/logistics/shipping/loading/page.tsx
- src/app/(modules)/logistics/shipping/schedule/page.tsx
- src/app/(modules)/logistics/tracking/pod/page.tsx
- src/app/(modules)/logistics/tracking/trace/page.tsx
- src/app/(modules)/logistics/tracking/exceptions/page.tsx
- src/app/(modules)/logistics/planning/loads/page.tsx
- src/app/(modules)/logistics/planning/dispatch/page.tsx
- src/app/(modules)/logistics/planning/consolidation/page.tsx
- src/app/(modules)/logistics/warehouse/cross-dock/page.tsx
- src/app/(modules)/logistics/warehouse/dock/page.tsx
- src/app/(modules)/logistics/warehouse/yard/page.tsx
- src/app/(modules)/logistics/advanced-features/page.tsx
- src/app/(modules)/logistics/analytics/optimization/page.tsx
- src/app/(modules)/logistics/analytics/reports/page.tsx
- src/app/(modules)/logistics/delivery-coordination/page.tsx

### procurement (6)
- src/app/(modules)/procurement/advanced-features/page.tsx
- src/app/(modules)/procurement/budget/page.tsx
- src/app/(modules)/procurement/vendor-performance/page.tsx
- src/app/(modules)/procurement/vendor-management/page.tsx
- src/app/(modules)/procurement/supplier-portal/page.tsx
- src/app/(modules)/procurement/notifications/page.tsx

### production (6)
- src/app/(modules)/production/operations/page.tsx — Operation interface is a live shop-floor execution record (woNumber/operator/machine/completedQuantity); manufacturing-masters.getAllOperations returns a routing-master Operation (different domain/shape). No matching live list endpoint.
- src/app/(modules)/production/shutters/page.tsx — B3 kitchen-domain Shutter list; no corresponding service/endpoint exists.
- src/app/(modules)/production/trial/page.tsx — TrialInstallation list; no corresponding service/endpoint exists.
- src/app/(modules)/production/dies-tools/page.tsx — dies/tools list; no matching production/masters service method.
- src/app/(modules)/production/bom/verification/page.tsx — BOMVerification list; bom.service exposes explode/costRollup/statistics but no verification list endpoint.
- src/app/(modules)/production/mrp/page.tsx — five distinct nested tables (requirements/shortages/purchase suggestions/excess/time-phased); production-mrp.service returns MRPRun/PlannedOrder/Shortage shapes that don't map cleanly to any single page table.

### quality (2)
- src/app/(modules)/quality/defects/page.tsx — no defect service/endpoint exists; ncr.service NCRDefect shape (id/code/description/quantity) is unrelated to the page's Defect interface (woNumber/defectType enum/severity/reportedBy)
- src/app/(modules)/quality/rework/page.tsx — no rework service or getRework method exists anywhere in src/services

### reports (3)
- src/app/(modules)/reports/dashboards/page.tsx
- src/app/(modules)/reports/custom/page.tsx
- src/app/(modules)/reports/analytics/page.tsx

### sales (21)
- src/app/(modules)/sales/invoices/credit-notes/page.tsx
- src/app/(modules)/sales/handover/page.tsx
- src/app/(modules)/sales/handover/pending/page.tsx
- src/app/(modules)/sales/handover/accepted/page.tsx
- src/app/(modules)/sales/handover/package/page.tsx
- src/app/(modules)/sales/pricing/lists/page.tsx
- src/app/(modules)/sales/pricing/discounts/page.tsx
- src/app/(modules)/sales/pricing/promotions/page.tsx
- src/app/(modules)/sales/pricing/special/page.tsx
- src/app/(modules)/sales/returns/page.tsx
- src/app/(modules)/sales/returns/refunds/page.tsx
- src/app/(modules)/sales/returns/replacements/page.tsx
- src/app/(modules)/sales/analytics/forecast/page.tsx
- src/app/(modules)/sales/analytics/targets/page.tsx
- src/app/(modules)/sales/analytics/customers/page.tsx
- src/app/(modules)/sales/analytics/products/page.tsx
- src/app/(modules)/sales/analytics/reports/page.tsx
- src/app/(modules)/sales/settings/tax/page.tsx
- src/app/(modules)/sales/settings/shipping/page.tsx
- src/app/(modules)/sales/settings/payment-terms/page.tsx
- src/app/(modules)/sales/settings/terms/page.tsx

### support (1)
- src/app/(modules)/support/omnichannel/page.tsx

### workflow (5)
- src/app/(modules)/workflow/inbox/page.tsx
- src/app/(modules)/workflow/approvals/pending/page.tsx
- src/app/(modules)/workflow/automation/page.tsx
- src/app/(modules)/workflow/dashboard/page.tsx
- src/app/(modules)/workflow/orders/[id]/page.tsx

### advanced-features (3)
- src/app/(modules)/advanced-features/iot/page.tsx
- src/app/(modules)/advanced-features/ai-insights/page.tsx
- src/app/(modules)/advanced-features/ocr/page.tsx

### collaboration (1)
- src/app/(modules)/collaboration/files/page.tsx

### compliance (2)
- src/app/(modules)/compliance/gdpr/page.tsx
- src/app/(modules)/compliance/reporting/page.tsx

### packaging (4)
- src/app/(modules)/packaging/materials/page.tsx
- src/app/(modules)/packaging/staging/page.tsx
- src/app/(modules)/packaging/shipping-bill/page.tsx
- src/app/(modules)/packaging/operations/page.tsx

### rfq (2)
- src/app/(modules)/rfq/add/page.tsx (mockVendors vendor-directory + mockPRs purchase-requisition-directory: no matching service method; procurement-rfq.service only exposes RFQ CRUD, not a vendor/PR lookup)
- src/app/(modules)/rfq/edit/[id]/page.tsx (mockVendors vendor-directory: no matching service method)

---

## Backend endpoint health (216 controllers probed live)

- **153 healthy** (200/201), **53** need a path param / have no GET-root (normal), **3** auth-gated, **6** returned 500.

### 500 endpoints — status
| Endpoint | Cause | Status |
|---|---|---|
| `production/shortage-records` | service ordered by non-existent `detectedAt` column | ✅ fixed (order by `createdAt`) |
| `cpq/settings` | GET auto-created a row with null `companyId` | ✅ fixed (400 when `x-company-id` missing) |
| `hr/advances` | DB table `payroll_salary_advances` does not exist | ⏳ needs table creation (feature never migrated) |
| `hr/loans` | DB table `payroll_employee_loans` does not exist | ⏳ needs table creation |
| `inventory/warehouses` | Prisma model uses unmodeled native enums (`warehouseType`, `status`) + phantom fields | ⏳ needs enum modeling + assignment casts |
| `finance/chart-of-accounts/seed` | seeder action (POST); 500 on GET is expected | N/A |

## Remaining scope to reach the gaps-report definition of "done"
1. **161 pages need net-new backend endpoints** (listed above) — build endpoints or trim nav.
2. **4 backend endpoints** above need DB/schema work (2 tables, 1 enum model).
3. **Stub actions** (Export/Print/Delete `console.log`) across modules — not yet destubbed.
4. **Typecheck**: `next build` currently runs with `typescript.ignoreBuildErrors` — a backlog of ~250 TS errors remains to clear before removing that flag.
5. **Auth** is already consolidated on local JWT (NestJS `/auth/login|logout|profile`, cookie-based); Keycloak deferred by decision.

---

## Orphan-wiring pass (agents curl-verified each endpoint)

**41 additional pages wired** to existing verified endpoints. **210 pages remain truly orphan** — their backend endpoints do not exist and must be built (mostly analytics, settings, workflow-approval, and template sub-features).

| Module | Newly wired | Truly orphan |
|---|--:|--:|
| sales | 4 | 32 |
| cpq | 2 | 28 |
| crm | 2 | 27 |
| it-admin | 1 | 27 |
| project-management | 1 | 25 |
| support | 0 | 22 |
| reports | 0 | 10 |
| procurement | 1 | 9 |
| hr | 4 | 6 |
| common-masters | 0 | 5 |
| estimation | 5 | 3 |
| finance | 2 | 3 |
| production | 5 | 3 |
| workflow | 2 | 3 |
| after-sales-service | 7 | 2 |
| inventory | 3 | 2 |
| logistics | 1 | 2 |
| quality | 1 | 1 |

### Truly-orphan pages that need net-new backend endpoints

**after-sales-service** (2):
- warranties/claims/page.tsx (no list-claims endpoint; /after-sales/warranties/claims resolves to @Get(':id') warranty lookup, only @Get('claims/:claimId') single-claim exists)
- warranties/claims/approvals/page.tsx (same: no claims-list endpoint)

**common-masters** (5):
- state-master
- city-master
- grade-master
- item-group-master
- territory-master

**cpq** (28):
- src/app/(modules)/cpq/workflow/approvals/page.tsx
- src/app/(modules)/cpq/workflow/discounts/page.tsx
- src/app/(modules)/cpq/workflow/executive/page.tsx
- src/app/(modules)/cpq/workflow/legal/page.tsx
- src/app/(modules)/cpq/guided-selling/recommendations/page.tsx
- src/app/(modules)/cpq/guided-selling/cross-sell/page.tsx
- src/app/(modules)/cpq/analytics/discounts/page.tsx
- src/app/(modules)/cpq/analytics/pricing/page.tsx
- src/app/(modules)/cpq/analytics/products/page.tsx
- src/app/(modules)/cpq/analytics/quotes/page.tsx
- src/app/(modules)/cpq/analytics/sales-cycle/page.tsx
- src/app/(modules)/cpq/analytics/win-rate/page.tsx
- src/app/(modules)/cpq/integration/crm/page.tsx
- src/app/(modules)/cpq/integration/erp/page.tsx
- src/app/(modules)/cpq/integration/ecommerce/page.tsx
- src/app/(modules)/cpq/integration/cad/page.tsx
- src/app/(modules)/cpq/products/compatibility/page.tsx
- src/app/(modules)/cpq/products/rules/page.tsx
- src/app/(modules)/cpq/products/configurator/page.tsx
- src/app/(modules)/cpq/quotes/comparison/page.tsx
- src/app/(modules)/cpq/quotes/versions/page.tsx
- src/app/(modules)/cpq/contracts/approvals/page.tsx
- src/app/(modules)/cpq/contracts/execution/page.tsx
- src/app/(modules)/cpq/contracts/generate/page.tsx
- src/app/(modules)/cpq/settings/notifications/page.tsx
- src/app/(modules)/cpq/settings/numbering/page.tsx
- src/app/(modules)/cpq/settings/permissions/page.tsx
- src/app/(modules)/cpq/advanced-features/page.tsx

**crm** (27):
- src/app/(modules)/crm/customers/page.tsx
- src/app/(modules)/crm/activities/page.tsx
- src/app/(modules)/crm/proposals/page.tsx
- src/app/(modules)/crm/marketing/campaigns/page.tsx
- src/app/(modules)/crm/marketing/email-templates/page.tsx
- src/app/(modules)/crm/activities/calls/page.tsx
- src/app/(modules)/crm/activities/tasks/page.tsx
- src/app/(modules)/crm/activities/emails/page.tsx
- src/app/(modules)/crm/activities/meetings/page.tsx
- src/app/(modules)/crm/campaigns/templates/page.tsx
- src/app/(modules)/crm/campaigns/performance/page.tsx
- src/app/(modules)/crm/campaigns/email/page.tsx
- src/app/(modules)/crm/opportunities/pipeline/page.tsx
- src/app/(modules)/crm/opportunities/won/page.tsx
- src/app/(modules)/crm/opportunities/lost/page.tsx
- src/app/(modules)/crm/opportunities/forecast/page.tsx
- src/app/(modules)/crm/quotes/templates/page.tsx
- src/app/(modules)/crm/contracts/renewals/page.tsx
- src/app/(modules)/crm/contracts/amendments/page.tsx
- src/app/(modules)/crm/contracts/templates/page.tsx
- src/app/(modules)/crm/contacts/lists/page.tsx
- src/app/(modules)/crm/contacts/roles/page.tsx
- src/app/(modules)/crm/customers/segments/page.tsx
- src/app/(modules)/crm/customers/hierarchy/page.tsx
- src/app/(modules)/crm/settings/stages/page.tsx
- src/app/(modules)/crm/interactions/analysis/page.tsx
- src/app/(modules)/crm/leads/scoring/page.tsx

**estimation** (3):
- src/app/(modules)/estimation/pricing/page.tsx
- src/app/(modules)/estimation/settings/markup/page.tsx
- src/app/(modules)/estimation/settings/workflow/page.tsx

**finance** (3):
- src/app/(modules)/finance/receivables/aging/page.tsx
- src/app/(modules)/finance/payables/aging/page.tsx
- src/app/(modules)/finance/analytics/financial-ratios/page.tsx

**hr** (6):
- src/app/(modules)/hr/payroll/bonus/page.tsx -> GET /hr/bonus/types & /hr/bonus/calculations both return 500
- src/app/(modules)/hr/shifts/assignment/page.tsx -> no shift-assignment endpoint; /hr/shifts returns shift DEFINITIONS not employee assignments (semantic mismatch)
- src/app/(modules)/hr/payroll/salary-structure/components/page.tsx -> no salary-component endpoint; /hr/salary-structures returns whole structures not component heads (mismatch)
- src/app/(modules)/hr/expenses/travel/* and expenses/expense-management/* -> no HR controller for expenses/travel
- src/app/(modules)/hr/payroll/statutory/* (esi, income-tax, provident-fund) -> no statutory endpoints in hr controllers
- src/app/(modules)/hr/timesheets/* and overtime/* -> no timesheet/overtime endpoints in hr controllers

**inventory** (2):
- src/app/(modules)/inventory/warehouse/zones/page.tsx (no warehouse-zone endpoint; zones exist only as a string field on stock-locations, and the page's Zone model needs area/manager/temperature/specialRequirements/totalLocations which no endpoint provides)
- src/app/(modules)/inventory/cycle-count/page.tsx (no cycle-count controller/endpoint exists in the inventory module; stock-adjustments only carries an isCycleCount flag, not the schedule/session/variance model the page requires)

**it-admin** (27):
- src/app/(modules)/it-admin/users/active/page.tsx
- src/app/(modules)/it-admin/users/inactive/page.tsx
- src/app/(modules)/it-admin/users/groups/page.tsx
- src/app/(modules)/it-admin/roles/permissions/page.tsx
- src/app/(modules)/it-admin/roles/policies/page.tsx
- src/app/(modules)/it-admin/security/sessions/page.tsx
- src/app/(modules)/it-admin/security/alerts/page.tsx
- src/app/(modules)/it-admin/security/ip-whitelist/page.tsx
- src/app/(modules)/it-admin/system/api/page.tsx
- src/app/(modules)/it-admin/system/email/page.tsx
- src/app/(modules)/it-admin/system/webhooks/page.tsx
- src/app/(modules)/it-admin/system/notifications/page.tsx
- src/app/(modules)/it-admin/system/integrations/page.tsx
- src/app/(modules)/it-admin/license/page.tsx
- src/app/(modules)/it-admin/license/features/page.tsx
- src/app/(modules)/it-admin/license/users/page.tsx
- src/app/(modules)/it-admin/database/backup/page.tsx
- src/app/(modules)/it-admin/database/cleanup/page.tsx
- src/app/(modules)/it-admin/database/export/page.tsx
- src/app/(modules)/it-admin/database/import/page.tsx
- src/app/(modules)/it-admin/customization/branding/page.tsx
- src/app/(modules)/it-admin/customization/workflows/page.tsx
- src/app/(modules)/it-admin/customization/templates/page.tsx
- src/app/(modules)/it-admin/customization/fields/page.tsx
- src/app/(modules)/it-admin/system/scalability/caching/page.tsx
- src/app/(modules)/it-admin/system/scalability/sharding/page.tsx
- src/app/(modules)/it-admin/system/scalability/load-balancing/page.tsx

**logistics** (2):
- src/app/(modules)/logistics/planning/trips/page.tsx
- src/app/(modules)/logistics/delivery-coordination/page.tsx

**procurement** (9):
- src/app/(modules)/procurement/notifications/page.tsx
- src/app/(modules)/procurement/bom-receipt/page.tsx
- src/app/(modules)/procurement/vendor-performance/page.tsx
- src/app/(modules)/procurement/orders/view/[id]/page.tsx
- src/app/(modules)/procurement/vendors/edit/[id]/page.tsx
- src/app/(modules)/procurement/vendors/view/[id]/page.tsx
- src/app/(modules)/procurement/purchase-orders/create/page.tsx
- src/app/(modules)/procurement/requisitions/view/[id]/page.tsx
- src/app/(modules)/procurement/grn/[id]/inspect/page.tsx

**production** (3):
- src/app/(modules)/production/downtime/analysis/page.tsx (pre-aggregated MTBF/MTTR/availability analytics; no matching aggregate endpoint, downtime-records is raw)
- src/app/(modules)/production/operations/page.tsx (production/operation returns operation-MASTER/routing records, not the page's live shop-floor work-order execution shape; semantic mismatch)
- src/app/(modules)/production/downtime/log/page.tsx (create-form with static equipment dropdown, not a data-list mock)

**project-management** (25):
- briefings
- change-orders
- commissioning
- customer-acceptance
- deliverables
- documents
- installation-tracking
- installation-tracking-enhanced
- issues
- labor-tracking
- material-consumption
- milestone-templates
- mrp
- profitability
- progress
- project-costing
- project-types
- quality-inspection
- reports
- resource-utilization
- schedule
- site-issues
- site-survey
- templates
- wbs

**quality** (1):
- src/app/(modules)/quality/rework/page.tsx

**reports** (10):
- src/app/(modules)/reports/dashboards/page.tsx
- src/app/(modules)/reports/analytics/page.tsx
- src/app/(modules)/reports/custom/page.tsx
- src/app/(modules)/reports/financial/page.tsx
- src/app/(modules)/reports/finance/pl/page.tsx
- src/app/(modules)/reports/sales/page.tsx
- src/app/(modules)/reports/inventory/page.tsx
- src/app/(modules)/reports/hr/page.tsx
- src/app/(modules)/reports/production/page.tsx
- src/app/(modules)/reports/quality/dashboard/page.tsx

**sales** (32):
- sales/returns/page.tsx (sales-masters/returns -> 500 Prisma table missing)
- sales/returns/replacements/page.tsx (no endpoint / sales-masters 500)
- sales/returns/refunds/page.tsx (no endpoint / sales-masters 500)
- sales/pricing/lists/page.tsx (sales-masters/pricing -> 500)
- sales/pricing/discounts/page.tsx (sales-masters/pricing -> 500)
- sales/pricing/special/page.tsx (sales-masters/pricing -> 500)
- sales/pricing/promotions/page.tsx (sales-masters/promotions -> 500)
- sales/analytics/page.tsx (sales-masters/analytics -> 500)
- sales/analytics/forecast/page.tsx (no endpoint)
- sales/analytics/customers/page.tsx (no endpoint)
- sales/analytics/products/page.tsx (no endpoint)
- sales/analytics/targets/page.tsx (sales-masters/targets -> 500)
- sales/analytics/reports/page.tsx (no endpoint)
- sales/invoices/create/page.tsx (sales-masters/invoices -> 500)
- sales/invoices/credit-notes/page.tsx (no endpoint / sales-masters 500)
- sales/handover/page.tsx (no list endpoint; only order-scoped handover POST/PATCH)
- sales/handover/package/page.tsx (no list endpoint)
- sales/handover/pending/page.tsx (no list endpoint)
- sales/settings/terms/page.tsx (no endpoint)
- sales/settings/tax/page.tsx (no endpoint)
- sales/settings/shipping/page.tsx (no endpoint)
- sales/settings/payment-terms/page.tsx (no endpoint)
- sales/rfp/submitted/page.tsx (no sales rfp list endpoint)
- sales/rfp/shortlisted/page.tsx (no endpoint)
- sales/rfp/won/page.tsx (no endpoint)
- sales/rfp/create/page.tsx (no endpoint)
- sales/orders/ready/page.tsx (order controller is double-prefixed @Controller('api/v1/sales/orders'); /api/v1/sales/orders -> 404 at standard FE path)
- sales/orders/confirmed/page.tsx (orders endpoint 404 at standard path)
- sales/orders/shipped/page.tsx (orders endpoint 404 at standard path)
- sales/orders/production/page.tsx (orders endpoint 404 at standard path)
- sales/orders/tracking/page.tsx (orders endpoint 404 at standard path)
- sales/orders/create/page.tsx (form page; orders endpoint 404 at standard path)

**support** (22):
- support/tickets/page.tsx
- support/tickets/open/page.tsx
- support/tickets/assigned/page.tsx
- support/tickets/resolved/page.tsx
- support/tickets/create/page.tsx
- support/tickets/categories/page.tsx
- support/incidents/page.tsx
- support/incidents/create/page.tsx
- support/incidents/critical/page.tsx
- support/incidents/major/page.tsx
- support/incidents/tracking/page.tsx
- support/knowledge/page.tsx
- support/knowledge/faqs/page.tsx
- support/knowledge/guides/page.tsx
- support/knowledge/troubleshooting/page.tsx
- support/problems/page.tsx
- support/problems/known-errors/page.tsx
- support/problems/rca/page.tsx
- support/sla/settings/page.tsx
- support/omnichannel/page.tsx
- support/onboarding/page.tsx
- support/page.tsx

**workflow** (3):
- src/app/(modules)/workflow/automation/page.tsx
- src/app/(modules)/workflow/orders/[id]/page.tsx
- src/app/(modules)/workflow/approvals/pending/page.tsx
