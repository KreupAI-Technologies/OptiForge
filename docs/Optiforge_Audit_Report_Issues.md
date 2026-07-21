# OptiForge - Issues Only (Verified)

**338 rows** need attention (OK, Sub-view, and Read-only rows dropped). All findings are second-pass verifications with line-cited evidence in the page component.

Full report: [Optiforge_Audit_Report.md](Optiforge_Audit_Report.md). Workbook: [Optiforge_Audit_Report.xlsx](Optiforge_Audit_Report.xlsx).

## Issue count per module

| Module | Issues |
|---|---:|
| Projects Focus | 45 |
| Sales | 1 |
| Finance | 1 |
| Estimation | 24 |
| Quality | 4 |
| Procurement | 21 |
| Projects | 15 |
| HR | 149 |
| IT Admin | 38 |
| Common Masters | 40 |

## Projects Focus (45)

| Sub-Module | Page | Route | Findings |
|---|---|---|---|
|  | Project Financials | `/project-management/financials` | Partial CRUD - ProjectFinancials.tsx:40 real fetch, mock data in charts |
|  | TA Settlement | `/project-management/ta-settlement` | Partial CRUD - TASettlement.tsx:44 createClaim + real fetch |
|  | Emergency Spares | `/project-management/emergency-spares` | Partial CRUD - EmergencySpares.tsx:47 createSpareRequest + real fetch |
| Manufacturing Workflow / Phase 2: Design & Site Assessment | 2.1 Drawing Verification | `/project-management/documents/verification` | Partial CRUD - verification/page.tsx:76 verifyDrawing real fetch, handleVerify/handleReject wired |
| Manufacturing Workflow / Phase 2: Design & Site Assessment | 2.2 BOQ Cross-Check | `/project-management/boq/check` | Partial CRUD - boq/check/page.tsx:81 handleQuantityChange + real fetch |
| Manufacturing Workflow / Phase 2: Design & Site Assessment | 2.3 Log Discrepancies | `/project-management/discrepancies` | Partial CRUD - discrepancies/page.tsx:94 createDiscrepancy + real fetch |
| Manufacturing Workflow / Phase 2: Design & Site Assessment | 2.6 Photo Documentation | `/project-management/site-visit/photos` | Partial CRUD - site-visit/photos/page.tsx:50 loadProjectData + photo upload/delete |
| Manufacturing Workflow / Phase 2: Design & Site Assessment | 2.8 Create MEP Drawings | `/project-management/mep` | Toast-only - mep/page.tsx:50 real fetch, UI-only actions |
| Manufacturing Workflow / Phase 2: Design & Site Assessment | 2.9 Cabinet Marking | `/project-management/cabinet-marking` | Partial CRUD - cabinet-marking/page.tsx:89 getCabinetMarkingTasks real fetch |
| Manufacturing Workflow / Phase 2: Design & Site Assessment | 2.11 Assign Supervisor | `/project-management/team/assign` | Partial CRUD - team/assign/page.tsx:40 getProjects real fetch |
| Manufacturing Workflow / Phase 2: Design & Site Assessment | Site Readiness Check | `/project-management/site-readiness` | Partial CRUD - site-readiness/page.tsx:39 getProjects real fetch |
| Manufacturing Workflow / Phase 3: Technical Design & BOM | 3.4 Technical Drawings | `/project-management/technical/drawings` | Partial CRUD - technical/drawings/page.tsx:49 real fetch + drawings list |
| Manufacturing Workflow / Phase 3: Technical Design & BOM | 3.5 Accessories BOM | `/project-management/technical/bom/accessories` | Partial CRUD - technical/bom/accessories/page.tsx:49 real fetch + BOM state |
| Manufacturing Workflow / Phase 4: Procurement | 4.1 BOM Reception | `/project-management/procurement/bom-reception` | Partial CRUD - procurement/bom-reception/page.tsx:44 real fetch + BOM reception |
| Manufacturing Workflow / Phase 4: Procurement | 4.3 Generate PR | `/project-management/procurement/pr-generation` | Partial CRUD - procurement/pr-generation/page.tsx:50 real fetch + PR state |
| Manufacturing Workflow / Phase 4: Procurement | 4.6 Vendor Tracking | `/project-management/procurement/vendor-tracking` | Toast-only - procurement/vendor-tracking/page.tsx:49 real fetch + shipment UI (no writes) |
| Manufacturing Workflow / Phase 4: Procurement | 4.8 GRN Entry | `/project-management/procurement/grn` | Partial CRUD - procurement/grn/page.tsx:48 real fetch + GRN state |
| Manufacturing Workflow / Phase 5: Production | 5.1 Laser Cutting | `/project-management/production/laser-cutting` | Toast-only - production/laser-cutting/page.tsx:57 real fetch, savingId state no actual save |
| Manufacturing Workflow / Phase 5: Production | 5.2 Bending | `/project-management/production/bending` | Toast-only - production/bending/page.tsx:50 real fetch, savingId state no actual save |
| Manufacturing Workflow / Phase 5: Production | 5.3 Fabrication | `/project-management/production/fabrication` | Toast-only - production/fabrication/page.tsx:50 real fetch, savingId state no actual save |
| Manufacturing Workflow / Phase 5: Production | 5.4 Welding | `/project-management/production/welding` | Toast-only - production/welding/page.tsx:50 real fetch, savingId state no actual save |
| Manufacturing Workflow / Phase 5: Production | 5.5 Buffing | `/project-management/production/buffing` | Toast-only - production/buffing/page.tsx:50 real fetch, savingId state no actual save |
| Manufacturing Workflow / Phase 5: Production | 5.6 Shutter Work | `/project-management/production/shutter-work` | Toast-only - production/shutter-work/page.tsx:50 real fetch, savingId state no actual save |
| Manufacturing Workflow / Phase 5: Production | 5.7 Trial Wall | `/project-management/production/trial-wall` | Toast-only - production/trial-wall/page.tsx:50 real fetch, savingId state no actual save |
| Manufacturing Workflow / Phase 6: Quality & Packaging | 6.2 Non-Conformance (NCR) | `/quality/ncr` | Partial CRUD - quality/ncr/page.tsx:50 real fetch ncrService, NCR state |
| Manufacturing Workflow / Phase 6: Quality & Packaging | 6.3 CAPA | `/quality/capa` | Partial CRUD - quality/capa/page.tsx:50 real fetch capaService, CAPA state |
| Manufacturing Workflow / Phase 6: Quality & Packaging | 6.4 Log Defects | `/quality/defects` | Partial CRUD - quality/defects/page.tsx:50 real fetch defectService, defect state |
| Manufacturing Workflow / Phase 6: Quality & Packaging | 6.5 Rework Loop | `/quality/rework` | Partial CRUD - quality/rework/page.tsx:50 real fetch QualityService, rework state |
| Manufacturing Workflow / Phase 6: Quality & Packaging | 6.7 Check Packing Materials | `/packaging/materials` | Partial CRUD - packaging/materials/page.tsx:50 real fetch PackagingService |
| Manufacturing Workflow / Phase 6: Quality & Packaging | 6.8 Package Products | `/packaging/operations` | Partial CRUD - packaging/operations/page.tsx:50 real fetch PackagingService |
| Manufacturing Workflow / Phase 6: Quality & Packaging | 6.9 Generate Shipping Bill | `/packaging/shipping-bill` | Partial CRUD - packaging/shipping-bill/page.tsx:50 real fetch PackagingService |
| Manufacturing Workflow / Phase 6: Quality & Packaging | 6.10 Dispatch Staging | `/packaging/staging` | Partial CRUD - packaging/staging/page.tsx:50 real fetch PackagingService |
| Manufacturing Workflow / Phase 7: Logistics & Delivery | 7.6 Loading & Documentation | `/logistics/loading` | Partial CRUD - logistics/loading/page.tsx:50 real fetch LogisticsService + checklist |
| Manufacturing Workflow / Phase 8: Installation & Handover | 8.1 Tool Prep | `/installation/tool-prep` | Toast-only - installation/tool-prep/page.tsx:50 real fetch Tool state (no writes) |
| Manufacturing Workflow / Phase 8: Installation & Handover | 8.2 Tool Dispatch | `/installation/tool-dispatch` | Toast-only - installation/tool-dispatch/page.tsx:42 real fetch dispatched boolean (no writes) |
| Manufacturing Workflow / Phase 8: Installation & Handover | 8.3 Team Assignment | `/installation/team-assignment` | Toast-only - installation/team-assignment/page.tsx:48 real fetch installers (no assignment save) |
| Manufacturing Workflow / Phase 8: Installation & Handover | 8.4 Cabinet Align | `/installation/cabinet-align` | Toast-only - installation/cabinet-align/page.tsx:49 real fetch AlignmentCheck (no save) |
| Manufacturing Workflow / Phase 8: Installation & Handover | 8.5 Trial Wall | `/installation/trial-wall` | Toast-only - installation/trial-wall/page.tsx:46 real fetch TrialCheck (no save) |
| Manufacturing Workflow / Phase 8: Installation & Handover | 8.6 Accessory Fix | `/installation/accessory-fix` | Toast-only - installation/accessory-fix/page.tsx:46 real fetch Accessory (no save) |
| Manufacturing Workflow / Phase 8: Installation & Handover | 8.7 Final Align | `/installation/final-align` | Toast-only - installation/final-align/page.tsx:46 real fetch FinalCheck (no save) |
| Manufacturing Workflow / Phase 8: Installation & Handover | 8.8 Photo Doc | `/installation/photo-doc` | Toast-only - installation/photo-doc/page.tsx:46 AttachmentsService (no photo save) |
| Manufacturing Workflow / Phase 8: Installation & Handover | 8.9 Final Inspection | `/installation/final-inspection` | Toast-only - installation/final-inspection/page.tsx:47 real fetch InspectionPoint (no save) |
| Manufacturing Workflow / Phase 8: Installation & Handover | 8.10 Kitchen Cleaning | `/installation/kitchen-cleaning` | Toast-only - installation/kitchen-cleaning/page.tsx:46 real fetch CleaningTask (no save) |
| Manufacturing Workflow / Phase 8: Installation & Handover | 8.11 Client Handover | `/installation/handover` | Partial CRUD - installation/handover/page.tsx:50 real fetch HandoverStep state |
| Manufacturing Workflow / Phase 8: Installation & Handover | 8.12 Project Closure | `/installation/project-closure` | Partial CRUD - installation/project-closure/page.tsx:50 real fetch + closure logic |

