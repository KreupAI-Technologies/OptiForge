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
      ShiftAssignment, ShiftRosterEntry, ShiftSwap,
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
    ShiftAssignmentController, ShiftRosterController, ShiftSwapController,
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
    ShiftAssignmentService, ShiftRosterService, ShiftSwapService,
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
