-- Additive-only DDL for net-new project-management endpoints.
-- Safe to run repeatedly; never drops or alters existing tables.

-- Project Management module settings (one row per company, upsert semantics)
CREATE TABLE IF NOT EXISTS "pm_project_settings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "default_currency" varchar NOT NULL DEFAULT 'INR',
  "fiscal_year_start" varchar NOT NULL DEFAULT '04-01',
  "default_project_prefix" varchar NOT NULL DEFAULT 'PRJ',
  "auto_numbering" boolean NOT NULL DEFAULT true,
  "document_retention" varchar NOT NULL DEFAULT '7',
  "project_approval_required" boolean NOT NULL DEFAULT true,
  "milestone_approval_required" boolean NOT NULL DEFAULT true,
  "document_approval_required" boolean NOT NULL DEFAULT true,
  "budget_approval_threshold" varchar NOT NULL DEFAULT '5000000',
  "change_order_approval_levels" varchar NOT NULL DEFAULT '2',
  "project_start_notification" boolean NOT NULL DEFAULT true,
  "milestone_complete_notification" boolean NOT NULL DEFAULT true,
  "budget_exceeded_notification" boolean NOT NULL DEFAULT true,
  "schedule_delay_notification" boolean NOT NULL DEFAULT true,
  "email_notifications" boolean NOT NULL DEFAULT true,
  "sms_notifications" boolean NOT NULL DEFAULT false,
  "project_manager_approval" boolean NOT NULL DEFAULT true,
  "department_head_approval" boolean NOT NULL DEFAULT true,
  "finance_approval" boolean NOT NULL DEFAULT true,
  "ceo_approval_threshold" varchar NOT NULL DEFAULT '10000000',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "uq_pm_project_settings_company" UNIQUE ("company_id")
);

-- Reusable project templates
CREATE TABLE IF NOT EXISTS "pm_project_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "template_name" varchar NOT NULL,
  "project_type" varchar,
  "description" text,
  "category" varchar NOT NULL DEFAULT 'Standard',
  "complexity" varchar NOT NULL DEFAULT 'Medium',
  "estimated_duration" varchar,
  "estimated_budget" varchar,
  "phases" jsonb,
  "milestones" integer NOT NULL DEFAULT 0,
  "tasks" integer NOT NULL DEFAULT 0,
  "resources" jsonb,
  "deliverables" jsonb,
  "default_settings" jsonb,
  "tags" jsonb,
  "usage_count" integer NOT NULL DEFAULT 0,
  "last_used" varchar,
  "created_by" varchar,
  "is_active" boolean NOT NULL DEFAULT true,
  "is_favorite" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Reusable milestone templates
CREATE TABLE IF NOT EXISTS "pm_milestone_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "template_name" varchar NOT NULL,
  "project_type" varchar,
  "description" text,
  "total_milestones" integer NOT NULL DEFAULT 0,
  "estimated_duration" varchar,
  "milestones" jsonb,
  "usage_count" integer NOT NULL DEFAULT 0,
  "last_used" varchar,
  "created_by" varchar,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Project change orders (CRUD list)
CREATE TABLE IF NOT EXISTS "pm_change_orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "change_order_number" varchar,
  "project_id" varchar,
  "project_name" varchar,
  "request_date" varchar,
  "requested_by" varchar,
  "requested_by_role" varchar,
  "change_type" varchar,
  "priority" varchar NOT NULL DEFAULT 'Medium',
  "title" varchar,
  "description" text,
  "reason" text,
  "impact_on_cost" numeric(15,2) NOT NULL DEFAULT 0,
  "impact_on_schedule" integer NOT NULL DEFAULT 0,
  "original_budget" numeric(15,2) NOT NULL DEFAULT 0,
  "revised_budget" numeric(15,2) NOT NULL DEFAULT 0,
  "original_end_date" varchar,
  "revised_end_date" varchar,
  "status" varchar NOT NULL DEFAULT 'Pending',
  "approved_by" varchar,
  "approval_date" varchar,
  "implementation_date" varchar,
  "completion_date" varchar,
  "attachments" integer NOT NULL DEFAULT 0,
  "remarks" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Project deliverables (CRUD list)
CREATE TABLE IF NOT EXISTS "pm_deliverables" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "deliverable_number" varchar,
  "deliverable_name" varchar,
  "project_number" varchar,
  "project_name" varchar,
  "type" varchar,
  "description" text,
  "assigned_to" varchar,
  "planned_date" varchar,
  "actual_date" varchar,
  "status" varchar NOT NULL DEFAULT 'Not Started',
  "progress" integer NOT NULL DEFAULT 0,
  "dependencies" jsonb,
  "quantity" integer NOT NULL DEFAULT 0,
  "unit" varchar,
  "notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Project issues & risks register (CRUD list)
