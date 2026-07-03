-- Additive migration: create the payroll loan/advance tables that the Prisma
-- models (SalaryAdvance, AdvanceRecovery, EmployeeLoan, LoanRepayment, LoanType)
-- expect but which were never created in the DB. Idempotent + non-destructive.
-- Column names are camelCase to match the Prisma field names (no @map).

CREATE TABLE IF NOT EXISTS "payroll_loan_types" (
  "id" text PRIMARY KEY,
  "code" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "maxAmount" double precision,
  "maxTenureMonths" integer,
  "interestType" text NOT NULL DEFAULT 'None',
  "defaultInterestRate" double precision NOT NULL DEFAULT 0,
  "processingFeePercent" double precision NOT NULL DEFAULT 0,
  "minServiceMonths" integer NOT NULL DEFAULT 0,
  "maxLoanMultiplier" double precision,
  "requiresGuarantor" boolean NOT NULL DEFAULT false,
  "documentRequired" jsonb,
  "isActive" boolean NOT NULL DEFAULT true,
  "companyId" text NOT NULL,
  "createdAt" timestamp(3) NOT NULL DEFAULT now(),
  "updatedAt" timestamp(3) NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "payroll_loan_types_code_companyId_key" ON "payroll_loan_types" ("code", "companyId");

CREATE TABLE IF NOT EXISTS "payroll_employee_loans" (
  "id" text PRIMARY KEY,
  "loanNumber" text NOT NULL,
  "loanTypeId" text NOT NULL,
  "employeeId" text NOT NULL,
  "requestDate" timestamp(3) NOT NULL DEFAULT now(),
  "requestedAmount" double precision NOT NULL,
  "approvedAmount" double precision,
  "interestRate" double precision NOT NULL DEFAULT 0,
  "tenureMonths" integer NOT NULL,
  "emiAmount" double precision,
  "processingFee" double precision NOT NULL DEFAULT 0,
  "totalRepayable" double precision,
  "disbursementDate" timestamp(3),
  "repaymentStartDate" timestamp(3),
  "repaymentEndDate" timestamp(3),
  "outstandingBalance" double precision,
  "paidEMIs" integer NOT NULL DEFAULT 0,
  "remainingEMIs" integer,
  "status" text NOT NULL DEFAULT 'Pending',
  "requestedBy" text,
  "approvedBy" text,
  "approvedAt" timestamp(3),
  "rejectionReason" text,
  "guarantorId" text,
  "documents" jsonb,
  "remarks" text,
  "companyId" text NOT NULL,
  "createdAt" timestamp(3) NOT NULL DEFAULT now(),
  "updatedAt" timestamp(3) NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "payroll_employee_loans_loanNumber_companyId_key" ON "payroll_employee_loans" ("loanNumber", "companyId");

CREATE TABLE IF NOT EXISTS "payroll_loan_repayments" (
  "id" text PRIMARY KEY,
  "loanId" text NOT NULL,
  "emiNumber" integer NOT NULL,
  "dueDate" timestamp(3) NOT NULL,
  "principalAmount" double precision NOT NULL,
  "interestAmount" double precision NOT NULL,
  "emiAmount" double precision NOT NULL,
  "paidAmount" double precision NOT NULL DEFAULT 0,
  "balanceAfterEMI" double precision NOT NULL,
  "status" text NOT NULL DEFAULT 'Pending',
  "deductionDate" timestamp(3),
  "payslipId" text,
  "paymentMode" text,
  "remarks" text,
  "companyId" text NOT NULL,
  "createdAt" timestamp(3) NOT NULL DEFAULT now(),
  "updatedAt" timestamp(3) NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "payroll_loan_repayments_loanId_emiNumber_key" ON "payroll_loan_repayments" ("loanId", "emiNumber");

CREATE TABLE IF NOT EXISTS "payroll_salary_advances" (
  "id" text PRIMARY KEY,
  "advanceNumber" text NOT NULL,
  "employeeId" text NOT NULL,
  "requestDate" timestamp(3) NOT NULL DEFAULT now(),
  "requestedAmount" double precision NOT NULL,
  "approvedAmount" double precision,
  "purpose" text,
  "repaymentMonths" integer NOT NULL DEFAULT 1,
  "monthlyDeduction" double precision,
  "disbursementDate" timestamp(3),
  "status" text NOT NULL DEFAULT 'Pending',
  "approvedBy" text,
  "approvedAt" timestamp(3),
  "rejectionReason" text,
  "paidAmount" double precision NOT NULL DEFAULT 0,
  "balanceAmount" double precision,
  "remarks" text,
  "companyId" text NOT NULL,
  "createdAt" timestamp(3) NOT NULL DEFAULT now(),
  "updatedAt" timestamp(3) NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "payroll_salary_advances_advanceNumber_companyId_key" ON "payroll_salary_advances" ("advanceNumber", "companyId");

CREATE TABLE IF NOT EXISTS "payroll_advance_recoveries" (
  "id" text PRIMARY KEY,
  "advanceId" text NOT NULL,
  "installmentNumber" integer NOT NULL,
  "dueDate" timestamp(3) NOT NULL,
  "amount" double precision NOT NULL,
  "paidAmount" double precision NOT NULL DEFAULT 0,
  "balanceAfter" double precision NOT NULL,
  "status" text NOT NULL DEFAULT 'Pending',
  "deductionDate" timestamp(3),
  "payslipId" text,
  "remarks" text,
  "companyId" text NOT NULL,
  "createdAt" timestamp(3) NOT NULL DEFAULT now(),
  "updatedAt" timestamp(3) NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "payroll_advance_recoveries_advanceId_installmentNumber_key" ON "payroll_advance_recoveries" ("advanceId", "installmentNumber");
