import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  CostEstimate,
  CostEstimateItem,
  CostEstimateStatus,
} from '../entities/cost-estimate.entity';
import { CostEstimateService } from '../services/cost-estimate.service';

@Controller('estimation/cost-estimates')
export class CostEstimateController {
  constructor(private readonly costEstimateService: CostEstimateService) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body()
    data: {
      estimate: Partial<CostEstimate>;
      items?: Partial<CostEstimateItem>[];
    },
  ): Promise<CostEstimate> {
    return this.costEstimateService.create(
      companyId,
      data.estimate,
      data.items,
    );
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('status') status?: CostEstimateStatus,
    @Query('customerId') customerId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ): Promise<CostEstimate[]> {
    return this.costEstimateService.findAll(companyId, {
      status,
      customerId,
      fromDate,
      toDate,
    });
  }

  @Get('compare/diff')
  compareDiff(
    @Headers('x-company-id') companyId: string,
    @Query('baseId') baseId: string,
    @Query('targetId') targetId: string,
  ) {
    return this.costEstimateService.compareDiff(companyId, baseId, targetId);
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<CostEstimate> {
    return this.costEstimateService.findOne(companyId, id);
  }

  @Get(':id/versions')
  findVersions(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ) {
    return this.costEstimateService.findVersions(companyId, id);
  }

  @Get(':id/items')
  findItems(@Param('id') id: string): Promise<CostEstimateItem[]> {
    return this.costEstimateService.findItems(id);
  }

  @Get(':id/cost-breakdown')
  getCostBreakdown(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ) {
    return this.costEstimateService.getCostBreakdown(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<CostEstimate>,
  ): Promise<CostEstimate> {
    return this.costEstimateService.update(companyId, id, data);
  }

  @Patch(':id/items')
  updateItems(
    @Param('id') id: string,
    @Body() items: Partial<CostEstimateItem>[],
  ): Promise<CostEstimateItem[]> {
    return this.costEstimateService.updateItems(id, items);
  }

  @Post(':id/submit')
  submitForApproval(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body('submittedBy') submittedBy: string,
  ): Promise<CostEstimate> {
    return this.costEstimateService.submitForApproval(
      companyId,
      id,
      submittedBy,
    );
  }

  @Post(':id/approve')
  approve(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: { approvedBy: string; notes?: string },
  ): Promise<CostEstimate> {
    return this.costEstimateService.approve(
      companyId,
      id,
      data.approvedBy,
      data.notes,
    );
  }

  @Post(':id/reject')
  reject(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: { rejectedBy: string; notes?: string },
  ): Promise<CostEstimate> {
    return this.costEstimateService.reject(
      companyId,
      id,
      data.rejectedBy,
      data.notes,
    );
  }

  @Post(':id/create-version')
  createVersion(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body('createdBy') createdBy: string,
  ): Promise<CostEstimate> {
    return this.costEstimateService.createVersion(companyId, id, createdBy);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.costEstimateService.delete(companyId, id);
  }
}
