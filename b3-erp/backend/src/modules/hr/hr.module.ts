import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// HR mock-page wiring (orphan-endpoint build) — direct imports
import { HrTeam } from './entities/hr-team.entity';
import { LeaveEncashment } from './entities/leave-encashment.entity';
import { TrainingEnrollment } from './entities/training-enrollment.entity';
import { ElearningCourse } from './entities/elearning-course.entity';
import { SkillAssessment } from './entities/skill-assessment.entity';
import { PerDiemRate } from './entities/per-diem-rate.entity';
import { ExpenseBudget } from './entities/expense-budget.entity';
import { PolicyAcknowledgment } from './entities/policy-acknowledgment.entity';
import { Timesheet } from './entities/timesheet.entity';
import { HrTeamController } from './controllers/hr-team.controller';
import { LeaveEncashmentController } from './controllers/leave-encashment.controller';
import { TrainingEnrollmentController } from './controllers/training-enrollment.controller';
import { ElearningCourseController } from './controllers/elearning-course.controller';
import { SkillAssessmentController } from './controllers/skill-assessment.controller';
import { PerDiemRateController } from './controllers/per-diem-rate.controller';
import { ExpenseBudgetController } from './controllers/expense-budget.controller';
import { PolicyAcknowledgmentController } from './controllers/policy-acknowledgment.controller';
import { TimesheetController } from './controllers/timesheet.controller';
import { HrTeamService } from './services/hr-team.service';
import { LeaveEncashmentService } from './services/leave-encashment.service';
import { TrainingEnrollmentService } from './services/training-enrollment.service';
import { ElearningCourseService } from './services/elearning-course.service';
import { SkillAssessmentService } from './services/skill-assessment.service';
import { PerDiemRateService } from './services/per-diem-rate.service';
import { ExpenseBudgetService } from './services/expense-budget.service';
import { PolicyAcknowledgmentService } from './services/policy-acknowledgment.service';
import { TimesheetService } from './services/timesheet.service';

// Attendance & Payroll config (orphan-endpoint build) — direct imports
import { AttendancePolicy } from './entities/attendance-policy.entity';
import { PayrollCalendarEvent } from './entities/payroll-calendar-event.entity';
import { SalaryComponentDef } from './entities/salary-component-def.entity';
import { SalaryTemplate } from './entities/salary-template.entity';
import { AttendancePolicyController } from './controllers/attendance-policy.controller';
import { PayrollCalendarEventController } from './controllers/payroll-calendar-event.controller';
import { SalaryComponentDefController } from './controllers/salary-component-def.controller';
import { SalaryTemplateController } from './controllers/salary-template.controller';
import { AttendancePolicyService } from './services/attendance-policy.service';
import { PayrollCalendarEventService } from './services/payroll-calendar-event.service';
import { SalaryComponentDefService } from './services/salary-component-def.service';
import { SalaryTemplateService } from './services/salary-template.service';

// Shift management (orphan-endpoint build) — direct imports to avoid barrel churn
import { ShiftAssignment } from './entities/shift-assignment.entity';
import { ShiftRosterEntry } from './entities/shift-roster-entry.entity';
import { ShiftSwap } from './entities/shift-swap.entity';
import { ShiftAssignmentController } from './controllers/shift-assignment.controller';
import { ShiftRosterController } from './controllers/shift-roster.controller';
import { ShiftSwapController } from './controllers/shift-swap.controller';
import { ShiftAssignmentService } from './services/shift-assignment.service';
import { ShiftRosterService } from './services/shift-roster.service';
import { ShiftSwapService } from './services/shift-swap.service';

// Transfers & Promotions (orphan-endpoint build) — direct imports
import { EmployeeMovement } from './entities/employee-movement.entity';
import { EmployeeMovementController } from './controllers/employee-movement.controller';
import { EmployeeMovementService } from './services/employee-movement.service';

