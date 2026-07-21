import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { MobileController } from './controllers/mobile-api.controller';
import { ProjectFinancialsController } from './controllers/project-financials.controller';
import { TASettlementController } from './controllers/ta-settlement.controller';
import { EmergencySparesController } from './controllers/emergency-spares.controller';
import { Project } from '../project/entities/project.entity';
import { ProjectTask } from './entities/project-task.entity';
import { ProjectResource } from './entities/project-resource.entity';
import { PmResourceRequest } from './entities/pm-resource-request.entity';
import { PmResourceSkill } from './entities/pm-resource-skill.entity';
import { ProjectBudget } from './entities/project-budget.entity';
import { ProjectMilestone } from './entities/project-milestone.entity';
import { ResourceCapacity } from './entities/resource-capacity.entity';
import { TimeLog } from './entities/time-log.entity';
import { ProjectStatusEntity } from './entities/project-status.entity';
import { ProjectTypeEntity } from './entities/project-type.entity';
import { ProjectSettingsEntity } from './entities/project-settings.entity';
import { ProjectTemplateEntity } from './entities/project-template.entity';
import { MilestoneTemplateEntity } from './entities/milestone-template.entity';
import { ChangeOrderEntity } from './entities/change-order.entity';
import { DeliverableEntity } from './entities/deliverable.entity';
import { ProjectIssueEntity } from './entities/project-issue.entity';
import { SiteIssueEntity } from './entities/site-issue.entity';
import { MaterialConsumptionEntity } from './entities/material-consumption.entity';
import { LaborEntryEntity } from './entities/labor-entry.entity';
import { ProjectCostEntity } from './entities/project-cost.entity';
import { CommissioningActivityEntity } from './entities/commissioning-activity.entity';
import { CustomerAcceptanceEntity } from './entities/customer-acceptance.entity';
import { ProjectProfitabilityEntity } from './entities/project-profitability.entity';
import { LayoutBriefingEntity } from './entities/layout-briefing.entity';
import { ProgressEntryEntity } from './entities/progress-entry.entity';
import { ProjectPlanEntity } from './entities/project-plan.entity';
import { PmProjectTypeEntity } from './entities/pm-project-type.entity';
import { PmDocumentEntity } from './entities/pm-document.entity';
import { PmMrpMaterialEntity } from './entities/pm-mrp-material.entity';
import { PmInstallationActivityEntity } from './entities/pm-installation-activity.entity';
import { PmQualityInspectionEntity } from './entities/pm-quality-inspection.entity';
import { PmResourceUtilizationEntity } from './entities/pm-resource-utilization.entity';
import { PmReportEntity } from './entities/pm-report.entity';
import { PmSiteSurveyEntity } from './entities/pm-site-survey.entity';
import { PmWbsNodeEntity } from './entities/pm-wbs-node.entity';
import { PmScheduleTaskEntity } from './entities/pm-schedule-task.entity';
import { PmDocumentApprovalEntity } from './entities/pm-document-approval.entity';
import { PmDesignerTaskEntity } from './entities/pm-designer-task.entity';
import { PmResourceAllocationEntity } from './entities/pm-resource-allocation.entity';
import { PmCrateEntity } from './entities/pm-crate.entity';
import { PmDesignAssetEntity } from './entities/pm-design-asset.entity';
import { PmMaterialStatusEntity } from './entities/pm-material-status.entity';
import { PmMachineStatusEntity } from './entities/pm-machine-status.entity';
import { PmBomItemEntity } from './entities/pm-bom-item.entity';
import { PmEquipmentCatalogEntity } from './entities/pm-equipment-catalog.entity';
import { PmDispatchCatalogEntity } from './entities/pm-dispatch-catalog.entity';
import { PmBoqLineTemplateEntity } from './entities/pm-boq-line-template.entity';
import { ProjectAttachment } from '../project/entities/project-attachment.entity';
import { BOQ } from '../project/entities/boq.entity';
import { BOQItem } from '../project/entities/boq-item.entity';
import { Item } from '../core/entities/item.entity';
import { DiscrepancyLog } from '../project/entities/discrepancy-log.entity';
import { SiteSurvey } from '../project/entities/site-survey.entity';
import { ExternalApproval } from '../project/entities/external-approval.entity';
import { BOMHeader } from './entities/bom-header.entity';
import { BOMDetail } from './entities/bom-detail.entity';
import { InventoryReservation } from './entities/inventory-reservation.entity';
import { PurchaseRequisition } from './entities/purchase-requisition.entity';
import { GRN } from './entities/grn.entity';
import { NestingAsset } from './entities/nesting-asset.entity';
import { ProductionLog } from './entities/production-log.entity';
import { TrialReport } from './entities/trial-report.entity';
import { QCRecord } from './entities/qc-record.entity';
import { PackagingCrate } from './entities/packaging-crate.entity';
import { PackagingItem } from './entities/packaging-item.entity';
import { DispatchRecord } from './entities/dispatch-record.entity';
import { SiteReadiness } from './entities/site-readiness.entity';
import { InstallationTask } from './entities/installation-task.entity';
import { HandoverCertificate } from './entities/handover-certificate.entity';
import { ToolDeployment } from './entities/tool-deployment.entity';
import { DailyInstallReport } from './entities/daily-install-report.entity';
import { InstallationTeamAssignment } from './entities/installation-team-assignment.entity';
import { HandoverChecklistStep } from './entities/handover-checklist-step.entity';
import { Invoice } from '../finance/entities/invoice.entity';
import { PurchaseOrder } from '../procurement/entities/purchase-order.entity';
import { GeneralLedger } from '../finance/entities/general-ledger.entity';