CREATE TABLE IF NOT EXISTS "pm_project_issues" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "number" varchar,
  "title" varchar,
  "type" varchar NOT NULL DEFAULT 'Issue',
  "category" varchar,
  "project_number" varchar,
  "project_name" varchar,
  "description" text,
  "impact" varchar NOT NULL DEFAULT 'Medium',
  "probability" varchar NOT NULL DEFAULT 'Medium',
  "status" varchar NOT NULL DEFAULT 'Open',
  "priority" varchar NOT NULL DEFAULT 'P3',
  "raised_by" varchar,
  "assigned_to" varchar,
  "raised_date" varchar,
  "target_date" varchar,
  "resolved_date" varchar,
  "mitigation_plan" text,
  "cost_impact" numeric(15,2) NOT NULL DEFAULT 0,
  "schedule_impact" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- Additive tables for newly-wired project-management pages (CRUD lists)
-- ADDITIVE ONLY. CREATE TABLE IF NOT EXISTS — never drop/alter existing.
-- ============================================================================

-- Site issues register
CREATE TABLE IF NOT EXISTS "pm_site_issues" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "issue_number" varchar,
  "project_id" varchar,
  "project_name" varchar,
  "issue_title" varchar,
  "issue_type" varchar,
  "severity" varchar NOT NULL DEFAULT 'Medium',
  "priority" varchar NOT NULL DEFAULT 'P3',
  "reported_date" varchar,
  "reported_by" varchar,
  "reported_by_role" varchar,
  "location" varchar,
  "description" text,
  "impact_on_work" text,
  "root_cause" text,
  "proposed_solution" text,
  "assigned_to" varchar,
  "target_date" varchar,
  "actual_resolution_date" varchar,
  "status" varchar NOT NULL DEFAULT 'Open',
  "resolution_details" text,
  "cost_impact" numeric(15,2) NOT NULL DEFAULT 0,
  "schedule_impact" integer NOT NULL DEFAULT 0,
  "preventive_measures" text,
  "attachments" integer NOT NULL DEFAULT 0,
  "related_issues" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Material consumption tracking
CREATE TABLE IF NOT EXISTS "pm_material_consumption" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "date" varchar,
  "project_id" varchar,
  "project_name" varchar,
  "work_package" varchar,
  "material_code" varchar,
  "material_name" varchar,
  "category" varchar,
  "unit" varchar,
  "planned_qty" numeric(15,2) NOT NULL DEFAULT 0,
  "consumed_qty" numeric(15,2) NOT NULL DEFAULT 0,
  "variance" numeric(15,2) NOT NULL DEFAULT 0,
  "variance_percent" numeric(10,2) NOT NULL DEFAULT 0,
  "unit_cost" numeric(15,2) NOT NULL DEFAULT 0,
  "total_cost" numeric(15,2) NOT NULL DEFAULT 0,
  "source" varchar NOT NULL DEFAULT 'Stock',
  "issued_by" varchar,
  "received_by" varchar,
  "warehouse_location" varchar,
  "remarks" text,
  "status" varchar NOT NULL DEFAULT 'Within Budget',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Labor tracking entries
CREATE TABLE IF NOT EXISTS "pm_labor_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "date" varchar,
  "project_id" varchar,
  "project_name" varchar,
  "work_package" varchar,
  "labor_category" varchar NOT NULL DEFAULT 'Skilled',
  "workers_deployed" integer NOT NULL DEFAULT 0,
  "hours_worked" numeric(10,2) NOT NULL DEFAULT 0,
  "overtime_hours" numeric(10,2) NOT NULL DEFAULT 0,
  "total_manhours" numeric(12,2) NOT NULL DEFAULT 0,
  "planned_manhours" numeric(12,2) NOT NULL DEFAULT 0,
  "variance" numeric(12,2) NOT NULL DEFAULT 0,
  "hourly_rate" numeric(12,2) NOT NULL DEFAULT 0,
  "overtime_rate" numeric(12,2) NOT NULL DEFAULT 0,
  "total_cost" numeric(15,2) NOT NULL DEFAULT 0,
  "work_description" text,
  "shift" varchar NOT NULL DEFAULT 'Day',
  "efficiency" numeric(6,2) NOT NULL DEFAULT 0,
  "supervisor" varchar,
  "remarks" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Project costing register
CREATE TABLE IF NOT EXISTS "pm_project_costs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "project_id" varchar,
  "project_name" varchar,
  "project_type" varchar,
  "customer" varchar,
  "start_date" varchar,
  "end_date" varchar,
  "progress" integer NOT NULL DEFAULT 0,
  "status" varchar NOT NULL DEFAULT 'In Progress',
  "total_budget" numeric(15,2) NOT NULL DEFAULT 0,
  "actual_cost" numeric(15,2) NOT NULL DEFAULT 0,
  "committed_cost" numeric(15,2) NOT NULL DEFAULT 0,
  "forecasted_cost" numeric(15,2) NOT NULL DEFAULT 0,
  "variance" numeric(15,2) NOT NULL DEFAULT 0,
  "variance_percent" numeric(10,2) NOT NULL DEFAULT 0,
  "cost_breakdown" jsonb,
  "profit_margin" numeric(10,2) NOT NULL DEFAULT 0,
  "actual_profit" numeric(15,2) NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Commissioning activities