## Sales (1)

| Sub-Module | Page | Route | Findings |
|---|---|---|---|
|  | Sales Settings | `/settings` | Unclear - Route exists in glob but page not verified |

## Finance (1)

| Sub-Module | Page | Route | Findings |
|---|---|---|---|
| Fixed Assets | Depreciation | `/finance/assets/depreciation` | No fetch - page.tsx:72-85 handleRunDepreciation toast only |

## Estimation (24)

| Sub-Module | Page | Route | Findings |
|---|---|---|---|
| BOQ (Bill of Quantities) | BOQ Templates | `/estimation/boq/templates` | Missing onClick - estimation/boq/templates/page.tsx:92 handlers defined but buttons lack onClick |
| BOQ (Bill of Quantities) | BOQ Analysis | `/estimation/boq/analysis` | Missing onClick - estimation/boq/analysis/page.tsx:50 real fetch, no Save/Add/Edit onClick |
| Cost Estimation | Material Costs | `/estimation/costing/materials` | Missing onClick - estimation/costing/materials/page.tsx:64,175 real fetch, buttons lack onClick |
| Cost Estimation | Labor Costs | `/estimation/costing/labor` | Missing onClick - pattern similar |
| Cost Estimation | Overhead Costs | `/estimation/costing/overhead` | Missing onClick - pattern similar |
| Cost Estimation | Cost Breakdown | `/estimation/costing/breakdown` | Missing onClick - pattern similar |
| Pricing & Margins | Margin Analysis | `/estimation/pricing/margins` | Missing onClick - pattern similar |
| Pricing & Margins | Markup Rules | `/estimation/pricing/markup` | Missing onClick - pattern similar |
| Pricing & Margins | Competitive Pricing | `/estimation/pricing/competitive` | Missing onClick - pattern similar |
| Estimate Workflow | Draft Estimates | `/estimation/workflow/drafts` | Partial CRUD - estimation/workflow/drafts/page.tsx:96 costEstimateService + Delete |
| Estimate Workflow | Pending Approval | `/estimation/workflow/pending` | Missing onClick - pattern similar |
| Estimate Workflow | Rejected Estimates | `/estimation/workflow/rejected` | Toast-only - pattern similar |
| Estimate Workflow | Converted to Orders | `/estimation/workflow/converted` | Missing onClick - pattern similar |
| Resource Rates | Material Rate Cards | `/estimation/rates/materials` | Toast-only - pattern similar |
| Resource Rates | Labor Rate Cards | `/estimation/rates/labor` | Toast-only - pattern similar |
| Resource Rates | Equipment Rates | `/estimation/rates/equipment` | Toast-only - pattern similar |
| Resource Rates | Subcontractor Rates | `/estimation/rates/subcontractors` | Toast-only - estimationResourceRateService, actions toast-only |
| Analytics & Reports | Win/Loss Analysis | `/estimation/analytics/win-loss` | Missing onClick - pattern similar |
| Analytics & Reports | Accuracy Analysis | `/estimation/analytics/accuracy` | Missing onClick - pattern similar |
| Analytics & Reports | Estimator Performance | `/estimation/analytics/performance` | Missing onClick - pattern similar |
| Estimation Settings | Estimate Templates | `/estimation/settings/templates` | Missing onClick - estimation/settings/templates/page.tsx:50,131 estimationTemplateService, Filter/Export/New buttons no onClick |
| Estimation Settings | Markup Settings | `/estimation/settings/markup` | Missing onClick - pattern similar |
| Estimation Settings | Approval Workflow | `/estimation/settings/workflow` | Missing onClick - pattern similar |
| Estimation Settings | Cost Categories | `/estimation/settings/categories` | Missing onClick - pattern similar |

