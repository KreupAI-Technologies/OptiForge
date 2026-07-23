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
import { SafetyIncidentService } from '../services/safety-incident.service';
import { SafetyIncident } from '../entities/safety-incident.entity';

@ApiTags('HR - Safety Incidents')
@Controller('hr/safety-incidents')
export class SafetyIncidentController {
  constructor(private readonly service: SafetyIncidentService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
  ): Promise<SafetyIncident[]> {
    return this.service.findAll(companyId || 'company-1', status);
  }

  // Static route MUST be declared before the greedy ':id' param route.
  @Get('analytics/trends')
  getTrends(
    @Query('companyId') companyId: string,
    @Query('monthsBack') monthsBack?: string,
    @Query('hoursPerMonth') hoursPerMonth?: string,
  ) {
    const months = monthsBack ? parseInt(monthsBack, 10) : 6;
    const hours = hoursPerMonth ? parseInt(hoursPerMonth, 10) : undefined;
    return this.service.getTrends(
      companyId || 'company-1',
      Number.isFinite(months) && months > 0 ? months : 6,
      hours && Number.isFinite(hours) ? hours : undefined,
    );
  }

  // Static route MUST be declared before the greedy ':id' param route.
  @Get('analytics/breakdowns')
  getBreakdowns(@Query('companyId') companyId: string) {
    return this.service.getBreakdowns(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SafetyIncident> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SafetyIncident> & { companyId: string },
  ): Promise<SafetyIncident> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SafetyIncident>,
  ): Promise<SafetyIncident> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