CREATE TABLE IF NOT EXISTS "pm_commissioning_activities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "activity_number" varchar,
  "project_id" varchar,
  "project_name" varchar,
  "equipment_system" varchar,
  "system_code" varchar,
  "commissioning_type" varchar NOT NULL DEFAULT 'Commissioning',
  "scheduled_date" varchar,
  "actual_date" varchar,
  "duration" integer NOT NULL DEFAULT 0,
  "status" varchar NOT NULL DEFAULT 'Scheduled',
  "progress" integer NOT NULL DEFAULT 0,
  "engineer" varchar,
  "client_rep" varchar,
  "test_parameters" jsonb,
  "checklist_items" jsonb,
  "total_checks" integer NOT NULL DEFAULT 0,
  "passed_checks" integer NOT NULL DEFAULT 0,
  "failed_checks" integer NOT NULL DEFAULT 0,
  "observations" text,
  "recommendations" text,
  "certificate_issued" boolean NOT NULL DEFAULT false,
  "certificate_number" varchar,
  "next_activity" varchar,
  "dependencies" jsonb,
  "attachments" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Customer acceptance records
CREATE TABLE IF NOT EXISTS "pm_customer_acceptances" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "acceptance_number" varchar,
  "project_id" varchar,
  "project_name" varchar,
  "project_type" varchar,
  "customer" varchar,
  "customer_contact" varchar,
  "customer_email" varchar,
  "acceptance_date" varchar,
  "acceptance_type" varchar NOT NULL DEFAULT 'Provisional',
  "phase" varchar,
  "deliverables" jsonb,
  "acceptance_criteria" jsonb,
  "total_criteria" integer NOT NULL DEFAULT 0,
  "criteria_met" integer NOT NULL DEFAULT 0,
  "criteria_pending" integer NOT NULL DEFAULT 0,
  "documentation" jsonb,
  "total_documents" integer NOT NULL DEFAULT 0,
  "docs_submitted" integer NOT NULL DEFAULT 0,
  "docs_pending" integer NOT NULL DEFAULT 0,
  "defects_list" jsonb,
  "punch_list_items" integer NOT NULL DEFAULT 0,
  "completed_punch_items" integer NOT NULL DEFAULT 0,
  "training_completed" boolean NOT NULL DEFAULT false,
  "warranty_period" varchar,
  "warranty_start_date" varchar,
  "amc_offered" boolean NOT NULL DEFAULT false,
  "amc_duration" varchar,
  "signed_by" varchar,
  "signed_by_designation" varchar,
  "signed_date" varchar,
  "witnessed_by" varchar,
  "overall_status" varchar NOT NULL DEFAULT 'Pending',
  "remarks" text,
  "attachments" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Project profitability records
CREATE TABLE IF NOT EXISTS "pm_project_profitability" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "project_id" varchar,
  "project_name" varchar,
  "client_name" varchar,
  "project_type" varchar,
  "start_date" varchar,
  "end_date" varchar,
  "status" varchar NOT NULL DEFAULT 'In Progress',
  "contract_value" numeric(15,2) NOT NULL DEFAULT 0,
  "actual_revenue" numeric(15,2) NOT NULL DEFAULT 0,
  "revenue_recognized" numeric(15,2) NOT NULL DEFAULT 0,
  "total_budget" numeric(15,2) NOT NULL DEFAULT 0,
  "actual_cost" numeric(15,2) NOT NULL DEFAULT 0,
  "direct_costs" jsonb,
  "indirect_costs" jsonb,
  "gross_profit" numeric(15,2) NOT NULL DEFAULT 0,
  "gross_margin" numeric(10,2) NOT NULL DEFAULT 0,
  "net_profit" numeric(15,2) NOT NULL DEFAULT 0,
  "net_margin" numeric(10,2) NOT NULL DEFAULT 0,
  "budget_variance" numeric(15,2) NOT NULL DEFAULT 0,
  "variance_percent" numeric(10,2) NOT NULL DEFAULT 0,
  "billed_amount" numeric(15,2) NOT NULL DEFAULT 0,
  "outstanding_amount" numeric(15,2) NOT NULL DEFAULT 0,
  "payment_status" varchar NOT NULL DEFAULT 'Pending',
  "risk_level" varchar NOT NULL DEFAULT 'Low',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Layout briefings
CREATE TABLE IF NOT EXISTS "pm_layout_briefings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "briefing_number" varchar,
  "project_id" varchar,
  "project_name" varchar,
  "briefing_date" varchar,
  "briefing_time" varchar,
  "location" varchar,
  "organizer" varchar,
  "status" varchar NOT NULL DEFAULT 'Scheduled',
  "attendees" jsonb,
  "agenda" text,
  "minutes" text,
  "action_items" text,
  "attachments" jsonb,
  "duration" varchar,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Daily progress entries
