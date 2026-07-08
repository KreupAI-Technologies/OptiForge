import { Controller, Get, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BOMService } from '../services/bom.service';

@ApiTags('Production - Quality Specs')
@Controller('production/quality-specs')
export class QualitySpecsController {
  constructor(private readonly bomService: BOMService) {}

  @Get()
  @ApiOperation({
    summary: 'Get quality specifications for a product or work order',
  })
  @ApiQuery({ name: 'productCode', required: false })
  @ApiQuery({ name: 'workOrderId', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'Quality specs / test parameters' })
  async getSpecs(
    @Query('productCode') productCode?: string,
    @Query('workOrderId') workOrderId?: string,
  ): Promise<any> {
    return this.bomService.getQualitySpecs({ productCode, workOrderId });
  }
}