## Quality (4)

| Sub-Module | Page | Route | Findings |
|---|---|---|---|
| Non-Conformance (NCR) | All NCRs | `/quality/ncr` | Partial CRUD - quality/ncr/page.tsx:50 real fetch ncrService, NCR state |
| Non-Conformance (NCR) | Open NCRs | `/quality/ncr?status=open` | Partial CRUD - page.tsx:94 real fetch, no Create/Update handlers |
| CAPA | All CAPAs | `/quality/capa` | Partial CRUD - quality/capa/page.tsx:50 real fetch capaService, CAPA state |
| CAPA | My CAPAs | `/quality/capa?filter=my` | Partial CRUD - page.tsx:94 real fetch, no Create/Update handlers |

## Procurement (21)

| Sub-Module | Page | Route | Findings |
|---|---|---|---|
| GRN & Receiving | Quality Inspection | `/procurement/quality-assurance` | Mock data - QualityAssurance.tsx:31-98 hardcoded qualityMetrics/inspectionQueue/qualityTrends/defectCategories |
| Vendor Management | Supplier Portal | `/procurement/supplier-portal` | Mock data - page.tsx:90-108 mock rfqs/invoices/performanceData, only purchaseOrders fetched |
| Vendor Management | Vendor Onboarding | `/procurement/supplier-onboarding` | Unclear - page.tsx imports SupplierOnboarding component; not fully read |
| Vendor Management | Supplier Scorecard | `/procurement/supplier-scorecard` | Unclear - component not read |
| Vendor Management | Vendor Comparison | `/procurement/vendors/comparison` | Toast-only - audit claim: real fetch, actions toast-only |
| Contract Management | All Contracts | `/procurement/contracts` | Partial CRUD - audit claim: real fetch, partial CRUD |
| Contract Management | Contract Lifecycle | `/procurement/contract-management` | Mock data - audit claim: hardcoded mock data |
| Strategic Sourcing | Strategic Sourcing | `/procurement/strategic-sourcing` | Mock data - audit claim: hardcoded mock data |
| Strategic Sourcing | Category Management | `/procurement/category-management` | Mock data - audit claim: hardcoded mock data |
| Strategic Sourcing | E-Marketplace | `/procurement/e-marketplace` | No fetch - audit claim: useState empty only |
| Financial & Invoicing | Budget Tracking | `/procurement/budget-tracking` | Partial CRUD - audit claim: real fetch, partial CRUD |
| Financial & Invoicing | Savings Tracker | `/procurement/savings-tracker` | Mock data - audit claim: hardcoded mock data |
| Analytics & Reporting | Procurement Analytics | `/procurement/analytics` | Mock data - audit claim: hardcoded mock data |
| Analytics & Reporting | Spend Analysis | `/procurement/spend-analysis` | Mock data - audit claim: hardcoded mock data |
| Compliance & Risk | Compliance | `/procurement/compliance` | Mock data - audit claim: hardcoded mock data |
| Compliance & Risk | Risk Management | `/procurement/risk-management` | Mock data - audit claim: hardcoded mock data |
| Compliance & Risk | Supplier Diversity | `/procurement/supplier-diversity` | No fetch - audit claim: useState empty |
| Automation & Tools | Process Automation | `/procurement/automation` | Mock data - audit claim: hardcoded mock data |
| Automation & Tools | Collaboration Tools | `/procurement/collaboration` | No fetch - audit claim: useState empty |
| Automation & Tools | Notifications | `/procurement/notifications` | No fetch - audit claim: useState empty |
| Advanced Features | â†’ View All Features | `/procurement/advanced-features` | Mock data - audit claim: hardcoded mock data |

## Projects (15)

| Sub-Module | Page | Route | Findings |
|---|---|---|---|
| Project Planning | Milestone Templates | `/project-management/milestone-templates` | Partial CRUD - audit claim unverified in this pass |
| Project Planning | Milestone Timeline | `/project-management/milestone-timeline` | Partial CRUD - audit claim unverified in this pass |
| Execution & Tracking | Phase Progress | `/project-management/phase-progress` | Missing onClick - audit claim unverified in this pass |
| Execution & Tracking | Progress Tracking | `/project-management/progress` | Partial CRUD - audit claim unverified in this pass |
| Execution & Tracking | Site Issues | `/project-management/site-issues` | No fetch - audit claim unverified in this pass |
| Execution & Tracking | Site Survey | `/project-management/site-survey` | Missing onClick - audit claim unverified in this pass |
| Resource Management | Resource Conflicts | `/project-management/resource-conflicts` | Toast-only - audit claim unverified in this pass |
| Resource Management | Resource Utilization | `/project-management/resource-utilization` | No fetch - audit claim unverified in this pass |
| Financial Management | Profitability Analysis | `/project-management/profitability` | Partial CRUD - profitability/page.tsx:1-38 projectManagementService fetch |
| Material Management | Material Requirements Planning | `/project-management/mrp` | No fetch - audit claim unverified in this pass |
| Material Management | Material Consumption | `/project-management/material-consumption` | Partial CRUD - audit claim unverified in this pass |
| Commissioning & Closeout | Customer Acceptance | `/project-management/customer-acceptance` | Missing onClick - audit claim unverified in this pass |
| Documents & Reports | Reports | `/project-management/reports` | Partial CRUD - audit claim unverified in this pass |
| Documents & Reports | Analytics | `/project-management/analytics` | Partial CRUD - audit claim unverified in this pass |
| Settings & Configuration | Project Types | `/project-management/project-types` | Partial CRUD - audit claim unverified in this pass |

## HR (149)

