import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EventBusService } from '../services/event-bus.service';
import { WorkflowEventType } from '../events/event-types';
import { RFPService } from '../../sales/rfp.service';
import { OrderService } from '../../sales/services/order.service';
import { RFPStatus } from '../../sales/entities/rfp.entity';
import { StockBalanceService } from '../../inventory/services/stock-balance.service';
import { WorkOrderService } from '../../production/services/work-order.service';
import { ProductionScheduleService } from '../../production/services/production-schedule.service';
import { WorkOrderStatus } from '../../production/entities/work-order.entity';
import { StockEntryService } from '../../inventory/services/stock-entry.service';
import { StockEntryType } from '../../inventory/entities/stock-entry.entity';
import { InspectionService } from '../../quality/services/inspection.service';
import { NCRService } from '../../quality/services/ncr.service';
import { InspectionStatus } from '../../quality/entities/inspection.entity';
import { NotificationService } from '../services/notification.service';

@Processor('workflow')
export class WorkflowProcessor {
  private readonly logger = new Logger(WorkflowProcessor.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly rfpService: RFPService,
    private readonly orderService: OrderService,
    private readonly stockBalanceService: StockBalanceService,
    private readonly workOrderService: WorkOrderService,
    private readonly productionScheduleService: ProductionScheduleService,
    private readonly stockEntryService: StockEntryService,
    private readonly inspectionService: InspectionService,
    private readonly ncrService: NCRService,
    private readonly notificationService: NotificationService,
  ) { }

