import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowModule } from '../workflow/workflow.module';

// Orphan-endpoint build (settings/list features) — direct imports
import { DieToolAsset } from './entities/die-tool-asset.entity';
import { OperationTask } from './entities/operation-task.entity';
import { ProductionLineConfig } from './entities/production-line-config.entity';
import { RoutingTemplate } from './entities/routing-template.entity';
import { ShiftDefinition } from './entities/shift-definition.entity';
import { ShutterOrder } from './entities/shutter-order.entity';
import { TrialInstallation } from './entities/trial-installation.entity';
import { DieToolAssetController } from './controllers/die-tool-asset.controller';
import { OperationTaskController } from './controllers/operation-task.controller';
import { ProductionLineConfigController } from './controllers/production-line-config.controller';
import { RoutingTemplateController } from './controllers/routing-template.controller';
import { ShiftDefinitionController } from './controllers/shift-definition.controller';
import { ShutterOrderController } from './controllers/shutter-order.controller';
import { TrialInstallationController } from './controllers/trial-installation.controller';
import { DieToolAssetService } from './services/die-tool-asset.service';
import { OperationTaskService } from './services/operation-task.service';
import { ProductionLineConfigService } from './services/production-line-config.service';
import { RoutingTemplateService } from './services/routing-template.service';
import { ShiftDefinitionService } from './services/shift-definition.service';
import { ShutterOrderService } from './services/shutter-order.service';
import { TrialInstallationService } from './services/trial-installation.service';

// Follow-up orphan build (maintenance/quality list features) — direct imports
import { SparePart } from './entities/spare-part.entity';
import { PreventiveMaintenance } from './entities/preventive-maintenance.entity';
import { MaintenanceRequest } from './entities/maintenance-request.entity';
import { Ncr } from './entities/ncr.entity';
import { QualityPlan } from './entities/quality-plan.entity';
import { SparePartController } from './controllers/spare-part.controller';
import { PreventiveMaintenanceController } from './controllers/preventive-maintenance.controller';
import { MaintenanceRequestController } from './controllers/maintenance-request.controller';
import { NcrController } from './controllers/ncr.controller';
import { QualityPlanController } from './controllers/quality-plan.controller';
import { SparePartService } from './services/spare-part.service';
import { PreventiveMaintenanceService } from './services/preventive-maintenance.service';
import { MaintenanceRequestService } from './services/maintenance-request.service';
import { NcrService } from './services/ncr.service';
import { QualityPlanService } from './services/quality-plan.service';

// Newly-built components (floor activity / bom verification / gantt / machine timeline / andon) — direct imports
import { FloorActivity } from './entities/floor-activity.entity';
import { BomVerification } from './entities/bom-verification.entity';
import { GanttTask } from './entities/gantt-task.entity';
import { MachineTimeline } from './entities/machine-timeline.entity';
import { AndonLine } from './entities/andon-line.entity';
import { FloorActivityController } from './controllers/floor-activity.controller';
import { BomVerificationController } from './controllers/bom-verification.controller';
import { GanttTaskController } from './controllers/gantt-task.controller';
import { MachineTimelineController } from './controllers/machine-timeline.controller';
import { AndonLineController } from './controllers/andon-line.controller';
import { FloorActivityService } from './services/floor-activity.service';
import { BomVerificationService } from './services/bom-verification.service';
import { GanttTaskService } from './services/gantt-task.service';
import { MachineTimelineService } from './services/machine-timeline.service';
import { AndonLineService } from './services/andon-line.service';