// HR self-service orphan-endpoint build (travel, expenses, cards, alumni,
// overtime, safety, training catalog) — direct imports to avoid barrel churn
import { TravelRequest } from './entities/travel-request.entity';
import { TravelAdvance } from './entities/travel-advance.entity';
import { CorporateCard } from './entities/corporate-card.entity';
import { CardTransaction } from './entities/card-transaction.entity';
import { ExpenseClaim } from './entities/expense-claim.entity';
import { Alumni } from './entities/alumni.entity';
import { AlumniComment } from './entities/alumni-comment.entity';
import { OvertimeRequest } from './entities/overtime-request.entity';
import { SafetyIncident } from './entities/safety-incident.entity';
import { TrainingProgram } from './entities/training-program.entity';
import { TravelRequestController } from './controllers/travel-request.controller';
import { TravelAdvanceController } from './controllers/travel-advance.controller';
import { CorporateCardController } from './controllers/corporate-card.controller';
import { CardTransactionController } from './controllers/card-transaction.controller';
import { ExpenseClaimController } from './controllers/expense-claim.controller';
import { AlumniController } from './controllers/alumni.controller';
import { AlumniCommentController } from './controllers/alumni-comment.controller';
import { OvertimeRequestController } from './controllers/overtime-request.controller';
import { SafetyIncidentController } from './controllers/safety-incident.controller';
import { TrainingProgramController } from './controllers/training-program.controller';
import { TravelRequestService } from './services/travel-request.service';
import { TravelAdvanceService } from './services/travel-advance.service';
import { CorporateCardService } from './services/corporate-card.service';
import { CardTransactionService } from './services/card-transaction.service';
import { ExpenseClaimService } from './services/expense-claim.service';
import { AlumniService } from './services/alumni.service';
import { AlumniCommentService } from './services/alumni-comment.service';
import { OvertimeRequestService } from './services/overtime-request.service';
import { SafetyIncidentService } from './services/safety-incident.service';
import { TrainingProgramService } from './services/training-program.service';

// HR Safety orphan-endpoint build (shared discriminator tables) — direct imports
import { SafetyHazard } from './entities/safety-hazard.entity';
import { SafetyInspection } from './entities/safety-inspection.entity';
import { SafetyPpe } from './entities/safety-ppe.entity';
import { SafetyDrill } from './entities/safety-drill.entity';
import { SafetyTraining } from './entities/safety-training.entity';
import { SafetyWellness } from './entities/safety-wellness.entity';
import { SafetyReport } from './entities/safety-report.entity';
import { SafetyHazardController } from './controllers/safety-hazard.controller';
import { SafetyInspectionController } from './controllers/safety-inspection.controller';
import { SafetyPpeController } from './controllers/safety-ppe.controller';
import { SafetyDrillController } from './controllers/safety-drill.controller';
import { SafetyTrainingController } from './controllers/safety-training.controller';
import { SafetyWellnessController } from './controllers/safety-wellness.controller';
import { SafetyReportController } from './controllers/safety-report.controller';
import { SafetyHazardService } from './services/safety-hazard.service';
import { SafetyInspectionService } from './services/safety-inspection.service';
import { SafetyPpeService } from './services/safety-ppe.service';
import { SafetyDrillService } from './services/safety-drill.service';
import { SafetyTrainingService } from './services/safety-training.service';
import { SafetyWellnessService } from './services/safety-wellness.service';
import { SafetyReportService } from './services/safety-report.service';

// HR Asset Management (orphan-endpoint build) — direct imports
import { AssetItem } from './entities/asset-item.entity';
import { AssetRequest } from './entities/asset-request.entity';
import { AssetTransfer } from './entities/asset-transfer.entity';
import { AssetReturn } from './entities/asset-return.entity';
import { AssetAllocation } from './entities/asset-allocation.entity';
import { AssetInventory } from './entities/asset-inventory.entity';
import { AssetMaintenance } from './entities/asset-maintenance.entity';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleFuel } from './entities/vehicle-fuel.entity';
import { AssetItemController } from './controllers/asset-item.controller';
import { AssetRequestController } from './controllers/asset-request.controller';
import { AssetTransferController } from './controllers/asset-transfer.controller';
import { AssetReturnController } from './controllers/asset-return.controller';
import { AssetAllocationController } from './controllers/asset-allocation.controller';
import { AssetInventoryController } from './controllers/asset-inventory.controller';
import { AssetMaintenanceController } from './controllers/asset-maintenance.controller';
import { VehicleController } from './controllers/vehicle.controller';
import { VehicleFuelController } from './controllers/vehicle-fuel.controller';
import { AssetItemService } from './services/asset-item.service';
import { AssetRequestService } from './services/asset-request.service';
import { AssetTransferService } from './services/asset-transfer.service';
import { AssetReturnService } from './services/asset-return.service';
import { AssetAllocationService } from './services/asset-allocation.service';
import { AssetInventoryService } from './services/asset-inventory.service';
import { AssetMaintenanceService } from './services/asset-maintenance.service';
import { VehicleService } from './services/vehicle.service';
import { VehicleFuelService } from './services/vehicle-fuel.service';

