import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CycleCountService } from '../services/cycle-count.service';

@ApiTags('Inventory - Cycle Counts')
@Controller('inventory/cycle-counts')
export class CycleCountController {
  constructor(private readonly cycleCountService: CycleCountService) {}

  @Get()
  @ApiOperation({ summary: 'List cycle count plans with derived metrics' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'warehouseId', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.cycleCountService.findAll({ status, search, warehouseId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a cycle count plan (with items) by ID' })
  async findOne(@Param('id') id: string) {
    return this.cycleCountService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create/schedule a cycle count plan (generates items by warehouse/ABC scope)' })
  async create(
    @Body()
    body: {
      title: string;
      scheduledDate: string;
      warehouseId: string;
      warehouseName?: string;
      locationId?: string;
      abcClass?: string;
      itemGroups?: string[];
      assignedTo?: string;
      remarks?: string;
    },
  ) {
    const plan = await this.cycleCountService.generatePlan(body);
    return this.cycleCountService.findOne(plan.id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start the counting session for a plan' })
  async start(@Param('id') id: string) {
    await this.cycleCountService.startCounting(id);
    return this.cycleCountService.findOne(id);
  }

  @Put(':id/items')
  @ApiOperation({ summary: 'Save recorded physical counts for a plan' })
  async saveCounts(
    @Param('id') id: string,
    @Body() body: { results: { itemId: string; actualQty: number }[] },
  ) {
    await this.cycleCountService.saveCounts(id, body.results || []);
    return this.cycleCountService.findOne(id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete and reconcile a plan (creates a stock adjustment for variances)' })
  async complete(
    @Param('id') id: string,
    @Body() body: { results?: { itemId: string; actualQty: number }[] },
  ) {
    await this.cycleCountService.completeAndReconcile(id, body?.results || []);
    return this.cycleCountService.findOne(id);
  }
}
