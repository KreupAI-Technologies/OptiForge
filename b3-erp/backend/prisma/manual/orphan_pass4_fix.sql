-- Pass-4 tables whose SQL appends were reverted by the watcher; regenerated
-- from the committed entities. ADDITIVE ONLY (CREATE TABLE IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS "production_floor_activities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "activityId" text, "workCenter" text, "operatorName" text, "employeeId" text,
  "workOrderId" text, "productName" text, "productCode" text, "operation" text,
  "startTime" text, "durationMinutes" numeric, "outputQty" numeric, "targetQty" numeric,
  "efficiencyPercent" numeric, "status" text, "shift" text,
  "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "production_bom_verifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "bomCode" text, "productName" text, "verificationDate" text, "verifiedBy" text,
  "status" text, "completeness" numeric, "submittedToProcurement" boolean, "checks" jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "production_gantt_tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text, "startDate" text, "endDate" text, "progress" numeric, "status" text,
  "priority" text, "assignee" text, "groupId" text, "groupName" text, "dependencies" jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "production_machine_timelines" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "machineCode" text, "machineName" text, "machineType" text, "status" text,
  "currentShift" text, "utilization" numeric, "events" jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "production_andon_lines" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "lineName" text, "status" text, "currentProduct" text, "workOrderNumber" text,
  "target" numeric, "actual" numeric, "oee" numeric, "cycleTime" numeric,
  "operator" text, "shift" text, "alerts" jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "finance_ap_vendor_account" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "vendorId" text, "vendorName" text, "vendorCode" text, "gstNumber" text, "panNumber" text,
  "vendorCategory" text, "totalOutstanding" numeric, "overdueAmount" numeric,
  "dueThisWeek" numeric, "dueThisMonth" numeric, "lastPaymentAmount" numeric,
  "lastPaymentDate" timestamp, "creditPeriod" numeric, "creditLimit" numeric,
  "paymentTerms" text, "accountStatus" text, "riskRating" text,
  "agingBuckets" jsonb, "bills" jsonb, "paymentSchedule" jsonb, "paymentHistory" jsonb,
  "vendorContact" jsonb, "address" text, "city" text, "state" text, "pincode" text,
  "vendorSince" timestamp, "lastPurchaseDate" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "finance_ar_customer_account" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "customerId" text, "customerName" text, "customerCode" text, "gstNumber" text, "panNumber" text,
  "customerCategory" text, "totalOutstanding" numeric, "overdueAmount" numeric,
  "dueThisWeek" numeric, "dueThisMonth" numeric, "lastCollectionAmount" numeric,
  "lastCollectionDate" timestamp, "creditLimit" numeric, "creditUsed" numeric,
  "availableCredit" numeric, "creditStatus" text, "paymentTerms" text, "dso" numeric,
  "averageDaysDelayed" numeric, "accountStatus" text, "riskRating" text,
  "collectionAgent" text, "collectionPriority" text,
  "agingBuckets" jsonb, "invoices" jsonb, "collectionActivities" jsonb, "paymentHistory" jsonb,
  "customerContact" jsonb, "address" text, "city" text, "state" text, "pincode" text,
  "customerSince" timestamp, "lastSaleDate" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "crm_pricing_rules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" text, "name" text, "description" text, "ruleType" text, "discountType" text,
  "discountValue" numeric, "conditions" jsonb, "priority" numeric, "isActive" boolean,
  "applicableProducts" jsonb, "applicableCustomers" jsonb, "validFrom" text, "validUntil" text,
  "usageCount" numeric, "totalSavings" numeric,
  "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now()
);
