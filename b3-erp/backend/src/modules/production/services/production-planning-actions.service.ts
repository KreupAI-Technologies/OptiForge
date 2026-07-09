import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  PurchaseRequisition,
  PRStatus,
  PRPriority,
  PRType,
} from '../../procurement/entities/purchase-requisition.entity';
import {
  WorkOrder,
  WorkOrderStatus,
  WorkOrderType,
  WorkOrderPriority,
} from '../entities/work-order.entity';
import { ProductionPlan } from '../entities/production-plan.entity';

export interface BulkRequisitionItemInput {
  itemId?: string;
  itemCode: string;
  itemName: string;
  description?: string;
  uom?: string;
  quantity: number;
  estimatedUnitPrice?: number;
  requiredDate?: string;
  preferredVendor?: string;
  specification?: string;
}

export interface CreateBulkRequisitionsInput {
  items: BulkRequisitionItemInput[];
  sourceReference?: string;
  requesterId?: string;
  requesterName?: string;
  department?: string;
  priority?: PRPriority;
  consolidateByVendor?: boolean;
  requiredByDate?: string;
  createdBy?: string;
}

export interface GenerateWorkOrdersInput {
  planId?: string;
  createdBy?: string;
  // Explicit lines (when the plan does not itself hold line detail).
  lines?: {
    itemId?: string;
    itemCode: string;
    itemName: string;
    uom?: string;
    quantity: number;
    bomId?: string;
    routingId?: string;
    workCenterId?: string;
    workCenterCode?: string;
    plannedStartDate?: string;
    plannedEndDate?: string;
    requiredByDate?: string;
    priority?: WorkOrderPriority;
    salesOrderId?: string;
    salesOrderNumber?: string;
    customerId?: string;
    customerName?: string;
  }[];
}

@Injectable()
export class ProductionPlanningActionsService {
  constructor(
    @InjectRepository(PurchaseRequisition)
    private readonly prRepository: Repository<PurchaseRequisition>,
    @InjectRepository(WorkOrder)
    private readonly workOrderRepository: Repository<WorkOrder>,
    @InjectRepository(ProductionPlan)
    private readonly productionPlanRepository: Repository<ProductionPlan>,
    private readonly dataSource: DataSource,
  ) {}

