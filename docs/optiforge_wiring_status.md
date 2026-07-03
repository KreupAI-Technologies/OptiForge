# OptiForge — Page Wiring Status & Endpoints To Build

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
