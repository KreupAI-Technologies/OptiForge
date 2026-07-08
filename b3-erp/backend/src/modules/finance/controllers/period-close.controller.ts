import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PeriodCloseService } from '../services/period-close.service';

@ApiTags('Finance - Period Close')
@Controller('finance/period-close')
export class PeriodCloseController {
  constructor(private readonly service: PeriodCloseService) {}

  @Get(':periodId/checklist')
  @ApiOperation({
    summary: 'Get the period-close checklist for a financial period',
  })
  @ApiParam({ name: 'periodId', description: 'Financial period ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Checklist read model' })
  async getChecklist(@Param('periodId') periodId: string): Promise<any> {
    return this.service.getChecklist(periodId);
  }

  @Patch(':periodId/checklist/:stepKey')
  @ApiOperation({ summary: 'Update a single period-close checklist step' })
  @ApiParam({ name: 'periodId', description: 'Financial period ID' })
  @ApiParam({ name: 'stepKey', description: 'Checklist step key' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Updated step' })
  async updateStep(
    @Param('periodId') periodId: string,
    @Param('stepKey') stepKey: string,
    @Body() body: { status?: string; completedBy?: string; notes?: string },
  ): Promise<any> {
    return this.service.updateStep(periodId, stepKey, body ?? {});
  }
}