// Entities
import {
  BOM,
  BOMItem,
  WorkOrder,
  WorkOrderItem,
  ProductionPlan,
  ShopFloorControl,
  Operation,
  WorkCenter,
  Routing,
  ProductionEntry,
  MachineMaintenanceLog,
  // Production Planning Entities
  CapacityPlan,
  DemandPlan,
  AggregatePlan,
  MasterSchedule,
  // MRP Entities
  MRPRun,
  PlannedOrder,
  MaterialRequirement,
  ShortageRecord,
  // Production Scheduling Entities
  ProductionSchedule,
  ResourceAllocation,
  JobSequence,
  // Downtime Entities
  DowntimeRecord,
  RootCauseAnalysis,
  // Production Analytics Entities
  OEERecord,
  ProductivityMetric,
  // Production Settings Entities
  ProductionLine,
  Shift,
  ShiftAssignment,
  // Industry 4.0 Entities
  DigitalTwin,
  EquipmentHealth,
  SimulationScenario,
  AssetTracker,
  // Smart AI Entities
  AIInsight,
  AnomalyRecord,
  QualityForecast,
  // Automation Entities
  AutomationWorkflow,
  MESIntegration,
  SystemHealthCheck,
  // Human-Centric Entities
  OperatorWorkstation,
  SkillMatrix,
  WorkloadAssignment,
  ErgonomicAlert,
  // Sustainability Entities
  CarbonFootprint,
  EnergyConsumption,
  WasteRecord,
  WaterUsage,
  ESGScore,
  GreenSupplier,
  // Resilience & Flexibility Entities
  SupplyChainRisk,
  ScenarioPlanning,
  CapacityFlexibility,
  BusinessContinuity,
  // Collaboration Entities
  TeamActivity,
  TeamMessage,
  ShiftHandoff,
  CustomerPortalAccess,
} from './entities';
import { WorkOrderStatusEntity } from './entities/work-order-status.entity';

// Services
import {
  BOMService,
  WorkOrderService,
  ProductionPlanService,
  ShopFloorControlService,
  OperationService,
  WorkCenterService,
  RoutingService,
  ProductionEntryService,
  WorkCenterSeederService,
  OperationSeederService,
  MaintenanceLogService,
  // Production Planning Services
  CapacityPlanService,
  DemandPlanService,
  AggregatePlanService,
  MasterScheduleService,
  // MRP Services
  MRPRunService,
  PlannedOrderService,
  MaterialRequirementService,
  ShortageRecordService,
  // Production Scheduling Services
  ProductionScheduleService,
  ResourceAllocationService,
  JobSequenceService,
  // Downtime Services
  DowntimeRecordService,
  RootCauseAnalysisService,
  // Production Analytics Services
  OEERecordService,
  ProductivityMetricService,
  // Production Settings Services
  ProductionLineService,
  ShiftService,
  ShiftAssignmentService,
  // Industry 4.0 Services
  DigitalTwinService,
  EquipmentHealthService,
  SimulationScenarioService,
  AssetTrackerService,
  // Smart AI Services
  AIInsightService,
  AnomalyRecordService,
  QualityForecastService,
  // Automation Services
  AutomationWorkflowService,
  MESIntegrationService,
  SystemHealthCheckService,
  // Human-Centric Services
  OperatorWorkstationService,
  SkillMatrixService,
  WorkloadAssignmentService,
  ErgonomicAlertService,
  // Sustainability Services
  CarbonFootprintService,
  EnergyConsumptionService,
  WasteRecordService,
  WaterUsageService,
  ESGScoreService,
  GreenSupplierService,
  // Resilience & Flexibility Services
  SupplyChainRiskService,
  ScenarioPlanningService,
  CapacityFlexibilityService,
  BusinessContinuityService,
  // Collaboration Services
  TeamActivityService,
  TeamMessageService,
  ShiftHandoffService,
  CustomerPortalAccessService,
} from './services';
import { WorkOrderStatusSeederService } from './services/work-order-status-seeder.service';
import { EscalationManagementService } from './services/escalation-management.service';
import { MRPRequisitionService } from './services/mrp-requisition.service';
import { DemandForecastingService } from './services/demand-forecasting.service';
import { DiesToolsService } from './services/dies-tools.service';

