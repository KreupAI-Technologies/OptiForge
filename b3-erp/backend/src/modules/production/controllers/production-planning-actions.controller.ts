import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ProductionPlanningActionsService,
  CreateBulkRequisitionsInput,
  GenerateWorkOrdersInput,
} from '../services/production-planning-actions.service';
import { PurchaseRequisition } from '../../procurement/entities/purchase-requisition.entity';
import { WorkOrder } from '../entities/work-order.entity';
import { ProductionPlan } from '../entities/production-plan.entity';

@ApiTags('Production - Planning Actions')
@Controller('production')
export class ProductionPlanningActionsController {
  constructor(
    private readonly service: ProductionPlanningActionsService,
  ) {}

  @Post('mrp/bulk-requisitions')
  @ApiOperation({
    summary: 'Bulk-create purchase requisitions from selected MRP results',
  })
  @ApiResponse({ status: HttpStatus.CREATED })
  async createBulkRequisitions(
    @Body() body: CreateBulkRequisitionsInput,
  ): Promise<PurchaseRequisition[]> {
    return this.service.createBulkRequisitions(body);
  }

  @Post('planning/generate-work-orders')
  @ApiOperation({
    summary: 'Generate production / work orders from a production plan',
  })
  @ApiResponse({ status: HttpStatus.CREATED })
  async generateWorkOrders(
    @Body() body: GenerateWorkOrdersInput,
  ): Promise<{ plan?: ProductionPlan; workOrders: WorkOrder[] }> {
    return this.service.generateWorkOrdersFromPlan(body);
  }
}