// HR Compliance & Documents (orphan-endpoint build) — direct imports
import { ComplianceLicense } from './entities/compliance-license.entity';
import { ComplianceReturn } from './entities/compliance-return.entity';
import { DisciplinaryAction } from './entities/disciplinary-action.entity';
import { PolicyViolation } from './entities/policy-violation.entity';
import { ComplianceRegister } from './entities/compliance-register.entity';
import { ComplianceAudit } from './entities/compliance-audit.entity';
import { HrGrievance } from './entities/hr-grievance.entity';
import { HrDocument } from './entities/hr-document.entity';
import { ComplianceLicenseController } from './controllers/compliance-license.controller';
import { ComplianceReturnController } from './controllers/compliance-return.controller';
import { DisciplinaryActionController } from './controllers/disciplinary-action.controller';
import { PolicyViolationController } from './controllers/policy-violation.controller';
import { ComplianceRegisterController } from './controllers/compliance-register.controller';
import { ComplianceAuditController } from './controllers/compliance-audit.controller';
import { HrGrievanceController } from './controllers/hr-grievance.controller';
import { HrDocumentController } from './controllers/hr-document.controller';
import { ComplianceLicenseService } from './services/compliance-license.service';
import { ComplianceReturnService } from './services/compliance-return.service';
import { DisciplinaryActionService } from './services/disciplinary-action.service';
import { PolicyViolationService } from './services/policy-violation.service';
import { ComplianceRegisterService } from './services/compliance-register.service';

// Net-new HR features (KPI master, training budget, review cycle) — direct imports
import { KpiMaster } from './entities/kpi-master.entity';
import { TrainingBudget } from './entities/training-budget.entity';
import { ReviewCycle } from './entities/review-cycle.entity';
import { KpiMasterController } from './controllers/kpi-master.controller';
import { TrainingBudgetController } from './controllers/training-budget.controller';
import { ReviewCycleController } from './controllers/review-cycle.controller';
import { KpiMasterService } from './services/kpi-master.service';
import { TrainingBudgetService } from './services/training-budget.service';
import { ReviewCycleService } from './services/review-cycle.service';
import { ComplianceAuditService } from './services/compliance-audit.service';
import { HrGrievanceService } from './services/hr-grievance.service';
import { HrDocumentService } from './services/hr-document.service';

// HR Assets & Documents remaining orphan-endpoint build — direct imports
import { IdCard } from './entities/id-card.entity';
import { AccessCard } from './entities/access-card.entity';
import { Stationery } from './entities/stationery.entity';
import { AssetAudit } from './entities/asset-audit.entity';
import { VehicleAssignment } from './entities/vehicle-assignment.entity';
import { AmcContract } from './entities/amc-contract.entity';
import { PreventiveMaintenance } from './entities/preventive-maintenance.entity';
import { CertificateRequest } from './entities/certificate-request.entity';
import { DocumentAuditLog } from './entities/document-audit-log.entity';
import { IdCardController } from './controllers/id-card.controller';
import { AccessCardController } from './controllers/access-card.controller';
import { StationeryController } from './controllers/stationery.controller';
import { AssetAuditController } from './controllers/asset-audit.controller';
import { VehicleAssignmentController } from './controllers/vehicle-assignment.controller';
import { AmcContractController } from './controllers/amc-contract.controller';
import { PreventiveMaintenanceController } from './controllers/preventive-maintenance.controller';
import { CertificateRequestController } from './controllers/certificate-request.controller';
import { DocumentAuditLogController } from './controllers/document-audit-log.controller';
import { AssetReportController } from './controllers/asset-report.controller';
import { IdCardService } from './services/id-card.service';
import { AccessCardService } from './services/access-card.service';
import { StationeryService } from './services/stationery.service';
import { AssetAuditService } from './services/asset-audit.service';
import { VehicleAssignmentService } from './services/vehicle-assignment.service';
import { AmcContractService } from './services/amc-contract.service';
import { PreventiveMaintenanceService } from './services/preventive-maintenance.service';
import { CertificateRequestService } from './services/certificate-request.service';
// HR Compliance orphan-endpoint builds (compliance certificates, POSH, remediation)
import { ComplianceCertificate } from './entities/compliance-certificate.entity';
import { PoshComplaint } from './entities/posh-complaint.entity';
import { RemediationPlan } from './entities/remediation-plan.entity';
import { ComplianceCertificateController } from './controllers/compliance-certificate.controller';
import { PoshComplaintController } from './controllers/posh-complaint.controller';
import { RemediationPlanController } from './controllers/remediation-plan.controller';
import { ComplianceCertificateService } from './services/compliance-certificate.service';
import { PoshComplaintService } from './services/posh-complaint.service';
import { RemediationPlanService } from './services/remediation-plan.service';
import { DocumentAuditLogService } from './services/document-audit-log.service';
import { AssetReportService } from './services/asset-report.service';

