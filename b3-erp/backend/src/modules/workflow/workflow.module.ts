import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

// Entities
import { OrderTracking } from './entities/order-tracking.entity';
import { WorkflowDefinition } from './entities/workflow-definition.entity';
import { WorkflowInstance } from './entities/workflow-instance.entity';
import { WorkflowStep } from './entities/workflow-step.entity';
import { WorkflowHistory } from './entities/workflow-history.entity';
import { WorkflowNode } from './entities/workflow-node.entity';
import { WorkflowEdge } from './entities/workflow-edge.entity';
import { AutomationRule } from './entities/automation-rule.entity';
import { PendingApprovalItem } from './entities/pending-approval-item.entity';
import { WorkflowConfigTemplate } from './entities/workflow-config-template.entity';

// New workflow engine entities
import {
  ProjectPhase,
  PhaseTransition,
  WorkflowDocument,
  WorkflowApproval,
  ApprovalStep,
  QualityGate,
  QualityGateItem,
  Defect,
  WorkflowRule,
  NotificationTemplate,
  NotificationPreference,
} from './entities';

// Import other modules for processor dependencies
import { ProductionModule } from '../production/production.module';
import { InventoryModule } from '../inventory/inventory.module';
import { ProjectManagementModule } from '../project-management/project-management.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SalesModule } from '../sales/sales.module';
import { QualityModule } from '../quality/quality.module';

// Services
import {
  EventBusService,
  NotificationService,
  OrderTrackingService,
  SalesProductionWorkflowService,
  ProcurementInventoryWorkflowService,
  StateMachineService,
  RuleEngineService,
  DocumentService,
  ApprovalService,
  QualityGateService,
} from './services';
import { WorkflowRepositoryService } from './services/workflow-repository.service';
import { WorkflowSeederService } from './services/workflow-seeder.service';
import { EmailGatewayService } from './services/email-gateway.service';
import { ParallelApprovalService } from './services/parallel-approval.service';
import { IntelligentRoutingService } from './services/intelligent-routing.service';
import { WorkflowTemplateService } from './services/workflow-template.service';
import { SLAService } from './services/sla.service';
import { WorkflowAnalyticsService } from './services/workflow-analytics.service';
import { UserTaskService } from './services/user-task.service';
import { NotificationService as EnhancedNotificationService } from './services/notification-enhanced.service';

// Controllers
import { OrderTrackingController } from './controllers/order-tracking.controller';
import { WorkflowRepositoryController } from './controllers/workflow-repository.controller';
import { WorkflowController } from './controllers/workflow.controller';
import { PhaseManagementController } from './controllers/phase-management.controller';
import { DocumentController } from './controllers/document.controller';
import { ApprovalController } from './controllers/approval.controller';
import { NotificationController } from './controllers/notification.controller';
import { QualityGateController } from './controllers/quality-gate.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { WorkflowTemplateController } from './controllers/workflow-template.controller';
import { WorkflowAnalyticsController } from './controllers/workflow-analytics.controller';
import { UserTaskController } from './controllers/user-task.controller';
import { AutomationRuleController } from './controllers/automation-rule.controller';
import { PendingApprovalItemController } from './controllers/pending-approval-item.controller';
import { WorkflowConfigTemplateController } from './controllers/workflow-config-template.controller';
import { AutomationRuleService } from './services/automation-rule.service';
import { PendingApprovalItemService } from './services/pending-approval-item.service';
import { WorkflowConfigTemplateService } from './services/workflow-config-template.service';
import { AnalyticsService } from './services/analytics.service';
import { Project } from '../project/entities/project.entity';
import { ProjectService } from '../project-management/project.service';
import { ProjectController } from '../project-management/project.controller';
import { BOQ } from '../project/entities/boq.entity';
import { BOQItem } from '../project/entities/boq-item.entity';
import { BOQService } from '../project-management/services/boq.service';
import { BOQController } from '../project-management/controllers/boq.controller';

// Processors
// Processors
import { WorkflowProcessor, NotificationProcessor } from './processors';

// Listeners
import { WorkflowEventListener } from './listeners/workflow-event.listener';
import { WorkflowGateway } from './gateways/workflow.gateway';

@Module({
  imports: [
    // Event Emitter for event-driven architecture
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 20,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),

    ScheduleModule.forRoot(),

    // Database entities
    TypeOrmModule.forFeature([
      OrderTracking,
      WorkflowDefinition,
      WorkflowInstance,
      WorkflowStep,
      WorkflowHistory,
      // New workflow engine entities
      ProjectPhase,
      PhaseTransition,
      WorkflowDocument,
      WorkflowApproval,
      ApprovalStep,
      QualityGate,
      QualityGateItem,
      Defect,
      WorkflowRule,
      NotificationTemplate,
      NotificationPreference,
      Project,
      BOQ,
      BOQItem,
      WorkflowNode,
      WorkflowEdge,
      AutomationRule,
      PendingApprovalItem,
      WorkflowConfigTemplate,
    ]),

    // Bull queues for async job processing
    BullModule.registerQueue(
      {
        name: 'workflow',
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      },
      {
        name: 'notifications',
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      },
    ),

    // Import other modules with forwardRef to resolve circular dependencies
    forwardRef(() => ProductionModule),
    forwardRef(() => InventoryModule),
    forwardRef(() => QualityModule),
    ProjectManagementModule,
    NotificationsModule,
    forwardRef(() => SalesModule),
  ],
  controllers: [
    OrderTrackingController,
    WorkflowRepositoryController,
    WorkflowController,
    PhaseManagementController,
    DocumentController,
    ApprovalController,
    NotificationController,
    QualityGateController,
    AnalyticsController,
    WorkflowTemplateController,
    WorkflowAnalyticsController,
    UserTaskController,
    AutomationRuleController,
    PendingApprovalItemController,
    WorkflowConfigTemplateController,
  ],
  providers: [
    // Core services
    EventBusService,
    NotificationService,
    OrderTrackingService,
    WorkflowRepositoryService,
    WorkflowSeederService,

    // Workflow orchestration services
    SalesProductionWorkflowService,
    ProcurementInventoryWorkflowService,
    StateMachineService, // New state machine service
    RuleEngineService,
    DocumentService,
    ApprovalService,
    QualityGateService,
    AnalyticsService,

    // Queue processors
    WorkflowProcessor,
    NotificationProcessor,

    // Additional services
    EmailGatewayService,
    ParallelApprovalService,
    IntelligentRoutingService,
    WorkflowTemplateService,
    SLAService,
    WorkflowAnalyticsService,
    WorkflowEventListener,
    WorkflowGateway,
    UserTaskService,
    EnhancedNotificationService,
    AutomationRuleService,
    PendingApprovalItemService,
    WorkflowConfigTemplateService,
  ],
  exports: [
    EventBusService,
    NotificationService,
    OrderTrackingService,
    WorkflowRepositoryService,
    SalesProductionWorkflowService,
    ProcurementInventoryWorkflowService,
    StateMachineService,
    EmailGatewayService,
    ParallelApprovalService,
    IntelligentRoutingService,
    WorkflowTemplateService,
    SLAService,
    WorkflowAnalyticsService,
  ],
})
export class WorkflowModule { }