import { ProjectTasksService } from './services/project-tasks.service';
import { ProjectResourcesService } from './services/project-resources.service';
import { PmResourceRequestsService } from './services/pm-resource-requests.service';
import { PmResourceSkillsService } from './services/pm-resource-skills.service';
import { ProjectBudgetsService } from './services/project-budgets.service';
import { ProjectMilestonesService } from './services/project-milestones.service';
import { TimeLogsService } from './services/time-logs.service';
import { BOQService } from './services/boq.service';

import { ProjectFinancialsService } from './services/project-financials.service';
import { TASettlementService } from './services/ta-settlement.service';
import { EmergencySpareService } from './services/emergency-spare.service';
import { DesignVerificationService } from './services/design-verification.service';
import { TechnicalDesignService } from './services/technical-design.service';
import { ProcurementService } from './services/procurement.service';
import { ProductionService } from './services/production.service';
import { QCPackagingService } from './services/qc-packaging.service';
import { LogisticsInstallationService } from './services/logistics-installation.service';
import { ProjectClosureService } from './services/project-closure.service';
import { ProjectAttachmentService } from './services/project-attachment.service';
import { ToolManagementService } from './services/tool-management.service';
import { ProjectSettingsService } from './services/project-settings.service';
import { ProjectTemplatesService } from './services/project-templates.service';
import { MilestoneTemplatesService } from './services/milestone-templates.service';
import { PmAnalyticsService } from './services/pm-analytics.service';
import { ChangeOrdersService } from './services/change-orders.service';
import { DeliverablesService } from './services/deliverables.service';
import { ProjectIssuesService } from './services/project-issues.service';
import { SiteIssuesService } from './services/site-issues.service';
import { MaterialConsumptionService } from './services/material-consumption.service';
import { LaborTrackingService } from './services/labor-tracking.service';
import { ProjectCostingService } from './services/project-costing.service';
import { CommissioningService } from './services/commissioning.service';
import { CustomerAcceptanceService } from './services/customer-acceptance.service';
import { ProfitabilityService } from './services/profitability.service';
import { BriefingsService } from './services/briefings.service';
import { ProgressService } from './services/progress.service';
import { PmProjectTypesService } from './services/pm-project-types.service';
import { PmDocumentsService } from './services/pm-documents.service';
import { PmMrpService } from './services/pm-mrp.service';
import { PmInstallationTrackingService } from './services/pm-installation-tracking.service';
import { PmQualityInspectionsService } from './services/pm-quality-inspections.service';
import { PmResourceUtilizationService } from './services/pm-resource-utilization.service';
import { PmReportsService } from './services/pm-reports.service';
import { PmSiteSurveysService } from './services/pm-site-surveys.service';
import { PmWbsService } from './services/pm-wbs.service';
import { PmScheduleService } from './services/pm-schedule.service';
import { PmScopeService } from './services/pm-scope.service';
import { PmCharterService } from './services/pm-charter.service';
import { PmKanbanService } from './services/pm-kanban.service';
import { PmEarnedValueService } from './services/pm-earned-value.service';
import { PmScopeItemEntity } from './entities/pm-scope-item.entity';
import { PmCharterEntity } from './entities/pm-charter.entity';
import { PmKanbanCardEntity } from './entities/pm-kanban-card.entity';
import { PmEarnedValueEntity } from './entities/pm-earned-value.entity';
import { PmScopeController } from './controllers/pm-scope.controller';
import { PmCharterController } from './controllers/pm-charter.controller';
import { PmKanbanController } from './controllers/pm-kanban.controller';
import { PmEarnedValueController } from './controllers/pm-earned-value.controller';
import { ProjectPlansService } from './services/project-plans.service';
import { PmDocumentApprovalsService } from './services/pm-document-approvals.service';
import { PmDesignerTasksService } from './services/pm-designer-tasks.service';
import { PmResourceAllocationsService } from './services/pm-resource-allocations.service';
import { PmCratesService } from './services/pm-crates.service';
import { PmDesignAssetsService } from './services/pm-design-assets.service';
import { PmMaterialStatusService } from './services/pm-material-status.service';
import { PmMachineStatusService } from './services/pm-machine-status.service';
import { PmBomItemsService } from './services/pm-bom-items.service';
import { PmEquipmentCatalogService } from './services/pm-equipment-catalog.service';
import { PmDispatchCatalogService } from './services/pm-dispatch-catalog.service';
import { PmBoqLineTemplatesService } from './services/pm-boq-line-templates.service';