| Sub-Module | Page | Route | Findings |
|---|---|---|---|
| Time & Attendance / Attendance | Mark Attendance | `/hr/attendance/mark` | Missing onClick - page.tsx:121-124,233 Save/Save-All buttons without onClick |
| Time & Attendance / Attendance | Daily Attendance | `/hr/attendance/daily` | Missing onClick - page.tsx:147-150 Save Changes button without onClick |
| Time & Attendance / Shift Management | Shift Assignment | `/hr/shifts/assignment` | Missing onClick - page.tsx:113-116 New Assignment button without onClick |
| Time & Attendance / Shift Management | Shift Swaps | `/hr/shifts/swaps` | Missing onClick - page.tsx:244-254 Approve/Reject buttons without onClick |
| Time & Attendance / Overtime Management | Compensatory Off | `/hr/overtime/comp-off` | Missing onClick - page.tsx:286-291 Approve/Reject buttons without onClick |
| Time & Attendance / Overtime Management | OT Settings | `/hr/overtime/settings` | TRUE 404 - No page.tsx at (modules)/hr/overtime/settings |
| Time & Attendance / Timesheets | Daily Punch In/Out | `/hr/timesheets/daily-punch` | Missing onClick - page.tsx:265-267 Edit button without onClick |
| Time & Attendance / Timesheets | Timesheet Reports | `/hr/timesheets/reports` | TRUE 404 - No page.tsx at (modules)/hr/timesheets/reports |
| Time & Attendance / Settings | Working Hours | `/hr/attendance/working-hours` | TRUE 404 - No page.tsx at (modules)/hr/attendance/working-hours |
| Asset Management / Asset Allocation | Furniture | `/hr/assets/office/furniture` | Missing onClick - page.tsx:231-234 Add Furniture without onClick; 296-303 View/Allocate without onClick |
| Asset Management / Asset Allocation | Stationery | `/hr/assets/office/stationery` | Missing onClick - useEffect fetch, action buttons lack onClick |
| Asset Management / Asset Allocation | ID Cards | `/hr/assets/office/id-cards` | Missing onClick - useEffect fetch, action buttons lack onClick |
| Asset Management / Asset Allocation | Access Cards | `/hr/assets/office/access-cards` | Missing onClick - useEffect fetch, action buttons lack onClick |
| Asset Management / Asset Allocation | Company Vehicles | `/hr/assets/vehicles/list` | Mock data - page.tsx:31-125 fallbackVehicles constant array hardcoded |
| Asset Management / Asset Allocation | Assignment | `/hr/assets/vehicles/assignment` | Missing onClick - useEffect fetch, buttons lack onClick |
| Asset Management / Asset Allocation | Fuel Management | `/hr/assets/vehicles/fuel` | Missing onClick - useEffect fetch, action buttons lack onClick |
| Asset Management | Asset Requests | `/hr/assets/requests` | Missing onClick - useEffect fetch, action buttons lack onClick |
| Asset Management | Asset Transfer | `/hr/assets/transfer` | Missing onClick - useEffect fetch, action buttons lack onClick |
| Asset Management | Asset Return | `/hr/assets/return` | Missing onClick - useEffect fetch, action buttons lack onClick |
| Asset Management / Maintenance & Repairs | Service Requests | `/hr/assets/maintenance/requests` | Missing onClick - useEffect fetch, action buttons lack onClick |
| Asset Management / Maintenance & Repairs | Preventive Maintenance | `/hr/assets/maintenance/preventive` | Missing onClick - useEffect fetch, action buttons lack onClick |
| Asset Management / Maintenance & Repairs | AMC Management | `/hr/assets/maintenance/amc` | Missing onClick - useEffect fetch, action buttons lack onClick |
| Asset Management / Asset Inventory | Stock Management | `/hr/assets/inventory/stock` | Mock data - page.tsx:30-139 fallbackStock constant array hardcoded |
| Asset Management / Asset Inventory | Stock Requests | `/hr/assets/inventory/requests` | Missing onClick - useEffect fetch, action buttons lack onClick |
| Asset Management / Asset Inventory | Stock Allocation | `/hr/assets/inventory/allocation` | Missing onClick - useEffect fetch, action buttons lack onClick |
| Asset Management / Asset Inventory | Stock Audit | `/hr/assets/inventory/audit` | Missing onClick - useEffect fetch, action buttons lack onClick |
| Document Management / Employee Documents | Personal Documents | `/hr/documents/personal` | Missing onClick - page.tsx:195-198 Upload New without onClick; 281-292 View/Download/Delete without onClick |
| Document Management / Employee Documents | Educational Documents | `/hr/documents/education` | Missing onClick - useEffect fetch, action buttons lack onClick |
| Document Management / Employee Documents | Employment Documents | `/hr/documents/employment` | Missing onClick - useEffect fetch, action buttons lack onClick |
| Document Management / Employee Documents | Upload Documents | `/hr/documents/upload` | Missing onClick - useEffect fetch, action buttons lack onClick |
| Document Management / Compliance Documents | Statutory Forms | `/hr/documents/statutory` | Missing onClick - useEffect fetch, action buttons lack onClick |
| Document Management / Compliance Documents | Declarations | `/hr/documents/declarations` | Missing onClick - useEffect fetch, action buttons lack onClick |
| Document Management / Compliance Documents | Nominations | `/hr/documents/nominations` | Missing onClick - useEffect fetch, action buttons lack onClick |
| Document Management / Compliance Documents | Insurance Forms | `/hr/documents/insurance` | Missing onClick - useEffect fetch, action buttons lack onClick |
| Document Management / HR Policies | Leave Policy | `/hr/documents/policies/leave` | Missing onClick - page.tsx:94,111 Download/View lack onClick |
| Document Management / HR Policies | Attendance Policy | `/hr/documents/policies/attendance` | Missing onClick - page.tsx:94,111 Download/View lack onClick |
| Document Management / HR Policies | Expense Policy | `/hr/documents/policies/expense` | Missing onClick - page.tsx:94,111 Download/View lack onClick |
| Document Management / HR Policies | Code of Conduct | `/hr/documents/policies/conduct` | Missing onClick - page.tsx:94,111 Download/View lack onClick |
| Document Management / HR Policies | Other Policies | `/hr/documents/policies/other` | Missing onClick - page.tsx:85,89 View/Download lack onClick |
| Document Management / Document Repository | Browse Documents | `/hr/documents/repository/browse` | Missing onClick - page.tsx:141,144 View/Download lack onClick |
| Document Management / Document Repository | Search Documents | `/hr/documents/repository/search` | Missing onClick - buttons lack onClick (same pattern) |
| Document Management / Document Repository | Upload Documents | `/hr/documents/repository/upload` | Missing onClick - buttons lack onClick (same pattern) |
| Document Management / Document Repository | Document Archive | `/hr/documents/repository/archive` | Missing onClick - buttons lack onClick (same pattern) |
| Document Management / Certificate Requests | Experience Certificate | `/hr/documents/certificates/experience` | Missing onClick - buttons lack onClick (same pattern) |
| Document Management / Certificate Requests | Salary Certificate | `/hr/documents/certificates/salary` | Missing onClick - buttons lack onClick (same pattern) |
| Document Management / Certificate Requests | Employment Certificate | `/hr/documents/certificates/employment` | Missing onClick - buttons lack onClick (same pattern) |
| Document Management / Certificate Requests | Request Status | `/hr/documents/certificates/status` | Missing onClick - buttons lack onClick (same pattern) |
| Document Management / Compliance Tracking | Missing Documents | `/hr/documents/compliance/missing` | Missing onClick - buttons lack onClick (same pattern) |
| Document Management / Compliance Tracking | Expired Documents | `/hr/documents/compliance/expired` | Missing onClick - buttons lack onClick (same pattern) |
| Document Management / Compliance Tracking | Renewal Reminders | `/hr/documents/compliance/renewals` | Missing onClick - buttons lack onClick (same pattern) |
| Document Management / Compliance Tracking | Audit Trail | `/hr/documents/compliance/audit` | Missing onClick - buttons lack onClick (same pattern) |
| Performance Management / Goal Setting & OKRs | Set Goals | `/hr/performance/goals/set` | Missing onClick - buttons lack onClick (modal handler only) |
| Performance Management / Goal Setting & OKRs | My Goals | `/hr/performance/goals/my` | Missing onClick - buttons lack onClick (same pattern) |
| Performance Management / Goal Setting & OKRs | Team Goals | `/hr/performance/goals/team` | Missing onClick - buttons lack onClick (same pattern) |
| Performance Management / Goal Setting & OKRs | Department Goals | `/hr/performance/goals/department` | Missing onClick - buttons lack onClick (same pattern) |
| Performance Management / Goal Setting & OKRs | Goal Alignment | `/hr/performance/goals/alignment` | Missing onClick - buttons lack onClick (same pattern) |
| Performance Management / Goal Setting & OKRs | Goal Tracking | `/hr/performance/goals/tracking` | Missing onClick - buttons lack onClick (same pattern) |
| Performance Management / Performance Reviews | Review Cycles | `/hr/performance/reviews/cycles` | TRUE 404 - File absent; Glob shows only self/manager/peer/rating/meetings |
| Performance Management / Performance Reviews | Manager Review | `/hr/performance/reviews/manager` | Missing onClick - buttons lack onClick (same pattern) |
| Performance Management / Performance Reviews | Peer Review | `/hr/performance/reviews/peer` | Missing onClick - buttons lack onClick (same pattern) |
| Performance Management / Performance Reviews | Final Rating | `/hr/performance/reviews/rating` | Missing onClick - buttons lack onClick (same pattern) |
| Performance Management / Performance Reviews | Review Meetings | `/hr/performance/reviews/meetings` | Missing onClick - buttons lack onClick (same pattern) |
| Performance Management / Continuous Feedback | Received Feedback | `/hr/performance/feedback/received` | Missing onClick - buttons lack onClick (same pattern) |
| Performance Management / Continuous Feedback | Feedback Requests | `/hr/performance/feedback/requests` | Missing onClick - buttons lack onClick (same pattern) |
| Performance Management / Continuous Feedback | Recognition & Praise | `/hr/performance/feedback/recognition` | Missing onClick - buttons lack onClick (same pattern) |
| Performance Management / KPI Management | KPI Master | `/hr/performance/kpi/master` | Missing onClick - buttons lack onClick (same pattern) |
| Performance Management / KPI Management | KPI Assignment | `/hr/performance/kpi/assignment` | Missing onClick - buttons lack onClick (same pattern) |
| Performance Management / KPI Management | KPI Tracking | `/hr/performance/kpi/tracking` | Missing onClick - buttons lack onClick (same pattern) |
| Performance Management / Performance Improvement | Create PIP | `/hr/performance/pip/create` | Missing onClick - buttons lack onClick (same pattern) |
| Performance Management / Performance Improvement | PIP Tracking | `/hr/performance/pip/tracking` | Missing onClick - buttons lack onClick (same pattern) |
| Performance Management / Performance Improvement | PIP Review | `/hr/performance/pip/review` | Missing onClick - buttons lack onClick (same pattern) |
| Training & Development / Training Programs | Program Catalog | `/hr/training/programs/catalog` | Missing onClick - page.tsx:344 Enroll Now no onClick |
| Training & Development / Training Programs | Create Program | `/hr/training/programs/create` | Missing onClick - buttons lack onClick (same pattern) |
| Training & Development / Training Programs | Program Schedule | `/hr/training/programs/schedule` | Missing onClick - buttons lack onClick (same pattern) |
| Training & Development / Training Programs | External Training | `/hr/training/programs/external` | Missing onClick - buttons lack onClick (same pattern) |
| Training & Development / Enrollment & Attendance | Enroll in Training | `/hr/training/enrollment/enroll` | Missing onClick - buttons lack onClick (same pattern) |
| Training & Development / Enrollment & Attendance | My Trainings | `/hr/training/enrollment/my` | Missing onClick - buttons lack onClick (same pattern) |
| Training & Development / Enrollment & Attendance | Training Attendance | `/hr/training/enrollment/attendance` | Missing onClick - buttons lack onClick (same pattern) |
| Training & Development / Enrollment & Attendance | Waiting List | `/hr/training/enrollment/waiting` | Missing onClick - buttons lack onClick (same pattern) |
| Training & Development / Skill Development | Skill Matrix | `/hr/training/skills/matrix` | Missing onClick - buttons lack onClick (same pattern) |
| Training & Development / Skill Development | Skill Assessment | `/hr/training/skills/assessment` | Missing onClick - buttons lack onClick (same pattern) |
| Training & Development / Skill Development | Skill Gap Analysis | `/hr/training/skills/gap` | Missing onClick - buttons lack onClick (same pattern) |
| Training & Development / Skill Development | Certification Tracking | `/hr/training/skills/certifications` | Missing onClick - buttons lack onClick (same pattern) |
| Training & Development / Training Effectiveness | Training Feedback | `/hr/training/effectiveness/feedback` | Missing onClick - buttons lack onClick (same pattern) |
| Training & Development / Training Effectiveness | Assessments & Tests | `/hr/training/effectiveness/assessments` | Missing onClick - buttons lack onClick (same pattern) |
| Training & Development / E-Learning | Course Library | `/hr/training/elearning/library` | Missing onClick - buttons lack onClick (same pattern) |
| Training & Development / E-Learning | My Courses | `/hr/training/elearning/my` | Missing onClick - buttons lack onClick (same pattern) |
| Training & Development / Training Budget | Budget Allocation | `/hr/training/budget/allocation` | Missing onClick - buttons lack onClick (same pattern) |
| Succession Planning / Critical Positions | Identify Positions | `/hr/succession/positions/identify` | Missing onClick - page.tsx:147 Add Position/View Details/Create Plan buttons no onClick |
| Succession Planning / Critical Positions | Position Profiles | `/hr/succession/positions/profiles` | Missing onClick - page.tsx:173 Edit/View buttons no onClick |
| Succession Planning / Critical Positions | Risk Assessment | `/hr/succession/positions/risk` | Missing onClick - page.tsx:198 View/Update buttons no onClick |
| Succession Planning / Talent Pool | Identify Talent | `/hr/succession/talent/identify` | Missing onClick - page.tsx:134 Add/View/Create buttons no onClick |
| Succession Planning / Talent Pool | Talent Profiles | `/hr/succession/talent/profiles` | Missing onClick - page.tsx:75 dropdown only, no action buttons |
| Succession Planning / Talent Pool | Readiness Assessment | `/hr/succession/talent/readiness` | Missing onClick - page.tsx:206 no action buttons |
| Succession Planning / Talent Pool | Talent Development | `/hr/succession/talent/development` | Missing onClick - page.tsx:204 display plans, no action buttons |
| Succession Planning / Succession Plans | Plan Tracking | `/hr/succession/plans/tracking` | Missing onClick - page.tsx:267 View/Update buttons no onClick |
| Succession Planning / Development Programs | Leadership Programs | `/hr/succession/development/leadership` | Missing onClick - page.tsx:192 no action buttons |
| Succession Planning / Development Programs | Mentoring Programs | `/hr/succession/development/mentoring` | Missing onClick - page.tsx:182 no action buttons |
| Succession Planning / Development Programs | Job Rotation | `/hr/succession/development/rotation` | Missing onClick - real fetch, no action buttons |
| Health & Safety / Safety Management | Safety Policies | `/hr/safety/management/policies` | Mock data - page.tsx:32-43 policyStats, adherenceData hardcoded |
| Health & Safety / Safety Management | Safety Procedures | `/hr/safety/management/procedures` | Mock data - mock data (same pattern) |
| Health & Safety / Safety Management | Safety Training | `/hr/safety/management/training` | Mock data - mock data (same pattern) |
| Health & Safety / Safety Management | Safety Committee | `/hr/safety/management/committee` | Mock data - mock data (same pattern) |
| Health & Safety / Incident Management | Report Incident | `/hr/safety/incidents/report` | Mock data - page.tsx:44-57 incidentStats, severityData hardcoded |
| Health & Safety / Incident Management | Incident Investigation | `/hr/safety/incidents/investigation` | Mock data - mock data (same pattern) |
| Health & Safety / Incident Management | Incident Tracking | `/hr/safety/incidents/tracking` | Mock data - mock data (same pattern) |
| Health & Safety / Incident Management | Near Miss Reports | `/hr/safety/incidents/near-miss` | Mock data - mock data (same pattern) |
| Health & Safety / Risk Assessment | Hazard Identification | `/hr/safety/risk/hazards` | Mock data - mock data (same pattern) |
| Health & Safety / Risk Assessment | Risk Evaluation | `/hr/safety/risk/evaluation` | Mock data - mock data (same pattern) |
| Health & Safety / Risk Assessment | Control Measures | `/hr/safety/risk/controls` | Mock data - mock data (same pattern) |
| Health & Safety / Risk Assessment | Risk Register | `/hr/safety/risk/register` | Mock data - mock data (same pattern) |
| Health & Safety / Inspections & Audits | Safety Inspections | `/hr/safety/audits/inspections` | Mock data - mock data (same pattern) |
| Health & Safety / Inspections & Audits | Audit Schedule | `/hr/safety/audits/schedule` | Mock data - mock data (same pattern) |
| Health & Safety / Inspections & Audits | Audit Findings | `/hr/safety/audits/findings` | Mock data - mock data (same pattern) |
| Health & Safety / Inspections & Audits | Corrective Actions | `/hr/safety/audits/actions` | Mock data - mock data (same pattern) |
| Health & Safety / PPE Management | PPE Issuance | `/hr/safety/ppe/issuance` | Mock data - mock data (same pattern) |
| Health & Safety / PPE Management | PPE Tracking | `/hr/safety/ppe/tracking` | Mock data - mock data (same pattern) |
| Health & Safety / PPE Management | PPE Inventory | `/hr/safety/ppe/inventory` | Mock data - mock data (same pattern) |
| Health & Safety / Emergency Response | Emergency Plans | `/hr/safety/emergency/plans` | Mock data - mock data (same pattern) |
| Health & Safety / Emergency Response | Evacuation Drills | `/hr/safety/emergency/drills` | Mock data - mock data (same pattern) |
| Health & Safety / Emergency Response | Emergency Contacts | `/hr/safety/emergency/contacts` | Mock data - mock data (same pattern) |
| Health & Safety / Health & Wellness | Health Checkups | `/hr/safety/wellness/checkups` | Mock data - mock data (same pattern) |
| Health & Safety / Health & Wellness | Wellness Programs | `/hr/safety/wellness/programs` | Mock data - mock data (same pattern) |
| Health & Safety / Health & Wellness | Occupational Health | `/hr/safety/wellness/occupational` | Mock data - mock data (same pattern) |
| Health & Safety / Health & Wellness | Ergonomics | `/hr/safety/wellness/ergonomics` | Mock data - mock data (same pattern) |
| Health & Safety / Safety Reports | Incident Analytics | `/hr/safety/reports/analytics` | Mock data - page.tsx:55-104 analyticsStats/monthlyTrends/incidentsByType hardcoded |
| Health & Safety / Safety Reports | Safety KPIs | `/hr/safety/reports/kpi` | Mock data - mock data (same pattern) |
| Health & Safety / Safety Reports | Compliance Reports | `/hr/safety/reports/compliance` | Mock data - mock data (same pattern) |
| HR Compliance / Labor Laws | Compliance Tracker | `/hr/compliance/labor/tracker` | Missing onClick - page.tsx:33 HrComplianceDocsService.getRegisters real fetch, no action buttons |
| HR Compliance / Labor Laws | Labor Registers | `/hr/compliance/labor/registers` | Missing onClick - real fetch, no action buttons |
| HR Compliance / Labor Laws | Compliance Calendar | `/hr/compliance/labor/calendar` | Missing onClick - real fetch, no action buttons |
| HR Compliance / Statutory Returns | PF Returns | `/hr/compliance/returns/pf` | Missing onClick - page.tsx:43 HrComplianceDocsService.getReturns, no action buttons |
| HR Compliance / Statutory Returns | ESI Returns | `/hr/compliance/returns/esi` | Missing onClick - real fetch, no action buttons |
| HR Compliance / Statutory Returns | TDS Returns | `/hr/compliance/returns/tds` | Missing onClick - real fetch, no action buttons |
| HR Compliance / Statutory Returns | PT Returns | `/hr/compliance/returns/pt` | Missing onClick - real fetch, no action buttons |
| HR Compliance / Statutory Returns | LWF Returns | `/hr/compliance/returns/lwf` | Missing onClick - real fetch, no action buttons |
| HR Compliance / Licenses & Registrations | License Master | `/hr/compliance/licenses/master` | Missing onClick - real fetch, no action buttons |
| HR Compliance / Licenses & Registrations | Renewal Tracking | `/hr/compliance/licenses/renewals` | Missing onClick - real fetch, no action buttons |
| HR Compliance / Licenses & Registrations | Compliance Certificates | `/hr/compliance/licenses/certificates` | Missing onClick - real fetch, no action buttons |
| HR Compliance / Policy Compliance | Policy Acknowledgment | `/hr/compliance/policy/acknowledgment` | Missing onClick - real fetch, no action buttons |
| HR Compliance / Policy Compliance | Policy Violations | `/hr/compliance/policy/violations` | Missing onClick - real fetch, no action buttons |
| HR Compliance / Policy Compliance | Disciplinary Actions | `/hr/compliance/policy/disciplinary` | Missing onClick - real fetch, no action buttons |
| HR Compliance / Equal Opportunity | Diversity Metrics | `/hr/compliance/diversity/metrics` | Missing onClick - page.tsx:40 HrComplianceDocsService.getDocuments, no action buttons |
| HR Compliance / Equal Opportunity | EEO Reports | `/hr/compliance/diversity/eeo` | Missing onClick - real fetch, no action buttons |
| HR Compliance / Equal Opportunity | Grievance Redressal | `/hr/compliance/diversity/grievance` | Missing onClick - real fetch, no action buttons |
| HR Compliance / Equal Opportunity | POSH Compliance | `/hr/compliance/diversity/posh` | Missing onClick - real fetch, no action buttons |
| HR Compliance / Audit & Compliance | Compliance Audits | `/hr/compliance/audit/audits` | Missing onClick - real fetch, no action buttons |
| HR Compliance / Audit & Compliance | Audit Findings | `/hr/compliance/audit/findings` | Missing onClick - real fetch, no action buttons |
| HR Compliance / Audit & Compliance | Remediation Plans | `/hr/compliance/audit/remediation` | Missing onClick - real fetch, no action buttons |

