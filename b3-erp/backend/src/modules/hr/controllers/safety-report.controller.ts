import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SafetyReportService } from '../services/safety-report.service';
import { SafetyReport } from '../entities/safety-report.entity';

@ApiTags('HR - Safety Reports')
@Controller('hr/safety-reports')
export class SafetyReportController {
  constructor(private readonly service: SafetyReportService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('recordType') recordType?: string,
  ): Promise<SafetyReport[]> {
    return this.service.findAll(companyId || 'company-1', recordType);
  }

  // Static route MUST be declared before the greedy ':id' param route.
  @Get('analytics/breakdowns')
  getBreakdowns(
    @Query('companyId') companyId: string,
    @Query('kind') kind: string,
  ) {
    return this.service.getBreakdowns(companyId || 'company-1', kind || 'kpi');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SafetyReport> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SafetyReport> & { companyId: string },
  ): Promise<SafetyReport> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SafetyReport>,
  ): Promise<SafetyReport> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
