import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowModule } from '../workflow/workflow.module';

// Entities
import {
  QCTemplate,
  QCParameter,
  Inspection,
  InspectionResultEntity,
  NonConformance,
  CorrectiveAction,
  PreventiveAction,
  CAPA,
  QualityAlert,
  AuditPlan,
  AuditFindings,
  NCR,
  DefectCode,
  ReworkItem,
} from './entities';

// Services
import {
  QCTemplateService,
  QCParameterService,
  InspectionService,
  InspectionResultService,
  NonConformanceService,
  CorrectiveActionService,
  PreventiveActionService,
  CAPAService,
  QualityAlertService,
  AuditPlanService,
  AuditFindingsService,
  NCRService,
  QCTemplateSeederService,
  QCParameterSeederService,
  DefectCodeSeederService,
  ReworkItemService,
} from './services';
import { CAPAManagementService } from './services/capa-management.service';

// Controllers
import {
  QCTemplateController,
  QCParameterController,
  InspectionController,
  InspectionResultController,
  NonConformanceController,
  CorrectiveActionController,
  PreventiveActionController,
  CAPAController,
  QualityAlertController,
  AuditPlanController,
  AuditFindingsController,
  NCRController, // Added NCRController
  ReworkItemController,
} from './controllers';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Main entities
      QCTemplate,
      QCParameter,
      Inspection,
      InspectionResultEntity,
      NonConformance,
      CorrectiveAction,
      PreventiveAction,
      CAPA,
      QualityAlert,
      AuditPlan,
      AuditFindings,
      NCR,
      DefectCode,
      ReworkItem,
    ]),
    forwardRef(() => WorkflowModule),
  ],
  controllers: [
    QCTemplateController,
    QCParameterController,
    InspectionController,
    InspectionResultController,
    NonConformanceController,
    CorrectiveActionController,
    PreventiveActionController,
    CAPAController,
    QualityAlertController,
    AuditPlanController,
    AuditFindingsController,
    NCRController, // Added NCRController
    ReworkItemController,
  ],
  providers: [
    QCTemplateService,
    QCParameterService,
    InspectionService,
    InspectionResultService,
    NonConformanceService,
    CorrectiveActionService,
    PreventiveActionService,
    CAPAService,
    QualityAlertService,
    AuditPlanService,
    AuditFindingsService,
    CAPAManagementService,
    NCRService,
    ReworkItemService,
    // Seeders
    QCTemplateSeederService,
    QCParameterSeederService,
    DefectCodeSeederService,
  ],
  exports: [
    QCTemplateService,
    QCParameterService,
    InspectionService,
    InspectionResultService,
    NonConformanceService,
    CorrectiveActionService,
    PreventiveActionService,
    CAPAService,
    QualityAlertService,
    AuditPlanService,
    AuditFindingsService,
    CAPAManagementService,
    NCRService,
    ReworkItemService,
    // Seeders
    QCTemplateSeederService,
    QCParameterSeederService,
    DefectCodeSeederService,
  ],
})
export class QualityModule { }
