import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowModule } from '../workflow/workflow.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogger } from '../../common/logging/audit-logger.service';
import { NotificationsModule } from '../notifications/notifications.module';

// Entities
import {
  Warehouse,
  StockLocation,
  StockEntry,
  StockEntryLine,
  StockBalance,
  StockTransfer,
  StockTransferLine,
  StockAdjustment,
  StockAdjustmentLine,
  SerialNumber,
  BatchNumber,
  AdjustmentReason,
  CycleCountPlan,
  CycleCountItem,
  AutoReplenishmentConfig,
  ReorderRule,
  ReplenishmentRequest,
} from './entities';

// Controllers
import {
  WarehouseController,
  StockLocationController,
  StockEntryController,
  StockBalanceController,
  StockTransferController,
  StockAdjustmentController,
  SerialNumberController,
  BatchNumberController,
  ReorderManagementController,
  CycleCountController,
} from './controllers';

// Services
import {
  WarehouseService,
  StockLocationService,
  StockEntryService,
  StockBalanceService,
  StockTransferService,
  StockAdjustmentService,
  SerialNumberService,
  BatchNumberService,
  WarehouseSeederService,
  StockLocationSeederService,
  AdjustmentReasonSeederService,
  StockValuationService,
  InventoryAnalyticsService,
  CycleCountService,
} from './services';
import { ReorderManagementService } from './services/reorder-management.service';
import { AdjustmentReasonController } from './controllers/adjustment-reason.controller';
import { AdjustmentReasonService } from './services/adjustment-reason.service';
import { StorageLocationService as StorageLocationClassificationService } from './services/storage-location.service';
import { PutawayStrategyService } from './services/putaway-strategy.service';
import { VEDAnalysisService } from './services/ved-analysis.service';
import { InventoryAnalyticsController } from './controllers/inventory-analytics.controller';
import { InventoryPolicyController } from './controllers/inventory-policy.controller';
import { InventoryPolicyService } from './services/inventory-policy.service';
import { KittingController } from './controllers/kitting.controller';
import { KittingService } from './services/kitting.service';
import { ReplenishmentController } from './controllers/replenishment.controller';
import { ReplenishmentService } from './services/replenishment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Warehouse,
      StockEntry,
      StockEntryLine,
      StockBalance,
      StockLocation,
      StockTransfer,
      StockTransferLine,
      StockAdjustment,
      StockAdjustmentLine,
      SerialNumber,
      BatchNumber,
      AdjustmentReason,
      CycleCountPlan,
      CycleCountItem,
      AutoReplenishmentConfig,
      ReorderRule,
      ReplenishmentRequest,
    ]),
    forwardRef(() => WorkflowModule),
    PrismaModule,
    NotificationsModule,
  ],
  controllers: [
    WarehouseController,
    StockLocationController,
    StockEntryController,
    StockBalanceController,
    StockTransferController,
    AdjustmentReasonController,
    StockAdjustmentController,
    SerialNumberController,
    BatchNumberController,
    ReorderManagementController,
    CycleCountController,
    InventoryAnalyticsController,
    InventoryPolicyController,
    KittingController,
    ReplenishmentController,
  ],
  providers: [
    InventoryPolicyService,
    KittingService,
    WarehouseService,
    StockLocationService,
    StockEntryService,
    StockBalanceService,
    StockTransferService,
    StockAdjustmentService,
    SerialNumberService,
    BatchNumberService,
    ReorderManagementService,
    StorageLocationClassificationService,
    PutawayStrategyService,
    VEDAnalysisService,
    WarehouseSeederService,
    StockLocationSeederService,
    AdjustmentReasonSeederService,
    AdjustmentReasonService,
    StockValuationService,
    InventoryAnalyticsService,
    CycleCountService,
    ReplenishmentService,
    AuditLogger,
  ],
  exports: [
    WarehouseService,
    StockLocationService,
    StockEntryService,
    StockBalanceService,
    StockTransferService,
    StockAdjustmentService,
    SerialNumberService,
    BatchNumberService,
    ReorderManagementService,
    StorageLocationClassificationService,
    PutawayStrategyService,
    VEDAnalysisService,
    WarehouseSeederService,
    StockLocationSeederService,
    AdjustmentReasonSeederService,
    StockValuationService,
    InventoryAnalyticsService,
    CycleCountService,
  ],
})
export class InventoryModule { }
