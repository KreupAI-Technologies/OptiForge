import { Controller, Get, Param, Query } from '@nestjs/common';
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
}