import { ProjectStatusSeederService } from './services/project-status-seeder.service';
import { ProjectTypeSeederService } from './services/project-type-seeder.service';
import { ProjectSeederService } from './services/project-seeder.service';
import {
    InvoiceSyncSubscriber,
    PurchaseOrderSyncSubscriber,
    TimeLogSyncSubscriber
} from './subscribers/project-finance-sync.subscriber';
import { ProjectFinanceSeederService } from './services/project-finance-seeder.service';

import { ProjectTasksController } from './controllers/project-tasks.controller';
import { ProjectResourcesController } from './controllers/project-resources.controller';
import { PmResourceRequestsController } from './controllers/pm-resource-requests.controller';
import { PmResourceSkillsController } from './controllers/pm-resource-skills.controller';
import { ProjectBudgetsController } from './controllers/project-budgets.controller';
import { ProjectMilestonesController } from './controllers/project-milestones.controller';
import { TimeLogsController } from './controllers/time-logs.controller';
import { BOQController } from './controllers/boq.controller';
import { DesignVerificationController } from './controllers/design-verification.controller';
import { TechnicalDesignController } from './controllers/technical-design.controller';
import { ProcurementController } from './controllers/procurement.controller';
import { ProductionController } from './controllers/production.controller';
import { QCPackagingController } from './controllers/qc-packaging.controller';
import { LogisticsInstallationController } from './controllers/logistics-installation.controller';
import { ProjectClosureController } from './controllers/project-closure.controller';
import { ProjectAttachmentController } from './controllers/project-attachment.controller';
import { ToolManagementController } from './controllers/tool-management.controller';
import { ProjectSettingsController } from './controllers/project-settings.controller';
import { ProjectTemplatesController } from './controllers/project-templates.controller';
import { MilestoneTemplatesController } from './controllers/milestone-templates.controller';
import { PmAnalyticsController } from './controllers/pm-analytics.controller';
import { ChangeOrdersController } from './controllers/change-orders.controller';
import { DeliverablesController } from './controllers/deliverables.controller';
import { ProjectIssuesController } from './controllers/project-issues.controller';
import { SiteIssuesController } from './controllers/site-issues.controller';
import { MaterialConsumptionController } from './controllers/material-consumption.controller';
import { LaborTrackingController } from './controllers/labor-tracking.controller';
import { ProjectCostingController } from './controllers/project-costing.controller';
import { CommissioningController } from './controllers/commissioning.controller';
import { CustomerAcceptanceController } from './controllers/customer-acceptance.controller';
import { ProfitabilityController } from './controllers/profitability.controller';
import { BriefingsController } from './controllers/briefings.controller';
import { ProgressController } from './controllers/progress.controller';
import { PmProjectTypesController } from './controllers/pm-project-types.controller';
import { PmDocumentsController } from './controllers/pm-documents.controller';
import { PmMrpController } from './controllers/pm-mrp.controller';
import { PmInstallationTrackingController } from './controllers/pm-installation-tracking.controller';
import { PmQualityInspectionsController } from './controllers/pm-quality-inspections.controller';
import { PmResourceUtilizationController } from './controllers/pm-resource-utilization.controller';
import { PmReportsController } from './controllers/pm-reports.controller';
import { PmSiteSurveysController } from './controllers/pm-site-surveys.controller';
import { PmWbsController } from './controllers/pm-wbs.controller';
import { PmScheduleController } from './controllers/pm-schedule.controller';
import { ProjectPlansController } from './controllers/project-plans.controller';
import { PmDocumentApprovalsController } from './controllers/pm-document-approvals.controller';
import { PmDesignerTasksController } from './controllers/pm-designer-tasks.controller';
import { PmResourceAllocationsController } from './controllers/pm-resource-allocations.controller';
import { PmCratesController } from './controllers/pm-crates.controller';
import { PmDesignAssetsController } from './controllers/pm-design-assets.controller';
import { PmMaterialStatusController } from './controllers/pm-material-status.controller';
import { PmMachineStatusController } from './controllers/pm-machine-status.controller';
import { PmBomItemsController } from './controllers/pm-bom-items.controller';
import { PmEquipmentCatalogController } from './controllers/pm-equipment-catalog.controller';
import { PmDispatchCatalogController } from './controllers/pm-dispatch-catalog.controller';
import { PmBoqLineTemplatesController } from './controllers/pm-boq-line-templates.controller';

