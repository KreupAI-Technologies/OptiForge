-- Orphan HR module tables (ADDITIVE ONLY)
-- These tables back net-new backend endpoints wired to previously
-- mock-only frontend pages under /hr/shifts. Never DROP/ALTER existing tables.

-- Backs /hr/shifts/assignment
CREATE TABLE IF NOT EXISTS "hr_shift_assignments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "employeeId" varchar,
  "employeeName" varchar,
  "department" varchar,
  "shiftCode" varchar,
  "shiftName" varchar,
  "effectiveFrom" varchar,
  "effectiveTo" varchar,
  "status" varchar NOT NULL DEFAULT 'Active',
  "assignedBy" varchar,
  "assignedDate" varchar,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_shift_assignments" PRIMARY KEY ("id")
);

-- Backs /hr/shifts/roster
CREATE TABLE IF NOT EXISTS "hr_shift_roster_entries" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "employeeId" varchar,
  "employeeName" varchar,
  "department" varchar,
  "weekStart" varchar,
  "shifts" json,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_shift_roster_entries" PRIMARY KEY ("id")
);

-- Backs /hr/shifts/swaps
CREATE TABLE IF NOT EXISTS "hr_shift_swaps" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "requesterId" varchar,
  "requesterName" varchar,
  "requesterDepartment" varchar,
  "requesterShift" varchar,
  "requesterDate" varchar,
  "targetId" varchar,
  "targetName" varchar,
  "targetDepartment" varchar,
  "targetShift" varchar,
  "targetDate" varchar,
  "reason" text,
  "status" varchar NOT NULL DEFAULT 'Pending',
  "requestDate" varchar,
  "approvedBy" varchar,
  "approvedDate" varchar,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_shift_swaps" PRIMARY KEY ("id")
);

-- Backs /hr/employees/transfers-promotions
-- ADDITIVE ONLY: idempotent, never DROP or ALTER existing tables.
-- A single row covers transfers, promotions and combined ("both") movements.
-- Entity: src/modules/hr/entities/employee-movement.entity.ts
CREATE TABLE IF NOT EXISTS "hr_employee_movements" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "employeeCode" varchar,
  "name" varchar,
  "type" varchar NOT NULL DEFAULT 'promotion',
  "fromDesignation" varchar,
  "toDesignation" varchar,
  "fromDepartment" varchar,
  "toDepartment" varchar,
  "fromLocation" varchar,
  "toLocation" varchar,
  "effectiveDate" varchar,
  "requestDate" varchar,
  "requestedBy" varchar,
  "approvedBy" varchar,
  "reason" text,
  "salaryIncrement" numeric(5,2),
  "status" varchar NOT NULL DEFAULT 'pending',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_employee_movements" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_hr_employee_movements_companyId"
  ON "hr_employee_movements" ("companyId");

-- ============================================================================
-- Onboarding / Offboarding task tables (ADDITIVE ONLY)
-- Back the previously mock-only frontend pages under /hr/onboarding and
-- /hr/offboarding. Two shared tables keyed by a `feature` discriminator to
-- avoid a proliferation of tiny per-page tables. Feature-specific scalar
-- fields live in the `data` JSONB column; nested lists live in `items`.
-- Never DROP/ALTER existing tables.
-- Entities:
--   src/modules/hr/entities/onboarding-task.entity.ts
--   src/modules/hr/entities/offboarding-task.entity.ts
-- ============================================================================

