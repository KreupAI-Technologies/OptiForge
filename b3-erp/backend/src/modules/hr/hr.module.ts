import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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
import { OvertimeRequest } from './entities/overtime-request.entity';
import { SafetyIncident } from './entities/safety-incident.entity';
import { TrainingProgram } from './entities/training-program.entity';
import { TravelRequestController } from './controllers/travel-request.controller';
import { TravelAdvanceController } from './controllers/travel-advance.controller';
import { CorporateCardController } from './controllers/corporate-card.controller';
import { CardTransactionController } from './controllers/card-transaction.controller';
import { ExpenseClaimController } from './controllers/expense-claim.controller';
import { AlumniController } from './controllers/alumni.controller';
import { OvertimeRequestController } from './controllers/overtime-request.controller';
import { SafetyIncidentController } from './controllers/safety-incident.controller';
import { TrainingProgramController } from './controllers/training-program.controller';
import { TravelRequestService } from './services/travel-request.service';
import { TravelAdvanceService } from './services/travel-advance.service';
import { CorporateCardService } from './services/corporate-card.service';
import { CardTransactionService } from './services/card-transaction.service';
import { ExpenseClaimService } from './services/expense-claim.service';
import { AlumniService } from './services/alumni.service';
import { OvertimeRequestService } from './services/overtime-request.service';
import { SafetyIncidentService } from './services/safety-incident.service';
import { TrainingProgramService } from './services/training-program.service';

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
import { ComplianceAuditService } from './services/compliance-audit.service';
import { HrGrievanceService } from './services/hr-grievance.service';
import { HrDocumentService } from './services/hr-document.service';

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
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    TypeOrmModule.forFeature([
      ShiftAssignment, ShiftRosterEntry, ShiftSwap, EmployeeMovement,
      TravelRequest, TravelAdvance, CorporateCard, CardTransaction,
      ExpenseClaim, Alumni, OvertimeRequest, SafetyIncident, TrainingProgram,
      // HR Compliance & Documents (orphan-endpoint build)
      ComplianceLicense, ComplianceReturn, DisciplinaryAction, PolicyViolation,
      ComplianceRegister, ComplianceAudit, HrGrievance, HrDocument,
      // HR Asset Management
      AssetItem, AssetRequest, AssetTransfer, AssetReturn, AssetAllocation,
      AssetInventory, AssetMaintenance, Vehicle, VehicleFuel,
      SuccessionPlan,
      ProbationReview,
      PerformanceGoal,
      OnboardingTask, OffboardingTask,
      // Payroll orphan-endpoint build
      PayrollStatutoryFiling,
      PayrollTaxRecord,
      PayrollBonusRecord,
      PayrollSalaryRevision,
      PayrollDisbursement,
      PayrollReport,
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
    ShiftAssignmentController, ShiftRosterController, ShiftSwapController, EmployeeMovementController,
    TravelRequestController, TravelAdvanceController, CorporateCardController,
    CardTransactionController, ExpenseClaimController, AlumniController,
    OvertimeRequestController, SafetyIncidentController, TrainingProgramController,
    // HR Compliance & Documents (orphan-endpoint build)
    ComplianceLicenseController, ComplianceReturnController, DisciplinaryActionController,
    PolicyViolationController, ComplianceRegisterController, ComplianceAuditController,
    HrGrievanceController, HrDocumentController,
    // HR Asset Management
    AssetItemController, AssetRequestController, AssetTransferController,
    AssetReturnController, AssetAllocationController, AssetInventoryController,
    AssetMaintenanceController, VehicleController, VehicleFuelController,
    SuccessionPlanController,
    ProbationReviewController,
    PerformanceGoalController,
    OnboardingTaskController, OffboardingTaskController,
    // Payroll orphan-endpoint build
    PayrollStatutoryFilingController,
    PayrollTaxRecordController,
    PayrollBonusRecordController,
    PayrollSalaryRevisionController,
    PayrollDisbursementController,
    PayrollReportController,
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
    // Payroll Management (Prisma-based)
    BonusController,
    LoanController,
    AdvanceController,
  ],
  providers: [
    ShiftAssignmentService, ShiftRosterService, ShiftSwapService, EmployeeMovementService,
    TravelRequestService, TravelAdvanceService, CorporateCardService,
    CardTransactionService, ExpenseClaimService, AlumniService,
    OvertimeRequestService, SafetyIncidentService, TrainingProgramService,
    // HR Compliance & Documents (orphan-endpoint build)
    ComplianceLicenseService, ComplianceReturnService, DisciplinaryActionService,
    PolicyViolationService, ComplianceRegisterService, ComplianceAuditService,
    HrGrievanceService, HrDocumentService,
    // HR Asset Management
    AssetItemService, AssetRequestService, AssetTransferService,
    AssetReturnService, AssetAllocationService, AssetInventoryService,
    AssetMaintenanceService, VehicleService, VehicleFuelService,
    SuccessionPlanService,
    ProbationReviewService,
    PerformanceGoalService,
    OnboardingTaskService, OffboardingTaskService,
    // Payroll orphan-endpoint build
    PayrollStatutoryFilingService,
    PayrollTaxRecordService,
    PayrollBonusRecordService,
    PayrollSalaryRevisionService,
    PayrollDisbursementService,
    PayrollReportService,
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
    OnboardingWorkflowService,
    OnboardingService,
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
    SalaryStructureService,
    PayrollService,
    SalarySlipService,
    PerformanceReviewService,
    OnboardingWorkflowService,
    OnboardingService,
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