CREATE TABLE IF NOT EXISTS "pm_progress_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "date" varchar,
  "work_package" varchar,
  "activity" varchar,
  "planned_work" text,
  "actual_work" text,
  "completion_percent" integer NOT NULL DEFAULT 0,
  "labor_deployed" integer NOT NULL DEFAULT 0,
  "hours_worked" numeric(10,2) NOT NULL DEFAULT 0,
  "material_used" text,
  "equipment_used" text,
  "issues" text,
  "photos" integer NOT NULL DEFAULT 0,
  "weather" varchar,
  "safety_incidents" integer NOT NULL DEFAULT 0,
  "reported_by" varchar,
  "status" varchar NOT NULL DEFAULT 'Draft',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- ===================================================================
-- Follow-up pass: additive tables for remaining mock-only PM pages
-- (project-types, documents, mrp, installation-tracking,
--  quality-inspection, resource-utilization, reports, site-survey,
--  wbs, schedule). ADDITIVE ONLY.
-- ===================================================================

-- Project types catalog
CREATE TABLE IF NOT EXISTS "pm_project_types" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "type_name" varchar,
  "type_code" varchar,
  "category" varchar,
  "description" text,
  "industry" varchar,
  "default_duration" varchar,
  "budget_range" varchar,
  "required_approvals" integer NOT NULL DEFAULT 0,
  "default_workflow" varchar,
  "custom_fields" jsonb,
  "project_count" integer NOT NULL DEFAULT 0,
  "active_projects" integer NOT NULL DEFAULT 0,
  "avg_success_rate" numeric(6,2) NOT NULL DEFAULT 0,
  "total_revenue" numeric(15,2) NOT NULL DEFAULT 0,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_date" varchar,
  "last_modified" varchar,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Project documents register
CREATE TABLE IF NOT EXISTS "pm_documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "document_number" varchar,
  "project_id" varchar,
  "project_name" varchar,
  "document_name" varchar,
  "document_type" varchar,
  "category" varchar,
  "version" varchar,
  "upload_date" varchar,
  "uploaded_by" varchar,
  "file_size" varchar,
  "file_format" varchar,
  "status" varchar NOT NULL DEFAULT 'Draft',
  "access_level" varchar NOT NULL DEFAULT 'Internal',
  "reviewed_by" varchar,
  "approved_by" varchar,
  "approval_date" varchar,
  "expiry_date" varchar,
  "tags" jsonb,
  "description" text,
  "related_documents" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- MRP materials
CREATE TABLE IF NOT EXISTS "pm_mrp_materials" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "item_code" varchar,
  "item_name" varchar,
  "category" varchar,
  "required_quantity" numeric(15,2) NOT NULL DEFAULT 0,
  "unit" varchar,
  "available_stock" numeric(15,2) NOT NULL DEFAULT 0,
  "required_date" varchar,
  "status" varchar NOT NULL DEFAULT 'Available',
  "supplier" varchar,
  "unit_cost" numeric(15,2) NOT NULL DEFAULT 0,
  "total_cost" numeric(15,2) NOT NULL DEFAULT 0,
  "lead_time" integer NOT NULL DEFAULT 0,
  "project_phase" varchar,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Installation tracking activities
CREATE TABLE IF NOT EXISTS "pm_installation_activities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "activity_number" varchar,
  "project_id" varchar,
  "project_name" varchar,
  "equipment_item" varchar,
  "equipment_code" varchar,
  "location" varchar,
  "zone" varchar,
  "installation_type" varchar,
  "planned_start_date" varchar,
  "planned_end_date" varchar,
  "actual_start_date" varchar,
  "actual_end_date" varchar,
  "status" varchar NOT NULL DEFAULT 'Not Started',
  "progress" integer NOT NULL DEFAULT 0,
  "assigned_team" varchar,
  "team_size" integer NOT NULL DEFAULT 0,
  "supervisor" varchar,
  "dependencies" jsonb,
  "prerequisites_completed" boolean NOT NULL DEFAULT false,
  "material_availability" varchar,
  "tools_required" jsonb,
  "safety_checklist" boolean NOT NULL DEFAULT false,
  "quality_checkpoint" boolean NOT NULL DEFAULT false,
  "photos" integer NOT NULL DEFAULT 0,
  "remarks" text,
  "issues" jsonb,
  "delay_reason" varchar,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Quality inspections
CREATE TABLE IF NOT EXISTS "pm_quality_inspections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "inspection_number" varchar,
  "project_id" varchar,
  "project_name" varchar,
  "inspection_date" varchar,
  "inspection_type" varchar,
  "phase" varchar,
  "work_package" varchar,
  "inspector_name" varchar,
  "inspector_id" varchar,
  "checklist" jsonb,
  "total_check_points" integer NOT NULL DEFAULT 0,
  "passed" integer NOT NULL DEFAULT 0,
  "failed" integer NOT NULL DEFAULT 0,
  "not_applicable" integer NOT NULL DEFAULT 0,
  "pending" integer NOT NULL DEFAULT 0,
  "overall_status" varchar NOT NULL DEFAULT 'Pending',
  "defects" integer NOT NULL DEFAULT 0,
  "critical_defects" integer NOT NULL DEFAULT 0,
  "photos" integer NOT NULL DEFAULT 0,
  "signed_off" boolean NOT NULL DEFAULT false,
  "sign_off_by" varchar,
  "sign_off_date" varchar,
  "next_inspection_date" varchar,
  "remarks" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Resource utilization records
