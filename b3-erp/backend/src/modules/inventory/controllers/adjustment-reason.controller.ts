import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdjustmentReasonService } from '../services/adjustment-reason.service';

@ApiTags('Inventory - Adjustment Reasons')
@Controller('inventory/adjustment-reasons')
export class AdjustmentReasonController {
  constructor(
    private readonly adjustmentReasonService: AdjustmentReasonService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all adjustment reason codes' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'reasonType', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('reasonType') reasonType?: string,
    @Query('search') search?: string,
  ) {
    return this.adjustmentReasonService.findAll({ status, reasonType, search });
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get adjustment reason statistics' })
  async getStatistics() {
    return this.adjustmentReasonService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get adjustment reason by ID' })
  async findOne(@Param('id') id: string) {
    return this.adjustmentReasonService.findOne(id);
  }
}