// Succession / Probation / Performance-goals (orphan-endpoint build) — direct imports
import { SuccessionPlan } from './entities/succession-plan.entity';
import { ProbationReview } from './entities/probation-review.entity';
import { PerformanceGoal } from './entities/performance-goal.entity';
import { SuccessionPlanController } from './controllers/succession-plan.controller';
import { ProbationReviewController } from './controllers/probation-review.controller';
import { PerformanceGoalController } from './controllers/performance-goal.controller';
import { SuccessionPlanService } from './services/succession-plan.service';
import { ProbationReviewService } from './services/probation-review.service';
import { PerformanceGoalService } from './services/performance-goal.service';

// Onboarding / Offboarding tasks (orphan-endpoint build) — direct imports
import { OnboardingTask } from './entities/onboarding-task.entity';
import { OffboardingTask } from './entities/offboarding-task.entity';
import { OnboardingTaskController } from './controllers/onboarding-task.controller';
import { OnboardingController } from './controllers/onboarding.controller';
import { OvertimeSettingsController } from './controllers/overtime-settings.controller';
import { OvertimeSettingsService } from './services/overtime-settings.service';
import { OffboardingTaskController } from './controllers/offboarding-task.controller';
import { OnboardingTaskService } from './services/onboarding-task.service';
import { OffboardingTaskService } from './services/offboarding-task.service';

// Payroll orphan-endpoint build — direct imports to avoid barrel churn
import { PayrollStatutoryFiling } from './entities/payroll-statutory-filing.entity';
import { PayrollTaxRecord } from './entities/payroll-tax-record.entity';
import { PayrollBonusRecord } from './entities/payroll-bonus-record.entity';
import { PayrollSalaryRevision } from './entities/payroll-salary-revision.entity';
import { PayrollDisbursement } from './entities/payroll-disbursement.entity';
import { PayrollReport } from './entities/payroll-report.entity';
import { PayrollStatutoryFilingController } from './controllers/payroll-statutory-filing.controller';
import { PayrollTaxRecordController } from './controllers/payroll-tax-record.controller';
import { PayrollBonusRecordController } from './controllers/payroll-bonus-record.controller';
import { PayrollSalaryRevisionController } from './controllers/payroll-salary-revision.controller';
import { PayrollDisbursementController } from './controllers/payroll-disbursement.controller';
import { PayrollReportController } from './controllers/payroll-report.controller';
import { PayrollStatutoryFilingService } from './services/payroll-statutory-filing.service';
import { PayrollTaxRecordService } from './services/payroll-tax-record.service';
import { PayrollBonusRecordService } from './services/payroll-bonus-record.service';
import { PayrollSalaryRevisionService } from './services/payroll-salary-revision.service';
import { PayrollDisbursementService } from './services/payroll-disbursement.service';
import { PayrollReportService } from './services/payroll-report.service';
import { PayrollLoanRecovery } from './entities/payroll-loan-recovery.entity';
import { PayrollLoanRecoveryController } from './controllers/payroll-loan-recovery.controller';
import { PayrollLoanRecoveryService } from './services/payroll-loan-recovery.service';
import { PayrollBonusScheme } from './entities/payroll-bonus-scheme.entity';
import { PayrollBonusSchemeController } from './controllers/payroll-bonus-scheme.controller';
import { PayrollBonusSchemeService } from './services/payroll-bonus-scheme.service';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { AttendanceRecordController } from './controllers/attendance-record.controller';
import { AttendanceRecordService } from './services/attendance-record.service';

