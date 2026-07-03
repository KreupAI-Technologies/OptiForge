import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PerDiemRateService } from '../services/per-diem-rate.service';
import { PerDiemRate } from '../entities/per-diem-rate.entity';

@ApiTags('HR - PerDiemRate')
@Controller('hr/per-diem-rates')
export class PerDiemRateController {
  constructor(private readonly service: PerDiemRateService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
  ): Promise<PerDiemRate[]> {
    return this.service.findAll(companyId || 'company-1', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PerDiemRate> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PerDiemRate> & { companyId: string }): Promise<PerDiemRate> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PerDiemRate>): Promise<PerDiemRate> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