// Controllers
import {
  BOMController,
  WorkOrderController,
  ProductionPlanController,
  ShopFloorControlController,
  OperationController,
  WorkCenterController,
  RoutingController,
  ProductionEntryController,
  MaintenanceLogController,
  DiesToolsController,
  // Production Planning Controllers
  CapacityPlanController,
  DemandPlanController,
  AggregatePlanController,
  MasterScheduleController,
  // MRP Controllers
  MRPRunController,
  PlannedOrderController,
  MaterialRequirementController,
  ShortageRecordController,
  // Production Scheduling Controllers
  ProductionScheduleController,
  ResourceAllocationController,
  JobSequenceController,
  // Downtime Controllers
  DowntimeRecordController,
  RootCauseAnalysisController,
  // Production Analytics Controllers
  OEERecordController,
  ProductivityMetricController,
  // Production Settings Controllers
  ProductionLineController,
  ShiftController,
  ShiftAssignmentController,
  // Industry 4.0 Controllers
  DigitalTwinController,
  EquipmentHealthController,
  SimulationScenarioController,
  AssetTrackerController,
  // Smart AI Controllers
  AIInsightController,
  AnomalyRecordController,
  QualityForecastController,
  // Automation Controllers
  AutomationWorkflowController,
  MESIntegrationController,
  SystemHealthCheckController,
  // Human-Centric Controllers
  OperatorWorkstationController,
  SkillMatrixController,
  WorkloadAssignmentController,
  ErgonomicAlertController,
  // Sustainability Controllers
  CarbonFootprintController,
  EnergyConsumptionController,
  WasteRecordController,
  WaterUsageController,
  ESGScoreController,
  GreenSupplierController,
  // Resilience & Flexibility Controllers
  SupplyChainRiskController,
  ScenarioPlanningController,
  CapacityFlexibilityController,
  BusinessContinuityController,
  // Collaboration Controllers
  TeamActivityController,
  TeamMessageController,
  ShiftHandoffController,
  CustomerPortalAccessController,
} from './controllers';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DieToolAsset, OperationTask, ProductionLineConfig, RoutingTemplate,
      ShiftDefinition, ShutterOrder, TrialInstallation,
      // Main entities
      BOM,
      BOMItem,
      WorkOrder,
      WorkOrderItem,
      ProductionPlan,
      ShopFloorControl,
      Operation,
      WorkCenter,
      Routing,
      ProductionEntry,
      WorkOrderStatusEntity,
      MachineMaintenanceLog,
      // Production Planning Entities
      CapacityPlan,
      DemandPlan,
      AggregatePlan,
      MasterSchedule,
      // MRP Entities
      MRPRun,
      PlannedOrder,
      MaterialRequirement,
      ShortageRecord,
      // Production Scheduling Entities
      ProductionSchedule,
      ResourceAllocation,
      JobSequence,
      // Downtime Entities
      DowntimeRecord,
      RootCauseAnalysis,
      // Production Analytics Entities
      OEERecord,
      ProductivityMetric,
      // Production Settings Entities
      ProductionLine,
      Shift,
      ShiftAssignment,
      // Industry 4.0 Entities
      DigitalTwin,
      EquipmentHealth,
      SimulationScenario,
      AssetTracker,
      // Smart AI Entities
      AIInsight,
      AnomalyRecord,
      QualityForecast,
      // Automation Entities
      AutomationWorkflow,
      MESIntegration,
      SystemHealthCheck,
      // Human-Centric Entities
      OperatorWorkstation,
      SkillMatrix,
      WorkloadAssignment,
      ErgonomicAlert,
      // Sustainability Entities
      CarbonFootprint,
      EnergyConsumption,
      WasteRecord,
      WaterUsage,
      ESGScore,
      GreenSupplier,
      // Resilience & Flexibility Entities
      SupplyChainRisk,
      ScenarioPlanning,
      CapacityFlexibility,
      BusinessContinuity,
      // Collaboration Entities
      TeamActivity,
      TeamMessage,
      ShiftHandoff,
      CustomerPortalAccess,
      // Follow-up orphan entities
      SparePart,
      PreventiveMaintenance,
      MaintenanceRequest,
      Ncr,
      QualityPlan,
      // Newly-built entities
      FloorActivity,
      BomVerification,
      GanttTask,
      MachineTimeline,
      AndonLine,
    ]),
    forwardRef(() => WorkflowModule),
  ],
  controllers: [
    DieToolAssetController, OperationTaskController, ProductionLineConfigController,
    RoutingTemplateController, ShiftDefinitionController, ShutterOrderController,
    TrialInstallationController,
    // Follow-up orphan controllers
    SparePartController, PreventiveMaintenanceController, MaintenanceRequestController,
    NcrController, QualityPlanController,
    // Newly-built controllers
    FloorActivityController, BomVerificationController, GanttTaskController,
    MachineTimelineController, AndonLineController,
    // Core Controllers
    BOMController,
    WorkOrderController,
    ProductionPlanController,
    ShopFloorControlController,
    OperationController,
    WorkCenterController,
    RoutingController,
    ProductionEntryController,
    MaintenanceLogController,
    DiesToolsController,
    // Production Planning Controllers
    CapacityPlanController,
    DemandPlanController,
    AggregatePlanController,
    MasterScheduleController,
    // MRP Controllers
    MRPRunController,
    PlannedOrderController,
    MaterialRequirementController,
    ShortageRecordController,
    // Production Scheduling Controllers
    ProductionScheduleController,
    ResourceAllocationController,
    JobSequenceController,
    // Downtime Controllers
    DowntimeRecordController,
    RootCauseAnalysisController,
    // Production Analytics Controllers
    OEERecordController,
    ProductivityMetricController,
    // Production Settings Controllers
    ProductionLineController,
    ShiftController,
    ShiftAssignmentController,
    // Industry 4.0 Controllers
    DigitalTwinController,
    EquipmentHealthController,
    SimulationScenarioController,
    AssetTrackerController,
    // Smart AI Controllers
    AIInsightController,
    AnomalyRecordController,
    QualityForecastController,
    // Automation Controllers
    AutomationWorkflowController,
    MESIntegrationController,
    SystemHealthCheckController,
    // Human-Centric Controllers
    OperatorWorkstationController,
    SkillMatrixController,
    WorkloadAssignmentController,
    ErgonomicAlertController,
    // Sustainability Controllers
    CarbonFootprintController,
    EnergyConsumptionController,
    WasteRecordController,
    WaterUsageController,
    ESGScoreController,
    GreenSupplierController,
    // Resilience & Flexibility Controllers
    SupplyChainRiskController,
    ScenarioPlanningController,
    CapacityFlexibilityController,
    BusinessContinuityController,
    // Collaboration Controllers
    TeamActivityController,
    TeamMessageController,
    ShiftHandoffController,
    CustomerPortalAccessController,
  ],
  providers: [
    DieToolAssetService, OperationTaskService, ProductionLineConfigService,
    RoutingTemplateService, ShiftDefinitionService, ShutterOrderService,
    TrialInstallationService,
    // Follow-up orphan services
    SparePartService, PreventiveMaintenanceService, MaintenanceRequestService,
    NcrService, QualityPlanService,
    // Newly-built services
    FloorActivityService, BomVerificationService, GanttTaskService,
    MachineTimelineService, AndonLineService,
    // Core Services
    BOMService,
    WorkOrderService,
    ProductionPlanService,
    ShopFloorControlService,
    OperationService,
    WorkCenterService,
    RoutingService,
    ProductionEntryService,
    EscalationManagementService,
    MRPRequisitionService,
    DemandForecastingService,
    DiesToolsService,
    WorkCenterSeederService,
    OperationSeederService,
    WorkOrderStatusSeederService,
    MaintenanceLogService,
    // Production Planning Services
    CapacityPlanService,
    DemandPlanService,
    AggregatePlanService,
    MasterScheduleService,
    // MRP Services
    MRPRunService,
    PlannedOrderService,
    MaterialRequirementService,
    ShortageRecordService,
    // Production Scheduling Services
    ProductionScheduleService,
    ResourceAllocationService,
    JobSequenceService,
    // Downtime Services
    DowntimeRecordService,
    RootCauseAnalysisService,
    // Production Analytics Services
    OEERecordService,
    ProductivityMetricService,
    // Production Settings Services
    ProductionLineService,
    ShiftService,
    ShiftAssignmentService,
    // Industry 4.0 Services
    DigitalTwinService,
    EquipmentHealthService,
    SimulationScenarioService,
    AssetTrackerService,
    // Smart AI Services
    AIInsightService,
    AnomalyRecordService,
    QualityForecastService,
    // Automation Services
    AutomationWorkflowService,
    MESIntegrationService,
    SystemHealthCheckService,
    // Human-Centric Services
    OperatorWorkstationService,
    SkillMatrixService,
    WorkloadAssignmentService,
    ErgonomicAlertService,
    // Sustainability Services
    CarbonFootprintService,
    EnergyConsumptionService,
    WasteRecordService,
    WaterUsageService,
    ESGScoreService,
    GreenSupplierService,
    // Resilience & Flexibility Services
    SupplyChainRiskService,
    ScenarioPlanningService,
    CapacityFlexibilityService,
    BusinessContinuityService,
    // Collaboration Services
    TeamActivityService,
    TeamMessageService,
    ShiftHandoffService,
    CustomerPortalAccessService,
  ],
  exports: [
    // Core Services
    BOMService,
    WorkOrderService,
    ProductionPlanService,
    ShopFloorControlService,
    OperationService,
    WorkCenterService,
    RoutingService,
    ProductionEntryService,
    EscalationManagementService,
    MRPRequisitionService,
    DemandForecastingService,
    DiesToolsService,
    MaintenanceLogService,
    // Production Planning Services
    CapacityPlanService,
    DemandPlanService,
    AggregatePlanService,
    MasterScheduleService,
    // MRP Services
    MRPRunService,
    PlannedOrderService,
    MaterialRequirementService,
    ShortageRecordService,
    // Production Scheduling Services
    ProductionScheduleService,
    ResourceAllocationService,
    JobSequenceService,
    // Downtime Services
    DowntimeRecordService,
    RootCauseAnalysisService,
    // Production Analytics Services
    OEERecordService,
    ProductivityMetricService,
    // Production Settings Services
    ProductionLineService,
    ShiftService,
    ShiftAssignmentService,
    // Industry 4.0 Services
    DigitalTwinService,
    EquipmentHealthService,
    SimulationScenarioService,
    AssetTrackerService,
    // Smart AI Services
    AIInsightService,
    AnomalyRecordService,
    QualityForecastService,
    // Automation Services
    AutomationWorkflowService,
    MESIntegrationService,
    SystemHealthCheckService,
    // Human-Centric Services
    OperatorWorkstationService,
    SkillMatrixService,
    WorkloadAssignmentService,
    ErgonomicAlertService,
    // Sustainability Services
    CarbonFootprintService,
    EnergyConsumptionService,
    WasteRecordService,
    WaterUsageService,
    ESGScoreService,
    GreenSupplierService,
    // Resilience & Flexibility Services
    SupplyChainRiskService,
    ScenarioPlanningService,
    CapacityFlexibilityService,
    BusinessContinuityService,
    // Collaboration Services
    TeamActivityService,
    TeamMessageService,
    ShiftHandoffService,
    CustomerPortalAccessService,
  ],
})
export class ProductionModule { }