// Entities
import {
  Department,
  Designation,
  Shift,
  Holiday,
  Employee,
  LeaveType,
  LeaveBalance,
  LeaveApplication,
  Attendance,
  SalaryStructure,
  Payroll,
  SalarySlip,
  PerformanceReview,
  SkillCategory,
  Skill,
  ProficiencyLevel,
  UserSkill,
  SkillGap,
} from './entities';

// Controllers
import {
  DepartmentController,
  DesignationController,
  ShiftController,
  HolidayController,
  EmployeeController,
  LeaveTypeController,
  LeaveBalanceController,
  LeaveApplicationController,
  AttendanceController,
  SalaryStructureController,
  PayrollController,
  SalarySlipController,
  PerformanceReviewController,
  SkillCategoryController,
  SkillController,
  ProficiencyLevelController,
  UserSkillController,
  SkillGapController,
  BonusController,
  LoanController,
  AdvanceController,
} from './controllers';

// Services
import {
  DepartmentService,
  DesignationService,
  ShiftService,
  HolidayService,
  EmployeeService,
  LeaveTypeService,
  LeaveBalanceService,
  LeaveApplicationService,
  AttendanceService,
  SalaryStructureService,
  PayrollService,
  SalarySlipService,
  PerformanceReviewService,
  SkillCategoryService,
  SkillService,
  ProficiencyLevelService,
  UserSkillService,
  SkillGapService,
  BonusService,
  LoanService,
  AdvanceService,
  IncentiveService,
  PayrollProcessingService,
  StatutoryService,
} from './services';
import { DepartmentSeederService } from './services/department-seeder.service';
import { DesignationSeederService } from './services/designation-seeder.service';
import { EmployeeSeederService } from './services/employee-seeder.service';
import { HolidaySeederService } from './services/holiday-seeder.service';
import { LeaveTypeSeederService } from './services/leave-type-seeder.service';
import { OffboardingService } from './services/offboarding.service';
import { OnboardingWorkflowService } from './services/onboarding-workflow.service';
import { OnboardingService } from './services/onboarding.service';
import { PayrollSeederService } from './services/payroll-seeder.service';
import { ProbationService } from './services/probation.service';
import { SeparationService } from './services/separation.service';
import { ShiftSeederService } from './services/shift-seeder.service';
import { SkillSeederService } from './services/skill-seeder.service';
import { TrainingService } from './services/training.service';
import { AssetManagementService } from './services/asset-management.service';
import { DocumentManagementService } from './services/document-management.service';
import { PerformanceManagementService } from './services/performance-management.service';
import { TrainingDevelopmentService } from './services/training-development.service';
import { HRComplianceService } from './services/hr-compliance.service';

