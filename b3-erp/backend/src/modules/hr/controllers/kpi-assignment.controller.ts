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
import { KpiAssignmentService } from '../services/kpi-assignment.service';
import { KpiAssignment } from '../entities/kpi-assignment.entity';

@ApiTags('HR - KPI Assignments')
@Controller('hr/kpi-assignments')
export class KpiAssignmentController {
  constructor(private readonly service: KpiAssignmentService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('employeeId') employeeId?: string,
    @Query('kpiMasterId') kpiMasterId?: string,
    @Query('status') status?: string,
  ): Promise<KpiAssignment[]> {
    return this.service.findAll(companyId || 'company-1', {
      employeeId,
      kpiMasterId,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<KpiAssignment> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<KpiAssignment> & { companyId?: string },
  ): Promise<KpiAssignment> {
    return this.service.create({ ...body, companyId: body.companyId || 'company-1' });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<KpiAssignment>,
  ): Promise<KpiAssignment> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