  @Process('create-order-from-rfp')
  async createOrderFromRFP(job: Job): Promise<void> {
    const { rfpId, rfpNumber, customerId, customerName, userId } = job.data;
    this.logger.log(`Processing job: create-order-from-rfp for RFP ${rfpNumber}`);

    try {
      // 1. Fetch RFP to ensure it exists and is approved
      const rfp = this.rfpService.findOne(rfpId);
      if (!rfp) {
        throw new Error(`RFP ${rfpId} not found`);
      }

      if (rfp.status !== RFPStatus.APPROVED) {
        this.logger.warn(`RFP ${rfpNumber} is not approved (Status: ${rfp.status}). Skipping order creation.`);
        return;
      }

      // 2. Create Sales Order from RFP
      this.logger.log(`Creating sales order from RFP ${rfpNumber} for customer ${customerName}`);
      const order = await this.orderService.createFromRFP(rfpId, userId);

      // 3. Update RFP with the created Order ID (if the entity supported it, for now we just log)
      this.logger.log(`Successfully created Sales Order ${order.orderNumber} from RFP ${rfpNumber}`);

      // 4. Emit custom completion event if needed (OrderService already emits ORDER_CREATED_FROM_RFP)
    } catch (error) {
      this.logger.error(`Failed to create order from RFP ${rfpNumber}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('create-work-orders-from-order')
  async createWorkOrdersFromOrder(job: Job): Promise<void> {
    const { orderId, orderNumber, items, userId, customerId, customerName, deliveryDate, priority } = job.data;
    this.logger.log(`Processing job: create-work-orders-from-order for Order ${orderNumber}`);

    try {
      for (const item of items) {
        // Create a work order for each item in the sales order
        const workOrderDto = {
          workOrderNumber: `WO-${orderNumber}-${item.itemId || item.id}`,
          workOrderName: `Production of ${item.itemName}`,
          salesOrderId: orderId,
          salesOrderNumber: orderNumber,
          itemId: item.itemId || item.id,
          itemCode: item.itemCode || 'CODE',
          itemName: item.itemName,
          plannedQuantity: item.quantity,
          uom: item.unit || 'Nos',
          plannedStartDate: new Date(),
          plannedEndDate: deliveryDate ? new Date(deliveryDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: WorkOrderStatus.DRAFT,
          priority: priority || 'medium',
          customerId,
          customerName,
          createdBy: userId,
        };

        const wo = await this.workOrderService.create(workOrderDto as any);
        this.logger.log(`Work Order ${wo.workOrderNumber} created for Order ${orderNumber}`);
      }
    } catch (error) {
      this.logger.error(`Failed to create work orders for Order ${orderNumber}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('check-material-availability')
  async checkMaterialAvailability(job: Job): Promise<void> {
    const { orderId, orderNumber, items, userId } = job.data;
    this.logger.log(`Processing job: check-material-availability for Order ${orderNumber}`);

    try {
      const shortages = [];

      for (const item of items) {
        // In a real system, we'd look up the BOM to find raw materials
        // For now, we check the item itself or its components
        const balance = await this.stockBalanceService.getRealTimeBalance(item.itemId || item.id, 'WH-MAIN'); // Default warehouse

        if (balance.totalFree < item.quantity) {
          shortages.push({
            itemId: item.itemId || item.id,
            itemName: item.itemName,
            required: item.quantity,
            available: balance.totalFree,
            shortage: item.quantity - balance.totalFree,
          });
        }
      }

      if (shortages.length > 0) {
        this.logger.warn(`Material shortage detected for Order ${orderNumber}: ${JSON.stringify(shortages)}`);
        await this.eventBus.emitMaterialShortage({
          orderId,
          orderNumber,
          shortages,
          userId,
        } as any);
      } else {
        this.logger.log(`All materials available for Order ${orderNumber}`);
      }
    } catch (error) {
      this.logger.error(`Failed to check material availability: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('reserve-materials-for-work-order')
  async reserveMaterials(job: Job): Promise<void> {
    const { workOrderId, workOrderNumber, materials, userId } = job.data;
    this.logger.log(`Processing job: reserve-materials-for-work-order for WO ${workOrderNumber}`);

    try {
      const reservationResults = [];
      let allReserved = true;

      for (const mat of (materials || [])) {
        const result = await this.stockBalanceService.reserveStock(
          mat.itemId,
          mat.warehouseId || 'WH-MAIN',
          mat.quantity,
          userId
        );

        reservationResults.push({
          itemId: mat.itemId,
          quantity: mat.quantity,
          success: result.success,
          shortage: result.shortage,
        });

        if (!result.success) {
          allReserved = false;
        }
      }

      if (allReserved) {
        this.logger.log(`All materials reserved for WO ${workOrderNumber}`);
        await this.eventBus.emitStockReserved({
          workOrderId,
          workOrderNumber,
          userId,
          reservationId: `RES-${workOrderId}`,
          items: reservationResults,
        } as any);
      } else {
        this.logger.warn(`Partial reservation for WO ${workOrderNumber}`);
        await this.eventBus.emitReservationShortage({
          workOrderId,
          workOrderNumber,
          shortages: reservationResults.filter(r => !r.success),
          userId,
        } as any);
      }
    } catch (error) {
      this.logger.error(`Failed to reserve materials: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('issue-materials-for-work-order')
  async issueMaterials(job: Job): Promise<void> {
    const { workOrderId, workOrderNumber, materials, userId } = job.data;
    this.logger.log(`Processing job: issue-materials-for-work-order for WO ${workOrderNumber}`);

    try {
      // Create a Stock Entry for Material Issue
      const entry = await this.stockEntryService.create({
        entryType: StockEntryType.PRODUCTION_ISSUE,
        purpose: `Material issue for Work Order ${workOrderNumber}`,
        workOrderId,
        lines: (materials || []).map((mat: any) => ({
          itemId: mat.itemId,
          itemCode: mat.itemCode || 'CODE',
          itemName: mat.itemName || 'Material',
          quantity: mat.quantity,
          uom: mat.uom || 'Nos',
          fromLocationId: mat.warehouseId || 'WH-MAIN',
        })),
        createdBy: userId,
      } as any);

      await this.stockEntryService.submit(entry.id);
      await this.stockEntryService.post(entry.id);

      this.logger.log(`Materials issued for WO ${workOrderNumber} (Entry: ${entry.entryNumber})`);

      // Release reserved stock as it's now consumed
      for (const mat of (materials || [])) {
        await this.stockBalanceService.releaseStock(mat.itemId, mat.warehouseId || 'WH-MAIN', mat.quantity);
      }
    } catch (error) {
      this.logger.error(`Failed to issue materials for WO ${workOrderNumber}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('receive-finished-goods')
  async receiveFinishedGoods(job: Job): Promise<void> {
    const { workOrderId, workOrderNumber, itemId, itemName, quantity, userId } = job.data;
    this.logger.log(`Processing job: receive-finished-goods for WO ${workOrderNumber}`);

    try {
      // Create a Stock Entry for Production Receipt
      const entry = await this.stockEntryService.create({
        entryType: StockEntryType.PRODUCTION_RECEIPT,
        purpose: `Finished goods receipt for Work Order ${workOrderNumber}`,
        workOrderId,
        lines: [{
          itemId,
          itemCode: 'FG-CODE', // In reality, look up from item
          itemName,
          quantity,
          uom: 'Nos',
          toLocationId: 'WH-MAIN',
        }],
        createdBy: userId,
      } as any);

      await this.stockEntryService.submit(entry.id);
      await this.stockEntryService.post(entry.id);

      this.logger.log(`Finished goods received for WO ${workOrderNumber} (Entry: ${entry.entryNumber})`);
    } catch (error) {
      this.logger.error(`Failed to receive finished goods for WO ${workOrderNumber}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('handle-material-shortage')
  async handleMaterialShortage(job: Job): Promise<void> {
    const { orderId, orderNumber, shortages = [], userId } = job.data;
    this.logger.log(`Processing job: handle-material-shortage for Order ${orderNumber}`);

    try {
      const summary = (shortages as any[])
        .map((s) => `${s.itemName || s.itemId} (need ${s.required}, have ${s.available}, short ${s.shortage})`)
        .join('; ') || 'unspecified items';

      // Route the shortage to procurement so purchase requisitions can be raised,
      // and warn production planning that the order is blocked. This turns a
      // detected shortage into actionable work instead of a silent log line.
      await this.notificationService.notifyTeam('procurement', {
        title: `Material shortage blocking Order ${orderNumber}`,
        message: `Order ${orderNumber} cannot proceed until stock is replenished. Shortages: ${summary}. Please raise purchase requisitions.`,
        priority: 'high',
        data: { orderId, orderNumber, shortages, userId },
      });

      await this.notificationService.notifyTeam('production_planning', {
        title: `Order ${orderNumber} blocked by material shortage`,
        message: `Production for Order ${orderNumber} is on hold pending procurement of: ${summary}.`,
        priority: 'high',
        data: { orderId, orderNumber, shortages },
      });

      this.logger.log(`Material shortage for Order ${orderNumber} routed to procurement + production planning (${(shortages as any[]).length} item(s))`);
    } catch (error) {
      this.logger.error(`Failed to handle material shortage: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('schedule-production')
  async scheduleProduction(job: Job): Promise<void> {
    const { orderId, orderNumber, userId } = job.data;
    this.logger.log(`Processing job: schedule-production for Order ${orderNumber}`);

    try {
      // Create a production schedule entry
      const schedule = await this.productionScheduleService.create({
        scheduleNumber: `SCH-${orderNumber}`,
        name: `Schedule for Order ${orderNumber}`,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'draft' as any,
        createdBy: userId,
      } as any);

      this.logger.log(`Production schedule ${schedule.scheduleNumber} created for Order ${orderNumber}`);

      // Auto-publish for now
      await this.productionScheduleService.publish(schedule.id);
      this.logger.log(`Production schedule ${schedule.scheduleNumber} published`);
    } catch (error) {
      this.logger.error(`Failed to schedule production: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('start-production')
  async startProduction(job: Job): Promise<void> {
    const { workOrderId, workOrderNumber, userId } = job.data;
    this.logger.log(`Processing job: start-production for Work Order ${workOrderNumber}`);

    try {
      this.logger.log(`Starting production for Work Order ${workOrderNumber}`);

      // Update Work Order status to IN_PROGRESS
      await this.workOrderService.start(workOrderId, userId);

      this.logger.log(`Production started for Work Order ${workOrderNumber}`);
    } catch (error) {
      this.logger.error(`Failed to start production: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('complete-production')
  async completeProduction(job: Job): Promise<void> {
    const { workOrderId, workOrderNumber, userId } = job.data;
    this.logger.log(`Processing job: complete-production for Work Order ${workOrderNumber}`);

    try {
      this.logger.log(`Completing production for Work Order ${workOrderNumber}`);

      // Update Work Order status to COMPLETED
      await this.workOrderService.complete(workOrderId, userId);

      this.logger.log(`Production completed for Work Order ${workOrderNumber}`);
    } catch (error) {
      this.logger.error(`Failed to complete production: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('quality-inspection')
  async qualityInspection(job: Job): Promise<void> {
    const { workOrderId, workOrderNumber, itemId, itemName, userId } = job.data;
    this.logger.log(`Processing job: quality-inspection for Work Order ${workOrderNumber}`);

    try {
      this.logger.log(`Creating quality inspection for Work Order ${workOrderNumber}`);

      const inspection = await this.inspectionService.create({
        inspectionType: 'Production',
        referenceNumber: workOrderNumber,
        referenceType: 'WorkOrder',
        itemId,
        itemName,
        quantity: job.data.quantity || 1,
        status: InspectionStatus.SCHEDULED,
        priority: 'medium',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        createdBy: userId,
      } as any);

      this.logger.log(`Quality inspection ${inspection.inspectionNumber} created for Work Order ${workOrderNumber}`);
    } catch (error) {
      this.logger.error(`Failed to perform quality inspection: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('handle-inspection-failure')
  async handleInspectionFailure(job: Job): Promise<void> {
    const { inspectionId, inspectionNumber, reason, userId } = job.data;
    this.logger.log(`Processing job: handle-inspection-failure for Inspection ${inspectionNumber}`);

    try {
      this.logger.log(`Handling inspection failure for Inspection ${inspectionNumber}: ${reason}`);

      // Notify quality manager or production supervisor
      await this.eventBus.emitInspectionFailed({
        inspectionId,
        inspectionNumber,
        reason,
        userId,
      } as any);

      this.logger.log(`Inspection failure handled for Inspection ${inspectionNumber}`);
    } catch (error) {
      this.logger.error(`Failed to handle inspection failure: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('generate-ncr')
  async generateNCR(job: Job): Promise<void> {
    const { inspectionId, inspectionNumber, reason, userId } = job.data;
    this.logger.log(`Processing job: generate-ncr for Inspection ${inspectionNumber}`);

    try {
      this.logger.log(`Generating NCR for Inspection ${inspectionNumber}`);

      const ncr = await this.ncrService.create({
        ncrNumber: `NCR-${inspectionNumber}`,
        title: `Non-conformance for Inspection ${inspectionNumber}`,
        description: reason || 'Quality inspection failed',
        inspectionId,
        status: 'open',
        priority: 'high',
        createdBy: userId,
      } as any);

      this.logger.log(`NCR ${ncr.ncrNumber} generated for Inspection ${inspectionNumber}`);
    } catch (error) {
      this.logger.error(`Failed to generate NCR: ${error.message}`, error.stack);
      throw error;
    }
  }
}