// Net-new HR Training subsystem (schedules, attendance, waitlist, certifications,
// feedback, assessments+attempts, e-learning progress, computed reports)
import { TrainingSchedule } from './entities/training-schedule.entity';
import { TrainingAttendance } from './entities/training-attendance.entity';
import { TrainingWaitlist } from './entities/training-waitlist.entity';
import { CertificationTracking } from './entities/certification-tracking.entity';
import { TrainingFeedback } from './entities/training-feedback.entity';
import { TrainingAssessment } from './entities/training-assessment.entity';
import { TrainingAssessmentAttempt } from './entities/training-assessment-attempt.entity';
import { CourseProgress } from './entities/course-progress.entity';
import { TrainingScheduleController } from './controllers/training-schedule.controller';
import { TrainingAttendanceController } from './controllers/training-attendance.controller';
import { TrainingWaitlistController } from './controllers/training-waitlist.controller';
import { CertificationTrackingController } from './controllers/certification-tracking.controller';
import { TrainingFeedbackController } from './controllers/training-feedback.controller';
import {
  TrainingAssessmentController,
  TrainingAssessmentAttemptController,
} from './controllers/training-assessment.controller';
import { CourseProgressController } from './controllers/course-progress.controller';
import { TrainingReportController } from './controllers/training-report.controller';
import { TrainingScheduleService } from './services/training-schedule.service';
import { TrainingAttendanceService } from './services/training-attendance.service';
import { TrainingWaitlistService } from './services/training-waitlist.service';
import { CertificationTrackingService } from './services/certification-tracking.service';
import { TrainingFeedbackService } from './services/training-feedback.service';
import { TrainingAssessmentService } from './services/training-assessment.service';
import { CourseProgressService } from './services/course-progress.service';
import { TrainingReportService } from './services/training-report.service';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    TypeOrmModule.forFeature([
      // HR mock-page wiring (orphan-endpoint build)
      HrTeam,
      LeaveEncashment,
      TrainingEnrollment,
      ElearningCourse,
      SkillAssessment,
      PerDiemRate,
      ExpenseBudget,
      PolicyAcknowledgment,
      Timesheet,
      AttendancePolicy,
      PayrollCalendarEvent,
      SalaryComponentDef,
      SalaryTemplate,
      ShiftAssignment,
      ShiftRosterEntry,
      ShiftSwap,
      EmployeeMovement,
      TravelRequest,
      TravelAdvance,
      CorporateCard,
      CardTransaction,
      ExpenseClaim,
      Alumni,
      AlumniComment,
      OvertimeRequest,
      SafetyIncident,
      TrainingProgram,
      // HR Safety orphan-endpoint build (shared discriminator tables)
      SafetyHazard,
      SafetyInspection,
      SafetyPpe,
      SafetyDrill,
      SafetyTraining,
      SafetyWellness,
      SafetyReport,
      // HR Compliance & Documents (orphan-endpoint build)
      ComplianceLicense,
      ComplianceReturn,
      DisciplinaryAction,
      PolicyViolation,
      ComplianceRegister,
      ComplianceAudit,
      HrGrievance,
      HrDocument,
      // Net-new HR features
      KpiMaster,
      TrainingBudget,
      ReviewCycle,
      // Net-new HR Training subsystem
      TrainingSchedule,
      TrainingAttendance,
      TrainingWaitlist,
      CertificationTracking,
      TrainingFeedback,
      TrainingAssessment,
      TrainingAssessmentAttempt,
      CourseProgress,
      // HR Asset Management
      AssetItem,
      AssetRequest,
      AssetTransfer,
      AssetReturn,
      AssetAllocation,
      AssetInventory,
      AssetMaintenance,
      Vehicle,
      VehicleFuel,
      IdCard,
      AccessCard,
      Stationery,
      AssetAudit,
      VehicleAssignment,
      AmcContract,
      PreventiveMaintenance,
      CertificateRequest,
      ComplianceCertificate,
      PoshComplaint,
      RemediationPlan,
      DocumentAuditLog,
      SuccessionPlan,
      ProbationReview,
      PerformanceGoal,
      OnboardingTask,
      OffboardingTask,
      // Payroll orphan-endpoint build
      PayrollStatutoryFiling,
      PayrollTaxRecord,
      PayrollBonusRecord,
      PayrollSalaryRevision,
      PayrollDisbursement,
      PayrollReport,
      PayrollLoanRecovery,
      PayrollBonusScheme,
      // Core HR
      Department,
      Designation,
      Shift,
      Holiday,

      // Employee Management
      Employee,

      // Leave Management
      LeaveType,
      LeaveBalance,
      LeaveApplication,

      // Attendance Management
      Attendance,
      AttendanceRecord,

      // Payroll Management
      SalaryStructure,
      Payroll,
      SalarySlip,

      // Performance Management
      PerformanceReview,

      // Skill Management
      SkillCategory,
      Skill,
      ProficiencyLevel,
      UserSkill,
      SkillGap,
    ]),
  ],
  controllers: [
    // HR mock-page wiring (orphan-endpoint build)
    HrTeamController,
    LeaveEncashmentController,
    TrainingEnrollmentController,
    ElearningCourseController,
    SkillAssessmentController,
    PerDiemRateController,
    ExpenseBudgetController,
    PolicyAcknowledgmentController,
    TimesheetController,
    AttendancePolicyController,
    PayrollCalendarEventController,
    SalaryComponentDefController,
    SalaryTemplateController,
    ShiftAssignmentController,
    ShiftRosterController,
    ShiftSwapController,
    EmployeeMovementController,
    TravelRequestController,
    TravelAdvanceController,
    CorporateCardController,
    CardTransactionController,
    ExpenseClaimController,
    AlumniController,
    AlumniCommentController,
    OvertimeRequestController,
    SafetyIncidentController,
    TrainingProgramController,
    // HR Safety orphan-endpoint build (shared discriminator tables)
    SafetyHazardController,
    SafetyInspectionController,
    SafetyPpeController,
    SafetyDrillController,
    SafetyTrainingController,
    SafetyWellnessController,
    SafetyReportController,
    // HR Compliance & Documents (orphan-endpoint build)
    ComplianceLicenseController,
    ComplianceReturnController,
    DisciplinaryActionController,
    PolicyViolationController,
    ComplianceRegisterController,
    ComplianceAuditController,
    HrGrievanceController,
    HrDocumentController,
    // Net-new HR features
    KpiMasterController,
    TrainingBudgetController,
    ReviewCycleController,
    // Net-new HR Training subsystem
    TrainingScheduleController,
    TrainingAttendanceController,
    TrainingWaitlistController,
    CertificationTrackingController,
    TrainingFeedbackController,
    TrainingAssessmentController,
    TrainingAssessmentAttemptController,
    CourseProgressController,
    TrainingReportController,
    // HR Asset Management
    AssetItemController,
    AssetRequestController,
    AssetTransferController,
    AssetReturnController,
    AssetAllocationController,
    AssetInventoryController,
    AssetMaintenanceController,
    VehicleController,
    VehicleFuelController,
    IdCardController,
    AccessCardController,
    StationeryController,
    AssetAuditController,
    VehicleAssignmentController,
    AmcContractController,
    PreventiveMaintenanceController,
    CertificateRequestController,
    ComplianceCertificateController,
    PoshComplaintController,
    RemediationPlanController,
    DocumentAuditLogController,
    AssetReportController,
    SuccessionPlanController,
    ProbationReviewController,
    PerformanceGoalController,
    OnboardingTaskController,
    OnboardingController,
    OvertimeSettingsController,
    OffboardingTaskController,
    // Payroll orphan-endpoint build
    PayrollStatutoryFilingController,
    PayrollTaxRecordController,
    PayrollBonusRecordController,
    PayrollSalaryRevisionController,
    PayrollDisbursementController,
    PayrollReportController,
    PayrollLoanRecoveryController,
    PayrollBonusSchemeController,
    DepartmentController,
    DesignationController,
    ShiftController,
    HolidayController,
    EmployeeController,
    LeaveTypeController,
    LeaveBalanceController,
    LeaveApplicationController,
    AttendanceController,
    AttendanceRecordController,
    SalaryStructureController,
    PayrollController,
    SalarySlipController,
    PerformanceReviewController,
    SkillCategoryController,
    SkillController,
    ProficiencyLevelController,
    UserSkillController,
    SkillGapController,
    // Payroll Management (Prisma-based)
    BonusController,
    LoanController,
    AdvanceController,
  ],
  providers: [
    // HR mock-page wiring (orphan-endpoint build)
    HrTeamService,
    LeaveEncashmentService,
    TrainingEnrollmentService,
    ElearningCourseService,
    SkillAssessmentService,
    PerDiemRateService,
    ExpenseBudgetService,
    PolicyAcknowledgmentService,
    TimesheetService,
    AttendancePolicyService,
    PayrollCalendarEventService,
    SalaryComponentDefService,
    SalaryTemplateService,
    ShiftAssignmentService,
    ShiftRosterService,
    ShiftSwapService,
    EmployeeMovementService,
    TravelRequestService,
    TravelAdvanceService,
    CorporateCardService,
    CardTransactionService,
    ExpenseClaimService,
    AlumniService,
    AlumniCommentService,
    OvertimeRequestService,
    SafetyIncidentService,
    TrainingProgramService,
    // HR Safety orphan-endpoint build (shared discriminator tables)
    SafetyHazardService,
    SafetyInspectionService,
    SafetyPpeService,
    SafetyDrillService,
    SafetyTrainingService,
    SafetyWellnessService,
    SafetyReportService,
    // HR Compliance & Documents (orphan-endpoint build)
    ComplianceLicenseService,
    ComplianceReturnService,
    DisciplinaryActionService,
    PolicyViolationService,
    ComplianceRegisterService,
    ComplianceAuditService,
    HrGrievanceService,
    HrDocumentService,
    // Net-new HR features
    KpiMasterService,
    TrainingBudgetService,
    ReviewCycleService,
    // Net-new HR Training subsystem
    TrainingScheduleService,
    TrainingAttendanceService,
    TrainingWaitlistService,
    CertificationTrackingService,
    TrainingFeedbackService,
    TrainingAssessmentService,
    CourseProgressService,
    TrainingReportService,
    // HR Asset Management
    AssetItemService,
    AssetRequestService,
    AssetTransferService,
    AssetReturnService,
    AssetAllocationService,
    AssetInventoryService,
    AssetMaintenanceService,
    VehicleService,
    VehicleFuelService,
    IdCardService,
    AccessCardService,
    StationeryService,
    AssetAuditService,
    VehicleAssignmentService,
    AmcContractService,
    PreventiveMaintenanceService,
    CertificateRequestService,
    ComplianceCertificateService,
    PoshComplaintService,
    RemediationPlanService,
    DocumentAuditLogService,
    AssetReportService,
    SuccessionPlanService,
    ProbationReviewService,
    PerformanceGoalService,
    OnboardingTaskService,
    OffboardingTaskService,
    // Payroll orphan-endpoint build
    PayrollStatutoryFilingService,
    PayrollTaxRecordService,
    PayrollBonusRecordService,
    PayrollSalaryRevisionService,
    PayrollDisbursementService,
    PayrollReportService,
    PayrollLoanRecoveryService,
    PayrollBonusSchemeService,
    DepartmentService,
    DesignationService,
    ShiftService,
    HolidayService,
    EmployeeService,
    LeaveTypeService,
    LeaveBalanceService,
    LeaveApplicationService,
    AttendanceService,
    AttendanceRecordService,
    SalaryStructureService,
    PayrollService,
    SalarySlipService,
    PerformanceReviewService,
    OnboardingWorkflowService,
    OnboardingService,
    OvertimeSettingsService,
    ProbationService,
    OffboardingService,
    SeparationService,
    TrainingService,
    SkillCategoryService,
    SkillService,
    ProficiencyLevelService,
    UserSkillService,
    SkillGapService,
    SkillSeederService,
    DepartmentSeederService,
    DesignationSeederService,
    ShiftSeederService,
    HolidaySeederService,
    LeaveTypeSeederService,
    EmployeeSeederService,
    PayrollSeederService,
    // Payroll Management (Prisma-based)
    BonusService,
    LoanService,
    AdvanceService,
    IncentiveService,
    PayrollProcessingService,
    StatutoryService,
    // Asset & Document Management
    AssetManagementService,
    DocumentManagementService,
    // Performance Management & Training Development
    PerformanceManagementService,
    TrainingDevelopmentService,
    // HR Compliance
    HRComplianceService,
  ],
  exports: [
    DepartmentService,
    DesignationService,
    ShiftService,
    HolidayService,
    EmployeeService,
    LeaveTypeService,
    LeaveBalanceService,
    LeaveApplicationService,
    AttendanceService,
    AttendanceRecordService,
    SalaryStructureService,
    PayrollService,
    SalarySlipService,
    PerformanceReviewService,
    OnboardingWorkflowService,
    OnboardingService,
    OvertimeSettingsService,
    ProbationService,
    OffboardingService,
    SeparationService,
    TrainingService,
    SkillCategoryService,
    SkillService,
    ProficiencyLevelService,
    UserSkillService,
    SkillGapService,
    // Payroll Management (Prisma-based)
    BonusService,
    LoanService,
    AdvanceService,
    IncentiveService,
    PayrollProcessingService,
    StatutoryService,
    // Asset & Document Management
    AssetManagementService,
    DocumentManagementService,
    // Performance Management & Training Development
    PerformanceManagementService,
    TrainingDevelopmentService,
    // HR Compliance
    HRComplianceService,
  ],
})
export class HrModule {}
