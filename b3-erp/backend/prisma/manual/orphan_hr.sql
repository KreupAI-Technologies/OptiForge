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