CREATE TABLE IF NOT EXISTS "pm_resource_utilization" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "resource_id" varchar,
  "resource_name" varchar,
  "role" varchar,
  "department" varchar,
  "employee_type" varchar,
  "total_capacity" numeric(10,2) NOT NULL DEFAULT 0,
  "allocated_hours" numeric(10,2) NOT NULL DEFAULT 0,
  "actual_hours" numeric(10,2) NOT NULL DEFAULT 0,
  "utilization" numeric(6,2) NOT NULL DEFAULT 0,
  "efficiency" numeric(6,2) NOT NULL DEFAULT 0,
  "billable_hours" numeric(10,2) NOT NULL DEFAULT 0,
  "non_billable_hours" numeric(10,2) NOT NULL DEFAULT 0,
  "overtime_hours" numeric(10,2) NOT NULL DEFAULT 0,
  "leave_hours" numeric(10,2) NOT NULL DEFAULT 0,
  "idle_hours" numeric(10,2) NOT NULL DEFAULT 0,
  "active_projects" integer NOT NULL DEFAULT 0,
  "cost_per_hour" numeric(15,2) NOT NULL DEFAULT 0,
  "total_revenue" numeric(15,2) NOT NULL DEFAULT 0,
  "total_cost" numeric(15,2) NOT NULL DEFAULT 0,
  "availability" varchar,
  "status" varchar NOT NULL DEFAULT 'Active',
  "current_projects" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Project reports register
CREATE TABLE IF NOT EXISTS "pm_reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "report_name" varchar,
  "report_type" varchar,
  "category" varchar,
  "description" text,
  "frequency" varchar,
  "format" varchar,
  "last_generated" varchar,
  "generated_by" varchar,
  "project_scope" varchar,
  "project_count" integer NOT NULL DEFAULT 0,
  "file_size" varchar,
  "status" varchar NOT NULL DEFAULT 'Available',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Site surveys
CREATE TABLE IF NOT EXISTS "pm_site_surveys" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "survey_number" varchar,
  "project_id" varchar,
  "project_name" varchar,
  "project_type" varchar,
  "survey_date" varchar,
  "site_name" varchar,
  "site_address" text,
  "city" varchar,
  "state" varchar,
  "surveyor_name" varchar,
  "surveyor_contact" varchar,
  "status" varchar NOT NULL DEFAULT 'Scheduled',
  "measurements" jsonb,
  "accessibility" varchar,
  "power_available" boolean NOT NULL DEFAULT false,
  "water_available" boolean NOT NULL DEFAULT false,
  "drainage_available" boolean NOT NULL DEFAULT false,
  "floor_level" varchar,
  "ceiling_type" varchar,
  "wall_condition" varchar,
  "ventilation" varchar,
  "natural_light" varchar,
  "existing_equipment" text,
  "obstacles" text,
  "special_requirements" text,
  "photos_count" integer NOT NULL DEFAULT 0,
  "drawings_count" integer NOT NULL DEFAULT 0,
  "issues" jsonb,
  "recommendations" jsonb,
  "estimated_budget" numeric(15,2) NOT NULL DEFAULT 0,
  "completion_percent" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Work breakdown structure nodes
CREATE TABLE IF NOT EXISTS "pm_wbs_nodes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "code" varchar,
  "name" varchar,
  "type" varchar,
  "level" integer NOT NULL DEFAULT 0,
  "parent_id" varchar,
  "progress" integer NOT NULL DEFAULT 0,
  "status" varchar NOT NULL DEFAULT 'Not Started',
  "start_date" varchar,
  "end_date" varchar,
  "assigned_to" varchar,
  "estimated_hours" numeric(10,2) NOT NULL DEFAULT 0,
  "actual_hours" numeric(10,2) NOT NULL DEFAULT 0,
  "budget" numeric(15,2) NOT NULL DEFAULT 0,
  "actual_cost" numeric(15,2) NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Schedule / Gantt tasks
CREATE TABLE IF NOT EXISTS "pm_schedule_tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "name" varchar,
  "start_date" varchar,
  "end_date" varchar,
  "progress" integer NOT NULL DEFAULT 0,
  "assignee" varchar,
  "dependencies" jsonb,
  "phase" varchar,
  "status" varchar NOT NULL DEFAULT 'Not Started',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- Follow-up pass: wiring remaining mock-only project-management pages
-- ADDITIVE ONLY. Safe to re-run.
-- ============================================================================

-- Client document approval requests (documents/approvals)
CREATE TABLE IF NOT EXISTS "pm_document_approvals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "document_number" varchar,
  "document_name" varchar,
  "version" varchar,
  "document_type" varchar,
  "project_name" varchar,
  "sent_to_client" varchar,
  "client_email" varchar,
  "sent_date" varchar,
  "due_date" varchar,
  "status" varchar NOT NULL DEFAULT 'Pending',
  "approved_by" varchar,
  "approval_date" varchar,
  "signature_url" varchar,
  "comments" text,
  "reminders_sent" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Designer / technical workload tasks (technical/workload)
