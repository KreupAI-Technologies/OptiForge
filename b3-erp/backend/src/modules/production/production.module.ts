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
    ]),
    forwardRef(() => WorkflowModule),
  ],
  controllers: [
    DieToolAssetController, OperationTaskController, ProductionLineConfigController,
    RoutingTemplateController, ShiftDefinitionController, ShutterOrderController,
    TrialInstallationController,
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