-- Backs /hr/onboarding/* (checklist, first-day, medical, verification,
-- policies, training, id-card, access, welcome-kit, offers, induction)
CREATE TABLE IF NOT EXISTS "hr_onboarding_tasks" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "feature" varchar NOT NULL,
  "employeeCode" varchar,
  "employeeName" varchar,
  "designation" varchar,
  "department" varchar,
  "joiningDate" varchar,
  "status" varchar NOT NULL DEFAULT 'pending',
  "data" jsonb,
  "items" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_onboarding_tasks" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_hr_onboarding_tasks_companyId"
  ON "hr_onboarding_tasks" ("companyId");
CREATE INDEX IF NOT EXISTS "IDX_hr_onboarding_tasks_company_feature"
  ON "hr_onboarding_tasks" ("companyId", "feature");

-- Backs /hr/offboarding/* (resignations, acceptance, notice-period,
-- early-release, exit-interview, clearance/*, fnf/*, docs/*)
CREATE TABLE IF NOT EXISTS "hr_offboarding_tasks" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "feature" varchar NOT NULL,
  "employeeCode" varchar,
  "employeeName" varchar,
  "designation" varchar,
  "department" varchar,
  "status" varchar NOT NULL DEFAULT 'pending',
  "data" jsonb,
  "items" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_offboarding_tasks" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_hr_offboarding_tasks_companyId"
  ON "hr_offboarding_tasks" ("companyId");
CREATE INDEX IF NOT EXISTS "IDX_hr_offboarding_tasks_company_feature"
  ON "hr_offboarding_tasks" ("companyId", "feature");

-- ============================================================================
-- Succession / Probation / Performance-goal tables (ADDITIVE ONLY)
-- Back previously mock-only pages under /hr/succession, /hr/probation and
-- /hr/performance. Each uses a `recordType` discriminator + a jsonb `data`
-- column so many sub-pages share one flexible table. Idempotent; never
-- DROP or ALTER existing tables.
-- ============================================================================

-- Backs /hr/succession/* (plans, matrix, positions, talent, development, reports)
-- Entity: src/modules/hr/entities/succession-plan.entity.ts
CREATE TABLE IF NOT EXISTS "hr_succession_plans" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "recordType" varchar NOT NULL,
  "title" varchar,
  "status" varchar,
  "data" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_succession_plans" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_hr_succession_plans_company_type"
  ON "hr_succession_plans" ("companyId", "recordType");

-- Backs /hr/probation/* (tracking, reviews, feedback, confirmation)
-- Entity: src/modules/hr/entities/probation-review.entity.ts
CREATE TABLE IF NOT EXISTS "hr_probation_reviews" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "recordType" varchar NOT NULL,
  "employeeCode" varchar,
  "status" varchar,
  "data" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_probation_reviews" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_hr_probation_reviews_company_type"
  ON "hr_probation_reviews" ("companyId", "recordType");

-- Backs /hr/performance/{goals,kpi,feedback} pages not covered by the existing
-- hr/performance-reviews endpoint.
-- Entity: src/modules/hr/entities/performance-goal.entity.ts
CREATE TABLE IF NOT EXISTS "hr_performance_goals" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "recordType" varchar NOT NULL,
  "title" varchar,
  "status" varchar,
  "data" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_performance_goals" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_hr_performance_goals_company_type"
  ON "hr_performance_goals" ("companyId", "recordType");

-- ============================================================================
-- Payroll orphan-endpoint build
-- ADDITIVE ONLY: idempotent, never DROP or ALTER existing tables.
-- Backs the mock-only pages under src/app/hr/payroll/*. Each table uses a
-- `category` discriminator + flexible jsonb `details` so one table serves a
-- group of related pages.
-- ============================================================================

-- Backs /hr/payroll/{pf,esi,pt}/* — Entity: payroll-statutory-filing.entity.ts
CREATE TABLE IF NOT EXISTS "hr_payroll_statutory_filings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "category" varchar NOT NULL DEFAULT 'pf-contribution',
  "employeeId" varchar,
  "employeeName" varchar,
  "employeeCode" varchar,
  "department" varchar,
  "period" varchar,
  "amount" numeric(14,2),
  "status" varchar NOT NULL DEFAULT 'pending',
  "details" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_payroll_statutory_filings" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_payroll_statutory_filings_company_cat"
  ON "hr_payroll_statutory_filings" ("companyId", "category");

-- Backs /hr/payroll/tax/{tds,declarations,form16} — Entity: payroll-tax-record.entity.ts
CREATE TABLE IF NOT EXISTS "hr_payroll_tax_records" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "category" varchar NOT NULL DEFAULT 'tds',
  "employeeId" varchar,
  "employeeName" varchar,
  "employeeCode" varchar,
  "department" varchar,
  "financialYear" varchar,
  "period" varchar,
  "amount" numeric(14,2),
  "status" varchar NOT NULL DEFAULT 'pending',
  "details" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_payroll_tax_records" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_payroll_tax_records_company_cat"
  ON "hr_payroll_tax_records" ("companyId", "category");

-- Backs /hr/payroll/bonus/{annual,performance} — Entity: payroll-bonus-record.entity.ts
CREATE TABLE IF NOT EXISTS "hr_payroll_bonus_records" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "category" varchar NOT NULL DEFAULT 'annual',
  "employeeId" varchar,
  "employeeName" varchar,
  "employeeCode" varchar,
  "designation" varchar,
  "department" varchar,
  "financialYear" varchar,
  "bonusAmount" numeric(14,2),
  "status" varchar NOT NULL DEFAULT 'pending',
  "details" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_payroll_bonus_records" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_payroll_bonus_records_company_cat"
  ON "hr_payroll_bonus_records" ("companyId", "category");

-- Backs /hr/payroll/{revisions,increment/*} — Entity: payroll-salary-revision.entity.ts
CREATE TABLE IF NOT EXISTS "hr_payroll_salary_revisions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "category" varchar NOT NULL DEFAULT 'revision',
  "employeeId" varchar,
  "employeeName" varchar,
  "employeeCode" varchar,
  "designation" varchar,
  "department" varchar,
  "effectiveDate" varchar,
  "currentSalary" numeric(14,2),
  "revisedSalary" numeric(14,2),
  "incrementPercent" numeric(6,2),
  "status" varchar NOT NULL DEFAULT 'pending',
  "details" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_payroll_salary_revisions" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_payroll_salary_revisions_company_cat"
  ON "hr_payroll_salary_revisions" ("companyId", "category");

-- Backs /hr/payroll/{disbursement,verification} — Entity: payroll-disbursement.entity.ts
CREATE TABLE IF NOT EXISTS "hr_payroll_disbursements" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "category" varchar NOT NULL DEFAULT 'disbursement',
  "employeeId" varchar,
  "employeeName" varchar,
  "employeeCode" varchar,
  "department" varchar,
  "period" varchar,
  "paymentMethod" varchar,
  "bankName" varchar,
  "accountNumber" varchar,
  "netPay" numeric(14,2),
  "status" varchar NOT NULL DEFAULT 'pending',
  "details" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_payroll_disbursements" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_payroll_disbursements_company_cat"
  ON "hr_payroll_disbursements" ("companyId", "category");

-- Backs /hr/payroll/reports/* — Entity: payroll-report.entity.ts
CREATE TABLE IF NOT EXISTS "hr_payroll_reports" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "category" varchar NOT NULL DEFAULT 'register',
  "employeeId" varchar,
  "employeeName" varchar,
  "employeeCode" varchar,
  "department" varchar,
  "period" varchar,
  "amount" numeric(14,2),
  "status" varchar NOT NULL DEFAULT 'active',
  "details" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_payroll_reports" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_payroll_reports_company_cat"
  ON "hr_payroll_reports" ("companyId", "category");

-- =====================================================================
-- HR Asset Management (orphan-endpoint build)
-- ADDITIVE ONLY: idempotent, never DROP or ALTER existing tables.
-- Backs the mock-only pages under /hr/assets/*.
-- =====================================================================

-- Backs /hr/assets/it/{laptops,desktops,monitors,mobiles} and /hr/assets/office/furniture
-- Entity: src/modules/hr/entities/asset-item.entity.ts
CREATE TABLE IF NOT EXISTS "hr_asset_items" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "assetClass" varchar NOT NULL DEFAULT 'laptop',
  "assetTag" varchar,
  "brand" varchar,
  "model" varchar,
  "item" varchar,
  "category" varchar,
  "serialNumber" varchar,
  "processor" varchar,
  "ram" varchar,
  "storage" varchar,
  "imei" varchar,
  "simNumber" varchar,
  "os" varchar,
  "screenSize" varchar,
  "resolution" varchar,
  "purchaseDate" varchar,
  "warranty" varchar,
  "cost" numeric(14,2) NOT NULL DEFAULT 0,
  "status" varchar NOT NULL DEFAULT 'available',
  "condition" varchar,
  "assignedTo" varchar,
  "employeeCode" varchar,
  "department" varchar,
  "location" varchar,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_asset_items" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_asset_items_companyId" ON "hr_asset_items" ("companyId");
CREATE INDEX IF NOT EXISTS "IDX_hr_asset_items_assetClass" ON "hr_asset_items" ("assetClass");

-- Backs /hr/assets/requests and /hr/assets/inventory/requests
-- Entity: src/modules/hr/entities/asset-request.entity.ts
CREATE TABLE IF NOT EXISTS "hr_asset_requests" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "requestId" varchar,
  "requestDate" varchar,
  "requester" varchar,
  "employeeCode" varchar,
  "department" varchar,
  "designation" varchar,
  "assetCategory" varchar,
  "assetName" varchar,
  "quantity" integer NOT NULL DEFAULT 1,
  "priority" varchar NOT NULL DEFAULT 'medium',
  "purpose" text,
  "status" varchar NOT NULL DEFAULT 'pending',
  "approver" varchar,
  "approvalDate" varchar,
  "fulfillmentDate" varchar,
  "remarks" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_asset_requests" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_asset_requests_companyId" ON "hr_asset_requests" ("companyId");

-- Backs /hr/assets/transfer
-- Entity: src/modules/hr/entities/asset-transfer.entity.ts
CREATE TABLE IF NOT EXISTS "hr_asset_transfers" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "transferId" varchar,
  "assetTag" varchar,
  "assetType" varchar,
  "assetCategory" varchar,
  "fromEmployee" varchar,
  "fromEmployeeCode" varchar,
  "fromDepartment" varchar,
  "fromLocation" varchar,
  "toEmployee" varchar,
  "toEmployeeCode" varchar,
  "toDepartment" varchar,
  "toLocation" varchar,
  "initiatedBy" varchar,
  "initiatedDate" varchar,
  "transferReason" varchar,
  "status" varchar NOT NULL DEFAULT 'pending',
  "approvedBy" varchar,
  "approvalDate" varchar,
  "completionDate" varchar,
  "handoverNotes" text,
  "condition" varchar,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_asset_transfers" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_asset_transfers_companyId" ON "hr_asset_transfers" ("companyId");

-- Backs /hr/assets/return
-- Entity: src/modules/hr/entities/asset-return.entity.ts
CREATE TABLE IF NOT EXISTS "hr_asset_returns" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "returnId" varchar,
  "assetTag" varchar,
  "assetType" varchar,
  "assetCategory" varchar,
  "returnedBy" varchar,
  "employeeCode" varchar,
  "department" varchar,
  "assignedDate" varchar,
  "returnDate" varchar,
  "returnReason" varchar,
  "condition" varchar,
  "status" varchar NOT NULL DEFAULT 'pending_inspection',
  "inspectedBy" varchar,
  "inspectionDate" varchar,
  "inspectionNotes" text,
  "damageCharges" numeric(14,2),
  "accessories" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_asset_returns" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_asset_returns_companyId" ON "hr_asset_returns" ("companyId");

-- Backs /hr/assets/inventory/allocation
-- Entity: src/modules/hr/entities/asset-allocation.entity.ts
CREATE TABLE IF NOT EXISTS "hr_asset_allocations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "allocationId" varchar,
  "assetTag" varchar,
  "assetName" varchar,
  "category" varchar,
  "employeeName" varchar,
  "employeeCode" varchar,
  "department" varchar,
  "designation" varchar,
  "location" varchar,
  "allocationDate" varchar,
  "expectedReturnDate" varchar,
  "actualReturnDate" varchar,
  "status" varchar NOT NULL DEFAULT 'allocated',
  "condition" varchar,
  "allocatedBy" varchar,
  "remarks" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_asset_allocations" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_asset_allocations_companyId" ON "hr_asset_allocations" ("companyId");

-- Backs /hr/assets/inventory/stock
-- Entity: src/modules/hr/entities/asset-inventory.entity.ts
CREATE TABLE IF NOT EXISTS "hr_asset_inventory" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "assetCode" varchar,
  "assetName" varchar,
  "category" varchar,
  "brand" varchar,
  "model" varchar,
  "totalQuantity" integer NOT NULL DEFAULT 0,
  "allocated" integer NOT NULL DEFAULT 0,
  "available" integer NOT NULL DEFAULT 0,
  "minStockLevel" integer NOT NULL DEFAULT 0,
  "reorderLevel" integer NOT NULL DEFAULT 0,
  "unitCost" numeric(14,2) NOT NULL DEFAULT 0,
  "totalValue" numeric(16,2) NOT NULL DEFAULT 0,
  "location" varchar,
  "supplier" varchar,
  "status" varchar NOT NULL DEFAULT 'in_stock',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_asset_inventory" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_asset_inventory_companyId" ON "hr_asset_inventory" ("companyId");

-- Backs /hr/assets/maintenance/{requests,history} (recordType discriminates)
-- Entity: src/modules/hr/entities/asset-maintenance.entity.ts
CREATE TABLE IF NOT EXISTS "hr_asset_maintenance" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "recordType" varchar NOT NULL DEFAULT 'request',
  "requestId" varchar,
  "ticketId" varchar,
  "assetTag" varchar,
  "assetName" varchar,
  "assetCategory" varchar,
  "issueType" varchar,
  "issueDescription" text,
  "requestedBy" varchar,
  "reportedBy" varchar,
  "employeeCode" varchar,
  "department" varchar,
  "priority" varchar NOT NULL DEFAULT 'medium',
  "status" varchar NOT NULL DEFAULT 'pending',
  "requestDate" varchar,
  "reportedDate" varchar,
  "expectedDate" varchar,
  "startDate" varchar,
  "completionDate" varchar,
  "assignedTo" varchar,
  "approvedBy" varchar,
  "approvalDate" varchar,
  "vendor" varchar,
  "estimatedCost" numeric(14,2),
  "cost" numeric(14,2),
  "resolutionTime" integer,
  "workDone" text,
  "partsReplaced" text,
  "location" varchar,
  "contactNumber" varchar,
  "remarks" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_asset_maintenance" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_asset_maintenance_companyId" ON "hr_asset_maintenance" ("companyId");
CREATE INDEX IF NOT EXISTS "IDX_hr_asset_maintenance_recordType" ON "hr_asset_maintenance" ("recordType");

-- Backs /hr/assets/vehicles/list
-- Entity: src/modules/hr/entities/vehicle.entity.ts
CREATE TABLE IF NOT EXISTS "hr_vehicles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "vehicleNumber" varchar,
  "vehicleType" varchar,
  "make" varchar,
  "model" varchar,
  "year" integer,
  "purchaseDate" varchar,
  "purchaseCost" numeric(14,2) NOT NULL DEFAULT 0,
  "registrationNumber" varchar,
  "insuranceExpiry" varchar,
  "pucExpiry" varchar,
  "fitnessExpiry" varchar,
  "currentOdometer" integer NOT NULL DEFAULT 0,
  "fuelType" varchar,
  "status" varchar NOT NULL DEFAULT 'available',
  "assignedTo" varchar,
  "location" varchar,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_vehicles" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_vehicles_companyId" ON "hr_vehicles" ("companyId");

-- Backs /hr/assets/vehicles/fuel
-- Entity: src/modules/hr/entities/vehicle-fuel.entity.ts
CREATE TABLE IF NOT EXISTS "hr_vehicle_fuel" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "recordId" varchar,
  "vehicleNumber" varchar,
  "vehicleName" varchar,
  "registrationNumber" varchar,
  "fuelDate" varchar,
  "fuelType" varchar,
  "quantity" numeric(10,2) NOT NULL DEFAULT 0,
  "pricePerLiter" numeric(10,2) NOT NULL DEFAULT 0,
  "totalCost" numeric(14,2) NOT NULL DEFAULT 0,
  "odometer" integer NOT NULL DEFAULT 0,
  "fuelStation" varchar,
  "billNumber" varchar,
  "filledBy" varchar,
  "location" varchar,
  "remarks" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_vehicle_fuel" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_vehicle_fuel_companyId" ON "hr_vehicle_fuel" ("companyId");

-- ============================================================================
-- HR Compliance & Documents (orphan-endpoint build)
-- Backs previously mock-only pages under /hr/compliance/* and /hr/documents/*.
-- ADDITIVE ONLY: every statement is idempotent; never DROP or ALTER.
-- ============================================================================

-- Backs /hr/compliance/licenses/{master,certificates,renewals}
-- Shared table; recordType = 'license' | 'certificate' | 'renewal'.
-- Entity: src/modules/hr/entities/compliance-license.entity.ts
CREATE TABLE IF NOT EXISTS "hr_compliance_licenses" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "recordType" varchar NOT NULL DEFAULT 'license',
  "name" varchar,
  "number" varchar,
  "authority" varchar,
  "category" varchar,
  "status" varchar,
  "location" varchar,
  "applicableTo" varchar,
  "issueDate" varchar,
  "expiryDate" varchar,
  "renewalFrequency" varchar,
  "lastRenewalDate" varchar,
  "contactPerson" varchar,
  "validUntil" varchar,
  "relatedLicense" varchar,
  "documentUrl" varchar,
  "verifiedBy" varchar,
  "verificationDate" varchar,
  "renewalDueDate" varchar,
  "priority" varchar,
  "assignedTo" varchar,
  "renewalCost" numeric(12,2),
  "documentsRequired" jsonb,
  "submissionDeadline" varchar,
  "applicationNumber" varchar,
  "newExpiryDate" varchar,
  "remarks" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_compliance_licenses" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_compliance_licenses_companyId"
  ON "hr_compliance_licenses" ("companyId");

-- Backs /hr/compliance/returns/{pf,esi,tds,pt,lwf}
-- Shared table; returnType = 'pf' | 'esi' | 'tds' | 'pt' | 'lwf'.
-- Entity: src/modules/hr/entities/compliance-return.entity.ts
CREATE TABLE IF NOT EXISTS "hr_compliance_returns" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "returnType" varchar NOT NULL DEFAULT 'pf',
  "returnMonth" varchar,
  "returnPeriod" varchar,
  "quarter" varchar,
  "financialYear" varchar,
  "establishment" varchar,
  "state" varchar,
  "branch" varchar,
  "registrationNumber" varchar,
  "formType" varchar,
  "dueDate" varchar,
  "filingDate" varchar,
  "status" varchar NOT NULL DEFAULT 'draft',
  "totalEmployees" integer,
  "coveredEmployees" integer,
  "totalDeductees" integer,
  "grossWages" numeric(14,2),
  "grossSalary" numeric(14,2),
  "employeeContribution" numeric(14,2),
  "employerContribution" numeric(14,2),
  "totalContribution" numeric(14,2),
  "totalDeducted" numeric(14,2),
  "totalPaid" numeric(14,2),
  "challanNumber" varchar,
  "challanDate" varchar,
  "acknowledgmentNumber" varchar,
  "challanDetails" jsonb,
  "remarks" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_compliance_returns" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_compliance_returns_companyId"
  ON "hr_compliance_returns" ("companyId");

-- Backs /hr/compliance/policy/disciplinary
-- Entity: src/modules/hr/entities/disciplinary-action.entity.ts
CREATE TABLE IF NOT EXISTS "hr_disciplinary_actions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "employeeId" varchar,
  "employeeName" varchar,
  "department" varchar,
  "designation" varchar,
  "actionType" varchar,
  "violationCategory" varchar,
  "incidentDate" varchar,
  "actionDate" varchar,
  "issuedBy" varchar,
  "severity" varchar,
  "description" text,
  "justification" text,
  "witnessList" jsonb,
  "evidenceDocuments" jsonb,
  "employeeStatement" text,
  "suspensionDuration" varchar,
  "suspensionStartDate" varchar,
  "suspensionEndDate" varchar,
  "isPaid" boolean,
  "appealStatus" varchar NOT NULL DEFAULT 'not_filed',
  "appealDeadline" varchar,
  "appealFiledDate" varchar,
  "appealReviewedBy" varchar,
  "appealOutcome" text,
  "status" varchar NOT NULL DEFAULT 'active',
  "effectiveUntil" varchar,
  "remarks" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_disciplinary_actions" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_disciplinary_actions_companyId"
  ON "hr_disciplinary_actions" ("companyId");

-- Backs /hr/compliance/policy/violations
-- Entity: src/modules/hr/entities/policy-violation.entity.ts
CREATE TABLE IF NOT EXISTS "hr_policy_violations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "employeeId" varchar,
  "employeeName" varchar,
  "department" varchar,
  "designation" varchar,
  "policyName" varchar,
  "violationType" varchar,
  "category" varchar,
  "severity" varchar,
  "violationDate" varchar,
  "reportedDate" varchar,
  "reportedBy" varchar,
  "description" text,
  "actionTaken" varchar,
  "status" varchar NOT NULL DEFAULT 'open',
  "remarks" text,
  "meta" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_policy_violations" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_policy_violations_companyId"
  ON "hr_policy_violations" ("companyId");

-- Backs /hr/compliance/labor/{registers,tracker}
-- Shared table; entryType = 'register' | 'tracker'.
-- Entity: src/modules/hr/entities/compliance-register.entity.ts
CREATE TABLE IF NOT EXISTS "hr_compliance_registers" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "entryType" varchar NOT NULL DEFAULT 'register',
  "registerName" varchar,
  "act" varchar,
  "formNumber" varchar,
  "requirement" text,
  "applicability" varchar,
  "frequency" varchar,
  "responsibility" varchar,
  "lastUpdated" varchar,
  "lastCompleted" varchar,
  "nextDue" varchar,
  "status" varchar NOT NULL DEFAULT 'compliant',
  "totalEntries" integer,
  "format" varchar,
  "retentionPeriod" varchar,
  "documents" jsonb,
  "penalties" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_compliance_registers" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_compliance_registers_companyId"
  ON "hr_compliance_registers" ("companyId");

-- Backs /hr/compliance/audit/audits
-- Entity: src/modules/hr/entities/compliance-audit.entity.ts
CREATE TABLE IF NOT EXISTS "hr_compliance_audits" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "auditId" varchar,
  "title" varchar,
  "auditType" varchar,
  "scope" jsonb,
  "auditor" varchar,
  "scheduledDate" varchar,
  "completedDate" varchar,
  "status" varchar NOT NULL DEFAULT 'scheduled',
  "findings" integer NOT NULL DEFAULT 0,
  "criticalFindings" integer NOT NULL DEFAULT 0,
  "complianceScore" numeric(5,2),
  "nextAuditDue" varchar,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_compliance_audits" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_compliance_audits_companyId"
  ON "hr_compliance_audits" ("companyId");

-- Backs /hr/compliance/diversity/{grievance,posh}
-- Shared table; caseType = 'grievance' | 'posh'.
-- Entity: src/modules/hr/entities/hr-grievance.entity.ts
CREATE TABLE IF NOT EXISTS "hr_grievances" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "caseType" varchar NOT NULL DEFAULT 'grievance',
  "caseNumber" varchar,
  "filedDate" varchar,
  "employeeId" varchar,
  "employeeName" varchar,
  "department" varchar,
  "category" varchar,
  "subcategory" varchar,
  "description" text,
  "priority" varchar,
  "status" varchar NOT NULL DEFAULT 'filed',
  "assignedTo" varchar,
  "targetResolutionDate" varchar,
  "actualResolutionDate" varchar,
  "resolutionDetails" text,
  "employeeSatisfaction" varchar,
  "isAnonymous" boolean NOT NULL DEFAULT false,
  "witnesses" jsonb,
  "evidenceProvided" boolean NOT NULL DEFAULT false,
  "complainantDetails" varchar,
  "respondentName" varchar,
  "respondentDesignation" varchar,
  "respondentDepartment" varchar,
  "incidentDate" varchar,
  "incidentLocation" varchar,
  "severity" varchar,
  "icAssigned" varchar,
  "targetCompletionDate" varchar,
  "actualCompletionDate" varchar,
  "actionTaken" text,
  "confidential" boolean,
  "remarks" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_grievances" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_grievances_companyId"
  ON "hr_grievances" ("companyId");

-- Backs /hr/documents/{personal,insurance,education,employment,statutory,declarations,nominations}
-- Shared table; docCategory discriminates. Category-specific fields in `meta` jsonb.
-- Entity: src/modules/hr/entities/hr-document.entity.ts
CREATE TABLE IF NOT EXISTS "hr_documents" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "docCategory" varchar NOT NULL DEFAULT 'personal',
  "documentType" varchar,
  "documentNumber" varchar,
  "title" varchar,
  "issuingAuthority" varchar,
  "issueDate" varchar,
  "expiryDate" varchar,
  "uploadedOn" varchar,
  "uploadedBy" varchar,
  "status" varchar NOT NULL DEFAULT 'pending',
  "fileName" varchar,
  "fileSize" varchar,
  "verifiedBy" varchar,
  "verifiedOn" varchar,
  "remarks" text,
  "meta" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_documents" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_documents_companyId"
  ON "hr_documents" ("companyId");

-- =====================================================================
-- HR self-service orphan-endpoint build (ADDITIVE ONLY — never DROP/ALTER)
-- Backs previously mock-only pages under /hr/travel, /hr/expenses,
-- /hr/reimbursement, /hr/cards, /hr/alumni, /hr/overtime, /hr/safety,
-- /hr/training. Entities: src/modules/hr/entities/*.entity.ts
-- =====================================================================

-- Backs /hr/travel/requests and /hr/travel/history
CREATE TABLE IF NOT EXISTS "hr_travel_requests" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "requestNumber" varchar,
  "employeeCode" varchar,
  "employeeName" varchar,
  "department" varchar,
  "designation" varchar,
  "travelType" varchar,
  "purpose" text,
  "fromLocation" varchar,
  "toLocation" varchar,
  "startDate" varchar,
  "endDate" varchar,
  "duration" integer,
  "estimatedCost" numeric(14,2),
  "totalCost" numeric(14,2),
  "advanceAmount" numeric(14,2),
  "expensesClaimed" numeric(14,2),
  "status" varchar NOT NULL DEFAULT 'pending',
  "submittedDate" varchar,
  "approver" varchar,
  "approvedDate" varchar,
  "rejectionReason" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_travel_requests" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_travel_requests_companyId" ON "hr_travel_requests" ("companyId");

-- Backs /hr/travel/advances
CREATE TABLE IF NOT EXISTS "hr_travel_advances" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "advanceNumber" varchar,
  "employeeName" varchar,
  "department" varchar,
  "tripNumber" varchar,
  "destination" varchar,
  "travelDates" varchar,
  "advanceAmount" numeric(14,2),
  "requestedDate" varchar,
  "purpose" text,
  "status" varchar NOT NULL DEFAULT 'pending',
  "approver" varchar,
  "approvedDate" varchar,
  "disbursedDate" varchar,
  "settledDate" varchar,
  "expensesSubmitted" numeric(14,2),
  "balanceAmount" numeric(14,2),
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_travel_advances" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_travel_advances_companyId" ON "hr_travel_advances" ("companyId");

-- Backs /hr/cards/management and /hr/travel/cards
CREATE TABLE IF NOT EXISTS "hr_corporate_cards" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "cardNumber" varchar,
  "cardType" varchar,
  "cardholderName" varchar,
  "employeeCode" varchar,
  "department" varchar,
  "designation" varchar,
  "cardProvider" varchar,
  "creditLimit" numeric(14,2),
  "availableLimit" numeric(14,2),
  "currentBalance" numeric(14,2),
  "monthlySpend" numeric(14,2),
  "issueDate" varchar,
  "expiryDate" varchar,
  "lastTransactionDate" varchar,
  "billingCycle" varchar,
  "status" varchar NOT NULL DEFAULT 'active',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_corporate_cards" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_corporate_cards_companyId" ON "hr_corporate_cards" ("companyId");

-- Backs /hr/cards/transactions and /hr/cards/reconciliation
CREATE TABLE IF NOT EXISTS "hr_corporate_card_transactions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "transactionId" varchar,
  "cardNumber" varchar,
  "cardType" varchar,
  "cardHolder" varchar,
  "employeeCode" varchar,
  "department" varchar,
  "merchantName" varchar,
  "category" varchar,
  "amount" numeric(14,2),
  "currency" varchar DEFAULT 'INR',
  "transactionDate" varchar,
  "transactionTime" varchar,
  "location" varchar,
  "status" varchar NOT NULL DEFAULT 'pending',
  "receiptUploaded" boolean NOT NULL DEFAULT false,
  "notes" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_corporate_card_transactions" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_card_transactions_companyId" ON "hr_corporate_card_transactions" ("companyId");

-- Backs /hr/expenses/{my,submit}, /hr/travel/expenses, /hr/reimbursement/*
CREATE TABLE IF NOT EXISTS "hr_expense_claims" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "kind" varchar NOT NULL DEFAULT 'expense',
  "claimNumber" varchar,
  "employeeCode" varchar,
  "employeeName" varchar,
  "department" varchar,
  "designation" varchar,
  "category" varchar,
  "claimType" varchar,
  "description" text,
  "amount" numeric(14,2),
  "advanceAmount" numeric(14,2),
  "cardExpenses" numeric(14,2),
  "netPayable" numeric(14,2),
  "destination" varchar,
  "travelRequestId" varchar,
  "travelDates" varchar,
  "billDate" varchar,
  "submissionDate" varchar,
  "submittedDate" varchar,
  "itemsCount" integer,
  "documentsCount" integer,
  "receiptAttached" boolean NOT NULL DEFAULT false,
  "priority" varchar,
  "pendingDays" integer,
  "status" varchar NOT NULL DEFAULT 'pending',
  "approver" varchar,
  "approvedDate" varchar,
  "paidDate" varchar,
  "paymentMethod" varchar,
  "paymentReference" varchar,
  "rejectionReason" text,
  "items" json,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_expense_claims" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_expense_claims_companyId" ON "hr_expense_claims" ("companyId");

-- Backs /hr/alumni/{directory,network,rehire}
CREATE TABLE IF NOT EXISTS "hr_alumni" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "kind" varchar NOT NULL DEFAULT 'member',
  "employeeCode" varchar,
  "name" varchar,
  "designation" varchar,
  "department" varchar,
  "joinDate" varchar,
  "exitDate" varchar,
  "tenure" varchar,
  "currentCompany" varchar,
  "currentDesignation" varchar,
  "location" varchar,
  "email" varchar,
  "phone" varchar,
  "linkedinUrl" varchar,
  "achievements" json,
  "industryExpertise" json,
  "willingToMentor" boolean NOT NULL DEFAULT false,
  "availableForRehire" boolean NOT NULL DEFAULT false,
  "reasonForLeaving" varchar,
  "lastContactDate" varchar,
  "previousDesignation" varchar,
  "proposedDesignation" varchar,
  "proposedDepartment" varchar,
  "proposedCTC" numeric(14,2),
  "requestedBy" varchar,
  "requestDate" varchar,
  "eligibilityScore" integer,
  "performanceRating" varchar,
  "backgroundCheckStatus" varchar,
  "comments" text,
  "details" json,
  "status" varchar NOT NULL DEFAULT 'active',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_alumni" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_alumni_companyId" ON "hr_alumni" ("companyId");

-- Backs /hr/overtime/{requests,approval}
CREATE TABLE IF NOT EXISTS "hr_overtime_requests" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "requestId" varchar,
  "employeeCode" varchar,
  "employeeName" varchar,
  "department" varchar,
  "designation" varchar,
  "date" varchar,
  "shiftType" varchar,
  "regularHours" numeric(6,2),
  "overtimeHours" numeric(6,2),
  "reason" text,
  "requestDate" varchar,
  "status" varchar NOT NULL DEFAULT 'pending',
  "approvedBy" varchar,
  "approvedDate" varchar,
  "calculatedAmount" numeric(14,2),
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_overtime_requests" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_overtime_requests_companyId" ON "hr_overtime_requests" ("companyId");

-- Backs /hr/safety/incidents/tracking
CREATE TABLE IF NOT EXISTS "hr_safety_incidents" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "incidentNumber" varchar,
  "reportedDate" varchar,
  "incidentDate" varchar,
  "incidentTime" varchar,
  "location" varchar,
  "department" varchar,
  "severity" varchar,
  "type" varchar,
  "description" text,
  "reportedBy" varchar,
  "employeeInvolved" varchar,
  "witnessCount" integer,
  "status" varchar NOT NULL DEFAULT 'reported',
  "investigator" varchar,
  "rootCause" text,
  "daysLost" integer,
  "medicalAttention" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_safety_incidents" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_safety_incidents_companyId" ON "hr_safety_incidents" ("companyId");

-- Backs /hr/training/programs/catalog
CREATE TABLE IF NOT EXISTS "hr_training_programs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "code" varchar,
  "title" varchar,
  "description" text,
  "category" varchar,
  "level" varchar,
  "duration" numeric(8,2),
  "mode" varchar,
  "instructor" varchar,
  "department" varchar,
  "capacity" integer,
  "enrolled" integer,
  "cost" numeric(14,2),
  "nextBatch" varchar,
  "location" varchar,
  "certification" boolean NOT NULL DEFAULT false,
  "status" varchar NOT NULL DEFAULT 'active',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_training_programs" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_training_programs_companyId" ON "hr_training_programs" ("companyId");

-- Backs the summary/aggregate attendance pages under
-- /hr/attendance/{monthly,calendar,biometric,reports}. Shared discriminator
-- table (category selects the page); page-specific fields live in `details`.
-- The raw per-day hr_attendance table is left untouched.
CREATE TABLE IF NOT EXISTS "hr_attendance_records" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "category" varchar NOT NULL DEFAULT 'monthly',
  "employeeId" varchar,
  "employeeName" varchar,
  "employeeCode" varchar,
  "department" varchar,
  "period" varchar,
  "date" varchar,
  "presentDays" numeric(8,2),
  "absentDays" numeric(8,2),
  "totalHours" numeric(8,2),
  "status" varchar NOT NULL DEFAULT 'active',
  "details" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_attendance_records" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_attendance_records_companyId" ON "hr_attendance_records" ("companyId");
CREATE INDEX IF NOT EXISTS "IDX_hr_attendance_records_category" ON "hr_attendance_records" ("category");

-- =====================================================================
-- HR Assets & Documents — remaining orphan-endpoint build (ADDITIVE ONLY)
-- =====================================================================

CREATE TABLE IF NOT EXISTS "hr_id_cards" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(), "companyId" varchar NOT NULL,
  "cardNumber" varchar, "cardType" varchar NOT NULL DEFAULT 'employee', "issuedTo" varchar,
  "employeeCode" varchar, "department" varchar, "designation" varchar, "issueDate" varchar,
  "expiryDate" varchar, "status" varchar NOT NULL DEFAULT 'active', "bloodGroup" varchar,
  "emergencyContact" varchar, "photo" boolean NOT NULL DEFAULT false, "location" varchar,
  "issuedBy" varchar, "remarks" text, "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_hr_id_cards" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_id_cards_companyId" ON "hr_id_cards" ("companyId");

CREATE TABLE IF NOT EXISTS "hr_access_cards" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(), "companyId" varchar NOT NULL,
  "cardNumber" varchar, "cardType" varchar NOT NULL DEFAULT 'employee', "issuedTo" varchar,
  "employeeCode" varchar, "department" varchar, "designation" varchar, "issueDate" varchar,
  "expiryDate" varchar, "status" varchar NOT NULL DEFAULT 'active', "accessLevel" varchar NOT NULL DEFAULT 'basic',
  "accessZones" text, "location" varchar, "issuedBy" varchar, "lastUsed" varchar, "remarks" text,
  "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_access_cards" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_access_cards_companyId" ON "hr_access_cards" ("companyId");

CREATE TABLE IF NOT EXISTS "hr_stationery" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(), "companyId" varchar NOT NULL,
  "itemCode" varchar, "itemName" varchar, "category" varchar NOT NULL DEFAULT 'other', "brand" varchar,
  "unit" varchar NOT NULL DEFAULT 'pcs', "totalQuantity" integer NOT NULL DEFAULT 0, "issued" integer NOT NULL DEFAULT 0,
  "available" integer NOT NULL DEFAULT 0, "minStockLevel" integer NOT NULL DEFAULT 0, "reorderLevel" integer NOT NULL DEFAULT 0,
  "unitCost" numeric(14,2) NOT NULL DEFAULT 0, "totalValue" numeric(14,2) NOT NULL DEFAULT 0, "location" varchar,
  "supplier" varchar, "lastPurchaseDate" varchar, "status" varchar NOT NULL DEFAULT 'in_stock',
  "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_stationery" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_stationery_companyId" ON "hr_stationery" ("companyId");

CREATE TABLE IF NOT EXISTS "hr_asset_audits" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(), "companyId" varchar NOT NULL,
  "auditId" varchar, "auditDate" varchar, "auditType" varchar NOT NULL DEFAULT 'scheduled', "location" varchar,
  "auditor" varchar, "totalAssets" integer NOT NULL DEFAULT 0, "verified" integer NOT NULL DEFAULT 0,
  "missing" integer NOT NULL DEFAULT 0, "damaged" integer NOT NULL DEFAULT 0, "status" varchar NOT NULL DEFAULT 'pending',
  "completionDate" varchar, "remarks" text, "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_hr_asset_audits" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_asset_audits_companyId" ON "hr_asset_audits" ("companyId");

CREATE TABLE IF NOT EXISTS "hr_vehicle_assignments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(), "companyId" varchar NOT NULL,
  "assignmentId" varchar, "vehicleNumber" varchar, "vehicleName" varchar, "registrationNumber" varchar,
  "assignedTo" varchar, "employeeCode" varchar, "department" varchar, "designation" varchar,
  "assignmentDate" varchar, "returnDate" varchar, "purpose" text, "status" varchar NOT NULL DEFAULT 'active',
  "odometerReadingStart" integer NOT NULL DEFAULT 0, "odometerReadingEnd" integer, "location" varchar, "remarks" text,
  "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_vehicle_assignments" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_vehicle_assignments_companyId" ON "hr_vehicle_assignments" ("companyId");

CREATE TABLE IF NOT EXISTS "hr_amc_contracts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(), "companyId" varchar NOT NULL,
  "contractId" varchar, "assetCategory" varchar NOT NULL DEFAULT 'other', "vendor" varchar, "vendorContact" varchar,
  "startDate" varchar, "endDate" varchar, "duration" integer NOT NULL DEFAULT 0, "numberOfAssets" integer NOT NULL DEFAULT 0,
  "contractValue" numeric(14,2) NOT NULL DEFAULT 0, "paymentTerms" varchar NOT NULL DEFAULT 'annual', "coverage" text,
  "responseTime" varchar, "status" varchar NOT NULL DEFAULT 'active', "renewalDate" varchar, "location" varchar,
  "contactPerson" varchar, "remarks" text, "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_hr_amc_contracts" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_amc_contracts_companyId" ON "hr_amc_contracts" ("companyId");

CREATE TABLE IF NOT EXISTS "hr_preventive_maintenance" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(), "companyId" varchar NOT NULL,
  "scheduleId" varchar, "assetTag" varchar, "assetName" varchar, "assetCategory" varchar NOT NULL DEFAULT 'other',
  "maintenanceType" varchar NOT NULL DEFAULT 'inspection', "frequency" varchar NOT NULL DEFAULT 'monthly',
  "lastMaintenanceDate" varchar, "nextMaintenanceDate" varchar, "assignedTo" varchar,
  "estimatedDuration" integer NOT NULL DEFAULT 0, "status" varchar NOT NULL DEFAULT 'upcoming', "location" varchar,
  "checklist" text, "priority" varchar NOT NULL DEFAULT 'medium', "remarks" text,
  "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_preventive_maintenance" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_preventive_maintenance_companyId" ON "hr_preventive_maintenance" ("companyId");

CREATE TABLE IF NOT EXISTS "hr_certificate_requests" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(), "companyId" varchar NOT NULL,
  "recordType" varchar NOT NULL DEFAULT 'experience', "requestDate" varchar, "purpose" text, "addressedTo" varchar,
  "period" varchar, "includeBreakup" boolean NOT NULL DEFAULT false, "includeDetails" text,
  "deliveryMode" varchar NOT NULL DEFAULT 'email', "status" varchar NOT NULL DEFAULT 'pending', "requestedBy" varchar,
  "approvedBy" varchar, "approvedOn" varchar, "generatedOn" varchar, "deliveredOn" varchar, "rejectedReason" varchar,
  "remarks" text, "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_certificate_requests" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_certificate_requests_companyId" ON "hr_certificate_requests" ("companyId");

CREATE TABLE IF NOT EXISTS "hr_document_audit_logs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(), "companyId" varchar NOT NULL,
  "timestamp" varchar, "action" varchar NOT NULL DEFAULT 'view', "documentType" varchar, "documentId" varchar,
  "employeeId" varchar, "employeeName" varchar, "performedBy" varchar, "performedByRole" varchar, "ipAddress" varchar,
  "remarks" text, "createdAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_document_audit_logs" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_document_audit_logs_companyId" ON "hr_document_audit_logs" ("companyId");