CREATE TABLE IF NOT EXISTS "pm_designer_tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "name" varchar,
  "project" varchar,
  "assignee" varchar,
  "target_date" varchar,
  "status" varchar NOT NULL DEFAULT 'Pending Review',
  "progress" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Resource allocation matrix (resource-scheduling/allocation)
CREATE TABLE IF NOT EXISTS "pm_resource_allocations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "resource_id" varchar,
  "resource_name" varchar,
  "role" varchar,
  "project_phase" varchar,
  "allocated_hours" numeric(10,2) NOT NULL DEFAULT 0,
  "start_date" varchar,
  "end_date" varchar,
  "allocation" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Packaging crates ([id]/packaging)
CREATE TABLE IF NOT EXISTS "pm_crates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "project_id" varchar,
  "number" varchar,
  "items" integer NOT NULL DEFAULT 0,
  "design_weight" numeric(10,2) NOT NULL DEFAULT 0,
  "actual_weight" numeric(10,2),
  "status" varchar NOT NULL DEFAULT 'Open',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Design assets / drawings ([id]/design-assets)
CREATE TABLE IF NOT EXISTS "pm_design_assets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "project_id" varchar,
  "file_name" varchar,
  "category" varchar NOT NULL DEFAULT 'drawing',
  "version" integer NOT NULL DEFAULT 1,
  "upload_date" varchar,
  "status" varchar NOT NULL DEFAULT 'pending',
  "thumbnail_url" varchar,
  "file_url" varchar,
  "comments" text,
  "is_latest" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Project material procurement status ([id]/procurement)
CREATE TABLE IF NOT EXISTS "pm_material_status" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "project_id" varchar,
  "name" varchar,
  "total_qty" numeric(12,2) NOT NULL DEFAULT 0,
  "reserved" numeric(12,2) NOT NULL DEFAULT 0,
  "ordered" numeric(12,2) NOT NULL DEFAULT 0,
  "received" numeric(12,2) NOT NULL DEFAULT 0,
  "status" varchar NOT NULL DEFAULT 'Procuring',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Factory machine status ([id]/production)
CREATE TABLE IF NOT EXISTS "pm_machine_status" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "project_id" varchar,
  "name" varchar,
  "type" varchar,
  "status" varchar NOT NULL DEFAULT 'Idle',
  "oee" integer NOT NULL DEFAULT 0,
  "current_job" varchar,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Project BOM tree items ([id]/technical/bom)
CREATE TABLE IF NOT EXISTS "pm_bom_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "project_id" varchar,
  "parent_id" varchar,
  "item_id" varchar,
  "name" varchar,
  "sku" varchar,
  "quantity" numeric(12,2) NOT NULL DEFAULT 0,
  "uom" varchar,
  "level" integer NOT NULL DEFAULT 0,
  "status" varchar NOT NULL DEFAULT 'In Stock',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Installation equipment catalog (installation-tracking-enhanced dropdowns)
CREATE TABLE IF NOT EXISTS "pm_equipment_catalog" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "code" varchar,
  "name" varchar,
  "category" varchar,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Dispatch item catalog (dispatch-planning-enhanced dropdowns)
CREATE TABLE IF NOT EXISTS "pm_dispatch_catalog" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "code" varchar,
  "name" varchar,
  "weight" numeric(10,2) NOT NULL DEFAULT 0,
  "volume" numeric(10,2) NOT NULL DEFAULT 0,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- BOQ line item templates (documents/upload/boq-enhanced)
CREATE TABLE IF NOT EXISTS "pm_boq_line_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "item" varchar,
  "description" varchar,
  "unit" varchar,
  "quantity" numeric(12,2) NOT NULL DEFAULT 0,
  "rate" numeric(12,2) NOT NULL DEFAULT 0,
  "amount" numeric(15,2) NOT NULL DEFAULT 0,
  "is_valid" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Project plans (net-new, additive) — powers projects/planning list page.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pm_project_plans" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "projectCode" varchar(50) NULL,
  "projectName" varchar(255) NOT NULL,
  "client" varchar(255) NULL,
  "projectManager" varchar(255) NULL,
  "startDate" date NULL,
  "endDate" date NULL,
  "estimatedBudget" numeric(18,2) NOT NULL DEFAULT 0,
  "actualBudget" numeric(18,2) NOT NULL DEFAULT 0,
  "status" varchar(30) NOT NULL DEFAULT 'planning',
  "priority" varchar(20) NOT NULL DEFAULT 'medium',
  "progressPercentage" integer NOT NULL DEFAULT 0,
  "phase" varchar(255) NULL,
  "milestones" integer NOT NULL DEFAULT 0,
  "completedMilestones" integer NOT NULL DEFAULT 0,
  "teamSize" integer NOT NULL DEFAULT 0,
  "location" varchar(255) NULL,
  "projectType" varchar(100) NULL,
  "riskLevel" varchar(20) NOT NULL DEFAULT 'low',
  "plannedHours" integer NOT NULL DEFAULT 0,
  "actualHours" integer NOT NULL DEFAULT 0,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_pm_project_plans" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_pm_project_plans_company_status"
  ON "pm_project_plans" ("companyId", "status");