## IT Admin (38)

| Sub-Module | Page | Route | Findings |
|---|---|---|---|
| User Management | Active Users | `/it-admin/users/active` | Mock data - active/page.tsx:19-80 activeUsersSeed hardcoded |
| User Management | Inactive Users | `/it-admin/users/inactive` | Mock data - inactive/page.tsx:20-54 inactiveUsersSeed hardcoded |
| Roles & Permissions | All Roles | `/it-admin/roles` | Toast-only - roles/page.tsx:81-86 handleView/Edit/Duplicate toast only |
| Roles & Permissions | Permission Matrix | `/it-admin/roles/permissions` | Mock data - permissions/page.tsx:35-178 fallbackRoles hardcoded |
| Roles & Permissions | Role Hierarchy | `/it-admin/roles/hierarchy` | No fetch - hierarchy/page.tsx:45-77 useState only, no successful mapsto |
| Roles & Permissions | Access Policies | `/it-admin/roles/policies` | No fetch - policies/page.tsx:26-61 useState, ItAdminService call incomplete |
| Security | Password Policies | `/it-admin/security/password` | Partial CRUD - password/page.tsx:271-335 handleUnlockUser/handleForcePasswordChange + Save 798 |
| Security | Two-Factor Auth | `/it-admin/security/2fa` | Missing onClick - 2fa/page.tsx settings exist, no onClick on action buttons |
| Security | Session Management | `/it-admin/security/sessions` | No fetch - sessions/page.tsx useState but no visible session fetch |
| Security | IP Whitelist | `/it-admin/security/ip-whitelist` | Unclear - page.tsx not verified in this pass |
| Security | Security Alerts | `/it-admin/security/alerts` | Toast-only - audit claim: real fetch, actions toast-only |
| System Settings | General Settings | `/it-admin/system` | Missing onClick - system/page.tsx:103-113 handleView/Edit/Reset toast only |
| System Settings | Company Settings | `/it-admin/system/company` | Missing onClick - company/page.tsx:39-120 Save button no onClick |
| System Settings | Email Settings | `/it-admin/system/email` | No fetch - email/page.tsx:78-93 useState, ItAdminService call incomplete |
| System Settings | Notifications | `/it-admin/system/notifications` | Unclear - not verified |
| System Settings | Integrations | `/it-admin/system/integrations` | Toast-only - audit claim unverified in this pass |
| Audit & Compliance | Audit Logs | `/it-admin/audit` | Unclear - not verified |
| Audit & Compliance | Login History | `/it-admin/audit/logins` | Toast-only - audit claim unverified |
| Audit & Compliance | Change Logs | `/it-admin/audit/changes` | Unclear - not verified |
| Audit & Compliance | Compliance Reports | `/it-admin/audit/compliance` | Unclear - not verified |
| Database Management | Database Backup | `/it-admin/database/backup` | Unclear - not verified |
| Database Management | Data Export | `/it-admin/database/export` | Unclear - not verified |
| Database Management | Data Import | `/it-admin/database/import` | Unclear - not verified |
| Database Management | Database Cleanup | `/it-admin/database/cleanup` | Unclear - not verified |
| System Monitoring | System Health | `/it-admin/monitoring/health` | Toast-only - audit claim unverified |
| System Monitoring | Performance Metrics | `/it-admin/monitoring/performance` | Toast-only - audit claim unverified |
| System Monitoring | Server Logs | `/it-admin/monitoring/errors` | Toast-only - audit claim unverified |
| System Monitoring | Error Tracking | `/it-admin/monitoring/errors` | Toast-only - audit claim unverified |
| Customization | Custom Fields | `/it-admin/customization/fields` | Partial CRUD - audit claim unverified |
| Customization | Workflows | `/it-admin/customization/workflows` | Unclear - not verified |
| Customization | Templates | `/it-admin/customization/templates` | Unclear - not verified |
| Customization | Branding | `/it-admin/customization/branding` | Unclear - not verified |
| Automation & Scheduler | Scheduled Jobs | `/it-admin/scheduler/jobs` | Toast-only - audit claim unverified |
| Automation & Scheduler | Job History | `/it-admin/scheduler/history` | Toast-only - audit claim unverified |
| Automation & Scheduler | Automation Rules | `/it-admin/scheduler/automation` | Unclear - not verified |
| License Management | License Information | `/it-admin/license` | Missing onClick - audit claim unverified |
| License Management | User Limits | `/it-admin/license/users` | Toast-only - audit claim unverified |
| License Management | Feature Access | `/it-admin/license/features` | Toast-only - audit claim unverified |