  private randomSuffix(): string {
    return Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  /**
   * Bulk purchase-requisition creation from MRP results / selected suggestions.
   * Persists real purchase_requisitions rows in a single transaction. When
   * consolidateByVendor is set, one PR is created per preferred vendor,
   * otherwise a single PR carries every selected line.
   */
  async createBulkRequisitions(
    input: CreateBulkRequisitionsInput,
  ): Promise<PurchaseRequisition[]> {
    if (!input.items || input.items.length === 0) {
      throw new BadRequestException(
        'At least one item is required to create purchase requisitions',
      );
    }

    const requiredBy = input.requiredByDate
      ? new Date(input.requiredByDate)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Group items either by vendor or into a single bucket.
    const buckets = new Map<string, BulkRequisitionItemInput[]>();
    for (const item of input.items) {
      const key = input.consolidateByVendor
        ? item.preferredVendor || 'unassigned'
        : '__single__';
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(item);
    }

    return this.dataSource.transaction(async (manager) => {
      const created: PurchaseRequisition[] = [];
      let seq = 0;

      for (const [vendorKey, items] of buckets) {
        seq += 1;
        const prNumber = `PR-MRP-${Date.now()}-${seq}-${this.randomSuffix()}`;

        const lines = items.map((item, index) => {
          const unitPrice = item.estimatedUnitPrice ?? 0;
          return {
            lineNumber: index + 1,
            itemId: item.itemId ?? '',
            itemCode: item.itemCode,
            itemName: item.itemName,
            description: item.description ?? item.itemName,
            uom: item.uom ?? 'PCS',
            quantity: item.quantity,
            estimatedUnitPrice: unitPrice,
            estimatedTotal: Number((item.quantity * unitPrice).toFixed(2)),
            requiredDate: item.requiredDate
              ? new Date(item.requiredDate)
              : requiredBy,
            specification: item.specification ?? '',
            accountCode: '',
            notes: '',
          };
        });

        const totalAmount = Number(
          lines.reduce((sum, l) => sum + l.estimatedTotal, 0).toFixed(2),
        );

        const pr = manager.create(PurchaseRequisition, {
          prNumber,
          prDate: new Date(),
          requiredByDate: requiredBy,
          status: PRStatus.SUBMITTED,
          priority: input.priority ?? PRPriority.MEDIUM,
          prType: PRType.STANDARD,
          requesterId: input.requesterId ?? 'mrp-system',
          requesterName: input.requesterName ?? 'MRP System',
          department: input.department ?? 'Production',
          items: lines,
          totalAmount,
          purpose: `Auto-generated from MRP${
            input.sourceReference ? ` (${input.sourceReference})` : ''
          }${
            input.consolidateByVendor && vendorKey !== 'unassigned'
              ? ` — vendor ${vendorKey}`
              : ''
          }`,
          isBudgetAvailable: false,
          createdBy: input.createdBy ?? 'mrp-system',
        });

        const saved = await manager.save(PurchaseRequisition, pr);
        created.push(saved);
      }

      return created;
    });
  }

  /**
   * Generate production (work) orders from a plan. Reuses the WorkOrder entity
   * and persists rows in a single transaction. Lines may be provided directly;
   * otherwise a single work order is derived from the plan header. On success
   * the plan's workOrderIds / workOrdersGenerated counters are updated.
   */
  async generateWorkOrdersFromPlan(
    input: GenerateWorkOrdersInput,
  ): Promise<{ plan?: ProductionPlan; workOrders: WorkOrder[] }> {
    let plan: ProductionPlan | null = null;
    if (input.planId) {
      plan = await this.productionPlanRepository.findOne({
        where: { id: input.planId },
      });
      if (!plan) {
        throw new NotFoundException(
          `Production Plan with ID ${input.planId} not found`,
        );
      }
    }

    let lines = input.lines ?? [];
    if (lines.length === 0) {
      if (!plan) {
        throw new BadRequestException(
          'Either a planId or explicit lines are required to generate work orders',
        );
      }
      const qty = Number(plan.plannedProductionQuantity || plan.netRequirement || 0);
      if (qty <= 0) {
        throw new BadRequestException(
          'Plan has no planned production quantity to generate work orders from',
        );
      }
      lines = [
        {
          itemId: plan.itemId,
          itemCode: plan.itemCode ?? 'N/A',
          itemName: plan.itemName ?? plan.planName,
          uom: plan.uom,
          quantity: qty,
          workCenterId: plan.workCenterId,
          workCenterCode: plan.workCenterCode,
          salesOrderId: plan.salesOrderId,
          salesOrderNumber: plan.salesOrderNumber,
          customerId: plan.customerId,
          customerName: plan.customerName,
          plannedStartDate: plan.periodStartDate
            ? new Date(plan.periodStartDate).toISOString()
            : undefined,
          plannedEndDate: plan.periodEndDate
            ? new Date(plan.periodEndDate).toISOString()
            : undefined,
        },
      ];
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const workOrders: WorkOrder[] = [];
      let seq = 0;
      for (const line of lines) {
        seq += 1;
        const workOrderNumber = `WO-${Date.now()}-${seq}-${this.randomSuffix()}`;
        const wo = manager.create(WorkOrder, {
          workOrderNumber,
          workOrderName: `WO for ${line.itemName}`,
          workOrderType: WorkOrderType.PRODUCTION,
          status: WorkOrderStatus.DRAFT,
          priority: line.priority ?? WorkOrderPriority.NORMAL,
          itemId: line.itemId ?? '',
          itemCode: line.itemCode,
          itemName: line.itemName,
          uom: line.uom ?? 'PCS',
          plannedQuantity: line.quantity,
          pendingQuantity: line.quantity,
          bomId: line.bomId,
          routingId: line.routingId,
          workCenterId: line.workCenterId,
          workCenterCode: line.workCenterCode,
          plannedStartDate: line.plannedStartDate
            ? new Date(line.plannedStartDate)
            : undefined,
          plannedEndDate: line.plannedEndDate
            ? new Date(line.plannedEndDate)
            : undefined,
          requiredByDate: line.requiredByDate
            ? new Date(line.requiredByDate)
            : undefined,
          salesOrderId: line.salesOrderId,
          salesOrderNumber: line.salesOrderNumber,
          customerId: line.customerId,
          customerName: line.customerName,
          createdBy: input.createdBy ?? 'planning-system',
        });
        const saved = await manager.save(WorkOrder, wo);
        workOrders.push(saved);
      }

      if (plan) {
        const ids = workOrders.map((w) => w.id);
        plan.workOrderIds = [...(plan.workOrderIds ?? []), ...ids];
        plan.workOrdersGenerated =
          (plan.workOrdersGenerated ?? 0) + workOrders.length;
        await manager.save(ProductionPlan, plan);
      }

      return { plan: plan ?? undefined, workOrders };
    });

    return result;
  }
}