-- ============================================================================
-- projects/planning/scope page — scope items
-- Additive only. Backs PmScopeItemEntity (pm_scope_items).
-- ============================================================================
CREATE TABLE IF NOT EXISTS "pm_scope_items" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" varchar(100) NOT NULL DEFAULT 'default',
  "item_code" varchar(255) NULL,
  "item_name" varchar(255) NULL,
  "description" text NULL,
  "project_code" varchar(255) NULL,
  "project_name" varchar(255) NULL,
  "category" varchar(255) NOT NULL DEFAULT 'deliverable',
  "type" varchar(255) NOT NULL DEFAULT 'in-scope',
  "status" varchar(255) NOT NULL DEFAULT 'defined',
  "wbs_reference" varchar(255) NULL,
  "priority" varchar(255) NOT NULL DEFAULT 'medium',
  "estimated_cost" numeric(15,2) NOT NULL DEFAULT 0,
  "estimated_duration" integer NOT NULL DEFAULT 0,
  "dependencies" jsonb NULL,
  "approved_by" varchar(255) NULL,
  "approved_date" varchar(255) NULL,
  "notes" text NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_pm_scope_items" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_pm_scope_items_company_status"
  ON "pm_scope_items" ("company_id", "status");

-- ============================================================================
-- projects/planning/charter page — project charters
-- Additive only. Backs PmCharterEntity (pm_charters).
-- ============================================================================
CREATE TABLE IF NOT EXISTS "pm_charters" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" varchar(100) NOT NULL DEFAULT 'default',
  "project_code" varchar(255) NULL,
  "project_name" varchar(255) NULL,
  "charter_number" varchar(255) NULL,
  "version" varchar(255) NOT NULL DEFAULT '1.0',
  "project_manager" varchar(255) NULL,
  "sponsor" varchar(255) NULL,
  "client" varchar(255) NULL,
  "department" varchar(255) NULL,
  "category" varchar(255) NOT NULL DEFAULT 'construction',
  "status" varchar(255) NOT NULL DEFAULT 'draft',
  "priority" varchar(255) NOT NULL DEFAULT 'medium',
  "objectives" jsonb NULL,
  "scope" jsonb NULL,
  "deliverables" jsonb NULL,
  "stakeholders" jsonb NULL,
  "budget" numeric(18,2) NOT NULL DEFAULT 0,
  "start_date" varchar(255) NULL,
  "end_date" varchar(255) NULL,
  "duration" varchar(255) NULL,
  "risks" jsonb NULL,
  "assumptions" jsonb NULL,
  "constraints" jsonb NULL,
  "success_criteria" jsonb NULL,
  "approvals" jsonb NULL,
  "created_by" varchar(255) NULL,
  "created_date" varchar(255) NULL,
  "last_modified" varchar(255) NULL,
  "approved_date" varchar(255) NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_pm_charters" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_pm_charters_company_status"
  ON "pm_charters" ("company_id", "status");

-- ============================================================================
-- projects/execution/kanban board — kanban cards
-- Additive only. Backs PmKanbanCardEntity (pm_kanban_cards).
-- ============================================================================
CREATE TABLE IF NOT EXISTS "pm_kanban_cards" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" varchar(100) NOT NULL DEFAULT 'default',
  "task_number" varchar(255) NULL,
  "title" varchar(255) NULL,
  "description" text NULL,
  "project_code" varchar(255) NULL,
  "project_name" varchar(255) NULL,
  "assignee" varchar(255) NULL,
  "priority" varchar(255) NOT NULL DEFAULT 'medium',
  "due_date" varchar(255) NULL,
  "estimated_hours" numeric(10,2) NOT NULL DEFAULT 0,
  "tags" jsonb NULL,
  "column_key" varchar(255) NOT NULL DEFAULT 'backlog',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_pm_kanban_cards" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_pm_kanban_cards_company_column"
  ON "pm_kanban_cards" ("company_id", "column_key");

-- ============================================================================
-- projects/tracking/earned-value page — EVM records
-- Additive only. Backs PmEarnedValueEntity (pm_earned_value).
-- ============================================================================
CREATE TABLE IF NOT EXISTS "pm_earned_value" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" varchar(100) NOT NULL DEFAULT 'default',
  "project_code" varchar(255) NULL,
  "project_name" varchar(255) NULL,
  "budget_at_completion" numeric(18,2) NOT NULL DEFAULT 0,
  "planned_value" numeric(18,2) NOT NULL DEFAULT 0,
  "earned_value" numeric(18,2) NOT NULL DEFAULT 0,
  "actual_cost" numeric(18,2) NOT NULL DEFAULT 0,
  "progress_percent" integer NOT NULL DEFAULT 0,
  "start_date" varchar(255) NULL,
  "end_date" varchar(255) NULL,
  "status" varchar(255) NOT NULL DEFAULT 'on-track',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_pm_earned_value" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_pm_earned_value_company_status"
  ON "pm_earned_value" ("company_id", "status");