// --- Projects Focus audit remediation: net-new Bucket B verticals ---
// (seeders populate DEMO-PROJECT demo rows on first boot after migrations run)
import { MepDrawingEntity } from './entities/mep-drawing.entity';
import { MepDrawingController } from './controllers/mep-drawing.controller';
import { MepDrawingService } from './services/mep-drawing.service';
import { MepDrawingSeederService } from './services/mep-drawing-seeder.service';
import { CabinetMarkingTask } from './entities/cabinet-marking-task.entity';
import { CabinetMarkingController } from './controllers/cabinet-marking.controller';
import { CabinetMarkingService } from './services/cabinet-marking.service';
import { CabinetMarkingSeederService } from './services/cabinet-marking-seeder.service';
import { PmVendorShipmentEntity } from './entities/pm-vendor-shipment.entity';
import { PmVendorShipmentController } from './controllers/pm-vendor-shipment.controller';
import { PmVendorShipmentService } from './services/pm-vendor-shipment.service';
import { VendorShipmentSeederService } from './services/vendor-shipment-seeder.service';
import { PackagingMaterialRequest } from './entities/packaging-material-request.entity';
import { PackagingMaterialRequestController } from './controllers/packaging-material-request.controller';
import { PackagingMaterialRequestService } from './services/packaging-material-request.service';
import { PackagingMaterialRequestSeederService } from './services/packaging-material-request-seeder.service';
import { PmProductionJobEntity } from './entities/pm-production-job.entity';
import { ProductionJobsController } from './controllers/production-jobs.controller';
import { ProductionJobsService } from './services/production-jobs.service';
import { ProductionJobSeederService } from './services/production-job-seeder.service';
import { DrawingVerification } from './entities/drawing-verification.entity';