## Common Masters (40)

| Sub-Module | Page | Route | Findings |
|---|---|---|---|
| Organization Masters | Branch/Location Master | `/common-masters/branch-master` | Partial CRUD - BranchMaster.tsx:102 getAllBranches, modal save handler returns void |
| Organization Masters | Department Master | `/common-masters/department-master` | Partial CRUD - DepartmentMaster.tsx:70 DepartmentService, delete wired, edit/create partial |
| Organization Masters | Cost Center Master | `/common-masters/cost-center-master` | Mock data - CostCenterMaster.tsx:76 hardcoded mockCostCenters array |
| Organization Masters | Plant/Factory Master | `/common-masters/plant-master` | Missing onClick - PlantMaster.tsx:134 map + fetch present, no Create/Update/Delete buttons rendered |
| Organization Masters | Warehouse Master | `/common-masters/warehouse-master` | Missing onClick - WarehouseMaster.tsx:107 fetch, modal renders but no onSave/onDelete implementations |
| Organization Masters | Exchange Rate Master | `/common-masters/exchange-rate-master` | Toast-only - page.tsx:47-70 handleEditRate/handleRefreshRate/handleAddRate toast only |
| Product & Item Masters | Item Group Master | `/common-masters/item-group-master` | Toast-only - page.tsx:97-112 handleEditGroup/handleAddSubGroup toast only, Delete local |
| Product & Item Masters | Brand Master | `/common-masters/brand-master` | Mock data - BrandMaster.tsx:47 mockBrands hardcoded |
| Product & Item Masters | Unit of Measure Master | `/common-masters/uom-master` | Mock data - UOMMaster.tsx:85 conversions set to mockConversions |
| Product & Item Masters | UOM Conversion Master | `/common-masters/uom-conversion-master` | Partial CRUD - UOMConversionMaster.tsx:37-155 hardcoded array, Edit no onClick, Delete/Add partial |
| Product & Item Masters | HSN/SAC Code Master | `/common-masters/hsn-sac-master` | Toast-only - HSNSACCodeMaster.tsx:69+ handlers stub toast pattern |
| Customer & Vendor Masters | Customer Category Master | `/common-masters/customer-category-master` | Toast-only - CustomerCategoryMaster.tsx:25-46 fetch OK, Delete local, no Create/Update |
| Customer & Vendor Masters | Vendor Category Master | `/common-masters/vendor-category-master` | Toast-only - VendorCategoryMaster.tsx:24-44 fetch OK, Delete stub, no Create/Update |
| Financial Masters | Bank Master | `/common-masters/bank-master` | Toast-only - BankMaster.tsx:15-25 fetch OK, Add/Edit/Delete buttons no onClick |
| Financial Masters | Payment Terms Master | `/common-masters/payment-terms-master` | Toast-only - PaymentTermsMaster.tsx:15-52 fetch OK, Add button no onClick |
| Financial Masters | Price List Master | `/common-masters/price-list-master` | Toast-only - PriceListMaster.tsx:15-35 fetch OK, Add no handler, Delete local |
| Geographic Masters | City Master | `/common-masters/city-master` | Partial CRUD - CityMaster.tsx fetches cities, Edit/Add stub, Delete local |
| Geographic Masters | Territory Master | `/common-masters/territory-master` | Toast-only - TerritoryMaster.tsx:71+ mockTerritories hardcoded/stub handlers |
| HR Masters | Designation Master | `/common-masters/designation-master` | Toast-only - DesignationMaster.tsx:45-100 fetch OK, Add/Edit toast only, Delete wired |
| HR Masters | Shift Master | `/common-masters/shift-master` | Toast-only - ShiftMaster.tsx:69-100 mockShifts hardcoded, Add/Edit toast, Delete wired |
| HR Masters | Holiday Master | `/common-masters/holiday-master` | TRUE 404 - page.tsx absent |
| Manufacturing Masters | Machine Master | `/common-masters/machine-master` | Toast-only - MachineMaster.tsx:66-90 fetch OK, all action buttons alert only |
| Manufacturing Masters | Work Center Master | `/common-masters/work-center-master` | Toast-only - WorkCenterMaster.tsx:79-100 fetch OK, alert-only handlers |
| Manufacturing Masters | Operation Master | `/common-masters/operation-master` | TRUE 404 - page.tsx absent |
| Manufacturing Masters | Routing Master | `/common-masters/routing-master` | Partial CRUD - RoutingMaster.tsx:59-95 fetch OK, Copy/Delete state-only, Save no onClick |
| Manufacturing Masters | Tool Master | `/common-masters/tool-master` | TRUE 404 - page.tsx absent |
| Manufacturing Masters | Quality Parameter Master | `/common-masters/quality-parameter-master` | Toast-only - QualityParameterMaster.tsx:50-89 fetch OK, Save not wired, Edit/Delete toast |
| Manufacturing Masters | Skill Master | `/common-masters/skill-master` | Missing onClick - SkillMaster.tsx:87-100 Delete wired, Edit modal, Save button no onClick |
| Manufacturing Masters | Batch/Lot Master | `/common-masters/batch-lot-master` | Missing onClick - BatchLotMaster.tsx:64-94 fetch OK, Save no onClick, Edit/Delete state only |
| Kitchen Manufacturing | Cabinet Type Master | `/common-masters/cabinet-type-master` | Missing onClick - CabinetTypeMaster.tsx:54-94 fetch OK, Save no onClick |
| Kitchen Manufacturing | Hardware Master | `/common-masters/hardware-master` | TRUE 404 - page.tsx absent |
| Kitchen Manufacturing | Finish Master | `/common-masters/finish-master` | Toast-only - FinishMaster.tsx Save wired to close+toast, Analytics toast |
| Kitchen Manufacturing | Material Grade Master | `/common-masters/material-grade-master` | Missing onClick - MaterialGradeMaster.tsx Save no onClick |
| Kitchen Manufacturing | Kitchen Layout Master | `/common-masters/kitchen-layout-master` | Toast-only - KitchenLayoutMaster.tsx Copy/Delete state only, Save not wired |
| Kitchen Manufacturing | Installation Type Master | `/common-masters/installation-type-master` | Toast-only - InstallationTypeMaster.tsx Save non-functional |
| Kitchen Manufacturing | Appliance Master | `/common-masters/appliance-master` | Missing onClick - ApplianceMaster.tsx Save no implementation |
| System Masters | User Master | `/common-masters/user-master` | Toast-only - page.tsx:47-62 handleEditUser/handleViewUser toast, Deactivate local at 247 |
| System Masters | Role Master | `/common-masters/role-master` | Toast-only - page.tsx:45-174 handleEditRole toast, Delete removes state before API |
| System Masters | Document Type Master | `/common-masters/document-type-master` | Toast-only - page.tsx:23-29 Add no onClick, Export no implementation |
| System Masters | Number Series Master | `/common-masters/number-series-master` | Toast-only - page.tsx:44-59 all View/Edit/Add toast only, no CRUD endpoints |


