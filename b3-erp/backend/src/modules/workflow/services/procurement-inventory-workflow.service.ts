import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  WorkflowEventType,
  StockEventPayload,
  PurchaseOrderEventPayload,
  GoodsReceiptEventPayload,
  InspectionEventPayload,
} from '../events/event-types';
import { EventBusService } from './event-bus.service';
import { NotificationService } from './notification.service';

@Injectable()
export class ProcurementInventoryWorkflowService {
  private readonly logger = new Logger(ProcurementInventoryWorkflowService.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly notificationService: NotificationService,
    @InjectQueue('workflow') private readonly workflowQueue: Queue,
  ) {}

  /**
   * When stock is low, automatically create purchase requests
   */
  @OnEvent(WorkflowEventType.STOCK_LOW)
  async handleStockLow(payload: StockEventPayload): Promise<void> {
    this.logger.log(`Handling stock low: ${payload.itemCode} - ${payload.itemName}`);

    try {
      // Queue job to create purchase request based on reorder policy
      await this.workflowQueue.add('create-purchase-request-for-reorder', {
        itemId: payload.itemId,
        itemCode: payload.itemCode,
        itemName: payload.itemName,
        warehouseId: payload.warehouseId,
        warehouseName: payload.warehouseName,
        currentStock: payload.currentStock,
        reorderLevel: payload.reorderLevel,
        userId: payload.userId,
      });

      // Notify procurement team
      await this.notificationService.notifyTeam('procurement', {
        title: 'Low Stock Alert',
        message: `${payload.itemName} (${payload.itemCode}) is below reorder level at ${payload.warehouseName}. Current: ${payload.currentStock}, Reorder Level: ${payload.reorderLevel}`,
        priority: 'high',
        data: { itemId: payload.itemId, warehouseId: payload.warehouseId },
      });

      // Notify warehouse team
      await this.notificationService.notifyTeam('warehouse', {
        title: 'Stock Low Warning',
        message: `${payload.itemName} stock is low at ${payload.warehouseName}. Purchase request being created.`,
        priority: 'normal',
        data: { itemId: payload.itemId },
      });
    } catch (error) {
      this.logger.error(`Failed to handle stock low: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * When stock is out, escalate and notify production
   */
  @OnEvent(WorkflowEventType.STOCK_OUT)
  async handleStockOut(payload: StockEventPayload): Promise<void> {
    this.logger.log(`Handling stock out: ${payload.itemCode} - ${payload.itemName}`);

    try {
      // Queue job to check affected work orders
      await this.workflowQueue.add('check-affected-work-orders', {
        itemId: payload.itemId,
        itemCode: payload.itemCode,
        itemName: payload.itemName,
        warehouseId: payload.warehouseId,
        userId: payload.userId,
      });

      // Queue job to expedite any pending POs
      await this.workflowQueue.add('expedite-pending-purchase-orders', {
        itemId: payload.itemId,
        itemCode: payload.itemCode,
        userId: payload.userId,
      });

      // Notify all relevant teams with high priority
      await this.notificationService.notifyTeam('procurement', {
        title: 'URGENT: Stock Out',
        message: `${payload.itemName} (${payload.itemCode}) is OUT OF STOCK at ${payload.warehouseName}. Immediate action required.`,
        priority: 'urgent',
        data: { itemId: payload.itemId, warehouseId: payload.warehouseId },
      });

      await this.notificationService.notifyTeam('production_planning', {
        title: 'URGENT: Material Stock Out',
        message: `${payload.itemName} is out of stock. Production may be affected.`,
        priority: 'urgent',
        data: { itemId: payload.itemId },
      });

      await this.notificationService.notifyTeam('management', {
        title: 'Stock Out Alert',
        message: `Critical: ${payload.itemName} (${payload.itemCode}) is out of stock at ${payload.warehouseName}.`,
        priority: 'high',
        data: { itemId: payload.itemId },
      });
    } catch (error) {
      this.logger.error(`Failed to handle stock out: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * When a material shortage is detected against an order (by the
   * check-material-availability job), route it to the handle-material-shortage
   * job so procurement and production planning are notified. Without this
   * listener the MATERIAL_SHORTAGE event was a dead end.
   */
  @OnEvent(WorkflowEventType.MATERIAL_SHORTAGE)
  async handleMaterialShortageEvent(payload: StockEventPayload): Promise<void> {
    const p = payload as any;
    this.logger.log(`Handling material shortage event for Order ${p.orderNumber ?? '(unknown)'}`);
    await this.workflowQueue.add('handle-material-shortage', {
      orderId: p.orderId,
      orderNumber: p.orderNumber,
      shortages: p.shortages ?? [],
      userId: payload.userId,
    });
  }

  /**
   * When a purchase order is created, notify vendor and track delivery
   */
  @OnEvent(WorkflowEventType.PURCHASE_ORDER_CREATED)
  async handlePurchaseOrderCreated(payload: PurchaseOrderEventPayload): Promise<void> {
    this.logger.log(`Handling purchase order created: ${payload.poNumber}`);

    try {
      // Queue job to send PO to vendor
      await this.workflowQueue.add('send-purchase-order-to-vendor', {
        purchaseOrderId: payload.purchaseOrderId,
        poNumber: payload.poNumber,
        vendorId: payload.vendorId,
        vendorName: payload.vendorName,
        items: payload.items,
        expectedDeliveryDate: payload.expectedDeliveryDate,
        userId: payload.userId,
      });

      // Queue job to schedule delivery tracking reminders
      await this.workflowQueue.add('schedule-po-delivery-tracking', {
        purchaseOrderId: payload.purchaseOrderId,
        poNumber: payload.poNumber,
        expectedDeliveryDate: payload.expectedDeliveryDate,
        userId: payload.userId,
      });

      // Notify warehouse team about incoming delivery
      await this.notificationService.notifyTeam('warehouse', {
        title: 'Incoming Purchase Order',
        message: `PO ${payload.poNumber} placed with ${payload.vendorName}. Expected delivery: ${payload.expectedDeliveryDate}`,
        priority: 'normal',
        data: { purchaseOrderId: payload.purchaseOrderId },
      });

      // Notify finance for payment planning
      await this.notificationService.notifyTeam('finance', {
        title: 'New Purchase Order',
        message: `PO ${payload.poNumber} created for ${payload.vendorName}. Amount: ${payload.totalAmount}`,
        priority: 'normal',
        data: { purchaseOrderId: payload.purchaseOrderId },
      });
    } catch (error) {
      this.logger.error(`Failed to handle purchase order created: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * When goods are received, update inventory and trigger inspection if required
   */
  @OnEvent(WorkflowEventType.GOODS_RECEIVED)
  async handleGoodsReceived(payload: GoodsReceiptEventPayload): Promise<void> {
    this.logger.log(`Handling goods received: ${payload.receiptNumber}`);

    try {
      // Queue jobs for each received item
      for (const item of payload.items) {
        // Queue job to update inventory
        await this.workflowQueue.add('update-inventory-from-receipt', {
          receiptId: payload.receiptId,
          receiptNumber: payload.receiptNumber,
          purchaseOrderId: payload.purchaseOrderId,
          itemId: item.itemId,
          itemName: item.itemName,
          receivedQty: item.receivedQty,
          warehouseId: payload.warehouseId,
          batchNumber: item.batchNumber,
          userId: payload.userId,
        });

        // If inspection required, create inspection request
        if (item.inspectionRequired) {
          await this.workflowQueue.add('create-goods-receipt-inspection', {
            receiptId: payload.receiptId,
            receiptNumber: payload.receiptNumber,
            itemId: item.itemId,
            itemName: item.itemName,
            quantity: item.receivedQty,
            batchNumber: item.batchNumber,
            userId: payload.userId,
          });
        }
      }

      // Queue job to check PO completion
      await this.workflowQueue.add('check-purchase-order-completion', {
        purchaseOrderId: payload.purchaseOrderId,
        poNumber: payload.poNumber,
        receiptId: payload.receiptId,
        userId: payload.userId,
      });

      // Queue job to release any material reservations waiting for this stock
      await this.workflowQueue.add('release-waiting-reservations', {
        receiptId: payload.receiptId,
        items: payload.items,
        warehouseId: payload.warehouseId,
        userId: payload.userId,
      });

      // Notify procurement team
      await this.notificationService.notifyTeam('procurement', {
        title: 'Goods Received',
        message: `Receipt ${payload.receiptNumber} for PO ${payload.poNumber} completed.`,
        priority: 'normal',
        data: { receiptId: payload.receiptId, purchaseOrderId: payload.purchaseOrderId },
      });

      // Notify quality team if any items need inspection
      const itemsNeedingInspection = payload.items.filter(i => i.inspectionRequired);
      if (itemsNeedingInspection.length > 0) {
        await this.notificationService.notifyTeam('quality', {
          title: 'Inspection Required',
          message: `${itemsNeedingInspection.length} item(s) from receipt ${payload.receiptNumber} require quality inspection.`,
          priority: 'high',
          data: { receiptId: payload.receiptId },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to handle goods received: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * When inspection passes, release inventory for use
   */
  @OnEvent(WorkflowEventType.INSPECTION_PASSED)
  async handleInspectionPassed(payload: InspectionEventPayload): Promise<void> {
    this.logger.log(`Handling inspection passed: ${payload.inspectionNumber}`);

    try {
      // Queue job to release inspected inventory for use
      await this.workflowQueue.add('release-inspected-inventory', {
        inspectionId: payload.inspectionId,
        inspectionNumber: payload.inspectionNumber,
        referenceType: payload.referenceType,
        referenceId: payload.referenceId,
        itemId: payload.itemId,
        itemName: payload.itemName,
        quantity: payload.quantity,
        userId: payload.userId,
      });

      // Notify warehouse team
      await this.notificationService.notifyTeam('warehouse', {
        title: 'Inspection Passed',
        message: `${payload.itemName} (Qty: ${payload.quantity}) passed inspection. Released to inventory.`,
        priority: 'normal',
        data: { inspectionId: payload.inspectionId },
      });
    } catch (error) {
      this.logger.error(`Failed to handle inspection passed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * When inspection fails, quarantine inventory and notify relevant teams
   */
  @OnEvent(WorkflowEventType.INSPECTION_FAILED)
  async handleInspectionFailed(payload: InspectionEventPayload): Promise<void> {
    this.logger.log(`Handling inspection failed: ${payload.inspectionNumber}`);

    try {
      // Queue job to move inventory to quarantine
      await this.workflowQueue.add('quarantine-failed-inspection', {
        inspectionId: payload.inspectionId,
        inspectionNumber: payload.inspectionNumber,
        referenceType: payload.referenceType,
        referenceId: payload.referenceId,
        itemId: payload.itemId,
        itemName: payload.itemName,
        quantity: payload.quantity,
        defects: payload.defects,
        userId: payload.userId,
      });

      // Queue job to create NCR (Non-Conformance Report)
      await this.workflowQueue.add('create-ncr-from-inspection', {
        inspectionId: payload.inspectionId,
        inspectionNumber: payload.inspectionNumber,
        itemId: payload.itemId,
        itemName: payload.itemName,
        quantity: payload.quantity,
        defects: payload.defects,
        userId: payload.userId,
      });

      // If from goods receipt, notify procurement for vendor action
      if (payload.referenceType === 'goods_receipt') {
        await this.notificationService.notifyTeam('procurement', {
          title: 'Inspection Failed - Vendor Action Required',
          message: `${payload.itemName} failed inspection. NCR will be created for vendor.`,
          priority: 'high',
          data: { inspectionId: payload.inspectionId, referenceId: payload.referenceId },
        });
      }

      // Notify quality team
      await this.notificationService.notifyTeam('quality', {
        title: 'Inspection Failed',
        message: `${payload.itemName} (Qty: ${payload.quantity}) failed inspection. Material quarantined.`,
        priority: 'high',
        data: { inspectionId: payload.inspectionId },
      });

      // Notify warehouse team
      await this.notificationService.notifyTeam('warehouse', {
        title: 'Material Quarantined',
        message: `${payload.itemName} moved to quarantine after failed inspection.`,
        priority: 'normal',
        data: { inspectionId: payload.inspectionId },
      });
    } catch (error) {
      this.logger.error(`Failed to handle inspection failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
