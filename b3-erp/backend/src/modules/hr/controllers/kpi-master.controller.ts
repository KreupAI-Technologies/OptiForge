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
import { KpiMasterService } from '../services/kpi-master.service';
import { KpiMaster } from '../entities/kpi-master.entity';
import { CreateKpiMasterDto } from '../dto/create-kpi-master.dto';
import { UpdateKpiMasterDto } from '../dto/update-kpi-master.dto';

@ApiTags('HR - KPI Masters')
@Controller('hr/kpi-masters')
export class KpiMasterController {
  constructor(private readonly service: KpiMasterService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('category') category?: string,
    @Query('kpiType') kpiType?: string,
  ): Promise<KpiMaster[]> {
    return this.service.findAll(companyId || 'company-1', { category, kpiType });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<KpiMaster> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: CreateKpiMasterDto): Promise<KpiMaster> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateKpiMasterDto,
  ): Promise<KpiMaster> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