-- ============================================================================
-- Wiring pass: critical-path / phase-progress / workflow / phase-2 /
-- resource-conflicts pages. ADDITIVE + IDEMPOTENT only (safe to re-run).
-- Seeds pm_schedule_tasks (backs critical-path + phase rollups) and
-- pm_resource_allocations (backs resource-conflicts). Fixed UUIDs => re-runnable.
-- ============================================================================

-- Schedule / Gantt tasks with dependencies + phase (drives critical-path
-- highlighting and the phase-progress rollup endpoint /schedule/phases).
INSERT INTO "pm_schedule_tasks"
  ("id","company_id","name","start_date","end_date","progress","assignee","dependencies","phase","status")
VALUES
  ('a1000000-0000-4000-8000-000000000001','default','Project Kickoff','2026-01-15','2026-01-16',100,'PM Team','[]','Project Initiation','Completed'),
  ('a1000000-0000-4000-8000-000000000002','default','Upload BOQ & Drawings','2026-01-16','2026-01-18',100,'PM Team','["a1000000-0000-4000-8000-000000000001"]','Project Initiation','Completed'),
  ('a1000000-0000-4000-8000-000000000003','default','Site Verification','2026-01-18','2026-01-22',100,'Design Team','["a1000000-0000-4000-8000-000000000002"]','Design & Site Assessment','Completed'),
  ('a1000000-0000-4000-8000-000000000004','default','Site Measurements','2026-01-22','2026-01-25',100,'Field Team','["a1000000-0000-4000-8000-000000000003"]','Design & Site Assessment','Completed'),
  ('a1000000-0000-4000-8000-000000000005','default','Technical Drawings','2026-01-25','2026-02-01',80,'Design Team','["a1000000-0000-4000-8000-000000000004"]','Technical Design & BOM','In Progress'),
  ('a1000000-0000-4000-8000-000000000006','default','BOM Creation','2026-01-28','2026-02-03',60,'Engineering','["a1000000-0000-4000-8000-000000000005"]','Technical Design & BOM','In Progress'),
  ('a1000000-0000-4000-8000-000000000007','default','Material Procurement','2026-02-03','2026-02-14',30,'Procurement','["a1000000-0000-4000-8000-000000000006"]','Procurement','In Progress'),
  ('a1000000-0000-4000-8000-000000000008','default','Tooling Preparation','2026-02-03','2026-02-08',0,'Tooling','["a1000000-0000-4000-8000-000000000006"]','Procurement','Not Started'),
  ('a1000000-0000-4000-8000-000000000009','default','Laser Cutting','2026-02-14','2026-02-20',0,'Production','["a1000000-0000-4000-8000-000000000007"]','Production','Not Started'),
  ('a1000000-0000-4000-8000-00000000000a','default','Assembly','2026-02-20','2026-02-28',0,'Production','["a1000000-0000-4000-8000-000000000009"]','Production','Not Started'),
  ('a1000000-0000-4000-8000-00000000000b','default','QC & Packaging','2026-02-28','2026-03-04',0,'Quality','["a1000000-0000-4000-8000-00000000000a"]','QC & Dispatch','Not Started'),
  ('a1000000-0000-4000-8000-00000000000c','default','Dispatch & Logistics','2026-03-04','2026-03-07',0,'Logistics','["a1000000-0000-4000-8000-00000000000b"]','QC & Dispatch','Not Started'),
  ('a1000000-0000-4000-8000-00000000000d','default','Site Installation','2026-03-07','2026-03-15',0,'Install Team','["a1000000-0000-4000-8000-00000000000c"]','Installation','Not Started'),
  ('a1000000-0000-4000-8000-00000000000e','default','Commissioning & Handover','2026-03-15','2026-03-20',0,'Commissioning','["a1000000-0000-4000-8000-00000000000d"]','Commissioning & Handover','Not Started')
ON CONFLICT ("id") DO NOTHING;

-- Resource allocations. Rows with allocation > 100 surface as conflicts on the
-- resource-conflicts page; the rest exercise the healthy path.
INSERT INTO "pm_resource_allocations"
  ("id","company_id","resource_id","resource_name","role","project_phase","allocated_hours","start_date","end_date","allocation")
VALUES
  ('b2000000-0000-4000-8000-000000000001','default','r-jsmith','John Smith','Machine Operator','Production',60,'2026-02-14','2026-02-20',150),
  ('b2000000-0000-4000-8000-000000000002','default','r-cnc3','CNC Machine #3','Equipment','Production',80,'2026-02-14','2026-02-18',200),
  ('b2000000-0000-4000-8000-000000000003','default','r-mjohnson','Mike Johnson','Assembler','Production',40,'2026-02-20','2026-02-28',120),
  ('b2000000-0000-4000-8000-000000000004','default','r-design1','Design Team A','Designer','Technical Design & BOM',35,'2026-01-25','2026-02-03',90),
  ('b2000000-0000-4000-8000-000000000005','default','r-proc1','Procurement Desk','Buyer','Procurement',30,'2026-02-03','2026-02-14',70)
ON CONFLICT ("id") DO NOTHING;