@Module({
    imports: [TypeOrmModule.forFeature([
        Project,
        ProjectTask,
        ProjectResource,
        PmResourceRequest,
        PmResourceSkill,
        ProjectBudget,
        ProjectMilestone,
        ResourceCapacity,
        TimeLog,
        ProjectStatusEntity,
        ProjectTypeEntity,
        ProjectSettingsEntity,
        ProjectTemplateEntity,
        MilestoneTemplateEntity,
        ChangeOrderEntity,
        DeliverableEntity,
        ProjectIssueEntity,
        SiteIssueEntity,
        MaterialConsumptionEntity,
        LaborEntryEntity,
        ProjectCostEntity,
        CommissioningActivityEntity,
        CustomerAcceptanceEntity,
        ProjectProfitabilityEntity,
        LayoutBriefingEntity,
        ProgressEntryEntity,
        ProjectAttachment,
        BOQ,
        BOQItem,
        Item,
        DiscrepancyLog,
        SiteSurvey,
        ExternalApproval,
        BOMHeader,
        BOMDetail,
        InventoryReservation,
        PurchaseRequisition,
        GRN,
        NestingAsset,
        ProductionLog,
        TrialReport,
        QCRecord,
        PackagingCrate,
        PackagingItem,
        DispatchRecord,
        SiteReadiness,
        InstallationTask,
        HandoverCertificate,
        ToolDeployment,
        DailyInstallReport,
        InstallationTeamAssignment,
        HandoverChecklistStep,
        Invoice,
        PurchaseOrder,
        GeneralLedger,
        PmProjectTypeEntity,
        PmDocumentEntity,
        PmMrpMaterialEntity,
        PmInstallationActivityEntity,
        PmQualityInspectionEntity,
        PmResourceUtilizationEntity,
        PmReportEntity,
        PmSiteSurveyEntity,
        PmWbsNodeEntity,
        PmScheduleTaskEntity,
        PmDocumentApprovalEntity,
        PmDesignerTaskEntity,
        PmResourceAllocationEntity,
        PmCrateEntity,
        PmDesignAssetEntity,
        PmMaterialStatusEntity,
        PmMachineStatusEntity,
        PmBomItemEntity,
        PmEquipmentCatalogEntity,
        PmDispatchCatalogEntity,
        PmBoqLineTemplateEntity,
        ProjectPlanEntity,
        PmScopeItemEntity,
        PmCharterEntity,
        PmKanbanCardEntity,
        PmEarnedValueEntity,
        MepDrawingEntity,
        CabinetMarkingTask,
        PmVendorShipmentEntity,
        PackagingMaterialRequest,
        PmProductionJobEntity,
        DrawingVerification
    ])],
    controllers: [
        ProjectController,
        MobileController,
        ProjectFinancialsController,
        TASettlementController,
        EmergencySparesController,
        ProjectTasksController,
        ProjectResourcesController,
        PmResourceRequestsController,
        PmResourceSkillsController,
        ProjectBudgetsController,
        ProjectMilestonesController,
        TimeLogsController,
        BOQController,
        DesignVerificationController,
        TechnicalDesignController,
        ProcurementController,
        ProductionController,
        QCPackagingController,
        LogisticsInstallationController,
        ProjectClosureController,
        ProjectAttachmentController,
        ToolManagementController,
        ProjectSettingsController,
        ProjectTemplatesController,
        MilestoneTemplatesController,
        PmAnalyticsController,
        ChangeOrdersController,
        DeliverablesController,
        ProjectIssuesController,
        SiteIssuesController,
        MaterialConsumptionController,
        LaborTrackingController,
        ProjectCostingController,
        CommissioningController,
        CustomerAcceptanceController,
        ProfitabilityController,
        BriefingsController,
        ProgressController,
        PmProjectTypesController,
        PmDocumentsController,
        PmMrpController,
        PmInstallationTrackingController,
        PmQualityInspectionsController,
        PmResourceUtilizationController,
        PmReportsController,
        PmSiteSurveysController,
        PmWbsController,
        PmScheduleController,
        PmScopeController,
        PmCharterController,
        PmKanbanController,
        PmEarnedValueController,
        PmDocumentApprovalsController,
        PmDesignerTasksController,
        PmResourceAllocationsController,
        PmCratesController,
        PmDesignAssetsController,
        PmMaterialStatusController,
        PmMachineStatusController,
        PmBomItemsController,
        PmEquipmentCatalogController,
        PmDispatchCatalogController,
        PmBoqLineTemplatesController,
        ProjectPlansController,
        MepDrawingController,
        CabinetMarkingController,
        PmVendorShipmentController,
        PackagingMaterialRequestController,
        ProductionJobsController
    ],
    providers: [
        ProjectService,
        ProjectFinancialsService,
        TASettlementService,
        EmergencySpareService,
        ProjectTasksService,
        ProjectResourcesService,
        PmResourceRequestsService,
        PmResourceSkillsService,
        ProjectBudgetsService,
        ProjectMilestonesService,
        TimeLogsService,
        BOQService,
        DesignVerificationService,
        TechnicalDesignService,
        ProcurementService,
        ProductionService,
        QCPackagingService,
        LogisticsInstallationService,
        ProjectClosureService,
        ProjectAttachmentService,
        ToolManagementService,
        ProjectStatusSeederService,
        ProjectTypeSeederService,
        ProjectSeederService,
        InvoiceSyncSubscriber,
        PurchaseOrderSyncSubscriber,
        TimeLogSyncSubscriber,
        ProjectFinanceSeederService,
        ProjectSettingsService,
        ProjectTemplatesService,
        MilestoneTemplatesService,
        PmAnalyticsService,
        ChangeOrdersService,
        DeliverablesService,
        ProjectIssuesService,
        SiteIssuesService,
        MaterialConsumptionService,
        LaborTrackingService,
        ProjectCostingService,
        CommissioningService,
        CustomerAcceptanceService,
        ProfitabilityService,
        BriefingsService,
        ProgressService,
        PmProjectTypesService,
        PmDocumentsService,
        PmMrpService,
        PmInstallationTrackingService,
        PmQualityInspectionsService,
        PmResourceUtilizationService,
        PmReportsService,
        PmSiteSurveysService,
        PmWbsService,
        PmScheduleService,
        PmScopeService,
        PmCharterService,
        PmKanbanService,
        PmEarnedValueService,
        PmDocumentApprovalsService,
        PmDesignerTasksService,
        PmResourceAllocationsService,
        PmCratesService,
        PmDesignAssetsService,
        PmMaterialStatusService,
        PmMachineStatusService,
        PmBomItemsService,
        PmEquipmentCatalogService,
        PmDispatchCatalogService,
        PmBoqLineTemplatesService,
        ProjectPlansService,
        MepDrawingService,
        MepDrawingSeederService,
        CabinetMarkingService,
        CabinetMarkingSeederService,
        PmVendorShipmentService,
        VendorShipmentSeederService,
        PackagingMaterialRequestService,
        PackagingMaterialRequestSeederService,
        ProductionJobsService,
        ProductionJobSeederService
    ],
    exports: [
        ProjectService,
        ProjectFinancialsService,
        TASettlementService,
        EmergencySpareService,
        ProjectTasksService,
        ProjectResourcesService,
        ProjectBudgetsService,
        ProjectMilestonesService,
        ProjectMilestonesService,
        TimeLogsService,
        BOQService,
    ],
})
export class ProjectManagementModule { }
